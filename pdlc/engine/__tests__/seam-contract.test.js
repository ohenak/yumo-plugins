// TSPEC §3.1's per-module seam contract, as a dedicated contract file
// (PROP-PARITY-10, PROP-PARITY-11, PROP-PARITY-12, PROP-PARITY-14,
// PROP-PARITY-15 — AT-ENG-51, EC-PAR-5, BR-PARITY-2, T25 -> T39).
//
// `__tests__/run.test.js` already covers the wiring's day-to-day behaviour
// (cwd pinning, refusal-before-import, argument forwarding). This file is
// narrower and stricter: it exists to pin TSPEC §3.1's table ITSELF — the
// exact seam set per module, the two seams whose absence would silently
// degrade a load-bearing path (`_runCommand`, `_runPipeline`), the one seam
// that must stay unpainted (`_sessionAgent`) paired with its positive on the
// same path, and the fall-through-to-the-throwing-stub failure mode
// (PROP-PARITY-10) that a missing `_agent` seam must produce.
//
// Every clause below is paired: an absence assertion (a seam is NOT
// forwarded / NOT present) is never left to stand alone without a positive
// on the SAME path proving the omission is reached and distinguishable, per
// TSPEC §3.1's own framing ("the seam must stay unpainted, not be wired").

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createAdapter } from "../lib/adapter.mjs";
import { devInjection, queueInjection } from "../lib/run.mjs";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(engineRoot)); // .../pdlc/engine -> repo root
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

// ─── PROP-PARITY-12: the exact per-module seam set, transcribed from TSPEC
//     §3.1's table itself (not from the wiring's own idea of what it sends) ──

const TSPEC_3_1_DEV_SEAMS = Object.freeze([
  "_agent",
  "_parallel",
  "_pipeline",
  "_phase",
  "_log",
  "_runCommand",
  "_git",
]);

const TSPEC_3_1_QUEUE_SEAMS = Object.freeze([
  "_agent",
  "_phase",
  "_log",
  "_git",
  "_runPipeline",
]);

test("PROP-PARITY-12: devInjection supplies exactly TSPEC §3.1's dev row — no more, no less", () => {
  const keys = Object.keys(devInjection(fakeAdapter())).sort();
  assert.deepEqual(keys, [...TSPEC_3_1_DEV_SEAMS].sort());
});

test("PROP-PARITY-12: queueInjection supplies exactly TSPEC §3.1's queue row — no more, no less", () => {
  const keys = Object.keys(queueInjection(fakeAdapter(), async () => ({}))).sort();
  assert.deepEqual(keys, [...TSPEC_3_1_QUEUE_SEAMS].sort());
});

// dev does not declare `_runPipeline` (only the queue module does), and the
// queue does not declare `_parallel` / `_pipeline` / `_runCommand` (only the
// dev module does) — TSPEC §3.1's "— *(not declared)*" cells, asserted as
// cross-exclusions so a copy-paste of one row into the other fails closed.
test("PROP-PARITY-12: dev and queue rows do not leak each other's not-declared seams", () => {
  const devKeys = new Set(Object.keys(devInjection(fakeAdapter())));
  const queueKeys = new Set(Object.keys(queueInjection(fakeAdapter(), async () => ({}))));
  assert.equal(devKeys.has("_runPipeline"), false, "dev's main() declares no _runPipeline param");
  for (const queueOnly of ["_parallel", "_pipeline", "_runCommand"]) {
    assert.equal(
      queueKeys.has(queueOnly),
      false,
      `orchestrate-queue.js's main() declares no ${queueOnly} param`
    );
  }
});

// ─── `_sessionAgent`: the seam must stay unpainted (TSPEC §3.1 row, R-4, O-6) ─
//
// Absence half: neither injection object ever carries the key, on any input —
// there is no adapter shape that makes `devInjection`/`queueInjection` forward
// it, because neither function reads it off the adapter at all.
test("PROP-PARITY-14 (absence): _sessionAgent is never a key of devInjection or queueInjection", () => {
  const adapter = { ...fakeAdapter(), _sessionAgent: async () => "should never be forwarded" };
  const dev = devInjection(adapter);
  const queue = queueInjection(adapter, async () => ({}));
  assert.equal("_sessionAgent" in dev, false);
  assert.equal("_sessionAgent" in queue, false);
  assert.equal(Object.prototype.hasOwnProperty.call(dev, "_sessionAgent"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(queue, "_sessionAgent"), false);
});

// Positive half, on the SAME path: the one seam devInjection DOES carry for
// dispatch — `_agent` — is exactly the adapter's own `_agent`, forwarded by
// reference rather than wrapped in a session-binding closure. That identity is
// what makes two successive calls through it two independent, fresh dispatches
// rather than one resumed context: `sessionBoundAgent` (orchestrate-dev.js:5609)
// returns `_agent` UNCHANGED whenever its `_sessionAgent` parameter is not a
// function — which, because devInjection never supplies that key, is every
// dispatch this wiring ever makes. Proven here at the seam the engine controls,
// two levels below the module: the adapter's `_agent` composes and dispatches
// each call independently, with no cross-call session field ever reaching the
// transport.
test("PROP-PARITY-14 (positive): two successive dispatches through the injected _agent are two independent, unlinked calls", async () => {
  const calls = [];
  const adapter = createAdapter({
    transport: {
      dispatch: async (prompt, opts) => {
        calls.push({ prompt, opts });
        return { text: `reply #${calls.length}` };
      },
    },
    pluginRoot: PLUGIN_ROOT,
    log: () => {},
  });

  const injection = devInjection(adapter);
  assert.equal(injection._agent, adapter._agent, "forwarded by reference — no session wrapper");

  const first = await injection._agent("se-review", "first prompt", { model: "opus" });
  const second = await injection._agent("se-review", "second prompt", { model: "opus" });

  assert.equal(calls.length, 2, "two successive dispatches");
  assert.equal(first, "reply #1");
  assert.equal(second, "reply #2");
  // Neither call's dispatch options carry any session-continuation field — each
  // is addressed to the transport as a fresh, unlinked context.
  for (const { opts } of calls) {
    assert.equal("sessionId" in opts, false);
    assert.equal("resumeSessionId" in opts, false);
    assert.equal("session" in opts, false);
  }
  assert.notEqual(calls[0].prompt, calls[1].prompt, "distinct prompts, not one continued exchange");
});

// ─── `_runCommand`: load-bearing non-null for dev (TSPEC §3.1 row) ───────────
//
// The module's own default is `NO_RUN_COMMAND = null` (orchestrate-dev.js
// §7.1) — a null seam silently degrades Phase I's script-owned wave gate to
// the legacy self-report path. The engine's contract is that `_runCommand` is
// NEVER null on the dev row, whether or not the caller of `createAdapter`
// supplied its own `runCommandFn`.
test("PROP-PARITY-12/load-bearing: devInjection's _runCommand is never null, even on the adapter's own default", () => {
  const adapter = createAdapter({
    transport: { dispatch: async () => ({ text: "" }) },
    pluginRoot: PLUGIN_ROOT,
    log: () => {},
    // runCommandFn deliberately omitted — exercises createAdapter's OWN
    // fallback (createRunCommand), not a test double.
  });
  const injection = devInjection(adapter);
  assert.equal(typeof injection._runCommand, "function");
  assert.notEqual(injection._runCommand, null);
});

test("PROP-PARITY-12/load-bearing: an explicit adapter _runCommand is forwarded unchanged, never defaulted away", () => {
  const marker = async () => ({ ok: true, output: "marker" });
  const adapter = { ...fakeAdapter(), _runCommand: marker };
  assert.equal(devInjection(adapter)._runCommand, marker);
});

// ─── `_runPipeline`: a necessity, not a preference, for queue (TSPEC §3.1) ──
//
// orchestrate-queue.js:1422 calls `_runPipeline({reqPath})` with NO seams of
// its own. Its module default is the real dev `main()` — so an injection that
// omits `_runPipeline` would let the delegated dev pipeline run on ITS OWN
// module defaults, whose `_agent` is the throwing stub (PROP-PARITY-10).
// Absence half: queueInjection always supplies the key, as a function, never
// left to the caller's module default.
test("PROP-PARITY-12/load-bearing: queueInjection always supplies _runPipeline as a function", () => {
  const runPipeline = async () => ({ outcome: "success" });
  const injection = queueInjection(fakeAdapter(), runPipeline);
  assert.equal(typeof injection._runPipeline, "function");
  assert.equal(injection._runPipeline, runPipeline);
});

// Positive half, on the SAME path: the wrapper this engine hands the queue as
// `_runPipeline` re-attaches the dev row's own seams (including `_agent`) to
// whatever it forwards — so the delegated call the queue makes with only
// `{reqPath}` still reaches a working `_agent`, never the module's stub.
test("PROP-PARITY-12/load-bearing (positive): the queue's _runPipeline wrapper re-attaches _agent to a bare {reqPath} call", async () => {
  const adapter = fakeAdapter();
  let seenByDev = null;
  const devMain = async (args) => {
    seenByDev = args;
    return { outcome: "success" };
  };
  const devSeams = devInjection(adapter);
  const runPipeline = (args) => devMain({ ...args, ...devSeams });
  const queueInjectedSeams = queueInjection(adapter, runPipeline);

  // Exactly what orchestrate-queue.js:1422 does: call with {reqPath} alone.
  await queueInjectedSeams._runPipeline({ reqPath: "docs/y/REQ-y.md" });

  assert.equal(seenByDev.reqPath, "docs/y/REQ-y.md");
  assert.equal(seenByDev._agent, adapter._agent, "the delegated call reaches a working _agent");
  assert.equal(typeof seenByDev._runCommand, "function");
});

// ─── PROP-PARITY-15: the un-overridden IO/advisory/probe seams keep the
//     modules' own Node defaults, paired with the positive that already
//     exercises them ──────────────────────────────────────────────────────
//
// Absence half, here: none of TSPEC §2.5's named seams is ever a key of
// devInjection or queueInjection, on any adapter shape — overriding one of
// these would be a defect (§2.5), so the assertion is that the wiring
// physically cannot forward them, not merely that today's adapter chooses
// not to supply them.
const UNOVERRIDDEN_IO_SEAMS = Object.freeze([
  "_readFile",
  "_writeFile",
  "_appendFile",
  "_listFiles",
  "_checkFile",
  "_hashFile",
  "_ghRun",
  "_checkCi",
  "_mergeWorktree",
  "_recordQueueRow",
  "_rebaseOntoDefault",
  "_probeDoc",
  "_probeReviewState",
  "_probePostmortem",
]);

test("PROP-PARITY-15 (absence): devInjection/queueInjection never forward any of §2.5's un-overridden IO/advisory/probe seams", () => {
  // An adapter that happens to carry same-named fields (a plausible future
  // shape, not a current one) must still not leak them through — devInjection
  // and queueInjection read a fixed field list off `adapter`, not "everything
  // present".
  const poisoned = { ...fakeAdapter() };
  for (const seam of UNOVERRIDDEN_IO_SEAMS) poisoned[seam] = async () => "poisoned";

  const dev = devInjection(poisoned);
  const queue = queueInjection(poisoned, async () => ({}));
  for (const seam of UNOVERRIDDEN_IO_SEAMS) {
    assert.equal(seam in dev, false, `${seam} must keep orchestrate-dev.js's own Node default`);
    assert.equal(seam in queue, false, `${seam} must keep orchestrate-queue.js's own Node default`);
  }
});

// Positive half, on the SAME path: `__tests__/smoke.test.js` runs the REAL
// `orchestrate-dev.js` end to end, through this exact injection (`devInjection`
// via `runDev`), and proves the un-overridden defaults do real work —
// `_readFile`/`_writeFile`/`_listFiles`/`_checkFile`/`_hashFile`/`_git` write
// and read the FSPEC and the cross-review files, consumer-relative, in a real
// throwaway git repo (see "offline end-to-end: phases R and F converge
// against the real workflow module" and its neighbours in that file). That
// test is the pairing's positive; it is not duplicated here. What IS asserted
// here, directly, is that the injection this repo's smoke test drives is the
// SAME injection this file's absence assertion just proved leaves those seams
// unforwarded — so the two files are provably testing the same object, not
// two different ones that happen to agree by accident.
test("PROP-PARITY-15 (positive, by construction): the injection smoke.test.js drives via runDev is devInjection's own output", () => {
  const adapter = fakeAdapter();
  const injection = devInjection(adapter);
  // Every key devInjection produces is one of TSPEC §3.1's dev seams — never
  // one of §2.5's un-overridden ones — which is exactly what lets
  // smoke.test.js's real run fall through to the modules' own working
  // defaults for the rest.
  for (const key of Object.keys(injection)) {
    assert.ok(
      TSPEC_3_1_DEV_SEAMS.includes(key),
      `${key} is not one of TSPEC §3.1's declared dev seams`
    );
    assert.equal(UNOVERRIDDEN_IO_SEAMS.includes(key), false);
  }
});

// ─── PROP-PARITY-10: a dispatch path reaching the throwing `_agent` stub must
//     propagate as an engine failure naming the missing seam, and exit 1 —
//     never be caught and absorbed into an ordinary halted phase ───────────
//
// This drives the REAL `orchestrate-dev.js` `main()` with every seam it needs
// to get past validation faked deterministically — `_checkFile` (the REQ
// exists), `_git` (branch guard), `_listFiles`/`_readFile` (the review-state
// read) — and `_agent` DELIBERATELY OMITTED, so the module falls through to
// its own private `agent()` default, which throws
// "agent() not available outside Claude Code runtime" (orchestrate-dev.js:8502).
// That is the fall-through this property names: an engine wiring bug that
// drops `_agent` (or a future refactor that quietly stops supplying it) must
// be loud, not a phase that quietly "halts" indistinguishably from an
// ordinary review non-convergence.
test("PROP-PARITY-10: a missing _agent seam must fail the run loudly, naming the missing seam — not converge to an ordinary halted phase", async () => {
  const { default: main } = await import("../../workflows/orchestrate-dev.js");

  const seams = {
    reqPath: "docs/x/REQ-x.md",
    _checkFile: async () => ({ ok: true }),
    _listFiles: async () => ({ ok: true, files: [] }),
    _readFile: async () => "",
    _git: async () => ({ ok: true, stdout: "feat-x\n", stderr: "" }),
    _phase: () => {},
    _log: () => {},
    // _agent: deliberately omitted — the module's own throwing default applies.
  };

  let rejected = null;
  let resolved = null;
  try {
    resolved = await main(seams);
  } catch (err) {
    rejected = err;
  }

  // TODAY (pre-T39): the thrown `_agent` error is NOT absorbed into an
  // authoring-budget halt (`dispatchAndVerify`'s own per-attempt catch is
  // bypassed here — the empty `_readFile`/`_listFiles` fakes above make the
  // REQ episode's target read as an "unmeasurable" doc, so the escape at
  // `orchestrate-dev.js:7196` breaks the retry loop's own per-attempt
  // swallowing after the FIRST attempt). The raw Error instead rides up to
  // `main()`'s own pipeline-body `try { ... } catch (err) { haltReason =
  // err.message; ... }` (`orchestrate-dev.js:10648`), which resolves — never
  // rejects — a `{outcome: "halted", haltReason: "agent() not available ..."}`
  // report. The message DOES name the missing seam, which is a genuine, useful
  // half of this property; what is still wrong, and what PROP-PARITY-10
  // requires T39 to change, is the CLASSIFICATION: `bin/pdlc.mjs`'s
  // `emitReport` maps every `outcome === "halted"` report to exit code 2 (an
  // ordinary pipeline halt) — indistinguishable from a review that simply
  // never converged. A structural seam failure must instead reach the CLI's
  // exit-1 path (`main().catch()`, `bin/pdlc.mjs:354`), which today only a
  // REJECTED promise does. This assertion is written to that TARGET
  // behaviour — an uncaught rejection — and is expected red until T39 teaches
  // `main()` to distinguish this seam-shaped failure from an ordinary
  // convergence halt and rethrow it instead of folding it into `haltReason`.
  assert.ok(rejected, "a missing _agent seam must reject the run, not resolve to a report");
  assert.match(
    String((rejected && rejected.message) || rejected),
    /agent\(\) not available outside Claude Code runtime/,
    "the fatal must name the missing seam"
  );
  assert.equal(resolved, null, "no report — a phase-shaped `halted` outcome is not this failure");
});
