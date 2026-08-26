// escalationViewBuild.test.js — PLAN P2-05 (red) / P2-06 (green).
//
// `buildOperatorView({log, counts}) -> {items, parseNotices}` (TSPEC Data Model
// "escalation-view.mjs", Architecture §6). The view pipeline runs V1(read)->V2(parse)->
// V3(collapse)->V4(decision overlay)->V5(order), and V3 MUST run before V4: `occurrences` is
// frozen at the V3 collapse as the group's on-disk member count, and the V4 overlay only ever
// reads that frozen count — it never recomputes it from a "survivor" set (Architecture §6 "Why
// collapse precedes overlay"; BR-14, BR-15; AT-25, AT-26, AT-43, AT-50).
//
// The recurrence key is `(source-or-seam, feature, conditionKey)` — never the rendered decision
// sentence, which routinely differs between two appends of the "same" condition (an interpolated
// phase label, count, or file name). Keying on the sentence would over-split one recurring
// condition into several `occurrences: 1` items (AC-4.5; AT-26, AT-50).
//
// Ordering (V5, BR-13) is descending `blockedFeatures`, ties broken by oldest `firstSeen`
// timestamp, ties broken by feature name ascending (AT-22, AT-24).
//
// `pdlc/workflows/lib/escalation-view.mjs` already exists (P2-02's deliverable) but does not
// export `buildOperatorView` yet — that export is P2-06's. Every block below is therefore
// committed `.skip`ped, titled "P2-06: ...", and un-skipped by P2-06. The dynamic `await import`
// matches the P2-01/P2-02/P2-04 convention so a future missing-export shape still loads.

/** A minimal advisory/non-advisory EscalationEntry (TSPEC Data Model, escalation-view.mjs). */
function mkEntry(overrides) {
  return {
    id: "id-default",
    kind: "advisory",
    seam: "advisory-seam",
    source: null,
    feature: "feature-x",
    decision: "some decision sentence",
    conditionKey: "some condition",
    timestamp: "2026-08-01T00:00:00Z",
    blockText: "## block",
    decidedOutcome: null,
    decidedBy: null,
    decidesId: null,
    decidedAt: null,
    ...overrides,
  };
}

/** A minimal decision-kind EscalationEntry. */
function mkDecision(overrides) {
  return {
    id: "decision-default",
    kind: "decision",
    seam: null,
    source: null,
    feature: "feature-x",
    decision: "",
    conditionKey: "",
    timestamp: "2026-08-05T00:00:00Z",
    blockText: "## decision block",
    decidedOutcome: "resolved",
    decidedBy: "operator",
    decidesId: "id-default",
    decidedAt: "2026-08-05T00:00:00Z",
    ...overrides,
  };
}

// ─── V3 collapse before V4 overlay: occurrences is the on-disk member count ────────
//
// PLAN P2-05/P2-06, Architecture §6 "Why collapse precedes overlay", BR-15, AT-26, AT-50.
//
// The recurrence key is `(source-or-seam, feature, conditionKey)` — NOT the rendered decision
// sentence. Three appends of the "same" condition whose decision sentences differ only in an
// interpolated count (a routine rendering artefact, AC-4.5) must still collapse to one item
// with `occurrences: 3`; keying on the sentence would over-split into three `occurrences: 1`
// items and under-report AT-50's calibration total.
describe("buildOperatorView — V3 collapse keyed on (source-or-seam, feature, conditionKey), not the rendered sentence (PLAN P2-05/P2-06, BR-15, AT-26, AT-50)", () => {
  test("P2-06: three appends whose decision sentences differ only in an interpolated count collapse to one item with occurrences: 3", async () => {
    const { buildOperatorView } = await import("../lib/escalation-view.mjs");

    const entries = [
      mkEntry({
        id: "aaa111111111",
        feature: "alpha",
        seam: "advisory-seam",
        conditionKey: "budget exceeded",
        decision: "Escalate: 1 blocked feature awaiting triage",
        timestamp: "2026-08-01T00:00:00Z",
      }),
      mkEntry({
        id: "bbb222222222",
        feature: "alpha",
        seam: "advisory-seam",
        conditionKey: "budget exceeded",
        decision: "Escalate: 2 blocked features awaiting triage",
        timestamp: "2026-08-02T00:00:00Z",
      }),
      mkEntry({
        id: "ccc333333333",
        feature: "alpha",
        seam: "advisory-seam",
        conditionKey: "budget exceeded",
        decision: "Escalate: 3 blocked features awaiting triage",
        timestamp: "2026-08-03T00:00:00Z",
      }),
    ];

    const log = { entries, parseNotices: [{ blockIndex: 9, heading: "h", reason: "unrecognised-shape" }] };
    const counts = new Map([["alpha", 4]]);

    const { items, parseNotices } = buildOperatorView({ log, counts });

    expect(items).toHaveLength(1);
    expect(items[0].feature).toBe("alpha");
    expect(items[0].conditionKey).toBe("budget exceeded");
    expect(items[0].occurrences).toBe(3);
    expect(items[0].entryIds).toEqual(["aaa111111111", "bbb222222222", "ccc333333333"]);
    expect(items[0].firstSeen).toBe("2026-08-01T00:00:00Z");
    expect(items[0].blockedFeatures).toBe(4);

    // parseNotices pass through V1-V4 untouched — the same array the parser produced.
    expect(parseNotices).toEqual(log.parseNotices);
  });

  test("P2-06: a different source-or-seam or a different conditionKey does not collapse, even for the same feature", async () => {
    const { buildOperatorView } = await import("../lib/escalation-view.mjs");

    const entries = [
      mkEntry({
        id: "d1d1d1d1d1d1",
        feature: "beta",
        seam: "advisory-seam",
        conditionKey: "budget exceeded",
        timestamp: "2026-08-01T00:00:00Z",
      }),
      mkEntry({
        id: "d2d2d2d2d2d2",
        feature: "beta",
        seam: null,
        source: "merge-refusal",
        conditionKey: "budget exceeded",
        timestamp: "2026-08-02T00:00:00Z",
      }),
      mkEntry({
        id: "d3d3d3d3d3d3",
        feature: "beta",
        seam: "advisory-seam",
        conditionKey: "different condition",
        timestamp: "2026-08-03T00:00:00Z",
      }),
    ];

    const log = { entries, parseNotices: [] };
    const counts = new Map([["beta", 1]]);

    const { items } = buildOperatorView({ log, counts });

    // Three distinct (source-or-seam, feature, conditionKey) triples ⇒ three items, each
    // occurrences: 1 — no over-collapsing across a differing source-or-seam or conditionKey.
    expect(items).toHaveLength(3);
    for (const item of items) {
      expect(item.occurrences).toBe(1);
    }
  });
});

// ─── V5 order: descending blockedFeatures, ties by oldest timestamp, then name (AT-22, AT-24) ─
describe("buildOperatorView — V5 order (PLAN P2-05/P2-06, BR-13, AT-22, AT-24)", () => {
  test("P2-06: three items with distinct blocked-feature counts order 4, 1, 0 (AT-22)", async () => {
    const { buildOperatorView } = await import("../lib/escalation-view.mjs");

    // Input order deliberately does not match the expected output order.
    const entries = [
      mkEntry({ id: "e1e1e1e1e1e1", feature: "zero-feat", conditionKey: "c0", timestamp: "2026-08-01T00:00:00Z" }),
      mkEntry({ id: "e2e2e2e2e2e2", feature: "four-feat", conditionKey: "c4", timestamp: "2026-08-02T00:00:00Z" }),
      mkEntry({ id: "e3e3e3e3e3e3", feature: "one-feat", conditionKey: "c1", timestamp: "2026-08-03T00:00:00Z" }),
    ];

    const log = { entries, parseNotices: [] };
    const counts = new Map([
      ["zero-feat", 0],
      ["four-feat", 4],
      ["one-feat", 1],
    ]);

    const { items } = buildOperatorView({ log, counts });

    expect(items.map((i) => i.feature)).toEqual(["four-feat", "one-feat", "zero-feat"]);
    expect(items.map((i) => i.blockedFeatures)).toEqual([4, 1, 0]);
  });

  test("P2-06: equal blocked-feature counts and equal timestamps order by feature name ascending, stably across renders (AT-24)", async () => {
    const { buildOperatorView } = await import("../lib/escalation-view.mjs");

    const entries = [
      mkEntry({ id: "f1f1f1f1f1f1", feature: "zeta", conditionKey: "cz", timestamp: "2026-08-01T00:00:00Z" }),
      mkEntry({ id: "f2f2f2f2f2f2", feature: "alpha", conditionKey: "ca", timestamp: "2026-08-01T00:00:00Z" }),
      mkEntry({ id: "f3f3f3f3f3f3", feature: "mu", conditionKey: "cm", timestamp: "2026-08-01T00:00:00Z" }),
    ];

    const log = { entries, parseNotices: [] };
    const counts = new Map([
      ["zeta", 2],
      ["alpha", 2],
      ["mu", 2],
    ]);

    const first = buildOperatorView({ log, counts });
    const second = buildOperatorView({ log, counts });

    expect(first.items.map((i) => i.feature)).toEqual(["alpha", "mu", "zeta"]);
    // Stable across renders — same input, same output, called twice.
    expect(second.items.map((i) => i.feature)).toEqual(first.items.map((i) => i.feature));
  });
});

// ─── V4 decision overlay: an earlier-member decision leaves the item open (AT-43) ──
describe("buildOperatorView — V4 decision overlay on a recurring escalation (PLAN P2-05/P2-06, BR-14, BR-15, AT-43)", () => {
  test("P2-06: a decision naming an earlier member id leaves the item open, keeping occurrences at the on-disk count (2)", async () => {
    const { buildOperatorView } = await import("../lib/escalation-view.mjs");

    const firstOccurrence = mkEntry({
      id: "g1g1g1g1g1g1",
      feature: "gamma",
      seam: "advisory-seam",
      conditionKey: "budget exceeded",
      timestamp: "2026-08-01T00:00:00Z",
    });
    // A durably recorded decision resolves the FIRST occurrence...
    const decision = mkDecision({
      id: "decision-g1",
      feature: "gamma",
      decidesId: "g1g1g1g1g1g1",
      decidedOutcome: "resolved",
      decidedBy: "operator",
      decidedAt: "2026-08-02T00:00:00Z",
      timestamp: "2026-08-02T00:00:00Z",
    });
    // ...but the same escalation recurs afterward — a second on-disk occurrence for the same
    // (source-or-seam, feature, conditionKey) triple. BR-15: a decision neither resets nor
    // suppresses the on-disk occurrence count.
    const secondOccurrence = mkEntry({
      id: "g2g2g2g2g2g2",
      feature: "gamma",
      seam: "advisory-seam",
      conditionKey: "budget exceeded",
      timestamp: "2026-08-03T00:00:00Z",
    });

    const log = { entries: [firstOccurrence, decision, secondOccurrence], parseNotices: [] };
    const counts = new Map([["gamma", 5]]);

    const { items } = buildOperatorView({ log, counts });

    // The item stays open — it is present in the view, not omitted.
    expect(items).toHaveLength(1);
    expect(items[0].feature).toBe("gamma");
    expect(items[0].occurrences).toBe(2);
    expect(items[0].entryIds).toEqual(["g1g1g1g1g1g1", "g2g2g2g2g2g2"]);
  });

  test("P2-06: a decision resolving the sole, non-recurring occurrence closes the item (it is omitted from the view)", async () => {
    const { buildOperatorView } = await import("../lib/escalation-view.mjs");

    const onlyOccurrence = mkEntry({
      id: "h1h1h1h1h1h1",
      feature: "delta",
      seam: "advisory-seam",
      conditionKey: "budget exceeded",
      timestamp: "2026-08-01T00:00:00Z",
    });
    const decision = mkDecision({
      id: "decision-h1",
      feature: "delta",
      decidesId: "h1h1h1h1h1h1",
      decidedOutcome: "resolved",
      decidedAt: "2026-08-02T00:00:00Z",
      timestamp: "2026-08-02T00:00:00Z",
    });

    const log = { entries: [onlyOccurrence, decision], parseNotices: [] };
    const counts = new Map([["delta", 1]]);

    const { items } = buildOperatorView({ log, counts });

    expect(items).toHaveLength(0);
  });
});

// ─── CR v1 F-01 — the V4 overlay's non-matching-decision branch ────────────
//
// Every shipped overlay fixture handed `buildOperatorView` a decision that named an id in
// the group under test, so the loop's "this decision is about some other escalation" arm
// was never taken. That arm is what keeps one feature's resolved decision from closing a
// different feature's still-open item — the failure it prevents is a silently disappearing
// escalation, so it is worth a fixture of its own.
describe("CR v1 F-01 — a decision naming an id outside the group leaves that group untouched", () => {
  test("an unrelated resolved decision does not close another feature's open item", async () => {
    const { buildOperatorView } = await import("../lib/escalation-view.mjs");

    const openItem = mkEntry({
      id: "k1k1k1k1k1k1",
      feature: "kappa",
      seam: "advisory-seam",
      conditionKey: "budget exceeded",
      timestamp: "2026-08-01T00:00:00Z",
    });
    // Resolves an id belonging to no group in this log at all.
    const foreignDecision = mkDecision({
      id: "decision-z1",
      feature: "zeta",
      decidesId: "z9z9z9z9z9z9",
      decidedOutcome: "resolved",
      decidedAt: "2026-08-02T00:00:00Z",
      timestamp: "2026-08-02T00:00:00Z",
    });

    const { items } = buildOperatorView({
      log: { entries: [openItem, foreignDecision], parseNotices: [] },
      counts: new Map([["kappa", 2]]),
    });

    expect(items).toHaveLength(1);
    expect(items[0].feature).toBe("kappa");
    expect(items[0].occurrences).toBe(1);
    // No overlay was applied — the item reports no decision of its own.
    expect(items[0].decidedOutcome ?? null).toBeNull();
  });
});
