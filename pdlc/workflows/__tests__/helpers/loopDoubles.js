// loopDoubles.js — PLAN P0-01, "[Fake first]" (pdlc-engineering-loop, batch 1).
//
// PROPERTIES §Fixtures F-1: the shared test doubles every downstream loop test file
// (P1-01 `loopSessionConfig.test.js`, P2-01 `escalationViewParse.test.js`, P3-01
// `loopMergeEscalation.test.js`, P5-01 `loopQueueDriver.test.js`, ...) imports rather than
// re-declares. No new double *kind* is introduced here — each export below is a thin,
// same-shape restatement of an existing precedent (PLAN P0-01):
//
//   - `readFileFn`   — an in-memory `Map<path, string|null>` responder, the shape already
//                       used throughout `pdlc/workflows/__tests__/` and the queue-driver
//                       suites (e.g. `orchestrate-queue.js`'s own `readFileFn` seam).
//   - `_appendFile`  — an array-collecting async fn, plus a rejecting variant for E-08,
//                       mirroring `advisoryEscalationLog.test.js`'s usage of
//                       `helpers/advisoryDoubles.js`'s `makeFileDouble`.
//   - `gitFn`        — an argv-keyed `{ok, stdout, stderr}` responder, mirroring
//                       `mergeQueueDriver.test.js`'s usage of `helpers/mergeDoubles.js`'s
//                       `fakeGit`.
//   - `_now`         — a fixed epoch, mirroring `renderEscalationEntry`'s existing `{now}`
//                       parameter (`pdlc/workflows/orchestrate-dev.js`).
//
// This file itself is excluded from jest collection by `pdlc/workflows/package.json`'s
// `testPathIgnorePatterns` (`/__tests__/helpers/`) — it is infrastructure, not a suite, and
// carries no property of its own (PROPERTIES §11 traceability table: "P0-01 | F-1 doubles
// (no property of its own) | consumed by every integration property").
//
// Nothing here touches the real clock, filesystem, network, `gh` or `git` — every export is
// a plain, synchronous-or-async, pure-data fake.

// ─── makeReadFileFn — the `readFileFn` double ──────────────────────────────
//
// Backed by an in-memory `Map<path, string|null>` (PROPERTIES F-1). `seed` may be a `Map`
// or a plain object; either is copied (never mutated in place) into the double's own `Map`
// so a test can hand it a shared literal without aliasing hazards. A path present in the
// map with value `null` resolves to `null` (the "file exists but read failed" / "absent"
// convention several production readers already use — see `orchestrate-queue.js`'s
// `readFileFn` doc comment: `async (path) => string|null`); a path never seeded also
// resolves to `null`, not a thrown `ENOENT` — callers needing throw-on-missing semantics
// script that explicitly via `overrideFn`.
//
// Every path read is recorded, in order, on `.calls`. `.files` is the live backing map, so
// a test can assert on post-call state or seed additional entries mid-test via
// `.files.set(path, contents)`.
export function makeReadFileFn(seed = {}, { overrideFn } = {}) {
  const files = seed instanceof Map ? new Map(seed) : new Map(Object.entries(seed));
  const calls = [];
  const readFileFn = async (path) => {
    calls.push(path);
    if (overrideFn) return overrideFn(path, files);
    return files.has(path) ? files.get(path) : null;
  };
  return { calls, files, readFileFn };
}

// ─── makeAppendFile — the `_appendFile` double ─────────────────────────────
//
// An array-collecting async fn (PROPERTIES F-1), mirroring
// `advisoryEscalationLog.test.js`'s use of `helpers/advisoryDoubles.js`'s `makeFileDouble`
// `_appendFile` member. Every `(path, contents)` call is recorded, in order, on `.calls`
// as `{path, contents}`; `.text(path)` concatenates every recorded append for that path, in
// call order, so a test can assert on the fully-assembled file body without re-deriving the
// join logic per call site.
export function makeAppendFile() {
  const calls = [];
  const _appendFile = async (path, contents) => {
    calls.push({ path, contents });
  };
  const text = (path) =>
    calls
      .filter((call) => call.path === path)
      .map((call) => call.contents)
      .join("");
  return { calls, text, _appendFile };
}

// ─── makeThrowingAppendFile — the rejecting `_appendFile` variant (E-08) ───
//
// PROPERTIES F-1: "the rejecting `_appendFile` variant is not optional decoration —
// PROP-ESC-09 and PROP-ESC-10 are the only properties proving a durable queue row survives
// an append failure, and both need it." The call is still recorded on `.calls` before the
// rejection, so a test can assert the write was *attempted* even though it failed.
// `message` defaults to a diagnostic string naming the scripted origin, never a bare
// generic message, so a failure surfaced through several layers is still traceable back to
// this double.
export function makeThrowingAppendFile(message = "makeThrowingAppendFile: scripted append failure") {
  const calls = [];
  const _appendFile = async (path, contents) => {
    calls.push({ path, contents });
    throw new Error(message);
  };
  return { calls, _appendFile };
}

// ─── makeGitFn — the `gitFn` double ────────────────────────────────────────
//
// An argv-keyed `{ok, stdout, stderr}` responder (PROPERTIES F-1), mirroring
// `mergeQueueDriver.test.js`'s use of `helpers/mergeDoubles.js`'s `fakeGit`. `script` is
// keyed by `argv[0]` (the git subcommand — `"status"`, `"rebase"`, ...); a leading `-C dir`
// / `-c key=value` prefix pair is skipped when deriving the key, matching `fakeGit`'s own
// clone-domain handling, so a scripted `"status"` entry answers both `git status ...` and
// `git -C dir status ...`. Anything not scripted succeeds trivially (`{ok: true, stdout: "",
// stderr: ""}`), so a test only names the subcommands whose outcome it cares about. Every
// `argv` handed to it is recorded, in order, on `.calls`.
export function makeGitFn(script = {}) {
  const calls = [];
  const gitFn = async (argv) => {
    calls.push(argv);
    let key = Array.isArray(argv) ? argv[0] : argv;
    if (Array.isArray(argv)) {
      let i = 0;
      while (argv[i] === "-C" || argv[i] === "-c") i += 2;
      key = argv[i];
    }
    if (Object.prototype.hasOwnProperty.call(script, key)) {
      return script[key];
    }
    return { ok: true, stdout: "", stderr: "" };
  };
  return { calls, gitFn };
}

// ─── The fixed clock (`_now`) ──────────────────────────────────────────────
//
// A single fixed instant (PROPERTIES F-1), deliberately not "now" — no test result may
// depend on when it runs. F-3's `backoff-reappend` fixture scripts two distinct epochs
// itself (to make PROP-ESC-15's conjuncts (2) and (3) falsifiable) rather than reusing this
// constant, so this file exports only the single fixed baseline every other loop test needs.
export const LOOP_FIXED_NOW_MS = 1735689600000; // 2025-01-01T00:00:00.000Z

export const loopFakeNow = () => LOOP_FIXED_NOW_MS;
