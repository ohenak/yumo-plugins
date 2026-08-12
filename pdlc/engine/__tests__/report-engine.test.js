// RED tests for the `engine` report block against FSPEC §12.2 and TSPEC §4.4/
// §4.5 (Phase 4, pdlc-headless-engine, T32 → T40).
//
// Scope: `pdlc/engine/lib/report.mjs`'s `buildEngineBlock`/`stampReport`
// TARGET shape (TSPEC §4.5) — the nine-row FSPEC §12.2 table, `retries[]` as
// a new field, present-and-zero counts, the "engine is the only key
// stampReport adds" invariant, and the one-JSON-line/last-line convention on
// both a completed run and a startup refusal (EC-REP-1). This file does not
// edit `report.mjs`; at HEAD several assertions below are expected to fail
// (`buildEngineBlock` still takes `apiKeySource`/a bare `pauses` list, not
// `startupAuth`/`authSources`/`dispatches`/`retries`/`tunables`/
// `permissionMode`, and a startup refusal never reaches `emitReport` at all)
// — see PROPERTIES-pdlc-headless-engine.md PROP-REP-1/2/4/6/7/8/9/11/12/13/
// 14/16 and PROP-TUNE-1/5 for the row-by-row red/green ledger this file
// transcribes into assertions.
//
// Covers AT-ENG-58, AT-ENG-59, AT-ENG-60, AT-ENG-66 (EC-REP-1, EC-REP-2,
// EC-REP-3 — one case each) and AT-ENG-68.

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { buildEngineBlock, stampReport } from "../lib/report.mjs";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(engineRoot));
const BIN = path.join(engineRoot, "bin", "pdlc.mjs");

// ─── §4.5's full block shape — the 18 keys `report.engine` carries ─────────

const ENGINE_BLOCK_KEYS = [
  "engineVersion",
  "pluginVersion",
  "pluginRoot",
  "startupAuth",
  "transport",
  "authSources",
  "baseUrl",
  "startup",
  "dispatches",
  "retries",
  "pauses",
  "denials",
  "tunables",
  "permissionMode",
  "loop",
  "outcomes",
  "startedAt",
  "finishedAt",
];

// A "completed fixture run" fixture — every §4.5 input filled with a
// distinguishable, non-default value so a field silently defaulted rather
// than threaded through is caught by an exact-value assertion rather than a
// mere presence check.
function completedRunArgs() {
  return {
    engineVersion: "0.1.0",
    pluginVersion: "0.22.0",
    pluginRoot: "/plugin",
    startupAuth: { row: "5", catalogueId: "auth.env-api-key" },
    transport: "agent-sdk",
    authSources: [
      { skill: "pm-author", phase: "Phase R", attempt: 0, apiKeySource: "none" },
      { skill: "se-author", phase: "Phase T", attempt: 0, apiKeySource: "none" },
    ],
    baseUrl: "http://127.0.0.1:8787",
    startup: [{ rung: 1, name: "plugin resolution", state: "pass", detail: null }],
    dispatches: { bySkill: { "pm-author": 1, "se-author": 1 }, byPhase: { "Phase R": 1, "Phase T": 1 } },
    retries: [{ timestamp: 1, skill: "pm-author", phase: "Phase R", attempt: 1, outcome: "timeout", delayMs: 500 }],
    pauses: [],
    denials: [],
    tunables: { retryAttempts: 3, retryBackoff: 2000, timeoutMinutes: 20, maxIterations: 5 },
    permissionMode: "acceptEdits",
    loop: null,
    outcomes: { ran: 1, halted: 0, blocked: 0, refused: 0, "max-passes": 0, idle: 0 },
    startedAt: "2026-08-08T00:00:00.000Z",
    finishedAt: "2026-08-08T00:05:00.000Z",
  };
}

// ─── AT-ENG-58: every §12.2 field present on a completed fixture run ───────

test("AT-ENG-58: buildEngineBlock's key set is exactly the TSPEC §4.5 shape", () => {
  const block = buildEngineBlock(completedRunArgs());
  assert.deepEqual(Object.keys(block).sort(), [...ENGINE_BLOCK_KEYS].sort());
});

test("AT-ENG-58: the pair — engine version with plugin version, always both", () => {
  const block = buildEngineBlock(completedRunArgs());
  assert.equal(block.engineVersion, "0.1.0");
  assert.equal(block.pluginVersion, "0.22.0");
});

test("AT-ENG-58/PROP-REP-16: startup auth catalogue id is the §5.1 row that decided, not prose", () => {
  const block = buildEngineBlock(completedRunArgs());
  assert.deepEqual(block.startupAuth, { row: "5", catalogueId: "auth.env-api-key" });
});

test("AT-ENG-58/§3.6: transport is observed (what resolveTransport returned), not a hardcoded literal", () => {
  const block = buildEngineBlock({ ...completedRunArgs(), transport: "cli-headless" });
  assert.equal(block.transport, "cli-headless", "a second transport kind must be forwarded verbatim, not clamped to \"agent-sdk\"");
});

test("AT-ENG-58/§4.4: transport-reported auth source is recorded per dispatch, not once per run", () => {
  const block = buildEngineBlock(completedRunArgs());
  assert.deepEqual(block.authSources, [
    { skill: "pm-author", phase: "Phase R", attempt: 0, apiKeySource: "none" },
    { skill: "se-author", phase: "Phase T", attempt: 0, apiKeySource: "none" },
  ]);
});

test("AT-ENG-58: effective base URL is null when direct, never absent", () => {
  assert.equal(buildEngineBlock({ ...completedRunArgs(), baseUrl: null }).baseUrl, null);
  assert.equal(buildEngineBlock(completedRunArgs()).baseUrl, "http://127.0.0.1:8787");
});

test("AT-ENG-58/§4.4: per-phase dispatch counts are keyed on the normalised phase, not on label", () => {
  const block = buildEngineBlock(completedRunArgs());
  assert.deepEqual(block.dispatches, {
    bySkill: { "pm-author": 1, "se-author": 1 },
    byPhase: { "Phase R": 1, "Phase T": 1 },
  });
});

test("AT-ENG-58: retry and pause rows both carry taxonomy member, phase, attempt and delay", () => {
  const block = buildEngineBlock(completedRunArgs());
  assert.deepEqual(block.retries, [
    { timestamp: 1, skill: "pm-author", phase: "Phase R", attempt: 1, outcome: "timeout", delayMs: 500 },
  ]);
});

test("AT-ENG-58/PROP-TUNE-1: effective dispatch tunables reflect configuration, not defaults", () => {
  const block = buildEngineBlock(completedRunArgs());
  assert.deepEqual(block.tunables, { retryAttempts: 3, retryBackoff: 2000, timeoutMinutes: 20, maxIterations: 5 });
});

test("AT-ENG-58/PROP-TUNE-5: permission posture is the single named setting's value", () => {
  const block = buildEngineBlock({ ...completedRunArgs(), permissionMode: "plan" });
  assert.equal(block.permissionMode, "plan");
});

test("AT-ENG-58/AC-4.5: stampReport extends the module's report, alongside every §12.2 field", () => {
  const moduleReport = Object.freeze({ outcome: "ran", feature: "x", phases: [{ phase: "Phase R" }] });
  const engine = buildEngineBlock(completedRunArgs());
  const stamped = stampReport(moduleReport, engine);

  assert.equal(stamped.outcome, "ran");
  assert.equal(stamped.feature, "x");
  assert.deepEqual(stamped.phases, [{ phase: "Phase R" }]);
  assert.deepEqual(stamped.engine, engine);
});

test("PROP-REP-6: `engine` is the only key stampReport adds — a key-set diff of exactly one", () => {
  const moduleReport = Object.freeze({ outcome: "ran", feature: "x", phases: [] });
  const engine = buildEngineBlock(completedRunArgs());
  const stamped = stampReport(moduleReport, engine);

  const added = Object.keys(stamped).filter((k) => !Object.hasOwn(moduleReport, k));
  assert.deepEqual(added, ["engine"]);
});

// ─── AT-ENG-59/PROP-REP-11/BR-REP-2: an empty set is not a missing field ───

test("AT-ENG-59: a zero-retry run carries retries as a present, empty array — not a missing field", () => {
  const block = buildEngineBlock({ ...completedRunArgs(), retries: [] });
  assert.ok(Object.hasOwn(block, "retries"), "`retries` must be an own key even when empty");
  assert.deepEqual(block.retries, []);
});

test("AT-ENG-59: pauses and denials are likewise present-and-empty, never absent, on a clean run", () => {
  const block = buildEngineBlock({ ...completedRunArgs(), pauses: [], denials: [] });
  assert.ok(Object.hasOwn(block, "pauses"));
  assert.ok(Object.hasOwn(block, "denials"));
  assert.deepEqual(block.pauses, []);
  assert.deepEqual(block.denials, []);
});

test("AT-ENG-59: dispatch and outcome counts are present-and-zero on a quiet run, never omitted", () => {
  const block = buildEngineBlock({
    ...completedRunArgs(),
    dispatches: { bySkill: {}, byPhase: {} },
    outcomes: { ran: 0, halted: 0, blocked: 0, refused: 0, "max-passes": 0, idle: 0 },
  });
  assert.deepEqual(block.dispatches, { bySkill: {}, byPhase: {} });
  assert.deepEqual(Object.keys(block.outcomes).sort(), ["blocked", "halted", "idle", "max-passes", "ran", "refused"].sort());
  assert.ok(Object.values(block.outcomes).every((n) => n === 0));
});

test("buildEngineBlock defaults called with no args at all — every collection field is present, empty, never undefined", () => {
  const block = buildEngineBlock();
  for (const key of ["retries", "pauses", "denials", "authSources", "startup"]) {
    assert.ok(Object.hasOwn(block, key), `expected an own "${key}" key on the default block`);
    assert.deepEqual(block[key], []);
  }
});

// ─── AT-ENG-60/PROP-REP-12/BR-REP-3: dispatch counts are observable ───────

test("AT-ENG-60: per-phase and per-skill dispatch counts sum to the recorded dispatch rows, fixture-exact", () => {
  // A fixed six-dispatch sequence: 3 pm-author (2× Phase R, 1× Phase F), 2
  // se-author (Phase T), 1 te-author (Phase T) — the fixture the fixture
  // fixes, per BR-REP-3, so exact values are asserted rather than merely
  // internal consistency.
  const dispatches = {
    bySkill: { "pm-author": 3, "se-author": 2, "te-author": 1 },
    byPhase: { "Phase R": 2, "Phase F": 1, "Phase T": 3 },
  };
  const block = buildEngineBlock({ ...completedRunArgs(), dispatches });

  assert.deepEqual(block.dispatches, dispatches);
  const totalDispatchRows = 6;
  const bySkillSum = Object.values(block.dispatches.bySkill).reduce((a, b) => a + b, 0);
  const byPhaseSum = Object.values(block.dispatches.byPhase).reduce((a, b) => a + b, 0);
  assert.equal(bySkillSum, totalDispatchRows);
  assert.equal(byPhaseSum, totalDispatchRows);
});

// ─── AT-ENG-66/EC-REP-1: a startup refusal's report has BR-REP-0's shape ───

test("EC-REP-1: a startup refusal still stamps the version pair, the startup auth id and an empty dispatch set", () => {
  const engine = buildEngineBlock({
    engineVersion: "0.1.0",
    pluginVersion: null, // refused before the plugin version was even read
    startupAuth: { row: "1", catalogueId: "auth.none-declared" },
    dispatches: { bySkill: {}, byPhase: {} },
    authSources: [],
    startup: [{ rung: 1, name: "plugin resolution", state: "fail", detail: "no plugin root" }],
  });
  const stamped = stampReport(null, engine);

  assert.deepEqual(stamped, { engine });
  assert.equal(stamped.engine.engineVersion, "0.1.0");
  assert.deepEqual(stamped.engine.startupAuth, { row: "1", catalogueId: "auth.none-declared" });
  assert.deepEqual(stamped.engine.dispatches, { bySkill: {}, byPhase: {} });
  assert.deepEqual(stamped.engine.authSources, []);
  assert.equal(Object.hasOwn(stamped, "outcome"), false, "a refusal report has no module fields to extend");
});

// ─── AT-ENG-66/EC-REP-2: differing auth sources are both kept, neither wins ─

test("EC-REP-2: a per-dispatch auth source differing from the startup id's implication — both survive", () => {
  const block = buildEngineBlock({
    ...completedRunArgs(),
    startupAuth: { row: "5", catalogueId: "auth.env-api-key" },
    authSources: [{ skill: "pm-author", phase: "Phase R", attempt: 0, apiKeySource: "user" }],
  });

  // Startup implied "none" (env API key posture); the dispatch actually
  // observed "user". Neither is overwritten by the other.
  assert.equal(block.startupAuth.catalogueId, "auth.env-api-key");
  assert.equal(block.authSources[0].apiKeySource, "user");
});

// ─── AT-ENG-66/EC-REP-3: an unknown delay is recorded as unknown, never 0 ──

test("EC-REP-3: a rate-limit event with no delay value records the delay as unknown, not fabricated", () => {
  const block = buildEngineBlock({
    ...completedRunArgs(),
    retries: [{ timestamp: 1, skill: "pm-author", phase: "Phase R", attempt: 1, outcome: "retryable", delayMs: null }],
  });

  assert.equal(block.retries[0].delayMs, null, "an unobserved delay must stay a distinguishable null, never 0");
  assert.notEqual(block.retries[0].delayMs, 0);
});

// ─── AT-ENG-68/PROP-REP-1/PROP-REP-4: one JSON line, the last line, on a ──
// startup refusal — spawned against the real CLI, EC-REP-1's refusal half is
// red at HEAD: `cmdDev`/`cmdQueue` return before `emitReport` is ever called
// when `startup.ok` is false (bin/pdlc.mjs:251-258, :280-286), so a refusal
// today prints nothing parseable to stdout at all.

function runCli(args) {
  const result = spawnSync(process.execPath, [BIN, ...args], {
    encoding: "utf8",
    cwd: repoRoot,
    env: { ...process.env, PDLC_PLUGIN_ROOT: "" },
  });
  return result;
}

test("AT-ENG-68/EC-REP-1: a startup refusal (dev) still emits one parseable JSON line, the last line of stdout", () => {
  const r = runCli(["dev", "docs/x/REQ-x.md", "--plugin-root", path.join(repoRoot, "no-such-plugin-root")]);

  const lines = r.stdout.split("\n").filter((l) => l.trim() !== "");
  assert.ok(lines.length > 0, `expected at least one stdout line on refusal; got: ${JSON.stringify(r)}`);
  const last = lines[lines.length - 1];
  const parsed = JSON.parse(last); // throws (red at HEAD) if the last line is not JSON
  assert.ok(Object.hasOwn(parsed, "engine"), "the refusal report must carry the engine block");
  assert.deepEqual(parsed.engine.dispatches, { bySkill: {}, byPhase: {} });
});

test("AT-ENG-68/EC-REP-1: a startup refusal (queue) likewise emits a parseable last-line report, distinguishable from a died run", () => {
  const r = runCli(["queue", "--plugin-root", path.join(repoRoot, "no-such-plugin-root")]);

  const lines = r.stdout.split("\n").filter((l) => l.trim() !== "");
  assert.ok(lines.length > 0, `expected at least one stdout line on refusal; got: ${JSON.stringify(r)}`);
  const parsed = JSON.parse(lines[lines.length - 1]);
  assert.ok(Object.hasOwn(parsed, "engine"));
});
