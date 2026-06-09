/**
 * tmpGitFixture.js — Temporary git repo fixture for PROP-IMPL-08 merge-conflict integration test.
 *
 * Creates a temp git repository with two branches where the same file has diverging changes,
 * guaranteeing a merge conflict. Exports createConflictingWorktree().
 */

import { execSync } from "child_process";
import { mkdtempSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

/**
 * Creates a temporary git repo with a conflicting worktree branch.
 *
 * Layout:
 *   - Main branch (main):   conflict.txt = "line from main\n"
 *   - Feature branch (feat): conflict.txt = "line from feature\n"
 *   Both branches diverge from a common ancestor commit.
 *
 * @returns {{ repoPath: string, worktreePath: string, targetBranch: string, cleanup: () => void }}
 *   repoPath      — path to the git repo (checked out on targetBranch)
 *   worktreePath  — a directory path representing the worktree branch (feat branch path)
 *   targetBranch  — name of the target branch to merge into ("main")
 *   cleanup       — function that removes all temp dirs
 */
export function createConflictingWorktree() {
  const repoDir = mkdtempSync(join(tmpdir(), "pdlc-git-fixture-"));

  const exec = (cmd) =>
    execSync(cmd, { cwd: repoDir, stdio: "pipe", encoding: "utf8" });

  // Initialise repo with a known identity so CI doesn't fail on missing git config
  exec("git init -b main");
  exec('git config user.email "test@example.com"');
  exec('git config user.name "Test"');

  // Common ancestor: create conflict.txt with a shared base
  writeFileSync(join(repoDir, "conflict.txt"), "shared base content\n");
  exec("git add conflict.txt");
  exec('git commit -m "initial commit"');

  // Diverge main branch: overwrite conflict.txt
  writeFileSync(join(repoDir, "conflict.txt"), "line from main\n");
  exec("git add conflict.txt");
  exec('git commit -m "main branch change"');

  // Create feature branch from initial commit (HEAD~1), change same file
  exec("git checkout -b feat HEAD~1");
  writeFileSync(join(repoDir, "conflict.txt"), "line from feature\n");
  exec("git add conflict.txt");
  exec('git commit -m "feature branch change"');

  // Switch back to main so the repo is on targetBranch
  exec("git checkout main");

  // The "worktreePath" for mergeWorktree is the branch name (feat),
  // which git merge will use. We pass the branch name directly.
  const worktreePath = join(repoDir, ".git", "refs", "heads", "feat");
  const targetBranch = "main";

  const cleanup = () => {
    try {
      rmSync(repoDir, { recursive: true, force: true });
    } catch {
      // best-effort cleanup
    }
  };

  return { repoPath: repoDir, worktreeBranch: "feat", targetBranch, cleanup };
}
