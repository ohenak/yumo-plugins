// pdlc-engine outcome taxonomy (Phase 1, pdlc-headless-engine).
//
// TSPEC §5.1: the six-member outcome catalogue and the one total classifier
// over it. This module is transport-blind and policy-free (R-ARCH-2) — it
// maps `(error, result, reportedFailure)` to a member of OUTCOMES and holds
// no prose knowledge of phases, skills, or verdict grammar. The
// `reportedFailure` predicate is computed by the caller (layer 2, e.g.
// `lib/adapter.mjs`), never by this module.

import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";

import {
  AuthPolicyError,
  RateLimitedError,
  TimeoutError,
  TransportError,
} from "./transport.mjs";

// §7.0's observation seam: each process appends its observations as JSON
// lines to `${PDLC_TEST_RUN_DIR}/{pid}.jsonl`, keyed by the run id the
// suite runner mints and every descendant inherits. classifyOutcome's
// result has no terminal half (§7.0), so it is appended at its one call.
// A live `pdlc` invocation never sets `PDLC_TEST_RUN_DIR` (PM Q-01), so
// this is a no-op outside the suite — the record shape (`{ kind: "outcome",
// value }`) is fixed by `_assert-suite-wide.test.js` (T19).
function recordObservation(record) {
  const dir = process.env.PDLC_TEST_RUN_DIR;
  if (!dir) return;
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${process.pid}.jsonl`);
  appendFileSync(file, `${JSON.stringify(record)}\n`);
}

export const OUTCOMES = Object.freeze([
  "ok",
  "retryable",
  "timeout",
  "auth-failure",
  "transport-contract-violation",
  "agent-reported-failure",
]);

/**
 * @param {object} input
 * @param {Error|null} [input.error] One of the four typed transport errors,
 *   or a falsy value when the dispatch produced a terminal result.
 * @param {object} [input.result] The dispatch's terminal result (unused by
 *   the classification itself; accepted for shape symmetry with callers).
 * @param {boolean} [input.reportedFailure] Caller-computed predicate: true
 *   when the dispatch's own result text is a reported failure.
 * @returns {string} A member of OUTCOMES. Total: never throws, never
 *   returns undefined.
 */
export function classifyOutcome({ error, reportedFailure } = {}) {
  const outcome = (() => {
    if (error instanceof AuthPolicyError) return "auth-failure";
    if (error instanceof RateLimitedError) return "retryable";
    if (error instanceof TimeoutError) return "timeout";
    if (error instanceof TransportError) return "transport-contract-violation";
    if (reportedFailure === true) return "agent-reported-failure";
    return "ok";
  })();
  recordObservation({ kind: "outcome", value: outcome });
  return outcome;
}
