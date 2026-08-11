/**
 * Tests for Phase DOD — Definition of Done verification (DOD-01..04).
 * Covers parseDodStatus, dodVerifyLoop, and main() wiring.
 */

import main, {
  parseDodStatus,
  dodVerifyLoop,
  rebaseOntoDefault,
  classifyDodFindings,
  PHASE_DISPATCH,
} from "../orchestrate-dev.js";
import { QUEUE_ROW_DISPOSITIONS } from "../orchestrate-queue.js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

/**
 * Phase P's self-parse gate (PROPOSAL §3.3) refuses a PLAN whose task table the
 * mechanical parser cannot read, so every fixture in this file that must reach
 * Phase I answers the `/PLAN-` read with a parseable one. Scoped to that path
 * deliberately: a blanket answer would also satisfy the
 * `POSTMORTEM-{phase}-{feature}.md` probes the phase gate makes, and a
 * POSTMORTEM with no `RESOLVED: yes` marker refuses the phase for a reason that
 * has nothing to do with the property under test.
 */
const readParseablePlan = (path) =>
  String(path).includes("/PLAN-")
    ? "| Task ID | Description | Batch | Dependencies |\n|---|---|---|---|\n| T1 | first | 1 | - |\n\n| Task | Files |\n|---|---|\n| T1 | \`src/one.js\` |\n"
    : null;


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let logMessages = [];
const originalLog = console.log;

beforeEach(() => {
  logMessages = [];
  console.log = (...args) => logMessages.push(args.join(" "));
});

afterEach(() => {
  console.log = originalLog;
});

// ─── parseDodStatus ──────────────────────────────────────────────────────────
describe("parseDodStatus", () => {
  it("parses a passed status", () => {
    const result = parseDodStatus("All checks pass.\nDOD_STATUS: passed");
    expect(result.status).toBe("passed");
    expect(result.stubs).toBe(0);
    expect(result.coverage_below_threshold).toBe(false);
    expect(result.branch_coverage_pct).toBe(100);
    expect(result.req_gaps).toBe(0);
    expect(result.boundary_gaps).toBe(0);
  });

  it("parses a failed status with JSON detail including req_gaps", () => {
    const input =
      "Found issues.\nDOD_STATUS: failed\n" +
      '{"stubs": 3, "mock_data": 1, "unwired_integrations": 2, "coverage_below_threshold": true, "branch_coverage_pct": 72, "req_gaps": 4}';
    const result = parseDodStatus(input);
    expect(result.status).toBe("failed");
    expect(result.stubs).toBe(3);
    expect(result.mock_data).toBe(1);
    expect(result.unwired_integrations).toBe(2);
    expect(result.coverage_below_threshold).toBe(true);
    expect(result.branch_coverage_pct).toBe(72);
    expect(result.req_gaps).toBe(4);
  });

  it("parses boundary_gaps when present in the JSON detail", () => {
    const input =
      "Found issues.\nDOD_STATUS: failed\n" +
      '{"stubs": 0, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 90, "req_gaps": 1, "boundary_gaps": 3}';
    const result = parseDodStatus(input);
    expect(result.status).toBe("failed");
    expect(result.boundary_gaps).toBe(3);
  });

  it("defaults boundary_gaps to 0 when omitted from JSON (old-format compat)", () => {
    const input =
      "Found issues.\nDOD_STATUS: failed\n" +
      '{"stubs": 1, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 90, "req_gaps": 2}';
    const result = parseDodStatus(input);
    expect(result.boundary_gaps).toBe(0);
  });

  it("clamps negative boundary_gaps to 0", () => {
    const input =
      "DOD_STATUS: failed\n" +
      '{"stubs": 0, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 90, "boundary_gaps": -4}';
    expect(parseDodStatus(input).boundary_gaps).toBe(0);
  });

  it("carries boundary_gaps: 0 on the passed path", () => {
    expect(parseDodStatus("DOD_STATUS: passed").boundary_gaps).toBe(0);
  });

  it("defaults req_gaps to 0 when omitted from JSON", () => {
    const input =
      "Found issues.\nDOD_STATUS: failed\n" +
      '{"stubs": 1, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 90}';
    const result = parseDodStatus(input);
    expect(result.req_gaps).toBe(0);
  });

  it("clamps negative req_gaps to 0", () => {
    const input =
      "DOD_STATUS: failed\n" +
      '{"stubs": 0, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 90, "req_gaps": -2}';
    expect(parseDodStatus(input).req_gaps).toBe(0);
  });

  it("returns failed with zeros when JSON is missing after failed trailer", () => {
    const result = parseDodStatus("DOD_STATUS: failed");
    expect(result.status).toBe("failed");
    expect(result.stubs).toBe(0);
    expect(result.mock_data).toBe(0);
    expect(result.boundary_gaps).toBe(0);
  });

  it("returns failed with zeros when JSON is malformed", () => {
    const result = parseDodStatus("DOD_STATUS: failed\nnot json");
    expect(result.status).toBe("failed");
    expect(result.stubs).toBe(0);
    expect(result.boundary_gaps).toBe(0);
  });

  it("returns unknown for empty/nullish input", () => {
    expect(parseDodStatus("").status).toBe("unknown");
    expect(parseDodStatus(null).status).toBe("unknown");
    expect(parseDodStatus(undefined).status).toBe("unknown");
  });

  it("returns unknown when no trailer present", () => {
    expect(parseDodStatus("All good.").status).toBe("unknown");
  });

  it("returns unknown for unrecognized status value", () => {
    expect(parseDodStatus("DOD_STATUS: maybe").status).toBe("unknown");
  });

  it("finds the last DOD_STATUS line when several are present", () => {
    const input = "DOD_STATUS: failed\nmore text\nDOD_STATUS: passed";
    expect(parseDodStatus(input).status).toBe("passed");
  });

  it("clamps negative integers to zero", () => {
    const input =
      "DOD_STATUS: failed\n" +
      '{"stubs": -1, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": -5}';
    const result = parseDodStatus(input);
    expect(result.stubs).toBe(0);
    expect(result.branch_coverage_pct).toBe(0);
  });

  it("treats non-boolean coverage_below_threshold as false", () => {
    const input =
      "DOD_STATUS: failed\n" +
      '{"stubs": 0, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": "yes", "branch_coverage_pct": 80}';
    const result = parseDodStatus(input);
    expect(result.coverage_below_threshold).toBe(false);
  });
});

// ─── dodVerifyLoop ───────────────────────────────────────────────────────────
describe("dodVerifyLoop", () => {
  it("returns passed on first iteration when dod-verify reports passed", async () => {
    const mockAgent = async (skill) => {
      if (skill === "dod-verify") return "Clean.\nDOD_STATUS: passed";
      return "Fixed.";
    };
    const result = await dodVerifyLoop({
      feature: "test-feat",
      _agent: mockAgent,
      _log: () => {},
    });
    expect(result.passed).toBe(true);
    expect(result.iterations).toBe(1);
  });

  it("remediates and re-verifies on failure, then passes", async () => {
    let verifyCount = 0;
    const mockAgent = async (skill) => {
      if (skill === "dod-verify") {
        verifyCount++;
        if (verifyCount === 1) {
          return (
            "Found stubs.\nDOD_STATUS: failed\n" +
            '{"stubs": 2, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 90}'
          );
        }
        return "Clean.\nDOD_STATUS: passed";
      }
      return "Fixed stubs.";
    };
    const result = await dodVerifyLoop({
      feature: "test-feat",
      _agent: mockAgent,
      _log: () => {},
    });
    expect(result.passed).toBe(true);
    expect(result.iterations).toBe(2);
  });

  it("returns failed after max iterations when violations persist", async () => {
    const mockAgent = async (skill) => {
      if (skill === "dod-verify") {
        return (
          "Stubs remain.\nDOD_STATUS: failed\n" +
          '{"stubs": 1, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 90, "req_gaps": 2}'
        );
      }
      return "Attempted fix.";
    };
    const result = await dodVerifyLoop({
      feature: "test-feat",
      maxIterations: 3,
      _agent: mockAgent,
      _log: () => {},
    });
    expect(result.passed).toBe(false);
    expect(result.iterations).toBe(3);
    expect(result.lastStatus).toBeDefined();
    expect(result.lastStatus.stubs).toBe(1);
    expect(result.lastStatus.req_gaps).toBe(2);
  });

  it("treats unknown/missing DOD_STATUS as failed", async () => {
    let verifyCount = 0;
    const mockAgent = async (skill) => {
      if (skill === "dod-verify") {
        verifyCount++;
        if (verifyCount === 1) return "No trailer here.";
        return "DOD_STATUS: passed";
      }
      return "Fixed.";
    };
    const logs = [];
    const result = await dodVerifyLoop({
      feature: "test-feat",
      _agent: mockAgent,
      _log: (msg) => logs.push(msg),
    });
    expect(result.passed).toBe(true);
    expect(result.iterations).toBe(2);
    expect(logs.some((m) => m.includes("no DOD_STATUS"))).toBe(true);
  });

  it("dispatches se-implement to remediate between verify passes", async () => {
    const skillsCalled = [];
    const mockAgent = async (skill) => {
      skillsCalled.push(skill);
      if (skill === "dod-verify") {
        return (
          "DOD_STATUS: failed\n" +
          '{"stubs": 1, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 90}'
        );
      }
      return "Remediated.";
    };
    await dodVerifyLoop({
      feature: "test-feat",
      maxIterations: 2,
      _agent: mockAgent,
      _log: () => {},
    });
    // iter1: verify(fail) → remediate; iter2: verify(fail) → (max reached, no remediate)
    expect(skillsCalled).toEqual(["dod-verify", "se-implement", "dod-verify"]);
  });

  it("a se-implement remediation dispatch that throws once is retried with the same prompt and recovers silently", async () => {
    const remediateCalls = [];
    const logs = [];
    let remediateAttempt = 0;
    const mockAgent = async (skill, prompt) => {
      if (skill === "dod-verify") {
        return (
          "DOD_STATUS: failed\n" +
          '{"stubs": 1, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 90}'
        );
      }
      remediateAttempt++;
      remediateCalls.push(prompt);
      if (remediateAttempt === 1) throw new Error("dispatch stall-killed");
      return "Remediated.";
    };
    const result = await dodVerifyLoop({
      feature: "test-feat",
      maxIterations: 2,
      _agent: mockAgent,
      _log: (msg) => logs.push(msg),
    });
    // Same prompt both times — a same-episode retry, not a fresh remediation round.
    expect(remediateCalls).toHaveLength(2);
    expect(remediateCalls[0]).toBe(remediateCalls[1]);
    expect(logs.some((m) => /Dispatch fault \(DOD remediation/.test(m))).toBe(true);
    expect(result.iterations).toBe(2);
  });

  it("a se-implement remediation dispatch that throws twice propagates the original error, halting exactly as before this retry existed", async () => {
    const mockAgent = async (skill) => {
      if (skill === "dod-verify") {
        return (
          "DOD_STATUS: failed\n" +
          '{"stubs": 1, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 90}'
        );
      }
      throw new Error("dispatch stall-killed");
    };
    await expect(
      dodVerifyLoop({
        feature: "test-feat",
        maxIterations: 2,
        _agent: mockAgent,
        _log: () => {},
      })
    ).rejects.toThrow("dispatch stall-killed");
  });

  it("a remediation dispatch that succeeds on the first attempt is dispatched exactly once, with no fault notice", async () => {
    let remediateCount = 0;
    const logs = [];
    const mockAgent = async (skill) => {
      if (skill === "dod-verify") {
        return (
          "DOD_STATUS: failed\n" +
          '{"stubs": 1, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 90}'
        );
      }
      remediateCount++;
      return "Remediated.";
    };
    await dodVerifyLoop({
      feature: "test-feat",
      maxIterations: 2,
      _agent: mockAgent,
      _log: (msg) => logs.push(msg),
    });
    expect(remediateCount).toBe(1);
    expect(logs.some((m) => /Dispatch fault/.test(m))).toBe(false);
  });

  it("the remediator reads the matching CODE_REVIEW version", async () => {
    const remediatePrompts = [];
    const mockAgent = async (skill, prompt) => {
      if (skill === "dod-verify") {
        return (
          "DOD_STATUS: failed\n" +
          '{"stubs": 1, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 90}'
        );
      }
      if (skill === "se-implement") remediatePrompts.push(prompt);
      return "Remediated.";
    };
    await dodVerifyLoop({
      feature: "test-feat",
      maxIterations: 3,
      _agent: mockAgent,
      _log: () => {},
    });
    // Two remediation rounds (after v1 and v2), each pointed at its own CODE_REVIEW version.
    expect(remediatePrompts).toHaveLength(2);
    expect(remediatePrompts[0]).toContain("CODE_REVIEW-test-feat-v1.md");
    expect(remediatePrompts[1]).toContain("CODE_REVIEW-test-feat-v2.md");
  });

  it("dod-verify is asked to document (not fix) a versioned CODE_REVIEW", async () => {
    const verifyPrompts = [];
    const mockAgent = async (skill, prompt) => {
      if (skill === "dod-verify") {
        verifyPrompts.push(prompt);
        return "Clean.\nDOD_STATUS: passed";
      }
      return "Unexpected.";
    };
    await dodVerifyLoop({ feature: "test-feat", _agent: mockAgent, _log: () => {} });
    expect(verifyPrompts[0]).toContain("CODE_REVIEW-test-feat-v1.md");
    expect(verifyPrompts[0]).toMatch(/Do NOT fix/i);
  });

  it("v1 verify prompt is the full scan; v2 is a delta re-verify referencing v1 and diff-only scanning", async () => {
    const verifyPrompts = [];
    let verifyCount = 0;
    const mockAgent = async (skill) => {
      if (skill === "dod-verify") {
        verifyCount++;
        // Return the prompt-driving verdict; capture happens below by index.
        if (verifyCount === 1) {
          return (
            "Found.\nDOD_STATUS: failed\n" +
            '{"stubs": 1, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 90}'
          );
        }
        return "Clean.\nDOD_STATUS: passed";
      }
      return "Remediated.";
    };
    // Wrap to capture the actual verify prompts.
    const capturing = async (skill, prompt) => {
      if (skill === "dod-verify") verifyPrompts.push(prompt);
      return mockAgent(skill, prompt);
    };
    await dodVerifyLoop({ feature: "test-feat", _agent: capturing, _log: () => {} });

    // v1 — full five-criteria scan, no re-verify language.
    expect(verifyPrompts[0]).toContain("Read the specs first");
    expect(verifyPrompts[0]).toContain("CODE_REVIEW-test-feat-v1.md");
    expect(verifyPrompts[0]).not.toMatch(/re-verification/i);

    // v2 — delta re-verify: reads v1's CODE_REVIEW, scans only the remediation diff.
    expect(verifyPrompts[1]).toMatch(/re-verification round v2/i);
    expect(verifyPrompts[1]).toContain("CODE_REVIEW-test-feat-v1.md");
    expect(verifyPrompts[1]).toContain("CODE_REVIEW-test-feat-v2.md");
    expect(verifyPrompts[1]).toMatch(/git diff/);
    expect(verifyPrompts[1]).toMatch(/ONLY that diff/);
    expect(verifyPrompts[1]).toMatch(/Do NOT fix/i);
  });
});

// ─── rebaseOntoDefault ───────────────────────────────────────────────────────
describe("rebaseOntoDefault", () => {
  it("returns clean when ship-pr reports a clean rebase", async () => {
    const agent = async (skill) =>
      skill === "ship-pr" ? "Rebased.\nREBASE_STATUS: clean" : "x";
    const status = await rebaseOntoDefault({
      feature: "test-feat",
      _agent: agent,
      _log: () => {},
    });
    expect(status).toBe("clean");
  });

  it("returns conflict when ship-pr reports a rebase conflict", async () => {
    const agent = async () => "Conflicts: a.ts\nREBASE_STATUS: conflict";
    const status = await rebaseOntoDefault({
      feature: "test-feat",
      _agent: agent,
      _log: () => {},
    });
    expect(status).toBe("conflict");
  });
});

// ─── main() wiring ──────────────────────────────────────────────────────────
describe("Phase DOD wiring in main()", () => {
  function makeSuccessAgent() {
    return async (skill, prompt) => {
      if (skill === "guard") return { ok: true };
      if (["se-review", "te-review", "pm-review"].includes(skill)) {
        return 'Review.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
      }
      if (["pm-author", "se-author", "te-author"].includes(skill)) {
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
        if (prompt.includes("Rebase the feature branch")) {
          return "Rebased.\nREBASE_STATUS: clean";
        }
        if (prompt.includes("Raise a pull request")) {
          return "PR opened.\nPR_URL: https://github.com/acme/repo/pull/42";
        }
        return "Checks.\nCI_STATUS: passed";
      }
      return "Success.";
    };
  }

  const baseArgs = () => ({
    reqPath: "docs/test-feat/REQ-test-feat.md",
    _readFile: readParseablePlan,
    _agent: makeSuccessAgent(),
    _parallel: (p) => Promise.all(p),
    _checkFile: () => ({ ok: true }),
    _phase: () => {},
    _pipeline: async (l, fn) => fn(),
    _mergeWorktree: async () => ({ ok: true }),
    _raisePrAndVerifyCi: async () => ({ prUrl: "https://x/pull/1", ciStatus: "passed" }),
  });

  it("success run records Phase DOD as passed", async () => {
    const result = await main(baseArgs());
    expect(result.outcome).toBe("success");
    const dod = result.phases.find((p) => p.phase === "DOD");
    expect(dod).toBeTruthy();
    expect(dod.status).toBe("✅");
  });

  it("halts the pipeline when DoD verification fails", async () => {
    const result = await main({
      ...baseArgs(),
      _dodVerifyLoop: async () => ({
        passed: false,
        iterations: 3,
        lastStatus: {
          stubs: 2,
          mock_data: 0,
          unwired_integrations: 1,
          coverage_below_threshold: true,
          req_gaps: 3,
        },
      }),
    });
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toMatch(/Phase DOD failed/);
    expect(result.haltReason).toMatch(/Definition of Done not met/);
    const dod = result.phases.find((p) => p.phase === "DOD");
    expect(dod).toBeTruthy();
    expect(dod.status).toBe("❌");
  });

  it("halts in Phase DOD when the rebase onto default branch conflicts", async () => {
    let dodCalled = false;
    const result = await main({
      ...baseArgs(),
      _rebaseOntoDefault: async () => "conflict",
      _dodVerifyLoop: async () => {
        dodCalled = true;
        return { passed: true, iterations: 1 };
      },
    });
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toMatch(/rebase conflict/);
    expect(dodCalled).toBe(false); // verification must not run after a conflicted rebase
    const dod = result.phases.find((p) => p.phase === "DOD");
    expect(dod.status).toBe("❌");
  });

  it("rebases onto the default branch before verifying (DOD step 0)", async () => {
    const order = [];
    await main({
      ...baseArgs(),
      _rebaseOntoDefault: async () => {
        order.push("rebase");
        return "clean";
      },
      _dodVerifyLoop: async () => {
        order.push("verify");
        return { passed: true, iterations: 1 };
      },
    });
    expect(order).toEqual(["rebase", "verify"]);
  });

  it("skips Phase DOD when disabled", async () => {
    let dodCalled = false;
    const result = await main({
      ...baseArgs(),
      _phaseDodEnabled: false,
      _dodVerifyLoop: async () => {
        dodCalled = true;
        throw new Error("dodVerifyLoop must not be called when disabled");
      },
    });
    expect(dodCalled).toBe(false);
    expect(result.outcome).toBe("success");
    const dod = result.phases.find((p) => p.phase === "DOD");
    expect(dod).toBeTruthy();
    expect(dod.status).toBe("⏭");
  });

  it("Phase DOD runs after Phase CR and before Phase H", async () => {
    const result = await main(baseArgs());
    expect(result.outcome).toBe("success");
    const phaseIds = result.phases.map((p) => p.phase);
    const crIdx = phaseIds.indexOf("CR");
    const dodIdx = phaseIds.indexOf("DOD");
    const hIdx = phaseIds.indexOf("H");
    expect(crIdx).toBeGreaterThanOrEqual(0);
    expect(dodIdx).toBeGreaterThanOrEqual(0);
    expect(hIdx).toBeGreaterThanOrEqual(0);
    expect(dodIdx).toBeGreaterThan(crIdx);
    expect(dodIdx).toBeLessThan(hIdx);
  });

  it("passes injected _dodVerifyLoop and surfaces its result", async () => {
    let called = false;
    const result = await main({
      ...baseArgs(),
      _dodVerifyLoop: async ({ feature }) => {
        called = true;
        expect(feature).toBe("test-feat");
        return { passed: true, iterations: 1 };
      },
    });
    expect(called).toBe(true);
    expect(result.outcome).toBe("success");
  });
});

// ─── RLH-REPORT-01: buildFinalReport's widened field list (TSPEC §4.7) ───────
// TSPEC §8.3's closing paragraph lists this suite as "unaffected in behaviour;
// affected by buildFinalReport's widened field list". Nothing about Phase DOD's
// behaviour is asserted here — only that the report this suite already drives
// main() to build carries the four fields §4.7 adds to buildFinalReport's
// destructured list, each within its stated domain.
// PLAN §7.3: written at batch 2, green from batch 10 (RLH-30); red 2–9.
describe("RLH-REPORT-01-dod", () => {
  const REPORT_FIELDS_4_7 = [
    "haltPhase",
    "postmortemPath",
    "postmortemStatus",
    "queueRow",
  ];
  const POSTMORTEM_STATUS_DOMAIN = [
    "written",
    "write_failed",
    "unresolved",
    "none",
  ];
  // Real catalogue (orchestrate-queue.js QUEUE_ROW_DISPOSITIONS), not a local
  // transcription — an import keeps this assertion falsifiable across renames.
  const QUEUE_ROW_DOMAIN = QUEUE_ROW_DISPOSITIONS;

  const successAgent = async (skill, prompt) => {
    if (["se-review", "te-review", "pm-review"].includes(skill)) {
      return 'Review.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
    }
    if (["pm-author", "se-author", "te-author"].includes(skill)) {
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
    if (skill === "dod-verify") return "Clean.\nDOD_STATUS: passed";
    if (skill === "ship-pr") {
      if (prompt.includes("Rebase the feature branch")) {
        return "Rebased.\nREBASE_STATUS: clean";
      }
      if (prompt.includes("Raise a pull request")) {
        return "PR opened.\nPR_URL: https://github.com/acme/repo/pull/42";
      }
      return "Checks.\nCI_STATUS: passed";
    }
    return "Success.";
  };

  const args = () => ({
    reqPath: "docs/test-feat/REQ-test-feat.md",
    _readFile: readParseablePlan,
    _agent: successAgent,
    _parallel: (p) => Promise.all(p),
    _checkFile: () => ({ ok: true }),
    _phase: () => {},
    _pipeline: async (l, fn) => fn(),
    _mergeWorktree: async () => ({ ok: true }),
    _raisePrAndVerifyCi: async () => ({
      prUrl: "https://x/pull/1",
      ciStatus: "passed",
    }),
  });

  it("RLH-REPORT-01-dod: the final report carries §4.7's four new fields, each in its domain", async () => {
    const result = await main(args());
    expect(result.outcome).toBe("success");

    expect(Object.keys(result)).toEqual(
      expect.arrayContaining(REPORT_FIELDS_4_7)
    );

    // §4.7: haltPhase is null when the run did not halt — that field alone
    // distinguishes a halt from a clean run.
    expect(result.haltPhase).toBeNull();
    expect(POSTMORTEM_STATUS_DOMAIN).toContain(result.postmortemStatus);
    expect(QUEUE_ROW_DOMAIN).toContain(result.queueRow);
    // §4.7: postmortemPath is populated whenever postmortemStatus is
    // "unresolved", and is null otherwise.
    if (result.postmortemStatus === "unresolved") {
      expect(typeof result.postmortemPath).toBe("string");
    } else {
      expect(result.postmortemPath).toBeNull();
    }
  });
});

// ─── Static guarantees ──────────────────────────────────────────────────────
describe("Phase DOD static guarantees", () => {
  const scriptPath = resolve(__dirname, "../orchestrate-dev.js");

  it("declares the PHASE_DOD_ENABLED compile-time boolean flag", () => {
    const content = readFileSync(scriptPath, "utf8");
    expect(content).toMatch(/const PHASE_DOD_ENABLED = (true|false)/);
  });

  it("declares the DOD_MAX_ITERATIONS constant", () => {
    const content = readFileSync(scriptPath, "utf8");
    expect(content).toMatch(/const DOD_MAX_ITERATIONS = \d+/);
  });

  it("PHASE_DISPATCH includes DOD entry with dod-verify verifier and se-implement remediator", () => {
    const content = readFileSync(scriptPath, "utf8");
    expect(content).toContain('"dod-verify"');
    expect(content).toContain('phase: "DOD"');
    // DOD phase is an evaluator→optimizer loop: dod-verify documents, se-implement fixes.
    const dodBlock = content.slice(
      content.indexOf('phase: "DOD"'),
      content.indexOf("}", content.indexOf('phase: "DOD"')) + 1
    );
    expect(dodBlock).toContain('remediator: "se-implement"');
  });

  it("dod-verify SKILL.md exists and documents the DOD_STATUS trailer", () => {
    const skillPath = resolve(__dirname, "../../skills/dod-verify/SKILL.md");
    const content = readFileSync(skillPath, "utf8");
    expect(content.length).toBeGreaterThan(0);
    expect(content).toContain("DOD_STATUS:");
    expect(content).toContain("name: dod-verify");
  });

  it("dod-verify SKILL.md documents all six DoD criteria", () => {
    const skillPath = resolve(__dirname, "../../skills/dod-verify/SKILL.md");
    const content = readFileSync(skillPath, "utf8");
    expect(content).toContain("No Stubs in Production Code");
    expect(content).toContain("All Integrations Wired");
    expect(content).toContain("No Mock/Fake Data in Production Code");
    expect(content).toContain("Branch Coverage");
    expect(content).toContain("85%");
    expect(content).toContain("property-based");
    // Criterion 5: requirements traceability, hardened with final-artifact tracing
    expect(content).toContain("Requirements Delivered");
    expect(content).toContain("req_gaps");
    expect(content).toContain("REQ");
    expect(content).toContain("FSPEC");
    expect(content).toContain("PROPERTIES");
    expect(content).toContain("final operator-visible artifact");
    // Criterion 6: integration-boundary integrity (both checks) + trailer key
    expect(content).toContain("The Six DoD Criteria");
    expect(content).toContain("Integration-Boundary Integrity");
    expect(content).toContain("Adjacent-surface falsification");
    expect(content).toContain("Deferral binding");
    expect(content).toContain("boundary_gaps");
  });

  it("dod-verify SKILL.md has constructive verifier persona", () => {
    const skillPath = resolve(__dirname, "../../skills/dod-verify/SKILL.md");
    const content = readFileSync(skillPath, "utf8");
    // Must establish an evidence-based verification mindset — not a passive scanner
    expect(content).toContain("## Persona: The Constructive Verifier");
    expect(content).toMatch(/evidence|test that could fail|file and line/i);
    expect(content).not.toMatch(/hostile|burden of proof/i);
  });

  it("dodVerifyPrompt includes req_gaps and boundary_gaps in the trailer instruction", () => {
    const content = readFileSync(scriptPath, "utf8");
    const start = content.indexOf("function dodVerifyPrompt");
    const nextFn = content.indexOf("\nfunction ", start + 1);
    const promptFn = content.slice(start, nextFn > start ? nextFn : start + 4000);
    expect(promptFn).toContain("req_gaps");
    expect(promptFn).toContain("REQ");
    expect(promptFn).toContain("FSPEC");
    expect(promptFn).toContain("PROPERTIES");
    // Criterion 5 hardening + criterion 6 (both checks) present in the scan instruction
    expect(promptFn).toMatch(/final operator-visible artifact/i);
    expect(promptFn).toContain("boundary_gaps");
    expect(promptFn).toContain("Adjacent-surface falsification");
    expect(promptFn).toContain("Deferral binding");
  });

  it("parseDodStatus returns req_gaps and boundary_gaps fields on passed and failed statuses", () => {
    const content = readFileSync(scriptPath, "utf8");
    // req_gaps/boundary_gaps must appear in the passed-return and failed-return of parseDodStatus
    expect(content).toMatch(/req_gaps.*0/); // passed returns 0
    expect(content).toMatch(/boundary_gaps.*0/); // passed returns 0
  });
});

// ─── DOD remediation routing (2026-08-11) ─────────────────────────────────────
//
// Phase DOD used to dispatch `se-implement` for every CODE_REVIEW finding
// regardless of target, so a documentation erratum reached a TDD implementation
// skill. These pin the classifier's grammar and the loop's dispatch.

/** A CODE_REVIEW carrying exactly the rows given, in the shipped §1 grammar. */
const codeReviewWith = (rows) =>
  "# CODE REVIEW — test-feat (v1)\n\n## §1 Code Quality Findings\n\n" +
  "| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |\n" +
  "|---|---|---|---|---|---|---|\n" +
  rows.join("\n") +
  "\n\nDOD_STATUS: failed\n";

describe("classifyDodFindings", () => {
  it("routes a finding whose Required fix carries `ERRATUM: FSPEC:` to FSPEC, not to code", () => {
    const text = codeReviewWith([
      "| **L1** | 6(a) | medium | `docs/test-feat/FSPEC-test-feat.md:425` | §3.3 describes a pair that no longer exists | `ERRATUM: FSPEC:` — re-anchor §3.3 to v2.8 | Local |",
    ]);
    const { docFindings, codeFindings } = classifyDodFindings(text, "test-feat");
    expect([...docFindings.keys()]).toEqual(["FSPEC"]);
    expect(docFindings.get("FSPEC")).toHaveLength(1);
    expect(docFindings.get("FSPEC")[0].id).toBe("L1");
    expect(docFindings.get("FSPEC")[0].docType).toBe("FSPEC");
    expect(codeFindings).toEqual([]);
  });

  it("the erratum marker wins even when File:Line cites production code", () => {
    // The reviewer stating the routing explicitly outranks the citation: the
    // defect is that the DOCUMENT disagrees with the code the cell points at.
    const text = codeReviewWith([
      "| E1 | 6(a) | medium | `pdlc/workflows/consolidate-learnings.js:672` | the REQ's AC-6.1 contradicts this line | `ERRATUM: REQ:` — restate AC-6.1 | Local |",
    ]);
    const { docFindings, codeFindings } = classifyDodFindings(text, "test-feat");
    expect([...docFindings.keys()]).toEqual(["REQ"]);
    expect(codeFindings).toEqual([]);
  });

  it("routes on File:Line alone when it targets docs/{feature}/TSPEC-{feature}.md", () => {
    const text = codeReviewWith([
      "| T1 | 6(a) | low | `docs/test-feat/TSPEC-test-feat.md:88` | §7.2 names a seam that was renamed | Update §7.2 to the shipped name | Local |",
    ]);
    const { docFindings, codeFindings } = classifyDodFindings(text, "test-feat");
    expect([...docFindings.keys()]).toEqual(["TSPEC"]);
    expect(codeFindings).toEqual([]);
  });

  it("a workflow-source finding stays a code finding", () => {
    const text = codeReviewWith([
      "| C1 | 1 (stub) | high | `pdlc/workflows/orchestrate-dev.js:120` | `throw new Error(\"TODO\")` | Implement per TSPEC §3.2 | Local |",
    ]);
    const { docFindings, codeFindings } = classifyDodFindings(text, "test-feat");
    expect(docFindings.size).toBe(0);
    expect(codeFindings.map((f) => f.id)).toEqual(["C1"]);
  });

  it("a SKILL.md finding stays a code finding — a skill prompt is shipped source, not a spec document", () => {
    const text = codeReviewWith([
      "| S1 | 6(a) | medium | `pdlc/skills/consolidate-learnings/SKILL.md:63` | SKILL promises a filename the module cannot produce | Correct the SKILL to `{passId}` | Local |",
    ]);
    const { docFindings, codeFindings } = classifyDodFindings(text, "test-feat");
    expect(docFindings.size).toBe(0);
    expect(codeFindings.map((f) => f.id)).toEqual(["S1"]);
  });

  it("a cell mixing a spec document with production code stays a code finding", () => {
    const text = codeReviewWith([
      "| M1 | 6(a) | medium | `docs/test-feat/FSPEC-test-feat.md:12`, `pdlc/workflows/orchestrate-dev.js:34` | both disagree | Fix both | Local |",
    ]);
    const { codeFindings, docFindings } = classifyDodFindings(text, "test-feat");
    expect(docFindings.size).toBe(0);
    expect(codeFindings.map((f) => f.id)).toEqual(["M1"]);
  });

  it("another feature's spec document is not routed to this feature's author", () => {
    const text = codeReviewWith([
      "| X1 | 6(a) | low | `docs/other-feat/FSPEC-other-feat.md:5` | stale | Re-anchor | Cross-Feature |",
    ]);
    const { docFindings, codeFindings } = classifyDodFindings(text, "test-feat");
    expect(docFindings.size).toBe(0);
    expect(codeFindings.map((f) => f.id)).toEqual(["X1"]);
  });

  it("§2's requirements-traceability table is not a findings table", () => {
    const text =
      "## §2 Requirements Traceability\n\n" +
      "| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |\n" +
      "|---|---|---|---|---|---|---|---|\n" +
      "| 1 | REQ AC-03 | retry on 429 | docs/test-feat/FSPEC-test-feat.md:9 | Not found | YES | high | Local |\n";
    const { docFindings, codeFindings } = classifyDodFindings(text, "test-feat");
    expect(docFindings.size).toBe(0);
    expect(codeFindings).toEqual([]);
  });

  it("a findings table quoted inside a code fence fabricates nothing", () => {
    const text =
      "Template:\n\n```markdown\n" +
      "| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |\n" +
      "|---|---|---|---|---|---|---|\n" +
      "| 1 | Stub | high | src/foo.ts:42 | TODO | `ERRATUM: FSPEC:` example | Local |\n" +
      "```\n";
    const { docFindings, codeFindings } = classifyDodFindings(text, "test-feat");
    expect(docFindings.size).toBe(0);
    expect(codeFindings).toEqual([]);
  });

  it("an unreadable, empty or table-free CODE_REVIEW classifies as nothing at all", () => {
    for (const input of ["", null, undefined, "### F1 — prose finding\nNo table here.\n"]) {
      const { docFindings, codeFindings } = classifyDodFindings(input, "test-feat");
      expect(docFindings.size).toBe(0);
      expect(codeFindings).toEqual([]);
    }
  });

  it("doc findings iterate in pipeline order, not table order", () => {
    const text = codeReviewWith([
      "| P1 | 6(a) | low | `docs/test-feat/PROPERTIES-test-feat.md:3` | stale | fix | Local |",
      "| R1 | 6(a) | low | `docs/test-feat/REQ-test-feat.md:3` | stale | fix | Local |",
      "| F1 | 6(a) | low | `docs/test-feat/FSPEC-test-feat.md:3` | stale | fix | Local |",
    ]);
    const { docFindings } = classifyDodFindings(text, "test-feat");
    expect([...docFindings.keys()]).toEqual(["REQ", "FSPEC", "PROPERTIES"]);
  });

  it("the shipped grammar reads the real v6 CODE_REVIEW: L1 is an FSPEC finding", () => {
    // The corpus this routing was designed against. v6's sole finding is the
    // documentation erratum that was dispatched to se-implement on 2026-08-11.
    const corpus = resolve(
      __dirname,
      "../../../docs/pdlc-consolidation-agent/CODE_REVIEW-pdlc-consolidation-agent-v6.md"
    );
    const { docFindings, codeFindings } = classifyDodFindings(
      readFileSync(corpus, "utf8"),
      "pdlc-consolidation-agent"
    );
    expect([...docFindings.keys()]).toEqual(["FSPEC"]);
    expect(docFindings.get("FSPEC").map((f) => f.id)).toEqual(["L1"]);
    expect(codeFindings).toEqual([]);
  });

  it("the shipped grammar reads the real v5 CODE_REVIEW: both findings are code findings", () => {
    const corpus = resolve(
      __dirname,
      "../../../docs/pdlc-consolidation-agent/CODE_REVIEW-pdlc-consolidation-agent-v5.md"
    );
    const { docFindings, codeFindings } = classifyDodFindings(
      readFileSync(corpus, "utf8"),
      "pdlc-consolidation-agent"
    );
    expect(docFindings.size).toBe(0);
    // K1's Required fix mentions "raise it as an **ERRATUM** against REQ AC-6.1"
    // but carries no `ERRATUM: REQ:` marker — a suggestion is not a routing.
    expect(codeFindings.map((f) => f.id)).toEqual(["K1", "K2"]);
  });
});

describe("dodVerifyLoop — remediation routes by target", () => {
  /** dod-verify always fails; every other skill records its dispatch. */
  const routingAgent = (dispatches) => async (skill, prompt) => {
    dispatches.push({ skill, prompt });
    if (skill === "dod-verify") {
      return (
        "DOD_STATUS: failed\n" +
        '{"stubs": 0, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 90, "req_gaps": 0, "boundary_gaps": 1}'
      );
    }
    return "Done.";
  };

  it("a doc-only CODE_REVIEW dispatches the document's author and NOT se-implement", async () => {
    const dispatches = [];
    await dodVerifyLoop({
      feature: "test-feat",
      maxIterations: 2,
      _agent: routingAgent(dispatches),
      _log: () => {},
      _readFile: async () =>
        codeReviewWith([
          "| L1 | 6(a) | medium | `docs/test-feat/FSPEC-test-feat.md:425` | §3.3 is false at HEAD | `ERRATUM: FSPEC:` — re-anchor §3.3 | Local |",
        ]),
    });
    expect(dispatches.map((d) => d.skill)).toEqual(["dod-verify", "pm-author", "dod-verify"]);
    const doc = dispatches[1];
    expect(doc.prompt).toContain("docs/test-feat/FSPEC-test-feat.md");
    expect(doc.prompt).toContain("L1");
    expect(doc.prompt).toMatch(/Do NOT write production code/);
    expect(doc.prompt).toMatch(/targeted, versioned edit/);
  });

  it("a TSPEC finding goes to se-author and a PROPERTIES finding to te-author", async () => {
    for (const [docType, skill] of [
      ["REQ", "pm-author"],
      ["TSPEC", "se-author"],
      ["DECISIONS", "se-author"],
      ["PLAN", "se-author"],
      ["PROPERTIES", "te-author"],
    ]) {
      const dispatches = [];
      await dodVerifyLoop({
        feature: "test-feat",
        maxIterations: 2,
        _agent: routingAgent(dispatches),
        _log: () => {},
        _readFile: async () =>
          codeReviewWith([
            `| D1 | 6(a) | medium | \`docs/test-feat/${docType}-test-feat.md:1\` | stale | fix it | Local |`,
          ]),
      });
      expect(dispatches.map((d) => d.skill)).toEqual(["dod-verify", skill, "dod-verify"]);
    }
  });

  it("the docType→skill table is DERIVED from PHASE_DISPATCH, not a second copy", () => {
    // If PHASE_DISPATCH's owners move, the routing must move with them.
    expect(PHASE_DISPATCH.R.creator ?? PHASE_DISPATCH.R.optimizer).toBe("pm-author");
    expect(PHASE_DISPATCH.F.creator).toBe("pm-author");
    expect(PHASE_DISPATCH.T.creator).toBe("se-author");
    expect(PHASE_DISPATCH.D.creator).toBe("se-author");
    expect(PHASE_DISPATCH.P.creator).toBe("se-author");
    expect(PHASE_DISPATCH.PR.creator).toBe("te-author");
    const content = readFileSync(
      resolve(__dirname, "../orchestrate-dev.js"),
      "utf8"
    );
    expect(content).toMatch(
      /function dodDocAuthorSkill\(docType\) \{[\s\S]*PHASE_DISPATCH\[ERRATUM_PHASE_BY_DOC_TYPE\[docType\]\]/
    );
  });

  it("a mixed CODE_REVIEW dispatches BOTH the document author and se-implement, doc first", async () => {
    const dispatches = [];
    await dodVerifyLoop({
      feature: "test-feat",
      maxIterations: 2,
      _agent: routingAgent(dispatches),
      _log: () => {},
      _readFile: async () =>
        codeReviewWith([
          "| L1 | 6(a) | medium | `docs/test-feat/FSPEC-test-feat.md:425` | stale | `ERRATUM: FSPEC:` — re-anchor | Local |",
          "| C1 | 1 (stub) | high | `pdlc/workflows/foo.js:9` | TODO in `parse()` | Implement per TSPEC §3.2 | Local |",
        ]),
    });
    expect(dispatches.map((d) => d.skill)).toEqual([
      "dod-verify",
      "pm-author",
      "se-implement",
      "dod-verify",
    ]);
    // se-implement is told which findings are someone else's, so it neither
    // improvises a document edit nor silently drops the row.
    expect(dispatches[2].prompt).toContain("EXCLUDED from your scope");
    expect(dispatches[2].prompt).toContain("L1 (FSPEC)");
  });

  it("a code-only CODE_REVIEW produces the byte-identical se-implement dispatch", async () => {
    const withReview = [];
    await dodVerifyLoop({
      feature: "test-feat",
      maxIterations: 2,
      _agent: routingAgent(withReview),
      _log: () => {},
      _readFile: async () =>
        codeReviewWith([
          "| C1 | 1 (stub) | high | `pdlc/workflows/foo.js:9` | TODO in `parse()` | Implement per TSPEC §3.2 | Local |",
        ]),
    });

    // The pre-routing baseline: no CODE_REVIEW readable at all.
    const baseline = [];
    await dodVerifyLoop({
      feature: "test-feat",
      maxIterations: 2,
      _agent: routingAgent(baseline),
      _log: () => {},
      _readFile: async () => null,
    });

    expect(withReview.map((d) => d.skill)).toEqual(baseline.map((d) => d.skill));
    expect(withReview.map((d) => d.skill)).toEqual([
      "dod-verify",
      "se-implement",
      "dod-verify",
    ]);
    const remediation = withReview.find((d) => d.skill === "se-implement");
    expect(remediation.prompt).toBe(baseline.find((d) => d.skill === "se-implement").prompt);
    expect(remediation.prompt).not.toContain("EXCLUDED from your scope");
  });

  it("a _readFile that throws degrades to the pre-routing se-implement dispatch", async () => {
    const dispatches = [];
    await dodVerifyLoop({
      feature: "test-feat",
      maxIterations: 2,
      _agent: routingAgent(dispatches),
      _log: () => {},
      _readFile: async () => {
        throw new Error("ENOENT");
      },
    });
    expect(dispatches.map((d) => d.skill)).toEqual([
      "dod-verify",
      "se-implement",
      "dod-verify",
    ]);
  });

  it("a document-remediation dispatch that throws once is retried with the same prompt", async () => {
    const docPrompts = [];
    const logs = [];
    let attempt = 0;
    const mockAgent = async (skill, prompt) => {
      if (skill === "dod-verify") {
        return (
          "DOD_STATUS: failed\n" +
          '{"stubs": 0, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 90}'
        );
      }
      docPrompts.push(prompt);
      attempt++;
      if (attempt === 1) throw new Error("dispatch stall-killed");
      return "Edited.";
    };
    await dodVerifyLoop({
      feature: "test-feat",
      maxIterations: 2,
      _agent: mockAgent,
      _log: (m) => logs.push(m),
      _readFile: async () =>
        codeReviewWith([
          "| L1 | 6(a) | medium | `docs/test-feat/FSPEC-test-feat.md:425` | stale | `ERRATUM: FSPEC:` — re-anchor | Local |",
        ]),
    });
    expect(docPrompts).toHaveLength(2);
    expect(docPrompts[0]).toBe(docPrompts[1]);
    expect(logs.some((m) => /Dispatch fault \(DOD FSPEC remediation/.test(m))).toBe(true);
  });

  it("the routed dispatch is announced by doc type and owning skill", async () => {
    const logs = [];
    await dodVerifyLoop({
      feature: "test-feat",
      maxIterations: 2,
      _agent: routingAgent([]),
      _log: (m) => logs.push(m),
      _readFile: async () =>
        codeReviewWith([
          "| L1 | 6(a) | medium | `docs/test-feat/FSPEC-test-feat.md:425` | stale | `ERRATUM: FSPEC:` — re-anchor | Local |",
        ]),
    });
    expect(
      logs.some((m) => /Dispatching FSPEC document remediation to pm-author/.test(m))
    ).toBe(true);
  });

  it("main() hands Phase DOD the pipeline's read seam", () => {
    const content = readFileSync(resolve(__dirname, "../orchestrate-dev.js"), "utf8");
    const call = content.slice(
      content.indexOf("await dodVerifyLoopFn({"),
      content.indexOf("});", content.indexOf("await dodVerifyLoopFn({"))
    );
    expect(call).toContain("_readFile: readFileFn");
  });
});
