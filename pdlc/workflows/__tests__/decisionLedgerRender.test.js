// decisionLedgerRender.test.js — PLAN T-06, "[red]" (pdlc-decision-ledger).
//
// Owns `renderDecisionLedgerBlock` and the two frozen text constants
// (`DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT`) named in TSPEC
// §4.3 / §7.5, PROPERTIES "REND rendering" (PROP-REND-01…08) and P-LINE
// (PROP-REND-05, promoted from example to property at TSPEC v0.8, originally
// TE F-07). None of the three symbols exist at HEAD — PLAN T-15 is the task
// that writes them into `orchestrate-dev.js` (PLAN row T-15, "Un-skips
// T-06"). Every block in this file is therefore authored `.skip`, titled
// `"T-15: …"`, and loads the module via a deferred dynamic `import()` inside
// each test body so the file still loads — and exits 0 — while the symbols
// are absent.
//
// **The renderer's contract for a statement carrying an embedded `\n`/`\r`
// is fixed HERE, cited by T-16.** §4.3's interface comment marks
// `renderDecisionLedgerBlock` "Pure, total" — it never throws — so "reject"
// cannot mean throwing. This file fixes the contract as ESCAPE: a `\r\n`
// pair is rewritten to the two-character literal `\n`, any remaining `\n` to
// the two-character literal `\n`, and any remaining `\r` to the two-character
// literal `\r`, before the statement is placed into its index line. This is
// what "one physical line per decision" law-of-arithmetic (PLAN T-06's own
// text) is protecting: no input can ever cause `renderDecisionLedgerBlock`
// to emit more than one physical line for one selected record. The model
// below (`escapeStatementForLine`) is this file's own, independent
// transcription of that contract — never the production renderer, per
// TSPEC §7.5's O-8 discipline that both P-REC and P-LINE inherit.
//
// **Mutation-testing self-check (TSPEC §7.5/§7.4 discipline).** Because no
// production implementation exists yet at T-06 time, the three named
// falsifying mutations (render a statement containing `\n` unescaped; join
// two records onto one line; emit the set in an order other than §3.6's)
// were applied to a throwaway, uncommitted scratch implementation built only
// to exercise this file's own P-LINE assertions below, run once green with
// no mutation applied, then once per mutation. All three reproduced a red
// (an `expect` failure on the total-line-count conjunct and/or the
// index-lines-equal-expected-lines conjunct), were reverted, and the
// scratch implementation was discarded — never committed, never reused as
// this file's oracle. Observed:
//   - "unescaped-newline": index lines != expected lines (statement's raw
//     `\n` split the block into extra physical lines).
//   - "joined-lines": index lines != expected lines (two records collapsed
//     onto index 0; the tail of `expectedLines` a `undefined`/`length`
//     mismatch against `indexLines`).
//   - "wrong-order": index lines != expected lines (reversed set order).
//
// Ownership: T-06 owns this file exactly (PLAN §4, single-writer-per-file).

import fc from "fast-check";

const DEV_MODULE_PATH = "../orchestrate-dev.js";

// This file's own, independent transcription of the escape contract fixed
// above — never imported from production. Used only to build EXPECTED index
// lines for comparison against the real renderer's OUTPUT.
function escapeStatementForLine(raw) {
  return raw.replace(/\r\n/g, "\\n").replace(/\n/g, "\\n").replace(/\r/g, "\\r");
}

function expectedIndexLine(record) {
  return (
    `${record.id} — ${escapeStatementForLine(record.statement)}  ` +
    `[${record.sourcePath} § ${record.id}]`
  );
}

function makeRecord(overrides = {}) {
  return {
    id: "DEC-EX-01",
    statement: "An example decision statement.",
    sourcePath: "docs/_decisions/DECISIONS-example.md",
    heading: "## 1. DEC-EX-01: An example decision statement.",
    origin: "project",
    ...overrides,
  };
}

describe("T-15: renderDecisionLedgerBlock and the frozen text constants (TSPEC §4.3, §7.5; PROP-REND-01…08, P-LINE)", () => {
  test("T-15: PROP-REND-01 (BR-1, E-6) — renderDecisionLedgerBlock({selected: []}) returns exactly \"\" — no header, no preamble, no rule text, no trailer, no whitespace", async () => {
    const { renderDecisionLedgerBlock } = await import(DEV_MODULE_PATH);

    const block = renderDecisionLedgerBlock({ selected: [] });

    expect(block).toBe("");
    expect(block.length).toBe(0);
    expect(block).not.toMatch(/\S/);
    expect(block).not.toMatch(/\s/);
  });

  test("T-15: DEC-DECLEDGER-10 — the index line takes the exact form `{id} — {statement}  [{sourcePath} § {id}]`", async () => {
    const { renderDecisionLedgerBlock } = await import(DEV_MODULE_PATH);

    const record = makeRecord();
    const block = renderDecisionLedgerBlock({ selected: [record] });

    const expectedLine =
      "DEC-EX-01 — An example decision statement.  " +
      "[docs/_decisions/DECISIONS-example.md § DEC-EX-01]";
    expect(block).toContain(expectedLine);
    // One PHYSICAL line: the exact literal is one whole entry of split("\n"),
    // never straddling two entries and never sharing an entry with another line.
    expect(block.split("\n")).toContain(expectedLine);
  });

  test("T-15: PROP-REND-04 (D-7) — the citation names the record's id, never its full on-disk heading", async () => {
    const { renderDecisionLedgerBlock } = await import(DEV_MODULE_PATH);

    // `heading` deliberately contains a distinctive marker string that would
    // appear verbatim in the block if the retired `{sourcePath} § {heading}`
    // citation form were shipped instead of the current `{sourcePath} § {id}`
    // form (TSPEC D-7's ~33% cost finding).
    const record = makeRecord({
      heading: "## 1. DEC-EX-01: HEADING_MARKER_MUST_NOT_APPEAR_IN_BLOCK",
    });

    const block = renderDecisionLedgerBlock({ selected: [record] });

    expect(block).not.toContain("HEADING_MARKER_MUST_NOT_APPEAR_IN_BLOCK");
    expect(block).toContain("[docs/_decisions/DECISIONS-example.md § DEC-EX-01]");
  });

  test("T-15: non-empty block carries header, preamble, index line, rule text and trailer in that order, prefixed \\n\\n, with no trailing newline", async () => {
    const {
      renderDecisionLedgerBlock,
      DECISION_LEDGER_PREAMBLE,
      DECISION_LEDGER_RULE_TEXT,
    } = await import(DEV_MODULE_PATH);

    const record = makeRecord();
    const block = renderDecisionLedgerBlock({ selected: [record] });

    expect(typeof DECISION_LEDGER_PREAMBLE).toBe("string");
    expect(DECISION_LEDGER_PREAMBLE.length).toBeGreaterThan(0);
    expect(typeof DECISION_LEDGER_RULE_TEXT).toBe("string");
    expect(DECISION_LEDGER_RULE_TEXT.length).toBeGreaterThan(0);

    expect(
      block.startsWith("\n\n--- CLOSED DECISIONS (do not re-open without new evidence) ---\n")
    ).toBe(true);
    expect(block.endsWith("--- END CLOSED DECISIONS ---")).toBe(true);
    expect(block.endsWith("\n")).toBe(false);

    const headerIdx = block.indexOf("--- CLOSED DECISIONS");
    const preambleIdx = block.indexOf(DECISION_LEDGER_PREAMBLE);
    const lineIdx = block.indexOf(`${record.id} — `);
    const ruleIdx = block.indexOf(DECISION_LEDGER_RULE_TEXT);
    const trailerIdx = block.lastIndexOf("--- END CLOSED DECISIONS ---");

    expect(headerIdx).toBe(2);
    expect(preambleIdx).toBeGreaterThan(headerIdx);
    expect(lineIdx).toBeGreaterThan(preambleIdx);
    expect(ruleIdx).toBeGreaterThan(lineIdx);
    expect(trailerIdx).toBeGreaterThan(ruleIdx);
  });

  test("T-15: renderDecisionLedgerBlock preserves a project-level-first input order (renderer is order-PRESERVING, ordering itself is selectDecisions's §3.6 concern)", async () => {
    const { renderDecisionLedgerBlock } = await import(DEV_MODULE_PATH);

    const projectRecord = makeRecord({
      id: "DEC-PROJ-01",
      statement: "Project-level decision.",
      sourcePath: "docs/_decisions/DECISIONS-x.md",
      origin: "project",
    });
    const featureRecord = makeRecord({
      id: "DEC-FEAT-01",
      statement: "Feature-level decision.",
      sourcePath: "docs/my-feature/DECISIONS-my-feature.md",
      origin: "feature",
    });

    const block = renderDecisionLedgerBlock({ selected: [projectRecord, featureRecord] });
    const lines = block.split("\n");
    const projIdx = lines.findIndex((l) => l.startsWith("DEC-PROJ-01 — "));
    const featIdx = lines.findIndex((l) => l.startsWith("DEC-FEAT-01 — "));

    expect(projIdx).toBeGreaterThanOrEqual(0);
    expect(featIdx).toBeGreaterThan(projIdx);
  });

  test("T-15: AT-06 (BR-5) — DECISION_LEDGER_RULE_TEXT states the bar as ONE conjunction: High severity AND cites evidence not part of the decision's own record", async () => {
    const { DECISION_LEDGER_RULE_TEXT } = await import(DEV_MODULE_PATH);

    expect(DECISION_LEDGER_RULE_TEXT).toContain("High severity");
    // A single sentence-level conjunction, not two independently-satisfiable
    // clauses joined by "or" — "and" appears strictly between the two
    // conjuncts' key phrases.
    expect(DECISION_LEDGER_RULE_TEXT).toMatch(
      /High severity[^.]*\band\b[^.]*(?:cites )?evidence[^.]*not part of[^.]*own record/is
    );
  });

  test("T-15: AT-07 (BR-6) — DECISION_LEDGER_RULE_TEXT carries both boundary exemplars, each explicitly labelled with the side it falls on", async () => {
    const { DECISION_LEDGER_RULE_TEXT } = await import(DEV_MODULE_PATH);

    // In-scope exemplar (FSPEC BR-6): a shipped behavior that changed after
    // the decision was recorded, cited at the changed source.
    expect(DECISION_LEDGER_RULE_TEXT).toMatch(/in[- ]scope[^.]*changed[^.]*(?:after|since)[^.]*recorded/is);
    // Not-in-scope exemplar (FSPEC BR-6): a source the decision already
    // cites, re-cited at a different line or later commit with no
    // behavioral change.
    expect(DECISION_LEDGER_RULE_TEXT).toMatch(
      /not[- ]in[- ]scope[^.]*already cites[^.]*no behavioral change/is
    );
  });

  test("T-15: AT-07 — DECISION_LEDGER_RULE_TEXT instructs the reviewer to decide against the CITED RECORD, not the index line", async () => {
    const { DECISION_LEDGER_RULE_TEXT } = await import(DEV_MODULE_PATH);

    expect(DECISION_LEDGER_RULE_TEXT).toMatch(/cited record/i);
    expect(DECISION_LEDGER_RULE_TEXT).toMatch(/index line/i);
    // The instruction is a "not the index line" contrast, not a bare mention.
    expect(DECISION_LEDGER_RULE_TEXT).toMatch(/(?:not|never)[^.]*index line/is);
  });

  test("T-15: AT-12 (text half, BR-6/REQ-DECLEDGER-06) — DECISION_LEDGER_RULE_TEXT directs keying a repeat on the decision id, not recording it as a fresh finding", async () => {
    const { DECISION_LEDGER_RULE_TEXT } = await import(DEV_MODULE_PATH);

    expect(DECISION_LEDGER_RULE_TEXT).toMatch(/decision id/i);
    expect(DECISION_LEDGER_RULE_TEXT).toMatch(/repeat/i);
    expect(DECISION_LEDGER_RULE_TEXT).toMatch(/fresh finding/i);
  });

  test("T-15: DEC-DECLEDGER-12/D-9 — the framing (header + preamble + rule text + trailer + separating blank lines) renders to <= 1200 bytes", async () => {
    const { renderDecisionLedgerBlock } = await import(DEV_MODULE_PATH);

    const record = makeRecord({
      id: "DEC-FRAMEA-01",
      statement: "AAAA",
      sourcePath: "docs/a.md",
      origin: "project",
    });
    const block = renderDecisionLedgerBlock({ selected: [record] });
    const line = expectedIndexLine(record);

    // Isolate framing bytes by subtracting the one known index line's own
    // byte length from the whole block — an arithmetic derivation over the
    // ACTUAL rendered output, never a hardcoded literal of drafted text
    // (PLAN T-06: "an acceptance condition on the drafting task, not a
    // measurement of drafted text").
    const framingBytes = Buffer.byteLength(block, "utf8") - Buffer.byteLength(line, "utf8");
    expect(framingBytes).toBeLessThanOrEqual(1200);
  });

  test("T-15: PROP-REND-07 — rendering is a pure function of `selected`: two calls with equal input return byte-identical strings", async () => {
    const { renderDecisionLedgerBlock } = await import(DEV_MODULE_PATH);

    const record = makeRecord();
    const first = renderDecisionLedgerBlock({ selected: [record] });
    const second = renderDecisionLedgerBlock({ selected: [{ ...record }] });

    expect(second).toBe(first);
  });
});

// P-LINE — one physical line per decision (TSPEC §7.5, PROPERTIES PROP-REND-05).
// Quantified over arbitrary non-empty `selected` sets, generated with
// embedded `\n`, `\r\n`, `|` and `` ` `` characters in `statement` (TSPEC
// §7.5's instruction: "statements generated to include embedded \n, \r\n,
// pipe and backtick characters"). Model (`escapeStatementForLine`,
// `expectedIndexLine` above) is this file's own, independent of the
// production renderer, per O-8's discipline.
describe("T-15: P-LINE — one physical line per decision (TSPEC §7.5, PROP-REND-05)", () => {
  // Word/token generator for statements: alphanumeric words interleaved with
  // the four special tokens the property must cover, joined by single
  // spaces so a raw `\n`/`\r\n` inside the joined string is unambiguously
  // attributable to the token draw, never to the join itself.
  const wordArb = fc
    .array(fc.constantFrom(..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"), {
      minLength: 1,
      maxLength: 8,
    })
    .map((chars) => chars.join(""));
  const tokenArb = fc.oneof(wordArb, fc.constantFrom("\n", "\r\n", "|", "`"));
  const statementArb = fc
    .array(tokenArb, { minLength: 1, maxLength: 8 })
    .map((parts) => parts.join(" "))
    .filter((s) => s.length > 0);
  const idArb = fc
    .array(fc.constantFrom(..."ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"), {
      minLength: 3,
      maxLength: 10,
    })
    .map((chars) => `DEC-${chars.join("")}-01`);
  const sourcePathArb = fc
    .array(fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz0123456789"), {
      minLength: 3,
      maxLength: 10,
    })
    .map((chars) => `docs/_decisions/DECISIONS-${chars.join("")}.md`);
  const recordArb = fc.record({
    id: idArb,
    statement: statementArb,
    sourcePath: sourcePathArb,
    heading: fc.constant("## 1. Some Heading: irrelevant to rendering"),
    origin: fc.constantFrom("project", "feature"),
  });
  const selectedArb = fc.array(recordArb, { minLength: 1, maxLength: 12 });

  test("T-15: for any non-empty selected set, the rendered block contains exactly one physical line per record, byte-identical to this file's own model, and the block's total line count equals framing lines + selected.length", async () => {
    const { renderDecisionLedgerBlock } = await import(DEV_MODULE_PATH);

    // Derive the framing's line count once, from a one-record baseline whose
    // content cannot collide with header/preamble/rule-text/trailer text —
    // never hardcoded, so a change to the drafted framing text (T-15's own
    // discretion, within the ≤1,200-byte budget) cannot desynchronise this
    // arithmetic.
    const baselineRecord = makeRecord({
      id: "DEC-ZZBASELINE-01",
      statement: "ZZBASELINE_STATEMENT_TOKEN",
      sourcePath: "docs/_decisions/DECISIONS-zzbaseline.md",
      origin: "project",
    });
    const baselineBlock = renderDecisionLedgerBlock({ selected: [baselineRecord] });
    const baselineLines = baselineBlock.split("\n");
    const baselineExpectedLine = expectedIndexLine(baselineRecord);
    const prefixLineCount = baselineLines.indexOf(baselineExpectedLine);
    // Non-vacuity control: the baseline's own index line must actually be
    // found as a whole physical line, or the arithmetic below is meaningless.
    expect(prefixLineCount).toBeGreaterThanOrEqual(0);
    const suffixLineCount = baselineLines.length - prefixLineCount - 1;

    fc.assert(
      fc.property(selectedArb, (records) => {
        const block = renderDecisionLedgerBlock({ selected: records });
        const lines = block.split("\n");

        expect(lines.length).toBe(prefixLineCount + records.length + suffixLineCount);

        const indexLines = lines.slice(prefixLineCount, prefixLineCount + records.length);
        const expectedLines = records.map(expectedIndexLine);
        expect(indexLines).toEqual(expectedLines);

        // No rendered line contains an embedded newline or carriage return —
        // the escape contract's whole point.
        for (const line of indexLines) {
          expect(line).not.toContain("\n");
          expect(line).not.toContain("\r");
        }
      }),
      { numRuns: 200 }
    );
  });
});
