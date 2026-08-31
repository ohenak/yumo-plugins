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

import { execFileSync, spawnSync } from "child_process";
import { createHash } from "crypto";
import { mkdtempSync, rmSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import {
  buildLearningsCorpus,
  buildDivergentCorpus,
  buildRetryIterationCorpus,
  buildAt29ContaminationCorpus,
  LEARNINGS_CORPUS_DEFAULT_THRESHOLDS,
} from "./helpers/learningsFixtures.js";
import { fakeGit, fakeFs } from "./helpers/seams.js";
import { composeAuthoringPrompts } from "./helpers/learningsComposition.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** The CLI entry point of the composition helper — PROP-ORDER-05's SECOND process invocation. */
const COMPOSITION_CHILD_PATH = join(__dirname, "helpers", "learningsComposition.js");

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
function buildRecordingAgent(
  calls,
  { decisionsWarranted = false, reviseOnceInPhases = [], erratumOnAuthoringOf = null } = {}
) {
  // CR round 1, PM F-08. `erratumOnAuthoringOf: "FSPEC"` makes the FSPEC authoring dispatch's
  // response carry one `ERRATUM: REQ: …` line, which is how a real author routes a defect it
  // found in an upstream document. `converge` collects the creator's errata (§3.1 step 2's last
  // clause), so the phase then runs a real erratum round: an authoring dispatch whose docType is
  // `REQ` and whose prompt is the erratum-author prompt, not this phase's own. That is AC-1.1's
  // third dispatch shape ("erratum"), and under the all-approve script no scenario in this suite
  // reached it — the arm existed in the pipeline with no runtime oracle over its composed prompt.
  //
  // The item is deliberately anchored (`§1`) and carries a backticked expected token, and names
  // no AT-/INV-/META- id and not the word "oracle", so `oracleContractShortfall` admits it and it
  // is routed rather than noted as malformed.
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
      if (
        erratumOnAuthoringOf &&
        text.includes(`${erratumOnAuthoringOf}-${FEATURE}.md`) &&
        !text.includes("ERRATUM ROUND") &&
        !text.includes("DECISIONS_WARRANTED") &&
        !text.includes("Return a JSON object")
      ) {
        return (
          "Created/updated document successfully.\n" +
          "ERRATUM: REQ: §1 — the threshold is stated twice with different values; the " +
          "authoritative one is `maxDocuments: 5`.\n"
        );
      }
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
  injectorFactory = null,
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
    // Passed ONLY when a caller asks for it, on the same rule as `_listFiles` above: every
    // other scenario leaves the shipped `buildLearningsInjector` in place.
    ...(injectorFactory ? { _learningsInjector: injectorFactory } : {}),
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

  // PROP-CORPUS-02 (PROPERTIES §O.3): a re-enumeration of the corpus would return the same
  // listing every time, so the envelope is identical whether the corpus is fetched once per
  // dispatch or re-fetched wastefully inside a loop — the oracle is therefore a call-count spy,
  // not a shape assertion. `LI-T-RETRY-2` pins the same rule for ONE dispatch spanning two
  // `for(;;)` iterations; this pins it across a whole run's MULTIPLE authoring dispatches, where
  // a bug that re-enumerated per authoring call site (rather than per episode) would still leave
  // every composed prompt looking correct.
  test("PROP-CORPUS-02: the corpus is enumerated exactly once per authoring dispatch — never re-fetched, never shared short of that", async () => {
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
    const { calls, git } = await runScenario({ corpus });

    const authoringCalls = calls.filter((c) => AUTHORING_SKILLS.has(c.skill));
    const enumerateCalls = git.calls.filter(isLearningsEnumerateCall);

    expect(authoringCalls.length).toBeGreaterThan(0);
    expect(enumerateCalls.length).toBe(authoringCalls.length);
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

  test("LI-20: CR round 1 (PM F-08) — AC-1.1's third dispatch shape: an ERRATUM-ROUND authoring dispatch's composed prompt carries the block", async () => {
    // AC-1.1 names three authoring shapes — "creator, optimizer round, erratum". The first two
    // are covered above (LI-AT-01/02) and by the composition-site set equality. The erratum arm
    // was reachable in the pipeline (`erratumRound`'s two `dispatchKind: "authoring"` sites,
    // pinned STATICALLY by `learningsPremises.test.js`) but no scenario in this suite ever
    // entered it, so nothing observed an erratum-round prompt at RUNTIME. This drives one.
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
    const { calls } = await runScenario({
      corpus,
      agentOpts: { erratumOnAuthoringOf: "FSPEC" },
    });

    // The erratum round's own dispatches, identified by the erratum-author prompt's opening
    // literal and its target — the REQ, an upstream document of the phase that raised the item,
    // and one of C-1's six types, so BR-1's two conjuncts both hold.
    const erratumCalls = calls.filter(
      (c) => /ERRATUM ROUND for/.test(c.prompt) && c.prompt.includes(REQ_PATH)
    );
    expect(erratumCalls.length).toBeGreaterThan(0);
    // Every one of them carries the block, identified by source path — not merely one of them.
    for (const c of erratumCalls) {
      expect(AUTHORING_SKILLS.has(c.skill)).toBe(true);
      expect(carriesLearningsBlock(c.prompt)).toBe(true);
      expect(c.prompt).toContain("docs/completed/prior-feature/LEARNINGS-prior-feature.md");
    }
  });
  // CODE_REVIEW v1 F7. This test's registered title used to claim byte-identity to "the recorded
  // pre-feature baseline", but its body compares an ENABLED run of this branch against a
  // DISABLED run of the same branch — precisely the comparison AC-5.1a rules out ("that
  // committed baseline, not a same-branch disabled run"). It cannot fail if the injection seam
  // corrupts non-authoring prompts identically in both arms. The title now states the property
  // the body actually delivers (enabled/disabled parity, which is a real and useful half of
  // AC-1.2: the block is a suffix on authoring dispatches and nothing else moves). The
  // committed-baseline half of AC-1.2 belongs to `learningsBaselineGuard.test.js`, whose fixture
  // matrix now covers the WHOLE non-authoring dispatch set of a pipeline run rather than three
  // prompts (`PIPELINE-NON-AUTHORING-PROMPTS`).
  test("LI-20: LI-AT-03 — enabled/disabled parity: every dispatch outside BR-1's rule is byte-identical between an enabled and a disabled run of this branch (the committed-baseline half is learningsBaselineGuard.test.js's)", async () => {
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

// CODE_REVIEW v1 F2 (Low, "unwired integration"): `buildLearningsInjector` declares a `_log`
// seam and guards its use with `if (typeof _log === "function")`, but the single production
// construction site never passed one — so the per-dispatch observability line fired only under
// test doubles, and an operator debugging a silent non-injection had no runtime signal at all.
// The run now threads its own `emit` through the seam. The oracle reads the seam, not a log
// string: it captures the options object the production site actually constructs the injector
// with, and then drives the returned injector to prove the threaded value is invoked per
// dispatch with the record TSPEC §D.2 names.
describe("learningsDispatchSet — CODE_REVIEW v1 F2: the production construction site supplies the _log seam", () => {
  test("supporting: mainDev constructs the learnings injector with a callable _log, and every dispatch emits through it", async () => {
    const corpus = buildLearningsCorpus([
      {
        path: "docs/completed/f2-prior/LEARNINGS-f2-prior.md",
        doc: { feature: "f2-prior", dateCompleted: "2026-01-01", sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }] },
      },
    ]);

    const dev = await import("../orchestrate-dev.js");
    const constructedWith = [];
    const emitted = [];
    const injectorFactory = (options) => {
      constructedWith.push(options);
      const inner = dev.buildLearningsInjector({
        ...options,
        _log: (entry) => {
          emitted.push(entry);
          options._log(entry);
        },
      });
      return inner;
    };

    await runScenario({ corpus, injectorFactory });

    // (1) The seam is supplied at all — the finding's literal subject.
    expect(constructedWith.length).toBe(1);
    expect(typeof constructedWith[0]._log).toBe("function");

    // (2) It is live: the guarded call fires once per dispatch, carrying §D.2's fields. Without
    // this conjunct a site that passed a non-callable placeholder would still satisfy (1).
    expect(emitted.length).toBeGreaterThan(0);
    for (const entry of emitted) {
      expect(Object.keys(entry).sort()).toEqual(["corpusOutcome", "docType", "feature", "phaseId"]);
      expect(entry.feature).toBe(FEATURE);
    }

    // (3) The production value does not throw when invoked — an `emit` of the wrong arity or a
    // logger expecting a string would red here rather than in a real run.
    expect(() => constructedWith[0]._log({ feature: FEATURE, docType: "FSPEC", phaseId: "F", corpusOutcome: null })).not.toThrow();
  });
});

describe("learningsDispatchSet — Group 2: determinism, fail-open, and inertness (FSPEC AT-14/23/24/29/31)", () => {
  test("LI-20: LI-AT-14 — two whole-process runs over an identical fixture repository state compose byte-identical blocks, including order", async () => {
    // CODE_REVIEW v1 F8. PROPERTIES §O.7 states this property as two compositions made in TWO
    // SEPARATE PROCESS INVOCATIONS — that is what rules out module-level memoisation and
    // insertion-order dependence surviving in a warm module. This test used to call
    // `runScenario` twice inside the same jest worker, against the module-cached
    // `await import("../orchestrate-dev.js")` at line 222: any per-process cached state was
    // shared by both arms and therefore invisible, so the suite delivered a strictly weaker
    // property than the document claimed.
    //
    // Arm 1 is composed in THIS process; arm 2 is composed by a child `node` invocation of the
    // same `helpers/learningsComposition.js` entry point — a cold module registry, a cold V8
    // heap, no shared state of any kind with arm 1. Both arms run identical code over identical
    // fixtures, so a difference can only come from the module's own per-process state.
    const inProcess = await composeAuthoringPrompts();

    const coverageScratch = mkdtempSync(join(tmpdir(), "pdlc-composition-cov-"));
    const child = spawnSync(process.execPath, [COMPOSITION_CHILD_PATH], {
      encoding: "utf8",
      cwd: join(__dirname, ".."),
      // The child's V8 coverage is diverted away from c8's temp directory. This child imports
      // `orchestrate-dev.js`, so under `test:coverage` it would emit a second coverage entry for
      // that URL covering only the composition path. c8 does not union two entries for one URL —
      // the merged report comes out lower than either arm — so a second entry would silently
      // DEPRESS the module's measured branch coverage toward the arm this child happens to
      // exercise. `NODE_V8_COVERAGE` must be overridden rather than omitted: node re-propagates
      // it to children whatever `options.env` says.
      env: { ...process.env, NODE_V8_COVERAGE: join(coverageScratch, "v8-coverage") },
    });
    rmSync(coverageScratch, { recursive: true, force: true });
    // The control: a child that failed to run would emit `[]`, and `[] === []` would pass
    // vacuously. Assert the child succeeded and that both arms composed a non-empty block set.
    expect({ status: child.status, stderr: child.stderr }).toEqual({ status: 0, stderr: "" });
    const childPrompts = JSON.parse(child.stdout.trim().split("\n").pop());

    expect(inProcess.length).toBeGreaterThan(0);
    expect(childPrompts.length).toBe(inProcess.length);
    // Byte-identical, INCLUDING ORDER: an ordered-sequence equality, never a set equality.
    expect(childPrompts).toEqual(inProcess);
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

  // PROP-ISOLATE-02's SKILL.md conjunct (BR-16): "no SKILL.md text moves" is a digest equality,
  // never a prose claim. Enumerated by real `git ls-files` (not a scripted double — SKILL.md
  // files are not part of any run's fixture, so a fake corpus cannot stand in for them), SHA-256
  // per file, and asserted set-equal by path AND equal by digest against a hand-transcribed
  // manifest recorded at authoring time (DC-14) — never regenerated inside the assertion, which
  // would make the test unfalsifiable against exactly the drift it exists to catch.
  test("PROP-ISOLATE-02: every file under pdlc/skills/** has the SHA-256 digest recorded in the hand-transcribed manifest (BR-16, no SKILL.md text moves)", () => {
    const REPO_ROOT = join(__dirname, "..", "..", "..");

    // Hand-transcribed (DC-14): path -> SHA-256 hex digest, recorded once at authoring time by
    // running `git ls-files -- 'pdlc/skills/**'` and `shasum -a 256` over each result. This
    // feature's own scope boundary (§Scope boundary) touches no file under `pdlc/skills/**`, so
    // every digest below is expected to still match at green. A later feature that legitimately
    // edits a listed file re-records that file's digest here in the same change
    // (orchestrate-queue/SKILL.md was re-recorded by pdlc-engineering-loop).
    const EXPECTED_DIGESTS = {
      "pdlc/skills/consolidate-learnings/SKILL.md": "c579adbb346b1892855d93e71252901c3ff5a432aa6f1f14ff5d2e9b5efb598d",
      "pdlc/skills/dod-verify/SKILL.md": "8be3ac4056afe74aebc9c2a7c1c036720a3105317aebc29c50c50009c4ecaa83",
      "pdlc/skills/harvest-learnings/SKILL.md": "aca0b14757cc71a4986599cbf01d68c635585132e6bf6c3ed3be2d14d835e07b",
      "pdlc/skills/orchestrate-dev/SKILL.md": "e649610ab1ea008ba5b5ad2e5df3412308bf0a0f122801d37302e75a11697fc1",
      "pdlc/skills/orchestrate-dev/WORKFLOW-MIGRATION-PLAN.md": "a1fc0854cef941cf60b7b45c04b5688ca3c602234978391a57f1eff3f5c735ec",
      "pdlc/skills/orchestrate-queue/SKILL.md": "0513580aba153e065f0b39cf431a2b3e7dfc660a58531a5705c89d1eb89f0978",
      "pdlc/skills/pm-author/SKILL.md": "6e1e4884cb90ae323c71d3083c5b34d577529a7ef6e0080b466b5696517a60f8",
      "pdlc/skills/pm-review/SKILL.md": "4bd6abaf6b3c20e644526c4a1b4dcc383a6f697dcca2ebcc83959d21e5d1fd09",
      "pdlc/skills/se-author/SKILL.md": "071a63c5d32095d3f21a5b2dd440c4a16ff17dda1b9c4fff22a0a49fec699267",
      "pdlc/skills/se-implement/SKILL-python.md": "b6e44dd4aa1db0a9a34fcdab86f2cf43fce35e227e8816a6938415d545d7b41a",
      "pdlc/skills/se-implement/SKILL-typescript.md": "928c9d3d273a3a80369707c47aed7c40d8126d996475ff0e9fc9a4c5e8da397a",
      "pdlc/skills/se-implement/SKILL.md": "68a07a6e215552c81507bd212b372cc0233ef414bdcdb12c011c1bc45349c354",
      "pdlc/skills/se-review/SKILL.md": "64d52f5ad1623ab9a05240069fa34236d9daf5660acea7897661295901f734c4",
      "pdlc/skills/ship-pr/SKILL.md": "4ed57b1ef856963bcd21dd43c5df979b1cc01f63e5d073a217acb160ccd5bad1",
      "pdlc/skills/te-author/SKILL.md": "7d380a607856e3d087c612b244d9d77210d87ce51e11632de5b2f67aefdc59b8",
      "pdlc/skills/te-review/SKILL.md": "0e69aa4b8e68acec232cfa416ba9642b552ac86fe587bec28c5860490ad4be57",
      "pdlc/skills/tech-lead-python/SKILL.md": "70cc06dfb6b83b93b4c6ceab3f847b2d1c910539abc4f1d13695d32eb93d5501",
      "pdlc/skills/tech-lead/SKILL.md": "781909cbc145e620548535bb5ab6c61014d255cf0ebed1e3fc6dcf20708584f4",
    };

    const stdout = execFileSync("git", ["ls-files", "--", "pdlc/skills/**"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
    });
    const observedPaths = stdout.split("\n").filter(Boolean);

    // Set equality over paths — never containment, so a newly added or removed SKILL.md file
    // reds here rather than being silently ignored by both sides.
    expect(new Set(observedPaths)).toEqual(new Set(Object.keys(EXPECTED_DIGESTS)));
    // Positive control: the enumerated set is non-empty, so the equality above is not vacuously
    // true over two empty sets.
    expect(observedPaths.length).toBeGreaterThan(0);

    for (const relPath of observedPaths) {
      const digest = createHash("sha256")
        .update(readFileSync(join(REPO_ROOT, relPath)))
        .digest("hex");
      expect(digest).toBe(EXPECTED_DIGESTS[relPath]);
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

  // PROP-FOOTPRINT-04 (PROPERTIES §Group I): the static scan above is a pure absence over a
  // span the scanner located itself — which is only meaningful with two conjuncts giving the
  // instrument an oracle. Extracted as a reusable scanner so both controls run over the exact
  // same matching logic the production scan above uses.
  function scanForFilesystemModuleReferences(text) {
    const forbidden = ["fs.", "writeFileSync", "mkdirSync", "appendFileSync", 'require("fs")'];
    return forbidden.filter((token) => text.includes(token));
  }

  test("LI-20: PROP-FOOTPRINT-04 positive control — the extracted sentinel-bounded region is non-empty and is the right span (contains LEARNINGS_TARGET_DOCTYPES)", () => {
    const source = readFileSync(new URL("../orchestrate-dev.js", import.meta.url), "utf8");
    const startMarker = "// === LEARNINGS INJECTION REGION START ===";
    const endMarker = "// === LEARNINGS INJECTION REGION END ===";
    const startIdx = source.indexOf(startMarker);
    const endIdx = source.indexOf(endMarker);
    const region = source.slice(startIdx, endIdx);

    // A scan that returns an empty or mislocated region (a reworded sentinel, a later refactor
    // moving the region, a regex anchored on a drifted string) must red, never pass.
    expect(region.length).toBeGreaterThan(0);
    expect(region).toContain("LEARNINGS_TARGET_DOCTYPES");
  });

  test("LI-20: PROP-FOOTPRINT-04 negative control — the scanner reds on a planted fs.writeFileSync token in a synthetic span, proving the matcher fires", () => {
    const syntheticRegion =
      "// === LEARNINGS INJECTION REGION START ===\n" +
      "const debugDump = () => fs.writeFileSync('/tmp/debug.json', '{}');\n" +
      "// === LEARNINGS INJECTION REGION END ===\n";
    const violations = scanForFilesystemModuleReferences(syntheticRegion);
    expect(violations.length).toBeGreaterThan(0);
  });
});

describe("learningsDispatchSet — PROP-DISPATCH-08: dispatchAndVerify has exactly two call sites (structural, replaces the tautological half of PROP-DISPATCH-03)", () => {
  test("PROP-DISPATCH-08: exactly two `dispatchAndVerify(` call sites exist, one inside reviewLoop's `wrapped` closure and one inside main()'s `wrappedDispatch`", () => {
    const source = readFileSync(new URL("../orchestrate-dev.js", import.meta.url), "utf8");

    // Every actual call site (never the `async function dispatchAndVerify(` declaration
    // itself) — a hand-transcribed set equality keyed by (enclosing named function, call-site
    // form), never a bare count, so a third call site added anywhere still reds even if the
    // count coincidentally stayed at two elsewhere.
    const callRe = /\bdispatchAndVerify\(/g;
    const declRe = /\basync function dispatchAndVerify\(/g;
    const totalCalls = (source.match(callRe) || []).length;
    const declarations = (source.match(declRe) || []).length;
    expect(declarations).toBe(1);
    // The declaration's own `(` also matches `callRe` (it ends in `dispatchAndVerify(`), so the
    // real call-site count is total minus the one declaration.
    expect(totalCalls - declarations).toBe(2);

    const wrappedClosureIdx = source.indexOf(
      "const wrapped = (skill, basePrompt, targetPath, dispatchKind, sessionKey, ledgerBlock = \"\") =>"
    );
    const wrappedDispatchIdx = source.indexOf("async function wrappedDispatch({ skill, basePrompt, targetPath, docType, dispatchKind, phaseId, sessionKey })");
    expect(wrappedClosureIdx).toBeGreaterThan(-1);
    expect(wrappedDispatchIdx).toBeGreaterThan(-1);

    // Each named enclosing form's own call site must be the one immediately following its
    // definition, not some other dispatchAndVerify( call reached through unrelated code.
    const afterWrapped = source.slice(wrappedClosureIdx, wrappedClosureIdx + 400);
    const afterWrappedDispatch = source.slice(wrappedDispatchIdx, wrappedDispatchIdx + 400);
    expect(afterWrapped).toContain("dispatchAndVerify(");
    expect(afterWrappedDispatch).toContain("dispatchAndVerify(");
  });

  test("PROP-DISPATCH-08: the wave-mode se-implement dispatch calls agentFn directly, never dispatchAndVerify — a fifth authoring-shaped site would red the two-call-site count above", () => {
    const source = readFileSync(new URL("../orchestrate-dev.js", import.meta.url), "utf8");
    expect(source).toContain('agentFn("se-implement"');

    // Negative control: the wave path's own 400-byte neighbourhood must not itself contain a
    // dispatchAndVerify( call — proving the two symbols are genuinely distinct call forms, not
    // an accidental adjacency the count alone could not tell apart.
    const waveIdx = source.indexOf('agentFn("se-implement"');
    const waveNeighbourhood = source.slice(Math.max(0, waveIdx - 200), waveIdx + 200);
    expect(waveNeighbourhood).not.toContain("dispatchAndVerify(");
  });
});
