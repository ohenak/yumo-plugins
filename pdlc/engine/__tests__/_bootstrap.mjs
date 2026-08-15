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
import fs from "node:fs";
import { appendFileSync, mkdirSync } from "node:fs";

export class HermeticityViolationError extends Error {
  constructor(message) {
    super(message);
    this.name = "HermeticityViolationError";
  }
}

// --- 0. run-id presence guard ------------------------------------------------
//
// Fails loudly, at import time, when PDLC_TEST_RUN_ID (or its derived
// PDLC_TEST_RUN_DIR) is unset — rather than minting a private id/dir on
// first use. This is the same rule `writeObservation` below enforces at
// call time; asserting it here too means an unset id is caught the moment
// this module is preloaded into a test-file child process, even for a test
// file that never calls `writeObservation` itself (PROP-SUITE-3).
if (!process.env.PDLC_TEST_RUN_ID || !process.env.PDLC_TEST_RUN_DIR) {
  throw new Error(
    "hermeticity bootstrap: PDLC_TEST_RUN_ID and PDLC_TEST_RUN_DIR must both be set " +
      "by the suite runner before this bootstrap is imported — it never mints its own " +
      "(TSPEC §7.0)",
  );
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

// --- 4. fs read recorder (TSPEC §7.7, PLAN T43) ------------------------------
//
// A wrapper over `node:fs`'s read entry points, patched here so it is live for
// the *whole* run once this bootstrap loads — including a later dynamic
// `import()` of the workflow modules (TSPEC §7.7's "scope" row) — but only
// collects while a test has opted in via `startFsReadRecording()`. Disabled
// by default (`fsReadRecording === null`) so every other test file's `fs`
// traffic pays only a null-check, not an array push.
//
// Patched on the shared `fs` object itself (the same reference this file's
// own `fs.readFileSync` calls above use), not on a per-caller function
// binding: a caller that does `import fs from "node:fs"` and then invokes
// `fs.readFileSync(...)` (property access at call time, e.g. the engine's
// `lib/skills.mjs`, `lib/handshake.mjs`) observes the patch; a caller that
// destructures a named export (`import { readFileSync } from "node:fs"`)
// captures Node's own frozen builtin binding at link time and is not
// reachable this way — the same non-live-binding limitation §7.1 above
// documents for `child_process.spawn`'s named-import shape, and, like that
// guard, not the interception point this recorder relies on.

let fsReadRecording = null; // null = disabled; an array once a test starts recording

function resolvedReadPath(pathArg) {
  if (typeof pathArg === "string") return path.resolve(pathArg);
  if (Buffer.isBuffer(pathArg)) return path.resolve(pathArg.toString());
  if (pathArg instanceof URL) return path.resolve(pathArg.pathname);
  return null; // a file descriptor (number) or other non-path input — nothing to record
}

function recordFsRead(pathArg) {
  if (fsReadRecording === null) return;
  const resolved = resolvedReadPath(pathArg);
  if (resolved !== null) fsReadRecording.push(resolved);
}

const realReadFileSync = fs.readFileSync;
fs.readFileSync = function recordedReadFileSync(pathArg, ...rest) {
  recordFsRead(pathArg);
  return realReadFileSync.call(this, pathArg, ...rest);
};

const realOpenSync = fs.openSync;
fs.openSync = function recordedOpenSync(pathArg, ...rest) {
  recordFsRead(pathArg);
  return realOpenSync.call(this, pathArg, ...rest);
};

const realCreateReadStream = fs.createReadStream;
fs.createReadStream = function recordedCreateReadStream(pathArg, ...rest) {
  recordFsRead(pathArg);
  return realCreateReadStream.call(this, pathArg, ...rest);
};

const realPromisesReadFile = fs.promises.readFile;
fs.promises.readFile = function recordedPromisesReadFile(pathArg, ...rest) {
  recordFsRead(pathArg);
  return realPromisesReadFile.call(this, pathArg, ...rest);
};

const realPromisesOpen = fs.promises.open;
fs.promises.open = function recordedPromisesOpen(pathArg, ...rest) {
  recordFsRead(pathArg);
  return realPromisesOpen.call(this, pathArg, ...rest);
};

// Enables recording; call before the window whose reads should be observed.
export function startFsReadRecording() {
  fsReadRecording = [];
}

// Disables recording and returns the total, append-only list of resolved
// absolute path strings read while recording was on, in read order,
// duplicates included — never deduplicated into a set (TSPEC §7.7).
export function stopFsReadRecording() {
  const records = fsReadRecording === null ? [] : fsReadRecording;
  fsReadRecording = null;
  return records;
}

// --- install marker -----------------------------------------------------------
//
// A safe, side-effect-free flag a test can read instead of provoking a real,
// unguarded `claude` spawn to prove installation happened (PROP-VER-6).
globalThis.__PDLC_HERMETICITY_GUARD_INSTALLED__ = true;
