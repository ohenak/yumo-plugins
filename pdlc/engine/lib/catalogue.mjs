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
  // TSPEC §6.4 branch 0: a corrupt consumer config file refuses before every
  // pin branch, because an unparseable file cannot say whether a pin was
  // ever declared. Names the file path and the parse error, per the ladder
  // table's Result cell (§6.3, order 0).
  "config.unreadable": {
    severity: "refusal",
    template:
      "the consumer config file at {path} could not be parsed as JSON ({error}) — " +
      "refusing rather than guessing whether a pin was declared; fix or delete the file",
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
  // TSPEC §6.5 (D-4, AC-5.6, E-13): PDLC_PLUGIN_ROOT was set but dev-mode was
  // not declared for this invocation, so `resolvePluginRoot` ignored it and
  // ran discovery as if it were unset. This is not a refusal — the released
  // version still ran — so it is an info-severity notice, not a refusal.
  "env.plugin-root-ignored": {
    severity: "info",
    template:
      "PDLC_PLUGIN_ROOT was set ({value}) and ignored — dev-mode was not declared; " +
      "pass --dev to honour it",
  },
  // TSPEC §9.3 / §11, AC-2.4: the Node-floor refusal. Registered here for
  // catalogue closure and rendered-text coverage (`__tests__/provenance-path.test.js`),
  // but never emitted through `message()` in production — the guard that
  // owns this refusal, `bin/pdlc.mjs`, is dependency-free by PROP-LAUNCH-7
  // and cannot import this module, so it carries the identical wording as
  // its own literal string instead. The test above is what keeps the two
  // in sync and is this id's only real emission (§7.4's reverse direction).
  "node.below-floor": {
    severity: "refusal",
    template: "pdlc requires Node >= {floor}; found {found}",
  },
  // TSPEC §6.3 ladder branch 7: no --dev, no pin, and the store is empty or
  // missing. §11 asks the message to name the store root and the install
  // command; `resolveVersion` is pure over a listing rather than a store
  // root path, so the wording stays generic here and the store-root-naming
  // half is the caller's (§6.2 doctor/launcher) job, not this id's.
  "store.empty": {
    severity: "refusal",
    template:
      "no engine version is installed; run the documented install command to populate " +
      "the version store before running pdlc",
  },
  // TSPEC §6.3 ladder branch 4 / §11 / PROP-VER-5: names both the pinned
  // version and what is actually installed, never falls back.
  "version.pin-missing": {
    severity: "refusal",
    template:
      "engine.version is pinned to \"{version}\" but that version is not installed; " +
      "installed versions: {installed}",
  },
  // TSPEC §6.3 ladder branch 5 / §11 / PROP-VER-6: a malformed pin is never
  // read as "no pin".
  "version.pin-malformed": {
    severity: "refusal",
    template:
      "engine.version \"{value}\" is not a parseable semver version; refusing rather " +
      "than treating it as no pin",
  },
  // TSPEC §6.3 ladder branch 2 / §11 / PROP-VER-8: an incomplete --dev
  // declaration never downgrades to pin or latest.
  "version.dev-incomplete": {
    severity: "refusal",
    template: "--dev was declared but {reason}; never falling back to a pinned or latest version",
  },
  // TSPEC §6.3 ladder branch 3's announcement (Q-3, PROP-VER-2/3).
  "version.announce-pin": {
    severity: "info",
    template: "engine version: {version} (pinned via .claude/pdlc.config.json)",
  },
  // TSPEC §6.3 ladder branch 6's announcement (AC-5.2, PROP-VER-2/4).
  "version.announce-latest": {
    severity: "info",
    template: "engine version: {version} (no pin declared; latest installed)",
  },
  // TSPEC §6.3 ladder branch 1's announcement (AC-5.4, PROP-VER-2/7).
  "version.announce-dev": {
    severity: "info",
    template: "engine version: dev checkout running in place at {root}",
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
