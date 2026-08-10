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
import { resolveAdvisoryRung, MERGE_GUARD_DEFAULTS, mergeCommandFor, gitWithLockRetry } from "./orchestrate-dev.js";

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

/** @returns {number|null} */
export function cadenceDatum(logRows) {
  return notImplemented("cadenceDatum");
}

/** @returns {Trigger|"skipped-cadence"} */
export function triggerFor(params) {
  return notImplemented("triggerFor");
}

/** @returns {string} */
export function mintPassId(logText, today) {
  return notImplemented("mintPassId");
}

// §7.3 — the marker

/** @returns {{state: "in-progress"|"released", passId: string, at: number}|null} */
export function parseMarker(text) {
  return notImplemented("parseMarker");
}

/** @returns {"free"|"refuse"|"reclaim"} */
export function markerVerdict(parsed, present, nowMs, staleLockMinutes) {
  return notImplemented("markerVerdict");
}

export async function takeMarker(state, seams) {
  return notImplemented("takeMarker");
}

export async function releaseMarker(state, seams) {
  return notImplemented("releaseMarker");
}

// §7.4 — the id, proposals, and the intra-pass merge

/** @returns {string} */
export function failureModeId(phase, artifact) {
  return notImplemented("failureModeId");
}

/** @returns {string} */
export function targetFor(kind, artifact, id) {
  return notImplemented("targetFor");
}

/** @returns {Proposal[]} */
export function mergeProposals(proposals) {
  return notImplemented("mergeProposals");
}

/** @returns {{records: FailureModeRecord[], notices: ParseNotice[]}} */
export function parseLogRecords(logText) {
  return notImplemented("parseLogRecords");
}

// §7.5 — effectiveness, streaks, remediation, the open list

/** @returns {Set<Phase>} */
export function phasesExercised(learningsText) {
  return notImplemented("phasesExercised");
}

/** @returns {EffectivenessRow[]} */
export function effectivenessTable(records, consumedTexts, config) {
  return notImplemented("effectivenessTable");
}

/** @returns {string[]} */
export function openPromotionList(records) {
  return notImplemented("openPromotionList");
}

/** @returns {"revision"|"retirement"|null} */
export function remediationChoice(id, records, prStates, headExists) {
  return notImplemented("remediationChoice");
}

// §7.6 — routing and suppression

/** @returns {"PR"|"constraints"|"decisions"|"proposal-file"} */
export function routeOf(target) {
  return notImplemented("routeOf");
}

/** @returns {"PR"|"constraints"|"decisions"|"proposal-file"} */
export function routeProposal(p) {
  return notImplemented("routeProposal");
}

/** @returns {{enacted: boolean, passId: string|null}} */
export function enactedByLog(pair, records) {
  return notImplemented("enactedByLog");
}

/** @returns {{enacted: boolean, url: string|null}} */
export function enactedByPr(pair, prStates) {
  return notImplemented("enactedByPr");
}

// §7.7 — the advisory corpus

/** @returns {EscalationCounts} */
export function parseEscalations(text) {
  return notImplemented("parseEscalations");
}

/** @returns {{over: string|null, tie: string[], under: string[]}} */
export function seamCandidates(counts) {
  return notImplemented("seamCandidates");
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
