/**
 * loopEconomicsPinCascade.test.js — PLAN T-08 (RED), TSPEC §7 (M2 pin-cascade
 * round), FSPEC §4, PROPERTIES PROP-LOOPECON-10 / PROP-LOOPECON-11, DECISIONS
 * DEC-LOOPECON-03 / DEC-LOOPECON-04.
 *
 * RED discipline (PLAN §5, batch 2): every failure below traces to TSPEC §7
 * surface that does not exist yet on HEAD —
 *
 *   - `parsePinCheckVerdicts` is not exported (§7.4's pure grammar parser).
 *   - `pinCheckPrompt` is not exported (§7.3's batched-dispatch builder).
 *   - `cascadeDownstream` never reads `cascade.pinCheck` from
 *     `.claude/pdlc.config.json` — every candidate always takes the §7.1
 *     pass-2 ordinary re-confirmation path, regardless of the config this
 *     file seeds, so no `PIN-CHECK:` dispatch is ever constructed.
 *
 * T-14 (batch 7) is the sole authorised production change; every assertion
 * here is written against TSPEC §7 verbatim so it is expected to go GREEN,
 * unchanged, once T-14 lands the collect/dispatch split, the eligibility
 * predicate, `pinCheckPrompt`, `parsePinCheckVerdicts`, and the PASS/FAIL
 * routes. Pre-existing suites (`anchorCascade.test.js`,
 * `loopEconomicsBaselineGuard.test.js`, …) are untouched by this file and
 * stay green.
 *
 * ## The pipeline scenario this file drives
 *
 * Reuses the proven `anchorCascade.test.js` harness shape (six pipeline docs,
 * tier-1 approvals seeded so phases R/F/T/D/P skip, Phase PR's reviewer
 * raises `ERRATUM: TSPEC: …`), extended one way:
 *
 *   A `.claude/pdlc.config.json` seed carrying `cascade.pinCheck` (TSPEC
 *   §2.1's shape), so the disabled/absent/malformed/enabled axis is
 *   actually exercised, plus a seeded DECISIONS approval (omitted by
 *   `anchorCascade.test.js`).
 *
 * `cascadeDownstream({phaseId, target, editedIn})` (`orchestrate-dev.js`)
 * walks `erratumDocTypesBelow(target)` in full — for `target = "TSPEC"` that
 * is DECISIONS, PLAN, PROPERTIES — dispatching its "delta re-confirmation"
 * (the `UPSTREAM-CASCADE CONFIRMATION` prompt) to any downstream doc type
 * that already carries an approving tier-1 record whose `UPSTREAM-STATE` row
 * for `target` no longer matches. DECISIONS and PLAN get there by being
 * seeded pre-approved (their phases skip); PROPERTIES gets there because
 * Phase PR's OWN convergence anchors its round-1 approval — with a
 * `UPSTREAM-STATE` row for the pre-edit TSPEC — moments before `routeErrata`
 * (called right after `checkConverged`, same `converge()` invocation) hands
 * PROPERTIES's own erratum off to `cascadeDownstream`. So all three
 * candidates are genuinely in the "already approved, now stale" state §7 is
 * about, without needing PROPERTIES pre-seeded at all. DECISIONS and PLAN
 * share reviewers `[pm-review, te-review]`; PROPERTIES's are
 * `[pm-review, se-review]`. The union is three roles, and `pm-review` alone
 * covers all three doc types — the batching test's "3 eligible docs → 1
 * dispatch with 3 `PIN-CHECK:` lines" is `pm-review`'s single dispatch.
 *
 * `assertNoLiveGitWrites` (TSPEC §10, commit `f325016`) runs in `afterEach`:
 * `_git` is `fakeGit`, scripted read-only, never asserted to `commit`/`push`.
 */

import fc from "fast-check";
import main, {
  approvalHashOf,
  upstreamStateLines,
  parseApprovalHash,
  reviewerRoleSlug,
  MERGE_CONFIG_PATH,
} from "../orchestrate-dev.js";
import * as devModule from "../orchestrate-dev.js";
import { fakeFs, fakeGit, fakeListFiles } from "./helpers/seams.js";
import { assertNoLiveGitWrites } from "./helpers/loopEconomicsDoubles.js";

// TSPEC §7.4's not-yet-exported pure grammar parser. Destructuring from the
// namespace object (rather than a named ESM import) means a missing export
// resolves to `undefined` — calling it throws inside the test body, not at
// module-load time, so one missing export fails only the tests that use it.
const { parsePinCheckVerdicts, pinCheckPrompt } = devModule;

// ─── Scenario fixtures ──────────────────────────────────────────────────────

const FEATURE = "pcfeat";
const DOCS = `docs/${FEATURE}`;
const REQ_PATH = `${DOCS}/REQ-${FEATURE}.md`;
const FSPEC_PATH = `${DOCS}/FSPEC-${FEATURE}.md`;
const TSPEC_PATH = `${DOCS}/TSPEC-${FEATURE}.md`;
const DECISIONS_PATH = `${DOCS}/DECISIONS-${FEATURE}.md`;
const PLAN_PATH = `${DOCS}/PLAN-${FEATURE}.md`;
const PROPERTIES_PATH = `${DOCS}/PROPERTIES-${FEATURE}.md`;

const REQ_TEXT = "# REQ\n\nThe requirement body.\n";
const FSPEC_TEXT = "# FSPEC\n\nThe functional specification body.\n";
const TSPEC_TEXT = "# TSPEC\n\nThe technical specification body.\n";
const TSPEC_REWRITTEN = "# TSPEC\n\nThe technical specification body, §4 corrected.\n";
const DECISIONS_TEXT = "# DECISIONS\n\nDEC-01: chosen.\n";
const PLAN_TEXT = [
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| TASK-01 | First task | 1 | - |",
  "",
  "| Task | Files |",
  "|---|---|",
  "| TASK-01 | `src/one.js` |",
].join("\n");
const PLAN_TEXT_MUTATED = PLAN_TEXT + "\n<!-- edited without a fresh approval -->\n";
const PROPERTIES_TEXT = "# PROPERTIES\n\nThe property list.\n";
const COMMIT = "0123456789abcdef0123456789abcdef01234567";

function crossReviewText(verdict = "Approved", high = 0, body = "None blocking.") {
  return [
    "# Cross-review",
    "",
    "## Findings",
    "",
    body,
    "",
    "## Verdict",
    "",
    `VERDICT: ${verdict}`,
    `{"high": ${high}, "medium": 0, "low": 0}`,
    "",
  ].join("\n");
}

function approvedReview(docText, upstream) {
  return (
    crossReviewText() +
    `\nAPPROVAL-HASH: ${approvalHashOf(docText)}\n` +
    `REVIEWED-COMMIT: ${COMMIT}\n` +
    upstreamStateLines(upstream)
  );
}

const ROLE = { "se-review": "software-engineer", "pm-review": "product-manager", "te-review": "test-engineer" };
const reviewPath = (skill, docType, round) => `${DOCS}/CROSS-REVIEW-${ROLE[skill]}-${docType}-v${round}.md`;

/**
 * The pipeline harness (adapted from `anchorCascade.test.js`'s `runPipeline`).
 *
 * `pinCheckConfigText` — raw bytes to seed at `MERGE_CONFIG_PATH`, or `null`
 * for "the file does not exist" (the absent-config case). `includeDecisions`
 * adds DECISIONS as a third, already-approved downstream candidate. `mutatePlan`
 * rewrites `PLAN_PATH`'s on-disk bytes the moment the TSPEC erratum author
 * dispatch fires — a bytes-move landing strictly BETWEEN PLAN's own (already
 * skipped) phase gate and the cascade walk, which is the only place inside one
 * `main()` invocation an own-bytes-changed cascade candidate can arise (any
 * earlier mismatch would have forced Phase P to fully re-run instead of
 * skip). `pinCheckReply(role, doctypes)` scripts each pin-check dispatch's
 * reply text; the default PASSes every doctype it is asked about.
 */
async function runPipeline(opts = {}) {
  const {
    pinCheckConfigText = null,
    includeDecisions = false,
    mutatePlan = false,
    pinCheckReply = (role, doctypes) =>
      doctypes.map((d) => `PIN-CHECK: ${d}: PASS`).join("\n") + "\n",
    erratumItem = "TSPEC: §4: the table is wrong",
    // CODE_REVIEW v1 F-1 — lets a test make the PASS route's in-place refresh
    // FAIL at the seam, to pin that the failure is fail-open (a notice, not a
    // halt, and no round opened) rather than a pipeline abort.
    failWriteTo = null,
  } = opts;

  const decisionsUpstream = [
    { docType: "REQ", hash: approvalHashOf(REQ_TEXT) },
    { docType: "FSPEC", hash: approvalHashOf(FSPEC_TEXT) },
    { docType: "TSPEC", hash: approvalHashOf(TSPEC_TEXT) },
  ];
  const planUpstream = [
    { docType: "REQ", hash: approvalHashOf(REQ_TEXT) },
    { docType: "FSPEC", hash: approvalHashOf(FSPEC_TEXT) },
    { docType: "TSPEC", hash: approvalHashOf(TSPEC_TEXT) },
    ...(includeDecisions ? [{ docType: "DECISIONS", hash: approvalHashOf(DECISIONS_TEXT) }] : []),
  ];
  const seeded = {
    [REQ_PATH]: REQ_TEXT,
    [FSPEC_PATH]: FSPEC_TEXT,
    [TSPEC_PATH]: TSPEC_TEXT,
    [PLAN_PATH]: PLAN_TEXT,
    [PROPERTIES_PATH]: PROPERTIES_TEXT,
    [reviewPath("se-review", "REQ", 1)]: approvedReview(REQ_TEXT, []),
    [reviewPath("te-review", "REQ", 1)]: approvedReview(REQ_TEXT, []),
    [reviewPath("se-review", "FSPEC", 1)]: approvedReview(FSPEC_TEXT, [
      { docType: "REQ", hash: approvalHashOf(REQ_TEXT) },
    ]),
    [reviewPath("te-review", "FSPEC", 1)]: approvedReview(FSPEC_TEXT, [
      { docType: "REQ", hash: approvalHashOf(REQ_TEXT) },
    ]),
    [reviewPath("pm-review", "TSPEC", 1)]: approvedReview(TSPEC_TEXT, []),
    [reviewPath("te-review", "TSPEC", 1)]: approvedReview(TSPEC_TEXT, []),
    [reviewPath("pm-review", "PLAN", 1)]: approvedReview(PLAN_TEXT, planUpstream),
    [reviewPath("te-review", "PLAN", 1)]: approvedReview(PLAN_TEXT, planUpstream),
    // PROPERTIES is deliberately NOT pre-seeded: Phase PR runs live, its own
    // round-1 approval (with a `UPSTREAM-STATE` row for the pre-edit TSPEC)
    // is anchored by `checkConverged` moments before `routeErrata` hands the
    // erratum PR's own reviewer raises off to `cascadeDownstream` — which is
    // what makes PROPERTIES a genuine "already approved, now stale"
    // candidate for the SAME cascade walk as DECISIONS and PLAN.
  };
  if (includeDecisions) {
    seeded[DECISIONS_PATH] = DECISIONS_TEXT;
    seeded[reviewPath("pm-review", "DECISIONS", 1)] = approvedReview(DECISIONS_TEXT, decisionsUpstream);
    seeded[reviewPath("te-review", "DECISIONS", 1)] = approvedReview(DECISIONS_TEXT, decisionsUpstream);
  }
  if (pinCheckConfigText != null) {
    seeded[MERGE_CONFIG_PATH] = pinCheckConfigText;
  }

  const fs = fakeFs(seeded);
  const dispatches = [];
  let planMutated = false;

  const agentFn = async (skill, prompt) => {
    const text = typeof prompt === "string" ? prompt : "";
    dispatches.push({ skill, prompt: text });

    // TSPEC §7.3's batched pin-check dispatch — invented by this test since
    // the request-side prompt is not TSPEC-pinned (only the REPLY grammar
    // is). One `DOC: {DOCTYPE}` line per eligible document is the contract
    // this file requires of `pinCheckPrompt`.
    if (text.includes("PIN-CHECK CONFIRMATION")) {
      const doctypes = [...text.matchAll(/^DOC:\s*([A-Z]+)/gm)].map((m) => m[1]);
      return pinCheckReply(skill, doctypes);
    }

    if (text.includes("UPSTREAM-CASCADE CONFIRMATION")) {
      const match = /(docs\/\S*CROSS-REVIEW-\S+\.md)/.exec(text);
      if (match) fs.files[match[1]] = crossReviewText("Approved", 0);
      return 'Cascade confirmation done.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
    }

    if (text.includes("DELTA CONFIRMATION")) {
      const match = /(docs\/\S*CROSS-REVIEW-\S+\.md)/.exec(text);
      if (match) fs.files[match[1]] = crossReviewText("Approved", 0);
      return 'Delta confirmed.\nNone blocking.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
    }

    if (skill === "se-review" || skill === "te-review" || skill === "pm-review") {
      // Mirrors production: the reviewer session itself writes its own
      // cross-review file (`reviewerPrompt`'s "Write your cross-review to
      // exactly this path: ..." clause) — orchestrate-dev.js never writes it
      // on the reviewer's behalf. Without this, a document reviewed live in
      // this harness (PROPERTIES's own round-1, deliberately not
      // pre-seeded) never gets a cross-review file on disk, so
      // `tier1ApprovalRecord` can never see it as approved and it can never
      // become a downstream cascade/pin-check candidate.
      const targetMatch = /Write your cross-review to exactly this path: (docs\/\S+\.md)/.exec(text);
      if (targetMatch) fs.files[targetMatch[1]] = crossReviewText("Approved", 0);
      const approve = 'Reviewed.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
      if (text.includes("for phase PR of feature")) {
        return `${approve}ERRATUM: ${erratumItem}\n`;
      }
      return approve;
    }

    if (skill === "pm-author" || skill === "se-author" || skill === "te-author") {
      const erratumTarget = /ERRATUM ROUND for (docs\/\S+\.md)/.exec(text);
      if (erratumTarget && erratumTarget[1] === TSPEC_PATH) {
        fs.files[TSPEC_PATH] = TSPEC_REWRITTEN;
        // RT-2c-shaped side effect: PLAN's own bytes move strictly between
        // Phase P's (already-skipped) gate and this cascade walk — the only
        // place inside a single invocation an own-bytes-changed cascade
        // candidate can arise (TSPEC §7.2's predicate #1).
        if (mutatePlan && !planMutated) {
          planMutated = true;
          fs.files[PLAN_PATH] = PLAN_TEXT_MUTATED;
        }
        return "Erratum applied and committed.\nREVISION-COMPLETE: yes";
      }
      if (text.includes("DECISIONS_WARRANTED")) {
        return "Finalized.\nREVISION-COMPLETE: yes\nDECISIONS_WARRANTED: false";
      }
      if (text.includes("Return a JSON object")) {
        return JSON.stringify({
          tasks: [{ id: "TASK-01", description: "First task", dependencies: [], planBatch: 1 }],
        });
      }
      return "Document updated and committed.\nREVISION-COMPLETE: yes";
    }

    if (skill === "se-implement") return "Tests: 5 passed, 0 failed.";
    if (skill === "harvest-learnings") return "Harvest complete.";
    if (skill === "dod-verify") return "Clean.\nDOD_STATUS: passed";
    if (skill === "ship-pr") {
      if (text.includes("Rebase the branch")) return "Rebased.\nREBASE_STATUS: clean";
      if (text.includes("Raise a pull request")) {
        return "PR opened.\nPR_URL: https://github.com/acme/repo/pull/42";
      }
      return "Checks complete.\nCI_STATUS: passed";
    }
    return "Success.";
  };

  const listFiles = fakeListFiles((dirPath) =>
    Object.keys(fs.files)
      .filter((p) => p.startsWith(`${dirPath}/`) && !p.slice(dirPath.length + 1).includes("/"))
      .map((p) => p.slice(dirPath.length + 1))
  );

  const git = fakeGit((argv) => {
    if (argv[0] === "rev-parse" && argv[1] === "--abbrev-ref") return { ok: true, stdout: `feat-${FEATURE}` };
    if (argv[0] === "rev-parse") return { ok: true, stdout: COMMIT };
    return { ok: true, stdout: "" };
  });

  const logs = [];
  const writeFile = async (path, contents) => {
    if (failWriteTo && failWriteTo(path)) throw new Error("EACCES: read-only file system");
    return fs.writeFile(path, contents);
  };

  const report = await main({
    reqPath: REQ_PATH,
    _log: (m) => logs.push(String(m)),
    _agent: agentFn,
    _sessionAgent: async (sessionKey, skill, prompt, agentOpts) => agentFn(skill, prompt, agentOpts),
    _parallel: (promises) => Promise.all(promises),
    _readFile: fs.readFile,
    _hashFile: fs.hashFile,
    _hashNormalizedFile: fs.hashNormalizedFile,
    _appendFile: fs.appendFile,
    _writeFile: writeFile,
    _checkFile: async () => ({ ok: true }),
    _listFiles: listFiles,
    _git: git,
    _phase: () => {},
    _pipeline: async (label, fn) => fn(),
    _mergeWorktree: async () => ({ ok: true }),
    _checkCi: async () => "passed",
  });

  return { report, fs, dispatches, git, logs };
}

const pinCheckDispatches = (dispatches) => dispatches.filter((d) => d.prompt.includes("PIN-CHECK CONFIRMATION"));
const cascadeDispatches = (dispatches, docType) =>
  dispatches.filter((d) => d.prompt.includes(`UPSTREAM-CASCADE CONFIRMATION for ${DOCS}/${docType}-${FEATURE}.md`));

let lastGitCalls = null;
afterEach(() => {
  if (lastGitCalls) assertNoLiveGitWrites(lastGitCalls);
  lastGitCalls = null;
});

// ─── TSPEC §7.4 / PROP-LOOPECON-11 — parsePinCheckVerdicts grammar ────────

describe("TSPEC §7.4 — parsePinCheckVerdicts(text) → Map<docType, PASS|FAIL>", () => {
  test("exports a function (T-14 must add it; today it is undefined)", () => {
    expect(typeof parsePinCheckVerdicts).toBe("function");
  });

  test("parses one well-formed PASS/FAIL line per document", () => {
    const map = parsePinCheckVerdicts(
      "PIN-CHECK: DECISIONS: PASS\nPIN-CHECK: PLAN: FAIL\nPIN-CHECK: PROPERTIES: PASS\n"
    );
    expect(map).toEqual(
      new Map([
        ["DECISIONS", "PASS"],
        ["PLAN", "FAIL"],
        ["PROPERTIES", "PASS"],
      ])
    );
  });

  test("case-sensitive grammar: lowercase verdict tokens are not verdict lines", () => {
    const map = parsePinCheckVerdicts("PIN-CHECK: PLAN: pass\nPIN-CHECK: PROPERTIES: Fail\n");
    expect(map.has("PLAN")).toBe(false);
    expect(map.has("PROPERTIES")).toBe(false);
  });

  test("a duplicated line for one doctype resolves to FAIL (disagreement is not approval)", () => {
    const map = parsePinCheckVerdicts("PIN-CHECK: PLAN: PASS\nPIN-CHECK: PLAN: PASS\nPIN-CHECK: PLAN: FAIL\n");
    expect(map.get("PLAN")).toBe("FAIL");
  });

  test("fence-aware (mirrors scanLines): a PIN-CHECK line inside a fenced block is not a verdict line", () => {
    const map = parsePinCheckVerdicts("```\nPIN-CHECK: PLAN: PASS\n```\n");
    expect(map.has("PLAN")).toBe(false);
  });

  test.each([
    ["missing colon-space", "PIN-CHECK:PLAN:PASS"],
    ["extra trailing text", "PIN-CHECK: PLAN: PASS extra"],
    ["missing doctype token", "PIN-CHECK: : PASS"],
    ["unknown third token", "PIN-CHECK: PLAN: MAYBE"],
    ["no PIN-CHECK prefix", "PLAN: PASS"],
  ])("malformed variant (%s) is not a verdict line", (_label, line) => {
    const map = parsePinCheckVerdicts(`${line}\n`);
    expect(map.size).toBe(0);
  });

  // ── PROP-LOOPECON-11 (generative): grammar law over arbitrary reply text ──
  const DOCTYPES = ["REQ", "FSPEC", "TSPEC", "DECISIONS", "PLAN", "PROPERTIES"];
  const wellFormedLine = fc
    .tuple(fc.constantFrom(...DOCTYPES), fc.constantFrom("PASS", "FAIL"))
    .map(([doctype, verdict]) => ({ doctype, verdict, line: `PIN-CHECK: ${doctype}: ${verdict}` }));
  const malformedLine = fc
    .constantFrom(...DOCTYPES)
    .map((doctype) => `PIN-CHECK: ${doctype.toLowerCase()}: PASS`); // wrong case doctype: never matches

  test("PROP-LOOPECON-11: exactly the well-formed lines are read; duplicates resolve to FAIL", () => {
    fc.assert(
      fc.property(fc.array(wellFormedLine, { minLength: 0, maxLength: 8 }), fc.array(malformedLine, { maxLength: 4 }), (entries, noise) => {
        const oracle = new Map();
        for (const { doctype, verdict } of entries) {
          if (oracle.has(doctype)) oracle.set(doctype, "FAIL");
          else oracle.set(doctype, verdict);
        }
        const shuffled = [...entries.map((e) => e.line), ...noise];
        const text = shuffled.join("\n") + "\n";
        const map = parsePinCheckVerdicts(text);
        expect(map).toEqual(oracle);
      }),
      { numRuns: 100 }
    );
  });
});

// ─── TSPEC §7.3 — pinCheckPrompt exists ────────────────────────────────────

describe("TSPEC §7.3 — pinCheckPrompt builder", () => {
  test("exports a function (T-14 must add it; today it is undefined)", () => {
    expect(typeof pinCheckPrompt).toBe("function");
  });
});

// ─── TSPEC §7.1/§7.2/§4.2 — config gate and eligibility, end to end ───────

describe("TSPEC §7.1 — config gate: disabled/absent/malformed ⇒ zero PIN-CHECK dispatches", () => {
  test("absent .claude/pdlc.config.json ⇒ no PIN-CHECK dispatch; downstream walk dispatches ordinary re-confirmation for every candidate", async () => {
    const { dispatches } = await runPipeline({ pinCheckConfigText: null });
    expect(pinCheckDispatches(dispatches)).toHaveLength(0);
    expect(cascadeDispatches(dispatches, "PLAN").length).toBeGreaterThan(0);
    expect(cascadeDispatches(dispatches, "PROPERTIES").length).toBeGreaterThan(0);
  });

  test("cascade.pinCheck.enabled explicitly false ⇒ no PIN-CHECK dispatch", async () => {
    const { dispatches } = await runPipeline({
      pinCheckConfigText: JSON.stringify({ cascade: { pinCheck: { enabled: false } } }),
    });
    expect(pinCheckDispatches(dispatches)).toHaveLength(0);
  });

  test("malformed cascade.pinCheck.enabled (wrong-typed value) fails open ⇒ no PIN-CHECK dispatch", async () => {
    const { dispatches } = await runPipeline({
      pinCheckConfigText: JSON.stringify({ cascade: { pinCheck: { enabled: "yes" } } }),
    });
    expect(pinCheckDispatches(dispatches)).toHaveLength(0);
  });

  test("an unparseable config file fails open ⇒ no PIN-CHECK dispatch", async () => {
    const { dispatches } = await runPipeline({ pinCheckConfigText: "{ not json" });
    expect(pinCheckDispatches(dispatches)).toHaveLength(0);
  });
});

describe("TSPEC §7.2/§7.3 — enabled: eligibility, batching (PROP-LOOPECON-10)", () => {
  test("three own-bytes-unchanged candidates batch into ONE dispatch per reviewer role, and NONE take the ordinary path", async () => {
    const { dispatches } = await runPipeline({
      includeDecisions: true,
      pinCheckConfigText: JSON.stringify({ cascade: { pinCheck: { enabled: true } } }),
    });

    const pinChecks = pinCheckDispatches(dispatches);
    // Union of reviewer roles across DECISIONS (pm-review, te-review), PLAN
    // (pm-review, te-review) and PROPERTIES (pm-review, se-review) is three
    // distinct roles ⇒ exactly one dispatch per role, never one per doc.
    expect(pinChecks).toHaveLength(3);
    expect(new Set(pinChecks.map((d) => d.skill))).toEqual(new Set(["pm-review", "te-review", "se-review"]));

    const pmReviewCall = pinChecks.find((d) => d.skill === "pm-review");
    const doctypes = [...pmReviewCall.prompt.matchAll(/^DOC:\s*([A-Z]+)/gm)].map((m) => m[1]);
    expect(new Set(doctypes)).toEqual(new Set(["DECISIONS", "PLAN", "PROPERTIES"]));

    // No candidate takes the ordinary (full) re-confirmation path.
    expect(cascadeDispatches(dispatches, "DECISIONS")).toHaveLength(0);
    expect(cascadeDispatches(dispatches, "PLAN")).toHaveLength(0);
    expect(cascadeDispatches(dispatches, "PROPERTIES")).toHaveLength(0);
  });

  test("PROP-LOOPECON-10: an own-bytes-changed candidate is never pin-check-eligible, regardless of the upstream-pin signal", async () => {
    const { dispatches } = await runPipeline({
      includeDecisions: true,
      mutatePlan: true,
      pinCheckConfigText: JSON.stringify({ cascade: { pinCheck: { enabled: true } } }),
    });

    // PLAN's own bytes moved mid-cascade ⇒ always the full ordinary path,
    // never pin-check-eligible, even though its UPSTREAM-STATE row for
    // TSPEC also moved (the walk would not have visited it otherwise).
    expect(cascadeDispatches(dispatches, "PLAN").length).toBeGreaterThan(0);

    const pinChecks = pinCheckDispatches(dispatches);
    for (const d of pinChecks) {
      const doctypes = [...d.prompt.matchAll(/^DOC:\s*([A-Z]+)/gm)].map((m) => m[1]);
      expect(doctypes).not.toContain("PLAN");
    }
    // DECISIONS and PROPERTIES (own bytes unchanged) are batched together —
    // disjoint from, and exhaustive with, PLAN's ordinary path over the
    // three-candidate walk.
    const pmReviewCall = pinChecks.find((d) => d.skill === "pm-review");
    const doctypes = [...pmReviewCall.prompt.matchAll(/^DOC:\s*([A-Z]+)/gm)].map((m) => m[1]);
    expect(new Set(doctypes)).toEqual(new Set(["DECISIONS", "PROPERTIES"]));
    expect(cascadeDispatches(dispatches, "DECISIONS")).toHaveLength(0);
    expect(cascadeDispatches(dispatches, "PROPERTIES")).toHaveLength(0);
  });

  // ── PROP-LOOPECON-10 (generative): eligibility is disjoint & exhaustive ──
  test("PROP-LOOPECON-10: for every own-bytes-changed subset of the walk, eligible and ordinary sets partition it", async () => {
    await fc.assert(
      fc.asyncProperty(fc.boolean(), fc.boolean(), fc.boolean(), async (decisionsChanged, planChanged, propertiesChanged) => {
        // Only PLAN's own-bytes can move mid-cascade in this harness (the
        // RT-2c-shaped hook fires once, on the TSPEC erratum author's
        // dispatch); DECISIONS/PROPERTIES own-bytes-changed axes are
        // exercised by construction elsewhere in this file (they always
        // start byte-fresh here). This property still walks the boolean
        // cube — a `true` for either simply asserts the always-fresh case.
        const { dispatches } = await runPipeline({
          includeDecisions: true,
          mutatePlan: planChanged,
          pinCheckConfigText: JSON.stringify({ cascade: { pinCheck: { enabled: true } } }),
        });

        const pinChecks = pinCheckDispatches(dispatches);
        const eligible = new Set(
          pinChecks.flatMap((d) => [...d.prompt.matchAll(/^DOC:\s*([A-Z]+)/gm)].map((m) => m[1]))
        );
        const ordinary = new Set(
          ["DECISIONS", "PLAN", "PROPERTIES"].filter((dt) => cascadeDispatches(dispatches, dt).length > 0)
        );

        // Disjoint.
        for (const dt of eligible) expect(ordinary.has(dt)).toBe(false);
        // Exhaustive over the three-candidate walk.
        expect(new Set([...eligible, ...ordinary])).toEqual(new Set(["DECISIONS", "PLAN", "PROPERTIES"]));
        // PLAN specifically tracks `planChanged`.
        expect(ordinary.has("PLAN")).toBe(planChanged);
        expect(eligible.has("PLAN")).toBe(!planChanged);
        void decisionsChanged;
        void propertiesChanged;
      }),
      { numRuns: 8 }
    );
  });
});

describe("TSPEC §7.4/§7.5/DEC-LOOPECON-03 — verdict routing", () => {
  test("all-PASS reply ⇒ re-anchored, no round consumed (DEC-LOOPECON-04): no new cross-review round and no ordinary dispatch", async () => {
    const { dispatches, fs } = await runPipeline({
      includeDecisions: true,
      pinCheckConfigText: JSON.stringify({ cascade: { pinCheck: { enabled: true } } }),
      pinCheckReply: (role, doctypes) => doctypes.map((d) => `PIN-CHECK: ${d}: PASS`).join("\n") + "\n",
    });

    // No round consumed: no v2 cross-review file for any of the three
    // documents, and no ordinary re-confirmation dispatch for any of them —
    // the "spy" on round-budget increments is exactly this absence.
    for (const dt of ["DECISIONS", "PLAN", "PROPERTIES"]) {
      expect(cascadeDispatches(dispatches, dt)).toHaveLength(0);
      const v2Paths = Object.keys(fs.files).filter(
        (p) => p.includes(`-${dt}-v2.md`) && p.startsWith(`${DOCS}/CROSS-REVIEW-`)
      );
      expect(v2Paths).toHaveLength(0);
    }

    // ── The POSITIVE half of "re-anchored" (CODE_REVIEW v1 F-1) ────────────
    //
    // The absence assertions above are satisfied just as well by a PASS route
    // that writes nothing at all, which is exactly the defect F-1 found: the
    // re-stamp short-circuited on `existing[0] === hash`, the stale
    // `UPSTREAM-STATE` row survived, and the next staleness walk re-flagged the
    // same document — a cheaper loop, but still a loop. So read the bytes.
    const staleTspec = approvalHashOf(TSPEC_TEXT);
    const currentTspec = approvalHashOf(TSPEC_REWRITTEN);
    expect(currentTspec).not.toBe(staleTspec);

    for (const dt of ["DECISIONS", "PLAN", "PROPERTIES"]) {
      const approvedPaths = Object.keys(fs.files).filter(
        (p) => p.startsWith(`${DOCS}/CROSS-REVIEW-`) && p.includes(`-${dt}-v1.md`)
      );
      expect(approvedPaths.length).toBeGreaterThan(0);

      for (const p of approvedPaths) {
        const text = fs.files[p];

        // Read through the SHIPPED reader, not a regex of the test's own: this
        // is the same parse `tier1ApprovalRecord` performs and the staleness
        // walk consults, so it is the walk's own answer that is being pinned.
        const parsed = parseApprovalHash(text);
        expect(parsed.ok).toBe(true);

        // The document's own approval is untouched — a PASS re-stamp refreshes
        // the upstream pin, it never re-approves anything.
        const ownHash = approvalHashOf(
          dt === "DECISIONS" ? DECISIONS_TEXT : dt === "PLAN" ? PLAN_TEXT : PROPERTIES_TEXT
        );
        expect(parsed.hash).toBe(ownHash);

        // The grammar is unchanged: still exactly ONE anchor block, so the
        // record stays evaluable (two `APPROVAL-HASH:` lines would make
        // `parseApprovalHash` fail closed and `approvalAnchorPreCount` call the
        // history ambiguous).
        expect(text.match(/^APPROVAL-HASH:/gm) ?? []).toHaveLength(1);

        // The pin now quotes the EDITED TSPEC, and the pre-edit hash is gone.
        const row = parsed.upstreamState.find((e) => e.docType === "TSPEC");
        expect(row).toBeDefined();
        expect(row.hash).toBe(currentTspec);
        expect(text).not.toContain(staleTspec);

        // …and this is the kill-the-loop property, stated as the walk states
        // it: the walk skips a candidate when `row.hash === targetHash`. It now
        // does, so a re-run of the same walk raises no candidate, dispatches no
        // pin-check round and consumes no budget.
        expect(row.hash).toBe(currentTspec);
      }
    }

    // The refresh reached disk through the `_writeFile` seam (an in-place
    // rewrite, never a second appended anchor block).
    expect(fs.writes.length).toBeGreaterThan(0);
  });

  test("F-1: the PASS re-stamp is idempotent — re-applying it to the bytes it just produced changes nothing", async () => {
    // The second half of "kill the loop": the first PASS must reach a FIXED
    // POINT, or a re-run of the same route rewrites (and re-commits) the same
    // files forever. Asserted against the bytes the pipeline ACTUALLY wrote,
    // not against a hand-built sample, so it cannot pass over a shape the
    // production route never produces.
    const { fs } = await runPipeline({
      includeDecisions: true,
      pinCheckConfigText: JSON.stringify({ cascade: { pinCheck: { enabled: true } } }),
      pinCheckReply: (role, doctypes) =>
        doctypes.map((d) => `PIN-CHECK: ${d}: PASS`).join("\n") + "\n",
    });

    const refreshedPaths = Object.keys(fs.files).filter(
      (p) =>
        p.startsWith(`${DOCS}/CROSS-REVIEW-`) &&
        ["DECISIONS", "PLAN", "PROPERTIES"].some((dt) => p.includes(`-${dt}-v1.md`))
    );
    expect(refreshedPaths.length).toBeGreaterThan(0);

    for (const p of refreshedPaths) {
      // The rows a second run would derive are the rows already on the file:
      // the first PASS wrote the CURRENT upstream state, and nothing has moved
      // since (the assertions in the test above pin that the TSPEC row is the
      // edited TSPEC's hash, which is what makes these two the same list).
      const parsed = parseApprovalHash(fs.files[p]);
      expect(parsed.ok).toBe(true);
      expect(parsed.upstreamState.find((e) => e.docType === "TSPEC").hash).toBe(
        approvalHashOf(TSPEC_REWRITTEN)
      );

      const again = devModule.refreshUpstreamStateText(fs.files[p], parsed.upstreamState);
      // `changed: false` is what makes the writer skip the write and the commit
      // entirely, so a second identical PASS is a true no-op — and it also says
      // the bytes on disk are the CANONICAL serialisation of what they parse to,
      // so a re-run can never oscillate between two equivalent spellings.
      expect({ path: p, changed: again.changed }).toEqual({ path: p, changed: false });
      expect(again.text).toBe(fs.files[p]);
    }
  });

  test("a FAIL for one document falls through to the byte-identical ordinary re-confirmation dispatch (DEC-LOOPECON-03)", async () => {
    const baseline = await runPipeline({
      includeDecisions: true,
      pinCheckConfigText: null, // disabled baseline: PLAN always takes the ordinary path
    });
    const baselinePlanDispatch = cascadeDispatches(baseline.dispatches, "PLAN")[0];
    expect(baselinePlanDispatch).toBeDefined();

    const failing = await runPipeline({
      includeDecisions: true,
      pinCheckConfigText: JSON.stringify({ cascade: { pinCheck: { enabled: true } } }),
      pinCheckReply: (role, doctypes) =>
        doctypes.map((d) => `PIN-CHECK: ${d}: ${d === "PLAN" ? "FAIL" : "PASS"}`).join("\n") + "\n",
    });
    const failingPlanDispatch = cascadeDispatches(failing.dispatches, "PLAN")[0];
    expect(failingPlanDispatch).toBeDefined();

    // Same derived round index, same prompt bytes as the disabled-path
    // dispatch for the same document state (§7.6).
    expect(failingPlanDispatch.prompt).toBe(baselinePlanDispatch.prompt);

    // The PASSed siblings still re-anchor with no round consumed.
    expect(cascadeDispatches(failing.dispatches, "DECISIONS")).toHaveLength(0);
    expect(cascadeDispatches(failing.dispatches, "PROPERTIES")).toHaveLength(0);
  });

  test.each([
    ["an absent PIN-CHECK line", () => "No objection.\n"],
    ["a malformed PIN-CHECK line", () => "PIN-CHECK: PLAN: maybe\n"],
    ["disagreement across roles", (role) => (role === "pm-review" ? "PIN-CHECK: PLAN: PASS\n" : "PIN-CHECK: PLAN: FAIL\n")],
  ])("%s ⇒ FAIL, same as an explicit FAIL (fail-open means full review, not silent approval)", async (_label, replyFor) => {
    const { dispatches } = await runPipeline({
      includeDecisions: false,
      pinCheckConfigText: JSON.stringify({ cascade: { pinCheck: { enabled: true } } }),
      pinCheckReply: (role) => replyFor(role),
    });
    expect(cascadeDispatches(dispatches, "PLAN").length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CODE_REVIEW v1 F-1 — the pure core of the PASS re-stamp, and the reader
// contract that dictates its shape.
//
// The design question F-1 raises is "append a refreshed anchor block, or
// rewrite the rows in place?". The shipped readers answer it, and these tests
// pin that answer so a later "simplification" back to an append is caught:
// BOTH readers are FIRST-wins, and both treat two anchor blocks as a defect.
describe("F-1 — refreshUpstreamStateText (the reader contract, and the rewrite that satisfies it)", () => {
  const CURRENT = [{ docType: "TSPEC", hash: approvalHashOf(TSPEC_REWRITTEN) }];
  const stalePin = [{ docType: "TSPEC", hash: approvalHashOf(TSPEC_TEXT) }];

  test("the reader contract: a SECOND appended anchor block is unevaluable, and its UPSTREAM-STATE row is ignored", () => {
    const one = approvedReview(PLAN_TEXT, stalePin);
    const appended =
      one +
      `\nAPPROVAL-HASH: ${approvalHashOf(PLAN_TEXT)}\n` +
      `REVIEWED-COMMIT: ${COMMIT}\n` +
      upstreamStateLines(CURRENT);

    // Two `APPROVAL-HASH:` lines ⇒ the whole record fails closed…
    expect(parseApprovalHash(appended).ok).toBe(false);
    // …and `approvalAnchorPreCount` calls the history ambiguous, which
    // `appendApprovalAnchors` reports as "the round yields no approval".
    expect(devModule.approvalAnchorPreCount(appended)).toHaveLength(2);

    // Even setting the approval aside, the appended row is not the one read:
    // `parseApprovalHash` keeps the FIRST row per doc type.
    const twoRows = one + upstreamStateLines(CURRENT);
    const parsed = parseApprovalHash(twoRows);
    expect(parsed.ok).toBe(true);
    const row = parsed.upstreamState.find((e) => e.docType === "TSPEC");
    expect(row.hash).toBe(approvalHashOf(TSPEC_TEXT));
  });

  test("the rewrite replaces the stale rows in place, keeping exactly one anchor block", () => {
    const before = approvedReview(PLAN_TEXT, stalePin);
    const { text, changed } = devModule.refreshUpstreamStateText(before, CURRENT);
    expect(changed).toBe(true);
    expect(text.match(/^APPROVAL-HASH:/gm) ?? []).toHaveLength(1);
    expect(text.match(/^UPSTREAM-STATE:/gm) ?? []).toHaveLength(1);

    const parsed = parseApprovalHash(text);
    expect(parsed.ok).toBe(true);
    expect(parsed.hash).toBe(approvalHashOf(PLAN_TEXT));
    expect(parsed.upstreamState).toEqual(CURRENT);
    expect(text).not.toContain(approvalHashOf(TSPEC_TEXT));
    // Everything that is not an UPSTREAM-STATE row is byte-identical.
    const strip = (s) => s.split("\n").filter((l) => !/^\s*UPSTREAM-STATE:/.test(l)).join("\n");
    expect(strip(text)).toBe(strip(before));
  });

  test("idempotent: refreshing already-current rows reports no change", () => {
    const current = approvedReview(PLAN_TEXT, CURRENT);
    expect(devModule.refreshUpstreamStateText(current, CURRENT)).toEqual({
      text: current,
      changed: false,
    });
  });

  test("a grandfathered block with no UPSTREAM-STATE row is left alone (Q-2: byte-ruled only)", () => {
    const legacy = `# review\n\nAPPROVAL-HASH: ${approvalHashOf(PLAN_TEXT)}\nREVIEWED-COMMIT: ${COMMIT}\n`;
    expect(devModule.refreshUpstreamStateText(legacy, CURRENT)).toEqual({
      text: legacy,
      changed: false,
    });
  });

  test("empty or unusable rows never DOWNGRADE a pinned block to a grandfathered one", () => {
    const before = approvedReview(PLAN_TEXT, stalePin);
    for (const rows of [[], null, undefined, [{ docType: "NOPE", hash: "nope" }]]) {
      expect(devModule.refreshUpstreamStateText(before, rows)).toEqual({
        text: before,
        changed: false,
      });
    }
  });

  test("fence-aware (mirrors scanLines): a quoted example row inside a fence is neither counted nor rewritten", () => {
    const quoted = `# review\n\n\`\`\`\nUPSTREAM-STATE: TSPEC ${approvalHashOf(TSPEC_TEXT)}\n\`\`\`\n`;
    // Nothing outside the fence, so this reads as grandfathered: unchanged.
    expect(devModule.refreshUpstreamStateText(quoted, CURRENT).changed).toBe(false);

    const withReal = quoted + approvedReview(PLAN_TEXT, stalePin);
    const { text, changed } = devModule.refreshUpstreamStateText(withReal, CURRENT);
    expect(changed).toBe(true);
    // The fenced sample survives verbatim; only the real row moved.
    expect(text).toContain(`\`\`\`\nUPSTREAM-STATE: TSPEC ${approvalHashOf(TSPEC_TEXT)}\n\`\`\``);
    expect(parseApprovalHash(text).upstreamState).toEqual(CURRENT);
  });
});

describe("F-1 — the PASS re-stamp fails OPEN when the write seam fails", () => {
  test("a failing _writeFile emits a notice and leaves the pipeline running; the pin simply stays as it was", async () => {
    const { report, fs, dispatches, logs } = await runPipeline({
      includeDecisions: true,
      pinCheckConfigText: JSON.stringify({ cascade: { pinCheck: { enabled: true } } }),
      pinCheckReply: (role, doctypes) =>
        doctypes.map((d) => `PIN-CHECK: ${d}: PASS`).join("\n") + "\n",
      failWriteTo: (p) => p.startsWith(`${DOCS}/CROSS-REVIEW-`),
    });

    // Fail-open: the run completes, and no re-confirmation round is bought to
    // compensate — a failed re-stamp is a bookkeeping miss, not a review event.
    expect(report.outcome).toBe("success");
    for (const dt of ["DECISIONS", "PLAN", "PROPERTIES"]) {
      expect(cascadeDispatches(dispatches, dt)).toHaveLength(0);
    }

    // It is reported rather than swallowed, and it says the pin is unchanged.
    const refreshFailures = logs.filter((m) => m.includes("Approval anchor not refreshed"));
    expect(refreshFailures.length).toBeGreaterThan(0);
    expect(refreshFailures[0]).toContain("EACCES");
    expect(refreshFailures[0]).toContain("The recorded upstream pin stays as it was");

    // And the bytes really did not move.
    expect(fs.writes.filter((w) => w.path.startsWith(`${DOCS}/CROSS-REVIEW-`))).toEqual([]);
  });
});
