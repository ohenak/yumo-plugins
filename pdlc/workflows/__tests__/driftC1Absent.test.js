/**
 * driftC1Absent.test.js — the broken-install suite: C1 (`lib/pdlc-drift.sh`) missing or corrupt.
 *
 * Phase CR remediation, findings F-01 (High) and F-02 (Medium).
 *
 * Both entrypoints source C1 from their own directory. A partial plugin install — an
 * interrupted copy, an unreadable `lib/`, a truncated file — leaves the entrypoint present and
 * C1 absent. `check-workflow-drift.sh:47` (`source … 2>/dev/null || true`) asserts that this
 * case is in scope; nothing tested it, and both entrypoints exited **1** in it:
 *
 *   - AC-2.4 is P0-absolute: "the hook exits 0 always". A SessionStart hook that exits 1
 *     because the plugin tree is incomplete degrades every session in that consumer.
 *   - FSPEC §5.8 / PLAN T-37: the sync entrypoint exits 0/2/3/4, **never 1**. Exit 1 is the
 *     "sync-fixable drift" class, so exiting 1 tells the operator to run a sync that cannot
 *     possibly fix a missing library. Exit **3** is the correct class here: nothing could be
 *     verified (no baseline resolvable) and no write was attempted, so 4 cannot apply.
 *
 * These cases cannot use `driftHarness.runScript`: it always invokes the plugin's own scripts
 * in place (`HOOKS_SCRIPTS_DIR`), where `lib/pdlc-drift.sh` is by construction present. The
 * subject here is a *relocated copy* of the entrypoint whose sibling `lib/` is absent or
 * broken, so the spawn is local to this file. `makeToolDir` is reused so the PATH sandbox is
 * identical to the rest of the drift suite.
 */

import { execFileSync, spawnSync } from "child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

import { makeToolDir } from "./helpers/driftHarness.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOOKS_SCRIPTS_DIR = resolve(__dirname, "../../hooks/scripts");

const PATH_TOOLS = [
  "bash",
  "git",
  "python3",
  "shasum",
  "sha1sum",
  "mv",
  "rm",
  "date",
  "printf",
  "mkdir",
];

/**
 * A relocated, deliberately incomplete plugin install.
 *
 * @param {string|undefined} libContent
 *   `undefined` → no `lib/` directory at all (C1 absent).
 *   a string    → `lib/pdlc-drift.sh` exists with exactly these bytes (C1 corrupt/partial).
 */
function makeBrokenInstall(libContent) {
  const root = mkdtempSync(join(tmpdir(), "pdlc-broken-install-"));
  const scripts = join(root, "scripts");
  mkdirSync(scripts, { recursive: true });
  for (const name of ["check-workflow-drift.sh", "sync-workflows.sh"]) {
    copyFileSync(join(HOOKS_SCRIPTS_DIR, name), join(scripts, name));
  }
  if (libContent !== undefined) {
    mkdirSync(join(scripts, "lib"), { recursive: true });
    writeFileSync(join(scripts, "lib", "pdlc-drift.sh"), libContent);
  }

  const consumer = join(root, "consumer");
  mkdirSync(consumer, { recursive: true });
  execFileSync("git", ["init", "-q", "."], { cwd: consumer });

  const home = join(root, "home");
  mkdirSync(home, { recursive: true });

  return {
    scripts,
    consumer,
    home,
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
}

function runBroken(install, script, args, stdin) {
  const result = spawnSync("bash", [join(install.scripts, script), ...args], {
    encoding: "utf8",
    cwd: install.consumer,
    env: {
      PATH: makeToolDir(PATH_TOOLS),
      HOME: install.home,
      PWD: install.consumer,
      TMPDIR: tmpdir(),
      LC_ALL: "C",
      LANG: "C",
      TZ: "UTC",
    },
    ...(stdin !== undefined ? { input: stdin } : {}),
  });
  return {
    status: result.status ?? -1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

/** Raw bash diagnostics the operator must never be handed instead of the message catalogue. */
const RAW_BASH_DIAGNOSTICS = [/unbound variable/, /command not found/, /No such file or directory/];

const C1_CASES = [
  ["C1 absent (no lib/ directory at all)", undefined],
  // A truncated / partially-written C1: the idempotent-source guard's variable is set and one
  // early function exists, but the layers that define the classifier and the writer never
  // landed. Sourcing SUCCEEDS here, so tolerating the `source`'s exit status is not enough.
  [
    "C1 corrupt (sources cleanly but defines almost nothing)",
    'PDLC_DRIFT_LIB_SOURCED=1\npdlc_load_manifest() { :; }\n',
  ],
];

describe("F-01 / AC-2.4 — the hook exits 0 when C1 is missing or corrupt", () => {
  for (const [label, libContent] of C1_CASES) {
    it(`exits 0 and says something useful — ${label}`, () => {
      const install = makeBrokenInstall(libContent);
      try {
        const run = runBroken(install, "check-workflow-drift.sh", [], "{}");
        // AC-2.4 is absolute: a broken drift check never blocks a session from starting.
        expect(run.status).toBe(0);
        // AC-2.2's "silence means verified" must not be inverted into "silence means broken",
        // and the operator must not be handed raw bash diagnostics.
        expect(run.stderr).toMatch(/^pdlc: /m);
        for (const pattern of RAW_BASH_DIAGNOSTICS) {
          expect(run.stderr).not.toMatch(pattern);
        }
      } finally {
        install.cleanup();
      }
    });
  }
});

describe("F-02 / FSPEC §5.8 — sync never exits 1 when C1 is missing or corrupt", () => {
  for (const [label, libContent] of C1_CASES) {
    for (const [entrypoint, args] of [
      ["--check", ["--check"]],
      ["plain sync", []],
      ["--force", ["--force"]],
    ]) {
      it(`${entrypoint} exits 3, never 1 — ${label}`, () => {
        const install = makeBrokenInstall(libContent);
        try {
          const run = runBroken(install, "sync-workflows.sh", args);
          // FSPEC §5.8: the sync entrypoint's exit codes are 0/2/3/4. Exit 1 is the
          // "sync-fixable drift" class and a missing library is not sync-fixable.
          expect([0, 2, 3, 4]).toContain(run.status);
          // §5.8's 3/4 boundary: nothing could be verified and no write was attempted.
          expect(run.status).toBe(3);
          expect(run.stderr).toMatch(/^pdlc: /m);
          for (const pattern of RAW_BASH_DIAGNOSTICS) {
            expect(run.stderr).not.toMatch(pattern);
          }
        } finally {
          install.cleanup();
        }
      });
    }
  }
});
