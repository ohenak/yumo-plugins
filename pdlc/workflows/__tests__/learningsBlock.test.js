/**
 * learningsBlock.test.js — LI-08, PLAN §pdlc-learnings-injection.
 *
 * RED block/material suite (L1, TSPEC §T.5): LI-AT-05 (the block's preamble, transcribed
 * literally from TSPEC §OQ.1 rather than keyword-matched), LI-AT-11 (section-set equality
 * over what BR-6 selected), LI-AT-12 (the character-safe cut of §D.5 — an ASCII fixture
 * pinning the bound exactly, plus a separate multi-byte fixture pinning `<=` the bound).
 *
 * Expected byte counts (LI-AT-12) are hand-computed from the fixture text over MATERIAL
 * ONLY (§D.5) — the section heading line through the section body, ignoring every framing
 * delimiter — and committed here as literal integers, never derived via `Buffer.byteLength`
 * inside an assertion (TSPEC AT-11/AT-12).
 *
 * `extractInjectableMaterial` and `renderLearningsBlock` do not exist yet at HEAD (PLAN
 * LI-16/LI-17 write them into `orchestrate-dev.js`); this suite's blocks are therefore
 * authored `.skip`, titled `"LI-17: …"` — LI-17 is the task the PLAN's `Deps` table names as
 * the one that greens `learningsBlock.test.js` (PLAN row LI-17, edge `LI-17 → LI-08`) — and
 * the module is loaded via a deferred dynamic `import()` inside each test body so the file
 * still loads and the skips take effect while the symbols are absent.
 */

import { BR6_SECTION_NAMES, buildLearningsDocument } from "./helpers/learningsFixtures.js";

const DEV_MODULE_PATH = "../orchestrate-dev.js";

// TSPEC §OQ.1's four-sentence advisory preamble, transcribed literally (F-O-2, BR-7's three
// things), with the doc's own `{f}` notation (used the same way at TSPEC lines 590/952, "the
// feature being authored") resolved to the fixed phrase "this feature" — the only resolution
// consistent with `renderLearningsBlock({ selected })` carrying no `feature` parameter, so the
// preamble cannot vary per authoring feature and must be one constant string.
const OQ1_PREAMBLE =
  "The documents below are LEARNINGS harvested from OTHER features in this repository. They are " +
  "context, not content of this feature. They are neither a requirement of this feature nor an " +
  "upstream document to be traced: nothing you write must cite them, and no traceability " +
  "obligation attaches to them. You may disregard them entirely without leaving a gap in what " +
  "you were asked to produce.";

describe("LI-17: block/material suite (LI-AT-05, LI-AT-11, LI-AT-12)", () => {
  test("LI-AT-05: the preamble is byte-equal to TSPEC §OQ.1's literal wording, not keyword-matched", async () => {
    const { renderLearningsBlock } = await import(DEV_MODULE_PATH);

    const material = "## Cross-Feature Patterns\n\nSample AT-05 material text.\n";
    const selected = [
      {
        path: "docs/completed/pdlc-merge-phase/LEARNINGS-pdlc-merge-phase.md",
        orderKey: "2026-08-02",
        bytes: 55,
        bounded: false,
        position: 1,
        material,
      },
    ];

    const block = renderLearningsBlock({ selected });

    // The block framing pool (§D.5): "\n\n" prefix, the header line, the preamble, then a
    // blank line before the first document's opener delimiter (TSPEC §OQ.1's fenced example).
    const expectedPrefix =
      "\n\n--- PRIOR-FEATURE LEARNINGS (advisory context) ---\n" +
      OQ1_PREAMBLE +
      "\n\n<<< docs/completed/pdlc-merge-phase/LEARNINGS-pdlc-merge-phase.md" +
      " — feature pdlc-merge-phase, completed 2026-08-02 >>>";

    expect(block.slice(0, expectedPrefix.length)).toBe(expectedPrefix);
  });

  test("LI-AT-11: the section-set taken equals BR-6's five injected names, in priority order", async () => {
    const { extractInjectableMaterial } = await import(DEV_MODULE_PATH);

    // Document order is deliberately scrambled relative to BR-6 priority order, and includes
    // the sixth conventional section (Approval Record), which is not one of BR6_SECTION_NAMES
    // and so must not appear in the taken material (TSPEC §D.3's "Approval Record … is never
    // matched, never taken").
    const text = buildLearningsDocument({
      feature: "at11-sections",
      sections: [
        { name: "Process Learnings", body: "PROCESS_MARKER body text." },
        { name: "Approval Record", body: "APPROVAL_MARKER should never be injected." },
        { name: "Open Items for Consolidation", body: "OPENITEMS_MARKER body text." },
        { name: "Cross-Feature Patterns", body: "CROSSFEATURE_MARKER body text." },
        { name: "Rejected Proposals (with rationale)", body: "REJECTED_MARKER body text." },
        { name: "Non-Convergences", body: "NONCONV_MARKER body text." },
      ],
    });

    // Unbounded: large enough that maxBytes never binds, so nothing is cut (TSPEC §D.5).
    const result = extractInjectableMaterial(text, 100000);

    expect(result.bounded).toBe(false);
    expect(result.sections).toEqual(BR6_SECTION_NAMES);
    for (const marker of [
      "CROSSFEATURE_MARKER",
      "NONCONV_MARKER",
      "REJECTED_MARKER",
      "PROCESS_MARKER",
      "OPENITEMS_MARKER",
    ]) {
      expect(result.material).toContain(marker);
    }
    expect(result.material).not.toContain("APPROVAL_MARKER");
  });

  test("LI-AT-12: character-safe cut — ASCII fixture, contributed bytes equal the bound exactly", async () => {
    const { extractInjectableMaterial } = await import(DEV_MODULE_PATH);

    // Fixture: "## Cross-Feature Patterns" (25 bytes, all ASCII) + "\n\n" (2 bytes) + 100 "a"
    // bytes, so the section's whole extent is 128 bytes — comfortably past the 40-byte bound.
    // Hand-computed (never derived here): the character-safe cut of an all-ASCII text lands on
    // exactly the byte bound, because every character is exactly one byte.
    const text = "## Cross-Feature Patterns\n\n" + "a".repeat(100) + "\n";
    const maxBytes = 40;

    const result = extractInjectableMaterial(text, maxBytes);

    expect(result.material).toBe("## Cross-Feature Patterns\n\naaaaaaaaaaaaa");
    expect(result.bytes).toBe(40);
    expect(result.bounded).toBe(true);
    expect(result.sections).toEqual(["Cross-Feature Patterns"]);
  });

  test("LI-AT-12: character-safe cut — multi-byte fixture, the cut backs off before splitting ≤ rather than landing exactly on the bound", async () => {
    const { extractInjectableMaterial } = await import(DEV_MODULE_PATH);

    // Fixture: "## Cross-Feature Patterns" (25 bytes) + "\n\n" (2 bytes) + 38 "b" bytes = 65
    // bytes, then the multi-byte codepoint "≤" (3 UTF-8 bytes), then more filler. At a
    // 66-byte bound, admitting one more ASCII byte would be legal in isolation, but the next
    // character in the text is the 3-byte "≤" (65 + 3 = 68 > 66), so a character-safe cut
    // must stop BEFORE it rather than splitting its UTF-8 encoding — contributed bytes land at
    // 65, strictly less than the 66-byte bound (hand-computed, never derived here).
    const text = "## Cross-Feature Patterns\n\n" + "b".repeat(38) + "≤" + "c".repeat(20) + "\n";
    const maxBytes = 66;

    const result = extractInjectableMaterial(text, maxBytes);

    expect(result.material).toBe("## Cross-Feature Patterns\n\n" + "b".repeat(38));
    expect(result.bytes).toBe(65);
    expect(result.bytes).toBeLessThanOrEqual(maxBytes);
    expect(result.bounded).toBe(true);
    expect(result.sections).toEqual(["Cross-Feature Patterns"]);

    // The cut never splits the multi-byte codepoint: re-decoding the material through UTF-8
    // round-trips without a replacement character (TSPEC T-O-6's char-safety property, pinned
    // here at the example level).
    expect(result.material).not.toContain("�");
    expect(Buffer.from(result.material, "utf8").toString("utf8")).toBe(result.material);
  });

  test("LI-AT-12: character-safe cut — TWO sections, the bound landing inside the SECOND section's heading: the cut is over the assembled string, not per section", async () => {
    const { extractInjectableMaterial } = await import(DEV_MODULE_PATH);

    // CR round 1, TE F-06 (Medium). Both LI-AT-12 cases above use single-section fixtures, so
    // the multi-section arm of the cut — the one place FSPEC and TSPEC disagree — had no oracle
    // at all. TSPEC §D.3 rule 3 is explicit: "Then, and only then, cut. §D.5's character-safe
    // cut applies to the assembled string, not to each extent — so `bounded` and `bytes` are
    // properties of one string and E-16's 'first section alone exceeds the bound' is the same
    // rule, not a special case." FSPEC BR-6 §"How the per-document bound binds" instead reads
    // section-granular for sections 2+ ("sections are taken in priority order until the next one
    // would exceed ...; the remaining sections are omitted"), which would drop section 2 whole
    // here. The implementation follows TSPEC; the divergence is routed upstream as
    // `ERRATUM: FSPEC`, and this test pins the behaviour that is actually shipped so that a
    // later reconciliation cannot change it silently.
    //
    // Hand-computed from the fixture alone, never derived from the function (DC-14):
    //   normalised section 1 = "## 2. Cross-Feature Patterns" (28) + "\n\n" (2) + 20 "a" = 50
    //   normalised section 2 = "## 3. Non-Convergences"       (22) + "\n\n" (2) + 20 "b" = 44
    //   assembled            = 50 + 2 (the "\n\n" join) + 44                             = 96
    // At a 60-byte bound the cut lands 8 bytes into section 2's own heading line: 50 + 2 = 52
    // bytes of section 1 and its join, then "## 3. No" — 8 more, 60 exactly, every byte ASCII.
    const text =
      "## 2. Cross-Feature Patterns\n\n" + "a".repeat(20) +
      "\n\n## 3. Non-Convergences\n\n" + "b".repeat(20) + "\n";
    const maxBytes = 60;

    const result = extractInjectableMaterial(text, maxBytes);

    // The literal cut, transcribed — including the truncated heading. This is the string an
    // author's prompt receives, and asserting it as a literal is the only way a change from
    // "cut the assembled string" to "omit the whole overflowing section" reds here.
    expect(result.material).toBe(
      "## 2. Cross-Feature Patterns\n\n" + "a".repeat(20) + "\n\n## 3. No"
    );
    expect(result.bytes).toBe(60);
    expect(result.bytes).toBeLessThanOrEqual(maxBytes);
    expect(result.bounded).toBe(true);

    // §D.3: a section is a member of `sections[]` iff at least one byte of its normalised text
    // survives in `material`. Eight bytes of section 2 survive, so BOTH names are members even
    // though section 2 kept none of its body — set equality in priority order, not containment.
    expect(result.sections).toEqual(["Cross-Feature Patterns", "Non-Convergences"]);

    // The control that the fixture really does exercise the multi-section path: unbounded, the
    // same text yields both whole sections and 96 bytes, so the 60 above is the cut's doing and
    // not the fixture's.
    const unbounded = extractInjectableMaterial(text, 100000);
    expect(unbounded.bytes).toBe(96);
    expect(unbounded.bounded).toBe(false);
    expect(unbounded.sections).toEqual(["Cross-Feature Patterns", "Non-Convergences"]);
  });
});
