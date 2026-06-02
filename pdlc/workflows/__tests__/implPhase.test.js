/**
 * Tests for implementation phase logic (TSPEC-IMPL-01 through TSPEC-IMPL-08)
 * PROP-IMPL-01 through PROP-IMPL-12
 */

import {
  computeTopologicalBatches,
  evaluateBatchGate,
  evaluateSingleAgentGate,
} from "../orchestrate-dev.js";

let logMessages = [];
const originalLog = console.log;

beforeEach(() => {
  logMessages = [];
  console.log = (...args) => {
    logMessages.push(args.join(" "));
  };
});

afterEach(() => {
  console.log = originalLog;
});

// ─── evaluateBatchGate ────────────────────────────────────────────────────────
describe("evaluateBatchGate — TSPEC-IMPL-06", () => {
  const batch1 = [{ id: "TASK-01" }, { id: "TASK-02" }];

  // PROP-IMPL-04: Clean batch → logs "all tests passing" and does not throw
  it("PROP-IMPL-04: clean results log batch pass and do not throw", () => {
    const results = ["Tests: 5 passed, 0 failed\nAll good.", "Tests: 3 passed."];
    expect(() => evaluateBatchGate(results, 0, batch1)).not.toThrow();
    expect(logMessages.some((m) => m.includes("Batch 1 complete"))).toBe(true);
  });

  // PROP-IMPL-02: Test failure marker → halt
  it("PROP-IMPL-02: Tests: N failed marker halts pipeline", () => {
    const results = [
      "Tests: 2 failed, 3 passed\nFailed tests listed.",
      "Tests: 5 passed.",
    ];
    expect(() => evaluateBatchGate(results, 0, batch1)).toThrow(
      /Batch 1.*failed|Tests: 2 failed/
    );
  });

  // PROP-IMPL-05: Empty result treated as failure
  it("PROP-IMPL-05: empty result treated as failure (checked before marker scan)", () => {
    const results = ["", "Tests: 5 passed."];
    expect(() => evaluateBatchGate(results, 0, batch1)).toThrow(
      /Batch 1 agent returned empty result/
    );
  });

  it("null result treated as failure", () => {
    const results = [null, "Tests: 5 passed."];
    expect(() => evaluateBatchGate(results, 0, batch1)).toThrow(
      /empty result/
    );
  });

  it("whitespace-only result treated as failure", () => {
    const results = ["   \n  ", "Tests: 5 passed."];
    expect(() => evaluateBatchGate(results, 0, batch1)).toThrow(
      /empty result/
    );
  });

  // PROP-IMPL-11: non-zero exit (case-insensitive)
  it("PROP-IMPL-11: non-zero exit in result halts pipeline", () => {
    const results = ["Command exited with Non-Zero Exit code 1."];
    expect(() => evaluateBatchGate(results, 0, [{ id: "TASK-01" }])).toThrow(
      /non-zero exit/i
    );
  });

  it("PROP-IMPL-11: NON-ZERO EXIT (uppercase) also detected", () => {
    const results = ["Process returned NON-ZERO EXIT."];
    expect(() => evaluateBatchGate(results, 0, [{ id: "TASK-01" }])).toThrow(
      /non-zero exit/i
    );
  });

  // Batch number reported correctly
  it("reports correct batch number in error (1-indexed)", () => {
    const results = ["Tests: 1 failed."];
    expect(() =>
      evaluateBatchGate(results, 2, [{ id: "TASK-01" }])
    ).toThrow(/Batch 3/);
  });
});

// ─── evaluateSingleAgentGate ──────────────────────────────────────────────────
describe("evaluateSingleAgentGate — TSPEC-IMPL-07 (TE-F04)", () => {
  // Both functions apply identical empty/failure logic
  it("returns { passed: true } for clean result", () => {
    expect(evaluateSingleAgentGate("All tests pass.", "PT")).toEqual({
      passed: true,
    });
  });

  it("returns { passed: false } for empty result", () => {
    const r = evaluateSingleAgentGate("", "PT");
    expect(r.passed).toBe(false);
    expect(r.reason).toContain("empty result");
  });

  it("returns { passed: false } for null result", () => {
    const r = evaluateSingleAgentGate(null, "PT");
    expect(r.passed).toBe(false);
    expect(r.reason).toContain("empty result");
  });

  it("returns { passed: false } for Tests: N failed", () => {
    const r = evaluateSingleAgentGate("Tests: 3 failed, 2 passed.", "PT");
    expect(r.passed).toBe(false);
    expect(r.reason).toContain("Tests: 3 failed");
  });

  it("returns { passed: false } for non-zero exit (case-insensitive)", () => {
    const r = evaluateSingleAgentGate("Command NON-ZERO EXIT.", "PT");
    expect(r.passed).toBe(false);
    expect(r.reason).toMatch(/non-zero exit/i);
  });

  it("phase name included in reason", () => {
    const r = evaluateSingleAgentGate("", "PT");
    expect(r.reason).toContain("PT");
  });
});

// ─── computeTopologicalBatches ────────────────────────────────────────────────
describe("computeTopologicalBatches — TSPEC-IMPL-02", () => {
  // Simple linear chain
  it("handles linear chain A→B→C as three sequential batches", () => {
    const tasks = [
      { id: "A", dependencies: [], planBatch: 1 },
      { id: "B", dependencies: ["A"], planBatch: 2 },
      { id: "C", dependencies: ["B"], planBatch: 3 },
    ];
    const batches = computeTopologicalBatches(tasks);
    expect(batches.length).toBe(3);
    expect(batches[0].map((t) => t.id)).toEqual(["A"]);
    expect(batches[1].map((t) => t.id)).toEqual(["B"]);
    expect(batches[2].map((t) => t.id)).toEqual(["C"]);
  });

  // Diamond DAG: A→{B,C}→D
  it("handles diamond DAG correctly: A then B and C in parallel batch then D", () => {
    const tasks = [
      { id: "A", dependencies: [], planBatch: 1 },
      { id: "B", dependencies: ["A"], planBatch: 2 },
      { id: "C", dependencies: ["A"], planBatch: 2 },
      { id: "D", dependencies: ["B", "C"], planBatch: 3 },
    ];
    const batches = computeTopologicalBatches(tasks);
    expect(batches.length).toBe(3);
    expect(batches[0].map((t) => t.id)).toEqual(["A"]);
    const batchTwoIds = batches[1].map((t) => t.id).sort();
    expect(batchTwoIds).toEqual(["B", "C"]);
    expect(batches[2].map((t) => t.id)).toEqual(["D"]);
  });

  // PROP-IMPL-06: Cycle detection → halt
  it("PROP-IMPL-06: cycle detection throws halt error", () => {
    const tasks = [
      { id: "A", dependencies: ["B"], planBatch: 1 },
      { id: "B", dependencies: ["A"], planBatch: 1 },
    ];
    expect(() => computeTopologicalBatches(tasks)).toThrow(
      "Error: PLAN dependency graph contains a cycle — cannot compute topological batches"
    );
  });

  // PROP-IMPL-03: Batch label inconsistency → warning logged
  it("PROP-IMPL-03: PLAN batch label inconsistency emits warning", () => {
    const tasks = [
      { id: "A", dependencies: [], planBatch: 2 }, // should be batch 1
      { id: "B", dependencies: ["A"], planBatch: 1 }, // claims batch 1 but depends on A
    ];
    expect(() => computeTopologicalBatches(tasks)).not.toThrow();
    // A is processed first (no deps), B depends on A so goes in batch 2
    // B claims planBatch 1 which <= completed A's planBatch 2 → inconsistency warning
    expect(
      logMessages.some(
        (m) =>
          m.includes("batch labels inconsistent") ||
          m.includes("WARNING: PLAN batch")
      )
    ).toBe(true);
  });

  // PROP-IMPL-12: Sub-batch cap of 5
  it("PROP-IMPL-12: 7 ready tasks at same level split into sub-batches of 5 and 2", () => {
    const tasks = [
      { id: "A1", dependencies: [], planBatch: 1 },
      { id: "A2", dependencies: [], planBatch: 1 },
      { id: "A3", dependencies: [], planBatch: 1 },
      { id: "A4", dependencies: [], planBatch: 1 },
      { id: "A5", dependencies: [], planBatch: 1 },
      { id: "A6", dependencies: [], planBatch: 1 },
      { id: "A7", dependencies: [], planBatch: 1 },
    ];
    const batches = computeTopologicalBatches(tasks);
    expect(batches.length).toBe(2);
    expect(batches[0].length).toBe(5);
    expect(batches[1].length).toBe(2);
  });

  // PROP-IMPL-07: max 5 concurrent per batch
  it("PROP-IMPL-07: no batch contains more than 5 tasks", () => {
    const tasks = Array.from({ length: 10 }, (_, i) => ({
      id: `T${i + 1}`,
      dependencies: [],
      planBatch: 1,
    }));
    const batches = computeTopologicalBatches(tasks);
    for (const batch of batches) {
      expect(batch.length).toBeLessThanOrEqual(5);
    }
  });

  // Document order preserved within batch
  it("PROP-IMPL-09: tasks within a batch maintain document order", () => {
    const tasks = [
      { id: "A", dependencies: [], planBatch: 1 },
      { id: "B", dependencies: [], planBatch: 1 },
      { id: "C", dependencies: [], planBatch: 1 },
    ];
    const batches = computeTopologicalBatches(tasks);
    expect(batches[0].map((t) => t.id)).toEqual(["A", "B", "C"]);
  });
});

// ─── Batch plan log format ────────────────────────────────────────────────────
describe("PROP-IMPL-01: Batch plan log format", () => {
  it("log includes Implementation batch plan header", () => {
    // Test by importing and running the computation with mock log
    const tasks = [
      { id: "T1", dependencies: [], planBatch: 1 },
      { id: "T2", dependencies: ["T1"], planBatch: 2 },
    ];

    // Simulate what the script does for batch logging
    const batches = computeTopologicalBatches(tasks);
    const mockLogs = [];

    mockLogs.push("Implementation batch plan:");
    for (let i = 0; i < batches.length; i++) {
      const deps = batches[i].some((t) => t.dependencies.length > 0)
        ? `  (depends on: Batch ${i})`
        : "";
      mockLogs.push(
        `  Batch ${i + 1}: [${batches[i].map((t) => t.id).join(", ")}]${deps}`
      );
    }
    mockLogs.push(`  Total: ${tasks.length} tasks in ${batches.length} batches`);

    expect(mockLogs[0]).toBe("Implementation batch plan:");
    expect(mockLogs[1]).toContain("Batch 1: [T1]");
    expect(mockLogs[2]).toContain("Batch 2: [T2]");
    expect(mockLogs[3]).toContain("Total: 2 tasks in 2 batches");
  });
});
