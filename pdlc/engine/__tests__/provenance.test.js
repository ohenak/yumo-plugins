// Tests for pdlc/engine/lib/provenance.mjs (TSPEC §7.1, §3.2; PROP-PROV-1;
// AT-4.1, AT-4.3). Scoped narrowly to construction and rendering in
// isolation: `buildProvenance` is the single construction site, its
// returned value is frozen plain data with no fs/env/clock access, and
// `line`/`block` are pure renderers over that value (TSPEC §3.2's "pure; no
// fs, no env" dependency-direction rule). Wiring the seam into the workflow
// modules, the run report and the commit sites is out of scope here — that
// is PROP-PROV-2..18's concern, carried by later tasks.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

// `buildProvenance`/`NO_PROVENANCE` are imported lazily inside each test body
// below (dynamic `await import(...)`) rather than statically here:
// `lib/provenance.mjs` is owned by T27 and does not exist yet, and a
// top-level static import of a missing module would fail the whole file at
// load time before any `.skip` could take effect.

// A well-formed input to `buildProvenance`, matching §7.1's `Provenance`
// shape's *inputs* (everything but `line`/`block`, which the module derives).
function makeInput(overrides = {}) {
  return {
    engineVersion: "0.3.1",
    pluginVersion: "1.4.0",
    pluginCompat: "^1.0.0",
    channel: "engine",
    mode: "pin",
    pin: "0.3.1",
    loadRoot: "/fake-load-root",
    ...overrides,
  };
}

// ── frozen, plain-data (§7.1, PROP-PROV-1) ─────────────────────────────────

test.skip("T27: buildProvenance() returns a frozen value", async () => {
  const { buildProvenance } = await import("../lib/provenance.mjs");
  const p = buildProvenance(makeInput());
  assert.equal(Object.isFrozen(p), true);
});

test.skip("T27: buildProvenance() returns plain data — no function-typed properties", async () => {
  const { buildProvenance } = await import("../lib/provenance.mjs");
  const p = buildProvenance(makeInput());
  for (const [key, value] of Object.entries(p)) {
    assert.notEqual(typeof value, "function", `property ${key} must not be a function`);
  }
});

test.skip("T27: buildProvenance() returns a value that JSON round-trips byte-for-byte", async () => {
  const { buildProvenance } = await import("../lib/provenance.mjs");
  const p = buildProvenance(makeInput());
  const roundTripped = JSON.parse(JSON.stringify(p));
  assert.deepEqual(roundTripped, { ...p });
});

test.skip("T27: NO_PROVENANCE is frozen and carries empty line/block (P-1, default-inert)", async () => {
  const { NO_PROVENANCE } = await import("../lib/provenance.mjs");
  assert.equal(Object.isFrozen(NO_PROVENANCE), true);
  assert.equal(NO_PROVENANCE.line, "");
  assert.equal(NO_PROVENANCE.block, "");
});

// ── no fs, env or clock access (§3.2, PROP-PROV-1) ─────────────────────────
//
// A recorder wraps the three global surfaces `buildProvenance` must never
// touch. The negative leg constructs under the recorder and asserts a zero
// call count on each. The positive-control leg proves the recorder itself
// is live — not a no-op that would make the negative leg pass vacuously —
// by running a deliberately impure variant through the same recorder and
// asserting it DOES observe calls.

function withRecordedGlobals(fn) {
  const calls = { fs: 0, env: 0, clock: 0 };

  const originalReadFileSync = fs.readFileSync;
  const originalExistsSync = fs.existsSync;
  const originalNow = Date.now;
  const originalEnv = Object.getOwnPropertyDescriptor(process, "env");

  fs.readFileSync = function recordedReadFileSync(...args) {
    calls.fs += 1;
    return originalReadFileSync.apply(this, args);
  };
  fs.existsSync = function recordedExistsSync(...args) {
    calls.fs += 1;
    return originalExistsSync.apply(this, args);
  };
  Date.now = function recordedNow(...args) {
    calls.clock += 1;
    return originalNow.apply(this, args);
  };
  const recordedEnv = new Proxy(originalEnv.value, {
    get(target, prop, receiver) {
      calls.env += 1;
      return Reflect.get(target, prop, receiver);
    },
  });
  Object.defineProperty(process, "env", { value: recordedEnv, configurable: true });

  try {
    fn();
  } finally {
    fs.readFileSync = originalReadFileSync;
    fs.existsSync = originalExistsSync;
    Date.now = originalNow;
    Object.defineProperty(process, "env", originalEnv);
  }

  return calls;
}

test.skip("T27: PROP-PROV-1: buildProvenance() makes zero fs/env/clock calls", async () => {
  const { buildProvenance } = await import("../lib/provenance.mjs");
  const calls = withRecordedGlobals(() => {
    buildProvenance(makeInput());
  });
  assert.deepEqual(calls, { fs: 0, env: 0, clock: 0 });
});

// Positive control: proves the recorder above is live, not a no-op that
// would let the previous test pass vacuously against a broken recorder.
test("PROP-PROV-1 positive control: the recorder observes calls a deliberately impure variant makes", () => {
  function impureVariant() {
    fs.existsSync("/definitely-not-a-real-path-for-this-control");
    void process.env.PATH;
    Date.now();
  }

  const calls = withRecordedGlobals(() => {
    impureVariant();
  });

  assert.ok(calls.fs > 0, "recorder must observe the impure variant's fs call");
  assert.ok(calls.env > 0, "recorder must observe the impure variant's env access");
  assert.ok(calls.clock > 0, "recorder must observe the impure variant's clock call");
});

// ── line/block are pure renderers, rendered by the single writer (§7.1) ────

test.skip("T27: buildProvenance() renders line and block as non-empty strings for a populated input", async () => {
  const { buildProvenance } = await import("../lib/provenance.mjs");
  const p = buildProvenance(makeInput());
  assert.equal(typeof p.line, "string");
  assert.equal(typeof p.block, "string");
  assert.ok(p.line.length > 0);
  assert.ok(p.block.length > 0);
});

test.skip("T27: buildProvenance() is a pure renderer — same input twice yields byte-identical line/block", async () => {
  const { buildProvenance } = await import("../lib/provenance.mjs");
  const first = buildProvenance(makeInput());
  const second = buildProvenance(makeInput());
  assert.equal(first.line, second.line);
  assert.equal(first.block, second.block);
});

// ── AT-4.1: the report-facing pair (engine + plugin version) is stated ─────

test.skip("T27: AT-4.1: buildProvenance() states both engineVersion and pluginVersion as distinct fields", async () => {
  const { buildProvenance } = await import("../lib/provenance.mjs");
  const p = buildProvenance(makeInput({ engineVersion: "0.3.1", pluginVersion: "1.4.0" }));
  assert.equal(p.engineVersion, "0.3.1");
  assert.equal(p.pluginVersion, "1.4.0");
  assert.notEqual(p.engineVersion, p.pluginVersion);
});

test.skip("T27: AT-4.1: line/block render both the engine and plugin version so the pair is nameable from rendered text", async () => {
  const { buildProvenance } = await import("../lib/provenance.mjs");
  const p = buildProvenance(makeInput({ engineVersion: "0.3.1", pluginVersion: "1.4.0" }));
  assert.ok(p.line.includes("0.3.1"), "line must name the engine version");
  assert.ok(p.line.includes("1.4.0"), "line must name the plugin version");
  assert.ok(p.block.includes("0.3.1"), "block must name the engine version");
  assert.ok(p.block.includes("1.4.0"), "block must name the plugin version");
});

test.skip("T27: AT-4.1: pluginVersion may be null (no plugin found) without throwing", async () => {
  const { buildProvenance } = await import("../lib/provenance.mjs");
  const p = buildProvenance(makeInput({ pluginVersion: null }));
  assert.equal(p.pluginVersion, null);
  assert.equal(typeof p.line, "string");
  assert.equal(typeof p.block, "string");
});

// ── AT-4.3: two engine versions differ in the rendered artifacts ───────────

test.skip("T27: AT-4.3: two runs on different engine versions render different line text", async () => {
  const { buildProvenance } = await import("../lib/provenance.mjs");
  const a = buildProvenance(makeInput({ engineVersion: "0.3.1" }));
  const b = buildProvenance(makeInput({ engineVersion: "0.4.0" }));
  assert.notEqual(a.line, b.line);
});

test.skip("T27: AT-4.3: two runs on different engine versions render different block text", async () => {
  const { buildProvenance } = await import("../lib/provenance.mjs");
  const a = buildProvenance(makeInput({ engineVersion: "0.3.1" }));
  const b = buildProvenance(makeInput({ engineVersion: "0.4.0" }));
  assert.notEqual(a.block, b.block);
});

test.skip("T27: AT-4.3: two runs on the same engine version render identical line/block", async () => {
  const { buildProvenance } = await import("../lib/provenance.mjs");
  const a = buildProvenance(makeInput({ engineVersion: "0.3.1" }));
  const b = buildProvenance(makeInput({ engineVersion: "0.3.1" }));
  assert.equal(a.line, b.line);
  assert.equal(a.block, b.block);
});
