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
  "mkdir",
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
 * `RunResult.trace` is a `TraceRecord[]` (TSPEC §3.1's `RunResult` shape: `trace, //
 * TraceRecord[] — §4.1, [] when trace:false`), so this parses through `driftOrdering.js`'s
 * `parseTrace`, the parser of record for the §4.1 grammar. Returns `[]` when the file was
 * never created — §4.4's blocked-trace fixture asserts the empty trace and the direct
 * `parseTrace(tracePath)` throw itself, and `RunResult.trace` must stay an array so a run
 * that legitimately traced nothing is not conflated with a harness crash.
 */
function readTraceIfPresent(tracePath) {
  if (!tracePath || !existsSync(tracePath)) return [];
  return requireOrdering("runScript").parseTrace(tracePath);
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
// `expectFailOpen`, `expectHookSilent`, `expectRepoRootUnresolved`) are added as additional
// named exports below this marker.
//
// Deliberately NOT touched (per this task's explicit scope — append-only, do not rewrite
// T-08a's landed code): `splitStderrLines`'s N-/W- heuristic above this marker. The
// accessors below (`countOf`/`remediationOf`/`allOf`) read `run.stderr` directly against the
// real `MESSAGES` table, so they do not depend on `RunResult.notices`/`.warnings` at all —
// only `expectHookSilent`'s conjunct 4 (both arrays `[]`) reads those fields, and it does so
// as a redundant check of already-strict-empty stderr/stdout, so the heuristic's imprecision
// cannot make that conjunct pass when it should fail. The one residual this defers: a test
// that wants a *real* MESSAGES-table split into `.notices`/`.warnings` (rather than calling
// `countOf`/`allOf` directly) does not get one from this slice — that would require editing
// `splitStderrLines`, which is out of this task's scope.

// ───────────────────────────── §7.2 message matchers ─────────────────────────────

/**
 * @type {Record<string, RegExp>}
 * Verbatim from TSPEC §7.2. Every remediation-bearing matcher captures its remediation text
 * to end of line (`remediation`/`cmd` groups, PM F-02) — this is the only sanctioned route to
 * stderr; no test greps stderr with an ad-hoc regex.
 */
export const MESSAGES = {
  "W-1": /^pdlc: workflow drift check could not run — (?<reason>[a-z-]+)\. (?<remediation>.*)$/m,
  "W-2": /^pdlc: (?<id>\S+) could not be verified — (?<reason>[a-z-]+)\. (?<remediation>.*)$/m,
  "W-3": /^pdlc: (?<id>\S+) differs from the plugin's copy .*\(--force required\): (?<cmd>.*)$/m,
  "W-4": /^pdlc: (?<id>\S+) was edited locally after its last sync\. .*backing it up to (?<backupDir>\S+): (?<cmd>.*)$/m,
  "W-5": /^pdlc: (?<id>\S+) is (?<state>stale|missing)\. Run: (?<cmd>.*)$/m,
  "W-6": /^pdlc: retired-present — (?<path>\S+) is superseded by (?<id>\S+) \((?<state>[a-z-]+)\)\. (?<remediation>.*)$/m,
  "W-7": /^pdlc: could not write (?<path>.+) \((?<operation>[a-z-]+)\)$/m,
  "N-3": /^pdlc: drift state is not writable at (?<path>.+);/m,
  "N-4": /^pdlc: sync manifest at (?<path>.+) is (?<kind>unreadable|malformed);/m,
  "N-5": /^pdlc: (?<path>.+) could not be read for distribution\.checkEnabled;/m,
  "N-6": /^pdlc: could not list (?<dir>.+);/m,
  "N-7": /^pdlc: unrecognised PDLC_FAULT token "(?<token>[^"]*)";/m,
  "N-8": /^pdlc: no write target — the consumer repo root did not resolve,/m,
};

function messagesRegex(id, callerName) {
  const regex = MESSAGES[id];
  if (!regex) {
    throw new Error(`driftHarness.${callerName}: unknown MESSAGES id "${id}"`);
  }
  return regex;
}

/** Clones a MESSAGES pattern with a `g` flag added, so multiple occurrences can be found —
 * the table's own patterns carry only `m` (TSPEC §7.2), since a single-match search is the
 * common case and a shared global-flagged RegExp would carry mutable `lastIndex` state across
 * calls. */
function withGlobalFlag(regex) {
  return new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g");
}

/** @returns {number} the number of times `id`'s pattern matches `stderr` (§5.4 conjunct 1). */
export function countOf(stderr, id) {
  const matches = stderr.match(withGlobalFlag(messagesRegex(id, "countOf")));
  return matches ? matches.length : 0;
}

/**
 * The `remediation` (or `cmd`, where the shape is a bare command) capture of `id`'s first
 * match on `stderr`, trimmed (§7.2).
 * @returns {string}
 */
export function remediationOf(stderr, id) {
  const match = withGlobalFlag(messagesRegex(id, "remediationOf")).exec(stderr);
  if (!match) {
    throw new Error(`driftHarness.remediationOf: no "${id}" line found on stderr`);
  }
  const text = match.groups && (match.groups.remediation ?? match.groups.cmd);
  if (text === undefined) {
    throw new Error(`driftHarness.remediationOf: "${id}" has no "remediation" or "cmd" capture group`);
  }
  return text.trim();
}

/** Every occurrence of `id` on `stderr` (§7.2) — for per-row warnings that may repeat. */
export function allOf(stderr, id) {
  return [...stderr.matchAll(withGlobalFlag(messagesRegex(id, "allOf")))];
}

/**
 * `distinct(a, b) ≡ a != b AND a is not a substring of b AND b is not a substring of a`
 * (FSPEC §8, the pairwise predicate AT-30 applies over sets S1/S2/S3).
 * @returns {boolean}
 */
export function distinct(a, b) {
  return a !== b && !b.includes(a) && !a.includes(b);
}

// ───────────────────────────── §7.4 remediation classes ─────────────────────────────

/**
 * Sentinel for "the run's expected expanded sync invocation" (TSPEC §7.4): a per-fixture
 * value computed by the caller from `pluginRoot`, never a hard-coded literal here — a literal
 * could not vary per fixture and a substring like `"sync"` would let "resyncing" satisfy it.
 * Callers thread the real value through `expectRemediationClass`'s `extraConjuncts.syncCmd`.
 */
const SYNC_CMD = Symbol("driftHarness.SYNC_CMD — resolved per-call via extraConjuncts.syncCmd");

/** TSPEC §7.4, verbatim shape (permissions' positive stem: TE L-02). */
export const CLASSES = {
  sync: { mustName: [SYNC_CMD], mustNotName: [] },
  forceSync: { mustName: [SYNC_CMD, "--force"], mustNotName: [] },
  pluginUpdate: { mustName: ["update the plugin"], mustNotName: [SYNC_CMD, "--force"] },
  permissions: {
    mustName: [/permission|readable/i],
    mustNotName: [SYNC_CMD, "--force", "update the plugin"],
  },
  environment: { mustName: [], mustNotName: [SYNC_CMD, "--force", "update the plugin"] },
};

function matcherSatisfied(text, matcher) {
  return matcher instanceof RegExp ? matcher.test(text) : text.includes(matcher);
}

function resolveMatcher(matcher, syncCmd, className) {
  if (matcher !== SYNC_CMD) return matcher;
  if (!syncCmd) {
    throw new Error(
      `driftHarness.expectRemediationClass: class "${className}" needs the run's expanded sync ` +
        `command — pass it as extraConjuncts.syncCmd (TSPEC §7.4)`
    );
  }
  return syncCmd;
}

/**
 * @param {string} text one rendered remediation string (already trimmed, e.g. via `remediationOf`)
 * @param {"sync"|"forceSync"|"pluginUpdate"|"permissions"|"environment"} className
 * @param {{syncCmd?: string, mustName?: Array<string|RegExp>, mustNotName?: Array<string|RegExp>}} [extraConjuncts]
 */
export function expectRemediationClass(text, className, extraConjuncts = {}) {
  const cls = CLASSES[className];
  if (!cls) {
    throw new Error(`driftHarness.expectRemediationClass: unknown class "${className}"`);
  }

  // §8.1's universal conventions, asserted for every class.
  //
  // The `pdlc: ` line prefix is deliberately NOT asserted here: this function's argument is one
  // rendered *remediation* (a capture group, per the @param above and `remediationOf`'s return),
  // which is a substring of the line and never carries the prefix. §8.1's prefix convention is
  // already enforced at match time — every `MESSAGES` matcher is anchored `^pdlc: `.
  if (/\b(rm|delete)\b/i.test(text)) {
    throw new Error(
      `driftHarness.expectRemediationClass: text must never recommend manual deletion ` +
        `(AC-2.8's absolute rule): ${JSON.stringify(text)}`
    );
  }

  const syncCmd = extraConjuncts.syncCmd;

  for (const raw of cls.mustName) {
    const matcher = resolveMatcher(raw, syncCmd, className);
    if (!matcherSatisfied(text, matcher)) {
      throw new Error(
        `driftHarness.expectRemediationClass: class "${className}" requires text to name ${matcher} ` +
          `— not found in ${JSON.stringify(text)}`
      );
    }
  }
  for (const raw of cls.mustNotName) {
    const matcher = resolveMatcher(raw, syncCmd, className);
    if (matcherSatisfied(text, matcher)) {
      throw new Error(
        `driftHarness.expectRemediationClass: class "${className}" forbids text from naming ${matcher} ` +
          `— found in ${JSON.stringify(text)}`
      );
    }
  }

  for (const matcher of extraConjuncts.mustName || []) {
    if (!matcherSatisfied(text, matcher)) {
      throw new Error(
        `driftHarness.expectRemediationClass: extra conjunct requires text to name ${matcher} ` +
          `— not found in ${JSON.stringify(text)}`
      );
    }
  }
  for (const matcher of extraConjuncts.mustNotName || []) {
    if (matcherSatisfied(text, matcher)) {
      throw new Error(
        `driftHarness.expectRemediationClass: extra conjunct forbids text from naming ${matcher} ` +
          `— found in ${JSON.stringify(text)}`
      );
    }
  }
}

// ───────────── forward reference to driftOrdering.js (T-16, batch-4 sibling) ─────────────
//
// `expectFailOpen`'s conjunct 5 and `expectRepoRootUnresolved`'s conjunct 3 need
// `parseTrace`/`assertTreeUnchanged`. T-16 lands in this same batch but is a different
// single-writer file; a static `import` here would fail this WHOLE module's load (and every
// OTHER consumer of `driftHarness.js`, e.g. `readDriftState`/`runGrammar`) the instant
// `driftOrdering.js` is absent. This resolves it once, defensively, at module-evaluation
// time instead, so the functions above that do not need it are never affected.
let _ordering = null;
if (existsSync(resolve(__dirname, "driftOrdering.js"))) {
  _ordering = await import("./driftOrdering.js");
}

function requireOrdering(callerName) {
  if (!_ordering) {
    throw new Error(
      `driftHarness.${callerName}: driftOrdering.js (T-16) has not landed yet in this working tree`
    );
  }
  return _ordering;
}

/**
 * Root resolution shared by the three assertion helpers below. TSPEC's own signatures are
 * inconsistent about where `root` lives (`expectRepoRootUnresolved` takes it explicitly;
 * `expectHookSilent`/`expectFailOpen` do not) — this resolves it defensively from whichever
 * the caller supplied: an explicit `opts.root`, or `run.root`/`run.consumerRoot` attached to
 * the run object by the fixture that built it.
 */
function resolveRoot(run, opts) {
  const root = (opts && opts.root) || run.root || run.consumerRoot;
  if (!root) {
    throw new Error(
      "driftHarness: root is required — pass opts.root, or attach it as run.root/run.consumerRoot " +
        "before calling this assertion"
    );
  }
  return root;
}

// ───────────────────────────── §1.4a expectHookSilent ─────────────────────────────

/**
 * The five conjuncts of TSPEC §1.4a (AC-2.2, PM F-01). Conjunct 5 (incl. `generatedBy`,
 * TE L-06) is what makes silence mean *verified* rather than *skipped* — a hook that does
 * nothing at all also has empty stderr.
 * @param {object} run a RunResult (§3.1) with `root`/`consumerRoot` attached by the caller
 */
export function expectHookSilent(run) {
  // Conjunct 1 — strict empty-string equality, never `not.toContain("pdlc:")`.
  if (run.stderr !== "") {
    throw new Error(`driftHarness.expectHookSilent: expected stderr === "", got ${JSON.stringify(run.stderr)}`);
  }
  // Conjunct 2.
  if (run.stdout !== "") {
    throw new Error(`driftHarness.expectHookSilent: expected stdout === "", got ${JSON.stringify(run.stdout)}`);
  }
  // Conjunct 3.
  if (run.status !== 0) {
    throw new Error(`driftHarness.expectHookSilent: expected status 0, got ${run.status}`);
  }
  // Conjunct 4 — the redundant form of conjunct 1, stated so a future matcher addition
  // cannot make conjunct 1 pass by parsing less.
  if ((run.notices && run.notices.length) !== 0 || (run.warnings && run.warnings.length) !== 0) {
    throw new Error("driftHarness.expectHookSilent: expected both notices and warnings to be []");
  }

  // Conjunct 5 — the anti-vacuity check: the run did work.
  const root = resolveRoot(run, undefined);
  const state = readDriftState(root);
  if (!state) {
    throw new Error(
      "driftHarness.expectHookSilent: expected a drift-state record to exist (conjunct 5 — the run did work)"
    );
  }
  if (state.baselineStatus !== "resolved") {
    throw new Error(
      `driftHarness.expectHookSilent: expected baselineStatus "resolved", got ${JSON.stringify(state.baselineStatus)}`
    );
  }
  if (!Array.isArray(state.rows) || state.rows.length === 0) {
    throw new Error("driftHarness.expectHookSilent: expected rows to be non-empty");
  }
  if (!state.rows.every((row) => row.state === "in-sync")) {
    throw new Error('driftHarness.expectHookSilent: expected every row\'s state to be "in-sync"');
  }
  if (!Array.isArray(state.retiredPresent) || state.retiredPresent.length !== 0) {
    throw new Error("driftHarness.expectHookSilent: expected retiredPresent to be []");
  }
  if (!Array.isArray(state.writeFailures) || state.writeFailures.length !== 0) {
    throw new Error("driftHarness.expectHookSilent: expected writeFailures to be []");
  }
  if (state.generatedBy !== "hook") {
    throw new Error(
      `driftHarness.expectHookSilent: expected record.generatedBy === "hook" (TE L-06 — closes the ` +
        `vacuous-pass path where a hook that does nothing at all satisfies conjuncts 1-4 against a ` +
        `pre-existing green record), got ${JSON.stringify(state.generatedBy)}`
    );
  }
}

// ───────────────────────────── §6.3 expectFailOpen ─────────────────────────────

// FSPEC §4.5's closed nine-member `operation` set, split by recordability (TSPEC §6.1).
const STDERR_ONLY_OPERATIONS = new Set([
  "mkdir",
  "drift-state-replace",
  "drift-state-invalidate",
  "drift-state-unlink",
]);
const RECORDABLE_OPERATIONS = new Set([
  "artifact-copy",
  "backup",
  "backup-verify",
  "retire-delete",
  "sync-manifest-update",
]);

/**
 * @param {object} run a RunResult with `root`/`consumerRoot` attached by the caller
 * @param {{path?: string, operation: string, entrypoint: "hook"|"check"|"sync"|"sync-force", remainingRows?: string[], root?: string, otherFaults?: {path: string, operation: string}[]}} opts
 *   `otherFaults` names any *other* simultaneously-injected fault(s) this call must tolerate in
 *   `writeFailures` — for a fixture that injects more than one fault in the same run and calls
 *   `expectFailOpen` once per fault, each call names the other call's {path, operation} here so
 *   "no unexpected write failures" still means exactly that, rather than "any extra entry is fine".
 */
export function expectFailOpen(run, opts = {}) {
  const { path, operation, entrypoint, remainingRows = [], otherFaults = [] } = opts;
  const root = resolveRoot(run, opts);

  if (!STDERR_ONLY_OPERATIONS.has(operation) && !RECORDABLE_OPERATIONS.has(operation)) {
    throw new Error(`driftHarness.expectFailOpen: unknown operation "${operation}" (TSPEC §6.1)`);
  }

  if (entrypoint === "check" && RECORDABLE_OPERATIONS.has(operation)) {
    // §6.3's per-surface table: `--check` makes no artifact writes at all, so only
    // mkdir/drift-state operations are reachable — asserting a recordable one here is a
    // fixture bug, and `expectFailOpen` throws on it rather than silently checking nothing.
    throw new Error(
      `driftHarness.expectFailOpen: "--check" cannot reach recordable operation "${operation}" ` +
        `(TSPEC §6.3) — this is a fixture bug, not a subject bug`
    );
  }

  if (STDERR_ONLY_OPERATIONS.has(operation)) {
    // The drift-state (stderr-only) table.
    const state = readDriftState(root);
    const writeFailures = (state && state.writeFailures) || [];
    if (writeFailures.some((f) => f.operation === operation)) {
      throw new Error(
        `driftHarness.expectFailOpen: stderr-only operation "${operation}" must never appear in ` +
          `writeFailures (TSPEC §6.3)`
      );
    }
    const w7 = allOf(run.stderr, "W-7").filter(
      (m) => m.groups.operation === operation && (path === undefined || m.groups.path === path)
    );
    if (w7.length < 1) {
      throw new Error(
        `driftHarness.expectFailOpen: expected a W-7 line naming operation "${operation}"` +
          (path !== undefined ? ` and path "${path}"` : "") +
          " on stderr"
      );
    }
    return;
  }

  // The per-row (recordable) table.
  const expectedStatus = entrypoint === "hook" ? 0 : 4;
  if (run.status !== expectedStatus) {
    throw new Error(
      `driftHarness.expectFailOpen: expected status ${expectedStatus} for entrypoint "${entrypoint}" ` +
        `(AC-2.4 is absolute), got ${run.status}`
    );
  }

  const state = readDriftState(root);
  if (!state) {
    throw new Error("driftHarness.expectFailOpen: expected a drift-state record to exist");
  }
  const writeFailures = state.writeFailures || [];
  const matching = writeFailures.filter((f) => f.path === path && f.operation === operation);
  if (matching.length !== 1) {
    throw new Error(
      `driftHarness.expectFailOpen: expected exactly one writeFailures entry ` +
        `{path: ${JSON.stringify(path)}, operation: ${JSON.stringify(operation)}}, found ${matching.length}`
    );
  }
  const expected = [{ path, operation }, ...otherFaults];
  const others = writeFailures.filter(
    (f) => !expected.some((e) => e.path === f.path && e.operation === f.operation)
  );
  if (others.length !== 0) {
    throw new Error(
      `driftHarness.expectFailOpen: writeFailures must contain nothing beyond this call's fault ` +
        `and any declared \`otherFaults\`, found unexpected entries ${JSON.stringify(others)}`
    );
  }

  const w7Count = allOf(run.stderr, "W-7").filter(
    (m) => m.groups.path === path && m.groups.operation === operation
  ).length;
  if (w7Count !== 1) {
    throw new Error(
      `driftHarness.expectFailOpen: expected exactly one W-7 line naming path ${JSON.stringify(path)} ` +
        `and operation ${JSON.stringify(operation)}, found ${w7Count}`
    );
  }

  // Conjunct 4 — the loop continued: every remaining row has a post-run state in the record.
  const rows = state.rows || [];
  for (const rowId of remainingRows) {
    const row = rows.find((r) => r.id === rowId);
    if (!row) {
      throw new Error(
        `driftHarness.expectFailOpen: remainingRows entry "${rowId}" has no row in the record ` +
          `— the loop did not continue past the fault`
      );
    }
  }

  // Conjunct 5 — the ordering-level form of conjunct 4, over the trace.
  if (remainingRows.length && run.tracePath) {
    const ordering = requireOrdering("expectFailOpen");
    const trace = ordering.parseTrace(run.tracePath);
    // FSPEC §4.2's step ordering: sync's post-run pass (step 7) classifies every managed row,
    // including ones the write-failure loop never touched — so a row that survives the fault
    // untouched but was already `in-sync` is only traced via "classify", not copy/backup/delete.
    // The conjunct means "the loop continued past the failing row", and "classify" is legitimate
    // evidence of that for an untouched row, same as the other three ops are for a touched one.
    const relevantOps = new Set(["copy", "backup", "delete", "classify"]);
    for (const rowId of remainingRows) {
      const hasRecord = trace.some((rec) => rec.rowId === rowId && relevantOps.has(rec.op));
      if (!hasRecord) {
        throw new Error(
          `driftHarness.expectFailOpen: expected a copy/backup/delete/classify trace record for ` +
            `remaining row "${rowId}" (TSPEC §6.3 conjunct 5)`
        );
      }
    }
  }
}

// ───────────────────────────── §8.3 expectRepoRootUnresolved ─────────────────────────────

/**
 * @param {object} run a RunResult with `root`/`consumerRoot` attached by the caller, or `root`
 *   supplied through `opts`
 * @param {{root?: string, snapshotBefore?: unknown, reportedReason: string}} opts
 */
export function expectRepoRootUnresolved(run, opts = {}) {
  const { snapshotBefore, reportedReason } = opts;
  const root = resolveRoot(run, opts);

  // Conjunct 1.
  const w1 = allOf(run.stderr, "W-1").filter((m) => m.groups.reason === reportedReason);
  if (w1.length < 1) {
    throw new Error(
      `driftHarness.expectRepoRootUnresolved: expected W-1 with reason "${reportedReason}" on stderr`
    );
  }

  // Conjunct 2 — exit 3 on check/sync, 0 on hook, never 4.
  const expectedStatus = run.generatedBy === "hook" ? 0 : 3;
  if (run.status !== expectedStatus) {
    throw new Error(
      `driftHarness.expectRepoRootUnresolved: expected status ${expectedStatus}, got ${run.status}`
    );
  }

  // Conjunct 3 — the positive form of "nothing created".
  if (snapshotBefore !== undefined) {
    const ordering = requireOrdering("expectRepoRootUnresolved");
    ordering.assertTreeUnchanged(root, snapshotBefore);
  }

  // Conjunct 4 — the specific negatives.
  if (readDriftState(root) !== null) {
    throw new Error("driftHarness.expectRepoRootUnresolved: expected no drift state to have been written");
  }
  if (readSyncManifest(root) !== null) {
    throw new Error("driftHarness.expectRepoRootUnresolved: expected no sync manifest to have been written");
  }
  if (existsSync(join(root, ...BACKUPS_DIR_REL))) {
    throw new Error("driftHarness.expectRepoRootUnresolved: expected no .pdlc-backups/ directory to exist");
  }

  // Conjunct 5 — N-8 present iff reportedReason !== "repo-root-unresolved", both directions.
  const n8Count = countOf(run.stderr, "N-8");
  const shouldHaveN8 = reportedReason !== "repo-root-unresolved";
  if (shouldHaveN8 && n8Count < 1) {
    throw new Error(
      'driftHarness.expectRepoRootUnresolved: expected N-8 on stderr when reportedReason !== "repo-root-unresolved"'
    );
  }
  if (!shouldHaveN8 && n8Count > 0) {
    throw new Error(
      'driftHarness.expectRepoRootUnresolved: N-8 must be absent when reportedReason === "repo-root-unresolved"'
    );
  }
}
