import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { checkChainPushWorkflows, chainPushWorkflowName, raisePrAndVerifyCiChain } from "../orchestrate-dev.js";
import { mkdtempSync, writeFileSync, readFileSync, chmodSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

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
  _listRuns: async () => [run(SHA1, "success")],
  _workflowGate: async () => ({ ok: true, names: ["CI"] }),
  _log: () => {}, ...extra,
});

describe("chain-only current-head CI", () => {
  beforeEach(() => jest.clearAllMocks());

  it("requires a tracked workflow that runs on the feature branch before opening a PR", async () => {
    const mainOnly = "name: CI\non:\n  push:\n    branches:\n      - main\n";
    const featurePush = "name: CI\non:\n  pull_request:\n  push:\n    branches:\n      - 'feat-*'\n";
    expect(chainPushWorkflowName(mainOnly, "feat-example")).toBeNull();
    expect(chainPushWorkflowName(featurePush, "feat-example")).toBe("CI");
    const workflow = await checkChainPushWorkflows({
      _git: async (args) => ({ ok: true, stdout: args[0] === "branch"
        ? "feat-example\n" : ".github/workflows/ci.yml\n" }),
      _listFiles: async () => ({ ok: true, files: ["ci.yml"] }),
      _readFile: async () => featurePush,
    });
    expect(workflow).toEqual({ ok: true, names: ["CI"] });
    await expect(raisePrAndVerifyCiChain(base({
      _workflowGate: async () => ({ ok: false, reason: "No CI workflow runs on feature-branch push" }),
    }))).rejects.toThrow(/feature-branch push/);
    expect(agent).not.toHaveBeenCalled();
  });

  it("waits for every expected push workflow before accepting green", async () => {
    let polls = 0;
    const result = await raisePrAndVerifyCiChain(base({
      _workflowGate: async () => ({ ok: true, names: ["CI", "Audit"] }),
      _listRuns: async () => {
        polls += 1;
        return polls === 1 ? [run(SHA1, "success")]
          : [run(SHA1, "success"), { ...run(SHA1, "success"), name: "Audit", url: `${RUN}-audit` }];
      },
      _sleep: async () => {},
    }));
    expect(result.ciStatus).toBe("passed");
    expect(polls).toBe(2);
  });
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
  it("does not attach the failed run verdict to an unverified repair head", async () => {
    const g = git([SHA1, SHA2]);
    try {
      await raisePrAndVerifyCiChain(base({
        _git: g,
        _prView: async () => view(g.mock.calls.some(([args]) => args[0] === "push") ? SHA2 : SHA1),
        _listRuns: async (sha) => [run(sha, sha === SHA1 ? "failure" : null, sha === SHA1 ? "completed" : "in_progress")],
        completionTimeoutMs: 0,
      }));
      throw new Error("expected repair observation to time out");
    } catch (err) {
      expect(err.message).toMatch(/did not complete/i);
      expect(err.chainCiEvidence).toMatchObject({ headSha: SHA2, repairCount: 1,
        failedRunUrl: RUN, ciStatus: "pending", runUrl: null });
    }
  });

  it("refuses to push a repair commit containing private position data paths", async () => {
    const baseGit = git([SHA1, SHA2]);
    const guardedGit = jest.fn(async (args) => args[0] === "diff"
      ? { ok: true, stdout: "positions/packet.json\n" }
      : baseGit(args));
    await expect(raisePrAndVerifyCiChain(base({
      _git: guardedGit,
      _listRuns: async () => [run(SHA1, "failure")],
    }))).rejects.toThrow(/private account or position paths/);
    expect(guardedGit.mock.calls.some(([args]) => args[0] === "push")).toBe(false);
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
  it("queries GitHub for the exact branch and SHA through the production transport", () => {
    const dir = mkdtempSync(join(tmpdir(), "chain-ci-gh-"));
    const argsPath = join(dir, "args.txt");
    const prJson = JSON.stringify(view());
    const runJson = JSON.stringify([run(SHA1, "success")]);
    const gh = [
      "#!/bin/sh",
      `printf '%s\\n' "$*" >> "$GH_ARGS_FILE"`,
      `if [ "$1" = pr ]; then echo '${prJson}'; exit 0; fi`,
      `if [ "$1" = run ]; then echo '${runJson}'; exit 0; fi`,
      "exit 3",
    ].join("\n");
    writeFileSync(join(dir, "gh"), `${gh}\n`);
    chmodSync(join(dir, "gh"), 0o700);
    const script = [
      `const { raisePrAndVerifyCiChain } = await import(${JSON.stringify(new URL("../orchestrate-dev.js", import.meta.url).href)});`,
      `const result = await raisePrAndVerifyCiChain({ feature: "feature",`,
      `  _agent: async () => ${JSON.stringify(`PR_URL: ${PR}`)},`,
      `  _git: async () => ({ ok: true, stdout: ${JSON.stringify(`${SHA1}\n`)} }),`,
      `  _workflowGate: async () => ({ ok: true, names: ["CI"] }),`,
      `  _log: () => {} });`,
      `console.log(JSON.stringify(result));`,
    ].join("\n");
    try {
      const output = execFileSync(process.execPath, ["--input-type=module", "-e", script], {
        encoding: "utf8", env: { ...process.env, PATH: `${dir}:${process.env.PATH}`, GH_ARGS_FILE: argsPath },
      });
      expect(JSON.parse(output)).toMatchObject({ ciStatus: "passed", headSha: SHA1, runUrl: RUN });
      expect(readFileSync(argsPath, "utf8")).toContain(`run list --commit ${SHA1} --branch feature --event push`);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
  it("halts when the PR agent does not provide a URL", async () => {
    await expect(raisePrAndVerifyCiChain(base({ _agent: async () => "PR_URL: none" }))).rejects.toThrow(/PR creation failed/i);
  });
  it("halts when local HEAD cannot be verified", async () => {
    await expect(raisePrAndVerifyCiChain(base({ _git: async () => ({ ok: true, stdout: "bad-sha" }) }))).rejects.toThrow(/local commit SHA/i);
  });
  it.each([
    ["missing git result", null],
    ["failed git result", { ok: false, stdout: `${SHA1}\n` }],
    ["missing stdout", { ok: true, stdout: null }],
  ])("halts for %s while reading local HEAD", async (_label, result) => {
    await expect(raisePrAndVerifyCiChain(base({ _git: async () => result }))).rejects.toThrow(/local commit SHA/i);
  });
  it("halts on a failed PR head query", async () => {
    await expect(raisePrAndVerifyCiChain(base({ _prView: async () => { throw Error("offline"); } }))).rejects.toThrow(/PR head query failed/i);
  });
  it("polls from missing through pending to a successful current run", async () => {
    let time = 0;
    const responses = [[], [run(SHA1, null, "in_progress")], [run(SHA1, "success")]];
    const list = jest.fn(async () => responses.shift() ?? [run(SHA1, "success")]);
    const result = await raisePrAndVerifyCiChain(base({
      _listRuns: list, _now: () => time, _sleep: async (ms) => { time += ms; },
      pollIntervalMs: 1000, registrationTimeoutMs: 4000,
    }));
    expect(result.ciStatus).toBe("passed");
    expect(list).toHaveBeenCalledTimes(3);
  });
  it.each([
    ["missing URL", { url: null }],
    ["missing name", { name: null }],
    ["missing status", { status: null }],
    ["missing conclusion", { conclusion: null }],
  ])("halts for %s in a completed run", async (_label, override) => {
    await expect(raisePrAndVerifyCiChain(base({ _listRuns: async () => [{ ...run(SHA1, "success"), ...override }] }))).rejects.toThrow(/unverifiable/i);
  });
  it("does not accept a successful non-push event", async () => {
    await expect(raisePrAndVerifyCiChain(base({
      _listRuns: async () => [{ ...run(SHA1, "success"), event: "pull_request" }], registrationTimeoutMs: 0,
    }))).rejects.toThrow(/no current-head CI/i);
  });
  it("repairs a timed-out run", async () => {
    const g = git([SHA1, SHA2]);
    const result = await raisePrAndVerifyCiChain(base({
      _git: g,
      _prView: async () => view(g.mock.calls.some(([args]) => args[0] === "push") ? SHA2 : SHA1),
      _listRuns: async (sha) => [run(sha, sha === SHA1 ? "timed_out" : "success")],
    }));
    expect(result).toMatchObject({ repairCount: 1, failedHeadSha: SHA1 });
  });
  it("uses unavailable markers for nonstring CI metadata in the repair prompt", async () => {
    let repairPrompt;
    await expect(raisePrAndVerifyCiChain(base({
      _git: git([SHA1, SHA1]),
      _listRuns: async () => [{ ...run(SHA1, "failure"), url: 7, name: {} }],
      _agent: async (skill, prompt) => {
        if (skill === "ship-pr") return `PR_URL: ${PR}`;
        repairPrompt = prompt;
        return "No commit";
      },
    }))).rejects.toThrow(/no new commit/i);
    expect(repairPrompt).toMatch(/CI run: unavailable; check: unavailable/);
  });
  it.each([
    ["multiple commits", "rev-list", { ok: true, stdout: "2\n" }, /exactly one new commit/i],
    ["missing count result", "rev-list", null, /exactly one new commit/i],
    ["failed count command", "rev-list", { ok: false, stdout: "1\n" }, /exactly one new commit/i],
    ["missing count stdout", "rev-list", { ok: true, stdout: null }, /exactly one new commit/i],
    ["uncommitted changes", "status", { ok: true, stdout: " M app.py\n" }, /uncommitted changes/i],
  ])("halts a repair with %s", async (_label, command, response, error) => {
    const g = git([SHA1, SHA2]);
    const guardedGit = async (args) => args[0] === command ? response : g(args);
    await expect(raisePrAndVerifyCiChain(base({
      _git: guardedGit, _listRuns: async () => [run(SHA1, "failure")],
    }))).rejects.toThrow(error);
  });
  it("halts when the agent changes the PR branch before the repair push", async () => {
    let changed = false;
    const g = git([SHA1, SHA2]);
    await expect(raisePrAndVerifyCiChain(base({
      _git: g,
      _agent: async (skill) => {
        if (skill === "ship-pr") return `PR_URL: ${PR}`;
        changed = true;
        return "committed";
      },
      _prView: async () => ({ ...view(), headRefName: changed ? "other" : "feature" }),
      _listRuns: async () => [run(SHA1, "failure")],
    }))).rejects.toThrow(/PR head mismatch/i);
    expect(g.mock.calls.some(([args]) => args[0] === "push")).toBe(false);
  });
  it.each([
    ["query failure", async () => { throw Error("offline"); }, /query failed after repair push/i],
    ["unexpected head", async () => view("c".repeat(40)), /changed unexpectedly/i],
    ["propagation timeout", async () => view(SHA1), /did not reach PR head/i],
  ])("halts on post-push PR %s", async (_label, postPushView, error) => {
    const g = git([SHA1, SHA2]);
    await expect(raisePrAndVerifyCiChain(base({
      _git: g,
      _prView: async () => g.mock.calls.some(([args]) => args[0] === "push") ? postPushView() : view(),
      _listRuns: async () => [run(SHA1, "failure")],
      registrationTimeoutMs: 0,
    }))).rejects.toThrow(error);
  });
});
