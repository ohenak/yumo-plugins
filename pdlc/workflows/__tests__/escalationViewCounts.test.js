import fc from "fast-check";

// escalationViewCounts.test.js — PLAN P2-03 (red) / P2-04 (green).
//
// `blockedFeatureCounts({queueEntries, frontmatterDeps}) -> Map<string, number>` (TSPEC
// *Interfaces*). For an entry naming feature F, the count is the number of `QUEUE.md` rows
// whose status is not `done` that reach F through the transitive closure of the **effective**
// dependency union — `QUEUE.md`'s `Depends-On` column ∪ the REQ frontmatter's own
// `depends-on` (`Array.from(new Set([...(entry.dependsOn || []), ...(fm.dependsOn || [])]))`
// in `orchestrate-queue.js`, feeding `precheckDependencies`) — excluding F itself
// (FSPEC BR-13, E-10/E-11/E-12; PROP-VIEW-02/03/05; AT-23, AT-42).
//
// `pdlc/workflows/lib/escalation-view.mjs` already exists (P2-02's deliverable) but does not
// export `blockedFeatureCounts` yet — that export is P2-04's. Every block below is therefore
// committed `.skip`ped, titled "P2-04: ...", and un-skipped by P2-04. The dynamic `await
// import` matches the P2-01/P2-02 convention so a future missing-export shape still loads.

/** Sorted `[feature, count]` pairs — order-independent equality for a `Map`. */
function sortedEntries(counts) {
  return Array.from(counts.entries()).sort(([a], [b]) => a.localeCompare(b));
}

// ─── PROP-VIEW-02 / E-11 / AT-23 — effective union, frontmatter-only dependency ─────
//
// `downstream`'s `QUEUE.md` `Depends-On` column is empty; its dependency on `upstream` is
// declared **only** in the REQ frontmatter. The union must still resolve it, so counting
// `upstream`'s blocked features over the union yields 1 (`downstream`); the same fixture
// counted from the `Depends-On` column alone (frontmatter dropped) must yield a *strictly
// smaller* number (0) — asserting the union count alone would also pass a column-only
// implementation whose fixture happened to declare both (PROP-VIEW-02's own oracle note).
describe("blockedFeatureCounts — effective dependency union (PLAN P2-03/P2-04, PROP-VIEW-02, E-11, AT-23)", () => {
  test("P2-04: a frontmatter-only dependency is counted, and column-only under-counts", async () => {
    const { blockedFeatureCounts } = await import("../lib/escalation-view.mjs");

    const queueEntries = [
      { feature: "upstream", status: "pending", dependsOn: [] },
      { feature: "downstream", status: "pending", dependsOn: [] },
    ];
    const frontmatterDeps = new Map([["downstream", ["upstream"]]]);

    const unionCounts = blockedFeatureCounts({ queueEntries, frontmatterDeps });
    expect(unionCounts.get("upstream")).toBe(1);

    const columnOnlyCounts = blockedFeatureCounts({
      queueEntries,
      frontmatterDeps: new Map(),
    });
    expect(columnOnlyCounts.get("upstream") ?? 0).toBe(0);

    // The differential is what pins the union: the column-only run must be strictly
    // smaller than the union run for the same fixture.
    expect(columnOnlyCounts.get("upstream") ?? 0).toBeLessThan(unionCounts.get("upstream"));
  });
});

// ─── PROP-VIEW-03 / E-10 — feature with no queue row counts 0 ──────────────────────
describe("blockedFeatureCounts — feature with no queue row (PLAN P2-03/P2-04, PROP-VIEW-03, E-10)", () => {
  test("P2-04: an entry naming a feature absent from QUEUE.md returns no key, count 0", async () => {
    const { blockedFeatureCounts } = await import("../lib/escalation-view.mjs");

    const queueEntries = [{ feature: "real-feature", status: "pending", dependsOn: [] }];
    const counts = blockedFeatureCounts({ queueEntries, frontmatterDeps: new Map() });

    // "returns no key ⇒ count 0" (E-10) — the map has no entry for the ghost feature; the
    // caller reads absence as 0 rather than the map fabricating a zero-valued key.
    expect(counts.has("ghost-feature")).toBe(false);
    expect(counts.get("ghost-feature") ?? 0).toBe(0);
  });
});

// ─── transitive closure, excluding the entry's own feature ────────────────────────
describe("blockedFeatureCounts — transitive closure over the dependency chain (PLAN P2-03/P2-04, FSPEC 'Blocked-feature count')", () => {
  test("P2-04: a chain a<-b<-c counts transitively, and each feature excludes itself from its own count", async () => {
    const { blockedFeatureCounts } = await import("../lib/escalation-view.mjs");

    // c depends on b depends on a: both b (directly) and c (transitively) reach a.
    const queueEntries = [
      { feature: "a", status: "pending", dependsOn: [] },
      { feature: "b", status: "pending", dependsOn: ["a"] },
      { feature: "c", status: "pending", dependsOn: ["b"] },
    ];
    const counts = blockedFeatureCounts({ queueEntries, frontmatterDeps: new Map() });

    expect(counts.get("a")).toBe(2); // b and c both reach a
    expect(counts.get("b")).toBe(1); // only c reaches b
    expect(counts.get("c") ?? 0).toBe(0); // nothing depends on c
  });
});

// ─── PROP-VIEW-05 / E-12 / AT-42 — cycle terminates, counted at most once, bounded ─
describe("blockedFeatureCounts — cycle in the effective graph (PLAN P2-03/P2-04, PROP-VIEW-05, E-12, AT-42)", () => {
  test("P2-04: a three-cycle terminates, each feature is counted at most once, excluding itself", async () => {
    const { blockedFeatureCounts } = await import("../lib/escalation-view.mjs");

    // a -> b -> c -> a: a full cycle. Without a visited set, a naive BFS/DFS never
    // terminates; with one, every OTHER feature in the cycle reaches every feature
    // exactly once, and no feature counts itself.
    const queueEntries = [
      { feature: "a", status: "pending", dependsOn: ["b"] },
      { feature: "b", status: "pending", dependsOn: ["c"] },
      { feature: "c", status: "pending", dependsOn: ["a"] },
    ];
    const counts = blockedFeatureCounts({ queueEntries, frontmatterDeps: new Map() });

    // Termination itself is asserted by the test simply completing (jest's own timeout
    // would fail this test on a non-terminating implementation).
    expect(counts.get("a")).toBe(2);
    expect(counts.get("b")).toBe(2);
    expect(counts.get("c")).toBe(2);

    const nonDoneRowCount = queueEntries.filter((row) => row.status !== "done").length;
    for (const value of counts.values()) {
      expect(value).toBeLessThanOrEqual(nonDoneRowCount);
    }
  });

  // The fixture above pins ONE named cycle (PROPERTIES' documentation half). This law
  // explores the space fast-check-style: arbitrary graphs (cycles included) over a
  // fixed feature-name alphabet, asserting the bound holds and the result is invariant
  // under permutation of the input rows — the permutation-invariance conjunct is what
  // catches a visited-set traversal that depends on row order (PROP-VIEW-05's oracle).
  test("P2-04: over arbitrary graphs including cycles, every count is bounded and the result is permutation-invariant", async () => {
    const { blockedFeatureCounts } = await import("../lib/escalation-view.mjs");

    const featureNames = ["f0", "f1", "f2", "f3", "f4"];
    const statusArb = fc.constantFrom("pending", "in-progress", "done");
    const depsArbFor = (self) => fc.subarray(featureNames.filter((f) => f !== self));

    const rowsArb = fc
      .tuple(
        ...featureNames.map((f) =>
          fc.record({ feature: fc.constant(f), status: statusArb, dependsOn: depsArbFor(f) }),
        ),
      )
      .map((tuple) => Array.from(tuple));

    const fmArb = fc
      .tuple(
        ...featureNames.map((f) => fc.record({ feature: fc.constant(f), deps: depsArbFor(f) })),
      )
      .map((tuple) => new Map(Array.from(tuple).map((r) => [r.feature, r.deps])));

    const permutedPairArb = rowsArb.chain((rows) =>
      fc
        .shuffledSubarray(rows, { minLength: rows.length, maxLength: rows.length })
        .map((shuffled) => ({ rows, shuffled })),
    );

    fc.assert(
      fc.property(permutedPairArb, fmArb, ({ rows, shuffled }, frontmatterDeps) => {
        const counts = blockedFeatureCounts({ queueEntries: rows, frontmatterDeps });
        const permutedCounts = blockedFeatureCounts({
          queueEntries: shuffled,
          frontmatterDeps,
        });

        expect(sortedEntries(permutedCounts)).toEqual(sortedEntries(counts));

        const nonDoneRowCount = rows.filter((row) => row.status !== "done").length;
        for (const value of counts.values()) {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(nonDoneRowCount);
        }
      }),
    );
  });
});
