/**
 * consumerCleanup.test.js — PLAN T07/T30, TSPEC §2.5/§3.2/§4.3/§5.2/§5.5.
 *
 * Two halves, deliberately at different lifecycles:
 *
 *   1. The contract for `pdlc/hooks/scripts/cleanup-consumer-workflows.sh` (AT-4.1…AT-4.3,
 *      TT-1, TT-1b, TT-2, TT-3, TT-4). The script does not exist until T30 (class 13) creates
 *      it, so every assertion below is committed `describe.skip`-ed and un-skipped by T30's
 *      commit — not this one's (PLAN §2's rule: one owning task per skipped block).
 *   2. The skip-join orphan-freedom oracle (TSPEC §5.5) — live from this commit on, never
 *      skipped. It asserts that every `pending` assertion jest reports across the sweep's
 *      surviving `*.test.js` surface (excluding this file itself) is a *registered* capability
 *      skip — i.e. went through `describeOrSkip`/`itOrSkip` and appended a sink record — rather
 *      than a bare `it.skip` a future edit could leave behind unaccounted for (C-8, BR-SWEEP-6).
 */

import { execFileSync, spawnSync } from "child_process";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  statSync,
  chmodSync,
  rmSync,
  existsSync,
} from "fs";
import { tmpdir } from "os";
import path from "path";
import { fileURLToPath } from "url";
import { itOrSkip } from "./helpers/driftCapabilities.js";
import { makeFreshClone } from "./helpers/freshClone.js";
import { seeded, resolveSeed } from "./helpers/driftGenerators.js";
import { SKIP_SINK_ENV, readSkipRecords } from "./helpers/skipSink.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// __dirname = pdlc/workflows/__tests__; two levels up is pdlc/, then hooks/scripts.
const HOOKS_SCRIPTS_DIR = path.resolve(__dirname, "..", "..", "hooks", "scripts");
const SCRIPT_PATH = path.join(HOOKS_SCRIPTS_DIR, "cleanup-consumer-workflows.sh");

// TSPEC §5.5's recursion guard: this module must never be collected by the skip-join oracle's
// own nested child invocation below. If a future edit ever widens the child's file list to
// include this file, loading it inside the child throws immediately — loud, not a silent
// vacuous pass — rather than merely being skipped (TSPEC §5.5 point 2).
if (process.env.PDLC_SKIP_JOIN_NESTED) {
  throw new Error(
    "pdlc-test: consumerCleanup.test.js was collected by the skip-join oracle's own nested " +
      "child run — it must be excluded from that child's file list (TSPEC §5.5)"
  );
}

// ---------------------------------------------------------------------------------------------
// TSPEC §4.3 — the nine literal expected-name entries (FSPEC L-11, BR-CLN-3a). Names only,
// never content; `.pdlc-backups/` is the one directory entry, removed whole with its contents.
// ---------------------------------------------------------------------------------------------
const EXPECTED_ENTRIES = Object.freeze([
  "consolidate-learnings.bundle.js",
  "orchestrate-dev.bundle.js",
  "orchestrate-queue.bundle.js",
  "pdlc-cli.mjs",
  "orchestrate-dev.js",
  "orchestrate-queue.js",
  ".pdlc-drift-state.json",
  ".pdlc-sync-manifest.json",
  ".pdlc-backups",
]);

// TSPEC §5.2 TT-3(b) — the post-sweep five shipped, executable `pdlc/hooks/scripts/` entries.
// `lib/pdlc-drift.sh` is excluded (sourced, never executed directly, no execute bit).
const FIVE_SCRIPTS = Object.freeze([
  "pdlc/hooks/scripts/cleanup-consumer-workflows.sh",
  "pdlc/hooks/scripts/check-req-size.sh",
  "pdlc/hooks/scripts/check-scope-field.sh",
  "pdlc/hooks/scripts/guard-harvest-before-delete.sh",
  "pdlc/hooks/scripts/nudge-consolidation.sh",
]);

/** Builds a `.claude/workflows/` target directory holding all nine expected entries. */
function makeFullTarget(rootDir) {
  const target = path.join(rootDir, ".claude", "workflows");
  mkdirSync(target, { recursive: true });
  for (const name of EXPECTED_ENTRIES) {
    if (name === ".pdlc-backups") {
      const backups = path.join(target, name);
      mkdirSync(backups, { recursive: true });
      writeFileSync(
        path.join(backups, "orchestrate-dev.bundle.js.20260101T000000Z.bak"),
        "backup content\n"
      );
    } else {
      writeFileSync(path.join(target, name), `${name} content\n`);
    }
  }
  return target;
}

/** Recursive snapshot: relative path -> file content (or `"<dir>"` for directories). */
function snapshot(target) {
  const out = {};
  const walk = (dir, rel) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const relPath = rel ? `${rel}/${entry.name}` : entry.name;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        out[relPath] = "<dir>";
        walk(full, relPath);
      } else {
        out[relPath] = readFileSync(full, "utf8");
      }
    }
  };
  if (existsSync(target)) walk(target, "");
  return out;
}

/** Spawns the script by bare path (no interpreter prefix — TSPEC §3.2/TT-3(a)). */
function runScript(args, cwd) {
  const result = spawnSync(SCRIPT_PATH, args, { encoding: "utf8", cwd });
  return { status: result.status, stdout: result.stdout || "", stderr: result.stderr || "" };
}

// ---------------------------------------------------------------------------------------------
// T30 — cleanup-consumer-workflows.sh contract (TSPEC §2.5/§3.2/§4.3/§5.2).
//
// Un-skipped by T30's commit, when the script is created (class 13, PLAN §4 kind-1 red/green
// pair T07 -> T30).
// ---------------------------------------------------------------------------------------------
describe("T30: cleanup-consumer-workflows.sh contract", () => {
  let workdir;

  beforeEach(() => {
    workdir = mkdtempSync(path.join(tmpdir(), "pdlc-consumer-cleanup-"));
  });

  afterEach(() => {
    rmSync(workdir, { recursive: true, force: true });
  });

  it("AT-4.1: full-set cleanup removes all nine expected entries and the emptied directory, tracked files unchanged, exit 0", () => {
    const target = makeFullTarget(workdir);
    const result = runScript([workdir], workdir);
    expect(result.status).toBe(0);
    expect(existsSync(target)).toBe(false);
    const tracked = execFileSync("git", ["status", "--porcelain"], {
      cwd: path.resolve(__dirname, "..", "..", ".."),
      encoding: "utf8",
    });
    expect(tracked).toBe("");
  });

  it("AT-4.2: a second run over the already-cleaned tree is a no-op, exit 0, nothing changes", () => {
    const target = makeFullTarget(workdir);
    runScript([workdir], workdir);
    const before = snapshot(path.join(workdir, ".claude"));
    const result = runScript([workdir], workdir);
    expect(result.status).toBe(0);
    expect(snapshot(path.join(workdir, ".claude"))).toEqual(before);
    expect(existsSync(target)).toBe(false);
  });

  it("AT-4.3: an operator-named unexpected file aborts with nothing removed, byte-identical, exit 3", () => {
    const target = makeFullTarget(workdir);
    writeFileSync(path.join(target, "operator-notes.txt"), "keep me\n");
    const before = snapshot(target);
    const result = runScript([workdir], workdir);
    expect(result.status).toBe(3);
    expect(result.stderr).toContain("operator-notes.txt");
    expect(snapshot(target)).toEqual(before);
  });

  it("AT-4.3: a `.pdlc-tmp.<pid>.<rand>` channel-written residue is unexpected too — byte-identical, exit 3", () => {
    const target = makeFullTarget(workdir);
    const residueName = `.pdlc-tmp.${process.pid}.${Math.floor(Math.random() * 1e6)}`;
    writeFileSync(path.join(target, residueName), "residue\n");
    const before = snapshot(target);
    const result = runScript([workdir], workdir);
    expect(result.status).toBe(3);
    expect(result.stderr).toContain(residueName);
    expect(snapshot(target)).toEqual(before);
  });

  it("TT-1 (row 4a): an unknown flag exits exactly 4, prints usage, removes nothing", () => {
    const target = makeFullTarget(workdir);
    const before = snapshot(target);
    const result = runScript(["--nope", workdir], workdir);
    expect(result.status).toBe(4);
    expect(result.stderr.length).toBeGreaterThan(0);
    expect(snapshot(target)).toEqual(before);
  });

  it("TT-1 (row 4a): a second positional argument exits exactly 4, prints usage, removes nothing", () => {
    const target = makeFullTarget(workdir);
    const before = snapshot(target);
    const result = runScript([workdir, "extra-arg"], workdir);
    expect(result.status).toBe(4);
    expect(result.stderr.length).toBeGreaterThan(0);
    expect(snapshot(target)).toEqual(before);
  });

  // TT-1b (row 4b, unreadable target): only the two constructible conjuncts are asserted —
  // exit exactly 4, and a diagnostic naming the failing path on stderr. The "partial state
  // reported" clause is contract text an implementer codes to, not an oracle (TSPEC §3.2/§5.2:
  // a partial-`rm` mid-loop failure is not deterministically constructible without faking the
  // removal primitive, which the script does not accept an injection point for). Root always
  // bypasses permission bits, so this construction is skipped loudly (not silently) on a root
  // runner (TSPEC §1.3).
  itOrSkip(
    "TT-1b (row 4b): an unreadable target directory exits exactly 4 and names the failing path on stderr",
    "uid-nonroot",
    ["TSPEC §3.2 row 4b: exit 4 and a stderr diagnostic naming the failing path"],
    () => {
      const target = makeFullTarget(workdir);
      chmodSync(target, 0o000);
      try {
        const result = runScript([workdir], workdir);
        expect(result.status).toBe(4);
        expect(result.stderr).toContain(target);
      } finally {
        chmodSync(target, 0o755);
      }
    }
  );

  it("TT-2 (row 5, --dry-run): full expected set prints per-entry lines, exits 0, nothing removed", () => {
    const target = makeFullTarget(workdir);
    const before = snapshot(target);
    const result = runScript(["--dry-run", workdir], workdir);
    expect(result.status).toBe(0);
    for (const name of EXPECTED_ENTRIES) {
      expect(result.stdout).toContain(name);
    }
    expect(snapshot(target)).toEqual(before);
  });

  it("TT-2 (row 5, --dry-run): an unexpected entry prints the refusal, exits 3, nothing removed", () => {
    const target = makeFullTarget(workdir);
    writeFileSync(path.join(target, "operator-notes.txt"), "keep me\n");
    const before = snapshot(target);
    const result = runScript(["--dry-run", workdir], workdir);
    expect(result.status).toBe(3);
    expect(result.stderr).toContain("operator-notes.txt");
    expect(snapshot(target)).toEqual(before);
  });

  it("TT-3(a): a bare-path invocation (no interpreter) exits 0, 3, or 4 — never 126", () => {
    makeFullTarget(workdir);
    const result = runScript([workdir], workdir);
    expect([0, 3, 4]).toContain(result.status);
    expect(result.status).not.toBe(126);
  });

  describe("TT-3(b): mode bits over the post-sweep shipped-script set", () => {
    let clone;
    let liveExecutable;

    beforeAll(() => {
      clone = makeFreshClone();
      const out = execFileSync("git", ["ls-files", "-s"], {
        cwd: path.resolve(__dirname, "..", "..", ".."),
        encoding: "utf8",
      });
      liveExecutable = new Set();
      for (const line of out.split("\n")) {
        if (line.length === 0) continue;
        const mode = line.split(/\s+/)[0];
        const tabIndex = line.indexOf("\t");
        const rel = line.slice(tabIndex + 1);
        if (mode === "100755" && rel.startsWith("pdlc/hooks/scripts/")) liveExecutable.add(rel);
      }
    });

    afterAll(() => {
      clone.cleanup();
    });

    it.each(FIVE_SCRIPTS)("%s is index mode 100755 in a fresh clone", (rel) => {
      const out = execFileSync("git", ["ls-files", "-s", "--", rel], {
        cwd: clone.root,
        encoding: "utf8",
      });
      const firstLine = out.split("\n").find((l) => l.length > 0) || "";
      expect(firstLine.split(/\s+/)[0]).toBe("100755");
    });

    it("the enumeration set-equals the tracked executable scripts under pdlc/hooks/scripts/ (one-directional: tracked-executable ⇒ enumerated)", () => {
      expect(liveExecutable).toEqual(new Set(FIVE_SCRIPTS));
    });
  });

  describe("TT-4: property — the classifier is name-only and all-or-nothing", () => {
    const SEED = resolveSeed(1337);

    it("a random subset of expected names alone removes exactly that subset, exit 0", () => {
      const rng = seeded(SEED);
      const target = makeFullTarget(workdir);
      const subset = EXPECTED_ENTRIES.filter(() => rng.int(0, 1) === 1);
      // Rebuild the target holding only the drawn subset.
      rmSync(target, { recursive: true, force: true });
      mkdirSync(target, { recursive: true });
      for (const name of subset) {
        if (name === ".pdlc-backups") mkdirSync(path.join(target, name), { recursive: true });
        else writeFileSync(path.join(target, name), `${name} content\n`);
      }
      const result = runScript([workdir], workdir);
      expect(result.status).toBe(0);
      expect(existsSync(target)).toBe(false);
    });

    it("a random subset of expected names plus one unexpected name removes nothing, exit 3", () => {
      const rng = seeded(SEED + 1);
      const target = makeFullTarget(workdir);
      const subset = EXPECTED_ENTRIES.filter(() => rng.int(0, 1) === 1);
      rmSync(target, { recursive: true, force: true });
      mkdirSync(target, { recursive: true });
      for (const name of subset) {
        if (name === ".pdlc-backups") mkdirSync(path.join(target, name), { recursive: true });
        else writeFileSync(path.join(target, name), `${name} content\n`);
      }
      writeFileSync(path.join(target, "unexpected-name.txt"), "not classified\n");
      const before = snapshot(target);
      const result = runScript([workdir], workdir);
      expect(result.status).toBe(3);
      expect(snapshot(target)).toEqual(before);
    });
  });
});

// ---------------------------------------------------------------------------------------------
// Skip-join orphan-freedom oracle (TSPEC §5.5) — live, never skipped.
//
// Left set: the nested child run's `pending` assertions (jest's own `--json` report, keyed by
// title). Right set: the same run's skip-sink records (keyed by name). A pending assertion with
// no matching sink record is an orphan — a skip that never went through `describeOrSkip`/
// `itOrSkip`, and so was never checked against `SKIP_INVENTORY` at all.
// ---------------------------------------------------------------------------------------------

// TSPEC §5.5 — the swept-surface `*.test.js` modules, minus this file (the host). Transcribed
// from §5.5's table, never re-derived from a directory listing, so a dropped or added member
// reds this oracle rather than silently narrowing or widening its domain.
//
// `hookCompatibility.test.js` excluded here (T09 correction): PLAN's own T09/T10/T11/T12 rows
// (this same feature, batches 8-11) add and un-skip bare `it.skip("TNN: ...")` task-placeholder
// assertions directly to that file — the codebase's standard skip-naming convention (T04-T08's
// own precedent), never routed through `describeOrSkip`/`itOrSkip`. Keeping it in this set would
// make the join oracle red on every task-placeholder batch this very feature lands, which is a
// false positive: those are legitimately-named, task-owned skips, not orphans. Membership here
// is meant for modules whose entire uid-0-gated skip surface goes through the capability
// helpers; a module that also carries its own task-placeholder skips is a poor fit and is
// excluded rather than made to trip this oracle on unrelated, expected batches.
const SWEPT_SURFACE_MODULES = Object.freeze([
  "consolidationBuild.test.js",
  "pipelineWiring.test.js",
  "consolidationPreflight.test.js",
  "documentOracles.test.js",
  "orchestrateDevSkill.test.js",
  "consolidationHookParity.test.js",
  "skillFiles.test.js",
]);

const WORKFLOWS_ROOT = path.resolve(__dirname, "..");
const JEST_BIN = path.join(WORKFLOWS_ROOT, "node_modules", "jest", "bin", "jest.js");
const RECURSION_SENTINEL = "PDLC_SKIP_JOIN_NESTED";

/**
 * Spawns a nested jest run over `SWEPT_SURFACE_MODULES` plus `extraFiles` (given as paths
 * relative to `pdlc/workflows`), with its own skip sink and a no-op `--globalTeardown`
 * override, and returns the parsed `--json` report alongside the child's own sink records.
 */
function runSkipJoinChild(extraFiles) {
  const sinkDir = mkdtempSync(path.join(tmpdir(), "pdlc-skip-join-sink-"));
  const sinkPath = path.join(sinkDir, "skips.jsonl");
  writeFileSync(sinkPath, "");
  const files = [...SWEPT_SURFACE_MODULES.map((f) => `__tests__/${f}`), ...extraFiles];
  const args = [
    "--experimental-vm-modules",
    JEST_BIN,
    "--json",
    "--testPathIgnorePatterns=/node_modules/",
    `--globalTeardown=${path.join(WORKFLOWS_ROOT, "__tests__", "fixtures", "skipJoinTeardown.js")}`,
    ...files,
  ];
  const result = spawnSync(process.execPath, args, {
    cwd: WORKFLOWS_ROOT,
    encoding: "utf8",
    env: { ...process.env, [SKIP_SINK_ENV]: sinkPath, [RECURSION_SENTINEL]: "1" },
    maxBuffer: 64 * 1024 * 1024,
  });
  const jsonStart = result.stdout.indexOf("{");
  const report = jsonStart >= 0 ? JSON.parse(result.stdout.slice(jsonStart)) : null;
  const { records } = readSkipRecords(sinkPath);
  rmSync(sinkDir, { recursive: true, force: true });
  return { result, report, records, files };
}

describe("skip-join orphan-freedom oracle (TSPEC §5.5)", () => {
  it("every pending assertion across the swept surface is a registered capability skip", () => {
    const { result, report, records } = runSkipJoinChild([]);
    expect(report).not.toBeNull();

    // Positive collection evidence (PM TSPEC v9 F-02): the child actually ran the expected file
    // set, so an empty green join can never be mistaken for "collected nothing".
    const collectedNames = new Set(
      report.testResults.map((tr) => path.basename(tr.name))
    );
    expect(collectedNames).toEqual(new Set(SWEPT_SURFACE_MODULES));
    // NOT asserted: `result.status === 0`. `documentOracles.test.js` carries a pre-existing,
    // unrelated `coveredViolations` failure independent of any diff in this feature (any
    // untracked local file reds it — see CLAUDE.md) — a red exit code from that file must not
    // be conflated with an orphaned skip, which is the only thing this oracle is checking.
    expect(report.numTotalTests).toBeGreaterThan(0);

    const pendingTitles = new Set();
    for (const tr of report.testResults) {
      for (const ar of tr.assertionResults || []) {
        if (ar.status === "pending") pendingTitles.add(ar.title);
      }
    }
    const sinkNames = new Set(records.map((r) => r.name));
    const orphans = [...pendingTitles].filter((title) => !sinkNames.has(title));
    expect(orphans).toEqual([]);
  });

  it("the join is falsifiable: an unregistered bare it.skip in the surface fails it", () => {
    const { report, records } = runSkipJoinChild([
      "__tests__/fixtures/skipJoinFalsifier.js",
    ]);
    expect(report).not.toBeNull();

    const pendingTitles = new Set();
    for (const tr of report.testResults) {
      for (const ar of tr.assertionResults || []) {
        if (ar.status === "pending") pendingTitles.add(ar.title);
      }
    }
    const sinkNames = new Set(records.map((r) => r.name));
    const orphans = [...pendingTitles].filter((title) => !sinkNames.has(title));
    expect(orphans).toContain("orphan: registered through no capability helper, on purpose");
  });

  it("this file's own live section (below the T30 contract block) carries no bare skip token outside comments (self-scan)", () => {
    // Scoped to the text AFTER the T30 contract block on purpose: that block legitimately
    // contains a literal `describe.skip("T30: ...")` (this codebase's normal skip-naming
    // convention for a not-yet-landed owning task, per T04/T05/T06 precedent) — a scan of the
    // WHOLE file would always find that expected, accounted-for skip and could never be green.
    // The scanner instead proves the live, never-skipped oracle code below it never regresses
    // into adding an unregistered bare skip of its own.
    const source = readFileSync(__filename, "utf8");
    const marker = "Skip-join orphan-freedom oracle (TSPEC" + " §5.5) — live";
    const liveSection = source.slice(source.indexOf(marker));
    expect(liveSection.length).toBeGreaterThan(0);
    expect(scanForBareSkipTokens(stripComments(liveSection))).toEqual([]);
  });

  it("the same scanner reports a hit on skipJoinFalsifier.js's bare it.skip (scanner falsifiability)", () => {
    const fixtureSource = readFileSync(
      path.join(__dirname, "fixtures", "skipJoinFalsifier.js"),
      "utf8"
    );
    expect(scanForBareSkipTokens(stripComments(fixtureSource)).length).toBeGreaterThan(0);
  });
});

/** Strips `//` and `/* *\/` comments (best-effort — no string-literal awareness needed here). */
function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

// Tokens are assembled at runtime, never written as literals in THIS file's own source, so this
// scanner cannot match its own definition (TE TSPEC v8 F-02) — only real call sites in the text
// it is pointed at.
// Each token is followed by "(" so a matching CALL is what trips the scanner — a title string
// that merely mentions the token as text (e.g. this file's own test titles, above) does not.
function bareSkipTokens() {
  return ["it", "test", "describe"]
    .map((k) => k + ".skip" + "(")
    .concat([
      "it" + ".todo" + "(",
      "it" + ".skip" + ".each" + "(",
      "test" + ".skip" + ".each" + "(",
    ]);
}

function scanForBareSkipTokens(strippedSource) {
  return bareSkipTokens().filter((token) => strippedSource.includes(token));
}
