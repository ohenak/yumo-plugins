/**
 * devModeKinds.test.js — PLAN T24 (batch 2, red).
 *
 * TSPEC §12.3 oracle 2 ("Dev-mode kind equality", AC-5.3): equality is over the
 * kinds a run ACTUALLY PRODUCED (BR-9.2), never over the closed catalogue by
 * assumption, and every kind is paired with a positive so the oracle cannot
 * pass vacuously (§12.3's "four oracles that must not be satisfiable by
 * absence"). Nothing under test is wired yet — `grep -n "_provenance"
 * orchestrate-dev.js orchestrate-queue.js` matches nothing at HEAD — so every
 * leg below is legitimately red: the kinds this file demands are simply not
 * produced yet. T42 (batch 6) wires kind 1/kind 3's `main()` route; other
 * batch-3..6 tasks wire the rest. Per PLAN v0.10 §2's skipped-block
 * convention, each red block is committed `.skip`-wrapped with its title
 * prefixed `T42:` — the green task (batch 6) that un-skips them; the wave
 * gate runs the full suite every wave, so un-skipped reds would halt wave 5.
 *
 * The four kinds (TSPEC §7.2):
 *   1. `report.provenance` — carried on the pipeline's final report object.
 *   2. A POSTMORTEM `_appendFile` call, made only after `_checkFile` confirms
 *      the file exists.
 *   3. `QUEUE.md`'s `Engine` cell AND the commit message that lands it,
 *      marked inside `rewriteStatus` so all five of its call routes (R-1…R-5)
 *      inherit it.
 *   4. The commit message of any of the five closed-set commit helpers
 *      (C-a `commitPaths`, C-b `appendApprovalAnchors`, C-c `commitQueueRow`,
 *      C-d `commitAdvisoryRecord`, C-e the A5 seam's `apply`).
 *
 * This file owns exactly one thing (PLAN §3 file-ownership manifest): itself.
 * It does not modify `orchestrate-dev.js` or `orchestrate-queue.js`.
 */

import devMain, {
  phaseMerge,
  MERGE_GUARD_DEFAULTS,
  commitPaths,
} from "../orchestrate-dev.js";
import queueMain, {
  DEFAULT_QUEUE_PATH,
  DRIFT_STATE_PATH,
  rewriteStatus,
} from "../orchestrate-queue.js";
import { fakeFs, fakeGit, fakeListFiles } from "./helpers/seams.js";
import { fakeGhRun, passingGh } from "./helpers/mergeDoubles.js";
import { makePopulatedProvenance, makeRecordingGit } from "./helpers/provenanceDoubles.js";

// ─── shared provenance fixture (TSPEC §7.1/§7.2) ───────────────────────────

const PROVENANCE = makePopulatedProvenance();

/**
 * True iff `text` carries the populated provenance's mark. Most placements
 * (commit messages, `QUEUE.md`'s `Engine` cell) compose `line`; the
 * POSTMORTEM append (kind 2, TSPEC §7.2 P-4) composes `block` instead
 * (`orchestrate-dev.js:11077-11110`) — so both are accepted here rather
 * than assuming every kind shares one carrier string.
 */
function marked(text) {
  return (
    typeof text === "string" &&
    (text.includes(PROVENANCE.line) || text.includes(PROVENANCE.block))
  );
}

/**
 * Computes the produced-kind set (TSPEC §12.3 oracle 2) from whatever a leg
 * observed. Every argument is optional — a leg only supplies the observation
 * surfaces it actually exercised — and a kind is present only when its own
 * placement is marked, never inferred from another kind's placement.
 *
 * @param {{
 *   report?: object,
 *   appends?: {path: string, text: string}[],
 *   queueWrites?: {path: string, contents: string}[],
 *   gitCalls?: any[][],
 * }} obs
 * @returns {Set<1|2|3|4>}
 */
function producedKinds({ report, appends = [], queueWrites = [], gitCalls = [] } = {}) {
  const kinds = new Set();

  // Kind 1 — the report's own `provenance` field.
  if (report && report.provenance && report.provenance.line === PROVENANCE.line) {
    kinds.add(1);
  }

  // Kind 2 — the POSTMORTEM append.
  if (appends.some((a) => /POSTMORTEM/.test(a.path) && marked(a.text))) {
    kinds.add(2);
  }

  // Kind 3 — QUEUE.md's `Engine` cell, written inside `rewriteStatus`.
  if (queueWrites.some((w) => w.path === DEFAULT_QUEUE_PATH && marked(w.contents))) {
    kinds.add(3);
  }

  // Kind 4 — any commit-helper's committed message.
  const commitMessages = gitCalls
    .filter((argv) => Array.isArray(argv) && argv[0] === "commit" && argv[1] === "-m")
    .map((argv) => argv[2]);
  if (commitMessages.some(marked)) {
    kinds.add(4);
  }

  return kinds;
}

const ALL_FOUR_KINDS = new Set([1, 2, 3, 4]);

// ─── shared REQ/tree fixture (Phase R round-budget exhaustion) ─────────────
//
// Mirrors `haltAndQueue.test.js`'s `nonConvergingAtR`/`baseTree()` pattern —
// the shipped, proven way to reach a Phase R halt fast and deterministically.
// `devModeKinds.test.js` owns its own copy (file-ownership manifest, PLAN §3):
// it does not import from `haltAndQueue.test.js`, which exports nothing.

const FEATURE = "kinds-demo";
const DOCS = `docs/${FEATURE}`;
const REQ_PATH = `${DOCS}/REQ-${FEATURE}.md`;
const POSTMORTEM_R = `${DOCS}/POSTMORTEM-R-${FEATURE}.md`;
const R_ROLE_SLUGS = ["software-engineer", "test-engineer"];

const REQ_TEXT = [
  "# REQ kinds-demo",
  "",
  "## Problem / Context",
  "",
  "The thing does not work.",
  "",
  "## Goals",
  "",
  "Make the thing work.",
  "",
  "## Non-Goals",
  "",
  "Everything else.",
  "",
  "## Constraints",
  "",
  "No dependencies.",
  "",
  "## Acceptance Criteria",
  "",
  "AC-1. The thing works.",
  "",
  "## Risks",
  "",
  "The thing might not work.",
  "",
  "## Obligations",
  "",
  "None.",
  "",
].join("\n");

function baseTree() {
  const tree = {
    [REQ_PATH]: REQ_TEXT,
    [`${DOCS}/FSPEC-${FEATURE}.md`]: "# FSPEC\n",
    [`${DOCS}/TSPEC-${FEATURE}.md`]: "# TSPEC\n",
    [`${DOCS}/PLAN-${FEATURE}.md`]:
      "# PLAN\n\n| ID | Files |\n|---|---|\n| T1 | `src/one.js` |\n",
    [`${DOCS}/PROPERTIES-${FEATURE}.md`]: "# PROPERTIES\n",
  };
  return tree;
}

const NEEDS_REVISION_REVIEW =
  'Review issues.\nVERDICT: Needs revision\n{"high": 1, "medium": 0, "low": 0}\n';

/** Reviewers never approve the REQ, so Phase R exhausts its round budget. */
function nonConvergingAtR(skill, prompt) {
  return prompt.includes(`REQ-${FEATURE}.md`) ? NEEDS_REVISION_REVIEW : "Success.";
}

const POSTMORTEM_PROMPT_RE = /^Write (\S*POSTMORTEM-[^\s.]+\.md)\./;

/**
 * A trimmed `run()` harness over `devMain` — the pieces
 * `nonConvergingAtR` actually exercises (reviewer dispatch, the optimizer's
 * revision write, the POSTMORTEM write) plus a generic fallback, mirroring
 * `haltAndQueue.test.js`'s proven `run()` (this file owns its own copy — see
 * the file-ownership note above).
 */
async function runHaltedAtR({ extraArgs = {} } = {}) {
  const fs = fakeFs(baseTree());
  const listFiles = fakeListFiles((dirPath) => basenamesUnder(fs.files, dirPath));

  const agentFn = async (skill, prompt) => {
    const pm = POSTMORTEM_PROMPT_RE.exec(prompt);
    if (pm) {
      fs.writeFile(
        pm[1],
        [
          "# Post-mortem",
          "",
          "## Pattern Disagreement",
          "",
          "The reviewers never converged on the round index.",
          "",
          "## Recommendation",
          "",
          "Re-enter Phase R once the round-index disagreement is resolved.",
          "",
        ].join("\n")
      );
      return "Written.";
    }
    if (["se-review", "pm-review", "te-review"].includes(skill)) {
      return nonConvergingAtR(skill, prompt);
    }
    const opt = /Address reviewer feedback on (\S+) for phase \S+ of feature \S+\. Iteration (\d+)/.exec(
      prompt
    );
    if (opt) {
      fs.writeFile(opt[1], `${REQ_TEXT}\n<!-- revision iteration ${opt[2]} -->`);
      return "Document created.\nREVISION-COMPLETE: yes";
    }
    return "Success.";
  };

  const result = await devMain({
    reqPath: REQ_PATH,
    _agent: agentFn,
    _parallel: (p) => Promise.all(p),
    _log: () => {},
    _phase: () => {},
    _checkFile: fs.checkFile,
    _readFile: fs.readFile,
    _hashFile: fs.hashFile,
    _writeFile: fs.writeFile,
    _appendFile: fs.appendFile,
    _listFiles: listFiles,
    ...extraArgs,
  });

  return { result, fs };
}

function basenamesUnder(files, dirPath) {
  const prefix = `${dirPath}/`;
  return Object.keys(files)
    .filter((p) => p.startsWith(prefix) && !p.slice(prefix.length).includes("/"))
    .map((p) => p.slice(prefix.length));
}

// ─── Leg 1 — halted, queue-driven fixture: all four kinds ─────────────────

const QUEUE_WITH_FEATURE = `# PDLC Queue

| Order | Status | Feature | REQ Path | Depends-On |
|-------|--------|---------|----------|------------|
| 1 | in-progress | ${FEATURE} | ${REQ_PATH} | — |
`;

describe("TSPEC §12.3 oracle 2 — dev-mode kind equality (T24)", () => {
  it("T42: halted queue-driven fixture produces all four kinds", async () => {
    // "Queue-driven" per `haltAndQueue.test.js`'s `RLH-AT-21` precedent
    // (TSPEC §3.5): `_recordQueueRow` is a closure over the real, exported
    // `rewriteStatus` and an in-memory queue tree/`_git`, exactly the way
    // `orchestrate-queue.js`'s own `_runPipeline` wiring calls it — never a
    // recording-only double.
    const queueFs = fakeFs({ [DEFAULT_QUEUE_PATH]: QUEUE_WITH_FEATURE });
    const git = fakeGit();

    const queueBackedRecordQueueRow = async ({ feature, status }) =>
      rewriteStatus(
        DEFAULT_QUEUE_PATH,
        feature,
        status,
        queueFs.readFile,
        queueFs.writeFile,
        git,
        null,
        PROVENANCE // forward-looking: `rewriteStatus` takes no such 8th
        // argument yet (T44/T42's wiring), so this is inert today —
        // exactly why this leg is red.
      );

    const { result, fs } = await runHaltedAtR({
      extraArgs: {
        _recordQueueRow: queueBackedRecordQueueRow,
        _provenance: PROVENANCE, // forward-looking; `main()` has no such
        // keyword parameter yet (T42), so this is inert today too.
      },
    });

    expect(result.outcome).toBe("halted");

    const kinds = producedKinds({
      report: result,
      appends: fs.appends,
      queueWrites: queueFs.writes,
      gitCalls: git.calls,
    });

    expect(kinds).toEqual(ALL_FOUR_KINDS);
  });

  // ─── Leg 1b — T42: main()'s own `_recordQueueRow` call object shape ──────
  //
  // PLAN T42/AT-5.3: `main()`'s own `_recordQueueRow` call (the halted-path
  // seam at `orchestrate-dev.js`, distinct from `phaseMerge`'s own call)
  // gains a `provenance` key beside `{feature, status}`. Asserted directly
  // against the recorded call args here — never inferred from Leg 1's kind
  // set, since Leg 1's own `_recordQueueRow` double ignores unrecognised
  // keys and would pass whether or not `main()` actually threads them.
  it("T42: main()'s _recordQueueRow call object carries provenance", async () => {
    const calls = [];
    const recordingRecordQueueRow = async (args) => {
      calls.push(args);
      return { queueRow: null };
    };

    const { result } = await runHaltedAtR({
      extraArgs: {
        _recordQueueRow: recordingRecordQueueRow,
        _provenance: PROVENANCE,
      },
    });

    expect(result.outcome).toBe("halted");
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[0].feature).toBe(FEATURE);
    expect(calls[0].status).toBe("halted");
    expect(calls[0].provenance).toBe(PROVENANCE);
  });

  // ─── Leg 2 — green queue-driven fixture: R-3 and R-5 both marked ─────────
  //
  // TSPEC §12.3 oracle 2 / PM Q-01: "kind 3 has a positive on a green path,
  // not only on a halted one — a green queue-driven run rewrites two rows,
  // `in-progress` (R-3) and `awaiting-merge` (R-5) — and both must carry the
  // `Engine` cell and the marked commit message. This is the case that made
  // marking at the call sites wrong." `_runPipeline` is faked (the
  // established `orchestrate-queue.js`-level convention — see
  // `orchestrateQueue.test.js`'s and `mergeQueueDriver.test.js`'s own
  // `_runPipeline` fakes) because this leg's whole question is what
  // `orchestrate-queue.js`'s OWN R-3/R-5 writes carry, never what
  // `orchestrate-dev.js` itself does with a real run.
  it("T42: green queue-driven fixture marks R-3's in-progress and R-5's awaiting-merge rows", async () => {
    const QUEUE = `# PDLC Queue

| Order | Status | Feature | REQ Path | Depends-On |
|-------|--------|---------|----------|------------|
| 1 | pending | ${FEATURE} | ${REQ_PATH} | — |
`;
    const READY_REQ = "---\nready: true\n---\n# REQ body\n";

    // AT-M5's drift-gate precondition (mirrors `mergeQueueDriver.test.js`):
    // a shape-valid drift-state record opted out via `checkEnabled: false`,
    // supplied as a RECORD, never `.claude/pdlc.config.json`.
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

    const store = {
      [DRIFT_STATE_PATH]: OPT_OUT_DRIFT_STATE,
      [DEFAULT_QUEUE_PATH]: QUEUE,
      [REQ_PATH]: READY_REQ,
    };
    const writes = [];
    const readFile = async (p) => (p in store ? store[p] : null);
    const writeFile = async (p, c) => {
      store[p] = c;
      writes.push({ path: p, contents: c });
    };
    const git = fakeGit();

    const report = await queueMain({
      _readFile: readFile,
      _writeFile: writeFile,
      _git: git,
      _agent: async () => "TRIAGE: ready",
      _runPipeline: async () => ({ outcome: "success", mergeStatus: "skipped" }),
      _log: () => {},
      _phase: () => {},
      _provenance: PROVENANCE, // forward-looking; `orchestrate-queue.js`
      // has no `_provenance` seam of its own yet (TSPEC §7.2 carrier
      // table), so this is inert today — exactly why this leg is red.
    });

    expect(report.outcome).toBe("ran");
    expect(report.picked).toBe(FEATURE);

    // R-3: the in-progress write, before the (faked) pipeline runs.
    const inProgressWrite = writes.find((w) => w.path === DEFAULT_QUEUE_PATH);
    expect(inProgressWrite).toBeDefined();
    expect(marked(inProgressWrite.contents)).toBe(true);

    // R-5: the terminal write, after the pipeline returns.
    const finalWrite = writes[writes.length - 1];
    expect(finalWrite).toBeDefined();
    expect(marked(finalWrite.contents)).toBe(true);

    // Both rewrites' commit messages are marked too (TSPEC §12.3: "both must
    // carry the `Engine` cell and the marked commit message").
    const commitMessages = git.calls
      .filter((argv) => Array.isArray(argv) && argv[0] === "commit" && argv[1] === "-m")
      .map((argv) => argv[2]);
    expect(commitMessages.length).toBeGreaterThanOrEqual(2);
    expect(commitMessages.every(marked)).toBe(true);
  });

  // ─── Leg 3 — green direct fixture: mergeMode "on", non-empty kind set ────
  //
  // TSPEC §12.3: "the green direct run's only rewrite is Phase MERGE's,
  // which takes `updateQueueStatus`'s evidence-carrying path"; the leg sets
  // `mergeMode: "on"` (the shipped default is "off", under which Phase MERGE
  // returns `skipped` before ever reaching its row write) and satisfies the
  // guard ladder's preconditions in order: a `prUrl`, an O1 that is `ok`
  // with `state: "OPEN"`/`mergeable: "MERGEABLE"`/non-`DIRTY` status, an O5
  // that retrieves and matches no guard path, an O2 CI pass, an O3 with
  // `unresolved: 0`, and an O4 that yields a permitted merge method.
  //
  // Because this feature's own diff touches `pdlc/workflows/` — which the
  // shipped self-modification guard (`MERGE_GUARD_DEFAULTS`) refuses — this
  // fixture defeats that guard EXPLICITLY: `config.guardPaths` is set to a
  // path set disjoint from `passingGh`'s default O5 changed-file list
  // (`src/example.js`), and `MERGE_GUARD_DEFAULTS` itself is asserted here
  // to still include `pdlc/workflows/` (TE round-1 Q-04's point — the
  // defaults are never removed, only left un-matched by this fixture's
  // changed-file list). The reached rung (`decideMerge`'s row) is asserted
  // BEFORE the kinds, so a wrong earlier-resolving branch (e.g. the guard
  // firing) is a loud row-mismatch, never a silent empty-set pass.
  it("T42: green direct fixture (mergeMode: on) produces a non-empty kind set including kind 3", async () => {
    expect(MERGE_GUARD_DEFAULTS).toContain("pdlc/workflows/");

    const PR_URL = "https://github.com/acme/widgets/pull/42";
    const config = {
      mergeMode: "on",
      mergeRequiresCi: true,
      allowSquashMerge: false,
      deleteBranchOnPdlcMerge: false, // keep this leg to M3/M4, no M2 noise
      mergeableRetries: 3,
      mergeableRetryDelay: 0,
      guardPaths: ["fixtures/unrelated-path/"], // disjoint from O5's
      // `src/example.js` default — defeats the guard explicitly without
      // touching `MERGE_GUARD_DEFAULTS`, which stays unioned in.
    };

    // `passingGh` does not carry O6's read-back surface (it is not one of
    // the six friendly override names) — `mergePhase.test.js`'s own
    // `ghFixture` convention, restated locally since that file's helper is
    // not exported.
    const MERGE_READBACK_KEY = "gh pr view --json mergeCommit,state";
    const MERGED_OID = "abc1234567890abcdef";
    const ghMap = passingGh();
    ghMap[MERGE_READBACK_KEY] = {
      ok: true,
      stdout: JSON.stringify({ state: "MERGED", mergeCommit: { oid: MERGED_OID } }),
      stderr: "",
    };
    const { _ghRun } = fakeGhRun(ghMap);
    const _git = fakeGit();

    const QUEUE = `# PDLC Queue

| Order | Status | Feature | REQ Path | Depends-On |
|-------|--------|---------|----------|------------|
| 1 | awaiting-merge | ${FEATURE} | ${REQ_PATH} | — |
`;
    const queueFs = fakeFs({ [DEFAULT_QUEUE_PATH]: QUEUE });
    const queueGit = fakeGit();
    const queueBackedRecordQueueRow = async ({ feature, status, evidence }) =>
      rewriteStatus(
        DEFAULT_QUEUE_PATH,
        feature,
        status,
        queueFs.readFile,
        queueFs.writeFile,
        queueGit,
        evidence ?? null,
        PROVENANCE // forward-looking; inert today (§7.2's `rewriteStatus`
        // 8th parameter is not wired until later batches).
      );

    const outcome = await phaseMerge({
      feature: FEATURE,
      prUrl: PR_URL,
      config,
      _ghRun,
      _git,
      _readFile: async () => null, // unused: `config` bypasses the read
      _recordQueueRow: queueBackedRecordQueueRow,
      _log: () => {},
      _sleep: async () => {},
    });

    // The reached rung, asserted BEFORE the kinds (TE round-1 Q-04): row 18
    // is "merged" via a succeeding candidate attempt. A guard-fired refusal
    // (row 4) or any other earlier-resolving row must fail HERE, loudly,
    // rather than let the kinds assertion below pass vacuously on an empty
    // set for the wrong reason.
    expect(outcome.row).toBe("18");
    expect(outcome.mergeStatus).toBe("merged");

    const kinds = producedKinds({
      queueWrites: queueFs.writes,
      gitCalls: queueGit.calls,
    });

    expect(kinds.size).toBeGreaterThan(0);
    expect(kinds.has(3)).toBe(true);
  });

  // ─── Leg 4 — AT-5.3b: contents unmarked, commit message marked ───────────
  //
  // TSPEC §12.3: "Cross-review and `CODE_REVIEW-*` file contents are
  // asserted unmarked (BR-9.3), while the harness commit that lands an
  // anchor append (§7.2's C-b) carries the mark in its message." Exercised
  // here through C-a `commitPaths` directly — the simplest of the five
  // commit helpers, and TSPEC §7.2's own carrier table names it as gaining
  // a `provenance = NO_PROVENANCE` parameter that composes the mark into
  // the committed message, never into any file's bytes.
  it("T42: AT-5.3b: cross-review file contents stay unmarked while the commit message is marked", async () => {
    const crossReviewPath = `${DOCS}/CROSS-REVIEW-software-engineer-REQ-v1.md`;
    const crossReviewContents = [
      "# Cross-review",
      "",
      "## Verdict",
      "",
      "VERDICT: Approved",
      '{"high": 0, "medium": 0, "low": 0}',
      "",
    ].join("\n");
    const fs = fakeFs({ [crossReviewPath]: crossReviewContents });

    // `diff --cached --name-only` must read back non-empty for `commitPaths`
    // to proceed past its staged-read-back check into an actual commit.
    const { calls, _git } = makeRecordingGit({
      diff: { ok: true, stdout: crossReviewPath, stderr: "" },
    });

    const disposition = await commitPaths({
      paths: [crossReviewPath],
      message: "chore(review): record approval anchor",
      what: "approval anchor append",
      provenance: PROVENANCE, // forward-looking; `commitPaths` has no such
      // parameter yet, so it is inert today — exactly why this leg is red.
      _git,
      _sleep: async () => {},
      emit: () => {},
    });

    expect(disposition).toBe("committed");

    // The file's own bytes are never touched by `commitPaths` — asserted,
    // not assumed (BR-9.3).
    expect(fs.files[crossReviewPath]).toBe(crossReviewContents);
    expect(marked(fs.files[crossReviewPath])).toBe(false);

    // The commit message IS marked, once C-a's route is wired.
    const commitCall = calls.find((argv) => argv[0] === "commit");
    expect(commitCall).toBeDefined();
    expect(marked(commitCall[2])).toBe(true);
  });
});
