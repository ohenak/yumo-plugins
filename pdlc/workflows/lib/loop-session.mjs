// loop-session.mjs — PLAN P1-02.
//
// Pure config reader for the engineering-loop's `.claude/pdlc.config.json`
// `loop` section, plus the two frozen enumerations (`LOOP_STOP_KINDS`,
// `LOOP_NOTICE_CODES`) later Phase-1 tasks (P1-04, P1-06, P1-08, P1-10) build
// on. This module reads no filesystem itself — `text` is the raw file bytes
// (or null for absent/unreadable), the caller's seam collapses those two per
// FSPEC BR-02 case (d).
//
// `readLoopConfig` extends the sibling precedent (`parseAdvisoryConfig`,
// `parseMergeConfig` in `pdlc/workflows/orchestrate-dev.js`) rather than
// diverging from it (TSPEC §Interfaces, DEC-LOOP-04): every config value the
// sibling algorithm would produce is produced unchanged, and the extension
// is confined to the `case` field the siblings do not carry.

/** @param {unknown} v */
function isPlainObject(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

// FSPEC BR-01's four declared defaults, transcribed literally.
export const LOOP_DEFAULTS = Object.freeze({
  backoffSchedule: Object.freeze([5, 15, 30, 60]),
  idleStopAfter: 4,
  preflight: "strict",
  dirtyTreePolicy: "tracked",
});

export const LOOP_SOURCES = Object.freeze(["pipeline-halt", "merge-refusal"]);

// FSPEC §3.4's ten stop reasons. Nine are produced by `nextDirective`
// (P1-08); the tenth, `engine-dispatch-refused`, is emitted only on
// `cmdQueue`'s preflight path (TSPEC E-19, E-23) and never by
// `nextDirective`. A nine-member array here reds AT-37 at stop-construction
// time on the `cmdQueue` preflight path (P4-06/P4-07), per this task's row.
export const LOOP_STOP_KINDS = Object.freeze([
  "preflight-refused",
  "queue-blocked",
  "pipeline-halted",
  "no-queue",
  "awaiting-merge",
  "idle-exhausted",
  "invocation-threw",
  "queue-unreadable",
  "backoff-unenterable",
  "engine-dispatch-refused",
]);

// FSPEC §3.4's ten notice codes, assembled by `collectNotices` (P1-10).
export const LOOP_NOTICE_CODES = Object.freeze([
  "config-case",
  "config-key-defaulted",
  "preflight-warning",
  "preflight-held",
  "engine-version-mismatch",
  "escalation-parse",
  "escalation-append-failed",
  "candidate-skipped-not-ready",
  "queue-unreadable",
  "session-restarted",
]);

/**
 * Read the `loop` section out of `.claude/pdlc.config.json` raw bytes.
 * Pure and total: never throws, never reads anything, and every key falls
 * back INDEPENDENTLY (FSPEC BR-03, PROP-CFG-04) — one bad key must not
 * discard the rest of the section.
 *
 * @param {string|null} text - raw file contents, or null (file absent OR
 *   unreadable — the caller's seam collapses those two, BR-02 case (d)).
 * @returns {{ config: {backoffSchedule: number[], idleStopAfter: number,
 *   preflight: "strict"|"off", dirtyTreePolicy: "tracked"|"any"},
 *   case: "absent-file"|"absent-section"|"malformed-section"|"explicit-default",
 *   invalidKeys: string[] }}
 */
export function readLoopConfig(text) {
  const degraded = (kase) => ({
    config: LOOP_DEFAULTS,
    case: kase,
    invalidKeys: [],
  });

  if (text == null) return degraded("absent-file");

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return degraded("absent-file");
  }

  if (!isPlainObject(parsed) || !("loop" in parsed)) return degraded("absent-section");

  const section = parsed.loop;
  if (!isPlainObject(section)) return degraded("malformed-section");

  // §BR-02's "explicit-default" case requires >=1 IN-DOMAIN key — a key
  // NAME among the four recognized keys, whether or not its VALUE
  // validates. A section whose every key name is unrecognized reports
  // "malformed-section" rather than silently defaulting the whole section
  // as if it were absent.
  const KNOWN_KEYS = ["backoffSchedule", "idleStopAfter", "preflight", "dirtyTreePolicy"];
  const hasKnownKey = KNOWN_KEYS.some((k) => k in section);
  if (!hasKnownKey) return degraded("malformed-section");

  const invalidKeys = [];

  const backoffSchedule = (() => {
    if (!("backoffSchedule" in section)) return LOOP_DEFAULTS.backoffSchedule;
    const v = section.backoffSchedule;
    if (Array.isArray(v) && v.every((n) => typeof n === "number" && Number.isFinite(n) && n >= 0)) {
      return v;
    }
    invalidKeys.push("backoffSchedule");
    return LOOP_DEFAULTS.backoffSchedule;
  })();

  const idleStopAfter = (() => {
    if (!("idleStopAfter" in section)) return LOOP_DEFAULTS.idleStopAfter;
    const v = section.idleStopAfter;
    if (Number.isInteger(v) && v >= 0) return v;
    invalidKeys.push("idleStopAfter");
    return LOOP_DEFAULTS.idleStopAfter;
  })();

  const preflight = (() => {
    if (!("preflight" in section)) return LOOP_DEFAULTS.preflight;
    const v = section.preflight;
    if (v === "strict" || v === "off") return v;
    invalidKeys.push("preflight");
    return LOOP_DEFAULTS.preflight;
  })();

  const dirtyTreePolicy = (() => {
    if (!("dirtyTreePolicy" in section)) return LOOP_DEFAULTS.dirtyTreePolicy;
    const v = section.dirtyTreePolicy;
    if (v === "tracked" || v === "any") return v;
    invalidKeys.push("dirtyTreePolicy");
    return LOOP_DEFAULTS.dirtyTreePolicy;
  })();

  return {
    config: { backoffSchedule, idleStopAfter, preflight, dirtyTreePolicy },
    case: "explicit-default",
    invalidKeys,
  };
}

/**
 * Evaluate the two preflight conditions (`engine-readiness`, `working-tree`)
 * and decide whether the loop may proceed. PLAN P1-04 (TSPEC §Interfaces).
 *
 * Both conditions are ALWAYS evaluated — `policy` only decides `decision`,
 * never whether a condition is checked at all (AT-16, AT-12): a build that
 * skips a check under `"off"` would produce a missing or `held: null`
 * condition, not a positively-recorded pass.
 *
 * `"strict"` refuses when either condition fails. `"off"` never refuses on
 * either condition — a failing condition is instead downgraded to a
 * `preflight-warning` notice carrying the failure's own reason/detail plus
 * (for `engine-readiness`) the injected `remediation` (E-19). The shipped
 * `!startup.ok` refusal downstream in `cmdQueue` is untouched by this pure
 * module either way.
 *
 * `versionMismatch` never drives `decision` — it is surfaced only as an
 * `engine-version-mismatch` notice, regardless of policy (AT-12).
 *
 * `startup.notices` (from `runStartupChecks`) are re-emitted onto
 * `PreflightResult.notices` under `preflight-warning` rather than dropped,
 * so an operator running under the loop sees what `pdlc doctor` shows.
 *
 * @param {{
 *   startup: { ok: boolean, reason: string|null,
 *     rungs: Array<{rung: string, name: string, state: string, detail?: string}>,
 *     notices: Array<string|{text: string}> },
 *   treeStatus: { ok: true, dirtyPaths: string[] } | { ok: false, detail: string },
 *   policy: "strict"|"off",
 *   remediation: string,
 *   versionMismatch: { mismatched: boolean, detail: string|null },
 * }} input
 * @returns {{
 *   decision: "proceed"|"refuse",
 *   conditions: Array<{ id: "engine-readiness"|"working-tree", held: boolean,
 *     detail: string|null, remediation: string|null }>,
 *   notices: Array<{code: string, subject: string, text: string}>,
 * }}
 */
export function evaluatePreflight(input) {
  const { startup, treeStatus, policy, remediation, versionMismatch } = input;

  const engineCondition = {
    id: "engine-readiness",
    held: startup.ok,
    detail: startup.ok ? null : startup.reason,
    remediation: startup.ok ? null : remediation,
  };

  const treeCondition = {
    id: "working-tree",
    held: treeStatus.ok,
    detail: treeStatus.ok ? null : treeStatus.detail,
    remediation: null,
  };

  const conditions = [engineCondition, treeCondition];

  const decision = policy === "strict" && conditions.some((c) => !c.held) ? "refuse" : "proceed";

  const notices = [];

  if (policy === "off") {
    if (!engineCondition.held) {
      notices.push({
        code: "preflight-warning",
        subject: "engine-readiness",
        text: `${engineCondition.detail} — ${engineCondition.remediation}`,
      });
    }
    if (!treeCondition.held) {
      notices.push({
        code: "preflight-warning",
        subject: "working-tree",
        text: `${treeCondition.detail}`,
      });
    }
  }

  if (versionMismatch.mismatched) {
    notices.push({
      code: "engine-version-mismatch",
      subject: "engine-readiness",
      text: versionMismatch.detail,
    });
  }

  for (const startupNotice of startup.notices) {
    const text = typeof startupNotice === "string" ? startupNotice : startupNotice.text;
    notices.push({ code: "preflight-warning", subject: "engine-readiness", text });
  }

  // CR v1 F-04: the input's `versionMismatch` is re-exposed on the RESULT, because
  // `collectNotices`' notice-channel table (TSPEC §Interfaces) sources
  // `engine-version-mismatch` from "`preflight` input's `versionMismatch`" and its only
  // handle on that input is the result object this function returns. Without it the
  // optional chain `preflight.versionMismatch?.mismatched` short-circuits on EVERY input,
  // so AT-12's notice was structurally unreachable no matter what the caller supplied.
  return { decision, conditions, notices, versionMismatch };
}

// PLAN P1-05/P1-06 — session-state codec (TSPEC *Interfaces*, Data Model §3,
// E-24, AT-48, PROP-ITER-14/PROP-ITER-15).

// Free-text members (`halted[].reason`, `escalationsRaised[].sourceLabel`)
// are truncated to this many characters at encode time (Data Model §3,
// Q-04's token-growth bound).
const FREE_TEXT_MAX_LENGTH = 200;

// The reserved literal that requests a deliberately fresh session (as
// opposed to any other undecodable token, which also decodes fresh but
// signals `restarted: true` to `collectNotices`, P1-10). Both paths are
// handled identically here — decoding never distinguishes them (this
// module's half of PROP-ITER-15's differential).
const FRESH_STATE_TOKEN = "new";

function truncateFreeText(text) {
  return typeof text === "string" ? text.slice(0, FREE_TEXT_MAX_LENGTH) : text;
}

/** The fresh-session value, transcribed literally from TSPEC Data Model §3. */
function freshSessionState() {
  return {
    v: 1,
    preflightRan: false,
    consecutiveIdle: 0,
    schedulePos: 0,
    iteration: 0,
    merged: [],
    halted: [],
    escalationsRaised: [],
  };
}

/**
 * Decode a `--loop-state` token into a `SessionState`. Pure and total:
 * never throws. `null`, empty, non-base64, non-JSON, non-object, and
 * wrong-`v` tokens all decode to the fresh-session value, as does the
 * reserved literal `"new"` and any other undecodable token — this function
 * alone cannot distinguish those cases (E-24, AT-48).
 *
 * @param {string|null} token
 * @returns {object} SessionState
 */
export function decodeLoopState(token) {
  return tryDecodeLoopState(token) ?? freshSessionState();
}

/**
 * Internal: the decode ATTEMPT. Returns the decoded `SessionState`, or `null` when the
 * token carried no usable state — which is the fact `decodeLoopState` (total by contract)
 * throws away and `isRestartToken` needs. `null`, the empty string and the reserved literal
 * `new` are "no token was carried", not a failed decode, so they return the fresh value
 * here rather than `null`.
 *
 * @param {string|null} token
 * @returns {object|null}
 */
function tryDecodeLoopState(token) {
  if (token == null || token === "" || token === FRESH_STATE_TOKEN) return freshSessionState();

  let json;
  try {
    json = Buffer.from(token, "base64url").toString("utf8");
  } catch {
    return null;
  }

  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }

  if (!isPlainObject(parsed) || parsed.v !== 1) return null;

  return {
    v: 1,
    preflightRan: !!parsed.preflightRan,
    consecutiveIdle: Number.isInteger(parsed.consecutiveIdle) ? parsed.consecutiveIdle : 0,
    schedulePos: Number.isInteger(parsed.schedulePos) ? parsed.schedulePos : 0,
    iteration: Number.isInteger(parsed.iteration) ? parsed.iteration : 0,
    merged: Array.isArray(parsed.merged) ? parsed.merged : [],
    halted: Array.isArray(parsed.halted) ? parsed.halted : [],
    escalationsRaised: Array.isArray(parsed.escalationsRaised) ? parsed.escalationsRaised : [],
  };
}

/**
 * CR v1 F-05. `true` exactly when the invocation CARRIED a token that failed to decode —
 * E-24's `session-restarted` predicate (AT-48, PROP-ITER-15). `null`, the empty string and
 * the reserved literal `new` are all "no state was carried" and are `false`.
 *
 * This is a separate export rather than a field on the decoded state because
 * `decodeLoopState`'s return value is `SessionState` and nothing else (TSPEC *Data Model*
 * §3's eight members): the caller — `orchestrate-queue.js#main` — needs the distinction that
 * `decodeLoopState` is contractually unable to make, and previously read
 * `state.restarted`, a field no decode path has ever returned, so the notice could never
 * fire in production.
 *
 * @param {string|null} token
 * @returns {boolean}
 */
export function isRestartToken(token) {
  if (token == null || token === "" || token === FRESH_STATE_TOKEN) return false;
  return tryDecodeLoopState(token) === null;
}

/**
 * Encode a `SessionState` as a base64url-encoded canonical-JSON token.
 * Free-text members (`halted[].reason`, `escalationsRaised[].sourceLabel`)
 * are truncated to 200 characters (Data Model §3, Q-04).
 *
 * @param {object} state SessionState
 * @returns {string} base64url token
 */
export function encodeLoopState(state) {
  const canonical = {
    v: state.v,
    preflightRan: state.preflightRan,
    consecutiveIdle: state.consecutiveIdle,
    schedulePos: state.schedulePos,
    iteration: state.iteration,
    merged: state.merged.map((m) => ({ feature: m.feature, prUrl: m.prUrl })),
    halted: state.halted.map((h) => ({ feature: h.feature, reason: truncateFreeText(h.reason) })),
    escalationsRaised: state.escalationsRaised.map((e) => ({
      feature: e.feature,
      sourceLabel: truncateFreeText(e.sourceLabel),
    })),
  };

  return Buffer.from(JSON.stringify(canonical), "utf8").toString("base64url");
}

/**
 * The single decision point (PLAN P1-08, TSPEC §Interfaces). Pure: reads no
 * file, clock or queue itself — every fact it needs arrives on
 * `DirectiveInput`. Rules are evaluated in the order stated in TSPEC
 * §Interfaces; see that section for the full rationale (E-03's
 * "unenterable first").
 *
 * @param {object} input DirectiveInput
 * @returns {object} Directive
 */
export function nextDirective(input) {
  const { report, threw, queue, config, state } = input;

  const stop = (stopReason, waitMinutes, detail, nextStateOverride) => ({
    kind: "stop",
    stopReason,
    waitMinutes,
    nextState: encodeLoopState(nextStateOverride ?? state),
    detail,
  });

  const cont = (waitMinutes, nextStateOverride, detail) => ({
    kind: "continue",
    stopReason: null,
    waitMinutes,
    nextState: encodeLoopState(nextStateOverride),
    detail,
  });

  if (threw != null) {
    return stop(
      "invocation-threw",
      0,
      `Queue invocation failed: ${threw.message}`,
      state,
    );
  }

  const { outcome } = report;

  if (outcome === "no-queue") {
    return stop("no-queue", 0, "No queue candidate is available to run.", state);
  }

  if (outcome === "blocked") {
    return stop(
      "queue-blocked",
      0,
      `${report.active} is blocking the queue: ${report.reason}`,
      state,
    );
  }

  if (outcome === "halted") {
    return stop(
      "pipeline-halted",
      0,
      `The pipeline halted: ${report.reason}`,
      state,
    );
  }

  if (outcome === "ran") {
    const nextState = { ...state, consecutiveIdle: 0, schedulePos: 0 };
    return cont(0, nextState, `Ran ${report.picked ?? "a queue candidate"}.`);
  }

  // outcome === "idle" from here on.

  if (!queue.readable) {
    return stop(
      "queue-unreadable",
      null,
      "The queue file could not be read, so an awaiting-merge row cannot be ruled out.",
      state,
    );
  }

  if (queue.awaitingMerge.length > 0) {
    return stop(
      "awaiting-merge",
      0,
      `Awaiting merge: ${queue.awaitingMerge.join(", ")}.`,
      state,
    );
  }

  // Backoff-entering idle: unenterable is tested before exhaustion.
  if (config.backoffSchedule.length === 0 || config.idleStopAfter === 0) {
    return stop(
      "backoff-unenterable",
      null,
      "Backoff cannot be entered: the schedule is empty or idleStopAfter is 0.",
      state,
    );
  }

  if (state.consecutiveIdle + 1 >= config.idleStopAfter) {
    return stop(
      "idle-exhausted",
      null,
      "The idle backoff schedule is exhausted for this session.",
      state,
    );
  }

  const waitMinutes =
    config.backoffSchedule[Math.min(state.schedulePos, config.backoffSchedule.length - 1)];
  const nextState = {
    ...state,
    consecutiveIdle: state.consecutiveIdle + 1,
    schedulePos: state.schedulePos + 1,
  };
  return cont(waitMinutes, nextState, "No ready candidate; backing off.");
}

// PLAN P1-10 — notice channel and report field sets (TSPEC §Interfaces, the
// notice-channel table, BR-27, BR-28, AT-36, AT-37, AT-51).

/**
 * The ONLY constructor of a Notice. Rejects a code outside
 * `LOOP_NOTICE_CODES` by throwing — E-23's invariant, enforced at the one
 * place a notice can be born.
 *
 * @param {string} code
 * @param {string} subject
 * @param {string} text
 * @returns {{code: string, subject: string, text: string}}
 */
export function notice(code, subject, text) {
  if (!LOOP_NOTICE_CODES.includes(code)) {
    throw new Error(`notice: "${code}" is not a member of LOOP_NOTICE_CODES`);
  }
  return { code, subject, text };
}

/**
 * Folds every per-iteration notice source into one ordered array. Every one
 * of the ten `LOOP_NOTICE_CODES` has exactly one producer here (TSPEC
 * §Interfaces notice-channel table).
 *
 * @param {object} input
 * @returns {Array<{code: string, subject: string, text: string}>}
 */
export function collectNotices(input) {
  const { configResult, preflight, parseNotices, appendFailures, report, queue, restarted } =
    input;

  const notices = [];

  if (configResult) {
    notices.push(notice("config-case", "config", configResult.case));
    for (const key of configResult.invalidKeys ?? []) {
      notices.push(notice("config-key-defaulted", key, `"${key}" fell back to its default`));
    }
  }

  if (preflight) {
    for (const condition of preflight.conditions ?? []) {
      if (condition.held === false) {
        notices.push(notice("preflight-warning", condition.id, condition.detail));
      } else if (condition.held === true) {
        notices.push(notice("preflight-held", condition.id, "held"));
      }
    }
    if (preflight.versionMismatch?.mismatched) {
      notices.push(
        notice("engine-version-mismatch", "engine-readiness", preflight.versionMismatch.detail),
      );
    }
    for (const n of preflight.notices ?? []) {
      // `evaluatePreflight` raises its OWN `engine-version-mismatch` notice from the same
      // `versionMismatch` input the branch above reads, so passing it through here as well
      // would double-report one mismatch. The notice-channel table (TSPEC §Interfaces)
      // gives this code exactly one producer inside `collectNotices`; that producer is the
      // branch above, and this filter is what keeps "exactly one" true.
      if (n && n.code === "engine-version-mismatch") continue;
      notices.push(n);
    }
  }

  // AC-4.7 (CR v2 F-01): `parseEscalationLog` returns each skipped block as a RECORD
  // (`{blockIndex, heading, reason}`, `escalation-view.mjs` `parseBlock`), while a Notice's
  // `text` is declared a string (TSPEC §Interfaces, `notice(code, subject, text: string)`).
  // Rendering the record here — rather than pushing the object through as `text` — is what
  // makes AC-4.7's "enough detail to find it" survive to an operator surface: an object
  // reaches a console or a JSON-free summary line as `[object Object]`, which names no
  // location at all. A `parseNotices` member that is already a string is passed through
  // unchanged, so the builder's own callers keep their existing shape.
  for (const parseNotice of parseNotices ?? []) {
    const text =
      typeof parseNotice === "string"
        ? parseNotice
        : `block ${parseNotice.blockIndex} ("${parseNotice.heading}"): ${parseNotice.reason}`;
    notices.push(notice("escalation-parse", "escalation", text));
  }

  for (const failure of appendFailures ?? []) {
    notices.push(notice("escalation-append-failed", failure.path, failure.message));
  }

  for (const skipped of report?.skipped ?? []) {
    notices.push(notice("candidate-skipped-not-ready", skipped.feature, skipped.reason));
  }

  if (queue && queue.readable === false) {
    notices.push(notice("queue-unreadable", "queue", "The queue file could not be read."));
  }

  if (restarted) {
    notices.push(
      notice("session-restarted", "session", "A supplied token failed to decode; session restarted."),
    );
  }

  return notices;
}

/**
 * FSPEC §3.4's per-iteration line. Returns both the field set AT-36 asserts
 * and a rendered summary sentence. `mergeStatus` is always present and is
 * the literal `"n/a"` on an outcome that ran no pipeline — never dropped.
 *
 * @param {object} args
 * @returns {{fields: Record<string, unknown>, text: string}}
 */
export function iterationLine(args) {
  const { iteration, outcome, feature, mergeStatus, prUrl, wait, notices } = args;

  const fields = { iteration, outcome, feature, mergeStatus, prUrl, wait, notices };

  // E-25/AT-49 (CR v1 F-08): the wait is rendered, not merely carried. `cli.mjs` prints
  // this `text` and nothing else, so a `wait` that appears only on `fields` is a field no
  // operator can read — which is how a bare number reached this parameter unnoticed. A
  // `null` `actualMinutes` (the host could not report what it waited) is named as such
  // rather than backfilled from `requestedMinutes`: E-25's whole point is that the two can
  // differ, so an unknown actual must never masquerade as an honoured one.
  const waitClause =
    wait && typeof wait === "object"
      ? ` Wait: requested ${wait.requestedMinutes}m, actual ${
          wait.actualMinutes === null || wait.actualMinutes === undefined
            ? "unknown"
            : `${wait.actualMinutes}m`
        }.`
      : "";

  const text = `Iteration ${iteration}: ${outcome}${feature ? ` (${feature})` : ""} — merge ${mergeStatus}.${waitClause}`;

  return { fields, text };
}

/**
 * FSPEC §3.4's session summary — nine fields (BR-28, AT-37). `halted`,
 * `escalationsRaised` and `operatorView` are supplied by the caller from
 * `SessionState` (and `buildOperatorView`); this function is a pure
 * pass-through assembler and reads no filesystem or clock itself.
 *
 * @param {object} args
 * @returns {{fields: Record<string, unknown>, text: string}}
 */
export function sessionSummary(args) {
  const {
    stopReason,
    iterations,
    merged,
    halted,
    escalationsRaised,
    operatorView,
    openEscalations,
    nextActionable,
    notices,
  } = args;

  const fields = {
    stopReason,
    iterations,
    merged,
    halted,
    escalationsRaised,
    openEscalations,
    nextActionable,
    operatorView,
    notices,
  };

  const text = `Session stopped: ${stopReason}. ${iterations} iteration(s) run; ${openEscalations} open escalation(s).`;

  return { fields, text };
}
