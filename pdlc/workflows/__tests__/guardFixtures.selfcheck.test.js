/**
 * guardFixtures.selfcheck.test.js — proves the hermetic fixture builders
 * (TASK-02, TSPEC §§ 6.1–6.2) construct the intended git states, and that the
 * M77 builder self-check fails as designed on a healthy repo.
 *
 * This is the self-check for the [Fake first] scaffolding of TASK-02: the fixture
 * library has no failing production test of its own, so this asserts the builders
 * directly. The full matrix (guardMatrix.test.js) consumes the same builders.
 */

import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import {
  buildFixture,
  assertM77ProbeFails,
  degradedEnv,
  runGuard,
  BASH_ABS,
  LEARNINGS_REL,
  BRANCH,
  cleanupAll,
} from "./helpers/guardFixtures.js";

// ── Environment guards ────────────────────────────────────────────────────────
function has(bin, args) {
  try {
    return spawnSync(bin, args, { stdio: "pipe" }).status === 0;
  } catch {
    return false;
  }
}
const hasGit = has("git", ["--version"]);
const hasBash = has("bash", ["--version"]);
const gitIt = hasGit ? it : it.skip;

// ── git query helpers (read-only; never mutate the fixture) ───────────────────
function g(repoDir, ...args) {
  return spawnSync("git", args, { cwd: repoDir, encoding: "utf8" });
}
/** true iff `path` is present in the tree of `ref`. */
function inTree(repoDir, ref, path) {
  const r = g(repoDir, "ls-tree", "--name-only", ref, "--", path);
  return r.status === 0 && (r.stdout || "").trim() !== "";
}
/** true iff the remote-tracking / any ref resolves. */
function refExists(repoDir, ref) {
  return g(repoDir, "show-ref", "--verify", "--quiet", ref).status === 0;
}
function revParse(repoDir, rev) {
  const r = g(repoDir, "rev-parse", rev);
  return r.status === 0 ? (r.stdout || "").trim() : null;
}
function remotes(repoDir) {
  return (g(repoDir, "remote").stdout || "").trim();
}
function isDetached(repoDir) {
  // symbolic-ref fails (nonzero) when HEAD is detached.
  return g(repoDir, "symbolic-ref", "--quiet", "--short", "HEAD").status !== 0;
}

afterEach(cleanupAll);

// ── Module-load invariants ────────────────────────────────────────────────────
describe("guardFixtures module load", () => {
  it("resolves BASH_ABS to an absolute path (C17)", () => {
    expect(BASH_ABS.startsWith("/")).toBe(true);
    expect(existsSync(BASH_ABS)).toBe(true);
  });
});

// ── State builders ────────────────────────────────────────────────────────────
describe("buildFixture git states", () => {
  gitIt("G8 (default): origin/feat-f exists; LEARNINGS on disk only, uncommitted", () => {
    const f = buildFixture("G8");
    expect(refExists(f.repoDir, `refs/remotes/origin/${BRANCH}`)).toBe(true);
    expect(existsSync(join(f.repoDir, LEARNINGS_REL))).toBe(true);
    expect(inTree(f.repoDir, "HEAD", LEARNINGS_REL)).toBe(false);
    expect(inTree(f.repoDir, `origin/${BRANCH}`, LEARNINGS_REL)).toBe(false);
  });

  gitIt("G6: LEARNINGS committed AND present on origin/feat-f (VERIFIED)", () => {
    const f = buildFixture("G6");
    expect(inTree(f.repoDir, "HEAD", LEARNINGS_REL)).toBe(true);
    expect(inTree(f.repoDir, `origin/${BRANCH}`, LEARNINGS_REL)).toBe(true);
  });

  gitIt("G7: LEARNINGS committed locally but NOT on origin/feat-f", () => {
    const f = buildFixture("G7");
    expect(inTree(f.repoDir, "HEAD", LEARNINGS_REL)).toBe(true);
    expect(refExists(f.repoDir, `refs/remotes/origin/${BRANCH}`)).toBe(true);
    expect(inTree(f.repoDir, `origin/${BRANCH}`, LEARNINGS_REL)).toBe(false);
  });

  gitIt("G4: origin exists, origin/feat-f absent, LEARNINGS committed locally", () => {
    const f = buildFixture("G4");
    expect(remotes(f.repoDir)).toBe("origin");
    expect(refExists(f.repoDir, `refs/remotes/origin/${BRANCH}`)).toBe(false);
    expect(inTree(f.repoDir, "HEAD", LEARNINGS_REL)).toBe(true);
  });

  gitIt("G5: origin exists, origin/feat-f absent, LEARNINGS on disk only", () => {
    const f = buildFixture("G5");
    expect(remotes(f.repoDir)).toBe("origin");
    expect(refExists(f.repoDir, `refs/remotes/origin/${BRANCH}`)).toBe(false);
    expect(existsSync(join(f.repoDir, LEARNINGS_REL))).toBe(true);
    expect(inTree(f.repoDir, "HEAD", LEARNINGS_REL)).toBe(false);
  });

  gitIt("G2: no remote; LEARNINGS committed", () => {
    const f = buildFixture("G2");
    expect(remotes(f.repoDir)).toBe("");
    expect(f.bareDir).toBeNull();
    expect(inTree(f.repoDir, "HEAD", LEARNINGS_REL)).toBe(true);
  });

  gitIt("G3: detached HEAD; LEARNINGS committed", () => {
    const f = buildFixture("G3");
    expect(isDetached(f.repoDir)).toBe(true);
    expect(inTree(f.repoDir, "HEAD", LEARNINGS_REL)).toBe(true);
  });

  gitIt("G9: LEARNINGS-other.md committed+pushed; LEARNINGS-f.md absent (M36)", () => {
    const f = buildFixture("G9");
    expect(inTree(f.repoDir, "HEAD", `docs/f/LEARNINGS-other.md`)).toBe(true);
    expect(inTree(f.repoDir, "HEAD", LEARNINGS_REL)).toBe(false);
    expect(inTree(f.repoDir, `origin/${BRANCH}`, LEARNINGS_REL)).toBe(false);
  });

  gitIt("G10: local tracking ref is STALE (== pre-push init sha), HEAD carries LEARNINGS", () => {
    const f = buildFixture("G10");
    const tracking = revParse(f.repoDir, `origin/${BRANCH}`);
    const head = revParse(f.repoDir, "HEAD");
    expect(tracking).toBe(f.initSha);
    expect(tracking).not.toBe(head);
    // Stale tracking ref lacks LEARNINGS though HEAD has it.
    expect(inTree(f.repoDir, `origin/${BRANCH}`, LEARNINGS_REL)).toBe(false);
    expect(inTree(f.repoDir, "HEAD", LEARNINGS_REL)).toBe(true);
  });

  gitIt("G10-unreachable: origin url points at a nonexistent path (fetch fails fast)", () => {
    const f = buildFixture("G10-unreachable");
    const url = (g(f.repoDir, "remote", "get-url", "origin").stdout || "").trim();
    expect(url).toBe("/nonexistent-remote-path");
    expect(revParse(f.repoDir, `origin/${BRANCH}`)).toBe(f.initSha);
  });

  gitIt("G1: plain dir, never git-inited; contains a CROSS-REVIEW file on disk", () => {
    const f = buildFixture("G1");
    expect(existsSync(join(f.repoDir, ".git"))).toBe(false);
    expect(existsSync(join(f.repoDir, "docs/f/CROSS-REVIEW-x.md"))).toBe(true);
    expect(f.bareDir).toBeNull();
  });

  gitIt("nested (M67): docs/f/2024-notes/CROSS-REVIEW-x.md committed", () => {
    const f = buildFixture("nested");
    expect(inTree(f.repoDir, "HEAD", "docs/f/2024-notes/CROSS-REVIEW-x.md")).toBe(true);
  });

  gitIt("secondRepo (M86): a second, guarded-dir-free git repo alongside the main repo", () => {
    const f = buildFixture("secondRepo");
    expect(f.secondRepoDir).toBeTruthy();
    expect(existsSync(join(f.secondRepoDir, ".git"))).toBe(true);
    expect(existsSync(join(f.secondRepoDir, "docs"))).toBe(false);
    // Main repo still carries the guarded tree.
    expect(existsSync(join(f.repoDir, "docs/f/CROSS-REVIEW-x.md"))).toBe(true);
  });
});

// ── M77 corrupt-loose-object + builder self-check ─────────────────────────────
describe("M77 corrupt-loose-object fixture (C18/DEC-04)", () => {
  gitIt("builds without throwing (builder self-check passed) and the ls-tree probe fails 128", () => {
    const f = buildFixture("M77");
    const probe = g(f.repoDir, "ls-tree", "--name-only", `origin/${BRANCH}`, "--", LEARNINGS_REL);
    expect(probe.status).not.toBe(0);
    expect((probe.stderr || "").trim()).not.toBe("");
    // The exported self-check re-run must also pass (not throw) on the corrupt fixture.
    expect(() => assertM77ProbeFails(f)).not.toThrow();
  });

  gitIt("the M77 self-check THROWS on a healthy repo (probe succeeds → invariant violated)", () => {
    const healthy = buildFixture("G6");
    expect(() => assertM77ProbeFails(healthy)).toThrow(/self-check FAILED/);
  });
});

// ── Runners / env helpers ─────────────────────────────────────────────────────
describe("runners and env helpers", () => {
  gitIt("degradedEnv() yields a PATH pointing at an existing empty directory", () => {
    const env = degradedEnv();
    expect(typeof env.PATH).toBe("string");
    expect(existsSync(env.PATH)).toBe(true);
  });

  (hasBash && hasGit ? it : it.skip)(
    "runGuard returns a well-formed {exitCode,stdout,stderr} and allows a non-deletion command",
    () => {
      const f = buildFixture("G6");
      const res = runGuard(f, { command: "echo hello" });
      expect(res).toHaveProperty("exitCode");
      expect(res).toHaveProperty("stdout");
      expect(res).toHaveProperty("stderr");
      // A non-deletion command is out of scope for the guard → allow (exit 0).
      expect(res.exitCode).toBe(0);
    },
  );

  (hasBash && hasGit ? it : it.skip)(
    "runGuard unsets CLAUDE_PROJECT_DIR via env:{CLAUDE_PROJECT_DIR:undefined} (C11) without crashing",
    () => {
      const f = buildFixture("G6");
      const res = runGuard(f, {
        command: "echo hello",
        env: { CLAUDE_PROJECT_DIR: undefined },
      });
      expect(res.exitCode).toBe(0);
    },
  );
});
