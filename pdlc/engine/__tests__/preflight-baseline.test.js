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

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
