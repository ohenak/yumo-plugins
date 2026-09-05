// CI arrangement (FSPEC §5.1 BR-7.1..BR-7.6, TSPEC §8.2/§8.5): `pr-tests.yml` must declare
// exactly the §5.1 rows that belong to this file, with a job-level `name:` alphabet that
// set-equals the authored column and a **per-job matrix expansion** (§8.5 — the axes are read
// per job, not once for the whole file) that set-equals the rendered column. A `name:` carrying
// any non-matrix expression, or an axis introduced by a matrix `include:` entry, is a failure
// reported as "unexpandable name expression" (BR-7.3) — never silently under-rendered. A job
// carrying `uses:` is unexpandable for the same reason (§8.2/E-19): a reusable-workflow call
// renders as `{caller job name} / {called job name}`, which this expander does not model, so
// GitHub's real rendering could silently diverge from what this file computes while staying
// green here — the arrangement is declared out of bounds instead.
//
// It also asserts the `publish.yml`/PR-gate gate-command set-equality (§8.2, §8.5, BR-7.7): the
// commands `publish.yml`'s `gate` job runs must set-equal the run commands of every PR-gate
// file's gate jobs — `pr-tests.yml`'s and `fixture-machine.yml`'s — which is what pays for §8.2's duplicated-job-bodies decision (the reusable-
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
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(engineRoot));

const workflowsDir = path.join(repoRoot, ".github", "workflows");
const workflowPath = path.join(workflowsDir, "pr-tests.yml");
const publishWorkflowPath = path.join(workflowsDir, "publish.yml");
const fixtureMachineWorkflowPath = path.join(workflowsDir, "fixture-machine.yml");
const configPath = path.join(repoRoot, ".claude", "pdlc.config.example.json");

const readText = (p) => readFileSync(p, "utf8");

// ---------------------------------------------------------------------------------------------
// Arrangement carrier (FSPEC §5.1 BR-7.1..BR-7.6, TSPEC §8.5)
// ---------------------------------------------------------------------------------------------

const GATE_JOB_IDS = ["unit-tests", "engine-tests", "script-syntax"];

const FIXTURE_MACHINE_JOB_IDS = ["fixture-machine"];

/**
 * §5.1's file scope (BR-7.1): every workflow file that gates pull requests, and the job ids it
 * owns. `publish.yml` is absent because it is tag-triggered — a reason that is true of it and
 * false of `fixture-machine.yml`, which is why the latter is a member (CODE_REVIEW v1 §3-1).
 * The `§5.1's file scope` test below re-derives this key set from the files' own triggers, so a
 * new PR-gating workflow cannot join the repo without joining §5.1.
 */
const PR_GATE_FILES = {
  "pr-tests.yml": GATE_JOB_IDS,
  "fixture-machine.yml": FIXTURE_MACHINE_JOB_IDS,
};

const EXPECTED_AUTHORED_BY_JOB = {
  "unit-tests": "Unit tests (${{ matrix.os }}, node ${{ matrix.node }})",
  "engine-tests": "Engine tests (${{ matrix.os }})",
  "script-syntax": "Shell scripts parse",
  "fixture-machine": "Fixture machine (install/upgrade, launcher, container, two-repo)",
};

const EXPECTED_AUTHORED = GATE_JOB_IDS.map((id) => EXPECTED_AUTHORED_BY_JOB[id]);

const EXPECTED_RENDERED_BY_JOB = {
  "unit-tests": "Unit tests (ubuntu-latest, node 24)",
  "engine-tests": "Engine tests (ubuntu-latest)",
  "script-syntax": "Shell scripts parse",
  "fixture-machine": "Fixture machine (install/upgrade, launcher, container, two-repo)",
};

/**
 * True when the workflow's top-level `on:` block declares a `pull_request` trigger. Read from
 * the file's own text (BR-7.2, decidable offline): membership in §5.1 is a property of the
 * trigger, not of anyone's memory. Only the top-level `on:` block is read — the word may appear
 * in prose comments or in a step's `if:` and is not a trigger there.
 */
function isPullRequestTriggered(yamlText) {
  const lines = yamlText.split("\n");
  const onIdx = lines.findIndex((l) => /^on:\s*$/.test(l) || /^on:\s*\S/.test(l));
  if (onIdx === -1) return false;
  if (/^on:\s*\S/.test(lines[onIdx])) return /pull_request/.test(lines[onIdx]);
  for (let i = onIdx + 1; i < lines.length; i++) {
    if (/^\S/.test(lines[i])) break;
    if (/^ {2}pull_request:?\s*$/.test(lines[i])) return true;
  }
  return false;
}

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
      "pr-tests.yml's job set must equal the FSPEC §5.1 gate jobs that belong to this file; " +
        "an added, renamed, or " +
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
      new Set(GATE_JOB_IDS.map((id) => EXPECTED_RENDERED_BY_JOB[id])),
      "the rendered alphabet, taken across this file's three jobs, must set-equal FSPEC §5.1's " +
        "rendered rows for it; §5.1's fourth row belongs to fixture-machine.yml and is asserted " +
        "by the cross-file test below"
    );
  });

  await t.test("unit-tests runs the workflows suite under coverage (CODE_REVIEW v1 §1-2)", () => {
    const unitBlock = blocks["unit-tests"];
    assert.ok(unitBlock, "unit-tests job must exist");
    assert.match(
      unitBlock,
      /working-directory:\s*pdlc\/workflows/,
      "unit-tests must run with working-directory: pdlc/workflows"
    );
    // `npm test` alone reported no coverage at all for the workflows modules this
    // feature edits, so "≥85% branch" could not be positively established for them
    // (CODE_REVIEW v1 §1-2). `test:coverage` runs two stages with the declared floor
    // enforced in aggregate and branch ≥85% enforced per module: it runs the suite
    // and additionally verifies per-module coverage, so the instrumentation is a gate
    // rather than a report nobody reads.
    assert.match(
      unitBlock,
      /\bnpm run test:coverage\b/,
      "unit-tests must run `npm run test:coverage`, not bare `npm test` — otherwise the " +
        "declared coverage floor never runs anywhere and the numbers are a one-off measurement"
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
// §5.1 row 6 / BR-7.1's "PR-gate workflow file(s)": fixture-machine.yml (CODE_REVIEW v1 §3-1)
//
// The set is over PR *checks*, not over one file. `fixture-machine.yml` triggers `on:
// pull_request`, so its job renders as a check on a pull request and is a member; the previous
// arrangement read `pr-tests.yml` alone, which left this job's rename or deletion invisible to
// the very oracle AC-3.4 exists to provide. Membership is decided by the trigger, mechanically,
// below — so a *future* PR-gating workflow file is caught the same way rather than depending on
// anyone remembering to widen a list.
// ---------------------------------------------------------------------------------------------

test("ci arrangement — fixture-machine.yml is a §5.1 member (BR-7.1, CODE_REVIEW v1 §3-1)", async (t) => {
  assert.ok(
    existsSync(fixtureMachineWorkflowPath),
    ".github/workflows/fixture-machine.yml must exist (PLAN T50) — it is §5.1's sixth member"
  );
  const yamlText = readText(fixtureMachineWorkflowPath);
  const blocks = extractAllJobBlocks(yamlText);

  await t.test("it gates pull requests, which is what makes it a member (BR-7.5)", () => {
    assert.ok(
      isPullRequestTriggered(yamlText),
      "fixture-machine.yml must keep its `on: pull_request` trigger — §5.1's membership rule is " +
        "'renders as a check on a pull request', and dropping the trigger silently removes a gate"
    );
  });

  await t.test("job set and authored name: keys equal §5.1's rows for this file (BR-7.1)", () => {
    const ids = Object.keys(blocks);
    assertSetEqual(
      ids,
      FIXTURE_MACHINE_JOB_IDS,
      "fixture-machine.yml's job set must equal §5.1's rows for it — an added, renamed or " +
        "removed job lands in the FSPEC table before it lands in the workflow"
    );
    assertSetEqual(
      ids.map((id) => extractJobName(blocks[id])),
      FIXTURE_MACHINE_JOB_IDS.map((id) => EXPECTED_AUTHORED_BY_JOB[id]),
      "fixture-machine.yml's job-level `name:` keys must set-equal §5.1's authored column"
    );
  });

  await t.test("rendered name equals §5.1's rendered column, expanded per job (§8.5)", () => {
    for (const id of FIXTURE_MACHINE_JOB_IDS) {
      const result = expandJobName(blocks[id]);
      assert.ok(!result.unexpandable, `${id}: ${result.unexpandable}`);
      assert.deepEqual(
        result.rendered,
        [EXPECTED_RENDERED_BY_JOB[id]],
        `${id}'s rendered name must equal §5.1's row for it`
      );
    }
  });

  await t.test("a renamed job is caught over a fixture copy (BR-7.6)", () => {
    const mutated = yamlText.replace(
      "name: Fixture machine (install/upgrade, launcher, container, two-repo)",
      "name: Fixture machine (install/upgrade, launcher, container)"
    );
    const authored = Object.keys(extractAllJobBlocks(mutated)).map((id) =>
      extractJobName(extractAllJobBlocks(mutated)[id])
    );
    assert.notDeepEqual(
      [...authored].sort(),
      FIXTURE_MACHINE_JOB_IDS.map((id) => EXPECTED_AUTHORED_BY_JOB[id]).sort(),
      "a renamed fixture-machine job must fail the authored-alphabet equality — the hole " +
        "CODE_REVIEW v1 §3-1 named was precisely that this rename was invisible"
    );
  });
});

test("ci arrangement — §5.1's file scope equals the PR-triggered workflow files (BR-7.1)", () => {
  const actual = readdirSync(workflowsDir)
    .filter((f) => /\.ya?ml$/.test(f))
    .filter((f) => isPullRequestTriggered(readText(path.join(workflowsDir, f))));
  assertSetEqual(
    actual,
    Object.keys(PR_GATE_FILES),
    "every workflow file that triggers `on: pull_request` is a PR-gate file and its jobs are " +
      "§5.1 members; adding one without widening §5.1 (and this oracle's scope) is the omission " +
      "CODE_REVIEW v1 §3-1 found. `publish.yml` is excluded because it is tag-triggered and " +
      "gates no pull request (BR-7.5) — that reason is true of it, and false of fixture-machine.yml"
  );
});

test("ci arrangement — the rendered alphabet across all PR-gate files equals §5.1 (BR-7.1)", () => {
  const rendered = new Set();
  for (const [file, jobIds] of Object.entries(PR_GATE_FILES)) {
    const blocks = extractAllJobBlocks(readText(path.join(workflowsDir, file)));
    for (const id of jobIds) {
      const result = expandJobName(blocks[id]);
      assert.ok(!result.unexpandable, `${file}:${id}: ${result.unexpandable}`);
      result.rendered.forEach((r) => rendered.add(r));
    }
  }
  assertSetEqual(
    rendered,
    new Set(Object.values(EXPECTED_RENDERED_BY_JOB)),
    "the rendered alphabet, taken across every PR-gate file, must set-equal §5.1's rendered " +
      "column — six members, not five"
  );
});

// ---------------------------------------------------------------------------------------------
// CODE_REVIEW v2 §3-2: the repo's human-facing description of the same gate
//
// §5.1's doctrine is that a PR-gating check this feature adds must land in the expected set
// before it lands in the workflow. The oracles above enforce that for the spec and the YAML;
// `CLAUDE.md`'s "Continuous integration" section is the third citation of the same set, and it
// went unswept when row 6 was added — it still named four checks over one file. Derived, not
// transcribed: this reads §5.1's rendered column and §5.1's file scope, so the next widening
// fails here too rather than silently ageing the prose.
// ---------------------------------------------------------------------------------------------

const claudeMdPath = path.join(repoRoot, "CLAUDE.md");

/** The body of `### Continuous integration`, up to the next same-or-higher-level heading. */
function continuousIntegrationSection(text) {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => /^###\s+Continuous integration\s*$/.test(l));
  assert.notEqual(start, -1, "CLAUDE.md must carry a `### Continuous integration` section");
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^#{1,3}\s/.test(lines[i])) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join("\n");
}

const COUNT_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

test("ci arrangement — CLAUDE.md's CI section describes the whole §5.1 gate (CODE_REVIEW v2 §3-2)", async (t) => {
  const section = continuousIntegrationSection(readText(claudeMdPath));
  const expectedChecks = Object.values(EXPECTED_RENDERED_BY_JOB);

  await t.test("its check table set-equals §5.1's rendered column", () => {
    // First cell of each table row, un-backticked. The header and separator rows carry no
    // backticks and drop out.
    const rows = section
      .split("\n")
      .filter((l) => l.trim().startsWith("|"))
      .map((l) => l.split("|")[1]?.trim() ?? "")
      .filter((c) => c.startsWith("`") && c.endsWith("`"))
      .map((c) => c.slice(1, -1));
    assertSetEqual(
      rows,
      expectedChecks,
      "CLAUDE.md's CI table must name every §5.1 rendered check and no others — a check this " +
        "repo gates PRs on that the repo's own description omits is the omission CODE_REVIEW " +
        "v2 §3-2 found"
    );
  });

  await t.test("its count word equals the number of §5.1 rows", () => {
    const m = /\*\*([A-Za-z]+) checks?\*\* must pass/.exec(section);
    assert.ok(m, "the CI section must state how many checks must pass, in the form `**N checks** must pass`");
    assert.equal(
      m[1].toLowerCase(),
      COUNT_WORDS[expectedChecks.length],
      `the stated count must equal §5.1's row count (${expectedChecks.length})`
    );
  });

  await t.test("it names every PR-gate file, not just pr-tests.yml", () => {
    for (const file of Object.keys(PR_GATE_FILES)) {
      assert.ok(
        section.includes(file),
        `the CI section must name ${file}: it triggers on pull_request, so "the gate" spans it ` +
          `(BR-7.5). Describing pr-tests.yml alone as "the gate" is false once a second PR-gate ` +
          `file exists`
      );
    }
  });
});

// ---------------------------------------------------------------------------------------------
// Every PR-gate workflow file's own comments, plus publish.yml's, must transcribe §5.1
// truthfully (CODE_REVIEW v6 §3-1, widened by v8 §3-1/§3-2)
//
// The same class as CLAUDE.md's count word above, one file closer to the claim: a maintainer
// reading a workflow's header or publish.yml's gate job comment is told what the gate covers by
// the file the claim is about. Row 6's widening (fixture-machine.yml joined §5.1) made the
// transcribed "five" false wherever it appeared, invisibly — the set-equality oracle elsewhere
// in this file passes either way, because it reads jobs, not prose. v8 §3-1 found the claim
// false inside `fixture-machine.yml`'s own header — the file *is* row 6 of the set it
// mis-described — so the sweep below now covers every `PR_GATE_FILES` key plus `publish.yml`,
// not `publish.yml` alone.
//
// v8 §3-2: the previous version of this guard matched over comment lines joined with their `#`
// prefixes and newlines intact, so a count word at end-of-line never reached its noun across a
// `\n# ` wrap boundary and a re-wrapped (but still false) comment slipped through unnoticed. The
// comment text is now flattened — `#` markers stripped, all whitespace (including the
// line-wrap newline) collapsed to single spaces — before the claim regex runs, so a re-wrap
// cannot disarm the oracle.
// ---------------------------------------------------------------------------------------------

test("ci arrangement — PR-gate workflow headers and publish.yml transcribe §5.1's scope (CODE_REVIEW v6 §3-1, v8 §3-1/§3-2)", async (t) => {
  const publishText = readText(publishWorkflowPath);
  const expectedChecks = Object.values(EXPECTED_RENDERED_BY_JOB);
  const sweepPaths = {
    "pr-tests.yml": workflowPath,
    "fixture-machine.yml": fixtureMachineWorkflowPath,
    "publish.yml": publishWorkflowPath,
  };

  const flattenComments = (text) =>
    text
      .split("\n")
      .filter((l) => /^\s*#/.test(l))
      .map((l) => l.replace(/^\s*#\s?/, ""))
      .join(" ")
      .replace(/\s+/g, " ");

  for (const [label, filePath] of Object.entries(sweepPaths)) {
    await t.test(`${label}: every count word it applies to the gate equals §5.1's row count`, () => {
      // A count word directly qualifying the checks/jobs the gate spans. Prose that counts
      // something else (job bodies, tunables) does not match, and a comment that states no
      // count at all is the preferred fix — T49 derives the real number.
      const claim =
        /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten)\b[\s-]+(?:rendered\s+check\s+names?|PR-gate\s+jobs?'?s?|PR\s+checks?)/gi;
      const commentText = flattenComments(readText(filePath));
      for (const m of commentText.matchAll(claim)) {
        assert.equal(
          m[1].toLowerCase(),
          COUNT_WORDS[expectedChecks.length],
          `${label}'s comment claims "${m[0]}", but §5.1 has ${expectedChecks.length} rows — ` +
            `the gate spans every PR-gate file, not pr-tests.yml alone (BR-7.7, TSPEC §8.5). ` +
            `Correct the comment or drop the count, which T49 derives`
        );
      }
    });
  }

  await t.test("publish.yml's gate job's comment names every PR-gate file the job re-runs", () => {
    const gateIdx = publishText.indexOf("\n  gate:");
    assert.notEqual(gateIdx, -1, "publish.yml must declare a `gate` job");
    // The contiguous `  #` comment block immediately above the job key, read bottom-up.
    const preamble = publishText.slice(0, gateIdx).split("\n");
    const block = [];
    for (let i = preamble.length - 1; i >= 0 && /^ {2}#/.test(preamble[i]); i--) {
      block.unshift(preamble[i]);
    }
    const gateComment = block.join("\n");
    assert.ok(gateComment, "publish.yml's gate job must carry a comment describing what it re-runs");
    for (const file of Object.keys(PR_GATE_FILES)) {
      assert.ok(
        gateComment.includes(file),
        `publish.yml's gate-job comment must name ${file}: the job re-runs the union over every ` +
          `PR-gate file (T49's set-equality), so a comment naming only some of them tells the ` +
          `next editor the wrong invariant (CODE_REVIEW v6 §3-1)`
      );
    }
  });
});

// ---------------------------------------------------------------------------------------------
// TSPEC §8.2/§8.5: publish.yml's gate job must set-equal EVERY PR-gate job's commands
//
// C-6 ("publishing is gated on the same evidence a PR is") is false if the tag gate re-runs only
// `pr-tests.yml`: the fixture-machine legs carry AT-2.3…AT-2.6 (AC-2.2…AC-2.5), so a release cut
// without them is gated on strictly weaker evidence than the PR was (CODE_REVIEW v1 §3-2).
// ---------------------------------------------------------------------------------------------

test("T49: ci arrangement — publish.yml/PR-gate gate-command set-equality (§8.2, §8.5)", () => {
  assert.ok(
    existsSync(publishWorkflowPath),
    ".github/workflows/publish.yml must exist and carry its own copy of every PR-gate job's " +
      "body (TSPEC §8.2) — not yet created"
  );

  const publishText = readText(publishWorkflowPath);
  const publishBlocks = extractAllJobBlocks(publishText);
  const gateBlock = publishBlocks["gate"];
  assert.ok(gateBlock, "publish.yml must declare a `gate` job");
  assert.doesNotMatch(
    gateBlock,
    /^ {4}uses:\s*\S/m,
    "publish.yml's gate job must duplicate the PR-gate jobs' bodies, never `uses:` a " +
      "reusable workflow (§8.2 — the reusable-workflow extraction was rejected because it " +
      "silently renames rendered check names Phase PUB polls literally)"
  );

  const expectedCommands = new Set();
  for (const [file, jobIds] of Object.entries(PR_GATE_FILES)) {
    const blocks = extractAllJobBlocks(readText(path.join(workflowsDir, file)));
    for (const id of jobIds) {
      for (const cmd of extractRunCommands(blocks[id])) expectedCommands.add(cmd);
    }
  }
  const actualCommands = new Set(extractRunCommands(gateBlock));

  assertSetEqual(
    actualCommands,
    expectedCommands,
    "publish.yml's gate job must run the same commands as EVERY PR-gate job — pr-tests.yml's " +
      "three and fixture-machine.yml's — as a set-equality over the run commands (§8.5). This is " +
      "what makes C-6 true: a tag gated on fewer commands than the PR was is a release gated on " +
      "weaker evidence (CODE_REVIEW v1 §3-2)"
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

  // CODE_REVIEW v1 §1-4 (pdlc-advisory-wave-gate): the shipped default must not
  // exclude `documentOracles`. That file carries `PROP-SWEEP-2(b)`, the retirement
  // sweep's required-empty gate, and `AT-22`'s repo-wide covered-violations check.
  // While it was excluded, a red sweep landed with the wave gate green — §1-5.
  // Only the three structural patterns may be ignored; anything naming a test
  // FILE is a coverage exemption on a served flow and must red here.
  const ignoreArgs = testCommand.match(/--testPathIgnorePatterns(?:=(\S+)|\s+(.+))$/);
  assert.ok(ignoreArgs, "testCommand must end in --testPathIgnorePatterns arguments");
  const patterns = (ignoreArgs[1] !== undefined ? ignoreArgs[1] : ignoreArgs[2])
    .trim()
    .split(/\s+/)
    .map((tok) => tok.replace(/^['"]|['"]$/g, ""))
    .sort();
  assert.deepEqual(
    patterns,
    ["/__tests__/fixtures/", "/__tests__/helpers/", "/node_modules/"],
    "the shipped gate command may ignore only node_modules and the two non-test support " +
      "directories — excluding a test file (e.g. `documentOracles`) hides a served flow " +
      "from the wave gate (CODE_REVIEW v1 §1-4)"
  );
});

// ---------------------------------------------------------------------------------------------
// T03: post-sweep CI arrangement (FSPEC §4.3 L-7's post-sweep four, BR-DOC-1, L-8). Skipped
// under T03 — red until class 1 lands (deletes `artifact-freshness` and `fresh-clone-bootstrap`
// and `script-syntax`'s index-mode steps from pr-tests.yml; corrects publish.yml's and
// fixture-machine.yml's count words; rewrites CLAUDE.md's `### Continuous integration` and
// pdlc/OPERATIONS.md's `## Continuous integration` to the post-sweep four). This block owns its
// own constants below — it never touches this file's pre-sweep top-level GATE_JOB_IDS /
// EXPECTED_AUTHORED_BY_JOB / EXPECTED_RENDERED_BY_JOB, which describe the CURRENT (six-check)
// arrangement and remain correct until T03 lands (PLAN §1.3 skip-naming convention).
// ---------------------------------------------------------------------------------------------

const POST_SWEEP_GATE_JOB_IDS = ["unit-tests", "engine-tests", "script-syntax"];
const POST_SWEEP_FIXTURE_MACHINE_JOB_IDS = ["fixture-machine"];
const POST_SWEEP_PR_GATE_FILES = {
  "pr-tests.yml": POST_SWEEP_GATE_JOB_IDS,
  "fixture-machine.yml": POST_SWEEP_FIXTURE_MACHINE_JOB_IDS,
};
const POST_SWEEP_EXPECTED_RENDERED_BY_JOB = {
  "unit-tests": "Unit tests (ubuntu-latest, node 24)",
  "engine-tests": "Engine tests (ubuntu-latest)",
  "script-syntax": "Shell scripts parse",
  "fixture-machine": "Fixture machine (install/upgrade, launcher, container, two-repo)",
};

test("T03: rendered names across the two PR-triggered workflow files set-equal FSPEC L-7's post-sweep four rows", () => {
  const rendered = new Set();
  for (const [file, jobIds] of Object.entries(POST_SWEEP_PR_GATE_FILES)) {
    const blocks = extractAllJobBlocks(readText(path.join(workflowsDir, file)));
    const ids = Object.keys(blocks);
    assertSetEqual(
      ids,
      jobIds,
      `${file}'s job set must equal the post-sweep set once class 1 lands (FSPEC L-7)`
    );
    for (const id of jobIds) {
      const result = expandJobName(blocks[id]);
      assert.ok(!result.unexpandable, `${file}:${id}: ${result.unexpandable}`);
      result.rendered.forEach((r) => rendered.add(r));
    }
  }
  assertSetEqual(
    rendered,
    new Set(Object.values(POST_SWEEP_EXPECTED_RENDERED_BY_JOB)),
    "the rendered alphabet across both PR-gate files must set-equal FSPEC L-7's post-sweep four rows"
  );
});

test("T03: CLAUDE.md's and pdlc/OPERATIONS.md's CI sections' count words equal the post-sweep set size (BR-DOC-1)", () => {
  const claudeSection = continuousIntegrationSection(readText(claudeMdPath));
  const claudeMatch = /\*\*([A-Za-z]+) checks?\*\* must pass/.exec(claudeSection);
  assert.ok(claudeMatch, "CLAUDE.md's CI section must state how many checks must pass");
  assert.equal(
    claudeMatch[1].toLowerCase(),
    "four",
    "CLAUDE.md's CI section's count word must equal FSPEC L-7's post-sweep set size (four, BR-DOC-1)"
  );

  const operationsPath = path.join(repoRoot, "pdlc", "OPERATIONS.md");
  const operationsLines = readText(operationsPath).split("\n");
  const operationsStart = operationsLines.findIndex((l) =>
    /^##\s+Continuous integration\s*$/.test(l)
  );
  assert.notEqual(
    operationsStart,
    -1,
    "pdlc/OPERATIONS.md must carry a `## Continuous integration` section"
  );
  let operationsEnd = operationsLines.length;
  for (let i = operationsStart + 1; i < operationsLines.length; i++) {
    if (/^#{1,2}\s/.test(operationsLines[i])) {
      operationsEnd = i;
      break;
    }
  }
  const operationsSection = operationsLines.slice(operationsStart, operationsEnd).join("\n");
  const operationsCountMatch = /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten)\s+checks?\b/i.exec(
    operationsSection
  );
  assert.ok(
    operationsCountMatch,
    "pdlc/OPERATIONS.md's CI section must state how many checks must pass"
  );
  assert.equal(
    operationsCountMatch[1].toLowerCase(),
    "four",
    "pdlc/OPERATIONS.md's CI section's count word must equal FSPEC L-7's post-sweep set size (four, BR-DOC-1)"
  );
});

test("T03: publish.yml's gate job invokes none of the removed checks' commands (L-8)", () => {
  const publishText = readText(publishWorkflowPath);
  const gateBlock = extractAllJobBlocks(publishText)["gate"];
  assert.ok(gateBlock, "publish.yml must declare a `gate` job");
  const commands = extractRunCommands(gateBlock).join("\n");
  assert.doesNotMatch(
    commands,
    /build-runtime\.mjs/,
    "publish.yml's gate job must not build-and-check or rebuild-diff the retired bundles (L-8, M-11b)"
  );
  assert.doesNotMatch(
    commands,
    new RegExp("sync-workflo" + "ws\\.sh"),
    "publish.yml's gate job must not run the two-command bootstrap or the retired plugin-channel sync script's --check (L-8, M-11b)"
  );
  assert.doesNotMatch(
    commands,
    new RegExp("check_mode\\s+100755\\s+pdlc\\/hooks\\/scripts\\/sync-workflo" + "ws\\.sh"),
    "publish.yml's gate job must not assert an executable bit on a deleted script (L-8, M-11b)"
  );
});
