// Suite runner (TSPEC §7.0, PLAN T11). Not collected as a test file (leading
// underscore, PROP-SUITE-9). Does four things, in order, and nothing else:
//
//   1. mint one PDLC_TEST_RUN_ID and derive PDLC_TEST_RUN_DIR from it
//   2. create that run directory EMPTY, removing any prior contents
//   3. spawn `node --test`, preloading the bootstrap module found under
//      this same __tests__/ directory, with that id in its environment,
//      stdio inherited
//   4. on success only, spawn the suite-wide assertion script found under
//      this same __tests__/ directory, with the same environment, and
//      exit on its status
//
// Any of this runner's own unrecognised argv is forwarded through to the
// spawned `node --test` invocation, in node-option position (before the
// `__tests__/` path argument) — so `npm test -- --experimental-test-coverage`
// is a hermetic coverage run rather than a second, bootstrap-less spelling
// of the suite.

import { spawnSync } from "node:child_process";
import { rmSync, mkdirSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const engineRoot = path.dirname(testsDir);

// ─── step 1: mint the run id before any child exists ───────────────────────

const PDLC_TEST_RUN_ID = crypto.randomUUID();
const PDLC_TEST_RUN_DIR = path.join(os.tmpdir(), "pdlc-test-runs", PDLC_TEST_RUN_ID);

// ─── step 2: create the run directory empty ─────────────────────────────────

rmSync(PDLC_TEST_RUN_DIR, { recursive: true, force: true });
mkdirSync(PDLC_TEST_RUN_DIR, { recursive: true });

const env = { ...process.env, PDLC_TEST_RUN_ID, PDLC_TEST_RUN_DIR };

// The runner's own unrecognised argv is forwarded verbatim, in node-option
// position — before the `__tests__/` path list — never appended after it
// (node reads a flag after a path as a path, not an option).
const forwardedArgs = process.argv.slice(2);

// ─── step 3: spawn the test run, importing the bootstrap into every child ──

const testRun = spawnSync(
  process.execPath,
  ["--test", ...forwardedArgs, "--import=./__tests__/_bootstrap.mjs", "__tests__/"],
  { cwd: engineRoot, env, stdio: "inherit" },
);

if (testRun.status !== 0) {
  process.exit(testRun.status ?? 1);
}

// ─── step 4: on success only, run the suite-wide assertion step ────────────

const assertStep = spawnSync(
  process.execPath,
  ["__tests__/_assert-suite-wide.mjs"],
  { cwd: engineRoot, env, stdio: "inherit" },
);

process.exit(assertStep.status ?? 1);
