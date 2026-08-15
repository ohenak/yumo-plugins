// pdlc-engine report provenance stamping (Phase 4, pdlc-headless-engine).
//
// The workflow modules (pdlc/workflows/orchestrate-dev.js,
// orchestrate-queue.js) already produce a complete final report — phases,
// outcome, queue-row disposition, and so on. This module is a thin,
// engine-side wrapper around that report: it never edits pdlc/workflows/,
// never changes anything the modules produced. It only ADDS one `engine`
// block recording facts the modules have no way to know (their own version,
// the plugin they ran against, the transport that dispatched them, the
// per-dispatch auth source, the retry/pause/denial history, and so on —
// TSPEC §4.5).
//
// Both functions here are pure — no fs, no clock reads, no process access —
// so the CLI supplies every value explicitly and the whole thing is testable
// without a subprocess.

/**
 * Build the `engine` block. Every TSPEC §4.5 field is REQUIRED to appear on
 * the block (never entirely omitted), even when the underlying value is
 * unknown — an unknown scalar is `null`, an unknown collection is `[]` (or
 * the zero-valued shape for `dispatches`/`outcomes`), never a missing key, so
 * a report reader can always find `report.engine.<field>` without an
 * existence check.
 *
 * @param {object} [args]
 * @param {string|null} [args.engineVersion]
 * @param {string|null} [args.pluginVersion]
 * @param {string|null} [args.pluginRoot]
 * @param {object|null} [args.startupAuth] the §3.2/§5.1 `{row, catalogueId}`
 *   row that decided at startup.
 * @param {string} [args.transport] observed transport kind ("agent-sdk" or
 *   "cli-headless"), forwarded verbatim — never hardcoded.
 * @param {object[]} [args.authSources] per-dispatch `{skill, phase, attempt,
 *   apiKeySource}` rows (lib/adapter.mjs `getAuthSources()`).
 * @param {string|null} [args.baseUrl] effective `ANTHROPIC_BASE_URL`, or null
 *   when unset (direct, no proxy).
 * @param {object[]} [args.startup] the six-rung `RungRecord[]` ladder.
 * @param {object} [args.dispatches] `{bySkill, byPhase}` dispatch counts.
 * @param {object[]} [args.retries] every retry row, `{timestamp, skill,
 *   phase, attempt, outcome, delayMs}`.
 * @param {object[]} [args.pauses] the adapter's rate-limit pause log.
 * @param {object[]} [args.denials] the adapter's guard-denial log.
 * @param {object|null} [args.tunables] effective `{retryAttempts,
 *   retryBackoff, timeoutMinutes, maxIterations}`.
 * @param {string|null} [args.permissionMode] the single named permission
 *   posture in force.
 * @param {object|null} [args.loop] `{iterations, maxIterations, stopReason,
 *   lastOutcome}` for `pdlc queue --loop`, or `null` when no loop ran.
 * @param {object} [args.outcomes] per-outcome counts, present-and-zero.
 * @param {string|null} [args.startedAt] ISO-8601.
 * @param {string|null} [args.finishedAt] ISO-8601.
 * @returns {object}
 */
export function buildEngineBlock(args = {}) {
  const {
    engineVersion = null,
    pluginVersion = null,
    pluginRoot = null,
    startupAuth = null,
    transport = "agent-sdk",
    authSources,
    baseUrl = null,
    startup,
    dispatches = { bySkill: {}, byPhase: {} },
    retries,
    pauses,
    denials,
    tunables = null,
    permissionMode = null,
    loop = null,
    outcomes = { ran: 0, halted: 0, blocked: 0, refused: 0, "max-passes": 0, idle: 0 },
    startedAt = null,
    finishedAt = null,
  } = args;

  return {
    engineVersion,
    pluginVersion,
    pluginRoot,
    startupAuth,
    transport,
    authSources: Array.isArray(authSources) ? authSources.slice() : [],
    baseUrl,
    startup: Array.isArray(startup) ? startup.slice() : [],
    dispatches,
    retries: Array.isArray(retries) ? retries.slice() : [],
    pauses: Array.isArray(pauses) ? pauses.slice() : [],
    denials: Array.isArray(denials) ? denials.slice() : [],
    tunables,
    permissionMode,
    loop,
    outcomes,
    startedAt,
    finishedAt,
  };
}

/**
 * Extend a workflow module's final report with the `engine` provenance
 * block. Never mutates `report` — returns a new object carrying every field
 * the module produced plus `engine`. A null/undefined `report` (e.g. the
 * engine refused before any module ran) stamps an empty base object, so
 * callers can always stringify the result rather than branching on report
 * presence.
 *
 * @param {object|null} report the module's own final report, verbatim.
 * @param {object} engine the block from `buildEngineBlock()`.
 * @returns {object}
 */
export function stampReport(report, engine) {
  return { ...(report || {}), engine };
}
