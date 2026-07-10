/**
 * Tests for implementation phase logic (TSPEC-IMPL-01 through TSPEC-IMPL-08)
 * PROP-IMPL-01 through PROP-IMPL-12
 */

import main, {
  computeTopologicalBatches,
  evaluateBatchGate,
  evaluateSingleAgentGate,
  mergeWorktree,
  parsePlanTasks,
} from "../orchestrate-dev.js";
import { execSync } from "child_process";
import { createConflictingWorktree } from "./fixtures/tmpGitFixture.js";

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

// ─── PROP-IMPL-08: mergeWorktree conflict detection (integration) ─────────────
describe("PROP-IMPL-08: mergeWorktree detects merge conflict and returns { ok: false, conflictingFiles }", () => {
  // Skip if git is not available (e.g. restricted CI environments)
  const gitAvailable = (() => {
    try {
      execSync("git --version", { stdio: "pipe" });
      return true;
    } catch {
      return false;
    }
  })();

  (gitAvailable ? it : it.skip)(
    "returns { ok: false, conflictingFiles: ['conflict.txt'] } when merging a conflicting branch",
    async () => {
      const { repoPath, worktreeBranch, targetBranch, cleanup } =
        createConflictingWorktree();

      try {
        const result = await mergeWorktree(repoPath, worktreeBranch, targetBranch);
        expect(result.ok).toBe(false);
        expect(Array.isArray(result.conflictingFiles)).toBe(true);
        expect(result.conflictingFiles).toContain("conflict.txt");
      } finally {
        cleanup();
      }
    }
  );

  (gitAvailable ? it : it.skip)(
    "returns { ok: true } when merging a non-conflicting branch",
    async () => {
      const { repoPath, cleanup } = createConflictingWorktree();

      try {
        // Create a branch that only adds a new file — no conflict with main
        const execOpts = { cwd: repoPath, stdio: "pipe" };
        execSync("git checkout -b clean-branch", execOpts);
        const { writeFileSync } = await import("fs");
        const { join } = await import("path");
        writeFileSync(join(repoPath, "new-file.txt"), "no conflict here\n");
        execSync("git add new-file.txt", execOpts);
        execSync('git commit -m "clean addition"', execOpts);
        execSync("git checkout main", execOpts);

        const result = await mergeWorktree(repoPath, "clean-branch", "main");
        expect(result.ok).toBe(true);
      } finally {
        cleanup();
      }
    }
  );
});

// ─── PROP-IMPL-01: Batch plan logged before first agent() call (recording proxy) ──
describe("PROP-IMPL-01: batch plan log precedes first agent() dispatch (recording proxy)", () => {
  it("log('Implementation batch plan:') for each batch occurs before the first agent() call for that batch", async () => {
    // Build a two-batch PLAN: T1 (batch 1) → T2 (batch 2)
    const mockTasks = [
      { id: "T1", description: "First task", dependencies: [], planBatch: 1 },
      { id: "T2", description: "Second task", dependencies: ["T1"], planBatch: 2 },
    ];

    // Recording call-sequence array: entries are { type: "log"|"agent", value: string }
    const callSequence = [];

    // Recording spy for _log
    const spyLog = (message) => {
      callSequence.push({ type: "log", value: message });
    };

    // Recording spy for _agent — handles all skills the pipeline needs
    const spyAgent = async (skill, prompt, opts) => {
      callSequence.push({ type: "agent", skill, prompt: String(prompt).slice(0, 80) });

      if (skill === "guard") return { ok: true };
      if (skill === "se-review" || skill === "te-review" || skill === "pm-review") {
        return `Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`;
      }
      if (skill === "pm-author" || skill === "te-author") {
        return "Created/updated document successfully.";
      }
      if (skill === "se-author") {
        if (typeof prompt === "string" && prompt.includes("DECISIONS_WARRANTED")) {
          return "Finalized TSPEC.\nDECISIONS_WARRANTED: false";
        }
        // DAG parsing agent returns two-batch task list
        if (typeof prompt === "string" && prompt.includes("Return a JSON object")) {
          return JSON.stringify({ tasks: mockTasks });
        }
        return "Done.";
      }
      if (skill === "se-implement") {
        return "Tests: 5 passed, 0 failed.";
      }
      if (skill === "harvest-learnings") {
        return "Harvest complete.";
      }
      if (skill === "ship-pr") {
        if (typeof prompt === "string" && prompt.includes("Raise a pull request")) {
          return "PR opened.\nPR_URL: https://github.com/acme/repo/pull/42";
        }
        return "Checks complete.\nCI_STATUS: passed";
      }
      return "Success.";
    };

    await main({
      reqPath: "docs/test-feat/REQ-test-feat.md",
      _agent: spyAgent,
      _parallel: (promises) => Promise.all(promises),
      _checkFile: () => ({ ok: true }),
      _checkCi: async () => "passed",
      _log: spyLog,
      _phase: () => {},
      _pipeline: async (l, fn) => fn(),
      _mergeWorktree: async () => ({ ok: true }),
    });

    // Find the index of "Implementation batch plan:" log entry
    const batchPlanLogIdx = callSequence.findIndex(
      (e) => e.type === "log" && e.value === "Implementation batch plan:"
    );
    expect(batchPlanLogIdx).toBeGreaterThan(-1);

    // Find the index of the first se-implement agent call (Batch 1, task T1)
    const firstBatch1AgentIdx = callSequence.findIndex(
      (e) => e.type === "agent" && e.skill === "se-implement"
    );
    expect(firstBatch1AgentIdx).toBeGreaterThan(-1);

    // The batch plan log must come BEFORE the first se-implement agent call
    expect(batchPlanLogIdx).toBeLessThan(firstBatch1AgentIdx);

    // Also verify the batch plan log entries appear for both batches
    const batchLogs = callSequence.filter(
      (e) =>
        e.type === "log" &&
        (e.value.includes("Batch 1:") || e.value.includes("Batch 2:"))
    );
    expect(batchLogs.length).toBe(2); // one entry per batch

    // Both batch log entries must come before the first se-implement dispatch
    for (const batchLog of batchLogs) {
      const batchLogIdx = callSequence.indexOf(batchLog);
      expect(batchLogIdx).toBeLessThan(firstBatch1AgentIdx);
    }
  });
});

// ─── parsePlanTasks — TSPEC-IMPL-01 deterministic PLAN table parse ─────────────
describe("parsePlanTasks — TSPEC-IMPL-01", () => {
  it("parses a well-formed task table (happy path)", () => {
    const md = [
      "# PLAN",
      "",
      "| # | Task | Dependencies | Batch |",
      "|---|------|--------------|-------|",
      "| T1 | Build the store | - | 1 |",
      "| T2 | Wire the API | T1 | 2 |",
      "| T3 | Add the UI | T1, T2 | 3 |",
    ].join("\n");

    const result = parsePlanTasks(md);
    expect(result).not.toBeNull();
    expect(result.tasks).toEqual([
      { id: "T1", description: "Build the store", dependencies: [], planBatch: 1 },
      { id: "T2", description: "Wire the API", dependencies: ["T1"], planBatch: 2 },
      { id: "T3", description: "Add the UI", dependencies: ["T1", "T2"], planBatch: 3 },
    ]);
  });

  it("tolerates column-order variation via header matching", () => {
    const md = [
      "| Batch | Dependencies | Task ID | Description |",
      "|-------|--------------|---------|-------------|",
      "| 1 | none | T1 | first |",
      "| 2 | T1 | T2 | second |",
    ].join("\n");

    const result = parsePlanTasks(md);
    expect(result.tasks).toEqual([
      { id: "T1", description: "first", dependencies: [], planBatch: 1 },
      { id: "T2", description: "second", dependencies: ["T1"], planBatch: 2 },
    ]);
  });

  it("treats -, —, none, and empty dependency cells as no dependencies", () => {
    const md = [
      "| ID | Task | Deps | Batch |",
      "|----|------|------|-------|",
      "| T1 | a | - | 1 |",
      "| T2 | b | — | 1 |",
      "| T3 | c | none | 1 |",
      "| T4 | d |  | 1 |",
    ].join("\n");

    const result = parsePlanTasks(md);
    expect(result.tasks.map((t) => t.dependencies)).toEqual([[], [], [], []]);
  });

  it("returns null when there is no parseable task table", () => {
    expect(parsePlanTasks("Just some prose, no table here.")).toBeNull();
    expect(parsePlanTasks(null)).toBeNull();
    expect(parsePlanTasks("")).toBeNull();
    // A table with no dependency column can't yield the DAG → null (agent fallback).
    const noDeps = [
      "| # | Task | Test File | Source File | Status |",
      "|---|------|-----------|-------------|--------|",
      "| 1 | build | a.test.ts | a.ts | ⬚ |",
    ].join("\n");
    expect(parsePlanTasks(noDeps)).toBeNull();
  });
});

// ─── Phase I DAG parse-first wiring — TSPEC-IMPL-01 ────────────────────────────
describe("Phase I DAG parsing: parse-first, agent fallback on Haiku", () => {
  function makeAgent(record) {
    return async (skill, prompt, opts) => {
      record.push({ skill, prompt: String(prompt), opts });
      if (skill === "se-review" || skill === "te-review" || skill === "pm-review") {
        return `Review.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`;
      }
      if (skill === "pm-author" || skill === "se-author" || skill === "te-author") {
        if (typeof prompt === "string" && prompt.includes("DECISIONS_WARRANTED")) {
          return "Finalized.\nDECISIONS_WARRANTED: false";
        }
        if (typeof prompt === "string" && prompt.includes("Return a JSON object")) {
          return JSON.stringify({
            tasks: [{ id: "T1", description: "x", dependencies: [], planBatch: 1 }],
          });
        }
        return "Document created.";
      }
      if (skill === "se-implement") return "Tests: 3 passed, 0 failed.";
      if (skill === "harvest-learnings") return "Harvest complete.";
      if (skill === "dod-verify") return "Clean.\nDOD_STATUS: passed";
      if (skill === "ship-pr") {
        if (prompt.includes("Raise a pull request")) {
          return "PR opened.\nPR_URL: https://github.com/a/b/pull/1";
        }
        return "Rebased.\nREBASE_STATUS: clean";
      }
      return "Success.";
    };
  }

  const baseArgs = (record, extra) => ({
    reqPath: "docs/test-feat/REQ-test-feat.md",
    _agent: makeAgent(record),
    _parallel: (p) => Promise.all(p),
    _checkFile: () => ({ ok: true }),
    _checkCi: async () => "passed",
    _phase: () => {},
    _pipeline: async (l, fn) => fn(),
    _mergeWorktree: async () => ({ ok: true }),
    ...extra,
  });

  it("parses the PLAN table itself and does NOT spawn the DAG agent", async () => {
    const planMd = [
      "| # | Task | Dependencies | Batch |",
      "|---|------|--------------|-------|",
      "| T1 | first | - | 1 |",
      "| T2 | second | T1 | 2 |",
    ].join("\n");

    const record = [];
    const result = await main(baseArgs(record, { _readFile: () => planMd }));
    expect(result.outcome).toBe("success");

    const dagAgentCalls = record.filter((c) =>
      c.prompt.includes("Return a JSON object")
    );
    expect(dagAgentCalls.length).toBe(0);
  });

  it("falls back to the extraction agent on Haiku when the table is not parseable", async () => {
    const record = [];
    // _readFile returns null → parsePlanTasks null → agent fallback.
    const result = await main(baseArgs(record, { _readFile: () => null }));
    expect(result.outcome).toBe("success");

    const dagAgentCalls = record.filter((c) =>
      c.prompt.includes("Return a JSON object")
    );
    expect(dagAgentCalls.length).toBe(1);
    expect(dagAgentCalls[0].opts && dagAgentCalls[0].opts.model).toBe("haiku");
  });
});
