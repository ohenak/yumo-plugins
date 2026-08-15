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

import { spawnSync, execFileSync } from "node:child_process";
import path from "node:path";

/**
 * Shared child-env helper (TSPEC §3.4, BR-PARITY-5): both transports extend
 * the parent/provided env through this single function, never construct a
 * child env from scratch, so the proxy-passthrough rule
 * (ANTHROPIC_BASE_URL / ANTHROPIC_CUSTOM_HEADERS) has exactly one
 * definition. `transport-cli.mjs` (T37) imports and reuses this same export.
 */
export function buildDispatchEnv(env) {
  return { ...env };
}

/**
 * Refuses a `cwd` that is not a git repository, naming the path (PROP-DISP-7
 * / EC-DISP-5). Exported so both the CLI's rung-0 stage and `doctor` call the
 * same function rather than two drifting copies of a `git rev-parse` shell
 * out (BR-START-3, "the same ladder").
 */
export function assertCwdIsGitRepository(cwd) {
  try {
    execFileSync("git", ["rev-parse", "--is-inside-work-tree"], { cwd, stdio: "pipe" });
  } catch (err) {
    throw new Error(`cwd is not a git repository: ${cwd}`, { cause: err });
  }
}

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

/**
 * The permission mode every dispatch runs under, unless the caller overrides it.
 *
 * Measured, 2026-08-09, SDK `query()` with the option omitted: the session
 * reports `permissionMode: "default"`, and with no `canUseTool` handler an
 * "ask" decision is TERMINAL — the tool call is denied outright (sdk.d.ts:4337:
 * "Without one (bare -p / SDK query() with no canUseTool), 'ask' decisions are
 * terminal"). A `Write` was denied, the run still ended `subtype: "success"`
 * with the model replying "DONE", and no file existed afterwards.
 *
 * That is fatal for this pipeline specifically: every pdlc agent's real output
 * is a FILE (REQ/FSPEC/cross-review/PROPERTIES), not its final message, and
 * every gate downstream reads those files. Denied silently, a reviewer
 * "completes" without writing its cross-review, and `extractFileVerdict` then
 * finds no verdict — the "reviewer returned no VERDICT" failure, one layer down.
 *
 * So the mode is set EXPLICITLY rather than inherited from ambient settings, and
 * it is set to bypass: an unattended pipeline has no human to answer a prompt,
 * and a half-permissioned run is worse than either extreme because it fails
 * silently. `allowDangerouslySkipPermissions` is the SDK's required paired
 * acknowledgement (sdk.d.ts:1772). Overridable per REQ, and always printed in
 * the startup banner — this is not a setting that should ever be a surprise.
 */
export const DEFAULT_PERMISSION_MODE = "bypassPermissions";

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
    // Forward whatever retry-relevant fields the thrown error itself carried
    // (e.g. an SDK/HTTP error object exposing `status`, `retryAfterMs`,
    // `resetsAt`, `rateLimitType`) — the adapter's pause/resume policy
    // (lib/adapter.mjs) prefers these over its own exponential backoff.
    return new RateLimitedError(err && err.message ? err.message : "rate limited", {
      cause: err,
      status: err && err.status,
      rateLimitType: err && err.rateLimitType,
      resetsAt: err && err.resetsAt,
      retryAfterMs: err && err.retryAfterMs,
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
  permissionMode = DEFAULT_PERMISSION_MODE,
  hooksOption,
} = {}) {
  /**
   * @param {string} prompt
   * @param {object} [dispatchOpts]
   * @param {string} [dispatchOpts.model]
   * @param {string} [dispatchOpts.cwd]
   * @param {number} [dispatchOpts.timeoutMs]
   * @param {number} [dispatchOpts.maxTurns]
   * @returns {Promise<{text: string, sessionId: string, costUsd: number, usage: object, rateLimitEvents: object[], apiKeySource: string|null}>}
   */
  async function dispatch(prompt, dispatchOpts = {}) {
    const { model, cwd, timeoutMs = defaultTimeoutMs, maxTurns } = dispatchOpts;

    // Proxy-passthrough contract (REQ C-2 / G-4): the child env is always the
    // parent/provided env *spread* into a new object, never replaced — this is
    // what lets ANTHROPIC_BASE_URL / ANTHROPIC_CUSTOM_HEADERS (the local
    // headroom proxy) reach every spawned call transparently. Built through
    // the shared `buildDispatchEnv` helper so both transports extend the
    // parent env through exactly one definition (BR-PARITY-5).
    const dispatchEnv = buildDispatchEnv(env);

    const abortController = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      abortController.abort();
    }, timeoutMs);

    // `cwd` and `timeoutMs` are present on the options object on EVERY
    // dispatch (PROP-DISP-1), even when dispatchOpts omits them — a caller
    // reading `options` must never distinguish "omitted" from "absent-and-
    // undefined". `model` and `maxTurns` stay conditional: no fabricated
    // value may be invented for either (EC-DISP-4).
    const options = { abortController, env: dispatchEnv, cwd, timeoutMs };
    // Set explicitly, never left to the SDK default — see DEFAULT_PERMISSION_MODE.
    if (permissionMode !== undefined && permissionMode !== null) {
      options.permissionMode = permissionMode;
      // The SDK requires this paired acknowledgement for bypass, and rejects the
      // combination without it (sdk.d.ts:1772).
      if (permissionMode === "bypassPermissions") options.allowDangerouslySkipPermissions = true;
    }
    if (model !== undefined) options.model = model;
    if (maxTurns !== undefined) options.maxTurns = maxTurns;
    // The engine-built guard configuration (§6.2) is a constructor-level
    // option, never a per-dispatch one — it is not part of the four-key
    // dispatchOpts boundary and cannot be smuggled or overridden per call.
    if (hooksOption !== undefined) options.hooks = hooksOption;

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
            // enforced at the first opportunity the stream offers it. An
            // absent source (raw null/undefined) is named literally as
            // "absent" (BR-AUTH-4) rather than coerced into the string
            // "null", which would read as a recognised-but-disallowed value.
            const reported = apiKeySource === null ? "absent" : apiKeySource;
            throw new AuthPolicyError(
              `SDK reported apiKeySource "${reported}", policy only allows: ${apiKeySourcePolicy.join(", ")}`,
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

    // Only `SDKResultSuccess` carries a `result` field; every error subtype
    // (`error_during_execution`, `error_max_turns`, `error_max_budget_usd`,
    // `error_max_structured_output_retries`) omits it entirely (sdk.d.ts:4440).
    // Reading it unconditionally yielded `undefined`, which the adapter turned
    // into "" — so a dispatch that died on max-turns was indistinguishable from
    // one that answered with nothing, and surfaced far downstream as "reviewer
    // returned no VERDICT". A failed dispatch is a thrown dispatch.
    if (terminalResult.subtype !== "success") {
      const errs = Array.isArray(terminalResult.errors) ? terminalResult.errors : [];
      throw new TransportError(
        `SDK dispatch failed: ${terminalResult.subtype}` +
          (errs.length ? ` — ${errs.join("; ")}` : ""),
        { cause: terminalResult }
      );
    }

    return {
      text: terminalResult.result,
      sessionId: terminalResult.session_id,
      costUsd: terminalResult.total_cost_usd,
      usage: terminalResult.usage,
      // Denied tool calls on an OTHERWISE SUCCESSFUL dispatch. The agent is never
      // told a call was denied, so it reports success regardless; this is the
      // only channel through which the caller can find out. See adapter's _agent.
      permissionDenials: Array.isArray(terminalResult.permission_denials)
        ? terminalResult.permission_denials
        : [],
      rateLimitEvents,
      apiKeySource,
    };
  }

  return { dispatch };
}

const DEFAULT_GUARD_SCRIPT_RELATIVE_PATH = "hooks/scripts/guard-harvest-before-delete.sh";

/**
 * Builds the engine's own `PreToolUse` hook-carrier configuration for the
 * shipped `guard-harvest-before-delete.sh` script (TSPEC §6.2). This is the
 * primary transport's carrier; `transport-cli.mjs` (T37) carries the same
 * script through its own `--settings` file, never a second copy of the
 * script's logic (NG-1) — the shipped script is invoked as a subprocess and
 * its exit code/stderr are consumed verbatim, never reimplemented.
 *
 * The returned configuration is freshly built on every call (PROP-GUARD-10a):
 * no shared/process-global object, so two dispatches never alias one
 * another's hooks array.
 *
 * @param {object} opts
 * @param {string} opts.pluginRoot Root of the `pdlc` plugin (`{pluginRoot}/hooks/scripts/...`).
 * @param {string} [opts.scriptPath] Override for the resolved script path (test seam).
 * @param {Function} [opts.execFileFn] Injectable in place of `spawnSync` (test seam,
 *   PROP-GUARD-9): called as `execFileFn(file, args, options)`, must return the same
 *   shape as `child_process.spawnSync` (`{ status, stderr, error }`).
 */
export function buildGuardHooksOption({ pluginRoot, scriptPath, execFileFn = spawnSync } = {}) {
  const resolvedScriptPath = scriptPath || path.join(pluginRoot, DEFAULT_GUARD_SCRIPT_RELATIVE_PATH);

  async function guardCallback(input) {
    const toolCwd = (input && input.cwd) || process.cwd();
    let result;
    try {
      result = execFileFn(resolvedScriptPath, [], {
        input: JSON.stringify(input),
        cwd: toolCwd,
        env: { ...process.env, CLAUDE_PROJECT_DIR: toolCwd },
        encoding: "utf8",
      });
    } catch {
      // A host that cannot even spawn the script (e.g. the path does not
      // exist) must never be mistaken for a deny — PROP-GUARD-6b.
      return {};
    }

    // `spawnSync` reports a missing/unspawnable executable via `.error`
    // rather than throwing; treat it identically — no deny.
    if (!result || result.error) return {};

    if (result.status === 2) {
      return {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          // Byte-exact: the script's stderr IS the deny reason, never
          // paraphrased or reconstructed (PROP-GUARD-5).
          permissionDecisionReason: result.stderr || "",
        },
      };
    }

    return {};
  }

  return {
    PreToolUse: [
      {
        matcher: "Bash",
        hooks: [guardCallback],
      },
    ],
  };
}
