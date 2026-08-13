// Message catalogue seam (TSPEC §3.5, C-8, AC-6.4).
//
// Every operator-visible string the engine emits is registered here and
// emitted only through message(id, params). Severity is entry data, not the
// caller's choice, so the same condition can never be a warning on one path
// and a refusal on another. Ids are stable identifiers; wording is not.

import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";

export const MESSAGES = Object.freeze({
  "auth.api-key-refused": {
    severity: "refusal",
    template: "API key auth source \"{source}\" is not in the allowed policy set",
  },
  "auth.oauth-token": {
    severity: "info",
    template: "Auth source: OAuth token",
  },
  "auth.session": {
    severity: "info",
    template: "Auth source: session",
  },
  "auth.api-key-optin": {
    severity: "info",
    template: "Auth source: API key (opt-in)",
  },
  // FSPEC §5.1 rows 4 and 6. Both are operator-visible banner lines the same
  // way rows 1-3 are, so both are registered here rather than left as bare
  // ids the startup path renders outside the seam (BR-MSG-1).
  "auth.session-key-ignored": {
    severity: "info",
    template: "Auth source: session; the API key in the environment is ignored (no billing opt-in)",
  },
  "auth.unknown": {
    severity: "info",
    template: "Auth source: undetermined at startup; the first dispatch decides",
  },
  "guard.measurement-missing": {
    severity: "refusal",
    template:
      "no M-ENG-09 guard-deny measurement recorded for platform \"{platform}\" in " +
      "docs/_constraints/pdlc-engine-baseline.md; run {command} on this platform and commit the row",
  },
  "guard.measurement-negative": {
    severity: "refusal",
    template:
      "M-ENG-09 for platform \"{platform}\" records denyFired: no while the §6.2 PreToolUse hook " +
      "carrier still ships; per DEC-ENG-04 this is a red measurement, not a silent posture note",
  },
});

function formatTemplate(id, entry, params) {
  const required = [...entry.template.matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map((m) => m[1]);
  for (const name of required) {
    if (params == null || !(name in params)) {
      throw new Error(`catalogue: message "${id}" is missing required param "${name}"`);
    }
  }
  return entry.template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, name) => String(params[name]));
}

// §7.0's observation seam, in the shape `lib/outcome.mjs` already uses: each
// process appends its observations as JSON lines to
// `${PDLC_TEST_RUN_DIR}/{pid}.jsonl`, keyed by the run id the suite runner
// mints and every descendant inherits. `message()` is the *one* emission seam
// (§3.5, PROP-MSG-3), so recording here — never at the call sites — is what
// lets `_assert-suite-wide.mjs` compare the suite-wide emitted set to
// `messageIds()`. A live `pdlc` invocation never sets `PDLC_TEST_RUN_DIR`, so
// this is a no-op outside the suite; the record shape is fixed by
// `_assert-suite-wide.test.js`.
function recordObservation(record) {
  const dir = process.env.PDLC_TEST_RUN_DIR;
  if (!dir) return;
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${process.pid}.jsonl`);
  appendFileSync(file, `${JSON.stringify(record)}\n`);
}

export function message(id, params) {
  const entry = MESSAGES[id];
  if (!entry) {
    throw new Error(`catalogue: unknown message id "${id}"`);
  }
  // Recorded only once the emission is well-formed: a call that throws on a
  // missing param produced no operator-visible string, so it is not an
  // emission and must not count as one.
  const text = formatTemplate(id, entry, params);
  recordObservation({ kind: "message-id", id });
  return text;
}

export function messageIds() {
  return Object.keys(MESSAGES);
}
