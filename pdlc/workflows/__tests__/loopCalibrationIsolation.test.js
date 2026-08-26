// loopCalibrationIsolation.test.js — PLAN P6-01 (batch 9, RED-terminal; closed at P6-02, batch 10).
//
// Owns AT-20 (FSPEC E-09, TSPEC "Calibration isolation"): `parseEscalations`' whole output — the
// per-seam counts (`bySeamFeature`, `totals`, `distinctFeatures`), `entryCount`, `corpusState`,
// the `state.reasons` codes it drives, and the derived `{over, tie, under}` candidate ranking
// (`seamCandidates`) — is identical over a log with non-advisory (`| Source |`) and decision
// blocks present versus the same log with those blocks removed. Every fixture block is built
// through the shipped renderers (`renderEscalationEntry`, `renderDecisionEntry`,
// `orchestrate-dev.js`) rather than hand-typed markdown, so a rendering-format change cannot make
// this file's fixtures diverge from what the pipeline actually appends.
//
// Non-vacuity (TSPEC "Test Strategy" item 4): a *populated* log — real advisory entries plus
// junk — already agrees on every field at HEAD, junk included, because `parseEscalations` skips
// any block missing a `| Feature |` or `| Seam |` row (never adds to `bySeamFeature` / `totals` /
// `distinctFeatures` / `entryCount`). A totals-only oracle over that fixture alone would never
// distinguish HEAD's implementation from the mutant "corpusState is computed from the raw
// `^## ` block count, not from counted entries" (TSPEC Mutation sensitivity (b)) — both variants
// already have `blocks.length > 0`, so `corpusState` reads `"present"` either way and the mutant
// hides. This file therefore ALSO fixtures a *quiet-corpus* pair — a log holding ONLY junk (no
// block that matches Feature+Seam) versus the same log with the junk removed (i.e. empty). There,
// `entryCount`/`totals` (the "naive" slice) trivially agree — both are the zero value — while
// `corpusState` disagrees at HEAD (`"present"` for the junk-only log, `"empty"` for the removed
// one), and that disagreement propagates into `state.reasons`. That disagreement is exactly the
// conjunct a totals-only oracle would have missed, and it is why this test was originally
// committed RED-terminal. P6-02 has since landed (`corpusState` now derives from the counted
// entries rather than the raw block split — `consolidate-learnings.js:2010`), so the test runs
// live and now guards that derivation against regression.
//
// The populated-pair assertions below were never part of that RED — they held at HEAD already
// (no implementation change made them true) and have always run as a live regression guard.

import { parseEscalations, seamCandidates } from "../consolidate-learnings.js";
import * as devModule from "../orchestrate-dev.js";
import { LOOP_SOURCES } from "../lib/loop-session.mjs";

const FIXED_NOW_MS = Date.parse("2026-01-01T00:00:00.000Z");

function advisoryBlock(feature, seam, now = FIXED_NOW_MS) {
  const disposition = {
    reason: "out-of-envelope",
    verdict: {
      diagnosis: "the lint failure also fails on the default branch",
      proposedAction: "nothing",
      evidence: [".github/workflows/pr-tests.yml:31"],
    },
  };
  const ctx = {
    feature,
    seam,
    phase: "PUB",
    phaseOutcome: "halted",
    decision: "whether this escalation needs operator action",
  };
  return devModule.renderEscalationEntry(disposition, ctx, { now });
}

function nonAdvisoryBlock(feature, source, now = FIXED_NOW_MS) {
  const disposition = {
    reason: "budget-exhausted",
    verdict: {
      diagnosis: "the merge could not be fast-forwarded onto the target branch",
      proposedAction: "rebase and retry",
      evidence: ["docs/_queue/QUEUE.md:1"],
    },
  };
  const ctx = {
    feature,
    source,
    phase: "MERGE",
    phaseOutcome: "refused",
    decision: "whether the merge refusal needs operator action",
  };
  return devModule.renderEscalationEntry(disposition, ctx, { now });
}

function decisionBlock(feature, now = FIXED_NOW_MS) {
  return devModule.renderDecisionEntry(
    {
      feature,
      decision: "keep the escalation open",
      decidedBy: "operator",
      decidesId: "esc-1",
      decidedAt: new Date(now).toISOString(),
      rationale: "documented rationale, not read by parseEscalations",
    },
    { now },
  );
}

// Mirrors `consolidate-learnings.js`'s `runConsolidationPass` Step 10 exactly (the two
// corpus-state reason codes are driven ONLY by `corpusState`, nothing else) — a pure re-derivation
// so this file never imports the whole pass just to exercise this one predicate.
function deriveReasons(escalations) {
  const reasons = new Set();
  if (escalations.corpusState === "absent") reasons.add("no-advisory-corpus");
  else if (escalations.corpusState === "empty") reasons.add("advisory-corpus-empty");
  return reasons;
}

// ---------------------------------------------------------------------------
// AT-20 — populated log: real advisory entries interleaved with non-advisory and decision
// blocks. `A2` gets three entries across two features (over-escalating winner); `A6` gets one
// (present but under the `over` bar); the remaining ADVISORY_SEAMS members never fire (under).
// True at HEAD already — junk blocks never match Feature+Seam so they can never perturb a count.
// ---------------------------------------------------------------------------
describe("AT-20 — populated log: calibration is identical with and without non-advisory/decision blocks", () => {
  const cleanBlocks = [
    advisoryBlock("feature-a", "A2"),
    advisoryBlock("feature-b", "A2"),
    advisoryBlock("feature-a", "A2"),
    advisoryBlock("feature-c", "A6"),
  ];
  const cleanText = cleanBlocks.join("\n");
  const mixedText = [
    nonAdvisoryBlock("feature-x", LOOP_SOURCES[0]),
    decisionBlock("feature-a"),
    cleanBlocks[0],
    cleanBlocks[1],
    decisionBlock("feature-b"),
    cleanBlocks[2],
    nonAdvisoryBlock("feature-y", LOOP_SOURCES[LOOP_SOURCES.length - 1]),
    cleanBlocks[3],
    decisionBlock("feature-c"),
  ].join("\n");

  test("the mixed log actually contains more raw blocks than the clean one (fixture is non-vacuous)", () => {
    const rawBlockCount = (text) => (text.match(/^## /gm) || []).length;
    expect(rawBlockCount(mixedText)).toBeGreaterThan(rawBlockCount(cleanText));
    expect(mixedText).not.toBe(cleanText);
  });

  test("bySeamFeature, totals, distinctFeatures and entryCount are identical", () => {
    const clean = parseEscalations(cleanText);
    const mixed = parseEscalations(mixedText);

    expect(mixed.entryCount).toBe(clean.entryCount);
    expect(mixed.entryCount).toBe(4);
    expect(mixed.totals).toEqual(clean.totals);
    expect(mixed.distinctFeatures).toEqual(clean.distinctFeatures);
    expect(mixed.bySeamFeature).toEqual(clean.bySeamFeature);
  });

  test("corpusState and the derived state.reasons are identical", () => {
    const clean = parseEscalations(cleanText);
    const mixed = parseEscalations(mixedText);

    expect(mixed.corpusState).toBe(clean.corpusState);
    expect(mixed.corpusState).toBe("present");
    expect(deriveReasons(mixed)).toEqual(deriveReasons(clean));
    expect(deriveReasons(mixed)).toEqual(new Set());
  });

  test("the derived {over, tie, under} candidate ranking is identical", () => {
    const clean = seamCandidates(parseEscalations(cleanText));
    const mixed = seamCandidates(parseEscalations(mixedText));

    expect(mixed).toEqual(clean);
    expect(mixed.over).toBe("A2");
    expect(mixed.tie).toEqual([]);
    expect(mixed.under.sort()).toEqual(["A1", "A3", "A4", "A5"]);
  });
});

// ---------------------------------------------------------------------------
// AT-20 — quiet-corpus trap: a log holding ONLY non-advisory/decision blocks (no block matches
// Feature+Seam) versus the same log with those blocks removed (i.e. empty). This is the pair that
// makes AT-20 non-vacuous (TSPEC "Test Strategy" item 4, Mutation sensitivity (b)): entryCount and
// totals — the "naive" slice — already agree (both are the zero value) at HEAD, so a totals-only
// oracle would report no difference here. `corpusState` disagrees at HEAD, because it is derived
// from the raw `^## ` block count rather than from counted entries: the junk-only log has
// `blocks.length > 0` and reads `"present"`; the removed-junk log has `blocks.length === 0` and
// reads `"empty"`. Was RED when authored; fixed at P6-02 (one-line derivation change,
// DEC-LOOP-03), and green since.
// ---------------------------------------------------------------------------
describe("AT-20 — quiet-corpus trap: junk-only log vs. the same log with the junk removed", () => {
  const cleanQuietText = "";
  const mixedQuietText = [decisionBlock("feature-x"), nonAdvisoryBlock("feature-x", LOOP_SOURCES[0])].join("\n");

  test("P6-02: a totals-only oracle already agrees, yet corpusState (and the reason codes it drives) does not", () => {
    const clean = parseEscalations(cleanQuietText);
    const mixed = parseEscalations(mixedQuietText);

    // Non-vacuity: the raw block count genuinely differs (the fixture is not a no-op) —
    // `mixedQuietText` holds two blocks the buggy `corpusState` derivation counts, `cleanQuietText`
    // holds none.
    const rawBlockCount = (text) => (text.match(/^## /gm) || []).length;
    expect(rawBlockCount(mixedQuietText)).toBeGreaterThan(rawBlockCount(cleanQuietText));

    // The "naive" (totals-only) slice: this is the part a weaker oracle would have checked, and
    // it already agrees at HEAD — proving that slice alone cannot kill Mutation sensitivity (b).
    const naiveEqual = mixed.entryCount === clean.entryCount && mixed.totals.size === clean.totals.size;
    expect(naiveEqual).toBe(true);
    expect(mixed.entryCount).toBe(0);
    expect(clean.entryCount).toBe(0);
    expect(mixed.totals).toEqual(clean.totals);
    expect(mixed.distinctFeatures).toEqual(clean.distinctFeatures);
    expect(mixed.bySeamFeature).toEqual(clean.bySeamFeature);

    // The conjunct the naive slice would have missed: corpusState, and the reason codes it drives.
    expect(mixed.corpusState).toBe(clean.corpusState);
    expect(mixed.corpusState).toBe("empty");
    expect(deriveReasons(mixed)).toEqual(deriveReasons(clean));
    expect(deriveReasons(mixed)).toEqual(new Set(["advisory-corpus-empty"]));

    // Both corpora report the stock-repo candidate ranking (corpusState !== "present" short-circuits
    // seamCandidates) — identical either way, but only meaningful once corpusState itself agrees.
    expect(seamCandidates(mixed)).toEqual(seamCandidates(clean));
    expect(seamCandidates(mixed)).toEqual({ over: null, tie: [], under: [] });
  });
});
