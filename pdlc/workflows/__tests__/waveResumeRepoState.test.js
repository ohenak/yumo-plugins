// waveResumeRepoState.test.js — T-03 (batch 2, repo-state suite plus the
// constraints-file promotion). D-7, D-9, D-10.
//
// AT-14: the wave-state record never becomes tracked content — three
// conjuncts, falsifiable in both directions:
//   (i)   a line **equal** to `/.claude/pdlc-wave-state.json` exists in
//         `.gitignore`;
//   (ii)  that line is root-anchored — the leading `/` is asserted on the
//         matched line itself, since an unanchored pattern would also reach
//         the checked-in fixture trees (the rationale the sibling
//         `/.claude/workflows/` rule records in the same block);
//   (iii) `git check-ignore -v .claude/pdlc-wave-state.json` resolves to
//         *that* line, not to a broader pattern.
// Forbidden weakenings, named so a reviewer can check them: no
// `some(line => line.includes(...))` substring match against the ignore
// file, and no "no churn observed" placeholder assertion.
//
// AT-17 (repo-state half): a finite check over *this feature's PLAN* — no
// row of §3.3's ownership manifest, and no `implementation.postWavePathspecs`
// value, names `WAVE_STATE_PATH` (D-9, OB-F6).
//
// D-10 / OB-F4: `docs/_constraints/pdlc-wave-gate-baseline.md` carries
// `M-WVR-1` and `M-WVR-2` (presence-only; the green half of this task
// appends the `## 5` section this asserts).

import { existsSync, readdirSync, readFileSync } from "fs";
import { execFileSync } from "child_process";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const WORKFLOWS = resolve(HERE, "..");
const REPO_ROOT = resolve(WORKFLOWS, "../..");

const GITIGNORE_PATH = join(REPO_ROOT, ".gitignore");
const PLAN_PATH = join(REPO_ROOT, "docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md");
const BASELINE_PATH = join(REPO_ROOT, "docs/_constraints/pdlc-wave-gate-baseline.md");

const EXPECTED_IGNORE_LINE = "/.claude/pdlc-wave-state.json";

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: "utf8", cwd: REPO_ROOT, ...opts });
}

// Extracts the body of a `### ` section: everything after the heading line
// matching `headingRegex`, up to (but not including) the next `### ` line.
function extractSection(markdown, headingRegex) {
  const lines = markdown.split("\n");
  const startIdx = lines.findIndex((line) => headingRegex.test(line));
  if (startIdx === -1) {
    throw new Error(`heading not found: ${headingRegex}`);
  }
  const rest = lines.slice(startIdx + 1);
  const endIdx = rest.findIndex((line) => /^### /.test(line));
  const body = endIdx === -1 ? rest : rest.slice(0, endIdx);
  return body.join("\n");
}

// ---------------------------------------------------------------------------
// AT-14 — the record never becomes tracked content
// ---------------------------------------------------------------------------

describe("AT-14: the wave-state record is never tracked content", () => {
  const gitignoreLines = readFileSync(GITIGNORE_PATH, "utf8").split("\n");

  test("a line equal to /.claude/pdlc-wave-state.json exists in .gitignore", () => {
    expect(gitignoreLines).toContainEqual(EXPECTED_IGNORE_LINE);
  });

  test("the matched line is root-anchored (leading /)", () => {
    const matched = gitignoreLines.find((line) => line === EXPECTED_IGNORE_LINE);
    expect(matched).toBeDefined();
    expect(matched.charAt(0)).toBe("/");
  });

  test("git check-ignore -v resolves to that exact line, not a broader pattern", () => {
    const output = run("git", ["check-ignore", "-v", ".claude/pdlc-wave-state.json"]);
    // Shipped format: "<source>:<lineno>:<pattern>\t<pathname>"
    const [sourceCell] = output.trim().split("\t");
    const [source, , pattern] = sourceCell.split(":");
    expect(source).toBe(".gitignore");
    expect(pattern).toBe(EXPECTED_IGNORE_LINE);
  });
});

// ---------------------------------------------------------------------------
// AT-17 (repo-state half) — a finite check over this feature's PLAN
// ---------------------------------------------------------------------------

describe("AT-17 (repo-state half): the PLAN names WAVE_STATE_PATH in no owned-path set", () => {
  const planText = readFileSync(PLAN_PATH, "utf8");

  test("PLAN §3.3's ownership manifest heading is present", () => {
    expect(/^### 3\.3 File-ownership manifest/m.test(planText)).toBe(true);
  });

  test("no row of §3.3's ownership manifest names WAVE_STATE_PATH", () => {
    const manifestSection = extractSection(planText, /^### 3\.3 File-ownership manifest/);
    const rows = manifestSection
      .split("\n")
      .filter((line) => /^\|\s*T-\d\d/.test(line.trim()) || /^T-\d\d/.test(line.trim()));
    // Finite, non-empty set of manifest rows — the check is over exactly
    // these, not an open-ended scan of the document.
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.includes("WAVE_STATE_PATH")).toBe(false);
    }
  });

  test("no implementation.postWavePathspecs value in PLAN §3.4 names WAVE_STATE_PATH", () => {
    const configSection = extractSection(planText, /^### 3\.4 Integration points/);
    const rows = configSection.split("\n").filter((line) => line.includes("postWavePathspecs"));
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      // Only the `Value` cell (the second `|`-delimited column) is the
      // configured value; the `Why` cell is free prose that may legitimately
      // *discuss* WAVE_STATE_PATH while stating the value does not name it.
      const cells = row.split("|");
      const valueCell = cells[2] ?? "";
      expect(valueCell.includes("WAVE_STATE_PATH")).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// D-10 / OB-F4 — the constraints-file promotion (presence-only)
// ---------------------------------------------------------------------------

describe("D-10 / OB-F4: docs/_constraints/pdlc-wave-gate-baseline.md carries M-WVR-1 and M-WVR-2", () => {
  test("the baseline file exists", () => {
    expect(existsSync(BASELINE_PATH)).toBe(true);
  });

  test("M-WVR-1 is present", () => {
    const baselineText = readFileSync(BASELINE_PATH, "utf8");
    expect(baselineText.includes("M-WVR-1")).toBe(true);
  });

  test("M-WVR-2 is present", () => {
    const baselineText = readFileSync(BASELINE_PATH, "utf8");
    expect(baselineText.includes("M-WVR-2")).toBe(true);
  });

  // Phase CR round 1, PM F-07. Presence-only is what PLAN D-10 asks for, but
  // it passes on a row emptied of its measured content, or one rewritten to
  // describe a different measurement, as long as the id survives as a
  // substring. `docs/_constraints` baselines are measured records, so each row
  // is pinned by the measurement it carries — never by a path or line number,
  // and never by rewriting the record itself.
  test.each([
    ["M-WVR-1", ["Replay cost", "pdlc-consolidation-agent", "16 waves", "7 tasks"]],
    ["M-WVR-2", ["may legitimately produce no commit", "pdlc-consolidation-agent", "nothing staged"]],
  ])("%s's row carries its measured content, not just its id", (id, phrases) => {
    const baselineText = readFileSync(BASELINE_PATH, "utf8");
    const row = baselineText
      .split("\n")
      .find((line) => line.trim().startsWith(`| ${id} `) || line.trim().startsWith(`| ${id}|`));
    expect({ id, rowFound: row !== undefined }).toEqual({ id, rowFound: true });
    for (const phrase of phrases) {
      expect({ id, phrase, present: row.includes(phrase) }).toEqual({
        id,
        phrase,
        present: true,
      });
    }
  });
});

// ---------------------------------------------------------------------------
// D-1 (Phase CR, round 1: PM F-02 / TE F-02) — the INTERIM commentary is gone
// from the production source, not merely from its banner.
//
// T-02 rewrote the ledger banner to cite the TSPEC, but a second `INTERIM wave
// ledger` marker survived inside `main()`. A source-text assertion is the only
// oracle that reds when a delta row is recorded as landed while a copy of the
// text it removes is still shipping. Scoped to the production module (and the
// generated runtime twin, which is where an operator-visible copy would land),
// never to a test file's own prose.
// ---------------------------------------------------------------------------

describe("D-1: no INTERIM wave-ledger commentary survives in shipped source", () => {
  const SOURCES = [
    join(WORKFLOWS, "orchestrate-dev.js"),
    join(WORKFLOWS, "dist/pdlc-cli.mjs"),
  ];

  for (const path of SOURCES) {
    test(`${path.slice(REPO_ROOT.length + 1)} contains no "INTERIM wave ledger" marker`, () => {
      const text = readFileSync(path, "utf8");
      expect(text.includes("INTERIM wave ledger")).toBe(false);
      // Positive conjunct: the replacement D-1 asks for is present, so this
      // cannot be satisfied by deleting the commentary altogether.
      expect(text.includes("Phase I's script-owned resume pointer (pdlc-wave-resume)")).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// Census compensation (Phase CR, round 1: PM F-03 / TE F-03).
//
// `documentOracles.test.js` excludes the `waveResume*` namespace from its
// `*.test.js` file census on the stated ground that PLAN §3.3's manifest owns
// it. That ownership was asserted nowhere: deleting a suite reddened no test on
// either side of the hole. This block closes it by **set equality** in both
// directions — on-disk `waveResume*.test.js` set == the set §3.3's manifest
// rows name — so adding a suite without a manifest row, or deleting a suite the
// manifest still owns, reds here.
// ---------------------------------------------------------------------------

describe("census: the waveResume* suite set equals PLAN §3.3's manifest", () => {
  const TEST_DIR = join(WORKFLOWS, "__tests__");

  const onDisk = () =>
    readdirSync(TEST_DIR)
      .filter((n) => n.startsWith("waveResume") && n.endsWith(".test.js"))
      .sort();

  const fromManifest = () => {
    const planText = readFileSync(PLAN_PATH, "utf8");
    const manifestSection = extractSection(planText, /^### 3\.3 File-ownership manifest/);
    const names = new Set();
    for (const line of manifestSection.split("\n")) {
      if (!/^\|\s*T-\d\d/.test(line.trim())) continue;
      for (const [, span] of line.matchAll(/`([^`]+)`/g)) {
        const base = span.split("/").pop();
        if (base.startsWith("waveResume") && base.endsWith(".test.js")) names.add(base);
      }
    }
    return [...names].sort();
  };

  test("the manifest names a non-empty waveResume* set", () => {
    expect(fromManifest().length).toBeGreaterThan(0);
  });

  test("on-disk waveResume*.test.js set-equals the manifest's", () => {
    expect(onDisk()).toEqual(fromManifest());
  });

  test("the census oracle still excludes exactly this namespace", () => {
    // Binds the compensation to the exclusion it compensates for: if
    // documentOracles.test.js drops the `waveResume` filter, this block is no
    // longer load-bearing and should be re-read rather than silently kept.
    const censusText = readFileSync(join(TEST_DIR, "documentOracles.test.js"), "utf8");
    expect(censusText.includes('startsWith("waveResume")')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// T-10's completeness oracle over PLAN §4.5.1 (Phase CR round 1, PM F-01).
//
// §2.1's T-10 row promises the delta coverage map is checked by SET EQUALITY —
// "a deleted [row] fails set-equality". §4.5.1 itself says its "completeness —
// not a percentage — is the checkable thing". Neither was mechanised: the table
// shipped with every `Covering test named by T-10` cell still a
// `*(filled in by T-10…)*` placeholder and nothing reading it.
//
// Three conjuncts, each falsifiable on its own:
//   (i)   the branch-class column set-equals a transcribed literal set, so
//         deleting or renaming a row reds;
//   (ii)  no cell is still a placeholder, so an unfilled table cannot pass;
//   (iii) every backticked test title a cell names exists in the test file that
//         cell names, so renaming or deleting a covering test reds.
//
// The line-coverage half of T-10's oracle (ii) is
// `scripts/check-wave-resume-delta-coverage.mjs`, run by `npm run test:coverage`
// — it needs the c8 artifact and so cannot live in this suite.
// ---------------------------------------------------------------------------

describe("PLAN §4.5.1's delta coverage map is complete", () => {
  const planText = readFileSync(PLAN_PATH, "utf8");

  // Everything between §4.5.1's heading and the next `####`.
  const section = (() => {
    const lines = planText.split("\n");
    const start = lines.findIndex((l) => /^#### 4\.5\.1 /.test(l));
    expect(start).toBeGreaterThan(-1);
    const rest = lines.slice(start + 1);
    const end = rest.findIndex((l) => /^#{1,4} /.test(l));
    return (end === -1 ? rest : rest.slice(0, end)).join("\n");
  })();

  /** The table's data rows, as `{branchClass, count, reachedFrom, covering}`. */
  const rows = section
    .split("\n")
    .filter((l) => l.startsWith("|"))
    .map((l) => l.split("|").slice(1, -1).map((c) => c.trim()))
    .filter((cells) => cells.length === 4)
    .filter((cells) => !/^-+$/.test(cells[0]) && cells[0] !== "Branch class this feature introduces")
    .map(([branchClass, count, reachedFrom, covering]) => ({
      branchClass,
      count,
      reachedFrom,
      covering,
    }));

  // Transcribed from TSPEC §3.1/§3.2/§2.4 and the shipped module — never read
  // back out of the PLAN, which is the document under test here.
  const EXPECTED_CLASSES = [
    "`classifyWaveLedger` guard arms (TSPEC §3.2)",
    "`WAVE_IGNORE_REASONS` reason renderers",
    "Lazy ancestry-probe short-circuit",
    "Announcement suffix branches in `main()`",
    "Report-row branches (`✅` wave-1 vs `N > 1`, `⏭`)",
  ];

  test("(i) the branch-class rows set-equal the transcribed set", () => {
    expect(rows.map((r) => r.branchClass).sort()).toEqual([...EXPECTED_CLASSES].sort());
  });

  test("(ii) no covering-test cell is still a T-10 placeholder", () => {
    for (const row of rows) {
      expect(row.covering).not.toMatch(/filled in by T-10/);
      expect(row.covering.length).toBeGreaterThan(40);
    }
  });

  test("(iii) every test title a cell names exists in the test file that cell names", () => {
    const sources = new Map();
    const sourceFor = (basename) => {
      if (!sources.has(basename)) {
        sources.set(basename, readFileSync(join(WORKFLOWS, "__tests__", basename), "utf8"));
      }
      return sources.get(basename);
    };

    let checked = 0;
    for (const row of rows) {
      // Backticked spans in the cell are either a `*.test.js` filename or a
      // test/describe title. A cell may name its file before or after the
      // titles it lists, so titles are checked against every file the cell
      // names — the claim being tested is "this title exists in a file this row
      // points at", not "in this exact position".
      const spans = [...row.covering.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
      const files = spans.filter((sp) => sp.endsWith(".test.js"));
      expect({ row: row.branchClass, namesAFile: files.length > 0 }).toEqual({
        row: row.branchClass,
        namesAFile: true,
      });
      for (const span of spans) {
        if (span.endsWith(".test.js")) continue;
        // Only spans that look like a title — a sentence of four or more
        // words. Shorter backticked spans in these cells are branch labels
        // (`N > 1`) or announcement fragments (`provenance: operator-set`),
        // not test titles, and asserting them here would test the wrong claim.
        if (span.trim().split(/\s+/).length < 4) continue;
        const probe = span.replace(/\s*…$/, "");
        const found = files.some((f) => sourceFor(f).includes(probe));
        expect({ row: row.branchClass, files, title: probe }).toEqual({
          row: row.branchClass,
          files,
          title: found ? probe : `MISSING: ${probe}`,
        });
        checked += 1;
      }
    }
    // The loop above vacuously passes on an empty table; pin a floor so a
    // parser regression that yields no spans cannot read as green.
    expect(checked).toBeGreaterThanOrEqual(20);
  });

  test("the delta line-coverage oracle is wired into the coverage runner", () => {
    // §4.5.1's oracle (ii): the executable half is a `test:coverage` step, and
    // this asserts the wiring rather than the script's own behaviour.
    const pkg = JSON.parse(readFileSync(join(WORKFLOWS, "package.json"), "utf8"));
    expect(pkg.scripts["test:coverage"]).toContain("check-wave-resume-delta-coverage.mjs");
    expect(existsSync(join(WORKFLOWS, "scripts/check-wave-resume-delta-coverage.mjs"))).toBe(true);
  });
});
