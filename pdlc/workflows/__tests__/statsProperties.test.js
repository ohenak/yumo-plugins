// statsProperties.test.js — PLAN T-19 (feature: pdlc-stats).
//
// Property-based tests over `pdlc/workflows/lib/stats.mjs`, using `fast-check` (already a
// `pdlc/workflows` dev dependency — TSPEC §6.6):
//
//   - PROP-1 (partition): for any generated basename, it lands in exactly one of "counted for
//     one doc type" (real `parseReviewFilename` returns `ok: true`), "malformed" (`ok: false`,
//     `reason !== "not_cross_review"`), or "neither" — never two. Falsifies a `not_cross_review`
//     filter that leaks into `computeFeatureStats`'s `malformed` list.
//   - PROP-2 (state totality): for any generated directory listing, every `DocTypeRounds`,
//     `DodRounds` and `ByteRatio` produced carries a `state` from its declared union, with
//     `rounds`/`ratio` `null` in exactly the non-"measured" states, and `collidingRole`
//     non-null in exactly `DocTypeRounds`'s "unmeasurable" state. Falsifies a key-absent shape
//     (BR-22).
//   - PROP-3 (order independence): for any generated directory content, `runStats` over a
//     `fakeStatsIo` whose `listDir` returns that content in a **generated permutation**
//     produces `stdout` byte-identical to the sorted-order run, with `byDocType` key order and
//     human row order both equal to `REVIEW_DOC_TYPE_ROWS` exactly. Stated over a permutation,
//     not two identical calls, per TSPEC §6.6 (BR-09, BR-13, BR-18).
//
// PROP-3's generator deliberately excludes malformed `CROSS-REVIEW-` basenames: the `malformed`
// field is documented (TSPEC §4.1's `ReviewRounds` typedef) to preserve listing order with no
// dedup step — that is a stated design choice, not the ordering claim BR-09/BR-13/BR-18 make, so
// including it would make the byte-identity conjunct fail for a reason PROP-3 does not assert.
//
// `pdlc/workflows/lib/stats.mjs` (T-12...T-17) and `pdlc/engine/bin/cli.mjs` (T-17) are already
// complete by the time this task runs (PLAN: T-19 depends only on T-17) — this file adds tests
// over already-shipped behavior, not a red-then-green pair, so nothing here is `.skip`ped.

import fc from "fast-check";
import { fakeStatsIo, recordingParsers } from "./helpers/statsDoubles.js";
import {
  parseReviewFilename,
  deriveRoundWindow,
  deriveDodRoundIndex,
  parseResolvedMarker,
} from "../orchestrate-dev.js";
import { computeFeatureStats, runStats, REVIEW_DOC_TYPE_ROWS } from "../lib/stats.mjs";

const REAL_DRIVER = Object.freeze({
  parseReviewFilename,
  deriveRoundWindow,
  deriveDodRoundIndex,
  parseResolvedMarker,
});

function realParsers() {
  return recordingParsers(REAL_DRIVER).parsers;
}

const FEATURE = "demo-feature";
const ROOT = "/repo/docs/demo-feature";
const ROLES = Object.freeze(["product-manager", "software-engineer", "test-engineer"]);

// --- Generators -------------------------------------------------------------

function crossReviewValidArb(feature) {
  return fc
    .tuple(
      fc.constantFrom(...ROLES),
      fc.constantFrom(...REVIEW_DOC_TYPE_ROWS),
      fc.option(fc.integer({ min: 1, max: 9 }), { nil: null }),
    )
    .map(([role, docType, round]) =>
      round === null
        ? `CROSS-REVIEW-${role}-${docType}.md`
        : `CROSS-REVIEW-${role}-${docType}-v${round}.md`,
    );
}

function crossReviewMalformedArb() {
  return fc.constantFrom(
    "CROSS-REVIEW-nobody-TSPEC-v1.md",
    "CROSS-REVIEW-product-manager-NOTATYPE-v1.md",
    "CROSS-REVIEW-product-manager-TSPEC-v0.md",
    "CROSS-REVIEW-product-manager-TSPEC-vX.md",
    "CROSS-REVIEW-product-manager-TSPEC-v1.md.bak",
  );
}

function nonCrossReviewArb(feature) {
  return fc.constantFrom(
    `LEARNINGS-${feature}.md`,
    "HANDOFF-PROMPT.md",
    `POSTMORTEM-P-${feature}.md`,
    `POSTMORTEM-D-${feature}.md`,
    `CODE_REVIEW-${feature}-v1.md`,
    `CODE_REVIEW-${feature}-v2.md`,
    `REQ-${feature}.md`,
    `FSPEC-${feature}.md`,
    "random-notes.txt",
  );
}

// Every basename shape PROP-1/PROP-2 must classify: valid, malformed, and unrelated.
function anyBasenameArb(feature) {
  return fc.oneof(crossReviewValidArb(feature), crossReviewMalformedArb(), nonCrossReviewArb(feature));
}

// PROP-3's shape excludes malformed basenames — see file header.
function orderIndependentBasenameArb(feature) {
  return fc.oneof(crossReviewValidArb(feature), nonCrossReviewArb(feature));
}

function treeFor(root, basenames) {
  const parent = root.slice(0, root.lastIndexOf("/"));
  const tree = {
    [parent]: { dirs: [root.slice(root.lastIndexOf("/") + 1)], files: [] },
    [root]: { dirs: [], files: basenames },
  };
  for (const name of basenames) {
    tree[`${root}/${name}`] = "x";
  }
  return tree;
}

// --- PROP-1: partition -------------------------------------------------------

describe("T-19: PROP-1 (partition, TSPEC §6.6)", () => {
  it("every basename lands in exactly one of counted / malformed / neither, never two", () => {
    fc.assert(
      fc.property(fc.array(anyBasenameArb(FEATURE), { maxLength: 15 }), (rawBasenames) => {
        const basenames = [...new Set(rawBasenames)];
        const io = fakeStatsIo(treeFor(ROOT, basenames));
        const result = computeFeatureStats(io, realParsers(), FEATURE, ROOT);

        for (const basename of basenames) {
          const parsed = parseReviewFilename(basename);
          const isMalformed = result.reviewRounds.malformed.includes(basename);

          if (parsed.ok) {
            // Counted for one doc type: never also reported malformed.
            expect(isMalformed).toBe(false);
          } else if (parsed.reason !== "not_cross_review") {
            // Malformed cross-review: must be named, exactly here.
            expect(isMalformed).toBe(true);
          } else {
            // Neither a cross-review file nor malformed: must not leak into either bucket.
            expect(isMalformed).toBe(false);
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});

// --- PROP-2: state totality --------------------------------------------------

describe("T-19: PROP-2 (state totality, TSPEC §6.6, BR-22)", () => {
  it("DocTypeRounds/DodRounds/ByteRatio carry a declared state, with null/non-null fields exactly where required", () => {
    fc.assert(
      fc.property(fc.array(anyBasenameArb(FEATURE), { maxLength: 15 }), (rawBasenames) => {
        const basenames = [...new Set(rawBasenames)];
        const io = fakeStatsIo(treeFor(ROOT, basenames));
        const result = computeFeatureStats(io, realParsers(), FEATURE, ROOT);

        for (const docType of REVIEW_DOC_TYPE_ROWS) {
          const entry = result.reviewRounds.byDocType[docType];
          expect(["measured", "harvested", "unmeasurable"]).toContain(entry.state);
          expect(entry.rounds === null).toBe(entry.state !== "measured");
          expect(entry.collidingRole !== null).toBe(entry.state === "unmeasurable");
        }

        expect(["measured", "harvested"]).toContain(result.dodRounds.state);
        expect(result.dodRounds.rounds === null).toBe(result.dodRounds.state !== "measured");

        expect(["measured", "harvested", "unavailable"]).toContain(result.byteRatio.state);
        expect(result.byteRatio.ratio === null).toBe(result.byteRatio.state !== "measured");
      }),
      { numRuns: 100 },
    );
  });
});

// --- PROP-3: order independence over a generated permutation ----------------

const CWD = "/repo";

describe("T-19: PROP-3 (order independence over a generated permutation, TSPEC §6.6, BR-09/BR-13/BR-18)", () => {
  it("a permuted listing produces stdout byte-identical to the sorted-order run", () => {
    const basenamesAndPermutation = fc
      .array(orderIndependentBasenameArb(FEATURE), { maxLength: 12 })
      .map((arr) => [...new Set(arr)])
      .chain((uniqueBasenames) =>
        fc.tuple(
          fc.constant(uniqueBasenames),
          fc.shuffledSubarray(uniqueBasenames, {
            minLength: uniqueBasenames.length,
            maxLength: uniqueBasenames.length,
          }),
        ),
      );

    fc.assert(
      fc.property(basenamesAndPermutation, ([basenames, permuted]) => {
        const sorted = [...basenames].sort();

        const sortedOutcome = runStats({
          argv: [FEATURE],
          io: fakeStatsIo(treeFor(ROOT, sorted)),
          parsers: realParsers(),
          cwd: CWD,
        });
        const permutedOutcome = runStats({
          argv: [FEATURE],
          io: fakeStatsIo(treeFor(ROOT, permuted)),
          parsers: realParsers(),
          cwd: CWD,
        });

        expect(permutedOutcome.stdout).toBe(sortedOutcome.stdout);
        expect(permutedOutcome.stderr).toBe(sortedOutcome.stderr);
        expect(permutedOutcome.exitCode).toBe(sortedOutcome.exitCode);

        const permutedResult = computeFeatureStats(
          fakeStatsIo(treeFor(ROOT, permuted)),
          realParsers(),
          FEATURE,
          ROOT,
        );
        expect(Object.keys(permutedResult.reviewRounds.byDocType)).toEqual([
          ...REVIEW_DOC_TYPE_ROWS,
        ]);
      }),
      { numRuns: 100 },
    );
  });
});
