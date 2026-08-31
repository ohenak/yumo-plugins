/**
 * scenarios.mjs — the committed fixture matrix behind pdlc-decision-ledger's pre-feature
 * byte-identity baseline (TSPEC §7.4, PLAN T-02).
 *
 * TSPEC §7.4 requires REQ C-2 / REQ-DECLEDGER-02 / AT-04 to be proven against a **committed
 * fixture baseline captured at the merge base**, never a same-branch before/after comparison —
 * a regression that corrupts both arms identically would pass every same-branch comparison. This
 * module is the single scenario definition imported by BOTH sides of that proof:
 *
 *   - the capture (`scripts/capture-learnings-baseline.mjs`'s `runCaptureScript`, reused
 *     unchanged, driven by an uncommitted one-off invocation script), which hands it the
 *     **merge-base** `orchestrate-dev.js` materialised in a `git worktree`;
 *   - `__tests__/decisionLedgerBaselineGuard.test.js`, which hands it **branch HEAD**'s
 *     `orchestrate-dev.js`.
 *
 * It sits inside the fixture directory rather than under `__tests__/helpers/`, mirroring
 * `loop-economics-baseline/scenarios.mjs`'s precedent: the PLAN's file-ownership manifest gives
 * T-02 exactly two paths (this fixture directory and the guard test file), and `__tests__/helpers/`
 * is owned elsewhere. Jest never collects it — `package.json`'s `jest.testPathIgnorePatterns`
 * already excludes `/__tests__/fixtures/`.
 *
 * ## Deliberately narrow recorded stream (TSPEC §7.4)
 *
 * One case, `REVIEW-LOOP-REVIEWER-PROMPTS`, driving the exported `reviewLoop` directly — never a
 * whole-`main()` recording, which would red on this feature's own intended additions (the new
 * `NTC-DECLEDGER-*` notices, the new `report.decisionLedger` field) and would have to be
 * re-transcribed mid-feature, proving nothing. It records the reviewer-prompt stream for a
 * first-pass round (iteration 1) and a delta re-review round (iteration 2): reviewer[0] files a
 * High finding in round 1, forcing `reviewLoop`'s optimizer branch and a second, delta-scoped
 * round, where both reviewers approve. Four prompts are recorded, in dispatch order: round 1's
 * two reviewer prompts, then round 2's two reviewer prompts. The optimizer's own prompt is NOT
 * recorded — TSPEC §7.4 names the stream "the reviewer-prompt streams", not the full dispatch
 * log.
 *
 * ## Why this case cannot also carry AT-05 (TSPEC §7.4)
 *
 * `reviewLoop`'s parameter list takes seams and settings, never config text: the enablement gate
 * lives in `main()`, and `reviewLoop` receives only the already-built `_injectDecisionLedger`
 * seam. Driving `reviewLoop` directly therefore reaches every "not enabled" spelling as the SAME
 * input (the seam simply absent, `_injectDecisionLedger: undefined`), so a case built this way
 * could never distinguish AT-05's four config spellings — that is a second case, entering through
 * the config gate, which this feature's later production tasks own. This case's only job is
 * AT-04: the shipped disabled path, seam absent, byte-identical to the merge-base recording.
 *
 * ## Determinism obligations
 *
 * Recorded strings are byte-compared. Nothing here may read the clock, draw randomness, touch the
 * live filesystem, or shell out to git: every seam is a scripted synchronous double from
 * `helpers/seams.js`.
 *
 * ## Merge-base pin
 *
 * `72b3c0579ef5d42fbfb6cd881fbce596aa24d593` is `git merge-base origin/main HEAD` on
 * `feat-pdlc-decision-ledger` at capture time. Hard-coded, never re-derived as
 * `git merge-base origin/main HEAD` at test time — the merge base moves every time `main`
 * advances, so a computed default would silently re-baseline the fixtures out from under AT-04's
 * pin (PLAN §8's matching risk, carried over from loop-economics). At capture time,
 * `pdlc/workflows/orchestrate-dev.js` is byte-identical between that merge base and branch HEAD
 * (`git diff <merge-base> HEAD -- pdlc/workflows/orchestrate-dev.js` is empty; the branch carries
 * only `docs/` and test-fixture commits so far), so "merge-base bytes" and "branch bytes" name the
 * same thing today and the guard's oracle half is a tautology now, by design (TSPEC §7.4's
 * "capture validity window").
 */
export const BASELINE_MERGE_BASE_REF = "72b3c0579ef5d42fbfb6cd881fbce596aa24d593";

/** Where the capture writes, relative to the repository root. */
export const BASELINE_FIXTURE_DIR =
  "pdlc/workflows/__tests__/fixtures/decision-ledger-baseline";

/**
 * The config text this scenario serves off the `.claude/pdlc.config.json` read seam.
 *
 * `null` is "the file is absent" — the key-absent state driving `reviewLoop` directly can only
 * ever exercise, since the enablement gate is not in scope for this case (see header above).
 */
export const KEYS_ABSENT_CONFIG_TEXT = null;

const silent = () => {};

import { fakeFs, fakeGit, fakeListFiles } from "../../helpers/seams.js";

/**
 * Every `argv` this scenario's `_git` double was handed, in call order, across a run in this
 * process. Drained by the guard's `afterEach` so one test's calls can never be attributed to the
 * next (the same leak-check discipline `loop-economics-baseline/scenarios.mjs` documents).
 */
const recordedGitArgv = [];
export function takeRecordedGitArgv() {
  const taken = recordedGitArgv.slice();
  recordedGitArgv.splice(0, recordedGitArgv.length);
  return taken;
}

/** A fixed 40-hex commit sha. Never `git rev-parse` for real — the bytes are compared. */
const COMMIT = "c1a2b3d4e5f60718293a4b5c6d7e8f90a1b2c3d4";

function makeScenarioGit(feature) {
  return fakeGit((argv) => {
    const args = Array.isArray(argv) ? argv : [argv];
    recordedGitArgv.push(args.slice());
    if (args[0] === "rev-parse" && args[1] === "--abbrev-ref") {
      return { ok: true, stdout: `feat-${feature}\n` };
    }
    if (args[0] === "rev-parse") return { ok: true, stdout: `${COMMIT}\n` };
    return { ok: true, stdout: "" };
  });
}

/** A structurally complete cross-review document: findings, then a trailing `## Verdict`. */
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

// ─── REVIEW-LOOP-REVIEWER-PROMPTS ─────────────────────────────────────────────────────────────
//
// Two Phase T review rounds over TSPEC, driven through the exported `reviewLoop` directly:
//
//   Round 1 (iteration 1, first-pass): reviewer[0] files a High finding ("VERDICT: Needs
//   revision", `high: 1`), reviewer[1] approves. `loopPassResult`'s high-only gate fails on
//   reviewer[0] alone, so the round is non-terminal: `reviewLoop` dispatches the optimizer
//   (se-author) and advances to iteration 2.
//
//   Round 2 (iteration 2, delta re-review): both reviewers approve, so the round is terminal and
//   `reviewLoop` returns.
//
// The recorded stream is the FOUR reviewer-dispatch prompts, in dispatch order — round 1's pair,
// then round 2's pair — never the optimizer's own prompt (TSPEC §7.4 names "the reviewer-prompt
// streams" only).

const REVIEW_FEATURE = "decledger-review";
const REVIEW_DOC = `docs/${REVIEW_FEATURE}/TSPEC-${REVIEW_FEATURE}.md`;

/**
 * `REVIEW-LOOP-REVIEWER-PROMPTS` — records the four reviewer dispatch prompts across both
 * rounds, in dispatch order.
 *
 * @param {object} dev - an `orchestrate-dev.js` module namespace.
 * @returns {Promise<string[]>}
 */
async function runReviewLoopReviewerPrompts(dev) {
  const prompts = [];
  const fs = fakeFs({ [REVIEW_DOC]: "# TSPEC\n\n§1: body.\n" });
  const git = makeScenarioGit(REVIEW_FEATURE);

  const agentFn = async (skill, prompt) => {
    const text = String(prompt ?? "");

    if (skill === "pm-review" || skill === "te-review") {
      prompts.push(text);
      const target = /(docs\/\S*CROSS-REVIEW-\S+\.md)/.exec(text);
      // Round 1 (iteration 1): reviewer "pm-review" files the High finding that forces the
      // optimizer branch. Round 2 (iteration >= 2, the delta re-review): both approve.
      const isRound1 = /iteration 1\./.test(text);
      if (isRound1 && skill === "pm-review") {
        if (target) fs.files[target[1]] = crossReviewText("Needs revision", 1, "Blocking gap.");
        return 'Reviewed.\nVERDICT: Needs revision\n{"high": 1, "medium": 0, "low": 0}\n';
      }
      if (target) fs.files[target[1]] = crossReviewText();
      return 'Reviewed.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
    }

    if (skill === "se-author") {
      // The optimizer's revision, dispatched only after round 1's failing gate. Not part of
      // the recorded stream (see header), but must revise the document so the second round is
      // driven over genuinely changed bytes.
      fs.files[REVIEW_DOC] = "# TSPEC\n\n§1: body, revised per pm-review.\n";
      return "Revised.\nREVISION-COMPLETE: yes";
    }

    return "Success.";
  };

  const record = await dev.reviewLoop({
    doc: REVIEW_DOC,
    phase: "T",
    docType: "TSPEC",
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
    feature: REVIEW_FEATURE,
    _agent: agentFn,
    _parallel: (promises) => Promise.all(promises),
    _checkFile: fs.checkFile,
    _listFiles: fakeListFiles([]),
    _readFile: (p) =>
      String(p).endsWith("pdlc.config.json") ? KEYS_ABSENT_CONFIG_TEXT : fs.readFile(p),
    _hashFile: fs.hashFile,
    _hashNormalizedFile: fs.hashNormalizedFile,
    _appendFile: fs.appendFile,
    _log: silent,
    _git: git,
  });

  // The control: this run actually converged through TWO rounds, not one — otherwise the
  // "delta re-review round" half of TSPEC §7.4's recorded stream would be a name with nothing
  // behind it.
  if (!record || record.iterations !== 2) {
    throw new Error(
      `pdlc-decision-ledger-baseline: expected reviewLoop to converge at iteration 2, got ` +
        `${record && record.iterations}`
    );
  }

  return prompts;
}

export const BASELINE_SCENARIOS = Object.freeze([
  { caseId: "REVIEW-LOOP-REVIEWER-PROMPTS", run: runReviewLoopReviewerPrompts },
]);
