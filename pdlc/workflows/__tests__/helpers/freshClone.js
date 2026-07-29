/**
 * freshClone.js — TSPEC §9.1 (O-12): `makeFreshClone()`, the AT-24 bootstrap fixture.
 *
 * Five steps, each load-bearing (see TSPEC §9.1 for the full rationale table):
 *   1. `cp -R` the **working tree** (not `git clone`, not `git archive`) into a fresh
 *      `mkdtemp`, excluding `.git/`, `node_modules/`, and `.claude/workflows/`. `cp -R`
 *      preserves the on-disk execute bit rather than setting it, so step 2's replay has
 *      something independent to check against.
 *   2. Replay index modes: for every path the **live** `git ls-files -s` reports as mode
 *      `100755`, `chmod +x` the copy — belt-and-braces against a `cp` that drops mode bits
 *      or a `core.fileMode=false` checkout.
 *   3. `git init -b main`, then `git add -A` and a single commit with `-c` config passed
 *      inline (never written to the runner's global config) — so the fixture has a `HEAD`.
 *   4. `home := mkdtemp` **sibling** of `root`, nothing written into it — the guard that lets
 *      AT-24 assert nothing was written under `$HOME` across either command.
 *   5. Every returned path passes through `realpathSync` — `tmpdir()` is a symlink on macOS,
 *      and AT-24 compares the resolved `<repoRoot>` against the fixture root.
 *
 * `pdlc/workflows/dist/` is deliberately **not** excluded — it is tracked and committed
 * post-landing, so a real fresh clone has it (§9.1).
 */

import { execFileSync } from "child_process";
import { existsSync, mkdtempSync, realpathSync, rmSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// __dirname = pdlc/workflows/__tests__/helpers; four levels up is the repo root.
const LIVE_REPO_ROOT = resolve(__dirname, "..", "..", "..", "..");

// TSPEC §9.1 step 1's exclusions, as paths relative to the repo root.
const EXCLUDED_RELATIVE_PATHS = [".git", "pdlc/workflows/node_modules", ".claude/workflows"];

const FIXTURE_COMMIT_CONFIG = [
  "-c",
  "user.email=pdlc-fresh-clone@example.invalid",
  "-c",
  "user.name=pdlc-fresh-clone",
];

/**
 * @param {string} liveRoot the repo root to copy the working tree from
 * @returns {string[]} every path (relative to `liveRoot`) whose git index mode is `100755`
 */
function listExecutablePaths(liveRoot) {
  const out = execFileSync("git", ["ls-files", "-s"], { cwd: liveRoot, encoding: "utf8" });
  const paths = [];
  for (const line of out.split("\n")) {
    if (line.length === 0) continue;
    const fields = line.split(/\s+/);
    const mode = fields[0];
    // `git ls-files -s` lines are `<mode> <sha> <stage>\t<path>`; the path may itself
    // contain spaces, so split the tab rather than re-joining the whitespace fields.
    const tabIndex = line.indexOf("\t");
    const path = line.slice(tabIndex + 1);
    if (mode === "100755") paths.push(path);
  }
  return paths;
}

/**
 * Builds a fresh, no-plugin-installed clone fixture for AT-24 (TSPEC §9.1, O-12).
 *
 * @returns {{ root: string, home: string, cleanup: () => void }}
 */
export function makeFreshClone() {
  const parent = mkdtempSync(join(tmpdir(), "pdlc-fresh-clone-"));

  // Step 4: `home` is a sibling mkdtemp of `root` — created alongside it, under the same
  // parent, so neither can be an ancestor of the other and nothing is ever written into it.
  const rootDir = mkdtempSync(join(parent, "root-"));
  const homeDir = mkdtempSync(join(parent, "home-"));

  // Step 1: `cp -R` the working tree's contents into the fresh root.
  execFileSync("cp", ["-R", `${LIVE_REPO_ROOT}/.`, rootDir]);
  for (const rel of EXCLUDED_RELATIVE_PATHS) {
    rmSync(join(rootDir, rel), { recursive: true, force: true });
  }

  // Step 2: replay index modes from the live repo's `git ls-files -s`. Paths under an
  // excluded directory were just removed above and are skipped rather than chmod'd.
  for (const rel of listExecutablePaths(LIVE_REPO_ROOT)) {
    const target = join(rootDir, rel);
    if (existsSync(target)) {
      execFileSync("chmod", ["+x", target]);
    }
  }

  // Step 3: give the fixture a HEAD, config passed with `-c` only — never the runner's
  // global git config.
  execFileSync("git", ["init", "-b", "main"], { cwd: rootDir });
  execFileSync("git", ["add", "-A"], { cwd: rootDir });
  execFileSync("git", [...FIXTURE_COMMIT_CONFIG, "commit", "-q", "-m", "fixture: fresh clone"], {
    cwd: rootDir,
  });

  // Step 5: normalise every returned path through `realpathSync` (`tmpdir()` is a symlink
  // on macOS).
  const root = realpathSync(rootDir);
  const home = realpathSync(homeDir);

  return {
    root,
    home,
    cleanup() {
      rmSync(parent, { recursive: true, force: true });
    },
  };
}
