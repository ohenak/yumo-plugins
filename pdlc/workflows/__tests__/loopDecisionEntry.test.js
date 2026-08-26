// loopDecisionEntry.test.js — PLAN P3-05 (AT-25, BR-14, TSPEC Architecture §6 / Data Model
// "escalation-view.mjs").
//
// Owns the read-back half of AT-25: a decision block — five field rows (`Decision` ∈
// {`resolved`,`rejected`}, `Decided by`, `Decides`, `Decided at`, `Rationale`) and NO
// `| Seam |` row — parses through `parseEscalationLog` into an `EscalationEntry` whose
// `decidedOutcome` / `decidedBy` / `decidesId` / `decidedAt` fields carry the four AC-4.4
// facts (outcome, who decided, when, which entry). TSPEC is explicit that this read comes
// from THOSE FIELDS, never from a regex over `blockText` (Data Model "escalation-view.mjs"),
// and that a record missing who decided reds by reading back `null`, not by inventing a
// value (TSPEC Architecture §6, "AT-25 reds when the decider is absent").
//
// `parseEscalationLog`'s decision-block branch already ships at HEAD (`escalation-view.mjs`,
// landed ahead of this task alongside the advisory/non-advisory branches), so every
// assertion below is a durable regression guard, not a red-today case — the writer half
// (`renderDecisionEntry`) is a separate, later deliverable (PLAN P3-06) and is out of this
// file's scope per this task's dispatch.

import { parseEscalationLog, canonicalBlockText, entryId } from "../lib/escalation-view.mjs";

const ISO = "2026-08-24T00:00:00.000Z";
const FEATURE = "demo-feature";

function decisionBlock({
  iso = ISO,
  feature = FEATURE,
  decision = "resolved",
  decidedBy = "orchestrate-dev",
  decidesId = "7a917a5354a5",
  decidedAt = "2026-08-24T01:00:00.000Z",
  rationale = "the A3 refusal was accepted as correct.",
  includeDecidedBy = true,
  includeRationale = true,
  extraRows = [],
} = {}) {
  const rows = [
    `| Decision | ${decision} |`,
    ...(includeDecidedBy ? [`| Decided by | ${decidedBy} |`] : []),
    `| Decides | ${decidesId} |`,
    `| Decided at | ${decidedAt} |`,
    ...(includeRationale ? [`| Rationale | ${rationale} |`] : []),
    ...extraRows,
  ];
  return [
    `## ${iso} — ${feature} — decision`,
    "",
    "| Field | Value |",
    "|---|---|",
    ...rows,
    "",
  ].join("\n");
}

describe("parseEscalationLog — decision block round-trip (AT-25, BR-14)", () => {
  test("a resolved decision block reads back into decidedOutcome/decidedBy/decidesId/decidedAt", () => {
    const text = decisionBlock({ decision: "resolved" });
    const result = parseEscalationLog(text);

    expect(result.parseNotices).toEqual([]);
    expect(result.entries).toHaveLength(1);
    const [entry] = result.entries;
    expect(entry.kind).toBe("decision");
    expect(entry.seam).toBeNull();
    expect(entry.source).toBeNull();
    expect(entry.decision).toBe("");
    expect(entry.feature).toBe(FEATURE);
    expect(entry.timestamp).toBe(ISO);
    expect(entry.decidedOutcome).toBe("resolved");
    expect(entry.decidedBy).toBe("orchestrate-dev");
    expect(entry.decidesId).toBe("7a917a5354a5");
    expect(entry.decidedAt).toBe("2026-08-24T01:00:00.000Z");
  });

  test("a rejected decision block reads decidedOutcome as rejected", () => {
    const text = decisionBlock({ decision: "rejected", decidesId: "abc123def456" });
    const result = parseEscalationLog(text);

    expect(result.parseNotices).toEqual([]);
    expect(result.entries[0].decidedOutcome).toBe("rejected");
    expect(result.entries[0].decidesId).toBe("abc123def456");
  });
});

describe("parseEscalationLog — decision block carries no | Seam | row (missing-field exemption)", () => {
  test("the block's own bytes carry no | Seam | row", () => {
    const text = decisionBlock();
    expect(text).not.toMatch(/^\|\s*Seam\s*\|/m);
  });

  test("a decision block with no | Seam | row is not skipped as missing-field", () => {
    const text = decisionBlock();
    const result = parseEscalationLog(text);

    expect(result.parseNotices).toEqual([]);
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].kind).toBe("decision");
  });
});

describe("parseEscalationLog — decider absence reads as null (TSPEC: \"AT-25 reds when the decider is absent\")", () => {
  test("an absent Decided by row reads back as null rather than being inferred or defaulted", () => {
    const text = decisionBlock({ includeDecidedBy: false });
    const result = parseEscalationLog(text);

    expect(result.parseNotices).toEqual([]);
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].kind).toBe("decision");
    expect(result.entries[0].decidedBy).toBeNull();
    // The sibling facts are unaffected by the decider's absence.
    expect(result.entries[0].decidedOutcome).toBe("resolved");
    expect(result.entries[0].decidesId).toBe("7a917a5354a5");
  });

  test("an absent Rationale row (optional field) still reads back the four AC-4.4 facts", () => {
    const text = decisionBlock({ includeRationale: false });
    const result = parseEscalationLog(text);

    expect(result.parseNotices).toEqual([]);
    expect(result.entries[0].decidedOutcome).toBe("resolved");
    expect(result.entries[0].decidedBy).toBe("orchestrate-dev");
    expect(result.entries[0].decidesId).toBe("7a917a5354a5");
    expect(result.entries[0].decidedAt).toBe("2026-08-24T01:00:00.000Z");
  });
});

describe("parseEscalationLog — duplicate decision-field rows skip the block (TSPEC §4b, a count not a first-match)", () => {
  test.each([
    ["Decision", "| Decision | rejected |"],
    ["Decided by", "| Decided by | someone-else |"],
    ["Decides", "| Decides | ffffffffffff |"],
    ["Decided at", "| Decided at | 2026-08-24T02:00:00.000Z |"],
  ])("a second %s row produces a duplicate-field notice and the block is not returned as an entry", (name, extraRow) => {
    const text = decisionBlock({ extraRows: [extraRow] });
    const result = parseEscalationLog(text);

    expect(result.entries).toEqual([]);
    expect(result.parseNotices).toHaveLength(1);
    expect(result.parseNotices[0].reason).toBe(`duplicate-field: ${name}`);
  });
});

describe("parseEscalationLog — Decision domain (resolved|rejected, closed two-member enum)", () => {
  test("an out-of-domain Decision value maps to a null decidedOutcome rather than being accepted verbatim", () => {
    const text = decisionBlock({ decision: "pending" });
    const result = parseEscalationLog(text);

    expect(result.parseNotices).toEqual([]);
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].kind).toBe("decision");
    expect(result.entries[0].decidedOutcome).toBeNull();
  });
});

describe("parseEscalationLog — decided* fields come from named rows, never a regex over blockText", () => {
  test("a Rationale sentence that echoes another field's label does not corrupt the real field reads", () => {
    // The Rationale row's VALUE contains text that a naive whole-block regex for "Decided by"
    // could latch onto; the real `| Decided by |` row must still win because extraction is
    // per-named-row (`fieldValue`), never a scan of `blockText` for a pattern.
    const text = decisionBlock({
      decidedBy: "orchestrate-dev",
      rationale: "Decided by nobody else — the operator's Decided by call stands.",
    });
    const result = parseEscalationLog(text);

    expect(result.parseNotices).toEqual([]);
    expect(result.entries[0].decidedBy).toBe("orchestrate-dev");
    // blockText retains the full raw bytes (durability, TSPEC Architecture §6) — the decoy
    // text is present in it, proving the assertion above is not vacuously true because the
    // decoy was absent from the bytes the reader had access to.
    expect(result.entries[0].blockText).toContain("Decided by nobody else");
  });

  test("a decision block's blockText is the exact canonical bytes, independent of the decided* fields extracted from it", () => {
    const text = decisionBlock();
    const result = parseEscalationLog(text);

    const rawChunk = text.replace(/^## /, "");
    expect(result.entries[0].blockText).toBe(canonicalBlockText(rawChunk));
    expect(result.entries[0].id).toBe(entryId(rawChunk));
  });
});

describe("parseEscalationLog — a decision block among sibling advisory blocks (BR-16)", () => {
  test("an advisory block and a decision block in the same log both parse, each into its own kind", () => {
    const advisory = [
      `## ${ISO} — ${FEATURE} — A3`,
      "",
      "**Decide:** whether to accept the A3 refusal.",
      "",
      "| Field | Value |",
      "|---|---|",
      `| Feature | ${FEATURE} |`,
      "| Seam | A3 |",
      "| Refusal reason | n/a |",
      "",
      "**Diagnosis.** none.",
      "",
      "**Proposed action.** (none)",
      "",
      "**Evidence.**",
      "- (none)",
      "",
      "**Pipeline state.** T — refused",
      "",
    ].join("\n");
    const text = advisory + decisionBlock();

    const result = parseEscalationLog(text);

    expect(result.parseNotices).toEqual([]);
    expect(result.entries).toHaveLength(2);
    expect(result.entries[0].kind).toBe("advisory");
    expect(result.entries[1].kind).toBe("decision");
    expect(result.entries[1].decidedOutcome).toBe("resolved");
  });
});
