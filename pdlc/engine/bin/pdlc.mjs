#!/usr/bin/env node
// pdlc-engine CLI (Phase 3, pdlc-headless-engine).
//
// Commands:
//   pdlc dev <docs/{f}/REQ-{f}.md> [--force-phases <list>] [--dry-run]
//   pdlc queue [--queue-path <p>] [--loop] [--dry-run]
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
import { runDev, runQueue, runQueueLoop, workflowModulePath } from "../lib/run.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));

const USAGE = [
  "Usage:",
  "  pdlc dev <docs/{feature}/REQ-{feature}.md> [--force-phases <R,F,T,P,D,PR|all>] [--dry-run]",
  "  pdlc queue [--queue-path <path>] [--loop] [--dry-run]",
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

const VALUE_FLAGS = ["plugin-root", "cwd", "force-phases", "queue-path", "dry-run-skill"];

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
  for (const line of formatStartup(result, { withChecks: true })) console.log(line);
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

/** Build the live adapter: real SDK transport, consumer cwd, parent env spread. */
function liveAdapter(argv, startup) {
  const cwd = path.resolve(readFlag(argv, "cwd") || process.cwd());
  const transport = createTransport({
    env: process.env,
    apiKeySourcePolicy: hasFlag(argv, "allow-api-key-billing")
      ? ["none", "user", "project", "org", "temporary"]
      : ["none"],
  });
  return { adapter: createAdapter({ transport, pluginRoot: startup.pluginRoot, cwd }), cwd };
}

function reportOutcome(report) {
  if (!report) return 1;
  console.log("");
  console.log("--- run report ---");
  console.log(JSON.stringify(report, null, 2));
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
    for (const line of formatStartup(startup, { withChecks: true })) console.error(line);
    console.error("");
    console.error(startup.reason);
    process.exitCode = 1;
    return;
  }

  if (hasFlag(argv, "dry-run")) {
    emitDryRun(argv, startup, { command: "dev", target: reqPath });
    return;
  }

  for (const line of formatStartup(startup)) console.log(line);
  const { adapter, cwd } = liveAdapter(argv, startup);
  const { report } = await runDev({
    reqPath,
    forcePhases: readFlag(argv, "force-phases"),
    cwd,
    adapter,
    startup,
  });
  process.exitCode = reportOutcome(report);
}

async function cmdQueue(argv) {
  const startup = startupFor(argv);
  if (!startup.ok) {
    for (const line of formatStartup(startup, { withChecks: true })) console.error(line);
    console.error("");
    console.error(startup.reason);
    process.exitCode = 1;
    return;
  }

  const queuePath = readFlag(argv, "queue-path");
  if (hasFlag(argv, "dry-run")) {
    emitDryRun(argv, startup, { command: "queue", target: queuePath || "docs/_queue/QUEUE.md" });
    return;
  }

  for (const line of formatStartup(startup)) console.log(line);
  const { adapter, cwd } = liveAdapter(argv, startup);

  if (hasFlag(argv, "loop")) {
    // AC-1.3 / `queue.loopIdleExit`: one feature per pass until no ready row
    // remains, then exit 0.
    const { passes, outcome } = await runQueueLoop({ queuePath, cwd, adapter, startup });
    const last = passes[passes.length - 1];
    console.log(`\nqueue --loop: ${passes.length} pass(es), final outcome "${outcome}".`);
    process.exitCode =
      outcome === "idle" || outcome === "no-queue" ? 0 : reportOutcome(last && last.report);
    return;
  }

  const { report } = await runQueue({ queuePath, cwd, adapter, startup });
  process.exitCode = reportOutcome(report);
}

// ─── entry ───────────────────────────────────────────────────────────────────

async function main() {
  const [, , cmd, ...rest] = process.argv;
  switch (cmd) {
    case "hello":
      await cmdHello();
      break;
    case "spike:sdk":
      await cmdSpikeSdk();
      break;
    case "doctor":
      await cmdDoctor(rest);
      break;
    case "dev":
      await cmdDev(rest);
      break;
    case "queue":
      await cmdQueue(rest);
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
