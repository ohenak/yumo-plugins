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
//     `docs/_constraints/pdlc-retirement-baseline.md` exists at HEAD OR
//     existed at the pre-sweep ancestor (existence only, no shape claim),
//     and that doc's partition-closure line names a commit that is an
//     ancestor of HEAD with swept = classified and remainder = 0.
//
//     Pre-flight gate: baseline accuracy, not survival — this is a feature
//     whose whole purpose is deleting the paths the baseline names, so a
//     path being absent at HEAD is expected once the batch that retires it
//     has landed. The gate exists to catch a typo'd or never-real baseline
//     path (T-1), not to keep asserting that retired files still exist. A
//     path is accepted if it exists at HEAD, or if it existed at the
//     pre-sweep ancestor (`git merge-base origin/main HEAD`, falling back to
//     `main` if `origin/main` is unavailable) — i.e. it was real before any
//     retirement batch ran. A typo'd/never-real path fails both arms; a path
//     legitimately swept by a landed batch passes the ancestor arm.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { relative } from "node:path";

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
  "../../hooks/scripts/sync-workflo" + "ws.sh", // M-1
  "../../hooks/scripts/lib/pdlc-dri" + "ft.sh", // M-2
  "../../hooks/scripts/check-workflow-dri" + "ft.sh", // M-3
  "../../workflows/dist/orchestrate-dev.bundle" + ".js", // M-4
  "../../workflows/dist/orchestrate-queue.bundle" + ".js", // M-5
  "../../workflows/dist/distribution" + "-manifest.json", // M-6
  "../../workflows/dist/pdlc-cli.mjs", // M-9
  "../../workflows/dist/consolidate-learnings.bundle" + ".js", // M-10
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

// Resolves the pre-sweep ancestor: the commit before any retirement batch
// ran, against which a since-deleted baseline path can still be checked.
// Tries `origin/main` first (the usual PR base), falling back to `main` for
// checkouts without that remote-tracking ref.
function resolvePreSweepAncestor(cwd) {
  const refCandidates = ["origin/main", "main"];
  const errors = [];
  for (const ref of refCandidates) {
    try {
      return execFileSync("git", ["merge-base", ref, "HEAD"], { cwd, encoding: "utf8" }).trim();
    } catch (error) {
      errors.push(`${ref}: ${error.message}`);
    }
  }
  throw new Error(
    `could not resolve a pre-sweep ancestor via origin/main or main: ${errors.join("; ")}`,
  );
}

test("T01 pre-flight: every M-1…M-6, M-9, M-10 and M-8-helper path in the measured baseline exists at HEAD, or existed at the pre-sweep ancestor", () => {
  const repoRoot = repoPathOf("../../..");
  const preSweepAncestor = resolvePreSweepAncestor(repoRoot);

  for (const relativePath of [...BASELINE_M_ROW_PATHS, ...BASELINE_M8_HELPER_PATHS]) {
    const absolutePath = repoPathOf(relativePath);
    if (existsSync(absolutePath)) {
      continue;
    }

    const repoRelativePath = relative(repoRoot, absolutePath);
    assert.doesNotThrow(
      () =>
        execFileSync("git", ["cat-file", "-e", `${preSweepAncestor}:${repoRelativePath}`], {
          cwd: repoRoot,
        }),
      `expected baseline path to exist at HEAD or at pre-sweep ancestor ${preSweepAncestor}: ${relativePath}`,
    );
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

// ─── (d) erratum-6 disposition gate (PLAN T13, TSPEC §6.3 T-6) ─────────────
//
// FSPEC L-5 pins the post-sweep `pdlc/workflows/__tests__/*.test.js` literal at
// 97, on the premise that `hookCompatibility.test.js` is deleted as part of
// M-8. TSPEC §6.1 erratum 6 disputes that premise: §2.6 retains
// `hookCompatibility.test.js` in place (a *reduction*, not a deletion), so
// TSPEC §4.4 derives a corrected post-sweep literal of 99. That erratum is
// still open in the upstream lineage (FSPEC has not been re-measured to
// correct it) — this gate pins both literals as they read today, so that a
// silent, unremarked change to either document's literal reds this test
// instead of silently drifting the two numbers apart or back into agreement
// without anyone updating this record.
//
// TSPEC §6.3 T-6 additionally obliged a re-check at implementation time: the
// `hookCompatibility.test.js` reduction (rather than deletion) disposition only held if no
// assertion *outside* its `C7` block depended on the retired drift-detection script
// still being invocable. PLAN T16 (pdlc-plugin-retirement) performed that re-check and found
// no such assertion — `C7` was the only site in the module that invoked the drift hook — so
// T16 deleted the `C7` block outright rather than leaving it as a permanently-skipped husk.
// That deletion *is* T-6's disposition check landing, not a flip to full-file deletion: the
// module itself is still retained (a reduction), just without the block that was the drift
// hook's last remaining consumer. This gate now re-derives that outcome from the module's
// source: `C7` is gone, and the drift hook is invoked nowhere in the file at all.
test("T13 erratum-6 disposition gate (TSPEC §6.3 T-6): PLAN T16 deleted the C7 block, and no assertion anywhere in hookCompatibility.test.js depends on the retired drift-detection script being invocable", () => {
  const source = readFileSync(
    repoPathOf("../../../pdlc/workflows/__tests__/hookCompatibility.test.js"),
    "utf8",
  );

  assert.ok(
    !source.includes('describe.skip("C7:'),
    "expected the C7 block to be gone (PLAN T16 deleted it; the drift hook it exercised has no other caller in this module)",
  );

  // The disposition check itself (TSPEC §6.3 T-6): no assertion anywhere in the module may
  // invoke the retired drift-detection script. If a future edit reintroduces such a call,
  // this gate reds rather than silently reopening erratum 6's correction.
  const invocationPattern = new RegExp(
    "(execFileSync|execSync|spawnSync)\\([^)]*check-workflow-dri" + "ft\\.sh",
  );
  assert.doesNotMatch(
    source,
    invocationPattern,
    "expected no assertion in hookCompatibility.test.js to invoke the retired drift-detection script (T-6 disposition landed via C7's deletion, not a live dependency)",
  );
});
