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

import { existsSync, writeFileSync, readFileSync, rmSync, utimesSync } from "fs";
import { join } from "path";
import {
  runScript,
  readDriftState,
  makeToolDir,
  countOf,
} from "./helpers/driftHarness.js";
import { makeConsumerTree, makePluginTree, setRowState } from "./helpers/driftFixtures.js";
import {
  itOrSkip,
  describeOrSkip,
  INVARIANTS_AT_32A,
  INVARIANTS_AT_34,
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
const PROBE_TOOLS_WITHOUT_HASH = Object.freeze(["bash", "git", "python3", "mv", "rm", "date", "printf"]);

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
    state: stateResult.ok ? stateResult.fields[0] : undefined,
    reason: reasonResult.ok ? reasonResult.fields[0] : undefined,
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
