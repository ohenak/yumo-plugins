// Tests for lib/startup.mjs — the ONE startup sequence every command shares
// (resolve plugin → read version → C-10 handshake → skill prompts readable →
// banner). Pure and total: no dispatch, no workflow import.

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { runStartupChecks, formatStartup, EXPECTED_SKILLS } from "../lib/startup.mjs";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(engineRoot));
const PLUGIN_ROOT = path.join(repoRoot, "pdlc");

test("the expected-prompt set is the 15 skills plus the 2 se-implement supplements", () => {
  assert.equal(EXPECTED_SKILLS.length, 17);
  assert.ok(EXPECTED_SKILLS.includes("se-implement:SKILL-typescript.md"));
  assert.ok(EXPECTED_SKILLS.includes("se-implement:SKILL-python.md"));
});

test("this repo's own plugin passes every startup check", () => {
  const result = runStartupChecks({
    pluginRoot: PLUGIN_ROOT,
    env: {},
    engineVersion: "0.1.0",
    engineCompat: "^0.22.0",
  });

  assert.equal(result.ok, true, result.reason || "");
  assert.equal(result.reason, null);
  assert.equal(result.pluginRoot, PLUGIN_ROOT);
  assert.match(result.pluginVersion, /^\d+\.\d+\.\d+/);
  assert.equal(result.checks.every((c) => c.ok), true);
});

test("an out-of-range plugin version fails the C-10 handshake and names the range", () => {
  const result = runStartupChecks({
    pluginRoot: PLUGIN_ROOT,
    env: {},
    engineVersion: "0.1.0",
    engineCompat: "^99.0.0",
  });

  assert.equal(result.ok, false);
  assert.match(result.reason, /99\.0\.0/);
  assert.match(result.reason, /refuses to dispatch/);
  const handshake = result.checks.find((c) => c.name.includes("C-10"));
  assert.equal(handshake.ok, false);
});

test("an unresolvable plugin root skips the downstream checks rather than throwing", () => {
  const result = runStartupChecks({
    pluginRoot: path.join(repoRoot, "no-such-plugin-root"),
    env: {},
    engineVersion: "0.1.0",
    engineCompat: "^0.22.0",
  });

  assert.equal(result.ok, false);
  assert.equal(result.pluginRoot, null);
  assert.ok(result.checks.some((c) => c.detail === "skipped — no plugin root"));
});

test("an unreadable skill prompt is reported per-skill, not as a throw", () => {
  const result = runStartupChecks({
    pluginRoot: PLUGIN_ROOT,
    env: {},
    engineVersion: "0.1.0",
    engineCompat: "^0.22.0",
    loadSkillFn: (root, skill) => {
      if (skill === "te-review") throw new Error("boom");
      return { name: skill, path: "x", text: "y" };
    },
  });

  assert.equal(result.ok, false);
  const row = result.checks.find((c) => c.name.startsWith("skill prompts readable"));
  assert.match(row.name, /16\/17/);
  assert.match(row.detail, /te-review \(boom\)/);
});

test("the banner reports the effective ANTHROPIC_BASE_URL (AC-2.1)", () => {
  const result = runStartupChecks({
    pluginRoot: PLUGIN_ROOT,
    env: { ANTHROPIC_BASE_URL: "http://127.0.0.1:8787" },
    engineVersion: "0.1.0",
    engineCompat: "^0.22.0",
  });
  assert.ok(result.banner.join("\n").includes("http://127.0.0.1:8787"));
});

test("formatStartup appends a PASS/FAIL table only when asked", () => {
  const result = runStartupChecks({
    pluginRoot: PLUGIN_ROOT,
    env: {},
    engineVersion: "0.1.0",
    engineCompat: "^0.22.0",
  });
  assert.equal(formatStartup(result).join("\n").includes("PASS "), false);
  assert.match(formatStartup(result, { withChecks: true }).join("\n"), /PASS {2}plugin resolved/);
});
