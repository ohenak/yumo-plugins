// statsMetrics.test.js — PLAN T-04 (RED) / T-13 (GREEN).
//
// Reds `computeFeatureStats` over `fakeStatsIo` + the real driver classifiers (TSPEC §4.3;
// FSPEC §6.3/§6.4/§6.5/§6.6/§6.10):
//
//   - Review rounds: AT-07 (highest index across roles, not a sum), AT-08 (un-suffixed form is
//     round 1), AT-09's fixture leg (malformed excluded and named, non-cross-review neither),
//     AT-25 (round-1 collision is `unmeasurable`, only its own row is affected).
//   - A dedicated fixture for TSPEC §6.6's `unmeasurable`/`harvested` branch-order mutant:
//     AT-25's round-1 collision **plus** a `LEARNINGS-{feature}.md` sibling in the same
//     directory — the only configuration on which the two branch orders disagree, and not
//     claimable from AT-25's own *Given* (which never names `LEARNINGS`).
//   - DoD rounds: AT-12's three directories (measured, harvested via no evidence, harvested via
//     leftover-draft-plus-foreign-file), AT-28 (non-matching `CODE_REVIEW-` basename silent).
//   - Halts: AT-13's companion `RESOLVED: no` leg (AT-13's own real-path `RESOLVED: yes` leg is
//     T-18's), AT-14 (no post-mortem is zero halts; absent/duplicated/unparseable markers all
//     fail closed to `open`).
//   - Byte ratio: AT-15 (ratio arithmetic, files on neither list ignored, the removal probe),
//     AT-16 (zero denominator is `n/a`, not a crash), AT-17's four directories (harvested wins
//     over `n/a`, fires on either family's absence) — the third of AT-17's four legs doubles as
//     TSPEC §6.6's harvested/zero-denominator branch-order mutant fixture.
//
// AT-15's symbolic-link leg is **not** claimed here: `fakeStatsIo` returns the fixture's
// declared size and cannot distinguish `lstatSync` from `statSync`. Its falsifying test is
// T-18's real-fs leg, with T-10's structural conjunct naming the call (TSPEC §2.4/§6.1).
//
// `pdlc/workflows/lib/stats.mjs` ships `computeFeatureStats`, and every test here runs
// against it. Each loads the module via a dynamic `await import` inside the test body rather
// than a top-level import, so a load-time failure in the module surfaces as failing tests
// rather than as an uncollectable file.

import { fakeStatsIo, recordingParsers, buildArtifactTree } from "./helpers/statsDoubles.js";
import {
  parseReviewFilename,
  deriveRoundWindow,
  deriveDodRoundIndex,
  parseResolvedMarker,
} from "../orchestrate-dev.js";

const REAL_DRIVER = Object.freeze({
  parseReviewFilename,
  deriveRoundWindow,
  deriveDodRoundIndex,
  parseResolvedMarker,
});

// One feature name and root reused by every fixture. A handful of tests also spell a
// literal foreign-feature basename inline (e.g. "CODE_REVIEW-some-other-feature-v2.md")
// to exercise the escaped-feature-name matcher's negative case.
const FEATURE = "demo-feature";
const ROOT = "/repo/docs/demo-feature";

function realParsers() {
  return recordingParsers(REAL_DRIVER).parsers;
}

function ioFor(files) {
  return fakeStatsIo(buildArtifactTree(ROOT, files));
}

async function compute(io, parsers, feature = FEATURE, dir = ROOT) {
  const { computeFeatureStats } = await import("../lib/stats.mjs");
  return computeFeatureStats(io, parsers, feature, dir);
}

describe("T-13: computeFeatureStats (TSPEC §4.3)", () => {
  describe("Review rounds (BR-05...BR-09)", () => {
    it("AT-07: highest index across roles, not a sum and not per role", async () => {
      const io = ioFor({
        "CROSS-REVIEW-test-engineer-TSPEC-v5.md": "x",
        "CROSS-REVIEW-product-manager-TSPEC-v3.md": "y",
      });

      const result = await compute(io, realParsers());

      expect(result.reviewRounds.byDocType.TSPEC).toEqual({
        state: "measured",
        rounds: 5,
        collidingRole: null,
      });
      expect(result.reviewRounds.byDocType.TSPEC.rounds).not.toBe(8);
    });

    it("AT-08: the un-suffixed form is round 1, not round 0", async () => {
      const io = ioFor({
        "CROSS-REVIEW-software-engineer-FSPEC.md": "x",
      });

      const result = await compute(io, realParsers());

      expect(result.reviewRounds.byDocType.FSPEC).toEqual({
        state: "measured",
        rounds: 1,
        collidingRole: null,
      });
    });

    it("AT-09 (fixture leg): malformed excluded and named; non-cross-review is neither", async () => {
      const io = ioFor({
        "CROSS-REVIEW-product-manager-REQ-v2.md": "a",
        "CROSS-REVIEW-product-manager-REVIEW-v1.md": "b",
        [`LEARNINGS-${FEATURE}.md`]: "c",
        "HANDOFF-PROMPT.md": "d",
      });

      const result = await compute(io, realParsers());

      expect(result.reviewRounds.byDocType.REQ).toEqual({
        state: "measured",
        rounds: 2,
        collidingRole: null,
      });
      expect(result.reviewRounds.malformed).toEqual([
        "CROSS-REVIEW-product-manager-REVIEW-v1.md",
      ]);
    });

    it("AT-25: round-1 collision is unmeasurable, poisons only its own row", async () => {
      const io = ioFor({
        "CROSS-REVIEW-software-engineer-TSPEC.md": "a",
        "CROSS-REVIEW-software-engineer-TSPEC-v1.md": "b",
        "CROSS-REVIEW-product-manager-REQ-v3.md": "c",
        "CROSS-REVIEW-product-manager-FSPEC-v2.md": "d",
        "CROSS-REVIEW-product-manager-PLAN-v5.md": "e",
        "CROSS-REVIEW-product-manager-PROPERTIES.md": "f",
        "CROSS-REVIEW-product-manager-DECISIONS-v4.md": "g",
      });

      const result = await compute(io, realParsers());

      expect(result.reviewRounds.byDocType.TSPEC).toEqual({
        state: "unmeasurable",
        rounds: null,
        collidingRole: "software-engineer",
      });
      expect(result.reviewRounds.byDocType.REQ).toEqual({
        state: "measured",
        rounds: 3,
        collidingRole: null,
      });
      expect(result.reviewRounds.byDocType.FSPEC).toEqual({
        state: "measured",
        rounds: 2,
        collidingRole: null,
      });
      expect(result.reviewRounds.byDocType.PLAN).toEqual({
        state: "measured",
        rounds: 5,
        collidingRole: null,
      });
      expect(result.reviewRounds.byDocType.PROPERTIES).toEqual({
        state: "measured",
        rounds: 1,
        collidingRole: null,
      });
      expect(result.reviewRounds.byDocType.DECISIONS).toEqual({
        state: "measured",
        rounds: 4,
        collidingRole: null,
      });
    });
  });

  describe("TSPEC §6.6 mutant fixture — unmeasurable/harvested branch order", () => {
    it("dedicated fixture: a round-1 collision plus a LEARNINGS sibling stays unmeasurable, never harvested", async () => {
      // AT-25's own *Given* never names LEARNINGS, so this conjunct is not claimable from
      // that AT alone. This is the only configuration on which testing `unmeasurable` before
      // `harvested` and testing `harvested` before `unmeasurable` disagree (TSPEC §6.6):
      // swapping the order would report this row `harvested` instead of `unmeasurable`,
      // because the whole-feature `harvested` flag is true (LEARNINGS is present) while the
      // TSPEC doc type independently collides at round 1.
      const io = ioFor({
        "CROSS-REVIEW-software-engineer-TSPEC.md": "a",
        "CROSS-REVIEW-software-engineer-TSPEC-v1.md": "b",
        [`LEARNINGS-${FEATURE}.md`]: "c",
      });

      const result = await compute(io, realParsers());

      expect(result.reviewRounds.byDocType.TSPEC).toEqual({
        state: "unmeasurable",
        rounds: null,
        collidingRole: "software-engineer",
      });
      expect(result.reviewRounds.byDocType.TSPEC.state).not.toBe("harvested");
    });
  });

  describe("DoD rounds (BR-10, BR-11)", () => {
    it("AT-12 (directory 1): a surviving CODE_REVIEW is measured, harvested-eligible or not", async () => {
      const io = ioFor({
        [`LEARNINGS-${FEATURE}.md`]: "x",
        [`CODE_REVIEW-${FEATURE}-v4.md`]: "y",
      });

      const result = await compute(io, realParsers());

      expect(result.dodRounds).toEqual({ state: "measured", rounds: 4 });
    });

    it("AT-12 (directory 2): LEARNINGS with no CODE_REVIEW evidence at all reads harvested, never 0", async () => {
      const io = ioFor({
        [`LEARNINGS-${FEATURE}.md`]: "x",
      });

      const result = await compute(io, realParsers());

      expect(result.dodRounds).toEqual({ state: "harvested", rounds: null });
      expect(result.dodRounds.rounds).not.toBe(0);
    });

    it("AT-12 (directory 3): leftover -draft plus a foreign feature's CODE_REVIEW is also harvested", async () => {
      const io = ioFor({
        [`LEARNINGS-${FEATURE}.md`]: "x",
        [`CODE_REVIEW-${FEATURE}-draft.md`]: "y",
        "CODE_REVIEW-some-other-feature-v2.md": "z",
      });

      const result = await compute(io, realParsers());

      expect(result.dodRounds).toEqual({ state: "harvested", rounds: null });
    });

    it("BR-11: a surviving `CODE_REVIEW-{feature}-v0.md` is measured at 0, never harvested — the harvested state never displaces evidence the metric read", async () => {
      const io = ioFor({
        [`LEARNINGS-${FEATURE}.md`]: "x",
        [`CODE_REVIEW-${FEATURE}-v0.md`]: "y",
      });

      const result = await compute(io, realParsers());

      // `deriveDodRoundIndex` returns `max + 1` = 1 here, so the derived index alone
      // is indistinguishable from "no file present"; BR-11 branches on presence.
      expect(result.dodRounds).toEqual({ state: "measured", rounds: 0 });
    });

    it("AT-28: a non-matching CODE_REVIEW-*-draft.md basename is silent, not malformed", async () => {
      const io = ioFor({
        [`CODE_REVIEW-${FEATURE}-v2.md`]: "x",
        [`CODE_REVIEW-${FEATURE}-draft.md`]: "y",
      });

      const result = await compute(io, realParsers());

      expect(result.dodRounds).toEqual({ state: "measured", rounds: 2 });
      expect(result.reviewRounds.malformed).toEqual([]);
    });
  });

  describe("Halts (BR-12, BR-13)", () => {
    it("AT-13 companion leg: RESOLVED: no classifies the entry open (the RESOLVED: yes leg is T-18's real-path test)", async () => {
      const io = ioFor({
        [`POSTMORTEM-D-${FEATURE}.md`]: "Body text.\nRESOLVED: no\n",
      });

      const result = await compute(io, realParsers());

      expect(result.halts).toEqual([{ phase: "D", resolution: "open" }]);
    });

    it("AT-14: no post-mortem file at all reads zero halts", async () => {
      const io = ioFor({
        [`REQ-${FEATURE}.md`]: "x",
      });

      const result = await compute(io, realParsers());

      expect(result.halts).toEqual([]);
    });

    it("AT-14: an absent RESOLVED marker fails closed to open (EC-14)", async () => {
      const io = ioFor({
        [`POSTMORTEM-F-${FEATURE}.md`]: "No marker at all in this body.\n",
      });

      const result = await compute(io, realParsers());

      expect(result.halts).toEqual([{ phase: "F", resolution: "open" }]);
    });

    it("AT-14: a duplicated RESOLVED marker fails closed to open (EC-14)", async () => {
      const io = ioFor({
        [`POSTMORTEM-I-${FEATURE}.md`]: "RESOLVED: yes\nRESOLVED: no\n",
      });

      const result = await compute(io, realParsers());

      expect(result.halts).toEqual([{ phase: "I", resolution: "open" }]);
    });

    it("AT-14: an unparseable RESOLVED marker fails closed to open (EC-14)", async () => {
      const io = ioFor({
        [`POSTMORTEM-T-${FEATURE}.md`]: "RESOLVED: maybe\n",
      });

      const result = await compute(io, realParsers());

      expect(result.halts).toEqual([{ phase: "T", resolution: "open" }]);
    });
  });

  describe("Byte ratio (BR-14...BR-16)", () => {
    it("AT-15: ratio is process bytes over spec bytes; files on neither list contribute to neither total", async () => {
      const io = ioFor({
        [`REQ-${FEATURE}.md`]: "R".repeat(100),
        [`FSPEC-${FEATURE}.md`]: "F".repeat(50),
        "CROSS-REVIEW-product-manager-REQ-v1.md": "C".repeat(30),
        [`POSTMORTEM-D-${FEATURE}.md`]: "P".repeat(20),
        [`CODE_REVIEW-${FEATURE}-v1.md`]: "D".repeat(40),
        [`LEARNINGS-${FEATURE}.md`]: "L".repeat(15),
        [`MUTATION-EVIDENCE-${FEATURE}.md`]: "M".repeat(15),
        [`SIZING-${FEATURE}.md`]: "S".repeat(15),
        "CROSS-REVIEW-product-manager-REVIEW-v1.md": "X".repeat(15),
      });

      const result = await compute(io, realParsers());

      expect(result.byteRatio).toEqual({
        state: "measured",
        ratio: 0.6,
        processBytes: 90,
        specBytes: 150,
      });
    });

    it("AT-15: the removal probe — removing one process file changes the total by exactly that file's size", async () => {
      const filesWithReview = {
        [`REQ-${FEATURE}.md`]: "R".repeat(100),
        [`FSPEC-${FEATURE}.md`]: "F".repeat(50),
        "CROSS-REVIEW-product-manager-REQ-v1.md": "C".repeat(30),
        [`POSTMORTEM-D-${FEATURE}.md`]: "P".repeat(20),
        [`CODE_REVIEW-${FEATURE}-v1.md`]: "D".repeat(40),
      };
      const { [`CODE_REVIEW-${FEATURE}-v1.md`]: _removed, ...filesWithoutReview } = filesWithReview;

      const before = await compute(ioFor(filesWithReview), realParsers());
      const after = await compute(ioFor(filesWithoutReview), realParsers());

      expect(before.byteRatio.processBytes).toBe(90);
      expect(after.byteRatio.processBytes).toBe(50);
      expect(before.byteRatio.processBytes - after.byteRatio.processBytes).toBe(40);
      expect(after.byteRatio.specBytes).toBe(before.byteRatio.specBytes);
    });

    it("AT-16: zero spec bytes reads n/a, not a crash — byte totals still reported", async () => {
      const io = ioFor({
        "CROSS-REVIEW-product-manager-REQ-v1.md": "C".repeat(30),
      });

      const result = await compute(io, realParsers());

      expect(result.byteRatio).toEqual({
        state: "unavailable",
        ratio: null,
        processBytes: 30,
        specBytes: 0,
      });
    });

    it("AT-17 (directory 1 of 4): LEARNINGS plus cross-reviews intact, no CODE_REVIEW, reads harvested", async () => {
      const io = ioFor({
        [`LEARNINGS-${FEATURE}.md`]: "x",
        "CROSS-REVIEW-product-manager-REQ-v1.md": "y",
      });

      const result = await compute(io, realParsers());

      expect(result.byteRatio.state).toBe("harvested");
      expect(result.byteRatio.ratio).toBeNull();
    });

    it("AT-17 (directory 2 of 4): LEARNINGS plus CODE_REVIEW intact, no cross-reviews, reads harvested", async () => {
      const io = ioFor({
        [`LEARNINGS-${FEATURE}.md`]: "x",
        [`CODE_REVIEW-${FEATURE}-v1.md`]: "y",
      });

      const result = await compute(io, realParsers());

      expect(result.byteRatio.state).toBe("harvested");
      expect(result.byteRatio.ratio).toBeNull();
    });

    it("AT-17 (directory 3 of 4): LEARNINGS with neither family present reads harvested, not unavailable (also TSPEC §6.6's harvested/zero-denominator order mutant fixture)", async () => {
      // The only fixture on which testing the harvested branch before the zero-denominator
      // branch and the reverse order disagree (TSPEC §6.6): both crossReviews and dodReviews
      // are empty here AND specBytes is zero, so a swapped order would report "unavailable"
      // instead of "harvested".
      const io = ioFor({
        [`LEARNINGS-${FEATURE}.md`]: "x",
      });

      const result = await compute(io, realParsers());

      expect(result.byteRatio.state).toBe("harvested");
      expect(result.byteRatio.state).not.toBe("unavailable");
      expect(result.byteRatio.ratio).toBeNull();
    });

    it("AT-17 (directory 4 of 4): LEARNINGS plus CODE_REVIEW intact, only an out-of-catalogue CROSS-REVIEW basename, reads harvested", async () => {
      const io = ioFor({
        [`LEARNINGS-${FEATURE}.md`]: "x",
        [`CODE_REVIEW-${FEATURE}-v1.md`]: "y",
        "CROSS-REVIEW-product-manager-REVIEW-v1.md": "z",
      });

      const result = await compute(io, realParsers());

      expect(result.byteRatio.state).toBe("harvested");
      expect(result.byteRatio.ratio).toBeNull();
    });
  });
});
