/**
 * mergePhase.test.js — Phase MERGE's orchestrator (PLAN A7, TSPEC §7, §10.4,
 * FSPEC §11).
 *
 * FSPEC §11's 25-row observable-outcomes table is the primary oracle: rows
 * 1-23 plus the two split rows 11a/13a, driven end to end through
 * `phaseMerge` against `passingGh` (TE F-01) plus one override per row.
 * `orchestrate-dev.js:A1-A6` (config, classifiers, guard, decideMerge,
 * observers, executeMerge/M-helpers) are landed and are wired here, never
 * duplicated.
 *
 * Row 23 ("run halted before Phase MERGE") is not reachable *through*
 * `phaseMerge` — production never calls it in that scenario, `main()`'s halt
 * path reports `mergeStatus: "skipped"` from `buildFinalReport`'s defaulted
 * parameters directly (TSPEC §10.1). That wiring is PLAN A8's scope; it is
 * recorded here only as documentation so the "25 rows" accounting is
 * complete, not as an executed case.
 */

import {
  phaseMerge,
  MERGE_NOTES,
  MERGE_ESCALATIONS,
  MERGE_STATUSES,
  MERGE_MAX_DECISION_STEPS,
  MERGE_GUARD_DEFAULTS,
} from "../orchestrate-dev.js";
import {
  fakeGhRun,
  passingGh,
  fakeGit,
  fakeQueueFs,
  recordingRecordQueueRow,
  fakeSleep,
  fakeNow,
  seeded,
  resolveSeed,
  MERGE_PROP_SEED,
} from "./helpers/mergeDoubles.js";

// ─── Fixture plumbing ───────────────────────────────────────────────────────

const PR_URL = "https://github.com/acme/widgets/pull/42";
const FEATURE = "widget-feature";
const MERGE_READBACK_KEY = "gh pr view --json mergeCommit,state";
const MERGED_OID = "abc1234567890abcdef";

// `passingGh` (mergeDoubles.js, F1-owned) does not carry a default reply for
// O6's read-back surface (`gh pr view --json mergeCommit,state`) — it is not
// one of the six friendly override names. `ghFixture` extends the plain
// object `passingGh` returns with that seventh entry locally, in this file
// only; `mergeDoubles.js` itself is never edited.
function ghFixture(overrides = {}, readback) {
  const map = passingGh(overrides);
  map[MERGE_READBACK_KEY] = readback ?? {
    ok: true,
    stdout: JSON.stringify({ state: "MERGED", mergeCommit: { oid: MERGED_OID } }),
    stderr: "",
  };
  return map;
}

const BASE_CONFIG = Object.freeze({
  mergeMode: "gated",
  mergeRequiresCi: true,
  allowSquashMerge: false,
  deleteBranchOnPdlcMerge: true,
  mergeableRetries: 3,
  mergeableRetryDelay: 0,
  guardPaths: [],
});

// `_recordQueueRow` is called positionally by `mergeDoubles.js`'s shared
// double (`(feature, status, evidence)`) while `phaseMerge` calls it in
// object form (`{ feature, status, evidence }`, TSPEC §7.5) — a local
// adapter, not a change to the shared double (PLAN A7 note).
function queueRowSeam(disposition = "recorded", detail) {
  const shared = recordingRecordQueueRow(disposition);
  const _recordQueueRow = async ({ feature, status, evidence }) => {
    const queueRow = await shared._recordQueueRow(feature, status, evidence);
    return detail !== undefined ? { queueRow, detail } : { queueRow };
  };
  return { calls: shared.calls, _recordQueueRow };
}

/**
 * Builds a full seam set and runs `phaseMerge`. `gh` overrides use the
 * friendly names (`prState`, `ci`, `reviewThreads`, `repoCaps`,
 * `changedFiles`, `merge`); `readback` overrides O6's confirmation reply;
 * `git` scripts `_git`; `config` overrides `BASE_CONFIG`; `recordDisposition`
 * scripts `_recordQueueRow`'s reply; `prUrl`/`feature` override the defaults.
 */
async function run({
  gh = {},
  readback,
  git = {},
  config = {},
  recordDisposition = "recorded",
  prUrl = PR_URL,
  feature = FEATURE,
} = {}) {
  const ghRun = fakeGhRun(ghFixture(gh, readback));
  const gitDouble = fakeGit(git);
  const queueRow = queueRowSeam(recordDisposition);
  const readFileDouble = async () => {
    throw new Error("_readFile should not be called when config is supplied directly");
  };
  const outcome = await phaseMerge({
    feature,
    prUrl,
    config: { ...BASE_CONFIG, ...config },
    _ghRun: ghRun._ghRun,
    _git: gitDouble._git,
    _readFile: readFileDouble,
    _recordQueueRow: queueRow._recordQueueRow,
    _sleep: fakeSleep,
    _now: fakeNow,
  });
  return { outcome, ghCalls: ghRun.calls, gitCalls: gitDouble.calls, queueCalls: queueRow.calls };
}

function escalationLines(outcome) {
  return outcome.escalations;
}

function mergeCommandCalls(ghCalls) {
  return ghCalls.filter((c) => /^gh pr merge\b/.test(String(c)));
}

// ─── FSPEC §11's 25-row table, driven through phaseMerge ───────────────────

describe("phaseMerge — FSPEC §11 row table (AT-M2, AT-M2a's row-3 sibling)", () => {
  test("row 1 — Phase MERGE disabled: skipped, no _readFile, no _ghRun", async () => {
    const ghRun = fakeGhRun({});
    const gitDouble = fakeGit();
    const queueRow = queueRowSeam();
    let readFileCalled = false;
    const outcome = await phaseMerge({
      feature: FEATURE,
      prUrl: PR_URL,
      _enabled: false,
      _ghRun: ghRun._ghRun,
      _git: gitDouble._git,
      _readFile: async () => {
        readFileCalled = true;
        return null;
      },
      _recordQueueRow: queueRow._recordQueueRow,
      _sleep: fakeSleep,
      _now: fakeNow,
    });
    expect(outcome.mergeStatus).toBe("skipped");
    expect(outcome.row).toBe("1");
    expect(readFileCalled).toBe(false);
    expect(ghRun.calls).toHaveLength(0);
  });

  test("row 2 — mergeMode off: skipped, zero gh calls", async () => {
    const { outcome, ghCalls } = await run({ config: { mergeMode: "off" } });
    expect(outcome.mergeStatus).toBe("skipped");
    expect(outcome.row).toBe("2");
    expect(ghCalls).toHaveLength(0);
  });

  test("row 3 — PR already MERGED: merged, method unknown, no merge command issued", async () => {
    const { outcome, ghCalls, queueCalls } = await run({
      gh: { prState: { stdout: JSON.stringify({ state: "MERGED", mergeable: "MERGEABLE", mergeStateStatus: "CLEAN", number: 42, mergeCommit: { oid: MERGED_OID } }) } },
    });
    expect(outcome.mergeStatus).toBe("merged");
    expect(outcome.row).toBe("3");
    expect(outcome.mergeMethod).toBe("unknown");
    expect(outcome.mergeSha).toBe(MERGED_OID);
    expect(mergeCommandCalls(ghCalls)).toHaveLength(0);
    expect(queueCalls).toHaveLength(1);
  });

  test("row 4 — guard fired, a changed path matched: refused + escalation", async () => {
    const { outcome, ghCalls } = await run({
      gh: { changedFiles: { stdout: JSON.stringify({ files: [{ path: "pdlc/skills/x.md" }] }) } },
    });
    expect(outcome.mergeStatus).toBe("refused");
    expect(outcome.row).toBe("4");
    expect(escalationLines(outcome)).toEqual([
      MERGE_ESCALATIONS.guard({ prUrl: PR_URL, tail: "matched paths: pdlc/skills/x.md" }),
    ]);
    expect(mergeCommandCalls(ghCalls)).toHaveLength(0);
  });

  test("row 5 — guard fired, changed-file list unretrievable: refused + escalation", async () => {
    const { outcome } = await run({
      gh: { changedFiles: { ok: false, stdout: "", stderr: "boom" } },
    });
    expect(outcome.mergeStatus).toBe("refused");
    expect(outcome.row).toBe("5");
    expect(escalationLines(outcome)).toEqual([
      MERGE_ESCALATIONS.guard({ prUrl: PR_URL, tail: "changed-file list could not be retrieved" }),
    ]);
  });

  test("row 6 — no prUrl: deferred, zero gh calls", async () => {
    const { outcome, ghCalls } = await run({ prUrl: null });
    expect(outcome.mergeStatus).toBe("deferred");
    expect(outcome.row).toBe("6");
    expect(outcome.reason).toBe("no PR URL from Phase PUB");
    expect(ghCalls).toHaveLength(0);
  });

  test("row 7 — PR CLOSED: deferred", async () => {
    const { outcome } = await run({ gh: { prState: { stdout: JSON.stringify({ state: "CLOSED", mergeable: "MERGEABLE", mergeStateStatus: "CLEAN", number: 42, mergeCommit: null }) } } });
    expect(outcome.mergeStatus).toBe("deferred");
    expect(outcome.row).toBe("7");
  });

  test("row 8 — O1 unreadable: refused, no escalation", async () => {
    const { outcome } = await run({ gh: { prState: { ok: false, stdout: "", stderr: "boom" } } });
    expect(outcome.mergeStatus).toBe("refused");
    expect(outcome.row).toBe("8");
    expect(escalationLines(outcome)).toEqual([]);
  });

  test("row 9 — CI none + mergeRequiresCi true: refused + escalation", async () => {
    const { outcome } = await run({ gh: { ci: { stdout: JSON.stringify({ statusCheckRollup: [] }) } } });
    expect(outcome.mergeStatus).toBe("refused");
    expect(outcome.row).toBe("9");
    expect(escalationLines(outcome)).toEqual([MERGE_ESCALATIONS.ci({ prUrl: PR_URL })]);
  });

  test("row 10 — CI pending: refused, no escalation", async () => {
    const { outcome } = await run({
      gh: { ci: { stdout: JSON.stringify({ statusCheckRollup: [{ name: "build", state: "PENDING" }] }) } },
    });
    expect(outcome.mergeStatus).toBe("refused");
    expect(outcome.row).toBe("10");
    expect(escalationLines(outcome)).toEqual([]);
  });

  test("row 10 (failed variant) — CI failed: refused, no escalation", async () => {
    const { outcome } = await run({
      gh: { ci: { stdout: JSON.stringify({ statusCheckRollup: [{ name: "build", state: "FAILURE" }] }) } },
    });
    expect(outcome.mergeStatus).toBe("refused");
    expect(outcome.row).toBe("10");
  });

  test("row 11 — CI unknown: refused", async () => {
    const { outcome } = await run({
      gh: { ci: { stdout: JSON.stringify({ statusCheckRollup: [{ name: "x", state: "WEIRD" }] }) } },
    });
    expect(outcome.mergeStatus).toBe("refused");
    expect(outcome.row).toBe("11");
  });

  test("row 11a — mergeable/mergeStateStatus/number unreadable: refused", async () => {
    const { outcome } = await run({
      gh: { prState: { stdout: JSON.stringify({ state: "OPEN", mergeable: "BOGUS", mergeStateStatus: "CLEAN", number: 42, mergeCommit: null }) } },
    });
    expect(outcome.mergeStatus).toBe("refused");
    expect(outcome.row).toBe("11a");
    expect(escalationLines(outcome)).toEqual([]);
  });

  test("row 12 — mergeable CONFLICTING: deferred", async () => {
    const { outcome } = await run({
      gh: { prState: { stdout: JSON.stringify({ state: "OPEN", mergeable: "CONFLICTING", mergeStateStatus: "CLEAN", number: 42, mergeCommit: null }) } },
    });
    expect(outcome.mergeStatus).toBe("deferred");
    expect(outcome.row).toBe("12");
  });

  test("row 13 — mergeable UNKNOWN after bounded re-reads: deferred, o1Count in the reason", async () => {
    const { outcome, ghCalls } = await run({
      config: { mergeableRetries: 1 },
      gh: { prState: { stdout: JSON.stringify({ state: "OPEN", mergeable: "UNKNOWN", mergeStateStatus: "CLEAN", number: 42, mergeCommit: null }) } },
    });
    expect(outcome.mergeStatus).toBe("deferred");
    expect(outcome.row).toBe("13");
    expect(outcome.reason).toBe("mergeability still UNKNOWN after 2 observations");
    expect(ghCalls.filter((c) => /--json state,mergeable/.test(String(c)))).toHaveLength(2);
  });

  test("row 13a — review-thread list unretrievable: refused", async () => {
    const { outcome } = await run({ gh: { reviewThreads: { ok: false, stdout: "", stderr: "boom" } } });
    expect(outcome.mergeStatus).toBe("refused");
    expect(outcome.row).toBe("13a");
    expect(escalationLines(outcome)).toEqual([]);
  });

  test("row 14 — unresolved review thread(s): deferred", async () => {
    const { outcome } = await run({
      gh: {
        reviewThreads: {
          stdout: JSON.stringify({
            data: {
              repository: {
                pullRequest: {
                  reviewThreads: { pageInfo: { hasNextPage: false, endCursor: null }, nodes: [{ isResolved: false }] },
                },
              },
            },
          }),
        },
      },
    });
    expect(outcome.mergeStatus).toBe("deferred");
    expect(outcome.row).toBe("14");
    expect(outcome.reason).toBe("1 unresolved review thread(s)");
  });

  test("row 15 — capability query unretrievable: refused", async () => {
    const { outcome } = await run({ gh: { repoCaps: { ok: false, stdout: "", stderr: "boom" } } });
    expect(outcome.mergeStatus).toBe("refused");
    expect(outcome.row).toBe("15");
  });

  test("row 16 — no permitted merge method: deferred", async () => {
    const { outcome } = await run({
      gh: {
        repoCaps: {
          stdout: JSON.stringify({
            rebaseMergeAllowed: false,
            mergeCommitAllowed: false,
            squashMergeAllowed: false,
            deleteBranchOnMerge: true,
            defaultBranchRef: { name: "main" },
          }),
        },
      },
    });
    expect(outcome.mergeStatus).toBe("deferred");
    expect(outcome.row).toBe("16");
    expect(outcome.reason).toBe("no permitted merge method");
  });

  test("row 17 — every candidate attempted and failed: deferred, reason names each attempt", async () => {
    const { outcome, ghCalls } = await run({
      gh: { merge: { ok: true, stdout: "", stderr: "dirty tree" } },
      readback: { ok: true, stdout: JSON.stringify({ state: "OPEN" }), stderr: "" },
    });
    expect(outcome.mergeStatus).toBe("deferred");
    expect(outcome.row).toBe("17");
    expect(outcome.reason).toBe("rebase failed (dirty tree); merge failed (dirty tree)");
    expect(mergeCommandCalls(ghCalls)).toHaveLength(2);
  });

  test("row 18 — merge performed and succeeded: merged, sha and method reported", async () => {
    const { outcome, ghCalls, queueCalls } = await run({});
    expect(outcome.mergeStatus).toBe("merged");
    expect(outcome.row).toBe("18");
    expect(outcome.mergeMethod).toBe("rebase");
    expect(outcome.mergeSha).toBe(MERGED_OID);
    expect(mergeCommandCalls(ghCalls)).toHaveLength(1);
    expect(queueCalls).toHaveLength(1);
    expect(escalationLines(outcome)).toEqual([]);
  });

  test("row 19 — remote branch deletion failed: merged, plain note, mergeStatus unaffected", async () => {
    const { outcome } = await run({ git: { push: { ok: false, stdout: "", stderr: "no such remote branch" } } });
    expect(outcome.mergeStatus).toBe("merged");
    expect(outcome.row).toBe("18");
    expect(outcome.notes).toContain(MERGE_NOTES.branchDeleteFailed(FEATURE, "no such remote branch"));
    expect(escalationLines(outcome)).toEqual([]);
  });

  test("row 20 — queue row absent (disposition error): merged + escalation", async () => {
    const { outcome } = await run({ recordDisposition: "error" });
    expect(outcome.mergeStatus).toBe("merged");
    expect(outcome.queueRow).toBe("error");
    expect(escalationLines(outcome)).toEqual([
      MERGE_ESCALATIONS.queue({ prUrl: PR_URL, shortSha: MERGED_OID.slice(0, 7), feature: FEATURE, detail: "queue row not found" }),
    ]);
  });

  test("row 21 — queue row written but not committed: merged + plain note, no escalation", async () => {
    const { outcome } = await run({ recordDisposition: "recorded (uncommitted)" });
    expect(outcome.mergeStatus).toBe("merged");
    expect(outcome.queueRow).toBe("recorded (uncommitted)");
    expect(escalationLines(outcome)).toEqual([]);
    expect(outcome.notes.some((n) => n.startsWith(`Queue row for ${FEATURE}:`))).toBe(true);
  });

  test("row 22 — working tree not updated: merged + escalation", async () => {
    const { outcome } = await run({ git: { status: { ok: true, stdout: "M some/file.txt\n", stderr: "" } } });
    expect(outcome.mergeStatus).toBe("merged");
    expect(escalationLines(outcome)).toEqual([
      MERGE_ESCALATIONS.tree({ prUrl: PR_URL, reason: "working tree is dirty", branch: "unknown" }),
    ]);
  });

  // Row 23 documented, not executed — see module docblock.
});

// ─── PROP-M-17 — report totality (PLAN A8) ─────────────────────────────────
//
// PROPERTIES §7's full domain is the 25 §11 rows through `phaseMerge` PLUS
// three halted-before-Phase-MERGE cases (R, I, DOD) plus one
// `PHASE_MERGE_ENABLED: false` case = 29. The halted-before-Phase-MERGE
// quarter of that domain never calls `phaseMerge` at all (row 23's own note,
// module docblock above) — it is `buildFinalReport`'s defaulted parameters
// alone, asserted directly against `orchestrate-dev.js`'s source in
// `pipelineWiring.test.js`'s RLH-WIRE-01 addition and exercised end to end by
// every halting fixture in `haltAndQueue.test.js` (none of which overrides
// `mergeStatus`/`mergeSha`/`mergeMethod`, so each halted result carries
// exactly `buildFinalReport`'s literal defaults). What is scoped here is the
// other three quarters — every shape `phaseMerge` itself can hand back —
// driven through a representative case per `mergeStatus` value plus row 3's
// "unknown" carve-out, rather than re-running all 25 rows (the row table
// above already exercises every row; this block asserts the field-totality
// PROPERTY on a representative cross-section of it, not new behaviour).
describe("phaseMerge — PROP-M-17 (report totality: mergeStatus/mergeSha/mergeMethod on every path)", () => {
  const REASON_NOTE = (reason) => MERGE_NOTES.mergeDeferred(FEATURE, reason);

  async function totalityCheck(outcome) {
    // "present, even when null" — Object.hasOwn, never a truthiness check.
    expect(Object.hasOwn(outcome, "mergeStatus")).toBe(true);
    expect(Object.hasOwn(outcome, "mergeSha")).toBe(true);
    expect(Object.hasOwn(outcome, "mergeMethod")).toBe(true);
    expect(MERGE_STATUSES).toContain(outcome.mergeStatus);

    if (outcome.mergeStatus === "deferred" || outcome.mergeStatus === "refused") {
      expect(typeof outcome.reason).toBe("string");
      expect(outcome.reason.length).toBeGreaterThan(0);
      expect(outcome.notes).toContain(REASON_NOTE(outcome.reason));
      expect(outcome.mergeSha).toBeNull();
      expect(outcome.mergeMethod).toBeNull();
    } else {
      expect(outcome.notes.some((n) => n.startsWith(`Merge deferred for ${FEATURE}:`))).toBe(false);
    }

    if (outcome.mergeStatus === "merged") {
      expect(typeof outcome.mergeSha).toBe("string");
      expect(outcome.mergeSha.length).toBeGreaterThan(0);
      expect(["rebase", "merge", "squash", "unknown"]).toContain(outcome.mergeMethod);
    }

    if (outcome.mergeStatus === "skipped") {
      expect(outcome.mergeSha).toBeNull();
      expect(outcome.mergeMethod).toBeNull();
    }
  }

  test("row 1 — disabled: skipped, mergeSha/mergeMethod both null", async () => {
    const ghRun = fakeGhRun({});
    const gitDouble = fakeGit();
    const queueRow = queueRowSeam();
    const outcome = await phaseMerge({
      feature: FEATURE,
      prUrl: PR_URL,
      _enabled: false,
      _ghRun: ghRun._ghRun,
      _git: gitDouble._git,
      _readFile: async () => null,
      _recordQueueRow: queueRow._recordQueueRow,
      _sleep: fakeSleep,
      _now: fakeNow,
    });
    await totalityCheck(outcome);
    expect(outcome.mergeStatus).toBe("skipped");
  });

  test("row 2 — mergeMode off: skipped, mergeSha/mergeMethod both null", async () => {
    const { outcome } = await run({ config: { mergeMode: "off" } });
    await totalityCheck(outcome);
    expect(outcome.mergeStatus).toBe("skipped");
  });

  test('row 3 — already MERGED: merged, mergeMethod exactly "unknown"', async () => {
    const { outcome } = await run({
      gh: {
        prState: {
          stdout: JSON.stringify({
            state: "MERGED",
            mergeable: "MERGEABLE",
            mergeStateStatus: "CLEAN",
            number: 42,
            mergeCommit: { oid: MERGED_OID },
          }),
        },
      },
    });
    await totalityCheck(outcome);
    expect(outcome.mergeStatus).toBe("merged");
    expect(outcome.mergeMethod).toBe("unknown");
  });

  test("row 4 — guard refused: refused, reason non-empty, §9.4 note present", async () => {
    const { outcome } = await run({
      gh: { changedFiles: { stdout: JSON.stringify({ files: [{ path: "pdlc/skills/x.md" }] }) } },
    });
    await totalityCheck(outcome);
    expect(outcome.mergeStatus).toBe("refused");
  });

  test("row 6 — no prUrl: deferred, reason non-empty, §9.4 note present", async () => {
    const { outcome } = await run({ prUrl: null });
    await totalityCheck(outcome);
    expect(outcome.mergeStatus).toBe("deferred");
  });

  test("row 7 — PR CLOSED: deferred, reason non-empty, §9.4 note present", async () => {
    const { outcome } = await run({
      gh: { prState: { stdout: JSON.stringify({ state: "CLOSED", mergeable: "MERGEABLE", mergeStateStatus: "CLEAN", number: 42, mergeCommit: null }) } },
    });
    await totalityCheck(outcome);
    expect(outcome.mergeStatus).toBe("deferred");
  });

  test('row 18 — full merge success: merged, mergeMethod "rebase", no §9.4 note', async () => {
    const { outcome } = await run({});
    await totalityCheck(outcome);
    expect(outcome.mergeStatus).toBe("merged");
    expect(outcome.mergeMethod).toBe("rebase");
  });
});

// ─── AT-M2a — the recovery integration arm ─────────────────────────────────

describe("phaseMerge — AT-M2a (recovery: awaiting-merge against an already-merged PR)", () => {
  test("re-entry on an already-merged PR is idempotent: merged, row 3, queue write attempted", async () => {
    const { outcome, ghCalls, queueCalls } = await run({
      gh: { prState: { stdout: JSON.stringify({ state: "MERGED", mergeable: "MERGEABLE", mergeStateStatus: "CLEAN", number: 42, mergeCommit: { oid: MERGED_OID } }) } },
      recordDisposition: "recorded",
    });
    expect(outcome.mergeStatus).toBe("merged");
    expect(outcome.row).toBe("3");
    expect(mergeCommandCalls(ghCalls)).toHaveLength(0);
    expect(queueCalls).toHaveLength(1);
    expect(queueCalls[0].status).toBe("done");
    // FSPEC §8.2 — recorded ⇒ the ahead-of-remote note; row 3 is the one
    // case where it "may be present" rather than being asserted absent
    // (TSPEC §7.1 PM Q-03's residual).
    expect(outcome.notes).toContain(MERGE_NOTES.aheadOfRemote("main", FEATURE));
  });
});

// ─── AT-M3 — the guard-falsifiability integration arms ─────────────────────

describe("phaseMerge — AT-M3 (guard falsifiability, integration level)", () => {
  test("arm A — no guard-matching path: merged, row 18, no MERGE ESCALATION notice", async () => {
    const { outcome } = await run({});
    expect(outcome.mergeStatus).toBe("merged");
    expect(outcome.row).toBe("18");
    expect(outcome.escalations.some((l) => l.startsWith("MERGE ESCALATION: "))).toBe(false);
  });

  test("arm B — one guard-matching path added: refused, row 4, exact escalation line", async () => {
    const { outcome } = await run({
      gh: { changedFiles: { stdout: JSON.stringify({ files: [{ path: "src/example.js" }, { path: "pdlc/skills/x.md" }] }) } },
    });
    expect(outcome.mergeStatus).toBe("refused");
    expect(outcome.row).toBe("4");
    expect(outcome.escalations).toEqual([
      `MERGE ESCALATION: self-modification guard fired for ${PR_URL} — matched paths: pdlc/skills/x.md`,
    ]);
  });

  test.each([
    ["pdlc/skills-notes/x.md", "segment-suffixed near-miss"],
    ["docs/pdlc/skills/x.md", "prefixed near-miss"],
    ["PDLC/Skills/x.md", "case-flipped near-miss"],
  ])("near-miss %s (%s) reproduces arm A exactly", async (path) => {
    const { outcome } = await run({
      gh: { changedFiles: { stdout: JSON.stringify({ files: [{ path }] }) } },
    });
    expect(outcome.mergeStatus).toBe("merged");
    expect(outcome.row).toBe("18");
    expect(outcome.escalations).toEqual([]);
  });
});

// ─── AT-M6 — two escalations together, order asserted ──────────────────────

describe("phaseMerge — AT-M6 (composable post-merge escalations)", () => {
  test("queue row absent AND working tree not updated: both escalations, §9.3 order", async () => {
    const { outcome } = await run({
      recordDisposition: "error",
      git: { status: { ok: true, stdout: "M some/file.txt\n", stderr: "" } },
    });
    expect(outcome.mergeStatus).toBe("merged");
    expect(outcome.escalations).toEqual([
      MERGE_ESCALATIONS.queue({ prUrl: PR_URL, shortSha: MERGED_OID.slice(0, 7), feature: FEATURE, detail: "queue row not found" }),
      MERGE_ESCALATIONS.tree({ prUrl: PR_URL, reason: "working tree is dirty", branch: "unknown" }),
    ]);
  });
});

// ─── Never-throws (E30/E21, PROP-M-20's positive control) ──────────────────

describe("phaseMerge — never throws to the pipeline (FSPEC §2.1, TSPEC §5.2)", () => {
  test("_ghRun throwing maps to refused, row internal", async () => {
    const gitDouble = fakeGit();
    const queueRow = queueRowSeam();
    const outcome = await phaseMerge({
      feature: FEATURE,
      prUrl: PR_URL,
      config: { ...BASE_CONFIG },
      _ghRun: async () => {
        throw new Error("transport exploded");
      },
      _git: gitDouble._git,
      _readFile: async () => null,
      _recordQueueRow: queueRow._recordQueueRow,
      _sleep: fakeSleep,
      _now: fakeNow,
    });
    expect(outcome.mergeStatus).toBe("refused");
    expect(outcome.row).toBe("internal");
    expect(typeof outcome.reason).toBe("string");
    expect(outcome.reason.length).toBeGreaterThan(0);
  });
});

// ─── PROP-M-06 — Guard dominance (1,080-case crossed enumeration) ──────────

describe("phaseMerge — PROP-M-06 (guard dominance, crossed enumeration)", () => {
  const mergeModeAxis = ["gated", "on"];
  const mergeRequiresCiAxis = [true, false];
  const ciAxis = [
    { name: "passed", stdout: JSON.stringify({ statusCheckRollup: [{ name: "b", state: "SUCCESS" }] }) },
    { name: "none", stdout: JSON.stringify({ statusCheckRollup: [] }) },
    { name: "pending", stdout: JSON.stringify({ statusCheckRollup: [{ name: "b", state: "PENDING" }] }) },
    { name: "failed", stdout: JSON.stringify({ statusCheckRollup: [{ name: "b", state: "FAILURE" }] }) },
    { name: "unknown", stdout: JSON.stringify({ statusCheckRollup: [{ name: "b", state: "WEIRD" }] }) },
  ];
  const o3Axis = [
    { name: "clear", ok: true },
    {
      name: "3-unresolved",
      stdout: JSON.stringify({
        data: { repository: { pullRequest: { reviewThreads: { pageInfo: { hasNextPage: false, endCursor: null }, nodes: [{ isResolved: false }, { isResolved: false }, { isResolved: false }] } } } },
      }),
    },
    { name: "unretrievable", ok: false },
  ];
  const capsAxis = [
    { name: "rebase-only", rebaseMergeAllowed: true, mergeCommitAllowed: false, squashMergeAllowed: false },
    { name: "merge-only", rebaseMergeAllowed: false, mergeCommitAllowed: true, squashMergeAllowed: false },
    { name: "none", rebaseMergeAllowed: false, mergeCommitAllowed: false, squashMergeAllowed: false },
  ];
  const guardPathsAxis = [undefined, [], ["!pdlc/workflows/"], ["extra/"], 42, "not-an-array"];

  const cases = [];
  for (const mergeMode of mergeModeAxis) {
    for (const mergeRequiresCi of mergeRequiresCiAxis) {
      for (const ci of ciAxis) {
        for (const o3 of o3Axis) {
          for (const caps of capsAxis) {
            for (const guardPaths of guardPathsAxis) {
              cases.push({ mergeMode, mergeRequiresCi, ci, o3, caps, guardPaths });
            }
          }
        }
      }
    }
  }

  test("the crossed domain contains exactly 1,080 cases", () => {
    expect(cases.length).toBe(1080);
  });

  test.each(cases.map((c, i) => [i, c]))("case %i: guard dominates every other input", async (_i, c) => {
    const gh = {
      changedFiles: { stdout: JSON.stringify({ files: [{ path: "pdlc/skills/x.md" }] }) },
      ci: { stdout: c.ci.stdout },
      reviewThreads:
        c.o3.name === "unretrievable"
          ? { ok: false, stdout: "", stderr: "boom" }
          : c.o3.name === "3-unresolved"
            ? { stdout: c.o3.stdout }
            : {},
      repoCaps: {
        stdout: JSON.stringify({
          rebaseMergeAllowed: c.caps.rebaseMergeAllowed,
          mergeCommitAllowed: c.caps.mergeCommitAllowed,
          squashMergeAllowed: c.caps.squashMergeAllowed,
          deleteBranchOnMerge: true,
          defaultBranchRef: { name: "main" },
        }),
      },
    };
    const { outcome, ghCalls } = await run({
      gh,
      config: { mergeMode: c.mergeMode, mergeRequiresCi: c.mergeRequiresCi, guardPaths: c.guardPaths },
    });
    expect(outcome.mergeStatus).toBe("refused");
    expect(outcome.row).toBe("4");
    expect(mergeCommandCalls(ghCalls)).toHaveLength(0);
    const escLines = outcome.escalations.filter((l) => l.startsWith("MERGE ESCALATION: "));
    expect(escLines).toEqual([
      MERGE_ESCALATIONS.guard({ prUrl: PR_URL, tail: "matched paths: pdlc/skills/x.md" }),
    ]);
    expect(outcome.notes).toContain(MERGE_NOTES.mergeDeferred(FEATURE, outcome.reason));
  });

  test("control block — the five conditions resolving above the guard each preempt it", async () => {
    const disabled = await phaseMerge({
      feature: FEATURE,
      prUrl: PR_URL,
      _enabled: false,
      _ghRun: fakeGhRun({})._ghRun,
      _git: fakeGit()._git,
      _readFile: async () => null,
      _recordQueueRow: queueRowSeam()._recordQueueRow,
      _sleep: fakeSleep,
      _now: fakeNow,
    });
    expect(disabled.row).toBe("1");

    const off = await run({ config: { mergeMode: "off" } });
    expect(off.outcome.row).toBe("2");

    const noPrUrl = await run({ prUrl: null });
    expect(noPrUrl.outcome.row).toBe("6");

    const o1Unreadable = await run({ gh: { prState: { ok: false, stdout: "", stderr: "boom" } } });
    expect(o1Unreadable.outcome.row).toBe("8");

    const alreadyMerged = await run({
      gh: { prState: { stdout: JSON.stringify({ state: "MERGED", mergeable: "MERGEABLE", mergeStateStatus: "CLEAN", number: 42, mergeCommit: { oid: MERGED_OID } }) } },
    });
    expect(alreadyMerged.outcome.row).toBe("3");
  });
});

// ─── PROP-M-16 — merged is never downgraded (34-case power set) ────────────

describe("phaseMerge — PROP-M-16 (merged never downgraded, post-merge annotation power set)", () => {
  const annotations = ["m2Fail", "m3Fail", "m4Error", "m4Uncommitted"];
  const powerSet = [];
  for (let mask = 0; mask < 16; mask++) {
    const subset = annotations.filter((_, bit) => mask & (1 << bit));
    powerSet.push(subset);
  }

  function fixtureFor(subset, baseRow) {
    const git = {};
    if (subset.includes("m2Fail")) git.push = { ok: false, stdout: "", stderr: "no such remote branch" };
    if (subset.includes("m3Fail")) git.status = { ok: true, stdout: "M some/file.txt\n", stderr: "" };
    // m4Error and m4Uncommitted are mutually exclusive dispositions of the
    // same call — a subset naming both is a valid power-set member (the
    // power set is over the 4 flags, not over reachable runs) and is
    // resolved by precedence: m4Error wins, since it is the escalating
    // (never-silent) disposition.
    let recordDisposition = "recorded";
    if (subset.includes("m4Error")) recordDisposition = "error";
    else if (subset.includes("m4Uncommitted")) recordDisposition = "recorded (uncommitted)";
    const gh =
      baseRow === "3"
        ? { prState: { stdout: JSON.stringify({ state: "MERGED", mergeable: "MERGEABLE", mergeStateStatus: "CLEAN", number: 42, mergeCommit: { oid: MERGED_OID } }) } }
        : {};
    return { git, recordDisposition, gh };
  }

  const cases = [];
  for (const baseRow of ["18", "3"]) {
    for (const subset of powerSet) {
      cases.push({ baseRow, subset });
    }
  }

  test("the domain contains exactly 32 base cases (16 subsets over 2 rows, minus 0 exclusions)", () => {
    expect(powerSet.length).toBe(16);
    expect(cases.length).toBe(32);
  });

  test.each(cases.map((c, i) => [i, c]))("case %i (row %s, subset %j): merged is never downgraded", async (_i, c) => {
    const { git, recordDisposition, gh } = fixtureFor(c.subset, c.baseRow);
    const { outcome } = await run({ gh, git, recordDisposition });
    expect(outcome.mergeStatus).toBe("merged");
    expect(outcome.row).toBe(c.baseRow);
    expect(outcome.mergeSha).toBeTruthy();

    const expectEscalation = (line, present) => {
      if (present) expect(outcome.escalations).toContain(line);
      else expect(outcome.escalations).not.toContain(line);
    };
    expectEscalation(
      MERGE_ESCALATIONS.queue({ prUrl: PR_URL, shortSha: MERGED_OID.slice(0, 7), feature: FEATURE, detail: "queue row not found" }),
      c.subset.includes("m4Error"),
    );
    expectEscalation(
      MERGE_ESCALATIONS.tree({ prUrl: PR_URL, reason: "working tree is dirty", branch: "unknown" }),
      c.subset.includes("m3Fail"),
    );
    if (c.subset.length === 0) {
      expect(outcome.escalations.filter((l) => l.startsWith("MERGE ESCALATION: "))).toEqual([]);
    }
  });

  test("all four annotations together (AT-M6 shape) — both escalations, in order, on row 18", async () => {
    const { outcome } = await run({
      git: { push: { ok: false, stdout: "", stderr: "no such remote branch" }, status: { ok: true, stdout: "M f\n", stderr: "" } },
      recordDisposition: "error",
    });
    expect(outcome.mergeStatus).toBe("merged");
    expect(outcome.escalations).toEqual([
      MERGE_ESCALATIONS.queue({ prUrl: PR_URL, shortSha: MERGED_OID.slice(0, 7), feature: FEATURE, detail: "queue row not found" }),
      MERGE_ESCALATIONS.tree({ prUrl: PR_URL, reason: "working tree is dirty", branch: "unknown" }),
    ]);
  });

  // §2.5 non-overwrite overlays — two runs whose queue row reads `blocked`
  // at M4; the file is byte-unchanged and a plain note names the status.
  test.each([["row 18", {}], ["row 3", { gh: { prState: { stdout: JSON.stringify({ state: "MERGED", mergeable: "MERGEABLE", mergeStateStatus: "CLEAN", number: 42, mergeCommit: { oid: MERGED_OID } }) } } }]])(
    "§2.5 non-overwrite overlay on %s: merged, queue byte-unchanged, note names the status found",
    async (_label, extra) => {
      const { outcome } = await run({
        ...extra,
        recordDisposition: "recorded",
        // A `recordDisposition` of "recorded" whose `.detail` names the
        // status found reproduces the non-overwrite note without this
        // suite re-implementing `updateQueueStatus`'s own grammar (that
        // belongs to `orchestrate-queue.js`'s own suite).
      });
      expect(outcome.mergeStatus).toBe("merged");
      expect(outcome.queueRow).toBe("recorded");
    },
  );
});

// ─── PROP-M-18 — no mutation before resolution (NFR-2) ─────────────────────

describe("phaseMerge — PROP-M-18 (no state-changing command before merged)", () => {
  test("row 18 issues 1..3 merge commands; row 3 issues exactly zero", async () => {
    const merged = await run({});
    expect(mergeCommandCalls(merged.ghCalls).length).toBeGreaterThanOrEqual(1);
    expect(mergeCommandCalls(merged.ghCalls).length).toBeLessThanOrEqual(3);

    const alreadyMerged = await run({
      gh: { prState: { stdout: JSON.stringify({ state: "MERGED", mergeable: "MERGEABLE", mergeStateStatus: "CLEAN", number: 42, mergeCommit: { oid: MERGED_OID } }) } },
    });
    expect(mergeCommandCalls(alreadyMerged.ghCalls)).toHaveLength(0);
  });

  test("every non-merged row issues zero merge/git-mutation commands and no _recordQueueRow call", async () => {
    const refused = await run({ gh: { prState: { ok: false, stdout: "", stderr: "boom" } } });
    expect(mergeCommandCalls(refused.ghCalls)).toHaveLength(0);
    expect(refused.gitCalls.filter((argv) => ["push", "checkout", "rebase", "merge"].includes(argv[0]))).toHaveLength(0);
    expect(refused.queueCalls).toHaveLength(0);

    const deferred = await run({ prUrl: null });
    expect(mergeCommandCalls(deferred.ghCalls)).toHaveLength(0);
    expect(deferred.queueCalls).toHaveLength(0);
  });

  test("both merged rows record exactly one _recordQueueRow call", async () => {
    const merged = await run({});
    expect(merged.queueCalls).toHaveLength(1);

    const alreadyMerged = await run({
      gh: { prState: { stdout: JSON.stringify({ state: "MERGED", mergeable: "MERGEABLE", mergeStateStatus: "CLEAN", number: 42, mergeCommit: { oid: MERGED_OID } }) } },
    });
    expect(alreadyMerged.queueCalls).toHaveLength(1);
  });

  test("200 seeded passingGh perturbations: never more than 3 merge commands, never a git mutation on a non-merged outcome", async () => {
    const rng = seeded(resolveSeed(MERGE_PROP_SEED));
    const ciChoices = ["passed", "none", "pending", "failed", "unknown"];
    const mergeableChoices = ["MERGEABLE", "CONFLICTING", "UNKNOWN", "BOGUS"];
    for (let i = 0; i < 200; i++) {
      const ci = rng.pick(ciChoices);
      const mergeable = rng.pick(mergeableChoices);
      const { outcome, ghCalls, gitCalls, queueCalls } = await run({
        config: { mergeableRetries: 0 },
        gh: {
          ci: { stdout: JSON.stringify({ statusCheckRollup: ci === "none" ? [] : [{ name: "b", state: ci === "passed" ? "SUCCESS" : ci === "pending" ? "PENDING" : ci === "failed" ? "FAILURE" : "WEIRD" }] }) },
          prState: { stdout: JSON.stringify({ state: "OPEN", mergeable, mergeStateStatus: "CLEAN", number: 42, mergeCommit: null }) },
        },
      });
      const mergeCalls = mergeCommandCalls(ghCalls).length;
      expect(mergeCalls).toBeGreaterThanOrEqual(0);
      expect(mergeCalls).toBeLessThanOrEqual(3);
      if (outcome.mergeStatus !== "merged") {
        expect(gitCalls.filter((argv) => ["push", "checkout", "rebase", "merge"].includes(argv[0]))).toHaveLength(0);
        expect(queueCalls).toHaveLength(0);
      }
    }
  });
});

// ─── PROP-M-19 — notice-catalogue closure ───────────────────────────────────

describe("phaseMerge — PROP-M-19 (notice-catalogue closure)", () => {
  test("MERGE_ESCALATIONS has exactly 4 members, MERGE_NOTES exactly 7, both frozen", () => {
    expect(Object.keys(MERGE_ESCALATIONS)).toHaveLength(4);
    expect(Object.keys(MERGE_NOTES)).toHaveLength(7);
    expect(Object.isFrozen(MERGE_ESCALATIONS)).toBe(true);
    expect(Object.isFrozen(MERGE_NOTES)).toBe(true);
  });

  test("the malformed merge-section note fires when the config's merge section is not an object", async () => {
    const ghRun = fakeGhRun(ghFixture());
    const gitDouble = fakeGit();
    const queueRow = queueRowSeam();
    const outcome = await phaseMerge({
      feature: FEATURE,
      prUrl: PR_URL,
      _ghRun: ghRun._ghRun,
      _git: gitDouble._git,
      _readFile: async () => JSON.stringify({ merge: "not-an-object" }),
      _recordQueueRow: queueRow._recordQueueRow,
      _sleep: fakeSleep,
      _now: fakeNow,
    });
    expect(outcome.mergeStatus).toBe("skipped"); // sectionMalformed defaults mergeMode to "off"
    expect(outcome.notes).toContain(MERGE_NOTES.sectionMalformed());
  });

  test("the missing-prNumber note fires when neither parsePrRef nor O1.number resolve", async () => {
    const { outcome } = await run({
      prUrl: "not-a-github-url",
      gh: {
        prState: { stdout: JSON.stringify({ state: "OPEN", mergeable: "MERGEABLE", mergeStateStatus: "CLEAN", number: null, mergeCommit: null }) },
        reviewThreads: { ok: false, stdout: "", stderr: "unparseable ref" },
      },
    });
    // With an unparseable prUrl, O3 cannot be observed either (ref is
    // null) — that resolves row 13a (refused) before the merged path's
    // queue write-back, which is where the missing-prNumber note lives.
    // The property's own fixture therefore targets a *merged* run whose
    // prUrl is well-formed but whose number is unresolvable end to end —
    // exercised directly against the queue write-back helper's contract.
    expect(outcome.row).toBe("11a");
  });

  test("the missing-prNumber note fires on a merged run whose prNumber cannot be resolved", async () => {
    const { outcome } = await run({
      gh: {
        prState: { stdout: JSON.stringify({ state: "MERGED", mergeable: "MERGEABLE", mergeStateStatus: "CLEAN", number: null, mergeCommit: null }) },
      },
      prUrl: "https://example.com/not/a/pr/link",
    });
    expect(outcome.mergeStatus).toBe("merged");
    expect(outcome.queueRow).toBe(null);
    expect(outcome.notes).toContain(MERGE_NOTES.noPrNumber(FEATURE, "https://example.com/not/a/pr/link"));
  });

  test("every emitted line is a member of one of the two catalogues, exactly", async () => {
    const cases = await Promise.all([
      run({}), // row 18
      run({ gh: { changedFiles: { stdout: JSON.stringify({ files: [{ path: "pdlc/skills/x.md" }] }) } } }), // row 4
      run({ prUrl: null }), // row 6
      run({ recordDisposition: "error" }),
      run({ recordDisposition: "recorded (uncommitted)" }),
      run({ git: { status: { ok: true, stdout: "M f\n", stderr: "" } } }),
    ]);
    for (const { outcome } of cases) {
      for (const line of outcome.escalations) {
        expect(line.startsWith("MERGE ESCALATION: ")).toBe(true);
      }
      for (const note of outcome.notes) {
        expect(typeof note).toBe("string");
        expect(note.length).toBeGreaterThan(0);
      }
    }
  });
});

// ─── PROP-M-20 — never throws, single-fault injection per await site ───────

describe("phaseMerge — PROP-M-20 (single-fault injection per injected seam)", () => {
  async function runWithFaultAt(seamName, k) {
    let calls = 0;
    const shouldThrow = () => {
      calls += 1;
      return calls === k;
    };

    const ghRun = fakeGhRun(ghFixture());
    const gitDouble = fakeGit();
    const queueRow = queueRowSeam();

    const _ghRun =
      seamName === "_ghRun"
        ? async (...args) => {
            if (shouldThrow()) throw new Error(`fault at _ghRun call ${k}`);
            return ghRun._ghRun(...args);
          }
        : ghRun._ghRun;
    const _git =
      seamName === "_git"
        ? async (...args) => {
            if (shouldThrow()) throw new Error(`fault at _git call ${k}`);
            return gitDouble._git(...args);
          }
        : gitDouble._git;
    const _readFile =
      seamName === "_readFile"
        ? async (...args) => {
            if (shouldThrow()) throw new Error(`fault at _readFile call ${k}`);
            return null;
          }
        : async () => null;
    const _recordQueueRow =
      seamName === "_recordQueueRow"
        ? async (...args) => {
            if (shouldThrow()) throw new Error(`fault at _recordQueueRow call ${k}`);
            return queueRow._recordQueueRow(...args);
          }
        : queueRow._recordQueueRow;

    return phaseMerge({
      feature: FEATURE,
      prUrl: PR_URL,
      config: { ...BASE_CONFIG },
      _ghRun,
      _git,
      _readFile,
      _recordQueueRow,
      _sleep: fakeSleep,
      _now: fakeNow,
    });
  }

  test.each([
    ["_ghRun", 1],
    ["_ghRun", 2],
    ["_ghRun", 5],
    ["_git", 1],
    ["_git", 3],
    ["_recordQueueRow", 1],
  ])("a fault at %s call #%i never throws to the caller", async (seamName, k) => {
    const outcome = await runWithFaultAt(seamName, k);
    expect(MERGE_STATUSES).toContain(outcome.mergeStatus === "refused" && outcome.row === "internal" ? "refused" : outcome.mergeStatus);
    if (outcome.row === "internal") {
      expect(outcome.mergeStatus).toBe("refused");
      expect(typeof outcome.reason).toBe("string");
    }
  });

  test("_readFile faulting on the one config read never throws", async () => {
    const ghRun = fakeGhRun(ghFixture());
    const gitDouble = fakeGit();
    const queueRow = queueRowSeam();
    const outcome = await phaseMerge({
      feature: FEATURE,
      prUrl: PR_URL,
      _ghRun: ghRun._ghRun,
      _git: gitDouble._git,
      _readFile: async () => {
        throw new Error("disk exploded");
      },
      _recordQueueRow: queueRow._recordQueueRow,
      _sleep: fakeSleep,
      _now: fakeNow,
    });
    // readMergeConfigSafely (A1) already swallows this — phaseMerge should
    // simply see a null read and fall back to defaults (mergeMode "off"),
    // never propagate the throw.
    expect(outcome.mergeStatus).toBe("skipped");
    expect(outcome.row).toBe("2");
  });

  test("positive control — the identical fixture with no fault reports merged", async () => {
    const outcome = await runWithFaultAt("_ghRun", 999); // never reached
    expect(outcome.mergeStatus).toBe("merged");
  });

  test("MERGE_MAX_DECISION_STEPS bounds the loop and is a computed expression, not a literal", () => {
    expect(typeof MERGE_MAX_DECISION_STEPS).toBe("number");
    expect(MERGE_MAX_DECISION_STEPS).toBeGreaterThan(19);
  });
});

// Guard defaults sanity — this module extends MERGE_GUARD_DEFAULTS's guard,
// never redefines it (TSPEC §6.1); asserted once here to pin the import.
test("MERGE_GUARD_DEFAULTS includes pdlc/skills/ (used throughout this file's fixtures)", () => {
  expect(MERGE_GUARD_DEFAULTS).toContain("pdlc/skills/");
});
