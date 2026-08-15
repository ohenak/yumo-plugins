// Provenance value: the single construction site for the frozen `Provenance`
// record (TSPEC §7.1) and its two pure renderers, `line` and `block`.
//
// Built once per run from the resolution `lib/startup.mjs` already performed
// (BR-1.5's "resolved once per run"). This module never touches fs, env or
// the clock (PROP-PROV-1) — every field it needs arrives as a plain-data
// input argument.

/**
 * @typedef {object} Provenance
 * @property {string}      engineVersion   T-1a, from the running package manifest.
 * @property {string|null} pluginVersion   T-1b, or null when none was found.
 * @property {string}      pluginCompat    T-3, the declared range.
 * @property {"engine"}    channel         C-9. Literal: the bundle channel builds no value.
 * @property {"latest"|"pin"|"dev"} mode    §6.3's resolved branch.
 * @property {string|null} pin             The pinned version when mode === "pin".
 * @property {string}      loadRoot        Absolute path the workflow modules loaded from.
 * @property {string}      line            One-line rendering, for commit messages and rows.
 * @property {string}      block           Multi-line markdown rendering, for documents.
 */

/**
 * Renders the one-line form: "pdlc engine {engineVersion} / plugin {pluginVersion}".
 * Pure — no fs, env or clock access; same input always yields the same string.
 *
 * @param {Omit<Provenance, "line" | "block">} input
 * @returns {string}
 */
function line(input) {
  const pluginVersion = input.pluginVersion == null ? "not found" : input.pluginVersion;
  return `pdlc engine ${input.engineVersion} / plugin ${pluginVersion}`;
}

/**
 * Renders the multi-line markdown form for documents (POSTMORTEMs, etc.).
 * Pure — no fs, env or clock access; same input always yields the same string.
 *
 * @param {Omit<Provenance, "line" | "block">} input
 * @returns {string}
 */
function block(input) {
  const pluginVersion = input.pluginVersion == null ? "not found" : input.pluginVersion;
  const pin = input.pin == null ? "n/a" : input.pin;
  return [
    "**Provenance**",
    `- Engine version: ${input.engineVersion}`,
    `- Plugin version: ${pluginVersion}`,
    `- Plugin compat: ${input.pluginCompat}`,
    `- Channel: ${input.channel}`,
    `- Mode: ${input.mode} (pin: ${pin})`,
    `- Load root: ${input.loadRoot}`,
  ].join("\n");
}

/**
 * The single construction site for `Provenance` (§7.1). Builds a frozen,
 * plain-data value with `line`/`block` pre-rendered by this function so no
 * downstream caller ever formats or branches on `mode` itself.
 *
 * @param {object} input
 * @param {string} input.engineVersion
 * @param {string|null} input.pluginVersion
 * @param {string} input.pluginCompat
 * @param {"engine"} input.channel
 * @param {"latest"|"pin"|"dev"} input.mode
 * @param {string|null} input.pin
 * @param {string} input.loadRoot
 * @returns {Readonly<Provenance>}
 */
export function buildProvenance(input) {
  const base = {
    engineVersion: input.engineVersion,
    pluginVersion: input.pluginVersion,
    pluginCompat: input.pluginCompat,
    channel: input.channel,
    mode: input.mode,
    pin: input.pin,
    loadRoot: input.loadRoot,
  };
  return Object.freeze({
    ...base,
    line: line(base),
    block: block(base),
  });
}

/**
 * Module-level frozen null-object (P-1, default-inert). A runtime that
 * supplies nothing produces byte-identical artifacts to today.
 *
 * @type {Readonly<Provenance>}
 */
export const NO_PROVENANCE = Object.freeze({
  engineVersion: "",
  pluginVersion: null,
  pluginCompat: "",
  channel: "engine",
  mode: "latest",
  pin: null,
  loadRoot: "",
  line: "",
  block: "",
});
