import main, { validateChainIssueUrl, validateChainArtifact } from "../orchestrate-dev.js";

const ISSUE = "https://github.com/ohenak/regime-ledger/issues/1";
const FEATURE = "chain-fixture";
const DIR = `docs/${FEATURE}`;
const REQ = `${DIR}/REQ-${FEATURE}.md`;
const PLAN = [
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| TASK-01 | First task | 1 | - |",
  "",
  "| Task | Files |",
  "|---|---|",
  "| TASK-01 | `src/change.js` |",
].join("\n");

describe("chain mode gates", () => {
  test("accepts only a GitHub issue URL with an issue number", () => {
    expect(validateChainIssueUrl(ISSUE)).toBe(true);
    expect(validateChainIssueUrl("https://github.com/ohenak/regime-ledger/pull/1")).toBe(false);
    expect(validateChainIssueUrl("https://example.com/ohenak/regime-ledger/issues/1")).toBe(false);
    expect(validateChainIssueUrl("https://github.com/ohenak/regime-ledger/issues/0")).toBe(false);
  });

  test("rejects empty or mismatched issue decisions and an FSPEC without requirement trace", () => {
    expect(validateChainArtifact("issue-decisions", "  ", ISSUE).ok).toBe(false);
    expect(validateChainArtifact("issue-decisions", `Decision source: ${ISSUE}\nAccepted: yes`, ISSUE).ok).toBe(true);
    expect(validateChainArtifact("issue-decisions", "Decision source: https://github.com/other/repo/issues/2", ISSUE).ok).toBe(false);
    expect(validateChainArtifact("FSPEC", "REQ-CHAIN-01", ISSUE, ["REQ-CHAIN-01", "REQ-CHAIN-02"]).reason)
      .toMatch(/REQ-CHAIN-02/);
    expect(validateChainArtifact("FSPEC", "REQ-CHAIN-01 REQ-CHAIN-99", ISSUE, ["REQ-CHAIN-01"]).reason)
      .toMatch(/REQ-CHAIN-99/);
  });

  test("halts before agents when the accepted issue belongs to another origin", async () => {
    const called = [];
    const result = await main({
      reqPath: REQ,
      deliveryMode: "chain",
      acceptedIssueUrl: ISSUE,
      _readOrigin: async () => "git@github.com:ohenak/yumo-plugins.git",
      _agent: async (skill) => { called.push(skill); return "unexpected"; },
      _checkFile: async () => ({ ok: true }),
      _readFile: async () => `Source: ${ISSUE}\nREQ-CHAIN-01`,
      _phase: () => {},
    });
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toMatch(/accepted issue.*origin/i);
    expect(called).toEqual([]);
  });

  test("halts on an accepted REQ with no requirement IDs", async () => {
    const called = [];
    const result = await main({
      reqPath: REQ,
      deliveryMode: "chain",
      acceptedIssueUrl: ISSUE,
      _readOrigin: async () => "git@github.com:ohenak/regime-ledger.git",
      _agent: async (skill) => { called.push(skill); return "unexpected"; },
      _checkFile: async () => ({ ok: true }),
      _readFile: async () => `Source: ${ISSUE}\nNo numbered requirements`,
      _phase: () => {},
    });
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toMatch(/REQ.*requirement ID/i);
    expect(called).toEqual([]);
  });

  test("rejects forcePhases before any chain artifact or agent work", async () => {
    const called = [];
    const result = await main({
      reqPath: REQ,
      deliveryMode: "chain",
      acceptedIssueUrl: ISSUE,
      forcePhases: "F",
      _agent: async (skill) => { called.push(skill); return "unexpected"; },
      _checkFile: async () => ({ ok: true }),
      _phase: () => {},
    });
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toMatch(/forcePhases/);
    expect(called).toEqual([]);
  });

  test("halts on a named missing prerequisite before dispatching agents", async () => {
    const called = [];
    const result = await main({
      reqPath: REQ,
      deliveryMode: "chain",
      acceptedIssueUrl: ISSUE,
      _readOrigin: async () => "git@github.com:ohenak/regime-ledger.git",
      _agent: async (skill) => { called.push(skill); return "unexpected"; },
      _checkFile: async (path) => ({ ok: !path.endsWith("/_evidence/seam-map.md"), reason: "file_missing" }),
      _readFile: async () => `Source: ${ISSUE}\nREQ-CHAIN-01`,
      _phase: () => {},
      _pipeline: async (_label, fn) => fn(),
    });
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toMatch(/seam-map\.md/);
    expect(called).toEqual([]);
  });

  test("authors a missing FSPEC once and validates its output without cross-review", async () => {
    let fspecPresent = false;
    const called = [];
    const authorPrompts = [];
    const result = await main({
      reqPath: REQ,
      deliveryMode: "chain",
      acceptedIssueUrl: ISSUE,
      _readOrigin: async () => "git@github.com:ohenak/regime-ledger.git",
      _agent: async (skill, prompt) => {
        called.push(skill);
        if (skill === "pm-author") {
          fspecPresent = true;
          authorPrompts.push(prompt);
        }
        if (skill === "guard") return { ok: true };
        return "Success";
      },
      _parallel: (promises) => Promise.all(promises),
      _checkFile: async (path) => ({ ok: !path.includes("/FSPEC-") || fspecPresent }),
      _readFile: async (path) => path.includes("PLAN-") ? PLAN : `Source: ${ISSUE}\nREQ-CHAIN-01`,
      _phase: () => {},
      _pipeline: async (_label, fn) => fn(),
      _mergeWorktree: async () => ({ ok: true }),
    });
    expect(called.filter((skill) => skill === "pm-author")).toHaveLength(1);
    expect(authorPrompts[0]).toContain(ISSUE);
    expect(called.some((skill) => skill.endsWith("-review"))).toBe(false);
    expect(result.phases.find((phase) => phase.phase === "F")?.status).toBe("chain-validated");
  });

  test("halts when a creator reports success but leaves its artifact missing", async () => {
    const called = [];
    const result = await main({
      reqPath: REQ,
      deliveryMode: "chain",
      acceptedIssueUrl: ISSUE,
      _readOrigin: async () => "git@github.com:ohenak/regime-ledger.git",
      _agent: async (skill) => { called.push(skill); return "Created"; },
      _checkFile: async (path) => ({ ok: !path.includes("/FSPEC-") }),
      _readFile: async () => `Source: ${ISSUE}\nREQ-CHAIN-01`,
      _phase: () => {},
      _pipeline: async (_label, fn) => fn(),
    });
    expect(called).toContain("pm-author");
    expect(called.some((skill) => skill.endsWith("-review"))).toBe(false);
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toMatch(/FSPEC-chain-fixture\.md.*missing or empty/);
  });

  test("uses accepted artifacts without any specification or CR review dispatch", async () => {
    const called = [];
    const result = await main({
      reqPath: REQ,
      deliveryMode: "chain",
      acceptedIssueUrl: ISSUE,
      _readOrigin: async () => "git@github.com:ohenak/regime-ledger.git",
      _agent: async (skill, prompt) => {
        called.push(skill);
        if (skill === "guard") return { ok: true };
        if (skill === "se-implement") return "Tests: 1 passed, 0 failed";
        if (skill === "harvest-learnings") return "LEARNINGS written";
        if (skill === "dod-verify") return "DOD_STATUS: passed";
        if (skill === "ship-pr") {
          if (String(prompt).includes("Rebase")) return "REBASE_STATUS: clean";
          if (String(prompt).includes("Raise")) return "PR_URL: https://github.com/acme/repo/pull/1";
          return "CI_STATUS: passed";
        }
        return "Success";
      },
      _parallel: (promises) => Promise.all(promises),
      _checkFile: async () => ({ ok: true }),
      _readFile: async (path) => path.includes("PLAN-") ? PLAN : `Source: ${ISSUE}\nREQ-CHAIN-01`,
      _phase: () => {},
      _pipeline: async (_label, fn) => fn(),
      _mergeWorktree: async () => ({ ok: true }),
      _checkCi: async () => "passed",
    });
    expect(called.some((skill) => skill.endsWith("-review"))).toBe(false);
    expect(result.phases.filter((phase) => ["R", "F", "T", "D", "P", "PR", "CR"].includes(phase.phase))
      .every((phase) => phase.status === "chain-validated")).toBe(true);
    expect(called).toContain("se-implement");
  });
});
