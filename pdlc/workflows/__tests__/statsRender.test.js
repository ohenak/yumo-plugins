// statsRender.test.js — PLAN T-06 (RED) / T-15 (GREEN).
//
// Reds `renderHuman` / `renderJson` over hand-built `StatsReport` values (TSPEC §4.2, §4.2.1,
// §6.3; FSPEC §6.1/§6.2/§6.5/§6.7/§6.9):
//
//   - AT-01: single-feature human block order — header (feature + dir), review rounds (six
//     document-type rows in catalogue order), DoD rounds, halts, byte ratio.
//   - AT-05: `renderJson`'s single-feature top-level key set is exactly five keys; the
//     malformed list and non-numeric states live inside their own metric's value, never as
//     additional top-level keys.
//   - AT-06: human and JSON agree metric for metric, single-feature and fleet.
//   - TSPEC §6.3's four conjuncts: exact key sets against a literal transcription per shape,
//     no `feature`/`dir` leakage, `schemaVersion === 1` asserted against the literal `1`, and
//     the fleet entry discriminant (four metric keys, or exactly `{gap}`).
//   - AT-14b: halts render in the literal sequence `D, F, I, T`, and separately `P, PR`, in
//     both modes — the sequence is the assertion, not the set. This test hands the renderer an
//     already-ordered `halts` array (collation is `computeFeatureStats`'s job, not the
//     renderer's — TSPEC §4.3/BR-13) and asserts the renderer preserves that order verbatim.
//   - AT-19: the fleet JSON document is exactly three keys, with an unclassified entry marked
//     outside `features`.
//   - AT-23: the error JSON document is exactly three keys, `error` exactly `{reason,message}`.
//
// `pdlc/workflows/lib/stats.mjs` does not exist yet — T-15 creates `renderHuman`/`renderJson`
// and turns this file green (T-12/T-13/T-14 land the other exports first but do not touch the
// renderers). Every test loads the module via a dynamic `await import` inside the test body
// (never a top-level import) so this file still loads — and the `describe.skip` wrapper below
// takes effect — before that module exists. The whole file is one `describe.skip` block because
// every test inside is owned by the single task T-15.

// ─── literal fixtures (never derived from the module under test) ─────────

// BR-09's six-document-type catalogue, in the fixed order the review-rounds row set/table
// uses in both modes. Transcribed literally, not imported — there is nothing to import it
// from at the render layer (the renderer receives an already-keyed `byDocType`).
const DOC_TYPES_LITERAL = Object.freeze(["REQ", "FSPEC", "TSPEC", "PLAN", "PROPERTIES", "DECISIONS"]);

function measuredDocType(rounds) {
  return { state: "measured", rounds, collidingRole: null };
}

function harvestedDocType() {
  return { state: "harvested", rounds: null, collidingRole: null };
}

function unmeasurableDocType(collidingRole) {
  return { state: "unmeasurable", rounds: null, collidingRole };
}

function buildByDocType(overrides = {}) {
  const byDocType = {};
  for (const t of DOC_TYPES_LITERAL) {
    byDocType[t] = overrides[t] ?? measuredDocType(1);
  }
  return byDocType;
}

// A single-feature `FeatureStats` (TSPEC §4.1) with distinctive, individually-recognisable
// values in every metric, so a rendered token can be traced back to exactly one field.
function buildFeatureStats(overrides = {}) {
  return {
    feature: "pdlc-stats-fixture",
    dir: "/repo/docs/pdlc-stats-fixture",
    reviewRounds: {
      byDocType: buildByDocType({
        REQ: measuredDocType(3),
        FSPEC: harvestedDocType(),
        TSPEC: unmeasurableDocType("test-engineer"),
      }),
      malformed: [],
    },
    dodRounds: { state: "measured", rounds: 2 },
    halts: [{ phase: "D", resolution: "resolved" }],
    byteRatio: { state: "measured", ratio: 1.42, processBytes: 123456, specBytes: 87000 },
    ...overrides,
  };
}

function buildSingleReport(featureStatsOverrides = {}) {
  return { kind: "single", result: buildFeatureStats(featureStatsOverrides) };
}

describe("T-15: renderHuman / renderJson over hand-built StatsReport values", () => {
  describe("AT-01: single-feature human block order", () => {
    it("prints header, review rounds (six rows in catalogue order), DoD rounds, halts, byte ratio — in that order", async () => {
      const { renderHuman } = await import("../lib/stats.mjs");
      const report = buildSingleReport();

      const human = renderHuman(report);

      expect(human).toEqual(expect.stringContaining("pdlc-stats-fixture"));
      expect(human).toEqual(expect.stringContaining("/repo/docs/pdlc-stats-fixture"));

      const headerIdx = human.indexOf("pdlc-stats-fixture");
      const docTypeIdx = DOC_TYPES_LITERAL.map((t) => human.indexOf(t));
      const dodIdx = human.indexOf("DoD rounds");
      const haltsIdx = human.indexOf("Halts");
      const ratioIdx = human.indexOf("Byte ratio");

      for (const idx of [...docTypeIdx, dodIdx, haltsIdx, ratioIdx]) {
        expect(idx).toBeGreaterThan(-1);
      }
      expect(headerIdx).toBeLessThan(docTypeIdx[0]);
      for (let i = 1; i < docTypeIdx.length; i += 1) {
        expect(docTypeIdx[i - 1]).toBeLessThan(docTypeIdx[i]);
      }
      expect(docTypeIdx[docTypeIdx.length - 1]).toBeLessThan(dodIdx);
      expect(dodIdx).toBeLessThan(haltsIdx);
      expect(haltsIdx).toBeLessThan(ratioIdx);
    });
  });

  describe("AT-05: renderJson single-feature top-level key set is exactly five keys", () => {
    it("malformed basenames and non-numeric states appear inside their own metric, never as a top-level key", async () => {
      const { renderJson } = await import("../lib/stats.mjs");
      const report = buildSingleReport({
        reviewRounds: {
          byDocType: buildByDocType({
            FSPEC: harvestedDocType(),
            TSPEC: unmeasurableDocType("test-engineer"),
          }),
          malformed: ["CROSS-REVIEW-pm-REQ-v01.md"],
        },
      });

      const json = renderJson(report);

      expect(Object.keys(json).sort()).toEqual(
        ["schemaVersion", "reviewRounds", "dodRounds", "halts", "byteRatio"].sort(),
      );
      expect(json.reviewRounds.malformed).toEqual(["CROSS-REVIEW-pm-REQ-v01.md"]);
      expect(json).not.toHaveProperty("malformed");
      expect(json).not.toHaveProperty("harvested");
      expect(json).not.toHaveProperty("unmeasurable");
      expect(json.reviewRounds.byDocType.FSPEC.state).toBe("harvested");
      expect(json.reviewRounds.byDocType.TSPEC.state).toBe("unmeasurable");
    });
  });

  describe("TSPEC §6.3 conjunct — exact key sets against a literal transcription per shape", () => {
    it("single-feature success document: schemaVersion, reviewRounds, dodRounds, halts, byteRatio (BR-21)", async () => {
      const { renderJson } = await import("../lib/stats.mjs");
      // transcribed from FSPEC §6.2 AT-05 / TSPEC §4.2.1's SingleDocument — five keys.
      const literal = ["schemaVersion", "reviewRounds", "dodRounds", "halts", "byteRatio"];

      const json = renderJson(buildSingleReport());

      expect(new Set(Object.keys(json))).toEqual(new Set(literal));
    });

    it("fleet success document: schemaVersion, features, unclassified (BR-23)", async () => {
      const { renderJson } = await import("../lib/stats.mjs");
      // transcribed from TSPEC §4.2.1's FleetDocument — three keys.
      const literal = ["schemaVersion", "features", "unclassified"];
      const report = {
        kind: "fleet",
        results: [buildFeatureStats({ feature: "feature-a", dir: "/repo/docs/feature-a" })],
        unclassified: [],
      };

      const json = renderJson(report);

      expect(new Set(Object.keys(json))).toEqual(new Set(literal));
    });

    it("refusal document, either mode: schemaVersion, error, feature (BR-30)", async () => {
      const { renderJson } = await import("../lib/stats.mjs");
      // transcribed from TSPEC §4.2.1's ErrorDocument — three keys.
      const literal = ["schemaVersion", "error", "feature"];
      const report = {
        kind: "error",
        reason: "not_found",
        feature: "unknown-feature",
        message: "no directory found for unknown-feature",
      };

      const json = renderJson(report);

      expect(new Set(Object.keys(json))).toEqual(new Set(literal));
    });
  });

  describe("TSPEC §6.3 conjunct — no feature/dir leakage", () => {
    it("the single-feature document carries neither feature nor dir at the top level", async () => {
      const { renderJson } = await import("../lib/stats.mjs");

      const json = renderJson(buildSingleReport());

      expect(json).not.toHaveProperty("feature");
      expect(json).not.toHaveProperty("dir");
    });

    it("a fleet features entry carries neither feature nor dir", async () => {
      const { renderJson } = await import("../lib/stats.mjs");
      const report = {
        kind: "fleet",
        results: [buildFeatureStats({ feature: "feature-a", dir: "/repo/docs/feature-a" })],
        unclassified: [],
      };

      const json = renderJson(report);

      expect(json.features["feature-a"]).not.toHaveProperty("feature");
      expect(json.features["feature-a"]).not.toHaveProperty("dir");
    });
  });

  describe("TSPEC §6.3 conjunct — schemaVersion === 1, asserted against the literal 1", () => {
    it("is present and === 1 in the single-feature document", async () => {
      const { renderJson } = await import("../lib/stats.mjs");
      expect(renderJson(buildSingleReport()).schemaVersion).toBe(1);
    });

    it("is present and === 1 in the fleet document", async () => {
      const { renderJson } = await import("../lib/stats.mjs");
      const report = { kind: "fleet", results: [], unclassified: [] };
      expect(renderJson(report).schemaVersion).toBe(1);
    });

    it("is present and === 1 in the error document", async () => {
      const { renderJson } = await import("../lib/stats.mjs");
      const report = {
        kind: "error",
        reason: "not_found",
        feature: "unknown-feature",
        message: "no directory found for unknown-feature",
      };
      expect(renderJson(report).schemaVersion).toBe(1);
    });
  });

  describe("TSPEC §6.3 conjunct — fleet entry discriminant (BR-23)", () => {
    it("a measured entry carries exactly the four metric keys; a gap entry carries exactly {gap}", async () => {
      const { renderJson } = await import("../lib/stats.mjs");
      const report = {
        kind: "fleet",
        results: [
          buildFeatureStats({ feature: "measured-feature", dir: "/repo/docs/measured-feature" }),
          { feature: "gap-feature", gap: "directory unreadable: EACCES" },
        ],
        unclassified: [],
      };

      const json = renderJson(report);

      expect(new Set(Object.keys(json.features["measured-feature"]))).toEqual(
        new Set(["reviewRounds", "dodRounds", "halts", "byteRatio"]),
      );
      expect(new Set(Object.keys(json.features["gap-feature"]))).toEqual(new Set(["gap"]));
    });
  });

  describe("AT-14b: halts render in the literal sequence, preserved verbatim by both renderers", () => {
    it("the literal sequence D, F, I, T renders in that order in both modes", async () => {
      const { renderHuman, renderJson } = await import("../lib/stats.mjs");
      const halts = [
        { phase: "D", resolution: "resolved" },
        { phase: "F", resolution: "open" },
        { phase: "I", resolution: "resolved" },
        { phase: "T", resolution: "open" },
      ];
      const report = buildSingleReport({ halts });

      const human = renderHuman(report);
      const json = renderJson(report);

      const humanIdx = ["D", "F", "I", "T"].map((phase) => human.indexOf(phase, human.indexOf("Halts")));
      for (let i = 1; i < humanIdx.length; i += 1) {
        expect(humanIdx[i - 1]).toBeLessThan(humanIdx[i]);
      }
      expect(json.halts.map((h) => h.phase)).toEqual(["D", "F", "I", "T"]);
    });

    it("the literal sequence P, PR renders in that order in both modes (the two-character id BR-13 names)", async () => {
      const { renderHuman, renderJson } = await import("../lib/stats.mjs");
      const halts = [
        { phase: "P", resolution: "open" },
        { phase: "PR", resolution: "resolved" },
      ];
      const report = buildSingleReport({ halts });

      const human = renderHuman(report);
      const json = renderJson(report);

      const haltsBlock = human.slice(human.indexOf("Halts"));
      expect(haltsBlock.indexOf("P")).toBeLessThan(haltsBlock.indexOf("PR", haltsBlock.indexOf("P") + 1));
      expect(json.halts.map((h) => h.phase)).toEqual(["P", "PR"]);
    });
  });

  describe("AT-19: fleet document with an unclassified entry", () => {
    it("three top-level keys; unclassified is set-equal to the marked directory; features carries no key for it", async () => {
      const { renderHuman, renderJson } = await import("../lib/stats.mjs");
      const report = {
        kind: "fleet",
        results: [buildFeatureStats({ feature: "real-feature", dir: "/repo/docs/real-feature" })],
        unclassified: ["_new-dir"],
      };

      const json = renderJson(report);

      expect(new Set(Object.keys(json))).toEqual(new Set(["schemaVersion", "features", "unclassified"]));
      expect(json.unclassified).toEqual(["_new-dir"]);
      expect(json.features).not.toHaveProperty("_new-dir");
      expect(Object.keys(json.features)).toEqual(["real-feature"]);

      const human = renderHuman(report);
      expect(human).toEqual(expect.stringContaining("_new-dir"));
    });
  });

  describe("AT-23: error document — three keys, error exactly {reason, message}, feature echoed", () => {
    it("not_found: schemaVersion, error{reason,message}, feature — three keys, no more", async () => {
      const { renderJson } = await import("../lib/stats.mjs");
      const report = {
        kind: "error",
        reason: "not_found",
        feature: "unknown-feature",
        message: "no directory found for unknown-feature",
      };

      const json = renderJson(report);

      expect(new Set(Object.keys(json))).toEqual(new Set(["schemaVersion", "error", "feature"]));
      expect(new Set(Object.keys(json.error))).toEqual(new Set(["reason", "message"]));
      expect(json.error.reason).toBe("not_found");
      expect(json.feature).toBe("unknown-feature");
    });

    it("is distinguishable from a real feature with no artifacts (AT-26's empty directory) by key set alone", async () => {
      const { renderJson } = await import("../lib/stats.mjs");
      const errorReport = {
        kind: "error",
        reason: "not_found",
        feature: "unknown-feature",
        message: "no directory found for unknown-feature",
      };
      const emptyFeatureReport = buildSingleReport({
        feature: "empty-feature",
        dir: "/repo/docs/empty-feature",
        reviewRounds: { byDocType: buildByDocType({}), malformed: [] },
        dodRounds: { state: "measured", rounds: 0 },
        halts: [],
        byteRatio: { state: "unavailable", ratio: null, processBytes: 0, specBytes: 0 },
      });

      const errorJson = renderJson(errorReport);
      const emptyJson = renderJson(emptyFeatureReport);

      expect(new Set(Object.keys(errorJson))).not.toEqual(new Set(Object.keys(emptyJson)));
    });
  });

  describe("AT-06: human and JSON agree metric for metric", () => {
    it("single-feature: every value in the human table is recoverable from the JSON document, ratio 2dp matches", async () => {
      const { renderHuman, renderJson } = await import("../lib/stats.mjs");
      const report = buildSingleReport({
        dodRounds: { state: "measured", rounds: 2 },
        halts: [{ phase: "D", resolution: "resolved" }],
        byteRatio: { state: "measured", ratio: 1.42, processBytes: 123456, specBytes: 87000 },
      });

      const human = renderHuman(report);
      const json = renderJson(report);

      // The human-side conjuncts are whole rendered lines transcribed from BR-17's
      // layout, not substrings: a substring like "2" is already satisfied by an
      // unrelated byte total, so a deleted or wrong-valued row would survive.
      const humanLines = human.split("\n");

      // DoD rounds: shown in human, present in JSON, same value.
      expect(humanLines).toEqual(expect.arrayContaining(["DoD rounds      2"]));
      expect(json.dodRounds.rounds).toBe(2);
      // Halts: phase + resolution shown, and recoverable literally from JSON.
      expect(humanLines).toEqual(expect.arrayContaining(["Halts", "  D   resolved"]));
      expect(json.halts).toEqual([{ phase: "D", resolution: "resolved" }]);
      // Byte ratio: the human two-decimal rendering matches the JSON number exactly (BR-15).
      expect(humanLines).toEqual(
        expect.arrayContaining(["Byte ratio      1.42  (process 123456 B / spec 87000 B)"]),
      );
      expect(json.byteRatio.ratio).toBe(1.42);
    });

    it("single-feature: the human metric set and the JSON top-level key set (minus schemaVersion) are set-equal (REQ-STATS-02, R-5)", async () => {
      const { renderHuman, renderJson } = await import("../lib/stats.mjs");
      // REQ-STATS-01's four metrics: the human block label as BR-17 prints it,
      // transcribed literally, paired with the JSON key BR-21 names for it.
      const METRIC_LABEL_TO_JSON_KEY = {
        "Review rounds": "reviewRounds",
        "DoD rounds": "dodRounds",
        Halts: "halts",
        "Byte ratio": "byteRatio",
      };
      const report = buildSingleReport({
        dodRounds: { state: "measured", rounds: 2 },
        halts: [{ phase: "D", resolution: "resolved" }],
        byteRatio: { state: "measured", ratio: 1.42, processBytes: 123456, specBytes: 87000 },
      });

      const humanLines = renderHuman(report).split("\n");
      const json = renderJson(report);

      // Present in human = a line that begins with the label (a block heading or a
      // labelled row), so a dropped metric leaves the set on the human side.
      const humanMetricKeys = Object.entries(METRIC_LABEL_TO_JSON_KEY)
        .filter(([label]) => humanLines.some((line) => line.startsWith(label)))
        .map(([, key]) => key);
      const jsonMetricKeys = Object.keys(json).filter((k) => k !== "schemaVersion");

      // Set-equality in both directions: a metric printed in one mode only goes red.
      expect(new Set(humanMetricKeys)).toEqual(new Set(jsonMetricKeys));
      expect(humanMetricKeys.length).toBe(Object.keys(METRIC_LABEL_TO_JSON_KEY).length);
    });

    it("AT-06 / EC-05: the single-feature human report lists malformed basenames verbatim, and omits the row when the list is empty (BR-17)", async () => {
      const { renderHuman } = await import("../lib/stats.mjs");
      const withMalformed = buildSingleReport({
        reviewRounds: {
          byDocType: buildByDocType({}),
          malformed: ["CROSS-REVIEW-pm-REQ-v01.md", "CROSS-REVIEW-pm-FSPEC-v01.md"],
        },
      });
      const withoutMalformed = buildSingleReport({
        reviewRounds: { byDocType: buildByDocType({}), malformed: [] },
      });

      const human = renderHuman(withMalformed).split("\n");
      const emptyHuman = renderHuman(withoutMalformed);

      // EC-05: the basename itself is named, in the single-feature human surface.
      expect(human).toEqual(
        expect.arrayContaining([
          "  malformed: CROSS-REVIEW-pm-REQ-v01.md, CROSS-REVIEW-pm-FSPEC-v01.md",
        ]),
      );
      // The `> 0` guard's other side: no row at all when nothing is malformed.
      expect(emptyHuman).not.toEqual(expect.stringContaining("malformed"));
    });

    it("fleet: malformed renders as a count (human) vs a list (JSON); halts render as '{n} ({r} resolved)' (human) vs per-phase entries (JSON)", async () => {
      const { renderHuman, renderJson } = await import("../lib/stats.mjs");
      const featureStats = buildFeatureStats({
        feature: "feature-a",
        dir: "/repo/docs/feature-a",
        reviewRounds: {
          byDocType: buildByDocType({}),
          malformed: ["CROSS-REVIEW-pm-REQ-v01.md", "CROSS-REVIEW-pm-FSPEC-v01.md"],
        },
        // Three halts against two malformed basenames: the counts differ, so the
        // malformed conjunct can never be aliased by the halts cell (or vice versa).
        halts: [
          { phase: "D", resolution: "resolved" },
          { phase: "F", resolution: "open" },
          { phase: "PR", resolution: "open" },
        ],
      });
      const report = { kind: "fleet", results: [featureStats], unclassified: [] };

      const human = renderHuman(report);
      const json = renderJson(report);

      // D-7's two reductions, and only those two: malformed as a count, not the basenames.
      expect(human).not.toEqual(expect.stringContaining("CROSS-REVIEW-pm-REQ-v01.md"));
      // The rendered cell, not a loose substring: "malformed=2" cannot be satisfied
      // by any other cell on the row.
      expect(human).toEqual(expect.stringContaining("malformed=2"));
      // halts as "{n} ({r} resolved)" — three halts, one resolved.
      expect(human).toEqual(expect.stringContaining("Halts=3 (1 resolved)"));

      // Every remaining field is recoverable from the JSON entry, in full.
      expect(json.features["feature-a"].reviewRounds.malformed).toEqual([
        "CROSS-REVIEW-pm-REQ-v01.md",
        "CROSS-REVIEW-pm-FSPEC-v01.md",
      ]);
      expect(json.features["feature-a"].halts).toEqual([
        { phase: "D", resolution: "resolved" },
        { phase: "F", resolution: "open" },
        { phase: "PR", resolution: "open" },
      ]);
    });

    it("fleet: the JSON document's unclassified array is set-equal to the human-marked rows", async () => {
      const { renderHuman, renderJson } = await import("../lib/stats.mjs");
      const report = {
        kind: "fleet",
        results: [buildFeatureStats({ feature: "feature-a", dir: "/repo/docs/feature-a" })],
        unclassified: ["_odd-dir-one", "_odd-dir-two"],
      };

      const human = renderHuman(report);
      const json = renderJson(report);

      expect(human).toEqual(expect.stringContaining("_odd-dir-one"));
      expect(human).toEqual(expect.stringContaining("_odd-dir-two"));
      expect(new Set(json.unclassified)).toEqual(new Set(["_odd-dir-one", "_odd-dir-two"]));
    });
  });
});
