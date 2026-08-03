/**
 * groundingPrompts.test.js — PROPOSAL-orchestrate-dev-optimization §3.4 grounding
 * manifests and §3.5 oracle-quality clauses.
 *
 * ## What is under test
 *
 * - Every `PHASE_DISPATCH` entry with a review loop (R, F, T, D, P, PR, CR) carries
 *   a non-empty `grounding` array; DOD carries none. Asserted by SET-EQUALITY over
 *   `Object.keys(PHASE_DISPATCH)`, not containment, so a dropped manifest reds.
 * - `groundingClause`'s rendered text reaches the creator prompt (driven through
 *   `main()`, per SESSION-04's pattern, since the creator dispatch lives in
 *   `main()`'s non-exported `wrappedDispatch`), the reviewer prompt at iteration 1
 *   AND iteration 2, and the optimizer prompt (all driven through `reviewLoop`,
 *   per reviewLoop.test.js's pattern).
 * - The three standing oracle-quality clauses (§3.5) are present in the reviewer
 *   prompt at both iterations, and are NOT present in the optimizer prompt — paired
 *   with a positive assertion of what the optimizer prompt does carry instead.
 * - Phase T's optimizer prompt keeps the `DECISIONS_WARRANTED` trailer requirement
 *   as the LAST segment of the prompt, unchanged by the grounding clause's addition.
 *
 * ## Oracle-quality rules this file itself obeys (PROPOSAL §3.5)
 *
 * - **No implementation echoes.** Every anchor string asserted below is a LITERAL
 *   copied into this file, never imported from `orchestrate-dev.js`. Only
 *   `PHASE_DISPATCH` itself (the manifest data, not prompt text) is imported, for
 *   the completeness check, where the whole point is to read the module's own
 *   declared state.
 * - **No absence-only oracles.** The optimizer's missing oracle-quality clause is
 *   paired with a positive assertion of the continuing-author clause it does carry.
 *   Iteration 1's missing delta-review protocol is not asserted here (out of scope);
 *   iteration 1's PRESENT grounding/oracle clauses are asserted directly.
 * - **Completeness by set-equality.** The grounding-bearing phase set is asserted
 *   with `toEqual` against a literal sorted array, not `arrayContaining`.
 */

import main, { reviewLoop, PHASE_DISPATCH } from "../orchestrate-dev.js";
import { fakeFs, fakeListFiles, fakeGit, recordingRecordQueueRow } from "./helpers/seams.js";

// ─── Literal anchors — copied by hand, never derived from the module ──────────

const FILE_LINE_ANCHOR = "cite file:line for every claim you make about existing behavior";
const GROUND_IN_CODE_ANCHOR = "Ground every claim in code, not only in documents";

const PHASE_ENTRY_ANCHORS = {
  R: "confirm it exists and matches the described behavior",
  F: "confirm it exists and behaves as described",
  T: "confirm each one exists in the repo",
  D: "verify against the actual files it would touch",
  P: "confirm it exists, or that the task explicitly declares it new",
  PR: "confirm it exists or is explicitly planned as new",
  CR: "every finding must cite the actual changed lines",
};

const ORACLE_ECHO_ANCHOR =
  "an expectation must never import or derive its expected value from the code under test";
const ORACLE_ABSENCE_ANCHOR =
  "every negative assertion (X does not happen) must be paired with a positive assertion on the same path";
const ORACLE_SET_EQUALITY_ANCHOR =
  "enumerated contracts (row tables, catalogues) need a set-equality check over the full enumeration";

const DECISIONS_WARRANTED_ANCHOR = "DECISIONS_WARRANTED: true";
const CONTINUING_AUTHOR_ANCHOR = "You are the continuing author of this document, not a fresh reader of it.";

// ─── PROP-GROUND-01: completeness by set-equality over PHASE_DISPATCH ─────────

describe("PROP-GROUND-01: grounding manifests cover exactly the review-loop phases", () => {
  test("R, F, T, D, P, PR, CR carry a non-empty grounding array; DOD carries none", () => {
    const grounded = Object.keys(PHASE_DISPATCH)
      .filter((k) => Array.isArray(PHASE_DISPATCH[k].grounding) && PHASE_DISPATCH[k].grounding.length > 0)
      .sort();
    expect(grounded).toEqual(["CR", "D", "F", "P", "PR", "R", "T"].sort());
    expect(PHASE_DISPATCH.DOD.grounding).toBeUndefined();
  });

  test("every grounding entry is a non-empty string, 1-3 entries per phase", () => {
    for (const key of ["R", "F", "T", "D", "P", "PR", "CR"]) {
      const entries = PHASE_DISPATCH[key].grounding;
      expect(entries.length).toBeGreaterThanOrEqual(1);
      expect(entries.length).toBeLessThanOrEqual(3);
      for (const entry of entries) {
        expect(typeof entry).toBe("string");
        expect(entry.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

// ─── Fixture vocabulary for the reviewLoop-driven prompts (Phase T) ───────────

const T_FEATURE = "ground-t-feat";
const T_DOC = `docs/${T_FEATURE}/TSPEC-${T_FEATURE}.md`;
const existsGuard = () => ({ ok: true });

function approveResponse() {
  return `Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`;
}
function needsRevisionResponse() {
  return `Review with issues.\nVERDICT: Needs revision\n{"high": 1, "medium": 0, "low": 0}\n`;
}
function optimizerResponse() {
  return "Addressed all feedback.\nDECISIONS_WARRANTED: false";
}

/**
 * Drives `reviewLoop` for Phase T through exactly one optimizer round: pm-review
 * needs revision on iteration 1 (te-review approves throughout), so the optimizer
 * fires once, then both reviewers approve on iteration 2. Captures every prompt by
 * skill and iteration.
 */
async function runTGroundLoop() {
  const prompts = { reviewer: [], optimizer: [] };
  let pmCalls = 0;

  const mockAgent = async (skill, prompt) => {
    if (skill === "guard") return existsGuard();
    if (skill === "pm-review") {
      pmCalls += 1;
      prompts.reviewer.push({ skill, iteration: pmCalls, prompt: String(prompt) });
      return pmCalls === 1 ? needsRevisionResponse() : approveResponse();
    }
    if (skill === "te-review") {
      prompts.reviewer.push({ skill, prompt: String(prompt) });
      return approveResponse();
    }
    if (skill === "se-author") {
      prompts.optimizer.push(String(prompt));
      return optimizerResponse();
    }
    return "";
  };

  const result = await reviewLoop({
    doc: T_DOC,
    phase: "T",
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
    feature: T_FEATURE,
    _agent: mockAgent,
    _parallel: (p) => Promise.all(p),
    _checkFile: existsGuard,
  });

  return { result, prompts };
}

// ─── PROP-GROUND-02: grounding clause reaches the reviewer prompt ─────────────

describe("PROP-GROUND-02: the grounding clause reaches every reviewer round", () => {
  test("iteration 1 (full first-pass review) carries the file:line demand and Phase T's entries", async () => {
    const { prompts } = await runTGroundLoop();
    const iter1 = prompts.reviewer.find((p) => p.skill === "pm-review" && p.iteration === 1);
    expect(iter1).toBeDefined();
    expect(iter1.prompt).toContain(GROUND_IN_CODE_ANCHOR);
    expect(iter1.prompt).toContain(FILE_LINE_ANCHOR);
    expect(iter1.prompt).toContain(PHASE_ENTRY_ANCHORS.T);
  });

  test("iteration 2 (delta re-review) carries the file:line demand and Phase T's entries", async () => {
    const { prompts } = await runTGroundLoop();
    const iter2 = prompts.reviewer.find((p) => p.skill === "pm-review" && p.iteration === 2);
    expect(iter2).toBeDefined();
    expect(iter2.prompt).toContain(GROUND_IN_CODE_ANCHOR);
    expect(iter2.prompt).toContain(FILE_LINE_ANCHOR);
    expect(iter2.prompt).toContain(PHASE_ENTRY_ANCHORS.T);
  });
});

// ─── PROP-GROUND-03: grounding clause reaches the optimizer prompt, and Phase T's
//     DECISIONS_WARRANTED trailer requirement stays last ─────────────────────

describe("PROP-GROUND-03: the grounding clause reaches the optimizer prompt", () => {
  test("the optimizer prompt carries the file:line demand and Phase T's entries", async () => {
    const { prompts, result } = await runTGroundLoop();
    expect(result.converged).toBe(true);
    expect(prompts.optimizer.length).toBe(1);
    const optPrompt = prompts.optimizer[0];
    expect(optPrompt).toContain(GROUND_IN_CODE_ANCHOR);
    expect(optPrompt).toContain(FILE_LINE_ANCHOR);
    expect(optPrompt).toContain(PHASE_ENTRY_ANCHORS.T);
  });

  test("Phase T's DECISIONS_WARRANTED trailer requirement is still the FINAL segment of the optimizer prompt", async () => {
    const { prompts } = await runTGroundLoop();
    const optPrompt = prompts.optimizer[0];
    const trailerIndex = optPrompt.indexOf(DECISIONS_WARRANTED_ANCHOR);
    expect(trailerIndex).toBeGreaterThan(-1);
    // Nothing else appears after the trailer requirement's own text — the trailer
    // instruction is the tail of the whole prompt.
    const tail = optPrompt.slice(trailerIndex);
    expect(optPrompt.endsWith(tail.split("\n").slice(-1)[0])).toBe(true);
    expect(trailerIndex).toBeGreaterThan(optPrompt.indexOf(GROUND_IN_CODE_ANCHOR));
    expect(trailerIndex).toBeGreaterThan(optPrompt.indexOf(CONTINUING_AUTHOR_ANCHOR));
  });
});

// ─── PROP-GROUND-04: oracle-quality clauses in reviewer prompts, absent from the
//     optimizer prompt (paired with what the optimizer prompt DOES carry) ─────

describe("PROP-GROUND-04: oracle-quality clauses are standing reviewer-prompt clauses", () => {
  test("all three oracle-quality anchors are present at iteration 1 and iteration 2", async () => {
    const { prompts } = await runTGroundLoop();
    const iter1 = prompts.reviewer.find((p) => p.skill === "pm-review" && p.iteration === 1).prompt;
    const iter2 = prompts.reviewer.find((p) => p.skill === "pm-review" && p.iteration === 2).prompt;
    for (const anchor of [ORACLE_ECHO_ANCHOR, ORACLE_ABSENCE_ANCHOR, ORACLE_SET_EQUALITY_ANCHOR]) {
      expect(iter1).toContain(anchor);
      expect(iter2).toContain(anchor);
    }
  });

  test("none of the three oracle-quality anchors reach the optimizer prompt, which instead carries the continuing-author clause", async () => {
    const { prompts } = await runTGroundLoop();
    const optPrompt = prompts.optimizer[0];
    for (const anchor of [ORACLE_ECHO_ANCHOR, ORACLE_ABSENCE_ANCHOR, ORACLE_SET_EQUALITY_ANCHOR]) {
      expect(optPrompt).not.toContain(anchor);
    }
    // Positive conjunct: the optimizer prompt is not simply empty of clauses — it
    // carries M-2's continuing-author framing instead.
    expect(optPrompt).toContain(CONTINUING_AUTHOR_ANCHOR);
  });
});

// ─── PROP-GROUND-05: the grounding clause reaches the creator prompt ──────────
//
// Driven through `main()`, exactly as SESSION-04 in sessionAgent.test.js does,
// because the creator dispatch lives in `main()`'s non-exported `wrappedDispatch`.

const MAIN_FEATURE = "ground-main-feat";
const MAIN_DOCS = `docs/${MAIN_FEATURE}`;
const MAIN_REQ = `${MAIN_DOCS}/REQ-${MAIN_FEATURE}.md`;

const REQUIRED_HEADINGS = Object.freeze({
  REQ: ["Problem / Context", "Goals", "Non-Goals", "Constraints", "Acceptance Criteria", "Risks", "Obligations"],
});

function completeReq() {
  const parts = [`# ${MAIN_FEATURE}`, ""];
  for (const heading of REQUIRED_HEADINGS.REQ) {
    parts.push(`## ${heading}`, "", `Substantive prose for ${heading}.`, "");
  }
  return parts.join("\n");
}

function crossReviewDoc(verdict, high) {
  return [
    "# Cross-review",
    "",
    "## Findings",
    "",
    "Some findings.",
    "",
    "## Verdict",
    "",
    `VERDICT: ${verdict}`,
    `{"high": ${high}, "medium": 0, "low": 0}`,
    "",
  ].join("\n");
}

function basenamesIn(files, dirPath) {
  const prefix = `${String(dirPath).replace(/\/+$/, "")}/`;
  return Object.keys(files)
    .filter((p) => p.startsWith(prefix) && !p.slice(prefix.length).includes("/"))
    .map((p) => p.slice(prefix.length))
    .sort();
}

describe("PROP-GROUND-05: the grounding clause reaches the creator prompt (Phase F)", () => {
  test("the pm-author creator dispatch for FSPEC carries the file:line demand and Phase F's entries", async () => {
    const fs = fakeFs({ [MAIN_REQ]: completeReq() });
    const listFiles = fakeListFiles((dirPath) => basenamesIn(fs.files, dirPath));
    const git = fakeGit((argv) =>
      argv.join(" ") === "rev-parse --abbrev-ref HEAD"
        ? { ok: true, stdout: `feat-${MAIN_FEATURE}\n` }
        : { ok: true }
    );

    const creatorPrompts = [];
    let reqRound = 0;

    const innerAgent = async (skill, prompt) => {
      const text = String(prompt ?? "");
      if (skill === "se-review" || skill === "te-review") {
        reqRound += 1;
        const role = skill === "se-review" ? "software-engineer" : "test-engineer";
        fs.writeFile(`${MAIN_DOCS}/CROSS-REVIEW-${role}-REQ-v${reqRound}.md`, crossReviewDoc("Approved", 0));
        return `Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`;
      }
      if (skill === "pm-author") {
        // Phase R's optimizer never fires (both reviewers approve iteration 1);
        // this is therefore the Phase F CREATOR dispatch.
        creatorPrompts.push(text);
        // No further writes needed — Phase T's creator returning "" halts next.
        return "";
      }
      return "";
    };

    await main({
      reqPath: MAIN_REQ,
      _agent: innerAgent,
      _parallel: (p) => Promise.all(p),
      _pipeline: async (label, fn) => fn(),
      _phase: () => {},
      _log: () => {},
      _listFiles: listFiles,
      _git: git,
      _recordQueueRow: recordingRecordQueueRow({ queueRow: "recorded" }),
      ...fs.injections(),
      _phaseDodEnabled: false,
      _phasePubEnabled: false,
      _now: () => 0,
      _sleep: async () => {},
    });

    expect(creatorPrompts.length).toBeGreaterThanOrEqual(1);
    const fspecCreatorPrompt = creatorPrompts.find((p) => p.includes(`FSPEC-${MAIN_FEATURE}.md`));
    expect(fspecCreatorPrompt).toBeDefined();
    expect(fspecCreatorPrompt).toContain(GROUND_IN_CODE_ANCHOR);
    expect(fspecCreatorPrompt).toContain(FILE_LINE_ANCHOR);
    expect(fspecCreatorPrompt).toContain(PHASE_ENTRY_ANCHORS.F);
  });
});
