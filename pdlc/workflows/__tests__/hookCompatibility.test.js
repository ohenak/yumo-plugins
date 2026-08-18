/**
 * hookCompatibility.test.js — Integration tests for pdlc hook scripts.
 * PROP-COMPAT-04: check-scope-field.sh exits non-zero when Scope: tag is absent.
 * PROP-COMPAT-05: guard-harvest-before-delete.sh exits non-zero when LEARNINGS-*.md is absent.
 *
 * These tests invoke the hook scripts directly as child processes.
 * Skipped on platforms where bash is not available.
 */

import { execSync, spawnSync } from "child_process";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "fs";
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

  (hasBash ? it : it.skip)(
    "exits non-zero when trying to delete CODE_REVIEW-*.md and no LEARNINGS-*.md exists",
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

// ─── C7: hooks.json SessionStart registration for check-workflow-drift.sh ────
// FSPEC §5.1 (BL-03): pdlc/hooks/hooks.json gains a SECOND SessionStart entry
// invoking check-workflow-drift.sh through the same ${CLAUDE_PLUGIN_ROOT} form
// the three shipped hooks use. The pre-existing nudge-consolidation.sh entry
// is left unchanged. RED until L-04 registers the second entry.
describe.skip("C7: hooks.json registers check-workflow-drift.sh as a second SessionStart hook — held under T16: registration removed by T10, block deleted by T16", () => {
  // __dirname = pdlc/workflows/__tests__; go up two levels to pdlc/, then hooks.json
  const HOOKS_JSON_PATH = resolve(__dirname, "../../hooks/hooks.json");

  function readHooksJson() {
    const raw = readFileSync(HOOKS_JSON_PATH, "utf8");
    return JSON.parse(raw);
  }

  it("leaves the existing nudge-consolidation.sh SessionStart entry unchanged", () => {
    const hooks = readHooksJson();
    const sessionStart = hooks.hooks.SessionStart;
    expect(Array.isArray(sessionStart)).toBe(true);
    expect(sessionStart[0].hooks[0].command).toBe(
      '"${CLAUDE_PLUGIN_ROOT}"/hooks/scripts/nudge-consolidation.sh'
    );
  });

  it("registers a second SessionStart entry invoking check-workflow-drift.sh via the same ${CLAUDE_PLUGIN_ROOT} form", () => {
    const hooks = readHooksJson();
    const sessionStart = hooks.hooks.SessionStart;
    expect(sessionStart.length).toBeGreaterThanOrEqual(2);

    const driftEntry = sessionStart.find((entry) =>
      entry.hooks.some((h) => h.command.includes("check-workflow-drift.sh"))
    );
    expect(driftEntry).toBeDefined();

    const driftCommand = driftEntry.hooks.find((h) =>
      h.command.includes("check-workflow-drift.sh")
    ).command;
    expect(driftCommand).toBe(
      '"${CLAUDE_PLUGIN_ROOT}"/hooks/scripts/check-workflow-drift.sh'
    );
  });
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

  (hasBash ? it : it.skip)("is silent below both soft thresholds", () => {
    // 630 lines x 80 bytes = 50,400 bytes — exactly at the soft line threshold, under it in bytes.
    expect(advisoryFor(writeReq("REQ-under.md", 630, 80))).toBe("");
  });

  (hasBash ? it : it.skip)(
    "warns and names docs/_constraints/ when the soft line threshold is exceeded",
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

  (hasBash ? it : it.skip)(
    "warns when the soft byte threshold is exceeded even with few lines",
    () => {
      // 300 lines x 190 bytes = 57,000 bytes — over 55,296 bytes, under 61,440.
      const msg = advisoryFor(writeReq("REQ-softbytes.md", 300, 190));
      expect(msg).toContain("57000 bytes");
      expect(msg).toContain("docs/_constraints/");
      expect(msg).not.toContain("Split it into phased REQs");
    }
  );

  (hasBash ? it : it.skip)("keeps the hard-limit message unchanged", () => {
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
  it.skip(
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
