// advisoryBundle.test.js — PLAN A-14 (batch 3, depends on A-02); retargeted by PLAN T19
// (pdlc-plugin-retirement, M-11p) once DEC-02 retired the workflow-runtime bundler.
//
// ORIGINAL premise (pre-retirement): `orchestrate-dev.js`'s advisory core was reached from
// `orchestrate-queue.js` only through a shared `__dev` IIFE that `build-runtime.mjs` produced by
// inlining both modules' stripped bodies into hand-authored `.bundle.js` artifacts (real ES
// `import`/`export` could not survive the Claude Code workflow runtime's loader). This file's
// original obligation was a build-time regression proof: that A-32's edit to the dev module's
// export list and the queue module's prelude stayed additive across that inlining.
//
// pdlc-plugin-retirement (DEC-02) deleted that inlining path outright: `build-runtime.mjs` no
// longer builds a dev bundle or a queue bundle (`pdlc/workflows/dist/` now emits only
// `pdlc-cli.mjs`), and pipeline execution now runs the canonical modules directly as real ES
// modules under Node (`pdlc/engine`, vendoring `pdlc/workflows/*.js` unmodified). `orchestrate-
// queue.js` reaches the advisory core through an ordinary `import { ... } from "./orchestrate-
// dev.js"` — the reachability question A-32 answered by construction is no longer a build-time
// concern at all, so the paren-balance `wrapModule()` extraction and the shipped-bundle /
// distribution-manifest structural checks this file used to carry are gone (baseline M-11p: "the
// dev module's export-list and queue module's prelude wrapModule() tests, `SHIPPED_BUNDLES`
// structural-constraint tests, and the four-row manifest test — all bundle-era, all removed").
//
// What survives is the regression this file still owes PLAN A-32: the advisory core's names stay
// reachable end to end. Under the real-import architecture that means (1) `orchestrate-dev.js`
// still `export`s every one of them (source-text presence, not shape), and (2) `orchestrate-
// queue.js`'s own top-level `import` line still names every one of them — the exact two facts
// that jointly make the names reachable now that there is no bundler standing between the files.

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKFLOWS_DIR = join(__dirname, "..");

const DEV_SOURCE = readFileSync(join(WORKFLOWS_DIR, "orchestrate-dev.js"), "utf8");
const QUEUE_SOURCE = readFileSync(join(WORKFLOWS_DIR, "orchestrate-queue.js"), "utf8");

// TSPEC §2.2's placement decision plus §2.3's example code — the advisory core's six names, plus
// `commitPaths`, the one pre-existing module-private symbol §6.4.1's A2 `verifyGate` needs and
// that gained a real `export` keyword for it (A-17).
const ADVISORY_BUNDLE_NAMES = [
  "runAdvisorySeam",
  "parseAdvisoryConfig",
  "readAdvisoryConfigSafely",
  "resolveAdvisoryRung",
  "advisorySummaryRows",
  "ADVISORY_DEFAULTS",
  "commitPaths",
];

describe("PLAN A-32 — orchestrate-dev.js exports the advisory surface", () => {
  test.each(ADVISORY_BUNDLE_NAMES)('"%s" is declared with a real `export`', (name) => {
    const exportRe = new RegExp(
      `\\bexport\\s+(async\\s+function|function|const)\\s+${name}\\b`,
    );
    expect(DEV_SOURCE).toMatch(exportRe);
  });
});

// The subset of ADVISORY_BUNDLE_NAMES orchestrate-queue.js actually calls directly (it drives
// runAdvisorySeam's A5 dispatch and reports through advisorySummaryRows; resolveAdvisoryRung and
// ADVISORY_DEFAULTS stay orchestrate-dev.js-internal, reached only through runAdvisorySeam /
// parseAdvisoryConfig, so the queue module has no reason to import them by name).
const QUEUE_IMPORTED_ADVISORY_NAMES = ADVISORY_BUNDLE_NAMES.filter(
  (name) => name !== "resolveAdvisoryRung" && name !== "ADVISORY_DEFAULTS",
);

describe("PLAN A-32 — orchestrate-queue.js imports the advisory surface it calls directly", () => {
  const importLine = QUEUE_SOURCE.split("\n").find((line) =>
    /^import\s.+from\s+["']\.\/orchestrate-dev\.js["'];?\s*$/.test(line.trim()),
  );

  it("the top-level import from orchestrate-dev.js is present", () => {
    expect(importLine).toBeDefined();
  });

  test.each(QUEUE_IMPORTED_ADVISORY_NAMES)('the import names "%s"', (name) => {
    expect(importLine).toMatch(new RegExp(`\\b${name}\\b`));
  });

  it("the pre-existing realMain / main import survives untouched", () => {
    expect(QUEUE_SOURCE).toMatch(/import\s+realMain\s*,\s*\{/);
  });
});
