// Tests `readEngineConfig` (REQ O-3, resolved: engine configuration lives in
// the consumer's `.claude/pdlc.config.json` — the same file the workflow
// modules read as MERGE_CONFIG_PATH). Companion to tunables.test.js, which
// covers `resolveTunables` itself: this file covers the file→config half, so
// together the two pin the whole path from bytes on disk to effective values.
//
// The reader must be TOTAL: a consumer with a malformed config gets defaults
// plus a notice, never an engine crash — an unattended `pdlc queue --loop`
// run must not turn a stray comma into exit 1.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import os from "node:os";

import { readEngineConfig, ENGINE_CONFIG_PATH, resolveTunables } from "../lib/run.mjs";

function consumerWith(configText) {
  const root = mkdtempSync(path.join(os.tmpdir(), "pdlc-engine-config-"));
  if (configText != null) {
    mkdirSync(path.join(root, ".claude"), { recursive: true });
    writeFileSync(path.join(root, ENGINE_CONFIG_PATH), configText);
  }
  return root;
}

test("readEngineConfig: no config file yields empty config and no notices", () => {
  const root = consumerWith(null);
  try {
    const { config, notices } = readEngineConfig({ cwd: root });
    assert.deepEqual(config, {});
    assert.deepEqual(notices, []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("readEngineConfig: dispatch.timeoutMinutes is read from the consumer config", () => {
  const root = consumerWith(JSON.stringify({ dispatch: { timeoutMinutes: 90 } }));
  try {
    const { config, notices } = readEngineConfig({ cwd: root });
    assert.deepEqual(config, { dispatch: { timeoutMinutes: 90 } });
    assert.deepEqual(notices, []);
    // The whole point of O-3: the file value becomes the stamped boundary value.
    const tunables = resolveTunables({ config });
    assert.equal(tunables.timeoutMinutes, 90);
    assert.equal(tunables.timeoutMs, 5_400_000);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("readEngineConfig: all three engine-config rows pass through together", () => {
  const root = consumerWith(
    JSON.stringify({
      dispatch: {
        retryAttempts: 5,
        timeoutMinutes: 45,
        retryBackoff: { baseMs: 10_000, capMs: 120_000 },
      },
    })
  );
  try {
    const { config, notices } = readEngineConfig({ cwd: root });
    assert.deepEqual(notices, []);
    const tunables = resolveTunables({ config });
    assert.equal(tunables.retryAttempts, 5);
    assert.equal(tunables.timeoutMinutes, 45);
    assert.deepEqual(tunables.retryBackoff, { baseMs: 10_000, capMs: 120_000 });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("readEngineConfig: a config with other sections but no dispatch is silent defaults", () => {
  // The shape this repo's real consumer config has today: implementation.*,
  // no dispatch. Must read as "nothing configured", not as a fault.
  const root = consumerWith(
    JSON.stringify({ implementation: { testCommand: "npm test" }, mergeMode: "off" })
  );
  try {
    const { config, notices } = readEngineConfig({ cwd: root });
    assert.deepEqual(config, {});
    assert.deepEqual(notices, []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("readEngineConfig: malformed JSON degrades to defaults with a notice, never a throw", () => {
  const root = consumerWith('{ "dispatch": { "timeoutMinutes": 90 ');
  try {
    let result;
    assert.doesNotThrow(() => {
      result = readEngineConfig({ cwd: root });
    });
    assert.deepEqual(result.config, {});
    assert.equal(result.notices.length, 1);
    assert.match(result.notices[0], /not readable JSON/);
    assert.match(result.notices[0], /\.claude\/pdlc\.config\.json/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("readEngineConfig: a non-object dispatch section is a notice plus defaults", () => {
  const root = consumerWith(JSON.stringify({ dispatch: "fast" }));
  try {
    const { config, notices } = readEngineConfig({ cwd: root });
    assert.deepEqual(config, {});
    assert.equal(notices.length, 1);
    assert.match(notices[0], /"dispatch" section .* is not an object/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("readEngineConfig: an invalid value is DROPPED with a notice, valid siblings survive", () => {
  // A string timeoutMinutes reaching `* 60 * 1000` would stamp NaN on every
  // dispatch — the invalid key must fall back to its default individually,
  // without dragging valid keys in the same section down with it.
  const root = consumerWith(
    JSON.stringify({ dispatch: { timeoutMinutes: "ninety", retryAttempts: 5 } })
  );
  try {
    const { config, notices } = readEngineConfig({ cwd: root });
    assert.deepEqual(config, { dispatch: { retryAttempts: 5 } });
    assert.equal(notices.length, 1);
    assert.match(notices[0], /dispatch\.timeoutMinutes/);
    const tunables = resolveTunables({ config });
    assert.equal(tunables.timeoutMinutes, 30, "invalid value falls back to the default");
    assert.equal(tunables.timeoutMs, 1_800_000);
    assert.equal(tunables.retryAttempts, 5, "valid sibling still applies");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("readEngineConfig: non-positive and non-finite numbers are invalid", () => {
  const root = consumerWith(
    JSON.stringify({
      dispatch: {
        timeoutMinutes: 0,
        retryAttempts: -1,
        retryBackoff: { baseMs: null, capMs: -5 },
      },
    })
  );
  try {
    const { config, notices } = readEngineConfig({ cwd: root });
    assert.deepEqual(config, {});
    assert.equal(notices.length, 4);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("readEngineConfig: operator-owned rows in the file never reach the effective values", () => {
  // BR-CLI-2 / BR-LOOP-2 end to end: even a config that names the two
  // flag-only tunables produces effective defaults — `readEngineConfig`
  // forwards only `dispatch`, and `resolveTunables` ignores the rest anyway.
  const root = consumerWith(
    JSON.stringify({
      auth: { allowApiKeyBilling: true },
      queue: { maxIterations: 1 },
      dispatch: { timeoutMinutes: 60 },
    })
  );
  try {
    const { config } = readEngineConfig({ cwd: root });
    assert.deepEqual(config, { dispatch: { timeoutMinutes: 60 } });
    const tunables = resolveTunables({ config });
    assert.equal(tunables.allowApiKeyBilling, false);
    assert.equal(tunables.maxIterations, Infinity);
    assert.equal(tunables.timeoutMinutes, 60);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// ─── TSPEC §6.4: the three-way `engine` discriminant ────────────────────────
//
// `readEngineConfig` gains a third return key, `engine`, carrying the pin's
// read discipline as a discriminated result: `{state: "absent"}` (no file, or
// no `engine` section), `{state: "no-pin", config}` (`engine` section present,
// no `version` key) or `{state: "unreadable", path, error}` (file exists but
// is not parseable JSON, or `engine` is not an object). This is read-only
// scaffolding for T28's ladder — this task only pins the reader's shape.

test("T28: readEngineConfig: no config file yields engine state absent", () => {
  const root = consumerWith(null);
  try {
    const { engine } = readEngineConfig({ cwd: root });
    assert.deepEqual(engine, { state: "absent" });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("T28: readEngineConfig: a config file with no engine section yields engine state absent", () => {
  const root = consumerWith(JSON.stringify({ dispatch: { timeoutMinutes: 90 } }));
  try {
    const { engine } = readEngineConfig({ cwd: root });
    assert.deepEqual(engine, { state: "absent" });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("T28: readEngineConfig: an engine section with no version key yields engine state no-pin", () => {
  const root = consumerWith(JSON.stringify({ engine: { foo: "bar" } }));
  try {
    const { engine } = readEngineConfig({ cwd: root });
    assert.equal(engine.state, "no-pin");
    assert.deepEqual(engine.config, { foo: "bar" });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("T28: readEngineConfig: an empty engine section yields engine state no-pin", () => {
  const root = consumerWith(JSON.stringify({ engine: {} }));
  try {
    const { engine } = readEngineConfig({ cwd: root });
    assert.equal(engine.state, "no-pin");
    assert.deepEqual(engine.config, {});
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("T28: readEngineConfig: unparseable JSON yields engine state unreadable naming the path and error", () => {
  // Same malformed-JSON shape as the totality test above (:90-104), which must
  // keep passing verbatim — this test only pins the new `engine` key on top.
  const root = consumerWith('{ "dispatch": { "timeoutMinutes": 90 ');
  const expectedPath = path.join(root, ENGINE_CONFIG_PATH);
  try {
    const { engine } = readEngineConfig({ cwd: root });
    assert.equal(engine.state, "unreadable");
    assert.equal(engine.path, expectedPath);
    assert.equal(typeof engine.error, "string");
    assert.ok(engine.error.length > 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("T28: readEngineConfig: a non-object engine section yields engine state unreadable, never no-pin", () => {
  const root = consumerWith(JSON.stringify({ engine: "0.3.1" }));
  const expectedPath = path.join(root, ENGINE_CONFIG_PATH);
  try {
    const { engine } = readEngineConfig({ cwd: root });
    assert.equal(engine.state, "unreadable");
    assert.equal(engine.path, expectedPath);
    assert.equal(typeof engine.error, "string");
    assert.ok(engine.error.length > 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("T28: readEngineConfig: dispatch notices are still produced when the file parses, alongside engine state absent", () => {
  // §6.4: the `notices` channel is kept, not replaced — the `dispatch`
  // tunables keep their current degrade-with-notice behaviour whenever the
  // file parses. Only the `engine` section gains the refusing read.
  const root = consumerWith(JSON.stringify({ dispatch: { timeoutMinutes: "ninety" } }));
  try {
    const { notices, engine } = readEngineConfig({ cwd: root });
    assert.equal(notices.length, 1);
    assert.match(notices[0], /dispatch\.timeoutMinutes/);
    assert.deepEqual(engine, { state: "absent" });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
