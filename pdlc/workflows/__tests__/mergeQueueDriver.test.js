// ─── mergeQueueDriver.test.js ───────────────────────────────────────────────
//
// PLAN §4/§12 (pdlc-merge-phase), task B3. TSPEC §9.1–§9.4, FSPEC §7.5/§9.5.
//
// `runPicked`'s `done` transition and operator-message branch (AT-M4), the
// end-to-end selection effect on a dependent (AT-M5), and `buildQueueReport`'s
// (already-correct, TSPEC §9.3) pass-through of the merge fields — asserted
// positively so a future `buildQueueReport` that projects selected fields
// instead of carrying the whole pipeline report would be caught here.
//
// Seam contract (TSPEC §9's own note, PLAN B3 row): `phaseMerge` and
// `orchestrate-dev`'s `mergeStatus` report field do not exist yet (A7/A8 are
// later waves). Every "pipeline report" below is therefore a FAKE object this
// file constructs directly — `runPicked` only ever reads `report.outcome` and
// `report.mergeStatus` off whatever `_runPipeline` resolves to, which is
// exactly the seam this task is allowed to drive.
//
// AT-M5's drift-gate precondition is supplied as a drift-state RECORD with
// `checkEnabled: false` and empty `writeFailures` (row 2 of the gate's
// precedence table) — never `.claude/pdlc.config.json`, per TSPEC §9 and the
// gate's own implementation (`mapDriftState`, `readDriftStateSafely`).

import main, {
  DEFAULT_QUEUE_PATH,
  DRIFT_STATE_PATH,
  parseQueue,
} from "../orchestrate-queue.js";

// A shape-valid drift-state record, opted out via checkEnabled:false (row 2 —
// FSPEC §6.2's operator opt-out), writeFailures empty so row 3 cannot also
// fire and block regardless (TSPEC §9's row-3 caveat).
const OPT_OUT_DRIFT_STATE = JSON.stringify({
  schemaVersion: 1,
  baselineStatus: "resolved",
  baselineReason: null,
  checkEnabled: false,
  rows: [],
  retiredPresent: [],
  writeFailures: [],
  generatedBy: "hook",
  pluginVersion: "0.10.0",
  syncCommand: null,
});

function makeFs(files) {
  const store = { [DRIFT_STATE_PATH]: OPT_OUT_DRIFT_STATE, ...files };
  return {
    store,
    readFile: async (p) => (p in store ? store[p] : null),
    writeFile: async (p, c) => {
      store[p] = c;
    },
  };
}

const READY_REQ = "---\nready: true\n---\n# REQ body\n";

let logMessages;
beforeEach(() => {
  logMessages = [];
});

function statusOf(fs, feature) {
  return parseQueue(fs.store[DEFAULT_QUEUE_PATH]).find((e) => e.feature === feature)
    .status;
}

// ─── AT-M4 — runPicked's done transition and message suppression ──────────

describe("runPicked — done transition (AT-M4)", () => {
  const ONE_FEATURE_QUEUE =
    "| Order | Status | Feature | REQ Path | Depends-On |\n" +
    "| --- | --- | --- | --- | --- |\n" +
    "| 1 | pending | upstream-feature | docs/upstream-feature/REQ-upstream-feature.md | - |";

  function driveOnce(fs, runPipelineFn) {
    return main({
      _readFile: fs.readFile,
      _writeFile: fs.writeFile,
      _agent: async () => "TRIAGE: ready",
      _runPipeline: runPipelineFn,
      _log: (m) => logMessages.push(m),
      _phase: () => {},
    });
  }

  it("records done and the merged message when the report carries mergeStatus: merged", async () => {
    const fs = makeFs({
      [DEFAULT_QUEUE_PATH]: ONE_FEATURE_QUEUE,
      "docs/upstream-feature/REQ-upstream-feature.md": READY_REQ,
    });

    const report = await driveOnce(fs, async () => ({
      outcome: "success",
      mergeStatus: "merged",
      mergeSha: "abc1234",
    }));

    expect(report.outcome).toBe("ran");
    expect(statusOf(fs, "upstream-feature")).toBe("done");

    const joined = logMessages.join("\n");
    expect(joined).toContain(
      '"upstream-feature" complete and merged (abc1234) — status set to done.'
    );
    expect(joined).not.toContain("Merge the PR, then set it to done");
  });

  it("falls back to sha unknown in the message when mergeSha is absent on a merged report", async () => {
    const fs = makeFs({
      [DEFAULT_QUEUE_PATH]: ONE_FEATURE_QUEUE,
      "docs/upstream-feature/REQ-upstream-feature.md": READY_REQ,
    });

    await driveOnce(fs, async () => ({ outcome: "success", mergeStatus: "merged" }));

    expect(statusOf(fs, "upstream-feature")).toBe("done");
    expect(logMessages.join("\n")).toContain(
      '"upstream-feature" complete and merged (sha unknown) — status set to done.'
    );
  });

  it("falls back to awaiting-merge and the unchanged message when mergeStatus is undefined", async () => {
    const fs = makeFs({
      [DEFAULT_QUEUE_PATH]: ONE_FEATURE_QUEUE,
      "docs/upstream-feature/REQ-upstream-feature.md": READY_REQ,
    });

    const report = await driveOnce(fs, async () => ({ outcome: "success" }));

    expect(report.outcome).toBe("ran");
    expect(statusOf(fs, "upstream-feature")).toBe("awaiting-merge");
    expect(logMessages.join("\n")).toContain(
      "Merge the PR, then set it to done to unblock dependents."
    );
  });

  it.each(["skipped", "deferred", "refused", "unrecognised-value"])(
    "leaves the row at awaiting-merge, unchanged, for a non-'merged' mergeStatus %s (Q-02 mutual exclusion)",
    async (mergeStatus) => {
      const fs = makeFs({
        [DEFAULT_QUEUE_PATH]: ONE_FEATURE_QUEUE,
        "docs/upstream-feature/REQ-upstream-feature.md": READY_REQ,
      });

      await driveOnce(fs, async () => ({ outcome: "success", mergeStatus }));

      expect(statusOf(fs, "upstream-feature")).toBe("awaiting-merge");
      expect(logMessages.join("\n")).not.toContain("complete and merged");
    }
  );

  it("never derives merged from a report whose outcome did not succeed, even if mergeStatus says merged", async () => {
    const fs = makeFs({
      [DEFAULT_QUEUE_PATH]: ONE_FEATURE_QUEUE,
      "docs/upstream-feature/REQ-upstream-feature.md": READY_REQ,
    });

    const report = await driveOnce(fs, async () => ({
      outcome: "halted",
      mergeStatus: "merged",
      haltReason: "boom",
    }));

    expect(report.outcome).toBe("halted");
    expect(statusOf(fs, "upstream-feature")).toBe("halted");
  });
});

// ─── TSPEC §9.3 — buildQueueReport's pass-through of the merge fields ──────

describe("buildQueueReport — pass-through of the merge fields (TSPEC §9.3)", () => {
  it("carries mergeStatus/mergeSha/mergeMethod and MERGE ESCALATION notices from the pipeline report whole", async () => {
    const QUEUE =
      "| Order | Status | Feature | REQ Path | Depends-On |\n" +
      "| --- | --- | --- | --- | --- |\n" +
      "| 1 | pending | solo-feature | docs/solo-feature/REQ-solo-feature.md | - |";
    const fs = makeFs({
      [DEFAULT_QUEUE_PATH]: QUEUE,
      "docs/solo-feature/REQ-solo-feature.md": READY_REQ,
    });

    const fakeReport = {
      outcome: "success",
      mergeStatus: "merged",
      mergeSha: "deadbee",
      mergeMethod: "squash",
      notices: ["MERGE ESCALATION: something went sideways"],
    };

    const report = await main({
      _readFile: fs.readFile,
      _writeFile: fs.writeFile,
      _agent: async () => "TRIAGE: ready",
      _runPipeline: async () => fakeReport,
      _log: (m) => logMessages.push(m),
      _phase: () => {},
    });

    expect(report.pipelineReport).toEqual(fakeReport);
    expect(report.pipelineReport.mergeStatus).toBe("merged");
    expect(report.pipelineReport.mergeSha).toBe("deadbee");
    expect(report.pipelineReport.mergeMethod).toBe("squash");
    expect(report.pipelineReport.notices).toContain(
      "MERGE ESCALATION: something went sideways"
    );
  });
});

// ─── AT-M5 — end-to-end: dependent selected after done, not at awaiting-merge ─

describe("AT-M5 — end-to-end selection across two invocations", () => {
  const TWO_FEATURE_QUEUE =
    "| Order | Status | Feature | REQ Path | Depends-On |\n" +
    "| --- | --- | --- | --- | --- |\n" +
    "| 1 | pending | upstream-feature | docs/upstream-feature/REQ-upstream-feature.md | - |\n" +
    "| 2 | pending | dependent-feature | docs/dependent-feature/REQ-dependent-feature.md | upstream-feature |";

  function makeTwoFeatureFs() {
    return makeFs({
      [DEFAULT_QUEUE_PATH]: TWO_FEATURE_QUEUE,
      "docs/upstream-feature/REQ-upstream-feature.md": READY_REQ,
      "docs/dependent-feature/REQ-dependent-feature.md": READY_REQ,
    });
  }

  it("selects the dependent on the next invocation after a merged run — no human turn", async () => {
    const fs = makeTwoFeatureFs();

    const first = await main({
      _readFile: fs.readFile,
      _writeFile: fs.writeFile,
      _agent: async () => "TRIAGE: ready",
      _runPipeline: async () => ({
        outcome: "success",
        mergeStatus: "merged",
        mergeSha: "abc1234",
      }),
      _log: (m) => logMessages.push(m),
      _phase: () => {},
    });
    expect(first.picked).toBe("upstream-feature");
    expect(statusOf(fs, "upstream-feature")).toBe("done");

    const second = await main({
      _readFile: fs.readFile,
      _writeFile: fs.writeFile,
      _agent: async () => "TRIAGE: ready",
      _runPipeline: async () => ({ outcome: "success" }),
      _log: (m) => logMessages.push(m),
      _phase: () => {},
    });
    expect(second.picked).toBe("dependent-feature");
  });

  it("does NOT select the dependent while the upstream is left at awaiting-merge", async () => {
    const fs = makeTwoFeatureFs();

    const first = await main({
      _readFile: fs.readFile,
      _writeFile: fs.writeFile,
      _agent: async () => "TRIAGE: ready",
      _runPipeline: async () => ({ outcome: "success" }), // no mergeStatus -> awaiting-merge
      _log: (m) => logMessages.push(m),
      _phase: () => {},
    });
    expect(first.picked).toBe("upstream-feature");
    expect(statusOf(fs, "upstream-feature")).toBe("awaiting-merge");

    const second = await main({
      _readFile: fs.readFile,
      _writeFile: fs.writeFile,
      _agent: async () => "TRIAGE: ready",
      _runPipeline: async () => {
        throw new Error("must not be reached — nothing should be picked this pass");
      },
      _log: (m) => logMessages.push(m),
      _phase: () => {},
    });
    expect(second.picked).toBeUndefined();
    expect(second.outcome).not.toBe("ran");
  });
});
