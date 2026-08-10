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
  direct = false,
} = {}) {
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

  const nowMs = nowFn();
  const markerPath = "docs/_decisions/.consolidation-lock";
  const logPath = "docs/_decisions/.consolidation-log.md";

  const state = {
    passId: null,
    trigger: null,
    status: null,
    reasons: new Set(),
    rung: null,
    credential: "absent",
    consumed: [],
    proposals: [],
    records: [],
    effectiveness: null,
    suppressions: [],
    notices: [],
    deferred: [],
    prUrl: null,
    branch: null,
    markerHeld: false,
    markerPath,
    logPath,
    nowMs,
    heldPassId: null,
    abandonedPassId: null,
    // §8.4 — the tee's report-body-only buffer: every resolver line and every
    // dispatch failure message lands here and is rendered into `body`.
    dispatchLog: [],
    writeSet: new Set([logPath]),
  };

  // The §8.4 tee: forwards to the caller's sink AND retains the text.
  const tee = (line) => {
    state.dispatchLog.push(String(line));
    try {
      logFn(line);
    } catch {
      // the caller's sink is best-effort; retention is the obligation
    }
  };

  // Step 1 — configuration (§7.8): per-key independent fallback, never a halt.
  const configText = await readFileFn(".claude/pdlc.config.json");
  const parse = parseConsolidationConfig(configText);
  const { config } = parse;
  // §11.3's notices, derived by the one production builder AT-N1…AT-N3 also drive (`:1835`).
  for (const notice of configNotices(parse)) state.notices.push(notice);
  state.config = config;

  // Step 2 — enumerate the corpus (basenames only, no body read) and classify.
  const logText = await readFileFn(logPath);
  const corpusReply = await enumerateCorpus(gitFn);
  if (corpusReply.unlistable) {
    // §10.3 row 1a — `failed`, NO reason code (vocabularies §1 has no row for it),
    // the pathspec and stderr in the report body. Never `no-op`.
    state.dispatchLog.push(`corpus unlistable: ${LS_FILES_ARGV.join(" ")} — ${corpusReply.detail}`);
    state.status = "failed";
    return await finishPass(state, seams);
  }
  const corpusFiles = corpusReply.files;
  const predicate = classifyCorpus(corpusFiles, logText);
  state.consumed = [...predicate.unconsolidated];
  for (const collision of predicate.basenameCollisions) {
    state.notices.push({ subject: "corpus", detail: `basename collision: ${collision.join(", ")}` });
  }

  // Steps 3/4 — volume then cadence (§7.2). `skipped-cadence` is the one terminal
  // branch that is not a jump: no row, no marker, no passId, no further git call.
  const datum = cadenceDatum(parseTerminalRows(logText));
  const trigger = triggerFor({ unconsolidated: predicate.unconsolidated, datum, now: nowMs, config, direct });
  if (trigger === "skipped-cadence") {
    state.status = "skipped-cadence";
    return await finishPass(state, seams);
  }
  state.trigger = trigger;
  if (trigger === "cadence" && (datum === null || datum === undefined)) {
    state.reasons.add("no-cadence-datum");
  }

  // Step 5 — mint the passId (§7.2): derived from the log, never a counter or clock.
  const todayPrefix = new Date(nowMs).toISOString().slice(0, 10);
  state.passId = mintPassId(logText, todayPrefix);

  // Step 6 — take the marker (§7.3): observe-then-write, three seam calls.
  const take = await takeMarker(
    { markerPath, passId: state.passId, nowMs, staleLockMinutes: config.staleLockMinutes },
    { checkFileFn, readFileFn, writeFileFn }
  );
  if (take.verdict === "refuse") {
    state.status = "refused";
    state.reasons.add("consolidation-in-progress");
    state.heldPassId = take.parsed ? take.parsed.passId : "unknown";
    return await finishPass(state, seams);
  }
  if (take.verdict === "reclaim") {
    state.reasons.add("reclaimed-stale-lock");
    state.abandonedPassId = take.parsed && take.parsed.passId ? take.parsed.passId : "unknown";
  }
  state.markerHeld = take.taken;

  // Step 7 — the consumed pair (§3.3, NFR-5): complete, in one append, even when empty.
  await appendFileFn(logPath, renderConsumedPair(state.passId, state.consumed));

  // Step 8 — read the consumed LEARNINGS bodies and issue the first advisory
  // dispatch (the clustering call) through `resolveAdvisoryRung`. An empty
  // corpus has nothing to cluster and no rung to observe (FSPEC §12.1 S-05).
  const rungState = { resolved: null };
  let clusterReplyText = null;
  const consumedBodies = [];
  if (corpusFiles.length > 0) {
    const basenameToPath = new Map(corpusFiles.map((f) => [f.basename, f.path]));
    for (const basename of state.consumed) {
      const path = basenameToPath.get(basename);
      const text = path ? await readFileFn(path) : null;
      // An unreadable member is still counted, still named (TSPEC §12.2).
      consumedBodies.push({ basename, text });
    }
    let clusterResult;
    try {
      clusterResult = await resolveAdvisoryRung({
        _agent: agentFn,
        _log: tee,
        _state: rungState,
        prompt:
          "Cluster recurring failure modes across the consumed LEARNINGS corpus. " +
          "Reply with JSON {\"clusters\": [{phase, artifact, kind, action, symptom, diff, evidence}]}.\n\n" +
          consumedBodies.map((b) => `## ${b.basename}\n${b.text ?? "(unreadable)"}`).join("\n\n"),
      });
    } catch (err) {
      // §10.2's one caught exception — neither rung resolved (M-3).
      state.rung = rungState.resolved ? rungState.resolved.model : null;
      state.dispatchLog.push(String(err && err.message));
      state.status = "failed";
      state.reasons.add("advisory-model-unresolved");
      return await finishPass(state, seams);
    }
    state.rung = rungState.resolved ? rungState.resolved.model : null;
    if (clusterResult && clusterResult.kind === "dispatch-error") {
      // §2.6 row 4 — `failed`, NO reason code, the message in the report body.
      state.dispatchLog.push(String(clusterResult.err && clusterResult.err.message));
      state.status = "failed";
      return await finishPass(state, seams);
    }
    clusterReplyText = clusterResult ? clusterResult.raw : null;
  }

  // Step 10 — the advisory corpus (§7.7). Absent folds to `no-advisory-corpus`;
  // a present-but-entryless file to `advisory-corpus-empty` (§10.3 rows 15–16).
  const escText = await readFileFn("docs/_queue/ESCALATIONS.md");
  const escalations = parseEscalations(escText);
  if (escalations.corpusState === "absent") state.reasons.add("no-advisory-corpus");
  else if (escalations.corpusState === "empty") state.reasons.add("advisory-corpus-empty");
  state.advisory = escalations;

  // Step 11 — the effectiveness table over prior passes (§7.5). Records come from
  // both grammars the log admits: `renderFailureModeRecord`'s field lines and the
  // `<!-- pdlc:record {…} -->` JSON comment form.
  const parsedLog = parseLogRecords(logText);
  const priorRecords = [
    ...jsonCommentRecords(logText),
    ...parsedLog.records.filter((r) => typeof r.failureModeId === "string"),
  ];
  for (const notice of parsedLog.notices) {
    if (notice.subject !== undefined) state.notices.push(notice);
  }
  state.effectiveness = effectivenessTable(
    priorRecords,
    [{ passId: state.passId, consumed: consumedBodies.map((b) => b.text).filter((t) => typeof t === "string") }],
    config
  );

  // Step 12 — derive proposals from the clustering reply (§7.4) and apply NFR-4
  // suppression (§7.6). Free prose derives nothing.
  const proposals = clusterReplyText === null ? [] : deriveProposals(clusterReplyText);
  state.proposals = proposals;

  let prStates = [];
  if (typeof ghRunFn === "function") {
    const repo = config.pluginRepository ?? "unknown/unknown";
    const pollReply = await ghRunFn(mergeCommandFor("consolidationPrs", { repo }));
    if (pollReply && pollReply.ok === true) {
      try {
        const parsed = JSON.parse(pollReply.stdout);
        if (Array.isArray(parsed)) prStates = parsed;
      } catch {
        state.notices.push({ subject: "pr-poll", detail: "unparseable gh pr list reply" });
      }
    } else {
      state.notices.push({ subject: "pr-poll", detail: "duplicate poll unavailable" });
    }
  }

  const active = [];
  for (const p of proposals) {
    const pair = { failureModeId: p.failureModeId, action: p.action };
    const byLog = enactedByLog(pair, priorRecords);
    if (byLog.enacted) {
      state.reasons.add("duplicate-suppressed");
      state.suppressions.push({
        failureModeId: p.failureModeId,
        action: p.action,
        evidence: { kind: "pass", passId: byLog.passId },
      });
      continue;
    }
    const byPr = enactedByPr(pair, prStates);
    if (byPr.enacted) {
      state.reasons.add("duplicate-suppressed");
      state.suppressions.push({
        failureModeId: p.failureModeId,
        action: p.action,
        evidence: { kind: "pr", url: byPr.url },
      });
      continue;
    }
    active.push(p);
  }

  // Step 13 — route each surviving proposal (§5, §6). Every failure-mode record
  // is appended as its proposal routes (§7.9), one whole record per call.
  const enacted = [];
  const deferred = [];

  const recordFor = (p, route) => ({
    failureModeId: p.failureModeId,
    phase: p.phase,
    symptom: p.symptom,
    artifact: p.artifact,
    target: p.target,
    passId: state.passId,
    action: p.action,
    route,
  });
  const appendRecord = async (record) => {
    state.records.push(record);
    await appendFileFn(logPath, `${renderFailureModeRecord(record)}\n\n`);
  };

  const consumingProposals = [];
  const prProposals = [];
  for (const p of active) {
    const route = routeProposal(p);
    if (route === "PR") prProposals.push(p);
    else if (route === "constraints" || route === "decisions") consumingProposals.push({ p, route });
    else deferred.push({ ...p, reason: null, detail: "propose-only (AC-5.4 diversion)" });
  }

  for (const { p, route } of consumingProposals) {
    const current = await readFileFn(p.target);
    await writeFileFn(
      p.target,
      `${current ?? ""}\n<!-- pdlc:promotion ${p.failureModeId}:${p.action} (${state.passId}) -->\n${p.diff ?? p.symptom}\n`
    );
    state.writeSet.add(p.target);
    enacted.push(p);
    await appendRecord(recordFor(p, route));
  }

  if (prProposals.length > 0) {
    const degradeAll = async (reason, detail) => {
      if (reason) state.reasons.add(reason);
      for (const p of prProposals) {
        deferred.push({ ...p, reason, detail });
        await appendRecord(recordFor(p, "degraded"));
      }
    };

    const clone = await openClone(state.passId, config, { _makeTempDir: makeTempDirFn, _git: gitFn });
    if (clone.failure) {
      await degradeAll(clone.failure, clone.detail);
    } else {
      const dir = clone.dir;
      const head = `consolidation/${state.passId}`;
      await gitFn(["-C", dir, "checkout", "-b", head]);

      // Per edit: write in the clone, add, commit — one PDLC-PROMOTION-ID each
      // (§9.2). A proposal short of its diff is authored through the same
      // resolver ladder; a dispatch error there is §2.6 row 4's terminal.
      let authoringFailed = false;
      for (const p of prProposals) {
        if (p.diff === null || p.diff === undefined) {
          let authored;
          try {
            authored = await resolveAdvisoryRung({
              _agent: agentFn,
              _log: tee,
              _state: rungState,
              prompt: `Author the promotion diff for ${p.failureModeId} (${p.action}): ${p.symptom ?? ""}`,
            });
          } catch (err) {
            state.dispatchLog.push(String(err && err.message));
            state.status = "failed";
            state.reasons.add("advisory-model-unresolved");
            return await finishPass(state, seams);
          }
          if (!authored || authored.kind === "dispatch-error") {
            state.dispatchLog.push(String(authored && authored.err && authored.err.message));
            state.status = "failed";
            return await finishPass(state, seams);
          }
          p.diff = authored.raw;
        }
        if (authoringFailed) break;
        await writeFileFn(`${dir}/${p.artifact}`, p.diff);
        await gitFn(["-C", dir, "add", "--", p.artifact]);
        await gitFn(["-C", dir, "commit", "-m", renderPromotionCommitMessage(p, state.passId), "--", p.artifact]);
      }

      // §9.2 — credential resolution: at the first PR-route attempt, at most
      // once per pass. The value never becomes a JS string; only the NAME is
      // held, and only the boolean crosses the seam.
      const envOk = typeof envPresentFn === "function" ? await envPresentFn(config.credentialEnv) : null;
      if (envOk === true) {
        state.credential = "present (redacted)";
      } else if (typeof ghRunFn === "function") {
        const authReply = await ghRunFn("gh auth status");
        // The probe's reply text is never forwarded anywhere (AT-K5): only the
        // boolean outcome is read.
        state.credential = authReply && authReply.ok === true ? "local-gh" : "absent";
      } else {
        state.credential = "absent";
      }

      if (typeof ghRunFn !== "function") {
        await degradeAll("api-failure", "no PR transport available");
      } else {
        const pushArgv = ["-C", dir];
        if (state.credential === "present (redacted)") {
          // Expansion happens one process below the transport (git's own shell
          // runs the helper); the module holds only the variable's name.
          pushArgv.push(
            "-c",
            `credential.helper=!f(){ echo username=x; echo password=$${config.credentialEnv}; };f`
          );
        }
        pushArgv.push("push", "origin", head);
        const pushReply = await gitFn(pushArgv);
        if (!pushReply || pushReply.ok !== true) {
          const stderr = String((pushReply && pushReply.stderr) || "");
          await degradeAll(classifyPrFailure(stderr, state.credential), stderr || "push failed");
        } else {
          const repo = config.pluginRepository ?? "unknown/unknown";
          const bodyPath = `${dir}/.pdlc-pr-body.md`;
          await writeFileFn(bodyPath, renderPrBody(state, prProposals));
          let createCmd = mergeCommandFor("consolidationCreate", {
            repo,
            head,
            base: "main",
            title: `consolidation: ${state.passId}`,
            bodyFile: bodyPath,
          });
          if (state.credential === "present (redacted)") {
            createCmd = `GH_TOKEN="$${config.credentialEnv}" ${createCmd}`;
          }
          const createReply = await ghRunFn(createCmd);
          if (createReply && createReply.ok === true) {
            state.prUrl = typeof createReply.stdout === "string" ? createReply.stdout.trim() : null;
            for (const p of prProposals) {
              enacted.push(p);
              await appendRecord(recordFor(p, "PR"));
            }
          } else {
            const stderr = String((createReply && createReply.stderr) || "");
            await degradeAll(classifyPrFailure(stderr, state.credential), stderr || "gh pr create failed");
          }
        }
      }
    }
  }

  state.deferred = deferred;

  // §5.3 — the proposal file, written when and only when there is a cause.
  if (deferred.length > 0) {
    const proposalPath = `docs/_decisions/CONSOLIDATION-PROPOSAL-${state.passId}.md`;
    await writeFileFn(proposalPath, renderProposalFile(state, deferred));
    state.writeSet.add(proposalPath);
  }

  // Step 14's status (§10.3): promoted / promoted-degraded / no-op.
  if (enacted.length > 0) {
    state.status = deferred.length > 0 ? "promoted-degraded" : "promoted";
  } else {
    state.status = "no-op";
  }
  return await finishPass(state, seams);
}

// §10.3 rows 10–12 — a failed push/create classified by observation: a branch
// collision, an auth rejection, an explicit API failure; otherwise the resolved
// credential decides between `credential-unavailable` and `api-failure`.
function classifyPrFailure(stderr, credential) {
  if (/already exists|non-fast-forward|\[rejected\]/i.test(stderr)) return "branch-exists";
  if (/401|bad credentials|not logged in|authentication|permission denied \(publickey\)/i.test(stderr)) {
    return "credential-unavailable";
  }
  if (/HTTP 5\d\d|rate limit|timed out|ECONNREFUSED|ENOTFOUND|503|502|500/i.test(stderr)) return "api-failure";
  return credential === "absent" ? "credential-unavailable" : "api-failure";
}

// §7.2 — the terminal-row fields `cadenceDatum` reads, recovered from the log's
// own blocks: any blank-line-delimited chunk carrying `status:`/`date:` lines.
function parseTerminalRows(logText) {
  const text = typeof logText === "string" ? logText : "";
  const rows = [];
  for (const chunk of text.split(/\n\s*\n/)) {
    const fields = {};
    for (const line of chunk.split("\n")) {
      const match = /^(pass|date|status|trigger):\s*(.*)$/.exec(line.trim());
      if (match) fields[match[1]] = match[2];
    }
    if (fields.status !== undefined || fields.date !== undefined) rows.push(fields);
  }
  return rows;
}

// §7.4's second on-disk record grammar — one full FailureModeRecord as JSON
// inside an HTML comment, `<!-- pdlc:record {…} -->`. Unparseable JSON is
// skipped, never an abort (DC-01 receive side).
const RECORD_COMMENT_RE = /<!--\s*pdlc:record\s+(\{.*?\})\s*-->/g;
function jsonCommentRecords(logText) {
  const text = typeof logText === "string" ? logText : "";
  const records = [];
  RECORD_COMMENT_RE.lastIndex = 0;
  let match;
  while ((match = RECORD_COMMENT_RE.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed && typeof parsed === "object" && typeof parsed.failureModeId === "string") {
        records.push(parsed);
      }
    } catch {
      // skipped — a malformed comment contributes no record
    }
  }
  return records;
}

// §7.4 — pure over the clustering reply. The adopted wire grammar is JSON
// `{clusters: [{phase, artifact, kind, action, symptom, diff, evidence}]}`;
// free prose (or any unparseable reply) derives nothing — "no recurring
// failure mode found" is a no-promotions pass, not an error.
function deriveProposals(replyText) {
  let parsed;
  try {
    parsed = JSON.parse(replyText);
  } catch {
    return [];
  }
  if (!isPlainObjectLocal(parsed) || !Array.isArray(parsed.clusters)) return [];

  const proposals = [];
  for (const c of parsed.clusters) {
    if (!c || typeof c !== "object") continue;
    if (typeof c.phase !== "string" || typeof c.artifact !== "string") continue;
    const kind = c.kind === 1 || c.kind === 2 || c.kind === 3 ? c.kind : 3;
    const action = ACTIONS.includes(c.action) ? c.action : "promote";
    const id = failureModeId(c.phase, c.artifact);
    proposals.push({
      failureModeId: id,
      phase: c.phase,
      symptom: typeof c.symptom === "string" ? c.symptom : "",
      artifact: c.artifact,
      kind,
      target: targetFor(kind, c.artifact, id),
      action,
      diff: c.diff === undefined ? null : c.diff,
      evidence: c.evidence === undefined ? null : c.evidence,
      elidedKinds: [],
      elidedArtifacts: [],
    });
  }
  return mergeProposals(proposals);
}

/**
 * §10.1 — the single exit: every terminating branch of `main()` returns through here. Steps 14–16
 * (terminal row, §9.4 commit, marker release), each guarded exactly as the lifecycle table
 * requires: `skipped-cadence` skips all three; `refused` skips the commit; only a held marker is
 * released. Every step and every call site is awaited (T-13).
 */
async function finishPass(state, seams) {
  const { appendFileFn, gitFn, logFn, phaseFn } = seams;

  if (state.status !== "skipped-cadence") {
    // AC-3.8b — the invoking branch is named on the row via a non-mutating read.
    if (typeof gitFn === "function" && state.branch === null) {
      const branchReply = await gitFn(["rev-parse", "--abbrev-ref", "HEAD"]);
      if (branchReply && branchReply.ok === true && typeof branchReply.stdout === "string") {
        const name = branchReply.stdout.trim();
        state.branch = name.length > 0 ? name : null;
      }
    }

    // §7.9 order — effectiveness table (step 11's output, when it ran and has
    // rows), then the terminal row. One whole record per append.
    if (Array.isArray(state.effectiveness) && state.effectiveness.length > 0) {
      try {
        await appendFileFn(state.logPath, `${renderEffectivenessTable(state.effectiveness)}\n\n`);
      } catch {
        // best-effort; the table is report material, not the terminal outcome
      }
    }

    const { text } = renderTerminalRow(state);
    const extraLines = [];
    if (state.heldPassId) extraLines.push(`held: ${state.heldPassId}`);
    if (state.abandonedPassId) extraLines.push(`abandoned: ${state.abandonedPassId}`);
    try {
      await appendFileFn(state.logPath, `${text}${extraLines.length > 0 ? `\n${extraLines.join("\n")}` : ""}\n\n`);
    } catch {
      // best-effort; the log append is not this pass's terminal outcome
    }

    // Step 15 — the §5.4 commit, pathspec-scoped on both calls, never on a
    // `refused` pass (FSPEC §4.3's Commits column).
    if (state.status !== "refused" && typeof gitFn === "function") {
      const commitResult = await commitConsumingRepoPaths(
        [...state.writeSet],
        `chore(consolidation): pass ${state.passId}`,
        { _git: gitFn, _log: logFn }
      );
      if (commitResult.reason === "writes-uncommitted") {
        state.reasons.add("writes-uncommitted");
      }
    }

    // Step 16 — release, only what this pass holds.
    if (state.markerHeld) {
      await releaseMarker(state, { writeFileFn: seams.writeFileFn });
    }
  }

  const reportBody =
    renderReportBody(state) +
    (state.dispatchLog.length > 0 ? `\ndispatch log:\n${state.dispatchLog.join("\n")}` : "");
  state.body = reportBody;

  if (typeof phaseFn === "function") {
    try {
      phaseFn(state.status);
    } catch {
      // phase reporting is best-effort
    }
  }
  if (typeof logFn === "function") {
    try {
      logFn(reportBody);
    } catch {
      // logging is best-effort
    }
  }

  return {
    status: state.status,
    trigger: state.trigger,
    credential: state.credential,
    reasons: state.reasons,
    passId: state.passId,
    rung: state.rung,
    consumed: state.consumed,
    proposals: state.proposals,
    records: state.records,
    effectiveness: state.effectiveness,
    suppressions: state.suppressions,
    notices: state.notices,
    deferred: state.deferred,
    prUrl: state.prUrl,
    branch: state.branch,
    markerHeld: state.markerHeld,
    body: reportBody,
    reportBody,
  };
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
    const key = `${p.failureModeId}\0${p.action}`;
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
 * §11.3 — the report-facing `notices` derived from a `ConfigParse`: one `ParseNotice` per
 * fallen-back key (naming the key and the default it fell back to) plus one for a malformed
 * (non-object) `consolidation` section. `parseConsolidationConfig` itself carries no
 * report-shaping obligation (TSPEC §7.8), so the derivation lives beside it rather than inside
 * it — but it lives *in production*, and `main()` step 1 is its only caller, so the shape
 * AT-N1…AT-N3 read is the shape the report renders. Every notice satisfies the `ParseNotice`
 * typedef (`:251-255`), `missingField` included.
 *
 * @param {ConfigParse} parse
 * @returns {ParseNotice[]}
 */
export function configNotices(parse) {
  const p = parse || {};
  const config = p.config || CONSOLIDATION_DEFAULTS;
  const notices = (p.invalidKeys || []).map((key) => ({
    subject: `consolidation.${key}`,
    missingField: key,
    detail: `fell back to default ${JSON.stringify(config[key])}`,
  }));
  if (p.sectionMalformed) {
    notices.push({
      subject: "consolidation",
      missingField: "section",
      detail: "present but not an object",
    });
  }
  return notices;
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

/**
 * §6.4 — the row's reason codes split into the ones legal with `status` (vocabularies §1's
 * composition rule) and the ones illegal with it (dropped). Iterates `REASON_CODES` in its own
 * frozen catalogue order, never `Set` insertion order, so the split is byte-stable across runs
 * regardless of how the caller built the `reasons` set (T29, PLAN §13.3).
 *
 * @returns {{legal: ReasonCode[], dropped: ReasonCode[]}}
 */
function classifyReasons(status, reasonsSet) {
  const reasons = reasonsSet instanceof Set ? reasonsSet : new Set(reasonsSet || []);
  const legal = [];
  const dropped = [];
  for (const code of REASON_CODES) {
    if (!reasons.has(code)) continue;
    const permitted = REASON_CODE_STATUSES[code] || [];
    if (permitted.includes(status)) legal.push(code);
    else dropped.push(code);
  }
  return { legal, dropped };
}

/**
 * §10.3's `suppressed-by:` entry grammar — exactly two evidence spellings, chosen by the
 * suppression's own carrier, never by the writer: the PR URL verbatim, or `pass:{passId}`,
 * degrading to `pass:(unavailable)` when the enacting record carried no `passId`.
 *
 * @returns {string}
 */
function renderSuppressionEntry(s) {
  const entry = s || {};
  const evidence = entry.evidence || {};
  const rendered =
    evidence.kind === "pr"
      ? evidence.url
      : `pass:${typeof evidence.passId === "string" ? evidence.passId : UNAVAILABLE}`;
  return `${entry.failureModeId}:${entry.action} → ${rendered}`;
}

/** @returns {string} */
export function renderFailureModeRecord(record) {
  const r = record || {};
  return [
    `failure-mode-id: ${r.failureModeId ?? ""}`,
    `phase: ${r.phase ?? ""}`,
    `symptom: ${r.symptom ?? ""}`,
    `artifact: ${r.artifact ?? ""}`,
    `target: ${r.target ?? ""}`,
    `passId: ${r.passId ?? ""}`,
    `action: ${r.action ?? ""}`,
    `route: ${r.route ?? ""}`,
  ].join("\n");
}

/** @returns {string} */
export function renderEffectivenessTable(rows) {
  const list = Array.isArray(rows) ? rows : [];
  if (list.length === 0) return "none";
  return list
    .map((row) => {
      const artifact =
        row.artifact === null || row.artifact === undefined ? UNAVAILABLE : row.artifact;
      const parts = [`- ${row.failureModeId}`, `artifact: ${artifact}`, `verdict: ${row.verdict}`];
      if (row.state) parts.push(`state: ${row.state}`);
      if (row.remediation) parts.push(`remediation: ${row.remediation}`);
      return parts.join(", ");
    })
    .join("\n");
}

/**
 * §7.9, FSPEC §10.3 — one row, one pass. `pr:` is the sole biconditional field: rendered only
 * when this pass opened its own PR (omitted, never emptied, when it did not). Returns the codes
 * it dropped as illegal-with-this-status (§6.4) so the caller can name them rather than let the
 * loss go silent.
 *
 * @returns {{text: string, dropped: ReasonCode[]}}
 */
export function renderTerminalRow(state) {
  const s = state || {};
  const { legal, dropped } = classifyReasons(s.status, s.reasons);
  const consumed = Array.isArray(s.consumed) ? s.consumed : [];
  const suppressions = Array.isArray(s.suppressions) ? s.suppressions : [];
  const records = Array.isArray(s.records) ? s.records : [];

  const datePrefix =
    typeof s.passId === "string" ? s.passId.split("-").slice(0, -1).join("-") : "";
  const promotions = records
    .filter((r) => r && r.action === "promote")
    .map((r) => `${r.failureModeId}:${r.route}`);

  const lines = [];
  lines.push(`pass: ${s.passId ?? ""}`);
  lines.push(`date: ${datePrefix}`);
  lines.push(`status: ${s.status ?? ""}`);
  lines.push(`trigger: ${s.trigger ?? ""}`);
  lines.push(`reason: ${legal.join(", ")}`);
  lines.push(`rung: ${s.rung ?? ""}`);
  lines.push(`credential: ${s.credential ?? ""}`);
  lines.push(`consumed: ${consumed.join(", ")}`);
  lines.push(`promotions: ${promotions.length > 0 ? promotions.join(", ") : "none"}`);
  if (typeof s.prUrl === "string" && s.prUrl.length > 0) {
    lines.push(`pr: ${s.prUrl}`);
  }
  lines.push(`suppressed-by: ${suppressions.map(renderSuppressionEntry).join(", ")}`);
  lines.push(`branch: ${s.branch ?? ""}`);
  lines.push(`deferred: none`);

  return { text: lines.join("\n"), dropped };
}

/**
 * §7.9, FSPEC §10.4 — the ten items, in order, each present even when empty (DC-01). The dropped
 * reason codes are re-derived over the same `(status, reasons)` pair `renderTerminalRow` uses
 * (never threaded through a hidden channel), so the notice naming an illegal pair lives beside
 * item 1's status/reason line.
 *
 * @returns {string}
 */
export function renderReportBody(state) {
  const s = state || {};
  const { legal, dropped } = classifyReasons(s.status, s.reasons);
  const consumed = Array.isArray(s.consumed) ? s.consumed : [];
  const records = Array.isArray(s.records) ? s.records : [];
  const suppressions = Array.isArray(s.suppressions) ? s.suppressions : [];
  const effectiveness = Array.isArray(s.effectiveness) ? s.effectiveness : [];
  const notices = Array.isArray(s.notices) ? s.notices : [];

  const lines = [];

  lines.push(`1. status: ${s.status ?? ""}`);
  lines.push(`reason: ${legal.length > 0 ? legal.join(", ") : "none"}`);
  for (const code of dropped) {
    lines.push(`dropped (illegal for status ${s.status}): ${code}`);
  }

  lines.push(`2. rung: ${s.rung ?? ""}`);

  lines.push(`3. consumed: ${consumed.length > 0 ? consumed.join(", ") : "none"}`);

  if (records.length === 0) {
    lines.push(`4. promotions: none`);
  } else {
    lines.push(`4. promotions:`);
    for (const r of records) {
      lines.push(`  - ${r.failureModeId}: ${r.route} (${r.action})`);
    }
  }

  lines.push(
    `5. effectiveness: ${effectiveness.length > 0 ? renderEffectivenessTable(effectiveness) : "none"}`
  );

  if (suppressions.length === 0) {
    lines.push(`6. duplicate-suppressed: none`);
  } else {
    lines.push(`6. duplicate-suppressed:`);
    for (const sup of suppressions) {
      lines.push(`  - ${renderSuppressionEntry(sup)}`);
    }
  }

  lines.push(`7. advisory: none`);
  lines.push(`8. deferred: none`);
  lines.push(`9. branch: ${s.branch ? s.branch : "writes-uncommitted"}`);
  lines.push(`10. open promotions: ${openPromotionList(records).length}`);

  if (notices.length > 0) {
    lines.push(`notices:`);
    for (const n of notices) {
      const notice = n || {};
      const detail = notice.detail ? notice.detail : notice.missingField ? notice.missingField : "";
      lines.push(`notice: ${notice.subject}: ${detail}`);
    }
  }

  return lines.join("\n");
}

/**
 * §7.9 — produces the bytes `--body-file` reads (§9.2): one section per promotion `enacted`
 * (AC-3.2's three citations) then, last, the three vocabularies §4 trailers in the fixed order
 * pass → sources → promotions. `PDLC-CONSOLIDATION-PROMOTIONS` is derived from `enacted` itself
 * (never assembled beside it), so the trailer is set-equal to what the PR enacts by construction.
 *
 * @returns {string} the PR body file (AC-3.2, AC-3.7)
 */
export function renderPrBody(state, enacted) {
  const s = state || {};
  const items = Array.isArray(enacted) ? enacted : [];
  const consumed = Array.isArray(s.consumed) ? s.consumed : [];

  const lines = [];
  for (const item of items) {
    lines.push(`## ${item.failureModeId}:${item.action}`);
    lines.push(`source: ${consumed.join(", ")}`);
    lines.push(`failure mode: ${item.failureModeId} — ${item.symptom ?? ""}`);
    // AC-3.2(iii) — the AC-2.3 pattern evidence that cleared the bar, in
    // whichever of its two forms the clustering reply carried.
    const evidence = item.evidence;
    if (evidence && Array.isArray(evidence.recurrence)) {
      lines.push(`evidence: recurrence across ${evidence.recurrence.join(", ")}`);
    } else if (evidence && typeof evidence.standingInvariant === "string") {
      lines.push(`evidence: standing invariant — ${evidence.standingInvariant}`);
    }
    lines.push("");
  }

  const sortedConsumed = [...consumed].sort();
  const sortedPairs = items.map((i) => `${i.failureModeId}:${i.action}`).sort();

  lines.push(`PDLC-CONSOLIDATION-PASS: ${s.passId ?? ""}`);
  lines.push(`PDLC-CONSOLIDATION-SOURCES: ${sortedConsumed.join(", ")}`);
  lines.push(`PDLC-CONSOLIDATION-PROMOTIONS: ${sortedPairs.join(", ")}`);

  return lines.join("\n");
}

/**
 * §7.9 — `docs/_decisions/CONSOLIDATION-PROPOSAL-{passId}.md`. Per deferred item: the id, the
 * action, the target, the full proposed diff inline (AC-3.5 — never a summary), degrading to
 * §6.5's unavailable literal when `diff` is `null` rather than dropping the item.
 *
 * @returns {string} CONSOLIDATION-PROPOSAL-{passId}.md (AC-3.5)
 */
export function renderProposalFile(state, deferred) {
  const s = state || {};
  const items = Array.isArray(deferred) ? deferred : [];

  const lines = [`# CONSOLIDATION-PROPOSAL-${s.passId ?? ""}`];
  if (typeof s.prUrl === "string" && s.prUrl.length > 0) {
    lines.push(`pr: ${s.prUrl}`);
  }
  for (const item of items) {
    lines.push("");
    lines.push(`## ${item.failureModeId}:${item.action}`);
    lines.push(`target: ${item.target ?? ""}`);
    // The failure class recorded BY NAME (FSPEC §5.3 row 1), plus the
    // observed detail (§10.3's "the API's status text" / "the existing
    // branch … named") for a degraded PR attempt.
    if (item.reason) lines.push(`failure: ${item.reason}`);
    if (item.detail) lines.push(`detail: ${item.detail}`);
    lines.push(`diff:`);
    lines.push(item.diff === null || item.diff === undefined ? UNAVAILABLE : item.diff);
  }

  return lines.join("\n");
}

/**
 * §7.9 — one commit's subject plus the per-commit `PDLC-PROMOTION-ID: {id}:{action}` trailer of
 * vocabularies §4, so commit → proposal is readable without counting (AC-3.3).
 *
 * @returns {string} PDLC-PROMOTION-ID trailer (AC-3.3)
 */
// eslint-disable-next-line no-unused-vars
export function renderPromotionCommitMessage(proposal, passId) {
  const p = proposal || {};
  const subject = `${p.action ?? ""}: ${p.symptom ?? ""}`;
  return [subject, "", `PDLC-PROMOTION-ID: ${p.failureModeId ?? ""}:${p.action ?? ""}`].join("\n");
}

// §9.1 — the temporary clone

// E-22's observable. `git clone` reports a name that does not resolve — absent, renamed, or
// invisible to the credential in hand — with one of these phrasings on stderr; anything else the
// clone can fail with is E-23's transport/rate-limit class. Kept narrow deliberately: a phrase not
// listed here degrades to `api-failure`, which is the pre-existing behaviour, never a
// misclassification of a network blip as a missing repository.
const REPOSITORY_UNRESOLVED_RE =
  /repository not found|not found|does not exist|could not read from remote repository|access rights/i;

/**
 * §9.1 — three steps, all through seams, none touching the invoking tree's refs. `null` from
 * `_makeTempDir` degrades `api-failure` with no fallback into the invoking tree (AC-3.8). The
 * same-repo clone source is `origin`'s URL, never the working-tree path — the working tree may be
 * mid-pipeline on a `feat-*` branch, and FSPEC §6.1 requires the clone cut from the fetched
 * default branch.
 *
 * @returns {Promise<{dir: string}|{failure: ReasonCode, detail: string}>}
 */
export async function openClone(passId, config, seams) {
  const { _makeTempDir, _git } = seams || {};
  const cfg = config || {};

  const dir = await _makeTempDir(passId);
  if (typeof dir !== "string" || dir.length === 0) {
    return { failure: "api-failure", detail: "temporary directory creation failed" };
  }

  let remote;
  if (cfg.pluginRepository == null) {
    const reply = await _git(["remote", "get-url", "origin"]);
    if (!reply || reply.ok !== true) {
      return { failure: "repository-unresolved", detail: (reply && reply.stderr) || "origin did not resolve" };
    }
    remote = typeof reply.stdout === "string" ? reply.stdout.trim() : "";
  } else {
    remote = `https://github.com/${cfg.pluginRepository}.git`;
  }

  const cloneReply = await _git(["clone", "--depth", "1", "--single-branch", remote, dir]);
  if (!cloneReply || cloneReply.ok !== true) {
    const stderr = (cloneReply && cloneReply.stderr) || "clone failed";
    // E-22 vs E-23 (FSPEC:2713, :2714). A *configured* `pluginRepository` that git reports as
    // non-existent or unreadable is BR-23's "does not resolve" case: reason `repository-unresolved`
    // with the configured value verbatim (FSPEC:889), never a silent fallback to the current
    // repository. Every other clone failure — network, rate limit, transport — stays E-23's
    // `api-failure`. The discrimination is made on the clone's own stderr rather than a prior
    // probe because the clone seam has no probe verb to spend: `git ls-remote` resolves to
    // `unknown` in `resolveSeamVerb` (`:2247-2262`) and is outside the git-clone permitted set
    // (TSPEC §9.3), so probing would fail AT-Q7's containment conjunct on a conforming pass.
    if (cfg.pluginRepository != null && REPOSITORY_UNRESOLVED_RE.test(stderr)) {
      return { failure: "repository-unresolved", detail: String(cfg.pluginRepository) };
    }
    return { failure: "api-failure", detail: stderr };
  }

  return { dir };
}

// §9.3 — the three seam domains and their verb sets

/**
 * §9.3 — total, never null. Every `_ghRun` call is the PR seam. A `_git` call is `git-clone` when
 * its argv begins `["-C", cloneDir]` OR is the `clone` call itself (which carries no `-C` prefix —
 * `cloneDir` is what the call *establishes*, so it is classified by name, never by a special case
 * in test code); every other `_git` call is `git-invoking`.
 *
 * @returns {"pr"|"git-invoking"|"git-clone"}
 */
export function resolveSeamDomain(seam, argvOrCommand, cloneDir) {
  if (seam === "_ghRun") return "pr";
  const argv = Array.isArray(argvOrCommand) ? argvOrCommand : [];
  if (argv[0] === "clone") return "git-clone";
  if (typeof cloneDir === "string" && argv[0] === "-C" && argv[1] === cloneDir) return "git-clone";
  return "git-invoking";
}

// The PR-seam command-string verbs, matched by resolved operation, never by function name.
const PR_VERB_PATTERNS = [
  [/^gh\s+pr\s+list\b/, "read-pr"],
  [/^gh\s+pr\s+create\b/, "create-pr"],
  [/^gh\s+auth\s+status\b/, "read-auth"], // ⊕ widening 1, §9.3
];

/**
 * §9.3 — classification by resolved operation, not function name: `checkout -b` and `switch -c`
 * both resolve to `create-branch` in either git domain. The PR domain here recognises only the
 * three verbs this route ever emits (§9.2's PR-route table); an unrecognised PR command, or any
 * other unresolvable input, returns `"unknown"`, which is in no permitted set and therefore fails
 * containment rather than passing silently.
 *
 * @returns {string} "unknown" when unresolvable
 */
export function resolveSeamVerb(domain, argvOrCommand) {
  if (domain === "pr") {
    const command = typeof argvOrCommand === "string" ? argvOrCommand : "";
    for (const [pattern, verb] of PR_VERB_PATTERNS) {
      if (pattern.test(command)) return verb;
    }
    return "unknown";
  }

  if (domain === "git-invoking" || domain === "git-clone") {
    let argv = Array.isArray(argvOrCommand) ? argvOrCommand : [];
    if (argv[0] === "-C") argv = argv.slice(2);
    const op = argv[0];
    if (op === "clone") return "clone";
    if (op === "checkout" && argv.includes("-b")) return "create-branch";
    if (op === "switch" && argv.includes("-c")) return "create-branch";
    if (op === "add") return "add";
    if (op === "commit") return "commit";
    if (op === "push") return "push";
    if (op === "fetch") return "fetch";
    if (op === "rev-parse") return "read-branch"; // readHeadBranch, orchestrate-dev.js:3524
    if (op === "cat-file") return "read-object"; // ⊕ widening 2, §9.3
    if (op === "remote") return "read-remote"; // ⊕ widening 3, §9.3
    if (op === "ls-files") return "read-index"; // ⊕ widening 4, §9.3
    if (op === "status") return "read-status";
    return "unknown";
  }

  return "unknown";
}

// §9.4 — the consuming-repo commit

// Shares `commitQueueRow`'s idempotence treatment (orchestrate-queue.js:1554) — transcribed, not
// imported: that module does not export it.
const NOTHING_TO_COMMIT_RE = /nothing to commit/i;

// A wall-clock sleep for `gitWithLockRetry`'s retry delay. This module has no `_sleep` seam of its
// own (§5.1's protocol lists none); the retry path is exercised only on a transient `index.lock`
// refusal, which no test in this pass's suite drives, so a real timer here costs nothing under
// jest's fake-free doubles (they resolve before any retry is ever attempted).
async function realSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * §9.4, FSPEC §5.4 — two calls, pathspec on both, mirroring `commitQueueRow`
 * (`orchestrate-queue.js:1576-1595`; add then commit, both pathspec-scoped) over the imported
 * `gitWithLockRetry` for the `index.lock` retry class — never `commitPaths`
 * (`orchestrate-dev.js:8669`), whose commit carries no pathspec and would sweep a mid-pipeline
 * staged index into this pass's commit. Never `-a`, never pushed. A "nothing to commit" result is
 * a return, not a warning; any other refusal records `writes-uncommitted` and leaves the writes
 * correct on disk.
 *
 * @returns {Promise<{committed: boolean, reason?: "writes-uncommitted"}>}
 */
export async function commitConsumingRepoPaths(paths, message, seams) {
  const list = Array.isArray(paths) ? paths : [];
  const gitFn = seams && seams._git;
  const emit = seams && typeof seams._log === "function" ? seams._log : () => {};

  const added = await gitWithLockRetry(["add", "--", ...list], {
    _git: gitFn,
    _sleep: realSleep,
    emit,
    label: "consolidate: git add",
  });
  if (!added || added.ok !== true) {
    return { committed: false, reason: "writes-uncommitted" };
  }

  const committed = await gitWithLockRetry(["commit", "-m", message, "--", ...list], {
    _git: gitFn,
    _sleep: realSleep,
    emit,
    label: "consolidate: git commit",
  });
  if (committed && committed.ok === true) return { committed: true };

  if (
    NOTHING_TO_COMMIT_RE.test((committed && committed.stdout) ?? "") ||
    NOTHING_TO_COMMIT_RE.test((committed && committed.stderr) ?? "")
  ) {
    return { committed: false };
  }

  return { committed: false, reason: "writes-uncommitted" };
}
