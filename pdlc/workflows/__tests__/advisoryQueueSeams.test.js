// advisoryQueueSeams.test.js — PLAN A-12 (batch 4, depends on A-02).
//
// RED (authored as three `describe.skip` blocks, each un-skipped by a different 🟢 owner, per
// PLAN §3's un-skipper rule — no block is un-skipped before the symbols its cases exercise
// exist):
//
//   - `A-29 — seam-token routing`   (batch 10) — lands the `[SEAM:A1]`/`[SEAM:A2]` grammar on
//                                                  `triagePrompt`, `parseTriageVerdict`'s third
//                                                  return field, and `hasResidualSeamToken`.
//   - `A-30 — queue wiring + A1`    (batch 11) — lands `main`'s `_appendFile`/`_runAdvisorySeam`/
//                                                  `_readAdvisoryConfig` free identifiers, the
//                                                  `needs-human` routing, `honourA1Verdict` and
//                                                  A1's `SeamOps`.
//   - `A-31 — A2 seam + summary`    (batch 12) — lands A2's `SeamOps` and `buildQueueReport`'s
//                                                  advisory summary.
//
// This file owns FSPEC T-04-1 … T-04-9 and T-04-3b (REQ-ADV-05, AC-5.1…AC-5.5) and PROPERTIES
// PROP-A12-01/03/04, PROP-A1-01…06, PROP-A2-01…08 (PROPERTIES §6, "Home: advisoryQueueSeams.test.js").
//
// **Interpretive/contract-fixing decisions this RED task makes** (documented here per this
// project's own convention — see `advisoryDriver.test.js`'s header — for A-29/A-30/A-31 to
// implement against):
//
//   1. **Phase-integration level, scripted disposition — not a real seam** (PLAN §8's
//      Phase-integration row names A-10, A-11 and this task together): every `main()`-level case
//      below injects `_runAdvisorySeam` as a small in-file recording double — never the real
//      driver — returning a pre-scripted `AdvisoryDisposition` per call, in call order. What IS
//      real, because `main()` builds it itself and merely *passes* it to `_runAdvisorySeam`, is
//      the `seamOps` argument each call receives — captured on the double's `.calls` log — so a
//      case can assert A1's/A2's real, structural `declaredScope`/`permittedActions` (PROP-A1-05,
//      PROP-A2-05) and can invoke a captured `seamOps` member directly (e.g. `seamOps.verifyGate()`)
//      to exercise A2's real commit-ordering mechanics (PROP-A2-06/07) without re-implementing the
//      generic driver in this file.
//   2. **`honourA1Verdict(verdict, precheck)`.** TSPEC §6.3 names the function and its refusal rule
//      (A1-2) but not its second parameter's exact shape. This file fixes it as
//      `{ blocked: boolean, dependsOn: string[], entries: Array<{feature, status}> }` — a superset
//      of `precheckDependencies`'s own return, carrying the same `dependsOn`/`entries` the pre-check
//      already had in scope, so `honourA1Verdict` can enforce A1-3 (presence-in-base unsettled ⇒
//      escalate) in the same function without a second query surface: a dependency in `dependsOn`
//      with no matching row in `entries` is "unsettled" and forces `escalate` regardless of `verdict`.
//   3. **A1's queue-level decision surface is the verdict, not the driver's envelope outcome.**
//      A1 declares `permittedActions: []` (A1-4), so the generic driver's envelope gate always
//      classifies A1's real recommendation as out-of-envelope and reports `escalated` — that is
//      A1's *normal*, expected completion, not a driver failure (§5.4's "A1 has no independent
//      post-action gate; safety rests on A1-3's escalate-when-unsettled rule"). This file therefore
//      fixes `main`'s routing as: when the disposition carries `reason: "out-of-envelope"` and a
//      non-null `verdict`, read `disposition.verdict.proposedAction` and pass it through
//      `honourA1Verdict` to decide `run-candidate` / `hold` / `escalate`; any other escalation
//      reason (budget-exhausted, malformed-verdict, low-confidence, …) is an unconditional escalate
//      regardless of `proposedAction`. Scripted dispositions below are built accordingly.
//   4. **A2's re-grounding proposal wire format.** TSPEC §6.4's `prompt` asks for "one row per
//      drifted citation, `{ oldLocation, newLocation, symbol, symbolStillExists }`" but does not fix
//      how that structure rides `AdvisoryVerdict.proposedAction` (a plain string, §4.2). This file
//      fixes it as `JSON.stringify([{ oldLocation, newLocation, symbol, symbolStillExists }, …])` —
//      a deterministic, round-trippable wire format `seamOps.apply` can `JSON.parse` without an
//      ad-hoc grammar.
//
// Every canonical double comes from `helpers/advisoryDoubles.js` (PROP-INFRA-01/-02) — no
// locally-built `SeamOps` literal, no `jest.fn()` bound directly to a double-shaped name, no
// canonical factory imported from anywhere else. `scriptedSeamRunner` (below) is not one of the
// five canonical shapes (agent/seamOps/file/clock/config) — it is this file's own recording double
// over the not-yet-existing `_runAdvisorySeam` injection seam, mirroring `makeAgentDouble`'s
// exhausted-script-throws convention rather than reusing it.
//
// `hasResidualSeamToken`, `honourA1Verdict` and the third `parseTriageVerdict` field (`seamToken`)
// do not exist on `orchestrate-queue.js` yet at A-12 (A-29/A-30 land them later); `main` does not
// yet accept `_runAdvisorySeam`/`_appendFile`/`_readAdvisoryConfig` (A-30 lands those), and
// `buildQueueReport` does not yet carry an `advisory` summary (A-31 lands it). This file therefore
// imports the module as a namespace (`* as queueModule`) and reaches every not-yet-existing symbol
// only from *inside* `describe.skip` bodies, exactly as `advisoryDriver.test.js` and
// `advisoryEnvelope.test.js` already do.

import * as queueModule from "../orchestrate-queue.js";

import { makeAgentDouble, makeFileDouble } from "./helpers/advisoryDoubles.js";

// ─── Fixtures shared by all three blocks ───────────────────────────────────────────────────────

// A shape-valid, "everything in sync" drift-state record — these tests exercise queue-selection
// and advisory-routing behaviour downstream of the drift gate, not the gate itself (that is
// `queueDriftGate.test.js`'s job), so every fixture below seeds a green record so the gate always
// proceeds to the pre-existing `QUEUE.md` read (mirrors `orchestrateQueue.test.js`'s own fixture).
const GREEN_DRIFT_STATE = JSON.stringify({
  schemaVersion: 1,
  baselineStatus: "resolved",
  baselineReason: null,
  checkEnabled: true,
  rows: [{ id: "orchestrate-dev", state: "in-sync", reason: null }],
  retiredPresent: [],
  writeFailures: [],
  generatedBy: "hook",
  pluginVersion: "0.19.0",
  syncCommand: null,
});

const QUEUE_HEADER =
  "# PDLC Queue\n\n| Order | Status | Feature | REQ Path | Depends-On |\n|-------|--------|---------|----------|------------|\n";

function queueRow(order, status, feature, reqPath, deps = "—") {
  return `| ${order} | ${status} | ${feature} | ${reqPath} | ${deps} |\n`;
}

const READY_REQ = "---\nready: true\n---\n# REQ body\n";

/** Seeds `makeFileDouble` with the green drift record plus whatever this case names. */
function seedFiles(extra = {}) {
  return makeFileDouble({ seed: { [queueModule.DRIFT_STATE_PATH]: GREEN_DRIFT_STATE, ...extra } });
}

/**
 * A small, in-file recording double over the not-yet-existing `_runAdvisorySeam` injection seam
 * (decision 1, header above). `dispositions` is consumed one entry per call, in order — calling
 * past the end is a scripting bug and fails loudly, mirroring `makeAgentDouble`.
 */
function scriptedSeamRunner(dispositions = []) {
  const calls = [];
  const fn = async (args) => {
    const index = calls.length;
    calls.push(args);
    if (index >= dispositions.length) {
      throw new Error(
        `scriptedSeamRunner: script exhausted at call ${index} (seam=${args && args.seam}); scripted ${dispositions.length} call(s)`
      );
    }
    return dispositions[index];
  };
  fn.calls = calls;
  return fn;
}

/** An `AdvisoryDisposition` fixture (TSPEC §4.2's typedef). */
function disposition({
  outcome = "escalated",
  reason = "out-of-envelope",
  verdict = null,
  attempts = 1,
  model = "claude-opus-4",
  fallback = false,
} = {}) {
  return { outcome, reason, verdict, attempts, model, fallback };
}

/** An `AdvisoryVerdict` fixture (TSPEC §4.2's typedef) carrying an A1 recommendation. */
function a1Verdict(proposedAction) {
  return {
    seam: "A1",
    diagnosis: "triage abstention reviewed",
    proposedAction,
    confidence: "high",
    withinEnvelope: false,
    evidence: ["queue:900"],
  };
}

/** An `AdvisoryVerdict` fixture carrying an A2 re-grounding proposal (decision 4, header above). */
function a2Verdict(rows) {
  return {
    seam: "A2",
    diagnosis: "re-grounded drifted citations",
    proposedAction: JSON.stringify(rows),
    confidence: "high",
    withinEnvelope: true,
    evidence: rows.map((r) => r.oldLocation),
  };
}

// ---------------------------------------------------------------------------------------------
// A-29 — seam-token routing: `triagePrompt`, `parseTriageVerdict`, `hasResidualSeamToken`.
// ---------------------------------------------------------------------------------------------

describe.skip("A-29 — seam-token routing (§6.2, PROP-A12-01/03/04)", () => {
  test("triagePrompt carries both seam-token lines and A2's citation-drift obligation", () => {
    const prompt = queueModule.triagePrompt("some-feature", "docs/some-feature/REQ-some-feature.md", []);
    expect(prompt).toMatch(/\[SEAM:A1\]/);
    expect(prompt).toMatch(/\[SEAM:A2\]/);
    expect(prompt).toMatch(/file:line.*citations.*resolve|citations.*drift/i);
  });

  test("[SEAM:A1] on the verdict line yields seamToken A1 (T-04-9, half)", () => {
    const result = queueModule.parseTriageVerdict("TRIAGE: needs-human [SEAM:A1] ambiguous");
    expect(result.verdict).toBe("needs-human");
    expect(result.seamToken).toBe("A1");
  });

  test("[SEAM:A2] on the verdict line yields seamToken A2 (T-04-9, half)", () => {
    const result = queueModule.parseTriageVerdict("TRIAGE: needs-human [SEAM:A2] citations drifted");
    expect(result.verdict).toBe("needs-human");
    expect(result.seamToken).toBe("A2");
  });

  // PROP-A12-03: each alternation branch gets its own positive control — an absent-token fixture,
  // an unrecognised-token fixture, and (above) the two recognised-token fixtures — so the regex
  // cannot pass by never matching.
  test("PROP-A12-03 — an absent token yields seamToken: null (T-04-2, unit half)", () => {
    const result = queueModule.parseTriageVerdict("TRIAGE: needs-human ambiguous, no token given");
    expect(result.seamToken).toBeNull();
    expect(result.reason).toMatch(/ambiguous/);
  });

  test("PROP-A12-03 — an unrecognised token falls into reason, not a special branch", () => {
    const result = queueModule.parseTriageVerdict("TRIAGE: needs-human [SEAM:A9] unknown gate");
    expect(result.seamToken).toBeNull();
    // The unrecognised bracket text is not consumed by the token group — it is part of `reason`,
    // exactly §6.5's "routed to A1" row with no extra branch (TSPEC:724-725).
    expect(result.reason).toMatch(/\[SEAM:A9\]/);
  });

  // PROP-A12-04 (T-04-3b family): both tokens on one stop is malformed (V-4) — the anchored
  // single-group match yields seamToken: null with a residual `[SEAM:` prefix in `reason`, and
  // `hasResidualSeamToken` is the one predicate that flags it.
  test("PROP-A12-04 — both tokens on one stop: seamToken null, reason carries a residual [SEAM: prefix", () => {
    const result = queueModule.parseTriageVerdict("TRIAGE: needs-human [SEAM:A1] [SEAM:A2] two tokens");
    expect(result.seamToken).toBeNull();
    expect(queueModule.hasResidualSeamToken(result.reason)).toBe(true);
  });

  test("hasResidualSeamToken control: a normal reason with no residual bracket is not flagged", () => {
    expect(queueModule.hasResidualSeamToken("ambiguous; a human must decide")).toBe(false);
  });
});

// ---------------------------------------------------------------------------------------------
// A-30 — queue wiring + A1: `main`'s routing, `honourA1Verdict`, A1's `SeamOps`.
// ---------------------------------------------------------------------------------------------

describe.skip("A-30 — queue wiring + A1 (§6.2, §6.3, PROP-A1-01…06)", () => {
  // ─── T-04-3b / PROP-A1-03 — honourA1Verdict as defence in depth ────────────────────────────
  test("T-04-3b — honourA1Verdict refuses run-candidate when precheck.blocked is true", () => {
    const precheck = { blocked: true, dependsOn: [], entries: [] };
    expect(queueModule.honourA1Verdict("run-candidate", precheck)).toBe("escalate");
  });

  test("honourA1Verdict passes the verdict through unchanged when nothing is unsettled (control)", () => {
    const precheck = { blocked: false, dependsOn: [], entries: [] };
    expect(queueModule.honourA1Verdict("run-candidate", precheck)).toBe("run-candidate");
    expect(queueModule.honourA1Verdict("hold", precheck)).toBe("hold");
    expect(queueModule.honourA1Verdict("escalate", precheck)).toBe("escalate");
  });

  // ─── T-04-4 / PROP-A1-04 — A1-3: presence-in-base unsettled ⇒ escalate ─────────────────────
  test("T-04-4 — a declared dependency absent from queue entries forces escalate regardless of verdict", () => {
    const precheck = { blocked: false, dependsOn: ["dep-x"], entries: [] };
    expect(queueModule.honourA1Verdict("run-candidate", precheck)).toBe("escalate");
    expect(queueModule.honourA1Verdict("hold", precheck)).toBe("escalate");
  });

  test("a dependency present in entries (settled) is not escalated by A1-3 alone (control)", () => {
    const precheck = {
      blocked: false,
      dependsOn: ["dep-x"],
      entries: [{ feature: "dep-x", status: "done" }],
    };
    expect(queueModule.honourA1Verdict("run-candidate", precheck)).toBe("run-candidate");
  });

  // ─── T-04-1 — a `blocked` triage verdict is never adjudicable ──────────────────────────────
  test("T-04-1 — triage returns blocked: no advisory invocation happens, candidate skipped exactly as today", async () => {
    const files = seedFiles({
      [queueModule.DEFAULT_QUEUE_PATH]: QUEUE_HEADER + queueRow(1, "pending", "feat-a", "docs/feat-a/REQ-feat-a.md"),
      "docs/feat-a/REQ-feat-a.md": READY_REQ,
    });
    const seam = scriptedSeamRunner([]);
    const report = await queueModule.default({
      _readFile: files._readFile,
      _writeFile: files._writeFile,
      _appendFile: files._appendFile,
      _agent: makeAgentDouble({ script: ["TRIAGE: blocked a dependency is not merged"] }),
      _runAdvisorySeam: seam,
      _readAdvisoryConfig: async () => ({ config: { enabled: true }, sectionMalformed: false, invalidKeys: [] }),
      _runPipeline: async () => ({ outcome: "success" }),
      _log: () => {},
      _phase: () => {},
    });
    expect(seam.calls).toHaveLength(0);
    expect(report.outcome).toBe("idle");
    expect(report.skipped.some((s) => s.feature === "feat-a")).toBe(true);
  });

  // ─── T-04-3 — the dependency pre-check blocks before triage ever runs ──────────────────────
  test("T-04-3 — a pre-check-blocked candidate is skipped before triage; zero A1 invocations in the summary", async () => {
    const files = seedFiles({
      [queueModule.DEFAULT_QUEUE_PATH]:
        QUEUE_HEADER +
        queueRow(1, "pending", "dep-x", "docs/dep-x/REQ-dep-x.md") +
        queueRow(2, "pending", "feat-b", "docs/feat-b/REQ-feat-b.md", "dep-x"),
      "docs/feat-b/REQ-feat-b.md": READY_REQ,
    });
    const triageAgent = makeAgentDouble({ script: [] }); // exhausted-on-first-call ⇒ proves it is never called
    const seam = scriptedSeamRunner([]);
    const report = await queueModule.default({
      _readFile: files._readFile,
      _writeFile: files._writeFile,
      _appendFile: files._appendFile,
      _agent: triageAgent,
      _runAdvisorySeam: seam,
      _readAdvisoryConfig: async () => ({ config: { enabled: true }, sectionMalformed: false, invalidKeys: [] }),
      _runPipeline: async () => ({ outcome: "success" }),
      _log: () => {},
      _phase: () => {},
    });
    expect(triageAgent.calls).toHaveLength(0);
    expect(seam.calls).toHaveLength(0);
    expect(report.skipped.find((s) => s.feature === "feat-b").reason).toMatch(/blocked \(pre-check\)/);
    if (report.advisory) {
      const a1Row = report.advisory.rows.find((r) => r.seam === "A1");
      expect(a1Row.invocations).toBe(0);
    }
  });

  // ─── T-04-2 — no recognised token routes to A1; A1 changes no repository file ──────────────
  test("T-04-2 — needs-human with no recognised token routes to A1; A1 declares no file-changing capability", async () => {
    const files = seedFiles({
      [queueModule.DEFAULT_QUEUE_PATH]: QUEUE_HEADER + queueRow(1, "pending", "feat-c", "docs/feat-c/REQ-feat-c.md"),
      "docs/feat-c/REQ-feat-c.md": READY_REQ,
    });
    const seam = scriptedSeamRunner([disposition({ verdict: a1Verdict("hold") })]);
    const report = await queueModule.default({
      _readFile: files._readFile,
      _writeFile: files._writeFile,
      _appendFile: files._appendFile,
      _agent: makeAgentDouble({ script: ["TRIAGE: needs-human ambiguous, no token"] }),
      _runAdvisorySeam: seam,
      _readAdvisoryConfig: async () => ({ config: { enabled: true }, sectionMalformed: false, invalidKeys: [] }),
      _runPipeline: async () => ({ outcome: "success" }),
      _log: () => {},
      _phase: () => {},
    });
    expect(seam.calls).toHaveLength(1);
    expect(seam.calls[0].seam).toBe("A1");
    expect(seam.calls[0].feature).toBe("feat-c");
    // A1-4: the real SeamOps main() constructs and hands to the seam has no file-changing capability.
    expect(seam.calls[0].seamOps.declaredScope).toEqual([]);
    expect(seam.calls[0].seamOps.permittedActions).toEqual([]);
    expect(seam.calls[0].seamOps.verifyGate).toBeNull();
    expect(report.outcome).toBe("idle");
    // The queue's own writes are limited to status bookkeeping and the advisory record; the REQ
    // and every other repository file are untouched by an A1 invocation.
    expect(files.writes.some((w) => w.path === "docs/feat-c/REQ-feat-c.md")).toBe(false);
  });

  // ─── T-04-9 — the gate that produced the stop names the route; A1 vs A2 tokens split cleanly ─
  test("T-04-9 — a [SEAM:A2] token routes to A2, a [SEAM:A1] token routes to A1 (PROP-A12-01, integration)", async () => {
    const filesA2 = seedFiles({
      [queueModule.DEFAULT_QUEUE_PATH]: QUEUE_HEADER + queueRow(1, "pending", "feat-d", "docs/feat-d/REQ-feat-d.md"),
      "docs/feat-d/REQ-feat-d.md": READY_REQ,
    });
    const seamA2 = scriptedSeamRunner([disposition({ outcome: "no-action", reason: null, verdict: null })]);
    await queueModule.default({
      _readFile: filesA2._readFile,
      _writeFile: filesA2._writeFile,
      _appendFile: filesA2._appendFile,
      _agent: makeAgentDouble({ script: ["TRIAGE: needs-human [SEAM:A2] citations drifted"] }),
      _runAdvisorySeam: seamA2,
      _readAdvisoryConfig: async () => ({ config: { enabled: true }, sectionMalformed: false, invalidKeys: [] }),
      _runPipeline: async () => ({ outcome: "success" }),
      _log: () => {},
      _phase: () => {},
    });
    expect(seamA2.calls).toHaveLength(1);
    expect(seamA2.calls[0].seam).toBe("A2");

    const filesA1 = seedFiles({
      [queueModule.DEFAULT_QUEUE_PATH]: QUEUE_HEADER + queueRow(1, "pending", "feat-e", "docs/feat-e/REQ-feat-e.md"),
      "docs/feat-e/REQ-feat-e.md": READY_REQ,
    });
    const seamA1 = scriptedSeamRunner([disposition({ verdict: a1Verdict("hold") })]);
    await queueModule.default({
      _readFile: filesA1._readFile,
      _writeFile: filesA1._writeFile,
      _appendFile: filesA1._appendFile,
      _agent: makeAgentDouble({ script: ["TRIAGE: needs-human [SEAM:A1] ambiguous"] }),
      _runAdvisorySeam: seamA1,
      _readAdvisoryConfig: async () => ({ config: { enabled: true }, sectionMalformed: false, invalidKeys: [] }),
      _runPipeline: async () => ({ outcome: "success" }),
      _log: () => {},
      _phase: () => {},
    });
    expect(seamA1.calls).toHaveLength(1);
    expect(seamA1.calls[0].seam).toBe("A1");
  });

  // ─── T-04-5 / PROP-A1-06 — queue order, exactly one pick per invocation ────────────────────
  test("T-04-5 — three needs-human candidates adjudicated hold/run-candidate: exactly the second is picked", async () => {
    const queue =
      QUEUE_HEADER +
      queueRow(1, "pending", "feat-f", "docs/feat-f/REQ-feat-f.md") +
      queueRow(2, "pending", "feat-g", "docs/feat-g/REQ-feat-g.md") +
      queueRow(3, "pending", "feat-h", "docs/feat-h/REQ-feat-h.md");
    const files = seedFiles({
      [queueModule.DEFAULT_QUEUE_PATH]: queue,
      "docs/feat-f/REQ-feat-f.md": READY_REQ,
      "docs/feat-g/REQ-feat-g.md": READY_REQ,
      "docs/feat-h/REQ-feat-h.md": READY_REQ,
    });
    const triage = makeAgentDouble({
      script: [
        "TRIAGE: needs-human [SEAM:A1] first candidate",
        "TRIAGE: needs-human [SEAM:A1] second candidate",
      ],
    });
    const seam = scriptedSeamRunner([
      disposition({ verdict: a1Verdict("hold") }),
      disposition({ verdict: a1Verdict("run-candidate") }),
    ]);
    let pipelineCalls = 0;
    const report = await queueModule.default({
      _readFile: files._readFile,
      _writeFile: files._writeFile,
      _appendFile: files._appendFile,
      _agent: triage,
      _runAdvisorySeam: seam,
      _readAdvisoryConfig: async () => ({ config: { enabled: true }, sectionMalformed: false, invalidKeys: [] }),
      _runPipeline: async () => {
        pipelineCalls += 1;
        return { outcome: "success", feature: "feat-g" };
      },
      _log: () => {},
      _phase: () => {},
    });
    expect(seam.calls).toHaveLength(2); // never reaches feat-h — A1-5's one-pick guarantee
    expect(pipelineCalls).toBe(1);
    expect(report.picked).toBe("feat-g");
  });
});

// ---------------------------------------------------------------------------------------------
// A-31 — A2 seam + queue report summary.
// ---------------------------------------------------------------------------------------------

describe.skip("A-31 — A2 re-grounding + queue report summary (§6.4, PROP-A2-01…08)", () => {
  // ─── T-04-6 / PROP-A2-01,05,06,07 — pure location corrections applied and committed ────────
  test("T-04-6 — an in-envelope A2 proposal is applied, does not pick the candidate, and commits reqPath+record", async () => {
    const reqPath = "docs/feat-i/REQ-feat-i.md";
    const files = seedFiles({
      [queueModule.DEFAULT_QUEUE_PATH]: QUEUE_HEADER + queueRow(1, "pending", "feat-i", reqPath),
      [reqPath]: READY_REQ,
    });
    const rows = [{ oldLocation: "old.js:1", newLocation: "new.js:2", symbol: "foo", symbolStillExists: true }];
    const seam = scriptedSeamRunner([disposition({ outcome: "resolved", reason: null, verdict: a2Verdict(rows) })]);
    const report = await queueModule.default({
      _readFile: files._readFile,
      _writeFile: files._writeFile,
      _appendFile: files._appendFile,
      _agent: makeAgentDouble({ script: ["TRIAGE: needs-human [SEAM:A2] citations drifted"] }),
      _runAdvisorySeam: seam,
      _readAdvisoryConfig: async () => ({ config: { enabled: true }, sectionMalformed: false, invalidKeys: [] }),
      _runPipeline: async () => ({ outcome: "success" }),
      _log: () => {},
      _phase: () => {},
    });

    // A2-5: declared scope is exactly the one REQ file — a structural assertion over the real
    // SeamOps `main()` built and handed to the (scripted) seam runner.
    expect(seam.calls[0].seamOps.declaredScope).toEqual([reqPath]);
    expect(seam.calls[0].seamOps.permittedActions).toEqual(["E-4"]);

    // A2-4: applying a re-grounding does not pick the candidate.
    expect(report.picked).toBeUndefined();
    expect(report.outcome).toBe("idle");
  });

  test("PROP-A2-06/07 — verifyGate records before it commits, over the reqPath+record pair only", async () => {
    const reqPath = "docs/feat-i/REQ-feat-i.md";
    const recordPath = "docs/feat-i/ADVISORY-feat-i.md";
    const files = seedFiles({
      [queueModule.DEFAULT_QUEUE_PATH]: QUEUE_HEADER + queueRow(1, "pending", "feat-i", reqPath),
      [reqPath]: READY_REQ,
    });
    const rows = [{ oldLocation: "old.js:1", newLocation: "new.js:2", symbol: "foo", symbolStillExists: true }];
    const seam = scriptedSeamRunner([disposition({ outcome: "resolved", reason: null, verdict: a2Verdict(rows) })]);

    const commitCalls = [];
    await queueModule.default({
      _readFile: files._readFile,
      _writeFile: files._writeFile,
      _appendFile: files._appendFile,
      _agent: makeAgentDouble({ script: ["TRIAGE: needs-human [SEAM:A2] citations drifted"] }),
      _runAdvisorySeam: seam,
      _readAdvisoryConfig: async () => ({ config: { enabled: true }, sectionMalformed: false, invalidKeys: [] }),
      _commitPaths: async (opts) => {
        commitCalls.push(opts);
        return "committed";
      },
      _git: async () => ({ ok: true, stdout: "", stderr: "" }),
      _runPipeline: async () => ({ outcome: "success" }),
      _log: () => {},
      _phase: () => {},
    });

    // The record append precedes the commit (A2-6 / R-2 / §6.4.1's ordering) — exercised directly
    // against the real SeamOps.verifyGate `main()` built, over the scripted call's captured args.
    const seamOps = seam.calls[0].seamOps;
    const appendsBefore = files.appends.length;
    const result = await seamOps.verifyGate();
    expect(files.appends.length).toBeGreaterThan(appendsBefore);
    expect(files.appends[files.appends.length - 1].path).toBe(recordPath);
    expect(commitCalls).toHaveLength(1);
    expect(commitCalls[0].paths.slice().sort()).toEqual([recordPath, reqPath].sort());
    expect(result.passed).toBe(true);
  });

  // ─── T-04-7 / PROP-A2-03 — a citation whose symbol is gone escalates, nothing applied ──────
  test("T-04-7 — a proposal with a no-longer-existing citation symbol escalates; candidate not picked", async () => {
    const reqPath = "docs/feat-j/REQ-feat-j.md";
    const files = seedFiles({
      [queueModule.DEFAULT_QUEUE_PATH]: QUEUE_HEADER + queueRow(1, "pending", "feat-j", reqPath),
      [reqPath]: READY_REQ,
    });
    const rows = [
      { oldLocation: "still.js:1", newLocation: "still.js:9", symbol: "bar", symbolStillExists: true },
      { oldLocation: "gone.js:1", newLocation: null, symbol: "vanished", symbolStillExists: false },
    ];
    const seam = scriptedSeamRunner([
      disposition({ outcome: "escalated", reason: "out-of-envelope", verdict: a2Verdict(rows) }),
    ]);
    const report = await queueModule.default({
      _readFile: files._readFile,
      _writeFile: files._writeFile,
      _appendFile: files._appendFile,
      _agent: makeAgentDouble({ script: ["TRIAGE: needs-human [SEAM:A2] citations drifted"] }),
      _runAdvisorySeam: seam,
      _readAdvisoryConfig: async () => ({ config: { enabled: true }, sectionMalformed: false, invalidKeys: [] }),
      _runPipeline: async () => ({ outcome: "success" }),
      _log: () => {},
      _phase: () => {},
    });
    expect(report.picked).toBeUndefined();
    expect(files.writes.some((w) => w.path === reqPath)).toBe(false);
    if (report.advisory) {
      const a2Row = report.advisory.rows.find((r) => r.seam === "A2");
      expect(a2Row.escalated).toBeGreaterThanOrEqual(1);
    }
  });

  // ─── T-04-8 / PROP-A2-04 — a proposal that also edits a requirements sentence reverts whole ─
  test("T-04-8 — a proposal that also edits an acceptance criterion is reverted whole, reason out-of-envelope", async () => {
    const reqPath = "docs/feat-k/REQ-feat-k.md";
    const files = seedFiles({
      [queueModule.DEFAULT_QUEUE_PATH]: QUEUE_HEADER + queueRow(1, "pending", "feat-k", reqPath),
      [reqPath]: READY_REQ,
    });
    const rows = [{ oldLocation: "old.js:1", newLocation: "new.js:2", symbol: "foo", symbolStillExists: true }];
    const seam = scriptedSeamRunner([
      disposition({ outcome: "escalated", reason: "out-of-envelope", verdict: a2Verdict(rows) }),
    ]);
    const report = await queueModule.default({
      _readFile: files._readFile,
      _writeFile: files._writeFile,
      _appendFile: files._appendFile,
      _agent: makeAgentDouble({ script: ["TRIAGE: needs-human [SEAM:A2] citations drifted"] }),
      _runAdvisorySeam: seam,
      _readAdvisoryConfig: async () => ({ config: { enabled: true }, sectionMalformed: false, invalidKeys: [] }),
      _runPipeline: async () => ({ outcome: "success" }),
      _log: () => {},
      _phase: () => {},
    });
    expect(report.picked).toBeUndefined();
    // O-2: the REQ file itself is unaffected once reverted.
    expect(files.files[reqPath]).toBe(READY_REQ);
  });

  // ─── T-04-6 (durability) / PROP-A2-08 — a subsequent invocation observes the committed REQ ─
  test("A2-4 — applying a re-grounding continues the loop; a subsequent invocation re-triages the same entry", async () => {
    const reqPath = "docs/feat-l/REQ-feat-l.md";
    const files = seedFiles({
      [queueModule.DEFAULT_QUEUE_PATH]: QUEUE_HEADER + queueRow(1, "pending", "feat-l", reqPath),
      [reqPath]: READY_REQ,
    });
    const rows = [{ oldLocation: "old.js:1", newLocation: "new.js:2", symbol: "foo", symbolStillExists: true }];

    const seam1 = scriptedSeamRunner([disposition({ outcome: "resolved", reason: null, verdict: a2Verdict(rows) })]);
    const triage1 = makeAgentDouble({ script: ["TRIAGE: needs-human [SEAM:A2] citations drifted"] });
    await queueModule.default({
      _readFile: files._readFile,
      _writeFile: files._writeFile,
      _appendFile: files._appendFile,
      _agent: triage1,
      _runAdvisorySeam: seam1,
      _readAdvisoryConfig: async () => ({ config: { enabled: true }, sectionMalformed: false, invalidKeys: [] }),
      _runPipeline: async () => ({ outcome: "success" }),
      _log: () => {},
      _phase: () => {},
    });
    expect(triage1.calls).toHaveLength(1); // triage did NOT re-run within this invocation

    // A fresh process, reading the same (now-committed) branch head via the same file store.
    const triage2 = makeAgentDouble({ script: ["TRIAGE: ready citations now resolve"] });
    let secondPipelineFeature = null;
    await queueModule.default({
      _readFile: files._readFile,
      _writeFile: files._writeFile,
      _appendFile: files._appendFile,
      _agent: triage2,
      _runAdvisorySeam: scriptedSeamRunner([]),
      _readAdvisoryConfig: async () => ({ config: { enabled: true }, sectionMalformed: false, invalidKeys: [] }),
      _runPipeline: async ({ reqPath: rp }) => {
        secondPipelineFeature = rp;
        return { outcome: "success" };
      },
      _log: () => {},
      _phase: () => {},
    });
    expect(triage2.calls).toHaveLength(1); // the still-pending entry is re-triaged, fresh
    expect(secondPipelineFeature).toBe(reqPath);
  });

  // ─── S-5 — the queue's own report carries the A1/A2 summary ───────────────────────────────
  test("S-5 — buildQueueReport's advisory summary counts an A1 escalation on the A1 row only", async () => {
    const reqPath = "docs/feat-m/REQ-feat-m.md";
    const files = seedFiles({
      [queueModule.DEFAULT_QUEUE_PATH]: QUEUE_HEADER + queueRow(1, "pending", "feat-m", reqPath),
      [reqPath]: READY_REQ,
    });
    const seam = scriptedSeamRunner([disposition({ outcome: "escalated", reason: "budget-exhausted", verdict: null })]);
    const report = await queueModule.default({
      _readFile: files._readFile,
      _writeFile: files._writeFile,
      _appendFile: files._appendFile,
      _agent: makeAgentDouble({ script: ["TRIAGE: needs-human [SEAM:A1] ambiguous"] }),
      _runAdvisorySeam: seam,
      _readAdvisoryConfig: async () => ({ config: { enabled: true }, sectionMalformed: false, invalidKeys: [] }),
      _runPipeline: async () => ({ outcome: "success" }),
      _log: () => {},
      _phase: () => {},
    });
    expect(report.advisory).toBeTruthy();
    expect(report.advisory.rows).toHaveLength(5); // ADVISORY_SEAMS drives the row list (S-1)
    const a1Row = report.advisory.rows.find((r) => r.seam === "A1");
    const a2Row = report.advisory.rows.find((r) => r.seam === "A2");
    expect(a1Row.invocations).toBe(1);
    expect(a1Row.escalated).toBe(1);
    expect(a2Row.invocations).toBe(0); // this pass never routed to A2
  });
});
