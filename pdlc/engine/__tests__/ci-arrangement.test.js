// CI arrangement (FSPEC §5.1 BR-7.1..BR-7.6, TSPEC §8.2/§8.5): `pr-tests.yml` must declare
// exactly the five PR-gate jobs FSPEC §5.1 names, with a job-level `name:` alphabet that
// set-equals the authored column and a **per-job matrix expansion** (§8.5 — the axes are read
// per job, not once for the whole file) that set-equals the rendered column. A `name:` carrying
// any non-matrix expression, or an axis introduced by a matrix `include:` entry, is a failure
// reported as "unexpandable name expression" (BR-7.3) — never silently under-rendered. A job
// carrying `uses:` is unexpandable for the same reason (§8.2/E-19): a reusable-workflow call
// renders as `{caller job name} / {called job name}`, which this expander does not model, so
// GitHub's real rendering could silently diverge from what this file computes while staying
// green here — the arrangement is declared out of bounds instead.
//
// It also asserts the `publish.yml`/`pr-tests.yml` gate-command set-equality (§8.2, §8.5): the
// commands `publish.yml`'s `gate` job runs must set-equal the run commands of `pr-tests.yml`'s
// five gate jobs, which is what pays for §8.2's duplicated-job-bodies decision (the reusable-
// workflow extraction was rejected precisely because it silently renames rendered check names).
//
// This file **is** the oracle for all of the above — there is no separate production module
// that implements the expander; the parsing/expansion logic below is the carrier FSPEC §5.1 and
// TSPEC §8.5 both name (`pdlc/engine/__tests__/ci-arrangement.test.js`). It does not execute
// either workflow; that is the workflows' own job, and `assert-suite-wide.test.js`'s.
//
// This file absorbs V-19: the older file-wide (not per-job) matrix assertions this file used to
// carry are replaced by the per-job expander below, so one arrangement change now has one
// failure and one remedy (FSPEC BR-7.6, TSPEC §8.5).

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(engineRoot));

const workflowPath = path.join(repoRoot, ".github", "workflows", "pr-tests.yml");
const publishWorkflowPath = path.join(repoRoot, ".github", "workflows", "publish.yml");
const configPath = path.join(repoRoot, ".claude", "pdlc.config.example.json");

const readText = (p) => readFileSync(p, "utf8");

// ---------------------------------------------------------------------------------------------
// Arrangement carrier (FSPEC §5.1 BR-7.1..BR-7.6, TSPEC §8.5)
// ---------------------------------------------------------------------------------------------

const GATE_JOB_IDS = [
  "unit-tests",
  "engine-tests",
  "artifact-freshness",
  "fresh-clone-bootstrap",
  "script-syntax",
];

const EXPECTED_AUTHORED = [
  "Unit tests (${{ matrix.os }}, node ${{ matrix.node }})",
  "Engine tests (${{ matrix.os }})",
  "Generated artifacts are in sync",
  "Fresh-clone bootstrap works",
  "Shell scripts parse",
];

const EXPECTED_RENDERED_BY_JOB = {
  "unit-tests": "Unit tests (ubuntu-latest, node 20)",
  "engine-tests": "Engine tests (ubuntu-latest)",
  "artifact-freshness": "Generated artifacts are in sync",
  "fresh-clone-bootstrap": "Fresh-clone bootstrap works",
  "script-syntax": "Shell scripts parse",
};

/**
 * Extract every top-level job block under `jobs:` as `{ [jobId]: bodyText }`, keyed by the
 * job's own 2-space-indented id. Reads only job-level structure — step-level `name:`/`uses:`
 * lines live deeper (6-space, dash-prefixed) and are never mistaken for job-level ones below.
 */
function extractAllJobBlocks(yamlText) {
  const lines = yamlText.split("\n");
  const jobsIdx = lines.findIndex((l) => /^jobs:\s*$/.test(l));
  if (jobsIdx === -1) return {};
  const jobHeaderRe = /^ {2}([A-Za-z0-9_-]+):\s*$/;
  const headers = [];
  for (let i = jobsIdx + 1; i < lines.length; i++) {
    const m = jobHeaderRe.exec(lines[i]);
    if (m) headers.push({ id: m[1], line: i });
  }
  const blocks = {};
  for (let k = 0; k < headers.length; k++) {
    const start = headers[k].line + 1;
    const end = k + 1 < headers.length ? headers[k + 1].line : lines.length;
    blocks[headers[k].id] = lines.slice(start, end).join("\n");
  }
  return blocks;
}

/** The job-level `name:` value (4-space indent) — never a step-level `- name:` (6-space, dashed). */
function extractJobName(block) {
  const m = /^ {4}name:\s*(.+?)\s*$/m.exec(block);
  return m ? m[1] : null;
}

/** True if the job body carries a job-level `uses:` (reusable-workflow call), never a step's. */
function hasJobLevelUses(block) {
  return /^ {4}uses:\s*\S/m.test(block);
}

/** Parse `strategy: matrix:`'s declared bracket-array axes: `{ axisName: [values...] }`. */
function extractMatrixAxes(block) {
  const lines = block.split("\n");
  const matrixIdx = lines.findIndex((l) => /^\s*matrix:\s*$/.test(l));
  if (matrixIdx === -1) return {};
  const matrixIndent = lines[matrixIdx].match(/^(\s*)/)[1].length;
  const axes = {};
  for (let i = matrixIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") continue;
    const indent = line.match(/^(\s*)/)[1].length;
    if (indent <= matrixIndent) break;
    const m = /^\s*([A-Za-z0-9_]+):\s*\[([^\]]*)\]/.exec(line);
    if (m) {
      axes[m[1]] = m[2]
        .split(",")
        .map((v) => v.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean);
    }
  }
  return axes;
}

/**
 * Expand a job's `name:` against ITS OWN declared matrix axes (§8.5 — read per job, not once
 * for the file). Returns `{ authored, rendered: [...] }` on success, or `{ authored,
 * unexpandable: reason }` when the job carries `uses:` (§8.2/E-19) or the name contains any
 * expression that is not `${{ matrix.<declaredAxis> }}` (BR-7.3) — including an axis introduced
 * only by a matrix `include:` entry, which this expander deliberately does not parse.
 */
function expandJobName(block) {
  const authored = extractJobName(block);
  // Checked before requiring a name: key — a reusable-workflow job may omit `name:` and still
  // render as `{caller job id}/{called job name}`, so `uses:` alone is enough to disqualify it.
  if (hasJobLevelUses(block)) {
    return { authored, unexpandable: "uses: (reusable-workflow job; §8.2/E-19)" };
  }
  if (authored == null) {
    return { authored: null, unexpandable: "no job-level name: key" };
  }
  const axes = extractMatrixAxes(block);
  const exprRe = /\$\{\{\s*([^}]+?)\s*\}\}/g;
  const exprs = [];
  let m;
  while ((m = exprRe.exec(authored))) exprs.push(m[1]);
  for (const expr of exprs) {
    const axisMatch = /^matrix\.([A-Za-z0-9_]+)$/.exec(expr);
    if (!axisMatch || !(axisMatch[1] in axes)) {
      return { authored, unexpandable: `unexpandable name expression: \${{ ${expr} }}` };
    }
  }
  if (exprs.length === 0) return { authored, rendered: [authored] };

  const axisNames = [...new Set(exprs.map((e) => e.split(".")[1]))];
  let variants = [authored];
  for (const axisName of axisNames) {
    const next = [];
    const re = new RegExp(`\\$\\{\\{\\s*matrix\\.${axisName}\\s*\\}\\}`, "g");
    for (const variant of variants) {
      for (const value of axes[axisName]) next.push(variant.replace(re, value));
    }
    variants = next;
  }
  return { authored, rendered: variants };
}

/** Extract each `run:` step's command text (inline or block-scalar), normalized/trimmed. */
function extractRunCommands(block) {
  const lines = block.split("\n");
  const commands = [];
  for (let i = 0; i < lines.length; i++) {
    const inline = /^\s*run:\s*(\S.*)$/.exec(lines[i]);
    if (inline && inline[1].trim() !== "|") {
      commands.push(inline[1].trim());
      continue;
    }
    if (/^\s*run:\s*\|\s*$/.test(lines[i])) {
      const baseIndent = lines[i].match(/^(\s*)/)[1].length;
      const block2 = [];
      let j = i + 1;
      while (j < lines.length && (lines[j].trim() === "" || lines[j].match(/^(\s*)/)[1].length > baseIndent)) {
        block2.push(lines[j]);
        j++;
      }
      commands.push(block2.join("\n").trim());
      i = j - 1;
    }
  }
  return commands;
}

function assertSetEqual(actual, expected, message) {
  assert.deepEqual([...actual].sort(), [...expected].sort(), message);
}

// ---------------------------------------------------------------------------------------------
// FSPEC §5.1's two set-equalities, over the real pr-tests.yml
// ---------------------------------------------------------------------------------------------

test("ci arrangement — pr-tests.yml", async (t) => {
  const yamlText = readText(workflowPath);
  const blocks = extractAllJobBlocks(yamlText);

  await t.test("job set and job-level name: keys equal FSPEC §5.1's authored alphabet (BR-7.1)", () => {
    const ids = Object.keys(blocks);
    assertSetEqual(
      ids,
      GATE_JOB_IDS,
      "pr-tests.yml's job set must equal FSPEC §5.1's five gate jobs; an added, renamed, or " +
        "removed job fails here first (BR-7.1) — a PR check this feature adds must land in " +
        "the FSPEC table before it lands in the workflow"
    );
    const authored = ids.map((id) => extractJobName(blocks[id]));
    assertSetEqual(
      authored,
      EXPECTED_AUTHORED,
      "job-level `name:` keys must set-equal FSPEC §5.1's authored column (BR-7.1). Step-level " +
        "`name:` strings are not members of this set"
    );
  });

  await t.test("rendered names equal FSPEC §5.1's rendered alphabet, expanded per job (§8.5)", () => {
    const renderedAll = new Set();
    for (const id of GATE_JOB_IDS) {
      const block = blocks[id];
      assert.ok(block, `${id} job must exist`);
      const result = expandJobName(block);
      assert.ok(!result.unexpandable, `${id}: ${result.unexpandable}`);
      assert.deepEqual(
        result.rendered,
        [EXPECTED_RENDERED_BY_JOB[id]],
        `${id}'s rendered name must equal FSPEC §5.1's row for it, expanded from THIS job's ` +
          `own declared matrix axes — not a file-wide axis set (§8.5 per-job expansion, V-18 ` +
          `correction)`
      );
      result.rendered.forEach((r) => renderedAll.add(r));
    }
    assertSetEqual(
      renderedAll,
      new Set(Object.values(EXPECTED_RENDERED_BY_JOB)),
      "the rendered alphabet, taken across all five jobs, must set-equal FSPEC §5.1's rendered column"
    );
  });

  await t.test("engine-tests job body is npm ci + npm test on pdlc/engine, nothing else", () => {
    const engineBlock = blocks["engine-tests"];
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

// ---------------------------------------------------------------------------------------------
// BR-7.3/E-19: the expander must fail loudly rather than silently under-render
// ---------------------------------------------------------------------------------------------

test("ci arrangement — expander fails loudly on non-matrix / uses: arrangements (BR-7.3, §8.2, E-19)", async (t) => {
  await t.test("a name: expression outside declared matrix axes is unexpandable", () => {
    const fixture =
      "jobs:\n" +
      "  weird:\n" +
      "    name: Weird (${{ github.run_id }})\n" +
      "    runs-on: ubuntu-latest\n" +
      "    steps:\n" +
      "      - run: echo hi\n";
    const block = extractAllJobBlocks(fixture)["weird"];
    const result = expandJobName(block);
    assert.match(
      result.unexpandable,
      /unexpandable name expression/,
      "a context expression such as github.* must be reported as unexpandable, never skipped or silently rendered"
    );
  });

  await t.test("a matrix `include:`-introduced axis is unexpandable (this expander parses bracket axes only)", () => {
    const fixture =
      "jobs:\n" +
      "  weird2:\n" +
      "    name: Weird (${{ matrix.flavor }})\n" +
      "    runs-on: ubuntu-latest\n" +
      "    strategy:\n" +
      "      matrix:\n" +
      "        include:\n" +
      "          - flavor: spicy\n" +
      "    steps:\n" +
      "      - run: echo hi\n";
    const block = extractAllJobBlocks(fixture)["weird2"];
    const result = expandJobName(block);
    assert.match(
      result.unexpandable,
      /unexpandable name expression/,
      "an axis introduced only via matrix `include:` is not a declared bracket axis, so a name " +
        "referencing it must fail rather than silently under-render (BR-7.3)"
    );
  });

  await t.test("a job carrying uses: is unexpandable, symmetric with BR-7.3 (§8.2, E-19)", () => {
    const fixture =
      "jobs:\n" +
      "  gate:\n" +
      "    uses: ./.github/workflows/reusable.yml\n" +
      "    with:\n" +
      "      foo: bar\n";
    const block = extractAllJobBlocks(fixture)["gate"];
    const result = expandJobName(block);
    assert.match(
      result.unexpandable,
      /uses:/,
      "a reusable-workflow call renders as `{caller job name} / {called job name}`, which this " +
        "expander does not model; declaring it out of bounds is what makes the §8.2 rejection " +
        "of that pattern mechanically enforced rather than a matter of discipline"
    );
  });
});

// ---------------------------------------------------------------------------------------------
// AT-3.4 / BR-7.6: mutation evidence, run against fixture copies — never the live pr-tests.yml
// ---------------------------------------------------------------------------------------------

test("ci arrangement — mutation evidence over fixture copies (AT-3.4, BR-7.6)", async (t) => {
  const yamlText = readText(workflowPath);

  await t.test("an added job breaks the authored-set equality", () => {
    const mutated =
      yamlText +
      "\n  extra-job:\n" +
      "    name: Extra job\n" +
      "    runs-on: ubuntu-latest\n" +
      "    steps:\n" +
      "      - run: echo hi\n";
    const ids = Object.keys(extractAllJobBlocks(mutated));
    assert.notDeepEqual(
      [...ids].sort(),
      [...GATE_JOB_IDS].sort(),
      "a job added to a fixture copy must be detectable by the job-set equality — any addition fails"
    );
  });

  await t.test("a deleted job breaks the authored-set equality", () => {
    const lines = yamlText.split("\n");
    const startIdx = lines.findIndex((l) => /^ {2}script-syntax:\s*$/.test(l));
    assert.ok(startIdx !== -1, "fixture setup: script-syntax job must exist in the live file");
    const mutated = lines.slice(0, startIdx).join("\n");
    const ids = Object.keys(extractAllJobBlocks(mutated));
    assert.notDeepEqual(
      [...ids].sort(),
      [...GATE_JOB_IDS].sort(),
      "a job removed from a fixture copy must be detectable by the job-set equality — a deletion fails"
    );
  });

  await t.test("a renamed job's name: breaks the authored-alphabet equality", () => {
    const mutated = yamlText.replace("name: Shell scripts parse", "name: Shell scripts checked");
    const blocks = extractAllJobBlocks(mutated);
    const authored = Object.keys(blocks).map((id) => extractJobName(blocks[id]));
    assert.notDeepEqual(
      [...authored].sort(),
      [...EXPECTED_AUTHORED].sort(),
      "a renamed job-level name: must be detectable by the authored-alphabet equality"
    );
  });

  await t.test(
    "a matrix edit changing only the rendered set is caught by the rendered equality even " +
      "though the authored equality stays green (BR-7.1's own failure case)",
    () => {
      const original =
        "jobs:\n" +
        "  engine-tests:\n" +
        "    name: Engine tests (${{ matrix.os }})\n" +
        "    runs-on: ${{ matrix.os }}\n" +
        "    strategy:\n" +
        "      matrix:\n" +
        "        os: [ubuntu-latest]\n" +
        "    steps:\n" +
        "      - run: npm test\n";
      const mutated = original.replace("os: [ubuntu-latest]", "os: [macos-latest]");

      const originalResult = expandJobName(extractAllJobBlocks(original)["engine-tests"]);
      const mutatedResult = expandJobName(extractAllJobBlocks(mutated)["engine-tests"]);

      assert.equal(
        originalResult.authored,
        mutatedResult.authored,
        "fixture setup: the authored name: text is unchanged by an os-values-only matrix edit"
      );
      assert.notDeepEqual(
        originalResult.rendered,
        mutatedResult.rendered,
        "the rendered set must change when only the matrix values change, even though the " +
          "authored `name:` text is byte-identical — this is exactly the drift an authored-only " +
          "check would miss (FSPEC BR-7.1)"
      );
    }
  );
});

// ---------------------------------------------------------------------------------------------
// TSPEC §8.2/§8.5: publish.yml's gate job must set-equal pr-tests.yml's five gate jobs' commands
// ---------------------------------------------------------------------------------------------

test("ci arrangement — publish.yml/pr-tests.yml gate-command set-equality (§8.2, §8.5)", () => {
  assert.ok(
    existsSync(publishWorkflowPath),
    ".github/workflows/publish.yml must exist and carry its own copy of the five PR-gate jobs' " +
      "bodies (TSPEC §8.2) — not yet created"
  );

  const publishText = readText(publishWorkflowPath);
  const publishBlocks = extractAllJobBlocks(publishText);
  const gateBlock = publishBlocks["gate"];
  assert.ok(gateBlock, "publish.yml must declare a `gate` job");
  assert.doesNotMatch(
    gateBlock,
    /^ {4}uses:\s*\S/m,
    "publish.yml's gate job must duplicate the five PR-gate jobs' bodies, never `uses:` a " +
      "reusable workflow (§8.2 — the reusable-workflow extraction was rejected because it " +
      "silently renames rendered check names Phase PUB polls literally)"
  );

  const prBlocks = extractAllJobBlocks(readText(workflowPath));
  const expectedCommands = new Set();
  for (const id of GATE_JOB_IDS) {
    for (const cmd of extractRunCommands(prBlocks[id])) expectedCommands.add(cmd);
  }
  const actualCommands = new Set(extractRunCommands(gateBlock));

  assertSetEqual(
    actualCommands,
    expectedCommands,
    "publish.yml's gate job must run the same commands as pr-tests.yml's five gate jobs, as a " +
      "set-equality over the run commands (§8.5) — this is what pays for §8.2's duplication: " +
      "the two files are kept in step by a test, not by memory"
  );
});

test("ci arrangement — publish.yml adds no job to pr-tests.yml (C-5, BR-7.5)", () => {
  const ids = Object.keys(extractAllJobBlocks(readText(workflowPath)));
  assert.equal(
    ids.length,
    GATE_JOB_IDS.length,
    "the publish pipeline must be additive — its own workflow file with its own trigger — and " +
      "must never add a job to pr-tests.yml (C-5); publish.yml's jobs are not PR checks and are " +
      "not members of §5.1's set (BR-7.5)"
  );
});

// ---------------------------------------------------------------------------------------------
// implementation.testCommand (unrelated to §5.1; unchanged by this task)
// ---------------------------------------------------------------------------------------------

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
