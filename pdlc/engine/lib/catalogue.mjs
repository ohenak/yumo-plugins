// Message catalogue seam (TSPEC §3.5, C-8, AC-6.4).
//
// Every operator-visible string the engine emits is registered here and
// emitted only through message(id, params). Severity is entry data, not the
// caller's choice, so the same condition can never be a warning on one path
// and a refusal on another. Ids are stable identifiers; wording is not.

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

export function message(id, params) {
  const entry = MESSAGES[id];
  if (!entry) {
    throw new Error(`catalogue: unknown message id "${id}"`);
  }
  return formatTemplate(id, entry, params);
}

export function messageIds() {
  return Object.keys(MESSAGES);
}
