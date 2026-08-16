// provenanceCommits.test.js — PLAN T22 (batch 2, red, dep T04).
//
// TSPEC §7.2 kind 4 (PROP-PROV-7): the closed set of "commit helpers" that compose
// `provenance.line` into a `git commit -m` message. The oracle is asserted **on the recorded
// `_git` argv, never on source text** (TE round-1 F-04 — a grep for `provenance.line` passes
// while the composed line never reaches `git commit`), via T04's `makeRecordingGit`.
//
// **Scope decision this RED task makes (documented here per this project's own convention):**
// TSPEC §12.1 / PLAN T22's row names five entrypoints, C-a…C-e. This file drives exactly FOUR
// of them — C-a, C-b, C-d, C-e. **C-c (`commitQueueRow`, reached through `rewriteStatus`) is
// deliberately NOT exercised here.** The green side of C-c's own wiring is PLAN T39's row
// ("`rewriteStatus` gains an 8th positional `provenance` … hands `line` to `commitQueueRow`"),
// and T39's owned file is `provenanceQueueRow.test.js` — NOT this file. Neither of this file's
// two green owners (T30, T35; see PLAN §3's file-ownership manifest) touches `rewriteStatus` or
// `commitQueueRow` either. A C-c leg parked in a `describe.skip` block here would therefore name
// a task in its title whose wave never actually lands the code that turns it green — a
// permanently-red, permanently-unskippable block, which `checkWaveUnskips` exists to prevent.
// C-c's own kind-4 assertion belongs in `provenanceQueueRow.test.js`, alongside T39's kind-3
// work over the same `rewriteStatus` call site — not duplicated here.
//
// Two `describe.skip` blocks, each named for the task whose wave lands the code it exercises
// (PLAN §3's un-skipper rule):
//   - "T35: …" — C-a (`commitPaths`), C-b (`appendApprovalAnchors`, via `reviewLoop`) and C-e
//     (`buildA5SeamOps`'s `apply`), all three in `orchestrate-dev.js` (PLAN T35, batch 4).
//   - "T30: …" — C-d (`commitAdvisoryRecord`, via `orchestrate-queue.js`'s own `main()`),
//     in `orchestrate-queue.js` (PLAN T30, batch 3).
//
// Every double is drawn from `helpers/provenanceDoubles.js` (T04) except the queue-side file
// seam, which reuses `helpers/advisoryDoubles.js`'s `makeFileDouble`/`makeAgentDouble` — the
// same scaffold `advisoryQueueSeams.test.js` already drives `orchestrate-queue.js`'s `main()`
// through.

import * as devModule from "../orchestrate-dev.js";
import * as queueModule from "../orchestrate-queue.js";
import { makePopulatedProvenance, makeRecordingGit } from "./helpers/provenanceDoubles.js";
import { fakeFs } from "./helpers/seams.js";
import { makeFileDouble, makeAgentDouble } from "./helpers/advisoryDoubles.js";

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

function queueRow(order, status, feature, reqPath) {
  return `| ${order} | ${status} | ${feature} | ${reqPath} | — |\n`;
}

const READY_REQ = "---\nready: true\n---\n# REQ body\n";

// A structurally-complete cross-review body (`isComplete`'s cross-review branch requires a
// readable `VERDICT:` trailer) — matches the shape `sessionAgent.test.js`'s own `crossReviewDoc`
// helper produces, so the C-b episode's completeness gate reads this seeded file as terminal on
// invocation 1 with no re-dispatch needed.
function crossReviewDoc(verdict, high) {
  return [
    "# Cross-review",
    "",
    "## Findings",
    "",
    "Some findings.",
    "",
    "## Verdict",
    "",
    `VERDICT: ${verdict}`,
    `{"high": ${high}, "medium": 0, "low": 0}`,
    "",
  ].join("\n");
}

// ---------------------------------------------------------------------------------------------
// T35 — dev-side kind 4: C-a, C-b, C-e (§12.1, PROP-PROV-7).
// ---------------------------------------------------------------------------------------------

describe("T35: dev-side commit helpers compose provenance.line into git commit -m (C-a, C-b, C-e)", () => {
  // ─── C-a — commitPaths, called directly ────────────────────────────────────────────────────
  test("C-a: commitPaths' recorded `git commit -m` argv contains provenance.line", async () => {
    const provenance = makePopulatedProvenance();
    const { calls, _git } = makeRecordingGit({
      diff: { ok: true, stdout: "docs/pf/FSPEC-pf.md\n" }, // non-empty ⇒ proceeds to commit
    });

    await devModule.commitPaths({
      paths: ["docs/pf/FSPEC-pf.md"],
      message: "docs(pf): author FSPEC",
      what: "test",
      _git,
      _sleep: async () => {},
      emit: () => {},
      provenance,
    });

    const commitCall = calls.find((argv) => Array.isArray(argv) && argv[0] === "commit");
    expect(commitCall).toBeDefined();
    const messageIndex = commitCall.indexOf("-m") + 1;
    expect(commitCall[messageIndex]).toContain(provenance.line);
  });

  // ─── C-b — appendApprovalAnchors, reached through the exported reviewLoop (:6516) ──────────
  test("C-b: reviewLoop's PASS-branch anchor commit contains provenance.line", async () => {
    const provenance = makePopulatedProvenance();
    const feature = "pf";
    const doc = `docs/${feature}/TSPEC-${feature}.md`;
    const path1 = devModule.crossReviewPath(feature, "pm-review", "TSPEC", 1);
    const path2 = devModule.crossReviewPath(feature, "te-review", "TSPEC", 1);

    const fs = fakeFs({
      [doc]: "# TSPEC\n\nBody.\n",
      [path1]: crossReviewDoc("Approved", 0),
      [path2]: crossReviewDoc("Approved", 0),
    });
    // `makeRecordingGit` keys its script by `argv[0]` only, so a single "rev-parse"
    // entry answers BOTH `verifyFeatureBranch`'s `rev-parse --abbrev-ref HEAD` (which
    // must read back this test's own feature branch or the guard halts before
    // reviewLoop ever reaches the commit this test asserts on) and `headCommitSha`'s
    // `rev-parse HEAD` (whose exact value this test never asserts).
    const { calls: gitCalls, _git } = makeRecordingGit({
      "rev-parse": { ok: true, stdout: `feat-${feature}\n` },
    });

    const APPROVE = 'Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
    const agentFn = async () => APPROVE;

    await devModule.reviewLoop({
      doc,
      phase: "T",
      docType: "TSPEC",
      reviewers: ["pm-review", "te-review"],
      optimizer: "se-author",
      feature,
      _agent: agentFn,
      _parallel: (ps) => Promise.all(ps),
      _checkFile: () => ({ ok: true }),
      ...fs.injections(),
      _git,
      _log: () => {},
      provenance,
    });

    const commitCall = gitCalls.find((argv) => Array.isArray(argv) && argv[0] === "commit");
    expect(commitCall).toBeDefined();
    const messageIndex = commitCall.indexOf("-m") + 1;
    expect(commitCall[messageIndex]).toContain(provenance.line);
  });

  // ─── C-e — buildA5SeamOps' apply arrow, E-2 branch (:2837-2841) ────────────────────────────
  test("C-e: buildA5SeamOps' apply(E-2) commit contains provenance.line, and keeps the advisory(A5) prefix, staging nothing of its own", async () => {
    const provenance = makePopulatedProvenance();
    const { calls, _git } = makeRecordingGit();
    const _ghRun = async () => ({ ok: true, stdout: "[]" });

    const seamOps = await devModule.buildA5SeamOps({
      feature: "pf",
      prUrl: "https://github.com/example/pf/pull/1",
      preSeamHead: "deadbeef",
      defaultBranch: "main",
      mergeBase: "cafebabe",
      recordWait: () => {},
      _git,
      _ghRun,
      _checkCi: async () => "failed",
      provenance,
    });

    const result = await seamOps.apply({ proposedAction: "E-2" });
    expect(result.ok).toBe(true);

    // No `git add` of any kind — C-e stages nothing of its own (T22's row).
    expect(calls.some((argv) => Array.isArray(argv) && argv[0] === "add")).toBe(false);

    const commitCall = calls.find((argv) => Array.isArray(argv) && argv[0] === "commit");
    expect(commitCall).toBeDefined();
    const messageIndex = commitCall.indexOf("-m") + 1;
    expect(commitCall[messageIndex]).toContain(provenance.line);
    expect(commitCall[messageIndex]).toContain("advisory(A5):");
  });
});

// ---------------------------------------------------------------------------------------------
// T30 — queue-side kind 4: C-d (§12.1, PROP-PROV-7).
// ---------------------------------------------------------------------------------------------

describe("T30: commitAdvisoryRecord's recorded git commit -m argv contains provenance.line (C-d)", () => {
  test("C-d: main()'s advisory-record commit, reached through the queue's own needs-human path, carries provenance.line", async () => {
    const provenance = makePopulatedProvenance();
    const feature = "feat-prov";
    const reqPath = `docs/${feature}/REQ-${feature}.md`;

    const files = makeFileDouble({
      seed: {
        [queueModule.DRIFT_STATE_PATH]: GREEN_DRIFT_STATE,
        [queueModule.DEFAULT_QUEUE_PATH]: QUEUE_HEADER + queueRow(1, "pending", feature, reqPath),
        [reqPath]: READY_REQ,
      },
    });
    const { calls, _git } = makeRecordingGit();

    await queueModule.default({
      _readFile: files._readFile,
      _writeFile: files._writeFile,
      _appendFile: files._appendFile,
      _agent: makeAgentDouble({ script: ["TRIAGE: needs-human [SEAM:A1] ambiguous"] }),
      _runAdvisorySeam: async () => ({
        outcome: "escalated",
        reason: "budget-exhausted",
        verdict: null,
        attempts: 1,
        model: "claude-opus-4",
        fallback: false,
      }),
      _readAdvisoryConfig: async () => ({ config: { enabled: true }, sectionMalformed: false, invalidKeys: [] }),
      _runPipeline: async () => ({ outcome: "success" }),
      _git,
      _log: () => {},
      _phase: () => {},
      _provenance: provenance,
    });

    const commitCall = calls.find(
      (argv) => Array.isArray(argv) && argv[0] === "commit" && argv.includes(`docs/${feature}/ADVISORY-${feature}.md`)
    );
    expect(commitCall).toBeDefined();
    const messageIndex = commitCall.indexOf("-m") + 1;
    expect(commitCall[messageIndex]).toContain(provenance.line);
  });
});
