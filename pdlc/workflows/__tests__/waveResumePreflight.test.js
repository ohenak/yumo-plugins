// waveResumePreflight.test.js — T-01 (batch 1, gate only, no production
// source). Pre-flight gate (BL-PREREQ) plus the run-precondition gate
// (round-1 F-02).
//
// Two permanent obligations:
//
// (a) Baseline existence at HEAD — asserted present, nothing more, never
//     the new shape T-02 creates: `WAVE_STATE_PATH`, `parseWaveLedger`,
//     `computePlanHash`, `formatWaveLedger`, `IMPLEMENTATION_DEFAULTS`
//     exported from `orchestrate-dev.js`; `docs/_constraints/pdlc-wave-gate-
//     baseline.md` tracked; `pdlc/workflows/package.json` carrying
//     `test:coverage`, `c8` and `fast-check`. No `.gitignore` arm here —
//     AT-14's ignore-rule conjunct belongs to T-03 in its strict form
//     (round-1 F-09).
//
// (b) The gate is script-owned (round-1 F-02) — `.claude/pdlc.config.json`'s
//     resolved `implementation.testCommand` **string-equals** the literal
//     transcribed in PLAN §3.4. The file is untracked, so the arm is
//     guarded: absent ⇒ assert `process.env.GITHUB_ACTIONS === "true"` (a
//     fresh CI clone legitimately has no consumer config).
//
// Lifecycle (round-1 F-09): permanent, not tautological — reds if a later
// change removes a symbol this feature's classifier depends on, and reds on
// config drift before any wave is dispatched.

import { existsSync, readFileSync } from "fs";
import { execFileSync } from "child_process";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

import {
  WAVE_STATE_PATH,
  parseWaveLedger,
  computePlanHash,
  formatWaveLedger,
  IMPLEMENTATION_DEFAULTS,
} from "../orchestrate-dev.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const WORKFLOWS = resolve(HERE, "..");
const REPO_ROOT = resolve(WORKFLOWS, "../..");

// §3.4's transcribed literal — the exact resolved value of
// `implementation.testCommand` in `.claude/pdlc.config.json`.
const EXPECTED_TEST_COMMAND =
  "(cd pdlc/engine && npm test) && cd pdlc/workflows && npm test -- --testPathIgnorePatterns '/node_modules/' '/__tests__/helpers/' '/__tests__/fixtures/'";

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: "utf8", ...opts });
}

function isTracked(relPathFromRoot) {
  try {
    run("git", ["ls-files", "--error-unmatch", relPathFromRoot], { cwd: REPO_ROOT });
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// (a) Baseline existence at HEAD — orchestrate-dev.js exports
// ---------------------------------------------------------------------------

describe("BL-PREREQ: orchestrate-dev.js exports the wave-resume baseline symbols", () => {
  test("WAVE_STATE_PATH is present and importable", () => {
    expect(WAVE_STATE_PATH).toBeDefined();
  });

  test("parseWaveLedger is present and importable", () => {
    expect(parseWaveLedger).toBeDefined();
  });

  test("computePlanHash is present and importable", () => {
    expect(computePlanHash).toBeDefined();
  });

  test("formatWaveLedger is present and importable", () => {
    expect(formatWaveLedger).toBeDefined();
  });

  test("IMPLEMENTATION_DEFAULTS is present and importable", () => {
    expect(IMPLEMENTATION_DEFAULTS).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// (a) Baseline existence at HEAD — the constraints doc and package.json keys
// ---------------------------------------------------------------------------

describe("BL-PREREQ: docs/_constraints/pdlc-wave-gate-baseline.md is tracked", () => {
  test("the file exists on disk", () => {
    expect(existsSync(join(REPO_ROOT, "docs/_constraints/pdlc-wave-gate-baseline.md"))).toBe(true);
  });

  test("the file is tracked by git", () => {
    expect(isTracked("docs/_constraints/pdlc-wave-gate-baseline.md")).toBe(true);
  });
});

describe("BL-PREREQ: pdlc/workflows/package.json carries the coverage-gate manifest keys", () => {
  const pkg = JSON.parse(readFileSync(join(WORKFLOWS, "package.json"), "utf8"));

  test("scripts.test:coverage is present", () => {
    expect(pkg.scripts).toBeDefined();
    expect(pkg.scripts["test:coverage"]).toBeDefined();
  });

  test("c8 is present as a dependency", () => {
    const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    expect(deps.c8).toBeDefined();
  });

  test("fast-check is present as a dependency", () => {
    const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    expect(deps["fast-check"]).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// (b) Run-precondition gate — the gate is script-owned (round-1 F-02)
// ---------------------------------------------------------------------------

describe("run-precondition: .claude/pdlc.config.json resolves the script-owned test command", () => {
  const configPath = join(REPO_ROOT, ".claude/pdlc.config.json");

  test("testCommand string-equals the §3.4 transcribed literal, or CI supplies the guard", () => {
    if (!existsSync(configPath)) {
      // The file is untracked and consumer-local: a fresh CI clone
      // legitimately has no consumer config. Locally, a missing config must
      // still red rather than pass vacuously.
      expect(process.env.GITHUB_ACTIONS).toBe("true");
      return;
    }

    const config = JSON.parse(readFileSync(configPath, "utf8"));
    expect(config.implementation).toBeDefined();
    expect(config.implementation.testCommand).toBe(EXPECTED_TEST_COMMAND);
  });
});
