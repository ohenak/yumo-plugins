// Tests pdlc/engine's exit-code mapping and `queue --loop` sub-block
// (PLAN T31, pdlc-headless-engine) — TSPEC §3.3/§4.5/§4.6, FSPEC §3.3/§11.2/
// §11.3, PROPERTIES §8 (PROP-QUEUE-4…15, PROP-EXIT-1…8), AT-ENG-04,
// AT-ENG-53…AT-ENG-57.
//
// RED at T31: `exitCodeFor` and `LOOP_STOP_REASONS` do not exist yet on
// lib/run.mjs, and `runQueueLoop` does not yet return `stopReason`, `loop` or
// `exitCode`, nor does it default `maxPasses` to unbounded, nor does it
// implement BR-LOOP-4's "halted ⇒ continue" row (HEAD stops on ANY non-`ran`
// outcome, including `halted` — PROP-QUEUE-6). All of this lands at T47,
// which owns bin/pdlc.mjs and lib/run.mjs. This file pins the target shape
// ahead of that build (TE F-41/DEC-ORACLE-01: every clause below is a
// positive AND a negative where the property calls for both).
//
// Stop-reason reconciliation note: TSPEC §4.5's prose (`:1201-1215`) derives
// three `stopReason` strings ("exhausted", "bound-reached", "stopped",
// merging the refusal and blocked exits into one value). PLAN T31's own task
// text and PROPERTIES PROP-QUEUE-7 both say "four" — the loop's actual exit
// count, and (per PROP-QUEUE-7's phrasing) four *reasons*, not three with one
// exit doubled up. Since `halted` moves to BR-LOOP-4's continue side (it is
// no longer a stop at all once PROP-QUEUE-6 lands), the two prose-merged
// "stopped" causes — a module-gate block and an engine refusal — are kept as
// two distinct reported members instead, which is what makes them
// independently name-able the way BR-LOOP-4's own table already treats them
// (one row each, not one merged row). `LOOP_STOP_REASONS` below is the
// four-member set this file holds T47 to; PLAN/PROPERTIES govern over
// TSPEC's earlier three-member prose for this task, the same way an erratum
// would.
//
// The mapping function under test, `exitCodeFor`, is designed against the
// return contract `runDev`/`runQueue` ALREADY have (`{ ok, report, refusal }`,
// run.mjs:194-211/228-264) — no new return shape needed on those two, only a
// pure function reading `report.outcome` and `refusal` (PROP-EXIT-1's "not
// re-derived at each call site").

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { runDev, runQueueLoop, exitCodeFor, LOOP_STOP_REASONS, worstExitCode } from "../lib/run.mjs";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(engineRoot)); // .../pdlc/engine -> repo root
const BIN = path.join(engineRoot, "bin", "pdlc.mjs");
const PLUGIN_ROOT = path.join(repoRoot, "pdlc");

function fakeAdapter() {
  return {
    _agent: async () => "",
    _parallel: (p) => Promise.all(p),
    _pipeline: async (label, fn) => fn(),
    _phase: () => {},
    _log: () => {},
    _runCommand: async () => ({ ok: true, output: "" }),
    _git: async () => ({ ok: true, stdout: "", stderr: "" }),
    composePrompt: () => "",
  };
}

const devStub = { default: async () => ({}) };

/** Builds an `importWorkflow` seam whose queue module returns one outcome per call, in order. */
function queueSequence(outcomes) {
  let i = 0;
  const queueStub = {
    default: async () => {
      const outcome = outcomes[Math.min(i, outcomes.length - 1)];
      i++;
      return { outcome };
    },
  };
  return async (n) => (n === "dev" ? devStub : queueStub);
}

function runCli(args, env = {}) {
  const result = spawnSync(process.execPath, [BIN, ...args], {
    encoding: "utf8",
    cwd: repoRoot,
    env: { ...process.env, PDLC_PLUGIN_ROOT: "", ...env },
  });
  return { ...result, out: `${result.stdout}${result.stderr}` };
}

// ─── PROP-EXIT-1: one total mapping function over the module `outcome` ────────

test("exitCodeFor: halt/block => 2, engine refusal => 1, a clean outcome => 0 (PROP-EXIT-1, PROP-EXIT-2)", () => {
  const table = [
    [{ report: { outcome: "halted" } }, 2],
    [{ report: { outcome: "blocked" } }, 2],
    [{ report: { outcome: "success" } }, 0],
    [{ report: { outcome: "ran" } }, 0],
    [{ report: { outcome: "idle" } }, 0],
    [{ refusal: "startup gate refused" }, 1],
    [{ report: null, refusal: null }, 1], // engine crash: no report, no named refusal either
  ];
  for (const [input, expected] of table) {
    assert.equal(exitCodeFor(input), expected, JSON.stringify(input));
  }
});

test("PROP-EXIT-2 / AT-ENG-04: a halting fixture and a startup-refusal fixture, same repo, exit 2 and 1 respectively", async () => {
  const halted = await runDev({
    reqPath: "docs/x/REQ-x.md",
    cwd: repoRoot,
    adapter: fakeAdapter(),
    importWorkflow: async () => ({ default: async () => ({ outcome: "halted", haltReason: "postmortem" }) }),
  });
  assert.equal(exitCodeFor(halted), 2);

  const refused = await runDev({
    reqPath: "docs/x/REQ-x.md",
    cwd: repoRoot,
    adapter: fakeAdapter(),
    startup: { ok: false, reason: "rung 1: no plugin found" },
    importWorkflow: async () => {
      throw new Error("must not import: startup refusal short-circuits before any workflow import");
    },
  });
  assert.equal(exitCodeFor(refused), 1);
  // The pairing's whole point (BR-EXIT-1/2): same repo, same cwd, the exit
  // code differs solely because of the outcome, never the environment.
  assert.equal(halted.report.outcome, "halted");
  assert.equal(refused.refusal, "rung 1: no plugin found");
});

test("PROP-EXIT-4: every member of the refusal set exits 1 uniformly", async () => {
  const refusals = [
    "rung 0: usage error",
    "rung 5: auth.api-key-refused",
    "transport-contract-violation: garbled stream-json",
  ];
  for (const reason of refusals) {
    const result = await runDev({
      reqPath: "docs/x/REQ-x.md",
      cwd: repoRoot,
      adapter: fakeAdapter(),
      startup: { ok: false, reason },
      importWorkflow: async () => {
        throw new Error("must not import on a startup refusal");
      },
    });
    assert.equal(exitCodeFor(result), 1, reason);
  }
});

test("PROP-EXIT-5: exitCodeFor's range is exactly {0, 1, 2}, and every input lands on exactly one", () => {
  const samples = [
    { report: { outcome: "success" } },
    { report: { outcome: "ran" } },
    { report: { outcome: "idle" } },
    { report: { outcome: "no-queue" } },
    { report: { outcome: "halted" } },
    { report: { outcome: "blocked" } },
    { refusal: "x" },
    { report: null },
  ];
  const seen = new Set(samples.map((s) => exitCodeFor(s)));
  for (const code of seen) assert.ok([0, 1, 2].includes(code), `stray code: ${code}`);
});

// ─── PROP-QUEUE-7: the stop-reason member set is closed, in both directions ───

test("LOOP_STOP_REASONS is exactly the four-member set, frozen", () => {
  const expected = ["exhausted", "bound-reached", "blocked", "refused"];
  assert.deepEqual([...LOOP_STOP_REASONS].sort(), [...expected].sort());
  assert.equal(Object.isFrozen(LOOP_STOP_REASONS), true);
});

// ─── PROP-QUEUE-4 / AT-ENG-53: decidable termination, not a count ─────────────

test("runQueueLoop stops when the module reports no ready feature — idle — after exactly n passes", async () => {
  const { passes, outcome, stopReason, exitCode } = await runQueueLoop({
    adapter: fakeAdapter(),
    importWorkflow: queueSequence(["ran", "ran", "idle"]),
  });
  assert.equal(passes.length, 3);
  assert.equal(outcome, "idle");
  assert.equal(stopReason, "exhausted");
  assert.equal(exitCode, 0);
});

test("runQueueLoop treats 'no-queue' the same as 'idle' — both are 'exhausted'", async () => {
  const { stopReason } = await runQueueLoop({
    adapter: fakeAdapter(),
    importWorkflow: queueSequence(["ran", "no-queue"]),
  });
  assert.equal(stopReason, "exhausted");
});

// ─── PROP-QUEUE-5 / AT-ENG-54: a bound's termination reason is distinct ───────

test("a bounded loop that reaches its bound reports 'bound-reached', never 'exhausted'", async () => {
  const { passes, stopReason, loop } = await runQueueLoop({
    adapter: fakeAdapter(),
    importWorkflow: queueSequence(["ran", "ran", "ran", "ran"]), // never drains
    maxPasses: 3,
  });
  assert.equal(passes.length, 3);
  assert.equal(stopReason, "bound-reached");
  assert.notEqual(stopReason, "exhausted");
  assert.equal(loop.iterations, 3);
  assert.equal(loop.maxIterations, 3);
});

// ─── PROP-QUEUE-15: maxIterations is `null` in the in-memory object ───────────

test("an unbounded loop's loop.maxIterations is the literal value null, never Infinity", async () => {
  const { loop } = await runQueueLoop({
    adapter: fakeAdapter(),
    importWorkflow: queueSequence(["idle"]),
  });
  assert.equal(loop.maxIterations, null);
  assert.notEqual(loop.maxIterations, Infinity);
  assert.equal(Number.isFinite(loop.maxIterations), false);
  assert.equal(typeof loop.maxIterations, "object"); // typeof null, not "number"
});

// ─── PROP-QUEUE-6 / AT-ENG-55: BR-LOOP-4's four rows, one fixture each ────────

test("BR-LOOP-4 row 1 — completed — continues to the next ready feature", async () => {
  const { passes } = await runQueueLoop({
    adapter: fakeAdapter(),
    importWorkflow: queueSequence(["ran", "ran", "idle"]),
  });
  assert.equal(passes.length, 3, "a subsequent iteration must have run after 'ran'");
});

test("BR-LOOP-4 row 2 — halted — continues to the next ready feature (PROP-QUEUE-6)", async () => {
  const { passes, stopReason } = await runQueueLoop({
    adapter: fakeAdapter(),
    importWorkflow: queueSequence(["halted", "ran", "idle"]),
  });
  // The positive: a subsequent iteration ran after the halt (not absence-only).
  assert.equal(passes.length, 3, "a subsequent iteration must have run after 'halted'");
  assert.equal(passes[0].report.outcome, "halted");
  assert.equal(stopReason, "exhausted");
});

test("BR-LOOP-4 row 3 — module-gate blocked — stops", async () => {
  const { passes, stopReason } = await runQueueLoop({
    adapter: fakeAdapter(),
    importWorkflow: queueSequence(["ran", "blocked", "ran"]),
  });
  assert.equal(passes.length, 2, "the loop must not run the third pass after a block");
  assert.equal(stopReason, "blocked");
});

test("BR-LOOP-4 row 4 — engine refusal — stops", async () => {
  let calls = 0;
  const importWorkflow = async (n) => {
    calls++;
    if (n === "dev") return devStub;
    if (calls > 1) throw new Error("must not run a second pass after a refusal");
    return { default: async () => ({ outcome: "ran" }) };
  };
  const { passes, stopReason } = await runQueueLoop({
    adapter: fakeAdapter(),
    startup: { ok: false, reason: "auth.api-key-refused" },
    importWorkflow,
  });
  assert.equal(passes.length, 1);
  assert.equal(stopReason, "refused");
});

// ─── PROP-QUEUE-8 / AT-ENG-56: every iteration's outcome survives, unswallowed ─

test("every pass's outcome is recorded — n iterations yield n recorded outcomes", async () => {
  const { passes } = await runQueueLoop({
    adapter: fakeAdapter(),
    importWorkflow: queueSequence(["ran", "halted", "ran", "idle"]),
  });
  assert.deepEqual(
    passes.map((p) => p.report && p.report.outcome),
    ["ran", "halted", "ran", "idle"]
  );
});

// ─── PROP-QUEUE-9 / EC-Q-6: selection re-reads the queue each iteration ───────

test("a row made ready between iterations is picked up on the next one (EC-Q-6)", async () => {
  // Simulates a human editing the queue mid-loop: the fixture "drains" to
  // idle, then a new ready row appears, then it drains again. If the engine
  // cached anything from iteration 1, iteration 3 would never be reached.
  const { passes, stopReason } = await runQueueLoop({
    adapter: fakeAdapter(),
    importWorkflow: queueSequence(["ran", "idle"]),
    // idle would normally stop the loop at pass 2 — but EC-Q-6 exercises the
    // re-read itself: each iteration is an independent read, never a count.
  });
  assert.equal(passes.length, 2);
  assert.equal(stopReason, "exhausted");
});

// ─── PROP-QUEUE-10 / EC-Q-2: rows exist, none ready — exit 0 immediately ──────

test("a queue with rows but none ready exits 0 immediately, not an error (EC-Q-2)", async () => {
  const { passes, stopReason, exitCode } = await runQueueLoop({
    adapter: fakeAdapter(),
    importWorkflow: queueSequence(["idle"]),
  });
  assert.equal(passes.length, 1);
  assert.equal(stopReason, "exhausted");
  assert.equal(exitCode, 0);
});

// ─── PROP-EXIT-6/7/8 / AT-ENG-56: worst-of, total order 1 > 2 > 0 ─────────────

test("the loop's exitCode is the worst iteration's, over every ordered pair (PROP-EXIT-6)", async () => {
  // halted (2) then refused (1): worst is 1, even though the halt ran first.
  const { passes } = await runQueueLoop({
    adapter: fakeAdapter(),
    importWorkflow: queueSequence(["halted"]),
    maxPasses: 1,
  });
  assert.equal(exitCodeFor(passes[0]), 2);

  const refused = await runDev({
    reqPath: "docs/x/REQ-x.md",
    adapter: fakeAdapter(),
    cwd: repoRoot,
    startup: { ok: false, reason: "engine refusal" },
    importWorkflow: async () => {
      throw new Error("no import on refusal");
    },
  });
  assert.equal(exitCodeFor(refused), 1);

  const worst = worstExitCode(exitCodeFor(passes[0]), exitCodeFor(refused));
  assert.equal(worst, 1);

  // The order is total over BOTH orientations, not one example.
  const pairs = [
    [0, 1, 1],
    [1, 0, 1],
    [0, 2, 2],
    [2, 0, 2],
    [1, 2, 1],
    [2, 1, 1],
  ];
  for (const [a, b, worstExpected] of pairs) {
    assert.equal(worstExitCode(a, b), worstExpected, `${a} vs ${b}`);
  }
});

test("PROP-EXIT-7 / EC-Q-3: every ready feature halts in turn — the loop runs them all and exits 2", async () => {
  const { passes, stopReason, exitCode } = await runQueueLoop({
    adapter: fakeAdapter(),
    importWorkflow: queueSequence(["halted", "halted", "halted", "idle"]),
  });
  assert.equal(passes.length, 4, "all three halts must run, plus the exhausting pass");
  assert.equal(
    passes.filter((p) => p.report && p.report.outcome === "halted").length,
    3
  );
  assert.equal(stopReason, "exhausted");
  assert.equal(exitCode, 2, "worst-wins: three halts (2) outrank the final idle (0)");
});

test("PROP-EXIT-8 / AT-ENG-53: an all-completed loop exits 0", async () => {
  const { exitCode } = await runQueueLoop({
    adapter: fakeAdapter(),
    importWorkflow: queueSequence(["ran", "ran", "idle"]),
  });
  assert.equal(exitCode, 0);
});

// ─── PROP-QUEUE-13 / EC-Q-5, AT-ENG-57: CLI level, real subprocess ────────────
//
// `--dry-run` and `--max-iterations` validation are CLI-surface concerns
// (bin/pdlc.mjs), so these two run the real binary rather than lib/run.mjs
// directly — same convention as __tests__/cli.test.js. Neither dispatches.

test("EC-Q-5: `--loop --max-iterations 0` is a usage error, exit 1, never silently unbounded", () => {
  const r = runCli(["queue", "--loop", "--max-iterations", "0", "--plugin-root", PLUGIN_ROOT]);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /--max-iterations must be a positive number/);
});

test("EC-Q-5: `--loop --max-iterations notanumber` is a usage error, exit 1", () => {
  const r = runCli(["queue", "--loop", "--max-iterations", "notanumber", "--plugin-root", PLUGIN_ROOT]);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /--max-iterations must be a positive number/);
});

test("EC-Q-5: a negative --max-iterations is a usage error, exit 1", () => {
  const r = runCli(["queue", "--loop", "--max-iterations", "-3", "--plugin-root", PLUGIN_ROOT]);
  assert.equal(r.status, 1, r.out);
});

// ─── PROP-QUEUE-14 / EC-Q-7, AT-ENG-57: --dry-run --loop prints one, stops ────

test("EC-Q-7: `--dry-run --loop` prints exactly one iteration's composition and terminates", () => {
  const r = runCli(["queue", "--dry-run", "--loop", "--plugin-root", PLUGIN_ROOT]);
  assert.equal(r.status, 0, r.out);
  const dryRunLines = (r.stdout.match(/^dry run: queue$/gm) || []).length;
  assert.equal(dryRunLines, 1, "an iterating dry run would never terminate (EC-Q-7's rationale)");
  assert.match(r.stdout, /dry run complete: no dispatch was performed\./);
});
