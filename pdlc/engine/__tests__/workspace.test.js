import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(engineRoot));
const bin = path.join(engineRoot, "bin", "pdlc.mjs");

function command(program, args, cwd, env = process.env) {
  return spawnSync(program, args, { cwd, env, encoding: "utf8" });
}

function git(args, cwd) {
  const result = command("git", args, cwd);
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function fixture(t) {
  const home = fs.mkdtempSync(path.join(repoRoot, ".pdlc-workspace-test-"));
  const source = path.join(home, "source");
  const repositories = [source];
  t.after(() => {
    for (const repo of repositories) {
      if (!fs.existsSync(path.join(repo, ".git"))) continue;
      git(["worktree", "list", "--porcelain"], repo).split("\n")
        .filter((line) => line.startsWith("worktree "))
        .map((line) => line.slice(9))
        .filter((dir) => dir !== repo)
        .forEach((dir) => git(["worktree", "remove", "--force", dir], repo));
    }
    fs.rmSync(home, { recursive: true, force: true });
  });
  fs.mkdirSync(source);
  git(["init", "-b", "main"], source);
  git(["config", "user.name", "Test"], source);
  git(["config", "user.email", "test@example.invalid"], source);
  fs.writeFileSync(path.join(source, "base.txt"), "base\n");
  git(["add", "."], source);
  git(["commit", "-m", "base"], source);
  git(["update-ref", "refs/remotes/origin/main", "HEAD"], source);
  // The source checkout is dirty and its local main is ahead of origin/main.
  fs.writeFileSync(path.join(source, "local.txt"), "local\n");
  git(["add", "local.txt"], source);
  git(["commit", "-m", "local"], source);
  fs.writeFileSync(path.join(source, "dirty.txt"), "keep\n");
  return { home, source, repositories };
}

function workspace(args, cwd, home) {
  return command(process.execPath, [bin, "workspace", ...args, "--cwd", cwd], cwd, { ...process.env, HOME: home });
}

test("workspace defaults to durable home storage and starts at origin/main", (t) => {
  const { home, source } = fixture(t);
  const result = workspace(["daily-brief"], source, home);
  assert.equal(result.status, 0, result.stderr);
  const target = result.stdout.trim();
  assert.ok(target.startsWith(path.join(home, ".local", "share", "yumo", "worktrees")));
  assert.equal(path.basename(target), "feat-daily-brief");
  assert.equal(git(["rev-parse", "HEAD"], target), git(["rev-parse", "refs/remotes/origin/main"], source));
  assert.equal(fs.readFileSync(path.join(source, "dirty.txt"), "utf8"), "keep\n");
  assert.equal(fs.existsSync(path.join(target, "dirty.txt")), false);
});

test("custom root reuses the worktree without replacing edits", (t) => {
  const { home, source } = fixture(t);
  const root = path.join(home, "custom-root");
  const first = workspace(["daily-brief", "--workspace-root", root], source, home);
  assert.equal(first.status, 0, first.stderr);
  const target = first.stdout.trim();
  fs.writeFileSync(path.join(target, "draft.txt"), "unsaved work\n");
  const second = workspace(["daily-brief", "--workspace-root", root], source, home);
  assert.equal(second.status, 0, second.stderr);
  assert.equal(second.stdout.trim(), target);
  assert.equal(fs.readFileSync(path.join(target, "draft.txt"), "utf8"), "unsaved work\n");
});

test("existing branch is reattached without resetting its commit", (t) => {
  const { home, source } = fixture(t);
  const root = path.join(home, "reattach");
  const first = workspace(["recover", "--workspace-root", root], source, home);
  assert.equal(first.status, 0, first.stderr);
  const target = first.stdout.trim();
  fs.writeFileSync(path.join(target, "work.txt"), "completed work\n");
  git(["add", "work.txt"], target);
  git(["commit", "-m", "work"], target);
  const committed = git(["rev-parse", "HEAD"], target);
  git(["worktree", "remove", target], source);
  const second = workspace(["recover", "--workspace-root", root], source, home);
  assert.equal(second.status, 0, second.stderr);
  assert.equal(second.stdout.trim(), target);
  assert.equal(git(["rev-parse", "HEAD"], target), committed);
  assert.equal(fs.readFileSync(path.join(target, "work.txt"), "utf8"), "completed work\n");
});

test("branch checked out in another worktree reports its location", (t) => {
  const { home, source } = fixture(t);
  const first = workspace(["active", "--workspace-root", path.join(home, "first")], source, home);
  assert.equal(first.status, 0, first.stderr);
  const second = workspace(["active", "--workspace-root", path.join(home, "second")], source, home);
  assert.equal(second.status, 1, second.stdout + second.stderr);
  assert.match(second.stderr, /branch feat-active is already checked out at/);
  assert.match(second.stderr, /first/);
  assert.equal(fs.existsSync(path.join(home, "second")), false);
});

test("detached source with no main gives a clear error", (t) => {
  const { home, source } = fixture(t);
  git(["checkout", "--detach"], source);
  git(["branch", "-D", "main"], source);
  git(["update-ref", "-d", "refs/remotes/origin/main"], source);
  const result = workspace(["missing-main", "--workspace-root", path.join(home, "worktrees")], source, home);
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stderr, /neither origin\/main nor local main exists \(source HEAD is detached\)/);
});

test("relative workspace root is resolved from --cwd", (t) => {
  const { home, source } = fixture(t);
  const result = workspace(["relative", "--workspace-root", "../relative-worktrees"], source, home);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.trim().startsWith(path.join(home, "relative-worktrees") + path.sep));
});

test("plain folder inside the source repo cannot masquerade as a worktree", (t) => {
  const { home, source } = fixture(t);
  const probe = workspace(["probe", "--workspace-root", source], source, home);
  assert.equal(probe.status, 0, probe.stderr);
  const parent = path.dirname(probe.stdout.trim());
  git(["worktree", "remove", probe.stdout.trim()], source);
  git(["checkout", "-b", "feat-plain"], source);
  fs.mkdirSync(path.join(parent, "feat-plain"));
  const result = workspace(["plain", "--workspace-root", source], source, home);
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stderr, /workspace path is occupied/);
});

test("invalid feature slug is rejected before branch creation", (t) => {
  const { home, source } = fixture(t);
  const result = workspace(["Bad/Feature", "--workspace-root", path.join(home, "worktrees")], source, home);
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stderr, /feature must use lowercase/);
  assert.equal(fs.existsSync(path.join(home, "worktrees")), false);
});

test("temporary roots are rejected before branch or worktree creation", (t) => {
  const { home, source } = fixture(t);
  const alias = path.join(home, "tmp-alias");
  fs.symlinkSync(os.tmpdir(), alias);
  for (const root of [os.tmpdir(), "/tmp", alias]) {
    const result = workspace(["unsafe", "--workspace-root", root], source, home);
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stderr, /must be durable/);
    assert.notEqual(command("git", ["show-ref", "--verify", "refs/heads/feat-unsafe"], source).status, 0);
  }
});

test("repos with the same name get distinct workspaces under one root", (t) => {
  const { home, source, repositories } = fixture(t);
  const other = path.join(home, "other", "source");
  repositories.push(other);
  fs.mkdirSync(other, { recursive: true });
  git(["init", "-b", "main"], other);
  git(["config", "user.name", "Test"], other);
  git(["config", "user.email", "test@example.invalid"], other);
  fs.writeFileSync(path.join(other, "base.txt"), "other\n");
  git(["add", "."], other);
  git(["commit", "-m", "base"], other);
  const root = path.join(home, "shared");
  const first = workspace(["same-feature", "--workspace-root", root], source, home);
  const second = workspace(["same-feature", "--workspace-root", root], other, home);
  assert.equal(first.status, 0, first.stderr);
  assert.equal(second.status, 0, second.stderr);
  assert.notEqual(first.stdout.trim(), second.stdout.trim());
  assert.equal(fs.readFileSync(path.join(second.stdout.trim(), "base.txt"), "utf8"), "other\n");
  // The second repository has no origin/main, so its local main is used.
  assert.equal(git(["rev-parse", "HEAD"], second.stdout.trim()), git(["rev-parse", "main"], other));
});
