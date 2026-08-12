#!/usr/bin/env node
// pdlc-engine CLI (Phase 3, pdlc-headless-engine).
//
// Commands:
//   pdlc dev <docs/{f}/REQ-{f}.md> [--force-phases <list>] [--dry-run]
//   pdlc queue [--queue-path <p>] [--loop [--max-iterations <n>]] [--dry-run]
//   pdlc doctor
//   pdlc hello | pdlc spike:sdk
//
// Common flags: --plugin-root <path>, --cwd <path>, --allow-api-key-billing.
//
// Exit codes (REQ AC-1.4 — a halt is not a crash):
//   0  pipeline finished, or dry run / doctor passed
//   2  the pipeline HALTED (a normal, recorded pdlc outcome)
//   1  the engine itself refused or crashed (handshake, auth policy, bad usage)
//
// `--dry-run` is the AC-3.1 inspection surface. It resolves the plugin, runs the
// C-10 handshake and prints the COMPOSED dispatch prompt — SKILL.md bytes
// inlined verbatim, no `pdlc:` namespace, no Skill-tool instruction — and it
// dispatches nothing: the transport handed to the adapter throws if called.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { PLUGIN_ROOT_ENV } from "../lib/skills.mjs";
import { runStartupChecks, formatStartup } from "../lib/startup.mjs";
import { createAdapter } from "../lib/adapter.mjs";
import { createTransport } from "../lib/transport.mjs";
import { runDev, runQueue, runQueueLoop, workflowModulePath, resolveTunables, readEngineConfig } from "../lib/run.mjs";
import { buildEngineBlock, stampReport } from "../lib/report.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));

const USAGE = [
  "Usage:",
  "  pdlc dev <docs/{feature}/REQ-{feature}.md> [--force-phases <R,F,T,P,D,PR|all>] [--dry-run]",
  "  pdlc queue [--queue-path <path>] [--loop [--max-iterations <n>]] [--dry-run]",
  "  pdlc doctor",
  "  pdlc hello | pdlc spike:sdk",
  "",
  "Common flags: --plugin-root <path>  --cwd <path>  --allow-api-key-billing",
  "              --dry-run-skill <name>  (default: pm-author)",
].join("\n");

// ─── argv ────────────────────────────────────────────────────────────────────

/** Minimal flag reader: supports `--flag value` and `--flag=value`. */
function readFlag(argv, name) {
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === `--${name}`) return argv[i + 1] ?? "";
    if (argv[i].startsWith(`--${name}=`)) return argv[i].slice(name.length + 3);
  }
  return null;
}

function hasFlag(argv, name) {
  return argv.includes(`--${name}`);
}

/** Positional arguments — everything that is not a flag or a flag's value. */
function positionals(argv, valueFlags) {
  const out = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const bare = a.slice(2).split("=")[0];
      if (valueFlags.includes(bare) && !a.includes("=")) i += 1;
      continue;
    }
    out.push(a);
  }
  return out;
}

const VALUE_FLAGS = [
  "plugin-root",
  "cwd",
  "force-phases",
  "queue-path",
  "dry-run-skill",
  "max-iterations",
];
const VALUE_FLAGS_SET = new Set(VALUE_FLAGS);

/**
 * FSPEC §3.2's closed flag surface, one row per dispatching/inspecting
 * command. `hello` and `spike:sdk` are BR-CMD-1's exempt diagnostics and
 * carry no row here — `main()` never runs `validateFlags` against them.
 */
const FLAGS_BY_COMMAND = {
  dev: ["force-phases", "dry-run", "plugin-root", "cwd", "allow-api-key-billing", "dry-run-skill"],
  queue: [
    "queue-path",
    "loop",
    "dry-run",
    "plugin-root",
    "cwd",
    "allow-api-key-billing",
    "max-iterations",
    "dry-run-skill",
  ],
  doctor: ["plugin-root", "cwd", "allow-api-key-billing"],
};

/**
 * EC-CLI-5 / EC-CLI-7: total flag-shape validation for one command's argv,
 * BEFORE any startup rung runs. Returns a usage-error message, or `null`
 * when every flag is in §3.2's table for this command and every value flag
 * (BR-CLI-1: `--flag value` or `--flag=value`) actually carries a value.
 *
 * @param {string[]} argv
 * @param {string} command
 * @returns {string|null}
 */
function validateFlags(argv, command) {
  const allowed = new Set(FLAGS_BY_COMMAND[command] || []);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const bare = a.slice(2).split("=")[0];
    if (!allowed.has(bare)) {
      return `pdlc ${command}: unknown flag "--${bare}" (not in the closed flag set for this command)`;
    }
    if (VALUE_FLAGS_SET.has(bare) && !a.includes("=")) {
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) {
        return `pdlc ${command}: --${bare} requires a value`;
      }
      i += 1; // the value token is consumed, not a flag of its own
    }
  }
  return null;
}

// ─── shared startup ──────────────────────────────────────────────────────────

function startupFor(argv) {
  return runStartupChecks({
    pluginRoot: readFlag(argv, "plugin-root"),
    engineVersion: pkg.version,
    engineCompat: pkg.pdlcPluginCompat,
    apiKeyPolicy: hasFlag(argv, "allow-api-key-billing") ? ["none", "user", "project", "org", "temporary"] : ["none"],
  });
}

/** A transport that refuses to dispatch — the dry-run surface's proof of inertness. */
function inertTransport() {
  return {
    dispatch() {
      throw new Error("dry run: dispatch attempted — the dry-run surface must not contact a model");
    },
  };
}

// ─── commands ────────────────────────────────────────────────────────────────

async function cmdHello() {
  console.log(`pdlc-engine v${pkg.version}`);
  console.log(
    "transport: Claude Agent SDK (primary), headless `claude -p` fallback declared; " +
      'requires apiKeySource "none" at dispatch (fail-closed, subscription-first).'
  );
  console.log(`workflow modules: ${workflowModulePath("dev")}`);
  console.log(`                  ${workflowModulePath("queue")}`);
}

async function cmdSpikeSdk() {
  const prompt = "Reply with exactly: HELLO-PDLC-SPIKE";
  console.log("[spike:sdk] importing @anthropic-ai/claude-agent-sdk ...");

  let sdk;
  try {
    sdk = await import("@anthropic-ai/claude-agent-sdk");
  } catch (err) {
    console.error("[spike:sdk] IMPORT FAILED");
    console.error(err && err.stack ? err.stack : String(err));
    process.exitCode = 1;
    return;
  }

  const { query } = sdk;
  console.log("[spike:sdk] import OK. Calling query() with:", {
    prompt,
    options: { model: "haiku", maxTurns: 1 },
  });

  try {
    const stream = query({ prompt, options: { model: "haiku", maxTurns: 1 } });
    let messageIndex = 0;
    for await (const message of stream) {
      console.log(`[spike:sdk] message[${messageIndex++}] type=${message.type}`);
      console.log(JSON.stringify(message, null, 2));
    }
    console.log("[spike:sdk] stream complete, no throw.");
  } catch (err) {
    console.error("[spike:sdk] QUERY THREW");
    console.error(err && err.stack ? err.stack : String(err));
    process.exitCode = 1;
  }
}

/**
 * `pdlc doctor` — startup checks only. Dispatches NOTHING: no transport is
 * constructed and no model is contacted, so it is safe on a machine with no auth.
 */
async function cmdDoctor(argv) {
  const result = startupFor(argv);
  for (const line of result.banner) console.log(line);
  console.log("");
  for (const r of result.rungs) {
    const label = r.state === "pass" ? "PASS" : r.state === "fail" ? "FAIL" : "SKIP";
    console.log(`${label}  ${r.name}`);
    if (r.detail) console.log(`      ${r.detail}`);
  }
  console.log("");
  if (result.ok) {
    console.log("doctor: all checks passed. No dispatch was performed.");
  } else {
    console.log(result.reason);
    console.log(`Override the plugin root with --plugin-root <path> or ${PLUGIN_ROOT_ENV}=<path>.`);
    process.exitCode = 1;
  }
}

/** The AC-3.1 inspection surface, shared by `dev --dry-run` and `queue --dry-run`. */
function emitDryRun(argv, startup, { command, target }) {
  const skill = readFlag(argv, "dry-run-skill") || "pm-author";
  const adapter = createAdapter({
    transport: inertTransport(),
    pluginRoot: startup.pluginRoot,
    cwd: path.resolve(readFlag(argv, "cwd") || process.cwd()),
    log: () => {},
  });

  for (const line of formatStartup(startup)) console.log(line);
  console.log("");
  console.log(`dry run: ${command}`);
  console.log(`  target:            ${target}`);
  console.log(`  consumer repo:     ${path.resolve(readFlag(argv, "cwd") || process.cwd())}`);
  console.log(`  workflow module:   ${workflowModulePath(command === "queue" ? "queue" : "dev")}`);
  console.log(`  overridden seams:  _agent, _parallel, _pipeline, _phase, _log, _runCommand`);
  console.log(`  every other seam:  module default (plain-Node fs/git/gh)`);
  console.log("");
  console.log(`--- composed dispatch prompt for skill "${skill}" ---`);
  console.log(adapter.composePrompt(skill, `[dry run] no task dispatched for ${target}.`));
  console.log(`--- end composed dispatch prompt ---`);
  console.log("");
  console.log("dry run complete: no dispatch was performed.");
}

/**
 * REQ §4.1's five tunables, resolved for this invocation (TSPEC §4.6).
 * O-3 is resolved: the three engine-config rows come from the `dispatch`
 * section of the CONSUMER's `.claude/pdlc.config.json` (`readEngineConfig`);
 * the two operator-owned rows stay flag-only. Config-read notices are
 * printed here — once, before any dispatch — so a value silently falling
 * back to a default is never invisible.
 */
function tunablesFor(argv, cwd) {
  const { config, notices } = readEngineConfig({ cwd });
  for (const line of notices) console.log(line);
  return resolveTunables({
    config,
    flags: {
      allowApiKeyBilling: hasFlag(argv, "allow-api-key-billing"),
      maxIterations: maxIterationsFlagOf(argv),
    },
  });
}

function maxIterationsFlagOf(argv) {
  const raw = readFlag(argv, "max-iterations");
  return raw != null && raw !== "" ? Number(raw) : undefined;
}

/** Build the live adapter: real SDK transport, consumer cwd, parent env spread. */
function liveAdapter(argv, startup) {
  const cwd = path.resolve(readFlag(argv, "cwd") || process.cwd());
  const tunables = tunablesFor(argv, cwd);
  const transport = createTransport({
    env: process.env,
    apiKeySourcePolicy: tunables.allowApiKeyBilling
      ? ["none", "user", "project", "org", "temporary"]
      : ["none"],
  });
  const adapter = createAdapter({
    transport,
    pluginRoot: startup.pluginRoot,
    cwd,
    maxRateLimitPauses: tunables.retryAttempts,
    retryBackoffBaseMs: tunables.retryBackoff.baseMs,
    retryBackoffCapMs: tunables.retryBackoff.capMs,
    dispatchTimeoutMs: tunables.timeoutMs,
  });
  return { adapter, cwd, tunables };
}

/**
 * Report-provenance stamping (Phase 4): wrap the module's own final report
 * with the engine's `engine` block and print it as ONE JSON line — the
 * convention this CLI commits to is "human-readable progress lines on stdout
 * above it, the stamped report is always the LAST line of stdout, and it is
 * always exactly one line" so an unattended caller (a cron job, `pdlc queue
 * --loop`'s own driver) can reliably take the last line of output and
 * `JSON.parse` it without scanning for a multi-line block.
 *
 * Exit-code convention unchanged from before stamping (REQ AC-1.4): 2 for a
 * recorded pipeline halt/block, 0 otherwise; `!report` (the engine refused or
 * crashed before any module ran) is 1, handled by callers before this is
 * reached in practice, but guarded here too since it stamps and returns 1.
 *
 * @param {number} [args.exitCodeOverride] `queue --loop`'s own worst-of exit
 *   code (BR-EXIT-3, `lib/run.mjs`'s `runQueueLoop`) — when given, this wins
 *   over the single-report `report.outcome` mapping below, which only ever
 *   reflects the LAST pass.
 * @param {object|null} [args.loop] `{iterations, maxIterations, stopReason,
 *   lastOutcome}` for a `--loop` run, forwarded onto `engine.loop` verbatim.
 * @param {object|null} [args.tunables] effective REQ §4.1 tunables, trimmed
 *   to the four rows TSPEC §4.5's `engine.tunables` names.
 */
function emitReport(report, { adapter, startup, startedAt, finishedAt, exitCodeOverride, loop = null, tunables = null }) {
  const engine = buildEngineBlock({
    engineVersion: pkg.version,
    pluginVersion: startup ? startup.pluginVersion : null,
    pluginRoot: startup ? startup.pluginRoot : null,
    apiKeySource: adapter ? adapter.getApiKeySource() : null,
    baseUrl: process.env.ANTHROPIC_BASE_URL || null,
    pauses: adapter ? adapter.getPauseLog() : [],
    tunables: tunables
      ? {
          retryAttempts: tunables.retryAttempts,
          retryBackoff: tunables.retryBackoff,
          timeoutMinutes: tunables.timeoutMinutes,
          maxIterations: Number.isFinite(tunables.maxIterations) ? tunables.maxIterations : null,
        }
      : null,
    loop,
    startedAt,
    finishedAt,
  });
  const stamped = stampReport(report, engine);
  console.log("");
  console.log(JSON.stringify(stamped));
  if (exitCodeOverride != null) return exitCodeOverride;
  if (!report) return 1;
  if (report.outcome === "halted" || report.outcome === "blocked") return 2;
  return 0;
}

async function cmdDev(argv) {
  const args = positionals(argv, VALUE_FLAGS);
  const reqPath = args[0];
  if (!reqPath) {
    console.error(USAGE);
    console.error("pdlc dev: a REQ path is required.");
    process.exitCode = 1;
    return;
  }

  const startup = startupFor(argv);
  if (!startup.ok) {
    // BR-REP-0a / PROP-EXIT-10: a rung refusal (unlike a pure CLI usage
    // error) DOES emit a report line — `report: null`, stamped with the
    // `engine` block — so an unattended caller can always take the last
    // stdout line and parse it, even on a refusal.
    for (const line of formatStartup(startup, { withChecks: true })) console.error(line);
    console.error("");
    console.error(startup.reason);
    const startedAt = new Date().toISOString();
    process.exitCode = emitReport(null, { adapter: null, startup, startedAt, finishedAt: startedAt });
    return;
  }

  if (hasFlag(argv, "dry-run")) {
    emitDryRun(argv, startup, { command: "dev", target: reqPath });
    return;
  }

  for (const line of formatStartup(startup)) console.log(line);
  const { adapter, cwd, tunables } = liveAdapter(argv, startup);
  const startedAt = new Date().toISOString();
  const { report } = await runDev({
    reqPath,
    forcePhases: readFlag(argv, "force-phases"),
    cwd,
    adapter,
    startup,
  });
  const finishedAt = new Date().toISOString();
  process.exitCode = emitReport(report, { adapter, startup, startedAt, finishedAt, tunables });
}

async function cmdQueue(argv) {
  const startup = startupFor(argv);
  if (!startup.ok) {
    // See cmdDev's identical branch: a rung refusal emits a report line
    // (BR-REP-0a / PROP-EXIT-10), unlike a pure CLI usage error.
    for (const line of formatStartup(startup, { withChecks: true })) console.error(line);
    console.error("");
    console.error(startup.reason);
    const startedAt = new Date().toISOString();
    process.exitCode = emitReport(null, { adapter: null, startup, startedAt, finishedAt: startedAt });
    return;
  }

  const queuePath = readFlag(argv, "queue-path");
  if (hasFlag(argv, "dry-run")) {
    emitDryRun(argv, startup, { command: "queue", target: queuePath || "docs/_queue/QUEUE.md" });
    return;
  }

  for (const line of formatStartup(startup)) console.log(line);
  const { adapter, cwd, tunables } = liveAdapter(argv, startup);

  if (hasFlag(argv, "loop")) {
    // AC-1.3 / `queue.loopIdleExit`: one feature per pass until no ready row
    // remains, then exit 0. `--max-iterations` bounds the number of passes for
    // unattended endurance (G-7); omitted, the loop is unbounded (`null`,
    // never `Infinity` — PROP-QUEUE-15) and relies on the queue itself
    // running dry (`idle` / `no-queue`) or halting/blocking.
    const maxIterationsFlag = readFlag(argv, "max-iterations");
    const maxPasses = maxIterationsFlag != null && maxIterationsFlag !== "" ? Number(maxIterationsFlag) : null;
    if (maxPasses != null && !(maxPasses > 0)) {
      console.error(`pdlc queue --loop: --max-iterations must be a positive number, got "${maxIterationsFlag}"`);
      process.exitCode = 1;
      return;
    }

    const startedAt = new Date().toISOString();
    const { passes, outcome, stopReason, exitCode, loop } = await runQueueLoop({
      queuePath,
      cwd,
      adapter,
      startup,
      maxPasses,
    });
    const finishedAt = new Date().toISOString();
    const last = passes[passes.length - 1];
    console.log(`\nqueue --loop: ${passes.length} pass(es), stop reason "${stopReason}".`);
    process.exitCode = emitReport(last && last.report, {
      adapter,
      startup,
      startedAt,
      finishedAt,
      tunables,
      exitCodeOverride: exitCode,
      loop: { iterations: loop.iterations, maxIterations: loop.maxIterations, stopReason, lastOutcome: outcome },
    });
    return;
  }

  const startedAt = new Date().toISOString();
  const { report } = await runQueue({ queuePath, cwd, adapter, startup });
  const finishedAt = new Date().toISOString();
  process.exitCode = emitReport(report, { adapter, startup, startedAt, finishedAt, tunables });
}

// ─── entry ───────────────────────────────────────────────────────────────────

/**
 * EC-CLI-5 / EC-CLI-7 gate, run before ANY rung and before any positional
 * parsing: a bad flag shape is a usage error (BR-REP-0a: exit 1, no report
 * line), never a value silently dropped or treated as empty.
 */
function checkFlags(argv, command) {
  const err = validateFlags(argv, command);
  if (!err) return true;
  console.error(USAGE);
  console.error(err);
  process.exitCode = 1;
  return false;
}

async function main() {
  const [, , cmd, ...rest] = process.argv;
  switch (cmd) {
    case "hello":
      // BR-CMD-1: exempt diagnostic, no flag-shape gate.
      await cmdHello();
      break;
    case "spike:sdk":
      // BR-CMD-1: exempt diagnostic, no flag-shape gate.
      await cmdSpikeSdk();
      break;
    case "doctor":
      if (checkFlags(rest, "doctor")) await cmdDoctor(rest);
      break;
    case "dev":
      if (checkFlags(rest, "dev")) await cmdDev(rest);
      break;
    case "queue":
      if (checkFlags(rest, "queue")) await cmdQueue(rest);
      break;
    default:
      console.error(USAGE);
      console.error(`Unknown command: ${cmd ?? "(none)"}`);
      process.exitCode = 1;
  }
}

main().catch((err) => {
  // Engine crash — distinct from a pipeline halt (exit 2) by design (AC-1.4).
  console.error(err && err.stack ? err.stack : String(err));
  process.exitCode = 1;
});
