// loopBaselinePreflight.test.js — PLAN P0-00 (batch 1, no deps).
//
// Pre-flight gate: assert every BL-PREREQ symbol this feature (§Overview,
// "Prior-phase baseline (BL-PREREQ)") extends is importable / present at
// HEAD, existence only — never the new shape a later task creates.
//
// `ESCALATIONS_PATH` (orchestrate-dev.js) and `VENDOR_ROOT` (run.mjs) are
// deliberately NOT asserted here: both are module-private `const`s at HEAD
// with no `export`, so asserting importability would red this gate (see
// PLAN §Overview).

import * as devModule from "../orchestrate-dev.js";
import * as queueModule from "../orchestrate-queue.js";
import * as consolidateModule from "../consolidate-learnings.js";
import * as startupModule from "../../engine/lib/startup.mjs";
import cliModule from "../../engine/bin/cli.mjs";

describe("P0-00 — BL-PREREQ baseline symbols exist at HEAD", () => {
  // Named exports — resolved by import. A missing one fails this assertion
  // (or, for a named static import, fails module load entirely — the same
  // fail-closed signal).
  test.each([
    ["renderEscalationEntry", devModule],
    ["appendEscalationEntry", devModule],
    ["MERGE_ESCALATIONS", devModule],
    ["MERGE_GUARD_DEFAULTS", devModule],
    ["effectiveGuardPaths", devModule],
    ["ADVISORY_SEAMS", devModule],
    ["MERGE_CONFIG_PATH", devModule],
    ["precheckDependencies", queueModule],
    ["parseEscalations", consolidateModule],
    ["runStartupChecks", startupModule],
    ["formatStartup", startupModule],
  ])("%s is exported and importable", (name, mod) => {
    expect(mod[name]).toBeDefined();
  });

  // `orchestrate-queue.js`'s `main` is a default export, not a named one
  // (advisoryPreflight.test.js / advisoryQueueSeams.test.js precedent:
  // `queueModule.default`).
  test("main (default export) is exported and importable", () => {
    expect(queueModule.default).toBeDefined();
  });

  // `defaultDeps.startupFor` — a property of the `defaultDeps` default
  // export object from `pdlc/engine/bin/cli.mjs`.
  test("defaultDeps.startupFor is exported and importable", () => {
    expect(cliModule).toBeDefined();
    expect(cliModule.startupFor).toBeDefined();
    expect(typeof cliModule.startupFor).toBe("function");
  });
});
