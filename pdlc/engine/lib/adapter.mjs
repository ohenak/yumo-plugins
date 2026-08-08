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
 * @returns {{_agent, _parallel, _pipeline, _phase, _log, _runCommand,
 *            composePrompt: Function}}
 */
export function createAdapter({
  transport,
  pluginRoot,
  log = (msg) => console.log(msg),
  cwd = process.cwd(),
  env = process.env,
  loadSkillFn = loadSkill,
  runCommandFn = null,
} = {}) {
  if (!transport || typeof transport.dispatch !== "function") {
    throw new Error("createAdapter: a transport with a dispatch() function is required");
  }
  if (!pluginRoot) {
    throw new Error("createAdapter: pluginRoot is required (resolve it before building seams)");
  }

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

    const result = await transport.dispatch(composed, dispatchOpts);
    return result && result.text != null ? result.text : "";
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
    composePrompt,
  };
}
