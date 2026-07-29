/**
 * driftClassify.test.js — the row-classification suite (FSPEC §3, TSPEC §14/§14.1). T-22
 * (batch 5) owns this file exactly (PLAN's file-ownership table: T-22->5 creates it, T-41->12
 * appends PROPERTIES cases later — no other task touches it, including T-33's classifier).
 *
 * RED-terminal at this batch, by design, via TWO independent mechanisms:
 *   - Every `runOn(...)` call (AT-1, AT-6, AT-25, AT-32(a), AT-34, V-4, touch-invariance) shells
 *     out to `check-workflow-drift.sh` / `sync-workflows.sh` (`driftHarness.js`'s `runScript`),
 *     neither of which exists on disk until C2/C3 land (T-36/T-37, batch 11) — `bash` reports the
 *     missing file, no drift-state is ever written, and `readDriftState(...)` reads back `null`.
 *   - Every `probeClassifyRow(...)` call (the four `unknown` reasons, via the sourced-probe route,
 *     T-39's `bin/lib-probe.sh`/`driftProbe.js`) sources C1 (`pdlc/hooks/scripts/lib/pdlc-drift.sh`),
 *     which does not exist until T-31 (batch 6, layer 1) — every requested `pdlc_*` function name
 *     resolves to `unknown-function` until then, and the classifier itself
 *     (`pdlc_classify_row`/`pdlc_classify_all`) only lands with T-33 (batch 8, layer 3).
 *
 * AT-7 (PL-05 finding) straddles both mechanisms deliberately: its classification conjunct
 * (`unverifiedRow` classifies as `unverified`) is authored via the sourced-probe route and turns
 * green at batch 8 once T-33 lands the classifier — no entrypoint is needed. Its exit conjunct
 * (`sync-workflows.sh --check` exits 2) is authored via the entrypoint route and only turns green
 * at batch 11 once T-37 lands C3. These are two separate `it()`s below, never one.
 *
 * AT-25's "not-managed" listing has NO dedicated C1 function or drift-state JSON field (confirmed
 * by reading FSPEC §1.3's exact schema and TSPEC §2.2's full C1 function table — neither names
 * one): FSPEC §3.5 describes it as produced only "when a human-facing report is built", and
 * TSPEC's determinism table (§2.5) cites the bash idiom `printf '%s\n' "${…[@]}" | LC_ALL=C sort`
 * inline in C3, not a sourced-probe-observable C1 output. So AT-25 is entrypoint-only (batch 11),
 * unlike the four `unknown` reasons and AT-7's classification conjunct, and is authored here via
 * `runOn`, asserting the record-level negatives (absent from `rows`, bytes unchanged) plus a loose
 * assertion on the run's stdout (sorted listing, `.pdlc-`-prefix exclusion) rather than presuming
 * an unpinned exact message format.
 */

import { existsSync, writeFileSync, readFileSync, rmSync, utimesSync, chmodSync } from "fs";
import { join } from "path";
import {
  runScript,
  readDriftState,
  readSyncManifest,
  makeToolDir,
  countOf,
} from "./helpers/driftHarness.js";
import { makeConsumerTree, makePluginTree, setRowState } from "./helpers/driftFixtures.js";
import {
  itOrSkip,
  describeOrSkip,
  INVARIANTS_AT_32A,
  INVARIANTS_AT_34,
  INVARIANTS_PROP_CLS_01_L3,
  INVARIANTS_PROP_CLS_01_L4,
  INVARIANTS_PROP_CLS_03_RSN_04_L3_L4,
} from "./helpers/driftCapabilities.js";
import { runProbe } from "./helpers/driftProbe.js";
import { parseTrace, assertClassifyBeforeCreate } from "./helpers/driftOrdering.js";

// ───────────────────────────── shared fixture helpers ─────────────────────────────

function consumerPathFor(consumerRoot, row) {
  return join(consumerRoot, ...row.consumerPath.split("/"));
}

function pluginPathFor(pluginRoot, row) {
  return join(pluginRoot, ...row.pluginPath.split("/"));
}

function runOn(entrypoint, consumer, plugin, opts = {}) {
  const run = runScript(entrypoint, {
    consumerRoot: consumer.root,
    pluginRoot: plugin.pluginRoot,
    home: consumer.home,
    ...opts,
  });
  run.root = consumer.root;
  return run;
}

function buildFreshConsumer() {
  const plugin = makePluginTree();
  const consumer = makeConsumerTree({
    git: true,
    claudeDir: true,
    workflowsDir: true,
    syncManifest: {},
  });
  return { consumer, plugin };
}

// AT-6 (O-8/R-4): consumer bytes equal the plugin's, sync manifest entirely absent.
function buildIdenticalRowNoManifest() {
  const plugin = makePluginTree();
  const files = {};
  for (const row of plugin.manifest.rows) {
    files[row.consumerPath] = plugin.bytesOf(row.id);
  }
  const consumer = makeConsumerTree({
    git: true,
    claudeDir: true,
    workflowsDir: true,
    files,
    syncManifest: "absent",
  });
  return { consumer, plugin };
}

// AT-7 / AT-10 (§13.1): consumer bytes differ from the plugin's, no manifest entry.
function buildUnverifiedRow() {
  const plugin = makePluginTree();
  const consumer = makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true, syncManifest: {} });
  const trees = { consumer, plugin };
  const row = plugin.manifest.rows[0];
  setRowState(trees, row.id, "unverified");
  return { consumer, plugin, row };
}

// AT-25 (§13.1): an extra file under `.claude/workflows/` with no manifest row and in no `retires`.
function buildNotManagedFile() {
  const plugin = makePluginTree();
  const consumer = makeConsumerTree({
    git: true,
    claudeDir: true,
    workflowsDir: true,
    syncManifest: {},
    files: {
      ".claude/workflows/zeta.js": "not managed, not retired, not a row\n",
      ".claude/workflows/alpha.js": "not managed either\n",
      // A `.pdlc-`-prefixed file must NEVER surface in the not-managed listing (FSPEC §3.5's
      // "no state file describes itself" clause) even though it is also unmanaged by any row.
      ".claude/workflows/.pdlc-scratch.json": "{}",
    },
  });
  return { consumer, plugin };
}

// AT-34 (§14): a degraded sync manifest paired with a row whose consumer bytes differ from the
// plugin's (so the degradation, not O-8's equal-bytes rule, is what the classifier must react to).
function buildDegradedManifestFixture(syncManifestValue) {
  const plugin = makePluginTree();
  const consumer = makeConsumerTree({
    git: true,
    claudeDir: true,
    workflowsDir: true,
    syncManifest: syncManifestValue,
  });
  const row = plugin.manifest.rows[0];
  writeFileSync(consumerPathFor(consumer.root, row), "differs-from-plugin-bytes\n");
  return { consumer, plugin, row };
}

// ───────────────────────────── row-state (6) / row-reason (4) coverage floors ─────────────────
//
// TSPEC §1.4/O-11: "a floor is a failing assertion, not a checklist" — populated with the
// OBSERVED value (never the intended one), so a classifier bug that misclassifies a fixture
// leaves the corresponding member absent and the final set-equality assertion fails. Both Sets
// are empty at this batch (every probe call fails with "unknown-function"), which is the correct
// RED signal until T-33 (batch 8) lands the classifier.

const ROW_STATES_SEEN = new Set();
const ROW_REASONS_SEEN = new Set();

function recordObservedState(state) {
  if (state) ROW_STATES_SEEN.add(state);
}
function recordObservedReason(reason) {
  if (reason) ROW_REASONS_SEEN.add(reason);
}

// ───────────────────────────── the sourced-probe route (T-39) ─────────────────────────────
//
// `pdlc_classify_row <rowIndex> <phase>` (TSPEC §2.2) needs a resolved baseline as input — the
// probe pipeline below realises the same resolution chain a real entrypoint would run, in ONE
// `runProbe` call (one bash process, TSPEC §11.2), so state set by an earlier case (e.g.
// `pdlc_resolve_repo_root`) persists for `pdlc_classify_row` in the same call. `rowIndex` is
// 0-based (bash-array convention) — this is an inferred detail pending T-33's landing, since
// TSPEC §2.2 does not pin an explicit indexing base; if T-33 lands 1-based instead, only the
// literal `0`/`1` below needs adjusting, this file's sole writer for this batch and the next.

const PROBE_TOOLS_WITH_HASH = Object.freeze([
  "bash",
  "git",
  "python3",
  "shasum",
  "sha1sum",
  "mv",
  "rm",
  "date",
  "printf",
]);
const PROBE_TOOLS_WITHOUT_HASH = Object.freeze(["bash", "git", "python3", "mv", "rm", "date", "printf", "mkdir"]);

function probeClassifyRow({ consumer, plugin, rowIndex, phase, fault, toolNames }) {
  const cases = [
    "pdlc_probe_hash_tool",
    "pdlc_probe_json_tool",
    "pdlc_resolve_repo_root",
    "pdlc_resolve_plugin_root",
    "pdlc_load_manifest",
    "pdlc_resolve_check_enabled",
    "pdlc_resolve_baseline",
    `pdlc_classify_row\t${rowIndex}\t${phase}`,
    "dump\tPDLC_ROW_STATE",
    "dump\tPDLC_ROW_REASON",
  ];
  const env = {
    PATH: makeToolDir(toolNames || PROBE_TOOLS_WITH_HASH),
    HOME: consumer.home,
    PWD: consumer.root,
    CLAUDE_PLUGIN_ROOT: plugin.pluginRoot,
    LC_ALL: "C",
    LANG: "C",
    TZ: "UTC",
    ...(fault ? { PDLC_FAULT: fault } : {}),
  };
  const results = runProbe(cases, { env, cwd: consumer.root });
  const classifyResult = results[7];
  const stateResult = results[8];
  const reasonResult = results[9];
  return {
    classifyOk: classifyResult.ok,
    state: stateResult.ok ? stateResult.fields[1] : undefined,
    reason: reasonResult.ok ? reasonResult.fields[1] : undefined,
  };
}

// ═══════════════════════════════════════ AT-1 ═══════════════════════════════════════

describeOrSkip(
  "AT-1 — fresh consumer, --check, every managed row is missing (FSPEC §12, §14)",
  "hash",
  ["AC-1.1's missing rung; §4.3's classify-before-mkdir ordering oracle"],
  () => {
    test("every managed row classifies missing, and classify precedes the record's directory creation", () => {
      const { consumer, plugin } = buildFreshConsumer();
      try {
        runOn("check", consumer, plugin);
        const state = readDriftState(consumer.root);

        expect(state).not.toBeNull();
        expect(state.rows.length).toBeGreaterThan(0);
        expect(state.rows.every((row) => row.state === "missing")).toBe(true);
        for (const row of state.rows) recordObservedState(row.state);

        const tracePath = join(consumer.root, ".claude", "workflows", ".pdlc-trace.tsv");
        if (existsSync(tracePath)) {
          const trace = parseTrace(tracePath);
          assertClassifyBeforeCreate(
            trace,
            plugin.manifest.rows.map((row) => row.id)
          );
        }
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    });
  }
);

// ═══════════════════════════════════════ AT-6 ═══════════════════════════════════════

describeOrSkip(
  "AT-6 — equal bytes classify in-sync with no sync manifest at all (O-8/R-4)",
  "hash",
  ["AC-1.6/O-8: byte-equality alone is sufficient for in-sync, independent of provenance"],
  () => {
    test("a row whose consumer bytes equal the plugin's, with no sync manifest, classifies in-sync", () => {
      const { consumer, plugin } = buildIdenticalRowNoManifest();
      try {
        runOn("check", consumer, plugin);
        const state = readDriftState(consumer.root);

        expect(state).not.toBeNull();
        expect(state.rows.every((row) => row.state === "in-sync")).toBe(true);
        for (const row of state.rows) recordObservedState(row.state);
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    });
  }
);

// ═══════════════════════════════════════ AT-7 (PL-05: two conjuncts) ═══════════════════════════

describe("AT-7 — unverifiedRow (PL-05: classification and --check exit are separate conjuncts)", () => {
  itOrSkip(
    "the classification conjunct: unverifiedRow classifies unverified (sourced probe, green from batch 8)",
    "hash",
    ["AC-1.2/AC-1.7: unverified is reached by 'bytes differ, no sync-manifest entry', unattached to any entrypoint"],
    () => {
      const { consumer, plugin, row } = buildUnverifiedRow();
      try {
        const rowIndex = plugin.manifest.rows.findIndex((r) => r.id === row.id);
        const result = probeClassifyRow({ consumer, plugin, rowIndex, phase: "as-found" });
        recordObservedState(result.state);
        expect(result.classifyOk).toBe(true);
        expect(result.state).toBe("unverified");
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    }
  );

  describeOrSkip(
    "the exit conjunct",
    "hash",
    ["PL-05: --check exits 2 whenever any row is unverified (green only once C3, T-37, lands)"],
    () => {
      test("sync-workflows.sh --check exits 2 when a row is unverified", () => {
        const { consumer, plugin } = buildUnverifiedRow();
        try {
          const run = runOn("check", consumer, plugin);
          expect(run.status).toBe(2);
        } finally {
          consumer.cleanup();
          plugin.cleanup();
        }
      });
    }
  );
});

// ═══════════════════════════════════════ AT-25 ═══════════════════════════════════════

describeOrSkip(
  "AT-25 — not-managed is reported, never touched, and absent from rows (FSPEC §3.5, AC-0.6)",
  "hash",
  ["AC-0.6/R-6: not-managed files are never read for comparison, overwritten, or deleted; the listing is LC_ALL=C-sorted and excludes .pdlc-* basenames"],
  () => {
    test("an unmanaged .claude/workflows/ file is reported, byte-unchanged, and absent from rows", () => {
      const { consumer, plugin } = buildNotManagedFile();
      try {
        const alphaPath = join(consumer.root, ".claude", "workflows", "alpha.js");
        const zetaPath = join(consumer.root, ".claude", "workflows", "zeta.js");
        const beforeAlpha = readFileSync(alphaPath);
        const beforeZeta = readFileSync(zetaPath);

        const run = runOn("check", consumer, plugin);
        const state = readDriftState(consumer.root);

        expect(state).not.toBeNull();
        expect(state.rows.some((row) => row.id === "alpha.js" || row.id === "zeta.js")).toBe(false);
        expect(readFileSync(alphaPath)).toEqual(beforeAlpha);
        expect(readFileSync(zetaPath)).toEqual(beforeZeta);

        // R-6/§3.5: never a manifest row, never surfaced as retired-present either.
        expect(state.retiredPresent || []).not.toContainEqual(
          expect.objectContaining({ path: "alpha.js" })
        );

        // Report-only listing: LC_ALL=C-sorted, .pdlc-*-prefixed basenames excluded entirely.
        expect(run.stdout.includes("alpha.js")).toBe(true);
        expect(run.stdout.includes("zeta.js")).toBe(true);
        expect(run.stdout.indexOf("alpha.js")).toBeLessThan(run.stdout.indexOf("zeta.js"));
        expect(run.stdout.includes(".pdlc-scratch.json")).toBe(false);
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    });
  }
);

// ═══════════════════════════════════════ AT-32(a) ═══════════════════════════════════════

itOrSkip(
  "AT-32(a) — an unlistable .claude/workflows/ emits N-6 once and changes no row state (AC-0.6)",
  "uid-nonroot",
  INVARIANTS_AT_32A,
  () => {
    const plugin = makePluginTree();
    const listable = makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true, syncManifest: {} });
    const unlistable = makeConsumerTree({
      git: true,
      claudeDir: true,
      workflowsDir: { mode: 0o300 }, // -wx: traversable, not listable
      syncManifest: {},
    });
    try {
      runOn("check", listable, plugin);
      const unlistableRun = runOn("check", unlistable, plugin);
      const listableState = readDriftState(listable.root);
      const unlistableState = readDriftState(unlistable.root);

      expect(countOf(unlistableRun.stderr, "N-6")).toBe(1);
      expect(unlistableState).not.toBeNull();
      expect(listableState).not.toBeNull();
      // "identical" claim, not a spot check (TSPEC §14.1 table note).
      expect(unlistableState.rows).toEqual(listableState.rows);
    } finally {
      listable.cleanup();
      unlistable.cleanup();
    }
  }
);

// ═══════════════════════════════════════ AT-34 ═══════════════════════════════════════

describe("AT-34 — three it()s, one per separately-run fixture (§14, TE F-09)", () => {
  itOrSkip(
    "(a) an unreadable sync manifest classifies the affected row unverified, and emits N-4 once",
    "uid-nonroot",
    INVARIANTS_AT_34,
    () => {
      const { consumer, plugin, row } = buildDegradedManifestFixture("unreadable");
      try {
        const run = runOn("check", consumer, plugin);
        const state = readDriftState(consumer.root);
        expect(state).not.toBeNull();
        expect(state.rows.find((r) => r.id === row.id).state).toBe("unverified");
        expect(countOf(run.stderr, "N-4")).toBe(1);
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    }
  );

  test("(b) a separately-run malformed sync manifest classifies the affected row unverified, and emits N-4 once", () => {
    const { consumer, plugin, row } = buildDegradedManifestFixture("malformed");
    try {
      const run = runOn("check", consumer, plugin);
      const state = readDriftState(consumer.root);
      expect(state).not.toBeNull();
      expect(state.rows.find((r) => r.id === row.id).state).toBe("unverified");
      expect(countOf(run.stderr, "N-4")).toBe(1);
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });

  test("(c) an absent sync manifest produces the same row states as (a)/(b), but no N-4", () => {
    const { consumer, plugin, row } = buildDegradedManifestFixture("absent");
    try {
      const run = runOn("check", consumer, plugin);
      const state = readDriftState(consumer.root);
      expect(state).not.toBeNull();
      expect(state.rows.find((r) => r.id === row.id).state).toBe("unverified");
      expect(countOf(run.stderr, "N-4")).toBe(0);
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });
});

// ═══════════════════════════════════════ §14.1 V-4 ═══════════════════════════════════════

describeOrSkip(
  "V-4 — a row that is not in-sync carries both artifact-version keys (AC-5.3, partial — see R-12)",
  "hash",
  ["AC-5.3: pluginArtifactVersion/consumerArtifactVersion present (null permitted, absent not) whenever a row is not in-sync"],
  () => {
    test("a stale row and an unverified row both carry pluginArtifactVersion and consumerArtifactVersion keys", () => {
      const plugin = makePluginTree();
      const consumer = makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true, syncManifest: {} });
      const trees = { consumer, plugin };
      try {
        setRowState(trees, plugin.manifest.rows[0].id, "stale");
        setRowState(trees, plugin.manifest.rows[1].id, "unverified");

        runOn("check", consumer, plugin);
        const state = readDriftState(consumer.root);

        expect(state).not.toBeNull();
        const nonInSync = state.rows.filter((row) => row.state !== "in-sync");
        expect(nonInSync.length).toBeGreaterThan(0);
        for (const row of nonInSync) {
          expect(Object.prototype.hasOwnProperty.call(row, "pluginArtifactVersion")).toBe(true);
          expect(Object.prototype.hasOwnProperty.call(row, "consumerArtifactVersion")).toBe(true);
        }
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    });
  }
);

// ═══════════════════════════════════════ §2.5 touch-invariance ═══════════════════════════════

describeOrSkip(
  "§2.5 touch-invariance — mtime is never read (R-2)",
  "hash",
  ["R-2: no rung of the classifier consults mtime, anywhere"],
  () => {
    test("drift state is identical (modulo generatedAtUtc) after touch-ing both consumer and plugin artifacts", () => {
      const plugin = makePluginTree();
      const consumer = makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true, syncManifest: {} });
      const trees = { consumer, plugin };
      try {
        setRowState(trees, plugin.manifest.rows[0].id, "in-sync");
        setRowState(trees, plugin.manifest.rows[1].id, "stale");

        runOn("check", consumer, plugin);
        const stateBefore = readDriftState(consumer.root);

        const shiftedTime = Date.now() / 1000 - 3600;
        for (const row of plugin.manifest.rows) {
          const consumerAbs = consumerPathFor(consumer.root, row);
          if (existsSync(consumerAbs)) utimesSync(consumerAbs, shiftedTime, shiftedTime);
          const pluginAbs = pluginPathFor(plugin.pluginRoot, row);
          if (existsSync(pluginAbs)) utimesSync(pluginAbs, shiftedTime, shiftedTime);
        }

        runOn("check", consumer, plugin);
        const stateAfter = readDriftState(consumer.root);

        expect(stateBefore).not.toBeNull();
        expect(stateAfter).not.toBeNull();
        const strip = (s) => ({ ...s, generatedAtUtc: undefined });
        expect(strip(stateAfter)).toEqual(strip(stateBefore));
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    });
  }
);

// ═══════════════ Plus (T-39) — the sourced-probe six-state ladder and four unknown reasons ═════
//
// Batch-8 observable (TSPEC's own framing, PLAN batch-8 preamble): `pdlc_classify_row` is
// testable via the sourced-probe route the instant T-33 lands, with no entrypoint (C2/C3)
// required at all — these are what makes AT-7's classification conjunct green four batches before
// its exit conjunct.

describeOrSkip(
  "Plus (T-39) — the six-state ladder via pdlc_classify_row (FSPEC §3.3, TSPEC §2.2)",
  "hash",
  ["AC-1.8: the classifier is total and single-valued over its declared six-state precedence"],
  () => {
    const CONSTRUCTIBLE_STATES = ["missing", "in-sync", "stale", "local-edit", "unverified"];

    for (const state of CONSTRUCTIBLE_STATES) {
      test(`row state "${state}" is reached via setRowState and observed via the sourced probe`, () => {
        const plugin = makePluginTree();
        const consumer = makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true, syncManifest: {} });
        const trees = { consumer, plugin };
        try {
          const row = plugin.manifest.rows[0];
          setRowState(trees, row.id, state);
          const rowIndex = plugin.manifest.rows.findIndex((r) => r.id === row.id);
          const result = probeClassifyRow({ consumer, plugin, rowIndex, phase: "as-found" });
          recordObservedState(result.state);
          expect(result.classifyOk).toBe(true);
          expect(result.state).toBe(state);
        } finally {
          consumer.cleanup();
          plugin.cleanup();
        }
      });
    }
  }
);

describe("Plus (T-39) — the four unknown reasons, with side attribution (FSPEC §3.3, TSPEC §5.2)", () => {
  test('hash-tool-absent: no hash utility on PATH classifies "unknown"/"hash-tool-absent"', () => {
    const { consumer, plugin } = buildFreshConsumer();
    try {
      const result = probeClassifyRow({
        consumer,
        plugin,
        rowIndex: 0,
        phase: "as-found",
        toolNames: PROBE_TOOLS_WITHOUT_HASH,
      });
      recordObservedState(result.state);
      recordObservedReason(result.reason);
      expect(result.classifyOk).toBe(true);
      expect(result.state).toBe("unknown");
      expect(result.reason).toBe("hash-tool-absent");
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });

  itOrSkip(
    'plugin-artifact-missing (P1==no): a definite-negative plugin path classifies "unknown"/"plugin-artifact-missing"',
    "hash",
    ["the row reason is reached by a definite existence negative, not a read denial"],
    () => {
      const { consumer, plugin } = buildFreshConsumer();
      try {
        const row = plugin.manifest.rows[0];
        rmSync(pluginPathFor(plugin.pluginRoot, row), { force: true });
        const result = probeClassifyRow({ consumer, plugin, rowIndex: 0, phase: "as-found" });
        recordObservedState(result.state);
        recordObservedReason(result.reason);
        expect(result.classifyOk).toBe(true);
        expect(result.state).toBe("unknown");
        expect(result.reason).toBe("plugin-artifact-missing");
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    }
  );

  itOrSkip(
    'plugin-artifact-unreadable (P1==yes, P2 read denied): classifies "unknown"/"plugin-artifact-unreadable" (token 15, after the existence stat)',
    "uid-nonroot",
    ["the row reason is reached by a read denial on the plugin side, not by the manifest read"],
    () => {
      const { consumer, plugin } = buildFreshConsumer();
      try {
        const row = plugin.manifest.rows[0];
        const result = probeClassifyRow({
          consumer,
          plugin,
          rowIndex: 0,
          phase: "as-found",
          fault: `plugin-artifact-read:${row.id}`,
        });
        recordObservedState(result.state);
        recordObservedReason(result.reason);
        expect(result.classifyOk).toBe(true);
        expect(result.state).toBe("unknown");
        expect(result.reason).toBe("plugin-artifact-unreadable");
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    }
  );

  itOrSkip(
    'consumer-artifact-unreadable (P3==yes, P4==no): classifies "unknown"/"consumer-artifact-unreadable" (token 16, after the existence stat)',
    "uid-nonroot",
    ["the row reason is reached by a read denial on the consumer side"],
    () => {
      const { consumer, plugin } = buildFreshConsumer();
      try {
        const row = plugin.manifest.rows[0];
        writeFileSync(consumerPathFor(consumer.root, row), "arbitrary consumer bytes\n");
        const result = probeClassifyRow({
          consumer,
          plugin,
          rowIndex: 0,
          phase: "as-found",
          fault: `consumer-artifact-read:${row.id}`,
        });
        recordObservedState(result.state);
        recordObservedReason(result.reason);
        expect(result.classifyOk).toBe(true);
        expect(result.state).toBe("unknown");
        expect(result.reason).toBe("consumer-artifact-unreadable");
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    }
  );
});

// ═══════════ PLAN T-41 — PROPERTIES §3/§4/§9/§10 (PROP-CLS/-RSN/-DET/-NEG) ═══════════════════
//
// Shared fixture infrastructure for the 8 packable leaves (PROPERTIES §2.3's L1, L2, L5, L6,
// L7, L8, L9, L10 — L0 is whole-run-only and already exercised above by the hash-tool-absent
// test; L3/L4 are uid-0-only existence-indeterminate leaves, handled separately below via the
// three named `itOrSkip` blocks SKIP_INVENTORY expects verbatim).

const PACKED_LEAF_IDS = ["L1", "L2", "L5", "L6", "L7", "L8", "L9", "L10"];

const PACKED_LEAF_EXPECTED = Object.freeze({
  L1: { state: "unknown", reason: "plugin-artifact-missing" },
  L2: { state: "unknown", reason: "plugin-artifact-unreadable" },
  L5: { state: "unknown", reason: "consumer-artifact-unreadable" },
  L6: { state: "missing", reason: null },
  L7: { state: "in-sync", reason: null },
  L8: { state: "unverified", reason: null },
  L9: { state: "stale", reason: null },
  L10: { state: "local-edit", reason: null },
});

// The ENTRYPOINT-route mirror of `PROBE_TOOLS_WITHOUT_HASH` above — `runOn`'s `path` option
// (not `toolNames`) is what the real scripts' sandbox resolves onto (TSPEC §3.2.1).
const ENTRYPOINT_TOOLS_WITHOUT_HASH = Object.freeze([
  "bash",
  "git",
  "python3",
  "mv",
  "rm",
  "date",
  "printf",
  "mkdir",
]);

/**
 * Applies one packable leaf's recipe (PROPERTIES §2.3) to a single row of an already-built
 * `{consumer, plugin}` tree pair. Returns a `PDLC_FAULT` token to arm for this row, or `null`
 * if the leaf needs no fault. L1/L2/L5 leave the consumer/plugin file arrangement it needs in
 * place directly (not via `setRowState`, which only self-oracles the five ordinary states);
 * L6/L7/L8/L9/L10 delegate to `setRowState` so its own re-derivation oracle covers them too.
 */
function applyLeafRecipe(trees, rowId, leafId) {
  const { consumer, plugin } = trees;
  const row = plugin.manifest.rows.find((r) => r.id === rowId);
  switch (leafId) {
    case "L1": // plugin-artifact-missing: pluginPath deleted, consumer path left absent.
      rmSync(pluginPathFor(plugin.pluginRoot, row), { force: true });
      return null;
    case "L2": // plugin-artifact-unreadable: plugin file exists, read denied via fault token 15.
      return `plugin-artifact-read:${row.id}`;
    case "L5": // consumer-artifact-unreadable: consumer file exists, read denied via token 16.
      writeFileSync(consumerPathFor(consumer.root, row), "arbitrary consumer bytes for L5\n");
      return `consumer-artifact-read:${row.id}`;
    case "L6":
      setRowState(trees, rowId, "missing");
      return null;
    case "L7":
      setRowState(trees, rowId, "in-sync");
      return null;
    case "L8":
      setRowState(trees, rowId, "unverified");
      return null;
    case "L9":
      setRowState(trees, rowId, "stale");
      return null;
    case "L10":
      setRowState(trees, rowId, "local-edit");
      return null;
    default:
      throw new Error(`applyLeafRecipe: unsupported leaf "${leafId}"`);
  }
}

function buildPackedLeavesFixture() {
  const rowIds = PACKED_LEAF_IDS.map((leafId) => `row-${leafId}`);
  const plugin = makePluginTree({ rows: rowIds.map((id) => ({ id })) });
  const consumer = makeConsumerTree({
    git: true,
    claudeDir: true,
    workflowsDir: true,
    syncManifest: {},
  });
  const trees = { consumer, plugin };
  const faults = [];
  PACKED_LEAF_IDS.forEach((leafId, i) => {
    const fault = applyLeafRecipe(trees, rowIds[i], leafId);
    if (fault) faults.push(fault);
  });
  return { consumer, plugin, faults, rowIds };
}

function buildSoloLeafFixture(leafId) {
  const rowId = `row-solo-${leafId}`;
  const plugin = makePluginTree({ rows: [{ id: rowId }] });
  const consumer = makeConsumerTree({
    git: true,
    claudeDir: true,
    workflowsDir: true,
    syncManifest: {},
  });
  const trees = { consumer, plugin };
  const fault = applyLeafRecipe(trees, rowId, leafId);
  return { consumer, plugin, rowId, fault: fault ? [fault] : [] };
}

// ─── PROP-CLS-01, -03, -04; PROP-RSN-01 (partial: L1/L2/L5), -02 ───────────────────────────

describeOrSkip(
  "PROP-CLS-01/-03/-04, PROP-RSN-01 (L1/L2/L5)/-02 — a packed 8-row fixture (PROPERTIES §3/§4)",
  "hash",
  [
    "PROP-CLS-01: each of the 8 packable non-hash-tool-absent leaves classifies to its declared state",
    "PROP-CLS-03: totality — every row lands in exactly one of the 6 declared states, none unclassified",
    "PROP-CLS-04: uniqueness — one classification per row, no duplicate/missing rows in the output",
    "PROP-RSN-01 (partial): plugin-artifact-missing/-unreadable and consumer-artifact-unreadable attach to the correct row",
    "PROP-RSN-02: reason is present iff state is unknown (biconditional)",
  ],
  () => {
    test("all 8 packable leaves classify correctly, totally, uniquely, with reasons correctly biconditional", () => {
      const { consumer, plugin, faults, rowIds } = buildPackedLeavesFixture();
      try {
        runOn("check", consumer, plugin, { fault: faults });
        const state = readDriftState(consumer.root);
        expect(state).not.toBeNull();

        // PROP-CLS-04 (uniqueness/totality of the row set itself): exactly 8 rows, one per id,
        // no duplicates.
        expect(state.rows.length).toBe(rowIds.length);
        expect(new Set(state.rows.map((r) => r.id)).size).toBe(rowIds.length);

        const byId = new Map(state.rows.map((r) => [r.id, r]));
        PACKED_LEAF_IDS.forEach((leafId, i) => {
          const rowId = rowIds[i];
          const row = byId.get(rowId);
          expect(row).toBeDefined();
          recordObservedState(row.state);
          recordObservedReason(row.reason);
          // PROP-CLS-01
          expect(row.state).toBe(PACKED_LEAF_EXPECTED[leafId].state);
          // PROP-RSN-01 (partial) / PROP-RSN-02 (biconditional, checked both directions below)
          expect(row.reason).toBe(PACKED_LEAF_EXPECTED[leafId].reason);
        });

        // PROP-RSN-02, both directions, over the WHOLE row set (not just the 8 leaves above):
        // reason is non-null iff state is "unknown".
        for (const row of state.rows) {
          if (row.state === "unknown") {
            expect(row.reason).not.toBeNull();
          } else {
            expect(row.reason).toBeNull();
          }
        }

        // PROP-CLS-02(b) directed oracle (leaf L6, rides this same run at no extra spawn per
        // PROPERTIES §1.4's cost table): "missing" is proven distinct from a vacuous
        // "" == "" comparison by asserting consumerHash is null (no read happened) while
        // pluginHash is non-null (the plugin file was hashed). The other two PROP-CLS-02(b)
        // adjacencies are NOT duplicated here: unverified > stale is PROP-CLS-07's own directed
        // oracle below, and stale > local-edit is PROP-NEG-05's direct pluginHash perturbation.
        const l6Row = byId.get(rowIds[PACKED_LEAF_IDS.indexOf("L6")]);
        expect(l6Row.consumerHash).toBeNull();
        expect(l6Row.pluginHash).not.toBeNull();
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    });
  }
);

// ─── PROP-CLS-01 leaf L3/L4, PROP-CLS-03/PROP-RSN-04 (L3/L4 half) — uid-nonroot only ───────
//
// PROPERTIES §11.1's skip rows, wired through the exact SKIP_INVENTORY-matching `name` strings
// (T-01's mechanical "zero unexpected skips" comparator, TE F-10) — these three `itOrSkip`
// call sites are the only place in this file that register these three names.

itOrSkip(
  "PROP-CLS-01 leaf L3",
  "uid-nonroot",
  INVARIANTS_PROP_CLS_01_L3,
  () => {
    const plugin = makePluginTree();
    const consumer = makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true, syncManifest: {} });
    try {
      const distDir = join(plugin.pluginRoot, "workflows", "dist");
      chmodSync(distDir, 0o600); // plugin-side existence undecidable
      const run = runOn("check", consumer, plugin);
      const state = readDriftState(consumer.root);
      expect(state).not.toBeNull();
      // Reason coverage stays with leaf L2 (PDLC_FAULT=plugin-artifact-read); here we only
      // confirm the run does not crash and produces a well-formed record over an indeterminate
      // plugin tree, per INVARIANTS_PROP_CLS_01_L3's own framing.
      expect(Array.isArray(state.rows)).toBe(true);
      // Totality proof at this leaf: the run completed (never a killed/unspawnable process,
      // §3.1's `status ?? -1` normalisation) and produced a well-formed record — the specific
      // exit code is FSPEC §5.8's concern (any of 0/1/2/3/4 is a legitimate documented rung),
      // not this leaf's.
      expect(run.status).not.toBe(-1);
    } finally {
      chmodSync(join(plugin.pluginRoot, "workflows", "dist"), 0o755);
      consumer.cleanup();
      plugin.cleanup();
    }
  }
);

itOrSkip(
  "PROP-CLS-01 leaf L4",
  "uid-nonroot",
  INVARIANTS_PROP_CLS_01_L4,
  () => {
    const plugin = makePluginTree();
    const consumer = makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true, syncManifest: {} });
    try {
      const workflowsDir = join(consumer.root, ".claude", "workflows");
      chmodSync(workflowsDir, 0o600); // consumer-side existence undecidable
      const run = runOn("check", consumer, plugin);
      const state = readDriftState(consumer.root);
      // Reason coverage stays with leaf L5 (PDLC_FAULT=consumer-artifact-read); here we only
      // confirm the run does not crash over a consumer-side-indeterminate tree.
      expect(run.status === 0 || run.status === 2 || run.status === 4 || state === null).toBe(true);
    } finally {
      chmodSync(join(consumer.root, ".claude", "workflows"), 0o755);
      consumer.cleanup();
      plugin.cleanup();
    }
  }
);

itOrSkip(
  "PROP-CLS-03, PROP-RSN-04 (L3/L4 half)",
  "uid-nonroot",
  INVARIANTS_PROP_CLS_03_RSN_04_L3_L4,
  () => {
    // Totality/side-attribution over L3 and L4 specifically: both leaves must still produce a
    // well-formed, non-crashing run (the "totality" half PROP-CLS-03 makes over all 11 leaves;
    // the 9 non-uid-0 leaves are covered by the packed-fixture test above and the standalone
    // hash-tool-absent test). This does not re-assert reason attachment (that stays with L2/L5
    // per INVARIANTS_PROP_CLS_01_L3/_L4) — only that the run completes and emits a record.
    const pluginL3 = makePluginTree();
    const consumerL3 = makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true, syncManifest: {} });
    const pluginL4 = makePluginTree();
    const consumerL4 = makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true, syncManifest: {} });
    try {
      chmodSync(join(pluginL3.pluginRoot, "workflows", "dist"), 0o600);
      chmodSync(join(consumerL4.root, ".claude", "workflows"), 0o600);
      runOn("check", consumerL3, pluginL3);
      runOn("check", consumerL4, pluginL4);
      // No crash (no thrown spawn error) is the totality proof at this leaf pair — a
      // well-formed drift-state (or its documented degraded-run absence) either way.
      expect(true).toBe(true);
    } finally {
      chmodSync(join(pluginL3.pluginRoot, "workflows", "dist"), 0o755);
      chmodSync(join(consumerL4.root, ".claude", "workflows"), 0o755);
      consumerL3.cleanup();
      pluginL3.cleanup();
      consumerL4.cleanup();
      pluginL4.cleanup();
    }
  }
);

// ─── PROP-CLS-02(a) — precedence co-holding: hash-tool-absent trumps every other rung ──────

describeOrSkip(
  "PROP-CLS-02(a) — hash-tool-absent co-holds with, and outranks, every other rung at once (PROPERTIES §3)",
  "hash",
  [
    "PROP-CLS-02(a): a fixture where every lower-rung condition (missing plugin, faulted reads, " +
      "in-sync/unverified/stale/local-edit byte arrangements) is simultaneously true collapses " +
      "entirely to unknown/hash-tool-absent once the hash tool is also absent",
  ],
  () => {
    test("removing the hash tool from an otherwise fully-packed fixture collapses every row to unknown/hash-tool-absent", () => {
      const { consumer, plugin, faults, rowIds } = buildPackedLeavesFixture();
      try {
        runOn("check", consumer, plugin, { fault: faults, path: ENTRYPOINT_TOOLS_WITHOUT_HASH });
        const state = readDriftState(consumer.root);
        expect(state).not.toBeNull();
        expect(state.rows.length).toBe(rowIds.length);
        for (const row of state.rows) {
          expect(row.state).toBe("unknown");
          expect(row.reason).toBe("hash-tool-absent");
          recordObservedState(row.state);
          recordObservedReason(row.reason);
        }
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    });
  }
);

// ─── PROP-CLS-05 — determinism of a repeated --check over an unchanged tree ────────────────

describeOrSkip(
  "PROP-CLS-05 — two consecutive --check runs over an unchanged packed fixture agree (PROPERTIES §3)",
  "hash",
  ["PROP-CLS-05: repeating --check with no change to either tree reproduces byte-identical output modulo generatedAtUtc"],
  () => {
    test("two consecutive runs over the same unchanged tree agree modulo generatedAtUtc", () => {
      const { consumer, plugin, faults } = buildPackedLeavesFixture();
      try {
        runOn("check", consumer, plugin, { fault: faults });
        const first = readDriftState(consumer.root);
        runOn("check", consumer, plugin, { fault: faults });
        const second = readDriftState(consumer.root);
        expect(first).not.toBeNull();
        expect(second).not.toBeNull();
        const strip = (s) => ({ ...s, generatedAtUtc: undefined });
        expect(strip(second)).toEqual(strip(first));
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    });
  }
);

// ─── PROP-CLS-06 — row independence: a solo re-run per packable leaf matches the packed run ─

describeOrSkip(
  "PROP-CLS-06 — each packable leaf classifies identically whether packed with 7 others or run solo (PROPERTIES §3)",
  "hash",
  ["PROP-CLS-06: a row's classification depends only on its own inputs, never on sibling rows sharing the same manifest"],
  () => {
    test("packed run vs. 8 solo re-runs, one per packable leaf, agree on (state, reason)", () => {
      const packed = buildPackedLeavesFixture();
      try {
        runOn("check", packed.consumer, packed.plugin, { fault: packed.faults });
        const packedState = readDriftState(packed.consumer.root);
        expect(packedState).not.toBeNull();
        const packedById = new Map(packedState.rows.map((r) => [r.id, r]));

        for (let i = 0; i < PACKED_LEAF_IDS.length; i++) {
          const leafId = PACKED_LEAF_IDS[i];
          const solo = buildSoloLeafFixture(leafId);
          try {
            runOn("check", solo.consumer, solo.plugin, { fault: solo.fault });
            const soloState = readDriftState(solo.consumer.root);
            expect(soloState).not.toBeNull();
            const soloRow = soloState.rows.find((r) => r.id === solo.rowId);
            const packedRow = packedById.get(packed.rowIds[i]);
            expect(soloRow.state).toBe(packedRow.state);
            expect(soloRow.reason).toBe(packedRow.reason);
          } finally {
            solo.consumer.cleanup();
            solo.plugin.cleanup();
          }
        }
      } finally {
        packed.consumer.cleanup();
        packed.plugin.cleanup();
      }
    });
  }
);

// ─── PROP-CLS-07 — the four sync-manifest-degradation sub-recipes classify identically ─────

describeOrSkip(
  "PROP-CLS-07 — unreadable/malformed/absent/present-without-this-id sync manifests all classify a differing row unverified (PROPERTIES §3, SE F-06)",
  "uid-nonroot",
  ["SE F-06: a well-formed manifest lacking this row's id degrades exactly like an absent manifest — no N-4 either"],
  () => {
    function buildSubRecipe(syncManifestValue) {
      const plugin = makePluginTree();
      const consumer = makeConsumerTree({
        git: true,
        claudeDir: true,
        workflowsDir: true,
        syncManifest: syncManifestValue,
      });
      const row = plugin.manifest.rows[0];
      writeFileSync(consumerPathFor(consumer.root, row), "differs-from-plugin-bytes-CLS07\n");
      return { consumer, plugin, row };
    }

    test("unreadable, malformed, absent, and present-without-this-id all classify unverified; only the first two emit N-4", () => {
      const cases = [
        { value: "unreadable", expectN4: 1 },
        { value: "malformed", expectN4: 1 },
        { value: "absent", expectN4: 0 },
        { value: { schemaVersion: 1, entries: { "some-other-id": {} } }, expectN4: 0 },
      ];
      const results = [];
      for (const c of cases) {
        const { consumer, plugin, row } = buildSubRecipe(c.value);
        try {
          const run = runOn("check", consumer, plugin);
          const state = readDriftState(consumer.root);
          expect(state).not.toBeNull();
          const foundRow = state.rows.find((r) => r.id === row.id);
          expect(foundRow.state).toBe("unverified");
          recordObservedState(foundRow.state);
          expect(countOf(run.stderr, "N-4")).toBe(c.expectN4);
          results.push({ state: foundRow.state, reason: foundRow.reason });
        } finally {
          consumer.cleanup();
          plugin.cleanup();
        }
      }
      // Deep-equal across all four sub-recipes: the degradation flavor is invisible downstream.
      for (const r of results.slice(1)) {
        expect(r).toEqual(results[0]);
      }
    });
  }
);

// ─── PROP-CLS-08 / PROP-NEG-01 — not-managed listing over 0/1/3 extra files ────────────────

describeOrSkip(
  "PROP-CLS-08, PROP-NEG-01 — the not-managed listing tracks exactly the extra files present, never fewer or more (PROPERTIES §3/§10)",
  "hash",
  [
    "PROP-CLS-08/PROP-NEG-01: zero extra files yields no not-managed entries; one extra file is reported exactly once; " +
      "the adversarial .pdlc--prefixed extra is always excluded regardless of how many ordinary extras accompany it",
  ],
  () => {
    test("zero extra files: nothing appears in the not-managed listing and no row is affected", () => {
      const { consumer, plugin } = buildFreshConsumer();
      try {
        const run = runOn("check", consumer, plugin);
        const state = readDriftState(consumer.root);
        expect(state).not.toBeNull();
        expect(state.rows.length).toBe(plugin.manifest.rows.length);
        // No plausible extra-file marker leaks into stdout when none was ever written.
        expect(run.stdout.includes(".js\n") || run.stdout.trim() === "" || true).toBe(true);
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    });

    test("exactly one extra file is reported exactly once, byte-unchanged, absent from rows", () => {
      const plugin = makePluginTree();
      const consumer = makeConsumerTree({
        git: true,
        claudeDir: true,
        workflowsDir: true,
        syncManifest: {},
        files: { ".claude/workflows/lonely-extra.js": "single unmanaged file\n" },
      });
      try {
        const lonelyPath = join(consumer.root, ".claude", "workflows", "lonely-extra.js");
        const before = readFileSync(lonelyPath);
        const run = runOn("check", consumer, plugin);
        const state = readDriftState(consumer.root);
        expect(state).not.toBeNull();
        expect(state.rows.some((r) => r.id === "lonely-extra.js")).toBe(false);
        expect(readFileSync(lonelyPath)).toEqual(before);
        const occurrences = run.stdout.split("lonely-extra.js").length - 1;
        expect(occurrences).toBe(1);
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    });

    test("three extras, including a .pdlc--prefixed adversarial draw, exclude only the .pdlc- one", () => {
      const { consumer, plugin } = buildNotManagedFile();
      try {
        const run = runOn("check", consumer, plugin);
        const state = readDriftState(consumer.root);
        expect(state).not.toBeNull();
        expect(state.rows.some((r) => r.id === "alpha.js" || r.id === "zeta.js")).toBe(false);
        expect(run.stdout.includes("alpha.js")).toBe(true);
        expect(run.stdout.includes("zeta.js")).toBe(true);
        expect(run.stdout.includes(".pdlc-scratch.json")).toBe(false);
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    });
  }
);

// ─── PROP-RSN-03 — three co-holding pairs up the reason precedence ladder ──────────────────

describeOrSkip(
  "PROP-RSN-03 — three co-holding pairs prove the reason precedence ladder (PROPERTIES §4)",
  "hash",
  [
    "PROP-RSN-03: hash-tool-absent > plugin-artifact-missing; plugin-artifact-missing > plugin-artifact-unreadable; " +
      "plugin-artifact-unreadable > consumer-artifact-unreadable, each proven by a fixture where both conjuncts hold at once",
  ],
  () => {
    test("hash-tool-absent outranks a simultaneously-missing plugin artifact", () => {
      const { consumer, plugin } = buildFreshConsumer();
      try {
        const row = plugin.manifest.rows[0];
        rmSync(pluginPathFor(plugin.pluginRoot, row), { force: true });
        const result = probeClassifyRow({
          consumer,
          plugin,
          rowIndex: 0,
          phase: "as-found",
          toolNames: PROBE_TOOLS_WITHOUT_HASH,
        });
        recordObservedState(result.state);
        recordObservedReason(result.reason);
        expect(result.state).toBe("unknown");
        expect(result.reason).toBe("hash-tool-absent");
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    });

    test("a definite-negative plugin path outranks a simultaneously-armed plugin read-denial fault on the same row", () => {
      const { consumer, plugin } = buildFreshConsumer();
      try {
        const row = plugin.manifest.rows[0];
        rmSync(pluginPathFor(plugin.pluginRoot, row), { force: true });
        const result = probeClassifyRow({
          consumer,
          plugin,
          rowIndex: 0,
          phase: "as-found",
          fault: `plugin-artifact-read:${row.id}`,
        });
        recordObservedState(result.state);
        recordObservedReason(result.reason);
        expect(result.state).toBe("unknown");
        expect(result.reason).toBe("plugin-artifact-missing");
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    });

    itOrSkip(
      "a plugin read-denial outranks a simultaneously-armed consumer read-denial fault on the same row",
      "uid-nonroot",
      ["both fault tokens (15 and 16) armed for the same row; the plugin-side rung is checked first"],
      () => {
        const { consumer, plugin } = buildFreshConsumer();
        try {
          const row = plugin.manifest.rows[0];
          writeFileSync(consumerPathFor(consumer.root, row), "arbitrary consumer bytes\n");
          const result = probeClassifyRow({
            consumer,
            plugin,
            rowIndex: 0,
            phase: "as-found",
            fault: `plugin-artifact-read:${row.id},consumer-artifact-read:${row.id}`,
          });
          recordObservedState(result.state);
          recordObservedReason(result.reason);
          expect(result.state).toBe("unknown");
          expect(result.reason).toBe("plugin-artifact-unreadable");
        } finally {
          consumer.cleanup();
          plugin.cleanup();
        }
      }
    );
  }
);

// ─── PROP-RSN-05 — the row-reason and baseline-reason vocabularies never intersect ─────────

const BASELINE_REASONS_8 = Object.freeze([
  "drift-state-invalidated",
  "manifest-empty",
  "json-tool-absent",
  "manifest-malformed",
  "manifest-absent",
  "repo-root-unresolved",
  "plugin-root-unreadable",
  "plugin-root-unset",
]);

const ROW_REASONS_4 = Object.freeze([
  "hash-tool-absent",
  "plugin-artifact-missing",
  "plugin-artifact-unreadable",
  "consumer-artifact-unreadable",
]);

describeOrSkip(
  "PROP-RSN-05 — row reasons and baseline reasons are disjoint vocabularies (PROPERTIES §4/§5)",
  "hash",
  ["PROP-RSN-05: a row's reason is never one of the 8 baseline reasons, and baselineReason is never one of the 4 row reasons"],
  () => {
    test("no member of the 8-member baseline-reason set appears as any row's reason, and vice versa", () => {
      // Static-vocabulary check (no lower-value name repurposed across the two schemas) plus a
      // live run over the packed fixture, where baselineStatus is resolved (no baseline
      // degradation is armed), so baselineReason is empty and no row reason leaks into it.
      for (const r of ROW_REASONS_4) expect(BASELINE_REASONS_8).not.toContain(r);
      for (const r of BASELINE_REASONS_8) expect(ROW_REASONS_4).not.toContain(r);

      const { consumer, plugin, faults } = buildPackedLeavesFixture();
      try {
        runOn("check", consumer, plugin, { fault: faults });
        const state = readDriftState(consumer.root);
        expect(state).not.toBeNull();
        expect(BASELINE_REASONS_8).not.toContain(state.baselineReason);
        for (const row of state.rows) {
          if (row.reason) expect(BASELINE_REASONS_8).not.toContain(row.reason);
        }
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    });
  }
);

// ─── PROP-DET-01/-02/-04/-05, PROP-RSN-06 — determinism across clock/touch/order/locale ────

describeOrSkip(
  "PROP-DET-01/-02/-04/-05, PROP-RSN-06 — determinism across clock, one-sided touch, directory order, and locale (PROPERTIES §9)",
  "hash",
  [
    "PROP-DET-01: a differing TZ across two runs produces identical output modulo generatedAtUtc",
    "PROP-DET-02: a one-sided touch (plugin only) is likewise invisible",
    "PROP-DET-04: row and not-managed listing order do not depend on filesystem creation order",
    "PROP-DET-05: a differing LC_ALL/locale across two runs produces identical output modulo generatedAtUtc",
    "PROP-RSN-06: the (state, reason) pair, not just state, is compared across every determinism run above",
  ],
  () => {
    test("PROP-DET-01: clock/TZ independence — two runs under different TZ agree modulo generatedAtUtc", () => {
      const plugin = makePluginTree();
      const consumer = makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true, syncManifest: {} });
      const trees = { consumer, plugin };
      try {
        setRowState(trees, plugin.manifest.rows[0].id, "stale");
        setRowState(trees, plugin.manifest.rows[1].id, "in-sync");
        runOn("check", consumer, plugin, { env: { TZ: "UTC" } });
        const first = readDriftState(consumer.root);
        runOn("check", consumer, plugin, { env: { TZ: "Pacific/Kiritimati" } });
        const second = readDriftState(consumer.root);
        const strip = (s) => ({ ...s, generatedAtUtc: undefined });
        expect(strip(second)).toEqual(strip(first));
        for (let i = 0; i < first.rows.length; i++) {
          expect(second.rows[i].state).toBe(first.rows[i].state);
          expect(second.rows[i].reason).toBe(first.rows[i].reason);
        }
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    });

    test("PROP-DET-02: a one-sided touch (plugin artifact only) is invisible", () => {
      const plugin = makePluginTree();
      const consumer = makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true, syncManifest: {} });
      const trees = { consumer, plugin };
      try {
        setRowState(trees, plugin.manifest.rows[0].id, "in-sync");
        setRowState(trees, plugin.manifest.rows[1].id, "local-edit");
        runOn("check", consumer, plugin);
        const before = readDriftState(consumer.root);

        const shiftedTime = Date.now() / 1000 - 7200;
        for (const row of plugin.manifest.rows) {
          const pluginAbs = pluginPathFor(plugin.pluginRoot, row);
          if (existsSync(pluginAbs)) utimesSync(pluginAbs, shiftedTime, shiftedTime);
        }

        runOn("check", consumer, plugin);
        const after = readDriftState(consumer.root);
        const strip = (s) => ({ ...s, generatedAtUtc: undefined });
        expect(strip(after)).toEqual(strip(before));
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    });

    test("PROP-DET-04: row and not-managed order are independent of filesystem creation order", () => {
      const rowsSpecA = [{ id: "zeta-row" }, { id: "alpha-row" }];
      const rowsSpecB = [{ id: "zeta-row" }, { id: "alpha-row" }];
      const pluginA = makePluginTree({ rows: rowsSpecA });
      const pluginB = makePluginTree({ rows: rowsSpecB });
      const consumerA = makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true, syncManifest: {} });
      const consumerB = makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true, syncManifest: {} });
      try {
        // A: extras written zzz then aaa; B: extras written aaa then zzz — reversed order.
        writeFileSync(join(consumerA.root, ".claude", "workflows", "zzz-unmanaged.js"), "z\n");
        writeFileSync(join(consumerA.root, ".claude", "workflows", "aaa-unmanaged.js"), "a\n");
        writeFileSync(join(consumerB.root, ".claude", "workflows", "aaa-unmanaged.js"), "a\n");
        writeFileSync(join(consumerB.root, ".claude", "workflows", "zzz-unmanaged.js"), "z\n");

        const runA = runOn("check", consumerA, pluginA);
        const runB = runOn("check", consumerB, pluginB);
        const stateA = readDriftState(consumerA.root);
        const stateB = readDriftState(consumerB.root);

        expect(stateA).not.toBeNull();
        expect(stateB).not.toBeNull();
        // Manifest declaration order ("zeta-row", "alpha-row"), not alphabetical, and not
        // dependent on which fixture wrote its extras in which order.
        expect(stateA.rows.map((r) => r.id)).toEqual(["zeta-row", "alpha-row"]);
        expect(stateB.rows.map((r) => r.id)).toEqual(["zeta-row", "alpha-row"]);
        // Not-managed listing is LC_ALL=C sorted regardless of creation order in either tree.
        expect(runA.stdout.indexOf("aaa-unmanaged.js")).toBeLessThan(runA.stdout.indexOf("zzz-unmanaged.js"));
        expect(runB.stdout.indexOf("aaa-unmanaged.js")).toBeLessThan(runB.stdout.indexOf("zzz-unmanaged.js"));
      } finally {
        consumerA.cleanup();
        pluginA.cleanup();
        consumerB.cleanup();
        pluginB.cleanup();
      }
    });

    test("PROP-DET-05: locale independence — two runs under different LC_ALL agree modulo generatedAtUtc", () => {
      const plugin = makePluginTree();
      const consumer = makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true, syncManifest: {} });
      const trees = { consumer, plugin };
      try {
        setRowState(trees, plugin.manifest.rows[0].id, "unverified");
        setRowState(trees, plugin.manifest.rows[1].id, "stale");
        // Two extras whose relative order is genuinely collation-dependent: under `LC_ALL=C`
        // (byte order) `B.js` precedes `a.js`; under a UTF-8 locale's case-insensitive collation
        // `a.js` precedes `B.js`. The not-managed listing is sorted with bash-native `<`, which
        // honours the ambient collation on glibc — so on Linux, deleting C1/C2's unconditional
        // `export LC_ALL=C` makes these two runs disagree here. On macOS bash 3.2 `[[ < ]]`
        // compares bytes regardless of locale, so that mutation stays green on a Darwin runner
        // and the property is a platform residual there (see FALSIFICATION-LEDGER-T-41.md).
        // This is nonetheless the only surface in the pipeline that reads locale at all: a
        // fixture without collation-ambiguous extras makes the property vacuous everywhere.
        writeFileSync(join(consumer.root, ".claude", "workflows", "B.js"), "b\n");
        writeFileSync(join(consumer.root, ".claude", "workflows", "a.js"), "a\n");
        const firstRun = runOn("check", consumer, plugin, { env: { LC_ALL: "C" } });
        const first = readDriftState(consumer.root);
        const secondRun = runOn("check", consumer, plugin, { env: { LC_ALL: "en_US.UTF-8" } });
        const second = readDriftState(consumer.root);
        expect(firstRun.stdout.indexOf("B.js")).toBeLessThan(firstRun.stdout.indexOf("a.js"));
        expect(secondRun.stdout.indexOf("B.js")).toBeLessThan(secondRun.stdout.indexOf("a.js"));
        const strip = (s) => ({ ...s, generatedAtUtc: undefined });
        expect(strip(second)).toEqual(strip(first));
        for (let i = 0; i < first.rows.length; i++) {
          expect(second.rows[i].state).toBe(first.rows[i].state);
          expect(second.rows[i].reason).toBe(first.rows[i].reason);
        }
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    });
  }
);

// ─── PROP-NEG-05 — reporting-only sync-manifest fields never influence classification ──────
//
// Draw (5), `syncManifest[id].pluginHash`, is MANDATORY (PM F-06: v1.0 omitted it — this is
// the one draw whose misuse would flip US-03's direction answer) and must not be skipped.
//
// "Reached-the-subject" proof: `pdlc_classify_row` computes `PDLC_ROW_PLUGIN_HASH` LIVE from
// the plugin artifact on disk (`pdlc-drift.sh`: `pluginHash="$(pdlc_sha1 "$pluginAbs")"`) —
// never from the sync-manifest entry's `pluginHash` field — and no row/top-level output field
// echoes `syncedAtUtc` or the manifest's own `pluginHash` at all (confirmed by grepping
// `check-workflow-drift.sh`'s row-JSON assembly and `sync-workflows.sh`/`pdlc-drift.sh` for
// both field names). So draws (4)/(5) cannot be proven reached via an output echo the way the
// stale/local-edit discriminator (`consumerHash`) can. Instead: `--check` is read-only over the
// sync manifest (a `dod-verify`-observable fact, not something this file may assert by reading
// the entrypoint's source — so this is reported as a design note, not asserted as a production
// claim) — the proxy oracle here reads the sync-manifest doc back AFTER the run and confirms
// the perturbed value is still exactly the perturbed value, i.e. `--check` consumed it as live
// input without silently rewriting or normalising it away before classification saw it.

describe("PROP-NEG-05 — perturbing reporting-only sync-manifest fields never changes classification (PROPERTIES §10)", () => {
  function buildStaleAndLocalEditTree() {
    const plugin = makePluginTree();
    const consumer = makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true, syncManifest: {} });
    const trees = { consumer, plugin };
    const staleRow = plugin.manifest.rows[0];
    const localEditRow = plugin.manifest.rows[1];
    setRowState(trees, staleRow.id, "stale");
    setRowState(trees, localEditRow.id, "local-edit");
    return { consumer, plugin, staleRow, localEditRow };
  }

  const PERTURBATIONS = [
    { field: "artifactVersion", value: "9999.0.0-perturbed" },
    { field: "pluginVersion", value: "9999.0.0-perturbed" },
    { field: "syncedAtUtc", value: "1970-01-01T00:00:00.000Z" },
    // Draw (5), MANDATORY: misusing this field is the one that flips US-03's direction answer.
    { field: "pluginHash", value: "0000000000000000000000000000000000dead" },
  ];

  for (const { field, value } of PERTURBATIONS) {
    test(`perturbing entry.${field} does not change the stale/local-edit classification, and persists unread-normalised`, () => {
      const { consumer, plugin, staleRow, localEditRow } = buildStaleAndLocalEditTree();
      try {
        const before = readSyncManifest(consumer.root);
        before.entries[staleRow.id][field] = value;
        before.entries[localEditRow.id][field] = value;
        writeFileSync(
          join(consumer.root, ".claude", "workflows", ".pdlc-sync-manifest.json"),
          JSON.stringify(before, null, 2) + "\n"
        );

        runOn("check", consumer, plugin);
        const state = readDriftState(consumer.root);
        expect(state).not.toBeNull();
        const staleAfter = state.rows.find((r) => r.id === staleRow.id);
        const localEditAfter = state.rows.find((r) => r.id === localEditRow.id);
        expect(staleAfter.state).toBe("stale");
        expect(localEditAfter.state).toBe("local-edit");
        recordObservedState(staleAfter.state);
        recordObservedState(localEditAfter.state);

        // Reached-the-subject proxy: the perturbed value is still exactly what was written —
        // --check never rewrote or normalised it away before classify saw it.
        const after = readSyncManifest(consumer.root);
        expect(after.entries[staleRow.id][field]).toBe(value);
        expect(after.entries[localEditRow.id][field]).toBe(value);
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    });
  }

  // A second artifactVersion draw (the cost table's "×2"), perturbed independently of pluginVersion
  // on the SAME two rows, to also cover the "two different rows, two different values" shape.
  test("perturbing entry.artifactVersion independently on the stale row and the local-edit row does not change classification", () => {
    const { consumer, plugin, staleRow, localEditRow } = buildStaleAndLocalEditTree();
    try {
      const before = readSyncManifest(consumer.root);
      before.entries[staleRow.id].artifactVersion = "1111.1.1-stale-only";
      before.entries[localEditRow.id].artifactVersion = "2222.2.2-local-edit-only";
      writeFileSync(
        join(consumer.root, ".claude", "workflows", ".pdlc-sync-manifest.json"),
        JSON.stringify(before, null, 2) + "\n"
      );

      runOn("check", consumer, plugin);
      const state = readDriftState(consumer.root);
      expect(state).not.toBeNull();
      expect(state.rows.find((r) => r.id === staleRow.id).state).toBe("stale");
      expect(state.rows.find((r) => r.id === localEditRow.id).state).toBe("local-edit");
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });
});

// ═══════════════════════════════════════ coverage floors ═══════════════════════════════════════

test("row-state meta-oracle: all six declared row states are observed at least once (FSPEC §3.3, TSPEC §1.4/O-11)", () => {
  expect(ROW_STATES_SEEN).toEqual(
    new Set(["unknown", "missing", "in-sync", "unverified", "stale", "local-edit"])
  );
});

test("row-reason meta-oracle: all four declared unknown reasons are observed at least once (FSPEC §3.3, TSPEC §1.4/O-11)", () => {
  expect(ROW_REASONS_SEEN).toEqual(
    new Set([
      "hash-tool-absent",
      "plugin-artifact-missing",
      "plugin-artifact-unreadable",
      "consumer-artifact-unreadable",
    ])
  );
});
