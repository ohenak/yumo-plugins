// ─── loopEconomicsDoubles.js ────────────────────────────────────────────────
//
// PLAN T-01, "[Fake first]" (pdlc-loop-economics, batch 1). TSPEC §10 —
// "Doubles follow shipped convention" — plus the mandatory
// `assertNoLiveGitWrites` afterEach guard TSPEC §10 calls out by name,
// against commit `f325016`: a prior test file left `_git` at its real
// default and shelled out to live git, committing 46 junk `chore(queue)`
// commits. Every seam this feature adds a use of gets a scriptable, purely
// in-memory double here; nothing in this file touches a real clock,
// filesystem, network, `gh` or `git`.
//
// Ownership (PLAN §4, single-writer-per-file): T-01 owns this file exactly.
// Every downstream loop-economics test file (T-04 `loopEconomicsConfig.test.js`,
// T-05 `dodRoundIndex.test.js`, T-06 `findingIdentity.test.js`, T-07
// `anchorFreshness.test.js`, T-08 `pinCascade.test.js`, T-09
// `derivativeStop.test.js`, ...) imports from here rather than re-declaring a
// double.
//
// This file is excluded from jest collection by `pdlc/workflows/package.json`'s
// `testPathIgnorePatterns` (`/__tests__/helpers/`) — it is infrastructure, not
// a suite, and carries no property of its own.
//
// Every production seam this feature threads is invoked with `await` at its
// call site (PLAN §Definition of Done: "Every injected IO/git/agent seam call
// added by this feature is awaited"). The doubles below are plain synchronous
// functions — a synchronous return value is a valid value to `await`, so this
// is deliberate: it keeps every double trivial to reason about and does not
// change what the call sites do.

import { makeReadFileFn, makeAppendFile, makeGitFn } from "./loopDoubles.js";

// ─── Re-exports (PLAN T-01: "re-exporting makeGitFn from helpers/loopDoubles.js") ──
//
// Not re-declared here — `helpers/loopDoubles.js` already owns the argv-keyed
// `{ok, stdout, stderr}` responder shape (its `-C dir` / `-c key=value`
// leading-pair skip is the precedent `assertNoLiveGitWrites` below reuses to
// derive the same subcommand key). `makeReadFileFn` and `makeAppendFile` are
// used internally by `makeLoopEconomicsSeams` below but are not re-exported
// under a new name — a caller wanting them directly already imports
// `helpers/loopDoubles.js`.
export { makeGitFn };

// ─── makeListFilesFn — the `_listFiles` double (TSPEC §5.2, `_listFiles`) ──
//
// Mirrors `defaultListFiles`'s contract exactly: never throws, resolves to
// `{ ok: true, files: string[] }` or `{ ok: false, reason }`. `byDir` maps a
// directory path to either an array of basenames (sugar for
// `{ ok: true, files }`) or an explicit `{ ok, files, reason }` shape, so a
// test can script both the happy path (T-05's `v1`,`v2` listing) and the
// fail-open path (a throwing/missing listing falls back to `iteration`)
// without two different helpers. A directory never seeded resolves to
// `{ ok: false, reason: "dir_missing" }`, matching the Node default's ENOENT
// case, not a thrown error — a test wanting a *throwing* `_listFiles` scripts
// that explicitly via `overrideFn`.
export function makeListFilesFn(byDir = {}, { overrideFn } = {}) {
  const calls = [];
  const listFilesFn = async (dirPath) => {
    calls.push(dirPath);
    if (overrideFn) return overrideFn(dirPath, byDir);
    if (!Object.prototype.hasOwnProperty.call(byDir, dirPath)) {
      return { ok: false, reason: "dir_missing" };
    }
    const entry = byDir[dirPath];
    return Array.isArray(entry) ? { ok: true, files: entry } : entry;
  };
  return { calls, listFilesFn };
}

// ─── makeSequencedProbeFn — the `_probeDoc` double (TSPEC §4.3, §7.2) ──────
//
// `probeDocument`'s contract (`orchestrate-dev.js`): `probe(path, docType)`
// resolves to a result whose `.ok === true` is treated as present, anything
// else (including a throw, which `probeDocument` itself catches) as absent.
// `bySequence` maps a path to an array of result objects consumed in call
// order — the last entry sticks once exhausted. This is the shape T-07
// (`anchorFreshness.test.js`) needs directly: "a scripted probe/hash double
// [returns] hash `A` on the upstream doc's read, hash `B` on dispatch" is one
// `bySequence` entry with two elements. A path never seeded resolves to
// `null` (absent), matching `probeDocument`'s own catch-and-null path.
export function makeSequencedProbeFn(bySequence = {}) {
  const calls = [];
  const counters = new Map();
  const probeDocFn = (path, docType) => {
    calls.push({ path, docType });
    const seq = bySequence[path];
    if (!seq || seq.length === 0) return null;
    const i = counters.get(path) ?? 0;
    counters.set(path, Math.min(i + 1, seq.length - 1));
    return seq[Math.min(i, seq.length - 1)];
  };
  return { calls, probeDocFn };
}

// ─── makeSequencedHashFn — the `_hashFile` / `_hashNormalizedFile` double ──
//
// Same call-sequenced shape as `makeSequencedProbeFn`, but for the plain
// `_hashFile(path)` / `_hashNormalizedFile(path)` seams (TSPEC §4.3: "probe
// returning `null` falls back to `_hashFile` when present"). Returns a bare
// hash string (or `null`) per call rather than a `{ok, hash}` envelope. Two
// independent instances are made — one per seam — since `_hashFile` and
// `_hashNormalizedFile` are read at different points and must be scriptable
// independently (§4.2's normalized-hash bookkeeping is a distinct value from
// the plain approval hash).
export function makeSequencedHashFn(bySequence = {}) {
  const calls = [];
  const counters = new Map();
  const hashFn = (path) => {
    calls.push(path);
    const seq = bySequence[path];
    if (!seq || seq.length === 0) return null;
    const i = counters.get(path) ?? 0;
    counters.set(path, Math.min(i + 1, seq.length - 1));
    return seq[Math.min(i, seq.length - 1)];
  };
  return { calls, hashFn };
}

// ─── makeLoopEconomicsSeams — the shared seam bag (PLAN T-01) ─────────────
//
// The `baseSeams` shape from `loopQueueDriver.test.js`
// (`pdlc/workflows/__tests__/loopQueueDriver.test.js`), extended with the
// four seams this feature adds a use of (`_listFiles`, `_probeDoc`,
// `_hashFile`, `_hashNormalizedFile`) plus a call-recording `_appendFile`
// (the no-op `async () => {}` in `baseSeams` is not enough here — §7.5's
// PASS-path re-anchoring and §3's absence-pin both need to assert on what
// was appended).
//
// Returns `{ seams, ...doubles }`: `seams` is the plain object a test spreads
// into `main()` / a direct unit call exactly like `baseSeams(overrides)`
// does; every individual double (`readFileFn`, `_appendFile`, `gitFn`,
// `listFilesFn`, `probeDocFn`, `hashFileFn`, `hashNormalizedFileFn`) and its
// `.calls` array is also returned so a test can assert on call history
// without reaching back into `seams` to find it. `overrides` is spread last,
// so a test can still replace any single seam (including with a
// `makeSequencedProbeFn`/`makeSequencedHashFn` instance scripted for its own
// case) without losing the rest of the bag.
export function makeLoopEconomicsSeams(overrides = {}) {
  const logMessages = [];
  const phaseCalls = [];
  const { calls: readCalls, files: readFiles, readFileFn } = makeReadFileFn({});
  const { calls: appendCalls, text: appendText, _appendFile } = makeAppendFile();
  const { calls: gitCalls, gitFn } = makeGitFn({});
  const { calls: listCalls, listFilesFn } = makeListFilesFn({});
  const { calls: probeCalls, probeDocFn } = makeSequencedProbeFn({});
  const { calls: hashCalls, hashFn: hashFileFn } = makeSequencedHashFn({});
  const { calls: hashNormalizedCalls, hashFn: hashNormalizedFileFn } = makeSequencedHashFn({});

  const seams = {
    _log: (m) => logMessages.push(m),
    _phase: (...args) => {
      phaseCalls.push(args);
    },
    _agent: async () => "TRIAGE: ready",
    _readFile: readFileFn,
    _writeFile: async () => {},
    _appendFile,
    _git: gitFn,
    _listFiles: listFilesFn,
    _probeDoc: probeDocFn,
    _hashFile: hashFileFn,
    _hashNormalizedFile: hashNormalizedFileFn,
    ...overrides,
  };

  return {
    seams,
    logMessages,
    phaseCalls,
    readCalls,
    readFiles,
    appendCalls,
    appendText,
    gitCalls,
    listCalls,
    probeCalls,
    hashCalls,
    hashNormalizedCalls,
  };
}

// ─── assertNoLiveGitWrites — the mandatory `afterEach` leak guard ─────────
//
// TSPEC §10 / commit `f325016`: a prior test file left `_git` at its real,
// live default and shelled out to actual git, silently committing 46 junk
// `chore(queue)` commits before anyone noticed. This feature's rule is
// stricter than "the double is fake" — it is "no test in this feature ever
// records a `commit` or `push` argv it did not explicitly script and assert
// on", so a future author who accidentally wires a live default, or whose
// production code grows an unreviewed write path, fails loudly in
// `afterEach` instead of silently succeeding against `makeGitFn`'s trivial
// `{ok: true}` fallback.
//
// `calls` is a `gitFn` double's `.calls` array (argv-in-call-order, exactly
// what `makeGitFn` returns). Subcommand-key derivation mirrors `makeGitFn`
// itself: a leading `-C dir` / `-c key=value` pair is skipped before reading
// the subcommand, so `git -C dir commit -m x` is caught exactly like
// `git commit -m x`. `allow` is an explicit, per-test opt-in list of
// subcommands this call is permitted to have recorded (empty by default —
// this feature's PLAN never needs `_git` for anything but read-only
// subcommands such as `rev-parse`); throws (not merely returns false) so a
// violation fails the test even if nobody wraps the call in an assertion.
export function assertNoLiveGitWrites(calls, { allow = [] } = {}) {
  const allowed = new Set(allow);
  const writeSubcommands = new Set(["commit", "push"]);
  for (const argv of calls ?? []) {
    let key = Array.isArray(argv) ? argv[0] : argv;
    if (Array.isArray(argv)) {
      let i = 0;
      while (argv[i] === "-C" || argv[i] === "-c") i += 2;
      key = argv[i];
    }
    if (writeSubcommands.has(key) && !allowed.has(key)) {
      throw new Error(
        `assertNoLiveGitWrites: unscripted live git write detected (subcommand ` +
          `"${key}", argv ${JSON.stringify(argv)}) — commit f325016 lesson: script ` +
          `and assert on it explicitly, or pass { allow: ["${key}"] }.`
      );
    }
  }
}
