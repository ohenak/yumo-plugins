/**
 * worktreeInclude.test.js — remediation for CROSS-REVIEW-se-codebase-v1.md F-07.
 *
 * `.worktreeinclude` is wholly load-bearing for the documented guarantee that "a worktree
 * Claude Code creates for you is a supported consumer" (CLAUDE.md, `pdlc/README.md`): the
 * repo-root `.claude/workflows/` generated artifacts only survive into a Claude-created
 * worktree because this one-line file lists that path. Before this test, no suite anywhere
 * asserted the file's existence or content (`grep -rn worktreeinclude pdlc/workflows/__tests__`
 * returned nothing) — deleting the file would silently break the guarantee with every existing
 * test still green.
 *
 * This does not touch `.worktreeinclude` itself, `CLAUDE.md`, or `pdlc/README.md` (out of this
 * task's scope) — it only adds the missing observable.
 */

import { existsSync, readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// __dirname = pdlc/workflows/__tests__; three levels up is the repo root.
const REPO_ROOT = resolve(__dirname, "..", "..", "..");
const WORKTREEINCLUDE_PATH = resolve(REPO_ROOT, ".worktreeinclude");

describe("F-07 — .worktreeinclude is present and lists the generated workflows directory", () => {
  it("exists at the repo root", () => {
    expect(existsSync(WORKTREEINCLUDE_PATH)).toBe(true);
  });

  it("lists .claude/workflows/ (the directory the generated bundles are synced into)", () => {
    const lines = readFileSync(WORKTREEINCLUDE_PATH, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    expect(lines).toContain(".claude/workflows/");
  });
});
