/**
 * queueDriftGate.test.js — the queue-side drift gate (T-04, "pure" half).
 *
 * Covers, entirely in-process against orchestrate-queue.js's exported pure
 * functions (TSPEC §12 — no filesystem, no bash, no bundle):
 *
 *   - TSPEC §12.2  — mapDriftState's ten precedence rows, each fixture
 *                    defeating every row above it, asserting { outcome, row }.
 *   - TSPEC §12.2  — the structural report Manifest/Row/Run split, for the
 *                    three rows (3, 4, 7) that name a reason in the report.
 *   - TSPEC §12.3  — the O-19(d) wrapper (`readDriftStateSafely`): a
 *                    throwing / null / non-string `_readFile` all land on
 *                    row 1 `blocked`, via a *returned report*, never an abort.
 *   - TSPEC §12.4  — gate placement: the gate performs exactly one injected
 *                    read, before the queue's own QUEUE.md read.
 *   - AT-36        — an absent `syncCommand` still reaches the row-2 opt-out.
 *
 * Fixture-backed rows (T-38, appended below, after the literal-record cases above):
 *   - AT-4          — queue blocks on AT-3's pre-manifest-consumer record, naming
 *                     `manifest-absent` at Manifest level (literal, per TSPEC §14's
 *                     "AT-3's record, read as a literal").
 *   - AT-5(c)       — opt-out (`optOutConsumer`): the queue proceeds at row 2 over a
 *                     hook-written record (fixture-backed, real filesystem).
 *   - AT-7's queue half   — `unverifiedRow`: the queue proceeds (row 8) over a
 *                     hook-written record — the asymmetry's other half, since
 *                     `--check` exits 2 over the same tree (driftClassify.test.js).
 *   - AT-11's queue half  — `retiredPresent`: the queue blocks (row 7) over a
 *                     hook-written record even though every managed row is `in-sync`.
 *   - AT-31         — two `it()`s: (a) write-failure ⇒ row 3, naming
 *                     `drift-state-invalidated` and the `syncCommand: null` fallback;
 *                     (b) retired-present ⇒ row 7, naming the retired path.
 *   - §14.1 B-5     — `readDriftStateSafely(root)` returns `null` from the real
 *                     filesystem over a `preManifestOptOut` tree with no writer run
 *                     (TE L-05) — backs the NFR-1 citation.
 *
 * RED-terminal (batch 2, PLAN T-04): `mapDriftState`, `readDriftStateSafely`
 * and `validateDriftRecord` are not yet exported by orchestrate-queue.js
 * (T-11/T-12/T-13, batches 4-6). Under this project's native-ESM jest runtime
 * (package.json: "type": "module", --experimental-vm-modules, no babel
 * transform), importing a named binding a module does not yet provide fails
 * the whole file to load with a SyntaxError naming the missing export — the
 * "named module/export ... does not exist" reason §5's batch gate calls out
 * for RED-terminal batches. That is the expected state for this file at the
 * end of batch 2.
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";

import main, {
  validateDriftRecord,
  mapDriftState,
  readDriftStateSafely,
} from "../orchestrate-queue.js";
import { runScript, readDriftState } from "./helpers/driftHarness.js";
import { makeConsumerTree, makePluginTree, setRowState } from "./helpers/driftFixtures.js";
import { itOrSkip } from "./helpers/driftCapabilities.js";

// ─── Shared fixture base (§12.2's "built from VALID_RECORD") ─────────────────
//
// A shape-valid, frozen literal satisfying every D1-D8 clause (FSPEC §6.2).
// Each row below deep-clones it and overrides exactly the fields TSPEC §12.2
// names for that row - never a shared mutable object across cases.
const VALID_RECORD = Object.freeze({
  schemaVersion: 1,
  baselineStatus: "resolved",
  baselineReason: null,
  checkEnabled: true,
  rows: [{ id: "orchestrate-dev", state: "in-sync", reason: null }],
  retiredPresent: [],
  writeFailures: [],
  generatedBy: "hook",
  pluginVersion: "0.10.0",
  syncCommand: "node pdlc/workflows/sync-runtime.mjs",
  generatedAtUtc: "2026-07-28T00:00:00Z",
});

function buildRecord(overrides) {
  return { ...structuredClone(VALID_RECORD), ...overrides };
}

const DRIFT_STATE_PATH = ".claude/workflows/.pdlc-drift-state.json";

// ─── §12.2 — mapDriftState's ten precedence rows ─────────────────────────────
describe("mapDriftState — §12.2's ten precedence rows", () => {
  it("row 1 — validateDriftRecord returned { ok: false } ⇒ blocked", () => {
    const gate = mapDriftState({ ok: false, clause: "D1" });
    expect(gate).toMatchObject({ outcome: "blocked", row: 1 });
  });

  it(
    "row 2 — checkEnabled:false proceeds even carrying row 3's and row 6's " +
      "conditions (writeFailures non-empty, a stale row)",
    () => {
      const record = buildRecord({
        checkEnabled: false,
        writeFailures: [{ path: "docs/foo.md", operation: "artifact-copy" }],
        rows: [{ id: "a", state: "stale", reason: null }],
      });
      const gate = mapDriftState(validateDriftRecord(record));
      expect(gate).toMatchObject({ outcome: "proceed", row: 2 });
    }
  );

  it("row 3 — a non-empty writeFailures blocks even with checkEnabled:true (AT-31(a) precedent)", () => {
    const record = buildRecord({
      checkEnabled: true,
      baselineReason: "drift-state-invalidated",
      writeFailures: [
        { path: "pdlc/workflows/orchestrate-queue.js", operation: "artifact-copy" },
      ],
    });
    const gate = mapDriftState(validateDriftRecord(record));
    expect(gate).toMatchObject({ outcome: "blocked", row: 3 });
  });

  it("row 4 — baselineStatus:unresolved blocks once writeFailures is empty (defeats row 3)", () => {
    const record = buildRecord({
      checkEnabled: true,
      baselineStatus: "unresolved",
      baselineReason: "manifest-empty",
      writeFailures: [],
      rows: [],
    });
    const gate = mapDriftState(validateDriftRecord(record));
    expect(gate).toMatchObject({ outcome: "blocked", row: 4 });
  });

  it("row 5 — any row unknown blocks, ordered above a co-occurring stale row (defeats row 6)", () => {
    const record = buildRecord({
      checkEnabled: true,
      rows: [
        { id: "a", state: "unknown", reason: "hash-tool-absent" },
        { id: "b", state: "stale", reason: null },
      ],
    });
    const gate = mapDriftState(validateDriftRecord(record));
    expect(gate).toMatchObject({ outcome: "blocked", row: 5 });
  });

  it("row 6 — any row missing/stale blocks, ordered above a co-occurring retired path (defeats row 7)", () => {
    const record = buildRecord({
      checkEnabled: true,
      rows: [{ id: "a", state: "stale", reason: null }],
      retiredPresent: [
        {
          path: "docs/design/OLD-PLAN.md",
          supersededBy: "docs/design/MASTER-PLAN.md",
          supersedingState: "in-sync",
        },
      ],
    });
    const gate = mapDriftState(validateDriftRecord(record));
    expect(gate).toMatchObject({ outcome: "blocked", row: 6 });
  });

  it("row 7 — retiredPresent non-empty blocks even with every row in-sync (AT-31(b) precedent)", () => {
    const record = buildRecord({
      checkEnabled: true,
      rows: [{ id: "a", state: "in-sync", reason: null }],
      retiredPresent: [
        {
          path: "docs/design/OLD-PLAN.md",
          supersededBy: "docs/design/MASTER-PLAN.md",
          supersedingState: "in-sync",
        },
      ],
    });
    const gate = mapDriftState(validateDriftRecord(record));
    expect(gate).toMatchObject({ outcome: "blocked", row: 7 });
  });

  it("row 8 — local-edit / unverified rows proceed, named in the run report", () => {
    const record = buildRecord({
      checkEnabled: true,
      rows: [
        { id: "a", state: "unverified", reason: null },
        { id: "b", state: "local-edit", reason: null },
      ],
      retiredPresent: [],
    });
    const gate = mapDriftState(validateDriftRecord(record));
    expect(gate).toMatchObject({ outcome: "proceed", row: 8 });
  });

  it("row 9 — resolved, non-empty rows, all in-sync, both arrays empty ⇒ proceed silently", () => {
    const record = buildRecord({
      checkEnabled: true,
      rows: [{ id: "a", state: "in-sync", reason: null }],
      retiredPresent: [],
      writeFailures: [],
    });
    const gate = mapDriftState(validateDriftRecord(record));
    expect(gate).toMatchObject({ outcome: "proceed", row: 9 });
  });

  it("row 10 — resolved with rows: [] matches no row 1-9 ⇒ blocked at the terminal row", () => {
    const record = buildRecord({
      checkEnabled: true,
      rows: [],
      retiredPresent: [],
      writeFailures: [],
    });
    const gate = mapDriftState(validateDriftRecord(record));
    expect(gate).toMatchObject({ outcome: "blocked", row: 10 });
  });
});

// ─── §12.2 — structural report Manifest/Row/Run split (rows 3, 4, 7) ─────────
describe("mapDriftState — structural report split (§12.2, rows 3/4/7)", () => {
  it("report is always the three-array Manifest/Row/Run shape", () => {
    const gate = mapDriftState({ ok: false, clause: "D1" });
    expect(Array.isArray(gate.report.manifest)).toBe(true);
    expect(Array.isArray(gate.report.row)).toBe(true);
    expect(Array.isArray(gate.report.run)).toBe(true);
  });

  it("row 3 — writeFailures name Run-level, the carried baselineReason names Manifest-level", () => {
    const record = buildRecord({
      checkEnabled: true,
      baselineReason: "drift-state-invalidated",
      writeFailures: [
        { path: "pdlc/workflows/orchestrate-queue.js", operation: "artifact-copy" },
      ],
    });
    const gate = mapDriftState(validateDriftRecord(record));

    expect(gate.row).toBe(3);
    expect(
      gate.report.run.some(
        (line) =>
          String(line).includes("pdlc/workflows/orchestrate-queue.js") &&
          String(line).includes("artifact-copy")
      )
    ).toBe(true);
    expect(
      gate.report.manifest.some((line) => String(line).includes("drift-state-invalidated"))
    ).toBe(true);
    expect(gate.report.row).toEqual([]);
  });

  it("row 4 — an unresolved baselineReason names Manifest-level only", () => {
    const record = buildRecord({
      checkEnabled: true,
      baselineStatus: "unresolved",
      baselineReason: "manifest-empty",
      writeFailures: [],
      rows: [],
    });
    const gate = mapDriftState(validateDriftRecord(record));

    expect(gate.row).toBe(4);
    expect(
      gate.report.manifest.some((line) => String(line).includes("manifest-empty"))
    ).toBe(true);
    expect(gate.report.row).toEqual([]);
    expect(gate.report.run).toEqual([]);
  });

  it("row 7 — a retired path names Row-level, never Manifest-level (a flat list would hide it there)", () => {
    const record = buildRecord({
      checkEnabled: true,
      rows: [{ id: "a", state: "in-sync", reason: null }],
      retiredPresent: [
        {
          path: "docs/design/OLD-PLAN.md",
          supersededBy: "docs/design/MASTER-PLAN.md",
          supersedingState: "in-sync",
        },
      ],
    });
    const gate = mapDriftState(validateDriftRecord(record));

    expect(gate.row).toBe(7);
    expect(
      gate.report.row.some((line) => String(line).includes("docs/design/OLD-PLAN.md"))
    ).toBe(true);
    expect(gate.report.manifest).toEqual([]);
    expect(gate.report.run).toEqual([]);
  });
});

// ─── §12.3 — the O-19(d) wrapper: three-way _readFile injection ─────────────
describe("readDriftStateSafely — §12.3's three-way _readFile injection table", () => {
  const cases = [
    [
      "a throwing agent turn (the case that aborts today, FSPEC §6.1)",
      async () => {
        throw new Error("agent transport failed");
      },
    ],
    ["file absent, or a non-string relay ⇒ null", async () => null],
    ["a non-string value reaching the module ⇒ 42", async () => 42],
  ];

  it.each(cases)(
    "%s — never propagates, always resolves and maps to row 1 blocked",
    async (_label, injectedReadFile) => {
      let raw;
      let threw = false;
      try {
        raw = await readDriftStateSafely(injectedReadFile, DRIFT_STATE_PATH);
      } catch {
        threw = true;
      }

      // The wrapper is required, not decorative: without it the throwing case
      // propagates out of the test rather than yielding a verdict (§12.3 note 1).
      expect(threw).toBe(false);

      const gate = mapDriftState(validateDriftRecord(raw));
      expect(gate).toMatchObject({ outcome: "blocked", row: 1 });
      // A returned report, never an abort.
      expect(gate.report).toBeDefined();
    }
  );
});

// ─── §12.4 — gate placement: exactly one read, before QUEUE.md ──────────────
describe("main() — §12.4 gate placement", () => {
  it("performs exactly one _readFile call, for the drift-state path, before any queue read", async () => {
    const calls = [];
    const recordingReadFile = async (path) => {
      calls.push(path);
      // A blocked (absent) drift state on every path asked about — the
      // assertion below is about *which* path is asked about, and how many.
      return null;
    };

    const report = await main({
      _readFile: recordingReadFile,
      _writeFile: async () => {},
      _agent: async () => "",
      _log: () => {},
      _phase: () => {},
    });

    expect(calls).toEqual([DRIFT_STATE_PATH]);
    expect(report.outcome).toBe("blocked");
  });
});

// ─── AT-36 — absent syncCommand still reaches the row-2 opt-out ─────────────
describe("AT-36 — an absent syncCommand still reaches the opt-out", () => {
  it("D8 tolerates a missing syncCommand, so checkEnabled:false still proceeds at row 2", () => {
    const record = buildRecord({ checkEnabled: false });
    delete record.syncCommand;

    const gate = mapDriftState(validateDriftRecord(record));
    expect(gate).toMatchObject({ outcome: "proceed", row: 2 });
  });
});

// ═════════════════════════════ T-38: fixture-backed queue cases ═════════════════════════════
//
// Everything below is appended by T-38 (batch 12), after the literal-record cases above. Six
// named cases (AT-31 as two `it()`s): AT-4, AT-5(c), AT-7's queue half, AT-11's queue half,
// AT-31(a)/(b), §14.1 B-5.

// ─── AT-4 — the queue blocks on AT-3's record (manifest-absent) at Manifest level ───────────
describe("AT-4 — the queue blocks on AT-3's pre-manifest-consumer record, naming manifest-absent at Manifest level", () => {
  it("AT-4: baselineReason manifest-absent (AT-3's record, read as a literal per TSPEC §14) blocks at row 4, naming manifest-absent at Manifest level", () => {
    const record = buildRecord({
      checkEnabled: true,
      baselineStatus: "unresolved",
      baselineReason: "manifest-absent",
      writeFailures: [],
      rows: [],
    });
    const gate = mapDriftState(validateDriftRecord(record));

    expect(gate).toMatchObject({ outcome: "blocked", row: 4 });
    expect(
      gate.report.manifest.some((line) => String(line).includes("manifest-absent"))
    ).toBe(true);
    expect(gate.report.row).toEqual([]);
    expect(gate.report.run).toEqual([]);
  });
});

// ─── AT-5(c) — opt-out: the queue proceeds at row 2 over a hook-written optOutConsumer record ─
describe("AT-5(c) — the queue proceeds at row 2 over a hook-written optOutConsumer record", () => {
  // `optOutConsumer` (§13.1): `staleRow` + `config: { distribution: { checkEnabled: false } } }`,
  // composed locally per TSPEC §13.1 (named fixture recipes are not exported helpers).
  function buildStaleRow(consumerSpecExtra = {}) {
    const plugin = makePluginTree();
    const consumer = makeConsumerTree({
      git: true,
      claudeDir: false,
      workflowsDir: true,
      ...consumerSpecExtra,
    });
    const trees = { consumer, plugin };
    setRowState(trees, "row-1", "stale");
    setRowState(trees, "row-2", "in-sync");
    return trees;
  }

  function buildOptOutConsumer() {
    return buildStaleRow({ config: { distribution: { checkEnabled: false } } });
  }

  itOrSkip(
    "AT-5(c) — a hook-written optOutConsumer record (a stale row present) maps to { outcome: proceed, row: 2 } through the queue's own mapping",
    "hash",
    [
      "AC-4.3 — checkEnabled:false is a queue-only opt-out; the queue proceeds even with a " +
        "stale row on disk (the hook still warns and --check still exits non-zero — AT-5(a)/(b), driftHook.test.js)",
    ],
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

        const state = readDriftState(consumer.root);
        expect(state).not.toBeNull();
        expect(state.checkEnabled).toBe(false);

        const gate = mapDriftState(validateDriftRecord(state));
        expect(gate).toMatchObject({ outcome: "proceed", row: 2 });
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    }
  );
});

// ─── AT-7's queue half — the queue proceeds (row 8) over a hook-written unverifiedRow record ──
describe("AT-7's queue half — the queue proceeds (row 8) over a hook-written unverifiedRow record", () => {
  // `unverifiedRow` (§13.1): consumer bytes differ from the plugin's, no sync-manifest entry
  // (row-1). Row-2 is additionally pinned to `in-sync` here — driftClassify.test.js's own
  // `buildUnverifiedRow()` leaves row-2 unaccounted for, which is fine for its isolated
  // `probeClassifyRow` call but would make a full `runScript("hook", ...)` run here classify
  // row-2 as `missing` and trip row 6 (block) instead of row 8 (proceed) — so this is a
  // locally-adapted variant, not a reuse of that file's helper (which this file may not import).
  function buildUnverifiedRowBothRowsAccountedFor() {
    const plugin = makePluginTree();
    const consumer = makeConsumerTree({
      git: true,
      claudeDir: true,
      workflowsDir: true,
      syncManifest: {},
    });
    const trees = { consumer, plugin };
    setRowState(trees, "row-1", "unverified");
    setRowState(trees, "row-2", "in-sync");
    return trees;
  }

  itOrSkip(
    "AT-7 (queue half) — unverifiedRow (row-1 unverified, row-2 in-sync) maps to " +
      "{ outcome: proceed, row: 8 } — the asymmetry's other half vs. --check's exit 2 (driftClassify.test.js)",
    "hash",
    [
      "AC-1.2/AC-1.7 read through the queue mapping — unverified rows proceed at row 8, never block",
    ],
    () => {
      const { consumer, plugin } = buildUnverifiedRowBothRowsAccountedFor();
      try {
        const run = runScript("hook", {
          consumerRoot: consumer.root,
          home: consumer.home,
          pluginRoot: plugin.pluginRoot,
        });
        run.root = consumer.root;
        expect(run.status).toBe(0);

        const state = readDriftState(consumer.root);
        expect(state).not.toBeNull();
        expect(state.rows.some((row) => row.state === "unverified")).toBe(true);

        const gate = mapDriftState(validateDriftRecord(state));
        expect(gate).toMatchObject({ outcome: "proceed", row: 8 });
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    }
  );
});

// ─── AT-11's queue half — the queue blocks (row 7) over a hook-written retiredPresent record ──
describe("AT-11's queue half — the queue blocks (row 7) over a hook-written retiredPresent record", () => {
  // `retiredPresent` (§13.1): `syncedConsumer` + a retired artifact present on disk, matching a
  // row's `retires` list. Manifest rule M10 requires the literal `.claude/workflows/` prefix on
  // `retires` entries, reproduced verbatim here.
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

  itOrSkip(
    "AT-11 (queue half) — retiredPresent, every managed row in-sync, maps to " +
      "{ outcome: blocked, row: 7 } naming the retired path",
    "hash",
    [
      "FSPEC §5.3/§6.2 row 7 — retired-present blocks the queue independently of every row being in-sync",
    ],
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

        const state = readDriftState(consumer.root);
        expect(state).not.toBeNull();
        expect(state.rows.every((row) => row.state === "in-sync")).toBe(true);
        expect(state.retiredPresent.length).toBeGreaterThanOrEqual(1);

        const gate = mapDriftState(validateDriftRecord(state));
        expect(gate).toMatchObject({ outcome: "blocked", row: 7 });
        expect(
          gate.report.row.some((line) =>
            String(line).includes(".claude/workflows/orchestrate-dev.js")
          )
        ).toBe(true);
        expect(gate.report.manifest).toEqual([]);
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    }
  );
});

// ─── AT-31 — two it()s, per TE F-09's split ──────────────────────────────────────────────────
describe("AT-31 — two records, both shape-valid and checkEnabled:true", () => {
  it(
    "AT-31(a) — a non-empty writeFailures blocks at row 3, naming each {path, operation} plus " +
      "drift-state-invalidated at Manifest level, and D8's absent-syncCommand fallback " +
      "normalises to null rather than inventing a path",
    () => {
      const record = buildRecord({
        checkEnabled: true,
        baselineReason: "drift-state-invalidated",
        writeFailures: [
          { path: ".claude/workflows/.pdlc-drift-state.json", operation: "drift-state-replace" },
          { path: ".claude/workflows/.pdlc-sync-manifest.json", operation: "artifact-copy" },
        ],
      });
      // The record carries no `syncCommand` at all — D8 (SE F-16) tolerates its absence and
      // `validateDriftRecord` normalises it to `null` rather than a fabricated path (the
      // "syncCommand: null fallback describes the shipped script rather than printing a fake
      // path" — this is the normalisation itself, since `drift-state-invalidated` has no W-1
      // rendering site to print a path at in the first place).
      delete record.syncCommand;

      const validated = validateDriftRecord(record);
      expect(validated.ok).toBe(true);
      expect(validated.record.syncCommand).toBeNull();

      const gate = mapDriftState(validated);
      expect(gate).toMatchObject({ outcome: "blocked", row: 3 });
      expect(
        gate.report.run.some(
          (line) =>
            String(line).includes(".claude/workflows/.pdlc-drift-state.json") &&
            String(line).includes("drift-state-replace")
        )
      ).toBe(true);
      expect(
        gate.report.run.some(
          (line) =>
            String(line).includes(".claude/workflows/.pdlc-sync-manifest.json") &&
            String(line).includes("artifact-copy")
        )
      ).toBe(true);
      expect(
        gate.report.manifest.some((line) => String(line).includes("drift-state-invalidated"))
      ).toBe(true);
      expect(gate.report.row).toEqual([]);
    }
  );

  it("AT-31(b) — retiredPresent non-empty blocks at row 7, naming the retired path, even though every row is in-sync", () => {
    const record = buildRecord({
      checkEnabled: true,
      rows: [
        { id: "row-1", state: "in-sync", reason: null },
        { id: "row-2", state: "in-sync", reason: null },
      ],
      retiredPresent: [
        {
          path: ".claude/workflows/orchestrate-dev.js",
          supersededBy: ".claude/workflows/orchestrate-dev-v2.js",
          supersedingState: "in-sync",
        },
      ],
      writeFailures: [],
    });

    const gate = mapDriftState(validateDriftRecord(record));
    expect(gate).toMatchObject({ outcome: "blocked", row: 7 });
    expect(
      gate.report.row.some((line) => String(line).includes(".claude/workflows/orchestrate-dev.js"))
    ).toBe(true);
    expect(gate.report.manifest).toEqual([]);
    expect(gate.report.run).toEqual([]);
  });
});

// ─── §14.1 B-5 — readDriftStateSafely(root) resolves null from a real filesystem tree ───────
describe("§14.1 B-5 — readDriftStateSafely resolves null from a real preManifestOptOut tree, with no writer run (TE L-05)", () => {
  it(
    "B-5: config alone (checkEnabled:false) does not create drift state — the real filesystem " +
      "read finds nothing, and mapDriftState(validateDriftRecord(null)) blocks at row 1 " +
      "(AC-0.3b's negative half — 'the config alone does not unblock the queue')",
    async () => {
      // `preManifestOptOut` (§13.1) with no writer run: the config file exists on disk, but no
      // hook/check/sync entrypoint has ever executed against this tree, so there is no
      // drift-state file to read — TE L-05's re-pointing away from a literal `null` stub is
      // exactly this: a real tree, a real (throwing) `readFileSync`, caught by the wrapper.
      const consumer = makeConsumerTree({
        git: true,
        claudeDir: true,
        config: { distribution: { checkEnabled: false } },
      });
      try {
        const configPath = join(consumer.root, ".claude", "pdlc.config.json");
        expect(existsSync(configPath)).toBe(true);

        const driftStatePath = join(consumer.root, ...DRIFT_STATE_PATH.split("/"));
        expect(existsSync(driftStatePath)).toBe(false);

        const realReadFile = async (relPath) => readFileSync(join(consumer.root, relPath), "utf8");

        const raw = await readDriftStateSafely(realReadFile, DRIFT_STATE_PATH);
        expect(raw).toBeNull();

        const gate = mapDriftState(validateDriftRecord(raw));
        expect(gate).toMatchObject({ outcome: "blocked", row: 1 });
      } finally {
        consumer.cleanup();
      }
    }
  );
});
