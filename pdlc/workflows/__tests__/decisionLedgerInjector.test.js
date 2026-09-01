/**
 * decisionLedgerInjector.test.js — PLAN T-08 (batch 2, `[red]`, deps T-00/T-01/T-03),
 * pdlc-decision-ledger.
 *
 * Falsifies TSPEC §4.4's `gatherDecisionCorpus` / `buildDecisionLedgerInjector` IO shell against
 * §6.1's fail-open failure table (F-6…F-10, F-14), §6.2's survives-not-fails predicate, §6.3's O-7
 * observable (`failedSources`/`emptySources`), §2.6's freshness contract (AT-03, `DEC-DECLEDGER-14`
 * / D-11), and §6.1's per-dispatch `_log` line — all driven exclusively through T-01's doubles
 * (`pdlc/workflows/__tests__/helpers/decisionLedgerDoubles.js`), never a real `_git`/`_readFile`.
 *
 * `gatherDecisionCorpus` and `buildDecisionLedgerInjector` do not exist on `orchestrate-dev.js` yet
 * — PLAN T-17 (batch 7) lands both, un-skipping every block below. This file therefore reaches the
 * module only via a dynamic `await import` inside each test body (never a top-level import), the
 * same discipline `learningsCorpus.test.js` and `decisionLedgerConfig.test.js` use, so the file
 * loads cleanly today with the exports absent. Every block is committed `.skip`, titled
 * `T-17: …`; T-17's first action is to remove exactly these wrappers, observe the red, then
 * implement until green — never delete a block or add a new one beside it.
 *
 * TSPEC §4.4 shapes:
 *   gatherDecisionCorpus(args: { feature, _git, _readFile })
 *     => Promise<{ unlistable: true } | { unlistable: false; entries: CorpusEntry[] }>
 *   buildDecisionLedgerInjector(args: { config, sink, _git, _readFile, _log? })
 *     => null | ((args: { feature }) => Promise<string>)
 * `CorpusEntry` (§4.2): `{ sourcePath: string; text: string | null; readOk: boolean }`.
 * `DecisionLedgerDispatchRecord` (§5.1): `{ feature, phaseId, docType, round, rows, omitted,
 * renderedBytes, corpusOutcome, failedSources, emptySources }`, pushed onto `sink.dispatches` (or
 * a plain array sink) once per injector call — no memoisation, no snapshot (§2.6, BR-9).
 */

import {
  makeDecisionLedgerSeams,
  makeGitDouble,
  makeReadFileDouble,
  makeLogDouble,
  assertNoLiveGitWrites,
} from "./helpers/decisionLedgerDoubles.js";

const FEATURE = "some-feature";
const PROJECT_PATH = "docs/_decisions/DECISIONS-project.md";
const FEATURE_PATH = `docs/${FEATURE}/DECISIONS-${FEATURE}.md`;

/** One `## {id}: {statement}` heading per pair — TSPEC §3.2's `DECISION_HEADING_RE` grammar. */
function decisionText(...pairs) {
  return pairs.map(([id, statement]) => `## ${id}: ${statement}`).join("\n\n") + "\n";
}

/** A source file that is readable but carries no matching decision heading at all (F-9). */
const NO_RECORD_TEXT = "# Just a Document\n\nSome prose. No decision headings here.\n";

/** `git ls-files` reply for a set of paths, in enumeration order. */
function gitReply(...paths) {
  return { "ls-files": { ok: true, stdout: paths.join("\n") } };
}

// A minimal enabled config — the three C-3 keys, `enabled: true` so the injector is non-null.
const ENABLED_CONFIG = Object.freeze({ enabled: true, maxEntries: 70, maxBytes: 12500 });

let lastGitCalls;
afterEach(() => {
  if (lastGitCalls) assertNoLiveGitWrites(lastGitCalls);
  lastGitCalls = undefined;
});

// ─── gatherDecisionCorpus — F-6: RSN-UNLISTABLE, both the graceful and ungraceful legs (AT-08) ──

describe("gatherDecisionCorpus — F-6 fail-open, both `_git` legs collapse onto {unlistable: true}", () => {
  test("T-17: `_git` returns { ok: false } (graceful) yields { unlistable: true }, no _readFile call", async () => {
    const { gatherDecisionCorpus } = await import("../orchestrate-dev.js");

    const _git = makeGitDouble({ "ls-files": { ok: false } });
    const _readFile = makeReadFileDouble();
    lastGitCalls = _git.calls;

    const result = await gatherDecisionCorpus({ feature: FEATURE, _git, _readFile });

    expect(result).toEqual({ unlistable: true });
    expect(_readFile.calls).toEqual([]);
    expect(_git.calls.length).toBe(1);
  });

  test("T-17: `_git` throws (ungraceful) yields { unlistable: true } — the SAME shape as the graceful leg", async () => {
    const { gatherDecisionCorpus } = await import("../orchestrate-dev.js");

    const _git = makeGitDouble({ "ls-files": new Error("simulated git fault: not a graceful reply") });
    const _readFile = makeReadFileDouble();
    lastGitCalls = _git.calls;

    const result = await gatherDecisionCorpus({ feature: FEATURE, _git, _readFile });

    expect(result).toEqual({ unlistable: true });
    expect(_readFile.calls).toEqual([]);
  });
});

// ─── gatherDecisionCorpus — F-7: enumeration succeeds, zero paths ⇒ RSN-EMPTY's precondition ────

describe("gatherDecisionCorpus — F-7 zero-path enumeration", () => {
  test("T-17: `_git` succeeds with empty stdout yields { unlistable: false, entries: [] }", async () => {
    const { gatherDecisionCorpus } = await import("../orchestrate-dev.js");

    const _git = makeGitDouble({ "ls-files": { ok: true, stdout: "" } });
    const _readFile = makeReadFileDouble();
    lastGitCalls = _git.calls;

    const result = await gatherDecisionCorpus({ feature: FEATURE, _git, _readFile });

    expect(result.unlistable).toBe(false);
    expect(result.entries).toEqual([]);
    expect(_readFile.calls).toEqual([]);
  });
});

// ─── gatherDecisionCorpus — F-8: the per-path try/catch, `null` AND throw, both degrade ONE entry ─

describe("gatherDecisionCorpus — F-8 per-path try/catch (P-8: null-return and throw both degrade one entry)", () => {
  test("T-17: a `_readFile` null return and a throw each yield readOk: false for THAT entry only; the good entry reads fine", async () => {
    const { gatherDecisionCorpus } = await import("../orchestrate-dev.js");

    const goodPath = PROJECT_PATH;
    const nullPath = "docs/_decisions/DECISIONS-null-path.md";
    const throwPath = "docs/_decisions/DECISIONS-throw-path.md";
    const goodText = decisionText(["DEC-FOO-01", "a statement"]);

    const _git = makeGitDouble(gitReply(goodPath, nullPath, throwPath));
    const _readFile = makeReadFileDouble(
      { [goodPath]: goodText },
      { nullPaths: [nullPath], throwPaths: [throwPath] }
    );
    lastGitCalls = _git.calls;

    const result = await gatherDecisionCorpus({ feature: FEATURE, _git, _readFile });

    expect(result.unlistable).toBe(false);
    expect(result.entries).toEqual(
      expect.arrayContaining([
        { sourcePath: goodPath, text: goodText, readOk: true },
        { sourcePath: nullPath, text: null, readOk: false },
        { sourcePath: throwPath, text: null, readOk: false },
      ])
    );
    expect(result.entries.length).toBe(3);
    expect(new Set(_readFile.calls)).toEqual(new Set([goodPath, nullPath, throwPath]));
  });

  test("T-17: never throws past gatherDecisionCorpus even when EVERY path throws", async () => {
    const { gatherDecisionCorpus } = await import("../orchestrate-dev.js");

    const throwPathA = "docs/_decisions/DECISIONS-a.md";
    const throwPathB = "docs/_decisions/DECISIONS-b.md";
    const _git = makeGitDouble(gitReply(throwPathA, throwPathB));
    const _readFile = makeReadFileDouble({}, { throwPaths: [throwPathA, throwPathB] });
    lastGitCalls = _git.calls;

    await expect(
      gatherDecisionCorpus({ feature: FEATURE, _git, _readFile })
    ).resolves.toEqual({
      unlistable: false,
      entries: [
        { sourcePath: throwPathA, text: null, readOk: false },
        { sourcePath: throwPathB, text: null, readOk: false },
      ],
    });
  });
});

// ─── buildDecisionLedgerInjector — F-6/F-7 total leg through the composed closure (AT-08) ───────
// Same bytes ("") whichever of F-6/F-7 produced it — §6.2's predicate reads only `selected`.

describe("buildDecisionLedgerInjector — F-6/F-7 total leg: block \"\", corpusOutcome set, AT-08", () => {
  test("T-17: RSN-UNLISTABLE (F-6) — block is \"\", dispatch.corpusOutcome is RSN-UNLISTABLE, rows/failedSources/emptySources all empty", async () => {
    const { buildDecisionLedgerInjector } = await import("../orchestrate-dev.js");

    const sink = [];
    const _git = makeGitDouble({ "ls-files": { ok: false } });
    const _readFile = makeReadFileDouble();
    lastGitCalls = _git.calls;
    const injector = buildDecisionLedgerInjector({ config: ENABLED_CONFIG, sink, _git, _readFile });

    const block = await injector({ feature: FEATURE });

    expect(block).toBe("");
    expect(sink.length).toBe(1);
    expect(sink[0]).toMatchObject({
      corpusOutcome: "RSN-UNLISTABLE",
      rows: [],
      failedSources: [],
      emptySources: [],
    });
  });

  test("T-17: RSN-EMPTY (F-7) — block is \"\", dispatch.corpusOutcome is RSN-EMPTY — same bytes as RSN-UNLISTABLE", async () => {
    const { buildDecisionLedgerInjector } = await import("../orchestrate-dev.js");

    const sink = [];
    const _git = makeGitDouble({ "ls-files": { ok: true, stdout: "" } });
    const _readFile = makeReadFileDouble();
    lastGitCalls = _git.calls;
    const injector = buildDecisionLedgerInjector({ config: ENABLED_CONFIG, sink, _git, _readFile });

    const block = await injector({ feature: FEATURE });

    expect(block).toBe("");
    expect(sink[0]).toMatchObject({
      corpusOutcome: "RSN-EMPTY",
      rows: [],
      failedSources: [],
      emptySources: [],
    });
  });

  test("T-17: RSN-UNLISTABLE and RSN-EMPTY dispatches render the IDENTICAL block bytes (\"\")", async () => {
    const { buildDecisionLedgerInjector } = await import("../orchestrate-dev.js");

    const unlistableSink = [];
    const unlistableInjector = buildDecisionLedgerInjector({
      config: ENABLED_CONFIG,
      sink: unlistableSink,
      _git: makeGitDouble({ "ls-files": { ok: false } }),
      _readFile: makeReadFileDouble(),
    });
    const emptySink = [];
    const emptyInjector = buildDecisionLedgerInjector({
      config: ENABLED_CONFIG,
      sink: emptySink,
      _git: makeGitDouble({ "ls-files": { ok: true, stdout: "" } }),
      _readFile: makeReadFileDouble(),
    });

    const unlistableBlock = await unlistableInjector({ feature: FEATURE });
    const emptyBlock = await emptyInjector({ feature: FEATURE });

    expect(unlistableBlock).toBe(emptyBlock);
    expect(unlistableBlock).toBe("");
  });
});

// ─── buildDecisionLedgerInjector — F-8 partial leg: one failed source degrades ALONE, AT-09 ─────

describe("buildDecisionLedgerInjector — F-8 partial leg, every other source still renders (AT-09)", () => {
  test("T-17: `_readFile` null-return degrades that source alone; the other source renders and is counted in failedSources", async () => {
    const { buildDecisionLedgerInjector } = await import("../orchestrate-dev.js");

    const goodText = decisionText(["DEC-FOO-01", "the surviving statement"]);
    const nullPath = "docs/_decisions/DECISIONS-unreadable.md";
    const _git = makeGitDouble(gitReply(PROJECT_PATH, nullPath));
    const _readFile = makeReadFileDouble({ [PROJECT_PATH]: goodText }, { nullPaths: [nullPath] });
    lastGitCalls = _git.calls;
    const sink = [];
    const injector = buildDecisionLedgerInjector({ config: ENABLED_CONFIG, sink, _git, _readFile });

    const block = await injector({ feature: FEATURE });

    expect(block).toEqual(expect.stringContaining("DEC-FOO-01"));
    expect(block).toEqual(expect.stringContaining("the surviving statement"));
    expect(sink[0].failedSources).toEqual([nullPath]);
    expect(sink[0].emptySources).toEqual([]);
    expect(sink[0].rows).toEqual(
      expect.arrayContaining([{ id: "DEC-FOO-01", sourcePath: PROJECT_PATH, origin: "project" }])
    );
    expect(sink[0].corpusOutcome).toBeNull();
  });

  test("T-17: `_readFile` throw degrades that source alone; the other source renders and is counted in failedSources", async () => {
    const { buildDecisionLedgerInjector } = await import("../orchestrate-dev.js");

    const goodText = decisionText(["DEC-FOO-02", "another surviving statement"]);
    const throwPath = "docs/_decisions/DECISIONS-throws.md";
    const _git = makeGitDouble(gitReply(PROJECT_PATH, throwPath));
    const _readFile = makeReadFileDouble({ [PROJECT_PATH]: goodText }, { throwPaths: [throwPath] });
    lastGitCalls = _git.calls;
    const sink = [];
    const injector = buildDecisionLedgerInjector({ config: ENABLED_CONFIG, sink, _git, _readFile });

    const block = await injector({ feature: FEATURE });

    expect(block).toEqual(expect.stringContaining("DEC-FOO-02"));
    expect(sink[0].failedSources).toEqual([throwPath]);
    expect(sink[0].emptySources).toEqual([]);
  });
});

// ─── buildDecisionLedgerInjector — F-9: reads fine, zero records ⇒ emptySources, NOT failedSources
// (AT-10 + O-7's classification conjunct) ────────────────────────────────────────────────────────

describe("buildDecisionLedgerInjector — F-9 classification: emptySources, never failedSources (AT-10, O-7)", () => {
  test("T-17: a source that reads and parses to zero records lands in emptySources, failedSources stays empty, the other source still renders", async () => {
    const { buildDecisionLedgerInjector } = await import("../orchestrate-dev.js");

    const goodText = decisionText(["DEC-FOO-03", "a rendered statement"]);
    const emptyPath = "docs/_decisions/DECISIONS-no-records.md";
    const _git = makeGitDouble(gitReply(PROJECT_PATH, emptyPath));
    const _readFile = makeReadFileDouble({ [PROJECT_PATH]: goodText, [emptyPath]: NO_RECORD_TEXT });
    lastGitCalls = _git.calls;
    const sink = [];
    const injector = buildDecisionLedgerInjector({ config: ENABLED_CONFIG, sink, _git, _readFile });

    const block = await injector({ feature: FEATURE });

    expect(block).toEqual(expect.stringContaining("DEC-FOO-03"));
    expect(sink[0].emptySources).toEqual([emptyPath]);
    expect(sink[0].failedSources).toEqual([]);
  });
});

// ─── buildDecisionLedgerInjector — F-10: nothing survives, mixture of F-8/F-9 ⇒ total leg ────────
// Same bytes as F-6/F-7, but corpusOutcome stays null — enumeration succeeded, nothing failed
// AT the enumeration level (§6.2: the total leg is decided by what survives, never by what failed).

describe("buildDecisionLedgerInjector — F-10: nothing survives (a failed + an empty source), total leg", () => {
  test("T-17: one failedSource and one emptySource, no source renders ⇒ block \"\", corpusOutcome null (not RSN-UNLISTABLE/RSN-EMPTY)", async () => {
    const { buildDecisionLedgerInjector } = await import("../orchestrate-dev.js");

    const nullPath = "docs/_decisions/DECISIONS-unreadable.md";
    const emptyPath = "docs/_decisions/DECISIONS-no-records.md";
    const _git = makeGitDouble(gitReply(nullPath, emptyPath));
    const _readFile = makeReadFileDouble({ [emptyPath]: NO_RECORD_TEXT }, { nullPaths: [nullPath] });
    lastGitCalls = _git.calls;
    const sink = [];
    const injector = buildDecisionLedgerInjector({ config: ENABLED_CONFIG, sink, _git, _readFile });

    const block = await injector({ feature: FEATURE });

    expect(block).toBe("");
    expect(sink[0].failedSources).toEqual([nullPath]);
    expect(sink[0].emptySources).toEqual([emptyPath]);
    expect(sink[0].rows).toEqual([]);
    expect(sink[0].corpusOutcome).toBeNull();
  });
});

// ─── buildDecisionLedgerInjector — F-14 / Q-2: no feature directory, and a zero-record feature
// directory, BOTH resolve to the project-level set alone (§3.1's union taken over one operand) ──

describe("buildDecisionLedgerInjector — F-14 / Q-2: project-level set alone", () => {
  test("T-17: no directory among the three feature globs for THIS feature ⇒ project-level records render, nothing feature-level", async () => {
    const { buildDecisionLedgerInjector } = await import("../orchestrate-dev.js");

    const projectText = decisionText(["DEC-BAR-01", "a project-level statement"]);
    // Enumeration returns only the project-level file — no path under docs/{feature}/,
    // docs/completed/{feature}/ or docs/discarded/{feature}/ for FEATURE at all.
    const _git = makeGitDouble(gitReply(PROJECT_PATH));
    const _readFile = makeReadFileDouble({ [PROJECT_PATH]: projectText });
    lastGitCalls = _git.calls;
    const sink = [];
    const injector = buildDecisionLedgerInjector({ config: ENABLED_CONFIG, sink, _git, _readFile });

    const block = await injector({ feature: FEATURE });

    expect(block).toEqual(expect.stringContaining("DEC-BAR-01"));
    expect(sink[0].rows).toEqual([{ id: "DEC-BAR-01", sourcePath: PROJECT_PATH, origin: "project" }]);
  });

  test("T-17: a directory exists for the feature but yields zero records ⇒ project-level records still render alone", async () => {
    const { buildDecisionLedgerInjector } = await import("../orchestrate-dev.js");

    const projectText = decisionText(["DEC-BAR-02", "a project-level statement, alone again"]);
    const _git = makeGitDouble(gitReply(PROJECT_PATH, FEATURE_PATH));
    const _readFile = makeReadFileDouble({ [PROJECT_PATH]: projectText, [FEATURE_PATH]: NO_RECORD_TEXT });
    lastGitCalls = _git.calls;
    const sink = [];
    const injector = buildDecisionLedgerInjector({ config: ENABLED_CONFIG, sink, _git, _readFile });

    const block = await injector({ feature: FEATURE });

    expect(block).toEqual(expect.stringContaining("DEC-BAR-02"));
    expect(sink[0].rows).toEqual([{ id: "DEC-BAR-02", sourcePath: PROJECT_PATH, origin: "project" }]);
    // The zero-record feature-level source is a normal F-9 case, not a failure (BR-8).
    expect(sink[0].emptySources).toEqual([FEATURE_PATH]);
    expect(sink[0].failedSources).toEqual([]);
  });
});

// ─── AT-03 freshness: no memoisation — a second dispatch reflects a mutation the FIRST call
// already observed a different value for (`DEC-DECLEDGER-14`, D-11: the fixture copy on disk is
// never written; the scripted double's own returned value changes between calls) ────────────────

describe("buildDecisionLedgerInjector — AT-03 freshness: every call re-gathers, nothing is cached (§2.6, BR-9)", () => {
  test("T-17: `_readFile` returns a mutated text on the SECOND call for the same path; the second dispatch's block reflects the change — a snapshot fails", async () => {
    const { buildDecisionLedgerInjector } = await import("../orchestrate-dev.js");

    let readCallCount = 0;
    const originalText = decisionText(["DEC-FRESH-01", "the original statement"]);
    const mutatedText = decisionText(["DEC-FRESH-01", "the mutated statement"]);
    const _git = makeGitDouble(gitReply(PROJECT_PATH));
    const gitCalls = [];
    const scriptedGit = (argv) => {
      gitCalls.push(argv);
      return _git(argv);
    };
    lastGitCalls = gitCalls;
    // A one-off inline override tracking call count per path — the precedent
    // `learningsCorpus.test.js` uses for a single scripted path's per-call outcome.
    const _readFile = (path) => {
      if (path !== PROJECT_PATH) return null;
      readCallCount += 1;
      return readCallCount === 1 ? originalText : mutatedText;
    };
    const sink = [];
    const injector = buildDecisionLedgerInjector({
      config: ENABLED_CONFIG,
      sink,
      _git: scriptedGit,
      _readFile,
    });

    const firstBlock = await injector({ feature: FEATURE });
    const secondBlock = await injector({ feature: FEATURE });

    expect(firstBlock).toEqual(expect.stringContaining("the original statement"));
    expect(secondBlock).toEqual(expect.stringContaining("the mutated statement"));
    expect(secondBlock).not.toBe(firstBlock);
    expect(readCallCount).toBe(2);
    expect(gitCalls.length).toBe(2);
    expect(sink.length).toBe(2);
  });
});

// ─── `_log` receives one line per dispatch, in production — not only reachable under doubles
// (the shipped CODE_REVIEW F-2 lesson on the learnings injector this feature clones, §7.1) ──────
// This test proves the double IS invoked once per call; the live-production-path arm (T-10a,
// `decisionLedgerMain.test.js`) is what proves the call survives outside a test double entirely.

describe("buildDecisionLedgerInjector — _log receives one line per dispatch", () => {
  test("T-17: two injector calls produce exactly two _log entries, one per dispatch", async () => {
    const { buildDecisionLedgerInjector } = await import("../orchestrate-dev.js");

    const text = decisionText(["DEC-LOG-01", "a logged statement"]);
    const _git = makeGitDouble(gitReply(PROJECT_PATH));
    const _readFile = makeReadFileDouble({ [PROJECT_PATH]: text });
    lastGitCalls = _git.calls;
    const _log = makeLogDouble();
    const sink = [];
    const injector = buildDecisionLedgerInjector({ config: ENABLED_CONFIG, sink, _git, _readFile, _log });

    await injector({ feature: FEATURE });
    expect(_log.calls.length).toBe(1);

    await injector({ feature: FEATURE });
    expect(_log.calls.length).toBe(2);
  });

  test("T-17: buildDecisionLedgerInjector returns null when the flag is not true — the gate (§4.4)", async () => {
    const { buildDecisionLedgerInjector } = await import("../orchestrate-dev.js");

    const disabledConfig = { ...ENABLED_CONFIG, enabled: false };
    const seams = makeDecisionLedgerSeams();
    lastGitCalls = seams._git.calls;

    const injector = buildDecisionLedgerInjector({ config: disabledConfig, sink: [], ...seams });

    expect(injector).toBeNull();
  });
});

// ─── DECISION_LEDGER_CORPUS_OUTCOMES — TSPEC §5.2's set-equality operand (CR F-01/F-02) ─────────
// The catalogue is pinned two-sidedly, the shape its two siblings already carry
// (`DECISION_LEDGER_NOTICES` at decisionLedgerConfig.test.js's notice block,
// `DECISION_LEDGER_OMIT_REASONS` at its omit-reason block), and the shape the sibling FEATURE
// carries for `LEARNINGS_CORPUS_OUTCOMES` (`learningsRecord.test.js`, `learningsArmInventory.test.js`):
//   (a) declared members set-equal a literal transcribed from TSPEC §5.2 / FSPEC F-6+F-7 — never
//       read back off the constant, so deleting a member reddens;
//   (b) the `corpusOutcome` values the injector actually EMITS across its F-6 / F-7 / F-10 arms
//       set-equal the same transcribed literal — so a production assignment drifting away from the
//       catalogue (or a catalogue member no arm can produce) reddens in either direction.

describe("DECISION_LEDGER_CORPUS_OUTCOMES — catalogue set-equality, both directions", () => {
  // Hand-transcribed from FSPEC F-6 (`RSN-UNLISTABLE`) and F-7 (`RSN-EMPTY`).
  const TRANSCRIBED_CORPUS_OUTCOMES = ["RSN-EMPTY", "RSN-UNLISTABLE"];

  test("T-17: the declared catalogue is frozen and set-equal to the transcribed {RSN-UNLISTABLE, RSN-EMPTY}", async () => {
    const { DECISION_LEDGER_CORPUS_OUTCOMES } = await import("../orchestrate-dev.js");

    expect(Object.isFrozen(DECISION_LEDGER_CORPUS_OUTCOMES)).toBe(true);
    expect([...new Set(Object.values(DECISION_LEDGER_CORPUS_OUTCOMES))].sort()).toEqual(
      [...TRANSCRIBED_CORPUS_OUTCOMES].sort()
    );
  });

  test("T-17: the corpusOutcome values the injector EMITS set-equal the catalogue (F-6, F-7, F-10 arms)", async () => {
    const { buildDecisionLedgerInjector, DECISION_LEDGER_CORPUS_OUTCOMES } = await import(
      "../orchestrate-dev.js"
    );

    const runArm = async ({ _git, _readFile }) => {
      const sink = [];
      const injector = buildDecisionLedgerInjector({ config: ENABLED_CONFIG, sink, _git, _readFile });
      await injector({ feature: FEATURE });
      assertNoLiveGitWrites(_git.calls);
      return sink[0].corpusOutcome;
    };

    // F-6: enumeration itself fails.
    const unlistable = await runArm({
      _git: makeGitDouble({ "ls-files": { ok: false, stdout: "" } }),
      _readFile: makeReadFileDouble(),
    });
    // F-7: enumeration succeeds and lists zero paths.
    const empty = await runArm({
      _git: makeGitDouble({ "ls-files": { ok: true, stdout: "" } }),
      _readFile: makeReadFileDouble(),
    });
    // F-10: enumeration succeeded with a path, nothing survives selection — stays `null`,
    // so it contributes nothing to the emitted set (§6.2's total leg).
    const survivorless = await runArm({
      _git: makeGitDouble(gitReply(PROJECT_PATH)),
      _readFile: makeReadFileDouble({ [PROJECT_PATH]: NO_RECORD_TEXT }),
    });

    expect(survivorless).toBeNull();
    const emitted = [unlistable, empty, survivorless].filter((v) => v !== null);
    expect([...new Set(emitted)].sort()).toEqual([...TRANSCRIBED_CORPUS_OUTCOMES].sort());
    expect([...new Set(emitted)].sort()).toEqual(
      [...new Set(Object.values(DECISION_LEDGER_CORPUS_OUTCOMES))].sort()
    );
  });
});
