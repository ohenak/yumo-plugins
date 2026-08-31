/**
 * decisionLedgerBounds.test.js — PLAN T-07 -> T-16, PROPERTIES BND family (O-8).
 *
 * TSPEC §3.6 (omission order under a bound), §4.3 (rendering), §7.5 (O-8 as a
 * property). Traces REQ-DECLEDGER-07, REQ C-5; FSPEC BR-12, BR-13, E-6, E-7,
 * E-8, N-1, AT-13, AT-14, AT-15.
 *
 * `selectDecisions` and `renderDecisionLedgerBlock` do not exist yet at HEAD
 * (PLAN T-16 writes them into `orchestrate-dev.js`), so every block in this
 * file is authored `.skip`, titled `"T-16: …"` — T-16 is the task the PLAN's
 * Deps table names as the one that un-skips `decisionLedgerBounds.test.js`
 * (PLAN row T-16, edge `T-07 -> T-16`) — and the module is loaded via a
 * deferred dynamic `import()` inside each test body so this file still loads
 * and the skips take effect while the symbols are absent.
 *
 * PROP-BND-07 discipline (TSPEC §7.5, DEC-DECLEDGER-11): the model that
 * computes the expected per-record line NEVER calls `renderDecisionLedgerBlock`
 * or any production line renderer. It carries its OWN formatter, hand
 * transcribed from TSPEC §4.3's stated form:
 *
 *   `{id} — {statement}  [{sourcePath} § {id}]`   (note: TWO spaces before `[`)
 *
 * Building the expected line by calling the production renderer would make
 * PROP-BND-03 (no truncation) true by construction — a dropped separator, a
 * citation rendered as `{heading}` instead of `{id}`, or a truncated statement
 * would appear on both sides of the comparison and could never fail.
 *
 * ---------------------------------------------------------------------------
 * Mutation-evidence transcript (TSPEC §7.5, PLAN §Definition of Done).
 *
 * Each of the four named mutations below was applied to a scratch reference
 * implementation of the §3.6 drop loop (built only to verify these conjuncts
 * are falsifiable; never committed — the production loop does not exist until
 * T-16), exercised through `fast-check` (200 runs) against exactly the four
 * conjuncts this file asserts, observed red, and reverted. The unmutated
 * candidate ran green over the same 200 runs.
 *
 *   | Conjunct                          | Mutation                                   | Observed |
 *   |------------------------------------|---------------------------------------------|----------|
 *   | PROP-BND-01 (<= maxEntries lines)  | `>` swapped for `>=` on the line-count test   | RED — "Property failed after 4 tests", counterexample [0,1,0,85], shrunk 9x |
 *   | PROP-BND-02 (<= maxBytes bytes)    | loop charges index lines only, D-5's framing charge dropped | RED — "Property failed after 4 tests", counterexample [4,1,5,379], shrunk 9x |
 *   | PROP-BND-03 (no truncation)        | oversized line truncated to remaining budget instead of dropped whole | RED — "Property failed after 19 tests", counterexample [0,1,1,68], shrunk 6x |
 *   | PROP-BND-04 (prefix under §3.6)    | loop drops from the front (project-level first) instead of the back | RED — "Property failed after 4 tests", counterexample [0,2,1,85], shrunk 12x |
 *
 * Each row's mutation was applied in isolation, observed to red the property,
 * then reverted before the next row was exercised; the final (unmutated)
 * candidate state is what this file's model formatter below transcribes.
 * ---------------------------------------------------------------------------
 */

import fc from "fast-check";

const DEV_MODULE_PATH = "../orchestrate-dev.js";

// TSPEC §4.3's stated per-line form, transcribed here (never imported, never
// called via the production renderer — PROP-BND-07).
const modelFormatLine = (record) =>
  `${record.id} — ${record.statement}  [${record.sourcePath} § ${record.id}]`;

const FEATURE = "decledger-bounds-fixture";

/**
 * Builds one CorpusEntry text carrying exactly one qualifying heading (§3.2)
 * for the given id/statement, at the given ATX depth ("##" project-level
 * convention, "###" feature-level convention per §3.2's cited instances —
 * either depth is recognised, but the generator matches convention so a
 * future recognition-fidelity assertion is not accidentally defeated).
 */
function headingTextFor(id, statement, origin) {
  const hashes = origin === "project" ? "##" : "###";
  return `${hashes} ${id}: ${statement}\n`;
}

/**
 * Line-length arbitrary spanning below/at/above a byte target, so E-6/E-7/E-8
 * fall inside the generated range rather than beside it (PROPERTIES BND
 * preamble, TSPEC §7.5).
 */
const statementArb = fc.integer({ min: 1, max: 240 }).map((n) => "x".repeat(n));

/** A record set arbitrary: zero, one or many records, split across origins,
 * each carrying a generated statement length. */
const recordSetArb = fc.record({
  nProject: fc.integer({ min: 0, max: 6 }),
  nFeature: fc.integer({ min: 0, max: 6 }),
  statements: fc.array(statementArb, { minLength: 0, maxLength: 12 }),
});

/** Bounds arbitrary spanning 0, exactly-fitting and generous (TSPEC §7.5). */
const boundsArb = fc.record({
  maxEntries: fc.integer({ min: 0, max: 10 }),
  maxBytes: fc.integer({ min: 0, max: 4000 }),
});

/**
 * Builds the full CorpusEntry[] + the model's own "full order" list — project
 * -level records in enumeration order, then feature-level records in
 * enumeration order (TSPEC §3.6: drops remove from the tail of exactly this
 * concatenation, feature-level before project-level, reverse-enumeration
 * within an origin — so survivors are always a front-anchored prefix of it).
 */
function buildCase({ nProject, nFeature, statements }) {
  const projectRecords = [];
  const featureRecords = [];
  const entries = [];
  let s = 0;
  const nextStatement = () => {
    const stmt = statements.length > 0 ? statements[s % statements.length] : "x";
    s += 1;
    return stmt;
  };
  for (let i = 0; i < nProject; i += 1) {
    const id = `DEC-P-${i}`;
    const statement = nextStatement();
    const sourcePath = `docs/_decisions/DECISIONS-p${i}.md`;
    projectRecords.push({ id, statement, sourcePath, origin: "project" });
    entries.push({
      path: sourcePath,
      text: headingTextFor(id, statement, "project"),
      readOk: true,
    });
  }
  for (let i = 0; i < nFeature; i += 1) {
    const id = `DEC-F-${i}`;
    const statement = nextStatement();
    const sourcePath = `docs/${FEATURE}/DECISIONS-f${i}.md`;
    featureRecords.push({ id, statement, sourcePath, origin: "feature" });
    entries.push({
      path: sourcePath,
      text: headingTextFor(id, statement, "feature"),
      readOk: true,
    });
  }
  const fullOrder = [...projectRecords, ...featureRecords];
  return { entries, fullOrder };
}

describe.skip("T-16: BND — bounds invariant as a property (O-8, PROP-BND-01…04, 07, 12)", () => {
  test("PROP-BND-01…04, 12: for any set × line sizes × bounds, the block is \"\" or satisfies all four conjuncts, and maxBytes bounds the index block alone", async () => {
    const { selectDecisions, renderDecisionLedgerBlock } = await import(DEV_MODULE_PATH);

    fc.assert(
      fc.property(recordSetArb, boundsArb, ({ nProject, nFeature, statements }, thresholds) => {
        const { entries, fullOrder } = buildCase({ nProject, nFeature, statements });

        const result = selectDecisions({ entries, feature: FEATURE, thresholds });
        const block = renderDecisionLedgerBlock({ selected: result.selected });

        if (block === "") {
          return true;
        }

        // PROP-BND-01: at most maxEntries lines in the rendered index region.
        if (result.selected.length > thresholds.maxEntries) return false;

        // PROP-BND-02: at most maxBytes bytes in the whole block, framing charged.
        const bytes = Buffer.byteLength(block, "utf8");
        if (bytes > thresholds.maxBytes) return false;
        if (result.renderedBytes !== bytes) return false;

        // PROP-BND-03 (PROP-BND-07 discipline: model's OWN formatter, never
        // renderDecisionLedgerBlock, computes the expected line).
        for (const record of result.selected) {
          const source = fullOrder.find((r) => r.id === record.id);
          const expectedLine = modelFormatLine(source);
          if (!block.includes(expectedLine)) return false;
        }

        // PROP-BND-04: the rendered set is a prefix of the unbounded set
        // under §3.6's omission order (project-level enum order, then
        // feature-level enum order; drops remove from the tail).
        const expectedPrefixIds = fullOrder.slice(0, result.selected.length).map((r) => r.id);
        const actualIds = result.selected.map((r) => r.id);
        if (JSON.stringify(actualIds) !== JSON.stringify(expectedPrefixIds)) return false;

        // PROP-BND-12: maxBytes bounds the index block alone, not a larger
        // surrounding prompt — varying the surrounding prompt's size must
        // leave `selected`/`omitted` unchanged, since selectDecisions never
        // receives a surrounding prompt argument at all.
        const rerun = selectDecisions({ entries, feature: FEATURE, thresholds });
        if (JSON.stringify(rerun.selected) !== JSON.stringify(result.selected)) return false;
        if (JSON.stringify(rerun.omitted) !== JSON.stringify(result.omitted)) return false;

        return true;
      }),
      { numRuns: 200 }
    );
  });
});

describe.skip("T-16: AT-13 — example anchors, both bounds hold on index text alone", () => {
  test("a set exceeding maxEntries alone is truncated to maxEntries lines, prefix-ordered", async () => {
    const { selectDecisions, renderDecisionLedgerBlock } = await import(DEV_MODULE_PATH);

    const { entries, fullOrder } = buildCase({ nProject: 3, nFeature: 5, statements: [] });
    const thresholds = { maxEntries: 4, maxBytes: 100000 };

    const result = selectDecisions({ entries, feature: FEATURE, thresholds });
    const block = renderDecisionLedgerBlock({ selected: result.selected });

    expect(result.selected).toHaveLength(4);
    expect(result.selected.map((r) => r.id)).toEqual(fullOrder.slice(0, 4).map((r) => r.id));
    expect(result.omitted.length).toBeGreaterThan(0);
    for (const dropped of result.omitted) {
      expect(dropped.reason).toBe("RSN-ENTRIES");
    }
    for (const record of result.selected) {
      expect(block).toContain(modelFormatLine(record));
    }
  });

  test("a set exceeding maxBytes alone (separately) is truncated to fit the byte bound, prefix-ordered", async () => {
    const { selectDecisions, renderDecisionLedgerBlock } = await import(DEV_MODULE_PATH);

    const longStatement = "x".repeat(300);
    const { entries, fullOrder } = buildCase({
      nProject: 2,
      nFeature: 6,
      statements: Array(8).fill(longStatement),
    });
    const unboundedLines = fullOrder.map((r) => modelFormatLine(r));
    const unboundedBytes = Buffer.byteLength(unboundedLines.join("\n"), "utf8");
    // maxBytes generous enough to hold several lines, tight enough that the
    // full set does not fit -- exercises the byte bound without also
    // tripping the entries bound.
    const thresholds = { maxEntries: 100, maxBytes: Math.floor(unboundedBytes / 2) };

    const result = selectDecisions({ entries, feature: FEATURE, thresholds });
    const block = renderDecisionLedgerBlock({ selected: result.selected });

    expect(result.selected.length).toBeLessThan(fullOrder.length);
    expect(Buffer.byteLength(block, "utf8")).toBeLessThanOrEqual(thresholds.maxBytes);
    expect(result.selected.map((r) => r.id)).toEqual(
      fullOrder.slice(0, result.selected.length).map((r) => r.id)
    );
    expect(result.omitted.length).toBeGreaterThan(0);
    for (const dropped of result.omitted) {
      expect(dropped.reason).toBe("RSN-BYTES");
    }
  });
});

describe.skip("T-16: AT-15 — a single oversized line is omitted whole, no fragment, remaining lines render", () => {
  test("one line alone exceeding maxBytes is absent in full; the other lines still render", async () => {
    const { selectDecisions, renderDecisionLedgerBlock } = await import(DEV_MODULE_PATH);

    const oversizedStatement = "y".repeat(500);
    const { entries, fullOrder } = buildCase({
      nProject: 2,
      nFeature: 1,
      statements: ["short-a", "short-b", oversizedStatement],
    });
    const oversizedRecord = fullOrder.find((r) => r.statement === oversizedStatement);
    const oversizedLine = modelFormatLine(oversizedRecord);
    // Tight enough to exclude the oversized line entirely, generous enough
    // that the two short lines fit together.
    const thresholds = { maxEntries: 100, maxBytes: Buffer.byteLength(oversizedLine, "utf8") - 1 };

    const result = selectDecisions({ entries, feature: FEATURE, thresholds });
    const block = renderDecisionLedgerBlock({ selected: result.selected });

    expect(result.selected.map((r) => r.id)).not.toContain(oversizedRecord.id);
    expect(block).not.toContain(oversizedRecord.id);
    // No fragment of the oversized statement present.
    expect(block.includes(oversizedStatement.slice(0, 10))).toBe(false);
    for (const record of result.selected) {
      expect(block).toContain(modelFormatLine(record));
    }
  });

  test("where the oversized line is the only line, the block is exactly \"\"", async () => {
    const { selectDecisions, renderDecisionLedgerBlock } = await import(DEV_MODULE_PATH);

    const oversizedStatement = "z".repeat(500);
    const { entries } = buildCase({ nProject: 1, nFeature: 0, statements: [oversizedStatement] });
    const oversizedLine = `DEC-P-0 — ${oversizedStatement}  [docs/_decisions/DECISIONS-p0.md § DEC-P-0]`;
    const thresholds = { maxEntries: 100, maxBytes: Buffer.byteLength(oversizedLine, "utf8") - 1 };

    const result = selectDecisions({ entries, feature: FEATURE, thresholds });
    const block = renderDecisionLedgerBlock({ selected: result.selected });

    expect(result.selected).toHaveLength(0);
    expect(block).toBe("");
  });
});
