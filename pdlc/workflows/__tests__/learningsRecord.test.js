// learningsRecord.test.js — PLAN LI-10 (RED record suite, greened by LI-19 / LI-21;
// TSPEC §A.5, §T.5, §T.6).
//
// Owns FSPEC LI-AT-17, LI-AT-18, LI-AT-19, LI-AT-21 (L1/L2, driven directly through
// `buildLearningsInjector` — never through `main()`) and LI-AT-20 / LI-AT-22 (L3, driven
// through the same injector but over `helpers/learningsFixtures.js`'s `DIVERGENT-CORPUS`
// fixture across all five of its scripted authoring dispatches, so the record reflects a
// whole run's worth of corpus movement rather than one isolated call).
//
// BR-10 (TSPEC §A.5, FSPEC BR-10) closes at TWO loci, each with its own completeness test,
// and this task greens only one of them:
//   - locus 1 (per-dispatch `orderKeys`) is asserted here and greened by LI-19 (batch 11).
//   - locus 2 (run-level `ruleInputs.thresholds`) does not exist until LI-21's report key
//     lands (batch 13), so that half of LI-AT-22 is titled "LI-21", not "LI-19" — attributing
//     it to LI-19 would halt the batch-11 gate on a test that is correct but merely early
//     (PM F-02).
//
// The suite asserts nothing about `runMirror`: upstream (REQ AC-3.2) leaves its value
// deliberately unconstrained, and a conforming implementation may omit it entirely (TSPEC
// §A.5's "carried, additive, not the oracle"). A test pinning it would red a conforming
// implementation.
//
// `buildLearningsInjector` does not exist in `orchestrate-dev.js` yet, so every block below
// is committed `.skip`ped, titled with its owning task's id. LI-19's first action on most
// blocks — and LI-21's on the one block titled for it — is to remove exactly that block's
// `.skip` wrapper, observe the red, then implement until green; never delete a block or add a
// new one beside it. The production import is deferred to a dynamic `await import()` inside
// each test body so this file loads cleanly today.

import {
  buildLearningsCorpus,
  buildBytesBindingCorpus,
  buildDivergentCorpus,
  LEARNINGS_CORPUS_DEFAULT_THRESHOLDS,
} from "./helpers/learningsFixtures.js";
import { fakeGit, fakeFs } from "./helpers/seams.js";

const DEV_MODULE_PATH = "../orchestrate-dev.js";

/** A fresh, empty run-scoped sink shape (TSPEC §A.5): `buildLearningsInjector` mutates this
 *  in place across calls — pushing one dispatch record per call, and setting the run-level
 *  members at most once. */
function makeSink() {
  return { ruleInputs: {}, runMirror: {}, dispatches: [] };
}

function makeConfig(overrides = {}) {
  return {
    enabled: true,
    thresholds: { ...LEARNINGS_CORPUS_DEFAULT_THRESHOLDS },
    ...overrides,
  };
}

describe.skip("LI-19: LI-AT-17 — BR-8 per-dispatch row field set equality", () => {
  test("each row carries exactly sourcePath, position, bytesInjected, bounded, plus a sibling per-dispatch totalBytesInjected", async () => {
    const { buildLearningsInjector } = await import(DEV_MODULE_PATH);

    const corpus = buildLearningsCorpus([
      {
        path: "docs/completed/other-feature/LEARNINGS-other-feature.md",
        doc: {
          feature: "other-feature",
          dateCompleted: "2026-03-01",
          sections: [{ name: "Cross-Feature Patterns", bodyBytes: 300 }],
        },
      },
    ]);
    const sink = makeSink();
    const inject = buildLearningsInjector({
      config: makeConfig(),
      sink,
      _git: fakeGit({ ok: true, stdout: corpus.lsFilesStdout }),
      _readFile: fakeFs(corpus.contents).readFile,
      _log: () => {},
    });

    await inject({ feature: "this-feature", docType: "TSPEC", phaseId: "T" });

    expect(sink.dispatches).toHaveLength(1);
    const dispatch = sink.dispatches[0];
    expect(dispatch.rows.length).toBeGreaterThan(0);
    for (const row of dispatch.rows) {
      // BR-8's field enumeration is closed (DC-01): a completeness test asserts set
      // equality over exactly these four fields — never containment, so a row carrying an
      // extra ad-hoc field reds here too.
      expect(Object.keys(row).sort()).toEqual(
        ["bounded", "bytesInjected", "position", "sourcePath"].sort()
      );
    }
    expect(typeof dispatch.totalBytesInjected).toBe("number");
  });
});

describe.skip("LI-19: LI-AT-18 — empty rows is a present empty array, and total bytes tracks the rows actually recorded", () => {
  test("a dispatch that selects nothing carries rows: [] and totalBytesInjected: 0, never a missing field", async () => {
    const { buildLearningsInjector } = await import(DEV_MODULE_PATH);

    // maxDocuments: 0 (AC-4.4) admits nothing while staying enabled — BR-8's rows are
    // present and empty, not absent (TSPEC E-24).
    const corpus = buildBytesBindingCorpus();
    const sink = makeSink();
    const inject = buildLearningsInjector({
      config: makeConfig({ thresholds: { ...LEARNINGS_CORPUS_DEFAULT_THRESHOLDS, maxDocuments: 0 } }),
      sink,
      _git: fakeGit({ ok: true, stdout: corpus.lsFilesStdout }),
      _readFile: fakeFs(corpus.contents).readFile,
      _log: () => {},
    });

    await inject({ feature: "this-feature", docType: "TSPEC", phaseId: "T" });

    const dispatch = sink.dispatches[0];
    expect("rows" in dispatch).toBe(true);
    expect(Array.isArray(dispatch.rows)).toBe(true);
    expect(dispatch.rows).toHaveLength(0);
    expect(dispatch.totalBytesInjected).toBe(0);
  });

  test("a changing-corpus run's total bytes always equal the sum of that same dispatch's own row bytes", async () => {
    const { buildLearningsInjector } = await import(DEV_MODULE_PATH);

    const { contents, gitScript } = buildDivergentCorpus();
    const sink = makeSink();
    const inject = buildLearningsInjector({
      config: makeConfig(),
      sink,
      _git: fakeGit(gitScript),
      _readFile: fakeFs(contents).readFile,
      _log: () => {},
    });

    for (let i = 0; i < 5; i += 1) {
      await inject({ feature: "this-feature", docType: "TSPEC", phaseId: "T" });
    }

    expect(sink.dispatches).toHaveLength(5);
    for (const dispatch of sink.dispatches) {
      const summed = dispatch.rows.reduce((sum, row) => sum + row.bytesInjected, 0);
      expect(dispatch.totalBytesInjected).toBe(summed);
    }
  });
});

describe.skip("LI-19: LI-AT-19 — the per-document reason catalogue is closed, and exactly one reason id per unselected document", () => {
  test("LEARNINGS_REJECT_REASONS equals the hand-transcribed six-member catalogue, set equality not containment", async () => {
    const dev = await import(DEV_MODULE_PATH);

    // Hand-transcribed literal (DC-14): never derived from the module's own value.
    const EXPECTED_REJECT_REASONS = [
      "RSN-COUNT",
      "RSN-BYTES",
      "RSN-SELF",
      "RSN-UNREADABLE",
      "RSN-UNPARSEABLE",
      "RSN-NO-MATERIAL",
    ];
    expect([...dev.LEARNINGS_REJECT_REASONS].sort()).toEqual([...EXPECTED_REJECT_REASONS].sort());
  });

  test("an unselected document carries exactly one reason id, drawn from the closed catalogue", async () => {
    const { buildLearningsInjector } = await import(DEV_MODULE_PATH);

    // Every document in BYTES-BINDING is dropped whole by the total byte bound (TSPEC T.4).
    const corpus = buildBytesBindingCorpus();
    const sink = makeSink();
    const inject = buildLearningsInjector({
      config: makeConfig(),
      sink,
      _git: fakeGit({ ok: true, stdout: corpus.lsFilesStdout }),
      _readFile: fakeFs(corpus.contents).readFile,
      _log: () => {},
    });

    await inject({ feature: "this-feature", docType: "TSPEC", phaseId: "T" });

    const dispatch = sink.dispatches[0];
    expect(dispatch.rejected.length).toBeGreaterThan(0);
    const seenPaths = new Set();
    for (const rejection of dispatch.rejected) {
      // exactly one row per document: no path appears twice among the reject rows.
      expect(seenPaths.has(rejection.sourcePath)).toBe(false);
      seenPaths.add(rejection.sourcePath);
      expect(dev.LEARNINGS_REJECT_REASONS.includes(rejection.reason)).toBe(true);
    }
  });
});

describe.skip("LI-19: LI-AT-20 / LI-AT-21 — per-dispatch corpus-level outcome, read back per dispatch over DIVERGENT-CORPUS", () => {
  test("LEARNINGS_CORPUS_OUTCOMES equals the hand-transcribed two-member catalogue, and the three BR-9 catalogues are disjoint in kind", async () => {
    const dev = await import(DEV_MODULE_PATH);

    expect([...dev.LEARNINGS_CORPUS_OUTCOMES].sort()).toEqual(["RSN-EMPTY", "RSN-UNLISTABLE"]);

    // No catalogue's ids appear in another catalogue's position (BR-9 disjointness).
    const reject = new Set(dev.LEARNINGS_REJECT_REASONS);
    const outcome = new Set(dev.LEARNINGS_CORPUS_OUTCOMES);
    const notice = new Set(dev.LEARNINGS_NOTICES);
    for (const id of reject) {
      expect(outcome.has(id)).toBe(false);
      expect(notice.has(id)).toBe(false);
    }
    for (const id of outcome) expect(notice.has(id)).toBe(false);
  });

  test("dispatches 1, 2 and 4 carry the healthy corpusOutcome: null; dispatch 5's listing fails and its BR-8 rows are present and empty", async () => {
    const { buildLearningsInjector } = await import(DEV_MODULE_PATH);

    const { contents, gitScript } = buildDivergentCorpus();
    const sink = makeSink();
    const inject = buildLearningsInjector({
      config: makeConfig(),
      sink,
      _git: fakeGit(gitScript),
      _readFile: fakeFs(contents).readFile,
      _log: () => {},
    });

    for (let i = 0; i < 5; i += 1) {
      await inject({ feature: "this-feature", docType: "TSPEC", phaseId: "T" });
    }

    expect(sink.dispatches).toHaveLength(5);

    // The positive half (TE F-01): `corpusOutcome` is `null` on every dispatch that
    // actually observed a corpus, not merely "not RSN-UNLISTABLE" — an implementation
    // recording `undefined`, `""`, or omitting the key entirely on a healthy dispatch must
    // red here, since `null` is the value the field carries on the overwhelming majority of
    // runs (LI-AT-23's non-`null` scoping is a different suite's concern, delegated there).
    expect(sink.dispatches[0].corpusOutcome).toBeNull();
    expect(sink.dispatches[1].corpusOutcome).toBeNull();
    expect(sink.dispatches[3].corpusOutcome).toBeNull();

    // dispatch 5 (index 4): the scripted `_git` reply fails outright.
    expect(sink.dispatches[4].corpusOutcome).toBe("RSN-UNLISTABLE");
    expect(sink.dispatches[4].rows).toEqual([]);
  });
});

describe.skip("LI-19: LI-AT-22 locus 1 — per-dispatch orderKeys, hand-transcribed against DIVERGENT-CORPUS, plus corpusDiverged", () => {
  test("each dispatch reproduces its own orderKeys from the corpus it observed, and corpusDiverged is true on exactly dispatches 3 and 5", async () => {
    const { buildLearningsInjector } = await import(DEV_MODULE_PATH);

    const { contents, gitScript } = buildDivergentCorpus();
    const sink = makeSink();
    const inject = buildLearningsInjector({
      config: makeConfig(),
      sink,
      _git: fakeGit(gitScript),
      _readFile: fakeFs(contents).readFile,
      _log: () => {},
    });

    for (let i = 0; i < 5; i += 1) {
      await inject({ feature: "this-feature", docType: "TSPEC", phaseId: "T" });
    }

    // Hand-transcribed literal (DC-14), paths in order — never read back out of the
    // fixture or the module under test. The original two-document corpus.
    const ORIGINAL_ORDER_KEYS = [
      { path: "docs/divergent-a/LEARNINGS-divergent-a.md", orderKey: "2026-04-01" },
      { path: "docs/divergent-b/LEARNINGS-divergent-b.md", orderKey: "2026-04-02" },
    ];
    // The grown, three-document corpus (dispatches 3 and 4).
    const GROWN_ORDER_KEYS = [
      ...ORIGINAL_ORDER_KEYS,
      { path: "docs/divergent-c/LEARNINGS-divergent-c.md", orderKey: "2026-04-03" },
    ];

    expect(sink.dispatches[0].orderKeys).toEqual(ORIGINAL_ORDER_KEYS);
    expect(sink.dispatches[1].orderKeys).toEqual(ORIGINAL_ORDER_KEYS);
    expect(sink.dispatches[2].orderKeys).toEqual(GROWN_ORDER_KEYS);
    expect(sink.dispatches[3].orderKeys).toEqual(GROWN_ORDER_KEYS);
    // dispatch 5: the corpus listing failed outright — no document is known to it.
    expect(sink.dispatches[4].orderKeys).toEqual([]);

    // BR-10 locus 1's field enumeration is closed (DC-01): a completeness test asserts set
    // equality over each entry's own fields, on `dispatches[i]` only — never on a run-level
    // mirror.
    for (const dispatch of sink.dispatches) {
      for (const entry of dispatch.orderKeys) {
        expect(Object.keys(entry).sort()).toEqual(["orderKey", "path"]);
      }
    }

    // corpusDiverged: true iff this dispatch's {corpusOutcome, orderKeys} differ from the
    // immediately preceding authoring dispatch's — exactly dispatches 3 and 5 here (the
    // corpus grows before 3, and the listing fails at 5), never null on the first dispatch.
    expect(sink.dispatches.map((d) => d.corpusDiverged)).toEqual([false, false, true, false, true]);
  });
});

describe.skip("LI-21: LI-AT-22 locus 2 — run-level thresholds completeness, once per run", () => {
  test("ruleInputs.thresholds carries exactly maxDocuments, maxBytesPerDocument and maxTotalBytes, read once for the whole run", async () => {
    const { buildLearningsInjector } = await import(DEV_MODULE_PATH);

    const { contents, gitScript } = buildDivergentCorpus();
    const sink = makeSink();
    const inject = buildLearningsInjector({
      config: makeConfig(),
      sink,
      _git: fakeGit(gitScript),
      _readFile: fakeFs(contents).readFile,
      _log: () => {},
    });

    for (let i = 0; i < 5; i += 1) {
      await inject({ feature: "this-feature", docType: "TSPEC", phaseId: "T" });
    }

    // BR-10 locus 2's field enumeration is closed (DC-01): a completeness test asserts set
    // equality over exactly these three fields, once per run — not merged with locus 1's
    // per-dispatch record, and never reproduced per dispatch.
    expect(Object.keys(sink.ruleInputs.thresholds).sort()).toEqual(
      ["maxBytesPerDocument", "maxDocuments", "maxTotalBytes"].sort()
    );
    expect(sink.ruleInputs.thresholds).toEqual(LEARNINGS_CORPUS_DEFAULT_THRESHOLDS);
  });
});
