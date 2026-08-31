// stats.mjs — PLAN T-12 (feature: pdlc-stats).
//
// Pure logic for `pdlc stats` (TSPEC §2, §3.3). Everything below `cmdStats`
// (in `pdlc/engine/bin/cli.mjs`) is a pure function of injected seams: a
// `StatsIo` bundle (four read-only `node:fs` wrappers, TSPEC §3.1) and a
// `StatsParsers` bundle (the four classifiers already exported by
// `pdlc/workflows/orchestrate-dev.js`, injected rather than re-implemented —
// REQ C-5, TSPEC §2.5). This module reads no filesystem and imports nothing
// from `orchestrate-dev.js` itself; the driver-parser bundle is constructed
// once, in production, at `bin/cli.mjs`'s `statsParsers()` (TSPEC §3.4).
//
// This task (T-12) creates the module: header, the JSDoc typedefs for
// TSPEC §3.1 (the injected `StatsIo` seam), §3.2 (the driver-parser bundle),
// §4.1 (the metric types) and §4.2 (the outcome/report types), plus
// `parseStatsArgv` and the two frozen constants `REVIEW_DOC_TYPE_ROWS` and
// `NON_FEATURE_DIRS`. It turns T-03 (`statsArgv.test.js`) and T-08
// (`statsAntiDrift.test.js`) green. The remaining exports named in TSPEC
// §3.3 (`discoverFeatures`, `computeFeatureStats`, `runStats`, `renderHuman`,
// `renderJson`) land in later tasks on this module's single-writer chain
// (T-13 through T-16) and are not defined here.

// --- TSPEC §3.1: the injected seams -----------------------------------

/**
 * @typedef {Object} DirEntry
 * @property {string} name
 * @property {boolean} isDirectory
 * @property {boolean} isFile
 * @property {boolean} isSymbolicLink
 */

/**
 * Read-only by construction: no member writes, creates, deletes or spawns.
 * @typedef {Object} StatsIo
 * @property {(absDir: string) => DirEntry[]} listDir throws on unreadable — caller catches
 * @property {(absPath: string) => number} fileSize lstat().size — never follows a link (§2.4)
 * @property {(absPath: string) => string} readFile utf8; POSTMORTEM bodies only
 * @property {(absPath: string) => boolean} exists total: never throws
 */

// --- TSPEC §3.2: the driver-parser bundle (REQ C-5's seam) -------------

/**
 * @typedef {
 *   { ok: true, role: string, docType: string, round: number, suffixed: boolean } |
 *   { ok: false, reason: "not_cross_review" | "bad_role" | "bad_doc_type" |
 *                        "bad_round" | "trailing_junk" }
 * } ReviewParse
 */

/**
 * @typedef {
 *   { ok: true, startIndex: number, endIndex: number,
 *     present: Map<string, number[]>, skipped: Array<{basename: string, reason: string}> } |
 *   { ok: false, reason: "malformed_round_one_duplicate", role: string }
 * } RoundWindow
 */

/** @typedef {{ok: true, resolved: boolean} | {ok: false, reason: string}} ResolvedMarker */

/**
 * Exactly the four `orchestrate-dev.js` exports, by reference (§2.5).
 * @typedef {Object} StatsParsers
 * @property {(basename: string) => ReviewParse} parseReviewFilename
 * @property {(basenames: string[], docType: string) => RoundWindow} deriveRoundWindow
 * @property {(basenames: unknown, feature: string) => number} deriveDodRoundIndex
 * @property {(fileText: string) => ResolvedMarker} parseResolvedMarker
 */

// --- TSPEC §4.1: the metric types ---------------------------------------

/** @typedef {"measured" | "harvested" | "unmeasurable" | "unavailable"} MetricState */

/**
 * @typedef {Object} DocTypeRounds
 * @property {"measured" | "harvested" | "unmeasurable"} state
 * @property {number | null} rounds null in every non-measured state
 * @property {string | null} collidingRole null outside "unmeasurable"
 */

/**
 * @typedef {Object} ReviewRounds
 * @property {Record<string, DocTypeRounds>} byDocType always all six, in BR-09 order
 * @property {string[]} malformed basenames, in listing order (no dedup step)
 */

/**
 * @typedef {Object} DodRounds
 * @property {"measured" | "harvested"} state
 * @property {number | null} rounds
 */

/**
 * @typedef {Object} HaltEntry
 * @property {string} phase
 * @property {"resolved" | "open"} resolution
 */

/**
 * @typedef {Object} ByteRatio
 * @property {"measured" | "harvested" | "unavailable"} state
 * @property {number | null} ratio 2dp, BR-15
 * @property {number} processBytes reported even when state is "unavailable"
 * @property {number} specBytes
 */

/**
 * @typedef {Object} FeatureStats
 * @property {string} feature
 * @property {string} dir the directory actually read (BR-02, BR-17 header)
 * @property {ReviewRounds} reviewRounds
 * @property {DodRounds} dodRounds
 * @property {HaltEntry[]} halts possibly empty — BR-13, no state needed
 * @property {ByteRatio} byteRatio
 */

/** @typedef {FeatureStats | {feature: string, gap: string}} FeatureResult BR-23's discriminant */

// --- TSPEC §4.2: the outcome type ---------------------------------------

/**
 * @typedef {Object} StatsOutcome
 * @property {string} stdout "" only on the usage-error path (BR-20's single exception)
 * @property {string} stderr
 * @property {0 | 1} exitCode
 */

/**
 * @typedef {
 *   { kind: "single", result: FeatureStats } |
 *   { kind: "fleet", results: FeatureResult[], unclassified: string[] } |
 *   { kind: "error", reason: "not_found" | "no_docs_root" | "unreadable_feature",
 *     feature: string | null, message: string }
 * } StatsReport
 */

// --- TSPEC §3.3: parseStatsArgv -----------------------------------------

/**
 * BR-01's closed surface. Total; never throws.
 * @param {string[]} argv
 * @returns {{ok: true, feature: string | null, json: boolean, cwd: string | null} |
 *           {ok: false, message: string}}
 */
export function parseStatsArgv(argv) {
  const positionals = [];
  let json = false;
  let cwd = null;

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--json") {
      json = true;
      continue;
    }
    if (token === "--cwd") {
      i += 1;
      cwd = i < argv.length ? argv[i] : null;
      continue;
    }
    positionals.push(token);
  }

  if (positionals.length > 1) {
    return {
      ok: false,
      message: `pdlc stats: unexpected extra argument "${positionals[1]}"`,
    };
  }

  return {
    ok: true,
    feature: positionals.length === 1 ? positionals[0] : null,
    json,
    cwd,
  };
}

// --- TSPEC §3.3: the two frozen constants -------------------------------

// BR-09's six review doc types, in order. A local constant, not an import of
// the driver's module-private `REVIEW_DOC_TYPES` (TSPEC §3.3).
export const REVIEW_DOC_TYPE_ROWS = Object.freeze([
  "REQ",
  "FSPEC",
  "TSPEC",
  "PLAN",
  "PROPERTIES",
  "DECISIONS",
]);

// BR-25's frozen eight non-feature `docs/` directory names (TSPEC §4.4).
export const NON_FEATURE_DIRS = Object.freeze([
  "_queue",
  "_constraints",
  "_decisions",
  "design",
  "requirements",
  "ideas",
  "discarded",
  "completed",
]);
