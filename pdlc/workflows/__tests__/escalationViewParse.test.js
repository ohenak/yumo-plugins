// escalationViewParse.test.js — PLAN P2-01 (red) / P2-02 (green).
//
// `parseEscalationLog`'s parse contract (TSPEC *Data Model* §4a/§4b, BR-16, BR-17): the
// `docs/_queue/ESCALATIONS.md`-absent case (`null` text, PROP-ESC-14, AT-28), the three
// AC-4.7 unparseable shapes each producing their own `reason` with a 1-based `blockIndex`
// and the block's `heading` while sibling blocks still render (PROP-VIEW-10, AT-27), and
// `canonicalBlockText` / `entryId` pinned against the ONE worked literal block and its
// 12-character digest transcribed from TSPEC *Data Model* §4a (never recomputed by calling
// a hashing helper a second time).
//
// `pdlc/workflows/lib/escalation-view.mjs` does not exist yet at P2-01 — the module is
// P2-02's deliverable. Every block below is therefore committed `.skip`ped, titled
// "P2-02: ...", and un-skipped by P2-02. The dynamic `await import` (rather than a
// top-level static import) lets this file load and its skips take effect even though the
// target module is absent.

// ─── a valid advisory block, matching `renderEscalationEntry`'s shape ──────
// (`pdlc/workflows/orchestrate-dev.js`) — `Feature` + `Seam` + `Refusal reason`, closed
// with a blank line so blocks are unambiguously separated by `/^## /m`.
function advisoryBlock({ iso, feature, seam, decide = "n/a", reason = "n/a" }) {
  return [
    `## ${iso} — ${feature} — ${seam}`,
    "",
    `**Decide:** ${decide}`,
    "",
    "| Field | Value |",
    "|---|---|",
    `| Feature | ${feature} |`,
    `| Seam | ${seam} |`,
    `| Refusal reason | ${reason} |`,
    "",
    "**Diagnosis.** none.",
    "",
    "**Proposed action.** (none)",
    "",
    "**Evidence.**",
    "- (none)",
    "",
    `**Pipeline state.** T — refused`,
    "",
  ].join("\n");
}

describe("parseEscalationLog — absent log (PLAN P2-01/P2-02, PROP-ESC-14, AT-28)", () => {
  test("P2-02: null text yields an empty parsed log and no write is possible", async () => {
    const { parseEscalationLog } = await import("../lib/escalation-view.mjs");

    // `parseEscalationLog(text: string | null): ParsedLog` (TSPEC *Interfaces*) carries no
    // injected write seam of its own — the "no write" conjunct is structurally guaranteed
    // by the signature (arity 1, text only); the render-level call-count spy on the actual
    // write seam (`_appendFile`) is a later task's (P5-01, PROP-ESC-14's own oracle),
    // exercised where a write seam actually exists to spy on.
    expect(parseEscalationLog.length).toBe(1);

    const result = parseEscalationLog(null);

    expect(result).toEqual({ entries: [], parseNotices: [] });
  });
});

// ─── the three-block-middle-bad fixture (PROP-VIEW-10) ─────────────────────
// The second of three blocks is the unparseable one — the middle position is what
// falsifies a parser that truncates at the first failure (PROPERTIES §"Fixture
// catalogue"). Blocks one and three are otherwise-identical valid siblings so "sibling
// blocks still render" is the same fixture shape across all three unparseable cases.
function threeBlockMiddleBad(badBlock, badHeadingIso) {
  const first = advisoryBlock({
    iso: "2026-08-24T00:00:00.000Z",
    feature: "good-feature-1",
    seam: "A1",
  });
  const third = advisoryBlock({
    iso: "2026-08-24T00:02:00.000Z",
    feature: "good-feature-3",
    seam: "A3",
  });
  return [first, badBlock, third].join("\n");
}

describe("parseEscalationLog — unparseable shapes (PLAN P2-01/P2-02, BR-16, AT-27, PROP-VIEW-10, PROP-VIEW-11)", () => {
  test("P2-02: missing-field — no | Feature | row reports reason missing-field: Feature, sibling blocks still render", async () => {
    const { parseEscalationLog } = await import("../lib/escalation-view.mjs");

    const badIso = "2026-08-24T00:01:00.000Z";
    const badHeading = `${badIso} — bad-feature — A2`;
    const badBlock = [
      `## ${badHeading}`,
      "",
      "**Decide:** n/a",
      "",
      "| Field | Value |",
      "|---|---|",
      "| Seam | A2 |",
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

    const text = threeBlockMiddleBad(badBlock);
    const result = parseEscalationLog(text);

    expect(result.entries).toHaveLength(2);
    expect(result.parseNotices).toEqual([
      { blockIndex: 2, heading: badHeading, reason: "missing-field: Feature" },
    ]);
  });

  test("P2-02: duplicate-field — two | Feature | rows report reason duplicate-field: Feature, sibling blocks still render", async () => {
    const { parseEscalationLog } = await import("../lib/escalation-view.mjs");

    const badIso = "2026-08-24T00:01:00.000Z";
    const badHeading = `${badIso} — bad-feature — A2`;
    const badBlock = [
      `## ${badHeading}`,
      "",
      "**Decide:** n/a",
      "",
      "| Field | Value |",
      "|---|---|",
      "| Feature | bad-feature |",
      "| Feature | bad-feature-again |",
      "| Seam | A2 |",
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

    const text = threeBlockMiddleBad(badBlock);
    const result = parseEscalationLog(text);

    expect(result.entries).toHaveLength(2);
    expect(result.parseNotices).toEqual([
      { blockIndex: 2, heading: badHeading, reason: "duplicate-field: Feature" },
    ]);
  });

  test("P2-02: unrecognised-shape — a body with no | Field | Value | table reports reason unrecognised-shape, sibling blocks still render", async () => {
    const { parseEscalationLog } = await import("../lib/escalation-view.mjs");

    const badIso = "2026-08-24T00:01:00.000Z";
    const badHeading = `${badIso} — bad-feature — A2`;
    const badBlock = [
      `## ${badHeading}`,
      "",
      "This block carries no field/value table at all — just free prose describing what",
      "happened, which is exactly the shape AC-4.7's third case names.",
      "",
    ].join("\n");

    const text = threeBlockMiddleBad(badBlock);
    const result = parseEscalationLog(text);

    expect(result.entries).toHaveLength(2);
    expect(result.parseNotices).toEqual([
      { blockIndex: 2, heading: badHeading, reason: "unrecognised-shape" },
    ]);
  });
});

// ─── the ONE worked literal block (TSPEC *Data Model* §4a) ─────────────────
// Transcribed byte-for-byte from the TSPEC's worked example (the block AFTER the leading
// `## ` marker is stripped — the `chunk` shape `canonicalBlockText`/`entryId` receive, per
// the split-on-`/^## /m` recipe in Architecture §6). The expected digest below
// (`7a917a5354a5`) is the literal 12-character digest the TSPEC section carries — computed
// ONCE, by hand, against these exact bytes, and never re-derived by calling a hashing
// helper a second time (AT-25's rule, restated here since this file pins the same pair).
const WORKED_CHUNK = [
  "2026-08-24T00:00:00.000Z — demo-feature — A3",
  "",
  "**Decide:** whether to accept the A3 refusal.",
  "",
  "| Field | Value |",
  "|---|---|",
  "| Feature | demo-feature |",
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
].join("\n");

const WORKED_CANONICAL_BLOCK = `## ${WORKED_CHUNK}`;
const WORKED_ENTRY_ID = "7a917a5354a5";

describe("canonicalBlockText / entryId — worked example (PLAN P2-01/P2-02, TSPEC Data Model §4a, AT-25)", () => {
  test("P2-02: canonicalBlockText re-attaches the ## prefix over the exact trimmed bytes, no trailing newline", async () => {
    const { canonicalBlockText } = await import("../lib/escalation-view.mjs");

    expect(canonicalBlockText(WORKED_CHUNK)).toBe(WORKED_CANONICAL_BLOCK);
    expect(canonicalBlockText(WORKED_CHUNK).endsWith("\n")).toBe(false);
  });

  test("P2-02: entryId is the pinned 12-character digest transcribed from the TSPEC, never recomputed via a second hashing helper", async () => {
    const { entryId } = await import("../lib/escalation-view.mjs");

    expect(entryId(WORKED_CHUNK)).toBe(WORKED_ENTRY_ID);
    expect(entryId(WORKED_CHUNK)).toHaveLength(12);
    expect(entryId(WORKED_CHUNK)).toMatch(/^[0-9a-f]{12}$/);
  });

  test("P2-02: a leading/trailing-whitespace variant of the same chunk canonicalises identically (writer/reader trim parity)", async () => {
    const { canonicalBlockText, entryId } = await import("../lib/escalation-view.mjs");

    const untrimmedChunk = `\n  ${WORKED_CHUNK}  \n\n`;

    expect(canonicalBlockText(untrimmedChunk)).toBe(WORKED_CANONICAL_BLOCK);
    expect(entryId(untrimmedChunk)).toBe(WORKED_ENTRY_ID);
  });
});

// ─── CR v1 F-01 — the three unexercised branches (DoD criterion 4) ─────────
//
// `escalation-view.mjs` shipped at 83.33% branch coverage against the 85% per-file floor,
// with the uncovered branches being real, reachable behaviour no fixture asked for. Each
// block below drives one of them through the public parser rather than the private helper,
// so the assertion is about the log shapes an operator can actually write.
describe("CR v1 F-01 — parse branches no shipped fixture reached", () => {
  test("a block carrying neither Root cause nor Refusal reason parses, with an empty conditionKey", async () => {
    const { parseEscalationLog } = await import("../lib/escalation-view.mjs");

    // `conditionKeyFor`'s third arm. Both the advisory shape (`Root cause`) and the
    // refusal shape (`Refusal reason`) are absent — a merge-refusal block rendered from a
    // source with neither — so the recurrence key's rank-2 component is "" and every such
    // block collapses with its own kind, not with a differently-caused one.
    const iso = "2026-08-24T00:03:00.000Z";
    const heading = `${iso} — keyless-feature — merge-refusal`;
    const block = [
      `## ${heading}`,
      "",
      "**Decide:** whether to accept the refusal.",
      "",
      "| Field | Value |",
      "|---|---|",
      "| Feature | keyless-feature |",
      "| Source | merge-refusal |",
      "",
      "**Diagnosis.** none.",
      "",
      "**Pipeline state.** MERGE — refused",
      "",
    ].join("\n");

    const result = parseEscalationLog(block);

    expect(result.parseNotices).toEqual([]);
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].feature).toBe("keyless-feature");
    expect(result.entries[0].conditionKey).toBe("");
  });

  test("a block with neither Seam nor Source reports missing-field: Seam, sibling blocks still render", async () => {
    const { parseEscalationLog } = await import("../lib/escalation-view.mjs");

    // TSPEC §4b's second missing-field arm: `Seam` and `Source` are alternatives (advisory
    // blocks carry the first, refusal blocks the second), so only their JOINT absence is a
    // defect — and only then is the notice raised. The shipped suite exercised the `Feature`
    // arm alone, leaving this one unreached.
    const badIso = "2026-08-24T00:01:00.000Z";
    const badHeading = `${badIso} — bad-feature — A2`;
    const badBlock = [
      `## ${badHeading}`,
      "",
      "**Decide:** n/a",
      "",
      "| Field | Value |",
      "|---|---|",
      "| Feature | bad-feature |",
      "| Refusal reason | n/a |",
      "",
      "**Diagnosis.** none.",
      "",
      "**Pipeline state.** T — refused",
      "",
    ].join("\n");

    const result = parseEscalationLog(threeBlockMiddleBad(badBlock));

    expect(result.entries).toHaveLength(2);
    expect(result.parseNotices).toEqual([
      { blockIndex: 2, heading: badHeading, reason: "missing-field: Seam" },
    ]);
  });
});
