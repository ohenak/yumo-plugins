// statsDiscovery.test.js — PLAN T-05 (pdlc-stats).
//
// Reds `discoverFeatures` over `fakeStatsIo` (TSPEC §3.3, §4.4): BR-02 live-before-archive
// (AT-02 / PROP-DISC-01), the `isDirectory`-only discovery discipline (AT-18's constructed
// roots, EC-18's case-pair leg, EC-20's empty root / PROP-DISC-10), the `unclassified`
// outcome (AT-19's fixture leg / PROP-DISC-07), and the empty-feature-directory-is-a-row
// discipline (AT-26 / PROP-ERR-07).
//
// `pdlc/workflows/lib/stats.mjs` ships `discoverFeatures`, and every test here runs against
// it. The module is loaded via a dynamic `await import` inside each test body rather than a
// top-level import, so a load-time failure in the module surfaces as failing tests rather
// than as an uncollectable file.
import { fakeStatsIo } from "./helpers/statsDoubles.js";

const NON_FEATURE_DIRS_LITERAL = Object.freeze([
  "_queue",
  "_constraints",
  "_decisions",
  "design",
  "requirements",
  "ideas",
  "discarded",
  "completed",
]);

describe("T-14: discoverFeatures (TSPEC §3.3, §4.4)", () => {
  it("BR-02: prefers the live directory over the archived one for a feature present in both (AT-02, PROP-DISC-01)", async () => {
    const { discoverFeatures } = await import("../lib/stats.mjs");
    const io = fakeStatsIo({
      "/repo/docs": { dirs: ["dual-feature"] },
      "/repo/docs/completed": { dirs: ["dual-feature"] },
      "/repo/docs/dual-feature": { files: ["REQ-dual-feature.md"] },
      "/repo/docs/completed/dual-feature": { files: ["FSPEC-dual-feature.md"] },
      "/repo/docs/dual-feature/REQ-dual-feature.md": "live",
      "/repo/docs/completed/dual-feature/FSPEC-dual-feature.md": "archived",
    });

    const { features } = discoverFeatures(io, "/repo/docs");

    expect(features).toHaveLength(1);
    expect(features[0]).toEqual({ name: "dual-feature", dir: "/repo/docs/dual-feature" });
  });

  it("BR-02: falls back to the archived directory when no live directory exists", async () => {
    const { discoverFeatures } = await import("../lib/stats.mjs");
    const io = fakeStatsIo({
      "/repo/docs": { dirs: [] },
      "/repo/docs/completed": { dirs: ["archived-only"] },
      "/repo/docs/completed/archived-only": { files: [] },
    });

    const { features } = discoverFeatures(io, "/repo/docs");

    expect(features).toHaveLength(1);
    expect(features[0]).toEqual({
      name: "archived-only",
      dir: "/repo/docs/completed/archived-only",
    });
  });

  it("AT-18/BR-25: considers immediate directories only — a loose file at the root yields no row", async () => {
    const { discoverFeatures } = await import("../lib/stats.mjs");
    const io = fakeStatsIo({
      "/repo/docs": {
        dirs: ["real-feature"],
        files: ["PLAN-loose-file-at-root.md"],
      },
      "/repo/docs/real-feature": { files: [] },
    });

    const { features } = discoverFeatures(io, "/repo/docs");

    expect(features).toEqual([{ name: "real-feature", dir: "/repo/docs/real-feature" }]);
  });

  it("EC-20/PROP-DISC-10: a root holding only NON_FEATURE_DIRS members yields an empty report at exit-shaped success", async () => {
    const { discoverFeatures } = await import("../lib/stats.mjs");
    const tree = {
      "/repo/docs": { dirs: [...NON_FEATURE_DIRS_LITERAL] },
      "/repo/docs/completed": { dirs: [] },
    };
    for (const name of NON_FEATURE_DIRS_LITERAL) {
      if (name === "completed") continue;
      tree[`/repo/docs/${name}`] = { files: [] };
    }
    const io = fakeStatsIo(tree);

    const { features, unclassified } = discoverFeatures(io, "/repo/docs");

    expect(features).toEqual([]);
    expect(unclassified).toEqual([]);
  });

  it("EC-18/BR-04: two directories whose names differ only in case are two distinct rows, in lexicographic order", async () => {
    const { discoverFeatures } = await import("../lib/stats.mjs");
    const io = fakeStatsIo({
      "/repo/docs": { dirs: ["feature-x", "Feature-x"] },
      "/repo/docs/feature-x": { files: [] },
      "/repo/docs/Feature-x": { files: [] },
    });

    const { features } = discoverFeatures(io, "/repo/docs");

    expect(features).toEqual([
      { name: "Feature-x", dir: "/repo/docs/Feature-x" },
      { name: "feature-x", dir: "/repo/docs/feature-x" },
    ]);
  });

  it("AT-19/PROP-DISC-07: a directory in neither NON_FEATURE_DIRS nor recognisable as a feature surfaces as unclassified, not as a feature", async () => {
    const { discoverFeatures } = await import("../lib/stats.mjs");
    const io = fakeStatsIo({
      "/repo/docs": { dirs: ["_evidence", "real-feature"] },
      "/repo/docs/_evidence": { files: [] },
      "/repo/docs/real-feature": { files: ["REQ-real-feature.md"] },
    });

    const { features, unclassified } = discoverFeatures(io, "/repo/docs");

    expect(unclassified).toEqual(["_evidence"]);
    expect(features.map((f) => f.name)).toEqual(["real-feature"]);
    expect(features.some((f) => f.name === "_evidence")).toBe(false);
  });

  it("AT-26/PROP-ERR-07: a readable but empty feature directory is a normal discovered row, not omitted", async () => {
    const { discoverFeatures } = await import("../lib/stats.mjs");
    const io = fakeStatsIo({
      "/repo/docs": { dirs: ["empty-feature"] },
      "/repo/docs/empty-feature": { files: [] },
    });

    const { features } = discoverFeatures(io, "/repo/docs");

    expect(features).toEqual([{ name: "empty-feature", dir: "/repo/docs/empty-feature" }]);
  });
});
