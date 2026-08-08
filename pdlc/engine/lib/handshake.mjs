// pdlc-engine plugin version handshake (Phase 2, pdlc-headless-engine).
//
// REQ C-10 (operator hard constraint, 2026-08-08): the engine declares a
// compatible pdlc-plugin semver range in package.json → `pdlcPluginCompat`, and
// at startup reads the RESOLVED plugin's .claude-plugin/plugin.json version.
// A missing plugin, or a version outside the range, is a fail-closed refusal
// that dispatches nothing and names both versions, the range, and the remedy.
//
// No semver dependency: the range grammar the engine needs is small and closed,
// so it is implemented here and tested rather than pulled in.

import nodeFs from "node:fs";
import path from "node:path";

const defaultFs = {
  readFileSync: (p, enc) => nodeFs.readFileSync(p, enc),
};

/** Total parse of an "x.y.z" core version. Prerelease/build are ignored. */
export function parseVersion(value) {
  const m = /^\s*v?(\d+)\.(\d+)\.(\d+)(?:[-+].*)?\s*$/.exec(String(value == null ? "" : value));
  if (!m) return null;
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) };
}

function compare(a, b) {
  if (a.major !== b.major) return a.major < b.major ? -1 : 1;
  if (a.minor !== b.minor) return a.minor < b.minor ? -1 : 1;
  if (a.patch !== b.patch) return a.patch < b.patch ? -1 : 1;
  return 0;
}

/**
 * Read the plugin version from a resolved plugin root.
 * @returns {{ok: true, version: string, manifestPath: string}
 *          |{ok: false, reason: string, manifestPath: string}}
 */
export function readPluginVersion(pluginRoot, { fs = defaultFs } = {}) {
  const manifestPath = path.join(String(pluginRoot || ""), ".claude-plugin", "plugin.json");
  let raw;
  try {
    raw = fs.readFileSync(manifestPath, "utf8");
  } catch (err) {
    return {
      ok: false,
      reason: `cannot read plugin manifest ${manifestPath} (${err && err.message ? err.message : err})`,
      manifestPath,
    };
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return {
      ok: false,
      reason: `plugin manifest ${manifestPath} is not valid JSON (${err && err.message ? err.message : err})`,
      manifestPath,
    };
  }
  if (!parsed || typeof parsed.version !== "string" || !parseVersion(parsed.version)) {
    return {
      ok: false,
      reason: `plugin manifest ${manifestPath} carries no parseable "version" field`,
      manifestPath,
    };
  }
  return { ok: true, version: parsed.version, manifestPath };
}

/**
 * Does `version` satisfy `range`?
 *
 * Supported grammar (deliberately closed — anything else is a hard error, never
 * a silent pass):
 *   "^x.y.z"  npm caret semantics: >= x.y.z, and < the next increment of the
 *             LEFTMOST NON-ZERO component. So ^0.22.0 is >=0.22.0 <0.23.0, and
 *             ^1.2.3 is >=1.2.3 <2.0.0 — the 0.x form is intentionally tight,
 *             which is right while the plugin is pre-1.0 and every minor bump
 *             can move a SKILL.md contract.
 *   "~x.y.z"  >= x.y.z, < x.(y+1).0
 *   "x.y.z"   exact
 *   "*"       any parseable version
 *
 * @returns {{ok: boolean, reason: string|null}}
 */
export function satisfiesRange(version, range) {
  const v = parseVersion(version);
  if (!v) return { ok: false, reason: `"${version}" is not a parseable semver version` };

  const spec = String(range == null ? "" : range).trim();
  if (spec === "*") return { ok: true, reason: null };

  const op = spec.startsWith("^") ? "^" : spec.startsWith("~") ? "~" : "";
  const base = parseVersion(op ? spec.slice(1) : spec);
  if (!base) return { ok: false, reason: `"${range}" is not a supported version range` };

  if (op === "") {
    return compare(v, base) === 0
      ? { ok: true, reason: null }
      : { ok: false, reason: `${version} !== ${spec}` };
  }

  if (compare(v, base) < 0) return { ok: false, reason: `${version} is below ${spec}` };

  let upper;
  if (op === "~") {
    upper = { major: base.major, minor: base.minor + 1, patch: 0 };
  } else if (base.major !== 0) {
    upper = { major: base.major + 1, minor: 0, patch: 0 };
  } else if (base.minor !== 0) {
    upper = { major: 0, minor: base.minor + 1, patch: 0 };
  } else {
    upper = { major: 0, minor: 0, patch: base.patch + 1 };
  }

  return compare(v, upper) < 0
    ? { ok: true, reason: null }
    : {
        ok: false,
        reason: `${version} is at or above ${upper.major}.${upper.minor}.${upper.patch}, the upper bound of ${spec}`,
      };
}

const REMEDY =
  "Remedy: install or re-pin the pdlc plugin to a version in that range " +
  "(`/plugin install pdlc@yumo-plugins`, or `/plugin update pdlc`), or point the " +
  "engine at a compatible checkout with PDLC_PLUGIN_ROOT=/path/to/pdlc.";

/**
 * The handshake decision. `pluginVersion` may be null — "not found" is a first
 * class input here, because a missing plugin is exactly as fatal as a skewed one
 * (C-10) and must be reported in the same shape.
 *
 * @returns {{ok: boolean, reason: string|null, pluginVersion: string,
 *            range: string}}
 */
export function checkCompat(engineCompatRange, pluginVersion) {
  const range = String(engineCompatRange == null ? "" : engineCompatRange).trim();
  const found = pluginVersion == null || pluginVersion === "" ? "not found" : String(pluginVersion);

  if (!range) {
    return {
      ok: false,
      reason:
        "the engine declares no pdlcPluginCompat range in its package.json — " +
        "refusing to dispatch rather than assuming compatibility.",
      pluginVersion: found,
      range,
    };
  }

  if (found === "not found") {
    return {
      ok: false,
      reason:
        `no installed pdlc plugin was found. The engine requires a pdlc plugin ` +
        `version matching "${range}"; version found: not found. ${REMEDY}`,
      pluginVersion: found,
      range,
    };
  }

  const verdict = satisfiesRange(found, range);
  if (verdict.ok) return { ok: true, reason: null, pluginVersion: found, range };

  return {
    ok: false,
    reason:
      `installed pdlc plugin version ${found} is incompatible with this engine, ` +
      `which requires "${range}" (${verdict.reason}). ${REMEDY}`,
    pluginVersion: found,
    range,
  };
}

/**
 * Startup banner lines (REQ AC-2.1): engine version, plugin version AND its root
 * path (always reported as a pair with the engine version per C-10), the
 * effective ANTHROPIC_BASE_URL or "direct", and the auth policy in force.
 *
 * @returns {string[]} one line per row; the caller decides where they go.
 */
export function buildBanner({
  engineVersion,
  pluginVersion,
  pluginRoot,
  pluginCompat,
  apiKeyPolicy,
  baseUrl,
} = {}) {
  const policy = Array.isArray(apiKeyPolicy) ? apiKeyPolicy.join(", ") : String(apiKeyPolicy ?? "");
  const policyNote =
    Array.isArray(apiKeyPolicy) && apiKeyPolicy.length === 1 && apiKeyPolicy[0] === "none"
      ? " (subscription only — pay-per-token billing refused)"
      : "";
  return [
    `pdlc-engine v${engineVersion ?? "unknown"}`,
    `plugin:   pdlc v${pluginVersion ?? "not found"}` +
      (pluginCompat ? ` (engine requires ${pluginCompat})` : ""),
    `          root: ${pluginRoot ?? "not found"}`,
    `base URL: ${baseUrl ? baseUrl : "direct (no ANTHROPIC_BASE_URL set)"}`,
    `auth:     apiKeySource policy [${policy}]${policyNote}`,
  ];
}
