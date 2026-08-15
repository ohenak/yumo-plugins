// CI arrangement (TSPEC §7.6): `pr-tests.yml` must run `pdlc/engine/`'s test suite via a
// fifth job (`engine-tests`), on the SAME matrix `unit-tests` uses, with a job body of
// `npm ci` + `npm test` and nothing else — no `node --test __tests__/` shortcut, so the
// `--import` bootstrap flag and the suite-wide assertion step (both inside the `test`
// script, §7.0) are inherited rather than bypassed. Separately, the repo's canonical
// consumer arrangement — `.claude/pdlc.config.example.json`, the tracked template the
// live, gitignored `.claude/pdlc.config.json` is seeded from — must carry an
// `implementation.testCommand` (which Phase I's wave gate runs) that additionally runs
// `pdlc/engine`'s suite, not only `pdlc/workflows`'s. The live config is per-machine
// consumer state and may legitimately diverge; the tracked example is the arrangement.
//
// This file asserts the static arrangement of those two files. It does not execute either
// suite; that is `unit-tests`'/`engine-tests`' own job, and `assert-suite-wide.test.js`'s.

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(engineRoot));

const workflowPath = path.join(repoRoot, ".github", "workflows", "pr-tests.yml");
const configPath = path.join(repoRoot, ".claude", "pdlc.config.example.json");

const readText = (p) => readFileSync(p, "utf8");

/**
 * Extract one top-level job block from `pr-tests.yml`'s `jobs:` map by name, as raw text.
 * The workflow is hand-authored, 2-space-indented YAML; a job block runs from its
 * `  {name}:` header line to (but not including) the next line matching `^  \S`. No YAML
 * parser dependency is introduced for one arrangement check.
 */
function extractJobBlock(yamlText, jobName) {
  const lines = yamlText.split("\n");
  const startIdx = lines.findIndex((l) => new RegExp(`^  ${jobName}:\\s*$`).test(l));
  if (startIdx === -1) return null;
  const rest = lines.slice(startIdx + 1);
  const endOffset = rest.findIndex((l) => /^  \S/.test(l));
  const bodyLines = endOffset === -1 ? rest : rest.slice(0, endOffset);
  return bodyLines.join("\n");
}

test("ci arrangement — pr-tests.yml", async (t) => {
  const yamlText = readText(workflowPath);

  await t.test("unit-tests job's matrix is the one engine-tests must match", () => {
    const unitBlock = extractJobBlock(yamlText, "unit-tests");
    assert.ok(unitBlock, "unit-tests job must exist in pr-tests.yml");
    assert.match(unitBlock, /os:\s*\[ubuntu-latest\]/, "unit-tests matrix must be ubuntu-latest-only (TSPEC §7.6)");
  });

  await t.test("engine-tests job exists as a fifth job", () => {
    const engineBlock = extractJobBlock(yamlText, "engine-tests");
    assert.ok(engineBlock, "pr-tests.yml must declare an `engine-tests` job (TSPEC §7.6)");
  });

  await t.test("engine-tests job's matrix matches unit-tests' matrix", () => {
    const engineBlock = extractJobBlock(yamlText, "engine-tests");
    assert.ok(engineBlock, "engine-tests job must exist");
    assert.match(
      engineBlock,
      /os:\s*\[ubuntu-latest\]/,
      "engine-tests matrix must match unit-tests' matrix (ubuntu-latest-only, TSPEC §7.6)"
    );
  });

  await t.test("engine-tests job body is npm ci + npm test on pdlc/engine, nothing else", () => {
    const engineBlock = extractJobBlock(yamlText, "engine-tests");
    assert.ok(engineBlock, "engine-tests job must exist");

    assert.match(
      engineBlock,
      /working-directory:\s*pdlc\/engine/,
      "engine-tests must run with working-directory: pdlc/engine"
    );
    assert.match(engineBlock, /\bnpm ci\b/, "engine-tests must install with `npm ci`");
    assert.match(engineBlock, /\bnpm test\b/, "engine-tests job body must be `npm test` (TSPEC §7.6)");

    // The body must NOT bypass package.json's `test` script — a `node --test __tests__/`
    // job would skip the `--import` bootstrap flag and the suite-wide assertion step that
    // are only wired up inside `npm test` (§7.0), and would be green for a strictly
    // weaker property than the local suite.
    assert.doesNotMatch(
      engineBlock,
      /node\s+--test/,
      "engine-tests must not spell out `node --test` directly; it must run `npm test` so the " +
        "--import bootstrap flag and suite-wide assertion step (inside the `test` script) are inherited"
    );
  });
});

test("ci arrangement — .claude/pdlc.config.example.json's implementation.testCommand", () => {
  const config = JSON.parse(readText(configPath));
  const testCommand = config?.implementation?.testCommand;
  assert.equal(typeof testCommand, "string", "implementation.testCommand must be a string");

  // The existing pdlc/workflows suite must still run — this feature adds engine coverage,
  // it does not replace the workflow-module gate Phase I's wave gate already relied on.
  assert.match(
    testCommand,
    /cd pdlc\/workflows\s*&&\s*npm test/,
    "testCommand must still run pdlc/workflows's suite"
  );

  // And it must additionally run pdlc/engine's suite (TSPEC §7.6, §8.1 row for
  // `.claude/pdlc.config.json`), so Phase I's wave gate exercises the engine this feature
  // builds rather than skipping it silently.
  assert.match(
    testCommand,
    /cd pdlc\/engine\s*&&\s*npm test/,
    "testCommand must additionally run pdlc/engine's suite (TSPEC §7.6)"
  );
});
