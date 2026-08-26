// loopDecisionEntryWriter.test.js — the writer half of AT-25 (PLAN P3-06, TSPEC §10.1,
// Data Model "escalation-view.mjs"). `loopDecisionEntry.test.js` owns the read-back half
// (parser round-trip over hand-built blocks); this file drives the shipped writer —
// `renderDecisionEntry` directly and the `disposition.kind === "decision"` route through
// `appendEscalationEntry` — and asserts through `parseEscalationLog` that what the writer
// emits is what the reader reports. The optional-field arms are exercised on both sides:
// `decidedBy` nullish (the `?? ""` fallback) and `rationale` present/absent (the spread
// row), so a writer that hard-requires either field reds here.

import { renderDecisionEntry, appendEscalationEntry } from "../orchestrate-dev.js";
import { parseEscalationLog } from "../lib/escalation-view.mjs";
import { makeAppendFile } from "./helpers/loopDoubles.js";

const FIXED_NOW_MS = Date.parse("2026-01-01T00:00:00.000Z");
const FEATURE = "pdlc-engineering-loop";
const DECIDES_ID = "7a917a5354a5";
const DECIDED_AT = "2026-01-01T01:00:00.000Z";

function baseFields(overrides = {}) {
  return {
    feature: FEATURE,
    decision: "resolved",
    decidedBy: "operator",
    decidesId: DECIDES_ID,
    decidedAt: DECIDED_AT,
    ...overrides,
  };
}

describe("renderDecisionEntry writer round-trip (AT-25 writer half, P3-06)", () => {
  test("a full block (rationale present) parses back every decided* field", () => {
    const text = renderDecisionEntry(
      baseFields({ rationale: "A3 refusal accepted; the guard was correct." }),
      { now: FIXED_NOW_MS },
    );
    const { entries, parseNotices } = parseEscalationLog(text);

    expect(parseNotices).toEqual([]);
    expect(entries).toHaveLength(1);
    expect(entries[0].kind).toBe("decision");
    expect(entries[0].feature).toBe(FEATURE);
    expect(entries[0].decidedOutcome).toBe("resolved");
    expect(entries[0].decidedBy).toBe("operator");
    expect(entries[0].decidesId).toBe(DECIDES_ID);
    expect(entries[0].decidedAt).toBe(DECIDED_AT);
    expect(text).toMatch(/^\|\s*Rationale\s*\|/m);
  });

  test("rationale absent: no Rationale row is emitted and the block still parses clean", () => {
    const text = renderDecisionEntry(baseFields(), { now: FIXED_NOW_MS });
    const { entries, parseNotices } = parseEscalationLog(text);

    expect(parseNotices).toEqual([]);
    expect(entries).toHaveLength(1);
    expect(text).not.toMatch(/^\|\s*Rationale\s*\|/m);
  });

  test("decidedBy null: the `?? \"\"` fallback renders an empty cell that reads back empty, not an invented decider", () => {
    // An empty cell reads back as `""`; the parser reserves `null` for a *missing*
    // `| Decided by |` row (loopDecisionEntry.test.js owns that case).
    const text = renderDecisionEntry(baseFields({ decidedBy: null }), { now: FIXED_NOW_MS });
    const { entries, parseNotices } = parseEscalationLog(text);

    expect(parseNotices).toEqual([]);
    expect(entries).toHaveLength(1);
    expect(entries[0].kind).toBe("decision");
    expect(entries[0].decidedBy).toBe("");
  });

  test("the block carries no | Seam | row (BR-12a: decision blocks contribute no calibration key)", () => {
    const text = renderDecisionEntry(baseFields(), { now: FIXED_NOW_MS });
    expect(text).not.toMatch(/^\|\s*Seam\s*\|/m);
  });
});

describe("appendEscalationEntry routes kind: \"decision\" through the decision writer (TSPEC §10.1)", () => {
  test("a decision disposition appends a decision block, feature threaded from ctx", async () => {
    const append = makeAppendFile();
    await appendEscalationEntry({
      disposition: {
        kind: "decision",
        decision: "rejected",
        decidedBy: null,
        decidesId: DECIDES_ID,
        decidedAt: DECIDED_AT,
      },
      ctx: { feature: FEATURE },
      _appendFile: append._appendFile,
      _now: () => FIXED_NOW_MS,
    });

    expect(append.calls).toHaveLength(1);
    const { entries, parseNotices } = parseEscalationLog(append.calls[0].contents);
    expect(parseNotices).toEqual([]);
    expect(entries).toHaveLength(1);
    expect(entries[0].kind).toBe("decision");
    expect(entries[0].feature).toBe(FEATURE);
    expect(entries[0].decidedOutcome).toBe("rejected");
    expect(entries[0].decidedBy).toBe("");
  });
});
