// pdlc-engine startup sequence (Phase 3, pdlc-headless-engine).
//
// Every command that can dispatch — `pdlc dev`, `pdlc queue` — and the
// non-dispatching `pdlc doctor` share ONE startup: resolve the plugin, read its
// version, run the C-10 handshake, verify the skill prompts are readable, and
// render the AC-2.1 banner. Extracted here so `doctor` is literally the same
// code path the run commands take rather than a second implementation of it
// that can drift from the one that gates dispatch.
//
// This module deliberately imports NOTHING from pdlc/workflows/. A failed
// handshake must abort before the workflow modules are even loaded (REQ C-10:
// fail-closed, dispatch nothing), which lib/run.mjs guarantees by importing
// them dynamically, after this returns ok.

import { resolvePluginRoot, loadSkill, PLUGIN_ROOT_ENV } from "./skills.mjs";
import { readPluginVersion, checkCompat, buildBanner } from "./handshake.mjs";

/** The 17 prompt files a full pipeline can dispatch (15 skills + 2 supplements). */
export const EXPECTED_SKILLS = Object.freeze([
  "consolidate-learnings",
  "dod-verify",
  "harvest-learnings",
  "orchestrate-dev",
  "orchestrate-queue",
  "pm-author",
  "pm-review",
  "se-author",
  "se-implement",
  "se-implement:SKILL-typescript.md",
  "se-implement:SKILL-python.md",
  "se-review",
  "ship-pr",
  "te-author",
  "te-review",
  "tech-lead",
  "tech-lead-python",
]);

/**
 * Resolve + handshake + skill-readability, with no dispatch and no workflow
 * import. Total: never throws for an environment problem, it reports one.
 *
 * @param {object} [opts]
 * @param {string} [opts.pluginRoot] Explicit root (CLI `--plugin-root`).
 * @param {object} [opts.env] Environment (`PDLC_PLUGIN_ROOT`).
 * @param {string} opts.engineVersion package.json → version.
 * @param {string} opts.engineCompat package.json → pdlcPluginCompat.
 * @param {string[]} [opts.apiKeyPolicy] Banner's auth policy row. Default ["none"].
 * @param {Function} [opts.resolveFn] Injected `resolvePluginRoot` (tests).
 * @param {Function} [opts.readVersionFn] Injected `readPluginVersion` (tests).
 * @param {Function} [opts.loadSkillFn] Injected `loadSkill` (tests).
 * @param {string[]} [opts.expectedSkills] Skill set to probe. Default EXPECTED_SKILLS.
 * @returns {{ok: boolean, checks: Array<{name: string, ok: boolean, detail: string}>,
 *            banner: string[], pluginRoot: string|null, pluginVersion: string|null,
 *            reason: string|null}}
 */
export function runStartupChecks({
  pluginRoot = null,
  env = process.env,
  engineVersion,
  engineCompat,
  apiKeyPolicy = ["none"],
  resolveFn = resolvePluginRoot,
  readVersionFn = readPluginVersion,
  loadSkillFn = loadSkill,
  expectedSkills = EXPECTED_SKILLS,
} = {}) {
  const checks = [];
  const record = (name, ok, detail) => checks.push({ name, ok, detail });

  const resolution = resolveFn({ override: pluginRoot, env });
  record(
    "plugin resolved",
    resolution.ok,
    resolution.ok ? `${resolution.root}  [via ${resolution.source}]` : resolution.reason
  );

  let version = null;
  if (resolution.ok) {
    const read = readVersionFn(resolution.root);
    record("plugin manifest readable", read.ok, read.ok ? read.manifestPath : read.reason);
    if (read.ok) version = read.version;
  } else {
    record("plugin manifest readable", false, "skipped — no plugin root");
  }

  const compat = checkCompat(engineCompat, version);
  record(
    "version handshake (C-10)",
    compat.ok,
    compat.ok
      ? `plugin ${compat.pluginVersion} satisfies engine range ${compat.range}`
      : compat.reason
  );

  if (resolution.ok) {
    const missing = [];
    for (const skill of expectedSkills) {
      try {
        loadSkillFn(resolution.root, skill);
      } catch (err) {
        missing.push(`${skill} (${err.message})`);
      }
    }
    record(
      `skill prompts readable (${expectedSkills.length - missing.length}/${expectedSkills.length})`,
      missing.length === 0,
      missing.length === 0 ? "all present and non-empty" : missing.join("; ")
    );
  } else {
    record("skill prompts readable", false, "skipped — no plugin root");
  }

  const banner = buildBanner({
    engineVersion,
    pluginVersion: version,
    pluginRoot: resolution.root,
    pluginCompat: engineCompat,
    apiKeyPolicy,
    baseUrl: env && env.ANTHROPIC_BASE_URL,
  });

  const failed = checks.filter((c) => !c.ok);
  return {
    ok: failed.length === 0,
    checks,
    banner,
    pluginRoot: resolution.ok ? resolution.root : null,
    pluginVersion: version,
    reason:
      failed.length === 0
        ? null
        : failed.map((c) => `${c.name}: ${c.detail}`).join("\n") +
          `\nThe engine refuses to dispatch. Override the plugin root with ` +
          `--plugin-root <path> or ${PLUGIN_ROOT_ENV}=<path>.`,
  };
}

/** Render `runStartupChecks`'s result as the operator-facing startup output. */
export function formatStartup(result, { withChecks = false } = {}) {
  const lines = [...result.banner];
  if (withChecks) {
    lines.push("");
    for (const c of result.checks) {
      lines.push(`${c.ok ? "PASS" : "FAIL"}  ${c.name}`);
      if (c.detail) lines.push(`      ${c.detail}`);
    }
  }
  return lines;
}
