// loopEntryVocabulary.test.js — PLAN P3-03 (batch 4, RED-terminal; closed at P3-04, batch 5).
//
// Owns AT-21 (BR-12): renderEscalationEntry's non-advisory branch — a ctx.source-shaped input
// renders `## {iso} — {feature} — {source}` with a `| Source |` row and NO `| Seam |` row, where
// `{source}` is one member of LOOP_SOURCES (imported, never transcribed, never an alternation of
// both members in one cell). That branch does not exist yet — P3-04 adds it — so every assertion
// that exercises it reds today for the right reason and is committed `test.skip`, titled
// "P3-04: …", per the PLAN's [red]/[green] split. The advisory-branch byte-identity guard and the
// LOOP_SOURCES ∩ ADVISORY_SEAMS disjointness check are both true today — nothing about the seam
// branch or either catalogue changes at P3-04 — and are committed un-skipped as durable regression
// guards, matching AT-34a's precedent in loopMergeEscalation.test.js.
//
// This file imports orchestrate-dev.js as a namespace (`* as devModule`) so a not-yet-existing
// `LOOP_SOURCES` export on that module resolves to `undefined` at import time rather than a link
// error — the same convention loopMergeEscalation.test.js set for `redactEntryText` at P3-02.

import * as devModule from "../orchestrate-dev.js";
import { LOOP_SOURCES } from "../lib/loop-session.mjs";

const FIXED_NOW_MS = Date.parse("2026-01-01T00:00:00.000Z");
const FEATURE = "pdlc-engineering-loop";

function buildDisposition(overrides = {}) {
  return {
    reason: "out-of-envelope",
    verdict: {
      diagnosis: "the merge could not be fast-forwarded onto the target branch",
      proposedAction: "rebase and retry",
      evidence: ["docs/_queue/QUEUE.md:1"],
    },
    ...overrides,
  };
}

function buildAdvisoryCtx(overrides = {}) {
  return {
    feature: FEATURE,
    seam: "A5",
    phase: "PUB",
    phaseOutcome: "halted",
    decision: "whether the merge failure is the feature's to fix",
    ...overrides,
  };
}

function buildNonAdvisoryCtx(source, overrides = {}) {
  return {
    feature: FEATURE,
    source,
    phase: "MERGE",
    phaseOutcome: "refused",
    decision: "whether the merge refusal requires operator action",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// BR-12a — LOOP_SOURCES disjoint from ADVISORY_SEAMS. True today: both catalogues already ship.
// ---------------------------------------------------------------------------
describe("BR-12a — LOOP_SOURCES disjoint from ADVISORY_SEAMS", () => {
  test("no member of LOOP_SOURCES appears in ADVISORY_SEAMS", () => {
    const intersection = LOOP_SOURCES.filter((s) => devModule.ADVISORY_SEAMS.includes(s));
    expect(intersection).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// AT-21 — advisory branch stays byte-identical to HEAD on HEAD-shaped (seam) input. True today;
// required to stay true once the non-advisory branch lands at P3-04.
// ---------------------------------------------------------------------------
describe("AT-21 — advisory branch stays byte-identical to HEAD on a seam ctx", () => {
  test("a seam ctx renders the shipped heading, a | Seam | row, and no | Source | row", () => {
    const disposition = buildDisposition();
    const ctx = buildAdvisoryCtx();
    const entry = devModule.renderEscalationEntry(disposition, ctx, { now: FIXED_NOW_MS });
    const iso = new Date(FIXED_NOW_MS).toISOString();

    expect(entry.startsWith(`## ${iso} — ${FEATURE} — ${ctx.seam}`)).toBe(true);
    expect(entry).toContain(`| Seam | ${ctx.seam} |`);
    expect(entry).not.toContain("| Source |");
  });
});

// ---------------------------------------------------------------------------
// AT-21 — non-advisory branch: ctx.source vocabulary. Does not exist yet — P3-04 adds the branch.
// Skipped, titled with the owning green task.
// ---------------------------------------------------------------------------
describe("AT-21 — non-advisory branch: ctx.source vocabulary", () => {
  for (const source of LOOP_SOURCES) {
    test(`P3-04: a ${source} ctx renders the heading with {source}, a | Source | row, and no | Seam | row`, () => {
      const disposition = buildDisposition();
      const ctx = buildNonAdvisoryCtx(source);
      const entry = devModule.renderEscalationEntry(disposition, ctx, { now: FIXED_NOW_MS });
      const iso = new Date(FIXED_NOW_MS).toISOString();

      expect(entry.startsWith(`## ${iso} — ${FEATURE} — ${source}`)).toBe(true);
      expect(entry).toContain(`| Source | ${source} |`);
      expect(entry).not.toContain("| Seam |");

      // {source} is one member of LOOP_SOURCES, never an alternation of both members in one cell.
      for (const other of LOOP_SOURCES) {
        if (other !== source) {
          expect(entry).not.toContain(`| Source | ${other} |`);
        }
      }
    });
  }

  test("P3-04: the seven BR-12 fields are present, compared as containment of a literal transcription", () => {
    const disposition = buildDisposition();
    const ctx = buildNonAdvisoryCtx(LOOP_SOURCES[0]);
    const entry = devModule.renderEscalationEntry(disposition, ctx, { now: FIXED_NOW_MS });
    const iso = new Date(FIXED_NOW_MS).toISOString();

    // decision sentence (first prose statement), feature, source, diagnosis, evidence, proposed
    // action, timestamp — BR-12's seven fields, transcribed literally rather than read back from
    // the implementation.
    expect(entry).toContain(iso);
    expect(entry).toContain(ctx.decision);
    expect(entry).toContain(`| Feature | ${FEATURE} |`);
    expect(entry).toContain(`| Source | ${ctx.source} |`);
    expect(entry).toContain(disposition.verdict.diagnosis);
    expect(entry).toContain(disposition.verdict.evidence[0]);
    expect(entry).toContain(disposition.verdict.proposedAction);

    // The decision sentence is the entry's first prose statement (BR-12's one ordering
    // constraint).
    const firstProseLine = entry.split("\n").find((line) => line.trim().length > 0);
    expect(firstProseLine.startsWith(`## ${iso}`)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Differential assertion — orchestrate-dev.js's own frozen LOOP_SOURCES literal (P3-04) must
// deepEqual lib/loop-session.mjs's — one predicate, two enumerations, held equal by this
// assertion (DEC-CONS-05 precedent). Does not exist yet — P3-04 adds the literal.
// ---------------------------------------------------------------------------
describe("orchestrate-dev.js's frozen LOOP_SOURCES literal matches lib/loop-session.mjs", () => {
  test("P3-04: devModule.LOOP_SOURCES deepEquals the imported LOOP_SOURCES", () => {
    expect(devModule.LOOP_SOURCES).toEqual(LOOP_SOURCES);
  });
});
