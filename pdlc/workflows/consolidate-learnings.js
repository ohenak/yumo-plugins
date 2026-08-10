/**
 * consolidate-learnings.js — LEARNINGS consolidation pass
 *
 * Canonical plugin source: pdlc/workflows/consolidate-learnings.js
 * Built artifact:          pdlc/workflows/dist/consolidate-learnings.bundle.js
 * Consumer runtime copy:   installed from dist/ by pdlc/hooks/scripts/sync-workflows.sh
 *
 * Purpose
 * -------
 * Reads the consuming repo's LEARNINGS corpus, clusters recurring failure modes
 * across features, and promotes durable patterns into DOMAIN-CONSTRAINTS.md,
 * DECISIONS-*.md or a guard-set PR — so a lesson learned once on one feature does
 * not have to be relearned by every feature that follows it.
 *
 * Shape (TSPEC §4.1): one impure driver (`main`) over a wall of pure functions.
 * `main` is the only function in this module that touches a seam; every decision
 * — the corpus predicate, the datum, the id derivation, the merge, the verdicts,
 * the streaks, the routing, the suppression, the counting, the row rendering —
 * is a pure function of already-read text, exported for direct unit test.
 *
 * This file is currently a SKELETON (TSPEC §5, §6 — PLAN T02): the seam
 * protocol, the frozen catalogues, the data-model JSDoc typedefs and one
 * throwing stub per §7/§9 export. No pass behaviour is implemented yet.
 */

// Single-line on purpose: stripModuleSyntax recognises imports line-wise.
import { resolveAdvisoryRung, MERGE_GUARD_DEFAULTS, mergeCommandFor, gitWithLockRetry, ADVISORY_SEAMS } from "./orchestrate-dev.js";

export const meta = {
  name: "consolidate-learnings",
  description:
    "Consolidation pass — clusters recurring failure modes across the LEARNINGS corpus and promotes durable patterns into DOMAIN-CONSTRAINTS.md, DECISIONS-*.md, or a guard-set PR.",
  inputs: [],
};

// ─── TSPEC §6.5 — the "unavailable" literal, pinned (T-10) ────────────────────
//
// One literal serves all four observables the FSPEC fixes and defers the
// spelling of here: a missing effectiveness-row artifact, a suppressed-by
// entry with a short passId, a harvest question with a missing half. Never a
// blank, never a guessed path, and never written into a failure-mode record —
// records are appended as written and never repaired (FSPEC §10.2); this is a
// rendering of a missing field at the point of display only.
export const UNAVAILABLE = "(unavailable)";

// ─── TSPEC §6.4 — frozen catalogues ────────────────────────────────────────────
//
// Every enumerated union in §6.1 is also a module-level Object.freeze([...])
// array, transcribed from pdlc-consolidation-vocabularies.md §1 at Version 1.4
// — transcribed, never widened (§11.3's AT-L5 harness compares these against
// that table in both directions). Freezing is the shipped discipline
// (MERGE_GUARD_DEFAULTS, orchestrate-dev.js:48; MERGE_MODES :55; ADVISORY_SEAMS
// :1669) and is what lets the oracle range over the module's own constants
// rather than over strings scraped from a fixture.

export const TERMINAL_STATUSES = Object.freeze([
  "promoted",
  "promoted-degraded",
  "no-op",
  "skipped-cadence",
  "refused",
  "failed",
]);

export const REASON_CODES = Object.freeze([
  "consolidation-in-progress",
  "reclaimed-stale-lock",
  "advisory-model-unresolved",
  "no-cadence-datum",
  "writes-uncommitted",
  "credential-unavailable",
  "repository-unresolved",
  "api-failure",
  "branch-exists",
  "duplicate-suppressed",
  "no-advisory-corpus",
  "advisory-corpus-empty",
]);

export const TRIGGERS = Object.freeze(["cadence", "volume", "manual"]);

export const ROUTES = Object.freeze(["constraints", "decisions", "PR", "degraded"]);

export const ACTIONS = Object.freeze(["promote", "revise", "retire"]);

export const VERDICTS = Object.freeze(["prevented", "recurred", "insufficient-evidence"]);

export const PROMO_STATES = Object.freeze(["ineffective", "unmeasurable"]);

export const CREDENTIAL_VALUES = Object.freeze(["present (redacted)", "absent", "local-gh"]);

export const PHASE_CATALOGUE = Object.freeze([
  "R",
  "F",
  "T",
  "D",
  "P",
  "PR",
  "I",
  "PT",
  "CR",
  "DOD",
  "H",
  "PUB",
  "MERGE",
]);

// §6.4 — a frozen map from reason code to its permitted terminal-status set,
// vocabularies §1's third column, transcribed verbatim at Version 1.4. Read,
// not enforced away (§6.4): the renderer checks a code it is about to write
// against this map and, when the pair is illegal, drops the code and emits a
// notice rather than writing an illegal row.
export const REASON_CODE_STATUSES = Object.freeze({
  "consolidation-in-progress": Object.freeze(["refused"]),
  "reclaimed-stale-lock": Object.freeze([
    "promoted",
    "promoted-degraded",
    "no-op",
    "failed",
  ]),
  "advisory-model-unresolved": Object.freeze(["failed"]),
  "no-cadence-datum": Object.freeze([
    "promoted",
    "promoted-degraded",
    "no-op",
    "failed",
    "refused",
  ]),
  "writes-uncommitted": Object.freeze([
    "promoted",
    "promoted-degraded",
    "no-op",
    "failed",
  ]),
  "credential-unavailable": Object.freeze(["promoted-degraded", "no-op"]),
  "repository-unresolved": Object.freeze(["promoted-degraded", "no-op"]),
  "api-failure": Object.freeze(["promoted-degraded", "no-op"]),
  "branch-exists": Object.freeze(["promoted-degraded", "no-op"]),
  "duplicate-suppressed": Object.freeze([
    "promoted",
    "promoted-degraded",
    "no-op",
  ]),
  "no-advisory-corpus": Object.freeze([
    "promoted",
    "promoted-degraded",
    "no-op",
    "failed",
  ]),
  "advisory-corpus-empty": Object.freeze([
    "promoted",
    "promoted-degraded",
    "no-op",
    "failed",
  ]),
});

// ─── TSPEC §6 — data model, JSDoc @typedefs (TS notation transcribed) ──────────

/**
 * @typedef {"promoted"|"promoted-degraded"|"no-op"|"skipped-cadence"|"refused"|"failed"} TerminalStatus
 * @typedef {"consolidation-in-progress"|"reclaimed-stale-lock"|"advisory-model-unresolved"|"no-cadence-datum"|"writes-uncommitted"|"credential-unavailable"|"repository-unresolved"|"api-failure"|"branch-exists"|"duplicate-suppressed"|"no-advisory-corpus"|"advisory-corpus-empty"} ReasonCode
 * @typedef {"cadence"|"volume"|"manual"} Trigger
 * @typedef {"constraints"|"decisions"|"PR"|"degraded"} Route
 * @typedef {"promote"|"revise"|"retire"} Action
 * @typedef {"prevented"|"recurred"|"insufficient-evidence"} Verdict
 * @typedef {"ineffective"|"unmeasurable"} PromoState
 * @typedef {"present (redacted)"|"absent"|"local-gh"} Credential
 * @typedef {"R"|"F"|"T"|"D"|"P"|"PR"|"I"|"PT"|"CR"|"DOD"|"H"|"PUB"|"MERGE"} Phase
 */

/**
 * @typedef {object} ConsolidationConfig
 * @property {number} cadenceHours - 168
 * @property {number} volumeThreshold - 5
 * @property {number} staleLockMinutes - 60
 * @property {string|null} pluginRepository - null => the current repository
 * @property {string} credentialEnv - "PDLC_PLUGIN_REPO_TOKEN"
 * @property {number} unmeasurablePasses - 3
 */

/**
 * @typedef {object} ConfigParse
 * @property {ConsolidationConfig} config
 * @property {boolean} sectionMalformed
 * @property {string[]} invalidKeys
 */

/**
 * @typedef {object} PassState
 * @property {string|null} passId - null until step 5
 * @property {Trigger|null} trigger
 * @property {TerminalStatus|null} status
 * @property {Set<ReasonCode>} reasons - a row may carry several (§10.1)
 * @property {string|null} rung - the model id the pass actually ran on
 * @property {Credential} credential - "absent" until §7.2's resolution runs
 * @property {string[]} consumed - basenames, frozen at step 2
 * @property {Proposal[]} proposals
 * @property {FailureModeRecord[]} records - appended one-per-proposal as each routes
 * @property {EffectivenessRow[]|null} effectiveness - null => step 11 never ran
 * @property {Suppression[]} suppressions
 * @property {ParseNotice[]} notices
 * @property {string|null} prUrl - this pass's own PR only
 * @property {string|null} branch
 * @property {boolean} markerHeld
 */

/**
 * @typedef {object} Proposal - the pass's in-flight unit, before it routes
 * @property {string} failureModeId - §7.4's derivation
 * @property {Phase} phase
 * @property {string} symptom - one line, non-keying free text
 * @property {string} artifact - SUBJECT — canonical repo-root-relative path
 * @property {1|2|3} kind - FSPEC §5.2: 1 constraint, 2 decision, 3 process learning
 * @property {string} target - decided by kind; the ONLY field routing reads
 * @property {Action} action
 * @property {string|null} diff - the concrete edit; PR/proposal-file routes require it
 * @property {(1|2|3)[]} elidedKinds - §7.4's merge compensation, for report item 4
 * @property {string[]} elidedArtifacts - §7.4's tie-break compensation, same item
 */

/**
 * @typedef {object} FailureModeRecord - the eight fields, exactly (FSPEC §8.1)
 * @property {string} failureModeId
 * @property {Phase} phase
 * @property {string} symptom
 * @property {string} artifact
 * @property {string} target
 * @property {string} passId
 * @property {Action} action
 * @property {Route} route
 */

/**
 * @typedef {object} EffectivenessRow
 * @property {string} failureModeId
 * @property {string|null} artifact - null => rendered as §6.5's unavailable literal
 * @property {Verdict} verdict
 * @property {PromoState|null} state
 * @property {"revision"|"retirement"|null} remediation - null => the field is ABSENT, not empty
 */

/**
 * @typedef {object} Suppression
 * @property {string} failureModeId
 * @property {Action} action
 * @property {{kind: "pr", url: string}|{kind: "pass", passId: string|null}} evidence
 */

/**
 * @typedef {object} ParseNotice
 * @property {string} subject
 * @property {string} missingField
 * @property {string} [detail]
 */

/**
 * @typedef {object} CorpusFile
 * @property {string} path
 * @property {string} basename
 */

/**
 * @typedef {object} Predicate
 * @property {Set<string>} consolidated
 * @property {string[]} unconsolidated
 * @property {string[][]} basenameCollisions - §7.1's reported collision
 */

/**
 * @typedef {object} EscalationCounts
 * @property {Map<string, Map<string, number>>} bySeamFeature
 * @property {Map<string, number>} totals
 * @property {Map<string, number>} distinctFeatures
 * @property {number} entryCount
 * @property {"absent"|"empty"|"present"} corpusState
 */

// ─── TSPEC §5.1 — the injected seam protocol ───────────────────────────────────
//
// Every service boundary is a defaulted injection parameter of `main()`, the
// shape orchestrate-queue.js:1033-1046 establishes. Production wiring comes
// from runtime-adapter.js's rtConsInjections(); tests pass doubles. The default
// value of every seam is the module's own default* implementation where one is
// meaningful and `null` where the capability must be *installed*.
//
// @typedef {{ok: true}|{ok: false, reason: "file_missing"|"file_empty"}} CheckReply
// @typedef {{ok: true, files: string[]}|{ok: false, reason: "dir_missing"|"not_a_directory"|"unreadable"|"bad_argument"}} ListReply
//
// interface ConsolidationSeams {
//   _agent(skill, prompt, opts?): Promise<string>;
//   _readFile(path): Promise<string|null>;             // null = absent OR unreadable
//   _writeFile(path, contents): Promise<void>;
//   _appendFile(path, text): Promise<void>;             // ONE whole record per call
//   _checkFile(path): Promise<CheckReply>;              // existence/non-empty gate — §7.3
//   _listFiles(dirPath): Promise<ListReply>;             // NOT string[]
//   _git(argv): Promise<{ok, stdout, stderr}>;
//   _ghRun(command): Promise<{ok, stdout, stderr}>;
//   _log(message): void;
//   _phase(label): void;
//   // the two seams this feature adds (§5.3):
//   _envPresent(name): Promise<boolean>;                // NEVER returns the value
//   _makeTempDir(passId): Promise<string|null>;         // absolute path, or null on failure
// }
//
// _now() is NOT a seam. A module-level default, the shipped pattern
// (orchestrate-dev.js:1396, `_now = () => Date.now()`) — see §5.6.

// ─── TSPEC §5.5 — seam defaults ─────────────────────────────────────────────────
//
// "Ordinary operation" is a jest-only claim: the workflow runtime has no
// `import()` and no `fs` (build-runtime.mjs header), so in the bundle these
// defaults throw. That is tolerable for the seams the pass drives on every
// path; see defaultCheckFile below for the one seam where it is load-bearing.

// eslint-disable-next-line no-unused-vars
async function agent(skill, prompt, opts) {
  throw new Error("agent() not available outside Claude Code runtime");
}

// eslint-disable-next-line no-unused-vars
function log(message) {
  if (typeof console !== "undefined") {
    console.log("[consolidate-learnings]", message);
  }
}

// eslint-disable-next-line no-unused-vars
function phase(label) {
  // Provided by runtime
}

// Default file IO — real fs, injectable for tests (mirrors orchestrate-queue.js's
// defaultReadFile / defaultWriteFile).
async function defaultReadFile(path) {
  const { readFileSync } = await import("fs");
  try {
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

async function defaultWriteFile(path, contents) {
  const { writeFileSync } = await import("fs");
  writeFileSync(path, contents, "utf8");
}

async function defaultAppendFile(path, text) {
  const { appendFileSync } = await import("fs");
  appendFileSync(path, text, "utf8");
}

/**
 * §5.5 — the exception to the "ordinary jest operation" row. `_checkFile`'s
 * only consumer is a probe that is *supposed* to be negative on a healthy
 * tree (§7.3), so a default that returned a legal `{ok:false,
 * reason:"file_missing"}` on failure would be indistinguishable from a quiet
 * tree. `defaultCheckFile` therefore fails loudly: it throws on any I/O
 * failure and never returns a CheckReply. It deliberately does NOT copy the
 * never-throw internal contract of the shipped `checkFileNonEmpty`
 * (orchestrate-dev.js:3690-3692) — that shape is right for a caller deciding
 * whether a document exists and wrong for one deciding whether a lock is
 * held.
 *
 * @param {string} path
 * @returns {Promise<CheckReply>}
 */
// eslint-disable-next-line no-unused-vars
async function defaultCheckFile(path) {
  throw new Error("defaultCheckFile() not available outside Claude Code runtime");
}

async function defaultListFiles(dirPath) {
  const { readdirSync } = await import("fs");
  if (typeof dirPath !== "string" || dirPath.trim() === "") {
    return { ok: false, reason: "bad_argument" };
  }
  try {
    const entries = readdirSync(dirPath, { withFileTypes: true });
    return {
      ok: true,
      files: entries.filter((e) => !e.isDirectory()).map((e) => e.name),
    };
  } catch (err) {
    const code = err && err.code;
    if (code === "ENOENT") return { ok: false, reason: "dir_missing" };
    if (code === "ENOTDIR") return { ok: false, reason: "not_a_directory" };
    return { ok: false, reason: "unreadable" };
  }
}

async function defaultGit(argv, { execFn } = {}) {
  const { execFileSync: realExecFileSync } = await import("child_process");
  const exec = execFn ?? ((file, args, opts) => realExecFileSync(file, args, opts));
  const args = Array.isArray(argv) ? argv : [];
  const execOpts = { stdio: "pipe", encoding: "utf8" };
  try {
    const stdout = exec("git", args, execOpts);
    return { ok: true, stdout: String(stdout ?? ""), stderr: "" };
  } catch (err) {
    return {
      ok: false,
      stdout: String((err && err.stdout) ?? ""),
      stderr: String((err && (err.stderr || err.message)) ?? ""),
    };
  }
}

// §5.5 — `_ghRun`'s module default is `null`: the PR route degrades with
// `api-failure` before any call is attempted; the proposal file still
// carries the diff (§10.3).
const NO_GH_RUN = null;

// §5.3, §5.5 — `_envPresent`'s module default is `null`: treated as "no
// credential variable observable" ⇒ §7.2 falls through to the `local-gh`
// probe, then to `absent`.
const NO_ENV_PRESENT = null;

// §5.3, §5.5 — `_makeTempDir`'s module default is `null`: the PR route
// degrades with `api-failure`; the pass never falls back to working in the
// invoking tree, which AC-3.8 forbids outright.
const NO_MAKE_TEMP_DIR = null;

// ─── main() ─────────────────────────────────────────────────────────────────

/**
 * Drive one consolidation pass (TSPEC §4.1). The only impure function in this
 * module — every decision it reaches is delegated to a pure function of
 * already-read text, exported below for direct unit test.
 *
 * SKELETON (PLAN T02): export surface only. No behaviour yet.
 *
 * @param {object} params
 * @param {function} [params._agent]
 * @param {function} [params._readFile]
 * @param {function} [params._writeFile]
 * @param {function} [params._appendFile]
 * @param {function} [params._checkFile]
 * @param {function} [params._listFiles]
 * @param {function} [params._git]
 * @param {function} [params._ghRun]
 * @param {function} [params._log]
 * @param {function} [params._phase]
 * @param {function} [params._envPresent]
 * @param {function} [params._makeTempDir]
 * @param {function} [params._now]
 * @returns {Promise<object>}
 */
export default async function main({
  _agent: agentFn = agent,
  _readFile: readFileFn = defaultReadFile,
  _writeFile: writeFileFn = defaultWriteFile,
  _appendFile: appendFileFn = defaultAppendFile,
  _checkFile: checkFileFn = defaultCheckFile,
  _listFiles: listFilesFn = defaultListFiles,
  _git: gitFn = defaultGit,
  _ghRun: ghRunFn = NO_GH_RUN,
  _log: logFn = log,
  _phase: phaseFn = phase,
  _envPresent: envPresentFn = NO_ENV_PRESENT,
  _makeTempDir: makeTempDirFn = NO_MAKE_TEMP_DIR,
  _now: nowFn = () => Date.now(),
} = {}) {
  // eslint-disable-next-line no-unused-vars
  const seams = {
    agentFn,
    readFileFn,
    writeFileFn,
    appendFileFn,
    checkFileFn,
    listFilesFn,
    gitFn,
    ghRunFn,
    logFn,
    phaseFn,
    envPresentFn,
    makeTempDirFn,
    nowFn,
  };
  throw new Error("consolidate-learnings: main() not implemented yet (PLAN T02 skeleton)");
}

// ─── §7/§9 exports — one throwing stub per name, so every downstream suite ────
// ─── can import the name it will drive (PLAN T02). No behaviour yet. ─────────

function notImplemented(name) {
  throw new Error(`consolidate-learnings: ${name}() not implemented yet (PLAN T02 skeleton)`);
}

// §7.1 — the corpus and the two-region predicate

// The literal argv (TSPEC §7.1 pin (a)) — one `_git` read, never a directory walk (see the
// module-header note on `rtListFiles`'s reply validator, `runtime-adapter.js:915`, `:929-931`).
const LS_FILES_ARGV = Object.freeze([
  "ls-files",
  "--cached",
  "--others",
  "--exclude-standard",
  "--",
  ":(glob)docs/*/LEARNINGS-*.md",
  ":(glob)docs/completed/*/LEARNINGS-*.md",
]);

/** @returns {Promise<{files: CorpusFile[]}|{unlistable: true, detail: string}>} */
export async function enumerateCorpus(_git) {
  const reply = await _git([...LS_FILES_ARGV]);
  if (!reply || !reply.ok) {
    return { unlistable: true, detail: (reply && reply.stderr) || "" };
  }
  return { files: parseCorpusListing(reply.stdout) };
}

/** @returns {CorpusFile[]} */
export function parseCorpusListing(stdout) {
  const text = typeof stdout === "string" ? stdout : "";
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((path) => {
      const slash = path.lastIndexOf("/");
      return { path, basename: slash === -1 ? path : path.slice(slash + 1) };
    });
}

/** @returns {Predicate} */
export function classifyCorpus(files, logText) {
  const entries = Array.isArray(files) ? files : [];

  // §7.1's algorithm, in order.
  const boundary = typeof logText === "string" ? logText.indexOf("<!-- pdlc:consumed") : -1;
  const legacyRegion = boundary === -1 ? (typeof logText === "string" ? logText : "") : logText.slice(0, boundary);
  const rest = boundary === -1 ? "" : logText.slice(boundary);

  const OPENER = "<!-- pdlc:consumed";
  const CLOSER = "<!-- /pdlc:consumed -->";
  const blockLines = new Set();
  let pos = 0;
  while (true) {
    const start = rest.indexOf(OPENER, pos);
    if (start === -1) break;
    const end = rest.indexOf(CLOSER, start);
    const span = end === -1 ? rest.slice(start) : rest.slice(start, end);
    for (const line of span.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.length > 0) blockLines.add(trimmed);
    }
    if (end === -1) break; // truncated block extends to EOF (E-04)
    pos = end + CLOSER.length;
  }

  const consolidated = new Set();
  const unconsolidatedSet = new Set();
  const seenBasenames = new Map(); // basename -> [paths]

  for (const { path, basename } of entries) {
    if (!seenBasenames.has(basename)) seenBasenames.set(basename, []);
    seenBasenames.get(basename).push(path);

    const inLegacy = legacyRegion.includes(basename);
    const inBlock = blockLines.has(basename);
    if (inLegacy || inBlock) {
      consolidated.add(basename);
    } else {
      unconsolidatedSet.add(basename);
    }
  }

  const basenameCollisions = [];
  for (const [, paths] of seenBasenames) {
    const distinctPaths = [...new Set(paths)];
    if (distinctPaths.length >= 2) basenameCollisions.push(distinctPaths);
  }

  return {
    consolidated,
    unconsolidated: [...unconsolidatedSet],
    basenameCollisions,
  };
}

/** @returns {string} */
export function renderConsumedPair(passId, basenames) {
  const list = Array.isArray(basenames) ? basenames : [];
  const lines = [`<!-- pdlc:consumed ${passId} -->`, ...list, `<!-- /pdlc:consumed -->`];
  return `${lines.join("\n")}\n`;
}

// §7.2 — trigger, datum and passId

// The statuses `cadenceDatum` counts toward the datum — TSPEC §7.2: "the date of the most recent
// row whose status is in {promoted, promoted-degraded, no-op, failed}".
const CADENCE_RELEVANT_STATUSES = new Set(["promoted", "promoted-degraded", "no-op", "failed"]);

/** @returns {number|null} */
export function cadenceDatum(logRows) {
  const rows = Array.isArray(logRows) ? logRows : [];
  let latest = null;
  for (const row of rows) {
    if (!row || !CADENCE_RELEVANT_STATUSES.has(row.status)) continue;
    const at = typeof row.date === "number" ? row.date : Date.parse(row.date);
    if (!Number.isFinite(at)) continue;
    if (latest === null || at > latest) latest = at;
  }
  return latest;
}

/** @returns {Trigger|"skipped-cadence"} */
export function triggerFor({ unconsolidated, datum, now, config, direct } = {}) {
  if (direct) return "manual";

  const n = Array.isArray(unconsolidated)
    ? unconsolidated.length
    : typeof unconsolidated === "number"
      ? unconsolidated
      : 0;
  const volumeThreshold = config && typeof config.volumeThreshold === "number" ? config.volumeThreshold : 5;
  if (n >= volumeThreshold) return "volume";

  // The empty datum set (`null`) counts as elapsed (TSPEC §7.2).
  if (datum === null || datum === undefined) return "cadence";

  const cadenceHours = config && typeof config.cadenceHours === "number" ? config.cadenceHours : 168;
  const cadenceMs = cadenceHours * 60 * 60 * 1000;
  return now - datum >= cadenceMs ? "cadence" : "skipped-cadence";
}

/** @returns {string} */
export function mintPassId(logText, today) {
  const text = typeof logText === "string" ? logText : "";
  const prefix = `${today}-`;
  let found = false;
  let max = 0;

  const re = /pass:\s*(\S+)/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    const value = match[1];
    if (!value.startsWith(prefix)) continue; // E-10: unparseable/other-day rows contribute nothing
    const suffix = value.slice(prefix.length);
    if (!/^\d+$/.test(suffix)) continue;
    const n = Number.parseInt(suffix, 10);
    found = true;
    if (n > max) max = n;
  }

  return found ? `${prefix}${max + 1}` : `${prefix}1`;
}

// §7.3 — the marker

// `IN-PROGRESS: {passId} {ISO-8601}` or BR-14a's `RELEASED: {passId} {ISO-8601}` — exactly one
// line, nothing else (TSPEC:950-954).
const MARKER_LINE = /^(IN-PROGRESS|RELEASED):\s*(\S+)\s+(\S+)$/;

/** @returns {{state: "in-progress"|"released", passId: string, at: number}|null} */
export function parseMarker(text) {
  if (typeof text !== "string") return null;
  if (text.includes("\n")) return null;
  const match = MARKER_LINE.exec(text);
  if (!match) return null;
  const [, verb, passId, timestamp] = match;
  const at = Date.parse(timestamp);
  if (!Number.isFinite(at)) return null;
  return { state: verb === "IN-PROGRESS" ? "in-progress" : "released", passId, at };
}

/** @returns {"free"|"refuse"|"reclaim"} */
export function markerVerdict(parsed, present, nowMs, staleLockMinutes) {
  if (!present) return "free";
  if (parsed === null) return "reclaim"; // present but unparseable — no timestamp to age out
  if (parsed.state === "released") return "free"; // E-11b — free at any age, no reason code
  const staleMs = staleLockMinutes * 60 * 1000;
  return nowMs - parsed.at >= staleMs ? "reclaim" : "refuse";
}

/**
 * §7.3 — observe-then-write, three seam calls: `_checkFile` for `present` (never derived from
 * `_readFile`), `_readFile` for the text `parseMarker` consumes, then `_writeFile` when the
 * verdict permits taking the marker.
 *
 * @returns {Promise<{verdict: "free"|"refuse"|"reclaim", parsed: object|null, taken: boolean}>}
 */
export async function takeMarker(state, seams) {
  const { markerPath, passId, nowMs, staleLockMinutes } = state;
  const { checkFileFn, readFileFn, writeFileFn } = seams;
  const checkReply = await checkFileFn(markerPath);
  const present = !(checkReply && checkReply.ok === false && checkReply.reason === "file_missing");
  const text = await readFileFn(markerPath);
  const parsed = parseMarker(text);
  const verdict = markerVerdict(parsed, present, nowMs, staleLockMinutes);
  if (verdict === "refuse") {
    return { verdict, parsed, taken: false };
  }
  await writeFileFn(markerPath, `IN-PROGRESS: ${passId} ${new Date(nowMs).toISOString()}`);
  return { verdict, parsed, taken: true };
}

/**
 * §7.3, FSPEC BR-14a — the ONLY write step 16 makes: an in-place sentinel, never a removal (no
 * seam in this protocol can unlink a file).
 */
export async function releaseMarker(state, seams) {
  const { markerPath, passId, nowMs } = state;
  const { writeFileFn } = seams;
  await writeFileFn(markerPath, `RELEASED: ${passId} ${new Date(nowMs).toISOString()}`);
}

// §7.4 — the id, proposals, and the intra-pass merge

/** @returns {string} */
export function failureModeId(phase, artifact) {
  // TSPEC §7.4's three ordered substitutions — order is load-bearing: collapsing runs AFTER the
  // separator substitution is what makes `a-b.md`, `a/b.md` and `a.b.md` collide into one id.
  const slug = String(artifact)
    .replace(/[/.]/g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${String(phase).toLowerCase()}-${slug}`;
}

/** @returns {string} */
export function targetFor(kind, artifact, id) {
  if (kind === 1) return "docs/_constraints/DOMAIN-CONSTRAINTS.md";
  if (kind === 2) return `docs/_decisions/DECISIONS-${id}.md`;
  return artifact; // kind 3 — the subject artifact itself
}

/** @returns {Proposal[]} */
export function mergeProposals(proposals) {
  const list = Array.isArray(proposals) ? proposals : [];

  // Group by (failureModeId, action) — never by kind, never by target (TSPEC §7.4).
  const order = [];
  const groups = new Map();
  for (const p of list) {
    const key = `${p.failureModeId} ${p.action}`;
    if (!groups.has(key)) {
      groups.set(key, []);
      order.push(key);
    }
    groups.get(key).push(p);
  }

  const byteCompare = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

  const result = [];
  for (const key of order) {
    const group = groups.get(key);
    if (group.length === 1) {
      result.push(group[0]);
      continue;
    }

    // Canonical processing order for this fold — byte order over `artifact` — so every derived
    // field (including the symptom join) is a pure function of the group, never of input order.
    const sortedByArtifact = [...group].sort((a, b) => byteCompare(a.artifact, b.artifact));
    const foldedArtifact = sortedByArtifact[0].artifact;
    const foldedKind = Math.min(...group.map((p) => p.kind));
    const id = sortedByArtifact[0].failureModeId;

    const elidedKinds = [...new Set(group.map((p) => p.kind))]
      .filter((k) => k !== foldedKind)
      .sort((a, b) => a - b);
    const elidedArtifacts = group
      .map((p) => p.artifact)
      .filter((a) => a !== foldedArtifact)
      .sort(byteCompare);

    result.push({
      failureModeId: id,
      phase: sortedByArtifact[0].phase,
      symptom: sortedByArtifact.map((p) => p.symptom).join("; "),
      artifact: foldedArtifact,
      kind: foldedKind,
      target: targetFor(foldedKind, foldedArtifact, id),
      action: sortedByArtifact[0].action,
      diff: sortedByArtifact[0].diff === undefined ? null : sortedByArtifact[0].diff,
      elidedKinds,
      elidedArtifacts,
    });
  }

  return result;
}

// The eight `FailureModeRecord` fields, on-disk key -> camelCased property name (FSPEC §8.1).
const LOG_RECORD_FIELD_MAP = [
  ["failure-mode-id", "failureModeId"],
  ["phase", "phase"],
  ["symptom", "symptom"],
  ["artifact", "artifact"],
  ["target", "target"],
  ["passId", "passId"],
  ["action", "action"],
  ["route", "route"],
];

/** @returns {{records: FailureModeRecord[], notices: ParseNotice[]}} */
export function parseLogRecords(logText) {
  const text = typeof logText === "string" ? logText : "";
  const blocks = text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);

  const records = [];
  const notices = [];

  for (const block of blocks) {
    const fieldValues = {};
    for (const line of block.split("\n")) {
      const colon = line.indexOf(":");
      if (colon === -1) continue;
      fieldValues[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
    }

    const record = {};
    for (const [textKey, propKey] of LOG_RECORD_FIELD_MAP) {
      if (Object.prototype.hasOwnProperty.call(fieldValues, textKey)) {
        record[propKey] = fieldValues[textKey];
      }
    }

    const subject = record.failureModeId;
    for (const [, propKey] of LOG_RECORD_FIELD_MAP) {
      if (!Object.prototype.hasOwnProperty.call(record, propKey)) {
        notices.push({ subject, missingField: propKey });
      }
    }

    records.push(record);
  }

  return { records, notices };
}

// §7.5 — effectiveness, streaks, remediation, the open list

// Vocabularies §2's row 1 mapping — docType named in a CROSS-REVIEW basename -> the phase that
// owns it. Transcribed verbatim (`docs/_constraints/pdlc-consolidation-vocabularies.md` §2).
const DOCTYPE_OWNING_PHASE = Object.freeze({
  REQ: "R",
  FSPEC: "F",
  TSPEC: "T",
  DECISIONS: "D",
  PLAN: "P",
  PROPERTIES: "PR",
});

const CROSS_REVIEW_BASENAME = new RegExp(
  `^CROSS-REVIEW-.+-(${Object.keys(DOCTYPE_OWNING_PHASE).join("|")})-v\\d+\\.md$`
);
const CODE_REVIEW_BASENAME = /^CODE_REVIEW-.+-v\d+\.md$/;
const POSTMORTEM_BASENAME = /^POSTMORTEM-([A-Za-z]+)-.+\.md$/;

/**
 * §7.5, vocabularies §2 — prefers the LEARNINGS' own `Phases exercised` metadata row; falls back,
 * per file, to the `Harvested from` basename mapping. Row 3 (POSTMORTEM) takes precedence over
 * rows 1–2, so it is checked first. Undecidable ⇒ the empty set, never a guessed phase.
 *
 * @returns {Set<Phase>}
 */
export function phasesExercised(learningsText) {
  const text = typeof learningsText === "string" ? learningsText : "";

  const phasesRow = text.match(/^\|\s*Phases exercised\s*\|\s*(.*?)\s*\|\s*$/m);
  if (phasesRow) {
    const phases = phasesRow[1]
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    return new Set(phases);
  }

  const harvestedRow = text.match(/^\|\s*Harvested from\s*\|\s*(.*?)\s*\|\s*$/m);
  const basename = harvestedRow ? harvestedRow[1].trim() : "";

  const postmortemMatch = basename.match(POSTMORTEM_BASENAME);
  if (postmortemMatch) return new Set([postmortemMatch[1]]);

  const crossReviewMatch = basename.match(CROSS_REVIEW_BASENAME);
  if (crossReviewMatch) return new Set([DOCTYPE_OWNING_PHASE[crossReviewMatch[1]]]);

  if (CODE_REVIEW_BASENAME.test(basename)) return new Set(["DOD"]);

  return new Set();
}

// A consumed LEARNINGS' `- failure-mode-id: {id}` line (FSPEC §8.4 step 3's grammar).
const FAILURE_MODE_ID_LINE = /^-\s*failure-mode-id:\s*(.+)$/gm;

/** @returns {boolean} at least one consumed text names `id` (FSPEC §8.3's `recurred` arm). */
function consumedNamesId(consumedList, id) {
  for (const text of consumedList) {
    if (typeof text !== "string") continue;
    FAILURE_MODE_ID_LINE.lastIndex = 0;
    let match;
    while ((match = FAILURE_MODE_ID_LINE.exec(text)) !== null) {
      if (match[1].trim() === id) return true;
    }
  }
  return false;
}

/** @returns {boolean} at least one consumed text is decided to have exercised `phase`. */
function consumedExercisedPhase(consumedList, phase) {
  if (phase === undefined || phase === null) return false;
  for (const text of consumedList) {
    if (typeof text !== "string") continue;
    if (phasesExercised(text).has(phase)) return true;
  }
  return false;
}

/** @returns {Verdict} FSPEC §8.3's three arms, evaluated in order, total. */
function effectivenessVerdict(id, phase, consumedList) {
  if (consumedNamesId(consumedList, id)) return "recurred";
  if (consumedExercisedPhase(consumedList, phase)) return "prevented";
  return "insufficient-evidence";
}

/**
 * §7.5, FSPEC §8.3, §8.5, §8.7 — one row per distinct `failureModeId` in `records`, sorted on that
 * id (PROP-GEN-06: the table is invariant under record order, so the row order cannot be a
 * function of it). The standing verdict comes from evaluating §8.3's arms against the most recent
 * pass's consumed set, and the `ineffective`/`unmeasurable` streaks come from folding every pass's
 * consumed set, in file order. `remediation` is always `null` here — this function receives
 * neither `prStates` nor `headExists`, so choosing it is the caller's job (`remediationChoice`).
 *
 * @returns {EffectivenessRow[]}
 */
export function effectivenessTable(records, consumedTexts, config) {
  const recordList = Array.isArray(records) ? records : [];
  const passes = Array.isArray(consumedTexts) ? consumedTexts : [];
  const cfg = config && typeof config === "object" ? config : {};
  const unmeasurablePasses =
    typeof cfg.unmeasurablePasses === "number" ? cfg.unmeasurablePasses : 3;

  // First-seen record per distinct id — a row cannot be keyed on an absent id.
  const order = [];
  const firstRecordById = new Map();
  for (const r of recordList) {
    if (!r || typeof r.failureModeId !== "string") continue;
    if (!firstRecordById.has(r.failureModeId)) {
      firstRecordById.set(r.failureModeId, r);
      order.push(r.failureModeId);
    }
  }

  // A `revise` record for this id marks the passId whose fold resets the `ineffective` streak
  // (TSPEC §7.5's "merged revision", simplified to this function's own inputs).
  const revisePassIdsById = new Map();
  for (const r of recordList) {
    if (!r || typeof r.failureModeId !== "string" || r.action !== "revise") continue;
    if (!revisePassIdsById.has(r.failureModeId)) revisePassIdsById.set(r.failureModeId, new Set());
    if (typeof r.passId === "string") revisePassIdsById.get(r.failureModeId).add(r.passId);
  }

  const rows = [];
  for (const id of order) {
    const source = firstRecordById.get(id);
    const phase = source.phase;
    const artifact = source.artifact !== undefined ? source.artifact : null;
    const resetPassIds = revisePassIdsById.get(id) ?? new Set();

    let ineffectiveStreak = 0;
    let unmeasurableStreak = 0;

    for (const pass of passes) {
      if (!pass || !Array.isArray(pass.consumed)) continue;

      if (typeof pass.passId === "string" && resetPassIds.has(pass.passId)) {
        ineffectiveStreak = 0;
      }

      if (pass.consumed.length === 0) continue; // empty consumed set — neither streak moves

      const verdict = effectivenessVerdict(id, phase, pass.consumed);

      // §8.5 — the `ineffective` streak: counted on `recurred`/`prevented`, skipped (untouched)
      // on `insufficient-evidence`.
      if (verdict === "recurred") ineffectiveStreak += 1;
      else if (verdict === "prevented") ineffectiveStreak = 0;

      // §8.7 — the `unmeasurable` streak: every non-empty-consumed pass is evaluated.
      if (verdict === "insufficient-evidence") unmeasurableStreak += 1;
      else unmeasurableStreak = 0;
    }

    const lastPass = passes.length > 0 ? passes[passes.length - 1] : null;
    const lastConsumed = lastPass && Array.isArray(lastPass.consumed) ? lastPass.consumed : [];
    const verdict = effectivenessVerdict(id, phase, lastConsumed);

    let state = null;
    if (ineffectiveStreak >= 2) state = "ineffective";
    else if (unmeasurableStreak >= unmeasurablePasses) state = "unmeasurable";

    rows.push({
      failureModeId: id,
      artifact,
      verdict,
      state,
      remediation: null,
    });
  }

  // PROP-GEN-06: the table is invariant under record order, so the row order cannot be a function
  // of `records`' own order — sorted on the one field every row carries.
  rows.sort((a, b) => (a.failureModeId < b.failureModeId ? -1 : a.failureModeId > b.failureModeId ? 1 : 0));

  return rows;
}

/**
 * §7.5 — the ids for which no record carries a landed (non-`degraded`) retire. A record short of
 * `action` or `route` cannot close an id (it stays open); a record short of `failureModeId`
 * contributes no member at all.
 *
 * @returns {string[]}
 */
export function openPromotionList(records) {
  const list = Array.isArray(records) ? records : [];
  const order = [];
  const seen = new Set();
  const closed = new Set();

  for (const r of list) {
    if (!r || typeof r.failureModeId !== "string") continue;
    if (!seen.has(r.failureModeId)) {
      seen.add(r.failureModeId);
      order.push(r.failureModeId);
    }
    if (r.action === "retire" && r.route !== undefined && r.route !== "degraded") {
      closed.add(r.failureModeId);
    }
  }

  return order.filter((id) => !closed.has(id));
}

/**
 * §7.5, FSPEC §8.5's four rows, evaluated top-down. `records` is unused by the rule itself — the
 * spent-alternative clause reads only `prStates` (NFR-4) — but stays in the signature per TSPEC
 * §7.5.
 *
 * @returns {"revision"|"retirement"|null}
 */
// eslint-disable-next-line no-unused-vars
export function remediationChoice(id, records, prStates, headExists) {
  const states = Array.isArray(prStates) ? prStates : [];

  const hasSpentPair = (action) =>
    states.some(
      (pr) =>
        pr &&
        (pr.state === "open" || pr.state === "merged") &&
        Array.isArray(pr.pairs) &&
        pr.pairs.some((p) => p && p.failureModeId === id && p.action === action)
    );

  if (hasSpentPair("retire")) return null;
  if (hasSpentPair("revise")) return "retirement";
  if (headExists) return "revision";
  return "retirement";
}

// §7.6 — routing and suppression

const DECISIONS_TARGET = /^docs\/_decisions\/DECISIONS-.+\.md$/;

/**
 * §7.6 — set-equal to the IMPORTED `MERGE_GUARD_DEFAULTS`, never a module-local copy: any prefix
 * member routes `PR`; failing that, the two named constraint/decision paths; everything else in
 * the consuming repo is `proposal-file` — an in-module control value, never rendered (§7.6, ER-6).
 *
 * @returns {"PR"|"constraints"|"decisions"|"proposal-file"}
 */
export function routeOf(target) {
  const path = String(target);
  for (const prefix of MERGE_GUARD_DEFAULTS) {
    if (path.startsWith(prefix)) return "PR";
  }
  if (path === "docs/_constraints/DOMAIN-CONSTRAINTS.md") return "constraints";
  if (DECISIONS_TARGET.test(path)) return "decisions";
  return "proposal-file";
}

/**
 * §7.6, FSPEC §8.6 — the ONLY caller of `routeOf`. A guard-set target takes the PR route on every
 * action; a `promote` onto `routeOf`'s constraints/decisions answer is applied there; every other
 * combination — including `revise`/`retire` onto constraints/decisions, and any action onto a
 * consuming-repo path — is `proposal-file`.
 *
 * @returns {"PR"|"constraints"|"decisions"|"proposal-file"}
 */
export function routeProposal(p) {
  const r = routeOf(p.target);
  if (r === "PR") return "PR";
  if (p.action === "promote" && (r === "constraints" || r === "decisions")) return r;
  return "proposal-file";
}

/**
 * §7.6 — a function of `(failureModeId, action)` AND `route`, and of nothing else: a record short
 * of any of the three cannot be evaluated and reads absent, even when the other fields match. A
 * `degraded` route never suppresses. `passId` is carried when present but is never itself a
 * matching key.
 *
 * @returns {{enacted: boolean, passId: string|null}}
 */
export function enactedByLog(pair, records) {
  const list = Array.isArray(records) ? records : [];
  for (const r of list) {
    if (!r || typeof r !== "object") continue;
    if (!("failureModeId" in r) || !("action" in r) || !("route" in r)) continue;
    if (r.failureModeId !== pair.failureModeId || r.action !== pair.action) continue;
    if (r.route === "degraded") continue;
    return { enacted: true, passId: typeof r.passId === "string" ? r.passId : null };
  }
  return { enacted: false, passId: null };
}

// FSPEC §9.2's trailer line: `{failureModeId}:{action}` entries, comma-separated.
const CONSOLIDATION_PROMOTIONS_TRAILER = /^PDLC-CONSOLIDATION-PROMOTIONS:\s*(.*)$/m;
const ENACTING_PR_STATES = new Set(["OPEN", "MERGED"]);

/**
 * §7.6, §9.2 — reads the `PDLC-CONSOLIDATION-PROMOTIONS` trailer of PRs observed `OPEN` or
 * `MERGED` only; state is read at poll time, no memory of any prior state.
 *
 * @returns {{enacted: boolean, url: string|null}}
 */
export function enactedByPr(pair, prStates) {
  const list = Array.isArray(prStates) ? prStates : [];
  const key = `${pair.failureModeId}:${pair.action}`;
  for (const pr of list) {
    if (!pr || !ENACTING_PR_STATES.has(pr.state)) continue;
    const body = typeof pr.body === "string" ? pr.body : "";
    const match = CONSOLIDATION_PROMOTIONS_TRAILER.exec(body);
    if (!match) continue;
    const entries = match[1].split(",").map((e) => e.trim());
    if (entries.includes(key)) return { enacted: true, url: pr.url ?? null };
  }
  return { enacted: false, url: null };
}

// §7.7 — the advisory corpus

const ESCALATION_FEATURE_ROW = /^\|\s*Feature\s*\|\s*(.+?)\s*\|\s*$/m;
const ESCALATION_SEAM_ROW = /^\|\s*Seam\s*\|\s*(.+?)\s*\|\s*$/m;

/**
 * §7.7 — reads the metadata table row, never the heading (`renderEscalationEntry`,
 * `orchestrate-dev.js:2763`). `corpusState` is `absent` for `null` (unreadable folds into this
 * too, at the caller's `_readFile` seam — never `empty`), `empty` for a file with no `## ` entries,
 * `present` otherwise. An entry missing `Feature` or `Seam` is skipped — a parse notice, not an
 * abort, and attributed to no key.
 *
 * @returns {EscalationCounts}
 */
export function parseEscalations(text) {
  const bySeamFeature = new Map();
  const totals = new Map();
  const distinctFeatures = new Map();

  if (text === null || text === undefined) {
    return { bySeamFeature, totals, distinctFeatures, entryCount: 0, corpusState: "absent" };
  }

  const raw = typeof text === "string" ? text : "";
  const blocks = raw
    .split(/^## /m)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  let entryCount = 0;
  for (const block of blocks) {
    const featureMatch = block.match(ESCALATION_FEATURE_ROW);
    const seamMatch = block.match(ESCALATION_SEAM_ROW);
    if (!featureMatch || !seamMatch) continue; // E-12: skipped, parse notice, no guessed key

    const feature = featureMatch[1].trim();
    const seam = seamMatch[1].trim();
    entryCount += 1;

    if (!bySeamFeature.has(seam)) bySeamFeature.set(seam, new Map());
    const perFeature = bySeamFeature.get(seam);
    perFeature.set(feature, (perFeature.get(feature) ?? 0) + 1);

    totals.set(seam, (totals.get(seam) ?? 0) + 1);
    distinctFeatures.set(seam, perFeature.size);
  }

  const corpusState = blocks.length === 0 ? "empty" : "present";

  return { bySeamFeature, totals, distinctFeatures, entryCount, corpusState };
}

/**
 * §7.7, FSPEC §9.4–§9.5 — ranges over EVERY entry in `ESCALATIONS.md` (BR-37a): no filter on
 * `Feature`, none on date, no relation to any consumed set. A stock repo (`corpusState` other than
 * `present`) proposes nothing of either kind (FSPEC §9.3 row 1/2).
 *
 * @returns {{over: string|null, tie: string[], under: string[]}}
 */
export function seamCandidates(counts) {
  const c = counts && typeof counts === "object" ? counts : {};
  if (c.corpusState !== "present") return { over: null, tie: [], under: [] };

  const totals = c.totals instanceof Map ? c.totals : new Map();
  const distinctFeatures = c.distinctFeatures instanceof Map ? c.distinctFeatures : new Map();
  const escalatingSeams = [...totals.keys()].filter((seam) => (totals.get(seam) ?? 0) > 0);

  let over = null;
  const tie = [];
  if (escalatingSeams.length > 0) {
    const maxTotal = Math.max(...escalatingSeams.map((seam) => totals.get(seam) ?? 0));
    const topSeams = escalatingSeams.filter((seam) => (totals.get(seam) ?? 0) === maxTotal);
    if (topSeams.length === 1) {
      const [seam] = topSeams;
      if ((distinctFeatures.get(seam) ?? 0) >= 2) over = seam;
    } else {
      tie.push(...topSeams.sort());
    }
  }

  const under = [];
  if (escalatingSeams.length > 0) {
    for (const seam of ADVISORY_SEAMS) {
      if ((totals.get(seam) ?? 0) === 0) under.push(seam);
    }
  }

  return { over, tie, under };
}

// §7.8 — configuration

// §6 typedef ConsolidationConfig's defaults, transcribed.
const CONSOLIDATION_DEFAULTS = Object.freeze({
  cadenceHours: 168,
  volumeThreshold: 5,
  staleLockMinutes: 60,
  pluginRepository: null,
  credentialEnv: "PDLC_PLUGIN_REPO_TOKEN",
  unmeasurablePasses: 3,
});

function isPlainObjectLocal(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * §7.8 — structurally identical to `parseAdvisoryConfig` (orchestrate-dev.js:1682), reproduced
 * key-for-key: pure, total, never throws, every key falls back INDEPENDENTLY.
 *
 * @param {string|null} text
 * @returns {ConfigParse}
 */
export function parseConsolidationConfig(text) {
  const degraded = (sectionMalformed) => ({
    config: CONSOLIDATION_DEFAULTS,
    sectionMalformed,
    invalidKeys: [],
  });

  if (text == null) return degraded(false);

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return degraded(false);
  }

  if (!isPlainObjectLocal(parsed) || !("consolidation" in parsed)) return degraded(false);

  const section = parsed.consolidation;
  if (!isPlainObjectLocal(section)) return degraded(true);

  const invalidKeys = [];

  const positiveInt = (key) => {
    if (!(key in section)) return CONSOLIDATION_DEFAULTS[key];
    const v = section[key];
    if (Number.isInteger(v) && v >= 1) return v;
    invalidKeys.push(key);
    return CONSOLIDATION_DEFAULTS[key];
  };

  const nullableRepository = (key) => {
    if (!(key in section)) return CONSOLIDATION_DEFAULTS[key];
    const v = section[key];
    if (v === null || (typeof v === "string" && v.trim() !== "")) return v;
    invalidKeys.push(key);
    return CONSOLIDATION_DEFAULTS[key];
  };

  const nonEmptyString = (key) => {
    if (!(key in section)) return CONSOLIDATION_DEFAULTS[key];
    const v = section[key];
    if (typeof v === "string" && v.trim() !== "") return v;
    invalidKeys.push(key);
    return CONSOLIDATION_DEFAULTS[key];
  };

  const config = {
    cadenceHours: positiveInt("cadenceHours"),
    volumeThreshold: positiveInt("volumeThreshold"),
    staleLockMinutes: positiveInt("staleLockMinutes"),
    pluginRepository: nullableRepository("pluginRepository"),
    credentialEnv: nonEmptyString("credentialEnv"),
    unmeasurablePasses: positiveInt("unmeasurablePasses"),
  };

  return { config, sectionMalformed: false, invalidKeys };
}

// §7.9 — rendering: the log records and the report body

/** @returns {string} */
export function renderFailureModeRecord(record) {
  return notImplemented("renderFailureModeRecord");
}

/** @returns {string} */
export function renderEffectivenessTable(rows) {
  return notImplemented("renderEffectivenessTable");
}

/** @returns {{text: string, dropped: ReasonCode[]}} */
export function renderTerminalRow(state) {
  return notImplemented("renderTerminalRow");
}

/** @returns {string} */
export function renderReportBody(state) {
  return notImplemented("renderReportBody");
}

/** @returns {string} the PR body file (AC-3.2, AC-3.7) */
export function renderPrBody(state, enacted) {
  return notImplemented("renderPrBody");
}

/** @returns {string} CONSOLIDATION-PROPOSAL-{passId}.md (AC-3.5) */
export function renderProposalFile(state, deferred) {
  return notImplemented("renderProposalFile");
}

/** @returns {string} PDLC-PROMOTION-ID trailer (AC-3.3) */
export function renderPromotionCommitMessage(proposal, passId) {
  return notImplemented("renderPromotionCommitMessage");
}

// §9.1 — the temporary clone

/** @returns {Promise<{dir: string}|{failure: ReasonCode, detail: string}>} */
export async function openClone(passId, config, seams) {
  return notImplemented("openClone");
}

// §9.3 — the three seam domains and their verb sets

/** @returns {"pr"|"git-invoking"|"git-clone"} total — never null */
export function resolveSeamDomain(seam, argvOrCommand, cloneDir) {
  return notImplemented("resolveSeamDomain");
}

/** @returns {string} "unknown" when unresolvable */
export function resolveSeamVerb(domain, argvOrCommand) {
  return notImplemented("resolveSeamVerb");
}

// §9.4 — the consuming-repo commit

/** @returns {Promise<{committed: boolean, reason?: "writes-uncommitted"}>} */
export async function commitConsumingRepoPaths(paths, message, seams) {
  return notImplemented("commitConsumingRepoPaths");
}
