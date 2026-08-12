// P2-00 pre-flight gate for this feature's PLAN §2. Asserts only that the
// `BL-PREREQ` symbols this plan builds on are importable at HEAD — existence,
// never shape. A symbol whose *shape* a later task changes (e.g.
// `buildEngineBlock`'s argument list, `runStartupChecks`' return) is that
// task's business, not this gate's; asserting shapes here would make the
// gate red by design for the whole feature. See PLAN §2 for the citation
// table this test mirrors, and PROPERTIES's `preflight.test.js` row (T00,
// prerequisite for every other task).

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createAdapter,
  createGit,
  createRunCommand,
  computeRateLimitWaitMs,
} from "../lib/adapter.mjs";

import {
  createTransport,
  DEFAULT_PERMISSION_MODE,
  AuthPolicyError,
  RateLimitedError,
  TimeoutError,
  TransportError,
} from "../lib/transport.mjs";

import {
  runStartupChecks,
  formatStartup,
  EXPECTED_SKILLS,
} from "../lib/startup.mjs";

import { buildEngineBlock, stampReport } from "../lib/report.mjs";

import {
  WORKFLOW_MODULE_URLS,
  workflowModulePath,
  devInjection,
  queueInjection,
} from "../lib/run.mjs";

import {
  resolvePluginRoot,
  skillFilePath,
  loadSkill,
  composeDispatchPrompt,
} from "../lib/skills.mjs";

import {
  checkCompat,
  buildBanner,
  parseVersion,
  satisfiesRange,
} from "../lib/handshake.mjs";

import { PHASE_DISPATCH, runAdvisorySeam } from "../../workflows/orchestrate-dev.js";
// PLAN §2: `runAdvisorySeam` is exported by orchestrate-dev.js and imported
// by orchestrate-queue.js:41 — the import site itself is the second half of
// this BL-PREREQ row, checked directly below rather than re-imported here.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

test("BL-PREREQ: pdlc/engine/lib/adapter.mjs exports its four prerequisite symbols", () => {
  assert.equal(typeof createAdapter, "function");
  assert.equal(typeof createGit, "function");
  assert.equal(typeof createRunCommand, "function");
  assert.equal(typeof computeRateLimitWaitMs, "function");
});

test("BL-PREREQ: pdlc/engine/lib/transport.mjs exports its six prerequisite symbols", () => {
  assert.equal(typeof createTransport, "function");
  assert.notEqual(DEFAULT_PERMISSION_MODE, undefined);
  assert.equal(typeof AuthPolicyError, "function");
  assert.equal(typeof RateLimitedError, "function");
  assert.equal(typeof TimeoutError, "function");
  assert.equal(typeof TransportError, "function");
});

test("BL-PREREQ: pdlc/engine/lib/startup.mjs exports its three prerequisite symbols", () => {
  assert.equal(typeof runStartupChecks, "function");
  assert.equal(typeof formatStartup, "function");
  assert.notEqual(EXPECTED_SKILLS, undefined);
});

test("BL-PREREQ: pdlc/engine/lib/report.mjs exports its two prerequisite symbols", () => {
  assert.equal(typeof buildEngineBlock, "function");
  assert.equal(typeof stampReport, "function");
});

test("BL-PREREQ: pdlc/engine/lib/run.mjs exports its four prerequisite symbols", () => {
  assert.notEqual(WORKFLOW_MODULE_URLS, undefined);
  assert.equal(typeof workflowModulePath, "function");
  assert.equal(typeof devInjection, "function");
  assert.equal(typeof queueInjection, "function");
});

test("BL-PREREQ: pdlc/engine/lib/skills.mjs exports its four prerequisite symbols", () => {
  assert.equal(typeof resolvePluginRoot, "function");
  assert.equal(typeof skillFilePath, "function");
  assert.equal(typeof loadSkill, "function");
  assert.equal(typeof composeDispatchPrompt, "function");
});

test("BL-PREREQ: pdlc/engine/lib/handshake.mjs exports its four prerequisite symbols", () => {
  assert.equal(typeof checkCompat, "function");
  assert.equal(typeof buildBanner, "function");
  assert.equal(typeof parseVersion, "function");
  assert.equal(typeof satisfiesRange, "function");
});

test("BL-PREREQ: pdlc/workflows/orchestrate-dev.js exports PHASE_DISPATCH", () => {
  assert.notEqual(PHASE_DISPATCH, undefined);
});

test("BL-PREREQ: pdlc/workflows/orchestrate-dev.js exports runAdvisorySeam, imported by orchestrate-queue.js", () => {
  assert.equal(typeof runAdvisorySeam, "function");

  const queueSource = readFileSync(
    fileURLToPath(new URL("../../workflows/orchestrate-queue.js", import.meta.url)),
    "utf8",
  );
  const importLine = queueSource.split("\n")[40]; // orchestrate-queue.js:41
  assert.match(importLine, /\brunAdvisorySeam\b/);
});
