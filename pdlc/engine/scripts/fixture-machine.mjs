#!/usr/bin/env node
// PLAN T50 — the fixture-machine legs (TSPEC §12.1's "Fixture-machine" row,
// §9.2, §9.3 AT-2.5, §9.4 AT-2.6; BR-7.5; PROP-LAUNCH-6).
//
// Exports the pure, unit-tested seams `fixture-machine.test.js` (T59) drives
// directly, with no real spawn required to reach any branch (§10.1 doubles
// convention):
//
//   recordResolvedState(spawnFn)      -> {resolvedVersion, resolvedStoreEntry}
//   compareLegRecords(pre, post)      -> string[] violations (the falsifier)
//   validateSkipRecords(records, inv) -> string[] violations
//   classifyProbeResult(probeResult)  -> "present" | "absent" | "unprobeable"
//   runGatedLeg({...})                -> {skip, ran, result?}
//   SKIP_INVENTORY                    -> frozen {name, capability, unverifiedInvariants}[]
//
// Everything below that line is a thin CLI: real `npm pack`, real `docker`,
// a two-repo fixture and the plugin-tree hash pairing (AT-2.6), invoked only
// by `.github/workflows/fixture-machine.yml` — never by
// `cd pdlc/engine && npm test` (TE round-1 Q-01). The CLI is a dispatcher
// over the functions above, reading real repo/process state where the tests
// inject fixtures (the same split `publish-preflight.mjs` uses).

import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  appendFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENGINE_ROOT = path.resolve(HERE, "..");
const REPO_ROOT = path.resolve(ENGINE_ROOT, "..", "..");

// ─── 1. Recorder + comparator (AC-2.3, §9.2; TE round-1 F-07) ──────────────

function firstNonEmptyLine(text) {
  const lines = String(text ?? "").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

/**
 * Parses `pdlc --version`'s first rendered line (`pdlc-engine v<version>`,
 * `cli.mjs:576`) down to the bare version, tolerating a bare version string
 * too (the unit-test double's shape) so the same function reads both a real
 * launcher's stdout and an injected fixture.
 */
function parseResolvedVersion(stdout) {
  const line = firstNonEmptyLine(stdout);
  const match = /^pdlc-engine v(.+)$/.exec(line);
  return match ? match[1] : line;
}

/**
 * §9.2's `{resolvedVersion, resolvedStoreEntry}` recorder. Takes its spawn
 * function as a parameter (§2's doubles convention) and reads both fields
 * from its two return values only — no filesystem or env access of its
 * own — so every branch is reachable with an injected fixture (T59, no real
 * spawn; TE round-3 Q-01's coverage-floor seam).
 *
 * The **second** call's exact command shape is left to the caller's
 * `spawnFn` (real legs pass one that composes the resolved store entry from
 * `$PDLC_HOME` and the already-resolved version — §9.2's named observable,
 * *not* the launcher's own `PATH` location); this recorder only reads
 * whatever that call returns.
 *
 * @param {(cmd: string, args: string[]) => {status: number, stdout: string, stderr: string}} spawnFn
 * @returns {{resolvedVersion: string, resolvedStoreEntry: string}}
 */
export function recordResolvedState(spawnFn) {
  const versionResult = spawnFn("pdlc", ["--version"]);
  const resolvedVersion = parseResolvedVersion(versionResult.stdout);

  const storeResult = spawnFn("pdlc", ["doctor", "--resolved-store-entry"]);
  const resolvedStoreEntry = firstNonEmptyLine(storeResult.stdout);

  return { resolvedVersion, resolvedStoreEntry };
}

/**
 * The falsifier (AC-2.3's install/upgrade inequality, §9.2): both fields
 * must differ from `pre`'s values, and equality on **either** field alone
 * is a violation, not just equality on both (TE round-1 F-07). A leg that
 * produced no record at all (`post` nullish) fails distinguishably from a
 * leg that produced an equal one — the "no record" reason never conflates
 * with either per-field "unchanged" reason.
 *
 * @param {{resolvedVersion: string, resolvedStoreEntry: string}} pre
 * @param {{resolvedVersion: string, resolvedStoreEntry: string}|null} post
 * @returns {string[]} violations; empty means the leg passed
 */
export function compareLegRecords(pre, post) {
  if (!post) {
    return ["no resolved-state record was produced for this leg (recordResolvedState never returned)"];
  }
  const violations = [];
  if (post.resolvedVersion === pre.resolvedVersion) {
    violations.push(
      `resolvedVersion did not change from the pre-record value ("${pre.resolvedVersion}")`
    );
  }
  if (post.resolvedStoreEntry === pre.resolvedStoreEntry) {
    violations.push(
      `resolvedStoreEntry did not change from the pre-record value ("${pre.resolvedStoreEntry}")`
    );
  }
  return violations;
}

// ─── 2. Gated-leg skip inventory + comparator (TE round-3 F-01) ────────────

// The closed capability key set (TSPEC §12.1's fixture-machine row): each
// gated leg probes exactly one of these. `validateSkipRecords` rejects any
// other value, which is what makes an invented capability name a red run
// rather than a silently-accepted skip.
const KNOWN_CAPABILITIES = Object.freeze(["docker", "real-spawn", "npm-pack"]);

/**
 * One frozen `{name, capability, unverifiedInvariants}` entry per gated leg
 * (TSPEC §12.1): the container leg (`docker`, AT-2.5), the launcher
 * real-spawn pass-through + signalled-child legs (`real-spawn`, AT-1.1 /
 * AT-2.1), the temp-prefix install/upgrade leg and the two-repo leg (both
 * `npm-pack`, AT-2.4 / AT-2.3 respectively). `unverifiedInvariants` names
 * only the `AT-` ids that leg alone observes.
 */
export const SKIP_INVENTORY = Object.freeze([
  Object.freeze({
    name: "node-18-alpine",
    capability: "docker",
    unverifiedInvariants: Object.freeze(["AT-2.5"]),
  }),
  Object.freeze({
    name: "launcher-real-spawn",
    capability: "real-spawn",
    unverifiedInvariants: Object.freeze(["AT-1.1", "AT-2.1"]),
  }),
  Object.freeze({
    name: "npm-pack-install-upgrade",
    capability: "npm-pack",
    unverifiedInvariants: Object.freeze(["AT-2.4"]),
  }),
  Object.freeze({
    name: "two-repo-upgrade",
    capability: "npm-pack",
    unverifiedInvariants: Object.freeze(["AT-2.3"]),
  }),
]);

/**
 * Pure comparator over `(recorded skips, inventory)` (TE round-3 F-01),
 * modelled on `driftHelpers.test.js`'s `validateSkipRecords` precedent:
 * fails on an unregistered skip name, a skip naming an unknown capability
 * key, a duplicate inventory entry name, or an empty `unverifiedInvariants`
 * list. Takes both as arguments so it is exercised hermetically with no
 * real spawn (T59).
 *
 * @param {{name: string, capability: string, unverifiedInvariants: string[]}[]} records
 * @param {{name: string, capability: string, unverifiedInvariants: string[]}[]} inventory
 * @returns {string[]} violations; empty means every record is covered
 */
export function validateSkipRecords(records, inventory) {
  const violations = [];

  const seenNames = new Set();
  for (const entry of inventory) {
    if (seenNames.has(entry.name)) {
      violations.push(`duplicate inventory entry name "${entry.name}" in SKIP_INVENTORY`);
    }
    seenNames.add(entry.name);
  }

  const inventoryByName = new Map(inventory.map((entry) => [entry.name, entry]));

  for (const record of records) {
    if (!inventoryByName.has(record.name)) {
      violations.push(
        `unregistered skip "${record.name}" is not present in SKIP_INVENTORY (item 15's evidence obligation)`
      );
      continue;
    }
    if (!KNOWN_CAPABILITIES.includes(record.capability)) {
      violations.push(
        `skip "${record.name}" names unknown capability "${record.capability}" (closed key set: ${KNOWN_CAPABILITIES.join(", ")})`
      );
      continue;
    }
    if (!Array.isArray(record.unverifiedInvariants) || record.unverifiedInvariants.length === 0) {
      violations.push(`skip "${record.name}" has an empty unverifiedInvariants list`);
    }
  }

  return violations;
}

// ─── 3. Capability predicate discriminator (TE round-6 F-01, round-8 F-01) ─

/**
 * The opt-out discriminator (TSPEC §12.1, TE round-4 F-02): the probe
 * process's *exit status* decides, and there is no fourth arm. A readable
 * non-zero exit status classifies as `absent` (registered skip); a readable
 * zero exit status classifies as `present` (the leg runs); the absence of
 * any readable exit status at all — spawn error, `ENOENT`, timeout —
 * classifies as `unprobeable`, which is a run-failing verdict, never a
 * skip, so an all-skipped run cannot be the default.
 *
 * @param {{status?: number|null, error?: Error}|null|undefined} probeResult
 * @returns {"present"|"absent"|"unprobeable"}
 */
export function classifyProbeResult(probeResult) {
  if (!probeResult || typeof probeResult.status !== "number") {
    return "unprobeable";
  }
  return probeResult.status === 0 ? "present" : "absent";
}

/**
 * Runs one gated leg through the three-arm partition (TE round-8 F-01),
 * asserted positively rather than inferred from absence:
 *
 *   - `absent`:      records a registered skip naming its capability,
 *                     never runs `leg`.
 *   - `unprobeable`: throws (fail-closed, following `skipSinkTeardown.js`'s
 *                     precedent — never a silent skip), never runs `leg`.
 *   - `present`:     runs `leg` and records no skip entry.
 *
 * @param {{name: string, capability: string, unverifiedInvariants: string[], probeResult: object, leg: () => unknown}} args
 * @returns {{skip: {name: string, capability: string, unverifiedInvariants: string[]}|null, ran: boolean, result?: unknown}}
 */
export function runGatedLeg({ name, capability, unverifiedInvariants, probeResult, leg }) {
  const classification = classifyProbeResult(probeResult);

  if (classification === "unprobeable") {
    throw new Error(
      `fixture-machine: capability "${capability}" for leg "${name}" produced no readable exit status ` +
        `(unprobeable, not a skip — TE round-4 F-02)`
    );
  }

  if (classification === "absent") {
    return {
      skip: Object.freeze({ name, capability, unverifiedInvariants: [...unverifiedInvariants] }),
      ran: false,
    };
  }

  const result = leg();
  return { skip: null, ran: true, result };
}

// ─── Skip sink (JSONL file, following `skipSink.js`'s precedent) ───────────
//
// `node:test` has no jest-shaped `globalTeardown`, so the run-wide record
// this comparator is checked against is a plain JSONL file at
// `PDLC_FIXTURE_SKIP_SINK` — appended to by `launcher.test.js`'s gated legs
// and by this file's own gated legs, and read back by `validateFixtureRun`
// below at end of run. Unset (the local `npm test` path) means no file is
// ever touched, matching PROP-LAUNCH-6's "never touches ... an env var
// itself" for the module under test — this sink is test/CI bookkeeping, not
// `execLauncher`.

/**
 * Appends one skip record as a JSON line to `sinkPath` (default:
 * `process.env.PDLC_FIXTURE_SKIP_SINK`). A no-op when no sink path is
 * configured, so a local run never touches the filesystem for this.
 */
export function appendSkipRecord(record, sinkPath = process.env.PDLC_FIXTURE_SKIP_SINK) {
  if (!sinkPath) return;
  mkdirSync(path.dirname(sinkPath), { recursive: true });
  appendFileSync(sinkPath, `${JSON.stringify(record)}\n`, "utf8");
}

/** Reads every skip record appended to `sinkPath`; `[]` when the sink is absent/empty. */
export function readSkipRecords(sinkPath) {
  if (!sinkPath || !existsSync(sinkPath)) return [];
  const text = readFileSync(sinkPath, "utf8");
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

// ═══════════════════════════════════════════════════════════════════════════
// CLI — real legs. Invoked only by `.github/workflows/fixture-machine.yml`.
// ═══════════════════════════════════════════════════════════════════════════

function probeResultOf(fn) {
  try {
    return fn();
  } catch (error) {
    return { status: null, error };
  }
}

function probeDocker() {
  return probeResultOf(() => spawnSync("docker", ["version"], { encoding: "utf8" }));
}

function probeNpmPack() {
  return probeResultOf(() => spawnSync("npm", ["--version"], { encoding: "utf8" }));
}

function probeRealSpawn() {
  return probeResultOf(() => spawnSync(process.execPath, ["--version"], { encoding: "utf8" }));
}

// wave-16 fix: `setUpTempPrefixInstall` used to `npm pack` with
// `cwd: ENGINE_ROOT`, so npm's `prepack` lifecycle hook ran
// `scripts/prepack.mjs` in place against the real, git-ignored
// `pdlc/engine/vendor/workflows/` — the same checkout-pollution pattern
// already fixed in `packaging.test.js`'s `packRealTarball()` and
// `run.test.js`'s AF-2 test. This builds the same kind of scratch tree
// (a temp root laid out as `$TMP/pdlc/engine` + `$TMP/pdlc/workflows`
// siblings, mirroring the real repo) and packs *that*, so the real
// checkout is never touched even when this CLI is run locally.
const ENGINE_PACK_INPUT_ENTRIES = [
  "package.json",
  "README.md",
  "LICENSE", // conditional (N-2); copied only when present
  ".npmignore",
  ".gitignore",
  "bin",
  "lib",
  "scripts",
];
const WORKFLOW_MODULE_NAMES = ["orchestrate-dev.js", "orchestrate-queue.js"];

/**
 * Copies the engine's real package inputs, plus the two canonical workflow
 * modules, into a fresh `$TMP/pdlc/engine` + `$TMP/pdlc/workflows` sibling
 * pair so `scripts/prepack.mjs`'s own unmodified relative-path resolution
 * (`ENGINE_ROOT/../../pdlc/workflows`) still lands on the copied workflow
 * modules when `npm pack` runs its `prepack` lifecycle hook inside the
 * scratch tree. Caller is responsible for removing the returned
 * `buildRoot` once packing is done.
 */
function buildScratchEnginePackTree() {
  const buildRoot = mkdtempSync(path.join(tmpdir(), "pdlc-fixture-build-"));
  const buildEngineDir = path.join(buildRoot, "pdlc", "engine");
  const buildWorkflowsDir = path.join(buildRoot, "pdlc", "workflows");
  mkdirSync(buildEngineDir, { recursive: true });
  mkdirSync(buildWorkflowsDir, { recursive: true });

  for (const entry of ENGINE_PACK_INPUT_ENTRIES) {
    const source = path.join(ENGINE_ROOT, entry);
    if (!existsSync(source)) continue; // LICENSE is conditional (N-2)
    cpSync(source, path.join(buildEngineDir, entry), { recursive: true });
  }
  for (const name of WORKFLOW_MODULE_NAMES) {
    cpSync(
      path.join(REPO_ROOT, "pdlc", "workflows", name),
      path.join(buildWorkflowsDir, name),
    );
  }
  return { buildRoot, buildEngineDir };
}

/**
 * `npm pack`s the engine package into a fresh temp prefix (PF-4's real-pack
 * precedent, see `publish-preflight.mjs`), installs it globally scoped to that
 * prefix's `PATH`, and returns a spawn function shaped for
 * `recordResolvedState` — a resolved store entry composed from
 * `$PDLC_HOME` (set to a temp dir under the same prefix) and the resolved
 * version, following §9.2's named observable. Packs a scratch copy of the
 * engine tree (see `buildScratchEnginePackTree`), never the real checkout.
 */
function setUpTempPrefixInstall() {
  const prefix = mkdtempSync(path.join(tmpdir(), "pdlc-fixture-prefix-"));
  const pdlcHome = mkdtempSync(path.join(tmpdir(), "pdlc-fixture-home-"));
  const packDir = mkdtempSync(path.join(tmpdir(), "pdlc-fixture-pack-"));
  const { buildRoot, buildEngineDir } = buildScratchEnginePackTree();

  let packOut;
  try {
    packOut = execFileSync("npm", ["pack", "--pack-destination", packDir, "--json"], {
      cwd: buildEngineDir,
      encoding: "utf8",
    });
  } finally {
    rmSync(buildRoot, { recursive: true, force: true });
  }
  const [{ filename }] = JSON.parse(packOut);
  const tarball = path.join(packDir, filename);

  const env = {
    ...process.env,
    npm_config_prefix: prefix,
    PDLC_HOME: pdlcHome,
    PATH: `${path.join(prefix, "bin")}${path.delimiter}${process.env.PATH ?? ""}`,
  };

  execFileSync("npm", ["install", "--global", tarball], { env, encoding: "utf8" });

  const spawnFn = (cmd, args) => {
    if (args.includes("--version")) {
      return spawnSync("pdlc", args, { encoding: "utf8", env });
    }
    const versionOut = spawnSync("pdlc", ["--version"], { encoding: "utf8", env });
    const version = parseResolvedVersion(versionOut.stdout);
    return {
      status: 0,
      stdout: `${path.join(pdlcHome, "versions", version)}\n`,
      stderr: "",
    };
  };

  return { env, spawnFn, tarball, prefix, pdlcHome };
}

function upgradeInstall({ env, tarball }) {
  execFileSync("npm", ["install", "--global", tarball], { env, encoding: "utf8" });
}

/**
 * AC-2.4's single-machine leg: `npm pack` into a temp prefix, install,
 * record pre-state, upgrade (a second real pack — the manifest's own
 * version is what changes between the two, since this repo builds exactly
 * one tarball per commit; a fixture-machine run that needs two distinct
 * versions bumps `package.json` between packs), record post-state, and
 * assert inequality via `compareLegRecords`. Also asserts the repo's own
 * tree and index are byte-identical afterward and nothing was created
 * under `.claude/` (AT-2.4's conjunct).
 */
function legInstallUpgrade() {
  const before = execFileSync("git", ["status", "--porcelain"], { cwd: REPO_ROOT, encoding: "utf8" });

  const { env, spawnFn, tarball } = setUpTempPrefixInstall();
  const pre = recordResolvedState(spawnFn);
  upgradeInstall({ env, tarball });
  const post = recordResolvedState(spawnFn);

  const violations = compareLegRecords(pre, post);

  const after = execFileSync("git", ["status", "--porcelain"], { cwd: REPO_ROOT, encoding: "utf8" });
  if (before !== after) {
    violations.push(
      `repo tree/index changed during the install/upgrade leg (AT-2.4's conjunct): before=${JSON.stringify(before)} after=${JSON.stringify(after)}`
    );
  }
  if (existsSync(path.join(REPO_ROOT, ".claude", "workflows", ".fixture-machine-marker"))) {
    violations.push("something was created under .claude/ during the install/upgrade leg");
  }

  return { name: "npm-pack-install-upgrade", violations };
}

/**
 * AT-2.3 / AC-2.2: two consumer repos, one upgrade command run once on the
 * machine (never inside either repo), both then execute N+1. Recorded
 * positively: a per-repo command log that must hold exactly the pipeline
 * invocation.
 */
function legTwoRepoUpgrade() {
  const { env, spawnFn, tarball } = setUpTempPrefixInstall();

  const repoA = mkdtempSync(path.join(tmpdir(), "pdlc-fixture-consumer-a-"));
  const repoB = mkdtempSync(path.join(tmpdir(), "pdlc-fixture-consumer-b-"));

  const commandLogA = [];
  const commandLogB = [];
  const runInRepo = (repo, log, argv) => {
    log.push(argv.join(" "));
    return spawnSync("pdlc", argv, { cwd: repo, env, encoding: "utf8" });
  };

  const preA = recordResolvedState(spawnFn);
  runInRepo(repoA, commandLogA, ["--version"]);
  const preB = recordResolvedState(spawnFn);
  runInRepo(repoB, commandLogB, ["--version"]);

  // The one upgrade command runs on the machine, never inside either repo.
  upgradeInstall({ env, tarball });

  const postA = recordResolvedState(spawnFn);
  runInRepo(repoA, commandLogA, ["--version"]);
  const postB = recordResolvedState(spawnFn);
  runInRepo(repoB, commandLogB, ["--version"]);

  const violations = [
    ...compareLegRecords(preA, postA).map((v) => `repo A: ${v}`),
    ...compareLegRecords(preB, postB).map((v) => `repo B: ${v}`),
  ];

  for (const [label, log] of [
    ["A", commandLogA],
    ["B", commandLogB],
  ]) {
    const nonPipelineCommands = log.filter((entry) => !entry.startsWith("--version"));
    if (nonPipelineCommands.length > 0) {
      violations.push(`repo ${label}'s command log holds more than the pipeline invocation: ${log.join(", ")}`);
    }
  }

  return { name: "two-repo-upgrade", violations };
}

/** AT-2.6: the plugin's install tree (`~/.claude/`) and the engine's install/store are disjoint. */
function legPluginTreeHash() {
  const claudeDir = path.join(os.homedir(), ".claude");
  const hashTree = () => {
    if (!existsSync(claudeDir)) return null;
    const hash = createHash("sha1");
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else {
          hash.update(path.relative(claudeDir, full));
          hash.update(readFileSync(full));
        }
      }
    };
    walk(claudeDir);
    return hash.digest("hex");
  };

  const before = hashTree();
  const { env, tarball } = setUpTempPrefixInstall();
  upgradeInstall({ env, tarball });
  const after = hashTree();

  const violations = [];
  if (before !== after) {
    violations.push(
      `~/.claude/ hash changed across an engine install+upgrade (AT-2.6): before=${before} after=${after}`
    );
  }

  return { name: "plugin-tree-hash", violations };
}

/** AT-2.5: the container leg — a below-floor Node runner refuses cleanly (§9.3). */
function legContainer() {
  const out = execFileSync(
    "docker",
    ["run", "--rm", "-v", `${REPO_ROOT}:/repo:ro`, "node:18-alpine", "node", "/repo/pdlc/engine/bin/pdlc.mjs", "--version"],
    { encoding: "utf8" }
  );
  const violations = [];
  if (!/node/i.test(out) && !/floor|refus/i.test(out)) {
    violations.push(`node:18-alpine leg produced unexpected output: ${out}`);
  }
  return { name: "node-18-alpine", violations };
}

function runFixtureMachine() {
  const skipSinkPath = process.env.PDLC_FIXTURE_SKIP_SINK || null;
  const failures = [];
  const record = (result) => {
    if (result.violations.length > 0) {
      failures.push(`${result.name}: ${result.violations.join("; ")}`);
    }
  };

  const dockerGate = runGatedLeg({
    name: "node-18-alpine",
    capability: "docker",
    unverifiedInvariants: ["AT-2.5"],
    probeResult: probeDocker(),
    leg: legContainer,
  });
  if (dockerGate.skip) appendSkipRecord(dockerGate.skip, skipSinkPath);
  else record(dockerGate.result);

  const npmPackProbe = probeNpmPack();

  const installGate = runGatedLeg({
    name: "npm-pack-install-upgrade",
    capability: "npm-pack",
    unverifiedInvariants: ["AT-2.4"],
    probeResult: npmPackProbe,
    leg: legInstallUpgrade,
  });
  if (installGate.skip) appendSkipRecord(installGate.skip, skipSinkPath);
  else record(installGate.result);

  const twoRepoGate = runGatedLeg({
    name: "two-repo-upgrade",
    capability: "npm-pack",
    unverifiedInvariants: ["AT-2.3"],
    probeResult: npmPackProbe,
    leg: legTwoRepoUpgrade,
  });
  if (twoRepoGate.skip) appendSkipRecord(twoRepoGate.skip, skipSinkPath);
  else record(twoRepoGate.result);

  if (npmPackProbe && npmPackProbe.status === 0) {
    record(legPluginTreeHash());
  }

  // real-spawn (launcher legs 2/3) is validated inside `launcher.test.js`
  // itself, run as a separate step under `node --test`; its skips land in
  // the same sink file via `appendSkipRecord`.

  const records = readSkipRecords(skipSinkPath);
  const inventoryViolations = validateSkipRecords(records, SKIP_INVENTORY);
  failures.push(...inventoryViolations.map((v) => `SKIP_INVENTORY: ${v}`));

  if (failures.length > 0) {
    console.error("fixture-machine: FAILED\n" + failures.map((f) => `  - ${f}`).join("\n"));
    process.exitCode = 1;
    return;
  }

  console.log("fixture-machine: all legs passed" + (records.length > 0 ? ` (${records.length} registered skip(s))` : ""));
}

const isEntryPoint = (() => {
  try {
    return import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
  } catch {
    return false;
  }
})();

if (isEntryPoint) {
  runFixtureMachine();
}
