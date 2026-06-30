/**
 * Tests for Phase DOD — Definition of Done verification (DOD-01..04).
 * Covers parseDodStatus, dodVerifyLoop, and main() wiring.
 */

import main, {
  parseDodStatus,
  dodVerifyLoop,
  rebaseOntoDefault,
} from "../orchestrate-dev.js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createGuardAgentDouble } from "./helpers/guardAgentDouble.js";

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
  });

  it("returns failed with zeros when JSON is malformed", () => {
    const result = parseDodStatus("DOD_STATUS: failed\nnot json");
    expect(result.status).toBe("failed");
    expect(result.stubs).toBe(0);
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
    _agent: makeSuccessAgent(),
    _parallel: (p) => Promise.all(p),
    _guardAgent: createGuardAgentDouble({ ok: true }),
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

  it("dod-verify SKILL.md documents all five DoD criteria", () => {
    const skillPath = resolve(__dirname, "../../skills/dod-verify/SKILL.md");
    const content = readFileSync(skillPath, "utf8");
    expect(content).toContain("No Stubs in Production Code");
    expect(content).toContain("All Integrations Wired");
    expect(content).toContain("No Mock/Fake Data in Production Code");
    expect(content).toContain("Branch Coverage");
    expect(content).toContain("85%");
    expect(content).toContain("property-based");
    // Criterion 5: requirements traceability
    expect(content).toContain("Requirements Delivered");
    expect(content).toContain("req_gaps");
    expect(content).toContain("REQ");
    expect(content).toContain("FSPEC");
    expect(content).toContain("PROPERTIES");
  });

  it("dod-verify SKILL.md has challenger persona", () => {
    const skillPath = resolve(__dirname, "../../skills/dod-verify/SKILL.md");
    const content = readFileSync(skillPath, "utf8");
    // Must establish bar-raiser mindset — not a passive scanner
    expect(content).toContain("## Persona: The Challenger");
    expect(content).toMatch(/hostile auditor|challenger|assume.*incomplete|burden of proof/i);
  });

  it("dodVerifyPrompt includes req_gaps in the trailer instruction", () => {
    const content = readFileSync(scriptPath, "utf8");
    const start = content.indexOf("function dodVerifyPrompt");
    const nextFn = content.indexOf("\nfunction ", start + 1);
    const promptFn = content.slice(start, nextFn > start ? nextFn : start + 3000);
    expect(promptFn).toContain("req_gaps");
    expect(promptFn).toContain("REQ");
    expect(promptFn).toContain("FSPEC");
    expect(promptFn).toContain("PROPERTIES");
  });

  it("parseDodStatus returns req_gaps field on passed and failed statuses", () => {
    const content = readFileSync(scriptPath, "utf8");
    // req_gaps must appear in both the passed-return and the failed-return of parseDodStatus
    expect(content).toMatch(/req_gaps.*0/); // passed returns 0
  });
});
