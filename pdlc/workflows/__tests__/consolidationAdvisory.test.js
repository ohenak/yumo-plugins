// consolidationAdvisory.test.js — PLAN T18 (RED, describe.skip; batch 3, deps T01, T02).
//
// One block, one green owner (T27, batch 6): AT-A1 … AT-A7 over `parseEscalations` and
// `seamCandidates` (TSPEC §7.7). Both are pure, total functions — no `main()` pass exists yet
// (T31, batch 10), so every assertion here drives the two functions directly, never a doubled
// pass around them.
//
// Standing caution, carried down from TSPEC §11.5 and PROPERTIES §6.3, repeated here because this
// is where the author will be working: **no fixture in this file may be written against REQ
// AC-6.3's "across the consumed window" wording.** FSPEC §9.5 / BR-37a is the settled contract —
// `seamCandidates` ranges over **every** entry in `ESCALATIONS.md`, with no filter on `Feature`,
// none on date, and no relation to whatever a pass's "consumed set" turns out to be. Neither
// `parseEscalations` nor `seamCandidates` takes a consumed-set argument at all: there is no seam
// through which one could reach this call. A REQ-derived fixture would red a conforming
// implementation; AT-A6 below pins the settled (whole-file) form directly.
import { parseEscalations, seamCandidates } from "../consolidate-learnings.js";
import { ADVISORY_SEAMS } from "../orchestrate-dev.js";
import { buildEscalationsFixture } from "./helpers/consolidationDoubles.js";

describe.skip("T18 — AT-A1 … AT-A7: the advisory corpus (parseEscalations, seamCandidates)", () => {
  test("AT-A1 — absent corpus: corpusState 'absent' (reason no-advisory-corpus), no seam proposal of any kind", () => {
    const counts = parseEscalations(null);

    expect(counts.corpusState).toBe("absent");
    expect(counts.entryCount).toBe(0);

    const verdict = seamCandidates(counts);
    expect(verdict.over).toBeNull();
    expect(verdict.tie).toEqual([]);
    expect(verdict.under).toEqual([]);
  });

  test("AT-A2 — present-but-empty corpus: corpusState 'empty', no over-escalation candidate and no widening proposal", () => {
    const text = buildEscalationsFixture([]);
    const counts = parseEscalations(text);

    expect(counts.corpusState).toBe("empty");
    expect(counts.entryCount).toBe(0);

    const verdict = seamCandidates(counts);
    expect(verdict.over).toBeNull();
    expect(verdict.tie).toEqual([]);
    expect(verdict.under).toEqual([]);
  });

  test("AT-A3 — a stock repo (the tier never run): no widening is proposed for any of the five ADVISORY_SEAMS", () => {
    // Same input as AT-A1 (absent corpus) — FSPEC's "stock repo with the tier never run" is the
    // same observable state as "the file is absent". Paired with AT-A6's positive: the same
    // function proposes a widening on a non-empty corpus in that test.
    const counts = parseEscalations(null);
    const verdict = seamCandidates(counts);

    expect(verdict.under).toEqual([]);
    for (const seam of ADVISORY_SEAMS) {
      expect(verdict.under).not.toContain(seam);
      expect(verdict.over).not.toBe(seam);
    }
  });

  test("AT-A4 — a seam escalating across two distinct features and strictly more than every other seam is surfaced as an over-escalation candidate", () => {
    const text = buildEscalationsFixture([
      { feature: "feature-alpha", seam: "A1" },
      { feature: "feature-beta", seam: "A1" },
      { feature: "feature-gamma", seam: "A2" },
    ]);
    const counts = parseEscalations(text);
    const verdict = seamCandidates(counts);

    expect(verdict.over).toBe("A1");
    expect(verdict.tie).toEqual([]);
  });

  test("AT-A5 — two seams tied on the highest total: no over-escalation candidate, the tie is reported", () => {
    const text = buildEscalationsFixture([
      { feature: "feature-alpha", seam: "A1" },
      { feature: "feature-beta", seam: "A1" },
      { feature: "feature-gamma", seam: "A2" },
      { feature: "feature-delta", seam: "A2" },
    ]);
    const counts = parseEscalations(text);
    const verdict = seamCandidates(counts);

    expect(verdict.over).toBeNull();
    expect([...verdict.tie].sort()).toEqual(["A1", "A2"]);
  });

  test("AT-A6 — seamCandidates ranges over every entry: an identical verdict whether the escalating entries' Feature values are disjoint from or match an external 'consumed set'", () => {
    // Neither `parseEscalations` nor `seamCandidates` accepts a consumed-set argument (BR-37a) —
    // this is the property that pins that whole-file population. The disjoint/matching pair
    // stands in for "the pass's consumed set" without either function ever seeing one.
    const disjointText = buildEscalationsFixture([
      { feature: "unrelated-feature-one", seam: "A1" },
      { feature: "unrelated-feature-two", seam: "A1" },
    ]);
    const matchingText = buildEscalationsFixture([
      { feature: "pdlc-consolidation-agent", seam: "A1" },
      { feature: "another-consumed-feature", seam: "A1" },
    ]);

    const disjointVerdict = seamCandidates(parseEscalations(disjointText));
    const matchingVerdict = seamCandidates(parseEscalations(matchingText));

    expect(disjointVerdict).toEqual(matchingVerdict);
    // Seam B (A2) escalated from neither corpus — it is under-exercised identically either way.
    expect(disjointVerdict.under).toContain("A2");
  });

  test("AT-A7 — an entry missing its Feature row is skipped, attributes no count to a guessed key, and the read does not abort", () => {
    const text = buildEscalationsFixture([
      { seam: "A1" }, // `feature` omitted — E-12's malformed entry
      { feature: "feature-alpha", seam: "A2" },
    ]);

    expect(() => parseEscalations(text)).not.toThrow();
    const counts = parseEscalations(text);

    // No count is attributed under A1 for the malformed entry — never a guessed key.
    const a1Features = counts.bySeamFeature.get("A1");
    expect(a1Features === undefined || a1Features.size === 0).toBe(true);
    expect(counts.totals.get("A1") ?? 0).toBe(0);

    // The read continues: the well-formed entry that follows the malformed one is still counted.
    expect(counts.totals.get("A2")).toBe(1);
    expect(counts.bySeamFeature.get("A2").get("feature-alpha")).toBe(1);
  });
});
