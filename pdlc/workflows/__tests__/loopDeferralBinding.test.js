// loopDeferralBinding.test.js — DoD criterion 6(b), deferral binding.
//
// CODE_REVIEW-pdlc-engineering-loop-v2 §4(b) (B-03…B-08): this feature leaves six
// deferrals in place — REQ §8's D-LOOP-01…05 plus DECISIONS' DEC-LOOP-07 descope —
// and every one of them was bound by prose only. The post-mortem finding behind the
// criterion is that prose-only deferrals never ship: a deferral is bound only when a
// **row in `docs/_queue/QUEUE.md`** carries it.
//
// This oracle pins that binding permanently. The deferral ids are *discovered* from
// the REQ's own §8 table (never hand-listed, so a deferral added later is caught here
// rather than silently unbound), and each one must be named by a QUEUE.md line that
// also names a feature which actually appears as a row in the live queue table — a
// bare mention of the id in prose, or a mention naming a feature with no row, is not
// a binding and reds here.
//
// Reads the working tree (not `git show HEAD:`) so the binding and the oracle that
// requires it can land in one commit.

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..", "..");

const QUEUE_TEXT = readFileSync(join(REPO_ROOT, "docs", "_queue", "QUEUE.md"), "utf8");
const REQ_TEXT = readFileSync(
  join(REPO_ROOT, "docs", "pdlc-engineering-loop", "REQ-pdlc-engineering-loop.md"),
  "utf8",
);

/** Deferral ids discovered from REQ §8's table — leading cell of each row. */
function reqDeferralIds(text) {
  return [...text.matchAll(/^\|\s*(D-LOOP-\d+)\s*\|/gm)].map((m) => m[1]);
}

/**
 * Feature names of the live queue table: rows whose first cell is an `Order`
 * integer. Removed/archived rows live in prose notes, not in the table, so they
 * are correctly absent from this set.
 */
function queueFeatures(text) {
  const features = [];
  for (const line of text.split("\n")) {
    const m = /^\|\s*(\d+)\s*\|([^|]*)\|([^|]*)\|/.exec(line);
    if (!m) continue;
    features.push(m[3].trim());
  }
  return features;
}

// DEC-LOOP-07 is a *descope* deferral (AT-52's installed-engine leg) recorded in
// DECISIONS rather than REQ §8, so the §8 glob cannot discover it. Pinned by hand,
// with its own residual risk as the reason it must be bound like any other deferral.
const DECISION_DEFERRAL_IDS = ["DEC-LOOP-07"];

const REQ_IDS = reqDeferralIds(REQ_TEXT);
const QUEUE_FEATURES = queueFeatures(QUEUE_TEXT);

describe("DoD 6(b): pdlc-engineering-loop's deferrals are bound to live queue rows", () => {
  test("the REQ §8 glob discovers the deferral cells it exists to range over (not vacuous)", () => {
    expect(REQ_IDS.length).toBeGreaterThanOrEqual(5);
    expect(REQ_IDS).toEqual(expect.arrayContaining(["D-LOOP-01", "D-LOOP-05"]));
  });

  test("the queue-table parse finds live rows (not vacuous)", () => {
    expect(QUEUE_FEATURES.length).toBeGreaterThan(0);
    expect(QUEUE_FEATURES).toEqual(expect.arrayContaining(["pdlc-engineering-loop"]));
  });

  test.each([...REQ_IDS, ...DECISION_DEFERRAL_IDS])(
    "%s is named by a QUEUE.md line that binds it to a feature holding a live queue row",
    (id) => {
      const mentions = QUEUE_TEXT.split("\n").filter((line) => line.includes(id));
      expect(mentions.length).toBeGreaterThan(0);

      const bindingLines = mentions.filter((line) =>
        QUEUE_FEATURES.some((feature) => line.includes(feature)),
      );
      expect(bindingLines.length).toBeGreaterThan(0);
    },
  );

  test("negative control: an id no queue line mentions is reported unbound", () => {
    const absent = "D-LOOP-99";
    expect(QUEUE_TEXT.includes(absent)).toBe(false);
  });
});
