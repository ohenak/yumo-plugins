// pdlc-engine workflow-module adapter (Phase 2, pdlc-headless-engine).
//
// The workflow modules (pdlc/workflows/*.js) are the single tested source of
// truth and reach their environment only through dependency-injection seams
// (`_agent`, `_parallel`, `_pipeline`, `_phase`, `_log`, `_runCommand`, …). This
// module supplies plain-Node implementations of those seams.
//
// It deliberately does NOT port pdlc/workflows/runtime-adapter.js's IO-agent
// machinery (rtReadFile / rtWriteFile / base64 chunking / hash verification).
// That machinery exists only because the Claude Code workflow runtime has no
// filesystem and had to smuggle bytes through an agent's final message. In plain
// Node, `fs` is right there — the modules' own defaults (defaultReadFile et al.)
// already do the job, so those seams are simply left unwired.
//
// What IS ported is `rtSkillPrompt`'s intent (runtime-adapter.js:47) and
// `rtAgent`'s signature bridge (:57): the modules call `_agent(skill, prompt,
// opts)` with a skill identifier, while the transport takes a single composed
// prompt string. See lib/skills.mjs for the composition, which inlines the
// SKILL.md bytes instead of instructing a Skill-tool call (REQ AC-3.1).

import { execFile } from "node:child_process";
import { loadSkill, composeDispatchPrompt } from "./skills.mjs";
import { RateLimitedError } from "./transport.mjs";

// ─── rate-limit pause/resume (REQ AC-4.1, Phase 4) ─────────────────────────────
//
// Decision ladder, applied on every `_agent` dispatch that throws
// `RateLimitedError` (the transport already classifies it — see
// lib/transport.mjs — carrying `rateLimitType` / `status` / `resetsAt` /
// `retryAfterMs`):
//
//   1. Has this dispatch already paused `maxRateLimitPauses` times (default 3,
//      REQ `dispatch.retryAttempts` = "3 retries after first attempt")?
//      Yes -> rethrow the RateLimitedError as-is. The module that called
//      `_agent` sees an ordinary dispatch failure and applies its own halt
//      semantics (REQ: "exhausting bound rethrows RateLimitedError — module
//      then handles it as an ordinary dispatch failure"). The engine process
//      itself never crashes here.
//   2. Otherwise compute how long to wait, in this priority order:
//        a. `retryAfterMs` if the error carries a finite, positive value.
//        b. else `resetsAt - now()` (clamped to >= 0) if `resetsAt` is present.
//        c. else exponential backoff: `retryBackoffBaseMs * 2^attempt`
//           (attempt is 0-indexed: first pause = base, second = 2x, ...).
//      Whatever the source, the wait is capped at `retryBackoffCapMs` and then
//      has a small amount of jitter added (never subtracted, so the cap is a
//      floor for the capped case, not a hard ceiling breached by jitter is
//      fine — jitter only ever delays a little further, it never reduces
//      below any computed floor).
//   3. Append one row to the run's pause log: timestamp (via the injected
//      clock), the attempt number (1-indexed, i.e. "this is pause #N"),
//      waitedMs, and the rate-limit fields the error carried.
//   4. Sleep for the computed duration (via the injected sleep function) and
//      retry the SAME dispatch (same composed prompt, same dispatch options).
//
// Clock and sleep are both injectable so tests never touch a real timer.

const DEFAULT_MAX_RATE_LIMIT_PAUSES = 3;
const DEFAULT_RETRY_BACKOFF_BASE_MS = 30 * 1000; // 30s, per REQ dispatch.retryBackoff
const DEFAULT_RETRY_BACKOFF_CAP_MS = 15 * 60 * 1000; // 15min cap, per REQ dispatch.retryBackoff
const DEFAULT_JITTER_MS = 1000;

function defaultSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function defaultJitter(jitterMs) {
  return Math.floor(Math.random() * (jitterMs + 1));
}

/**
 * Compute the wait, in ms, before the Nth pause (attempt is 0-indexed: 0 for
 * the first pause). Exported for direct unit testing of the decision ladder
 * without going through a full dispatch.
 */
export function computeRateLimitWaitMs(
  err,
  attempt,
  { now = Date.now, baseMs = DEFAULT_RETRY_BACKOFF_BASE_MS, capMs = DEFAULT_RETRY_BACKOFF_CAP_MS, jitterMs = DEFAULT_JITTER_MS, jitterFn = defaultJitter } = {}
) {
  let waitMs;
  if (Number.isFinite(err && err.retryAfterMs) && err.retryAfterMs > 0) {
    waitMs = err.retryAfterMs;
  } else if (err && err.resetsAt != null) {
    // resetsAt may be a unix-epoch-seconds or -ms number; the SDK's
    // rate_limit_event carries seconds (see transport.test.js's fixture), so
    // treat anything that looks like seconds (< 10^12) as seconds.
    const resetsAtMs = err.resetsAt < 1e12 ? err.resetsAt * 1000 : err.resetsAt;
    waitMs = Math.max(0, resetsAtMs - now());
  } else {
    waitMs = baseMs * Math.pow(2, attempt);
  }
  waitMs = Math.min(waitMs, capMs);
  return waitMs + jitterFn(jitterMs);
}

/**
 * Default `_git` implementation.
 *
 * Contract, taken from the modules' own `defaultGit`
 * (orchestrate-dev.js:8609) — `_git(argv) => Promise<{ok, stdout, stderr}>`,
 * argv being an argument array, never a shell string.
 *
 * This seam MUST be injected even though the modules ship a working
 * `defaultGit`, and that is not a preference. `branchGuardTransport`
 * (orchestrate-dev.js:3487) returns a transport only when
 * `typeof _git === "function" && _git !== defaultGit`, so a run that leaves the
 * default in place makes the branch guard report itself **inert** and skip:
 * the pipeline then commits onto whatever branch the tree happened to be on —
 * the exact failure the guard was written for. The guard refuses to mutate a
 * checkout through a seam nobody chose; supplying our own is how the engine
 * chooses. Distinct function identity is therefore load-bearing.
 *
 * Unlike `_runCommand` this never goes near a shell: git argv is passed to
 * execFile directly, so no argument is word-split or glob-expanded.
 */
export function createGit({
  cwd = process.cwd(),
  env = process.env,
  maxBuffer = 32 * 1024 * 1024,
  timeoutMs = 10 * 60 * 1000,
  execFileFn = execFile,
} = {}) {
  return function git(argv) {
    const args = Array.isArray(argv) ? argv.map(String) : [];
    return new Promise((resolve) => {
      execFileFn(
        "git",
        args,
        { cwd, env: { ...env }, maxBuffer, timeout: timeoutMs, encoding: "utf8" },
        (err, stdout, stderr) => {
          resolve({
            ok: !err,
            stdout: String(stdout ?? ""),
            stderr: String(stderr ?? (err && err.message) ?? ""),
          });
        }
      );
    });
  };
}

/**
 * Default `_runCommand` implementation.
 *
 * Contract, taken verbatim from the modules' own declaration at
 * pdlc/workflows/orchestrate-dev.js:6725 —
 *   `_runCommand(command) => Promise<{ ok: boolean, output: string }>`
 * runs ONE command string at the repo root. Phase I's wave gate calls it at
 * orchestrate-dev.js:10159 (postWaveCommand), :10172 (per-wave testCommand) and
 * :10261 (the PROPERTIES V-wave gate), and every one of those three sites reads
 * exactly two things: `result.ok !== true` to decide the halt, and
 * `result.output` for the failure tail. Anything else on the object is additive
 * and ignored by the modules, so `code`/`stdout`/`stderr` are safe extras for
 * the engine's own logs.
 *
 * The command is a shell string (repo test commands legitimately contain `&&`),
 * so it is executed as `sh -c <command>` via execFile — execFile itself never
 * interpolates, and the shell binary is named explicitly rather than inherited
 * from a `shell: true` flag.
 */
export function createRunCommand({
  cwd = process.cwd(),
  env = process.env,
  maxBuffer = 32 * 1024 * 1024,
  timeoutMs = 60 * 60 * 1000,
  execFileFn = execFile,
} = {}) {
  return function runCommand(command) {
    return new Promise((resolve) => {
      execFileFn(
        "/bin/sh",
        ["-c", String(command)],
        { cwd, env: { ...env }, maxBuffer, timeout: timeoutMs },
        (err, stdout, stderr) => {
          const out = `${stdout ?? ""}${stderr ?? ""}`;
          // execFile reports a non-zero exit as an Error carrying `code`. A
          // spawn failure (no /bin/sh, timeout kill) has no numeric code; both
          // are the same thing to the caller — the command did not pass.
          const code = err ? (typeof err.code === "number" ? err.code : 1) : 0;
          resolve({
            ok: !err,
            output: err && !out.trim() ? String(err.message) : out,
            code,
            stdout: String(stdout ?? ""),
            stderr: String(stderr ?? ""),
          });
        }
      );
    });
  };
}

/**
 * Build the seam implementations the workflow modules inject.
 *
 * @param {object} args
 * @param {{dispatch: Function}} args.transport Phase 1's transport (lib/transport.mjs).
 * @param {string} args.pluginRoot Resolved plugin root (lib/skills.mjs).
 * @param {Function} [args.log] Sink for `_log` and phase banners. Default: console.log.
 * @param {string} [args.cwd] Consumer repo root — every dispatch's cwd (REQ AC-2.5).
 * @param {object} [args.env] Environment for `_runCommand`; spread, never replaced.
 * @param {Function} [args.loadSkillFn] Injected skill reader (tests).
 * @param {Function} [args.runCommandFn] Injected command runner (tests).
 * @param {number} [args.maxRateLimitPauses] Bounded pauses per dispatch (REQ AC-4.1). Default 3.
 * @param {number} [args.retryBackoffBaseMs] Exponential-backoff base. Default 30_000.
 * @param {number} [args.retryBackoffCapMs] Exponential-backoff / resetsAt cap. Default 900_000.
 * @param {number} [args.jitterMs] Upper bound of the jitter added to every wait. Default 1000.
 * @param {Function} [args.now] Injectable clock (`() => ms`). Default `Date.now`.
 * @param {Function} [args.sleep] Injectable sleep (`(ms) => Promise<void>`). Test seam.
 * @param {Function} [args.jitterFn] Injectable jitter (`(jitterMs) => ms`). Test seam.
 * @returns {{_agent, _parallel, _pipeline, _phase, _log, _runCommand,
 *            composePrompt: Function, getPauseLog: Function,
 *            getDispatchCounts: Function, getApiKeySource: Function}}
 */
export function createAdapter({
  transport,
  pluginRoot,
  log = (msg) => console.log(msg),
  cwd = process.cwd(),
  env = process.env,
  loadSkillFn = loadSkill,
  runCommandFn = null,
  gitFn = null,
  maxRateLimitPauses = DEFAULT_MAX_RATE_LIMIT_PAUSES,
  retryBackoffBaseMs = DEFAULT_RETRY_BACKOFF_BASE_MS,
  retryBackoffCapMs = DEFAULT_RETRY_BACKOFF_CAP_MS,
  jitterMs = DEFAULT_JITTER_MS,
  now = Date.now,
  sleep = defaultSleep,
  jitterFn = defaultJitter,
} = {}) {
  if (!transport || typeof transport.dispatch !== "function") {
    throw new Error("createAdapter: a transport with a dispatch() function is required");
  }
  if (!pluginRoot) {
    throw new Error("createAdapter: pluginRoot is required (resolve it before building seams)");
  }

  // Run-lifetime provenance state, accumulated across every `_agent` call this
  // adapter instance makes (one adapter per run — see bin/pdlc.mjs). Consumed
  // by the CLI's report-provenance stamp (REQ AC-4.5 / G-7), never reset mid-run.
  const pauseLog = [];
  const denialLog = [];
  const dispatchCounts = new Map();
  let lastApiKeySource = null;

  // One read per skill per process. The plugin tree is immutable for the life of
  // a run (it is a version-pinned install), and a pipeline dispatches the same
  // handful of skills dozens of times.
  const skillCache = new Map();
  function skillTextFor(skillName) {
    if (!skillCache.has(skillName)) {
      skillCache.set(skillName, loadSkillFn(pluginRoot, skillName));
    }
    return skillCache.get(skillName);
  }

  /** The composed prompt, exposed for the dry-run surface (REQ AC-3.1). */
  function composePrompt(skill, prompt) {
    const loaded = skillTextFor(skill);
    return composeDispatchPrompt(skill, loaded.text, prompt);
  }

  /**
   * `_agent(skill, prompt, opts)` — the modules' dispatch seam.
   * `opts.model` and `opts.label` are the two fields the modules actually pass
   * (mirroring rtAgent at runtime-adapter.js:57). `model` is forwarded verbatim,
   * never defaulted by the engine (REQ AC-3.3); `label` is a log-only tag.
   * Returns the dispatch text, which is what every module call site expects.
   */
  async function _agent(skill, prompt, opts = {}) {
    const { model, label, timeoutMs, maxTurns } = opts || {};
    const composed = composePrompt(skill, prompt);
    const tag = label || skill;

    log(`[dispatch] ${tag}${model ? ` (model=${model})` : ""}`);

    const dispatchOpts = { cwd };
    if (model !== undefined) dispatchOpts.model = model;
    if (timeoutMs !== undefined) dispatchOpts.timeoutMs = timeoutMs;
    if (maxTurns !== undefined) dispatchOpts.maxTurns = maxTurns;

    dispatchCounts.set(skill, (dispatchCounts.get(skill) || 0) + 1);

    let attempt = 0; // number of pauses already taken for THIS dispatch
    for (;;) {
      let result;
      try {
        result = await transport.dispatch(composed, dispatchOpts);
      } catch (err) {
        if (!(err instanceof RateLimitedError) || attempt >= maxRateLimitPauses) {
          throw err;
        }
        const waitedMs = computeRateLimitWaitMs(err, attempt, {
          now,
          baseMs: retryBackoffBaseMs,
          capMs: retryBackoffCapMs,
          jitterMs,
          jitterFn,
        });
        attempt += 1;
        pauseLog.push({
          timestamp: now(),
          skill,
          label: tag,
          attempt,
          waitedMs,
          rateLimitType: err.rateLimitType ?? null,
          status: err.status ?? null,
          resetsAt: err.resetsAt ?? null,
          retryAfterMs: err.retryAfterMs ?? null,
        });
        log(
          `[rate-limit] ${tag}: pause ${attempt}/${maxRateLimitPauses}, waiting ${waitedMs}ms` +
            (err.rateLimitType ? ` (${err.rateLimitType})` : "")
        );
        await sleep(waitedMs);
        continue; // retry the SAME dispatch
      }
      if (result && result.apiKeySource != null) lastApiKeySource = result.apiKeySource;
      // A dispatch whose tool calls were denied still terminates as `success`
      // with fluent prose claiming the work is done — the agent is not told the
      // denial happened. That is how a whole review round once "passed" having
      // written no cross-review file at all: every downstream oracle then reads
      // a document that does not exist. Denials are never silent here; they are
      // logged per dispatch and tallied for the run report.
      const denials = (result && result.permissionDenials) || [];
      if (denials.length > 0) {
        const names = denials.map((d) => (d && d.tool_name) || "?");
        const counts = {};
        for (const n of names) counts[n] = (counts[n] || 0) + 1;
        const summary = Object.entries(counts)
          .map(([n, c]) => (c > 1 ? `${n}×${c}` : n))
          .join(", ");
        log(
          `[warning] ${tag}: ${denials.length} tool call(s) DENIED (${summary}) — ` +
            `the agent was not told, so its output may claim work it never performed. ` +
            `Check permissionMode.`
        );
        denialLog.push({ skill, label: tag, tools: names, count: denials.length });
      }
      return result && result.text != null ? result.text : "";
    }
  }

  /** Modules hand `parallel()` already-started promises, not thunks (runtime-adapter.js:67). */
  async function _parallel(promises) {
    return Promise.all(promises);
  }

  /** Modules use `pipeline(label, fn)` as a labelled section, not a fan-out (:72). */
  async function _pipeline(label, fn) {
    log(`[section] ${label}`);
    return fn();
  }

  function _phase(label) {
    log(`\n=== ${label} ===`);
  }

  function _log(message) {
    log(String(message));
  }

  return {
    _agent,
    _parallel,
    _pipeline,
    _phase,
    _log,
    _runCommand: runCommandFn || createRunCommand({ cwd, env }),
    _git: gitFn || createGit({ cwd, env }),
    composePrompt,
    /** Append-only pause log accumulated across every `_agent` call so far (REQ AC-4.5). */
    getPauseLog: () => pauseLog.slice(),
    /** Append-only record of dispatches whose tool calls were denied — see `_agent`. */
    getDenialLog: () => denialLog.slice(),
    /** `{skill: count}` — a per-skill dispatch tally, the engine's proxy for "per-phase" (AC-4.5). */
    getDispatchCounts: () => Object.fromEntries(dispatchCounts),
    /** The most recently observed SDK `apiKeySource`, or null if no dispatch has completed yet. */
    getApiKeySource: () => lastApiKeySource,
  };
}
