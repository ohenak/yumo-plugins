/**
 * learningsComposition.js — the AC-2.5 / PROP-ORDER-05 composition, in one place so it can be
 * driven from TWO SEPARATE NODE PROCESSES (CODE_REVIEW v1 F8).
 *
 * PROPERTIES §O.7 states the determinism property as two compositions made in two separate
 * process invocations, which is what rules out module-level memoisation and insertion-order
 * dependence surviving in a WARM module. `learningsDispatchSet.test.js`'s LI-AT-14 previously
 * made both compositions in the same jest worker against a module-cached
 * `await import("../orchestrate-dev.js")`, so any per-process cached state was shared by both
 * arms and invisible to the oracle.
 *
 * This module is the single implementation of the composition. It is
 *   - imported by LI-AT-14 for the first arm (in-process), and
 *   - executed as a CLI entry point (`node helpers/learningsComposition.js`) for the second arm,
 *     printing the composed authoring prompts to stdout as JSON,
 * so the two arms run identical code over identical fixtures in cold, unrelated processes.
 *
 * It lives under `__tests__/helpers/`, which `jest.testPathIgnorePatterns` excludes, so it
 * registers no tests of its own.
 */

import { pathToFileURL } from "url";

import { buildLearningsCorpus } from "./learningsFixtures.js";
import { fakeGit } from "./seams.js";

export const FEATURE = "li11-fixture";
export const REQ_PATH = `docs/${FEATURE}/REQ-${FEATURE}.md`;

/** The two-document corpus AC-2.5's determinism property is stated over. Two documents is the
 *  minimum that makes ORDER observable at all — one document composes the same block under any
 *  ordering rule. */
export const AT14_CORPUS_SPEC = Object.freeze([
  {
    path: "docs/completed/prior-a/LEARNINGS-prior-a.md",
    doc: { feature: "prior-a", dateCompleted: "2026-01-01", sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }] },
  },
  {
    path: "docs/completed/prior-b/LEARNINGS-prior-b.md",
    doc: { feature: "prior-b", dateCompleted: "2026-01-02", sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }] },
  },
]);

const LEARNINGS_BLOCK_MARKER = "--- PRIOR-FEATURE LEARNINGS";
const AUTHORING_SKILLS = new Set(["pm-author", "se-author", "te-author"]);

const SCENARIO_PLAN = [
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| TASK-01 | First task | 1 | - |",
  "",
  "| Task | Files |",
  "|---|---|",
  "| TASK-01 | `src/one.js` |",
].join("\n");

const isLearningsEnumerateCall = (argv) =>
  Array.isArray(argv) && argv[0] === "ls-files" && argv.includes(":(glob)docs/*/LEARNINGS-*.md");

/**
 * Drives one whole `mainDev` run over the AT-14 corpus and returns the composed prompts of the
 * authoring dispatches that carry a LEARNINGS block, in dispatch order.
 *
 * @param {{corpusSpec?: Array<object>}} [opts]
 * @returns {Promise<string[]>}
 */
export async function composeAuthoringPrompts({ corpusSpec = AT14_CORPUS_SPEC } = {}) {
  const dev = await import("../../orchestrate-dev.js");
  const mainDev = dev.default;
  const corpus = buildLearningsCorpus(corpusSpec.map((entry) => ({ ...entry })));

  const calls = [];
  let currentBranch = `feat-${FEATURE}`;

  const _readFile = (path) => {
    const p = String(path);
    if (p.endsWith("pdlc.config.json")) return null;
    if (p.includes("/PLAN-")) return SCENARIO_PLAN;
    if (/CROSS-REVIEW-.*\.md$/.test(p)) return "## Verdict\nVERDICT: Approved\n";
    if (Object.prototype.hasOwnProperty.call(corpus.contents, p)) return corpus.contents[p];
    return null;
  };

  const _git = fakeGit((argv) => {
    const args = Array.isArray(argv) ? argv : [];
    if (isLearningsEnumerateCall(args)) return { ok: true, stdout: corpus.lsFilesStdout };
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

  await mainDev({
    reqPath: REQ_PATH,
    _agent: async (skill, prompt) => {
      const text = String(prompt ?? "");
      calls.push({ skill, prompt: text });
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
    },
    _parallel: (promises) => Promise.all(promises),
    _checkFile: () => ({ ok: true }),
    _readFile,
    _writeFile: async () => ({ ok: true }),
    _appendFile: async () => ({ ok: true }),
    _git,
    _hashFile: async () => "a".repeat(64),
    _phase: () => {},
    _log: () => {},
    _pipeline: async (label, fn) => fn(),
    _mergeWorktree: async () => ({ ok: true }),
    _checkCi: async () => "passed",
  });

  return calls
    .filter((c) => AUTHORING_SKILLS.has(c.skill) && c.prompt.includes(LEARNINGS_BLOCK_MARKER))
    .map((c) => c.prompt);
}

// CLI entry point — the SECOND process invocation of PROP-ORDER-05. Emits the composed prompts
// as JSON on the last line of stdout, so the parent can compare them byte-for-byte with its own
// in-process composition.
const isMainModule = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isMainModule) {
  const prompts = await composeAuthoringPrompts();
  process.stdout.write(`${JSON.stringify(prompts)}\n`);
}
