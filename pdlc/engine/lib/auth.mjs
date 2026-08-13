// pdlc-engine startup auth posture (Phase 1, pdlc-headless-engine).
//
// TSPEC §3.2: `readLoginEvidence` inspects an injected fake filesystem for
// `~/.claude.json` and reports login evidence without ever touching a real
// operator credential (BR-AUTH-0). `resolveAuthPosture` is a pure, total
// function over `{ env, evidence, allowApiKeyBilling }` that walks the six
// first-match auth rows (BR-AUTH-1) and returns exactly one row.

/**
 * @param {object} input
 * @param {string} input.home Home directory to resolve `~/.claude.json` in.
 * @param {{ readFileSync(path: string): string }} input.fs Injected fs.
 * @param {object} [input.env] Unused by this function; accepted for shape
 *   symmetry with call sites that thread `env` alongside `home`/`fs`.
 * @returns {{ readable: boolean, loggedIn: boolean, path: string, reason: string|null }}
 */
export function readLoginEvidence({ home, fs }) {
  const filePath = `${home.replace(/\/+$/, "")}/.claude.json`;

  let raw;
  try {
    raw = fs.readFileSync(filePath);
  } catch (err) {
    const code = err && err.code ? err.code : "unknown";
    if (code === "ENOENT") {
      return { readable: false, loggedIn: false, path: filePath, reason: "absent" };
    }
    return { readable: false, loggedIn: false, path: filePath, reason: `unreadable: ${code}` };
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { readable: false, loggedIn: false, path: filePath, reason: "unreadable: EINVALID" };
  }

  const loggedIn = Boolean(parsed && typeof parsed === "object" && parsed.oauthAccount);
  return {
    readable: true,
    loggedIn,
    path: filePath,
    reason: loggedIn ? null : "no oauthAccount",
  };
}

/** EC-AUTH-1: a present-and-non-blank API key. Empty/whitespace-only/absent
 * all count as "not present" — one helper, used by every row. */
function hasApiKey(env) {
  const v = env ? env.ANTHROPIC_API_KEY : undefined;
  return typeof v === "string" && v.trim() !== "";
}

function hasOauthToken(env) {
  const v = env ? env.CLAUDE_CODE_OAUTH_TOKEN : undefined;
  return typeof v === "string" && v.trim() !== "";
}

// The six rows, in first-match order (BR-AUTH-1). Each entry's `test`
// closes over `(env, evidence, allowApiKeyBilling)`; the sixth is `true`.
export const AUTH_ROWS = Object.freeze([
  {
    row: 1,
    catalogueId: "auth.oauth-token",
    refuses: false,
    test: (env) => hasOauthToken(env),
  },
  {
    row: 2,
    catalogueId: "auth.session",
    refuses: false,
    test: (env, evidence) => !hasApiKey(env) && evidence.loggedIn === true,
  },
  {
    row: 3,
    catalogueId: "auth.api-key-optin",
    refuses: false,
    test: (env, evidence, allowApiKeyBilling) =>
      hasApiKey(env) && allowApiKeyBilling === true,
  },
  {
    row: 4,
    catalogueId: "auth.session-key-ignored",
    refuses: false,
    test: (env, evidence, allowApiKeyBilling) =>
      hasApiKey(env) && allowApiKeyBilling !== true && evidence.loggedIn === true,
  },
  {
    row: 5,
    catalogueId: "auth.api-key-refused",
    refuses: true,
    test: (env, evidence, allowApiKeyBilling) =>
      hasApiKey(env) && allowApiKeyBilling !== true && evidence.loggedIn !== true,
  },
  {
    row: 6,
    catalogueId: "auth.unknown",
    refuses: false,
    test: () => true,
  },
]);

/**
 * @param {object} input
 * @param {object} input.env Plain env-shaped object; only
 *   `CLAUDE_CODE_OAUTH_TOKEN` / `ANTHROPIC_API_KEY` are read.
 * @param {{ loggedIn: boolean, path: string }} input.evidence Output of
 *   `readLoginEvidence` (or an equivalent fixture).
 * @param {boolean} input.allowApiKeyBilling Operator opt-in flag.
 * @returns {{ row: 1|2|3|4|5|6, catalogueId: string, refuses: boolean, evidencePath: string }}
 *   Total: exactly one row is returned for every input (BR-AUTH-1).
 */
export function resolveAuthPosture({ env, evidence, allowApiKeyBilling }) {
  const matched = AUTH_ROWS.find((candidate) =>
    candidate.test(env, evidence, allowApiKeyBilling),
  );
  return {
    row: matched.row,
    catalogueId: matched.catalogueId,
    refuses: matched.refuses,
    evidencePath: evidence.path,
  };
}
