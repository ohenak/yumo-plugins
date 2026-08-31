// pdlc-engine CLI (Phase 3, pdlc-headless-engine; split from bin/pdlc.mjs at
// TSPEC §9.3 / E-4b — PK-4b).
//
// Loaded only via `bin/pdlc.mjs`'s dynamic, promise-chained
// `import("./cli.mjs")`, after that dependency-free guard has confirmed the
// running Node is new enough to parse everything below. `main` is exported
// rather than self-invoked at import time, and self-invocation moves behind
// an entry guard (bottom of this file), so importing this module — the way
// both the guard and this file's own test suite do — is inert: no command
// runs, no dispatch happens, `process.exitCode` and `stderr` are untouched.
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

import nodeFs, { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";

import { resolvePluginRoot } from "../lib/skills.mjs";
import { listVersions, rootFor } from "../lib/store.mjs";
import { runStartupChecks, formatStartup, STARTUP_REMEDIATION } from "../lib/startup.mjs";
import { createAdapter } from "../lib/adapter.mjs";
import { createTransport } from "../lib/transport.mjs";
import {
  runDev,
  runQueue,
  runQueueLoop,
  workflowModulePath,
  resolveTunables,
  readEngineConfig,
  resolveWorkflowRoot,
} from "../lib/run.mjs";
import { buildEngineBlock, stampReport } from "../lib/report.mjs";
import { resolveVersion } from "../lib/resolve-version.mjs";
import { readPluginVersion, checkCompat } from "../lib/handshake.mjs";
import { buildProvenance } from "../lib/provenance.mjs";
import { message } from "../lib/catalogue.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));

const USAGE = [
  "Usage:",
  "  pdlc dev <docs/{feature}/REQ-{feature}.md> [--force-phases <R,F,T,P,D,PR|all>] [--dry-run]",
  "  pdlc queue [--queue-path <path>] [--loop [--max-iterations <n>]] [--dry-run]",
  "  pdlc decide --entry <entryId> --outcome <resolved|rejected> --by <who> [--rationale <text>]",
  "  pdlc stats [feature] [--json] [--cwd <path>]",
  "  pdlc doctor",
  "  pdlc hello | pdlc spike:sdk",
  "",
  "Common flags: --plugin-root <path>  --cwd <path>  --allow-api-key-billing",
  "              --dry-run-skill <name>  (default: pm-author)",
].join("\n");

// ─── argv helpers ────────────────────────────────────────────────────────

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

/**
 * Dynamically loads `pdlc/workflows/lib/loop-session.mjs` from whichever
 * workflow root `resolveWorkflowRoot` resolves (vendor tree when packaged,
 * checkout tree in-repo — TSPEC §5.2). Used only by `cmdQueue`'s
 * `--loop-state` surface (P4-05): decoding the session token and evaluating
 * the loop's own preflight are pure, in-process operations, never a
 * dispatch.
 */
async function loopSessionModule() {
  const { rootPath } = resolveWorkflowRoot();
  return import(pathToFileURL(path.join(rootPath, "lib", "loop-session.mjs")).href);
}

/** Same arrangement as `loopSessionModule`, for `lib/escalation-view.mjs`. */
async function escalationViewModule() {
  const { rootPath } = resolveWorkflowRoot();
  return import(pathToFileURL(path.join(rootPath, "lib", "escalation-view.mjs")).href);
}

/**
 * Read-only `git status` probe for the loop's working-tree preflight
 * condition (BR-11). Never mutates, never dispatches — a plain
 * `spawnSync("git", ["status", …])` in `cwd`.
 *
 * @param {string} cwd
 * @param {"tracked"|"any"} policy
 * @returns {{ok: true, dirtyPaths: string[]} | {ok: false, detail: string}}
 */
function gitTreeStatus(cwd, policy) {
  const args =
    policy === "any"
      ? ["status", "--porcelain", "--untracked-files=normal"]
      : ["status", "--porcelain", "--untracked-files=no"];
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  const output = (result.stdout || "").trim();
  if (output === "") return { ok: true, dirtyPaths: [] };
  const dirtyPaths = output.split("\n");
  return { ok: false, detail: `${dirtyPaths.length} dirty path(s) under policy "${policy}"` };
}

const VALUE_FLAGS = [
  "plugin-root",
  "cwd",
  "force-phases",
  "queue-path",
  "dry-run-skill",
  "max-iterations",
  "loop-state",
  // E-25/AT-49 (CR v1 F-08): the session's report of the wait it took before this
  // invocation — requested (what the previous directive asked for) and actual (what the
  // host managed). Value flags, so `--wait-requested 5` consumes its value token.
  "wait-requested",
  "wait-actual",
  // AC-4.4 (CR v1 F-07): `pdlc decide`'s four inputs — the entry id the view printed, the
  // outcome, who decided, and the optional rationale.
  "entry",
  "outcome",
  "by",
  "rationale",
];
const VALUE_FLAGS_SET = new Set(VALUE_FLAGS);

/**
 * FSPEC §3.2's closed flag surface, one row per dispatching/inspecting
 * command. `hello` and `spike:sdk` are BR-CMD-1's exempt diagnostics and
 * carry no row here — `main()` never runs `validateFlags` against them.
 */
const FLAGS_BY_COMMAND = {
  dev: ["force-phases", "dry-run", "plugin-root", "cwd", "allow-api-key-billing", "dry-run-skill", "dev"],
  queue: [
    "queue-path",
    "loop",
    "loop-state",
    "dry-run",
    "plugin-root",
    "cwd",
    "allow-api-key-billing",
    "max-iterations",
    "dry-run-skill",
    "dev",
    "wait-requested",
    "wait-actual",
  ],
  doctor: ["plugin-root", "cwd", "allow-api-key-billing", "dev"],
  decide: ["entry", "outcome", "by", "rationale", "plugin-root", "cwd", "dev"],
  // TSPEC §3.4: a closed, minimal surface — no `--dev`, no `--plugin-root`, no
  // `--dry-run` (AT-24). `cwd` is already a shared VALUE_FLAGS member, so
  // `--cwd` with no value token is a usage error via validateFlags alone.
  stats: ["json", "cwd"],
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

// ─── the version store, this engine's location, the resolved-child marker ──
//     (TSPEC §6.1–§6.3, DEC-EDIST-03 / DEC-EDIST-06)

/** Absolute dir of the running engine — its own `lib/`'s parent (§6.3). */
const ENGINE_PATH = path.join(__dirname, "..");

/**
 * The env marker the launcher sets on the resolved child (§6.2).
 *
 * Two separable jobs, deliberately not collapsed:
 *
 *   - Its **presence** is the loop guard. A child that finds the variable set
 *     never runs the ladder again, so resolution happens exactly once per
 *     invocation (BR-1.5's structural precondition) — and it holds even if
 *     the value is garbage, which is why the guard reads presence and not
 *     content.
 *   - Its **content** carries the decision the parent actually reached, so
 *     the child stamps the resolved `mode`/`pin` into provenance rather than
 *     re-deriving them from a store it must not read a second time.
 *
 * An unparseable value therefore still suppresses re-resolution, and degrades
 * to `mode: "unresolved"` rather than to a re-spawn.
 */
export const RESOLVED_MARKER_ENV = "PDLC_RESOLVED_ENGINE";

/** TSPEC §6.1: `$PDLC_HOME/versions/`, default `~/.pdlc/versions/`. */
export function storeRootFrom(env = process.env, homedir = os.homedir()) {
  const declared = env && typeof env.PDLC_HOME === "string" ? env.PDLC_HOME.trim() : "";
  return path.join(declared || path.join(homedir, ".pdlc"), "versions");
}

/** The remedy named by ladder branch 7's refusal and by `doctor` (§6.2, §11). */
export const INSTALL_COMMAND = `npm install -g ${pkg.name}`;

/**
 * §6.3's `EngineLocation`, computed by walking up from the running engine
 * for a `.git` entry. Injectable `fs` because branch 1/2's conjuncts are the
 * one part of the ladder that is a fact about disk, and AC-5.4's "dev-mode is
 * never inferred" needs a leg that fixes `isCheckout: true` without one.
 */
export function engineLocationFrom({ enginePath = ENGINE_PATH, pluginRoot = null, fs = nodeFs } = {}) {
  let dir = path.resolve(enginePath);
  let checkoutRoot = "";
  for (;;) {
    if (fs.existsSync(path.join(dir, ".git"))) {
      checkoutRoot = dir;
      break;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return { enginePath: path.resolve(enginePath), isCheckout: checkoutRoot !== "", checkoutRoot, pluginRoot: pluginRoot || null };
}

/** Read the marker. Malformed ⇒ `{mode: "unresolved"}`, never `null` (see above). */
export function readResolvedMarker(env = process.env) {
  const raw = env && env[RESOLVED_MARKER_ENV];
  if (!raw) return null;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { mode: "unresolved", version: null, pin: null };
  }
  if (!parsed || typeof parsed !== "object" || typeof parsed.mode !== "string") {
    return { mode: "unresolved", version: null, pin: null };
  }
  return { mode: parsed.mode, version: parsed.version ?? null, pin: parsed.pin ?? null };
}

/**
 * Run §6.3's ladder for THIS invocation, gathering its four impure inputs —
 * the store listing, the consumer's config read, the `--dev` flag and the
 * engine's location — and returning the decision alongside the facts
 * `doctor` reports (§6.2).
 */
export function launchInputs({ argv = [], cwd = process.cwd(), env = process.env, fs = nodeFs, homedir = os.homedir() } = {}) {
  const storeRoot = storeRootFrom(env, homedir);
  const { versions: listing } = listVersions(fs, storeRoot);
  const dev = hasFlag(argv, "dev");
  const discovered = resolvePluginRoot({ devDeclared: dev, env, override: readFlag(argv, "plugin-root"), fs });
  return {
    listing,
    configResult: readEngineConfig({ cwd }),
    dev,
    storeRoot,
    location: engineLocationFrom({ pluginRoot: discovered.ok ? discovered.root : null, fs }),
  };
}

/**
 * `launchInputs` plus the ladder run over them. Kept separate from
 * `launchInputs` because §6.2's two exempt commands need the INPUTS but must
 * NOT consume a decision from here: `runVersionDoctor` runs the ladder
 * itself, and calling it twice would let the two answers drift.
 */
export function resolveForLaunch(opts = {}) {
  const inputs = launchInputs(opts);
  const decision = resolveVersion({
    listing: inputs.listing,
    configResult: inputs.configResult,
    dev: inputs.dev,
    env: opts.env || process.env,
    location: inputs.location,
  });
  return { ...inputs, decision };
}

/**
 * Turn a ladder decision into the launcher's next move (§6.2). Three
 * outcomes and no fourth: refuse, run this process in place, or `exec` the
 * resolved store entry's own `bin/pdlc.mjs`.
 *
 * The in-place case is not an optimisation — it is the common one. When the
 * ladder resolves to the version this launcher already IS, spawning a second
 * Node to run identical bytes would double startup cost and break `stdio`
 * expectations for no gain.
 */
/**
 * The four ladder refusals that are statements about the OPERATOR's
 * declaration — a corrupt config, an incomplete `--dev`, a malformed pin, a
 * pin naming a version that is not installed. Each names something the
 * operator asked for and cannot be given, so each refuses (AC-5.5, E-10,
 * branches 0 and 2).
 *
 * Branch 7 (`store.empty`) is deliberately NOT here, and the distinction is
 * the one place this implementation departs from §6.2's model. §6.2 describes
 * a **thin** launcher — a `PATH` entry with no engine of its own, for which
 * an empty store means nothing can run. The shipped artifact is a **fat**
 * one: `bin/pdlc.mjs` sits beside the `lib/` and `vendor/` trees of a
 * complete engine (§5.4's packed set), so "no store entry" does not mean "no
 * engine" — it means the only installed engine is the one already running.
 * Refusing there would make every surface conditional on a store the
 * one-command install (AC-2.1) is not required to have populated, and would
 * refuse the operator a run it is perfectly able to perform. It runs in
 * place, stamped `mode: "unresolved"`, with the branch's own text announced —
 * never silent, which is what BR-4.4 and AC-5.2 actually ask for.
 *
 * Raised as an erratum against TSPEC §6.2 and DEC-EDIST-03 rather than
 * decided here alone.
 */
export const REFUSING_REFUSAL_IDS = new Set([
  "config.unreadable",
  "version.dev-incomplete",
  "version.pin-malformed",
  "version.pin-missing",
]);

export function launchMoveFor({ decision, storeRoot, engineVersion = pkg.version, enginePath = ENGINE_PATH }) {
  if (decision.kind === "refuse") {
    const id = decision.refusal && decision.refusal.id;
    if (REFUSING_REFUSAL_IDS.has(id)) {
      return { action: "refuse", message: decision.announcement, mode: "unresolved", version: null, pin: null };
    }
    // The announcement must name the outcome it accompanies (PM CR v2 F-02):
    // this arm PROCEEDS, so branch 7's refusal wording ("…before running
    // pdlc") would advise against the very thing being done. Every other
    // non-refusing refusal keeps its own text — only `store.empty` has a
    // proceed variant, because it is the only one whose refusal text names a
    // remedy that must be performed first.
    const notice =
      id === "store.empty"
        ? message("store.empty-in-place", { version: engineVersion, command: INSTALL_COMMAND })
        : decision.announcement;
    return { action: "in-process", mode: "unresolved", version: null, pin: null, notice };
  }
  if (decision.kind === "dev") return { action: "in-process", mode: "dev", version: null, pin: null };

  const version = decision.version;
  const pin = decision.kind === "pin" ? version : null;
  const entry = rootFor(storeRoot, version);
  if (version === engineVersion || path.resolve(entry) === path.resolve(enginePath)) {
    return { action: "in-process", mode: decision.kind, version, pin };
  }
  return { action: "exec", mode: decision.kind, version, pin, binPath: path.join(entry, "bin", "pdlc.mjs") };
}

/** The marker value a `move` hands to the process that will run the pipeline. */
export function markerValueFor(move) {
  return JSON.stringify({ mode: move.mode, version: move.version, pin: move.pin });
}

// ─── shared startup ────────────────────────────────────────────────────────

function startupFor(argv) {
  return runStartupChecks({
    pluginRoot: readFlag(argv, "plugin-root"),
    engineVersion: pkg.version,
    engineCompat: pkg.pdlcPluginCompat,
    devDeclared: hasFlag(argv, "dev"),
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

// ─── commands ────────────────────────────────────────────────────────────

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
/**
 * §6.2's resolve-but-never-refuse exemption, rendered. Shared by `--version`
 * and `doctor`: ONE call into `runVersionDoctor`, whose own `command`
 * argument decides whether the store-root/installed/install-command trio is
 * appended. Never `exec`s and never exits non-zero on the thing it reports.
 */
function versionDoctorFor(argv, command) {
  const inputs = launchInputs({ argv, cwd: path.resolve(readFlag(argv, "cwd") || process.cwd()) });
  return runVersionDoctor({
    command,
    listing: inputs.listing,
    configResult: inputs.configResult,
    dev: inputs.dev,
    env: process.env,
    location: inputs.location,
    storeRoot: inputs.storeRoot,
    installCommand: INSTALL_COMMAND,
    engineVersion: pkg.version,
    pluginRoot: inputs.location.pluginRoot,
    fs: nodeFs,
    pluginCompat: pkg.pdlcPluginCompat,
  });
}

/**
 * `pdlc --version` (AC-1.4). Reports the resolved engine version, the
 * declared compat range and the plugin version it finds — through the same
 * builder `doctor` uses, so the two can never disagree.
 */
async function cmdVersion(argv) {
  const out = versionDoctorFor(argv, "version");
  for (const line of out.lines) console.log(line);
  process.exitCode = out.exitCode;
}

async function cmdDoctor(argv) {
  const version = versionDoctorFor(argv, "doctor");
  for (const line of version.lines) console.log(line);
  console.log("");

  const result = startupFor(argv);
  for (const line of result.banner) console.log(line);
  for (const notice of result.notices || []) console.log(typeof notice === "string" ? notice : notice.text);
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
    // DEC-EDIST-04 makes the env var inert unless dev-mode is declared, so
    // offering it unqualified sent a refused operator down a path that does
    // nothing. Both remedies are stated with the condition each needs.
    // Sourced from STARTUP_REMEDIATION (lib/startup.mjs) — the same constant
    // preflight's !startup.ok refusal shares (PLAN P4-03; TSPEC §Modified
    // exports, the STARTUP_REMEDIATION row — cited by id, not line number,
    // per DEC-DOC-01).
    console.log(STARTUP_REMEDIATION);
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
 * The single per-run `Provenance` build for `pdlc dev` / `pdlc queue` (§7.2's
 * "Build" hop, `lib/provenance.mjs`). Built once, after the startup resolution
 * (`startup`, V-08) `startupFor` already ran, and handed unchanged into every
 * `run*()` call site below — never re-derived per loop pass (BR-1.5, TE v5
 * Q-15).
 *
 * @param {object} startup a passing `runStartupChecks()` result
 * @returns {object} frozen `Provenance` (`lib/provenance.mjs`)
 */
function provenanceFor(startup, env = process.env) {
  const { rootPath } = resolveWorkflowRoot();
  // `mode` and `pin` come from the resolution the launcher actually reached,
  // carried on the marker (§6.2). Hardcoding `mode: "dev"` here stamped the
  // dev mark on released runs, which inverts AC-5.3: a mark present on every
  // kind of run discriminates nothing, and the consumer's committed history
  // then says "dev" about a released one.
  const marker = readResolvedMarker(env);
  // `startup.engineVersion` / `startup.pluginCompat` are NOT fields
  // `runStartupChecks` returns (its triple lives on `versions` and its range
  // is the caller's own `pkg`), so reading them stamped `undefined` into
  // every POSTMORTEM, QUEUE.md row and commit message this run writes.
  return buildProvenance({
    engineVersion: (marker && marker.version) || pkg.version,
    pluginVersion: startup.pluginVersion,
    pluginCompat: pkg.pdlcPluginCompat,
    channel: "engine",
    mode: marker ? marker.mode : "unresolved",
    pin: marker ? marker.pin : null,
    loadRoot: rootPath,
  });
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

async function cmdDev(argv, deps) {
  const args = positionals(argv, VALUE_FLAGS);
  const reqPath = args[0];
  if (!reqPath) {
    console.error(USAGE);
    console.error("pdlc dev: a REQ path is required.");
    process.exitCode = 1;
    return;
  }

  const startup = deps.startupFor(argv);
  if (!startup.ok) {
    // BR-REP-0a / PROP-EXIT-10: a rung refusal (unlike a pure CLI usage
    // error) DOES emit a report line — `report: null`, stamped with the
    // `engine` block — so an unattended caller can always take the last
    // stdout line and parse it, even on a refusal.
    for (const line of formatStartup(startup, { withChecks: true })) console.error(line);
    console.error("");
    console.error(startup.reason);
    console.error("pdlc: startup did not pass — the engine refuses to dispatch (fail-closed, C-10).");
    const startedAt = new Date().toISOString();
    process.exitCode = emitReport(null, { adapter: null, startup, startedAt, finishedAt: startedAt });
    return;
  }

  if (hasFlag(argv, "dry-run")) {
    emitDryRun(argv, startup, { command: "dev", target: reqPath });
    return;
  }

  for (const line of formatStartup(startup)) console.log(line);
  const { adapter, cwd, tunables } = deps.liveAdapter(argv, startup);
  const startedAt = new Date().toISOString();
  const { report } = await deps.runDev({
    reqPath,
    forcePhases: readFlag(argv, "force-phases"),
    cwd,
    adapter,
    startup,
    provenance: provenanceFor(startup),
  });
  const finishedAt = new Date().toISOString();
  process.exitCode = emitReport(report, { adapter, startup, startedAt, finishedAt, tunables });
}

async function cmdQueue(argv, deps) {
  const startup = deps.startupFor(argv);
  if (!startup.ok) {
    // See cmdDev's identical branch: a rung refusal emits a report line
    // (BR-REP-0a / PROP-EXIT-10), unlike a pure CLI usage error. This
    // branch's shipped refusal behaviour is preserved byte-for-byte
    // (DEC-LOOP-06 alternative B) — the `--loop-state` path below only
    // ADDS the `loop` block on the existing `emitReport` seam (P4-07,
    // TSPEC §3's policy table).
    for (const line of formatStartup(startup, { withChecks: true })) console.error(line);
    console.error("");
    console.error(startup.reason);
    console.error("pdlc: startup did not pass — the engine refuses to dispatch (fail-closed, C-10).");
    const startedAt = new Date().toISOString();
    let loop = null;
    if (readFlag(argv, "loop-state") !== null) {
      // BR-28: a zero-iteration session summary is owed on both refusal
      // paths reachable through `--loop-state` — `"strict"` refuses on
      // its own preflight (`preflight-refused`), `"off"` still hits this
      // shipped `!startup.ok` branch and reports the engine's own
      // dispatch refusal (`engine-dispatch-refused`, TSPEC E-19/E-20(a)).
      const { sessionSummary, readLoopConfig } = await loopSessionModule();
      const cwd = path.resolve(readFlag(argv, "cwd") || process.cwd());
      let configText = null;
      try {
        configText = nodeFs.readFileSync(path.join(cwd, ".claude", "pdlc.config.json"), "utf8");
      } catch {
        configText = null;
      }
      const { config } = readLoopConfig(configText);
      const stopReason = config.preflight === "off" ? "engine-dispatch-refused" : "preflight-refused";
      const { fields } = sessionSummary({
        stopReason,
        iterations: 0,
        merged: [],
        halted: [],
        escalationsRaised: [],
        operatorView: null,
        openEscalations: 0,
        nextActionable: null,
        notices: [],
      });
      loop = fields;
    }
    process.exitCode = emitReport(null, { adapter: null, startup, startedAt, finishedAt: startedAt, loop });
    return;
  }

  const queuePath = readFlag(argv, "queue-path");
  const loopStateFlag = readFlag(argv, "loop-state");
  if (hasFlag(argv, "loop") && loopStateFlag !== null) {
    // TSPEC §2: `--loop-state` is the session-side, one-iteration-per-process
    // protocol; `--loop` is the engine's own in-process driver
    // (`runQueueLoop`). The two are mutually exclusive — same validation
    // shape as the shipped `--max-iterations` usage error.
    console.error(
      "pdlc queue: --loop and --loop-state may not be used together (they are two different loop drivers).",
    );
    process.exitCode = 1;
    return;
  }

  if (hasFlag(argv, "dry-run")) {
    emitDryRun(argv, startup, { command: "queue", target: queuePath || "docs/_queue/QUEUE.md" });
    return;
  }

  for (const line of formatStartup(startup)) console.log(line);
  const { adapter, cwd, tunables } = deps.liveAdapter(argv, startup);

  if (loopStateFlag !== null) {
    // TSPEC §2/§3/§6 (P4-05..P4-07): the session-side, one-iteration-per-process
    // protocol. Decode the session's carried state, dispatch ONE real `runQueue`
    // pass with that state threaded through, and emit the `loop` block the shipped
    // `orchestrate-queue` SKILL.md's "Directive protocol (session side)" already
    // documents: step 2's `kind` (`stop`/`continue`) and step 3's `nextState`.
    //
    // CR v1 F-01/F-02: this branch previously decoded the token, printed two prose
    // lines and returned 0 WITHOUT dispatching — so the entire session-loop path in
    // `orchestrate-queue.js#main` had no production caller, and the SKILL documented
    // a response shape the binary never emitted. Because the SKILL's own
    // launch-failure predicate is "exits without producing a parseable `loop` block",
    // a correctly installed engine on a healthy repo satisfied it on every iteration.
    //
    // The preflight is NOT evaluated here: `main` evaluates it, with this layer's real
    // `startup` threaded in as `loopStartup` (F-06), so AC-3.1's engine-readiness
    // conjunct and AC-3.2's clean-tree conjunct are decided together over one session
    // rather than one per layer.
    const { sessionSummary, iterationLine, decodeLoopState } = await loopSessionModule();



    // AT-12 (CR v1 F-02): the engine-version comparison, computed HERE — the only layer
    // that can, since the plugin manifest and the engine's declared compat range are both
    // this process's own facts — and threaded down to `evaluatePreflight`. `versionDoctorFor`
    // is the same builder `pdlc --version` and `pdlc doctor` render, so a session's mismatch
    // notice and the doctor's mismatch line can never disagree (TSPEC §Interfaces names it as
    // this value's source). `orchestrate-queue.js` previously supplied a hardcoded
    // `{mismatched: false}` literal, which made AT-12's notice unreachable by any operator.
    const versionDoctor = versionDoctorFor(argv, "version");
    const loopVersionMismatch = !versionDoctor.plugin.ok
      ? { mismatched: true, detail: versionDoctor.plugin.reason }
      : versionDoctor.resolvedEngineVersion && versionDoctor.resolvedEngineVersion !== pkg.version
        ? {
            mismatched: true,
            // The skew startup cannot see: rung 3 compares the PLUGIN against this engine's
            // declared range, never the version store's answer against the engine actually
            // running. They diverge whenever the resolution hop was bypassed — a resolved-child
            // marker inherited from an outer session, a stale `PATH` shim — and the symptom is a
            // session silently driven by bytes the operator did not install. Report-only, per
            // AT-12: preflight does not refuse on the preamble alone and iteration 1 still runs.
            detail: `the version store resolves pdlc-engine v${versionDoctor.resolvedEngineVersion}, but this process is v${pkg.version}`,
          }
        : { mismatched: false, detail: null };

    // E-25 (CR v1 F-08): the wait that PRECEDED this invocation. The session performs the
    // wait (DEC-LOOP-02), so it is the only party that knows what it actually waited; it
    // reports the pair back the same way it echoes `nextState`. Absent flags mean no wait
    // was taken (iteration 1), which is a `null` `WaitRecord`, not a zero-length one.
    const waitRequestedFlag = readFlag(argv, "wait-requested");
    const waitActualFlag = readFlag(argv, "wait-actual");
    const wait =
      waitRequestedFlag === null
        ? null
        : {
            requestedMinutes: Number(waitRequestedFlag),
            actualMinutes: waitActualFlag === null || waitActualFlag === "" ? null : Number(waitActualFlag),
          };

    const state = decodeLoopState(loopStateFlag);
    const startedAt = new Date().toISOString();
    const { report } = await deps.runQueue({
      queuePath,
      cwd,
      adapter,
      startup,
      provenance: provenanceFor(startup),
      loopState: loopStateFlag,
      loopStartup: startup,
      loopStartupRemediation: STARTUP_REMEDIATION,
      loopVersionMismatch,
    });
    const finishedAt = new Date().toISOString();

    // `main` returns its directive on `report.loop` for every loop-active pass —
    // both the preflight-refusal early return and `finish`'s normal projection.
    const directive = (report && report.loop) || {
      kind: "stop",
      stopReason: "engine-dispatch-refused",
      waitMinutes: 0,
      nextState: null,
      detail: "The queue driver returned no directive.",
    };
    const notices = (report && report.notices) || [];
    const operatorView = (report && report.operatorView) || null;

    // The session's state AFTER this pass, read back from the directive's own `nextState`
    // token — the authoritative value, because it is the exact token the session echoes into
    // the next invocation, so the summary cannot describe a session different from the one
    // that continues. `state` (the INCOMING token) is the wrong source: it predates this
    // pass, so a feature merged during it would be missing from the very summary reporting
    // it. A preflight refusal encodes the incoming state unchanged, which is what makes
    // BR-28's zero-iteration summary come out at zero here rather than by a special case.
    const endState = directive.nextState ? decodeLoopState(directive.nextState) : state;

    // AC-7.1: one line per iteration naming outcome, feature and merge status.
    const pipelineReport = report && report.pipelineReport;
    const { text: iterationText } = iterationLine({
      // THIS invocation's ordinal: the session has already run `state.iteration` of them.
      iteration: state.iteration + 1,
      outcome: report ? report.outcome : "refused",
      feature: (report && report.picked) || null,
      mergeStatus: (pipelineReport && pipelineReport.mergeStatus) || "n/a",
      prUrl: (pipelineReport && pipelineReport.prUrl) || null,
      wait,
      notices,
    });
    console.log(iterationText);

    let loop = { ...directive, notices, operatorView };

    // AC-7.2: the session's LAST iteration owes a summary — features merged with PR
    // URLs, the open-escalation count and the next actionable item. Previously this
    // was reachable only when the engine refused to start, i.e. on the one path where
    // all three fields are empty by construction.
    if (directive.kind === "stop") {
      const items = (operatorView && operatorView.items) || [];
      const { fields, text } = sessionSummary({
        stopReason: directive.stopReason,
        iterations: Number.isInteger(endState.iteration) ? endState.iteration : 0,
        merged: endState.merged ?? [],
        halted: endState.halted ?? [],
        escalationsRaised: endState.escalationsRaised ?? [],
        operatorView,
        openEscalations: items.length,
        nextActionable: items.length ? items[0] : null,
        notices,
      });
      console.log(text);
      loop = { ...loop, ...fields };
    }

    process.exitCode = emitReport(report, {
      adapter,
      startup,
      startedAt,
      finishedAt,
      tunables,
      loop,
    });
    return;
  }

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
    const { passes, outcome, stopReason, exitCode, loop } = await deps.runQueueLoop({
      queuePath,
      cwd,
      adapter,
      startup,
      maxPasses,
      provenance: provenanceFor(startup),
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
  const { report } = await deps.runQueue({
    queuePath,
    cwd,
    adapter,
    startup,
    provenance: provenanceFor(startup),
  });
  const finishedAt = new Date().toISOString();
  process.exitCode = emitReport(report, { adapter, startup, startedAt, finishedAt, tunables });
}

// ─── entry ──────────────────────────────────────────────────────────────

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

/**
 * The launcher hop (TSPEC §6.2, DEC-EDIST-06): `spawnSync(process.execPath,
 * [binPath, ...argv], { stdio: "inherit", env })`, re-raising the resolved
 * child's exit status verbatim when it is a number, or `128 + signum` when
 * the child was terminated by a signal instead (never collapsing a
 * signalled child to exit 0). `spawnSyncFn` defaults to the real
 * `node:child_process.spawnSync` and is overridden only by tests, which
 * inject a pure recorder so resolution assertions never spawn a second Node.
 *
 * @param {string} binPath absolute path to the resolved engine's `bin/pdlc.mjs`
 * @param {string[]} argv the original argv to forward, verbatim
 * @param {object} env the env to pass through, unmerged and undefaulted
 * @param {Function} [spawnSyncFn]
 * @returns {number} the launcher's own exit code
 */
export function execLauncher(binPath, argv, env, spawnSyncFn = spawnSync) {
  const result = spawnSyncFn(process.execPath, [binPath, ...argv], { stdio: "inherit", env: { ...env } });
  if (typeof result.status === "number") return result.status;
  if (result.signal) return 128 + os.constants.signals[result.signal];
  return 1;
}

/**
 * `--version` / `doctor`'s resolve-but-never-refuse exemption (TSPEC §6.2,
 * AT-1.1..AT-1.4, AT-1.6). Runs the resolution ladder for REPORTING ONLY —
 * never `exec`s a resolved child — and reports the resolved engine's triple
 * on success, or falls back to the launcher's own triple with
 * `mode: "unresolved"` and the refusing branch's text carried as a notice,
 * never an exit. Always `exitCode: 0`: a diagnostic that exits non-zero on
 * the thing it is diagnosing is not a diagnostic.
 */
export function runVersionDoctor({
  command,
  listing,
  configResult,
  dev = false,
  env = {},
  location,
  storeRoot,
  installCommand,
  engineVersion,
  pluginRoot,
  fs,
  pluginCompat,
}) {
  const decision = resolveVersion({ listing, configResult, dev, env, location });

  let mode;
  let resolvedEngineVersion;
  let pin;
  let storeNotice;
  if (decision.kind === "refuse") {
    mode = "unresolved";
    resolvedEngineVersion = engineVersion;
    pin = null;
    storeNotice = decision.announcement;
  } else {
    mode = decision.kind;
    resolvedEngineVersion = decision.kind === "dev" ? engineVersion : decision.version;
    pin = decision.kind === "pin" ? decision.version : null;
    storeNotice = null;
  }

  // BR-1.3: present-but-unreadable is never collapsed into AT-1.1's "not
  // found" — that literal is reserved for a resolved root with no manifest
  // read attempted at all. A broken manifest short-circuits `checkCompat`
  // and builds its own refusal, naming the root-inspection failure instead.
  let pluginReadError = null;
  let plugin;
  if (!pluginRoot) {
    plugin = checkCompat(pluginCompat, null);
  } else {
    const read = readPluginVersion(pluginRoot, { fs });
    if (read.ok) {
      plugin = checkCompat(pluginCompat, read.version);
    } else {
      pluginReadError = read.reason;
      const range = String(pluginCompat == null ? "" : pluginCompat).trim();
      plugin = { ok: false, reason: pluginReadError, pluginVersion: "unreadable", range };
    }
  }

  const provenance = buildProvenance({
    engineVersion: resolvedEngineVersion,
    pluginVersion: plugin.pluginVersion === "not found" ? null : plugin.pluginVersion,
    pluginCompat: plugin.range,
    channel: "engine",
    mode,
    pin,
    loadRoot: (location && location.enginePath) || "",
  });

  const lines = [`pdlc-engine v${resolvedEngineVersion}`, `mode:     ${mode}${pin ? ` (pin: ${pin})` : ""}`];
  if (storeNotice) lines.push(storeNotice);
  lines.push(`plugin:   pdlc v${plugin.pluginVersion} (engine requires ${plugin.range})`);
  if (!plugin.ok) lines.push(plugin.reason);
  if (pluginReadError) lines.push(pluginReadError);
  if (command === "doctor") {
    lines.push(`store root:       ${storeRoot}`);
    lines.push(`installed:        ${listing.length > 0 ? listing.join(", ") : "none"}`);
    lines.push(`install command:  ${installCommand}`);
  }

  return {
    exitCode: 0,
    mode,
    resolvedEngineVersion,
    pin,
    storeNotice,
    plugin,
    pluginReadError,
    provenance,
    lines,
  };
}

// TSPEC §9.3: the runner seam. `runDev`, `runQueue` and `runQueueLoop` arrive
// as static ESM bindings and cannot be substituted by an importer, so the
// process-entry test level injects recorders through this default-valued
// `deps` object instead — the same shape `run.mjs` already uses for
// `importWorkflow`. Production behaviour is unchanged because these
// defaults *are* the module's own bindings. The seam covers five members,
// not three, because two gates — `startupFor` and `liveAdapter` — stand
// between `main()` and any runner; without them a process-entry leg's
// outcome would be decided by the machine it happens to run on rather than
// by the code under test.
export const defaultDeps = { runDev, runQueue, runQueueLoop, startupFor, liveAdapter };
export default defaultDeps;

/**
 * `argv` keeps HEAD's convention and is defaulted to `process.argv`: the
 * body still opens with the same two-element skip (`execPath`, script
 * path) HEAD's bare `main().catch(...)` relied on implicitly, so a caller —
 * whether the real `bin/pdlc.mjs` guard or a test — passes a
 * process-argv-shaped array, not a sliced argument list.
 */
/** Same arrangement as `loopSessionModule`, for `orchestrate-dev.js`'s escalation writers. */
async function devWorkflowModule() {
  const { rootPath } = resolveWorkflowRoot();
  return import(pathToFileURL(path.join(rootPath, "orchestrate-dev.js")).href);
}

/** The closed outcome set a decision block's `| Decision |` row may carry (TSPEC §4b). */
const DECISION_OUTCOMES = ["resolved", "rejected"];

/**
 * `pdlc decide` — AC-4.4's operator surface, and the production caller
 * `renderDecisionEntry`/`appendEscalationEntry`'s `kind: "decision"` branch never had.
 *
 * The loop prints each open item's `entryId` in its rendered view (TSPEC §Architecture §6);
 * this command takes one of those ids back and records the operator's decision as a durable
 * block appended to the same `docs/_queue/ESCALATIONS.md`. It rewrites nothing: the decided
 * entry's own block is untouched, and the view derives closure by overlay at read time —
 * which is exactly what makes the record retainable input for a later calibration pass.
 *
 * Dispatches nothing: no adapter, no transport, no model. It reads one file, parses it with
 * the shipped reader, and appends one block.
 */
async function cmdDecide(argv) {
  const cwd = path.resolve(readFlag(argv, "cwd") || process.cwd());
  const entry = readFlag(argv, "entry");
  const outcome = readFlag(argv, "outcome");
  const decidedBy = readFlag(argv, "by");
  const rationale = readFlag(argv, "rationale");

  if (!entry || !outcome || !decidedBy) {
    console.error("pdlc decide: --entry, --outcome and --by are all required.");
    process.exitCode = 1;
    return;
  }
  if (!DECISION_OUTCOMES.includes(outcome)) {
    console.error(
      `pdlc decide: --outcome must be one of ${DECISION_OUTCOMES.join(", ")} (got "${outcome}").`,
    );
    process.exitCode = 1;
    return;
  }

  const logPath = path.join(cwd, "docs", "_queue", "ESCALATIONS.md");
  let logText = null;
  try {
    logText = nodeFs.readFileSync(logPath, "utf8");
  } catch {
    logText = null;
  }

  const { parseEscalationLog } = await escalationViewModule();
  const log = parseEscalationLog(logText);
  // Refuse an id the log does not carry: a decision naming nothing is a block no overlay can
  // ever match, i.e. a silent no-op that still looks recorded. The reader is the SAME export
  // the view uses, so an id this command accepts is an id the overlay will match.
  const known = log.entries.some((e) => e.kind !== "decision" && e.id === entry);
  if (!known) {
    console.error(
      `pdlc decide: no escalation entry with id "${entry}" in ${path.join("docs", "_queue", "ESCALATIONS.md")}.`,
    );
    process.exitCode = 1;
    return;
  }
  const decided = log.entries.find((e) => e.kind !== "decision" && e.id === entry);

  const { appendEscalationEntry } = await devWorkflowModule();
  const decidedAt = new Date().toISOString();
  await appendEscalationEntry({
    disposition: {
      kind: "decision",
      decision: outcome,
      decidedBy,
      decidesId: entry,
      decidedAt,
      rationale: rationale || null,
    },
    ctx: { feature: decided.feature },
    // `appendEscalationEntry` writes to its own repo-relative `ESCALATIONS_PATH`; this seam
    // anchors that path at the operator's `--cwd`, the same way every other engine-side
    // workflow seam does.
    _appendFile: async (relPath, contents) => {
      const target = path.join(cwd, relPath);
      nodeFs.mkdirSync(path.dirname(target), { recursive: true });
      nodeFs.appendFileSync(target, contents);
    },
    _now: () => Date.now(),
  });

  console.log(`Recorded ${outcome} for entry ${entry} (${decided.feature}) in ${logPath}.`);
  process.exitCode = 0;
}

/**
 * Dynamically loads `pdlc/workflows/lib/stats.mjs` from whichever workflow
 * root `resolveWorkflowRoot` resolves (vendor tree when packaged, checkout
 * tree in-repo — TSPEC §5.2), the same arrangement as `loopSessionModule`.
 */
async function statsWorkflowModule() {
  const { rootPath } = resolveWorkflowRoot();
  return import(pathToFileURL(path.join(rootPath, "lib", "stats.mjs")).href);
}

/**
 * The single construction site for the four-classifier bundle `cmdStats`
 * hands `runStats` (TSPEC §2.5/§3.4/§6.4) — mirrors `loopSessionModule()`'s
 * arrangement. Sourced from the SAME dynamically-imported `orchestrate-dev.js`
 * instance `devWorkflowModule()` already resolves, so `bundle.parseReviewFilename
 * === (a static import of orchestrate-dev.js).parseReviewFilename` holds in a
 * dev checkout (T-10's parser-identity oracle).
 */
export async function statsParsers() {
  // Dot access, not destructuring: a second `{ parseReviewFilename, ... }`-shaped
  // span here would double-count the construction-site oracle (T-10) even
  // though only the returned object below is actually constructed.
  const mod = await devWorkflowModule();
  return {
    parseReviewFilename: mod.parseReviewFilename,
    deriveRoundWindow: mod.deriveRoundWindow,
    deriveDodRoundIndex: mod.deriveDodRoundIndex,
    parseResolvedMarker: mod.parseResolvedMarker,
  };
}

/**
 * The production `StatsIo` (TSPEC §2.3/§2.4/§6.4): exactly `listDir`,
 * `fileSize`, `readFile`, `exists` — no write capability. `fileSize` calls
 * `lstatSync`, never `statSync` — a symbolic link contributes its own size,
 * never its target's (T-09's EC-19 symlink leg, T-10's seam-boundary oracle).
 */
function statsIo() {
  return {
    listDir(absDir) {
      return nodeFs.readdirSync(absDir, { withFileTypes: true }).map((entry) => ({
        name: entry.name,
        isDirectory: entry.isDirectory(),
        isFile: entry.isFile(),
        isSymbolicLink: entry.isSymbolicLink(),
      }));
    },
    fileSize(absPath) {
      return nodeFs.lstatSync(absPath).size;
    },
    readFile(absPath) {
      return nodeFs.readFileSync(absPath, "utf8");
    },
    exists(absPath) {
      return nodeFs.existsSync(absPath);
    },
  };
}

/**
 * `pdlc stats` (TSPEC §3.4) — a pure, read-only report over `docs/` (BR-01,
 * TSPEC §6.5). Dispatches nothing: no adapter, no transport, no model.
 * `runStats` never throws for a decided scenario; the outermost `try`/`catch`
 * here exists only for a genuinely unexpected fault (e.g. the dynamic import
 * above failing), never for anything `runStats` itself can produce.
 */
async function cmdStats(argv) {
  try {
    const cwd = path.resolve(readFlag(argv, "cwd") || process.cwd());
    const parsers = await statsParsers();
    const io = statsIo();
    const { runStats } = await statsWorkflowModule();
    const { stdout, stderr, exitCode } = runStats({ argv, io, parsers, cwd });
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
    process.exitCode = exitCode;
  } catch (err) {
    process.stderr.write(`pdlc stats: unexpected error: ${err && err.message ? err.message : String(err)}\n`);
    process.exitCode = 1;
  }
}

export async function main(argv = process.argv, deps = defaultDeps) {
  const [, , cmd, ...rest] = argv;
  switch (cmd) {
    case "hello":
      // BR-CMD-1: exempt diagnostic, no flag-shape gate.
      await cmdHello();
      break;
    case "spike:sdk":
      // BR-CMD-1: exempt diagnostic, no flag-shape gate.
      await cmdSpikeSdk();
      break;
    case "--version":
    case "-v":
    case "version":
      // BR-CMD-1's exemption shape: AC-1.4 is unconditional on an installed
      // package, so the one command that reports the version cannot itself
      // be gated behind a flag table.
      await cmdVersion(rest);
      break;
    case "doctor":
      if (checkFlags(rest, "doctor")) await cmdDoctor(rest);
      break;
    case "decide":
      if (checkFlags(rest, "decide")) await cmdDecide(rest);
      break;
    case "stats":
      if (checkFlags(rest, "stats")) await cmdStats(rest);
      break;
    case "dev":
      if (checkFlags(rest, "dev")) await cmdDev(rest, deps);
      break;
    case "queue":
      if (checkFlags(rest, "queue")) await cmdQueue(rest, deps);
      break;
    default:
      console.error(USAGE);
      console.error(`Unknown command: ${cmd ?? "(none)"}`);
      process.exitCode = 1;
  }
}

/**
 * The launcher entry (§6.2, DEC-EDIST-03 / DEC-EDIST-06) — the production
 * edge that reaches `resolveVersion` and `execLauncher`.
 *
 * It sits ABOVE `main()` rather than inside `cmdDev`/`cmdQueue` because
 * §6.2 puts resolution in the launcher and makes the resolved child run
 * in-process without re-resolving: `main()` IS that child's entry, and a
 * resolution hop inside it would have to undo itself on every recursive
 * pass. Keeping the hop here also keeps `main(argv, deps)` the five-seam
 * in-process entry that TSPEC §9.3 pins and the process-entry tests drive.
 *
 * Only the two DISPATCHING commands resolve. `--version`, `doctor`, `hello`
 * and `spike:sdk` pass straight through: §6.2's exemption is "never refuse",
 * and a launcher that refused before `doctor` ran would make the diagnostic
 * unreachable in exactly the state it exists to explain (R-B).
 *
 * @param {string[]} argv process-argv-shaped, as `main`'s
 * @param {object} [io] injected seams — `env` and `fs` for the resolution,
 *   `exec` for the child hop, `runMain` for the in-process arm, `log`/`error`
 *   for output. Defaulted to the real ones; tests substitute all six so no
 *   leg spawns a second Node or reads a real store.
 * @returns {Promise<number|undefined>} the launcher's own exit code for the
 *   `exec` arm; `undefined` when the run happened in this process (whose
 *   exit code `main` has already set through `process.exitCode`).
 */
export async function launch(argv = process.argv, io = {}) {
  const {
    env = process.env,
    fs = nodeFs,
    homedir = os.homedir(),
    exec = execLauncher,
    runMain = main,
    log = console.log,
    error = console.error,
    // The running engine's own version, i.e. the one the in-process arm is
    // able to be. Injectable so a leg can fix which arm a decision takes
    // without depending on whatever this package happens to be versioned at
    // today — a bare `pkg.version` read would make those legs fail on the
    // next release rather than on a regression.
    engineVersion = pkg.version,
  } = io;

  const [, , cmd, ...rest] = argv;
  if (cmd !== "dev" && cmd !== "queue") return runMain(argv);

  // Already the resolved child: presence alone decides, so a garbled marker
  // degrades to "run here" and never to a second spawn (see the constant).
  if (readResolvedMarker(env)) return runMain(argv);

  // A malformed command line is a usage error, not a resolution outcome
  // (EC-CLI-5 / EC-CLI-7, BR-REP-0a). Resolving first would answer a typo
  // with a message about the version store, which names the wrong problem.
  if (validateFlags(rest, cmd)) return runMain(argv);

  // The AC-3.1 inspection surface dispatches nothing, so it is exempt from
  // the hop for the same reason §6.2 exempts `doctor`: a surface whose whole
  // job is to explain what WOULD happen must stay reachable in the state the
  // operator is trying to understand.
  if (hasFlag(rest, "dry-run")) return runMain(argv);

  const { decision, storeRoot } = resolveForLaunch({
    argv: rest,
    cwd: path.resolve(readFlag(rest, "cwd") || process.cwd()),
    env,
    fs,
    homedir,
  });
  const move = launchMoveFor({ decision, storeRoot, engineVersion });

  if (move.action === "refuse") {
    // AC-5.5: a pin naming an uninstalled version refuses naming the pin and
    // what is installed. It never falls back to latest, and unlike the two
    // exempt commands it never downgrades the refusal to a notice.
    error(move.message);
    error("pdlc: refusing to run an unresolved engine version (fail-closed).");
    process.exitCode = 1;
    return 1;
  }

  const marked = { ...env, [RESOLVED_MARKER_ENV]: markerValueFor(move) };
  if (move.action === "in-process") {
    // The marker is written into THIS process's env, not only a child's, so
    // the in-process arm and the spawned arm stamp provenance through one
    // path (`provenanceFor` reads the marker either way).
    process.env[RESOLVED_MARKER_ENV] = marked[RESOLVED_MARKER_ENV];
    log(move.notice || decision.announcement);
    return runMain(argv);
  }

  log(decision.announcement);
  const code = exec(move.binPath, argv.slice(2), marked);
  process.exitCode = code;
  return code;
}

// Self-invocation moves behind an entry guard (§9.3): importing this module
// — the way both `bin/pdlc.mjs`'s dynamic import and this file's own test
// suite do — is inert. `process.argv[1]` is the real Node entry script's
// path; when this file is loaded via `bin/pdlc.mjs`'s dynamic import, that
// path names the guard, not this file, so the comparison is false and
// nothing runs.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  launch().catch((err) => {
    // Engine crash — distinct from a pipeline halt (exit 2) by design (AC-1.4).
    console.error(err && err.stack ? err.stack : String(err));
    process.exitCode = 1;
  });
}
