#!/usr/bin/env node
/**
 * capture-learnings-baseline.mjs — LI-05, PLAN §pdlc-learnings-injection, TSPEC §T.3.
 *
 * Captures the pre-feature (merge-base) prompt-composition baseline that
 * `learningsBaselineGuard.test.js` (LI-06) guards against silent drift, per TSPEC §T.3's
 * dissolution: the harness is new (branch code), the subject is old (merge-base code).
 *
 * Steps (TSPEC §T.3):
 *   1. `git worktree add <worktreePath> <mergeBaseRef>` materialises the pre-feature module
 *      tree at a second path. Nothing is checked out over the branch working tree.
 *   2. Import `main` from `<worktreePath>/pdlc/workflows/orchestrate-dev.js` — merge-base
 *      code — and drive it through the branch-side L3 fixture matrix — branch code, imported
 *      normally. Neither is required to exist in the other's tree.
 *   3. Write each composed prompt to `{outputDir}/{caseId}/{dispatchIndex}.txt`, plus a
 *      `MANIFEST.json` recording the merge-base sha and a SHA-256 digest per file.
 *
 * `.baseline-worktree` must be removed in a `finally` (obligation 2 of TSPEC §T.3): an
 * exception between materialise and remove still leaves the worktree cleaned up. Removal is
 * always `git worktree remove --force`, never `rm -rf` — the latter leaves a stale
 * `.git/worktrees/` administrative entry that reds the next `git worktree add` at the same
 * path (see the LI-T-WORKTREE oracle in `learningsCaptureScript.test.js`).
 */

import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

/**
 * Drives `main` (imported from the merge-base worktree) through the caller-supplied L3
 * fixture matrix and writes the resulting prompts plus `MANIFEST.json`.
 *
 * The matrix's content is deliberately not hard-coded here: TSPEC §T.3 names it as "the
 * branch-side L3 fixture matrix", which is branch code assembled by whichever suite/case set
 * is current at capture time (LI-06 runs this once, by hand, before the first production edit
 * lands). This function is the generic step-2/step-3 driver; `matrix` supplies the scenarios.
 *
 * @param {object} options
 * @param {string} options.cwd - repository root the worktree was added under.
 * @param {string} options.worktreePath - path of the merge-base worktree, absolute or relative to `cwd`.
 * @param {string} options.outputDir - directory the captured fixtures are written under.
 * @param {string} options.mergeBaseRef - the resolved merge-base sha, recorded in the manifest.
 * @param {Array<{caseId: string, run: (mainFn: Function) => Promise<string[]>}>} options.matrix
 *   - one entry per L3 case; `run` receives the merge-base `main` and resolves the ordered
 *   list of composed prompts (one per dispatch) that case produced.
 * @returns {Promise<{mergeBaseSha: string, files: Record<string,string>}>}
 */
export async function captureFixturesFromWorktree({
  cwd,
  worktreePath,
  outputDir,
  mergeBaseRef,
  matrix,
}) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    throw new Error(
      "pdlc-learnings-capture: no L3 fixture matrix cases supplied. " +
        "capture-learnings-baseline.mjs drives the caller-supplied matrix (TSPEC §T.3); " +
        "pass `matrix: [{caseId, run(mainFn)}, ...]` to runCaptureScript()."
    );
  }

  // `resolve`, not `join`: `worktreePath` may be absolute (the `--worktree` flag accepts one,
  // and tests pass a scratch directory). `join` would graft an absolute path onto `cwd` and
  // import from a directory that does not exist (CODE_REVIEW v1 F1, second round).
  const modulePath = path.resolve(cwd, worktreePath, "pdlc", "workflows", "orchestrate-dev.js");
  const devModule = await import(pathToFileURL(modulePath).href);
  const mainFn = devModule.default;

  mkdirSync(outputDir, { recursive: true });

  /** @type {Record<string,string>} */
  const files = {};
  const seenCaseIds = new Set();

  for (const testCase of matrix) {
    const { caseId, run } = testCase;
    if (seenCaseIds.has(caseId)) {
      throw new Error(`pdlc-learnings-capture: duplicate caseId in matrix: ${caseId}`);
    }
    seenCaseIds.add(caseId);

    const prompts = await run(mainFn, devModule);
    const caseDir = path.join(outputDir, caseId);
    mkdirSync(caseDir, { recursive: true });

    prompts.forEach((promptText, dispatchIndex) => {
      const relPath = `${caseId}/${dispatchIndex}.txt`;
      writeFileSync(path.join(outputDir, relPath), promptText, "utf8");
      files[relPath] = createHash("sha256").update(promptText, "utf8").digest("hex");
    });
  }

  const manifest = { mergeBaseSha: mergeBaseRef, files };
  writeFileSync(
    path.join(outputDir, "MANIFEST.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8"
  );
  return manifest;
}

/**
 * Materialises the merge-base worktree, drives the capture through it, and removes the
 * worktree unconditionally — the `finally` obligation TSPEC §T.3 names (LI-T-WORKTREE).
 *
 * @param {object} options
 * @param {string} options.cwd - repository root to run `git worktree` commands in.
 * @param {string} options.worktreePath - path, absolute or relative to `cwd`, to materialise the
 *   merge-base checkout at, e.g. `.baseline-worktree`.
 * @param {string} options.mergeBaseRef - ref/sha to check out into the worktree.
 * @param {string} options.outputDir - directory the captured fixtures are written under.
 * @param {Array} [options.matrix] - forwarded to `_captureFixtures`.
 * @param {(opts: object) => Promise<*>} [options._captureFixtures] - the seam between
 *   worktree materialise and worktree remove. Defaults to `captureFixturesFromWorktree`;
 *   tests inject a replacement to prove the `finally` cleans up regardless of why the drive
 *   step failed, without faking `git` itself.
 * @returns {Promise<*>}
 */
export async function runCaptureScript({
  cwd,
  worktreePath,
  mergeBaseRef,
  outputDir,
  matrix,
  _captureFixtures = captureFixturesFromWorktree,
}) {
  execFileSync("git", ["worktree", "add", worktreePath, mergeBaseRef], { cwd });
  try {
    return await _captureFixtures({ cwd, worktreePath, outputDir, mergeBaseRef, matrix });
  } finally {
    // `git worktree remove`, never `rm -rf`: the latter leaves a stale `.git/worktrees/`
    // administrative entry that reds the next `git worktree add` at the same path.
    execFileSync("git", ["worktree", "remove", "--force", worktreePath], { cwd });
  }
}

const isMainModule =
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

/**
 * Minimal flag parser for the entry point: `--ref <sha>`, `--out <dir>`, `--worktree <path>`.
 *
 * @param {string[]} argv
 * @returns {Record<string,string>}
 */
export function parseCaptureArgv(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (!flag.startsWith("--")) continue;
    const name = flag.slice(2);
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`pdlc-learnings-capture: flag --${name} requires a value`);
    }
    options[name] = value;
    i += 1;
  }
  return options;
}

if (isMainModule) {
  // CODE_REVIEW v1 F1/F12. This entry point used to be a refusal stub: it printed "no built-in
  // L3 fixture matrix is wired into this CLI entrypoint yet" and exited 1, so every
  // operator-reachable path of a shipped production script did nothing, the committed fixtures'
  // AC-6.2 provenance was not reproducible by the committed tooling, and the word "yet" was a
  // deferral bound to no successor. The matrix is now committed
  // (`pdlc/workflows/__tests__/helpers/learningsBaselineScenarios.js`) and wired here:
  // `node scripts/capture-learnings-baseline.mjs` regenerates the committed fixture set in
  // place, and re-running it on an unmodified merge-base reproduces the committed digests
  // byte-for-byte — which is what makes the provenance checkable rather than asserted.
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(__dirname, "..");
  const { BASELINE_SCENARIOS, BASELINE_MERGE_BASE_REF, NEUTRAL_STATE, BASELINE_FIXTURE_DIR } =
    await import(
      pathToFileURL(
        path.join(repoRoot, "pdlc", "workflows", "__tests__", "helpers", "learningsBaselineScenarios.js")
      ).href
    );

  const options = parseCaptureArgv(process.argv.slice(2));
  // The ref is PINNED by default, never `git merge-base origin/main HEAD`: the merge base moves
  // every time the default branch advances, so a computed default would silently re-baseline the
  // fixtures against a different "before" state and quietly invalidate AC-6.2's recorded
  // provenance. `--ref` is the deliberate override.
  const mergeBaseRef = options.ref ?? BASELINE_MERGE_BASE_REF;
  const outputDir = path.resolve(repoRoot, options.out ?? BASELINE_FIXTURE_DIR);
  const worktreePath = options.worktree ?? ".baseline-worktree";

  const manifest = await runCaptureScript({
    cwd: repoRoot,
    worktreePath,
    mergeBaseRef,
    outputDir,
    matrix: BASELINE_SCENARIOS.map(({ caseId, run }) => ({
      caseId,
      // Merge-base code consults neither the config seam nor the LEARNINGS enumeration seam, so
      // the neutral (config absent, enumeration empty) reading defines the recorded bytes.
      run: (_mainFn, devModule) => run(devModule, NEUTRAL_STATE),
    })),
  });

  console.error(`pdlc-learnings-capture: captured at merge-base ${manifest.mergeBaseSha}`);
  console.error(`pdlc-learnings-capture: wrote ${Object.keys(manifest.files).length} prompt fixtures to ${outputDir}`);
  for (const [relPath, digest] of Object.entries(manifest.files)) {
    console.error(`  ${digest}  ${relPath}`);
  }
}
