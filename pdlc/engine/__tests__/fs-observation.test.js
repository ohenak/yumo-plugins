// Tests the AC-1.2 instrument: the `fs` read recorder `_bootstrap.mjs` installs
// (TSPEC §7.7, §7.0; FSPEC §10.3; PROPERTIES PROP-READ-1, PROP-READ-2, PROP-READ-3,
// PROP-READ-6, PROP-READ-7, PROP-REP-3; AT-ENG-47, AT-ENG-48, AT-ENG-50).
//
// Scope THIS file, per PLAN's table: T33 -> T43 (bootstrap v2 makes the recorder
// exist), T46 (the populated `.claude/workflows/` consumer fixture that makes the
// full `pdlc dev`/`pdlc queue` runs meaningful). `_bootstrap.mjs` does not export
// `startFsReadRecording`/`stopFsReadRecording` yet (T43, batch 5): this whole file
// is expected to fail to import until T43 lands, exactly the T02/hermeticity.test.js
// precedent for a file that pins a seam ahead of its implementation (PLAN batch 4).
//
// Contract this file pins for T43's recorder (TSPEC §7.7's "Element | Design"
// table): a wrapper over `node:fs`'s read entry points (`readFileSync`,
// `promises.readFile`, `createReadStream`, `openSync`, `promises.open`),
// installed by `_bootstrap.mjs`, enabled only when a test in *this* file calls
// `startFsReadRecording()`. `stopFsReadRecording()` uninstalls the wrapper and
// returns the array of absolute path strings read while it was installed, in
// read order, duplicates included (a total, append-only record — never a set).
//
// The three read-set clauses (TSPEC §7.7) are this test file's own logic, not
// the recorder's: the recorder only records; this file matches. That is why
// the clause-matching helpers below live here rather than in `_bootstrap.mjs`
// (TSPEC:2299 — "the AC-1.2 test's three clauses").
//
// Clause 3 (absence under `{consumerRoot}/.claude/workflows/`) is never
// asserted alone in this file: every test that checks it also asserts clause 1
// and clause 2 hold on the *same* recording (TSPEC §7.7's "never asserted
// alone" rule) — an empty recording would satisfy clause 3 for the wrong
// reason, which is exactly what the two falsifying controls below rule out.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Not yet exported by `_bootstrap.mjs` (T43 adds them) — this import is the
// reason the whole file is red until then, per this file's own header comment.
import { startFsReadRecording, stopFsReadRecording } from "./_bootstrap.mjs";

// --- clause-matching helpers (owned by this test file, TSPEC:2299) --------

function resolvedRecords(records) {
  return records.map((p) => path.resolve(p));
}

// Clause 1: >=1 recorded path equal to `{pluginRoot}/skills/{skill}/SKILL.md`.
function clause1SkillRead(records, pluginRoot, skill) {
  const target = path.resolve(pluginRoot, "skills", skill, "SKILL.md");
  return resolvedRecords(records).includes(target);
}

// Clause 2: >=1 recorded path equal to the consumer's `docs/{f}/REQ-{f}.md`.
function clause2ReqRead(records, consumerRoot, feature) {
  const target = path.resolve(consumerRoot, "docs", feature, `REQ-${feature}.md`);
  return resolvedRecords(records).includes(target);
}

// Clause 3: no recorded path falls under `{consumerRoot}/.claude/workflows/`.
function clause3WorkflowsAbsence(records, consumerRoot) {
  const prefix = path.resolve(consumerRoot, ".claude", "workflows") + path.sep;
  return !resolvedRecords(records).some((p) => p.startsWith(prefix));
}

// --- scratch fixture: a synthetic {pluginRoot} + {consumerRoot} pair -------

function makeScratchRoots() {
  const pluginRoot = fs.mkdtempSync(path.join(os.tmpdir(), "pdlc-fsobs-plugin-"));
  const consumerRoot = fs.mkdtempSync(path.join(os.tmpdir(), "pdlc-fsobs-consumer-"));

  const skillDir = path.join(pluginRoot, "skills", "se-implement");
  fs.mkdirSync(skillDir, { recursive: true });
  const skillFile = path.join(skillDir, "SKILL.md");
  fs.writeFileSync(skillFile, "# se-implement\n");

  const reqDir = path.join(consumerRoot, "docs", "widget");
  fs.mkdirSync(reqDir, { recursive: true });
  const reqFile = path.join(reqDir, "REQ-widget.md");
  fs.writeFileSync(reqFile, "# REQ-widget\n");

  const workflowsDir = path.join(consumerRoot, ".claude", "workflows");
  fs.mkdirSync(workflowsDir, { recursive: true });
  const workflowsFile = path.join(workflowsDir, "orchestrate-dev.bundle.js");
  fs.writeFileSync(workflowsFile, "// bundle\n");

  return { pluginRoot, consumerRoot, skillFile, reqFile, workflowsFile, feature: "widget", skill: "se-implement" };
}

// --- falsifying control 1: an un-started recorder never lies "empty" as pass ---
//
// TSPEC §7.7: "a case asserting the recording is non-empty (proving the
// wrapper installed)". Recording nothing must be distinguishable from "the
// wrapper never ran" — this test proves the wrapper itself is live by driving
// >=1 real `fs.readFileSync` through it and observing >=1 record, before any
// clause is evaluated at all.

test("PROP-READ-3/AT-ENG-47: recorder produces a non-empty recording for a run that reads a real file (wrapper is live, not a no-op)", () => {
  const { skillFile } = makeScratchRoots();

  startFsReadRecording();
  fs.readFileSync(skillFile, "utf8");
  const records = stopFsReadRecording();

  assert.ok(
    Array.isArray(records) && records.length > 0,
    `expected a non-empty recording after a real read; got ${JSON.stringify(records)}`,
  );
});

// --- the two positive clauses, together with clause 3 on the SAME recording ---
//
// AT-ENG-47: "the three read-set clauses on one observed run ... for a `pdlc
// dev` run with no opt-out configured". This test stands in for that run with
// the two reads it must contain (skill SKILL.md, consumer REQ) and asserts
// clause 3 only alongside clauses 1 and 2 — never in isolation (TSPEC §7.7's
// "never asserted alone" rule; PROP-READ-3).

test("PROP-READ-1/AT-ENG-47: clauses 1 and 2 hold, and clause 3 holds on the same recording, when only the two expected files are read", () => {
  const { pluginRoot, consumerRoot, skillFile, reqFile, skill, feature } = makeScratchRoots();

  startFsReadRecording();
  fs.readFileSync(skillFile, "utf8");
  fs.readFileSync(reqFile, "utf8");
  const records = stopFsReadRecording();

  const c1 = clause1SkillRead(records, pluginRoot, skill);
  const c2 = clause2ReqRead(records, consumerRoot, feature);
  const c3 = clause3WorkflowsAbsence(records, consumerRoot);

  assert.equal(c1, true, "clause 1 (skill SKILL.md read) must hold");
  assert.equal(c2, true, "clause 2 (consumer REQ read) must hold");
  assert.equal(c3, true, "clause 3 (.claude/workflows/ absence) must hold alongside clauses 1 and 2");
});

// --- falsifying control 2: a deliberate read under .claude/workflows/ must fail clause 3 ---
//
// TSPEC §7.7: "deliberately reads a file under `.claude/workflows/` inside the
// observation window **must** fail clause 3 (proving the matcher sees the
// tree)". Clauses 1 and 2 still hold on this same recording — only clause 3
// flips, proving the matcher is not vacuously true because the recording is
// non-empty or because the read-set happens to be right for the wrong reason.

test("PROP-READ-3/AT-ENG-47: a deliberate read under .claude/workflows/ fails clause 3, even though clauses 1 and 2 still hold", () => {
  const { pluginRoot, consumerRoot, skillFile, reqFile, workflowsFile, skill, feature } = makeScratchRoots();

  startFsReadRecording();
  fs.readFileSync(skillFile, "utf8");
  fs.readFileSync(reqFile, "utf8");
  fs.readFileSync(workflowsFile, "utf8");
  const records = stopFsReadRecording();

  const c1 = clause1SkillRead(records, pluginRoot, skill);
  const c2 = clause2ReqRead(records, consumerRoot, feature);
  const c3 = clause3WorkflowsAbsence(records, consumerRoot);

  assert.equal(c1, true, "clause 1 must still hold");
  assert.equal(c2, true, "clause 2 must still hold");
  assert.equal(
    c3,
    false,
    "clause 3 must fail once a path under .claude/workflows/ is read in the observation window",
  );
});

// --- PROP-READ-7: the matcher is scoped, not a blanket "anything under consumerRoot" test ---
//
// "Reads of the consumer's own `docs/**` and `.claude/pdlc.config.json`, and
// reads inside the engine install and the located plugin's `skills/` tree,
// must not be treated as violations by the clause-(c) matcher — the matcher
// is scoped to `{consumerRoot}/.claude/workflows/` and nothing else."

test("PROP-READ-7: clause 3 is scoped to .claude/workflows/ only — consumer docs/** and .claude/pdlc.config.json reads are not violations", () => {
  const { pluginRoot, consumerRoot, skillFile, reqFile, skill, feature } = makeScratchRoots();

  const configFile = path.join(consumerRoot, ".claude", "pdlc.config.json");
  fs.writeFileSync(configFile, "{}\n");

  startFsReadRecording();
  fs.readFileSync(skillFile, "utf8");
  fs.readFileSync(reqFile, "utf8");
  fs.readFileSync(configFile, "utf8");
  const records = stopFsReadRecording();

  const c1 = clause1SkillRead(records, pluginRoot, skill);
  const c2 = clause2ReqRead(records, consumerRoot, feature);
  const c3 = clause3WorkflowsAbsence(records, consumerRoot);

  assert.equal(c1, true);
  assert.equal(c2, true);
  assert.equal(
    c3,
    true,
    "a read of .claude/pdlc.config.json is a sibling of .claude/workflows/, not inside it, and must not trip clause 3",
  );
});

// --- AT-ENG-48: opt-out posture changes whether a drift-state read is observable ---
//
// "a `pdlc queue` run with the opt-out configured opens no path under
// `.claude/workflows/`; without it, the run is blocked by the module's gate."
// A full `pdlc queue` run is T46's populated-fixture concern; this file's
// unit-level slice pins the clause-3 matcher's verdict on the two shapes of
// recording that opt-out posture produces, per PROP-READ-2.

test("PROP-READ-2/AT-ENG-48: clause 3 holds on a recording with the opt-out's read-set (no drift-state read)", () => {
  const { consumerRoot } = makeScratchRoots();
  // Opt-out configured (`distribution.checkEnabled: false`): the drift-state
  // read under .claude/workflows/ never happens (TSPEC §7.7, `orchestrate-
  // queue.js:1071-1072`'s short-circuit) — simulated here as an empty window.
  const records = [];
  assert.equal(clause3WorkflowsAbsence(records, consumerRoot), true);
});

test("PROP-READ-2/AT-ENG-48: clause 3 fails on a recording with the no-opt-out read-set (drift-state read observed)", () => {
  const { consumerRoot, workflowsFile } = makeScratchRoots();
  // No opt-out: the module's gate reads the drift-state file under
  // `.claude/workflows/` before the run proceeds — that read must be
  // observable, and the matcher must catch it (same clause-3 logic as the
  // deliberate-read control above, not a separate code path).
  const records = [workflowsFile];
  assert.equal(clause3WorkflowsAbsence(records, consumerRoot), false);
});

// --- AT-ENG-50/PROP-READ-6/PROP-REP-3: no engine-owned file is created under the consumer ---
//
// "no engine-owned file is created under a consumer repo across a full
// fixture run" (BR-READ-3, NG-7). The write-side instrument is the same `fs`
// recorder scoped to writes; this file's unit slice pins the write-absence
// check the full-run fixture (T46) will drive: the write-set observed under
// `consumerRoot` must be empty even though reads under it are expected.

test("PROP-READ-6/AT-ENG-50: an empty write-set under consumerRoot is distinguishable from an untouched recorder (non-empty read-set on the same recording)", () => {
  const { consumerRoot, reqFile } = makeScratchRoots();

  startFsReadRecording();
  fs.readFileSync(reqFile, "utf8");
  const records = stopFsReadRecording();

  // No write recording exists in this recorder's read-only contract (TSPEC
  // §7.7's design table lists read entry points only) — this test asserts
  // the recording is real (reads present) precisely so an absent write
  // instrument is never mistaken for "nothing happened".
  assert.ok(records.length > 0, "read recording must be non-empty on the same run asserted to write nothing");
  assert.equal(
    fs.existsSync(path.join(consumerRoot, ".pdlc-engine-run-state.json")),
    false,
    "no engine-owned file may exist under the consumer root after the run",
  );
});
