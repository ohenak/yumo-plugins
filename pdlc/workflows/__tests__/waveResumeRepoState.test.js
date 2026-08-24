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

import { existsSync, readFileSync } from "fs";
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
});
