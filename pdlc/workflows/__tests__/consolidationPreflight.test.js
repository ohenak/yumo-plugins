// consolidationPreflight.test.js — PLAN T00 (batch 1, no deps).
//
// Pre-flight gate for the pdlc-consolidation-agent feature. PLAN §3 lists
// every BL-PREREQ this feature's later tasks depend on: a symbol absent at
// HEAD would fail a downstream task for a reason indistinguishable from that
// task's own bug. This file asserts EXISTENCE ONLY — never the shape a later
// task creates (not `resolveAdvisoryRung`'s `skill` parameter, not
// `rtConsInjections`, not the scan sets' new members). It also records
// `gitWithLockRetry`'s missing `export` as scheduled-blocking work (T11),
// not as something this task promotes itself.
//
// This task creates no production code.

import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import * as devModule from "../orchestrate-dev.js";
import { parseImplementationConfig, IMPLEMENTATION_DEFAULTS } from "../orchestrate-dev.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..", "..");

const DEV_SOURCE = readFileSync(join(__dirname, "..", "orchestrate-dev.js"), "utf8");
const ADAPTER_SOURCE = readFileSync(join(__dirname, "..", "runtime-adapter.js"), "utf8");
const BUILD_SOURCE = readFileSync(join(__dirname, "..", "build-runtime.mjs"), "utf8");
const BUNDLE_TEST_SOURCE = readFileSync(
  join(__dirname, "runtimeBundle.test.js"),
  "utf8"
);
const VOCAB_SOURCE = readFileSync(
  join(REPO_ROOT, "docs", "_constraints", "pdlc-consolidation-vocabularies.md"),
  "utf8"
);

// ---------------------------------------------------------------------------
// 1. orchestrate-dev.js — exported symbols, resolved by import.
// ---------------------------------------------------------------------------

describe("T00 — BL-PREREQ: orchestrate-dev.js exported symbols", () => {
  test.each([
    ["resolveAdvisoryRung", devModule],
    ["mergeCommandFor", devModule],
    ["MERGE_GUARD_DEFAULTS", devModule],
  ])("%s is exported and importable", (name, mod) => {
    expect(mod[name]).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// 2. orchestrate-dev.js — module-private symbols, source-text presence only.
// ---------------------------------------------------------------------------

describe("T00 — BL-PREREQ: orchestrate-dev.js source-text presence", () => {
  test("gitWithLockRetry is declared, without export (T11 adds the keyword)", () => {
    expect(DEV_SOURCE).toMatch(/\basync function gitWithLockRetry\s*\(/);
    // Scheduled-blocking, recorded here rather than promoted: no `export`
    // keyword precedes the declaration today.
    expect(DEV_SOURCE).not.toMatch(/\bexport\s+async function gitWithLockRetry\s*\(/);
  });

  test("ADVISORY_RUNG_SKILL is declared", () => {
    expect(DEV_SOURCE).toMatch(/\bADVISORY_RUNG_SKILL\s*=/);
  });
});

// ---------------------------------------------------------------------------
// 3. runtime-adapter.js — seven functions, source-text presence (the file
//    is inlined by the build and exports nothing an import could resolve).
// ---------------------------------------------------------------------------

describe("T00 — BL-PREREQ: runtime-adapter.js source-text presence", () => {
  test.each([
    ["rtWriteFile", /\basync function rtWriteFile\s*\(/],
    ["rtCheckFile", /\basync function rtCheckFile\s*\(/],
    ["rtAppendFile", /\basync function rtAppendFile\s*\(/],
    ["rtListFiles", /\basync function rtListFiles\s*\(/],
    ["rtGit", /\basync function rtGit\s*\(/],
    ["rtShellQuote", /\bfunction rtShellQuote\s*\(/],
    ["rtDevInjections", /\bfunction rtDevInjections\s*\(/],
  ])("%s is present in source", (_name, pattern) => {
    expect(ADAPTER_SOURCE).toMatch(pattern);
  });
});

// ---------------------------------------------------------------------------
// 4. build-runtime.mjs — five declarations, source-text presence.
// ---------------------------------------------------------------------------

describe("T00 — BL-PREREQ: build-runtime.mjs source-text presence", () => {
  test.each([
    ["stripModuleSyntax", /\bfunction stripModuleSyntax\s*\(/],
    ["wrapModule", /\bfunction wrapModule\s*\(/],
    ["QUEUE_META", /\bconst QUEUE_META\s*=/],
    ["QUEUE_ENTRY", /\bconst QUEUE_ENTRY\s*=/],
    ["bundles", /\bconst bundles\s*=/],
  ])("%s is present in source", (_name, pattern) => {
    expect(BUILD_SOURCE).toMatch(pattern);
  });
});

// ---------------------------------------------------------------------------
// 5. runtimeBundle.test.js — two frozen scan sets, source-text presence,
//    plus the negative half T13 turns positive: neither set carries this
//    feature's new members today.
// ---------------------------------------------------------------------------

describe("T00 — BL-PREREQ: runtimeBundle.test.js scan sets", () => {
  test("AT19_SEAM_NAMES is declared", () => {
    expect(BUNDLE_TEST_SOURCE).toMatch(/\bconst AT19_SEAM_NAMES\s*=/);
  });

  test("AWAIT_SCAN_SOURCES is declared", () => {
    expect(BUNDLE_TEST_SOURCE).toMatch(/\bconst AWAIT_SCAN_SOURCES\s*=/);
  });

  test("neither scan set carries this feature's new members yet", () => {
    expect(BUNDLE_TEST_SOURCE).not.toContain("consolidate-learnings.js");
    expect(BUNDLE_TEST_SOURCE).not.toContain("_envPresent");
    expect(BUNDLE_TEST_SOURCE).not.toContain("_makeTempDir");
  });
});

// ---------------------------------------------------------------------------
// 6. Shipped test-double helpers — imported, resolved by import.
// ---------------------------------------------------------------------------

describe("T00 — BL-PREREQ: shipped test-double helpers", () => {
  test("seams.js exports fakeFs, fakeListFiles, fakeGit, LIST_FAILURE_VALUES", async () => {
    const seams = await import("./helpers/seams.js");
    expect(seams.fakeFs).toBeDefined();
    expect(seams.fakeListFiles).toBeDefined();
    expect(seams.fakeGit).toBeDefined();
    expect(seams.LIST_FAILURE_VALUES).toBeDefined();
  });

  test("mergeDoubles.js exports fakeGhRun, matchKey, fakeNow, FIXED_NOW_MS, fakeSleep, GH_SURFACE_NAMES", async () => {
    const mergeDoubles = await import("./helpers/mergeDoubles.js");
    expect(mergeDoubles.fakeGhRun).toBeDefined();
    expect(mergeDoubles.matchKey).toBeDefined();
    expect(mergeDoubles.fakeNow).toBeDefined();
    expect(mergeDoubles.FIXED_NOW_MS).toBeDefined();
    expect(mergeDoubles.fakeSleep).toBeDefined();
    expect(mergeDoubles.GH_SURFACE_NAMES).toBeDefined();
  });

  test("advisoryDoubles.js exports makeAgentDouble", async () => {
    const advisoryDoubles = await import("./helpers/advisoryDoubles.js");
    expect(advisoryDoubles.makeAgentDouble).toBeDefined();
  });

  test("driftGenerators.js exports seeded, resolveSeed", async () => {
    const driftGenerators = await import("./helpers/driftGenerators.js");
    expect(driftGenerators.seeded).toBeDefined();
    expect(driftGenerators.resolveSeed).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// 7. pdlc-consolidation-vocabularies.md — Version cell, read directly.
// ---------------------------------------------------------------------------

describe("T00 — BL-PREREQ: pdlc-consolidation-vocabularies.md Version cell", () => {
  test("Version cell reads 1.4", () => {
    expect(VOCAB_SOURCE).toMatch(/\|\s*Version\s*\|\s*1\.4\s*·/);
  });
});

// ---------------------------------------------------------------------------
// 8. .claude/pdlc.config.json — branch on presence, positive assertion in
//    both arms (PLAN §3). Neither arm is vacuous and neither depends on the
//    operator's tracking decision: this repo's CI matrix runs the absent
//    arm (the file is untracked), the maintainer's tree runs the present
//    arm, and this suite runs whichever the executing tree actually has.
// ---------------------------------------------------------------------------

describe("T00 — .claude/pdlc.config.json presence gate", () => {
  test("branches on presence and asserts a positive either way", () => {
    const configPath = join(REPO_ROOT, ".claude", "pdlc.config.json");

    if (existsSync(configPath)) {
      // File present: the two settings §2's dist rule depends on.
      const raw = readFileSync(configPath, "utf8");
      const parsed = JSON.parse(raw);
      const postWavePathspecs = parsed?.implementation?.postWavePathspecs ?? [];
      const postWaveCommand = parsed?.implementation?.postWaveCommand ?? "";

      expect(postWavePathspecs).toContain("pdlc/workflows/dist/");
      expect(postWaveCommand).toBe("node pdlc/workflows/build-runtime.mjs");
    } else {
      // File absent (fresh CI clone): the documented degradation fires
      // instead — Phase I falls back to the legacy self-report gate,
      // asserted through the shipped parser rather than skipped.
      const result = parseImplementationConfig(null);
      expect(result).toEqual({
        config: IMPLEMENTATION_DEFAULTS,
        sectionMalformed: false,
        invalidKeys: [],
      });
      expect(result.config.testCommand).toBeNull();
    }
  });
});
