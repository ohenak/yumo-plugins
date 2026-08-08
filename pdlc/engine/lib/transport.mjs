// pdlc-engine transport module (Phase 1, pdlc-headless-engine).
//
// Wraps the Claude Agent SDK's `query()` behind a small, typed dispatch
// surface. Per REQ §1.3 (v0.4, superseded by SPIKE-agent-sdk-auth.md): the
// Agent SDK is the primary dispatch transport under subscription auth,
// headless `claude -p` is the declared fallback behind the same `_agent`
// seam (not implemented in this module — this module is the SDK half of
// that seam). C-1: the engine must assert the SDK-reported apiKeySource is
// "none" at dispatch and refuse otherwise, fail-closed, absent an explicit
// opt-in policy override.

/**
 * Lazily imports the real SDK's `query` function. Kept as a separate,
 * dynamically-imported default so `__tests__/transport.test.js` never needs
 * the real package to be exercised — every test injects its own `queryFn`.
 */
async function defaultQueryFn(args) {
  const { query } = await import("@anthropic-ai/claude-agent-sdk");
  return query(args);
}

/** Thrown when the SDK-reported apiKeySource is not in the allowed policy set. */
export class AuthPolicyError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "AuthPolicyError";
    this.apiKeySource = details.apiKeySource;
    this.allowedSources = details.allowedSources;
  }
}

/** Thrown for a rate-limited outcome; carries whatever retry-relevant fields the SDK reported. */
export class RateLimitedError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "RateLimitedError";
    this.rateLimitType = details.rateLimitType;
    this.status = details.status;
    this.resetsAt = details.resetsAt;
    this.retryAfterMs = details.retryAfterMs;
    this.cause = details.cause;
  }
}

/** Thrown when a dispatch does not complete within its timeout budget. */
export class TimeoutError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "TimeoutError";
    this.timeoutMs = details.timeoutMs;
  }
}

/** Thrown for anything else: malformed stream, unexpected throw, missing terminal result. */
export class TransportError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "TransportError";
    this.cause = details.cause;
  }
}

const DEFAULT_API_KEY_SOURCE_POLICY = ["none"];
const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000; // 30 min, matches REQ dispatch.timeoutMinutes default

function looksLikeRateLimit(err) {
  if (!err || typeof err !== "object") return false;
  if (err.status === 429) return true;
  const haystack = `${err.name || ""} ${err.message || ""}`;
  return /rate.?limit/i.test(haystack);
}

function classifyThrown(err, { timedOut, timeoutMs }) {
  if (
    err instanceof AuthPolicyError ||
    err instanceof RateLimitedError ||
    err instanceof TimeoutError ||
    err instanceof TransportError
  ) {
    return err;
  }
  if (timedOut) {
    return new TimeoutError(`dispatch exceeded timeoutMs=${timeoutMs}`, { timeoutMs });
  }
  if (looksLikeRateLimit(err)) {
    return new RateLimitedError(err && err.message ? err.message : "rate limited", {
      cause: err,
    });
  }
  return new TransportError(err && err.message ? err.message : String(err), { cause: err });
}

/**
 * @param {object} [opts]
 * @param {Function} [opts.queryFn] Injectable in place of the SDK's `query` — the test seam.
 *   Called as `queryFn({ prompt, options })` and must return an async-iterable message stream.
 * @param {object} [opts.env] Base environment to spread into every dispatch's child env.
 *   Defaults to `process.env`. Never used to *replace* the parent environment — see dispatch().
 * @param {string[]} [opts.apiKeySourcePolicy] Allowed `apiKeySource` values. Default: only "none".
 * @param {number} [opts.defaultTimeoutMs] Used when a dispatch call omits `timeoutMs`.
 */
export function createTransport({
  queryFn = defaultQueryFn,
  env = process.env,
  apiKeySourcePolicy = DEFAULT_API_KEY_SOURCE_POLICY,
  defaultTimeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  /**
   * @param {string} prompt
   * @param {object} [dispatchOpts]
   * @param {string} [dispatchOpts.model]
   * @param {string} [dispatchOpts.cwd]
   * @param {number} [dispatchOpts.timeoutMs]
   * @param {number} [dispatchOpts.maxTurns]
   * @returns {Promise<{text: string, sessionId: string, costUsd: number, usage: object, rateLimitEvents: object[]}>}
   */
  async function dispatch(prompt, dispatchOpts = {}) {
    const { model, cwd, timeoutMs = defaultTimeoutMs, maxTurns } = dispatchOpts;

    // Proxy-passthrough contract (REQ C-2 / G-4): the child env is always the
    // parent/provided env *spread* into a new object, never replaced — this is
    // what lets ANTHROPIC_BASE_URL / ANTHROPIC_CUSTOM_HEADERS (the local
    // headroom proxy) reach every spawned call transparently. Never construct
    // a child env from scratch here.
    const dispatchEnv = { ...env };

    const abortController = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      abortController.abort();
    }, timeoutMs);

    const options = { abortController, env: dispatchEnv };
    if (model !== undefined) options.model = model;
    if (cwd !== undefined) options.cwd = cwd;
    if (maxTurns !== undefined) options.maxTurns = maxTurns;

    let apiKeySource = null;
    const rateLimitEvents = [];
    let terminalResult = null;

    try {
      let stream;
      try {
        stream = await queryFn({ prompt, options });
      } catch (err) {
        throw classifyThrown(err, { timedOut, timeoutMs });
      }

      for await (const message of stream) {
        if (!message || typeof message !== "object" || typeof message.type !== "string") {
          throw new TransportError("malformed message in SDK stream (missing type)", {
            cause: message,
          });
        }

        if (message.type === "system" && message.subtype === "init") {
          apiKeySource = message.apiKeySource ?? null;
          if (!apiKeySourcePolicy.includes(apiKeySource)) {
            // Thrown BEFORE any model output is returned — the auth gate is
            // enforced at the first opportunity the stream offers it.
            throw new AuthPolicyError(
              `SDK reported apiKeySource "${apiKeySource}", policy only allows: ${apiKeySourcePolicy.join(", ")}`,
              { apiKeySource, allowedSources: apiKeySourcePolicy }
            );
          }
        } else if (message.type === "rate_limit_event") {
          rateLimitEvents.push(message.rate_limit_info ?? message);
        } else if (message.type === "result") {
          terminalResult = message;
        }
      }
    } catch (err) {
      throw classifyThrown(err, { timedOut, timeoutMs });
    } finally {
      clearTimeout(timer);
    }

    if (timedOut) {
      throw new TimeoutError(`dispatch exceeded timeoutMs=${timeoutMs}`, { timeoutMs });
    }

    if (!terminalResult) {
      throw new TransportError("SDK stream ended without a terminal result message");
    }

    return {
      text: terminalResult.result,
      sessionId: terminalResult.session_id,
      costUsd: terminalResult.total_cost_usd,
      usage: terminalResult.usage,
      rateLimitEvents,
    };
  }

  return { dispatch };
}
