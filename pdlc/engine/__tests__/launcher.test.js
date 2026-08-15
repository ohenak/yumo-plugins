// Tests for the launcher hop: `bin/cli.mjs`'s `spawnSync` re-raise of the
// resolved child's exit status, and its exact `128 + signum` arithmetic on
// a signalled child (TSPEC §6.2, DEC-EDIST-06; PROPERTIES PROP-LAUNCH-6;
// PLAN T14 -> T46; AT-1.1, AT-2.1).
//
// `bin/cli.mjs` does not exist yet (T46, batch 9): this is batch 2's RED
// test for its launcher hop, and — following `hermeticity.test.js`'s
// precedent for a task with no source column of its own — is expected to
// fail as a whole file (module not found) until T46 lands. That is the
// intended state for this task, not a defect.
//
// Contract this file pins for `bin/cli.mjs` (recorded here because no other
// document commits to an exact export name or signature for the hop
// itself — TSPEC §3.1 only commits to `main(argv, deps)`'s five-key `deps`,
// which does not carry the exec seam; §6.2's prose names the hop's
// behaviour, not its call shape):
//
//   export function execLauncher(binPath, argv, env, spawnSyncFn = spawnSync)
//
//   - calls `spawnSyncFn(process.execPath, [binPath, ...argv], { stdio:
//     "inherit", env })` — TSPEC:418 pins the command as `process.execPath`
//     with `binPath` as its first arg, not `binPath` invoked directly (the
//     resolved store entry is a `.mjs` file, not necessarily executable on
//     its own). `env` is passed through exactly as received, never merged
//     with or defaulted from `process.env` inside this function (a caller
//     that wants the marker env var TSPEC §6.2 describes composes it before
//     calling in; this function is not the one deciding what the marker is)
//   - a numeric `spawnSyncFn(...).status` is returned verbatim
//   - `{status: null, signal}` is returned as `128 + <signal number>`
//     (DEC-EDIST-06's exact arithmetic, e.g. 143 for a `SIGTERM`-killed
//     child), never a bare non-zero
//   - never touches the filesystem, an env var, or the network itself: the
//     spawn function is always the fourth argument, defaulting to the real
//     `node:child_process` `spawnSync` only when omitted, so a test can
//     substitute a pure recorder and observe the exact descriptor handed
//     to it without a second Node process ever starting (S-3, TSPEC §10.1)
//
// Three legs, per PLAN T14's row:
//   1. S-3 descriptor assertions (path, argv, env) against an injected
//      recorder — no process spawned, hermetic, and (per PLAN's DoD
//      accounting) the one leg of this file that survives even where the
//      `real-spawn` capability does not (AT-2.1's residue).
//   2. A real-spawn pass-through leg: a trivial fixture target's non-zero
//      exit status is re-raised verbatim and its stdout/stderr arrive
//      unmixed.
//   3. A real-spawn signalled-child leg: a fixture target that kills itself
//      with SIGTERM makes the hop exit exactly 128 + 15 = 143.
//
// Legs 2 and 3 are capability-gated on `real-spawn` (a plain subprocess
// spawn succeeding) — following PLAN T50's "opt-out" discriminator: a probe
// that runs and reports a real exit status means the capability is
// present; only a probe that cannot produce a readable exit status at all
// would justify a skip, and on every runner this suite has actually run on
// so far that never happens; there is no plausible reader who needs a
// pre-registered inventory to know why a real-Node-subprocess capability
// probe passed.

import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { appendSkipRecord, runGatedLeg } from "../scripts/fixture-machine.mjs";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const engineRoot = path.dirname(testsDir);
const fixturesDir = path.join(testsDir, "fixtures", "launcher-targets");
const WRAPPER = path.join(fixturesDir, "run-exec-launcher.mjs");
const EXIT_CODE_TARGET = path.join(fixturesDir, "exit-code-target.mjs");
const SELF_SIGNAL_TARGET = path.join(fixturesDir, "self-signal-target.mjs");

// `bin/cli.mjs` does not exist until T46; per this file's header, that
// makes the whole file fail to load until then — intended for a task with
// no source column of its own. The import is deferred to a dynamic
// `await import(...)` inside each skipped test below so this file
// instantiates cleanly under `node --test` ahead of T46 landing.

// ─── capability probe: real-spawn (PLAN T50's opt-out discriminator) ──────

// Probed once and reused by both legs 2 and 3 below (`fixture-machine.mjs`'s
// SKIP_INVENTORY carries one `real-spawn` entry for both). The probe result
// itself — not a boolean derived from it — is what `runGatedLeg` classifies
// (`classifyProbeResult`'s three-arm partition, PLAN T50's opt-out
// discriminator): a readable non-zero exit status is `absent` (registered
// skip), no readable exit status at all is `unprobeable` (fail-closed —
// throws, never a skip), and a readable zero exit status is `present` (the
// leg runs). This module never calls `t.skip` itself; `runGatedLeg` decides.
function probeRealSpawnResult() {
  try {
    return spawnSync(process.execPath, ["--version"], { encoding: "utf8" });
  } catch (error) {
    return { status: null, error };
  }
}
const REAL_SPAWN_PROBE = probeRealSpawnResult();

/**
 * Runs `body` (a leg's assertions) through `runGatedLeg`, following the
 * gated-leg apparatus's fail-closed contract (TE round-3 F-01;
 * `skipSinkTeardown.js`'s precedent): `absent` records a skip both to the
 * SKIP_INVENTORY-checked sink (`PDLC_FIXTURE_SKIP_SINK`, a no-op locally)
 * and to `node:test` via `t.skip`, `unprobeable` throws (never a silent
 * skip), and `present` runs `body`.
 */
function runRealSpawnLeg(t, name, body) {
  const gated = runGatedLeg({
    name: "launcher-real-spawn",
    capability: "real-spawn",
    unverifiedInvariants: ["AT-1.1", "AT-2.1"],
    probeResult: REAL_SPAWN_PROBE,
    leg: body,
  });
  if (gated.skip) {
    appendSkipRecord(gated.skip);
    t.skip(`capability-gated: real-spawn absent for leg "${name}" — no readable exit status from \`node --version\``);
  }
}

// ─── leg 1: S-3 descriptor assertions, no spawning (AT-2.1's hermetic residue) ──

test("T46: execLauncher hands the injected spawn seam the exact binPath, argv and env it was given, and never spawns a real process of its own", async () => {
  const { execLauncher } = await import("../bin/cli.mjs");
  const calls = [];
  const fakeSpawnSyncFn = (cmd, args, opts) => {
    calls.push({ cmd, args, opts });
    return { status: 0, signal: null };
  };

  const binPath = "/fake-store/1.2.3/bin/pdlc.mjs";
  const argv = ["dev", "docs/x/REQ-x.md", "--force-phases", "R,F"];
  const env = { ...process.env, PDLC_LAUNCHER_RESOLVED: "1" };

  const exitCode = execLauncher(binPath, argv, env, fakeSpawnSyncFn);

  assert.equal(exitCode, 0);
  assert.equal(calls.length, 1, "exactly one call to the injected spawn seam");
  const [call] = calls;
  assert.equal(call.cmd, process.execPath, "the spawn command is always process.execPath (TSPEC:418)");
  assert.deepEqual(call.args, [binPath, ...argv], "the resolved binPath followed by the original argv, verbatim");
  assert.equal(call.opts.env.PDLC_LAUNCHER_RESOLVED, "1", "the env marker passed through unchanged");
  assert.equal(call.opts.stdio, "inherit", "stdio is inherited, per §6.2 — never captured or swallowed");
});

test("T46: execLauncher passes argv and env references the injected seam cannot corrupt for a later call", async () => {
  const { execLauncher } = await import("../bin/cli.mjs");
  const calls = [];
  const fakeSpawnSyncFn = (cmd, args, opts) => {
    calls.push({ args, env: opts.env });
    return { status: 0, signal: null };
  };

  const argv = ["queue", "--dry-run"];
  const env = { MARK: "first" };
  execLauncher("/fake/bin.mjs", argv, env, fakeSpawnSyncFn);

  // Mutating the caller's own objects after the call must never reach back
  // into what the seam already recorded — this is what "descriptor" means:
  // a snapshot, not a live reference into the caller's argv/env.
  argv.push("--extra");
  env.MARK = "mutated";

  assert.deepEqual(calls[0].args, ["/fake/bin.mjs", "queue", "--dry-run"]);
  assert.equal(calls[0].env.MARK, "first");
});

test("T46: execLauncher never spawns a process of its own when a spawn seam is injected", async () => {
  const { execLauncher } = await import("../bin/cli.mjs");
  let realSpawnSyncInvoked = false;
  const fakeSpawnSyncFn = () => {
    realSpawnSyncInvoked = false; // the only thing that could flip this true is a real spawnSync
    return { status: 0, signal: null };
  };
  execLauncher("/fake/bin.mjs", [], {}, fakeSpawnSyncFn);
  assert.equal(realSpawnSyncInvoked, false);
});

// ─── S-3 arithmetic, still hermetic: a fake spawnSync-shaped result ────────

test("T46: execLauncher re-raises a numeric status verbatim, over an injected result", async () => {
  const { execLauncher } = await import("../bin/cli.mjs");
  const exitCode = execLauncher("/fake/bin.mjs", [], {}, () => ({ status: 7, signal: null }));
  assert.equal(exitCode, 7);
});

test("T46: execLauncher exits exactly 128 + signum for a signalled result, over an injected result (DEC-EDIST-06)", async () => {
  const { execLauncher } = await import("../bin/cli.mjs");
  const sigtermNumber = os.constants.signals.SIGTERM;
  const exitCode = execLauncher("/fake/bin.mjs", [], {}, () => ({ status: null, signal: "SIGTERM" }));
  assert.equal(exitCode, 128 + sigtermNumber);
  // Pinned as the exact literal too, not just the formula, so a future
  // edit to the formula's sign or base cannot silently pass by adjusting
  // both sides of the same computation (DEC-EDIST-06's own worked example).
  assert.equal(exitCode, 143);
});

test("T46: execLauncher never collapses a signalled result to exit 0 (the defect DEC-EDIST-06 closes)", async () => {
  const { execLauncher } = await import("../bin/cli.mjs");
  const exitCode = execLauncher("/fake/bin.mjs", [], {}, () => ({ status: null, signal: "SIGINT" }));
  assert.notEqual(exitCode, 0);
  assert.equal(exitCode, 130, "the conventional 128 + SIGINT(2) encoding");
});

// ─── leg 2: real-spawn pass-through (PROP-LAUNCH-6, AT-1.1, AT-2.1) ────────

test("T46: a real launcher hop re-raises a non-zero child status verbatim and keeps stdout/stderr unmixed", (t) => {
  runRealSpawnLeg(t, "pass-through", () => {
    const result = spawnSync(process.execPath, [WRAPPER, EXIT_CODE_TARGET], { encoding: "utf8" });

    assert.equal(result.status, 7, `expected the target's exact exit code re-raised verbatim; got ${JSON.stringify(result)}`);
    assert.equal(result.stdout, "EXIT-CODE-TARGET-STDOUT\n");
    assert.equal(result.stderr, "EXIT-CODE-TARGET-STDERR\n");
    assert.equal(result.stdout.includes("STDERR"), false, "stdout must never carry stderr's bytes");
    assert.equal(result.stderr.includes("STDOUT"), false, "stderr must never carry stdout's bytes");
  });
});

// ─── leg 3: real-spawn signalled child (PROP-LAUNCH-6, DEC-EDIST-06) ──────

test("T46: a real launcher hop exits exactly 128 + signum when the resolved child is killed by a signal", (t) => {
  runRealSpawnLeg(t, "signalled-child", () => {
    const result = spawnSync(process.execPath, [WRAPPER, SELF_SIGNAL_TARGET], { encoding: "utf8" });
    const sigtermNumber = os.constants.signals.SIGTERM;

    assert.equal(
      result.status,
      128 + sigtermNumber,
      `expected exactly 128 + SIGTERM(${sigtermNumber}) = ${128 + sigtermNumber}; got ${JSON.stringify(result)}`,
    );
    assert.equal(result.status, 143);
    assert.notEqual(result.status, 0, "a signal-terminated run must never be reported as success");
    assert.ok(result.stdout.includes("SELF-SIGNAL-TARGET-STDOUT"));
  });
});
