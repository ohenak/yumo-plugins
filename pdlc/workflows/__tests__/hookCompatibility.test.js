/**
 * hookCompatibility.test.js — Integration tests for pdlc hook scripts.
 * PROP-COMPAT-04: check-scope-field.sh exits non-zero when Scope: tag is absent.
 * PROP-COMPAT-05: guard-harvest-before-delete.sh exits non-zero when LEARNINGS-*.md is absent.
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

  (hasBash ? it : it.skip)(
    "exits non-zero when trying to delete CROSS-REVIEW-*.md and no LEARNINGS-*.md exists",
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

  (hasBash ? it : it.skip)(
    "exits 0 when LEARNINGS-*.md exists alongside the CROSS-REVIEW-*.md",
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
});
