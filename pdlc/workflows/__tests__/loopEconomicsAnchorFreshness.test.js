/**
 * loopEconomicsAnchorFreshness.test.js — T-07 (pdlc-loop-economics, PLAN row
 * T-07, RED). TSPEC §4 / FSPEC §1.3 / PROP-LOOPECON-03 / DEC-LOOPECON-02.
 *
 * The defect, precisely (TSPEC §4.1): the erratum round derives the upstream
 * chain's state ONCE, before the author dispatch (`deriveUpstreamState` at
 * `orchestrate-dev.js` inside `erratumRound`), and then
 * `orchestrate-dev.js:14983` — `let confirmUpstreamState = upstreamState;` —
 * hands that SAME author-dispatch-time array straight to the confirmers'
 * dispatch, unread since. `erratumSupersetClause` renders it into
 * agent-visible text under the header "at their CURRENT version as of this
 * dispatch" — a claim that is false the moment the upstream chain moves
 * between the two dispatches. This is the R-5 shape: 54 stale-hash Low
 * findings re-filed on `pdlc-engineering-loop` against zero document edits
 * ever owed, because a stale mint-time value was quoted as "current."
 *
 * The fix (T-11, TSPEC §4.2) re-derives `confirmUpstreamState` from disk
 * immediately before the FIRST `dispatchConfirmers` call
 * (`deriveUpstreamState(target, null)`), so the confirmers' first (and,
 * absent genuine in-window movement, only) dispatch already quotes what is
 * actually on disk. The pre-existing post-return drift check (line ~15003)
 * and its single bounded re-dispatch are UNCHANGED by that fix — today they
 * are the only thing that ever corrects the stale quote, one wasted review
 * round late; after the fix they simply find nothing to correct, because the
 * fresh value was already right for the very first dispatch. That "no
 * unnecessary re-dispatch" outcome is this feature's own economics point:
 * two round trips fixed to one.
 *
 * `cascadeDownstream` (TSPEC §4.2) is untouched by this defect — its own
 * per-downstream re-dispatch already calls `deriveUpstreamState(downstream,
 * null)` fresh, every time. This file pins that path unchanged (green today,
 * green after T-11).
 *
 * Falsification (TSPEC §4.3): a scripted probe/hash double returns hash A on
 * the upstream document's read at author-dispatch time and hash B on disk by
 * confirmer-dispatch-construction time. Reverting T-11's assignment reds
 * nothing else in this suite — this file is the only falsifier.
 */

import main, {
  approvalHashOf,
  upstreamStateLines,
  parseApprovalHash,
  MERGE_CONFIG_PATH,
} from "../orchestrate-dev.js";
import { fakeFs, fakeGit, fakeListFiles } from "./helpers/seams.js";
import { makeSequencedHashFn, assertNoLiveGitWrites } from "./helpers/loopEconomicsDoubles.js";

// ─── shared fixtures ─────────────────────────────────────────────────────────

const FEATURE = "loopecon";
const DOCS = `docs/${FEATURE}`;
const REQ_PATH = `${DOCS}/REQ-${FEATURE}.md`;
const FSPEC_PATH = `${DOCS}/FSPEC-${FEATURE}.md`;
const TSPEC_PATH = `${DOCS}/TSPEC-${FEATURE}.md`;
const PLAN_PATH = `${DOCS}/PLAN-${FEATURE}.md`;

const REQ_TEXT = "# REQ\n\nThe requirement body.\n";
const FSPEC_TEXT = "# FSPEC\n\nThe functional specification body.\n";
const TSPEC_TEXT = "# TSPEC\n\nThe technical specification body.\n";
const TSPEC_REWRITTEN = "# TSPEC\n\nThe technical specification body, §4 corrected.\n";
const ERRATUM_ITEM = "§4's error budget contradicts REQ AC-3";
const COMMIT = "0123456789abcdef0123456789abcdef01234567";

/** A PLAN the mechanical parser reads (PROPOSAL §3.3) — Phase P refuses others. */
const PARSEABLE_PLAN = [
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| TASK-01 | First task | 1 | - |",
  "",
  "| Task | Files |",
  "|---|---|",
  "| TASK-01 | `src/one.js` |",
].join("\n");

const APPROVE = 'Reviewed.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';

/** A structurally complete cross-review: a trailing `## Verdict` with one verdict line. */
function crossReviewText(verdict = "Approved", high = 0) {
  return [
    "# Cross-review",
    "",
    "## Findings",
    "",
    "None blocking.",
    "",
    "## Verdict",
    "",
    `VERDICT: ${verdict}`,
    `{"high": ${high}, "medium": 0, "low": 0}`,
    "",
  ].join("\n");
}

/** An APPROVED, tier-1-anchored cross-review file (T5's `UPSTREAM-STATE` block). */
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

function baseGit() {
  return fakeGit((argv) => {
    if (argv[0] === "rev-parse" && argv[1] === "--abbrev-ref") {
      return { ok: true, stdout: `feat-${FEATURE}` };
    }
    if (argv[0] === "rev-parse") return { ok: true, stdout: COMMIT };
    return { ok: true, stdout: "" };
  });
}

function baseListFiles(fs) {
  return fakeListFiles((dirPath) =>
    Object.keys(fs.files)
      .filter((p) => p.startsWith(`${dirPath}/`) && !p.slice(dirPath.length + 1).includes("/"))
      .map((p) => p.slice(dirPath.length + 1))
  );
}

// ─── T-07 RED — the confirmer-path defect (TSPEC §4.1 / :14983) ────────────

/**
 * Drives one FSPEC erratum round (raised by te-review during Phase T, exactly
 * PROP-ERR-20's shape) with `_hashFile` scripted so REQ — the one document
 * above FSPEC — reads hash A at mint time and at the author-dispatch-time
 * `deriveUpstreamState` call, then hash B at every call from that point on.
 * That is "A before the erratum author dispatch, B after" (TSPEC §4.3) —
 * the confirmers' dispatch is constructed strictly after the author dispatch,
 * so it must see B, never A, once the confirmer-dispatch-time re-derivation
 * (T-11) is in place.
 */
async function runFreshnessPipeline({ hashA, hashB }) {
  const seeded = {
    [REQ_PATH]: REQ_TEXT,
    [FSPEC_PATH]: FSPEC_TEXT,
    [PLAN_PATH]: PARSEABLE_PLAN,
    [reviewPath("se-review", "FSPEC", 1)]: approvedReview(FSPEC_TEXT, [
      { docType: "REQ", hash: hashA },
    ]),
    [reviewPath("te-review", "FSPEC", 1)]: approvedReview(FSPEC_TEXT, [
      { docType: "REQ", hash: hashA },
    ]),
  };
  const fs = fakeFs(seeded);

  const dispatches = [];
  const agentFn = async (skill, prompt) => {
    const text = typeof prompt === "string" ? prompt : "";
    dispatches.push({ skill, prompt: text });

    if (text.includes("DELTA CONFIRMATION")) {
      const match = /(docs\/\S*CROSS-REVIEW-\S+\.md)/.exec(text);
      if (match) fs.files[match[1]] = crossReviewText("Approved", 0);
      return `Delta confirmed.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`;
    }

    if (skill === "se-review" || skill === "te-review" || skill === "pm-review") {
      if (skill === "te-review" && text.includes("for phase T of feature")) {
        return `${APPROVE}ERRATUM: FSPEC: ${ERRATUM_ITEM}\n`;
      }
      return APPROVE;
    }

    if (skill === "pm-author" || skill === "se-author" || skill === "te-author") {
      const erratumTarget = /ERRATUM ROUND for (docs\/\S+\.md)/.exec(text);
      if (erratumTarget && erratumTarget[1] === FSPEC_PATH) {
        // The author leaves FSPEC's bytes UNCHANGED, so no land-proof
        // literal-token retry can trigger and no cascade below FSPEC can
        // fire either — this scenario is scoped to the confirmer path.
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
      if (text.includes("Rebase the feature branch")) return "Rebased.\nREBASE_STATUS: clean";
      if (text.includes("Raise a pull request")) {
        return "PR opened.\nPR_URL: https://github.com/acme/repo/pull/42";
      }
      return "Checks complete.\nCI_STATUS: passed";
    }
    return "Success.";
  };

  const git = baseGit();

  // The sequenced double this row is named for: REQ's hash is A through the
  // erratum round's own mint-time `snapshotErratumDocs` read and
  // author-dispatch-time `deriveUpstreamState` read (both taken before the
  // erratum author is dispatched, so both legitimately agree and raise no
  // "moved since minted" noise), then B forever after (every call from
  // confirmer-dispatch construction onward). `_hashFile` is one shared seam
  // for the whole pipeline, not just the erratum path under test: this
  // end-to-end run legitimately reads REQ's hash five times before the
  // erratum round's own two reads (Phase T's own review-prompt upstream-state
  // line, a phaseGate check, and a second review-prompt read once the
  // erratum item is raised) — traced empirically via call-site stack traces,
  // not guessed. Five leading A's cover that unrelated traffic so the
  // erratum round's own mint (#4) and author-dispatch (#5) reads still land
  // on A, and the confirmer-dispatch-construction read (#6, the post-return
  // drift check at :15003) lands on B. Every other path delegates to
  // `fakeFs`'s ordinary content-derived hash — only REQ's freshness is under
  // test here.
  const { hashFn: reqHashFn } = makeSequencedHashFn({
    [REQ_PATH]: [hashA, hashA, hashA, hashA, hashA, hashB],
  });
  const hashFileFn = (path) => (path === REQ_PATH ? reqHashFn(path) : fs.hashFile(path));

  const report = await main({
    reqPath: REQ_PATH,
    _agent: agentFn,
    _sessionAgent: async (sessionKey, skill, prompt, agentOpts) => agentFn(skill, prompt, agentOpts),
    _parallel: (promises) => Promise.all(promises),
    _readFile: fs.readFile,
    _hashFile: hashFileFn,
    _appendFile: fs.appendFile,
    _writeFile: fs.writeFile,
    _checkFile: async () => ({ ok: true }),
    _listFiles: baseListFiles(fs),
    _git: git,
    _phase: () => {},
    _pipeline: async (label, fn) => fn(),
    _mergeWorktree: async () => ({ ok: true }),
    _checkCi: async () => "passed",
  });

  return { report, fs, dispatches, gitCalls: git.calls };
}

describe("T-07 RED — orchestrate-dev.js:14983 carries the author-dispatch-time upstream state into the confirmer dispatch", () => {
  const hashA = "sha256:" + "a".repeat(64);
  const hashB = "sha256:" + "b".repeat(64);

  let gitCalls;
  afterEach(() => {
    if (gitCalls) assertNoLiveGitWrites(gitCalls, { allow: ["commit"] });
    gitCalls = undefined;
  });

  test("RED because :14983 (`let confirmUpstreamState = upstreamState;`) reuses the author-dispatch-time state instead of re-deriving at confirmer-dispatch construction: no FSPEC confirmer dispatch ever quotes hash A, and every one quotes hash B", async () => {
    const { dispatches, gitCalls: calls } = await runFreshnessPipeline({ hashA, hashB });
    gitCalls = calls;

    const confirmations = dispatches.filter((d) =>
      d.prompt.includes(`DELTA CONFIRMATION for ${FSPEC_PATH}`)
    );
    expect(confirmations.length).toBeGreaterThan(0);

    // The defining assertion (TSPEC §4.3): "confirmer prompt contains B,
    // never A." Today, :14983 dispatches the FIRST confirmer round on the
    // author-dispatch-time state — hash A — so this is RED until T-11 lands.
    for (const d of confirmations) {
      expect(d.prompt).not.toContain(hashA);
      expect(d.prompt).toContain(`- REQ: ${REQ_PATH} (${hashB})`);
    }
  });

  test("RED because the same stale carry-forward forces the pre-existing drift check to catch it one round late: with the fix, REQ never moves INSIDE the confirmation window (it was already fresh at construction), so exactly one confirmer round is dispatched and no re-dispatch notice fires", async () => {
    const { report, dispatches, gitCalls: calls } = await runFreshnessPipeline({ hashA, hashB });
    gitCalls = calls;

    const confirmations = dispatches.filter((d) =>
      d.prompt.includes(`DELTA CONFIRMATION for ${FSPEC_PATH}`)
    );
    // Two confirmers (se-review, te-review), ONE round each. Today, :14983's
    // stale quote is only ever corrected by the post-return drift check
    // below re-dispatching a SECOND round once it observes REQ having
    // "moved" between the stale quote and its own re-derivation — four
    // dispatches, not two. That drift check itself is pinned (TSPEC §4.2:
    // "post-return drift check ... still behave as today") — it is simply
    // never exercised once the confirmer-dispatch-time re-derivation makes
    // the first quote already fresh.
    expect(confirmations).toHaveLength(2);
    expect(report.notices.some((n) => n.includes("upstream MOVED INSIDE the confirmation window"))).toBe(
      false
    );
  });
});

// ─── T-07 PIN — the persisted approval anchor is unaffected by :14983 ──────

/**
 * `appendApprovalAnchors` (called once, after the post-return drift check
 * above has already run to completion) is always handed the FINAL
 * `confirmUpstreamState` and the FINAL round's `confirmPaths` — never the
 * stale author-dispatch-time snapshot :14983 hands to the FIRST confirmer
 * dispatch. Traced empirically (orchestrate-dev.js:15346-15361): the anchor
 * write happens downstream of the drift-check's correction, so the two
 * defect-path tests above (the wasted stale round and the extra round trip)
 * never propagate into what gets durably recorded. This is PASS today and
 * stays PASS once T-11 lands — :14983's fix removes the wasted round, not
 * this already-correct final write.
 */
describe("T-07 PIN — the FSPEC approval anchor is written from the final, drift-corrected state", () => {
  const hashA = "sha256:" + "a".repeat(64);
  const hashB = "sha256:" + "b".repeat(64);

  let gitCalls;
  afterEach(() => {
    if (gitCalls) assertNoLiveGitWrites(gitCalls, { allow: ["commit"] });
    gitCalls = undefined;
  });

  test("the approval anchor appended for the confirmed FSPEC edit records hash B — the confirmer-dispatch-time state, never hash A", async () => {
    const { fs, gitCalls: calls } = await runFreshnessPipeline({ hashA, hashB });
    gitCalls = calls;

    const fspecAppends = fs.appends.filter((a) => a.path.includes(`-FSPEC-v`));
    expect(fspecAppends.length).toBeGreaterThan(0);
    for (const append of fspecAppends) {
      expect(append.text).toContain(`UPSTREAM-STATE: REQ ${hashB}\n`);
      expect(append.text).not.toContain(`UPSTREAM-STATE: REQ ${hashA}\n`);
    }
  });
});

// ─── T-07 PIN — cascadeDownstream's own re-derivation is unaffected ────────

/**
 * `cascadeDownstream` (TSPEC §4.2) already re-derives its downstream target's
 * fresh state on every call — `const { upstreamState } = await
 * deriveUpstreamState(downstream, null);` — independently of the
 * author/confirmer dispatch pair :14983 sits between. This scenario
 * transplants the shape of the shipped same-pass-cascade regression test
 * (RT-2, `anchorCascade.test.js`): PLAN is already approved and anchored
 * against TSPEC; a PROPERTIES-phase erratum then edits TSPEC; PLAN's
 * cascade re-confirmation must quote the EDITED TSPEC's bytes, never the
 * stale ones its own approval was taken against. This is PASS today and
 * stays PASS once T-11 lands — :14983's fix touches only the erratum
 * confirmer path, never this cascade path.
 */
async function runCascadePinPipeline(opts = {}) {
  // CODE_REVIEW v1 F-7 — the same scenario, but with M2's pin-check ENABLED, so
  // the `parallelFn` round trip that M2 inserts between the walk's collect pass
  // and its dispatch pass is actually present. `pinCheckReply` scripts that
  // round's verdict: a FAIL falls through to the ordinary re-confirmation
  // (the freshness pin below), a PASS takes the re-stamp route.
  const { pinCheckConfigText = null, pinCheckReply = null } = opts;
  const seeded = {
    [REQ_PATH]: REQ_TEXT,
    [FSPEC_PATH]: FSPEC_TEXT,
    [TSPEC_PATH]: TSPEC_TEXT,
    [PLAN_PATH]: PARSEABLE_PLAN,
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
    [reviewPath("pm-review", "PLAN", 1)]: approvedReview(PARSEABLE_PLAN, [
      { docType: "TSPEC", hash: approvalHashOf(TSPEC_TEXT) },
    ]),
    [reviewPath("te-review", "PLAN", 1)]: approvedReview(PARSEABLE_PLAN, [
      { docType: "TSPEC", hash: approvalHashOf(TSPEC_TEXT) },
    ]),
  };
  if (pinCheckConfigText != null) seeded[MERGE_CONFIG_PATH] = pinCheckConfigText;
  const fs = fakeFs(seeded);
  const dispatches = [];

  const agentFn = async (skill, prompt) => {
    const text = typeof prompt === "string" ? prompt : "";
    dispatches.push({ skill, prompt: text });

    if (text.includes("PIN-CHECK CONFIRMATION")) {
      const doctypes = [...text.matchAll(/^DOC:\s*([A-Z]+)/gm)].map((m) => m[1]);
      return pinCheckReply ? pinCheckReply(skill, doctypes, { fs }) : "No objection.\n";
    }
    if (text.includes("UPSTREAM-CASCADE CONFIRMATION")) {
      const match = /(docs\/\S*CROSS-REVIEW-\S+\.md)/.exec(text);
      if (match) fs.files[match[1]] = crossReviewText("Approved", 0);
      return 'Cascade confirmation done.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
    }
    if (text.includes("DELTA CONFIRMATION")) {
      const match = /(docs\/\S*CROSS-REVIEW-\S+\.md)/.exec(text);
      if (match) fs.files[match[1]] = crossReviewText("Approved", 0);
      return `Delta confirmed.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`;
    }
    if (skill === "se-review" || skill === "te-review" || skill === "pm-review") {
      if (text.includes("for phase PR of feature")) {
        return `${APPROVE}ERRATUM: TSPEC: ${ERRATUM_ITEM}\n`;
      }
      return APPROVE;
    }
    if (skill === "pm-author" || skill === "se-author" || skill === "te-author") {
      const erratumTarget = /ERRATUM ROUND for (docs\/\S+\.md)/.exec(text);
      if (erratumTarget && erratumTarget[1] === TSPEC_PATH) {
        fs.files[TSPEC_PATH] = TSPEC_REWRITTEN;
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
      if (text.includes("Rebase the feature branch")) return "Rebased.\nREBASE_STATUS: clean";
      if (text.includes("Raise a pull request")) {
        return "PR opened.\nPR_URL: https://github.com/acme/repo/pull/42";
      }
      return "Checks complete.\nCI_STATUS: passed";
    }
    return "Success.";
  };

  const git = baseGit();
  const report = await main({
    reqPath: REQ_PATH,
    _agent: agentFn,
    _sessionAgent: async (sessionKey, skill, prompt, agentOpts) => agentFn(skill, prompt, agentOpts),
    _parallel: (promises) => Promise.all(promises),
    _readFile: fs.readFile,
    _hashFile: fs.hashFile,
    _appendFile: fs.appendFile,
    _writeFile: fs.writeFile,
    _checkFile: async () => ({ ok: true }),
    _listFiles: baseListFiles(fs),
    _git: git,
    _phase: () => {},
    _pipeline: async (label, fn) => fn(),
    _mergeWorktree: async () => ({ ok: true }),
    _checkCi: async () => "passed",
  });

  return { report, fs, dispatches, gitCalls: git.calls };
}

describe("T-07 PIN — cascadeDownstream already re-derives fresh state on every call (TSPEC §4.2: correct today, unchanged by T-11)", () => {
  let gitCalls;
  afterEach(() => {
    if (gitCalls) assertNoLiveGitWrites(gitCalls, { allow: ["commit"] });
    gitCalls = undefined;
  });

  test("PLAN's cascade re-confirmation quotes the EDITED TSPEC's bytes, never the stale bytes its own on-disk approval was taken against", async () => {
    const { fs, dispatches, gitCalls: calls } = await runCascadePinPipeline();
    gitCalls = calls;

    const cascade = dispatches.filter((d) =>
      d.prompt.includes(`UPSTREAM-CASCADE CONFIRMATION for ${PLAN_PATH}`)
    );
    expect(cascade.map((d) => d.skill).sort()).toEqual(["pm-review", "te-review"]);
    for (const d of cascade) {
      expect(d.prompt).toContain(`What changed is TSPEC, at ${TSPEC_PATH}`);
    }

    const planAppends = fs.appends.filter((a) => a.path.includes("-PLAN-v2.md"));
    expect(planAppends.length).toBeGreaterThan(0);
    for (const append of planAppends) {
      expect(append.text).toContain(`UPSTREAM-STATE: TSPEC ${approvalHashOf(TSPEC_REWRITTEN)}\n`);
      expect(append.text).not.toContain(`UPSTREAM-STATE: TSPEC ${approvalHashOf(TSPEC_TEXT)}\n`);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CODE_REVIEW v1 F-7 — the freshness pin, extended to the PIN-CHECK-ENABLED
// path.
//
// The block above proves the cascade quotes fresh upstream bytes when
// `cascade.pinCheck` is absent, i.e. when M2's collect pass and dispatch pass
// run back-to-back with nothing in between. With the flag ON they no longer do:
// a `parallelFn` round trip (the pin-check dispatch itself) sits between them,
// so a pass-1 snapshot is now separated from the dispatch it describes by a
// real await. That is a widened staleness window, and it is closed by
// re-deriving inside pass 2 — which is what these two tests hold to.
describe("F-7 — the pin-check-ENABLED cascade re-derives upstream state at dispatch construction", () => {
  const PIN_CHECK_ON = JSON.stringify({ cascade: { pinCheck: { enabled: true } } });
  let gitCalls;
  afterEach(() => {
    if (gitCalls) assertNoLiveGitWrites(gitCalls, { allow: ["commit"] });
    gitCalls = undefined;
  });

  test("a FAIL verdict falls through to the ordinary re-confirmation, which still quotes the EDITED TSPEC and anchors it", async () => {
    const {
      fs,
      dispatches,
      gitCalls: calls,
    } = await runCascadePinPipeline({
      pinCheckConfigText: PIN_CHECK_ON,
      pinCheckReply: (_skill, doctypes) =>
        doctypes.map((d) => `PIN-CHECK: ${d}: FAIL`).join("\n") + "\n",
    });
    gitCalls = calls;

    // The pin-check round really did run, so the ordinary dispatches below are
    // genuinely on the far side of the added await — not a disabled-path run
    // wearing an enabled-path label.
    expect(dispatches.filter((d) => d.prompt.includes("PIN-CHECK CONFIRMATION")).length).toBeGreaterThan(0);

    const cascade = dispatches.filter((d) =>
      d.prompt.includes(`UPSTREAM-CASCADE CONFIRMATION for ${PLAN_PATH}`)
    );
    expect(cascade.map((d) => d.skill).sort()).toEqual(["pm-review", "te-review"]);
    for (const d of cascade) {
      // The prompt renders upstream "at their current version as of this
      // dispatch" — so it must carry the edited bytes, never the pass-1 ones.
      expect(d.prompt).toContain(approvalHashOf(TSPEC_REWRITTEN));
      expect(d.prompt).not.toContain(approvalHashOf(TSPEC_TEXT));
    }

    const planAppends = fs.appends.filter((a) => a.path.includes("-PLAN-v2.md"));
    expect(planAppends.length).toBeGreaterThan(0);
    for (const append of planAppends) {
      expect(append.text).toContain(`UPSTREAM-STATE: TSPEC ${approvalHashOf(TSPEC_REWRITTEN)}\n`);
      expect(append.text).not.toContain(`UPSTREAM-STATE: TSPEC ${approvalHashOf(TSPEC_TEXT)}\n`);
    }
  });

  test("a PASS verdict re-stamps the approving round's files with the EDITED TSPEC's hash (F-1 + F-7 together)", async () => {
    const { fs, gitCalls: calls } = await runCascadePinPipeline({
      pinCheckConfigText: PIN_CHECK_ON,
      pinCheckReply: (_skill, doctypes) =>
        doctypes.map((d) => `PIN-CHECK: ${d}: PASS`).join("\n") + "\n",
    });
    gitCalls = calls;

    // No round was consumed: no v2 cross-review file for PLAN at all.
    expect(Object.keys(fs.files).filter((p) => p.includes("-PLAN-v2.md"))).toEqual([]);

    // …and the pin the PASS route wrote is the one derived AFTER the pin-check
    // round trip, not the pass-1 snapshot taken before it.
    const planApprovals = Object.keys(fs.files).filter((p) => p.includes("-PLAN-v1.md"));
    expect(planApprovals.length).toBeGreaterThan(0);
    for (const p of planApprovals) {
      const parsed = parseApprovalHash(fs.files[p]);
      expect(parsed.ok).toBe(true);
      expect(parsed.upstreamState.find((e) => e.docType === "TSPEC").hash).toBe(
        approvalHashOf(TSPEC_REWRITTEN)
      );
      expect(fs.files[p]).not.toContain(approvalHashOf(TSPEC_TEXT));
    }
  });

  // The falsifying case for F-7 specifically. The two tests above are pins: in
  // them upstream is already at its final bytes before pass 1 collects, so a
  // pass-1 snapshot and a pass-2 re-derivation agree and either implementation
  // is green. Here upstream MOVES while the pin-check round is in flight —
  // exactly the window M2 widened by putting an await between collection and
  // dispatch — so the two answers differ and only the re-derivation is right.
  test("upstream moving DURING the pin-check round trip: the ordinary dispatch quotes the newest bytes, not the pass-1 snapshot", async () => {
    let moved = null;
    const {
      fs,
      dispatches,
      gitCalls: calls,
    } = await runCascadePinPipeline({
      pinCheckConfigText: PIN_CHECK_ON,
      pinCheckReply: (_skill, doctypes, ctx) => {
        // A sibling chain lands an edit on TSPEC while the confirmers are out.
        moved = `${TSPEC_REWRITTEN}\n<!-- and again, mid-pin-check -->\n`;
        ctx.fs.files[TSPEC_PATH] = moved;
        return doctypes.map((d) => `PIN-CHECK: ${d}: FAIL`).join("\n") + "\n";
      },
    });
    gitCalls = calls;
    expect(moved).not.toBeNull();

    const cascade = dispatches.filter((d) =>
      d.prompt.includes(`UPSTREAM-CASCADE CONFIRMATION for ${PLAN_PATH}`)
    );
    expect(cascade.length).toBeGreaterThan(0);
    for (const d of cascade) {
      expect(d.prompt).toContain(approvalHashOf(moved));
      // The pass-1 snapshot's answer. Quoting it is the F-7 defect.
      expect(d.prompt).not.toContain(approvalHashOf(TSPEC_REWRITTEN));
    }

    const planAppends = fs.appends.filter((a) => a.path.includes("-PLAN-v2.md"));
    expect(planAppends.length).toBeGreaterThan(0);
    for (const append of planAppends) {
      expect(append.text).toContain(`UPSTREAM-STATE: TSPEC ${approvalHashOf(moved)}\n`);
    }
  });
});
