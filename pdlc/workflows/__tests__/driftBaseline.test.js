/**
 * driftBaseline.test.js — the baseline-resolution suite (TSPEC §2.1-§2.9's E1-E7 evidence
 * ladder + §2.8's fixed 8-reason precedence; FSPEC §2).
 *
 * Ownership (PLAN, single-writer-per-file across batches): T-21 (batch 5) owns exactly this
 * file. No other task touches it.
 *
 * Named cases owned here (TSPEC §14 / §14.1):
 *   - AT-3   — pre-manifest consumer, hook warns manifest-absent, `pluginUpdate` remediation
 *   - B-1    — pre-manifest consumer's `--check` exits 3, same remediation conjunct
 *   - B-4    — pre-manifest + checkEnabled:false, same three conjuncts through `--check`
 *   - M-3    — one it() per each of the eight §2.8 baseline reasons, remediation-class only
 *   - the baseline-reason meta-oracle (§1.4's floor: a module-level Set asserted set-equal to
 *     the literal eight-member list — a FAILING ASSERTION, not a checklist, if any reason is
 *     never exercised)
 *   - the layer-2 sourced-probe cases (PLAN T-39): `pdlc_load_manifest` over the eight
 *     baseline fixtures via `runProbe`, dumping `PDLC_BASELINE_STATUS` / `PDLC_BASELINE_REASON`
 *     / the `PDLC_ROWS_*` parallel arrays / the `PDLC_EVIDENCE_*` triple, plus
 *     `PDLC_CHECK_ENABLED` resolved on an *unresolved* path.
 *
 * RED (batch 5): C1 (`pdlc/hooks/scripts/lib/pdlc-drift.sh`, T-31/T-32, batch 6) and C2/C3
 * (`check-workflow-drift.sh` / `sync-workflows.sh`, later batches) do not exist yet. Every
 * `runScript()`-based assertion below therefore fails against a nonexistent bash entrypoint
 * (`spawnSync` returns a non-zero/ENOENT-shaped result), and every `runProbe()`-based assertion
 * fails because `bin/lib-probe.sh`'s `source "$C1_PATH" 2>/dev/null || true` silently no-ops, so
 * every probed function resolves to `unknown-function` (TSPEC §11.2, T-39's own header comment).
 * This is the expected RED-terminal state for this batch — each `it()` is authored to be
 * CORRECT against the TSPEC/FSPEC once T-31/T-32/T-37 land, and fails now with a clear,
 * per-case assertion error rather than the whole file refusing to collect: unlike
 * `bootstrap.test.js` (T-06, batch 2), this file imports only already-landed collaborators
 * (`validateDriftRecord`/`mapDriftState` both landed in T-11/T-12, batch 4), so there is no
 * missing-export load failure to guard against here.
 */

import { existsSync, mkdirSync, mkdtempSync, unlinkSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import {
  runScript,
  readDriftState,
  remediationOf,
  expectRemediationClass,
  expectRepoRootUnresolved,
  countOf,
  allOf,
} from "./helpers/driftHarness.js";
import { makeConsumerTree, makePluginTree } from "./helpers/driftFixtures.js";
import {
  snapshotTree,
  parseTrace,
  assertPhaseOrder,
  assertRecordedPassIs,
} from "./helpers/driftOrdering.js";
import { itOrSkip, INVARIANTS_AT_14B } from "./helpers/driftCapabilities.js";
import { enumerateEvidenceVectors } from "./helpers/driftGenerators.js";
import { runProbe } from "./helpers/driftProbe.js";
import { validateDriftRecord, mapDriftState } from "../orchestrate-queue.js";

// The DEFAULT_PATH_TOOLS set `driftHarness.js` itself resolves onto every ordinary run
// (private there — reproduced here only for the one fixture, `jsonToolAbsent`, that needs to
// omit a member of it; TSPEC §13.2: "`makeToolDir` without `python3`/`python`/`python2`").
const PATH_TOOLS_WITHOUT_PYTHON = Object.freeze([
  "bash",
  "git",
  "shasum",
  "sha1sum",
  "mv",
  "rm",
  "date",
  "printf",
  "mkdir",
]);

// The literal eight-member baseline-reason list (FSPEC §2.8, highest precedence first) — the
// meta-oracle's expected set. Written out verbatim rather than derived from any production
// constant, so this test cannot be satisfied by silently mirroring an implementation bug.
const EIGHT_BASELINE_REASONS = Object.freeze([
  "drift-state-invalidated",
  "manifest-empty",
  "json-tool-absent",
  "manifest-malformed",
  "manifest-absent",
  "repo-root-unresolved",
  "plugin-root-unreadable",
  "plugin-root-unset",
]);

// TSPEC §1.4's coverage floor: a module-level Set populated by every case below that exercises
// one of the eight baseline reasons. The final `it()` in this file asserts this is set-equal to
// `EIGHT_BASELINE_REASONS` — a failing assertion if any reason is never reached, not a manually
// maintained checklist.
const exercisedBaselineReasons = new Set();

// PROP-RSN-05 (baseline half, PROPERTIES §4): the closed four-member row-reason set (FSPEC
// §3.3's own precedence), written out verbatim for the same reason `EIGHT_BASELINE_REASONS`
// is — this file never derives its oracle from the implementation it is checking.
const FOUR_ROW_REASONS = Object.freeze([
  "hash-tool-absent",
  "plugin-artifact-missing",
  "plugin-artifact-unreadable",
  "consumer-artifact-unreadable",
]);

/**
 * PROP-RSN-05 (baseline half): `rows[].reason` is never a member of the eight-member baseline
 * set, `baselineReason` is never a member of the four-member row set, and no row exists while
 * `baselineStatus === "unresolved"` (§4's disjointness clause, AC-1.2). Invoked at every
 * `readDriftState` call site this file's new cases add, per PROPERTIES §4's framing: "a
 * cross-cutting invariant checked by a shared read-back helper... over the whole suite", not a
 * property demonstrated by one hand-picked fixture.
 * @param {object} state a parsed drift-state record (readDriftState's return)
 */
function assertReasonsDisjoint(state) {
  if (state.baselineReason !== null) {
    expect(FOUR_ROW_REASONS).not.toContain(state.baselineReason);
  }
  if (state.baselineStatus === "unresolved") {
    expect(state.rows).toEqual([]);
  }
  for (const row of state.rows || []) {
    if (row.reason !== null && row.reason !== undefined) {
      expect(EIGHT_BASELINE_REASONS).not.toContain(row.reason);
    }
  }
}

// ───────────────────────────── fixture builders (§13.1/§13.2) ─────────────────────────────

/** `preManifestConsumer` (§13.1): plugin tree with NO `distribution-manifest.json`. */
function buildPreManifestConsumer() {
  const consumer = makeConsumerTree({ git: true, claudeDir: true });
  const plugin = makePluginTree();
  unlinkSync(join(plugin.pluginRoot, "workflows", "dist", "distribution-manifest.json"));
  return { consumer, plugin };
}

/** `preManifestOptOut` (§14.1 B-4): `preManifestConsumer` + `checkEnabled:false` config, no
 * pre-existing drift state. */
function buildPreManifestOptOut() {
  const consumer = makeConsumerTree({
    git: true,
    claudeDir: true,
    config: { distribution: { checkEnabled: false } },
  });
  const plugin = makePluginTree();
  unlinkSync(join(plugin.pluginRoot, "workflows", "dist", "distribution-manifest.json"));
  return { consumer, plugin };
}

/** `emptyManifest`: a well-formed manifest, `rows: []` (FSPEC §2.6 — 0 rows is manifest-empty,
 * never manifest-malformed). */
function buildEmptyManifest() {
  const consumer = makeConsumerTree({ git: true, claudeDir: true });
  const plugin = makePluginTree({ rows: [] });
  return { consumer, plugin };
}

/** `manifestUnparseable` (§13.1): `manifestRaw` — unparseable bytes, the `manifest-malformed`
 * production path via the JSON helper's `12` return (FSPEC §2.3). */
function buildManifestUnparseable() {
  const consumer = makeConsumerTree({ git: true, claudeDir: true });
  const plugin = makePluginTree({ manifestRaw: "{ not json" });
  return { consumer, plugin };
}

/** `jsonToolAbsent` (§13.2): `makeToolDir` without `python3`/`python`/`python2`; no pre-existing
 * drift state; an otherwise well-formed plugin tree so nothing else co-holds. */
function buildJsonToolAbsent() {
  const consumer = makeConsumerTree({ git: true, claudeDir: true });
  const plugin = makePluginTree();
  return { consumer, plugin };
}

/** `pluginRootUnset` (§13.1, TE F-08): an ordinary consumer tree (no maintainer marker) with a
 * well-formed plugin tree that is simply never named via `CLAUDE_PLUGIN_ROOT` — the caller must
 * omit `opts.pluginRoot` entirely rather than passing `undefined` explicitly as a value (the
 * sandbox only sets the env var when `o.pluginRoot` is truthy either way). */
function buildPluginRootUnset() {
  const consumer = makeConsumerTree({ git: true, claudeDir: true });
  const plugin = makePluginTree();
  return { consumer, plugin };
}

/** Plugin-root-unreadable (FSPEC §2.9 edge case): `${CLAUDE_PLUGIN_ROOT}` set to a plain FILE,
 * not a directory — "not traversable" without needing a uid-0-sensitive permission fixture. */
function buildPluginRootUnreadable() {
  const consumer = makeConsumerTree({ git: true, claudeDir: true });
  const badRootDir = mkdtempSync(join(tmpdir(), "pdlc-badroot-"));
  const badPluginRoot = join(badRootDir, "not-a-directory");
  writeFileSync(badPluginRoot, "this is a file, not a plugin root\n");
  return { consumer, badPluginRoot };
}

/** `nonGitNoClaude` (§13.2/§8.2): no `.git` anywhere from `root` up to `home`, no `.claude/` —
 * repo root does not resolve. A well-formed plugin tree, named explicitly via
 * `CLAUDE_PLUGIN_ROOT`, so `repo-root-unresolved` is the only failing evidence. */
function buildRepoRootUnresolved() {
  const consumer = makeConsumerTree({ git: false, claudeDir: false });
  const plugin = makePluginTree();
  return { consumer, plugin };
}

/** `unwritableParent` + `preExistingDriftState` (§13.1, AT-14b): `.claude/workflows/` `0500`
 * (not writable), the drift-state file itself left at its ordinary (writable) mode, chmod
 * applied LAST — rung (i) can still truncate-write the file in place even though a fresh sibling
 * temp file cannot be created in the directory (FSPEC §4.4's corrected rung table). uid-0
 * unconstructible (permission bits bypassed) — named skip, TSPEC §1.3/SKIP_INVENTORY's AT-14b
 * entry. */
function buildDriftStateInvalidated() {
  const preExistingDriftState = {
    schemaVersion: 1,
    generatedAtUtc: new Date().toISOString(),
    baselineStatus: "resolved",
    baselineReason: null,
    checkEnabled: false,
    rows: [],
    retiredPresent: [],
    writeFailures: [],
    generatedBy: "sync",
    pluginVersion: "0.11.0",
    syncCommand: null,
  };
  const consumer = makeConsumerTree({
    git: true,
    claudeDir: true,
    config: { distribution: { checkEnabled: false } },
    driftState: preExistingDriftState,
    workflowsDir: { mode: 0o500 },
  });
  const plugin = makePluginTree();
  return { consumer, plugin };
}

// ───────────────────────────── AT-3 / B-1 / B-4 ─────────────────────────────

describe("AT-3 / §14.1 B-1 / §14.1 B-4 — pre-manifest consumer baseline (manifest-absent)", () => {
  it("AT-3: hook warns manifest-absent, W-1 carries the pluginUpdate remediation (mustNotName SYNC_CMD)", () => {
    const { consumer, plugin } = buildPreManifestConsumer();
    try {
      const run = runScript("hook", {
        consumerRoot: consumer.root,
        home: consumer.home,
        pluginRoot: plugin.pluginRoot,
      });
      run.root = consumer.root;
      const syncCmd = join(plugin.pluginRoot, "hooks", "scripts", "sync-workflows.sh");

      const state = readDriftState(consumer.root);
      expect(state).not.toBeNull();
      expect(state.baselineStatus).toBe("unresolved");
      expect(state.baselineReason).toBe("manifest-absent");
      exercisedBaselineReasons.add("manifest-absent");

      const remediation = remediationOf(run.stderr, "W-1");
      expectRemediationClass(remediation, "pluginUpdate", { syncCmd });
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });

  it("B-1: preManifestConsumer's --check exits 3 (not 1, not 4), same remediation conjunct", () => {
    const { consumer, plugin } = buildPreManifestConsumer();
    try {
      const run = runScript("check", {
        consumerRoot: consumer.root,
        home: consumer.home,
        pluginRoot: plugin.pluginRoot,
      });
      run.root = consumer.root;
      const syncCmd = join(plugin.pluginRoot, "hooks", "scripts", "sync-workflows.sh");

      expect(run.status).toBe(3);

      const remediation = remediationOf(run.stderr, "W-1");
      expectRemediationClass(remediation, "pluginUpdate", { syncCmd });
      exercisedBaselineReasons.add("manifest-absent");
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });

  it("B-4: preManifestOptOut — same three conjuncts through --check; checkEnabled:false gates the queue only (AC-4.3), --check itself still exits 3", () => {
    const { consumer, plugin } = buildPreManifestOptOut();
    try {
      const run = runScript("check", {
        consumerRoot: consumer.root,
        home: consumer.home,
        pluginRoot: plugin.pluginRoot,
      });
      run.root = consumer.root;
      const syncCmd = join(plugin.pluginRoot, "hooks", "scripts", "sync-workflows.sh");

      // Conjunct 1: --check still exits 3 — the config opt-out never overrides the baseline
      // reason gate, only the queue's mapping over the resulting record (AC-4.3).
      expect(run.status).toBe(3);

      // Conjunct 2: the same W-1 pluginUpdate remediation as AT-3/B-1.
      const remediation = remediationOf(run.stderr, "W-1");
      expectRemediationClass(remediation, "pluginUpdate", { syncCmd });

      // Conjunct 3: the record preserves checkEnabled:false (AC-2.9(3)) and carries
      // baselineReason: "manifest-absent".
      const state = readDriftState(consumer.root);
      expect(state).not.toBeNull();
      expect(state.checkEnabled).toBe(false);
      expect(state.baselineReason).toBe("manifest-absent");

      // §12.3's own read: mapDriftState(validateDriftRecord(raw)) yields the row-2 opt-out
      // gate over the record actually on disk, never a literal.
      const validated = validateDriftRecord(state);
      const gate = mapDriftState(validated);
      expect(gate).toMatchObject({ outcome: "proceed", row: 2 });

      exercisedBaselineReasons.add("manifest-absent");
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });
});

// ───────────────────────────── M-3: one it() per baseline reason ─────────────────────────────

describe("M-3 — one it() per baseline reason (8), reason -> remediation class (AC-2.5a)", () => {
  it("manifest-absent -> pluginUpdate, mustNotName SYNC_CMD", () => {
    const { consumer, plugin } = buildPreManifestConsumer();
    try {
      const run = runScript("check", {
        consumerRoot: consumer.root,
        home: consumer.home,
        pluginRoot: plugin.pluginRoot,
      });
      const syncCmd = join(plugin.pluginRoot, "hooks", "scripts", "sync-workflows.sh");

      const state = readDriftState(consumer.root);
      expect(state.baselineReason).toBe("manifest-absent");
      expectRemediationClass(remediationOf(run.stderr, "W-1"), "pluginUpdate", { syncCmd });
      exercisedBaselineReasons.add("manifest-absent");
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });

  it("manifest-empty -> pluginUpdate, mustNotName SYNC_CMD", () => {
    const { consumer, plugin } = buildEmptyManifest();
    try {
      const run = runScript("check", {
        consumerRoot: consumer.root,
        home: consumer.home,
        pluginRoot: plugin.pluginRoot,
      });
      const syncCmd = join(plugin.pluginRoot, "hooks", "scripts", "sync-workflows.sh");

      const state = readDriftState(consumer.root);
      expect(state.baselineReason).toBe("manifest-empty");
      expectRemediationClass(remediationOf(run.stderr, "W-1"), "pluginUpdate", { syncCmd });
      exercisedBaselineReasons.add("manifest-empty");
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });

  it("json-tool-absent -> environment, names a Python interpreter", () => {
    const { consumer, plugin } = buildJsonToolAbsent();
    try {
      const run = runScript("check", {
        consumerRoot: consumer.root,
        home: consumer.home,
        pluginRoot: plugin.pluginRoot,
        path: PATH_TOOLS_WITHOUT_PYTHON,
      });
      const syncCmd = join(plugin.pluginRoot, "hooks", "scripts", "sync-workflows.sh");

      const state = readDriftState(consumer.root);
      expect(state.baselineReason).toBe("json-tool-absent");
      const remediation = remediationOf(run.stderr, "W-1");
      expectRemediationClass(remediation, "environment", {
        mustName: [/python/i],
        syncCmd,
      });
      exercisedBaselineReasons.add("json-tool-absent");
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });

  it("manifest-malformed -> pluginUpdate, mustNotName SYNC_CMD", () => {
    const { consumer, plugin } = buildManifestUnparseable();
    try {
      const run = runScript("check", {
        consumerRoot: consumer.root,
        home: consumer.home,
        pluginRoot: plugin.pluginRoot,
      });
      const syncCmd = join(plugin.pluginRoot, "hooks", "scripts", "sync-workflows.sh");

      const state = readDriftState(consumer.root);
      expect(state.baselineReason).toBe("manifest-malformed");
      expectRemediationClass(remediationOf(run.stderr, "W-1"), "pluginUpdate", { syncCmd });
      exercisedBaselineReasons.add("manifest-malformed");
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });

  it("repo-root-unresolved -> environment, names .claude/ and the git work tree", () => {
    const { consumer, plugin } = buildRepoRootUnresolved();
    try {
      const before = snapshotTree(consumer.root);
      const run = runScript("check", {
        consumerRoot: consumer.root,
        home: consumer.home,
        pluginRoot: plugin.pluginRoot,
      });
      run.root = consumer.root;
      const syncCmd = join(plugin.pluginRoot, "hooks", "scripts", "sync-workflows.sh");

      expectRepoRootUnresolved(run, {
        root: consumer.root,
        snapshotBefore: before,
        reportedReason: "repo-root-unresolved",
      });

      const remediation = remediationOf(run.stderr, "W-1");
      expectRemediationClass(remediation, "environment", {
        mustName: [/\.claude\//, /git work tree/i],
        syncCmd,
      });
      exercisedBaselineReasons.add("repo-root-unresolved");
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });

  it("plugin-root-unreadable -> environment (deliberately generic)", () => {
    const { consumer, badPluginRoot } = buildPluginRootUnreadable();
    try {
      const run = runScript("check", {
        consumerRoot: consumer.root,
        home: consumer.home,
        pluginRoot: badPluginRoot,
      });

      const state = readDriftState(consumer.root);
      expect(state.baselineReason).toBe("plugin-root-unreadable");
      const remediation = remediationOf(run.stderr, "W-1");
      const syncCmd = join(badPluginRoot, "hooks", "scripts", "sync-workflows.sh");
      expectRemediationClass(remediation, "environment", { syncCmd });
      exercisedBaselineReasons.add("plugin-root-unreadable");
    } finally {
      consumer.cleanup();
    }
  });

  it("plugin-root-unset -> environment", () => {
    const { consumer, plugin } = buildPluginRootUnset();
    try {
      const run = runScript("check", {
        consumerRoot: consumer.root,
        home: consumer.home,
        // pluginRoot deliberately omitted — CLAUDE_PLUGIN_ROOT absent (TE F-08 recipe).
      });

      const state = readDriftState(consumer.root);
      expect(state.baselineReason).toBe("plugin-root-unset");
      const remediation = remediationOf(run.stderr, "W-1");
      const syncCmd = join(plugin.pluginRoot, "hooks", "scripts", "sync-workflows.sh");
      expectRemediationClass(remediation, "environment", { syncCmd });
      exercisedBaselineReasons.add("plugin-root-unset");
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });

  itOrSkip(
    "drift-state-invalidated -> permissions, mustNotName SYNC_CMD (AT-14b, uid-0 unconstructible)",
    "uid-nonroot",
    INVARIANTS_AT_14B,
    () => {
      const { consumer, plugin } = buildDriftStateInvalidated();
      try {
        runScript("check", {
          consumerRoot: consumer.root,
          home: consumer.home,
          pluginRoot: plugin.pluginRoot,
        });

        // TSPEC §7.4/AC-2.5a: `drift-state-invalidated` is the one baseline reason with no
        // W-1 rendering site — it is never produced by §2.1's evidence phase (FSPEC §2.8), so
        // the entrypoint that produces it never emits W-1 for it. Its reason -> `permissions`
        // remediation-class floor is asserted at its actual rendering site instead — the
        // queue's Manifest-level report line (FSPEC §6.3), covered by
        // `queueDriftGate.test.js`'s row-3 cases. This case owns the write-mechanics assertion
        // (AT-14b: rung (i) succeeds, `checkEnabled` preserved) that only this fixture exercises.
        const state = readDriftState(consumer.root);
        expect(state).not.toBeNull();
        expect(state.baselineReason).toBe("drift-state-invalidated");
        expect(state.checkEnabled).toBe(false);

        exercisedBaselineReasons.add("drift-state-invalidated");
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    }
  );
});

// ───────────────────────────── the baseline-reason meta-oracle (§1.4 floor) ─────────────────

describe("baseline-reason coverage floor (TSPEC §1.4 — a failing assertion, not a checklist)", () => {
  it("every one of the eight §2.8 baseline reasons was exercised by at least one case above", () => {
    expect(new Set(exercisedBaselineReasons)).toEqual(new Set(EIGHT_BASELINE_REASONS));
  });
});

// ───────────────────────────── T-39 layer-2 sourced-probe cases ─────────────────────────────
//
// `pdlc_load_manifest` (C1, T-31/T-32) over the eight §13.1/§13.2 baseline fixtures, driven
// through `bin/lib-probe.sh` (T-39) rather than through a bash entrypoint — this is the
// batch-7 observable that does not need C2/C3 to exist (PLAN's Phase 4 preamble). Batch 5: C1
// itself does not exist yet, so every one of these resolves `unknown-function` (T-39's own
// header comment) — authored now so it goes green the instant T-31/T-32 land.

describe("T-39 layer-2 sourced-probe: pdlc_load_manifest over the eight baseline fixtures", () => {
  function probeOneFixture(name, buildFixture) {
    it(`pdlc_load_manifest resolves ${name} baseline via the sourced probe`, () => {
      const built = buildFixture();
      const { consumer } = built;
      const pluginRootForProbe =
        built.badPluginRoot !== undefined ? built.badPluginRoot : built.plugin && built.plugin.pluginRoot;
      try {
        const cases = [
          `pdlc_load_manifest\t${consumer.root}\t${pluginRootForProbe || ""}`,
          "dump\tPDLC_BASELINE_STATUS",
          "dump\tPDLC_BASELINE_REASON",
          "dump\tPDLC_ROWS_ID",
          "dump\tPDLC_ROWS_STATE",
          "dump\tPDLC_EVIDENCE_REPO_ROOT",
          "dump\tPDLC_EVIDENCE_PLUGIN_ROOT",
          "dump\tPDLC_EVIDENCE_MANIFEST",
          "dump\tPDLC_CHECK_ENABLED",
        ];
        const results = runProbe(cases);

        expect(results).toHaveLength(cases.length);
        const [loadResult, ...dumps] = results;

        // RED (batch 5): C1 does not exist, so every call resolves "unknown-function" —
        // asserted here as the case's own oracle so it flips to a real shape assertion the
        // instant T-31/T-32 land, rather than silently passing on a vacuous "did not throw".
        expect(loadResult.ok).toBe(true);
        for (const dump of dumps) {
          expect(dump.ok).toBe(true);
        }
      } finally {
        consumer.cleanup();
        if (built.plugin) built.plugin.cleanup();
      }
    });
  }

  probeOneFixture("manifest-absent", buildPreManifestConsumer);
  probeOneFixture("manifest-empty", buildEmptyManifest);
  probeOneFixture("manifest-malformed", buildManifestUnparseable);
  probeOneFixture("repo-root-unresolved", buildRepoRootUnresolved);
  probeOneFixture("plugin-root-unreadable", buildPluginRootUnreadable);
  probeOneFixture("plugin-root-unset", buildPluginRootUnset);

  // json-tool-absent and drift-state-invalidated need a non-default PATH / uid-nonroot
  // capability respectively — probed with their own explicit env, not through the shared
  // `probeOneFixture` helper (which never overrides `env`).
  it("pdlc_load_manifest resolves json-tool-absent baseline via the sourced probe", () => {
    const { consumer, plugin } = buildJsonToolAbsent();
    try {
      const cases = [
        `pdlc_load_manifest\t${consumer.root}\t${plugin.pluginRoot}`,
        "dump\tPDLC_BASELINE_REASON",
        "dump\tPDLC_CHECK_ENABLED",
      ];
      const results = runProbe(cases);
      expect(results).toHaveLength(cases.length);
      expect(results[0].ok).toBe(true);
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });

  itOrSkip(
    "pdlc_load_manifest resolves drift-state-invalidated baseline via the sourced probe (AT-14b, uid-0 unconstructible)",
    "uid-nonroot",
    INVARIANTS_AT_14B,
    () => {
      const { consumer, plugin } = buildDriftStateInvalidated();
      try {
        const cases = [
          `pdlc_load_manifest\t${consumer.root}\t${plugin.pluginRoot}`,
          "dump\tPDLC_BASELINE_REASON",
          "dump\tPDLC_CHECK_ENABLED",
        ];
        const results = runProbe(cases);
        expect(results).toHaveLength(cases.length);
        expect(results[0].ok).toBe(true);
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    }
  );

  // `PDLC_CHECK_ENABLED` resolved on an *unresolved* path (E7 runs on both resolved and
  // unresolved paths, FSPEC §2.7) — probed directly over the plugin-root-unset fixture, whose
  // baseline is unresolved by construction.
  it("PDLC_CHECK_ENABLED resolves fail-closed-true on an unresolved (plugin-root-unset) path", () => {
    const { consumer } = buildPluginRootUnset();
    try {
      const cases = [
        `pdlc_load_manifest\t${consumer.root}\t`,
        "dump\tPDLC_BASELINE_STATUS",
        "dump\tPDLC_CHECK_ENABLED",
      ];
      const results = runProbe(cases);
      expect(results).toHaveLength(cases.length);
      expect(results[0].ok).toBe(true);
    } finally {
      consumer.cleanup();
    }
  });

  // "no execute bit needed" fixture-shape guard mirrors §11.2's own driver-contract test: the
  // probe must report one result line per input case even when every case is unresolved
  // (`mkdirSync` used only to prove the sandbox tmp dir this suite builds is itself writable,
  // matching this file's other fixtures' construction convention).
  it("the probe driver reports one result line per input case, even for an all-unknown-function run", () => {
    const scratch = mkdtempSync(join(tmpdir(), "pdlc-baseline-probe-scratch-"));
    mkdirSync(join(scratch, "noop"), { recursive: true });
    const cases = ["pdlc_load_manifest\t/nonexistent\t/nonexistent", "dump\tPDLC_BASELINE_STATUS"];
    const results = runProbe(cases);
    expect(results).toHaveLength(cases.length);
  });
});

// ───────────────────────── T-42: PROP-BSL-01/-02/-03/-04 (the 20 evidence vectors) ─────────────────────────
//
// PLAN T-42. The oracle is recomputed from the vector itself (PROPERTIES §5.2's own rule,
// PROP-BSL-03), never copied from a table: `expected = precedence.find(c => vector[c] === "holds")`.
// Because `conditionHolds` only ever tests a field for the literal string `"holds"`, an
// `"indeterminate"` field can never win the `find` — which is exactly PROP-BSL-04's claim, so a
// single loop asserting `actual === expected` (PROP-BSL-03) also discharges PROP-BSL-04 without a
// second traversal. PROP-BSL-01 (totality) and PROP-BSL-02 (null-exactly biconditional) are the
// two shape conjuncts asserted before the reason comparison on every iteration.

describe("PROP-BSL-01/-02/-03/-04 — totality, null-biconditional, precedence, indeterminate-exclusion over the 20 evidence vectors", () => {
  // FSPEC §2.8's fixed 8-reason precedence, minus `drift-state-invalidated` (never a member of
  // `enumerateEvidenceVectors()`'s vector — PROPERTIES §5.1: "not an evidence axis").
  const PRECEDENCE = Object.freeze([
    "manifest-empty",
    "json-tool-absent",
    "manifest-malformed",
    "manifest-absent",
    "repo-root-unresolved",
    "plugin-root-unreadable",
    "plugin-root-unset",
  ]);

  function conditionHolds(vector, condition) {
    switch (condition) {
      case "manifest-empty":
        return vector.E6 === "holds";
      case "json-tool-absent":
        return vector.E2 === "holds";
      case "manifest-malformed":
        return vector.E5 === "holds";
      case "manifest-absent":
        return vector.E4 === "holds";
      case "repo-root-unresolved":
        return vector.E1 === "holds";
      case "plugin-root-unreadable":
        return vector.E3 === "unreadable";
      case "plugin-root-unset":
        return vector.E3 === "unset";
      default:
        throw new Error(`PROP-BSL-03: unknown precedence condition "${condition}"`);
    }
  }

  function expectedReasonFor(vector) {
    const hit = PRECEDENCE.find((condition) => conditionHolds(vector, condition));
    return hit !== undefined ? hit : null;
  }

  // Maps one evidence vector onto a concrete fixture. E1 selects the repo-root recipe (git-tree
  // when `does-not-hold`, matching this file's other resolved-root builders; the truly-unresolved
  // recipe when `holds`, matching `buildRepoRootUnresolved`). E3 selects whether/how a plugin root
  // is even named. E4/E5/E6 only matter when E3 is `"ok"` — otherwise the manifest is never read
  // at all, so building it any particular way is immaterial (§5.1's table: those rows carry
  // E4/E5/E6 indeterminate precisely because E3 failed first).
  function buildVectorFixture(vector) {
    const consumer =
      vector.E1 === "holds"
        ? makeConsumerTree({ git: false, claudeDir: false })
        : makeConsumerTree({ git: true, claudeDir: true });

    let plugin;
    let pluginRootForRun;

    if (vector.E3 === "unset") {
      pluginRootForRun = undefined;
    } else if (vector.E3 === "unreadable") {
      const badRootDir = mkdtempSync(join(tmpdir(), "pdlc-badroot-vec-"));
      pluginRootForRun = join(badRootDir, "not-a-directory");
      writeFileSync(pluginRootForRun, "this is a file, not a plugin root\n");
    } else {
      if (vector.E5 === "holds") {
        plugin = makePluginTree({ manifestRaw: "{ not json" });
      } else if (vector.E6 === "holds") {
        plugin = makePluginTree({ rows: [] });
      } else {
        plugin = makePluginTree();
      }
      if (vector.E4 === "holds") {
        unlinkSync(join(plugin.pluginRoot, "workflows", "dist", "distribution-manifest.json"));
      }
      pluginRootForRun = plugin.pluginRoot;
    }

    const path = vector.E2 === "holds" ? PATH_TOOLS_WITHOUT_PYTHON : undefined;

    return {
      consumer,
      plugin,
      pluginRootForRun,
      path,
      cleanup() {
        consumer.cleanup();
        if (plugin) plugin.cleanup();
      },
    };
  }

  function labelFor(vector) {
    return `E1=${vector.E1} E2=${vector.E2} E3=${vector.E3} E4=${vector.E4} E5=${vector.E5} E6=${vector.E6}`;
  }

  function runVector(vector) {
    return () => {
      const built = buildVectorFixture(vector);
      try {
        const runOpts = {
          consumerRoot: built.consumer.root,
          home: built.consumer.home,
        };
        if (built.pluginRootForRun) runOpts.pluginRoot = built.pluginRootForRun;
        if (built.path) runOpts.path = built.path;

        const run = runScript("check", runOpts);
        const expected = expectedReasonFor(vector);

        // A vector with E1 = "holds" never resolves a repo root at all — PROP-BSL-06's own
        // domain note ("nothing is created under the fixture root") means there is no drift
        // state file to read back; the reported reason is only observable on stderr's W-1 line
        // (the same route M-3's own `repo-root-unresolved` case uses). Every other vector
        // resolves a root and is read back from the persisted record as usual.
        let actualReason;
        if (vector.E1 === "holds") {
          const w1 = allOf(run.stderr, "W-1");
          expect(w1.length).toBeGreaterThanOrEqual(1);
          actualReason = w1[0].groups.reason;
          expect(readDriftState(built.consumer.root)).toBeNull();
        } else {
          const state = readDriftState(built.consumer.root);
          expect(state).not.toBeNull();
          actualReason = state.baselineReason;

          // PROP-BSL-01: totality — a closed three-shape outcome, never a fourth.
          if (expected === null) {
            expect(state.baselineStatus).toBe("resolved");
            expect(state.baselineReason).toBeNull();
          } else {
            expect(state.baselineStatus).toBe("unresolved");
            expect(EIGHT_BASELINE_REASONS).toContain(state.baselineReason);

            // PROP-BSL-05 (record half): unresolved implies not-evaluated, uniformly —
            // rows === [] and retiredPresent === [] on every vector that selects a reason and
            // still has a record to read back (the E1 = "holds" branch above has no record at
            // all, covered instead by PROP-BSL-06's "no write target" claim).
            expect(state.rows).toEqual([]);
            expect(state.retiredPresent).toEqual([]);
          }

          // PROP-BSL-02: null exactly when resolved.
          expect(state.baselineReason === null).toBe(state.baselineStatus === "resolved");

          assertReasonsDisjoint(state);
        }

        // PROP-BSL-03: the selector is the declared precedence, recomputed from the vector.
        expect(actualReason).toBe(expected);

        // PROP-BSL-04: an indeterminate condition is never selected — checked explicitly (not
        // only implied by PROP-BSL-03's equality) so a failure here names the axis.
        for (const [axis, condition] of [
          ["E4", "manifest-absent"],
          ["E5", "manifest-malformed"],
          ["E6", "manifest-empty"],
        ]) {
          if (vector[axis] === "indeterminate") {
            expect(actualReason).not.toBe(condition);
          }
        }

        if (actualReason) exercisedBaselineReasons.add(actualReason);
      } finally {
        built.cleanup();
      }
    };
  }

  for (const vector of enumerateEvidenceVectors()) {
    const expected = expectedReasonFor(vector);
    const name = `vector ${labelFor(vector)} -> ${expected || "resolved"}`;
    if (vector.E1 === "does-not-hold") {
      itOrSkip(
        `${name} (git-routed)`,
        "git",
        [
          "AC-0.5 step 1's never-fall-through rule and the git-worktree-list guard are unverified; the walk-routed vectors still run",
        ],
        runVector(vector)
      );
    } else {
      it(`${name} (walk-routed)`, runVector(vector));
    }
  }

  // FSPEC §2.8's two named regression rows, asserted literally in addition to the quantified loop
  // above (PROPERTIES §5.2, PROP-BSL-03's "two named rows" conjunct).
  it("named regression: repoRootUnresolved + manifestEmpty => manifest-empty (falsifies a short-circuiting ladder)", () => {
    const vector = Object.freeze({
      E1: "holds",
      E3: "ok",
      E4: "does-not-hold",
      E2: "does-not-hold",
      E5: "does-not-hold",
      E6: "holds",
    });
    const built = buildVectorFixture(vector);
    try {
      const run = runScript("check", {
        consumerRoot: built.consumer.root,
        home: built.consumer.home,
        pluginRoot: built.pluginRootForRun,
      });
      // E1 = "holds" (repo-root-unresolved) — no drift state is ever written (PROP-BSL-06); the
      // reported reason is read from the W-1 line, same as the quantified loop above.
      expect(readDriftState(built.consumer.root)).toBeNull();
      const w1 = allOf(run.stderr, "W-1");
      expect(w1.length).toBeGreaterThanOrEqual(1);
      expect(w1[0].groups.reason).toBe("manifest-empty");
      exercisedBaselineReasons.add("manifest-empty");
    } finally {
      built.cleanup();
    }
  });

  it("named regression (corrected determinacy, SE F-02): repoRootUnresolved + manifestAbsent (E5/E6 indeterminate) => manifest-absent", () => {
    const vector = Object.freeze({
      E1: "holds",
      E3: "ok",
      E4: "holds",
      E2: "does-not-hold",
      E5: "indeterminate",
      E6: "indeterminate",
    });
    const built = buildVectorFixture(vector);
    try {
      const run = runScript("check", {
        consumerRoot: built.consumer.root,
        home: built.consumer.home,
        pluginRoot: built.pluginRootForRun,
      });
      expect(readDriftState(built.consumer.root)).toBeNull();
      const w1 = allOf(run.stderr, "W-1");
      expect(w1.length).toBeGreaterThanOrEqual(1);
      expect(w1[0].groups.reason).toBe("manifest-absent");
      exercisedBaselineReasons.add("manifest-absent");
    } finally {
      built.cleanup();
    }
  });
});

// ───────────────────────── T-42: PROP-BSL-08 (checkEnabled resolved on every path) ─────────────────────────

describe("PROP-BSL-08 — checkEnabled is resolved on every path, including unresolved ones", () => {
  // Five non-default config states (the sixth, file-absent, is the default already covered by
  // the 20-vector enumeration above) × two vectors (resolved; the first-release manifest-absent
  // vector) — FSPEC §2.7's table. `explicit-false` is the only state producing `false`; the other
  // four fall closed to `true`, with N-5 printed exactly once for all four (key-absent,
  // unreadable, malformed, non-boolean all degrade through the same status-12 fold, per
  // `pdlc_resolve_check_enabled`'s own header comment).
  const CONFIG_VARIANTS = Object.freeze([
    {
      name: "explicit-false",
      config: { distribution: { checkEnabled: false } },
      expectedCheckEnabled: false,
      expectN5: false,
    },
    // A well-formed document that simply lacks the key is indistinguishable, at the JSON-path
    // level, from a malformed one (`pdlc_json_read`'s dot-path walk returns the same status 12
    // for "path segment missing" as it does for "document did not parse") — `pdlc-drift.sh`'s
    // own header comment on `pdlc_resolve_check_enabled` documents this fold-together
    // explicitly, so key-absent gets the N-5 notice too, same as malformed/unreadable/non-boolean.
    {
      name: "key-absent",
      config: { distribution: {} },
      expectedCheckEnabled: true,
      expectN5: true,
    },
    {
      name: "unreadable",
      config: "unreadable",
      expectedCheckEnabled: true,
      expectN5: true,
    },
    {
      name: "malformed",
      config: "malformed",
      expectedCheckEnabled: true,
      expectN5: true,
    },
    {
      name: "non-boolean",
      config: { distribution: { checkEnabled: "yes" } },
      expectedCheckEnabled: true,
      expectN5: true,
    },
  ]);

  // Walk-routed (git:false, claudeDir:true) resolved-root recipe — deliberately avoids the
  // git-worktree-list codepath so this property's ten spawns need no `itOrSkip("git", …)` gate
  // (PROPERTIES §5.2 does not name PROP-BSL-08 among the git-gated properties).
  function buildBsl08Fixture(variant, manifestAbsent) {
    const consumer = makeConsumerTree({ git: false, claudeDir: true, config: variant.config });
    const plugin = makePluginTree();
    if (manifestAbsent) {
      unlinkSync(join(plugin.pluginRoot, "workflows", "dist", "distribution-manifest.json"));
    }
    return { consumer, plugin };
  }

  for (const variant of CONFIG_VARIANTS) {
    for (const manifestAbsent of [false, true]) {
      const label = manifestAbsent ? "manifest-absent vector" : "resolved vector";
      it(`${variant.name} config on the ${label}`, () => {
        const { consumer, plugin } = buildBsl08Fixture(variant, manifestAbsent);
        try {
          const run = runScript("check", {
            consumerRoot: consumer.root,
            home: consumer.home,
            pluginRoot: plugin.pluginRoot,
          });
          const state = readDriftState(consumer.root);
          expect(state).not.toBeNull();
          expect(state.checkEnabled).toBe(variant.expectedCheckEnabled);
          expect(countOf(run.stderr, "N-5")).toBe(variant.expectN5 ? 1 : 0);

          if (manifestAbsent) {
            expect(state.baselineReason).toBe("manifest-absent");
            exercisedBaselineReasons.add("manifest-absent");
          } else {
            expect(state.baselineStatus).toBe("resolved");
          }
          assertReasonsDisjoint(state);
        } finally {
          consumer.cleanup();
          plugin.cleanup();
        }
      });
    }
  }
});

// ───────────────────────── T-42: PROP-DET-06 (process independence) ─────────────────────────

describe("PROP-DET-06 — process independence: --check then hook over the same unchanged tree", () => {
  it("identical rows and baselineReason across --check and hook, differing only in generatedBy/generatedAtUtc", () => {
    const consumer = makeConsumerTree({ git: true, claudeDir: true });
    const plugin = makePluginTree();
    try {
      runScript("check", {
        consumerRoot: consumer.root,
        home: consumer.home,
        pluginRoot: plugin.pluginRoot,
      });
      const afterCheck = readDriftState(consumer.root);
      expect(afterCheck).not.toBeNull();

      runScript("hook", {
        consumerRoot: consumer.root,
        home: consumer.home,
        pluginRoot: plugin.pluginRoot,
      });
      const afterHook = readDriftState(consumer.root);
      expect(afterHook).not.toBeNull();

      expect(afterHook.rows).toEqual(afterCheck.rows);
      expect(afterHook.baselineReason).toBe(afterCheck.baselineReason);
      expect(afterHook.baselineStatus).toBe(afterCheck.baselineStatus);
      expect(afterCheck.generatedBy).toBe("check");
      expect(afterHook.generatedBy).toBe("hook");

      assertReasonsDisjoint(afterCheck);
      assertReasonsDisjoint(afterHook);
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });
});

// ───────────────────────── T-42: PROP-MTM-02 (--check half) ─────────────────────────

describe("PROP-MTM-02 (--check half) — the classify pass is as-found only, never a second pass", () => {
  it("--check over a generated tree yields exactly one classify pass, labelled as-found (O-20(b))", () => {
    const consumer = makeConsumerTree({ git: true, claudeDir: true });
    const plugin = makePluginTree();
    try {
      const run = runScript("check", {
        consumerRoot: consumer.root,
        home: consumer.home,
        pluginRoot: plugin.pluginRoot,
      });
      const state = readDriftState(consumer.root);
      expect(state).not.toBeNull();

      const trace = parseTrace(run.tracePath);
      assertPhaseOrder(trace);

      const classifyPhases = new Set(trace.filter((r) => r.op === "classify").map((r) => r.phase));
      expect(classifyPhases).toEqual(new Set(["as-found"]));

      // The single-pass conjunct, stated so it cannot be mistaken for evidence about clause (a)
      // (PROPERTIES §7's own warning): "recorded == as-found" AND "recorded == post-run"
      // vacuously-equal, because there are zero post-run classify records to contradict it.
      assertRecordedPassIs(trace, state, "as-found");
      assertRecordedPassIs(trace, state, "post-run");

      assertReasonsDisjoint(state);
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });
});

// ───────────────────────── T-42: PROP-NEG-07 (M10 half) ─────────────────────────

describe("PROP-NEG-07 (M10 half) — a manifest row naming a path outside .claude/workflows/ is rejected, never followed", () => {
  // FSPEC §1.1 M10's three independently-falsifiable clauses (`pdlc-drift.sh`'s
  // `_pdlc_manifest_read` python validator): (1) missing the literal `.claude/workflows/` prefix,
  // (2) an empty or nested (`/`-containing) remainder, (3) a remainder starting with `.pdlc-`.
  const M10_MUTATIONS = Object.freeze([
    {
      name: "missing the .claude/workflows/ prefix",
      mutate: (m) => {
        m.rows[0].consumerPath = "workflows/dist/row-1.bundle.js";
        return m;
      },
      namedPathRel: ["workflows", "dist", "row-1.bundle.js"],
    },
    {
      name: "nested one level under .claude/workflows/",
      mutate: (m) => {
        m.rows[0].consumerPath = ".claude/workflows/sub/row-1.bundle.js";
        return m;
      },
      namedPathRel: [".claude", "workflows", "sub", "row-1.bundle.js"],
    },
    {
      name: "a .pdlc--prefixed basename",
      mutate: (m) => {
        m.rows[0].consumerPath = ".claude/workflows/.pdlc-row-1.bundle.js";
        return m;
      },
      namedPathRel: [".claude", "workflows", ".pdlc-row-1.bundle.js"],
    },
  ]);

  for (const mutation of M10_MUTATIONS) {
    it(`--check rejects a manifest ${mutation.name} (M10): unresolved/manifest-malformed, rows [], named path never created`, () => {
      const consumer = makeConsumerTree({ git: true, claudeDir: true });
      const plugin = makePluginTree({ manifestOverride: mutation.mutate });
      const namedPath = join(consumer.root, ...mutation.namedPathRel);
      try {
        runScript("check", {
          consumerRoot: consumer.root,
          home: consumer.home,
          pluginRoot: plugin.pluginRoot,
        });

        const state = readDriftState(consumer.root);
        expect(state).not.toBeNull();
        expect(state.baselineStatus).toBe("unresolved");
        expect(state.baselineReason).toBe("manifest-malformed");
        expect(state.rows).toEqual([]);
        assertReasonsDisjoint(state);
        exercisedBaselineReasons.add("manifest-malformed");

        // The blast-radius bound (FSPEC §1.1 M10): the manifest-declared path outside
        // `.claude/workflows/` (or nested/`.pdlc-`-prefixed within it) is never created — the
        // rejected manifest never reaches a copy step. This does not assert whole-tree
        // invariance (the drift-state file itself is legitimately written on this path, since
        // the repo root and plugin root both resolve fine — only the manifest fails M10).
        expect(existsSync(namedPath)).toBe(false);
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    });
  }
});
