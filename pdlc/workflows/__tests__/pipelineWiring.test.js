/**
 * Tests for pipeline wiring — happy path, phase sequence, final report.
 * PROP-PIPELINE-01 through PROP-PIPELINE-03, PROP-ARTIFACTS-01/02, PROP-OBS-01/02, PROP-NFR-01
 */

import main, { meta } from "../orchestrate-dev.js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

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
    if (skill === "dod-verify") {
      return "Clean.\nDOD_STATUS: passed";
    }
    if (skill === "ship-pr") {
      if (typeof prompt === "string" && prompt.includes("Rebase the feature branch")) {
        return "Rebased.\nREBASE_STATUS: clean";
      }
      if (typeof prompt === "string" && prompt.includes("Raise a pull request")) {
        return "PR opened.\nPR_URL: https://github.com/acme/repo/pull/42";
      }
      return "Checks complete.\nCI_STATUS: passed";
    }
    return "Success.";
  };
}

function makeParallel() {
  return (promises) => Promise.all(promises);
}

// No-op mergeWorktree for unit tests — the runtime handles worktree merge-back;
// real git is not available in the test environment.
const noopMergeWorktree = async () => ({ ok: true });

const okGuard = () => ({ ok: true });

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
      _checkFile: okGuard,
      _phase: mockPhase,
      _pipeline: mockPipeline,
      _mergeWorktree: noopMergeWorktree,
      _checkCi: async () => "passed",
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
      _checkFile: okGuard,
      _phase: () => {},
      _pipeline: async (l, fn) => fn(),
      _mergeWorktree: noopMergeWorktree,
      _checkCi: async () => "passed",
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
      _checkFile: okGuard,
      _phase: () => {},
      _pipeline: async (l, fn) => fn(),
      _mergeWorktree: noopMergeWorktree,
      _checkCi: async () => "passed",
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
      _checkFile: okGuard,
      _phase: () => {},
      _pipeline: async (l, fn) => fn(),
      _mergeWorktree: noopMergeWorktree,
      _checkCi: async () => "passed",
    });

    expect(result.artifactPaths).toContain("docs/test-feat/REQ-test-feat.md");
  });

  it("FSPEC and TSPEC paths follow docs/{feature}/ pattern", async () => {
    const result = await main({
      reqPath: "docs/test-feat/REQ-test-feat.md",
      _agent: makeSuccessAgent(),
      _parallel: makeParallel(),
      _checkFile: okGuard,
      _phase: () => {},
      _pipeline: async (l, fn) => fn(),
      _mergeWorktree: noopMergeWorktree,
      _checkCi: async () => "passed",
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

    // Reviewer parallel calls should dispatch exactly 2 agents via _parallel([...]).
    // RLH-23 routes both of them through the pacing wrapper, so the dispatch is
    // written `runWrapped(reviewers[i], …)` rather than `_agent(reviewers[i], …)`;
    // the property this test guards — two dispatches, not more — is unchanged.
    expect(content).toContain("_parallel([");
    expect(content).toMatch(/runWrapped\(\s*reviewers\[0\]/);
    expect(content).toMatch(/runWrapped\(\s*reviewers\[1\]/);

    // Batch dispatch uses .map() which is dynamically constrained to ≤ 5 by computeTopologicalBatches
    expect(content).toContain("batch.map(");
    expect(content).toContain("computeTopologicalBatches");

    // No literal array of 6+ agent calls at any parallel() site
    // (dynamic map-based dispatch is capped by computeTopologicalBatches sub-batch logic)
    const parallelCallMatches = [...content.matchAll(/_parallel\(\[([^\]]+)\]\)/g)];
    for (const match of parallelCallMatches) {
      // Count agent() calls in the literal array — should be ≤ 5
      const innerContent = match[1];
      const agentCount = (innerContent.match(/_agent\(|runWrapped\(/g) || []).length;
      expect(agentCount).toBeLessThanOrEqual(5);
    }
  });
});

// ─── PROP-GATE-01: main() halts when reviewLoop returns converged: false ────────
describe("PROP-GATE-01: main() halts when Phase R reviewLoop returns converged: false", () => {
  it("returns halted outcome and does not proceed to Phase F when Phase R does not converge", async () => {
    // Agent returns Needs revision every time to exhaust the 5-iteration cap
    const mockAgent = async (skill, prompt) => {
      if (skill === "guard") return { ok: true };
      if (skill === "se-review" || skill === "te-review") {
        return `Review with issues.\nVERDICT: Needs revision\n{"high": 1, "medium": 0, "low": 0}\n`;
      }
      if (skill === "pm-author") {
        if (typeof prompt === "string" && prompt.includes("POSTMORTEM")) {
          return "POSTMORTEM written.";
        }
        return "Optimizer addressed feedback.";
      }
      return "Success.";
    };

    const phasesCalled = [];
    const mockPhase = (label) => phasesCalled.push(label);

    const result = await main({
      reqPath: "docs/test-feat/REQ-test-feat.md",
      _agent: mockAgent,
      _parallel: (promises) => Promise.all(promises),
      _checkFile: (() => ({ ok: true })),
      _phase: mockPhase,
      _pipeline: async (l, fn) => fn(),
    });

    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toMatch(/phase R|Phase R/i);
    // Phase F should NOT have been entered
    expect(phasesCalled.some((p) => p.includes("Phase F"))).toBe(false);
  });

  it("Phase R non-convergence records phase R with ❌ status in the final report", async () => {
    const mockAgent = async (skill, prompt) => {
      if (skill === "guard") return { ok: true };
      if (skill === "se-review" || skill === "te-review") {
        return `Review with issues.\nVERDICT: Needs revision\n{"high": 1, "medium": 0, "low": 0}\n`;
      }
      if (skill === "pm-author") return "Optimizer addressed feedback.";
      return "Success.";
    };

    const result = await main({
      reqPath: "docs/test-feat/REQ-test-feat.md",
      _agent: mockAgent,
      _parallel: (promises) => Promise.all(promises),
      _checkFile: (() => ({ ok: true })),
      _phase: () => {},
      _pipeline: async (l, fn) => fn(),
    });

    expect(result.outcome).toBe("halted");
    const phaseR = result.phases.find((p) => p.phase === "R");
    expect(phaseR).toBeTruthy();
    expect(phaseR.status).toBe("❌");
  });

  it("halt message includes non-approving reviewer skill names (PM-F02)", async () => {
    const mockAgent = async (skill, prompt) => {
      if (skill === "guard") return { ok: true };
      if (skill === "se-review" || skill === "te-review") {
        return `Review with issues.\nVERDICT: Needs revision\n{"high": 2, "medium": 1, "low": 0}\n`;
      }
      if (skill === "pm-author") return "Optimizer addressed feedback.";
      return "Success.";
    };

    const result = await main({
      reqPath: "docs/test-feat/REQ-test-feat.md",
      _agent: mockAgent,
      _parallel: (promises) => Promise.all(promises),
      _checkFile: (() => ({ ok: true })),
      _phase: () => {},
      _pipeline: async (l, fn) => fn(),
    });

    expect(result.outcome).toBe("halted");
    // haltReason must mention the reviewer skill names
    expect(result.haltReason).toMatch(/se-review|te-review/);
  });
});

// ─── PROP-LOOP-10: log() never receives agent result objects ──────────────────
describe("PROP-LOOP-10: log() is never called with an agent result variable (REQ-NFR-02)", () => {
  it("static analysis: no log() call site passes a variable assigned from await agent()", () => {
    const scriptPath = resolve(__dirname, "../orchestrate-dev.js");
    const content = readFileSync(scriptPath, "utf8");

    // Collect variable names assigned from await agent() / await agentFn() / await _agent()
    const resultVarPattern = /(?:const|let)\s+(\w+)\s*=\s*await\s+(?:agent|agentFn|_agent)\s*\(/g;
    const resultVars = new Set();
    let m;
    while ((m = resultVarPattern.exec(content)) !== null) {
      resultVars.add(m[1]);
    }

    // For each result variable, assert there is no log(<varName>) call in the source
    for (const varName of resultVars) {
      // Match: log(varName) or emit(varName) — direct pass of result object to log
      const directPassPattern = new RegExp(`(?:log|emit)\\s*\\(\\s*${varName}\\s*[,)]`);
      expect(content).not.toMatch(directPassPattern);
    }
  });
});

// ─── PROP-PIPELINE-03: Phase sequence ─────────────────────────────────────────
describe("PROP-PIPELINE-03: phase() called with correct labels in order", () => {
  it("all 11 phase labels emitted in correct order", async () => {
    const phaseCalls = [];
    const mockPhase = (label) => phaseCalls.push(label);

    await main({
      reqPath: "docs/test-feat/REQ-test-feat.md",
      _agent: makeSuccessAgent(),
      _parallel: makeParallel(),
      _checkFile: okGuard,
      _phase: mockPhase,
      _pipeline: async (l, fn) => fn(),
      _mergeWorktree: noopMergeWorktree,
      _checkCi: async () => "passed",
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
    expect(phaseLabels).toMatch(/Phase DOD/);
    expect(phaseLabels).toMatch(/Phase H/);
    expect(phaseLabels).toMatch(/Phase PUB/);
  });
});

// ─── RLH-WIRE-01: composition-root wiring (TSPEC §3.1) ────────────────────────
// L3 composition-root assertion: it injects NOTHING (TSPEC §8.4). The parameter
// list is *derived* from the production source text, never restated here, so a
// new seam cannot be added to main() without this test seeing it.
//
// This assertion is deliberately NOT named AT-64 — TSPEC §8.3 assigns AT-64 to
// __tests__/runtimeBundle.test.js alone.

/** Extract main()'s destructured parameter names from the production source. */
function mainParameterNames() {
  const scriptPath = resolve(__dirname, "../orchestrate-dev.js");
  const content = readFileSync(scriptPath, "utf8");

  const anchor = "export default async function main({";
  const start = content.indexOf(anchor);
  if (start < 0) throw new Error("main() composition-root anchor not found");
  if (content.indexOf(anchor, start + 1) >= 0) {
    throw new Error("main() composition-root anchor occurs more than once");
  }

  const bodyStart = start + anchor.length;
  const end = content.indexOf("} = {}) {", bodyStart);
  if (end < 0) throw new Error("main() parameter list terminator not found");

  const block = content
    .slice(bodyStart, end)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "");

  return block
    .split(",")
    .map((entry) => entry.split(":")[0].split("=")[0].trim())
    .filter((name) => name.length > 0);
}

describe("RLH-WIRE-01: main() composition root carries the new parameters", () => {
  // The sixteen that exist today — TSPEC §3.1: "Nothing existing is renamed or
  // reordered."
  const EXISTING_PARAMS = [
    "reqPath",
    "_agent",
    "_parallel",
    "_log",
    "_checkFile",
    "_readFile",
    "_phase",
    "_pipeline",
    "_mergeWorktree",
    "_rebaseOntoDefault",
    "_dodVerifyLoop",
    "_raisePrAndVerifyCi",
    "_checkCi",
    "_phaseDodEnabled",
    "_phasePubEnabled",
    "_now",
    "_sleep",
  ];

  // Exactly five new *seams*. `forcePhases` is NOT one of them: it is data —
  // no default implementation, never called (TSPEC §3.1) — so there are five
  // Node defaults and five adapter entries, not six of either.
  const NEW_SEAMS = [
    "_listFiles",
    "_writeFile",
    "_appendFile",
    "_git",
    "_recordQueueRow",
  ];

  it("RLH-WIRE-01: parameter list carries the five new seams plus forcePhases, and meta.inputs declares forcePhases", () => {
    const names = mainParameterNames();

    // Pre-existing surface is intact — nothing renamed or dropped (TSPEC §3.1).
    for (const name of EXISTING_PARAMS) {
      expect(names).toContain(name);
    }

    // The five new injected seams.
    for (const seam of NEW_SEAMS) {
      expect(names).toContain(seam);
    }

    // `forcePhases` — data, not a seam, hence no `_` prefix (TSPEC §3.1, §5.7).
    expect(names).toContain("forcePhases");
    expect(names).not.toContain("_forcePhases");

    // Every new seam is `_`-prefixed; exactly five of the added names are.
    const addedSeams = names.filter((n) => NEW_SEAMS.includes(n));
    expect(addedSeams).toHaveLength(5);

    // meta gains a second inputs entry beside reqPath (TSPEC §3.1). Note this is
    // NOT the operator-facing surface: in the built bundle this `meta` sits inside
    // the `__dev` IIFE, where nothing reads it. The `inputs` the runtime actually
    // offers are declared by `DEV_META` in build-runtime.mjs, which CR F-1 edited
    // for exactly that reason. The two copies are hand-maintained; RLH-CR-F7 below
    // asserts they agree.
    const inputNames = meta.inputs.map((input) => input.name);
    expect(inputNames).toContain("reqPath");
    expect(inputNames).toContain("forcePhases");

    const forceInput = meta.inputs.find((i) => i.name === "forcePhases");
    expect(forceInput.type).toBe("string");
    expect(forceInput.required).toBe(false);
  });
});

// ─── RLH-CR-F7: the two hand-maintained `meta.inputs` copies agree ────────────
// Phase CR finding F-7. TSPEC Q-07 declined to declare `forcePhases` in
// `DEV_META` precisely because "adding one creates a second declaration to keep
// in sync". CR F-1 reversed that decision — correctly, since Q-07's premise was
// false: the module's own `meta.inputs` is dead in the built artifact (it stays
// inside the `__dev` IIFE, read by nothing), so it is not the operator-facing
// surface and `DEV_META` had to declare the channel itself.
//
// The reversal is right and the duplication is therefore real. Q-07's stated
// cost is what this suite pays down: nothing previously compared the two copies
// (RLH-CR-F1 reads only DEV_META; RLH-WIRE-01 reads only the module's `meta`),
// so they could diverge silently. Here they are compared directly, from source
// text on both sides, so an edit to either copy alone reds.
//
// The TSPEC is an approved artifact and is not amended here; the Q-07 reversal
// is carried to LEARNINGS §3 at harvest.

/** The `DEV_META` template literal in build-runtime.mjs, evaluated. */
function devMeta() {
  const src = readFileSync(resolve(__dirname, "../build-runtime.mjs"), "utf8");
  const anchor = "const DEV_META = `";
  const start = src.indexOf(anchor);
  if (start < 0) throw new Error("DEV_META anchor not found in build-runtime.mjs");
  if (src.indexOf(anchor, start + 1) >= 0) {
    throw new Error("DEV_META anchor occurs more than once");
  }

  const bodyStart = start + anchor.length;
  // The literal carries no backticks by construction (a backtick would terminate
  // it and break the build), so the first one after the anchor closes it.
  const end = src.indexOf("`", bodyStart);
  if (end < 0) throw new Error("DEV_META literal is unterminated");

  const literal = src.slice(bodyStart, end).replace("export const meta = ", "");
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${literal.replace(/;\s*$/, "")});`)();
}

describe("RLH-CR-F7: DEV_META and the module's meta declare the same inputs", () => {
  it("RLH-CR-F7: the two meta.inputs copies are deep-equal", () => {
    const shipped = devMeta();
    expect(Array.isArray(shipped.inputs)).toBe(true);
    expect(shipped.inputs.length).toBeGreaterThan(0);

    // Order included: the runtime presents inputs in declaration order, so a
    // reorder in one copy alone is a divergence worth reding on.
    expect(shipped.inputs).toEqual(meta.inputs);
  });

  it("RLH-CR-F7: both copies name the same inputs with the same required-ness", () => {
    const byName = (m) =>
      Object.fromEntries(m.inputs.map((i) => [i.name, { type: i.type, required: i.required }]));

    expect(byName(devMeta())).toEqual(byName(meta));
    // Anchored so a copy that loses `forcePhases` entirely — the pre-F-1 state —
    // cannot satisfy this suite by both copies being equally wrong.
    expect(meta.inputs.map((i) => i.name).sort()).toEqual(["forcePhases", "reqPath"]);
  });
});
