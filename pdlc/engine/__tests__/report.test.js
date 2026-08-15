// Tests for pdlc/engine/lib/report.mjs — pure report-provenance stamping
// (TSPEC §4.5, T40). No fs, no clock, no process.
//
// Scope note: pdlc/engine/__tests__/report-engine.test.js is the T32-owned
// spec-shape ledger (every §4.5 field, present-and-zero counts, the
// CLI-level refusal-still-emits-a-report clauses). This file covers
// `buildEngineBlock`/`stampReport` unit behaviour: field forwarding,
// defensive copying, and default shapes.

import { test } from "node:test";
import assert from "node:assert/strict";

import { buildEngineBlock, stampReport } from "../lib/report.mjs";

test("buildEngineBlock with no args carries every §4.5 field, defaulting unknowns", () => {
  const block = buildEngineBlock();
  assert.deepEqual(block, {
    engineVersion: null,
    pluginVersion: null,
    pluginRoot: null,
    startupAuth: null,
    transport: "agent-sdk",
    authSources: [],
    baseUrl: null,
    startup: [],
    dispatches: { bySkill: {}, byPhase: {} },
    retries: [],
    pauses: [],
    denials: [],
    tunables: null,
    permissionMode: null,
    loop: null,
    outcomes: { ran: 0, halted: 0, blocked: 0, refused: 0, "max-passes": 0, idle: 0 },
    startedAt: null,
    finishedAt: null,
  });
});

test("buildEngineBlock forwards every supplied field verbatim", () => {
  const authSources = [{ skill: "pm-author", phase: "Phase R", attempt: 0, apiKeySource: "none" }];
  const startup = [{ rung: 1, name: "plugin resolution", state: "pass", detail: null }];
  const retries = [{ timestamp: 1, skill: "pm-author", phase: "Phase R", attempt: 1, outcome: "timeout", delayMs: 500 }];
  const pauses = [{ attempt: 1, waitedMs: 30000 }];
  const denials = [{ skill: "se-implement", phase: "Phase I", tool: "Bash" }];
  const dispatches = { bySkill: { "pm-author": 1 }, byPhase: { "Phase R": 1 } };
  const tunables = { retryAttempts: 3, retryBackoff: 2000, timeoutMinutes: 20, maxIterations: 5 };
  const loop = { iterations: 2, maxIterations: null, stopReason: "exhausted", lastOutcome: "ran" };
  const outcomes = { ran: 1, halted: 0, blocked: 0, refused: 0, "max-passes": 0, idle: 0 };

  const block = buildEngineBlock({
    engineVersion: "0.1.0",
    pluginVersion: "0.22.0",
    pluginRoot: "/plugin",
    startupAuth: { row: "5", catalogueId: "auth.env-api-key" },
    transport: "cli-headless",
    authSources,
    baseUrl: "http://127.0.0.1:8787",
    startup,
    dispatches,
    retries,
    pauses,
    denials,
    tunables,
    permissionMode: "acceptEdits",
    loop,
    outcomes,
    startedAt: "2026-08-08T00:00:00.000Z",
    finishedAt: "2026-08-08T00:05:00.000Z",
  });

  assert.equal(block.engineVersion, "0.1.0");
  assert.equal(block.pluginVersion, "0.22.0");
  assert.equal(block.pluginRoot, "/plugin");
  assert.deepEqual(block.startupAuth, { row: "5", catalogueId: "auth.env-api-key" });
  assert.equal(block.transport, "cli-headless", "transport must be forwarded verbatim, never clamped to \"agent-sdk\"");
  assert.deepEqual(block.authSources, authSources);
  assert.equal(block.baseUrl, "http://127.0.0.1:8787");
  assert.deepEqual(block.startup, startup);
  assert.deepEqual(block.dispatches, dispatches);
  assert.deepEqual(block.retries, retries);
  assert.deepEqual(block.pauses, pauses);
  assert.deepEqual(block.denials, denials);
  assert.deepEqual(block.tunables, tunables);
  assert.equal(block.permissionMode, "acceptEdits");
  assert.deepEqual(block.loop, loop);
  assert.deepEqual(block.outcomes, outcomes);
  assert.equal(block.startedAt, "2026-08-08T00:00:00.000Z");
  assert.equal(block.finishedAt, "2026-08-08T00:05:00.000Z");
});

test("buildEngineBlock copies array-shaped fields defensively, never aliasing the caller's array", () => {
  const authSources = [{ skill: "pm-author", phase: "Phase R", attempt: 0, apiKeySource: "none" }];
  const startup = [{ rung: 1, name: "plugin resolution", state: "pass", detail: null }];
  const retries = [{ timestamp: 1, skill: "pm-author", phase: "Phase R", attempt: 1, outcome: "timeout", delayMs: 500 }];
  const pauses = [{ attempt: 1, waitedMs: 30000 }];
  const denials = [{ skill: "se-implement", phase: "Phase I", tool: "Bash" }];

  const block = buildEngineBlock({ authSources, startup, retries, pauses, denials });

  assert.notEqual(block.authSources, authSources, "authSources must be copied, not the same array reference");
  assert.notEqual(block.startup, startup, "startup must be copied, not the same array reference");
  assert.notEqual(block.retries, retries, "retries must be copied, not the same array reference");
  assert.notEqual(block.pauses, pauses, "pauses must be copied, not the same array reference");
  assert.notEqual(block.denials, denials, "denials must be copied, not the same array reference");
  assert.deepEqual(block.authSources, authSources);
  assert.deepEqual(block.startup, startup);
  assert.deepEqual(block.retries, retries);
  assert.deepEqual(block.pauses, pauses);
  assert.deepEqual(block.denials, denials);
});

test("buildEngineBlock coerces a non-array collection field to an empty array rather than throwing", () => {
  const block = buildEngineBlock({ authSources: null, startup: undefined, retries: "nope", pauses: 42, denials: {} });
  assert.deepEqual(block.authSources, []);
  assert.deepEqual(block.startup, []);
  assert.deepEqual(block.retries, []);
  assert.deepEqual(block.pauses, []);
  assert.deepEqual(block.denials, []);
});

test("stampReport merges the engine block onto the module's report without mutating it", () => {
  const report = Object.freeze({ outcome: "ran", feature: "x", phases: [{ phase: "Phase R" }] });
  const engine = buildEngineBlock({ engineVersion: "0.1.0" });
  const stamped = stampReport(report, engine);

  assert.equal(stamped.outcome, "ran");
  assert.equal(stamped.feature, "x");
  assert.deepEqual(stamped.phases, [{ phase: "Phase R" }]);
  assert.deepEqual(stamped.engine, engine);
  assert.notEqual(stamped, report, "stampReport must return a new object, never mutate report in place");
});

test("stampReport stamps an empty base object when report is null or undefined", () => {
  const engine = buildEngineBlock({ engineVersion: "0.1.0" });
  assert.deepEqual(stampReport(null, engine), { engine });
  assert.deepEqual(stampReport(undefined, engine), { engine });
});
