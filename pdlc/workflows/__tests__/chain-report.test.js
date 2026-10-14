import main from "../orchestrate-dev.js";

const ISSUE = "https://github.com/ohenak/regime-ledger/issues/1";
const FEATURE = "report-fixture";
const REQ = `docs/${FEATURE}/REQ-${FEATURE}.md`;
const HEAD = "a".repeat(40);
const RUN = "https://github.com/ohenak/regime-ledger/actions/runs/123";
const PR = "https://github.com/ohenak/regime-ledger/pull/2";
const PLAN = [
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| TASK-01 | First task | 1 | - |",
  "",
  "| Task | Files |",
  "|---|---|",
  "| TASK-01 | `src/change.js` |",
].join("\n");

function fixture(overrides = {}) {
  return {
    reqPath: REQ,
    deliveryMode: "chain",
    acceptedIssueUrl: ISSUE,
    _agent: async (skill) => {
      if (skill === "se-implement") return "Tests: 1 passed, 0 failed";
      if (skill === "dod-verify") return "DOD_STATUS: passed";
      if (skill === "guard") return { ok: true };
      return "Success";
    },
    _checkFile: async () => ({ ok: true }),
    _readFile: async (path) => path.includes("/PLAN-") ? PLAN : `Source: ${ISSUE}\nREQ-REPORT-01`,
    _phase: () => {},
    _pipeline: async (_label, fn) => fn(),
    _mergeWorktree: async () => ({ ok: true }),
    _git: async (args) => {
      if (args[0] === "remote" && args[1] === "get-url" && args[2] === "origin") {
        return { ok: true, stdout: "https://github.com/ohenak/regime-ledger.git" };
      }
      if (args[0] === "rev-parse" && args[1] === "--abbrev-ref") return { ok: true, stdout: `feat-${FEATURE}` };
      if (args[0] === "rev-parse") return { ok: true, stdout: HEAD };
      if (args[0] === "status") return { ok: true, stdout: "" };
      return { ok: true, stdout: "" };
    },
    _raisePrAndVerifyCiChain: async () => ({
      prUrl: PR, ciStatus: "passed", headSha: HEAD, runUrl: RUN, repairCount: 1,
      failedRunUrl: "https://github.com/ohenak/regime-ledger/actions/runs/122",
      failedHeadSha: "b".repeat(40),
      repairCommit: HEAD,
    }),
    ...overrides,
  };
}

describe("chain terminal report", () => {
  test.each([
    ["DOD", { _phaseDodEnabled: false }],
    ["PUB", { _phasePubEnabled: false }],
  ])("halts before authoring when %s is disabled", async (phase, flag) => {
    const called = [];
    const result = await main(fixture({
      ...flag,
      _agent: async (skill) => { called.push(skill); return "unexpected"; },
    }));
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toContain(phase);
    expect(result.chain.acceptedIssueUrl).toBe(ISSUE);
    expect(result.chain.ciState).toBe("not_run");
    expect(called).toEqual([]);
  });

  test("records a failed prerequisite without exposing artifact content", async () => {
    const result = await main(fixture({
      _checkFile: async (path) => ({ ok: !path.endsWith("/seam-map.md") }),
    }));
    expect(result.outcome).toBe("halted");
    expect(result.chain).toEqual({
      acceptedIssueUrl: ISSUE,
      artifactGates: {
        REQ: "passed", "seam-map": "failed", "issue-decisions": "not_run",
        FSPEC: "not_run", TSPEC: "not_run", DECISIONS: "not_run", PLAN: "not_run",
        PROPERTIES: "not_run", LEARNINGS: "not_run",
      },
      prUrl: null, headSha: null, runUrl: null, ciState: "not_run", repairCount: 0,
    });
    expect(JSON.stringify(result.chain)).not.toContain("REQ-REPORT-01");
  });

  test("reports the accepted issue, artifact gates, and exact CI head after delivery", async () => {
    let ghCalls = 0;
    const ghRun = async () => { ghCalls++; throw new Error("chain mode must leave the PR open"); };
    const result = await main(fixture({ _ghRun: ghRun }));
    expect(result.haltReason).toBeUndefined();
    expect(result.outcome).toBe("success");
    expect(result.mergeStatus).toBe("skipped");
    expect(ghCalls).toBe(0);
    expect(result.chain).toMatchObject({
      acceptedIssueUrl: ISSUE, prUrl: PR, headSha: HEAD, runUrl: RUN,
      ciState: "passed", repairCount: 1,
      failedRunUrl: "https://github.com/ohenak/regime-ledger/actions/runs/122",
      failedHeadSha: "b".repeat(40),
      repairCommit: HEAD,
    });
    expect(Object.values(result.chain.artifactGates).every((status) => status === "passed")).toBe(true);
    expect(result.chain.artifactGates).not.toHaveProperty("account");
  });

  test("successful PUB without a repair omits failed-run and repair fields", async () => {
    const result = await main(fixture({
      _raisePrAndVerifyCiChain: async () => ({
        prUrl: PR, ciStatus: "passed", headSha: HEAD, runUrl: RUN, repairCount: 0,
      }),
    }));
    expect(result.outcome).toBe("success");
    expect(result.chain).toMatchObject({
      prUrl: PR, headSha: HEAD, runUrl: RUN, ciState: "passed", repairCount: 0,
    });
    expect(result.chain).not.toHaveProperty("failedRunUrl");
    expect(result.chain).not.toHaveProperty("failedHeadSha");
    expect(result.chain).not.toHaveProperty("repairCommit");
  });

  test("halts when the authored LEARNINGS artifact is empty and does not open a PR", async () => {
    let pubCalls = 0;
    const result = await main(fixture({
      _readFile: async (path) => {
        if (path.includes("/PLAN-")) return PLAN;
        if (path.includes("/LEARNINGS-")) return "";
        return `Source: ${ISSUE}\nREQ-REPORT-01`;
      },
      _raisePrAndVerifyCiChain: async () => { pubCalls++; throw new Error("unexpected PR"); },
    }));
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toMatch(/LEARNINGS.*empty/);
    expect(result.chain.artifactGates.LEARNINGS).toBe("failed");
    expect(result.chain.prUrl).toBeNull();
    expect(pubCalls).toBe(0);
  });

  test("keeps exact head and failed run evidence when PUB halts after one repair", async () => {
    const result = await main(fixture({
      _raisePrAndVerifyCiChain: async () => {
        const error = new Error("Chain PUB repair CI failed at current head");
        error.chainCiEvidence = {
          prUrl: PR, headSha: HEAD, runUrl: RUN, ciStatus: "failed", repairCount: 1,
          failedRunUrl: "https://github.com/ohenak/regime-ledger/actions/runs/122",
          failedHeadSha: "b".repeat(40),
          repairCommit: HEAD,
        };
        throw error;
      },
    }));
    expect(result.outcome).toBe("halted");
    expect(result.chain).toMatchObject({
      acceptedIssueUrl: ISSUE, prUrl: PR, headSha: HEAD, runUrl: RUN,
      ciState: "failed", repairCount: 1, failedHeadSha: "b".repeat(40),
    });
    expect(result.chain.artifactGates.LEARNINGS).toBe("passed");
    expect(result.chain).not.toHaveProperty("account");
  });

  test("keeps default dev report shape unchanged", async () => {
    const result = await main({ reqPath: REQ, _checkFile: async () => ({ ok: false }), _phase: () => {} });
    expect(result.outcome).toBe("halted");
    expect(result).not.toHaveProperty("chain");
    expect(result).not.toHaveProperty("chainCi");
    expect(result).not.toHaveProperty("acceptedIssueUrl");
  });
});
