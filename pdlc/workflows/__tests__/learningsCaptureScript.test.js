/**
 * learningsCaptureScript.test.js — LI-03, PLAN §pdlc-learnings-injection, TSPEC §T.3.
 *
 * The two obligation oracles TSPEC §T.3 assigns to
 * `scripts/capture-learnings-baseline.mjs` and `.gitignore`:
 *
 *   LI-T-IGNORE  — root-anchored ignore rule (obligation 1). Three conjuncts, asserted
 *                  together in one test: `.baseline-worktree` at the repository root IS
 *                  ignored; a NESTED `.baseline-worktree` under a fixture directory is NOT;
 *                  `pdlc/workflows/__tests__/fixtures/learnings-baseline/` is NOT. (2) and
 *                  (3) are what give LI-04's root anchoring an oracle — a bare
 *                  `.baseline-worktree`, `*` or `.baseline*` rule would pass (1) alone while
 *                  un-tracking fixture material this feature is about to commit (TE F-06).
 *   LI-T-WORKTREE — `finally`-block removal (obligation 2). A forced throw injected between
 *                  worktree materialise and worktree remove, through the script's
 *                  fixture-driving seam (never `_git` — git stays real throughout), must
 *                  still leave the worktree path absent AND `git worktree list` showing no
 *                  entry for it. The second conjunct is what distinguishes a real
 *                  `git worktree remove` from an `rm -rf` (TSPEC §T.3).
 *
 * Both oracles run against a DEDICATED TEMPORARY git repository created by the test and used
 * as the instrument's `cwd`, with a real `git` binary — never this developer checkout, which
 * DoD 8 forbids mutating (TE F-03, Q-03).
 *
 * Both blocks are committed `.skip`ped: neither obligation's greening artifact exists yet.
 * LI-T-IGNORE is greened by LI-04 (`.gitignore` gains the root-anchored rule); LI-T-WORKTREE
 * is greened by LI-05 (`scripts/capture-learnings-baseline.mjs` is created). Each title names
 * its own owning task, per this PLAN's skip-naming rule.
 */

import { execFileSync, spawnSync } from "child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// __dirname = pdlc/workflows/__tests__; three levels up is the repository root.
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");
const BRANCH_GITIGNORE_PATH = path.join(REPO_ROOT, ".gitignore");
const CAPTURE_SCRIPT_PATH = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "scripts",
  "capture-learnings-baseline.mjs"
);

const GIT_COMMIT_CONFIG = [
  "-c",
  "user.email=pdlc-learnings-capture@example.invalid",
  "-c",
  "user.name=pdlc-learnings-capture",
];

/**
 * Materialises a fresh, throwaway git repository, seeded with the branch's own `.gitignore`
 * and committed so it has a resolvable `HEAD`. Real `git`, never the developer's checkout.
 *
 * @returns {{ root: string }}
 */
function makeSeededTempRepo() {
  const root = mkdtempSync(path.join(tmpdir(), "pdlc-learnings-capture-"));
  execFileSync("git", ["init", "-q", "-b", "main"], { cwd: root });
  const gitignoreText = readFileSync(BRANCH_GITIGNORE_PATH, "utf8");
  writeFileSync(path.join(root, ".gitignore"), gitignoreText);
  execFileSync("git", ["add", "-A"], { cwd: root });
  execFileSync("git", [...GIT_COMMIT_CONFIG, "commit", "-q", "-m", "seed"], { cwd: root });
  return { root };
}

/**
 * Runs `git check-ignore` for a path relative to `cwd` and returns its exit status:
 * 0 = ignored, 1 = not ignored. Any other status (e.g. 128) is a fatal git error and is
 * surfaced by the caller rather than folded into a boolean.
 *
 * @param {string} cwd
 * @param {string} relPath
 * @returns {number}
 */
function checkIgnoreStatus(cwd, relPath) {
  const result = spawnSync("git", ["check-ignore", relPath], { cwd, encoding: "utf8" });
  if (result.status !== 0 && result.status !== 1) {
    throw new Error(
      `pdlc-test: git check-ignore fatal error for ${relPath}: status ${result.status}, ` +
        `stderr: ${result.stderr}`
    );
  }
  return result.status;
}

describe("learningsCaptureScript", () => {
  let repoRoot;

  beforeEach(() => {
    repoRoot = makeSeededTempRepo().root;
  });

  it("LI-04: root-anchored .baseline-worktree ignore rule, three conjuncts", () => {
    // Conjunct (1): `.baseline-worktree` at the repository root IS ignored.
    const rootWorktreePath = path.join(repoRoot, ".baseline-worktree");
    mkdirSync(rootWorktreePath, { recursive: true });
    writeFileSync(path.join(rootWorktreePath, "marker.txt"), "marker");
    expect(checkIgnoreStatus(repoRoot, ".baseline-worktree")).toBe(0);

    // Conjunct (2): a NESTED `.baseline-worktree` under a fixture directory is NOT ignored —
    // a bare `.baseline-worktree`, `*` or `.baseline*` rule would wrongly swallow this.
    const nestedRel = path.join(
      "pdlc",
      "workflows",
      "__tests__",
      "fixtures",
      "x",
      ".baseline-worktree"
    );
    mkdirSync(path.join(repoRoot, nestedRel), { recursive: true });
    writeFileSync(path.join(repoRoot, nestedRel, "marker.txt"), "marker");
    expect(checkIgnoreStatus(repoRoot, nestedRel)).toBe(1);

    // Conjunct (3): the committed baseline fixture directory is NOT ignored.
    const baselineFixtureRel = path.join(
      "pdlc",
      "workflows",
      "__tests__",
      "fixtures",
      "learnings-baseline"
    );
    mkdirSync(path.join(repoRoot, baselineFixtureRel), { recursive: true });
    writeFileSync(path.join(repoRoot, baselineFixtureRel, "MANIFEST.json"), "{}");
    expect(checkIgnoreStatus(repoRoot, baselineFixtureRel)).toBe(1);
  });

  it("LI-05: a forced throw between materialise and remove still removes the worktree", async () => {
    expect(existsSync(CAPTURE_SCRIPT_PATH)).toBe(true);
    const { runCaptureScript } = await import(CAPTURE_SCRIPT_PATH);

    const mergeBaseRef = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repoRoot,
      encoding: "utf8",
    }).trim();
    const worktreePath = ".baseline-worktree";
    const injectedError = new Error("pdlc-test: injected fixture-drive failure");

    await expect(
      runCaptureScript({
        cwd: repoRoot,
        worktreePath,
        mergeBaseRef,
        outputDir: path.join(repoRoot, "fixtures-out"),
        // The fixture/import seam — the step between worktree materialise and worktree
        // remove — never `_git`. Forcing a throw here proves the `finally` cleans up
        // regardless of why the drive step failed, without faking git itself.
        _captureFixtures: async () => {
          throw injectedError;
        },
      })
    ).rejects.toThrow(injectedError.message);

    // Conjunct 1: the worktree path is gone from the filesystem.
    expect(existsSync(path.join(repoRoot, worktreePath))).toBe(false);

    // Conjunct 2 (load-bearing): the temp repo's OWN `git worktree list` shows no entry for
    // it. `rm -rf` would satisfy conjunct 1 alone while leaving a stale `.git/worktrees/`
    // administrative entry that reds the next `git worktree add` at the same path — this is
    // what distinguishes `git worktree remove` from `rm -rf`.
    const worktreeList = execFileSync("git", ["worktree", "list", "--porcelain"], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    const absoluteWorktreePath = path.join(repoRoot, worktreePath);
    expect(worktreeList.includes(absoluteWorktreePath)).toBe(false);
  });
});
