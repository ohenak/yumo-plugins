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

/**
 * Resolve a `failWrite` / `failAppend` option into a thrown error, or nothing.
 *
 * @param {undefined|((path: string, text: string) => any)|string[]} option
 * @param {string} path
 * @param {string} text
 * @param {string} verb  "write" | "append", used in the default message
 */
function maybeFail(option, path, text, verb) {
  if (!option) return;
  let outcome;
  if (typeof option === "function") outcome = option(path, text);
  else if (Array.isArray(option)) outcome = option.includes(path);
  else outcome = false;
  if (!outcome) return;
  if (outcome instanceof Error) throw outcome;
  throw new Error(
    typeof outcome === "string" ? outcome : `fakeFs: ${verb} failed for ${path}`
  );
}

/**
 * Double for the four file seams over one in-memory tree:
 * `_readFile(path)`, `_writeFile(path, contents)`, `_appendFile(path, text)`
 * and the existing `_checkFile(path)` (TSPEC §3.3, and `checkFileNonEmpty`'s
 * shipped `{ ok }` / `{ ok: false, reason }` contract).
 *
 * Contract points this double preserves, because tests assert on them:
 * - **`_readFile` returns `null`** for an absent path — never throws, mirroring
 *   the shipped `defaultReadFile`.
 * - **`_writeFile` / `_appendFile` throw on failure** — §3.3's deliberate
 *   exception to the never-throw rule. Failure is opt-in via `failWrite` /
 *   `failAppend`.
 * - **`_appendFile` is append-shaped, never a whole-file rewrite** (§3.3,
 *   FSPEC §7.4). The double concatenates; the recorded `appends` entry carries
 *   only the appended `text`, so a test can prove the caller emitted two lines
 *   rather than re-emitting the reviewer's prose.
 * - **`_checkFile`** returns `{ ok: false, reason: "file_missing" }` for an
 *   absent path and `{ ok: false, reason: "file_empty" }` for blank contents.
 *
 * @param {Record<string, string>} [initialContents={}]  path -> contents
 * @param {{
 *   failWrite?: string[] | ((path: string, contents: string) => boolean|string|Error),
 *   failAppend?: string[] | ((path: string, text: string) => boolean|string|Error),
 * }} [opts={}]
 *   Opt-in IO failure. An array is a list of failing paths; a predicate may
 *   return `true`, a message, or an `Error` to throw.
 * @returns {{
 *   files: Record<string, string>,                       // the live tree, readable and writable by the test
 *   readFile: (path: string) => (string|null),           // pass as `_readFile`
 *   writeFile: (path: string, contents: string) => void, // pass as `_writeFile`
 *   appendFile: (path: string, text: string) => void,    // pass as `_appendFile`
 *   checkFile: (path: string) => ({ok: true}|{ok: false, reason: string}), // pass as `_checkFile`
 *   reads: Array<{ path: string, result: string|null }>,
 *   writes: Array<{ path: string, contents: string }>,
 *   appends: Array<{ path: string, text: string }>,
 *   checks: Array<{ path: string, result: object }>,
 *   calls: Array<{ op: "read"|"write"|"append"|"check", path: string, text?: string, result?: any }>,
 *   injections: () => ({ _readFile, _writeFile, _appendFile, _checkFile }),
 *   reset: () => void
 * }}
 *   `calls` is the **cross-operation ordered log** — the one to assert on when
 *   the claim is about ordering (e.g. FSPEC §7.4's "the hash is appended
 *   strictly after the review episode reaches terminal"). The four per-op logs
 *   are conveniences over the same events.
 *
 * @example
 * const fs = fakeFs({ "docs/f/REQ-f.md": "# REQ\n" });
 * const result = await main({ reqPath: "docs/f/REQ-f.md", ...fs.injections() });
 * expect(fs.appends).toEqual([{ path: "…", text: "APPROVAL-HASH: …\nREVIEWED-COMMIT: …\n" }]);
 * expect(fs.calls.map((c) => c.op)).toEqual(["read", "check", "append"]);
 */
export function fakeFs(initialContents = {}, opts = {}) {
  const self = {
    files: { ...initialContents },
    reads: [],
    writes: [],
    appends: [],
    checks: [],
    calls: [],
  };

  self.readFile = (path) => {
    const result = Object.prototype.hasOwnProperty.call(self.files, path)
      ? self.files[path]
      : null;
    self.reads.push({ path, result });
    self.calls.push({ op: "read", path, result });
    return result;
  };

  self.writeFile = (path, contents) => {
    maybeFail(opts.failWrite, path, contents, "write");
    self.files[path] = contents;
    self.writes.push({ path, contents });
    self.calls.push({ op: "write", path, text: contents });
  };

  self.appendFile = (path, text) => {
    maybeFail(opts.failAppend, path, text, "append");
    self.files[path] = (self.files[path] ?? "") + text;
    self.appends.push({ path, text });
    self.calls.push({ op: "append", path, text });
  };

  self.checkFile = (path) => {
    let result;
    if (!path || (typeof path === "string" && path.trim() === "")) {
      result = { ok: false, reason: "file_missing" };
    } else if (!Object.prototype.hasOwnProperty.call(self.files, path)) {
      result = { ok: false, reason: "file_missing" };
    } else if (String(self.files[path]).trim() === "") {
      result = { ok: false, reason: "file_empty" };
    } else {
      result = { ok: true };
    }
    self.checks.push({ path, result });
    self.calls.push({ op: "check", path, result });
    return result;
  };

  self.injections = () => ({
    _readFile: self.readFile,
    _writeFile: self.writeFile,
    _appendFile: self.appendFile,
    _checkFile: self.checkFile,
  });

  self.reset = () => {
    for (const log of [self.reads, self.writes, self.appends, self.checks, self.calls]) {
      log.length = 0;
    }
  };

  return self;
}

// ─── fakeGit ──────────────────────────────────────────────────────────────────

/**
 * Normalise one `fakeGit` script value into the seam's full return shape.
 * A partial result is completed, so a script may say just `{ ok: false }`.
 *
 * @param {undefined|boolean|{ok?: boolean, stdout?: string, stderr?: string}} value
 * @returns {{ ok: boolean, stdout: string, stderr: string }}
 */
function normaliseGitResult(value) {
  if (value === undefined || value === null) {
    return { ok: true, stdout: "", stderr: "" };
  }
  if (typeof value === "boolean") return { ok: value, stdout: "", stderr: "" };
  if (typeof value === "object") {
    return {
      ok: value.ok !== false,
      stdout: value.stdout ?? "",
      stderr: value.stderr ?? "",
    };
  }
  throw new Error(
    "fakeGit: script value must be a boolean or an { ok, stdout, stderr } object"
  );
}

/**
 * Double for the `_git(argv)` transport seam (TSPEC §3.4).
 *
 * The seam **never throws** and interprets nothing: it returns
 * `{ ok, stdout, stderr }` and the caller branches on `ok`. `argv` is an array
 * that does **not** include the leading `"git"`.
 *
 * The recorded invocation log is what makes TSPEC §6.5's **two-invocation
 * queue-row commit** assertable — exactly two calls, in order, `git add` then
 * `git commit -m … -- {queuePath}` — and `commands` renders each argv as one
 * space-joined string so that assertion reads as the spec writes it.
 *
 * @param {undefined                                        // every call succeeds silently
 *         | boolean|{ok?: boolean, stdout?: string, stderr?: string}  // constant result
 *         | Array<any>                                     // per-call results, in order; last one repeats
 *         | Record<string, any>                            // subcommand map: argv[0] -> result
 *         | ((argv: string[], callIndex: number) => any)   // per-call script; callIndex is 0-based
 *        } [script]
 *   A plain object is read as a **subcommand map** when none of its keys is
 *   `ok`/`stdout`/`stderr`; an unmapped subcommand succeeds silently.
 * @returns {((argv: string[]) => { ok: boolean, stdout: string, stderr: string }) & {
 *   calls: string[][],                                     // the argv arrays, in order (mutation-safe copies)
 *   invocations: Array<{ argv: string[], result: object }>, // argv paired with what was returned
 *   commands: string[],                                    // `calls` space-joined, e.g. "add -- docs/_queue/QUEUE.md"
 *   callCount: number,
 *   reset(): void
 * }}
 *
 * @example
 * const git = fakeGit();                       // everything succeeds
 * const git = fakeGit({ commit: { ok: false, stderr: "nothing to commit" } });
 * const git = fakeGit([true, { ok: false }]);  // add succeeds, commit fails
 * expect(git.callCount).toBe(2);
 * expect(git.commands).toEqual([
 *   "add -- docs/_queue/QUEUE.md",
 *   'commit -m chore(queue): f → halted -- docs/_queue/QUEUE.md',
 * ]);
 */
export function fakeGit(script) {
  const isResultShaped =
    script !== null &&
    typeof script === "object" &&
    !Array.isArray(script) &&
    ("ok" in script || "stdout" in script || "stderr" in script);
  const isMap =
    script !== null &&
    typeof script === "object" &&
    !Array.isArray(script) &&
    !isResultShaped;

  const git = (argv) => {
    const args = Array.isArray(argv) ? argv.slice() : [argv];
    const index = git.invocations.length;
    let value;
    if (typeof script === "function") {
      value = script(args, index);
    } else if (Array.isArray(script)) {
      value = script.length === 0 ? undefined : script[Math.min(index, script.length - 1)];
    } else if (isMap) {
      value = Object.prototype.hasOwnProperty.call(script, args[0])
        ? script[args[0]]
        : undefined;
    } else {
      value = script;
    }
    const result = normaliseGitResult(value);
    git.invocations.push({ argv: args, result });
    return result;
  };

  git.invocations = [];
  Object.defineProperties(git, {
    calls: { get: () => git.invocations.map((i) => i.argv.slice()) },
    commands: { get: () => git.invocations.map((i) => i.argv.join(" ")) },
    callCount: { get: () => git.invocations.length },
  });
  git.reset = () => {
    git.invocations.length = 0;
  };
  return git;
}

// ─── recordingRecordHalt ──────────────────────────────────────────────────────

/**
 * Double for the `_recordHalt({ feature, status })` queue-row seam (TSPEC §3.5).
 *
 * The shipped default is a no-op reporting `{ queueRow: "none" }`, and so is
 * this double's default — a unit test has no queue row to write and must not
 * fail for it. `queueRow` is one of `"halted"` | `"halted (uncommitted)"` |
 * `"none"` | `"error"`, with an optional `detail`; §6.5's "commit failure does
 * not downgrade the halt" case is scripted by returning
 * `{ queueRow: "error", detail }` and asserting the pipeline still halts for its
 * original reason.
 *
 * The captured halt records are the point: `records` holds the `{ feature,
 * status }` arguments verbatim, in call order, so a test can assert *which*
 * status was recorded (`"halted"` on the halt path, `"in-progress"` /
 * `"awaiting-merge"` elsewhere) and that it was recorded exactly once.
 *
 * @param {undefined
 *         | {queueRow: string, detail?: string}
 *         | ((arg: {feature: string, status: string}, callIndex: number) => object)
 *        } [result]
 *   What to return. Defaults to `{ queueRow: "none" }`.
 * @returns {((arg: {feature: string, status: string}) => {queueRow: string, detail?: string}) & {
 *   records: Array<{ feature: string, status: string }>,   // the arguments, in call order
 *   calls: Array<{ arg: object, result: object }>,         // arguments paired with returns
 *   statuses: string[],                                    // just the `status` values, in order
 *   last: ({feature: string, status: string}|null),        // the most recent record, or null
 *   callCount: number,
 *   reset(): void
 * }}
 *
 * @example
 * const recordHalt = recordingRecordHalt();
 * await main({ reqPath, _recordHalt: recordHalt, ...rest });
 * expect(recordHalt.callCount).toBe(1);
 * expect(recordHalt.last).toEqual({ feature: "f", status: "halted" });
 */
export function recordingRecordHalt(result) {
  const recordHalt = (arg) => {
    const record = {
      feature: arg && arg.feature,
      status: arg && arg.status,
    };
    const value =
      typeof result === "function"
        ? result(arg, recordHalt.calls.length)
        : (result ?? { queueRow: "none" });
    recordHalt.records.push(record);
    recordHalt.calls.push({ arg, result: value });
    return value;
  };

  recordHalt.records = [];
  recordHalt.calls = [];
  Object.defineProperties(recordHalt, {
    statuses: { get: () => recordHalt.records.map((r) => r.status) },
    last: {
      get: () =>
        recordHalt.records.length
          ? recordHalt.records[recordHalt.records.length - 1]
          : null,
    },
    callCount: { get: () => recordHalt.calls.length },
  });
  recordHalt.reset = () => {
    recordHalt.records.length = 0;
    recordHalt.calls.length = 0;
  };
  return recordHalt;
}
