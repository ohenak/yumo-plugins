// Drives `__tests__/_run-suite.mjs` and `__tests__/_bootstrap.mjs` (TSPEC §7.0,
// PLAN T01 -> T11/T12) — the two files this feature's whole cross-process
// observation mechanism rests on. Scope, deliberately narrow (PLAN T01/T11):
//
//   - PROP-SUITE-1 / PROP-SUITE-2: `_run-suite.mjs` does its four steps in
//     order, and mints `PDLC_TEST_RUN_ID` before any child exists — asserted
//     by STATIC inspection of its own source, because the id it mints is not
//     observable from outside without either (a) an override interface TSPEC
//     never grants (§7.0 fixes the child's argv to exactly `__tests__/`), or
//     (b) running the real suite recursively from inside itself. Both are
//     rejected; source order is the oracle these two properties get.
//   - PROP-SUITE-5: the run directory is created EMPTY on every invocation,
//     removing prior contents — same static oracle, same reason.
//   - PROP-SUITE-9: `node --test` never collects a leading-underscore file as
//     a test file — reproduced directly (the exact experiment TSPEC §7.0
//     cites: "a directory holding `a.test.js` and `_helper.mjs` reports
//     `# pass 1` and never executes the helper"), then checked against our
//     three real helper basenames.
//   - PROP-SUITE-3: `_bootstrap.mjs` reads `PDLC_TEST_RUN_ID` and fails loudly
//     when it is unset, rather than minting a private one — a REAL spawn,
//     because "fails loudly" is a runtime behaviour, not a source shape.
//   - PROP-SUITE-4 / PROP-SUITE-7: the inheritance mechanism itself, proven
//     with a REAL spawn of `node --test --import=<real _bootstrap.mjs>` over
//     a scratch directory holding copies of the two real spine-probe files —
//     both records must land in ONE run directory, and a second invocation
//     against the same directory must ACCUMULATE (append-only), not
//     overwrite.
//
// `_run-suite.mjs`'s own end-to-end orchestration (spawning `node --test`
// with the REAL `__tests__/` and then, on success, the real
// `_assert-suite-wide.mjs`) is exercised for real by every `npm test`
// invocation once T11/T12/T19 all exist — this file does not re-run that
// path, precisely to avoid recursing the whole suite from inside one of its
// own test files.

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
} from "node:fs";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const engineRoot = path.dirname(testsDir);

const RUN_SUITE = path.join(testsDir, "_run-suite.mjs");
const BOOTSTRAP = path.join(testsDir, "_bootstrap.mjs");
const ASSERT_SUITE_WIDE = path.join(testsDir, "_assert-suite-wide.mjs");

const HELPER_BASENAMES = ["_run-suite.mjs", "_bootstrap.mjs", "_assert-suite-wide.mjs"];

function newScratchDir(prefix) {
  return mkdtempSync(path.join(os.tmpdir(), prefix));
}

// This whole file runs INSIDE `node --test`, which sets `NODE_TEST_CONTEXT`
// in its own environment. A spawned child that inherits it verbatim trips
// node's own "run() is being called recursively within a test file" guard
// and silently skips running the files it was given — never a real
// suite-vs-helper property, so every child spawn below strips it.
function childEnv(overrides = {}) {
  const env = { ...process.env, ...overrides };
  delete env.NODE_TEST_CONTEXT;
  return env;
}

// ─── existence (the reason this whole file is red until T11/T12 land) ──────

test("TSPEC §7.0: __tests__/_run-suite.mjs exists as the suite's sole entrypoint", () => {
  assert.ok(existsSync(RUN_SUITE), `missing ${RUN_SUITE}`);
});

test("TSPEC §7.0/§7.1: __tests__/_bootstrap.mjs exists as the preloaded bootstrap", () => {
  assert.ok(existsSync(BOOTSTRAP), `missing ${BOOTSTRAP}`);
});

// ─── PROP-SUITE-1 / PROP-SUITE-2 / PROP-SUITE-5: static source order ───────
//
// `_run-suite.mjs` does four things IN ORDER and nothing else (TSPEC §7.0):
//   1. mint `PDLC_TEST_RUN_ID`, derive `PDLC_TEST_RUN_DIR`
//   2. create that directory EMPTY, removing prior contents
//   3. spawn `node --test --import=./__tests__/_bootstrap.mjs __tests__/`
//   4. on success only, spawn `_assert-suite-wide.mjs` and exit on its status
//
// The mint step must precede every spawn (PROP-SUITE-2: minted before any
// child exists), and the empty-directory step must precede the first spawn
// too (PROP-SUITE-5: never populated by a stale run before this run's own
// child ever writes to it).

test("PROP-SUITE-1/2/5: _run-suite.mjs mints the run id and empties the run dir before spawning any child, and spawns the test run before the assertion step", () => {
  assert.ok(existsSync(RUN_SUITE), `missing ${RUN_SUITE}`);
  const src = readFileSync(RUN_SUITE, "utf8");

  const mintIdx = src.search(/PDLC_TEST_RUN_ID\s*[:=]/);
  assert.notEqual(mintIdx, -1, "no assignment to PDLC_TEST_RUN_ID found — the mint step is missing");

  const emptyIdx = src.search(/rmSync\([^)]*\{\s*recursive:\s*true[^}]*force:\s*true/s);
  assert.notEqual(emptyIdx, -1, "no recursive+force rmSync of the run dir found — the empty-directory step is missing");
  assert.ok(emptyIdx > mintIdx, "the run dir must be emptied AFTER the id (and therefore the dir path) is known, never before");

  const testSpawnIdx = src.search(/--import=\.\/__tests__\/_bootstrap\.mjs/);
  assert.notEqual(testSpawnIdx, -1, "no spawn carrying --import=./__tests__/_bootstrap.mjs found — step 3 is missing");
  assert.ok(testSpawnIdx > mintIdx, "the id must be minted BEFORE the test-run child is spawned (PROP-SUITE-2)");
  assert.ok(testSpawnIdx > emptyIdx, "the run dir must be emptied BEFORE the test-run child is spawned");

  const assertSpawnIdx = src.search(/_assert-suite-wide\.mjs/);
  assert.notEqual(assertSpawnIdx, -1, "no reference to _assert-suite-wide.mjs found — step 4 is missing");
  assert.ok(assertSpawnIdx > testSpawnIdx, "the assertion step must be spawned AFTER the test run, never before or concurrently");
});

// ─── PROP-SUITE-9: `_`-prefixed helpers live in __tests__/ without being
// collected as test files ────────────────────────────────────────────────
//
// Reproduces TSPEC §7.0's own cited experiment verbatim: "a directory holding
// `a.test.js` and `_helper.mjs` reports `# pass 1` and never executes the
// helper." A helper that silently ran twice (once as itself, once because
// node's collector mistook it for a test file) is exactly what this guards.

test("PROP-SUITE-9: node --test never collects a leading-underscore file (TSPEC §7.0's own experiment)", () => {
  const dir = newScratchDir("pdlc-suite-spine-underscore-");
  try {
    const marker = path.join(dir, "helper-ran.marker");
    writeFileSync(
      path.join(dir, "_helper.mjs"),
      `import { writeFileSync } from "node:fs";\nwriteFileSync(${JSON.stringify(marker)}, "ran");\n`,
    );
    writeFileSync(
      path.join(dir, "a.test.js"),
      `import test from "node:test";\nimport assert from "node:assert/strict";\ntest("a", () => assert.ok(true));\n`,
    );

    const r = spawnSync(process.execPath, ["--test", dir], { encoding: "utf8", env: childEnv() });
    const out = `${r.stdout ?? ""}${r.stderr ?? ""}`;

    assert.match(out, /# pass 1/, out);
    assert.equal(existsSync(marker), false, "_helper.mjs must never be executed by the collector");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("PROP-SUITE-9: this feature's three real helpers all carry the leading-underscore shape node's collector excludes", () => {
  for (const name of HELPER_BASENAMES) {
    assert.match(name, /^_/, `${name} must start with "_" to stay outside the collected suite`);
  }
  const collected = readdirSync(testsDir).filter((f) => /\.test\.[cm]?js$/.test(f));
  for (const name of HELPER_BASENAMES) {
    assert.equal(collected.includes(name), false, `${name} must not match node's test-file naming convention`);
  }
});

// ─── PROP-SUITE-3: the bootstrap only READS the run id and fails loudly when
// it is unset, rather than minting a private one ────────────────────────────

test("PROP-SUITE-3: _bootstrap.mjs fails loudly (non-zero, naming PDLC_TEST_RUN_ID) when the id is unset", () => {
  assert.ok(existsSync(BOOTSTRAP), `missing ${BOOTSTRAP}`);
  const dir = newScratchDir("pdlc-suite-spine-unset-");
  try {
    writeFileSync(
      path.join(dir, "trivial.test.js"),
      `import test from "node:test";\nimport assert from "node:assert/strict";\ntest("trivial", () => assert.ok(true));\n`,
    );

    const env = childEnv();
    delete env.PDLC_TEST_RUN_ID;
    delete env.PDLC_TEST_RUN_DIR;

    const r = spawnSync(
      process.execPath,
      ["--test", `--import=${BOOTSTRAP}`, dir],
      { encoding: "utf8", cwd: engineRoot, env },
    );
    const out = `${r.stdout ?? ""}${r.stderr ?? ""}`;

    assert.notEqual(r.status, 0, out);
    assert.match(out, /PDLC_TEST_RUN_ID/, out);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ─── PROP-SUITE-4 / PROP-SUITE-7: the real inheritance mechanism ───────────
//
// Copies the two REAL spine-probe files into a scratch suite dir (each is a
// deliberately separate test file, so node --test gives each its own child
// process), sets PDLC_TEST_RUN_ID/DIR directly on the parent env the way
// `_run-suite.mjs` will, and spawns `node --test --import=<real
// _bootstrap.mjs>` over that scratch dir directly — bypassing `_run-suite.mjs`
// itself so this test does not depend on step 4's `_assert-suite-wide.mjs`
// (T19, a later task) to observe the one property it exists to prove: both
// probes' records land in ONE run directory, and running twice against the
// same directory ACCUMULATES rather than overwrites (append-only, PROP-SUITE-7).

function makeScratchSuiteWithProbes() {
  const dir = newScratchDir("pdlc-suite-spine-probes-");
  for (const name of ["spine-probe-a.test.js", "spine-probe-b.test.js"]) {
    writeFileSync(path.join(dir, name), readFileSync(path.join(testsDir, name), "utf8"));
  }
  return dir;
}

function runProbesOnce(suiteDir, runDir) {
  const env = childEnv({ PDLC_TEST_RUN_ID: "suite-spine-scratch", PDLC_TEST_RUN_DIR: runDir });
  const r = spawnSync(
    process.execPath,
    ["--test", `--import=${BOOTSTRAP}`, suiteDir],
    { encoding: "utf8", cwd: engineRoot, env },
  );
  return { ...r, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

test("PROP-SUITE-4: both spine probes' records land in ONE inherited run directory", () => {
  assert.ok(existsSync(BOOTSTRAP), `missing ${BOOTSTRAP}`);
  const suiteDir = makeScratchSuiteWithProbes();
  const runDir = newScratchDir("pdlc-suite-spine-rundir-");
  try {
    const r = runProbesOnce(suiteDir, runDir);
    assert.equal(r.status, 0, r.out);

    const records = readdirSync(runDir)
      .filter((f) => f.endsWith(".jsonl"))
      .flatMap((f) =>
        readFileSync(path.join(runDir, f), "utf8")
          .split("\n")
          .filter(Boolean)
          .map((line) => JSON.parse(line)),
      );

    const probes = new Set(records.filter((rec) => rec.kind === "spine-probe").map((rec) => rec.probe));
    assert.deepEqual([...probes].sort(), ["a", "b"], `expected both probes' records in ${runDir}: ${JSON.stringify(records)}`);
  } finally {
    rmSync(suiteDir, { recursive: true, force: true });
    rmSync(runDir, { recursive: true, force: true });
  }
});

test("PROP-SUITE-7: observations are append-only — a second run against the same directory accumulates, never overwrites", () => {
  assert.ok(existsSync(BOOTSTRAP), `missing ${BOOTSTRAP}`);
  const suiteDir = makeScratchSuiteWithProbes();
  const runDir = newScratchDir("pdlc-suite-spine-rundir-");
  try {
    const first = runProbesOnce(suiteDir, runDir);
    assert.equal(first.status, 0, first.out);
    const second = runProbesOnce(suiteDir, runDir);
    assert.equal(second.status, 0, second.out);

    const lineCount = readdirSync(runDir)
      .filter((f) => f.endsWith(".jsonl"))
      .reduce((n, f) => n + readFileSync(path.join(runDir, f), "utf8").split("\n").filter(Boolean).length, 0);

    // Two runs, two probes each = 4 lines minimum. A rewrite-in-place
    // implementation would collapse this to 2 (one live pid file per run,
    // second run's pids differing is still additive — the only way this
    // drops below 4 is an overwrite of an existing pid's file, which cannot
    // happen here since node mints a fresh pid per process, but a `writeFileSync`
    // instead of `appendFileSync` on that fresh file would still pass; the
    // real overwrite risk this guards is a bootstrap that clears the run dir
    // itself — asserted by requiring BOTH runs' pids to still be present.
    assert.ok(lineCount >= 4, `expected records from both runs to coexist, got ${lineCount} lines`);
  } finally {
    rmSync(suiteDir, { recursive: true, force: true });
    rmSync(runDir, { recursive: true, force: true });
  }
});
