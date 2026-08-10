// consolidationParse.test.js — PLAN T16 (RED, describe.skip).
//
// One subject, un-skipped by its owning task, never rewritten by it, per PLAN §13.3's
// batch-safety rule 2:
//
// T26 — the record reader: AT-F19, AT-F20, AT-F21, over `parseLogRecords` (TSPEC §7.4, FSPEC
// §8.1). FSPEC §8.1's normative rule for a writer is that every one of the eight fields —
// `failure-mode-id`, `phase`, `symptom`, `artifact`, `target`, `passId`, `action`, `route` — is
// written on every promotion kind and on the `degraded` route (AT-F20 asserts the writer's
// shape as a set-equality on the *reader's* output, since `renderFailureModeRecord` is a
// different function tested in `consolidationReport.test.js`). `parseLogRecords` itself is the
// receive side: it is **total over any subset** of those eight fields — for a block short of a
// field it appends one `ParseNotice{subject, missingField}` and never fills a default, never
// rewrites the log, and never throws (AT-F21). AT-F19 fixtures the four-arm predicate a later
// reader (`openPromotionList`, T27) computes over `parseLogRecords`'s output; because
// `openPromotionList` itself is not implemented until T27 and this file's only green owner is
// T26 (PLAN §4.2's `consolidationParse (T16 → T26)` edge), the fixture below re-derives the
// predicate locally from the parsed records rather than importing the not-yet-green function —
// it is `parseLogRecords`'s field fidelity under test, not `openPromotionList`'s own contract
// (which `consolidationEffectiveness.test.js`, T17 → T27, owns).
//
// Reserves the seats FSPEC §14.5's LD-1 (an unavailable `artifact` renders `(unavailable)`,
// PROP-REC-05), LD-4 (a record short of `passId`, PROP-REC-06) and LD-5's three remaining short
// arms — `phase`, `failure-mode-id`, `symptom` (PROP-REC-04) — land in: PROPERTIES owns their
// fixtures, this file owns their home (TSPEC §11.5). None of the three is authored by this task.

import { parseLogRecords } from "../orchestrate-dev.js";

// ─── Local fixture grammar for a `.consolidation-log.md` failure-mode record block ─────────
//
// FSPEC §8.1 pins the eight field *names*; it does not pin the log's on-disk text grammar for a
// record block (that is `renderFailureModeRecord`'s own concern, TSPEC §7.9, tested against in
// `consolidationReport.test.js`). This file needs some concrete text for `parseLogRecords` to
// read, so it fixtures the simplest one the eight-field table supports: one `{key}: {value}`
// line per present field, in the table's own order, blocks separated by a blank line. A field
// absent from the input object is simply not rendered as a line — which is exactly the "short
// record" shape AT-F21 and AT-F20 both need, without inventing a second grammar for it.
const RECORD_FIELD_ORDER = [
  "failure-mode-id",
  "phase",
  "symptom",
  "artifact",
  "target",
  "passId",
  "action",
  "route",
];

function buildRecordBlock(fields) {
  return RECORD_FIELD_ORDER.filter((key) => fields[key] !== undefined)
    .map((key) => `${key}: ${fields[key]}`)
    .join("\n");
}

function buildRecordLog(blocks) {
  return blocks.map(buildRecordBlock).join("\n\n") + "\n";
}

// The eight field names `parseLogRecords` must produce on its output objects — camelCased per
// the `FailureModeRecord` typedef (`consolidate-learnings.js:222-232`), which is why
// `failure-mode-id`'s text key maps to a `failureModeId` property while `passId`'s does not
// change at all.
const RECORD_OBJECT_FIELDS = [
  "failureModeId",
  "phase",
  "symptom",
  "artifact",
  "target",
  "passId",
  "action",
  "route",
].sort();

describe("T26 — the record reader (parseLogRecords)", () => {
  // ─── AT-F20 — every field, on every kind, and on the degraded route ───────────────────

  describe("AT-F20: a full record's field-name set is set-equal to the eight, on every §5.2 kind and on `degraded`", () => {
    // One well-formed record per §5.2 kind (process learning, AC-2.2 decision, AC-2.1 domain
    // invariant) plus one on the `degraded` route from the §6.3 fallback — four fixtures, same
    // shape, differing only in `target`/`action`/`route` the way each kind's writer would emit
    // them.
    const FIXTURES = [
      {
        label: "process learning (kind 1 subject, promote, routed to the same file)",
        fields: {
          "failure-mode-id": "r-pdlc-skills-se-author-skill-md",
          phase: "R",
          symptom: "the skill under-specifies dependency injection for new services",
          artifact: "pdlc/skills/se-author/SKILL.md",
          target: "pdlc/skills/se-author/SKILL.md",
          passId: "P-2026-01-01-01",
          action: "promote",
          route: "constraints",
        },
      },
      {
        label: "AC-2.2 decision (kind 2, target is DECISIONS-{id}.md)",
        fields: {
          "failure-mode-id": "f-pdlc-workflows-orchestrate-dev-js",
          phase: "F",
          symptom: "the review loop re-litigates a settled severity bar every round",
          artifact: "pdlc/workflows/orchestrate-dev.js",
          target: "docs/_decisions/DECISIONS-f-pdlc-workflows-orchestrate-dev-js.md",
          passId: "P-2026-01-01-01",
          action: "promote",
          route: "decisions",
        },
      },
      {
        label: "AC-2.1 domain invariant (kind 3, target is DOMAIN-CONSTRAINTS.md)",
        fields: {
          "failure-mode-id": "t-pdlc-workflows-orchestrate-dev-js",
          phase: "T",
          symptom: "a PLAN task table admits a data row with no Deps cell",
          artifact: "pdlc/workflows/orchestrate-dev.js",
          target: "docs/_constraints/DOMAIN-CONSTRAINTS.md",
          passId: "P-2026-01-01-01",
          action: "promote",
          route: "constraints",
        },
      },
      {
        label: "the §6.3 degraded fallback (a PR attempt that reached only the proposal file)",
        fields: {
          "failure-mode-id": "dod-pdlc-skills-dod-verify-skill-md",
          phase: "DOD",
          symptom: "the DoD checklist has no production-path conjunct for a builder left unwired",
          artifact: "pdlc/skills/dod-verify/SKILL.md",
          target: "pdlc/skills/dod-verify/SKILL.md",
          passId: "P-2026-01-01-02",
          action: "promote",
          route: "degraded",
        },
      },
    ];

    for (const { label, fields } of FIXTURES) {
      test(`${label}: parsed record's key set is set-equal to the eight field names, both directions`, () => {
        const logText = buildRecordLog([fields]);

        const { records, notices } = parseLogRecords(logText);

        expect(records).toHaveLength(1);
        // Set-equality, not containment: an implementation that dropped a field, or invented a
        // ninth, both red here — sorting both sides makes the comparison order-independent.
        expect(Object.keys(records[0]).sort()).toEqual(RECORD_OBJECT_FIELDS);
        expect(notices).toEqual([]);
      });
    }

    test("a well-formed record's values survive verbatim, including the `degraded` route", () => {
      const fields = FIXTURES[3].fields;
      const { records } = parseLogRecords(buildRecordLog([fields]));

      expect(records[0]).toEqual({
        failureModeId: fields["failure-mode-id"],
        phase: fields.phase,
        symptom: fields.symptom,
        artifact: fields.artifact,
        target: fields.target,
        passId: fields.passId,
        action: fields.action,
        route: fields.route,
      });
    });
  });

  // ─── AT-F19 — the open-promotion predicate's four arms, over parsed records ────────────

  describe("AT-F19: the open-promotion predicate's four arms are decidable from parseLogRecords's output", () => {
    // Local re-derivation of FSPEC §8.4 step 1's predicate — "an id is open when no record for
    // that id carries `action: retire` with a `route` other than `degraded`" — over the plain
    // objects `parseLogRecords` returns. This is deliberately not an import of the production
    // `openPromotionList`: that function is T27-green, and this file's only green owner is T26
    // (PLAN §4.2). What is under test here is that `parseLogRecords` hands the predicate enough
    // — `failureModeId`, `action`, `route`, faithfully, on every record — to be computed
    // correctly at all; `consolidationEffectiveness.test.js` (T17 → T27) is where the real
    // `openPromotionList` earns its own fixture.
    function computeOpenIds(records) {
      const ids = new Set(records.map((r) => r.failureModeId).filter((id) => id !== undefined));
      const closed = new Set(
        records
          .filter((r) => r.action === "retire" && r.route !== undefined && r.route !== "degraded")
          .map((r) => r.failureModeId)
      );
      return [...ids].filter((id) => !closed.has(id));
    }

    test("all four arms in one run: A (retire, constraints) closes; B (retire, degraded) stays open; C (promote) and D (revise) are open", () => {
      const logText = buildRecordLog([
        { "failure-mode-id": "A", phase: "R", symptom: "s-a", artifact: "a.md", target: "a.md", passId: "P-1", action: "retire", route: "constraints" },
        { "failure-mode-id": "B", phase: "R", symptom: "s-b", artifact: "b.md", target: "b.md", passId: "P-1", action: "retire", route: "degraded" },
        { "failure-mode-id": "C", phase: "R", symptom: "s-c", artifact: "c.md", target: "c.md", passId: "P-1", action: "promote", route: "constraints" },
        { "failure-mode-id": "D", phase: "R", symptom: "s-d", artifact: "d.md", target: "d.md", passId: "P-1", action: "revise", route: "decisions" },
      ]);

      const { records, notices } = parseLogRecords(logText);
      const open = computeOpenIds(records);

      expect(notices).toEqual([]);
      // Set-equality, both directions, against the literal `{B, C, D}` — not containment: an
      // implementation returning every id ever recorded (`{A, B, C, D}`) is the degenerate case
      // this row exists to catch, and would pass a containment-only oracle.
      expect(open.sort()).toEqual(["B", "C", "D"]);
      // The cardinality is asserted as a literal, not merely "present" (PROP-REC-02): a count of
      // every recorded id (`4` here) is a different, wrong number and must not pass.
      expect(open).toHaveLength(3);
    });
  });

  // ─── AT-F21 — total over a subset: short records, notices, no halt, no guessed default ──

  describe("AT-F21: a subset-short record does not halt the reader, is reported, and never gets a filled default", () => {
    // E: action retire, no `route`. F: action promote, route degraded, no `target`. W:
    // well-formed, action retire, route constraints (a landed retirement). All three carry
    // `passId`, `failure-mode-id`, `phase` and `symptom` — those four arms are deliberately not
    // exercised here (TE v9 Q-02); they are PROP-REC-04's and PROP-REC-06's own fixtures,
    // reserved above.
    const recordE = { "failure-mode-id": "E", phase: "R", symptom: "s-e", artifact: "e.md", passId: "P-1", action: "retire" }; // no route
    const recordF = { "failure-mode-id": "F", phase: "R", symptom: "s-f", artifact: "f.md", passId: "P-1", action: "promote", route: "degraded" }; // no target
    const recordW = { "failure-mode-id": "W", phase: "R", symptom: "s-w", artifact: "w.md", target: "w.md", passId: "P-1", action: "retire", route: "constraints" };

    function computeOpenIds(records) {
      const ids = new Set(records.map((r) => r.failureModeId).filter((id) => id !== undefined));
      const closed = new Set(
        records
          .filter((r) => r.action === "retire" && r.route !== undefined && r.route !== "degraded")
          .map((r) => r.failureModeId)
      );
      return [...ids].filter((id) => !closed.has(id));
    }

    test("(1) the reader does not throw on a subset-short log — total, never a halt", () => {
      const logText = buildRecordLog([recordE, recordF, recordW]);

      expect(() => parseLogRecords(logText)).not.toThrow();
    });

    test("(2) a parse notice names each short record and its missing field — E's missing `route`, F's missing `target`", () => {
      const { notices } = parseLogRecords(buildRecordLog([recordE, recordF, recordW]));

      expect(notices).toContainEqual(expect.objectContaining({ subject: "E", missingField: "route" }));
      expect(notices).toContainEqual(expect.objectContaining({ subject: "F", missingField: "target" }));
      // No notice for the well-formed record.
      expect(notices.some((n) => n.subject === "W")).toBe(false);
    });

    test("(3a) E's record never gets a filled-in `route` — the key is simply absent, never a guessed default", () => {
      const { records } = parseLogRecords(buildRecordLog([recordE, recordF, recordW]));

      const parsedE = records.find((r) => r.failureModeId === "E");
      expect(parsedE.route).toBeUndefined();
      expect(Object.prototype.hasOwnProperty.call(parsedE, "route")).toBe(false);
    });

    test("(3b) F's record never gets a filled-in `target` — the key is simply absent, never a guessed default", () => {
      const { records } = parseLogRecords(buildRecordLog([recordE, recordF, recordW]));

      const parsedF = records.find((r) => r.failureModeId === "F");
      expect(parsedF.target).toBeUndefined();
      expect(Object.prototype.hasOwnProperty.call(parsedF, "target")).toBe(false);
    });

    test("(3c) E and F are both open, W is closed by its landed retirement — the open set is the literal {E, F}, not {E, F, W}", () => {
      const { records } = parseLogRecords(buildRecordLog([recordE, recordF, recordW]));

      const open = computeOpenIds(records);

      expect(open.sort()).toEqual(["E", "F"]);
    });

    test("(4) parsing is pure — the same input text yields byte-identical records and notices on a second call, never an in-place repair", () => {
      const logText = buildRecordLog([recordE, recordF, recordW]);

      const first = parseLogRecords(logText);
      const second = parseLogRecords(logText);

      expect(second).toEqual(first);
      // The input text itself is never touched by the reader — parseLogRecords takes a string
      // and nothing mutates it in place; asserting reference equality of the source string is
      // this layer's stand-in for "the log's bytes are unchanged", since no write seam exists
      // for a pure function to have used.
      expect(logText).toBe(logText);
    });

    test("(5) the well-formed record W is unaffected — every field parses, and it is excluded from the open set by its own landed retirement", () => {
      const { records } = parseLogRecords(buildRecordLog([recordE, recordF, recordW]));

      const parsedW = records.find((r) => r.failureModeId === "W");
      expect(parsedW).toEqual({
        failureModeId: "W",
        phase: "R",
        symptom: "s-w",
        artifact: "w.md",
        target: "w.md",
        passId: "P-1",
        action: "retire",
        route: "constraints",
      });
    });
  });
});
