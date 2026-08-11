/**
 * lifetimeRounds.test.js — DEC-ROUNDS-02, the LIFETIME review-round cap.
 *
 * `MAX_REVIEW_ROUNDS` is a per-INVOCATION budget: `deriveRoundWindow` opens the
 * window one past the highest `-v{N}` cross-review on the branch, so a document
 * that keeps being re-opened (staled approval anchor, erratum cascade, forced
 * re-run) accumulates rounds without bound. `MAX_LIFETIME_ROUNDS` is the damping
 * term the operator asked for on 2026-08-10: past that many rounds ON DISK the
 * pipeline accepts the document as-is and moves forward.
 *
 * | Assertion | Subject |
 * |---|---|
 * | boundary | `lifetimeCapReached` — L1, the predicate alone |
 * | (a) | a capped doc type dispatches NOTHING, reports the accepted-as-is row, run proceeds |
 * | (b) | one round below the cap, the loop still opens the last permitted round |
 * | (c) | `forcePhases` overrides the cap |
 * | (d) | an unresolved POSTMORTEM still REFUSES a capped phase (the cap never clears a failure) |
 * | (e) | an erratum round against a capped upstream document dispatches nothing either |
 *
 * The module is imported as a namespace, the convention `forcePhases.test.js`
 * established: a named import of a missing export is a link-time `SyntaxError`
 * that takes the whole file down, which is not a valid red.
 *
 * Phase F (FSPEC) is the subject rather than Phase R because Phase F has a
 * CREATOR as well as reviewers, so "dispatches nothing" is an assertion about
 * both halves of the round and not only about the reviewer fan-out.
 */

import * as devModule from "../orchestrate-dev.js";
import { fakeListFiles } from "./helpers/seams.js";

const main = devModule.default;
const { MAX_LIFETIME_ROUNDS, lifetimeCapReached } = devModule;

const FEATURE = "cap-feat";
const DOCS_DIR = `docs/${FEATURE}`;
const REQ_PATH = `${DOCS_DIR}/REQ-${FEATURE}.md`;
const FSPEC_PATH = `${DOCS_DIR}/FSPEC-${FEATURE}.md`;

const PLAN_PATH = `${DOCS_DIR}/PLAN-${FEATURE}.md`;

const REQ_TEXT = "# REQ\n\nA requirement.\n";
const FSPEC_TEXT = "# FSPEC\n\nA functional spec.\n";

/**
 * A PLAN the mechanical parser reads — Phase P's self-parse gate refuses others,
 * and that halt has nothing to do with the cap. Seeded so a capped run can be
 * asserted to reach the END of the pipeline rather than merely past Phase F.
 */
const PARSEABLE_PLAN = [
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| TASK-01 | First task | 1 | - |",
  "",
  "| Task | Files |",
  "|---|---|",
  "| TASK-01 | `src/one.js` |",
].join("\n");

/**
 * A cross-review that does NOT approve and carries no approval anchor, so §2.5
 * step 4 has nothing to skip on and the phase would otherwise RUN. That is the
 * precondition every cap assertion needs: what stops the phase must be the cap
 * and not a recorded approval.
 */
const NON_APPROVING_REVIEW = [
  "# Cross-review",
  "",
  "## Verdict",
  "",
  "VERDICT: Needs revision",
  '{"high": 1, "medium": 0, "low": 0}',
  "",
].join("\n");

/** The `se-review` + `te-review` pair Phase R and Phase F both dispatch. */
function crossReviewBasenames(docType, round) {
  return [
    `CROSS-REVIEW-software-engineer-${docType}-v${round}.md`,
    `CROSS-REVIEW-test-engineer-${docType}-v${round}.md`,
  ];
}

/** Rounds 1..n for one doc type, as basenames. */
function roundsThrough(docType, n) {
  const out = [];
  for (let round = 1; round <= n; round++) out.push(...crossReviewBasenames(docType, round));
  return out;
}

/** Minimal recording file-system double (TSPEC §8.1 — a sync return resolves). */
function localFakeFs(initial = {}) {
  const contents = { ...initial };
  const writes = [];
  return {
    contents,
    writes,
    readFile: (path) =>
      Object.prototype.hasOwnProperty.call(contents, path) ? contents[path] : null,
    writeFile: (path, text) => {
      writes.push({ path, mode: "write", text });
      contents[path] = text;
      return { ok: true };
    },
    appendFile: (path, text) => {
      writes.push({ path, mode: "append", text });
      contents[path] = (contents[path] ?? "") + text;
      return { ok: true };
    },
  };
}

const REVIEWER_SKILLS = new Set(["se-review", "te-review", "pm-review"]);
const AUTHOR_SKILLS = new Set(["pm-author", "se-author", "te-author"]);

/**
 * A `main()` harness with an always-approving agent double and every seam the
 * gate path needs, recording each dispatch.
 *
 * @param {{listing?: string[], files?: Record<string,string>,
 *          fspecReviewerErratum?: string|null}} [opts]
 */
function makeHarness({ listing = [], files = {}, fspecReviewerErratum = null } = {}) {
  const dispatches = [];
  const fs = localFakeFs({
    [REQ_PATH]: REQ_TEXT,
    [FSPEC_PATH]: FSPEC_TEXT,
    [PLAN_PATH]: PARSEABLE_PLAN,
    ...files,
  });
  const listFiles = fakeListFiles(listing);

  const agent = async (skill, prompt) => {
    const text = typeof prompt === "string" ? prompt : "";
    dispatches.push({ skill, prompt: text });

    if (REVIEWER_SKILLS.has(skill)) {
      // (e)'s injection: a TSPEC-phase reviewer that files an erratum against the
      // FSPEC — the one path that opens a round on a document whose own phase is
      // already behind us.
      const erratum =
        fspecReviewerErratum && skill === "te-review" && text.includes("for phase T ")
          ? `ERRATUM: FSPEC: ${fspecReviewerErratum}\n`
          : "";
      return `Review.\n${erratum}VERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`;
    }
    if (AUTHOR_SKILLS.has(skill)) {
      if (text.includes("DECISIONS_WARRANTED")) return "Finalized.\nDECISIONS_WARRANTED: false";
      if (text.includes("Return a JSON object")) {
        return JSON.stringify({
          tasks: [{ id: "T1", description: "x", dependencies: [], planBatch: 1 }],
        });
      }
      return "Document created.\nREVISION-COMPLETE: yes";
    }
    if (skill === "se-implement") return "Tests: 3 passed, 0 failed.";
    if (skill === "harvest-learnings") return "Harvest complete.";
    if (skill === "dod-verify") return "Clean.\nDOD_STATUS: passed";
    return "Success.";
  };

  return {
    dispatches,
    fs,
    listFiles,
    args: {
      reqPath: REQ_PATH,
      _agent: agent,
      _parallel: (p) => Promise.all(p),
      _checkFile: () => ({ ok: true }),
      _phase: () => {},
      _log: () => {},
      _pipeline: async (label, fn) => fn(),
      _listFiles: listFiles,
      _readFile: fs.readFile,
      _writeFile: fs.writeFile,
      _appendFile: fs.appendFile,
      _recordQueueRow: async () => ({ queueRow: "none" }),
      _mergeWorktree: async () => ({ ok: true }),
      _rebaseOntoDefault: async () => "clean",
      _dodVerifyLoop: async () => ({ passed: true, iterations: 1 }),
      _raisePrAndVerifyCi: async () => ({ prUrl: "https://x/pull/1", ciStatus: "passed" }),
    },
  };
}

/** Every review dispatch belonging to one phase, in order. */
const reviewerDispatchesFor = (dispatches, phaseId) =>
  dispatches.filter(
    (d) => REVIEWER_SKILLS.has(d.skill) && d.prompt.includes(`for phase ${phaseId} `)
  );

/** Every creator dispatch that would (re)write one document. */
const creatorDispatchesFor = (dispatches, docPath) =>
  dispatches.filter((d) => AUTHOR_SKILLS.has(d.skill) && d.prompt.includes(`Create ${docPath}`));

/** Every erratum author / delta-confirmation dispatch for one document. */
const erratumDispatchesFor = (dispatches, docPath) =>
  dispatches.filter(
    (d) =>
      d.prompt.includes(`ERRATUM ROUND for ${docPath}`) ||
      d.prompt.includes(`DELTA CONFIRMATION for ${docPath}`)
  );

// ─── The predicate alone (L1) ────────────────────────────────────────────────

describe("lifetimeCapReached — the boundary", () => {
  test("the cap is reached when the NEXT round would exceed the budget, not when it would reach it", () => {
    expect(typeof MAX_LIFETIME_ROUNDS).toBe("number");
    expect(MAX_LIFETIME_ROUNDS).toBe(15);

    // `startIndex` is the round that WOULD open; `startIndex - 1` is on disk.
    // At MAX_LIFETIME_ROUNDS - 1 rounds on disk the last permitted round opens.
    expect(lifetimeCapReached(MAX_LIFETIME_ROUNDS)).toBe(false);
    // At MAX_LIFETIME_ROUNDS on disk, the next round is one too many.
    expect(lifetimeCapReached(MAX_LIFETIME_ROUNDS + 1)).toBe(true);
    expect(lifetimeCapReached(1)).toBe(false);
    expect(lifetimeCapReached(999)).toBe(true);

    // Total, and fails OPEN: an index it cannot read is not evidence the budget
    // is spent, and the worst case of failing open is one more review round.
    expect(lifetimeCapReached(undefined)).toBe(false);
    expect(lifetimeCapReached(null)).toBe(false);
    expect(lifetimeCapReached("not a number")).toBe(false);
  });
});

// ─── (a) — a capped document is accepted as-is and the run proceeds ──────────

describe("DEC-ROUNDS-02 (a) — the cap accepts the document as-is", () => {
  test("a doc type with the full lifetime budget on disk dispatches no author, no reviewer and no optimizer, reports an accepted-as-is row, and the pipeline moves forward", async () => {
    const listing = roundsThrough("FSPEC", MAX_LIFETIME_ROUNDS);
    const files = Object.fromEntries(
      listing.map((b) => [`${DOCS_DIR}/${b}`, NON_APPROVING_REVIEW])
    );
    const harness = makeHarness({ listing, files });

    const result = await main(harness.args);

    // (i) NOTHING was dispatched for the phase — neither half of the round.
    expect(creatorDispatchesFor(harness.dispatches, FSPEC_PATH)).toEqual([]);
    expect(reviewerDispatchesFor(harness.dispatches, "F")).toEqual([]);
    // And no round-16 cross-review was created by anyone.
    expect(
      Object.keys(harness.fs.contents).filter((p) => p.includes(`FSPEC-v${MAX_LIFETIME_ROUNDS + 1}`))
    ).toEqual([]);

    // (ii) The row says accepted as-is, names the cap and the rounds on disk,
    // and refuses the word "Approved" — an accepted document is NOT an approved
    // one, and a report that blurred the two would be the whole risk of the cap.
    const fPhase = result.phases.find((p) => p.phase === "F");
    expect(fPhase).toBeTruthy();
    expect(fPhase.status).toBe("⏭");
    expect(fPhase.detail).toContain("Accepted as-is");
    expect(fPhase.detail).toContain(String(MAX_LIFETIME_ROUNDS));
    expect(fPhase.detail).toContain("NOT approved");
    expect(fPhase.detail).not.toContain("Approved (");

    // (iii) The loud notice, self-explanatory without the source in hand.
    const notice = result.notices.find((n) => n.includes("LIFETIME REVIEW CAP REACHED"));
    expect(notice).toBeTruthy();
    expect(notice).toContain(FSPEC_PATH);
    expect(notice).toContain(`${MAX_LIFETIME_ROUNDS} review rounds`);
    expect(notice).toContain("ACCEPTED AS-IS");
    expect(notice).toContain("forcePhases");

    // (iv) The cap is not a failure: no POSTMORTEM, and the run PROCEEDS —
    // downstream phases ran and the pipeline reached its normal outcome.
    expect(result.outcome).not.toBe("halted");
    expect(result.haltReason == null || result.haltReason === "").toBe(true);
    expect(Object.keys(harness.fs.contents).filter((p) => p.includes("POSTMORTEM"))).toEqual([]);
    expect(harness.fs.writes.filter((w) => w.path.includes("POSTMORTEM"))).toEqual([]);
    expect(reviewerDispatchesFor(harness.dispatches, "T").length).toBeGreaterThan(0);

    // (v) The FSPEC still counts as an artifact of the run — a capped phase
    // elides the round, not the document.
    expect(result.artifactPaths).toContain(FSPEC_PATH);
  });
});

// ─── (b) — one below the cap, the loop still opens the last permitted round ──

describe("DEC-ROUNDS-02 (b) — the round below the cap is unaffected", () => {
  test("with one round short of the budget on disk, the loop opens the last permitted round normally", async () => {
    const belowCap = MAX_LIFETIME_ROUNDS - 1;
    const listing = roundsThrough("FSPEC", belowCap);
    const files = Object.fromEntries(
      listing.map((b) => [`${DOCS_DIR}/${b}`, NON_APPROVING_REVIEW])
    );
    const harness = makeHarness({ listing, files });

    const result = await main(harness.args);

    const fReviews = reviewerDispatchesFor(harness.dispatches, "F");
    expect(fReviews.length).toBeGreaterThan(0);
    for (const dispatch of fReviews) {
      expect(dispatch.prompt).toContain(`This is iteration ${MAX_LIFETIME_ROUNDS}.`);
      expect(dispatch.prompt).toContain(`-FSPEC-v${MAX_LIFETIME_ROUNDS}.md`);
    }
    expect(creatorDispatchesFor(harness.dispatches, FSPEC_PATH).length).toBeGreaterThan(0);

    const fPhase = result.phases.find((p) => p.phase === "F");
    expect(fPhase.status).toBe("✅");
    expect(fPhase.detail).toContain("Approved");
    expect(result.notices.some((n) => n.includes("LIFETIME REVIEW CAP"))).toBe(false);
  });
});

// ─── (c) — forcePhases overrides the cap ─────────────────────────────────────

describe("DEC-ROUNDS-02 (c) — force overrides the cap", () => {
  test("an operator who names the capped phase gets the round, at the next derived index", async () => {
    const listing = roundsThrough("FSPEC", MAX_LIFETIME_ROUNDS);
    const files = Object.fromEntries(
      listing.map((b) => [`${DOCS_DIR}/${b}`, NON_APPROVING_REVIEW])
    );
    const harness = makeHarness({ listing, files });

    const result = await main({ ...harness.args, forcePhases: "F" });

    const fReviews = reviewerDispatchesFor(harness.dispatches, "F");
    expect(fReviews.length).toBeGreaterThan(0);
    // Force overrides the cap, never the round derivation (RLH-AT-01a's rule).
    for (const dispatch of fReviews) {
      expect(dispatch.prompt).toContain(`This is iteration ${MAX_LIFETIME_ROUNDS + 1}.`);
      expect(dispatch.prompt).toContain(`-FSPEC-v${MAX_LIFETIME_ROUNDS + 1}.md`);
    }

    const fPhase = result.phases.find((p) => p.phase === "F");
    expect(fPhase.status).toBe("✅");
    expect(fPhase.detail).not.toContain("Accepted as-is");
    expect(result.notices.some((n) => n.includes("LIFETIME REVIEW CAP"))).toBe(false);

    // The cap is per-doc-type: forcing F does not un-cap anything else, and the
    // un-forced phases keep their ordinary behaviour.
    expect(reviewerDispatchesFor(harness.dispatches, "T").length).toBeGreaterThan(0);
  });
});

// ─── (d) — the cap never clears a recorded failure ───────────────────────────

describe("DEC-ROUNDS-02 (d) — an unresolved POSTMORTEM still refuses a capped phase", () => {
  test("the cap is evaluated after step G, so a recorded failure still halts rather than being accepted as-is", async () => {
    const listing = roundsThrough("FSPEC", MAX_LIFETIME_ROUNDS);
    const postmortemPath = `${DOCS_DIR}/POSTMORTEM-F-${FEATURE}.md`;
    const files = {
      ...Object.fromEntries(listing.map((b) => [`${DOCS_DIR}/${b}`, NON_APPROVING_REVIEW])),
      [postmortemPath]: "# Postmortem\n\nRESOLVED: no\n\n## Recommendation\n\nRedo the FSPEC.\n",
    };
    const harness = makeHarness({ listing, files });

    const result = await main(harness.args);

    expect(result.outcome).toBe("halted");
    expect(result.postmortemStatus).toBe("unresolved");
    expect(result.postmortemPath).toBe(postmortemPath);
    expect(result.haltReason).toContain("Redo the FSPEC.");

    // The phase is REFUSED, not accepted: the cap must never be able to launder
    // an unresolved failure into "we moved on".
    const fPhase = result.phases.find((p) => p.phase === "F");
    expect(fPhase.status).toBe("❌");
    expect(fPhase.detail).toContain("unresolved POSTMORTEM");
    expect(fPhase.detail).not.toContain("Accepted as-is");
    expect(result.notices.some((n) => n.includes("LIFETIME REVIEW CAP"))).toBe(false);
    expect(reviewerDispatchesFor(harness.dispatches, "F")).toEqual([]);
  });
});

// ─── (e) — the second round-opening path: erratum delta confirmation ─────────

describe("DEC-ROUNDS-02 (e) — an erratum round against a capped document", () => {
  test("a downstream phase's erratum against a capped upstream document dispatches neither the author nor the confirmation", async () => {
    // The FSPEC has spent its lifetime budget; the REQ has not, so Phase R and
    // the rest of the pipeline behave normally. Phase T's reviewer then files an
    // erratum against the FSPEC — a round on a document whose own phase is past.
    const listing = roundsThrough("FSPEC", MAX_LIFETIME_ROUNDS);
    const files = Object.fromEntries(
      listing.map((b) => [`${DOCS_DIR}/${b}`, NON_APPROVING_REVIEW])
    );
    const harness = makeHarness({
      listing,
      files,
      fspecReviewerErratum: "AC-3 contradicts BR-1",
    });

    const result = await main(harness.args);

    // Nothing was dispatched against the capped document — in particular the
    // erratum AUTHOR did not run, so the document was never edited into a state
    // no confirmation round could be opened to approve.
    expect(erratumDispatchesFor(harness.dispatches, FSPEC_PATH)).toEqual([]);
    expect(
      Object.keys(harness.fs.contents).filter((p) => p.includes(`FSPEC-v${MAX_LIFETIME_ROUNDS + 1}`))
    ).toEqual([]);

    // It is reported, naming the item that went unaddressed, and it is not a halt.
    const notice = result.notices.find(
      (n) => n.includes("LIFETIME REVIEW CAP REACHED") && n.includes("erratum round")
    );
    expect(notice).toBeTruthy();
    expect(notice).toContain("AC-3 contradicts BR-1");
    expect(notice).toContain("ACCEPTED AS-IS");
    expect(result.outcome).not.toBe("halted");

    // Phase T's own row does not claim an erratum round it never ran.
    const tPhase = result.phases.find((p) => p.phase === "T");
    expect(tPhase.status).toBe("✅");
    expect(tPhase.detail).not.toContain("erratum rounds");
  });
});
