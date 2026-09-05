// waveResumeDeltaGate.test.js — T-10's delta-coverage oracle, under test.
//
// Phase CR round 2, TE F-09: `scripts/check-wave-resume-delta-coverage.mjs` is
// the only executable this feature adds that is wired into a REQUIRED CI check
// (`Unit tests (ubuntu-latest, node 24)` runs `npm run test:coverage`, which
// `&&`-chains it), and round 1 shipped it covered only by a wiring assertion —
// "the file exists and package.json names it". None of its exit paths had a
// falsifying test, and the one that mattered most was wrong: an empty
// introduced-range set was a hard failure, so the gate would have gone red on
// `main` the moment this feature merged (TE F-08).
//
// This suite drives the gate through its injected IO seam — `git`, file
// existence, file read, log/error sinks — so every exit path is exercised
// without a repository or a c8 run. The first row is F-08's own case: a base
// that ALREADY CONTAINS the delta must exit 0.
//
// Convention: each case asserts the exit STATUS and the MESSAGE, because a
// status-only assertion cannot tell "passed because there is no delta" from
// "passed because the report was empty".

import { execFileSync } from "child_process";
import { mkdtempSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import {
  PINNED_BASE_SHA,
  SUBJECT,
  runDeltaCoverageGate,
} from "../scripts/check-wave-resume-delta-coverage.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WORKFLOWS = resolve(HERE, "..");
const REPO_ROOT = resolve(WORKFLOWS, "../..");

const BASE = "b029e853c2287861363cac1039b0c74161719cb2";

/** A diff whose single hunk introduces post-image lines 100..102. */
const DIFF_WITH_DELTA = ["@@ -99,0 +100,3 @@", "+a", "+b", "+c", ""].join("\n");
/** A diff whose only hunk is a pure deletion: no post-image line to cover. */
const DIFF_DELETIONS_ONLY = ["@@ -99,3 +98,0 @@", "-a", "-b", "-c", ""].join("\n");

/** An Istanbul-shaped report for SUBJECT with the given uncovered line numbers. */
function coverageReport({ uncoveredLines = [], includeSubject = true } = {}) {
  const entry = { path: `/repo/${SUBJECT}`, statementMap: {}, s: {}, b: {}, branchMap: {} };
  // One taken branch so the percentage is computable and non-null.
  entry.branchMap["0"] = { locations: [{ start: { line: 1 } }, { start: { line: 2 } }] };
  entry.b["0"] = [1, 1];
  uncoveredLines.forEach((line, i) => {
    entry.statementMap[String(i)] = { start: { line }, end: { line } };
    entry.s[String(i)] = 0;
  });
  const report = {};
  if (includeSubject) report[`/repo/${SUBJECT}`] = entry;
  else report["/repo/pdlc/workflows/orchestrate-queue.js"] = entry;
  return report;
}

/**
 * @param {object} opts
 * @param {string} opts.diff      what `git diff -U0 BASE HEAD -- SUBJECT` returns
 * @param {boolean} opts.dirty    whether `git diff --quiet HEAD -- SUBJECT` throws
 * @param {boolean} opts.baseRefs whether origin/main resolves
 */
function harness({
  diff = DIFF_WITH_DELTA,
  diffThrows = false,
  readFile,
  dirty = false,
  baseRefs = true,
  pinReachable = true,
  subjectExists = true,
  coverageExists = true,
  report = coverageReport(),
} = {}) {
  const logs = [];
  const errors = [];
  const gitCalls = [];
  const COVERAGE = "/repo/pdlc/workflows/coverage/coverage-final.json";
  const SUBJECT_PATH = `/repo/${SUBJECT}`;

  const git = (args) => {
    gitCalls.push(args);
    if (args[0] === "merge-base") {
      if (!baseRefs) throw new Error(`unknown revision ${args[2]}`);
      return `${BASE}\n`;
    }
    if (args[0] === "cat-file") {
      if (!pinReachable) throw new Error("not a commit");
      return "";
    }
    if (args[0] === "diff" && args[1] === "--quiet") {
      if (dirty) throw new Error("dirty");
      return "";
    }
    if (args[0] === "diff") {
      if (diffThrows) throw new Error("fatal: bad revision");
      return diff;
    }
    throw new Error(`unexpected git ${args.join(" ")}`);
  };

  const code = runDeltaCoverageGate({
    git,
    fileExists: (p) => (p === COVERAGE ? coverageExists : p === SUBJECT_PATH ? subjectExists : false),
    readFile: readFile ?? (() => JSON.stringify(report)),
    log: (m) => logs.push(m),
    error: (m) => errors.push(m),
    coverageJson: COVERAGE,
    subjectPath: SUBJECT_PATH,
  });
  return { code, out: logs.join("\n"), err: errors.join("\n"), gitCalls };
}

describe("delta-coverage gate: the empty-delta reading (TE F-08)", () => {
  test("a base that already contains the delta is a SUCCESS, not a failure", () => {
    // This is the state of `main` the day after this feature merges: the
    // merge-base contains the feature's lines, so the diff is empty. Round 1
    // exited 1 here, which would have reddened a required check on `main` and
    // on every unrelated branch that does not touch orchestrate-dev.js.
    const { code, out, err } = harness({ diff: "" });
    expect({ code, sawFailure: err.includes("FAIL") || err.includes("wrong") }).toEqual({
      code: 0,
      sawFailure: false,
    });
    expect(out).toContain("no delta in range");
    expect(out).toContain("no commit in");
  });

  test("a deletions-only diff is a SUCCESS and says so distinctly", () => {
    const { code, out } = harness({ diff: DIFF_DELETIONS_ONLY });
    expect(code).toBe(0);
    expect(out).toContain("the only hunks against the base are pure deletions");
  });

  test("an empty delta with the subject ABSENT is still fail-closed", () => {
    // The reading the empty-range guard was really reaching for: a wrong path.
    const { code, err } = harness({ diff: "", subjectExists: false });
    expect(code).toBe(1);
    expect(err).toContain("does not exist in this checkout");
    expect(err).toContain("The path is wrong");
  });
});

describe("delta-coverage gate: the delta-present readings", () => {
  test("an uncovered line INSIDE an introduced range reds, naming the line", () => {
    const { code, err } = harness({ report: coverageReport({ uncoveredLines: [101] }) });
    expect(code).toBe(1);
    expect(err).toContain("delta-coverage: FAIL");
    expect(err).toContain("1 uncovered line(s)");
    expect(err).toContain("101");
  });

  test("an uncovered line OUTSIDE every introduced range is green", () => {
    // The positive half: the gate is delta-scoped, not a whole-file floor.
    const { code, out } = harness({ report: coverageReport({ uncoveredLines: [5000] }) });
    expect(code).toBe(0);
    expect(out).toContain("uncovered lines inside introduced ranges: 0 — OK");
    expect(out).toContain("uncovered lines in file: 1");
  });

  test("a missing coverage artifact reds with a runnable instruction", () => {
    const { code, err } = harness({ coverageExists: false });
    expect(code).toBe(1);
    expect(err).toContain("is absent");
    expect(err).toContain("npm run test:coverage");
  });

  test("the subject missing from the coverage report reds and names the c8 include list", () => {
    const { code, err } = harness({ report: coverageReport({ includeSubject: false }) });
    expect(code).toBe(1);
    expect(err).toContain("has no entry in the coverage report");
    expect(err).toContain("coverageInstrumentation.test.js");
  });

  test("an uncommitted subject warns about the HEAD/working-tree offset but does not red", () => {
    // TE F-10: warn, do not fail — failing here would block the ordinary local
    // edit-and-run loop this gate exists to serve. CI is always clean.
    const { code, err } = harness({ dirty: true });
    expect(code).toBe(0);
    expect(err).toContain("WARNING");
    expect(err).toContain("uncommitted changes");
  });
});

describe("delta-coverage gate: base resolution", () => {
  test("the live merge-base is preferred and reported by source", () => {
    const { code, out, gitCalls } = harness({});
    expect(code).toBe(0);
    expect(out).toContain("merge-base with origin/main");
    expect(gitCalls[0]).toEqual(["merge-base", "HEAD", "origin/main"]);
  });

  test("the pinned sha is the fallback when no main ref resolves", () => {
    const { code, out } = harness({ baseRefs: false });
    expect(code).toBe(0);
    expect(out).toContain("pinned fallback");
  });

  test("an unreachable pin with no main ref reds rather than diffing nothing", () => {
    const { code, err } = harness({ baseRefs: false, pinReachable: false });
    expect(code).toBe(1);
    expect(err).toContain("no base commit available");
    expect(err).toContain(PINNED_BASE_SHA);
  });

  test("the pinned fallback sha is a real ancestor of HEAD in this repository", () => {
    // TE Q-04: a silently-wrong pin surfaces only on the fallback path, which
    // CI never takes — so the pin's reachability is asserted here instead,
    // following learningsBaselineGuard.test.js's EXPECTED_MERGE_BASE_SHA
    // precedent. Runs against the real repo, unlike the cases above.
    const run = (args) =>
      execFileSync("git", args, { cwd: REPO_ROOT, encoding: "utf8" }).trim();
    expect(run(["cat-file", "-t", `${PINNED_BASE_SHA}^{commit}`])).toBe("commit");
    expect(() =>
      execFileSync("git", ["merge-base", "--is-ancestor", PINNED_BASE_SHA, "HEAD"], {
        cwd: REPO_ROOT,
      })
    ).not.toThrow();
  });
});

// CODE_REVIEW v1 §1-1. The gate is wired into a REQUIRED check but its own
// module sat at 72.13 % branch / 60 % functions, unmeasured by `c8.include`:
// the feature added a coverage gate over `orchestrate-dev.js` while the gate
// itself went unchecked. The three uncovered readings were the ones a harness
// that injects EVERY seam can never reach — the injected-IO defaults, the
// diff-failure arm, and the non-`GateFailure` rethrow.
describe("delta-coverage gate: the readings a fully-injected harness cannot reach", () => {
  /** Redirect the DEFAULT log/error sinks — `console.log`/`console.error` — into arrays. */
  function captureConsole() {
    const out = [];
    const err = [];
    const realLog = console.log;
    const realError = console.error;
    console.log = (m) => out.push(String(m));
    console.error = (m) => err.push(String(m));
    return {
      out,
      err,
      restore: () => {
        console.log = realLog;
        console.error = realError;
      },
    };
  }

  /** A tmp file holding `report`, so the DEFAULT `readFile`/`fileExists` can read it. */
  function realCoverageFile(report) {
    const dir = mkdtempSync(join(tmpdir(), "pdlc-delta-gate-"));
    const file = join(dir, "coverage-final.json");
    writeFileSync(file, JSON.stringify(report), "utf8");
    return file;
  }

  test("the un-injected defaults drive the gate against the real repository", () => {
    // Every seam but `coverageJson` defaults: real `git` in the real checkout,
    // real `existsSync`/`readFileSync`, real `console.log`. This is the
    // configuration CI actually runs, and no other case in this file touches it.
    // The verdict is 0 under BOTH readings of the delta — non-empty ranges
    // (this branch) find only line 999999 uncovered, which is outside them;
    // empty ranges (`main`, post-merge) short-circuit to "no delta in range".
    const coverageJson = realCoverageFile(coverageReport({ uncoveredLines: [999999] }));
    const { out, restore } = captureConsole();
    let code;
    try {
      code = runDeltaCoverageGate({ coverageJson });
    } finally {
      restore();
    }
    expect(code).toBe(0);
    expect(out.join("\n")).toContain(`delta-coverage: ${SUBJECT}`);
    // The default `git` really resolved a base: one of the two sources is named.
    expect(out.join("\n")).toMatch(/merge-base with (origin\/)?main|pinned fallback/);
  });

  test("the default error sink carries a failure to stderr", () => {
    // `git` is the only injected seam here, so the range set is fixed and the
    // failure reading is reached on `main` as well as on this branch. Everything
    // that reports — `console.error` — is the shipped default.
    const coverageJson = realCoverageFile(coverageReport({ includeSubject: false }));
    const { err, restore } = captureConsole();
    let code;
    try {
      code = runDeltaCoverageGate({
        coverageJson,
        git: (args) => (args[0] === "merge-base" ? `${BASE}\n` : DIFF_WITH_DELTA),
      });
    } finally {
      restore();
    }
    expect(code).toBe(1);
    expect(err.join("\n")).toContain("has no entry in the coverage report");
  });

  test("a diff that fails reds naming the base and its source, not a stack", () => {
    // A base sha that resolves but cannot be diffed (a corrupt or shallow
    // object store). Round 1 had no case here, so the arm that turns git's
    // error into an operator-readable line was never executed.
    const { code, err } = harness({ diffThrows: true });
    expect(code).toBe(1);
    expect(err).toContain(`could not diff ${SUBJECT} against base ${BASE}`);
    expect(err).toContain("merge-base with origin/main");
    expect(err).toContain("fatal: bad revision");
  });

  test("a report entry with no maps at all is read as 'nothing uncovered, coverage n/a'", () => {
    // c8 emits a bare entry for a file it loaded but never executed. The reader
    // must treat every absent map as empty rather than throwing on it, and the
    // percentage must print as `n/a` rather than as `NaN %`.
    const { code, out } = harness({ report: { [`/repo/${SUBJECT}`]: {} } });
    expect(code).toBe(0);
    expect(out).toContain("per-file branch coverage: n/a");
    expect(out).toContain("uncovered lines in file: 0");
    expect(out).toContain("uncovered lines inside introduced ranges: 0 — OK");
  });

  test("a zero-count branch with no usable location is skipped, not reported as line undefined", () => {
    // The `loc && loc.start && typeof loc.start.line === "number"` guard. A
    // branch id whose `branchMap` entry is missing, or whose location array is
    // short or location-less, would otherwise push `undefined` into the
    // uncovered set and print it as an uncovered "line" in the failure text.
    const report = {
      [`/repo/${SUBJECT}`]: {
        statementMap: {},
        s: {},
        b: { 0: [0, 0], 1: [0], 2: [0] },
        branchMap: {
          // 0: absent entirely.
          1: {},
          2: { locations: [{ start: {} }] },
        },
      },
    };
    const { code, out } = harness({ report });
    expect(code).toBe(0);
    expect(out).toContain("uncovered lines in file: 0");
    // Four zero-count branch counters, none of them takeable: 0 %, not n/a.
    expect(out).toContain("per-file branch coverage: 0.00 %");
  });

  test("an error that is not a GateFailure propagates instead of exiting 1", () => {
    // The rethrow is deliberate: `GateFailure` is the gate's own vocabulary for
    // "this run is red", and swallowing anything else would report a programming
    // fault (a malformed report, a broken seam) as an ordinary coverage failure.
    expect(() =>
      harness({
        readFile: () => {
          throw new TypeError("EISDIR: illegal operation on a directory");
        },
      })
    ).toThrow(TypeError);
  });
});

describe("delta-coverage gate: importing it does not run it", () => {
  test("the module self-executes only when invoked directly", () => {
    // The guard that lets this suite exist: a top-level `process.exit` would
    // kill the jest worker on import.
    const text = execFileSync(
      "cat",
      [join(WORKFLOWS, "scripts/check-wave-resume-delta-coverage.mjs")],
      { encoding: "utf8" }
    );
    expect(text).toContain("if (invokedDirectly) process.exit(runDeltaCoverageGate());");
  });
});
