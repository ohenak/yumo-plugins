/**
 * driftOrdering.test.js — TSPEC §4.3 (the AC-2.9(1) classify-before-create oracle), §14.1's
 * **PH-1** (the phase floor over a retiring-fixture sync run), and §4.4 (the unwritable-trace
 * red test).
 *
 * RED-terminal (Phase 3, batch 5, PLAN T-29). C1 (`pdlc/hooks/scripts/lib/pdlc-drift.sh`,
 * batches 6-10) and the two entrypoint scripts C2/C3 build on
 * (`sync-workflows.sh`/`check-workflow-drift.sh`, batch 11) do not exist yet — every
 * `runScript("sync", …)` call below fails at the shell (the script path does not exist), no
 * trace file is ever written, and `parseTrace` throws `TraceUnavailableError` for every `it()`
 * in this file. That is the correct RED reason for this batch: nothing here is asserting
 * against behavior C1/C2/C3 haven't implemented, only against the harness surface (T-08a/b,
 * T-15, T-16) that already lands green.
 *
 * File ownership (PLAN, single-writer-per-file): T-29 owns exactly this file.
 * `__tests__/helpers/driftOrdering.js` (the oracle functions this file calls) is T-16's
 * (batch 4, already landed) — this file is a consumer, not a writer, of that module.
 */

import { mkdtempSync, writeFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import { describeOrSkip } from "./helpers/driftCapabilities.js";
import { runScript, readDriftState, readSyncManifest } from "./helpers/driftHarness.js";
import { makeConsumerTree, makePluginTree, setRowState } from "./helpers/driftFixtures.js";
import {
  parseTrace,
  assertClassifyBeforeCreate,
  assertPhaseOrder,
  TraceUnavailableError,
} from "./helpers/driftOrdering.js";

// ───────────────────────────── shared fixture builders ─────────────────────────────

/**
 * A `freshConsumer`-shaped tree (§13.1): a git-rooted consumer with no `.claude/` yet, paired
 * with a plain two-row plugin tree — every row starts `missing`, so a conforming sync run has
 * to `mkdir`/`write`/`copy` for both, which is what conjuncts (b) and (c) of §4.3's oracle
 * need something to fail against.
 */
function buildFreshConsumerFixture() {
  const consumer = makeConsumerTree({ git: true, claudeDir: false });
  const plugin = makePluginTree({});
  return { consumer, plugin };
}

/**
 * A `retiredPresent`-shaped tree (§13.1): `syncedConsumer` (every row already `in-sync`, with
 * a matching sync manifest) plus an orphaned consumer file at a path named by `row-1`'s
 * `retires` — the shape PH-1 needs to observe all three classify phases on one run (`as-found`
 * over both rows, `post-copy`'s narrow pass over the retiring row only, `post-run` after the
 * retirement completes).
 */
function buildRetiredPresentFixture() {
  const consumer = makeConsumerTree({
    git: true,
    claudeDir: false,
    files: { ".claude/workflows/orchestrate-dev.js": "legacy-bytes" },
  });
  const plugin = makePluginTree({
    rows: [
      { id: "row-1", retires: [".claude/workflows/orchestrate-dev.js"] },
      { id: "row-2" },
    ],
  });
  const trees = { consumer, plugin };
  setRowState(trees, "row-1", "in-sync");
  setRowState(trees, "row-2", "in-sync");
  return trees;
}

function runSync(trees) {
  return runScript("sync", {
    consumerRoot: trees.consumer.root,
    home: trees.consumer.home,
    pluginRoot: trees.plugin.pluginRoot,
  });
}

function cleanup(...trees) {
  for (const t of trees) {
    t.consumer.cleanup();
    t.plugin.cleanup();
  }
}

/**
 * The `blockedTrace` fixture (§13.2): `PDLC_TRACE_FILE` points under a **regular file**, so
 * every `open(…, O_APPEND|O_CREAT)` beneath it fails `ENOTDIR` — a construction that is not
 * bypassed by uid 0, unlike a `chmod 000` directory (§4.4).
 */
function makeBlockedTracePath() {
  const dir = mkdtempSync(join(tmpdir(), "pdlc-blocker-"));
  const blockerFile = join(dir, "blocker");
  writeFileSync(blockerFile, "this is a regular file, not a directory");
  return { blockedTracePath: join(blockerFile, "trace.tsv"), cleanupBlocker: () => rmSync(dir, { recursive: true, force: true }) };
}

/**
 * Deep-clones `value`, dropping every key ending in `Utc` at any depth — the one field TSPEC
 * §4.4 permits to differ between two otherwise-byte-identical runs (`generatedAtUtc`,
 * `syncedAtUtc`).
 */
function stripTimestamps(value) {
  if (Array.isArray(value)) return value.map(stripTimestamps);
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, v] of Object.entries(value)) {
      if (key.endsWith("Utc")) continue;
      out[key] = stripTimestamps(v);
    }
    return out;
  }
  return value;
}

describeOrSkip(
  "driftOrdering — TSPEC §4.3, §14.1 PH-1, §4.4",
  "hash",
  [
    "every fixture here realises at least one row as in-sync via setRowState, which requires " +
      "a hash utility to derive the sync-manifest entry's consumerHash/pluginHash",
  ],
  () => {
    describe("§4.3 — assertClassifyBeforeCreate, the AC-2.9(1) oracle's four conjuncts", () => {
      it(
        "a fresh consumer's sync run classifies every manifest row id as-found before any " +
          "mkdir/write/copy, off the manifest read alone (no globbing)",
        () => {
          const trees = buildFreshConsumerFixture();
          try {
            const run = runSync(trees);
            const trace = parseTrace(run.tracePath);
            const expectedRowIds = trees.plugin.manifest.rows.map((r) => r.id);

            // (a) multiset positive-presence over EVERY manifest row id — not a count, not a set.
            // (b) max(seq of as-found classify) < min(seq of any create/write op).
            // (c) no mkdir/write/copy/backup/delete before the first as-found classify.
            // (d) a manifest-read record exists and precedes every as-found classify record —
            //     the executable form of "no globbing".
            assertClassifyBeforeCreate(trace, expectedRowIds);
          } finally {
            cleanup(trees);
          }
        }
      );

      it(
        "conjunct (a) is a multiset, not a set — a duplicated as-found classify record for " +
          "one row and none for another must fail",
        () => {
          // A hand-built trace fragment (TSPEC §4.3's helper contract is over `{phase, op,
          // rowId}` records, not necessarily a parsed file) — row-2 never classified at all,
          // row-1 classified twice: a set-equality form would wrongly pass this.
          const trace = [
            { seq: 1, phase: "run", op: "manifest-read", rowId: "-", arg: "manifest.json" },
            { seq: 2, phase: "as-found", op: "classify", rowId: "row-1", arg: "missing" },
            { seq: 3, phase: "as-found", op: "classify", rowId: "row-1", arg: "missing" },
          ];
          expect(() => assertClassifyBeforeCreate(trace, ["row-1", "row-2"])).toThrow();
        }
      );
    });

    describe("§14.1 PH-1 — the phase floor lands on a retiring-fixture sync run", () => {
      it(
        "all three classify phases (as-found, post-copy, post-run) appear on one run; " +
          "assertPhaseOrder is the named call site; every non-classify record carries run",
        () => {
          const trees = buildRetiredPresentFixture();
          try {
            const run = runSync(trees);
            const trace = parseTrace(run.tracePath);

            // The call site TSPEC §14.1 PH-1 names.
            assertPhaseOrder(trace);

            const classifyPhasesSeen = new Set(
              trace.filter((r) => r.op === "classify").map((r) => r.phase)
            );
            expect(classifyPhasesSeen).toEqual(new Set(["as-found", "post-copy", "post-run"]));

            for (const record of trace) {
              if (record.op !== "classify") {
                expect(record.phase).toBe("run");
              }
            }
          } finally {
            cleanup(trees);
          }
        }
      );
    });

    describe("§4.4 — the unwritable-trace red test", () => {
      it("an unwritable trace does not change any production observable", () => {
        // A SHARED plugin tree, not one per side: `syncCommand` embeds `${PDLC_PLUGIN_ROOT}`
        // verbatim (`pdlc_sync_command`, FSPEC §1.3/AC-0.4), so two independently-built plugin
        // fixtures would give the two runs' drift-state records a genuinely different
        // `syncCommand` value — a field `stripTimestamps` correctly does NOT hide (TSPEC §4.4
        // permits only the `…Utc` timestamp fields to differ). Sharing one plugin root makes
        // the comparison test what it means to test: that an unwritable trace changes nothing
        // else about the run, with `syncCommand` now byte-identical for a real reason instead
        // of a fixture artifact.
        const sharedPlugin = makePluginTree({});
        const writableConsumer = makeConsumerTree({ git: true, claudeDir: false });
        const blockedConsumer = makeConsumerTree({ git: true, claudeDir: false });
        const writableTrees = { consumer: writableConsumer, plugin: sharedPlugin };
        const blockedTrees = { consumer: blockedConsumer, plugin: sharedPlugin };
        const { blockedTracePath, cleanupBlocker } = makeBlockedTracePath();

        try {
          const writableRun = runSync(writableTrees);
          const blockedRun = runScript("sync", {
            consumerRoot: blockedTrees.consumer.root,
            home: blockedTrees.consumer.home,
            pluginRoot: blockedTrees.plugin.pluginRoot,
            tracePath: blockedTracePath,
          });

          expect(blockedRun.status).toBe(writableRun.status);
          expect(blockedRun.stdout).toBe(writableRun.stdout);
          expect(blockedRun.stderr).toBe(writableRun.stderr);

          const writableState = stripTimestamps(readDriftState(writableTrees.consumer.root));
          const blockedState = stripTimestamps(readDriftState(blockedTrees.consumer.root));
          expect(blockedState).toEqual(writableState);

          const writableManifest = stripTimestamps(readSyncManifest(writableTrees.consumer.root));
          const blockedManifest = stripTimestamps(readSyncManifest(blockedTrees.consumer.root));
          expect(blockedManifest).toEqual(writableManifest);
        } finally {
          writableConsumer.cleanup();
          blockedConsumer.cleanup();
          sharedPlugin.cleanup();
          cleanupBlocker();
        }
      });

      it(
        "…and the harness fails the test rather than passing vacuously: parseTrace throws " +
          "TraceUnavailableError, and assertClassifyBeforeCreate propagates it",
        () => {
          const { blockedTracePath, cleanupBlocker } = makeBlockedTracePath();
          try {
            expect(() => parseTrace(blockedTracePath)).toThrow(TraceUnavailableError);

            // The failure mode this guards: a future maintainer "fixing" a flaky ordering test
            // by making a helper swallow the read failure and return `[]`. Composed the way a
            // real caller would — parse, then assert — the error must still surface as
            // TraceUnavailableError, not as conjunct (a)'s empty-multiset message.
            const classifyFromPossiblyBlockedTrace = (path, expectedRowIds) =>
              assertClassifyBeforeCreate(parseTrace(path), expectedRowIds);

            expect(() => classifyFromPossiblyBlockedTrace(blockedTracePath, ["row-1"])).toThrow(
              TraceUnavailableError
            );
          } finally {
            cleanupBlocker();
          }
        }
      );
    });
  }
);
