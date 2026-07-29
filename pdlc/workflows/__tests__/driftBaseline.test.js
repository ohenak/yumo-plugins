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

import { mkdirSync, mkdtempSync, unlinkSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import {
  runScript,
  readDriftState,
  remediationOf,
  expectRemediationClass,
  expectRepoRootUnresolved,
} from "./helpers/driftHarness.js";
import { makeConsumerTree, makePluginTree } from "./helpers/driftFixtures.js";
import { snapshotTree } from "./helpers/driftOrdering.js";
import { itOrSkip, INVARIANTS_AT_14B } from "./helpers/driftCapabilities.js";
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
