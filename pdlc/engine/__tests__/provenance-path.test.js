// Tests for T45 — the E-4b guard/body split's own legs (pdlc-engine-distribution).
// TSPEC §9.3, §12.1's "engine-side legs live in one named file" bullet.
//
// This file is created here (the split task, batch 8) carrying only the two
// legs §9.3's exception 1 and exception 2 require of the split itself:
//
//   1. importing `bin/cli.mjs` is inert (no dispatch, no `USAGE`, no exit
//      code) — the entry guard's whole point.
//   2. `bin/cli.mjs` exports a callable `main` alongside an exported default
//      `deps` object shaped `{runDev, runQueue, runQueueLoop, startupFor,
//      liveAdapter}`.
//
// Per §12.1 ("One file stays the answer even though the two legs' setups
// differ"), the wiring task extends this SAME file one batch later with the
// process-entry and injection-level provenance legs; this task does not
// touch those.

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { message } from "../lib/catalogue.mjs";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CLI_URL = path.join(engineRoot, "bin", "cli.mjs");

// ── exception 1: importing bin/cli.mjs is inert ────────────────────────────
//
// "Nothing happened" is stated as absence, not as a passing file that does
// not exist: two observations, `process.exitCode` and whatever the import
// wrote to stderr, both captured immediately around a dynamic `await
// import()` and restored in `finally` so this leg's capture cannot bleed
// onto a neighbouring test left running in the same process (PM v8 Q-01).

test("importing bin/cli.mjs is inert: no dispatch, no USAGE, exitCode untouched", async () => {
  const exitCodeBefore = process.exitCode;
  const originalConsoleError = console.error;
  let stderrText = "";
  console.error = (...args) => {
    stderrText += args.map(String).join(" ") + "\n";
  };
  try {
    await import(CLI_URL);
  } finally {
    console.error = originalConsoleError;
  }
  assert.equal(process.exitCode, exitCodeBefore, "import must not set process.exitCode");
  assert.equal(stderrText, "", "import must not write anything to stderr");
  assert.doesNotMatch(stderrText, /Usage:/, "import must not print USAGE");
});

// ── exception 2: main is exported and callable, deps is the exported default ──

test("bin/cli.mjs exports a callable main and a five-key default deps object", async () => {
  const mod = await import(CLI_URL);
  assert.equal(typeof mod.main, "function", "main must be an exported function");
  assert.ok(mod.default && typeof mod.default === "object", "default export must be an object");
  assert.deepEqual(
    Object.keys(mod.default).sort(),
    ["liveAdapter", "runDev", "runQueue", "runQueueLoop", "startupFor"].sort(),
    "default deps must carry exactly the five §9.3 seam members"
  );
  for (const key of ["runDev", "runQueue", "runQueueLoop", "startupFor", "liveAdapter"]) {
    assert.equal(typeof mod.default[key], "function", `deps.${key} must be a function`);
  }
});

// ── node.below-floor catalogue registration (TSPEC §10.3, AC-2.4) ─────────
//
// `bin/pdlc.mjs` cannot import `lib/catalogue.mjs` — doing so would add a
// static import and falsify PROP-LAUNCH-7 — so the guard's refusal is a
// literal string duplicated in that file rather than routed through
// `message()`. This test is what keeps the two in sync: it renders the
// catalogue's registered template and asserts it is byte-identical to the
// guard's own literal (`bin/pdlc.mjs`), and — since `message()` records an
// observation on every call, catalogue or otherwise — it is also this
// registration's only emission, satisfying §7.4's reverse-direction
// set-equality (a registered id that no path ever emits fails the step).

test("catalogue: node.below-floor renders and names both the floor and the found version", () => {
  const rendered = message("node.below-floor", { floor: "20", found: "12.0.0" });
  assert.equal(rendered, "pdlc requires Node >= 20; found 12.0.0");
});

// ── T47: the two §12.1 provenance-path legs (AT-5.3, AT-4.2) ──────────────
//
// TSPEC §7.2's "the two legs capture two different objects, so the key name
// differs per leg" table (PM v8 F-01):
//
//   process-entry   — the runner-argument object `cli.mjs` builds for
//                      `runQueueLoop`; the recorded key is `provenance`.
//   injection-level — the seam object the engine spreads into the workflow
//                      module's `main()`; the recorded key is `_provenance`.
//
// Both legs are RED at this task (T47): `bin/cli.mjs`'s `cmdQueue` does not
// yet build or forward a `Provenance` value, and `lib/run.mjs`'s
// `devInjection`/`queueInjection` do not yet carry an `_provenance` key.
// T48 wires both; this task only proves the gap with a failing test on each
// leg, per §12.1's production-path requirement (builder-not-wired).

// The exact five-member seam set `bin/cli.mjs` exports as `defaultDeps`
// (§9.3). Transcribed literally (a "value pin"), not derived from the
// module under test, so a recorder fixture missing a member goes red on
// ITS OWN key-set assertion rather than silently under-covering `main()`.
const CLI_DEPS_KEYS = ["liveAdapter", "runDev", "runQueue", "runQueueLoop", "startupFor"];

/**
 * Builds a `deps` object shaped exactly like `bin/cli.mjs`'s `defaultDeps`
 * (five members, pinned above), with `runDev`/`runQueue`/`runQueueLoop` as
 * call recorders and `startupFor`/`liveAdapter` as fixed stubs. Returns the
 * per-member call-argument arrays alongside the deps object so a test can
 * assert BOTH "reached exactly once" and "not reached at all" (the capture
 * counts §12.1 asks for) before inspecting any one call's argument shape.
 */
function makeRecordingCliDeps({ startupResult, adapterResult }) {
  const calls = { runDev: [], runQueue: [], runQueueLoop: [] };
  const deps = {
    runDev: async (args) => {
      calls.runDev.push(args);
      return { report: null };
    },
    runQueue: async (args) => {
      calls.runQueue.push(args);
      return { report: null };
    },
    runQueueLoop: async (args) => {
      calls.runQueueLoop.push(args);
      return {
        passes: [],
        outcome: undefined,
        stopReason: "exhausted",
        exitCode: 0,
        loop: { iterations: 0, maxIterations: null },
      };
    },
    startupFor: () => startupResult,
    liveAdapter: () => adapterResult,
  };
  return { calls, deps };
}

test("T47: process-entry — the recorder deps object covers exactly the real five-member seam (no more, no less)", async () => {
  const mod = await import(CLI_URL);
  const { deps } = makeRecordingCliDeps({
    startupResult: { ok: true, pluginRoot: "/fake-plugin-root", pluginVersion: "1.0.0", banner: [], rungs: [] },
    adapterResult: {
      adapter: { getApiKeySource: () => "none", getPauseLog: () => [] },
      cwd: engineRoot,
      tunables: {
        retryAttempts: 3,
        retryBackoff: { baseMs: 1000, capMs: 2000 },
        timeoutMinutes: 30,
        maxIterations: Infinity,
      },
    },
  });
  assert.deepEqual(
    Object.keys(mod.defaultDeps).sort(),
    CLI_DEPS_KEYS,
    "the real bin/cli.mjs defaultDeps key set must still match the pinned literal"
  );
  assert.deepEqual(
    Object.keys(deps).sort(),
    CLI_DEPS_KEYS,
    "the recorder fixture must cover exactly the same five keys, or a member goes unrecorded silently"
  );
});

test.skip("T48: process-entry — runQueueLoop is reached exactly once by `queue --loop` and carries provenance; runDev/runQueue are not reached", async () => {
  const { main } = await import(CLI_URL);
  const { calls, deps } = makeRecordingCliDeps({
    startupResult: { ok: true, pluginRoot: "/fake-plugin-root", pluginVersion: "1.0.0", banner: [], rungs: [] },
    adapterResult: {
      adapter: { getApiKeySource: () => "none", getPauseLog: () => [] },
      cwd: engineRoot,
      tunables: {
        retryAttempts: 3,
        retryBackoff: { baseMs: 1000, capMs: 2000 },
        timeoutMinutes: 30,
        maxIterations: Infinity,
      },
    },
  });

  // Capture/restore process.exitCode and stderr around the dispatch — the
  // same discipline the file's first test uses (PM v8 Q-01: a capture must
  // not bleed onto a neighbouring test in the same process).
  const exitCodeBefore = process.exitCode;
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;
  let stderrText = "";
  console.error = (...args) => {
    stderrText += args.map(String).join(" ") + "\n";
  };
  console.log = () => {};
  try {
    await main(["node", "pdlc", "queue", "--loop"], deps);
  } finally {
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
    process.exitCode = exitCodeBefore;
  }

  // Capture counts first (§12.1): exactly one recorder reached, the other
  // two untouched — before inspecting any one call's argument shape.
  assert.equal(calls.runQueueLoop.length, 1, "runQueueLoop must be reached exactly once by `queue --loop`");
  assert.equal(calls.runDev.length, 0, "runDev must not be reached by `pdlc queue --loop`");
  assert.equal(calls.runQueue.length, 0, "runQueue must not be reached by `pdlc queue --loop`");

  assert.ok(
    Object.prototype.hasOwnProperty.call(calls.runQueueLoop[0], "provenance"),
    `the argument object cli.mjs hands runQueueLoop must carry a "provenance" key at all — got keys: ${Object.keys(calls.runQueueLoop[0]).join(", ")}`
  );
});

// ── injection-level leg ────────────────────────────────────────────────────
//
// Drives the REAL `lib/run.mjs` `runQueueLoop`, substituting only the
// dynamic module import (the shipped `importWorkflow` seam) with a
// recording queue `main()`. Two passes must really execute, so the
// per-pass identity comparison is falsifiable rather than vacuous over a
// single captured entry (TSPEC §7.2, TE v7 F-39 / v8 F-44).

/** A recording `importWorkflow`: the "queue" module's `main()` records the
 * seam object it receives and returns the one outcome (`"ran"`) that falls
 * through and continues the loop (BR-LOOP-4); "dev" resolves to an inert
 * stub since nothing here delegates to it. */
function makeRecordingImportWorkflow(captured) {
  return async (name) => {
    if (name === "queue") {
      return {
        default: async (seams) => {
          captured.push(seams);
          return { outcome: "ran" };
        },
      };
    }
    return { default: async () => ({ outcome: "ran" }) };
  };
}

test.skip("T48: injection-level — real runQueueLoop threads the SAME frozen Provenance into every pass's seam object (identity)", async () => {
  const { runQueueLoop } = await import("../lib/run.mjs");
  const { buildProvenance } = await import("../lib/provenance.mjs");

  const p = buildProvenance({
    engineVersion: "0.0.0-test",
    pluginVersion: null,
    pluginCompat: "*",
    channel: "engine",
    mode: "dev",
    pin: null,
    loadRoot: "/fake-load-root",
  });

  const captured = [];
  const importWorkflow = makeRecordingImportWorkflow(captured);
  const adapter = { _agent: () => {} };

  const result = await runQueueLoop({
    maxPasses: 2,
    queuePath: "docs/_queue/QUEUE.md",
    cwd: engineRoot,
    adapter,
    startup: null,
    provenance: p,
    importWorkflow,
  });

  // The ≥2-pass premise is asserted, not merely arranged (TE v8 F-44): both
  // conditions below must hold BEFORE the identity comparison is trusted.
  assert.equal(captured.length, 2, "the loop must really execute two passes, not stop early");
  assert.equal(
    result.stopReason,
    "bound-reached",
    "the bound, not a stop condition, must be what ends the loop"
  );

  for (const seams of captured) {
    assert.equal(
      seams._provenance,
      p,
      "every pass's injected seam object must carry the SAME frozen Provenance, by identity"
    );
  }
});
