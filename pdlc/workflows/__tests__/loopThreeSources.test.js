// loopThreeSources.test.js — PLAN P5-05 (pdlc-engineering-loop, depends on P5-04, P3-08).
//
// AT-18 — the three-source oracle. One scripted session drives all three ESCALATIONS.md append
// sites — the advisory-seam driver (`runAdvisorySeam`), the merge-refusal site (`phaseMerge`),
// and the pipeline-halt site (queue's `main`) — through ONE shared `_appendFile` collector
// (`makeAppendFile`, PLAN P0-01, `helpers/loopDoubles.js`). Oracle: set-equality between the
// `sourceLabel`s parsed back out of the collected log and the literal three-member set
// {advisory-seam, merge-refusal, pipeline-halt}. Non-vacuity: the collector is asserted
// non-empty, and each append is attributed to its own call site (exactly three entries, one per
// label — not one call site's append silently absorbing another's).
//
// `sourceLabel` derivation: `parseEscalationLog` (`../lib/escalation-view.mjs`) parses each
// block into `{kind: "advisory"|"non-advisory", seam, source, ...}` — an advisory block's own
// `source` field is `null` (its identifying field is `seam`, e.g. "A2"), never the literal string
// "advisory-seam". That categorical label is this oracle's own classification of
// `kind === "advisory"`, not an echo of anything production code writes — the two non-advisory
// labels ("merge-refusal", "pipeline-halt") ARE the literal `ctx.source` values the real call
// sites pass (PLAN P3-08, P5-04), read back off the parsed entry's `source` field.
//
// Every fixture piece below is drawn from the shipped, canonical doubles — no locally-built
// `SeamOps` literal, no re-authored `_ghRun`/`_git` fake, no re-declared queue/REQ fixture shape:
// `helpers/loopDoubles.js` (P0-01: the shared `_appendFile` collector, `makeReadFileFn`),
// `helpers/mergeDoubles.js` (the merge-phase gh/git/queue-row doubles, mirroring
// `loopMergeEscalation.test.js`'s own `runMerge`), and `helpers/advisoryDoubles.js` (the seam
// driver doubles, mirroring `advisoryDriver.test.js`'s "malformed-verdict" fixture).

import { phaseMerge, runAdvisorySeam } from "../orchestrate-dev.js";
import main, { DEFAULT_QUEUE_PATH } from "../orchestrate-queue.js";
import { parseEscalationLog } from "../lib/escalation-view.mjs";
import { makeAppendFile, makeReadFileFn } from "./helpers/loopDoubles.js";
import { fakeGhRun, fakeGit, passingGh, recordingRecordQueueRow, fakeSleep, fakeNow } from "./helpers/mergeDoubles.js";
import { makeSeamOps, makeAdvisoryConfig, makeAgentDouble } from "./helpers/advisoryDoubles.js";

// The one artifact path TSPEC §10.1 names — transcribed as a literal, matching every sibling
// escalation-log test file, since it is not exported as a named constant.
const ESCALATIONS_PATH = "docs/_queue/ESCALATIONS.md";

const FEATURE = "three-sources-fixture";

const PR_URL = "https://github.com/acme/widgets/pull/42";
const MERGE_READBACK_KEY = "gh pr view --json mergeCommit,state";
const MERGED_OID = "abc1234567890abcdef";

const BASE_MERGE_CONFIG = Object.freeze({
  mergeMode: "gated",
  mergeRequiresCi: true,
  allowSquashMerge: false,
  deleteBranchOnPdlcMerge: true,
  mergeableRetries: 3,
  mergeableRetryDelay: 0,
  guardPaths: [],
});

const READY_REQ = "---\nready: true\n---\n# REQ body\n";
const ONE_FEATURE_QUEUE =
  "| Order | Status | Feature | REQ Path | Depends-On |\n" +
  "| --- | --- | --- | --- | --- |\n" +
  "| 1 | pending | upstream-feature | docs/upstream-feature/REQ-upstream-feature.md | - |";

// `_recordQueueRow(feature, status, evidence)` positional shape (`mergeDoubles.js`) vs.
// `phaseMerge`'s own `_recordQueueRow({feature, status, evidence})` object-arg call convention —
// the same adapting wrapper `loopMergeEscalation.test.js`'s `queueRowSeam` uses.
function queueRowSeam(disposition = "recorded") {
  const shared = recordingRecordQueueRow(disposition);
  const _recordQueueRow = async ({ feature, status, evidence }) => {
    const queueRow = await shared._recordQueueRow(feature, status, evidence);
    return { queueRow };
  };
  return { calls: shared.calls, _recordQueueRow };
}

describe("AT-18 — three-source oracle: advisory-seam, merge-refusal and pipeline-halt share one append log", () => {
  it("one scripted session drives all three append sites through one _appendFile collector", async () => {
    const append = makeAppendFile();

    // ── Site 1: advisory-seam refusal — real `runAdvisorySeam`, single-attempt budget, one
    // unparseable reply (mirrors advisoryDriver.test.js's "malformed-verdict" fixture). Its own
    // `terminate()` step (dev:4836) calls `appendEscalationEntry` with `ctx.seam` set — the
    // production call site this row proves goes through the same shared log.
    const advisoryConfig = makeAdvisoryConfig({ enabled: true, attemptBudget: 1 }).config;
    const seamOps = makeSeamOps({
      permittedActions: ["rewrite-citation"],
      declaredScope: ["owned/path.js"],
    });
    const advisoryAgent = makeAgentDouble({ script: ["not a verdict at all, just agent prose"] });

    const advisoryDisposition = await runAdvisorySeam({
      seam: "A2",
      feature: FEATURE,
      seamOps,
      config: advisoryConfig,
      rungState: { resolved: null },
      _agent: advisoryAgent,
      _appendFile: append._appendFile,
      _writeFile: async () => {},
      _readFile: async () => null,
      _git: async () => ({ ok: true, stdout: "", stderr: "" }),
      _log: () => {},
      _now: fakeNow,
      _notice: () => {},
    });
    // Non-vacuity precondition: the seam actually escalated (the branch that appends), not the
    // no-action/resolved branches that never touch `_appendFile` at all.
    expect(advisoryDisposition.outcome).toBe("escalated");

    // ── Site 2: merge refusal — real `phaseMerge`, the queue-not-updated site (PROP-ESC-08 row
    // 1, mirroring loopMergeEscalation.test.js's `runMerge` with `recordDisposition: "error"`).
    const ghRun = fakeGhRun({
      ...passingGh({}),
      [MERGE_READBACK_KEY]: {
        ok: true,
        stdout: JSON.stringify({ state: "MERGED", mergeCommit: { oid: MERGED_OID } }),
        stderr: "",
      },
    });
    const gitDouble = fakeGit({});
    const queueRow = queueRowSeam("error");

    const mergeOutcome = await phaseMerge({
      feature: FEATURE,
      prUrl: PR_URL,
      config: BASE_MERGE_CONFIG,
      _ghRun: ghRun._ghRun,
      _git: gitDouble._git,
      _readFile: async () => {
        throw new Error("_readFile should not be called — config supplied directly");
      },
      _recordQueueRow: queueRow._recordQueueRow,
      _sleep: fakeSleep,
      _now: fakeNow,
      _appendFile: append._appendFile,
    });
    // Non-vacuity precondition: the scripted queue-row failure actually produced a merge
    // escalation (the branch that appends), not a silent pass-through.
    expect(mergeOutcome.escalations.length).toBeGreaterThan(0);

    // ── Site 3: pipeline halt — real queue `main`, `_runPipeline` scripted to fail so `main`
    // rewrites the row `halted` and appends at its own halt site (`ctx.source = "pipeline-halt"`,
    // PLAN P5-04), mirroring loopQueueDriver.test.js's `driveHalt`.
    const { readFileFn } = makeReadFileFn({
      [DEFAULT_QUEUE_PATH]: ONE_FEATURE_QUEUE,
      "docs/upstream-feature/REQ-upstream-feature.md": READY_REQ,
    });

    const queueReport = await main({
      _log: () => {},
      _phase: () => {},
      _agent: async () => "TRIAGE: ready",
      _readFile: readFileFn,
      _writeFile: async () => {},
      _appendFile: append._appendFile,
      _git: async () => ({ ok: true, stdout: "", stderr: "" }),
      _runPipeline: async () => ({ outcome: "failure", haltReason: "scripted pipeline failure" }),
    });
    // Non-vacuity precondition: the scripted pipeline failure actually halted the session (the
    // branch that appends), not the success path.
    expect(queueReport.outcome).toBe("halted");

    // ── Non-vacuity conjunct 1: the shared collector actually collected something.
    expect(append.calls.length).toBeGreaterThan(0);

    // ── The oracle: set-equality between the parsed-back sourceLabels and the literal
    // three-member set.
    const { entries } = parseEscalationLog(append.text(ESCALATIONS_PATH));
    const sourceLabelOf = (entry) => (entry.kind === "advisory" ? "advisory-seam" : entry.source);
    const labels = entries.map(sourceLabelOf);

    expect(new Set(labels)).toEqual(new Set(["advisory-seam", "merge-refusal", "pipeline-halt"]));

    // ── Non-vacuity conjunct 2: each append is attributed to its own call site — exactly three
    // entries, one per label, not one call site's append silently absorbing another's.
    expect(entries).toHaveLength(3);
    expect(labels.filter((l) => l === "advisory-seam")).toHaveLength(1);
    expect(labels.filter((l) => l === "merge-refusal")).toHaveLength(1);
    expect(labels.filter((l) => l === "pipeline-halt")).toHaveLength(1);
  });
});
