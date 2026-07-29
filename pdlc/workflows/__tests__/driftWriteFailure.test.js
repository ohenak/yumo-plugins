/**
 * driftWriteFailure.test.js — Write-failure suite (PLAN T-26, batch 5). TSPEC §6.
 *
 * RED-terminal (PLAN batch 5): C1's writers (`pdlc-drift.sh`) do not exist yet — that lands
 * at T-34 (batch 9). Every `runScript` call below currently fails with "no such file or
 * directory" rather than for the reason each assertion names; the suite is authored to read
 * correctly once T-34 lands. Single-writer-per-file: T-26 owns only this file.
 *
 * Covers, per PLAN T-26 / TSPEC §6:
 *   - AT-17 (§6.3's "both-failed" message, O-6): drift-state line first, asserted by stderr
 *     index.
 *   - AT-27 (§5.2 token 12, `backup-corrupt`): `expectFailOpen({operation: "backup-verify"})`
 *     plus the byte-identical original-consumer-bytes conjunct (AC-2.9(4)'s negative). Per
 *     TSPEC §6.1/§6.2, `backup-verify` has no permission form at all — only the fault-injected
 *     form is authored here.
 *   - AT-35 (§5.2 token 10, `artifact-copy-corrupt`): both red directions — exit 4 (not 1),
 *     post-run `unverified` (not `local-edit`).
 *   - §6.3's per-surface fail-open differences (hook / `--check` / sync).
 *   - §6.4's removal-only sync-manifest-rewrite fixture (`removalOnlySyncManifest`, built
 *     inline here — TSPEC names no other landing file for it).
 *   - Dedicated floor-completion coverage for `mkdir`, `drift-state-invalidate`,
 *     `drift-state-unlink`, `backup`, and `retire-delete` — TSPEC §6.1's "landing test" column
 *     assigns these operations' primary AT narratives to other files (§6.5, AT-15, AT-16), but
 *     TSPEC §1.4's `writeFailures.operation` floor is explicitly counted in *this* file, so each
 *     of the nine operations must be exercised here at least once regardless of which file owns
 *     its narrative.
 *   - The `writeFailures.operation` meta-oracle (TSPEC §1.4): the 5 recordable operations
 *     asserted present in `writeFailures` at least once; the 4 stderr-only operations
 *     asserted absent from the record and present on stderr at least once.
 */

import { readFileSync } from "fs";
import { join } from "path";
import {
  runScript,
  readDriftState,
  readSyncManifest,
  expectFailOpen,
  allOf,
} from "./helpers/driftHarness.js";
import { assertRecordedPassIs } from "./helpers/driftOrdering.js";
import { makeConsumerTree, makePluginTree, setRowState } from "./helpers/driftFixtures.js";

// ───────────────────────────── §1.4 meta-oracle: writeFailures.operation floor ─────────────
//
// Populated by each `it()` below that exercises an operation via `expectFailOpen`. The two
// closing tests assert set-equality against the literal domains TSPEC §6.1/FSPEC §4.5 fix —
// the repo's shipped meta-oracle pattern (`guardRowIds.js` + `guardMatrix.test.js`), reused
// rather than reinvented (TSPEC §1.4).

const RECORDABLE_OPERATIONS = Object.freeze([
  "artifact-copy",
  "backup",
  "backup-verify",
  "retire-delete",
  "sync-manifest-update",
]);

const STDERR_ONLY_OPERATIONS = Object.freeze([
  "mkdir",
  "drift-state-replace",
  "drift-state-invalidate",
  "drift-state-unlink",
]);

const SYNC_MANIFEST_PATH = ".claude/workflows/.pdlc-sync-manifest.json";

const recordableCovered = new Set();
const stderrOnlyCovered = new Set();

function buildTree(rows) {
  const consumer = makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true });
  const plugin = makePluginTree({ rows });
  return { consumer, plugin };
}

function attachRoot(run, root) {
  run.root = root;
  return run;
}

// ───────────────────────────── AT-17 — the both-failed message (O-6) ────────────────────────

describe("AT-17 — a copy fails and the drift-state write fails, same sync run (O-6)", () => {
  it("prints both W-7 lines, drift-state line first, asserted by stderr index", () => {
    const { consumer, plugin } = buildTree([{ id: "row-1" }]);
    const row = plugin.manifest.rows[0];
    try {
      const run = attachRoot(
        runScript("sync", {
          consumerRoot: consumer.root,
          home: consumer.home,
          pluginRoot: plugin.pluginRoot,
          fault: ["drift-state-replace", `artifact-copy:${row.id}`],
        }),
        consumer.root
      );

      expect(run.status).toBe(4);

      expectFailOpen(run, { operation: "drift-state-replace", entrypoint: "sync" });
      stderrOnlyCovered.add("drift-state-replace");

      expectFailOpen(run, {
        operation: "artifact-copy",
        entrypoint: "sync",
        path: row.consumerPath,
        remainingRows: [],
      });
      recordableCovered.add("artifact-copy");

      const w7s = allOf(run.stderr, "W-7");
      const driftStateLine = w7s.find((m) => m.groups.operation === "drift-state-replace");
      const artifactCopyLine = w7s.find(
        (m) => m.groups.operation === "artifact-copy" && m.groups.path === row.consumerPath
      );
      expect(driftStateLine).toBeDefined();
      expect(artifactCopyLine).toBeDefined();
      // O-6: the drift-state line is printed FIRST — the operator must be told the recorded
      // state does not describe this run before being told about the failed copy, or they fix
      // the copy, re-run, and are still blocked by an invalidated record.
      expect(driftStateLine.index).toBeLessThan(artifactCopyLine.index);
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });
});

// ───────────────────────────── AT-27 — backup-verify's negative (AC-2.9(4)) ──────────────────

describe("AT-27 — a local-edit row under --force whose backup write does not land", () => {
  it("leaves the original consumer bytes untouched, reports the operation skipped, and exits 4", () => {
    const { consumer, plugin } = buildTree([{ id: "row-1" }]);
    const row = plugin.manifest.rows[0];
    const editedBytes = Buffer.from("locally-edited-bytes-for-row-1");
    try {
      setRowState({ consumer, plugin }, row.id, "local-edit", {
        originalBytes: Buffer.from("original-synced-bytes-for-row-1"),
        consumerBytes: editedBytes,
      });

      const run = attachRoot(
        runScript("sync-force", {
          consumerRoot: consumer.root,
          home: consumer.home,
          pluginRoot: plugin.pluginRoot,
          fault: [`backup-corrupt:${row.id}`],
        }),
        consumer.root
      );

      expect(run.status).toBe(4);

      expectFailOpen(run, {
        operation: "backup-verify",
        entrypoint: "sync-force",
        path: row.consumerPath,
        remainingRows: [],
      });
      recordableCovered.add("backup-verify");

      // AC-2.9(4)'s negative: the original consumer bytes are unchanged — the run never
      // overwrote the file it could not safely back up. Read AFTER the run, since the whole
      // point is that nothing landed.
      const postRunBytes = readFileSync(join(consumer.root, row.consumerPath));
      expect(postRunBytes.equals(editedBytes)).toBe(true);
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });
});

// ───────────────────────────── AT-35 — artifact-copy-corrupt's two red directions ────────────

describe("AT-35 — a copy lands corrupted (fault-injected re-read mismatch)", () => {
  it("exits 4 (not 1) and the row measures unverified (not local-edit) post-run", () => {
    const { consumer, plugin } = buildTree([{ id: "row-1" }]);
    const row = plugin.manifest.rows[0];
    try {
      setRowState({ consumer, plugin }, row.id, "stale", {
        consumerBytes: Buffer.from("pre-sync-stale-bytes-for-row-1"),
      });

      const run = attachRoot(
        runScript("sync", {
          consumerRoot: consumer.root,
          home: consumer.home,
          pluginRoot: plugin.pluginRoot,
          fault: [`artifact-copy-corrupt:${row.id}`],
        }),
        consumer.root
      );

      // Red direction (i): exit 4, never 1 — FSPEC §5.8's exit-1 derivation is what an
      // implementation that skips the re-read would produce.
      expect(run.status).toBe(4);

      expectFailOpen(run, {
        operation: "artifact-copy",
        entrypoint: "sync",
        path: row.consumerPath,
        remainingRows: [],
      });
      recordableCovered.add("artifact-copy");

      // Red direction (ii): the row's pre-existing sync-manifest entry does not survive a
      // corrupted copy, so the post-run pass measures it `unverified`, never `local-edit`.
      const state = readDriftState(consumer.root);
      const postRunRow = state.rows.find((r) => r.id === row.id);
      expect(postRunRow.state).toBe("unverified");
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });
});

// ───────────────────────────── §6.3 — per-surface fail-open differences ─────────────────────

describe("§6.3 — per-surface fail-open differences", () => {
  it("hook: a drift-state write failure still exits 0, and the record + W-7 are still written", () => {
    const { consumer, plugin } = buildTree([{ id: "row-1" }]);
    try {
      setRowState({ consumer, plugin }, "row-1", "in-sync");

      const run = attachRoot(
        runScript("hook", {
          consumerRoot: consumer.root,
          home: consumer.home,
          pluginRoot: plugin.pluginRoot,
          fault: ["drift-state-replace"],
        }),
        consumer.root
      );

      expect(run.status).toBe(0);
      expectFailOpen(run, { operation: "drift-state-replace", entrypoint: "hook" });
      stderrOnlyCovered.add("drift-state-replace");
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });

  it("check: exit 4 on a drift-state write failure; check makes no artifact writes at all", () => {
    const consumer = makeConsumerTree({ git: true, claudeDir: true, workflowsDir: false });
    const plugin = makePluginTree({ rows: [{ id: "row-1" }] });
    try {
      const run = attachRoot(
        runScript("check", {
          consumerRoot: consumer.root,
          home: consumer.home,
          pluginRoot: plugin.pluginRoot,
          fault: ["mkdir"],
        }),
        consumer.root
      );

      expect(run.status).toBe(4);
      expectFailOpen(run, { operation: "mkdir", entrypoint: "check" });
      stderrOnlyCovered.add("mkdir");

      // The per-surface contract itself: `--check` cannot reach a recordable operation at all,
      // and asserting one against a `check` run is a fixture bug — `expectFailOpen` throws
      // rather than silently checking nothing (TSPEC §6.3).
      expect(() =>
        expectFailOpen(run, { operation: "artifact-copy", entrypoint: "check", path: "x" })
      ).toThrow();
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });

  it("sync: all nine operations are reachable; the post-run pass is asserted alongside a write failure", () => {
    const { consumer, plugin } = buildTree([{ id: "row-1" }, { id: "row-2" }]);
    try {
      setRowState({ consumer, plugin }, "row-1", "in-sync");
      setRowState({ consumer, plugin }, "row-2", "stale", {
        consumerBytes: Buffer.from("pre-sync-stale-bytes-for-row-2"),
      });

      const run = attachRoot(
        runScript("sync", {
          consumerRoot: consumer.root,
          home: consumer.home,
          pluginRoot: plugin.pluginRoot,
          fault: ["artifact-copy:row-2"],
        }),
        consumer.root
      );

      expect(run.status).toBe(4);

      const row2 = plugin.manifest.rows.find((r) => r.id === "row-2");
      expectFailOpen(run, {
        operation: "artifact-copy",
        entrypoint: "sync",
        path: row2.consumerPath,
        remainingRows: ["row-1"],
      });
      recordableCovered.add("artifact-copy");

      const state = readDriftState(consumer.root);
      assertRecordedPassIs(run.trace, state, "post-run");
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });
});

// ───────────────────────────── §6.4 — the removal-only sync-manifest-rewrite fixture ────────

function buildRemovalOnlySyncManifestFixture() {
  const { consumer, plugin } = buildTree([{ id: "A" }, { id: "B" }]);
  setRowState({ consumer, plugin }, "A", "stale", {
    consumerBytes: Buffer.from("pre-sync-bytes-for-A"),
  });
  setRowState({ consumer, plugin }, "B", "in-sync");
  return { consumer, plugin };
}

describe("§6.4 — removalOnlySyncManifest: a whole-file replace whose written set is empty", () => {
  it("assertions 1-4: A's entry is removed, B's entry survives byte-identical, A measures unverified, exit 4", () => {
    const { consumer, plugin } = buildRemovalOnlySyncManifestFixture();
    const rowA = plugin.manifest.rows.find((r) => r.id === "A");
    try {
      const preRunManifest = readSyncManifest(consumer.root);
      const preRunB = JSON.parse(JSON.stringify(preRunManifest.entries.B));

      const run = attachRoot(
        runScript("sync", {
          consumerRoot: consumer.root,
          home: consumer.home,
          pluginRoot: plugin.pluginRoot,
          fault: ["artifact-copy-corrupt:A"],
        }),
        consumer.root
      );

      expect(run.status).toBe(4);

      const manifest = readSyncManifest(consumer.root);
      expect(manifest.entries.A).toBeUndefined();
      expect(manifest.entries.B).toEqual(preRunB);

      const state = readDriftState(consumer.root);
      const rowARecord = state.rows.find((r) => r.id === "A");
      expect(rowARecord.state).toBe("unverified");

      expectFailOpen(run, {
        operation: "artifact-copy",
        entrypoint: "sync",
        path: rowA.consumerPath,
        remainingRows: ["B"],
      });
      recordableCovered.add("artifact-copy");
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });

  it("assertion 5: when the sync-manifest rewrite itself also fails, A's entry survives (the stated residual)", () => {
    const { consumer, plugin } = buildRemovalOnlySyncManifestFixture();
    const rowA = plugin.manifest.rows.find((r) => r.id === "A");
    try {
      const run = attachRoot(
        runScript("sync", {
          consumerRoot: consumer.root,
          home: consumer.home,
          pluginRoot: plugin.pluginRoot,
          fault: ["artifact-copy-corrupt:A", "sync-manifest-update"],
        }),
        consumer.root
      );

      expect(run.status).toBe(4);

      // The stated residual: a failed removal must not be treated as a success, so A's entry
      // survives this run even though its copy was corrupted.
      const manifest = readSyncManifest(consumer.root);
      expect(manifest.entries.A).toBeDefined();

      expectFailOpen(run, {
        operation: "artifact-copy",
        entrypoint: "sync",
        path: rowA.consumerPath,
        remainingRows: ["B"],
      });
      recordableCovered.add("artifact-copy");

      expectFailOpen(run, {
        operation: "sync-manifest-update",
        entrypoint: "sync",
        path: SYNC_MANIFEST_PATH,
        remainingRows: ["B"],
      });
      recordableCovered.add("sync-manifest-update");
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });
});

// ───────────────────────────── Floor completion: backup, retire-delete ──────────────────────
//
// TSPEC §6.1's "landing test" column sends these operations' primary AT narratives elsewhere
// (§6.3 generically, or other files entirely), but TSPEC §1.4 explicitly counts the
// `writeFailures.operation` floor in THIS file — so each operation still needs at least one
// exercise here, independent of which file tells its fuller story.

describe("floor completion — backup (token 11, §4.7 step 1)", () => {
  it("a local-edit row under --force whose backup copy itself fails to write", () => {
    const { consumer, plugin } = buildTree([{ id: "row-1" }]);
    const row = plugin.manifest.rows[0];
    const editedBytes = Buffer.from("locally-edited-bytes-for-row-1-backup-case");
    try {
      setRowState({ consumer, plugin }, row.id, "local-edit", {
        originalBytes: Buffer.from("original-synced-bytes-for-row-1-backup-case"),
        consumerBytes: editedBytes,
      });

      const run = attachRoot(
        runScript("sync-force", {
          consumerRoot: consumer.root,
          home: consumer.home,
          pluginRoot: plugin.pluginRoot,
          fault: [`backup:${row.id}`],
        }),
        consumer.root
      );

      expect(run.status).toBe(4);
      expectFailOpen(run, {
        operation: "backup",
        entrypoint: "sync-force",
        path: row.consumerPath,
        remainingRows: [],
      });
      recordableCovered.add("backup");

      // §4.7's failure branch: the row is not copied, the original is left untouched.
      const postRunBytes = readFileSync(join(consumer.root, row.consumerPath));
      expect(postRunBytes.equals(editedBytes)).toBe(true);
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });
});

describe("floor completion — retire-delete (token 13, §5.7)", () => {
  it("a retiring row's post-copy state is in-sync, its backup lands, but the delete itself fails", () => {
    const consumer = makeConsumerTree({
      git: true,
      claudeDir: true,
      workflowsDir: true,
      files: { "legacy-tool.sh": "old-format tool, superseded" },
    });
    const plugin = makePluginTree({ rows: [{ id: "row-1", retires: ["legacy-tool.sh"] }] });
    try {
      // row-1 is already in-sync — no copy needed, so its POST-COPY state (§5.7) is trivially
      // in-sync, which is retirement's own gate.
      setRowState({ consumer, plugin }, "row-1", "in-sync");

      const run = attachRoot(
        runScript("sync", {
          consumerRoot: consumer.root,
          home: consumer.home,
          pluginRoot: plugin.pluginRoot,
          fault: ["retire-delete:row-1"],
        }),
        consumer.root
      );

      expect(run.status).toBe(4);
      expectFailOpen(run, {
        operation: "retire-delete",
        entrypoint: "sync",
        path: "legacy-tool.sh",
        remainingRows: [],
      });
      recordableCovered.add("retire-delete");

      // §5.7's failure branch: "leave p" — the retired path is never deleted on a failed delete.
      const legacyStillPresent = readFileSync(join(consumer.root, "legacy-tool.sh"));
      expect(legacyStillPresent.length).toBeGreaterThan(0);
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });
});

describe("floor completion — the invalidation ladder's stderr-only operations (tokens 7, 8)", () => {
  it("faulting drift-state-replace, drift-state-invalidate, and drift-state-unlink together exhausts the ladder", () => {
    const { consumer, plugin } = buildTree([{ id: "row-1" }]);
    try {
      setRowState({ consumer, plugin }, "row-1", "in-sync");

      const run = attachRoot(
        runScript("sync", {
          consumerRoot: consumer.root,
          home: consumer.home,
          pluginRoot: plugin.pluginRoot,
          fault: ["drift-state-replace", "drift-state-invalidate", "drift-state-unlink"],
        }),
        consumer.root
      );

      expect(run.status).toBe(4);

      expectFailOpen(run, { operation: "drift-state-replace", entrypoint: "sync" });
      stderrOnlyCovered.add("drift-state-replace");

      expectFailOpen(run, { operation: "drift-state-invalidate", entrypoint: "sync" });
      stderrOnlyCovered.add("drift-state-invalidate");

      expectFailOpen(run, { operation: "drift-state-unlink", entrypoint: "sync" });
      stderrOnlyCovered.add("drift-state-unlink");
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });
});

// ───────────────────────────── §1.4 meta-oracle — the closing floor tests ────────────────────

describe("§1.4 meta-oracle — writeFailures.operation floor (all 9 values)", () => {
  it("every recordable operation was asserted present in writeFailures at least once", () => {
    expect(recordableCovered).toEqual(new Set(RECORDABLE_OPERATIONS));
  });

  it("every stderr-only operation was asserted absent from the record and present on stderr at least once", () => {
    expect(stderrOnlyCovered).toEqual(new Set(STDERR_ONLY_OPERATIONS));
  });
});
