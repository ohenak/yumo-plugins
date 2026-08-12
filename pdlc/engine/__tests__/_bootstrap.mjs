// _bootstrap.mjs — hermeticity bootstrap v1 (TSPEC §7.0, §7.1; PLAN T12).
//
// Preloaded via `node --test --import=./__tests__/_bootstrap.mjs __tests__/`
// (TSPEC §7.0 step 3), so every side effect below runs once per test-file
// child process, before that file's own module body executes. A file that
// only `import`s this module directly (as `hermeticity.test.js` does) gets
// the same installation, since the effects below run at module evaluation.
//
// Two concerns land in this first increment; the observation writer and the
// `fs` recorder follow in later increments of this same file (T19, T43):
//   1. Construction guard — fails any attempt to spawn a `claude` child
//      process (`node:child_process` spawn/execFile), the one choke point
//      shared by the real SDK client and a direct `claude -p` fallback
//      (TSPEC §7.1 layer 2).
//   2. Socket trap — fails any outbound `net`/`tls` connection attempt
//      (TSPEC §7.1 layer 3).
//
// Both traps patch the lowest shared prototype method rather than the
// top-level `spawn`/`execFile`/`connect` functions those callers happen to
// use — measured on this repo's node v20.20.1: `import { spawn } from
// "node:child_process"` (the SDK's own import shape, confirmed against
// `node_modules/@anthropic-ai/claude-agent-sdk/sdk.mjs`) captures a
// snapshot of the original function at import time and is **not** a live
// binding, so reassigning `childProcess.spawn` after that import leaves a
// prior named-imported reference untouched. `child_process.spawn`,
// `.execFile`, and every constructor path all funnel through one instance
// method, `ChildProcess.prototype.spawn(options)`, and `net.connect` /
// `new net.Socket().connect()` / `tls.connect` all funnel through
// `net.Socket.prototype.connect` the same way — patching those two
// prototype methods is therefore the one interception point precise
// enough to catch every call shape regardless of which top-level export a
// caller imported.

import childProcess from "node:child_process";
import net from "node:net";
import tls from "node:tls";
import path from "node:path";
import { appendFileSync, mkdirSync } from "node:fs";

export class HermeticityViolationError extends Error {
  constructor(message) {
    super(message);
    this.name = "HermeticityViolationError";
  }
}

// --- 1. Construction guard --------------------------------------------------

function commandBasename(command) {
  if (typeof command !== "string") return "";
  return path.basename(command);
}

const realChildProcessSpawn = childProcess.ChildProcess.prototype.spawn;
childProcess.ChildProcess.prototype.spawn = function guardedInstanceSpawn(options) {
  const command = options && options.file;
  if (commandBasename(command) === "claude") {
    throw new HermeticityViolationError(
      `hermeticity guard: blocked an attempt to spawn "${command}" — the real ` +
        "`claude` transport must never be constructed inside this suite (TSPEC §7.1)",
    );
  }
  return realChildProcessSpawn.call(this, options);
};

// Belt-and-suspenders for the (namespace-object) call shape that *is* live:
// `import childProcess from "node:child_process"; childProcess.spawn(...)`.
// Not load-bearing on its own (the prototype patch above already covers
// every shape), but keeps a namespace-object caller's stack trace pointing
// at this guard rather than at the instance method.
function guardTopLevelCommand(command) {
  if (commandBasename(command) === "claude") {
    throw new HermeticityViolationError(
      `hermeticity guard: blocked an attempt to spawn "${command}" — the real ` +
        "`claude` transport must never be constructed inside this suite (TSPEC §7.1)",
    );
  }
}

const realSpawn = childProcess.spawn;
childProcess.spawn = function guardedSpawn(command, ...rest) {
  guardTopLevelCommand(command);
  return realSpawn.call(this, command, ...rest);
};

const realExecFile = childProcess.execFile;
childProcess.execFile = function guardedExecFile(command, ...rest) {
  guardTopLevelCommand(command);
  return realExecFile.call(this, command, ...rest);
};

// --- 2. Socket trap ----------------------------------------------------------

net.Socket.prototype.connect = function guardedConnect() {
  throw new HermeticityViolationError(
    "hermeticity guard: blocked an outbound net/tls connection attempt — this " +
      "suite must never reach the network (TSPEC §7.1)",
  );
};

// Belt-and-suspenders for namespace-object callers, same rationale as above;
// every call shape is already caught by the prototype patch.
function guardedTopLevelConnect() {
  return net.Socket.prototype.connect.apply(new net.Socket(), arguments);
}
net.connect = guardedTopLevelConnect;
net.createConnection = guardedTopLevelConnect;
tls.connect = guardedTopLevelConnect;

// --- 3. Observation writer ---------------------------------------------------
//
// Appends one JSON-line record to this run's per-pid file under
// `PDLC_TEST_RUN_DIR` (TSPEC §7.0's cross-process accumulator). Both env
// vars are minted once, by `_run-suite.mjs`, before any child exists — this
// module only ever reads them, and fails loudly rather than minting a
// private run id/dir on first use (TSPEC §7.0, PROP-SUITE-3): a bootstrap
// that mints its own id per process is exactly the v1.1 defect §7.0 records.
export function writeObservation(record) {
  const runId = process.env.PDLC_TEST_RUN_ID;
  const runDir = process.env.PDLC_TEST_RUN_DIR;
  if (!runId || !runDir) {
    throw new Error(
      "hermeticity bootstrap: PDLC_TEST_RUN_ID and PDLC_TEST_RUN_DIR must both be set " +
        "by the suite runner before any observation is written — this module never " +
        "mints its own (TSPEC §7.0)",
    );
  }
  mkdirSync(runDir, { recursive: true });
  const file = path.join(runDir, `${process.pid}.jsonl`);
  appendFileSync(file, `${JSON.stringify(record)}\n`);
}

// --- install marker -----------------------------------------------------------
//
// A safe, side-effect-free flag a test can read instead of provoking a real,
// unguarded `claude` spawn to prove installation happened (PROP-VER-6).
globalThis.__PDLC_HERMETICITY_GUARD_INSTALLED__ = true;
