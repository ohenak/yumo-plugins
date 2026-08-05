// advisoryRecord.test.js — PLAN A-08 (batch 4, depends on A-02).
//
// RED (authored as `describe.skip`, un-skipped by the 🟢 owner A-21). This file owns FSPEC
// T-08-1, T-08-2, T-08-7, T-08-10 and PROPERTIES §11's PROP-REC-01 … PROP-REC-08, PROP-SUM-01 …
// PROP-SUM-03, plus PLAN §6.5's generator-driven **P-6** over `renderAdvisoryEntry`,
// `appendAdvisoryEntry` and `advisorySummaryRows` (TSPEC §9.1, §9.2, §9.4).
//
// What this file does NOT claim: T-08-3 … T-08-6, T-08-4b, T-08-8, T-08-9 and PROP-SUM-04 — the
// harvest/distil/guard obligations and the halt-report summary integration — live in
// `advisoryHarvest.test.js` (A-13 🔴 / A-27, A-28 🟢, per PLAN §8.1's T-08 row). This file is the
// pure-render and pure-summary surface only.
//
// `renderAdvisoryEntry`, `appendAdvisoryEntry` and `advisorySummaryRows` do not exist on
// `orchestrate-dev.js` yet — they land at A-21. This file therefore imports the module as a
// namespace (`* as devModule`) and reaches every not-yet-existing symbol only from *inside*
// `describe.skip` bodies (property access on a namespace object for a missing member yields
// `undefined` at runtime rather than a link-time SyntaxError), matching the convention
// `advisoryEnvelope.test.js` (A-06) already established. Every block therefore imports cleanly
// today and will run, unmodified, the moment A-21 adds the exports.
//
// Every canonical double/generator comes from `helpers/advisoryDoubles.js` (PROP-INFRA-01/-02) — no
// locally-built `SeamOps` literal, no `jest.fn()` bound directly to a double-shaped name, no
// canonical factory imported from anywhere else.
//
// ─── Grounding decisions this file makes, because TSPEC §9.1/§9.2/§9.4 describe the record's shape
// by worked example rather than by a closed schema ────────────────────────────────────────────────
//
// (1) **The "seven declared fields" are the seven *labelled content pieces* of a rendered entry,
//     not including the timestamp**, which is structural (carried only in the `##` heading, exactly
//     as `advisoryEscalationLog.test.js`'s sibling ADVISORY_ESCALATIONS `##` heading also carries a
//     timestamp that is not one of ESCALATIONS' counted "eight fields"). Transcribing TSPEC's own
//     worked example (`TSPEC:1086-1102`) literally: five `| Field | Value |` table rows — Seam,
//     Confidence, Envelope, Disposition, Model — plus two prose sections — **Diagnosis.** and
//     **Evidence.** — is exactly seven, and matches TSPEC:1083-1084's "Seven fields, matching
//     §10.1's table one-for-one" against the escalation log's own 4-table-row + 3-prose-section = 7
//     (`TSPEC:1195-1213`, decision sentence counted as the escalation log's separate eighth field).
//     REQ AC-9.1's prose list ("timestamp, seam, diagnosis, confidence, envelope determination,
//     action taken or escalated, evidence citations") is the pre-TSPEC framing of the same seven
//     concepts; TSPEC's own worked example is what PROP-REC-02 cites directly, so this file follows
//     TSPEC's rendered shape, is internally self-consistent, and is what A-21 must produce.
// (2) **`AdvisoryDisposition` (TSPEC:384-391) also carries `seam` at its top level.** The typedef
//     as printed lists `outcome, reason, verdict, attempts, model, fallback` only, but
//     `renderAdvisoryEntry(disposition, { now })` (TSPEC:1104) and `appendAdvisoryEntry({ feature,
//     disposition, … })` (TSPEC:1115) both take no separate `seam` argument, and `verdict` is
//     itself nullable ("last well-formed verdict, if any") — so the Seam field cannot depend on a
//     verdict that may not exist. `runAdvisorySeam` (TSPEC:444) is always constructed with `seam` in
//     scope and is the one place `AdvisoryDisposition` is produced, so it is the natural place for
//     `seam` to be attached at the top level before the disposition is passed on. This is also
//     exactly the shape `helpers/advisoryDoubles.js`'s `entryFields()` generator already produces —
//     `{ seam, disposition, reason, attempts, model, fallback }` (`advisoryDoubles.js:359-368`) —
//     confirming the flat, not verdict-nested, placement.
// (3) **Confidence/Envelope/Diagnosis/Evidence fall back to a fixed placeholder when `verdict` is
//     `null`** (an escalation that never reached a well-formed verdict, e.g. a model-resolution
//     failure) — P-6's totality claim requires the renderer never throw on this case, and no
//     upstream document specifies wording for it, so this file pins one literal placeholder set
//     (`"n/a"` / `"no verdict was produced"` / `"(none)"`) that A-21 is expected to match, per this
//     PLAN's own P-9 lesson: "a property must not pin a choice no upstream document made" — here the
//     choice being pinned is deliberately the minimal one (a placeholder), not a guess at richer
//     prose TSPEC never specifies.
// (4) **The `Model` field's fallback marker is the literal suffix `" (fallback)"`.** PROP-REC-07
//     requires only that the fallback be "readable off the record" and "marked as the substitution"
//     — it does not require naming the originally-declared rung, which `AdvisoryDisposition` has no
//     field for. T-08-7 below asserts the marker's presence, not its exact prose, precisely because
//     that is the falsifiable half of PROP-REC-07's claim.

import * as devModule from "../orchestrate-dev.js";

import { makeAdvisoryGenerators, makeFileDouble, resolveSeed, seeded } from "./helpers/advisoryDoubles.js";

// A fixed, injected timestamp — PROP-REC-01's whole point is that `renderAdvisoryEntry` never reads
// a clock, so every test below passes this literal rather than a real `Date`.
const NOW = "2026-08-03T14:21:07Z";

// The seven declared field labels, in the declared order (grounding decision 1 above).
const RECORD_FIELD_NAMES = Object.freeze([
  "Seam",
  "Confidence",
  "Envelope",
  "Disposition",
  "Model",
  "Diagnosis",
  "Evidence",
]);

// A well-formed AdvisoryDisposition builder (TSPEC:384-391, grounding decision 2), shallow-overridable
// per test so each case names only the field it is exercising.
function disposition(overrides = {}) {
  const base = {
    seam: "A4",
    outcome: "resolved",
    reason: null,
    verdict: {
      seam: "A4",
      diagnosis: "the failing lint rule was a missing trailing comma.",
      proposedAction: "rewrite-citation",
      confidence: "high",
      withinEnvelope: true,
      evidence: ["pdlc/workflows/orchestrate-dev.js:42 — trailing comma"],
    },
    attempts: 1,
    model: "opus",
    fallback: false,
  };
  return { ...base, ...overrides };
}

// Extracts, in encountered order, every `| Label | Value |` table row's Label and every
// `**Label.**` prose section's Label from a rendered entry — the mechanical half of PROP-REC-02's
// set-equality-plus-order claim.
function extractFieldNames(rendered) {
  const names = [];
  for (const line of rendered.split("\n")) {
    const tableMatch = line.match(/^\|\s*([A-Za-z]+)\s*\|/);
    if (tableMatch && tableMatch[1] !== "Field") { names.push(tableMatch[1]); continue; }
    const proseMatch = line.match(/^\*\*([A-Za-z]+)\.\*\*/);
    if (proseMatch) names.push(proseMatch[1]);
  }
  return names;
}

// ---------------------------------------------------------------------------
// T-08-1 — any advisory invocation, resolving or escalating, produces an entry carrying all seven
// §9.1 fields (FSPEC:746).
// ---------------------------------------------------------------------------

describe.skip("T-08-1 — an advisory entry carries all seven declared fields", () => {
  test("a resolving invocation's entry carries Seam, Confidence, Envelope, Disposition, Model, Diagnosis, Evidence", () => {
    const d = disposition();
    const entry = devModule.renderAdvisoryEntry(d, { now: NOW });

    expect(entry).toMatch(/^## 2026-08-03T14:21:07Z — A4 — resolved/);
    expect(entry).toContain("| Seam | A4 |");
    expect(entry).toContain("| Confidence | high |");
    expect(entry).toContain("| Envelope | in |");
    expect(entry).toContain("| Disposition | resolved |");
    expect(entry).toContain("| Model | opus |");
    expect(entry).toContain("**Diagnosis.**");
    expect(entry).toContain(d.verdict.diagnosis);
    expect(entry).toContain("**Evidence.**");
    expect(entry).toContain("pdlc/workflows/orchestrate-dev.js:42");
  });

  test("an escalating invocation's entry carries the same seven fields, Disposition naming the reason", () => {
    const d = disposition({
      outcome: "escalated",
      reason: "budget-exhausted",
      verdict: { ...disposition().verdict, withinEnvelope: false },
    });
    const entry = devModule.renderAdvisoryEntry(d, { now: NOW });

    expect(entry).toMatch(/^## 2026-08-03T14:21:07Z — A4 — escalated/);
    expect(entry).toContain("| Envelope | out |");
    expect(entry).toContain("| Disposition | escalated — budget-exhausted |");
    expect(extractFieldNames(entry)).toEqual([...RECORD_FIELD_NAMES]);
  });
});

// ---------------------------------------------------------------------------
// PROP-REC-01 — renderAdvisoryEntry(disposition, { now }) is pure: no clock is read, so the
// rendered bytes are testable exactly against a transcribed literal.
// ---------------------------------------------------------------------------

describe.skip("PROP-REC-01 — renderAdvisoryEntry is pure over an injected timestamp", () => {
  test("rendered bytes match a transcribed literal exactly, and are stable across repeated calls", () => {
    const d = disposition();

    const expected = [
      "## 2026-08-03T14:21:07Z — A4 — resolved",
      "",
      "| Field | Value |",
      "|---|---|",
      "| Seam | A4 |",
      "| Confidence | high |",
      "| Envelope | in |",
      "| Disposition | resolved |",
      "| Model | opus |",
      "",
      "**Diagnosis.** the failing lint rule was a missing trailing comma.",
      "",
      "**Evidence.**",
      "- pdlc/workflows/orchestrate-dev.js:42 — trailing comma",
      "",
    ].join("\n");

    const first = devModule.renderAdvisoryEntry(d, { now: NOW });
    expect(first).toBe(expected);

    // Purity: no clock read — the same disposition and the same injected `now` reproduce the exact
    // same bytes, and neither `disposition` nor its nested `verdict` is mutated by the call.
    const before = JSON.parse(JSON.stringify(d));
    const second = devModule.renderAdvisoryEntry(d, { now: NOW });
    expect(second).toBe(first);
    expect(d).toEqual(before);
  });

  test("a different injected `now` changes only the heading's timestamp", () => {
    const d = disposition();
    const a = devModule.renderAdvisoryEntry(d, { now: "2026-01-01T00:00:00Z" });
    const b = devModule.renderAdvisoryEntry(d, { now: "2026-12-31T23:59:59Z" });

    expect(a.startsWith("## 2026-01-01T00:00:00Z — A4 — resolved")).toBe(true);
    expect(b.startsWith("## 2026-12-31T23:59:59Z — A4 — resolved")).toBe(true);
    // Everything after the heading line is unaffected by the timestamp.
    expect(a.slice(a.indexOf("\n"))).toBe(b.slice(b.indexOf("\n")));
  });
});

// ---------------------------------------------------------------------------
// PROP-REC-02 — the emitted field-name set is exactly the seven declared names, set-equal AND in
// the declared order; a ninth invented field or a deleted one both fail.
// ---------------------------------------------------------------------------

describe.skip("PROP-REC-02 — renderAdvisoryEntry emits exactly the seven declared field names, in order", () => {
  test("a resolved entry's field-name set equals the transcribed literal, in the declared order", () => {
    const entry = devModule.renderAdvisoryEntry(disposition(), { now: NOW });
    const names = extractFieldNames(entry);

    expect(new Set(names)).toEqual(new Set(RECORD_FIELD_NAMES));
    expect(names).toEqual([...RECORD_FIELD_NAMES]);
  });

  test("an escalated, no-verdict entry's field-name set is still exactly the seven names, in order", () => {
    const d = disposition({ outcome: "escalated", reason: "malformed-verdict", verdict: null });
    const entry = devModule.renderAdvisoryEntry(d, { now: NOW });
    const names = extractFieldNames(entry);

    expect(new Set(names)).toEqual(new Set(RECORD_FIELD_NAMES));
    expect(names).toEqual([...RECORD_FIELD_NAMES]);
  });
});

// ---------------------------------------------------------------------------
// PROP-REC-03 — append-only, occurrence order: N invocations produce N entries, newest last, and no
// earlier entry's bytes change.
// ---------------------------------------------------------------------------

describe.skip("PROP-REC-03 — appendAdvisoryEntry is append-only, newest-last", () => {
  test("three invocations against the same feature produce three entries in occurrence order, none mutated", async () => {
    const path = "docs/some-feature/ADVISORY-some-feature.md";
    const file = makeFileDouble({ seed: { [path]: "" } });

    const first = disposition({ seam: "A2", outcome: "resolved" });
    const second = disposition({ seam: "A4", outcome: "escalated", reason: "budget-exhausted" });
    const third = disposition({ seam: "A5", outcome: "no-action", reason: null, verdict: null });

    await devModule.appendAdvisoryEntry({
      feature: "some-feature",
      disposition: first,
      _appendFile: file._appendFile,
      _now: () => NOW,
    });
    const afterFirst = file.files[path];

    await devModule.appendAdvisoryEntry({
      feature: "some-feature",
      disposition: second,
      _appendFile: file._appendFile,
      _now: () => NOW,
    });
    const afterSecond = file.files[path];

    await devModule.appendAdvisoryEntry({
      feature: "some-feature",
      disposition: third,
      _appendFile: file._appendFile,
      _now: () => NOW,
    });
    const afterThird = file.files[path];

    // Earlier bytes never change — each append only grows the file.
    expect(afterSecond.startsWith(afterFirst)).toBe(true);
    expect(afterThird.startsWith(afterSecond)).toBe(true);

    // Newest-last, occurrence order: A2's heading precedes A4's, which precedes A5's.
    const idxA2 = afterThird.indexOf("— A2 — resolved");
    const idxA4 = afterThird.indexOf("— A4 — escalated");
    const idxA5 = afterThird.indexOf("— A5 — no-action");
    expect(idxA2).toBeGreaterThanOrEqual(0);
    expect(idxA4).toBeGreaterThan(idxA2);
    expect(idxA5).toBeGreaterThan(idxA4);

    expect(file.appends.length).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// PROP-REC-04 — an entry is written for EVERY terminal disposition, including `no-action` — the
// record is not escalation-only (R-4).
// ---------------------------------------------------------------------------

describe.skip("PROP-REC-04 — an entry is written for every terminal disposition, including no-action", () => {
  test.each(["resolved", "escalated", "no-action"])("outcome %s appends exactly one entry", async (outcome) => {
    const path = "docs/some-feature/ADVISORY-some-feature.md";
    const file = makeFileDouble({ seed: { [path]: "" } });
    const d = disposition({ outcome, reason: outcome === "escalated" ? "budget-exhausted" : null });

    await devModule.appendAdvisoryEntry({
      feature: "some-feature",
      disposition: d,
      _appendFile: file._appendFile,
      _now: () => NOW,
    });

    expect(file.appends.length).toBe(1);
    expect(file.files[path]).toContain(`— ${outcome}`);
  });
});

// ---------------------------------------------------------------------------
// T-08-2 / PROP-REC-05 / PROP-REC-06 — a record write failure throws; no `mkdir`, no silent
// recovery. §4.4's revert-and-`record-write-failed` half of PROP-REC-05 is the driver's own
// obligation and is asserted in `advisoryDriver.test.js` (A-07 🔴 / A-22 🟢); this file asserts the
// primitive `appendAdvisoryEntry` itself throws, which is the half `defaultAppendFile`
// (`orchestrate-dev.js:6805`) and `appendAdvisoryEntry` (TSPEC:1112-1121) actually own.
// ---------------------------------------------------------------------------

describe.skip("T-08-2 / PROP-REC-05 / PROP-REC-06 — appendAdvisoryEntry throws on write failure", () => {
  test("a scripted append failure propagates as a throw, not a swallowed rejection", async () => {
    const path = "docs/some-feature/ADVISORY-some-feature.md";
    const file = makeFileDouble({ seed: { [path]: "" }, throwOn: new Set([path]) });

    await expect(
      devModule.appendAdvisoryEntry({
        feature: "some-feature",
        disposition: disposition(),
        _appendFile: file._appendFile,
        _now: () => NOW,
      })
    ).rejects.toThrow();

    // The attempt is recorded even though it failed (makeFileDouble's own contract) — the primitive
    // did not silently no-op.
    expect(file.appends.length).toBe(1);
  });

  test("a missing feature directory makes the append throw — never a silent mkdir (PROP-REC-06)", async () => {
    // No seed entry for this feature's ADVISORY path at all: the double's `_appendFile` has nothing
    // to append to and no directory-creation behaviour, mirroring `defaultAppendFile`'s real
    // contract of "creates nothing implicitly for this path" (TSPEC:1104-1107).
    const path = "docs/missing-feature/ADVISORY-missing-feature.md";
    const file = makeFileDouble({ throwOn: new Set([path]) });

    await expect(
      devModule.appendAdvisoryEntry({
        feature: "missing-feature",
        disposition: disposition(),
        _appendFile: file._appendFile,
        _now: () => NOW,
      })
    ).rejects.toThrow();

    expect(Object.prototype.hasOwnProperty.call(file.files, path)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// T-08-7 / PROP-REC-07 — the Model field carries the rung actually used and, on a fallback run,
// marks it as the substitution — readable off the record as well as off the summary (M-2).
// ---------------------------------------------------------------------------

describe.skip("T-08-7 / PROP-REC-07 — the Model field names the rung used and marks a fallback", () => {
  test("a non-fallback run's Model field names the rung with no fallback marker", () => {
    const entry = devModule.renderAdvisoryEntry(disposition({ model: "opus", fallback: false }), { now: NOW });
    expect(entry).toContain("| Model | opus |");
  });

  test("a fallback run's Model field names the rung actually used AND marks it as the substitution", () => {
    const entry = devModule.renderAdvisoryEntry(disposition({ model: "opus", fallback: true }), { now: NOW });
    const modelLine = entry.split("\n").find((l) => l.startsWith("| Model |"));

    expect(modelLine).toBeDefined();
    expect(modelLine).toContain("opus");
    // The falsifiable half: the fallback marker must be present and must differ from the
    // non-fallback rendering — the exact prose is not pinned (grounding decision 4 above).
    expect(modelLine).not.toBe("| Model | opus |");
  });
});

// ---------------------------------------------------------------------------
// PROP-REC-08 / P-6 — no field body contains an unescaped newline (would corrupt the append-only
// record's line grammar), and renderAdvisoryEntry is total over the generated verdict × disposition
// space, always emitting exactly the seven fields in order (PLAN §6.5 P-6).
// ---------------------------------------------------------------------------

const ADV_REC_P6_SEED = 0x41453208;

// Builds a full AdvisoryDisposition from one `entryFields()` draw (`advisoryDoubles.js:359-368`),
// per that generator's own documented licence to have its field spelling adapted by the consuming
// task (`advisoryDoubles.js:245-250`). `injectNewline`, when true, deliberately corrupts the
// diagnosis and the sole evidence citation with an embedded raw `\n` — the falsifying input
// PROP-REC-08 exists to catch.
function toDisposition(fields, { injectNewline = false } = {}) {
  const diagnosis = injectNewline
    ? "first line of diagnosis\nsecond line that must not corrupt the table"
    : `diagnosis-${fields.attempts}`;
  const evidenceLine = injectNewline
    ? "file.js:1 — first\nfile.js:2 — second, still one citation"
    : `file.js:${fields.attempts}`;

  return {
    seam: fields.seam,
    outcome: fields.disposition,
    reason: fields.disposition === "escalated" ? fields.reason : null,
    verdict: {
      seam: fields.seam,
      diagnosis,
      proposedAction: "nothing",
      confidence: "high",
      withinEnvelope: fields.reason !== "out-of-envelope",
      evidence: [evidenceLine],
    },
    attempts: fields.attempts,
    model: fields.model,
    fallback: fields.fallback,
  };
}

describe.skip("PROP-REC-08 — no field body contains an unescaped newline", () => {
  const DRAWS = 100;

  test(`renders every generated draw with no embedded literal newline inside a table field, over ${DRAWS} draws`, () => {
    const seed = resolveSeed(ADV_REC_P6_SEED);
    const gen = makeAdvisoryGenerators(seed);

    for (let i = 0; i < DRAWS; i += 1) {
      const fields = gen.entryFields();
      const d = toDisposition(fields, { injectNewline: i % 3 === 0 });
      const entry = devModule.renderAdvisoryEntry(d, { now: NOW });

      for (const line of entry.split("\n")) {
        const tableMatch = line.match(/^\|\s*(Seam|Confidence|Envelope|Disposition|Model)\s*\|(.*)\|$/);
        if (!tableMatch) continue;
        // Each matched line IS one table row already (the split on "\n" guarantees this); the real
        // assertion is that a corrupted diagnosis/evidence value could never have produced a
        // *second* line that still parses as a `| Field | Value |` row — i.e. the table stays
        // exactly five rows regardless of the injected newline.
        expect(tableMatch[2]).not.toContain("\n");
      }

      const tableRowCount = entry.split("\n").filter((l) => /^\|\s*(Seam|Confidence|Envelope|Disposition|Model)\s*\|/.test(l)).length;
      expect(tableRowCount).toBe(5);
    }
  });
});

describe.skip("P-6 — renderAdvisoryEntry is total over the generated verdict × disposition space", () => {
  const DRAWS = 200;

  /** Reproduction on failure: the seed and the draw index are printed with every failure. */
  function failureReport(seed, drawIndex, fields, detail) {
    return [
      `P-6 failed: ${detail}`,
      `  seed=${seed} (override with PDLC_PROP_SEED); reproduce draw ${drawIndex} by replaying draws 1…${drawIndex + 1}`,
      `  fields=${JSON.stringify(fields)}`,
    ].join("\n");
  }

  test(`never throws and always emits exactly the seven fields in the declared order, over ${DRAWS} draws`, () => {
    const seed = resolveSeed(ADV_REC_P6_SEED);
    const gen = makeAdvisoryGenerators(seed);

    for (let drawIndex = 0; drawIndex < DRAWS; drawIndex += 1) {
      const fields = gen.entryFields();
      const d = toDisposition(fields);

      try {
        const entry = devModule.renderAdvisoryEntry(d, { now: NOW });
        expect(typeof entry).toBe("string");
        expect(extractFieldNames(entry)).toEqual([...RECORD_FIELD_NAMES]);
        expect(entry.startsWith(`## ${NOW} — ${fields.seam} — ${fields.disposition}`)).toBe(true);
      } catch (err) {
        throw new Error(failureReport(seed, drawIndex, fields, err && err.message ? err.message : String(err)));
      }
    }
  });

  test("is reproducible: replaying the same seed from the start draws the same sequence", () => {
    const seed = resolveSeed(ADV_REC_P6_SEED);
    const genA = makeAdvisoryGenerators(seed);
    const genB = makeAdvisoryGenerators(seed);
    for (let i = 0; i < 5; i += 1) {
      expect(genA.entryFields()).toEqual(genB.entryFields());
    }
  });
});

// ---------------------------------------------------------------------------
// PROP-SUM-01 — advisorySummaryRows(dispositions) is pure and always emits five rows, one per
// ADVISORY_SEAMS member, zero counts included, driven off the exported constant (S-1).
// ---------------------------------------------------------------------------

describe.skip("PROP-SUM-01 — advisorySummaryRows always emits five rows, zero counts included", () => {
  test("an empty disposition list still produces all five seams with zero counts", () => {
    const { rows, total } = devModule.advisorySummaryRows([]);

    expect(rows.map((r) => r.seam)).toEqual(["A1", "A2", "A3", "A4", "A5"]);
    for (const row of rows) {
      expect(row).toMatchObject({ invocations: 0, resolved: 0, escalated: 0, noAction: 0 });
    }
    expect(total).toMatchObject({ invocations: 0, resolved: 0, escalated: 0, noAction: 0 });
  });

  test("is driven off the exported ADVISORY_SEAMS constant, not a locally-duplicated list", () => {
    const { rows } = devModule.advisorySummaryRows([]);
    expect(rows.map((r) => r.seam)).toEqual([...devModule.ADVISORY_SEAMS]);
  });

  test("is pure: the input array is not mutated", () => {
    const dispositions = [{ seam: "A2", outcome: "resolved" }];
    const before = JSON.parse(JSON.stringify(dispositions));
    devModule.advisorySummaryRows(dispositions);
    expect(dispositions).toEqual(before);
  });
});

// ---------------------------------------------------------------------------
// T-08-10 / PROP-SUM-02 — the literal six-row table, and `invocations === resolved + escalated +
// noAction` on every row and on the total (FSPEC:756, V-7, S-1).
// ---------------------------------------------------------------------------

describe.skip("T-08-10 / PROP-SUM-02 — the literal six-row summary table and the invocation identity", () => {
  test("A3 no-action, A4 resolved, A5 escalated produce the literal six-row table by value", () => {
    const dispositions = [
      { seam: "A3", outcome: "no-action" },
      { seam: "A4", outcome: "resolved" },
      { seam: "A5", outcome: "escalated" },
    ];

    const { rows, total } = devModule.advisorySummaryRows(dispositions);
    const bySeam = Object.fromEntries(rows.map((r) => [r.seam, r]));

    expect(bySeam.A1).toMatchObject({ invocations: 0, resolved: 0, escalated: 0, noAction: 0 });
    expect(bySeam.A2).toMatchObject({ invocations: 0, resolved: 0, escalated: 0, noAction: 0 });
    expect(bySeam.A3).toMatchObject({ invocations: 1, resolved: 0, escalated: 0, noAction: 1 });
    expect(bySeam.A4).toMatchObject({ invocations: 1, resolved: 1, escalated: 0, noAction: 0 });
    expect(bySeam.A5).toMatchObject({ invocations: 1, resolved: 0, escalated: 1, noAction: 0 });
    expect(total).toMatchObject({ invocations: 3, resolved: 1, escalated: 1, noAction: 1 });

    for (const row of [...rows, total]) {
      expect(row.invocations).toBe(row.resolved + row.escalated + row.noAction);
    }
  });

  test.each(["A1", "A2", "A3", "A4", "A5"])(
    "the identity holds on seam %s for an arbitrary mix of outcomes",
    (targetSeam) => {
      const dispositions = [
        { seam: targetSeam, outcome: "resolved" },
        { seam: targetSeam, outcome: "resolved" },
        { seam: targetSeam, outcome: "escalated" },
        { seam: targetSeam, outcome: "no-action" },
      ];
      const { rows, total } = devModule.advisorySummaryRows(dispositions);
      const row = rows.find((r) => r.seam === targetSeam);

      expect(row).toMatchObject({ invocations: 4, resolved: 2, escalated: 1, noAction: 1 });
      expect(row.invocations).toBe(row.resolved + row.escalated + row.noAction);
      expect(total.invocations).toBe(total.resolved + total.escalated + total.noAction);
    }
  );
});

// ---------------------------------------------------------------------------
// PROP-SUM-03 / S-2 — the summary names the advisory model actually used, and whether it was the
// configured rung or the declared fallback.
// ---------------------------------------------------------------------------

describe.skip("PROP-SUM-03 — the summary names the model actually used and marks a fallback", () => {
  test("a seam's row surfaces the model and fallback flag carried by its invocation", () => {
    const dispositions = [{ seam: "A5", outcome: "escalated", model: "opus", fallback: true }];
    const { rows } = devModule.advisorySummaryRows(dispositions);
    const row = rows.find((r) => r.seam === "A5");

    expect(row.model).toBe("opus");
    expect(row.fallback).toBe(true);
  });

  test("a seam with no invocation carries no fallback claim", () => {
    const { rows } = devModule.advisorySummaryRows([]);
    const row = rows.find((r) => r.seam === "A1");

    expect(row.fallback).toBeFalsy();
  });
});
