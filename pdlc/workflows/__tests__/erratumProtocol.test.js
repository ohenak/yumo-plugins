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

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import main, {
  reviewLoop,
  parseErrata,
  approvalHashOf,
  parseConfirmationFindings,
  erratumGateDecision,
  formatConfirmationFindings,
  markApprovalReopened,
  reopenedApproval,
  dedupeErrataEntries,
  splitErratumMultiHome,
  oracleContractShortfall,
  parseErratumRemint,
} from "../orchestrate-dev.js";
import { fakeFs, fakeGit, fakeListFiles } from "./helpers/seams.js";

/** T10's sanitized incident fixtures — the RT-1* rounds are read, not invented. */
const HALT_FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "halt-hardening");
const fixture = (name) => readFileSync(join(HALT_FIXTURES, name), "utf8");

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
    // DEC-ERR-03. `tspecReviewerErratum` takes an ARRAY as well as a string, so a
    // wave can carry a second upstream arm — the shape of the live episode.
    // `erratumRewrites` maps an upstream doc path to the bytes its erratum author
    // leaves behind, which is how an upstream document MOVES mid-wave here
    // exactly as it did on 2026-08-10.
    erratumRewrites = {},
    // PLAN §2.4 item 2 (T3). `{ [upstreamPath]: "RE-MINT: ...\n..." }` — the
    // RE-MINT lines an erratum author's response carries on the upstream-skew
    // path, appended after the rewrite it always reports. Absent by default,
    // which is the fail-open path this task must not disturb.
    erratumRemint = {},
    // PLAN §2.3 (T4). `{ [upstreamPath]: "bytes" }` — what the erratum author
    // leaves behind on the ONE bounded land-proof re-dispatch, separate from
    // `erratumRewrites` (the FIRST edit) so a fixture can leave a token out of
    // the first edit and land it on the retry, or leave it out of both.
    erratumLandProofRewrites = {},
    // PLAN §2.2 / §5 RT-1*. `{ [round]: { text, verdict, high } }` — the bytes a
    // confirmer writes AND returns at that derived round index.
    confirmationByRound = {},
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
      // PLAN §2.2 / §5. A confirmation scripted per ROUND, keyed off the round
      // index in the confirmation's own review path — which the workflow
      // derives from the directory listing, so a follow-up round answers on the
      // index it actually got rather than one this harness assumed. `text` is
      // the fixture body; the verdict trailer is added here because the two are
      // separate channels (CLAUDE.md, "two parts of a cross-review file").
      const roundMatch = match ? /-v(\d+)\.md$/.exec(match[1]) : null;
      const scripted = roundMatch ? confirmationByRound[Number(roundMatch[1])] : null;
      if (scripted) {
        const body =
          `${scripted.text}\n## Verdict\n\nVERDICT: ${scripted.verdict}\n` +
          `{"high": ${scripted.high ?? 0}, "medium": 0, "low": 0}\n`;
        if (match) fs.files[match[1]] = body;
        return body;
      }
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
        const lines = (
          Array.isArray(tspecReviewerErratum) ? tspecReviewerErratum : [tspecReviewerErratum]
        )
          .map((entry) => `ERRATUM: ${entry}`)
          .join("\n");
        return `${APPROVE}${lines}\n`;
      }
      return APPROVE;
    }
    if (skill === "pm-author" || skill === "se-author" || skill === "te-author") {
      // An erratum author that actually EDITS its document — without this the
      // wave's later layers can never observe an upstream that moved.
      const erratumTarget = /ERRATUM ROUND for (docs\/\S+\.md)/.exec(text);
      // PLAN §2.3 (T4). The land-proof's bounded re-dispatch carries the SAME
      // "ERRATUM ROUND for {path}" opener (plus a "LAND-PROOF RETRY" suffix),
      // so it is matched by the regex above too — this branch must be checked
      // FIRST, or a scripted `erratumLandProofRewrites` entry is shadowed by
      // the original `erratumRewrites` entry on the retry dispatch.
      if (erratumTarget && text.includes("LAND-PROOF RETRY") && erratumLandProofRewrites[erratumTarget[1]]) {
        fs.files[erratumTarget[1]] = erratumLandProofRewrites[erratumTarget[1]];
        return "Land-proof retry applied and committed.\nREVISION-COMPLETE: yes";
      }
      if (erratumTarget && erratumRewrites[erratumTarget[1]]) {
        fs.files[erratumTarget[1]] = erratumRewrites[erratumTarget[1]];
        const remint = erratumRemint[erratumTarget[1]];
        return remint
          ? `Erratum applied and committed.\n${remint}\nREVISION-COMPLETE: yes`
          : "Erratum applied and committed.\nREVISION-COMPLETE: yes";
      }
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

// ─── 4. DEC-ERR-03 — dispatch-time re-derivation and the superset confirmation ─
//
// The episode both clauses were recorded from (POSTMORTEM-T, episode 2,
// 2026-08-10): a multi-layer wave grew a second upstream arm AFTER its routing
// list was minted; the tail layer absorbed the routed list fully and correctly
// and still shipped a hole, and the two confirming channels split on identical
// bytes because they were answering different questions.

const REQ_PATH = `${DOCS}/REQ-${FEATURE}.md`;
const REQ_TEXT = "# REQ\n\nThe requirement body.\n";
/** What the REQ's own erratum author leaves behind — the wave's second arm. */
const REQ_REWRITTEN = "# REQ\n\nThe requirement body, plus AC-9 added by the erratum round.\n";

// Literal anchors, transcribed by hand.
const REGROUND_ANCHOR = "Re-ground on upstream HEAD FIRST, before you read the items below.";
const FLOOR_ANCHOR = "treat the item list below as a FLOOR, not a ceiling";
const MOVED_ANCHOR = "UPSTREAM MOVED SINCE THIS LIST WAS MINTED:";
const SUPERSET_ANCHOR = "The items landing is NECESSARY, NOT SUFFICIENT.";
const SUPERSET_FAITHFUL_ANCHOR =
  "ask whether this document is still a faithful compression of it";

describe("DEC-ERR-03: routing lists are re-derived at dispatch", () => {
  test("PROP-ERR-40: the erratum author is re-grounded on upstream HEAD, named with the upstream document's CURRENT digest", async () => {
    const { dispatches } = await runPipeline({
      tspecReviewerErratum: `FSPEC: ${ERRATUM_ITEM}`,
    });

    const authored = erratumAuthorDispatches(dispatches);
    expect(authored.length).toBe(1);
    const prompt = authored[0].prompt;

    // The FSPEC derives from the REQ, so the REQ is named — at the digest it
    // actually carries at this dispatch, which is what makes a stale list
    // detectable by the agent reading the prompt.
    expect(prompt).toContain(REGROUND_ANCHOR);
    expect(prompt).toContain(`- REQ: ${REQ_PATH} (${approvalHashOf(REQ_TEXT)})`);
    expect(prompt).toContain(FLOOR_ANCHOR);
    // Re-grounding is ordered BEFORE the routed items, not after them.
    expect(prompt.indexOf(REGROUND_ANCHOR)).toBeLessThan(prompt.indexOf(ERRATUM_ITEM));

    // Negative, on the same prompt: nothing moved in this wave, so the
    // stale-list warning is NOT raised — the clause fires on movement, not always.
    expect(prompt).not.toContain(MOVED_ANCHOR);
  });

  test("PROP-ERR-41: an upstream document edited mid-wave makes the LATER layer's prompt say so, and carries the upstream's post-edit digest", async () => {
    const { dispatches } = await runPipeline({
      // Two arms in one wave, in pipeline order: REQ is edited first, the FSPEC
      // is dispatched after — the exact shape of the live failure.
      tspecReviewerErratum: [`REQ: AC-7 names a file that does not exist`, `FSPEC: ${ERRATUM_ITEM}`],
      erratumRewrites: { [REQ_PATH]: REQ_REWRITTEN },
    });

    const authored = erratumAuthorDispatches(dispatches);
    const fspecAuthor = authored.find((d) => d.prompt.includes(`ERRATUM ROUND for ${FSPEC_PATH}`));
    expect(fspecAuthor).toBeDefined();

    expect(fspecAuthor.prompt).toContain(`${MOVED_ANCHOR} REQ`);
    expect(fspecAuthor.prompt).toContain(
      "may be incomplete or wrong for HEAD. Re-derive what this FSPEC owes its upstream"
    );
    // The digest shown is the REQ as the wave left it, not as the list was minted.
    expect(fspecAuthor.prompt).toContain(`- REQ: ${REQ_PATH} (${approvalHashOf(REQ_REWRITTEN)})`);
    expect(fspecAuthor.prompt).not.toContain(approvalHashOf(REQ_TEXT));
  });

  test("PROP-ERR-42: the REQ's own erratum author gets no upstream manifest — there is nothing above it — but still gets its items", async () => {
    const REQ_ITEM = "AC-7 names a file that does not exist";
    const { dispatches } = await runPipeline({ tspecReviewerErratum: `REQ: ${REQ_ITEM}` });

    const authored = erratumAuthorDispatches(dispatches);
    expect(authored.length).toBe(1);
    expect(authored[0].prompt).toContain(`ERRATUM ROUND for ${REQ_PATH}`);
    // Negative …
    expect(authored[0].prompt).not.toContain(REGROUND_ANCHOR);
    expect(authored[0].prompt).not.toContain(MOVED_ANCHOR);
    // … paired positive on the same prompt: the round itself is unchanged.
    expect(authored[0].prompt).toContain(`- ${REQ_ITEM} (raised by te-review)`);
    expect(authored[0].prompt).toContain("This is an erratum round, NOT a rewrite.");
  });
});

describe("DEC-ERR-03: a delta confirmation is a superset check against upstream HEAD", () => {
  test("PROP-ERR-43: BOTH confirming channels carry the superset clause — the outcome cannot depend on which reviewer over-delivers", async () => {
    const { dispatches } = await runPipeline({
      tspecReviewerErratum: `FSPEC: ${ERRATUM_ITEM}`,
    });

    const confirmations = confirmationDispatches(dispatches);
    // Set-equality over the confirming channels, not containment.
    expect(confirmations.map((d) => d.skill).sort()).toEqual(["se-review", "te-review"]);
    for (const d of confirmations) {
      expect(d.prompt).toContain(SUPERSET_ANCHOR);
      expect(d.prompt).toContain(SUPERSET_FAITHFUL_ANCHOR);
      expect(d.prompt).toContain(
        "Your scope is this FSPEC measured against its upstream AT HEAD — not the item list."
      );
      // The upstream it is asked to measure against is named, at the same
      // version the author was re-grounded on.
      expect(d.prompt).toContain(`- REQ: ${REQ_PATH} (${approvalHashOf(REQ_TEXT)})`);
      // The routed-item read is still asked for — necessary, just not sufficient.
      expect(d.prompt).toContain("Do not re-review the whole document.");
      expect(d.prompt).toContain(ERRATUM_ITEM);
    }
  });

  test("PROP-ERR-44: the superset clause reaches the confirmers of a document with nothing above it, without inventing an upstream manifest", async () => {
    const { dispatches } = await runPipeline({
      tspecReviewerErratum: `REQ: AC-7 names a file that does not exist`,
    });

    const confirmations = confirmationDispatches(dispatches);
    expect(confirmations.length).toBe(2);
    for (const d of confirmations) {
      // Positive: the clause itself is unconditional …
      expect(d.prompt).toContain(SUPERSET_ANCHOR);
      expect(d.prompt).toContain(
        "Your scope is this REQ measured against its upstream AT HEAD — not the item list."
      );
      // … negative: the manifest of upstream documents is not fabricated.
      expect(d.prompt).not.toContain("The upstream documents, at their current version");
    }
  });
});

// ─── 4. PLAN §2.2 — the severity/provenance/locality gate (RT-1a/1b/1c) ──────
//
// Three historical halts from `regime-scaffold-pivot-alignment`, replayed
// through the same seams the pipeline uses. The fixtures are T10's sanitized
// confirmations; the round indices are DERIVED by the workflow, not scripted,
// so the follow-up round asserts on the index it actually got.

const DELTA_HIGH_FINDING =
  'FINDING: High | delta | local | §3-02 | The owner cell in the expected rows table still ' +
  'reads "owner **tuple**"';
const INHERITED_HIGH_SECTION = "§8.3";

/** A scripted confirmation round: fixture body plus the verdict channel. */
const needsRevision = (name) => ({ text: fixture(name), verdict: "Needs revision", high: 1 });
const approved = () => ({ text: "# Cross-review\n\nNo residual findings.\n\n", verdict: "Approved", high: 0 });

describe("erratumGateDecision: the R1–R4 rule table", () => {
  const conf = (source, approving, findings, malformed) => ({
    source,
    approving,
    findings,
    malformed: malformed ?? [],
  });
  const high = (provenance, locality) => ({
    severity: "High",
    provenance,
    locality,
    section: "§1",
    text: "t",
  });

  test("PROP-GATE-01: every confirmer approving is R1, and R1 alone", () => {
    expect(
      erratumGateDecision({
        confirmations: [conf("a", true, []), conf("b", true, [])],
        followUpAvailable: true,
      }).rule
    ).toBe("R1");
    // Negative on the same path: one non-approver, same inputs otherwise, is not R1.
    expect(
      erratumGateDecision({
        confirmations: [conf("a", true, []), conf("b", false, [high("inherited", "nonlocal")])],
        followUpAvailable: true,
      }).rule
    ).toBe("R2");
  });

  test("PROP-GATE-02: R2 is decided on High-and-delta, not on severity or provenance alone", () => {
    // Inherited High: R2.
    expect(
      erratumGateDecision({
        confirmations: [conf("a", false, [high("inherited", "local")])],
        followUpAvailable: true,
      }).rule
    ).toBe("R2");
    // A delta finding that is not High is still R2 — Mediums and Lows are
    // recorded, not gating, exactly as the review loop's High-only bar.
    expect(
      erratumGateDecision({
        confirmations: [
          conf("a", false, [
            { severity: "Medium", provenance: "delta", locality: "nonlocal", section: "§2", text: "t" },
          ]),
        ],
        followUpAvailable: true,
      }).rule
    ).toBe("R2");
    // … and the positive pair: High AND delta leaves R2.
    expect(
      erratumGateDecision({
        confirmations: [conf("a", false, [high("delta", "local")])],
        followUpAvailable: true,
      }).rule
    ).toBe("R3");
  });

  test("PROP-GATE-03: R3 needs an unspent budget AND every HIGH local; either failure is R4", () => {
    const local = [conf("a", false, [high("delta", "local")])];
    expect(erratumGateDecision({ confirmations: local, followUpAvailable: true }).rule).toBe("R3");
    // Budget spent → R4 on identical findings.
    expect(erratumGateDecision({ confirmations: local, followUpAvailable: false }).rule).toBe("R4");
    // A nonlocal HIGH → R4 even with budget.
    const nonlocalHigh = [conf("a", false, [high("delta", "local"), high("inherited", "nonlocal")])];
    expect(erratumGateDecision({ confirmations: nonlocalHigh, followUpAvailable: true }).rule).toBe(
      "R4"
    );
    // … but a nonlocal LOW does not gate: the High-only bar holds here as it
    // does in the review loop, and the same findings stay R3.
    const nonlocalLow = [
      conf("a", false, [
        high("delta", "local"),
        { severity: "Low", provenance: "inherited", locality: "nonlocal", section: "§9", text: "t" },
      ]),
    ];
    expect(erratumGateDecision({ confirmations: nonlocalLow, followUpAvailable: true }).rule).toBe(
      "R3"
    );
  });

  test("PROP-GATE-04: a non-approving confirmation with nothing parseable fails closed to R4", () => {
    const decision = erratumGateDecision({
      confirmations: [conf("a", false, [])],
      followUpAvailable: true,
    });
    expect(decision.rule).toBe("R4");
    expect(decision.failClosed).toEqual(["a"]);
    expect(decision.findings).toEqual([
      {
        severity: "High",
        provenance: "delta",
        locality: "nonlocal",
        section: "(untagged confirmation)",
        text:
          "non-approving confirmation carried no parseable FINDING: line — read as " +
          "High/delta/nonlocal, fail-closed",
        source: "a",
        failClosed: true,
      },
    ]);
    // A malformed line is unknowable severity, so it fails closed too — even
    // alongside a parseable, harmless one.
    const withMalformed = erratumGateDecision({
      confirmations: [conf("a", false, [high("inherited", "local")], ["FINDING: garbled"])],
      followUpAvailable: true,
    });
    expect(withMalformed.rule).toBe("R4");
    expect(withMalformed.failClosed).toEqual(["a"]);
    // … and the positive pair: an APPROVING confirmer is never failed closed.
    const approvingSilent = erratumGateDecision({
      confirmations: [conf("a", true, []), conf("b", false, [high("inherited", "local")])],
      followUpAvailable: true,
    });
    expect(approvingSilent.failClosed).toEqual([]);
    expect(approvingSilent.rule).toBe("R2");
  });

  test("PROP-GATE-05: total on absent, empty and malformed input", () => {
    expect(erratumGateDecision().rule).toBe("R1");
    expect(erratumGateDecision({}).rule).toBe("R1");
    expect(erratumGateDecision({ confirmations: [null, undefined] }).rule).toBe("R1");
    expect(erratumGateDecision({ confirmations: [{ approving: false }] }).rule).toBe("R4");
  });

  test("PROP-GATE-06: findings render back into the canonical grammar, attributed", () => {
    expect(
      formatConfirmationFindings([
        { severity: "High", provenance: "delta", locality: "local", section: "§3", text: "one word", source: "te-review" },
      ])
    ).toBe("  te-review: FINDING: High | delta | local | §3 | one word");
    expect(formatConfirmationFindings([])).toBe("  (no parseable FINDING: lines)");
    expect(formatConfirmationFindings(null)).toBe("  (no parseable FINDING: lines)");
  });

  test("PROP-GATE-07: the re-open registry is a total, run-scoped read/write pair", () => {
    const registry = new Map();
    expect(reopenedApproval(registry, "FSPEC")).toBeNull();
    const entry = markApprovalReopened(registry, {
      docType: "FSPEC",
      phase: "F",
      reason: "inherited only.",
    });
    expect(entry).toEqual({ docType: "FSPEC", phase: "F", reason: "inherited only." });
    expect(reopenedApproval(registry, "FSPEC")).toEqual(entry);
    // Negative on the same path: a doc type nobody re-opened stays clean, and
    // a missing registry is not an error.
    expect(reopenedApproval(registry, "REQ")).toBeNull();
    expect(markApprovalReopened(null, { docType: "FSPEC" })).toBeNull();
    expect(reopenedApproval(null, "FSPEC")).toBeNull();
  });
});

describe("the erratum gate on the historical halts (PLAN §5)", () => {
  test("RT-1a: a High/delta/local confirmation buys ONE follow-up round, and a passing follow-up ends without a POSTMORTEM", async () => {
    const { report, dispatches, fs } = await runPipeline({
      tspecReviewerErratum: `FSPEC: ${ERRATUM_ITEM}`,
      confirmationByRound: {
        2: needsRevision("confirmation-delta-high.md"),
        3: approved(),
      },
    });

    // The historical halt is gone: the run finishes.
    expect(report.outcome).toBe("success");
    expect(report.postmortemPath).toBeNull();

    // Exactly TWO erratum author dispatches — the original round and one
    // follow-up. The follow-up is the observable the budget bounds.
    const authors = erratumAuthorDispatches(dispatches);
    expect(authors.length).toBe(2);
    // The follow-up carries the confirmers' finding verbatim, not the original
    // routed item, and it is re-confirmed at the NEXT derived round.
    expect(authors[1].prompt).toContain(
      '- [High | delta | local] §3-02 — The owner cell in the expected rows table still reads ' +
        '"owner **tuple**"'
    );
    expect(authors[1].prompt).not.toContain(ERRATUM_ITEM);
    expect(confirmationDispatches(dispatches).length).toBe(4);
    expect(report.notices).toContain(
      `Phase T: erratum follow-up round 1 for FSPEC — 3 items, confirmed at round v3 by se-review, te-review.`
    );
    // The approval anchors are written once, on the round that actually passed.
    expect(fs.appends.map((a) => a.path)).toEqual([
      `${DOCS}/CROSS-REVIEW-software-engineer-FSPEC-v3.md`,
      `${DOCS}/CROSS-REVIEW-test-engineer-FSPEC-v3.md`,
    ]);
  });

  test("RT-1a: a follow-up that fails again halts, and the payload is the FINDING lines with the routed list demoted", async () => {
    const { report, dispatches, fs } = await runPipeline({
      tspecReviewerErratum: `FSPEC: ${ERRATUM_ITEM}`,
      confirmationByRound: {
        2: needsRevision("confirmation-delta-high.md"),
        3: needsRevision("confirmation-delta-high.md"),
      },
    });

    expect(report.outcome).toBe("halted");
    expect(report.haltPhase).toBe("T");
    expect(report.postmortemStatus).toBe("written");
    // The budget is spent, and the halt says so.
    expect(erratumAuthorDispatches(dispatches).length).toBe(2);
    expect(report.haltReason).toContain(
      "The follow-up budget of 1 round was already spent."
    );
    // The payload leads with the confirmers' findings …
    expect(report.haltReason).toContain(`  se-review: ${DELTA_HIGH_FINDING}`);
    expect(report.haltReason).toContain(`  te-review: ${DELTA_HIGH_FINDING}`);
    // … and the pre-edit routed list survives only as background, BELOW them.
    // On a follow-up round that list is the previous round's findings, which is
    // exactly the point: what the halt leads with is what the confirmers said
    // LAST, never the item text the round was opened with two dispatches ago.
    expect(report.haltReason).toContain(
      `Background (the routed list this round was opened with, superseded by the findings ` +
        `above) — Erratum items against ${FSPEC_PATH}: [High | delta | local] §3-02 —`
    );
    expect(report.haltReason.indexOf(DELTA_HIGH_FINDING)).toBeLessThan(
      report.haltReason.indexOf("Background (the routed list")
    );
    // Nothing was approved on the way to the halt.
    expect(fs.appends).toEqual([]);
  });

  test("RT-1b: inherited-only Highs do not halt — the upstream doc is not re-anchored and its phase is re-opened", async () => {
    const { report, dispatches, fs } = await runPipeline({
      tspecReviewerErratum: `FSPEC: ${ERRATUM_ITEM}`,
      confirmationByRound: { 2: needsRevision("confirmation-inherited-high.md") },
    });

    // No halt, no POSTMORTEM, and the pipeline moves forward.
    expect(report.outcome).toBe("success");
    expect(report.postmortemPath).toBeNull();
    expect(report.phases.find((p) => p.phase === "T").status).toBe("✅");
    // No follow-up is bought: R2 is not a retry.
    expect(erratumAuthorDispatches(dispatches).length).toBe(1);
    expect(confirmationDispatches(dispatches).length).toBe(2);
    // The upstream document is NOT re-anchored — the approvers did not approve.
    expect(fs.appends).toEqual([]);
    // The re-open is recorded, names the owning phase, and carries the findings.
    const notice = report.notices.find((n) => n.includes("gate rule R2"));
    expect(notice).toBeDefined();
    expect(notice).toContain(
      `${FSPEC_PATH} was NOT re-anchored, and its recorded approval is RE-OPENED so phase F runs again`
    );
    expect(notice).toContain(`| inherited | nonlocal | ${INHERITED_HIGH_SECTION} |`);
  });

  test("RT-1f: a local delta High and a nonlocal inherited High in one confirmation fall through to R4 — neither is dropped", async () => {
    // Architect ruling (2026-08-15), ratifying the High-scoped R3 locality
    // amendment: when one confirmation carries work that R3's follow-up owns
    // AND work that R2's re-open owns, the gate must run BOTH or fall through
    // to R4. It may never silently drop the inherited High. The shipped gate
    // runs exactly one rule per confirmation — `allLocal` is false here, so
    // this input already resolves to R4 — and fail-closed is the sanctioned
    // fallback, so the behaviour is pinned rather than reworked. The rules stay
    // mutually exclusive and first-match-wins, which is the property the rest
    // of the table is read against.
    //
    // Read at the decision function first, so the rule is pinned on the tokens
    // rather than only on a pipeline that could reach the same halt some other
    // way.
    const parsed = parseConfirmationFindings(fixture("confirmation-mixed-high.md"));
    expect(parsed.malformed).toEqual([]);
    expect(parsed.findings.map((f) => `${f.severity}/${f.provenance}/${f.locality}`)).toEqual([
      "High/delta/local",
      "High/inherited/nonlocal",
      "Low/inherited/nonlocal",
    ]);
    const decision = erratumGateDecision({
      confirmations: [{ source: "te-review", approving: false, ...parsed }],
      followUpAvailable: true,
    });
    expect(decision.rule).toBe("R4");
    // Not a fail-closed read: the findings were parsed, and the halt is the
    // rule's own answer.
    expect(decision.failClosed).toEqual([]);
    expect(decision.allLocal).toBe(false);
    expect(decision.highDelta.length).toBe(1);

    // … and the positive pair on the same path: an inherited High that IS local
    // composes with the delta High, so it buys the follow-up and rides into it
    // as an item rather than being dropped.
    const localInherited = erratumGateDecision({
      confirmations: [
        {
          source: "te-review",
          approving: false,
          findings: parsed.findings.map((f) =>
            f.severity === "High" ? { ...f, locality: "local" } : f
          ),
          malformed: [],
        },
      ],
      followUpAvailable: true,
    });
    expect(localInherited.rule).toBe("R3");
    expect(
      localInherited.findings.filter((f) => f.provenance === "inherited" && f.severity === "High")
        .length
    ).toBe(1);

    // The pipeline agrees with the decision function.
    const { report, dispatches, fs } = await runPipeline({
      tspecReviewerErratum: `FSPEC: ${ERRATUM_ITEM}`,
      confirmationByRound: { 2: needsRevision("confirmation-mixed-high.md") },
    });
    expect(report.outcome).toBe("halted");
    expect(report.haltPhase).toBe("T");
    expect(report.postmortemStatus).toBe("written");
    // No follow-up is bought — the budget is still unspent when the halt fires,
    // and the halt does not claim otherwise.
    expect(erratumAuthorDispatches(dispatches).length).toBe(1);
    expect(report.haltReason).not.toContain("The follow-up budget of 1 round was already spent.");
    // BOTH Highs reach the post-mortem author, and so does the Low.
    expect(report.haltReason).toContain(
      "te-review: FINDING: High | delta | local | §3-02 | The owner cell in the expected rows table"
    );
    expect(report.haltReason).toContain(
      "te-review: FINDING: High | inherited | nonlocal | §8.3 | The domain note in section 8.3"
    );
    expect(report.haltReason).toContain(
      "te-review: FINDING: Low | inherited | nonlocal | §7.3 | Two version stamps"
    );
    // Nothing is re-anchored and nothing is re-opened on a halt: R4 hands the
    // whole round to the operator rather than half-resolving it.
    expect(fs.appends).toEqual([]);
    expect(report.notices.filter((n) => n.includes("gate rule R2"))).toEqual([]);
    expect(report.notices.filter((n) => n.includes("gate rule R3"))).toEqual([]);
  });

  test("RT-1c: an untagged non-approving confirmation still halts, exactly as v0.22.7 did", async () => {
    const tagged = await runPipeline({
      tspecReviewerErratum: `FSPEC: ${ERRATUM_ITEM}`,
      confirmationByRound: { 2: needsRevision("confirmation-untagged.md") },
    });

    expect(tagged.report.outcome).toBe("halted");
    expect(tagged.report.haltPhase).toBe("T");
    expect(tagged.report.haltReason).toContain(
      "Phase T halted: the delta confirmation of the FSPEC erratum round did not pass"
    );
    expect(tagged.report.haltReason).toContain("non-approving: [se-review, te-review]");
    // Fail-closed, and it says so rather than pretending to have read findings.
    expect(tagged.report.haltReason).toContain(
      "  se-review: FINDING: High | delta | nonlocal | (untagged confirmation) | non-approving " +
        "confirmation carried no parseable FINDING: line — read as High/delta/nonlocal, fail-closed"
    );
    // No follow-up is bought by silence: the budget is never reached.
    expect(erratumAuthorDispatches(tagged.dispatches).length).toBe(1);
    expect(tagged.fs.appends).toEqual([]);

    // The byte-comparable half: the pre-grammar harness path, same halt.
    const legacy = await runPipeline({
      tspecReviewerErratum: `FSPEC: ${ERRATUM_ITEM}`,
      confirmationVerdict: "Needs revision",
    });
    expect(legacy.report.outcome).toBe(tagged.report.outcome);
    expect(legacy.report.haltPhase).toBe(tagged.report.haltPhase);
    expect(legacy.report.phases.find((p) => p.phase === "T").status).toBe(
      tagged.report.phases.find((p) => p.phase === "T").status
    );
  });
});

// ─── RT-1d: mint-time item hygiene (PLAN §2.4, T3) ────────────────────────────
//
// Four pure-function tests cover items 1, 3, and 4 directly against the
// exported helpers; two pipeline tests cover item 2's wiring into
// `erratumRound` — the structural re-mint path and its fail-open twin.

describe("RT-1d: mint-time item hygiene (PLAN §2.4, T3)", () => {
  test("RT-1d-a: normalized dedupe collapses restatements sharing an anchor+token into one obligation, merging sources", () => {
    // POSTMORTEM-D shape: five raw entries, three distinct obligations —
    // two pairs of restatements (same anchor, same expected token, different
    // wording and source) plus one singleton left untouched.
    const entries = [
      { docType: "TSPEC", item: "§4.2 the retry budget must read **3**, not 5.", source: "se-review" },
      {
        docType: "TSPEC",
        item: "§4.2 the retry budget should be **3** per the SLA table.",
        source: "te-review",
      },
      {
        docType: "TSPEC",
        item: "§7 the owner column type must be `frozenset[str]`, not tuple.",
        source: "se-review",
      },
      {
        docType: "TSPEC",
        item: "§7 owner column should read `frozenset[str]` per TSPEC §10.4.",
        source: "pm-review",
      },
      { docType: "TSPEC", item: "§9 the changelog is missing the 2026-08-01 entry.", source: "se-review" },
    ];

    const deduped = dedupeErrataEntries(entries);

    expect(deduped.map((e) => e.item)).toEqual([
      "§4.2 the retry budget must read **3**, not 5.",
      "§7 the owner column type must be `frozenset[str]`, not tuple.",
      "§9 the changelog is missing the 2026-08-01 entry.",
    ]);
    expect(deduped[0].source).toBe("se-review, te-review");
    expect(deduped[1].source).toBe("se-review, pm-review");
    // Negative, on the same batch: the §9 singleton is untouched by dedupe —
    // one entry in, one entry out, same source, no merge attempted.
    expect(deduped[2].source).toBe("se-review");

    // Negative, on a distinct batch: two items sharing an anchor but NO
    // shared expected token are never collapsed — dedupe is conservative.
    const noSharedToken = dedupeErrataEntries([
      { docType: "TSPEC", item: "§4.2 the retry budget must read **3**.", source: "se-review" },
      { docType: "TSPEC", item: "§4.2 the changelog omits this section entirely.", source: "te-review" },
    ]);
    expect(noSharedToken.length).toBe(2);
  });

  test("RT-1d-d: an item naming two doc types in its own text mints one item per named type, sharing an obligation id", () => {
    const entry = {
      docType: "FSPEC",
      item: "REQ and FSPEC both promise the placeholder expires after 24h — align one location.",
      source: "te-review",
    };

    const split = splitErratumMultiHome(entry);

    expect(split.length).toBe(2);
    expect(split.map((e) => e.docType).sort()).toEqual(["FSPEC", "REQ"]);
    // Both carry the item text verbatim, and the same closure id.
    for (const e of split) {
      expect(e.item).toBe(entry.item);
      expect(e.multiHomeGroup).toBe(split[0].multiHomeGroup);
    }

    // Negative, on the same path: an item naming zero or one doc type in its
    // own text is single-home and returned unchanged — one incidental
    // mention of another doc type's name is not a "targets both" shape.
    const singleHome = splitErratumMultiHome({
      docType: "FSPEC",
      item: "§4's error budget contradicts REQ AC-3.",
      source: "te-review",
    });
    expect(singleHome).toEqual([
      { docType: "FSPEC", item: "§4's error budget contradicts REQ AC-3.", source: "te-review" },
    ]);
  });

  test("RT-1d-e: an oracle-touching item missing contract fields is flagged, not routed; one carrying all three is not", () => {
    // Negative: names an oracle id but supplies none of the three contract
    // fields (property statement, non-subsumption rationale, red witness).
    expect(oracleContractShortfall("AT-07 the oracle asserts non-empty output.")).toEqual([
      "a property statement",
      "a non-subsumption rationale",
      "a per-conjunct red witness",
    ]);

    // Positive, on the same path: an item that touches no oracle at all is
    // not linted — the empty result means "nothing to report," not "passed."
    expect(oracleContractShortfall("§9 the changelog is missing an entry.")).toEqual([]);

    // Positive: an item carrying all three contract fields is conforming.
    expect(
      oracleContractShortfall(
        "AT-07 asserts the property that output is non-empty; this is not subsumed by " +
          "AT-03, since AT-03's witness only covers the empty-input case."
      )
    ).toEqual([]);
  });

  test("RT-1d-b: an item routed against a moved upstream is re-minted structurally — confirmers see only the author's STILL-RAISED subset", async () => {
    const item1 = "§2 the placeholder must expire after 24h";
    const item2 = "§5 the coverage notation must use ranges";
    const { dispatches, report } = await runPipeline({
      tspecReviewerErratum: [
        `REQ: AC-7 names a file that does not exist`,
        `FSPEC: ${item1}`,
        `FSPEC: ${item2}`,
      ],
      erratumRewrites: { [REQ_PATH]: REQ_REWRITTEN, [FSPEC_PATH]: FSPEC_TEXT },
      erratumRemint: {
        [FSPEC_PATH]: `RE-MINT: ABSORBED: ${item1}\nRE-MINT: STILL-RAISED: ${item2}`,
      },
    });

    expect(report.postmortemPath).toBeNull();

    const fspecConfirm = confirmationDispatches(dispatches).find((d) =>
      d.prompt.includes(`DELTA CONFIRMATION for ${FSPEC_PATH}`)
    );
    expect(fspecConfirm).toBeTruthy();
    expect(fspecConfirm.prompt).toContain(`- ${item2}`);
    // Negative, on the same prompt: the ABSORBED item never reaches the
    // confirmer — it was resolved by the author's own re-derivation.
    expect(fspecConfirm.prompt).not.toContain(item1);

    expect(report.notices.join("\n")).toContain(
      "re-minted structurally: 1 item absorbed, 1 still raised."
    );
  });

  test("RT-1d-c: with no RE-MINT lines in the author's response, the original routed list reaches confirmers unchanged (fail-open)", async () => {
    const item1 = "§2 the placeholder must expire after 24h";
    const item2 = "§5 the coverage notation must use ranges";
    const { dispatches, report } = await runPipeline({
      tspecReviewerErratum: [
        `REQ: AC-7 names a file that does not exist`,
        `FSPEC: ${item1}`,
        `FSPEC: ${item2}`,
      ],
      erratumRewrites: { [REQ_PATH]: REQ_REWRITTEN, [FSPEC_PATH]: FSPEC_TEXT },
      // No `erratumRemint` entry for FSPEC_PATH: the author's response
      // carries no RE-MINT lines at all.
    });

    expect(report.postmortemPath).toBeNull();

    const fspecAuthor = erratumAuthorDispatches(dispatches).find((d) =>
      d.prompt.includes(`ERRATUM ROUND for ${FSPEC_PATH}`)
    );
    // The upstream-moved clause still fires on the author dispatch (DEC-ERR-03) …
    expect(fspecAuthor.prompt).toContain(MOVED_ANCHOR);

    const fspecConfirm = confirmationDispatches(dispatches).find((d) =>
      d.prompt.includes(`DELTA CONFIRMATION for ${FSPEC_PATH}`)
    );
    expect(fspecConfirm).toBeTruthy();
    // Positive, on the same prompt: both original items still reach the
    // confirmer, in the original `- {item} (raised by {source})` form.
    expect(fspecConfirm.prompt).toContain(`- ${item1} (raised by te-review)`);
    expect(fspecConfirm.prompt).toContain(`- ${item2} (raised by te-review)`);
    // … but the structural re-mint notice never does — absence of RE-MINT
    // lines falls back to the pre-existing notice-only behaviour, never a
    // hard failure.
    expect(report.notices.join("\n")).not.toContain("re-minted structurally");
  });

  test("RT-1d: routeErrata's admit() applies multi-home split, oracle-contract lint, and dedupe together, before routing", async () => {
    const dupA = "§3 the retry budget must read **5**, not 3.";
    const dupB = "§3 retry budget should be **5** per the SLA table.";
    const multiHome = "REQ and FSPEC both promise the placeholder expires after 24h — align one location.";
    const malformedOracle = "AT-09 the oracle asserts the output is well-formed.";
    const { dispatches, report } = await runPipeline({
      tspecReviewerErratum: [
        `FSPEC: ${dupA}`,
        `FSPEC: ${dupB}`,
        `FSPEC: ${multiHome}`,
        `FSPEC: ${malformedOracle}`,
      ],
    });

    const authored = erratumAuthorDispatches(dispatches);
    const reqAuthor = authored.find((d) => d.prompt.includes(`ERRATUM ROUND for ${REQ_PATH}`));
    const fspecAuthor = authored.find((d) => d.prompt.includes(`ERRATUM ROUND for ${FSPEC_PATH}`));

    // Multi-home: the shared obligation reaches BOTH homes.
    expect(reqAuthor).toBeTruthy();
    expect(reqAuthor.prompt).toContain(`- ${multiHome}`);
    expect(fspecAuthor).toBeTruthy();
    expect(fspecAuthor.prompt).toContain(`- ${multiHome}`);

    // Dedupe: the canonical (first-occurrence) wording survives, the
    // restatement does not.
    expect(fspecAuthor.prompt).toContain(`- ${dupA}`);
    expect(fspecAuthor.prompt).not.toContain(dupB);

    // Oracle lint: the malformed item is never routed to any author …
    expect(reqAuthor.prompt).not.toContain(malformedOracle);
    expect(fspecAuthor.prompt).not.toContain(malformedOracle);
    // … and only two homes were dispatched to, not a third for the dropped
    // item's own (nonexistent) home.
    expect(authored.length).toBe(2);
    // … the drop is reported, not silent.
    expect(report.notices.join("\n")).toContain("malformed erratum, not routed");
    expect(report.notices.join("\n")).toContain("AT-09");
  });
});

// ─── RT-1e: mechanical land-proof for literal-token items (PLAN §2.3, T4) ────
//
// POSTMORTEM-PR's own words for the gap this closes: "the halt was one grep
// away from never having happened, but the grep ran on the wrong party, one
// step too late." A literal-token item names an exact expected string the
// edit must land; these tests exercise the engine-side, pre-confirmation check
// that greps for it BEFORE the confirmers — who are asked a legibility
// question, not run a mechanical proof — are ever dispatched.
describe("RT-1e: mechanical land-proof for literal-token items", () => {
  // Both quoted spans present, `say` and `not` present — the conservative
  // shape §2.3 classifies as literal-token. `erratumTokenOf` (T3, reused here
  // per PLAN §2.3) reads the LAST quoted span as the expected value.
  const LITERAL_ITEM =
    "The type hint should not say `list[str]`; it must say `frozenset[str]`.";
  const EXPECTED_TOKEN = "frozenset[str]";
  // A non-literal item — no quoted spans, no `say`/`not` shape — same one
  // every other test in this file already uses.
  const NON_LITERAL_ITEM = ERRATUM_ITEM;

  test("RT-1e-a/b: token absent after the edit buys ONE bounded re-dispatch naming it; landing on the retry ends the round without a second one", async () => {
    const { report, dispatches } = await runPipeline({
      tspecReviewerErratum: `FSPEC: ${LITERAL_ITEM}`,
      // The erratum author's first edit does not land the expected token …
      erratumRewrites: { [FSPEC_PATH]: "# FSPEC\n\nThe functional specification body, revised.\n" },
      // … but the land-proof retry does.
      erratumLandProofRewrites: {
        [FSPEC_PATH]: "# FSPEC\n\nThe functional specification body uses `frozenset[str]` now.\n",
      },
    });

    // Exactly one land-proof retry dispatch — the FIRST erratum edit, plus
    // the ONE bounded re-dispatch, and no more.
    const authored = erratumAuthorDispatches(dispatches);
    expect(authored.length).toBe(2);
    expect(authored[1].prompt).toContain("LAND-PROOF RETRY");
    expect(authored[1].prompt).toContain(`expected token \`${EXPECTED_TOKEN}\``);

    // Loud notice on the first miss …
    expect(report.notices.join("\n")).toContain("land-proof: 1 literal-token item did not land");
    // … but NOT the second-failure notice: the retry landed it.
    expect(report.notices.join("\n")).not.toContain("STILL did not land");

    // Confirmers still dispatched once, normally — the land-proof is a
    // pre-confirmation gate, not a replacement for confirmation.
    expect(confirmationDispatches(dispatches).length).toBe(2);
    expect(report.outcome).toBe("success");
  });

  test("RT-1e-c: token still absent after the one bounded retry — confirmers still dispatched, loud notice, no engine-side halt", async () => {
    const { report, dispatches } = await runPipeline({
      tspecReviewerErratum: `FSPEC: ${LITERAL_ITEM}`,
      // Neither the first edit nor the retry lands the token.
      erratumRewrites: { [FSPEC_PATH]: "# FSPEC\n\nThe functional specification body, revised.\n" },
      erratumLandProofRewrites: {
        [FSPEC_PATH]: "# FSPEC\n\nThe functional specification body, revised again, still no luck.\n",
      },
    });

    const authored = erratumAuthorDispatches(dispatches);
    // First edit, ONE retry, and no third dispatch — the budget is exactly
    // one bounded re-dispatch, never a loop.
    expect(authored.length).toBe(2);

    expect(report.notices.join("\n")).toContain("land-proof: 1 literal-token item did not land");
    expect(report.notices.join("\n")).toContain(
      "STILL did not land after one bounded re-dispatch"
    );

    // Not masked, not swallowed: confirmers are still dispatched (the land-proof
    // never blocks the round), and the run does not halt on this alone.
    expect(confirmationDispatches(dispatches).length).toBe(2);
    expect(report.outcome).toBe("success");
  });

  test("RT-1e-d: a non-literal-token item triggers no extra reads and no extra dispatches — the land-proof is a no-op on this path", async () => {
    const nonLiteral = await runPipeline({
      tspecReviewerErratum: `FSPEC: ${NON_LITERAL_ITEM}`,
    });

    // Exactly the pre-T4 dispatch shape (PROP-ERR-20/21): one author dispatch,
    // two confirmations, no land-proof retry.
    const authored = erratumAuthorDispatches(nonLiteral.dispatches);
    expect(authored.length).toBe(1);
    expect(confirmationDispatches(nonLiteral.dispatches).length).toBe(2);
    expect(nonLiteral.report.notices.join("\n")).not.toContain("land-proof");

    // Comparative, not an absolute count (the rest of the pipeline already
    // reads the FSPEC through this same seam for unrelated reasons): a run
    // whose FIRST edit already lands the token reads the FSPEC exactly ONE
    // more time than the non-literal run — the land-proof's own check, gated
    // on `literalTokenItems.length > 0` and skipped entirely on this path.
    const literal = await runPipeline({
      tspecReviewerErratum: `FSPEC: ${LITERAL_ITEM}`,
      erratumRewrites: {
        [FSPEC_PATH]: "# FSPEC\n\nThe functional specification body uses `frozenset[str]` now.\n",
      },
    });
    expect(erratumAuthorDispatches(literal.dispatches).length).toBe(1);
    const nonLiteralReads = nonLiteral.fs.reads.filter((r) => r.path === FSPEC_PATH).length;
    const literalReads = literal.fs.reads.filter((r) => r.path === FSPEC_PATH).length;
    expect(literalReads).toBe(nonLiteralReads + 1);
  });
});
