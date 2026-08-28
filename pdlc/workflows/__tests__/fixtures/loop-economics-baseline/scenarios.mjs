/**
 * scenarios.mjs — the committed L3 fixture matrix behind the pdlc-loop-economics
 * pre-M2/M3 byte-identity baseline (TSPEC §9, PLAN T-02).
 *
 * ## Why this module sits inside the fixture directory
 *
 * The `learnings-baseline` precedent keeps its matrix in
 * `__tests__/helpers/learningsBaselineScenarios.js`. PLAN §4's file-ownership manifest gives
 * T-02 **exactly two** paths — `__tests__/loopEconomicsBaselineGuard.test.js` and
 * `__tests__/fixtures/loop-economics-baseline/` — and `__tests__/helpers/` is owned by T-01
 * (`loopEconomicsDoubles.js`) in the same batch, so a matrix module under `helpers/` would
 * violate the single-writer-per-file rule the batch's disjointness premise rests on. The
 * matrix therefore lives in the fixture directory T-02 does own. Jest never discovers it:
 * `package.json` → `jest.testPathIgnorePatterns` already excludes `/__tests__/fixtures/`.
 *
 * ## What the module is for
 *
 * TSPEC §9 requires the disabled-state claims (REQ-LOOPECON-04, REQ-LOOPECON-07) to be proven
 * against a **committed fixture baseline captured from the merge base**, never by comparing two
 * arms of the same branch. This module is the single definition of the scenarios that produce
 * that baseline, imported by BOTH sides of the proof:
 *
 *   - the capture (`scripts/capture-learnings-baseline.mjs`'s `runCaptureScript`, driven by an
 *     uncommitted one-off script), which hands it the **merge-base** `orchestrate-dev.js`
 *     materialised in a `git worktree`; and
 *   - `__tests__/loopEconomicsBaselineGuard.test.js`, which hands it **branch HEAD**'s
 *     `orchestrate-dev.js` and compares the result byte-for-byte against the committed files.
 *
 * Because both sides run one definition differing only in which module is handed to them, the
 * fixtures are regenerable and the guard's oracle is the same scenario set that produced them
 * (the CODE_REVIEW v1 F1 lesson from the precedent).
 *
 * ## The two cases (TSPEC §9)
 *
 * | caseId | What it records | Which claim it anchors |
 * |---|---|---|
 * | `CASCADE-DOWNSTREAM-REDISPATCH` | the ordered `UPSTREAM-CASCADE CONFIRMATION` dispatch stream of a cascade walk over two stale downstream documents, with `cascade.pinCheck` absent from the config | REQ-LOOPECON-04 (M2 disabled ⇒ dispatch stream byte-identical) |
 * | `PHASE-T-REVIEW-ROUNDS` | the two reviewer dispatch prompts of one Phase T review round, plus the convergence decision `reviewLoop` returned, with `review.derivativeStop` absent from the config | REQ-LOOPECON-07 (M3 disabled ⇒ `reviewerPrompt` and convergence-decision bytes identical) |
 *
 * ### Why the recorded streams are NARROW, not whole-run
 *
 * A whole-`main()` recording (the `PIPELINE-NON-AUTHORING-PROMPTS` shape) would red on M1b
 * (T-11, dispatch-time re-derivation) and M1c (T-12, DoD round index) — both **intended**
 * behaviour changes that land in batches 4 and 5, before T-14/T-15 ever run. A baseline that
 * must be re-transcribed mid-feature proves nothing. Each case therefore records exactly the
 * stream its REQ names and no more:
 *
 *   - `CASCADE-DOWNSTREAM-REDISPATCH` filters to the cascade confirmation dispatches, the
 *     stream `cascadeDownstream` owns and M2 splits into collect/dispatch passes. The
 *     scenario deliberately moves **no** upstream document inside a confirmation window, so
 *     M1b's re-derivation is a no-op on these bytes by construction, and it records no
 *     DoD dispatch, so M1c cannot reach it.
 *   - `PHASE-T-REVIEW-ROUNDS` drives the exported `reviewLoop` directly, which M1b, M1c and
 *     M1d (accounting only, and vacuous on a zero-finding round) do not touch.
 *
 * ## Determinism obligations
 *
 * The recorded strings are byte-compared. Nothing here may read a clock, draw randomness, touch
 * a live filesystem or shell out to git: every seam is a scripted sync double from
 * `helpers/seams.js`, and every dispatch order is a function of the module under test alone.
 */

import { fakeFs, fakeGit, fakeListFiles } from "../../helpers/seams.js";

/**
 * The merge-base sha the committed baseline was captured at — PINNED, never recomputed. A
 * `git merge-base origin/main HEAD` default would move every time the default branch advances,
 * silently re-baselining the fixtures against a different "before" state, which is exactly the
 * risk PLAN §8 row 1 names ("baseline fixtures captured after an M2/M3 change has already
 * landed ⇒ the byte-identity claim proves nothing").
 *
 * `95005dad8fe21178fd25e9ec0b2586e796747916` is `git merge-base origin/main HEAD` on
 * `feat-pdlc-loop-economics` at capture time, and `pdlc/workflows/orchestrate-dev.js` is
 * byte-identical between it and branch HEAD (the branch carries only `docs/` commits so far) —
 * which is what makes the capture valid now and the guard green now.
 */
export const BASELINE_MERGE_BASE_REF = "95005dad8fe21178fd25e9ec0b2586e796747916";

/** Where the capture writes, relative to the repository root. */
export const BASELINE_FIXTURE_DIR = "pdlc/workflows/__tests__/fixtures/loop-economics-baseline";

/**
 * The config text every scenario serves off the `.claude/pdlc.config.json` read.
 *
 * `null` is "the file is absent", the **key-absent** state both REQ-LOOPECON-04 and
 * REQ-LOOPECON-07 quantify over: neither `cascade.pinCheck` nor `review.derivativeStop` exists,
 * so M2 and M3 are off through the fail-open path (TSPEC §11 row 1). It is also the state
 * merge-base code is in for free — merge-base code has no such keys to read — which is what
 * makes the capture and the guard comparable at all.
 */
export const KEYS_ABSENT_CONFIG_TEXT = null;

const silent = () => {};

/**
 * Every `argv` any scenario's `_git` double was handed, in call order, across every run in
 * this process.
 *
 * TSPEC §10 makes the `_git` stub mandatory in every new test file and requires each file to
 * assert, in an `afterEach`, that no `commit`/`push` argv it did not script was recorded
 * (commit `f325016`: a seam left at its real default shelled out to live git and committed 46
 * junk `chore(queue)` commits). The scenarios own their doubles, so the log has to surface
 * here for `loopEconomicsBaselineGuard.test.js`'s `afterEach` to read it.
 */
const recordedGitArgv = [];

/** Drain and return the recorded `_git` argv log. */
export function takeRecordedGitArgv() {
  return recordedGitArgv.splice(0, recordedGitArgv.length);
}

/** The one `_git` double shape both scenarios use: read-only, scripted, recording. */
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

/** Cross-review file naming: the reviewer skill's role slug, as the engine writes it. */
const ROLE_SLUG = Object.freeze({
  "pm-review": "product-manager",
  "se-review": "software-engineer",
  "te-review": "test-engineer",
});

/** A fixed 40-hex commit sha. Never `git rev-parse` — the bytes are compared. */
const COMMIT = "b7c1d2e3f40516273849a0b1c2d3e4f506172839";

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

// ─── CASCADE-DOWNSTREAM-REDISPATCH ────────────────────────────────────────────────────────────
//
// A whole `main()` run in which a Phase PR reviewer raises an erratum against TSPEC. The
// erratum round rewrites TSPEC, and the walk that follows it (`cascadeDownstream`) finds TWO
// stale downstream documents whose recorded approvals anchor TSPEC's OLD digest:
//
//   - `PLAN`       — seeded approved on disk with `UPSTREAM-STATE: TSPEC <old>`;
//   - `PROPERTIES` — approved by the very round that raised the erratum, and therefore anchored
//                    against the pre-erratum TSPEC too.
//
// `DECISIONS` sits between them in pipeline order and is deliberately NOT on the branch, so the
// walk's "not on branch ⇒ nothing approved ⇒ skip" arm is exercised on the recorded path rather
// than assumed. Two stale documents × two reviewers each = four recorded dispatches.
//
// The scenario keeps the confirmation windows quiet on purpose: no upstream document is
// rewritten while a confirmation is in flight, and the lifetime cap is never approached, so the
// recorded stream is the plain cascade path M2 must leave byte-identical when disabled.

const CASCADE_FEATURE = "loopecon-cascade";
const CASCADE_DOCS = `docs/${CASCADE_FEATURE}`;
const cascadeDoc = (docType) => `${CASCADE_DOCS}/${docType}-${CASCADE_FEATURE}.md`;

const CASCADE_REQ_PATH = cascadeDoc("REQ");
const CASCADE_FSPEC_PATH = cascadeDoc("FSPEC");
const CASCADE_TSPEC_PATH = cascadeDoc("TSPEC");
const CASCADE_PLAN_PATH = cascadeDoc("PLAN");
const CASCADE_PROPERTIES_PATH = cascadeDoc("PROPERTIES");

const CASCADE_REQ_TEXT = "# REQ\n\nAC-1: the pipeline records what it dispatched.\n";
const CASCADE_FSPEC_TEXT = "# FSPEC\n\n§2: the dispatch stream is observable.\n";
const CASCADE_TSPEC_TEXT = "# TSPEC\n\n§3: the walk re-derives from disk.\n";
const CASCADE_TSPEC_REWRITTEN = "# TSPEC\n\n§3: the walk re-derives from disk, per REQ AC-1.\n";
const CASCADE_PROPERTIES_TEXT = "# PROPERTIES\n\nPROP-1 traces TASK-01.\n";

const CASCADE_PLAN_TEXT = [
  "# PLAN",
  "",
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| TASK-01 | First task | 1 | - |",
  "",
  "| Task | Files |",
  "|---|---|",
  "| TASK-01 | `src/one.js` |",
  "",
].join("\n");

/** The erratum a Phase PR reviewer raises — the edit that makes TSPEC's downstreams stale. */
const CASCADE_ERRATUM_ITEM = "TSPEC: §3 must cite REQ AC-1 explicitly";

const cascadeReviewPath = (skill, docType, round) =>
  `${CASCADE_DOCS}/CROSS-REVIEW-${ROLE_SLUG[skill]}-${docType}-v${round}.md`;

/**
 * `CASCADE-DOWNSTREAM-REDISPATCH` — records, in dispatch order, the composed prompt of every
 * `UPSTREAM-CASCADE CONFIRMATION` dispatch the run produced.
 *
 * @param {object} dev - an `orchestrate-dev.js` module namespace (merge-base at capture time,
 *   branch HEAD in the guard). Only `default` (`main`) and `approvalHashOf` /
 *   `upstreamStateLines` are read, all of which exist on either side.
 * @returns {Promise<string[]>}
 */
async function runCascadeDownstreamRedispatch(dev) {
  const { approvalHashOf, upstreamStateLines } = dev;

  /** An APPROVED, tier-1-anchored cross-review file for `docText` over `upstream`. */
  const approvedReview = (docText, upstream) =>
    crossReviewText() +
    `\nAPPROVAL-HASH: ${approvalHashOf(docText)}\n` +
    `REVIEWED-COMMIT: ${COMMIT}\n` +
    upstreamStateLines(upstream);

  const reqHash = approvalHashOf(CASCADE_REQ_TEXT);
  const fspecHash = approvalHashOf(CASCADE_FSPEC_TEXT);
  const tspecHash = approvalHashOf(CASCADE_TSPEC_TEXT);

  const fs = fakeFs({
    [CASCADE_REQ_PATH]: CASCADE_REQ_TEXT,
    [CASCADE_FSPEC_PATH]: CASCADE_FSPEC_TEXT,
    [CASCADE_TSPEC_PATH]: CASCADE_TSPEC_TEXT,
    [CASCADE_PLAN_PATH]: CASCADE_PLAN_TEXT,
    // Phases R, F, T and P are seeded approved so the run reaches Phase PR, whose reviewer
    // raises the erratum. PROPERTIES is deliberately NOT seeded: Phase PR must actually run.
    [cascadeReviewPath("se-review", "REQ", 1)]: approvedReview(CASCADE_REQ_TEXT, []),
    [cascadeReviewPath("te-review", "REQ", 1)]: approvedReview(CASCADE_REQ_TEXT, []),
    [cascadeReviewPath("se-review", "FSPEC", 1)]: approvedReview(CASCADE_FSPEC_TEXT, [
      { docType: "REQ", hash: reqHash },
    ]),
    [cascadeReviewPath("te-review", "FSPEC", 1)]: approvedReview(CASCADE_FSPEC_TEXT, [
      { docType: "REQ", hash: reqHash },
    ]),
    [cascadeReviewPath("pm-review", "TSPEC", 1)]: approvedReview(CASCADE_TSPEC_TEXT, [
      { docType: "REQ", hash: reqHash },
      { docType: "FSPEC", hash: fspecHash },
    ]),
    [cascadeReviewPath("te-review", "TSPEC", 1)]: approvedReview(CASCADE_TSPEC_TEXT, [
      { docType: "REQ", hash: reqHash },
      { docType: "FSPEC", hash: fspecHash },
    ]),
    [cascadeReviewPath("pm-review", "PLAN", 1)]: approvedReview(CASCADE_PLAN_TEXT, [
      { docType: "REQ", hash: reqHash },
      { docType: "FSPEC", hash: fspecHash },
      { docType: "TSPEC", hash: tspecHash },
    ]),
    [cascadeReviewPath("te-review", "PLAN", 1)]: approvedReview(CASCADE_PLAN_TEXT, [
      { docType: "REQ", hash: reqHash },
      { docType: "FSPEC", hash: fspecHash },
      { docType: "TSPEC", hash: tspecHash },
    ]),
  });

  /** The recorded stream: cascade confirmation prompts only, in dispatch order. */
  const cascadePrompts = [];
  let erratumRaised = false;

  const agentFn = async (skill, prompt) => {
    const text = String(prompt ?? "");

    // The one recorded stream. Recorded before any scripted side effect, so the recorded
    // bytes are the bytes the dispatcher composed.
    if (text.includes("UPSTREAM-CASCADE CONFIRMATION")) {
      cascadePrompts.push(text);
      const target = /(docs\/\S*CROSS-REVIEW-\S+\.md)/.exec(text);
      if (target) fs.files[target[1]] = crossReviewText();
      return 'Re-confirmed.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
    }

    // The erratum round's delta confirmation over the rewritten TSPEC. Approves without
    // moving any upstream document, so no confirmation window ever sees drift.
    if (text.includes("DELTA CONFIRMATION")) {
      const target = /(docs\/\S*CROSS-REVIEW-\S+\.md)/.exec(text);
      if (target) fs.files[target[1]] = crossReviewText();
      return 'Delta confirmed.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
    }

    if (skill === "pm-review" || skill === "se-review" || skill === "te-review") {
      const approve = 'Reviewed.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
      // The reviewer writes its cross-review file, as the shipped skill does. Without it
      // Phase PR's round records no approval, PROPERTIES is never anchored against the
      // pre-erratum TSPEC, and the walk would find only ONE stale downstream document.
      const target = /(docs\/\S*CROSS-REVIEW-\S+\.md)/.exec(text);
      if (target) fs.files[target[1]] = crossReviewText();
      // Exactly one erratum, from the first Phase PR reviewer to be asked. Guarded by a
      // latch rather than by the reviewer's identity so the dispatch order of the pair
      // cannot change how many errata are raised.
      if (!erratumRaised && text.includes("for phase PR of feature")) {
        erratumRaised = true;
        return `${approve}ERRATUM: ${CASCADE_ERRATUM_ITEM}\n`;
      }
      return approve;
    }

    if (skill === "pm-author" || skill === "se-author" || skill === "te-author") {
      const erratumTarget = /ERRATUM ROUND for (docs\/\S+\.md)/.exec(text);
      if (erratumTarget && erratumTarget[1] === CASCADE_TSPEC_PATH) {
        fs.files[CASCADE_TSPEC_PATH] = CASCADE_TSPEC_REWRITTEN;
        return "Erratum applied.\nREVISION-COMPLETE: yes";
      }
      if (text.includes("DECISIONS_WARRANTED")) {
        return "Finalized.\nREVISION-COMPLETE: yes\nDECISIONS_WARRANTED: false";
      }
      if (text.includes("Return a JSON object")) {
        return JSON.stringify({
          tasks: [{ id: "TASK-01", description: "First task", dependencies: [], planBatch: 1 }],
        });
      }
      // Phase PR's creator writes PROPERTIES into the tree; without it the phase cannot
      // reach its review round and the cascade would never be provoked.
      if (!Object.prototype.hasOwnProperty.call(fs.files, CASCADE_PROPERTIES_PATH)) {
        fs.files[CASCADE_PROPERTIES_PATH] = CASCADE_PROPERTIES_TEXT;
      }
      return "Created/updated document successfully.";
    }

    if (skill === "se-implement") return "Tests: 5 passed, 0 failed. All good.";
    if (skill === "harvest-learnings") return "Harvest complete. LEARNINGS written and committed.";
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

  const listFiles = fakeListFiles((dirPath) =>
    Object.keys(fs.files)
      .filter((p) => p.startsWith(`${dirPath}/`) && !p.slice(dirPath.length + 1).includes("/"))
      .map((p) => p.slice(dirPath.length + 1))
  );

  const git = makeScenarioGit(CASCADE_FEATURE);

  const baseReadFile = fs.readFile;

  await dev.default({
    reqPath: CASCADE_REQ_PATH,
    _agent: agentFn,
    _sessionAgent: async (sessionKey, skill, prompt, agentOpts) => agentFn(skill, prompt, agentOpts),
    _parallel: (promises) => Promise.all(promises),
    // `.claude/pdlc.config.json` is served off this same seam. `null` is the key-absent
    // state — the one this baseline is captured under.
    _readFile: (p) =>
      String(p).endsWith("pdlc.config.json") ? KEYS_ABSENT_CONFIG_TEXT : baseReadFile(p),
    _hashFile: fs.hashFile,
    _hashNormalizedFile: fs.hashNormalizedFile,
    _appendFile: fs.appendFile,
    _writeFile: fs.writeFile,
    _checkFile: fs.checkFile,
    _listFiles: listFiles,
    _git: git,
    _phase: silent,
    _log: silent,
    _pipeline: async (label, fn) => fn(),
    _mergeWorktree: async () => ({ ok: true }),
    _checkCi: async () => "passed",
  });

  return cascadePrompts;
}

// ─── PHASE-T-REVIEW-ROUNDS ────────────────────────────────────────────────────────────────────
//
// One Phase T review round over TSPEC, driven through the exported `reviewLoop` directly: two
// reviewer dispatches (pm-review, te-review), both approving, so the round is terminal.
//
// The recorded stream is the two `reviewerPrompt` bodies AND, as a final entry, the convergence
// decision `reviewLoop` returned. REQ-LOOPECON-07 names both halves ("convergence decision and
// `reviewerPrompt` bytes identical to baseline"), and the record `reviewLoop` returns is the
// sole input `converge()` renders the `✅` row from — `converge` is scoped inside `main()` and
// is not reachable without dragging M1c's DoD round-index change into the recording.

const REVIEW_FEATURE = "loopecon-review";
const REVIEW_DOC = `docs/${REVIEW_FEATURE}/TSPEC-${REVIEW_FEATURE}.md`;

/**
 * Deterministically serialise the convergence decision.
 *
 * Keys are sorted so property insertion order cannot change the bytes, and the WHOLE record is
 * serialised rather than a chosen subset: REQ-LOOPECON-07 says the convergence decision is
 * identical, so a field M3 adds on the disabled path (e.g. an unconditional
 * `derivativeStop: false`) is a difference this baseline is meant to surface.
 */
function serializeConvergenceDecision(record) {
  const sortKeys = (value) => {
    if (Array.isArray(value)) return value.map(sortKeys);
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.keys(value)
          .sort()
          .map((key) => [key, sortKeys(value[key])])
      );
    }
    return value;
  };
  return `${JSON.stringify(sortKeys(record ?? null), null, 2)}\n`;
}

/**
 * `PHASE-T-REVIEW-ROUNDS` — records the two reviewer dispatch prompts, then the serialised
 * convergence decision.
 *
 * @param {object} dev - an `orchestrate-dev.js` module namespace.
 * @returns {Promise<string[]>}
 */
async function runPhaseTReviewRounds(dev) {
  const prompts = [];
  const fs = fakeFs({ [REVIEW_DOC]: "# TSPEC\n\n§1: body.\n" });

  const git = makeScenarioGit(REVIEW_FEATURE);

  const record = await dev.reviewLoop({
    doc: REVIEW_DOC,
    phase: "T",
    docType: "TSPEC",
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
    feature: REVIEW_FEATURE,
    _agent: async (skill, prompt) => {
      const text = String(prompt ?? "");
      prompts.push(text);
      // The reviewer writes its cross-review file, as the shipped skill does, so the
      // round's approval anchors and `anchoredPaths` on the returned record is populated —
      // the convergence decision recorded below is then the real one, not the degraded
      // "append found nothing to append to" shape.
      const target = /(docs\/\S*CROSS-REVIEW-\S+\.md)/.exec(text);
      if (target) fs.files[target[1]] = crossReviewText();
      return 'Reviewed.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
    },
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

  return [...prompts, serializeConvergenceDecision(record)];
}

export const BASELINE_SCENARIOS = Object.freeze([
  { caseId: "CASCADE-DOWNSTREAM-REDISPATCH", run: runCascadeDownstreamRedispatch },
  { caseId: "PHASE-T-REVIEW-ROUNDS", run: runPhaseTReviewRounds },
]);
