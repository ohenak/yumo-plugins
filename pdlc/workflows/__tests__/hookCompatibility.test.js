/**
 * hookCompatibility.test.js — Integration tests for pdlc hook scripts.
 * PROP-COMPAT-04: check-scope-field.sh exits non-zero when Scope: tag is absent.
 * PROP-COMPAT-05: guard-harvest-before-delete.sh exits non-zero when LEARNINGS-*.md is absent.
 *
 * These tests invoke the hook scripts directly as child processes. Skipped loudly, via
 * `itOrSkip`, on platforms where bash is not available (TSPEC §1.3, §7.3).
 */

import { spawnSync } from "child_process";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { itOrSkip } from "./helpers/driftCapabilities.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths to the hook scripts under test
// __dirname = pdlc/workflows/__tests__; go up two levels to pdlc/, then into hooks/scripts/
const HOOKS_DIR = resolve(__dirname, "../../hooks/scripts");
const CHECK_SCOPE_SCRIPT = join(HOOKS_DIR, "check-scope-field.sh");
const GUARD_HARVEST_SCRIPT = join(HOOKS_DIR, "guard-harvest-before-delete.sh");

// __dirname is pdlc/workflows/__tests__, so three levels up is the repo root.
const REPO_ROOT = resolve(__dirname, "../../..");
const HOOKS_JSON_PATH = resolve(__dirname, "../../hooks/hooks.json");

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

  itOrSkip(
    "outputs advisory JSON when a CROSS-REVIEW-*.md file lacks a Scope tag",
    "bash",
    ["PROP-COMPAT-04: check-scope-field.sh's advisory-JSON-on-missing-Scope behaviour"],
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

  itOrSkip(
    "exits 0 silently when the CROSS-REVIEW-*.md file already has a Scope tag",
    "bash",
    ["PROP-COMPAT-04: check-scope-field.sh's silent-exit-0 behaviour when Scope is already present"],
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

  itOrSkip(
    "outputs advisory JSON when a CODE_REVIEW-*.md file lacks a Scope tag",
    "bash",
    ["PROP-COMPAT-04: check-scope-field.sh's advisory-JSON-on-missing-Scope behaviour for CODE_REVIEW-*.md"],
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

// ─── PROP-COMPAT-05: guard-harvest-before-delete.sh ──────────────────────────
describe("PROP-COMPAT-05: guard-harvest-before-delete.sh blocks deletion when no LEARNINGS-*.md exists", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "pdlc-compat-05-"));
    // Create a CROSS-REVIEW file in the temp dir (no LEARNINGS file present)
    writeFileSync(
      join(tmpDir, "CROSS-REVIEW-pm-review-TSPEC.md"),
      "# Cross-Review\nSome review content.\n"
    );
  });

  afterEach(() => {
    try {
      rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // best-effort cleanup
    }
  });

  itOrSkip(
    "exits non-zero when trying to delete CROSS-REVIEW-*.md and no LEARNINGS-*.md exists",
    "bash",
    ["PROP-COMPAT-05: guard-harvest-before-delete.sh's blocking behaviour for CROSS-REVIEW-*.md"],
    () => {
      const crossReviewPath = join(tmpDir, "CROSS-REVIEW-pm-review-TSPEC.md");
      // Simulate the Bash tool calling: rm <cross-review-path>
      const toolInput = JSON.stringify({
        tool_input: { command: `rm ${crossReviewPath}` },
      });

      const { exitCode, stderr } = runHookScript(
        GUARD_HARVEST_SCRIPT,
        toolInput,
        {
          cwd: tmpDir,
          env: { CLAUDE_PROJECT_DIR: tmpDir },
        }
      );

      // Hook must exit non-zero (exit 2 per script) to block the tool call
      expect(exitCode).not.toBe(0);
      // stderr should contain the guard message
      expect(stderr).toContain("pdlc guard");
      expect(stderr).toContain("CROSS-REVIEW");
    }
  );

  itOrSkip(
    "exits 0 when LEARNINGS-*.md exists alongside the CROSS-REVIEW-*.md",
    "bash",
    ["PROP-COMPAT-05: guard-harvest-before-delete.sh's allow-through behaviour when LEARNINGS-*.md exists"],
    () => {
      // Create a LEARNINGS file in the same dir
      writeFileSync(
        join(tmpDir, "LEARNINGS-my-feature.md"),
        "# Learnings\nSome learnings.\n"
      );

      const crossReviewPath = join(tmpDir, "CROSS-REVIEW-pm-review-TSPEC.md");
      const toolInput = JSON.stringify({
        tool_input: { command: `rm ${crossReviewPath}` },
      });

      const { exitCode } = runHookScript(GUARD_HARVEST_SCRIPT, toolInput, {
        cwd: tmpDir,
        env: { CLAUDE_PROJECT_DIR: tmpDir },
      });

      // LEARNINGS exists → guard should allow (exit 0)
      expect(exitCode).toBe(0);
    }
  );

  itOrSkip(
    "exits non-zero when trying to delete CODE_REVIEW-*.md and no LEARNINGS-*.md exists",
    "bash",
    ["PROP-COMPAT-05: guard-harvest-before-delete.sh's blocking behaviour for CODE_REVIEW-*.md"],
    () => {
      const codeReviewPath = join(tmpDir, "CODE_REVIEW-my-feature-v1.md");
      writeFileSync(codeReviewPath, "# Code Review\nDoD findings.\n");
      const toolInput = JSON.stringify({
        tool_input: { command: `rm ${codeReviewPath}` },
      });

      const { exitCode, stderr } = runHookScript(GUARD_HARVEST_SCRIPT, toolInput, {
        cwd: tmpDir,
        env: { CLAUDE_PROJECT_DIR: tmpDir },
      });

      expect(exitCode).not.toBe(0);
      expect(stderr).toContain("pdlc guard");
    }
  );
});

// ─── PROP-COMPAT-06: check-req-size.sh soft threshold ────────────────────────
//
// R-5 of POSTMORTEM-R-pdlc-rcv-budget-stop: proximity to the size budget must be
// reported at authoring time, not filed as a Low at review time. The hook warns at
// 90% of each hard limit (630 lines / 55296 bytes) and names relocation to
// docs/_constraints/ as the remedy; the hard-limit behaviour is unchanged.

describe("PROP-COMPAT-06: check-req-size.sh warns at the 90% soft threshold", () => {
  const CHECK_REQ_SIZE_SCRIPT = join(HOOKS_DIR, "check-req-size.sh");

  let tmpDir;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "pdlc-compat-06-"));
  });

  afterEach(() => {
    try {
      rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // best-effort cleanup
    }
  });

  /**
   * Writes a REQ fixture of `lines` lines, each `width` bytes wide including its newline.
   * @returns {string} absolute path to the fixture
   */
  function writeReq(name, lines, width) {
    const file = join(tmpDir, name);
    writeFileSync(file, ("y".repeat(width - 1) + "\n").repeat(lines));
    return file;
  }

  /** Runs the hook over `file` and returns its advisory text ("" when silent). */
  function advisoryFor(file) {
    const { exitCode, stdout } = runHookScript(
      CHECK_REQ_SIZE_SCRIPT,
      JSON.stringify({ tool_input: { file_path: file } }),
      { cwd: tmpDir }
    );
    // The hook is advisory: it never blocks.
    expect(exitCode).toBe(0);
    if (stdout.trim() === "") return "";
    return JSON.parse(stdout).hookSpecificOutput.additionalContext;
  }

  itOrSkip(
    "is silent below both soft thresholds",
    "bash",
    ["PROP-COMPAT-06: check-req-size.sh's silent behaviour below both soft thresholds"], () => {
    // 630 lines x 80 bytes = 50,400 bytes — exactly at the soft line threshold, under it in bytes.
    expect(advisoryFor(writeReq("REQ-under.md", 630, 80))).toBe("");
  });

  itOrSkip(
    "warns and names docs/_constraints/ when the soft line threshold is exceeded",
    "bash",
    ["PROP-COMPAT-06: check-req-size.sh's soft-line-threshold advisory"],
    () => {
      // 640 lines x 80 bytes = 51,200 bytes — over 630 lines, under both hard limits.
      const msg = advisoryFor(writeReq("REQ-softlines.md", 640, 80));
      expect(msg).toContain("640 lines");
      expect(msg).toContain("90%");
      expect(msg).toContain("docs/_constraints/");
      // Not the hard-limit message.
      expect(msg).not.toContain("Split it into phased REQs");
    }
  );

  itOrSkip(
    "warns when the soft byte threshold is exceeded even with few lines",
    "bash",
    ["PROP-COMPAT-06: check-req-size.sh's soft-byte-threshold advisory"],
    () => {
      // 300 lines x 190 bytes = 57,000 bytes — over 55,296 bytes, under 61,440.
      const msg = advisoryFor(writeReq("REQ-softbytes.md", 300, 190));
      expect(msg).toContain("57000 bytes");
      expect(msg).toContain("docs/_constraints/");
      expect(msg).not.toContain("Split it into phased REQs");
    }
  );

  itOrSkip(
    "keeps the hard-limit message unchanged",
    "bash",
    ["PROP-COMPAT-06: check-req-size.sh's hard-limit message is unaffected by the soft-threshold change"], () => {
    // 720 lines x 100 bytes = 72,000 bytes — over both hard limits.
    const msg = advisoryFor(writeReq("REQ-hard.md", 720, 100));
    expect(msg).toContain("over the REQ size budget");
    expect(msg).toContain("Split it into phased REQs");
    expect(msg).not.toContain("90%");
  });
});

// ---------------------------------------------------------------------------------------------
// PLAN T09/T10 — hook manifest post-sweep (FSPEC L-4, TSPEC §4.4/§5.3).
//
// L-4's post-sweep expectation: pdlc/hooks/hooks.json's registered {event, script} pairs
// set-equal exactly four rows once check-workflow-drift.sh (M-3) is retired — a set-equality,
// not a mere "still contains the survivors" subset check, so deleting the whole SessionStart
// event (and silently losing the consolidation-nudge hook with it, REQ AC-1.7/O-1) fails this
// test exactly as loudly as leaving check-workflow-drift.sh in place would.
//
// Committed skipped (red-verified) under T09; T10 deletes the script and its hooks.json entry
// and un-skips this block, per PLAN §1.3's skip-naming convention (title begins "T10: ").
// ---------------------------------------------------------------------------------------------

/** Every {event, script} pair currently registered in pdlc/hooks/hooks.json. */
function registeredHookPairs() {
  const manifest = JSON.parse(readFileSync(HOOKS_JSON_PATH, "utf8"));
  const pairs = [];
  for (const [event, entries] of Object.entries(manifest.hooks || {})) {
    for (const entry of entries) {
      for (const hook of entry.hooks || []) {
        const script = String(hook.command || "").split("/").pop();
        pairs.push(`${event}:${script}`);
      }
    }
  }
  return pairs.sort();
}

/** True if `relPath` (repo-root-relative) is tracked by git; false if untracked/absent. */
function isTracked(relPath) {
  try {
    const out = spawnSync("git", ["ls-files", "--error-unmatch", relPath], {
      cwd: REPO_ROOT,
      encoding: "utf8",
    });
    return out.status === 0;
  } catch {
    return false;
  }
}

describe("PLAN T09/T10 — hook manifest post-sweep (FSPEC L-4)", () => {
  it(
    "T10: pdlc/hooks/hooks.json registers exactly FSPEC L-4's four post-sweep {event, script} pairs, and check-workflow-drift.sh is untracked",
    () => {
      const EXPECTED_PAIRS = [
        "PreToolUse:guard-harvest-before-delete.sh",
        "PostToolUse:check-scope-field.sh",
        "PostToolUse:check-req-size.sh",
        "SessionStart:nudge-consolidation.sh",
      ].sort();

      expect(registeredHookPairs()).toEqual(EXPECTED_PAIRS);
      expect(isTracked("pdlc/hooks/scripts/check-workflow-drift.sh")).toBe(false);
    }
  );
});

// ---------------------------------------------------------------------------------------------
// PLAN T11/T12 — shell surface post-sweep (FSPEC L-9)
//
// L-9's third gate command (`bash -n` over tracked `*.sh`, discovered via `git ls-files '*.sh'`)
// only ever sees scripts git still tracks. Once sync-workflows.sh (M-1) and lib/pdlc-drift.sh
// (M-2) are untracked, that discovery set silently narrows to the surviving scripts with no
// separate assertion needed on the gate command itself — this test asserts the narrowing input
// directly: both paths are untracked, and neither is named by `git ls-files '*.sh'`.
//
// Committed skipped (red-verified) under T11; T12 deletes both files and un-skips this block,
// per PLAN §1.3's skip-naming convention (title begins "T12: ").
// ---------------------------------------------------------------------------------------------
describe("PLAN T11/T12 — shell surface post-sweep (FSPEC L-9)", () => {
  it(
    "T12: sync-workflows.sh and lib/pdlc-drift.sh are untracked, and git ls-files '*.sh' names neither",
    () => {
      expect(isTracked("pdlc/hooks/scripts/sync-workflows.sh")).toBe(false);
      expect(isTracked("pdlc/hooks/scripts/lib/pdlc-drift.sh")).toBe(false);

      const shFiles = spawnSync("git", ["ls-files", "*.sh"], {
        cwd: REPO_ROOT,
        encoding: "utf8",
      })
        .stdout.split("\n")
        .filter(Boolean);

      expect(shFiles).not.toContain("pdlc/hooks/scripts/sync-workflows.sh");
      expect(shFiles).not.toContain("pdlc/hooks/scripts/lib/pdlc-drift.sh");
    }
  );
});
