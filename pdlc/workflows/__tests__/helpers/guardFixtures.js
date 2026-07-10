// guardFixtures.js — hermetic git fixture library + guard runners.
//
// TSPEC-harden-harvest-guard §§ 6.1–6.2 (v1.1). This module lives in the
// jest-ignored helpers dir (package.json `testPathIgnorePatterns` →
// "/__tests__/helpers/"), so it ships no test of its own; its builders are
// exercised transitively by guardMatrix.test.js / hookCompatibility.test.js and
// by the guardFixtures.selfcheck.test.js self-check.
//
// Hermeticity invariants (REQ-GUARD-05, PROP-HERMETIC-01):
//   • every temp tree under mkdtempSync, torn down via cleanupAll() in afterEach
//   • git identity configured locally per fixture; commit signing disabled
//   • the ONLY remote is a local bare fixture repo or an invalid path — no network
//   • file-remote pushes use `protocol.file.allow=always` (set in local config)
//   • runGuard NEVER defaults spawnCwd to process.cwd() (TE TSPEC F-09): the
//     developer checkout is itself a git repo with a docs/ tree and would leak
//     into union-cwd resolution as candidate root (B).

import { spawnSync } from "child_process";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  chmodSync,
  rmSync,
} from "fs";
import { join, resolve, dirname, isAbsolute } from "path";
import { tmpdir } from "os";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Script paths under test ───────────────────────────────────────────────────
// __dirname = pdlc/workflows/__tests__/helpers → up three to pdlc/, then hooks/scripts/
const HOOKS_DIR = resolve(__dirname, "../../../hooks/scripts");
export const GUARD_SCRIPT = join(HOOKS_DIR, "guard-harvest-before-delete.sh");
export const SCOPE_SCRIPT = join(HOOKS_DIR, "check-scope-field.sh");

// ── Feature constants ─────────────────────────────────────────────────────────
export const BRANCH = "feat-f";
export const FEATURE = "f";
export const LEARNINGS_REL = `docs/${FEATURE}/LEARNINGS-${FEATURE}.md`;

// ── BASH_ABS — resolved ONCE at module load, under the PARENT env (C17) ────────
// spawnSync("bash", …, {env}) resolves the executable against the *child* env's
// PATH; the degraded rows run under an empty child PATH and would fail ENOENT at
// spawn. Resolving bash's absolute path here (parent env) and passing the script
// as argv means no PATH resolution happens in the child — the restricted env
// reaches only the script's own `command -v` probes. Falls back to /bin/bash only
// if the probe itself cannot run.
export const BASH_ABS = (() => {
  try {
    const probe = spawnSync("bash", ["-c", "command -v bash"], {
      encoding: "utf8",
    });
    const p = (probe.stdout || "").trim();
    if (probe.status === 0 && p) return p;
  } catch {
    /* fall through to fallback */
  }
  return "/bin/bash";
})();

// ── Temp-dir registry + cleanup ───────────────────────────────────────────────
const _tempDirs = [];

function makeTempDir(prefix) {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  _tempDirs.push(dir);
  return dir;
}

/**
 * Tear down every temp tree this module created. Call from afterEach() so tests
 * are order-independent and leave no residue (REQ-GUARD-05 hermeticity).
 */
export function cleanupAll() {
  while (_tempDirs.length) {
    const dir = _tempDirs.pop();
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      /* best-effort */
    }
  }
}

// ── Low-level git helper (throws on failure) ──────────────────────────────────
function git(cwd, ...args) {
  const res = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (res.status !== 0) {
    throw new Error(
      `git ${args.join(" ")} failed in ${cwd} (exit ${res.status}):\n${res.stderr || ""}`,
    );
  }
  return (res.stdout || "").trim();
}

/** git that tolerates a nonzero exit — returns the raw result. */
function gitTry(cwd, ...args) {
  return spawnSync("git", args, { cwd, encoding: "utf8" });
}

function configIdentity(repoDir) {
  git(repoDir, "config", "user.email", "test@pdlc.local");
  git(repoDir, "config", "user.name", "PDLC Test");
  git(repoDir, "config", "commit.gpgsign", "false");
  // Allow pushes/fetches over the local file-remote transport (hermetic).
  git(repoDir, "config", "protocol.file.allow", "always");
}

// ── Base tree ─────────────────────────────────────────────────────────────────
function writeFile(root, rel, content) {
  const abs = join(root, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content);
  return abs;
}

/**
 * The committed base tree shared by every git-backed state:
 *   docs/f/CROSS-REVIEW-x.md, docs/f/CODE_REVIEW-f-v1.md, docs/f/archive/…,
 *   docs/other-feature/…, docs/empty-feature/x.txt, src/foo.ts
 * `nested` additionally seeds docs/f/2024-notes/CROSS-REVIEW-x.md (M67).
 * LEARNINGS is NOT written here — each state decides its LEARNINGS disposition.
 */
function writeBaseTree(root, { nested = false } = {}) {
  writeFile(
    root,
    "docs/f/CROSS-REVIEW-x.md",
    "# Cross-Review\n\nScope: Local\n\nfindings\n",
  );
  writeFile(root, "docs/f/CODE_REVIEW-f-v1.md", "# Code Review\n\nScope: Local\n");
  writeFile(root, "docs/f/archive/notes.md", "archived notes\n");
  writeFile(
    root,
    "docs/other-feature/CROSS-REVIEW-y.md",
    "# Cross-Review\n\nScope: Local\n",
  );
  writeFile(root, "docs/empty-feature/x.txt", "placeholder\n");
  writeFile(root, "src/foo.ts", "export const foo = 1;\n");
  if (nested) {
    writeFile(
      root,
      "docs/f/2024-notes/CROSS-REVIEW-x.md",
      "# Nested Cross-Review\n\nScope: Local\n",
    );
  }
}

function writeLearningsF(root) {
  writeFile(
    root,
    LEARNINGS_REL,
    "# LEARNINGS — f\n\nScope: Local\n\ndistilled signal\n",
  );
}

function makeCleanup(dirs) {
  return () => {
    for (const d of dirs) {
      if (!d) continue;
      try {
        rmSync(d, { recursive: true, force: true });
      } catch {
        /* best-effort */
      }
    }
  };
}

/**
 * Build one hermetic git state. Returns a Fixture:
 *   { repoDir, bareDir, branch, cleanup, initSha?, secondRepoDir? }
 *
 * States: G8 (default), G6, G7, G4, G5, G2, G3, G9, G10, G10-unreachable, G1,
 *         M77, nested, secondRepo.
 *
 * @param {string} state
 * @param {{nested?: boolean}} [opts]
 * @returns {{repoDir:string, bareDir:string|null, branch:string,
 *            cleanup:()=>void, initSha?:string, secondRepoDir?:string}}
 */
export function buildFixture(state, opts = {}) {
  // ── G1: a plain directory that was NEVER `git init`ed (M37/M75/M76/M83) ──────
  if (state === "G1") {
    const repoDir = makeTempDir("guard-g1-");
    writeFile(
      repoDir,
      "docs/f/CROSS-REVIEW-x.md",
      "# Cross-Review\n\nScope: Local\n",
    );
    return {
      repoDir,
      bareDir: null,
      branch: BRANCH,
      cleanup: makeCleanup([repoDir]),
    };
  }

  const nested = state === "nested" || opts.nested === true;
  const repoDir = makeTempDir("guard-repo-");

  git(repoDir, "init", "-b", BRANCH);
  configIdentity(repoDir);
  writeBaseTree(repoDir, { nested });
  git(repoDir, "add", "-A");
  git(repoDir, "commit", "-m", "init: base tree");
  const initSha = git(repoDir, "rev-parse", "HEAD");

  // Remote / initial-push topology.
  const noRemote = state === "G2" || state === "G3";
  const noInitialPush =
    noRemote || state === "G4" || state === "G5";

  let bareDir = null;
  if (!noRemote) {
    bareDir = makeTempDir("guard-bare-");
    git(bareDir, "init", "--bare");
    git(repoDir, "remote", "add", "origin", bareDir);
  }
  if (!noInitialPush) {
    git(repoDir, "push", "-u", "origin", BRANCH);
  }

  const dirs = [repoDir, bareDir];
  const fixture = {
    repoDir,
    bareDir,
    branch: BRANCH,
    initSha,
    cleanup: makeCleanup(dirs),
  };

  const commitLearningsF = () => {
    writeLearningsF(repoDir);
    git(repoDir, "add", "-A");
    git(repoDir, "commit", "-m", "chore: LEARNINGS-f");
  };

  switch (state) {
    case "G8": // default — LEARNINGS on disk only
    case "nested": // default + nested review file (M67)
      writeLearningsF(repoDir);
      break;

    case "G6": // committed AND pushed → VERIFIED
      commitLearningsF();
      git(repoDir, "push", "origin", BRANCH);
      break;

    case "G7": // committed, NOT pushed
      commitLearningsF();
      break;

    case "G4": // origin exists, origin/feat-f absent; LEARNINGS committed
      commitLearningsF();
      break;

    case "G5": // origin exists, origin/feat-f absent; LEARNINGS disk only
      writeLearningsF(repoDir);
      break;

    case "G2": // no remote; LEARNINGS committed
      commitLearningsF();
      break;

    case "G3": // G2 + detached HEAD
      commitLearningsF();
      git(repoDir, "checkout", "--detach");
      break;

    case "G9": // wrong-named LEARNINGS committed+pushed; LEARNINGS-f.md absent (M36)
      writeFile(
        repoDir,
        `docs/${FEATURE}/LEARNINGS-other.md`,
        "# LEARNINGS other\n\nScope: Local\n",
      );
      git(repoDir, "add", "-A");
      git(repoDir, "commit", "-m", "chore: LEARNINGS-other");
      git(repoDir, "push", "origin", BRANCH);
      break;

    case "G10": // committed+pushed, then STALE local tracking ref (M58/M59)
    case "G10-unreachable": {
      commitLearningsF();
      git(repoDir, "push", "origin", BRANCH);
      // Rewind the LOCAL remote-tracking ref to the pre-LEARNINGS commit; remote
      // truth (the bare repo) still carries the LEARNINGS commit.
      git(
        repoDir,
        "update-ref",
        `refs/remotes/origin/${BRANCH}`,
        initSha,
      );
      if (state === "G10-unreachable") {
        // Fetch must fail fast + hermetically (no network).
        git(repoDir, "remote", "set-url", "origin", "/nonexistent-remote-path");
      }
      break;
    }

    case "M77": {
      // Default (G8) + corrupt the LOOSE OBJECT behind origin/feat-f (C18/DEC-04):
      // show-ref/symbolic-ref/rev-parse stay unaffected (clean ref), but the
      // remote-tree ls-tree query fails exit 128 with `fatal: loose object …
      // is corrupt` — a true § 3.6 query failure that must route NOT_COMMITTED,
      // never exit 0. Fixture repos never gc/repack, so the object is loose.
      writeLearningsF(repoDir);
      const sha = git(repoDir, "rev-parse", `origin/${BRANCH}`);
      const objPath = join(
        repoDir,
        ".git",
        "objects",
        sha.slice(0, 2),
        sha.slice(2),
      );
      chmodSync(objPath, 0o644);
      writeFileSync(
        objPath,
        Buffer.from("corrupt-not-a-zlib-stream-\x00\x01\x02\xff garbage"),
      );
      // Builder self-check: throw unless the probe actually fails as designed.
      assertM77ProbeFails(fixture);
      break;
    }

    case "secondRepo": {
      // Default (G8) main repo + a second, guarded-directory-free git repo (M86).
      writeLearningsF(repoDir);
      const secondRepoDir = makeTempDir("guard-repo2-");
      git(secondRepoDir, "init", "-b", BRANCH);
      configIdentity(secondRepoDir);
      writeFile(secondRepoDir, "src/bar.ts", "export const bar = 2;\n");
      git(secondRepoDir, "add", "-A");
      git(secondRepoDir, "commit", "-m", "init: second repo");
      fixture.secondRepoDir = secondRepoDir;
      fixture.cleanup = makeCleanup([...dirs, secondRepoDir]);
      break;
    }

    default:
      throw new Error(`buildFixture: unknown state "${state}"`);
  }

  return fixture;
}

/**
 * M77 builder self-check (also exported for the self-check test). Runs the exact
 * § 3.6 remote-tree probe and THROWS unless it fails nonzero with non-empty
 * stderr — making the fixture loud against git-version drift, object packing, or
 * ref-backend changes. On a HEALTHY repo the probe succeeds (exit 0), so this
 * throws — which is the invariant the self-check test pins.
 *
 * @param {{repoDir:string, branch:string}} fixture
 */
export function assertM77ProbeFails(fixture) {
  const res = gitTry(
    fixture.repoDir,
    "ls-tree",
    "--name-only",
    `origin/${fixture.branch}`,
    "--",
    LEARNINGS_REL,
  );
  const failedAsDesigned =
    res.status !== 0 && (res.stderr || "").trim() !== "";
  if (!failedAsDesigned) {
    throw new Error(
      "M77 fixture self-check FAILED: the ls-tree probe did not fail as " +
        `designed (exit ${res.status}, stderr="${(res.stderr || "").trim()}"). ` +
        "The corrupt-loose-object query-failure branch is not being exercised — " +
        "the fixture has drifted (git version, object packing, or ref backend).",
    );
  }
}

// ── degradedEnv() ─────────────────────────────────────────────────────────────
/**
 * A child env whose PATH points at an EMPTY directory — no interpreters, no
 * external binaries resolvable (M42–M43, M68–M72). An empty mkdtemp dir, not
 * /var/empty, for Linux-CI portability. Spawn via BASH_ABS so the restricted
 * PATH reaches only the script's own probes (C17).
 * @returns {{PATH:string}}
 */
export function degradedEnv() {
  const empty = makeTempDir("guard-degraded-");
  return { PATH: empty };
}

// ── runGuard ──────────────────────────────────────────────────────────────────
/**
 * Invoke guard-harvest-before-delete.sh via the BASH_ABS absolute-path discipline.
 *
 * @param {object|null} fixture  a buildFixture() result, or null for a non-fixture run
 * @param {object} o
 * @param {string} [o.command]   assembled into {tool_input:{command}, cwd?}
 * @param {string} [o.stdinRaw]  passed to stdin VERBATIM (overrides o.command)
 * @param {string} [o.stdinCwd]  top-level `cwd` field of the assembled JSON
 * @param {string} [o.spawnCwd]  child cwd; default = fixture.repoDir
 *                               (fixture===null → fresh scratch dir); NEVER process.cwd()
 * @param {object} [o.env]       merged over the base env; CLAUDE_PROJECT_DIR
 *                               defaults to fixture.repoDir and is unsettable via
 *                               {CLAUDE_PROJECT_DIR: undefined} (C11)
 * @returns {{exitCode:number, stdout:string, stderr:string}}
 */
export function runGuard(fixture, o = {}) {
  // Assemble stdin.
  let input;
  if (o.stdinRaw !== undefined) {
    input = o.stdinRaw;
  } else {
    const payload = { tool_input: { command: o.command } };
    if (o.stdinCwd !== undefined) payload.cwd = o.stdinCwd;
    input = JSON.stringify(payload);
  }

  // Assemble env. CLAUDE_PROJECT_DIR defaults to the fixture repo; an explicit
  // undefined in o.env drops it (C11 — Node's spawnSync omits undefined entries).
  const env = { ...process.env };
  if (fixture && fixture.repoDir) env.CLAUDE_PROJECT_DIR = fixture.repoDir;
  if (o.env) Object.assign(env, o.env);

  // Resolve child cwd — never process.cwd() (TE TSPEC F-09).
  let spawnCwd;
  if (o.spawnCwd !== undefined) {
    spawnCwd =
      isAbsolute(o.spawnCwd) || !fixture
        ? o.spawnCwd
        : join(fixture.repoDir, o.spawnCwd);
  } else if (fixture && fixture.repoDir) {
    spawnCwd = fixture.repoDir;
  } else {
    spawnCwd = makeTempDir("guard-scratch-");
  }

  const res = spawnSync(BASH_ABS, [GUARD_SCRIPT], {
    input,
    encoding: "utf8",
    env,
    cwd: spawnCwd,
  });
  return {
    exitCode: res.status ?? -1,
    stdout: res.stdout || "",
    stderr: res.stderr || "",
  };
}

// ── runScopeCheck ─────────────────────────────────────────────────────────────
/**
 * Companion runner for the S-rows: writes `content` to `filePath`, then invokes
 * check-scope-field.sh via the BASH_ABS absolute-path discipline (PROPERTIES Δ4 —
 * required so the degraded scope case can start under an empty child PATH; harmless
 * for the full-runtime S-rows).
 *
 * @param {string} filePath   absolute path of the review file under test
 * @param {string} [content]  written to filePath when provided
 * @param {{env?:object, cwd?:string}} [opts]
 * @returns {{exitCode:number, stdout:string, stderr:string}}
 */
export function runScopeCheck(filePath, content, opts = {}) {
  if (content !== undefined) {
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, content);
  }
  const input = JSON.stringify({ tool_input: { file_path: filePath } });
  const env = { ...process.env, ...(opts.env || {}) };
  const res = spawnSync(BASH_ABS, [SCOPE_SCRIPT], {
    input,
    encoding: "utf8",
    env,
    cwd: opts.cwd || dirname(filePath),
  });
  return {
    exitCode: res.status ?? -1,
    stdout: res.stdout || "",
    stderr: res.stderr || "",
  };
}

// ── Oracle assertions ─────────────────────────────────────────────────────────
/**
 * BLOCK oracle (§ 6.3): exit 2 + `pdlc-guard[<REASON>]` prefix on stderr + every
 * required substring present. Uses the ambient jest `expect` global.
 */
export function expectBlock(res, reason, substrings = []) {
  expect(res.exitCode).toBe(2);
  expect(res.stderr.startsWith(`pdlc-guard[${reason}]`)).toBe(true);
  for (const s of substrings) {
    expect(res.stderr).toContain(s);
  }
}

/**
 * ALLOW oracle — strengthened per PROPERTIES Δ1 (supersedes the TSPEC § 6.2 /
 * PLAN TASK-02 exit-0-only spec): exit 0 AND empty stdout AND empty stderr
 * (TSPEC § 3.3 allow-silence contract, PROP-MSG-02).
 */
export function expectAllow(res) {
  expect(res.exitCode).toBe(0);
  expect(res.stdout).toBe("");
  expect(res.stderr).toBe("");
}
