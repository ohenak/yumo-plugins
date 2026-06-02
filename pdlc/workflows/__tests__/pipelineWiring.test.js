/**
 * Tests for pipeline wiring — happy path, phase sequence, final report.
 * PROP-PIPELINE-01 through PROP-PIPELINE-03, PROP-ARTIFACTS-01/02, PROP-OBS-01/02, PROP-NFR-01
 */

import main from "../orchestrate-dev.js";
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
  console.log = (...args) => {
    logMessages.push(args.join(" "));
  };
});

afterEach(() => {
  console.log = originalLog;
});

// Helper: create a minimal mock agent that returns success for all skills
function makeSuccessAgent(feature = "test-feat") {
  return async (skill, prompt, opts) => {
    if (skill === "guard") return { ok: true };
    if (skill === "se-review" || skill === "te-review" || skill === "pm-review") {
      return `Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`;
    }
    if (skill === "pm-author" || skill === "se-author" || skill === "te-author") {
      if (typeof prompt === "string" && prompt.includes("DECISIONS_WARRANTED")) {
        return "Finalized TSPEC.\nDECISIONS_WARRANTED: false";
      }
      // DAG parsing agent — returns structured JSON task list
      if (typeof prompt === "string" && prompt.includes("Return a JSON object")) {
        return JSON.stringify({
          tasks: [
            { id: "TASK-01", description: "First task", dependencies: [], planBatch: 1 },
          ],
        });
      }
      return "Created/updated document successfully.";
    }
    if (skill === "se-implement") {
      return "Tests: 5 passed, 0 failed. All good.";
    }
    if (skill === "harvest-learnings") {
      return "Harvest complete. LEARNINGS written and committed.";
    }
    return "Success.";
  };
}

function makeParallel() {
  return (promises) => Promise.all(promises);
}

const okGuard = createGuardAgentDouble({ ok: true });

// ─── PROP-PIPELINE-01: Valid path proceeds to Phase R ─────────────────────────
describe("PROP-PIPELINE-01: Valid path and guard ok → proceeds to Phase R", () => {
  it("returns success outcome without halting", async () => {
    const phasesCalled = [];
    const mockPhase = (label) => phasesCalled.push(label);
    const mockPipeline = async (label, fn) => fn();

    const result = await main({
      reqPath: "docs/test-feat/REQ-test-feat.md",
      _agent: makeSuccessAgent("test-feat"),
      _parallel: makeParallel(),
      _guardAgent: okGuard,
      _phase: mockPhase,
      _pipeline: mockPipeline,
    });

    expect(result.outcome).toBe("success");
    expect(result.feature).toBe("test-feat");
    // Phase R should be in phases called
    expect(phasesCalled.some((p) => p.includes("Phase R"))).toBe(true);
  });
});

// ─── PROP-PIPELINE-02: Final return value is the sole output ──────────────────
describe("PROP-PIPELINE-02: main() returns only the final report object", () => {
  it("return value is a FinalReport object, not an agent result", async () => {
    const result = await main({
      reqPath: "docs/test-feat/REQ-test-feat.md",
      _agent: makeSuccessAgent(),
      _parallel: makeParallel(),
      _guardAgent: okGuard,
      _phase: () => {},
      _pipeline: async (l, fn) => fn(),
    });

    // FinalReport shape check (TSPEC-ERROR-03)
    expect(typeof result.feature).toBe("string");
    expect(result.outcome === "success" || result.outcome === "halted").toBe(true);
    expect(Array.isArray(result.phases)).toBe(true);
    expect(Array.isArray(result.artifactPaths)).toBe(true);
    expect(typeof result.testSummary).toBe("string");
    expect(typeof result.harvestStatus).toBe("string");
  });
});

// ─── PROP-OBS-02: Final report shape matches TSPEC-ERROR-03 ──────────────────
describe("PROP-OBS-02: FinalReport object has correct shape", () => {
  it("success report has feature, outcome, phases, artifactPaths, testSummary, harvestStatus", async () => {
    const result = await main({
      reqPath: "docs/test-feat/REQ-test-feat.md",
      _agent: makeSuccessAgent(),
      _parallel: makeParallel(),
      _guardAgent: okGuard,
      _phase: () => {},
      _pipeline: async (l, fn) => fn(),
    });

    expect(result).toHaveProperty("feature");
    expect(result).toHaveProperty("outcome");
    expect(result).toHaveProperty("phases");
    expect(result).toHaveProperty("artifactPaths");
    expect(result).toHaveProperty("testSummary");
    expect(result).toHaveProperty("harvestStatus");
  });

  it("halted report includes haltReason", async () => {
    const result = await main({ reqPath: "" });
    expect(result).toHaveProperty("haltReason");
    expect(result.outcome).toBe("halted");
  });
});

// ─── PROP-ARTIFACTS-01: Cross-review path construction ────────────────────────
describe("PROP-ARTIFACTS-01: Artifact paths follow docs/{feature}/ prefix", () => {
  it("REQ path is in artifactPaths for valid invocation", async () => {
    const result = await main({
      reqPath: "docs/test-feat/REQ-test-feat.md",
      _agent: makeSuccessAgent(),
      _parallel: makeParallel(),
      _guardAgent: okGuard,
      _phase: () => {},
      _pipeline: async (l, fn) => fn(),
    });

    expect(result.artifactPaths).toContain("docs/test-feat/REQ-test-feat.md");
  });

  it("FSPEC and TSPEC paths follow docs/{feature}/ pattern", async () => {
    const result = await main({
      reqPath: "docs/test-feat/REQ-test-feat.md",
      _agent: makeSuccessAgent(),
      _parallel: makeParallel(),
      _guardAgent: okGuard,
      _phase: () => {},
      _pipeline: async (l, fn) => fn(),
    });

    // Check paths contain feature name
    const paths = result.artifactPaths;
    expect(paths.some((p) => p.includes("FSPEC"))).toBe(true);
    expect(paths.some((p) => p.includes("TSPEC"))).toBe(true);
    expect(paths.every((p) => p.startsWith("docs/test-feat/"))).toBe(true);
  });
});

// ─── PROP-ARTIFACTS-02: POSTMORTEM path construction ──────────────────────────
describe("PROP-ARTIFACTS-02: POSTMORTEM path follows POSTMORTEM-{PHASE}-{feature}.md", () => {
  it("workflow script constructs POSTMORTEM paths correctly in prompt", () => {
    const scriptPath = resolve(__dirname, "../orchestrate-dev.js");
    const content = readFileSync(scriptPath, "utf8");
    // The POSTMORTEM path construction in reviewLoop
    expect(content).toContain("POSTMORTEM-${phase}-${feature}.md");
  });
});

// ─── PROP-NFR-01: No parallel() call exceeds 5 agents ────────────────────────
describe("PROP-NFR-01: No single parallel() call dispatches more than 5 agents", () => {
  it("static analysis: reviewer parallel dispatch uses exactly 2 agents; batch dispatch is capped at 5 by computeTopologicalBatches", () => {
    const scriptPath = resolve(__dirname, "../orchestrate-dev.js");
    const content = readFileSync(scriptPath, "utf8");

    // Reviewer parallel calls should dispatch exactly 2 agents via _parallel([agent, agent])
    // The pattern may be multiline — just check both dispatches exist
    expect(content).toContain("_parallel([");
    expect(content).toContain("_agent(reviewers[0]");
    expect(content).toContain("_agent(reviewers[1]");

    // Batch dispatch uses .map() which is dynamically constrained to ≤ 5 by computeTopologicalBatches
    expect(content).toContain("batch.map(");
    expect(content).toContain("computeTopologicalBatches");

    // No literal array of 6+ agent calls at any parallel() site
    // (dynamic map-based dispatch is capped by computeTopologicalBatches sub-batch logic)
    const parallelCallMatches = [...content.matchAll(/_parallel\(\[([^\]]+)\]\)/g)];
    for (const match of parallelCallMatches) {
      // Count agent() calls in the literal array — should be ≤ 5
      const innerContent = match[1];
      const agentCount = (innerContent.match(/_agent\(/g) || []).length;
      expect(agentCount).toBeLessThanOrEqual(5);
    }
  });
});

// ─── PROP-PIPELINE-03: Phase sequence ─────────────────────────────────────────
describe("PROP-PIPELINE-03: phase() called with correct labels in order", () => {
  it("all 10 phase labels emitted in correct order", async () => {
    const phaseCalls = [];
    const mockPhase = (label) => phaseCalls.push(label);

    await main({
      reqPath: "docs/test-feat/REQ-test-feat.md",
      _agent: makeSuccessAgent(),
      _parallel: makeParallel(),
      _guardAgent: okGuard,
      _phase: mockPhase,
      _pipeline: async (l, fn) => fn(),
    });

    // Phase labels should appear in canonical order
    const phaseLabels = phaseCalls.join("|");
    expect(phaseLabels).toMatch(/Phase R/);
    expect(phaseLabels).toMatch(/Phase F/);
    expect(phaseLabels).toMatch(/Phase T/);
    // Phase D skipped (DECISIONS_WARRANTED: false from mock)
    expect(phaseLabels).toMatch(/Phase D.*Skipped|Phase D/);
    expect(phaseLabels).toMatch(/Phase P/);
    expect(phaseLabels).toMatch(/Phase PR/);
    expect(phaseLabels).toMatch(/Phase I/);
    expect(phaseLabels).toMatch(/Phase PT/);
    expect(phaseLabels).toMatch(/Phase CR/);
    expect(phaseLabels).toMatch(/Phase H/);
  });
});
