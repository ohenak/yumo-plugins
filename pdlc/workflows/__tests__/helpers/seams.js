/**
 * seams.js — the one canonical seam-double module (TSPEC §8.1, `DEC-ORACLE-03`).
 *
 * Ownership (PLAN §5.2, single-writer-per-file): RLH-02 (batch 2). Every L2
 * orchestration test — `pacingWrapper`, `reviewLoop`, `approvalSearch`,
 * `haltAndQueue`, `orchestrateQueue`, `reportTemplates` — imports its seam
 * doubles from here. **No test file defines an ad-hoc seam object**, so a change
 * to a seam contract breaks one file, not thirty.
 *
 * Excluded from jest discovery by the existing `testPathIgnorePatterns`
 * (`/__tests__/helpers/`), so this file is never run as a suite.
 *
 * ## The doubles are synchronous, deliberately
 *
 * TSPEC §8.1: "The seam doubles are sync; the adapter is async." That asymmetry
 * is a feature of the test design and simultaneously its central hazard — it is
 * precisely why a missing `await` on an injected seam call passes L1 and L2 and
 * fails only in production (L3's `RLH-AT-19` is the compensating control).
 * **Do not make these factories async to "help".** Production code awaits them;
 * a sync return simply resolves.
 *
 * ## What is *not* here
 *
 * This is not a generator library. `__tests__/helpers/driftGenerators.js` is the
 * only source of `int` / `pick` / `shuffle` / `bytes` / `resolveSeed` / `shrink`
 * (PLAN §7.2, TSPEC §8.2); it is read-only for this feature and is neither
 * modified nor duplicated here. Domain generators stay file-local to the
 * property suites that draw them.
 *
 * ## Exports
 *
 * | Factory | Doubles | TSPEC |
 * |---|---|---|
 * | `fakeListFiles(spec)` | `_listFiles(dirPath)` | §3.2, §4.2 |
 * | `fakeFs(initialContents, opts)` | `_readFile` / `_writeFile` / `_appendFile` / `_checkFile` | §3.3 |
 * | `fakeGit(script)` | `_git(argv)` | §3.4, §6.5 |
 * | `recordingRecordHalt(result)` | `_recordHalt({ feature, status })` | §3.5 |
 *
 * Every double is a **callable with recording properties hung off it**, so a
 * test can pass it straight into `main()`'s injection list and afterwards assert
 * call order, arguments and counts off the same object.
 */

/**
 * The closed `ListFailure` catalogue (TSPEC §4.1 `LIST_FAILURES`), restated here
 * so `fakeListFiles` can validate a scripted reason without importing from the
 * module under test (which would make the double agree with a wrong production
 * catalogue by construction).
 *
 * @type {readonly string[]}
 */
export const LIST_FAILURE_VALUES = Object.freeze([
  "dir_missing",
  "not_a_directory",
  "unreadable",
  "bad_argument",
]);

// ─── fakeListFiles ────────────────────────────────────────────────────────────

// ─── fakeFs ───────────────────────────────────────────────────────────────────

// ─── fakeGit ──────────────────────────────────────────────────────────────────

// ─── recordingRecordHalt ──────────────────────────────────────────────────────
