// Tests for pdlc/engine/__tests__/_bootstrap.mjs's hermeticity layers
// (TSPEC §7.1, AC-6.1, BR-VER-1; PROPERTIES PROP-VER-1, PROP-VER-2,
// PROP-VER-3, PROP-VER-4, PROP-VER-6; AT-ENG-63).
//
// Scope of THIS file (per PLAN's task table: T02 -> T12). PROP-VER-5's
// suite-wide "exactly one trap fire" property reads the cross-process
// observation accumulator and lives in `assert-suite-wide.test.js` (T03),
// not here — this file never touches that seam.
//
// `_bootstrap.mjs` does not exist yet (T12, batch 3): this is batch 2's RED
// test for it, and is expected to fail as a whole file (module not found)
// until T12 lands, per PLAN §5's batch-2 gate — a red T02 for that reason
// is the intended state, not a defect.
//
// Contract this file pins for `_bootstrap.mjs` (recorded here because no
// other document commits to exact export names or the interception point):
//   - importing the module installs both layers as a side effect. That is
//     what makes `--import` sufficient with no call site of its own
//     (TSPEC §7.0's table, row 1) — a bootstrap merely `import`ed by some
//     files would only guard those files' own processes (PROP-VER-2).
//   - it exports `HermeticityViolationError`, thrown by both layers.
//   - on install it also sets `globalThis.__PDLC_HERMETICITY_GUARD_INSTALLED__
//     = true` — a safe, side-effect-free marker this file's PROP-VER-6 case
//     reads instead of provoking a real, unguarded `claude` spawn.
//   - the construction guard intercepts `node:child_process`'s
//     `spawn`/`execFile` whenever the invoked command's basename is
//     exactly "claude" — the one choke point both the real SDK client
//     (which spawns a `claude` child process under the hood — confirmed
//     against `node_modules/@anthropic-ai/claude-agent-sdk/sdk.mjs`, which
//     imports `node:child_process` and calls `.spawn(...)`) and a direct
//     `claude -p` fallback spawn share, and the only interception point
//     precise enough not to trip on this suite's own legitimate child
//     spawns (`cli.test.js`, `adapter.test.js`, `smoke.test.js` all spawn
//     `node ...` directly, never `claude`).
//   - the socket trap patches `net.Socket.prototype.connect` and the `tls`
//     path unconditionally.
//
// Every test below that could otherwise provoke a REAL `claude` spawn or a
// real outbound connection only does so once the guard/trap is already
// installed in that process — the interception is synchronous and always
// happens before any real OS-level attempt, so no test in this file ever
// performs one.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { spawnSync, spawn as nodeSpawn, execFile as nodeExecFile } from "node:child_process";
import net from "node:net";
import tls from "node:tls";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// `_bootstrap.mjs` also carries §7.0's observation writer, which "fails
// loudly if [PDLC_TEST_RUN_ID] is unset rather than minting one" (TSPEC
// §7.0). That half is T01/T12's concern, not this file's — but importing
// the module runs all of its side effects at once, so a scratch run
// directory is supplied defensively here rather than leaving this file's
// own import (and every child spawned below) hostage to a check this file
// never exercises.
const scratchRunDir = fs.mkdtempSync(path.join(os.tmpdir(), "pdlc-hermeticity-test-"));
process.env.PDLC_TEST_RUN_ID = "hermeticity-test-run";
process.env.PDLC_TEST_RUN_DIR = scratchRunDir;

const bootstrapPath = fileURLToPath(new URL("./_bootstrap.mjs", import.meta.url));

const { HermeticityViolationError } = await import("./_bootstrap.mjs");
const { createTransport } = await import("../lib/transport.mjs");

test("PROP-VER-3/AT-ENG-63: the socket trap fires on a deliberate net.connect attempt", () => {
  assert.throws(
    () => net.connect({ host: "example.invalid", port: 443 }),
    (err) => {
      assert.ok(
        err instanceof HermeticityViolationError,
        `expected HermeticityViolationError, got ${err && err.name}: ${err && err.message}`,
      );
      return true;
    },
  );
});

test("PROP-VER-3: the socket trap covers net.Socket.prototype.connect used directly", () => {
  assert.throws(
    () => new net.Socket().connect({ host: "example.invalid", port: 443 }),
    (err) => err instanceof HermeticityViolationError,
  );
});

test("PROP-VER-3: the socket trap covers the tls path", () => {
  assert.throws(
    () => tls.connect({ host: "example.invalid", port: 443 }),
    (err) => err instanceof HermeticityViolationError,
  );
});

test("PROP-VER-4/AT-ENG-63/DEC-ORACLE-01: the trap is itself tested — a deliberate connection attempt trips it, proving it fired rather than merely being present as dead code", () => {
  let tripped = false;
  try {
    net.connect({ host: "example.invalid", port: 443 });
  } catch (err) {
    tripped = err instanceof HermeticityViolationError;
  }
  assert.equal(
    tripped,
    true,
    "a trap that never fires is indistinguishable from one that was never installed",
  );
});

test("PROP-VER-1: the construction guard fails a direct `claude` child_process.spawn (the fallback transport's construction path)", () => {
  assert.throws(
    () => nodeSpawn("claude", ["-p", "--output-format", "stream-json"]),
    (err) => err instanceof HermeticityViolationError,
  );
});

test("PROP-VER-1: the construction guard fails a direct `claude` child_process.execFile call too", () => {
  assert.throws(
    () => nodeExecFile("claude", ["--version"], () => {}),
    (err) => err instanceof HermeticityViolationError,
  );
});

test("PROP-VER-1: a transport built without an injected queryFn reaches the real SDK client, and the construction guard fails it (transport.mjs:135-136's default)", async () => {
  const transport = createTransport({});
  await assert.rejects(
    () => transport.dispatch("hermeticity guard probe", { timeoutMs: 5000 }),
    (err) => {
      // transport.mjs:98-124 wraps any thrown value that is not one of its
      // four typed errors in a `TransportError` carrying the original as
      // `.cause` — HermeticityViolationError is none of those four, so it
      // must survive unmodified as the cause rather than being swallowed.
      assert.equal(err.name, "TransportError");
      assert.ok(
        err.cause instanceof HermeticityViolationError,
        `expected the construction guard's error as the cause, got ${err.cause && err.cause.name}`,
      );
      return true;
    },
  );
});

test("PROP-VER-1: the guard does not block this suite's own, unrelated child spawns (only `claude` is intercepted)", () => {
  const result = spawnSync(process.execPath, ["--version"]);
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0);
});

test("PROP-VER-2: a fixture process that never imports the bootstrap itself is still guarded when --import preloads it (TSPEC §7.0/§7.1)", () => {
  const script = [
    'import { spawn } from "node:child_process";',
    "let outcome;",
    "try {",
    '  spawn("claude", ["--version"]);',
    '  outcome = "NO_THROW";',
    "} catch (err) {",
    '  outcome = err && err.name === "HermeticityViolationError" ? "GUARD_FIRED" : "WRONG_ERROR:" + (err && err.name);',
    "}",
    'console.log(outcome + "|" + Boolean(globalThis.__PDLC_HERMETICITY_GUARD_INSTALLED__));',
  ].join("\n");

  const result = spawnSync(
    process.execPath,
    [`--import=${bootstrapPath}`, "--input-type=module", "-e", script],
    { encoding: "utf8", env: process.env },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    result.stdout.trim(),
    "GUARD_FIRED|true",
    `a process that opted into nothing beyond --import should still be guarded; stdout=${result.stdout} stderr=${result.stderr}`,
  );
});

test("PROP-VER-6: the guard's scope is the process that opts in via --import, not the parent test runner (TSPEC §7.1's 'per process, not suite-wide')", () => {
  // Deliberately no `--import` and no import of the bootstrap here: this
  // file's own process (the parent) already installed the guard via the
  // top-level import above, so this only proves the correct scope if that
  // installation does NOT leak into this unguarded child. It never
  // attempts a real `claude` spawn (which an unguarded process would let
  // through for real) — it only reads the install marker.
  const script = 'console.log(Boolean(globalThis.__PDLC_HERMETICITY_GUARD_INSTALLED__));';

  const result = spawnSync(process.execPath, ["--input-type=module", "-e", script], {
    encoding: "utf8",
    env: process.env,
  });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    result.stdout.trim(),
    "false",
    `a child that never opted in (no --import, no import of its own) must not inherit the parent's guard; stdout=${result.stdout} stderr=${result.stderr}`,
  );
});
