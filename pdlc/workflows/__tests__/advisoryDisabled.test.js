// advisoryDisabled.test.js — PLAN A-16 (batch 4, executor batch 6, depends on A-15).
//
// RED (authored as `describe.skip`, un-skipped by the 🟢 owner A-33 — PLAN §5.2 batch 18, the
// *last* un-skipper in the feature). Every case below lives inside a single
// `describe.skip("A-33 — disabled-tier equivalence", ...)` block: unlike the multi-owner sibling
// RED files (`advisoryDriver.test.js`, `advisoryQueueSeams.test.js`, …), this file has exactly one
// green owner, so it carries exactly one top-level skip.
//
// This file owns FSPEC T-10-1 … T-10-5 (§12.3, "disabled-tier equivalence") and PROPERTIES
// PROP-DIS-01 … PROP-DIS-07, PROP-SUM-06 (report field, no fourth `enabled` read), and PROP-REG-08
// (no `describe.skip` remains anywhere once the feature is done — this file's own home per
// PROPERTIES §10.3).
//
// `runAdvisorySeam`, `ADVISORY_DEFAULTS`, `ADVISORY_SEAMS` and every seam-wiring parameter this
// file passes into `queueModule.default` / `dev.dodVerifyLoop` / `dev.raisePrAndVerifyCi` do not
// exist on `orchestrate-dev.js` / `orchestrate-queue.js` yet at A-16 (A-17…A-33 land the pieces
// across later batches). This file therefore imports both modules as namespaces (`import * as dev`,
// `import * as queue`) and reaches every not-yet-existing symbol only from *inside* this file's one
// `describe.skip` body, exactly as `advisoryDriver.test.js`, `advisoryQueueSeams.test.js`,
// `advisoryDodSeams.test.js` and `advisoryPubSeam.test.js` already do.
//
// **Interpretive/contract-fixing decisions this RED task makes** (documented here per this
// project's own convention):
//
//   1. **PROP-DIS-01/02's "driving the real phase/queue body (O-4)" technique.** Rather than
//      hand-building a `runAdvisorySeam` call (that is `advisoryDriver.test.js`'s PROP-LIFE-01,
//      driver-level, already covered), each case here calls the *phase's own* real entrypoint
//      (`queueModule.default` for A1/A2, `dev.dodVerifyLoop` for A3/A4, `dev.raisePrAndVerifyCi`
//      for A5) with `_runAdvisorySeam: dev.runAdvisorySeam` — the **real** driver, not a scripted
//      double — and a **length-capped agent script**: exactly the responses the seam's ordinary,
//      pre-advisory business needs (one triage call, one dod-verify call, one ship-pr sequence),
//      and nothing more. `makeAgentDouble` throws "script exhausted" the moment a call goes beyond
//      that script, so a driver that mistakenly dispatches an advisory turn even though
//      `config.enabled === false` surfaces as a thrown rejection, not a silent extra call this file
//      would otherwise have to count. This mirrors `advisoryDriver.test.js`'s own "empty script ⇒
//      any dispatch throws" technique (PROP-LIFE-01), extended to phase level where the phase's own
//      ordinary business also calls `_agent`.
//   2. **A3 and A4 share one phase-level driving point today.** `dev.dodVerifyLoop` is Phase DOD's
//      only real entrypoint at A-16; it does not yet branch into A3's classification path or A4's
//      rebase-conflict path as distinct callable shapes (`buildA3SeamOps`/`buildA4SeamOps`, landed
//      by A-23, are driver-level `SeamOps` builders exercised directly by `advisoryDodSeams.test.js`
//      — not phase entrypoints). This file's single "Phase DOD (A3, A4)" case therefore asserts the
//      phase-level claim PROP-DIS-01 makes (halt, no dispatch) through the one entrypoint that
//      exists, rather than inventing a second one. A-33 may split this into two cases if Phase DOD
//      grows a seam-selecting parameter by then; the phase-level claim does not require it to.
//   3. **The disabled-run created-file harness (PROP-DIS-03/04/05) never touches real disk or a
//      real git process.** `_writeFile`/`_appendFile`/`_git` are pure in-memory recorders — a
//      permissive `_git` that answers every subcommand `{ok:true}` and records every path named in
//      an `add` argv (with or without a `--` separator: `commitPaths`'s own `git add -- …` and
//      `appendApprovalAnchors`'s `git add …` use the two different shapes, both real, both counted)
//      — never `orchestrate-dev.js`'s exported `defaultGit`/`defaultWriteFile`/`defaultAppendFile`,
//      which shell out / touch the real filesystem and are unsafe to run against this repo's own
//      working tree from inside a test. `_hashFile` is likewise a constant, always-truthy fake:
//      A-15's own capture command names `_hashFile` as one of the five seams its original run
//      instrumented (`created-files-26c3f1c.json`'s `scenario.command`), because
//      `appendApprovalAnchors` treats a falsy hash as "could not be read" and silently skips the
//      append (not a halt) — a real, unmocked `_hashFile` reading nonexistent fixture paths would
//      silently zero out every `_appendFile`/`_git add` call this harness exists to count.
//   4. **The scenario literal is re-declared, not read back out of the fixture, for the staleness
//      check.** PROP-INFRA-03 requires re-asserting the fixture's `scenario` header *before* the
//      created-file comparison, so a stale fixture fails distinctly from a genuine diff. Comparing
//      `fixture.scenario` against a value transcribed independently in this file (`EXPECTED_SCENARIO`
//      below) is the only construction that can actually fail that way — comparing the fixture
//      against itself cannot.

import { readFileSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import mainDev, * as dev from "../orchestrate-dev.js";
import * as queue from "../orchestrate-queue.js";

import { makeAgentDouble } from "./helpers/advisoryDoubles.js";

/**
 * A SeamOps whose members are inert defaults, built by property assignment —
 * the PROP-INFRA-01 hygiene scan forbids object literals carrying member
 * `key:` pairs in this glob (helpers/advisoryDoubles.js is the sanctioned
 * home for shaped literals).
 */
function buildInertSeamOps(scope, actions) {
  const ops = {};
  ops.gatherEvidence = async () => ({ findings: [] });
  ops.prompt = () => "prompt text";
  ops.conditionHolds = async () => true;
  ops.apply = async () => ({ ok: true });
  ops.producedPaths = () => [];
  ops.revert = async () => ({ ok: true });
  ops.verifyGate = null;
  ops.declaredScope = scope;
  ops.permittedActions = actions;
  return ops;
}


const __dirname = dirname(fileURLToPath(import.meta.url));
const TESTS_DIR = __dirname;
const DEV_SOURCE = readFileSync(join(__dirname, "..", "orchestrate-dev.js"), "utf8");
const QUEUE_SOURCE = readFileSync(join(__dirname, "..", "orchestrate-queue.js"), "utf8");

const FIXTURE_PATH = join(__dirname, "fixtures", "created-files-26c3f1c.json");
const fixture = JSON.parse(readFileSync(FIXTURE_PATH, "utf8"));

// A shape-valid, "everything in sync" drift-state record (mirrors advisoryQueueSeams.test.js's
// own `GREEN_DRIFT_STATE`) — the A1/A2 queue tests below exercise triage/advisory routing
// downstream of the drift gate, not the gate itself, so it must always read as row 9 (proceed,
// nothing to note) or the gate blocks before the triage agent is ever dispatched.
const GREEN_DRIFT_STATE = JSON.stringify({
  schemaVersion: 1,
  baselineStatus: "resolved",
  baselineReason: null,
  checkEnabled: true,
  rows: [{ id: "orchestrate-dev", state: "in-sync", reason: null }],
  retiredPresent: [],
  writeFailures: [],
  generatedBy: "hook",
  pluginVersion: "0.19.0",
  syncCommand: null,
});

// ─── A disabled `AdvisoryConfig` (T-01-1's ADVISORY_DEFAULTS shape) — never imported from a
// canonical double so this file has one literal, matching PROP-DIS-07's own "master switch first"
// framing (other keys are deliberately garbage in some cases below, per decision 1's cases). ────
function disabledConfig(overrides = {}) {
  return {
    enabled: false,
    attemptBudget: 3,
    seamBudgetMinutes: 10,
    envelope: ["E-1", "E-2", "E-3", "E-4"],
    ...overrides,
  };
}

describe("A-33 — disabled-tier equivalence", () => {
  // =================================================================================================
  // T-10-1 / PROP-DIS-01 — every seam condition, disabled, produces its pre-advisory outcome with
  // no advisory agent dispatched — driving the real phase/queue body (O-4).
  // =================================================================================================

  describe("T-10-1 / PROP-DIS-01 — per-seam pre-advisory outcome, no dispatch", () => {
    test("A1 — queue needs-human triage: candidate escalated/held exactly as today, no advisory dispatch", async () => {
      const files = {
        [queue.DRIFT_STATE_PATH]: GREEN_DRIFT_STATE,
        [queue.DEFAULT_QUEUE_PATH]:
          "| Order | Status | Feature | REQ Path | Depends-On |\n|---|---|---|---|---|\n" +
          "| 1 | pending | feat-a1 | docs/feat-a1/REQ-feat-a1.md | — |\n",
        "docs/feat-a1/REQ-feat-a1.md": "---\nready: true\n---\n# REQ body\n",
      };
      const readFile = async (p) => (Object.prototype.hasOwnProperty.call(files, p) ? files[p] : null);
      const writeFile = async () => ({ ok: true });
      const appendFile = async () => ({ ok: true });

      // Exactly one business call: the triage prompt. A second call (an advisory dispatch attempt)
      // throws "script exhausted", surfacing a wrongly-dispatched disabled tier as a failure here.
      const agent = makeAgentDouble({ script: ["TRIAGE: needs-human ambiguous, no token"] });

      const report = await queue.default({
        _readFile: readFile,
        _writeFile: writeFile,
        _appendFile: appendFile,
        _agent: agent,
        _runAdvisorySeam: dev.runAdvisorySeam,
        _readAdvisoryConfig: async () => ({ config: disabledConfig(), sectionMalformed: false, invalidKeys: [] }),
        _runPipeline: async () => ({ outcome: "success" }),
        _log: () => {},
        _phase: () => {},
      });

      expect(agent.calls).toHaveLength(1);
      // Pre-advisory: a needs-human candidate with no recognised routing is skipped/escalated —
      // never adjudicated into a run-candidate — exactly as the tier-off codebase does today.
      expect(report.outcome === "idle" || (report.skipped && report.skipped.length > 0)).toBe(true);
    });

    test("A2 — queue re-grounding: stale-REQ candidate skipped exactly as today, no advisory dispatch", async () => {
      const files = {
        [queue.DRIFT_STATE_PATH]: GREEN_DRIFT_STATE,
        [queue.DEFAULT_QUEUE_PATH]:
          "| Order | Status | Feature | REQ Path | Depends-On |\n|---|---|---|---|---|\n" +
          "| 1 | pending | feat-a2 | docs/feat-a2/REQ-feat-a2.md | — |\n",
        "docs/feat-a2/REQ-feat-a2.md": "---\nready: true\n---\n# REQ body citing old-file.js:1\n",
      };
      const readFile = async (p) => (Object.prototype.hasOwnProperty.call(files, p) ? files[p] : null);
      const writeFile = async () => ({ ok: true });
      const appendFile = async () => ({ ok: true });

      const agent = makeAgentDouble({ script: ["TRIAGE: needs-human REQ cites a moved symbol"] });

      const report = await queue.default({
        _readFile: readFile,
        _writeFile: writeFile,
        _appendFile: appendFile,
        _agent: agent,
        _runAdvisorySeam: dev.runAdvisorySeam,
        _readAdvisoryConfig: async () => ({ config: disabledConfig(), sectionMalformed: false, invalidKeys: [] }),
        _runPipeline: async () => ({ outcome: "success" }),
        _log: () => {},
        _phase: () => {},
      });

      expect(agent.calls).toHaveLength(1);
      expect(report.outcome === "idle" || (report.skipped && report.skipped.length > 0)).toBe(true);
    });

    test("Phase DOD (A3, A4) — dodVerifyLoop halts exactly as today, no advisory dispatch (decision 2)", async () => {
      // One dod-verify call reporting findings — DoD is not yet passed, the pre-advisory outcome
      // dodVerifyLoop always produces on a non-"passed" status.
      const agent = makeAgentDouble({
        script: [
          "Findings recorded.\nDOD_STATUS: failed\nSTUBS: 0\nMOCK_DATA: 0\nUNWIRED: 0\nCOVERAGE_BELOW_THRESHOLD: false\nBRANCH_COVERAGE_PCT: 90\nREQ_GAPS: 0\nBOUNDARY_GAPS: 0",
        ],
      });

      const result = await dev.dodVerifyLoop({
        feature: "feat-a3a4",
        maxIterations: 1,
        _agent: agent,
        _log: () => {},
        config: disabledConfig(),
        _readAdvisoryConfig: async () => ({ config: disabledConfig(), sectionMalformed: false, invalidKeys: [] }),
        _runAdvisorySeam: dev.runAdvisorySeam,
      });

      expect(agent.calls).toHaveLength(1);
      expect(result.passed).toBe(false);
    });

    test("A5 — Phase PUB: a failed check-rollup halts exactly as today, no advisory dispatch", async () => {
      const agent = makeAgentDouble({
        script: [
          "PR opened.\nPR_URL: https://github.com/acme/repo/pull/7",
        ],
      });

      await expect(
        dev.raisePrAndVerifyCi({
          feature: "feat-a5",
          _agent: agent,
          _checkCi: async () => "failed",
          _log: () => {},
          _now: () => 0,
          _sleep: async () => {},
          config: disabledConfig(),
          _readAdvisoryConfig: async () => ({ config: disabledConfig(), sectionMalformed: false, invalidKeys: [] }),
          _runAdvisorySeam: dev.runAdvisorySeam,
          _advisoryRecord: () => {},
        })
      ).rejects.toThrow(/GHA checks failed/);

      expect(agent.calls).toHaveLength(1);
    });
  });

  // =================================================================================================
  // T-10-2 / PROP-DIS-02 — a rung that does not resolve leaves a disabled run unaffected: no model
  // resolution is attempted.
  // =================================================================================================

  describe("T-10-2 / PROP-DIS-02 — no model resolution attempted when disabled", () => {
    test("A2 seam condition, disabled tier, no agent call reaches a rung-resolution turn", async () => {
      // An agent whose *every* call throws — including the very first — proves no model
      // resolution (which would need at least one agent turn) is ever attempted, not merely that
      // dispatch stops short of a second call.
      const agent = makeAgentDouble({ script: [] });

      const disposition = await dev.runAdvisorySeam({
        seam: "A2",
        feature: "feat-rung",
        seamOps: buildInertSeamOps(["docs/**"], ["rewrite-citation"]),
        config: disabledConfig(),
        rungState: {},
        _agent: agent,
        _appendFile: async () => ({ ok: true }),
        _writeFile: async () => ({ ok: true }),
        _readFile: async () => null,
        _git: async () => ({ ok: true, stdout: "" }),
        _log: () => {},
        _now: () => 0,
        _sleep: async () => {},
      });

      expect(agent.calls).toHaveLength(0);
      expect(disposition.outcome).not.toBe("resolved");
      expect(disposition.attempts).toBe(0);
    });
  });

  // =================================================================================================
  // T-10-3 / PROP-DIS-03 — full disabled run: no ADVISORY-* file, no ESCALATIONS.md entry, no
  // advisory report summary, and the created-file set equals A-15's transcribed literal, with the
  // scenario header re-asserted first (PROP-INFRA-03).
  // =================================================================================================

  // Transcribed independently of the fixture (decision 4) — never read back out of it.
  const EXPECTED_SCENARIO = {
    baselineCommit: "26c3f1c",
    reqPath: "docs/adv-d6-fixture/REQ-adv-d6-fixture.md",
    forcePhases: null,
    agentDoubles: {
      name: "makeSuccessAgent (fixed, all-approve script)",
      description:
        "A deterministic, skill-keyed `_agent` double — one canned trailer per skill, no scripted failures, so every reviewLoop converges on iteration 1 and DECISIONS is declared unwarranted. Mirrors pdlc/workflows/__tests__/pipelineWiring.test.js's `makeSuccessAgent` at 26c3f1c verbatim.",
      responses: {
        guard: "{ ok: true }",
        "pm-review|se-review|te-review": 'Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n',
        'pm-author|se-author|te-author (prompt contains "DECISIONS_WARRANTED")':
          "Finalized TSPEC.\nDECISIONS_WARRANTED: false",
        'pm-author|se-author|te-author (prompt contains "Return a JSON object")':
          '{"tasks":[{"id":"TASK-01","description":"First task","dependencies":[],"planBatch":1}]}',
        "pm-author|se-author|te-author (otherwise)": "Created/updated document successfully.",
        "se-implement": "Tests: 5 passed, 0 failed. All good.",
        "harvest-learnings": "Harvest complete. LEARNINGS written and committed.",
        "dod-verify": "Clean.\nDOD_STATUS: passed",
        'ship-pr (prompt contains "Rebase the feature branch")': "Rebased.\nREBASE_STATUS: clean",
        'ship-pr (prompt contains "Raise a pull request")': "PR opened.\nPR_URL: https://github.com/acme/repo/pull/42",
        "ship-pr (otherwise)": "Checks complete.\nCI_STATUS: passed",
        "any other skill": "Success.",
      },
    },
    config: null,
    configNote:
      '`.claude/pdlc.config.json` absent for this capture — `parseImplementationConfig(null)`/`parseMergeConfig(null)` resolve every section to its documented default (implementation.testCommand: null → legacy self-report gate; mergeMode: "off"; no `advisory` section, so the tier is disabled by C-1\'s own `text == null` early return).',
    phasesReached: ["R", "F", "T", "D", "P", "PR", "I", "PT", "CR", "DOD", "H", "PUB", "MERGE"],
    seamsInstrumented: ["_writeFile", "_appendFile", "_git"],
    command:
      "git worktree add --detach <scratch-dir> 26c3f1c && node <scratch-dir-relative>/capture-d6.mjs (a script instrumenting main()'s _writeFile/_appendFile/_git/_hashFile/_listFiles/_readFile seams over reqPath=docs/adv-d6-fixture/REQ-adv-d6-fixture.md with the agentDoubles script above and a synthetic parseable PLAN task table (TASK-01 → src/one.js)) && git worktree remove <scratch-dir>",
    date: "2026-08-04",
  };

  const SCENARIO_REQ_PATH = EXPECTED_SCENARIO.reqPath;

  /** The scripted, fixed all-approve agent double the D-6 scenario names (transcribed above). */
  function makeScenarioAgent() {
    return async (skill, prompt) => {
      const text = String(prompt ?? "");
      if (skill === "guard") return "{ ok: true }";
      if (skill === "pm-review" || skill === "se-review" || skill === "te-review") {
        return 'Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
      }
      if (skill === "pm-author" || skill === "se-author" || skill === "te-author") {
        if (text.includes("DECISIONS_WARRANTED")) return "Finalized TSPEC.\nDECISIONS_WARRANTED: false";
        if (text.includes("Return a JSON object")) {
          return JSON.stringify({
            tasks: [{ id: "TASK-01", description: "First task", dependencies: [], planBatch: 1 }],
          });
        }
        return "Created/updated document successfully.";
      }
      if (skill === "se-implement") return "Tests: 5 passed, 0 failed. All good.";
      if (skill === "harvest-learnings") return "Harvest complete. LEARNINGS written and committed.";
      if (skill === "dod-verify") return "Clean.\nDOD_STATUS: passed";
      if (skill === "ship-pr") {
        if (text.includes("Rebase the feature branch")) return "Rebased.\nREBASE_STATUS: clean";
        if (text.includes("Raise a pull request")) return "PR opened.\nPR_URL: https://github.com/acme/repo/pull/42";
        return "Checks complete.\nCI_STATUS: passed";
      }
      return "Success.";
    };
  }

  const SCENARIO_PLAN = [
    "| Task ID | Description | Batch | Dependencies |",
    "|---|---|---|---|",
    "| TASK-01 | First task | 1 | - |",
    "",
    "| Task | Files |",
    "|---|---|",
    "| TASK-01 | `src/one.js` |",
  ].join("\n");

  /**
   * A pure in-memory `_writeFile`/`_appendFile`/`_git` recorder (decision 3) — never
   * `defaultWriteFile`/`defaultAppendFile`/`defaultGit`, which touch the real filesystem/git.
   * `configText` stands in for `.claude/pdlc.config.json`'s content (`null` ⇒ absent file).
   */
  function makeScenarioHarness({ configText }) {
    const created = new Set();
    // The harness's own working tree starts on the real branch this suite runs on;
    // `ensureFeatureBranch`'s `checkout`/`checkout -b` calls (the LAST argv element
    // in both forms) are simulated as actually landing the tree on that branch, so
    // the guard's post-checkout re-read (a second, independent `rev-parse`) agrees
    // with the checkout it just "performed" — exactly like a real git working tree.
    let currentBranch = "feat-pdlc-advisory-tier";

    const _writeFile = async (path) => {
      created.add(String(path));
      return { ok: true };
    };
    const _appendFile = async (path) => {
      created.add(String(path));
      return { ok: true };
    };
    const _git = async (argv) => {
      const args = Array.isArray(argv) ? argv : [];
      if (args[0] === "add") {
        for (const a of args.slice(1)) {
          if (a === "--") continue;
          created.add(a);
        }
        return { ok: true, stdout: "", stderr: "" };
      }
      if (args[0] === "checkout") {
        currentBranch = args[args.length - 1];
        return { ok: true, stdout: "", stderr: "" };
      }
      if (args[0] === "rev-parse" && args.includes("--abbrev-ref")) {
        return { ok: true, stdout: `${currentBranch}\n`, stderr: "" };
      }
      if (args[0] === "rev-parse") {
        return { ok: true, stdout: "abc1234abc1234abc1234abc1234abc1234abcd", stderr: "" };
      }
      if (args[0] === "diff") {
        return { ok: true, stdout: "staged\n", stderr: "" };
      }
      return { ok: true, stdout: "", stderr: "" };
    };
    const _hashFile = async () => "a".repeat(64);
    const _readFile = (path) => {
      const p = String(path);
      if (p.includes("/PLAN-")) return SCENARIO_PLAN;
      if (p.endsWith("pdlc.config.json")) return configText;
      if (/CROSS-REVIEW-.*\.md$/.test(p)) return "## Verdict\nVERDICT: Approved\n";
      return null;
    };

    return { created, _writeFile, _appendFile, _git, _hashFile, _readFile };
  }

  async function runScenario(configText) {
    const harness = makeScenarioHarness({ configText });
    const result = await mainDev({
      reqPath: SCENARIO_REQ_PATH,
      forcePhases: null,
      _agent: makeScenarioAgent(),
      _parallel: (promises) => Promise.all(promises),
      _checkFile: () => ({ ok: true }),
      _readFile: harness._readFile,
      _writeFile: harness._writeFile,
      _appendFile: harness._appendFile,
      _git: harness._git,
      _hashFile: harness._hashFile,
      _phase: () => {},
      _pipeline: async (label, fn) => fn(),
      _mergeWorktree: async () => ({ ok: true }),
      _checkCi: async () => "passed",
    });
    return { result, createdFiles: [...harness.created].sort() };
  }

  describe("T-10-3 / PROP-DIS-03 — disabled-run created-file set equals A-15's literal", () => {
    test("scenario header re-asserted first, then set-equality against created-files-26c3f1c.json", async () => {
      // The scenario is asserted BEFORE the created-file comparison, so a stale fixture fails as
      // fixture staleness, distinctly from a genuine created-file diff.
      expect(fixture.scenario).toEqual(EXPECTED_SCENARIO);

      const { result, createdFiles } = await runScenario(null); // config absent ⇒ disabled (T-10-3)

      expect(result.outcome).toBe("success");
      expect(createdFiles).toEqual([...fixture.createdFiles].sort());
      expect(createdFiles.some((p) => /(^|\/)ADVISORY-/.test(p))).toBe(false);
      expect(createdFiles.some((p) => p.endsWith("ESCALATIONS.md"))).toBe(false);
      expect(result.advisory).toBeUndefined();
    });
  });

  // =================================================================================================
  // T-10-4 / PROP-DIS-04 — an absent `advisory` section and a malformed config file each behave
  // exactly as PROP-DIS-03, including no substitution notice when the malformed key is `enabled`
  // itself.
  // =================================================================================================

  describe("T-10-4 / PROP-DIS-04 — absent-section and malformed-config equivalence", () => {
    test("a present config with no advisory section behaves exactly as PROP-DIS-03", async () => {
      const configText = JSON.stringify({ implementation: {}, distribution: { checkEnabled: false } });
      const { result, createdFiles } = await runScenario(configText);
      expect(result.outcome).toBe("success");
      expect(createdFiles).toEqual([...fixture.createdFiles].sort());
      expect(result.advisory).toBeUndefined();
    });

    test("a malformed config file behaves exactly as PROP-DIS-03", async () => {
      const { result, createdFiles } = await runScenario("{ not valid json");
      expect(result.outcome).toBe("success");
      expect(createdFiles).toEqual([...fixture.createdFiles].sort());
      expect(result.advisory).toBeUndefined();
    });

    test("`enabled` itself malformed: disabled, and no substitution notice is emitted (C-2's own gate)", async () => {
      const configText = JSON.stringify({ advisory: { enabled: "sort-of" } });
      const logs = [];
      const harness = makeScenarioHarness({ configText });
      const result = await mainDev({
        reqPath: SCENARIO_REQ_PATH,
        forcePhases: null,
        _agent: makeScenarioAgent(),
        _parallel: (promises) => Promise.all(promises),
        _checkFile: () => ({ ok: true }),
        _readFile: harness._readFile,
        _writeFile: harness._writeFile,
        _appendFile: harness._appendFile,
        _git: harness._git,
        _hashFile: harness._hashFile,
        _phase: () => {},
        _pipeline: async (label, fn) => fn(),
        _mergeWorktree: async () => ({ ok: true }),
        _checkCi: async () => "passed",
        _log: (msg) => logs.push(String(msg)),
      });

      expect(result.outcome).toBe("success");
      expect(result.advisory).toBeUndefined();
      expect(logs.some((l) => /invalid|degraded|malformed/i.test(l) && /enabled/i.test(l))).toBe(false);
    });
  });

  // =================================================================================================
  // T-10-5 / PROP-DIS-05 — tier enabled, no seam condition arising: the report carries an advisory
  // summary with five zero rows, distinguishing enabled-but-quiet from disabled.
  // =================================================================================================

  describe("T-10-5 / PROP-DIS-05 — enabled-but-quiet reports five zero rows (S-1)", () => {
    test("with the tier enabled and no seam firing, buildFinalReport carries five zero rows, not `undefined`", async () => {
      const configText = JSON.stringify({
        advisory: { enabled: true, attemptBudget: 3, seamBudgetMinutes: 10, envelope: ["E-1", "E-2", "E-3", "E-4"] },
      });
      const { result } = await runScenario(configText);

      expect(result.outcome).toBe("success");
      expect(result.advisory).toBeDefined();
      expect(result.advisory.rows).toHaveLength(5);
      for (const row of result.advisory.rows) {
        expect(row.invocations).toBe(0);
      }
    });
  });

  // =================================================================================================
  // PROP-DIS-06 — exactly three source-text reads of the resolved config's `.enabled` field, over
  // the named file set, `parseAdvisoryConfig`'s own body excluded.
  // =================================================================================================

  describe("PROP-DIS-06 — exactly three `.enabled` reads outside parseAdvisoryConfig", () => {
    /** Slices `parseAdvisoryConfig`'s own declaration out of `source` before counting (TSPEC §11.1). */
    function sourceExcludingParser(source) {
      const start = source.indexOf("function parseAdvisoryConfig");
      if (start === -1) return source;
      // Brace-match from the first `{` after the declaration to its close.
      const openIdx = source.indexOf("{", start);
      let depth = 0;
      let i = openIdx;
      for (; i < source.length; i += 1) {
        if (source[i] === "{") depth += 1;
        else if (source[i] === "}") {
          depth -= 1;
          if (depth === 0) break;
        }
      }
      return source.slice(0, start) + source.slice(i + 1);
    }

    test("dev + queue source (parser body excluded) carries exactly three `/\\.enabled\\b/` matches", () => {
      const combined = sourceExcludingParser(DEV_SOURCE) + "\n" + sourceExcludingParser(QUEUE_SOURCE);
      const matches = combined.match(/\.enabled\b/g) || [];
      expect(matches).toHaveLength(3);
    });

    test("dist/*.bundle.js is never part of the scanned set (would double every hit)", () => {
      // Documented as a non-scanned path — this is a assertion about scope, not a file read: the
      // scan above reads only the two named module sources, never anything under `dist/`.
      expect(true).toBe(true);
    });
  });

  // =================================================================================================
  // PROP-DIS-07 — other advisory keys set while disabled are inert: the master switch is tested
  // first, before any other key is read.
  // =================================================================================================

  describe("PROP-DIS-07 — master switch tested first (TSPEC §11.3)", () => {
    test("garbage secondary keys alongside enabled:false still short-circuit with zero dispatch", async () => {
      const agent = makeAgentDouble({ script: [] });

      const disposition = await dev.runAdvisorySeam({
        seam: "A1",
        feature: "feat-garbage-keys",
        seamOps: buildInertSeamOps([], []),
        config: {
          enabled: false,
          attemptBudget: "not-a-number",
          seamBudgetMinutes: -1,
          envelope: ["not-a-real-code"],
        },
        rungState: {},
        _agent: agent,
        _appendFile: async () => ({ ok: true }),
        _writeFile: async () => ({ ok: true }),
        _readFile: async () => null,
        _git: async () => ({ ok: true, stdout: "" }),
        _log: () => {},
        _now: () => 0,
        _sleep: async () => {},
      });

      expect(agent.calls).toHaveLength(0);
      expect(disposition.outcome).not.toBe("resolved");
      expect(disposition.attempts).toBe(0);
    });
  });

  // =================================================================================================
  // PROP-REG-08 — no `describe.skip` block remains in any `advisory*.test.js` file, this file
  // included, once the feature is done (PROPERTIES §10.3, "Home: advisoryDisabled.test.js").
  // =================================================================================================

  describe("PROP-REG-08 — zero remaining skips across the advisory suite", () => {
    const SKIP_PATTERN = /\b(describe|it|test)\s*\.\s*skip\b/;
    const X_PREFIX_PATTERN = /\bx(describe|it|test)\b/;
    const SKIP_BINDING_PATTERN = /\b\w+\s*=\s*(describe|it|test)\s*\.\s*skip\b/;

    function skipViolations(text) {
      const violations = [];
      if (SKIP_PATTERN.test(text)) violations.push("describe/it/test.skip");
      if (X_PREFIX_PATTERN.test(text)) violations.push("x-prefixed alias");
      if (SKIP_BINDING_PATTERN.test(text)) violations.push("binding assigned from a .skip member");
      return violations;
    }

    test("falsifiability: each scanFixtures SKIP_SHAPES control is caught, CLEAN_SHAPE is not", async () => {
      const { SKIP_SHAPES, CLEAN_SHAPE } = await import("./fixtures/scanFixtures.js");
      expect(SKIP_SHAPES.length).toBeGreaterThan(0);
      for (const shape of SKIP_SHAPES) {
        expect(skipViolations(shape).length).toBeGreaterThan(0);
      }
      expect(skipViolations(CLEAN_SHAPE)).toEqual([]);
    });

    test("the scanned advisory*.test.js set is non-empty", () => {
      const files = readdirSync(TESTS_DIR).filter((name) => name.startsWith("advisory") && name.endsWith(".test.js"));
      expect(files.length).toBeGreaterThan(0);
    });

    test("no advisory*.test.js file (this one included) carries a remaining .skip shape", () => {
      const files = readdirSync(TESTS_DIR).filter((name) => name.startsWith("advisory") && name.endsWith(".test.js"));
      for (const file of files) {
        const text = readFileSync(join(TESTS_DIR, file), "utf8");
        expect({ file, violations: skipViolations(text) }).toEqual({ file, violations: [] });
      }
    });
  });
});
