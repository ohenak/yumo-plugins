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
import { parseTrace, assertPostCopyNarrow, assertRecordedPassIs } from "./helpers/driftOrdering.js";
import { makeConsumerTree, makePluginTree, setRowState } from "./helpers/driftFixtures.js";

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
    trace: true,
  });
  run.root = trees.consumer.root;
  run.consumerRoot = trees.consumer.root;
  return run;
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
  }
);
