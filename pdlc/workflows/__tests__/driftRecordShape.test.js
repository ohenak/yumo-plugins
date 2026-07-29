/**
 * TSPEC §12.1 — `validateDriftRecord(value)` shape validator, one fixture per clause.
 *
 * `validateDriftRecord` does not exist yet on `orchestrate-queue.js` (it is T-11's job, batch 4).
 * This file is RED-terminal for batch 2: importing a named export the module does not yet provide
 * fails module resolution with a specified reason ("does not provide an export named
 * 'validateDriftRecord'"), which is the named, RED reason this batch's gate requires.
 *
 * Table rules restated from TSPEC §12.1 (v2.0, TE F-04):
 *   - one row, one mutation, one it()
 *   - every row starts from a frozen `VALID_RECORD` and deep-clones it before mutating
 *   - every row asserts the returned **clause id**, not merely `ok: false`
 */

import { validateDriftRecord } from "../orchestrate-queue.js";

// A shape-valid drift-state record, matching FSPEC §1.3's schema exactly.
const VALID_RECORD = Object.freeze({
  schemaVersion: 1,
  generatedAtUtc: "2026-07-28T09:14:02Z",
  generatedBy: "hook",
  pluginVersion: "0.11.0",
  checkEnabled: true,
  syncCommand:
    "/Users/x/.claude/plugins/cache/yumo-plugins/pdlc/0.11.0/hooks/scripts/sync-workflows.sh",
  baselineStatus: "resolved",
  baselineReason: null,
  retiredPresent: [
    {
      path: ".claude/workflows/orchestrate-dev.js",
      supersededBy: "orchestrate-dev",
      supersedingState: "in-sync",
    },
  ],
  writeFailures: [
    { path: ".claude/workflows/orchestrate-queue.bundle.js", operation: "artifact-copy" },
  ],
  rows: [
    {
      id: "orchestrate-dev",
      state: "in-sync",
      reason: null,
      pluginHash: "abc123",
      consumerHash: "abc123",
      pluginArtifactVersion: "0.11.0",
      consumerArtifactVersion: "0.11.0",
    },
  ],
});

// Deep-clone before mutating — VALID_RECORD is frozen and shared across every row; a mutation
// against the shared literal (rather than a clone) would make row order observable in the pass/
// fail outcome, which is exactly the failure mode this suite must not have (TSPEC §12.1, last
// paragraph).
function cloneValid() {
  return JSON.parse(JSON.stringify(VALID_RECORD));
}

function toInput(record) {
  return JSON.stringify(record);
}

describe("validateDriftRecord — TSPEC §12.1 clause table", () => {
  // Guard against any row mutating the shared literal instead of its own clone.
  const pristine = JSON.stringify(VALID_RECORD);
  afterEach(() => {
    expect(JSON.stringify(VALID_RECORD)).toBe(pristine);
    expect(Object.isFrozen(VALID_RECORD)).toBe(true);
  });

  it("row 1 — D1: the injected read returned null", () => {
    const result = validateDriftRecord(null);
    expect(result.ok).toBe(false);
    expect(result.clause).toBe("D1");
  });

  it("row 2 — D2: fenced code block wrapping otherwise-valid JSON", () => {
    const fenced = "```json\n" + toInput(cloneValid()) + "\n```";
    const result = validateDriftRecord(fenced);
    expect(result.ok).toBe(false);
    expect(result.clause).toBe("D2");
  });

  it("row 3 — D2: truncated JSON that does not parse", () => {
    const truncated = '{"schemaVersion":1,';
    const result = validateDriftRecord(truncated);
    expect(result.ok).toBe(false);
    expect(result.clause).toBe("D2");
  });

  it("row 4 — D2: re-wrapped in a single-key envelope (top level is not the record)", () => {
    const rewrapped = toInput({ result: cloneValid() });
    const result = validateDriftRecord(rewrapped);
    expect(result.ok).toBe(false);
    expect(result.clause).toBe("D2");
  });

  it("row 5 — D3: schemaVersion type-swapped from integer to string", () => {
    const record = cloneValid();
    record.schemaVersion = "1";
    const result = validateDriftRecord(toInput(record));
    expect(result.ok).toBe(false);
    expect(result.clause).toBe("D3");
  });

  it("row 6 — D4: baselineReason reworded to a non-closed value", () => {
    const record = cloneValid();
    record.baselineReason = "manifest-gone";
    const result = validateDriftRecord(toInput(record));
    expect(result.ok).toBe(false);
    expect(result.clause).toBe("D4");
  });

  it("row 7 — D4: baselineStatus key dropped (D4's other conjunct)", () => {
    const record = cloneValid();
    delete record.baselineStatus;
    const result = validateDriftRecord(toInput(record));
    expect(result.ok).toBe(false);
    expect(result.clause).toBe("D4");
  });

  it("row 8 — D5: checkEnabled type-swapped from boolean to string", () => {
    const record = cloneValid();
    record.checkEnabled = "false";
    const result = validateDriftRecord(toInput(record));
    expect(result.ok).toBe(false);
    expect(result.clause).toBe("D5");
  });

  it("row 9 — D6: rows key dropped", () => {
    const record = cloneValid();
    delete record.rows;
    const result = validateDriftRecord(toInput(record));
    expect(result.ok).toBe(false);
    expect(result.clause).toBe("D6");
  });

  it("row 10 — D6: retiredPresent array replaced by a scalar", () => {
    const record = cloneValid();
    record.retiredPresent = "[]";
    const result = validateDriftRecord(toInput(record));
    expect(result.ok).toBe(false);
    expect(result.clause).toBe("D6");
  });

  it("row 11 — D6: writeFailures array replaced by an object", () => {
    const record = cloneValid();
    record.writeFailures = {};
    const result = validateDriftRecord(toInput(record));
    expect(result.ok).toBe(false);
    expect(result.clause).toBe("D6");
  });

  it("row 12 — D7: rows[0].state reworded to a non-closed value", () => {
    const record = cloneValid();
    record.rows[0].state = "in sync";
    const result = validateDriftRecord(toInput(record));
    expect(result.ok).toBe(false);
    expect(result.clause).toBe("D7");
  });

  it("row 13 — D7: retiredPresent[0].supersedingState reworded to a non-closed value (second site)", () => {
    const record = cloneValid();
    record.retiredPresent[0].supersedingState = "fresh";
    const result = validateDriftRecord(toInput(record));
    expect(result.ok).toBe(false);
    expect(result.clause).toBe("D7");
  });

  it("row 14 — D8: generatedBy reworded to a non-closed value", () => {
    const record = cloneValid();
    record.generatedBy = "queue";
    const result = validateDriftRecord(toInput(record));
    expect(result.ok).toBe(false);
    expect(result.clause).toBe("D8");
  });

  it("row 15 — D8: syncCommand type-swapped from null-or-string to a number", () => {
    const record = cloneValid();
    record.syncCommand = 42;
    const result = validateDriftRecord(toInput(record));
    expect(result.ok).toBe(false);
    expect(result.clause).toBe("D8");
  });

  it("row 16 — AT-36: syncCommand absence is the one D8 tolerates, ⇒ ok: true", () => {
    const record = cloneValid();
    delete record.syncCommand;
    const result = validateDriftRecord(toInput(record));
    expect(result.ok).toBe(true);
    expect(result.record).toBeDefined();
    // Absence is tolerated and read as null (FSPEC §1.3), not merely "not rejected".
    expect(result.record.syncCommand).toBeNull();
  });

  it("§12.1 single-level envelope rule — {\"result\":42} stays D3 (inner value is not shape-valid, so the envelope test does not fire)", () => {
    const result = validateDriftRecord(toInput({ result: 42 }));
    expect(result.ok).toBe(false);
    expect(result.clause).toBe("D3");
  });
});
