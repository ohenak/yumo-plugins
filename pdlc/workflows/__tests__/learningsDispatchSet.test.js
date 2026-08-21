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
 */
function buildRecordingAgent(calls) {
  return async (skill, prompt) => {
    const text = String(prompt ?? "");
    calls.push({ skill, prompt: text });
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
async function runScenario({ corpus = null, gitEnumerateScript = null, configText = null, forcePhases = null } = {}) {
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
    _agent: buildRecordingAgent(calls),
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
  test.skip("LI-20: LI-AT-01 — an authoring dispatch's prompt contains material from at least one prior-feature document, delimited and identified by source path", async () => {
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

  test.skip("LI-20: LI-AT-02 — set equality over the whole dispatch universe: the subset carrying a block equals BR-1's two-conjunct rule's subset", async () => {
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

  test.skip("LI-20: LI-AT-03 — every dispatch outside BR-1's rule is byte-identical to the recorded pre-feature baseline", async () => {
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

  test.skip("LI-20: LI-AT-06 — the grounding manifest, upstream documents and pacing contract are present, unchanged, and in order; the block is purely additive", async () => {
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
  test.skip("LI-20: LI-AT-14 — two whole-process runs over an identical fixture repository state compose byte-identical blocks, including order", async () => {
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

  test.skip("LI-21: LI-AT-24 — no prior LEARNINGS at all: every authoring dispatch is byte-identical to baseline, and the report records corpus-level RSN-EMPTY", async () => {
    const emptyCorpus = buildLearningsCorpus([]);
    const enabledRun = await runScenario({ corpus: emptyCorpus });
    const disabledRun = await runScenario({ corpus: emptyCorpus, configText: JSON.stringify({ learningsInjection: { enabled: false } }) });

    expect(enabledRun.calls.map((c) => c.prompt)).toEqual(disabledRun.calls.map((c) => c.prompt));
    expect(enabledRun.result.report).toBeTruthy();
    const dispatches = enabledRun.result.report.learningsInjection.dispatches;
    expect(dispatches.length).toBeGreaterThan(0);
    expect(dispatches.every((d) => d.corpusOutcome === "RSN-EMPTY")).toBe(true);
  });

  test.skip("LI-20: LI-AT-29 — enabled vs. disabled: verdicts, completeness scores, round-window counters, approval anchors and erratum routes are equal member for member", async () => {
    const contamination = buildAt29ContaminationCorpus();
    const enabledRun = await runScenario({ corpus: contamination });
    const disabledRun = await runScenario({ corpus: contamination, configText: JSON.stringify({ learningsInjection: { enabled: false } }) });

    // Set equality over the five named observables, read off the report both runs produce.
    const observe = (r) => ({
      verdicts: r.result.report.verdicts ?? null,
      completeness: r.result.report.completenessScores ?? null,
      roundWindows: r.result.report.roundWindows ?? null,
      approvalAnchors: r.result.report.approvalAnchors ?? null,
      erratumRoutes: r.result.report.erratumRoutes ?? null,
    });
    expect(observe(enabledRun)).toEqual(observe(disabledRun));

    // Every dispatch prompt outside BR-1's rule is byte-identical to the recorded baseline —
    // here approximated as byte-identical between the two runs at the same call index, since
    // the contamination corpus's tokens (line-initial VERDICT:/ERRATUM:/REVISION-COMPLETE:) must
    // never leak into gate-input parsing through a channel other than the block itself.
    for (let i = 0; i < enabledRun.calls.length; i += 1) {
      if (AUTHORING_SKILLS.has(enabledRun.calls[i].skill)) continue;
      expect(enabledRun.calls[i].prompt).toBe(disabledRun.calls[i].prompt);
    }
  });

  test.skip("LI-21: LI-AT-31 — `learningsInjection.enabled` explicitly false: every composed dispatch is byte-identical to baseline and no injection key is carried (absent, not present-and-empty)", async () => {
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

  test.skip("LI-21: LI-AT-23 — the author-emitted channels a run requires equal the recorded pre-feature baseline set: no erratum opens on account of an injected document, no new channel appears", async () => {
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
    // No erratum route was opened solely because of an injected document: the only trace of an
    // injected document anywhere in the report is BR-8's rows naming source paths.
    expect(JSON.stringify(enabledRun.result.report.erratumRoutes ?? [])).not.toContain(
      "docs/completed/prior-a/LEARNINGS-prior-a.md"
    );
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

  test.skip("LI-20: the docType set observed at the composition site equals LEARNINGS_TARGET_DOCTYPES ∪ {null, \"LEARNINGS\"}, and the accepted set equals LEARNINGS_TARGET_DOCTYPES — both set equality, never containment", async () => {
    const dev = await import("../orchestrate-dev.js");
    const mainDev = dev.default;

    const observedDocTypes = [];
    const acceptedDocTypes = [];
    const _recordDocType = (docType) => {
      observedDocTypes.push(docType);
      if (HAND_TRANSCRIBED_TARGET_DOCTYPES.includes(docType)) acceptedDocTypes.push(docType);
    };

    const corpus = buildLearningsCorpus([
      {
        path: "docs/completed/prior-a/LEARNINGS-prior-a.md",
        doc: { feature: "prior-a", dateCompleted: "2026-01-01", sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }] },
      },
    ]);
    const calls = [];
    const _git = fakeGit((argv) =>
      isLearningsEnumerateCall(argv) ? { ok: true, stdout: corpus.lsFilesStdout } : { ok: true, stdout: "" }
    );
    const _readFile = (path) => {
      const p = String(path);
      if (p.includes("/PLAN-")) return SCENARIO_PLAN;
      if (Object.prototype.hasOwnProperty.call(corpus.contents, p)) return corpus.contents[p];
      return null;
    };

    await mainDev({
      reqPath: REQ_PATH,
      forcePhases: null,
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
      _recordDocType,
    });

    // (a) every authoring phase was exercised: the observed set equals the literal, never
    // merely contained in it.
    expect(new Set(observedDocTypes)).toEqual(new Set(HAND_TRANSCRIBED_COMPOSITION_SITE_SET));
    // (b) the accepted set — docTypes for which `injectHere` returned true — is strictly
    // narrower, equal to LEARNINGS_TARGET_DOCTYPES alone.
    expect(new Set(acceptedDocTypes)).toEqual(new Set(HAND_TRANSCRIBED_TARGET_DOCTYPES));
  });
});

describe("learningsDispatchSet — LI-T-RETRY-1…3: once per episode, not once per invocation (TSPEC §A.2 property 2, the RETRY-ITERATION fixture)", () => {
  // The RETRY-ITERATION fixture: one PLAN authoring dispatch whose first iteration trips the
  // PLAN-lint feed-forward, so `dispatchAndVerify`'s loop composes the prompt (at least) twice;
  // the scripted `_git` reply changes between iterations (iteration 2 gains one path). A single
  // authoring dispatch spanning two loop iterations must still record exactly one `dispatches[]`
  // row and make exactly one LEARNINGS_CORPUS_ARGV `_git` call — never one per iteration.
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
    const _git = fakeGit((argv) => {
      if (isLearningsEnumerateCall(argv)) {
        const script = retryFixture.gitScript;
        const idx = Math.min(_git.__learningsCallCount || 0, script.length - 1);
        _git.__learningsCallCount = (_git.__learningsCallCount || 0) + 1;
        return script[idx];
      }
      return { ok: true, stdout: "" };
    });

    const result = await mainDev({
      reqPath: REQ_PATH,
      forcePhases: { P: true },
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
    return { result, calls, git: _git };
  }

  test.skip("LI-20: LI-T-RETRY-1 — the PLAN dispatch that spans two loop iterations records exactly one dispatches[] row", async () => {
    const { result } = await drivePlanRetryDispatch();
    const planRows = result.report.learningsInjection.dispatches.filter((d) => d.docType === "PLAN");
    expect(planRows.length).toBe(1);
  });

  test.skip("LI-20: LI-T-RETRY-2 — that same dispatch makes exactly one LEARNINGS_CORPUS_ARGV _git call, observed on the double's call log", async () => {
    const { git } = await drivePlanRetryDispatch();
    const enumerateCalls = git.calls.filter(isLearningsEnumerateCall);
    expect(enumerateCalls.length).toBe(1);
  });

  test.skip("LI-20: LI-T-RETRY-3 — iteration 2's prompt differs from iteration 1's only inside opener; the block's bytes are the same, appended after the (possibly different) opener", async () => {
    const { calls } = await drivePlanRetryDispatch();
    const planCalls = calls.filter((c) => c.skill === "pm-author" || c.skill === "se-author" || c.skill === "te-author");
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
  test.skip("LI-20: LI-AT-33/LI-AT-34 — the enabled run's file-open set under docs/ equals BR-15's expected set (hand-transcribed from the fixture's scripted ls-files stdout minus the self paths); the disabled run, on the same instrument, touches no corpus path at all", async () => {
    const priorA = "docs/completed/prior-a/LEARNINGS-prior-a.md";
    const priorB = `docs/${FEATURE}/LEARNINGS-${FEATURE}.md`; // this run's own self document
    const corpus = buildLearningsCorpus([
      { path: priorA, doc: { feature: "prior-a", dateCompleted: "2026-01-01", sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }] } },
      { path: priorB, doc: { feature: FEATURE, dateCompleted: "2026-01-02", sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }] } },
    ]);
    // Hand-transcribed from the fixture's scripted ls-files stdout minus the self path — never
    // derived from `gatherLearningsCorpus` (PLAN LI-11).
    const EXPECTED_READ_SET = Object.freeze([priorA]);

    const fs = fakeFs(corpus.contents);
    const dev = await import("../orchestrate-dev.js");
    const mainDev = dev.default;
    const calls = [];
    const _git = fakeGit((argv) =>
      isLearningsEnumerateCall(argv) ? { ok: true, stdout: corpus.lsFilesStdout } : { ok: true, stdout: "" }
    );
    const _readFile = (path) => {
      const p = String(path);
      if (p.includes("/PLAN-")) return SCENARIO_PLAN;
      return fs.readFile ? fs.readFile(p) : corpus.contents[p] ?? null;
    };

    const enabledResult = await mainDev({
      reqPath: REQ_PATH,
      forcePhases: null,
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

    const readsUnderDocs = (fs.reads ?? [])
      .map((r) => r.path)
      .filter((p) => String(p).startsWith("docs/"));
    const observedSet = new Set(readsUnderDocs);
    expect(observedSet).toEqual(new Set(EXPECTED_READ_SET));
    expect(observedSet.size).toBeGreaterThan(0); // the control: the instrument fires
    expect([...observedSet].some((p) => p.startsWith("docs/_constraints/"))).toBe(false);
    expect([...observedSet].some((p) => p.startsWith("docs/_decisions/"))).toBe(false);
    expect(enabledResult.report).toBeTruthy();

    // ── AT-34: the disabled run, on the SAME instrument, in the SAME test ──────────────────
    const fsDisabled = fakeFs(corpus.contents);
    const disabledCalls = [];
    const _readFileDisabled = (path) => {
      const p = String(path);
      if (p.includes("/PLAN-")) return SCENARIO_PLAN;
      return fsDisabled.readFile ? fsDisabled.readFile(p) : corpus.contents[p] ?? null;
    };
    const disabledResult = await mainDev({
      reqPath: REQ_PATH,
      forcePhases: null,
      _agent: buildRecordingAgent(disabledCalls),
      _parallel: (promises) => Promise.all(promises),
      _checkFile: () => ({ ok: true }),
      _readFile: _readFileDisabled,
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
      // The learnings section explicitly disabled.
      _readAdvisoryConfig: undefined,
    });

    const disabledReadsUnderDocsCorpus = (fsDisabled.reads ?? [])
      .map((r) => r.path)
      .filter((p) => p === priorA || p === priorB);
    expect(disabledReadsUnderDocsCorpus).toEqual([]);
    expect(disabledCalls.map((c) => c.prompt)).toEqual(calls.map((c) => c.prompt));
    expect(disabledResult.outcome).toBeTruthy();
  });
});

describe("learningsDispatchSet — LI-AT-35: gate semantics are preserved exactly as without the feature", () => {
  test.skip("LI-20: LI-AT-35 — completeness criteria, required headings, verdict grammar, round windows and approval anchors are exactly those in force without the feature", async () => {
    const corpus = buildLearningsCorpus([
      {
        path: "docs/completed/prior-a/LEARNINGS-prior-a.md",
        doc: { feature: "prior-a", dateCompleted: "2026-01-01", sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }] },
      },
    ]);
    const enabledRun = await runScenario({ corpus });
    const disabledRun = await runScenario({ corpus, configText: JSON.stringify({ learningsInjection: { enabled: false } }) });

    const observe = (r) => ({
      completenessScores: r.result.report.completenessScores ?? null,
      requiredHeadings: r.result.report.requiredHeadings ?? null,
      verdictGrammar: r.result.report.verdictGrammar ?? null,
      roundWindows: r.result.report.roundWindows ?? null,
      approvalAnchors: r.result.report.approvalAnchors ?? null,
    });
    expect(observe(enabledRun)).toEqual(observe(disabledRun));
  });
});

describe("learningsDispatchSet — AC-5.2's write half, and the static seam-discipline scan (no FSPEC AT id)", () => {
  test.skip("LI-20: AC-5.2 write half — a git status --porcelain set-equality delta around the run, in a dedicated temp git repository that is the run's cwd, with no exemption list", async () => {
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

  test.skip("LI-20: static seam-discipline scan — the region between LI-15's sentinel comments contains no fs., writeFileSync, mkdirSync, appendFileSync or require(\"fs\")", () => {
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
