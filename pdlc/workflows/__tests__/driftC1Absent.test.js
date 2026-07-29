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
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

import {
  MESSAGES,
  expectRemediationClass,
  makeToolDir,
  remediationOf,
  splitStderrLines,
} from "./helpers/driftHarness.js";

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

/**
 * The catalogue assertion for a C1-availability gate (CROSS-REVIEW-se-codebase-v2.md G-03).
 *
 * Replaces the ad-hoc `expect(run.stderr).toMatch(/^pdlc: /m)` this suite used to carry, which
 * `helpers/driftHarness.js` explicitly forbids ("this is the only sanctioned route to stderr; no
 * test greps stderr with an ad-hoc regex") and which passed for *any* `pdlc: ` line — it pinned
 * neither the message's identity, nor its content, nor which script produced it.
 *
 * Three conjuncts:
 *   1. the line matches its catalogue id's shape exactly (FSPEC §8.3 N-9 / N-10), including the
 *      interpolated library path and the name of the first missing function;
 *   2. `splitStderrLines` — the harness's structured view, fixed under F-04 to classify against
 *      the real `MESSAGES` table — actually classifies it as a NOTICE rather than silently
 *      dropping it, which is precisely the side effect G-03 identified;
 *   3. its remediation belongs to the `pluginUpdate` class (§8.1: never recommend sync for a
 *      condition sync cannot fix, and never recommend manual deletion).
 *
 * @param {{stderr:string}} run
 * @param {"N-9"|"N-10"} id
 * @param {{scripts:string}} install
 * @param {string} expectedFn the first probed name the fixture does NOT define — pins the gate's
 *   probe order as well as the message's `{fn}` substitution
 */
function expectC1UnavailableNotice(run, id, install, expectedFn) {
  const match = MESSAGES[id].exec(run.stderr);
  expect(match).not.toBeNull();
  // The gate names the library it could not use and the first probed function it could not find.
  expect(match.groups.path).toBe(join(install.scripts, "lib", "pdlc-drift.sh"));
  expect(match.groups.fn).toBe(expectedFn);

  // The other gate's id must NOT match — one script, one identity.
  const otherId = id === "N-9" ? "N-10" : "N-9";
  expect(MESSAGES[otherId].test(run.stderr)).toBe(false);

  // G-03's real side effect: an uncatalogued line falls into neither bucket and vanishes from
  // `RunResult`. Both gates must now be visible in the structured view.
  const { notices, warnings } = splitStderrLines(run.stderr);
  expect(notices).toHaveLength(1);
  expect(MESSAGES[id].test(notices[0])).toBe(true);
  expect(warnings).toEqual([]);

  // §8.1: the condition is not sync-fixable, so the remediation must say "update the plugin" and
  // must not name the sync command or `--force`.
  expectRemediationClass(remediationOf(run.stderr, id), "pluginUpdate", {
    syncCmd: join(install.scripts, "sync-workflows.sh"),
  });
}

// The union of BOTH gates' probe lists (`check-workflow-drift.sh:76-80`'s 16 names and
// `sync-workflows.sh:53-59`'s 18 names — they overlap but are not identical, e.g. only sync
// probes `pdlc_classify_row`/`pdlc_backup`/`pdlc_copy_artifact`/`pdlc_retire`/
// `pdlc_write_sync_manifest`, only the hook probes `pdlc_msg_w2`/`pdlc_msg_w5`), with only the
// name common to both lists' final position — `pdlc_msg_w7` — omitted.
//
// CROSS-REVIEW-se-codebase-v2.md G-05: the two cases above both trip on an EARLY probed name (the
// first or second entry), so most of each gate's list was never exercised. This fixture pins the
// far end instead: every OTHER name either gate probes is present, so each loop must run all the
// way to the end before it can report anything missing, and what it reports must be `pdlc_msg_w7`
// exactly — which is the position each gate's rationale (comments at `check-workflow-drift.sh:69-
// 70` and `sync-workflows.sh:43-46`) depends on. Sharing one fixture across both `C1_CASES` loops
// (F-01's hook assertions and F-02's sync assertions) needs the union, not either list alone.
const C1_ALMOST_COMPLETE_MISSING_W7 = [
  "PDLC_DRIFT_LIB_SOURCED=1",
  "pdlc_load_manifest() { :; }",
  "pdlc_probe_hash_tool() { :; }",
  "pdlc_classify_all() { :; }",
  "pdlc_classify_row() { :; }",
  "pdlc_fault_unrecognised_seen() { :; }",
  "pdlc_trace() { :; }",
  "_pdlc_split_on() { :; }",
  "_pdlc_write_failure_op_is_stderr_only() { :; }",
  "pdlc_sync_command() { :; }",
  "pdlc_backup() { :; }",
  "pdlc_copy_artifact() { :; }",
  "pdlc_retire() { :; }",
  "pdlc_write_sync_manifest() { :; }",
  "pdlc_write_drift_state() { :; }",
  "pdlc_msg_w1() { :; }",
  "pdlc_msg_w2() { :; }",
  "pdlc_msg_w3() { :; }",
  "pdlc_msg_w4() { :; }",
  "pdlc_msg_w5() { :; }",
  "pdlc_msg_w6() { :; }",
  // `pdlc_msg_w7` deliberately OMITTED — this is the whole point of the fixture.
  "",
].join("\n");

// [label, libContent, firstMissingProbedName] — the third element is what both gates report as
// `{fn}`, and both gates probe `pdlc_load_manifest` first, so it also pins the probe order.
const C1_CASES = [
  ["C1 absent (no lib/ directory at all)", undefined, "pdlc_load_manifest"],
  // A truncated / partially-written C1: the idempotent-source guard's variable is set and one
  // early function exists, but the layers that define the classifier and the writer never
  // landed. Sourcing SUCCEEDS here, so tolerating the `source`'s exit status is not enough.
  [
    "C1 corrupt (sources cleanly but defines almost nothing)",
    'PDLC_DRIFT_LIB_SOURCED=1\npdlc_load_manifest() { :; }\n',
    "pdlc_probe_hash_tool",
  ],
  // G-05's fixture: names 1-15 present, only `pdlc_msg_w7` (the last, 16th) missing.
  ["C1 almost complete (only pdlc_msg_w7 missing)", C1_ALMOST_COMPLETE_MISSING_W7, "pdlc_msg_w7"],
];

describe("F-01 / AC-2.4 — the hook exits 0 when C1 is missing or corrupt", () => {
  for (const [label, libContent, firstMissing] of C1_CASES) {
    it(`exits 0 and says something useful — ${label}`, () => {
      const install = makeBrokenInstall(libContent);
      try {
        const run = runBroken(install, "check-workflow-drift.sh", [], "{}");
        // AC-2.4 is absolute: a broken drift check never blocks a session from starting.
        expect(run.status).toBe(0);
        // AC-2.2's "silence means verified" must not be inverted into "silence means broken",
        // and the operator must not be handed raw bash diagnostics.
        expectC1UnavailableNotice(run, "N-9", install, firstMissing);
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
  for (const [label, libContent, firstMissing] of C1_CASES) {
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
          expectC1UnavailableNotice(run, "N-10", install, firstMissing);
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

// ═════════════════════ G-02 — the EXIT arm of the hook's trap, made falsifiable ═════════════════
//
// `check-workflow-drift.sh` carries `trap 'exit 0' ERR EXIT`. The EXIT arm is the load-bearing
// one: under `set -u` a fatal unbound-variable error does NOT fire ERR, it kills the shell —
//     bash -c 'set -u; trap "exit 0" ERR; echo $UNSET'   → rc 127, trap never runs
//     bash -c 'set -u; trap "exit 0" EXIT; echo $UNSET'  → rc 0
//
// CROSS-REVIEW-se-codebase-v2.md G-02 measured that reverting line 43 to `trap 'exit 0' ERR` left
// all eight tests above GREEN: both `C1_CASES` exit 0 through the availability gate, which returns
// *before* any code that can reach a `set -u` fatal, so the trap is never consulted at all.
//
// The fixture below is the missing third class — C1 present and COMPLETE (every gated name is
// defined, so the availability gate passes) but semantically broken. `pdlc_load_manifest` unsets
// `PDLC_ROWS_ID`, which the seeding loop had just declared; the hook then reaches
// `_pdlc_n_rows=${#PDLC_ROWS_ID[@]}` and dies of a `set -u` fatal. That fatal is reachable ONLY
// with a complete-but-broken C1, and it is the only place in this suite where the trap decides the
// exit code.
//
// ACCEPTANCE MEASUREMENT (recorded per the project's non-vacuity rule): deleting ` EXIT` from
// `check-workflow-drift.sh`'s trap line turns this test RED (received exit 1, AC-2.4 violated);
// restoring it turns it GREEN.
const C1_COMPLETE_BUT_BROKEN = [
  "PDLC_DRIFT_LIB_SOURCED=1",
  // The gate's 16 probed names, all present — so the gate passes and execution continues.
  // This one is the sabotage: it removes an array the code below `set -u`-reads unconditionally.
  "pdlc_load_manifest() { unset PDLC_ROWS_ID; }",
  "pdlc_probe_hash_tool() { PDLC_HASH_BIN=shasum; }",
  "pdlc_classify_all() { :; }",
  "pdlc_fault_unrecognised_seen() { return 1; }",
  "pdlc_trace() { :; }",
  "_pdlc_split_on() { :; }",
  "_pdlc_write_failure_op_is_stderr_only() { return 1; }",
  "pdlc_sync_command() { printf '%s' ''; }",
  "pdlc_write_drift_state() { :; }",
  "pdlc_msg_w1() { printf '%s' 'w1'; }",
  "pdlc_msg_w2() { printf '%s' 'w2'; }",
  "pdlc_msg_w3() { printf '%s' 'w3'; }",
  "pdlc_msg_w4() { printf '%s' 'w4'; }",
  "pdlc_msg_w5() { printf '%s' 'w5'; }",
  "pdlc_msg_w6() { printf '%s' 'w6'; }",
  "pdlc_msg_w7() { printf '%s' 'w7'; }",
  // Not a gated name (PROP-SEAM-02 forbids listing it), but the hook calls it, so the stub must
  // define it or the mkdir branch degrades for an unrelated reason.
  "pdlc_fault_active() { return 1; }",
  "",
].join("\n");

describe("G-02 / AC-2.4 — the EXIT trap arm keeps the hook at exit 0 through a `set -u` fatal", () => {
  it("exits 0 when a complete-but-broken C1 makes the hook die of an unbound variable", () => {
    const install = makeBrokenInstall(C1_COMPLETE_BUT_BROKEN);
    try {
      const run = runBroken(install, "check-workflow-drift.sh", [], "{}");

      // The availability gate must NOT be what ends this run — if it were, the fixture would be
      // testing the same path as the eight tests above and the trap would again go unexercised.
      expect(MESSAGES["N-9"].test(run.stderr)).toBe(false);
      // The witness that we really did reach a `set -u` fatal: bash's own diagnostic. (Unlike the
      // gated cases, raw diagnostics are EXPECTED here — this is the unanticipated-internal-error
      // path the trap exists for, not the anticipated broken-install path the catalogue covers.)
      expect(run.stderr).toMatch(/PDLC_ROWS_ID.*unbound variable/);

      // AC-2.4 is absolute: a SessionStart hook that exits non-zero blocks the session. Only the
      // EXIT arm delivers this — ERR alone yields 1 here.
      expect(run.status).toBe(0);
    } finally {
      install.cleanup();
    }
  });
});

// ═════════════════════ G-05 — the gate's rationale, converted from comment to assertion ═════════
//
// `check-workflow-drift.sh:69-70`'s comment states `pdlc_msg_w7` is probed last because it is C1's
// own LAST definition, so its presence also witnesses that C1 was read to the end (C1's layers are
// append-only). Nothing enforced that claim — a future append to C1 (`lib/pdlc-drift.sh`) past
// `pdlc_msg_w7` would silently demote the witness to a mid-file probe, and the gate would quietly
// stop detecting truncation past that new point. This turns the comment into a guard: it fails the
// instant C1 gains a function definition after `pdlc_msg_w7` without the gate list being revisited.
describe("G-05 — pdlc_msg_w7 is C1's last function definition (the gate's rationale)", () => {
  it("the last `^pdlc_...()`-shaped definition in lib/pdlc-drift.sh is pdlc_msg_w7", () => {
    const c1Source = readFileSync(join(HOOKS_SCRIPTS_DIR, "lib", "pdlc-drift.sh"), "utf8");
    const definitions = [...c1Source.matchAll(/^pdlc_[a-z0-9_]*\(\)/gm)];
    expect(definitions.length).toBeGreaterThan(0);
    expect(definitions[definitions.length - 1][0]).toBe("pdlc_msg_w7()");
  });
});
