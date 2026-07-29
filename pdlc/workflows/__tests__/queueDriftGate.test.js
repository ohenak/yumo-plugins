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
 * Fixture-backed rows (AT-4, AT-5(c), AT-7's queue half, AT-11's queue half,
 * AT-31, §14.1 B-5) are NOT in this file — see T-38.
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

import main, {
  validateDriftRecord,
  mapDriftState,
  readDriftStateSafely,
} from "../orchestrate-queue.js";

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
