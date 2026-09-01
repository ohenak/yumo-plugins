// stats-read-only.test.js — TSPEC §6.5, PLAN T-11 (AT-21, AT-22; PROP-RO-01…04, PROP-RO-06).
//
// Committed RED: `bin/cli.mjs` has no `stats` case yet (T-17 adds it), so `pdlc stats` falls
// through `main()`'s `default:` branch — `Unknown command: stats`, exit 1 — on every leg below,
// including the AT-21 success leg that this file pins to exit 0 with the five-key JSON metric
// document. This file goes green only once T-17 lands.
//
// Process-level, in-process (TSPEC §6.2's "Process" row): `main()` is imported and called
// directly with a `process.argv`-shaped array, never spawned — `bin/cli.mjs`'s entry guard makes
// importing it inert. `captureRun` below mirrors `loop-cli.test.js`'s helper of the same name,
// extended per TSPEC §6.2's note: `cmdStats` writes through `process.stdout.write` /
// `process.stderr.write` directly while `checkFlags` uses `console.error`, so both pairs are
// swapped for the call's duration and `process.exitCode` is saved/restored so one case's exit
// code never leaks into the next.
//
// The read-only oracle itself (AT-21, AT-22) runs over the REAL repository tree — the whole
// point is to prove the real seam never writes, which a fixture tree could not falsify — so this
// file's `cwd` is the checkout's own root, read via `--cwd`, and the feature name is a real,
// stable archived feature (`docs/completed/pdlc-headless-engine`), the same real-path anchor
// PLAN T-18 uses.

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import { SCRATCH_PREFIXES } from "./_stats-scratch-prefixes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// __dirname = pdlc/engine/__tests__; three levels up is the repository root (mirrors
// learningsCaptureScript.test.js's REPO_ROOT computation from the sibling workflows suite).
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");

const REAL_FEATURE = "pdlc-headless-engine"; // docs/completed/pdlc-headless-engine — stable, archived
const UNKNOWN_FEATURE = "totally-unknown-feature-that-does-not-exist-xyz";

const EXCLUDED_TOP_SEGMENTS = new Set([".git", "node_modules"]);

/**
 * Mirrors `loop-cli.test.js`'s `captureRun` exactly, extended to also swap
 * `process.stdout.write` / `process.stderr.write` — `cmdStats` writes through those directly
 * (TSPEC §6.2), while `checkFlags`'s usage-error path still uses `console.error`.
 *
 * @param {() => Promise<unknown> | unknown} fn
 * @returns {Promise<{stdout: string, stderr: string, exitCode: number|undefined}>}
 */
async function captureRun(fn) {
  const originalLog = console.log;
  const originalError = console.error;
  const originalStdoutWrite = process.stdout.write;
  const originalStderrWrite = process.stderr.write;
  const exitCodeBefore = process.exitCode;
  let stdout = "";
  let stderr = "";
  console.log = (...args) => {
    stdout += args.map(String).join(" ") + "\n";
  };
  console.error = (...args) => {
    stderr += args.map(String).join(" ") + "\n";
  };
  process.stdout.write = (chunk) => {
    stdout += chunk.toString();
    return true;
  };
  process.stderr.write = (chunk) => {
    stderr += chunk.toString();
    return true;
  };
  try {
    await fn();
  } finally {
    console.log = originalLog;
    console.error = originalError;
    process.stdout.write = originalStdoutWrite;
    process.stderr.write = originalStderrWrite;
  }
  const exitCode = process.exitCode;
  process.exitCode = exitCodeBefore;
  return { stdout, stderr, exitCode };
}

/**
 * True when `segment` matches one of the declared scratch prefixes (TSPEC §6.5): a bare prefix
 * (no trailing `*`), matched with `startsWith`, never against the whole relative path.
 *
 * @param {string} segment
 * @returns {boolean}
 */
function isScratchSegment(segment) {
  return SCRATCH_PREFIXES.some((prefix) => segment.startsWith(prefix));
}

/**
 * Walks every path under `root` except `.git/`, `node_modules/` and any path segment matching a
 * declared scratch prefix, recording each path (relative to `root`) alongside its `mtimeMs`
 * (TSPEC §6.5). Directories and files are both recorded — "every path", not just leaves.
 * `lstatSync` is used deliberately: this walk must never dereference a symlink out of the tree.
 *
 * @param {string} root
 * @returns {Map<string, number>} relative path -> mtimeMs
 */
function snapshotTree(root) {
  /** @type {Map<string, number>} */
  const snapshot = new Map();

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (isScratchSegment(entry.name)) continue;
      if (dir === root && EXCLUDED_TOP_SEGMENTS.has(entry.name)) continue;
      if (EXCLUDED_TOP_SEGMENTS.has(entry.name)) continue;
      const abs = path.join(dir, entry.name);
      const rel = path.relative(root, abs);
      let stat;
      try {
        stat = fs.lstatSync(abs);
      } catch {
        // A path removed between readdir and lstat (e.g. a live scratch write racing this
        // walk in another process) is not this test's concern to record either side of.
        continue;
      }
      snapshot.set(rel, stat.mtimeMs);
      if (entry.isDirectory() && !entry.isSymbolicLink()) {
        walk(abs);
      }
    }
  }

  walk(root);
  return snapshot;
}

/**
 * Asserts two snapshots are set-equal by path AND agree on every path's recorded mtime
 * (TSPEC §6.5's "set-equality between the two snapshots of the same tree").
 *
 * @param {Map<string, number>} before
 * @param {Map<string, number>} after
 */
function assertSnapshotsEqual(before, after) {
  const beforeKeys = new Set(before.keys());
  const afterKeys = new Set(after.keys());

  const addedPaths = [...afterKeys].filter((p) => !beforeKeys.has(p));
  const removedPaths = [...beforeKeys].filter((p) => !afterKeys.has(p));
  assert.deepEqual(addedPaths, [], `paths appeared during the run: ${addedPaths.join(", ")}`);
  assert.deepEqual(removedPaths, [], `paths vanished during the run: ${removedPaths.join(", ")}`);

  const changedPaths = [...beforeKeys].filter(
    (p) => afterKeys.has(p) && before.get(p) !== after.get(p),
  );
  assert.deepEqual(
    changedPaths,
    [],
    `paths changed mtime during the run: ${changedPaths.join(", ")}`,
  );
}

// ─── PROP-RO-04: the guard conjunct ────────────────────────────────────────

test("the declared scratch-prefix constant is non-empty, and no scratch path pre-exists", () => {
  assert.ok(
    Array.isArray(SCRATCH_PREFIXES) && SCRATCH_PREFIXES.length > 0,
    "SCRATCH_PREFIXES must declare at least one prefix, or the exclusion below is a silent no-op",
  );

  /** @type {string[]} */
  const preExisting = [];
  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (dir === REPO_ROOT && EXCLUDED_TOP_SEGMENTS.has(entry.name)) continue;
      if (EXCLUDED_TOP_SEGMENTS.has(entry.name)) continue;
      if (isScratchSegment(entry.name)) {
        preExisting.push(path.relative(REPO_ROOT, path.join(dir, entry.name)));
        continue; // do not descend into a scratch path we are already flagging
      }
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.isSymbolicLink()) walk(abs);
    }
  }
  walk(REPO_ROOT);

  assert.deepEqual(
    preExisting,
    [],
    "a scratch-prefixed path already exists before the read-only run — the exclusion would " +
      `hide it rather than tolerate a run-scoped write: ${preExisting.join(", ")}`,
  );
});

// ─── AT-21: success leg — tree unchanged, and the job was done ────────────

test("AT-21: `pdlc stats {feature} --json` leaves the tree unchanged and emits the metric set with exit 0", async () => {
  const { main } = await import("../bin/cli.mjs");

  const before = snapshotTree(REPO_ROOT);
  const { stdout, exitCode } = await captureRun(() =>
    main(["node", "pdlc", "stats", REAL_FEATURE, "--json", "--cwd", REPO_ROOT]),
  );
  const after = snapshotTree(REPO_ROOT);

  assertSnapshotsEqual(before, after);

  assert.equal(exitCode, 0, `expected exit 0; stdout was: ${stdout}`);
  const doc = JSON.parse(stdout);
  // BR-21/BR-24 — the single-feature success document's exact top-level key set (TSPEC §5).
  assert.deepEqual(
    new Set(Object.keys(doc)),
    new Set(["schemaVersion", "reviewRounds", "dodRounds", "halts", "byteRatio"]),
  );
});

// AT-21 (human-mode success leg). REQ-STATS-08 binds "any invocation of `pdlc stats`,
// in either mode"; the snapshot above covers `--json` only, so a write reachable on the
// human rendering path alone would not be seen (CR-v1 PM F-04).

test("AT-21: `pdlc stats {feature}` in human mode leaves the tree unchanged and emits the report with exit 0", async () => {
  const { main } = await import("../bin/cli.mjs");

  const before = snapshotTree(REPO_ROOT);
  const { stdout, stderr, exitCode } = await captureRun(() =>
    main(["node", "pdlc", "stats", REAL_FEATURE, "--cwd", REPO_ROOT]),
  );
  const after = snapshotTree(REPO_ROOT);

  assertSnapshotsEqual(before, after);

  // The paired "the job was done" conjunct: a no-op command would fail this half.
  assert.equal(exitCode, 0, stderr || stdout);
  assert.ok(stdout.startsWith(`Feature: ${REAL_FEATURE}`), `unexpected report head: ${stdout}`);
  for (const label of ["Review rounds", "DoD rounds", "Halts", "Byte ratio"]) {
    assert.ok(stdout.includes(label), `human report is missing the ${label} metric:\n${stdout}`);
  }
});

// AT-21 (fleet leg). The fleet invocation reads every feature directory under `docs/`
// rather than one, so it is the widest read this command can perform — and the one the
// snapshot pair most needs to cover (CR-v1 PM F-01/F-04).

test("AT-21: `pdlc stats` with no feature argument (fleet) leaves the tree unchanged and emits the fleet report with exit 0", async () => {
  const { main } = await import("../bin/cli.mjs");

  const before = snapshotTree(REPO_ROOT);
  const { stdout, stderr, exitCode } = await captureRun(() =>
    main(["node", "pdlc", "stats", "--json", "--cwd", REPO_ROOT]),
  );
  const after = snapshotTree(REPO_ROOT);

  assertSnapshotsEqual(before, after);

  assert.equal(exitCode, 0, stderr || stdout);
  const doc = JSON.parse(stdout);
  // BR-23 — the fleet success document's exact top-level key set (TSPEC §5).
  assert.deepEqual(
    new Set(Object.keys(doc)),
    new Set(["schemaVersion", "features", "unclassified"]),
  );
  // The real archive is read, not an empty roll-up: this repository's own features appear.
  assert.ok(
    Object.keys(doc.features).includes(REAL_FEATURE),
    `the fleet document does not list ${REAL_FEATURE}`,
  );
});

// ─── AT-22: failure legs — read-only still holds ───────────────────────────

test("AT-22a: an unknown feature leaves the tree unchanged and refuses with exit 1", async () => {
  const { main } = await import("../bin/cli.mjs");

  const before = snapshotTree(REPO_ROOT);
  const { stdout, exitCode } = await captureRun(() =>
    main(["node", "pdlc", "stats", UNKNOWN_FEATURE, "--json", "--cwd", REPO_ROOT]),
  );
  const after = snapshotTree(REPO_ROOT);

  assertSnapshotsEqual(before, after);

  assert.equal(exitCode, 1, `expected exit 1; stdout was: ${stdout}`);
  const doc = JSON.parse(stdout);
  // BR-30 — the refusal document's exact top-level key set, reason and echoed feature name.
  assert.deepEqual(new Set(Object.keys(doc)), new Set(["schemaVersion", "error", "feature"]));
  assert.equal(doc.error.reason, "not_found");
  assert.equal(doc.feature, UNKNOWN_FEATURE);
});

test("AT-22b: an unknown flag leaves the tree unchanged, refuses with exit 1, and prints nothing to stdout", async () => {
  const { main } = await import("../bin/cli.mjs");

  const before = snapshotTree(REPO_ROOT);
  const { stdout, stderr, exitCode } = await captureRun(() =>
    main(["node", "pdlc", "stats", REAL_FEATURE, "--not-a-real-flag", "--cwd", REPO_ROOT]),
  );
  const after = snapshotTree(REPO_ROOT);

  assertSnapshotsEqual(before, after);

  assert.equal(exitCode, 1, `expected exit 1; stderr was: ${stderr}`);
  // BR-01, BR-20's one exception: a usage error's stdout is empty in both modes.
  assert.equal(stdout, "");
  assert.ok(stderr.length > 0, "a usage error must say something on stderr");
});
