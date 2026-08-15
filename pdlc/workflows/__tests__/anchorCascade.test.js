/**
 * T5 — the same-pass anchor cascade and the confirmation-window freeze
 * (PLAN pdlc-halt-hardening §3.1–§3.3, regression tests RT-2 and RT-2c).
 *
 * Both tests reconstruct a historical halt rather than a hypothetical one:
 *
 *   RT-2  (POSTMORTEM-P §3, POSTMORTEM-D §4.1) — PLAN was approved and
 *         anchored against TSPEC vN; an erratum round then edited TSPEC and
 *         passed, and PLAN's approval kept skipping Phase P on bytes that
 *         described a version of TSPEC that no longer existed.
 *   RT-2c (POSTMORTEM-P, "three beliefs inside four minutes") — REQ v1.9
 *         landed INSIDE the TSPEC confirmation window, so the confirmers'
 *         answers and the anchor stamped from them described premises nobody
 *         had evaluated.
 *
 * Oracle discipline (§3.5): every expectation is a literal transcription, the
 * doc-type checks are set equalities rather than containments, and each
 * negative assertion is paired with the positive one on the same path.
 */

import main, {
  approvalHashOf,
  parseApprovalHash,
  upstreamStateLines,
  upstreamStateDrift,
} from "../orchestrate-dev.js";
import { fakeFs, fakeGit, fakeListFiles } from "./helpers/seams.js";

const FEATURE = "cfeat";
const DOCS = `docs/${FEATURE}`;
const REQ_PATH = `${DOCS}/REQ-${FEATURE}.md`;
const FSPEC_PATH = `${DOCS}/FSPEC-${FEATURE}.md`;
const TSPEC_PATH = `${DOCS}/TSPEC-${FEATURE}.md`;
const PLAN_PATH = `${DOCS}/PLAN-${FEATURE}.md`;
const PROPERTIES_PATH = `${DOCS}/PROPERTIES-${FEATURE}.md`;

const REQ_TEXT = "# REQ\n\nThe requirement body.\n";
const REQ_REWRITTEN = "# REQ\n\nThe requirement body, plus AC-9 from a sibling erratum round.\n";
const FSPEC_TEXT = "# FSPEC\n\nThe functional specification body.\n";
const TSPEC_TEXT = "# TSPEC\n\nThe technical specification body.\n";
const TSPEC_REWRITTEN = "# TSPEC\n\nThe technical specification body, §4 corrected.\n";
const PROPERTIES_TEXT = "# PROPERTIES\n\nThe property list.\n";
const COMMIT = "0123456789abcdef0123456789abcdef01234567";

/** A PLAN the mechanical parser reads (PROPOSAL §3.3) — Phase P refuses others. */
const PLAN_TEXT = [
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| TASK-01 | First task | 1 | - |",
  "",
  "| Task | Files |",
  "|---|---|",
  "| TASK-01 | `src/one.js` |",
].join("\n");

/** A structurally complete cross-review: a trailing `## Verdict` with one verdict line. */
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

/**
 * An APPROVED, tier-1-anchored cross-review file — the artifact §5.4 reads and
 * §5.5 compares against. `upstream` is T5's cascade anchor: passing `[]` yields
 * exactly the pre-T5 block, which is the grandfathered case.
 */
function approvedReview(docText, upstream) {
  return (
    crossReviewText() +
    `\nAPPROVAL-HASH: ${approvalHashOf(docText)}\n` +
    `REVIEWED-COMMIT: ${COMMIT}\n` +
    upstreamStateLines(upstream)
  );
}

const ROLE = { "se-review": "software-engineer", "pm-review": "product-manager", "te-review": "test-engineer" };
const reviewPath = (skill, docType, round) =>
  `${DOCS}/CROSS-REVIEW-${ROLE[skill]}-${docType}-v${round}.md`;

/**
 * The pipeline harness. One agent double covers every skill.
 *
 * Phases R, F, T and P are seeded with tier-1 approvals so they skip and the
 * run reaches Phase PR with a PLAN whose approval is on disk and anchored —
 * which is the precondition RT-2 is about. Phase PR then raises the erratum.
 *
 * The `_listFiles` double is DERIVED from the in-memory tree, so a cross-review
 * a reviewer writes during the run advances the round window exactly as it does
 * on disk: every round index asserted below is derived, never a fixture constant.
 */
async function runPipeline(opts = {}) {
  const {
    // The upstream state recorded on PLAN's seeded approval. `[]` is the
    // grandfathered anchor: an approval written before T5 shipped.
    planUpstream = [
      { docType: "REQ", hash: approvalHashOf(REQ_TEXT) },
      { docType: "FSPEC", hash: approvalHashOf(FSPEC_TEXT) },
      { docType: "TSPEC", hash: approvalHashOf(TSPEC_TEXT) },
    ],
    // What the PROPERTIES-phase reviewer raises against an upstream document.
    propertiesReviewerErratum = null,
    // What the erratum author leaves behind, per upstream doc path.
    erratumRewrites = {},
    // The verdict the cascade re-confirmers return, per doc type.
    cascadeVerdict = {},
    // `{ [round]: {verdict, high, body} }` for the erratum DELTA CONFIRMATION,
    // keyed off the derived round index in the confirmation's own review path.
    confirmationByRound = {},
    // A path whose bytes are replaced the first time a DELTA CONFIRMATION for
    // `duringConfirmationOf` is dispatched — a sibling erratum round landing
    // INSIDE the confirmation window (RT-2c).
    duringConfirmation = null,
  } = opts;

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
  };
  const fs = fakeFs(seeded);

  const dispatches = [];
  let confirmationWindowsOpened = 0;

  const agentFn = async (skill, prompt) => {
    const text = typeof prompt === "string" ? prompt : "";
    dispatches.push({ skill, prompt: text });

    // T5's cascade confirmation. Like a reviewer, it writes its file first.
    if (text.includes("UPSTREAM-CASCADE CONFIRMATION")) {
      const match = /(docs\/\S*CROSS-REVIEW-\S+\.md)/.exec(text);
      const docType = /CROSS-REVIEW-[a-z-]+-([A-Z]+)-v\d+\.md/.exec(match ? match[1] : "");
      const verdict = (docType && cascadeVerdict[docType[1]]) || "Approved";
      const high = verdict === "Approved" ? 0 : 1;
      if (match) fs.files[match[1]] = crossReviewText(verdict, high);
      return (
        `Cascade confirmation done.\nVERDICT: ${verdict}\n` +
        `{"high": ${high}, "medium": 0, "low": 0}\n`
      );
    }

    if (text.includes("DELTA CONFIRMATION")) {
      const match = /(docs\/\S*CROSS-REVIEW-\S+\.md)/.exec(text);
      // RT-2c: a sibling erratum round lands in the upstream chain WHILE the
      // confirmers are in flight. The rewrite happens on the first dispatch of
      // the window and never again, so the freeze has exactly one drift to see.
      if (duringConfirmation && match && match[1].includes(duringConfirmation.docType)) {
        confirmationWindowsOpened += 1;
        if (confirmationWindowsOpened === 1) {
          fs.files[duringConfirmation.path] = duringConfirmation.text;
        }
      }
      const roundMatch = match ? /-v(\d+)\.md$/.exec(match[1]) : null;
      const scripted = roundMatch ? confirmationByRound[Number(roundMatch[1])] : null;
      const verdict = scripted ? scripted.verdict : "Approved";
      const high = scripted ? (scripted.high ?? 0) : 0;
      const body = scripted && scripted.body ? scripted.body : "None blocking.";
      if (match) fs.files[match[1]] = crossReviewText(verdict, high, body);
      return (
        `Delta confirmed.\n${body}\nVERDICT: ${verdict}\n` +
        `{"high": ${high}, "medium": 0, "low": 0}\n`
      );
    }

    if (skill === "se-review" || skill === "te-review" || skill === "pm-review") {
      const approve = 'Reviewed.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
      if (propertiesReviewerErratum && text.includes("for phase PR of feature")) {
        return `${approve}ERRATUM: ${propertiesReviewerErratum}\n`;
      }
      return approve;
    }

    if (skill === "pm-author" || skill === "se-author" || skill === "te-author") {
      const erratumTarget = /ERRATUM ROUND for (docs\/\S+\.md)/.exec(text);
      if (erratumTarget && erratumRewrites[erratumTarget[1]]) {
        fs.files[erratumTarget[1]] = erratumRewrites[erratumTarget[1]];
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
    if (argv[0] === "rev-parse" && argv[1] === "--abbrev-ref") {
      return { ok: true, stdout: `feat-${FEATURE}` };
    }
    if (argv[0] === "rev-parse") return { ok: true, stdout: COMMIT };
    return { ok: true, stdout: "" };
  });

  const report = await main({
    reqPath: REQ_PATH,
    _agent: agentFn,
    _sessionAgent: async (sessionKey, skill, prompt, agentOpts) => agentFn(skill, prompt, agentOpts),
    _parallel: (promises) => Promise.all(promises),
    _readFile: fs.readFile,
    _hashFile: fs.hashFile,
    _hashNormalizedFile: fs.hashNormalizedFile,
    _appendFile: fs.appendFile,
    _writeFile: fs.writeFile,
    _checkFile: async () => ({ ok: true }),
    _listFiles: listFiles,
    _git: git,
    _phase: () => {},
    _pipeline: async (label, fn) => fn(),
    _mergeWorktree: async () => ({ ok: true }),
    _checkCi: async () => "passed",
  });

  return { report, fs, dispatches };
}

const cascadeDispatches = (dispatches, docType) =>
  dispatches.filter((d) =>
    d.prompt.includes(`UPSTREAM-CASCADE CONFIRMATION for ${DOCS}/${docType}-${FEATURE}.md`)
  );
const confirmationDispatches = (dispatches, docType) =>
  dispatches.filter((d) =>
    d.prompt.includes(`DELTA CONFIRMATION for ${DOCS}/${docType}-${FEATURE}.md`)
  );

// ─── The pure halves of the anchor (PLAN §3.1) ───────────────────────────────

describe("PLAN §3.1 — the `UPSTREAM-STATE:` anchor line", () => {
  const REQ_HASH = approvalHashOf(REQ_TEXT);
  const FSPEC_HASH = approvalHashOf(FSPEC_TEXT);

  test("serialises and parses back, one line per upstream doc, in pipeline order", () => {
    const rows = [
      { docType: "REQ", hash: REQ_HASH },
      { docType: "FSPEC", hash: FSPEC_HASH },
    ];
    expect(upstreamStateLines(rows)).toBe(
      `UPSTREAM-STATE: REQ ${REQ_HASH}\nUPSTREAM-STATE: FSPEC ${FSPEC_HASH}\n`
    );
    const parsed = parseApprovalHash(
      `VERDICT: Approved\n\nAPPROVAL-HASH: ${REQ_HASH}\nREVIEWED-COMMIT: ${COMMIT}\n` +
        upstreamStateLines(rows)
    );
    expect(parsed.ok).toBe(true);
    expect(parsed.upstreamState).toEqual(rows);
  });

  test("a legacy block parses to `[]` — the grandfathered case, not a failure", () => {
    const parsed = parseApprovalHash(
      `VERDICT: Approved\n\nAPPROVAL-HASH: ${REQ_HASH}\nREVIEWED-COMMIT: ${COMMIT}\n`
    );
    expect(parsed.ok).toBe(true);
    expect(parsed.upstreamState).toEqual([]);
    // Paired positive: `[]` drifts against nothing, whatever upstream now says.
    expect(upstreamStateDrift(parsed.upstreamState, new Map([["REQ", "sha256:" + "9".repeat(64)]])))
      .toEqual([]);
  });

  test("a malformed row is not an observation, and never a failure of the record", () => {
    const parsed = parseApprovalHash(
      `APPROVAL-HASH: ${REQ_HASH}\nREVIEWED-COMMIT: ${COMMIT}\n` +
        `UPSTREAM-STATE: REQ not-a-digest\n` +
        `UPSTREAM-STATE: NOTADOCTYPE ${REQ_HASH}\n` +
        `UPSTREAM-STATE: FSPEC ${FSPEC_HASH}\n`
    );
    expect(parsed.ok).toBe(true);
    expect(parsed.upstreamState).toEqual([{ docType: "FSPEC", hash: FSPEC_HASH }]);
  });

  test("`upstreamStateDrift` names moved doc types, and calls unreadable ones unmoved", () => {
    const recorded = [
      { docType: "REQ", hash: REQ_HASH },
      { docType: "FSPEC", hash: FSPEC_HASH },
    ];
    const current = new Map([
      ["REQ", approvalHashOf(REQ_REWRITTEN)],
      ["FSPEC", null],
    ]);
    expect(upstreamStateDrift(recorded, current)).toEqual(["REQ"]);
    // Paired positive: the same recorded rows against an unmoved chain.
    expect(
      upstreamStateDrift(recorded, new Map([["REQ", REQ_HASH], ["FSPEC", FSPEC_HASH]]))
    ).toEqual([]);
  });
});

// ─── The cross-invocation half of the rule (PLAN §3.1, §5.5) ────────────────

describe("PLAN §3.1 — §5.5 reads `UPSTREAM-STATE` at the phase gate", () => {
  const phasePRan = (dispatches) =>
    dispatches.some((d) => d.prompt.includes("for phase P of feature"));

  test("a byte-FRESH approval taken against a DIFFERENT upstream no longer skips its phase", async () => {
    // PLAN's own bytes are untouched, and under the byte rule alone this
    // approval is FRESH — which is exactly how POSTMORTEM-P's PLAN kept
    // skipping Phase P while describing a TSPEC that no longer existed.
    const { report, dispatches } = await runPipeline({
      planUpstream: [
        { docType: "REQ", hash: approvalHashOf(REQ_TEXT) },
        { docType: "FSPEC", hash: approvalHashOf(FSPEC_TEXT) },
        { docType: "TSPEC", hash: approvalHashOf(TSPEC_REWRITTEN) },
      ],
    });
    expect(phasePRan(dispatches)).toBe(true);
    const staled = report.notices.filter(
      (n) => n.includes(`${PLAN_PATH} is byte-unchanged`) && n.includes("TSPEC moved")
    );
    expect(staled).toHaveLength(1);
  });

  test("the same approval, taken against the upstream on disk, still skips the phase", async () => {
    // The paired positive: the rule narrows only when the chain actually moved.
    const { report, dispatches } = await runPipeline();
    expect(phasePRan(dispatches)).toBe(false);
    expect(report.notices.filter((n) => n.includes("is byte-unchanged"))).toEqual([]);
  });
});

// ─── RT-2 — the same-pass cascade (PLAN §3.2) ────────────────────────────────

describe("RT-2 (POSTMORTEM-P §3 / POSTMORTEM-D §4.1) — the same-pass anchor cascade", () => {
  const cascadeRun = (extra = {}) =>
    runPipeline({
      propertiesReviewerErratum: "TSPEC: §4's error budget contradicts REQ AC-3",
      erratumRewrites: { [TSPEC_PATH]: TSPEC_REWRITTEN },
      ...extra,
    });

  test("an approving re-confirmation re-anchors PLAN over its UNCHANGED bytes with the NEW upstream state", async () => {
    const { fs, dispatches } = await cascadeRun();

    // Exactly one re-confirmation ROUND for PLAN: one dispatch per approver,
    // and no second round for the same cascade trigger.
    const cascade = cascadeDispatches(dispatches, "PLAN");
    expect(cascade.map((d) => d.skill).sort()).toEqual(["pm-review", "te-review"]);
    const rounds = new Set(cascade.map((d) => /-v(\d+)\.md/.exec(d.prompt)[1]));
    expect([...rounds]).toEqual(["2"]);

    // The prompt states what actually moved, and points at the edited document.
    expect(cascade[0].prompt).toContain(`What changed is TSPEC, at ${TSPEC_PATH}`);

    // The re-anchor is over PLAN's OWN bytes, which never changed, and carries
    // the EDITED TSPEC — the whole point of the cascade.
    const planAppends = fs.appends.filter((a) => a.path.includes("-PLAN-v2.md"));
    expect(planAppends.map((a) => a.path).sort()).toEqual([
      reviewPath("pm-review", "PLAN", 2),
      reviewPath("te-review", "PLAN", 2),
    ]);
    expect(planAppends[0].text).toContain(`APPROVAL-HASH: ${approvalHashOf(PLAN_TEXT)}\n`);
    expect(planAppends[0].text).toContain(
      `UPSTREAM-STATE: TSPEC ${approvalHashOf(TSPEC_REWRITTEN)}\n`
    );
    expect(planAppends[0].text).not.toContain(
      `UPSTREAM-STATE: TSPEC ${approvalHashOf(TSPEC_TEXT)}\n`
    );
  });

  test("a NON-approving re-confirmation writes no anchors and re-opens PLAN's phase", async () => {
    const { report, fs, dispatches } = await cascadeRun({
      cascadeVerdict: { PLAN: "Needs revision" },
    });

    // Still exactly one round — a rejection does not buy a second confirmation.
    expect(cascadeDispatches(dispatches, "PLAN")).toHaveLength(2);

    // Nobody approved these bytes against this upstream, so nothing is anchored.
    expect(fs.appends.filter((a) => a.path.includes("-PLAN-v2.md"))).toEqual([]);

    const reopened = report.notices.filter(
      (n) => n.includes(`${PLAN_PATH} was NOT re-confirmed`) && n.includes("RE-OPENED")
    );
    expect(reopened).toHaveLength(1);
    expect(reopened[0]).toContain("phase P runs again under its ordinary review budgets");
  });

  test("a GRANDFATHERED approval (no `UPSTREAM-STATE` lines) is never staled by the same edit", async () => {
    const { fs, dispatches } = await cascadeRun({ planUpstream: [] });

    // The erratum round still happened — the paired positive that proves the
    // absence below is about grandfathering, not about a pipeline that stalled.
    expect(confirmationDispatches(dispatches, "TSPEC")).toHaveLength(2);
    expect(fs.files[TSPEC_PATH]).toBe(TSPEC_REWRITTEN);

    expect(cascadeDispatches(dispatches, "PLAN")).toEqual([]);
    expect(fs.appends.filter((a) => a.path.includes("-PLAN-v2.md"))).toEqual([]);
  });
});

// ─── RT-2c — the confirmation-window freeze (PLAN §3.3) ──────────────────────

describe("RT-2c (POSTMORTEM-P) — upstream moving INSIDE the confirmation window", () => {
  test("the confirmers are re-dispatched exactly once, both on the SAME re-derived upstream state, and only those answers are evaluated", async () => {
    const { report, fs, dispatches } = await runPipeline({
      propertiesReviewerErratum: "TSPEC: §4's error budget contradicts REQ AC-3",
      erratumRewrites: { [TSPEC_PATH]: TSPEC_REWRITTEN },
      // REQ moves while TSPEC's confirmers are in flight — REQ v1.9 landing
      // inside the TSPEC window, exactly as it did in the incident.
      duringConfirmation: { docType: "TSPEC", path: REQ_PATH, text: REQ_REWRITTEN },
      // The first (stale-premise) round approves; the re-dispatched round does
      // not. If the engine evaluated the first round, the erratum would be
      // recorded as confirmed and PLAN would be re-anchored below.
      confirmationByRound: {
        2: { verdict: "Approved", high: 0 },
        3: {
          verdict: "Needs revision",
          high: 1,
          body: "FINDING: High | inherited | nonlocal | §7 | a citation that predates this round",
        },
      },
    });

    const confirmations = confirmationDispatches(dispatches, "TSPEC");
    // Two rounds of two confirmers: the original window and ONE re-dispatch.
    expect(confirmations).toHaveLength(4);
    const rounds = confirmations.map((d) => /CROSS-REVIEW-[a-z-]+-TSPEC-v(\d+)\.md/.exec(d.prompt)[1]);
    expect(rounds.sort()).toEqual(["2", "2", "3", "3"]);

    // BOTH re-dispatched confirmers carry the SAME frozen REQ digest — the one
    // read AFTER the sibling round landed. Asserted on the digest itself, not
    // on the existence of a flag.
    const reDispatched = confirmations.filter((d) => d.prompt.includes("-TSPEC-v3.md"));
    expect(reDispatched).toHaveLength(2);
    for (const d of reDispatched) {
      expect(d.prompt).toContain(`- REQ: ${REQ_PATH} (${approvalHashOf(REQ_REWRITTEN)})`);
      expect(d.prompt).not.toContain(approvalHashOf(REQ_TEXT));
    }
    // Paired positive: the FIRST round carried the pre-drift digest.
    const firstRound = confirmations.filter((d) => d.prompt.includes("-TSPEC-v2.md"));
    for (const d of firstRound) {
      expect(d.prompt).toContain(`- REQ: ${REQ_PATH} (${approvalHashOf(REQ_TEXT)})`);
    }

    // The evaluated verdicts are the RE-DISPATCHED ones: round 3 did not
    // approve, so no approval anchor is written for TSPEC and no cascade runs.
    expect(fs.appends.filter((a) => a.path.includes("-TSPEC-v"))).toEqual([]);
    expect(cascadeDispatches(dispatches, "PLAN")).toEqual([]);

    const frozen = report.notices.filter((n) => n.includes("upstream MOVED INSIDE the"));
    expect(frozen).toHaveLength(1);
    expect(frozen[0]).toContain("re-dispatched ONCE");
    expect(frozen[0]).toContain("at round v3");
  });
});
