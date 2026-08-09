// pdlc-engine report provenance stamping (Phase 4, pdlc-headless-engine).
//
// The workflow modules (pdlc/workflows/orchestrate-dev.js,
// orchestrate-queue.js) already produce a complete final report — phases,
// outcome, queue-row disposition, and so on. This module is a thin,
// engine-side wrapper around that report: it never edits pdlc/workflows/, and
// it never changes anything the modules produced. It only ADDS one `engine`
// block recording facts the modules have no way to know (their own version,
// which plugin they ran against, which transport dispatched them, and the
// rate-limit pause history from lib/adapter.mjs's retry policy).
//
// Both functions here are pure — no fs, no clock reads, no process access —
// so the CLI supplies every value explicitly and the whole thing is testable
// without a subprocess.

/**
 * Build the `engine` block. Every field is REQUIRED to appear on the block
 * (never entirely omitted), even when the underlying value is unknown — an
 * unknown value is `null`, not a missing key, so a report reader can always
 * find `report.engine.<field>` without an existence check.
 *
 * @param {object} args
 * @param {string} [args.engineVersion]
 * @param {string|null} [args.pluginVersion]
 * @param {string|null} [args.pluginRoot]
 * @param {string|null} [args.apiKeySource] the SDK-reported apiKeySource observed
 *   during the run (lib/adapter.mjs `getApiKeySource()`); null if no dispatch
 *   completed (e.g. a run that halted before its first dispatch).
 * @param {string|null} [args.baseUrl] effective `ANTHROPIC_BASE_URL`, or null
 *   when unset (direct, no proxy).
 * @param {object[]} [args.pauses] the adapter's pause log (`getPauseLog()`).
 * @param {string} [args.startedAt] ISO-8601 timestamp.
 * @param {string} [args.finishedAt] ISO-8601 timestamp.
 * @returns {object}
 */
export function buildEngineBlock({
  engineVersion = null,
  pluginVersion = null,
  pluginRoot = null,
  apiKeySource = null,
  baseUrl = null,
  pauses = [],
  startedAt = null,
  finishedAt = null,
} = {}) {
  return {
    engineVersion,
    pluginVersion,
    pluginRoot,
    transport: "agent-sdk",
    apiKeySource,
    baseUrl,
    pauses: Array.isArray(pauses) ? pauses.slice() : [],
    startedAt,
    finishedAt,
  };
}

/**
 * Extend a workflow module's final report with the `engine` provenance block.
 * Never mutates `report` — returns a new object carrying every field the
 * module produced plus `engine`. A null/undefined `report` (e.g. the engine
 * refused before any module ran) stamps an empty base object, so callers can
 * always stringify the result rather than branching on report presence.
 *
 * @param {object|null} report the module's own final report, verbatim.
 * @param {object} engine the block from `buildEngineBlock()`.
 * @returns {object}
 */
export function stampReport(report, engine) {
  return { ...(report || {}), engine };
}
