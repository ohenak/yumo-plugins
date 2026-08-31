// decisionLedgerRecognise.test.js — PLAN T-05 (RED), greened and un-skipped by T-14.
//
// `recogniseDecisionRecords(text, sourcePath)` does not exist in `orchestrate-dev.js` until
// T-14 defines it, so the whole suite below is committed inside a single
// `describe.skip("T-14: …", …)` block — every assertion in this file belongs to T-14, so one
// wrapping `describe.skip` is used rather than per-block skips (per the wave-gate skip rule).
// T-14's first action is to remove exactly this wrapper, observe the red, then implement until
// green — never delete this block or add a new one beside it. The `orchestrate-dev.js` import
// is deferred to a dynamic `await import` inside each test body so this file still loads
// cleanly today, with `recogniseDecisionRecords` absent from that module's exports.
//
// Covers TSPEC §3.2 (carrier markup + id grammar, five conjuncts), §3.3 (in-file last-record-
// wins resolution), BR-8/F-9 (null/empty/no-record text ⇒ `[]`, an ordinary empty result, not
// an error), and §7.5's `P-REC` property (promoted from example to property at TSPEC v0.8,
// originally TE F-07).
//
// Baseline instances cited per conjunct (§3.2's table):
//   - level 2–4 ATX headings: project-level `##` (`DECISIONS-loop-termination.md`'s
//     `DEC-TERM-01`), feature-level `###` (`DECISIONS-pdlc-engineering-loop.md`'s
//     `DEC-LOOP-01`)
//   - optional ordinal prefix, LOAD-BEARING: `DECISIONS-pdlc-engine-distribution.md`
//     (`## 2. DEC-EDIST-01: Vendor workflow modules build time, tarball only`) and
//     `DECISIONS-pdlc-consolidation-agent.md` (`## 3. DEC-CONS-01: …`) — without this
//     conjunct those two directories contribute 0 instead of 10 and 8, and the feature-level
//     total is 82, not `M-2e`'s 100
//   - namespace-plus-numeric id grammar excludes `M-4b`'s twelve namespace-less `DEC-01`…
//     `DEC-10` (`DECISIONS-pdlc-plugin-retirement.md`) and `M-4a`'s `DEC-AWG-Q1`
//     (`DECISIONS-pdlc-advisory-wave-gate.md`)
//   - id-opens-the-heading excludes `M-4d`'s four mid-heading back-references
//     (`DEC-A6-01`, prose token, not a record)
//   - separator `:` or `—` followed by a non-empty statement: `:` in deciding blocks, `—` in
//     question blocks; a heading with the id but no non-empty statement remainder is not a
//     record (BR-3)
//
// §3.3's last-wins Baseline instance: `M-3a`/`M-3c` —
// `docs/completed/pdlc-engineering-loop/DECISIONS-pdlc-engineering-loop.md` opens
// `DEC-LOOP-01` twice: first as a question (`### DEC-LOOP-01 — where does the session's state
// live?`), second as the outcome (`### DEC-LOOP-01: Session state travels in caller-echoed
// token, not a durable file`). Resolving on the LAST record satisfies BR-3's what-was-decided
// contract; resolving on the first does not.
//
// ── P-REC's O-8 mutation proof (TSPEC §7.5) ──────────────────────────────────────────────
//
// P-REC's independent model is NOT a second regex re-deriving DECISION_HEADING_RE — it is the
// generators' own construction bookkeeping: each generated heading component carries a
// validity flag decided at generation time (e.g. `levelOk`, `idOk`), and each generated
// "opening" carries its own id/statement/order, independent of whatever `recogniseDecisionRecords`
// does with them. The property assertions below compare the recogniser's output against that
// construction-time bookkeeping, never against a parallel parser.
//
// Before this file was committed, the four TSPEC-named falsifying mutations were applied to a
// throwaway spec-faithful reference implementation (never committed — deleted immediately
// after the proof) driven under the SAME property assertions committed below, each observed
// red, then reverted. Baseline (unmutated) reference: both properties GREEN over 300 runs.
//
//   (i)   admit out-of-depth heading (accept level 1 or 5, not just 2–4) — RED after 8 runs:
//         `{"hashes":"#","levelOk":false}` with id/sep/statement otherwise valid produced a
//         record where none was expected (property (i), the "iff all five conjuncts hold"
//         clause on the level conjunct).
//   (ii)  admit empty-statement heading — RED after 9 runs: `{"statement":"","statementOk":
//         false}` produced a record where none was expected (property (i), the non-empty-
//         statement conjunct).
//   (iii) normalise/trim the statement instead of slicing it verbatim — RED after both 59 runs
//         (property (i)'s verbatim-substring clause: a collapsed-whitespace statement like
//         `"A  a"` → `"A a"` is no longer a literal substring of the source line) and 1 run
//         (property (ii): collapsing whitespace changed which of two candidate statements the
//         comparison landed on).
//   (iv)  resolve duplicates first-wins instead of last-wins — RED after 2 runs:
//         `[{"num":1,"statement":"A"},{"num":1,"statement":"a"}]` resolved to the FIRST
//         opening's statement, not the last (property (ii), §3.3's law).
//
// All four mutations were caught, none silently passed; the reference implementation was
// discarded (this file never carries it) per O-8's "never the production recogniser" rule —
// T-14's real implementation is the only thing these assertions will ever run against once
// un-skipped.

import fc from "fast-check";

describe("T-14: recogniseDecisionRecords — TSPEC §3.2/§3.3, BR-8/F-9, §7.5 P-REC", () => {
  // ══════════════════════════════════════════════════════════════════════════
  // §3.2 — five conjuncts, one Baseline instance each
  // ══════════════════════════════════════════════════════════════════════════

  describe("§3.2 conjunct 1 — ATX heading, levels 2–4 only", () => {
    test("T-14: level-2 heading (project-level Baseline instance DEC-TERM-01) recognised", async () => {
      const { recogniseDecisionRecords } = await import("../orchestrate-dev.js");
      const text = "## DEC-TERM-01: Termination is scored on the finding ledger, not the transcript";
      const result = recogniseDecisionRecords(text, "docs/_decisions/DECISIONS-loop-termination.md");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("DEC-TERM-01");
    });

    test("T-14: level-3 heading (feature-level Baseline instance DEC-LOOP-01) recognised", async () => {
      const { recogniseDecisionRecords } = await import("../orchestrate-dev.js");
      const text = "### DEC-LOOP-01: Session state travels in caller-echoed token, not a durable file";
      const result = recogniseDecisionRecords(
        text,
        "docs/completed/pdlc-engineering-loop/DECISIONS-pdlc-engineering-loop.md"
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("DEC-LOOP-01");
    });

    test("T-14: level-1 and level-5 headings are out of depth, never recognised", async () => {
      const { recogniseDecisionRecords } = await import("../orchestrate-dev.js");
      expect(recogniseDecisionRecords("# DEC-TERM-01: too shallow", "f.md")).toEqual([]);
      expect(recogniseDecisionRecords("##### DEC-TERM-01: too deep", "f.md")).toEqual([]);
    });
  });

  describe("§3.2 conjunct 2 — optional ordinal prefix, load-bearing", () => {
    test("T-14: ordinal-prefixed heading (Baseline instance DEC-EDIST-01) recognised, prefix not part of id or statement", async () => {
      const { recogniseDecisionRecords } = await import("../orchestrate-dev.js");
      const text =
        "## 2. DEC-EDIST-01: Vendor workflow modules build time, tarball only";
      const result = recogniseDecisionRecords(
        text,
        "docs/pdlc-engine-distribution/DECISIONS-pdlc-engine-distribution.md"
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("DEC-EDIST-01");
      expect(result[0].statement).toBe("Vendor workflow modules build time, tarball only");
    });

    test("T-14: second ordinal-prefixed Baseline instance (DEC-CONS-01) also recognised", async () => {
      const { recogniseDecisionRecords } = await import("../orchestrate-dev.js");
      const text = "## 3. DEC-CONS-01: Consolidation runs project-level only";
      const result = recogniseDecisionRecords(
        text,
        "docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md"
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("DEC-CONS-01");
    });

    test("T-14: absent ordinal prefix does not block recognition (prefix is optional, not required)", async () => {
      const { recogniseDecisionRecords } = await import("../orchestrate-dev.js");
      const text = "## DEC-EDIST-01: Vendor workflow modules build time, tarball only";
      const result = recogniseDecisionRecords(text, "f.md");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("DEC-EDIST-01");
    });
  });

  describe("§3.2 conjunct 3 — namespace-plus-numeric id grammar", () => {
    test("T-14: namespace-less DEC-01…DEC-10 (M-4b, pdlc-plugin-retirement) never recognised", async () => {
      const { recogniseDecisionRecords } = await import("../orchestrate-dev.js");
      const text = Array.from({ length: 10 }, (_, i) => `## DEC-${String(i + 1).padStart(2, "0")}: some statement`).join(
        "\n"
      );
      const result = recogniseDecisionRecords(text, "docs/completed/pdlc-plugin-retirement/DECISIONS-pdlc-plugin-retirement.md");
      expect(result).toEqual([]);
    });

    test("T-14: non-numeric-tail id DEC-AWG-Q1 (M-4a, pdlc-advisory-wave-gate) never recognised", async () => {
      const { recogniseDecisionRecords } = await import("../orchestrate-dev.js");
      const text = "## DEC-AWG-Q1: Is the wave gate advisory-only?";
      const result = recogniseDecisionRecords(text, "docs/completed/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md");
      expect(result).toEqual([]);
    });

    test("T-14: well-formed namespaced id DEC-AWG-01 (same file, correct grammar) recognised", async () => {
      const { recogniseDecisionRecords } = await import("../orchestrate-dev.js");
      const text = "## DEC-AWG-01: Advisory tier never blocks the wave gate";
      const result = recogniseDecisionRecords(text, "f.md");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("DEC-AWG-01");
    });
  });

  describe("§3.2 conjunct 4 — id opens the heading, mid-heading back-references excluded", () => {
    test("T-14: mid-heading back-reference (M-4d, DEC-A6-01 as prose token) never recognised", async () => {
      const { recogniseDecisionRecords } = await import("../orchestrate-dev.js");
      const text = "### Revisiting DEC-A6-01 in light of the new evidence";
      const result = recogniseDecisionRecords(text, "f.md");
      expect(result).toEqual([]);
    });

    test("T-14: id-opens-the-heading form of the same id is recognised", async () => {
      const { recogniseDecisionRecords } = await import("../orchestrate-dev.js");
      const text = "### DEC-A6-01: Root-cause classification stays closed-vocabulary";
      const result = recogniseDecisionRecords(text, "f.md");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("DEC-A6-01");
    });
  });

  describe("§3.2 conjunct 5 — separator `:` or `—`, non-empty statement", () => {
    test("T-14: colon separator (deciding block) recognised", async () => {
      const { recogniseDecisionRecords } = await import("../orchestrate-dev.js");
      const result = recogniseDecisionRecords("## DEC-TERM-02: A decided statement", "f.md");
      expect(result).toHaveLength(1);
      expect(result[0].statement).toBe("A decided statement");
    });

    test("T-14: em-dash separator (question block) recognised", async () => {
      const { recogniseDecisionRecords } = await import("../orchestrate-dev.js");
      const result = recogniseDecisionRecords("### DEC-LOOP-01 — where does the session's state live?", "f.md");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("DEC-LOOP-01");
      expect(result[0].statement).toBe("where does the session's state live?");
    });

    test("T-14: heading with id but no separator, or separator with empty remainder, is not a record (BR-3)", async () => {
      const { recogniseDecisionRecords } = await import("../orchestrate-dev.js");
      expect(recogniseDecisionRecords("## DEC-TERM-03 no separator at all", "f.md")).toEqual([]);
      expect(recogniseDecisionRecords("## DEC-TERM-03:", "f.md")).toEqual([]);
      expect(recogniseDecisionRecords("## DEC-TERM-03:   ", "f.md")).toEqual([]);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // §3.3 — in-file last-record-wins resolution
  // ══════════════════════════════════════════════════════════════════════════

  describe("§3.3 — last-record-wins over a two-opening block (M-3a/M-3c Baseline instance)", () => {
    test("T-14: DEC-LOOP-01 opened as question then outcome resolves to the LAST (outcome) record", async () => {
      const { recogniseDecisionRecords } = await import("../orchestrate-dev.js");
      const text = [
        "### DEC-LOOP-01 — where does the session's state live?",
        "some intervening discussion text, not a record",
        "### DEC-LOOP-01: Session state travels in caller-echoed token, not a durable file",
      ].join("\n");
      const result = recogniseDecisionRecords(
        text,
        "docs/completed/pdlc-engineering-loop/DECISIONS-pdlc-engineering-loop.md"
      );
      const matches = result.filter((r) => r.id === "DEC-LOOP-01");
      expect(matches).toHaveLength(1);
      expect(matches[0].statement).toBe("Session state travels in caller-echoed token, not a durable file");
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // BR-8 / F-9 — null / empty / no-record text ⇒ [] as an ordinary empty result
  // ══════════════════════════════════════════════════════════════════════════

  describe("BR-8/F-9 — null, empty, and no-record text all yield [] as an ordinary empty result", () => {
    test("T-14: null text yields []", async () => {
      const { recogniseDecisionRecords } = await import("../orchestrate-dev.js");
      expect(recogniseDecisionRecords(null, "f.md")).toEqual([]);
    });

    test("T-14: empty-string text yields []", async () => {
      const { recogniseDecisionRecords } = await import("../orchestrate-dev.js");
      expect(recogniseDecisionRecords("", "f.md")).toEqual([]);
    });

    test("T-14: text with prose only, no qualifying heading, yields []", async () => {
      const { recogniseDecisionRecords } = await import("../orchestrate-dev.js");
      const text = "# Title\n\nSome prose mentioning DEC-TERM-01 inline, not as a heading.\n";
      expect(recogniseDecisionRecords(text, "f.md")).toEqual([]);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // §7.5 P-REC — two fast-check properties
  // ══════════════════════════════════════════════════════════════════════════

  describe("§7.5 P-REC (i) — accepts iff all five conjuncts hold", () => {
    const levelArb = fc
      .constantFrom(1, 2, 3, 4, 5)
      .map((n) => ({ hashes: "#".repeat(n), levelOk: n >= 2 && n <= 4 }));
    const ordinalArb = fc.boolean().map((present) => (present ? "3. " : ""));
    const idArb = fc.oneof(
      fc.constantFrom("DEC-TERM-01", "DEC-LOOP-07", "DEC-EDIST-01").map((id) => ({ id, idOk: true })),
      fc.constantFrom("DEC-01", "DEC-AWG-Q1", "DECX-01").map((id) => ({ id, idOk: false }))
    );
    const sepArb = fc.constantFrom(":", "—", "");
    const stmtArb = fc.oneof(
      fc.stringMatching(/^[A-Za-z][A-Za-z0-9 ]{0,19}[A-Za-z0-9]$/).map((s) => ({ statement: s, statementOk: true })),
      fc.constant({ statement: "", statementOk: false })
    );
    const midHeadingArb = fc.boolean();

    test("T-14: PROP-REC-01 — generated heading line accepted iff level, id, id-opens, separator, and non-empty statement all hold", async () => {
      const { recogniseDecisionRecords } = await import("../orchestrate-dev.js");
      fc.assert(
        fc.property(levelArb, ordinalArb, idArb, sepArb, stmtArb, midHeadingArb, (level, ordinal, idPart, sep, stmt, midHeading) => {
          const prefix = midHeading ? "Revisiting " : "";
          const line = `${level.hashes} ${prefix}${ordinal}${idPart.id}${sep ? sep + " " : " "}${stmt.statement}`;
          const allHold = level.levelOk && idPart.idOk && !midHeading && sep !== "" && stmt.statementOk;
          const result = recogniseDecisionRecords(line, "f.md");
          const rec = result.find((r) => r.id === idPart.id);
          if (allHold) {
            expect(rec).toBeDefined();
            // verbatim substring, not a re-normalised value
            expect(line.includes(rec.statement)).toBe(true);
          } else {
            expect(rec).toBeUndefined();
          }
        }),
        { numRuns: 300 }
      );
    });
  });

  describe("§7.5 P-REC (ii) — at most one record per id, and it is the LAST opening; total", () => {
    const openingArb = fc.record({
      ns: fc.constantFrom("DEC-TERM", "DEC-LOOP", "DEC-EDIST"),
      num: fc.integer({ min: 1, max: 9 }),
      statement: fc.stringMatching(/^[A-Za-z][A-Za-z0-9 ]{0,19}[A-Za-z0-9]$/),
    });

    test("T-14: PROP-REC-02 — arbitrary multiset of openings resolves to at most one record per id, always the last opening", async () => {
      const { recogniseDecisionRecords } = await import("../orchestrate-dev.js");
      fc.assert(
        fc.property(fc.array(openingArb, { minLength: 0, maxLength: 8 }), (openings) => {
          const text = openings.map((o) => `## ${o.ns}-${o.num}: ${o.statement}`).join("\n");
          const result = recogniseDecisionRecords(text, "f.md");
          const ids = result.map((r) => r.id);
          expect(new Set(ids).size).toBe(ids.length);
          for (const o of openings) {
            const id = `${o.ns}-${o.num}`;
            const lastForId = [...openings].reverse().find((x) => `${x.ns}-${x.num}` === id);
            const rec = result.find((r) => r.id === id);
            expect(rec).toBeDefined();
            expect(rec.statement).toBe(lastForId.statement);
          }
        }),
        { numRuns: 300 }
      );
    });

    test("T-14: PROP-REC-03 — total: never throws on arbitrary input, including non-string values", async () => {
      const { recogniseDecisionRecords } = await import("../orchestrate-dev.js");
      fc.assert(
        fc.property(fc.anything(), (input) => {
          expect(() => recogniseDecisionRecords(input, "f.md")).not.toThrow();
        }),
        { numRuns: 200 }
      );
    });
  });
});
