import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

function git(cwd, args) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.status !== 0) throw new Error((result.stderr || result.stdout || `git ${args[0]} failed`).trim());
  return result.stdout.trim();
}

function realPathWithMissingTail(input) {
  const absolute = path.resolve(input);
  if (fs.existsSync(absolute)) return fs.realpathSync(absolute);
  return path.join(realPathWithMissingTail(path.dirname(absolute)), path.basename(absolute));
}

function isWithin(parent, child) {
  const relative = path.relative(parent, child);
  return relative === "" || (relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

export function featureWorkspace({ feature, cwd = process.cwd(), workspaceRoot = path.join(os.homedir(), ".local", "share", "yumo", "worktrees") }) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(feature || "")) {
    throw new Error("feature must use lowercase letters, digits, and internal hyphens");
  }
  // A relative override is anchored to --cwd, not to the CLI installation.
  const root = realPathWithMissingTail(path.resolve(cwd, workspaceRoot));
  if (["/tmp", "/private/tmp", os.tmpdir()].some((temp) => isWithin(realPathWithMissingTail(temp), root))) {
    throw new Error("workspace root must be durable; temporary directories are not allowed");
  }
  const source = fs.realpathSync(git(cwd, ["rev-parse", "--show-toplevel"]));
  const commonDir = fs.realpathSync(path.resolve(source, git(source, ["rev-parse", "--git-common-dir"])));
  const identity = crypto.createHash("sha256").update(commonDir).digest("hex").slice(0, 12);
  const repoName = path.basename(source).replace(/[^a-zA-Z0-9._-]/g, "-");
  const branch = `feat-${feature}`;
  const target = path.join(root, `${repoName}-${identity}`, branch);
  if (fs.existsSync(target)) {
    if (!fs.statSync(target).isDirectory()) throw new Error(`workspace path is occupied: ${target}`);
    let existingSource;
    let existingBranch;
    let existingTop;
    try {
      existingTop = fs.realpathSync(git(target, ["rev-parse", "--show-toplevel"]));
      existingSource = fs.realpathSync(path.resolve(target, git(target, ["rev-parse", "--git-common-dir"])));
      existingBranch = git(target, ["symbolic-ref", "--quiet", "--short", "HEAD"]);
    } catch {
      throw new Error(`workspace path is occupied: ${target}`);
    }
    if (existingTop !== fs.realpathSync(target) || existingSource !== commonDir || existingBranch !== branch) {
      throw new Error(`workspace path is occupied: ${target}`);
    }
    return target;
  }
  const branchExists = spawnSync("git", ["show-ref", "--verify", "--quiet", `refs/heads/${branch}`], { cwd: source }).status === 0;
  if (branchExists) {
    const worktrees = git(source, ["worktree", "list", "--porcelain"]);
    const active = worktrees.split(/\n\n/).find((entry) => entry.split("\n").includes(`branch refs/heads/${branch}`));
    if (active) {
      const location = active.split("\n").find((line) => line.startsWith("worktree ")).slice(9);
      throw new Error(`branch ${branch} is already checked out at ${location}`);
    }
  } else {
    const hasRef = (ref) => spawnSync("git", ["rev-parse", "--verify", "--quiet", ref], { cwd: source }).status === 0;
    const mainRef = hasRef("refs/remotes/origin/main") ? "refs/remotes/origin/main" : "refs/heads/main";
    if (!hasRef(mainRef)) {
      const detached = spawnSync("git", ["symbolic-ref", "--quiet", "--short", "HEAD"], { cwd: source }).status !== 0;
      throw new Error(`neither origin/main nor local main exists${detached ? " (source HEAD is detached)" : ""}`);
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    git(source, ["worktree", "add", "-b", branch, target, mainRef]);
    return target;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  git(source, ["worktree", "add", target, branch]);
  return target;
}
