// decisionLedgerDoubles.js — PLAN T-01, "[Fake first]" (pdlc-decision-ledger, batch 1).
//
// TSPEC §7.1: "No new double kind is invented. The two seams are the ones
// `gatherLearningsCorpus` already takes, and the shipped scripted doubles in
// `pdlc/workflows/__tests__/helpers/` supply both." This file follows that
// discipline exactly the way `helpers/loopEconomicsDoubles.js` (PLAN T-01,
// pdlc-loop-economics) does: it re-exports the shipped, generic
// `assertNoLiveGitWrites` leak guard verbatim rather than re-declaring it, and
// gives the two IO seams this feature's own `_git`/`_readFile` contract
// (TSPEC §4.4) — argv-keyed and path-keyed exactly like the shipped
// `makeGitFn` / `makeReadFileFn` (`helpers/loopDoubles.js`), extended with the
// one capability this feature's contract needs that those two do not: a
// scripted **throw** leg, for F-6's ungraceful `_git` failure and F-8/F-9's
// `_readFile` per-path throw (P-8's lesson below).
//
// Doubles are sync (this repo's injected-IO rule: "the adapter's
// implementations are async, the test doubles are sync" — a sync return
// simply resolves when a production `await` sees it).
//
// Ownership (PLAN §4, single-writer-per-file): T-01 owns this file. Every
// downstream decision-ledger test file (T-04 `decisionLedgerConfig.test.js`,
// T-05 `decisionLedgerRecognise.test.js`, T-06 `decisionLedgerRender.test.js`,
// T-07 `decisionLedgerBounds.test.js`, T-08 `decisionLedgerInjector.test.js`,
// T-09 `decisionLedgerCorpus.test.js`, T-10 `decisionLedgerLoop.test.js`,
// T-10a `decisionLedgerMain.test.js`, T-11 `decisionLedgerCensus.test.js`)
// imports from here rather than re-declaring a double.
//
// Excluded from jest discovery by `pdlc/workflows/package.json`'s
// `testPathIgnorePatterns` (`/__tests__/helpers/`) — infrastructure, not a
// suite, and carries no property of its own.
//
// Re-exports: T-02 and T-03 add the frozen-fixture / merge-base loaders they
// create to this file's export list; none exist yet, so none are re-exported
// here.

export { assertNoLiveGitWrites } from "./loopEconomicsDoubles.js";

// ─── makeGitDouble — the `_git` seam double (TSPEC §4.4, §7.1) ────────────
//
// Scripted by `argv[0]` (the git subcommand), mirroring the shipped
// `makeGitFn` convention (`helpers/loopDoubles.js`): a leading `-C dir` /
// `-c key=value` prefix pair is skipped before the subcommand key is read,
// so a scripted `"ls-files"` entry answers both `git ls-files ...` and
// `git -C dir ls-files ...`. A script entry may be:
//   - a result object, e.g. `{ ok: true, stdout: "..." }` or
//     `{ ok: false }` — returned directly (F-6's *graceful* `!ok` leg);
//   - an `Error` instance, or `{ throw: <Error|string> }` — thrown instead
//     of returned (F-6's *ungraceful* leg; `gatherDecisionCorpus`'s own
//     try/catch collapses both onto `{ unlistable: true }` per §4.4).
// Anything not scripted succeeds trivially with empty stdout, so a test
// only names the subcommand(s) it cares about. Every argv handed to the
// double is recorded, in call order, on `.calls` — the exact shape
// `assertNoLiveGitWrites` (re-exported above) expects.
export function makeGitDouble(script = {}) {
  const calls = [];
  const _git = (argv) => {
    calls.push(argv);
    let key = Array.isArray(argv) ? argv[0] : argv;
    if (Array.isArray(argv)) {
      let i = 0;
      while (argv[i] === "-C" || argv[i] === "-c") i += 2;
      key = argv[i];
    }
    if (Object.prototype.hasOwnProperty.call(script, key)) {
      const entry = script[key];
      if (entry instanceof Error) throw entry;
      if (entry && typeof entry === "object" && "throw" in entry) {
        const reason = entry.throw;
        throw reason instanceof Error ? reason : new Error(String(reason));
      }
      return entry;
    }
    return { ok: true, stdout: "" };
  };
  _git.calls = calls;
  return _git;
}

// ─── makeReadFileDouble — the `_readFile` seam double (TSPEC §4.4, §6.1) ──
//
// Scripted by an in-memory `path -> string` map, mirroring the shipped
// `makeReadFileFn` convention (`helpers/loopDoubles.js`): a path present in
// `files` resolves to its string; a path never seeded also resolves to
// `null` rather than throwing.
//
// **P-8's shipped lesson (TSPEC §7.1), why two distinct "missing" shapes
// exist here.** The production `_readFile` seam is `rtReadFile`, which
// *throws* on a genuinely unreadable path (permissions, ENOENT past the
// enumerated listing, ...); `gatherDecisionCorpus`'s per-path `try/catch`
// (TSPEC §4.4) collapses that throw onto the exact same `readOk: false`
// outcome its degrade-one-entry contract already gives a scripted `null`
// return. A double that could only ever return `null` would therefore never
// exercise the throw leg of that try/catch at all — so `nullPaths` and
// `throwPaths` are two independently-scriptable outcomes over the same
// path space, both collapsing to the identical production result, and a
// test proves the collapse by scripting both against the same assertion.
// A path in neither set falls through to the `files` map, then to `null`.
// Every path read is recorded, in order, on `.calls`.
export function makeReadFileDouble(files = {}, { nullPaths = [], throwPaths = [] } = {}) {
  const fileMap = files instanceof Map ? new Map(files) : new Map(Object.entries(files));
  const nullSet = new Set(nullPaths);
  const throwSet = new Set(throwPaths);
  const calls = [];
  const _readFile = (path) => {
    calls.push(path);
    if (throwSet.has(path)) {
      throw new Error(`makeReadFileDouble: scripted throw for "${path}"`);
    }
    if (nullSet.has(path)) return null;
    return fileMap.has(path) ? fileMap.get(path) : null;
  };
  _readFile.calls = calls;
  return _readFile;
}

// ─── makeLogDouble — the `_log` seam double (TSPEC §4.4, §7.1) ────────────
//
// A plain collector: every `_log(info)` call is recorded verbatim, in
// order, on `.calls`. §6.1's per-dispatch observability line must be live
// in production, not only reachable under doubles (the shipped
// `CODE_REVIEW` F-2 lesson on the learnings injector this feature clones),
// so this double exists to let a test assert on exactly what was pushed
// rather than merely that logging did not throw.
export function makeLogDouble() {
  const calls = [];
  const _log = (info) => {
    calls.push(info);
  };
  _log.calls = calls;
  return _log;
}

// ─── makeDecisionLedgerSeams — the combined seam factory (PLAN T-01) ──────
//
// Returns `{ _git, _readFile, _log }`, ready to pass straight into
// `gatherDecisionCorpus` / `buildDecisionLedgerInjector` (TSPEC §4.4). Each
// value defaults to an unscripted double (`_git` succeeds trivially,
// `_readFile` resolves every path to `null`, `_log` collects silently) and
// carries its own `.calls` array, so `assertNoLiveGitWrites(seams._git.calls)`
// is always valid even when a test never overrides `_git`. `overrides`
// replaces any of the three wholesale — typically with a scripted double
// built via `makeGitDouble` / `makeReadFileDouble` / `makeLogDouble` above —
// leaving the other two untouched.
export function makeDecisionLedgerSeams(overrides = {}) {
  return {
    _git: makeGitDouble(),
    _readFile: makeReadFileDouble(),
    _log: makeLogDouble(),
    ...overrides,
  };
}
