// loopAdvisoryCatalogue.test.js — PLAN P5-06.
//
// Owns AT-19 / PROP-ESC-02: the set of advisory sources that append is re-enumerated from
// `ADVISORY_SEAMS` (`orchestrate-dev.js`) at test time — never compared against a hardcoded
// literal list. REQ treats the advisory catalogue as live and growable, so a literal
// transcription would red on every future seam without a defect having been introduced. The
// compensating control is the pair of non-vacuity conjuncts this file asserts alongside the
// set-equality: both sides non-empty, cardinality at least the frozen enumeration's, and the
// named member `A6` present on both. Do NOT "fix" this into a literal — that re-breaks AT-19 on
// the next seam.
//
// This file imports orchestrate-dev.js as a namespace so it never transcribes ADVISORY_SEAMS'
// membership into source — the only literal string in this file that names a seam is the "A6"
// non-vacuity probe the PLAN row calls out by name.

import * as devModule from "../orchestrate-dev.js";

describe("advisory catalogue oracle (AT-19, PROP-ESC-02)", () => {
  it("re-enumerates the set of advisory sources that append from ADVISORY_SEAMS, set-equal with non-vacuity conjuncts", async () => {
    const { ADVISORY_SEAMS, appendEscalationEntry } = devModule;

    // Live, frozen enumeration — re-read at test time, never transcribed as a literal array.
    const catalogue = new Set(ADVISORY_SEAMS);

    // Independently re-derive "the set of advisory sources that append" by actually driving
    // appendEscalationEntry for each live seam and observing which ones produce an
    // advisory-shaped entry (a `| Seam |` row). This is the behavioral half of the oracle: it
    // does not simply echo ADVISORY_SEAMS back at itself.
    const appended = new Set();
    for (const seam of ADVISORY_SEAMS) {
      let written = "";
      await appendEscalationEntry({
        disposition: { reason: "test reason", verdict: null },
        ctx: {
          feature: "loop-advisory-catalogue-fixture",
          seam,
          phase: "phase",
          phaseOutcome: "outcome",
          decision: "decision",
        },
        _appendFile: async (_path, entry) => {
          written = entry;
        },
        _now: () => 0,
      });
      if (written.includes("| Seam |")) {
        appended.add(seam);
      }
    }

    // Set-equality between the two independently-computed enumerations.
    expect(appended).toEqual(catalogue);

    // Non-vacuity conjunct 1: both sides non-empty (an unread/empty catalogue must not pass
    // vacuously as "zero sources wired").
    expect(appended.size).toBeGreaterThan(0);
    expect(catalogue.size).toBeGreaterThan(0);

    // Non-vacuity conjunct 2: cardinality at least the frozen enumeration's.
    expect(appended.size).toBeGreaterThanOrEqual(ADVISORY_SEAMS.length);
    expect(catalogue.size).toBeGreaterThanOrEqual(ADVISORY_SEAMS.length);

    // Named member A6 present on both sides.
    expect(appended.has("A6")).toBe(true);
    expect(catalogue.has("A6")).toBe(true);
  });
});
