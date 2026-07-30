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

/**
 * Normalise one `fakeListFiles` spec value into the seam's return union.
 * Accepts basenames, a bare `ListFailure` string, or an already-shaped result.
 *
 * @param {string[]|string|{ok:boolean}} value
 * @returns {{ ok: true, files: string[] } | { ok: false, reason: string }}
 */
function normaliseListResult(value) {
  if (Array.isArray(value)) return { ok: true, files: value.slice() };
  if (typeof value === "string") {
    if (!LIST_FAILURE_VALUES.includes(value)) {
      throw new Error(
        `fakeListFiles: "${value}" is not a ListFailure (${LIST_FAILURE_VALUES.join(", ")})`
      );
    }
    return { ok: false, reason: value };
  }
  if (value && typeof value === "object" && typeof value.ok === "boolean") {
    return value.ok
      ? { ok: true, files: (value.files ?? []).slice() }
      : { ok: false, reason: value.reason };
  }
  throw new Error(
    "fakeListFiles: spec value must be string[] (basenames), a ListFailure " +
      "string, or a { ok, … } result object"
  );
}

/**
 * Double for the `_listFiles(dirPath)` seam (TSPEC §3.2).
 *
 * The seam **never throws**: every failure is `{ ok: false, reason }` with
 * `reason` drawn from the closed `ListFailure` catalogue of §4.2. This double
 * can therefore produce *every* catalogue value, not just success — including a
 * mid-run failure at one call only, which is what `RLH-AT-43a(b)` needs.
 * Returned `files` are **basenames, not paths** (§3.2); the double copies the
 * array on every call so a caller that mutates its result cannot corrupt the
 * script.
 *
 * @param {string[]                                     // constant success, these basenames, any dirPath
 *         | string                                     // constant failure, this ListFailure, any dirPath
 *         | {ok: boolean, files?: string[], reason?: string} // constant, this exact result
 *         | Record<string, any>                        // per-directory map: dirPath -> any of the above
 *         | ((dirPath: string, callIndex: number) => any) // per-call script; callIndex is 0-based
 *        } [spec=[]]
 *   What to return. A plain object is read as a **dirPath map** when none of its
 *   keys is `ok`; an unmapped dirPath yields `{ ok: false, reason: "dir_missing" }`
 *   (§4.2's benign value — an unconfigured directory simply does not exist).
 * @returns {((dirPath: string) => ({ ok: true, files: string[] } | { ok: false, reason: string })) & {
 *   calls: Array<{ dirPath: string, result: object }>,  // ordered log, one entry per invocation
 *   dirs: string[],                                     // just the dirPath arguments, in order
 *   results: object[],                                  // just the returned results, in order
 *   callCount: number,                                  // getter: calls.length
 *   reset(): void                                       // clears the log, keeps the script
 * }}
 *   The seam function, with its recording hung off it.
 *
 * @example
 * const listFiles = fakeListFiles(["CROSS-REVIEW-pm-REQ.md"]);           // always this listing
 * const listFiles = fakeListFiles("unreadable");                          // always halts the caller
 * const listFiles = fakeListFiles({ "docs/f": ["a.md"] });               // per directory
 * const listFiles = fakeListFiles((dir, i) => (i === 2 ? "unreadable" : []));  // fails on call 3 only
 * expect(listFiles.callCount).toBe(3);
 * expect(listFiles.dirs).toEqual(["docs/f", "docs/f", "docs/f"]);
 */
export function fakeListFiles(spec = []) {
  const isMap =
    spec !== null &&
    typeof spec === "object" &&
    !Array.isArray(spec) &&
    typeof spec.ok !== "boolean";

  const listFiles = (dirPath) => {
    let value;
    if (typeof spec === "function") {
      value = spec(dirPath, listFiles.calls.length);
    } else if (isMap) {
      value = Object.prototype.hasOwnProperty.call(spec, dirPath)
        ? spec[dirPath]
        : "dir_missing";
    } else {
      value = spec;
    }
    const result = normaliseListResult(value);
    listFiles.calls.push({ dirPath, result });
    return result;
  };

  listFiles.calls = [];
  Object.defineProperties(listFiles, {
    dirs: { get: () => listFiles.calls.map((c) => c.dirPath) },
    results: { get: () => listFiles.calls.map((c) => c.result) },
    callCount: { get: () => listFiles.calls.length },
  });
  listFiles.reset = () => {
    listFiles.calls.length = 0;
  };
  return listFiles;
}

// ─── fakeFs ───────────────────────────────────────────────────────────────────

// ─── fakeGit ──────────────────────────────────────────────────────────────────

// ─── recordingRecordHalt ──────────────────────────────────────────────────────
