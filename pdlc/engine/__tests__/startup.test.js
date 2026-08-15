// Tests for lib/startup.mjs — the ONE startup sequence every command shares:
// a total, seven-rung ladder (rungs 0, 1, 2, 3, 4, 4a, 5) reported in
// `RUNG_ORDER`. This file exercises the module against THIS repo's own real
// plugin, end to end, as a smoke test alongside `startup-ladder.test.js`
// (the seam-by-seam ladder mechanics) and `startup-guard-executable.test.js`
// (rung 4a's own two branches).
//
// T44: rewritten from HEAD's unstructured `{ok, checks, banner, pluginRoot,
// pluginVersion, reason}` / frozen 17-entry `EXPECTED_SKILLS` shape to the
// structured `RungRecord[]` ladder (TSPEC §4.3). `EXPECTED_SKILLS` itself
// survives as a deprecated export only because `__tests__/preflight.test.js`
// (T00, out of this task's target_paths) still imports it for existence —
// rung 4 here no longer reads it.

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { runStartupChecks, formatStartup, EXPECTED_SKILLS, RUNG_ORDER } from "../lib/startup.mjs";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(engineRoot));
const PLUGIN_ROOT = path.join(repoRoot, "pdlc");

// `dispatchableSkills`/`listInstalledSkillsFn` are left at their defaults
// throughout this file (rung 4 then passes without asserting, per
// `evalRung4`'s "not supplied" branch) — the derived-set equality itself is
// `startup-ladder.test.js`'s job.

test("EXPECTED_SKILLS is still importable (deprecated; preflight.test.js's BL-PREREQ gate)", () => {
  assert.notEqual(EXPECTED_SKILLS, undefined);
  assert.ok(Object.isFrozen(EXPECTED_SKILLS));
});

test("RUNG_ORDER is the seven rung labels FSPEC §4.1 fixes, in order", () => {
  assert.deepEqual(RUNG_ORDER, ["0", "1", "2", "3", "4", "4a", "5"]);
  assert.ok(Object.isFrozen(RUNG_ORDER));
});

test("this repo's own plugin passes every rung, in doctor mode (no reqPath)", () => {
  const result = runStartupChecks({
    pluginRoot: PLUGIN_ROOT,
    env: {},
    engineVersion: "0.1.0",
    engineCompat: "^0.22.0",
    cwd: repoRoot,
  });

  assert.equal(result.ok, true, result.reason || "");
  assert.equal(result.reason, null);
  assert.equal(result.pluginRoot, PLUGIN_ROOT);
  assert.match(result.pluginVersion, /^\d+\.\d+\.\d+/);
  assert.deepEqual(result.rungs.map((r) => r.rung), [...RUNG_ORDER]);
  assert.equal(result.rungs.every((r) => r.state === "pass"), true, JSON.stringify(result.rungs));
});

test("an out-of-range plugin version fails rung 3 (C-10) and names the range", () => {
  const result = runStartupChecks({
    pluginRoot: PLUGIN_ROOT,
    env: {},
    engineVersion: "0.1.0",
    engineCompat: "^99.0.0",
    cwd: repoRoot,
  });

  assert.equal(result.ok, false);
  assert.match(result.reason, /99\.0\.0/);
  const rung3 = result.rungs.find((r) => r.rung === "3");
  assert.equal(rung3.state, "fail");
});

test("an unresolvable plugin root skips the downstream chain rather than throwing", () => {
  const result = runStartupChecks({
    pluginRoot: path.join(repoRoot, "no-such-plugin-root"),
    env: {},
    engineVersion: "0.1.0",
    engineCompat: "^0.22.0",
    cwd: repoRoot,
  });

  assert.equal(result.ok, false);
  assert.equal(result.pluginRoot, null);
  const rung1 = result.rungs.find((r) => r.rung === "1");
  assert.equal(rung1.state, "fail");
  for (const id of ["2", "3", "4", "4a"]) {
    const row = result.rungs.find((r) => r.rung === id);
    assert.equal(row.state, "skipped");
  }
});

test("an unreadable skill prompt is reported per-identifier, not as a throw", () => {
  const result = runStartupChecks({
    pluginRoot: PLUGIN_ROOT,
    env: {},
    engineVersion: "0.1.0",
    engineCompat: "^0.22.0",
    cwd: repoRoot,
    dispatchableSkills: ["te-review", "se-implement"],
    loadSkillFn: (root, skill) => {
      if (skill === "te-review") throw new Error("boom");
      return { name: skill, path: "x", text: "y" };
    },
  });

  assert.equal(result.ok, false);
  const row4 = result.rungs.find((r) => r.rung === "4");
  assert.equal(row4.state, "fail");
  assert.match(row4.detail, /te-review \(boom\)/);
});

test("the banner reports the effective ANTHROPIC_BASE_URL (AC-2.1), and it equals result.baseUrl", () => {
  const result = runStartupChecks({
    pluginRoot: PLUGIN_ROOT,
    env: { ANTHROPIC_BASE_URL: "http://127.0.0.1:8787" },
    engineVersion: "0.1.0",
    engineCompat: "^0.22.0",
    cwd: repoRoot,
  });
  assert.equal(result.baseUrl, "http://127.0.0.1:8787");
  assert.ok(result.banner.join("\n").includes("http://127.0.0.1:8787"));
});

test("AC-2.1: versions and auth are always populated, even on a refusal", () => {
  const result = runStartupChecks({
    pluginRoot: PLUGIN_ROOT,
    env: {},
    engineVersion: "0.1.0",
    engineCompat: "^99.0.0",
    cwd: repoRoot,
  });
  assert.equal(result.ok, false);
  assert.equal(result.versions.engine, "0.1.0");
  assert.match(result.versions.plugin, /^\d+\.\d+\.\d+/);
  assert.equal(typeof result.auth.catalogueId, "string");
  assert.equal(Object.prototype.hasOwnProperty.call(result.auth, "refuses"), false);
});

test("formatStartup appends a PASS/FAIL/SKIP table only when asked", () => {
  const result = runStartupChecks({
    pluginRoot: PLUGIN_ROOT,
    env: {},
    engineVersion: "0.1.0",
    engineCompat: "^0.22.0",
    cwd: repoRoot,
  });
  assert.equal(formatStartup(result).join("\n").includes("PASS "), false);
  assert.match(formatStartup(result, { withChecks: true }).join("\n"), /PASS {2}rung 0/);
});

test("dev mode (reqPath supplied): a missing REQ path fails rung 0 and skips the rest of the chain", () => {
  const result = runStartupChecks({
    pluginRoot: PLUGIN_ROOT,
    env: {},
    engineVersion: "0.1.0",
    engineCompat: "^0.22.0",
    cwd: repoRoot,
    reqPath: "docs/no-such-feature/REQ-no-such-feature.md",
  });
  assert.equal(result.ok, false);
  const rung0 = result.rungs.find((r) => r.rung === "0");
  assert.equal(rung0.state, "fail");
  for (const id of ["1", "2", "3", "4", "4a", "5"]) {
    assert.equal(result.rungs.find((r) => r.rung === id).state, "skipped");
  }
});
