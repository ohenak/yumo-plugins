// learningsDispatchSet.test.js — PLAN LI-11 (RED, batch 5; TSPEC §T.5, §A.2, §A.5, §T.6, §T.7).
//
// The largest L3 suite in the feature. Owns FSPEC LI-AT-01, LI-AT-02, LI-AT-03, LI-AT-06,
// LI-AT-14 (two whole-process runs, never two loop iterations), LI-AT-23, LI-AT-24, LI-AT-29,
// LI-AT-31, LI-AT-33, LI-AT-34, LI-AT-35, plus four TSPEC-local cases carrying no FSPEC AT id:
// the composition-site set equality over `_recordDocType` (TSPEC §A.2 property 1(b)),
// `LI-T-RETRY-1…3` (TSPEC §A.2 property 2, the `RETRY-ITERATION` fixture), AC-5.2's write half
// (TSPEC §BR-15, a dedicated temp git repo), and the static seam-discipline scan over the
// region between LI-15's sentinel comments (TSPEC's filesystem-footprint table).
//
// None of this suite's subject symbols exist in `orchestrate-dev.js` yet — `LEARNINGS_TARGET_
// DOCTYPES`, `_recordDocType`, `_injectLearnings`, `LEARNINGS_CORPUS_ARGV`, the sentinel-bounded
// region itself — LI-15 (batch 7) through LI-21 (batch 13) land them in sequence. Every
// production import is therefore deferred to a dynamic `await import` inside each test body,
// exactly as `learningsSelect.test.js` (LI-07) does, so this file still loads and its `.skip`s
// take effect: a top-level `import { LEARNINGS_TARGET_DOCTYPES } from "../orchestrate-dev.js"`
// would throw at module-load time for a name the module does not export yet.
//
// Ownership of the individual `.skip` titles (PLAN LI-20/LI-21 rows): LI-20 "Greens
// `learningsDispatchSet.test.js` except its report-shape rows"; LI-21 greens exactly the
// report-shape rows, named there by id — LI-AT-23, LI-AT-24 and LI-AT-31. Every other title in
// this file is therefore titled `LI-20: …`, and those three are titled `LI-21: …`.
//
// Fixtures come from `helpers/learningsFixtures.js` (LI-02) and seam doubles from
// `helpers/seams.js` only — no ad-hoc corpus builder or ad-hoc seam double is defined here
// beyond the whole-pipeline driving harness immediately below, which is glue, not fixture data.

import { execFileSync } from "child_process";
import { mkdtempSync, rmSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import {
  buildLearningsCorpus,
  buildDivergentCorpus,
  buildRetryIterationCorpus,
  buildAt29ContaminationCorpus,
  LEARNINGS_CORPUS_DEFAULT_THRESHOLDS,
} from "./helpers/learningsFixtures.js";
import { fakeGit, fakeFs } from "./helpers/seams.js";

// TSPEC §I.1's literal, restated here (as `learningsFixtures.js` restates it) so this file can
// recognise the LEARNINGS enumeration call in a scripted `_git` without importing the
// production constant, which does not exist yet.
const LEARNINGS_CORPUS_ARGV = Object.freeze([
  "ls-files", "--cached", "--others", "--exclude-standard", "--",
  ":(glob)docs/*/LEARNINGS-*.md",
  ":(glob)docs/completed/*/LEARNINGS-*.md",
]);

function isLearningsEnumerateCall(argv) {
  return (
    Array.isArray(argv) &&
    argv[0] === "ls-files" &&
    argv.includes(":(glob)docs/*/LEARNINGS-*.md")
  );
}

// TSPEC §OQ.1's block-opening literal — the cheapest reliable marker that a composed prompt
// carries the LEARNINGS block at all, without transcribing the whole rendered form (that
// transcription belongs to `learningsBlock.test.js`'s AT-05, not here).
const LEARNINGS_BLOCK_MARKER = "--- PRIOR-FEATURE LEARNINGS";

const REQ_PATH = "docs/li11-fixture/REQ-li11-fixture.md";
const FEATURE = "li11-fixture";

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
 * A skill-keyed, deterministic all-approve `_agent` double (the same fixed script
 * `advisoryDisabled.test.js`'s `makeScenarioAgent` and `pipelineWiring.test.js`'s
 * `makeSuccessAgent` use), extended to record every `(skill, prompt)` call it receives — the
 * instrument LI-AT-01/02/03/06/29/35 read the dispatch universe off.
 *
 * @param {Array<{skill: string, prompt: string}>} calls - mutated in place, one entry per call,
 *   in dispatch order.
 * @param {{decisionsWarranted?: boolean}} [opts] - `decisionsWarranted: true` makes the TSPEC
 *   finalisation answer `DECISIONS_WARRANTED: true`, so Phase D runs and a `DECISIONS` authoring
 *   dispatch reaches the composition site. Defaults to `false` — the answer every other scenario
 *   in this file was recorded against, where Phase D is skipped for want of load-bearing
 *   alternatives. Only the composition-site set equality needs the sixth phase, and it needs it
 *   because TSPEC §A.2 property 1(a) forbids passing that equality by omission.
 */
function buildRecordingAgent(calls, { decisionsWarranted = false, reviseOnceInPhases = [] } = {}) {
  // CR round 1, TE F-02/F-08. `reviseOnceInPhases: ["R", "CR"]` makes ITERATION 1 of the named
  // phases' review rounds answer "Needs revision", which is the only way to make the pipeline
  // dispatch those phases' OPTIMIZERS. Two of them matter here:
  //   - Phase CR's optimizer is the `dispatchKind: "authoring"`, `docType: null` dispatch AC-1.2
  //     names by name — the case BR-1's second conjunct exists to exclude.
  //   - Phase R's optimizer is the only authoring dispatch whose docType is `REQ`: `main()` is
  //     handed an already-written `reqPath`, so with an all-approve script the REQ reaches the
  //     composition site on REVIEW dispatches only.
  // Under the default all-approve script neither dispatch happens, which is why BR-1's second
  // conjunct had no falsifying test: the case it excludes was absent from every dispatch
  // universe in the suite.
  //
  // The phase and iteration are both read off `reviewerPrompt`'s own opening line
  // ("Review the document at {doc} for phase {phase} of feature {feature}. This is iteration
  // {n}."), so no round counting is needed and a phase whose loop runs twice is unambiguous.
  const revisePhases = new Set(reviseOnceInPhases);
  const reviewOpening = new RegExp(
    `for phase ([A-Z]+) of feature ${FEATURE}\\. This is iteration (\\d+)\\.`
  );
  return async (skill, prompt) => {
    const text = String(prompt ?? "");
    calls.push({ skill, prompt: text });
    if (skill === "guard") return "{ ok: true }";
    if (skill === "pm-review" || skill === "se-review" || skill === "te-review") {
      const m = reviewOpening.exec(text);
      if (m && revisePhases.has(m[1]) && Number(m[2]) === 1) {
        return 'Review complete.\nVERDICT: Needs revision\n{"high": 1, "medium": 0, "low": 0}\n';
      }
      return 'Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
    }
    if (skill === "pm-author" || skill === "se-author" || skill === "te-author") {
      if (text.includes("DECISIONS_WARRANTED")) {
        return `Finalized TSPEC.\nDECISIONS_WARRANTED: ${decisionsWarranted}`;
      }
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

/**
 * The non-LEARNINGS half of `runScenario`'s `_git` script, in one place so the two doubles that
 * call `mainDev` directly — the composition-site set equality and `drivePlanRetryDispatch` —
 * answer the branch guard exactly as `runScenario` does.
 *
 * This is not decoration. `orchestrate-dev.js`'s branch guard re-observes an ok-but-empty
 * `rev-parse --abbrev-ref HEAD` and then halts the run ("3 observations, all empty — transport
 * fault suspected"), so a double that answers `{ok: true, stdout: ""}` to everything composes no
 * dispatch at all: the instrument under test then reads an empty pipeline rather than the
 * property it was written for. Every whole-pipeline suite in this repository scripts this reply.
 *
 * @param {(args: string[]) => object} onLearningsEnumerate - the reply for a LEARNINGS
 *   enumeration call, so each caller keeps its own corpus script.
 */
function buildPipelineGit(onLearningsEnumerate) {
  let currentBranch = `feat-${FEATURE}`;
  return fakeGit((argv) => {
    const args = Array.isArray(argv) ? argv : [];
    if (isLearningsEnumerateCall(args)) return onLearningsEnumerate(args);
    if (args[0] === "add") return { ok: true, stdout: "", stderr: "" };
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
    if (args[0] === "diff") return { ok: true, stdout: "staged\n", stderr: "" };
    return { ok: true, stdout: "", stderr: "" };
  });
}

/**
 * Drives a real `mainDev` run, fully seamed (no real disk or git process touched by the subject
 * run), over a LEARNINGS corpus supplied by the caller. `corpus` is a `learningsFixtures.js`
 * `{contents, lsFilesStdout}` shape; `gitEnumerateScript`, when given, overrides the constant
 * `lsFilesStdout` reply with a per-call script (for `DIVERGENT-CORPUS` / `RETRY-ITERATION`).
 *
 * @param {object} opts
 * @param {{contents: Record<string,string>, lsFilesStdout: string}} [opts.corpus]
 * @param {Array<object>} [opts.gitEnumerateScript] - one entry per LEARNINGS enumerate call.
 * @param {string|null} [opts.configText]
 * @param {object} [opts.forcePhases]
 * @returns {Promise<{result: object, calls: Array<{skill:string, prompt:string}>,
 *   created: string[], git: object}>}
 */
async function runScenario({
  corpus = null,
  gitEnumerateScript = null,
  configText = null,
  forcePhases = null,
  agentOpts = {},
  _recordDocType = () => {},
  listFiles = null,
} = {}) {
  const dev = await import("../orchestrate-dev.js");
  const mainDev = dev.default;

  const calls = [];
  const created = new Set();
  let currentBranch = `feat-${FEATURE}`;
  let learningsCallIndex = 0;

  const _readFile = (path) => {
    const p = String(path);
    if (p.endsWith("pdlc.config.json")) return configText;
    if (p.includes("/PLAN-")) return SCENARIO_PLAN;
    if (/CROSS-REVIEW-.*\.md$/.test(p)) return "## Verdict\nVERDICT: Approved\n";
    if (corpus && Object.prototype.hasOwnProperty.call(corpus.contents, p)) return corpus.contents[p];
    return null;
  };
  const _writeFile = async (path) => {
    created.add(String(path));
    return { ok: true };
  };
  const _appendFile = async (path) => {
    created.add(String(path));
    return { ok: true };
  };
  const _git = fakeGit((argv) => {
    const args = Array.isArray(argv) ? argv : [];
    if (isLearningsEnumerateCall(args)) {
      const stdout = gitEnumerateScript
        ? gitEnumerateScript[Math.min(learningsCallIndex, gitEnumerateScript.length - 1)]
        : { ok: true, stdout: corpus ? corpus.lsFilesStdout : "" };
      learningsCallIndex += 1;
      return stdout;
    }
    if (args[0] === "add") return { ok: true, stdout: "", stderr: "" };
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
    if (args[0] === "diff") return { ok: true, stdout: "staged\n", stderr: "" };
    return { ok: true, stdout: "", stderr: "" };
  });

  const result = await mainDev({
    reqPath: REQ_PATH,
    forcePhases,
    // Passed ONLY when a caller asks for it (CR round 1, PM F-07): every other scenario in this
    // file leaves `_listFiles` at its shipped default, so their review state — and therefore
    // their episode modes, round windows and prompts — are untouched by this option's existence.
    ...(listFiles ? { _listFiles: listFiles } : {}),
    _agent: buildRecordingAgent(calls, agentOpts),
    _recordDocType,
    _parallel: (promises) => Promise.all(promises),
    _checkFile: () => ({ ok: true }),
    _readFile,
    _writeFile,
    _appendFile,
    _git,
    _hashFile: async () => "a".repeat(64),
    _phase: () => {},
    _pipeline: async (label, fn) => fn(),
    _mergeWorktree: async () => ({ ok: true }),
    _checkCi: async () => "passed",
  });

  return { result, calls, created: [...created], git: _git };
}

/** Whether a composed prompt carries the LEARNINGS block (TSPEC §OQ.1). */
function carriesLearningsBlock(promptText) {
  return String(promptText).includes(LEARNINGS_BLOCK_MARKER);
}

const AUTHORING_SKILLS = new Set(["pm-author", "se-author", "te-author"]);

describe("learningsDispatchSet — Group 1: the material reaches the authoring roles (FSPEC AT-01/02/03/06)", () => {
  test("LI-20: LI-AT-01 — an authoring dispatch's prompt contains material from at least one prior-feature document, delimited and identified by source path", async () => {
    const corpus = buildLearningsCorpus([
      {
        path: "docs/completed/prior-feature/LEARNINGS-prior-feature.md",
        doc: {
          feature: "prior-feature",
          dateCompleted: "2026-01-01",
          sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }],
        },
      },
    ]);
    const { calls } = await runScenario({ corpus });

    const authoringCalls = calls.filter((c) => AUTHORING_SKILLS.has(c.skill));
    expect(authoringCalls.length).toBeGreaterThan(0);
    const withBlock = authoringCalls.filter((c) => carriesLearningsBlock(c.prompt));
    expect(withBlock.length).toBeGreaterThan(0);
    for (const c of withBlock) {
      expect(c.prompt).toContain("docs/completed/prior-feature/LEARNINGS-prior-feature.md");
    }
  });

  test("LI-20: LI-AT-02 — set equality over the whole dispatch universe: the subset carrying a block equals BR-1's two-conjunct rule's subset", async () => {
    const corpus = buildLearningsCorpus([
      {
        path: "docs/completed/prior-feature/LEARNINGS-prior-feature.md",
        doc: {
          feature: "prior-feature",
          dateCompleted: "2026-01-01",
          sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }],
        },
      },
    ]);
    const { calls } = await runScenario({ corpus });

    // The whole universe: every agent invocation the run makes, not only those already
    // classified authoring (FSPEC AT-02). BR-1's rule (dispatchKind === "authoring" AND
    // docType is one of the six C-1 types) is approximated here by skill membership, since
    // dispatchKind/docType are not surfaced to `_agent` directly — this is the composition-site
    // set equality's job (below), which reads the seam probe instead.
    const carryingBlock = new Set(
      calls.map((c, i) => i).filter((i) => carriesLearningsBlock(calls[i].prompt))
    );
    const expectedAuthoring = new Set(
      calls.map((c, i) => i).filter((i) => AUTHORING_SKILLS.has(calls[i].skill))
    );
    expect(carryingBlock).toEqual(expectedAuthoring);
  });

  test("LI-20: LI-AT-03 — every dispatch outside BR-1's rule is byte-identical to the recorded pre-feature baseline", async () => {
    const corpus = buildLearningsCorpus([
      {
        path: "docs/completed/prior-feature/LEARNINGS-prior-feature.md",
        doc: { feature: "prior-feature", dateCompleted: "2026-01-01", sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }] },
      },
    ]);
    const enabledRun = await runScenario({ corpus });
    const disabledRun = await runScenario({ corpus, configText: JSON.stringify({ learningsInjection: { enabled: false } }) });

    // Same call sequence, and the review/non-authoring dispatches — outside BR-1's rule — are
    // byte-identical between the enabled and disabled runs, since only an authoring dispatch's
    // block can differ (§A.2 property 3).
    expect(enabledRun.calls.length).toBe(disabledRun.calls.length);
    for (let i = 0; i < enabledRun.calls.length; i += 1) {
      if (AUTHORING_SKILLS.has(enabledRun.calls[i].skill)) continue;
      expect(enabledRun.calls[i].prompt).toBe(disabledRun.calls[i].prompt);
    }
  });

  test("LI-20: LI-AT-06 — the grounding manifest, upstream documents and pacing contract are present, unchanged, and in order; the block is purely additive", async () => {
    const corpus = buildLearningsCorpus([
      {
        path: "docs/completed/prior-feature/LEARNINGS-prior-feature.md",
        doc: { feature: "prior-feature", dateCompleted: "2026-01-01", sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }] },
      },
    ]);
    const enabledRun = await runScenario({ corpus });
    const disabledRun = await runScenario({ corpus, configText: JSON.stringify({ learningsInjection: { enabled: false } }) });

    const withBlock = enabledRun.calls.find((c) => carriesLearningsBlock(c.prompt));
    expect(withBlock).toBeTruthy();
    const idx = enabledRun.calls.indexOf(withBlock);
    const disabledEquivalent = disabledRun.calls[idx];
    expect(disabledEquivalent).toBeTruthy();

    // §A.2 property 3: a suffix, never an insertion. The pre-existing prompt text (the disabled
    // run's byte-identical prompt) is a strict, order-preserving prefix of the enabled run's, and
    // the block appears only after it.
    expect(withBlock.prompt.startsWith(disabledEquivalent.prompt)).toBe(true);
    const blockIndex = withBlock.prompt.indexOf(LEARNINGS_BLOCK_MARKER);
    expect(blockIndex).toBeGreaterThanOrEqual(disabledEquivalent.prompt.length);
  });
});

describe("learningsDispatchSet — Group 2: determinism, fail-open, and inertness (FSPEC AT-14/23/24/29/31)", () => {
  test("LI-20: LI-AT-14 — two whole-process runs over an identical fixture repository state compose byte-identical blocks, including order", async () => {
    // "Two whole-process runs, not two loop iterations" (TE F-02): this test invokes
    // `runScenario` twice, each a fresh call into a dynamically re-imported module namespace —
    // never one run whose loop retries once — so an in-process memo (E-32, forbidden by AC-3.2)
    // cannot masquerade as determinism.
    const corpusSpec = [
      {
        path: "docs/completed/prior-a/LEARNINGS-prior-a.md",
        doc: { feature: "prior-a", dateCompleted: "2026-01-01", sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }] },
      },
      {
        path: "docs/completed/prior-b/LEARNINGS-prior-b.md",
        doc: { feature: "prior-b", dateCompleted: "2026-01-02", sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }] },
      },
    ];
    const run1 = await runScenario({ corpus: buildLearningsCorpus(corpusSpec) });
    const run2 = await runScenario({ corpus: buildLearningsCorpus(corpusSpec) });

    const authoring1 = run1.calls.filter((c) => AUTHORING_SKILLS.has(c.skill) && carriesLearningsBlock(c.prompt));
    const authoring2 = run2.calls.filter((c) => AUTHORING_SKILLS.has(c.skill) && carriesLearningsBlock(c.prompt));
    expect(authoring1.length).toBeGreaterThan(0);
    expect(authoring1.map((c) => c.prompt)).toEqual(authoring2.map((c) => c.prompt));
  });

  test("LI-21: LI-AT-24 — no prior LEARNINGS at all: every authoring dispatch is byte-identical to baseline, and the report records corpus-level RSN-EMPTY", async () => {
    const emptyCorpus = buildLearningsCorpus([]);
    const enabledRun = await runScenario({ corpus: emptyCorpus });
    const disabledRun = await runScenario({ corpus: emptyCorpus, configText: JSON.stringify({ learningsInjection: { enabled: false } }) });

    expect(enabledRun.calls.map((c) => c.prompt)).toEqual(disabledRun.calls.map((c) => c.prompt));
    expect(enabledRun.result.report).toBeTruthy();
    const dispatches = enabledRun.result.report.learningsInjection.dispatches;
    expect(dispatches.length).toBeGreaterThan(0);
    expect(dispatches.every((d) => d.corpusOutcome === "RSN-EMPTY")).toBe(true);
  });

  test("LI-20: LI-AT-29 — enabled vs. disabled: verdicts, completeness scores, round-window counters, approval anchors and erratum routes are equal member for member", async () => {
    const contamination = buildAt29ContaminationCorpus();
    const enabledRun = await runScenario({ corpus: contamination });
    const disabledRun = await runScenario({ corpus: contamination, configText: JSON.stringify({ learningsInjection: { enabled: false } }) });

    // CR round 1, PM F-02 / TE F-01 (High). This comparison previously read
    // `report.verdicts`, `.completenessScores`, `.roundWindows`, `.approvalAnchors` and
    // `.erratumRoutes` — FIVE KEYS `buildFinalReport` DOES NOT EMIT. Every `?? null` resolved to
    // `null` on both arms and the assertion was `{5 nulls} === {5 nulls}`: AC-4.3, the AC that
    // says no injection-derived value reaches a gate input, had no live oracle at all.
    //
    // The five gate inputs are read here where they ACTUALLY live (PM's Q-01 second branch:
    // rewrite the oracle, do not grow the production report to fit it):
    //   verdicts + round windows -> `report.phases[]`, whose rows carry each phase's `status`,
    //       `detail` ("Approved (N iterations)") and `iterations` count. A verdict parsed
    //       differently, or a round window opened at a different index, changes a row.
    //   approval anchors        -> `report.artifactPaths`, which is exactly where `reviewLoop`'s
    //       `anchoredPaths` are surfaced (`orchestrate-dev.js`, `reviewLoop`'s "Call site A"
    //       comment and both `main()` push sites).
    //   erratum routes          -> `report.notices` (erratum routing and every ignored-erratum
    //       diagnostic land there) plus the erratum-dispatch prompt set asserted below.
    //   completeness            -> `report.outcome` / `testSummary` / `harvestStatus`, the
    //       gate-derived terminal values a completeness failure moves.
    const observe = (r) => ({
      phases: r.result.report.phases,
      artifactPaths: r.result.report.artifactPaths,
      notices: r.result.report.notices,
      outcome: r.result.report.outcome,
      testSummary: r.result.report.testSummary,
      harvestStatus: r.result.report.harvestStatus,
    });
    const enabledObserved = observe(enabledRun);
    expect(enabledObserved).toEqual(observe(disabledRun));

    // The controls, without which the equality above is the old defect in a new spelling: every
    // observable must actually carry a value, and the round-window/verdict observable must
    // actually carry the per-phase iteration arithmetic. `{undefined} === {undefined}` is not an
    // oracle. (PM's standing recommendation: a "the instrument fires" assertion beside every
    // negative claim.)
    expect(Array.isArray(enabledObserved.phases)).toBe(true);
    expect(enabledObserved.phases.length).toBeGreaterThan(0);
    expect(enabledObserved.phases.some((p) => typeof p.iterations === "number")).toBe(true);
    expect(enabledObserved.phases.some((p) => /Approved \(\d+ iterations?\)/.test(String(p.detail ?? "")))).toBe(true);
    expect(Array.isArray(enabledObserved.artifactPaths)).toBe(true);
    expect(enabledObserved.artifactPaths.length).toBeGreaterThan(0);
    expect(Array.isArray(enabledObserved.notices)).toBe(true);
    expect(typeof enabledObserved.outcome).toBe("string");

    // Every dispatch prompt outside BR-1's rule is byte-identical to the recorded baseline —
    // here approximated as byte-identical between the two runs at the same call index, since
    // the contamination corpus's tokens (line-initial VERDICT:/ERRATUM:/REVISION-COMPLETE:) must
    // never leak into gate-input parsing through a channel other than the block itself.
    for (let i = 0; i < enabledRun.calls.length; i += 1) {
      if (AUTHORING_SKILLS.has(enabledRun.calls[i].skill)) continue;
      expect(enabledRun.calls[i].prompt).toBe(disabledRun.calls[i].prompt);
    }
  });

  test("LI-21: LI-AT-31 — `learningsInjection.enabled` explicitly false: every composed dispatch is byte-identical to baseline and no injection key is carried (absent, not present-and-empty)", async () => {
    const corpus = buildLearningsCorpus([
      {
        path: "docs/completed/prior-a/LEARNINGS-prior-a.md",
        doc: { feature: "prior-a", dateCompleted: "2026-01-01", sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }] },
      },
    ]);
    const disabledRun = await runScenario({
      corpus,
      configText: JSON.stringify({ learningsInjection: { enabled: false } }),
    });
    const noCorpusRun = await runScenario({
      corpus: buildLearningsCorpus([]),
      configText: JSON.stringify({ learningsInjection: { enabled: false } }),
    });

    expect(disabledRun.calls.map((c) => c.prompt)).toEqual(noCorpusRun.calls.map((c) => c.prompt));
    expect(disabledRun.calls.some((c) => carriesLearningsBlock(c.prompt))).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(disabledRun.result.report, "learningsInjection")).toBe(false);
  });

  test("LI-21: LI-AT-23 — the author-emitted channels a run requires equal the recorded pre-feature baseline set: no erratum opens on account of an injected document, no new channel appears", async () => {
    const corpus = buildLearningsCorpus([
      {
        path: "docs/completed/prior-a/LEARNINGS-prior-a.md",
        doc: { feature: "prior-a", dateCompleted: "2026-01-01", sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }] },
      },
    ]);
    const enabledRun = await runScenario({ corpus });
    const disabledRun = await runScenario({ corpus, configText: JSON.stringify({ learningsInjection: { enabled: false } }) });

    const channelSkills = (r) => new Set(r.calls.map((c) => c.skill));
    expect(channelSkills(enabledRun)).toEqual(channelSkills(disabledRun));

    // CR round 1, PM F-04 (Medium). The negative clause below previously read
    // `report.erratumRoutes` — an absent key — so its subject was the literal string `"[]"` and
    // it could never fail. It is now paired, on the same run, with the POSITIVE half AC-3.4
    // itself names: "the report's AC-3.1 rows name the source document — the trace an operator
    // follows". Both halves range over `report.learningsInjection`, which exists.
    const SOURCE_PATH = "docs/completed/prior-a/LEARNINGS-prior-a.md";
    const injection = enabledRun.result.report.learningsInjection;
    expect(injection).toBeTruthy();

    // Positive: the source document IS named, in BR-8's rows, on at least one dispatch — the
    // control that proves the instrument can see an injected path at all.
    const rowPaths = injection.dispatches.flatMap((d) => d.rows.map((row) => row.sourcePath));
    expect(rowPaths).toContain(SOURCE_PATH);

    // Negative: and NOWHERE else in the report. The subject is the whole serialised report minus
    // the `learningsInjection` key — i.e. every gate-facing field an operator or a downstream
    // consumer reads — so a source path leaking into an erratum route, a notice, a phase detail
    // or an artifact path reds this, whichever channel it takes. `erratumRoutes` was one guess at
    // that channel; this asserts over all of them without having to guess.
    const { learningsInjection: _injectionKey, ...reportWithoutInjection } = enabledRun.result.report;
    expect(JSON.stringify(reportWithoutInjection)).not.toContain(SOURCE_PATH);
    // The control for the negative: the instrument is looking at a non-trivial subject.
    expect(JSON.stringify(reportWithoutInjection).length).toBeGreaterThan(100);
  });
});

describe("learningsDispatchSet — per-dispatch context: `mode` (TSPEC §D.2, no FSPEC AT id)", () => {
  // CR round 1, PM F-07 (Medium). TSPEC §D.2 lists `mode` beside `phaseId`/`docType` as the
  // per-dispatch context "that lets an operator find the dispatch". `buildLearningsInjector`'s
  // closure has always destructured `mode` and copied it onto the record, but the ONE production
  // caller — the composition site in `runDispatch` — omitted the argument, because injection ran
  // BEFORE `selectMode` was consulted. Every shipped record therefore carried `mode: undefined`,
  // which `JSON.stringify` drops entirely: the field an operator was promised was absent from
  // every serialised report, and no test in the suite looked at it.
  //
  // This test drives the PRODUCTION caller (`mainDev`) and reads `mode` off the report, so it
  // reds under the old ordering (`undefined`) and under any future change that hoists injection
  // back above `selectMode`.
  test("LI-20: every injected dispatch's `mode` is the mode `selectMode` chose for THAT episode — `revision` for the docType whose branch already carries a dual-approved round, `authoring` for the rest", async () => {
    const corpus = buildLearningsCorpus([
      {
        path: "docs/completed/prior-a/LEARNINGS-prior-a.md",
        doc: { feature: "prior-a", dateCompleted: "2026-01-01", sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }] },
      },
    ]);

    // The branch already carries a round-1 cross-review per reviewer role FOR TSPEC ONLY, and
    // `runScenario`'s `_readFile` answers every `CROSS-REVIEW-*.md` with "VERDICT: Approved".
    // `selectMode` rule 2 therefore puts the TSPEC episode in `revision` ("every observed round
    // is dual-approved; addressing round 1"), while `deriveRoundWindow` skips these basenames for
    // every OTHER docType (`result.docType !== docType` is its third outcome), leaving those
    // episodes greenfield. One run, two modes, and the difference is attributable to the listing.
    const listFiles = async (dirPath) =>
      dirPath === `docs/${FEATURE}`
        ? {
            ok: true,
            files: [
              "CROSS-REVIEW-software-engineer-TSPEC.md",
              "CROSS-REVIEW-test-engineer-TSPEC.md",
            ],
          }
        : { ok: false, reason: "dir_missing" };

    const { result } = await runScenario({ corpus, listFiles });

    const dispatches = result.report.learningsInjection.dispatches;
    expect(dispatches.length).toBeGreaterThan(0);

    // (1) The field is present and typed on EVERY record — the clause that reds on `undefined`.
    expect(dispatches.every((d) => typeof d.mode === "string")).toBe(true);

    // (2) Set equality against `selectMode`'s two-member codomain, both members observed in this
    // one run — not containment, so a run that silently produced only one kind of episode reds
    // rather than passing by omission.
    expect(new Set(dispatches.map((d) => d.mode))).toEqual(new Set(["authoring", "revision"]));

    // (3) And it is THIS episode's mode, not a run-level constant and not the docType-blind
    // default: the docType whose review round the listing supplies is the one recorded
    // `revision`, and its neighbours in the same run are recorded `authoring`.
    const modesFor = (docType) => dispatches.filter((d) => d.docType === docType).map((d) => d.mode);
    expect(modesFor("TSPEC").length).toBeGreaterThan(0);
    expect(modesFor("TSPEC").every((m) => m === "revision")).toBe(true);
    expect(modesFor("FSPEC").length).toBeGreaterThan(0);
    expect(modesFor("FSPEC").every((m) => m === "authoring")).toBe(true);
  });
});

describe("learningsDispatchSet — the composition-site set equality (TSPEC §A.2 property 1, no FSPEC AT id)", () => {
  // TSPEC §A.2 property 1(b): the expected value at the composition site is the FULL site
  // enumeration — LEARNINGS_TARGET_DOCTYPES ∪ {null, "LEARNINGS"} — never the accepted set
  // alone. Both literals are hand-transcribed (DC-14), never imported from the constant under
  // test, and both are asserted as EQUALITY, never containment (PM F-01).
  const HAND_TRANSCRIBED_TARGET_DOCTYPES = Object.freeze([
    "REQ", "FSPEC", "TSPEC", "PLAN", "DECISIONS", "PROPERTIES",
  ]);
  const HAND_TRANSCRIBED_COMPOSITION_SITE_SET = Object.freeze([
    ...HAND_TRANSCRIBED_TARGET_DOCTYPES, null, "LEARNINGS",
  ]);

  test("LI-20: the docType set observed at the composition site equals LEARNINGS_TARGET_DOCTYPES ∪ {null, \"LEARNINGS\"}, and the accepted set equals LEARNINGS_TARGET_DOCTYPES — both set equality, never containment", async () => {
    const dev = await import("../orchestrate-dev.js");
    const mainDev = dev.default;

    const observedDocTypes = [];
    const acceptedDocTypes = [];
    // CR round 1, TE F-08. The probe reads the composition site's OWN decision (`injectHere`,
    // the 2nd argument) rather than re-applying the hand-transcribed literal to the docType.
    // The previous shape asserted `literal ∩ observed === literal`, which is true by
    // construction of the filter and never consulted the production predicate at all — the
    // proximate reason F-02's mutant (`injectHere = dispatchKind === "authoring"`) survived.
    // The literal stays hand-transcribed; what changed is that it is now the EXPECTED value of
    // a set the production code computed, not the recipe the test used to compute the set.
    const _recordDocType = (docType, injectHere) => {
      observedDocTypes.push(docType);
      if (injectHere === true) acceptedDocTypes.push(docType);
    };

    const corpus = buildLearningsCorpus([
      {
        path: "docs/completed/prior-a/LEARNINGS-prior-a.md",
        doc: { feature: "prior-a", dateCompleted: "2026-01-01", sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }] },
      },
    ]);
    const calls = [];
    const _git = buildPipelineGit(() => ({ ok: true, stdout: corpus.lsFilesStdout }));
    const _readFile = (path) => {
      const p = String(path);
      if (p.includes("/PLAN-")) return SCENARIO_PLAN;
      if (Object.prototype.hasOwnProperty.call(corpus.contents, p)) return corpus.contents[p];
      return null;
    };

    await mainDev({
      reqPath: REQ_PATH,
      forcePhases: null,
      // `decisionsWarranted: true` is what makes Phase D run: with the default answer the
      // pipeline skips it for want of load-bearing alternatives and `DECISIONS` never reaches
      // the composition site, which would fail (a) below for a fixture reason.
      // `reviseOnceInPhases: ["R"]` is the second half of the same premise (CR round 1, TE F-08):
      // `main()` is handed an already-written REQ, so with an all-approve script the REQ docType
      // reaches the composition site on REVIEW dispatches only and `injectHere` is never true
      // for it. Reddening Phase R's first round dispatches pm-author as R's optimizer — the run's
      // only `docType: "REQ"` AUTHORING dispatch — which is what makes (b) below assert the FULL
      // six-member literal against a set the production predicate computed, rather than against
      // five members plus an unnoticed hole. The previous shape could not see the hole because it
      // re-derived the accepted set from the literal itself. `"CR"` is here for the converse
      // reason: it puts the `docType: null` AUTHORING dispatch in the universe, so (b) reds under
      // the F-02 mutant too, not only the dedicated AC-1.2 test below.
      _agent: buildRecordingAgent(calls, { decisionsWarranted: true, reviseOnceInPhases: ["R", "CR"] }),
      _parallel: (promises) => Promise.all(promises),
      _checkFile: () => ({ ok: true }),
      _readFile,
      _writeFile: async () => ({ ok: true }),
      _appendFile: async () => ({ ok: true }),
      _git,
      _hashFile: async () => "a".repeat(64),
      _phase: () => {},
      _pipeline: async (label, fn) => fn(),
      _mergeWorktree: async () => ({ ok: true }),
      _checkCi: async () => "passed",
      _recordDocType,
    });

    // (a) every authoring phase was exercised: the observed set equals the literal, never
    // merely contained in it.
    expect(new Set(observedDocTypes)).toEqual(new Set(HAND_TRANSCRIBED_COMPOSITION_SITE_SET));
    // (b) the accepted set — the docTypes for which the PRODUCTION `injectHere` returned true —
    // is strictly narrower, equal to LEARNINGS_TARGET_DOCTYPES alone. Because `acceptedDocTypes`
    // is now populated from the production decision, this equality is the falsifying oracle for
    // BR-1's SECOND conjunct: under `injectHere = dispatchKind === "authoring"` the accepted set
    // gains `null` (Phase CR's optimizer, the case AC-1.2 names by name) and `"LEARNINGS"`
    // (Phase H's harvest is not authoring, but the CR optimizer alone suffices), and this line
    // reds. (c) below is the same claim read off the served artifact rather than the seam.
    expect(new Set(acceptedDocTypes)).toEqual(new Set(HAND_TRANSCRIBED_TARGET_DOCTYPES));
    // The control that makes (b) non-vacuous: the probe did fire with a REJECTED docType, so
    // the two sets differ by observation, not by an empty accepted set.
    expect(observedDocTypes.length).toBeGreaterThan(acceptedDocTypes.length);
    expect(new Set(observedDocTypes).has(null)).toBe(true);
  });
});

describe("learningsDispatchSet — AC-1.2: the docType: null AUTHORING dispatch (Phase CR's optimizer)", () => {
  // CR round 1, TE F-02 (High). AC-1.2 names one case by name: "any dispatch the pipeline tags
  // authoring whose target is none of C-1's six document types — the code-review phase's
  // optimizer at HEAD". Before this test, mutating the composition site from
  //
  //     dispatchKind === "authoring" && LEARNINGS_TARGET_DOCTYPES.includes(docType)
  // to
  //     dispatchKind === "authoring"
  //
  // left the ENTIRE repository green, because no scenario in the suite ever dispatched that
  // case: every reviewer approved on iteration 1, so Phase CR's optimizer was never reached.
  // `reviseOnceInPhases: ["CR"]` reds the first CR round, which dispatches it.
  //
  // The oracle has two halves, both required. The seam half reads the production `injectHere`
  // for that dispatch. The prompt half reads the served artifact — the composed prompt the
  // optimizer actually receives — identified by `optimizerPrompt`'s own opening for a phase-CR,
  // whole-directory target. Neither half is derivable from the other.
  test("LI-20: AC-1.2 — Phase CR's optimizer is an authoring dispatch with docType null; injectHere is false for it and its composed prompt carries no block", async () => {
    const corpus = buildLearningsCorpus([
      {
        path: "docs/completed/prior-a/LEARNINGS-prior-a.md",
        doc: { feature: "prior-a", dateCompleted: "2026-01-01", sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }] },
      },
    ]);

    /** @type {Array<{docType: string|null, injectHere: boolean, dispatchKind: string}>} */
    const decisions = [];
    const { calls } = await runScenario({
      corpus,
      agentOpts: { reviseOnceInPhases: ["CR"] },
      _recordDocType: (docType, injectHere, dispatchKind) => {
        decisions.push({ docType, injectHere, dispatchKind });
      },
    });

    // (1) The control: the case AC-1.2 names is IN this run's dispatch universe. Without this
    // line the assertions below are vacuously true on a run that never reached Phase CR.
    const nullAuthoring = decisions.filter(
      (d) => d.dispatchKind === "authoring" && d.docType === null
    );
    expect(nullAuthoring.length).toBeGreaterThan(0);

    // (2) The seam half: the production predicate refused every one of them. This is the line
    // that reds under `injectHere = dispatchKind === "authoring"`.
    expect(nullAuthoring.every((d) => d.injectHere === false)).toBe(true);

    // (3) The served-artifact half: the CR optimizer's composed prompt carries no block.
    const crOptimizerCalls = calls.filter((c) =>
      c.prompt.startsWith(
        `Address reviewer feedback on docs/${FEATURE}/ for phase CR of feature ${FEATURE}`
      )
    );
    expect(crOptimizerCalls.length).toBeGreaterThan(0); // the control for (3)
    expect(crOptimizerCalls.some((c) => carriesLearningsBlock(c.prompt))).toBe(false);

    // (4) And the run DID inject somewhere, so (3) is not passing because the feature is inert
    // on this scenario.
    expect(calls.some((c) => carriesLearningsBlock(c.prompt))).toBe(true);
  });
});

describe("learningsDispatchSet — LI-T-RETRY-1…3: once per episode, not once per invocation (TSPEC §A.2 property 2, the RETRY-ITERATION fixture)", () => {
  // The RETRY-ITERATION fixture: one PLAN authoring dispatch whose first iteration trips the
  // PLAN-lint feed-forward, so `dispatchAndVerify`'s loop composes the prompt (at least) twice;
  // the scripted `_git` reply changes between iterations (iteration 2 gains one path). A single
  // authoring dispatch spanning two loop iterations must still record exactly one `dispatches[]`
  // row and make exactly one LEARNINGS_CORPUS_ARGV `_git` call — never one per iteration.
  //
  // Scoping, because the driver runs the WHOLE pipeline: `forcePhases` overrides phase gates, it
  // does not restrict the run to one phase, so four authoring episodes compose here (FSPEC, TSPEC,
  // PLAN, PROPERTIES — the REQ is the run's input, not an authored target, and Phase D is skipped
  // by the recording agent's default `DECISIONS_WARRANTED: false`). The per-episode claim is
  // therefore asserted against the PLAN episode specifically: `timeline` interleaves the
  // `_recordDocType` probe (once per episode, immediately before `injectHere` is evaluated) with
  // the enumeration calls, so each `_git` call is attributable to the episode whose marker
  // precedes it, and `PLAN_TARGET_PATH` picks the PLAN dispatch's own iteration prompts out of
  // the run's author calls.
  const PLAN_TARGET_PATH = `docs/${FEATURE}/PLAN-${FEATURE}.md`;

  /** Enumerate calls recorded between `docType`'s episode marker and the next episode marker. */
  function enumeratesInEpisode(timeline, docType) {
    const start = timeline.findIndex((e) => e.kind === "episode" && e.docType === docType);
    if (start === -1) return -1;
    const rest = timeline.slice(start + 1);
    const end = rest.findIndex((e) => e.kind === "episode");
    return (end === -1 ? rest : rest.slice(0, end)).filter((e) => e.kind === "enumerate").length;
  }

  async function drivePlanRetryDispatch() {
    const retryFixture = buildRetryIterationCorpus();
    const dev = await import("../orchestrate-dev.js");
    const mainDev = dev.default;
    const calls = [];
    // A malformed PLAN on the first read (missing the second table `dispatchAndVerify`'s
    // in-phase lint checks for) forces the PLAN-lint feed-forward clause onto the very next
    // prompt (orchestrate-dev.js's own §4.4 T8 behaviour), giving this dispatch its second
    // iteration without a second dispatch.
    const malformedPlanOnce = { served: false };
    const _readFile = (path) => {
      const p = String(path);
      if (p.includes("/PLAN-")) {
        if (!malformedPlanOnce.served) {
          malformedPlanOnce.served = true;
          return "| Task ID | Description | Batch | Dependencies |\n|---|---|---|---|\n";
        }
        return SCENARIO_PLAN;
      }
      if (Object.prototype.hasOwnProperty.call(retryFixture.contents, p)) return retryFixture.contents[p];
      return null;
    };
    const timeline = [];
    let learningsCallIndex = 0;
    const _git = buildPipelineGit(() => {
      const script = retryFixture.gitScript;
      const idx = Math.min(learningsCallIndex, script.length - 1);
      learningsCallIndex += 1;
      timeline.push({ kind: "enumerate" });
      return script[idx];
    });

    const result = await mainDev({
      reqPath: REQ_PATH,
      forcePhases: "P",
      _recordDocType: (docType) => timeline.push({ kind: "episode", docType }),
      _agent: buildRecordingAgent(calls),
      _parallel: (promises) => Promise.all(promises),
      _checkFile: () => ({ ok: true }),
      _readFile,
      _writeFile: async () => ({ ok: true }),
      _appendFile: async () => ({ ok: true }),
      _git,
      _hashFile: async () => "a".repeat(64),
      _phase: () => {},
      _pipeline: async (label, fn) => fn(),
      _mergeWorktree: async () => ({ ok: true }),
      _checkCi: async () => "passed",
    });
    return { result, calls, git: _git, timeline };
  }

  test("LI-20: LI-T-RETRY-1 — the PLAN dispatch that spans two loop iterations records exactly one dispatches[] row", async () => {
    const { result } = await drivePlanRetryDispatch();
    const planRows = result.report.learningsInjection.dispatches.filter((d) => d.docType === "PLAN");
    expect(planRows.length).toBe(1);
  });

  test("LI-20: LI-T-RETRY-2 — that same dispatch makes exactly one LEARNINGS_CORPUS_ARGV _git call, observed on the double's call log", async () => {
    const { git, timeline } = await drivePlanRetryDispatch();
    // The claim: ONE enumeration for the PLAN episode, which composed two prompts. Two would be
    // the per-iteration bug this property exists to catch.
    expect(enumeratesInEpisode(timeline, "PLAN")).toBe(1);
    // Supporting clause on the raw call log: one enumeration per authoring episode over the whole
    // run — four here (FSPEC, TSPEC, PLAN, PROPERTIES; Phase R composes no REQ authoring dispatch
    // because the REQ is the run's input, and Phase D is skipped by the recording agent's default
    // `DECISIONS_WARRANTED: false`), never five.
    const enumerateCalls = git.calls.filter(isLearningsEnumerateCall);
    expect(enumerateCalls.length).toBe(4);
  });

  test("LI-20: LI-T-RETRY-3 — iteration 2's prompt differs from iteration 1's only inside opener; the block's bytes are the same, appended after the (possibly different) opener", async () => {
    const { calls } = await drivePlanRetryDispatch();
    // The PLAN episode's OWN iteration prompts: an author call naming the PLAN target. Taking
    // `calls[0..1]` instead would take the run's first two author calls, which are the REQ and
    // FSPEC dispatches — two different episodes over two different corpus observations, not the
    // two iterations of one.
    const planCalls = calls.filter(
      (c) =>
        (c.skill === "pm-author" || c.skill === "se-author" || c.skill === "te-author") &&
        c.prompt.includes(PLAN_TARGET_PATH)
    );
    expect(planCalls.length).toBeGreaterThanOrEqual(2);
    const [iter1, iter2] = planCalls;
    const blockOf = (p) => {
      const i = p.indexOf(LEARNINGS_BLOCK_MARKER);
      return i === -1 ? null : p.slice(i);
    };
    expect(blockOf(iter1.prompt)).not.toBeNull();
    expect(blockOf(iter1.prompt)).toBe(blockOf(iter2.prompt));
    expect(iter1.prompt).not.toBe(iter2.prompt);
  });
});

describe("learningsDispatchSet — AC-5.2's read half: AT-33 and AT-34 share one instrument in this one file", () => {
  // AT-34 is explicitly "observed on the same instrument and in the same test as AT-33"
  // (FSPEC AT-34), so both live in one test rather than two: AT-33's non-empty observed set is
  // the control that proves the instrument fires when there is something to see, which is what
  // gives AT-34's "no corpus path touched at all" its force.
  test("LI-20: LI-AT-33/LI-AT-34 — the enabled run's file-open set under docs/ equals BR-15's expected set (hand-transcribed from the fixture's scripted ls-files stdout minus the self paths); the disabled run, on the same instrument, touches no corpus path at all", async () => {
    const priorA = "docs/completed/prior-a/LEARNINGS-prior-a.md";
    const priorB = `docs/${FEATURE}/LEARNINGS-${FEATURE}.md`; // this run's own self document
    const corpus = buildLearningsCorpus([
      { path: priorA, doc: { feature: "prior-a", dateCompleted: "2026-01-01", sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }] } },
      { path: priorB, doc: { feature: FEATURE, dateCompleted: "2026-01-02", sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }] } },
    ]);
    // Hand-transcribed from the fixture's scripted ls-files stdout minus the self path — never
    // derived from `gatherLearningsCorpus` (PLAN LI-11).
    const EXPECTED_READ_SET = Object.freeze([priorA]);

    // Two scopings the instrument needs, because `fakeFs` records EVERY `_readFile` the whole
    // pipeline makes, not only the injector's opens.
    //
    // By path: the observed set ranges over the corpus paths (`priorA`, `priorB`), exactly as
    // AT-34's half below already does. A `docs/`-wide set would also carry the run's own REQ,
    // FSPEC, TSPEC, PROPERTIES, CROSS-REVIEW and POSTMORTEM reads — pipeline reads BR-15 says
    // nothing about. The two `docs/_constraints/` and `docs/_decisions/` clauses stay asserted
    // over this same injector-attributable set: it is the injector that BR-15 forbids from
    // opening them, and the pipeline's own Phase H consolidation-log read is not the injector's.
    //
    // By time: the window closes at Phase H's harvest dispatch, marked by the `_recordDocType`
    // probe firing with `"LEARNINGS"`. After that point the pipeline reads this run's newly
    // harvested `docs/{feature}/LEARNINGS-{feature}.md` to verify the harvest — a pipeline read
    // of the run's own document, not a corpus open, and the very path RSN-SELF excluded from the
    // corpus. Without the window the self path would appear on both arms and neither AT-33's
    // expected set nor AT-34's empty set could ever hold.
    const isCorpusPath = (p) => p === priorA || p === priorB;

    const fs = fakeFs(corpus.contents);
    const dev = await import("../orchestrate-dev.js");
    const mainDev = dev.default;
    const calls = [];
    let harvestCutoff = null;
    // CR round 1, PM F-05: AC-5.2's WRITE half needs an instrument of its own. `_writeFile` and
    // `_appendFile` are the only two channels this module has for putting bytes on disk — the
    // static seam-discipline scan in the next describe closes the direct-`fs` route — so
    // recording their paths records every write the run makes, on both arms.
    const writes = [];
    const recordWrite = (path) => {
      writes.push(String(path));
      return { ok: true };
    };
    const _git = buildPipelineGit(() => ({ ok: true, stdout: corpus.lsFilesStdout }));
    // A seam-level read log for BOTH arms. `fakeFs`'s own `reads` array cannot serve the
    // arm-difference below, because the disabled arm's reader answers `.claude/pdlc.config.json`
    // itself and never reaches `fakeFs` for it: the config open would then appear in the enabled
    // arm's log only and pollute the difference with a path both arms in fact open. Logging at
    // the seam records every open on both arms, symmetrically.
    const enabledReadLog = [];
    let enabledLogCutoff = null;
    const disabledReadLog = [];
    let disabledLogCutoff = null;

    const _readFile = (path) => {
      const p = String(path);
      enabledReadLog.push(p);
      if (p.includes("/PLAN-")) return SCENARIO_PLAN;
      return fs.readFile ? fs.readFile(p) : corpus.contents[p] ?? null;
    };

    const enabledResult = await mainDev({
      reqPath: REQ_PATH,
      forcePhases: null,
      _recordDocType: (docType) => {
        if (docType === "LEARNINGS" && harvestCutoff === null) {
          harvestCutoff = fs.reads.length;
          enabledLogCutoff = enabledReadLog.length;
        }
      },
      _agent: buildRecordingAgent(calls),
      _parallel: (promises) => Promise.all(promises),
      _checkFile: () => ({ ok: true }),
      _readFile,
      _writeFile: async (path) => recordWrite(path),
      _appendFile: async (path) => recordWrite(path),
      _git,
      _hashFile: async () => "a".repeat(64),
      _phase: () => {},
      _pipeline: async (label, fn) => fn(),
      _mergeWorktree: async () => ({ ok: true }),
      _checkCi: async () => "passed",
    });

    const readsUnderDocs = (fs.reads ?? [])
      .slice(0, harvestCutoff ?? undefined)
      .map((r) => String(r.path))
      .filter((p) => p.startsWith("docs/") && isCorpusPath(p));
    const observedSet = new Set(readsUnderDocs);
    expect(observedSet).toEqual(new Set(EXPECTED_READ_SET));
    expect(observedSet.size).toBeGreaterThan(0); // the control: the instrument fires
    expect(enabledResult.report).toBeTruthy();

    // ── AT-34: the disabled run, on the SAME instrument, in the SAME test ──────────────────
    const fsDisabled = fakeFs(corpus.contents);
    const disabledCalls = [];
    let disabledHarvestCutoff = null;
    const disabledWrites = [];
    const recordDisabledWrite = (path) => {
      disabledWrites.push(String(path));
      return { ok: true };
    };
    const _readFileDisabled = (path) => {
      const p = String(path);
      disabledReadLog.push(p);
      // The learnings section explicitly disabled — through the one channel that disables it,
      // the same `.claude/pdlc.config.json` text `runScenario` serves (§I.2/AC-5.1a). Nothing
      // else turns the injector off: the config is read once per run off this very seam.
      if (p.endsWith("pdlc.config.json")) {
        return JSON.stringify({ learningsInjection: { enabled: false } });
      }
      if (p.includes("/PLAN-")) return SCENARIO_PLAN;
      return fsDisabled.readFile ? fsDisabled.readFile(p) : corpus.contents[p] ?? null;
    };
    const disabledResult = await mainDev({
      reqPath: REQ_PATH,
      forcePhases: null,
      _recordDocType: (docType) => {
        if (docType === "LEARNINGS" && disabledHarvestCutoff === null) {
          disabledHarvestCutoff = fsDisabled.reads.length;
          disabledLogCutoff = disabledReadLog.length;
        }
      },
      _agent: buildRecordingAgent(disabledCalls),
      _parallel: (promises) => Promise.all(promises),
      _checkFile: () => ({ ok: true }),
      _readFile: _readFileDisabled,
      _writeFile: async (path) => recordDisabledWrite(path),
      _appendFile: async (path) => recordDisabledWrite(path),
      _git: buildPipelineGit(() => ({ ok: true, stdout: corpus.lsFilesStdout })),
      _hashFile: async () => "a".repeat(64),
      _phase: () => {},
      _pipeline: async (label, fn) => fn(),
      _mergeWorktree: async () => ({ ok: true }),
      _checkCi: async () => "passed",
    });

    const disabledReadsUnderDocsCorpus = (fsDisabled.reads ?? [])
      .slice(0, disabledHarvestCutoff ?? undefined)
      .map((r) => String(r.path))
      .filter(isCorpusPath);
    expect(disabledReadsUnderDocsCorpus).toEqual([]);
    // The dispatches OUTSIDE BR-1's rule are byte-identical across the two arms (AT-03's claim).
    // The authoring dispatches are deliberately NOT: carrying the block is what AT-01/02/06
    // assert, so comparing the whole prompt list would assert the feature does nothing.
    const nonAuthoring = (list) =>
      list.filter((c) => !AUTHORING_SKILLS.has(c.skill)).map((c) => c.prompt);
    expect(nonAuthoring(disabledCalls)).toEqual(nonAuthoring(calls));
    expect(disabledResult.outcome).toBeTruthy();

    // ── CR round 1, PM F-05 ───────────────────────────────────────────────────────────────
    // BR-15's two prefix clauses used to be asserted over `observedSet`, which is built by
    // `.filter(isCorpusPath)` — a predicate that admits only `priorA`/`priorB`. Nothing under
    // `docs/_constraints/` or `docs/_decisions/` could ever be a member, so both clauses were
    // true by construction of the filter rather than by behaviour of the code, and neither
    // could red under any mutation. They cannot simply be lifted onto the unfiltered read log
    // either: the pipeline legitimately opens `docs/_decisions/.consolidation-log.md` before
    // the harvest cutoff, and that read is Phase H's, not the injector's.
    //
    // The instrument that separates the two is the DIFFERENCE between the arms. Both arms run
    // the same pipeline over the same fixture; the only variable is the config's `enabled`
    // flag. So a path the enabled arm opens and the disabled arm does not is injector-
    // attributable by construction of the experiment, not by a hand-written filter — and BR-15
    // is a statement about exactly those paths.
    const readPaths = (log, cutoff) => new Set(log.slice(0, cutoff ?? undefined));
    const enabledReadPaths = readPaths(enabledReadLog, enabledLogCutoff);
    const disabledReadPaths = readPaths(disabledReadLog, disabledLogCutoff);
    const injectorAttributableReads = [...enabledReadPaths].filter((pth) => !disabledReadPaths.has(pth));

    // The whole of what enabling the feature causes this run to open is the corpus document —
    // set equality, so an extra open of ANY kind reds, whatever directory it lands in.
    expect(new Set(injectorAttributableReads)).toEqual(new Set(EXPECTED_READ_SET));
    // The control: the difference instrument fires. Without this, the two clauses below would
    // hold vacuously again if the arms ever stopped differing.
    expect(injectorAttributableReads.length).toBeGreaterThan(0);
    // BR-15's two named directories, now over a set they COULD appear in — the disabled arm's
    // consolidation-log read cancels out of the difference, an injector read of the same tree
    // would not.
    expect(injectorAttributableReads.some((pth) => pth.startsWith("docs/_constraints/"))).toBe(false);
    expect(injectorAttributableReads.some((pth) => pth.startsWith("docs/_decisions/"))).toBe(false);
    // And the sanity check that makes the cancellation above meaningful rather than accidental:
    // the disabled arm really does open the tree the difference is subtracting away.
    expect([...disabledReadPaths].some((pth) => pth.startsWith("docs/_decisions/"))).toBe(true);

    // ── AC-5.2's WRITE half, on the same two arms (PM F-05) ───────────────────────────────
    // BR-15: "Nothing under `docs/_constraints/` or `docs/_decisions/` is written, no LEARNINGS
    // document or skill prompt is written, and no index, cache or state file is created
    // anywhere." The `_writeFile`/`_appendFile` log is the observational boundary R-5 names.
    //
    // The primary claim is the DIFFERENCE again, with no exemption list: enabling the injector
    // adds no write of any kind, anywhere. A single extra write — an index, a cache, a memo
    // file, a rewritten skill prompt — reds this, without the test having to enumerate the
    // forms such a file might take.
    expect(new Set(writes)).toEqual(new Set(disabledWrites));
    // The control: the write instrument fires, so the equality above is between two non-empty
    // observations rather than between two empty ones.
    expect(writes.length).toBeGreaterThan(0);
    // BR-15's named forms, asserted over the UNFILTERED write log of the enabled arm — every
    // path either channel was handed, with nothing filtered out beforehand.
    expect(writes.some((pth) => pth.startsWith("docs/_constraints/"))).toBe(false);
    expect(writes.some((pth) => pth.startsWith("docs/_decisions/"))).toBe(false);
    expect(writes.some((pth) => /LEARNINGS-[^/]*\.md$/.test(pth))).toBe(false);
    expect(writes.some((pth) => /SKILL[^/]*\.md$/.test(pth))).toBe(false);
  });
});

describe("learningsDispatchSet — LI-AT-35: gate semantics are preserved exactly as without the feature", () => {
  test("LI-20: LI-AT-35 — completeness criteria, required headings, verdict grammar, round windows and approval anchors are exactly those in force without the feature", async () => {
    const corpus = buildLearningsCorpus([
      {
        path: "docs/completed/prior-a/LEARNINGS-prior-a.md",
        doc: { feature: "prior-a", dateCompleted: "2026-01-01", sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }] },
      },
    ]);
    const enabledRun = await runScenario({ corpus });
    const disabledRun = await runScenario({ corpus, configText: JSON.stringify({ learningsInjection: { enabled: false } }) });

    // CR round 1. LI-AT-35 carried the SAME defect PM F-02 / TE F-01 filed against LI-AT-29 —
    // five absent report keys compared `null` to `null`. It is repaired the same way: the gate
    // semantics AT-35 names are read where they live. Completeness and required headings are
    // observable only through their EFFECT on the loop (a completeness failure re-dispatches the
    // author, which moves the phase row's `iterations`); verdict grammar likewise (an unparsed
    // verdict never converges the phase). `phases` is therefore the joint observable for all
    // three, and `artifactPaths` is the approval-anchor observable.
    const observe = (r) => ({
      phases: r.result.report.phases,
      artifactPaths: r.result.report.artifactPaths,
      notices: r.result.report.notices,
      outcome: r.result.report.outcome,
    });
    const observed = observe(enabledRun);
    expect(observed).toEqual(observe(disabledRun));
    // The controls: each observable carries a value, and the phase rows carry the round-window
    // arithmetic that a verdict-grammar or completeness regression would move.
    expect(observed.phases.length).toBeGreaterThan(0);
    expect(observed.phases.some((p) => typeof p.iterations === "number")).toBe(true);
    expect(observed.artifactPaths.length).toBeGreaterThan(0);
  });
});

describe("learningsDispatchSet — AC-5.2's write half, and the static seam-discipline scan (no FSPEC AT id)", () => {
  test("LI-20: AC-5.2 write half — a git status --porcelain set-equality delta around the run, in a dedicated temp git repository that is the run's cwd, with no exemption list", async () => {
    const tmpRepo = mkdtempSync(join(tmpdir(), "li11-ac52-"));
    try {
      execFileSync("git", ["init", "-q"], { cwd: tmpRepo });
      execFileSync("git", ["config", "user.email", "test@example.com"], { cwd: tmpRepo });
      execFileSync("git", ["config", "user.name", "test"], { cwd: tmpRepo });

      const before = execFileSync("git", ["status", "--porcelain"], { cwd: tmpRepo, encoding: "utf8" });
      const beforeSet = new Set(before.split("\n").filter(Boolean));

      const corpus = buildLearningsCorpus([
        {
          path: "docs/completed/prior-a/LEARNINGS-prior-a.md",
          doc: { feature: "prior-a", dateCompleted: "2026-01-01", sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }] },
        },
      ]);
      const dev = await import("../orchestrate-dev.js");
      const mainDev = dev.default;
      const originalCwd = process.cwd();
      process.chdir(tmpRepo);
      try {
        await mainDev({
          reqPath: REQ_PATH,
          forcePhases: null,
          _agent: buildRecordingAgent([]),
          _parallel: (promises) => Promise.all(promises),
          _checkFile: () => ({ ok: true }),
          _readFile: (path) => {
            const p = String(path);
            if (p.includes("/PLAN-")) return SCENARIO_PLAN;
            return Object.prototype.hasOwnProperty.call(corpus.contents, p) ? corpus.contents[p] : null;
          },
          _writeFile: async () => ({ ok: true }),
          _appendFile: async () => ({ ok: true }),
          _git: fakeGit((argv) =>
            isLearningsEnumerateCall(argv) ? { ok: true, stdout: corpus.lsFilesStdout } : { ok: true, stdout: "" }
          ),
          _hashFile: async () => "a".repeat(64),
          _phase: () => {},
          _pipeline: async (label, fn) => fn(),
          _mergeWorktree: async () => ({ ok: true }),
          _checkCi: async () => "passed",
        });
      } finally {
        process.chdir(originalCwd);
      }

      const after = execFileSync("git", ["status", "--porcelain"], { cwd: tmpRepo, encoding: "utf8" });
      const afterSet = new Set(after.split("\n").filter(Boolean));

      // No exemption list: the delta between before and after is asserted EMPTY, full stop —
      // nothing under docs/_constraints/, docs/_decisions/, no LEARNINGS document, no skill
      // prompt, no index/cache/state file anywhere (BR-15/AC-5.2).
      const delta = [...afterSet].filter((line) => !beforeSet.has(line));
      expect(delta).toEqual([]);
    } finally {
      rmSync(tmpRepo, { recursive: true, force: true });
    }
  });

  test("LI-20: static seam-discipline scan — the region between LI-15's sentinel comments contains no fs., writeFileSync, mkdirSync, appendFileSync or require(\"fs\")", () => {
    const source = readFileSync(new URL("../orchestrate-dev.js", import.meta.url), "utf8");
    const startMarker = "// === LEARNINGS INJECTION REGION START ===";
    const endMarker = "// === LEARNINGS INJECTION REGION END ===";
    const startIdx = source.indexOf(startMarker);
    const endIdx = source.indexOf(endMarker);
    expect(startIdx).toBeGreaterThan(-1);
    expect(endIdx).toBeGreaterThan(startIdx);

    const region = source.slice(startIdx, endIdx);
    for (const forbidden of ["fs.", "writeFileSync", "mkdirSync", "appendFileSync", 'require("fs")']) {
      expect(region).not.toContain(forbidden);
    }
  });
});
