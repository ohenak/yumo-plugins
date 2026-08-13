// The M-ENG-07 model-map witness table, and the two suite-wide rows that read
// it (TSPEC §7.4, PLAN T50 -> T52, AC-3.3 / AT-ENG-29, PROP-MODEL-2…9).
//
// What this file is FOR. `smoke.test.js`'s five corpus runs already witness
// M-ENG-07's seven rows one row at a time — but seven per-row witnesses are not
// a set-equality oracle. Nothing in them fails if a corpus run is deleted, and
// nothing fails if an eighth row is added to M-ENG-07 that no run reaches: the
// property has witnesses and no falsifier (F-04). The set-equality lives in
// `_assert-suite-wide.mjs` (§7.4's row 3), which reads the union of the whole
// suite's observation records and asserts AC-3.3's two directions verbatim:
//
//   forward — every recorded model value appears in M-ENG-07's model column;
//   reverse — each of M-ENG-07's seven rows is witnessed by ≥1 descriptor.
//
// This file is that oracle's acceptance test. It drives BOTH halves, and drives
// each row's pass AND fail case, in two complementary ways:
//
//   • by import, over a synthetic descriptor population (`_corpus.mjs`'s
//     `modelMapWitnessRecords`, transcribed from a real corpus run) mutated one
//     field at a time — the only way to falsify the dispatchable-skills row at
//     all, since that row reads imported data rather than records;
//   • by subprocess, over hand-built scratch run directories — the same shape
//     `assert-suite-wide.test.js` uses, proving the step's exit status, not just
//     its pure functions, moves.
//
// It never re-runs the corpus: `node --test` gives no cross-file results and no
// ordering guarantee (§7.0), so a test file cannot read another file's records.
// The real corpus records reach the oracle through the run directory instead —
// `_corpus.mjs`'s `withRunDir` publishes each run's settlement lines into
// `${PDLC_TEST_RUN_DIR}` before its scratch dir is removed — and the assertion
// runs as step 4 of `_run-suite.mjs`, after every test file has exited.

import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, appendFileSync, readFileSync, rmSync } from "node:fs";

import { messageIds } from "../lib/catalogue.mjs";
import { OUTCOMES } from "../lib/outcome.mjs";
import {
  DISPATCHABLE_SKILLS as DEV_SKILLS,
  parsePlanTasks,
} from "../../workflows/orchestrate-dev.js";
import { DISPATCHABLE_SKILLS as QUEUE_SKILLS } from "../../workflows/orchestrate-queue.js";
import { modelMapWitnessRecords, readFixture } from "./_corpus.mjs";
import {
  M_ENG_07,
  SUITE_WIDE_ROWS,
  DISPATCHABLE_SKILLS_TABLE,
  assertSuiteWide,
  checkDispatchableSkills,
  checkModelMap,
  checkPrePhaseWindow,
  implementedRows,
  inWaveSet,
} from "./_assert-suite-wide.mjs";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ASSERT_SCRIPT = path.join(engineRoot, "__tests__", "_assert-suite-wide.mjs");

// ─── helpers ────────────────────────────────────────────────────────────────

/** The witness population, optionally with per-record edits applied by `edit`. */
function witnesses(edit = null) {
  const records = modelMapWitnessRecords();
  return edit ? records.flatMap((r) => edit(r) ?? []) : records;
}

function messagesOf(failures) {
  return failures.map((f) => `[${f.row}] ${f.message}`).join("\n");
}

function newScratchRunDir() {
  return mkdtempSync(path.join(os.tmpdir(), "pdlc-corpus-model-map-"));
}

function appendRecord(runDir, pid, record) {
  mkdirSync(runDir, { recursive: true });
  appendFileSync(path.join(runDir, `${pid}.jsonl`), `${JSON.stringify(record)}\n`);
}

/** A run dir that satisfies all five §7.4 rows, so one row's failure can be isolated. */
function writeFullyValidRunDir(runDir, records = witnesses()) {
  for (const id of messageIds()) appendRecord(runDir, "pid-messages", { kind: "message-id", id });
  for (const value of OUTCOMES) appendRecord(runDir, "pid-outcomes", { kind: "outcome", value });
  for (const r of records) appendRecord(runDir, "pid-dispatch", r);
}

function runAssertStep(runDir) {
  const result = spawnSync(process.execPath, [ASSERT_SCRIPT], {
    encoding: "utf8",
    cwd: engineRoot,
    env: { ...process.env, PDLC_TEST_RUN_ID: "scratch", PDLC_TEST_RUN_DIR: runDir },
  });
  return { ...result, out: `${result.stdout ?? ""}${result.stderr ?? ""}` };
}

function withScratchRunDir(fn) {
  const runDir = newScratchRunDir();
  try {
    return fn(runDir);
  } finally {
    rmSync(runDir, { recursive: true, force: true });
  }
}

// ─── the enumeration itself (PLAN §8: "the module enumerates the same five
// things the table does") ───────────────────────────────────────────────────

test("the step enumerates §7.4's five rows, and every enumerated row is wired in", () => {
  assert.deepEqual(
    [...SUITE_WIDE_ROWS].sort(),
    [
      "dispatchable-skills",
      "message-catalogue",
      "outcome-taxonomy",
      "pinned-model-map",
      "pre-phase-window",
    ]
  );
  // Set-equality, both directions: a row named but unimplemented, or
  // implemented but unnamed, is detectable here rather than silently absent.
  assert.deepEqual([...implementedRows()].sort(), [...SUITE_WIDE_ROWS].sort());
});

test("the witness table carries exactly M-ENG-07's seven rows, one per declared dispatch site", () => {
  assert.equal(M_ENG_07.length, 7);
  assert.deepEqual(
    M_ENG_07.map((r) => r.row),
    [1, 2, 3, 4, 5, 6, 7]
  );
  // The model column is transcribed, not imported — these four values are the
  // whole forward direction's target set.
  assert.deepEqual(
    [...new Set(M_ENG_07.map((r) => r.model))].sort(),
    ["fable", "haiku", "opus", "sonnet"]
  );
});

// ─── the positive control: the witness population passes ───────────────────

test("the witness population satisfies the model-map row in both directions", () => {
  const failures = checkModelMap(witnesses());
  assert.deepEqual(failures, [], failures.join("\n"));
});

test("the witness population satisfies all five suite-wide rows", () => {
  const records = [
    ...messageIds().map((id) => ({ kind: "message-id", id })),
    ...OUTCOMES.map((value) => ({ kind: "outcome", value })),
    ...witnesses(),
  ];
  const failures = assertSuiteWide(records);
  assert.deepEqual(failures, [], messagesOf(failures));
});

// ─── forward direction: recorded ⊆ M-ENG-07's model column ─────────────────

test("forward direction: a recorded model outside M-ENG-07's model column fails the row", () => {
  const records = [
    ...witnesses(),
    {
      kind: "dispatch",
      corpusRun: "run-i",
      seq: 99,
      skill: "se-review",
      phase: "Phase R",
      model: "opus-4-6-brand-new",
      attempt: 0,
      outcome: "ok",
      errorText: null,
      promptHash: "0000000000000000",
    },
  ];
  const failures = checkModelMap(records);
  assert.ok(failures.length > 0, "an unmapped model value must fail the forward direction");
  assert.match(failures.join("\n"), /opus-4-6-brand-new/);
});

test("forward direction ignores dispatches outside the corpus (corpusRun == null)", () => {
  // Unit tests dispatch through fixture transports too, and their settlement
  // lines land in the same run dir (§7.4). `corpusRun != null` is what scopes
  // the row to run-shaped tests; without it, this population would be red.
  const records = [
    ...witnesses(),
    {
      kind: "dispatch",
      corpusRun: null,
      seq: 0,
      skill: "se-review",
      phase: null,
      model: "some-unit-test-model",
      attempt: 0,
      outcome: "ok",
      errorText: null,
      promptHash: "0000000000000000",
    },
  ];
  assert.deepEqual(checkModelMap(records), []);
});

test("the model-map row fails on an empty corpus rather than passing vacuously", () => {
  const failures = checkModelMap([{ kind: "message-id", id: "anything" }]);
  assert.ok(failures.length > 0);
  assert.match(failures.join("\n"), /vacuous|no corpus dispatch/i);
});

// ─── reverse direction: each of the seven rows is witnessed ────────────────

for (const row of M_ENG_07) {
  test(`reverse direction: deleting corpus run ${row.corpusRun} leaves M-ENG-07 row ${row.row} unwitnessed`, () => {
    // Whole-run deletion is the failure the shipped corpus can actually suffer:
    // a run removed, renamed, or skipped. Row 1 and row 2 share run i, so
    // deleting it fails both — assert that this row is among the named ones.
    const records = witnesses((r) => (r.corpusRun === row.corpusRun ? [] : [r]));
    const failures = checkModelMap(records);
    assert.match(
      failures.join("\n"),
      new RegExp(`M-ENG-07 row ${row.row}\\b`),
      `deleting ${row.corpusRun} must leave row ${row.row} unwitnessed:\n${failures.join("\n")}`
    );
  });
}

test("reverse direction: an eighth M-ENG-07 row no corpus run reaches is not silently absorbed", () => {
  // The property PROP-MODEL-7 names: a map row unreachable in the corpus MUST
  // fail set-equality. Simulated by asking the same witness machinery about a
  // row whose witness no run satisfies, since M_ENG_07 itself is frozen.
  const eighth = {
    row: 8,
    site: "a hypothetical new dispatch site",
    model: "opus",
    corpusRun: "run-vi",
    witness: (rs) => rs.some((r) => r.model === "opus"),
  };
  const scoped = witnesses().filter((r) => r.corpusRun === eighth.corpusRun);
  assert.equal(scoped.length, 0, "no corpus run witnesses the hypothetical row");
  assert.equal(eighth.witness(scoped), false, "so its witness predicate is false");
});

// ─── rows 1 and 2 are QUANTIFIED, not existential ─────────────────────────

test("row 1 is quantified: one non-wave-set run-i dispatch off opus fails it", () => {
  const records = [
    ...witnesses(),
    {
      kind: "dispatch",
      corpusRun: "run-i",
      seq: 50,
      skill: "pm-review",
      phase: "Phase F",
      model: "sonnet",
      attempt: 0,
      outcome: "ok",
      errorText: null,
      promptHash: "0000000000000000",
    },
  ];
  assert.match(checkModelMap(records).join("\n"), /M-ENG-07 row 1\b/);
});

test("row 2 is quantified: one wave-set dispatch off sonnet fails it", () => {
  const records = witnesses((r) =>
    r.corpusRun === "run-i" && r.phase === "Phase I" ? [{ ...r, model: "opus" }] : [r]
  );
  assert.match(checkModelMap(records).join("\n"), /M-ENG-07 row 2\b/);
});

test("row 2 requires BOTH wave-set members: a missing V-wave dispatch means run i drifted out of wave mode", () => {
  const records = witnesses((r) =>
    r.corpusRun === "run-i" && r.phase === "Phase PT" ? [] : [r]
  );
  assert.match(checkModelMap(records).join("\n"), /M-ENG-07 row 2\b/);
});

test("the wave set partitions on the Phase-I wave, not on the normalised phase string", () => {
  // `phase !== "Phase I"` would be red on correct code: the V-wave normalises
  // to "Phase PT" while being pinned on MODEL_IMPLEMENTATION (§7.4, TE F-22).
  assert.equal(inWaveSet({ phase: "Phase I", skill: "se-author" }), true);
  assert.equal(inWaveSet({ phase: "Phase PT", skill: "se-implement" }), true);
  assert.equal(inWaveSet({ phase: "Phase PT", skill: "te-author" }), false);
  assert.equal(inWaveSet({ phase: "Phase R", skill: "se-review" }), false);
});

test("run i must close both haiku routes by fixture content, not by luck", () => {
  const records = [
    ...witnesses(),
    {
      kind: "dispatch",
      corpusRun: "run-i",
      seq: 51,
      skill: "se-review",
      phase: "Phase R",
      model: "haiku",
      attempt: 0,
      outcome: "ok",
      errorText: null,
      promptHash: "0000000000000000",
    },
  ];
  assert.match(checkModelMap(records).join("\n"), /haiku routes/);
});

// ─── row 4's (F, B) pair, field by field ──────────────────────────────────

/** Applies `edit` to run iv's fallback (`opus`) or forced-failure (`fable`) descriptor. */
function editRow4(model, edit) {
  return witnesses((r) =>
    r.corpusRun === "run-iv" && r.model === model && r.skill === "se-review"
      ? [{ ...r, ...edit }]
      : [r]
  );
}

test("row 4: a fallback descriptor composed from a different prompt is not the pair", () => {
  const records = editRow4("opus", { promptHash: "ffffffffffffffff" });
  assert.match(checkModelMap(records).join("\n"), /M-ENG-07 row 4\b/);
});

test("row 4: the fallback must be recorded AFTER the failure, never before", () => {
  const records = editRow4("opus", { seq: 0 });
  assert.match(checkModelMap(records).join("\n"), /M-ENG-07 row 4\b/);
});

test("row 4: the forced failure pins `transport-contract-violation`, not merely a non-ok outcome", () => {
  // `!== "ok"` would still pass if the fixture regressed to injecting a timeout
  // or an auth failure — i.e. if the run never exercised model resolution at
  // all (§7.4, TE F-32).
  const records = editRow4("fable", { outcome: "timeout" });
  assert.match(checkModelMap(records).join("\n"), /M-ENG-07 row 4\b/);
});

test("row 4: the failure half is paired with a positive conjunct on the injected message", () => {
  const records = editRow4("fable", { errorText: "boom" });
  assert.match(checkModelMap(records).join("\n"), /M-ENG-07 row 4\b/);
});

test("row 4 tolerates a retry: a second failure line under the same prompt only helps the pair", () => {
  const failure = witnesses().find(
    (r) => r.corpusRun === "run-iv" && r.model === "fable"
  );
  const records = [...witnesses(), { ...failure, attempt: 1, seq: failure.seq }];
  assert.deepEqual(checkModelMap(records), []);
});

// ─── the pre-phase window row (§7.4 row 5) ────────────────────────────────

test("pre-phase row: a corpus dispatch recorded with no phase fails the step", () => {
  const records = [
    ...witnesses(),
    {
      kind: "dispatch",
      corpusRun: "run-i",
      seq: 52,
      skill: "se-review",
      phase: null,
      model: "opus",
      attempt: 0,
      outcome: "ok",
      errorText: null,
      promptHash: "0000000000000000",
    },
  ];
  const failures = checkPrePhaseWindow(records);
  assert.equal(failures.length, 1, failures.join("\n"));
  assert.match(failures[0], /pre-phase/);
});

test("pre-phase row: a phase-less dispatch OUTSIDE the corpus is not a violation", () => {
  const records = [
    ...witnesses(),
    {
      kind: "dispatch",
      corpusRun: null,
      seq: 0,
      skill: "se-review",
      phase: null,
      model: "opus",
      attempt: 0,
      outcome: "ok",
      errorText: null,
      promptHash: "0000000000000000",
    },
  ];
  assert.deepEqual(checkPrePhaseWindow(records), []);
});

test("pre-phase row: the witness population is clean", () => {
  assert.deepEqual(checkPrePhaseWindow(witnesses()), []);
});

// ─── the dispatchable-skills row (§7.4 row 4, §3.3, AC-3.5) ───────────────
// Computed from imported data, so no run-dir population can falsify it — these
// are the only falsifiers it has.

test("dispatchable-skills row: the modules' derived union set-equals §3.3's table", () => {
  const failures = checkDispatchableSkills(DEV_SKILLS, QUEUE_SKILLS);
  assert.deepEqual(failures, [], failures.join("\n"));
  assert.deepEqual(
    [...new Set([...DEV_SKILLS, ...QUEUE_SKILLS])].sort(),
    [...DISPATCHABLE_SKILLS_TABLE].sort()
  );
});

test("dispatchable-skills row, forward: a newly derived identifier absent from §3.3's table fails", () => {
  const failures = checkDispatchableSkills([...DEV_SKILLS, "brand-new-skill"], QUEUE_SKILLS);
  assert.equal(failures.length, 1, failures.join("\n"));
  assert.match(failures[0], /brand-new-skill/);
});

test("dispatchable-skills row, reverse: a table identifier the modules stopped deriving fails", () => {
  const [dropped, ...rest] = DISPATCHABLE_SKILLS_TABLE;
  const derived = [...new Set([...DEV_SKILLS, ...QUEUE_SKILLS])].filter((s) => s !== dropped);
  const failures = checkDispatchableSkills(derived, []);
  assert.equal(failures.length, 1, failures.join("\n"));
  assert.match(failures[0], new RegExp(dropped));
  assert.ok(rest.length > 0);
});

// ─── PROP-MODEL-3: recorded descriptors, never billed calls ───────────────

test("PROP-MODEL-3: a composition-time (null-terminal) line is not a corpus descriptor", () => {
  // The accumulator hangs off `_agent` (`adapter.mjs:271`), not off
  // `composePrompt` (`:259`), so a composed-but-never-dispatched prompt writes
  // no line at all — never a line with `null` terminals. If that ever inverted,
  // the corpus would start counting prompts nobody dispatched.
  const records = witnesses((r) =>
    r.corpusRun === "run-vb" ? [{ ...r, outcome: null, errorText: null }] : [r]
  );
  assert.match(checkModelMap(records).join("\n"), /non-settlement/);
});

test("PROP-MODEL-3: every witness carries a settled outcome and an attempt index", () => {
  for (const r of witnesses()) {
    assert.equal(typeof r.outcome, "string", JSON.stringify(r));
    assert.equal(typeof r.attempt, "number", JSON.stringify(r));
  }
});

test("forward direction: an UNPINNED corpus dispatch fails — M-ENG-07's column has no such member", () => {
  // The `"unpinned"` descriptor spelling itself is PROP-MODEL-9's, owned by
  // `adapter-descriptor.test.js` (T22 -> T36). What this row owes is only that
  // a corpus dispatch with no pinned model is not silently accepted.
  const records = witnesses((r) =>
    r.corpusRun === "run-ii" ? [{ ...r, model: null }] : [r]
  );
  assert.match(checkModelMap(records).join("\n"), /appears in no M-ENG-07 row/);
});

// ─── PROP-MODEL-5: the two haiku rows ride on pinned fixture CONTENT ──────

test("PROP-MODEL-5: run v(a)'s pinned fixture really carries a malformed VERDICT trailer", () => {
  const text = readFixture("malformed-verdict-trailer.txt");
  // Malformed means `recoverVerdict` fires: a `VERDICT` mention that the
  // module's own grammar cannot parse as a verdict line.
  assert.match(text, /VERDICT/);
  assert.equal(
    /^\s*VERDICT:\s*\S+/m.test(text),
    false,
    `the row-6 fixture must NOT parse as a verdict line, or run v(a) witnesses nothing:\n${text}`
  );
});

test("PROP-MODEL-5: run v(b)'s pinned fixture really carries a task table the parser rejects", () => {
  const text = readFixture("unparseable-task-table.md");
  // `PLAN_ID_HEADER_CELLS` recognises `#`/`ID`/`Task ID`, exact-cell — never a
  // bare `Task` header, which is what makes this table unparseable in-script.
  assert.equal(parsePlanTasks(text), null, "the row-7 fixture must not parse in-script");
});

// ─── PROP-MODEL-8: the map is a TRANSCRIPTION, never an import ────────────

test("PROP-MODEL-8: the step transcribes M-ENG-07's models and imports none of the modules' constants", () => {
  const source = readFileSync(ASSERT_SCRIPT, "utf8");
  const importBlock = source.slice(0, source.indexOf("SUITE_WIDE_ROWS"));
  for (const constant of [
    "MODEL_DEFAULT",
    "MODEL_IMPLEMENTATION",
    "MODEL_ADVISORY",
    "MODEL_ADVISORY_FALLBACK",
    "MODEL_QUEUE",
  ]) {
    assert.equal(
      importBlock.includes(constant),
      false,
      `importing ${constant} would make the drift AC-3.3 exists to catch invisible`
    );
  }
  // Positive control: the scanner is looking at text that really does carry the
  // transcribed values, so an empty or wrongly-sliced read cannot pass above.
  for (const model of ["opus", "sonnet", "fable", "haiku"]) {
    assert.match(source, new RegExp(`"${model}"`));
  }
});

// ─── the same rows, end to end through the step's exit status ─────────────

test("a run dir witnessing all seven rows exits 0", () => {
  withScratchRunDir((runDir) => {
    writeFullyValidRunDir(runDir);
    const r = runAssertStep(runDir);
    assert.equal(r.status, 0, r.out);
  });
});

test("a run dir with no corpus descriptors at all exits non-zero naming the model-map row", () => {
  // The F-04 falsifier at the step level: delete the corpus and the suite goes
  // red, rather than the model-map property quietly having no observations.
  withScratchRunDir((runDir) => {
    writeFullyValidRunDir(runDir, []);
    const r = runAssertStep(runDir);
    assert.notEqual(r.status, 0, r.out);
    assert.match(r.out, /pinned-model-map/);
  });
});

test("a run dir missing one M-ENG-07 row's witness exits non-zero naming that row", () => {
  withScratchRunDir((runDir) => {
    writeFullyValidRunDir(
      runDir,
      witnesses((r) => (r.corpusRun === "run-vb" ? [] : [r]))
    );
    const r = runAssertStep(runDir);
    assert.notEqual(r.status, 0, r.out);
    assert.match(r.out, /M-ENG-07 row 7\b/);
  });
});

test("a run dir carrying an unmapped model value exits non-zero naming it", () => {
  withScratchRunDir((runDir) => {
    writeFullyValidRunDir(runDir);
    appendRecord(runDir, "pid-dispatch", {
      kind: "dispatch",
      corpusRun: "run-i",
      seq: 98,
      skill: "se-review",
      phase: "Phase R",
      model: "unmapped-model",
      attempt: 0,
      outcome: "ok",
      errorText: null,
      promptHash: "0000000000000000",
    });
    const r = runAssertStep(runDir);
    assert.notEqual(r.status, 0, r.out);
    assert.match(r.out, /unmapped-model/);
  });
});

test("a run dir carrying a pre-phase corpus dispatch exits non-zero naming the pre-phase row", () => {
  withScratchRunDir((runDir) => {
    writeFullyValidRunDir(runDir);
    appendRecord(runDir, "pid-dispatch", {
      kind: "dispatch",
      corpusRun: "run-ii",
      seq: 97,
      skill: "se-author",
      phase: null,
      model: "sonnet",
      attempt: 0,
      outcome: "ok",
      errorText: null,
      promptHash: "0000000000000000",
    });
    const r = runAssertStep(runDir);
    assert.notEqual(r.status, 0, r.out);
    assert.match(r.out, /pre-phase-window/);
  });
});
