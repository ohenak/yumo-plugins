/**
 * driftHarness.js — the bash harness (TSPEC §3). A generalisation of
 * `hookCompatibility.test.js`'s `runHookScript` (lines 46–58) with the additions this
 * feature needs: a constructed-never-inherited environment sandbox, the two seams
 * (`_spawnSync` injection, `PDLC_FAULT`/`PDLC_TRACE_FILE`), and `JSON.parse`-only
 * artifact read-back.
 *
 * Ownership (PLAN, single-writer-per-file across batches):
 *   - T-08a (batch 3, THIS SLICE): `runScript`/`sandboxEnv`/`makeToolDir`, the four
 *     entrypoint→invocation mappings, `RunResult` (incl. `tracePath`), the read-back set
 *     (`readDriftState`/`readSyncManifest`/`listBackups`/`inodeOf`/`indexMode`, TSPEC §3.4),
 *     and `runGrammar`'s line-count-equality batched driver (§11.2).
 *   - T-08b (batch 4): appends the message layer (the `MESSAGES` matcher table of §7.2 and
 *     its accessors) BELOW the "T-08b appends here" marker at the end of this file. Nothing
 *     above that marker needs to change to accommodate it — `RunResult.notices`/`.warnings`
 *     are already shaped as arrays; T-08b only needs to replace `splitStderrLines`'s
 *     heuristic with the real matcher table.
 */

import { spawnSync, execFileSync } from "child_process";
import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  statSync,
  existsSync,
  symlinkSync,
} from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// __dirname = pdlc/workflows/__tests__/helpers; up three levels to pdlc/, then hooks/scripts.
// These are the plugin's OWN script files on disk — distinct from `opts.pluginRoot`, which is
// only the value the sandboxed child sees as $CLAUDE_PLUGIN_ROOT (TSPEC §3.1).
const HOOKS_SCRIPTS_DIR = resolve(__dirname, "../../../hooks/scripts");
const CHECK_WORKFLOW_DRIFT_SCRIPT = join(HOOKS_SCRIPTS_DIR, "check-workflow-drift.sh");
const SYNC_WORKFLOWS_SCRIPT = join(HOOKS_SCRIPTS_DIR, "sync-workflows.sh");

// `runGrammar`'s driver (T-18, batch 4). Not required to exist yet — its absence only
// affects the real-spawn default path; the injected-`_spawnSync` contract (T-08a's own
// defensive check, TSPEC §11.2) does not touch the filesystem for this script at all.
const BACKUP_GRAMMAR_SCRIPT = resolve(__dirname, "bin", "backup-grammar.sh");

const DRIFT_STATE_REL = [".claude", "workflows", ".pdlc-drift-state.json"];
const SYNC_MANIFEST_REL = [".claude", "workflows", ".pdlc-sync-manifest.json"];
const BACKUPS_DIR_REL = [".claude", "workflows", ".pdlc-backups"];

const DEFAULT_PATH_TOOLS = Object.freeze([
  "bash",
  "git",
  "python3",
  "shasum",
  "sha1sum",
  "mv",
  "rm",
  "date",
  "printf",
]);

// ───────────────────────────── §3.2.1 makeToolDir ─────────────────────────────

// Memoised per jest worker (module-level Map), keyed by the sorted, comma-joined tool list —
// so two fixtures requesting the same tool set share one resolved directory (TSPEC §3.2.1).
const toolDirCache = new Map();

function resolveToolPath(name) {
  try {
    // TSPEC §3.2.1 names `execFileSync("command", ["-v", name])`; `command` is a shell
    // builtin (not a standalone executable) so it is invoked through `bash -c`, which is
    // the same non-interactive, non-login shell the harness itself always uses (§3.2.1
    // fact 1) — no wider PATH gets sourced by this resolution step either.
    const out = execFileSync("bash", ["-c", `command -v ${name}`], { encoding: "utf8" });
    return out.trim();
  } catch {
    return "";
  }
}

/**
 * A single directory containing one symlink per requested tool, resolved once per jest
 * worker and memoised. Throws when a requested tool cannot be resolved on this runner
 * (TSPEC §3.2.1) — fixture construction fails loudly rather than silently producing a tree
 * under a test that expected the tool to be present.
 *
 * @param {string[]} names
 * @returns {string} absolute path to the tool directory
 */
export function makeToolDir(names) {
  const key = [...names].sort().join(",");
  if (toolDirCache.has(key)) return toolDirCache.get(key);

  const dir = mkdtempSync(join(tmpdir(), "pdlc-tools-"));
  for (const name of names) {
    const resolved = resolveToolPath(name);
    if (!resolved) {
      throw new Error(`driftHarness.makeToolDir: cannot resolve tool "${name}" on PATH`);
    }
    symlinkSync(resolved, join(dir, name));
  }
  toolDirCache.set(key, dir);
  return dir;
}

// ───────────────────────────── §3.2 the environment sandbox ─────────────────────────────

/**
 * The child's environment, CONSTRUCTED, never inherited (TSPEC §3.2). Unlike
 * `hookCompatibility.test.js`'s `runHookScript`, this never spreads `...process.env` — a
 * leaked `HOME` or `CLAUDE_PLUGIN_ROOT` would silently defeat the fixtures that need them
 * absent (§2.2's `$HOME`-rejection clause; AT-24/AT-33's `plugin-root-unset` baseline).
 *
 * @param {object} o normalised RunOpts (see `normalizeRunOpts`)
 */
function sandboxEnv(o) {
  return {
    PATH: makeToolDir(o.path),
    HOME: o.home,
    PWD: o.cwd,
    TMPDIR: o.tmp,
    LC_ALL: "C",
    LANG: "C",
    TZ: "UTC",
    ...(o.pluginRoot ? { CLAUDE_PLUGIN_ROOT: o.pluginRoot } : {}),
    ...(o.trace ? { PDLC_TRACE_FILE: o.tracePath } : {}),
    ...(o.fault.length ? { PDLC_FAULT: o.fault.join(",") } : {}),
    ...o.env,
  };
}

// ───────────────────────────── §3.1 entrypoint → invocation ─────────────────────────────

/**
 * @param {"hook"|"check"|"sync"|"sync-force"} entrypoint
 * @returns {{ script: string, args: string[], generatedBy: "hook"|"check"|"sync" }}
 */
function resolveEntrypoint(entrypoint) {
  switch (entrypoint) {
    case "hook":
      return { script: CHECK_WORKFLOW_DRIFT_SCRIPT, args: [], generatedBy: "hook" };
    case "check":
      return { script: SYNC_WORKFLOWS_SCRIPT, args: ["--check"], generatedBy: "check" };
    case "sync":
      return { script: SYNC_WORKFLOWS_SCRIPT, args: [], generatedBy: "sync" };
    case "sync-force":
      return { script: SYNC_WORKFLOWS_SCRIPT, args: ["--force"], generatedBy: "sync" };
    default:
      throw new Error(`driftHarness.runScript: unknown entrypoint "${entrypoint}"`);
  }
}

function makeTracePath(tmp) {
  const unique = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return join(tmp, `pdlc-trace-${unique}.tsv`);
}

/**
 * Fills every RunOpts default from TSPEC §3.1's table. `home` is a SIBLING of `consumerRoot`,
 * never an ancestor (§3.3) — an ancestor `HOME` would make every repo-root fixture measure
 * the `$HOME` guard instead of what it meant to measure.
 */
function normalizeRunOpts(entrypoint, opts) {
  const raw = opts || {};
  if (!raw.consumerRoot) {
    throw new Error("driftHarness.runScript: opts.consumerRoot is required");
  }
  const consumerRoot = raw.consumerRoot;
  const cwd = raw.cwd || consumerRoot;
  const home = raw.home || mkdtempSync(join(dirname(consumerRoot), "pdlc-home-"));
  const tmp = raw.tmp || tmpdir();
  const path = raw.path || DEFAULT_PATH_TOOLS;
  const fault = raw.fault || [];
  const trace = raw.trace !== false; // default true (§3.1)
  const env = raw.env || {};
  const tracePath = trace ? raw.tracePath || makeTracePath(tmp) : undefined;

  return {
    consumerRoot,
    cwd,
    home,
    tmp,
    path,
    fault,
    trace,
    env,
    tracePath,
    pluginRoot: raw.pluginRoot,
    argv: raw.argv,
  };
}

/**
 * Raw trace lines (unparsed), read only if `tracePath` exists. `parseTrace`
 * (`driftOrdering.js`, T-16) is the parser of record for the §4.1 grammar — this is a
 * passthrough so `RunResult.trace` is always an array, never `undefined`, before T-16 lands.
 */
function readTraceIfPresent(tracePath) {
  if (!tracePath || !existsSync(tracePath)) return [];
  const raw = readFileSync(tracePath, "utf8");
  return raw.length ? raw.split("\n").filter((line) => line.length > 0) : [];
}

/**
 * Heuristic-only placeholder split of stderr into notice/warning lines. T-08b (batch 4)
 * replaces this with the real `MESSAGES` matcher table (TSPEC §7.2); `RunResult`'s shape
 * (`notices`/`warnings` arrays) does not change when that lands.
 */
function splitStderrLines(stderr) {
  const lines = stderr.length ? stderr.split("\n").filter((line) => line.length > 0) : [];
  return {
    notices: lines.filter((line) => /\bN-\d+\b/.test(line)),
    warnings: lines.filter((line) => /\bW-\d+\b/.test(line)),
  };
}

/**
 * The single driver. Invokes the requested entrypoint's real script (always as
 * `bash <path>`, per §3.1 — never the bare path, so an execute-bit regression cannot turn
 * unrelated tests red with `EACCES`) against a constructed sandbox environment.
 *
 * @param {"hook"|"check"|"sync"|"sync-force"} entrypoint
 * @param {object} opts RunOpts (TSPEC §3.1) plus an injectable `_spawnSync` (DI seam;
 *   defaults to the real `spawnSync`) and an optional `stdin` string.
 * @returns {{status:number, stdout:string, stderr:string, trace:Array, tracePath:(string|undefined), notices:string[], warnings:string[], generatedBy:string}}
 */
export function runScript(entrypoint, opts = {}) {
  const o = normalizeRunOpts(entrypoint, opts);
  const { script, args, generatedBy } = resolveEntrypoint(entrypoint);
  const argv = o.argv !== undefined ? o.argv : args;
  const spawnFn = opts._spawnSync || spawnSync;

  const spawnOpts = {
    encoding: "utf8",
    cwd: o.cwd,
    env: sandboxEnv(o),
  };
  if (opts.stdin !== undefined) {
    spawnOpts.input = opts.stdin;
  } else if (entrypoint === "hook") {
    spawnOpts.input = "{}";
  }

  const result = spawnFn("bash", [script, ...argv], spawnOpts);
  // Same normalisation as the shipped `runHookScript` precedent: a killed process can never
  // read as exit 0.
  const status = result.status ?? -1;
  const stdout = result.stdout || "";
  const stderr = result.stderr || "";
  const { notices, warnings } = splitStderrLines(stderr);

  return {
    status,
    stdout,
    stderr,
    trace: o.trace ? readTraceIfPresent(o.tracePath) : [],
    tracePath: o.tracePath,
    notices,
    warnings,
    generatedBy,
  };
}

// ───────────────────────────── §3.4 reading back the artifacts ─────────────────────────────

function readJsonArtifact(path) {
  if (!existsSync(path)) return null;
  const raw = readFileSync(path, "utf8");
  // JSON.parse only — never a subprocess (§3.4 rule 1) — and lets a parse failure (rule 2)
  // propagate as a throw rather than being conflated with "absent".
  return JSON.parse(raw);
}

/**
 * @param {string} root consumer tree root
 * @returns {object|null} null iff absent; throws on unparseable content (TSPEC §3.4 rule 2)
 */
export function readDriftState(root) {
  return readJsonArtifact(join(root, ...DRIFT_STATE_REL));
}

/**
 * @param {string} root consumer tree root
 * @returns {object|null} null iff absent; throws on unparseable content (TSPEC §3.4 rule 2)
 */
export function readSyncManifest(root) {
  return readJsonArtifact(join(root, ...SYNC_MANIFEST_REL));
}

function parseBackupName(name) {
  // §11.1: the trailing 24 bytes must match `"." stamp(16) "-" NN(2) ".bak"`.
  if (name.length <= 24) return null;
  const tail = name.slice(-24);
  const match = tail.match(/^\.(\d{8}T\d{6}Z)-(\d{2})\.bak$/);
  if (!match) return null;
  return { id: name.slice(0, name.length - 24), stamp: match[1], nn: match[2] };
}

/**
 * @param {string} root consumer tree root
 * @returns {{id:string, stamp:string, nn:string, name:string, bytes:number}[]}
 */
export function listBackups(root) {
  const dir = join(root, ...BACKUPS_DIR_REL);
  if (!existsSync(dir)) return [];
  const entries = [];
  for (const name of readdirSync(dir)) {
    const parsed = parseBackupName(name);
    if (!parsed) continue; // not backup-filename-shaped; a listing, not a validator
    const bytes = statSync(join(dir, name)).size;
    entries.push({ ...parsed, name, bytes });
  }
  return entries;
}

/**
 * @param {string} path
 * @returns {bigint|null} statSync(path, {bigint:true}).ino — never a lossy Number (§3.4 rule 3)
 */
export function inodeOf(path) {
  if (!existsSync(path)) return null;
  return statSync(path, { bigint: true }).ino;
}

/**
 * @param {string} root
 * @param {string} rel path relative to root, as recorded in the git index
 * @returns {"100644"|"100755"}
 */
export function indexMode(root, rel) {
  const out = execFileSync("git", ["ls-files", "-s", "--", rel], {
    cwd: root,
    encoding: "utf8",
  });
  const firstLine = out.split("\n").find((line) => line.length > 0) || "";
  const mode = firstLine.split(/\s+/)[0];
  if (mode !== "100644" && mode !== "100755") {
    throw new Error(
      `driftHarness.indexMode: unexpected or missing git index mode "${mode}" for "${rel}"`
    );
  }
  return mode;
}

// ───────────────────────────── §11.2 the batched grammar driver ─────────────────────────────

function parseGrammarLine(line) {
  const [tag, ...fields] = line.split("\t");
  return { ok: tag === "ok", fields };
}

/**
 * One spawn per property run, not per case (TSPEC §11.2). Asserts strict line-count
 * equality between `cases` and the driver's output lines before zipping them together —
 * a driver that dies halfway must fail the harness, never silently report a truncated
 * property run as green.
 *
 * @param {string[]} cases one `format`/`parse` case per element, TAB-delimited per §11.1
 * @param {{_spawnSync?: Function, env?: object, cwd?: string}} [opts] `_spawnSync` is the
 *   DI seam (defaults to the real `spawnSync` against `bin/backup-grammar.sh`) — the
 *   harness's own line-count check is exercised against an injected fake (this repo's DI
 *   convention: constructor/parameter seams, not module mocks); driver-specific behavior
 *   (clause d) is exercised against the real script.
 * @returns {{ok:boolean, fields:string[]}[]}
 */
export function runGrammar(cases, opts = {}) {
  const spawnFn = opts._spawnSync || spawnSync;
  const input = cases.length ? cases.join("\n") + "\n" : "";

  const spawnOpts = { input, encoding: "utf8" };
  if (opts.env) spawnOpts.env = opts.env;
  if (opts.cwd) spawnOpts.cwd = opts.cwd;

  const result = spawnFn("bash", [BACKUP_GRAMMAR_SCRIPT], spawnOpts);
  const stdout = result.stdout || "";
  const outLines = stdout.length ? stdout.split("\n").filter((line) => line.length > 0) : [];

  if (outLines.length < cases.length) {
    throw new Error(
      `driftHarness.runGrammar: driver emitted ${outLines.length} result line(s) for ` +
        `${cases.length} input case(s) — treating this as a harness failure rather than a ` +
        `silently truncated property run (TSPEC §11.2)`
    );
  }

  return cases.map((_case, i) => parseGrammarLine(outLines[i]));
}

// ───────────────────────────── T-08b appends here (batch 4) ─────────────────────────────
//
// The message layer: the `MESSAGES` matcher table (TSPEC §7.2) and its accessors
// (`remediationOf`, `allOf`, `countOf`, `distinct`, `expectRemediationClass`,
// `expectFailOpen`, `expectHookSilent`) are added as additional named exports below this
// marker. Nothing above it needs to change — `RunResult.notices`/`.warnings` are already
// arrays; T-08b only needs to replace `splitStderrLines`'s heuristic with real matching.
