/**
 * driftHook.test.js — the SessionStart hook suite (TSPEC §14 / §14.1, PLAN T-24, batch 5).
 *
 * Ownership (PLAN, single-writer-per-file across batches): T-24 owns exactly this file. It
 * covers, entirely via the bash harness (`runScript`, no in-process pure-function testing —
 * that lives in `queueDriftGate.test.js`/`driftRecordShape.test.js`):
 *
 *   - AT-5(a)  — opt-out: the hook still warns despite `checkEnabled:false` (FSPEC §6.4).
 *   - AT-5(b)  — opt-out: `--check` still exits non-zero despite `checkEnabled:false`.
 *   - AT-11    — the hook half: W-6 (retired-present) is emitted independently of every
 *                managed row being `in-sync` (FSPEC §5.3). The queue half (row: 7) is T-38's.
 *   - AT-32(b) — a non-boolean `distribution.checkEnabled` (string `"false"`) resolves to
 *                `true` (fail-closed, FSPEC §2.7) and N-5 is emitted exactly once.
 *   - §14.1 S-1 — AC-2.2: a fully green tree produces a silent hook (`expectHookSilent`'s
 *     one strict `stderr === ""` site in this suite).
 *   - §14.1 S-2 — AC-2.2's negative direction: `expectHookSilent` throws over a `staleRow`
 *     tree, not just passes over green ones.
 *   - §14.1 B-3 — AC-0.3b: the `checkEnabled` escape is reachable under `manifest-absent`
 *     (config, then hook): `readDriftState().checkEnabled === false`,
 *     `baselineReason === "manifest-absent"`, and `mapDriftState(validateDriftRecord(...))`
 *     yields `{ outcome: "proceed", row: 2 }`.
 *   - §14.1 V-2 — AC-3.9: an all-`in-sync` tree with a retired path present exits **1**
 *     under `--check` (this is the "check" entrypoint, not the hook — TSPEC §14 places it
 *     in this file regardless).
 *   - AC-2.4  — "the hook exits 0 always": a dedicated case forcing an internal drift-state
 *     write failure and asserting the hook still exits 0 (the trap + unconditional exit 0).
 *
 * Named §13.1 fixture recipes (`syncedConsumer`, `staleRow`, `optOutConsumer`,
 * `retiredPresent`, `nonBooleanConfig`, `preManifestOptOut`) are NOT exported helper
 * functions — per TSPEC §13.1 they are composed locally, here, from
 * `makeConsumerTree`/`makePluginTree`/`setRowState` (`driftFixtures.js`, T-15).
 *
 * RED-terminal (batch 5, PLAN T-24): neither `pdlc/hooks/scripts/check-workflow-drift.sh`
 * (C2, T-36, batch 11) nor `pdlc/hooks/scripts/sync-workflows.sh` (T-19/T-35, later batches)
 * exists yet in this working tree. `driftHarness.runScript` always invokes `bash <script>`
 * unconditionally (TSPEC §3.1) — with the target script absent, bash itself fails every
 * invocation (non-zero status, a "No such file or directory" line on stderr that matches
 * none of the `MESSAGES` patterns), so every assertion below that expects the subject's real
 * behavior fails for that reason. That is the expected state for this file at the end of
 * batch 5.
 */

import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import {
  runScript,
  readDriftState,
  countOf,
  expectHookSilent,
  expectFailOpen,
} from "./helpers/driftHarness.js";
import { makeConsumerTree, makePluginTree, setRowState } from "./helpers/driftFixtures.js";
import { itOrSkip } from "./helpers/driftCapabilities.js";
import { validateDriftRecord, mapDriftState } from "../orchestrate-queue.js";

// ─── Locally-composed §13.1 fixture recipes ──────────────────────────────────

/** `freshConsumer`: a valid two-row plugin tree paired with a bare consumer tree. */
function buildFreshConsumer(consumerSpecExtra = {}) {
  const plugin = makePluginTree();
  const consumer = makeConsumerTree({
    git: true,
    claudeDir: false,
    workflowsDir: true,
    ...consumerSpecExtra,
  });
  return { consumer, plugin };
}

/** `syncedConsumer`: `freshConsumer` + every row `in-sync`. */
function buildSyncedConsumer(consumerSpecExtra = {}) {
  const trees = buildFreshConsumer(consumerSpecExtra);
  setRowState(trees, "row-1", "in-sync");
  setRowState(trees, "row-2", "in-sync");
  return trees;
}

/** `staleRow`: one row `stale`, the other left `in-sync`. */
function buildStaleRow(consumerSpecExtra = {}) {
  const trees = buildFreshConsumer(consumerSpecExtra);
  setRowState(trees, "row-1", "stale");
  setRowState(trees, "row-2", "in-sync");
  return trees;
}

/** `optOutConsumer`: `staleRow` + `config: { distribution: { checkEnabled: false } }`. */
function buildOptOutConsumer() {
  return buildStaleRow({ config: { distribution: { checkEnabled: false } } });
}

/**
 * `retiredPresent`: `syncedConsumer` + a retired artifact present on disk, matching a row's
 * `retires` list — W-6 must be independent of every managed row being `in-sync`.
 */
function buildRetiredPresent() {
  const retiredPath = ".claude/workflows/orchestrate-dev.js";
  const plugin = makePluginTree({
    rows: [
      { id: "row-1", retires: [retiredPath] },
      { id: "row-2", retires: [] },
    ],
  });
  const consumer = makeConsumerTree({
    git: true,
    workflowsDir: true,
    files: { [retiredPath]: "legacy-orchestrate-dev-bytes" },
  });
  const trees = { consumer, plugin };
  setRowState(trees, "row-1", "in-sync");
  setRowState(trees, "row-2", "in-sync");
  return trees;
}

/** `nonBooleanConfig`: `config: { distribution: { checkEnabled: "false" } }` (string, not bool). */
function buildNonBooleanConfig() {
  return buildSyncedConsumer({ config: { distribution: { checkEnabled: "false" } } });
}

/**
 * `preManifestOptOut`: a consumer with `checkEnabled: false` and no pre-existing drift state,
 * paired against a plugin root that has no `workflows/dist/distribution-manifest.json` at all
 * (manifest-absent) — the caller is responsible for removing the returned `pluginRoot`.
 */
function buildPreManifestOptOut() {
  const consumer = makeConsumerTree({
    git: true,
    claudeDir: true,
    config: { distribution: { checkEnabled: false } },
  });
  const pluginRoot = mkdtempSync(join(tmpdir(), "pdlc-empty-plugin-"));
  return { consumer, pluginRoot };
}

// ─── AT-5 — opt-out stays reachable while the hook/`--check` still surface drift ─────────

describe("AT-5 — opt-out (checkEnabled:false) does not silence the hook or --check", () => {
  itOrSkip(
    "AT-5(a) — the hook still warns despite checkEnabled:false",
    "hash",
    ["FSPEC §6.4 — checkEnabled gates the queue only; the hook still warns and records state"],
    () => {
      const { consumer, plugin } = buildOptOutConsumer();
      try {
        const run = runScript("hook", {
          consumerRoot: consumer.root,
          home: consumer.home,
          pluginRoot: plugin.pluginRoot,
        });
        run.root = consumer.root;
        expect(run.status).toBe(0);
        expect(countOf(run.stderr, "W-5")).toBeGreaterThanOrEqual(1);
        const state = readDriftState(consumer.root);
        expect(state.checkEnabled).toBe(false);
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    }
  );

  itOrSkip(
    "AT-5(b) — --check still exits non-zero (1) despite checkEnabled:false",
    "hash",
    ["FSPEC §6.4 — checkEnabled gates the queue only; --check still exits non-zero"],
    () => {
      const { consumer, plugin } = buildOptOutConsumer();
      try {
        const run = runScript("check", {
          consumerRoot: consumer.root,
          home: consumer.home,
          pluginRoot: plugin.pluginRoot,
        });
        expect(run.status).toBe(1);
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    }
  );
});

// ─── AT-11 (hook half) — retired-present warns independently of row states ────────────────

describe("AT-11 — retired-present warns though all managed rows are in-sync", () => {
  itOrSkip(
    "AT-11 — W-6 is emitted for a retired path present on disk, independently of every row being in-sync (hook)",
    "hash",
    ["FSPEC §5.3 — W-6 is emitted independently of managed-row states"],
    () => {
      const { consumer, plugin } = buildRetiredPresent();
      try {
        const run = runScript("hook", {
          consumerRoot: consumer.root,
          home: consumer.home,
          pluginRoot: plugin.pluginRoot,
        });
        run.root = consumer.root;
        expect(run.status).toBe(0);
        expect(countOf(run.stderr, "W-6")).toBe(1);
        const state = readDriftState(consumer.root);
        expect(state.rows.every((row) => row.state === "in-sync")).toBe(true);
        expect(state.retiredPresent.length).toBeGreaterThanOrEqual(1);
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    }
  );
});

// ─── AT-32(b) — a non-boolean checkEnabled fails closed to true, N-5 once ─────────────────

describe("AT-32(b) — a non-boolean distribution.checkEnabled fails closed", () => {
  it('AT-32(b) — the string "false" resolves to checkEnabled:true, N-5 emitted exactly once', () => {
    const { consumer, plugin } = buildNonBooleanConfig();
    try {
      const run = runScript("hook", {
        consumerRoot: consumer.root,
        home: consumer.home,
        pluginRoot: plugin.pluginRoot,
      });
      run.root = consumer.root;
      expect(countOf(run.stderr, "N-5")).toBe(1);
      const state = readDriftState(consumer.root);
      expect(state.checkEnabled).toBe(true);
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });
});

// ─── §14.1 S-1 / S-2 — the hook-silence oracle, both directions ──────────────────────────

describe("§14.1 S-1/S-2 — AC-2.2's hook-silence oracle (expectHookSilent)", () => {
  itOrSkip(
    "S-1 — a fully green tree produces a silent hook",
    "hash",
    [
      "AC-2.2 — silence means verified, never skipped (the suite's one strict stderr === \"\" site)",
    ],
    () => {
      const { consumer, plugin } = buildSyncedConsumer();
      try {
        const run = runScript("hook", {
          consumerRoot: consumer.root,
          home: consumer.home,
          pluginRoot: plugin.pluginRoot,
        });
        run.root = consumer.root;
        expectHookSilent(run);
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    }
  );

  itOrSkip(
    "S-2 — the silence oracle rejects a non-green tree (negative direction, over staleRow)",
    "hash",
    [
      "AC-2.2's negative direction — expectHookSilent must throw over a staleRow tree, not merely pass over green ones",
    ],
    () => {
      const { consumer, plugin } = buildStaleRow();
      try {
        const run = runScript("hook", {
          consumerRoot: consumer.root,
          home: consumer.home,
          pluginRoot: plugin.pluginRoot,
        });
        run.root = consumer.root;
        expect(() => expectHookSilent(run)).toThrow();
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    }
  );
});

// ─── §14.1 B-3 — the checkEnabled escape under manifest-absent (config, then hook) ────────

describe("§14.1 B-3 — AC-0.3b: checkEnabled escape reachable under manifest-absent", () => {
  it("B-3 — config then hook: checkEnabled:false + baselineReason manifest-absent maps to the row-2 opt-out", () => {
    const { consumer, pluginRoot } = buildPreManifestOptOut();
    try {
      const run = runScript("hook", {
        consumerRoot: consumer.root,
        home: consumer.home,
        pluginRoot,
      });
      run.root = consumer.root;
      expect(run.status).toBe(0);
      const state = readDriftState(consumer.root);
      expect(state.checkEnabled).toBe(false);
      expect(state.baselineReason).toBe("manifest-absent");
      const gate = mapDriftState(validateDriftRecord(state));
      expect(gate).toMatchObject({ outcome: "proceed", row: 2 });
    } finally {
      consumer.cleanup();
      rmSync(pluginRoot, { recursive: true, force: true });
    }
  });
});

// ─── §14.1 V-2 — AC-3.9: retired-present exits 1 under --check even when all rows in-sync ─

describe("§14.1 V-2 — AC-3.9: retired-present blocks --check independently of row states", () => {
  itOrSkip(
    "V-2 — an all-in-sync tree with a retired path present exits 1 under --check",
    "hash",
    [
      "AC-3.9 — retired-present blocks --check independently of every managed row being in-sync",
    ],
    () => {
      const { consumer, plugin } = buildRetiredPresent();
      try {
        const run = runScript("check", {
          consumerRoot: consumer.root,
          home: consumer.home,
          pluginRoot: plugin.pluginRoot,
        });
        expect(run.status).toBe(1);
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    }
  );
});

// ─── AC-2.4 — the hook exits 0 always, even on an internal write failure ──────────────────

describe("AC-2.4 — the hook exits 0 always", () => {
  itOrSkip(
    "AC-2.4 — the hook exits 0 even when an internal drift-state write fails",
    "hash",
    [
      "AC-2.4 is absolute — the hook's trap + unconditional exit 0 covers an internal write failure, not just a clean run",
    ],
    () => {
      const { consumer, plugin } = buildSyncedConsumer();
      try {
        const run = runScript("hook", {
          consumerRoot: consumer.root,
          home: consumer.home,
          pluginRoot: plugin.pluginRoot,
          fault: ["drift-state-replace"],
        });
        run.root = consumer.root;
        expect(run.status).toBe(0);
        expectFailOpen(run, { operation: "drift-state-replace", entrypoint: "hook" });
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    }
  );
});
