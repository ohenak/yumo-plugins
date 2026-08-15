/**
 * orchestrate-dev.js — Full PDLC pipeline orchestrator
 *
 * Canonical plugin source: pdlc/workflows/orchestrate-dev.js
 * Built artifact:          pdlc/workflows/dist/orchestrate-dev.bundle.js
 * Consumer runtime copy:   installed from dist/ by pdlc/hooks/scripts/sync-workflows.sh
 *
 * Concurrent-agent ceiling analysis (REQ-NFR-01):
 * max fan-out is 5 se-implement agents per batch (Phase I) + 2 reviewers per reviewLoop
 * iteration = 7 concurrent max. Well under the 16-agent runtime ceiling.
 *
 * // check-scope-field fires PostToolUse:Write|Edit on all workflow agent writes;
 * // nudge-consolidation fires on the top-level SessionStart only — not inside agent sub-sessions.
 */

import * as fs from "fs";
import { dirname } from "path";

// TSPEC-HARVEST-01: compile-time flag
const PHASE_H_ENABLED = true; // Set to false until feature-branch-consistency fix lands

// DOD-01: compile-time flag for Definition of Done verification (Phase DOD)
const PHASE_DOD_ENABLED = true; // Set to false to skip DoD verification gate

// DOD-02: maximum remediation iterations before halt
const DOD_MAX_ITERATIONS = 3;

// TSPEC-SHIP-01: compile-time flag for the PR-raise / CI-verify phase (Phase PUB)
const PHASE_PUB_ENABLED = true; // Set to false to skip auto-PR + CI verification

// TSPEC-SHIP-02: CI poll timing (milliseconds). All overridable via main() injection.
// Checks usually register within ~5 min; if none appear within the no-checks window
// we conclude the repo has no PR checks configured and treat the phase as a pass.
const CI_NO_CHECKS_TIMEOUT_MS = 10 * 60 * 1000; // 10 min — no checks ⇒ assume none configured
const CI_POLL_INTERVAL_MS = 30 * 1000; // 30 s between status polls
const CI_COMPLETION_TIMEOUT_MS = 30 * 60 * 1000; // 30 min — overall cap once checks are running

// TSPEC §2.2: compile-time flag for the merge phase (Phase MERGE), the last phase
// of the pipeline. Same shape as PHASE_DOD_ENABLED above.
const PHASE_MERGE_ENABLED = true; // Set to false to skip Phase MERGE

// TSPEC §3 — where the per-repo `merge` config section lives, read once per
// phaseMerge invocation (§3.3). Same convention as the drift-state path.
export const MERGE_CONFIG_PATH = ".claude/pdlc.config.json";

// TSPEC §2.2 — Phase MERGE's closed catalogues and defaults (DC-01). Frozen so
// no code path can mutate a shipped default or widen a closed set silently.
export const MERGE_GUARD_DEFAULTS = Object.freeze([
  "pdlc/workflows/",
  "pdlc/skills/",
  "pdlc/hooks/",
  ".claude/workflows/",
]);

export const MERGE_MODES = Object.freeze(["off", "gated", "on"]);
export const MERGE_STATUSES = Object.freeze(["merged", "deferred", "refused", "skipped"]);

// `mergeableRetryDelay` is in SECONDS (TSPEC §2.2 note; REQ §7 / FSPEC §10.1 key
// name) — the unit is documented here rather than encoded into the key name.
export const MERGE_DEFAULTS = Object.freeze({
  mergeMode: "off",
  mergeRequiresCi: true,
  allowSquashMerge: false,
  deleteBranchOnPdlcMerge: true,
  mergeableRetries: 3,
  mergeableRetryDelay: 10,
  guardPaths: [],
});

const MERGE_FILES_PAGE_LIMIT = 100; // TSPEC §4.6 — GitHub's `files` page size
const MERGE_THREAD_PAGE_LIMIT = 100; // TSPEC §4.4
const MERGE_MAX_THREAD_PAGES = 10; // TSPEC §4.4 — bounded, fail-closed

// TSPEC §3.1 — the accepted upper bound on `mergeableRetries`; a config value
// above it is out of domain and takes the default (TE F-02).
export const MERGE_MAX_RETRIES = 10;

// TSPEC §5.2 — a COMPUTED EXPRESSION, not a literal: raising MERGE_MAX_RETRIES
// re-derives the decision-step bound automatically (TE N-04). Term-by-term:
// 1 (O1 count is 1+retries, so this is the "+1" over MERGE_MAX_RETRIES) +
// MERGE_MAX_RETRIES (additional O1 re-observations) + 4 (O2, O3, O4, O5, each
// demanded at most once) + 3 (the longest merge-candidate chain) + 1 (the
// resolving step) + 5 (slack).
export const MERGE_MAX_DECISION_STEPS = 1 + MERGE_MAX_RETRIES + 4 + 3 + 1 + 5;

// ─── TSPEC §3 — Phase MERGE: configuration reader (O-M5) ──────────────────────

/**
 * Parse the repo's `merge` config section. Pure and total: never throws, never
 * reads anything. TSPEC §3.1's four steps:
 *   1. `text` is `null`/unparseable JSON → defaults, section not malformed (an
 *      absent or unparseable FILE is not a malformed SECTION).
 *   2. Parsed value isn't a plain object, or `merge` is absent → defaults, not
 *      malformed.
 *   3. `merge` present but not a plain object → defaults, `sectionMalformed: true`.
 *   4. Otherwise every key is validated and falls back INDEPENDENTLY (FSPEC
 *      §10.3) — one bad key defaults only itself.
 *
 * @param {string|null} text - raw file contents, or null (file absent/unreadable)
 * @returns {{ config: object, sectionMalformed: boolean }}
 */
export function parseMergeConfig(text) {
  let parsed;
  if (text == null) {
    return { config: MERGE_DEFAULTS, sectionMalformed: false };
  }
  try {
    parsed = JSON.parse(text);
  } catch {
    return { config: MERGE_DEFAULTS, sectionMalformed: false };
  }

  if (!isPlainObject(parsed) || !("merge" in parsed)) {
    return { config: MERGE_DEFAULTS, sectionMalformed: false };
  }

  const section = parsed.merge;
  if (!isPlainObject(section)) {
    return { config: MERGE_DEFAULTS, sectionMalformed: true };
  }

  const config = {
    mergeMode: MERGE_MODES.includes(section.mergeMode)
      ? section.mergeMode
      : MERGE_DEFAULTS.mergeMode,
    mergeRequiresCi:
      typeof section.mergeRequiresCi === "boolean"
        ? section.mergeRequiresCi
        : MERGE_DEFAULTS.mergeRequiresCi,
    allowSquashMerge:
      typeof section.allowSquashMerge === "boolean"
        ? section.allowSquashMerge
        : MERGE_DEFAULTS.allowSquashMerge,
    deleteBranchOnPdlcMerge:
      typeof section.deleteBranchOnPdlcMerge === "boolean"
        ? section.deleteBranchOnPdlcMerge
        : MERGE_DEFAULTS.deleteBranchOnPdlcMerge,
    mergeableRetries: isValidRetryCount(section.mergeableRetries)
      ? section.mergeableRetries
      : MERGE_DEFAULTS.mergeableRetries,
    mergeableRetryDelay: isValidRetryDelay(section.mergeableRetryDelay)
      ? section.mergeableRetryDelay
      : MERGE_DEFAULTS.mergeableRetryDelay,
    guardPaths: Array.isArray(section.guardPaths)
      ? section.guardPaths.filter(
          (p) => typeof p === "string" && p.length > 0,
        )
      : MERGE_DEFAULTS.guardPaths,
  };

  return { config, sectionMalformed: false };
}

// ─── PROPOSAL §3.3 / M-6 — the `implementation` config section ────────────────
//
// Phase I's script-owned gate is the one place the pipeline stops believing an
// agent's self-reported green (M-6). It needs to know WHICH command constitutes
// "the suite" in this repo, which is per-repo knowledge the script cannot guess —
// so `testCommand` has NO default. Its absence is not an error: it degrades the
// wave gate to the legacy self-report scan, announced once per run.
//
// `startWave` is the resume pointer: after a wave-gate halt, an operator sets it
// so the re-invocation does not re-dispatch agents over waves whose work is
// already committed. Default 1 — every fresh run starts at the first wave.
export const IMPLEMENTATION_DEFAULTS = Object.freeze({
  testCommand: null,
  postWaveCommand: null,
  postWavePathspecs: Object.freeze([]),
  startWave: 1,
});

/**
 * Parse the repo's `implementation` config section out of the SAME
 * `.claude/pdlc.config.json` `parseMergeConfig` reads. Pure and total: never
 * throws, never reads anything, and every key falls back INDEPENDENTLY — the
 * merge section's contract, verbatim, for the same reason (one bad key must not
 * silently retune the other two).
 *
 * The one addition over `parseMergeConfig`'s return shape is `invalidKeys`: a
 * merge key that degrades is a policy value the operator can see in the decision
 * ladder, whereas an `implementation` key that degrades changes whether the gate
 * runs at all. The caller emits a notice naming each degraded key.
 *
 * @param {string|null} text - raw file contents, or null (file absent/unreadable)
 * @returns {{ config: object, sectionMalformed: boolean, invalidKeys: string[] }}
 */
export function parseImplementationConfig(text) {
  const degraded = (sectionMalformed) => ({
    config: IMPLEMENTATION_DEFAULTS,
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

  if (!isPlainObject(parsed) || !("implementation" in parsed)) return degraded(false);

  const section = parsed.implementation;
  if (!isPlainObject(section)) return degraded(true);

  const invalidKeys = [];

  const nonEmptyString = (key) => {
    if (!(key in section)) return IMPLEMENTATION_DEFAULTS[key];
    const v = section[key];
    if (typeof v === "string" && v.trim() !== "") return v;
    invalidKeys.push(key);
    return IMPLEMENTATION_DEFAULTS[key];
  };

  let postWavePathspecs = IMPLEMENTATION_DEFAULTS.postWavePathspecs;
  if ("postWavePathspecs" in section) {
    const v = section.postWavePathspecs;
    if (Array.isArray(v) && v.every((p) => typeof p === "string" && p.trim() !== "")) {
      postWavePathspecs = v;
    } else {
      invalidKeys.push("postWavePathspecs");
    }
  }

  // A resume pointer is a wave NUMBER: 1-indexed, integral. Anything else (0, a
  // negative, a fraction, a numeric string, null) falls back to 1 — starting
  // from the first wave is the only safe reading of an unreadable pointer.
  let startWave = IMPLEMENTATION_DEFAULTS.startWave;
  if ("startWave" in section) {
    const v = section.startWave;
    if (Number.isInteger(v) && v >= 1) {
      startWave = v;
    } else {
      invalidKeys.push("startWave");
    }
  }

  return {
    config: {
      testCommand: nonEmptyString("testCommand"),
      postWaveCommand: nonEmptyString("postWaveCommand"),
      postWavePathspecs,
      startWave,
    },
    sectionMalformed: false,
    invalidKeys,
  };
}

function isPlainObject(v) {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v)
  );
}

function isValidRetryCount(v) {
  return Number.isInteger(v) && v >= 0 && v <= MERGE_MAX_RETRIES;
}

function isValidRetryDelay(v) {
  return Number.isInteger(v) && v >= 0;
}

/**
 * Read the merge config file, never throwing. Byte-for-byte the shape of
 * `readDriftStateSafely` (orchestrate-queue.js) and adopted for the same
 * reason: the injected read is agent-mediated in production and returns
 * `null` for a missing file rather than throwing — but a throw from some
 * future read implementation must not abort the pipeline. AWAITED at its one
 * call site (phaseMerge, TSPEC §3.3).
 *
 * @param {function} readFileFn - async (path) => string|null (or throws)
 * @param {string} path - MERGE_CONFIG_PATH
 * @returns {Promise<string|null>}
 */
export async function readMergeConfigSafely(readFileFn, path) {
  try {
    return await readFileFn(path);
  } catch {
    return null;
  }
}

// ─── TSPEC §4 — Phase MERGE: observation points, pure classifiers (O-M2) ───
//
// PLAN §12 A2. The PURE half of the six observation points (§4.1–§4.7):
// `mergeCommandFor` — the single place every literal `gh` command string is
// built (TSPEC §2.3/§4.1) — `parsePrRef`, and the six `classify*` functions.
// Every classifier is total and shares one fail-closed shape, DC-11:
// `{ ok: true, ... } | { ok: false, reason }`, `reason` drawn from the one
// shared, frozen `OBSERVATION_REASONS` catalogue (DC-01). None of these
// functions perform IO — the `raw` string(s) they read are handed in by
// A5's `observe*` wrappers, which own the `_ghRun` transport seam.

// The closed reason catalogue every classify* function draws from (DC-01).
// `not-confirmed` is `classifyMergeResult`'s own addition (TSPEC §4.7); §7
// records that A6 extends this catalogue's *usage*, not its membership —
// the value already needs to exist here for `classifyMergeResult` (an
// A2-owned function) to be correct on its own.
export const OBSERVATION_REASONS = Object.freeze([
  "command-failed",
  "unparseable",
  "field-absent",
  "unrecognised-value",
  "incomplete",
  "not-confirmed",
]);

const PR_STATE_VALUES = ["OPEN", "CLOSED", "MERGED"];
const MERGEABLE_VALUES = ["MERGEABLE", "CONFLICTING", "UNKNOWN"];
const MERGE_STATE_STATUS_VALUES = [
  "CLEAN",
  "UNSTABLE",
  "BEHIND",
  "BLOCKED",
  "DIRTY",
  "DRAFT",
  "HAS_HOOKS",
  "UNKNOWN",
];
const UNRECOGNISED_SENTINEL = "__unrecognised__";

/**
 * `--repo {slug}`, or nothing at all. `consolidation.pluginRepository` ships as `null`, whose
 * contract (REQ:575, FSPEC:1990) is **the current repository** — and `gh` targets the current
 * repository precisely when `--repo` is ABSENT. Substituting any slug for the null case (a
 * placeholder, the string "null") would point the NFR-4 duplicate poll and the AC-3.1 PR
 * creation at a repository that need not exist, so the null arm omits the flag rather than
 * filling it. The same-repo case is thus honoured identically here and in `openClone`, which
 * clones `origin` on exactly this condition.
 *
 * @param {string|null|undefined} repo
 * @returns {string} `" --repo {repo}"`, or `""`
 */
function repoFlag(repo) {
  return repo == null ? "" : ` --repo ${repo}`;
}

/**
 * `mergeCommandFor` — TSPEC §4.1/§9.2: the SOLE place every `gh` command string
 * used by Phase MERGE **and** the consolidation pass's PR route is built, so a
 * single audit of this function's body accounts for every literal command
 * either surface can run. Widened by TSPEC §9.2 rather than a second builder
 * being written, to keep that audit property repo-wide.
 *
 * @param {string} surface - one of prState, ci, repoCaps, changedFiles,
 *   changedFilesFallback, merge, mergeReadback, reviewThreads,
 *   consolidationPrs, consolidationCreate
 * @param {object} params - surface-specific parameters (see call sites)
 * @returns {string}
 */
export function mergeCommandFor(surface, params = {}) {
  switch (surface) {
    case "prState":
      return `gh pr view ${params.prUrl} --json state,mergeable,mergeStateStatus,number,mergeCommit`;
    case "ci":
      return `gh pr view ${params.prUrl} --json statusCheckRollup`;
    case "repoCaps":
      return "gh repo view --json rebaseMergeAllowed,mergeCommitAllowed,squashMergeAllowed,deleteBranchOnMerge,defaultBranchRef";
    case "changedFiles":
      return `gh pr view ${params.prUrl} --json files`;
    case "changedFilesFallback":
      return `gh api --paginate --slurp repos/${params.owner}/${params.repo}/pulls/${params.number}/files`;
    case "merge":
      return `gh pr merge ${params.prUrl} --${params.method}`;
    case "mergeReadback":
      return `gh pr view ${params.prUrl} --json mergeCommit,state`;
    case "reviewThreads": {
      const { owner, repo, number, cursor } = params;
      const query =
        "\n" +
        "query($owner:String!,$repo:String!,$number:Int!,$cursor:String){\n" +
        "  repository(owner:$owner,name:$repo){ pullRequest(number:$number){\n" +
        `    reviewThreads(first:${MERGE_THREAD_PAGE_LIMIT}, after:$cursor){\n` +
        "      pageInfo{ hasNextPage endCursor } nodes{ isResolved } } } } }";
      let cmd = `gh api graphql -f owner=${owner} -f repo=${repo} -F number=${number} -f query='${query}'`;
      if (cursor !== undefined && cursor !== null) {
        cmd += ` -f cursor=${cursor}`;
      }
      return cmd;
    }
    case "consolidationPrs":
      // §9.2's duplicate poll: one call supplies §7.6's prStates. `--state all` with a
      // `--json state` field is what lets §7.6 apply the FSPEC state table with one call.
      return `gh pr list${repoFlag(params.repo)} --state all --limit 100 --search "PDLC-CONSOLIDATION-PASS in:body" --json url,state,body`;
    case "consolidationCreate":
      // `--body-file` rather than `--body` is deliberate and load-bearing for NFR-2/§7.4: the
      // body is written to a file in the clone, so no part of it is ever an argv element in a
      // command string the adapter logs on failure.
      return `gh pr create${repoFlag(params.repo)} --head ${params.head} --base ${params.base} --title ${params.title} --body-file ${params.bodyFile}`;
    default:
      throw new Error(`mergeCommandFor: unrecognised surface "${surface}"`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// The consolidation log's record readers (FSPEC §8.1, §8.4) — shared, not copied
// ═══════════════════════════════════════════════════════════════════════════
//
// These live HERE, not in `consolidate-learnings.js`, because both sides of §8.4's hand-off need
// the identical arithmetic: the consolidation pass writes the records, and Phase H's harvest
// dispatch reads them back to hand the harvest agent the open-promotion list.
// `consolidate-learnings.js` imports these; the reverse direction is impossible (it already
// imports from this module, and the build inlines this module into its bundle). One
// implementation is the point — two would let the list the pass reports and the list the harvest
// is asked about disagree silently, which is precisely the failure §8.4 exists to prevent.

/** The tracked file both sides read (FSPEC §5.4). */
export const CONSOLIDATION_LOG_PATH = "docs/_decisions/.consolidation-log.md";

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

/** @returns {{records: object[], notices: object[]}} */
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

// FSPEC §7.4's second on-disk record grammar — one full FailureModeRecord as JSON inside an HTML
// comment, `<!-- pdlc:record {…} -->`. Unparseable JSON is skipped, never an abort (DC-01 receive
// side).
const RECORD_COMMENT_RE = /<!--\s*pdlc:record\s+(\{.*?\})\s*-->/g;

/** @returns {object[]} */
export function jsonCommentRecords(logText) {
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

/**
 * Every record the log carries, in both admitted grammars. A record short of `failure-mode-id`
 * contributes nothing (FSPEC §8.4 step 1: "a list of ids takes none from a record that carries
 * none") — its parse notice is the pass's report, not this reader's business.
 *
 * @returns {object[]}
 */
export function consolidationLogRecords(logText) {
  return [
    ...jsonCommentRecords(logText),
    ...parseLogRecords(logText).records.filter((r) => typeof r.failureModeId === "string"),
  ];
}

/**
 * FSPEC §7.5/§8.4 step 1 — the ids for which no record carries a landed (non-`degraded`) retire.
 * A record short of `action` or `route` cannot close an id (it stays open); a record short of
 * `failureModeId` contributes no member at all.
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
 * FSPEC §8.4 step 1, in the shape the harvest prompt is handed: one entry per OPEN id, carrying
 * the three fields step 2's question is asked on (`symptom`, `artifact` — the subject the mode was
 * observed on, never the `target` the promotion wrote — and `phase`). Where several records share
 * an id, the LAST one wins: the log is append-only, so the last record is the promotion's most
 * recent recorded state. A field no record supplies is omitted rather than guessed; the skill
 * states the missing half as unavailable.
 *
 * @param {*} logText - the raw `.consolidation-log.md` text, or anything at all
 * @returns {{failureModeId: string, phase?: string, symptom?: string, artifact?: string}[]}
 */
export function openPromotionsFromLog(logText) {
  const records = consolidationLogRecords(logText);
  const open = new Set(openPromotionList(records));
  const byId = new Map();
  for (const r of records) {
    if (!open.has(r.failureModeId)) continue;
    const entry = byId.get(r.failureModeId) || { failureModeId: r.failureModeId };
    for (const field of ["phase", "symptom", "artifact"]) {
      if (typeof r[field] === "string" && r[field].length > 0) entry[field] = r[field];
    }
    byId.set(r.failureModeId, entry);
  }
  return [...byId.values()];
}

/**
 * The list as the harvest prompt carries it. Explicitly empty rather than absent when there is
 * nothing open: the harvest SKILL's §5 convention is conditioned on having been handed a list, so
 * an omitted section and an empty one must not read the same.
 *
 * @returns {string}
 */
export function renderOpenPromotionList(entries) {
  const list = Array.isArray(entries) ? entries : [];
  if (list.length === 0) return "(none — no open promotions are recorded)";
  return list
    .map((e) => {
      const phase = e.phase ? e.phase : UNAVAILABLE_FIELD;
      const artifact = e.artifact ? e.artifact : UNAVAILABLE_FIELD;
      const symptom = e.symptom ? e.symptom : UNAVAILABLE_FIELD;
      return `  - failure-mode-id: ${e.failureModeId} | phase: ${phase} | artifact: ${artifact} | symptom: ${symptom}`;
    })
    .join("\n");
}

// The one spelling of a field the log did not carry — never a blank, never a guess (FSPEC §6.5).
const UNAVAILABLE_FIELD = "unavailable";

/**
 * `parsePrRef` — TSPEC §4.4: pure parse of a PR URL into
 * `{ owner, repo, number }`, or `null` for anything malformed. Tolerates
 * trailing path segments and query strings; the host is never validated
 * (GitHub Enterprise, etc.).
 *
 * @param {*} input
 * @returns {{owner: string, repo: string, number: number}|null}
 */
export function parsePrRef(input) {
  if (typeof input !== "string") return null;
  const match = input.match(/^https?:\/\/[^/]+\/([^/]+)\/([^/]+)\/pull\/(\d+)(?:[/?].*)?$/);
  if (!match) return null;
  const number = parseInt(match[3], 10);
  if (!Number.isInteger(number) || number <= 0) return null;
  return { owner: match[1], repo: match[2], number };
}

/**
 * `classifyPrState` — O1 (TSPEC §4.2). Whole-observation failure only for
 * `state`; `mergeable` and `mergeStateStatus` each fail closed to a
 * per-field sentinel instead, since the decision function can act on
 * "unrecognised" without the whole observation being unusable.
 *
 * @param {string|null} raw
 * @returns {{ok: true, state, mergeable, mergeStateStatus, number, mergeCommitOid}|{ok: false, reason}}
 */
export function classifyPrState(raw) {
  if (raw === null) return { ok: false, reason: "command-failed" };
  let obj;
  try {
    obj = JSON.parse(raw);
  } catch {
    return { ok: false, reason: "unparseable" };
  }
  if (obj?.state === undefined) return { ok: false, reason: "field-absent" };
  if (!PR_STATE_VALUES.includes(obj.state)) return { ok: false, reason: "unrecognised-value" };

  const mergeable = MERGEABLE_VALUES.includes(obj.mergeable) ? obj.mergeable : UNRECOGNISED_SENTINEL;
  const mergeStateStatus = MERGE_STATE_STATUS_VALUES.includes(obj.mergeStateStatus)
    ? obj.mergeStateStatus
    : UNRECOGNISED_SENTINEL;
  const number = Number.isInteger(obj.number) && obj.number > 0 ? obj.number : null;
  const mergeCommitOid =
    obj.mergeCommit && typeof obj.mergeCommit.oid === "string" ? obj.mergeCommit.oid : null;

  return { ok: true, state: obj.state, mergeable, mergeStateStatus, number, mergeCommitOid };
}

/**
 * `classifyReviewThreads` — O3 (TSPEC §4.4), one GraphQL page at a time.
 * Cross-page aggregation and cursor advancement are A5's `observeReviewThreads`.
 *
 * @param {string|null} raw
 * @returns {{ok: true, hasNextPage: boolean, endCursor: string|null, unresolved: number}|{ok: false, reason}}
 */
export function classifyReviewThreads(raw) {
  if (raw === null) return { ok: false, reason: "command-failed" };
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: "unparseable" };
  }
  const rt = parsed?.data?.repository?.pullRequest?.reviewThreads;
  if (!rt || typeof rt !== "object") return { ok: false, reason: "field-absent" };
  const { nodes, pageInfo } = rt;
  if (!Array.isArray(nodes) || !pageInfo || typeof pageInfo !== "object") {
    return { ok: false, reason: "field-absent" };
  }
  if (typeof pageInfo.hasNextPage !== "boolean") return { ok: false, reason: "field-absent" };

  let unresolved = 0;
  for (const node of nodes) {
    if (typeof node?.isResolved !== "boolean") return { ok: false, reason: "unrecognised-value" };
    if (!node.isResolved) unresolved += 1;
  }
  return {
    ok: true,
    hasNextPage: pageInfo.hasNextPage,
    endCursor: pageInfo.endCursor ?? null,
    unresolved,
  };
}

/**
 * `classifyRepoCaps` — O4 (TSPEC §4.5). Every capability flag and the
 * default branch name are required; any absent or wrongly-typed field
 * fails the whole observation closed.
 *
 * @param {string|null} raw
 * @returns {{ok: true, rebase, mergeCommit, squash, deleteBranchOnMerge, defaultBranch}|{ok: false, reason}}
 */
export function classifyRepoCaps(raw) {
  if (raw === null) return { ok: false, reason: "command-failed" };
  let obj;
  try {
    obj = JSON.parse(raw);
  } catch {
    return { ok: false, reason: "unparseable" };
  }

  const boolFields = [
    "rebaseMergeAllowed",
    "mergeCommitAllowed",
    "squashMergeAllowed",
    "deleteBranchOnMerge",
  ];
  for (const field of boolFields) {
    if (!obj || !(field in obj)) return { ok: false, reason: "field-absent" };
    if (typeof obj[field] !== "boolean") return { ok: false, reason: "unrecognised-value" };
  }
  if (!obj.defaultBranchRef || typeof obj.defaultBranchRef !== "object") {
    return { ok: false, reason: "field-absent" };
  }
  if (typeof obj.defaultBranchRef.name !== "string" || obj.defaultBranchRef.name.length === 0) {
    return { ok: false, reason: "field-absent" };
  }

  return {
    ok: true,
    rebase: obj.rebaseMergeAllowed,
    mergeCommit: obj.mergeCommitAllowed,
    squash: obj.squashMergeAllowed,
    deleteBranchOnMerge: obj.deleteBranchOnMerge,
    defaultBranch: obj.defaultBranchRef.name,
  };
}

/**
 * `classifyChangedFiles` — O5 (TSPEC §4.6). Step 1 (`gh pr view --json
 * files`) is complete on its own whenever it returns fewer than
 * `pageLimit` well-formed entries — GitHub's own page size is the only
 * signal that step 1 might be truncated. A well-formed-but-full step 1, or
 * a step 1 that came back some other, non-array shape, escalates to the
 * step 2 fallback (`gh api --paginate --slurp .../files`); a step 1 whose
 * entries are individually malformed fails closed immediately, without
 * ever trying the fallback.
 *
 * @param {string|null} primaryRaw
 * @param {string|null} fallbackRaw
 * @param {{pageLimit?: number}} [opts]
 * @returns {{ok: true, files: string[]}|{ok: false, reason}}
 */
export function classifyChangedFiles(primaryRaw, fallbackRaw, opts = {}) {
  const pageLimit = opts.pageLimit ?? MERGE_FILES_PAGE_LIMIT;

  if (primaryRaw !== null) {
    let obj;
    try {
      obj = JSON.parse(primaryRaw);
    } catch {
      return { ok: false, reason: "unparseable" };
    }
    const arr = obj?.files;
    if (Array.isArray(arr)) {
      const paths = [];
      for (const entry of arr) {
        if (!entry || typeof entry.path !== "string") {
          return { ok: false, reason: "unparseable" };
        }
        paths.push(entry.path);
      }
      if (paths.length < pageLimit) {
        return { ok: true, files: paths };
      }
      // Full page: possibly incomplete, fall through to the fallback below.
    }
    // A non-array `files` shape is treated the same way: not a hard
    // failure, just a signal that the fallback is needed.
  }

  if (fallbackRaw === null) return { ok: false, reason: "incomplete" };
  let pages;
  try {
    pages = JSON.parse(fallbackRaw);
  } catch {
    return { ok: false, reason: "incomplete" };
  }
  if (!Array.isArray(pages)) return { ok: false, reason: "incomplete" };

  const files = [];
  for (const page of pages) {
    if (!Array.isArray(page)) return { ok: false, reason: "incomplete" };
    for (const entry of page) {
      if (!entry || typeof entry.filename !== "string") {
        return { ok: false, reason: "incomplete" };
      }
      files.push(entry.filename);
      if (typeof entry.previous_filename === "string") {
        files.push(entry.previous_filename);
      }
    }
  }
  return { ok: true, files };
}

/**
 * `classifyMergeResult` — O6 (TSPEC §4.7). `gh pr merge` exiting zero is not
 * itself confirmation; the read-back (`gh pr view --json mergeCommit,state`)
 * must independently show `state: "MERGED"` with a string commit oid, or the
 * result is `not-confirmed` (TSPEC §7) rather than assumed successful.
 *
 * @param {string|null} mergeRaw - the merge command's own stdout, or null if it didn't run
 * @param {string|null} readbackRaw - the read-back command's stdout, or null if it didn't run
 * @returns {{ok: true, oid: string}|{ok: false, reason}}
 */
export function classifyMergeResult(mergeRaw, readbackRaw) {
  if (mergeRaw === null) return { ok: false, reason: "command-failed" };
  if (readbackRaw === null) return { ok: false, reason: "command-failed" };
  let obj;
  try {
    obj = JSON.parse(readbackRaw);
  } catch {
    return { ok: false, reason: "unparseable" };
  }
  if (obj?.state === "MERGED" && obj?.mergeCommit && typeof obj.mergeCommit.oid === "string") {
    return { ok: true, oid: obj.mergeCommit.oid };
  }
  return { ok: false, reason: "not-confirmed" };
}

// ─── TSPEC §4.1 — the `_ghRun` transport seam's Node default ──────────────
//
// PLAN §12 A5. Mirrors `defaultGit`'s exact three-field contract and its
// exact `catch` shape (`err.stderr || err.message`), never throws. `gh`
// commands are single shell strings (unlike `git`'s argv array), so this
// uses `execSync`, matching `checkPrCi`'s existing default exactly.
export async function defaultGhRun(command, { execFn } = {}) {
  const { execSync: realExecSync } = await import("child_process");
  const exec = execFn ?? ((cmd, opts) => realExecSync(cmd, opts));

  try {
    const stdout = exec(command, { stdio: "pipe", encoding: "utf8" });
    return { ok: true, stdout: String(stdout ?? ""), stderr: "" };
  } catch (err) {
    return {
      ok: false,
      stdout: "",
      stderr: String((err && (err.stderr || err.message)) ?? ""),
    };
  }
}

/**
 * `observePrState` — O1 (TSPEC §4.2). One `_ghRun` call, classified by
 * `classifyPrState`. Re-observation on `mergeable: UNKNOWN` is the caller's
 * (`decideMerge`/`phaseMerge`) responsibility, counted via `o1Count` — this
 * function itself is stateless.
 */
export async function observePrState(prUrl, { _ghRun }) {
  const r = await _ghRun(mergeCommandFor("prState", { prUrl }));
  const raw = r && r.ok === true ? r.stdout : null;
  return classifyPrState(raw);
}

/**
 * `observeCi` — O2 (TSPEC §4.4). Reuses `checkPrCi` verbatim rather than
 * re-deriving CI classification: the raw rollup text is handed through via
 * an injected `execFn`, so `checkPrCi`'s own parsing/aggregation is never
 * duplicated. `defaultGhRun`'s failure contract always yields `stdout: ""`
 * (never `null`), which naturally fails `checkPrCi`'s internal `JSON.parse`
 * and yields `"unknown"` — no separate error branch is needed here.
 */
export async function observeCi(prUrl, { _ghRun, _checkCi = checkPrCi }) {
  const r = await _ghRun(mergeCommandFor("ci", { prUrl }));
  const raw = r && r.ok === true ? r.stdout : "";
  return _checkCi(prUrl, { execFn: () => raw });
}

/**
 * `observeReviewThreads` — O3 (TSPEC §4.4). Bounded cursor pagination over
 * `classifyReviewThreads`, aggregating `unresolved` across pages. Exceeding
 * `MERGE_MAX_THREAD_PAGES` fails closed as `incomplete` rather than looping
 * forever or guessing partial state.
 */
export async function observeReviewThreads(ref, { _ghRun }) {
  if (!ref) return { ok: false, reason: "unparseable" };

  let cursor;
  let unresolved = 0;
  for (let page = 0; page < MERGE_MAX_THREAD_PAGES; page++) {
    const r = await _ghRun(
      mergeCommandFor("reviewThreads", { owner: ref.owner, repo: ref.repo, number: ref.number, cursor }),
    );
    const raw = r && r.ok === true ? r.stdout : null;
    const parsed = classifyReviewThreads(raw);
    if (!parsed.ok) return parsed;
    unresolved += parsed.unresolved;
    if (!parsed.hasNextPage) return { ok: true, unresolved };
    cursor = parsed.endCursor;
  }
  return { ok: false, reason: "incomplete" };
}

/**
 * `observeRepoCaps` — O4 (TSPEC §4.5). One `_ghRun` call, no PR URL
 * involved — repo-level capabilities only.
 */
export async function observeRepoCaps({ _ghRun }) {
  const r = await _ghRun(mergeCommandFor("repoCaps", {}));
  const raw = r && r.ok === true ? r.stdout : null;
  return classifyRepoCaps(raw);
}

/**
 * `observeChangedFiles` — O5 (TSPEC §4.6). Reuses `classifyChangedFiles`
 * itself to decide whether the fallback is needed at all, rather than
 * duplicating its completeness logic: a first pass with `fallbackRaw: null`
 * either resolves outright (short list, or a malformed entry failing
 * closed as `unparseable` without ever trying the fallback) or reports
 * `incomplete`, which is this function's own signal to fetch and re-run
 * classification with the fallback page attached. A missing `ref` when the
 * fallback would be needed fails closed as `incomplete` rather than
 * building an unparsable fallback command (TE-v3 N-01).
 */
export async function observeChangedFiles(prUrl, ref, { _ghRun }) {
  const primary = await _ghRun(mergeCommandFor("changedFiles", { prUrl }));
  const primaryRaw = primary && primary.ok === true ? primary.stdout : null;

  const attempt = classifyChangedFiles(primaryRaw, null);
  if (attempt.ok === true) return attempt;
  if (attempt.reason === "unparseable") return attempt;

  if (!ref) return { ok: false, reason: "incomplete" };
  const fallback = await _ghRun(
    mergeCommandFor("changedFilesFallback", { owner: ref.owner, repo: ref.repo, number: ref.number }),
  );
  const fallbackRaw = fallback && fallback.ok === true ? fallback.stdout : null;
  return classifyChangedFiles(primaryRaw, fallbackRaw);
}

// ─── TSPEC §6 — Phase MERGE: the self-modification guard (O-M7) ────────────
//
// PLAN §12 A3. Implements FSPEC §4 / NFR-3. Two pure functions only — no IO,
// no clock, no config/env/argv read anywhere in either body (§6.3's no-
// override boundary, asserted by mergeGuard.test.js's source scan).

function isNonEmptyString(v) {
  return typeof v === "string" && v.length > 0;
}

/**
 * The effective guard-path set: `MERGE_GUARD_DEFAULTS` unioned with whatever
 * the caller configured, additively and unconditionally (TSPEC §6.1, FSPEC
 * §4.3). Defaults are never filtered, subtracted or re-ordered — a
 * configuration that lists fewer paths, none, or one shaped like a removal
 * (a `"!"`-prefixed string, say) is simply unioned in: it becomes a guard
 * path that matches nothing, silently, with no warning and no report line.
 * Non-string members are dropped; every configured string gains a trailing
 * `/` so a bare form and its slash-terminated twin are the same guard path.
 *
 * @param {*} configured - the config's `guardPaths` value, any shape
 * @returns {string[]} the de-duplicated effective guard-path set
 */
export function effectiveGuardPaths(configured) {
  const extra = Array.isArray(configured) ? configured : [];
  const norm = (p) => (p.endsWith("/") ? p : `${p}/`);
  return [
    ...new Set([...MERGE_GUARD_DEFAULTS, ...extra.filter(isNonEmptyString).map(norm)]),
  ];
}

/**
 * The pure guard decision (TSPEC §6.2, FSPEC §4.2/§4.4). `changed` is O5's
 * classified changed-file observation, `{ ok: true, files: string[] }` or a
 * failure shape; anything not exactly `{ ok: true, ... }` fails CLOSED —
 * command failure, unparseable output, an absent `files` field and an
 * incomplete list all resolve as `ok !== true` one layer up (O5), so this
 * function's single check covers every one of them. Matching is
 * `String.prototype.startsWith`: case-sensitive, `/`-delimited (every guard
 * path ends in `/`), position-0 anchored — no globbing, no regex, no case
 * folding, no substring search.
 *
 * @param {{ok:boolean, files?: string[]}|null|undefined} changed - O5's observation
 * @param {string[]} guardPaths - the effective guard-path set
 * @returns {{fired:boolean, kind:"match"|"clear"|"unretrievable", matched:string[]}}
 */
export function guardVerdict(changed, guardPaths) {
  if (!changed || changed.ok !== true) {
    return { fired: true, kind: "unretrievable", matched: [] }; // FSPEC §4.4
  }
  const matched = changed.files.filter((p) => guardPaths.some((g) => p.startsWith(g)));
  return { fired: matched.length > 0, kind: matched.length ? "match" : "clear", matched };
}

// ─── TSPEC §5 — Phase MERGE: the pure decision core ────────────────────────
//
// PLAN §12 A4. `decideMerge` is pure, total and demand-driven (TSPEC §5.1):
// one call in, one of three shapes out — `need` (the next observation to
// take), `act` (the next merge method to attempt) or `resolved` (a §11 row).
// It never loops, never calls IO/clock seams, and never mutates its
// arguments; the orchestrating step loop (the `for` loop that re-drives this
// function until it resolves, and the try/catch around the whole thing that
// maps a thrown/exhausted loop to `row: "internal"`, TSPEC §12 E21) is
// `phaseMerge`'s (A7), not this function's.

/**
 * FSPEC §5 / TSPEC §5.4 — the CI evidence rule, as a single lookup:
 * `mergeRequiresCi` relaxes exactly the `"none"` cell. `pending`, `failed`
 * and `unknown` refuse under both settings; `passed` always passes.
 *
 * @param {"passed"|"none"|"pending"|"failed"|"unknown"} ci
 * @param {boolean} requiresCi
 * @returns {{result:"pass"}|{result:"refused", row:string, reason:string, escalate:boolean}}
 */
function ciRule(ci, requiresCi) {
  if (ci === "passed") return { result: "pass" };
  if (ci === "none") {
    if (requiresCi) {
      return {
        result: "refused",
        row: "9",
        reason: "no CI checks reported and mergeRequiresCi is true",
        escalate: true,
      };
    }
    return { result: "pass" };
  }
  if (ci === "pending") {
    return { result: "refused", row: "10", reason: "CI is pending", escalate: false };
  }
  if (ci === "failed") {
    return { result: "refused", row: "10", reason: "CI failed", escalate: false };
  }
  // "unknown" — CI rollup could not be classified.
  return {
    result: "refused",
    row: "11",
    reason: "CI status could not be determined",
    escalate: false,
  };
}

function o1FieldUnreadable(o1) {
  return (
    o1.mergeable === UNRECOGNISED_SENTINEL ||
    o1.mergeStateStatus === UNRECOGNISED_SENTINEL ||
    o1.number === null
  );
}

/**
 * `mergeCandidates` — TSPEC §5.6 / FSPEC §6.1. Pure: builds the merge-method
 * candidate chain, in the fixed order rebase, merge, squash. Squash is
 * included only when BOTH the repository capability (`caps.squash`) and the
 * configuration (`config.allowSquashMerge === true`, strict equality) allow
 * it — under the shipped default (`allowSquashMerge: false`) squash is
 * absent from the returned array entirely, never merely skipped at attempt
 * time (PROP-M-11).
 *
 * @param {{rebase:boolean, mergeCommit:boolean, squash:boolean}} caps - O4's classified capabilities
 * @param {{allowSquashMerge:boolean}} config
 * @returns {Array<"rebase"|"merge"|"squash">}
 */
export function mergeCandidates(caps, config) {
  const chain = [];
  if (caps && caps.rebase) chain.push("rebase");
  if (caps && caps.mergeCommit) chain.push("merge");
  if (config && config.allowSquashMerge === true && caps && caps.squash) chain.push("squash");
  return chain;
}

/**
 * `decideMerge(record, config)` — TSPEC §5.1–§5.3. See module docblock
 * above; guards are numbered and ordered exactly as TSPEC §5.3's table,
 * evaluated top to bottom, first match wins.
 *
 * `record` is the ObservationRecord (TSPEC §2.4): `{ prUrl, o1, o1Count, ci,
 * o3, o4, o5, attempts }`. `config` is a parsed merge config
 * (`MERGE_DEFAULTS`-shaped, TSPEC §3).
 *
 * @param {object} record
 * @param {object} config
 * @returns {
 *   {kind:"need", observation:string, waitMs?:number} |
 *   {kind:"act", method:"rebase"|"merge"|"squash"} |
 *   {kind:"resolved", row:string, mergeStatus:string, reason:string|null,
 *    escalations:string[], mergeSha:string|null, mergeMethod:string|null,
 *    defaultBranch?:string|null}
 * }
 */
export function decideMerge(record, config) {
  // Guard 1 (§2.2 r2): mergeMode is "off".
  if (config.mergeMode === "off") {
    return {
      kind: "resolved",
      row: "2",
      mergeStatus: "skipped",
      reason: "mergeMode is off",
      escalations: [],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  // Guard 2 (§2.2 r3): no PR URL from Phase PUB.
  if (!record.prUrl) {
    return {
      kind: "resolved",
      row: "6",
      mergeStatus: "deferred",
      reason: "no PR URL from Phase PUB",
      escalations: [],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  // Guard 3 (§2.2 r4): O1 not yet observed.
  if (record.o1 === null) {
    return { kind: "need", observation: "O1" };
  }
  // Guard 4 (§2.2 r4): O1 whole-observation failure.
  if (!record.o1.ok) {
    return {
      kind: "resolved",
      row: "8",
      mergeStatus: "refused",
      reason: "PR state could not be determined",
      escalations: [],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  // Guard 5 (§2.2 r5, §5.5): PR already MERGED. O4 is an OBSERVATION here,
  // never a precondition — only its default-branch name is consulted, and
  // its absence/failure never turns an already-merged PR into a refusal.
  if (record.o1.state === "MERGED") {
    if (record.o4 === null) {
      return { kind: "need", observation: "O4" };
    }
    return {
      kind: "resolved",
      row: "3",
      mergeStatus: "merged",
      reason: null,
      escalations: [],
      mergeSha: record.o1.mergeCommitOid ?? null,
      mergeMethod: "unknown",
      defaultBranch: record.o4.ok ? record.o4.defaultBranch : null,
    };
  }
  // Guard 6 (§2.2 r6): O5 not yet observed.
  if (record.o5 === null) {
    return { kind: "need", observation: "O5" };
  }
  const guardPaths = effectiveGuardPaths(config.guardPaths);
  const verdict = guardVerdict(record.o5, guardPaths);
  // Guard 7 (§2.2 r6): self-modification guard fired — a path matched.
  if (verdict.kind === "match") {
    const reason = `self-modification guard fired — matched paths: ${verdict.matched.join(", ")}`;
    return {
      kind: "resolved",
      row: "4",
      mergeStatus: "refused",
      reason,
      escalations: [`MERGE ESCALATION: self-modification guard fired for ${record.prUrl} — matched paths: ${verdict.matched.join(", ")}`],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  // Guard 8 (§2.2 r6): self-modification guard fail-closed, O5 unretrievable.
  if (verdict.kind === "unretrievable") {
    return {
      kind: "resolved",
      row: "5",
      mergeStatus: "refused",
      reason: "changed-file list could not be retrieved",
      escalations: [`MERGE ESCALATION: self-modification guard fired for ${record.prUrl} — changed-file list could not be retrieved`],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  // Guard 9 (§2.3 7a): PR is CLOSED.
  if (record.o1.state === "CLOSED") {
    return {
      kind: "resolved",
      row: "7",
      mergeStatus: "deferred",
      reason: "PR is CLOSED",
      escalations: [],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  // Guard 10 (§2.3 7b): O2 (CI) not yet observed.
  if (record.ci === null) {
    return { kind: "need", observation: "O2" };
  }
  // Guard 11 (§2.3 7b, §5.4): the CI rule.
  const ci = ciRule(record.ci, config.mergeRequiresCi);
  if (ci.result === "refused") {
    return {
      kind: "resolved",
      row: ci.row,
      mergeStatus: "refused",
      reason: ci.reason,
      escalations: ci.escalate
        ? [`MERGE ESCALATION: CI evidence absent for ${record.prUrl} — no checks reported and mergeRequiresCi is true`]
        : [],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  // Guard 12 (§2.3 7c): mergeable / mergeStateStatus / number unparseable.
  if (o1FieldUnreadable(record.o1)) {
    return {
      kind: "resolved",
      row: "11a",
      mergeStatus: "refused",
      reason: "PR mergeability could not be determined",
      escalations: [],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  // Guard 13 (§2.3 7c, §3.3): mergeable still UNKNOWN, bounded re-reads remain.
  if (record.o1.mergeable === "UNKNOWN" && record.o1Count <= config.mergeableRetries) {
    return { kind: "need", observation: "O1", waitMs: config.mergeableRetryDelay * 1000 };
  }
  // Guard 14 (§2.3 7c, §3.3): mergeable still UNKNOWN, retries exhausted.
  if (record.o1.mergeable === "UNKNOWN") {
    return {
      kind: "resolved",
      row: "13",
      mergeStatus: "deferred",
      reason: `mergeability still UNKNOWN after ${record.o1Count} observations`,
      escalations: [],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  // Guard 15 (§2.3 7c): CONFLICTING / DIRTY / BLOCKED.
  if (
    record.o1.mergeable === "CONFLICTING" ||
    record.o1.mergeStateStatus === "DIRTY" ||
    record.o1.mergeStateStatus === "BLOCKED"
  ) {
    return {
      kind: "resolved",
      row: "12",
      mergeStatus: "deferred",
      reason: `PR not mergeable (${record.o1.mergeable}/${record.o1.mergeStateStatus})`,
      escalations: [],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  // Guard 16 (§2.3 7d): O3 (review threads) not yet observed.
  if (record.o3 === null) {
    return { kind: "need", observation: "O3" };
  }
  // Guard 17 (§2.3 7d): O3 unretrievable/unparseable.
  if (!record.o3.ok) {
    return {
      kind: "resolved",
      row: "13a",
      mergeStatus: "refused",
      reason: "review-thread list could not be determined",
      escalations: [],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  // Guard 18 (§2.3 7d): unresolved review threads remain.
  if (record.o3.unresolved > 0) {
    return {
      kind: "resolved",
      row: "14",
      mergeStatus: "deferred",
      reason: `${record.o3.unresolved} unresolved review thread(s)`,
      escalations: [],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  // Guard 19 (§2.3 7e): O4 (capabilities) not yet observed.
  if (record.o4 === null) {
    return { kind: "need", observation: "O4" };
  }
  // Guard 20 (§2.3 7e): O4 unretrievable/unparseable.
  if (!record.o4.ok) {
    return {
      kind: "resolved",
      row: "15",
      mergeStatus: "refused",
      reason: "merge-method capability could not be determined",
      escalations: [],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  const candidates = mergeCandidates(record.o4, config);
  // Guard 21 (r8): no permitted merge method.
  if (candidates.length === 0) {
    return {
      kind: "resolved",
      row: "16",
      mergeStatus: "deferred",
      reason: "no permitted merge method",
      escalations: [],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  // Guards 22-24 (r8) drive the candidate chain. TSPEC §5.3 lists "an
  // untried candidate remains" (22) ahead of "the last attempt succeeded"
  // (23), but the only reading under which those two do not race is to
  // check success FIRST: once an attempt has succeeded the chain must stop
  // (NFR-2 — no more of the repo's merge surface is touched than the
  // decision needs), so an untried candidate remaining after a success must
  // never trigger another attempt.
  const attemptedMethods = record.attempts.map((a) => a.method);
  const lastAttempt = record.attempts[record.attempts.length - 1];
  if (lastAttempt && lastAttempt.ok) {
    return {
      kind: "resolved",
      row: "18",
      mergeStatus: "merged",
      reason: null,
      escalations: [],
      mergeSha: lastAttempt.oid ?? null,
      mergeMethod: lastAttempt.method,
    };
  }
  const nextCandidate = candidates.find((c) => !attemptedMethods.includes(c));
  if (nextCandidate) {
    return { kind: "act", method: nextCandidate };
  }
  // Guard 24: every candidate attempted, none succeeded.
  const reason = record.attempts.map((a) => `${a.method} failed (${a.detail})`).join("; ");
  return {
    kind: "resolved",
    row: "17",
    mergeStatus: "deferred",
    reason,
    escalations: [],
    mergeSha: null,
    mergeMethod: null,
  };
}

// ─── PLAN §12 A6 — merge execution and the post-merge helpers (TSPEC §7) ──
//
// `executeMerge` is O6 (§4.7): the phase's one mutating observation. The
// post-merge helpers — `deleteRemoteBranch` (M2, §7.2), `updateDefaultBranch`
// (M3, §7.4) and `evidenceCellFor` (§7.3) — run only once `decideMerge` has
// already resolved `merged`; none of them decide anything, they only report
// what they observed. All IO goes through the injected `_git` seam
// (`defaultGit`, `:5229`) — the same three-field `{ ok, stdout, stderr }`
// contract `_ghRun` uses, so every step below is a plain `if (!r.ok)`.

/** First line only — mirrors orchestrate-queue.js's `firstLine` exactly
 * (TSPEC §4.1); not imported across files because the runtime bundle forbids
 * cross-module `import` (build-runtime.mjs inlines each module standalone). */
function firstLine(text) {
  return String(text ?? "").split("\n")[0].trim();
}

/**
 * Phase H2's guard-refusal predicate (TSPEC §9.3, PLAN A-27, decision 1). A `git rm` of the
 * advisory record is refused exactly when it carries the reused, unmodified guard literal
 * `guard-harvest-before-delete.sh` produces — the same string Phase H's own TSPEC-HARVEST-04
 * detection tests for at `dev:8342` (message extended, never rewritten, per §9.3's ⚠️).
 */
function guardRefused(del) {
  return Boolean(
    del &&
      del.ok === false &&
      typeof del.stderr === "string" &&
      del.stderr.includes("pdlc guard: refusing to delete CROSS-REVIEW files")
  );
}

/**
 * `executeMerge` — O6 (TSPEC §4.7). Issues exactly one `gh pr merge` variant
 * for `method`, then — only when that command itself exited zero —
 * independently reads back `gh pr view --json mergeCommit,state` and
 * classifies the pair via `classifyMergeResult`. A zero-exit merge command is
 * never itself confirmation; only the read-back is (FSPEC §6.2).
 *
 * `reason` is a two-member closed set, `"command-failed" | "not-confirmed"`
 * (§4.7): `classifyMergeResult`'s own third possibility, `"unparseable"`
 * (an unreadable read-back), is folded into `"not-confirmed"` here — the
 * read-back ran and simply did not establish `MERGED`, whatever shape its
 * output took. `detail` is always populated: the transport's first `stderr`
 * line when non-empty, else the fixed token `"merge not confirmed"`.
 *
 * @param {string} prUrl
 * @param {"rebase"|"merge"|"squash"} method
 * @param {{ _ghRun: function }} seams
 * @returns {Promise<{ok: true, oid: string}|{ok: false, reason: string, detail: string}>}
 */
export async function executeMerge(prUrl, method, { _ghRun }) {
  const mergeResult = await _ghRun(mergeCommandFor("merge", { prUrl, method }));
  const mergeStderr = (mergeResult && mergeResult.stderr) || "";
  const detailFor = (stderr) => firstLine(stderr) || "merge not confirmed";

  if (!mergeResult || mergeResult.ok !== true) {
    return { ok: false, reason: "command-failed", detail: detailFor(mergeStderr) };
  }

  const readback = await _ghRun(mergeCommandFor("mergeReadback", { prUrl }));
  const readbackRaw = readback && readback.ok === true ? readback.stdout : null;
  const classified = classifyMergeResult(mergeResult.stdout, readbackRaw);
  if (classified.ok) return classified;

  const reason = classified.reason === "command-failed" ? "command-failed" : "not-confirmed";
  return { ok: false, reason, detail: detailFor(mergeStderr) };
}

/**
 * `evidenceCellFor` — TSPEC §7.3. A fixed 7-character truncation of the full
 * oid, never `git rev-parse --short` — the cell is then a pure function of
 * the observed value. `merged` is a literal token, never a SHA-shaped
 * placeholder.
 *
 * @param {string|null} mergeSha
 * @param {number} prNumber
 * @returns {string}
 */
export function evidenceCellFor(mergeSha, prNumber) {
  return typeof mergeSha === "string" && mergeSha.length >= 7
    ? `${mergeSha.slice(0, 7)} #${prNumber}`
    : `merged #${prNumber}`;
}

/**
 * `deleteRemoteBranch` — M2 (TSPEC §7.2, FSPEC §6.4). One command through the
 * existing git seam: `git push origin --delete feat-{feature}`. The local
 * branch is never touched. A failure is reported plainly — it never becomes
 * an escalation and never changes `mergeStatus` (that decision belongs to
 * the caller, `phaseMerge`, A7).
 *
 * @param {{ feature: string, _git: function }} args
 * @returns {Promise<{ok: true}|{ok: false, reason: string}>}
 */
export async function deleteRemoteBranch({ feature, _git }) {
  const branch = featureBranchName(feature);
  const result = await _git(["push", "origin", "--delete", branch]);
  if (result && result.ok === true) return { ok: true };
  const reason = firstLine(result && result.stderr) || "git push --delete failed";
  return { ok: false, reason };
}

/**
 * `updateDefaultBranch` — M3 (TSPEC §7.4, FSPEC §8.3). Every command goes
 * through the injected `_git(argv)` seam, whose contract never throws, so
 * this function contains no `try/catch` — each step is a plain `if (!r.ok)`.
 * `argv` arrays only, never command strings (a branch name is untrusted
 * input at the seam boundary).
 *
 * On any failure past step 0, an additional `rev-parse --abbrev-ref HEAD`
 * reports where the tree actually is (falling back to `"unknown"`) — the
 * escalation names the branch the operator must deal with, not the branch
 * the step intended to reach.
 *
 * @param {{ defaultBranch: string|null, mergeSha: string|null, _git: function }} args
 * @returns {Promise<{ok: true, branch: string}|{ok: false, reason: string, branch?: string}>}
 */
export async function updateDefaultBranch({ defaultBranch, mergeSha, _git }) {
  if (defaultBranch == null) {
    return { ok: false, reason: "default branch name unavailable" };
  }

  const fail = async (reason) => {
    const abbrev = await _git(["rev-parse", "--abbrev-ref", "HEAD"]);
    const reported =
      abbrev && abbrev.ok === true ? String(abbrev.stdout ?? "").trim() : "";
    return { ok: false, reason, branch: reported || "unknown" };
  };

  // Step 1 — the tree must be clean before anything is checked out over it.
  const status = await _git(["status", "--porcelain"]);
  if (!status || status.ok !== true || String(status.stdout ?? "").trim() !== "") {
    return await fail("working tree is dirty");
  }

  // Step 2 — fetch the remote default branch, named by O4's own observation.
  const fetch = await _git(["fetch", "origin", defaultBranch]);
  if (!fetch || fetch.ok !== true) {
    return await fail(`git fetch failed: ${firstLine(fetch && fetch.stderr)}`);
  }

  // Step 3 — does the local branch exist yet? `!ok` is not itself a failure.
  const revParse = await _git([
    "rev-parse",
    "--verify",
    "--quiet",
    `refs/heads/${defaultBranch}`,
  ]);
  const branchExists = !!(revParse && revParse.ok === true);

  // Steps 4a/4b — check it out, creating it from FETCH_HEAD if it is new.
  const checkout = branchExists
    ? await _git(["checkout", defaultBranch])
    : await _git(["checkout", "-B", defaultBranch, "FETCH_HEAD"]);
  if (!checkout || checkout.ok !== true) {
    return await fail(`checkout failed: ${firstLine(checkout && checkout.stderr)}`);
  }

  // Step 5 — only when the branch already existed: replay any local
  // queue-row commits onto the fetched tip. One `rebase` covers both the
  // fast-forward case and the replay case (§7.4) — already-upstream commits
  // drop out as empty via `--empty=drop`, explicit so behaviour never
  // depends on the operator's rebase backend default.
  if (branchExists) {
    const rebase = await _git(["rebase", "--empty=drop", "FETCH_HEAD"]);
    if (!rebase || rebase.ok !== true) {
      await _git(["rebase", "--abort"]); // best-effort; result ignored
      return await fail(
        `replay of local queue-row commits onto ${defaultBranch} conflicted: ` +
          firstLine(rebase && rebase.stderr),
      );
    }
  }

  // Step 6 — the positive confirmation: the merge commit must be an
  // ancestor of HEAD after the update, turning a silently-wrong checkout
  // into a reported one. Exit-status only; no stdout is parsed for meaning.
  const ancestor = await _git(["merge-base", "--is-ancestor", mergeSha ?? "FETCH_HEAD", "HEAD"]);
  if (!ancestor || ancestor.ok !== true) {
    return await fail("merge commit is not an ancestor of HEAD after update");
  }

  return { ok: true, branch: defaultBranch };
}

// TSPEC §7.1/§10.2 — the plain (non-escalating) notice catalogue this phase
// emits (DC-01). A6 lands the constant here, closest to the M-helpers that
// produce most of its members, and resolves PROPERTIES §8's SE F-04 naming
// drift in the same commit: TSPEC §7.1's snippet writes the ahead-of-remote
// notice as a standalone `AHEAD_OF_REMOTE_NOTE(...)` while §10.2 names the
// frozen `MERGE_NOTES` catalogue — one symbol, `MERGE_NOTES.aheadOfRemote`,
// not two. The catalogue's remaining six members and every `notes.push(...)`
// call site belong to `phaseMerge` (A7), which extends this object literal
// rather than re-declaring it.
export const MERGE_NOTES = Object.freeze({
  // FSPEC §8.2 — emitted once per merged run whose M4 disposition is
  // `recorded`; `defaultBranch` is always O4's own `defaultBranchRef.name`,
  // the same value M3 fetched, so the two cannot disagree.
  aheadOfRemote: (defaultBranch, feature) =>
    `Local ${defaultBranch} is ahead of its remote by the queue-row commit for ${feature}; ` +
    `pdlc does not push it — it reaches the remote with the next feature's PR.`,

  // FSPEC §9.4 — emitted once for every `deferred`/`refused` run, never for
  // `skipped`/`merged`. Exact text.
  mergeDeferred: (feature, reason) =>
    `Merge deferred for ${feature}: ${reason}. The queue row is unchanged; merge the PR to advance it.`,

  // TSPEC §3.3/§10.3 — the `merge` config section was present but not an
  // object; every setting fell back to its own default independently.
  sectionMalformed: () =>
    `.claude/pdlc.config.json's "merge" section is present but not an object; every merge setting is using its default.`,

  // TSPEC §7.5 — no PR number could be resolved from either `prUrl` or O1,
  // so the queue row is left untouched: no write, never "#null".
  noPrNumber: (feature, prUrl) =>
    `Queue row for ${feature} was not updated: no PR number could be resolved from ${prUrl}.`,

  // TSPEC §7.5/E19 — the queue write was made but not committed; `detail`
  // is `_recordQueueRow`'s own explanation, already a complete sentence.
  recordedUncommitted: (feature, detail) => `Queue row for ${feature}: ${detail}`,

  // FSPEC §2.5 — the queue row's current status is not one of the three
  // overwritable statuses, so nothing was written; `detail` names the
  // status found and is already a complete sentence.
  nonOverwrite: (feature, detail) => `Queue row for ${feature}: ${detail}`,

  // TSPEC §7.2/FSPEC §6.4 (M2) — best-effort remote branch deletion failed;
  // never an escalation, never changes mergeStatus.
  branchDeleteFailed: (feature, reason) =>
    `Remote branch deletion failed for ${feature}: ${reason}`,
});

// FSPEC §9.3 — the closed, 4-member escalation-text catalogue (DC-01):
// guard / CI / queue-not-updated / tree-not-updated. `decideMerge` (A4)
// already renders the guard-match, guard-unretrievable and CI-absent lines
// inline (it is pure and cannot import this catalogue's call site, since it
// predates it) — `guard` and `ci` below render byte-identical text from the
// same parameters so PROP-M-19's closure holds without `decideMerge` itself
// depending on this object. `queue`/`tree` are this phase's own (M3/M4)
// escalations and have no other renderer. Every member takes one object
// argument (TSPEC §7.1's own call shape for `tree`), never positional args.
export const MERGE_ESCALATIONS = Object.freeze({
  guard: ({ prUrl, tail }) => `MERGE ESCALATION: self-modification guard fired for ${prUrl} — ${tail}`,
  ci: ({ prUrl }) =>
    `MERGE ESCALATION: CI evidence absent for ${prUrl} — no checks reported and mergeRequiresCi is true`,
  queue: ({ prUrl, shortSha, feature, detail }) =>
    `MERGE ESCALATION: merged ${prUrl} (${shortSha}) but the queue row for ${feature} was not updated — ${detail}`,
  tree: ({ prUrl, reason, branch }) =>
    `MERGE ESCALATION: working tree not updated after merging ${prUrl} — ${reason}; tree is on ${branch}`,
});

// TSPEC §10.2 — a sibling catalogue, deliberately adjacent to MERGE_ESCALATIONS so the two read
// together, and deliberately NOT merged onto it (N-1 — MERGE_ESCALATIONS is untouched). Both
// prefixes contain the substring `ESCALATION:`, so one grep finds both (N-3); the advisory
// prefix is its own, distinct text (N-2).
export const ADVISORY_ESCALATIONS = Object.freeze({
  seam: ({ seam, feature, reason }) =>
    `ADVISORY ESCALATION: seam ${seam} for ${feature} — ${reason}; see docs/_queue/ESCALATIONS.md`,
});

/**
 * `phaseMerge` — PLAN A7 (TSPEC §7, §10.4). The orchestrator: reads config
 * once (O-M5, §3.3), drives `decideMerge`'s demand/resolution loop (§5.2)
 * through the six `observe*`/`executeMerge` seams, then — only when the
 * core resolves `merged` — runs the M2–M4 post-merge sequence (§7.1) in
 * order: remote branch delete, default-branch update, queue write-back.
 * Never throws to the caller (FSPEC §2.1): the whole body past the enable
 * check is wrapped in `try/catch`, mapping any throw to
 * `{ mergeStatus: "refused", row: "internal" }`.
 *
 * `_enabled` and `_configPath` are the only two seams defaulted from a
 * module constant; every other seam is required so a test cannot
 * accidentally exercise production IO by omission (TE F-05).
 *
 * @param {{
 *   feature: string,
 *   prUrl: string|null,
 *   config?: object,
 *   _enabled?: boolean,
 *   _ghRun?: function,
 *   _git: function,
 *   _readFile: function,
 *   _recordQueueRow: function,
 *   _log?: function,
 *   _now?: function,
 *   _sleep?: function,
 *   _configPath?: string,
 * }} args
 * @returns {Promise<object>} MergeOutcome (TSPEC §2.4)
 */
export async function phaseMerge({
  feature,
  prUrl,
  config: configOverride,
  _enabled = PHASE_MERGE_ENABLED,
  _ghRun = defaultGhRun,
  _git,
  _readFile,
  _recordQueueRow,
  _log,
  _now = () => Date.now(),
  _sleep = sleep,
  _configPath = MERGE_CONFIG_PATH,
}) {
  const skippedOutcome = (row, reason, notes = []) => ({
    mergeStatus: "skipped",
    mergeSha: null,
    mergeMethod: null,
    row: String(row),
    reason,
    escalations: [],
    notes,
    queueRow: null,
  });

  // FSPEC §2.2 row 1 — structural, not a checked precondition: no code path
  // below this line runs when the phase is disabled, so no read of the
  // config file happens either (§3.3).
  if (!_enabled) return skippedOutcome(1, "Phase MERGE disabled");

  // Hoisted above the try (CR product-manager finding 3): a note pushed
  // before a later step throws (e.g. M2's branch-delete note ahead of an
  // M3 throw) must still reach the caller on the row-internal outcome —
  // the catch below returns this same array rather than a fresh `[]`.
  const notes = [];

  try {
    let config = configOverride;
    if (!config) {
      // Exactly one read per run (O-M5, §3.3), skipped entirely when a test
      // (or a future caller) supplies `config` directly.
      const raw = await readMergeConfigSafely(_readFile, _configPath);
      const parsed = parseMergeConfig(raw);
      config = parsed.config;
      if (parsed.sectionMalformed) notes.push(MERGE_NOTES.sectionMalformed());
    }
    if (config.mergeMode === "off") return skippedOutcome(2, "mergeMode is off", notes);

    const record = {
      prUrl: prUrl ?? null,
      o1: null,
      o1Count: 0,
      ci: null,
      o3: null,
      o4: null,
      o5: null,
      attempts: [],
    };
    const ref = prUrl ? parsePrRef(prUrl) : null;

    const observe = {
      O1: () => observePrState(prUrl, { _ghRun }),
      O2: () => observeCi(prUrl, { _ghRun }),
      O3: () => observeReviewThreads(ref, { _ghRun }),
      O4: () => observeRepoCaps({ _ghRun }),
      O5: () => observeChangedFiles(prUrl, ref, { _ghRun }),
    };
    const slotFor = { O1: "o1", O2: "ci", O3: "o3", O4: "o4", O5: "o5" };

    // The demand-driven loop (§5.2). `decideMerge` is pure and total; every
    // IO call below is this orchestrator's own response to its demand.
    let d;
    let step = 0;
    for (; step < MERGE_MAX_DECISION_STEPS; step++) {
      d = decideMerge(record, config);
      if (d.kind === "resolved") break;
      if (d.kind === "act") {
        const result = await executeMerge(prUrl, d.method, { _ghRun });
        record.attempts.push({ method: d.method, ...result });
        continue;
      }
      if (d.waitMs) await _sleep(d.waitMs);
      record[slotFor[d.observation]] = await observe[d.observation]();
      if (d.observation === "O1") record.o1Count += 1;
    }
    if (!d || d.kind !== "resolved") {
      throw new Error("unreachable: decideMerge did not resolve");
    }

    const escalations = [...d.escalations];

    if (d.mergeStatus !== "merged") {
      // FSPEC §9.4 — one plain note for every deferred/refused run.
      notes.push(MERGE_NOTES.mergeDeferred(feature, d.reason));
      return {
        mergeStatus: d.mergeStatus,
        mergeSha: d.mergeSha,
        mergeMethod: d.mergeMethod,
        row: d.row,
        reason: d.reason,
        escalations,
        notes,
        queueRow: null,
      };
    }

    // ── merged — M2, M3, M4 (TSPEC §7.1) ──────────────────────────────────
    //
    // Row 3 (already MERGED) carries its own `defaultBranch` field (§5.5);
    // every other merged row reaches here only after guard 20 confirmed
    // `record.o4.ok`, so `record.o4.defaultBranch` is always readable then.
    const defaultBranch = Object.prototype.hasOwnProperty.call(d, "defaultBranch")
      ? d.defaultBranch
      : record.o4 && record.o4.ok
        ? record.o4.defaultBranch
        : null;

    // M2 — best-effort remote branch deletion; a plain note, never an
    // escalation, never changes mergeStatus.
    if (config.deleteBranchOnPdlcMerge) {
      const del = await deleteRemoteBranch({ feature, _git });
      if (!del.ok) notes.push(MERGE_NOTES.branchDeleteFailed(feature, del.reason));
    }

    // M3 — the default-branch update. Its escalation (if any) is pushed
    // after M4's below, so `escalations` ends up in FSPEC §9.3's table
    // order (guard, CI, queue-write, tree-update) regardless of which IO
    // step actually ran first.
    const tree = await updateDefaultBranch({ defaultBranch, mergeSha: d.mergeSha, _git });

    // M4 — the queue write-back (TSPEC §7.5). `prNumber`'s primary source
    // is the URL Phase PUB produced; `record.o1.number` is the fallback for
    // a `prUrl` shape `parsePrRef` cannot read. Absent both, the write is
    // skipped with a plain note rather than writing "#null".
    const prNumber = parsePrRef(prUrl)?.number ?? record.o1?.number ?? null;
    let queueRow = null;
    if (prNumber === null) {
      notes.push(MERGE_NOTES.noPrNumber(feature, prUrl));
    } else {
      const evidence = evidenceCellFor(d.mergeSha, prNumber);
      const rec = await _recordQueueRow({ feature, status: "done", evidence });
      queueRow = rec && rec.queueRow ? rec.queueRow : null;
      if (queueRow === "error") {
        const shortSha =
          typeof d.mergeSha === "string" && d.mergeSha.length >= 7
            ? d.mergeSha.slice(0, 7)
            : "sha unknown";
        escalations.push(
          MERGE_ESCALATIONS.queue({
            prUrl,
            shortSha,
            feature,
            detail: (rec && rec.detail) || "queue row not found",
          }),
        );
      } else if (queueRow === "recorded (uncommitted)") {
        notes.push(
          MERGE_NOTES.recordedUncommitted(
            feature,
            (rec && rec.detail) || "queue row recorded but not committed",
          ),
        );
      } else if (queueRow === "recorded") {
        // FSPEC §8.2 — emitted whenever M4's disposition is `recorded`,
        // including row 3's already-merged re-entry (§7.1's Q-01 answer) —
        // but only when the sentence it emits is actually true (CR
        // product-manager finding 1): `tree.ok` establishes the commit
        // really reached `defaultBranch` (M3 succeeded), `defaultBranch`
        // rules out interpolating `null` when O4 never resolved a name, and
        // `!(rec && rec.detail)` rules out the §2.5 non-overwrite case,
        // where the row was left unchanged and no queue-row commit exists
        // to be "ahead" of anything.
        if (tree.ok && defaultBranch && !(rec && rec.detail)) {
          notes.push(MERGE_NOTES.aheadOfRemote(defaultBranch, feature));
        }
        if (rec && rec.detail) notes.push(MERGE_NOTES.nonOverwrite(feature, rec.detail));
      }
    }

    if (!tree.ok) {
      escalations.push(
        MERGE_ESCALATIONS.tree({ prUrl, reason: tree.reason, branch: tree.branch ?? "unknown" }),
      );
    }

    return {
      mergeStatus: "merged",
      mergeSha: d.mergeSha,
      mergeMethod: d.mergeMethod,
      row: d.row,
      reason: d.reason,
      escalations,
      notes,
      queueRow,
    };
  } catch (err) {
    // FSPEC §2.1 — Phase MERGE never throws to the pipeline. E30/E21 (§12):
    // the outer catch is the single enforcement point for that guarantee.
    // `notes` is the hoisted array above — whatever accumulated before the
    // throw (e.g. M2's branch-delete note) is returned, not dropped (CR
    // product-manager finding 3).
    return {
      mergeStatus: "refused",
      mergeSha: null,
      mergeMethod: null,
      row: "internal",
      reason: err && err.message ? err.message : "phaseMerge failed unexpectedly",
      escalations: [],
      notes,
      queueRow: null,
    };
  }
}

// MODEL-01: per-phase model selection. Every phase runs on Opus for reasoning
// depth EXCEPT the Phase I implementation batches, which run on Sonnet for
// throughput/cost. Passed to the runtime via the agent() opts.model field.
const MODEL_DEFAULT = "opus"; // all phases except Phase I

// ── TSPEC §4.8 — review-loop / authoring budgets ───────────────────────────────
// Module-level, not main() parameters: they are policy, not capability, and the
// workflow runtime's bundle has no configuration channel to override them from.
// They are deliberately NOT exported — an export widens the bundle's published
// surface for no caller. Tests reach them through observable behaviour (round
// windows, dispatch counts), the same discipline DOD_MAX_ITERATIONS lives under.

// TSPEC-ROUNDS-01: per-invocation review-round budget (AC-1.6a). NOT an absolute
// round index — the gate and the reported counts derive from this plus the
// branch-derived starting index.
const MAX_REVIEW_ROUNDS = 5;

/**
 * DEC-ROUNDS-02 (operator decision, 2026-08-10) — the LIFETIME review-round cap.
 *
 * `MAX_REVIEW_ROUNDS` is a per-INVOCATION budget: `deriveRoundWindow` opens the
 * window one past the highest `-v{N}` cross-review already on the branch, so a
 * document that keeps getting re-opened — an approval anchor staled by an edit,
 * an erratum cascading in from a sibling document, a forced re-run — accumulates
 * rounds without bound. On pdlc-consolidation-agent the REQ reached round 21 and
 * the FSPEC and TSPEC round 18, each round costing a full author + reviewer fan-out
 * and each producing findings smaller than the one before it.
 *
 * The cap is the review loop's damping term. Past this many rounds on disk the
 * marginal value of another finding is below the cost of the round that would find
 * it, so the pipeline **accepts the document as-is and moves forward**. Accepted
 * as-is is NOT approved: no approval anchor is written, no verdict is synthesised,
 * and the phase row says so. It is also not a failure: no POSTMORTEM is written,
 * because nothing failed — the loop simply stopped paying for itself.
 *
 * It is a LIFETIME cap because the round history is already content-addressed on
 * disk (§5.2's filename grammar), so "how many rounds has this document had, ever,
 * on this branch" is a total function of a directory listing the gate already
 * takes. No new state, no clock, no config.
 *
 * **`forcePhases` overrides it.** An operator who names the phase has asked for
 * the round explicitly, which is exactly the signal the cap exists to supply in
 * the operator's absence (see `phaseGate`, and `lifetimeCapReached`'s callers).
 *
 * Exported — unlike `MAX_REVIEW_ROUNDS`, this number is operator-facing: it is
 * named verbatim in the notice and the phase row, and tests pin the boundary
 * (round 15 opens, round 16 does not) against the constant rather than a literal.
 */
export const MAX_LIFETIME_ROUNDS = 15;

const MAX_AUTHORING_ATTEMPTS = 3; // consecutive no-progress dispatches, per episode
const MAX_AUTHORING_DISPATCHES = 6; // total dispatches, per episode
const MAX_AUTHORING_WRITE_BYTES = 12000; // per-tool-call emission ceiling stated to authors

// ── TSPEC §4.1 — the four closed failure catalogues (DC-01) ────────────────────
// Frozen so a test can enumerate them and a switch can be checked exhaustive.
// §4.2: `dir_missing` is the sole benign ListFailure; the other three mean
// "cannot judge" and halt.
export const LIST_FAILURES = Object.freeze([
  "dir_missing",
  "not_a_directory",
  "unreadable",
  "bad_argument",
]);
export const FILENAME_FAILURES = Object.freeze([
  "not_cross_review",
  "bad_role",
  "bad_doc_type",
  "bad_round",
  "trailing_junk",
]);
export const HASH_FAILURES = Object.freeze(["absent", "duplicated", "unparseable"]);
export const TRAILER_FAILURES = Object.freeze([
  "declared_incomplete",
  "absent",
  "duplicated",
  "unparseable",
]);

const MODEL_IMPLEMENTATION = "sonnet"; // Phase I se-implement batches only

// ─── TSPEC §3.1 — advisory-tier constants ──────────────────────────────────
//
// Placed immediately after MODEL_IMPLEMENTATION so all four model rungs (opus/sonnet default,
// implementation, advisory, advisory fallback) read as one block (AC-1.5).
const MODEL_ADVISORY = "fable"; // BL-01 — see TSPEC §3.3
const MODEL_ADVISORY_FALLBACK = "opus"; // === MODEL_DEFAULT's literal, deliberately a separate constant

export const ADVISORY_CONFIG_PATH = MERGE_CONFIG_PATH; // ".claude/pdlc.config.json" (dev:43)

// The permitted-action set — the whole envelope, shipped. A seam's own `permittedActions` is a
// SUBSET of this (TSPEC §4.3, §8.3); this frozen literal is the operand T-03-8 transcribes for
// its set-equality assertion. The members are FSPEC E-1…E-4 verbatim.
export const ENVELOPE_DEFAULTS = Object.freeze(["E-1", "E-2", "E-3", "E-4"]);

export const ADVISORY_DEFAULTS = Object.freeze({
  enabled: false,
  attemptBudget: 3,
  seamBudgetMinutes: 10,
  envelope: ENVELOPE_DEFAULTS, // the four-member literal above
});

export const ADVISORY_SEAMS = Object.freeze(["A1", "A2", "A3", "A4", "A5"]);

/**
 * Parse the repo's `advisory` config section out of the SAME `.claude/pdlc.config.json`
 * `parseMergeConfig`/`parseImplementationConfig` read. Pure and total: never throws, never
 * reads anything, and every key falls back INDEPENDENTLY — one bad key must not silently retune
 * the others (FSPEC C-2). Modelled on `parseImplementationConfig` (dev:181-231) rather than
 * `parseMergeConfig`, per TSPEC §3.2: independent per-key fallback plus an `invalidKeys` list the
 * caller reports.
 *
 * @param {string|null} text - raw file contents, or null (file absent/unreadable)
 * @returns {{ config: object, sectionMalformed: boolean, invalidKeys: string[] }}
 */
export function parseAdvisoryConfig(text) {
  const degraded = (sectionMalformed) => ({
    config: ADVISORY_DEFAULTS,
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

  if (!isPlainObject(parsed) || !("advisory" in parsed)) return degraded(false);

  const section = parsed.advisory;
  if (!isPlainObject(section)) return degraded(true);

  const invalidKeys = [];

  const boolField = (key) => {
    if (!(key in section)) return ADVISORY_DEFAULTS[key];
    const v = section[key];
    if (typeof v === "boolean") return v;
    invalidKeys.push(key);
    return ADVISORY_DEFAULTS[key];
  };

  const positiveInt = (key) => {
    if (!(key in section)) return ADVISORY_DEFAULTS[key];
    const v = section[key];
    if (Number.isInteger(v) && v >= 1) return v;
    invalidKeys.push(key);
    return ADVISORY_DEFAULTS[key];
  };

  const positiveNumber = (key) => {
    if (!(key in section)) return ADVISORY_DEFAULTS[key];
    const v = section[key];
    if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
    invalidKeys.push(key);
    return ADVISORY_DEFAULTS[key];
  };

  let envelope = ADVISORY_DEFAULTS.envelope;
  if ("envelope" in section) {
    const v = section.envelope;
    if (Array.isArray(v) && v.every((p) => typeof p === "string" && p.trim() !== "")) {
      envelope = Object.freeze([...v]);
    } else {
      invalidKeys.push("envelope");
    }
  }

  return {
    config: Object.freeze({
      enabled: boolField("enabled"),
      attemptBudget: positiveInt("attemptBudget"),
      seamBudgetMinutes: positiveNumber("seamBudgetMinutes"),
      envelope,
    }),
    sectionMalformed: false,
    invalidKeys,
  };
}

/**
 * Read the advisory config file, never throwing. Byte-for-byte the shape of
 * `readMergeConfigSafely` (dev:261-267) and adopted for the same reason: the injected read is
 * agent-mediated in production and returns `null` for a missing file rather than throwing — but a
 * throw from some future read implementation must not abort the pipeline. Read once per run (C-3)
 * and the result threaded, never re-read.
 *
 * @param {function} readFileFn - async (path) => string|null (or throws)
 * @param {string} path - ADVISORY_CONFIG_PATH
 * @returns {Promise<string|null>}
 */
export async function readAdvisoryConfigSafely(readFileFn, path) {
  try {
    return await readFileFn(path);
  } catch {
    return null;
  }
}

// ─── TSPEC §3.4 — model-rung resolution ─────────────────────────────────────
//
// `MODEL_ERROR_RE` classifies a dispatch rejection as a model/alias resolution failure (M-1)
// rather than an ordinary invocation failure. NOTE: TSPEC §3.4's inline literal
// (`\b(unrecognis|unrecogniz)\b`) puts a word boundary immediately after the truncated stem,
// which never matches the full words "unrecognised"/"unrecognized" — the trailing letters are
// still word characters, so no boundary exists there. This is the same predicate TSPEC §3.4
// describes and T-01-2..T-01-5 exercise; `\w*` after each stem is the fix that makes the
// boundary land where the word actually ends, matching both the British and American spellings
// the test suite scripts.
const MODEL_ERROR_RE =
  /\b(unknown|unrecognis\w*|unrecogniz\w*|invalid|unsupported)\b[^\n]*\b(model|alias)\b/i;

/**
 * Classifies a dispatch rejection as a model/alias resolution failure (TSPEC §3.4, M-1) rather
 * than an ordinary invocation failure. Pure, total, never throws — accepts an `Error`, a
 * plain object carrying `.message`, or any other rejection value.
 *
 * @param {unknown} err
 * @returns {boolean}
 */
export function isModelResolutionError(err) {
  return MODEL_ERROR_RE.test(String(err?.message ?? err ?? ""));
}

// The skill EVERY advisory dispatch goes out under. One constant, referenced by the one ladder
// below — which is the only place in either module that names an advisory model rung (AC-1.5).
const ADVISORY_RUNG_SKILL = "se-review";

/**
 * `resolveAdvisoryRung` — TSPEC §3.4's model-rung ladder, and the **one** ladder the tier ships.
 * `runAdvisorySeam`'s DIAGNOSE step calls this directly for every attempt, so the tested semantics
 * are the shipped semantics: there is no second, private copy of this ladder anywhere.
 *
 * Rung resolution is lazy and memoised per run through `_state` (`{ resolved: null }`), threaded
 * from the caller rather than held in module state (§3.5): the bundle inlines this module into both
 * shipped artifacts and jest runs every test against one imported module instance, so a
 * module-level memo would leak resolution across tests and across a queue invocation's delegated
 * `orchestrate-dev` run. With `_state.resolved` already set, the cached rung is used directly and
 * no ladder is entered (M-4).
 *
 * Non-resolution is detected by classifying the rejection of the **real** dispatch
 * (`isModelResolutionError`, M-1), never by a separate probe — the caller's own `prompt` is what
 * goes out, so the happy path costs exactly one `_agent` call, not two. A matched rejection emits
 * `ADVISORY_MODEL_FALLBACK`, substitutes `MODEL_ADVISORY_FALLBACK`, and re-dispatches the SAME
 * prompt once (M-2). A rejection that also matches on the fallback rung halts (M-3) — there is no
 * third rung, and no advisory agent output is ever produced. A rejection that does not match is an
 * ordinary invocation failure, returned as `{kind:"dispatch-error"}` for the caller's attempt loop
 * to disposition, without entering the ladder (T-01-5).
 *
 * **Deliberately NOT `async`, and deliberately `.then`-chained.** The caller races the returned
 * promise against a wall-clock deadline built as `_sleep(...).then(...)`. `Promise.race` breaks a
 * tie between two promises that settle at the same microtask hop-depth in favour of whichever
 * underlying async work was invoked first, and the test doubles' `_agent`/`_sleep` both settle
 * synchronously — so this must settle exactly ONE hop past the underlying `_agent` call, the same
 * depth as the deadline. An `async`/`await` body here would add hops and let the deadline win a
 * race on hop-count alone rather than on elapsed time.
 *
 * @param {{ _agent: Function, _log: Function, prompt: string, skill?: string,
 *           _state: { resolved: {model: string, fallback: boolean}|null } }} deps
 * @returns {Promise<{kind: "response", raw: string} | {kind: "dispatch-error", err: unknown}>}
 * @throws  haltError (as a rejection) when neither rung resolves (M-3)
 */
export function resolveAdvisoryRung({ _agent, _log, _state, prompt, skill = ADVISORY_RUNG_SKILL }) {
  const log = typeof _log === "function" ? _log : () => {};

  // `dispatchAt` exists for §8.5's returned-promise ruling: `return _agent(…);` is a classified
  // seam call, while a `.then`-chained one is not — and the chaining below is load-bearing (see
  // the hop-count note above), so the seam call moves into a body the ruling covers and the chain
  // hangs off the returned promise, adding no microtask hop.
  function dispatchAt(model) {
    return _agent(skill, prompt, { model });
  }

  if (_state.resolved != null) {
    return dispatchAt(_state.resolved.model).then(
      (raw) => ({ kind: "response", raw }),
      (err) => ({ kind: "dispatch-error", err })
    );
  }

  return dispatchAt(MODEL_ADVISORY).then(
    (raw) => {
      _state.resolved = { model: MODEL_ADVISORY, fallback: false };
      return { kind: "response", raw };
    },
    (err) => {
      if (!isModelResolutionError(err)) return { kind: "dispatch-error", err };
      log(
        `ADVISORY_MODEL_FALLBACK: "${MODEL_ADVISORY}" did not resolve — substituting "${MODEL_ADVISORY_FALLBACK}"`
      );
      return dispatchAt(MODEL_ADVISORY_FALLBACK).then(
        (raw) => {
          _state.resolved = { model: MODEL_ADVISORY_FALLBACK, fallback: true };
          return { kind: "response", raw };
        },
        (fallbackErr) => {
          if (!isModelResolutionError(fallbackErr)) return { kind: "dispatch-error", err: fallbackErr };
          throw haltError(
            `Advisory model rung resolution failed: neither "${MODEL_ADVISORY}" nor ` +
              `"${MODEL_ADVISORY_FALLBACK}" resolved. No advisory agent output was produced.`
          );
        }
      );
    }
  );
}

/**
 * @typedef {Object} AdvisoryVerdict          AC-2.1 / FSPEC §4.2. The agent's product.
 * @property {"A1"|"A2"|"A3"|"A4"|"A5"} seam
 * @property {string}   diagnosis             non-empty
 * @property {string}   proposedAction        non-empty; may be the literal "nothing"
 * @property {"high"|"low"} confidence
 * @property {boolean}  withinEnvelope        ADVISORY ONLY — never the membership decision (V-3)
 * @property {string[]} evidence              non-empty; file:line / log citations
 */

/**
 * @typedef {Object} AdvisoryDisposition      V-7. Exactly three terminal values.
 * @property {"resolved"|"escalated"|"no-action"} outcome
 * @property {string|null} reason             one §5.3 reason iff outcome === "escalated"
 * @property {AdvisoryVerdict|null} verdict   last well-formed verdict, if any
 * @property {number}  attempts               attempts consumed
 * @property {string}  model                  the rung actually used (§3.4)
 * @property {boolean} fallback
 */

/**
 * Parse the raw agent trailer produced at TSPEC §4.4 step 1 into an {@link AdvisoryVerdict},
 * enforcing every well-formedness rule of TSPEC §4.4/PROPERTIES PROP-VER-03 in one place — pure
 * and total: never throws, and returns `{ verdict: null, malformed: true, why }` for any input
 * that does not parse cleanly (TSPEC §4.2, following `parseDodStatus` / `parseVerdict`: parse the
 * agent's trailer, never trust its shape).
 *
 * The five malformedness rules, checked in order — each independently falsifiable:
 *   (a) `seam` does not match `dispatchedSeam` (skipped when `dispatchedSeam` is `undefined` —
 *       there is no "dispatched seam" concept to compare against)
 *   (b) `evidence` is empty
 *   (c) `diagnosis` is empty
 *   (d) `proposedAction` is absent (the literal `"nothing"` is a valid, well-formed value —
 *       FSPEC §4.4 row 4 — distinct from an absent trailer line)
 *   (e) `confidence` is outside the `"high"|"low"` enum
 *
 * `withinEnvelope` is preserved data only ("yes"/"no" → true/false) — it never blocks or forces a
 * clean parse by itself (V-3).
 *
 * @param {string} raw               the agent's raw trailer text
 * @param {string} [dispatchedSeam]  the seam `runAdvisorySeam` actually dispatched; omit to skip
 *                                   the wrong-seam rule
 * @returns {{ verdict: AdvisoryVerdict|null, malformed: boolean, why: string|null }}
 */
export function parseAdvisoryVerdict(raw, dispatchedSeam) {
  const fail = (why) => ({ verdict: null, malformed: true, why });

  if (typeof raw !== "string" || raw.trim() === "") {
    return fail("empty");
  }

  const lines = raw.split("\n");
  const extract = (prefix) => {
    let value;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith(prefix)) {
        value = trimmed.slice(prefix.length).trim();
      }
    }
    return value;
  };

  const seam = extract("SEAM:");
  const diagnosis = extract("DIAGNOSIS:");
  const proposedAction = extract("PROPOSED-ACTION:");
  const confidence = extract("CONFIDENCE:");
  const withinEnvelopeRaw = extract("WITHIN-ENVELOPE:");
  const evidenceRaw = extract("EVIDENCE:");

  const nothingParsed =
    seam === undefined &&
    diagnosis === undefined &&
    proposedAction === undefined &&
    confidence === undefined &&
    withinEnvelopeRaw === undefined &&
    evidenceRaw === undefined;
  if (nothingParsed) {
    return fail("unparseable");
  }

  if (dispatchedSeam !== undefined && seam !== dispatchedSeam) {
    return fail("seam");
  }

  const evidence =
    evidenceRaw === undefined || evidenceRaw.trim() === ""
      ? []
      : evidenceRaw
          .split(",")
          .map((entry) => entry.trim())
          .filter((entry) => entry.length > 0);
  if (evidence.length === 0) {
    return fail("evidence");
  }

  if (diagnosis === undefined || diagnosis.trim() === "") {
    return fail("diagnosis");
  }

  if (proposedAction === undefined || proposedAction.trim() === "") {
    return fail("proposedAction");
  }

  if (confidence !== "high" && confidence !== "low") {
    return fail("confidence");
  }

  return {
    verdict: {
      seam,
      diagnosis,
      proposedAction,
      confidence,
      withinEnvelope: withinEnvelopeRaw === "yes",
      evidence,
    },
    malformed: false,
    why: null,
  };
}

/**
 * Pure budget arithmetic (TSPEC §4.5, PROP-BUD-01): `true` iff either the attempt bound or the
 * wall-clock bound has been reached. `waitMs` is the check-rollup wait the driver accumulates
 * (`runAdvisorySeam` owns the counter, only A5 ever calls the `recordWait` sink) — zero at every
 * other seam — and is subtracted from `elapsedMs` before the wall-clock comparison (NFR-4's
 * rollup-wait carve-out, PROP-BUD-03).
 *
 * @param {{ attempts: number, attemptBudget: number, elapsedMs: number, waitMs: number, seamBudgetMinutes: number }} args
 * @returns {boolean}
 */
export function budgetExceeded({ attempts, attemptBudget, elapsedMs, waitMs, seamBudgetMinutes }) {
  return attempts >= attemptBudget || elapsedMs - waitMs >= seamBudgetMinutes * 60_000;
}

// ─── TSPEC §5 — envelope enforcement, refusal ladder (PLAN A-20) ───────────
//
// The frozen, ordered eight-reason catalogue (TSPEC §5.3). Order matters: `refusalReasonFor`
// returns the FIRST member of this array whose `signals` key is true, so the array's own order
// pins §5.1's evaluation precedence (T-03-5).
export const ADVISORY_REFUSAL_REASONS = Object.freeze([
  "prohibited-action",
  "revert-on-test-touch",
  "out-of-envelope",
  "post-action-verification-failed",
  "record-write-failed",
  "malformed-verdict",
  "low-confidence",
  "budget-exhausted",
]);

// The exclusion set — §5.1's evaluation order (X-a test artifacts, X-e guard paths, X-d declared
// scope, X-b DoD criteria, X-c/membership). `classifyEnvelope` iterates this array in order
// (T-03-8, PROP-ENV-04).
export const ADVISORY_EXCLUSIONS = Object.freeze(["X-a", "X-e", "X-d", "X-b", "X-c"]);

/**
 * The first matching reason, in `ADVISORY_REFUSAL_REASONS` catalogue order (TSPEC §5.3). `signals`
 * is built once, at termination, from the terminating condition — never accumulated (§4.5).
 *
 * @param {Object<string,boolean>} signals - the conditions true AT TERMINATION
 * @returns {string} the first matching reason
 */
export function refusalReasonFor(signals) {
  for (const reason of ADVISORY_REFUSAL_REASONS) {
    if (signals && signals[reason]) return reason;
  }
  return undefined;
}

// The two X-a regexes plus the shared test-config regex (TSPEC §5.2) — path-based detection.
export const TEST_PATH_RE = /(^|\/)(tests?|__tests__|spec)\//i;
export const TEST_FILE_RE = /\.(test|spec)\.[jt]sx?$|^conftest\.py$|_test\.py$|^test_.*\.py$/i;
export const TEST_CONFIG_RE = /(^|\/)(jest\.config|pytest\.ini|\.coveragerc|setup\.cfg|vitest\.config|mutmut\.ini)/i;

// X-a's seven named operations (TSPEC §5.2, FSPEC AC-3.5) — the closed set `touchesTestArtifact`'s
// operation-based branch recognises. Any other `action.op` value is not, by itself, an X-a touch.
const TEST_TOUCH_OPERATIONS = new Set([
  "edit-assertion",
  "delete-test-file",
  "delete-test-case",
  "rename-out-of-collection",
  "add-skip-marker",
  "narrow-parametrised-cases",
  "lower-threshold",
]);

/**
 * X-a — path-based AND operation-based (TSPEC §5.2). A path matching any of the three test-artifact
 * regexes is caught regardless of `action`; separately, one of the seven named operations is a touch
 * regardless of path (a coverage/mutation threshold can live in `package.json`/`pyproject.toml`,
 * neither of which matches a test path).
 *
 * @param {string[]} paths
 * @param {{op?: string}} action
 * @returns {boolean}
 */
export function touchesTestArtifact(paths, action) {
  const list = Array.isArray(paths) ? paths : [];
  if (list.some((p) => TEST_PATH_RE.test(p) || TEST_FILE_RE.test(p) || TEST_CONFIG_RE.test(p))) {
    return true;
  }
  return Boolean(action && TEST_TOUCH_OPERATIONS.has(action.op));
}

// X-b's DoD-criterion-content path fragments (TSPEC §5.2) — a threshold change in either manifest
// is a DoD-criterion touch regardless of the operation named.
const DOD_CRITERION_PATH_RE = /(^|\/)(package\.json|pyproject\.toml)$/i;

/**
 * X-b — DoD criteria / thresholds (TSPEC §5.2, §5.4 P-1). A path-and-content predicate: either the
 * path is one of the manifests a coverage/mutation threshold lives in, or the operation itself names
 * marking a DoD finding satisfied.
 *
 * @param {string[]} paths
 * @param {{op?: string}} action
 * @returns {boolean}
 */
export function touchesDodCriterion(paths, action) {
  const list = Array.isArray(paths) ? paths : [];
  if (list.some((p) => DOD_CRITERION_PATH_RE.test(p))) return true;
  return Boolean(action && action.op === "mark-criterion-satisfied");
}

/**
 * A4-1 — *branch-created* is a property of the file, not of who edited it (TSPEC §7.3): true iff
 * `path` is absent from BOTH the merge-base tree and the default-branch tip tree, via two
 * `git cat-file -e {ref}:{path}` probes. Both conjuncts are required — a file added on the default
 * branch since the merge base (absent at merge-base, present at default-tip) is NOT branch-created.
 *
 * @param {string} path
 * @param {string} mergeBase
 * @param {string} defaultTip
 * @param {(argv: string[]) => Promise<{ok: boolean}>} _git
 * @returns {Promise<boolean>}
 */
export async function branchCreated(path, mergeBase, defaultTip, _git) {
  const atMergeBase = await _git(["cat-file", "-e", `${mergeBase}:${path}`]);
  const atDefaultTip = await _git(["cat-file", "-e", `${defaultTip}:${path}`]);
  return atMergeBase.ok !== true && atDefaultTip.ok !== true;
}

/**
 * `classifyEnvelope` — one pure function, evaluated twice (TSPEC §5.1): once over the proposal
 * (step 3), once over the produced diff (step 5, E-R2/BR-3). Iterates `ADVISORY_EXCLUSIONS` in
 * order so a candidate satisfying two exclusions yields the earlier reason. Row 3 (X-e) is a
 * cite-and-reuse of Phase MERGE's `guardVerdict`/`effectiveGuardPaths` (`dev:731`, `dev:708`) —
 * no second matcher.
 *
 * @param {{action: string, paths: string[]}} candidate
 * @param {{seam: string, permittedActions: string[], declaredScope: string[], guardPaths: string[],
 *          capabilities: object}} ctx
 * @returns {{inside: boolean, reason: string|null, matched: string[]}}
 */
export function classifyEnvelope(candidate, ctx) {
  const paths = Array.isArray(candidate && candidate.paths) ? candidate.paths : [];
  const action = candidate && candidate.action;

  for (const exclusion of ADVISORY_EXCLUSIONS) {
    if (exclusion === "X-a") {
      if (touchesTestArtifact(paths, { op: action })) {
        return { inside: false, reason: "revert-on-test-touch", matched: [...paths] };
      }
    } else if (exclusion === "X-e") {
      const verdict = guardVerdict({ ok: true, files: paths }, ctx.guardPaths || []);
      if (verdict.fired) {
        return { inside: false, reason: "out-of-envelope", matched: verdict.matched };
      }
    } else if (exclusion === "X-d") {
      const scope = Array.isArray(ctx.declaredScope) ? ctx.declaredScope : [];
      const outside = paths.filter((p) => !scope.includes(p));
      if (outside.length > 0) {
        return { inside: false, reason: "out-of-envelope", matched: outside };
      }
    } else if (exclusion === "X-b") {
      if (touchesDodCriterion(paths, { op: action })) {
        return { inside: false, reason: "out-of-envelope", matched: [...paths] };
      }
    } else if (exclusion === "X-c") {
      const permitted = Array.isArray(ctx.permittedActions) ? ctx.permittedActions : [];
      if (!permitted.includes(action)) {
        return { inside: false, reason: "out-of-envelope", matched: [...paths] };
      }
    }
  }

  return { inside: true, reason: null, matched: [...paths] };
}

// ─── TSPEC §7.2 — A3's SeamOps for DoD exhaustion (PLAN A-23) ──────────────
//
// `ADVISORY_A3_CLASSES` — the frozen, set-equality-tested closed set TSPEC §7.2 A3-2 names but does
// not itself name (this file's naming decision, mirroring `ADVISORY_REFUSAL_REASONS` /
// `ADVISORY_SEAMS`).
export const ADVISORY_A3_CLASSES = Object.freeze(["real-defect", "mis-scoped-criterion", "deferral-candidate"]);

const A3_CLASS_RANK = Object.freeze({ "real-defect": 3, "mis-scoped-criterion": 2, "deferral-candidate": 1 });

const A3_FIELD_RE = {
  finding: /^FINDING:\s*(.*)$/m,
  classification: /^CLASSIFICATION:\s*(.*)$/m,
  evidence: /^EVIDENCE:\s*(.*)$/m,
  successor: /^SUCCESSOR:\s*(.*)$/m,
};

/**
 * `parseA3Classification(raw)` — TSPEC §7.2, A3-1/A3-2/A3-4. Pure and total over arbitrary agent
 * text (P-8): `raw` is repeated `FINDING:`/`CLASSIFICATION:`/`EVIDENCE:` blocks (optionally
 * `SUCCESSOR:`), one per finding, separated by a line containing exactly `---`. A block whose
 * `CLASSIFICATION` is not a member of `ADVISORY_A3_CLASSES`, or whose classification is
 * `deferral-candidate` with no `SUCCESSOR`, is dropped rather than counted — this is what keeps
 * every emitted `class` a closed-set member without a fourth, undeclared class. `complete` is
 * `classes.length === ` the number of `FINDING:` lines found in `raw` (A3-1): fewer classified
 * blocks than findings is exactly the incompleteness signal.
 *
 * @param {string} raw
 * @returns {{classes: Array<{finding: string, class: string, evidence: string, successor?: string}>, complete: boolean}}
 */
export function parseA3Classification(raw) {
  const text = String(raw ?? "");
  const findingCount = (text.match(/^FINDING:/gm) || []).length;
  const closedSet = new Set(ADVISORY_A3_CLASSES);
  const classes = [];

  for (const block of text.split(/\n---\n/)) {
    const findingMatch = A3_FIELD_RE.finding.exec(block);
    const classMatch = A3_FIELD_RE.classification.exec(block);
    if (!findingMatch || !classMatch) continue;

    const cls = classMatch[1].trim();
    if (!closedSet.has(cls)) continue;

    const successorMatch = A3_FIELD_RE.successor.exec(block);
    if (cls === "deferral-candidate" && !successorMatch) continue;

    const evidenceMatch = A3_FIELD_RE.evidence.exec(block);
    const entry = {
      finding: findingMatch[1].trim(),
      class: cls,
      evidence: evidenceMatch ? evidenceMatch[1].trim() : "",
    };
    if (successorMatch) entry.successor = successorMatch[1].trim();
    classes.push(entry);
  }

  return { classes, complete: classes.length === findingCount };
}

/**
 * `governingClass(classes)` — TSPEC §7.2 A3-7. A pure total order over a **non-empty** multiset of
 * `{class}` entries: `real-defect` > `mis-scoped-criterion` > `deferral-candidate`. The empty input
 * is unreachable by construction (A3-1 rejects as malformed any classification whose classified
 * count is below the finding count, and A3 only fires when findings are outstanding), so this
 * function names no return value for it (TSPEC §7.2, PLAN §6.5 P-9's scope).
 *
 * @param {Array<{class: string}>} classes
 * @returns {string}
 */
export function governingClass(classes) {
  const list = Array.isArray(classes) ? classes : [];
  let winner = null;
  let winnerRank = -Infinity;
  for (const entry of list) {
    const rank = A3_CLASS_RANK[entry && entry.class];
    if (rank !== undefined && rank > winnerRank) {
      winnerRank = rank;
      winner = entry.class;
    }
  }
  return winner;
}

/**
 * `summariseA3Classification(raw)` — TSPEC §7.1/§7.2 (AC-6.3), pure and total over arbitrary agent
 * text. Composes the two leaves above into the ONE string the Phase DOD halt appends: parse the
 * reply's classification blocks, take the governing class (`real-defect` > `mis-scoped-criterion` >
 * `deferral-candidate`, A3-7), and name it together with the finding that carried it and that
 * finding's evidence. Returns `""` — never `null`, never a partial sentence — when the reply
 * carries no well-formed block at all, which is exactly the byte-identical-halt case (the halt
 * `.trimEnd()`s the empty suffix away). A `deferral-candidate` winner additionally names its bound
 * successor (A3-4), so an operator reading the halt sees the deferral is not unbound.
 *
 * This is `runAdvisorySeam`'s `_summarise` seam for A3 and nothing else: the driver stays
 * seam-agnostic and the A3-specific parsing lives here, beside the two functions it composes.
 *
 * @param {string} raw
 * @returns {string}
 */
export function summariseA3Classification(raw) {
  const parsed = parseA3Classification(raw);
  if (parsed.classes.length === 0) return "";
  const governing = governingClass(parsed.classes);
  const lead = parsed.classes.find((entry) => entry.class === governing);
  if (!lead) return "";
  const evidence = lead.evidence ? ` (evidence: ${lead.evidence})` : "";
  const successor = lead.successor ? ` [successor: ${lead.successor}]` : "";
  return `${governing}: ${lead.finding}${evidence}${successor}`;
}

/**
 * `buildA3SeamOps({dodResult, codeReviewText, _readFile})` — TSPEC §7.2. `permittedActions: []`
 * (A3-6, "A3 changes no file") makes `apply`/`revert` structurally unreachable through
 * `runAdvisorySeam`'s step 6 gate (`verifyGate: null`, §5.5); both are throwing stubs so a driver
 * that mistakenly reached either fails loudly (a rejected promise) rather than silently mutating
 * the working tree (T-05-5).
 *
 * @param {{dodResult: {lastStatus: string}, codeReviewText: string, _readFile: Function}} args
 * @returns {SeamOps}
 */
export function buildA3SeamOps({ dodResult, codeReviewText, _readFile } = {}) {
  async function gatherEvidence() {
    const lastStatus = dodResult && dodResult.lastStatus;
    let text = codeReviewText;
    if (text === undefined && typeof _readFile === "function") {
      try {
        text = await _readFile();
      } catch {
        text = "";
      }
    }
    return `DOD_STATUS: ${lastStatus}\n${text || ""}`;
  }

  return {
    gatherEvidence,
    prompt: (evidence) =>
      "Classify every remaining finding as real-defect / mis-scoped-criterion / deferral-candidate, " +
      `each with evidence, and bind every deferral-candidate to a named successor.\n${evidence}`,
    conditionHolds: async () => true,
    apply: async () => {
      throw new Error("A3 seam: apply is unreachable — permittedActions is empty (A3-6)");
    },
    producedPaths: async () => [],
    revert: async () => {
      throw new Error("A3 seam: revert is unreachable — permittedActions is empty (A3-6)");
    },
    verifyGate: null,
    declaredScope: [],
    permittedActions: [],
  };
}

// ─── TSPEC §7.3/§7.4 — A4's SeamOps for a rebase conflict (PLAN A-23) ──────
//
// `readGitFileList(argv, _git)` — the shared `git … --name-only`-shaped stdout parser every A4
// member below uses: split on newline, trim, drop blanks.
async function readGitFileList(argv, _git) {
  const result = await _git(argv);
  const stdout = result && typeof result.stdout === "string" ? result.stdout : "";
  return stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * `buildA4SeamOps({mergeBase, preRebaseHead, defaultTip, planFiles, implConfig, _git, _runCommand})`
 * — TSPEC §7.3/§7.4. The conflict set and each file's A4-1 branch-created determination
 * (`branchCreated`, two `git cat-file -e` probes) are computed by `gatherEvidence`, never the
 * agent, and drive the same invocation's later `declaredScope`/`permittedActions` reads (both run
 * after `gatherEvidence` in `runAdvisorySeam`'s DIAGNOSE → GATE order). Both members are exposed as
 * the SAME mutable array `gatherEvidence` fills in place (`.length = 0` then `.push(...)`, never a
 * property reassignment) — `advisoryDriver.test.js`'s gate-exclusivity fixtures build their spy
 * wrapper via `{ ...rawSeamOps }`, a shallow copy that keeps the array *reference* but freezes any
 * plain-property or getter *value* at spread time; only a shared, in-place-mutated array reference
 * stays live through that copy. A4-2: a conflict set containing any non-branch-created file (a
 * "mixed" set) empties `permittedActions` for that invocation, so `classifyEnvelope`'s X-c refuses
 * the proposal at GATE, before `apply` is ever reached — the seam never produces a third tree state
 * (A4-6). `declaredScope` unions the PLAN files, the pre-rebase branch diff, and the conflict set's
 * non-test-artifact paths — a branch-created **test** file is deliberately excluded here (X-a
 * always outranks a permitted E-3 action, §7.3) so it is `apply`'s post-hoc `producedPaths` — not
 * `declaredScope` — that lets `classifyEnvelope`'s step-5 CHECK catch it and revert (T-06-5):
 * declaring it in scope up front would let GATE refuse it before `apply`, which would never revert
 * anything, at odds with the revert-on-test-touch contract.
 *
 * @param {{mergeBase: string, preRebaseHead: string, defaultTip: string, planFiles: string[],
 *          implConfig: {testCommand: string|null}, _git: Function, _runCommand: Function}} args
 * @returns {SeamOps}
 */
export function buildA4SeamOps({ mergeBase, preRebaseHead, defaultTip, planFiles, implConfig, _git, _runCommand } = {}) {
  const ownPlanFiles = Array.isArray(planFiles) ? planFiles : [];
  const declaredScope = [...ownPlanFiles];
  const permittedActions = ["E-3"];

  async function gatherEvidence() {
    const conflictFiles = await readGitFileList(["diff", "--name-only", "--diff-filter=U"], _git);
    const determinations = [];
    let mixed = false;
    for (const path of conflictFiles) {
      const created = await branchCreated(path, mergeBase, defaultTip, _git);
      if (!created) mixed = true;
      determinations.push({ path, branchCreated: created });
    }
    const preRebaseDiff = await readGitFileList(["diff", "--name-only", `${mergeBase}..${preRebaseHead}`], _git);
    const nonTestConflictFiles = conflictFiles.filter((p) => !touchesTestArtifact([p], {}));

    declaredScope.length = 0;
    declaredScope.push(...new Set([...ownPlanFiles, ...preRebaseDiff, ...nonTestConflictFiles]));

    permittedActions.length = 0;
    if (!(conflictFiles.length > 0 && mixed)) permittedActions.push("E-3");

    return determinations.map((d) => `${d.path}: ${d.branchCreated ? "branch-created" : "shared"}`).join("\n");
  }

  return {
    gatherEvidence,
    prompt: (evidence) => `Resolve each conflict in a branch-created file, reporting per file which side was taken and why.\n${evidence}`,
    conditionHolds: async () => {
      const current = await readGitFileList(["diff", "--name-only", "--diff-filter=U"], _git);
      return current.length > 0;
    },
    apply: async () => ({ ok: true }),
    producedPaths: async () => readGitFileList(["diff", "--name-only"], _git),
    revert: async () => {
      await _git(["rebase", "--abort"]);
    },
    verifyGate: async () => {
      const testCommand = implConfig && implConfig.testCommand;
      const hasTestCommand = typeof testCommand === "string" && testCommand.length > 0;
      if (!hasTestCommand || typeof _runCommand !== "function") {
        return { passed: false }; // TSPEC §7.4 — unverifiable ≠ resolved
      }
      const continueResult = await _git(["rebase", "--continue"]);
      if (!continueResult || continueResult.ok !== true) {
        return { passed: false, detail: continueResult && continueResult.stderr };
      }
      const testResult = await _runCommand(testCommand);
      return { passed: Boolean(testResult && testResult.ok === true) };
    },
    declaredScope,
    permittedActions,
  };
}

// ─── TSPEC §8.3 — A5's capability probes (PLAN A-24) ───────────────────────
//
// Both are per-repo runtime facts, probed once per A5 invocation through the
// existing `_ghRun` seam — no new credential, no new transport (NFR-5). These
// are reads that classify a failure, not new capabilities that can act; BL-06's
// `--dry-run` is the one probe against a write surface, and the write itself
// happens only inside `verifyGate` under E-1.

/** BL-05 — can the default branch's check runs be read for the comparison? */
export async function probeDefaultBranchChecks(defaultBranch, { _ghRun } = {}) {
  const reply = await _ghRun(
    `gh run list --branch ${defaultBranch} --json conclusion,workflowName,headSha`
  );
  if (!reply || reply.ok !== true) return { available: false, runs: [] };
  try {
    const parsed = JSON.parse(String(reply.stdout || "").trim());
    return Array.isArray(parsed)
      ? { available: true, runs: parsed }
      : { available: false, runs: [] };
  } catch {
    return { available: false, runs: [] };
  }
}

/** BL-06 — can a failed workflow run be re-run? Dry-run first; on refusal the
 *  `actions:write` scope in `gh auth status` is the fallback determination. */
export async function probeWorkflowRerun(runId, { _ghRun } = {}) {
  const idPart = runId ? ` ${runId}` : "";
  const dryRun = await _ghRun(`gh run rerun --failed${idPart} --dry-run`);
  if (dryRun && dryRun.ok === true) return { available: true };
  const auth = await _ghRun("gh auth status");
  const scoped =
    auth && auth.ok === true && /actions:\s*write|actions:write/.test(String(auth.stdout || ""));
  return { available: Boolean(scoped) };
}

// ─── TSPEC §8.2 — A5's SeamOps (PLAN A-24) ─────────────────────────────────
//
// Async because BL-05/BL-06 probing is IO (§8.3): both capability
// determinations and the default-branch comparison are computed before the
// agent is ever dispatched, and A5-1's ordering (comparison before E-2's
// *introduced* test) is why the comparison lives here rather than in the gate.
// `recordWait` is §4.3's sink — A5 is the only seam that calls it, once per
// re-poll, so the CI wait is carved out of the wall-clock budget (A5-3).

/**
 * `makeWaitAccumulator()` — TSPEC §4.3/§4.5's rollup-wait counter, as one object with the two
 * halves the two ends of the seam need: `recordWait(ms)` is handed to `buildA5SeamOps` (the only
 * seam that calls it), and `waitMs()` is handed to `runAdvisorySeam` as its `_waitMs` reader, whose
 * value is the `waitMs` argument the driver passes to `budgetExceeded` (the surface PROP-BUD-03
 * pins). One accumulator per seam INVOCATION, created by whichever composition root constructs the
 * seam — `waitMs` is deliberately not a tenth `SeamOps` member (§4.3).
 *
 * Negative, non-finite and non-numeric durations are ignored rather than corrupting the counter:
 * `nowSafe()` returns 0 where no clock is available, so a re-poll can legitimately report `0 - 0`.
 *
 * @returns {{recordWait: (ms: number) => void, waitMs: () => number}}
 */
export function makeWaitAccumulator() {
  let total = 0;
  return {
    recordWait: (ms) => {
      const value = Number(ms);
      if (Number.isFinite(value) && value > 0) total += value;
    },
    waitMs: () => total,
  };
}

export async function buildA5SeamOps({
  feature,
  prUrl,
  preSeamHead,
  defaultBranch,
  mergeBase,
  recordWait,
  _git,
  _ghRun,
  _checkCi,
} = {}) {
  const bl05 = await probeDefaultBranchChecks(defaultBranch, { _ghRun });
  const bl06 = await probeWorkflowRerun(undefined, { _ghRun });

  // A5-1 — the default-branch comparison, authoritative on the reading it gets.
  const tipRun = bl05.runs.length > 0 ? bl05.runs[0] : null;
  const preExisting = Boolean(tipRun && tipRun.conclusion !== "success");
  // E-2's conjunct (i) needs a default-branch reading BEYOND the merge base: a
  // latest reading AT the merge base cannot certify that the branch introduced
  // the failure, so E-2 drops from this invocation's permitted set.
  const e2Uncertified = Boolean(
    tipRun && tipRun.conclusion === "success" && tipRun.headSha === mergeBase
  );

  const permittedActions = [];
  if (bl05.available) {
    if (bl06.available) permittedActions.push("E-1");
    if (!e2Uncertified) permittedActions.push("E-2");
  }

  const declaredScope = await readGitFileList(
    ["diff", "--name-only", `${mergeBase}..HEAD`],
    _git
  );

  // A5-8 — revert is PRE-PUSH only: once `verifyGate` has pushed, nothing is
  // force-pushed and no history is rewritten; the escalation inherits the
  // pushed fix commit legibly instead.
  let pushed = false;
  let lastAction = null;

  // The workflow runtime forbids an ambient clock; the sink still gets called
  // once per re-poll with the best duration available (0 where no clock is).
  function nowSafe() {
    try {
      return Date.now();
    } catch {
      return 0;
    }
  }

  async function rePoll() {
    let status;
    const t0 = nowSafe();
    try {
      status = await _checkCi(prUrl);
    } catch {
      // §8.2 — Phase PUB's completion cap signals by throwing; the seam
      // consumes the attempt instead of escalating separately (T-07-11).
      if (typeof recordWait === "function") recordWait(nowSafe() - t0);
      return { passed: false, consumesAttempt: true, detail: "completion cap reached" };
    }
    if (typeof recordWait === "function") recordWait(nowSafe() - t0);
    return { passed: status === "passed", consumesAttempt: true, detail: `re-poll: ${status}` };
  }

  return {
    gatherEvidence: async () => {
      // A5-5 — an unretrievable log short-circuits before any dispatch: no
      // diagnosis is ever produced from a guess.
      const log = await _ghRun("gh run view --log-failed");
      if (!log || log.ok !== true) {
        return { __preDispatch: { outcome: "escalated", reason: "out-of-envelope" } };
      }
      // A5-2 — BL-05 absent: the comparison is undone; escalate attempting no fix.
      if (!bl05.available) {
        return { __preDispatch: { outcome: "escalated", reason: "out-of-envelope" } };
      }
      // A5-1 — observed failing at the default-branch tip: pre-existing.
      if (preExisting) {
        return { __preDispatch: { outcome: "escalated", reason: "out-of-envelope" } };
      }
      return { log: String(log.stdout || "") };
    },
    prompt: (evidence) =>
      [
        `CI for ${feature} (${prUrl}) is red. Name the failing step and its cause, and classify:`,
        `E-1 (flaky — a re-run should pass), E-2 (branch-introduced lint/format/type fix), or neither.`,
        `Failing job log:`,
        evidence && evidence.log ? evidence.log : "",
      ].join("\n"),
    conditionHolds: async () => (await _checkCi(prUrl)) === "failed",
    apply: async (verdict) => {
      lastAction = verdict ? verdict.proposedAction : null;
      if (lastAction === "E-1") return { ok: true }; // nothing to write — the act is the re-run
      const commit = await _git([
        "commit",
        "-m",
        `advisory(A5): ${feature} — branch-introduced CI fix`,
      ]);
      return { ok: Boolean(commit && commit.ok === true) };
    },
    producedPaths: async () =>
      readGitFileList(["diff", "--name-only", `${preSeamHead}..HEAD`], _git),
    revert: async () => {
      if (pushed) return; // A5-8 — post-push, the record and report carry the state instead
      await _git(["reset", "--hard", preSeamHead]);
    },
    verifyGate: async () => {
      if (lastAction === "E-1") {
        const rerun = await _ghRun("gh run rerun --failed");
        if (!rerun || rerun.ok !== true) {
          return { passed: false, consumesAttempt: true, detail: "re-run refused" };
        }
        return rePoll();
      }
      const push = await _git(["push"]);
      if (!push || push.ok !== true) {
        return {
          passed: false,
          consumesAttempt: true,
          detail: `push rejected: ${String((push && push.stderr) || "").trim()}`,
        };
      }
      pushed = true;
      return rePoll();
    },
    declaredScope,
    permittedActions,
  };
}

// ─── TSPEC §9 — the advisory record (PLAN A-21) ────────────────────────────
//
// `docs/{feature}/ADVISORY-{feature}.md` — append-only, one `##` entry per invocation, in
// occurrence order (R-3). Seven declared fields, matching §10.1's escalation-log table
// one-for-one (TSPEC §9.1): Seam, Confidence, Envelope, Disposition, Model — a `| Field | Value
// |` table — plus **Diagnosis.** and **Evidence.** prose sections.

// A single line never carries an embedded raw newline into the record's line grammar
// (PROP-REC-08/P-6) — every field body is passed through this before being interpolated.
function advisoryEntrySingleLine(value) {
  return String(value).replace(/\r?\n/g, " ");
}

/**
 * `renderAdvisoryEntry(disposition, { now })` — pure (TSPEC §9.1, PROP-REC-01): takes the
 * timestamp rather than reading a clock, so the rendered bytes are testable exactly. When
 * `disposition.verdict` is `null` (an escalation that never reached a well-formed verdict),
 * Confidence/Envelope fall back to `"n/a"`, Diagnosis to `"no verdict was produced"`, and
 * Evidence to `"(none)"` — the totality claim (P-6) requires the renderer never throw on this
 * case. The Model field carries the literal suffix `" (fallback)"` when `disposition.fallback`
 * is true (PROP-REC-07) — the fallback readable off the record as well as off the summary (M-2).
 *
 * @param {{seam: string, outcome: string, reason: string|null, verdict: object|null,
 *          attempts: number, model: string, fallback: boolean}} disposition
 * @param {{now: string}} opts - `now` is an already-formatted timestamp string
 * @returns {string}
 */
export function renderAdvisoryEntry(disposition, { now }) {
  const { seam, outcome, reason, verdict, model, fallback } = disposition;

  const dispositionValue =
    outcome === "escalated" && reason ? `${outcome} — ${reason}` : outcome;
  const confidence = verdict ? verdict.confidence : "n/a";
  const envelope = verdict ? (verdict.withinEnvelope ? "in" : "out") : "n/a";
  const diagnosis = verdict ? verdict.diagnosis : "no verdict was produced";
  const evidence =
    verdict && Array.isArray(verdict.evidence) && verdict.evidence.length > 0
      ? verdict.evidence
      : ["(none)"];
  const modelValue = fallback ? `${model} (fallback)` : model;

  const lines = [
    `## ${now} — ${seam} — ${outcome}`,
    "",
    "| Field | Value |",
    "|---|---|",
    `| Seam | ${seam} |`,
    `| Confidence | ${advisoryEntrySingleLine(confidence)} |`,
    `| Envelope | ${envelope} |`,
    `| Disposition | ${advisoryEntrySingleLine(dispositionValue)} |`,
    `| Model | ${advisoryEntrySingleLine(modelValue)} |`,
    "",
    `**Diagnosis.** ${advisoryEntrySingleLine(diagnosis)}`,
    "",
    "**Evidence.**",
    ...evidence.map((e) => `- ${advisoryEntrySingleLine(e)}`),
    "",
  ];
  return lines.join("\n");
}

/**
 * `appendAdvisoryEntry` — the step-7 primitive (TSPEC §9.2). Throws on write failure; the
 * driver's step 7 catches and refuses `record-write-failed` (§4.4). Written for EVERY terminal
 * disposition including `no-action` (R-4) — the record is not escalation-only, unlike §10's log.
 *
 * @param {{feature: string, disposition: object, _appendFile: function, _now: function}} args
 * @returns {Promise<void>}
 */
export async function appendAdvisoryEntry({ feature, disposition, _appendFile, _now }) {
  const now = _now();
  const entry = renderAdvisoryEntry(disposition, { now });
  const path = `docs/${feature}/ADVISORY-${feature}.md`;
  await _appendFile(path, entry);
}

/**
 * `advisorySummaryRows(dispositions)` — pure (TSPEC §9.4). `ADVISORY_SEAMS` drives the row list
 * (S-1), so five rows always appear and a seam that never fired is visibly zero. The per-row and
 * total identity `invocations === resolved + escalated + noAction` holds by construction. Each
 * row also carries the `model`/`fallback` of its LAST invocation (S-2) — undefined/falsy when the
 * seam never fired.
 *
 * **S-3** — `noChecks` and `completionCap` are threaded in from `raisePrAndVerifyCi` (§8.1) and
 * named on the summary itself, so A5-6 ("no check ever registered") and A5-9 ("checks registered
 * and never completed") are distinguishable, by an operator reading the report alone, from an A5
 * row that is zero because the seam simply never fired. Both default to `false`, so every existing
 * caller — and every pure unit test of this function — is unchanged.
 *
 * @param {Array<{seam: string, outcome: string, model?: string, fallback?: boolean}>} dispositions
 * @param {{noChecks?: boolean, completionCap?: boolean}} [pubOutcome]
 * @returns {{rows: Array<object>, total: object, noChecks: boolean, completionCap: boolean}}
 */
export function advisorySummaryRows(dispositions, pubOutcome = {}) {
  const list = Array.isArray(dispositions) ? dispositions : [];

  const rows = ADVISORY_SEAMS.map((seam) => {
    const forSeam = list.filter((d) => d && d.seam === seam);
    const resolved = forSeam.filter((d) => d.outcome === "resolved").length;
    const escalated = forSeam.filter((d) => d.outcome === "escalated").length;
    const noAction = forSeam.filter((d) => d.outcome === "no-action").length;
    const last = forSeam.length > 0 ? forSeam[forSeam.length - 1] : null;
    return {
      seam,
      invocations: forSeam.length,
      resolved,
      escalated,
      noAction,
      model: last ? last.model : undefined,
      fallback: last ? last.fallback : undefined,
    };
  });

  const total = rows.reduce(
    (acc, row) => ({
      invocations: acc.invocations + row.invocations,
      resolved: acc.resolved + row.resolved,
      escalated: acc.escalated + row.escalated,
      noAction: acc.noAction + row.noAction,
    }),
    { invocations: 0, resolved: 0, escalated: 0, noAction: 0 }
  );

  return {
    rows,
    total,
    noChecks: Boolean(pubOutcome && pubOutcome.noChecks),
    completionCap: Boolean(pubOutcome && pubOutcome.completionCap),
  };
}

// ─── TSPEC §10 — the escalation log and report notices (PLAN A-21) ────────
//
// `docs/_queue/ESCALATIONS.md` — a single, non-feature-scoped, append-only log (TSPEC §10.1),
// newest-last (L-1). Eight declared fields, the one-sentence decision statement first (L-2).
const ESCALATIONS_PATH = "docs/_queue/ESCALATIONS.md";

/**
 * `renderEscalationEntry(disposition, ctx, { now })` — pure, mirroring `renderAdvisoryEntry`
 * (TSPEC §10.1). Unlike the advisory record's `now`, this `now` is a millisecond epoch value
 * (matching `_now()`'s existing convention elsewhere in this module) and is rendered via
 * `new Date(now).toISOString()`.
 *
 * @param {{reason: string|null, verdict: object|null}} disposition
 * @param {{feature: string, seam: string, phase: string, phaseOutcome: string, decision: string}} ctx
 * @param {{now: number}} opts
 * @returns {string}
 */
export function renderEscalationEntry(disposition, ctx, { now }) {
  const { reason, verdict } = disposition;
  const { feature, seam, phase, phaseOutcome, decision } = ctx;
  const iso = new Date(now).toISOString();

  const diagnosis = verdict ? verdict.diagnosis : "no verdict was produced";
  const proposedAction = verdict ? verdict.proposedAction : "(none)";
  const evidence =
    verdict && Array.isArray(verdict.evidence) && verdict.evidence.length > 0
      ? verdict.evidence
      : ["(none)"];

  const lines = [
    `## ${iso} — ${feature} — ${seam}`,
    "",
    `**Decide:** ${advisoryEntrySingleLine(decision)}`,
    "",
    "| Field | Value |",
    "|---|---|",
    `| Feature | ${feature} |`,
    `| Seam | ${seam} |`,
    `| Refusal reason | ${advisoryEntrySingleLine(reason ?? "n/a")} |`,
    "",
    `**Diagnosis.** ${advisoryEntrySingleLine(diagnosis)}`,
    "",
    `**Proposed action.** ${advisoryEntrySingleLine(proposedAction)}`,
    "",
    "**Evidence.**",
    ...evidence.map((e) => `- ${advisoryEntrySingleLine(e)}`),
    "",
    `**Pipeline state.** ${phase} — ${phaseOutcome}`,
    "",
  ];
  return lines.join("\n");
}

/**
 * `appendEscalationEntry` — TSPEC §10.1. Uses `_appendFile` (`defaultAppendFile`, which now
 * creates `docs/_queue/` when absent). Called OUTSIDE the try/catch that governs the seam's
 * action (T-09-8): a throw here is caught by the CALLER, pushed onto `notices`, and the
 * disposition is never upgraded to `resolved` on account of it — the asymmetry with a failed
 * record write (§9.2, R-2), which does revert.
 *
 * @param {{disposition: object, ctx: object, _appendFile: function, _now: function}} args
 * @returns {Promise<void>}
 */
export async function appendEscalationEntry({ disposition, ctx, _appendFile, _now }) {
  const now = _now();
  const entry = renderEscalationEntry(disposition, ctx, { now });
  await _appendFile(ESCALATIONS_PATH, entry);
}

/**
 * `ADVISORY_SEAM_PHASES` — TSPEC §10.1's *Pipeline state* field is "the phase id and that phase's
 * outcome", and both are properties of the SEAM, not of the call site: each seam fires in exactly
 * one phase (§6.1 queue-side, §7.1 Phase DOD, §8.1 Phase PUB) and each phase has exactly one
 * outcome on the escalation path — the dev-side seams sit immediately before a `throw haltError`,
 * the queue-side seams before a `continue` that skips the candidate. Deriving it here rather than
 * asking every call site to repeat it is what keeps the field from drifting per call site.
 */
// (The member is deliberately named `id`, not the obvious `phase`: `dodPhase.test.js` locates
// `PHASE_DISPATCH.DOD` by source-scanning for a `phase`-keyed "DOD" pair, and a second object
// carrying that same pair earlier in the file would be found first — a naming collision, not a
// behavioural one, but a red suite either way.)
const ADVISORY_SEAM_PHASES = Object.freeze({
  A1: Object.freeze({ id: "QUEUE", outcome: "skipped" }),
  A2: Object.freeze({ id: "QUEUE", outcome: "skipped" }),
  A3: Object.freeze({ id: "DOD", outcome: "halted" }),
  A4: Object.freeze({ id: "DOD", outcome: "halted" }),
  A5: Object.freeze({ id: "PUB", outcome: "halted" }),
});

/**
 * `escalationDecision(...)` — TSPEC §10.1's L-2 field: the ONE sentence naming what the operator
 * must decide, written first so the log reads as a decision queue rather than a diagnostic dump.
 * Pure and total: an escalation that never reached a well-formed verdict has no proposed action to
 * name, and says so rather than interpolating `undefined`.
 *
 * `classificationSummary`, when the seam produced one (A3 — see `summariseA3Classification`), is
 * named in the same sentence: the class the tier assigned is the single most decision-relevant
 * fact an operator reading this log needs, and carrying it here keeps §10.1's eight declared
 * fields exactly eight rather than growing a ninth.
 *
 * @param {{seam: string, feature: string, reason: string|null, verdict: object|null,
 *          classificationSummary?: string}} args
 * @returns {string}
 */
export function escalationDecision({ seam, feature, reason, verdict, classificationSummary }) {
  const proposal =
    verdict && verdict.proposedAction ? `"${verdict.proposedAction}"` : "no well-formed proposal";
  const classified = classificationSummary ? `; classified ${classificationSummary}` : "";
  return (
    `whether to take the ${seam} proposal for ${feature} yourself (${proposal}) — ` +
    `the advisory tier refused it as ${reason ?? "unclassified"} and changed nothing${classified}`
  );
}

// ─── TSPEC §4.4 — runAdvisorySeam, the one impure component (PLAN A-22) ────
//
// TSPEC §5.4 ("Prohibitions — structural, not asserted") makes P-1…P-4 unreachable through the
// EXISTING mechanisms `classifyEnvelope` already owns (X-b, X-d/membership, and simply never
// wiring a capability) rather than a dedicated matcher, and `advisoryEnvelope.test.js` (A-06)
// says so explicitly: that file's `classifyEnvelope` never emits `"prohibited-action"` as its own
// `reason`, and disclaims P-1…P-4 as living here instead. This driver therefore carries a small,
// independent, PROSE-based recognizer, `isProhibitedAction`, run at step 3 GATE ahead of
// `classifyEnvelope` — a defense-in-depth check of the verdict's own claim that does not trust
// `seamOps.permittedActions` to have refused it (PLAN A-22's `advisoryDriver.test.js` REASON_FIXTURES
// "prohibited-action" fixture deliberately declares the prohibited sentence as *permitted* on the
// fake seam, to prove the driver refuses it anyway).
const PROHIBITED_ACTION_PATTERNS = [
  // P-1 — mark/weaken/reduce a DoD criterion or the iteration count.
  /\b(mark|weaken|reduce)\b[\s\S]*\b(dod|definition of done)\b/i,
  /\bdefinition of done\b[\s\S]*\b(satisfied|weaken|reduce)/i,
  // P-2 — set ready: true on a REQ.
  /\bready\s*:\s*true\b/i,
  // P-3 — declare CI passed.
  /\bdeclare\b[\s\S]*\bci\b[\s\S]*\bpassed\b/i,
  // P-4 — merge a PR, or alter a queue Status cell.
  /\bmerge\b[\s\S]*\b(pr|pull request)\b/i,
  /\balter\b[\s\S]*\bqueue\b[\s\S]*\bstatus\b/i,
];

/**
 * @param {string} proposedAction
 * @returns {boolean}
 */
export function isProhibitedAction(proposedAction) {
  const text = String(proposedAction || "");
  return PROHIBITED_ACTION_PATTERNS.some((re) => re.test(text));
}

/**
 * @typedef {Object} SeamOps                  TSPEC §4.3. One implementation per seam.
 * @property {() => Promise<string>}            gatherEvidence
 * @property {(evidence: string) => string}     prompt
 * @property {() => Promise<boolean>}           conditionHolds
 * @property {(v: AdvisoryVerdict) => Promise<{ok: boolean, why?: string}>} apply
 * @property {() => Promise<string[]>}          producedPaths
 * @property {() => Promise<void>}              revert
 * @property {null | (() => Promise<{passed: boolean, detail?: string}>)} verifyGate
 * @property {string[]}                         declaredScope
 * @property {string[]}                         permittedActions
 */

/**
 * `runAdvisorySeam` — TSPEC §4.4, the tier's one impure component. Runs the seven-step lifecycle
 * (DIAGNOSE, VALIDATE, GATE, RE-CHECK, ACT, CHECK, VERIFY, RECORD — eight `_log` tokens; GATE
 * covers both the prohibition check and `classifyEnvelope` + confidence, one `_log("GATE")` call)
 * against an injected `SeamOps`. A disabled config (see `parseAdvisoryConfig`) returns before any
 * dispatch or rung resolution (D-1, D-2). The attempt loop (DIAGNOSE+VALIDATE) races each dispatch against a
 * wall-clock deadline (`_sleep`) so a preemption can end an in-flight attempt (V-5); `attempts`
 * counts only DIAGNOSE/VALIDATE cycles that did NOT yield a well-formed verdict — a verdict
 * obtained on the first try leaves `attempts === 0` (RE-CHECK's "no attempt consumed" reading,
 * TSPEC §4.4 last row). A single-attempt budget whose one response is malformed reports
 * `malformed-verdict` (this file's header interpretive decision 2); every other budget exhaustion
 * — multiple malformed attempts, or a wall-clock preemption — reports `budget-exhausted`.
 *
 * `seamOps.revert()` throwing is never absorbed by the terminal catch (BR-5: an unrevertable tree
 * halts rather than silently resolving as an ordinary escalation) — every revert call is routed
 * through `doRevert`, which tags a thrown error before rethrowing, and the terminal catch rethrows
 * anything so tagged instead of mapping it to `escalated`.
 *
 * Three optional seams, all defaulted so no existing caller changes shape:
 *
 * - `_notice` — the run report's notice channel (TSPEC §10.2 N-4). Every `escalated` terminal
 *   disposition pushes `ADVISORY_ESCALATIONS.seam(...)` onto it, and a failed escalation-log write
 *   is downgraded onto it too. Defaults to a no-op.
 * - `_waitMs` — the §4.3 rollup-wait reader (see `makeWaitAccumulator`). Defaults to `() => 0`,
 *   which is exactly right for A1–A4: only A5 ever calls `recordWait`.
 * - `_summarise` — an optional `(raw) => string` over the LAST well-formed agent reply, whose
 *   result rides on the terminal disposition as `classificationSummary`. A3's Phase DOD halt reads
 *   it (AC-6.3); every other seam leaves it unset, so the key is absent rather than `undefined`.
 *
 * @param {{seam: string, feature: string, seamOps: SeamOps, config: object, rungState: object,
 *          _agent: Function, _appendFile: Function, _writeFile: Function, _readFile: Function,
 *          _git: Function, _log: Function, _now: Function, _sleep: Function, _notice: Function,
 *          _waitMs: Function, _summarise: Function}} args
 * @returns {Promise<{outcome: string, reason: string|null, verdict: object|null, attempts: number,
 *          model: string|undefined, fallback: boolean, seam: string, classificationSummary?: string}>}
 */
export async function runAdvisorySeam({
  seam,
  feature,
  seamOps,
  config,
  rungState,
  _agent,
  _appendFile,
  _writeFile,
  _readFile,
  _git,
  _log,
  _now = () => Date.now(),
  _sleep = sleep,
  _notice,
  _waitMs,
  _summarise,
}) {
  const log = typeof _log === "function" ? _log : () => {};
  const notice = typeof _notice === "function" ? _notice : () => {};
  const readWaitMs = typeof _waitMs === "function" ? _waitMs : () => 0;
  // The summary of the last well-formed reply this invocation saw. A later malformed attempt never
  // erases an earlier classification: the halt should carry whatever the seam did manage to learn.
  let summary = "";
  // Hoisted out of the `try` below so the TSPEC §17.3 terminal catch can terminate with the state
  // the invocation actually had — the last computed refusal reason, the last parsed verdict and the
  // real attempt count — instead of discarding all three.
  let lastReason = null;
  let attempts = 0;
  let verdict = null;

  if (!config || config.enabled === false) {
    return { outcome: "no-action", reason: null, verdict: null, attempts: 0, model: undefined, fallback: false, seam };
  }

  // Rung resolution (TSPEC §3.4/§4.4 entry row: resolved before any dispatch, once per run) is
  // deliberately NOT a discrete probe dispatch here — TSPEC §3.4's own header says non-resolution
  // is detected "by classifying the rejection of the real dispatch... never a separate probe".
  // `resolveAdvisoryRung` (module scope, above) IS that real dispatch, and is the ONE ladder: this
  // driver holds no private copy of it. Attempt 1 of the DIAGNOSE loop carries the M-1/M-2 fallback
  // ladder inline (so it consumes exactly one `_agent` call on the happy path, not two), and every
  // later attempt in the same seam invocation reuses the now-cached `rungState.resolved` rung
  // directly. `rungState` is the caller's memo, so a whole PT-phase run resolves the rung once
  // across every seam it dispatches, per §3.4's "lazy, once per run".
  //
  // The single refusal-reason resolver (AC-3.6, TSPEC §5.3). Every escalation below states the
  // conditions true AT TERMINATION as a signal set and lets `refusalReasonFor` pick the first match
  // in `ADVISORY_REFUSAL_REASONS`' own order — so re-ordering that catalogue re-orders the shipped
  // precedence, which is the whole point of declaring it ordered. `lastReason` remembers what it
  // last resolved, for TSPEC §17.3's terminal catch (below), which reports the last computed
  // refusal reason or `budget-exhausted` when none was computed.
  function refuse(signals) {
    lastReason = refusalReasonFor(signals) ?? "budget-exhausted";
    return lastReason;
  }

  // Every `seamOps.revert()` call goes through here so a thrown revert failure can be
  // distinguished, downstream, from an ordinary unclassified throw (BR-5).
  async function doRevert() {
    try {
      await seamOps.revert();
    } catch (err) {
      if (err && typeof err === "object") err.__isRevertFailure = true;
      throw err;
    }
  }

  // Step 7 RECORD, for every terminal disposition (R-4) — including `no-action` and every
  // escalation, not only `resolved`. A write failure reverts (when the action had already been
  // applied) and overrides the outcome/reason to `escalated` / `record-write-failed` (§4.6).
  async function terminate({ outcome, reason, verdict, attempts, appliedSuccessfully }) {
    let finalOutcome = outcome;
    let finalReason = reason;
    log("RECORD");
    const disposition = {
      seam,
      outcome: finalOutcome,
      reason: finalReason,
      verdict,
      attempts,
      model: rungState.resolved ? rungState.resolved.model : undefined,
      fallback: rungState.resolved ? rungState.resolved.fallback : false,
    };
    try {
      await appendAdvisoryEntry({ feature, disposition, _appendFile, _now });
    } catch {
      if (appliedSuccessfully) await doRevert();
      finalOutcome = "escalated";
      finalReason = "record-write-failed";
    }
    const terminal = {
      seam,
      outcome: finalOutcome,
      reason: finalReason,
      verdict,
      attempts,
      model: rungState.resolved ? rungState.resolved.model : undefined,
      fallback: rungState.resolved ? rungState.resolved.fallback : false,
      // AC-6.3 — present only when a `_summarise` seam produced something, so a seam without one
      // carries no key at all rather than an `undefined` the halt would have to `?? ""` away.
      ...(summary ? { classificationSummary: summary } : {}),
    };

    // ── TSPEC §10.1 — the escalation output, for EVERY `escalated` terminal disposition ────────
    // `appendEscalationEntry` runs OUTSIDE the try/catch that governs the seam's ACTION: the local
    // catch below can only ever downgrade its throw to a report notice, so a failed log write can
    // never revert anything and can never upgrade an escalation to a resolution (T-09-8's
    // asymmetry with §9.2's record write, which does revert). The `ADVISORY ESCALATION:` notice
    // (§10.2 N-2/N-4) accompanies the entry whether or not the write itself succeeded — the
    // operator is told the seam escalated even when the log could not be reached.
    if (finalOutcome === "escalated") {
      const placement = ADVISORY_SEAM_PHASES[seam];
      try {
        await appendEscalationEntry({
          disposition: terminal,
          ctx: {
            feature,
            seam,
            phase: placement ? placement.id : "unknown",
            phaseOutcome: placement ? placement.outcome : "unknown",
            decision: escalationDecision({
              seam,
              feature,
              reason: finalReason,
              verdict,
              classificationSummary: summary,
            }),
          },
          _appendFile,
          _now,
        });
      } catch (err) {
        notice(
          `ADVISORY escalation log write failed for seam ${seam}: ${
            err && err.message ? err.message : String(err)
          }`
        );
      }
      notice(ADVISORY_ESCALATIONS.seam({ seam, feature, reason: finalReason }));
    }

    return terminal;
  }

  const totalBudgetMs = config.seamBudgetMinutes * 60_000;

  // The wall-clock deadline (V-5) is constructed FRESH on every attempt, and — critically — only
  // AFTER `dispatched` has already been constructed for that same attempt. `Promise.race` breaks
  // ties between two promises that settle at the same microtask hop-depth in FAVOUR of whichever
  // one's underlying async work was *invoked* first (its settlement microtask lands earlier in the
  // FIFO queue): with the doubles' `_agent`/`_sleep` both settling synchronously (no real
  // wall-clock wait) at the same hop depth, constructing `dispatched` first is what lets an
  // ordinary attempt win the race on every call — constructing the deadline first (or once,
  // up-front, reused across attempts) would either spuriously preempt every attempt, or — once
  // reused past its own settlement — spuriously preempt every attempt after the first. Only a
  // dispatch that genuinely never settles (T-02-5's `neverResolves`) lets the deadline win.
  // `budgetExceeded`'s own `elapsedMs` argument is therefore 0 for every attempt-loop call below
  // (see its call sites) — wall-clock exhaustion is enforced solely by this per-attempt race,
  // `attemptBudget` exhaustion by the loop's own attempt counter.
  try {
    // ── DIAGNOSE + VALIDATE — the attempt loop ──────────────────────────
    // The loop encloses steps 1–6, not only DIAGNOSE/VALIDATE: A5-3 defines
    // one attempt as one act → re-poll cycle, so a `verifyGate` failure that
    // declares `consumesAttempt: true` re-enters here (see VERIFY below).
    // Every other step's failure path returns, so for the seams whose gates
    // never set that flag the loop still executes each step at most once.
    while (true) {
      log("DIAGNOSE");
      const evidence = await seamOps.gatherEvidence();

      // A seam may decide, from evidence alone, that no dispatch can be
      // justified (A5-5's unretrievable log, A5-2's undone comparison, A5-1's
      // pre-existing failure): `{ __preDispatch: { outcome, reason } }`
      // terminates with no agent call and no verdict.
      if (evidence && typeof evidence === "object" && evidence.__preDispatch) {
        const pre = evidence.__preDispatch;
        return await terminate({
          outcome: pre.outcome,
          reason: pre.reason ?? null,
          verdict: null,
          attempts,
          appliedSuccessfully: false,
        });
      }

      const promptText = seamOps.prompt(evidence);

      // `dispatched` is constructed BEFORE `deadline` on every iteration — see the comment above.
      // already {kind:...}-shaped or a halt rejection
      const dispatched = resolveAdvisoryRung({ _agent, _log: log, _state: rungState, prompt: promptText });
      const deadline = _sleep(totalBudgetMs).then(() => ({ kind: "preempted" }));
      const raced = await Promise.race([dispatched, deadline]);

      if (raced.kind === "preempted") {
        attempts += 1; // the in-flight attempt counts as consumed by the preemption (T-02-5)
        return await terminate({ outcome: "escalated", reason: refuse({ "budget-exhausted": true }), verdict: null, attempts, appliedSuccessfully: false });
      }

      log("VALIDATE");

      if (raced.kind === "dispatch-error") {
        attempts += 1;
        if (
          budgetExceeded({
            attempts,
            attemptBudget: config.attemptBudget,
            elapsedMs: 0,
            waitMs: readWaitMs(),
            seamBudgetMinutes: config.seamBudgetMinutes,
          })
        ) {
          return await terminate({ outcome: "escalated", reason: refuse({ "budget-exhausted": true }), verdict: null, attempts, appliedSuccessfully: false });
        }
        continue;
      }

      // AC-6.3 — the optional per-seam summariser runs over the RAW reply, before the generic
      // verdict parse decides anything: A3's classification blocks travel alongside the verdict
      // trailer in one reply, and a reply whose trailer is malformed can still have carried a
      // usable classification. `_summarise` is pure and total by contract; a throwing one is
      // absorbed here rather than escalating the seam over a report-only field.
      if (typeof _summarise === "function") {
        try {
          const produced = _summarise(raced.raw);
          if (typeof produced === "string" && produced !== "") summary = produced;
        } catch {
          // report-only: a summariser fault never changes the disposition
        }
      }

      const parsed = parseAdvisoryVerdict(raced.raw, seam);
      if (parsed.malformed) {
        attempts += 1;
        if (
          budgetExceeded({
            attempts,
            attemptBudget: config.attemptBudget,
            elapsedMs: 0,
            waitMs: readWaitMs(),
            seamBudgetMinutes: config.seamBudgetMinutes,
          })
        ) {
          // BOTH signals are true here whenever the single-attempt budget is what ran out, so
          // which one is reported is decided by `ADVISORY_REFUSAL_REASONS`' order — `malformed-
          // verdict` precedes `budget-exhausted`, hence this file's header interpretive decision 2
          // (a one-attempt budget whose one response is unparseable reports the malformed response,
          // not the exhausted budget). Re-ordering the catalogue re-orders this outcome.
          const reason = refuse({ "malformed-verdict": attempts === 1, "budget-exhausted": true });
          return await terminate({ outcome: "escalated", reason, verdict: null, attempts, appliedSuccessfully: false });
        }
        continue;
      }

      verdict = parsed.verdict;

    // ── step 3b RE-CHECK — the seam condition may already be gone (V-7, R-4) ────────────────
    // Runs BEFORE the gate: a condition that has resolved itself is `no-action`
    // whatever the envelope would have said about the proposal — the world's
    // state outranks a judgment about a fix the world no longer needs
    // (T-07-2's conjunct-iii pins this against conjunct-i's gate refusal).
    log("RE-CHECK");
    const holds = await seamOps.conditionHolds();
    if (!holds) {
      return await terminate({ outcome: "no-action", reason: null, verdict, attempts, appliedSuccessfully: false });
    }

    // ── step 3 GATE — prohibitions, classifyEnvelope, confidence (V-1, BR-2) ────────────────
    log("GATE");

    const gateCtx = {
      seam,
      permittedActions: seamOps.permittedActions,
      declaredScope: seamOps.declaredScope,
      guardPaths: effectiveGuardPaths(undefined),
      capabilities: {},
    };
    const proposalCandidate = { action: verdict.proposedAction, paths: seamOps.declaredScope };
    // All three gate conditions are computed before any of them refuses — `isProhibitedAction` and
    // `classifyEnvelope` are both pure, so evaluating them together costs nothing and makes the
    // signal set complete at termination. A proposal that trips two of them (a prohibited sentence
    // whose declared scope is also a test artifact, say) is refused as whichever reason
    // `ADVISORY_REFUSAL_REASONS` puts first — precedence lives in the catalogue, not in the order
    // these `if`s happen to be written (AC-3.6).
    const prohibited = isProhibitedAction(verdict.proposedAction);
    const gateResult = classifyEnvelope(proposalCandidate, gateCtx);
    const lowConfidence = verdict.confidence !== "high";
    if (prohibited || !gateResult.inside || lowConfidence) {
      const gateSignals = { "prohibited-action": prohibited, "low-confidence": lowConfidence };
      if (!gateResult.inside && gateResult.reason) gateSignals[gateResult.reason] = true;
      return await terminate({ outcome: "escalated", reason: refuse(gateSignals), verdict, attempts, appliedSuccessfully: false });
    }

    // ── step 4 ACT ───────────────────────────────────────────────────────────────────────────
    log("ACT");
    const applyResult = await seamOps.apply(verdict);
    if (!applyResult || applyResult.ok !== true) {
      await doRevert();
      return await terminate({ outcome: "escalated", reason: refuse({ "post-action-verification-failed": true }), verdict, attempts, appliedSuccessfully: false });
    }

    // ── step 5 CHECK — classifyEnvelope again, over the produced diff (E-R2, BR-3) ──────────
    log("CHECK");
    const producedPaths = await seamOps.producedPaths();
    const checkCandidate = { action: verdict.proposedAction, paths: Array.isArray(producedPaths) ? producedPaths : [] };
    const checkResult = classifyEnvelope(checkCandidate, gateCtx);
    if (!checkResult.inside) {
      await doRevert();
      return await terminate({
        outcome: "escalated",
        reason: refuse(checkResult.reason ? { [checkResult.reason]: true } : {}),
        verdict,
        attempts,
        appliedSuccessfully: false,
      });
    }

    // ── step 6 VERIFY ────────────────────────────────────────────────────────────────────────
    log("VERIFY");
    if (seamOps.verifyGate !== null) {
      const gateOutcome = await seamOps.verifyGate();
      if (!gateOutcome || gateOutcome.passed !== true) {
        await doRevert();
        // A5-3 — a gate that declares its red outcome an act → re-poll cycle
        // (`consumesAttempt: true`, e.g. a red CI re-poll or the completion
        // cap) consumes an attempt and re-enters the loop; exhaustion is
        // `budget-exhausted`. A plain `{passed:false}` stays what it always
        // was: terminal `post-action-verification-failed`.
        if (gateOutcome && gateOutcome.consumesAttempt === true) {
          attempts += 1;
          if (
            budgetExceeded({
              attempts,
              attemptBudget: config.attemptBudget,
              elapsedMs: 0,
              waitMs: readWaitMs(),
              seamBudgetMinutes: config.seamBudgetMinutes,
            })
          ) {
            return await terminate({ outcome: "escalated", reason: refuse({ "budget-exhausted": true }), verdict, attempts, appliedSuccessfully: false });
          }
          continue;
        }
        return await terminate({ outcome: "escalated", reason: refuse({ "post-action-verification-failed": true }), verdict, attempts, appliedSuccessfully: false });
      }
    }

    // ── resolved ─────────────────────────────────────────────────────────────────────────────
    return await terminate({ outcome: "resolved", reason: null, verdict, attempts, appliedSuccessfully: true });
    }
  } catch (err) {
    if (err && err.__isRevertFailure) throw err; // BR-5 — never silently swallow an unrevertable tree
    if (err && err.isHalt) throw err; // M-3 — no rung resolved; propagate, never mapped to an escalation
    // TSPEC §17.3 — an unclassified throw is an escalation like any other, and therefore goes
    // through `terminate`: the ADVISORY record (AC-9.1) is written, the `ESCALATIONS.md` entry
    // (AC-10.1) is appended and the `ADVISORY ESCALATION:` notice (AC-10.5) is emitted, exactly as
    // on every other escalating path. The reason is the LAST COMPUTED refusal reason, or
    // `budget-exhausted` when none was computed — always a member of the closed catalogue
    // (AC-3.6), never an ad-hoc value. `verdict`/`attempts` are the invocation's real state, not
    // discarded. `terminate` is declared outside this `try`, so calling it here cannot re-enter it;
    // `appliedSuccessfully: false` is deliberate — an unclassified throw leaves the tree in an
    // unknown state, and a speculative revert is not a safe response to that.
    return await terminate({
      outcome: "escalated",
      reason: lastReason ?? "budget-exhausted",
      verdict,
      attempts,
      appliedSuccessfully: false,
    });
  }
}

// TSPEC-SCRIPT-03: Exported meta object
export const meta = {
  name: "orchestrate-dev",
  description: "Full PDLC pipeline orchestrator — REQ to harvest.",
  inputs: [
    {
      name: "reqPath",
      description:
        "Path to the approved REQ document, e.g. docs/{feature}/REQ-{feature}.md",
      type: "string",
      required: true,
    },
    {
      name: "forcePhases",
      description:
        "Optional comma- or space-separated phases to re-run despite a recorded approval. Valid: R, F, T, P, D, PR, all.",
      type: "string",
      required: false,
    },
  ],
};

// TSPEC-DISPATCH-01: Normative Phase Dispatch Table
export const PHASE_DISPATCH = {
  R: {
    phase: "R",
    label: "REQ Cross-Review",
    creator: null,
    creatorInputs: [],
    creatorOutputPath: null,
    reviewers: ["se-review", "te-review"],
    optimizer: "pm-author",
    // §3.4 grounding manifest — see `groundingClause`.
    grounding: [
      "Every code path or file the REQ names — confirm it exists and matches the described behavior.",
      "Every existing-behavior claim in the REQ — verify against current code, not assumption.",
    ],
  },
  F: {
    phase: "F",
    label: "FSPEC Creation + Review",
    creator: "pm-author",
    creatorInputs: ["REQ"],
    creatorOutputPath: "docs/{feature}/FSPEC-{feature}.md",
    reviewers: ["se-review", "te-review"],
    optimizer: "pm-author",
    grounding: [
      "The REQ this FSPEC derives from — every claim must trace to it.",
      "Every repo path the FSPEC names — confirm it exists and behaves as described.",
    ],
  },
  T: {
    phase: "T",
    label: "TSPEC Creation + Review",
    creator: "se-author",
    creatorInputs: ["REQ", "FSPEC"],
    creatorOutputPath: "docs/{feature}/TSPEC-{feature}.md",
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
    grounding: [
      "Every production file and symbol the TSPEC cites — confirm each one exists in the repo.",
      "Every claim about current behavior — verify against the cited code, not the TSPEC's prose.",
    ],
  },
  D: {
    phase: "D",
    label: "DECISIONS Creation + Review",
    creator: "se-author",
    creatorInputs: ["REQ", "FSPEC", "TSPEC"],
    creatorOutputPath: "docs/{feature}/DECISIONS-{feature}.md",
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
    grounding: [
      "Each alternative's claimed code cost — verify against the actual files it would touch.",
      "Any claim that an alternative is simpler or cheaper — confirm against the existing code, not intuition.",
    ],
  },
  P: {
    phase: "P",
    label: "PLAN Creation + Review",
    creator: "se-author",
    // DECISIONS input is conditional — append if DECISIONS doc exists on branch
    creatorInputs: ["REQ", "FSPEC", "TSPEC", "DECISIONS?"],
    creatorOutputPath: "docs/{feature}/PLAN-{feature}.md",
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
    grounding: [
      "Every file the task table names — confirm it exists, or that the task explicitly declares it new.",
      "The task table's coverage claims — verify against the current test suite layout.",
    ],
  },
  PR: {
    phase: "PR",
    label: "PROPERTIES Creation + Review",
    creator: "te-author",
    creatorInputs: ["REQ", "FSPEC", "TSPEC", "PLAN"],
    creatorOutputPath: "docs/{feature}/PROPERTIES-{feature}.md",
    reviewers: ["pm-review", "se-review"],
    optimizer: "te-author",
    grounding: [
      "Every task the PLAN's table lists — confirm the PROPERTIES trace to it.",
      "Every named test file and test level — confirm it exists or is explicitly planned as new.",
    ],
  },
  CR: {
    phase: "CR",
    label: "Final Codebase Review",
    creator: null,
    creatorInputs: [],
    creatorOutputPath: null,
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
    grounding: [
      "The feature's full diff against the default branch — every finding must cite the actual changed lines.",
      "The documents under docs/{feature}/ — confirm the shipped code matches what they specify.",
      // PM F-06 (CR round 1, pdlc-consolidation-agent): four builder-not-wired gaps
      // reached final review green because every acceptance test drove a pure builder
      // with hand-built inputs, and no row asked who calls it in production. The
      // pm-review SKILL carries the sweep, but only as one bullet among many; naming
      // it as CR grounding puts it in every CR reviewer's prompt, both lenses.
      "For each AC that claims an operator-visible artifact contains something: name the production caller that assembles it and the test that drives THAT caller, or file a finding. A builder covered only through its own unit tests is not wired.",
    ],
  },
  DOD: {
    phase: "DOD",
    label: "Definition of Done Verification",
    verifier: "dod-verify",
    remediator: "se-implement",
  },
};

// ─── Halt helper ───────────────────────────────────────────────────────────────

/**
 * Creates a halt error with the given message.
 * @param {string} message
 * @returns {Error}
 */
function haltError(message, fields) {
  const err = new Error(message);
  err.isHalt = true;
  // §4.7: a halt that already KNOWS its disposition carries it, so `main()`'s
  // catch reports the fact rather than re-deriving it from a second `_checkFile`.
  if (fields && typeof fields === "object") Object.assign(err, fields);
  return err;
}

// ─── Branch guard — every commit of a run lands on feat-{feature} ─────────────
//
// The failure this exists for: nothing in the pipeline ever established the
// feature branch. A session whose working tree happened to sit on the default
// branch ran a whole review round there — cross-reviews, REQ revisions and the
// queue row were committed and pushed to `main`. The only mention of the branch
// was a "check out or create the feature branch" step inside the reviewer SKILL
// files, which is both skippable and racy: the two reviewers of a round run in
// PARALLEL in ONE shared working tree, so a checkout by either of them is a
// mutation the other never asked for. The branch is therefore established ONCE,
// by the orchestrator, before any phase runs, and the agents are told not to
// touch it.

/** The branch a feature's every commit belongs on. */
export function featureBranchName(feature) {
  return `feat-${String(feature ?? "").trim()}`;
}

/**
 * The git transport the branch guard is allowed to ACT on.
 *
 * The guard is the one thing in this module that mutates the checkout, so it
 * runs only against an **injected** seam. Every production entrypoint injects
 * one (`rtDevInjections`'s `_git: rtGit`, for both the dev and the queue
 * bundle); a unit test that injects none keeps `defaultGit`, and must never
 * have its own worktree checked out from under it by a pipeline under test.
 * Absent transport ⇒ the guard reports that it is inert rather than pretending
 * it verified anything.
 *
 * @param {function|undefined} _git
 * @returns {function|null}
 */
export function branchGuardTransport(_git) {
  return typeof _git === "function" && _git !== defaultGit ? _git : null;
}

/** The branch name `git rev-parse --abbrev-ref HEAD` reported, or null. */
function parseAbbrevRef(result) {
  if (!result || result.ok !== true) return null;
  const name = String((result && result.stdout) ?? "").trim();
  return name === "" ? null : name;
}

// How many EXTRA observations an ok-but-empty HEAD read is worth before the
// guard believes it. Measured (run wf_d74b18e0-ecb, 2026-08-03): at a reviewLoop
// entry the injected `_git(["rev-parse","--abbrev-ref","HEAD"])` returned
// `{ok: true, stdout: "", stderr: ""}` while the tree was on the feature branch
// the whole time — the next rev-parse, seconds later, read it fine. The seam is
// agent-transcribed, so an empty stdout from an OK command is a transport fault,
// not a fact about the tree. Fail-closed stays; the single-shot observation goes.
// Policy, like MAX_AUTHORING_ATTEMPTS: not exported, pinned through call counts.
const GIT_READ_RETRIES = 2;

/**
 * Read HEAD's branch name, re-observing an ok-but-empty answer.
 *
 * An `ok !== true` result is returned on the FIRST observation: that is a real
 * git failure, its stderr is diagnostic, and the existing halt paths already
 * carry it. Only the empty/whitespace-stdout arm — the transport-fault signature
 * — is retried, up to `GIT_READ_RETRIES` more times.
 *
 * @param {function} git - the injected `_git(argv)` transport
 * @returns {Promise<{branch: string|null, observations: number, result: object,
 *                    transportFault: boolean}>}
 */
async function readHeadBranch(git) {
  let result = null;
  let observations = 0;
  while (observations < GIT_READ_RETRIES + 1) {
    result = await git(["rev-parse", "--abbrev-ref", "HEAD"]);
    observations += 1;
    const branch = parseAbbrevRef(result);
    if (branch !== null) return { branch, observations, result, transportFault: false };
    // A genuine failure is not a transport fault and is never re-observed.
    if (!result || result.ok !== true) {
      return { branch: null, observations, result, transportFault: false };
    }
  }
  return { branch: null, observations, result, transportFault: true };
}

/**
 * The parenthetical a halt carries when every re-observation came back empty —
 * so an operator reading the halt knows the guard looked more than once and that
 * the tree's branch was never actually reported.
 */
function transportFaultNote(head) {
  return head && head.transportFault
    ? ` (${head.observations} observations, all empty — transport fault suspected)`
    : "";
}

/** The one-line operator instruction every branch-guard halt ends with. */
function branchGuardRemedy(branch) {
  return `Check out ${branch} yourself (git checkout -B ${branch}) and re-invoke; nothing was committed.`;
}

/**
 * Place the working tree on `feat-{feature}` — called ONCE at pipeline entry,
 * before any phase runs.
 *
 * | HEAD reads | action |
 * |---|---|
 * | `feat-{feature}` | nothing — already there |
 * | anything else, branch exists | `git checkout feat-{feature}` |
 * | anything else, branch absent | `git checkout -b feat-{feature}` |
 *
 * Every other outcome HALTS. That includes the checkout *reporting* success
 * while HEAD still names another branch: the post-checkout `rev-parse` is a
 * second, independent observation, because "the command exited 0" and "the tree
 * is on the branch" are not the same claim, and it is the second one the rest
 * of the pipeline depends on.
 *
 * @param {{feature: string, _git?: function, _log?: function}} params
 * @returns {Promise<{ok: true, branch: string, action: "already-on"|"checked-out"|"created"|"skipped"}>}
 */
export async function ensureFeatureBranch({ feature, _git, _log } = {}) {
  const branch = featureBranchName(feature);
  const emit = typeof _log === "function" ? _log : log;
  const git = branchGuardTransport(_git);
  if (!git) {
    emit(`Branch guard: inert — no git seam injected, ${branch} was not verified.`);
    return { ok: true, branch, action: "skipped" };
  }

  const head = await readHeadBranch(git);
  const current = head.branch;
  if (current === null) {
    throw haltError(
      `Error: branch guard — could not read the current branch ` +
        `(git rev-parse --abbrev-ref HEAD failed: ` +
        `${String((head.result && head.result.stderr) || "no output").trim()})` +
        `${transportFaultNote(head)}. ` +
        `Refusing to run the pipeline without knowing that commits will land on ${branch}. ` +
        branchGuardRemedy(branch)
    );
  }
  if (current === branch) return { ok: true, branch, action: "already-on" };

  // An existing branch first; `-b` only when the plain checkout could not find
  // one. Ordered this way round so a branch that already carries work is joined,
  // never shadowed by a fresh one cut from wherever HEAD happened to be.
  let action = "checked-out";
  const checkout = await git(["checkout", branch]);
  if (!checkout || checkout.ok !== true) {
    const created = await git(["checkout", "-b", branch]);
    if (!created || created.ok !== true) {
      throw haltError(
        `Error: branch guard — the working tree is on "${current}" and neither ` +
          `\`git checkout ${branch}\` nor \`git checkout -b ${branch}\` succeeded ` +
          `(${String((created && created.stderr) || (checkout && checkout.stderr) || "no output").trim()}). ` +
          `Refusing to run: every commit of this run would land on "${current}". ` +
          branchGuardRemedy(branch)
      );
    }
    action = "created";
  }

  const confirmation = await readHeadBranch(git);
  const after = confirmation.branch;
  if (after !== branch) {
    throw haltError(
      `Error: branch guard — after checking out ${branch} the working tree is still on ` +
        `"${after ?? "an unreadable branch"}"${transportFaultNote(confirmation)}. ` +
        `Refusing to run: every commit of this run would ` +
        `land there. ` +
        branchGuardRemedy(branch)
    );
  }

  emit(`Branch guard: working tree is on ${branch} (${action}).`);
  return { ok: true, branch, action };
}

/**
 * The cheap re-check, run at every `reviewLoop` entry: read HEAD and halt if it
 * is no longer `feat-{feature}`.
 *
 * Deliberately **verify-only, never a checkout**. By the time a phase is
 * running, dispatched agents may be mid-flight in the same working tree, and a
 * checkout underneath them would corrupt work in progress. A tree that drifted
 * between phases is an operator problem, and the only safe act is to stop before
 * the round's cross-reviews are committed somewhere else — which is exactly the
 * failure this guard exists for.
 *
 * @param {{feature: string, context?: string, _git?: function, _log?: function}} params
 * @returns {Promise<{ok: true, branch: string, verified: boolean}>}
 */
export async function verifyFeatureBranch({ feature, context, _git, _log } = {}) {
  const branch = featureBranchName(feature);
  const git = branchGuardTransport(_git);
  if (!git) return { ok: true, branch, verified: false };

  const where = context ? ` before ${context}` : "";
  const head = await readHeadBranch(git);
  const current = head.branch;
  if (current === branch) return { ok: true, branch, verified: true };

  throw haltError(
    `Error: branch guard${where} — the working tree is on ` +
      `"${current ?? "an unreadable branch"}"${transportFaultNote(head)}, ` +
      `not ${branch}. Refusing to continue: ` +
      `this round's commits would land there. ` +
      branchGuardRemedy(branch)
  );
}

// ─── Deterministic file-existence check (replaces the guard agent) ────────────

/**
 * Verify a file exists and is non-empty. Deterministic replacement for the
 * former `guard` agent's file-existence check — a filesystem read needs no LLM.
 * A size-0 file, or one whose contents are whitespace-only, counts as empty.
 * Mirrors mergeWorktree's injectable-dependency style via the `fsMod` param.
 *
 * @param {string} path
 * @param {{ fsMod?: object }} [opts] - injection point for tests (override fs)
 * @returns {{ ok: true } | { ok: false, reason: "file_missing" | "file_empty" }}
 */
export function checkFileNonEmpty(path, { fsMod = fs } = {}) {
  if (!path || (typeof path === "string" && path.trim() === "")) {
    return { ok: false, reason: "file_missing" };
  }
  try {
    if (!fsMod.existsSync(path)) {
      return { ok: false, reason: "file_missing" };
    }
    const stat = fsMod.statSync(path);
    if (stat.size === 0) {
      return { ok: false, reason: "file_empty" };
    }
    const contents = fsMod.readFileSync(path, "utf8");
    if (typeof contents === "string" && contents.trim() === "") {
      return { ok: false, reason: "file_empty" };
    }
  } catch {
    return { ok: false, reason: "file_missing" };
  }
  return { ok: true };
}

// ─── TSPEC-IMPL-01: parsePlanTasks — deterministic PLAN task-table parse ───────

/**
 * Parse a PLAN markdown task table into the DAG task list the implementation
 * phase batches over. Deterministic replacement for the former se-author DAG
 * agent — a markdown table needs no LLM to read.
 *
 * Header row is matched case-insensitively and tolerates column-order variation
 * (mirrors parseQueue's header-mapping approach). A parseable table needs at
 * minimum an id column and a dependencies column; without both this returns null
 * so the caller can fall back to the agent path. The dependencies cell is a
 * comma/space separated list of ids, with "-"/"—"/"none"/"" meaning none.
 *
 * ## Why the header grammar is EXACT-CELL, and why the scan is per-table
 *
 * The first version matched header cells by substring (`cell.includes("id")`,
 * `cell.includes("depend")`) over a FLAT list of every pipe row in the document.
 * Both halves were wrong, and they compounded: ordinary data tables (risk
 * registers, disposition tables) matched the header test, and — because the row
 * list was flattened — the first match then swallowed every later pipe row in the
 * document as another "task". Measured against this repo's own PLANs, the flat
 * loose parse read `PLAN-pdlc-review-loop-hardening.md` (31 tasks) as 289 and
 * `PLAN-pdlc-workflow-distribution.md` (61 tasks) as 247.
 *
 * So: a header row qualifies only if one of its cells is EXACTLY an id name and
 * another is EXACTLY a dependency name (`PLAN_ID_HEADER_CELLS` /
 * `PLAN_DEPS_HEADER_CELLS`), and the document is scanned as contiguous BLOCKS of
 * pipe rows — one markdown table each. Every qualifying block contributes its
 * rows (a PLAN may split its tasks over one table per batch); a non-qualifying
 * block contributes nothing and, crucially, terminates the table before it.
 *
 * @param {string | null | undefined} markdown - Raw PLAN.md contents
 * @returns {{ tasks: Array<{ id: string, description: string, dependencies: string[], planBatch: number|undefined }> } | null}
 */
export function parsePlanTasks(markdown) {
  if (markdown == null || typeof markdown !== "string") return null;

  // The description and batch columns stay LOOSE — they are cosmetic, a wrong
  // guess costs a label rather than a task — but they may never claim the id or
  // dependencies column, which are the two that carry the DAG.
  const isDescCell = (c) =>
    c.includes("desc") ||
    c.includes("task") ||
    c.includes("summary") ||
    c.includes("name") ||
    c.includes("title");
  const isBatchCell = (c) =>
    c.includes("batch") || c.includes("phase") || c.includes("wave");

  // Segment the document into contiguous runs of pipe rows: one markdown table
  // per run. Any non-pipe line ends the run.
  const blocks = [];
  let block = null;
  for (const line of markdown.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("|")) {
      if (!block) {
        block = [];
        blocks.push(block);
      }
      block.push(trimmed);
    } else {
      block = null;
    }
  }
  if (blocks.length === 0) return null;

  const tasks = [];
  for (const rows of blocks) {
    const cols = splitPipeRow(rows[0]).map((c) => c.toLowerCase());
    const idIdx = cols.findIndex((c) => PLAN_ID_HEADER_CELLS.has(c));
    const depsIdx = cols.findIndex((c) => PLAN_DEPS_HEADER_CELLS.has(c));
    // Not a task table. Without an explicit dependency column the DAG can't be
    // derived from the table alone, so this block is simply not one of ours.
    if (idIdx < 0 || depsIdx < 0) continue;

    const findCol = (pred) => {
      for (let i = 0; i < cols.length; i++) {
        if (i === idIdx || i === depsIdx) continue;
        if (pred(cols[i])) return i;
      }
      return -1;
    };
    const descIdx = findCol(isDescCell);
    const batchIdx = findCol(isBatchCell);

    for (let i = 1; i < rows.length; i++) {
      const cells = splitPipeRow(rows[i]);
      // Skip the markdown separator row (|---|---|).
      if (cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "")) continue;

      const id = (cells[idIdx] || "").trim();
      if (!id) continue;

      const description = descIdx >= 0 ? (cells[descIdx] || "").trim() : "";
      const dependencies = parsePlanDepsCell(cells[depsIdx]);

      let planBatch;
      if (batchIdx >= 0) {
        const raw = (cells[batchIdx] || "").trim();
        const m = raw.match(/\d+/);
        if (m) planBatch = parseInt(m[0], 10);
      }

      tasks.push({ id, description, dependencies, planBatch });
    }
  }

  if (tasks.length === 0) return null;
  return { tasks };
}

/**
 * Row/cell-level pre-check for Phase P's post-convergence self-parse gate:
 * every id a task's Deps cell names must be some task's id, across every
 * qualifying task table in the PLAN (a dependency in one batch's table may
 * name a task defined in another). Run this BEFORE cycle detection so an
 * unknown-id typo is diagnosed as "unknown id", never mistaken for a cycle.
 *
 * Mirrors `parsePlanTasks`' own table-block segmentation and column
 * resolution — so its row numbering agrees with the task table's own
 * indexing — but keeps the RAW Deps cell text and reports unresolved tokens
 * per row instead of collapsing straight to a dependency array (which is
 * why this isn't just folded into `parsePlanTasks`: that function's return
 * shape is pinned by existing callers/tests and carries no raw-cell field).
 *
 * @param {string | null | undefined} markdown - Raw PLAN.md contents
 * @returns {string[]} one diagnostic per offending row, e.g.
 *   `row 3: Deps cell "A1, Z9" names unknown id "Z9"` — empty when every
 *   dependency token resolves.
 */
function findUnknownPlanDepsIds(markdown) {
  if (markdown == null || typeof markdown !== "string") return [];

  const blocks = [];
  let block = null;
  for (const line of markdown.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("|")) {
      if (!block) {
        block = [];
        blocks.push(block);
      }
      block.push(trimmed);
    } else {
      block = null;
    }
  }
  if (blocks.length === 0) return [];

  const isSeparatorRow = (cells) =>
    cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "");

  // Pass 1: collect every task id across every qualifying table before
  // checking any Deps cell, since a dependency may be defined in a later table.
  const knownIds = new Set();
  const qualifyingBlocks = [];
  for (const rows of blocks) {
    const cols = splitPipeRow(rows[0]).map((c) => c.toLowerCase());
    const idIdx = cols.findIndex((c) => PLAN_ID_HEADER_CELLS.has(c));
    const depsIdx = cols.findIndex((c) => PLAN_DEPS_HEADER_CELLS.has(c));
    if (idIdx < 0 || depsIdx < 0) continue; // not a task table
    qualifyingBlocks.push({ rows, idIdx, depsIdx });
    for (let i = 1; i < rows.length; i++) {
      const cells = splitPipeRow(rows[i]);
      if (isSeparatorRow(cells)) continue;
      const id = (cells[idIdx] || "").trim();
      if (id) knownIds.add(id);
    }
  }

  // Pass 2: every Deps token must resolve against the ids collected above.
  const problems = [];
  for (const { rows, idIdx, depsIdx } of qualifyingBlocks) {
    for (let i = 1; i < rows.length; i++) {
      const cells = splitPipeRow(rows[i]);
      if (isSeparatorRow(cells)) continue;
      const id = (cells[idIdx] || "").trim();
      if (!id) continue;
      const raw = (cells[depsIdx] || "").trim();
      for (const tok of parsePlanDepsCell(raw)) {
        if (!knownIds.has(tok)) {
          problems.push(`row ${i}: Deps cell "${raw}" names unknown id "${tok}"`);
        }
      }
    }
  }
  return problems;
}

/**
 * The closed set of header cells that name a PLAN task table's id column, and
 * the closed set that names its dependencies column. Matched on the LOWERCASED,
 * TRIMMED cell, in full — never as a substring. Extending either set is the one
 * sanctioned way to admit a new spelling.
 */
const PLAN_ID_HEADER_CELLS = new Set(["task id", "task-id", "task_id", "id", "#"]);
const PLAN_DEPS_HEADER_CELLS = new Set([
  "dependencies",
  "dependency",
  "depends on",
  "depends-on",
  "depends_on",
  "deps",
  "prerequisites",
  "prereqs",
]);

/**
 * Split a markdown table row on pipes, trimming leading/trailing pipe + cells.
 *
 * Escape- and code-span-aware: a `|` is a cell delimiter only when it is (a)
 * not immediately preceded by an unescaped backslash and (b) not inside an
 * open backtick code span. Code spans follow the CommonMark rule — a run of
 * N backticks opens a span, and only an EQUAL-length run of backticks closes
 * it, so `` `a|b`` `` (two closing ticks against a one-tick open) stays open
 * and its `|` is literal content, not a delimiter. An escaped `\|` inside a
 * cell is un-escaped to a literal `|` in the cell's value; escapes are not
 * processed while inside a code span (CommonMark: backslashes are literal
 * there). Strict widening: a row with no in-cell pipes (no backslashes, no
 * backticks) splits byte-identically to the prior plain `.split("|")`.
 */
export function splitPipeRow(row) {
  let s = row;
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);

  const cells = [];
  let cur = "";
  let backtickRun = 0; // length of the currently open code-span fence, 0 = none open
  let i = 0;
  while (i < s.length) {
    const ch = s[i];

    // `\|` outside a code span: consume both chars, emit a literal `|`.
    if (ch === "\\" && backtickRun === 0 && s[i + 1] === "|") {
      cur += "|";
      i += 2;
      continue;
    }

    if (ch === "`") {
      let j = i;
      while (j < s.length && s[j] === "`") j++;
      const run = j - i;
      if (backtickRun === 0) {
        backtickRun = run; // opens a span
      } else if (run === backtickRun) {
        backtickRun = 0; // exact-length run closes it (CommonMark rule)
      }
      // else: a run of a different length while a span is open is literal.
      cur += s.slice(i, j);
      i = j;
      continue;
    }

    if (ch === "|" && backtickRun === 0) {
      cells.push(cur.trim());
      cur = "";
      i += 1;
      continue;
    }

    cur += ch;
    i += 1;
  }
  cells.push(cur.trim());
  return cells;
}

/** Parse a dependencies cell: comma/space list of ids; "-"/"—"/"none"/"" ⇒ []. */
function parsePlanDepsCell(cell) {
  if (!cell) return [];
  const trimmed = cell.trim();
  if (
    trimmed === "" ||
    trimmed === "-" ||
    trimmed === "—" ||
    trimmed === "–" ||
    trimmed.toLowerCase() === "none"
  ) {
    return [];
  }
  return trimmed
    .split(/[\s,]+/)
    .map((d) => d.trim())
    .filter(
      (d) =>
        d &&
        d !== "-" &&
        d !== "—" &&
        d !== "–" &&
        d.toLowerCase() !== "none"
    );
}

// ─── PROPOSAL §3.3 (M-5): the file-ownership manifest as a parsed contract ─────

/**
 * The closed set of header cells that name a manifest's OWNING TASK column, and
 * the closed set that names its FILES column. Matched on the cell AFTER
 * `normalizeHeaderCell` (lowercase, trim, collapse internal whitespace, strip one
 * trailing parenthetical — so `Owning task(s)` and `File(s)` normalize to
 * `owning task` and `file`), in full — never as a substring, for exactly the
 * reason `parsePlanTasks` documents: a substring test lets a risk register or a
 * "Writers" table qualify, and a qualifying non-manifest table poisons the
 * contract check downstream. Normalization runs first; extending either set
 * remains the one sanctioned way to admit a spelling normalization does not
 * already fold into an existing member.
 */
const PLAN_OWNER_HEADER_CELLS = new Set([
  "task",
  "task id",
  "task-id",
  "task_id",
  "owning task",
  "owning tasks",
  "owner",
  "id",
]);
const PLAN_FILES_HEADER_CELLS = new Set([
  "files created or appended",
  "files",
  "file",
  "owned files",
  "files owned",
  "file ownership",
  "files created/appended",
]);

/**
 * Normalize a header cell before set membership: lowercase, trim, collapse
 * internal whitespace to single spaces, then strip ONE trailing parenthetical
 * (`Owning task(s)` → `owning task`, `File(s)` → `file`). Membership after
 * normalization is still exact-cell, never substring — see the comment above
 * the two sets.
 */
function normalizeHeaderCell(cell) {
  return String(cell == null ? "" : cell)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*\([^()]*\)\s*$/, "")
    .trim();
}

/** Strip surrounding markdown emphasis / code ticks from a table cell value. */
function stripCellEmphasis(cell) {
  return String(cell == null ? "" : cell)
    .trim()
    .replace(/^[*_`~]+/, "")
    .replace(/[*_`~]+$/, "")
    .trim();
}

/**
 * Is a bare (un-backticked) cell value plausibly a single path?
 *
 * The manifest's convention is backticked paths, but PLAN authors sometimes drop
 * the ticks for a lone path. Accepting the bare cell is useful; accepting prose
 * is not — a cell reading `*(none)*` or `to be decided later` must contribute
 * nothing rather than an imaginary file that would then collide with nothing and
 * silently widen a wave. So: no whitespace, path-ish characters only, and not one
 * of the "nothing here" markers.
 */
function isPlausiblePath(value) {
  if (!value) return false;
  if (/\s/.test(value)) return false;
  const lowered = value.toLowerCase();
  if (
    lowered === "-" ||
    lowered === "—" ||
    lowered === "–" ||
    lowered === "none" ||
    lowered === "n/a" ||
    lowered === "tbd"
  ) {
    return false;
  }
  return /^[A-Za-z0-9._\-/*+@]+$/.test(value);
}

/**
 * Parse a PLAN's file-ownership manifest table(s) into `{ taskId, files }` rows.
 *
 * Grammar, deliberately the same shape as `parsePlanTasks`:
 * - The document is segmented into contiguous BLOCKS of pipe rows (one markdown
 *   table each); a non-pipe line terminates the block.
 * - A block qualifies only if its header row carries one cell that is EXACTLY a
 *   member of `PLAN_OWNER_HEADER_CELLS` and another that is EXACTLY a member of
 *   `PLAN_FILES_HEADER_CELLS` (both after `normalizeHeaderCell`). A batch/wave/
 *   phase column may be present and is ignored — waves are DERIVED from
 *   ownership and dependencies, never read off the PLAN's own batch labels.
 * - Every qualifying block contributes its rows, so a PLAN that writes one
 *   manifest per batch parses as well as one that writes a single table.
 * - A block whose header matches ONE side (owner or files) but not the other is
 *   a NEAR MISS, not a silent skip: it is reported back so the caller can reject
 *   loudly rather than treat the manifest as absent. A block matching NEITHER
 *   side is ordinary prose and stays silently skipped, exactly as before. The
 *   one exception: an owner-only match paired with a genuine Deps column is an
 *   ordinary task table (its id column and the owner set share spellings), not
 *   an attempted manifest, and stays silently skipped too.
 *
 * Cell reading: the task cell is stripped of markdown emphasis (`**A1**` → `A1`);
 * the files cell yields every backtick-quoted span, verbatim (a trailing `/`
 * marks a directory and is KEPT — the collision rule needs it). A files cell with
 * no backticked span contributes the whole cell as one path only when that cell
 * is plausibly a path (see `isPlausiblePath`), and otherwise contributes nothing.
 * Paths are de-duplicated per task; the same task id in several rows unions.
 *
 * @param {string | null | undefined} markdown - Raw PLAN.md contents
 * @returns {{
 *   ownership: Array<{ taskId: string, files: string[] }> | null,
 *   nearMisses: Array<{ headerRow: string, matchedSide: "owner" | "files", expectedForms: string[] }>
 * } | null}
 *   `null` only when the document has no qualifying block AND no near-miss
 *   block (i.e. nothing in it looks like an ownership manifest at all) — this
 *   preserves the pre-existing null contract for that case. Once there is a
 *   qualifying block, a near-miss block, or both, the object form is returned;
 *   `ownership` is `null` when no block fully qualified.
 */
export function parsePlanOwnership(markdown) {
  if (markdown == null || typeof markdown !== "string") return null;

  const blocks = [];
  let block = null;
  for (const line of markdown.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("|")) {
      if (!block) {
        block = [];
        blocks.push(block);
      }
      block.push(trimmed);
    } else {
      block = null;
    }
  }
  if (blocks.length === 0) return null;

  let sawQualifyingTable = false;
  const order = [];
  const byTask = new Map();
  const nearMisses = [];

  for (const rows of blocks) {
    const headerRow = rows[0];
    const cols = splitPipeRow(headerRow).map((c) => normalizeHeaderCell(c));
    const taskIdx = cols.findIndex((c) => PLAN_OWNER_HEADER_CELLS.has(c));
    const filesIdx = cols.findIndex(
      (c, i) => i !== taskIdx && PLAN_FILES_HEADER_CELLS.has(c)
    );
    if (taskIdx < 0 || filesIdx < 0) {
      // One side matched and the other did not: a loud near miss. Matching
      // NEITHER side is ordinary prose and stays silently skipped.
      //
      // Exception: the owner set's `task`/`task id`/`id` spellings are also
      // exactly `parsePlanTasks`'s task-id spellings (`PLAN_ID_HEADER_CELLS`),
      // so an ordinary task table (Task ID | Description | Deps) matches the
      // owner side on its id column alone. That is not an attempted manifest,
      // so it must not become near-miss noise on every PLAN — a header row
      // that owner-side-matched but also carries a genuine Deps column is a
      // task table, not a manifest near miss.
      const looksLikeTaskTable =
        taskIdx >= 0 && filesIdx < 0 && cols.some((c) => PLAN_DEPS_HEADER_CELLS.has(c));
      if ((taskIdx >= 0 || filesIdx >= 0) && !looksLikeTaskTable) {
        nearMisses.push({
          headerRow,
          matchedSide: taskIdx >= 0 ? "owner" : "files",
          expectedForms: [
            ...(taskIdx >= 0 ? PLAN_FILES_HEADER_CELLS : PLAN_OWNER_HEADER_CELLS),
          ],
        });
      }
      continue;
    }
    sawQualifyingTable = true;

    for (let i = 1; i < rows.length; i++) {
      const cells = splitPipeRow(rows[i]);
      // Skip the markdown separator row (|---|---|).
      if (cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "")) continue;

      const taskId = stripCellEmphasis(cells[taskIdx]);
      if (!taskId) continue;

      const raw = (cells[filesIdx] || "").trim();
      const found = [];
      const ticked = raw.match(/`[^`]+`/g);
      if (ticked && ticked.length > 0) {
        for (const span of ticked) {
          const path = span.slice(1, -1).trim();
          if (path) found.push(path);
        }
      } else {
        const bare = stripCellEmphasis(raw);
        if (isPlausiblePath(bare)) found.push(bare);
      }

      if (!byTask.has(taskId)) {
        byTask.set(taskId, []);
        order.push(taskId);
      }
      const files = byTask.get(taskId);
      for (const path of found) {
        if (!files.includes(path)) files.push(path);
      }
    }
  }

  if (!sawQualifyingTable && nearMisses.length === 0) return null;
  return {
    ownership: sawQualifyingTable
      ? order.map((taskId) => ({ taskId, files: byTask.get(taskId) }))
      : null,
    nearMisses,
  };
}

/**
 * Check a parsed task table against a parsed file-ownership manifest.
 *
 * Exactly two problem classes, and deliberately no third:
 *   (a) a task in the task table with no manifest row — the wave deriver would
 *       have nothing to separate it by;
 *   (b) a manifest row whose task id is not in the task table — a stale row that
 *       claims ownership no task will ever exercise.
 *
 * File OVERLAP between rows is NOT a problem. Overlap is the normal case in a
 * real PLAN (the merge-phase PLAN has ten multiply-written files); waves are what
 * separate the writers, and rejecting overlap here would reject correct PLANs.
 *
 * Pure: no IO, no clock, no ambient state.
 *
 * @param {Array<{id: string}>} tasks - as returned by `parsePlanTasks`
 * @param {Array<{taskId: string}>} ownership - as returned by `parsePlanOwnership`
 * @returns {{ ok: true } | { ok: false, problems: string[] }}
 */
export function validatePlanContract(tasks, ownership) {
  const taskList = Array.isArray(tasks) ? tasks : [];
  const ownershipList = Array.isArray(ownership) ? ownership : [];
  const owned = new Set(ownershipList.map((o) => o.taskId));
  const known = new Set(taskList.map((t) => t.id));

  const problems = [];
  for (const t of taskList) {
    if (!owned.has(t.id)) {
      problems.push(
        `Task ${t.id} is in the PLAN task table but has no file-ownership manifest row`
      );
    }
  }
  for (const o of ownershipList) {
    if (!known.has(o.taskId)) {
      problems.push(
        `File-ownership manifest row ${o.taskId} names a task id that is not in the PLAN task table`
      );
    }
  }

  return problems.length === 0 ? { ok: true } : { ok: false, problems };
}

/**
 * Do two owned paths collide?
 *
 * Equal paths collide. A DIRECTORY entry (one written with a trailing `/`)
 * collides with everything beneath it: `a/b/` collides with `a/b/c.js` but not
 * with the sibling `a/bc.js`, because the trailing slash is part of the compared
 * prefix.
 */
function pathsCollide(a, b) {
  if (a === b) return true;
  if (a.endsWith("/") && b.startsWith(a)) return true;
  if (b.endsWith("/") && a.startsWith(b)) return true;
  return false;
}

/**
 * A one-line, human-readable summary of the PLAN contract state — offered for the
 * Phase P gate's detail string so the gate itself stays a two-liner. Pure.
 *
 * @param {Array} tasks
 * @param {Array|null} ownership
 * @param {{ok: boolean, problems?: string[]}|null} validation
 * @param {Array<Array>|null} waves
 * @returns {string}
 */
export function planContractGateDetail(tasks, ownership, validation, waves) {
  const taskCount = Array.isArray(tasks) ? tasks.length : 0;
  if (ownership == null) {
    return `${taskCount} tasks, no file-ownership manifest (worktree exception path)`;
  }
  if (validation && validation.ok === false) {
    const problems = validation.problems || [];
    return (
      `${taskCount} tasks, ${ownership.length} manifest rows, ` +
      `${problems.length} contract problem(s): ${problems.join("; ")}`
    );
  }
  const waveCount = Array.isArray(waves) ? waves.length : 0;
  return `${taskCount} tasks, ${ownership.length} manifest rows, ${waveCount} waves`;
}

// ─── TSPEC-PARSE-01: parseVerdict ─────────────────────────────────────────────

/**
 * The closed verdict catalogue (TSPEC §3.9, §5.9; FSPEC §16.3).
 *
 * Lifted out of `parseVerdict`'s body to module scope — the same single-source
 * move RLH-05 made for `reviewerRoleSlug`'s `MAP`, and for the same reason: §5.9's
 * cross-review completeness criterion asks "is at least one `VERDICT: ` value in
 * the catalogue?", and a second, hand-copied catalogue beside this one is exactly
 * the desync defect this feature exists to remove (TSPEC §3.9 — "reused verbatim",
 * one grammar family, three carriers).
 *
 * `parseVerdict` itself is otherwise untouched: same reverse-scan, same
 * `malformed: true` fallback, same returns for every input (PLAN §12.3).
 */
const VALID_VERDICTS = Object.freeze([
  "Approved",
  "Approved with minor changes",
  "Needs revision",
]);

/**
 * Extract VERDICT from a reviewer agent result string.
 *
 * When the trailer is missing or malformed (any path that logs the "returned no
 * VERDICT" warning) the fallback additionally carries `malformed: true` so the
 * caller can distinguish a genuine "Needs revision" verdict from an unparseable
 * response and attempt a cheap trailer recovery. Genuine parses — including the
 * truncated-output zero-counts case — never set `malformed`. The extra field is
 * additive: existing consumers only read verdict/high/medium/low.
 *
 * @param {string | null | undefined} result - Raw agent result
 * @param {string} skillName - Reviewer skill identifier for warning messages
 * @returns {{ verdict: string, high: number, medium: number, low: number, malformed?: boolean }}
 */
export function parseVerdict(result, skillName) {
  const fallback = {
    verdict: "Needs revision",
    high: 0,
    medium: 0,
    low: 0,
    malformed: true,
  };

  if (result == null || (typeof result === "string" && result.trim() === "")) {
    log(
      `WARNING: reviewer ${skillName} returned no VERDICT — treating as Needs revision`
    );
    return fallback;
  }

  const lines = result.split("\n");
  const reversed = lines.slice().reverse();

  let verdictLine = null;
  let verdictLineIndex = -1;

  for (let i = 0; i < reversed.length; i++) {
    const trimmed = reversed[i].trim();
    if (trimmed.startsWith("VERDICT: ")) {
      verdictLine = trimmed;
      verdictLineIndex = lines.length - 1 - i;
      break;
    }
  }

  if (verdictLine === null) {
    log(
      `WARNING: reviewer ${skillName} returned no VERDICT — treating as Needs revision`
    );
    return fallback;
  }

  const rawVerdict = verdictLine.slice("VERDICT: ".length).trim();

  if (!VALID_VERDICTS.includes(rawVerdict)) {
    log(
      `WARNING: reviewer ${skillName} returned no VERDICT — treating as Needs revision`
    );
    return fallback;
  }

  // Find the next non-empty line after the VERDICT line, SKIPPING the tier-1
  // approval anchors (DEC-BAR-02, 2026-08-09).
  //
  // The anchors are the one write this system sanctions to a cross-review file
  // after its verdict: CLAUDE.md instructs agents to append them "verbatim
  // without hesitation", and harvest copies them into the Approval Record. So
  // they are not foreign matter between the verdict and its counts — they are
  // expected matter, and the parser has to know that.
  //
  // Left unskipped they were destructive out of all proportion to the defect.
  // A reviewer who omits the counts line entirely is already TOLERATED: with
  // nothing after the verdict, the truncated-output case below returns the
  // verdict with zero counts, which converges under the High-only bar. Append
  // the anchors to that same file and `APPROVAL-HASH: sha256:…` lands in the
  // slot this scan insists is JSON — `JSON.parse` throws, the whole review
  // reads as malformed, and an approval already granted is re-run as "Needs
  // revision". Two individually sound mechanisms, mutually destructive.
  //
  // Measured across all 102 cross-review files in docs/ (2026-08-09): 29 failed
  // to parse, ALL 29 on an anchor line sitting where counts should be, and ALL
  // 29 carrying an APPROVED verdict — 16 rounds of accumulated approval on
  // pdlc-consolidation-agent alone, invisible. In every one the counts line was
  // absent rather than pushed below, so this skip is not recovering a displaced
  // line; it is declining to be broken by a line that belongs there.
  //
  // This does NOT relax the bar. The verdict VALUE still governs and a real
  // counts line, wherever the anchors sit relative to it, is still read and
  // still validated: "Needs revision" stays Needs revision, and a High count
  // still blocks.
  let nextNonEmpty = null;
  for (let j = verdictLineIndex + 1; j < lines.length; j++) {
    const candidate = lines[j].trim();
    if (candidate === "") continue;
    if (APPROVAL_ANCHOR_LINE.test(candidate)) continue;
    nextNonEmpty = candidate;
    break;
  }

  // Truncated-output special case (TSPEC-PARSE-03)
  if (nextNonEmpty === null) {
    return { verdict: rawVerdict, high: 0, medium: 0, low: 0 };
  }

  // Parse JSON
  let parsed = null;
  try {
    parsed = JSON.parse(nextNonEmpty);
  } catch {
    log(
      `WARNING: reviewer ${skillName} returned no VERDICT — treating as Needs revision`
    );
    return fallback;
  }

  // Validate JSON structure: exactly keys {high, medium, low}, all non-negative integers
  const keys = Object.keys(parsed).sort();
  if (
    keys.length !== 3 ||
    keys[0] !== "high" ||
    keys[1] !== "low" ||
    keys[2] !== "medium"
  ) {
    log(
      `WARNING: reviewer ${skillName} returned no VERDICT — treating as Needs revision`
    );
    return fallback;
  }

  if (
    !Number.isInteger(parsed.high) ||
    parsed.high < 0 ||
    !Number.isInteger(parsed.medium) ||
    parsed.medium < 0 ||
    !Number.isInteger(parsed.low) ||
    parsed.low < 0
  ) {
    log(
      `WARNING: reviewer ${skillName} returned no VERDICT — treating as Needs revision`
    );
    return fallback;
  }

  return {
    verdict: rawVerdict,
    high: parsed.high,
    medium: parsed.medium,
    low: parsed.low,
  };
}

// ─── TSPEC-PARSE-06: parseConfirmationFindings ────────────────────────────────

/**
 * The severity / provenance / locality triple a delta-confirmation reviewer
 * tags each finding with (PLAN §2.1). Closed sets, matched case-insensitively
 * and returned in canonical casing, so the gate downstream compares tokens and
 * never strings the reviewer happened to type.
 */
const FINDING_SEVERITIES = Object.freeze({ high: "High", medium: "Medium", low: "Low" });
const FINDING_PROVENANCES = Object.freeze({ delta: "delta", inherited: "inherited" });
const FINDING_LOCALITIES = Object.freeze({ local: "local", nonlocal: "nonlocal" });

/**
 * Parse the structured `FINDING:` lines out of a delta-confirmation — the new
 * input surface the erratum gate reads (PLAN §2.1). One finding per line:
 *
 *   FINDING: {High|Medium|Low} | {delta|inherited} | {local|nonlocal} | {section} | {text}
 *
 * Four properties are load-bearing:
 *
 *   1. **Fence-aware, via `scanLines`.** A `FINDING:` line quoted inside a
 *      fenced block — the grammar template in a SKILL, an excerpt of a prior
 *      review — is never a finding. Same scanner `extractFileVerdict` and
 *      `isComplete` use, so all three agree on what counts as a line of the
 *      document (TSPEC §5.0).
 *   2. **Channel-agnostic.** The argument is text: an agent's response string
 *      and the cross-review file's contents parse identically. The gate reads
 *      whichever channel it holds without a second grammar.
 *   3. **First four delimiters only.** The section anchor is free-form and the
 *      finding text routinely carries pipes (table cells, `list[str] | None`).
 *      Splitting on every `|` would shift the record the same way `splitPipeRow`
 *      historically shifted a PLAN's Deps column, so the remainder after the
 *      fourth delimiter is the text, verbatim, pipes and all.
 *   4. **Unparseable is reported, never dropped.** A `FINDING:` line whose
 *      triple is not a valid severity/provenance/locality — or that carries
 *      fewer than four delimiters — goes to `malformed` as its raw line. The
 *      caller decides what a malformed tag means; this function does not
 *      silently discard a line a reviewer meant as a finding.
 *
 * A text with zero `FINDING:` lines returns zero findings and zero malformed
 * entries. That is the legacy/untagged case, and it is NOT this function's job
 * to interpret it: callers (the gate, T2) must fail closed on the document
 * contract — a non-approving confirmation carrying no parseable tags is treated
 * as `{delta, nonlocal}`, i.e. exactly the pre-grammar halt (PLAN §2.1).
 *
 * Total: input is coerced, nothing throws, both arrays are always present.
 *
 * @param {string} text - a confirmation response or cross-review file's bytes.
 * @returns {{findings: Array<{severity: string, provenance: string, locality: string, section: string, text: string}>, malformed: string[]}}
 */
export function parseConfirmationFindings(text) {
  const findings = [];
  const malformed = [];

  scanLines(text, (line) => {
    // \r survives `scanLines`' split on "\n"; trim absorbs it, so a CRLF file
    // parses identically to an LF one.
    const trimmed = line.trim();
    const tag = /^FINDING\s*:/i.exec(trimmed);
    if (!tag) return;

    const body = trimmed.slice(tag[0].length);

    // Split on the FIRST FOUR delimiters only — the fifth field is free text.
    const parts = [];
    let rest = body;
    for (let i = 0; i < 4; i++) {
      const at = rest.indexOf("|");
      if (at === -1) {
        rest = null;
        break;
      }
      parts.push(rest.slice(0, at));
      rest = rest.slice(at + 1);
    }
    if (rest === null) {
      malformed.push(trimmed);
      return;
    }

    const severity = FINDING_SEVERITIES[parts[0].trim().toLowerCase()];
    const provenance = FINDING_PROVENANCES[parts[1].trim().toLowerCase()];
    const locality = FINDING_LOCALITIES[parts[2].trim().toLowerCase()];
    if (!severity || !provenance || !locality) {
      malformed.push(trimmed);
      return;
    }

    findings.push({
      severity,
      provenance,
      locality,
      section: parts[3].trim(),
      text: rest.trim(),
    });
  });

  return { findings, malformed };
}

// ─── PLAN §2.2 — the erratum gate's decision rules (R1–R4) ────────────────────

/**
 * The section anchor a fail-closed synthetic finding carries. It is a literal,
 * not a parsed value, so a real `FINDING:` line can never be mistaken for one.
 */
const ERRATUM_FAIL_CLOSED_SECTION = "(untagged confirmation)";

/**
 * Decide what a delta confirmation means, from the confirmers' verdicts and
 * their structured `FINDING:` lines (PLAN §2.2). Pure, total, and deliberately
 * separate from the dispatching round so the rule table can be read — and
 * tested — without a pipeline.
 *
 * The four rules are evaluated in order and the first match wins:
 *
 *   R1  every confirmer approves                    → pass, re-anchor upstream
 *   R2  ≥1 non-approving, ZERO High findings tagged
 *       `delta` (every High is `inherited`)         → no halt, no re-anchor;
 *                                                     re-open the owning phase
 *   R3  ≥1 High tagged `delta`, every HIGH finding
 *       is `local`, follow-up budget unspent        → one follow-up round
 *   R4  otherwise (High delta that is nonlocal, or
 *       the follow-up budget is spent)              → POSTMORTEM halt
 *
 * **Fail-closed default.** A non-approving confirmation that carries no
 * parseable `FINDING:` line at all — or that carries any malformed one, whose
 * severity is by definition unknowable — is credited with a synthetic
 * `{High, delta, nonlocal}` finding. That is exactly the v0.22.7 behaviour: an
 * untagged non-approving confirmation halts. The grammar buys leniency only for
 * confirmers that actually speak it; silence still means stop.
 *
 * Findings from APPROVING confirmers are counted too (they can only make the
 * verdict stricter — R1 has already been ruled out — and a High tagged `delta`
 * is a High tagged `delta` whoever wrote it), but no fail-closed finding is
 * synthesised for them: an approval is not silence.
 *
 * @param {{confirmations?: Array<{source?: string, approving?: boolean,
 *   findings?: Array<object>, malformed?: Array<string>}>,
 *   followUpAvailable?: boolean}} arg
 * @returns {{rule: string, nonApproving: string[], findings: Array<object>,
 *   failClosed: string[], highDelta: Array<object>, allLocal: boolean}}
 */
export function erratumGateDecision({ confirmations, followUpAvailable = false } = {}) {
  const list = Array.isArray(confirmations) ? confirmations.filter(Boolean) : [];
  const nonApproving = list.filter((c) => c.approving !== true);

  const findings = [];
  const failClosed = [];
  for (const confirmation of list) {
    const source = confirmation.source ?? "(unknown)";
    const parsed = Array.isArray(confirmation.findings) ? confirmation.findings : [];
    const malformed = Array.isArray(confirmation.malformed) ? confirmation.malformed : [];
    for (const finding of parsed) findings.push({ ...finding, source });
    if (confirmation.approving === true) continue;
    if (parsed.length > 0 && malformed.length === 0) continue;
    failClosed.push(source);
    findings.push({
      severity: "High",
      provenance: "delta",
      locality: "nonlocal",
      section: ERRATUM_FAIL_CLOSED_SECTION,
      text:
        parsed.length === 0
          ? "non-approving confirmation carried no parseable FINDING: line — read as High/delta/nonlocal, fail-closed"
          : `non-approving confirmation carried ${malformed.length} malformed FINDING: line${
              malformed.length === 1 ? "" : "s"
            } — read as High/delta/nonlocal, fail-closed`,
      source,
      failClosed: true,
    });
  }

  const sources = nonApproving.map((c) => c.source ?? "(unknown)");
  if (nonApproving.length === 0) {
    return { rule: "R1", nonApproving: [], findings, failClosed, highDelta: [], allLocal: true };
  }

  const highDelta = findings.filter((f) => f.severity === "High" && f.provenance === "delta");
  // The locality conjunct is measured over the HIGH findings, not over every
  // finding. PLAN §2.2 row R3 reads "every finding (any severity) is `local`",
  // and that literal reading cannot be what the rule means: row R2 states the
  // engine's standing High-only bar ("Mediums/Lows recorded, not gating — same
  // bar as the review loop") two rows above it, and the plan's own RT-1a
  // fixture — the POSTMORTEM-PR round the plan says must resolve to R3 —
  // carries a `Low | inherited | nonlocal` line alongside its High. Gating on
  // it would make R3 unreachable on the very episode it was designed for, and
  // would let a Low a reviewer noticed in passing halt a pipeline that no
  // High blocks. What the conjunct is protecting is the follow-up round's
  // scope ("scoped strictly to the section the prior erratum edited"), and the
  // follow-up is scoped by what blocks: the Highs.
  const allLocal = findings.every((f) => f.severity !== "High" || f.locality === "local");
  if (highDelta.length === 0) {
    return { rule: "R2", nonApproving: sources, findings, failClosed, highDelta, allLocal };
  }
  if (allLocal && followUpAvailable === true) {
    return { rule: "R3", nonApproving: sources, findings, failClosed, highDelta, allLocal };
  }
  return { rule: "R4", nonApproving: sources, findings, failClosed, highDelta, allLocal };
}

/**
 * Render parsed findings back into the canonical `FINDING:` grammar, one per
 * line, attributed to the confirmer that raised it. This is what the halt
 * payload carries instead of the pre-edit routed item list (PLAN §2.4 item 5):
 * the routed list is what the engine ASKED for, and by halt time the findings
 * are what actually blocks.
 *
 * @param {Array<object>} findings
 * @returns {string}
 */
export function formatConfirmationFindings(findings) {
  const list = Array.isArray(findings) ? findings.filter(Boolean) : [];
  if (list.length === 0) return "  (no parseable FINDING: lines)";
  return list
    .map(
      (f) =>
        `  ${f.source ?? "(unknown)"}: FINDING: ${f.severity} | ${f.provenance} | ` +
        `${f.locality} | ${f.section} | ${f.text}`
    )
    .join("\n");
}

/**
 * R2's re-open seam (PLAN §2.2 row R2).
 *
 * An inherited High is a real defect in the upstream document, but it is not a
 * defect the erratum channel introduced, and the erratum channel is not where
 * it gets fixed: it belongs to the owning phase's ordinary revision loop, under
 * that phase's existing `MAX_REVIEW_ROUNDS` / lifetime budgets. So instead of
 * halting, the run records that the upstream document's approval no longer
 * holds — the phase gate then refuses to skip that phase on the strength of it.
 *
 * The registry is a plain `Map` owned by the run, passed in rather than
 * captured, so this stays a function two tests can call directly.
 *
 * Deliberately scoped: this invalidates the RECORDED APPROVAL and nothing else.
 * Task T5's `UPSTREAM-STATE` cascade is the general staleness machinery, and
 * when it lands it should subsume this by making the same phase re-open through
 * the byte/state comparison rather than through an in-run flag. Nothing here
 * writes to disk, so there is nothing for T5 to unwind.
 *
 * @param {Map<string, object>} registry
 * @param {{docType: string, phase?: string, reason?: string}} entry
 * @returns {object|null} the recorded entry, or `null` when there is no registry
 */
export function markApprovalReopened(registry, { docType, phase, reason } = {}) {
  if (!registry || typeof registry.set !== "function" || !docType) return null;
  const entry = { docType, phase: phase ?? null, reason: reason ?? "" };
  registry.set(docType, entry);
  return entry;
}

/**
 * The read side of {@link markApprovalReopened}. Total: a missing registry, or
 * a doc type nobody re-opened, reads as `null`.
 *
 * @param {Map<string, object>} registry
 * @param {string} docType
 * @returns {object|null}
 */
export function reopenedApproval(registry, docType) {
  if (!registry || typeof registry.get !== "function" || !docType) return null;
  return registry.get(docType) ?? null;
}

// ─── TSPEC-PARSE-05: parseDecisionsWarranted ──────────────────────────────────

/**
 * Extract DECISIONS_WARRANTED value from an se-author post-PASS result.
 * @param {string | null | undefined} result - Raw agent result
 * @returns {boolean}  true if warranted (or absent/malformed); false only on explicit false
 */
export function parseDecisionsWarranted(result) {
  if (result == null || (typeof result === "string" && result.trim() === "")) {
    log(
      "WARNING: DECISIONS_WARRANTED field absent or malformed — defaulting to true"
    );
    return true;
  }

  const lines = result.split("\n");
  const reversed = lines.slice().reverse();

  for (const line of reversed) {
    const trimmed = line.trim();
    if (trimmed.startsWith("DECISIONS_WARRANTED: ")) {
      const rawValue = trimmed
        .slice("DECISIONS_WARRANTED: ".length)
        .trim()
        .toLowerCase();
      if (rawValue === "true") {
        return true;
      }
      if (rawValue === "false") {
        return false;
      }
      // value not recognized — fall through to absent handling
      break;
    }
  }

  // Field absent or value not recognized
  log(
    "WARNING: DECISIONS_WARRANTED field absent or malformed — defaulting to true"
  );
  return true;
}

// ─── TSPEC §5.0 — the one fenced-region-aware scanner ─────────────────────────

/**
 * Visit every line of `text` that lies OUTSIDE a fenced code region.
 *
 * FSPEC §1.2 rule 5 governs every mechanical scan this pipeline performs over a
 * markdown artifact; it is expressed here once and every scanner calls it. There
 * is no per-site fence handling anywhere else.
 *
 * Three properties the callers depend on:
 *  1. A closer must use the same fence character and a run at least as long as
 *     the opener — a three-backtick line inside a four-backtick block is content,
 *     which is exactly the case a quoted fenced template produces.
 *  2. An unclosed fence swallows the remainder of the file. That fails closed in
 *     the correct direction: fewer matches, so a phase runs rather than skipping.
 *  3. The exclusion governs which lines may *match a scanned pattern*; it does
 *     not empty a section's body (§5.9 counts a fenced block as body content).
 *
 * Total: any input is coerced, nothing throws, the return is undefined.
 *
 * @param {string} text - the artifact text.
 * @param {function(string, number): void} visit - called as `visit(line, index)`
 *   for each unfenced line, where `index` is the line's index in `text.split("\n")`.
 * @returns {void}
 */
export function scanLines(text, visit) {
  const lines = String(text ?? "").split("\n");
  let fenceChar = null; // "`" | "~" | null
  let fenceLen = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = /^\s*(`{3,}|~{3,})/.exec(line);
    if (fenceChar === null) {
      if (m) {
        fenceChar = m[1][0];
        fenceLen = m[1].length;
      } // opener: the line is not visited
      else visit(line, i);
    } else if (m && m[1][0] === fenceChar && m[1].length >= fenceLen) {
      fenceChar = null;
      fenceLen = 0; // closer: the line is not visited
    }
    // lines inside a fence, and the fence lines themselves, are never visited
  }
}

// ─── TSPEC §5.3 — the content digest: inlined, pure, no seam ──────────────────
//
// The workflow runtime has no `crypto` and no `TextEncoder`, so SHA-256 and the
// UTF-8 encoding beneath it are hand-rolled here in `Number`-only arithmetic (no
// `BigInt`). This family is deliberately NOT a seam: a seam exists to reach a
// capability the runtime lacks, and a deterministic synchronous digest over an
// in-memory string needs none — a seam would only add an awaitable boundary on
// the hot path of every approval comparison and let a double return a hash the
// production code never computes (§3.7).

/**
 * Canonicalise `text` before it is digested.
 *
 * N-1 normalises line endings (CRLF and lone CR both become LF); N-2 forces
 * exactly one trailing newline. Both are applied INSIDE `sha256Hex`, never by a
 * caller, so no two call sites can disagree about which bytes were digested —
 * the defect class where a write path and a read path produce different hashes
 * and every approval reads STALE.
 *
 * Total and idempotent: `canonicaliseForDigest(canonicaliseForDigest(t))` is
 * `canonicaliseForDigest(t)` for every input, including `null` and `undefined`.
 *
 * @param {string} text
 * @returns {string} the canonical form — LF-only, exactly one trailing newline.
 */
export function canonicaliseForDigest(text) {
  const lf = String(text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n"); // N-1
  return lf.replace(/\n*$/, "\n"); // N-2
}

/**
 * Encode `text` as UTF-8, by hand, because the runtime has no `TextEncoder`.
 *
 * Surrogate pairs are combined into their astral scalar value (the case a wrong
 * encoder gets wrong); an UNPAIRED surrogate is encoded as the three-byte form
 * of its own code unit, which is deterministic and total rather than throwing.
 *
 * @param {string} text
 * @returns {number[]} the bytes, each in 0…255.
 */
export function utf8Bytes(text) {
  const s = String(text ?? "");
  const out = [];
  for (let i = 0; i < s.length; i++) {
    const cp = s.codePointAt(i);
    if (cp > 0xffff) i++; // a well-formed surrogate pair consumed two code units
    if (cp < 0x80) {
      out.push(cp);
    } else if (cp < 0x800) {
      out.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
    } else if (cp < 0x10000) {
      out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    } else {
      out.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f)
      );
    }
  }
  return out;
}

/** SHA-256 round constants (FIPS 180-4) — the first 32 bits of the fractional
 *  parts of the cube roots of the first 64 primes. */
const SHA256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

/** Right-rotate a 32-bit word. */
function rotr32(x, n) {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

/** Two 32-bit words added modulo 2^32. Both operands are < 2^32, so the sum is
 *  < 2^33 and therefore exactly representable as a `Number` before truncation. */
function add32(a, b) {
  return (a + b) >>> 0;
}

/**
 * SHA-256 of `text`, as 64 lowercase hex characters.
 *
 * `canonicaliseForDigest` is applied HERE, inside the digest, so no call site can
 * digest un-canonicalised bytes (§5.3 N-1/N-2) — that is the whole reason this
 * function, and not its callers, owns the normalisation.
 *
 * `Math`, `>>>`, `|`, `^` and `Number` only: no `crypto`, no `BigInt`, no
 * `TextEncoder` (C-2).
 *
 * @param {string} text
 * @returns {string} 64 lowercase hex characters.
 */
export function sha256Hex(text) {
  const bytes = utf8Bytes(canonicaliseForDigest(text));

  // Message length in BITS, as two 32-bit halves — `bytes.length * 8` can exceed
  // 2^32, and `<<` would silently wrap.
  const bitLenHi = Math.floor((bytes.length * 8) / 4294967296) >>> 0;
  const bitLenLo = (bytes.length * 8) % 4294967296 >>> 0;

  const padded = bytes.slice();
  padded.push(0x80);
  while (padded.length % 64 !== 56) padded.push(0);
  padded.push(
    (bitLenHi >>> 24) & 0xff,
    (bitLenHi >>> 16) & 0xff,
    (bitLenHi >>> 8) & 0xff,
    bitLenHi & 0xff,
    (bitLenLo >>> 24) & 0xff,
    (bitLenLo >>> 16) & 0xff,
    (bitLenLo >>> 8) & 0xff,
    bitLenLo & 0xff
  );

  // Initial hash values: the fractional parts of the square roots of the first
  // eight primes.
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Array(64);
  for (let block = 0; block < padded.length; block += 64) {
    for (let t = 0; t < 16; t++) {
      const o = block + t * 4;
      w[t] =
        ((padded[o] << 24) |
          (padded[o + 1] << 16) |
          (padded[o + 2] << 8) |
          padded[o + 3]) >>>
        0;
    }
    for (let t = 16; t < 64; t++) {
      const s0 = (rotr32(w[t - 15], 7) ^ rotr32(w[t - 15], 18) ^ (w[t - 15] >>> 3)) >>> 0;
      const s1 = (rotr32(w[t - 2], 17) ^ rotr32(w[t - 2], 19) ^ (w[t - 2] >>> 10)) >>> 0;
      w[t] = add32(add32(w[t - 16], s0), add32(w[t - 7], s1));
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let t = 0; t < 64; t++) {
      const S1 = (rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25)) >>> 0;
      const ch = ((e & f) ^ (~e & g)) >>> 0;
      const temp1 = add32(add32(add32(h, S1), add32(ch, SHA256_K[t])), w[t]);
      const S0 = (rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22)) >>> 0;
      const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      const temp2 = add32(S0, maj);

      h = g;
      g = f;
      f = e;
      e = add32(d, temp1);
      d = c;
      c = b;
      b = a;
      a = add32(temp1, temp2);
    }

    h0 = add32(h0, a);
    h1 = add32(h1, b);
    h2 = add32(h2, c);
    h3 = add32(h3, d);
    h4 = add32(h4, e);
    h5 = add32(h5, f);
    h6 = add32(h6, g);
    h7 = add32(h7, h);
  }

  const words = [h0, h1, h2, h3, h4, h5, h6, h7];
  let hex = "";
  for (const word of words) hex += `0000000${(word >>> 0).toString(16)}`.slice(-8);
  return hex;
}

/**
 * The prefixed form persisted as `APPROVAL-HASH:` (§4.4) and compared by §5.5.
 * There is exactly one digest in this pipeline: this is `sha256Hex` plus the
 * prefix, so the write path and the read path cannot diverge (A-11).
 *
 * @param {string} text
 * @returns {string} `sha256:{64 lowercase hex}`
 */
export function approvalHashOf(text) {
  return `sha256:${sha256Hex(text)}`;
}

// ─── DEC-APPROVAL-03 (2026-08-10) — line-number-anchor neutralisation ─────────
//
// Operator decision, taken after a measured cost: on `pdlc-consolidation-agent`
// six edits that changed NOTHING but a `file:line` anchor — `SKILL.md:70-78`
// became `SKILL.md:70-79` because an unrelated line was inserted above it — each
// staled a recorded approval and re-opened its phase's review loop. Four phases,
// ~25 extra Opus rounds, zero semantic change under review.
//
// Approval freshness is therefore SEMANTIC: line-number-anchor churn is not a
// change to what was approved. Every other byte still is. The normalisation
// below is deliberately the smallest one that covers the measured failure and
// nothing else — in doubt, a shape is LEFT ALONE, because the fallback of
// leaving it alone is exactly today's behaviour (a re-review), while the
// fallback of neutralising too much is an approval that outlives its document.

/**
 * The two token shapes neutralised, and only these two:
 *
 *   A. a path-anchored `:{digits}` / `:{digits}-{digits}` — the `file:line`
 *      citation. The token BEFORE the colon must contain a `.` or a `/`, which
 *      is what separates `orchestrate-dev.js:1842` and `docs/x/REQ-y.md:70-78`
 *      from a clock time (`12:30`), a ratio (`3:1`) or a numbered list.
 *   B. a backtick-opened `` `:{digits}` `` / `` `:{digits}-{digits}` `` — the
 *      abbreviated cell anchor review tables use once the filename is in a
 *      neighbouring column (`` `:70-79` ``).
 *
 * Both collapse the digit span to `*`, so `:70-78` and `:70-79` become `:*-*`
 * and a single-line `:1842` becomes `:*`. A one-line anchor and a range anchor
 * stay DISTINGUISHABLE (`:*` ≠ `:*-*`): widening a citation from one line to a
 * range is an editorial change, not pure movement.
 *
 * Not touched, on purpose: `v1.5`, `T20`, `§5.3`, prose ("see line 70"),
 * durations, versions, times, and any digits not immediately after a colon.
 */
const APPROVAL_PATH_ANCHOR_RE =
  /([A-Za-z0-9_~@][A-Za-z0-9_@~.\-/]*[./][A-Za-z0-9_@~.\-/]*):(\d+)(?:-(\d+))?(?![\w.-])/g;
const APPROVAL_CELL_ANCHOR_RE = /`:(\d+)(?:-(\d+))?`/g;

/**
 * Canonicalise `text` for the SEMANTIC approval comparison (DEC-APPROVAL-03).
 *
 * Pure, total, synchronous; no seam, no throw, no IO. Idempotent: the output
 * contains no token either regex can still match, so normalising twice is
 * normalising once — which is what lets a normalised digest be compared against
 * a normalised digest without asking which side was normalised when.
 *
 * @param {string} text
 * @returns {string} the same document with line-number anchors neutralised.
 */
export function normalizeForApproval(text) {
  return String(text ?? "")
    .replace(APPROVAL_PATH_ANCHOR_RE, (_m, head, _a, b) => `${head}:${b == null ? "*" : "*-*"}`)
    .replace(APPROVAL_CELL_ANCHOR_RE, (_m, _a, b) => `\`:${b == null ? "*" : "*-*"}\``);
}

/**
 * The digest an `APPROVAL-HASH-NORMALIZED:` line carries: `approvalHashOf` over
 * `normalizeForApproval`'s output. One digest function, one prefix, one write
 * path and one read path — the same A-11 discipline `approvalHashOf` states.
 *
 * @param {string} text
 * @returns {string} `sha256:{64 lowercase hex}`
 */
export function approvalHashOfNormalized(text) {
  return approvalHashOf(normalizeForApproval(text));
}

// ─── TSPEC §4.3 / §5.3 / §5.8 — the record parsers ────────────────────────────
//
// All five are total, synchronous, take no seam, and read the artifact through
// `scanLines`, so a marker quoted inside a fenced region never counts.

/**
 * The six skip-eligible phase ids `forcePhases` accepts, and the SAME array the
 * operator-facing rejection message is rendered from (§5.7, §6.2 row 12), so the
 * catalogue and the message cannot desynchronise. `PR` entered the catalogue at
 * REQ/FSPEC v1.6; a hand-written message would have been the one site that kept
 * silently teaching the operator the old five-token set.
 */
const FORCE_PHASE_TOKENS = Object.freeze(["R", "F", "T", "P", "D", "PR"]);

/**
 * A tier-1 approval anchor LINE, by key alone (DEC-BAR-02).
 *
 * Deliberately keyed on the field name and not on the value grammar: this is
 * used by `parseVerdict` to recognise "a line the append step is allowed to put
 * here", and a MALFORMED anchor is still an anchor — it is emphatically not a
 * counts line, and must not be fed to `JSON.parse` as if it were. Anchor
 * well-formedness is `readApprovalRecord`'s job (§4.4), and it keeps it.
 */
const APPROVAL_ANCHOR_LINE =
  /^(APPROVAL-HASH(-NORMALIZED)?|REVIEWED-COMMIT|UPSTREAM-STATE):/;

/** `sha256:` + 64 lowercase hex — the only well-formed APPROVAL-HASH value. */
const APPROVAL_HASH_VALUE_RE = /^sha256:[0-9a-f]{64}$/;
/** A commit sha as `REVIEWED-COMMIT:` may carry it: abbreviated or full lowercase hex. */
const REVIEWED_COMMIT_VALUE_RE = /^[0-9a-f]{7,40}$/;
/** The literal stored when no usable commit sha could be determined (§4.3, §4.4). */
const COMMIT_UNAVAILABLE = "unavailable";

/**
 * Read the tier-1 approval record out of a cross-review file (§4.4, §5.3).
 *
 * `HASH_FAILURES` describes the `APPROVAL-HASH:` line and nothing else.
 * `REVIEWED-COMMIT:` has no failure value because it has no failure: when it is
 * absent outside a fence, duplicated, or carries a value that is not lowercase
 * hex, `reviewedCommit` is the literal `"unavailable"` and `ok` stays `true`.
 * That is safe in the only direction that matters — §5.5's comparison never
 * reads the field (content-addressing is what makes the mechanism rebase-proof),
 * and degrading such a record to UNEVALUABLE would re-run a converged phase over
 * a field nothing consults.
 *
 * `APPROVAL-HASH-NORMALIZED:` (DEC-APPROVAL-03) is read the same way, with one
 * deliberate asymmetry: it has no failure value either. Absent, duplicated or
 * malformed, `normalizedHash` is `null` and `ok` is untouched — an approval
 * recorded before this field existed must keep behaving exactly as it did, and
 * the field can only ever GRANT freshness the raw hash already refused, never
 * withdraw any.
 *
 * @param {string} fileText
 * @returns {{ok: true, hash: string, normalizedHash: string|null, reviewedCommit: string}
 *          |{ok: false, reason: string}} `reason` is a `HASH_FAILURES` member.
 */
export function parseApprovalHash(fileText) {
  const hashes = [];
  const normalized = [];
  const commits = [];
  /** PLAN §3.1 — one `{docType, hash}` per readable `UPSTREAM-STATE:` line. */
  const upstreamState = [];
  const upstreamSeen = new Set();
  scanLines(fileText, (line) => {
    const h = /^\s*APPROVAL-HASH:\s*(\S*)\s*$/.exec(line);
    if (h) hashes.push(h[1]);
    const n = /^\s*APPROVAL-HASH-NORMALIZED:\s*(\S*)\s*$/.exec(line);
    if (n) normalized.push(n[1]);
    const c = /^\s*REVIEWED-COMMIT:\s*(\S*)\s*$/.exec(line);
    if (c) commits.push(c[1]);
    // PLAN §3.1 — the cascade anchor. Read on exactly the terms the raw
    // anchor is read on: a malformed value is NOT a failure of the record,
    // it is simply not an observation (grandfathering, PLAN §7.1/Q-2 —
    // an approval with no readable UPSTREAM-STATE line is byte-ruled only).
    // A doc type repeated across lines keeps its FIRST value: the same
    // "duplicated history is not adopted" asymmetry the raw anchor uses,
    // narrowed to the one row rather than the whole record.
    const u = /^\s*UPSTREAM-STATE:\s*([A-Z]+)\s+(\S*)\s*$/.exec(line);
    if (
      u &&
      ERRATUM_DOC_TYPES.includes(u[1]) &&
      APPROVAL_HASH_VALUE_RE.test(u[2]) &&
      !upstreamSeen.has(u[1])
    ) {
      upstreamSeen.add(u[1]);
      upstreamState.push({ docType: u[1], hash: u[2] });
    }
  });

  if (hashes.length === 0) return { ok: false, reason: "absent" };
  if (hashes.length > 1) return { ok: false, reason: "duplicated" };
  if (!APPROVAL_HASH_VALUE_RE.test(hashes[0])) return { ok: false, reason: "unparseable" };

  const reviewedCommit =
    commits.length === 1 && REVIEWED_COMMIT_VALUE_RE.test(commits[0])
      ? commits[0]
      : COMMIT_UNAVAILABLE;

  const normalizedHash =
    normalized.length === 1 && APPROVAL_HASH_VALUE_RE.test(normalized[0]) ? normalized[0] : null;

  return { ok: true, hash: hashes[0], normalizedHash, reviewedCommit, upstreamState };
}

// ─── TSPEC §5.1 — verdict extraction from a FILE ──────────────────────────────

/**
 * Read a reviewer's verdict out of a cross-review **file** (§5.1), reusing
 * `parseVerdict` unmodified.
 *
 * **Lenient contract** (operator decision, 2026-08-08 — see
 * `docs/_decisions/DECISIONS-review-severity-bars.md`). The strict reading — a
 * mandatory trailing `## Verdict` heading plus a fail-closed duplicate pre-count
 * — rejected substantively-approved reviews on formatting alone and cost whole
 * extra rounds. Both rejections are gone:
 *
 * 1. **No heading is required.** `scanLines` runs over the whole file and records
 *    the index of the LAST non-fenced `VERDICT: ` line; the section handed to
 *    `parseVerdict` is that line to EOF. The `## Verdict` heading remains the
 *    recommended format — it is convention, not a parse requirement.
 * 2. **Fences are still skipped.** `scanLines` never visits a fenced line, so a
 *    block that *quotes* the grammar — as this feature's own TSPEC §4.4 does —
 *    can never be mistaken for a verdict.
 * 3. **Last one wins.** Several `VERDICT: ` lines no longer fail closed; the last
 *    non-fenced one is authoritative, which is also what `parseVerdict`'s own
 *    reverse scan would pick.
 * 4. **`parseVerdict(section, roleSlug)`**, unchanged. It still returns
 *    `malformed: true` for a value outside the catalogue or an unparseable counts
 *    line, and that still fails closed at the callers.
 *
 * No non-fenced `VERDICT: ` line anywhere ⇒ no verdict ⇒ the phase runs.
 *
 * @param {string|null|undefined} fileText
 * @param {string} roleSlug - for `parseVerdict`'s warning text only.
 * @returns {{ok: true, verdict: string, high: number, medium: number,
 *            low: number, malformed?: boolean}
 *          |{ok: false, reason: "no_verdict_line"}}
 */
function extractFileVerdict(fileText, roleSlug) {
  const text = String(fileText ?? "");
  const lines = text.split("\n");

  let verdictIndex = -1;
  scanLines(text, (line, index) => {
    if (line.trim().startsWith("VERDICT: ")) verdictIndex = index;
  });
  if (verdictIndex === -1) return { ok: false, reason: "no_verdict_line" };

  const section = lines.slice(verdictIndex).join("\n");

  return { ok: true, ...parseVerdict(section, roleSlug) };
}

/**
 * Read an author's `REVISION-COMPLETE:` trailer out of its response (§4.3).
 *
 * Called ONLY on a revision episode (§5.6.2): a greenfield episode's terminal
 * test is structural completeness alone, so `absent` never arises there and no
 * greenfield episode can be held back by a trailer its SKILL was never amended
 * to emit. All four failure reasons are non-terminal — none of them ends an
 * episode, `declared_incomplete` least of all, which is the normal paced path.
 *
 * @param {string} response
 * @returns {{complete: true}|{complete: false, reason: string}} `reason` is a
 *   `TRAILER_FAILURES` member.
 */
export function parseRevisionComplete(response) {
  const values = [];
  scanLines(response, (line) => {
    const m = /^\s*REVISION-COMPLETE:\s*(\S*)\s*$/.exec(line);
    if (m) values.push(m[1]);
  });

  if (values.length === 0) return { complete: false, reason: "absent" };
  if (values.length > 1) return { complete: false, reason: "duplicated" };

  const value = values[0].toLowerCase();
  if (value === "yes") return { complete: true };
  if (value === "no") return { complete: false, reason: "declared_incomplete" };
  return { complete: false, reason: "unparseable" };
}

/**
 * Read a POSTMORTEM's `RESOLVED:` marker (§5.8).
 *
 * The marker is positionally unconstrained — a `RESOLVED:` line anywhere outside
 * a fenced region counts — and is HUMAN-WRITTEN ONLY. No agent and no script
 * ever writes `yes`; a POSTMORTEM resolves when a person says it did.
 *
 * Absence and malformation are reported here as `ok: false`; §5.8's
 * `checkPostmortem` maps both onto `unresolved`, failing closed, because a
 * POSTMORTEM whose marker cannot be read costs an operator one edit whereas the
 * opposite default silently re-runs a phase that failed for an unfixed reason.
 *
 * @param {string} fileText
 * @returns {{ok: true, resolved: boolean}|{ok: false, reason: string}}
 */
export function parseResolvedMarker(fileText) {
  const values = [];
  scanLines(fileText, (line) => {
    const m = /^\s*RESOLVED:\s*(\S*)\s*$/.exec(line);
    if (m) values.push(m[1]);
  });

  if (values.length === 0) return { ok: false, reason: "absent" };
  if (values.length > 1) return { ok: false, reason: "duplicated" };

  const value = values[0].toLowerCase();
  if (value === "yes") return { ok: true, resolved: true };
  if (value === "no") return { ok: true, resolved: false };
  return { ok: false, reason: "unparseable" };
}

/** §5.8's truncation ceiling for the recommendation carried into a halt message. */
const RECOMMENDATION_MAX_BYTES = 4000;

/**
 * Take the `## Recommendation` section of a POSTMORTEM — heading located via
 * `scanLines`, so a quoted heading inside a fence is not mistaken for the real
 * one — up to the next top-level heading or EOF (§5.8).
 *
 * The BODY is sliced from the raw lines rather than from the visited ones: the
 * fenced-region exclusion governs which lines may match a scanned pattern, it
 * does not empty a section's body (§5.0 property 3), so a recommendation whose
 * content is a code fence survives intact.
 *
 * Truncated at 4,000 bytes with an explicit notice, because this text feeds the
 * halt message so the operator sees what to do without opening the file.
 *
 * @param {string} fileText
 * @returns {string} the recommendation body, or `""` when there is no such section.
 */
export function extractRecommendation(fileText) {
  const lines = String(fileText ?? "").split("\n");
  let headingIndex = -1;
  let nextHeadingIndex = -1;
  scanLines(fileText, (line, index) => {
    if (headingIndex === -1) {
      if (/^\s*##\s+Recommendation\s*$/.test(line)) headingIndex = index;
    } else if (nextHeadingIndex === -1 && /^#{1,2}\s/.test(line)) {
      nextHeadingIndex = index;
    }
  });

  if (headingIndex === -1) return "";
  const end = nextHeadingIndex === -1 ? lines.length : nextHeadingIndex;
  const body = lines.slice(headingIndex + 1, end).join("\n").trim();

  if (body.length <= RECOMMENDATION_MAX_BYTES) return body;
  return `${body.slice(0, RECOMMENDATION_MAX_BYTES)}\n\n[truncated at ${RECOMMENDATION_MAX_BYTES} bytes — see the POSTMORTEM for the rest]`;
}

/**
 * Parse the operator's raw `forcePhases` string (§5.7).
 *
 * Total, case-sensitive, whitespace- and comma-tolerant. Absent and empty are
 * the same thing: the empty set. An invalid token halts before any phase runs,
 * with the operator-facing text ending `Valid: R, F, T, P, D, PR, all.` — the
 * token catalogue and that message are derived from the SAME array, so they
 * cannot desynchronise. That derivation is load-bearing: `PR` entered the
 * catalogue at REQ/FSPEC v1.6, and a hand-written message would have been the
 * one site that silently kept teaching the operator the old five-token set.
 *
 * `all` means SIX phases, not five.
 *
 * Precedence (§5.7): forcing overrides a recorded APPROVAL — §2.5 steps 3 and 4
 * only — and never a recorded FAILURE. Step 2 is NOT skipped: `deriveRoundWindow`
 * still runs, because entering `reviewLoop` on the shipped `iteration = 1`
 * default on a branch that already carries `-v1` files re-creates H-1 on the one
 * path an operator reaches for precisely because the phase was reviewed before.
 *
 * @param {string} raw
 * @returns {{ok: true, phases: Set<string>}|{ok: false, badTokens: string[]}}
 */
export function parseForcePhases(raw) {
  if (raw == null || String(raw).trim() === "") return { ok: true, phases: new Set() };
  const tokens = String(raw).split(/[,\s]+/).filter(Boolean);
  const valid = FORCE_PHASE_TOKENS; // six — "PR" added at REQ/FSPEC v1.6
  const bad = tokens.filter((t) => t !== "all" && !valid.includes(t));
  if (bad.length) return { ok: false, badTokens: bad };
  return { ok: true, phases: tokens.includes("all") ? new Set(valid) : new Set(tokens) };
}

// ─── TSPEC §5.5 — staleness ───────────────────────────────────────────────────

/**
 * Is a recorded approval hash still describing the document on disk?
 *
 * Three rules with teeth (§5.5), all of them structural rather than documented:
 *
 * 1. **Read at comparison time.** `documentBytes` is whatever the caller read at
 *    the moment of comparison — never a read cached earlier in the run, which is
 *    how a document edited between phases gets skipped as fresh.
 * 2. **No history walk** (O-8, as narrowed at FSPEC v1.5). One hash equality. No
 *    `git log` of the document, no reconstruction of past bytes.
 * 3. **Rebase invariance.** The comparison never reads `REVIEWED-COMMIT`. Phase
 *    DOD rebases `feat-{feature}` before every PR and rewrites every sha on the
 *    branch; a sha- or timestamp-based test would report every approval stale at
 *    that moment. Content-addressing is unaffected because content is unaffected.
 *    This is enforced by the signature, not by a comment: neither parameter is a
 *    commit, so there is no argument through which a sha could reach the compare.
 *
 * Only `FRESH` grants the skip. `STALE` and `UNEVALUABLE` both fall to §2.5 step
 * G and run the phase — FSPEC §1.2 rule 4's uniform direction: wherever a
 * machine-readable field cannot be read, the behaviour is *more* work, never less.
 *
 * Pure, total and synchronous: no seam, no throw, no IO (§3.7).
 *
 * @param {string} recordedHash - the `sha256:{64 hex}` literal carried by the
 *   approval record, copied verbatim — never recomputed over the working tree.
 * @param {string} documentBytes - the document's bytes, read at comparison time.
 * @returns {"FRESH"|"STALE"|"UNEVALUABLE"}
 */
export function isStale(recordedHash, documentBytes) {
  return isStaleByHash(recordedHash, approvalHashOf(documentBytes));
}

/**
 * `isStale`'s comparison, over a document DIGEST rather than the document's
 * bytes. Same three outcomes, same rules 1–3: the only difference is who paid
 * for the digest.
 *
 * It exists because the transport under `_readFile` in the workflow runtime is
 * a fan-out of one agent per ~6 KB chunk, so reading a 300 KB REQ *only* to
 * hash it costs ~52 agents for 64 hex characters. `_hashFile` computes the
 * digest at the far side of the seam in a single agent, and this function is
 * the comparison that accepts it. `isStale` is preserved verbatim on top, so
 * the byte-taking form remains the tested definition of the outcome.
 *
 * Pure, total and synchronous: no seam, no throw, no IO (§3.7).
 *
 * @param {string} recordedHash - the `sha256:{64 hex}` literal from the record.
 * @param {string} documentHash - the document's digest in `approvalHashOf` form.
 * @returns {"FRESH"|"STALE"|"UNEVALUABLE"}
 */
export function isStaleByHash(recordedHash, documentHash) {
  if (typeof recordedHash !== "string" || !/^sha256:[0-9a-f]{64}$/.test(recordedHash))
    return "UNEVALUABLE";
  return documentHash === recordedHash ? "FRESH" : "STALE";
}

/**
 * PLAN §3.1 — serialise an upstream-state list into anchor lines.
 *
 * Pure, total, synchronous. `[]` (and anything that is not a list of
 * well-formed rows) serialises to `""`, i.e. to the pre-T5 anchor block.
 *
 * @param {{docType: string, hash: string}[]} rows
 * @returns {string}
 */
export function upstreamStateLines(rows) {
  if (!Array.isArray(rows)) return "";
  return rows
    .filter(
      (r) =>
        r &&
        ERRATUM_DOC_TYPES.includes(r.docType) &&
        typeof r.hash === "string" &&
        APPROVAL_HASH_VALUE_RE.test(r.hash)
    )
    .map((r) => `UPSTREAM-STATE: ${r.docType} ${r.hash}\n`)
    .join("");
}

/**
 * PLAN §3.1 — §5.5's second staleness rule: is the approval still describing
 * the UPSTREAM the reviewers approved against?
 *
 * The byte rule (`isStale`) answers "have the approved document's own bytes
 * moved". This answers "have the bytes it derives from moved", which is the
 * question POSTMORTEM-P and POSTMORTEM-D §4.1 both name: an approval can be
 * byte-FRESH and still describe a world that no longer exists, because a
 * later erratum edited the layer above it.
 *
 * Grandfathering (PLAN §7.1, architect ruling Q-2): a record carrying NO
 * `UPSTREAM-STATE` rows yields `[]` — not "stale", not "unevaluable". Every
 * anchor written before this feature is such a record, and every one of them
 * keeps behaving byte-rule-only, exactly as it does today.
 *
 * Pure, total, synchronous: the caller supplies both observations.
 *
 * @param {{docType: string, hash: string}[]} recorded - the record's rows.
 * @param {Map<string, string|null>} current - doc type → digest right now.
 *   A doc type absent from the map, or mapped to `null`, is NOT observed and
 *   therefore never moved: the same "unreadable is not changed" asymmetry
 *   `deriveUpstreamState` keeps.
 * @returns {string[]} the doc types whose bytes moved since the approval.
 */
export function upstreamStateDrift(recorded, current) {
  if (!Array.isArray(recorded) || !current || typeof current.get !== "function") return [];
  const moved = [];
  for (const row of recorded) {
    if (!row || !ERRATUM_DOC_TYPES.includes(row.docType)) continue;
    const now = current.get(row.docType);
    if (now == null) continue;
    if (now !== row.hash) moved.push(row.docType);
  }
  return moved;
}

// ─── TSPEC §5.9 / FSPEC §16 — structural completeness ─────────────────────────
//
// Four wrapped artifact classes. The criterion is deliberately **shallow** and
// script-decidable (C-5) over the only evidence available — the artifact on disk.
// Anything richer would need an agent in the terminal decision, which is the loop
// this feature exists to bound; §4.5's counters, not this test, are what bound a
// badly behaved episode (FSPEC §16.2).

/**
 * The six spec classes' required top-level headings (TSPEC §5.9 = FSPEC §16.2).
 *
 * `title` is the **canonical** name — the form §5.9 lists first, and the form
 * `missing` carries even when the document rendered an alias or a case/spacing/
 * numeric-prefix variant. `alts` is the **curated alias list** §5.9's rows accept
 * as equivalent, matched (like the whole table now) by normalised, word-boundary
 * containment rather than exact equality: a concern-organized spec whose author
 * numbered and described its sections (`## 4. The advisory core — types, SeamOps
 * protocol, …`) satisfies the required concepts (`Interfaces`, `Data Model`)
 * without carrying their canonical headings verbatim. `[]` where the row admits no
 * alias. See `isComplete`'s `shortfall` for the matcher and its boundary rules.
 */
const REQUIRED_HEADINGS = Object.freeze({
  REQ: Object.freeze([
    { title: "Problem / Context", alts: ["Context", "Problem", "Background"] },
    { title: "Goals", alts: ["Objectives"] },
    { title: "Non-Goals", alts: ["Scope", "Out of scope"] },
    { title: "Constraints", alts: [] },
    { title: "Acceptance Criteria", alts: ["Acceptance"] },
    { title: "Risks", alts: [] },
    { title: "Obligations", alts: ["Open Questions", "Assumptions"] },
  ]),
  FSPEC: Object.freeze([
    { title: "Overview", alts: ["Scope", "Summary", "Context"] },
    { title: "Linked Requirements", alts: [] },
    { title: "Behavioral Flow", alts: [] },
    { title: "Business Rules", alts: [] },
    { title: "Edge Cases and Error Scenarios", alts: [] },
    { title: "Acceptance Tests", alts: [] },
    { title: "Open Questions", alts: ["Obligations", "Assumptions"] },
  ]),
  TSPEC: Object.freeze([
    { title: "Overview", alts: ["Scope", "Summary", "Context", "Introduction"] },
    { title: "Architecture", alts: ["Design"] },
    { title: "Interfaces", alts: ["Interface", "Protocol", "Protocols", "Seams", "APIs", "API"] },
    { title: "Data Model", alts: ["Types", "State", "Schema", "Data structures"] },
    { title: "Test Strategy", alts: ["Testing", "Test plan", "Verification"] },
    { title: "Open Questions", alts: ["Obligations", "Assumptions", "Risks", "Decisions"] },
  ]),
  PLAN: Object.freeze([
    { title: "Overview", alts: ["Scope", "Summary"] },
    { title: "Batches", alts: ["Tasks", "Work breakdown"] },
    { title: "Dependencies", alts: ["Ordering"] },
    { title: "Verification", alts: ["Testing", "Validation"] },
  ]),
  PROPERTIES: Object.freeze([
    { title: "Overview", alts: ["Scope", "Summary"] },
    { title: "Properties", alts: ["Invariants"] },
    { title: "Oracles", alts: ["Checks", "Test Oracles"] },
    { title: "Fixtures", alts: ["Generators", "Test data", "Test Fixtures"] },
  ]),
  DECISIONS: Object.freeze([
    { title: "Context", alts: ["Background"] },
    { title: "Options Considered", alts: ["Options", "Alternatives"] },
    { title: "Decision", alts: ["Chosen", "Resolution"] },
    { title: "Consequences", alts: ["Tradeoffs", "Implications"] },
  ]),
});

/**
 * LEARNINGS' five numbered sections, as `harvest-learnings/SKILL.md` mandates
 * them (FSPEC §16.5). `## 6. Approval Record` is **deliberately absent**: the
 * record is best-effort (AC-4.2c), and making it part of the terminal criterion
 * would let a record-writing bug re-dispatch harvest to MAX_AUTHORING_DISPATCHES
 * and then halt the phase over an optimisation's bookkeeping.
 *
 * Matched by normalised prefix, so `## 3. Rejected Proposals (with rationale)`
 * satisfies `Rejected Proposals`.
 */
const LEARNINGS_SECTIONS = Object.freeze([
  "Non-Convergences",
  "Cross-Feature Patterns",
  "Rejected Proposals",
  "Process Learnings",
  "Open Items for Consolidation",
]);

/**
 * FSPEC §16.5's **other** conjunct: the metadata table's `Harvested from` row.
 *
 * §16.5 states the LEARNINGS criterion as "the metadata table including its
 * `Harvested from` row, AND its five numbered sections each with a non-empty
 * body". TSPEC §5.9's restatement drops the first half; §16 owns the
 * structural-completeness criteria and governs, so the conjunct is implemented
 * here (CR F-2) and the TSPEC narrowing is documentation drift for Harvest.
 *
 * Why it matters and not merely tidiness: `harvest-learnings` step 8 deletes
 * every `CROSS-REVIEW-*` / `CODE_REVIEW-*` once the episode reaches terminal, and
 * `guard-harvest-before-delete.sh` checks only that the LEARNINGS file exists.
 * This row is the record of **what was deleted** — the one thing whose absence is
 * unrecoverable.
 *
 * Matched like §16.4's `Scope:` marker: one cheap, case-insensitive line scan,
 * through `scanLines` so a row quoted inside a fenced template block (as the
 * SKILL's own format section carries it) is not the document's own table.
 */
const HARVESTED_FROM_ROW = /^\s*\|\s*harvested\s+from\s*\|/i;

/**
 * §16.5's per-class resume clause for the absent row — the branch FSPEC names
 * "when all five are satisfied", which was unreachable while the five sections
 * were the whole criterion. Appended **last** to `missing`, so
 * `firstUnwrittenSection` names an unwritten section ahead of it.
 */
const HARVESTED_FROM_CLAUSE = '(the metadata table\'s "Harvested from" row)';

function hasHarvestedFromRow(fileText) {
  let found = false;
  scanLines(fileText, (line) => {
    if (!found && HARVESTED_FROM_ROW.test(line)) found = true;
  });
  return found;
}

/** A top-level `##` heading — never `###`, up to three leading spaces. */
const TOP_LEVEL_HEADING = /^ {0,3}##(?!#)\s+(.+?)\s*$/;

/**
 * §5.9's matching rules as one function: case-insensitive, whitespace-normalised,
 * a leading `N.` / `N)` numeric prefix ignored.
 */
function normaliseHeadingTitle(raw) {
  return String(raw ?? "")
    .replace(/^\s*\d+[.)]\s*/, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/**
 * Word-boundary-aware substring containment — the spec gate's matcher (see
 * `isComplete`'s `shortfall`). `term` matches inside `hay` when it occurs
 * delimited on both sides by anything that is NOT a word char, or by a string
 * edge. A word char is `[a-z0-9-]` (hyphen included), which is the whole point:
 *
 *   - `hay="non-goals"`, `term="goals"` → NO match (the `-` before `goals` is a
 *     word char), so `Non-Goals` never satisfies `Goals`;
 *   - `hay="decisions"`, `term="decision"` → NO match (the trailing `s` is a word
 *     char), so a `## Decisions` extra never hides a missing `Decision` row;
 *   - `hay="scope, baseline pin, and what this decides"`, `term="scope"` → match
 *     (comma is a boundary), so a numbered/descriptive heading exposes its concept.
 *
 * Both `hay` and `term` are already normalised (lower-cased, enumerator-stripped,
 * whitespace-collapsed) by the callers.
 */
function headingContains(hay, term) {
  if (!term) return false;
  const isWordChar = (c) => c !== "" && /[a-z0-9-]/.test(c);
  for (let from = 0; ; ) {
    const at = hay.indexOf(term, from);
    if (at === -1) return false;
    const before = at === 0 ? "" : hay[at - 1];
    const after = at + term.length >= hay.length ? "" : hay[at + term.length];
    if (!isWordChar(before) && !isWordChar(after)) return true;
    from = at + 1;
  }
}

/**
 * The document's top-level sections, in document order.
 *
 * Headings are located through `scanLines`, so a `## …` line **quoted inside a
 * fenced block is not a section** (§1.2 rule 5) — a reviewer stall-killed after
 * quoting §6.2's template must not look like it reached the end. Bodies, by
 * contrast, are the **raw** lines between one heading and the next, fences
 * included: §5.0's exclusion governs which lines may *match a scanned pattern*,
 * it does not empty a section's body. Both directions matter and they pull
 * opposite ways (SE-v4 F-18 / TE-v4 F-01).
 */
function topLevelSections(fileText) {
  const lines = String(fileText ?? "").split("\n");
  const heads = [];
  scanLines(fileText, (line, index) => {
    const m = TOP_LEVEL_HEADING.exec(line);
    if (m) heads.push({ index, title: m[1] });
  });
  return heads.map((h, i) => ({
    title: h.title,
    normalised: normaliseHeadingTitle(h.title),
    index: h.index,
    body: lines.slice(h.index + 1, i + 1 < heads.length ? heads[i + 1].index : lines.length),
  }));
}

/**
 * §5.9's body rule. A body consisting only of `TBD`, `TODO`, `_TBD_` or an HTML
 * comment counts as **empty** — otherwise a skeleton written with placeholders
 * would score complete on write 1.
 *
 * The **accepted shallowness** (FSPEC v1.5, SE-v5 F-20 / TE-v5 Q-01): a body that
 * is only a fenced block containing `TBD` scores **non-empty**, because the fence
 * lines themselves are ordinary body content here. A fence-aware placeholder test
 * would reintroduce exactly the coupling that produced v1.4's false-halt.
 */
function isEmptyBody(bodyLines) {
  const stripped = bodyLines.join("\n").replace(/<!--[\s\S]*?-->/g, "");
  const meaningful = stripped
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (meaningful.length === 0) return true;
  return meaningful.every((l) => /^[_*`~\s]*(?:TBD|TODO)[_*`~\s]*$/i.test(l));
}

/**
 * Does `line` carry a catalogue verdict? One grammar, shared with `parseVerdict`
 * (TSPEC §3.9): the same `VERDICT: ` prefix over the trimmed line, the same
 * slice, the same `VALID_VERDICTS` array — which is why that array is now module
 * scoped rather than copied here.
 */
function isCatalogueVerdictLine(line) {
  const trimmed = String(line ?? "").trim();
  if (!trimmed.startsWith("VERDICT: ")) return false;
  return VALID_VERDICTS.includes(trimmed.slice("VERDICT: ".length).trim());
}

/**
 * FSPEC §16.3's cross-review criterion: the **trailing** `## Verdict` section
 * carries **at least one** `VERDICT: ` line whose value is in the catalogue.
 *
 * "Exactly one" was **withdrawn from the terminal test** at FSPEC v1.x and is
 * retained only in §6.3's *approval* test. Under the old reading a duplicated
 * verdict field made a finished review permanently non-terminal: the wrapper
 * re-dispatched to MAX_AUTHORING_DISPATCHES and halted the phase over a review
 * whose reviewer plainly reached the end (E-58). Terminal and approving are two
 * questions — a duplicated field is terminal **yes**, approving **no**, and
 * §5.1's own duplicate pre-count is what answers the second.
 *
 * The `APPROVAL-HASH:` / `REVIEWED-COMMIT:` lines §7 appends are not part of this
 * criterion: they are written *after* the episode reaches terminal.
 */
function crossReviewComplete(fileText) {
  const visited = [];
  scanLines(fileText, (line, index) => visited.push({ line, index }));
  let headingAt = -1;
  for (const v of visited) {
    const m = TOP_LEVEL_HEADING.exec(v.line);
    if (m && normaliseHeadingTitle(m[1]) === "verdict") headingAt = v.index;
  }
  if (headingAt === -1) return false;
  return visited.some((v) => v.index > headingAt && isCatalogueVerdictLine(v.line));
}

/**
 * Structural completeness of one wrapped artifact (§5.9, §3.7).
 *
 * Pure, total and synchronous — no seam, no throw, no IO. Unknown class or doc
 * type is **not complete**: FSPEC §1.2 rule 4's uniform direction is more work,
 * never less.
 *
 * `T` (top-level headings present) and `S` (those with non-empty bodies) are
 * carried for the run report and are **measured, not fixed**, so a document
 * richer than the minimum reports honestly. `missing` names the **canonical**
 * required titles that are absent or short; it is `[]` on the complete arm.
 *
 * @param {string} artifactClass - "spec" | "cross-review" | "code-review" | "LEARNINGS"
 * @param {string} docType - the spec doc type for the "spec" class; ignored otherwise
 * @param {string} fileText - the artifact's bytes
 * @returns {{complete: boolean, missing: string[], T: number, S: number}}
 */
export function isComplete(artifactClass, docType, fileText) {
  const sections = topLevelSections(fileText);
  const T = sections.length;
  const S = sections.filter((s) => !isEmptyBody(s.body)).length;
  const done = (complete, missing) => ({ complete, missing, T, S });

  // A required row is satisfied when SOME non-empty-bodied section's normalised
  // title CONTAINS the row's canonical title, or one of its curated aliases, as a
  // WORD-BOUNDED substring (the `code-review` gate's `.includes("findings")` idiom,
  // tightened at the edges). This is the greenfield-spec fix: an author who
  // organises the spec by concern — `## 1. Scope, baseline pin, and what this
  // TSPEC decides`, `## 4. The advisory core — types, SeamOps protocol, …` —
  // satisfies the required *concepts* without carrying their canonical headings
  // verbatim, where the old exact/prefix equality false-halted a complete document.
  //
  // "Word-bounded" is not decorative: a word char is `[a-z0-9-]`, so a hyphenated
  // compound does not leak its tail (`non-goals` does NOT satisfy `Goals`) and a
  // plural does not satisfy its singular row (`## Decisions` does NOT satisfy
  // `Decision`). Everything else — spaces, commas, slashes, em dashes — is a
  // boundary, so a numbered, descriptive heading still exposes the short concept it
  // contains. Extra headings are permitted, counted in `T`, and never subtract — a
  // document richer than the minimum is not incomplete. Order is not required.
  const rowTerms = (row) => {
    const terms = [normaliseHeadingTitle(row.title)];
    for (const a of row.alts || (row.alt ? [row.alt] : [])) terms.push(normaliseHeadingTitle(a));
    return terms.filter(Boolean);
  };
  const shortfall = (rows) => {
    const satisfied = new Set();
    for (const s of sections) {
      if (isEmptyBody(s.body)) continue;
      for (const row of rows) {
        const matches = row.prefix
          ? s.normalised.startsWith(normaliseHeadingTitle(row.title))
          : rowTerms(row).some((t) => headingContains(s.normalised, t));
        if (matches) satisfied.add(row.title);
      }
    }
    return rows.map((r) => r.title).filter((t) => !satisfied.has(t));
  };

  if (artifactClass === "spec") {
    const rows = REQUIRED_HEADINGS[docType];
    if (!rows) return done(false, []);
    const missing = shortfall(rows);
    return done(missing.length === 0, missing);
  }

  if (artifactClass === "cross-review") {
    return done(crossReviewComplete(fileText), []);
  }

  if (artifactClass === "code-review") {
    // §16.4: the `Scope:` field — matched with the SAME expression
    // `hooks/scripts/check-scope-field.sh` uses, so this criterion and the
    // existing hook agree on one marker rather than drifting apart — plus the
    // findings section the skill mandates. No verdict field: Phase DOD is out of
    // AC-4's scope entirely (§10.7), so a verdict on it would carry no meaning.
    const scoped = /scope|cross-feature/i.test(String(fileText ?? ""));
    const findings = sections.some((s) => s.normalised.includes("findings") && !isEmptyBody(s.body));
    return done(scoped && findings, []);
  }

  if (artifactClass === "LEARNINGS") {
    // §16.5, in full: "the metadata table including its `Harvested from` row,
    // AND its five numbered sections each with a non-empty body". The section
    // half of the criterion is POSITIONAL, not title-based: harvest-learnings is free to name
    // its five sections for the feature it distilled, and LEARNINGS_SECTIONS is
    // this module's default naming, not a contract the skill is held to. What is
    // fixed is that sections `1.`…`5.` all exist and all carry content.
    //
    // The approval record is EXCLUDED — it is section 6 when present, and
    // best-effort (AC-4.2c); see LEARNINGS_SECTIONS.
    const numbered = new Map();
    for (const s of sections) {
      const m = /^\s*(\d+)[.)]/.exec(String(s.title ?? ""));
      if (!m) continue;
      const n = Number(m[1]);
      if (n < 1 || n > LEARNINGS_SECTIONS.length) continue;
      if (!numbered.has(n) && !isEmptyBody(s.body)) numbered.set(n, s.title);
    }
    const missing = LEARNINGS_SECTIONS.filter((_, i) => !numbered.has(i + 1));
    // The metadata conjunct, appended last so an unwritten section is still what
    // the resume prompt names first (§16.5: the row is named "when all five are
    // satisfied"). See HARVESTED_FROM_CLAUSE.
    if (!hasHarvestedFromRow(fileText)) missing.push(HARVESTED_FROM_CLAUSE);
    return done(missing.length === 0, missing);
  }

  return done(false, []);
}

// ─── isPass helper ────────────────────────────────────────────────────────────

function isPass(verdict) {
  return verdict === "Approved" || verdict === "Approved with minor changes";
}

/**
 * The convergence bar over a *parsed verdict record* — `{verdict, high, medium,
 * low, malformed?}`, as `parseVerdict` / `extractFileVerdict` return it.
 *
 * **High-only** (operator decision, 2026-08-08 — an experiment to speed
 * convergence, to be revisited after a few pipeline iterations; see
 * `docs/_decisions/DECISIONS-review-severity-bars.md`). A round moves forward
 * when either
 *
 *   - the verdict string itself approves (`isPass`), or
 *   - the parse is readable and reports **no High findings** — Medium and Low
 *     counts no longer block, so a "Needs revision" filed over Mediums alone
 *     still converges.
 *
 * Fail-closed is preserved: a `malformed: true` record never passes on the counts
 * limb, because its zero counts are a fallback, not an observation.
 *
 * Sites that only need the verdict *string* (report prose, the tier-2 approval
 * record table, which carries no counts) keep using `isPass`.
 *
 * @param {{verdict?: string, high?: number, malformed?: boolean}|null|undefined} parsed
 * @returns {boolean}
 */
function isPassResult(parsed) {
  if (!parsed) return false;
  if (isPass(parsed.verdict)) return true;
  return parsed.malformed !== true && parsed.high === 0;
}

// ─── TSPEC §5.6.1 — selectMode; §5.6.2 — isTerminal ───────────────────────────

/**
 * Compute an episode's `mode` (TSPEC §5.6.1, FSPEC §15.2, AC-3.5 scope (d)).
 *
 * `EpisodeKey.mode` is not an input the caller invents. It is computed **once per
 * episode, at that episode's entry**, by this pure function, from what the phase
 * is dispatching an author to *do* — never from the artifact's structural state.
 *
 * **Invariant S-INV is the caller's obligation, not this function's.** `present`
 * and `reviewFiles` must be the state of the branch at the instant the episode
 * begins, read inside `reviewLoop` by `refreshReviewState`, never a snapshot taken
 * before the loop. Under an entry-time snapshot on a clean branch `present` is
 * empty for the life of the phase, every optimizer episode selects greenfield,
 * `isTerminal` requires no trailer, and the wrapper reports success on a round
 * whose findings were never addressed (TE-v2 N-01).
 *
 * The four rules, in the order §5.6.1 states them:
 *
 * 1. **The revision test is evaluated first** — structural completeness is never
 *    consulted here, so it can never move an episode out of revision mode.
 * 2. **Which round** — the highest round `present` holds that is not carrying
 *    same-round dual approval: the round still owed an authoring pass. A resuming
 *    invocation therefore re-enters the *same* round. §5.2's `max + 1` governs the
 *    next *reviewer* dispatch and is a different question over the same map.
 * 3. **Non-authoring wrapped dispatches are always greenfield**, without
 *    evaluating rule 1 — a review / dod-verify / harvest episode is never
 *    dispatched to address findings in its own artifact.
 * 4. **Greenfield needs positive evidence.** An episode is greenfield *only if*
 *    this episode's own refresh observed the branch and found no review round for
 *    this (feature, doc type) — i.e. `present` is empty. Everything else, including
 *    a non-empty `present` whose verdicts are unreadable, is revision. "Not read"
 *    is never "no findings"; the directions are not symmetric.
 *
 * The unread-*listing* axis never reaches rule 4: a `refreshReviewState` whose
 * `_listFiles` cannot be judged **halts** (§4.2, §6.2 rows 2 and 17), so `present`
 * is a `Map` at every call — the input domain has no third value to rule on, which
 * is what makes the rule total.
 *
 * @param {{dispatchKind: string, docType: string,
 *          present: Map<string, number[]>,
 *          reviewFiles: Map<string, {verdict: string, high: number|null, verdictReadable: boolean, anchorHash: string|null}>,
 *          startIndex: number}} arg
 * @returns {{mode: "authoring"|"revision", round: number|null, reason: string}}
 */
export function selectMode({ dispatchKind, docType, present, reviewFiles, startIndex }) {
  // Rule 3 — evaluated before rule 1, not after it.
  if (dispatchKind !== "authoring") {
    return {
      mode: "authoring",
      round: null,
      reason: `non-authoring dispatch kind ${dispatchKind} is greenfield by construction`,
    };
  }

  const rounds = new Set();
  const roles = [];
  if (present && typeof present.forEach === "function") {
    present.forEach((list, role) => {
      roles.push(role);
      for (const n of list || []) rounds.add(n);
    });
  }

  // Rule 4 — greenfield needs positive evidence: an observed, EMPTY `present`.
  if (rounds.size === 0) {
    return {
      mode: "authoring",
      round: null,
      reason: `no review round on the branch for ${docType}`,
    };
  }

  // Rule 2 — the highest round not carrying same-round dual approval.
  const files = reviewFiles && typeof reviewFiles.get === "function" ? reviewFiles : new Map();
  const dualApproved = (round) =>
    roles.length > 0 &&
    roles.every((role) => {
      const rec = files.get(`${role}:${round}`);
      return !!rec && rec.verdictReadable === true && isPassResult(rec);
    });

  const descending = [...rounds].sort((a, b) => b - a);
  const owed = descending.find((r) => !dualApproved(r));
  const round = owed === undefined ? descending[0] : owed;

  return {
    mode: "revision",
    round,
    reason:
      owed === undefined
        ? `every observed ${docType} round is dual-approved; addressing round ${round}`
        : `${docType} round ${round} is still owed an authoring pass`,
  };
}

/**
 * The terminal test (TSPEC §5.6.2, FSPEC §8.4, AC-3.5b). Per mode, and it returns
 * a **record, not a boolean**, because the trailer reason it computes is the only
 * place that reason exists.
 *
 * | Mode | Terminal condition | Trailer |
 * |---|---|---|
 * | Greenfield | the required member of the artifact set is structurally complete | none required, none expected — `parseRevisionComplete` is not called |
 * | Revision | structurally complete **and** `parseRevisionComplete(response)` → `{complete: true}` | required |
 *
 * **Why the conjunct is absent from the greenfield path rather than reconciled.**
 * §7.4 amends only the three *author* SKILLs to emit `REVISION-COMPLETE:`; the
 * three review SKILLs, `dod-verify` and `harvest-learnings` never will, and
 * §5.6.1 rule 3 puts every one of those episodes in greenfield by construction. A
 * mode-blind conjunct would make the numerically dominant episode population
 * unable to *ever* reach terminal — H-3's own failure mode rebuilt by the
 * mechanism meant to remove it.
 *
 * **Both members are read, and `structural` is not one of them** — v1.2 returned
 * it as a third member no caller read, which is the shape AC-4.7a forbids, so it
 * lives as the local below where its only two readers are.
 *
 * **Revision mode is BASELINE-RELATIVE for the spec class.** A revision episode
 * must not be gated on a stricter structural shape than the document had when the
 * episode began: reviewers reviewed *that* shape and the loop accepted it for the
 * prior rounds, and the optimizer's job is to address findings, not to retrofit
 * canonical headings onto a document authored before this oracle existed. So when
 * `entryMissing` is supplied — the missing-set measured over the episode's entry
 * bytes — the structural conjunct becomes "no **regression**": the current
 * missing-set must be a subset of the entry one. A previously-satisfied canonical
 * section may not be deleted; a pre-existing shortfall does not block. Without
 * that relaxation a revision episode over such a document can NEVER reach
 * terminal, and the wrapper burns `MAX_AUTHORING_DISPATCHES` on an author that
 * already declared itself done.
 *
 * The baseline is **optional and defaults to the strict test**, so greenfield
 * (where the canonical headings are still required in full) and every non-spec
 * artifact class are untouched, as is every call site that does not pass one.
 *
 * @param {string} mode - the episode's mode, from `selectMode`
 * @param {string} response - the dispatch's response text
 * @param {string} artifactClass - §5.9's wrapped artifact class
 * @param {string} docType
 * @param {string|null} after - the target's bytes read AFTER the dispatch
 * @param {string[]|null} [entryMissing] - the missing-set measured at episode entry;
 *   applied only in revision mode over the "spec" class
 * @returns {{terminal: boolean, trailerReason: string|null}}
 */
export function isTerminal(mode, response, artifactClass, docType, after, entryMissing) {
  return terminalFrom(mode, response, artifactClass, isComplete(artifactClass, docType, after), entryMissing);
}

/**
 * `isTerminal`'s decision over a measurement that has ALREADY been made, rather
 * than over the bytes it would be made from. The exported form above is this
 * function plus one `isComplete` call, so there is one terminal rule, not two.
 *
 * It exists for the probe seams (§3.8's `_probeDoc`): a probe answers
 * `{complete, missing, T, S}` at the far side of the seam, and the bytes it
 * measured never enter this module. Deliberately NOT exported — `isTerminal`'s
 * signature is the pinned one.
 *
 * @param {string} mode
 * @param {string} response
 * @param {string} artifactClass
 * @param {{complete: boolean, missing: string[], T: number, S: number}} measured
 * @param {string[]|null} [entryMissing]
 * @returns {{terminal: boolean, trailerReason: string|null}}
 */
function terminalFrom(mode, response, artifactClass, measured, entryMissing) {
  let structural = measured.complete;
  if (mode === "revision" && artifactClass === "spec" && Array.isArray(entryMissing)) {
    const baseline = new Set(entryMissing);
    structural = measured.missing.every((title) => baseline.has(title));
  }
  if (mode !== "revision") return { terminal: structural, trailerReason: null };
  const t = parseRevisionComplete(response);
  return {
    terminal: structural && t.complete,
    trailerReason: t.complete ? null : t.reason,
  };
}

// ─── REQ-GATE-04: Non-convergence halt helper ─────────────────────────────────

/**
 * If the reviewLoop result did not converge, throw a haltError that identifies
 * the phase, the non-approving reviewers, and their unresolved finding counts.
 * Also records the phase as ❌ in the phases array (PM-F03 / REQ-OBS-02).
 *
 * @param {{ converged: boolean, iterations: number, lastResults?: Array }} loopResult
 * @param {string} phaseId  - e.g. "R"
 * @param {string} phaseLabel - human-readable phase label
 * @param {Function} recordPhase - the local recordPhase callback
 */
function checkConverged(
  loopResult,
  phaseId,
  phaseLabel,
  recordPhase,
  feature,
  startIndex,
  endIndex
) {
  if (loopResult.converged !== false) return;

  // An authoring-budget halt is NOT a non-convergence: no reviewer disagreed, the
  // wrapper simply stopped paying for a dispatch that was going nowhere. It writes
  // no POSTMORTEM (§6.2 rows 10–11) and reports the wrapper's own detail.
  if (loopResult.halted === true) {
    recordPhase(phaseId, phaseLabel, "❌", loopResult.haltDetail);
    throw haltError(loopResult.haltDetail);
  }

  // Build reviewer detail string (PM-F02)
  let reviewerDetail = "";
  if (Array.isArray(loopResult.lastResults) && loopResult.lastResults.length > 0) {
    const details = loopResult.lastResults
      .filter((r) => !isPassResult(r))
      .map((r) => `${r.skill} (high:${r.high}, medium:${r.medium}, low:${r.low})`)
      .join("; ");
    reviewerDetail = details ? ` — non-approving reviewers: [${details}]` : "";
  }

  // §6.3: the template is made CORRECT and made USED — `feature` is interpolated,
  // and the path becomes §4.7's `postmortemPath` report field.
  const postmortemPath = `docs/${feature}/POSTMORTEM-${phaseId}-${feature}.md`;
  // AC-5.1: the window is RELATIVE. On a branch whose highest existing round is 3
  // the phase was admitted rounds 4..8, and "after 5 iterations" would name an
  // absolute index the run never used.
  const first = startIndex === undefined ? 1 : startIndex;
  const last = endIndex === undefined ? windowEnd(first) : endIndex;
  const window = `rounds ${first}..${last}`;
  recordPhase(
    phaseId,
    phaseLabel,
    "❌",
    `Non-convergence across ${window}${reviewerDetail}`,
    MAX_REVIEW_ROUNDS
  );

  // §6.3 step 3: the disposition is `reviewLoop`'s `_checkFile` CONFIRMATION,
  // never the POSTMORTEM agent's reply.
  const written = loopResult.postmortemWritten === true;

  // §6.4's two conditional shapes. The unconditional `POSTMORTEM written.` is gone.
  const reason = written
    ? `Phase ${phaseId} did not converge across ${window}${reviewerDetail}. ` +
      `Post-mortem written at ${postmortemPath}. ` +
      // §6.4 row 1's recovery clause. The literal words "queue row" are
      // deliberately NOT used: `RLH-AT-31-orch` and `-34-orch` require that a
      // clean or absent row leaves no queue-shaped text anywhere in the report,
      // so a phrase that names the queue in EVERY non-convergence halt would
      // make "one failure, not two" unobservable.
      `Recover: resolve it per AC-2.4, then set the feature's row back to pending.`
    : `Phase ${phaseId} did not converge across ${window}${reviewerDetail}. ` +
      `Post-mortem write FAILED — no artifact at ${postmortemPath}.`;

  throw haltError(reason, {
    haltPhase: phaseId,
    postmortemPath,
    postmortemStatus: written ? "written" : "write_failed",
  });
}

// ─── The optional session transport — `_sessionAgent` ────────────────────────
//
// PROPOSAL-orchestrate-dev-optimization M-2: the manual run kept ONE author
// session per document and re-invoked each reviewer inside its own round-1
// context. Revisions stopped re-litigating settled decisions, and reviewers
// converged in 2–3 rounds against a budget of 5.
//
// `_sessionAgent(sessionKey, skill, prompt, opts) => Promise<string|null>` is
// that capability, expressed as a seam. The implementation — never this module —
// owns create-vs-resume: this module's whole contribution is a STABLE key per
// (feature, document, role), so the same reviewer and the same author are
// addressed by the same key on every round.
//
// It carries the probe seams' invariant verbatim: **a session is an
// optimisation, never a correctness dependency.** Absent, `null`, `undefined` or
// throwing, every dispatch falls back to the fresh `_agent` call it replaced,
// which runs unchanged. The workflow runtime cannot resume an agent today (its
// host globals are `agent` / `parallel` / `pipeline` / `phase` / `log` /
// `workflow` / `args` / `budget` — see `runtime-adapter.js`), so ABSENT is the
// shipped state and the fallback path is the shipped behaviour. §5 decision 1 of
// the proposal accepts exactly that: where the runtime cannot resume, M-1's
// delta-scoped prompts over fresh dispatches carry most of the win on their own,
// and those prompts are unconditional (see `reviewerPrompt` / `optimizerPrompt`).

/** The absent session transport — `_sessionAgent`'s shipped default. */
const NO_SESSION_AGENT = null;

/**
 * The session-key scope for one phase's dispatches: the document type when there
 * is one, and the phase id otherwise (Phase CR reviews a directory and has no
 * doc type). Keeping the fallback here rather than at each call site is what
 * makes the reviewer and author keys of the same phase share a scope.
 */
function sessionScope(docType, phase) {
  return String(docType || phase);
}

/** `{feature}/{scope}/reviewer/{role}` — one session per reviewer per document. */
function reviewerSessionKey(feature, docType, phase, skill) {
  return `${feature}/${sessionScope(docType, phase)}/reviewer/${reviewerRoleSlug(skill) || skill}`;
}

/**
 * `{feature}/{scope}/author` — ONE session per document, shared by the creator
 * (main()'s `wrappedDispatch`) and the optimizer (`reviewLoop`). That sharing is
 * M-2's point: the agent that revises the document is the agent that wrote it,
 * so it remembers what it decided and catches its own cross-round inconsistencies.
 */
function authorSessionKey(feature, docType, phase) {
  return `${feature}/${sessionScope(docType, phase)}/author`;
}

/**
 * The `_agent`-shaped closure one dispatch is issued through, bound to
 * `sessionKey`. With no transport installed this returns `_agent` ITSELF — not a
 * wrapper around it — so the absent case is byte-identical to the pre-seam code
 * path rather than merely equivalent to it.
 *
 * Fail-open, in both directions the transport can fail:
 * - it THROWS  → one log line, then the fresh `_agent` dispatch;
 * - it answers `null`/`undefined` (the transport declining this dispatch, e.g.
 *   because the session is gone) → one log line, then the fresh dispatch.
 *
 * `opts` — including `model`, which is how MODEL-01's pinning reaches the
 * dispatch — is forwarded verbatim on both arms.
 *
 * @param {{_sessionAgent?: function|null, sessionKey: string, _agent: function,
 *          _log?: function}} arg
 * @returns {function} an `(skill, prompt, opts)` agent function
 */
function sessionBoundAgent({ _sessionAgent = NO_SESSION_AGENT, sessionKey, _agent, _log }) {
  if (typeof _sessionAgent !== "function") return _agent;
  const emit = typeof _log === "function" ? _log : () => {};
  return async (skill, prompt, opts) => {
    let reply;
    try {
      reply = await _sessionAgent(sessionKey, skill, prompt, opts);
    } catch (err) {
      emit(
        `Session transport failed for ${sessionKey} (${skill}) — falling back to a fresh dispatch: ` +
          `${(err && err.message) || err}.`
      );
      return _agent(skill, prompt, opts);
    }
    if (reply == null) {
      emit(
        `Session transport declined ${sessionKey} (${skill}) — falling back to a fresh dispatch.`
      );
      return _agent(skill, prompt, opts);
    }
    return reply;
  };
}

// ─── PROPOSAL §3.1 step 4 / §5 decision 2 — the erratum protocol ─────────────
//
// M-4: a downstream document that found a defect in an UPSTREAM one had no
// channel for it. The reviewer either folded the finding into a verdict about
// the wrong document, or the upstream document's approval silently went stale.
// The manual run's protocol — the downstream dispatch LISTS errata, the upstream
// author applies a targeted versioned edit, and the upstream document's own
// APPROVERS confirm the delta rather than re-reviewing it — absorbed four errata
// in one targeted round each, with no approval invalidated and no full re-review
// paid.
//
// The grammar is one line of ordinary response text, so any dispatch can emit it
// without a structured channel:
//
//     ERRATUM: {DOCTYPE}: {one-line item}
//
// Everything about the parse is FAIL-OPEN. An erratum is additional signal: it
// never touches a verdict, a convergence decision or a round budget, so an
// unparseable or unknown one degrades to "no erratum" rather than corrupting the
// verdict it shares a response with.

/** The upstream documents an erratum may name, in pipeline order (§3.1). */
const ERRATUM_DOC_TYPES = Object.freeze([
  "REQ",
  "FSPEC",
  "TSPEC",
  "DECISIONS",
  "PLAN",
  "PROPERTIES",
]);

/**
 * Which phase OWNS each document — i.e. whose `PHASE_DISPATCH` entry names the
 * author that may edit it and the approvers that must confirm the delta. The
 * routing reads the dispatch table through this map rather than hard-coding a
 * second copy of "who writes FSPEC".
 */
const ERRATUM_PHASE_BY_DOC_TYPE = Object.freeze({
  REQ: "R",
  FSPEC: "F",
  TSPEC: "T",
  DECISIONS: "D",
  PLAN: "P",
  PROPERTIES: "PR",
});

/** The feature-branch path of a pipeline document, by doc type. */
const featureDocPath = (feature, docType) => `docs/${feature}/${docType}-${feature}.md`;

/** Doc types ABOVE `target` in pipeline order — the layers it derives from. */
const erratumDocTypesAbove = (target) =>
  ERRATUM_DOC_TYPES.slice(0, Math.max(0, ERRATUM_DOC_TYPES.indexOf(target)));

/** Doc types BELOW `target` in pipeline order — the layers derived FROM it. */
const erratumDocTypesBelow = (target) =>
  ERRATUM_DOC_TYPES.indexOf(target) < 0
    ? []
    : ERRATUM_DOC_TYPES.slice(ERRATUM_DOC_TYPES.indexOf(target) + 1);

/**
 * PLAN §3.1 — the `UPSTREAM-STATE:` payload for an approval about to be
 * anchored on `docType`: one `{docType, hash}` per upstream document that
 * EXISTS on the branch right now, in `ERRATUM_DOC_TYPES` order.
 *
 * Observation, not judgment: an upstream document that is absent (an
 * unwritten DECISIONS, say) contributes no row rather than a `null` one, so
 * "no row" reads the same way everywhere — nothing to compare, nothing to
 * stale. Digests come through the same probe-then-hash pair every other
 * observation in this module uses, so a probing runtime pays no second read.
 *
 * Total: a doc type outside the chain (`CR`, `null`) yields `[]`, which the
 * anchor writer treats exactly as today's legacy block.
 */
async function deriveApprovalUpstreamState({ feature, docType, _probeDoc, _hashFile }) {
  const rows = [];
  for (const upstream of erratumDocTypesAbove(docType)) {
    const path = featureDocPath(feature, upstream);
    const probe = await probeDocument(_probeDoc, path, upstream);
    let hash = probe ? probe.hash ?? null : null;
    if (!probe && typeof _hashFile === "function") {
      try {
        hash = (await _hashFile(path)) ?? null;
      } catch {
        hash = null;
      }
    }
    if (hash == null) continue;
    rows.push({ docType: upstream, hash });
  }
  return rows;
}

/**
 * §5 decision 2, verbatim: "One erratum round per upstream doc per phase;
 * exceeding it halts to POSTMORTEM. **Not config** — a knob here is a knob that
 * gets turned mid-run." So this is a shipped module constant, in the same
 * category as `MAX_REVIEW_ROUNDS`, and it is deliberately not exported: tests
 * reach it through the halt it produces.
 */
const MAX_ERRATUM_ROUNDS_PER_DOC = 1;

/**
 * PLAN §2.2 row R3: the follow-up budget, per upstream doc per phase
 * invocation. A DEC-ROUNDS-02-style damping term, and a DISTINCT budget from
 * `MAX_ERRATUM_ROUNDS_PER_DOC` above — that constant bounds how many item SETS
 * a phase may route at one document, this one bounds how many times a single
 * routed set may be re-dispatched after its own confirmers said the edit
 * missed. Keeping them separate is what preserves the erratum channel's bound
 * on unbounded chains while still letting the one-noun, one-cell miss that
 * produced POSTMORTEM-PR be fixed instead of halting the pipeline.
 *
 * Shipped constant, not config, for the same reason as its neighbour: a knob
 * here is a knob that gets turned mid-run.
 */
const MAX_ERRATUM_FOLLOWUP_ROUNDS = 1;

/**
 * One erratum line. A leading list marker is tolerated (agents write bullets),
 * the doc type is the text up to the FIRST colon so an item may itself contain
 * colons (`ERRATUM: FSPEC: §3.1: the table is wrong`), and the item must be
 * non-empty.
 */
const ERRATUM_LINE_RE = /^\s*(?:[-*]\s+)?ERRATUM:\s*([^:]+?)\s*:\s*(\S.*?)\s*$/;

/**
 * Every erratum line in one agent response, in order, deduplicated by
 * (docType, item).
 *
 * Fenced regions are skipped by `scanLines` — the same rule every other
 * mechanical scan in this module obeys — so a response that QUOTES the erratum
 * grammar (e.g. echoing the standing prompt clause inside a code fence) cannot
 * fabricate an erratum.
 *
 * A line whose doc type is outside `ERRATUM_DOC_TYPES` is IGNORED, not an error:
 * `onIgnored(docType, item)` is offered so the caller can raise a notice, and the
 * line contributes nothing else. That is the fail-open half of §3.1 step 4 — an
 * unparseable erratum must never corrupt a verdict.
 *
 * Pure, synchronous, total; takes no seam.
 *
 * @param {string} text
 * @param {function(string, string): void} [onIgnored]
 * @returns {Array<{docType: string, item: string}>}
 */
export function parseErrata(text, onIgnored) {
  const found = [];
  const seen = new Set();
  scanLines(String(text ?? ""), (line) => {
    const m = ERRATUM_LINE_RE.exec(line);
    if (!m) return;
    const docType = m[1];
    const item = m[2];
    if (!ERRATUM_DOC_TYPES.includes(docType)) {
      if (typeof onIgnored === "function") onIgnored(docType, item);
      return;
    }
    const key = `${docType} ${item}`;
    if (seen.has(key)) return;
    seen.add(key);
    found.push({ docType, item });
  });
  return found;
}

// ─── PLAN §2.4 — mint-time item hygiene (T3) ────────────────────────────────
//
// Every function in this block is pure, synchronous and total, same doctrine
// as `parseErrata` above: normalization only ever narrows what a mint-time
// decision does with an item's TEXT, and none of it ever touches a verdict
// or a round budget.

/**
 * The first cited anchor in an erratum item's text — a `§`-section reference
 * (`§3-02`, `§4.2`) or a `:line` reference — normalized by case/whitespace
 * folding only. `null` when the item cites neither, which is the signal
 * `erratumDedupeKey` below reads as "never collapse this with anything but a
 * byte-identical duplicate."
 */
const ERRATUM_ANCHOR_RE = /§[\w.-]+|:\d{2,}\b/;
function erratumAnchorOf(text) {
  const m = ERRATUM_ANCHOR_RE.exec(String(text ?? ""));
  return m ? m[0].toLowerCase().trim() : null;
}

/**
 * The item's "expected token" — the shape §2.3 already classifies as a
 * literal-token finding ("should say X, not Y"), read here as the LAST
 * backtick- or `**bold**`-quoted span in the text. Reviewer SKILLs state the
 * corrected value last ("... this should read **frozenset[str]**"), so the
 * last span is the one two restatements of the SAME finding will always
 * agree on, even when they disagree on which value they quote first (the
 * "wrong" one). `null` when the item quotes nothing this way — not an error,
 * just a finding this rule cannot help disambiguate from a different one at
 * the same anchor (`erratumDedupeKey` then keys on the anchor alone).
 */
const ERRATUM_TOKEN_RE = /`([^`]+)`|\*\*([^*]+)\*\*/g;
function erratumTokenOf(text) {
  const s = String(text ?? "");
  ERRATUM_TOKEN_RE.lastIndex = 0;
  let last = null;
  let m;
  while ((m = ERRATUM_TOKEN_RE.exec(s))) last = m[1] ?? m[2];
  return last ? last.toLowerCase().replace(/\s+/g, " ").trim() : null;
}

/**
 * PLAN §2.3 (T4) — the mechanical land-proof's classifier: does this erratum
 * item name an exact expected token the edit must land, rather than a general
 * instruction the author has latitude over? Conservative by construction, same
 * doctrine as the dedupe-key helpers above — a false positive here dispatches
 * an author's edit against a token that was never actually promised, so this
 * only ever fires on one of two unambiguous shapes:
 *
 *   - an explicit `EXPECT-TOKEN: {token}` clause, the grammar T1's confirm
 *     prompt/SKILL updates emit once a finding IS this shape; or
 *   - the conservative "should say X, not Y" shape — both `say` and `not`
 *     present, with at least two backtick-/bold-quoted spans to disambiguate
 *     it from a general "should say X" note naming no wrong value.
 *
 * The second shape's expected token is read through `erratumTokenOf` above —
 * reused, not re-derived, per that function's own doctrine of "the corrected
 * value stated last" — so this never becomes a second, divergently-tuned
 * extractor of the same thing `erratumDedupeKey` already reads.
 *
 * Returns the normalized expected token, or `null` when the item fits
 * neither shape — the overwhelmingly common case.
 */
const ERRATUM_EXPECT_TOKEN_RE = /EXPECT-TOKEN:\s*[`*]?([^`*\n]+?)[`*]?\s*$/im;
function erratumLiteralTokenOf(text) {
  const s = String(text ?? "");
  const explicit = ERRATUM_EXPECT_TOKEN_RE.exec(s);
  if (explicit) {
    const token = explicit[1].toLowerCase().replace(/\s+/g, " ").trim();
    if (token) return token;
  }
  if (!/\bsay\b/i.test(s) || !/\bnot\b/i.test(s)) return null;
  ERRATUM_TOKEN_RE.lastIndex = 0;
  let quotedSpans = 0;
  while (ERRATUM_TOKEN_RE.exec(s)) quotedSpans++;
  if (quotedSpans < 2) return null;
  return erratumTokenOf(s);
}

/**
 * PLAN §2.4 item 1's dedupe key: `docType` + cited anchor/section + expected
 * token — never the exact item string. Conservative by construction: an item
 * with NO cited anchor keys on its own normalized text instead, so it only
 * ever collapses with a byte-for-byte (after folding) duplicate, never with a
 * different finding that merely lacks a citation too.
 */
function erratumDedupeKey(docType, text) {
  const anchor = erratumAnchorOf(text);
  if (!anchor) {
    return `${docType}\0${String(text ?? "").toLowerCase().replace(/\s+/g, " ").trim()}`;
  }
  return `${docType}\0${anchor}\0${erratumTokenOf(text) ?? ""}`;
}

/**
 * Collapse a batch of `{docType, item, source}` candidates by
 * `erratumDedupeKey`. The surviving entry is the first occurrence, its
 * `source` widened to the UNION of every collapsed duplicate's source,
 * comma-joined in first-seen order — this is what turns POSTMORTEM-D's five
 * entries for three obligations, and POSTMORTEM-PR's thirteen strings for
 * five defects, into one tracked item per obligation/defect instead of one
 * per restatement.
 *
 * Pure and order-preserving; takes no seam.
 */
export function dedupeErrataEntries(entries) {
  const kept = [];
  const byKey = new Map();
  for (const raw of Array.isArray(entries) ? entries : []) {
    if (!raw) continue;
    const key = erratumDedupeKey(raw.docType, raw.item);
    const existing = byKey.get(key);
    if (existing) {
      const sources = String(existing.source ?? "")
        .split(", ")
        .filter(Boolean);
      const next = String(raw.source ?? "");
      if (next && !sources.includes(next)) sources.push(next);
      existing.source = sources.join(", ");
      continue;
    }
    const merged = { ...raw, source: String(raw.source ?? "") };
    byKey.set(key, merged);
    kept.push(merged);
  }
  return kept;
}

/**
 * PLAN §2.4 item 3 — multi-home split. Word-boundary containment against the
 * closed `ERRATUM_DOC_TYPES` set, never substring (same doctrine as the
 * ownership/header matchers elsewhere in this module): when an item's own
 * text names TWO OR MORE distinct doc types, it is fanned out into one
 * tracked item per named type, each carrying the full item text and a shared
 * `multiHomeGroup` id so a caller tracking a sourcing row's closure can find
 * every sibling. An item naming zero or one doc type in its own text is
 * single-home and is returned unchanged — one incidental mention is not the
 * "REQ §7 FSPEC §2.2 both understate X" shape this rule targets.
 */
export function splitErratumMultiHome(entry) {
  if (!entry) return [];
  const text = String(entry.item ?? "");
  const named = [];
  for (const docType of ERRATUM_DOC_TYPES) {
    if (new RegExp(`\\b${docType}\\b`).test(text)) named.push(docType);
  }
  if (named.length < 2) return [entry];
  const multiHomeGroup = `${entry.docType}\0${text}`;
  return named.map((docType) => ({ ...entry, docType, multiHomeGroup }));
}

/**
 * PLAN §2.4 item 4 — the oracle-contract lint's word vocabulary. An item
 * "touches a test oracle" when it names an oracle id (`AT-`, `INV-`, `META-`
 * — the catalogue this module's own oracle rules use, §3.5) or the bare word
 * "oracle(s)".
 */
const ERRATUM_ORACLE_ID_RE = /\b(?:AT|INV|META)-[A-Za-z0-9]+\b/;
const ERRATUM_ORACLE_WORD_RE = /\boracles?\b/i;
function touchesErratumOracle(text) {
  const s = String(text ?? "");
  return ERRATUM_ORACLE_ID_RE.test(s) || ERRATUM_ORACLE_WORD_RE.test(s);
}

/**
 * The three contract fields an oracle-touching item must carry, checked at
 * KEYWORD level only (§2.4 item 4: "accept concepts, keyword-level, not
 * prose quality") — this is a mint-time lint, not a content review.
 */
const ERRATUM_ORACLE_CONTRACT_TERMS = Object.freeze([
  { label: "a property statement", re: /\bproperty\b/i },
  { label: "a non-subsumption rationale", re: /\bsubsum/i },
  { label: "a per-conjunct red witness", re: /\bwitness\b/i },
]);

/**
 * PLAN §2.4 item 4. Returns the missing contract field labels — empty for an
 * item that does not touch an oracle at all (nothing to lint) or that
 * carries every field. A non-empty result is what tells `routeErrata` to
 * report the item as a malformed erratum instead of routing it; nothing about
 * this function halts anything on its own.
 */
export function oracleContractShortfall(text) {
  if (!touchesErratumOracle(text)) return [];
  return ERRATUM_ORACLE_CONTRACT_TERMS.filter((t) => !t.re.test(String(text ?? ""))).map(
    (t) => t.label
  );
}

/**
 * PLAN §2.4 item 2 — the RE-MINT line grammar, read out of an erratum
 * author's response only on the upstream-skew path (`movedSinceMinted`).
 * DEC-ERR-01 vocabulary: one line per routed item, saying whether the
 * author's re-grounding against upstream HEAD found it already resolved
 * (ABSORBED) or still open (STILL-RAISED):
 *
 *     RE-MINT: ABSORBED: {item text}
 *     RE-MINT: STILL-RAISED: {item text}
 *
 * Fail-open: a response with no RE-MINT line at all returns `null`, which
 * `erratumRound` reads as "the author did not structurally re-derive the
 * list" and falls back to the notice-only path that predates this task. A
 * response with at least one RE-MINT line is read as the full re-derivation —
 * only its STILL-RAISED items reach the confirmers.
 *
 * Pure, synchronous, total; takes no seam.
 */
const ERRATUM_REMINT_LINE_RE = /^\s*(?:[-*]\s+)?RE-MINT:\s*(ABSORBED|STILL-RAISED):\s*(\S.*?)\s*$/;
export function parseErratumRemint(text) {
  const stillRaised = [];
  const absorbed = [];
  let any = false;
  scanLines(String(text ?? ""), (line) => {
    const m = ERRATUM_REMINT_LINE_RE.exec(line);
    if (!m) return;
    any = true;
    (m[1] === "ABSORBED" ? absorbed : stillRaised).push(m[2]);
  });
  return any ? { stillRaised, absorbed } : null;
}

/**
 * Retry a single dispatch exactly once when the dispatch itself THROWS or
 * REJECTS — an engine-side transport fault (dropped connection, the engine's
 * 30-minute dispatch ceiling) surfaces this way. A *parsed* content failure
 * (an empty reply, a "Needs revision" verdict, a non-zero-exit string in the
 * response) is not a throw and is never touched by this helper — those are
 * evaluated, unchanged, by the caller after `withDispatchRetry` resolves.
 *
 * On the first throw this emits a loud, greppable notice and re-invokes
 * `dispatchFn` with the exact same prompt/arguments (the caller's thunk
 * closes over them, so "same prompt" is structural, not a parameter here).
 * A second throw propagates unchanged — same error, same message, same halt
 * and POSTMORTEM/report behavior as before this helper existed. Only ONE
 * retry: this is a fault-recovery seam, not a resilience loop.
 *
 * Scoped deliberately to long, single-shot dispatch call sites (Phase CR's
 * review-loop optimizer dispatch, Phase DOD's remediation dispatch, Phase
 * PT's V-wave dispatch) — never to the round-loop reviewer dispatch: a
 * faulted reviewer round already re-derives cleanly on the pipeline's next
 * invocation, and double-dispatching a reviewer risks two cross-review files
 * for one round.
 *
 * `onFault`, if given, fires once the FIRST attempt throws — before the
 * retry is even dispatched — so a caller that must record "a fault was
 * observed" as a distinct signal from "the dispatch ultimately failed" can
 * do so even when the retry goes on to recover.
 *
 * @param {() => Promise<any>} dispatchFn - zero-arg thunk; invoked again, unchanged, on retry.
 * @param {{ label: string, emit?: (msg: string) => void, onFault?: () => void }} opts
 * @returns {Promise<any>}
 */
export async function withDispatchRetry(dispatchFn, { label, emit = () => {}, onFault = () => {} } = {}) {
  try {
    return await dispatchFn();
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    emit(`Dispatch fault (${label}): ${message} — retrying once.`);
    onFault();
    return await dispatchFn();
  }
}

// ─── TSPEC-LOOP-01 through TSPEC-LOOP-08: reviewLoop ─────────────────────────

/**
 * @param {object} params
 * @param {string} params.doc       - Path to the document under review (or feature dir for Phase CR)
 * @param {string} params.phase     - Phase label: "R" | "F" | "T" | "D" | "P" | "PR" | "CR"
 * @param {string[]} params.reviewers - Exactly two reviewer skill identifiers
 * @param {string} params.optimizer - Optimizer skill identifier
 * @param {string} params.feature   - Feature name
 * @param {number} [params.iteration=1] - Starting iteration (always 1 for fresh runs)
 * @param {function} [params._agent] - Injected agent function (for testing)
 * @param {function} [params._parallel] - Injected parallel function (for testing)
 * @param {function} [params._checkFile] - Injected file-existence check (for testing)
 * @param {function} [params._sessionAgent] - Optional session transport (see `sessionBoundAgent`); absent by default
 * @returns {Promise<{converged: boolean, iterations: number, lastOptimizerResult?: string|null}>}
 */
export async function reviewLoop({
  doc,
  phase,
  docType,
  reviewers,
  optimizer,
  feature,
  iteration = 1,
  startIndex = iteration,
  endIndex = windowEnd(startIndex),
  // DEC-FRZ-01. The round at which THIS document last carried a dual approval on
  // disk, as the phase gate's approval search read it, or `null` when the gate
  // found none (and on a forced phase, where the search is skipped). Supplied by
  // the caller because the gate already paid for the read; `null` simply means no
  // freeze can be justified from approval history, and the round-index trigger
  // still applies.
  priorApprovedRound = null,
  _agent = agent,
  _parallel = parallel,
  _checkFile = checkFileNonEmpty,
  _listFiles = defaultListFiles,
  _readFile = defaultReadFile,
  _hashFile = defaultHashFile,
  _hashNormalizedFile = defaultHashNormalizedFile,
  _appendFile = defaultAppendFile,
  // The optional probe seams (see `probeDocument` / `resolveReviewState`). They
  // default to `null` rather than to a working implementation on purpose: absent
  // is the shipped state, and every site that consults one falls back.
  _probeDoc = NO_PROBE,
  _probeReviewState = NO_PROBE,
  // The optional session transport (see `sessionBoundAgent`). `null` is the
  // shipped state and every dispatch below falls back to `_agent`.
  _sessionAgent = NO_SESSION_AGENT,
  _log,
  _git,
}) {
  // The doc type the round record is keyed by. Derived from `doc` when the caller
  // does not name it, so Phase CR's directory target degrades to "no doc type"
  // rather than to a wrong one.
  const roundDocType = docType === undefined ? docTypeFromPath(doc) : docType;
  const reviewFileType = roundDocType || "REVIEW";
  const emit = typeof _log === "function" ? _log : log;

  // PROPOSAL §3.1 step 4 — the loop's erratum collection.
  //
  // Every reviewer response and every optimizer response of EVERY iteration is
  // scanned, and the union rides out on this invocation's return. Deliberately
  // inert here: nothing below branches on `errata`, so the verdict parse, the
  // convergence gate and the round budget behave exactly as they did before the
  // protocol existed. Routing is the caller's job (`converge`).
  const errata = [];
  const erratumSeen = new Set();
  const collectErrata = (text, source) => {
    const parsed = parseErrata(text, (badType) =>
      emit(
        `Erratum ignored (${source}, phase ${phase}): "${badType}" is not one of ` +
          `${ERRATUM_DOC_TYPES.join(", ")}.`
      )
    );
    for (const entry of parsed) {
      const key = `${entry.docType} ${entry.item} ${source}`;
      if (erratumSeen.has(key)) continue;
      erratumSeen.add(key);
      errata.push({ docType: entry.docType, item: entry.item, source });
    }
  };

  /**
   * Wrap one dispatch of this loop in the §3.8 pacing wrapper.
   *
   * `sessionKey` binds the dispatch to a session when `_sessionAgent` is
   * installed. `dispatchAndVerify`'s signature and logic are untouched: the
   * binding is expressed entirely as the `_agent` closure handed to it, which is
   * `_agent` itself when no transport is installed.
   */
  const wrapped = (skill, basePrompt, targetPath, dispatchKind, sessionKey) =>
    dispatchAndVerify({
      skill,
      basePrompt,
      targetPath,
      docType: roundDocType,
      feature,
      dispatchKind,
      phaseId: phase,
      _agent: sessionBoundAgent({ _sessionAgent, sessionKey, _agent, _log: emit }),
      _readFile,
      _listFiles,
      _probeDoc,
      _probeReviewState,
      _log: emit,
      _git,
    });

  // An episode that exhausts an authoring budget RETURNS through the loop rather
  // than throwing past it: `checkConverged` is the one place that decides what a
  // failed phase does, and `RLH-AT-61-loop` reads the trailer reason off this
  // return. `halted` is the discriminator; `haltDetail` is the operator's text.
  let haltedReturn = null;
  const runWrapped = async (skill, basePrompt, targetPath, dispatchKind, sessionKey) => {
    if (haltedReturn) return null;
    try {
      const episode = await wrapped(skill, basePrompt, targetPath, dispatchKind, sessionKey);
      if (episode && episode.trailerReason !== undefined) {
        lastTrailerReason = episode.trailerReason;
      }
      return episode;
    } catch (err) {
      if (err && err.isAuthoringHalt) {
        haltedReturn = {
          converged: false,
          iterations: iteration,
          halted: true,
          haltDetail: err.message,
          trailerReason: err.trailerReason ?? null,
          postmortemWritten: false,
          lastResults: [],
          errata: errata.slice(),
        };
        return null;
      }
      throw err;
    }
  };

  /** The cross-review path a reviewer episode writes this round (§5.2). */
  const reviewTargetPath = (skill, round) => crossReviewPath(feature, skill, reviewFileType, round);

  // The branch guard's cheap re-check: `main()` placed the tree on
  // feat-{feature} at entry, but phases run for a long time and a tree can drift
  // between them. Verify-only — reviewers of an earlier round may still be
  // flushing writes into this same tree, so a checkout here would be a mutation
  // under their feet.
  await verifyFeatureBranch({
    feature,
    context: `phase ${phase}'s review round`,
    _git,
    _log: emit,
  });

  // TSPEC-LOOP-02: Entry precondition check (skip for Phase CR)
  if (phase !== "CR") {
    const checkResult = await _checkFile(doc);
    if (!checkResult.ok) {
      throw haltError(
        `Error: ${doc} does not exist — cannot enter reviewLoop for phase ${phase}`
      );
    }
  }

  let result1, result2;
  // Retain the most recent optimizer result so callers (Phase T) can read the
  // DECISIONS_WARRANTED trailer without a separate post-PASS agent session. Null
  // when the loop converges on iteration 1 with no optimizer run.
  let lastOptimizerResult = null;
  // §3.9 / §5.6.1: the last episode's REVISION-COMPLETE trailer outcome, carried
  // on every return of this function.
  let lastTrailerReason = null;

  // TSPEC-LOOP-03: Iteration loop
  while (true) {
    // (a) Check iteration cap at loop-top
    if (iteration > endIndex) {
      // POSTMORTEM trigger
      const postmortemPath = `docs/${feature}/POSTMORTEM-${phase}-${feature}.md`;
      const postmortemPrompt = [
        `Write ${postmortemPath}.`,
        `Include the required sections: Phase, Iterations (${MAX_REVIEW_ROUNDS} — limit reached), Reviewers, Pattern of Disagreement, Best-Guess Root Cause, Recommendation.`,
        `Read all cross-review files for this phase (all versioned suffixes) to identify unresolved findings.`,
        `Commit and push.`,
      ].join(" ");

      let postmortemFailed = false;
      try {
        const postmortemResult = await _agent(optimizer, postmortemPrompt);
        if (
          postmortemResult == null ||
          (typeof postmortemResult === "string" &&
            postmortemResult.trim() === "")
        ) {
          postmortemFailed = true;
        }
      } catch {
        postmortemFailed = true;
      }

      // §6.3 step 2 — CONFIRM, do not trust the agent's reply. `rtWriteFile`
      // answers `"ok"` when it *believes* it wrote; AC-2.2 exists because that
      // belief has been wrong. The confirmation is the only evidence admitted.
      let postmortemWritten = false;
      if (!postmortemFailed) {
        const confirmation = await _checkFile(postmortemPath);
        postmortemWritten = !!(confirmation && confirmation.ok);
      }

      if (postmortemFailed) {
        log(
          `WARNING: POSTMORTEM agent failed — artifact not written for phase ${phase}`
        );
      } else if (!postmortemWritten) {
        log(
          `WARNING: POSTMORTEM agent reported success but no artifact was confirmed at ${postmortemPath} for phase ${phase}`
        );
      }

      // Build lastResults from the final iteration's reviewer verdicts (PM-F02)
      const lastResults = [
        { skill: reviewers[0], ...parseVerdict(result1, reviewers[0]) },
        { skill: reviewers[1], ...parseVerdict(result2, reviewers[1]) },
      ];

      return {
        converged: false,
        iterations: MAX_REVIEW_ROUNDS,
        lastResults,
        postmortemWritten,
        postmortemPath,
        trailerReason: null,
        errata: errata.slice(),
      };
    }

    // (b) Emit iteration log
    if (iteration === 1) {
      log("Starting iteration 1");
    } else {
      log(`Resuming from iteration ${iteration}`);
    }

    // (b2) TSPEC §5.3 t0–t2 — capture the anchor BEFORE the reviewers are
    // dispatched (t3), so what is recorded is the document this round actually
    // reviewed, not whatever the optimizer left behind afterwards. Phase CR's
    // target is a directory and carries no anchor.
    let anchorHash = null;
    let anchorNormalizedHash = null;
    let anchorUpstreamState = [];
    let anchorCommit = "unavailable";
    if (phase !== "CR") {
      // t0/t1 collapse into ONE seam call: the anchor never needed the bytes,
      // only their digest, and `_hashFile` returns exactly what
      // `approvalHashOf(await _readFile(doc))` returned — including `null` for
      // an absent or unreadable document. In the workflow runtime `_readFile`
      // is a per-chunk agent fan-out, so hashing the largest document in the
      // pipeline once per round used to cost ~1 agent per 6 KB; it now costs 1.
      // `_probeDoc` already carries that digest, under the same `approvalHashOf`
      // contract and with the same `null` for a document it could not read, so a
      // probing runtime pays for no second observation here.
      const probe = await probeDocument(_probeDoc, doc, roundDocType);
      anchorHash = (probe ? probe.hash : await _hashFile(doc)) ?? null; // t0–t1
      // DEC-APPROVAL-03's second anchor, taken at the SAME t0 from the SAME
      // observation, so the two can never describe different documents.
      anchorNormalizedHash = await normalizedAnchorFor({
        probe,
        path: doc,
        _hashNormalizedFile,
      });
      // PLAN §3.1's cascade anchor, taken at the SAME t0 instant and through
      // the same probe-then-hash pair: the upstream chain as it stood when
      // the reviewers were handed this round's document. Reading it later
      // would record a premise nobody reviewed.
      anchorUpstreamState = await deriveApprovalUpstreamState({
        feature,
        docType: roundDocType,
        _probeDoc,
        _hashFile,
      });
      anchorCommit = await headCommitSha(_git); // t2
    }

    // (c) Dispatch reviewers in parallel. On iteration ≥2 each reviewer gets a
    // delta re-review prompt (read prior cross-review, diff-only scan) — see
    // reviewerPrompt. Iteration 1 is the full first-pass review.
    // DEC-FRZ-01, decided ONCE per round and shared by both reviewers and the
    // optimizer below, so the three cannot disagree about whether the round they
    // are working is frozen.
    const frozen = freezeInForce({ priorApprovedRound, nextRound: iteration });
    if (frozen) {
      emit(
        `Decision freeze in force for ${doc} at round ${iteration} ` +
          `(prior approved round: ${priorApprovedRound ?? "none"}, late-round threshold: ${FREEZE_LATE_ROUND}).`
      );
    }
    const reviewerPrompt1 = reviewerPrompt(doc, phase, feature, iteration, reviewers[0], reviewFileType, frozen);
    const reviewerPrompt2 = reviewerPrompt(doc, phase, feature, iteration, reviewers[1], reviewFileType, frozen);

    // Each reviewer keeps ONE key across every round of this phase (M-1): a
    // transport that can resume therefore hands round N's reviewer its own
    // round N-1 context, which is exactly what the delta prompt asks it to read.
    const [r1, r2] = await _parallel([
      runWrapped(
        reviewers[0],
        reviewerPrompt1,
        reviewTargetPath(reviewers[0], iteration),
        "review",
        reviewerSessionKey(feature, roundDocType, phase, reviewers[0])
      ),
      runWrapped(
        reviewers[1],
        reviewerPrompt2,
        reviewTargetPath(reviewers[1], iteration),
        "review",
        reviewerSessionKey(feature, roundDocType, phase, reviewers[1])
      ),
    ]);
    if (haltedReturn) return haltedReturn;
    result1 = r1 && r1.response;
    result2 = r2 && r2.response;

    // §3.1 step 4: both reviewers, every iteration. Placed BEFORE the verdict
    // parse to make the independence explicit — the same response text feeds
    // both, and the erratum read cannot alter the verdict read.
    collectErrata(result1, reviewers[0]);
    collectErrata(result2, reviewers[1]);

    // (d) Parse verdicts. A missing/malformed VERDICT trailer sets malformed:true —
    // make one cheap Haiku recovery attempt to re-emit the trailer from the reviewer's
    // own output before paying for a full optimizer + re-review round.
    let verdict1 = parseVerdict(result1, reviewers[0]);
    if (verdict1.malformed) {
      const recovered = await recoverVerdict({
        reviewer: reviewers[0],
        rawResult: result1,
        _agent,
      });
      if (recovered) verdict1 = recovered;
    }
    let verdict2 = parseVerdict(result2, reviewers[1]);
    if (verdict2.malformed) {
      const recovered = await recoverVerdict({
        reviewer: reviewers[1],
        rawResult: result2,
        _agent,
      });
      if (recovered) verdict2 = recovered;
    }

    // (e) Evaluate gate
    const gatePass = isPassResult(verdict1) && isPassResult(verdict2);

    // (f) PASS branch — t4. The round is terminal, so §5.3 t5 appends the anchor
    // pair to each reviewer's cross-review file and t6 commits. A failed or
    // ambiguous append is an operator-facing error that yields NO approval for the
    // round and never halts the run (§6.2 row 8, `AT-17`): the phase simply has no
    // recorded approval to skip on next time.
    if (gatePass) {
      await appendApprovalAnchors({
        paths: [reviewTargetPath(reviewers[0], iteration), reviewTargetPath(reviewers[1], iteration)],
        hash: anchorHash,
        normalizedHash: anchorNormalizedHash,
        upstreamState: anchorUpstreamState,
        commit: anchorCommit,
        _readFile,
        _probeDoc,
        _appendFile,
        _git,
        emit,
      });
      // §3.9: `trailerReason` rides on EVERY return, `null` on the clean path —
      // so `null` must be observable as a value, which a conditional spread is not.
      return {
        converged: true,
        iterations: iteration,
        lastOptimizerResult,
        trailerReason: lastTrailerReason,
        errata: errata.slice(),
      };
    }

    // (g) Invoke optimizer (FAIL path)
    const optPrompt = optimizerPrompt(doc, phase, feature, iteration, reviewers, reviewFileType, frozen);
    // The optimizer shares the AUTHOR session with the phase's creator (M-2):
    // the agent revising the document is the agent that wrote it.
    const optEpisode = await runWrapped(
      optimizer,
      optPrompt,
      doc,
      "authoring",
      authorSessionKey(feature, roundDocType, phase)
    );
    if (haltedReturn) return haltedReturn;
    const optimizerResult = optEpisode && optEpisode.response;
    lastOptimizerResult = optimizerResult;
    // §3.1 step 4: the optimizer is an author, and an author reading reviewer
    // findings is exactly where an upstream defect surfaces.
    collectErrata(optimizerResult, optimizer);

    if (
      optimizerResult == null ||
      (typeof optimizerResult === "string" && optimizerResult.trim() === "") ||
      (typeof optimizerResult === "string" &&
        optimizerResult.toLowerCase().includes("non-zero exit"))
    ) {
      throw haltError(
        `Error: optimizer agent ${optimizer} failed during phase ${phase}, iteration ${iteration} — pipeline halted. Document at ${doc} may be in an inconsistent state.`
      );
    }

    // A no-op optimizer episode: the episode completed (it is not the failure
    // above) but changed no bytes of `doc`. Dispatching the reviewers again over
    // byte-identical input cannot converge and only burns a review round — this
    // exact waste happened in production (SE F-08, TE F-07: both reviewers filed
    // a re-review of an unchanged document as a process defect). Halt now rather
    // than advance `iteration` and loop.
    //
    // Gated on `measuredT > 0`: a target `isComplete` cannot score at all (the
    // unmeasurable-target escape inside `dispatchAndVerify` — e.g. Phase CR's
    // directory target, or any caller whose read seam is a stub) always shows
    // `wroteBytes === false` on a no-op dispatch, with no way to distinguish
    // "genuinely unchanged" from "nothing was ever measurable here". Halting on
    // that would turn every unmeasurable target into a false-positive halt.
    if (optEpisode && optEpisode.wroteBytes === false && optEpisode.measuredT > 0) {
      throw haltError(
        `Error: optimizer ${optimizer} completed without modifying ${doc} in phase ${phase}, iteration ${iteration} — re-reviewing an unchanged document cannot converge; pipeline halted.`
      );
    }

    iteration += 1;
  }
}

// ─── TSPEC §5.3 — approval anchor capture and append (t0…t6) ─────────────────

/**
 * §5.3 t2 — the commit the reviewed bytes were read at. Never a halt condition:
 * a repo-less or failing `git` degrades to the `"unavailable"` sentinel §4.3 and
 * §5.5 rule 3 both already accept (the comparison never reads it).
 *
 * @param {function|undefined} _git
 * @returns {Promise<string>}
 */
async function headCommitSha(_git) {
  if (typeof _git !== "function") return "unavailable";
  try {
    const result = await _git(["rev-parse", "HEAD"]);
    const stdout = result && typeof result.stdout === "string" ? result.stdout.trim() : "";
    return /^[0-9a-f]{7,40}$/.test(stdout) ? stdout : "unavailable";
  } catch {
    return "unavailable";
  }
}

/**
 * §5.3's pre-count over one cross-review file: the `APPROVAL-HASH:` values on
 * unfenced lines, in order. `scanLines` already skips fenced regions, so a quoted
 * example anchor cannot fabricate an ambiguity.
 *
 * @param {string} fileText
 * @returns {string[]}
 */
export function approvalAnchorPreCount(fileText) {
  const found = [];
  scanLines(String(fileText ?? ""), (line) => {
    const m = /^APPROVAL-HASH:\s*(\S+)\s*$/.exec(line);
    if (m) found.push(m[1]);
  });
  return found;
}

/**
 * §5.3 t5–t6. The pre-count is a count AND a comparison (E-14/E-15):
 *
 *   0 existing anchors        ⇒ append the pair
 *   1, equal to `hash`        ⇒ idempotent no-op; the approval stands
 *   1, unequal                ⇒ error surfaced, no append, no approval
 *   ≥ 2                       ⇒ history ambiguous, no append, no approval
 *
 * Nothing here throws: `AT-17`'s "does not halt".
 */
/**
 * The `APPROVAL-HASH-NORMALIZED:` value to record beside a raw anchor
 * (DEC-APPROVAL-03), taken at the same t0 instant and through the same two
 * transports as the raw one: the probe's answer when a probe answered, the
 * `_hashNormalizedFile` seam otherwise.
 *
 * Total, and `null` for everything it cannot establish — a probe that predates
 * the field, a transport that declines, a missing file. `null` means "append
 * the raw pair alone, exactly as before", so no caller has to distinguish
 * "could not compute" from "chose not to".
 */
async function normalizedAnchorFor({ probe, path, _hashNormalizedFile }) {
  if (probe) return typeof probe.normalizedHash === "string" ? probe.normalizedHash : null;
  if (typeof _hashNormalizedFile !== "function") return null;
  try {
    const value = await _hashNormalizedFile(path);
    return typeof value === "string" ? value : null;
  } catch {
    return null;
  }
}

async function appendApprovalAnchors({
  paths,
  hash,
  normalizedHash = null,
  upstreamState = [],
  commit,
  _readFile,
  _probeDoc,
  _appendFile,
  _git,
  emit,
}) {
  if (!hash) {
    emit(
      "Approval anchor not recorded: the reviewed document could not be read at " +
        "capture time. The round yields no approval; the phase will re-run."
    );
    return;
  }

  let appended = false;
  for (const path of paths) {
    // The pre-count is a JUDGMENT about the file, not its prose, so `_probeDoc`
    // can answer it: `anchors` is `approvalAnchorPreCount`'s array and `exists`
    // is the same absence the `null` read reports. `docType` is `null` because a
    // cross-review is scored whole-file (§5.9) — the probe's completeness fields
    // are not read here, only its anchors. The APPEND itself stays on
    // `_appendFile`: §7.4's append shape is not a read and has no probe.
    const probe = await probeDocument(_probeDoc, path, null);
    const existingText = probe ? null : await _readFile(path);
    if (probe ? probe.exists !== true : existingText == null) {
      emit(`Approval anchor not recorded: ${path} is absent. The round yields no approval.`);
      return;
    }
    const existing = probe
      ? (Array.isArray(probe.anchors) ? probe.anchors : [])
      : approvalAnchorPreCount(existingText);
    if (existing.length >= 2) {
      emit(
        `Approval anchor not recorded: ${path} already carries ${existing.length} ` +
          "APPROVAL-HASH: lines, so its history is ambiguous. The round yields no approval."
      );
      return;
    }
    if (existing.length === 1) {
      if (existing[0] === hash) continue; // E-14 — idempotent no-op.
      emit(
        `Approval anchor not recorded: ${path} already carries a DIFFERENT ` +
          `APPROVAL-HASH: (${existing[0]} vs ${hash}). The round yields no approval.`
      );
      return;
    }
    try {
      // The RAW anchor stays first and stays the shape every existing reader
      // (harvest's table, `approvalAnchorPreCount`, the fixtures) already pins;
      // the normalised line is inserted between it and `REVIEWED-COMMIT:` only
      // when one could be computed, so a legacy-shaped block is still emitted
      // whenever it could not (`normalizedAnchorFor`'s `null`).
      await _appendFile(
        path,
        `\nAPPROVAL-HASH: ${hash}\n` +
          (normalizedHash ? `APPROVAL-HASH-NORMALIZED: ${normalizedHash}\n` : "") +
          `REVIEWED-COMMIT: ${commit}\n` +
          // PLAN §3.1 — the cascade anchor, one line per upstream document
          // that existed at capture time, written LAST so every existing
          // reader of the block (harvest's table, `approvalAnchorPreCount`,
          // the fixtures) sees the shape it already pins, unchanged. An
          // empty list writes nothing at all: that is exactly the legacy
          // block, and exactly what §5.5 grandfathers (PLAN §7.1).
          upstreamStateLines(upstreamState)
      );
      appended = true;
    } catch (err) {
      emit(
        `Approval anchor not recorded: appending to ${path} failed (${err && err.message}). ` +
          "The round yields no approval."
      );
      return;
    }
  }

  if (!appended || typeof _git !== "function") return;
  try {
    await _git(["add", ...paths]); // t6
    await _git(["commit", "-m", `chore(pdlc): record approval anchors ${hash}`]);
  } catch {
    // t6 is best-effort: the anchors are on disk either way, and §5.5's comparison
    // reads the working tree, never the commit.
  }
}

// ─── Prompt helpers ───────────────────────────────────────────────────────────

/**
 * Map a reviewer skill id to the role slug it uses in its cross-review filename
 * (`CROSS-REVIEW-{role}-{DOC-TYPE}[-v{N}].md`). Slugs are taken from each reviewer
 * skill's Cross-Review File Format section. Returns null for unknown skills so
 * prompts degrade to the generic glob rather than an invented path.
 * @param {string} skill
 * @returns {string|null}
 */
/**
 * The single reviewer-skill → role-slug MAP (TSPEC §3.9). Lifted to module scope
 * so the filename grammar's role alternation (§5.2 G-2), the dispatch table and
 * the reverse accessor below all read the SAME catalogue and cannot desynchronise.
 * Sharing the object is what makes the three consistent; `RLH-MAP-01` is what keeps
 * this catalogue and `PHASE_DISPATCH`'s reviewer set consistent with each other.
 */
const MAP = {
  "se-review": "software-engineer",
  "pm-review": "product-manager",
  "te-review": "test-engineer",
};

/** The closed role catalogue G-2 validates a parsed filename's role against. */
const REVIEWER_ROLE_SLUGS = Object.freeze(Object.values(MAP));

export function reviewerRoleSlug(skill) {
  return MAP[skill] || null;
}

/**
 * The one place a `CROSS-REVIEW-…` path is spelled (§5.2).
 *
 * CR F-11: this used to be spelled once inside `reviewLoop` (for the path the loop
 * READS back) while the reviewer prompt named no output path at all, leaving the
 * reviewer role to infer a file type from the artifact under review. For Phase CR
 * that inference lands OUTSIDE the round window — CR passes a directory, so
 * `docTypeFromPath` yields null and `reviewFileType` degrades to the literal
 * "REVIEW", which is what `deriveRoundWindow` counts; a reviewer who inferred
 * "IMPLEMENTATION" wrote a file the window could not see and the phase's round
 * history read as empty. Both the loop and the prompt now derive from here, so the
 * name the reviewer is told to write is by construction the name the loop looks for.
 */
export function crossReviewPath(feature, skill, docType, round) {
  return `docs/${feature}/CROSS-REVIEW-${reviewerRoleSlug(skill) || skill}-${docType}-v${round}.md`;
}

/**
 * The reverse of `reviewerRoleSlug` (TSPEC §3.9): a role slug as it appears in a
 * `CROSS-REVIEW-{role}-…` basename back to the reviewer skill that produced it.
 *
 * The desynchronisation this pair guards against is between `MAP` and
 * `PHASE_DISPATCH`: a reviewer added to the dispatch table without a `MAP` entry
 * derives its cross-review path at the `reviewerRoleSlug(skill) || skill` fallback
 * (§5.2's call site), producing a basename whose role is outside G-2's closed
 * catalogue and therefore unparseable on the next round. `RLH-MAP-01`
 * (`__tests__/roundDerivation.test.js`) is what enforces that — both accessors are
 * exported for it, and the guarantee this comment states holds only because that
 * assertion runs. It is two-way: a dispatch reviewer with no slug reds, and a `MAP`
 * entry no phase dispatches reds too.
 *
 * @param {string} slug
 * @returns {string|null} the reviewer skill id, or `null` for a non-catalogue slug.
 */
export function reviewerSkillForSlug(slug) {
  for (const skill of Object.keys(MAP)) {
    if (MAP[skill] === slug) return skill;
  }
  return null;
}

// ─── TSPEC §5.2 — filename grammar and round-index derivation (the H-1 fix) ────

/** The G-1…G-4 cross-review basename grammar, applied to a BASENAME. */
const CROSS_REVIEW_RE =
  /^CROSS-REVIEW-(?<role>[a-z]+(?:-[a-z]+)*)-(?<docType>[A-Z][A-Z_]*)(?:-v(?<n>[1-9][0-9]*))?\.md$/;

/** The same grammar with the round/extension tail left unconsumed, so a basename
 *  that fails only on its tail can be told apart: `bad_round` from `trailing_junk`. */
const CROSS_REVIEW_LOOSE_RE =
  /^CROSS-REVIEW-(?<role>[a-z]+(?:-[a-z]+)*)-(?<docType>[A-Z][A-Z_]*)(?<rest>.*)$/;

const CROSS_REVIEW_PREFIX = "CROSS-REVIEW-";

/** The closed doc-type catalogue a cross-review may be written against (§4.4). */
const REVIEW_DOC_TYPES = Object.freeze([
  "REQ",
  "FSPEC",
  "TSPEC",
  "PLAN",
  "PROPERTIES",
  "DECISIONS",
]);

/**
 * Parse a cross-review basename against the §5.2 grammar. Total: a string goes
 * in, a tagged union comes out, and it never throws.
 *
 * The four rules the grammar encodes, and the rejection each produces:
 *   G-1 (case)                  — `[a-z]` role / `[A-Z]` doc type
 *   G-2 (closed role catalogue) — validated AFTER the regex against `MAP`'s
 *                                 values, not baked into the pattern ⇒ `bad_role`
 *   G-3 (no leading zeros)      — `[1-9][0-9]*` ⇒ `bad_round`
 *   G-4 (no other optional part)— `$` immediately after `\.md` ⇒ `trailing_junk`
 *
 * The un-suffixed form IS round 1: `CROSS-REVIEW-{role}-{DOC}.md` and
 * `…-v1.md` denote the same round. That is not a convenience — the un-suffixed
 * form is what pre-existing branches in this repo carry, and treating it as "no
 * round" would make every historical approval invisible.
 *
 * @param {string} basename
 * @returns {{ok: true, role: string, docType: string, round: number, suffixed: boolean}
 *          |{ok: false, reason: string}} `reason` is a `FILENAME_FAILURES` member.
 */
export function parseReviewFilename(basename) {
  const name = typeof basename === "string" ? basename : "";
  if (!name.startsWith(CROSS_REVIEW_PREFIX)) {
    return { ok: false, reason: "not_cross_review" };
  }

  const m = CROSS_REVIEW_RE.exec(name);
  if (m) {
    const { role, docType, n } = m.groups;
    if (!REVIEWER_ROLE_SLUGS.includes(role)) return { ok: false, reason: "bad_role" };
    if (!REVIEW_DOC_TYPES.includes(docType)) return { ok: false, reason: "bad_doc_type" };
    return {
      ok: true,
      role,
      docType,
      round: n === undefined ? 1 : Number(n),
      suffixed: n !== undefined,
    };
  }

  // The prefix is right but the rest is not. Classify the tail rather than
  // collapsing every such name onto `not_cross_review`, so E-03/E-07's notice
  // can tell an operator WHICH rule the file broke.
  const loose = CROSS_REVIEW_LOOSE_RE.exec(name);
  if (!loose) return { ok: false, reason: "bad_role" }; // G-1: the role segment itself
  const rest = loose.groups.rest;
  // Reachable only for a round token the strict pattern rejected — `-v0`, `-v01`.
  if (/^-v[0-9]+\.md$/.test(rest)) return { ok: false, reason: "bad_round" };
  return { ok: false, reason: "trailing_junk" };
}

/**
 * Derive the round window for one phase entry from ONE directory listing.
 *
 * Step 4 is the H-1 fix in a line: `startIndex` is one past the highest round
 * index already on the branch, so re-entering a phase never rewrites an existing
 * `-v{N}` cross-review. Step 6 makes `MAX_REVIEW_ROUNDS` a per-invocation BUDGET
 * rather than an absolute cap — on a branch whose highest existing round is 3,
 * the re-entered phase starts at 4 and gets rounds 4…8, five rounds, not two.
 *
 * `present` and `skipped` are both carried out (step 7) precisely so one listing
 * suffices for the whole phase entry: a caller that had to re-enumerate, or
 * re-parse the listing itself, would violate AC-1.2 and the §2.4 layering rule.
 *
 * Step 5 halts rather than guessing: two files claiming round 1 for one role and
 * doc type may carry different verdicts, so picking either is a coin flip on
 * whether the phase is skipped, and picking "the newer" would import a filesystem
 * timestamp into an otherwise purely content-addressed decision.
 *
 * Synchronous, total, and takes no seam (§3.7).
 *
 * @param {string[]} basenames - the directory listing, basenames only.
 * @param {string} docType - the document type under derivation.
 * @returns {{ok: true, startIndex: number, endIndex: number,
 *            present: Map<string, number[]>,
 *            skipped: Array<{basename: string, reason: string}>}
 *          |{ok: false, reason: "malformed_round_one_duplicate", role: string}}
 */
export function deriveRoundWindow(basenames, docType) {
  const listing = Array.isArray(basenames) ? basenames : [];
  // Deduplicated by basename, in the listing's own order — `skipped` is reported
  // in that order and `present` records each round index once.
  const unique = listing.filter((b, i) => listing.indexOf(b) === i);

  // Step 1 — parse every basename, keeping BOTH the entries and the rejects.
  const present = new Map();
  const skipped = [];
  // Per (role) record of which round-1 spelling was seen, for step 5.
  const roundOneForms = new Map();

  for (const basename of unique) {
    const result = parseReviewFilename(basename);
    if (!result.ok) {
      skipped.push({ basename, reason: result.reason });
      continue;
    }
    // A well-formed cross-review for a DIFFERENT doc type is a third outcome:
    // neither an entry nor a reject (§5.2, §8.2's partition property).
    if (result.docType !== docType) continue;

    // Step 2 — per-role round indices, deduplicated.
    const rounds = present.get(result.role) || [];
    if (!rounds.includes(result.round)) rounds.push(result.round);
    present.set(result.role, rounds);

    if (result.round === 1) {
      const forms = roundOneForms.get(result.role) || { plain: false, v1: false };
      if (result.suffixed) forms.v1 = true;
      else forms.plain = true;
      roundOneForms.set(result.role, forms);
      // Step 5 — one role, one doc type, two files both claiming round 1.
      if (forms.plain && forms.v1) {
        return {
          ok: false,
          reason: "malformed_round_one_duplicate",
          role: result.role,
        };
      }
    }
  }

  // Steps 3, 4 and 6.
  const indices = [];
  for (const rounds of present.values()) for (const round of rounds) indices.push(round);
  const startIndex = indices.length ? Math.max(...indices) + 1 : 1;
  const endIndex = windowEnd(startIndex);

  // Step 7.
  return { ok: true, startIndex, endIndex, present, skipped };
}

/**
 * The last round index of the review window that opens at `startIndex`.
 *
 * This is the SOLE place in the module where the window width is expressed in
 * terms of `MAX_REVIEW_ROUNDS`. `reviewLoop` takes `endIndex` as a parameter and
 * defaults it through this helper rather than recomputing the arithmetic, so the
 * budget can never be re-derived (and so drift) inside the loop itself.
 *
 * @param {number} startIndex
 * @returns {number}
 */
function windowEnd(startIndex) {
  return startIndex + MAX_REVIEW_ROUNDS - 1;
}

/**
 * DEC-ROUNDS-02 — has this document spent its LIFETIME round budget?
 *
 * `startIndex` is the round the next dispatch WOULD open, so `startIndex - 1` is
 * the number of rounds already on disk. The cap is reached when opening the next
 * round would take the document past `MAX_LIFETIME_ROUNDS`: at 14 rounds on disk
 * the loop still opens round 15; at 15 it does not open round 16.
 *
 * Synchronous, total, and takes no seam — the same discipline `deriveRoundWindow`
 * lives under, and for the same reason: the decision is content-addressed, derived
 * from the directory listing the gate already took, never from a clock.
 *
 * Non-numeric input answers `false` (do not cap): a window index this function
 * cannot read is not evidence that the budget is spent, and failing OPEN here is
 * the safe direction — the worst case is one more review round, which is the
 * behaviour that predates the cap.
 *
 * @param {number} startIndex - the round index the next dispatch would open.
 * @returns {boolean}
 */
export function lifetimeCapReached(startIndex) {
  const next = Number(startIndex);
  if (!Number.isFinite(next)) return false;
  return next > MAX_LIFETIME_ROUNDS;
}

/**
 * DEC-FRZ-01 — the round index from which EVERY round is frozen, regardless of
 * approval history. Late-round damping: a document on its tenth review round is
 * not still deciding what it is, whatever its anchors say.
 */
export const FREEZE_LATE_ROUND = 10;

/**
 * DEC-FRZ-01 — is the round about to open under DECISION FREEZE?
 *
 * The practice this mechanizes was imposed by hand in Phase F of
 * `pdlc-consolidation-agent` and measured: the target finding class disappeared
 * and the Medium rate fell ~75%. A matured document's review round decides
 * nothing new — it exists to catch what the last delta broke — and a reviewer
 * not told so files fresh decisions against text that was already approved.
 *
 * Two triggers, either sufficient:
 *
 *   1. **A prior approving round exists.** The document was approved at least
 *      once before the round about to open, so what re-opened the round is bytes
 *      moving (a staled anchor, a confirmed erratum), not an undecided document.
 *   2. **`nextRound >= FREEZE_LATE_ROUND`.** Late-round damping, independent of
 *      approval history.
 *
 * Pure, synchronous and total, the discipline `lifetimeCapReached` lives under:
 * the decision is derived from the round record the gate already took, never
 * from a clock. Unreadable input answers `false` — a freeze that cannot be
 * justified from the record is not imposed, and failing OPEN here costs at most
 * an ordinary unfrozen round, which is the behaviour that predates the freeze.
 *
 * @param {{priorApprovedRound: number|null, nextRound: number}} arg
 * @returns {boolean}
 */
export function freezeInForce({ priorApprovedRound, nextRound } = {}) {
  const round = Number(nextRound);
  if (Number.isFinite(round) && round >= FREEZE_LATE_ROUND) return true;

  const prior = Number(priorApprovedRound);
  if (!Number.isFinite(prior) || prior < 1) return false;
  // "PRIOR" is load-bearing: an approval recorded at or after the round about to
  // open is not history the freeze can rest on.
  if (Number.isFinite(round) && prior >= round) return false;
  return true;
}

// ─── TSPEC §5.6.3 — the two prompt kinds, and the section walk behind them ────

/** The doc type an artifact path names, e.g. `docs/f/FSPEC-f.md` → `"FSPEC"`. */
function docTypeFromPath(path) {
  const m = /\/([A-Z]+)-[^/]+\.md$/.exec(String(path ?? ""));
  return m ? m[1] : null;
}

/**
 * §5.9's artifact class for a target path. The three special classes are
 * recognised by their filename convention; everything else is a spec-class
 * document, which is also the safe default for Phase CR's directory target
 * (`topLevelSections` of an unreadable target is empty, so the wrapper's
 * unmeasurable-target escape takes over — see `dispatchAndVerify`).
 */
export function artifactClassOf(path) {
  const name = String(path ?? "");
  if (/\/CROSS-REVIEW-[^/]*$/.test(name)) return "cross-review";
  if (/\/CODE_REVIEW-[^/]*$/.test(name)) return "code-review";
  if (/\/LEARNINGS-[^/]*$/.test(name)) return "LEARNINGS";
  return "spec";
}

/**
 * The heading the resume prompt names — **never empty** (§15.5's closing
 * guarantee). It reuses the same module-scope walk `isComplete` uses; a second
 * heading walker would be a second oracle for the same question.
 *
 * Resolution order:
 * 1. an absent or blank target has no sections at all, so the resume prompt names
 *    the skeleton rather than a heading;
 * 2. a cross-review is scored whole-file (§5.9), so its one unwritten "section" is
 *    the trailing verdict block — the only thing its criterion can be missing;
 * 3. otherwise the first top-level section whose body is empty, by document order;
 * 4. otherwise the first required heading `isComplete` reports missing.
 *
 * @param {string} artifactClass
 * @param {string} docType
 * @param {string|null} text
 * @returns {string}
 */
export function firstUnwrittenSection(artifactClass, docType, text) {
  const body = String(text ?? "");
  if (body.trim() === "") return "the document skeleton (no content on disk yet)";
  if (artifactClass === "cross-review" && !crossReviewComplete(body)) {
    return '(the trailing "## Verdict" section)';
  }
  const sections = topLevelSections(body);
  const unwritten = sections.find((s) => isEmptyBody(s.body));
  if (unwritten) return unwritten.title;
  const { missing } = isComplete(artifactClass, docType, body);
  if (Array.isArray(missing) && missing.length > 0) return missing[0];
  return "the closing pass over the whole document";
}

/**
 * §5.6.3's shared clause, carried by every wrapped authoring **and** review
 * dispatch. `skillFiles.test.js` pins the same three literals in the SKILL
 * templates, so the runtime prompt and the SKILL text say one thing.
 */
const PACING_CONTRACT_CLAUSE = [
  "Pacing contract (H-3): lay down the skeleton first, then write ONE top-level",
  "section per edit, keep every single write under 12,000 bytes, and commit after",
  "each section. A monolithic write is killed by the 180 s stall watchdog and loses",
  "everything it had not yet flushed.",
].join(" ");

/**
 * §6.3's branch pin, carried by every dispatch prompt that ends in a commit.
 *
 * The orchestrator's guard already placed the tree on the branch; this clause is
 * the agent-side half of the same invariant — a last-moment check by the one
 * process that is about to write, and an explicit prohibition on "fixing" the
 * branch itself, because reviewers run in parallel in one shared tree and a
 * checkout by either of them lands on the other. Fully substituted, per §6.3: no
 * un-substituted placeholder reaches an operator-facing (or agent-facing) string.
 */
function branchPinClause(feature) {
  const branch = featureBranchName(feature);
  return (
    `All commits for this task must land on branch ${branch}. ` +
    "Immediately before each commit run `git rev-parse --abbrev-ref HEAD`; if it prints " +
    "anything else — especially the default branch — STOP and report instead of committing. " +
    "Do not run `git checkout` yourself; the orchestrator has already placed the tree on the branch."
  );
}

/** The greenfield opener for a target that is not on disk yet. */
function skeletonClause() {
  return (
    "This artifact is not on disk yet. Begin by laying out its top-level headings " +
    "as a skeleton, then fill them one at a time under the pacing contract above."
  );
}

/**
 * The resume opener (§5.6.3 clause 2, FSPEC §15.5): the target already carries
 * partial content, so the dispatch continues it instead of starting over. The
 * section count and the heading are MEASUREMENTS the caller passes in — this
 * script's own walk over the bytes (`isComplete` / `firstUnwrittenSection`), or
 * `_probeDoc`'s answer over the same criterion. The agent is never asked where it
 * got to, under either.
 */
function resumeClause({ T, S, firstUnwritten, targetPath }) {
  return [
    `RESUMED: ${targetPath} already carries partial content`,
    `(${S} of ${T} top-level sections carry a body).`,
    "Read the document on disk first and do NOT rewrite what is already written.",
    `The first unwritten section is ${firstUnwritten}.`,
    "Continue from there, one section per write, under the pacing contract above.",
  ].join(" ");
}

/**
 * The continuation opener (§5.6.3 clause 3, FSPEC §15.5): a revision-mode episode
 * is addressing a specific round's findings on a document an earlier, interrupted
 * dispatch may already have partly edited. The five clauses `RLH-AT-48` inspects
 * are all here, and the cross-review basenames are the ones the episode's own
 * refresh actually saw on disk — never a name derived from arithmetic.
 *
 * The round is written in lower case deliberately: the acceptance harness reads
 * `Iteration N` out of prompts to key episodes, and a capitalised restatement here
 * would re-key the episode mid-flight.
 */
function continuationClause(round, reviewBasenames, targetPath) {
  const named = reviewBasenames.length > 0 ? reviewBasenames.join(", ") : "the cross-reviews of this round";
  return [
    `CONTINUATION of round ${round}. ${targetPath} may have been partially edited`,
    "already by an earlier dispatch that was interrupted mid-write.",
    `Address the findings in: ${named}.`,
    "Read the document on disk first and apply only what is not already reflected",
    "there; do NOT rewrite passages that already carry the change.",
    "When every finding this round owes has been applied, end your reply with the",
    "line `REVISION-COMPLETE: yes`. If you were stopped before finishing, end it",
    "with `REVISION-COMPLETE: no` instead.",
  ].join(" ");
}

// ─── TSPEC §5.6.1 S-INV — refreshReviewState ─────────────────────────────────

/**
 * Re-read the branch's review record for one (feature, doc type), at the instant
 * an episode begins. **This is S-INV**: `selectMode` is never handed a snapshot
 * taken before the loop, because on a clean branch such a snapshot stays empty for
 * the life of the phase and every optimizer episode then selects greenfield
 * (TE-v2 N-01).
 *
 * The `ListFailure` disposition lives HERE, above the `deriveRoundWindow` call, so
 * that a listing which cannot be judged never reaches the round derivation:
 *
 * | reason | disposition |
 * |---|---|
 * | `dir_missing` | benign — the feature directory has no reviews yet, `files ← []` |
 * | `not_a_directory`, `unreadable`, `bad_argument` | halt — "not read" is never "no findings" |
 *
 * @param {{feature: string, docType: string|null, _listFiles: function, _readFile: function}} arg
 * @returns {Promise<{ok: true, startIndex: number, endIndex: number,
 *                    present: Map, reviewFiles: Map, matched: object[], files: string[]}
 *                  |{ok: false, message: string}>}
 */
export async function refreshReviewState({ feature, docType, _listFiles, _readFile }) {
  const dirPath = `docs/${feature}`;
  const listing = await _listFiles(dirPath);

  let files = [];
  if (listing && listing.ok) {
    files = Array.isArray(listing.files) ? listing.files : [];
  } else {
    const reason = (listing && listing.reason) || "unreadable";
    if (reason !== "dir_missing") {
      return { ok: false, message: `Cannot enumerate ${dirPath}: ${reason}` };
    }
  }

  const window = deriveRoundWindow(files, docType);
  if (!window.ok) {
    return {
      ok: false,
      message: `Cannot derive the review round window for ${docType} in ${dirPath}: ${window.reason} (role ${window.role})`,
    };
  }

  // The verdict record rule 2 reads. Unreadable is recorded as unreadable, never
  // downgraded to "no findings" — the two directions are not symmetric (§5.6.1).
  //
  // §5.6.1 pins WHICH files are opened: "§5.4's tier-1 reads over round
  // `w.startIndex - 1`, or empty when that is < 1". Reading every matched
  // basename instead would blow §5.4's two-`_readFile` fan-out and would open
  // rounds the approval search is forbidden to descend to (`RLH-AT-09`,
  // `RLH-AT-57`). `matched` still carries every round — it is derived from the
  // listing, costs no read, and `dispatchAndVerify` names the revision round's
  // files from it.
  const candidate = window.startIndex - 1;
  const reviewFiles = new Map();
  const matched = [];
  for (const basename of files) {
    const parsed = parseReviewFilename(basename);
    if (!parsed.ok || parsed.docType !== docType) continue;
    matched.push({ basename, role: parsed.role, round: parsed.round });
    if (parsed.round !== candidate) continue;
    const text = await _readFile(`${dirPath}/${basename}`);
    const parsedVerdict = extractFileVerdict(text, parsed.role);
    const anchor = parseApprovalHash(text);
    reviewFiles.set(`${parsed.role}:${parsed.round}`, {
      verdict: parsedVerdict.ok ? parsedVerdict.verdict : null,
      // The High count rides on the record so the high-only bar (`isPassResult`)
      // is decidable from it; `null` whenever the verdict itself is unreadable.
      high: parsedVerdict.ok ? parsedVerdict.high : null,
      verdictReadable: parsedVerdict.ok && parsedVerdict.malformed !== true,
      anchorHash: anchor.ok ? anchor.hash : null,
      // DEC-APPROVAL-03. `null` on every legacy record, which is what makes the
      // normalised comparison opt-in per approval rather than retroactive.
      anchorNormalizedHash: anchor.ok ? anchor.normalizedHash : null,
      // PLAN §3.1. `[]` on every legacy record — the grandfathered case, which
      // is what makes the cascade opt-in per approval rather than retroactive.
      anchorUpstreamState: anchor.ok ? anchor.upstreamState : [],
      anchorReason: anchor.ok ? null : anchor.reason,
      path: `${dirPath}/${basename}`,
    });
  }

  return {
    ok: true,
    startIndex: window.startIndex,
    endIndex: window.endIndex,
    present: window.present,
    reviewFiles,
    matched,
    files,
  };
}

// ─── TSPEC §5.8 — the POSTMORTEM query (§2.5 step G's subject) ───────────────

/**
 * Ask whether this (phase, feature) carries a POSTMORTEM, and whether a human
 * has resolved it (§5.8).
 *
 * This is a **query, not a gate**. It never decides on its own whether a phase
 * runs; the refusal lives at §2.5 step G, which is the single point every
 * phase-running exit converges on (G-INV). Putting the refusal in here would
 * invert AC-2.3b, because step 4's `FRESH` branch calls it for REPORTING ONLY.
 *
 * Absent or malformed marker ⇒ `unresolved`. Fail closed: a POSTMORTEM whose
 * marker cannot be read costs an operator one edit, whereas the opposite default
 * silently re-runs a phase that previously failed for an unfixed reason.
 *
 * @param {{phase: string, feature: string, _readFile: function}} arg
 * @returns {Promise<{status: "none"|"resolved"|"unresolved", path: string,
 *                    recommendation?: string}>}
 */
export async function checkPostmortem({ phase, feature, _readFile }) {
  const path = `docs/${feature}/POSTMORTEM-${phase}-${feature}.md`;
  const text = await _readFile(path);
  if (text == null || String(text).trim() === "") return { status: "none", path };

  const marker = parseResolvedMarker(text);
  if (marker.ok && marker.resolved) return { status: "resolved", path };
  return { status: "unresolved", path, recommendation: extractRecommendation(text) };
}

// ─── The optional probe seams — `_probeDoc`, `_probeReviewState`, `_probePostmortem` ─
//
// Every content read in this module crosses `_readFile`, which in the workflow
// runtime is a probe agent plus roughly one transcription agent per 6 KB. But the
// module almost never wants the content: it wants a JUDGMENT about it — the
// document's digest, its structural completeness, its round record, a POSTMORTEM's
// resolved marker. A probe seam answers that judgment at the FAR side of the
// transport, so the bytes never enter this module at all.
//
// The invariant that makes them safe to add anywhere: **a probe is an
// optimisation, never a correctness dependency.** Absent, `null`, ill-shaped or
// throwing, every one of the three falls back to the byte-taking path it replaced,
// which runs unchanged. That is why the resolvers below swallow the throw rather
// than propagating it — a probe that fails is a probe that was not there.
//
// The one exception is `_probeReviewState`'s explicit `{ok: false, message}`: that
// is not a failed probe but a SUCCESSFUL judgment that the review state cannot be
// derived, and it maps onto exactly the halt `refreshReviewState`'s own `ok: false`
// produces (§5.6.1, §6.2 rows 2 and 17). Downgrading it to a fallback would re-read
// the listing this module was just told it cannot judge.

/**
 * The absent probe — the shipped default of all three seams, and the value that
 * makes each of them a POLICY rather than a capability: a probe that is `null` is
 * a probe that was never installed, and every site falls back. Named rather than
 * spelled `null` at each site so the composition-root oracle (`RLH-AT-64`) can
 * resolve the default to a module-level non-function value, which is what
 * distinguishes "this parameter needs no runtime wiring" from "someone forgot to
 * wire it".
 */
const NO_PROBE = null;

/**
 * The absent command runner — `_runCommand`'s shipped module default, spelled the
 * same way and for the same reason as `NO_PROBE` above.
 *
 * `_runCommand(command) => Promise<{ ok: boolean, output: string }>` runs one
 * command string at the repo root. It is the transport M-6 needs: the thing that
 * lets the ORCHESTRATOR observe the suite rather than read an agent's claim about
 * it. The adapter wires it (`rtRunCommand`); a unit test that injects none gets
 * `null`, and Phase I's gate falls back to the legacy self-report scan and says so.
 */
const NO_RUN_COMMAND = null;

/**
 * `_probeDoc(path, docType)` — one document's state, without its bytes:
 * `{ok, exists, empty, hash, artifactClass, complete, missing, T, S,
 *   firstUnwritten, anchors}`, semantically identical to reading the document and
 * applying `approvalHashOf` / `isComplete` / `firstUnwrittenSection` /
 * `approvalAnchorPreCount` to it.
 *
 * @returns {Promise<object|null>} the probe record, or `null` to fall back.
 */
async function probeDocument(probe, path, docType) {
  if (typeof probe !== "function") return null;
  try {
    const result = await probe(path, docType);
    return result && result.ok === true ? result : null;
  } catch {
    return null;
  }
}

/**
 * The `{ok: true}` half of a `_probeReviewState` reply, with its two maps
 * rehydrated: `present` arrives as `{role: number[]}` and `reviewFiles` as an
 * object keyed `"role:round"`, because the seam is a JSON transport and a `Map`
 * does not survive it. `selectMode` reads both through `Map`'s interface, so the
 * rehydration is not cosmetic (§5.6.1 rule 4's `present.forEach`, rule 2's
 * `files.get`).
 */
function rehydrateReviewState(result) {
  const present = new Map();
  const rawPresent = result.present && typeof result.present === "object" ? result.present : {};
  for (const role of Object.keys(rawPresent)) {
    present.set(role, Array.isArray(rawPresent[role]) ? rawPresent[role].slice() : []);
  }

  const reviewFiles = new Map();
  const rawFiles = result.reviewFiles && typeof result.reviewFiles === "object" ? result.reviewFiles : {};
  for (const key of Object.keys(rawFiles)) reviewFiles.set(key, rawFiles[key]);

  return {
    ok: true,
    startIndex: result.startIndex,
    endIndex: result.endIndex,
    present,
    reviewFiles,
    matched: Array.isArray(result.matched) ? result.matched : [],
    files: Array.isArray(result.files) ? result.files : [],
  };
}

/**
 * `refreshReviewState`'s result, from `_probeReviewState` when that seam can
 * answer and from the local computation otherwise. Both arms return the SAME
 * shape, including the `{ok: false, message}` a caller turns into a halt.
 *
 * @param {{feature: string, docType: string|null, _listFiles: function,
 *          _readFile: function, _probeReviewState: function|null}} arg
 */
async function resolveReviewState({ feature, docType, _listFiles, _readFile, _probeReviewState }) {
  if (typeof _probeReviewState === "function") {
    let probed = null;
    try {
      probed = await _probeReviewState({ feature, docType });
    } catch {
      probed = null;
    }
    if (probed && probed.ok === false) return { ok: false, message: probed.message };
    if (probed && probed.ok === true) return rehydrateReviewState(probed);
  }
  return refreshReviewState({ feature, docType, _listFiles, _readFile });
}

/** The closed status catalogue §5.8 answers with, and `_probePostmortem` reports. */
const POSTMORTEM_STATUSES = Object.freeze(["none", "resolved", "unresolved"]);

/**
 * `checkPostmortem`'s result, from `_probePostmortem` when that seam can answer
 * and from the local read otherwise. A reply whose `status` is outside §5.8's
 * closed catalogue is not a judgment this module can act on, so it falls back
 * rather than being coerced — fail-closed stays with `checkPostmortem`.
 *
 * @param {{phase: string, feature: string, _readFile: function,
 *          _probePostmortem: function|null}} arg
 */
async function resolvePostmortem({ phase, feature, _readFile, _probePostmortem }) {
  if (typeof _probePostmortem === "function") {
    let probed = null;
    try {
      probed = await _probePostmortem({ phase, feature });
    } catch {
      probed = null;
    }
    if (probed && POSTMORTEM_STATUSES.includes(probed.status)) return probed;
  }
  return checkPostmortem({ phase, feature, _readFile });
}

/**
 * §5.6.2's view of one target, taken through `_probeDoc` when that seam answers
 * and through `_readFile` otherwise. The two arms carry the same fields, so
 * `dispatchAndVerify`'s loop reads only these and never branches on which it got:
 *
 * | field | meaning |
 * |---|---|
 * | `probed` | which arm produced this record — the loop compares only LIKE records |
 * | `identity` | the value progress is scored on: the bytes on the read arm, the digest on the probe arm |
 * | `empty` | the skeleton-opener test (§5.6.3 clause 1) |
 * | `measured` | `isComplete`'s `{complete, missing, T, S}` |
 * | `firstUnwritten` | the heading the resume opener names |
 *
 * `firstUnwritten` is computed EAGERLY on the read arm even though only the resume
 * opener reads it: it keeps the record total, and both are pure walks over bytes
 * this arm already holds.
 */
async function targetState({ targetPath, artifactClass, docType, _readFile, _probeDoc }) {
  const probe = await probeDocument(_probeDoc, targetPath, docType);
  if (probe) {
    return {
      probed: true,
      identity: probe.hash ?? null,
      empty: probe.empty === true,
      measured: {
        complete: probe.complete === true,
        missing: Array.isArray(probe.missing) ? probe.missing : [],
        T: probe.T ?? 0,
        S: probe.S ?? 0,
      },
      firstUnwritten: probe.firstUnwritten,
    };
  }
  const text = await _readFile(targetPath);
  return {
    probed: false,
    identity: text,
    empty: String(text ?? "").trim() === "",
    measured: isComplete(artifactClass, docType, text),
    firstUnwritten: firstUnwrittenSection(artifactClass, docType, text),
  };
}

// ─── TSPEC §5.4 — the approval search (the H-4 fix) ──────────────────────────

/** The shape every non-approving exit of the search returns (§5.4). */
function noApprovalRecord(candidate, unevaluable = []) {
  return {
    approving: false,
    candidate,
    hash: null,
    normalizedHash: null,
    upstreamState: [],
    unevaluable,
    tier1Empty: false,
  };
}

/**
 * TIER 1 — the candidate round's per-role CROSS-REVIEW records (§5.4).
 *
 * Pure: the reads were already performed by `refreshReviewState`, which §5.6.1
 * defines as "§5.4's tier-1 reads over round `startIndex - 1`". That is what
 * holds the fan-out at **two `_readFile` per phase entry** — this function opens
 * nothing.
 *
 * Four properties, each load-bearing:
 *   - single-highest-round candidate, **no descending walk** (`RLH-AT-57`);
 *   - a role's absent `-v{candidate}` is **not approving**, not partially
 *     approving (`RLH-AT-10`);
 *   - unanimity is `isPassResult` on every role AND identical anchor hashes — a
 *     partial or disagreeing anchor pair adopts neither value (`RLH-AT-56`);
 *   - a duplicated `VERDICT:` line no longer fails closed upstream: since the
 *     2026-08-08 lenient-parse decision §5.1 reads the LAST non-fenced verdict
 *     line, so the record here is whatever that line said (`RLH-AT-11`).
 *
 * @param {{reviewers: string[], startIndex: number, reviewFiles: Map}} arg
 * @returns {{approving: boolean, candidate: number, hash: string|null,
 *            unevaluable: string[], tier1Empty: boolean}}
 */
function tier1ApprovalRecord({ reviewers, startIndex, reviewFiles }) {
  const candidate = startIndex - 1;
  if (candidate < 1) return noApprovalRecord(candidate);

  const roles = reviewers.map((skill) => reviewerRoleSlug(skill) || skill);
  const records = roles.map((role) => reviewFiles.get(`${role}:${candidate}`) || null);

  // "Tier 1 produced a file at all" is what makes the tiers exclusive.
  if (records.every((r) => r === null)) {
    return { ...noApprovalRecord(candidate), tier1Empty: true };
  }
  // Role-asymmetry: one reviewer wrote the candidate round and the other did not.
  if (records.some((r) => r === null)) return noApprovalRecord(candidate);

  // §6.2 row 6: an absent, duplicated or unparseable anchor is UNEVALUABLE and
  // the offending file is named in the report. Adopting the *other* file's value
  // is the failure FSPEC §19 calls out.
  const unevaluable = records.filter((r) => !r.anchorHash).map((r) => r.path);
  const verdictsPass = records.every((r) => r.verdictReadable && isPassResult(r));
  if (!verdictsPass || unevaluable.length) return noApprovalRecord(candidate, unevaluable);

  const hashes = records.map((r) => r.anchorHash);
  if (!hashes.every((h) => h === hashes[0])) {
    // Disagreement: neither value may be adopted, so BOTH files are offending.
    return noApprovalRecord(candidate, records.map((r) => r.path));
  }

  // DEC-APPROVAL-03: the normalised anchor is adopted under the SAME unanimity
  // rule as the raw one — every role must carry it and all must agree. A single
  // role's normalised anchor is not a record, and a disagreement adopts neither
  // value. Anything less than unanimous simply degrades to `null`, i.e. to the
  // raw-only behaviour, and never to UNEVALUABLE: an approval that is legible
  // under §5.5's rule must not be weakened by an advisory field.
  const norms = records.map((r) => r.anchorNormalizedHash ?? null);
  const normalizedHash =
    norms.every((h) => typeof h === "string" && h === norms[0]) ? norms[0] : null;

  // PLAN §3.1: the cascade anchor is adopted on the SAME unanimity rule as the
  // raw one — every role must carry a byte-identical serialisation, or the
  // record adopts NONE of it and degrades to `[]`, i.e. to grandfathered
  // byte-rule-only behaviour. Never UNEVALUABLE: an approval that is legible
  // is not weakened by an advisory field the roles disagreed about.
  const upstreamSerialised = records.map((r) => upstreamStateLines(r.anchorUpstreamState ?? []));
  const upstreamState =
    upstreamSerialised.every((s) => s === upstreamSerialised[0]) && upstreamSerialised[0] !== ""
      ? (records[0].anchorUpstreamState ?? [])
      : [];

  return {
    approving: true,
    candidate,
    hash: hashes[0],
    normalizedHash,
    upstreamState,
    unevaluable: [],
    tier1Empty: false,
  };
}

/** The `## 6. Approval Record` heading tier 2 reads by name (§4.4, §5.4). */
const APPROVAL_RECORD_HEADING = /^\s*##\s+\d*\.?\s*Approval Record\s*$/;

/**
 * TIER 2 — `## 6. Approval Record` in `LEARNINGS-{feature}.md` (§5.4).
 *
 * Consulted **only** when the candidate round produced no cross-review file at
 * all: the tiers are exclusive, so there is no "both tiers disagree" merge to
 * specify and no cross-tier completion (`RLH-AT-10` falsifies both).
 *
 * Under §5.2's `startIndex = max(present) + 1`, `candidate` is by construction a
 * round some role holds, so post-harvest — the case this tier was written for —
 * `present` is empty, `candidate` is 0 and §5.4's `candidate < 1` exit fires
 * first (FSPEC §12.4 example B). This path therefore survives for a listing that
 * changes under the run, and is deliberately kept rather than folded away: the
 * grammar it reads is the one harvest writes (§4.4, RLH-09).
 *
 * @param {{feature: string, docType: string, candidate: number,
 *          reviewers: string[], _readFile: function}} arg
 */
async function tier2ApprovalRecord({ feature, docType, candidate, reviewers, _readFile }) {
  const text = await _readFile(`docs/${feature}/LEARNINGS-${feature}.md`);
  if (text == null) return noApprovalRecord(candidate);

  const rows = [];
  let inSection = false;
  scanLines(text, (line) => {
    if (APPROVAL_RECORD_HEADING.test(line)) {
      inSection = true;
      return;
    }
    if (!inSection) return;
    if (/^\s*#{1,2}\s/.test(line)) {
      inSection = false;
      return;
    }
    const cells = line.split("|").map((c) => c.trim());
    if (cells.length < 8) return; // leading + 6 columns + trailing
    rows.push(cells.slice(1, 7));
  });

  const roles = reviewers.map((skill) => reviewerRoleSlug(skill) || skill);
  const matched = roles.map((role) =>
    rows.find((r) => r[0] === docType && Number(r[1]) === candidate && r[2] === role) || null
  );
  if (matched.some((r) => r === null)) return noApprovalRecord(candidate);
  if (!matched.every((r) => isPass(r[3]))) return noApprovalRecord(candidate);

  const hashes = matched.map((r) => r[4]);
  if (!hashes.every((h) => APPROVAL_HASH_VALUE_RE.test(h) && h === hashes[0])) {
    return noApprovalRecord(candidate);
  }
  // Tier 2's row grammar is harvest's six columns and carries no normalised
  // anchor, so a LEARNINGS-sourced approval is raw-only by construction. Left
  // that way DELIBERATELY: widening the harvested table is a change to the
  // harvest artifact's shape, which this feature is not scoped to make.
  // For the same reason the tier-2 record carries no cascade anchor either:
  // a LEARNINGS-sourced approval is grandfathered, byte-rule-only (PLAN §7.1).
  return {
    approving: true,
    candidate,
    hash: hashes[0],
    normalizedHash: null,
    upstreamState: [],
    unevaluable: [],
    tier1Empty: false,
  };
}

// ─── TSPEC §3.8 — dispatchAndVerify ──────────────────────────────────────────

/** An authoring-budget halt: caught by `reviewLoop`, which turns it into a return. */
function authoringHaltError(message, trailerReason) {
  const err = haltError(message);
  err.isAuthoringHalt = true;
  err.trailerReason = trailerReason ?? null;
  return err;
}

/**
 * Dispatch one agent episode and verify its outcome against §5.6.2, re-dispatching
 * inside the episode until it is terminal or a budget ends it. **Deliberately not
 * exported** (§3.8) — its behaviour is observed through `main()` and `reviewLoop`.
 *
 * Order of evaluation, which is the whole of the H-3 fix:
 * 1. **terminal first, then progress**. A dispatch that writes nothing and declares
 *    the round complete is terminal; scoring progress first would re-dispatch it.
 * 2. progress is `before !== after` over the WORKING TREE — not "a section was
 *    completed", and not a git diff (§5.6.2, `RLH-AT-45`).
 *
 * **Both observations of the target go through `targetState`**, so the optional
 * `_probeDoc` seam answers them without the document's bytes ever crossing into
 * this module, and an absent or failing probe falls back to `_readFile` with the
 * loop below unchanged.
 *
 * **The unmeasurable-target escape.** When the target yields no top-level sections
 * at all *and* the dispatch changed nothing, this wrapper has no measurement to
 * make: `isComplete` cannot score a document it cannot see. Re-dispatching such an
 * episode to the budget would convert every unmeasurable target (Phase CR's
 * directory; any caller whose read seam is a stub) into a halt. The episode is
 * therefore terminal after one dispatch — exactly the pre-feature behaviour.
 *
 * @returns {Promise<{response: any, mode: string, round: number|null,
 *                    invocations: number, wroteBytes: boolean}>}
 */
async function dispatchAndVerify({
  skill,
  basePrompt,
  targetPath,
  docType,
  feature,
  dispatchKind,
  phaseId,
  model,
  _agent,
  _readFile,
  _listFiles,
  _probeDoc,
  _probeReviewState,
  _log,
  _git,
}) {
  const emit = typeof _log === "function" ? _log : () => {};
  const artifactClass = artifactClassOf(targetPath);

  // §5.6.1: mode is computed ONCE per episode, at the episode's entry, over state
  // this episode itself observed.
  let selection;
  let roundFiles = [];
  if (dispatchKind === "authoring") {
    const state = await resolveReviewState({
      feature,
      docType,
      _listFiles,
      _readFile,
      _probeReviewState,
    });
    if (!state.ok) throw haltError(state.message);
    selection = selectMode({
      dispatchKind,
      docType,
      present: state.present,
      reviewFiles: state.reviewFiles,
      startIndex: state.startIndex,
    });
    if (selection.mode === "revision") {
      roundFiles = state.matched
        .filter((m) => m.round === selection.round)
        .map((m) => m.basename);
    }
  } else {
    selection = selectMode({
      dispatchKind,
      docType,
      present: new Map(),
      reviewFiles: new Map(),
      startIndex: 1,
    });
  }

  let invocations = 0;
  let consecutiveNoProgress = 0;
  let wroteBytes = false;
  let lastTrailerReason = null;
  let response = null;
  // The episode's structural baseline — see `isTerminal`. Measured ONCE, over the
  // bytes this episode entered on, and only for a revision episode over a spec:
  // every other combination keeps the strict test.
  let entryMissing = null;
  let lastMeasured = null;
  // Single-read-per-dispatch: `before` is taken from the target ONCE, on the
  // episode's first iteration. On every later iteration this episode's own prior
  // `after` — already known to describe the current on-disk state, since the
  // dispatched skill is the only writer of `targetPath` during an episode — is
  // reused as `before`, saving a full-file subagent echo per iteration. Trade-off:
  // a concurrent external edit between iterations is attributed to the agent as
  // progress; the previous per-iteration re-read tolerated that.
  let before = null;
  const observe = () =>
    targetState({ targetPath, artifactClass, docType, _readFile, _probeDoc });

  for (;;) {
    if (invocations === 0) {
      before = await observe();
    }
    invocations += 1;
    if (invocations === 1 && selection.mode === "revision" && artifactClass === "spec") {
      entryMissing = before.measured.missing;
    }

    let opener;
    if (selection.mode === "revision") {
      opener = continuationClause(selection.round, roundFiles, targetPath);
    } else if (invocations === 1 && before.empty) {
      opener = skeletonClause();
    } else {
      opener = resumeClause({
        T: before.measured.T,
        S: before.measured.S,
        firstUnwritten: before.firstUnwritten,
        targetPath,
      });
    }
    const prompt = `${basePrompt}\n\n${PACING_CONTRACT_CLAUSE}\n\n${opener}`;

    let faulted = false;
    try {
      // Only the "authoring" episode (creator/optimizer, one document owner
      // per episode) is a same-prompt retry candidate on a thrown/rejected
      // dispatch. A "review" episode's dispatch is never retried here: a
      // faulted reviewer round already re-derives cleanly on the pipeline's
      // next invocation, and double-dispatching a reviewer risks two
      // cross-review files for one round.
      response =
        dispatchKind === "review"
          ? await _agent(skill, prompt, model ? { model } : undefined)
          : await withDispatchRetry(
              () => _agent(skill, prompt, model ? { model } : undefined),
              {
                label: `${skill} dispatch, phase ${phaseId}`,
                emit,
                onFault: () => {
                  faulted = true;
                },
              }
            );
    } catch {
      faulted = true;
      response = null;
    }
    if (faulted) {
      // §15.4: only a THROWN dispatch is a runtime fault. A reply with no trailer
      // is an omission, and an implementation that cannot tell them apart reports
      // a kill that did not happen.
      emit(`Dispatch fault observed: faultObserved=true (${skill}, phase ${phaseId}).`);
    }

    const after = await observe();
    const measured = after.measured;
    lastMeasured = measured;
    const verdict = terminalFrom(
      selection.mode,
      response ?? "",
      artifactClass,
      measured,
      entryMissing
    );
    lastTrailerReason = verdict.trailerReason;
    // §5.6.2's progress predicate, over whichever identity BOTH records carry:
    // the bytes on the read arm, the digest on the probe arm (two `null` digests
    // — an absent document, twice — are not progress). The arms are never
    // compared across each other: a probe that answered one observation and fell
    // back on the next leaves two incomparable identities, and scoring that as
    // progress spends dispatches rather than mis-halting an episode as stalled.
    const progressed =
      before.probed === after.probed ? before.identity !== after.identity : true;
    if (progressed) wroteBytes = true;
    before = after;

    if (verdict.terminal) break;
    // The unmeasurable-target escape — see the doc comment above.
    if (measured.T === 0 && !progressed) break;

    consecutiveNoProgress = progressed ? 0 : consecutiveNoProgress + 1;
    const sections = `(${measured.S} of ${measured.T} sections complete)`;
    const trailerNote = lastTrailerReason ? `; last trailer outcome: ${lastTrailerReason}` : "";
    // Self-explaining no-progress halt: when the gate still names a shortfall, say
    // which rows and flag the most common cause — a heading-naming mismatch on a
    // document that DOES cover the concept — so a stall like the one that halted a
    // complete `pdlc-advisory-tier` TSPEC is legible without re-reading the file.
    // The 3-attempt CONDITION is unchanged; only the message grows.
    const stillMissing = Array.isArray(measured.missing) ? measured.missing : [];
    const gateNote = stillMissing.length
      ? `; gate still requires: [${stillMissing.join(", ")}]; if the document substantively covers these, this is a heading-naming mismatch against isComplete's required headings, not a content gap`
      : "";

    if (consecutiveNoProgress >= MAX_AUTHORING_ATTEMPTS) {
      throw authoringHaltError(
        `Phase ${phaseId}: ${skill} made no progress across ${MAX_AUTHORING_ATTEMPTS} consecutive attempts on ${targetPath} ${sections}${gateNote}${trailerNote}.`,
        lastTrailerReason
      );
    }
    if (invocations >= MAX_AUTHORING_DISPATCHES) {
      throw authoringHaltError(
        `Phase ${phaseId}: ${skill} spent ${MAX_AUTHORING_DISPATCHES} dispatches without reaching structural completeness on ${targetPath} ${sections}${trailerNote}.`,
        lastTrailerReason
      );
    }
  }

  if (selection.mode === "revision") {
    emit(`Phase ${phaseId} round ${selection.round}: episode ended on the author's REVISION-COMPLETE trailer.`);
    // A shortfall the episode inherited is carried over rather than fixed. That is
    // deliberate (see `isTerminal`) but it must not be silent: the operator is the
    // only one who can decide whether the document should be retro-fitted.
    const carried = lastMeasured && Array.isArray(lastMeasured.missing) ? lastMeasured.missing : [];
    if (carried.length > 0) {
      emit(
        `Phase ${phaseId} round ${selection.round}: ${targetPath} carries a pre-existing structural shortfall, unchanged since this episode began and therefore not blocking — missing canonical headings: ${carried.join(", ")}.`
      );
    }
  }
  await advisoryPacingCheck({ wroteBytes, targetPath, _git, emit });

  return {
    response,
    mode: selection.mode,
    round: selection.round,
    invocations,
    wroteBytes,
    // The target's top-level-section count as last measured — i.e. whether this
    // episode's target was measurable at all (see the unmeasurable-target escape
    // above: a target `isComplete` cannot score, e.g. Phase CR's directory
    // target, also has `measuredT === 0`). A caller deciding whether "wrote
    // nothing" is meaningful must not conflate "genuinely unchanged" with
    // "nothing to measure in the first place".
    measuredT: lastMeasured ? lastMeasured.T : 0,
    trailerReason: lastTrailerReason ?? null,
  };
}

/**
 * §15.7's advisory proxy for "did that section land in one over-large write?".
 * No oracle for emitted bytes exists, so the per-artifact commit diff stands in —
 * and it is **advisory only**: it is reported and never halts anything (O-20).
 */
async function advisoryPacingCheck({ wroteBytes, targetPath, _git, emit }) {
  if (!wroteBytes || typeof _git !== "function") return;
  let result;
  try {
    result = await _git(["diff", "--numstat", "--", targetPath]);
  } catch {
    return;
  }
  const stdout = result && typeof result.stdout === "string" ? result.stdout : "";
  for (const line of stdout.split("\n")) {
    const m = /^(\d+)\t(\d+)\t(.+)$/.exec(line.trim());
    if (!m) continue;
    const added = Number(m[1]);
    if (added <= MAX_AUTHORING_WRITE_BYTES) continue;
    emit(
      `Advisory pacing check: ${m[3]} shows ${added} added lines against the ` +
        `${MAX_AUTHORING_WRITE_BYTES} per-write figure. That figure is advisory ` +
        `only — it is a proxy, not an oracle, and never a halt condition.`
    );
  }
}

/**
 * Build the reviewer dispatch prompt. Iteration 1 is a full first-pass review.
 * Iteration ≥2 appends the delta re-review protocol so the reviewer reads its own
 * previous cross-review and scans only the diff instead of re-reviewing the whole
 * document from scratch — the approval bar and VERDICT contract are unchanged.
 * @param {string} doc
 * @param {string} phase
 * @param {string} feature
 * @param {number} iteration
 * @param {string} [reviewer] - reviewer skill id (for the prior-cross-review path)
 * @returns {string}
 */
/**
 * M-1's convergence framing, added to every re-review (iteration ≥2).
 *
 * The measured failure it exists to prevent is the `pdlc-rcv` family's 9-round
 * non-convergence, where each round filed NEW findings against the very text
 * that answered the old ones. A reviewer re-reading a revised document from
 * scratch has no reason not to; one told that convergence is the goal, and that
 * its job is its own blocking findings plus regressions, does. The approval bar
 * itself is deliberately untouched by THIS clause — it scopes the reviewer's
 * ATTENTION, never its standard. The standard is step 4 below: since the
 * 2026-08-08 operator decision it refuses any open **High** finding, and Medium
 * and Low no longer block.
 */
/**
 * §3.4's grounding manifest, rendered into prompt text. Every `PHASE_DISPATCH`
 * entry that carries a review loop (R, F, T, D, P, PR, CR) declares a `grounding`
 * array — repo paths/symbols the creator and reviewers must verify claims
 * against (§3.4). Rendered as a header demanding code-grounded, file:line-cited
 * claims, followed by the phase's own entries as list lines.
 *
 * Returns `""` for a phase with no `grounding` field (Phase DOD, or an unknown
 * phase id) — the header is never emitted with nothing under it.
 * @param {string} phaseId
 * @returns {string}
 */
function groundingClause(phaseId) {
  const dispatch = PHASE_DISPATCH[phaseId];
  const entries = dispatch && Array.isArray(dispatch.grounding) ? dispatch.grounding : [];
  if (entries.length === 0) return "";
  return (
    `Ground every claim in code, not only in documents: verify claims against the actual ` +
    `repository state, and cite file:line for every claim you make about existing behavior.\n` +
    entries.map((entry) => `- ${entry}`).join("\n")
  );
}

/**
 * §3.5's three standing oracle-quality rules, appended to EVERY reviewer prompt
 * (all phases, all iterations) — never the optimizer prompt, since these are
 * instructions about what the reviewer must demand of the acceptance
 * tests/properties/tests under review, not about authoring them.
 */
const ORACLE_QUALITY_CLAUSE = [
  "When you review acceptance tests, properties, or unit tests, demand:",
  "- No implementation echoes: an expectation must never import or derive its expected value " +
    "from the code under test; expected values are literal transcriptions from the spec.",
  "- No absence-only oracles: every negative assertion (X does not happen) must be paired with " +
    "a positive assertion on the same path (what DOES happen instead).",
  "- Completeness by set-equality, not containment: enumerated contracts (row tables, " +
    "catalogues) need a set-equality check over the full enumeration, so a deleted case fails.",
].join("\n");

/**
 * DEC-FRZ-01's reviewer clause — on every reviewer prompt of a frozen round
 * (`freezeInForce`), and on no other.
 *
 * `REVIEW_CONVERGENCE_CLAUSE` scopes the reviewer's ATTENTION and leaves the bar
 * alone. This clause is the stronger statement the measured churn asked for: on
 * a matured document it also scopes what may BLOCK. The escape hatch is the
 * point — a reviewer who may not block on an improvement still has somewhere to
 * put it, so the observation is recorded rather than smuggled into a High.
 */
const FREEZE_REVIEWER_CLAUSE = [
  "DECISION FREEZE is in force for this document. Its content decisions are settled: this round " +
    "exists to catch what the last revision broke, not to decide anything new.",
  "A finding may block (VERDICT: Needs revision) ONLY if it is one of:",
  "(i) a defect the revision under review introduced — something this delta broke that worked before; or",
  "(ii) a factual contradiction with the repository at HEAD or with an upstream document, which makes " +
    "a load-bearing claim in this document false.",
  "Everything else — an improvement, a restructuring, extra coverage, wording, a decision you would " +
    "have taken differently — is out of scope as a blocking finding in a frozen round. Do not open a " +
    "new decision here. Record each such observation as its own line in your cross-review, in exactly " +
    "this form:",
  "DEFERRED: {one-line item}",
  "and approve.",
].join("\n");

/**
 * DEC-FRZ-01's author-side half, on the optimizer prompt of a frozen round.
 *
 * Without it the freeze is one-sided: a reviewer that defers an item correctly
 * and an author that then acts on the deferred line anyway re-opens exactly the
 * decision the freeze closed, and the next round has new text to review.
 */
const FREEZE_OPTIMIZER_CLAUSE = [
  "DECISION FREEZE is in force for this document. Address the blocking findings and nothing else.",
  "A line beginning DEFERRED: in a cross-review is recorded, not requested: do NOT act on it, do not " +
    "restructure, do not re-open a settled decision, and do not improve text no finding names.",
].join("\n");

const REVIEW_CONVERGENCE_CLAUSE =
  "Convergence is the goal: judge only whether your own blocking findings are resolved and " +
  "whether the revision broke anything — a narrower scope of attention, not a lower standard. " +
  "Only High findings block approval; Medium and Low are recorded, not gating.";

/**
 * M-2's continuing-author framing, added to EVERY optimizer dispatch.
 *
 * When the runtime can resume sessions this restates what the session already
 * makes true; when it cannot — today — it is the whole of M-2 that survives, and
 * it is the half the manual run showed matters most: revisions that did not
 * re-litigate settled decisions, and an author that caught its own cross-round
 * inconsistencies because it was asked to look for them.
 */
const CONTINUING_AUTHOR_CLAUSE =
  "You are the continuing author of this document, not a fresh reader of it. " +
  "Decisions approved in earlier rounds are settled — do not re-litigate them, and do not " +
  "rewrite approved sections beyond what the findings actually require. " +
  "Address every High and Medium finding, use judgment on Low, and expand scope beyond them for " +
  "nothing else. " +
  "Before you finish, re-read your revision for cross-round inconsistencies it may have " +
  "introduced with decisions taken in earlier rounds, and fix any you find.";

/**
 * PROPOSAL §3.1 step 4 / M-4 — the standing erratum clause, on EVERY creator,
 * optimizer and reviewer prompt.
 *
 * It exists to stop two failure modes the manual run named. A reviewer that
 * silently edits an upstream document invalidates that document's recorded
 * approval; a reviewer that folds an upstream defect into THIS document's verdict
 * blocks a document that is not at fault and cannot converge. The third option —
 * emit a line, let the orchestrator route it — is the one this clause asks for,
 * and the grammar is `parseErrata`'s.
 */
const ERRATUM_PROTOCOL_CLAUSE =
  "If you find a defect in an UPSTREAM document — one this document derives from — do not edit " +
  "that document yourself, and do not fold the defect into your verdict as if it were a defect of " +
  "the document in front of you. Emit one line per item in your final message, in exactly this form:\n" +
  "ERRATUM: {DOCTYPE}: {one-line item}\n" +
  `where {DOCTYPE} is one of ${ERRATUM_DOC_TYPES.join(", ")} (uppercase). The orchestrator routes ` +
  "each item to that document's author for a targeted versioned edit and to its approvers for a " +
  "delta confirmation.";

function reviewerPrompt(doc, phase, feature, iteration, reviewer, docType, frozen = false) {
  // DEC-FRZ-01. Rendered here, decided by `freezeInForce` at the call site: the
  // prompt builder never re-derives the trigger, so there is exactly one place
  // the freeze can be turned on.
  const freezePart = frozen ? `\n${FREEZE_REVIEWER_CLAUSE}` : "";
  const base =
    `Review the document at ${doc} for phase ${phase} of feature ${feature}. This is iteration ${iteration}.\n` +
    branchPinClause(feature);
  // §3.4 grounding, placed right after the branch pin; §3.5 oracle-quality
  // clauses are appended last so they read as the closing standing instruction
  // on every reviewer dispatch regardless of iteration.
  const grounding = groundingClause(phase);
  const groundingPart = grounding ? `\n${grounding}` : "";
  // §3.1 step 4's standing clause and §3.5's oracle-quality clauses are BOTH
  // unconditional on iteration: an upstream defect is as likely to surface in a
  // delta re-review as in the first pass.
  const oraclePart = `\n${ORACLE_QUALITY_CLAUSE}\n${ERRATUM_PROTOCOL_CLAUSE}`;

  // §6.3's general rule: NO un-substituted template reaches an operator-facing
  // string. `{DOC-TYPE}` and `{role}` were literal braces the reader had to
  // resolve by hand; both are known here.
  const type = docType || docTypeFromPath(doc) || "REVIEW";
  // CR F-11: name the output path outright, on EVERY iteration. A reviewer left to
  // infer the file type from the artifact under review can name a file outside the
  // window `deriveRoundWindow` derives — which is exactly how Phase CR's round 1
  // went missing on this feature. `crossReviewPath` is the same builder the loop
  // reads back through, so the two cannot drift.
  const targetFile = crossReviewPath(feature, reviewer, type, iteration);
  const targetClause =
    `Write your cross-review to exactly this path: ${targetFile}. ` +
    `Do not derive a different file type from the artifact under review — this phase's round ` +
    `history is keyed by that exact name, and a file outside it is not counted.`;

  if (iteration < 2) return `${base}${groundingPart}${freezePart}\n${targetClause}${oraclePart}`;

  const prev = iteration - 1;
  const role = reviewerRoleSlug(reviewer);
  const priorFile = role
    ? `${crossReviewPath(feature, reviewer, type, prev)} (your reviewer role is "${role}")`
    : `your own previous cross-review file for this document (docs/${feature}/CROSS-REVIEW-*-${type}-v${prev}.md — find your reviewer role's file for iteration v${prev})`;

  return (
    `${base}${groundingPart}\n` +
    `${REVIEW_CONVERGENCE_CLAUSE}\n` +
    `This is a re-review — follow the delta re-review protocol:\n` +
    `1. First read your own previous cross-review file: ${priorFile}.\n` +
    `2. Run \`git diff\` on ${doc} against the commit you last reviewed to see exactly what changed.\n` +
    `3. Verify each of your previous findings is resolved; scan ONLY the changed sections for new issues. ` +
    `Do not re-review unchanged sections you already approved.\n` +
    `4. The approval bar: any open High finding anywhere in the document — old or new — means Needs revision. ` +
    `Medium and Low findings do not block; file them and approve with minor changes.\n` +
    // DEC-FRZ-01 sits directly beneath the delta protocol it qualifies: the
    // protocol says where to look, the freeze says what may block.
    `${freezePart ? `${freezePart.slice(1)}\n` : ""}` +
    `${targetClause} End with the standard VERDICT trailer.` +
    oraclePart
  );
}

function optimizerPrompt(doc, phase, feature, iteration, reviewers = [], docType, frozen = false) {
  const base =
    `Address reviewer feedback on ${doc} for phase ${phase} of feature ${feature}. ` +
    `Iteration ${iteration} reviewers found issues. Update and commit.\n` +
    branchPinClause(feature);

  // Point the optimizer straight at this iteration's cross-review files so it does
  // not hunt for them. Both reviewer roles' expected paths for v{iteration}.
  const roles = reviewers.map(reviewerRoleSlug).filter(Boolean);
  const type = docType || docTypeFromPath(doc) || "REVIEW";
  let feedback = "";
  if (roles.length > 0) {
    const paths = roles
      .map((role) => `docs/${feature}/CROSS-REVIEW-${role}-${type}-v${iteration}.md`)
      .join(" and ");
    feedback =
      `\nRead the reviewers' cross-review files for this iteration directly: ${paths} ` +
      `(equivalently, all CROSS-REVIEW-*-v${iteration}.md files for this document type in docs/${feature}/). ` +
      `Address every High and Medium finding in them.`;
  }

  // §3.4 grounding, appended after the feedback paths and BEFORE the
  // continuing-author clause (pinned ordering — see groundingPrompts.test.js).
  // Deliberately no §3.5 oracle-quality clause here: those are review-prompt
  // clauses, about what a REVIEWER must demand, not what an author does.
  const grounding = groundingClause(phase);
  const groundingPart = grounding ? `\n${grounding}` : "";

  // Phase T: fold the DECISIONS_WARRANTED signal into the convergence loop so no
  // separate post-PASS agent session is needed. The last optimizer result carries
  // the trailer; if the loop converges on iteration 1 the creator result carries it.
  // M-2, applied at EVERY iteration: the optimizer is the document's continuing
  // author. Appended after the grounding clause so the clause qualifies the work
  // the paths just named, and before Phase T's trailer requirement, which must
  // stay the last instruction in the prompt.
  const continuing = `\n${CONTINUING_AUTHOR_CLAUSE}`;
  // DEC-FRZ-01's author-side half, right after the continuing-author clause it
  // sharpens, and still before Phase T's trailer requirement.
  const freeze = frozen ? `\n${FREEZE_OPTIMIZER_CLAUSE}` : "";
  // §3.1 step 4. Placed after the continuing-author clause and BEFORE Phase T's
  // trailer requirement, which stays the last instruction in the prompt.
  const erratum = `\n${ERRATUM_PROTOCOL_CLAUSE}`;

  if (phase === "T") {
    return `${base}${feedback}${groundingPart}${continuing}${freeze}${erratum}\n${decisionsWarrantedTrailerRequirement()}`;
  }
  return `${base}${feedback}${groundingPart}${continuing}${freeze}${erratum}`;
}

/**
 * Cheap trailer recovery for a reviewer whose VERDICT trailer was missing or
 * malformed. Re-asks the same reviewer — on Haiku — to re-emit ONLY the two
 * trailer lines from its own prior output (no re-review). Returns the re-parsed
 * verdict if it now parses cleanly, else null so the caller keeps the original
 * Needs-revision fallback and proceeds to the optimizer.
 *
 * @param {object} params
 * @param {string} params.reviewer - reviewer skill id
 * @param {string|null|undefined} params.rawResult - the reviewer's original output
 * @param {function} params._agent - injected agent function
 * @returns {Promise<{verdict: string, high: number, medium: number, low: number}|null>}
 */
export async function recoverVerdict({ reviewer, rawResult, _agent = agent }) {
  const recoveryPrompt =
    `Your previous review response did not end with a machine-readable VERDICT trailer. ` +
    `Do not redo the review. Based ONLY on the text below (your own previous output), ` +
    `re-emit exactly the two trailer lines and nothing else:\n` +
    `VERDICT: <Approved | Approved with minor changes | Needs revision>\n` +
    `{"high": N, "medium": N, "low": N}\n\n` +
    `--- previous output ---\n${rawResult ?? ""}`;

  const recovered = await _agent(reviewer, recoveryPrompt, { model: "haiku" });
  const parsed = parseVerdict(recovered, reviewer);
  return parsed.malformed ? null : parsed;
}

/**
 * The DECISIONS_WARRANTED trailer requirement appended to the Phase T creator and
 * optimizer prompts (formerly the body of the standalone post-PASS TSPEC session).
 * @returns {string}
 */
function decisionsWarrantedTrailerRequirement() {
  return (
    `End your final message with:\n` +
    `DECISIONS_WARRANTED: true if load-bearing architectural alternatives were weighed and rejected during the TSPEC review; ` +
    `DECISIONS_WARRANTED: false if this is a trivial feature with no real alternatives considered.`
  );
}

function creatorPrompt(phase, featureName, inputs) {
  const dispatch = PHASE_DISPATCH[phase];
  const grounding = groundingClause(phase);
  return (
    `Create ${dispatch.creatorOutputPath.replace(/\{feature\}/g, featureName)} for feature ${featureName}. ` +
    `Input documents: ${inputs.join(", ")}. Commit and push.\n` +
    branchPinClause(featureName) +
    (grounding ? `\n${grounding}` : "") +
    // §3.1 step 4: the creator reads every upstream document this phase derives
    // from, which makes it the first dispatch positioned to spot a defect in one.
    `\n${ERRATUM_PROTOCOL_CLAUSE}`
  );
}

/**
 * §3.1 step 4a — the upstream author's ERRATUM prompt.
 *
 * The whole value of M-4 is in what this prompt REFUSES to ask for: not a
 * re-authoring, not a re-read of the downstream document, not a fresh pass over
 * the upstream one. A targeted, versioned edit that addresses exactly the listed
 * items and changes nothing else is what made three FSPEC errata cost one round.
 */
function erratumAuthorPrompt({
  feature,
  docType,
  docPath,
  itemLines,
  raisedIn,
  upstreamState = [],
  movedSinceMinted = [],
}) {
  return (
    `ERRATUM ROUND for ${docPath} (feature ${feature}).\n` +
    upstreamHeadClause({ docType, upstreamState, movedSinceMinted }) +
    `Phase ${raisedIn} raised the following errata against this ${docType}:\n` +
    `${itemLines}\n` +
    `This is an erratum round, NOT a rewrite. Apply a targeted, versioned edit that addresses ` +
    `exactly the items listed above and changes nothing else — do not restructure, do not ` +
    `re-litigate approved decisions, do not expand scope. If the document carries a version or ` +
    `changelog, bump it and record this erratum edit there. Commit.\n` +
    branchPinClause(feature)
  );
}

/**
 * DEC-ERR-03's first clause, rendered — the upstream state AT DISPATCH TIME, and
 * the re-grounding instruction that reads it.
 *
 * The root cause it addresses (POSTMORTEM-T episode 2, RC-1/RC-2): an erratum
 * wave has no synchronisation point. The routed list is minted when the wave
 * opens and travels unchanged while the wave keeps editing documents above the
 * target, so a list that was correct for the version it was cut against is stale
 * for HEAD by the time the tail layer is dispatched — and an author that absorbs
 * it fully and correctly still ships a hole.
 *
 * So the prompt states the upstream documents' digests as of THIS dispatch (an
 * agent can compare them against what it reads), orders the re-grounding BEFORE
 * the item list, and names the documents that actually moved since the list was
 * minted when any did. Returns `""` when the target has nothing above it (REQ),
 * so the REQ author's prompt is byte-identical to its pre-decision form.
 */
function upstreamHeadClause({ docType, upstreamState = [], movedSinceMinted = [] }) {
  if (!Array.isArray(upstreamState) || upstreamState.length === 0) return "";
  const rows = upstreamState
    .map((entry) => `- ${entry.docType}: ${entry.path} (${entry.hash})`)
    .join("\n");
  const moved =
    Array.isArray(movedSinceMinted) && movedSinceMinted.length > 0
      ? `UPSTREAM MOVED SINCE THIS LIST WAS MINTED: ${movedSinceMinted.join(", ")}. The items below ` +
        `were derived from an EARLIER version of ${movedSinceMinted.length === 1 ? "that document" : "those documents"} ` +
        `and may be incomplete or wrong for HEAD. Re-derive what this ${docType} owes its upstream ` +
        `from the current text before you edit anything (DEC-ERR-03).\n` +
        // PLAN §2.4 item 2 — the structural re-mint. Every item below must get
        // exactly one RE-MINT line, so the confirmers read your re-derivation
        // against HEAD instead of the stale mint.
        `For EACH item below, end your final message with one line: ` +
        `\`RE-MINT: STILL-RAISED: {item text}\` if it is still open against HEAD, or ` +
        `\`RE-MINT: ABSORBED: {item text}\` if your re-grounding shows it is already resolved and ` +
        `your edit does not need to touch it. Omitting these lines leaves the routed list below as ` +
        `the floor stated above.\n`
      : "";
  return (
    `Re-ground on upstream HEAD FIRST, before you read the items below. These are the upstream ` +
    `documents this ${docType} derives from, at their CURRENT version as of this dispatch:\n` +
    `${rows}\n` +
    `Read each of them at that version, then treat the item list below as a FLOOR, not a ceiling: ` +
    `if HEAD says something the items do not, the list is stale and this ${docType} must match HEAD.\n` +
    moved
  );
}

/**
 * §3.1 step 4c — the delta-confirmation prompt for the upstream document's own
 * approvers.
 *
 * They are not re-reviewing: they are answering one question about a diff they
 * are named on. That is what keeps their earlier approval from going stale —
 * the confirmation file is the round the fresh approval anchors are appended to.
 */
function erratumConfirmPrompt({
  feature,
  docType,
  docPath,
  itemLines,
  round,
  reviewFile,
  upstreamState = [],
}) {
  return (
    `DELTA CONFIRMATION for ${docPath} (feature ${feature}).\n` +
    `You previously approved this ${docType}. It has just received a targeted erratum edit ` +
    `addressing these items:\n` +
    `${itemLines}\n` +
    `Do not re-review the whole document. Read the items above and \`git diff\` the erratum edit ` +
    `to ${docPath}, then answer one question: does the delta resolve those items without breaking ` +
    `anything you previously approved?\n` +
    erratumSupersetClause({ docType, upstreamState }) +
    findingGrammarClause() +
    `Write your confirmation as the next cross-review round for this document type — ` +
    `${reviewFile} (round v${round}) — and end it with the standard VERDICT trailer.\n` +
    branchPinClause(feature)
  );
}

/**
 * The `FINDING:` grammar, stated to the confirmer (PLAN §2.1) — the input the
 * gate reads via `parseConfirmationFindings`.
 *
 * The gate needs three things a prose finding does not carry: how bad it is,
 * whether THIS round's edit introduced it or it was already in the pre-round
 * bytes, and whether it sits inside the sections the edit touched. Those three
 * decide whether the round earns one bounded follow-up, routes back to the
 * owning phase's ordinary loop, or halts — a distinction no amount of re-reading
 * the prose recovers.
 *
 * Untagged findings are not an error the confirmer is punished for: they are
 * read as the worst case ({delta, nonlocal}), i.e. the pre-grammar halt. The
 * grammar only ever buys a softer outcome, so the clause states that plainly
 * rather than demanding compliance.
 */
function findingGrammarClause() {
  return (
    `Tag every finding you raise. One finding per line, outside any fenced block, ` +
    `above your VERDICT trailer:\n` +
    `FINDING: {High|Medium|Low} | {delta|inherited} | {local|nonlocal} | {section anchor} | {what is wrong}\n` +
    `- delta = this round's edit introduced it, or left it unlanded; inherited = it was ` +
    `already in the pre-round bytes and this edit did not touch it.\n` +
    `- local = it sits inside the sections this edit changed; nonlocal = anywhere else.\n` +
    `- The section anchor and the text are free-form; pipes inside the text are fine.\n` +
    `An untagged finding is read as {delta, nonlocal} — the strictest reading — so tagging ` +
    `can only ever widen the outcome, never narrow it.\n`
  );
}

/**
 * DEC-ERR-03's second clause — on BOTH confirming channels, always.
 *
 * The episode it exists to prevent: the two confirming reviewers split on
 * identical bytes because they were answering different questions. `pm-review`
 * ran the protocol's *absorbed ⊇ raised* check and passed the document;
 * `se-review` re-measured it against upstream HEAD and found one High. The
 * outcome of a confirmation must not depend on which reviewer happens to
 * over-deliver, so the superset read is stated in the prompt both of them get.
 *
 * "The routed items landed" stays necessary — the paragraph above this clause
 * asks exactly that — and this clause is what makes it not sufficient.
 */
function erratumSupersetClause({ docType, upstreamState = [] }) {
  const rows =
    Array.isArray(upstreamState) && upstreamState.length > 0
      ? `The upstream documents, at their current version as of this dispatch:\n` +
        upstreamState.map((entry) => `- ${entry.docType}: ${entry.path} (${entry.hash})`).join("\n") +
        `\n`
      : "";
  return (
    `Your scope is this ${docType} measured against its upstream AT HEAD — not the item list. ` +
    `The items landing is NECESSARY, NOT SUFFICIENT. Re-read the upstream text this ${docType} now ` +
    `leans on, at its current version, and ask whether this document is still a faithful ` +
    `compression of it. Anything it cites that upstream no longer says, or no longer says the same ` +
    `way, is a finding of THIS confirmation whether or not it appears in the list above ` +
    `(DEC-ERR-03).\n` +
    rows
  );
}

/**
 * PLAN §3.2 — the same-pass CASCADE confirmation prompt.
 *
 * Not the erratum confirmation: nothing was edited in THIS document. What
 * moved is the layer above it, so the question is narrower and stated as
 * such — is this document still a faithful compression of an upstream that
 * changed under it? The discipline is `erratumConfirmPrompt`'s: read your own
 * prior cross-review, read the diff of the document that moved, answer on the
 * `FINDING:` grammar, end with the standard VERDICT trailer.
 */
function cascadeConfirmPrompt({
  feature,
  docType,
  docPath,
  upstreamDocType,
  upstreamPath,
  round,
  reviewFile,
  upstreamState = [],
}) {
  return (
    `UPSTREAM-CASCADE CONFIRMATION for ${docPath} (feature ${feature}).\n` +
    `You previously approved ${docType}. Its own bytes have NOT changed. What changed is ` +
    `${upstreamDocType}, at ${upstreamPath}: an erratum round edited it after your approval was ` +
    `recorded, so your approval was taken against a version of ${upstreamDocType} that no longer ` +
    `exists.\n` +
    `Do not re-review the whole document, and do not re-litigate settled decisions. Re-read your ` +
    `own prior cross-review of ${docType}, read \`git diff\` for the edit to ${upstreamPath}, and ` +
    `answer ONE question: does ${docType} still hold as approved against ${upstreamDocType} as it ` +
    `now stands?\n` +
    erratumSupersetClause({ docType, upstreamState }) +
    findingGrammarClause() +
    `Write your confirmation as the next cross-review round for this document type — ` +
    `${reviewFile} (round v${round}) — and end with the standard VERDICT trailer.\n` +
    branchPinClause(feature)
  );
}

function implementPrompt(task, featureName) {
  return (
    `Implement task ${task.id}: ${task.description}\n` +
    `Feature: ${featureName}\n` +
    `TSPEC: docs/${featureName}/TSPEC-${featureName}.md\n` +
    `PROPERTIES: docs/${featureName}/PROPERTIES-${featureName}.md\n` +
    `Dependencies completed: ${task.dependencies.join(", ") || "none"}\n` +
    `Follow TDD. Run tests. Commit and push.\n` +
    branchPinClause(featureName)
  );
}

/**
 * The WAVE dispatch prompt (PROPOSAL §3.3, M-5/M-6).
 *
 * Three things differ from `implementPrompt`, and each is load-bearing:
 *   1. **Ownership.** The wave's members run in ONE shared tree, so the manifest's
 *      file list is the only thing keeping them off each other's edits. It is
 *      stated as an exact set, not as guidance.
 *   2. **Targeted tests only.** M-6: the orchestrator runs the suite between
 *      waves. An agent that also runs it pays for it twice and — measured on the
 *      manual run — is the dispatch that stalls behind its own backgrounded test
 *      run.
 *   3. **No commits.** The orchestrator verifies, then commits. This is what made
 *      two agent deaths cost nothing on the manual run: the work was already in
 *      the tree, verified, and committable by whichever agent survived.
 */
function waveImplementPrompt(task, featureName) {
  const owned = Array.isArray(task.files) ? task.files : [];
  const ownedList = owned.length > 0 ? owned.join(", ") : "(none listed)";
  return (
    `Implement task ${task.id}: ${task.description}\n` +
    `Feature: ${featureName}\n` +
    `TSPEC: docs/${featureName}/TSPEC-${featureName}.md\n` +
    `PROPERTIES: docs/${featureName}/PROPERTIES-${featureName}.md\n` +
    `Dependencies completed: ${task.dependencies.join(", ") || "none"}\n` +
    `Follow TDD: write the failing test first, then the minimum implementation.\n` +
    `Run only your task's targeted tests — do not run the full suite; the orchestrator runs it.\n` +
    `You own EXACTLY these files: ${ownedList}. Do not create or modify any other file.\n` +
    `Do NOT run git add or git commit — the orchestrator verifies your work and commits it.\n` +
    // The runtime kills any dispatch that makes no visible progress for 180
    // seconds (hardcoded, not configurable) — one A-24-sized task died on all
    // six retries composing a single large edit. The clause below is the wave
    // sibling of PACING_CONTRACT_CLAUSE: small writes, frequent tool calls.
    `PACING (hard runtime constraint): you are killed after 180 seconds without a tool call. ` +
    `Never compose one large write — start each file small and extend it in increments of at ` +
    `most 8,000 bytes per Write/Edit, interleaving verification commands. If a single edit ` +
    `would be long, split it into several smaller edits.\n` +
    `Report a short summary of what you changed.\n` +
    branchPinClause(featureName)
  );
}

function propertiesTestPrompt(featureName) {
  return (
    `Implement PROPERTIES tests for feature ${featureName}.\n` +
    `Read: docs/${featureName}/PROPERTIES-${featureName}.md\n` +
    `For each property without a corresponding test, write it using TDD at the specified test level.\n` +
    `Run the full test suite. All tests must pass before committing. Commit and push.\n` +
    branchPinClause(featureName)
  );
}

/**
 * FSPEC §8.4 step 1's hand-off. `harvest-learnings/SKILL.md` §5 instructs the agent to copy a
 * `failure-mode-id` verbatim "if a candidate's failure mode was named in the HANDED
 * open-promotion list" — a guard that fails closed (no id is written at all) unless the list
 * actually arrives. The arithmetic is deliberately not delegated to the agent: an id an LLM
 * composes is not byte-equal to a recorded slug, which would make `recurred` unreachable and
 * drift every promotion to `insufficient-evidence` and then `unmeasurable`.
 */
function harvestPrompt(featureName, openPromotions = []) {
  return (
    `Harvest learnings for feature ${featureName}:\n` +
    `1. Read all CROSS-REVIEW-*.md and CODE_REVIEW-*.md files (every doc type, every -vN suffix) for docs/${featureName}/.\n` +
    `2. Read all POSTMORTEM-*.md files for docs/${featureName}/ (if any).\n` +
    `3. Write docs/${featureName}/LEARNINGS-${featureName}.md.\n` +
    `4. Commit and push LEARNINGS before any delete operation.\n` +
    `5. Only after the LEARNINGS commit is confirmed on remote, delete the harvested CROSS-REVIEW-* and CODE_REVIEW-* files.\n` +
    `6. Commit and push the deletions.\n` +
    `\nOpen-promotion list, computed from ${CONSOLIDATION_LOG_PATH} and handed to you (FSPEC §8.4 ` +
    `step 1). For each §5 Open Item you write, ask one question per entry below: does this item ` +
    `report the failure that entry's symptom describes, on that entry's artifact, in that ` +
    `entry's phase? On a yes, copy that entry's id VERBATIM onto the item as ` +
    `\`failure-mode-id: {id}\` — never re-slug, abbreviate, or mint a new id. On no matches, ` +
    `write no line.\n` +
    `${renderOpenPromotionList(openPromotions)}\n` +
    branchPinClause(featureName)
  );
}

/**
 * Phase H2's distil dispatch prompt (TSPEC §9.3, PLAN A-27, decision 4). Deliberately named as a
 * distinguishable ADVISORY-class dispatch (never mistaken for Phase H's own `harvest-learnings`
 * call) — the pipeline itself performs the guarded delete afterward, so this prompt never asks the
 * agent to delete the record.
 */
function advisoryDistilPrompt(featureName) {
  return (
    `ADVISORY distil for feature ${featureName}:\n` +
    `1. Read docs/${featureName}/ADVISORY-${featureName}.md.\n` +
    `2. Append a summary of its entries to docs/${featureName}/LEARNINGS-${featureName}.md.\n` +
    `3. Do NOT delete ADVISORY-${featureName}.md yourself — the pipeline deletes it through the ` +
    `guarded channel after this dispatch returns.\n` +
    branchPinClause(featureName)
  );
}

// ─── TSPEC-SHIP: PR-raise + CI-verify (Phase PUB) ─────────────────────────────

function createPrPrompt(featureName) {
  return (
    `Raise a pull request for feature ${featureName}. ` +
    `The branch was already rebased onto the latest default branch in Phase DOD — do NOT rebase again.\n` +
    `1. Push the branch if needed: git push origin feat-${featureName}.\n` +
    `2. Open a pull request from feat-${featureName} into the default branch. ` +
    `If a PR is already open for this branch, reuse it — do not open a duplicate.\n` +
    `3. Base the PR title and description on the feature's REQ/FSPEC.\n` +
    `Do NOT merge the PR. End your final message with this trailer as the last line:\n` +
    `PR_URL: <the full https URL of the pull request>\n` +
    `If the PR could not be created, end with:\n` +
    `PR_URL: none`
  );
}

// ─── DOD rebase: ship-pr rebases feat-{feature} onto the latest default branch ─
function rebasePrompt(featureName) {
  return (
    `Rebase the feature branch onto the latest default branch for feature ${featureName}.\n` +
    `1. Fetch the latest default branch from remote: git fetch origin <default-branch>.\n` +
    `2. Rebase feat-${featureName} onto origin/<default-branch>: git rebase origin/<default-branch>.\n` +
    `   If the rebase conflicts, abort it (git rebase --abort) and report the conflict.\n` +
    `3. If the rebase succeeded, force-push the rebased branch: git push --force-with-lease origin feat-${featureName}.\n` +
    `Do NOT open a pull request. End your final message with exactly one trailer line:\n` +
    `REBASE_STATUS: clean     — rebase succeeded (or branch already current) and was pushed\n` +
    `REBASE_STATUS: conflict  — rebase produced conflicts; aborted, branch left unchanged`
  );
}

/**
 * Query the current GitHub Actions check status for a PR directly via the `gh`
 * CLI — no agent needed for a mechanical status read. Uses the same
 * execSync-with-injectable-execFn pattern as mergeWorktree.
 *
 * Maps `gh pr view <url> --json statusCheckRollup` to exactly one of:
 *   "none"    — the rollup array is empty/absent (no checks registered yet)
 *   "pending" — at least one check has not completed yet
 *   "passed"  — all completed and every conclusion is a success (SUCCESS/NEUTRAL/SKIPPED)
 *   "failed"  — at least one completed check has a failure/error conclusion
 *   "unknown" — exec threw or the JSON was unparseable
 *
 * @param {string} prUrl
 * @param {{ execFn?: function }} [opts] - injection point for tests (override execSync)
 * @returns {Promise<"none" | "pending" | "passed" | "failed" | "unknown">}
 */
export async function checkPrCi(prUrl, { execFn } = {}) {
  const { execSync: realExecSync } = await import("child_process");
  const exec = execFn ?? ((cmd, opts) => realExecSync(cmd, opts));

  let raw;
  try {
    raw = exec(`gh pr view ${prUrl} --json statusCheckRollup`, {
      stdio: "pipe",
      encoding: "utf8",
    });
  } catch {
    return "unknown";
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return "unknown";
  }

  const rollup = parsed && parsed.statusCheckRollup;
  if (!Array.isArray(rollup) || rollup.length === 0) {
    return "none";
  }

  let anyPending = false;
  let anyFailure = false;
  let allSuccess = true;
  for (const check of rollup) {
    const state = classifyCheckRollupEntry(check);
    if (state === "pending") anyPending = true;
    if (state === "failure") anyFailure = true;
    if (state !== "success") allSuccess = false;
  }

  if (anyPending) return "pending";
  if (anyFailure) return "failed";
  if (allSuccess) return "passed";
  return "unknown";
}

/**
 * Classify a single statusCheckRollup entry (CheckRun or StatusContext).
 * @param {object} check
 * @returns {"pending" | "success" | "failure" | "other"}
 */
function classifyCheckRollupEntry(check) {
  const SUCCESS = new Set(["SUCCESS", "NEUTRAL", "SKIPPED"]);
  const FAILURE = new Set([
    "FAILURE",
    "ERROR",
    "CANCELLED",
    "TIMED_OUT",
    "ACTION_REQUIRED",
    "STARTUP_FAILURE",
  ]);

  if (check && typeof check.status === "string") {
    // CheckRun: status is QUEUED/IN_PROGRESS/COMPLETED, conclusion is set once done.
    if (check.status.toUpperCase() !== "COMPLETED") return "pending";
    const conclusion = (check.conclusion || "").toUpperCase();
    if (FAILURE.has(conclusion)) return "failure";
    if (SUCCESS.has(conclusion)) return "success";
    return "other";
  }

  if (check && typeof check.state === "string") {
    // StatusContext: legacy commit-status API.
    const st = check.state.toUpperCase();
    if (st === "PENDING" || st === "EXPECTED") return "pending";
    if (st === "SUCCESS") return "success";
    if (st === "FAILURE" || st === "ERROR") return "failure";
    return "other";
  }

  return "other";
}

/**
 * Extract the PR URL from a ship-pr create result's trailer.
 * @param {string | null | undefined} result
 * @returns {string | null}  the URL, or null if absent / "none"
 */
export function parsePrUrl(result) {
  if (result == null || (typeof result === "string" && result.trim() === "")) {
    return null;
  }
  const lines = result.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith("PR_URL: ")) {
      const value = trimmed.slice("PR_URL: ".length).trim();
      if (value === "" || value.toLowerCase() === "none") return null;
      return value;
    }
  }
  return null;
}

/**
 * Extract the REBASE_STATUS from a ship-pr rebase result's trailer (Phase DOD step 0).
 * @param {string | null | undefined} result
 * @returns {"clean" | "conflict" | "unknown"}
 */
export function parseRebaseStatus(result) {
  const VALID = ["clean", "conflict"];
  if (result == null || (typeof result === "string" && result.trim() === "")) {
    return "unknown";
  }
  const lines = result.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith("REBASE_STATUS: ")) {
      const token = trimmed
        .slice("REBASE_STATUS: ".length)
        .trim()
        .toLowerCase()
        .split(/\s/)[0];
      return VALID.includes(token) ? token : "unknown";
    }
  }
  return "unknown";
}

// ─── DOD-03: parseDodStatus ──────────────────────────────────────────────────

/**
 * Extract DOD_STATUS from a dod-verify agent result string.
 * @param {string | null | undefined} result - Raw agent result
 * @returns {{ status: "passed" | "failed" | "unknown", stubs: number, mock_data: number, unwired_integrations: number, coverage_below_threshold: boolean, branch_coverage_pct: number, req_gaps: number, boundary_gaps: number }}
 */
export function parseDodStatus(result) {
  const fallback = {
    status: "unknown",
    stubs: 0,
    mock_data: 0,
    unwired_integrations: 0,
    coverage_below_threshold: false,
    branch_coverage_pct: 0,
    req_gaps: 0,
    boundary_gaps: 0,
  };

  if (result == null || (typeof result === "string" && result.trim() === "")) {
    return fallback;
  }

  const lines = result.split("\n");

  let statusLine = null;
  let statusLineIndex = -1;

  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith("DOD_STATUS: ")) {
      statusLine = trimmed;
      statusLineIndex = i;
      break;
    }
  }

  if (statusLine === null) {
    return fallback;
  }

  const rawStatus = statusLine.slice("DOD_STATUS: ".length).trim().toLowerCase();

  if (rawStatus === "passed") {
    return {
      status: "passed",
      stubs: 0,
      mock_data: 0,
      unwired_integrations: 0,
      coverage_below_threshold: false,
      branch_coverage_pct: 100,
      req_gaps: 0,
      boundary_gaps: 0,
    };
  }

  if (rawStatus !== "failed") {
    return fallback;
  }

  // Find next non-empty line after the DOD_STATUS line
  let nextNonEmpty = null;
  for (let j = statusLineIndex + 1; j < lines.length; j++) {
    if (lines[j].trim() !== "") {
      nextNonEmpty = lines[j].trim();
      break;
    }
  }

  const failedZeros = {
    status: "failed",
    stubs: 0,
    mock_data: 0,
    unwired_integrations: 0,
    coverage_below_threshold: false,
    branch_coverage_pct: 0,
    req_gaps: 0,
    boundary_gaps: 0,
  };

  if (nextNonEmpty === null) {
    return failedZeros;
  }

  let parsed = null;
  try {
    parsed = JSON.parse(nextNonEmpty);
  } catch {
    return failedZeros;
  }

  return {
    status: "failed",
    stubs: Number.isInteger(parsed.stubs) && parsed.stubs >= 0 ? parsed.stubs : 0,
    mock_data: Number.isInteger(parsed.mock_data) && parsed.mock_data >= 0 ? parsed.mock_data : 0,
    unwired_integrations: Number.isInteger(parsed.unwired_integrations) && parsed.unwired_integrations >= 0 ? parsed.unwired_integrations : 0,
    coverage_below_threshold: parsed.coverage_below_threshold === true,
    branch_coverage_pct: typeof parsed.branch_coverage_pct === "number" && parsed.branch_coverage_pct >= 0 ? parsed.branch_coverage_pct : 0,
    req_gaps: Number.isInteger(parsed.req_gaps) && parsed.req_gaps >= 0 ? parsed.req_gaps : 0,
    boundary_gaps: Number.isInteger(parsed.boundary_gaps) && parsed.boundary_gaps >= 0 ? parsed.boundary_gaps : 0,
  };
}

// ─── DOD-04: dodVerifyLoop ───────────────────────────────────────────────────

function dodVerifyPrompt(featureName, version) {
  // Round ≥2 is a delta re-verify after remediation — verify each prior finding is
  // fixed and scan only the remediation diff, instead of re-running the full scan.
  if (version >= 2) {
    return dodReVerifyPrompt(featureName, version);
  }
  return (
    `Challenge the Definition of Done for feature ${featureName} (review version v${version}). ` +
    `Assume incomplete until the evidence proves otherwise.\n` +
    `\n` +
    `Step 1 — Read the specs first (before touching any code):\n` +
    `  docs/${featureName}/REQ-${featureName}.md — acceptance criteria and success conditions\n` +
    `  docs/${featureName}/FSPEC-${featureName}.md — functional requirements, user flows, error cases\n` +
    `  docs/${featureName}/PROPERTIES-${featureName}.md — testable system properties\n` +
    `Build a checklist of every acceptance criterion, requirement, error case, and property.\n` +
    `\n` +
    `Step 2 — Scan production code (non-test files changed by this feature via git diff --name-only) for:\n` +
    `1. Stubs, TODOs, placeholders, NotImplementedError in production code (read function bodies, not signatures)\n` +
    `2. Unwired integrations — unused imports, dead config, placeholder URLs (trace request-to-response paths)\n` +
    `3. Mock/fake data in production code — hardcoded test data, mock variables outside test files\n` +
    `4. Branch coverage ≥85% for all new modules with property-based tests for parameterisable components\n` +
    `5. Requirements delivered — for each checklist item: trace it to a production code path AND a test that ` +
    `would fail if the implementation broke. Trace to the FINAL operator-visible artifact (after any ` +
    `entry-point re-render/overwrite), not the node/builder output; enumerate all writers of the traced ` +
    `output (grep the filename/key) and confirm no later writer clobbers the AC value without a test pinning ` +
    `the final artifact. Missing either one is a gap (req_gaps count). ` +
    `An assertion-free test does not count. A stub-backed test does not count.\n` +
    `6. Integration-boundary integrity (boundary_gaps count) — two checks:\n` +
    `   (a) Adjacent-surface falsification: does the diff make any existing artifact, disclosure string, ` +
    `comment, config default, or doc claim FALSE? For every output file the feature writes, grep for other ` +
    `writers of the same file/key and check for a later overwrite. When the feature touches one member of a ` +
    `same-shape family (one tools/get_* among several, one writer of a multi-writer artifact), enumerate the ` +
    `family and require each sibling covered or explicitly out-of-scope in the REQ.\n` +
    `   (b) Deferral binding: every deferral this feature introduces or leaves in place must name a successor ` +
    `that exists as a queue row (docs/_queue/QUEUE.md) or a named successor REQ file in docs/. A runbook step, ` +
    `operator config, or bare prose mention is NOT a successor.\n` +
    `\n` +
    `Document every finding (all six criteria) with a Scope tag (Local | Cross-Feature | Process) in ` +
    `docs/${featureName}/CODE_REVIEW-${featureName}-v${version}.md — include a §2 Requirements Traceability ` +
    `table listing every criterion with implementation path, test path, and Gap? column. ` +
    `Commit and push the review file. Do NOT fix anything — you are the evaluator, not the optimizer.\n` +
    `End with the DOD_STATUS trailer including req_gaps and boundary_gaps in the JSON.`
  );
}

/**
 * Round ≥2 (v2, v3…) delta re-verify prompt. After remediation, the previous
 * round's CODE_REVIEW findings and the remediation diff are the only things worth
 * re-reading — the rest of the tree was already verified. The evidence bar and the
 * DOD_STATUS trailer contract are unchanged from v1.
 */
function dodReVerifyPrompt(featureName, version) {
  const prev = version - 1;
  return (
    `This is re-verification round v${version} after remediation for feature ${featureName}. ` +
    `Assume incomplete until the evidence proves otherwise.\n` +
    `\n` +
    `Step 1 — Read docs/${featureName}/CODE_REVIEW-${featureName}-v${prev}.md. For EACH finding in it, ` +
    `verify remediation: trace the fix to a production code path AND a test that would fail if the fix broke. ` +
    `An assertion-free or stub-backed test does not count as remediation.\n` +
    `\n` +
    `Step 2 — Run \`git diff\` covering the remediation commits since v${prev} and scan ONLY that diff for new ` +
    `stubs, mock data, unwired integrations, integration-boundary gaps (adjacent surfaces the fixes silently ` +
    `falsify), or regressions introduced by the fixes. Do NOT re-scan unchanged ` +
    `code you already verified in the previous round.\n` +
    `\n` +
    `Carry the §2 Requirements Traceability table forward from v${prev}, updating only the rows affected by the ` +
    `remediation (update the Gap? column). Document the result in ` +
    `docs/${featureName}/CODE_REVIEW-${featureName}-v${version}.md with Scope tags (Local | Cross-Feature | Process) ` +
    `as before. Commit and push the review file. Do NOT fix anything — you are the evaluator, not the optimizer.\n` +
    `DOD_STATUS: passed only when every prior finding is verified remediated AND the remediation diff is clean. ` +
    `End with the DOD_STATUS trailer including req_gaps and boundary_gaps in the JSON.`
  );
}

// ─── DOD remediation routing: a finding goes to the skill that OWNS its target ─
//
// Phase DOD used to dispatch `se-implement` for EVERY CODE_REVIEW finding,
// whatever the finding was about. That is a routing bug with a code-shaped
// remedy attached to it: `se-implement` is a TDD implementation skill, so a
// finding whose whole content is "FSPEC §3.3 describes a consumed pair that
// stopped existing two commits ago" arrives at an agent whose instructions are
// "write the failing test first, then the minimum production code". The only
// ways out of that prompt are to improvise a document edit outside the skill's
// remit, or to do nothing. Observed 2026-08-11 on pdlc-consolidation-agent:
// CODE_REVIEW v6's sole finding (L1) was a documentation erratum whose Required
// fix cell literally began `ERRATUM: FSPEC:`, and the loop dispatched
// `se-implement` anyway.
//
// A document defect belongs to that document's AUTHOR. The routing below reads
// the same two facts the rest of the module already agrees on — `ERRATUM_DOC_TYPES`
// for the vocabulary, `PHASE_DISPATCH` (through `ERRATUM_PHASE_BY_DOC_TYPE`) for
// who may write each document — so there is no second copy of "who owns FSPEC".
//
// The classification is FAIL-SAFE TOWARD TODAY'S BEHAVIOUR. Anything not proven
// to target a spec document is a code finding, an unreadable or table-free
// CODE_REVIEW yields no doc findings at all, and a review with no doc findings
// produces the byte-identical `se-implement` dispatch it produced before this
// existed.

/**
 * The findings-table header, exact-cell (same discipline as `parsePlanTasks`'s
 * `PLAN_ID_HEADER_CELLS`: a header cell qualifies in full, never as a substring).
 * The shipped grammar is dod-verify SKILL.md §1's
 * `| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |`;
 * the alternates are the spellings the v1–v6 corpus and its neighbours actually
 * use. Requiring BOTH a File:Line column and a Required-fix column is what keeps
 * §2's traceability table (`# | Source | … | Gap? | …`) and the per-round
 * disposition tables out of the parse.
 */
const DOD_FINDING_FILE_HEADER_CELLS = new Set([
  "file:line",
  "file line",
  "file/line",
  "file:lines",
  "location",
]);
const DOD_FINDING_FIX_HEADER_CELLS = new Set([
  "required fix",
  "required-fix",
  "required_fix",
  "fix",
  "remediation",
]);
const DOD_FINDING_ID_HEADER_CELLS = new Set(["#", "id", "no", "no.", "finding"]);

/**
 * The erratum marker as it appears INSIDE a Required-fix cell. Deliberately the
 * same vocabulary as `parseErrata`'s line grammar (`ERRATUM_DOC_TYPES`) rather
 * than a second list: a reviewer who writes `ERRATUM: FSPEC:` in a table cell
 * and one who writes it on its own line mean the same thing.
 *
 * Not anchored to start-of-line, because a cell reads
 * "`ERRATUM: FSPEC:` — re-anchor §3.3 to v2.8". Note what does NOT match:
 * "raise it as an **ERRATUM** against REQ AC-6.1" (v5's K1) carries no
 * `{DOCTYPE}:`, so it stays a code finding — which is correct, K1's remedy was
 * a code change.
 */
const DOD_ERRATUM_CELL_RE = new RegExp(
  `ERRATUM:\\s*(${ERRATUM_DOC_TYPES.join("|")})\\s*:`
);

/** Every file-path-shaped token in a table cell, backticks and emphasis stripped. */
function dodFindingPathTokens(cell) {
  const plain = String(cell ?? "").replace(/[`*_]/g, " ");
  return plain.match(/[A-Za-z0-9_@][A-Za-z0-9_@./-]*\.[A-Za-z0-9]+/g) ?? [];
}

/**
 * The doc type a File:Line token names, or `null` when it names anything else.
 *
 * A spec document is `docs/{feature}/{DOCTYPE}-{feature}.md` with `{DOCTYPE}` in
 * the erratum vocabulary. When `feature` is supplied both segments must equal it,
 * so a finding citing ANOTHER feature's FSPEC is not routed to this feature's
 * author.
 */
function dodDocTypeForPath(token, feature) {
  const m = /^docs\/([^/]+)\/([A-Za-z]+)-(.+)\.md$/.exec(String(token ?? ""));
  if (!m) return null;
  const [, dirSeg, docType, nameSeg] = m;
  if (!ERRATUM_DOC_TYPES.includes(docType)) return null;
  if (dirSeg !== nameSeg) return null;
  if (feature && dirSeg !== feature) return null;
  return docType;
}

/**
 * The document one finding targets, or `null` for a code finding.
 *
 * Two signals, in priority order:
 *
 *  1. The Required-fix cell carries `ERRATUM: {DOCTYPE}:`. This is the reviewer
 *     stating the routing explicitly, so it wins outright.
 *  2. Otherwise the File:Line cell must name at least one path and EVERY path it
 *     names must be the SAME spec document. A cell mixing a spec path with a code
 *     path is a code finding: the code half needs `se-implement`, and a finding
 *     dispatched to both skills would have two agents editing on one round.
 */
function dodFindingDocType(finding, feature) {
  const marker = DOD_ERRATUM_CELL_RE.exec(finding.requiredFix ?? "");
  if (marker) return marker[1];

  const tokens = dodFindingPathTokens(finding.fileLine);
  if (tokens.length === 0) return null;
  let docType = null;
  for (const token of tokens) {
    const t = dodDocTypeForPath(token, feature);
    if (t === null) return null;
    if (docType !== null && t !== docType) return null;
    docType = t;
  }
  return docType;
}

/**
 * Classify a CODE_REVIEW's findings by the artifact they target.
 *
 * Pure, synchronous, total; takes no seam. Fenced regions are skipped
 * (`scanLines`), so a CODE_REVIEW that QUOTES the findings-table template — as
 * dod-verify's own SKILL.md does — cannot fabricate a finding.
 *
 * @param {string | null | undefined} codeReviewText
 * @param {string} [feature] - scopes the `docs/{feature}/…` path rule
 * @returns {{docFindings: Map<string, Array<object>>, codeFindings: Array<object>}}
 *   `docFindings` is keyed by doc type and iterates in pipeline order
 *   (`ERRATUM_DOC_TYPES`), not in table order.
 */
export function classifyDodFindings(codeReviewText, feature) {
  const docFindings = new Map();
  const codeFindings = [];
  for (const finding of parseDodFindings(codeReviewText)) {
    const docType = dodFindingDocType(finding, feature);
    if (docType === null) {
      codeFindings.push(finding);
      continue;
    }
    if (!docFindings.has(docType)) docFindings.set(docType, []);
    docFindings.get(docType).push({ ...finding, docType });
  }
  // Pipeline order, so a wave that touches REQ and FSPEC fixes REQ first.
  const ordered = new Map();
  for (const docType of ERRATUM_DOC_TYPES) {
    if (docFindings.has(docType)) ordered.set(docType, docFindings.get(docType));
  }
  return { docFindings: ordered, codeFindings };
}

/**
 * Every row of every findings table in a CODE_REVIEW, in document order.
 *
 * Block-segmented exactly like `parsePlanTasks`: contiguous runs of pipe rows
 * are one table each, and a non-pipe line ends the run — so a non-qualifying
 * table contributes nothing and cannot swallow the rows after it.
 *
 * @returns {Array<{id: string, criterion: string, severity: string, fileLine: string, problem: string, requiredFix: string, scope: string}>}
 */
function parseDodFindings(codeReviewText) {
  const blocks = [];
  let block = null;
  scanLines(codeReviewText, (line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("|")) {
      if (!block) {
        block = [];
        blocks.push(block);
      }
      block.push(trimmed);
    } else {
      block = null;
    }
  });

  const findings = [];
  for (const rows of blocks) {
    const cols = splitPipeRow(rows[0]).map((c) => c.toLowerCase());
    const fileIdx = cols.findIndex((c) => DOD_FINDING_FILE_HEADER_CELLS.has(c));
    const fixIdx = cols.findIndex((c) => DOD_FINDING_FIX_HEADER_CELLS.has(c));
    if (fileIdx < 0 || fixIdx < 0) continue;

    const findCol = (pred) => {
      for (let i = 0; i < cols.length; i++) {
        if (i === fileIdx || i === fixIdx) continue;
        if (pred(cols[i])) return i;
      }
      return -1;
    };
    const idIdx = findCol((c) => DOD_FINDING_ID_HEADER_CELLS.has(c));
    const criterionIdx = findCol((c) => c === "criterion" || c === "criteria");
    const severityIdx = findCol((c) => c === "severity" || c === "sev");
    const problemIdx = findCol((c) => c === "problem" || c === "finding");
    const scopeIdx = findCol((c) => c === "scope");

    for (let i = 1; i < rows.length; i++) {
      const cells = splitPipeRow(rows[i]);
      // Skip the markdown separator row (|---|---|).
      if (cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "")) continue;
      const at = (idx) => (idx >= 0 ? (cells[idx] || "").trim() : "");
      const fileLine = at(fileIdx);
      const requiredFix = at(fixIdx);
      // A row with neither a target nor a remedy is a spacer, not a finding.
      if (fileLine === "" && requiredFix === "") continue;
      findings.push({
        id: at(idIdx).replace(/\*/g, "").trim(),
        criterion: at(criterionIdx),
        severity: at(severityIdx),
        fileLine,
        problem: at(problemIdx),
        requiredFix,
        scope: at(scopeIdx),
      });
    }
  }
  return findings;
}

/**
 * The skill that may WRITE one doc type — read out of `PHASE_DISPATCH` through
 * `ERRATUM_PHASE_BY_DOC_TYPE`, exactly as the erratum protocol's step 4b does
 * (`creator` where the phase has one, `optimizer` where it does not, because
 * Phase R's REQ arrives already authored and `pm-author` is its only writer).
 *
 * REQ/FSPEC ⇒ `pm-author`; TSPEC/DECISIONS/PLAN ⇒ `se-author`;
 * PROPERTIES ⇒ `te-author`. That table is not written down here on purpose:
 * it is derived, so a change to `PHASE_DISPATCH` moves this with it.
 */
function dodDocAuthorSkill(docType) {
  const phase = PHASE_DISPATCH[ERRATUM_PHASE_BY_DOC_TYPE[docType]];
  if (!phase) return null;
  return phase.creator ?? phase.optimizer ?? null;
}

/** One `- {id}: {problem} → {fix}` line per routed finding. */
function dodFindingLines(items) {
  return items
    .map((f) => {
      const head = f.id ? `${f.id}: ` : "";
      const problem = f.problem ? `${f.problem}. ` : "";
      const fix = f.requiredFix ? `Required fix: ${f.requiredFix}` : "";
      const cite = f.fileLine ? ` (cited at ${f.fileLine})` : "";
      return `- ${head}${problem}${fix}${cite}`.trim();
    })
    .join("\n");
}

/**
 * The dispatch for the DOCUMENT half of a DoD round: a targeted, versioned edit
 * to one spec document by that document's own author.
 *
 * Deliberately shaped like `erratumAuthorPrompt` rather than like
 * `dodRemediatePrompt` — same "targeted edit, not a rewrite, do not re-litigate
 * approved decisions" bar — because it is the same operation arriving through a
 * different door. The document's approvers are NOT re-run here: Phase DOD's own
 * gate is the next `dod-verify` round, which re-reads the document and either
 * closes the finding or re-files it.
 */
function dodDocRemediatePrompt({ feature, version, docType, docPath, items }) {
  return (
    `DOCUMENT REMEDIATION for ${docPath} (feature ${feature}).\n` +
    `The Definition of Done review docs/${feature}/CODE_REVIEW-${feature}-v${version}.md ` +
    `filed the following finding${items.length === 1 ? "" : "s"} against this ${docType}:\n` +
    `${dodFindingLines(items)}\n` +
    `Read the CODE_REVIEW entries in full for context, then apply a targeted, versioned edit to ` +
    `${docPath} that addresses exactly the items listed above and changes nothing else — do not ` +
    `restructure, do not re-litigate approved decisions, do not expand scope. Verify each claim ` +
    `against the code at HEAD rather than against the review's paraphrase of it. If the document ` +
    `carries a version or changelog, bump it and record this edit there.\n` +
    `Do NOT write production code and do NOT edit the CODE_REVIEW file. Commit and push the ` +
    `document edit.\n` +
    branchPinClause(feature)
  );
}

/**
 * @param {string} featureName
 * @param {number} version
 * @param {Array<object>} [routedDocFindings] - findings dispatched to a document
 *   author on this same round. When empty (the code-only case, and every case
 *   before this routing existed) the returned prompt is BYTE-IDENTICAL to the
 *   original — the exclusion clause is additive, never a rewrite of the base.
 */
function dodRemediatePrompt(featureName, version, routedDocFindings = []) {
  return (
    `Address every finding in the Definition of Done code review for feature ${featureName}.\n` +
    `1. Read docs/${featureName}/CODE_REVIEW-${featureName}-v${version}.md — the latest DoD review.\n` +
    `2. Fix every finding via strict TDD: write or update the failing test first, then the minimum production code. ` +
    `Derive correct behavior from the TSPEC/FSPEC/PROPERTIES (REQ for intent).\n` +
    `3. Run the full test suite with branch coverage. All tests must pass.\n` +
    `4. Commit and push the fixes. Do NOT edit the CODE_REVIEW file.\n` +
    branchPinClause(featureName) +
    dodRoutedAwayClause(routedDocFindings)
  );
}

/** The mixed-round exclusion: which findings someone ELSE is already fixing. */
function dodRoutedAwayClause(routedDocFindings) {
  if (!Array.isArray(routedDocFindings) || routedDocFindings.length === 0) return "";
  const rows = routedDocFindings
    .map((f) => `- ${f.id ? `${f.id} ` : ""}(${f.docType})`)
    .join("\n");
  return (
    `\nEXCLUDED from your scope — these findings target specification DOCUMENTS and have already ` +
    `been dispatched to each document's own author in parallel with you. Do not edit those ` +
    `documents and do not attempt to fix these findings:\n${rows}`
  );
}

/**
 * Phase DOD step 0: rebase the feature branch onto the latest default branch so the
 * DoD scan (and the subsequent PR) sees the real merge state. Delegated to ship-pr.
 *
 * @param {object} params
 * @param {string} params.feature
 * @param {function} [params._agent]
 * @param {function} [params._log]
 * @returns {Promise<"clean" | "conflict" | "unknown">}
 */
export async function rebaseOntoDefault({ feature, _agent = agent, _log = log }) {
  _log(`Rebasing feat-${feature} onto the latest default branch`);
  const result = await _agent("ship-pr", rebasePrompt(feature));
  return parseRebaseStatus(result);
}

/**
 * Phase DOD: verify the Definition of Done, then dispatch remediation, then re-verify.
 * dod-verify is the evaluator — it documents findings in a versioned CODE_REVIEW file
 * but does not fix them. se-implement is the optimizer — it addresses the findings via
 * TDD. The loop alternates verify → remediate → verify, capped at DOD_MAX_ITERATIONS.
 *
 * @param {object} params
 * @param {string} params.feature
 * @param {number} [params.maxIterations]
 * @param {function} [params._agent]
 * @param {function} [params._log]
 * @param {function} [params._readFile] - reads the round's CODE_REVIEW so the
 *   remediation dispatch can route by target (`classifyDodFindings`). A read
 *   that fails or returns nothing degrades to the pre-routing behaviour: one
 *   `se-implement` dispatch with the original prompt.
 * @returns {Promise<{ passed: boolean, iterations: number, lastStatus?: object }>}
 */
export async function dodVerifyLoop({
  feature,
  maxIterations = DOD_MAX_ITERATIONS,
  _agent = agent,
  _log = log,
  _readFile = defaultReadFile,
}) {
  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    _log(`DoD verification — iteration ${iteration}`);

    const verifyResult = await _agent(
      "dod-verify",
      dodVerifyPrompt(feature, iteration)
    );
    const status = parseDodStatus(verifyResult);

    if (status.status === "passed") {
      _log("DoD verification passed");
      return { passed: true, iterations: iteration };
    }

    if (status.status === "unknown") {
      _log("WARNING: dod-verify returned no DOD_STATUS — treating as failed");
    }

    _log(
      `DoD findings recorded in CODE_REVIEW-${feature}-v${iteration}: ` +
      `stubs=${status.stubs}, mock_data=${status.mock_data}, ` +
      `unwired=${status.unwired_integrations}, coverage_gap=${status.coverage_below_threshold} ` +
      `(branch_coverage=${status.branch_coverage_pct}%), req_gaps=${status.req_gaps}, ` +
      `boundary_gaps=${status.boundary_gaps}`
    );

    if (iteration === maxIterations) {
      return { passed: false, iterations: iteration, lastStatus: status };
    }

    // Dispatch remediation, ROUTED BY TARGET: findings against a specification
    // document go to that document's author, everything else to se-implement,
    // and the next iteration re-verifies both halves. The read is best-effort —
    // an unreadable CODE_REVIEW classifies as "no doc findings", which is the
    // pre-routing dispatch exactly.
    const codeReviewPath = `docs/${feature}/CODE_REVIEW-${feature}-v${iteration}.md`;
    let codeReviewText = "";
    try {
      const text = await _readFile(codeReviewPath);
      codeReviewText = typeof text === "string" ? text : "";
    } catch {
      codeReviewText = "";
    }
    const { docFindings, codeFindings } = classifyDodFindings(codeReviewText, feature);

    const routedDocFindings = [];
    for (const [docType, items] of docFindings) {
      const skill = dodDocAuthorSkill(docType);
      if (!skill) continue;
      routedDocFindings.push(...items);
      const docPath = `docs/${feature}/${docType}-${feature}.md`;
      _log(
        `Dispatching ${docType} document remediation to ${skill} for ` +
          `CODE_REVIEW-${feature}-v${iteration} (${items.length} finding${
            items.length === 1 ? "" : "s"
          })`
      );
      await withDispatchRetry(
        () =>
          _agent(
            skill,
            dodDocRemediatePrompt({ feature, version: iteration, docType, docPath, items })
          ),
        { label: `DOD ${docType} remediation, iteration ${iteration}`, emit: _log }
      );
    }

    // The code half. Skipped ONLY when every finding was routed to a document
    // author — with nothing left for it to fix, an `se-implement` dispatch is an
    // agent asked to write production code for a documentation erratum, which is
    // the defect this routing exists to remove. In every other case, including a
    // CODE_REVIEW this parse could not read, se-implement runs as it always has.
    if (routedDocFindings.length === 0 || codeFindings.length > 0) {
      _log(`Dispatching remediation for CODE_REVIEW-${feature}-v${iteration}`);
      await withDispatchRetry(
        () => _agent("se-implement", dodRemediatePrompt(feature, iteration, routedDocFindings)),
        { label: `DOD remediation, iteration ${iteration}`, emit: _log }
      );
    }
  }

  // Should not reach here, but guard
  return { passed: false, iterations: maxIterations };
}

/**
 * Phase PUB: raise (or reuse) the PR for the feature branch, then poll GHA checks
 * until they pass, fail, or the no-checks window expires. The poll-timing logic
 * lives here (in the script), not in the agent — the agent only reports the
 * current state. Returns the PR URL and the resolved CI status.
 *
 * @param {object} params
 * @param {string} params.feature
 * @param {function} [params._agent]
 * @param {function} [params._checkCi] - (prUrl) => Promise<ci status>; injectable for tests
 * @param {function} [params._log]
 * @param {function} [params._now]   - clock (ms); injectable for tests
 * @param {function} [params._sleep] - async sleep(ms); injectable for tests
 * @param {number} [params.noChecksTimeoutMs]
 * @param {number} [params.pollIntervalMs]
 * @param {number} [params.completionTimeoutMs]
 * @param {function} [params._runAdvisorySeam] - TSPEC §8.1 (PLAN A-26). Fires only on the
 *   `status === "failed"` branch; defaults to `escalated` so every pre-existing caller/test of
 *   this function is unaffected (PROP-A5-19) — `escalated` is the only outcome that falls
 *   through to the byte-identical halt. A `no-action` default would NOT be a no-op: `no-action`
 *   is loop-safe only when a real seam has just re-observed the rollup green, which a stub has
 *   not, so a persistently red CI would re-poll forever instead of halting.
 * @param {function} [params._advisoryRecord] - the step-7 record sink for the A5 disposition;
 *   defaults to a no-op.
 * @returns {Promise<{ prUrl: string, ciStatus: "passed" | "no-checks", noChecks?: boolean }>}
 */
export async function raisePrAndVerifyCi({
  feature,
  _agent = agent,
  _checkCi = checkPrCi,
  _log = log,
  _now = () => Date.now(),
  _sleep = sleep,
  noChecksTimeoutMs = CI_NO_CHECKS_TIMEOUT_MS,
  pollIntervalMs = CI_POLL_INTERVAL_MS,
  completionTimeoutMs = CI_COMPLETION_TIMEOUT_MS,
  _runAdvisorySeam = async () => ({ outcome: "escalated" }),
  _advisoryRecord = () => {},
}) {
  // 1. Create (or reuse) the PR. The branch was already rebased onto the latest
  //    default branch in Phase DOD, so ship-pr does not rebase here.
  const prResult = await _agent("ship-pr", createPrPrompt(feature));

  const prUrl = parsePrUrl(prResult);
  if (!prUrl) {
    throw haltError(
      `Error: Phase PUB — PR creation failed for feature ${feature} (no PR_URL returned)`
    );
  }
  _log(`PR raised: ${prUrl}`);

  // 2. Poll GHA checks directly via `gh`. The script owns the cadence and the
  //    timeouts; the poll itself is a mechanical status read, not an agent turn.
  const start = _now();
  let completionStart = null;
  while (true) {
    const status = await _checkCi(prUrl);

    if (status === "passed") {
      _log(`GHA checks passed for PR ${prUrl}`);
      return { prUrl, ciStatus: "passed", noChecks: false };
    }
    if (status === "failed") {
      // TSPEC §8.1 (PLAN A-26) — the seam fires on exactly this branch, nowhere
      // else. A `resolved` outcome re-polls in place (the seam's own verifyGate
      // already observed green); anything else falls through to the byte-identical
      // halt below.
      const a5 = await _runAdvisorySeam({ seam: "A5", feature, prUrl });
      _advisoryRecord(a5);
      // §8.5 — "CI turns green mid-diagnosis" also re-polls rather than halting: the seam's own
      // `conditionHolds` re-read already found the rollup green, so `no-action` carries the same
      // "the re-poll already returned green" fact `resolved` does. Only `escalated` — no permitted
      // action matched, or the seam ran out of budget — reaches the byte-identical halt below.
      // `model` is only ever set once a dispatch actually ran (see `runAdvisorySeam`), so it also
      // distinguishes that genuine re-check from a seam that never dispatched at all (e.g. an
      // inert tier) — the latter must fall through to the halt rather than spin forever.
      if (a5 && a5.outcome !== "escalated" && a5.model !== undefined) {
        continue;
      }
      throw haltError(`Error: Phase PUB — GHA checks failed for PR ${prUrl}`);
    }
    if (status === "pending" && completionStart === null) {
      // First time checks register — start the completion budget from here so
      // slow-registering checks get a full window regardless of registration latency.
      completionStart = _now();
    }

    if (completionStart !== null) {
      // Checks are registered and running — wait for completion up to the overall
      // cap, measured from when checks first appeared (not from PR-raise).
      if (_now() - completionStart >= completionTimeoutMs) {
        // A5-9: no failing check to diagnose, so the seam never fires here; the
        // halt carries `completionCap` so the caller can name the outcome (S-3).
        throw haltError(
          `Error: Phase PUB — GHA checks did not complete within ` +
            `${Math.round(completionTimeoutMs / 60000)} minutes for PR ${prUrl}`,
          { completionCap: true }
        );
      }
    } else if (_now() - start >= noChecksTimeoutMs) {
      // No checks ever appeared (status none/unknown) within the window —
      // assume the repo has no PR checks configured and treat the phase as a pass.
      // A5-6: the seam never fires here either; `noChecks` names the outcome (S-3).
      _log(
        `No GHA checks detected within ${Math.round(
          noChecksTimeoutMs / 60000
        )} minutes — assuming repo has no PR checks configured`
      );
      return { prUrl, ciStatus: "no-checks", noChecks: true };
    }

    await _sleep(pollIntervalMs);
  }
}

// ─── TSPEC-IMPL-06: Per-batch test gate helpers ───────────────────────────────

/**
 * Evaluates whether a batch of se-implement agents all passed their tests.
 * @param {Array<string|null>} results - Array of agent results
 * @param {number} batchIndex - Zero-based batch index
 * @param {Array<{id: string}>} batch - Array of task objects
 * @throws {Error} halt error if any test failed
 */
export function evaluateBatchGate(results, batchIndex, batch) {
  const batchNum = batchIndex + 1;
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const task = batch[i];

    // Rule 1: empty-result check
    if (result == null || (typeof result === "string" && result.trim() === "")) {
      throw haltError(
        `Error: Batch ${batchNum} agent returned empty result — treating as failure`
      );
    }

    // Rule 2: failure marker scan
    if (/Tests: \d+ failed/.test(result)) {
      const match = result.match(/Tests: (\d+) failed/);
      const count = match ? match[1] : "?";
      throw haltError(
        `Error: Batch ${batchNum} task ${task.id} failed — Tests: ${count} failed`
      );
    }

    if (result.toLowerCase().includes("non-zero exit")) {
      throw haltError(
        `Error: Batch ${batchNum} task ${task.id} failed — non-zero exit detected`
      );
    }
  }

  log(`Batch ${batchNum} complete — all tests passing`);
}

/**
 * The subset of `evaluateBatchGate` that survives M-6: rules 1 and 3 ONLY.
 *
 * Rule 2 — the `Tests: N failed` scan of an agent's own prose — is deliberately
 * absent. In wave mode the orchestrator runs the suite itself, so an agent's
 * self-report is no longer load-bearing evidence about the tree; a wave member
 * that MENTIONS a failing test it then fixed must not halt the pipeline. What
 * still halts here is evidence about the DISPATCH rather than about the tests:
 * an agent that returned nothing (rule 1 — the runtime killed it) and one that
 * reports a non-zero exit (rule 3 — its own tooling refused).
 *
 * @param {Array<string|null>} results
 * @param {number} waveIndex - zero-based
 * @param {Array<{id: string}>} wave
 * @throws {Error} halt error naming the wave and the task
 */
export function evaluateWaveDispatch(results, waveIndex, wave) {
  const waveNum = waveIndex + 1;
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const task = wave[i] || { id: "(unknown)" };

    if (result == null || (typeof result === "string" && result.trim() === "")) {
      throw haltError(
        `Error: Wave ${waveNum} agent returned empty result — treating as failure`
      );
    }

    if (String(result).toLowerCase().includes("non-zero exit")) {
      throw haltError(
        `Error: Wave ${waveNum} task ${task.id} failed — non-zero exit detected`
      );
    }
  }
}

/** The last `n` lines of a command's output, for a halt message. */
function outputTail(output, n = 30) {
  const text = String(output == null ? "" : output).replace(/\s+$/, "");
  if (text === "") return "(no output)";
  return text.split("\n").slice(-n).join("\n");
}

/**
 * Evaluates whether a single-agent phase passed its tests.
 * @param {string|null} agentResult - The agent result string
 * @param {string} phaseName - Phase name for error messages (e.g. "PT")
 * @returns {{ passed: boolean, reason?: string }}
 */
export function evaluateSingleAgentGate(agentResult, phaseName) {
  // Rule 1: empty-result check
  if (
    agentResult == null ||
    (typeof agentResult === "string" && agentResult.trim() === "")
  ) {
    return {
      passed: false,
      reason: `Error: Phase ${phaseName} agent returned empty result — treating as failure`,
    };
  }

  // Rule 2: failure marker scan
  if (/Tests: \d+ failed/.test(agentResult)) {
    const match = agentResult.match(/Tests: (\d+) failed/);
    const count = match ? match[1] : "?";
    return {
      passed: false,
      reason: `Error: Phase ${phaseName} failed — Tests: ${count} failed`,
    };
  }

  if (agentResult.toLowerCase().includes("non-zero exit")) {
    return {
      passed: false,
      reason: `Error: Phase ${phaseName} failed — non-zero exit detected`,
    };
  }

  return { passed: true };
}

// ─── Topological batching ─────────────────────────────────────────────────────

/**
 * Compute topological batches from task array (TSPEC-IMPL-02).
 * @param {Array<{id: string, dependencies: string[], planBatch: number}>} tasks
 * @returns {Array<Array<{id: string, dependencies: string[], planBatch: number}>>}
 */
export function computeTopologicalBatches(tasks) {
  const batches = [];
  for (const ready of topologicalReadySets(tasks)) {
    // Split into sub-batches of at most 5
    for (let i = 0; i < ready.length; i += 5) {
      batches.push(ready.slice(i, i + 5));
    }
  }
  return batches;
}

/**
 * The topological layers of the task DAG, in document order, BEFORE any size cap
 * and before any ownership partitioning.
 *
 * Lifted out of `computeTopologicalBatches` so `computeWaves` shares one graph
 * traversal rather than a hand-copied second one — the cycle halt, the batch-label
 * warning and the document-order sort must be identical in both, and the only way
 * to guarantee that is for there to be one of each.
 *
 * @param {Array<{id: string, dependencies: string[], planBatch: number}>} tasks
 * @returns {Array<Array<object>>} one array per topological layer
 */
/**
 * Find one concrete cycle among tasks that are stuck (never became ready) so
 * the halt message can name it instead of just asserting "a cycle exists".
 * DFS over the stuck set's dependency edges only — edges into completed tasks
 * are satisfied and irrelevant to why these are stuck. Returns the task ids
 * in traversal order, e.g. ["A1", "B1", "C1", "A1"] for A1->B1->C1->A1. If no
 * cycle is found among the stuck edges (e.g. a dependency names an id that
 * exists nowhere in the PLAN at all, so no edge — and thus no cycle — can be
 * walked), falls back to listing every stuck task id so the message still
 * names something concrete.
 */
function findCyclePath(stuckTasks) {
  const byId = new Map(stuckTasks.map((t) => [t.id, t]));
  const onStack = new Set();
  const visited = new Set();
  const path = [];

  const dfs = (id) => {
    if (onStack.has(id)) return [...path.slice(path.indexOf(id)), id];
    if (visited.has(id) || !byId.has(id)) return null;
    onStack.add(id);
    path.push(id);
    for (const dep of byId.get(id).dependencies) {
      const found = dfs(dep);
      if (found) return found;
    }
    onStack.delete(id);
    path.pop();
    visited.add(id);
    return null;
  };

  for (const t of stuckTasks) {
    const found = dfs(t.id);
    if (found) return found;
  }
  return stuckTasks.map((t) => t.id);
}

function topologicalReadySets(tasks) {
  const completed = new Set();
  const layers = [];
  let maxCompletedBatch = -1;

  while (completed.size < tasks.length) {
    const ready = tasks.filter(
      (t) =>
        !completed.has(t.id) && t.dependencies.every((d) => completed.has(d))
    );

    if (ready.length === 0 && completed.size < tasks.length) {
      const stuck = tasks.filter((t) => !completed.has(t.id));
      const cyclePath = findCyclePath(stuck);
      throw haltError(
        "Error: PLAN dependency graph contains a cycle — cannot compute topological batches " +
          `(cycle: ${cyclePath.join(" -> ")})`
      );
    }

    if (ready.length === 0) break;

    // Detect PLAN batch label inconsistency
    const inconsistent = ready.some(
      (t) => t.planBatch !== undefined && t.planBatch <= maxCompletedBatch
    );
    if (inconsistent) {
      log(
        "WARNING: PLAN batch labels inconsistent with dependency edges — re-deriving topological batches"
      );
    }

    // Sort by original array index (document order)
    ready.sort(
      (a, b) =>
        tasks.findIndex((t) => t.id === a.id) -
        tasks.findIndex((t) => t.id === b.id)
    );

    layers.push(ready);

    for (const t of ready) {
      completed.add(t.id);
      if (t.planBatch !== undefined && t.planBatch > maxCompletedBatch) {
        maxCompletedBatch = t.planBatch;
      }
    }
  }

  return layers;
}

/**
 * Derive implementation WAVES: topological order ∩ ownership disjointness
 * (PROPOSAL §3.3, M-5).
 *
 * The manual pdlc-merge-phase run executed 12 waves in ONE tree with zero merge
 * conflicts, because no two tasks in a wave touched the same file. This function
 * makes that protocol mechanical: within each topological layer, tasks are walked
 * in document order and packed greedily into maximal groups whose members' owned
 * file sets are pairwise disjoint; a task whose files collide with the group being
 * built opens the next group. The existing ≤5 size cap is then applied INSIDE each
 * group, so a wave is never both larger than five and never internally colliding.
 *
 * Every returned task is a shallow copy carrying its owned `files`. A task with no
 * manifest row gets `files: null` — that is the worktree exception path, and it is
 * only reachable when the manifest is absent or the contract check was skipped.
 *
 * When `ownership` is null the result is exactly `computeTopologicalBatches`'
 * shape with `files: null` on every task, so callers that predate the manifest
 * keep their behaviour unchanged.
 *
 * @param {Array<{id: string, dependencies: string[], planBatch: number}>} tasks
 * @param {Array<{taskId: string, files: string[]}> | null} ownership
 * @returns {Array<Array<object>>} waves, each task annotated with `files`
 */
export function computeWaves(tasks, ownership) {
  if (ownership == null) {
    return computeTopologicalBatches(tasks).map((batch) =>
      batch.map((t) => ({ ...t, files: null }))
    );
  }

  const filesById = new Map();
  for (const row of ownership) filesById.set(row.taskId, row.files || []);

  const waves = [];
  for (const ready of topologicalReadySets(tasks)) {
    const groups = [];
    let group = null;
    let groupFiles = [];

    for (const t of ready) {
      const files = filesById.has(t.id) ? filesById.get(t.id) : null;
      const owned = files || [];
      const collides =
        group !== null &&
        owned.some((f) => groupFiles.some((g) => pathsCollide(f, g)));

      if (group === null || collides) {
        group = [];
        groupFiles = [];
        groups.push(group);
      }
      group.push({ ...t, files });
      for (const f of owned) groupFiles.push(f);
    }

    // The ≤5 cap applies within each disjoint group.
    for (const g of groups) {
      for (let i = 0; i < g.length; i += 5) waves.push(g.slice(i, i + 5));
    }
  }

  return waves;
}

// ─── The un-skip guard: a wave may not go green on tests that never ran ──────
//
// PLAN discipline (pdlc-consolidation-agent §2): a 🔴 task authors its cases
// inside `describe.skip` blocks, one block per 🟢 owner and NAMED for that owner
// (`describe.skip("T25 — corpus and predicate", …)`); the owner's first
// obligation is to remove the `.skip` wrapper on its own block.
//
// Nothing enforced that. On the feature that discovered the hole, most green
// owners implemented the code and never un-skipped, so the wave gate passed on a
// suite whose relevant cases reported as *skipped* — a green that asserts
// nothing. This guard closes it, and its whole difficulty is the one distinction
// that must not be got wrong: a block owned by a task in a LATER wave is
// legitimately still skipped, and must never trip the guard.
//
// The decision rule, stated once:
//
//   For every test file owned (per the PLAN's file-ownership manifest) by a task
//   that is now COMPLETE — this wave's tasks plus every earlier wave's — read the
//   file and find each skip token in STATEMENT position. Attribute the token to
//   the task(s) it names in its title; if it names none, attribute it to the
//   task(s) that own the containing file. The token is a violation iff it has at
//   least one owner and EVERY owner is complete. An unattributable token, an
//   unreadable file and an absent manifest each degrade to a notice — the guard
//   reports what it could not check and never invents a failure.

/** Owned paths the guard reads: a test/spec module in any of the usual suffixes. */
export const UNSKIP_TEST_FILE_RE = /\.(test|spec)\.[cm]?[jt]sx?$/;

/**
 * Blank out everything in a JS source that is not code — line comments, block
 * comments, string and template literals, and regex literals — replacing each
 * masked character with a space and KEEPING every newline, so that offsets and
 * line numbers in the result are the offsets and line numbers of the original.
 *
 * This is what makes the token scan honest: `// describe.skip(` in a comment,
 * `"describe.skip("` in a fixture string and `/test\.skip\(/` in a matcher are
 * all invisible to it, without the guard having to parse JavaScript.
 *
 * The masking direction is deliberately safe. Masking can only ERASE candidate
 * tokens (a mis-masked region hides a real skip, which the next wave's scan or
 * the final wave's scan still catches); it cannot manufacture one, because no
 * mask ever writes a `describe`/`test`/`it` where the source had none.
 *
 * @param {string} source
 * @returns {string} same length as `source`, newlines preserved
 */
export function maskNonCode(source) {
  if (typeof source !== "string") return "";
  const n = source.length;
  const out = new Array(n);
  const blank = (i) => {
    out[i] = source[i] === "\n" ? "\n" : " ";
  };
  // The last non-whitespace CODE character emitted, used only to decide whether
  // a `/` opens a regex literal or is a division operator.
  let prev = "";
  let i = 0;

  while (i < n) {
    const c = source[i];
    const c2 = i + 1 < n ? source[i + 1] : "";

    if (c === "/" && c2 === "/") {
      while (i < n && source[i] !== "\n") blank(i++);
      continue;
    }
    if (c === "/" && c2 === "*") {
      blank(i++);
      blank(i++);
      while (i < n) {
        if (source[i] === "*" && source[i + 1] === "/") {
          blank(i++);
          blank(i++);
          break;
        }
        blank(i++);
      }
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      blank(i++);
      while (i < n) {
        const d = source[i];
        if (d === "\\") {
          blank(i++);
          if (i < n) blank(i++);
          continue;
        }
        blank(i++);
        if (d === c) break;
      }
      // A string is a value, so a `/` after it is division, not a regex.
      prev = '"';
      continue;
    }
    if (c === "/" && regexOpensAfter(prev)) {
      const end = regexLiteralEnd(source, i);
      if (end > i) {
        while (i < end) blank(i++);
        prev = "/";
        continue;
      }
    }

    out[i] = c;
    if (!/\s/.test(c)) prev = c;
    i++;
  }

  return out.join("");
}

/**
 * Can a `/` following this code character open a regex literal? True after an
 * operator or an opening bracket, false after a value (identifier, digit,
 * closing bracket, string), where `/` is division. The classic heuristic, and
 * wrong only in directions `maskNonCode` documents as safe.
 */
function regexOpensAfter(prev) {
  return prev === "" || "([{;,=:!&|?+-*%^~<>".includes(prev);
}

/**
 * Index one past a regex literal opening at `start`, or `-1` if what starts
 * there is not one. A literal never spans a line, and `/` inside a character
 * class does not close it.
 */
function regexLiteralEnd(source, start) {
  let i = start + 1;
  let inClass = false;
  while (i < source.length) {
    const c = source[i];
    if (c === "\n") return -1;
    if (c === "\\") {
      i += 2;
      continue;
    }
    if (c === "[") inClass = true;
    else if (c === "]") inClass = false;
    else if (c === "/" && !inClass) {
      i++;
      while (i < source.length && /[a-z]/.test(source[i])) i++;
      return i;
    }
    i++;
  }
  return -1;
}

/**
 * Every skip token in STATEMENT position in one JS source, with its 1-based
 * line and the title string it was called with.
 *
 * "Statement position" is two conditions, and both are needed:
 *   - nothing but whitespace precedes the token on its own line, and
 *   - the previous non-whitespace code character opens a new statement
 *     (start of file, `;`, `{`, `}` or `)`).
 *
 * That is exactly the shape a real skipped block has, and it excludes the
 * environment-gated form the suite uses legitimately — `(canRun ? test :
 * test.skip)(…)`, where the token sits after a `:` in the middle of a line.
 *
 * @param {string} source
 * @returns {Array<{line: number, token: string, title: string}>}
 */
export function scanSkipTokens(source) {
  if (typeof source !== "string" || source === "") return [];
  const masked = maskNonCode(source);
  const found = [];
  const re = /\b(describe|test|it)\.skip\s*\(/g;
  let m;
  while ((m = re.exec(masked)) !== null) {
    const start = m.index;

    let j = start - 1;
    while (j >= 0 && (masked[j] === " " || masked[j] === "\t")) j--;
    if (j >= 0 && masked[j] !== "\n") continue;

    while (j >= 0 && /\s/.test(masked[j])) j--;
    const prev = j >= 0 ? masked[j] : "";
    if (prev !== "" && !";{})".includes(prev)) continue;

    found.push({
      line: source.slice(0, start).split("\n").length,
      token: `${m[1]}.skip`,
      title: firstStringArgument(source, start + m[0].length),
    });
  }
  return found;
}

/** The literal string argument opening at/after `idx`, unquoted; "" if none. */
function firstStringArgument(source, idx) {
  let i = idx;
  while (i < source.length && /\s/.test(source[i])) i++;
  const quote = source[i];
  if (quote !== '"' && quote !== "'" && quote !== "`") return "";
  let out = "";
  i++;
  while (i < source.length) {
    const c = source[i];
    if (c === "\\") {
      out += source[i + 1] || "";
      i += 2;
      continue;
    }
    if (c === quote) break;
    out += c;
    i++;
  }
  return out;
}

/** Does `title` name task `id` as a whole token (`T7` never matches `T70`)? */
function titleNamesTask(title, id) {
  if (!title || !id) return false;
  const escaped = String(id).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^A-Za-z0-9_-])${escaped}([^A-Za-z0-9_-]|$)`).test(title);
}

/**
 * The un-skip guard proper: run it after a wave's test gate has passed and
 * before the wave is recorded green.
 *
 * Total and never-throwing. Everything it could not check comes back as a
 * notice; only an attributable, fully-owed skip comes back as a violation.
 *
 * @param {{waves: Array<Array<{id: string, files: string[]|null}>>,
 *          waveIndex: number, _readFile: Function}} args
 * @returns {Promise<{violations: Array<{file: string, line: number, token: string,
 *          title: string, owners: string[]}>, notices: string[], scanned: string[]}>}
 */
export async function checkWaveUnskips({ waves, waveIndex, _readFile } = {}) {
  const violations = [];
  const notices = [];
  const scanned = [];
  const done = { violations, notices, scanned };

  if (!Array.isArray(waves) || waves.length === 0) {
    notices.push("no wave plan to scan");
    return done;
  }
  if (typeof _readFile !== "function") {
    notices.push("no _readFile transport — owned test files were not scanned");
    return done;
  }

  const allIds = [];
  const complete = new Set();
  const ownersByFile = new Map();
  for (let wi = 0; wi < waves.length; wi++) {
    for (const task of waves[wi] || []) {
      if (!task || !task.id) continue;
      if (!allIds.includes(task.id)) allIds.push(task.id);
      if (wi <= waveIndex) complete.add(task.id);
      for (const file of Array.isArray(task.files) ? task.files : []) {
        if (!ownersByFile.has(file)) ownersByFile.set(file, []);
        const owners = ownersByFile.get(file);
        if (!owners.includes(task.id)) owners.push(task.id);
      }
    }
  }

  const targets = [];
  for (let wi = 0; wi <= waveIndex && wi < waves.length; wi++) {
    for (const task of waves[wi] || []) {
      for (const file of Array.isArray(task && task.files) ? task.files : []) {
        if (UNSKIP_TEST_FILE_RE.test(file) && !targets.includes(file)) targets.push(file);
      }
    }
  }
  if (targets.length === 0) {
    notices.push("no completed task owns a test file in the PLAN's manifest — nothing to scan");
    return done;
  }

  for (const file of targets) {
    let text = null;
    try {
      text = await _readFile(file);
    } catch {
      text = null;
    }
    if (typeof text !== "string" || text === "") {
      notices.push(`${file} could not be read — not scanned`);
      continue;
    }
    scanned.push(file);

    for (const token of scanSkipTokens(text)) {
      const named = allIds.filter((id) => titleNamesTask(token.title, id));
      const owners = named.length > 0 ? named : ownersByFile.get(file) || [];
      // Attributable to nobody: not this guard's business.
      if (owners.length === 0) continue;
      // Owed by a task that has not run yet — the legitimate case.
      if (!owners.every((id) => complete.has(id))) continue;
      violations.push({ ...token, file, owners });
    }
  }

  return done;
}

/** The halt message: every violation named by file, line, token and owner. */
export function formatUnskipViolations(waveNum, violations) {
  const rows = violations.map(
    (v) =>
      `  ${v.file}:${v.line} ${v.token}(${v.title ? `"${v.title}"` : ""}) — ` +
      `owned by ${v.owners.join(", ")}, complete as of wave ${waveNum}`
  );
  return (
    `Error: Wave ${waveNum} un-skip guard failed — ${violations.length} skipped ` +
    `test block(s) are owned by a task that is already complete, so the wave's ` +
    `gate passed on tests that never ran:\n${rows.join("\n")}\n` +
    `Each 🟢 owner's first obligation is to remove the \`.skip\` wrapper on its own ` +
    `block. A block owned by a LATER wave's task is legitimate and does not appear here.`
  );
}

// ─── INTERIM: the wave ledger, Phase I's script-owned resume pointer ──────────
//
// `implementation.startWave` is a MANUAL pointer: after a wave-gate halt an
// operator has to edit the config before re-invoking, and an unattended queue
// run therefore re-dispatches agents over work that is already committed. The
// ledger closes that gap without an operator in the loop: after each wave whose
// work the script itself committed, the script records the wave number; the next
// invocation reads it and resumes at the wave that actually needs doing.
//
// INTERIM, and marked as such deliberately. The formalized mechanism is the
// `pdlc-wave-resume` feature (docs/_queue/QUEUE.md row 20) — this block is
// contained (one path constant, two pure functions, one read site and two write
// sites, all inside Phase I's wave branch) precisely so that feature can replace
// it cleanly rather than untangle it.
//
// Every failure mode here is FAIL-OPEN. A ledger that cannot be read, parsed,
// matched or written never halts the pipeline: the worst case is the behaviour
// that shipped before it existed — a full run from wave 1.
export const WAVE_STATE_PATH = ".claude/pdlc-wave-state.json";

/**
 * An integrity-lite fingerprint of a computed wave plan: FNV-1a (32-bit) over
 * the wave order, the task ids and the owned paths.
 *
 * Not a cryptographic digest and not trying to be — `_hashFile`'s sha256 is for
 * approval anchors, where the adversary is silent drift in a reviewed document.
 * Here the question is only "is this the same plan the ledger was written
 * against?", and a re-derived PLAN that reshuffles waves or re-owns files must
 * answer no. FNV-1a is pure arithmetic, so it needs no crypto seam in a module
 * that has none.
 *
 * @param {Array<Array<{id: string, files: string[]|null}>>} waves
 * @returns {string} 8 lowercase hex digits
 */
export function computePlanHash(waves) {
  const canonical = (Array.isArray(waves) ? waves : [])
    .map((wave) =>
      (Array.isArray(wave) ? wave : [])
        .map((t) => {
          const id = t && t.id != null ? String(t.id) : "";
          const files = t && Array.isArray(t.files) ? t.files : [];
          return `${id}:${files.join(",")}`;
        })
        .join("|")
    )
    .join(";");

  let h = 0x811c9dc5;
  for (let i = 0; i < canonical.length; i++) {
    h ^= canonical.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/**
 * Parse the wave ledger. Pure and total: never throws, never reads anything.
 *
 * Three outcomes, and the caller says something different about each:
 * - `{state: null, reason: null}` — no ledger to speak of (absent file, empty
 *   file, or the cleared `{}`). SILENT: this is the shape of every fresh run.
 * - `{state: null, reason: "<why>"}` — there is content, and it is not something
 *   this workflow wrote. The caller emits a notice naming the reason and runs
 *   every wave.
 * - `{state: {...}, reason: null}` — a well-formed record. The caller still has
 *   to match it against THIS run's feature and plan before honouring it.
 *
 * @param {string|null} text
 * @returns {{state: {feature: string, planHash: string, lastGreenWave: number}|null,
 *            reason: string|null}}
 */
export function parseWaveLedger(text) {
  if (text == null) return { state: null, reason: null };

  const trimmed = String(text).trim();
  if (trimmed === "" || trimmed === "{}") return { state: null, reason: null };

  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { state: null, reason: "it is not readable JSON" };
  }

  if (!isPlainObject(parsed)) return { state: null, reason: "it is not a JSON object" };

  const feature = parsed.feature;
  const planHash = parsed.planHash;
  const lastGreenWave = parsed.lastGreenWave;
  const wellFormed =
    typeof feature === "string" &&
    feature.trim() !== "" &&
    typeof planHash === "string" &&
    planHash.trim() !== "" &&
    Number.isInteger(lastGreenWave) &&
    lastGreenWave >= 1;

  if (!wellFormed) {
    return { state: null, reason: "its fields are not the shape this workflow writes" };
  }

  // `head` is the tree-side corroboration: the commit that carried the recorded
  // wave's work. It is OPTIONAL on read — a ledger written before this field
  // existed is still honoured on its feature/planHash match alone, because the
  // file is untracked local state and a forced full re-run is the cost of
  // rejecting it. Present but not a string, and it is simply not carried.
  const head = typeof parsed.head === "string" && parsed.head.trim() !== "" ? parsed.head.trim() : null;

  return { state: { feature, planHash, lastGreenWave, head }, reason: null };
}

/**
 * Serialise a ledger record. Pretty-printed and newline-terminated because the
 * one reader that matters most is a human debugging a resumed run.
 *
 * `head` is the commit that carried this wave's work. It is what lets a later
 * invocation ask the TREE whether the recorded work is still there, rather than
 * trusting a record about a file the tree never sees: `feature` and `planHash`
 * are both functions of the PLAN document, so a `git reset --hard` or a re-cut
 * branch leaves them matching a ledger whose commits are gone. Omitted (null)
 * when no git transport was injected, in which case the record carries the same
 * fields it always did.
 *
 * @param {string} feature
 * @param {string} planHash
 * @param {number} lastGreenWave
 * @param {string|null} [head]
 * @returns {string}
 */
export function formatWaveLedger(feature, planHash, lastGreenWave, head = null) {
  const record =
    typeof head === "string" && head.trim() !== ""
      ? { version: 1, feature, planHash, lastGreenWave, head: head.trim() }
      : { version: 1, feature, planHash, lastGreenWave };
  return `${JSON.stringify(record, null, 2)}\n`;
}

// ─── Runtime API stubs (replaced by real runtime in production) ───────────────

/* These are no-op stubs for the module-level functions that the real Claude Code
   runtime provides. Tests override them via dependency injection. */

// eslint-disable-next-line no-unused-vars
async function agent(skill, prompt, opts) {
  // Provided by runtime
  throw new Error("agent() not available outside Claude Code runtime");
}

// eslint-disable-next-line no-unused-vars
async function parallel(promises) {
  return Promise.all(promises);
}

// eslint-disable-next-line no-unused-vars
async function pipeline(label, fn) {
  return fn();
}

// eslint-disable-next-line no-unused-vars
function phase(label) {
  // Provided by runtime
}

function log(message) {
  // In tests this is overridden; in production it's the runtime log
  if (typeof console !== "undefined") {
    console.log("[orchestrate-dev]", message);
  }
}

// Real wall-clock sleep used by Phase PUB's poll loop. Injectable in tests via _sleep.
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Default file read — real fs, returns null on any error (mirrors orchestrate-queue's
// defaultReadFile). Injectable in tests via _readFile. Used for PLAN DAG parsing.
export function defaultReadFile(path) {
  try {
    return fs.readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

/**
 * Default `_hashFile`: the document's approval digest, without handing the
 * document's bytes back across the seam.
 *
 * Returns EXACTLY what `approvalHashOf` returns for the file's contents —
 * `sha256:{64 hex}` over the canonicalised text, not a raw digest of the bytes
 * on disk — because every consumer compares it against an `APPROVAL-HASH:`
 * literal. Null on any error, mirroring `defaultReadFile`'s contract, so a
 * caller that used to test `bytes != null` can test the hash the same way.
 *
 * Injectable in tests via `_hashFile`; supplied in the workflow runtime by the
 * adapter's `rtHashFile`, which is one IO agent instead of `_readFile`'s
 * per-chunk fan-out. That saving is the whole reason this seam exists.
 */
function defaultHashFile(path) {
  try {
    return approvalHashOf(fs.readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

/**
 * Default `_hashNormalizedFile`: `defaultHashFile`'s twin over
 * `normalizeForApproval`'s output (DEC-APPROVAL-03).
 *
 * A SEPARATE seam rather than a second return value from `_hashFile`, for the
 * one reason that shaped this whole feature: the raw digest's economy is
 * load-bearing (`hashFileSeam.test.js` pins that a converging round never puts
 * the document's bytes on `_readFile`), and a normalised digest cannot be taken
 * over a digest — it needs the text. Keeping them apart lets each side answer
 * where its bytes already are, and lets a transport that cannot answer the
 * normalised question decline it without disturbing the raw one.
 *
 * Declining is a first-class outcome. `null` here means exactly "no normalised
 * anchor", which every consumer already treats as the pre-DEC-APPROVAL-03
 * behaviour — including the workflow-runtime bundle, where `fs` does not exist
 * and the adapter injects no override, so the `catch` returns `null` and the
 * pipeline is byte-for-byte what it was. The runtime's live path is the probe
 * (`probeDocument`'s `normalizedHash`), which computes this in the CLI process
 * where the bytes already are, at no extra dispatch.
 */
function defaultHashNormalizedFile(path) {
  try {
    return approvalHashOfNormalized(fs.readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

// ─── TSPEC §3.2 — the listing seam's Node default ─────────────────────────────

/**
 * List a directory's file basenames. Never throws: every failure is reported as
 * `{ ok: false, reason }` with `reason` drawn from the closed LIST_FAILURES
 * catalogue (§4.2). Non-recursive; directories are excluded; basenames only, so
 * parseReviewFilename's anchored grammar sees what it expects.
 *
 * The `{ fsMod = fs }` second-argument idiom is copied from checkFileNonEmpty so
 * the two file-touching Node defaults are tested the same way.
 *
 * @param {string} dirPath - repo-relative directory path
 * @param {{ fsMod?: object }} [opts] - injection point for tests (override fs)
 * @returns {{ ok: true, files: string[] } | { ok: false, reason: string }}
 */
export function defaultListFiles(dirPath, { fsMod = fs } = {}) {
  if (typeof dirPath !== "string" || dirPath.trim() === "") {
    return { ok: false, reason: "bad_argument" };
  }
  try {
    const entries = fsMod.readdirSync(dirPath, { withFileTypes: true });
    return {
      ok: true,
      files: entries
        .filter((entry) => !entry.isDirectory())
        .map((entry) => entry.name),
    };
  } catch (err) {
    const code = err && err.code;
    if (code === "ENOENT") return { ok: false, reason: "dir_missing" };
    if (code === "ENOTDIR") return { ok: false, reason: "not_a_directory" };
    return { ok: false, reason: "unreadable" };
  }
}

// ─── TSPEC §3.3 — the two write seams' Node defaults ──────────────────────────

/**
 * Write a file, replacing its contents entirely. Throws on failure — deliberately
 * the exception to §3.2's never-throw rule: a failed write is not a condition a
 * caller can meaningfully continue past, and defaultReadFile / checkFileNonEmpty
 * already establish throw-on-IO-failure as this module's idiom. Callers wrap it
 * where FSPEC prescribes a specific halt.
 *
 * @param {string} path
 * @param {string} contents
 * @param {{ fsMod?: object }} [opts] - injection point for tests (override fs)
 * @returns {void}
 */
export function defaultWriteFile(path, contents, { fsMod = fs } = {}) {
  fsMod.writeFileSync(path, contents, "utf8");
}

/**
 * Append text to a file. APPEND-SHAPED, NEVER A WHOLE-FILE REWRITE (FSPEC §7.4):
 * a read-modify-write would re-emit the reviewer's prose, and any divergence
 * between what was read and what was written would silently rewrite a
 * cross-review file. Hence appendFileSync, not writeFileSync(existing + text).
 * Throws on failure, for the same reason defaultWriteFile does.
 *
 * @param {string} path
 * @param {string} text
 * @param {{ fsMod?: object }} [opts] - injection point for tests (override fs)
 * @returns {void}
 */
export function defaultAppendFile(path, text, { fsMod = fs } = {}) {
  // TSPEC §10.1 — creates the parent directory (e.g. `docs/_queue/`) when absent, so a
  // consumer repo with no queue directory yet still gets its escalation log written. Strictly
  // additive: `appendFileSync` below already throws on failure, and `mkdirSync` does too — the
  // function's "throws on failure" contract is unchanged.
  fsMod.mkdirSync(dirname(path), { recursive: true });
  fsMod.appendFileSync(path, text, "utf8");
}

// ─── TSPEC §3.4 — the transport seam's Node default ───────────────────────────

/**
 * Run a git command. The caller branches on `ok`; the seam interprets nothing.
 * Never throws. `argv` is an array, not a command string: a string would need
 * quoting rules at the seam boundary and would make a feature name containing a
 * space a shell-injection surface. The `{ execFn }` injection point mirrors
 * mergeWorktree, which resolves child_process's execSync the same way.
 *
 * @param {string[]} argv - git arguments, NOT including the leading "git"
 * @param {{ execFn?: function }} [opts] - injection point for tests
 * @returns {Promise<{ ok: boolean, stdout: string, stderr: string }>}
 */
export async function defaultGit(argv, { execFn } = {}) {
  const { execFileSync: realExecFileSync } = await import("child_process");
  const exec =
    execFn ?? ((file, args, opts) => realExecFileSync(file, args, opts));

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

// ─── PROPOSAL §3.3 — Phase I's script-owned commits ───────────────────────────

/** How many extra attempts a git call gets when `.git/index.lock` is held. */
export const GIT_LOCK_RETRIES = 5;
/** The wait between those attempts, in ms. */
export const GIT_LOCK_RETRY_DELAY_MS = 5000;

/**
 * Two git failures are expected, transient and NOT a reason to halt.
 * `.git/index.lock`: a wave's agents run in one shared tree, and the tail of
 * an agent's own tooling (a formatter, a watcher, a `git status` from a
 * language server) can still hold the index for a second or two after the
 * dispatch returned. `unparseable adapter response`: the runtime `_git` seam is
 * agent-transcribed, so the git call may well have SUCCEEDED and only the
 * report of it been garbled — a retry is safe on every argv this helper serves,
 * because `add` is idempotent and a re-`commit` of already-recorded work lands
 * in `commitPaths`' nothing-staged arm rather than double-committing. Every
 * other git failure is a real one and reaches the caller unretried — retrying a
 * rejected commit hook five times just delays the halt by 25 seconds.
 *
 * @param {string[]} argv
 * @param {{ _git: function, _sleep: function, emit: function, label: string }} seams
 * @returns {Promise<{ ok: boolean, stdout: string, stderr: string }>} the LAST attempt's result
 */
export async function gitWithLockRetry(argv, { _git, _sleep, emit, label }) {
  let result = null;
  for (let attempt = 0; attempt <= GIT_LOCK_RETRIES; attempt++) {
    result = await _git(argv);
    if (result && result.ok === true) return result;
    const stderr = String((result && result.stderr) || "");
    const transient = stderr.includes("index.lock")
      ? ".git/index.lock is held"
      : stderr.includes("unparseable adapter response")
        ? "adapter response was unparseable"
        : /no matches found|command not found/.test(stderr)
          ? "the transport shell mangled the command"
          : /did not match any files/.test(stderr)
            ? "the transport ran git outside the repository root"
            : null;
    if (transient === null || attempt === GIT_LOCK_RETRIES) return result;
    emit(
      `${label}: ${transient} — retrying in ${GIT_LOCK_RETRY_DELAY_MS}ms ` +
        `(attempt ${attempt + 1} of ${GIT_LOCK_RETRIES})`
    );
    await _sleep(GIT_LOCK_RETRY_DELAY_MS);
  }
  return result;
}

/**
 * The sentence every wave-commit halt ends with. The distinction it draws is the
 * one an operator needs: the WORK is fine — it was gated by the orchestrator's own
 * suite run before this commit was attempted — and only the recording of it
 * failed, so the recovery is a commit, never a re-run of the wave.
 */
function uncommittedWorkRemedy(paths) {
  return (
    `The wave's work is verified (the orchestrator's own test gate passed) and is ` +
    `present in the working tree, but UNCOMMITTED. Nothing is lost: commit it ` +
    `yourself (\`git add -- ${paths.join(" ")}\` then \`git commit\`) and re-invoke, ` +
    `or fix the git condition and re-invoke.`
  );
}

/**
 * Stage `paths` and commit them under `message`, pathspec-scoped and NEVER `-a`.
 *
 * `git add -- <paths>` then a PLAIN `git commit -m` (no pathspec): the add is what
 * scopes the change set, and a second pathspec on the commit would silently
 * re-narrow it against the set that was actually verified. Between the two, the
 * staged set is READ BACK — an add that staged nothing means the task made no
 * change, which is a notice, not a commit and not a halt.
 *
 * @returns {Promise<"committed"|"nothing-staged">}
 * @throws {Error} halt error on any non-transient git failure
 */
export async function commitPaths({ paths, message, what, _git, _sleep, emit }) {
  const add = await gitWithLockRetry(["add", "--", ...paths], {
    _git,
    _sleep,
    emit,
    label: `${what}: git add`,
  });
  if (!add || add.ok !== true) {
    throw haltError(
      `Error: ${what} — \`git add -- ${paths.join(" ")}\` failed: ` +
        `${String((add && add.stderr) || "no output").trim()}. ` +
        uncommittedWorkRemedy(paths)
    );
  }

  const staged = await _git(["diff", "--cached", "--name-only", "--", ...paths]);
  if (staged && staged.ok === true && String(staged.stdout || "").trim() === "") {
    emit(`${what}: nothing staged — no changes to commit`);
    return "nothing-staged";
  }

  const commit = await gitWithLockRetry(["commit", "-m", message], {
    _git,
    _sleep,
    emit,
    label: `${what}: git commit`,
  });
  if (!commit || commit.ok !== true) {
    // The staged read-back above travels the same agent-transcribed channel as
    // every other adapter read, so a garbled "non-empty" answer can send a
    // no-change task into `git commit` anyway. Git then refuses with its
    // "nothing to commit" family of messages — which is the read-back's own
    // verdict arriving late, not a failure to record verified work. Honour it
    // as the notice it would have been; every other refusal still halts.
    const refusal = `${String((commit && commit.stdout) || "")}\n${String(
      (commit && commit.stderr) || ""
    )}`;
    if (/nothing (added )?to commit|no changes added to commit/.test(refusal)) {
      emit(`${what}: nothing staged — no changes to commit`);
      return "nothing-staged";
    }
    throw haltError(
      `Error: ${what} — \`git commit\` failed: ` +
        `${String((commit && commit.stderr) || "no output").trim()}. ` +
        uncommittedWorkRemedy(paths)
    );
  }
  emit(`${what}: committed — ${message}`);
  return "committed";
}

/**
 * The one-line commit subject for a wave task. The PLAN description travels
 * into a `git commit -m` executed by the adapter's agent-transcribed shell,
 * whose quoting is not under this script's control — a double-quoted zsh still
 * interprets backticks, `$`, `\` and `"`, and a PLAN description legitimately
 * carries backticks (`` `describe.skip` ``). Those four characters are
 * stripped so the subject is inert under any quoting the transport picks.
 */
function waveCommitMessage(featureName, task) {
  const description = String(task.description || "")
    .replace(/[`"$\\]/g, "")
    .trim();
  const short =
    description.length > 60 ? `${description.slice(0, 57)}...` : description;
  return `feat(${featureName}): ${task.id}${short ? ` — ${short}` : ""}`;
}

// ─── TSPEC §3.5 — the queue-row seam's Node default ───────────────────────────

/**
 * Record a halt against the feature's queue row. The default is a NO-OP that
 * reports "none": a unit test, or a direct invocation in a repo with no queue,
 * has no row to write and must not fail for it.
 *
 * The seam exists to preserve the dependency direction — row location and row
 * writing stay in orchestrate-queue.js; orchestrate-dev.js never learns the
 * queue's table grammar. orchestrate-queue's _runPipeline and the dev bundle's
 * DEV_ENTRY supply the real closures.
 *
 * @returns {Promise<{ queueRow: string, detail?: string }>}
 */
export async function defaultRecordQueueRow(/* { feature, status } */) {
  return { queueRow: "none" };
}

// ─── TSPEC §7.1 — A4's Phase DOD context (PLAN A-25) ───────────────────────
//
// `buildA4SeamOps` needs `mergeBase`, `preRebaseHead`, `defaultTip`, `planFiles` and `implConfig`
// (`dev:2288`) but computes none of them itself. This gathers all five, entirely through `_git` and
// `_readFile` — A4's own declared capability surface is `_git` alone (TSPEC §7.3's member table
// names no `_ghRun`), so the default branch is resolved via `git symbolic-ref
// refs/remotes/origin/HEAD` rather than a `gh repo view` probe. Every git/read failure degrades to
// `null`/`[]` rather than throwing: `buildA4SeamOps`'s own `verifyGate` already treats a
// missing/failed probe as unverifiable (§7.4), so a degraded context here still routes to the
// conservative (escalate) outcome instead of crashing the phase.
//
// @param {{feature: string, preRebaseHead: string|null, _git: Function, _readFile: Function}} args
// @returns {Promise<{mergeBase: string|null, preRebaseHead: string|null, defaultTip: string|null,
//          planFiles: string[], implConfig: object}>}
export async function gatherA4Context({ feature, preRebaseHead, _git, _readFile }) {
  let defaultRef = null;
  try {
    const symRef = await _git(["symbolic-ref", "refs/remotes/origin/HEAD"]);
    const match =
      symRef && symRef.ok
        ? /^refs\/remotes\/origin\/(.+)$/.exec(String(symRef.stdout || "").trim())
        : null;
    if (match) defaultRef = `origin/${match[1]}`;
  } catch {
    defaultRef = null;
  }

  let mergeBase = null;
  let defaultTip = null;
  if (defaultRef) {
    try {
      const mergeBaseResult = await _git(["merge-base", "HEAD", defaultRef]);
      mergeBase = mergeBaseResult && mergeBaseResult.ok ? String(mergeBaseResult.stdout || "").trim() : null;
    } catch {
      mergeBase = null;
    }
    try {
      const defaultTipResult = await _git(["rev-parse", defaultRef]);
      defaultTip = defaultTipResult && defaultTipResult.ok ? String(defaultTipResult.stdout || "").trim() : null;
    } catch {
      defaultTip = null;
    }
  }

  let planFiles = [];
  try {
    const planRaw = await _readFile(`docs/${feature}/PLAN-${feature}.md`);
    const ownership = typeof planRaw === "string" ? parsePlanOwnership(planRaw) : null;
    if (ownership && Array.isArray(ownership.ownership)) {
      planFiles = [...new Set(ownership.ownership.flatMap((row) => row.files))];
    }
  } catch {
    planFiles = [];
  }

  let implConfig = IMPLEMENTATION_DEFAULTS;
  try {
    const implRaw = await readMergeConfigSafely(_readFile, MERGE_CONFIG_PATH);
    implConfig = parseImplementationConfig(implRaw).config;
  } catch {
    implConfig = IMPLEMENTATION_DEFAULTS;
  }

  return { mergeBase, preRebaseHead, defaultTip, planFiles, implConfig };
}

// ─── TSPEC §8.1/§8.2 — A5's Phase PUB context (PLAN A-26) ──────────────────
//
// `buildA5SeamOps` needs `defaultBranch` (a branch NAME — it is interpolated into
// `gh run list --branch …`, §8.3's BL-05 probe), `mergeBase` (a sha, the E-2 *introduced* test's
// reference point) and `preSeamHead` (the sha `revert` resets to, A5-8). None is computed by the
// seam. This gathers all three through `_git` alone — the same `symbolic-ref
// refs/remotes/origin/HEAD` resolution `gatherA4Context` uses, so the two seams agree about which
// branch is "default" without adding a second, `gh`-shaped source of truth.
//
// `preSeamHead` is read HERE rather than at Phase PUB entry, because this function is called from
// inside the `status === "failed"` branch — i.e. immediately before the seam fires, which is the
// capture point A5-8's revert contract assumes (the same shape A4's `preRebaseHead` uses).
//
// Every probe degrades to `null` rather than throwing: `buildA5SeamOps`'s own BL-05 probe already
// treats an unusable reading as "the comparison is undone" and escalates attempting no fix (A5-2),
// so a degraded context here routes to the conservative outcome instead of crashing Phase PUB.
//
// @param {{_git: Function}} args
// @returns {Promise<{defaultBranch: string|null, mergeBase: string|null, preSeamHead: string|null}>}
export async function gatherA5Context({ _git }) {
  let defaultBranch = null;
  try {
    const symRef = await _git(["symbolic-ref", "refs/remotes/origin/HEAD"]);
    const match =
      symRef && symRef.ok
        ? /^refs\/remotes\/origin\/(.+)$/.exec(String(symRef.stdout || "").trim())
        : null;
    if (match) defaultBranch = match[1];
  } catch {
    defaultBranch = null;
  }

  let mergeBase = null;
  if (defaultBranch) {
    try {
      const mergeBaseResult = await _git(["merge-base", "HEAD", `origin/${defaultBranch}`]);
      mergeBase =
        mergeBaseResult && mergeBaseResult.ok ? String(mergeBaseResult.stdout || "").trim() : null;
    } catch {
      mergeBase = null;
    }
  }

  let preSeamHead = null;
  try {
    const headResult = await _git(["rev-parse", "HEAD"]);
    preSeamHead = headResult && headResult.ok ? String(headResult.stdout || "").trim() : null;
  } catch {
    preSeamHead = null;
  }

  return { defaultBranch, mergeBase, preSeamHead };
}

// ─── TSPEC-SCRIPT-04: main() ──────────────────────────────────────────────────

/**
 * Main pipeline function — runs the full PDLC pipeline from REQ to harvest.
 * @param {{ reqPath: string, _agent?: function, _parallel?: function, _log?: function, _checkFile?: function, _readFile?: function, _hashFile?: function, _hashNormalizedFile?: function, _phase?: function, _pipeline?: function, _probeDoc?: function, _probeReviewState?: function, _probePostmortem?: function, _sessionAgent?: function }} params
 * @returns {Promise<FinalReport>}
 */
export default async function main({
  reqPath,
  forcePhases = null,
  _agent: rawAgentFn = agent,
  _parallel: parallelFn = parallel,
  _log: logFn = log,
  _checkFile: checkFileFn = checkFileNonEmpty,
  _readFile: readFileFn = defaultReadFile,
  _hashFile: hashFileFn = defaultHashFile,
  _hashNormalizedFile: hashNormalizedFileFn = defaultHashNormalizedFile,
  _phase: phaseFn = phase,
  _pipeline: pipelineFn = pipeline,
  _mergeWorktree: mergeWorktreeFn = mergeWorktree,
  _rebaseOntoDefault: rebaseOntoDefaultFn = rebaseOntoDefault,
  _dodVerifyLoop: dodVerifyLoopFn = dodVerifyLoop,
  // TSPEC §7.1 (PLAN A-25) — Phase DOD's advisory seams. Free idents by default
  // (§2.3): a runtime that supplies neither runs the real driver against the
  // real config file, exactly as a repo with the tier configured would see.
  _runAdvisorySeam: runAdvisorySeamFn = runAdvisorySeam,
  _readAdvisoryConfig: readAdvisoryConfigFn = readAdvisoryConfigSafely,
  _raisePrAndVerifyCi: raisePrAndVerifyCiFn = raisePrAndVerifyCi,
  _checkCi: checkCiFn = checkPrCi,
  _phaseDodEnabled: phaseDodEnabled = PHASE_DOD_ENABLED,
  _phasePubEnabled: phasePubEnabled = PHASE_PUB_ENABLED,
  _phaseMergeEnabled: phaseMergeEnabled = PHASE_MERGE_ENABLED,
  _now,
  _sleep,
  _listFiles: listFilesFn = defaultListFiles,
  _writeFile: writeFileFn = defaultWriteFile,
  _appendFile: appendFileFn = defaultAppendFile,
  _git: gitFn = defaultGit,
  _recordQueueRow: recordQueueRowFn = defaultRecordQueueRow,
  _ghRun: ghRunFn = defaultGhRun,
  // The three optional probe seams. `null` is the shipped state: a runtime that
  // supplies none of them runs every read below exactly as it did before they
  // existed (see the probe-seam section above `probeDocument`).
  _probeDoc: probeDocFn = NO_PROBE,
  _probeReviewState: probeReviewStateFn = NO_PROBE,
  _probePostmortem: probePostmortemFn = NO_PROBE,
  // PROPOSAL §3.3 / M-6 — the command transport Phase I's script-owned gate runs
  // the suite through. `null` is the shipped module default (see NO_RUN_COMMAND);
  // the adapter wires it.
  _runCommand: runCommandFn = NO_RUN_COMMAND,
  // The optional session transport. Declared WITHOUT a default on purpose: this
  // function does not own the policy, `sessionBoundAgent` does (it defaults the
  // parameter to `NO_SESSION_AGENT`), and every consumer here reaches the
  // transport through that one function. main() is a pass-through for it.
  _sessionAgent,
} = {}) {
  // Override module-level log for injection
  const emit = logFn;

  // MODEL-01: pin every agent call to Opus by default. Phase I overrides this to
  // Sonnet at its dispatch site. An explicit opts.model always wins over the default,
  // so downstream helpers (reviewLoop, dodVerifyLoop, ship/rebase, harvest) inherit Opus.
  const agentFn = (skill, prompt, opts) =>
    rawAgentFn(skill, prompt, { model: MODEL_DEFAULT, ...opts });

  const phases = [];
  let haltReason;

  // TSPEC §8.4 (PLAN A-26, OQ-3) — the commit `git rev-parse HEAD` reported the moment Phase
  // DOD's verify loop passed. `buildFinalReport` reports it and derives `dodHeadUnverified` by
  // comparing it against the branch head at report-build time — report-only, never a re-verify
  // and never a halt (DEC-ADV-07).
  let dodVerifiedCommit = null;

  // Companion to `dodVerifiedCommit` above: the branch head at report-build time, read the same
  // report-only way (never throws, `null` on any read failure). Called at each `buildFinalReport`
  // call site so the comparison reflects the tree as of that report.
  async function readCurrentHead() {
    try {
      const headResult = await gitFn(["rev-parse", "HEAD"]);
      return headResult && headResult.ok ? String(headResult.stdout || "").trim() : null;
    } catch {
      return null;
    }
  }

  /**
   * §5.8/§4.7: an unresolved POSTMORTEM found on a SKIP path. The state is real
   * whether or not the phase ran, so `postmortemStatus`/`postmortemPath` carry
   * it on a successful run too — `haltPhase` staying `null` is what tells the
   * operator this was "skipped, and by the way there is an open POSTMORTEM
   * here" rather than "refused because of it".
   */
  let skipPostmortem = null;

  function recordPhase(phaseId, label, status, detail, iterations) {
    phases.push({
      phase: phaseId,
      label,
      status,
      ...(iterations !== undefined ? { iterations } : {}),
      ...(detail ? { detail } : {}),
    });
  }

  // ─── TSPEC §5.6 — the pacing wrapper's main()-side seams ─────────────────

  /**
   * The branch-derived round window for one doc type, read at phase entry (§5.2).
   * A listing that cannot be judged halts here rather than being read as "no
   * reviews on the branch" (§6.2 rows 2 and 17).
   */
  async function phaseWindow(docType) {
    const state = await resolveReviewState({
      feature: featureName,
      docType,
      _listFiles: listFilesFn,
      _readFile: readFileFn,
      _probeReviewState: probeReviewStateFn,
    });
    if (!state.ok) throw haltError(state.message);
    return state;
  }

  // ─── TSPEC §2.5 — the phase gate (steps 1–4 and step G) ──────────────────

  /**
   * §4.7's report LINES — the skip notice's siblings. Additive on every report,
   * so a note ("this anchor was UNEVALUABLE") reaches the operator without being
   * smuggled into a phase row's `detail`, which other oracles pin verbatim.
   */
  const notices = [];

  /**
   * Set when §2.5 step G refuses a phase, so §4.7's `postmortemStatus` reports
   * `"unresolved"` rather than the `"written"` a plain existence check would
   * infer. `haltPhase` still names the phase — that field is what distinguishes
   * "refused because of it" from a skip that merely mentions one.
   */
  let gatePostmortem = null;

  /**
   * PLAN §2.2 row R2 — doc types whose recorded approval this run has re-opened.
   * Written by the erratum gate through `markApprovalReopened`, read by
   * `phaseGate`. Run-scoped and in-memory: nothing on disk is rewritten, so the
   * only thing a re-open can do is make a phase RUN that would otherwise have
   * been skipped on a recorded approval.
   */
  const reopenedApprovals = new Map();

  /**
   * Run §2.5 steps 1–4 and step G for one skip-eligible phase entry.
   *
   * Called BEFORE the phase's creator dispatch, because a skip elides the whole
   * phase and a creator that had already run would have rewritten the very
   * document the approval was anchored to.
   *
   * @param {{phaseId: string, docType: string, docPath: string}} arg
   * @returns {Promise<{skip: true}|{skip: false, window: object, forced: boolean}>}
   */
  async function phaseGate({ phaseId, docType, docPath }) {
    const label = PHASE_DISPATCH[phaseId].label;
    // Step 1. Force overrides a recorded APPROVAL — steps 3 and 4, and only
    // those. Step 2 is NOT skipped: entering reviewLoop on the shipped
    // `iteration = 1` default re-creates H-1 on exactly the path an operator
    // reaches for BECAUSE the phase was reviewed before (§5.7, RLH-AT-01a).
    const forced = forcedPhases.has(phaseId);

    // Step 2 — the branch-derived round window.
    const window = await phaseWindow(docType);

    // DEC-FRZ-01's first trigger, read off the approval search below — the round
    // this document last carried a dual approval at. Stays `null` on a forced
    // phase, where the search does not run: a freeze is never inferred from a
    // read that was not taken.
    let priorApprovedRound = null;

    if (!forced) {
      // Step 3 — the approval search. Tier 1's reads already happened above.
      let record = tier1ApprovalRecord({
        reviewers: PHASE_DISPATCH[phaseId].reviewers,
        startIndex: window.startIndex,
        reviewFiles: window.reviewFiles,
      });
      if (record.tier1Empty) {
        record = await tier2ApprovalRecord({
          feature: featureName,
          docType,
          candidate: record.candidate,
          reviewers: PHASE_DISPATCH[phaseId].reviewers,
          _readFile: readFileFn,
        });
      }
      for (const path of record.unevaluable) {
        notices.push(
          `Phase ${phaseId}: approval anchor UNEVALUABLE at ${path} — the phase runs.`
        );
      }

      if (record.approving) {
        // DEC-FRZ-01: an approval was recorded at `record.candidate`. Whether or
        // not it survives step 4's staleness comparison below, the document HAS
        // been approved once — and the branch where it does not survive is
        // exactly the frozen case: bytes moved under an approved document.
        priorApprovedRound = record.candidate;
        // Step 4 — staleness. §5.5 rule 1: the bytes are read AT COMPARISON
        // TIME, never from a read cached earlier in the run.
        // The digest is computed at the far side of the seam (`_hashFile`), so
        // the comparison still reads the document AT COMPARISON TIME — it just
        // never carries the bytes back. In the workflow runtime `_readFile` is a
        // per-chunk agent fan-out, and this site never wanted the chunks.
        //
        // The absent/unreadable document keeps the byte-taking form verbatim:
        // `_hashFile` reports it as `null`, exactly as the whole-file read did,
        // and `isStale(hash, null)` is then the same call the previous line
        // made. Stating that case as `isStale` rather than folding it into a
        // digest constant is what makes the equivalence readable — and keeps
        // §5.5's claim that the gate consults `isStale` literally true.
        // `_probeDoc` reports the same digest under the same contract, so when it
        // answers it stands in for `_hashFile` here — including its `null`, which
        // keeps the byte-taking `isStale(hash, null)` branch below. That branch is
        // NOT `isStaleByHash(hash, null)`: the two disagree on exactly one input,
        // a recorded hash of an empty document, where `isStale` says FRESH.
        const probe = await probeDocument(probeDocFn, docPath, docType);
        const docHash = probe ? probe.hash ?? null : await hashFileFn(docPath);
        let freshness =
          docHash == null
            ? isStale(record.hash, null)
            : isStaleByHash(record.hash, docHash);
        // ─── DEC-APPROVAL-03 — the semantic second look ──────────────────────
        //
        // Reached ONLY when the raw comparison already refused the skip and the
        // approval carries a normalised anchor, so it is strictly a widening of
        // FRESH and can never stale an approval the byte comparison held. It is
        // also the only place in the gate that spends the document's bytes:
        // `normalizeForApproval` needs text, and paying for it here costs one
        // read on a path that was otherwise about to re-run a whole phase.
        //
        // UNEVALUABLE is deliberately NOT retried — an unreadable recorded hash
        // is not a citation that moved, and §5.5's fail-to-more-work stands.
        let heldByNormalization = false;
        if (freshness === "STALE" && record.normalizedHash) {
          const docNormalized = await normalizedAnchorFor({
            probe,
            path: docPath,
            _hashNormalizedFile: hashNormalizedFileFn,
          });
          if (docNormalized && docNormalized === record.normalizedHash) {
            freshness = "FRESH";
            heldByNormalization = true;
          }
        }

        // ─── PLAN §3.1 — the cascade rule ────────────────────────────────
        //
        // The byte rules above ask only whether THIS document moved. An
        // approval can pass all of them and still be describing a world that
        // no longer exists, because a later erratum edited the layer above
        // it (POSTMORTEM-P §3, POSTMORTEM-D §4.1). So a still-FRESH approval
        // is asked the second question: does its recorded `UPSTREAM-STATE`
        // still match the upstream chain on disk?
        //
        // Reached ONLY on FRESH, and only ever narrows: it can turn FRESH
        // into STALE (more work — §5.5's uniform direction), never STALE or
        // UNEVALUABLE into FRESH.
        //
        // Grandfathering (architect ruling Q-2): `record.upstreamState` is
        // `[]` for every approval anchored before this feature, and `[]`
        // drifts against nothing, so those approvals stay byte-ruled only.
        if (freshness === "FRESH" && record.upstreamState && record.upstreamState.length > 0) {
          const current = new Map();
          for (const row of record.upstreamState) {
            current.set(row.docType, await erratumDocHash(row.docType));
          }
          const drifted = upstreamStateDrift(record.upstreamState, current);
          if (drifted.length > 0) {
            freshness = "STALE";
            heldByNormalization = false;
            const notice =
              `Phase ${phaseId}: ${docPath} is byte-unchanged but its recorded approval was ` +
              `taken against a DIFFERENT upstream — ${drifted.join(", ")} moved since round ` +
              `${record.candidate} was approved (PLAN §3.1). The approval is treated as STALE ` +
              `and the phase runs again.`;
            notices.push(notice);
            emit(notice);
          }
        }
        // PLAN §2.2 row R2 — a document this run RE-OPENED cannot be skipped on
        // its recorded approval, however fresh the bytes are. The approval was
        // real; what changed is that this run has since been told, by that
        // document's own approvers, that it carries an unfixed inherited High.
        // Read here rather than folded into `record.approving` so the freeze
        // trigger below still sees that the document HAS been approved once.
        const reopened = reopenedApproval(reopenedApprovals, docType);
        if (freshness === "FRESH" && reopened) {
          notices.push(
            `Phase ${phaseId}: ${docPath} was RE-OPENED during this run — ${reopened.reason} ` +
              `The approval recorded at round ${record.candidate} does not hold and the phase runs.`
          );
        }
        if (freshness === "FRESH" && !reopened) {
          // The phase does not run. `checkPostmortem` is still evaluated, for
          // REPORTING ONLY — AC-2.3's refusal is conditioned on the phase
          // otherwise running, so a skip has nothing to refuse (§6.2 row 13a).
          const pm = await resolvePostmortem({
            phase: phaseId,
            feature: featureName,
            _readFile: readFileFn,
            _probePostmortem: probePostmortemFn,
          });
          let detail = heldByNormalization
            ? `Skipped — approved round ${record.candidate}, approval held: only line-number anchors moved since review`
            : `Skipped — approved round ${record.candidate}, hash FRESH`;
          if (heldByNormalization) {
            notices.push(
              `Phase ${phaseId}: ${docPath} differs from the approved bytes only in ` +
                `line-number anchors (\`file:line\` citations) — the recorded approval holds ` +
                `and the phase is skipped (DEC-APPROVAL-03).`
            );
          }
          if (pm.status === "unresolved") {
            detail += `; unresolved POSTMORTEM at ${pm.path}`;
            skipPostmortem = pm;
          }
          recordPhase(phaseId, label, "⏭", detail);
          return { skip: true };
        }
        if (freshness === "UNEVALUABLE") {
          notices.push(
            `Phase ${phaseId}: ${docPath} could not be compared against the recorded approval — the phase runs.`
          );
        }
      }
    }

    // Step G — G-INV. Every exit that leads to running the phase arrives here,
    // forced or not, and step 5 is reachable only through it. Force never
    // overrides a recorded FAILURE (§5.7, §6.2 row 13, AC-4.6a).
    const gate = await resolvePostmortem({
      phase: phaseId,
      feature: featureName,
      _readFile: readFileFn,
      _probePostmortem: probePostmortemFn,
    });
    if (gate.status === "unresolved") {
      gatePostmortem = gate;
      recordPhase(phaseId, label, "❌", `Refused — unresolved POSTMORTEM at ${gate.path}`);
      throw haltError(
        `Phase ${phaseId} refused: unresolved POSTMORTEM at ${gate.path} records a previous failure. ` +
          `Resolve it per AC-2.4 (set RESOLVED: yes) and re-run. Recommendation: ${gate.recommendation || "(none recorded)"}`
      );
    }

    // ─── DEC-ROUNDS-02 — the lifetime round cap (the single choke point) ────
    //
    // Placed LAST, after step G, and that ordering is the design:
    //
    //   - after step 4, so a document with a fresh recorded approval still
    //     reports the ordinary "approved round N, hash FRESH" skip rather than
    //     being relabelled as capped;
    //   - after step G, so an unresolved POSTMORTEM still REFUSES the phase.
    //     The cap says "this document has had enough review"; it says nothing
    //     about a recorded failure, and it must never clear one;
    //   - before the return, so it covers every path that opens a review round
    //     through this gate — a fresh review, a re-review re-opened by a staled
    //     approval anchor, and a forced-but-unforced-phase re-entry alike. The
    //     erratum protocol's delta-confirmation rounds open a window WITHOUT
    //     passing through here, so `erratumRound` carries the same check against
    //     the same predicate (there is no third round-opening path).
    //
    // `forced` overrides: an operator who named this phase asked for the round.
    if (!forced && lifetimeCapReached(window.startIndex)) {
      const onDisk = window.startIndex - 1;
      const detail =
        `Accepted as-is — lifetime review cap of ${MAX_LIFETIME_ROUNDS} rounds reached ` +
        `(${onDisk} rounds on disk); NOT approved`;
      recordPhase(phaseId, label, "⏭", detail);
      const notice =
        `Phase ${phaseId}: LIFETIME REVIEW CAP REACHED for ${docPath} — ${onDisk} review ` +
        `round${onDisk === 1 ? "" : "s"} for ${docType} are on disk and the cap is ` +
        `${MAX_LIFETIME_ROUNDS}. No author, reviewer or optimizer was dispatched for this ` +
        `phase. The document is ACCEPTED AS-IS and the pipeline moves forward. This is NOT ` +
        `an approval: no verdict was reached this run and no approval anchor was written. ` +
        `It is also not a failure — no POSTMORTEM was written. To review it again anyway, ` +
        `re-run with forcePhases including "${phaseId}".`;
      notices.push(notice);
      emit(notice);
      return { skip: true };
    }

    return { skip: false, window, forced, priorApprovedRound };
  }

  /**
   * §4.7's force-override notice, folded into the phase row so the run's own
   * record says the phase was forced. The wording is not pinned to a literal
   * anywhere in the TSPEC; that it is *said* is (RLH-AT-28).
   */
  const forcedDetail = (detail, forced) =>
    forced ? `${detail} — forced (recorded approval overridden)` : detail;

  /** The seams every wrapped dispatch and every reviewLoop entry shares. */
  const wrapperSeams = {
    _agent: agentFn,
    _readFile: readFileFn,
    _hashFile: hashFileFn,
    _hashNormalizedFile: hashNormalizedFileFn,
    _listFiles: listFilesFn,
    _appendFile: appendFileFn,
    _probeDoc: probeDocFn,
    _probeReviewState: probeReviewStateFn,
    _sessionAgent,
    _log: emit,
    _git: gitFn,
  };

  /** Wrap one main()-level dispatch (a creator, or harvest) in §3.8's episode. */
  async function wrappedDispatch({ skill, basePrompt, targetPath, docType, dispatchKind, phaseId, sessionKey }) {
    const episode = await dispatchAndVerify({
      skill,
      basePrompt,
      targetPath,
      docType,
      feature: featureName,
      dispatchKind,
      phaseId,
      ...wrapperSeams,
      // M-2: the creator runs in the SAME author session the phase's optimizer
      // will resume, so the revision rounds are continuations of the writing
      // rather than fresh readings of it. Placed after the spread so it wins over
      // `wrapperSeams._agent`; with no transport installed `sessionBoundAgent`
      // returns that very function, so this is a no-op on the shipped path.
      _agent: sessionBoundAgent({
        _sessionAgent,
        // A caller may name the session itself — a phase that authors two
        // documents in one author session (PROPOSAL §3.2's T+D fold) needs both
        // dispatches to land in the same one. Absent an override this is
        // exactly the key `reviewLoop`'s optimizer derives for the same phase.
        sessionKey: sessionKey ?? authorSessionKey(featureName, docType, phaseId),
        _agent: agentFn,
        _log: emit,
      }),
    });
    return episode.response;
  }

  // ─── PROPOSAL §3.1 step 4 / §5 decision 2 — erratum routing ──────────────
  //
  // The collection half lives in `reviewLoop` (see `parseErrata`); this is the
  // routing half, and it runs inside `converge` between `checkConverged` and
  // `afterConverged`. The placement is the contract: a phase routes errata only
  // once its OWN document has converged, so the upstream edit is never made on
  // behalf of a finding the phase itself was about to withdraw.

  /** The path an erratum doc type names on this feature's branch. */
  const erratumDocPath = (docType) => featureDocPath(featureName, docType);

  /**
   * The digest of one upstream document as it stands RIGHT NOW, through the same
   * probe-then-hash pair every other observation in this module uses. `null` for
   * a document that is not on the branch (an unwritten DECISIONS, say), which is
   * how the callers below tell "absent" from "moved".
   */
  async function erratumDocHash(docType) {
    const path = erratumDocPath(docType);
    const probe = await probeDocument(probeDocFn, path, docType);
    return (probe ? probe.hash : await hashFileFn(path)) ?? null;
  }

  /**
   * DEC-ERR-03 — the mint-time snapshot a routed list is dated against.
   *
   * Taken when a batch of errata is minted, once, for every document the wave
   * could edit. It is the only thing that makes "has upstream moved since this
   * list was cut?" a decidable question at dispatch time; without it the wave's
   * layers have no shared clock at all, which is RC-1 stated as a data structure.
   */
  async function snapshotErratumDocs() {
    const snapshot = new Map();
    for (const docType of ERRATUM_DOC_TYPES) {
      snapshot.set(docType, await erratumDocHash(docType));
    }
    return snapshot;
  }

  /**
   * DEC-ERR-03, at dispatch time: the upstream layers of `target` as they stand
   * NOW, plus which of them differ from the mint-time snapshot.
   *
   * A doc absent now is omitted entirely (there is nothing to re-ground on). A
   * doc whose mint-time digest was not recorded is reported but never called
   * moved — "not observed" is not "changed", the same asymmetry `refreshReviewState`
   * keeps between unreadable and empty.
   */
  async function deriveUpstreamState(target, mintedHashes) {
    const upstreamState = [];
    const movedSinceMinted = [];
    for (const docType of erratumDocTypesAbove(target)) {
      const hash = await erratumDocHash(docType);
      if (hash == null) continue;
      upstreamState.push({ docType, path: erratumDocPath(docType), hash });
      const minted = mintedHashes ? mintedHashes.get(docType) : undefined;
      if (minted !== undefined && minted !== null && minted !== hash) {
        movedSinceMinted.push(docType);
      }
    }
    return { upstreamState, movedSinceMinted };
  }

  /**
   * The erratum protocol's halt. It reuses the review loop's POSTMORTEM
   * lifecycle rather than inventing a second one: the CURRENT phase's
   * POSTMORTEM is written, confirmed by `_checkFile` rather than by the agent's
   * own claim (§6.3 step 2), the phase is recorded ❌, and the halt carries the
   * `haltPhase` / `postmortemPath` / `postmortemStatus` fields §4.7 reports.
   * The phase then refuses to run again until an operator sets `RESOLVED: yes`,
   * exactly as a non-convergence halt does.
   */
  async function erratumPostmortemHalt({ phaseId, label, reason }) {
    const postmortemPath = `docs/${featureName}/POSTMORTEM-${phaseId}-${featureName}.md`;
    const prompt = [
      `Write ${postmortemPath}.`,
      `Include the required sections: Phase, Iterations, Reviewers, Pattern of Disagreement, Best-Guess Root Cause, Recommendation.`,
      `The failure is an ERRATUM-PROTOCOL failure: ${reason}`,
      `Commit and push.`,
    ].join(" ");

    let written = false;
    try {
      const result = await agentFn(PHASE_DISPATCH[phaseId].optimizer, prompt, {
        model: MODEL_DEFAULT,
      });
      if (result != null && String(result).trim() !== "") {
        const confirmation = await checkFileFn(postmortemPath);
        written = !!(confirmation && confirmation.ok);
      }
    } catch {
      written = false;
    }

    recordPhase(phaseId, label, "❌", reason);
    throw haltError(
      written
        ? `${reason} Post-mortem written at ${postmortemPath}. ` +
            `Recover: resolve it per AC-2.4, then set the feature's row back to pending.`
        : `${reason} Post-mortem write FAILED — no artifact at ${postmortemPath}.`,
      {
        haltPhase: phaseId,
        postmortemPath,
        postmortemStatus: written ? "written" : "write_failed",
      }
    );
  }

  /**
   * PLAN §3.2 — the same-pass anchor cascade.
   *
   * Called after an erratum round for `target` has been CONFIRMED, i.e. after
   * `target`'s bytes moved with the approvers' blessing. Every document below
   * `target` whose recorded approval was anchored against the OLD `target`
   * (its `UPSTREAM-STATE` row says so) is now approved against a version that
   * no longer exists — POSTMORTEM-D's recommendation 4.1, unlanded through
   * three later post-mortems, is exactly "invalidate those in the same pass
   * and carry the re-confirmation forward in this run".
   *
   * For each such document, in pipeline order:
   *
   *   - approving re-confirmation  ⇒ the document's bytes are unchanged, so
   *     its anchors are re-stamped over the SAME hash with an UPDATED
   *     `UPSTREAM-STATE`. Append-only: the confirmation consumes the next
   *     derived round index and writes new cross-review files.
   *   - non-approving              ⇒ nothing is anchored (nobody approved
   *     these bytes against this upstream) and the owning phase is marked
   *     RE-OPENED through T2's registry, so it runs again in THIS run under
   *     its ordinary review budgets (architect ruling Q-1).
   *
   * Bounded by construction: one re-confirmation round per downstream
   * document per cascade trigger, and NO recursion — a cascade never
   * cascades. `lifetimeCapReached` continues to dominate: a capped document
   * dispatches nothing and is reported ACCEPTED AS-IS, exactly as an erratum
   * round on a capped document is.
   *
   * Grandfathering (architect ruling Q-2): a downstream approval carrying no
   * `UPSTREAM-STATE` rows is byte-ruled only and is left alone — silently,
   * because in a pre-upgrade repo that is EVERY approval and a notice per
   * document per erratum would be pure noise.
   */
  async function cascadeDownstream({ phaseId, target, editedIn }) {
    const targetHash = await erratumDocHash(target);
    if (targetHash == null) return;

    for (const downstream of erratumDocTypesBelow(target)) {
      const ownerPhase = ERRATUM_PHASE_BY_DOC_TYPE[downstream];
      const dispatch = PHASE_DISPATCH[ownerPhase];
      if (!dispatch || !Array.isArray(dispatch.reviewers) || dispatch.reviewers.length === 0)
        continue;

      const docPath = erratumDocPath(downstream);
      const docHash = await erratumDocHash(downstream);
      if (docHash == null) continue; // not on the branch — nothing approved.

      const window = await phaseWindow(downstream);
      // Tier 1 only. Tier 2 (`## 6. Approval Record` in LEARNINGS) carries no
      // cascade anchor by construction, so it could never do anything here.
      const record = tier1ApprovalRecord({
        reviewers: dispatch.reviewers,
        startIndex: window.startIndex,
        reviewFiles: window.reviewFiles,
      });
      if (!record.approving) continue;
      const row = (record.upstreamState ?? []).find((e) => e.docType === target);
      if (!row || row.hash === targetHash) continue;

      if (lifetimeCapReached(window.startIndex)) {
        const onDisk = window.startIndex - 1;
        const notice =
          `Phase ${phaseId}: LIFETIME REVIEW CAP REACHED for ${docPath} — the upstream cascade ` +
          `re-confirmation is skipped, nothing dispatched. ${onDisk} review round` +
          `${onDisk === 1 ? "" : "s"} for ${downstream} are on disk and the cap is ` +
          `${MAX_LIFETIME_ROUNDS}. Its approval was anchored against an EARLIER ${target}, which ` +
          `${editedIn} has since edited; the document is ACCEPTED AS-IS (not approved, not ` +
          `failed — no POSTMORTEM written) and the pipeline moves forward. To re-confirm it ` +
          `anyway, re-run with forcePhases including "${ownerPhase}".`;
        notices.push(notice);
        emit(notice);
        continue;
      }

      const round = window.startIndex;
      const reviewers = dispatch.reviewers;
      const paths = reviewers.map(
        (skill) =>
          `docs/${featureName}/CROSS-REVIEW-${reviewerRoleSlug(skill) || skill}-${downstream}-v${round}.md`
      );
      const { upstreamState } = await deriveUpstreamState(downstream, null);

      const opening =
        `Phase ${phaseId}: ${target} moved under ${docPath} — its recorded approval (round ` +
        `${record.candidate}) was anchored against ${target} \`${row.hash}\`, now ` +
        `\`${targetHash}\`. Dispatching ONE delta re-confirmation round v${round} to ` +
        `${reviewers.join(", ")} (PLAN §3.2).`;
      notices.push(opening);
      emit(opening);

      const responses = await parallelFn(
        reviewers.map((skill, i) =>
          wrappedDispatch({
            skill,
            basePrompt: cascadeConfirmPrompt({
              feature: featureName,
              docType: downstream,
              docPath,
              upstreamDocType: target,
              upstreamPath: erratumDocPath(target),
              round,
              reviewFile: paths[i],
              upstreamState,
            }),
            targetPath: paths[i],
            docType: downstream,
            dispatchKind: "review",
            phaseId: ownerPhase,
            sessionKey: reviewerSessionKey(featureName, downstream, ownerPhase, skill),
          })
        )
      );

      // Verdicts on exactly DEC-ERR-02's terms: the trailer first, the file
      // when the trailer is unreadable, fail-closed when neither is.
      const verdicts = [];
      for (let i = 0; i < reviewers.length; i++) {
        const trailer = parseVerdict(responses[i], reviewers[i]);
        if (trailer.malformed !== true) {
          verdicts.push(trailer);
          continue;
        }
        let fileText = null;
        try {
          fileText = await readFileFn(paths[i]);
        } catch {
          fileText = null;
        }
        const fromFile = extractFileVerdict(
          fileText,
          reviewerRoleSlug(reviewers[i]) || reviewers[i]
        );
        verdicts.push(fromFile.ok && fromFile.malformed !== true ? fromFile : trailer);
      }

      if (verdicts.every((v) => isPassResult(v))) {
        // The bytes are the ones already approved; only the premise moved. So
        // the anchor is re-stamped over the SAME digest with the CURRENT
        // upstream state — that is the whole point of the cascade.
        const probe = await probeDocument(probeDocFn, docPath, downstream);
        const normalizedHash = await normalizedAnchorFor({
          probe,
          path: docPath,
          _hashNormalizedFile: hashNormalizedFileFn,
        });
        await appendApprovalAnchors({
          paths,
          hash: docHash,
          normalizedHash,
          upstreamState: upstreamState.map((e) => ({ docType: e.docType, hash: e.hash })),
          commit: await headCommitSha(gitFn),
          _readFile: readFileFn,
          _probeDoc: probeDocFn,
          _appendFile: appendFileFn,
          _git: gitFn,
          emit,
        });
        const notice =
          `Phase ${phaseId}: ${docPath} RE-CONFIRMED at round v${round} against the edited ` +
          `${target}. Its bytes are unchanged; its approval now records the CURRENT upstream ` +
          `state and the phase stays skippable.`;
        notices.push(notice);
        emit(notice);
        continue;
      }

      const entry = markApprovalReopened(reopenedApprovals, {
        docType: downstream,
        phase: ownerPhase,
        reason:
          `phase ${phaseId}'s erratum edit to ${target} moved the upstream ${downstream} was ` +
          `approved against, and the delta re-confirmation at round v${round} did not approve.`,
      });
      const notice =
        `Phase ${phaseId}: ${docPath} was NOT re-confirmed against the edited ${target} at round ` +
        `v${round}. No anchors were written — nobody approved these bytes against this upstream — ` +
        `and the recorded approval is RE-OPENED, so phase ${entry ? entry.phase : ownerPhase} ` +
        `runs again under its ordinary review budgets (PLAN §3.2, ruling Q-1).`;
      notices.push(notice);
      emit(notice);
    }
  }

  /**
   * One erratum round for one upstream document: the targeted versioned edit
   * (step 4b) and the delta confirmation by that document's own approvers
   * (step 4c).
   *
   * Returns `{rule, responses}` — the PLAN §2.2 rule this round resolved to,
   * plus every response, so the caller can read any FURTHER errata out of them,
   * which is how a second batch for the same document becomes observable and
   * therefore how the §5 decision 2 bound gets to fire. R3 additionally returns
   * `followUpItems`: the caller re-enters with them and `attempt + 1`. R4 does
   * not return at all — it halts.
   *
   * `attempt` is the follow-up index (0 = the original round). It is the only
   * input to R3's budget test, so the budget is per upstream doc per phase
   * invocation by construction: the caller's loop owns the counter.
   *
   * Returns `null` — and dispatches nothing at all — when the upstream document
   * has spent its DEC-ROUNDS-02 lifetime round budget.
   */
  async function erratumRound({ phaseId, label, target, items, mintedHashes, attempt = 0 }) {
    const upstreamPhase = ERRATUM_PHASE_BY_DOC_TYPE[target];
    const upstream = PHASE_DISPATCH[upstreamPhase];
    const upstreamPath = erratumDocPath(target);
    const itemLines = items.map((e) => `- ${e.item} (raised by ${e.source})`).join("\n");
    const itemText = items.map((e) => e.item).join("; ");

    // Step 4c's window, derived BEFORE step 4b's author dispatch — DEC-ROUNDS-02.
    //
    // The derivation is unchanged and still content-addressed (§3.6): it reads
    // `CROSS-REVIEW-*` basenames, and the erratum author writes the upstream
    // DOCUMENT, never a cross-review, so no listing this reads can differ either
    // side of that dispatch. Taking it first is what lets the cap dispatch
    // NOTHING — a check placed after step 4b would already have paid for the
    // author episode and, worse, would leave the document edited with no round
    // able to confirm the edit.
    //
    // `forcePhases` deliberately does NOT reach here: it names a phase to re-run,
    // and an erratum round is not a phase. The operator's escape from a capped
    // upstream document is to force that document's OWN phase.
    const window = await phaseWindow(target);
    if (lifetimeCapReached(window.startIndex)) {
      const onDisk = window.startIndex - 1;
      const notice =
        `Phase ${phaseId}: LIFETIME REVIEW CAP REACHED for ${upstreamPath} — erratum round ` +
        `skipped, nothing dispatched. ${onDisk} review round${onDisk === 1 ? "" : "s"} for ` +
        `${target} are on disk and the cap is ${MAX_LIFETIME_ROUNDS}. The document is ` +
        `ACCEPTED AS-IS (not approved, and not failed — no POSTMORTEM was written) and the ` +
        `pipeline moves forward. Unaddressed erratum item${items.length === 1 ? "" : "s"}: ` +
        `${itemText}. To apply them anyway, re-run with forcePhases including ` +
        `"${upstreamPhase}".`;
      notices.push(notice);
      emit(notice);
      return null;
    }

    // ─── DEC-ERR-03 — re-derivation at DISPATCH time, not at wave open ───────
    //
    // Taken here, after the cap check and immediately before the author is
    // dispatched, because that instant is the whole point: everything the wave
    // edited between the list being minted and this dispatch has already landed
    // on disk, and this observation is what makes it visible to the author. It
    // must NOT be hoisted next to the mint-time snapshot — that would re-create
    // exactly the stale list DEC-ERR-03 exists to defeat.
    const { upstreamState, movedSinceMinted } = await deriveUpstreamState(target, mintedHashes);
    if (movedSinceMinted.length > 0) {
      const notice =
        `Phase ${phaseId}: erratum round for ${target} — upstream moved since the routed list was ` +
        `minted (${movedSinceMinted.join(", ")}). The author is re-grounded on upstream HEAD and ` +
        `the routed items are a floor, not a ceiling (DEC-ERR-03).`;
      notices.push(notice);
      emit(notice);
    }

    // Step 4b. The upstream document's author skill — `creator` where the phase
    // has one, and its `optimizer` where it does not (Phase R's REQ arrives
    // authored, so `pm-author` is its only writer).
    const authorSkill = upstream.creator ?? upstream.optimizer;
    const authorResponse = await wrappedDispatch({
      skill: authorSkill,
      basePrompt: erratumAuthorPrompt({
        feature: featureName,
        docType: target,
        docPath: upstreamPath,
        itemLines,
        raisedIn: phaseId,
        upstreamState,
        movedSinceMinted,
      }),
      targetPath: upstreamPath,
      docType: target,
      dispatchKind: "authoring",
      phaseId: upstreamPhase,
      // The upstream document's OWN author session (M-2), not this phase's:
      // the agent that applies the erratum is the agent that wrote the document.
      sessionKey: authorSessionKey(featureName, target, upstreamPhase),
    });

    // ─── PLAN §2.4 item 2 — structural re-mint ───────────────────────────
    //
    // Consulted ONLY on the upstream-skew path above: when nothing moved,
    // `itemLines` is already exactly what the confirmers should read, and
    // this block is a no-op by construction (`remint` stays unset).
    //
    // Fail-open, same doctrine as `parseErrata`: an author response with no
    // RE-MINT line leaves `confirmItemLines`/`confirmItemCount` at their
    // original values — the notice already emitted above is the whole of the
    // signal, exactly as it was before this task. Only a response that DOES
    // carry RE-MINT lines makes this structural: the confirmers then read the
    // author's own re-derivation, and an item the author reports ABSORBED is
    // never asked about again.
    let confirmItemLines = itemLines;
    let confirmItemCount = items.length;
    let confirmItemTexts = items.map((e) => e.item);
    if (movedSinceMinted.length > 0) {
      const remint = parseErratumRemint(authorResponse);
      if (remint) {
        confirmItemCount = remint.stillRaised.length;
        confirmItemTexts = remint.stillRaised;
        confirmItemLines =
          confirmItemCount > 0
            ? remint.stillRaised.map((text) => `- ${text}`).join("\n")
            : "(every routed item was reported ABSORBED against upstream HEAD; nothing remains to confirm.)";
        const notice =
          `Phase ${phaseId}: erratum round for ${target} — re-minted structurally: ` +
          `${remint.absorbed.length} item${remint.absorbed.length === 1 ? "" : "s"} absorbed, ` +
          `${confirmItemCount} still raised. Confirmers are reading the author's re-derived list ` +
          `against upstream HEAD, not the stale mint (PLAN §2.4 item 2).`;
        notices.push(notice);
        emit(notice);
      }
    }

    // ─── PLAN §2.3 (T4) — mechanical land-proof for literal-token items ─────
    //
    // Runs BEFORE confirmers are dispatched, on the item texts actually about
    // to be confirmed (post-remint, when a remint happened — an item the
    // re-grounding already reported ABSORBED is not re-checked here). A
    // confirmer's PASS is a legibility judgment ("does this edit resolve the
    // finding"); it is not by itself a mechanical proof the edit's BYTES ever
    // landed the exact token the finding named. POSTMORTEM-PR's own words for
    // the gap this closes: "the halt was one grep away from never having
    // happened, but the grep ran on the wrong party, one step too late" — the
    // grep now runs here, on the engine, before that party is ever asked.
    const literalTokenItems = confirmItemTexts
      .map((text) => ({ text, token: erratumLiteralTokenOf(text) }))
      .filter((entry) => entry.token !== null);

    if (literalTokenItems.length > 0) {
      const missingAgainst = async () => {
        let docText = null;
        try {
          docText = await readFileFn(upstreamPath);
        } catch {
          docText = null;
        }
        const hay = String(docText ?? "").toLowerCase();
        return literalTokenItems.filter((entry) => !headingContains(hay, entry.token));
      };

      let stillMissing = await missingAgainst();
      if (stillMissing.length > 0) {
        const missingClause = stillMissing
          .map((entry) => `- expected token \`${entry.token}\` (from: ${entry.text})`)
          .join("\n");
        const s = stillMissing.length === 1 ? "" : "s";
        notices.push(
          `Phase ${phaseId}: erratum round for ${target} — land-proof: ${stillMissing.length} ` +
            `literal-token item${s} did not land after the edit. Dispatching one bounded ` +
            `re-dispatch naming the missing token${s}, before confirmers are asked:\n${missingClause}`
        );
        emit(notices[notices.length - 1]);

        await wrappedDispatch({
          skill: authorSkill,
          basePrompt:
            `ERRATUM ROUND for ${upstreamPath} (feature ${featureName}) — LAND-PROOF RETRY.\n` +
            `Your previous edit to this ${target} did not land the following expected token${s}, ` +
            `checked mechanically against the document text after your edit:\n${missingClause}\n` +
            `Edit the document again so the exact token${s} above appear${stillMissing.length === 1 ? "s" : ""} ` +
            `verbatim, in the section${s} the finding${s} name${stillMissing.length === 1 ? "s" : ""}. ` +
            `This is a second pass on the SAME erratum edit, not a new one — change nothing else. Commit.\n` +
            branchPinClause(featureName),
          targetPath: upstreamPath,
          docType: target,
          dispatchKind: "authoring",
          phaseId: upstreamPhase,
          sessionKey: authorSessionKey(featureName, target, upstreamPhase),
        });

        stillMissing = await missingAgainst();
        if (stillMissing.length > 0) {
          const finalMissingClause = stillMissing
            .map((entry) => `- expected token \`${entry.token}\` (from: ${entry.text})`)
            .join("\n");
          const s2 = stillMissing.length === 1 ? "" : "s";
          notices.push(
            `Phase ${phaseId}: erratum round for ${target} — land-proof: ${stillMissing.length} ` +
              `literal-token item${s2} STILL did not land after one bounded re-dispatch (budget spent). ` +
              `Not halted here — confirmers are dispatched next and may still catch it — but the ` +
              `engine-side land-proof for this round is exhausted:\n${finalMissingClause}`
          );
          emit(notices[notices.length - 1]);
        }
      }
    }

    // Step 4c. The confirmation is the next round of the upstream document's own
    // append-only window — derived, never assumed (§3.6's pinned invariant).
    // The derivation happened above, before step 4b, for the reason stated there.
    const reviewers = upstream.reviewers;
    const confirmRoundPaths = (n) =>
      reviewers.map(
        (skill) =>
          `docs/${featureName}/CROSS-REVIEW-${reviewerRoleSlug(skill) || skill}-${target}-v${n}.md`
      );
    let round = window.startIndex;
    let confirmPaths = confirmRoundPaths(round);

    // The anchor pair is captured over the document as it stands AFTER the
    // erratum edit and BEFORE the confirmations are read — the same t0–t2 order
    // `reviewLoop` uses, so what is pinned is the bytes the approvers confirmed.
    const probe = await probeDocument(probeDocFn, upstreamPath, target);
    const anchorHash = (probe ? probe.hash : await hashFileFn(upstreamPath)) ?? null;
    const anchorNormalizedHash = await normalizedAnchorFor({
      probe,
      path: upstreamPath,
      _hashNormalizedFile: hashNormalizedFileFn,
    });
    const anchorCommit = await headCommitSha(gitFn);

    const dispatchConfirmers = (atRound, paths, state) =>
      parallelFn(
        reviewers.map((skill, i) =>
          wrappedDispatch({
            skill,
            basePrompt: erratumConfirmPrompt({
              feature: featureName,
              docType: target,
              docPath: upstreamPath,
              itemLines: confirmItemLines,
              round: atRound,
              reviewFile: paths[i],
              // DEC-ERR-03: the confirmers are pointed at the SAME upstream state
              // the author was re-grounded on, so the superset question they are
              // asked is answerable against the version the edit was made against.
              upstreamState: state,
            }),
            targetPath: paths[i],
            docType: target,
            dispatchKind: "review",
            phaseId: upstreamPhase,
            sessionKey: reviewerSessionKey(featureName, target, upstreamPhase, skill),
          })
        )
      );

    // The upstream premise BOTH confirmers are answering against. Held in one
    // variable, handed to both dispatches, so the two confirmers can never be
    // reading different versions of the world — POSTMORTEM-P's "three beliefs
    // inside four minutes" is exactly that divergence.
    let confirmUpstreamState = upstreamState;
    let responses = await dispatchConfirmers(round, confirmPaths, confirmUpstreamState);

    // ─── PLAN §3.3 — freeze the confirmation window ────────────────────────
    //
    // A confirmation round is a QUESTION about a premise: "given upstream as
    // it stands, does this edit resolve these items without breaking what was
    // approved?" A sibling erratum round landing in this document's upstream
    // chain while the confirmers are in flight silently changes the premise —
    // and the confirmers' answers, and the anchor about to be stamped, then
    // describe a version nobody evaluated (POSTMORTEM-P: REQ v1.9 landed
    // INSIDE the TSPEC confirmation window).
    //
    // So the state is re-derived after the confirmers return and compared with
    // the one they were dispatched against. On drift the round is not patched
    // up and not paper-stamped: the confirmers are re-dispatched ONCE, both on
    // the SAME re-derived state, into the NEXT derived round index (the window
    // is append-only — the first round's files stay on disk as history), and
    // only those responses are evaluated below. Bounded by construction: one
    // re-dispatch per confirmation, no loop.
    const reDerived = await deriveUpstreamState(target, null);
    if (upstreamStateLines(reDerived.upstreamState) !== upstreamStateLines(confirmUpstreamState)) {
      const before = new Map(confirmUpstreamState.map((e) => [e.docType, e.hash]));
      const movedInWindow = reDerived.upstreamState
        .filter((e) => before.has(e.docType) && before.get(e.docType) !== e.hash)
        .map((e) => e.docType);
      round = round + 1;
      confirmPaths = confirmRoundPaths(round);
      confirmUpstreamState = reDerived.upstreamState;
      const notice =
        `Phase ${phaseId}: erratum confirmation for ${target} — upstream MOVED INSIDE the ` +
        `confirmation window (${movedInWindow.join(", ") || "chain membership changed"}). The ` +
        `first confirmation round was evaluated against a premise that no longer holds; it is ` +
        `kept on disk as history and the confirmers are re-dispatched ONCE, both on the same ` +
        `re-derived upstream state, at round v${round} (PLAN §3.3).`;
      notices.push(notice);
      emit(notice);
      responses = await dispatchConfirmers(round, confirmPaths, confirmUpstreamState);
    }

    // ─── DEC-ERR-02 (2026-08-09): read the file when the trailer is unreadable ──
    //
    // This read used to be `parseVerdict(responses[i], skill)` and nothing else,
    // which made it the ONLY verdict read in the pipeline with no recovery at
    // all — and also the one whose failure mode is an immediate POSTMORTEM halt
    // rather than another round. `reviewLoop` at least re-asks on Haiku
    // (`recoverVerdict`, :7494). Here a single dropped trailer line ended the
    // run, on work that was already approved and anchored on disk.
    //
    // That is not hypothetical: on 2026-08-09 `te-review` confirmed the REQ
    // erratum for pdlc-consolidation-agent, wrote
    // `CROSS-REVIEW-test-engineer-REQ-v17.md` with `VERDICT: Approved with minor
    // changes`, zero High and both approval anchors, and returned a response
    // without a trailer. The orchestrator halted the phase naming that reviewer
    // as non-approving, seconds after that reviewer had committed its approval
    // to a file the orchestrator never opened.
    //
    // The two channels already have defined roles (CLAUDE.md, "Two parts of a
    // cross-review file are read as data"): the response trailer feeds the loop
    // inside the current invocation, and the FILE is what decides approval on a
    // later one. The file is the durable channel. Consulting it here is not a
    // new tolerance — it is the same authority `approvalSearch` reads at :6675,
    // through the same lenient parser (DEC-BAR-01/-02).
    //
    // The fallback is deliberately narrow, and the narrowness is the design:
    //
    //   - It fires ONLY when the trailer is `malformed` — absent, truncated, or
    //     outside the verdict catalogue. A trailer that legibly says "Needs
    //     revision" is a reviewer's decision and still halts; the file must
    //     never be able to overturn an explicit rejection.
    //   - Unreadable in BOTH channels still halts. Fail-closed is preserved:
    //     what is removed is the case where the orchestrator halts on a verdict
    //     that was legible the whole time, in the place it did not look.
    const verdicts = [];
    for (let i = 0; i < reviewers.length; i++) {
      const skill = reviewers[i];
      const trailer = parseVerdict(responses[i], skill);
      if (trailer.malformed !== true) {
        verdicts.push(trailer);
        continue;
      }

      // `readFileFn` may reject on a missing path (the default throws); a
      // fallback that cannot read is just the trailer's verdict, not an error.
      let fileText = null;
      try {
        fileText = await readFileFn(confirmPaths[i]);
      } catch {
        fileText = null;
      }
      const fromFile = extractFileVerdict(fileText, reviewerRoleSlug(skill) || skill);

      if (fromFile.ok && fromFile.malformed !== true) {
        emit(
          `Erratum confirmation (${target}, ${skill}): response trailer unreadable, ` +
            `verdict read from ${confirmPaths[i]} instead — ${fromFile.verdict} ` +
            `(high ${fromFile.high}).`
        );
        verdicts.push(fromFile);
      } else {
        // Reported even on failure, because "which channel decided" is the one
        // question an operator forensicating this halt has to answer, and it
        // cost an hour the first time it was not written down.
        emit(
          `Erratum confirmation (${target}, ${skill}): response trailer unreadable and ` +
            `${confirmPaths[i]} carries no readable verdict ` +
            `(${fromFile.ok ? "malformed" : fromFile.reason}) — failing closed.`
        );
        verdicts.push(trailer);
      }
    }

    // ─── PLAN §2.2 — the severity/provenance/locality gate ───────────────────
    //
    // Until v0.22.7 this site read exactly one bit — "did every confirmer say
    // pass?" — and spent the whole pipeline on the answer. It now reads the
    // confirmers' structured findings as well, because the three halts this
    // replaces were three DIFFERENT situations wearing one verdict:
    //
    //   - a one-noun miss inside the section the erratum had just edited
    //     (POSTMORTEM-PR) — fixable in one more pass, and now R3;
    //   - staleness the erratum did not introduce and was never asked to fix
    //     (POSTMORTEM-P) — the owning phase's work, and now R2;
    //   - a real, out-of-scope, delta-introduced defect — still a halt, R4.
    //
    // Findings are read from the response trailer and fall back to the
    // confirmation file, on exactly the DEC-ERR-02 reasoning above: two
    // channels, the file the durable one. A confirmer that says nothing
    // parseable in either channel is failed closed by `erratumGateDecision`.
    const confirmations = [];
    for (let i = 0; i < reviewers.length; i++) {
      let parsed = parseConfirmationFindings(responses[i]);
      if (parsed.findings.length === 0 && parsed.malformed.length === 0) {
        let fileText = null;
        try {
          fileText = await readFileFn(confirmPaths[i]);
        } catch {
          fileText = null;
        }
        const fromFile = parseConfirmationFindings(fileText ?? "");
        if (fromFile.findings.length > 0 || fromFile.malformed.length > 0) parsed = fromFile;
      }
      confirmations.push({
        source: reviewers[i],
        approving: isPassResult(verdicts[i]),
        findings: parsed.findings,
        malformed: parsed.malformed,
      });
    }

    const followUpAvailable = attempt < MAX_ERRATUM_FOLLOWUP_ROUNDS;
    const decision = erratumGateDecision({ confirmations, followUpAvailable });
    const roundLabel = attempt === 0 ? "erratum round" : `erratum follow-up round ${attempt}`;

    if (decision.rule === "R2") {
      // Inherited-only. NOT re-anchored: the approvers did not approve these
      // bytes, and an anchor here would record an approval nobody gave. The
      // owning phase is re-opened instead, and the pipeline moves forward.
      const entry = markApprovalReopened(reopenedApprovals, {
        docType: target,
        phase: upstreamPhase,
        reason:
          `phase ${phaseId}'s ${roundLabel} for ${target} closed with inherited findings only ` +
          `(gate rule R2).`,
      });
      const notice =
        `Phase ${phaseId}: ${roundLabel} for ${target} — confirmers did not approve, but NO High ` +
        `finding is tagged \`delta\` (gate rule R2). This is not an erratum failure: the findings ` +
        `are inherited staleness the erratum neither introduced nor was asked to fix. No POSTMORTEM ` +
        `was written, ${upstreamPath} was NOT re-anchored, and its recorded approval is RE-OPENED ` +
        `so phase ${entry ? entry.phase : upstreamPhase} runs again under its ordinary review ` +
        `budgets. Findings:\n${formatConfirmationFindings(decision.findings)}`;
      notices.push(notice);
      emit(notice);
      return {
        rule: "R2",
        responses: [
          { text: authorResponse, source: authorSkill },
          ...reviewers.map((skill, i) => ({ text: responses[i], source: skill })),
        ],
      };
    }

    if (decision.rule === "R3") {
      // Local, delta-introduced, and the follow-up budget is unspent: one more
      // targeted pass, whose item list is the confirmers' own findings. No
      // anchors — nothing has been approved yet.
      //
      // PLAN §2.4 items 1 and 4 — these findings bypass `admit()` entirely
      // (they never went through `routeErrata`'s minting), so the same
      // hygiene is applied here directly: normalized dedupe (two confirmers
      // restating the SAME finding at the same anchor collapse to one item,
      // union of sources), then the oracle-contract lint (a non-conforming
      // oracle item is reported, not routed).
      const rawFollowUpItems = decision.findings.map((f) => ({
        docType: target,
        item:
          `[${f.severity} | ${f.provenance} | ${f.locality}] ${f.section} — ${f.text}`,
        source: f.source ?? "(confirmation)",
      }));
      const followUpItems = [];
      for (const candidate of dedupeErrataEntries(rawFollowUpItems)) {
        const shortfall = oracleContractShortfall(candidate.item);
        if (shortfall.length > 0) {
          const oracleNotice =
            `Phase ${phaseId}: erratum follow-up finding for ${target} touches a test oracle but is ` +
            `missing ${shortfall.join(", ")} — reported as a malformed erratum, not routed: ` +
            `${candidate.item}`;
          notices.push(oracleNotice);
          emit(oracleNotice);
          continue;
        }
        followUpItems.push({ ...candidate, mintedHash: mintedHashes.get(target) ?? null });
      }
      const notice =
        `Phase ${phaseId}: ${roundLabel} for ${target} — confirmers did not approve, and every ` +
        `finding is \`local\` to the sections the erratum just edited (gate rule R3). Dispatching ` +
        `ONE follow-up erratum round (budget ${MAX_ERRATUM_FOLLOWUP_ROUNDS} per upstream doc per ` +
        `phase invocation) carrying the findings verbatim:\n` +
        `${formatConfirmationFindings(decision.findings)}`;
      notices.push(notice);
      emit(notice);
      return {
        rule: "R3",
        followUpItems,
        responses: [
          { text: authorResponse, source: authorSkill },
          ...reviewers.map((skill, i) => ({ text: responses[i], source: skill })),
        ],
      };
    }

    if (decision.rule === "R4") {
      // §2.4 item 5 — the payload is the FINDINGS, not the pre-edit routed
      // list. The historical payload named items that had already landed, at
      // line numbers that had already moved, which sent the post-mortem author
      // looking for defects that were not there. The routed list survives as
      // background, because "what was asked for" is still context.
      const spentClause = followUpAvailable
        ? ""
        : ` The follow-up budget of ${MAX_ERRATUM_FOLLOWUP_ROUNDS} round was already spent.`;
      await erratumPostmortemHalt({
        phaseId,
        label,
        reason:
          `Phase ${phaseId} halted: the delta confirmation of the ${target} erratum round did not ` +
          `pass — non-approving: [${decision.nonApproving.join(", ")}].${spentClause} Confirmer ` +
          `findings, verbatim:\n${formatConfirmationFindings(decision.findings)}\n` +
          `Background (the routed list this round was opened with, superseded by the findings ` +
          `above) — Erratum items against ${upstreamPath}: ${itemText}.`,
      });
    }

    // Both PASS ⇒ the confirmations carry the approval, anchored to the bytes
    // that were just confirmed. This is M-4's "no approval silently invalidated":
    // the upstream document's recorded approval now points at the edited file, so
    // the staleness gate does not re-open a phase the approvers just re-confirmed.
    await appendApprovalAnchors({
      paths: confirmPaths,
      hash: anchorHash,
      normalizedHash: anchorNormalizedHash,
      // PLAN §3.1/§3.3: the premise the confirmers actually answered against —
      // the re-derived one whenever the window froze, never the trailing sha
      // of a version they never saw.
      upstreamState: confirmUpstreamState.map((e) => ({ docType: e.docType, hash: e.hash })),
      commit: anchorCommit,
      _readFile: readFileFn,
      _probeDoc: probeDocFn,
      _appendFile: appendFileFn,
      _git: gitFn,
      emit,
    });

    // PLAN §3.2 — the edit that was just confirmed moved `target`, so every
    // approval BELOW it that was anchored against the old `target` is now
    // describing a version that no longer exists. Same pass, same run.
    await cascadeDownstream({ phaseId, target, editedIn: roundLabel });

    notices.push(
      `Phase ${phaseId}: ${roundLabel} for ${target} — ${confirmItemCount} item${confirmItemCount === 1 ? "" : "s"}, ` +
        `confirmed at round v${round} by ${reviewers.join(", ")}.`
    );

    return {
      rule: "R1",
      responses: [
        { text: authorResponse, source: authorSkill },
        ...reviewers.map((skill, i) => ({ text: responses[i], source: skill })),
      ],
    };
  }

  /**
   * Route every erratum this phase collected (§3.1 step 4).
   *
   * @returns {Promise<string>} a suffix for the phase's ✅ detail — `""` when the
   *   phase raised no erratum, which is the overwhelmingly common case and must
   *   leave every existing report string byte-identical.
   */
  async function routeErrata({ phaseId, docType, label, loop, creatorResult }) {
    /** Cross-batch dedupe key set (PLAN §2.4 item 1) — persists across while-loop
     *  iterations so a re-raised duplicate of an already-routed item is dropped,
     *  not re-routed a second time. */
    const seen = new Set();
    // `admit()` splits/lints/dedupes only — it does NOT stamp `mintedHash`.
    // Deliberately: `snapshotErratumDocs()` costs a read per upstream doc, and
    // `converge` calls `routeErrata` after every dispatch whether or not any
    // errata were raised. Snapshotting here, unconditionally, would pay that
    // cost on every ordinary (errata-free) dispatch too. The mint-time tag is
    // stamped afterward, once, only on the batch that survived to be routed.
    const admit = (entries) => {
      const split = [];
      for (const raw of entries) {
        if (!raw) continue;
        // PLAN §2.4 item 3: an item naming ≥2 doc types (word-boundary, never
        // substring) is one obligation with multiple homes — mint one item per
        // named type instead of guessing which home is authoritative.
        for (const entry of splitErratumMultiHome(raw)) {
          // An erratum naming the phase's OWN document is not an erratum at all —
          // it is an ordinary finding, and the loop that just converged is where
          // it belonged. Dropped silently, not routed.
          if (entry.docType === docType) continue;
          // PLAN §2.4 item 4: an item that touches an oracle (AT-/INV-/META- id
          // or the bare word "oracle(s)") but is missing the property statement,
          // non-subsumption rationale, or per-conjunct witness is malformed —
          // noted, not routed, never treated as a hard failure (fail-open).
          const shortfall = oracleContractShortfall(entry.item);
          if (shortfall.length > 0) {
            notices.push(
              `Phase ${phaseId}: erratum item against ${entry.docType} touches an oracle but is ` +
                `missing ${shortfall.join(", ")} — malformed erratum, not routed: \`${entry.item}\`.`
            );
            continue;
          }
          split.push(entry);
        }
      }
      const kept = [];
      // PLAN §2.4 item 1: normalized dedupe — items sharing docType + cited
      // anchor + expected token collapse to one, carrying union source
      // attributions, before the persistent cross-batch `seen` check below.
      for (const candidate of dedupeErrataEntries(split)) {
        const key = erratumDedupeKey(candidate.docType, candidate.item);
        if (seen.has(key)) continue;
        seen.add(key);
        kept.push(candidate);
      }
      return kept;
    };
    /** Stamps each entry with the hash of ITS OWN doc type at `mintedHashes`'s
     *  snapshot moment (PLAN §2.4 item 2's per-item half). */
    const tagMinted = (entries, hashes) =>
      entries.map((e) => ({ ...e, mintedHash: hashes.get(e.docType) ?? null }));

    const creatorSkill = PHASE_DISPATCH[phaseId].creator ?? PHASE_DISPATCH[phaseId].optimizer;
    let pending = admit([
      ...(Array.isArray(loop && loop.errata) ? loop.errata : []),
      // §3.1 step 2's last clause: `converge` additionally collects the creator's.
      ...parseErrata(creatorResult ?? "", (badType) =>
        notices.push(
          `Phase ${phaseId}: erratum line ignored — "${badType}" is not one of ` +
            `${ERRATUM_DOC_TYPES.join(", ")}.`
        )
      ).map((entry) => ({ ...entry, source: creatorSkill })),
    ]);
    if (pending.length === 0) return "";

    // DEC-ERR-03: the list has just been minted, so date it. Re-taken for each
    // follow-on batch below, because a follow-on list is a NEW mint and must be
    // dated against the tree the wave has already reshaped, not the original one.
    let mintedHashes = await snapshotErratumDocs();
    pending = tagMinted(pending, mintedHashes);

    /** Erratum rounds spent, per upstream doc, for THIS phase and invocation. */
    const spent = new Map();
    const routed = [];

    while (pending.length > 0) {
      const followOn = [];
      // Pipeline order, so a run that raises errata against two documents edits
      // them in the order the pipeline authored them.
      for (const target of ERRATUM_DOC_TYPES) {
        const items = pending.filter((entry) => entry.docType === target);
        if (items.length === 0) continue;

        const already = spent.get(target) ?? 0;
        if (already >= MAX_ERRATUM_ROUNDS_PER_DOC) {
          await erratumPostmortemHalt({
            phaseId,
            label,
            reason:
              `Phase ${phaseId} halted: further errata were raised against ` +
              `docs/${featureName}/${target}-${featureName}.md after its erratum round was already ` +
              `spent — the erratum bound of ${MAX_ERRATUM_ROUNDS_PER_DOC} round per upstream doc ` +
              `per phase is exhausted. Unaddressed items: ${items.map((e) => e.item).join("; ")}.`,
          });
        }
        spent.set(target, already + 1);

        // Step 4a. An erratum against a document that does not exist on this
        // branch is noise, not a halt: the phase says so and carries on.
        const upstreamPath = erratumDocPath(target);
        const exists = await checkFileFn(upstreamPath);
        if (!exists || !exists.ok) {
          notices.push(
            `Phase ${phaseId}: erratum round for ${target} skipped — no document at ${upstreamPath} ` +
              `(${items.length} item${items.length === 1 ? "" : "s"}).`
          );
          continue;
        }

        // PLAN §2.2 row R3 — the follow-up loop. Bounded by construction: the
        // attempt counter is the budget, `erratumRound` only answers R3 while
        // it is unspent, and a spent budget resolves the same confirmation to
        // R4. The loop condition is therefore a restatement of the constant,
        // not a second, independently-drifting one.
        const responses = [];
        let result = await erratumRound({ phaseId, label, target, items, mintedHashes });
        // DEC-ROUNDS-02: the upstream document is capped. Nothing was dispatched
        // and nothing was edited, so there is no round to report and no response
        // to read follow-on errata out of. `erratumRound` said so in a notice.
        if (result === null) continue;
        responses.push(...result.responses);
        for (let attempt = 1; result.rule === "R3" && attempt <= MAX_ERRATUM_FOLLOWUP_ROUNDS; attempt++) {
          result = await erratumRound({
            phaseId,
            label,
            target,
            items: result.followUpItems,
            mintedHashes,
            attempt,
          });
          if (result === null) break;
          responses.push(...result.responses);
        }
        routed.push(target);
        for (const reply of responses) {
          followOn.push(
            ...parseErrata(reply.text ?? "").map((entry) => ({
              ...entry,
              source: reply.source,
            }))
          );
        }
      }
      // A follow-on batch is a fresh mint (DEC-ERR-03), so it gets a fresh date.
      // Same laziness as the initial batch: only pay for a snapshot, and only
      // stamp `mintedHash`, when there is something left to route.
      pending = admit(followOn);
      if (pending.length > 0) {
        mintedHashes = await snapshotErratumDocs();
        pending = tagMinted(pending, mintedHashes);
      }
    }

    return routed.length > 0 ? ` — erratum rounds: ${routed.join(", ")}` : "";
  }

  // ─── PROPOSAL §3.1 — the convergence primitive ───────────────────────────
  //
  // R, F, T, D, P and PR were six copies of one ~40-line body: announce the
  // phase, run the gate, dispatch the creator, run the review loop, check
  // convergence, record the row. `converge` IS that body; the six call sites
  // below are the differences between them, stated as data. Nothing about the
  // order of operations changes — in particular the artifact path is still
  // pushed between the gate and the skip branch, so a skipped phase still
  // reports its document as an artifact of the run.
  //
  // The parameter surface is deliberately a little wider than today's six call
  // sites need: `afterConverged` is where a phase's own post-convergence gate
  // lives (Phase P's self-parse gate is the first tenant, the erratum protocol
  // will be the next), and `sessionKey` lets a phase that authors two documents
  // in one session name that session (PROPOSAL §3.2's T+D fold).
  //
  // @param {{
  //   phaseId: string,
  //   docType: string,
  //   docPath: string,
  //   inputs?: string[],              // defaults to PHASE_DISPATCH[phaseId].creatorInputs
  //   creatorPromptExtra?: string,    // appended to the creator prompt on its own line
  //   phaseLabelOverride?: string,    // the `phaseFn` banner; defaults to `Phase {id}: {label}`
  //   pushArtifact?: boolean,         // default true; false where docPath is already recorded
  //   pluralizeIterations?: boolean,  // default false — Phase R's "1 iteration" wording
  //   sessionKey?: string,            // overrides the creator's author session key
  //   afterConverged?: function,      // ({loop, creatorResult}) => string|undefined detail suffix
  // }} spec
  // @returns {Promise<{skipped: true} | {skipped: false, loop: object, creatorResult: string|null}>}
  async function converge({
    phaseId,
    docType,
    docPath,
    inputs,
    creatorPromptExtra,
    phaseLabelOverride,
    pushArtifact = true,
    pluralizeIterations = false,
    sessionKey,
    afterConverged,
  }) {
    const dispatch = PHASE_DISPATCH[phaseId];
    phaseFn(phaseLabelOverride ?? `Phase ${phaseId}: ${dispatch.label}`);

    const gate = await phaseGate({ phaseId, docType, docPath });
    if (pushArtifact) artifactPaths.push(docPath);
    if (gate.skip) return { skipped: true };

    // The creator. `creator: null` (Phase R) reviews a document this pipeline
    // did not write, so there is nothing to dispatch.
    let creatorResult = null;
    if (dispatch.creator) {
      const basePrompt = creatorPrompt(phaseId, featureName, inputs ?? dispatch.creatorInputs);
      creatorResult = await wrappedDispatch({
        skill: dispatch.creator,
        basePrompt: creatorPromptExtra ? `${basePrompt}\n${creatorPromptExtra}` : basePrompt,
        targetPath: docPath,
        docType,
        dispatchKind: "authoring",
        phaseId,
        sessionKey,
      });
      if (!creatorResult || creatorResult.trim() === "") {
        throw haltError(
          `Error: creator agent ${dispatch.creator} failed to produce ${docPath} for phase ${phaseId}`
        );
      }
    }

    const window = gate.window;
    const loop = await reviewLoop({
      doc: docPath,
      phase: phaseId,
      docType,
      reviewers: dispatch.reviewers,
      optimizer: dispatch.optimizer,
      feature: featureName,
      iteration: window.startIndex,
      startIndex: window.startIndex,
      endIndex: window.endIndex,
      // DEC-FRZ-01 — the gate's approval read, handed on rather than re-taken.
      priorApprovedRound: gate.priorApprovedRound ?? null,
      _parallel: parallelFn,
      _checkFile: checkFileFn,
      ...wrapperSeams,
    });
    checkConverged(
      loop,
      phaseId,
      dispatch.label,
      recordPhase,
      featureName,
      window.startIndex,
      window.endIndex
    );

    // §3.1 step 4 — the erratum protocol, between `checkConverged` and
    // `afterConverged`. Nothing here can change what this phase decided; it
    // routes signal this phase produced ABOUT ANOTHER document, and it may halt.
    const erratumSuffix = await routeErrata({
      phaseId,
      docType,
      label: dispatch.label,
      loop,
      creatorResult,
    });

    // The phase's own gate, past convergence. It may halt (Phase P does), and
    // it may contribute a suffix to the ✅ row's detail.
    const suffix = afterConverged ? await afterConverged({ loop, creatorResult }) : undefined;

    const iterationWord = pluralizeIterations
      ? `iteration${loop.iterations !== 1 ? "s" : ""}`
      : "iterations";
    const detail = `Approved (${loop.iterations} ${iterationWord})${erratumSuffix}${suffix ?? ""}`;
    recordPhase(phaseId, dispatch.label, "✅", forcedDetail(detail, gate.forced), loop.iterations);

    return { skipped: false, loop, creatorResult };
  }

  // ─── TSPEC-ENTRY-01: REQ path validation ─────────────────────────────────

  if (!reqPath || reqPath.trim() === "") {
    haltReason = `Error: no REQ path provided. Usage: /pdlc:orchestrate-dev docs/{feature}/REQ-{feature}.md`;
    return buildFinalReport({
      feature: "",
      outcome: "halted",
      phases,
      artifactPaths: [],
      testSummary: "Not run",
      harvestStatus: "Not run",
      haltReason,
    });
  }

  const PATTERN = /^docs\/([^/]+)\/REQ-\1\.md$/;
  const match = PATTERN.exec(reqPath);
  if (!match) {
    haltReason = `Error: REQ path does not match expected pattern docs/{feature}/REQ-{feature}.md — got: ${reqPath}`;
    return buildFinalReport({
      feature: "",
      outcome: "halted",
      phases,
      artifactPaths: [],
      testSummary: "Not run",
      harvestStatus: "Not run",
      haltReason,
    });
  }

  const featureName = match[1];

  // ─── TSPEC §5.7 / §6.2 row 12 — the forcePhases gate ──────────────────────
  //
  // An invalid token halts BEFORE any phase runs. The catalogue and the message
  // are rendered from the same array, so they cannot desynchronise.

  const forceParse = parseForcePhases(forcePhases);
  if (!forceParse.ok) {
    haltReason =
      `Error: invalid forcePhases token${forceParse.badTokens.length === 1 ? "" : "s"}: ` +
      `${forceParse.badTokens.join(", ")}. Valid: ${[...FORCE_PHASE_TOKENS, "all"].join(", ")}.`;
    return buildFinalReport({
      feature: featureName,
      outcome: "halted",
      phases,
      artifactPaths: [],
      testSummary: "Not run",
      harvestStatus: "Not run",
      haltReason,
    });
  }
  const forcedPhases = forceParse.phases;

  // ─── TSPEC-ENTRY-03: deterministic REQ file existence check ───────────────

  const reqCheck = await checkFileFn(reqPath);

  if (!reqCheck.ok) {
    if (reqCheck.reason === "file_empty") {
      haltReason = `Error: REQ file at ${reqPath} is empty`;
    } else {
      haltReason = `Error: REQ file not found at ${reqPath}`;
    }
    return buildFinalReport({
      feature: featureName,
      outcome: "halted",
      phases,
      artifactPaths: [],
      testSummary: "Not run",
      harvestStatus: "Not run",
      haltReason,
    });
  }

  // ─── Pipeline ─────────────────────────────────────────────────────────────

  const artifactPaths = [reqPath];
  let testSummary = "Not run";
  let harvestStatus = "Not run";
  let prUrl;
  let ciStatus;
  // TSPEC §10.1/§10.4: set only inside Phase MERGE, itself reachable only past
  // Phase PUB — a run that halts earlier never assigns this, so the success
  // path below always has a real MergeOutcome to read (Phase MERGE never
  // throws, FSPEC §2.1) and the halt path never reads it at all, relying
  // instead on `buildFinalReport`'s own `mergeStatus: "skipped"` default
  // (§11 row 23).
  let mergeOutcome;

  // ─── TSPEC §7.1 (PLAN A-25) — advisory config, read once per run, before the
  // phase loop (C-3). `advisoryRungState` is the resolution memo `runAdvisorySeam`
  // threads across every seam it dispatches this run (§3.4's "lazy, once per run").
  const advisoryConfigRaw = await readAdvisoryConfigFn(readFileFn, ADVISORY_CONFIG_PATH);
  const advisoryConfigResult = parseAdvisoryConfig(advisoryConfigRaw);
  // Read once, reused everywhere below (including the report-time S-1 gate) so the
  // tier's own master switch is inspected from source text exactly once here.
  const advisoryTierOn = advisoryConfigResult.config.enabled;
  if (advisoryTierOn && advisoryConfigResult.invalidKeys.length) {
    emit(`Advisory config: using defaults for ${advisoryConfigResult.invalidKeys.join(", ")}`);
  }
  const advisoryRungState = { resolved: null };
  // §9.4/S-1 — every disposition this run's advisory dispatches produce, in dispatch order.
  // Feeds `advisorySummaryRows` at report time so an enabled-but-quiet run still carries five
  // zero rows rather than `undefined` (T-10-5) — a disabled run leaves this empty and the field
  // itself absent below.
  const advisoryDispositions = [];
  // §10.2 N-4 — the one notice sink every advisory seam this run dispatches writes through. The
  // notices array is the same one Phase MERGE's escalations use and rides the same report field.
  const advisoryNotice = (line) => notices.push(line);
  // §9.4 S-3 — the two Phase PUB outcome booleans A5 deliberately does NOT fire on: `noChecks`
  // (A5-6, no check ever registered) and `completionCap` (A5-9, checks registered and never
  // completed). Both ride onto the advisory summary so an operator can tell either from an A5 row
  // that reads zero because the seam simply never fired. Mutated by Phase PUB (success path) and
  // by the halt handler (cap path); `false` on every run that reached neither.
  const advisoryPubOutcome = { noChecks: false, completionCap: false };

  // ─── TSPEC §8.1/§8.2 (PLAN A-26) — seam A5's composition root ─────────────
  // `raisePrAndVerifyCi` deliberately owns no seam construction: its `_runAdvisorySeam` DEFAULT is
  // the inert `escalated` stub that preserves the pre-existing halt for every caller that supplies
  // nothing. THIS is the binding that makes A5 real — it constructs the seam's `SeamOps` from the
  // pipeline's own transports (`gitFn`, `ghRunFn`, `checkCiFn`, `agentFn`) plus the once-per-run
  // config and rung memo, and threads the §4.3 wait accumulator through both ends: `recordWait`
  // into the seam, `waitMs` into the driver's `budgetExceeded` arithmetic.
  //
  // One accumulator per invocation (constructed inside the closure, not outside it): the carve-out
  // exists so a single seam invocation's CI waits do not consume that invocation's wall-clock
  // budget, not so waits accumulate across invocations.
  //
  // Bound only when the tier is ON — reusing `advisoryTierOn` above rather than re-reading the
  // flag. With the tier off, `_runAdvisorySeam` is left unset below, so `raisePrAndVerifyCi`
  // applies its inert default and the phase is byte-identical to the pre-advisory pipeline: no
  // capability probe runs, no `gh` process is spawned, and no advisory file is written.
  const runA5AdvisorySeam = async ({ seam, feature, prUrl }) => {
    const wait = makeWaitAccumulator();
    const a5Context = await gatherA5Context({ _git: gitFn });
    const seamOps = await buildA5SeamOps({
      feature,
      prUrl,
      preSeamHead: a5Context.preSeamHead,
      defaultBranch: a5Context.defaultBranch,
      mergeBase: a5Context.mergeBase,
      recordWait: wait.recordWait,
      _git: gitFn,
      _ghRun: ghRunFn,
      _checkCi: checkCiFn,
    });
    return runAdvisorySeamFn({
      seam,
      feature,
      seamOps,
      config: advisoryConfigResult.config,
      rungState: advisoryRungState,
      _agent: agentFn,
      _appendFile: appendFileFn,
      _writeFile: writeFileFn,
      _readFile: readFileFn,
      _git: gitFn,
      _log: emit,
      _now,
      _sleep,
      _notice: advisoryNotice,
      _waitMs: wait.waitMs,
    });
  };

  try {
    // The branch guard, once, BEFORE any phase runs: every artifact this run
    // writes — cross-reviews, spec revisions, implementation commits, the queue
    // row — is committed from this one working tree, so the branch it sits on is
    // established here rather than left to whichever agent commits first.
    await ensureFeatureBranch({ feature: featureName, _git: gitFn, _log: emit });

    await pipelineFn("PDLC Pipeline", async () => {
      // ─── Phase R: REQ Cross-Review ───────────────────────────────────────
      // No creator (`PHASE_DISPATCH.R.creator` is null — the REQ arrives
      // authored) and no artifact push (`reqPath` is already artifactPaths[0]).
      // The only phase whose ✅ detail pluralises "iteration".
      await converge({
        phaseId: "R",
        docType: "REQ",
        docPath: reqPath,
        pushArtifact: false,
        pluralizeIterations: true,
      });

      // ─── Phase F: FSPEC Creation + Review ───────────────────────────────
      const fspecPath = `docs/${featureName}/FSPEC-${featureName}.md`;
      await converge({ phaseId: "F", docType: "FSPEC", docPath: fspecPath });

      // ─── Phase T: TSPEC (+ DECISIONS) Creation + Review ──────────────────
      //
      // PROPOSAL §3.2 row 1 — "T absorbs D". D is no longer a top-level phase
      // body: the TSPEC and, when the trailer warrants it, the DECISIONS
      // document are authored and reviewed as ONE flow, by one author session,
      // with one reviewer set.
      //
      // ── The one deliberate deviation from §3.2's ideal, and why ────────────
      // §3.2 says DECISIONS is "reviewed in the same window" as the TSPEC. It
      // cannot literally be: §3.6 pins `deriveRoundWindow`'s per-docType,
      // content-addressed round derivation, and one `reviewLoop` reviews one
      // document — merging the two windows would make the round index of a
      // `CROSS-REVIEW-{role}-DECISIONS-v{N}` file depend on how many TSPEC
      // rounds happened to precede it, which is exactly the derivation that
      // invariant forbids. So the sanctioned reading, implemented here, is:
      //
      //   the D phase BODY disappears as a separate top-level section;
      //   DECISIONS is authored and reviewed INSIDE this section, immediately
      //   after the TSPEC converges, by the SAME author session (M-2) and the
      //   same reviewer set — while keeping its own docType round window, its
      //   own append-only cross-review files, its own phase-D POSTMORTEM
      //   lifecycle and gate, its own `D` forcePhases token, and its own `D`
      //   report row.
      //
      // What is compressed is the phase GRAPH, not the review bookkeeping.
      const tspecPath = `docs/${featureName}/TSPEC-${featureName}.md`;
      // The result is read below whether or not the phase ran: the
      // `DECISIONS_WARRANTED` read is downstream of the TSPEC's convergence and
      // must survive a skipped Phase T, where the trailer was never re-emitted.
      const tResult = await converge({
        phaseId: "T",
        docType: "TSPEC",
        docPath: tspecPath,
        creatorPromptExtra: decisionsWarrantedTrailerRequirement(),
      });

      // ─── TSPEC-DECISIONS-01: DECISIONS_WARRANTED read from Phase T ─────────
      // The trailer requirement is appended to the Phase T creator and optimizer
      // prompts, so its answer arrives inside the convergence loop — no separate
      // post-PASS agent session. The last optimizer result carries it; if the loop
      // converged on iteration 1 (no optimizer run) the creator result does.
      //
      // DEC-DW-01 (2026-08-09): a SKIPPED Phase T is not a missing trailer.
      // `converge` returns a bare `{skipped: true}` (:9502) — no `loop`, no
      // `creatorResult` — so this read used to collapse to `null` and take
      // `parseDecisionsWarranted`'s absent/malformed branch: a warning claiming
      // the field was "absent or malformed" when no agent had been asked for it,
      // and a default of `true` that contradicted this call site's own stated
      // intent. Two different situations arriving as one value.
      //
      // Skipping means TSPEC was already approved, so the answer was settled on
      // a previous run — and unlike the trailer, it left a durable trace. The
      // DECISIONS document either exists or it does not. Reading that is exact
      // where re-guessing was not: present ⇒ warranted (Phase D's own gate then
      // decides whether it still needs work), absent ⇒ a previous run judged it
      // unwarranted and there is nothing to author.
      //
      // This matters for idempotence, not cost. Defaulting `true` on a skip made
      // a re-run of a fully-approved pipeline author a DECISIONS document for a
      // feature that had correctly been judged not to need one — a new artifact
      // on a run that should have been a no-op.
      let decisionsWarranted;
      if (tResult.skipped) {
        // `checkFileFn` is the same existence probe the phase gates use, and it
        // returns `{ok, reason}` — not a boolean. Read `.ok`: the object itself
        // is always truthy, which would make every skip "warranted" and quietly
        // reintroduce the defect this branch exists to remove.
        const decisionsProbe = await checkFileFn(
          `docs/${featureName}/DECISIONS-${featureName}.md`
        );
        decisionsWarranted = decisionsProbe.ok === true;
        emit(
          `DECISIONS_WARRANTED: ${decisionsWarranted} — Phase T skipped on recorded ` +
            `approval, so no trailer was emitted; read from the DECISIONS document ` +
            `on disk instead (${decisionsWarranted ? "present" : decisionsProbe.reason}).`
        );
      } else {
        // The phase ran. A missing trailer here IS a real omission by an agent
        // that was explicitly asked for one, and `true` is the right
        // conservative default: author DECISIONS rather than silently lose them.
        decisionsWarranted = parseDecisionsWarranted(
          (tResult.loop && tResult.loop.lastOptimizerResult) ?? tResult.creatorResult ?? null
        );
      }

      // ─── DECISIONS (conditional), inside Phase T ─────────────────────────
      // The `Phase D:` banners and the `D` report row are preserved verbatim:
      // the report and pipeline oracles pin them, and an operator reading a run
      // log should still see the decision the trailer made, named as such.
      let decisionsPath = null;
      if (!decisionsWarranted) {
        phaseFn("Phase D: ⏭ Skipped");
        emit("Phase D skipped — no load-bearing alternatives");
        recordPhase("D", PHASE_DISPATCH.D.label, "⏭", "Skipped — no load-bearing alternatives");
      } else {
        decisionsPath = `docs/${featureName}/DECISIONS-${featureName}.md`;
        await converge({
          phaseId: "D",
          docType: "DECISIONS",
          docPath: decisionsPath,
          // M-2, and the whole point of the fold: the session that just wrote
          // the TSPEC writes the DECISIONS document, so the alternatives it
          // weighed while writing are still in context rather than re-derived
          // from the file. The disk record remains the durable fallback — with
          // no session transport installed `sessionBoundAgent` returns the
          // plain `_agent` and this is a fresh dispatch that re-reads the TSPEC,
          // exactly as before.
          sessionKey: authorSessionKey(featureName, "TSPEC", "T"),
        });
      }

      // ─── Phase P: PLAN Creation + Review ────────────────────────────────
      const planPath = `docs/${featureName}/PLAN-${featureName}.md`;
      const pInputs = [...PHASE_DISPATCH.P.creatorInputs.filter(i => i !== "DECISIONS?")];
      if (decisionsPath) pInputs.push("DECISIONS");
      await converge({
        phaseId: "P",
        docType: "PLAN",
        docPath: planPath,
        inputs: pInputs,
        afterConverged: async () => {
          // ─── PROPOSAL §3.3 — the PLAN self-parse gate ─────────────────────────
          //
          // The mechanical parser, not Phase I, is the authority on whether this PLAN
          // can be executed. A PLAN whose task table `parsePlanTasks` cannot read is
          // rejected HERE, while the author's session and the reviewers are still on
          // the phase — rather than discovered several phases later, at Phase I, where
          // the only recourse was an LLM re-extraction of a table that a human had
          // already approved. The gate runs only when the phase actually ran: a
          // SKIPPED Phase P is a recorded approval over unchanged bytes, and Phase I
          // remains the single gate on that path, exactly as before.
          const pPlanText = await readFileFn(planPath);
          const pParsed = parsePlanTasks(pPlanText);
          if (!pParsed || !Array.isArray(pParsed.tasks) || pParsed.tasks.length === 0) {
            const detail =
              `Error: Phase P — the task table in ${planPath} could not be parsed by the ` +
              `mechanical parser, so the implementation phase would have no task graph. ` +
              `Reshape the PLAN's task table: its header row must carry an exact 'Task ID' ` +
              `cell (or 'ID' / '#') and an exact 'Dependencies' cell (or 'Deps' / ` +
              `'Depends On'), one markdown table row per task, and every dependency cell ` +
              `must list task ids ('-' for none). Rejecting at Phase P rather than ` +
              `discovering it at Phase I.`;
            recordPhase("P", PHASE_DISPATCH.P.label, "❌", detail);
            throw haltError(detail);
          }
          // Row/cell-level unknown-id check, BEFORE cycle detection: an id typo'd
          // into a Deps cell would otherwise surface as an opaque "graph contains
          // a cycle" (an unresolved dependency can never become ready, which
          // topologicalReadySets can't distinguish from a true cycle). Catching
          // it here names the offending row and cell instead.
          const pUnknownDeps = findUnknownPlanDepsIds(pPlanText);
          if (pUnknownDeps.length > 0) {
            const detail =
              `Error: Phase P — the task table in ${planPath} names dependency ids that ` +
              `are not any task's id: ${pUnknownDeps.join("; ")}. Fix the PLAN's ` +
              `Dependencies column so every id it names is another task's id. Rejecting ` +
              `at Phase P rather than discovering it at Phase I.`;
            recordPhase("P", PHASE_DISPATCH.P.label, "❌", detail);
            throw haltError(detail);
          }
          let pBatches;
          try {
            pBatches = computeTopologicalBatches(pParsed.tasks);
          } catch (cycleErr) {
            const detail =
              `Error: Phase P — the task graph in ${planPath} cannot be executed. ` +
              `${(cycleErr && cycleErr.message) || String(cycleErr)} ` +
              `Fix the PLAN's Dependencies column (every id it names must be another ` +
              `task's id, and the edges must form a DAG). Rejecting at Phase P rather ` +
              `than discovering it at Phase I.`;
            recordPhase("P", PHASE_DISPATCH.P.label, "❌", detail);
            throw haltError(detail);
          }

          // ─── PROPOSAL §3.3 — the file-ownership manifest half of the same gate ─
          //
          // M-5: the manual run executed twelve same-tree waves with zero merge
          // conflicts because no two tasks in a wave touched the same file. That is a
          // property of the PLAN, and a PLAN that does not state file ownership cannot
          // be checked for it. So the manifest is required HERE — where the author's
          // session and the reviewers are still on the phase — rather than discovered
          // at Phase I, which would have no recourse but to fall back to worktrees.
          const pOwnershipParsed = parsePlanOwnership(pPlanText);
          const pNearMisses = pOwnershipParsed ? pOwnershipParsed.nearMisses || [] : [];
          if (pOwnershipParsed == null || pOwnershipParsed.ownership == null) {
            // A near miss (header matches ONE of the two required column sets)
            // is rejected loudly and specifically — never folded into the
            // generic "no manifest at all" message below. A manifest may be
            // rejected loudly; it may never be invisible.
            const detail =
              pNearMisses.length > 0
                ? `Error: Phase P — ${planPath}'s file-ownership manifest has a header row ` +
                  `that matches only one side of the required contract: ` +
                  pNearMisses
                    .map(
                      (nm) =>
                        `"${nm.headerRow}" matched the ${nm.matchedSide} side but not the ` +
                        `other (accepted spellings for the missing side: ${nm.expectedForms.join(", ")})`
                    )
                    .join("; ") +
                  `. Fix the header row so it carries an exact cell from both sets — ` +
                  `se-author's batch-safety rule 2. Rejecting at Phase P rather than ` +
                  `discovering it at Phase I.`
                : `Error: Phase P — ${planPath} carries no file-ownership manifest, so the ` +
                  `implementation phase cannot derive same-tree waves and cannot know which ` +
                  `files each task may write. Add a markdown table whose header row carries an ` +
                  `exact 'Task' cell (or 'Task ID' / 'ID' / 'Owning Task') and an exact 'Files' ` +
                  `cell (or 'Owned Files' / 'Files Created or Appended'), one row per task, ` +
                  `each row listing that task's owned paths in backticks — se-author's ` +
                  `batch-safety rule 2. Rejecting at Phase P rather than discovering it at ` +
                  `Phase I.`;
            recordPhase("P", PHASE_DISPATCH.P.label, "❌", detail);
            throw haltError(detail);
          }
          const pContract = validatePlanContract(pParsed.tasks, pOwnershipParsed.ownership);
          if (!pContract.ok) {
            const detail =
              `Error: Phase P — the task table and the file-ownership manifest in ` +
              `${planPath} disagree: ${pContract.problems.join("; ")}. Every task in the ` +
              `task table needs exactly one manifest row, and every manifest row needs a ` +
              `task — se-author's batch-safety rule 2. Rejecting at Phase P rather than ` +
              `discovering it at Phase I.`;
            recordPhase("P", PHASE_DISPATCH.P.label, "❌", detail);
            throw haltError(detail);
          }
          const pWaves = computeWaves(pParsed.tasks, pOwnershipParsed.ownership);

          // The gate's own contribution to the ✅ row: what the mechanical parser
          // read out of the approved PLAN. `converge` appends it to the detail.
          return (
            `; PLAN parses to ${pParsed.tasks.length} tasks in ` +
            `${pBatches.length} batches, ${pWaves.length} waves`
          );
        },
      });

      // ─── Phase PR: PROPERTIES Creation + Review ──────────────────────────
      const propertiesPath = `docs/${featureName}/PROPERTIES-${featureName}.md`;
      await converge({ phaseId: "PR", docType: "PROPERTIES", docPath: propertiesPath });

      // ─── Phase I: Implementation ─────────────────────────────────────────
      phaseFn("Phase I: Implementation");

      // TSPEC-IMPL-01: PLAN DAG parsing. Parse the PLAN task table in-script
      // first — a markdown table needs no LLM. Only if the table is not parseable
      // (e.g. dependencies live in prose) fall back to the extraction agent, which
      // runs on Haiku since this is mechanical extraction, not reasoning.
      let tasks;
      const iPlanText = await readFileFn(planPath);
      const planParsed = parsePlanTasks(iPlanText);
      if (planParsed && Array.isArray(planParsed.tasks) && planParsed.tasks.length > 0) {
        tasks = planParsed.tasks;
      } else {
        const dagAgentResult = await agentFn(
          "se-author",
          `Read docs/${featureName}/PLAN-${featureName}.md and extract the task table. ` +
            `Return a JSON object with this exact structure: ` +
            `{"tasks": [{"id": "TASK-01", "description": "...", "dependencies": ["TASK-00"], "planBatch": 1}]}`,
          { model: "haiku" }
        );

        try {
          const parsed = JSON.parse(dagAgentResult);
          if (!parsed || !Array.isArray(parsed.tasks)) {
            throw new Error("Invalid schema");
          }
          tasks = parsed.tasks;
        } catch {
          throw haltError(
            "Error: PLAN parsing agent failed to return structured task list"
          );
        }
      }

      // ─── PROPOSAL §3.3 — wave mode vs the worktree exception path ─────────
      //
      // Phase P rejects a PLAN with no valid ownership manifest, so on the normal
      // route this is always wave mode. LEGACY mode is still reachable, and by
      // exactly one route: Phase P was SKIPPED on a recorded approval, and the
      // approved PLAN predates the manifest requirement. That PLAN gets today's
      // behaviour byte for byte — worktree isolation, merge-back, the full
      // self-report batch gate — because it was approved under those rules.
      const iOwnershipParsed = parsePlanOwnership(iPlanText);
      const iOwnership = iOwnershipParsed ? iOwnershipParsed.ownership : null;
      const iContract = iOwnership ? validatePlanContract(tasks, iOwnership) : null;
      const waveMode = Boolean(iOwnership) && iContract !== null && iContract.ok === true;

      if (!waveMode) {
        emit(
          "Implementation: no valid file-ownership manifest on this PLAN — running the " +
            "worktree exception path (isolated batches, merge-back, self-report gate)."
        );

        // TSPEC-IMPL-02: Topological batching
        const batches = computeTopologicalBatches(tasks);

        // TSPEC-IMPL-03: Batch plan logging — must precede first agent() call
        emit("Implementation batch plan:");
        for (let i = 0; i < batches.length; i++) {
          const deps = batches[i].some((t) => t.dependencies.length > 0)
            ? `  (depends on: Batch ${i})`
            : "";
          emit(
            `  Batch ${i + 1}: [${batches[i].map((t) => t.id).join(", ")}]${deps}`
          );
        }
        emit(`  Total: ${tasks.length} tasks in ${batches.length} batches`);

        // TSPEC-IMPL-04: Per-batch se-implement dispatch
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
          const batch = batches[batchIndex];
          phaseFn(
            `Phase I: Batch ${batchIndex + 1}/${batches.length}`
          );

          const batchResults = await parallelFn(
            batch.map((task) =>
              agentFn(
                "se-implement",
                implementPrompt(task, featureName),
                { isolation: "worktree", model: MODEL_IMPLEMENTATION }
              )
            )
          );

          // TSPEC-IMPL-05: Worktree merge-back
          // The Claude Code runtime handles worktree isolation and merge-back automatically
          // when agents are called with { isolation: "worktree" } (Assumption A2).
          // mergeWorktree() is the testable implementation for environments where the
          // runtime does not handle this transparently.
          for (let i = 0; i < batch.length; i++) {
            const task = batch[i];
            const worktreeBranch = `feat-${featureName}-${task.id}-worktree`;
            const mergeResult = await mergeWorktreeFn(".", worktreeBranch, `feat-${featureName}`);
            if (mergeResult && mergeResult.ok === false) {
              const fileList = (mergeResult.conflictingFiles || []).join(", ") || "(unknown)";
              throw haltError(
                `Error: merge conflict merging worktree for task ${task.id} into feat-${featureName} — conflicting files: ${fileList}. Pipeline halted.`
              );
            }
          }

          // TSPEC-IMPL-06: Per-batch test gate
          evaluateBatchGate(batchResults, batchIndex, batch);
        }

        recordPhase("I", "Implementation", "✅", "All batches complete");

        // ─── PROPERTIES tests, legacy path (PROPOSAL §3.2 row 2) ───────────
        //
        // The worktree exception path keeps yesterday's Phase PT byte for byte —
        // one Opus `se-implement` dispatch, gated by `evaluateSingleAgentGate`
        // on the agent's own report. A PLAN that reached this branch was
        // approved under those rules (Phase P skipped on a recorded approval,
        // no ownership manifest), so it is executed under them: there is no
        // wave to append a V-wave to, and no script-owned gate to verify with.
        phaseFn("Phase PT: PROPERTIES Tests");
        const ptResult = await agentFn(
          "se-implement",
          propertiesTestPrompt(featureName)
        );
        const ptGate = evaluateSingleAgentGate(ptResult, "PT");
        if (!ptGate.passed) {
          throw haltError(ptGate.reason);
        }
      } else {
      // ─── Wave mode (M-5 + M-6) ────────────────────────────────────────────
      const waves = computeWaves(tasks, iOwnership);

      const implRaw = await readMergeConfigSafely(readFileFn, MERGE_CONFIG_PATH);
      const implParsed = parseImplementationConfig(implRaw);
      const implConfig = implParsed.config;
      if (implParsed.sectionMalformed) {
        emit(
          `Notice: the "implementation" section of ${MERGE_CONFIG_PATH} is not an object — ` +
            `using defaults for every implementation key.`
        );
      }
      for (const key of implParsed.invalidKeys) {
        emit(
          `Notice: implementation.${key} in ${MERGE_CONFIG_PATH} is not a valid value — ` +
            `using the default.`
        );
      }

      // M-6: the orchestrator owns the gate. It can only own it when it has BOTH
      // halves — a command that constitutes the suite in this repo, and a
      // transport to run it through. Missing either, the gate degrades to the
      // legacy self-report scan and says which half is missing, once.
      const scriptGate =
        Boolean(implConfig.testCommand) && typeof runCommandFn === "function";
      if (!scriptGate) {
        const missing = [];
        if (!implConfig.testCommand) missing.push(`implementation.testCommand in ${MERGE_CONFIG_PATH}`);
        if (typeof runCommandFn !== "function") missing.push("the _runCommand transport");
        emit(
          `Notice: the script-owned test gate is unavailable — ${missing.join(" and ")} ` +
            `${missing.length > 1 ? "are" : "is"} absent. Falling back to the agents' ` +
            `self-reported test results for every wave of this run.`
        );
      }

      // The git transport, resolved the way the branch guard resolves it: a unit
      // test that injects none keeps `defaultGit`, and must not have real commits
      // made underneath it.
      const waveGit = branchGuardTransport(gitFn);
      if (!waveGit) {
        emit(
          "Notice: no git transport is injected — wave work will be verified but NOT " +
            "committed by the orchestrator."
        );
      }
      const waveSleep = typeof _sleep === "function" ? _sleep : sleep;

      emit("Implementation wave plan:");
      for (let i = 0; i < waves.length; i++) {
        emit(`  Wave ${i + 1}: [${waves[i].map((t) => t.id).join(", ")}]`);
      }
      emit(
        `  Total: ${tasks.length} tasks in ${waves.length} waves ` +
          `(same tree, file-ownership disjoint)`
      );

      // Resume pointer (`implementation.startWave`). A pointer past the end of
      // the plan is not a halt: the plan may have been re-derived since the
      // halted run, and the safe reading of an out-of-range resume point is to
      // run everything rather than to run nothing.
      let startWave = implConfig.startWave;
      // An explicit pointer is an operator's instruction and outranks the
      // script's own ledger — including when it is out of range and clamps back
      // to 1, which is still an operator asking for a full run.
      const explicitPointer = startWave > 1;
      if (startWave > waves.length) {
        emit(
          `Notice: implementation.startWave=${startWave} in ${MERGE_CONFIG_PATH} is past the ` +
            `last wave of this plan (${waves.length}) — running every wave from 1.`
        );
        startWave = 1;
      }
      if (startWave > 1) {
        // Safety property: skipping a wave skips only its DISPATCH. The first
        // executed wave's script-owned gate runs the full suite over the whole
        // tree, so the skipped waves' already-committed work is verified by that
        // gate before this run commits anything new.
        emit(
          `Resuming at wave ${startWave} of ${waves.length} (implementation.startWave). ` +
            `Waves 1–${startWave - 1} are skipped as previously completed; the first ` +
            `executed wave's gate still verifies the whole tree. Clear ` +
            `implementation.startWave before the next fresh run.`
        );
      }

      // ── INTERIM wave ledger (see WAVE_STATE_PATH) — the automatic half of the
      // resume pointer. Read through the same never-throwing reader the config
      // uses; every rejection below is a notice and a full run, never a halt.
      const planHash = computePlanHash(waves);
      let ledgerResume = false;
      let allWavesRecorded = false;
      if (!explicitPointer) {
        const ledgerRaw = await readMergeConfigSafely(readFileFn, WAVE_STATE_PATH);
        const ledger = parseWaveLedger(ledgerRaw);
        const ignore = (why) =>
          emit(
            `Notice: the wave ledger ${WAVE_STATE_PATH} was ignored — ${why}. ` +
              `Running every wave from 1.`
          );

        // The tree-side corroboration. `feature` and `planHash` are both
        // functions of the PLAN document, so neither can tell a finished tree
        // from one that was `git reset --hard` or re-cut from the default branch
        // since the record was written — and the ledger file is untracked, so it
        // survives both. The recorded commit must still be reachable from HEAD;
        // ancestry rather than equality, because every later phase (CR, DOD, PUB)
        // legitimately moves HEAD forward and the resume case is exactly a
        // re-invocation after those.
        const headCorroborated = async (recordedHead) => {
          if (!recordedHead) return true; // pre-`head` record: honoured as before
          const transport = branchGuardTransport(gitFn);
          if (!transport) return true; // no transport to ask — not evidence of absence
          try {
            const reply = await transport([
              "merge-base",
              "--is-ancestor",
              recordedHead,
              "HEAD",
            ]);
            return !!(reply && reply.ok === true);
          } catch {
            return true; // an unavailable probe is not a staleness claim
          }
        };

        if (ledger.reason) {
          ignore(ledger.reason);
        } else if (ledger.state) {
          const recorded = ledger.state;
          if (recorded.feature !== featureName) {
            ignore(
              `it records feature "${recorded.feature}", not "${featureName}"`
            );
          } else if (recorded.planHash !== planHash) {
            ignore("the PLAN's wave layout has changed since it was written");
          } else if (!(await headCorroborated(recorded.head))) {
            ignore(
              `the commit it records (${String(recorded.head).slice(0, 12)}) is not an ` +
                `ancestor of HEAD — the branch was reset or re-cut since it was written, ` +
                `so the work it records is not in this tree`
            );
          } else if (recorded.lastGreenWave > waves.length) {
            ignore(
              `it records ${recorded.lastGreenWave} wave(s) green and this plan has ` +
                `only ${waves.length}`
            );
          } else if (recorded.lastGreenWave === waves.length) {
            // A COMPLETE ledger: every wave of this exact plan was committed and
            // recorded green by an earlier run. Honouring it is what makes a
            // post-Phase-I re-invocation (a halt in CR, DOD or PUB) resume in
            // minutes instead of re-dispatching every wave over a finished tree.
            // The feature and planHash matches above are what make it safe: any
            // PLAN change re-derives a different hash and runs every wave.
            startWave = waves.length + 1;
            ledgerResume = true;
            allWavesRecorded = true;
            emit(
              `Skipping Phase I (wave ledger ${WAVE_STATE_PATH}): all ` +
                `${waves.length} waves of this plan were committed and recorded ` +
                `green by an earlier run. Delete ${WAVE_STATE_PATH} to force a ` +
                `full run.`
            );
          } else {
            startWave = recorded.lastGreenWave + 1;
            ledgerResume = true;
            emit(
              `Resuming at wave ${startWave} of ${waves.length} (wave ledger ` +
                `${WAVE_STATE_PATH}). Waves 1–${recorded.lastGreenWave} were committed ` +
                `and recorded green by an earlier run of this same plan; the first ` +
                `executed wave's gate still verifies the whole tree. Delete ` +
                `${WAVE_STATE_PATH} to force a full run.`
            );
          }
        }
      }

      // Best-effort ledger write: a ledger this run cannot write costs the NEXT
      // run its resume, and nothing else, so a failure is a notice.
      const writeWaveLedger = async (contents, what) => {
        try {
          await writeFileFn(WAVE_STATE_PATH, contents);
        } catch (err) {
          emit(
            `Notice: could not ${what} the wave ledger ${WAVE_STATE_PATH} — ` +
              `${(err && err.message) || String(err)}. The run continues; a later ` +
              `invocation will simply start from wave 1.`
          );
        }
      };

      for (let waveIndex = 0; waveIndex < waves.length; waveIndex++) {
        const wave = waves[waveIndex];
        const waveNum = waveIndex + 1;
        if (allWavesRecorded) break;
        if (waveNum < startWave) {
          emit(
            `Wave ${waveNum}/${waves.length}: skipped (` +
              (ledgerResume
                ? `wave ledger: waves 1–${startWave - 1} already green`
                : `implementation.startWave=${startWave}`) +
              `)`
          );
          continue;
        }
        phaseFn(`Phase I: Wave ${waveNum}/${waves.length}`);

        // SAME TREE, in parallel: no `isolation: "worktree"`. Disjoint ownership
        // is what replaces isolation, and it is the PLAN's claim, gated at Phase P.
        const waveResults = await parallelFn(
          wave.map((task) =>
            agentFn("se-implement", waveImplementPrompt(task, featureName), {
              model: MODEL_IMPLEMENTATION,
            })
          )
        );

        // Dispatch-level failures halt whatever the gate is (rules 1 and 3).
        evaluateWaveDispatch(waveResults, waveIndex, wave);

        // The build runs BEFORE the test gate: a wave that edits workflow
        // sources leaves the generated artifacts stale, and the suite itself
        // asserts their freshness (runtimeBundle.test.js) — gating first would
        // red every source-editing wave for its own unbuilt outputs. A build
        // that fails is still a red wave in its own right: the suite can pass
        // against sources whose generated artifacts no longer match them.
        let postWaveRan = false;
        if (implConfig.postWaveCommand && typeof runCommandFn === "function") {
          const post = await runCommandFn(implConfig.postWaveCommand);
          if (!post || post.ok !== true) {
            throw haltError(
              `Error: Wave ${waveNum} post-wave command failed — ` +
                `\`${implConfig.postWaveCommand}\` did not pass. ` +
                `Output tail:\n${outputTail(post && post.output)}`
            );
          }
          postWaveRan = true;
          emit(`Wave ${waveNum} post-wave: \`${implConfig.postWaveCommand}\` passed`);
        }

        if (scriptGate) {
          const gate = await runCommandFn(implConfig.testCommand);
          if (!gate || gate.ok !== true) {
            throw haltError(
              `Error: Wave ${waveNum} test gate failed — \`${implConfig.testCommand}\` ` +
                `did not pass. Output tail:\n${outputTail(gate && gate.output)}`
            );
          }
          emit(`Wave ${waveNum} gate: \`${implConfig.testCommand}\` passed`);
        } else {
          evaluateBatchGate(waveResults, waveIndex, wave);
        }

        // A green gate is only worth something if the wave's tests actually ran.
        // The un-skip guard runs AFTER the gate and BEFORE the commits, so a
        // vacuous green halts the wave with its work uncommitted, exactly as a
        // red gate does.
        const unskip = await checkWaveUnskips({
          waves,
          waveIndex,
          _readFile: readFileFn,
        });
        for (const notice of unskip.notices) {
          emit(`Notice: Wave ${waveNum} un-skip guard: ${notice}`);
        }
        if (unskip.violations.length > 0) {
          throw haltError(formatUnskipViolations(waveNum, unskip.violations));
        }
        if (unskip.scanned.length > 0) {
          emit(
            `Wave ${waveNum} un-skip guard: ${unskip.scanned.length} owned test ` +
              `file(s) scanned, no skipped block owed by a completed task`
          );
        }

        // Only now — verified — does anything get committed (M-6).
        if (waveGit) {
          for (const task of wave) {
            const paths = Array.isArray(task.files) ? task.files : [];
            if (paths.length === 0) {
              emit(
                `Wave ${waveNum} task ${task.id}: no owned paths in the manifest — nothing to commit`
              );
              continue;
            }
            await commitPaths({
              paths,
              message: waveCommitMessage(featureName, task),
              what: `Wave ${waveNum} task ${task.id}`,
              _git: waveGit,
              _sleep: waveSleep,
              emit,
            });
          }

          if (postWaveRan && implConfig.postWavePathspecs.length > 0) {
            await commitPaths({
              paths: implConfig.postWavePathspecs,
              message: `chore(${featureName}): wave ${waveNum} build outputs`,
              what: `Wave ${waveNum} build outputs`,
              _git: waveGit,
              _sleep: waveSleep,
              emit,
            });
          }

          // The ledger records COMMITTED waves only, which is why it is written
          // here and not next to the gate: without a git transport this run made
          // no commits, and recording the wave green would strand that wave's
          // uncommitted work — a later resume would skip a wave whose work no
          // longer exists in the tree.
          // The commit this wave's work landed on, stamped so a later invocation
          // can corroborate the record against the tree (see `formatWaveLedger`).
          // Best-effort: a transport that cannot answer costs the next run its
          // corroboration, never this run its record.
          let waveHead = null;
          if (waveGit) {
            try {
              const rev = await waveGit(["rev-parse", "HEAD"]);
              if (rev && rev.ok === true) waveHead = String(rev.stdout ?? "").trim() || null;
            } catch {
              waveHead = null;
            }
          }
          await writeWaveLedger(
            formatWaveLedger(featureName, planHash, waveNum, waveHead),
            `record wave ${waveNum} in`
          );
        }
      }

      // Every implementation wave is green and committed. The record is KEPT —
      // the last per-wave write already says `lastGreenWave === waves.length`,
      // and the resume path above honours exactly that shape, so a later
      // invocation of this same plan (a halt in CR, DOD or PUB) skips Phase I
      // instead of re-dispatching every wave over a finished tree. Staleness is
      // guarded where it always was: any PLAN change re-derives a different
      // planHash and the ledger is ignored.

      if (allWavesRecorded) {
        recordPhase(
          "I",
          "Implementation",
          "⏭",
          `Skipped — all ${waves.length} waves previously committed and ` +
            `recorded green (wave ledger)`
        );
      } else {
        recordPhase(
          "I",
          "Implementation",
          "✅",
          `All ${waves.length} waves complete (wave mode, ` +
            `${scriptGate ? "script-owned gate" : "self-report gate"})`
        );
      }

      // ─── PROPOSAL §3.2 row 2 — Phase PT becomes Phase I's final V-wave ────
      //
      // Phase PT was one more agent dispatch and one more gate with no distinct
      // review of its own; the PLAN's V1 task already models it as the last
      // implementation task. So in wave mode it IS the last wave — wave
      // `waves.length + 1`, run after the last implementation wave has been
      // gated and committed, with the PROPERTIES suite as its subject.
      //
      // ── Commit discipline for the V-wave, and why it differs from a wave ──
      // Every other wave member is dispatched with "do NOT commit" and the
      // script commits its work pathspec-scoped, because the manifest says
      // exactly which files that task owns. The V-wave has NO manifest row: the
      // set of test files it creates is a property of the PROPERTIES document
      // and of the repo's test layout, not something this script can derive —
      // and the alternative, `git add -- .`, is precisely the add-all this
      // pipeline never does. So the V-wave is the one wave-mode dispatch that
      // still commits its OWN work (legacy discipline: `propertiesTestPrompt`
      // carries the branch pin and instructs a commit only once the full suite
      // is green), and the script runs the SAME script-owned gate AFTERWARDS as
      // verification rather than as permission. A red gate therefore halts over
      // work that is already committed — which is recoverable and named as
      // such: the halt quotes the command and the output tail, and the commit
      // is on the feature branch where the next run, or a human, can fix it.
      phaseFn("Phase PT: PROPERTIES Tests (Phase I V-wave)");
      const vWaveNum = waves.length + 1;
      const vResult = await withDispatchRetry(
        () =>
          agentFn(
            "se-implement",
            propertiesTestPrompt(featureName),
            { model: MODEL_IMPLEMENTATION }
          ),
        { label: `V-wave ${vWaveNum} PROPERTIES tests`, emit }
      );

      // Dispatch-level failures halt whatever the gate is, exactly as for every
      // other wave (rules 1 and 3).
      evaluateWaveDispatch([vResult], waves.length, [{ id: "PROPERTIES tests" }]);

      if (scriptGate) {
        const vGate = await runCommandFn(implConfig.testCommand);
        if (!vGate || vGate.ok !== true) {
          throw haltError(
            `Error: V-wave ${vWaveNum} PROPERTIES test gate failed — ` +
              `\`${implConfig.testCommand}\` did not pass. The V-wave's work is ` +
              `already committed on feat-${featureName}, so this is recoverable. ` +
              `Output tail:\n${outputTail(vGate && vGate.output)}`
          );
        }
        emit(`V-wave ${vWaveNum} gate: \`${implConfig.testCommand}\` passed`);
      } else {
        // No script-owned gate on this run: the agent's self-report is the only
        // evidence there is, so PT's own gate is what reads it.
        const vSelfGate = evaluateSingleAgentGate(vResult, "PT");
        if (!vSelfGate.passed) {
          throw haltError(vSelfGate.reason);
        }
      }
      }

      // The PT row is unchanged on purpose: §3.2's compression is
      // execution-structural, not report-shape. Both the V-wave and the legacy
      // dispatch above land here, so a report reader and every report oracle see
      // the same row they always did.
      testSummary = "All tests passing";
      recordPhase("PT", "PROPERTIES Tests", "✅", "All properties tests passing");

      // ─── Phase CR: Final Codebase Review ─────────────────────────────────
      phaseFn("Phase CR: Final Codebase Review");
      const crWindow = await phaseWindow(null);
      const crResult = await reviewLoop({
        doc: `docs/${featureName}/`,
        phase: "CR",
        docType: null,
        reviewers: PHASE_DISPATCH.CR.reviewers,
        optimizer: PHASE_DISPATCH.CR.optimizer,
        feature: featureName,
        iteration: crWindow.startIndex,
        startIndex: crWindow.startIndex,
        endIndex: crWindow.endIndex,
        _parallel: parallelFn,
        _checkFile: checkFileFn,
        ...wrapperSeams,
      });
      checkConverged(crResult, "CR", PHASE_DISPATCH.CR.label, recordPhase, featureName, crWindow.startIndex, crWindow.endIndex);
      recordPhase("CR", PHASE_DISPATCH.CR.label, "✅", `Approved (${crResult.iterations} iterations)`, crResult.iterations);

      // ─── Phase DOD: Definition of Done Verification ─────────────────────
      if (!phaseDodEnabled) {
        phaseFn("Phase DOD: ⏭ Skipped");
        emit("Phase DOD skipped — DoD verification disabled");
        recordPhase("DOD", PHASE_DISPATCH.DOD.label, "⏭", "Skipped — DoD verification disabled");
      } else {
        phaseFn("Phase DOD: Definition of Done Verification");
        // DOD step 0: rebase onto the latest default branch so the scan — and the PR
        // raised later in Phase PUB — reflects the real merge state. Moved here from
        // ship-pr so DoD evaluates the post-rebase tree.
        //
        // TSPEC §7.1/A4-3 (PLAN A-25) — preRebaseHead is captured BEFORE rebaseOntoDefaultFn
        // mutates the tree, so a subsequent A4 dispatch's declaredScope diff is against the
        // branch's own pre-rebase state, not whatever the rebase (or its conflict) left behind.
        const preRebaseHeadResult = await gitFn(["rev-parse", "HEAD"]);
        const preRebaseHead =
          preRebaseHeadResult && preRebaseHeadResult.ok ? String(preRebaseHeadResult.stdout || "").trim() : null;

        const rebaseStatus = await rebaseOntoDefaultFn({
          feature: featureName,
          _agent: agentFn,
          _log: emit,
        });
        if (rebaseStatus === "conflict") {
          // TSPEC §7.1 (PLAN A-25) — A4 fires immediately before the pre-existing halt
          // (PROP-REG-01). Both `haltError` calls below are byte-identical to the
          // tier-disabled/unresolved run; only a `resolved` outcome changes control flow.
          const a4Context = await gatherA4Context({
            feature: featureName,
            preRebaseHead,
            _git: gitFn,
            _readFile: readFileFn,
          });
          const a4 = await runAdvisorySeamFn({
            seam: "A4",
            feature: featureName,
            seamOps: buildA4SeamOps({ ...a4Context, _git: gitFn, _runCommand: runCommandFn }),
            config: advisoryConfigResult.config,
            rungState: advisoryRungState,
            _agent: agentFn,
            _appendFile: appendFileFn,
            _writeFile: writeFileFn,
            _readFile: readFileFn,
            _git: gitFn,
            _log: emit,
            _now,
            _sleep,
            // TSPEC §10.2 N-4 — the escalation notice rides the same `notices` array the merge
            // phase already uses, and the same report field.
            _notice: advisoryNotice,
          });
          advisoryDispositions.push(a4);
          if (a4.outcome !== "resolved") {
            recordPhase("DOD", PHASE_DISPATCH.DOD.label, "❌", "Rebase onto default branch conflicted — resolve manually");
            throw haltError(
              `Phase DOD — rebase conflict for feature ${featureName}. ` +
              `The feature branch cannot be cleanly rebased onto the default branch. ` +
              `Resolve conflicts manually and re-run.`
            );
          }
          // resolved ⇒ the branch is rebased and green; fall through to the DoD loop.
        }
        const dodResult = await dodVerifyLoopFn({
          feature: featureName,
          _agent: agentFn,
          _log: emit,
          // The loop reads each round's CODE_REVIEW to route remediation by
          // target; it uses the pipeline's read seam, not its own.
          _readFile: readFileFn,
        });
        if (!dodResult.passed) {
          const detail =
            dodResult.lastStatus
              ? `stubs=${dodResult.lastStatus.stubs}, mock_data=${dodResult.lastStatus.mock_data}, unwired=${dodResult.lastStatus.unwired_integrations}, coverage_gap=${dodResult.lastStatus.coverage_below_threshold}, req_gaps=${dodResult.lastStatus.req_gaps}`
              : "verification failed";

          // TSPEC §7.1 (PLAN A-25) — A3 fires immediately before the pre-existing halt. A3 can
          // NEVER resolve (`permittedActions: []`, A3-6), so this branch is unconditional — no
          // `if (resolved)` — and the halt below always fires; only the appended classification
          // (AC-6.3) differs from the tier-disabled/unresolved run.
          const codeReviewPath = `docs/${featureName}/CODE_REVIEW-${featureName}-v${dodResult.iterations}.md`;
          let codeReviewText = "";
          try {
            const text = await readFileFn(codeReviewPath);
            codeReviewText = typeof text === "string" ? text : "";
          } catch {
            codeReviewText = "";
          }
          const a3 = await runAdvisorySeamFn({
            seam: "A3",
            feature: featureName,
            seamOps: buildA3SeamOps({ dodResult, codeReviewText, _readFile: readFileFn }),
            config: advisoryConfigResult.config,
            rungState: advisoryRungState,
            _agent: agentFn,
            _appendFile: appendFileFn,
            _writeFile: writeFileFn,
            _readFile: readFileFn,
            _git: gitFn,
            _log: emit,
            _now,
            _sleep,
            _notice: advisoryNotice,
            // AC-6.3's producer: the real A3 reply is parsed into its governing class by
            // `summariseA3Classification` (`parseA3Classification` + `governingClass`), and the
            // driver carries the result out on the disposition as `classificationSummary`.
            _summarise: summariseA3Classification,
          });
          advisoryDispositions.push(a3);
          // AC-6.3's diagnosis: the classification carried on the disposition (when present) is
          // appended to the byte-identical halt below, never replaces it.
          const classificationSummary =
            (a3 && a3.classificationSummary) ?? "";
          recordPhase("DOD", PHASE_DISPATCH.DOD.label, "❌", `Failed after ${dodResult.iterations} iterations — ${detail}`, dodResult.iterations);
          throw haltError(
            `Phase DOD failed after ${dodResult.iterations} iterations — Definition of Done not met. ${detail} ${classificationSummary}`.trimEnd()
          );
        }
        // TSPEC §8.4 (PLAN A-26, OQ-3) — the verified commit sha, captured the moment
        // `dodResult.passed` becomes true. A read failure leaves it `null` rather than halting:
        // the field is report-only.
        try {
          const dodHeadResult = await gitFn(["rev-parse", "HEAD"]);
          dodVerifiedCommit =
            dodHeadResult && dodHeadResult.ok ? String(dodHeadResult.stdout || "").trim() : null;
        } catch {
          dodVerifiedCommit = null;
        }
        recordPhase("DOD", PHASE_DISPATCH.DOD.label, "✅", `Passed (${dodResult.iterations} iteration${dodResult.iterations !== 1 ? "s" : ""})`, dodResult.iterations);
      }

      // ─── Phase H: Harvest ────────────────────────────────────────────────
      // check-scope-field fires PostToolUse:Write|Edit on all workflow agent writes;
      // nudge-consolidation fires on the top-level SessionStart only — not inside agent sub-sessions.
      if (!PHASE_H_ENABLED) {
        phaseFn("Phase H: ⏭ Skipped (prerequisite)");
        emit("Phase H skipped — prerequisite not yet landed");
        harvestStatus = "Skipped (prerequisite not yet landed)";
        recordPhase("H", "Harvest", "⏭", "Phase H: ⏭ Skipped (prerequisite not yet landed)");
      } else {
        phaseFn("Phase H: Harvest");
        const learningsPath = `docs/${featureName}/LEARNINGS-${featureName}.md`;
        // FSPEC §8.4 step 1 — openness is computed HERE, from the log and nothing else, and
        // handed to the prompt as a list. An absent or unreadable log is an empty list, which the
        // renderer states explicitly: the SKILL's copy-verbatim convention is conditioned on
        // having been handed one, so "no open promotions" must not read as "no list".
        const consolidationLogText = await readFileFn(CONSOLIDATION_LOG_PATH);
        const openPromotions = openPromotionsFromLog(consolidationLogText);
        const harvestResult = await wrappedDispatch({
          skill: "harvest-learnings",
          basePrompt: harvestPrompt(featureName, openPromotions),
          targetPath: learningsPath,
          docType: "LEARNINGS",
          dispatchKind: "harvest",
          phaseId: "H",
        });

        // AC-4.2c: the §4.4 approval record is best-effort and is deliberately NOT
        // part of §5.9's LEARNINGS criterion — a record-writing bug must not
        // re-dispatch harvest to its budget. Its absence is reported, not swallowed.
        const learningsText = await readFileFn(learningsPath);
        if (!/approval record/i.test(String(learningsText ?? ""))) {
          emit(
            `Harvest note: the approval record is missing from ${learningsPath}. ` +
              `It is best-effort (AC-4.2c) and is not a halt condition.`
          );
        }

        // TSPEC-HARVEST-04: Guard block detection
        if (
          typeof harvestResult === "string" &&
          harvestResult.includes(
            "pdlc guard: refusing to delete CROSS-REVIEW files"
          )
        ) {
          // Extract blocked file path from the guard hook's canonical error message
          let blockedPath = "(path not parseable)";
          const dirMatch = harvestResult.match(
            /pdlc guard: refusing to delete CROSS-REVIEW files in \[([^\]]+)\]/
          );
          if (dirMatch) {
            blockedPath = dirMatch[1];
          }
          harvestStatus = `Halted: guard-harvest-before-delete blocked deletion of ${blockedPath}`;
          throw haltError(
            `Phase H halted: guard-harvest-before-delete blocked deletion of ${blockedPath}`
          );
        }

        harvestStatus = "Harvested";
        recordPhase("H", "Harvest", "✅", "Learnings harvested");
      }

      // ─── Phase PUB: Raise PR & Verify CI ─────────────────────────────────
      // Runs last so the PR captures the complete feature branch, including the
      // harvested LEARNINGS. The poll-timing logic lives in raisePrAndVerifyCi.
      if (!phasePubEnabled) {
        phaseFn("Phase PUB: ⏭ Skipped");
        emit("Phase PUB skipped — auto-PR disabled");
        recordPhase("PUB", "Raise PR & Verify CI", "⏭", "Skipped — auto-PR disabled");
      } else {
        phaseFn("Phase PUB: Raise PR & Verify CI");
        const pubResult = await raisePrAndVerifyCiFn({
          feature: featureName,
          _agent: agentFn,
          _checkCi: checkCiFn,
          _log: emit,
          _now,
          _sleep,
          // The composition root above, or nothing at all when the tier is off — in which case
          // `raisePrAndVerifyCi`'s own inert default applies (see `runA5AdvisorySeam`).
          ...(advisoryTierOn ? { _runAdvisorySeam: runA5AdvisorySeam } : {}),
          _advisoryRecord: (disposition) => advisoryDispositions.push(disposition),
        });
        prUrl = pubResult.prUrl;
        ciStatus = pubResult.ciStatus;
        // §9.4 S-3 — A5-6's "no check ever registered" is a property of the PHASE, not of any
        // disposition, so it is carried out of the phase and onto the summary explicitly.
        advisoryPubOutcome.noChecks = Boolean(pubResult.noChecks);
        const ciDetail =
          ciStatus === "passed"
            ? `PR ${prUrl} — all GHA checks passed`
            : `PR ${prUrl} — no GHA checks detected within timeout (assumed none configured)`;
        recordPhase("PUB", "Raise PR & Verify CI", "✅", ciDetail);
      }

      // ─── Phase H2: distil the advisory record (TSPEC §9.3, PLAN A-27) ────
      // Placed strictly between Phase PUB and Phase MERGE (dev:8386/dev:8389 — I-11).
      // Phase H itself (above) is untouched: at that point A5 has not run yet. The whole step is
      // fail-open (mirrors this tier's other "notice, never halt" terms — e.g. R-2's failed
      // record write, and the guard-refusal branch just below) — a transport fault here must
      // never take down an otherwise-successful pipeline run. `h2Sleep` mirrors the wave-commit
      // call sites' own `waveSleep` fallback pattern rather than forwarding `_sleep` bare, which
      // would register this call site as an unresolved E-2 forward (`commitPaths` does not
      // declare `_sleep` with a default) under RLH-AT-64's composition-root wiring check.
      if (advisoryTierOn) {
        const advisoryPath = `docs/${featureName}/ADVISORY-${featureName}.md`;
        const advisoryLearningsPath = `docs/${featureName}/LEARNINGS-${featureName}.md`;
        const h2Sleep = typeof _sleep === "function" ? _sleep : sleep;
        try {
          const check = await checkFileFn(advisoryPath);
          const recordExists = Boolean(check && check.ok);
          if (recordExists) {
            await agentFn("harvest-learnings", advisoryDistilPrompt(featureName));
            const del = await gitFn(["rm", "--", advisoryPath]);
            if (guardRefused(del)) {
              notices.push(`ADVISORY record retained: ${firstLine(del && del.stderr)}`);
            } else if (!del || del.ok !== true) {
              notices.push(
                `ADVISORY distil step failed: ${firstLine(del && del.stderr) || "git rm did not succeed"}`
              );
            } else {
              await commitPaths({
                paths: [advisoryLearningsPath, advisoryPath],
                message: `chore(advisory): distil ${featureName} advisory record into LEARNINGS`,
                what: "Phase H2 distil",
                _git: gitFn,
                _sleep: h2Sleep,
                emit,
              });
              await gitFn(["push", "origin", "HEAD"]);
            }
          }
        } catch (err) {
          notices.push(
            `ADVISORY distil step failed: ${err && err.message ? err.message : String(err)}`
          );
        }
      }

      // ─── Phase MERGE: Merge & Advance Queue ──────────────────────────────
      // TSPEC §10.4: placed immediately after Phase PUB, inside the same
      // guarded `pipelineFn` body — Phase MERGE's own internal try/catch
      // (§5.2) is what keeps this call from ever reaching the halt path below.
      phaseFn("Phase MERGE: Merge & Advance Queue");
      mergeOutcome = await phaseMerge({
        feature: featureName,
        prUrl,
        _ghRun: ghRunFn,
        _git: gitFn,
        _readFile: readFileFn,
        _recordQueueRow: recordQueueRowFn,
        _log: emit,
        _now,
        _sleep,
        _enabled: phaseMergeEnabled,
      });
      for (const line of mergeOutcome.escalations) notices.push(line);
      for (const note of mergeOutcome.notes) notices.push(note);
      // §10.3: the glyph is never ❌ — the halt path derives the failed phase
      // from a recorded "❌" row, and Phase MERGE never halts the pipeline.
      const mergeGlyph =
        mergeOutcome.mergeStatus === "merged"
          ? "✅"
          : mergeOutcome.mergeStatus === "skipped"
            ? "⏭"
            : "⚠️";
      const mergeDetail =
        mergeOutcome.mergeStatus === "merged"
          ? `Merged ${prUrl} (${mergeOutcome.mergeMethod}, ${
              typeof mergeOutcome.mergeSha === "string"
                ? mergeOutcome.mergeSha.slice(0, 7)
                : "sha unknown"
            })`
          : mergeOutcome.reason;
      recordPhase("MERGE", "Merge PR", mergeGlyph, mergeDetail);
    });
  } catch (err) {
    haltReason = err.message;
    if (testSummary === "Not run" && haltReason) {
      testSummary = haltReason;
    }
    // §9.4 S-3 — Phase PUB's completion cap signals through the halt error's own detail field
    // (`haltError(msg, { completionCap: true })`), which is the only channel a throwing phase has.
    if (err && err.completionCap === true) advisoryPubOutcome.completionCap = true;

    // ─── TSPEC §4.7 / §6.5 — what an operator gets on a halt ────────────────
    // The phase that failed is read off the recorded rows rather than carried in
    // a parallel variable, so it can never disagree with the phase table.
    const failedRow = [...phases].reverse().find((row) => row.status === "❌");
    const haltPhase = failedRow ? failedRow.phase : null;

    // §6.3: the POSTMORTEM claim is a FILESYSTEM confirmation, never the agent's
    // narration — the whole of H-2 is that the two were assumed to agree.
    let postmortemStatus = "none";
    let postmortemPath = null;
    // §6.2 row 13: a step-G refusal names an EXISTING, unresolved POSTMORTEM.
    // The existence check below would call the same artifact `"written"` — the
    // refusal's whole point is that it was not written by this run.
    if (gatePostmortem) {
      postmortemStatus = "unresolved";
      postmortemPath = gatePostmortem.path;
    } else if (err && err.postmortemStatus) {
      // §6.3/§6.4: `checkConverged` already resolved the disposition from
      // `reviewLoop`'s `_checkFile` confirmation. Re-probing here would call a
      // file that a LATER phase happens to have left behind this phase's
      // POSTMORTEM, and would contradict the halt reason it already emitted.
      postmortemStatus = err.postmortemStatus;
      postmortemPath = err.postmortemPath ?? null;
    } else if (haltPhase) {
      const candidate = `docs/${featureName}/POSTMORTEM-${haltPhase}-${featureName}.md`;
      let confirmation;
      try {
        confirmation = await checkFileFn(candidate);
      } catch {
        confirmation = { ok: false };
      }
      if (confirmation && confirmation.ok) {
        postmortemStatus = "written";
        postmortemPath = candidate;
      }
    }

    // §6.5: EVERY halt class commits the queue row — exactly once per invocation.
    let queueRow = null;
    try {
      const recorded = await recordQueueRowFn({ feature: featureName, status: "halted" });
      queueRow = recorded && recorded.queueRow ? recorded.queueRow : null;
      // §6.5 / E-38, E-40: a row write that failed or found nothing leaves the
      // operator a REMAINING ACTION, and that action reaches them as its own
      // report line — never folded into `haltReason`, which stays the phase's own
      // reason (AT-33's "subordinate"). A clean write carries no detail and is
      // therefore silent: AT-31's "one failure, not two" and AT-34's "no-op is
      // not a fault" are both that silence.
      if (recorded && recorded.detail) {
        notices.push(`Queue row ${queueRow}: ${recorded.detail}`);
      }
    } catch {
      queueRow = null;
    }

    if (postmortemStatus === "none") {
      emit("No POSTMORTEM was written.");
    }
    // §14.4: exactly ONE recovery act is offered. A direct re-invocation is
    // deliberately not offered — the queue row is the single entry point.
    emit(
      `Recover: set the ${featureName} row in docs/_queue/QUEUE.md back to pending, then re-run the queue.`
    );

    return buildFinalReport({
      feature: featureName,
      outcome: "halted",
      phases,
      artifactPaths,
      testSummary,
      harvestStatus: harvestStatus === "Not run" ? "Not run" : harvestStatus,
      prUrl,
      ciStatus,
      haltReason,
      haltPhase,
      postmortemStatus,
      postmortemPath,
      queueRow,
      notices,
      dodVerifiedCommit,
      headSha: await readCurrentHead(),
      // S-1/T-08-9: `advisory` rides the halt path exactly as `notices` and `queueRow` already
      // do — a halt that reached at least one advisory-aware phase still reports the seams it
      // reached, un-distilled (H-4: the record itself is untouched by a halt before Phase H2).
      advisory: advisoryTierOn ? advisorySummaryRows(advisoryDispositions, advisoryPubOutcome) : undefined,
    });
  }

  return buildFinalReport({
    feature: featureName,
    outcome: "success",
    notices,
    // §4.7 / TSPEC §10.1: `queueRow` rides on every report. A run that never
    // reaches Phase MERGE — or reaches it without merging — writes no status
    // of its own (`orchestrate-dev` owns no other status write but the halt
    // one — AC-2.7a), so the value is the same `"none"` the default
    // `_recordQueueRow` reports; a `merged` run instead carries the §7.4
    // disposition `phaseMerge` itself produced.
    queueRow: mergeOutcome.queueRow ?? "none",
    mergeStatus: mergeOutcome.mergeStatus,
    mergeSha: mergeOutcome.mergeSha,
    mergeMethod: mergeOutcome.mergeMethod,
    // §4.7: a phase skipped over an unresolved POSTMORTEM still reports it.
    postmortemStatus: skipPostmortem ? "unresolved" : "none",
    postmortemPath: skipPostmortem ? skipPostmortem.path : null,
    phases,
    artifactPaths,
    testSummary,
    harvestStatus,
    prUrl,
    ciStatus,
    dodVerifiedCommit,
    headSha: await readCurrentHead(),
    // S-1: an enabled tier always reports its five rows, even when every one reads zero
    // invocations (this run's `advisoryDispositions` stayed empty) — only a disabled tier
    // leaves the field itself absent (see `buildFinalReport`'s own conditional spread).
    advisory: advisoryTierOn ? advisorySummaryRows(advisoryDispositions, advisoryPubOutcome) : undefined,
  });
}

// ─── Merge worktree helper (TSPEC-IMPL-05) ────────────────────────────────────

/**
 * Merges a worktree branch into the current HEAD of the given repo directory.
 *
 * Steps:
 *   1. Run `git merge --no-ff {worktreeBranch}` in {repoPath}.
 *   2. On non-zero exit: run `git diff --name-only --diff-filter=U` to get conflicting files.
 *   3. Run `git merge --abort`.
 *   4. Return `{ ok: false, conflictingFiles: string[] }`.
 *   On success: return `{ ok: true }`.
 *
 * @param {string} repoPath       - Path to the git repo (cwd for git commands)
 * @param {string} worktreeBranch - Branch name to merge (e.g. "feat-task-01-worktree")
 * @param {string} [targetBranch] - Target branch name (informational only; repo must already be on it)
 * @param {{ execFn?: function }} [opts] - Injection point for tests (override execSync)
 * @returns {Promise<{ ok: true } | { ok: false, conflictingFiles: string[] }>}
 */
export async function mergeWorktree(repoPath, worktreeBranch, targetBranch, { execFn } = {}) {
  const { execSync: realExecSync } = await import("child_process");
  const exec = execFn ?? ((cmd, opts) => realExecSync(cmd, opts));

  const execOpts = { cwd: repoPath, stdio: "pipe", encoding: "utf8" };

  try {
    exec(`git merge --no-ff ${worktreeBranch}`, execOpts);
    return { ok: true };
  } catch {
    // Non-zero exit: capture conflicting files before aborting
    let conflictingFiles = [];
    try {
      const diffOutput = exec(
        "git diff --name-only --diff-filter=U",
        execOpts
      );
      conflictingFiles = diffOutput
        .trim()
        .split("\n")
        .filter((line) => line.length > 0);
    } catch {
      // If diff fails (e.g. nothing staged), return empty list
    }

    try {
      exec("git merge --abort", execOpts);
    } catch {
      // Abort may fail if merge wasn't in progress — ignore
    }

    return { ok: false, conflictingFiles };
  }
}

// ─── Final report builder ─────────────────────────────────────────────────────

function buildFinalReport({
  feature,
  outcome,
  phases,
  artifactPaths,
  testSummary,
  harvestStatus,
  prUrl,
  ciStatus,
  haltReason,
  haltPhase = null,
  postmortemStatus = "none",
  postmortemPath = null,
  queueRow = null,
  // TSPEC §10.1: present, unconditionally, on EVERY report — including the
  // halt path, which never assigns these and so reports exactly this default
  // (FSPEC §11 row 23: a run that halted before Phase MERGE considered no
  // merge at all).
  mergeStatus = "skipped",
  mergeSha = null,
  mergeMethod = null,
  notices = [],
  // TSPEC §8.4 (PLAN A-26, OQ-3) — `dodVerifiedCommit` is the sha Phase DOD verified; `headSha`
  // is the branch head at report-build time (not itself reported — only the derived comparison
  // is). Report-only: no re-verify, no halt on the divergence (DEC-ADV-07).
  dodVerifiedCommit = null,
  headSha = null,
  // S-1: `advisorySummaryRows` output for this run, or `undefined` when the tier never ran
  // (disabled config, or a halt before any advisory-aware phase). Spread conditionally, like
  // `prUrl`/`ciStatus` above — a disabled run must never carry a defined `advisory` key at all
  // (T-10-3/T-10-4 assert `toBeUndefined()`, not merely falsy).
  advisory = undefined,
}) {
  const dodHeadUnverified = Boolean(
    dodVerifiedCommit && headSha && headSha !== dodVerifiedCommit
  );
  return {
    feature,
    outcome,
    phases,
    artifactPaths,
    testSummary,
    harvestStatus,
    dodVerifiedCommit,
    dodHeadUnverified,
    // §4.7's non-skip report lines. Carried as their own field rather than
    // appended to a phase row's `detail`, which oracles pin verbatim.
    notices,
    // §4.7's four halt-disposition fields ride on EVERY report, present with a
    // readable value on success too: a conditionally-spread field cannot express
    // "no POSTMORTEM", which is precisely the fact `RLH-AT-46` reads.
    haltPhase,
    postmortemStatus,
    postmortemPath,
    queueRow,
    mergeStatus,
    mergeSha,
    mergeMethod,
    ...(prUrl ? { prUrl } : {}),
    ...(ciStatus ? { ciStatus } : {}),
    ...(haltReason ? { haltReason } : {}),
    ...(advisory ? { advisory } : {}),
  };
}
