/**
 * driftSync.test.js — the `sync-workflows.sh` behavioural suite (PLAN T-23, batch 5).
 *
 * Covers, against the real (not-yet-existing) entrypoint via `runScript("sync"|"sync-force", …)`:
 *   - AT-8a/AT-8b — plain sync never overwrites `local-edit`; `--force` does, after a verified
 *     backup that restores byte-identical (FSPEC §5.5/§5.6, AC-3.4/AC-3.5).
 *   - AT-9 — sync twice is a no-op: the sync manifest is byte-identical (incl. `syncedAtUtc`),
 *     no new backup, exit 0 (AC-3.6).
 *   - AT-10 — a mixed `stale`+`unverified` run exits 2 on the **post-run** pass
 *     (`assertRecordedPassIs`, O-14).
 *   - AT-12/AT-13 — retirement backs up (id = retired basename), verifies, deletes, iff R's
 *     **post-copy** state is `in-sync` (FSPEC §5.7); otherwise the path is left and the retired
 *     warning names R's actual state.
 *   - AT-26 — a plain sync backs up a `stale` row before copying it (FSPEC §5.5's v1-regression
 *     fix); the `backup` trace record precedes the `copy` record for that row.
 *   - §14.1 B-2 — a pre-manifest consumer's sync copies/retires nothing, still writes the
 *     (empty) drift-state record, exit 3, `pluginUpdate` remediation class.
 *   - §14.1 M-2 — the six retired-row-state → remediation-class bindings of FSPEC §5.3's table.
 *   - V-1 (PM F-07) — a resurrected, byte-identical retired path is retired again, with a
 *     second, distinct `(stamp, nn)` backup (AC-3.7's version-control caveat).
 *   - F-3 (TE F-05(a)) — a retirement backup is fault-scoped by the retired **basename**, not by
 *     row id, and does not disturb a sibling row's own bundle backup in the same run.
 *   - The FSPEC §5.8 exit-code floor for a sync run: 0, 2, 3, 4 — **never 1** (exit 1 is
 *     `--check`-only; §5.5's post-copy verification is what keeps a sync run off it).
 *   - PLAN's T-39 layer-4 sourced-probe slice: the drift-state writer, `pdlc_copy_artifact`, the
 *     backup-then-verify-then-destroy order, and `pdlc_prune_backups`, driven directly through
 *     `runProbe` against a real `makeConsumerTree` fixture and read back with
 *     `readDriftState`/`listBackups`/`inodeOf` — the batch-9 observable named by the PLAN row.
 *
 * RED-terminal (PLAN batch 5): `sync-workflows.sh` (C3, T-37, batch 11) does not exist yet, so
 * every `runScript("sync"|"sync-force", …)` call below fails at
 * `bash: <script>: No such file or directory` — a non-zero, non-{0,2,3,4} status that falsifies
 * every assertion keyed on a specific exit code or on-disk effect. Independently, C1
 * (`pdlc/hooks/scripts/lib/pdlc-drift.sh`, T-31/T-34, batches 6/9) does not exist yet, so every
 * `runProbe(...)` case below falls through `bin/lib-probe.sh`'s `unknown-function` branch. Both
 * failure modes are load-bearing, not incidental — this file owns no production code
 * (single-writer-per-file, PLAN) and touches nothing under `pdlc/hooks/scripts/`.
 *
 * Cross-references: PLAN row T-23 (batch 5); TSPEC §5, §11, §13.1/§13.5, §14/§14.1; FSPEC §4.7,
 * §5.3, §5.5, §5.6, §5.7, §5.8.
 */

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { join } from "path";

import { describeOrSkip } from "./helpers/driftCapabilities.js";
import {
  runScript,
  readDriftState,
  listBackups,
  expectFailOpen,
  expectRemediationClass,
  remediationOf,
  allOf,
  countOf,
} from "./helpers/driftHarness.js";
import { runProbe } from "./helpers/driftProbe.js";
import {
  parseTrace,
  assertPostCopyNarrow,
  assertRecordedPassIs,
  snapshotTree,
} from "./helpers/driftOrdering.js";
import { makeConsumerTree, makePluginTree, setRowState } from "./helpers/driftFixtures.js";
import { readSyncManifest } from "./helpers/driftHarness.js";

// ───────────────────────────── local composition helpers ─────────────────────────────
//
// None of TSPEC §13's named fixtures (`staleRow`, `localEditRow`, `retiredPresent`, …) are
// literal exports — they are composition recipes over `makeConsumerTree`/`makePluginTree`/
// `setRowState` (TSPEC §13.1). These assemble them locally for this file's cases.

const RETIRED_REL = ".claude/workflows/orchestrate-dev.js";
const RETIRED_BASENAME = "orchestrate-dev.js";

function syncCmdFor(pluginRoot) {
  // FSPEC §5.4's stated shipped location — the canonical value every `expectRemediationClass`
  // call threads through `extraConjuncts.syncCmd` (TSPEC §7.4 — `SYNC_CMD` resolution throws
  // for every class, including the negative-only ones, without it).
  return join(pluginRoot, "hooks", "scripts", "sync-workflows.sh");
}

/** A plain two-row plugin tree over a git-backed consumer tree, no rows yet realised. */
function buildTwoRowTrees() {
  const plugin = makePluginTree();
  const consumer = makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true });
  return { consumer, plugin };
}

/**
 * `row-1` retires `RETIRED_REL`; `row-2` retires nothing. Both rows start `in-sync`, and the
 * consumer carries a legacy file at the retired path — the `retiredPresent` recipe (TSPEC §13.1:
 * `syncedConsumer` + a `files` entry matching the retiring row's `retires`).
 */
function buildRetiringTrees(opts = {}) {
  const legacyContent = opts.legacyContent !== undefined ? opts.legacyContent : "legacy orchestrate-dev.js content";
  const plugin = makePluginTree({
    rows: [
      { id: "row-1", content: "plugin-bytes-for-row-1", retires: [RETIRED_REL] },
      { id: "row-2", content: "plugin-bytes-for-row-2", retires: [] },
    ],
  });
  const consumer = makeConsumerTree({
    git: true,
    claudeDir: true,
    workflowsDir: true,
    files: { [RETIRED_REL]: legacyContent },
  });
  const trees = { consumer, plugin };
  if (!opts.skipRow1InSync) setRowState(trees, "row-1", "in-sync");
  if (!opts.skipRow2InSync) setRowState(trees, "row-2", "in-sync");
  return { trees, retiredRel: RETIRED_REL, retiredBasename: RETIRED_BASENAME, legacyContent };
}

/**
 * §14.1 B-2's fixture: a plugin tree whose `distribution-manifest.json` is deleted after
 * construction (the manifest-absent recipe), paired with a consumer carrying a file at a
 * would-be retired path — nothing in the manifest names it, since there is no manifest.
 */
function buildPreManifestTrees() {
  const plugin = makePluginTree();
  rmSync(join(plugin.pluginRoot, "workflows", "dist", "distribution-manifest.json"), { force: true });
  const consumer = makeConsumerTree({
    git: true,
    claudeDir: true,
    files: { [RETIRED_REL]: "would-be-retired content, unknown to any manifest" },
  });
  return { consumer, plugin };
}

function runSync(trees, opts = {}) {
  const run = runScript(opts.force ? "sync-force" : "sync", {
    consumerRoot: trees.consumer.root,
    home: trees.consumer.home,
    pluginRoot: trees.plugin.pluginRoot,
    fault: opts.fault,
    path: opts.path,
    trace: true,
  });
  run.root = trees.consumer.root;
  run.consumerRoot = trees.consumer.root;
  return run;
}

/** `--check` over an already-built tree pair — the read-only counterpart of `runSync`. */
function runCheck(trees, opts = {}) {
  const run = runScript("check", {
    consumerRoot: trees.consumer.root,
    home: trees.consumer.home,
    pluginRoot: trees.plugin.pluginRoot,
    fault: opts.fault,
    trace: true,
  });
  run.root = trees.consumer.root;
  run.consumerRoot = trees.consumer.root;
  return run;
}

/**
 * PROP-NEG-06's packed-manifest builder (T-44 local helper — no shared export exists for this
 * yet, PLAN single-writer-per-file: `driftFixtures.js` is T-15's, not T-44's, to touch).
 *
 * Each `rowSpecs` entry `{id, retiredRel, legacyContent?, pluginContent?}` becomes one plugin
 * row that retires exactly its own `retiredRel`, with a legacy file pre-seeded at that path in
 * the consumer tree (AC-1.4's row independence — many retiring rows, one manifest, one sync
 * run/spawn).
 *
 * @param {{id:string, retiredRel:string, legacyContent?:string, pluginContent?:string}[]} rowSpecs
 */
function buildMultiRetiringTrees(rowSpecs) {
  const rows = rowSpecs.map((r) => ({
    id: r.id,
    content: r.pluginContent !== undefined ? r.pluginContent : `plugin-bytes-for-${r.id}`,
    retires: [r.retiredRel],
  }));
  const plugin = makePluginTree({ rows });

  const files = {};
  for (const r of rowSpecs) {
    files[r.retiredRel] =
      r.legacyContent !== undefined ? r.legacyContent : `legacy content for ${r.retiredRel}`;
  }
  const consumer = makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true, files });

  return {
    trees: { consumer, plugin },
    rows: rowSpecs.map((r) => ({
      id: r.id,
      retiredRel: r.retiredRel,
      retiredBasename: r.retiredRel.split("/").pop(),
    })),
  };
}

function cleanupAll(trees) {
  trees.consumer.cleanup();
  trees.plugin.cleanup();
}

function backupsDirOf(root) {
  return join(root, ".claude", "workflows", ".pdlc-backups");
}

function readBackupBytes(root, name) {
  return readFileSync(join(backupsDirOf(root), name));
}

// ───────────────────────────── the suite ─────────────────────────────

describeOrSkip(
  "driftSync — sync-workflows.sh (FSPEC §5, TSPEC §11/§13/§14/§14.1)",
  "hash",
  [
    "AT-8a/8b, AT-9, AT-10, AT-12, AT-13, AT-26, §14.1 B-2/M-2/V-1/F-3, and the §5.8 exit-code " +
      "floor for sync — the invariants TSPEC §13.1/§13.5 and FSPEC §5.5/§5.6/§5.7/§5.8 pin",
  ],
  () => {
    // ───────────────────────────── AT-8a / AT-8b ─────────────────────────────

    describe("AT-8a/AT-8b — local-edit: plain sync leaves it, --force overwrites after a verified backup", () => {
      it("AT-8a — plain sync does not overwrite a local-edit row; bytes are byte-identical before/after; W-4 fires", () => {
        const { consumer, plugin } = buildTwoRowTrees();
        const trees = { consumer, plugin };
        try {
          setRowState(trees, "row-2", "in-sync");
          const originalBytes = "original-synced-bytes-row-1";
          const editedBytes = "operator-hand-edited-bytes-row-1";
          setRowState(trees, "row-1", "local-edit", { originalBytes, consumerBytes: editedBytes });

          const row1 = plugin.manifest.rows.find((r) => r.id === "row-1");
          const before = readFileSync(join(consumer.root, ...row1.consumerPath.split("/")));

          const run = runSync(trees);

          const after = readFileSync(join(consumer.root, ...row1.consumerPath.split("/")));
          expect(after.equals(before)).toBe(true);
          expect(after.toString()).toBe(editedBytes);

          // local-edit alone (row-2 in-sync) ⇒ exit 2, never 1 (FSPEC §5.8).
          expect(run.status).toBe(2);

          expect(countOf(run.stderr, "W-4")).toBeGreaterThanOrEqual(1);
          const w4 = allOf(run.stderr, "W-4").find((m) => m.groups.id === "row-1");
          expect(w4).toBeTruthy();
        } finally {
          cleanupAll(trees);
        }
      });

      it("AT-8b — --force overwrites a local-edit row after a verified backup that restores byte-identical", () => {
        const { consumer, plugin } = buildTwoRowTrees();
        const trees = { consumer, plugin };
        try {
          setRowState(trees, "row-2", "in-sync");
          const editedBytes = "operator-hand-edited-bytes-row-1";
          setRowState(trees, "row-1", "local-edit", {
            originalBytes: "original-synced-bytes-row-1",
            consumerBytes: editedBytes,
          });

          const run = runSync(trees, { force: true });

          const row1 = plugin.manifest.rows.find((r) => r.id === "row-1");
          const abs = join(consumer.root, ...row1.consumerPath.split("/"));
          expect(existsSync(abs)).toBe(true);
          expect(readFileSync(abs).equals(plugin.bytesOf("row-1"))).toBe(true);

          // AC-3.5's non-false-greenable oracle: restore the newest backup, compare bytes.
          const backups = listBackups(consumer.root).filter((b) => b.id === "row-1");
          expect(backups.length).toBeGreaterThanOrEqual(1);
          const newest = backups.sort((a, b) => (a.name < b.name ? 1 : -1))[0];
          const restored = readBackupBytes(consumer.root, newest.name);
          expect(restored.toString()).toBe(editedBytes);

          expect(run.status).toBe(0);
        } finally {
          cleanupAll(trees);
        }
      });
    });

    // ───────────────────────────── AT-9 ─────────────────────────────

    describe("AT-9 — sync twice is a no-op", () => {
      it("the second run leaves the sync manifest byte-identical (incl. syncedAtUtc), writes no new backup, exits 0", () => {
        const { consumer, plugin } = buildTwoRowTrees();
        const trees = { consumer, plugin };
        try {
          setRowState(trees, "row-1", "in-sync");
          setRowState(trees, "row-2", "in-sync");

          const run1 = runSync(trees);
          expect(run1.status).toBe(0);

          const manifestPath = join(consumer.root, ".claude", "workflows", ".pdlc-sync-manifest.json");
          const manifestAfterRun1 = readFileSync(manifestPath);
          const backupsAfterRun1 = listBackups(consumer.root);

          const run2 = runSync(trees);
          expect(run2.status).toBe(0);

          const manifestAfterRun2 = readFileSync(manifestPath);
          expect(manifestAfterRun2.equals(manifestAfterRun1)).toBe(true);
          expect(listBackups(consumer.root)).toEqual(backupsAfterRun1);
        } finally {
          cleanupAll(trees);
        }
      });
    });

    // ───────────────────────────── AT-10 ─────────────────────────────

    describe("AT-10 — a mixed stale+unverified run exits 2 on the post-run pass", () => {
      it("copies the stale row, skips the unverified row, and the exit code matches the post-run classify record", () => {
        const { consumer, plugin } = buildTwoRowTrees();
        const trees = { consumer, plugin };
        try {
          setRowState(trees, "row-1", "stale");
          setRowState(trees, "row-2", "unverified");

          const run = runSync(trees);
          expect(run.status).toBe(2);

          const state = readDriftState(consumer.root);
          expect(state).not.toBeNull();
          const trace = parseTrace(run.tracePath);
          assertRecordedPassIs(trace, state, "post-run");

          const row2 = state.rows.find((r) => r.id === "row-2");
          expect(row2 && row2.state).toBe("unverified");
        } finally {
          cleanupAll(trees);
        }
      });
    });

    // ───────────────────────────── AT-12 / AT-13 ─────────────────────────────

    describe("AT-12/AT-13 — retirement gated on R's post-copy state", () => {
      it("AT-12 — R in-sync: the retired path is backed up (id = retired basename), verified, then deleted", () => {
        const { trees, retiredRel, retiredBasename, legacyContent } = buildRetiringTrees();
        const { consumer } = trees;
        try {
          const run = runSync(trees);

          const abs = join(consumer.root, ...retiredRel.split("/"));
          expect(existsSync(abs)).toBe(false);

          const backups = listBackups(consumer.root).filter((b) => b.id === retiredBasename);
          expect(backups.length).toBe(1);
          expect(readBackupBytes(consumer.root, backups[0].name).toString()).toBe(legacyContent);

          const trace = parseTrace(run.tracePath);
          assertPostCopyNarrow(trace, ["row-1"]);

          expect(run.status).not.toBe(1);
        } finally {
          cleanupAll(trees);
        }
      });

      it("AT-13 — R unknown: the retired path is left, and the retired warning names R's actual state", () => {
        const { trees, retiredRel } = buildRetiringTrees();
        const { consumer } = trees;
        try {
          const run = runSync(trees, { fault: ["plugin-artifact-read:row-1"] });

          const abs = join(consumer.root, ...retiredRel.split("/"));
          expect(existsSync(abs)).toBe(true);

          const w6 = allOf(run.stderr, "W-6").find((m) => m.groups.state === "unknown");
          expect(w6).toBeTruthy();
        } finally {
          cleanupAll(trees);
        }
      });
    });

    // ───────────────────────────── AT-26 ─────────────────────────────

    describe("AT-26 — plain sync backs up a stale row before copying it", () => {
      it("restores byte-identical pre-sync content, and the backup trace record precedes the copy record", () => {
        const { consumer, plugin } = buildTwoRowTrees();
        const trees = { consumer, plugin };
        try {
          setRowState(trees, "row-2", "in-sync");
          const staleBytes = "stale-pre-sync-bytes-row-1";
          setRowState(trees, "row-1", "stale", { consumerBytes: staleBytes });

          const run = runSync(trees);

          const backups = listBackups(consumer.root).filter((b) => b.id === "row-1");
          expect(backups.length).toBeGreaterThanOrEqual(1);
          const newest = backups.sort((a, b) => (a.name < b.name ? 1 : -1))[0];
          expect(readBackupBytes(consumer.root, newest.name).toString()).toBe(staleBytes);

          const trace = parseTrace(run.tracePath);
          const backupIdx = trace.findIndex((r) => r.op === "backup" && r.rowId === "row-1");
          const copyIdx = trace.findIndex((r) => r.op === "copy" && r.rowId === "row-1");
          expect(backupIdx).toBeGreaterThanOrEqual(0);
          expect(copyIdx).toBeGreaterThanOrEqual(0);
          expect(backupIdx).toBeLessThan(copyIdx);
        } finally {
          cleanupAll(trees);
        }
      });
    });

    // ───────────────────────────── §14.1 B-2 ─────────────────────────────

    describe("§14.1 B-2 — a pre-manifest consumer's sync copies/retires nothing", () => {
      it("writes an empty drift-state record, exits 3, and classes W-1 as pluginUpdate", () => {
        const { consumer, plugin } = buildPreManifestTrees();
        const trees = { consumer, plugin };
        try {
          const before = readFileSync(join(consumer.root, ...RETIRED_REL.split("/")));

          const run = runSync(trees);

          const after = readFileSync(join(consumer.root, ...RETIRED_REL.split("/")));
          expect(after.equals(before)).toBe(true);
          expect(existsSync(backupsDirOf(consumer.root))).toBe(false);

          const state = readDriftState(consumer.root);
          expect(state).not.toBeNull();
          expect(state.rows).toEqual([]);
          expect(state.retiredPresent).toEqual([]);

          expect(run.status).toBe(3);

          expectRemediationClass(remediationOf(run.stderr, "W-1"), "pluginUpdate", {
            syncCmd: syncCmdFor(plugin.pluginRoot),
          });
        } finally {
          cleanupAll(trees);
        }
      });
    });

    // ───────────────────────────── §14.1 M-2 ─────────────────────────────

    describe("§14.1 M-2 — R's state drives the retired-row remediation class (FSPEC §5.3)", () => {
      const plainSyncCases = ["in-sync", "stale", "missing"];
      for (const state of plainSyncCases) {
        it(`R "${state}" ⇒ remediation class "sync"`, () => {
          const { trees, retiredBasename } = buildRetiringTrees();
          const { consumer, plugin } = trees;
          try {
            setRowState(trees, "row-1", state);
            const run = runSync(trees);
            const w6 = allOf(run.stderr, "W-6").find((m) => m.groups.state === state);
            expect(w6).toBeTruthy();
            expect(w6.groups.id).toBe("row-1");
            expectRemediationClass(w6.groups.remediation.trim(), "sync", {
              syncCmd: syncCmdFor(plugin.pluginRoot),
            });
            expect(retiredBasename).toBe(RETIRED_BASENAME);
          } finally {
            cleanupAll(trees);
          }
        });
      }

      const forceCases = ["local-edit", "unverified"];
      for (const state of forceCases) {
        it(`R "${state}" ⇒ remediation class "forceSync", naming the backup dir and both filename patterns`, () => {
          const { trees } = buildRetiringTrees();
          const { consumer, plugin } = trees;
          try {
            if (state === "local-edit") {
              setRowState(trees, "row-1", "local-edit", {
                originalBytes: "original-row-1",
                consumerBytes: "edited-row-1",
              });
            } else {
              setRowState(trees, "row-1", "unverified", { consumerBytes: "unverified-row-1" });
            }
            const run = runSync(trees);
            const w6 = allOf(run.stderr, "W-6").find((m) => m.groups.state === state);
            expect(w6).toBeTruthy();
            expectRemediationClass(w6.groups.remediation.trim(), "forceSync", {
              syncCmd: syncCmdFor(plugin.pluginRoot),
              mustName: [/\.pdlc-backups/, /row-1/, new RegExp(RETIRED_BASENAME.replace(/\./g, "\\."))],
            });
          } finally {
            cleanupAll(trees);
          }
        });
      }

      it('R "unknown" ⇒ remediation class "pluginUpdate" (or environment) — sync is never named', () => {
        const { trees } = buildRetiringTrees();
        const { consumer, plugin } = trees;
        try {
          const run = runSync(trees, { fault: ["plugin-artifact-read:row-1"] });
          const w6 = allOf(run.stderr, "W-6").find((m) => m.groups.state === "unknown");
          expect(w6).toBeTruthy();
          expectRemediationClass(w6.groups.remediation.trim(), "pluginUpdate", {
            syncCmd: syncCmdFor(plugin.pluginRoot),
          });
        } finally {
          cleanupAll(trees);
        }
      });
    });

    // ───────────────────────────── V-1 (PM F-07) ─────────────────────────────

    describe("V-1 — AC-3.7: a resurrected retired file is retired again, with a second distinct backup", () => {
      it("re-creating the retired path byte-identically triggers a second sync's own, distinct (stamp, nn) backup", () => {
        const { trees, retiredRel, retiredBasename, legacyContent } = buildRetiringTrees();
        const { consumer } = trees;
        try {
          const run1 = runSync(trees);
          expect(existsSync(join(consumer.root, ...retiredRel.split("/")))).toBe(false);

          const abs = join(consumer.root, ...retiredRel.split("/"));
          writeFileSync(abs, legacyContent);
          expect(existsSync(abs)).toBe(true);

          const run2 = runSync(trees);
          expect(existsSync(abs)).toBe(false);

          const backups = listBackups(consumer.root).filter((b) => b.id === retiredBasename);
          expect(backups.length).toBe(2);
          const [a, b] = backups;
          expect(a.stamp === b.stamp && a.nn === b.nn).toBe(false);

          void run1;
        } finally {
          cleanupAll(trees);
        }
      });
    });

    // ───────────────────────────── F-3 (TE F-05(a)) ─────────────────────────────

    describe("F-3 — a retirement backup is fault-scoped by the retired basename, not by row id", () => {
      it("corrupting the retirement backup does not disturb row-1's own bundle backup in the same run", () => {
        const { trees, retiredRel, retiredBasename } = buildRetiringTrees();
        const { consumer, plugin } = trees;
        try {
          const staleBytes = "stale-pre-sync-bytes-row-1";
          setRowState(trees, "row-1", "stale", { consumerBytes: staleBytes });

          const run = runSync(trees, { fault: [`backup-corrupt:${retiredBasename}`] });

          // Row-1's own bundle copy proceeds normally: its own backup is uncorrupted, and it
          // ends up in-sync — the fault selector must scope to the retired basename only.
          const row1Abs = join(consumer.root, ...plugin.manifest.rows.find((r) => r.id === "row-1").consumerPath.split("/"));
          expect(readFileSync(row1Abs).equals(plugin.bytesOf("row-1"))).toBe(true);
          const row1Backups = listBackups(consumer.root).filter((b) => b.id === "row-1");
          expect(row1Backups.length).toBe(1);
          expect(readBackupBytes(consumer.root, row1Backups[0].name).toString()).toBe(staleBytes);

          // The retirement's own backup failed verification: the path is left in place, the
          // loop continued (row-1 still appears in the record), and the run reports the one
          // write failure at the retired path.
          expect(existsSync(join(consumer.root, ...retiredRel.split("/")))).toBe(true);
          expectFailOpen(run, {
            path: retiredRel,
            operation: "backup-verify",
            entrypoint: "sync",
            remainingRows: ["row-1"],
          });
        } finally {
          cleanupAll(trees);
        }
      });
    });

    // ───────────────────────────── FSPEC §5.8 exit-code floor ─────────────────────────────

    describe("FSPEC §5.8 — the sync exit-code floor: 0, 2, 3, 4 — never 1", () => {
      it("a fully-repaired stale-only run exits 0, not 1 (the case a --check run would report as 1)", () => {
        const { consumer, plugin } = buildTwoRowTrees();
        const trees = { consumer, plugin };
        try {
          setRowState(trees, "row-2", "in-sync");
          setRowState(trees, "row-1", "stale");
          const run = runSync(trees);
          expect(run.status).toBe(0);
          expect(run.status).not.toBe(1);
        } finally {
          cleanupAll(trees);
        }
      });

      it("a mixed stale+unverified run exits 2, not 1", () => {
        const { consumer, plugin } = buildTwoRowTrees();
        const trees = { consumer, plugin };
        try {
          setRowState(trees, "row-1", "stale");
          setRowState(trees, "row-2", "unverified");
          const run = runSync(trees);
          expect(run.status).toBe(2);
          expect(run.status).not.toBe(1);
        } finally {
          cleanupAll(trees);
        }
      });

      it("an unresolved-baseline (pre-manifest) run exits 3, not 1", () => {
        const { consumer, plugin } = buildPreManifestTrees();
        const trees = { consumer, plugin };
        try {
          const run = runSync(trees);
          expect(run.status).toBe(3);
          expect(run.status).not.toBe(1);
        } finally {
          cleanupAll(trees);
        }
      });

      it("a truncated (post-copy-verification-failed) copy exits 4, not 1", () => {
        const { consumer, plugin } = buildTwoRowTrees();
        const trees = { consumer, plugin };
        try {
          setRowState(trees, "row-2", "in-sync");
          setRowState(trees, "row-1", "stale");
          const run = runSync(trees, { fault: ["artifact-copy-corrupt:row-1"] });
          expect(run.status).toBe(4);
          expect(run.status).not.toBe(1);

          // FSPEC §5.5's post-copy verification: the row measures unverified (not stale, not
          // local-edit) — this is what keeps the exit at 4 rather than a stray 1.
          const state = readDriftState(consumer.root);
          const row1 = state && state.rows.find((r) => r.id === "row-1");
          expect(row1 && row1.state).toBe("unverified");
        } finally {
          cleanupAll(trees);
        }
      });
    });

    // ───────────────────────────── T-39 layer-4 sourced-probe slice ─────────────────────────────
    //
    // The batch-9 observable named by the PLAN's T-23 row: C1's writer/copy/backup/retire/prune
    // routines exercised directly through the sourced probe, ahead of C2/C3's own entrypoint
    // wiring, read back with `readDriftState`/`listBackups`/`inodeOf` against a real
    // `makeConsumerTree` fixture (`opts.cwd`).

    describe("T-39 layer-4 — C1's writer/copy/backup/retire/prune routines via the sourced probe", () => {
      it("the drift-state writer routine lands a record readable via readDriftState", () => {
        const consumer = makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true });
        try {
          const [result] = runProbe([`pdlc_write_drift_state\t${consumer.root}\t{"rows":[]}`], {
            cwd: consumer.root,
          });
          expect(result.ok).toBe(true);
          expect(readDriftState(consumer.root)).not.toBeNull();
        } finally {
          consumer.cleanup();
        }
      });

      it("pdlc_copy_artifact lands a plugin artifact into the consumer tree, verified", () => {
        const consumer = makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true });
        const plugin = makePluginTree();
        try {
          const row1 = plugin.manifest.rows.find((r) => r.id === "row-1");
          const src = join(plugin.pluginRoot, row1.pluginPath);
          const dest = join(consumer.root, ...row1.consumerPath.split("/"));
          const [result] = runProbe([`pdlc_copy_artifact\t${src}\t${dest}`], { cwd: consumer.root });
          expect(result.ok).toBe(true);
          expect(existsSync(dest)).toBe(true);
          expect(readFileSync(dest).equals(plugin.bytesOf("row-1"))).toBe(true);
        } finally {
          consumer.cleanup();
          plugin.cleanup();
        }
      });

      it("backup-then-verify-then-destroy preserves the destination's identity only after a verified backup", () => {
        const consumer = makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true });
        try {
          const target = join(consumer.root, ".claude", "workflows", "orchestrate-dev.js");
          mkdirSync(join(consumer.root, ".claude", "workflows"), { recursive: true });
          writeFileSync(target, "content to retire");
          const [result] = runProbe([`pdlc_retire\t${target}\t${RETIRED_BASENAME}`], { cwd: consumer.root });
          expect(result.ok).toBe(true);
          expect(existsSync(target)).toBe(false);
          const backups = listBackups(consumer.root).filter((b) => b.id === RETIRED_BASENAME);
          expect(backups.length).toBe(1);
        } finally {
          consumer.cleanup();
        }
      });

      it("pdlc_prune_backups is reachable through the sourced probe against a real consumer tree", () => {
        const consumer = makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true });
        try {
          const dir = join(consumer.root, ".claude", "workflows", ".pdlc-backups");
          const [result] = runProbe([`pdlc_prune_backups\t${dir}\trow-1`], { cwd: consumer.root });
          expect(result.ok).toBe(true);
        } finally {
          consumer.cleanup();
        }
      });
    });

    // ═══════════════════════════ T-44: sync/measurement-time properties ═══════════════════════════
    //
    // PROP-MTM-01/03/04(sync half)/05(sync half)/06/07, PROP-NEG-03(forward half)/06/07(blast
    // radius half) — PROPERTIES §7/§10 (`docs/pdlc-workflow-distribution/PROPERTIES-*.md`).
    // Falsification evidence lives in `docs/pdlc-workflow-distribution/FALSIFICATION-LEDGER-T-44.md`.

    // ───────────────────────────── PROP-MTM-01 ─────────────────────────────

    describe("PROP-MTM-01 — a fully-successful sync records post-run states and exits 0", () => {
      it("every row in-sync post-run, generatedBy is \"sync\", exit 0", () => {
        const { consumer, plugin } = buildTwoRowTrees();
        const trees = { consumer, plugin };
        try {
          setRowState(trees, "row-1", "in-sync");
          setRowState(trees, "row-2", "in-sync");

          const run = runSync(trees);
          expect(run.status).toBe(0);

          const state = readDriftState(consumer.root);
          expect(state).not.toBeNull();
          expect(state.generatedBy).toBe("sync");
          expect(state.rows.every((r) => r.state === "in-sync")).toBe(true);

          const trace = parseTrace(run.tracePath);
          assertRecordedPassIs(trace, state, "post-run");
        } finally {
          cleanupAll(trees);
        }
      });
    });

    // ───────────────────────────── PROP-MTM-03 ─────────────────────────────

    describe("PROP-MTM-03 — sync's copy/skip decision is driven by the AS-FOUND pass; plain sync declines, --force overwrites", () => {
      it("plain sync declines both local-edit and unverified rows (W-4/W-3, bytes unchanged, exit 2)", () => {
        const plugin = makePluginTree({
          rows: [
            { id: "row-1", content: "plugin-bytes-for-row-1", retires: [] },
            { id: "row-2", content: "plugin-bytes-for-row-2", retires: [] },
          ],
        });
        const consumer = makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true });
        const trees = { consumer, plugin };
        try {
          setRowState(trees, "row-1", "local-edit", {
            originalBytes: "original-row-1",
            consumerBytes: "edited-row-1",
          });
          setRowState(trees, "row-2", "unverified", { consumerBytes: "unverified-row-2" });

          const row1Abs = join(consumer.root, ".claude/workflows/row-1.bundle.js");
          const row2Abs = join(consumer.root, ".claude/workflows/row-2.bundle.js");
          const before1 = readFileSync(row1Abs);
          const before2 = readFileSync(row2Abs);

          const run = runSync(trees);

          expect(readFileSync(row1Abs).equals(before1)).toBe(true);
          expect(readFileSync(row2Abs).equals(before2)).toBe(true);
          expect(run.status).toBe(2);
          expect(countOf(run.stderr, "W-4")).toBeGreaterThanOrEqual(1);
          expect(countOf(run.stderr, "W-3")).toBeGreaterThanOrEqual(1);
        } finally {
          cleanupAll(trees);
        }
      });

      it("--force overwrites both rows after a verified backup each, exit 0", () => {
        const plugin = makePluginTree({
          rows: [
            { id: "row-1", content: "plugin-bytes-for-row-1", retires: [] },
            { id: "row-2", content: "plugin-bytes-for-row-2", retires: [] },
          ],
        });
        const consumer = makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true });
        const trees = { consumer, plugin };
        try {
          setRowState(trees, "row-1", "local-edit", {
            originalBytes: "original-row-1",
            consumerBytes: "edited-row-1",
          });
          setRowState(trees, "row-2", "unverified", { consumerBytes: "unverified-row-2" });

          const run = runSync(trees, { force: true });

          expect(run.status).toBe(0);
          const row1Abs = join(consumer.root, ".claude/workflows/row-1.bundle.js");
          const row2Abs = join(consumer.root, ".claude/workflows/row-2.bundle.js");
          expect(readFileSync(row1Abs).equals(plugin.bytesOf("row-1"))).toBe(true);
          expect(readFileSync(row2Abs).equals(plugin.bytesOf("row-2"))).toBe(true);
          expect(listBackups(consumer.root).filter((b) => b.id === "row-1").length).toBeGreaterThanOrEqual(1);
          expect(listBackups(consumer.root).filter((b) => b.id === "row-2").length).toBeGreaterThanOrEqual(1);
        } finally {
          cleanupAll(trees);
        }
      });
    });

    // ───────────────────────────── PROP-MTM-04 (sync half) ─────────────────────────────

    describe("PROP-MTM-04 (sync half) — the retired-row pass binding: agreement cases, post-copy narrowing, and the predicted disagreement", () => {
      // Conjunct 1, scoped to the AGREEMENT cases: R's own as-found/post-copy/post-run states all
      // coincide (no R-own-copy fault), so `retiredPresent[].supersedingState` (post-copy-derived,
      // sync-workflows.sh line ~419) trivially equals the row's recorded post-run state too.
      const agreementCases = ["in-sync", "stale", "missing", "local-edit", "unverified"];
      for (const rState of agreementCases) {
        it(`conjunct 1 (agreement) — R "${rState}": retiredPresent.supersedingState matches R's recorded post-run state`, () => {
          const { trees, retiredRel } = buildRetiringTrees();
          const { consumer } = trees;
          try {
            if (rState === "local-edit") {
              setRowState(trees, "row-1", "local-edit", { originalBytes: "orig-row-1", consumerBytes: "edited-row-1" });
            } else if (rState === "unverified") {
              setRowState(trees, "row-1", "unverified", { consumerBytes: "unverified-row-1" });
            } else {
              setRowState(trees, "row-1", rState);
            }

            const run = runSync(trees);
            const state = readDriftState(consumer.root);
            const row1 = state.rows.find((r) => r.id === "row-1");
            expect(row1).toBeTruthy();

            const retiredEntry = state.retiredPresent.find((e) => e.path === retiredRel);
            if (row1.state === "in-sync") {
              // Deleted — no retiredPresent entry to compare (the path itself is gone).
              expect(existsSync(join(consumer.root, ...retiredRel.split("/")))).toBe(false);
              expect(retiredEntry).toBeUndefined();
            } else {
              expect(retiredEntry).toBeTruthy();
              expect(retiredEntry.supersedingState).toBe(row1.state);
            }
          } finally {
            cleanupAll(trees);
          }
        });
      }

      // Conjunct 2 — the post-copy pass classifies ONLY retiring rows (already exercised for the
      // in-sync case by AT-12; this restates it for a non-in-sync R, where post-copy narrowing
      // still holds even though the retire action itself does not fire).
      it('conjunct 2 — post-copy classification stays narrowed to retiring rows even when R is "unverified"', () => {
        const { trees } = buildRetiringTrees();
        try {
          setRowState(trees, "row-1", "unverified", { consumerBytes: "unverified-row-1" });
          const run = runSync(trees);
          const trace = parseTrace(run.tracePath);
          assertPostCopyNarrow(trace, ["row-1"]);
        } finally {
          cleanupAll(trees);
        }
      });

      // Conjunct 3 — the two predicted-disagreement compositions (AT-35-style corrupt copy on R's
      // OWN bundle, where R already carried a sync-manifest entry that the corrupted copy orphans):
      // post-copy classifies "local-edit" (stale entry, mismatched bytes); the manifest-rewrite step
      // then removes that entry (copy failed verification), so post-run classifies "unverified".
      // Asserted directly against the trace's classify records and the recorded row state — NOT
      // against `retiredPresent`, which is where the known production defect lives (see Residuals).
      it('conjunct 3, sub-case (a) — R "stale" + artifact-copy-corrupt: post-copy "local-edit" vs post-run "unverified"', () => {
        const { trees } = buildRetiringTrees();
        const { consumer } = trees;
        try {
          setRowState(trees, "row-1", "stale");
          const run = runSync(trees, { fault: ["artifact-copy-corrupt:row-1"] });

          const trace = parseTrace(run.tracePath);
          const postCopy = trace.find((r) => r.phase === "post-copy" && r.op === "classify" && r.rowId === "row-1");
          expect(postCopy).toBeTruthy();
          expect(postCopy.arg.toString("utf8")).toBe("local-edit");

          const state = readDriftState(consumer.root);
          assertRecordedPassIs(trace, state, "post-run");
          const row1 = state.rows.find((r) => r.id === "row-1");
          expect(row1.state).toBe("unverified");

          expect(postCopy.arg.toString("utf8")).not.toBe(row1.state);
        } finally {
          cleanupAll(trees);
        }
      });

      it('conjunct 3, sub-case (b) — R "local-edit" + --force + artifact-copy-corrupt: post-copy "local-edit" vs post-run "unverified"', () => {
        const { trees } = buildRetiringTrees();
        const { consumer } = trees;
        try {
          setRowState(trees, "row-1", "local-edit", { originalBytes: "orig-row-1", consumerBytes: "edited-row-1" });
          const run = runSync(trees, { force: true, fault: ["artifact-copy-corrupt:row-1"] });

          const trace = parseTrace(run.tracePath);
          const postCopy = trace.find((r) => r.phase === "post-copy" && r.op === "classify" && r.rowId === "row-1");
          expect(postCopy).toBeTruthy();
          expect(postCopy.arg.toString("utf8")).toBe("local-edit");

          const state = readDriftState(consumer.root);
          const row1 = state.rows.find((r) => r.id === "row-1");
          expect(row1.state).toBe("unverified");
        } finally {
          cleanupAll(trees);
        }
      });
    });

    // ───────────────────────────── PROP-MTM-05 (sync half) ─────────────────────────────

    describe("PROP-MTM-05 (sync half) — a post-sync --check reports copied rows in-sync and skipped rows' prior state", () => {
      it("row-1 (stale, copied) reports in-sync; row-2 (unverified, skipped without --force) reports unverified", () => {
        const { consumer, plugin } = buildTwoRowTrees();
        const trees = { consumer, plugin };
        try {
          setRowState(trees, "row-1", "stale");
          setRowState(trees, "row-2", "unverified", { consumerBytes: "unverified-row-2" });

          const syncRun = runSync(trees);
          expect(syncRun.status).toBe(2);

          const checkRun = runCheck(trees);
          const state = readDriftState(consumer.root);
          expect(state.generatedBy).toBe("check");
          expect(state.rows.find((r) => r.id === "row-1").state).toBe("in-sync");
          expect(state.rows.find((r) => r.id === "row-2").state).toBe("unverified");
          void checkRun;
        } finally {
          cleanupAll(trees);
        }
      });
    });

    // ───────────────────────────── PROP-MTM-06 ─────────────────────────────

    describe("PROP-MTM-06 — the recorded pass is determined solely by generatedBy", () => {
      it('sync (generatedBy "sync"): the recorded pass is post-run — assertRecordedPassIs("as-found") discriminates and throws', () => {
        const { consumer, plugin } = buildTwoRowTrees();
        const trees = { consumer, plugin };
        try {
          setRowState(trees, "row-1", "stale");
          setRowState(trees, "row-2", "in-sync");

          const run = runSync(trees);
          const state = readDriftState(consumer.root);
          const trace = parseTrace(run.tracePath);

          expect(() => assertRecordedPassIs(trace, state, "post-run")).not.toThrow();
          expect(() => assertRecordedPassIs(trace, state, "as-found")).toThrow();
        } finally {
          cleanupAll(trees);
        }
      });

      it('check (generatedBy "check"): the recorded pass is as-found (its only pass) — assertRecordedPassIs("as-found") does not throw', () => {
        const { consumer, plugin } = buildTwoRowTrees();
        const trees = { consumer, plugin };
        try {
          setRowState(trees, "row-1", "stale");
          setRowState(trees, "row-2", "in-sync");

          const run = runCheck(trees);
          const state = readDriftState(consumer.root);
          const trace = parseTrace(run.tracePath);

          expect(() => assertRecordedPassIs(trace, state, "as-found")).not.toThrow();
        } finally {
          cleanupAll(trees);
        }
      });
    });

    // ───────────────────────────── PROP-MTM-07 ─────────────────────────────

    describe("PROP-MTM-07 — a repeat sync is byte-for-byte a no-op (5 conjuncts)", () => {
      it("tree unchanged (modulo drift-state's own timestamp), sync manifest and backups identical, both runs exit 0", () => {
        const { consumer, plugin } = buildTwoRowTrees();
        const trees = { consumer, plugin };
        const driftStateRel = join(".claude", "workflows", ".pdlc-drift-state.json");
        try {
          setRowState(trees, "row-1", "stale");
          setRowState(trees, "row-2", "in-sync");

          const run1 = runSync(trees);
          expect(run1.status).toBe(0); // conjunct 5a

          const manifest1 = readSyncManifest(consumer.root);
          const state1 = readDriftState(consumer.root);
          const backups1 = listBackups(consumer.root);
          const snap1 = snapshotTree(consumer.root);

          const run2 = runSync(trees);
          expect(run2.status).toBe(0); // conjunct 5b

          const manifest2 = readSyncManifest(consumer.root);
          const state2 = readDriftState(consumer.root);
          const backups2 = listBackups(consumer.root);
          const snap2 = snapshotTree(consumer.root);

          // Conjunct 1 — full tree byte-identical, except the drift-state file's own
          // `generatedAtUtc`-bearing bytes (excluded by path, not by content — every OTHER byte
          // of every OTHER file, including the sync manifest and every backup, must match).
          const allPaths = new Set([...snap1.keys(), ...snap2.keys()]);
          for (const rel of allPaths) {
            if (rel === driftStateRel) continue;
            expect(snap2.has(rel)).toBe(true);
            expect(snap1.has(rel)).toBe(true);
            expect(snap2.get(rel).equals(snap1.get(rel))).toBe(true);
          }

          // Conjunct 2 — sync manifest byte-identical at the object level (incl. syncedAtUtc).
          expect(manifest2).toEqual(manifest1);

          // Conjunct 3 — drift state identical modulo generatedAtUtc.
          const { generatedAtUtc: _g1, ...rest1 } = state1;
          const { generatedAtUtc: _g2, ...rest2 } = state2;
          expect(rest2).toEqual(rest1);

          // Conjunct 4 — no new backup.
          expect(backups2).toEqual(backups1);
        } finally {
          cleanupAll(trees);
        }
      });
    });

    // ───────────────────────────── PROP-NEG-03 (forward half) ─────────────────────────────

    describe("PROP-NEG-03 (forward half) — backup precedes the mutation it protects, restores the exact pre-op bytes, missing rows get none", () => {
      it("a stale row's backup precedes its copy, and the backup's bytes equal the pre-sync bytes exactly", () => {
        const { consumer, plugin } = buildTwoRowTrees();
        const trees = { consumer, plugin };
        try {
          setRowState(trees, "row-2", "in-sync");
          const preOpBytes = "exact-pre-op-bytes-row-1";
          setRowState(trees, "row-1", "stale", { consumerBytes: preOpBytes });

          const run = runSync(trees);
          const trace = parseTrace(run.tracePath);
          const backupIdx = trace.findIndex((r) => r.op === "backup" && r.rowId === "row-1");
          const copyIdx = trace.findIndex((r) => r.op === "copy" && r.rowId === "row-1");
          expect(backupIdx).toBeGreaterThanOrEqual(0);
          expect(copyIdx).toBeGreaterThanOrEqual(0);
          expect(backupIdx).toBeLessThan(copyIdx);

          const backups = listBackups(consumer.root).filter((b) => b.id === "row-1");
          expect(backups.length).toBeGreaterThanOrEqual(1);
          expect(readBackupBytes(consumer.root, backups[0].name).toString()).toBe(preOpBytes);
        } finally {
          cleanupAll(trees);
        }
      });

      it("a retirement's backup precedes its delete (both trace records keyed by the retired basename)", () => {
        const { trees, retiredRel, retiredBasename } = buildRetiringTrees();
        try {
          const run = runSync(trees);
          const trace = parseTrace(run.tracePath);
          const backupIdx = trace.findIndex((r) => r.op === "backup" && r.rowId === retiredBasename);
          const deleteIdx = trace.findIndex((r) => r.op === "delete" && r.rowId === retiredBasename);
          expect(backupIdx).toBeGreaterThanOrEqual(0);
          expect(deleteIdx).toBeGreaterThanOrEqual(0);
          expect(backupIdx).toBeLessThan(deleteIdx);
          void retiredRel;
        } finally {
          cleanupAll(trees);
        }
      });

      it("a missing row gets no backup record at all (there is nothing to back up)", () => {
        const { consumer, plugin } = buildTwoRowTrees();
        const trees = { consumer, plugin };
        try {
          setRowState(trees, "row-2", "in-sync");
          setRowState(trees, "row-1", "missing");

          const run = runSync(trees);
          expect(run.status).toBe(0);
          expect(listBackups(consumer.root).filter((b) => b.id === "row-1").length).toBe(0);
          const abs = join(consumer.root, ".claude/workflows/row-1.bundle.js");
          expect(readFileSync(abs).equals(plugin.bytesOf("row-1"))).toBe(true);
        } finally {
          cleanupAll(trees);
        }
      });
    });

    // ───────────────────────────── PROP-NEG-06 ─────────────────────────────

    describe("PROP-NEG-06 — a retired path is deleted iff R's post-copy state is in-sync (all six R-states, unknown over all four reasons)", () => {
      it("Run A — in-sync deletes; local-edit/unverified (no --force) preserve, packed in one manifest/run", () => {
        const specs = [
          { id: "row-a", retiredRel: ".claude/workflows/legacy-a.js" },
          { id: "row-b", retiredRel: ".claude/workflows/legacy-b.js" },
          { id: "row-c", retiredRel: ".claude/workflows/legacy-c.js" },
        ];
        const { trees, rows } = buildMultiRetiringTrees(specs);
        const { consumer } = trees;
        try {
          setRowState(trees, "row-a", "in-sync");
          setRowState(trees, "row-b", "local-edit", { originalBytes: "orig-b", consumerBytes: "edited-b" });
          setRowState(trees, "row-c", "unverified", { consumerBytes: "unverified-c" });

          runSync(trees);

          const abs = (r) => join(consumer.root, ...r.retiredRel.split("/"));
          expect(existsSync(abs(rows[0]))).toBe(false);
          expect(existsSync(abs(rows[1]))).toBe(true);
          expect(existsSync(abs(rows[2]))).toBe(true);
        } finally {
          cleanupAll(trees);
        }
      });

      it("Run B — stale/missing with artifact-copy (total-failure) fault: post-copy state never reaches in-sync, both preserved, packed", () => {
        const specs = [
          { id: "row-d", retiredRel: ".claude/workflows/legacy-d.js" },
          { id: "row-e", retiredRel: ".claude/workflows/legacy-e.js" },
        ];
        const { trees, rows } = buildMultiRetiringTrees(specs);
        const { consumer } = trees;
        try {
          setRowState(trees, "row-d", "stale");
          setRowState(trees, "row-e", "missing");

          runSync(trees, { fault: ["artifact-copy:row-d", "artifact-copy:row-e"] });

          for (const r of rows) {
            expect(existsSync(join(consumer.root, ...r.retiredRel.split("/")))).toBe(true);
          }
        } finally {
          cleanupAll(trees);
        }
      });

      it("Run C — unknown over all three packable reasons (plugin-artifact-missing/-unreadable, consumer-artifact-unreadable), packed", () => {
        const specs = [
          { id: "row-f", retiredRel: ".claude/workflows/legacy-f.js" },
          { id: "row-g", retiredRel: ".claude/workflows/legacy-g.js" },
          { id: "row-h", retiredRel: ".claude/workflows/legacy-h.js" },
        ];
        const { trees, rows } = buildMultiRetiringTrees(specs);
        const { consumer, plugin } = trees;
        try {
          rmSync(join(plugin.pluginRoot, "workflows", "dist", "row-f.bundle.js"), { force: true });
          setRowState(trees, "row-h", "in-sync");

          const run = runSync(trees, {
            fault: ["plugin-artifact-read:row-g", "consumer-artifact-read:row-h"],
          });

          for (const r of rows) {
            expect(existsSync(join(consumer.root, ...r.retiredRel.split("/")))).toBe(true);
          }
          const state = readDriftState(consumer.root);
          const reasonOf = (id) => (state.rows.find((r) => r.id === id) || {}).reason;
          expect(reasonOf("row-f")).toBe("plugin-artifact-missing");
          expect(reasonOf("row-g")).toBe("plugin-artifact-unreadable");
          expect(reasonOf("row-h")).toBe("consumer-artifact-unreadable");
          void run;
        } finally {
          cleanupAll(trees);
        }
      });

      it("Run D — unknown/hash-tool-absent (machine-wide; cannot be packed with the other reasons in one run): preserved", () => {
        const specs = [{ id: "row-only", retiredRel: ".claude/workflows/legacy-only.js" }];
        const { trees, rows } = buildMultiRetiringTrees(specs);
        const { consumer, plugin } = trees;
        try {
          const noHashPath = ["bash", "git", "python3", "mv", "rm", "date", "printf", "mkdir"];
          const run = runScript("sync", {
            consumerRoot: consumer.root,
            home: consumer.home,
            pluginRoot: plugin.pluginRoot,
            path: noHashPath,
            trace: true,
          });
          run.root = consumer.root;

          expect(existsSync(join(consumer.root, ...rows[0].retiredRel.split("/")))).toBe(true);
          const state = readDriftState(consumer.root);
          const row = state.rows.find((r) => r.id === "row-only");
          expect(row.state).toBe("unknown");
          expect(row.reason).toBe("hash-tool-absent");
          void run;
        } finally {
          cleanupAll(trees);
        }
      });

      it("Run E — the retirement's OWN backup-verify failure preserves the path even though R is in-sync post-copy (necessary, not sufficient)", () => {
        const { trees, retiredRel } = buildRetiringTrees();
        const { consumer } = trees;
        try {
          const run = runSync(trees, { fault: ["backup-corrupt:orchestrate-dev.js"] });
          expect(existsSync(join(consumer.root, ...retiredRel.split("/")))).toBe(true);
          expectFailOpen(run, {
            path: retiredRel,
            operation: "backup-verify",
            entrypoint: "sync",
            remainingRows: ["row-1"],
          });
        } finally {
          cleanupAll(trees);
        }
      });

      it("Run F — the retirement's OWN delete failure (fault keyed by rowId, not the retired basename) preserves the path despite R being in-sync post-copy", () => {
        const { trees, retiredRel } = buildRetiringTrees();
        const { consumer } = trees;
        try {
          runSync(trees, { fault: ["retire-delete:row-1"] });
          expect(existsSync(join(consumer.root, ...retiredRel.split("/")))).toBe(true);
        } finally {
          cleanupAll(trees);
        }
      });
    });

    // ───────────────────────────── PROP-NEG-07 (blast-radius half) ─────────────────────────────

    describe("PROP-NEG-07 (blast-radius half) — sync writes nothing outside .claude/workflows/ (plus the two AC-2.9(1) directories), and never invokes git", () => {
      it("every path that changes across a sync run lies under .claude/workflows/, against a tree with unrelated siblings", () => {
        const { consumer, plugin } = buildTwoRowTrees();
        const trees = { consumer, plugin };
        try {
          setRowState(trees, "row-1", "stale");
          setRowState(trees, "row-2", "in-sync");
          writeFileSync(join(consumer.root, "unrelated-root-file.txt"), "leave me alone");
          mkdirSync(join(consumer.root, "src"), { recursive: true });
          writeFileSync(join(consumer.root, "src", "app.js"), "console.log('app');");

          const before = snapshotTree(consumer.root);
          runSync(trees);
          const after = snapshotTree(consumer.root);

          const allPaths = new Set([...before.keys(), ...after.keys()]);
          for (const rel of allPaths) {
            if (rel === ".git" || rel.startsWith(".git/")) continue;
            const b = before.get(rel);
            const a = after.get(rel);
            const unchanged = b !== undefined && a !== undefined && b.equals(a);
            if (!unchanged) {
              expect(rel === ".claude/workflows" || rel.startsWith(".claude/workflows/")).toBe(true);
            }
          }
        } finally {
          cleanupAll(trees);
        }
      });

      it("a fresh consumer tree with no .claude/ at all: every newly-created path lies under .claude/workflows/", () => {
        const plugin = makePluginTree();
        const consumer = makeConsumerTree({ git: true });
        const trees = { consumer, plugin };
        try {
          const before = snapshotTree(consumer.root);
          runSync(trees);
          const after = snapshotTree(consumer.root);

          for (const rel of after.keys()) {
            if (!before.has(rel)) {
              expect(rel === ".claude/workflows" || rel.startsWith(".claude/workflows/")).toBe(true);
            }
          }
        } finally {
          cleanupAll(trees);
        }
      });

      it("sync never invokes git — a sandboxed PATH with no git tool still completes a normal sync run", () => {
        const { consumer, plugin } = buildTwoRowTrees();
        const trees = { consumer, plugin };
        try {
          setRowState(trees, "row-1", "stale");
          setRowState(trees, "row-2", "in-sync");
          const noGitPath = ["bash", "python3", "shasum", "sha1sum", "mv", "rm", "date", "printf", "mkdir"];

          const run = runSync(trees, { path: noGitPath });

          expect(run.status).toBe(0);
          const abs = join(consumer.root, ".claude/workflows/row-1.bundle.js");
          expect(readFileSync(abs).equals(plugin.bytesOf("row-1"))).toBe(true);
        } finally {
          cleanupAll(trees);
        }
      });
    });
  }
);
