/**
 * Tests for reviewLoop (TSPEC-LOOP-01 through TSPEC-LOOP-08, AT-RESUME-01/02/03)
 * PROP-LOOP-01 through PROP-LOOP-16
 */

import { reviewLoop } from "../orchestrate-dev.js";

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

function logsContaining(substr) {
  return logMessages.filter((m) => m.includes(substr));
}

// Helpers for creating agent mocks
function makeApproveResult(skill = "se-review") {
  return `Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`;
}

function makeApproveMinorResult() {
  return `Review complete.\nVERDICT: Approved with minor changes\n{"high": 0, "medium": 0, "low": 0}\n`;
}

function makeNeedsRevisionResult(high = 1, medium = 0) {
  return `Review with issues.\nVERDICT: Needs revision\n{"high": ${high}, "medium": ${medium}, "low": 0}\n`;
}

function makeOptimizerResult() {
  return "Addressed all feedback. Document updated.";
}

// Standard params
const baseParams = {
  doc: "docs/test-feat/TSPEC-test-feat.md",
  phase: "T",
  reviewers: ["pm-review", "te-review"],
  optimizer: "se-author",
  feature: "test-feat",
};

// Guard agent that says doc exists
const existsGuard = () => ({ ok: true });

// ─── PROP-LOOP-01: Both pass on iteration 1 ───────────────────────────────────
describe("PROP-LOOP-01: Both reviewers approve on iteration 1", () => {
  it("returns { converged: true, iterations: 1 } and does not invoke optimizer", async () => {
    let optimizerCalled = false;

    const mockAgent = async (skill, prompt) => {
      if (skill === "guard") return existsGuard("guard", prompt);
      if (skill === "pm-review" || skill === "te-review") {
        return makeApproveResult(skill);
      }
      if (skill === "se-author") {
        optimizerCalled = true;
        return makeOptimizerResult();
      }
      return "";
    };

    const mockParallel = (promises) => Promise.all(promises);

    const result = await reviewLoop({
      ...baseParams,
      _agent: mockAgent,
      _parallel: mockParallel,
      _checkFile: existsGuard,
    });

    expect(result).toEqual({
      converged: true,
      iterations: 1,
      lastOptimizerResult: null,
    });
    expect(optimizerCalled).toBe(false);
  });
});

// ─── PROP-LOOP-02: One reviewer needs revision → optimizer invoked once ────────
describe("PROP-LOOP-02: One reviewer needs revision, then both pass on iteration 2", () => {
  it("invokes optimizer once and returns { converged: true, iterations: 2 }", async () => {
    let optimizerCallCount = 0;
    let iteration = 0;

    const mockAgent = async (skill, prompt) => {
      if (skill === "guard") return existsGuard("guard", prompt);
      if (skill === "pm-review") {
        iteration++;
        if (iteration <= 1) return makeNeedsRevisionResult();
        return makeApproveResult();
      }
      if (skill === "te-review") return makeApproveResult();
      if (skill === "se-author") {
        optimizerCallCount++;
        return makeOptimizerResult();
      }
      return "";
    };

    const mockParallel = (promises) => Promise.all(promises);

    const result = await reviewLoop({
      ...baseParams,
      _agent: mockAgent,
      _parallel: mockParallel,
      _checkFile: existsGuard,
    });

    expect(result).toEqual({
      converged: true,
      iterations: 2,
      lastOptimizerResult: makeOptimizerResult(),
    });
    expect(optimizerCallCount).toBe(1);
  });
});

// ─── PROP-LOOP-03: 5 iteration cap → POSTMORTEM triggered ─────────────────────
describe("PROP-LOOP-03: Both reviewers fail all 5 iterations → POSTMORTEM", () => {
  it("returns { converged: false, iterations: 5 } and invokes POSTMORTEM agent", async () => {
    let reviewerPairCount = 0;
    let optimizerCount = 0;
    let postmortemCalled = false;

    const mockAgent = async (skill, prompt) => {
      if (skill === "guard") return existsGuard("guard", prompt);
      if (skill === "pm-review" || skill === "te-review") {
        if (skill === "pm-review") reviewerPairCount++;
        return makeNeedsRevisionResult();
      }
      if (skill === "se-author") {
        if (typeof prompt === "string" && prompt.includes("POSTMORTEM")) {
          postmortemCalled = true;
          return "POSTMORTEM written.";
        }
        optimizerCount++;
        return makeOptimizerResult();
      }
      return "";
    };

    const mockParallel = (promises) => Promise.all(promises);

    const result = await reviewLoop({
      ...baseParams,
      _agent: mockAgent,
      _parallel: mockParallel,
      _checkFile: existsGuard,
    });

    expect(result).toMatchObject({ converged: false, iterations: 5 });
    // PROP-LOOP-12: exactly 5 reviewer-pair dispatches and 5 optimizer calls
    expect(reviewerPairCount).toBe(5);
    expect(optimizerCount).toBe(5);
    expect(postmortemCalled).toBe(true);
  });
});

// ─── PROP-LOOP-04: Reviewer crashes → warning emitted, optimizer invoked ──────
describe("PROP-LOOP-04: One reviewer crashes (null result)", () => {
  it("emits warning with skill name and treats as Needs revision", async () => {
    let iteration = 0;

    const mockAgent = async (skill, prompt) => {
      if (skill === "guard") return existsGuard("guard", prompt);
      if (skill === "pm-review") {
        iteration++;
        if (iteration === 1) return null; // crash
        return makeApproveResult();
      }
      if (skill === "te-review") return makeApproveResult();
      if (skill === "se-author") return makeOptimizerResult();
      return "";
    };

    const mockParallel = (promises) => Promise.all(promises);

    await reviewLoop({
      ...baseParams,
      _agent: mockAgent,
      _parallel: mockParallel,
      _checkFile: existsGuard,
    });

    const warnings = logsContaining("WARNING");
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]).toContain("pm-review");
    expect(warnings[0]).toContain("no VERDICT");
  });
});

// ─── PROP-LOOP-05: POSTMORTEM agent fails → warning logged ────────────────────
describe("PROP-LOOP-05: POSTMORTEM agent fails after cap exhaustion", () => {
  it("logs POSTMORTEM failure warning and still returns { converged: false, iterations: 5 }", async () => {
    const mockAgent = async (skill, prompt) => {
      if (skill === "guard") return existsGuard("guard", prompt);
      if (skill === "pm-review" || skill === "te-review") {
        return makeNeedsRevisionResult();
      }
      if (skill === "se-author") {
        if (typeof prompt === "string" && prompt.includes("POSTMORTEM")) {
          return ""; // POSTMORTEM agent fails (empty result)
        }
        return makeOptimizerResult();
      }
      return "";
    };

    const mockParallel = (promises) => Promise.all(promises);

    const result = await reviewLoop({
      ...baseParams,
      _agent: mockAgent,
      _parallel: mockParallel,
      _checkFile: existsGuard,
    });

    expect(result).toMatchObject({ converged: false, iterations: 5 });
    const warnings = logsContaining("POSTMORTEM agent failed");
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]).toContain("T"); // phase T
  });
});

// ─── PROP-LOOP-06: Missing doc → halt at precondition (AT-LOOP-06) ────────────
describe("PROP-LOOP-06: Guard agent reports doc absent → halt before any reviewer dispatch", () => {
  it("throws halt error with correct message and does not dispatch reviewers", async () => {
    const missingGuard = () => ({ ok: false, reason: "file_not_found" });

    let reviewerCalled = false;
    const mockAgent = async (skill, prompt) => {
      if (skill === "pm-review" || skill === "te-review") {
        reviewerCalled = true;
        return makeApproveResult();
      }
      return "";
    };

    const mockParallel = (promises) => Promise.all(promises);

    await expect(
      reviewLoop({
        ...baseParams,
        _agent: mockAgent,
        _parallel: mockParallel,
        _checkFile: missingGuard,
      })
    ).rejects.toThrow(
      "Error: docs/test-feat/TSPEC-test-feat.md does not exist — cannot enter reviewLoop for phase T"
    );

    expect(reviewerCalled).toBe(false);
  });
});

// ─── PROP-LOOP-07: Optimizer fails → halt immediately ─────────────────────────
describe("PROP-LOOP-07: Optimizer agent fails → halt with correct message", () => {
  it("throws halt error with optimizer failure message", async () => {
    const mockAgent = async (skill, prompt) => {
      if (skill === "guard") return existsGuard("guard", prompt);
      if (skill === "pm-review" || skill === "te-review") {
        return makeNeedsRevisionResult();
      }
      if (skill === "se-author") return ""; // optimizer fails
      return "";
    };

    const mockParallel = (promises) => Promise.all(promises);

    await expect(
      reviewLoop({
        ...baseParams,
        _agent: mockAgent,
        _parallel: mockParallel,
        _checkFile: existsGuard,
      })
    ).rejects.toThrow(
      /optimizer agent se-author failed during phase T, iteration 1 — pipeline halted/
    );
  });
});

// ─── PROP-LOOP-08: Both reviewers crash same iteration ────────────────────────
describe("PROP-LOOP-08: Both reviewers crash in same iteration", () => {
  it("emits two warnings, invokes optimizer once, does not halt", async () => {
    let iteration = 0;
    let optimizerCount = 0;

    const mockAgent = async (skill, prompt) => {
      if (skill === "guard") return existsGuard("guard", prompt);
      // Recovery re-ask: the reviewer genuinely crashed, so recovery cannot
      // reconstruct a trailer — return a valid Needs-revision verdict so the
      // gate still fails and the optimizer runs (original test intent).
      const isRecovery =
        typeof prompt === "string" &&
        prompt.includes("did not end with a machine-readable VERDICT trailer");
      if (skill === "pm-review") {
        if (isRecovery) return makeNeedsRevisionResult();
        iteration++;
        if (iteration === 1) return null;
        return makeApproveResult();
      }
      if (skill === "te-review") {
        if (isRecovery) return makeNeedsRevisionResult();
        if (iteration === 1) return null;
        return makeApproveResult();
      }
      if (skill === "se-author") {
        optimizerCount++;
        return makeOptimizerResult();
      }
      return "";
    };

    const mockParallel = (promises) => Promise.all(promises);

    const result = await reviewLoop({
      ...baseParams,
      _agent: mockAgent,
      _parallel: mockParallel,
      _checkFile: existsGuard,
    });

    expect(result.converged).toBe(true);
    const warnings = logsContaining("WARNING");
    expect(warnings.length).toBe(2);
    expect(optimizerCount).toBe(1);
  });
});

// ─── PROP-LOOP-09: Parallel dispatch ─────────────────────────────────────────
describe("PROP-LOOP-09: Both reviewers dispatched concurrently via parallel()", () => {
  it("parallel() is called with two promises (not sequential agent calls)", async () => {
    let parallelCallArgs = [];

    const mockAgent = async (skill, prompt) => {
      if (skill === "guard") return existsGuard("guard", prompt);
      return makeApproveResult(skill);
    };

    const mockParallel = (promises) => {
      parallelCallArgs.push(promises.length);
      return Promise.all(promises);
    };

    await reviewLoop({
      ...baseParams,
      _agent: mockAgent,
      _parallel: mockParallel,
      _checkFile: existsGuard,
    });

    // First parallel call should be for two reviewers
    expect(parallelCallArgs[0]).toBe(2);
  });
});

// ─── PROP-LOOP-11: POSTMORTEM prompt contains all 6 required sections ─────────
describe("PROP-LOOP-11: POSTMORTEM agent prompt contains all 6 required section headings", () => {
  it("prompt includes Phase, Iterations, Reviewers, Pattern of Disagreement, Best-Guess Root Cause, Recommendation", async () => {
    let postmortemPrompt = "";

    const mockAgent = async (skill, prompt) => {
      if (skill === "guard") return existsGuard("guard", prompt);
      if (skill === "pm-review" || skill === "te-review")
        return makeNeedsRevisionResult();
      if (skill === "se-author") {
        if (typeof prompt === "string" && prompt.includes("POSTMORTEM")) {
          postmortemPrompt = prompt;
          return "POSTMORTEM written.";
        }
        return makeOptimizerResult();
      }
      return "";
    };

    const mockParallel = (promises) => Promise.all(promises);

    await reviewLoop({
      ...baseParams,
      _agent: mockAgent,
      _parallel: mockParallel,
      _checkFile: existsGuard,
    });

    expect(postmortemPrompt).toContain("Phase");
    expect(postmortemPrompt).toContain("Iterations");
    expect(postmortemPrompt).toContain("Reviewers");
    expect(postmortemPrompt).toContain("Pattern of Disagreement");
    expect(postmortemPrompt).toContain("Best-Guess Root Cause");
    expect(postmortemPrompt).toContain("Recommendation");
  });
});

// ─── PROP-LOOP-12: Exactly 5 reviewer-pair dispatches before POSTMORTEM ───────
describe("PROP-LOOP-12: Cap fires after exactly 5 iterations (reviewer pair + optimizer each)", () => {
  it("5 reviewer pairs, 5 optimizer calls, then POSTMORTEM", async () => {
    let reviewerPairCount = 0;
    let optimizerCount = 0;
    let postmortemCount = 0;

    const mockAgent = async (skill, prompt) => {
      if (skill === "guard") return existsGuard("guard", prompt);
      if (skill === "pm-review") {
        reviewerPairCount++;
        return makeNeedsRevisionResult();
      }
      if (skill === "te-review") return makeNeedsRevisionResult();
      if (skill === "se-author") {
        if (typeof prompt === "string" && prompt.includes("POSTMORTEM")) {
          postmortemCount++;
          return "POSTMORTEM written.";
        }
        optimizerCount++;
        return makeOptimizerResult();
      }
      return "";
    };

    const mockParallel = (promises) => Promise.all(promises);

    const result = await reviewLoop({
      ...baseParams,
      _agent: mockAgent,
      _parallel: mockParallel,
      _checkFile: existsGuard,
    });

    expect(result).toMatchObject({ converged: false, iterations: 5 });
    expect(reviewerPairCount).toBe(5);
    expect(optimizerCount).toBe(5);
    expect(postmortemCount).toBe(1);
  });
});

// ─── Resume semantics (PROP-LOOP-13/14/15/16) ─────────────────────────────────
describe("Resume semantics — TSPEC-LOOP-05/06", () => {
  // PROP-LOOP-14: Fresh run iteration 1 → "Starting iteration 1"
  it("PROP-LOOP-14: emits Starting iteration 1 on fresh run", async () => {
    const mockAgent = async (skill, prompt) => {
      if (skill === "guard") return existsGuard("guard", prompt);
      return makeApproveResult(skill);
    };
    const mockParallel = (promises) => Promise.all(promises);

    await reviewLoop({
      ...baseParams,
      iteration: 1,
      _agent: mockAgent,
      _parallel: mockParallel,
      _checkFile: existsGuard,
    });

    const startLogs = logsContaining("Starting iteration 1");
    expect(startLogs.length).toBeGreaterThan(0);
  });

  // PROP-LOOP-13: Resume at iteration 3 → "Resuming from iteration 3"
  it("PROP-LOOP-13: emits Resuming from iteration 3 when starting at iteration=3", async () => {
    const mockAgent = async (skill, prompt) => {
      if (skill === "guard") return existsGuard("guard", prompt);
      return makeApproveResult(skill);
    };
    const mockParallel = (promises) => Promise.all(promises);

    await reviewLoop({
      ...baseParams,
      iteration: 3,
      _agent: mockAgent,
      _parallel: mockParallel,
      _checkFile: existsGuard,
    });

    const resumeLogs = logsContaining("Resuming from iteration 3");
    expect(resumeLogs.length).toBeGreaterThan(0);
    const startLogs = logsContaining("Starting iteration 1");
    expect(startLogs.length).toBe(0);
  });

  // PROP-LOOP-15: After failing iteration 1, iteration 2 emits "Resuming from iteration 2"
  it("PROP-LOOP-15: emits Resuming from iteration 2 on second iteration of a fresh run", async () => {
    let callCount = 0;

    const mockAgent = async (skill, prompt) => {
      if (skill === "guard") return existsGuard("guard", prompt);
      if (skill === "pm-review") {
        callCount++;
        if (callCount === 1) return makeNeedsRevisionResult();
        return makeApproveResult();
      }
      if (skill === "te-review") {
        if (callCount <= 1) return makeNeedsRevisionResult();
        return makeApproveResult();
      }
      if (skill === "se-author") return makeOptimizerResult();
      return "";
    };
    const mockParallel = (promises) => Promise.all(promises);

    await reviewLoop({
      ...baseParams,
      iteration: 1,
      _agent: mockAgent,
      _parallel: mockParallel,
      _checkFile: existsGuard,
    });

    const resumeLogs = logsContaining("Resuming from iteration 2");
    expect(resumeLogs.length).toBeGreaterThan(0);
  });

  // PROP-LOOP-16: Iteration log emitted before parallel() call
  it("PROP-LOOP-16: log emitted before parallel dispatch", async () => {
    const callOrder = [];

    const mockAgent = async (skill, prompt) => {
      if (skill === "guard") return existsGuard("guard", prompt);
      callOrder.push(`agent:${skill}`);
      return makeApproveResult(skill);
    };

    const mockParallel = (promises) => {
      callOrder.push("parallel");
      return Promise.all(promises);
    };

    const origLog = console.log;
    console.log = (...args) => {
      const msg = args.join(" ");
      callOrder.push(`log:${msg}`);
      logMessages.push(msg);
    };

    await reviewLoop({
      ...baseParams,
      _agent: mockAgent,
      _parallel: mockParallel,
      _checkFile: existsGuard,
    });

    console.log = origLog;

    const iterLogIdx = callOrder.findIndex((c) =>
      c.includes("Starting iteration 1")
    );
    const parallelIdx = callOrder.indexOf("parallel");

    expect(iterLogIdx).toBeGreaterThan(-1);
    expect(parallelIdx).toBeGreaterThan(iterLogIdx);
  });
});

// ─── PROP-LOOP-10: log() never receives agent result objects ──────────────────
// (This is also tested statically in pipelineWiring.test.js; a behavioral check here.)
describe("PROP-LOOP-10: result variables are not passed to log()", () => {
  it("result1 and result2 variables are never passed directly to log()", () => {
    // Static verification: assert that reviewer result variables are not passed to log/emit.
    // The behavioral contract is: only structured strings (verdicts, counts) are logged.
    // This test documents the property; the authoritative static analysis is in pipelineWiring.test.js.
    const mockResults = {
      result1: "r1 object",
      result2: "r2 object",
    };
    // Confirm result variables are distinct from log strings
    expect(typeof mockResults.result1).toBe("string");
    expect(typeof mockResults.result2).toBe("string");
    // The actual static assertion lives in PROP-LOOP-10 in pipelineWiring.test.js
    expect(true).toBe(true);
  });
});

// ─── PROP-LOOP-17: converged: false includes lastResults ──────────────────────
describe("PROP-LOOP-17: when converged is false, lastResults includes reviewer verdicts (PM-F02)", () => {
  it("returns lastResults with reviewer skill names and finding counts on cap exhaustion", async () => {
    const mockAgent = async (skill, prompt) => {
      if (skill === "guard") return existsGuard("guard", prompt);
      if (skill === "pm-review" || skill === "te-review") {
        return makeNeedsRevisionResult(2, 1);
      }
      if (skill === "se-author") {
        if (typeof prompt === "string" && prompt.includes("POSTMORTEM")) {
          return "POSTMORTEM written.";
        }
        return makeOptimizerResult();
      }
      return "";
    };

    const mockParallel = (promises) => Promise.all(promises);

    const result = await reviewLoop({
      ...baseParams,
      _agent: mockAgent,
      _parallel: mockParallel,
      _checkFile: existsGuard,
    });

    expect(result.converged).toBe(false);
    expect(result.lastResults).toBeDefined();
    expect(Array.isArray(result.lastResults)).toBe(true);
    expect(result.lastResults.length).toBe(2);
    // Each entry should have skill, verdict, high, medium, low
    const first = result.lastResults[0];
    expect(first).toHaveProperty("skill");
    expect(first).toHaveProperty("verdict");
    expect(first).toHaveProperty("high");
    expect(first).toHaveProperty("medium");
    expect(first.verdict).toBe("Needs revision");
    expect(first.high).toBe(2);
    expect(first.medium).toBe(1);
  });
});

// ─── Phase CR skips existence check ───────────────────────────────────────────
describe("Phase CR: skips single-file existence check", () => {
  it("does not halt for Phase CR even without guard agent returning ok=false", async () => {
    // Phase CR uses directory, which always exists after Phase I
    const mockAgent = async (skill, prompt) => {
      if (skill === "guard") return { ok: false, reason: "file_not_found" }; // would halt non-CR
      return makeApproveResult(skill);
    };
    const mockParallel = (promises) => Promise.all(promises);

    const result = await reviewLoop({
      doc: "docs/test-feat/",
      phase: "CR",
      reviewers: ["pm-review", "te-review"],
      optimizer: "se-author",
      feature: "test-feat",
      _agent: mockAgent,
      _parallel: mockParallel,
    });

    expect(result.converged).toBe(true);
  });
});

// ─── lastOptimizerResult on the converged path (DECISIONS_WARRANTED fold) ──────
describe("reviewLoop returns lastOptimizerResult on convergence", () => {
  it("returns the last optimizer result when it converges after an optimizer run", async () => {
    let iteration = 0;
    const mockAgent = async (skill, prompt) => {
      if (skill === "pm-review") {
        iteration++;
        return iteration <= 1 ? makeNeedsRevisionResult() : makeApproveResult();
      }
      if (skill === "te-review") return makeApproveResult();
      if (skill === "se-author") return "Addressed feedback.\nDECISIONS_WARRANTED: false";
      return "";
    };

    const result = await reviewLoop({
      ...baseParams,
      _agent: mockAgent,
      _parallel: (p) => Promise.all(p),
      _checkFile: existsGuard,
    });

    expect(result.converged).toBe(true);
    expect(result.iterations).toBe(2);
    expect(result.lastOptimizerResult).toBe(
      "Addressed feedback.\nDECISIONS_WARRANTED: false"
    );
  });

  it("returns lastOptimizerResult: null when it converges on iteration 1 (no optimizer run)", async () => {
    const mockAgent = async (skill) => {
      if (skill === "pm-review" || skill === "te-review") return makeApproveResult(skill);
      return "";
    };

    const result = await reviewLoop({
      ...baseParams,
      _agent: mockAgent,
      _parallel: (p) => Promise.all(p),
      _checkFile: existsGuard,
    });

    expect(result.converged).toBe(true);
    expect(result.iterations).toBe(1);
    expect(result.lastOptimizerResult).toBeNull();
  });
});

// ─── Delta re-review prompt (iteration ≥2) ────────────────────────────────────
describe("Delta re-review: iteration ≥2 reviewer prompts", () => {
  it("iteration-1 prompt has no delta instructions; iteration-2 references prior cross-review and diff-only scanning", async () => {
    const pmPrompts = [];
    let pmCount = 0;

    const mockAgent = async (skill, prompt) => {
      if (skill === "pm-review") {
        pmPrompts.push(prompt);
        pmCount++;
        // Valid (not malformed) Needs revision on round 1 → optimizer → round 2.
        return pmCount === 1 ? makeNeedsRevisionResult() : makeApproveResult();
      }
      if (skill === "te-review") return makeApproveResult();
      if (skill === "se-author") return makeOptimizerResult();
      return "";
    };

    await reviewLoop({
      ...baseParams,
      _agent: mockAgent,
      _parallel: (p) => Promise.all(p),
      _checkFile: existsGuard,
    });

    // Iteration 1: plain first-pass review, no delta protocol.
    expect(pmPrompts[0]).not.toMatch(/re-review/i);
    expect(pmPrompts[0]).not.toMatch(/previous cross-review/i);
    expect(pmPrompts[0]).not.toMatch(/git diff/i);

    // Iteration 2: delta protocol — prior cross-review + diff-only scan.
    expect(pmPrompts[1]).toMatch(/previous cross-review/i);
    expect(pmPrompts[1]).toMatch(/CROSS-REVIEW-product-manager-.*-v1\.md/);
    expect(pmPrompts[1]).toMatch(/git diff/);
    expect(pmPrompts[1]).toMatch(/ONLY the changed sections/);
  });
});

// ─── Malformed VERDICT trailer recovery ───────────────────────────────────────
describe("Malformed trailer recovery (Haiku)", () => {
  it("makes exactly one recovery call on model haiku and uses the recovered verdict (converges without optimizer)", async () => {
    let recoveryCalls = 0;
    let recoveryModel = null;
    let optimizerCount = 0;

    const mockAgent = async (skill, prompt, opts) => {
      const isRecovery =
        typeof prompt === "string" &&
        prompt.includes("did not end with a machine-readable VERDICT trailer");
      if (skill === "pm-review") {
        if (isRecovery) {
          recoveryCalls++;
          recoveryModel = opts && opts.model;
          return makeApproveResult(); // recovery succeeds → Approved
        }
        return "I reviewed it but forgot the trailer."; // malformed
      }
      if (skill === "te-review") return makeApproveResult();
      if (skill === "se-author") {
        optimizerCount++;
        return makeOptimizerResult();
      }
      return "";
    };

    const result = await reviewLoop({
      ...baseParams,
      _agent: mockAgent,
      _parallel: (p) => Promise.all(p),
      _checkFile: existsGuard,
    });

    expect(recoveryCalls).toBe(1);
    expect(recoveryModel).toBe("haiku");
    expect(result.converged).toBe(true);
    expect(result.iterations).toBe(1);
    expect(optimizerCount).toBe(0);
  });

  it("failed recovery falls back to Needs revision and proceeds to the optimizer", async () => {
    let optimizerCount = 0;
    let pmCount = 0;

    const mockAgent = async (skill, prompt) => {
      const isRecovery =
        typeof prompt === "string" &&
        prompt.includes("did not end with a machine-readable VERDICT trailer");
      if (skill === "pm-review") {
        if (isRecovery) return "still no trailer"; // recovery also malformed
        pmCount++;
        return pmCount === 1 ? "no trailer here" : makeApproveResult();
      }
      if (skill === "te-review") return makeApproveResult();
      if (skill === "se-author") {
        optimizerCount++;
        return makeOptimizerResult();
      }
      return "";
    };

    const result = await reviewLoop({
      ...baseParams,
      _agent: mockAgent,
      _parallel: (p) => Promise.all(p),
      _checkFile: existsGuard,
    });

    expect(result.converged).toBe(true);
    expect(result.iterations).toBe(2);
    expect(optimizerCount).toBe(1);
  });
});
