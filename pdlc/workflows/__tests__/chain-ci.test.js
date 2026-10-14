import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { raisePrAndVerifyCiChain } from "../orchestrate-dev.js";

const SHA1 = "a".repeat(40);
const SHA2 = "b".repeat(40);
const PR = "https://github.com/example/repo/pull/1";
const RUN = "https://github.com/example/repo/actions/runs/7";
const view = (sha = SHA1) => ({ headRefOid: sha, headRefName: "feature" });
const run = (sha, conclusion, status = "completed") => ({
  headSha: sha, headBranch: "feature", event: "push", status, conclusion, url: RUN, name: "CI",
});
const git = (heads = [SHA1]) => jest.fn(async (args) => {
  if (args[0] === "rev-parse") return { ok: true, stdout: `${heads.shift() ?? SHA2}\n` };
  if (args[0] === "rev-list") return { ok: true, stdout: "1\n" };
  if (args[0] === "status") return { ok: true, stdout: "" };
  return { ok: true, stdout: "" };
});
const agent = jest.fn(async (skill) => skill === "ship-pr" ? `PR_URL: ${PR}` : "Repair committed; local tests pass.");
const base = (extra = {}) => ({
  feature: "feature", _agent: agent, _git: git(), _prView: async () => view(),
  _listRuns: async () => [run(SHA1, "success")], _log: () => {}, ...extra,
});

describe("chain-only current-head CI", () => {
  beforeEach(() => jest.clearAllMocks());
  it("accepts a successful push run for the exact PR head", async () => {
    const result = await raisePrAndVerifyCiChain(base());
    expect(result).toMatchObject({ prUrl: PR, headSha: SHA1, runUrl: RUN, ciStatus: "passed", repairCount: 0 });
  });
  it("halts when the PR head differs from the pushed local commit", async () => {
    await expect(raisePrAndVerifyCiChain(base({ _prView: async () => view(SHA2) }))).rejects.toThrow(/head.*mismatch/i);
  });
  it("halts on a stale run, even if it succeeded", async () => {
    await expect(raisePrAndVerifyCiChain(base({ _listRuns: async () => [run(SHA2, "success")] , registrationTimeoutMs: 0 }))).rejects.toThrow(/no.*current-head.*CI/i);
  });
  it("does not accept a green run from another branch at the same SHA", async () => {
    const wrongBranch = { ...run(SHA1, "success"), headBranch: "other" };
    await expect(raisePrAndVerifyCiChain(base({ _listRuns: async () => [wrongBranch], registrationTimeoutMs: 0 }))).rejects.toThrow(/no.*current-head.*CI/i);
  });
  it("halts when no push run registers", async () => {
    await expect(raisePrAndVerifyCiChain(base({ _listRuns: async () => [], registrationTimeoutMs: 0 }))).rejects.toThrow(/no.*current-head.*CI/i);
  });
  it("halts on an unreadable CI query", async () => {
    await expect(raisePrAndVerifyCiChain(base({ _listRuns: async () => { throw Error("offline"); } }))).rejects.toThrow(/CI query/i);
  });
  it("halts on malformed run data", async () => {
    await expect(raisePrAndVerifyCiChain(base({ _listRuns: async () => ({ status: "success" }) }))).rejects.toThrow(/unverifiable/i);
  });
  it("halts pending runs at the completion cap", async () => {
    await expect(raisePrAndVerifyCiChain(base({ _listRuns: async () => [run(SHA1, null, "in_progress")], completionTimeoutMs: 0 }))).rejects.toThrow(/did not complete/i);
  });
  it("repairs one red run, pushes one commit, and accepts only its new run", async () => {
    const repair = jest.fn(async () => "Local test passed; committed once.");
    const g = git([SHA1, SHA2]);
    const list = jest.fn(async (sha) => sha === SHA1 ? [run(SHA1, "failure")] : [run(SHA2, "success")]);
    const result = await raisePrAndVerifyCiChain(base({
      _agent: async (skill, prompt) => skill === "ship-pr" ? `PR_URL: ${PR}` : repair(prompt),
      _git: g, _prView: async () => view(g.mock.calls.some(([args]) => args[0] === "push") ? SHA2 : SHA1), _listRuns: list,
    }));
    expect(result).toMatchObject({ headSha: SHA2, repairCommit: SHA2, repairCount: 1, failedRunUrl: RUN, failedHeadSha: SHA1 });
    expect(repair).toHaveBeenCalledTimes(1);
    expect(repair.mock.calls[0][0]).not.toMatch(/failing job log|quote value|position value/i);
    expect(g.mock.calls.some(([args]) => args[0] === "push")).toBe(true);
  });
  it("waits for the repaired PR head to appear after the push", async () => {
    const g = git([SHA1, SHA2]);
    let t = 0;
    let postPushViews = 0;
    const result = await raisePrAndVerifyCiChain(base({
      _git: g,
      _prView: async () => {
        if (!g.mock.calls.some(([args]) => args[0] === "push")) return view(SHA1);
        return view(postPushViews++ === 0 ? SHA1 : SHA2);
      },
      _listRuns: async (sha) => [run(sha, sha === SHA1 ? "failure" : "success")],
      _now: () => t,
      _sleep: async (ms) => { t += ms; },
      pollIntervalMs: 1000,
      registrationTimeoutMs: 3000,
    }));
    expect(result.headSha).toBe(SHA2);
    expect(postPushViews).toBeGreaterThan(1);
  });
  it("halts if the repaired commit is red", async () => {
    const g = git([SHA1, SHA2]);
    const list = jest.fn(async (sha) => [run(sha, "failure")]);
    await expect(raisePrAndVerifyCiChain(base({
      _git: g, _prView: async () => view(g.mock.calls.some(([args]) => args[0] === "push") ? SHA2 : SHA1), _listRuns: list,
    }))).rejects.toThrow(/repair.*failed/i);
    expect(agent.mock.calls.filter(([skill]) => skill !== "ship-pr")).toHaveLength(1);
  });
  it.each(["cancelled", "action_required", "neutral", "skipped"])("halts %s without dispatching repair", async (conclusion) => {
    const repair = jest.fn(async () => "unexpected repair");
    let evidence;
    try {
      await raisePrAndVerifyCiChain(base({
        _agent: async (skill) => skill === "ship-pr" ? `PR_URL: ${PR}` : repair(),
        _listRuns: async () => [run(SHA1, conclusion)],
      }));
    } catch (err) {
      evidence = err.chainCiEvidence;
      expect(err.message).toMatch(/does not permit repair/i);
    }
    expect(repair).not.toHaveBeenCalled();
    expect(evidence).toMatchObject({ headSha: SHA1, ciStatus: "blocked", repairCount: 0 });
  });
  it("keeps the failed SHA on a halted repair", async () => {
    const g = git([SHA1, SHA2]);
    const list = jest.fn(async (sha) => [run(sha, "failure")]);
    try {
      await raisePrAndVerifyCiChain(base({
        _git: g, _prView: async () => view(g.mock.calls.some(([args]) => args[0] === "push") ? SHA2 : SHA1), _listRuns: list,
      }));
      throw Error("expected halt");
    } catch (err) {
      expect(err.chainCiEvidence).toMatchObject({ failedHeadSha: SHA1, failedRunUrl: RUN, headSha: SHA2, repairCount: 1 });
    }
  });
  it("halts when repair makes no new commit", async () => {
    await expect(raisePrAndVerifyCiChain(base({ _git: git([SHA1, SHA1]), _listRuns: async () => [run(SHA1, "failure")] }))).rejects.toThrow(/new commit/i);
  });
  it("halts without a second CI read if the sole repair push fails", async () => {
    const g = git([SHA1, SHA2]);
    const failingGit = async (args) => args[0] === "push" ? { ok: false, stderr: "rejected" } : g(args);
    const list = jest.fn(async () => [run(SHA1, "failure")]);
    await expect(raisePrAndVerifyCiChain(base({ _git: failingGit, _listRuns: list }))).rejects.toThrow(/repair push failed/i);
    expect(list).toHaveBeenCalledTimes(1);
  });
});
