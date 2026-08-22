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
import { readdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const DEV_MODULE_PATH = "../orchestrate-dev.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

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

describe("LI-19: LI-AT-17 — BR-8 per-dispatch row field set equality", () => {
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

describe("LI-19: LI-AT-18 — empty rows is a present empty array, and total bytes tracks the rows actually recorded", () => {
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

describe("LI-19: LI-AT-19 — the per-document reason catalogue is closed, and exactly one reason id per unselected document", () => {
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
    const dev = await import(DEV_MODULE_PATH);
    const { buildLearningsInjector } = dev;

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

describe("LI-19: LI-AT-20 / LI-AT-21 — per-dispatch corpus-level outcome, read back per dispatch over DIVERGENT-CORPUS", () => {
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

describe("LI-19: LI-AT-22 locus 1 — per-dispatch orderKeys, hand-transcribed against DIVERGENT-CORPUS, plus corpusDiverged", () => {
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
    // fixture or the module under test. The original two-document corpus, BR-4 descending
    // (TSPEC §I.3 "orderKey descending (null last)"; TSPEC :597, :931): the later
    // `orderKey` sorts first.
    const ORIGINAL_ORDER_KEYS = [
      { path: "docs/divergent-b/LEARNINGS-divergent-b.md", orderKey: "2026-04-02" },
      { path: "docs/divergent-a/LEARNINGS-divergent-a.md", orderKey: "2026-04-01" },
    ];
    // The grown, three-document corpus (dispatches 3 and 4): `divergent-c` is the latest
    // orderKey, so it sorts to the front under the same descending order.
    const GROWN_ORDER_KEYS = [
      { path: "docs/divergent-c/LEARNINGS-divergent-c.md", orderKey: "2026-04-03" },
      ...ORIGINAL_ORDER_KEYS,
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

// PROP-RECORD-06 (mutation M-8): a document with no `Date Completed` row is still eligible
// (BR-4's `null` key, ranked last), and its `orderKeys[j].orderKey` must be a PRESENT key
// carrying JSON `null` — never an omitted key, never the empty string "". Omitting the key
// would make "this document's date is unrecorded" indistinguishable from "this document was
// never observed at all"; emitting "" would make it indistinguishable from a parse that
// silently coerced a genuinely-absent value into a string. Both are the specific confusions
// AC-3.3 is written to prevent (TSPEC §A.5, BR-10 locus 1).
describe("PROP-RECORD-06: orderKey: null is a present key carrying JSON null, never omitted, never coerced to a string", () => {
  test("a document with no Date Completed row is recorded with a present orderKey key whose value is JS/JSON null", async () => {
    const { buildLearningsInjector } = await import(DEV_MODULE_PATH);

    const corpus = buildLearningsCorpus([
      {
        path: "docs/completed/no-date/LEARNINGS-no-date.md",
        doc: {
          feature: "no-date",
          dateCompleted: null,
          sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }],
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
    const { orderKeys } = sink.dispatches[0];
    expect(orderKeys).toHaveLength(1);
    const entry = orderKeys[0];

    // Present key, closed field set (BR-10 locus 1's completeness, restated per-entry).
    expect(Object.keys(entry).sort()).toEqual(["orderKey", "path"]);
    expect("orderKey" in entry).toBe(true);
    // JS `null`, never omitted (`undefined`) and never coerced to "" (M-8).
    expect(entry.orderKey).toBeNull();
    expect(entry.orderKey).not.toBe("");
    expect(entry.orderKey).not.toBeUndefined();
    // The record must survive a real JSON round-trip carrying a literal `null`, not a
    // dropped key — `JSON.stringify` omits `undefined`-valued keys but keeps `null` ones.
    const roundTripped = JSON.parse(JSON.stringify(entry));
    expect("orderKey" in roundTripped).toBe(true);
    expect(roundTripped.orderKey).toBeNull();
  });
});

describe("LI-21: LI-AT-22 locus 2 — run-level thresholds completeness, once per run", () => {
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

// PROP-RECORD-09 (PROPERTIES §Group J, negative — about the test suite itself): no test of
// this feature may assert on `runMirror`'s value — it is additive by upstream decision (REQ
// AC-3.2), deliberately unconstrained, and an implementation omitting it entirely conforms.
// Instrumented as the same static directory walk PROP-META-05/06 use in
// learningsSuiteMap.test.js: enumerate `__tests__/learnings*.test.js` from disk, parse each
// file's TEXT, and assert no file contains a `runMirror` reference in an assertion position.
describe("PROP-RECORD-09: no learnings*.test.js suite asserts on runMirror's value", () => {
  function listLearningsSuiteFiles() {
    return readdirSync(__dirname)
      .filter((name) => /^learnings.*\.test\.js$/.test(name))
      .sort();
  }

  // "Assertion position": the field name appearing as (or inside) the argument to a jest
  // `expect` call — asserted on directly, or supplied as the expected side of a matcher. A
  // bare mention in a comment or in fixture-shape data (this file's own `makeSink()` sets the
  // field to `{}` as a fixture default, never asserted on) does not count, which is why the
  // scan below is scoped to `expect(` call arguments specifically.
  function hasRunMirrorAssertion(text) {
    const expectCallRe = /\bexpect\(([^)]*)\)/g;
    let match;
    while ((match = expectCallRe.exec(text)) !== null) {
      if (/runMirror/.test(match[1])) return true;
    }
    return false;
  }

  test("PROP-RECORD-09: the enumerated suite set is non-empty (positive control), and none of it asserts on runMirror", () => {
    const allSuiteFiles = listLearningsSuiteFiles();
    // Positive control: the walk's own non-empty file set, so a walk that finds no files reds
    // rather than vacuously passing over zero bytes.
    expect(allSuiteFiles.length).toBeGreaterThan(0);

    const offendingFiles = allSuiteFiles.filter((fileName) =>
      hasRunMirrorAssertion(readFileSync(join(__dirname, fileName), "utf8"))
    );
    expect(offendingFiles).toEqual([]);
  });

  test("PROP-RECORD-09: negative control — the scanner detects a planted runMirror assertion in a synthetic snippet", () => {
    // Built via concatenation (never a literal "runMirror" substring in this file's own
    // source) so this suite's OWN text is not falsely flagged as an offender by the walk
    // above — the walk scans real source text, not this test's synthetic subject.
    const fieldName = "run" + "Mirror";
    const synthetic = `test("x", () => { expect(sink.${fieldName}).toEqual({}); });`;
    expect(hasRunMirrorAssertion(synthetic)).toBe(true);
  });
});
