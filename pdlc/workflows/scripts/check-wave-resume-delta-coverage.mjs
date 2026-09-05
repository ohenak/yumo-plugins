#!/usr/bin/env node
// T-10's delta coverage oracle (PLAN-pdlc-wave-resume §4.5, §4.5.1).
//
// Why this exists, and why the whole-file floor does not replace it: RT-7 /
// round-1 F-05 measured that `orchestrate-dev.js` is ~16,300 lines and this
// feature adds ~24 branches — about one percent of the denominator, so every
// new branch could be uncovered and `npm run test:coverage`'s `--per-file
// --branches 85` gate would still exit 0. This script is the compensating
// control: it reports c8's per-file UNCOVERED LINE LIST for
// `orchestrate-dev.js` and fails when any uncovered line falls inside a line
// range this feature introduced.
//
// It runs as the third step of `npm run test:coverage`, after `c8 report
// --reporter=json` and before `c8 report --check-coverage`, so it reads the
// coverage artifact that `--reporter=json` step just produced
// rather than re-running the suite (a test that re-ran the suite under coverage
// from inside the suite would not terminate — see coverageInstrumentation.test.js).
//
// The introduced ranges are derived from git. The base is the LIVE merge-base
// with `origin/main` when that ref resolves, and a TRANSCRIBED pre-feature
// merge-base sha otherwise — CI checks out with `fetch-depth: 0` but not
// necessarily a local `main` branch, and pinning a sha follows the precedent
// `learningsBaselineGuard.test.js` already sets here (`EXPECTED_MERGE_BASE_SHA`).
//
// Why not the pinned sha alone: Phase DOD rebases the feature branch, which
// moves the merge-base forward. Diffing against a sha behind the new base would
// count lines `main` contributed in that window as lines THIS feature
// introduced, and `orchestrate-dev.js` carries hundreds of uncovered lines
// outside this feature's reach — the oracle would go red on work it does not
// own. Preferring the live merge-base keeps the delta the feature's own; the
// pinned sha stays as the deterministic fallback, and it is a commit on `main`,
// so it never disappears.
//
// LIFETIME (Phase CR round 2, TE F-08 / Q-03). This gate is wired into a
// PERMANENT required check (`Unit tests (ubuntu-latest, node 24)` runs
// `npm run test:coverage`), so it must stay green on `main` and on unrelated
// branches after this feature merges. Once the feature is on `main` the
// merge-base already contains its lines and the diff is legitimately empty:
// that reading is a SUCCESS ("no delta in range"), not the "base or path is
// wrong" failure the round-1 shape raised. The genuinely broken reading —
// `SUBJECT` absent from the checkout, or absent from the coverage report — is
// still fail-closed.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const WORKFLOWS = resolve(HERE, "..");
const REPO_ROOT = resolve(WORKFLOWS, "../..");

/** Fallback: the pre-feature merge-base of `feat-pdlc-wave-resume` with `main`. */
export const PINNED_BASE_SHA = "b029e853c2287861363cac1039b0c74161719cb2";

export const SUBJECT = "pdlc/workflows/orchestrate-dev.js";
export const COVERAGE_JSON = join(WORKFLOWS, "coverage/coverage-final.json");

/** Thrown to unwind to the single exit point; never escapes `runDeltaCoverageGate`. */
class GateFailure extends Error {}

/**
 * The whole gate, with every IO edge injected so it is testable without a
 * repository or a c8 run (TE F-09). Returns the process exit code; it never
 * calls `process.exit` itself.
 *
 * @param {object} io
 * @param {(args: string[]) => string} io.git        run git, throw on non-zero
 * @param {(path: string) => boolean}  io.fileExists
 * @param {(path: string) => string}   io.readFile
 * @param {(msg: string) => void}      io.log
 * @param {(msg: string) => void}      io.error
 * @param {string}                     io.coverageJson
 * @param {string}                     io.subjectPath  absolute path of SUBJECT
 */
export function runDeltaCoverageGate(io = {}) {
  const {
    git = (args) =>
      execFileSync("git", args, { cwd: REPO_ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }),
    fileExists = existsSync,
    readFile = (p) => readFileSync(p, "utf8"),
    log = (msg) => console.log(msg),
    error = (msg) => console.error(msg),
    coverageJson = COVERAGE_JSON,
    subjectPath = join(REPO_ROOT, SUBJECT),
  } = io;

  const fail = (msg) => {
    throw new GateFailure(msg);
  };

  // ── The base commit ───────────────────────────────────────────────────────
  const resolveBase = () => {
    for (const ref of ["origin/main", "main"]) {
      try {
        const sha = git(["merge-base", "HEAD", ref]).trim();
        if (sha) return { sha, source: `merge-base with ${ref}` };
      } catch {
        // ref absent in this checkout — try the next one, then the pin.
      }
    }
    try {
      git(["cat-file", "-e", `${PINNED_BASE_SHA}^{commit}`]);
    } catch {
      fail(
        `no base commit available: neither origin/main nor main resolves, and the ` +
          `pinned base ${PINNED_BASE_SHA} is absent from this checkout ` +
          `(CI checks out with fetch-depth: 0).`
      );
    }
    return { sha: PINNED_BASE_SHA, source: "pinned fallback" };
  };

  // ── The introduced ranges ─────────────────────────────────────────────────
  // `git diff -U0` hunk headers give post-image start and length directly.
  const introducedRanges = (baseSha, baseSource) => {
    let diff;
    try {
      diff = git(["diff", "-U0", baseSha, "HEAD", "--", SUBJECT]);
    } catch (err) {
      fail(`could not diff ${SUBJECT} against base ${baseSha} (${baseSource}): ${err.message}`);
    }
    const ranges = [];
    for (const line of diff.split("\n")) {
      const m = /^@@ -\S+ \+(\d+)(?:,(\d+))? @@/.exec(line);
      if (!m) continue;
      const start = Number(m[1]);
      const len = m[2] === undefined ? 1 : Number(m[2]);
      if (len === 0) continue; // pure deletion: no post-image line to cover
      ranges.push([start, start + len - 1]);
    }
    return { ranges, hadHunks: /^@@ /m.test(diff) };
  };

  // ── c8's uncovered line list ──────────────────────────────────────────────
  // Istanbul-shaped report: a line is uncovered when every statement whose range
  // starts on it has a zero hit count, or a branch location on it was never taken.
  const uncoveredLines = () => {
    if (!fileExists(coverageJson)) {
      fail(
        `${coverageJson} is absent. Run this through \`npm run test:coverage\`, ` +
          `which produces it, not on its own.`
      );
    }
    const report = JSON.parse(readFile(coverageJson));
    const key = Object.keys(report).find((p) => p.replace(/\\/g, "/").endsWith(SUBJECT));
    if (!key) {
      fail(
        `${SUBJECT} has no entry in the coverage report. Check package.json's ` +
          `c8 \`include\` list still names it (coverageInstrumentation.test.js asserts that).`
      );
    }
    const entry = report[key];
    const uncovered = new Set();
    for (const [id, loc] of Object.entries(entry.statementMap ?? {})) {
      if ((entry.s ?? {})[id] === 0) uncovered.add(loc.start.line);
    }
    for (const [id, counts] of Object.entries(entry.b ?? {})) {
      const locs = (entry.branchMap ?? {})[id]?.locations ?? [];
      counts.forEach((n, i) => {
        const loc = locs[i];
        if (n === 0 && loc && loc.start && typeof loc.start.line === "number") {
          uncovered.add(loc.start.line);
        }
      });
    }
    return { uncovered: [...uncovered].sort((a, b) => a - b), entry };
  };

  const branchPercent = (entry) => {
    const counts = Object.values(entry.b ?? {}).flat();
    if (counts.length === 0) return null;
    const taken = counts.filter((n) => n > 0).length;
    return (taken / counts.length) * 100;
  };

  // ── Run ───────────────────────────────────────────────────────────────────
  try {
    const { sha: BASE_SHA, source: BASE_SOURCE } = resolveBase();
    const { ranges, hadHunks } = introducedRanges(BASE_SHA, BASE_SOURCE);

    if (ranges.length === 0) {
      // TE F-08: the two readings of an empty range set, separated mechanically.
      // Broken: the subject is not in the checkout at all — the path is wrong.
      if (!fileExists(subjectPath)) {
        fail(
          `${SUBJECT} does not exist in this checkout, so no delta could be ` +
            `derived. The path is wrong.`
        );
      }
      // Benign: the base already contains whatever this range would have held —
      // which is the permanent state of `main` after this feature merges.
      const reason = hadHunks
        ? "the only hunks against the base are pure deletions"
        : `no commit in ${BASE_SHA.slice(0, 12)}..HEAD touches it`;
      log(`delta-coverage: ${SUBJECT}`);
      log(`  no delta in range (${BASE_SOURCE}): ${reason} — nothing for this oracle to check.`);
      return 0;
    }

    const { uncovered, entry } = uncoveredLines();
    const inDelta = uncovered.filter((line) => ranges.some(([lo, hi]) => line >= lo && line <= hi));

    const pct = branchPercent(entry);
    const rangeText = ranges.map(([lo, hi]) => (lo === hi ? `${lo}` : `${lo}-${hi}`)).join(", ");

    log(`delta-coverage: ${SUBJECT}`);
    log(`  introduced ranges (vs ${BASE_SHA.slice(0, 12)}, ${BASE_SOURCE}): ${rangeText}`);
    log(`  per-file branch coverage: ${pct === null ? "n/a" : `${pct.toFixed(2)} %`}`);
    log(`  uncovered lines in file: ${uncovered.length}`);

    // TE F-10: the ranges are post-image line numbers of HEAD, but c8 measured
    // the WORKING TREE copy. Uncommitted edits to the subject offset the two.
    // CI is always clean, so this is a local-developer trap: warn (loudly and
    // by name) rather than fail, which would block the ordinary edit-and-run
    // loop the gate is meant to serve.
    let dirty = false;
    try {
      git(["diff", "--quiet", "HEAD", "--", SUBJECT]);
    } catch {
      dirty = true;
    }
    if (dirty) {
      error(
        `delta-coverage: WARNING — ${SUBJECT} has uncommitted changes. The ` +
          `introduced ranges are HEAD line numbers but c8 measured the working ` +
          `tree, so this result may be offset. Commit or stash before trusting it.`
      );
    }

    if (inDelta.length > 0) {
      error(
        `delta-coverage: FAIL — ${inDelta.length} uncovered line(s) fall inside this ` +
          `feature's introduced ranges:\n    ${inDelta.join(", ")}\n` +
          `Every branch this feature adds must be reached by a named test ` +
          `(PLAN §4.5.1). A whole-file percentage cannot see this.`
      );
      return 1;
    }

    log(`  uncovered lines inside introduced ranges: 0 — OK`);
    return 0;
  } catch (err) {
    if (err instanceof GateFailure) {
      error(`delta-coverage: ${err.message}`);
      return 1;
    }
    throw err;
  }
}

// Run only when invoked as a script; importing this module (the gate's own test
// suite does) must not execute it or exit the test process.
const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) process.exit(runDeltaCoverageGate());
