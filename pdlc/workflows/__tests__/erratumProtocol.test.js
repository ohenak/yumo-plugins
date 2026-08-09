/**
 * The erratum protocol — PROPOSAL §3.1 step 4, §1 row M-4, §5 decision 2.
 *
 * Three layers, one per collaborator in the protocol:
 *   1. `parseErrata`   — the grammar, pure and fail-open.
 *   2. `reviewLoop`    — collection: every reviewer and optimizer response of
 *                        every iteration, and provably no effect on convergence.
 *   3. `main()`        — routing: the targeted versioned edit, the approvers'
 *                        delta confirmation, the fresh approval anchors, the
 *                        §5 decision 2 bound, and the two halts.
 *
 * Oracle rules observed throughout (§3.5): expected values are literal
 * transcriptions — no test imports the constant it asserts; every negative
 * assertion is paired with a positive one on the same path; the doc-type
 * catalogue is checked by set-equality, not containment.
 */

import main, { reviewLoop, parseErrata, approvalHashOf } from "../orchestrate-dev.js";
import { fakeFs, fakeGit, fakeListFiles } from "./helpers/seams.js";

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

// ─── 1. parseErrata — the grammar ─────────────────────────────────────────────

describe("parseErrata: the erratum grammar", () => {
  test("PROP-ERR-01: every well-formed line is returned, in order, with its doc type and item", () => {
    const text = [
      "I reviewed the TSPEC. Two upstream defects surfaced.",
      "ERRATUM: FSPEC: §4's error budget contradicts REQ AC-3.",
      "ERRATUM: REQ: AC-7 names a file that does not exist.",
      "VERDICT: Approved",
    ].join("\n");

    expect(parseErrata(text)).toEqual([
      { docType: "FSPEC", item: "§4's error budget contradicts REQ AC-3." },
      { docType: "REQ", item: "AC-7 names a file that does not exist." },
    ]);
  });

  test("PROP-ERR-02: an item may itself contain colons — the doc type ends at the FIRST one", () => {
    expect(parseErrata("ERRATUM: PLAN: §3.1: the task table lists TASK-09 twice")).toEqual([
      { docType: "PLAN", item: "§3.1: the task table lists TASK-09 twice" },
    ]);
  });

  test("PROP-ERR-03: a list-marker prefix is tolerated", () => {
    expect(parseErrata("- ERRATUM: TSPEC: §5.2 cites a symbol that was renamed")).toEqual([
      { docType: "TSPEC", item: "§5.2 cites a symbol that was renamed" },
    ]);
  });

  test("PROP-ERR-04: an unknown doc type is ignored and reported — the valid lines still parse", () => {
    const ignored = [];
    const text = [
      "ERRATUM: SPEC: not a document type in this pipeline",
      "ERRATUM: FSPEC: §2 is wrong",
      "ERRATUM: fspec: lowercase is not the grammar",
    ].join("\n");

    // Negative: neither unknown spelling reaches the result …
    const parsed = parseErrata(text, (docType, item) => ignored.push({ docType, item }));
    expect(parsed).toEqual([{ docType: "FSPEC", item: "§2 is wrong" }]);
    // … positive, on the same path: both were reported to the caller, and the
    // one valid line still routed.
    expect(ignored).toEqual([
      { docType: "SPEC", item: "not a document type in this pipeline" },
      { docType: "fspec", item: "lowercase is not the grammar" },
    ]);
  });

  test("PROP-ERR-05: identical lines are deduplicated, first occurrence wins the order", () => {
    const text = [
      "ERRATUM: FSPEC: §2 is wrong",
      "ERRATUM: TSPEC: §9 is wrong",
      "ERRATUM: FSPEC: §2 is wrong",
    ].join("\n");
    expect(parseErrata(text)).toEqual([
      { docType: "FSPEC", item: "§2 is wrong" },
      { docType: "TSPEC", item: "§9 is wrong" },
    ]);
  });

  test("PROP-ERR-06: a fenced echo of the grammar is not an erratum — the same text unfenced is", () => {
    const line = "ERRATUM: FSPEC: §2 is wrong";
    // Negative: quoted inside a fence, it parses to nothing …
    expect(parseErrata(["Here is the form I was asked to use:", "```", line, "```"].join("\n"))).toEqual(
      []
    );
    // … positive, same line, same parser, outside the fence.
    expect(parseErrata(line)).toEqual([{ docType: "FSPEC", item: "§2 is wrong" }]);
  });

  test("PROP-ERR-07: a line with no item, and a line with no second colon, parse to nothing", () => {
    expect(parseErrata("ERRATUM: FSPEC:")).toEqual([]);
    expect(parseErrata("ERRATUM: nothing to report")).toEqual([]);
    // Paired positive: the parser is not simply inert on this input shape.
    expect(parseErrata("ERRATUM: FSPEC: x")).toEqual([{ docType: "FSPEC", item: "x" }]);
  });

  test("PROP-ERR-08: the doc-type catalogue is exactly six documents, by set-equality", () => {
    // One line per document type the protocol admits. Written as literals, so
    // deleting a doc type from the shipped catalogue reds this test.
    const CATALOGUE = ["REQ", "FSPEC", "TSPEC", "DECISIONS", "PLAN", "PROPERTIES"];
    const probe = CATALOGUE.map((t) => `ERRATUM: ${t}: item for ${t}`).join("\n");
    expect(parseErrata(probe).map((e) => e.docType).sort()).toEqual([...CATALOGUE].sort());

    // Paired negative on the same path: nothing OUTSIDE the catalogue is admitted.
    const outside = ["LEARNINGS", "POSTMORTEM", "CODE_REVIEW", "SPEC", "REQUIREMENTS"];
    const rejected = [];
    expect(
      parseErrata(
        outside.map((t) => `ERRATUM: ${t}: item for ${t}`).join("\n"),
        (docType) => rejected.push(docType)
      )
    ).toEqual([]);
    expect(rejected.sort()).toEqual([...outside].sort());
  });

  test("PROP-ERR-09: null, undefined and empty input are total, not throwing", () => {
    expect(parseErrata(null)).toEqual([]);
    expect(parseErrata(undefined)).toEqual([]);
    expect(parseErrata("")).toEqual([]);
  });
});

// ─── 2. reviewLoop — collection ───────────────────────────────────────────────

const APPROVE = 'Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
const NEEDS = 'Issues.\nVERDICT: Needs revision\n{"high": 1, "medium": 0, "low": 0}\n';

const loopParams = {
  doc: "docs/test-feat/TSPEC-test-feat.md",
  phase: "T",
  docType: "TSPEC",
  reviewers: ["pm-review", "te-review"],
  optimizer: "se-author",
  feature: "test-feat",
};

const existsGuard = () => ({ ok: true });
const serialParallel = (promises) => Promise.all(promises);

/**
 * Two runs, identical except that one carries errata in its response text.
 * `withErrata` is what the reviewers and the optimizer add to their replies.
 */
async function runTwinLoop(withErrata) {
  let pmRound = 0;
  const agentFn = async (skill, prompt) => {
    if (skill === "pm-review") {
      pmRound += 1;
      const base = pmRound === 1 ? NEEDS : APPROVE;
      return withErrata ? `${base}ERRATUM: FSPEC: pm round ${pmRound} finding\n` : base;
    }
    if (skill === "te-review") {
      return withErrata ? `${APPROVE}ERRATUM: REQ: te finding\n` : APPROVE;
    }
    if (skill === "se-author") {
      return withErrata
        ? "Addressed feedback.\nERRATUM: FSPEC: optimizer finding\n"
        : "Addressed feedback.";
    }
    return "";
  };
  return reviewLoop({
    ...loopParams,
    _agent: agentFn,
    _parallel: serialParallel,
    _checkFile: existsGuard,
  });
}

describe("reviewLoop: erratum collection", () => {
  test("PROP-ERR-10: errata from BOTH reviewers and the optimizer, across every iteration, each tagged with its source skill", async () => {
    const result = await runTwinLoop(true);
    expect(result.errata).toEqual([
      { docType: "FSPEC", item: "pm round 1 finding", source: "pm-review" },
      { docType: "REQ", item: "te finding", source: "te-review" },
      { docType: "FSPEC", item: "optimizer finding", source: "se-author" },
      { docType: "FSPEC", item: "pm round 2 finding", source: "pm-review" },
    ]);
  });

  test("PROP-ERR-11: errata change neither convergence nor the iteration count — the twin run agrees exactly", async () => {
    const withErrata = await runTwinLoop(true);
    const withoutErrata = await runTwinLoop(false);

    // Positive: the run that carried errata converged, on the same round.
    expect(withErrata.converged).toBe(true);
    expect(withErrata.iterations).toBe(2);
    // … and its twin, which carried none, agrees on both.
    expect(withoutErrata.converged).toBe(withErrata.converged);
    expect(withoutErrata.iterations).toBe(withErrata.iterations);
    expect(withoutErrata.errata).toEqual([]);
  });

  test("PROP-ERR-12: the non-convergence return carries the errata it collected on its way to the POSTMORTEM", async () => {
    const agentFn = async (skill, prompt) => {
      if (skill === "pm-review" || skill === "te-review") {
        return `${NEEDS}ERRATUM: PLAN: task table is unparseable\n`;
      }
      if (skill === "se-author") {
        return typeof prompt === "string" && prompt.includes("POSTMORTEM")
          ? "POSTMORTEM written."
          : "Revised.";
      }
      return "";
    };
    const result = await reviewLoop({
      ...loopParams,
      _agent: agentFn,
      _parallel: serialParallel,
      _checkFile: existsGuard,
    });
    expect(result.converged).toBe(false);
    expect(result.errata).toEqual([
      { docType: "PLAN", item: "task table is unparseable", source: "pm-review" },
      { docType: "PLAN", item: "task table is unparseable", source: "te-review" },
    ]);
  });
});

// ─── 3. main() / converge() — routing ─────────────────────────────────────────

const FEATURE = "efeat";
const DOCS = `docs/${FEATURE}`;
const FSPEC_PATH = `${DOCS}/FSPEC-${FEATURE}.md`;
const FSPEC_TEXT = "# FSPEC\n\nThe functional specification body.\n";
const ERRATUM_ITEM = "§4's error budget contradicts REQ AC-3";

/** A PLAN the mechanical parser reads (PROPOSAL §3.3) — Phase P refuses others. */
const PARSEABLE_PLAN = [
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| TASK-01 | First task | 1 | - |",
  "",
  "| Task | Files |",
  "|---|---|",
  "| TASK-01 | `src/one.js` |",
].join("\n");

/** A structurally complete cross-review: a trailing `## Verdict` with one verdict line. */
function crossReviewText(verdict = "Approved", high = 0) {
  return [
    "# Cross-review",
    "",
    "## Findings",
    "",
    "None blocking.",
    "",
    "## Verdict",
    "",
    `VERDICT: ${verdict}`,
    `{"high": ${high}, "medium": 0, "low": 0}`,
    "",
  ].join("\n");
}

/**
 * The pipeline harness. One agent double covers every skill; the erratum
 * behaviour is injected through `opts`.
 *
 * The `_listFiles` double is DERIVED from the in-memory tree rather than
 * scripted, so a cross-review file a reviewer writes during the run advances the
 * round window exactly as it does on disk — which is what makes the
 * confirmation's round index a derived value and not a fixture constant.
 */
async function runPipeline(opts = {}) {
  const {
    tspecReviewerErratum = null,
    confirmationVerdict = "Approved",
    confirmationErratum = null,
    absentPaths = [],
    seedFspecRoundOne = true,
    // DEC-ERR-02. The confirmation's two channels, separable. Both default to
    // agreeing with `confirmationVerdict`, so every test written before this
    // decision keeps the single-channel reviewer it was written against.
    //
    // `confirmationFileVerdict` / `confirmationFileHigh`: what the reviewer
    // WRITES. A verdict outside the catalogue makes the FILE unreadable too.
    // `confirmationTrailer`: what the reviewer RETURNS. `"omitted"` returns
    // prose with no trailer — the live 2026-08-09 failure; `"garbled"` returns
    // a verdict outside the catalogue, which `parseVerdict` also calls malformed.
    confirmationFileVerdict = null,
    confirmationFileHigh = 0,
    confirmationTrailer = "verdict",
  } = opts;

  const seeded = {
    [`${DOCS}/REQ-${FEATURE}.md`]: "# REQ\n\nThe requirement body.\n",
    [FSPEC_PATH]: FSPEC_TEXT,
    [`${DOCS}/PLAN-${FEATURE}.md`]: PARSEABLE_PLAN,
  };
  if (seedFspecRoundOne) {
    seeded[`${DOCS}/CROSS-REVIEW-software-engineer-FSPEC-v1.md`] = crossReviewText();
    seeded[`${DOCS}/CROSS-REVIEW-test-engineer-FSPEC-v1.md`] = crossReviewText();
  }
  const fs = fakeFs(seeded);

  const dispatches = [];
  const sessions = [];

  const agentFn = async (skill, prompt) => {
    const text = typeof prompt === "string" ? prompt : "";
    dispatches.push({ skill, prompt: text });

    // The delta confirmation writes its cross-review file, as a reviewer does.
    if (text.includes("DELTA CONFIRMATION")) {
      const match = /(docs\/\S*CROSS-REVIEW-\S+\.md)/.exec(text);
      const fileVerdict = confirmationFileVerdict ?? confirmationVerdict;
      // The file is written BEFORE the response is returned, which is the real
      // ordering: a reviewer commits its cross-review during its episode, so the
      // file is on disk by the time the orchestrator reads any trailer.
      if (match) fs.files[match[1]] = crossReviewText(fileVerdict, confirmationFileHigh);
      const extra = confirmationErratum ? `ERRATUM: ${confirmationErratum}\n` : "";
      if (confirmationTrailer === "omitted") {
        return `Delta confirmed. I wrote my review to ${match ? match[1] : "the review file"}.\n${extra}`;
      }
      if (confirmationTrailer === "garbled") {
        return `Delta confirmed.\n${extra}VERDICT: Looks fine to me\n`;
      }
      return (
        `Delta confirmed.\n${extra}VERDICT: ${confirmationVerdict}\n` +
        `{"high": ${confirmationVerdict === "Approved" ? 0 : 1}, "medium": 0, "low": 0}\n`
      );
    }

    if (skill === "se-review" || skill === "te-review" || skill === "pm-review") {
      if (skill === "te-review" && tspecReviewerErratum && text.includes("for phase T of feature")) {
        return `${APPROVE}ERRATUM: ${tspecReviewerErratum}\n`;
      }
      return APPROVE;
    }
    if (skill === "pm-author" || skill === "se-author" || skill === "te-author") {
      if (text.includes("DECISIONS_WARRANTED")) {
        return "Finalized.\nREVISION-COMPLETE: yes\nDECISIONS_WARRANTED: false";
      }
      if (text.includes("Return a JSON object")) {
        return JSON.stringify({
          tasks: [{ id: "TASK-01", description: "First task", dependencies: [], planBatch: 1 }],
        });
      }
      return "Document updated and committed.\nREVISION-COMPLETE: yes";
    }
    if (skill === "se-implement") return "Tests: 5 passed, 0 failed.";
    if (skill === "harvest-learnings") return "Harvest complete.";
    if (skill === "dod-verify") return "Clean.\nDOD_STATUS: passed";
    if (skill === "ship-pr") {
      if (text.includes("Rebase the feature branch")) return "Rebased.\nREBASE_STATUS: clean";
      if (text.includes("Raise a pull request")) {
        return "PR opened.\nPR_URL: https://github.com/acme/repo/pull/42";
      }
      return "Checks complete.\nCI_STATUS: passed";
    }
    return "Success.";
  };

  const sessionAgent = async (sessionKey, skill, prompt, agentOpts) => {
    sessions.push({ sessionKey, skill, prompt: typeof prompt === "string" ? prompt : "" });
    return agentFn(skill, prompt, agentOpts);
  };

  const checkFile = (path) =>
    absentPaths.includes(path) ? { ok: false, reason: "file_missing" } : { ok: true };

  const listFiles = fakeListFiles((dirPath) =>
    Object.keys(fs.files)
      .filter((p) => p.startsWith(`${dirPath}/`) && !p.slice(dirPath.length + 1).includes("/"))
      .map((p) => p.slice(dirPath.length + 1))
  );

  const git = fakeGit((argv) => {
    if (argv[0] === "rev-parse" && argv[1] === "--abbrev-ref") {
      return { ok: true, stdout: `feat-${FEATURE}` };
    }
    if (argv[0] === "rev-parse") {
      return { ok: true, stdout: "0123456789abcdef0123456789abcdef01234567" };
    }
    return { ok: true, stdout: "" };
  });

  const phasesCalled = [];
  const report = await main({
    reqPath: `${DOCS}/REQ-${FEATURE}.md`,
    _agent: agentFn,
    _sessionAgent: sessionAgent,
    _parallel: (promises) => Promise.all(promises),
    _readFile: fs.readFile,
    _hashFile: fs.hashFile,
    _appendFile: fs.appendFile,
    _writeFile: fs.writeFile,
    _checkFile: checkFile,
    _listFiles: listFiles,
    _git: git,
    _phase: (label) => phasesCalled.push(label),
    _pipeline: async (label, fn) => fn(),
    _mergeWorktree: async () => ({ ok: true }),
    _checkCi: async () => "passed",
  });

  return { report, fs, dispatches, sessions, phasesCalled };
}

const erratumAuthorDispatches = (dispatches) =>
  dispatches.filter((d) => d.prompt.includes("ERRATUM ROUND for"));
const confirmationDispatches = (dispatches) =>
  dispatches.filter((d) => d.prompt.includes("DELTA CONFIRMATION for"));

describe("converge(): erratum routing (§3.1 step 4)", () => {
  test("PROP-ERR-20: a TSPEC-phase erratum against the FSPEC reaches the FSPEC's author, in the FSPEC's own author session, carrying the item verbatim", async () => {
    const { dispatches, sessions } = await runPipeline({
      tspecReviewerErratum: `FSPEC: ${ERRATUM_ITEM}`,
    });

    const authored = erratumAuthorDispatches(dispatches);
    expect(authored.length).toBe(1);
    // The FSPEC's own author skill, not the TSPEC phase's.
    expect(authored[0].skill).toBe("pm-author");
    expect(authored[0].prompt).toContain(`ERRATUM ROUND for ${FSPEC_PATH}`);
    expect(authored[0].prompt).toContain(`- ${ERRATUM_ITEM} (raised by te-review)`);
    // A targeted, versioned edit — not a rewrite (M-4).
    expect(authored[0].prompt).toContain("This is an erratum round, NOT a rewrite.");

    // The session it lands in is the FSPEC document's author session (M-2), a
    // literal key, not the TSPEC phase's.
    const authorSession = sessions.find((s) => s.prompt.includes("ERRATUM ROUND for"));
    expect(authorSession.sessionKey).toBe(`${FEATURE}/FSPEC/author`);
  });

  test("PROP-ERR-21: the FSPEC's own approvers deliver the delta confirmation, at the next derived round index, in their own reviewer sessions", async () => {
    const { dispatches, sessions } = await runPipeline({
      tspecReviewerErratum: `FSPEC: ${ERRATUM_ITEM}`,
    });

    const confirmations = confirmationDispatches(dispatches);
    // FSPEC's approvers — se-review and te-review — and only those two.
    expect(confirmations.map((d) => d.skill).sort()).toEqual(["se-review", "te-review"]);
    // Round 1 exists on the branch, so the confirmation is round 2: derived from
    // the listing, never assumed.
    expect(
      confirmations.find((d) => d.skill === "se-review").prompt
    ).toContain(`${DOCS}/CROSS-REVIEW-software-engineer-FSPEC-v2.md`);
    expect(
      confirmations.find((d) => d.skill === "te-review").prompt
    ).toContain(`${DOCS}/CROSS-REVIEW-test-engineer-FSPEC-v2.md`);
    // Confirmation, not re-review.
    expect(confirmations[0].prompt).toContain("Do not re-review the whole document.");

    const confirmSessions = sessions
      .filter((s) => s.prompt.includes("DELTA CONFIRMATION for"))
      .map((s) => s.sessionKey)
      .sort();
    expect(confirmSessions).toEqual([
      `${FEATURE}/FSPEC/reviewer/software-engineer`,
      `${FEATURE}/FSPEC/reviewer/test-engineer`,
    ]);
  });

  test("PROP-ERR-22: both confirmations PASS ⇒ fresh approval anchors are appended to the confirmation files, pinned to the edited FSPEC", async () => {
    const { fs } = await runPipeline({ tspecReviewerErratum: `FSPEC: ${ERRATUM_ITEM}` });

    const expectedHash = approvalHashOf(FSPEC_TEXT);
    const expectedText =
      `\nAPPROVAL-HASH: ${expectedHash}\n` +
      `REVIEWED-COMMIT: 0123456789abcdef0123456789abcdef01234567\n`;
    expect(fs.appends).toEqual([
      { path: `${DOCS}/CROSS-REVIEW-software-engineer-FSPEC-v2.md`, text: expectedText },
      { path: `${DOCS}/CROSS-REVIEW-test-engineer-FSPEC-v2.md`, text: expectedText },
    ]);
  });

  test("PROP-ERR-23: the erratum round is reported, and the pipeline proceeds past the phase that raised it", async () => {
    const { report, phasesCalled } = await runPipeline({
      tspecReviewerErratum: `FSPEC: ${ERRATUM_ITEM}`,
    });

    expect(report.notices).toContain(
      "Phase T: erratum round for FSPEC — 1 item, confirmed at round v2 by se-review, te-review."
    );
    // Positive pair: the run did not merely avoid halting, it went on to the
    // next phases and finished.
    expect(report.outcome).toBe("success");
    expect(phasesCalled.some((p) => p.includes("Phase P"))).toBe(true);
    expect(report.phases.find((p) => p.phase === "T").detail).toBe(
      "Approved (1 iterations) — erratum rounds: FSPEC"
    );
  });

  test("PROP-ERR-24: a delta confirmation that does not pass halts the raising phase, naming the document, the item and the POSTMORTEM", async () => {
    const { report, fs } = await runPipeline({
      tspecReviewerErratum: `FSPEC: ${ERRATUM_ITEM}`,
      confirmationVerdict: "Needs revision",
    });

    expect(report.outcome).toBe("halted");
    expect(report.haltPhase).toBe("T");
    expect(report.haltReason).toContain(
      "Phase T halted: the delta confirmation of the FSPEC erratum round did not pass"
    );
    expect(report.haltReason).toContain("non-approving: [se-review, te-review]");
    expect(report.haltReason).toContain(`Erratum items against ${FSPEC_PATH}: ${ERRATUM_ITEM}.`);
    // The POSTMORTEM lifecycle is the review loop's, unchanged.
    expect(report.postmortemStatus).toBe("written");
    expect(report.postmortemPath).toBe(`${DOCS}/POSTMORTEM-T-${FEATURE}.md`);
    // Negative paired with a positive: no approval anchor was recorded for a
    // confirmation that did not approve, while the phase row records the failure.
    expect(fs.appends).toEqual([]);
    expect(report.phases.find((p) => p.phase === "T").status).toBe("❌");
  });

  // ─── DEC-ERR-02: the file is consulted when the trailer is unreadable ────────
  //
  // Recorded 2026-08-09 from a live run. `te-review` confirmed a REQ erratum,
  // wrote an approving, anchored cross-review, and returned a response with no
  // trailer. The confirmation read only the response, so the phase halted naming
  // that reviewer non-approving — seconds after it had committed its approval to
  // a file the orchestrator never opened.
  //
  // The fallback's whole content is WHEN it fires, so the four cases below are
  // the decision table, not four variations on one case.

  test("PROP-ERR-24a: a confirmation whose response carries no trailer is read from the file it wrote, and passes", async () => {
    const { report, fs } = await runPipeline({
      tspecReviewerErratum: `FSPEC: ${ERRATUM_ITEM}`,
      confirmationTrailer: "omitted",
    });

    // The defect was a halt. The positive half is that the run did not merely
    // avoid halting — it recorded the erratum round and carried on.
    expect(report.outcome).toBe("success");
    expect(report.notices).toContain(
      "Phase T: erratum round for FSPEC — 1 item, confirmed at round v2 by se-review, te-review."
    );

    // An approval read from the file is a real approval: it anchors, exactly as
    // one read from a trailer does. Without this the upstream document's
    // recorded approval would point at pre-erratum bytes and the staleness gate
    // would re-open a phase its approvers had just re-confirmed.
    expect(fs.appends.map((a) => a.path)).toEqual([
      `${DOCS}/CROSS-REVIEW-software-engineer-FSPEC-v2.md`,
      `${DOCS}/CROSS-REVIEW-test-engineer-FSPEC-v2.md`,
    ]);
    expect(fs.appends.every((a) => a.text.includes("APPROVAL-HASH: sha256:"))).toBe(true);

    // Which channel decided is reported. An operator forensicating one of these
    // halts has to answer exactly this question, and the first time it happened
    // the log did not say.
    expect(
      logMessages.some(
        (m) =>
          m.includes("Erratum confirmation (FSPEC, te-review)") &&
          m.includes("response trailer unreadable") &&
          m.includes(`${DOCS}/CROSS-REVIEW-test-engineer-FSPEC-v2.md`) &&
          m.includes("Approved")
      )
    ).toBe(true);
  });

  test("PROP-ERR-24b: a file that does not approve still halts, so the fallback is not a way through", async () => {
    const { report, fs } = await runPipeline({
      tspecReviewerErratum: `FSPEC: ${ERRATUM_ITEM}`,
      confirmationTrailer: "omitted",
      // A High finding, not merely the words "Needs revision". Under DEC-BAR-01
      // the bar is High-only, so a "Needs revision" carrying zero High is a PASS
      // — and reading it from the file must not change that either.
      confirmationFileVerdict: "Needs revision",
      confirmationFileHigh: 1,
    });

    // The fallback reads the file; it does not assume the file says yes.
    expect(report.outcome).toBe("halted");
    expect(report.haltPhase).toBe("T");
    expect(report.haltReason).toContain("non-approving: [se-review, te-review]");
    expect(fs.appends).toEqual([]);
  });

  test("PROP-ERR-24c: a legible non-approving trailer is never overturned by an approving file", async () => {
    const { report, fs } = await runPipeline({
      tspecReviewerErratum: `FSPEC: ${ERRATUM_ITEM}`,
      confirmationVerdict: "Needs revision",
      confirmationFileVerdict: "Approved",
    });

    // This is the boundary the narrowness buys. The trailer is READABLE and says
    // no; the file says yes. A fallback that fired on any non-pass — rather than
    // only on `malformed` — would let the file overturn a reviewer's explicit
    // rejection, which is a far worse failure than the one being fixed.
    expect(report.outcome).toBe("halted");
    expect(report.haltReason).toContain(
      "Phase T halted: the delta confirmation of the FSPEC erratum round did not pass"
    );
    expect(fs.appends).toEqual([]);
    // And the file was never consulted, so nothing was reported about it.
    expect(logMessages.some((m) => m.includes("Erratum confirmation (FSPEC,"))).toBe(false);
  });

  test("PROP-ERR-24d: an unreadable FILE is stopped by the dispatch watchdog, before the verdict is ever read", async () => {
    const { report, fs } = await runPipeline({
      tspecReviewerErratum: `FSPEC: ${ERRATUM_ITEM}`,
      confirmationTrailer: "garbled",
      // A verdict outside the catalogue, in BOTH channels.
      confirmationFileVerdict: "Looks fine to me",
    });

    // This is where the fallback's fail-closed guarantee actually lives, and it
    // is not in the fallback. `dispatchAndVerify` will not accept a cross-review
    // whose verdict it cannot read: it re-dispatches, and after
    // MAX_AUTHORING_ATTEMPTS it halts on no-progress. So the confirmation never
    // returns an unreadable file to the verdict read at all — which is why
    // widening that read to consult the file cannot widen what gets through.
    //
    // The `else` branch there (both channels unreadable ⇒ keep the trailer's
    // Needs revision) is therefore defence in depth against a future caller, not
    // a reachable state on this path. Asserted as the halt that really happens
    // rather than the one the fallback would have produced, because a test that
    // claimed the latter would be describing code that never runs.
    expect(report.outcome).toBe("halted");
    // The watchdog is not the erratum halt and does not claim to be: it records
    // no `haltPhase`, which is itself how the two are told apart in a report.
    expect(report.haltPhase).toBeNull();
    expect(report.haltReason).toContain("Phase F: se-review");
    expect(report.haltReason).toContain("made no progress across 3 consecutive attempts");
    expect(report.haltReason).toContain(
      `${DOCS}/CROSS-REVIEW-software-engineer-FSPEC-v2.md`
    );
    // Nothing was approved on the way to that halt.
    expect(fs.appends).toEqual([]);
  });

  test("PROP-ERR-25: a second erratum batch for the same document in the same phase exhausts the bound and halts", async () => {
    const { report, dispatches } = await runPipeline({
      tspecReviewerErratum: `FSPEC: ${ERRATUM_ITEM}`,
      confirmationErratum: "FSPEC: §6 still disagrees with the REQ",
    });

    expect(report.outcome).toBe("halted");
    expect(report.haltPhase).toBe("T");
    expect(report.haltReason).toContain(
      `Phase T halted: further errata were raised against ${FSPEC_PATH} after its erratum round ` +
        "was already spent — the erratum bound of 1 round per upstream doc per phase is exhausted."
    );
    expect(report.haltReason).toContain(
      "Unaddressed items: §6 still disagrees with the REQ."
    );
    // Positive pair: exactly ONE erratum round was actually spent before the halt.
    expect(erratumAuthorDispatches(dispatches).length).toBe(1);
  });

  test("PROP-ERR-26: an erratum against a document that does not exist is a notice, not a halt", async () => {
    const decisionsPath = `${DOCS}/DECISIONS-${FEATURE}.md`;
    const { report, dispatches } = await runPipeline({
      tspecReviewerErratum: "DECISIONS: the rejected option is misdescribed",
      absentPaths: [decisionsPath],
    });

    expect(report.notices).toContain(
      `Phase T: erratum round for DECISIONS skipped — no document at ${decisionsPath} (1 item).`
    );
    // Negative: no upstream edit was dispatched …
    expect(erratumAuthorDispatches(dispatches)).toEqual([]);
    // … positive, same run: the pipeline finished anyway.
    expect(report.outcome).toBe("success");
  });

  test("PROP-ERR-27: an erratum naming the phase's OWN document is an ordinary finding — nothing is routed and the loop is unaffected", async () => {
    const { report, dispatches, fs } = await runPipeline({
      tspecReviewerErratum: "TSPEC: §5.2 cites a symbol that was renamed",
    });

    // Negative: no upstream author dispatch, no delta confirmation, no notice.
    expect(erratumAuthorDispatches(dispatches)).toEqual([]);
    expect(confirmationDispatches(dispatches)).toEqual([]);
    expect(report.notices.filter((n) => n.includes("erratum round"))).toEqual([]);
    expect(fs.appends).toEqual([]);
    // Positive on the same path: Phase T converged in one iteration and the
    // report row is byte-identical to a run that raised no erratum at all.
    expect(report.outcome).toBe("success");
    expect(report.phases.find((p) => p.phase === "T").detail).toBe("Approved (1 iterations)");
  });
});

// ─── 4. The standing prompt clause ────────────────────────────────────────────

/**
 * The clause's literal anchors, transcribed from the design — never imported
 * from the module, so a garbled constant cannot satisfy them.
 */
const ERRATUM_GRAMMAR_ANCHOR = "ERRATUM: {DOCTYPE}: {one-line item}";
const ERRATUM_NO_FOLD_ANCHOR =
  "do not fold the defect into your verdict as if it were a defect of the document in front of you";
const ERRATUM_CATALOGUE_ANCHOR =
  "where {DOCTYPE} is one of REQ, FSPEC, TSPEC, DECISIONS, PLAN, PROPERTIES (uppercase)";

describe("the standing erratum clause reaches every prompt that can raise one", () => {
  test("PROP-ERR-30: reviewer prompts carry it at iteration 1 AND at the delta re-review", async () => {
    const prompts = [];
    let pmRound = 0;
    const agentFn = async (skill, prompt) => {
      prompts.push({ skill, prompt });
      if (skill === "pm-review") {
        pmRound += 1;
        return pmRound === 1 ? NEEDS : APPROVE;
      }
      if (skill === "te-review") return APPROVE;
      return "Revised.";
    };
    await reviewLoop({
      ...loopParams,
      _agent: agentFn,
      _parallel: serialParallel,
      _checkFile: existsGuard,
    });

    const reviewerPrompts = prompts.filter((p) => p.skill === "pm-review").map((p) => p.prompt);
    expect(reviewerPrompts.length).toBe(2);
    for (const prompt of reviewerPrompts) {
      expect(prompt).toContain(ERRATUM_GRAMMAR_ANCHOR);
      expect(prompt).toContain(ERRATUM_NO_FOLD_ANCHOR);
      expect(prompt).toContain(ERRATUM_CATALOGUE_ANCHOR);
    }

    const optimizerPrompt = prompts.find((p) => p.skill === "se-author").prompt;
    expect(optimizerPrompt).toContain(ERRATUM_GRAMMAR_ANCHOR);
    expect(optimizerPrompt).toContain(ERRATUM_NO_FOLD_ANCHOR);
    // Phase T's DECISIONS_WARRANTED trailer requirement stays the last
    // instruction — the erratum clause is inserted before it, not after.
    expect(optimizerPrompt.indexOf("DECISIONS_WARRANTED: true")).toBeGreaterThan(
      optimizerPrompt.indexOf(ERRATUM_GRAMMAR_ANCHOR)
    );
  });

  test("PROP-ERR-31: the creator prompt carries it too", async () => {
    const { dispatches } = await runPipeline();
    const creator = dispatches.find((d) => d.prompt.includes(`Create ${FSPEC_PATH}`));
    expect(creator).toBeDefined();
    expect(creator.skill).toBe("pm-author");
    expect(creator.prompt).toContain(ERRATUM_GRAMMAR_ANCHOR);
    expect(creator.prompt).toContain(ERRATUM_NO_FOLD_ANCHOR);
    expect(creator.prompt).toContain(ERRATUM_CATALOGUE_ANCHOR);
  });
});
