// ─── loopQueueCommitProvenance.test.js ──────────────────────────────────────
//
// PLAN P5-07 ([new level], pdlc-engineering-loop). TSPEC Test Strategy →
// "Git-history oracle | pdlc/workflows/__tests__/loopQueueCommitProvenance.test.js
// | AT-30 — a temporary git repo is initialised in a fixture directory, a
// scripted session runs N iterations against it through the real `gitFn`,
// and every commit in the session's range touching `docs/_queue/QUEUE.md` is
// asserted to carry `commitQueueRow`'s own message form (`chore(queue):
// {feature} → {status}`). A driver-side write is falsified by a commit in
// the range no invocation produced." FSPEC AT-30, BR-19.
//
// "Real gitFn" here means an async wrapper around the actual `git` binary
// (via `execFileSync`, `cwd`-scoped to the fixture repo) — not the scripted
// argv-keyed responder (`makeGitFn` in helpers/loopDoubles.js) other loop
// tests inject. `rewriteStatus` (exported) is the driver-side write seam
// that composes `updateQueueStatus` + `commitQueueRow` — one call is one
// session iteration's queue write.
//
// BR-19 / no count-equality (the reviewer's explicit instruction): the
// oracle never asserts `subjects.length === N`. It asserts (a) the range
// holds at least one QUEUE.md-touching commit (non-vacuity — a session that
// produced zero would otherwise pass over an empty set), and (b) every
// commit in range touching QUEUE.md is a member of the set of messages the
// invocations actually produced (subset, not cardinality). The zero-iteration
// half of the universal is AT-14, owned by P5-01 (`loopQueueDriver.test.js`).

import { execFileSync, execSync } from "child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";

import { rewriteStatus } from "../orchestrate-queue.js";

const QUEUE_REL_PATH = "docs/_queue/QUEUE.md";

function exec(repo, cmd) {
  return execSync(cmd, { cwd: repo, stdio: "pipe", encoding: "utf8" });
}

// The real seam: shells out to the real `git` binary, `cwd`-scoped to the
// fixture repo. Never throws — same contract as `defaultGit`
// (orchestrate-queue.js).
function makeRealGit(repo) {
  return async (argv) => {
    try {
      const stdout = execFileSync("git", argv, { cwd: repo, stdio: "pipe", encoding: "utf8" });
      return { ok: true, stdout: String(stdout ?? ""), stderr: "" };
    } catch (err) {
      return {
        ok: false,
        stdout: String((err && err.stdout) ?? ""),
        stderr: String((err && (err.stderr || err.message)) ?? ""),
      };
    }
  };
}

// Real filesystem seams, scoped to the fixture repo — not the in-memory
// Map-backed doubles other loop tests use, since `rewriteStatus`'s write
// must land on disk for `git add`/`git commit` to see it.
function makeRepoFs(repo) {
  return {
    readFileFn: async (relPath) => {
      const full = join(repo, relPath);
      return existsSync(full) ? readFileSync(full, "utf8") : null;
    },
    writeFileFn: async (relPath, contents) => {
      const full = join(repo, relPath);
      mkdirSync(dirname(full), { recursive: true });
      writeFileSync(full, contents);
    },
  };
}

function initFixtureRepo() {
  const repo = mkdtempSync(join(tmpdir(), "pdlc-loop-provenance-"));
  exec(repo, "git init -b main");
  exec(repo, 'git config user.email "test@example.com"');
  exec(repo, 'git config user.name "Test"');

  mkdirSync(join(repo, "docs/_queue"), { recursive: true });
  writeFileSync(
    join(repo, QUEUE_REL_PATH),
    "| Order | Status | Feature | REQ Path | Depends-On |\n" +
      "| --- | --- | --- | --- | --- |\n" +
      "| 1 | pending | alpha-feature | docs/alpha-feature/REQ-alpha-feature.md | - |\n",
  );
  exec(repo, `git add -- ${QUEUE_REL_PATH}`);
  exec(repo, 'git commit -m "seed queue"');
  const initialHead = exec(repo, "git rev-parse HEAD").trim();

  return { repo, initialHead };
}

// The oracle itself: every QUEUE.md-touching commit subject in `range` must
// be a member of `producedMessages` — subset, never cardinality (BR-19).
function queueCommitSubjects(repo, range) {
  const out = exec(repo, `git log --format=%s ${range} -- ${QUEUE_REL_PATH}`);
  return out.split("\n").filter((line) => line.length > 0);
}

function allQueueCommitsProduced(repo, range, producedMessages) {
  const subjects = queueCommitSubjects(repo, range);
  return subjects.length > 0 && subjects.every((s) => producedMessages.has(s));
}

describe("AT-30 — git-history provenance for commitQueueRow's own message form (BR-19)", () => {
  let repo;
  let initialHead;

  afterEach(() => {
    if (repo) rmSync(repo, { recursive: true, force: true });
    repo = undefined;
  });

  it("a 3-iteration session's every QUEUE.md-touching commit carries a message an invocation produced, and at least one exists", async () => {
    ({ repo, initialHead } = initFixtureRepo());
    const gitFn = makeRealGit(repo);
    const { readFileFn, writeFileFn } = makeRepoFs(repo);

    // N=3 session iterations, each a real `rewriteStatus` call — the
    // driver-side write seam that composes `updateQueueStatus` +
    // `commitQueueRow` — through the real `gitFn`, not a scripted responder.
    const statuses = ["in-progress", "review", "done"];
    const produced = new Set();
    for (const status of statuses) {
      const result = await rewriteStatus(
        QUEUE_REL_PATH,
        "alpha-feature",
        status,
        readFileFn,
        writeFileFn,
        gitFn,
      );
      expect(result.queueRow).toBe("recorded");
      produced.add(`chore(queue): alpha-feature → ${status}`);
    }

    const range = `${initialHead}..HEAD`;
    const subjects = queueCommitSubjects(repo, range);

    // Non-vacuity (BR-19): the universal is not left to pass over an empty
    // set — the range must hold at least one QUEUE.md-touching commit.
    expect(subjects.length).toBeGreaterThanOrEqual(1);

    // The provenance oracle itself: subset, never `=== 3` (no
    // count-equality, BR-19) — every commit in range touching QUEUE.md was
    // produced by one of the three invocations above, in `commitQueueRow`'s
    // own message form.
    expect(subjects.every((s) => produced.has(s))).toBe(true);
    expect(allQueueCommitsProduced(repo, range, produced)).toBe(true);
  });

  it("a commit in range touching QUEUE.md that no invocation produced falsifies the oracle", async () => {
    ({ repo, initialHead } = initFixtureRepo());
    const gitFn = makeRealGit(repo);
    const { readFileFn, writeFileFn } = makeRepoFs(repo);

    const result = await rewriteStatus(
      QUEUE_REL_PATH,
      "alpha-feature",
      "in-progress",
      readFileFn,
      writeFileFn,
      gitFn,
    );
    expect(result.queueRow).toBe("recorded");
    const produced = new Set(["chore(queue): alpha-feature → in-progress"]);

    const range = `${initialHead}..HEAD`;
    expect(allQueueCommitsProduced(repo, range, produced)).toBe(true);

    // A driver-side write is falsified by a rogue commit no invocation
    // produced — hand-edit QUEUE.md and commit it outside `rewriteStatus`,
    // bypassing `commitQueueRow` entirely.
    const current = readFileSync(join(repo, QUEUE_REL_PATH), "utf8");
    writeFileSync(join(repo, QUEUE_REL_PATH), `${current}<!-- rogue edit -->\n`);
    exec(repo, `git add -- ${QUEUE_REL_PATH}`);
    exec(repo, 'git commit -m "chore(queue): rogue-feature -> done"');

    // Same oracle, same `produced` set (no invocation made this commit):
    // it must now report false, proving the check is sensitive rather than
    // a tautology.
    expect(allQueueCommitsProduced(repo, range, produced)).toBe(false);
  });
});
