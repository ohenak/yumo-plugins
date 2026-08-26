// Purpose-named carrier for FSPEC F-09 / BR-01 / P8-01's example-config expectation
// (feature `pdlc-engineering-loop`).
//
// Its own file, for the same reason `advisory-config-example.test.js` and
// `learnings-config-example.test.js` are their own files: a config-schema assertion hung off
// `ci-arrangement.test.js` would let an unrelated config-example edit redden the
// delivery-blocking `Engine tests (ubuntu-latest)` check under a file whose stated scope names
// no such concern.
//
// What this asserts:
//   1. `.claude/pdlc.config.example.json` parses, and its top-level section set CONTAINS
//      `dispatch`, `advisory`, `implementation`, `learningsInjection` (already shipped — the
//      file is shared, so this is containment, not set-equality) plus the two sections this
//      feature adds: `loop` and `merge`.
//   2. `loop`'s own key->value map is asserted by SET-EQUALITY against a literal transcription
//      of FSPEC BR-01's four declared keys and defaults — no more, no fewer.
//   3. `merge`'s values transcribe `MERGE_DEFAULTS` from `pdlc/workflows/orchestrate-dev.js`
//      (`mergeMode: "off"`), and `guardPaths` is asserted EMPTY explicitly: `effectiveGuardPaths`
//      unions configured paths onto its built-in set and never subtracts, so a non-empty example
//      value would silently widen every copying consumer's guarded set (BR-29 / P8-02).
//
// At HEAD the example carries neither a `loop` nor a `merge` section. P8-01 (this file) is
// `[red]` in a wave gated apart from its `[green]` implementation task P8-02 (PLAN wave 5), so
// every block here is committed `test.skip`, titled "P8-02: ...", per the wave-gate contract:
// each block was run un-skipped first and observed to fail for the right reason (missing `loop`
// / `merge` sections), then skipped so the wave gate stays green until P8-02 un-skips them.
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(engineRoot));
const configPath = path.join(repoRoot, ".claude", "pdlc.config.example.json");

// FSPEC BR-01, transcribed literally (REQ AC-3.2).
const LOOP_DEFAULTS = {
  backoffSchedule: [5, 15, 30, 60],
  idleStopAfter: 4,
  preflight: "strict",
  dirtyTreePolicy: "tracked",
};

// `MERGE_DEFAULTS` (pdlc/workflows/orchestrate-dev.js), transcribed literally — not imported,
// so the example is checked against the documented shape rather than agreeing with the code by
// construction.
const MERGE_EXAMPLE_DEFAULTS = {
  mergeMode: "off",
  mergeRequiresCi: true,
  allowSquashMerge: false,
  deleteBranchOnPdlcMerge: true,
  mergeableRetries: 3,
  mergeableRetryDelay: 10,
  guardPaths: [],
};

function readConfig() {
  return JSON.parse(readFileSync(configPath, "utf8"));
}

test("P8-02: loop config example — top-level section set contains the existing sections plus loop and merge", () => {
  const config = readConfig();
  const sections = Object.keys(config);

  for (const existing of ["dispatch", "advisory", "implementation", "learningsInjection"]) {
    assert.ok(
      sections.includes(existing),
      `pdlc.config.example.json must still carry the pre-existing \`${existing}\` section ` +
        "(this file is shared across features — containment, not set-equality)"
    );
  }

  assert.ok(
    sections.includes("loop"),
    "pdlc.config.example.json must carry a `loop` section (FSPEC BR-01 / F-09): the example " +
      "file is where an operator discovers the loop's configurable thresholds"
  );
  assert.ok(
    sections.includes("merge"),
    "pdlc.config.example.json must carry a `merge` section (BR-29): adding `loop` and the " +
      "missing `merge` section ships in the same change"
  );
});

test("P8-02: loop config example — loop section's key set is exactly BR-01's four declared keys", () => {
  const config = readConfig();
  const loop = config?.loop;

  assert.equal(typeof loop, "object", "loop section must be present and an object");
  assert.notEqual(loop, null, "loop section must not be null");

  assert.deepEqual(
    Object.keys(loop).sort(),
    Object.keys(LOOP_DEFAULTS).sort(),
    "the example must disclose exactly BR-01's four declared keys — no more, no fewer"
  );
});

test("P8-02: loop config example — every loop value equals BR-01's literal declared default", () => {
  const config = readConfig();
  const loop = config?.loop ?? {};

  assert.deepEqual(
    loop.backoffSchedule,
    LOOP_DEFAULTS.backoffSchedule,
    "loop.backoffSchedule must equal BR-01's declared default [5, 15, 30, 60]"
  );
  assert.equal(
    loop.idleStopAfter,
    LOOP_DEFAULTS.idleStopAfter,
    "loop.idleStopAfter must equal BR-01's declared default 4"
  );
  assert.equal(
    loop.preflight,
    LOOP_DEFAULTS.preflight,
    'loop.preflight must equal BR-01\'s declared default "strict"'
  );
  assert.equal(
    loop.dirtyTreePolicy,
    LOOP_DEFAULTS.dirtyTreePolicy,
    'loop.dirtyTreePolicy must equal BR-01\'s declared default "tracked"'
  );
});

test("P8-02: loop config example — merge section's key set is exactly MERGE_DEFAULTS' seven keys", () => {
  const config = readConfig();
  const merge = config?.merge;

  assert.equal(typeof merge, "object", "merge section must be present and an object");
  assert.notEqual(merge, null, "merge section must not be null");

  assert.deepEqual(
    Object.keys(merge).sort(),
    Object.keys(MERGE_EXAMPLE_DEFAULTS).sort(),
    "the example must disclose exactly MERGE_DEFAULTS' seven keys — no more, no fewer"
  );
});

test("P8-02: loop config example — every merge value transcribes MERGE_DEFAULTS, and guardPaths ships empty", () => {
  const config = readConfig();
  const merge = config?.merge ?? {};

  assert.equal(
    merge.mergeMode,
    MERGE_EXAMPLE_DEFAULTS.mergeMode,
    'merge.mergeMode must equal MERGE_DEFAULTS.mergeMode "off"'
  );
  assert.equal(merge.mergeRequiresCi, MERGE_EXAMPLE_DEFAULTS.mergeRequiresCi);
  assert.equal(merge.allowSquashMerge, MERGE_EXAMPLE_DEFAULTS.allowSquashMerge);
  assert.equal(merge.deleteBranchOnPdlcMerge, MERGE_EXAMPLE_DEFAULTS.deleteBranchOnPdlcMerge);
  assert.equal(merge.mergeableRetries, MERGE_EXAMPLE_DEFAULTS.mergeableRetries);
  assert.equal(merge.mergeableRetryDelay, MERGE_EXAMPLE_DEFAULTS.mergeableRetryDelay);

  assert.deepEqual(
    merge.guardPaths,
    [],
    "merge.guardPaths must ship EMPTY in the example: effectiveGuardPaths unions configured " +
      "paths onto its built-in set and never subtracts, so a non-empty example value would " +
      "silently widen every copying consumer's guarded set"
  );
});
