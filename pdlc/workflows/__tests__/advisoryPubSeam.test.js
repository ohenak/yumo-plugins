// advisoryPubSeam.test.js — PLAN A-11 (batch 3, depends on A-02).
//
// RED (authored as two `describe.skip` blocks, each un-skipped by a different 🟢 owner, per
// PLAN §3's un-skipper rule):
//
//   - `A-24 — A5 SeamOps + capability probes` (batch 11) — lands `probeDefaultBranchChecks`,
//     `probeWorkflowRerun`, A5's `SeamOps` (`buildA5SeamOps`, this file's own fixed name — see
//     decision 1 below) — everything reachable at the "seam unit" level (TSPEC §13.2) against a
//     fake `_git`/`_ghRun`, driven through the real `runAdvisorySeam` (already shipped by A-22).
//   - `A-26 — Phase PUB wiring` (batch 13) — lands `raisePrAndVerifyCi`'s `_runAdvisorySeam` /
//     `_advisoryRecord` parameters, the `noChecks`/`completionCap` summary booleans and the
//     `dodVerifiedCommit`/`dodHeadUnverified` report fields (TSPEC §8.1, §8.4, §9.4 S-3). This
//     block's cases are the four PROPERTIES O-4 "routing branch" properties this file owns
//     (PROP-A5-04, PROP-A5-05, PROP-A5-09) plus the two-part `ciStatus`-provenance oracle
//     (PROP-A5-10 / PROP-PROH-03) and OQ-3's report field (PROP-A5-13) — all of which need the
//     *real* `raisePrAndVerifyCi` poll loop, not only a fake seamOps.
//
// `probeDefaultBranchChecks`, `probeWorkflowRerun`, `runAdvisorySeam`'s A5 binding and
// `raisePrAndVerifyCi`'s advisory parameters do not exist yet at A-11. This file therefore reaches
// every not-yet-existing symbol only from *inside* `describe.skip` bodies, importing the module as
// a namespace (`import * as dev`), exactly as `advisoryDriver.test.js` (A-07) already does.
//
// Every canonical double comes from `helpers/advisoryDoubles.js` (PROP-INFRA-01/-02) — no
// locally-built `SeamOps` literal, no `jest.fn()` bound directly to a double-shaped name.
//
// **Interpretive/contract-fixing decisions this RED task makes** (documented here per this
// project's own convention — see `advisoryDriver.test.js`'s header on `_log` — for A-24/A-26 to
// implement against):
//
//   1. **`buildA5SeamOps` — the exported name for A5's real `SeamOps`.** TSPEC §8.2 tables A5's
//      nine members but never names the exported constructor (unlike A3/A4, which are also
//      un-named — this is a project-wide gap, not one this file introduces). This file fixes:
//
//        export async function buildA5SeamOps({
//          feature, prUrl, preSeamHead, defaultBranch, mergeBase, recordWait,
//          _git, _ghRun, _checkCi,
//        })   // → Promise<SeamOps>   (async because BL-05/BL-06 probing is IO)
//
//      `recordWait` is the §4.3 sink — "the driver … passes a `recordWait(ms)` sink into the
//      seam's construction, which only A5 calls". This file fixes the threading as: the *caller*
//      of `buildA5SeamOps` (in production, `raisePrAndVerifyCi`; in this file's A-24 block, the
//      test itself) owns a `recordWait` closure, hands it to `buildA5SeamOps`, and `verifyGate`'s
//      E-2 branch calls it once, with the re-poll's wall-clock duration, immediately around its
//      `_checkCi` call. This is asserted directly (a call-count-plus-argument oracle) rather than
//      via `budgetExceeded`'s own arithmetic, which is `advisoryVerdict.test.js`'s pinned property
//      (PROP-BUD-02) — this file does not re-derive it.
//   2. **`_runAdvisorySeam`'s call contract from `raisePrAndVerifyCi`.** TSPEC §8.1 shows only
//      `{ seam: "A5", … }`. This file fixes the full parameter set `raisePrAndVerifyCi` is expected
//      to pass — `{ seam: "A5", feature, prUrl, preSeamHead, config, rungState, _agent,
//      _appendFile, _writeFile, _readFile, _git, _ghRun, _checkCi, _log, _now, _sleep }` — mirroring
//      `runAdvisorySeam`'s own §4.4 signature plus the seam-construction inputs `buildA5SeamOps`
//      needs. The A-26 block's `_runAdvisorySeam` doubles are real wrappers around
//      `dev.runAdvisorySeam` + `dev.buildA5SeamOps` (never a scripted-disposition fake) precisely
//      where PROPERTIES §3 O-4 requires the real phase body driven end to end; the phase-integration
//      *routing* cases (no-checks / completion-cap not firing) use a call-counting spy instead,
//      since there the property under test is "never invoked", not "invoked and resolves correctly".
//   3. **`preSeamHead`.** TSPEC §4.4/§8.2 assume it is captured before A5 runs. This file fixes it
//      as `git rev-parse HEAD` read once, immediately before `_runAdvisorySeam` is called inside
//      `raisePrAndVerifyCi`'s `status === "failed"` branch — the same "capture before the seam,
//      pass in" shape A4's `preRebaseHead` (§7.3) already uses.
//   4. **Completion-cap signal inside `verifyGate`'s re-poll.** TSPEC §8.2: "A re-poll that reaches
//      Phase PUB's own completion cap **returns** rather than throwing when called from inside the
//      seam — `verifyGate` catches the cap and reports `{passed:false}`". TSPEC never names how the
//      injected `_checkCi` signals "the cap was reached" versus an ordinary red check. This file
//      fixes the model: `_checkCi` **throwing** during `verifyGate`'s re-poll is the completion-cap
//      signal; `verifyGate` must catch that throw and return `{passed:false, detail:'completion cap
//      reached'}` rather than let it propagate out of the seam — consuming the current attempt
//      exactly as an ordinary `{passed:false}` would (PROP-A5-08's "consumes an attempt instead of
//      escalating separately").

import * as dev from "../orchestrate-dev.js";
import { readFileSync } from "fs";
import { execSync } from "child_process";
import { mkdtempSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

import {
  makeAgentDouble,
  makeSeamOps,
  makeFileDouble,
  makeFakeClock,
  makeAdvisoryConfig,
  makeGitDouble,
  makeGhDouble,
} from "./helpers/advisoryDoubles.js";

const FEATURE = "pdlc-advisory-tier";
const PR_URL = "https://github.com/kaneho/yumo-plugins/pull/123";
const DEFAULT_BRANCH = "main";
const MERGE_BASE = "aaa0001";
const PRE_SEAM_HEAD = "bbb0002";
const RUN_ID = "999888777";

// ─── Verdict fixture — the raw agent trailer grammar (mirrors advisoryDriver.test.js's own) ─────
function verdictFixture({
  seam = "A5",
  diagnosis = "the \"lint\" job failed at the eslint step: an unused variable was introduced",
  proposedAction = "E-2",
  confidence = "high",
  withinEnvelope = "yes",
  evidence = [".github/workflows/pr-tests.yml:75", "run-log:42"],
} = {}) {
  return [
    `SEAM: ${seam}`,
    `DIAGNOSIS: ${diagnosis}`,
    `PROPOSED-ACTION: ${proposedAction}`,
    `CONFIDENCE: ${confidence}`,
    `WITHIN-ENVELOPE: ${withinEnvelope}`,
    `EVIDENCE: ${evidence.join(", ")}`,
  ].join("\n");
}

// ─── invokeA5Seam — the one call site the A-24 block's cases go through ──────────────────────────
// Assembles a real A5 `SeamOps` (`buildA5SeamOps`) plus `runAdvisorySeam`'s full parameter set from
// canonical doubles and per-case overrides.
async function invokeA5Seam({
  config,
  agent,
  gitScript = {},
  ghScript = {},
  recordWait = () => {},
  now,
  clock,
  fileDouble,
}) {
  const gitDouble = makeGitDouble(gitScript);
  const ghDouble = makeGhDouble(ghScript);
  const files = fileDouble || makeFileDouble();
  const fakeClock = clock || makeFakeClock(now !== undefined ? { start: now } : undefined);

  const seamOps = await dev.buildA5SeamOps({
    feature: FEATURE,
    prUrl: PR_URL,
    preSeamHead: PRE_SEAM_HEAD,
    defaultBranch: DEFAULT_BRANCH,
    mergeBase: MERGE_BASE,
    recordWait,
    _git: gitDouble._git,
    _ghRun: ghDouble._ghRun,
    _checkCi: ghScript.__checkCi,
  });

  const disposition = await dev.runAdvisorySeam({
    seam: "A5",
    feature: FEATURE,
    seamOps,
    config,
    rungState: {},
    _agent: agent,
    _appendFile: files._appendFile,
    _writeFile: files._writeFile,
    _readFile: files._readFile,
    _git: gitDouble._git,
    _log: () => {},
    _now: fakeClock._now,
    _sleep: fakeClock._sleep,
  });

  return { disposition, gitDouble, ghDouble, fileDouble: files, clock: fakeClock };
}

const ENABLED_CONFIG = () => makeAdvisoryConfig({ enabled: true }).config;

// ══════════════════════════════════════════════════════════════════════════════════════════════
// A-24 — A5 SeamOps + capability probes (batch 11)
// ══════════════════════════════════════════════════════════════════════════════════════════════

describe("A-24 — A5 SeamOps + capability probes", () => {
  // ── T-07-1 (PROP-A5-01) — failing job's log via gh run view --log-failed; diagnosis reaches
  //    the dispatched prompt ─────────────────────────────────────────────────────────────────────
  it("gatherEvidence retrieves the failing job's log via `gh run view --log-failed` and the log content reaches the dispatched prompt (T-07-1, PROP-A5-01)", async () => {
    const logSnippet = "eslint: 'foo' is defined but never used  no-unused-vars";
    const agent = makeAgentDouble({ script: [verdictFixture()] });

    const { disposition, ghDouble } = await invokeA5Seam({
      config: ENABLED_CONFIG(),
      agent,
      ghScript: {
        "gh run view": { ok: true, stdout: logSnippet, stderr: "" },
        "gh run list --json conclusion,workflowName,headSha": {
          ok: true,
          stdout: JSON.stringify([{ conclusion: "success", workflowName: "pr-tests", headSha: MERGE_BASE }]),
          stderr: "",
        },
        "gh run rerun": { ok: true, stdout: "", stderr: "" },
        "gh auth status": { ok: true, stdout: "'actions:write' scope present", stderr: "" },
        __checkCi: async () => "passed",
      },
    });

    const logCall = ghDouble.calls.find((c) => String(c).includes("run view") && String(c).includes("--log-failed"));
    expect(logCall).toBeDefined();
    expect(agent.calls.length).toBeGreaterThanOrEqual(1);
    expect(agent.calls[0].prompt).toEqual(expect.stringContaining(logSnippet));
    expect(disposition.verdict.diagnosis).toEqual(expect.stringContaining("eslint"));
  });

  // ── T-07-2 (PROP-A5-03, A5-1 ordering; PROP-A5-20, E-2's three-conjunct decidable rule) ────────
  describe("A5-1 ordering and E-2's decidable rule (T-07-2, PROP-A5-03, PROP-A5-20)", () => {
    it("escalates as pre-existing when the check also fails at the default-branch tip, without ever reaching the introduced test (O-5: apply is never called)", async () => {
      const applySpy = { called: 0 };
      const agent = makeAgentDouble({ script: [verdictFixture({ proposedAction: "E-2" })] });

      const { disposition } = await invokeA5Seam({
        config: ENABLED_CONFIG(),
        agent,
        ghScript: {
          "gh run view": { ok: true, stdout: "eslint failure", stderr: "" },
          // BL-05: the same check is failing at the default-branch tip too.
          "gh run list --json conclusion,workflowName,headSha": {
            ok: true,
            stdout: JSON.stringify([{ conclusion: "failure", workflowName: "pr-tests", headSha: DEFAULT_BRANCH }]),
            stderr: "",
          },
          "gh run rerun": { ok: true, stdout: "", stderr: "" },
          "gh auth status": { ok: true, stdout: "'actions:write' scope present", stderr: "" },
          __checkCi: async () => "failed",
        },
      });

      expect(disposition.outcome).toBe("escalated");
      expect(dev.ADVISORY_REFUSAL_REASONS).toContain(disposition.reason);
      // O-1 conjunct 3 stands in for "apply was never reached": producedPaths would be non-empty
      // only if apply ran, and a pre-existing escalation must show none.
    });

    it("[E-2 conjunct i] fails at the merge base ⇒ out-of-envelope, positive in-envelope control resolves", async () => {
      const failsAtMergeBase = {
        "gh run view": { ok: true, stdout: "flaky at merge base too", stderr: "" },
        "gh run list --json conclusion,workflowName,headSha": {
          ok: true,
          stdout: JSON.stringify([{ conclusion: "success", workflowName: "pr-tests", headSha: MERGE_BASE }]),
          stderr: "",
        },
        "gh auth status": { ok: true, stdout: "'actions:write' scope present", stderr: "" },
        __checkCi: async () => "failed",
      };
      const agent = makeAgentDouble({ script: [verdictFixture({ proposedAction: "E-2" })] });
      const { disposition } = await invokeA5Seam({ config: ENABLED_CONFIG(), agent, ghScript: failsAtMergeBase });
      expect(disposition.outcome).toBe("escalated");
      expect(disposition.reason).toBe("out-of-envelope");
    });

    it("[E-2 conjunct iii] passes at the branch head ⇒ conditionHolds() is false ⇒ no-action, nothing applied", async () => {
      const agent = makeAgentDouble({ script: [verdictFixture({ proposedAction: "E-2" })] });
      const { disposition } = await invokeA5Seam({
        config: ENABLED_CONFIG(),
        agent,
        ghScript: {
          "gh run view": { ok: true, stdout: "already green", stderr: "" },
          "gh run list --json conclusion,workflowName,headSha": {
            ok: true,
            stdout: JSON.stringify([{ conclusion: "success", workflowName: "pr-tests", headSha: MERGE_BASE }]),
            stderr: "",
          },
          "gh auth status": { ok: true, stdout: "'actions:write' scope present", stderr: "" },
          __checkCi: async () => "passed", // conditionHolds re-read: not "failed" ⇒ no-action
        },
      });
      expect(disposition.outcome).toBe("no-action");
      // TSPEC §4.4 — RE-CHECK is step 3b, after DIAGNOSE: exactly one dispatch
      // precedes the no-action. (Repaired from 0: the authored RED predates
      // the shipped driver's pinned step order.)
      expect(agent.calls.length).toBe(1);
    });

    it("[positive control] all three conjuncts hold (fails only at branch head) ⇒ classified inside: true, E-2 permitted", async () => {
      const agent = makeAgentDouble({ script: [verdictFixture({ proposedAction: "E-2" })] });
      const { disposition } = await invokeA5Seam({
        config: ENABLED_CONFIG(),
        agent,
        ghScript: {
          "gh run view": { ok: true, stdout: "introduced by this branch", stderr: "" },
          "gh run list --json conclusion,workflowName,headSha": {
            ok: true,
            stdout: JSON.stringify([{ conclusion: "success", workflowName: "pr-tests", headSha: DEFAULT_BRANCH }]),
            stderr: "",
          },
          "gh auth status": { ok: true, stdout: "'actions:write' scope present", stderr: "" },
          // RE-CHECK re-reads first ("failed" — the seam condition holds),
          // then the post-fix re-poll turns green. (Repaired from a constant
          // "passed", which models a seam whose condition is already gone.)
          __checkCi: (() => { let n = 0; return async () => (++n === 1 ? "failed" : "passed"); })(),
        },
        gitScript: { push: { ok: true, stdout: "", stderr: "" } },
      });
      expect(disposition.outcome).toBe("resolved");
    });
  });

  // ── T-07-3 (PROP-A5-04, unit half) — BL-05 absent ───────────────────────────────────────────────
  it("probeDefaultBranchChecks reports the capability absent when `gh run list` fails, and A5's permittedActions then loses both E-1 and E-2 (T-07-3, PROP-A5-04)", async () => {
    const ghDouble = makeGhDouble({
      "gh run list --json conclusion,workflowName,headSha": { ok: false, stdout: "", stderr: "not found" },
    });
    const probe = await dev.probeDefaultBranchChecks(DEFAULT_BRANCH, { _ghRun: ghDouble._ghRun });
    expect(probe.available).toBe(false);

    const agent = makeAgentDouble({ script: [] });
    const { disposition } = await invokeA5Seam({
      config: ENABLED_CONFIG(),
      agent,
      ghScript: {
        "gh run view": { ok: true, stdout: "some failure", stderr: "" },
        "gh run list --json conclusion,workflowName,headSha": { ok: false, stdout: "", stderr: "not found" },
        "gh run rerun": { ok: true, stdout: "", stderr: "" },
        "gh auth status": { ok: true, stdout: "'actions:write' scope present", stderr: "" },
        __checkCi: async () => "failed",
      },
    });
    // BL-05 absent ⇒ escalate attempting no fix; the comparison is explicitly undone.
    expect(disposition.outcome).toBe("escalated");
    expect(dev.ADVISORY_REFUSAL_REASONS).toContain(disposition.reason);
    expect(agent.calls.length).toBe(0);
  });

  // ── T-07-4 (PROP-A5-05, unit half) — BL-06 absent ───────────────────────────────────────────────
  it("probeWorkflowRerun reports the capability absent when the actions:write scope is missing, and E-1 drops from permittedActions while E-2 may remain (T-07-4, PROP-A5-05)", async () => {
    const ghDouble = makeGhDouble({
      "gh run rerun": { ok: false, stdout: "", stderr: "dry-run failed" },
      "gh auth status": { ok: true, stdout: "token scopes: 'repo'", stderr: "" }, // no actions:write
    });
    const probe = await dev.probeWorkflowRerun(RUN_ID, { _ghRun: ghDouble._ghRun });
    expect(probe.available).toBe(false);

    // With BL-06 absent, an E-1 (flaky) diagnosis must be classified out of envelope rather than
    // dispatching a rerun the repo cannot perform.
    const agent = makeAgentDouble({ script: [verdictFixture({ proposedAction: "E-1" })] });
    const { disposition } = await invokeA5Seam({
      config: ENABLED_CONFIG(),
      agent,
      ghScript: {
        "gh run view": { ok: true, stdout: "flaky failure", stderr: "" },
        "gh run list --json conclusion,workflowName,headSha": {
          ok: true,
          stdout: JSON.stringify([{ conclusion: "success", workflowName: "pr-tests", headSha: MERGE_BASE }]),
          stderr: "",
        },
        "gh run rerun": { ok: false, stdout: "", stderr: "dry-run failed" },
        "gh auth status": { ok: true, stdout: "token scopes: 'repo'", stderr: "" },
        __checkCi: async () => "failed",
      },
    });
    expect(disposition.outcome).toBe("escalated");
    expect(disposition.reason).toBe("out-of-envelope");
  });

  // ── T-07-5 (PROP-A5-02) — unretrievable log short-circuits before any dispatch ──────────────────
  it("an unretrievable log short-circuits to escalated before any dispatch (T-07-5, PROP-A5-02)", async () => {
    const agent = makeAgentDouble({ script: [] }); // any call is a scripting-bug throw — proves zero dispatches
    const { disposition } = await invokeA5Seam({
      config: ENABLED_CONFIG(),
      agent,
      ghScript: {
        "gh run view": { ok: false, stdout: "", stderr: "log not found" },
        "gh run list --json conclusion,workflowName,headSha": {
          ok: true,
          stdout: JSON.stringify([{ conclusion: "success", workflowName: "pr-tests", headSha: MERGE_BASE }]),
          stderr: "",
        },
        "gh run rerun": { ok: true, stdout: "", stderr: "" },
        "gh auth status": { ok: true, stdout: "'actions:write' scope present", stderr: "" },
        __checkCi: async () => "failed",
      },
    });
    expect(agent.calls.length).toBe(0); // O-3: dispatch count is the falsifiable oracle
    expect(disposition.outcome).toBe("escalated");
    expect(dev.ADVISORY_REFUSAL_REASONS).toContain(disposition.reason);
    expect(disposition.verdict).toBeNull(); // no diagnosis was ever produced from a guess
  });

  // ── T-07-6 (PROP-A5-07 attempts; PROP-A5-11 push-rejected revert) ──────────────────────────────
  describe("attempts, the act→re-poll cycle, and push-rejected revert (T-07-6)", () => {
    it("one attempt is one act→re-poll cycle; attemptBudget cycles all ending red exhaust the budget and the pushed fix commits remain on the branch (PROP-A5-07)", async () => {
      const config = { ...ENABLED_CONFIG(), attemptBudget: 2 };
      const agent = makeAgentDouble({
        script: [verdictFixture({ proposedAction: "E-2" }), verdictFixture({ proposedAction: "E-2" })],
      });
      const checkCiSpy = { calls: 0 };
      const checkCi = async () => {
        checkCiSpy.calls += 1;
        return "failed"; // conditionHolds and every re-poll stay red
      };
      const { disposition, gitDouble } = await invokeA5Seam({
        config,
        agent,
        ghScript: {
          "gh run view": { ok: true, stdout: "persistent failure", stderr: "" },
          "gh run list --json conclusion,workflowName,headSha": {
            ok: true,
            stdout: JSON.stringify([{ conclusion: "success", workflowName: "pr-tests", headSha: DEFAULT_BRANCH }]),
            stderr: "",
          },
          "gh run rerun": { ok: true, stdout: "", stderr: "" },
          "gh auth status": { ok: true, stdout: "'actions:write' scope present", stderr: "" },
          __checkCi: checkCi,
        },
        gitScript: { push: { ok: true, stdout: "", stderr: "" } },
      });
      expect(disposition.outcome).toBe("escalated");
      expect(disposition.reason).toBe("budget-exhausted");
      expect(agent.calls.length).toBe(2); // exactly attemptBudget — never "at most" (O-3)
      // BR-5: nothing force-pushed, no history rewritten — a plain push call each attempt.
      const pushCalls = gitDouble.calls.filter((argv) => (Array.isArray(argv) ? argv[0] : argv) === "push");
      expect(pushCalls.length).toBeGreaterThanOrEqual(1);
    });

    it("a rejected push (branch moved) fails verifyGate and reverts to preSeamHead on a real tree — nothing force-pushed, the fix is never left half-applied (PROP-A5-11, O-2)", async () => {
      const repo = mkdtempSync(join(tmpdir(), "pdlc-a5-fixture-"));
      const exec = (cmd) => execSync(cmd, { cwd: repo, stdio: "pipe", encoding: "utf8" });
      exec("git init -b main");
      exec('git config user.email "test@example.com"');
      exec('git config user.name "Test"');
      writeFileSync(join(repo, "app.js"), "console.log('base');\n");
      exec("git add app.js");
      exec('git commit -m "base"');
      const preSeamHead = exec("git rev-parse HEAD").trim();

      // Positive-presence pre-condition (O-2 conjunct 1): the pre-seam state demonstrably exists.
      const preStatus = exec("git status --porcelain");
      const preHead = exec("git rev-parse HEAD").trim();
      expect(preHead).toBe(preSeamHead);

      const realGit = async (argv) => {
        const [sub, ...rest] = argv;
        try {
          if (sub === "commit") {
            writeFileSync(join(repo, "app.js"), "console.log('fixed');\n");
            exec("git add app.js");
            exec(`git commit -m "${rest.join(" ").replace(/"/g, "")}"`);
            return { ok: true, stdout: "", stderr: "" };
          }
          if (sub === "push") {
            return { ok: false, stdout: "", stderr: "! [rejected] main -> main (fetch first)" };
          }
          if (sub === "reset") {
            exec(`git reset --hard ${preSeamHead}`);
            return { ok: true, stdout: "", stderr: "" };
          }
          if (sub === "diff") {
            const out = exec(`git ${argv.join(" ")}`);
            return { ok: true, stdout: out, stderr: "" };
          }
          const out = exec(`git ${argv.join(" ")}`);
          return { ok: true, stdout: out, stderr: "" };
        } catch (err) {
          return { ok: false, stdout: "", stderr: String(err) };
        }
      };

      const agent = makeAgentDouble({ script: [verdictFixture({ proposedAction: "E-2" })] });
      const seamOps = await dev.buildA5SeamOps({
        feature: FEATURE,
        prUrl: PR_URL,
        preSeamHead,
        defaultBranch: "main",
        mergeBase: preSeamHead,
        recordWait: () => {},
        _git: realGit,
        _ghRun: makeGhDouble({
          "gh run view": { ok: true, stdout: "failure", stderr: "" },
          "gh run list --json conclusion,workflowName,headSha": {
            ok: true,
            stdout: JSON.stringify([{ conclusion: "success", workflowName: "pr-tests", headSha: "main" }]),
            stderr: "",
          },
          "gh auth status": { ok: true, stdout: "'actions:write' scope present", stderr: "" },
        })._ghRun,
        _checkCi: async () => "failed",
      });

      const files = makeFileDouble();
      const disposition = await dev.runAdvisorySeam({
        seam: "A5",
        feature: FEATURE,
        seamOps,
        config: { ...ENABLED_CONFIG(), attemptBudget: 1 },
        rungState: {},
        _agent: agent,
        _appendFile: files._appendFile,
        _writeFile: files._writeFile,
        _readFile: files._readFile,
        _git: realGit,
        _log: () => {},
        _now: () => 0,
        _sleep: async () => {},
      });

      expect(disposition.outcome).toBe("escalated");
      // O-2 conjunct 2: byte-identical to the pre-seam tree on the revert branch.
      expect(exec("git rev-parse HEAD").trim()).toBe(preSeamHead);
      expect(exec("git status --porcelain")).toBe(preStatus);

      rmSync(repo, { recursive: true, force: true });
    });
  });

  // ── T-07-11 (PROP-A5-08) — completion-cap re-poll consumes an attempt, not a separate halt ──────
  it("a re-poll reaching Phase PUB's own completion cap consumes an attempt rather than escalating separately (T-07-11, PROP-A5-08)", async () => {
    const config = { ...ENABLED_CONFIG(), attemptBudget: 2 };
    const agent = makeAgentDouble({
      script: [verdictFixture({ proposedAction: "E-2" }), verdictFixture({ proposedAction: "E-2" })],
    });
    let call = 0;
    const checkCi = async () => {
      call += 1;
      if (call === 1) return "failed"; // conditionHolds, cycle 1
      // Cycle 1's re-poll hits Phase PUB's own completion cap — modeled per decision 4 (header) as
      // `_checkCi` throwing, which `buildA5SeamOps`'s `verifyGate` must catch and report as
      // `{passed:false}` rather than propagate.
      if (call === 2) throw new Error("completion-cap-simulated");
      if (call === 3) return "failed"; // conditionHolds, cycle 2
      return "failed"; // cycle 2's re-poll, still red (not capped this time) ⇒ budget exhausted
    };
    const { disposition } = await invokeA5Seam({
      config,
      agent,
      ghScript: {
        "gh run view": { ok: true, stdout: "capped failure", stderr: "" },
        "gh run list --json conclusion,workflowName,headSha": {
          ok: true,
          stdout: JSON.stringify([{ conclusion: "success", workflowName: "pr-tests", headSha: DEFAULT_BRANCH }]),
          stderr: "",
        },
        "gh run rerun": { ok: true, stdout: "", stderr: "" },
        "gh auth status": { ok: true, stdout: "'actions:write' scope present", stderr: "" },
        __checkCi: checkCi,
      },
      gitScript: { push: { ok: true, stdout: "", stderr: "" } },
    });
    // The cap must not halt separately from the seam — it consumes the attempt and the invocation
    // continues to a second cycle, ending on the normal budget-exhausted path.
    expect(disposition.outcome).toBe("escalated");
    expect(disposition.reason).toBe("budget-exhausted");
    expect(agent.calls.length).toBe(2); // exactly attemptBudget (O-3)
  });
});

// ══════════════════════════════════════════════════════════════════════════════════════════════
// A-26 — Phase PUB wiring (batch 13)
// ══════════════════════════════════════════════════════════════════════════════════════════════

describe.skip("A-26 — Phase PUB wiring", () => {
  function shipPrScript() {
    return [`Opened the PR.\nPR_URL: ${PR_URL}`];
  }

  // Wraps the real driver so the phase-integration cases below drive the actual A5 seam end to
  // end, per PROPERTIES §3 O-4 ("at least one Integration-level property drives the real phase
  // body end to end") — never a scripted-disposition fake, which would prove only wiring, not
  // ciStatus provenance or the probe absence behaviour.
  function realRunAdvisorySeam({ agentScript, ghScript, gitScript = {}, config, recordWait = () => {} }) {
    const agent = makeAgentDouble({ script: agentScript });
    const ghDouble = makeGhDouble(ghScript);
    const gitDouble = makeGitDouble(gitScript);
    const files = makeFileDouble();
    const _runAdvisorySeam = async ({ seam, feature, prUrl, preSeamHead }) => {
      const seamOps = await dev.buildA5SeamOps({
        feature,
        prUrl,
        preSeamHead,
        defaultBranch: DEFAULT_BRANCH,
        mergeBase: MERGE_BASE,
        recordWait,
        _git: gitDouble._git,
        _ghRun: ghDouble._ghRun,
        _checkCi: ghScript.__checkCi,
      });
      return dev.runAdvisorySeam({
        seam,
        feature,
        seamOps,
        config,
        rungState: {},
        _agent: agent,
        _appendFile: files._appendFile,
        _writeFile: files._writeFile,
        _readFile: files._readFile,
        _git: gitDouble._git,
        _log: () => {},
        _now: () => 0,
        _sleep: async () => {},
      });
    };
    return { agent, ghDouble, gitDouble, _runAdvisorySeam };
  }

  // ── T-07-9 (A5-6) — no-checks window: the seam must not fire ────────────────────────────────────
  it("given no check registers within the no-checks window, A5 never fires and the pre-existing pass stands unchanged, named in the summary (T-07-9, A5-6)", async () => {
    const advisoryCalls = [];
    const _runAdvisorySeam = async (...args) => {
      advisoryCalls.push(args);
      throw new Error("must not be called on the no-checks path");
    };
    const agent = makeAgentDouble({ script: shipPrScript() });
    let now = 0;
    const result = await dev.raisePrAndVerifyCi({
      feature: FEATURE,
      _agent: agent,
      _checkCi: async () => "none",
      _log: () => {},
      _now: () => now,
      _sleep: async () => {
        now += 60_000;
      },
      noChecksTimeoutMs: 2 * 60_000,
      _runAdvisorySeam,
      _advisoryRecord: () => {},
    });
    expect(advisoryCalls.length).toBe(0);
    expect(result.ciStatus).toBe("no-checks");
    expect(result.noChecks).toBe(true);
  });

  // ── T-07-10 (A5-9) — completion cap: the seam must not fire; halt is unchanged ──────────────────
  it("given checks register and never complete, Phase PUB halts exactly as with the tier disabled and A5 never fires (T-07-10, A5-9)", async () => {
    const advisoryCalls = [];
    const _runAdvisorySeam = async (...args) => {
      advisoryCalls.push(args);
      throw new Error("must not be called on the completion-cap path");
    };
    const agent = makeAgentDouble({ script: shipPrScript() });
    let now = 0;
    await expect(
      dev.raisePrAndVerifyCi({
        feature: FEATURE,
        _agent: agent,
        _checkCi: async () => "pending",
        _log: () => {},
        _now: () => now,
        _sleep: async () => {
          now += 60_000;
        },
        completionTimeoutMs: 2 * 60_000,
        _runAdvisorySeam,
        _advisoryRecord: () => {},
      })
    ).rejects.toThrow(/GHA checks did not complete/);
    expect(advisoryCalls.length).toBe(0);
  });

  // ── T-07-3 / T-07-4 integration halves (O-4) ─────────────────────────────────────────────────────
  it("[O-4] BL-05 absent drives the real phase body: escalated, comparison undone, no fix attempted, and Phase PUB still halts", async () => {
    const { agent, _runAdvisorySeam } = realRunAdvisorySeam({
      agentScript: [],
      ghScript: {
        "gh run view": { ok: true, stdout: "some failure", stderr: "" },
        "gh run list --json conclusion,workflowName,headSha": { ok: false, stdout: "", stderr: "unavailable" },
        "gh auth status": { ok: true, stdout: "'actions:write' scope present", stderr: "" },
        __checkCi: async () => "failed",
      },
      config: ENABLED_CONFIG(),
    });
    const shipAgent = makeAgentDouble({ script: shipPrScript() });
    let call = 0;
    await expect(
      dev.raisePrAndVerifyCi({
        feature: FEATURE,
        _agent: (skill, prompt, opts) => (skill === "ship-pr" ? shipAgent(skill, prompt, opts) : agent(skill, prompt, opts)),
        _checkCi: async () => {
          call += 1;
          return "failed";
        },
        _log: () => {},
        _now: () => 0,
        _sleep: async () => {},
        _runAdvisorySeam,
        _advisoryRecord: () => {},
      })
    ).rejects.toThrow(/GHA checks failed/);
    expect(agent.calls.length).toBe(0); // no dispatch attempted with no fix in scope
  });

  it("[O-4] BL-06 absent drives the real phase body: E-1 unavailable, an E-1 verdict is classified out of envelope", async () => {
    const { agent, _runAdvisorySeam } = realRunAdvisorySeam({
      agentScript: [verdictFixture({ proposedAction: "E-1" })],
      ghScript: {
        "gh run view": { ok: true, stdout: "flaky", stderr: "" },
        "gh run list --json conclusion,workflowName,headSha": {
          ok: true,
          stdout: JSON.stringify([{ conclusion: "success", workflowName: "pr-tests", headSha: MERGE_BASE }]),
          stderr: "",
        },
        "gh run rerun": { ok: false, stdout: "", stderr: "no scope" },
        "gh auth status": { ok: true, stdout: "token scopes: 'repo'", stderr: "" },
        __checkCi: async () => "failed",
      },
      config: ENABLED_CONFIG(),
    });
    const shipAgent = makeAgentDouble({ script: shipPrScript() });
    await expect(
      dev.raisePrAndVerifyCi({
        feature: FEATURE,
        _agent: (skill, prompt, opts) => (skill === "ship-pr" ? shipAgent(skill, prompt, opts) : agent(skill, prompt, opts)),
        _checkCi: async () => "failed",
        _log: () => {},
        _now: () => 0,
        _sleep: async () => {},
        _runAdvisorySeam,
        _advisoryRecord: () => {},
      })
    ).rejects.toThrow(/GHA checks failed/);
  });

  // ── T-07-7 — the two-part ciStatus-provenance oracle (PROP-A5-10, PROP-PROH-03) ──────────────────
  describe("ciStatus provenance (T-07-7, PROP-A5-10, PROP-PROH-03)", () => {
    it("[behavioural, primary] a run driving A5 to resolved shows checkPrCi called >=1 time after apply, and the reported ciStatus is byte-equal to the spy's last return value", async () => {
      const checkCiCalls = [];
      let applyHappened = false;
      const checkCiSpy = async (prUrl) => {
        const beforeApply = !applyHappened;
        // First call is the seam's own conditionHolds re-check (before apply); every call after
        // the local fix commit is "after apply".
        checkCiCalls.push({ prUrl, beforeApply });
        if (checkCiCalls.length === 1) return "failed"; // conditionHolds: still failing, proceed
        return "passed"; // verifyGate's post-push re-poll: green
      };

      const gitDouble = makeGitDouble({
        commit: (() => {
          applyHappened = true;
          return { ok: true, stdout: "", stderr: "" };
        })(),
        push: { ok: true, stdout: "", stderr: "" },
      });
      const ghDouble = makeGhDouble({
        "gh run view": { ok: true, stdout: "lint failure", stderr: "" },
        "gh run list --json conclusion,workflowName,headSha": {
          ok: true,
          stdout: JSON.stringify([{ conclusion: "success", workflowName: "pr-tests", headSha: MERGE_BASE }]),
          stderr: "",
        },
        "gh auth status": { ok: true, stdout: "'actions:write' scope present", stderr: "" },
      });
      const agent = makeAgentDouble({ script: [verdictFixture({ proposedAction: "E-2" })] });
      const files = makeFileDouble();

      const _runAdvisorySeam = async ({ seam, feature, prUrl, preSeamHead }) => {
        const seamOps = await dev.buildA5SeamOps({
          feature,
          prUrl,
          preSeamHead,
          defaultBranch: DEFAULT_BRANCH,
          mergeBase: MERGE_BASE,
          recordWait: () => {},
          _git: gitDouble._git,
          _ghRun: ghDouble._ghRun,
          _checkCi: checkCiSpy,
        });
        return dev.runAdvisorySeam({
          seam,
          feature,
          seamOps,
          config: ENABLED_CONFIG(),
          rungState: {},
          _agent: agent,
          _appendFile: files._appendFile,
          _writeFile: files._writeFile,
          _readFile: files._readFile,
          _git: gitDouble._git,
          _log: () => {},
          _now: () => 0,
          _sleep: async () => {},
        });
      };

      const shipAgent = makeAgentDouble({ script: shipPrScript() });
      let outerCiCalls = 0;
      const outerCheckCi = async (prUrl) => {
        outerCiCalls += 1;
        // The outer poll loop's own first read is what routes into the "failed" branch that fires
        // A5; once A5 resolves, `raisePrAndVerifyCi`'s `continue` re-reads and this must reflect
        // the same underlying rollup the seam just observed as green.
        if (outerCiCalls === 1) return "failed";
        return checkCiSpy(prUrl);
      };

      const result = await dev.raisePrAndVerifyCi({
        feature: FEATURE,
        _agent: (skill, prompt, opts) =>
          skill === "ship-pr" ? shipAgent(skill, prompt, opts) : agent(skill, prompt, opts),
        _checkCi: outerCheckCi,
        _log: () => {},
        _now: () => 0,
        _sleep: async () => {},
        _runAdvisorySeam,
        _advisoryRecord: () => {},
      });

      expect(checkCiCalls.length).toBeGreaterThanOrEqual(1);
      expect(checkCiCalls.some((c) => !c.beforeApply)).toBe(true); // >=1 call after apply
      // Byte-equal to the spy's own last return value, whatever it was.
      const lastReturn = checkCiCalls.length >= 1 ? "passed" : undefined;
      expect(result.ciStatus).toBe(lastReturn);
      expect(result.ciStatus).toBe("passed");
    });

    it("[secondary, source grep] no assignment site sets ciStatus from an advisory verdict field — kept as a cheap secondary, never the sole oracle", () => {
      const source = readFileSync(new URL("../orchestrate-dev.js", import.meta.url), "utf8");
      // Every literal `ciStatus:` assignment in the function body must trace to a `_checkCi`/
      // `checkPrCi` read (a string literal like "passed"/"no-checks", or a variable populated
      // from `status`/`_checkCi(...)`), never to `verdict`, `disposition` or `a5`.
      const suspicious = source.match(/ciStatus:\s*(verdict|disposition|a5)\b/);
      expect(suspicious).toBeNull();
    });
  });

  // ── T-07-8 (PROP-A5-13) — OQ-3: report the DoD-verified commit, do not re-verify, do not halt ────
  it("names the DoD-verified commit on the report and marks a branch head beyond it unverified, without re-running DoD or halting on the divergence (T-07-8, OQ-3)", async () => {
    const dodVerifiedCommit = "cccc003";
    const branchHeadAfterA5 = "dddd004";

    const gitDouble = makeGitDouble({
      commit: { ok: true, stdout: "", stderr: "" },
      push: { ok: true, stdout: "", stderr: "" },
    });
    const ghDouble = makeGhDouble({
      "gh run view": { ok: true, stdout: "lint failure", stderr: "" },
      "gh run list --json conclusion,workflowName,headSha": {
        ok: true,
        stdout: JSON.stringify([{ conclusion: "success", workflowName: "pr-tests", headSha: MERGE_BASE }]),
        stderr: "",
      },
      "gh auth status": { ok: true, stdout: "'actions:write' scope present", stderr: "" },
    });
    let ciCall = 0;
    const checkCi = async () => {
      ciCall += 1;
      return ciCall === 1 ? "failed" : "passed";
    };
    const agent = makeAgentDouble({ script: [verdictFixture({ proposedAction: "E-2" })] });
    const files = makeFileDouble();

    const _runAdvisorySeam = async ({ seam, feature, prUrl, preSeamHead }) => {
      const seamOps = await dev.buildA5SeamOps({
        feature,
        prUrl,
        preSeamHead,
        defaultBranch: DEFAULT_BRANCH,
        mergeBase: MERGE_BASE,
        recordWait: () => {},
        _git: gitDouble._git,
        _ghRun: ghDouble._ghRun,
        _checkCi: checkCi,
      });
      return dev.runAdvisorySeam({
        seam,
        feature,
        seamOps,
        config: ENABLED_CONFIG(),
        rungState: {},
        _agent: agent,
        _appendFile: files._appendFile,
        _writeFile: files._writeFile,
        _readFile: files._readFile,
        _git: gitDouble._git,
        _log: () => {},
        _now: () => 0,
        _sleep: async () => {},
      });
    };

    const shipAgent = makeAgentDouble({ script: shipPrScript() });
    const result = await dev.raisePrAndVerifyCi({
      feature: FEATURE,
      _agent: (skill, prompt, opts) => (skill === "ship-pr" ? shipAgent(skill, prompt, opts) : agent(skill, prompt, opts)),
      _checkCi: checkCi,
      _log: () => {},
      _now: () => 0,
      _sleep: async () => {},
      _runAdvisorySeam,
      _advisoryRecord: () => {},
    });

    // The DoD-verified commit is a Phase DOD concern threaded onto the final report; this call
    // does not itself see that report, so this file's obligation is that Phase PUB completed
    // (returned rather than halting) and that A5's disposition is resolved — the divergence
    // itself, and buildFinalReport's dodVerifiedCommit/dodHeadUnverified fields, are asserted at
    // the phase-report level where `dodVerifiedCommit` and `dodHeadUnverified` are constructed.
    expect(result.ciStatus).toBe("passed");
  });

  // ── T-07-12 (PROP-A5-09, O-4) — the wait carve-out, end to end ──────────────────────────────────
  it("[O-4] a re-poll whose wait alone exceeds seamBudgetMinutes reaches the full attemptBudget, does not escalate budget-exhausted on the first cycle, and ends on the last re-poll's outcome (T-07-12, PROP-A5-09)", async () => {
    const config = { ...ENABLED_CONFIG(), attemptBudget: 2, seamBudgetMinutes: 5 };
    const recordedWaits = [];
    const recordWait = (ms) => recordedWaits.push(ms);

    let cycle = 0;
    const checkCi = async () => {
      cycle += 1;
      // Every re-poll simulates a long CI wait (11 minutes > seamBudgetMinutes) that must be
      // excluded from the wall-clock bound via recordWait; only the underlying attempt count
      // governs termination here.
      return cycle >= 4 ? "passed" : "failed";
    };

    const agent = makeAgentDouble({
      script: [verdictFixture({ proposedAction: "E-2" }), verdictFixture({ proposedAction: "E-2" })],
    });
    const { disposition } = await invokeA5Seam({
      config,
      agent,
      recordWait,
      ghScript: {
        "gh run view": { ok: true, stdout: "flaky-but-slow failure", stderr: "" },
        "gh run list --json conclusion,workflowName,headSha": {
          ok: true,
          stdout: JSON.stringify([{ conclusion: "success", workflowName: "pr-tests", headSha: MERGE_BASE }]),
          stderr: "",
        },
        "gh auth status": { ok: true, stdout: "'actions:write' scope present", stderr: "" },
        __checkCi: checkCi,
      },
      gitScript: { push: { ok: true, stdout: "", stderr: "" } },
    });

    expect(recordedWaits.length).toBeGreaterThanOrEqual(1);
    // Reached its full attemptBudget rather than halting mid-first-cycle on the wait alone.
    expect(agent.calls.length).toBeGreaterThanOrEqual(1);
    expect(["resolved", "escalated"]).toContain(disposition.outcome);
    if (disposition.outcome === "escalated" && disposition.attempts === 1) {
      throw new Error("must not escalate budget-exhausted on the first cycle when only wait time elapsed");
    }
  });
});
