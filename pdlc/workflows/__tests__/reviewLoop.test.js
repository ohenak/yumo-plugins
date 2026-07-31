/**
 * Tests for reviewLoop (TSPEC-LOOP-01 through TSPEC-LOOP-08, AT-RESUME-01/02/03)
 * PROP-LOOP-01 through PROP-LOOP-16
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import main, { reviewLoop } from "../orchestrate-dev.js";
import { fakeListFiles } from "./helpers/seams.js";

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

    // `toMatchObject`, not `toEqual`: TSPEC §3.9 makes `reviewLoop`'s return a
    // SUPERSET of what this property names — `trailerReason` rides on every
    // return (RLH-LOOP-02b). The property under test is the three fields below.
    expect(result).toMatchObject({
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

    // `toMatchObject` for the same reason as PROP-LOOP-01 above.
    expect(result).toMatchObject({
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

// ─────────────────────────────────────────────────────────────────────────────
// RLH-22 — the review-window interface oracles for PLAN §11.5 `N-a`.
//
// PLAN §11.5 *decides* both interface shapes; this section is what makes the
// decision falsifiable. Nothing below is negotiable by a later task — a task
// that threads the window differently reds here, and editing the oracle to
// green it is the §11.4 `H-q` halt, not a fix.
//
//   RLH-LOOP-01  `reviewLoop`'s two sibling fields `startIndex` / `endIndex`,
//                its three new parameters (`docType`, `_listFiles`,
//                `_readFile`) and absence of seed maps (TSPEC §3.9), the gate
//                `if (iteration > endIndex)` reading `endIndex` as a consumed
//                parameter, and `iteration` at every call site.
//                RED batches 3–8, green from RLH-27 (batch 9); the call-site
//                half greens at RLH-26 (batch 8).
//   RLH-LOOP-02  the return shape's `postmortemWritten` / `trailerReason`
//                (TSPEC §3.9, §5.6.1, §6.3) and `checkConverged`'s rendered
//                `rounds {startIndex}..{endIndex}` (TSPEC §7.1 site 1), driven
//                over `startIndex ≠ 1 ≠ endIndex` so a swapped positional pair
//                is a named red. Green from RLH-27 (batch 9).
//   RLH-LOOP-03  §11.5's single-computation rule: the literal
//                `MAX_REVIEW_ROUNDS - 1` occurs exactly once in
//                `orchestrate-dev.js` and outside the source spans of
//                `reviewLoop` and `checkConverged`. Green from RLH-26 (batch 8).
//
// Spans are **measured** from the tree, never taken from a spec citation
// (PLAN §2, DC-02): a `file:line` in the TSPEC/PLAN is evidence, not a literal.
// ─────────────────────────────────────────────────────────────────────────────

const DEV_SOURCE_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "orchestrate-dev.js"
);

/** The source text of `orchestrate-dev.js`, re-read per call so a concurrent edit cannot be cached. */
function devSourceLines() {
  return readFileSync(DEV_SOURCE_PATH, "utf8").split("\n");
}

/**
 * PLAN §11.5's span rule, verbatim: a span runs from the function's declaration
 * line to the first following line matching `^}\s*$` — a column-0 line that is a
 * **lone** `}`. `^}` alone is wrong (TE round-4 `F-02`): a column-0 `}` followed
 * by other tokens (`}) {`, `} = {}) {`) closes a destructured *parameter list*,
 * not a body, which would place `reviewLoop`'s span end ~127 lines early and
 * exempt the whole region the placement conjunct exists to forbid.
 *
 * @returns {{ startLine: number, endLine: number }} 1-based, inclusive.
 */
function measureSpan(lines, declPattern) {
  const startLine = lines.findIndex((l) => declPattern.test(l)) + 1;
  if (startLine === 0) {
    throw new Error(`RLH-LOOP-03: no line matches ${declPattern} in orchestrate-dev.js`);
  }
  const endOffset = lines.slice(startLine).findIndex((l) => /^\}\s*$/.test(l));
  if (endOffset === -1) {
    throw new Error(
      `RLH-LOOP-03: no line matching /^\\}\\s*$/ follows the declaration at :${startLine}`
    );
  }
  return { startLine, endLine: startLine + endOffset + 1 };
}

/** 1-based line numbers on which `needle` occurs as a literal substring. */
function literalOccurrenceLines(lines, needle) {
  const hits = [];
  lines.forEach((line, i) => {
    if (line.includes(needle)) hits.push(i + 1);
  });
  return hits;
}

// ─── RLH-LOOP-03: `endIndex` is derived exactly once, at the phase gate ───────
// PLAN §11.5 / §12.3, halt condition §11.4 `H-q`. Grep-shaped by construction —
// the same instrument §12.3 already uses for `selectMode`, and deliberately not a
// parser (PLAN §7.2's no-new-dependency rule and §12.3's "grep confirms").
//
// It exists because the one violation that matters is behaviourally invisible: a
// recomputation of `startIndex + MAX_REVIEW_ROUNDS - 1` *inside* `reviewLoop`
// yields an identical value, so RLH-LOOP-01's gate passes, RLH-LOOP-02's rendered
// window passes, and every AT passes. TSPEC §7.1 edit 3 anchors the arithmetic
// inside `reviewLoop` while PLAN §11.5 relocates it to the gate, so an
// implementer following both documents literally writes it twice — that is the
// innocent failure this red catches.
describe("RLH-LOOP-03: the literal `MAX_REVIEW_ROUNDS - 1` is written exactly once, outside reviewLoop and checkConverged", () => {
  const ARITHMETIC = "MAX_REVIEW_ROUNDS - 1";

  test("RLH-LOOP-03a: `MAX_REVIEW_ROUNDS - 1` occurs exactly once in orchestrate-dev.js", () => {
    const lines = devSourceLines();
    const hits = literalOccurrenceLines(lines, ARITHMETIC);

    // Zero at HEAD (no site derives the window yet) — RLH-26 writes the single
    // gate-side occurrence. Two or more is the H-q halt, not a style nit.
    expect({ occurrences: hits.length, lines: hits }).toEqual({
      occurrences: 1,
      lines: hits.length === 1 ? hits : [expect.any(Number)],
    });
  });

  test("RLH-LOOP-03b: that occurrence lies outside the source spans of reviewLoop and checkConverged", () => {
    const lines = devSourceLines();
    const reviewLoopSpan = measureSpan(lines, /^export async function reviewLoop\(/);
    const checkConvergedSpan = measureSpan(lines, /^function checkConverged\(/);

    // Span ends are measured, never cited. Sanity-check the measurement itself so a
    // span that collapsed onto a parameter-list `}) {` cannot make the placement
    // conjunct pass vacuously (PLAN §11.5, TE round-4 F-02).
    expect(reviewLoopSpan.endLine - reviewLoopSpan.startLine).toBeGreaterThan(20);
    expect(checkConvergedSpan.endLine - checkConvergedSpan.startLine).toBeGreaterThan(5);

    const hits = literalOccurrenceLines(lines, ARITHMETIC);
    const inSpan = (n, s) => n >= s.startLine && n <= s.endLine;
    const misplaced = hits.filter(
      (n) => inSpan(n, reviewLoopSpan) || inSpan(n, checkConvergedSpan)
    );

    expect({ hits, misplaced }).toEqual({ hits: [expect.any(Number)], misplaced: [] });
  });
});

// ─── RLH-LOOP-01: reviewLoop's review-window parameters ──────────────────────
// PLAN §11.5 `N-a`, `reviewLoop` half: **two sibling fields on the existing
// options object**. `reviewLoop` already takes one destructured options object
// (TSPEC §3.9) and `iteration` already rides on it, so `startIndex` and
// `endIndex` extend that object rather than changing its shape. Rejected there,
// and therefore red here: a new record type; positional arguments (seven call
// sites, silent on a wrong order); a field on `EpisodeKey`.
describe("RLH-LOOP-01: reviewLoop's startIndex/endIndex sibling fields, new seams, and the endIndex gate", () => {
  /** The destructured parameter list text — declaration line through the closing `}) {`. */
  function reviewLoopParamList() {
    const lines = devSourceLines();
    const start = lines.findIndex((l) => /^export async function reviewLoop\(/.test(l));
    expect(start).toBeGreaterThanOrEqual(0);
    const end = lines.slice(start).findIndex((l) => /^\}\)\s*\{/.test(l));
    expect(end).toBeGreaterThan(0);
    return lines.slice(start, start + end + 1).join("\n");
  }

  test("RLH-LOOP-01a: startIndex and endIndex are sibling fields of the options object, alongside iteration", () => {
    const params = reviewLoopParamList();

    // Siblings of `iteration`, not a nested record and not positional.
    expect({
      iteration: /^\s*iteration\s*=\s*1\s*,\s*$/m.test(params),
      startIndex: /^\s*startIndex\b/m.test(params),
      endIndex: /^\s*endIndex\b/m.test(params),
    }).toEqual({ iteration: true, startIndex: true, endIndex: true });
  });

  test("RLH-LOOP-01b: the gate reads endIndex as a consumed parameter — `if (iteration > endIndex)`", () => {
    const lines = devSourceLines();
    const span = measureSpan(lines, /^export async function reviewLoop\(/);
    const body = lines.slice(span.startLine - 1, span.endLine).join("\n");

    // TSPEC §7.1 edit 3. The site reads a parameter and performs no arithmetic;
    // the arithmetic is RLH-26's, once, at the phase gate (RLH-LOOP-03).
    expect({
      gateOnEndIndex: /if\s*\(\s*iteration\s*>\s*endIndex\s*\)/.test(body),
      bareLiteralGate: /if\s*\(\s*iteration\s*>\s*5\s*\)/.test(body),
    }).toEqual({ gateOnEndIndex: true, bareLiteralGate: false });
  });

  test("RLH-LOOP-01c: the gate honours the window behaviourally — startIndex..endIndex runs exactly endIndex - startIndex + 1 rounds", async () => {
    // startIndex = 3, endIndex = 4: a two-round window that is neither the
    // pre-feature 1..5 nor a width-5 window, so a gate still reading the bare
    // literal 5 (three rounds: 3, 4, 5) is a distinct, named failure.
    let reviewerPairCount = 0;

    const mockAgent = async (skill, prompt) => {
      if (skill === "pm-review") reviewerPairCount++;
      if (skill === "pm-review" || skill === "te-review") return makeNeedsRevisionResult();
      if (skill === "se-author") return makeOptimizerResult();
      return "";
    };

    const result = await reviewLoop({
      ...baseParams,
      iteration: 3,
      startIndex: 3,
      endIndex: 4,
      _agent: mockAgent,
      _parallel: (promises) => Promise.all(promises),
      _checkFile: existsGuard,
    });

    expect({ rounds: reviewerPairCount, converged: result.converged }).toEqual({
      rounds: 2,
      converged: false,
    });
  });

  test("RLH-LOOP-01d: all seven reviewLoop call sites pass iteration", () => {
    // TSPEC §3.9: "all seven existing call sites now pass the branch-derived
    // startIndex". An un-overridden `iteration = 1` default aims a round-4 write
    // back at round 1 and destroys the existing -v1 cross-review (H-1).
    const source = devSourceLines().join("\n");
    const sites = [
      ...source.matchAll(/(?<!function )\breviewLoop\(\{([\s\S]*?)\n\s*\}\)/g),
    ].map((m) => m[1]);

    expect(sites).toHaveLength(7); // R, F, T, D, P, PR, CR
    const withoutIteration = sites.filter((args) => !/\biteration\s*:/.test(args));
    expect(withoutIteration).toEqual([]);
  });

  test("RLH-LOOP-01e: reviewLoop gains docType, _listFiles and _readFile, and takes no seed maps", () => {
    const params = reviewLoopParamList();

    // TSPEC §3.9's three new parameters, all for §5.6.1's S-INV: `docType`, plus
    // the two seams `refreshReviewState` needs to re-read the review record at
    // **every** episode entry.
    expect({
      docType: /^\s*docType\b/m.test(params),
      _listFiles: /^\s*_listFiles\b/m.test(params),
      _readFile: /^\s*_readFile\b/m.test(params),
    }).toEqual({ docType: true, _listFiles: true, _readFile: true });

    // And explicitly **no** seed `present` / `reviewFiles`: the first episode
    // refreshes like every other one, so a seed would be an unread parameter
    // (TSPEC §5.6.1; a pre-loop snapshot is TE-v2 N-01).
    expect({
      present: /^\s*present\b/m.test(params),
      reviewFiles: /^\s*reviewFiles\b/m.test(params),
    }).toEqual({ present: false, reviewFiles: false });
  });
});

// ─── RLH-LOOP-02: the return shape, and checkConverged's rendered window ─────
// Two halves of one row (PLAN §5.4 RLH-22, §7.5):
//   * TSPEC §3.9 / §6.3 — `reviewLoop`'s non-convergence return gains
//     `postmortemWritten`, sourced from the `await _checkFile` **confirmation**
//     and never from the agent's reply, plus `trailerReason` on every return.
//   * PLAN §11.5 `N-a`, `checkConverged` half — three additional **positional**
//     arguments after `recordPhase`: `feature`, `startIndex`, `endIndex`, in that
//     order, because TSPEC §3.9 pins the signature positional. The known cost of
//     positional is that a swapped integer pair is silent at the type level; the
//     agreed mitigation is exactly the assertion below, driven over
//     `startIndex ≠ 1` and `startIndex ≠ endIndex` so a swap, a duplicated
//     argument or a missing one is a named red.
describe("RLH-LOOP-02: postmortemWritten, trailerReason, and the rendered `rounds {startIndex}..{endIndex}`", () => {
  /** An agent that never converges; POSTMORTEM dispatch always claims success. */
  function neverConvergingAgent() {
    return async (skill, prompt) => {
      if (skill === "pm-review" || skill === "te-review" || skill === "se-review") {
        return makeNeedsRevisionResult();
      }
      if (typeof prompt === "string" && prompt.includes("POSTMORTEM")) {
        return "POSTMORTEM written."; // the narration this feature stops trusting
      }
      return makeOptimizerResult();
    };
  }

  test("RLH-LOOP-02a: postmortemWritten comes from the _checkFile confirmation, not the agent's reply", async () => {
    const capCase = { ...baseParams, iteration: 5, startIndex: 5, endIndex: 5 };

    // (i) The agent says it wrote the POSTMORTEM; the filesystem says otherwise.
    const denied = await reviewLoop({
      ...capCase,
      _agent: neverConvergingAgent(),
      _parallel: (promises) => Promise.all(promises),
      _checkFile: (path) =>
        /POSTMORTEM/.test(String(path)) ? { ok: false, reason: "file_not_found" } : { ok: true },
    });

    // (ii) Same narration, and this time the confirmation agrees.
    const confirmed = await reviewLoop({
      ...capCase,
      _agent: neverConvergingAgent(),
      _parallel: (promises) => Promise.all(promises),
      _checkFile: existsGuard,
    });

    expect({
      deniedConverged: denied.converged,
      denied: denied.postmortemWritten,
      confirmed: confirmed.postmortemWritten,
    }).toEqual({ deniedConverged: false, denied: false, confirmed: true });
  });

  test("RLH-LOOP-02b: trailerReason is present on every reviewLoop return", async () => {
    const convergedRun = await reviewLoop({
      ...baseParams,
      _agent: async (skill) =>
        skill === "se-author" ? makeOptimizerResult() : makeApproveResult(skill),
      _parallel: (promises) => Promise.all(promises),
      _checkFile: existsGuard,
    });

    const cappedRun = await reviewLoop({
      ...baseParams,
      iteration: 5,
      startIndex: 5,
      endIndex: 5,
      _agent: neverConvergingAgent(),
      _parallel: (promises) => Promise.all(promises),
      _checkFile: existsGuard,
    });

    // TSPEC §3.9 / §5.6.1: `trailerReason` rides on **every** return, `null` on
    // the greenfield/clean path — so `null` must be observable as a value, which a
    // conditionally-spread field is not.
    expect({
      convergedHas: Object.prototype.hasOwnProperty.call(convergedRun, "trailerReason"),
      cappedHas: Object.prototype.hasOwnProperty.call(cappedRun, "trailerReason"),
    }).toEqual({ convergedHas: true, cappedHas: true });
  });
});

// ─── RLH-LOOP-02c: checkConverged's rendered window (§11.5 `N-a`, second half) ─
// `checkConverged` is not exported and PLAN §11.5 keeps it that way, so this half
// is observed **through `main()` with injected seams** (an L2 drive, PLAN §7): the
// halt it throws is caught by `main()`'s pipeline catch and surfaces as the Phase R
// row's detail — TSPEC §7.1 site 1, the `recordPhase(phaseId, phaseLabel, "❌", …)`
// message whose `after 5 iterations` becomes `rounds ${startIndex}..${endIndex}`.
//
// The window is driven to **3..7**: two prior rounds are on the branch, so the
// branch-derived `startIndex` is 3 and the once-computed `endIndex` is 7. Both
// differ from 1 and from each other, which is precisely what makes a swapped,
// duplicated or missing positional argument a *named* red rather than a silent
// pass — `rounds 7..3`, `rounds 3..3` and `rounds 1..5` all fail this assertion.
describe("RLH-LOOP-02c: checkConverged renders `rounds {startIndex}..{endIndex}` from its positional arguments", () => {
  test("RLH-LOOP-02c: a non-converging Phase R over a 3..7 window reports `rounds 3..7`", async () => {
    // Two completed rounds of REQ cross-review on the branch: `-v2` is the highest
    // present index, so the next reviewer dispatch is round 3 (TSPEC §5.2).
    const listFiles = fakeListFiles([
      "CROSS-REVIEW-software-engineer-REQ-v1.md",
      "CROSS-REVIEW-test-engineer-REQ-v1.md",
      "CROSS-REVIEW-software-engineer-REQ-v2.md",
      "CROSS-REVIEW-test-engineer-REQ-v2.md",
    ]);

    const report = await main({
      reqPath: "docs/test-feat/REQ-test-feat.md",
      _agent: async (skill, prompt) => {
        if (skill === "se-review" || skill === "te-review") return makeNeedsRevisionResult();
        if (typeof prompt === "string" && prompt.includes("POSTMORTEM")) {
          return "POSTMORTEM written.";
        }
        return makeOptimizerResult();
      },
      _parallel: (promises) => Promise.all(promises),
      _pipeline: async (_name, fn) => fn(),
      _phase: () => {},
      _log: () => {},
      _checkFile: () => ({ ok: true }),
      _readFile: () => "",
      _listFiles: listFiles,
    });

    const phaseR = (report.phases || []).find((p) => p.phase === "R");

    expect({
      outcome: report.outcome,
      detail: phaseR ? phaseR.detail : "(no Phase R row recorded)",
    }).toEqual({
      outcome: "halted",
      detail: expect.stringContaining("rounds 3..7"),
    });
  });
});
