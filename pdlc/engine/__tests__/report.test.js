// Tests for pdlc/engine/lib/report.mjs — pure report-provenance stamping
// (Phase 4, pdlc-headless-engine). No fs, no clock, no process.

import { test } from "node:test";
import assert from "node:assert/strict";

import { buildEngineBlock, stampReport } from "../lib/report.mjs";

test("buildEngineBlock always carries every field, defaulting unknowns to null", () => {
  const block = buildEngineBlock();
  assert.deepEqual(block, {
    engineVersion: null,
    pluginVersion: null,
    pluginRoot: null,
    transport: "agent-sdk",
    apiKeySource: null,
    baseUrl: null,
    pauses: [],
    startedAt: null,
    finishedAt: null,
  });
});

test("buildEngineBlock forwards every supplied field verbatim", () => {
  const pauses = [{ attempt: 1, waitedMs: 30000 }];
  const block = buildEngineBlock({
    engineVersion: "0.1.0",
    pluginVersion: "0.22.0",
    pluginRoot: "/plugin",
    apiKeySource: "none",
    baseUrl: "http://127.0.0.1:8787",
    pauses,
    startedAt: "2026-08-08T00:00:00.000Z",
    finishedAt: "2026-08-08T00:05:00.000Z",
  });
  assert.equal(block.engineVersion, "0.1.0");
  assert.equal(block.pluginVersion, "0.22.0");
  assert.equal(block.pluginRoot, "/plugin");
  assert.equal(block.transport, "agent-sdk");
  assert.equal(block.apiKeySource, "none");
  assert.equal(block.baseUrl, "http://127.0.0.1:8787");
  assert.deepEqual(block.pauses, pauses);
  assert.notEqual(block.pauses, pauses, "pauses must be copied, not the same array reference");
  assert.equal(block.startedAt, "2026-08-08T00:00:00.000Z");
  assert.equal(block.finishedAt, "2026-08-08T00:05:00.000Z");
});

test("buildEngineBlock copies a non-array pauses input to an empty array", () => {
  const block = buildEngineBlock({ pauses: null });
  assert.deepEqual(block.pauses, []);
});

test("stampReport extends the module's report with an engine block, without mutating it", () => {
  const report = Object.freeze({ outcome: "success", feature: "x", phases: [] });
  const engine = buildEngineBlock({ engineVersion: "0.1.0" });
  const stamped = stampReport(report, engine);

  assert.equal(stamped.outcome, "success");
  assert.equal(stamped.feature, "x");
  assert.deepEqual(stamped.phases, []);
  assert.deepEqual(stamped.engine, engine);
  assert.notEqual(stamped, report, "must return a new object");
});

test("stampReport tolerates a null report (engine refused before any module ran)", () => {
  const engine = buildEngineBlock({ engineVersion: "0.1.0" });
  const stamped = stampReport(null, engine);
  assert.deepEqual(stamped, { engine });
});
