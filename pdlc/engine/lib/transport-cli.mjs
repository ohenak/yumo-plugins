// pdlc-engine CLI transport module (Phase 1, pdlc-headless-engine, T37).
//
// The declared fallback half of the `_agent` seam REQ §1.3 names: headless
// `claude -p --output-format stream-json`, invoked as a child process rather
// than through the Agent SDK's `query()`. Per TSPEC §3.4, this module is
// deliberately a second implementation of the SAME narrow `Transport`
// interface `lib/transport.mjs` exports — same `DispatchResult` shape (§4.2),
// same four-class error set, thrown from imported classes rather than
// transport-cli-local redefinitions so `err instanceof AuthPolicyError` (etc)
// is true regardless of which transport threw it and `classifyOutcome` stays
// transport-blind (§5.1).
//
// Hermetic tests never spawn a real `claude` child (TSPEC §7.1); every test
// drives this module over an injected `spawnFn` seam, mirrored deliberately
// off `transport.mjs`'s `queryFn` seam. `defaultSpawnFn` below — the one that
// actually shells out — is exercised only by the opt-in live path and is not
// itself under the hermetic suite's construction guard for that reason.

import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  AuthPolicyError,
  RateLimitedError,
  TimeoutError,
  TransportError,
  DEFAULT_PERMISSION_MODE,
} from "./transport.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// pdlc/engine/lib -> pdlc/engine -> pdlc (the plugin root, same value
// guard-parity.test.js's PLUGIN_ROOT resolves independently).
const DEFAULT_PLUGIN_ROOT = path.dirname(path.dirname(__dirname));

const DEFAULT_API_KEY_SOURCE_POLICY = ["none"];
const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000; // 30 min, matches transport.mjs's own default

/**
 * Builds a fresh, per-dispatch `--settings` JSON file registering the
 * shipped guard script as a `command`-type `PreToolUse` hook on the `Bash`
 * matcher — the fallback's carrier per TSPEC §6.2, mirroring the shape
 * `pdlc/hooks/hooks.json` already ships and the primary transport's
 * `buildGuardHooksOption` builds in-process. Never a reimplementation of the
 * guard's decision procedure (NG-1) — the file only names the shipped script
 * path; the script itself makes every deny/allow call.
 *
 * The returned handle's lifetime is per dispatch, never process-global
 * (PROP-GUARD-10b): each call gets its own scratch directory, and `cleanup()`
 * removes only that call's file, leaving any other outstanding handle's file
 * untouched.
 *
 * @param {object} opts
 * @param {string} [opts.pluginRoot] Defaults to this module's own plugin root.
 * @param {string} [opts.scriptPath] Defaults to `{pluginRoot}/hooks/scripts/guard-harvest-before-delete.sh`.
 * @returns {{path: string, cleanup: () => void}}
 */
export function buildGuardSettingsFile({ pluginRoot = DEFAULT_PLUGIN_ROOT, scriptPath } = {}) {
  const resolvedScriptPath =
    scriptPath || path.join(pluginRoot, "hooks/scripts/guard-harvest-before-delete.sh");

  const dir = mkdtempSync(path.join(os.tmpdir(), "pdlc-guard-settings-"));
  const filePath = path.join(dir, "settings.json");

  const settings = {
    hooks: {
      PreToolUse: [
        {
          matcher: "Bash",
          hooks: [{ type: "command", command: `"${resolvedScriptPath}"` }],
        },
      ],
    },
  };
  writeFileSync(filePath, JSON.stringify(settings, null, 2));

  return {
    path: filePath,
    cleanup() {
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

function looksLikeRateLimit(err) {
  if (!err || typeof err !== "object") return false;
  if (err.status === 429) return true;
  const haystack = `${err.name || ""} ${err.message || ""}`;
  return /rate.?limit/i.test(haystack);
}

// Deliberately mirrors `transport.mjs`'s own `classifyThrown` (TSPEC §3.4
// table, last row: "identical" absent-terminal-result handling), but returns
// only from the four classes imported above — never a transport-cli-local
// redefinition — so `instanceof` checks are transport-blind (§5.1).
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
      status: err && err.status,
      rateLimitType: err && err.rateLimitType,
      resetsAt: err && err.resetsAt,
      retryAfterMs: err && err.retryAfterMs,
    });
  }
  return new TransportError(err && err.message ? err.message : String(err), { cause: err });
}

/**
 * Splits a growing byte buffer into complete newline-delimited JSON lines,
 * yielding each parsed object as soon as its line completes. Blank lines are
 * skipped (the fixtures' own `.jsonl` shape, `fixtures/README.md`).
 */
async function* parseStreamJsonLines(childStdout) {
  let buffer = "";
  for await (const chunk of childStdout) {
    buffer += chunk.toString("utf8");
    let newlineIndex;
    while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (line.length > 0) yield JSON.parse(line);
    }
  }
  const rest = buffer.trim();
  if (rest.length > 0) yield JSON.parse(rest);
}

/**
 * The real spawn: `claude -p --output-format stream-json`, prompt written to
 * the child's stdin, stdout parsed as newline-delimited JSON into the same
 * already-parsed message shape `queryFn` yields. Not exercised by the
 * hermetic suite (TSPEC §7.1's construction guard traps any child whose
 * basename is exactly "claude"); every hermetic test supplies its own
 * `spawnFn` instead.
 *
 * Builds and tears down its own per-dispatch `--settings` guard carrier
 * (TSPEC §6.2): the file is created immediately before spawning and removed
 * once the stdout stream is fully consumed — success, error or abort alike —
 * via the generator's `finally`, so no carrier file outlives the dispatch
 * that built it (PROP-GUARD-10b's process-global prohibition, restated here
 * for the real path).
 */
async function defaultSpawnFn({ prompt, options }) {
  const args = ["-p", "--output-format", "stream-json"];
  if (options.model !== undefined) args.push("--model", options.model);
  if (options.maxTurns !== undefined) args.push("--max-turns", String(options.maxTurns));
  if (options.permissionMode !== undefined) args.push("--permission-mode", options.permissionMode);
  if (options.allowDangerouslySkipPermissions) args.push("--dangerously-skip-permissions");

  const guardHandle = buildGuardSettingsFile({ pluginRoot: options.guardPluginRoot });
  args.push("--settings", guardHandle.path);

  const child = spawn("claude", args, {
    cwd: options.cwd,
    env: options.env,
  });
  child.stdin.write(prompt);
  child.stdin.end();

  // Same timer as the SDK transport's own abort (transport.mjs:161-166);
  // this transport's own escalation on top of it, since a spawned child does
  // not obey an AbortSignal on its own the way the SDK's `query()` does:
  // SIGTERM first, SIGKILL if the child has not exited shortly after
  // (TSPEC §3.4's parity table, "timeout" row).
  const signal = options.abortController && options.abortController.signal;
  if (signal) {
    const onAbort = () => {
      child.kill("SIGTERM");
      setTimeout(() => {
        if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
      }, 5000).unref();
    };
    if (signal.aborted) onAbort();
    else signal.addEventListener("abort", onAbort, { once: true });
  }

  async function* stream() {
    try {
      yield* parseStreamJsonLines(child.stdout);
    } finally {
      guardHandle.cleanup();
    }
  }

  return stream();
}

/**
 * The CLI fallback's `createTransport` counterpart (TSPEC §3.4): same
 * four-key `dispatch(prompt, { model, cwd, timeoutMs, maxTurns })` boundary,
 * same `DispatchResult` shape, same four-class error set — thrown from the
 * classes imported above, never redefined here, so `classifyOutcome` (§5.1)
 * stays transport-blind. Every difference from `createTransport` is
 * mechanism only: `spawnFn` in place of `queryFn`, CLI flags in place of SDK
 * options, and a per-dispatch `--settings` guard carrier in place of the
 * in-process `hooks.PreToolUse` callback (§6.2).
 *
 * @param {object} [opts]
 * @param {Function} [opts.spawnFn] Injectable in place of the real CLI spawn — the test seam.
 *   Called as `spawnFn({ prompt, options })` and must return an async-iterable message stream of
 *   already-parsed messages, the same shape `queryFn` yields.
 * @param {object} [opts.env] Base environment to spread into every dispatch's child env.
 * @param {string[]} [opts.apiKeySourcePolicy] Allowed `apiKeySource` values. Default: only "none".
 * @param {number} [opts.defaultTimeoutMs] Used when a dispatch call omits `timeoutMs`.
 * @param {string} [opts.permissionMode] Defaults to the same production posture as the primary transport.
 * @param {string} [opts.guardPluginRoot] Plugin root the per-dispatch `--settings` carrier resolves the guard script under.
 */
export function createCliTransport({
  spawnFn = defaultSpawnFn,
  env = process.env,
  apiKeySourcePolicy = DEFAULT_API_KEY_SOURCE_POLICY,
  defaultTimeoutMs = DEFAULT_TIMEOUT_MS,
  permissionMode = DEFAULT_PERMISSION_MODE,
  guardPluginRoot = DEFAULT_PLUGIN_ROOT,
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

    // Same proxy-passthrough rule as the SDK transport (C-2, G-4): spread,
    // never replaced, so ANTHROPIC_BASE_URL / ANTHROPIC_CUSTOM_HEADERS reach
    // this transport's spawned child too.
    const dispatchEnv = { ...env };

    const abortController = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      abortController.abort();
    }, timeoutMs);

    const options = { abortController, env: dispatchEnv, guardPluginRoot };
    if (permissionMode !== undefined && permissionMode !== null) {
      options.permissionMode = permissionMode;
      if (permissionMode === "bypassPermissions") options.allowDangerouslySkipPermissions = true;
    }
    if (model !== undefined) options.model = model;
    if (cwd !== undefined) options.cwd = cwd;
    if (maxTurns !== undefined) options.maxTurns = maxTurns;

    let apiKeySource = null;
    const rateLimitEvents = [];
    let terminalResult = null;

    try {
      let stream;
      try {
        stream = await spawnFn({ prompt, options });
      } catch (err) {
        throw classifyThrown(err, { timedOut, timeoutMs });
      }

      for await (const message of stream) {
        if (!message || typeof message !== "object" || typeof message.type !== "string") {
          throw new TransportError("malformed message in CLI stream-json output (missing type)", {
            cause: message,
          });
        }

        if (message.type === "system" && message.subtype === "init") {
          apiKeySource = message.apiKeySource ?? null;
          if (!apiKeySourcePolicy.includes(apiKeySource)) {
            const reported = apiKeySource === null ? "absent" : apiKeySource;
            throw new AuthPolicyError(
              `CLI reported apiKeySource "${reported}", policy only allows: ${apiKeySourcePolicy.join(", ")}`,
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
      throw new TransportError("CLI stream ended without a terminal result message");
    }

    if (terminalResult.subtype !== "success") {
      const errs = Array.isArray(terminalResult.errors) ? terminalResult.errors : [];
      throw new TransportError(
        `CLI dispatch failed: ${terminalResult.subtype}` +
          (errs.length ? ` — ${errs.join("; ")}` : ""),
        { cause: terminalResult }
      );
    }

    return {
      text: terminalResult.result,
      sessionId: terminalResult.session_id,
      costUsd: terminalResult.total_cost_usd,
      usage: terminalResult.usage,
      permissionDenials: Array.isArray(terminalResult.permission_denials)
        ? terminalResult.permission_denials
        : [],
      rateLimitEvents,
      apiKeySource,
    };
  }

  return { dispatch };
}
