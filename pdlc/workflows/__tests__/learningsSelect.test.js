// learningsSelect.test.js — PLAN LI-07 (RED, greened by LI-16 / LI-19; TSPEC §T.5).
//
// Owns exactly nine ATs — eligibility, ordering and count rules only, over `selectLearnings`
// (TSPEC §I.3): LI-AT-04, LI-AT-07 (both regimes — `COUNT-BINDING` and its mirror
// `BYTES-BINDING`), LI-AT-08, LI-AT-09, LI-AT-10, LI-AT-13, LI-AT-15, LI-AT-16, LI-AT-28. The
// material-extraction claims (AT-11, AT-12) belong to `learningsBlock.test.js`, not here
// (TSPEC §T.5).
//
// `LI-AT-15` is written WHOLE, as one test, with FSPEC AT-15's full four clauses (PM F-03, TE
// F-03) — not the three a careless reading suggests. Given the nested
// `docs/discarded/{feature}/LEARNINGS-*.md` fixture: (1) nothing is selected, (2) the report
// carries corpus-level `RSN-EMPTY`, (3) no discarded document appears in any record. Given the
// one-file `docs/discarded/LEARNINGS-x.md` fixture: (4) it is a corpus member, is selected, and
// carries no exclusion reason (E-35). Clauses (1) and (4) are the pure core's, greened by
// LI-16; clauses (2) and (3) drive the L2 shell and the injector through `helpers/seams.js` and
// stay red until LI-19 (batch 11) — so this whole test's `.skip` is titled with LI-19, not
// LI-16, since LI-19 is the task that finally removes it. Clause (4) is the positive half of
// the AC-2.6 pair and is not dropped: without it, clause (1) is an absence-only oracle over
// path handling that a "select nothing, ever" implementation would satisfy.
//
// Every production import is deferred to a dynamic `await import` inside each test body — none
// of `selectLearnings`, `gatherLearningsCorpus` or `buildLearningsInjector` exist in
// `orchestrate-dev.js` yet — so this file still loads and the `.skip`s take effect (a top-level
// `import { selectLearnings } from "../orchestrate-dev.js"` would throw at module-load time for
// a name the module does not export, crashing the whole file before any skip logic ran).
//
// Fixtures come from `helpers/learningsFixtures.js` (LI-02) only — no ad-hoc corpus builder is
// defined here. `entriesFromCorpus` below is a plain shape adapter from that helper's
// `{paths, contents}` corpus shape to `selectLearnings`'s `CorpusEntry[]` input shape (TSPEC
// §I.3); it builds no fixture data of its own.

import fc from "fast-check";

import {
  buildLearningsCorpus,
  buildCountBindingCorpus,
  buildBytesBindingCorpus,
  buildDiscardedNestedCorpus,
  buildDiscardedDirectCorpus,
  buildCompletedMixedCorpus,
  buildLearningsDocument,
  COUNT_BINDING_THRESHOLDS,
  LEARNINGS_CORPUS_DEFAULT_THRESHOLDS,
} from "./helpers/learningsFixtures.js";
import { fakeGit, fakeFs } from "./helpers/seams.js";

/**
 * Adapt a `buildLearningsCorpus`-shaped `{paths, contents}` corpus into `selectLearnings`'s
 * `CorpusEntry[]` input (TSPEC §I.3's typedef: `{path, feature, text, readOk, excluded}`).
 * `selfPath`, when given, is marked `excluded: "RSN-SELF"` with `text: null, readOk: false` —
 * the shape the shell (never this adapter) is contracted to produce (TSPEC §D.6).
 *
 * @param {{paths: string[], contents: Record<string,string>}} corpus
 * @param {{feature?: string, selfPath?: string}} [opts]
 */
function entriesFromCorpus(corpus, opts = {}) {
  const feature = opts.feature ?? "dispatching-feature";
  return corpus.paths.map((path) => {
    if (opts.selfPath && path === opts.selfPath) {
      return { path, feature, text: null, readOk: false, excluded: "RSN-SELF" };
    }
    return { path, feature, text: corpus.contents[path], readOk: true, excluded: null };
  });
}

describe("learningsSelect — eligibility, ordering and count (TSPEC §T.5, PLAN LI-07)", () => {
  test("LI-16: LI-AT-04 — a self document is excluded, carries RSN-SELF, and no corpus-level empty is recorded", async () => {
    const { selectLearnings } = await import("../orchestrate-dev.js");

    const feature = "self-check";
    const selfPath = `docs/${feature}/LEARNINGS-${feature}.md`;
    const corpus = buildLearningsCorpus([
      { path: selfPath, doc: { feature, dateCompleted: "2026-01-05", sections: [{ name: "Cross-Feature Patterns", bodyBytes: 100 }] } },
      {
        path: "docs/self-check-other/LEARNINGS-self-check-other.md",
        doc: { feature: "self-check-other", dateCompleted: "2026-01-01", sections: [{ name: "Cross-Feature Patterns", bodyBytes: 100 }] },
      },
    ]);
    const entries = entriesFromCorpus(corpus, { feature, selfPath });

    const result = selectLearnings({
      entries,
      thresholds: LEARNINGS_CORPUS_DEFAULT_THRESHOLDS,
    });

    expect(result.selected.map((d) => d.path)).not.toContain(selfPath);
    expect(result.rejected).toContainEqual({ path: selfPath, reason: "RSN-SELF" });
    expect(result.selected.map((d) => d.path)).toEqual([
      "docs/self-check-other/LEARNINGS-self-check-other.md",
    ]);
    // CR round 1, TE F-04's control: these fixtures now carry a BR-6 priority section, so the
    // ordering asserted above orders documents that actually contribute a byte.
    expect(result.selected.every((d) => d.bytes > 0)).toBe(true);
  });

  test("LI-16: LI-AT-07 — count-binding regime: exactly 3 contribute, exactly 5 carry RSN-COUNT, no RSN-BYTES", async () => {
    const { selectLearnings } = await import("../orchestrate-dev.js");

    const corpus = buildCountBindingCorpus();
    const entries = entriesFromCorpus(corpus);

    const result = selectLearnings({
      entries,
      thresholds: COUNT_BINDING_THRESHOLDS,
    });

    expect(result.selected).toHaveLength(3);
    expect(result.rejected.filter((r) => r.reason === "RSN-COUNT")).toHaveLength(5);
    expect(result.rejected.filter((r) => r.reason === "RSN-BYTES")).toHaveLength(0);
    expect(result.rejected).toHaveLength(5);
  });

  test("LI-16: LI-AT-07 — bytes-binding regime: the byte bound cuts first, contributing count strictly below maxDocuments, RSN-BYTES only", async () => {
    const { selectLearnings } = await import("../orchestrate-dev.js");

    const corpus = buildBytesBindingCorpus();
    const entries = entriesFromCorpus(corpus);

    const result = selectLearnings({
      entries,
      thresholds: LEARNINGS_CORPUS_DEFAULT_THRESHOLDS,
    });

    // CR round 1, PM F-06 / TE F-07 (Medium). The `RSN-COUNT` row count here used to be asserted
    // as ZERO, which held only because the implementation's unspec'd `propagateBytes` guard
    // relabelled the three out-of-window documents `RSN-BYTES`. `BYTES-BINDING` is 8 documents
    // against `maxDocuments: 5` (TSPEC §T.4), so the count bound cuts three of them before the
    // total bound is consulted at all — "the count bound does not bind" was never true of this
    // fixture, and only the relabelling hid it. Under BR-5's stated rule ("the count bound is
    // applied first ... documents cut here carry `RSN-COUNT`") those three carry `RSN-COUNT`.
    // TSPEC §T.4's "each asserted *not* to bind where the other does" is routed upstream as
    // `ERRATUM: TSPEC`; what AT-07 itself asks for — "the contributing count is strictly below
    // `maxDocuments` with `RSN-BYTES` rows" — is asserted exactly, below.
    expect(result.selected.length).toBeLessThan(LEARNINGS_CORPUS_DEFAULT_THRESHOLDS.maxDocuments);
    // The byte bound is what pushed the contributing count below `maxDocuments`: the shortfall
    // is accounted for, document for document, by `RSN-BYTES` rows and by nothing else.
    const byteRows = result.rejected.filter((r) => r.reason === "RSN-BYTES");
    expect(byteRows.length).toBe(
      LEARNINGS_CORPUS_DEFAULT_THRESHOLDS.maxDocuments - result.selected.length
    );
    expect(byteRows.length).toBeGreaterThan(0);
    // And the count bound accounts for the rest — the documents that never entered the window.
    expect(result.rejected.filter((r) => r.reason === "RSN-COUNT")).toHaveLength(
      8 - LEARNINGS_CORPUS_DEFAULT_THRESHOLDS.maxDocuments
    );
    expect(result.selected).toHaveLength(8 - result.rejected.length);
  });

  test("LI-16: LI-AT-08 — an eligible set larger than maxDocuments selects the highest-ordered under BR-4, every unselected carries RSN-COUNT", async () => {
    const { selectLearnings } = await import("../orchestrate-dev.js");

    // 5 documents, distinct dates, small bodies so the byte bound never binds.
    const corpus = buildLearningsCorpus(
      ["2026-01-01", "2026-01-02", "2026-01-03", "2026-01-04", "2026-01-05"].map(
        (dateCompleted, i) => ({
          path: `docs/at08-${i + 1}/LEARNINGS-at08-${i + 1}.md`,
          doc: {
            feature: `at08-${i + 1}`,
            dateCompleted,
            sections: [{ name: "Cross-Feature Patterns", bodyBytes: 100 }],
          },
        })
      )
    );
    const entries = entriesFromCorpus(corpus);

    const result = selectLearnings({
      entries,
      thresholds: { maxDocuments: 3, maxBytesPerDocument: 6000, maxTotalBytes: 20000 },
    });

    // Most recent first (BR-4): the top 3 dates are at08-5, at08-4, at08-3.
    expect(result.selected.map((d) => d.path)).toEqual([
      "docs/at08-5/LEARNINGS-at08-5.md",
      "docs/at08-4/LEARNINGS-at08-4.md",
      "docs/at08-3/LEARNINGS-at08-3.md",
    ]);
    expect(result.rejected).toEqual(
      expect.arrayContaining([
        { path: "docs/at08-1/LEARNINGS-at08-1.md", reason: "RSN-COUNT" },
        { path: "docs/at08-2/LEARNINGS-at08-2.md", reason: "RSN-COUNT" },
      ])
    );
    expect(result.rejected).toHaveLength(2);
  });

  test("LI-16: LI-AT-09 — two documents sharing a Date Completed value tiebreak by path byte order, identically across two runs", async () => {
    const { selectLearnings } = await import("../orchestrate-dev.js");

    const corpus = buildLearningsCorpus([
      {
        path: "docs/at09-zzz/LEARNINGS-at09-zzz.md",
        doc: { feature: "at09-zzz", dateCompleted: "2026-02-01", sections: [{ name: "Cross-Feature Patterns", bodyBytes: 100 }] },
      },
      {
        path: "docs/at09-aaa/LEARNINGS-at09-aaa.md",
        doc: { feature: "at09-aaa", dateCompleted: "2026-02-01", sections: [{ name: "Cross-Feature Patterns", bodyBytes: 100 }] },
      },
    ]);
    const entries = entriesFromCorpus(corpus);
    const args = {
      entries,
      thresholds: LEARNINGS_CORPUS_DEFAULT_THRESHOLDS,
    };

    const first = selectLearnings(args);
    const second = selectLearnings(args);

    const expectedOrder = [
      "docs/at09-aaa/LEARNINGS-at09-aaa.md",
      "docs/at09-zzz/LEARNINGS-at09-zzz.md",
    ];
    expect(first.selected.map((d) => d.path)).toEqual(expectedOrder);
    expect(second.selected.map((d) => d.path)).toEqual(expectedOrder);
    // CR round 1, TE F-04's control: both documents carry a BR-6 priority section, so the
    // tiebreak asserted above orders documents that actually contribute a byte.
    expect(first.selected.every((d) => d.bytes > 0)).toBe(true);
  });

  test("LI-16: LI-AT-10 — no-row, trailing-text and unparseable dates all stay eligible; the trailing-text date reads correctly; the order is a pure function of (key, path)", async () => {
    const { selectLearnings } = await import("../orchestrate-dev.js");

    // at10-norow: no Date Completed row at all (null cell -> unparseable/absent).
    // at10-trailing: a Date Completed value carrying free text after the date (E-13) — must
    //   still be read as 2026-03-15, ranking ahead of at10-early's 2026-03-01.
    // at10-unparseable: a Date Completed value that is not a date at all.
    // at10-early: a clean, earlier date, for the trailing-text document to out-rank.
    const corpus = buildLearningsCorpus([
      { path: "docs/at10-norow/LEARNINGS-at10-norow.md", doc: { feature: "at10-norow", dateCompleted: null, sections: [{ name: "Cross-Feature Patterns", bodyBytes: 100 }] } },
      {
        path: "docs/at10-trailing/LEARNINGS-at10-trailing.md",
        doc: {
          feature: "at10-trailing",
          dateCompleted: "2026-03-15 (Phase H harvest; partial close-out)",
          sections: [{ name: "Cross-Feature Patterns", bodyBytes: 100 }],
        },
      },
      {
        path: "docs/at10-unparseable/LEARNINGS-at10-unparseable.md",
        doc: { feature: "at10-unparseable", dateCompleted: "not-a-date", sections: [{ name: "Cross-Feature Patterns", bodyBytes: 100 }] },
      },
      { path: "docs/at10-early/LEARNINGS-at10-early.md", doc: { feature: "at10-early", dateCompleted: "2026-03-01", sections: [{ name: "Cross-Feature Patterns", bodyBytes: 100 }] } },
    ]);
    const entries = entriesFromCorpus(corpus);
    const args = {
      entries,
      thresholds: LEARNINGS_CORPUS_DEFAULT_THRESHOLDS,
    };

    const result = selectLearnings(args);

    // All four remain eligible: none rejected.
    expect(result.selected).toHaveLength(4);
    // The trailing-text document's date is read correctly and ranks ahead of the earlier,
    // clean-dated document; the two null-keyed documents (no row, unparseable) rank last, by
    // the path tiebreak, byte-ascending.
    expect(result.selected.map((d) => d.path)).toEqual([
      "docs/at10-trailing/LEARNINGS-at10-trailing.md",
      "docs/at10-early/LEARNINGS-at10-early.md",
      "docs/at10-norow/LEARNINGS-at10-norow.md",
      "docs/at10-unparseable/LEARNINGS-at10-unparseable.md",
    ]);
    // CR round 1, TE F-04's control: these fixtures now carry a BR-6 priority section, so the
    // ordering asserted above orders documents that actually contribute a byte.
    expect(result.selected.every((d) => d.bytes > 0)).toBe(true);


    // BR-4's negative invariants (git order, ctime, mtime, wall clock) are not selectLearnings
    // inputs at all — the pure function consults only entry bytes and paths. Simulating "the
    // corpus's git/ctime order is the reverse of Date Completed order, mtimes permuted, wall
    // clock differs between runs" reduces, at this pure layer, to: re-running over the SAME
    // entries — regardless of the array order they arrive in — yields an identical selection
    // and order (the function is a pure function of (key, path) and nothing else).
    const shuffledEntries = [entries[3], entries[1], entries[0], entries[2]];
    const second = selectLearnings({ ...args, entries: shuffledEntries });
    expect(second.selected.map((d) => d.path)).toEqual(result.selected.map((d) => d.path));
  });

  test("LI-16: LI-AT-13 — the total bound drops whole documents from the low end of the count-taken set, no mid-document cut, no back-fill, selected is a prefix", async () => {
    const { selectLearnings } = await import("../orchestrate-dev.js");

    // 8 eligible documents, maxDocuments 5, each document's material bounded to 5000 bytes
    // (well under the 6000 maxBytesPerDocument, so no document is itself cut) but sized so
    // maxTotalBytes admits only 4 of the top 5: 4*5000=20000 fits exactly, 5*5000=25000 does
    // not.
    //
    // `bodyBytes` sizes the section BODY, but §D.5's material pool is "the section
    // headings and bodies taken from that document under BR-6" — so the extracted
    // material is `## Cross-Feature Patterns` (25 bytes) + the blank line separating
    // heading from body (2 bytes) + `bodyBytes`. 4973 is therefore what lands each
    // document's material on exactly 5000 bytes, which is what makes the arithmetic
    // above a round 4*5000 = 20000 boundary case rather than an approximate one.
    //
    // CR round 1, TE F-07 (Medium). This comment used to carry a second, disqualifying
    // reason for 4973: that at 5000 "the byte failure would move off the window's last
    // slot and propagate RSN-BYTES onto the overflow the expectations below record as
    // RSN-COUNT" — an expected value chosen to fit the implementation's unspec'd
    // `propagateBytes` guard. That guard is gone (BR-5: the count bound is applied first
    // and its cut documents carry `RSN-COUNT`), so where the byte failure lands inside the
    // window no longer changes any overflow document's reason id. The companion test below
    // pins exactly that, at both slots.
    const dates = [
      "2026-04-08",
      "2026-04-07",
      "2026-04-06",
      "2026-04-05",
      "2026-04-04",
      "2026-04-03",
      "2026-04-02",
      "2026-04-01",
    ];
    const corpus = buildLearningsCorpus(
      dates.map((dateCompleted, i) => ({
        path: `docs/at13-${i + 1}/LEARNINGS-at13-${i + 1}.md`,
        doc: {
          feature: `at13-${i + 1}`,
          dateCompleted,
          sections: [{ name: "Cross-Feature Patterns", bodyBytes: 4973 }],
        },
      }))
    );
    const entries = entriesFromCorpus(corpus);

    const result = selectLearnings({
      entries,
      thresholds: { maxDocuments: 5, maxBytesPerDocument: 6000, maxTotalBytes: 20000 },
    });

    // The ordered eligible set is at13-1 .. at13-8 (most recent first, by construction). Only
    // the top 4 fit inside maxTotalBytes; at13-5 — the lowest-ordered of the five the count
    // bound would otherwise take — is dropped RSN-BYTES, not cut mid-document, and its slot is
    // never back-filled from at13-6/7/8 (each of which is RSN-COUNT, having never entered the
    // count-taken five at all).
    const orderedPaths = dates.map((_, i) => `docs/at13-${i + 1}/LEARNINGS-at13-${i + 1}.md`);
    expect(result.selected.map((d) => d.path)).toEqual(orderedPaths.slice(0, 4));
    // The selected set is a prefix of the ordered eligible set.
    expect(orderedPaths.slice(0, result.selected.length)).toEqual(
      result.selected.map((d) => d.path)
    );
    const expectedReasons = {
      [orderedPaths[4]]: "RSN-BYTES",
      [orderedPaths[5]]: "RSN-COUNT",
      [orderedPaths[6]]: "RSN-COUNT",
      [orderedPaths[7]]: "RSN-COUNT",
    };
    // Set equality over the reason id recorded for each of the 8 documents (the 4 selected
    // carry no rejection row; the other 4 are asserted here, exactly).
    expect(Object.fromEntries(result.rejected.map((r) => [r.path, r.reason]))).toEqual(
      expectedReasons
    );
    expect(result.rejected).toHaveLength(4);

    // Second clause: a single document whose bounded material alone exceeds maxTotalBytes ->
    // empty selection, BR-8's rows present and empty (not a throw, not a missing field).
    const soloCorpus = buildLearningsCorpus([
      {
        path: "docs/at13-solo/LEARNINGS-at13-solo.md",
        doc: {
          feature: "at13-solo",
          dateCompleted: "2026-04-09",
          sections: [{ name: "Cross-Feature Patterns", bodyBytes: 5000 }],
        },
      },
    ]);
    const soloResult = selectLearnings({
      entries: entriesFromCorpus(soloCorpus),
      thresholds: { maxDocuments: 5, maxBytesPerDocument: 6000, maxTotalBytes: 1000 },
    });
    expect(soloResult.selected).toEqual([]);
    expect(soloResult.rejected).toEqual([
      { path: "docs/at13-solo/LEARNINGS-at13-solo.md", reason: "RSN-BYTES" },
    ]);
  });

  test("LI-16: CR round 1 (TE F-07) — an overflow document's reason id does not depend on where inside the window the total-byte bound first fails", async () => {
    const { selectLearnings } = await import("../orchestrate-dev.js");

    // The rule upstream states is cause-based (BR-5: the count bound "is applied first",
    // "documents cut here carry `RSN-COUNT`"; AC-3.2 defines the ids by cause). So for a
    // document the count bound removed before the total bound was consulted at all, the
    // recorded reason must be `RSN-COUNT` no matter what the window's byte outcome is.
    //
    // The shipped implementation used to relabel those documents `RSN-BYTES` whenever the
    // first byte failure landed anywhere but the window's LAST slot — a split no upstream
    // document states, and one an operator could not predict. This test is the falsifier:
    // it holds the corpus and `maxDocuments` fixed and moves the byte failure between the
    // window's last slot and its middle, asserting the out-of-window documents' reason ids
    // are invariant. Restoring the `firstByteFailIndex < window.length - 1` guard reds the
    // second case.
    const dates = [
      "2026-04-08",
      "2026-04-07",
      "2026-04-06",
      "2026-04-05",
      "2026-04-04",
      "2026-04-03",
      "2026-04-02",
      "2026-04-01",
    ];
    const orderedPaths = dates.map((_, i) => `docs/f07-${i + 1}/LEARNINGS-f07-${i + 1}.md`);
    const corpus = buildLearningsCorpus(
      dates.map((dateCompleted, i) => ({
        path: orderedPaths[i],
        doc: {
          feature: `f07-${i + 1}`,
          dateCompleted,
          sections: [{ name: "Cross-Feature Patterns", bodyBytes: 4973 }],
        },
      }))
    );
    const entries = entriesFromCorpus(corpus);
    const reasonsFor = (maxTotalBytes) => {
      const result = selectLearnings({
        entries,
        thresholds: { maxDocuments: 5, maxBytesPerDocument: 6000, maxTotalBytes },
      });
      return {
        selected: result.selected.map((d) => d.path),
        reasons: Object.fromEntries(result.rejected.map((r) => [r.path, r.reason])),
      };
    };

    // Each document's material is exactly 5000 bytes (25-byte heading + 2-byte separator +
    // 4973-byte body), so maxTotalBytes selects how many of the window's five slots fit.
    // Case A: 20000 -> 4 fit, the first byte failure is at window index 4, the LAST slot.
    const lastSlot = reasonsFor(20000);
    expect(lastSlot.selected).toEqual(orderedPaths.slice(0, 4));
    expect(lastSlot.reasons).toEqual({
      [orderedPaths[4]]: "RSN-BYTES",
      [orderedPaths[5]]: "RSN-COUNT",
      [orderedPaths[6]]: "RSN-COUNT",
      [orderedPaths[7]]: "RSN-COUNT",
    });

    // Case B: 10000 -> 2 fit, the first byte failure is at window index 2, well inside the
    // window. The three documents the count bound never admitted keep `RSN-COUNT`; only the
    // window's own casualties change.
    const midWindow = reasonsFor(10000);
    expect(midWindow.selected).toEqual(orderedPaths.slice(0, 2));
    expect(midWindow.reasons).toEqual({
      [orderedPaths[2]]: "RSN-BYTES",
      [orderedPaths[3]]: "RSN-BYTES",
      [orderedPaths[4]]: "RSN-BYTES",
      [orderedPaths[5]]: "RSN-COUNT",
      [orderedPaths[6]]: "RSN-COUNT",
      [orderedPaths[7]]: "RSN-COUNT",
    });

    // Stated as the invariant itself: the out-of-window documents' reason ids are identical
    // across the two runs.
    for (const path of orderedPaths.slice(5)) {
      expect(midWindow.reasons[path]).toBe(lastSlot.reasons[path]);
    }
  });

  test("LI-16: LI-AT-16 — docs/{p}/ and docs/completed/{p}/ are eligible on identical terms; location affects rank only through the path tiebreak", async () => {
    const { selectLearnings } = await import("../orchestrate-dev.js");

    const corpus = buildCompletedMixedCorpus();
    const entries = entriesFromCorpus(corpus);

    const result = selectLearnings({
      entries,
      thresholds: LEARNINGS_CORPUS_DEFAULT_THRESHOLDS,
    });

    // Both documents are eligible: neither is rejected, both selected.
    expect(result.selected).toHaveLength(2);
    expect(result.rejected).toEqual([]);
    // COMPLETED-MIXED's two dates are distinct (2026-03-04 > 2026-03-03), so rank here is
    // decided by BR-4's primary key, not by the path tiebreak — the completed-location document
    // is more recent and ranks first, proving location itself carries no eligibility or rank
    // bonus/penalty of its own.
    expect(result.selected.map((d) => d.path)).toEqual([
      "docs/completed/mixed-completed/LEARNINGS-mixed-completed.md",
      "docs/mixed-open/LEARNINGS-mixed-open.md",
    ]);
  });

  test("LI-16: LI-AT-28 — a document carrying none of BR-6's priority sections is dropped RSN-NO-MATERIAL, consumes no maxDocuments slot, and is not bounded; the rest of the corpus is used normally", async () => {
    const { selectLearnings } = await import("../orchestrate-dev.js");

    const corpus = buildLearningsCorpus([
      {
        path: "docs/at28-no-material/LEARNINGS-at28-no-material.md",
        doc: {
          feature: "at28-no-material",
          dateCompleted: "2026-05-02",
          // No BR-6 priority section headings at all — an unrelated section only.
          sections: [{ name: "Not A BR-6 Section", body: "Nothing here BR-6 recognises." }],
        },
      },
      {
        path: "docs/at28-normal/LEARNINGS-at28-normal.md",
        doc: {
          feature: "at28-normal",
          dateCompleted: "2026-05-01",
          sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }],
        },
      },
    ]);
    const entries = entriesFromCorpus(corpus);

    const result = selectLearnings({
      entries,
      thresholds: { maxDocuments: 1, maxBytesPerDocument: 6000, maxTotalBytes: 20000 },
    });

    // The no-material document consumes no maxDocuments slot: with maxDocuments: 1, the
    // normally-sectioned (but later-ranked) document still gets the one slot.
    expect(result.selected.map((d) => d.path)).toEqual([
      "docs/at28-normal/LEARNINGS-at28-normal.md",
    ]);
    expect(result.selected[0].bounded).toBe(false);
    expect(result.rejected).toEqual([
      { path: "docs/at28-no-material/LEARNINGS-at28-no-material.md", reason: "RSN-NO-MATERIAL" },
    ]);
  });

  // CR round 1, TE F-04. AT-28's own fixture names a section BR-6 does not recognise; this is
  // the OTHER shape of "yields no material" — a LEARNINGS document with no `##` heading line at
  // all. TSPEC §D.5/§T.6 make both the same predicate (`sections[] === []`, one branch), so both
  // must be dropped before the bounds. The shipped code carried an extra
  // `hasAnySectionHeadingLine(entry.text)` conjunct that no upstream document states, under which
  // THIS document stayed eligible, took the only slot, pushed the genuine contributor out with
  // `RSN-COUNT`, and rendered an empty `<<< … >>>` pair carrying `bytesInjected: 0` into an
  // author's prompt. Deleting the conjunct is what makes this case green; re-adding it reds it.
  test("LI-16: LI-AT-28 (second disjunct shape) — a document with NO section heading line at all is dropped RSN-NO-MATERIAL on the same branch, consumes no slot, and never displaces a contributor", async () => {
    const { selectLearnings } = await import("../orchestrate-dev.js");

    const corpus = buildLearningsCorpus([
      {
        path: "docs/at28b-nohdr/LEARNINGS-at28b-nohdr.md",
        doc: {
          feature: "at28b-nohdr",
          dateCompleted: "2026-05-09", // ranks FIRST — so under the defect it takes the slot
          // No `sections` at all: the front-matter table and nothing else. Not one `##` line.
        },
      },
      {
        path: "docs/at28b-normal/LEARNINGS-at28b-normal.md",
        doc: {
          feature: "at28b-normal",
          dateCompleted: "2026-05-01",
          sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }],
        },
      },
    ]);
    const entries = entriesFromCorpus(corpus);

    const result = selectLearnings({
      entries,
      thresholds: { maxDocuments: 1, maxBytesPerDocument: 6000, maxTotalBytes: 20000 },
    });

    expect(result.selected.map((d) => d.path)).toEqual([
      "docs/at28b-normal/LEARNINGS-at28b-normal.md",
    ]);
    expect(result.rejected).toEqual([
      { path: "docs/at28b-nohdr/LEARNINGS-at28b-nohdr.md", reason: "RSN-NO-MATERIAL" },
    ]);
    // The control that makes the two clauses above non-vacuous: the document that DID get the
    // slot contributes bytes. A selection of zero-byte documents satisfies a path-only oracle.
    expect(result.selected[0].bytes).toBeGreaterThan(0);
    expect(result.totalBytes).toBeGreaterThan(0);
  });

  // LI-AT-15 is written WHOLE — one test, FSPEC's four clauses — and its `.skip` is titled
  // with LI-19, not LI-16 (PM F-03, TE F-03; PLAN LI-07's row). Clauses (1) and (4) are
  // `selectLearnings`'s (LI-16); clauses (2) and (3) drive `gatherLearningsCorpus` and
  // `buildLearningsInjector` through `helpers/seams.js` and stay red until LI-19 lands the
  // injector (batch 11) — so the whole test stays red, and therefore skipped, until then. LI-02's
  // `DISCARDED-NESTED` and `DISCARDED-DIRECT` corpora are the two fixtures this test needs, in
  // that order.
  test("LI-19: LI-AT-15 — nested docs/discarded/{feature}/ is wholly excluded (RSN-EMPTY, no record); direct docs/discarded/LEARNINGS-x.md is a plain corpus member", async () => {
    const { selectLearnings, gatherLearningsCorpus, buildLearningsInjector } = await import(
      "../orchestrate-dev.js"
    );

    // ── Clauses (1)+(2)+(3): the nested fixture ──────────────────────────────────────────
    const nestedFeature = "discarded-nested-feature";
    const nestedCorpus = buildDiscardedNestedCorpus(nestedFeature);
    const dispatchingFeature = "at15-dispatcher";

    // Clause (1), at the pure core: an entries list built from DISCARDED-NESTED's own
    // `paths` (already excluded by the corpus predicate's `:(glob)`, per LI-02) selects
    // nothing.
    const pureResult = selectLearnings({
      entries: entriesFromCorpus(nestedCorpus, { feature: dispatchingFeature }),
      thresholds: LEARNINGS_CORPUS_DEFAULT_THRESHOLDS,
    });
    expect(pureResult.selected).toEqual([]);

    // Clauses (2)+(3), at the shell/injector: drive the full path — `_git` replies with
    // DISCARDED-NESTED's own `lsFilesStdout` (empty, since the nested path never enters the
    // enumeration), `_readFile` is a fake filesystem seeded with the nested document's
    // contents (which must never be opened, since it was never even listed).
    const git = fakeGit({ "ls-files": { ok: true, stdout: nestedCorpus.lsFilesStdout } });
    const fs = fakeFs(nestedCorpus.contents);
    const sink = [];
    const injector = buildLearningsInjector({
      config: {
        enabled: true,
        maxDocuments: LEARNINGS_CORPUS_DEFAULT_THRESHOLDS.maxDocuments,
        maxBytesPerDocument: LEARNINGS_CORPUS_DEFAULT_THRESHOLDS.maxBytesPerDocument,
        maxTotalBytes: LEARNINGS_CORPUS_DEFAULT_THRESHOLDS.maxTotalBytes,
      },
      sink,
      _git: git,
      _readFile: fs.readFile,
      _log: () => {},
    });
    expect(typeof injector).toBe("function");

    await injector({ feature: dispatchingFeature, docType: "TSPEC", phaseId: "T" });

    expect(sink).toHaveLength(1);
    // Clause (2): the report carries corpus-level RSN-EMPTY for this dispatch.
    expect(sink[0].corpusOutcome).toBe("RSN-EMPTY");
    // Clause (3): no discarded document appears in any record — neither read (the fake
    // filesystem's read log never names the nested path) nor anywhere in the pushed record.
    const nestedPath = `docs/discarded/${nestedFeature}/LEARNINGS-${nestedFeature}.md`;
    expect(fs.reads.map((r) => r.path)).not.toContain(nestedPath);
    expect(JSON.stringify(sink)).not.toContain(nestedPath);

    // ── Clause (4): the direct-path fixture ──────────────────────────────────────────────
    const directCorpus = buildDiscardedDirectCorpus();
    const directResult = selectLearnings({
      entries: entriesFromCorpus(directCorpus, { feature: dispatchingFeature }),
      thresholds: LEARNINGS_CORPUS_DEFAULT_THRESHOLDS,
    });
    // `docs/discarded/LEARNINGS-x.md` occupies the glob's single `*` segment, so it IS a
    // corpus member: it is selected, and carries no exclusion reason at all.
    expect(directResult.selected.map((d) => d.path)).toEqual(["docs/discarded/LEARNINGS-x.md"]);
    expect(directResult.rejected).toEqual([]);
  });
});

// PROP-ORDER-06 (TSPEC T-O-4, PROPERTIES §O.9): `orderCorpus`'s output is a permutation of its
// input and its comparator is a strict weak ordering — irreflexive, antisymmetric, transitive —
// so the result is invariant under input permutation. PROP-ORDER-01 pins the ORDER'S DIRECTION
// by example (LI-16, above); this pins its ALGEBRA, generated per §O.9's instruction to
// parameterise over permutations of a fixed multiset including null keys and duplicate keys.
// Both `orderCorpus` and `selectLearnings` exist at HEAD (landed by LI-16/LI-17/LI-19), so this
// suite is authored green — an amendment to landed code, not a staged TDD red (PLAN P-A-7 case
// C; §C.4's reconciliation for the Group D amendments follows the same rule).
describe("PROP-ORDER-06: orderCorpus permutation invariance and strict-weak-ordering (TSPEC T-O-4)", () => {
  // A fixed 8-entry (orderKey, path) multiset — includes null keys (twice) and a duplicate
  // non-null key (three-way), per §O.9's instruction. `path` is unique per entry, so a
  // permutation of this array is unambiguous even where entries tie on `orderKey`.
  const fixedEntries = Object.freeze([
    { orderKey: "2026-01-05", path: "docs/a/LEARNINGS-a.md" },
    { orderKey: "2026-01-05", path: "docs/b/LEARNINGS-b.md" }, // ties with a and g
    { orderKey: "2026-02-01", path: "docs/c/LEARNINGS-c.md" },
    { orderKey: null, path: "docs/d/LEARNINGS-d.md" },
    { orderKey: null, path: "docs/e/LEARNINGS-e.md" }, // ties with d (both null)
    { orderKey: "2025-12-31", path: "docs/f/LEARNINGS-f.md" },
    { orderKey: "2026-01-05", path: "docs/g/LEARNINGS-g.md" }, // ties with a and b
    { orderKey: "2026-06-30", path: "docs/h/LEARNINGS-h.md" },
  ]);

  /** An independent restatement of BR-4 / TSPEC §D.4, sharing no code with production:
   *  `orderKey` descending, `null` last, ties broken by UTF-8 byte-ascending `path`. Used only
   *  to check `orderCorpus`'s output against a second, hand-written total order — never to
   *  derive an expected value from the implementation under test (DC-14). */
  function referenceCompare(a, b) {
    if (a.orderKey !== b.orderKey) {
      if (a.orderKey === null) return 1;
      if (b.orderKey === null) return -1;
      return a.orderKey < b.orderKey ? 1 : -1;
    }
    return Buffer.compare(Buffer.from(a.path, "utf8"), Buffer.from(b.path, "utf8"));
  }

  test("PROP-ORDER-06: output is a permutation of the input, invariant under input permutation, and its consecutive pairs never invert a strict-weak-ordering comparator", async () => {
    const { orderCorpus } = await import("../orchestrate-dev.js");

    const expectedPathOrder = [...fixedEntries].sort(referenceCompare).map((e) => e.path);

    fc.assert(
      fc.property(
        fc.shuffledSubarray(fixedEntries, { minLength: fixedEntries.length, maxLength: fixedEntries.length }),
        (permuted) => {
          const result = orderCorpus(permuted);

          // Permutation of input (T-O-4): same multiset of paths, no loss, no duplication —
          // `path` is unique per fixed entry, so set equality over paths is exact.
          expect([...result.map((e) => e.path)].sort()).toEqual(
            [...fixedEntries.map((e) => e.path)].sort()
          );

          // Invariant under input permutation: every shuffle of the same multiset produces the
          // same output order.
          expect(result.map((e) => e.path)).toEqual(expectedPathOrder);

          // Strict weak ordering: no consecutive pair in the produced order inverts against the
          // independent reference comparator (irreflexivity/antisymmetry/transitivity follow,
          // over a finite sequence, from agreeing with a hand-written total order at every
          // adjacent pair).
          for (let i = 0; i + 1 < result.length; i += 1) {
            expect(referenceCompare(result[i], result[i + 1])).toBeLessThanOrEqual(0);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  test("PROP-ORDER-06: the comparator itself is irreflexive, antisymmetric and transitive over arbitrary triples of the fixed multiset", () => {
    // Direct algebraic check of `referenceCompare` — the same relation `orderCorpus` is proven
    // (above) to reproduce at every adjacent pair of its output — over every ordered triple
    // drawn from the fixed multiset, so the algebra is checked independently of any single
    // permutation's output.
    fc.assert(
      fc.property(
        fc.constantFrom(...fixedEntries),
        fc.constantFrom(...fixedEntries),
        fc.constantFrom(...fixedEntries),
        (a, b, c) => {
          // Irreflexive: an entry never strictly precedes itself.
          expect(referenceCompare(a, a)).toBe(0);

          // Antisymmetric (asymmetric on strict precedence): if a strictly precedes b, b does
          // not strictly precede a.
          const ab = referenceCompare(a, b);
          const ba = referenceCompare(b, a);
          if (ab < 0) expect(ba).toBeGreaterThan(0);
          if (ab > 0) expect(ba).toBeLessThan(0);
          if (ab === 0) expect(ba).toBe(0);

          // Transitive: a precedes-or-ties b, b precedes-or-ties c ⇒ a precedes-or-ties c.
          if (referenceCompare(a, b) <= 0 && referenceCompare(b, c) <= 0) {
            expect(referenceCompare(a, c)).toBeLessThanOrEqual(0);
          }
        }
      ),
      { numRuns: 200 }
    );
  });
});

// CODE_REVIEW v1 F3 (Low, "unwired parameter"): `selectLearnings` used to destructure a
// `feature` parameter it never read — self-exclusion (`RSN-SELF`) is decided upstream, in
// `gatherLearningsCorpus`, and is delivered to selection as `entry.excluded`. A signature that
// advertises `feature` implies selection re-checks self-exclusion, a guarantee that is not
// there. The parameter is dropped from the signature and from every call site; this static pin
// is what keeps it dropped.
describe("CODE_REVIEW v1 F3: selectLearnings declares no unread `feature` parameter", () => {
  let selectLearningsSignature;
  beforeAll(async () => {
    const dev = await import("../orchestrate-dev.js");
    const source = dev.selectLearnings.toString();
    selectLearningsSignature = source.slice(0, source.indexOf(")") + 1);
  });

  test("supporting: the destructured parameter list is exactly {entries, thresholds}", () => {
    expect(selectLearningsSignature).toContain("entries");
    expect(selectLearningsSignature).toContain("thresholds");
    expect(selectLearningsSignature).not.toMatch(/\bfeature\b/);
  });

  test("supporting: self-exclusion is read off entry.excluded, not off any dispatching-feature argument", async () => {
    const { selectLearnings } = await import("../orchestrate-dev.js");
    const selfEntry = {
      path: "docs/f3-self/LEARNINGS-f3-self.md",
      text: null,
      readOk: false,
      excluded: "RSN-SELF",
    };
    const { selected, rejected } = selectLearnings({
      entries: [selfEntry],
      thresholds: LEARNINGS_CORPUS_DEFAULT_THRESHOLDS,
    });
    expect(selected).toEqual([]);
    expect(rejected).toEqual([{ path: selfEntry.path, reason: "RSN-SELF" }]);
  });
});

// PROP-CORPUS-09 (TSPEC T-O-5, PROPERTIES §O.9): `selectLearnings` is total — for any
// `{entries, thresholds}`, it returns without throwing, and every input path appears
// exactly once across `selected ∪ rejected`. Named corner cases (empty corpus, all-self corpus,
// all-unreadable entries, zero-valued thresholds) are asserted individually first, then the same
// two conjuncts are re-asserted over a generated spread of entry shapes and threshold values
// (§O.9: "drawn from the fixture generators"). `selectLearnings` exists at HEAD (landed by
// LI-16/LI-19), so this is an amendment to landed code, authored green (PLAN P-A-7 case C).
describe("PROP-CORPUS-09: selectLearnings totality (TSPEC T-O-5)", () => {
  const zeroThresholds = Object.freeze({ maxDocuments: 0, maxBytesPerDocument: 0, maxTotalBytes: 0 });

  function assertTotality(entries, thresholds) {
    let result;
    expect(() => {
      result = selectLearningsUnderTest({ entries, thresholds });
    }).not.toThrow();

    const observedPaths = [
      ...result.selected.map((e) => e.path),
      ...result.rejected.map((e) => e.path),
    ].sort();
    const inputPaths = entries.map((e) => e.path).sort();

    // Totality: every input path appears — no loss.
    expect(observedPaths).toEqual(inputPaths);
    // "Exactly once": no path is double-counted across selected ∪ rejected.
    expect(new Set(observedPaths).size).toBe(observedPaths.length);
  }

  // `selectLearnings` is resolved once per test via the module-level `beforeAll` binding below,
  // so `assertTotality` above can stay a plain synchronous helper.
  let selectLearningsUnderTest;
  beforeAll(async () => {
    ({ selectLearnings: selectLearningsUnderTest } = await import("../orchestrate-dev.js"));
  });

  test("PROP-CORPUS-09: named corner cases — empty corpus, all-self corpus, all-unreadable entries, zero-valued thresholds", () => {
    assertTotality([], LEARNINGS_CORPUS_DEFAULT_THRESHOLDS);

    assertTotality(
      [
        { path: "docs/f/LEARNINGS-f.md", feature: "f", text: null, readOk: false, excluded: "RSN-SELF" },
        { path: "docs/f/LEARNINGS-f2.md", feature: "f", text: null, readOk: false, excluded: "RSN-SELF" },
      ],
      LEARNINGS_CORPUS_DEFAULT_THRESHOLDS
    );

    assertTotality(
      [
        { path: "docs/a/LEARNINGS-a.md", feature: "a", text: null, readOk: false, excluded: null },
        { path: "docs/b/LEARNINGS-b.md", feature: "b", text: null, readOk: false, excluded: null },
      ],
      LEARNINGS_CORPUS_DEFAULT_THRESHOLDS
    );

    const normalCorpus = buildLearningsCorpus([
      { path: "docs/z1/LEARNINGS-z1.md" },
      { path: "docs/z2/LEARNINGS-z2.md" },
    ]);
    assertTotality(entriesFromCorpus(normalCorpus), zeroThresholds);
  });

  test("PROP-CORPUS-09: generated entries and thresholds — never throws, selected ∪ rejected always equals the input, exactly once each", () => {
    const entryShape = fc
      .record({
        slug: fc.stringMatching(/^[a-z0-9]{1,12}$/),
        kind: fc.constantFrom("self", "unreadable", "unparseable", "no-material", "has-material"),
      })
      .map((spec, index) => ({ ...spec, path: `docs/gen-${index}-${spec.slug}/LEARNINGS-gen-${index}-${spec.slug}.md` }));

    fc.assert(
      fc.property(
        fc.uniqueArray(entryShape, { maxLength: 12, selector: (e) => e.path }),
        fc.record({
          maxDocuments: fc.integer({ min: 0, max: 6 }),
          maxBytesPerDocument: fc.integer({ min: 0, max: 300 }),
          maxTotalBytes: fc.integer({ min: 0, max: 900 }),
        }),
        (specs, thresholds) => {
          const entries = specs.map((spec) => {
            switch (spec.kind) {
              case "self":
                return { path: spec.path, feature: "dispatching-feature", text: null, readOk: false, excluded: "RSN-SELF" };
              case "unreadable":
                return { path: spec.path, feature: "dispatching-feature", text: null, readOk: false, excluded: null };
              case "unparseable":
                return { path: spec.path, feature: "dispatching-feature", text: "not a LEARNINGS document", readOk: true, excluded: null };
              case "no-material":
                return {
                  path: spec.path,
                  feature: "dispatching-feature",
                  text: buildLearningsDocument({ feature: "gen", sections: [] }),
                  readOk: true,
                  excluded: null,
                };
              case "has-material":
              default:
                return {
                  path: spec.path,
                  feature: "dispatching-feature",
                  text: buildLearningsDocument({
                    feature: "gen",
                    sections: [{ name: "Cross-Feature Patterns", body: "Generated material." }],
                  }),
                  readOk: true,
                  excluded: null,
                };
            }
          });

          assertTotality(entries, thresholds);
        }
      ),
      { numRuns: 150 }
    );
  });
});
