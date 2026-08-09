// pdlc-engine run wiring (Phase 3, pdlc-headless-engine).
//
// This is the module that actually executes a pdlc pipeline: it loads the
// CANONICAL workflow modules — `pdlc/workflows/orchestrate-dev.js` and
// `pdlc/workflows/orchestrate-queue.js`, this repo's tested sources — and calls
// their default-exported `main()` with an injection object built from the
// engine's adapter seams.
//
// Three rules govern everything below.
//
// 1. **The modules are never edited and never vendored** (REQ C-4 / AC-1.5).
//    They are resolved by relative path from this file inside the pdlc repo
//    checkout. That is the in-repo development arrangement; packaging the engine
//    for machine-wide install is a separate, later feature.
//
// 2. **Only the seams that MUST be overridden are passed.** Every workflow seam
//    whose default is a working plain-Node implementation — `_readFile`,
//    `_writeFile`, `_appendFile`, `_listFiles`, `_checkFile`, `_hashFile`,
//    `_ghRun`, `_checkCi`, `_mergeWorktree`, `_recordQueueRow`,
//    `_rebaseOntoDefault`, the advisory seams, the probe seams — is left alone,
//    so the engine exercises the same code paths the module tests cover. What
//    must be overridden is exactly the set the Claude Code *runtime* used to
//    provide and plain Node does not: `_agent` (the module stub throws outside
//    the runtime), `_parallel`, `_pipeline`, `_phase`, `_log`, `_runCommand`
//    (whose module default `NO_RUN_COMMAND` is null and would silently degrade
//    Phase I's script-owned gate) — and `_git`.
//
//    `_git` is the one exception to the "leave working defaults alone" rule, and
//    it is not a style choice. The module's `defaultGit` works fine in plain
//    Node, but the branch guard tests seam IDENTITY, not behaviour:
//    `branchGuardTransport` (orchestrate-dev.js:3487) hands back a transport
//    only when `_git !== defaultGit`, because the guard will not mutate a
//    checkout through a seam nobody explicitly chose. Leaving the default in
//    place therefore made the guard announce itself INERT and skip — and the
//    pipeline ran a whole phase on whatever branch the tree happened to be on,
//    which is the precise failure the guard exists to prevent. Injecting the
//    engine's own `createGit` is how the engine opts in.
//
// 3. **The modules address the filesystem consumer-relative.** They never call
//    `process.cwd()`; they hand bare relative paths ("docs/{f}/REQ-{f}.md") to
//    `fs`, and `defaultGit` shells out to `git` with no cwd option. Both
//    therefore resolve against the *process* working directory. So the engine
//    chdir's into the consumer repo root for the duration of the run and
//    restores the previous cwd in a `finally`. This is process-global state: one
//    pipeline per process, which is what the CLI does.

import path from "node:path";
import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

/** The canonical workflow modules, by relative path inside this repo checkout. */
export const WORKFLOW_MODULE_URLS = Object.freeze({
  dev: new URL("../../workflows/orchestrate-dev.js", import.meta.url).href,
  queue: new URL("../../workflows/orchestrate-queue.js", import.meta.url).href,
});

/** Absolute filesystem path of a canonical workflow module (AC-1.5 evidence). */
export function workflowModulePath(name) {
  const url = WORKFLOW_MODULE_URLS[name];
  if (!url) throw new Error(`unknown workflow module: ${name}`);
  return fileURLToPath(url);
}

/** Default module loader. Injectable so tests can prove import never happened. */
async function defaultImportWorkflow(name) {
  return import(WORKFLOW_MODULE_URLS[name]);
}

/**
 * The six seams the engine overrides, and nothing else (rule 2 above).
 *
 * `adapter` is what `createAdapter()` (lib/adapter.mjs) returns. Extra fields on
 * it — `composePrompt` — are deliberately not forwarded: the workflow modules
 * ignore unknown keys, but passing only the declared seams keeps the injection
 * object readable against the modules' own parameter list.
 *
 * @param {object} adapter
 * @returns {{_agent, _parallel, _pipeline, _phase, _log, _runCommand}}
 */
export function devInjection(adapter) {
  requireAdapter(adapter);
  return {
    _agent: adapter._agent,
    _parallel: adapter._parallel,
    _pipeline: adapter._pipeline,
    _phase: adapter._phase,
    _log: adapter._log,
    _runCommand: adapter._runCommand,
    _git: adapter._git,
  };
}

/**
 * The queue's overrides.
 *
 * `orchestrate-queue.js`'s `main()` declares NO `_parallel`, `_pipeline` or
 * `_runCommand` parameter, so only five seams apply. `_git` is here for the
 * reason rule 2 gives above, and because the queue itself shells git directly
 * (the A2 seam's citation grep at orchestrate-queue.js:818, the queue-row
 * commit); the fifth, `_runPipeline`, is a **necessity, not a preference**:
 *
 *   orchestrate-queue.js:1415 calls `runPipelineFn({ reqPath: entry.reqPath })`
 *   with NO seams at all. Its default (`realMain`, the imported orchestrate-dev
 *   entry) would therefore run the whole dev pipeline on the modules' own
 *   defaults, whose `_agent` stub throws "agent() not available outside Claude
 *   Code runtime". Under the Claude Code workflow runtime that is fine — the
 *   bundle inlines both modules and the runtime supplies a global `agent()`. In
 *   plain Node there is no such global, so the engine must supply the delegated
 *   pipeline's seams itself by wrapping `_runPipeline`.
 *
 * @param {object} adapter
 * @param {(args: object) => Promise<object>} runPipeline the wrapped dev entry
 */
export function queueInjection(adapter, runPipeline) {
  requireAdapter(adapter);
  return {
    _agent: adapter._agent,
    _log: adapter._log,
    _phase: adapter._phase,
    _git: adapter._git,
    _runPipeline: runPipeline,
  };
}

function requireAdapter(adapter) {
  if (!adapter || typeof adapter._agent !== "function") {
    throw new Error("run: an adapter with an _agent seam is required (see lib/adapter.mjs)");
  }
}

/**
 * A startup result (lib/startup.mjs `runStartupChecks`) that did not pass means
 * **dispatch nothing** (REQ AC-3.2 / C-10). The refusal is expressed here, above
 * the dynamic import, so a failed handshake aborts before the workflow modules
 * are even loaded — no module-evaluation side effects, no transport, no agent.
 */
function refusalFor(startup) {
  if (!startup) return null;
  if (startup.ok) return null;
  return startup.reason || "startup checks failed";
}

function resolveCwd(cwd) {
  const abs = path.resolve(cwd ?? process.cwd());
  if (!existsSync(abs) || !statSync(abs).isDirectory()) {
    throw new Error(`run: consumer repo root is not a directory: ${abs}`);
  }
  return abs;
}

/**
 * Run `fn` with the process cwd pinned to the consumer repo root (rule 3).
 * Restores the previous cwd whatever happens.
 */
async function withCwd(dir, fn) {
  const previous = process.cwd();
  const changed = path.resolve(previous) !== dir;
  if (changed) process.chdir(dir);
  try {
    return await fn();
  } finally {
    if (changed) process.chdir(previous);
  }
}

/**
 * `pdlc dev` — run the full pipeline for one REQ.
 *
 * Bound to `orchestrate-dev.js`'s entry contract exactly as declared at
 * orchestrate-dev.js:8916 —
 *   `main({ reqPath, forcePhases = null, ...seams }) => Promise<FinalReport>`
 * `reqPath` is required and must match `docs/{feature}/REQ-{feature}.md`;
 * `forcePhases` is optional and is a comma/space separated subset of
 * `R, F, T, P, D, PR` or the token `all`. The module VALIDATES both itself and
 * returns a halted report rather than throwing, so the engine forwards them
 * verbatim and never pre-validates.
 *
 * @param {object} args
 * @param {string} args.reqPath consumer-relative REQ path
 * @param {string|null} [args.forcePhases]
 * @param {string} [args.cwd] consumer repo root (AC-2.5)
 * @param {object} args.adapter seams from `createAdapter()`
 * @param {object} [args.startup] `runStartupChecks()` result; a failing one refuses
 * @param {Function} [args.importWorkflow] test seam for the dynamic import
 * @returns {Promise<{ok: boolean, report: object|null, refusal: string|null}>}
 */
export async function runDev({
  reqPath,
  forcePhases = null,
  cwd,
  adapter,
  startup = null,
  importWorkflow = defaultImportWorkflow,
} = {}) {
  const refusal = refusalFor(startup);
  if (refusal) return { ok: false, report: null, refusal };

  const injection = devInjection(adapter);
  const root = resolveCwd(cwd);

  const mod = await importWorkflow("dev");
  const devMain = mod.default;
  if (typeof devMain !== "function") {
    throw new Error("run: orchestrate-dev.js has no default-exported main()");
  }

  const report = await withCwd(root, () =>
    devMain({ reqPath, forcePhases, ...injection })
  );
  return { ok: report && report.outcome !== "halted", report, refusal: null };
}

/**
 * `pdlc queue` — one pass of the serial queue driver.
 *
 * Bound to `orchestrate-queue.js`'s entry contract at orchestrate-queue.js:1033 —
 *   `main({ queuePath = "docs/_queue/QUEUE.md", ...seams }) => Promise<QueueReport>`
 * The report's `outcome` is one of `blocked | no-queue | idle | ran | halted`.
 *
 * @param {object} args
 * @param {string} [args.queuePath]
 * @param {string} [args.cwd]
 * @param {object} args.adapter
 * @param {object} [args.startup]
 * @param {Function} [args.importWorkflow]
 * @returns {Promise<{ok: boolean, report: object|null, refusal: string|null}>}
 */
export async function runQueue({
  queuePath,
  cwd,
  adapter,
  startup = null,
  importWorkflow = defaultImportWorkflow,
} = {}) {
  const refusal = refusalFor(startup);
  if (refusal) return { ok: false, report: null, refusal };

  requireAdapter(adapter);
  const root = resolveCwd(cwd);

  const [queueMod, devMod] = await Promise.all([
    importWorkflow("queue"),
    importWorkflow("dev"),
  ]);
  const queueMain = queueMod.default;
  const devMain = devMod.default;
  if (typeof queueMain !== "function") {
    throw new Error("run: orchestrate-queue.js has no default-exported main()");
  }
  if (typeof devMain !== "function") {
    throw new Error("run: orchestrate-dev.js has no default-exported main()");
  }

  // See queueInjection's doc comment: the queue hands the delegated pipeline
  // `{ reqPath }` and nothing else, so the seams are re-attached here.
  const devSeams = devInjection(adapter);
  const runPipeline = (args) => devMain({ ...args, ...devSeams });

  const injection = queueInjection(adapter, runPipeline);
  const report = await withCwd(root, () =>
    queueMain({ ...(queuePath ? { queuePath } : {}), ...injection })
  );
  return { ok: report && report.outcome !== "halted" && report.outcome !== "blocked", report, refusal: null };
}

/**
 * `pdlc queue --loop` (REQ AC-1.3, `queue.loopIdleExit`): repeat one feature at
 * a time until no ready row remains, then stop. `idle` and `no-queue` are the
 * clean exits; `halted` and `blocked` stop the loop and are reported.
 *
 * @returns {Promise<{passes: object[], outcome: string}>}
 */
export async function runQueueLoop({ maxPasses = 100, ...args } = {}) {
  const passes = [];
  for (let i = 0; i < maxPasses; i++) {
    const pass = await runQueue(args);
    passes.push(pass);
    if (pass.refusal) return { passes, outcome: "refused" };
    const outcome = pass.report && pass.report.outcome;
    if (outcome !== "ran") return { passes, outcome: outcome || "unknown" };
  }
  return { passes, outcome: "max-passes" };
}
