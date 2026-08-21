/**
 * learningsBaselineScenarios.js — the committed L3 fixture matrix for
 * `scripts/capture-learnings-baseline.mjs` (TSPEC §T.3), CODE_REVIEW v1 F1/F7/F12.
 *
 * TSPEC §T.3 names the capture's subject as merge-base code and its harness as branch code.
 * Before this module the harness was an uncommitted one-off script, so AC-6.2's "captured from
 * the pre-feature HEAD" provenance was not reproducible from the repository (CODE_REVIEW v1 F1)
 * and the CLI entry point could only refuse (F12). The matrix now lives here, is imported BOTH
 * by the capture entry point (which drives it against the merge-base worktree's module) and by
 * `learningsBaselineGuard.test.js` (which drives the identical scenarios against branch HEAD and
 * compares byte-for-byte), so the fixtures under `__tests__/fixtures/learnings-baseline/` are
 * regenerable by `node scripts/capture-learnings-baseline.mjs` and the guard's oracle is the same
 * scenario set that produced them.
 *
 * Each scenario is `{caseId, run(devModule, state)}`:
 *   - `devModule` is the module NAMESPACE of an `orchestrate-dev.js` — merge-base code at capture
 *     time, branch code in the guard. Only `default` (`main`) and `reviewLoop` are read, both of
 *     which exist on either side.
 *   - `state` is one of the non-injecting states (see `NON_INJECTING_STATES`): the
 *     `.claude/pdlc.config.json` text and the reply to the LEARNINGS enumeration call. At capture
 *     time neither seam is consulted by merge-base code at all, so `NEUTRAL_STATE` is used.
 *   - `run` resolves the ORDERED list of composed prompts the scenario's non-injecting dispatch
 *     set produced; the capture writes them to `{caseId}/{dispatchIndex}.txt`.
 *
 * Determinism obligations for anything added here (the fixtures are byte-compared): no clock, no
 * randomness, no real filesystem or git process in the subject run, and a fixed dispatch order.
 */

import { fakeFs, fakeGit, fakeListFiles } from "./seams.js";

/**
 * The merge-base sha the committed baseline was captured at — PINNED, never recomputed. A
 * `git merge-base origin/main HEAD` default would move every time the default branch advances,
 * silently re-baselining the fixtures against a different "before" state; pinning is what makes
 * `node scripts/capture-learnings-baseline.mjs` reproduce the committed digests byte-for-byte.
 * `learningsBaselineGuard.test.js` asserts `MANIFEST.json` records exactly this sha.
 */
export const BASELINE_MERGE_BASE_REF = "5a080c7af8c550e839001c7d4cd3d260ead36faa";

/** Where the capture writes, relative to the repository root. */
export const BASELINE_FIXTURE_DIR = "pdlc/workflows/__tests__/fixtures/learnings-baseline";

/** `LEARNINGS_CORPUS_ARGV`'s recognisable prefix, restated (never imported): the production
 *  constant does not exist in merge-base code. */
export const isLearningsEnumerateCall = (argv) =>
  Array.isArray(argv) && argv[0] === "ls-files" && argv.includes(":(glob)docs/*/LEARNINGS-*.md");

const REV_PARSE = "rev-parse --abbrev-ref HEAD";
const silent = () => {};

/**
 * One non-injecting state, expressed as the two seam behaviours that distinguish it: the
 * `.claude/pdlc.config.json` text, and the reply to the LEARNINGS enumeration call.
 * `corpusFiles` are additional readable paths (the ADMITS-NOTHING arm's real corpus document).
 */
export const NON_INJECTING_STATES = Object.freeze([
  {
    name: "DISABLED — learningsInjection.enabled is false",
    configText: JSON.stringify({ learningsInjection: { enabled: false } }),
    enumerateReply: () => ({ ok: true, stdout: "" }),
    corpusFiles: {},
  },
  {
    name: "EMPTY — enumeration succeeds and returns no corpus document (RSN-EMPTY)",
    configText: null,
    enumerateReply: () => ({ ok: true, stdout: "" }),
    corpusFiles: {},
  },
  {
    name: "UNLISTABLE — enumeration fails (RSN-UNLISTABLE, fail-open)",
    configText: null,
    enumerateReply: () => ({ ok: false, stdout: "", stderr: "fatal: not a git repository" }),
    corpusFiles: {},
  },
  {
    name: "ADMITS-NOTHING — a real corpus document is read and rejected RSN-NO-MATERIAL",
    configText: null,
    enumerateReply: () => ({
      ok: true,
      stdout: "docs/completed/li06-prior/LEARNINGS-li06-prior.md\n",
    }),
    corpusFiles: {
      // A well-formed LEARNINGS document carrying none of BR-6's five priority sections, so the
      // selection is empty even though the injector enumerated, opened and parsed it.
      "docs/completed/li06-prior/LEARNINGS-li06-prior.md":
        "# LEARNINGS — li06-prior\n\n| Field | Value |\n|---|---|\n| Date Completed | 2026-01-01 |\n\n## Not A BR-6 Section\n\nNothing BR-6 recognises.\n",
    },
  },
]);

/** The state the CAPTURE runs under: merge-base code consults neither seam, so the neutral
 *  (config absent, enumeration empty) reading is the one that defines the recorded bytes. */
export const NEUTRAL_STATE = NON_INJECTING_STATES[1];

/**
 * The scripted all-approve `_agent` double every scenario dispatches through — a locally scoped
 * double, never the live transport (AC-6.1).
 *
 * @param {(skill: string, prompt: string) => void} record - called once per dispatch.
 */
function makeBaselineAgent(record) {
  return async (skill, prompt) => {
    record(skill, String(prompt ?? ""));
    return 'Done.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
  };
}

function makeStateGit(feature, state) {
  return fakeGit((argv) => {
    if (isLearningsEnumerateCall(argv)) return state.enumerateReply();
    return argv.join(" ") === REV_PARSE ? { ok: true, stdout: `feat-${feature}\n` } : { ok: true };
  });
}

/**
 * `PHASE-R-REVIEW-PROMPTS` — Phase R's two reviewer dispatches (se-review, te-review), both
 * approving immediately. Drives `reviewLoop` directly.
 */
async function runPhaseRReviewPrompts(dev, state) {
  const FEATURE = "li06-phase-r-review";
  const prompts = [];
  await dev.reviewLoop({
    doc: `docs/${FEATURE}/REQ-${FEATURE}.md`,
    phase: "R",
    docType: "REQ",
    reviewers: ["se-review", "te-review"],
    optimizer: "pm-author",
    feature: FEATURE,
    _agent: makeBaselineAgent((skill, prompt) => prompts.push(prompt)),
    _parallel: (promises) => Promise.all(promises),
    _checkFile: () => ({ ok: true }),
    _listFiles: fakeListFiles([]),
    _readFile: (p) => state.corpusFiles[String(p)] ?? null,
    _log: silent,
    _git: makeStateGit(FEATURE, state),
  });
  return prompts;
}

/**
 * `PHASE-F-AUTHORING-PROMPT` — Phase F's creator (pm-author) dispatch, reached because Phase R
 * converged; the run halts cleanly afterwards because the creator's response text is never
 * written back into the fake filesystem.
 */
async function runPhaseFAuthoringPrompt(dev, state) {
  const FEATURE = "li06-phase-f-authoring";
  const REQ_PATH = `docs/${FEATURE}/REQ-${FEATURE}.md`;
  const fs = fakeFs({ [REQ_PATH]: "# REQ\n\nBody.\n", ...state.corpusFiles });
  const authoring = [];
  const injections = fs.injections();
  const baseReadFile = injections._readFile;

  await dev.default({
    ...injections,
    reqPath: REQ_PATH,
    _agent: makeBaselineAgent((skill, prompt) => {
      if (skill === "pm-author" || skill === "se-author") authoring.push(prompt);
    }),
    _parallel: (promises) => Promise.all(promises),
    _pipeline: async (label, fn) => fn(),
    _phase: silent,
    _log: silent,
    _listFiles: fakeListFiles([]),
    _git: makeStateGit(FEATURE, state),
    // The config is read off this same seam, once per run (§I.2) — the one channel that turns
    // the injector off. Everything else falls through to the fake filesystem.
    _readFile: async (p) =>
      String(p).endsWith("pdlc.config.json") ? state.configText : baseReadFile(p),
  });
  return authoring;
}


// ─── PIPELINE-NON-AUTHORING-PROMPTS ─────────────────────────────────────────────────────────
//
// CODE_REVIEW v1 F7. The two scenarios above pin three prompts. AC-1.2 quantifies over EVERY
// dispatch outside BR-1's rule, and the only same-branch instrument that covered the rest
// (LI-AT-03) compared an enabled run to a DISABLED run of the same branch — the comparison
// AC-5.1a rules out, which cannot fail if the injection seam corrupts non-authoring prompts
// identically in both arms. This scenario drives a WHOLE `main()` run — every phase the
// all-approve script reaches, including Phase CR, implementation, DoD and PUB — and records the
// composed prompt of every NON-authoring dispatch, so the committed baseline oracle ranges over
// the set AC-1.2 names rather than over three prompts.

const PIPELINE_FEATURE = "li06-pipeline";
const PIPELINE_REQ_PATH = `docs/${PIPELINE_FEATURE}/REQ-${PIPELINE_FEATURE}.md`;

const PIPELINE_PLAN = [
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| TASK-01 | First task | 1 | - |",
  "",
  "| Task | Files |",
  "|---|---|",
  "| TASK-01 | `src/one.js` |",
].join("\n");

/** Authoring skills — the complement of the set this scenario records (BR-1's first conjunct). */
export const AUTHORING_SKILLS = new Set(["pm-author", "se-author", "te-author"]);

/**
 * The deterministic all-approve pipeline `_agent` double: a fixed script keyed only on the
 * skill and on literals in the prompt, so the dispatch sequence is a function of the code under
 * test alone.
 */
function makePipelineAgent(record) {
  return async (skill, prompt) => {
    const text = String(prompt ?? "");
    record(skill, text);
    if (skill === "guard") return "{ ok: true }";
    if (skill === "pm-review" || skill === "se-review" || skill === "te-review") {
      return 'Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
    }
    if (AUTHORING_SKILLS.has(skill)) {
      if (text.includes("DECISIONS_WARRANTED")) return "Finalized TSPEC.\nDECISIONS_WARRANTED: false";
      if (text.includes("Return a JSON object")) {
        return JSON.stringify({
          tasks: [{ id: "TASK-01", description: "First task", dependencies: [], planBatch: 1 }],
        });
      }
      return "Created/updated document successfully.";
    }
    if (skill === "se-implement") return "Tests: 5 passed, 0 failed. All good.";
    if (skill === "harvest-learnings") return "Harvest complete. LEARNINGS written and committed.";
    if (skill === "dod-verify") return "Clean.\nDOD_STATUS: passed";
    if (skill === "ship-pr") {
      if (text.includes("Rebase the feature branch")) return "Rebased.\nREBASE_STATUS: clean";
      if (text.includes("Raise a pull request")) return "PR opened.\nPR_URL: https://github.com/acme/repo/pull/42";
      return "Checks complete.\nCI_STATUS: passed";
    }
    return "Success.";
  };
}

/**
 * `PIPELINE-NON-AUTHORING-PROMPTS` — a whole `main()` run; the recorded list is every
 * non-authoring dispatch's composed prompt, in dispatch order.
 */
async function runPipelineNonAuthoringPrompts(dev, state) {
  const nonAuthoring = [];
  let currentBranch = `feat-${PIPELINE_FEATURE}`;

  const _readFile = async (p) => {
    const key = String(p);
    if (key.endsWith("pdlc.config.json")) return state.configText;
    if (key.includes("/PLAN-")) return PIPELINE_PLAN;
    if (/CROSS-REVIEW-.*\.md$/.test(key)) return "## Verdict\nVERDICT: Approved\n";
    if (Object.prototype.hasOwnProperty.call(state.corpusFiles, key)) return state.corpusFiles[key];
    return null;
  };

  const _git = fakeGit((argv) => {
    const args = Array.isArray(argv) ? argv : [];
    if (isLearningsEnumerateCall(args)) return state.enumerateReply();
    if (args[0] === "add") return { ok: true, stdout: "", stderr: "" };
    if (args[0] === "checkout") {
      currentBranch = args[args.length - 1];
      return { ok: true, stdout: "", stderr: "" };
    }
    if (args[0] === "rev-parse" && args.includes("--abbrev-ref")) {
      return { ok: true, stdout: `${currentBranch}\n`, stderr: "" };
    }
    if (args[0] === "rev-parse") {
      return { ok: true, stdout: "abc1234abc1234abc1234abc1234abc1234abcd", stderr: "" };
    }
    if (args[0] === "diff") return { ok: true, stdout: "staged\n", stderr: "" };
    return { ok: true, stdout: "", stderr: "" };
  });

  await dev.default({
    reqPath: PIPELINE_REQ_PATH,
    _agent: makePipelineAgent((skill, prompt) => {
      if (!AUTHORING_SKILLS.has(skill)) nonAuthoring.push(prompt);
    }),
    _parallel: (promises) => Promise.all(promises),
    _checkFile: () => ({ ok: true }),
    _readFile,
    _writeFile: async () => ({ ok: true }),
    _appendFile: async () => ({ ok: true }),
    _git,
    _hashFile: async () => "a".repeat(64),
    _phase: silent,
    _log: silent,
    _pipeline: async (label, fn) => fn(),
    _mergeWorktree: async () => ({ ok: true }),
    _checkCi: async () => "passed",
  });

  return nonAuthoring;
}

export const BASELINE_SCENARIOS = Object.freeze([
  { caseId: "PHASE-R-REVIEW-PROMPTS", run: runPhaseRReviewPrompts },
  { caseId: "PHASE-F-AUTHORING-PROMPT", run: runPhaseFAuthoringPrompt },
  { caseId: "PIPELINE-NON-AUTHORING-PROMPTS", run: runPipelineNonAuthoringPrompts },
]);
