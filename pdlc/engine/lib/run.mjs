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
import { existsSync, statSync, readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { message } from "./catalogue.mjs";

// ─── Two-root workflow module resolution (TSPEC §5.2, PROP-PACK-6/7/8) ────
//
// The canonical workflow modules are resolved from one of two fixed-order
// candidate roots: the vendor root (an installed/packed tree, present only
// once `prepack` has vendored `pdlc/workflows/` into it) first, then the
// checkout root (this repo's own `pdlc/workflows/`, the arrangement rule 1
// above describes). A root only "exists" when it holds BOTH module files —
// vendoring copies them atomically, so a root with a single member is not a
// resolvable candidate.

const RUN_MJS_DIR = path.dirname(fileURLToPath(import.meta.url));

/** Root 1: the vendored tree an installed/packed engine ships (§5.2 step 3). */
const VENDOR_ROOT = path.join(RUN_MJS_DIR, "..", "vendor", "workflows");
/** Root 2: this repo's own checkout — the pre-packaging arrangement (rule 1). */
const CHECKOUT_ROOT = path.join(RUN_MJS_DIR, "..", "..", "workflows");

const MODULE_FILE_NAMES = Object.freeze({
  dev: "orchestrate-dev.js",
  queue: "orchestrate-queue.js",
});

const defaultFs = { existsSync };

function rootResolves(root, fs) {
  return Object.values(MODULE_FILE_NAMES).every((name) => fs.existsSync(path.join(root, name)));
}

/**
 * Resolves the workflow-module root, trying the vendor root before the
 * checkout root (fixed order, no fallback ambiguity — TSPEC §5.2). Throws,
 * naming both absolute paths tried, when neither resolves — the engine must
 * refuse rather than dispatch with no modules loaded (§11, PROP-CAT-3).
 *
 * @param {{fs?: {existsSync: Function}}} [args]
 * @returns {{source: "vendor"|"checkout", rootPath: string, tried: Array<{source: string, root: string, exists: boolean}>}}
 */
export function resolveWorkflowRoot({ fs = defaultFs } = {}) {
  const candidates = [
    { source: "vendor", root: VENDOR_ROOT },
    { source: "checkout", root: CHECKOUT_ROOT },
  ];
  const tried = candidates.map((c) => ({ ...c, exists: rootResolves(c.root, fs) }));
  const resolved = tried.find((c) => c.exists);
  if (!resolved) {
    throw new Error(
      message("modules.not-found", { vendorRoot: VENDOR_ROOT, checkoutRoot: CHECKOUT_ROOT }),
    );
  }
  return { source: resolved.source, rootPath: resolved.root, tried };
}

/**
 * The canonical workflow modules, as `file://` URLs, resolved from whichever
 * root `resolveWorkflowRoot` picks (TSPEC §5.2). A function — not a static
 * frozen object — because the root is decided per call, not fixed at import
 * time (V-04's prior arrangement).
 *
 * @param {{fs?: {existsSync: Function}}} [args]
 * @returns {{dev: string, queue: string}}
 */
export function WORKFLOW_MODULE_URLS({ fs = defaultFs } = {}) {
  const { rootPath } = resolveWorkflowRoot({ fs });
  return Object.freeze({
    dev: pathToFileURL(path.join(rootPath, MODULE_FILE_NAMES.dev)).href,
    queue: pathToFileURL(path.join(rootPath, MODULE_FILE_NAMES.queue)).href,
  });
}

/** Absolute filesystem path of a canonical workflow module (AC-1.5 evidence). */
export function workflowModulePath(name, { fs = defaultFs } = {}) {
  const fileName = MODULE_FILE_NAMES[name];
  if (!fileName) throw new Error(`unknown workflow module: ${name}`);
  const { rootPath } = resolveWorkflowRoot({ fs });
  return path.join(rootPath, fileName);
}

/** Default module loader. Injectable so tests can prove import never happened. */
async function defaultImportWorkflow(name) {
  const urls = WORKFLOW_MODULE_URLS();
  return import(urls[name]);
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

/**
 * The union of both canonical modules' `DISPATCHABLE_SKILLS` exports (TSPEC
 * §3.3, R-ARCH-1). This is the only site outside `devInjection`/`queueInjection`
 * that imports the workflow modules — rung 4 (`lib/startup.mjs`) calls this
 * rather than naming `pdlc/workflows/` itself.
 *
 * The union, not the invoked command's module alone: `pdlc queue` reaches
 * `se-review` only through the delegated dev pipeline and the advisory seam,
 * so a per-command reading would let a missing `se-review/SKILL.md` surface
 * mid-run instead of at startup.
 *
 * @param {object} [args]
 * @param {Function} [args.importWorkflow] test seam for the dynamic import
 * @returns {Promise<string[]>} sorted, deduped identifiers
 */
export async function loadDispatchableSkills({ importWorkflow = defaultImportWorkflow } = {}) {
  const [devMod, queueMod] = await Promise.all([
    importWorkflow("dev"),
    importWorkflow("queue"),
  ]);
  const dev = devMod.DISPATCHABLE_SKILLS || [];
  const queue = queueMod.DISPATCHABLE_SKILLS || [];
  return [...new Set([...dev, ...queue])].sort();
}

// ─── readEngineConfig (REQ O-3, resolved) ───────────────────────────────────
//
// O-3's answer: engine configuration lives in the CONSUMER's
// `.claude/pdlc.config.json` — the same file the workflow modules already
// read (`orchestrate-dev.js`'s MERGE_CONFIG_PATH), so a consumer has exactly
// one pdlc config file. The engine reads ONLY the `dispatch` section; the
// two operator-owned tunables stay flag-only (BR-CLI-2, BR-LOOP-2) and
// `resolveTunables` below enforces that regardless of what the file carries.

/** Consumer-relative engine config path — same file as MERGE_CONFIG_PATH. */
export const ENGINE_CONFIG_PATH = ".claude/pdlc.config.json";

/**
 * Read the engine's slice of the consumer config, totally: every failure
 * mode degrades to defaults with a notice, never a throw — a malformed
 * config must not turn an unattended run into an engine crash (exit 1).
 *
 * Per-key validation mirrors the workflow modules' parseImplementationConfig
 * discipline: an invalid value is dropped WITH a notice, never silently
 * coerced (a string `timeoutMinutes` reaching `* 60 * 1000` would stamp a
 * NaN timeout on every dispatch).
 *
 * §6.4's `engine` discriminant is a THIRD, separate return key, computed
 * alongside — never instead of — the `config`/`notices` pair above: an
 * unparseable file or a non-object `engine` section is `unreadable` (the
 * ladder's branch-0 refusal, `config.unreadable`, registered and emitted via
 * the catalogue seam); a present-but-empty-of-`version` section is
 * `no-pin`; anything else (no file, or a file with no `engine` key) is
 * `absent`. The `dispatch` tunables keep degrading with a notice whenever
 * the file parses — only the `engine` read refuses.
 *
 * @param {object} [args]
 * @param {string} [args.cwd] consumer repo root the path resolves against
 * @returns {{config: object, notices: string[], engine: object}} `config` is
 *   `{}` or `{dispatch: {...}}` with only valid keys — shaped for
 *   `resolveTunables`. `engine` is `{state: "absent"}`,
 *   `{state: "no-pin", config}` or `{state: "unreadable", path, error}`.
 */
export function readEngineConfig({ cwd = process.cwd() } = {}) {
  const file = path.join(cwd, ENGINE_CONFIG_PATH);
  const notices = [];
  if (!existsSync(file)) return { config: {}, notices, engine: { state: "absent" } };

  let parsed;
  try {
    parsed = JSON.parse(readFileSync(file, "utf8"));
  } catch (err) {
    notices.push(
      `Notice: ${ENGINE_CONFIG_PATH} is not readable JSON (${err.message}) — ` +
        `using defaults for every dispatch tunable.`
    );
    const errorText = message("config.unreadable", { path: file, error: err.message });
    return { config: {}, notices, engine: { state: "unreadable", path: file, error: errorText } };
  }

  const engineSection = parsed && typeof parsed === "object" ? parsed.engine : undefined;
  let engine;
  if (engineSection === undefined) {
    engine = { state: "absent" };
  } else if (
    engineSection === null ||
    typeof engineSection !== "object" ||
    Array.isArray(engineSection)
  ) {
    const errorText = message("config.unreadable", {
      path: file,
      error: `"engine" is not an object`,
    });
    engine = { state: "unreadable", path: file, error: errorText };
  } else {
    engine = { state: "no-pin", config: engineSection };
  }

  const dispatch = parsed && typeof parsed === "object" ? parsed.dispatch : undefined;
  if (dispatch === undefined) return { config: {}, notices, engine };
  if (dispatch === null || typeof dispatch !== "object" || Array.isArray(dispatch)) {
    notices.push(
      `Notice: the "dispatch" section of ${ENGINE_CONFIG_PATH} is not an object — ` +
        `using defaults for every dispatch tunable.`
    );
    return { config: {}, notices, engine };
  }

  const invalid = (key) =>
    notices.push(
      `Notice: dispatch.${key} in ${ENGINE_CONFIG_PATH} is not a valid value — using the default.`
    );
  const valid = {};
  if (dispatch.retryAttempts !== undefined) {
    if (Number.isFinite(dispatch.retryAttempts) && dispatch.retryAttempts >= 0) {
      valid.retryAttempts = dispatch.retryAttempts;
    } else invalid("retryAttempts");
  }
  if (dispatch.timeoutMinutes !== undefined) {
    if (Number.isFinite(dispatch.timeoutMinutes) && dispatch.timeoutMinutes > 0) {
      valid.timeoutMinutes = dispatch.timeoutMinutes;
    } else invalid("timeoutMinutes");
  }
  if (dispatch.retryBackoff !== undefined) {
    const rb = dispatch.retryBackoff;
    if (rb !== null && typeof rb === "object" && !Array.isArray(rb)) {
      const backoff = {};
      if (rb.baseMs !== undefined) {
        if (Number.isFinite(rb.baseMs) && rb.baseMs >= 0) backoff.baseMs = rb.baseMs;
        else invalid("retryBackoff.baseMs");
      }
      if (rb.capMs !== undefined) {
        if (Number.isFinite(rb.capMs) && rb.capMs >= 0) backoff.capMs = rb.capMs;
        else invalid("retryBackoff.capMs");
      }
      if (Object.keys(backoff).length > 0) valid.retryBackoff = backoff;
    } else invalid("retryBackoff");
  }

  return { config: Object.keys(valid).length > 0 ? { dispatch: valid } : {}, notices, engine };
}

// ─── resolveTunables (TSPEC §4.6, REQ §4.1) ─────────────────────────────────

const DEFAULT_RETRY_ATTEMPTS = 3; // "3 retries after the first attempt"
const DEFAULT_RETRY_BACKOFF_BASE_MS = 30 * 1000; // exponential from 30s
const DEFAULT_RETRY_BACKOFF_CAP_MS = 15 * 60 * 1000; // capped at 15 min
const DEFAULT_TIMEOUT_MINUTES = 30; // 30 min per dispatch
const DEFAULT_ALLOW_API_KEY_BILLING = false;
const DEFAULT_MAX_ITERATIONS = Infinity; // unbounded

/**
 * The single resolution point for REQ §4.1's five tunables (TSPEC §4.6).
 * Three engine-config rows (`retryAttempts`, `retryBackoff`, `timeoutMinutes`)
 * resolve from `config.dispatch.*` with a default fallback; two
 * operator-owned rows (`allowApiKeyBilling`, `maxIterations`) resolve from
 * `flags.*` ONLY (BR-CLI-2, BR-LOOP-2) — a config file can never set either,
 * even when both are present in `config`.
 *
 * @param {object} [args]
 * @param {object} [args.config] engine configuration — `readEngineConfig`'s
 *   `config` (O-3, resolved: the consumer's `.claude/pdlc.config.json`)
 * @param {object} [args.flags] operator-supplied CLI flags for this invocation
 * @returns {{retryAttempts: number, retryBackoff: {baseMs: number, capMs: number},
 *   timeoutMinutes: number, timeoutMs: number, allowApiKeyBilling: boolean,
 *   maxIterations: number}}
 */
export function resolveTunables({ config = {}, flags = {} } = {}) {
  const dispatch = (config && config.dispatch) || {};
  const configRetryBackoff = dispatch.retryBackoff || {};

  const retryAttempts = dispatch.retryAttempts ?? DEFAULT_RETRY_ATTEMPTS;
  const retryBackoff = {
    baseMs: configRetryBackoff.baseMs ?? DEFAULT_RETRY_BACKOFF_BASE_MS,
    capMs: configRetryBackoff.capMs ?? DEFAULT_RETRY_BACKOFF_CAP_MS,
  };
  const timeoutMinutes = dispatch.timeoutMinutes ?? DEFAULT_TIMEOUT_MINUTES;
  const timeoutMs = timeoutMinutes * 60 * 1000;

  const allowApiKeyBilling = (flags && flags.allowApiKeyBilling) ?? DEFAULT_ALLOW_API_KEY_BILLING;
  const maxIterations = (flags && flags.maxIterations) ?? DEFAULT_MAX_ITERATIONS;

  return { retryAttempts, retryBackoff, timeoutMinutes, timeoutMs, allowApiKeyBilling, maxIterations };
}

// ─── exit-code mapping (TSPEC §3.3, PROP-EXIT-*) ────────────────────────────

/**
 * The one function every exit-code decision goes through (PROP-EXIT-1): a
 * halt/block is `2`, an engine refusal (or the absence of a report at all —
 * an engine crash) is `1`, and any other recorded module outcome is `0`.
 *
 * @param {{report?: object|null, refusal?: string|null}} result
 * @returns {0|1|2}
 */
export function exitCodeFor({ report, refusal } = {}) {
  if (refusal) return 1;
  if (!report) return 1;
  if (report.outcome === "halted" || report.outcome === "blocked") return 2;
  return 0;
}

/**
 * PROP-EXIT-6: the total order over exit codes for a "worst of" fold is NOT
 * numeric max — it is 1 (engine refusal) > 2 (halt/block) > 0 (clean), which
 * disagrees with plain numeric order on exactly one pair: {1, 2}. This is a
 * pure rank comparison (no global state, no built-in patching): each code is
 * mapped to its rank in the total order, and the higher-ranked argument wins.
 *
 * @param {0|1|2} a
 * @param {0|1|2} b
 * @returns {0|1|2}
 */
const EXIT_CODE_RANK = { 1: 2, 2: 1, 0: 0 };
export function worstExitCode(a, b) {
  return EXIT_CODE_RANK[a] >= EXIT_CODE_RANK[b] ? a : b;
}

/**
 * PROP-QUEUE-7: the closed, four-member set of `queue --loop` stop reasons.
 * `halted` is BR-LOOP-4's continue row, not a stop, so it never appears here.
 */
export const LOOP_STOP_REASONS = Object.freeze(["exhausted", "bound-reached", "blocked", "refused"]);

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
 * `pdlc queue --loop` (REQ AC-1.3, `queue.loopIdleExit`, TSPEC §4.5, BR-LOOP-4,
 * PROP-QUEUE-4…15): repeat one feature at a time, re-reading the queue fresh
 * on every iteration, until one of `LOOP_STOP_REASONS`' four members applies.
 *
 * BR-LOOP-4's continuation table: `ran` and `halted` both continue to the
 * next iteration (a halted feature does not stop the loop — the queue's own
 * row already records the halt); `idle`/`no-queue` stop as `"exhausted"`;
 * `blocked` stops as `"blocked"`; an engine refusal stops as `"refused"`.
 * `maxPasses`, when given, is a hard iteration bound whose exhaustion stops
 * the loop as `"bound-reached"` — distinct from `"exhausted"`, which means
 * the queue itself ran dry.
 *
 * @param {object} [args]
 * @param {number|null} [args.maxPasses] iteration bound; `null`/omitted is unbounded
 * @returns {Promise<{passes: object[], outcome: string|undefined, stopReason: string,
 *   exitCode: 0|1|2, loop: {iterations: number, maxIterations: number|null}}>}
 */
export async function runQueueLoop({ maxPasses = null, ...args } = {}) {
  const passes = [];
  let stopReason;
  let outcome;
  let iterations = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (maxPasses != null && iterations >= maxPasses) {
      stopReason = "bound-reached";
      break;
    }

    const pass = await runQueue(args);
    passes.push(pass);
    iterations++;

    if (pass.refusal) {
      stopReason = "refused";
      break;
    }

    outcome = pass.report && pass.report.outcome;
    if (outcome === "blocked") {
      stopReason = "blocked";
      break;
    }
    if (outcome === "idle" || outcome === "no-queue") {
      stopReason = "exhausted";
      break;
    }
    // "ran" and "halted" (BR-LOOP-4 rows 1/2): fall through and continue.
  }

  const exitCode = passes.reduce((worst, pass) => worstExitCode(worst, exitCodeFor(pass)), 0);
  const loop = { iterations, maxIterations: maxPasses == null ? null : maxPasses };
  return { passes, outcome, stopReason, exitCode, loop };
}
