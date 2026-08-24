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
// --check-coverage`, so it reads the coverage artifact that run just produced
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

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const WORKFLOWS = resolve(HERE, "..");
const REPO_ROOT = resolve(WORKFLOWS, "../..");

/** Fallback: the pre-feature merge-base of `feat-pdlc-wave-resume` with `main`. */
const PINNED_BASE_SHA = "b029e853c2287861363cac1039b0c74161719cb2";

const SUBJECT = "pdlc/workflows/orchestrate-dev.js";
const COVERAGE_JSON = join(WORKFLOWS, "coverage/coverage-final.json");

const fail = (msg) => {
  console.error(`delta-coverage: ${msg}`);
  process.exit(1);
};

// ── The base commit ─────────────────────────────────────────────────────────
const git = (args) =>
  execFileSync("git", args, { cwd: REPO_ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

function resolveBase() {
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
}

const { sha: BASE_SHA, source: BASE_SOURCE } = resolveBase();

// ── The introduced ranges ───────────────────────────────────────────────────
// `git diff -U0` hunk headers give post-image start and length directly.
function introducedRanges() {
  let diff;
  try {
    diff = git(["diff", "-U0", BASE_SHA, "HEAD", "--", SUBJECT]);
  } catch (err) {
    fail(`could not diff ${SUBJECT} against base ${BASE_SHA} (${BASE_SOURCE}): ${err.message}`);
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
  return ranges;
}

// ── c8's uncovered line list ────────────────────────────────────────────────
// Istanbul-shaped report: a line is uncovered when every statement whose range
// starts on it has a zero hit count, or a branch location on it was never taken.
function uncoveredLines() {
  if (!existsSync(COVERAGE_JSON)) {
    fail(
      `${COVERAGE_JSON} is absent. Run this through \`npm run test:coverage\`, ` +
        `which produces it, not on its own.`
    );
  }
  const report = JSON.parse(readFileSync(COVERAGE_JSON, "utf8"));
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
}

function branchPercent(entry) {
  const counts = Object.values(entry.b ?? {}).flat();
  if (counts.length === 0) return null;
  const taken = counts.filter((n) => n > 0).length;
  return (taken / counts.length) * 100;
}

// ── Run ─────────────────────────────────────────────────────────────────────
const ranges = introducedRanges();
if (ranges.length === 0) {
  fail(
    `no introduced ranges found in ${SUBJECT} against ${BASE_SHA} (${BASE_SOURCE}). ` +
      `The base or the path is wrong.`
  );
}

const { uncovered, entry } = uncoveredLines();
const inDelta = uncovered.filter((line) =>
  ranges.some(([lo, hi]) => line >= lo && line <= hi)
);

const pct = branchPercent(entry);
const rangeText = ranges.map(([lo, hi]) => (lo === hi ? `${lo}` : `${lo}-${hi}`)).join(", ");

console.log(`delta-coverage: ${SUBJECT}`);
console.log(`  introduced ranges (vs ${BASE_SHA.slice(0, 12)}, ${BASE_SOURCE}): ${rangeText}`);
console.log(`  per-file branch coverage: ${pct === null ? "n/a" : `${pct.toFixed(2)} %`}`);
console.log(`  uncovered lines in file: ${uncovered.length}`);

if (inDelta.length > 0) {
  console.error(
    `delta-coverage: FAIL — ${inDelta.length} uncovered line(s) fall inside this ` +
      `feature's introduced ranges:\n    ${inDelta.join(", ")}\n` +
      `Every branch this feature adds must be reached by a named test ` +
      `(PLAN §4.5.1). A whole-file percentage cannot see this.`
  );
  process.exit(1);
}

console.log(`  uncovered lines inside introduced ranges: 0 — OK`);
