/**
 * hookCompatibility.test.js — Integration tests for pdlc hook scripts.
 * PROP-COMPAT-04: check-scope-field.sh advises when a Scope tag is absent (retained).
 * S01–S07: check-scope-field.sh anchored REQ-GUARD-04 scope-pattern rows (TSPEC § 6.4).
 * PROP-COMPAT-05 was retired — see the migration note below (TSPEC § 6.5).
 *
 * These tests invoke the hook scripts directly as child processes.
 * Skipped on platforms where bash is not available.
 */

import { execSync, spawnSync } from "child_process";
import { mkdtempSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { S_ROWS } from "./helpers/guardRowIds.js";
import { runScopeCheck } from "./helpers/guardFixtures.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Environment guard ────────────────────────────────────────────────────────

/** Returns true if bash is available in this environment. */
function bashAvailable() {
  try {
    execSync("bash --version", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

const hasBash = bashAvailable();

// Paths to the hook scripts under test
// __dirname = pdlc/workflows/__tests__; go up two levels to pdlc/, then into hooks/scripts/
const HOOKS_DIR = resolve(__dirname, "../../hooks/scripts");
const CHECK_SCOPE_SCRIPT = join(HOOKS_DIR, "check-scope-field.sh");
const GUARD_HARVEST_SCRIPT = join(HOOKS_DIR, "guard-harvest-before-delete.sh");

/**
 * Run a hook script with stdin as the provided input string.
 * @param {string} scriptPath
 * @param {string} stdinInput  JSON string to pass as stdin
 * @param {{ env?: object, cwd?: string }} opts
 * @returns {{ exitCode: number, stdout: string, stderr: string }}
 */
function runHookScript(scriptPath, stdinInput, opts = {}) {
  const result = spawnSync("bash", [scriptPath], {
    input: stdinInput,
    encoding: "utf8",
    env: { ...process.env, ...(opts.env || {}) },
    cwd: opts.cwd || process.cwd(),
  });
  return {
    exitCode: result.status ?? -1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

// ─── PROP-COMPAT-04: check-scope-field.sh ─────────────────────────────────────
describe("PROP-COMPAT-04: check-scope-field.sh warns when Scope tag is absent", () => {
  let tmpDir;
  let crossReviewFile;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "pdlc-compat-04-"));
    crossReviewFile = join(tmpDir, "CROSS-REVIEW-test-engineer-TSPEC.md");
    // Write a cross-review file that has NO Scope: tag
    writeFileSync(
      crossReviewFile,
      "# Cross-Review\n\n## Findings\n\n| ID | Severity | Finding |\n|---|---|---|\n| F-01 | High | Something is wrong |\n"
    );
  });

  afterEach(() => {
    try {
      rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // best-effort cleanup
    }
  });

  (hasBash ? it : it.skip)(
    "outputs advisory JSON when a CROSS-REVIEW-*.md file lacks a Scope tag",
    () => {
      // check-scope-field.sh receives the tool_input as JSON on stdin
      const toolInput = JSON.stringify({
        tool_input: { file_path: crossReviewFile },
      });

      const { exitCode, stdout } = runHookScript(
        CHECK_SCOPE_SCRIPT,
        toolInput,
        { cwd: tmpDir }
      );

      // The hook is advisory (always exits 0) but outputs a hookSpecificOutput JSON
      // when the Scope tag is missing — this is the PROP-COMPAT-04 assertion.
      expect(exitCode).toBe(0); // advisory hook never blocks
      // When scope tag is absent, the hook prints an advisory JSON containing the file name
      expect(stdout).toContain("hookSpecificOutput");
      expect(stdout).toContain("Scope");
    }
  );

  (hasBash ? it : it.skip)(
    "exits 0 silently when the CROSS-REVIEW-*.md file already has a Scope tag",
    () => {
      // Write a cross-review file WITH the Scope: tag
      writeFileSync(
        crossReviewFile,
        "---\nScope: Local\n---\n# Cross-Review\n\n## Findings\n\n| ID | Scope | Severity | Finding |\n|---|---|---|---|\n| F-01 | Local | High | Something |\n"
      );

      const toolInput = JSON.stringify({
        tool_input: { file_path: crossReviewFile },
      });

      const { exitCode, stdout } = runHookScript(
        CHECK_SCOPE_SCRIPT,
        toolInput,
        { cwd: tmpDir }
      );

      expect(exitCode).toBe(0);
      // No advisory output — already tagged
      expect(stdout.trim()).toBe("");
    }
  );

  (hasBash ? it : it.skip)(
    "outputs advisory JSON when a CODE_REVIEW-*.md file lacks a Scope tag",
    () => {
      const codeReviewFile = join(tmpDir, "CODE_REVIEW-my-feature-v1.md");
      writeFileSync(
        codeReviewFile,
        "# Code Review\n\n## Findings\n\n| # | Criterion | Severity | Finding |\n|---|---|---|---|\n| 1 | Stub | high | TODO left |\n"
      );
      const toolInput = JSON.stringify({
        tool_input: { file_path: codeReviewFile },
      });

      const { exitCode, stdout } = runHookScript(CHECK_SCOPE_SCRIPT, toolInput, {
        cwd: tmpDir,
      });

      expect(exitCode).toBe(0);
      expect(stdout).toContain("hookSpecificOutput");
      expect(stdout).toContain("Scope");
    }
  );
});

// ─── PROP-COMPAT-05 migration (TSPEC § 6.5) ───────────────────────────────────
//
// The former PROP-COMPAT-05 block (previously here, ~lines 156–244) asserted the
// disk-era guard-harvest-before-delete.sh behaviour and is DELETED — its
// assertions assume behaviour this feature inverts. Its coverage migrates to the
// guardMatrix.test.js M-row suite; see TSPEC § 6.5 for the authoritative
// assertion-level map. Summary:
//
//   • Non-repo tmpdir, `rm CROSS-REVIEW…`, no LEARNINGS → blocked
//       → the non-repo cell is now M37 (NO_REPO); the in-repo no-LEARNINGS cell
//         is M01 (NOT_COMMITTED). Old stderr oracle `pdlc guard` → `pdlc-guard[`.
//   • Disk-only `LEARNINGS-*.md` alongside → ALLOWED
//       → INVERTED by the REQ: disk-only is G8 → M01 blocks; the any-`LEARNINGS-*`
//         globbing is retired by G9 → M36. The allow-side successor is the
//         M33/G6 re-run set (committed AND pushed).
//   • `rm CODE_REVIEW…`, no LEARNINGS → blocked
//       → covered jointly by M06 (CODE_REVIEW-* pattern pin) + M01 (rm verb);
//         no new matrix row is added (TE F-11).
//
// PROP-COMPAT-05 as a property ID is retired in favour of the matrix-bound rows.
// No guard (M-row) inverted-behaviour assertions live here — they belong in
// guardMatrix.test.js. This file now covers only the scope-check S-rows below.

// ─── S01–S07: check-scope-field.sh anchored Scope patterns (REQ-GUARD-04) ─────
//
// Seven table-generated rows binding REQ-GUARD-04's P1–P3 accepted patterns and
// the case-sensitive / prose-substring negatives (TSPEC §§ 5, 6.4). Oracle:
//   • silent  = exit 0 + empty stdout
//   • warning = exit 0 + stdout containing `hookSpecificOutput` and `Scope`
// S04–S06 are 🔴 against the CURRENT substring-grep script (`grep -qiE 'scope|…'`),
// which false-passes on "telescope", the prose "scope", and lowercase `scope:`.
const S_CASES = [
  {
    // P1 — plain field line on its own line.
    id: "S01",
    file: "CROSS-REVIEW-s01.md",
    content: "# Cross-Review\n\nScope: Local\n\n## Findings\n\nA finding.\n",
    expect: "silent",
  },
  {
    // P2 — bold markdown (`**Scope:**`); no P1/P3 present.
    id: "S02",
    file: "CROSS-REVIEW-s02.md",
    content: "# Cross-Review\n\n**Scope:** Cross-Feature\n\nA finding.\n",
    expect: "silent",
  },
  {
    // P3 — table header cell `Scope`, mid-row (not line-anchored).
    id: "S03",
    file: "CROSS-REVIEW-s03.md",
    content:
      "# Cross-Review\n\n## Findings\n\n| ID | Severity | Scope | Finding |\n|---|---|---|---|\n| F-01 | High | Local | thing |\n",
    expect: "silent",
  },
  {
    // Negative — "telescope" prose substring must NOT count (REQ-GUARD-04).
    id: "S04",
    file: "CROSS-REVIEW-s04.md",
    content: "# Cross-Review\n\nWe pointed a telescope at the sky.\n\nA finding.\n",
    expect: "warning",
  },
  {
    // Negative — the prose "the scope of this change" must NOT count.
    id: "S05",
    file: "CROSS-REVIEW-s05.md",
    content:
      "# Cross-Review\n\nThis note describes the scope of this change.\n\nA finding.\n",
    expect: "warning",
  },
  {
    // Negative — lowercase `scope:` must NOT count (case-sensitive field name).
    id: "S06",
    file: "CROSS-REVIEW-s06.md",
    content: "# Cross-Review\n\nscope: Local\n\nA finding.\n",
    expect: "warning",
  },
  {
    // Basename filter — `notes.md` is not a review file, so the hook no-ops
    // silently regardless of content (TSPEC § 5 change 1; § 6.4).
    id: "S07",
    file: "notes.md",
    content: "# Notes\n\nGeneral notes with no Scope tag.\n",
    expect: "silent",
  },
];

describe("S01–S07: check-scope-field.sh anchored Scope-pattern detection", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "pdlc-scope-s-"));
  });

  afterEach(() => {
    try {
      rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // best-effort cleanup
    }
  });

  // Meta-test 3 (TSPEC § 6.3, TE F-07(a)): the S_CASES id set equals S_ROWS —
  // a dropped or duplicated S-case fails loudly instead of silently reducing
  // REQ-GUARD-05 S-row coverage.
  it("S_CASES id set equals S_ROWS (meta-test 3)", () => {
    const ids = S_CASES.map((c) => c.id);
    expect(ids.length).toBe(new Set(ids).size); // no duplicates
    expect([...ids].sort()).toEqual([...S_ROWS].sort());
  });

  const eachRow = hasBash ? it.each(S_CASES) : it.skip.each(S_CASES);
  eachRow(
    "$id",
    ({ expect: expected, file, content }) => {
      const filePath = join(tmpDir, file);
      const { exitCode, stdout } = runScopeCheck(filePath, content, {
        cwd: tmpDir,
      });

      // Advisory hook — never blocks.
      expect(exitCode).toBe(0);
      if (expected === "silent") {
        expect(stdout.trim()).toBe("");
      } else {
        expect(stdout).toContain("hookSpecificOutput");
        expect(stdout).toContain("Scope");
      }
    }
  );
});
