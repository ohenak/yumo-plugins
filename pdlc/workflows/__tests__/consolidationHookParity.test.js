// consolidationHookParity.test.js — PLAN T04 (RED, describe.skip), T09 and T25 (GREEN owners).
//
// Three blocks, per PLAN §2's discipline: a 🔴 task authors its cases inside `describe.skip`,
// one block per green owner, named for that owner. Skipped cases are *reported as skipped*, not
// as passed, so the wave gate stays green and truthful. Each owner's first obligation is to
// un-skip its own block only — a green task that un-skips a block it does not own is a rule
// violation, because that block's symbols do not exist yet.
//
//   - describe.skip("T09 — CORPUS_GLOBS and the no-regression pair", …)   L3 + L4, §7.1 pin (b)
//   - describe.skip("T25 — AT-P7", …)                                     L4, §11.3(f)
//   - describe.skip("T25 — pathspec semantics", …)                        L4, no FSPEC AT
//
// This file owns no production code. It does not import `consolidationDoubles.js` (T01, same
// batch, not yet a dependency): every fixture here is built locally, and no fixture depends on
// git visibility for the AT-P7 block (§11.3(f)) — `classifyCorpus` is driven directly there.
//
// PY_BIN is probed once at module scope, exactly like the shipped hook's own probe
// (`nudge-consolidation.sh:13-20`). Finding no interpreter declares every differential row
// `test.skip` and warns once; there is no degraded path on which a subset still runs. The
// executed-row counter is incremented by each differential row as its *last* statement and read
// by its own unconditional top-level `test()`, declared last in this file — never an `afterAll`,
// which jest does not run when every test in a block is skipped. The assertion is that `executed`
// equals either the total gated-row count or 0. The pathspec-semantics case is outside the
// fixture table and outside that counter.

import { execSync, spawnSync } from "child_process";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { tmpdir } from "os";
import { fileURLToPath } from "url";

import { classifyCorpus } from "../consolidate-learnings.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..", "..");
const HOOK_PATH = join(REPO_ROOT, "pdlc", "hooks", "scripts", "nudge-consolidation.sh");
const HOOK_SOURCE = readFileSync(HOOK_PATH, "utf8");

// ---------------------------------------------------------------------------
// Environment guards — bash and a usable Python interpreter, probed once.
// ---------------------------------------------------------------------------

function bashAvailable() {
  try {
    execSync("bash --version", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}
const hasBash = bashAvailable();

/** Mirrors the shipped hook's own probe (nudge-consolidation.sh:13-20). */
function probePyBin() {
  for (const cand of ["python3", "python", "py"]) {
    try {
      const r = spawnSync(cand, ["-c", "import sys"], { stdio: "pipe" });
      if (r.status === 0) return cand;
    } catch {
      // try the next candidate
    }
  }
  return null;
}
const PY_BIN = probePyBin();
if (!PY_BIN) {
  // eslint-disable-next-line no-console
  console.warn(
    "consolidationHookParity.test.js: no usable Python interpreter found among " +
      "python3/python/py; every differential row is reported as skipped, not run."
  );
}
const canRunDifferential = hasBash && !!PY_BIN;

// Shared, incremented only by a differential row's own test body as its last statement.
let executed = 0;

// ---------------------------------------------------------------------------
// Shared fixture/exec helpers.
// ---------------------------------------------------------------------------

function makeTempRoot(prefix) {
  return mkdtempSync(join(tmpdir(), prefix));
}

/** Writes one LEARNINGS-*.md file per relative directory in `relDirs`, under `root`. */
function writeLearnings(root, relDirs) {
  relDirs.forEach((relDir, i) => {
    const dir = join(root, ...relDir.split("/"));
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `LEARNINGS-fixture-${i}.md`), "# LEARNINGS fixture\n");
  });
}

/** Writes one named LEARNINGS file per `{dir, name}` entry, under `root`. */
function writeNamedLearnings(root, entries) {
  entries.forEach(({ dir, name }) => {
    const full = join(root, ...dir.split("/"));
    mkdirSync(full, { recursive: true });
    writeFileSync(join(full, name), "# LEARNINGS fixture\n");
  });
}

/** The CorpusFile[] the JS side is fed — same entries the fixture wrote to disk. */
function corpusFilesFromEntries(entries) {
  return entries.map(({ dir, name }) => ({ path: `${dir}/${name}`, basename: name }));
}

function writeLog(root, text) {
  const dir = join(root, "docs", "_decisions");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, ".consolidation-log.md"), text);
}

/** Writes a `git show HEAD:…` copy of the shipped hook into `destDir`, executable. */
function writeHeadHookCopy(destDir) {
  const text = execSync("git show HEAD:pdlc/hooks/scripts/nudge-consolidation.sh", {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
  const dest = join(destDir, "nudge-consolidation-head.sh");
  writeFileSync(dest, text, { mode: 0o755 });
  return dest;
}

/** Runs a hook script against `root` through CLAUDE_PROJECT_DIR, optionally debug-gated. */
function runHook(hookPath, root, { debug = false } = {}) {
  const env = { ...process.env, CLAUDE_PROJECT_DIR: root };
  if (debug) env.PDLC_CONSOLIDATION_DEBUG = "1";
  else delete env.PDLC_CONSOLIDATION_DEBUG;
  const result = spawnSync("bash", [hookPath], {
    input: "",
    encoding: "utf8",
    env,
    cwd: root,
  });
  return { exitCode: result.status ?? -1, stdout: result.stdout || "", stderr: result.stderr || "" };
}

/** The stdout `additionalContext` text, or "" when the hook printed nothing (below THRESHOLD). */
function additionalContextOf(stdout) {
  const trimmed = stdout.trim();
  if (!trimmed) return "";
  const parsed = JSON.parse(trimmed);
  return parsed?.hookSpecificOutput?.additionalContext ?? "";
}

/** The `PDLC_PENDING:` stderr set, or null when the line is absent (debug channel not reached). */
function pendingSetOf(stderrText) {
  const line = stderrText.split("\n").find((l) => l.startsWith("PDLC_PENDING:"));
  if (line === undefined) return null;
  const rest = line.slice("PDLC_PENDING:".length);
  return new Set(rest.split(",").filter((s) => s.length > 0));
}

/** The message transcribed literally from the shipped template (nudge-consolidation.sh:44-46). */
function expectedMessage(n) {
  return (
    `pdlc: ${n} feature LEARNINGS files have not been consolidated yet. ` +
    "Consider running /pdlc:consolidate-learnings to promote recurring patterns " +
    "into docs/_constraints and docs/_decisions."
  );
}

// ---------------------------------------------------------------------------
// T09 — CORPUS_GLOBS and the no-regression pair (§7.1 pin (b)).
// ---------------------------------------------------------------------------

const NO_REGRESSION_ROW_COUNT = 2;

describe("T09 — CORPUS_GLOBS and the no-regression pair", () => {
  test("CORPUS_GLOBS declares exactly two glob-pattern literals, no third", () => {
    // Located by name, never by line index (§7.1): the assignment is found by its identifier,
    // not by a `:NN` anchor this feature's own edits would shift.
    const declMatch = HOOK_SOURCE.match(/CORPUS_GLOBS\s*=\s*\(([\s\S]*?)\)/);
    expect(declMatch).not.toBeNull();
    const literals = Array.from(declMatch[1].matchAll(/"([^"]*)"/g)).map((m) => m[1]);
    expect(new Set(literals)).toEqual(
      new Set(["docs/*/LEARNINGS-*.md", "docs/completed/*/LEARNINGS-*.md"])
    );
    expect(literals.length).toBe(2);

    // `glob.glob(` occurs exactly once in the file, and inside the comprehension over
    // CORPUS_GLOBS — so a third call site (a second glob added elsewhere) cannot escape this
    // pin even though the set assertion above only reads the declaration.
    const globCalls = HOOK_SOURCE.match(/glob\.glob\(/g) || [];
    expect(globCalls.length).toBe(1);
    const comprehensionLine = HOOK_SOURCE.split("\n").find((l) => l.includes("glob.glob("));
    expect(comprehensionLine).toContain("CORPUS_GLOBS");
  });

  (canRunDifferential ? test : test.skip)(
    "positive-identity fixture — byte-identical additionalContext, transcribed message",
    () => {
      const workDir = makeTempRoot("pdlc-hookparity-pos-");
      const root = join(workDir, "root");
      mkdirSync(root, { recursive: true });
      // 5 pending under docs/*/ alone, none under docs/completed/*/ — HEAD's single glob and
      // the widened CORPUS_GLOBS enumerate the same set here, so identity holds for the right
      // reason rather than because both sides print nothing.
      writeLearnings(root, ["docs/feat-a", "docs/feat-b", "docs/feat-c", "docs/feat-d", "docs/feat-e"]);

      const headHook = writeHeadHookCopy(workDir);
      const headOut = additionalContextOf(runHook(headHook, root).stdout);
      const editedOut = additionalContextOf(runHook(HOOK_PATH, root).stdout);

      expect(editedOut).toBe(headOut);
      expect(editedOut).toBe(expectedMessage(5));
      expect(headOut).not.toBe("");

      rmSync(workDir, { recursive: true, force: true });
      executed += 1; // last statement
    }
  );

  (canRunDifferential ? test : test.skip)(
    "divergence fixture — widened corpus crosses the threshold, HEAD does not",
    () => {
      const workDir = makeTempRoot("pdlc-hookparity-div-");
      const root = join(workDir, "root");
      mkdirSync(root, { recursive: true });
      // 2 under docs/*/ (below THRESHOLD alone) + 3 reachable only through the widened
      // docs/completed/*/ member — HEAD's single glob never sees the completed three, so HEAD
      // stays below THRESHOLD and prints nothing while the edited hook crosses it at n = 5.
      writeLearnings(root, ["docs/feat-a", "docs/feat-b"]);
      writeLearnings(root, [
        "docs/completed/feat-c",
        "docs/completed/feat-d",
        "docs/completed/feat-e",
      ]);

      const headHook = writeHeadHookCopy(workDir);
      const headOut = additionalContextOf(runHook(headHook, root).stdout);
      const editedOut = additionalContextOf(runHook(HOOK_PATH, root).stdout);

      expect(editedOut).not.toBe(headOut);
      expect(headOut).toBe("");
      expect(editedOut).toBe(expectedMessage(5));

      rmSync(workDir, { recursive: true, force: true });
      executed += 1; // last statement
    }
  );
});

// ---------------------------------------------------------------------------
// T25 — AT-P7, the differential predicate harness (§11.3(f)).
// ---------------------------------------------------------------------------

const AT_P7_TABLE = [
  {
    name: "E-04 — truncated block (opener, no closer) runs to EOF",
    entries: [
      { dir: "docs/feat-a", name: "LEARNINGS-alpha.md" },
      { dir: "docs/feat-b", name: "LEARNINGS-beta.md" },
    ],
    log: "Some prose.\n<!-- pdlc:consumed 2026-01-01-1 -->\nLEARNINGS-alpha.md\n",
    expected: ["LEARNINGS-beta.md"],
  },
  {
    name: "E-05 — stray closer (no opener) is ignored, moves no boundary",
    entries: [
      { dir: "docs/feat-a", name: "LEARNINGS-alpha.md" },
      { dir: "docs/feat-b", name: "LEARNINGS-beta.md" },
      { dir: "docs/feat-c", name: "LEARNINGS-gamma.md" },
    ],
    log:
      "LEARNINGS-alpha.md named in legacy prose.\n<!-- /pdlc:consumed -->\n" +
      "LEARNINGS-beta.md named after the stray closer, still legacy region.\n",
    expected: ["LEARNINGS-gamma.md"],
  },
  {
    name: "E-09 — two LEARNINGS sharing a basename collapse to one set member",
    entries: [
      { dir: "docs/feat-a", name: "LEARNINGS-dup.md" },
      { dir: "docs/completed/feat-b", name: "LEARNINGS-dup.md" },
      { dir: "docs/feat-c", name: "LEARNINGS-solo.md" },
    ],
    log: "",
    expected: ["LEARNINGS-dup.md", "LEARNINGS-solo.md"],
  },
  {
    name: "legacy/block boundary — text after the last block, outside any block, is in neither region",
    entries: [
      { dir: "docs/feat-a", name: "LEARNINGS-before.md" },
      { dir: "docs/feat-b", name: "LEARNINGS-inside.md" },
      { dir: "docs/feat-c", name: "LEARNINGS-after.md" },
    ],
    log:
      "LEARNINGS-before.md named in legacy prose before any marker.\n" +
      "<!-- pdlc:consumed 2026-01-02-1 -->\nLEARNINGS-inside.md\n<!-- /pdlc:consumed -->\n" +
      "LEARNINGS-after.md named after the last block, outside any block.\n",
    expected: ["LEARNINGS-after.md"],
  },
  {
    name: "one row above THRESHOLD — the shipped additionalContext count is also compared",
    entries: [
      { dir: "docs/feat-a", name: "LEARNINGS-t1.md" },
      { dir: "docs/feat-b", name: "LEARNINGS-t2.md" },
      { dir: "docs/feat-c", name: "LEARNINGS-t3.md" },
      { dir: "docs/feat-d", name: "LEARNINGS-t4.md" },
      { dir: "docs/feat-e", name: "LEARNINGS-t5.md" },
    ],
    log: "",
    expected: [
      "LEARNINGS-t1.md",
      "LEARNINGS-t2.md",
      "LEARNINGS-t3.md",
      "LEARNINGS-t4.md",
      "LEARNINGS-t5.md",
    ],
    checkThresholdMessage: true,
  },
  {
    name: "zero-corpus — PDLC_PENDING: is emitted with an empty value, ∅ read positively",
    entries: [],
    log: null,
    expected: [],
  },
];

describe.skip("T25 — AT-P7", () => {
  AT_P7_TABLE.forEach((row) => {
    (canRunDifferential ? test : test.skip)(row.name, () => {
      const workDir = makeTempRoot("pdlc-atp7-");
      const root = join(workDir, "root");
      mkdirSync(root, { recursive: true });
      if (row.entries.length > 0) writeNamedLearnings(root, row.entries);
      if (row.log !== null) writeLog(root, row.log);

      const hookRun = runHook(HOOK_PATH, root, { debug: true });
      const hookSet = pendingSetOf(hookRun.stderr);
      expect(hookSet).not.toBeNull(); // the debug line is reached on every path (§7.1)

      const files = corpusFilesFromEntries(row.entries);
      const jsSet = new Set(classifyCorpus(files, row.log).unconsolidated);

      const expectedSet = new Set(row.expected);
      // Three conjuncts: JS ≡ hook (both directions), and both ≡ the transcribed expected set.
      expect(jsSet).toEqual(hookSet);
      expect(hookSet).toEqual(jsSet);
      expect(jsSet).toEqual(expectedSet);

      if (row.checkThresholdMessage) {
        expect(additionalContextOf(hookRun.stdout)).toBe(expectedMessage(row.expected.length));
      }
      if (row.entries.length === 0) {
        expect(hookSet.size).toBe(0);
      }

      rmSync(workDir, { recursive: true, force: true });
      executed += 1; // last statement
    });
  });
});

// ---------------------------------------------------------------------------
// T25 — pathspec semantics (§7.1 pin (a), no FSPEC AT). Outside the fixture
// table and outside the executed-row counter (PLAN T04).
// ---------------------------------------------------------------------------

describe.skip("T25 — pathspec semantics", () => {
  (hasBash ? test : test.skip)(
    "pin (a)'s exact argv, through a real git in a temp repository the case builds",
    () => {
      const repo = makeTempRoot("pdlc-pathspec-");
      execSync("git init -q", { cwd: repo });
      execSync('git -c user.email=t@t -c user.name=t commit --allow-empty -q -m init', {
        cwd: repo,
      });
      writeNamedLearnings(repo, [
        { dir: "docs/feat-a", name: "LEARNINGS-tracked.md" },
        { dir: "docs/completed/feat-b", name: "LEARNINGS-completed.md" },
        { dir: "docs/discarded/feat-c", name: "LEARNINGS-discarded.md" },
      ]);
      execSync("git add -A", { cwd: repo });

      // `_git`'s own argv form (§7.1 pin (a)) — an array handed straight to the child process,
      // never a shell string, so `:(glob)` needs no quoting workaround here either.
      const result = spawnSync(
        "git",
        [
          "-C",
          ".",
          "ls-files",
          "--cached",
          "--others",
          "--exclude-standard",
          "--",
          ":(glob)docs/*/LEARNINGS-*.md",
          ":(glob)docs/completed/*/LEARNINGS-*.md",
        ],
        { cwd: repo, encoding: "utf8" }
      );
      expect(result.status).toBe(0);
      const lines = result.stdout.split("\n").filter((l) => l.length > 0);

      expect(lines.some((l) => l.includes("docs/discarded/"))).toBe(false);
      expect(lines.some((l) => l.includes("docs/completed/"))).toBe(true);
      expect(lines.length).toBe(2);

      rmSync(repo, { recursive: true, force: true });
    }
  );
});

// ---------------------------------------------------------------------------
// The executed-row counter's own oracle — unconditional, top-level, last in
// this file. Never an `afterAll`, which jest does not run when every test in
// a block is skipped. `executed` is 0 while both describe.skip blocks above
// stay skipped, and equals the total gated-row count once T09 and T25
// un-skip their own blocks and every gate (bash, PY_BIN) is available.
//
// The original oracle contemplated only two states: "both blocks skipped"
// (0) and "both un-skipped" (total). But T09 (wave 4) un-skips the
// NO_REGRESSION_ROW_COUNT rows three waves before T25 (wave 7) un-skips the
// AT-P7 rows, so NO_REGRESSION_ROW_COUNT alone is a legitimate scheduled
// intermediate state, not a regression. T25 MUST remove this intermediate
// member and restore the two-member (0, TOTAL_GATED_ROWS) set once both
// blocks are un-skipped — stating that obligation explicitly here so it is
// not missed.
// ---------------------------------------------------------------------------

const TOTAL_GATED_ROWS = NO_REGRESSION_ROW_COUNT + AT_P7_TABLE.length;

test("differential-row counter observes exactly the gated rows, or none while skipped", () => {
  expect([0, NO_REGRESSION_ROW_COUNT, TOTAL_GATED_ROWS]).toContain(executed);
});
