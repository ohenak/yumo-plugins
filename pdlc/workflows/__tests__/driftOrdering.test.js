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

import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

import { describeOrSkip } from "./helpers/driftCapabilities.js";
import { runScript, readDriftState, readSyncManifest } from "./helpers/driftHarness.js";
import { makeConsumerTree, makePluginTree, setRowState } from "./helpers/driftFixtures.js";
import {
  parseTrace,
  assertClassifyBeforeCreate,
  assertPhaseOrder,
  assertRecordedPassIs,
  TraceUnavailableError,
} from "./helpers/driftOrdering.js";
import { seeded, resolveSeed } from "./helpers/driftGenerators.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

    // ─────────────────────── PLAN T-43 additions ───────────────────────
    //
    // Seven properties, appended to this same file per PLAN §3.1's single-writer convention
    // (T-43 is the sole writer of *appends* to this file — T-29's original content above is
    // untouched). Every falsification (mutation -> red -> revert -> green) named in each
    // block's doc comment was run by hand against the real subject file and recorded in
    // docs/pdlc-workflow-distribution/FALSIFICATION-LEDGER-T-43.md; this file only carries the
    // green assertions themselves.

    /**
     * PROP-BSL-07 — the resolved/unresolved baseline halves of AC-2.9(1)'s manifest-read
     * ordering rule. Falsification subject: C1 (`pdlc/hooks/scripts/lib/pdlc-drift.sh`).
     */
    describe("PROP-BSL-07 — the manifest-read record's ordering relative to classification", () => {
      it(
        "a resolved baseline: the manifest-read record precedes every classify record, and at " +
          "least one classify record exists",
        () => {
          const trees = buildFreshConsumerFixture();
          try {
            const run = runSync(trees);
            const trace = parseTrace(run.tracePath);
            const manifestReadIndex = trace.findIndex((r) => r.op === "manifest-read");
            expect(manifestReadIndex).toBeGreaterThanOrEqual(0);

            const classifyIndexes = trace
              .map((r, i) => (r.op === "classify" ? i : -1))
              .filter((i) => i !== -1);
            expect(classifyIndexes.length).toBeGreaterThan(0);
            for (const i of classifyIndexes) {
              expect(manifestReadIndex).toBeLessThan(i);
            }
          } finally {
            cleanup(trees);
          }
        }
      );

      it(
        "an unresolved baseline (malformed manifest) produces zero classify records — an " +
          "implementation that classifies first and discards the result on failure is exactly " +
          "what this falsifies (falsification mutation: PDLC_ROWS_ID+=(\"row-1\") in C1's " +
          "manifest-malformed branch)",
        () => {
          const consumer = makeConsumerTree({ git: true, claudeDir: false });
          const plugin = makePluginTree({ manifestRaw: "{ not valid json" });
          const trees = { consumer, plugin };
          try {
            const run = runSync(trees);
            const trace = parseTrace(run.tracePath);
            const classifyRecords = trace.filter((r) => r.op === "classify");
            expect(classifyRecords).toEqual([]);
          } finally {
            cleanup(trees);
          }
        }
      );
    });

    /**
     * PROP-CLS-04 (trace half) — every manifest row, at every row count, gets exactly one
     * as-found classify record. Falsification subject: C1's `pdlc_classify_all` loop.
     */
    describe("PROP-CLS-04 (trace half) — classify_all traces every manifest row, for every row count", () => {
      function buildFreshConsumerFixtureWithRows(n) {
        const rows = Array.from({ length: n }, (_, i) => ({ id: `row-${i + 1}` }));
        const consumer = makeConsumerTree({ git: true, claudeDir: false });
        const plugin = makePluginTree({ rows });
        return { consumer, plugin };
      }

      for (const n of [2, 3, 5]) {
        it(`classifies all ${n} rows exactly once in the as-found pass`, () => {
          const trees = buildFreshConsumerFixtureWithRows(n);
          try {
            const run = runSync(trees);
            const trace = parseTrace(run.tracePath);
            const expectedIds = trees.plugin.manifest.rows.map((r) => r.id);
            const asFoundIds = trace
              .filter((r) => r.op === "classify" && r.phase === "as-found")
              .map((r) => r.rowId);
            expect([...asFoundIds].sort()).toEqual([...expectedIds].sort());
          } finally {
            cleanup(trees);
          }
        });
      }
    });

    /**
     * PROP-MTM-03 (trace half) — only stale/missing rows are copy/backup-recorded; an in-sync
     * row is classified but never mutated. Falsification subject: `sync-workflows.sh`'s
     * `should_sync` case statement (line 344).
     */
    describe(
      "PROP-MTM-03 (trace half) — only stale/missing rows are copied or backed up",
      () => {
        function buildMixedStateFixture() {
          const consumer = makeConsumerTree({ git: true, claudeDir: false });
          const plugin = makePluginTree({ rows: [{ id: "row-1" }, { id: "row-2" }] });
          const trees = { consumer, plugin };
          setRowState(trees, "row-1", "in-sync");
          setRowState(trees, "row-2", "stale");
          return trees;
        }

        it(
          "an in-sync row is classified but never copy/backup-recorded; a stale row is both " +
            "as-found-classified 'stale' and copy-recorded, and the final (post-run) pass " +
            "matches the drift-state row for both",
          () => {
            const trees = buildMixedStateFixture();
            try {
              const run = runSync(trees);
              const trace = parseTrace(run.tracePath);
              const driftState = readDriftState(trees.consumer.root);

              // The recorded-pass oracle (§4.3): the FINAL pass a row is classified under
              // (post-run) must match what actually landed in the drift state — driftState's
              // `rows[].state` is the post-sync state, not the as-found one.
              assertRecordedPassIs(trace, driftState, "post-run");

              // The as-found pass is what the mutation-under-falsification (widening
              // `should_sync` to include "in-sync") would corrupt: row-2 must have been
              // as-found "stale" (its true original state) BEFORE the sync mutated it.
              const row2AsFound = trace.find(
                (r) => r.rowId === "row-2" && r.op === "classify" && r.phase === "as-found"
              );
              expect(row2AsFound.arg.toString()).toBe("stale");

              const row1CopyOrBackup = trace.filter(
                (r) => r.rowId === "row-1" && (r.op === "copy" || r.op === "backup")
              );
              expect(row1CopyOrBackup).toEqual([]);

              const row2Copy = trace.filter((r) => r.rowId === "row-2" && r.op === "copy");
              expect(row2Copy.length).toBeGreaterThan(0);
            } finally {
              cleanup(trees);
            }
          }
        );
      }
    );

    /**
     * PROP-SEAM-05 (trace-file half) — disabling tracing entirely changes no production
     * observable (stdout/stderr/status/driftState/manifest are all byte-identical whether or
     * not `PDLC_TRACE_FILE` is set). Falsification subject: C1's `pdlc_trace`.
     */
    describe("PROP-SEAM-05 (trace-file half) — disabling tracing changes no production observable", () => {
      it("stdout/stderr/status/driftState/manifest are byte-identical whether or not tracing is enabled", () => {
        const sharedPlugin = makePluginTree({});
        const tracedConsumer = makeConsumerTree({ git: true, claudeDir: false });
        const untracedConsumer = makeConsumerTree({ git: true, claudeDir: false });
        try {
          const tracedRun = runScript("sync", {
            consumerRoot: tracedConsumer.root,
            home: tracedConsumer.home,
            pluginRoot: sharedPlugin.pluginRoot,
            trace: true,
          });
          const untracedRun = runScript("sync", {
            consumerRoot: untracedConsumer.root,
            home: untracedConsumer.home,
            pluginRoot: sharedPlugin.pluginRoot,
            trace: false,
          });

          expect(untracedRun.status).toBe(tracedRun.status);
          expect(untracedRun.stdout).toBe(tracedRun.stdout);
          expect(untracedRun.stderr).toBe(tracedRun.stderr);

          const tracedState = stripTimestamps(readDriftState(tracedConsumer.root));
          const untracedState = stripTimestamps(readDriftState(untracedConsumer.root));
          expect(untracedState).toEqual(tracedState);

          const tracedManifest = stripTimestamps(readSyncManifest(tracedConsumer.root));
          const untracedManifest = stripTimestamps(readSyncManifest(untracedConsumer.root));
          expect(untracedManifest).toEqual(tracedManifest);
        } finally {
          tracedConsumer.cleanup();
          untracedConsumer.cleanup();
          sharedPlugin.cleanup();
        }
      });
    });

    /**
     * PROP-SEAM-07 — `pdlc_percent_encode`'s round trip: `decode(encode(b)) === b` for every
     * byte string `b` (0x00 excluded — architecturally unrepresentable in a bash argv string,
     * TSPEC §4.1/PLAN T-43), and `encode(b)` is pure 0x20-0x7E text. Batched via one spawn of
     * `helpers/bin/percent-encode-driver.sh` per property run (TSPEC §11.2), never one spawn
     * per case.
     *
     * The decoder used as the oracle here is a LOCAL, independently-written re-implementation
     * (`localPercentDecode`, below) — deliberately NOT `driftOrdering.js`'s
     * `percentDecodeToBuffer`. A round-trip property whose decoder is derived from the same
     * source as its encoder's oracle is tautological: the two would agree on a shared mistake
     * and the property would stay green through it. Two independent implementations is the
     * point, not an accident of what that module happens to export — so this comment is also
     * the reason not to "fix" the duplication by exporting the helper's decoder and importing
     * it here.
     *
     * Falsification subject: C1's `pdlc_percent_encode` (the `ord >= 32 && ord <= 126` range
     * check).
     */
    describe("PROP-SEAM-07 — the percent-encode/decode round trip", () => {
      const SEAM_07_SEED = 774419;

      function toHex(buf) {
        return buf.toString("hex");
      }

      function fromHex(hex) {
        return Buffer.from(hex, "hex");
      }

      function localPercentDecode(field) {
        const bytes = [];
        for (let i = 0; i < field.length; i++) {
          const ch = field[i];
          if (ch === "%" && /^[0-9A-Fa-f]{2}$/.test(field.slice(i + 1, i + 3))) {
            bytes.push(parseInt(field.slice(i + 1, i + 3), 16));
            i += 2;
          } else {
            bytes.push(field.charCodeAt(i));
          }
        }
        return Buffer.from(bytes);
      }

      function excludeNulByte(buf) {
        const out = Buffer.from(buf);
        for (let i = 0; i < out.length; i++) {
          if (out[i] === 0x00) out[i] = 0x01;
        }
        return out;
      }

      const PERCENT_ENCODE_DRIVER = join(__dirname, "helpers", "bin", "percent-encode-driver.sh");

      function runPercentEncodeDriver(payloads) {
        const input = payloads.length ? payloads.map(toHex).join("\n") + "\n" : "";
        const result = spawnSync("bash", [PERCENT_ENCODE_DRIVER], { input, encoding: "utf8" });
        const outLines = (result.stdout || "").length
          ? result.stdout.split("\n").filter((l) => l.length > 0)
          : [];
        if (outLines.length !== payloads.length) {
          throw new Error(
            `runPercentEncodeDriver: driver emitted ${outLines.length} result line(s) for ` +
              `${payloads.length} input case(s) — treating this as a harness failure (TSPEC §11.2)`
          );
        }
        return outLines.map((line) => {
          const [tag, field] = line.split("\t");
          if (tag !== "ok") {
            throw new Error(`runPercentEncodeDriver: driver returned "${tag}" — ${field}`);
          }
          return fromHex(field || "");
        });
      }

      function generateSeamO7Cases() {
        const curated = [
          Buffer.from(""),
          Buffer.from("%"),
          Buffer.from("plain-ascii_text.123"),
          Buffer.from("a\tb\nc\rd"),
          Buffer.from([0x1f]),
          Buffer.from([0x7f]),
          Buffer.from([0x20]),
          Buffer.from([0x7e]),
          Buffer.from([0xff]),
          Buffer.from("100% done"),
        ].map(excludeNulByte);

        const rng = seeded(resolveSeed(SEAM_07_SEED));
        const random = [];
        for (let i = 0; i < 24; i++) {
          const len = rng.int(0, 12);
          random.push(excludeNulByte(rng.bytes(len)));
        }
        return curated.concat(random);
      }

      it("holds over curated edge-case bytes and a seeded random sample, one driver spawn total", () => {
        const cases = generateSeamO7Cases();
        const encoded = runPercentEncodeDriver(cases);
        expect(encoded.length).toBe(cases.length);

        encoded.forEach((encodedBytes, i) => {
          const original = cases[i];
          const encodedText = encodedBytes.toString("latin1");
          for (let j = 0; j < encodedText.length; j++) {
            const code = encodedText.charCodeAt(j);
            expect(code).toBeGreaterThanOrEqual(0x20);
            expect(code).toBeLessThanOrEqual(0x7e);
          }
          const decoded = localPercentDecode(encodedText);
          expect(decoded.equals(original)).toBe(true);
        });
      });
    });

    /**
     * PROP-SEAM-08 — `seq` is the gapless `1,2,3,…` permutation, one integer per trace line, in
     * line order, over a real (not hand-built) trace. Falsification subject: C1's `pdlc_trace`
     * (`_PDLC_TRACE_SEQ` increment).
     */
    describe("PROP-SEAM-08 — seq is the gapless 1..N permutation over a real trace", () => {
      it("every line of a real sync run's trace has seq === lineIndex+1, no gaps or dupes", () => {
        const trees = buildFreshConsumerFixture();
        try {
          const run = runSync(trees);
          const rawLines = readFileSync(run.tracePath, "utf8")
            .split("\n")
            .filter((l) => l.length > 0);
          const trace = parseTrace(run.tracePath);
          expect(trace.length).toBe(rawLines.length);
          trace.forEach((record, i) => {
            expect(record.seq).toBe(i + 1);
          });
        } finally {
          cleanup(trees);
        }
      });
    });

    /**
     * PROP-DET-03 — production behavior (stdout/stderr/status/driftState) is independent of
     * the insertion order of unrelated environment variables. Falsification mechanism: C1
     * shells out to python3 (confirmed, empirically, in this session, to faithfully preserve
     * `env` dict insertion order through `os.environ` iteration — unlike bash's own
     * `compgen -e`/`declare -p`, which are alphabetically sorted regardless of insertion order)
     * to dump the names of any `PDLC_PROP_UNRELATED_*` variables, in iteration order, to
     * stderr — a mutation that is order-sensitive by construction.
     */
    describe(
      "PROP-DET-03 — production behavior is independent of environment-variable insertion order",
      () => {
        it("forward vs reversed insertion order of unrelated env vars yields byte-identical output", () => {
          const sharedPlugin = makePluginTree({});
          const forwardConsumer = makeConsumerTree({ git: true, claudeDir: false });
          const reversedConsumer = makeConsumerTree({ git: true, claudeDir: false });
          const keys = [
            "PDLC_PROP_UNRELATED_A",
            "PDLC_PROP_UNRELATED_B",
            "PDLC_PROP_UNRELATED_C",
            "PDLC_PROP_UNRELATED_D",
            "PDLC_PROP_UNRELATED_E",
          ];
          const forwardEnv = {};
          for (const k of keys) forwardEnv[k] = "1";
          const reversedEnv = {};
          for (const k of [...keys].reverse()) reversedEnv[k] = "1";

          try {
            const forwardRun = runScript("sync", {
              consumerRoot: forwardConsumer.root,
              home: forwardConsumer.home,
              pluginRoot: sharedPlugin.pluginRoot,
              env: forwardEnv,
            });
            const reversedRun = runScript("sync", {
              consumerRoot: reversedConsumer.root,
              home: reversedConsumer.home,
              pluginRoot: sharedPlugin.pluginRoot,
              env: reversedEnv,
            });

            expect(reversedRun.status).toBe(forwardRun.status);
            expect(reversedRun.stdout).toBe(forwardRun.stdout);
            expect(reversedRun.stderr).toBe(forwardRun.stderr);

            const forwardState = stripTimestamps(readDriftState(forwardConsumer.root));
            const reversedState = stripTimestamps(readDriftState(reversedConsumer.root));
            expect(reversedState).toEqual(forwardState);
          } finally {
            forwardConsumer.cleanup();
            reversedConsumer.cleanup();
            sharedPlugin.cleanup();
          }
        });
      }
    );

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
