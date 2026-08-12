// Drives `__tests__/_assert-suite-wide.mjs` (TSPEC §7.0/§7.4, PLAN T03 -> T19) as
// a real subprocess over *synthetic* scratch run directories this file builds by
// hand — it never runs the real suite runner (`_run-suite.mjs`, T11) or the real
// bootstrap (`_bootstrap.mjs`, T12); the spine-inheritance property that pair
// establishes is `suite-spine.test.js`'s job (T01), not this file's.
//
// Scope of THIS file (per PLAN T03's own description, AT-ENG-33, AT-ENG-61):
//   - the emptiness guard (PROP-FAIL-4, PROP-SUITE-6): a missing or empty
//     `${PDLC_TEST_RUN_DIR}` makes the step exit non-zero rather than asserting
//     vacuously over the empty union;
//   - the message-catalogue row (§7.4 table row 1, PROP-MSG-1/2/3): emitted ids
//     across the union of every `.jsonl` in the run dir must set-equal
//     `messageIds()`, both directions;
//   - the outcome-taxonomy row (§7.4 table row 2, PROP-FAIL-2): every recorded
//     classification must be a member of `OUTCOMES` (forward direction only —
//     the reverse direction, PROP-FAIL-3, is witnessed by named provocation
//     fixtures and is `outcome.test.js`'s job, unit-scoped, not this script's).
//
// The v1 assertion step (T19) implements exactly these two rows plus the
// emptiness guard and the spine self-assertion; the model-map and
// dispatchable-skills rows are out of scope for both T19 and this file.
//
// Record shape assumed (undetermined by TSPEC beyond "JSON lines... §7.0",
// fixed here because this file is the acceptance test the future
// `_assert-suite-wide.mjs` must satisfy): each line is one JSON object with a
// `kind` discriminator, since a real run dir's `.jsonl` files will eventually
// carry mixed record shapes (message ids, outcome classifications, and later
// dispatch descriptors) from the same per-pid append-only file (§7.0):
//   { kind: "message-id", id: string }
//   { kind: "outcome", value: string }

import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  appendFileSync,
  rmSync,
} from "node:fs";

import { messageIds } from "../lib/catalogue.mjs";
import { OUTCOMES } from "../lib/outcome.mjs";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ASSERT_SCRIPT = path.join(engineRoot, "__tests__", "_assert-suite-wide.mjs");

// ─── scratch run-dir helpers ────────────────────────────────────────────────

function newScratchRunDir() {
  return mkdtempSync(path.join(os.tmpdir(), "pdlc-assert-suite-wide-"));
}

// Appends one JSON-line record to `${runDir}/${pid}.jsonl`, creating the run
// dir and the file as needed — mirrors §7.0's "each process appends its
// observations as JSON lines to `${PDLC_TEST_RUN_DIR}/{pid}.jsonl}`" shape,
// with a synthetic `pid` standing in for the real per-process one.
function appendRecord(runDir, pid, record) {
  mkdirSync(runDir, { recursive: true });
  const file = path.join(runDir, `${pid}.jsonl`);
  appendFileSync(file, `${JSON.stringify(record)}\n`);
}

function messageRecord(id) {
  return { kind: "message-id", id };
}

function outcomeRecord(value) {
  return { kind: "outcome", value };
}

// A minimal fully-passing population: every catalogue id emitted once, every
// OUTCOMES member observed once — satisfies both rows in scope so a test that
// wants to isolate a single row's failure can build on top of this rather than
// tripping the *other* row by omission.
function writeFullyValidPopulation(runDir) {
  for (const id of messageIds()) {
    appendRecord(runDir, "pid-messages", messageRecord(id));
  }
  for (const value of OUTCOMES) {
    appendRecord(runDir, "pid-outcomes", outcomeRecord(value));
  }
}

function runAssertStep(runDir) {
  const result = spawnSync(process.execPath, [ASSERT_SCRIPT], {
    encoding: "utf8",
    cwd: engineRoot,
    env: { ...process.env, PDLC_TEST_RUN_ID: "scratch", PDLC_TEST_RUN_DIR: runDir },
  });
  return { ...result, out: `${result.stdout ?? ""}${result.stderr ?? ""}` };
}

// ─── emptiness guard (PROP-FAIL-4, PROP-SUITE-6, TSPEC §7.0 "the final
// step's own emptiness is a failure") ───────────────────────────────────────

test("a run dir that does not exist on disk fails the step, not the empty union", () => {
  const runDir = path.join(os.tmpdir(), `pdlc-assert-suite-wide-missing-${process.pid}`);
  const r = runAssertStep(runDir);
  assert.notEqual(r.status, 0, r.out);
  assert.match(r.out, /empty|no record|missing/i);
});

test("a run dir that exists but holds no `.jsonl` files fails the step", () => {
  const runDir = newScratchRunDir();
  try {
    const r = runAssertStep(runDir);
    assert.notEqual(r.status, 0, r.out);
    assert.match(r.out, /empty|no record/i);
  } finally {
    rmSync(runDir, { recursive: true, force: true });
  }
});

test("a run dir holding only a zero-line `.jsonl` file fails the step (empty union, not empty directory)", () => {
  const runDir = newScratchRunDir();
  try {
    writeFileSync(path.join(runDir, "pid-empty.jsonl"), "");
    const r = runAssertStep(runDir);
    assert.notEqual(r.status, 0, r.out);
  } finally {
    rmSync(runDir, { recursive: true, force: true });
  }
});

// ─── populated dir: the fully-valid population passes both rows in scope ───

test("a run dir whose union satisfies both rows in scope exits 0", () => {
  const runDir = newScratchRunDir();
  try {
    writeFullyValidPopulation(runDir);
    const r = runAssertStep(runDir);
    assert.equal(r.status, 0, r.out);
  } finally {
    rmSync(runDir, { recursive: true, force: true });
  }
});

// ─── message-catalogue row (§7.4 row 1, AT-ENG-61, PROP-MSG-1/2/3) ─────────

test("catalogue row, forward direction: an emitted id with no `messageIds()` entry fails the step", () => {
  const runDir = newScratchRunDir();
  try {
    writeFullyValidPopulation(runDir);
    appendRecord(runDir, "pid-messages", messageRecord("no.such.registered.id"));
    const r = runAssertStep(runDir);
    assert.notEqual(r.status, 0, r.out);
  } finally {
    rmSync(runDir, { recursive: true, force: true });
  }
});

// A closed six-member catalogue (`outcome.mjs`'s own §5.1 contract) leaves no
// "extra registered member never observed" case to write here — unlike the
// message catalogue, whose registry can grow past what one population
// exercises, `OUTCOMES` is fixed, and the reverse direction (every member
// witnessed) is `outcome.test.js`'s PROP-FAIL-3, not this row's.

test("catalogue row, reverse direction: a registered id never emitted fails the step", () => {
  const runDir = newScratchRunDir();
  try {
    const ids = messageIds();
    assert.ok(ids.length > 0, "the catalogue must register at least one id for this case to mean anything");
    const [, ...allButOne] = ids;
    for (const id of allButOne) {
      appendRecord(runDir, "pid-messages", messageRecord(id));
    }
    for (const value of OUTCOMES) {
      appendRecord(runDir, "pid-outcomes", outcomeRecord(value));
    }
    const r = runAssertStep(runDir);
    assert.notEqual(r.status, 0, r.out);
  } finally {
    rmSync(runDir, { recursive: true, force: true });
  }
});

// ─── outcome-taxonomy row (§7.4 row 2, AT-ENG-33, PROP-FAIL-2) ─────────────
// Forward direction only (observed ⊆ OUTCOMES) — see comment above the
// reverse-direction non-case in the catalogue block for why the reverse half
// lives in `outcome.test.js` instead of here.

test("outcome row: a recorded classification outside the six-member OUTCOMES set fails the step", () => {
  const runDir = newScratchRunDir();
  try {
    writeFullyValidPopulation(runDir);
    appendRecord(runDir, "pid-outcomes", outcomeRecord("not-a-real-outcome-member"));
    const r = runAssertStep(runDir);
    assert.notEqual(r.status, 0, r.out);
  } finally {
    rmSync(runDir, { recursive: true, force: true });
  }
});

test("outcome row passes with only a strict subset of OUTCOMES observed (forward direction needs no coverage)", () => {
  const runDir = newScratchRunDir();
  try {
    for (const id of messageIds()) {
      appendRecord(runDir, "pid-messages", messageRecord(id));
    }
    appendRecord(runDir, "pid-outcomes", outcomeRecord(OUTCOMES[0]));
    const r = runAssertStep(runDir);
    assert.equal(r.status, 0, r.out);
  } finally {
    rmSync(runDir, { recursive: true, force: true });
  }
});

// ─── the union spans every `.jsonl` file in the run dir, not just one ──────
// (§7.0: "reads the union of every `.jsonl`" — a population split across two
// sibling per-pid files must be combined, not read from a single file, since
// that is exactly the cross-process shape §7.0's mechanism produces.)

test("the step reads the union across sibling `.jsonl` files, not a single one", () => {
  const runDir = newScratchRunDir();
  try {
    const ids = messageIds();
    const half = Math.max(1, Math.floor(ids.length / 2));
    for (const id of ids.slice(0, half)) {
      appendRecord(runDir, "pid-a", messageRecord(id));
    }
    for (const id of ids.slice(half)) {
      appendRecord(runDir, "pid-b", messageRecord(id));
    }
    for (const value of OUTCOMES) {
      appendRecord(runDir, "pid-c", outcomeRecord(value));
    }
    const r = runAssertStep(runDir);
    assert.equal(r.status, 0, r.out);
  } finally {
    rmSync(runDir, { recursive: true, force: true });
  }
});
