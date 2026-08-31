// _stats-scratch-prefixes.mjs — the single exported constant TSPEC §6.5 requires (PLAN T-11).
//
// `stats-read-only.test.js`'s whole-tree snapshot walk excludes `.git/`, `node_modules/` and any
// path segment matching one of these prefixes, so a future in-tree scratch write (a new test
// suite's own `mkdtempSync` under the repository root) is excluded from the read-only oracle in
// exactly one place rather than by editing the walk itself. Today there is exactly one: the
// `.tmp-capture-driver-*` directories `pdlc/workflows/__tests__/learningsCaptureScript.test.js`
// creates under `pdlc/workflows/` and removes in its own `afterEach` (TSPEC §6.5).
//
// Not a glob: each entry is a bare prefix (no trailing `*`) a path SEGMENT is matched against with
// `segment.startsWith(prefix)` — never against a whole relative path — so a scratch directory can
// sit at any depth under the repository root.
//
// This module is excluded from itself trivially: it is a `pdlc/engine/__tests__/`-resident,
// leading-underscore file, so `_run-suite.mjs`'s `node --test` collection never runs it as a test
// file, and its name carries no `.tmp-` segment for the walk it feeds to match against.

/** @type {string[]} */
export const SCRATCH_PREFIXES = [".tmp-"];
