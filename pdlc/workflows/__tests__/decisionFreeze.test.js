/**
 * decisionFreeze.test.js — DEC-FRZ-01, decision freeze as a first-class loop mode.
 *
 * The practice was imposed by hand in Phase F of `pdlc-consolidation-agent` and
 * measured (target finding class gone, Medium rate down ~75%). This file pins the
 * mechanized version: a pure trigger predicate, and the clause that predicate
 * turns on in the two prompt builders.
 *
 * | Assertion | Subject |
 * |---|---|
 * | trigger table | `freezeInForce` alone — prior approval, round >= 10, neither |
 * | frozen round | reviewer AND optimizer prompts carry the clause verbatim |
 * | unfrozen round | neither carries it, paired with what they DO carry |
 * | late round | round 10 freezes with no approval history at all |
 * | wiring | `main()`'s phase gate hands its own approval read to the loop |
 *
 * Oracle rules (§3.5): every anchor below is a literal transcription — no test
 * imports the clause text it asserts; every negative assertion is paired with a
 * positive one on the same prompt; the trigger table is enumerated, not sampled.
 *
 * The module is imported as a namespace (the `forcePhases.test.js` convention): a
 * named import of a missing export is a link-time `SyntaxError` that takes the
 * whole file down, which is not a valid red.
 */

import * as devModule from "../orchestrate-dev.js";
import { fakeFs, fakeListFiles } from "./helpers/seams.js";

const main = devModule.default;
const { reviewLoop, freezeInForce, FREEZE_LATE_ROUND, approvalHashOf } = devModule;

// ─── Literal anchors — copied by hand, never derived from the module ──────────

const FREEZE_REVIEWER_ANCHOR =
  "DECISION FREEZE is in force for this document. Its content decisions are settled: this round " +
  "exists to catch what the last revision broke, not to decide anything new.";
const FREEZE_BLOCK_ANCHOR =
  "(i) a defect the revision under review introduced — something this delta broke that worked before;";
const FREEZE_CONTRADICTION_ANCHOR =
  "(ii) a factual contradiction with the repository at HEAD or with an upstream document";
const FREEZE_DEFERRED_ANCHOR = "DEFERRED: {one-line item}";
const FREEZE_OPTIMIZER_ANCHOR =
  "DECISION FREEZE is in force for this document. Address the blocking findings and nothing else.";
const FREEZE_OPTIMIZER_DEFERRED_ANCHOR =
  "A line beginning DEFERRED: in a cross-review is recorded, not requested: do NOT act on it";

// Clauses that must be present whether or not the freeze is — the paired
// positives for every "not frozen" assertion below.
const DELTA_PROTOCOL_ANCHOR = "This is a re-review — follow the delta re-review protocol:";
const CONTINUING_AUTHOR_ANCHOR =
  "You are the continuing author of this document, not a fresh reader of it.";

// ─── 1. The predicate alone — the trigger table ───────────────────────────────

describe("freezeInForce — the trigger table", () => {
  test("the late-round threshold is 10", () => {
    expect(typeof FREEZE_LATE_ROUND).toBe("number");
    expect(FREEZE_LATE_ROUND).toBe(10);
  });

  test("trigger 1 — a PRIOR approving round freezes the round that follows it", () => {
    expect(freezeInForce({ priorApprovedRound: 1, nextRound: 2 })).toBe(true);
    expect(freezeInForce({ priorApprovedRound: 3, nextRound: 4 })).toBe(true);
    // "Prior" is load-bearing: an approval AT or AFTER the round about to open is
    // not history this freeze can rest on.
    expect(freezeInForce({ priorApprovedRound: 2, nextRound: 2 })).toBe(false);
    expect(freezeInForce({ priorApprovedRound: 5, nextRound: 3 })).toBe(false);
  });

  test("trigger 2 — round 10 and beyond freeze with NO approval history at all", () => {
    expect(freezeInForce({ priorApprovedRound: null, nextRound: 10 })).toBe(true);
    expect(freezeInForce({ priorApprovedRound: null, nextRound: 11 })).toBe(true);
    expect(freezeInForce({ priorApprovedRound: null, nextRound: 99 })).toBe(true);
    // The boundary below it, on the same axis: round 9 with no approval is not frozen.
    expect(freezeInForce({ priorApprovedRound: null, nextRound: 9 })).toBe(false);
  });

  test("neither trigger — an un-approved document below the late-round threshold is not frozen", () => {
    for (const nextRound of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      expect(freezeInForce({ priorApprovedRound: null, nextRound })).toBe(false);
    }
  });

  test("the two triggers are independent: either one alone suffices, and both together still freeze", () => {
    expect(freezeInForce({ priorApprovedRound: 1, nextRound: 2 })).toBe(true); // approval only
    expect(freezeInForce({ priorApprovedRound: null, nextRound: 12 })).toBe(true); // round only
    expect(freezeInForce({ priorApprovedRound: 9, nextRound: 12 })).toBe(true); // both
  });

  test("total, and fails OPEN — unreadable input never imposes a freeze it cannot justify", () => {
    expect(freezeInForce()).toBe(false);
    expect(freezeInForce({})).toBe(false);
    expect(freezeInForce({ priorApprovedRound: undefined, nextRound: undefined })).toBe(false);
    expect(freezeInForce({ priorApprovedRound: "two", nextRound: "three" })).toBe(false);
    expect(freezeInForce({ priorApprovedRound: 0, nextRound: 3 })).toBe(false);
    expect(freezeInForce({ priorApprovedRound: -1, nextRound: 3 })).toBe(false);
    // Paired positive on the same argument shape: a readable record still freezes.
    expect(freezeInForce({ priorApprovedRound: 1, nextRound: 3 })).toBe(true);
  });
});

// ─── 2. The clause in the prompts, driven through `reviewLoop` ────────────────

const FEATURE = "freeze-feat";
const DOC = `docs/${FEATURE}/TSPEC-${FEATURE}.md`;
const existsGuard = () => ({ ok: true });

const APPROVE = 'Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
const NEEDS_REVISION =
  'Review with issues.\nVERDICT: Needs revision\n{"high": 1, "medium": 0, "low": 0}\n';

/**
 * One review loop over Phase T, opened at `startIndex`, with `priorApprovedRound`
 * as the phase gate would have supplied it. `pm-review` needs revision on its
 * first pass so the optimizer fires exactly once; both approve on the round after.
 */
async function runFreezeLoop({ startIndex, priorApprovedRound }) {
  const prompts = { reviewer: [], optimizer: [] };
  let pmCalls = 0;

  const mockAgent = async (skill, prompt) => {
    const text = String(prompt);
    if (skill === "guard") return existsGuard();
    if (skill === "pm-review") {
      pmCalls += 1;
      prompts.reviewer.push({ skill, call: pmCalls, prompt: text });
      return pmCalls === 1 ? NEEDS_REVISION : APPROVE;
    }
    if (skill === "te-review") {
      prompts.reviewer.push({ skill, call: prompts.reviewer.length + 1, prompt: text });
      return APPROVE;
    }
    if (skill === "se-author") {
      prompts.optimizer.push(text);
      return "Addressed all feedback.\nREVISION-COMPLETE: yes\nDECISIONS_WARRANTED: false";
    }
    return "";
  };

  const result = await reviewLoop({
    doc: DOC,
    phase: "T",
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
    feature: FEATURE,
    iteration: startIndex,
    startIndex,
    priorApprovedRound,
    _agent: mockAgent,
    _parallel: (p) => Promise.all(p),
    _checkFile: existsGuard,
    _log: () => {},
  });

  return { result, prompts };
}

describe("DEC-FRZ-01 — the freeze clause reaches a frozen round's prompts", () => {
  test("a round opened after a prior approval carries the reviewer freeze clause on BOTH reviewers, verbatim", async () => {
    const { prompts } = await runFreezeLoop({ startIndex: 2, priorApprovedRound: 1 });
    const firstRound = prompts.reviewer.filter((p) => p.prompt.includes("This is iteration 2."));
    expect(firstRound.map((p) => p.skill).sort()).toEqual(["pm-review", "te-review"]);
    for (const entry of firstRound) {
      expect(entry.prompt).toContain(FREEZE_REVIEWER_ANCHOR);
      expect(entry.prompt).toContain(FREEZE_BLOCK_ANCHOR);
      expect(entry.prompt).toContain(FREEZE_CONTRADICTION_ANCHOR);
      expect(entry.prompt).toContain(FREEZE_DEFERRED_ANCHOR);
      // The freeze narrows what may block; it does not replace the delta protocol.
      expect(entry.prompt).toContain(DELTA_PROTOCOL_ANCHOR);
    }
  });

  test("the same frozen round's optimizer prompt carries the author-side clause, verbatim", async () => {
    const { prompts, result } = await runFreezeLoop({ startIndex: 2, priorApprovedRound: 1 });
    expect(result.converged).toBe(true);
    expect(prompts.optimizer.length).toBe(1);
    expect(prompts.optimizer[0]).toContain(FREEZE_OPTIMIZER_ANCHOR);
    expect(prompts.optimizer[0]).toContain(FREEZE_OPTIMIZER_DEFERRED_ANCHOR);
    expect(prompts.optimizer[0]).toContain(CONTINUING_AUTHOR_ANCHOR);
  });

  test("an UNFROZEN round of the same phase carries neither clause — and still carries the clauses it always did", async () => {
    const { prompts } = await runFreezeLoop({ startIndex: 2, priorApprovedRound: null });
    for (const entry of prompts.reviewer) {
      // Negative …
      expect(entry.prompt).not.toContain(FREEZE_REVIEWER_ANCHOR);
      expect(entry.prompt).not.toContain(FREEZE_DEFERRED_ANCHOR);
      // … paired with the positive on the same prompt.
      expect(entry.prompt).toContain(DELTA_PROTOCOL_ANCHOR);
    }
    expect(prompts.optimizer.length).toBe(1);
    expect(prompts.optimizer[0]).not.toContain(FREEZE_OPTIMIZER_ANCHOR);
    expect(prompts.optimizer[0]).not.toContain(FREEZE_OPTIMIZER_DEFERRED_ANCHOR);
    expect(prompts.optimizer[0]).toContain(CONTINUING_AUTHOR_ANCHOR);
  });

  test("the late-round trigger reaches the prompts too: round 10 freezes with no approval history", async () => {
    const { prompts } = await runFreezeLoop({ startIndex: 10, priorApprovedRound: null });
    expect(prompts.reviewer.length).toBeGreaterThan(0);
    for (const entry of prompts.reviewer.filter((p) => p.prompt.includes("This is iteration 10."))) {
      expect(entry.prompt).toContain(FREEZE_REVIEWER_ANCHOR);
    }
    expect(prompts.optimizer[0]).toContain(FREEZE_OPTIMIZER_ANCHOR);
  });

  test("round 9 with no approval history is the paired negative — and the SAME loop's round 10 is frozen", async () => {
    const { prompts } = await runFreezeLoop({ startIndex: 9, priorApprovedRound: null });
    const round9 = prompts.reviewer.filter((p) => p.prompt.includes("This is iteration 9."));
    const round10 = prompts.reviewer.filter((p) => p.prompt.includes("This is iteration 10."));
    expect(round9.length).toBeGreaterThan(0);
    expect(round10.length).toBeGreaterThan(0);
    // Negative on round 9 …
    for (const entry of round9) expect(entry.prompt).not.toContain(FREEZE_REVIEWER_ANCHOR);
    // … positive one round later, in the same loop, on the same document: the
    // threshold is the round index and nothing else.
    for (const entry of round10) expect(entry.prompt).toContain(FREEZE_REVIEWER_ANCHOR);
    // The optimizer of round 9 (the only optimizer this loop dispatches) is unfrozen.
    expect(prompts.optimizer.length).toBe(1);
    expect(prompts.optimizer[0]).not.toContain(FREEZE_OPTIMIZER_ANCHOR);
    expect(prompts.optimizer[0]).toContain(CONTINUING_AUTHOR_ANCHOR);
  });
});

// ─── 3. The wiring — `main()`'s phase gate supplies the trigger ───────────────

const W_FEATURE = "freeze-wire";
const W_DOCS = `docs/${W_FEATURE}`;
const W_REQ = `${W_DOCS}/REQ-${W_FEATURE}.md`;
const W_FSPEC = `${W_DOCS}/FSPEC-${W_FEATURE}.md`;
const W_PLAN = `${W_DOCS}/PLAN-${W_FEATURE}.md`;

const FSPEC_TEXT = "# FSPEC\n\nThe functional specification body, as it stands today.\n";
/** The bytes the round-1 approval was anchored to — deliberately NOT the above. */
const FSPEC_APPROVED_TEXT = "# FSPEC\n\nAn older functional specification body.\n";

const PARSEABLE_PLAN = [
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| TASK-01 | First task | 1 | - |",
  "",
  "| Task | Files |",
  "|---|---|",
  "| TASK-01 | `src/one.js` |",
].join("\n");

function crossReview({ verdict = "Approved", high = 0, anchorHash = null } = {}) {
  const body = [
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
  return anchorHash
    ? `${body}\nAPPROVAL-HASH: ${anchorHash}\nREVIEWED-COMMIT: 0123456789abcdef0123456789abcdef01234567\n`
    : body;
}

const REVIEWER_SKILLS = new Set(["se-review", "te-review", "pm-review"]);
const AUTHOR_SKILLS = new Set(["pm-author", "se-author", "te-author"]);

/** A `main()` run whose Phase F opens round 2 over the seeded round-1 record. */
async function runWiring(roundOneFiles) {
  const dispatches = [];
  const fs = fakeFs({
    [W_REQ]: "# REQ\n\nThe requirement body.\n",
    [W_FSPEC]: FSPEC_TEXT,
    [W_PLAN]: PARSEABLE_PLAN,
    ...roundOneFiles,
  });

  const agent = async (skill, prompt) => {
    const text = typeof prompt === "string" ? prompt : "";
    dispatches.push({ skill, prompt: text });
    if (REVIEWER_SKILLS.has(skill)) return APPROVE;
    if (AUTHOR_SKILLS.has(skill)) {
      if (text.includes("DECISIONS_WARRANTED")) return "Finalized.\nDECISIONS_WARRANTED: false";
      if (text.includes("Return a JSON object")) {
        return JSON.stringify({
          tasks: [{ id: "TASK-01", description: "First task", dependencies: [], planBatch: 1 }],
        });
      }
      return "Document created.\nREVISION-COMPLETE: yes";
    }
    if (skill === "se-implement") return "Tests: 3 passed, 0 failed.";
    if (skill === "harvest-learnings") return "Harvest complete.";
    if (skill === "dod-verify") return "Clean.\nDOD_STATUS: passed";
    return "Success.";
  };

  const listFiles = fakeListFiles((dirPath) =>
    Object.keys(fs.files)
      .filter((p) => p.startsWith(`${dirPath}/`) && !p.slice(dirPath.length + 1).includes("/"))
      .map((p) => p.slice(dirPath.length + 1))
  );

  await main({
    reqPath: W_REQ,
    _agent: agent,
    _parallel: (p) => Promise.all(p),
    _phase: () => {},
    _log: () => {},
    _pipeline: async (label, fn) => fn(),
    _listFiles: listFiles,
    ...fs.injections(),
    _checkFile: () => ({ ok: true }),
    _recordQueueRow: async () => ({ queueRow: "none" }),
    _mergeWorktree: async () => ({ ok: true }),
    _rebaseOntoDefault: async () => "clean",
    _dodVerifyLoop: async () => ({ passed: true, iterations: 1 }),
    _raisePrAndVerifyCi: async () => ({ prUrl: "https://x/pull/1", ciStatus: "passed" }),
  });

  return dispatches.filter(
    (d) => REVIEWER_SKILLS.has(d.skill) && d.prompt.includes("for phase F of feature")
  );
}

describe("DEC-FRZ-01 — the phase gate's approval read is what turns the freeze on", () => {
  test("a round-1 approval that has since STALED freezes round 2's reviewers", async () => {
    const staleAnchor = approvalHashOf(FSPEC_APPROVED_TEXT);
    const reviews = await runWiring({
      [`${W_DOCS}/CROSS-REVIEW-software-engineer-FSPEC-v1.md`]: crossReview({
        anchorHash: staleAnchor,
      }),
      [`${W_DOCS}/CROSS-REVIEW-test-engineer-FSPEC-v1.md`]: crossReview({ anchorHash: staleAnchor }),
    });

    // The phase RAN (the approval staled), and it ran frozen.
    expect(reviews.length).toBeGreaterThan(0);
    for (const d of reviews) {
      expect(d.prompt).toContain("This is iteration 2.");
      expect(d.prompt).toContain(FREEZE_REVIEWER_ANCHOR);
    }
  });

  test("a round-1 record that never approved leaves round 2 UNFROZEN — the paired negative", async () => {
    const reviews = await runWiring({
      [`${W_DOCS}/CROSS-REVIEW-software-engineer-FSPEC-v1.md`]: crossReview({
        verdict: "Needs revision",
        high: 1,
      }),
      [`${W_DOCS}/CROSS-REVIEW-test-engineer-FSPEC-v1.md`]: crossReview({
        verdict: "Needs revision",
        high: 1,
      }),
    });

    expect(reviews.length).toBeGreaterThan(0);
    for (const d of reviews) {
      // Same round index, same phase, same document — only the approval record differs.
      expect(d.prompt).toContain("This is iteration 2.");
      expect(d.prompt).not.toContain(FREEZE_REVIEWER_ANCHOR);
      expect(d.prompt).toContain(DELTA_PROTOCOL_ANCHOR);
    }
  });
});
