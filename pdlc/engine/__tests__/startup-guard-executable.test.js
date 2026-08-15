// Tests for rung 4a — guard executability (T27, pdlc-headless-engine).
// TSPEC §7.8 / FSPEC §4.1 row 4a, §9.1 BR-GUARD-6, EC-START-10/11, AT-ENG-11a.
//
// Two branches:
//   - EC-START-10: no candidate interpreter runs ⇒ refusal naming every
//     candidate tried, its outcome, and the remedy; exit 1; nothing
//     dispatched.
//   - EC-START-11: an earlier candidate is present-but-not-runnable and a
//     later one runs ⇒ presence is not executability, and rung 4a passes.
//
// Covers PROP-GUARD-17, PROP-GUARD-18, PROP-START-4
// (PROPERTIES-pdlc-headless-engine.md:157, :350-351).
//
// RED at T27 (batch 4): `GUARD_INTERPRETERS`, `probeGuardInterpreter` and
// rung 4a do not exist in lib/startup.mjs yet — they land at T44, which also
// restructures `runStartupChecks` around a structured `RungRecord[]` (TSPEC
// §4.3). This file pins the probe seam and both branches' oracle ahead of
// that build, per TE F-41: a refusal with no oracle proves nothing.
//
// Offline and hermetic: both branches are driven entirely by injecting
// `runProbe` (TSPEC §7.8) — no subprocess is spawned, no interpreter needs
// to exist on the host running this suite.

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";

import { runStartupChecks, probeGuardInterpreter, GUARD_INTERPRETERS } from "../lib/startup.mjs";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(engineRoot));
const PLUGIN_ROOT = path.join(repoRoot, "pdlc");
// The live range, exactly as bin/pdlc.mjs resolves it — these tests run the
// ladder against this repo's own plugin, so a hardcoded range would go stale
// on every plugin version bump.
const ENGINE_COMPAT = JSON.parse(
  readFileSync(path.join(engineRoot, "package.json"), "utf8")
).pdlcPluginCompat;

function baseOpts(overrides = {}) {
  return {
    pluginRoot: PLUGIN_ROOT,
    env: {},
    engineVersion: "0.1.0",
    engineCompat: ENGINE_COMPAT,
    ...overrides,
  };
}

// §7.0's cross-process dispatch accumulator — the same scratch-run-dir
// pattern adapter-descriptor.test.js uses for the identical settlement log.
function withRunDir(fn) {
  const runDir = mkdtempSync(path.join(os.tmpdir(), "pdlc-startup-guard-"));
  const prior = process.env.PDLC_TEST_RUN_DIR;
  process.env.PDLC_TEST_RUN_DIR = runDir;
  return (async () => {
    try {
      return await fn(runDir);
    } finally {
      if (prior === undefined) delete process.env.PDLC_TEST_RUN_DIR;
      else process.env.PDLC_TEST_RUN_DIR = prior;
      rmSync(runDir, { recursive: true, force: true });
    }
  })();
}

function readDispatchLines(runDir) {
  const file = path.join(runDir, `${process.pid}.jsonl`);
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") return []; // nothing appended — a valid outcome, not a test error
    throw err;
  }
  return text
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .filter((r) => r.kind === "dispatch");
}

// ── BR-GUARD-6: the candidate set is a transcription, never a widen/narrow ─

test("GUARD_INTERPRETERS is the shipped script's candidate set, in the shipped order", () => {
  // pdlc/hooks/scripts/guard-harvest-before-delete.sh:15-20's candidate loop.
  assert.deepEqual(GUARD_INTERPRETERS, ["python3", "python", "py"]);
  assert.ok(Object.isFrozen(GUARD_INTERPRETERS));
});

// ── probeGuardInterpreter: total, hermetic, one attempt per candidate ──────

test("probeGuardInterpreter is total: no candidate running yields interpreter: null and one attempt per candidate, in order", () => {
  const outcomes = { python3: "not found", python: "not found", py: "not found" };
  const seen = [];
  const runProbe = (candidate) => {
    seen.push(candidate);
    return { ran: false, outcome: outcomes[candidate] };
  };

  const result = probeGuardInterpreter({ runProbe });

  assert.equal(result.interpreter, null);
  assert.deepEqual(seen, ["python3", "python", "py"]);
  assert.deepEqual(result.attempts, [
    { candidate: "python3", outcome: "not found" },
    { candidate: "python", outcome: "not found" },
    { candidate: "py", outcome: "not found" },
  ]);
});

test("probeGuardInterpreter returns the first candidate that ran and stops probing — presence is not executability", () => {
  const seen = [];
  const runProbe = (candidate) => {
    seen.push(candidate);
    if (candidate === "python3") return { ran: false, outcome: "found but exited 9009" };
    if (candidate === "python") return { ran: true, outcome: "ran" };
    throw new Error("py must never be probed once python has run");
  };

  const result = probeGuardInterpreter({ runProbe });

  assert.equal(result.interpreter, "python");
  assert.deepEqual(seen, ["python3", "python"], "the later, unreached candidate is never probed once one has run");
  assert.deepEqual(result.attempts, [
    { candidate: "python3", outcome: "found but exited 9009" },
    { candidate: "python", outcome: "ran" },
  ]);
});

test("probeGuardInterpreter defaults to GUARD_INTERPRETERS when no candidate list is supplied", () => {
  const seen = [];
  const result = probeGuardInterpreter({
    runProbe: (candidate) => {
      seen.push(candidate);
      return { ran: false, outcome: "not found" };
    },
  });
  assert.deepEqual(seen, [...GUARD_INTERPRETERS]);
  assert.equal(result.interpreter, null);
});

// ── EC-START-10 / EC-START-11 through the ladder (rung 4a) ────────────────

test("EC-START-10: no candidate runs — rung 4a fails, names every candidate and outcome plus a remedy, refuses the whole run, and dispatches nothing", () =>
  withRunDir(async (runDir) => {
    const runProbe = () => ({ ran: false, outcome: "not found" });
    const result = runStartupChecks(baseOpts({ runProbe }));

    // bin/pdlc.mjs maps every `!ok` startup result to exit 1 (EC-START-10's
    // exit code is asserted there generically, not re-derived per rung).
    assert.equal(result.ok, false);

    const rung4a = result.rungs.find((r) => r.rung === "4a");
    assert.ok(rung4a, "rung 4a must appear in the ladder even though it is new");
    assert.equal(rung4a.state, "fail");

    // Three separate expectations, one per candidate — never one blob (as
    // §6.4 does for EC-GUARD-4).
    assert.match(rung4a.detail, /python3/);
    assert.match(rung4a.detail, /python(?!3)/);
    assert.match(rung4a.detail, /\bpy\b/);
    assert.match(rung4a.detail, /not found/);
    assert.match(rung4a.detail, /install/i, "the refusal names the remedy, not only the failure");

    assert.equal(readDispatchLines(runDir).length, 0, "rung 4a refuses before anything is dispatched");
  }));

test("EC-START-11: a present-but-not-runnable earlier candidate and a runnable later one — rung 4a passes and the ladder continues to rung 5", () => {
  const runProbe = (candidate) => {
    if (candidate === "python3") return { ran: false, outcome: "found but exited 9009" };
    return { ran: true, outcome: "ran" };
  };
  const result = runStartupChecks(baseOpts({ runProbe }));

  const rung4a = result.rungs.find((r) => r.rung === "4a");
  assert.ok(rung4a);
  assert.equal(rung4a.state, "pass");
  assert.match(rung4a.detail, /python3/);
  assert.match(rung4a.detail, /found but exited 9009/);
  assert.match(rung4a.detail, /python(?!3)/);

  // rung 5's record exists with state === "pass" — the positive form of "the
  // ladder continued" (RungRecord.state is three-valued: state !== "skipped"
  // would be satisfied by a rung-5 *failure* just as readily as by a pass).
  const rung5 = result.rungs.find((r) => r.rung === "5");
  assert.ok(rung5, "rung 5 must be recorded under a green billing posture");
  assert.equal(rung5.state, "pass");
});

// ── PROP-START-4: the local probe bills nothing and is not a dispatch ─────

test("a run that reaches rung 4a and passes it still dispatches nothing — the probe is a local check, not a model call", () =>
  withRunDir(async (runDir) => {
    const runProbe = () => ({ ran: true, outcome: "ran" });
    const result = runStartupChecks(baseOpts({ runProbe }));
    assert.equal(result.rungs.find((r) => r.rung === "4a").state, "pass");
    assert.equal(readDispatchLines(runDir).length, 0);
  }));
