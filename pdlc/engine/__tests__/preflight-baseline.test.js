// P1-00 pre-flight gate over the BL-PREREQ symbols this feature extends, in
// two halves with two different oracles — existence only, never shape (PLAN
// T01, TE round-1 F-06).
//
// (a) Exported half: asserted by a real `import` plus `typeof === "function"`
//     (or `!== undefined` for non-function bindings). These symbols are
//     exported at HEAD; a literal import assertion over them is meaningful.
//
// (b) Module-internal half: these are *not* exported at HEAD, so a literal
//     import assertion over them would be red forever. Asserted instead by
//     source-anchored presence — the named function declaration exists in
//     the module's source — and stated as such rather than disguised as an
//     import check.
//
// Neither half asserts anything about argument lists, return shapes, or
// behaviour: a later task changing a symbol's shape is that task's business,
// not this gate's.
//
// (c) Pre-flight over the measured baseline (PLAN T01, REQ C-6): every path
//     named in M-1…M-6, M-9, M-10 and the six M-8 helper paths of
//     `docs/_constraints/pdlc-retirement-baseline.md` exists at HEAD
//     (existence only, no shape claim), and that doc's partition-closure
//     line names a commit that is an ancestor of HEAD with swept =
//     classified and remainder = 0.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// ─── (a) exported half ──────────────────────────────────────────────────────

import {
  devInjection,
  queueInjection,
  readEngineConfig,
  WORKFLOW_MODULE_URLS,
  runDev,
  runQueue,
  runQueueLoop,
} from "../lib/run.mjs";

import { resolvePluginRoot } from "../lib/skills.mjs";

import { runStartupChecks } from "../lib/startup.mjs";

import {
  rewriteStatus,
  updateQueueStatus,
  ensureEvidenceColumn,
} from "../../workflows/orchestrate-queue.js";

import {
  commitPaths,
  buildA5SeamOps,
  reviewLoop,
} from "../../workflows/orchestrate-dev.js";

test("BL-PREREQ (a): pdlc/engine/lib/run.mjs exports its seven prerequisite symbols", () => {
  assert.equal(typeof devInjection, "function"); // lib/run.mjs:80
  assert.equal(typeof queueInjection, "function"); // lib/run.mjs:114
  assert.equal(typeof readEngineConfig, "function"); // lib/run.mjs:177
  assert.notEqual(WORKFLOW_MODULE_URLS, undefined); // lib/run.mjs:52
  assert.equal(typeof runDev, "function"); // lib/run.mjs:381
  assert.equal(typeof runQueue, "function"); // lib/run.mjs:422
  assert.equal(typeof runQueueLoop, "function"); // lib/run.mjs:478
});

test("BL-PREREQ (a): pdlc/engine/lib/skills.mjs exports resolvePluginRoot", () => {
  assert.equal(typeof resolvePluginRoot, "function"); // lib/skills.mjs:204
});

test("BL-PREREQ (a): pdlc/engine/lib/startup.mjs exports runStartupChecks", () => {
  assert.equal(typeof runStartupChecks, "function"); // lib/startup.mjs:319
});

test("BL-PREREQ (a): pdlc/workflows/orchestrate-queue.js exports its three prerequisite symbols", () => {
  assert.equal(typeof rewriteStatus, "function"); // orchestrate-queue.js:1522
  assert.equal(typeof updateQueueStatus, "function"); // orchestrate-queue.js:415
  assert.equal(typeof ensureEvidenceColumn, "function"); // orchestrate-queue.js:559
});

test("BL-PREREQ (a): pdlc/workflows/orchestrate-dev.js exports its three prerequisite symbols", () => {
  assert.equal(typeof commitPaths, "function"); // orchestrate-dev.js:10408
  assert.equal(typeof buildA5SeamOps, "function"); // orchestrate-dev.js:2743
  assert.equal(typeof reviewLoop, "function"); // orchestrate-dev.js:6183
});

// ─── (b) module-internal half ───────────────────────────────────────────────
//
// These four symbols are not exported at HEAD. Asserting them via `import`
// would be red forever (TE round-1 F-06), so the oracle here is
// source-anchored presence: the named function declaration is found in the
// module's source text, at (approximately) the cited line.

function sourceOf(relativeToThisFile) {
  return readFileSync(fileURLToPath(new URL(relativeToThisFile, import.meta.url)), "utf8");
}

test("BL-PREREQ (b): orchestrate-dev.js declares module-internal appendApprovalAnchors", () => {
  const source = sourceOf("../../workflows/orchestrate-dev.js");
  assert.match(source, /\bfunction appendApprovalAnchors\b/);
  assert.doesNotMatch(source, /export\s+(async\s+)?function appendApprovalAnchors\b/);
});

test("BL-PREREQ (b): orchestrate-queue.js declares module-internal commitQueueRow", () => {
  const source = sourceOf("../../workflows/orchestrate-queue.js");
  assert.match(source, /\bfunction commitQueueRow\b/);
  assert.doesNotMatch(source, /export\s+(async\s+)?function commitQueueRow\b/);
});

test("BL-PREREQ (b): orchestrate-queue.js declares module-internal commitAdvisoryRecord", () => {
  const source = sourceOf("../../workflows/orchestrate-queue.js");
  assert.match(source, /\bfunction commitAdvisoryRecord\b/);
  assert.doesNotMatch(source, /export\s+(async\s+)?function commitAdvisoryRecord\b/);
});

test("BL-PREREQ (b): orchestrate-queue.js declares module-internal writeEvidenceCarryingRow", () => {
  const source = sourceOf("../../workflows/orchestrate-queue.js");
  assert.match(source, /\bfunction writeEvidenceCarryingRow\b/);
  assert.doesNotMatch(source, /export\s+(async\s+)?function writeEvidenceCarryingRow\b/);
});

// ─── (c) pre-flight over the measured baseline (PLAN T01, REQ C-6) ─────────

function repoPathOf(relativeToThisFile) {
  return fileURLToPath(new URL(relativeToThisFile, import.meta.url));
}

// M-1…M-6, M-9, M-10: the single-file baseline rows (docs/_constraints/
// pdlc-retirement-baseline.md), each a one-file artifact. Existence only.
const BASELINE_M_ROW_PATHS = [
  "../../hooks/scripts/sync-workflows.sh", // M-1
  "../../hooks/scripts/lib/pdlc-drift.sh", // M-2
  "../../hooks/scripts/check-workflow-drift.sh", // M-3
  "../../workflows/dist/orchestrate-dev.bundle.js", // M-4
  "../../workflows/dist/orchestrate-queue.bundle.js", // M-5
  "../../workflows/dist/distribution-manifest.json", // M-6
  "../../workflows/dist/pdlc-cli.mjs", // M-9
  "../../workflows/dist/consolidate-learnings.bundle.js", // M-10
];

// M-8's six dedicated helper paths (the ones that exist only to serve M-8's
// candidate test modules — NOT `driftGenerators.js`, `driftCapabilities.js`,
// or `driftOrdering.js`, which the baseline doc excludes from the six).
const BASELINE_M8_HELPER_PATHS = [
  "../../workflows/__tests__/helpers/driftFixtures.js",
  "../../workflows/__tests__/helpers/driftHarness.js",
  "../../workflows/__tests__/helpers/driftProbe.js",
  "../../workflows/__tests__/helpers/bin/backup-grammar.sh",
  "../../workflows/__tests__/helpers/bin/lib-probe.sh",
  "../../workflows/__tests__/helpers/bin/percent-encode-driver.sh",
];

test("T01 pre-flight: every M-1…M-6, M-9, M-10 and M-8-helper path in the measured baseline exists at HEAD", () => {
  for (const relativePath of [...BASELINE_M_ROW_PATHS, ...BASELINE_M8_HELPER_PATHS]) {
    const absolutePath = repoPathOf(relativePath);
    assert.ok(existsSync(absolutePath), `expected baseline path to exist: ${relativePath}`);
  }
});

test("T01 pre-flight: the baseline doc's partition-closure line names a commit ancestor of HEAD with swept = classified and remainder = 0", () => {
  const baselineDoc = readFileSync(
    repoPathOf("../../../docs/_constraints/pdlc-retirement-baseline.md"),
    "utf8",
  );

  const closureMatch = baselineDoc.match(
    /\*\*Partition closed at commit `([0-9a-f]+)`, [0-9-]+\.\*\*/,
  );
  assert.ok(closureMatch, "expected a '**Partition closed at commit `<sha>`...**' line");
  const closureCommit = closureMatch[1];

  // The named commit must be an ancestor of HEAD (T-1, REQ C-6): the sweep
  // that closed the partition must have run at or before this checkout.
  assert.doesNotThrow(
    () =>
      execFileSync("git", ["merge-base", "--is-ancestor", closureCommit, "HEAD"], {
        cwd: repoPathOf("../../.."),
      }),
    `expected ${closureCommit} to be an ancestor of HEAD`,
  );

  const countsMatch = baselineDoc.match(
    /(\d+) swept paths, (\d+) classified, remainder empty/,
  );
  assert.ok(countsMatch, "expected a '<N> swept paths, <N> classified, remainder empty' line");
  const [, sweptCount, classifiedCount] = countsMatch;
  assert.equal(sweptCount, classifiedCount, "swept must equal classified");
});
