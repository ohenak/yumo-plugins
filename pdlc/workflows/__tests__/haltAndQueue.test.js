/**
 * haltAndQueue.test.js — the halt path, the POSTMORTEM gate, and the queue row.
 *
 * Owner: RLH-25 (batch 3, RED). Greened by RLH-27 (batch 9); `RLH-AT-13a`'s
 * gate half additionally needs RLH-26 (batch 8), which is why batch 9 binds.
 *
 * Scope (PLAN §7.4, TSPEC §8.3):
 *   - `RLH-AT-21` … `RLH-AT-27` — POSTMORTEM lifecycle and structured halt fields
 *   - `RLH-AT-30-orch` … `RLH-AT-34-orch` — the **orchestrator half** of the
 *     queue-row range: *which* halting exit of `orchestrate-dev` arrives at the
 *     committing status write, and what the orchestrator reports when that
 *     commit fails. The mechanism itself (`rewriteStatus` / `updateQueueStatus`,
 *     the two `_git` invocations, each commit-failure branch) is `RLH-19`'s
 *     `RLH-AT-30-module` … `-34-module` and is asserted **nowhere** here. The
 *     `-orch` / `-module` qualifiers exist so one jest run never carries two
 *     tests of one name (PLAN §1.3, §7.4).
 *   - `RLH-AT-13a` — G-INV totality (TSPEC §2.5): every exit that leads to
 *     running the phase passes step G and is refused by an unresolved
 *     POSTMORTEM; the `FRESH` exit does not refuse but names it in the skip
 *     notice.
 *
 * FSPEC §12.4's worked example A and AC-2.3b's example B are driven **verbatim**
 * as fixtures — the row text is copied into `FSPEC_12_4_EXAMPLE_A` /
 * `FSPEC_12_4_EXAMPLE_B` below and the trees are built from it. PLAN §7.3 names
 * exactly this pair as the guard against a gate placed ahead of §12.4 step 1
 * (which breaks A) or reachable only from step 4 (which breaks B).
 *
 * ## Why the module namespace, not named imports
 *
 * This package runs jest under native ESM (`--experimental-vm-modules`,
 * `"transform": {}`). A static `import { approvalHashOf }` of a name the module
 * does not export yet is a **link-time SyntaxError** that takes the whole suite
 * down — which is not a valid red. Every symbol this feature introduces is
 * therefore reached off the namespace object (`dev.approvalHashOf`,
 * `queueModule.rewriteStatus`), so an unimplemented symbol reds one assertion on
 * its own oracle instead of erroring the file at import.
 *
 * Seam doubles come from `./helpers/seams.js` (RLH-02) and are synchronous by
 * design; production `await`s them, and a sync return simply resolves.
 */

import main from "../orchestrate-dev.js";
import * as dev from "../orchestrate-dev.js";
import * as queueModule from "../orchestrate-queue.js";
import { DEFAULT_QUEUE_PATH } from "../orchestrate-queue.js";
import {
  fakeFs,
  fakeGit,
  fakeListFiles,
  recordingRecordQueueRow,
} from "./helpers/seams.js";
import {
  fakeGhRun,
  passingGh,
  fakeGit as fakeMergeGit,
  fakeSleep as fakeMergeSleep,
  fakeNow as fakeMergeNow,
} from "./helpers/mergeDoubles.js";

// ─── Fixture vocabulary ──────────────────────────────────────────────────────

const FEATURE = "foo";
const DOCS = `docs/${FEATURE}`;
const REQ_PATH = `${DOCS}/REQ-${FEATURE}.md`;
const POSTMORTEM_R = `${DOCS}/POSTMORTEM-R-${FEATURE}.md`;

/** Phase R's reviewer pair, and their `CROSS-REVIEW-{role}-…` slugs (§5.2 G-2). */
const R_ROLE_SLUGS = ["software-engineer", "test-engineer"];

/**
 * A STRUCTURALLY COMPLETE REQ — every §5.9 required heading with a non-empty
 * body. Completeness is half of §5.6.2's terminal criterion for a revision
 * episode (the author's `REVISION-COMPLETE:` trailer is the other half), so a
 * one-heading REQ would make every Phase-R revision episode non-terminal and
 * halt the phase in §3.8's pacing wrapper on its no-progress budget — the wrong
 * exit for every oracle in this file, all of which need Phase R to reach either
 * its round budget (§6.3) or the gate (§5.8).
 */
const REQ_TEXT = [
  "# REQ — foo",
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
  "No new dependencies.",
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

/** The Recommendation the refusal must reproduce verbatim (§5.8, FSPEC §12.5). */
const RECOMMENDATION_BODY = [
  "Split the round-index derivation out of `reviewLoop`, give it its own",
  "listing seam, and re-enter Phase R at round 3.",
].join("\n");

/**
 * A POSTMORTEM document. `resolved` is `null` for no `RESOLVED:` line at all
 * (§5.8: absent or malformed marker ⇒ `unresolved`, fail closed).
 *
 * @param {{ resolved?: "yes"|"no"|null }} [opts]
 */
function postmortemDoc({ resolved = null } = {}) {
  return [
    "# Post-mortem — Phase R, foo",
    "",
    "## Pattern Disagreement",
    "",
    "The reviewers never agreed on the round index.",
    "",
    ...(resolved === null ? [] : [`RESOLVED: ${resolved}`, ""]),
    "## Recommendation",
    "",
    RECOMMENDATION_BODY,
    "",
  ].join("\n");
}

/**
 * One `CROSS-REVIEW-{role}-REQ-v{round}.md` document.
 *
 * @param {{ approving?: boolean, hash?: string|null }} [opts]
 *   `hash: null` omits the `APPROVAL-HASH:` line entirely, which §5.5 reads as
 *   `UNEVALUABLE` rather than `STALE`.
 */
function crossReviewDoc({ approving = true, hash = null } = {}) {
  return [
    "# Cross-review",
    "",
    "## Verdict",
    "",
    `VERDICT: ${approving ? "Approved" : "Needs revision"}`,
    approving
      ? '{"high": 0, "medium": 0, "low": 0}'
      : '{"high": 1, "medium": 0, "low": 0}',
    "",
    ...(hash === null
      ? []
      : [`APPROVAL-HASH: ${hash}`, "REVIEWED-COMMIT: unavailable", ""]),
  ].join("\n");
}

/** The pipeline artifacts every phase's entry precondition checks for. */
function baseTree() {
  return {
    [REQ_PATH]: REQ_TEXT,
    [`${DOCS}/FSPEC-${FEATURE}.md`]: "# FSPEC\n",
    [`${DOCS}/TSPEC-${FEATURE}.md`]: "# TSPEC\n",
    [`${DOCS}/PLAN-${FEATURE}.md`]: "# PLAN\n",
    [`${DOCS}/PROPERTIES-${FEATURE}.md`]: "# PROPERTIES\n",
  };
}

/**
 * A round-`round` Phase-R cross-review pair, keyed by path.
 *
 * @param {number} round
 * @param {{ approving?: boolean, hash?: string|null }} [opts]
 */
function reqReviewPair(round, opts = {}) {
  const tree = {};
  for (const slug of R_ROLE_SLUGS) {
    tree[`${DOCS}/CROSS-REVIEW-${slug}-REQ-v${round}.md`] = crossReviewDoc(opts);
  }
  return tree;
}

// ─── Harness ─────────────────────────────────────────────────────────────────

const APPROVING_REVIEW =
  'Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
const NEEDS_REVISION_REVIEW =
  'Review with issues.\nVERDICT: Needs revision\n{"high": 1, "medium": 0, "low": 0}\n';

const REVIEWER_SKILLS = ["se-review", "pm-review", "te-review"];
const AUTHOR_SKILLS = ["pm-author", "se-author", "te-author"];

/** `reviewLoop`'s POSTMORTEM dispatch — `Write {path}. Include sections: …`. */
const POSTMORTEM_PROMPT_RE = /^Write (\S*POSTMORTEM-[^\s.]+\.md)\./;

/** Basenames directly under `dirPath`, computed live off the fake tree. */
function basenamesUnder(files, dirPath) {
  const prefix = `${dirPath}/`;
  return Object.keys(files)
    .filter((p) => p.startsWith(prefix) && !p.slice(prefix.length).includes("/"))
    .map((p) => p.slice(prefix.length));
}

/**
 * Drive `orchestrate-dev`'s `main()` over an in-memory tree with every seam of
 * TSPEC §3 injected. Every double is synchronous (§8.1); production `await`s
 * them and a sync return resolves.
 *
 * @param {{
 *   files?: Record<string,string>,
 *   verdictFor?: (skill: string, prompt: string) => string,
 *   postmortem?: "write"|"throw",
 *   recordQueueRowResult?: any,
 *   extraArgs?: object,
 * }} [opts]
 */
async function run({
  reqPath = REQ_PATH,
  files = baseTree(),
  verdictFor = () => APPROVING_REVIEW,
  postmortem = "write",
  recordQueueRowResult = undefined,
  extraArgs = {},
} = {}) {
  const fs = fakeFs(files);
  const listFiles = fakeListFiles((dirPath) =>
    basenamesUnder(fs.files, dirPath)
  );
  const recordQueueRow = recordingRecordQueueRow(recordQueueRowResult);
  const logs = [];
  const dispatches = [];

  const agentFn = async (skill, prompt) => {
    const text = typeof prompt === "string" ? prompt : "";
    dispatches.push({ skill, prompt: text });

    const pm = POSTMORTEM_PROMPT_RE.exec(text);
    if (pm) {
      if (postmortem === "throw") throw new Error("agent transport failed");
      fs.writeFile(pm[1], postmortemDoc());
      return "Post-mortem written.";
    }
    if (REVIEWER_SKILLS.includes(skill)) return verdictFor(skill, text);
    if (AUTHOR_SKILLS.includes(skill)) {
      if (text.includes("DECISIONS_WARRANTED")) {
        return "Finalized.\nDECISIONS_WARRANTED: false";
      }
      if (text.includes("Return a JSON object")) {
        return JSON.stringify({
          tasks: [{ id: "T1", description: "x", dependencies: [], planBatch: 1 }],
        });
      }
      // Fix B (`orchestrate-dev.js` §5.6's optimizer no-op halt): the
      // round-exhaustion fixture (`nonConvergingAtR`) needs the optimizer to
      // visibly revise `doc` on every FAIL-path dispatch, or the very first
      // such episode now halts on its own no-op before the round budget (§6.3)
      // is ever reached — the wrong exit for every "did not converge" oracle
      // below. `optimizerPrompt` puts the target path and iteration number in
      // its own wording ("Address reviewer feedback on {doc} for phase {phase}
      // of feature {feature}. Iteration {n} …"), so pull them straight out of
      // it and write varying, still-complete content — leaving every OTHER
      // AUTHOR_SKILLS shape (creator dispatches, DECISIONS_WARRANTED, the JSON
      // plan) untouched.
      const opt = /Address reviewer feedback on (\S+) for phase \S+ of feature \S+\. Iteration (\d+)/.exec(
        text
      );
      if (opt) {
        fs.writeFile(opt[1], `${REQ_TEXT}\n<!-- revision iteration ${opt[2]} -->`);
      }
      // A COMPLIANT author (TSPEC §7.4 / §8.4) ends its reply with the
      // `REVISION-COMPLETE:` trailer. §5.6.2 makes a revision episode terminal
      // on structural completeness AND the trailer, so a double that narrates
      // without it burns §3.8's no-progress budget and halts the phase in the
      // pacing wrapper — which is not the exit any oracle in this file is about.
      // Every test here needs the phase to reach either its round budget (§6.3)
      // or the gate (§5.8).
      return "Document created.\nREVISION-COMPLETE: yes";
    }
    if (skill === "dod-verify") return "Clean.\nDOD_STATUS: passed";
    if (skill === "ship-pr") {
      if (text.includes("Rebase")) return "Rebased.\nREBASE_STATUS: clean";
      if (text.includes("pull request")) {
        return "PR opened.\nPR_URL: https://github.com/acme/repo/pull/42";
      }
      return "Checks.\nCI_STATUS: passed";
    }
    return "Success.";
  };

  const result = await main({
    reqPath,
    _agent: agentFn,
    _parallel: (p) => Promise.all(p),
    _log: (...args) => logs.push(args.join(" ")),
    _phase: () => {},
    _pipeline: async (label, fn) => fn(),
    _checkFile: fs.checkFile,
    _readFile: fs.readFile,
    _hashFile: fs.hashFile,
    _writeFile: fs.writeFile,
    _appendFile: fs.appendFile,
    _listFiles: listFiles,
    _recordQueueRow: recordQueueRow,
    _mergeWorktree: async () => ({ ok: true }),
    _raisePrAndVerifyCi: async () => ({
      prUrl: "https://x/pull/1",
      ciStatus: "passed",
    }),
    ...extraArgs,
  });

  return {
    result,
    fs,
    listFiles,
    recordQueueRow,
    logs,
    dispatches,
    phaseOf: (id) => (result.phases || []).find((p) => p.phase === id),
    reportText: JSON.stringify(result),
  };
}

/** Reviewers that never approve the REQ, so Phase R exhausts its round budget. */
const nonConvergingAtR = (skill, prompt) =>
  prompt.includes(`REQ-${FEATURE}.md`) ? NEEDS_REVISION_REVIEW : APPROVING_REVIEW;

// ─── §6.3 / §6.5: the terminal exit and the queue-row commit ─────────────────
/** A queue document carrying an `in-progress` row for the feature under test. */
const QUEUE_WITH_FOO = `# PDLC Queue

| Order | Status | Feature | REQ Path | Depends-On |
|-------|--------|---------|----------|------------|
| 1 | in-progress | foo | docs/foo/REQ-foo.md | — |
| 2 | pending | bar | docs/bar/REQ-bar.md | foo |
`;

describe("RLH-25: the terminal exit and the queue row", () => {
  it("RLH-AT-21: non-convergence commits the `halted` row under orchestrate-queue", async () => {
    // AC-2.1 / FSPEC AT-21. The orchestrator half: a phase that exhausts its
    // round budget must *reach* the committing status write. The write itself
    // is `RLH-AT-30-module`…`-34-module`'s; here it is wired the way TSPEC §3.5
    // says `orchestrate-queue`'s `_runPipeline` wires it — a closure over the
    // queue path and `rewriteStatus` — so that "reaches the write" is observed
    // as the two §6.5 `_git` invocations actually happening.
    const queueFs = fakeFs({ [DEFAULT_QUEUE_PATH]: QUEUE_WITH_FOO });
    const git = fakeGit();
    const rewriteStatus = queueModule.rewriteStatus;
    expect(typeof rewriteStatus).toBe("function");

    const queueBackedRecordQueueRow = async ({ feature, status }) =>
      rewriteStatus(
        DEFAULT_QUEUE_PATH,
        feature,
        status,
        queueFs.readFile,
        queueFs.writeFile,
        git
      );

    const { result } = await run({
      verdictFor: nonConvergingAtR,
      extraArgs: { _recordQueueRow: queueBackedRecordQueueRow },
    });

    expect(result.outcome).toBe("halted");

    // PROP-M-17 (PLAN A8) — the halted-before-Phase-MERGE quarter of the
    // report-totality domain: this run never reaches `phaseMerge` at all
    // (it halts in Phase R), so the report carries `buildFinalReport`'s bare
    // defaults (TSPEC §10.1, FSPEC §11 row 23) rather than a real
    // `MergeOutcome` — present, via `Object.hasOwn`, and exactly `"skipped"`
    // / `null` / `null`.
    expect(Object.hasOwn(result, "mergeStatus")).toBe(true);
    expect(Object.hasOwn(result, "mergeSha")).toBe(true);
    expect(Object.hasOwn(result, "mergeMethod")).toBe(true);
    expect(result.mergeStatus).toBe("skipped");
    expect(result.mergeSha).toBeNull();
    expect(result.mergeMethod).toBeNull();

    // The row reads `halted` on disk …
    expect(queueFs.writes).toHaveLength(1);
    expect(queueFs.writes[0].path).toBe(DEFAULT_QUEUE_PATH);
    expect(queueFs.files[DEFAULT_QUEUE_PATH]).toMatch(
      /\|\s*1\s*\|\s*halted\s*\|\s*foo\s*\|/
    );
    // … the row for the *other* feature is untouched …
    expect(queueFs.files[DEFAULT_QUEUE_PATH]).toMatch(
      /\|\s*2\s*\|\s*pending\s*\|\s*bar\s*\|/
    );

    // … and exactly the §6.5 commit exists, pathspec-scoped to the queue file.
    expect(git.commands).toEqual([
      `add -- ${DEFAULT_QUEUE_PATH}`,
      `commit -m chore(queue): foo → halted -- ${DEFAULT_QUEUE_PATH}`,
    ]);
    expect(result.queueRow).toBe("recorded");
  });

  it("RLH-AT-22: the halt never claims a POSTMORTEM that was not written", async () => {
    // AC-2.2 / E-32 / §6.4 row 2. The POSTMORTEM agent throws, so `_checkFile`
    // finds nothing at the path and the halt must say so. §6.3 step 2 is the
    // crux: the confirmation, not the agent's reply, decides.
    const { result, fs } = await run({
      verdictFor: nonConvergingAtR,
      postmortem: "throw",
    });

    expect(result.outcome).toBe("halted");
    expect(result.postmortemStatus).toBe("write_failed");
    expect(result.haltReason).toContain("Post-mortem write FAILED");
    expect(result.haltReason).toContain(POSTMORTEM_R);

    // Not one reason string anywhere in the report may claim the write.
    expect(JSON.stringify(result)).not.toContain("POSTMORTEM written");
    expect(JSON.stringify(result)).not.toContain("Post-mortem written at");

    // And nothing was written, which is the fact the report is describing.
    expect(fs.writes.map((w) => w.path)).not.toContain(POSTMORTEM_R);
  });

  it("RLH-AT-23: the halt report carries §4.7's four fields, fully substituted", async () => {
    // AC-2.5 / FSPEC §12.6. A consumer never has to parse the reason string,
    // and no un-substituted `{feature}` template reaches a report (§6.3's
    // general rule — today's `postmortemPath` carries literal braces).
    const { result } = await run({ verdictFor: nonConvergingAtR });

    expect(result.outcome).toBe("halted");
    expect(Object.keys(result)).toEqual(
      expect.arrayContaining([
        "haltPhase",
        "postmortemPath",
        "postmortemStatus",
        "queueRow",
      ])
    );

    expect(result.haltPhase).toBe("R");
    expect(result.postmortemPath).toBe(POSTMORTEM_R);
    expect(result.postmortemPath).not.toContain("{feature}");
    expect(result.postmortemStatus).toBe("written");
    expect(Object.values(queueModule.QUEUE_ROW_DISPOSITIONS)).toContain(
      result.queueRow
    );

    // The whole report, not just this field, is free of un-substituted braces.
    expect(JSON.stringify(result)).not.toMatch(/\{feature\}|\{DOC-TYPE\}/);
  });
});

// ─── §2.5 step G / §5.8: the POSTMORTEM gate ─────────────────────────────────
/**
 * FSPEC §12.4's two worked examples, **copied verbatim** from
 * `docs/pdlc-review-loop-hardening/FSPEC-pdlc-review-loop-hardening.md`
 * ("The two reachable worked examples, carried through unchanged"). PLAN §7.3
 * names this pair as the guard against a gate placed ahead of §12.4 step 1
 * (breaks A) or reachable only from step 4 (breaks B); both are driven as
 * fixtures below, and the row text is reproduced here so a spec edit that
 * changes an example is visible as a diff in this file.
 */
const FSPEC_12_4_EXAMPLE_A = Object.freeze({
  case: "A — pre-harvest, skip fires",
  state:
    "Phase R converged, pipeline has not reached Phase H, so the `CROSS-REVIEW-{role}-REQ-v{N}.md` pair is still on the branch with same-round approving verdict fields; an unresolved `POSTMORTEM-R-{feature}.md` is also present",
  outcome:
    "**Phase R is skipped**, the run continues to Phase F, and the report names **both** the approval and the still-open POSTMORTEM",
});

const FSPEC_AC_2_3B_EXAMPLE_B = Object.freeze({
  case: "B — harvested, skip does not fire",
  state:
    "`pdlc-workflow-distribution` at HEAD: `POSTMORTEM-R-pdlc-workflow-distribution.md` present, **zero** `CROSS-REVIEW-*` files (Phase H deleted all 62 — §4a A-7), and its LEARNINGS predates §9's approval record",
  outcome:
    "The verdict is unreadable, AC-4.2a fails closed, Phase R **would run**, so AC-2.3 **refuses and halts**, reproducing the Recommendation. This is the correct outcome, not a defect. The operator's **sole** route is AC-2.4.",
});

describe("RLH-25: the POSTMORTEM gate", () => {
  it("RLH-AT-24: an unresolved POSTMORTEM refuses re-entry and reproduces the Recommendation", async () => {
    // AC-2.3 / E-25 / §6.2 row 13. No `RESOLVED:` line at all and no readable
    // approval (zero cross-review files ⇒ candidate < 1 ⇒ §2.5 step G).
    const { result, phaseOf, fs } = await run({
      files: { ...baseTree(), [POSTMORTEM_R]: postmortemDoc() },
    });

    expect(result.outcome).toBe("halted");
    expect(result.haltPhase).toBe("R");
    expect(result.postmortemStatus).toBe("unresolved");
    expect(result.postmortemPath).toBe(POSTMORTEM_R);

    // §6.4's third, distinct shape: the refusal, not a non-convergence halt.
    expect(result.haltReason).toContain(
      `Phase R refused: unresolved POSTMORTEM at ${POSTMORTEM_R}`
    );
    // FSPEC §12.5 — verbatim, no summarisation, no agent in the path.
    expect(result.haltReason).toContain(RECOMMENDATION_BODY);
    // …and the operator's sole route is named.
    expect(result.haltReason).toContain("AC-2.4");
    expect(result.haltReason).toContain("RESOLVED: yes");

    // A refusal is not a non-convergence: no POSTMORTEM is authored over it.
    expect(fs.files[POSTMORTEM_R]).toBe(postmortemDoc());
    expect(result.haltReason).not.toContain("did not converge");
    expect(phaseOf("F")).toBeUndefined();
  });

  it("RLH-AT-25: a POSTMORTEM carrying one `RESOLVED: yes` permits re-entry", async () => {
    // AC-2.4. The marker is positionally unconstrained and human-written only;
    // `checkPostmortem` is a query, and `resolved` simply lets step 5 run.
    const { result, dispatches, phaseOf, fs } = await run({
      files: {
        ...baseTree(),
        [POSTMORTEM_R]: postmortemDoc({ resolved: "yes" }),
      },
    });

    expect(result.outcome).toBe("success");
    expect(result.haltReason).toBeUndefined();

    // "Permits" only means something if the marker was consulted: step G is on
    // every path that reaches step 5 (G-INV), so the file must have been read.
    expect(fs.reads.map((r) => r.path)).toContain(POSTMORTEM_R);

    // Phase R actually ran: its reviewer pair was dispatched over the REQ.
    const rReviews = dispatches.filter(
      (d) =>
        ["se-review", "te-review"].includes(d.skill) &&
        d.prompt.includes(REQ_PATH)
    );
    expect(rReviews.length).toBeGreaterThanOrEqual(2);
    expect(phaseOf("R").status).not.toBe("⏭");
  });

  /**
   * `approvalHashOf` (TSPEC §3.7) is the only producer of a `FRESH` anchor, so
   * example A's "same-round approving verdict fields" fixture is built with the
   * module's own digest rather than a hand-written constant that could agree
   * with a wrong implementation.
   */
  function freshAnchorFor(text) {
    expect(typeof dev.approvalHashOf).toBe("function");
    return dev.approvalHashOf(text);
  }

  /** FSPEC §12.4 example A's tree, built from the row quoted above. */
  function exampleATree() {
    return {
      ...baseTree(),
      ...reqReviewPair(1, { approving: true, hash: freshAnchorFor(REQ_TEXT) }),
      [POSTMORTEM_R]: postmortemDoc(),
    };
  }

  it("RLH-AT-26: the skip reports the open POSTMORTEM without resolving it", async () => {
    // E-26 / §6.2 row 13a, driving FSPEC §12.4 example A verbatim.
    expect(FSPEC_12_4_EXAMPLE_A.case).toContain("skip fires");

    const before = postmortemDoc();
    const { result, phaseOf, fs } = await run({ files: exampleATree() });

    // "Phase R is skipped, the run continues to Phase F …"
    expect(phaseOf("R").status).toBe("⏭");
    expect(phaseOf("F")).toBeDefined();
    expect(result.outcome).toBe("success");

    // "… and the report names both the approval and the still-open POSTMORTEM."
    // §4.7 fixes the line verbatim, bracketed clause and all.
    expect(phaseOf("R").detail).toContain(
      `Skipped — approved round 1, hash FRESH; unresolved POSTMORTEM at ${POSTMORTEM_R}`
    );

    // The skip is not a halt, but the state is still reported structurally.
    expect(result.haltPhase).toBeNull();
    expect(result.postmortemStatus).toBe("unresolved");
    expect(result.postmortemPath).toBe(POSTMORTEM_R);

    // "without resolving it" — byte-identical on disk, never written, never
    // appended to. `checkPostmortem` is a query (§5.8) and the marker is
    // human-written only.
    expect(fs.files[POSTMORTEM_R]).toBe(before);
    expect(fs.writes.map((w) => w.path)).not.toContain(POSTMORTEM_R);
    expect(fs.appends.map((a) => a.path)).not.toContain(POSTMORTEM_R);
  });

  it("RLH-AT-27: refusal is keyed on (phase, feature) — F, T, P and D are unaffected", async () => {
    // AC-2.3a / E-27. Only `POSTMORTEM-R-foo.md` exists; the gate is consulted
    // per phase at `docs/{feature}/POSTMORTEM-{phaseId}-{feature}.md` (§6.3),
    // so no other phase sees it.
    const { result, fs, phaseOf } = await run({ files: exampleATree() });

    expect(result.outcome).toBe("success");
    expect(result.haltReason).toBeUndefined();

    for (const phaseId of ["F", "T", "P", "PR"]) {
      expect(phaseOf(phaseId)).toBeDefined();
      // The gate ran for this phase, against this phase's own path …
      expect(fs.reads.map((r) => r.path)).toContain(
        `${DOCS}/POSTMORTEM-${phaseId}-${FEATURE}.md`
      );
      // … and found nothing, so nothing was refused.
      expect(phaseOf(phaseId).detail || "").not.toContain("refused");
    }
    for (const phaseId of ["F", "T", "P", "D", "PR"]) {
      expect(JSON.stringify(result)).not.toContain(`Phase ${phaseId} refused`);
    }
  });

  // ── FSPEC AC-2.3b example B, verbatim ──────────────────────────────────────
  const FEATURE_B = "pdlc-workflow-distribution";
  const DOCS_B = `docs/${FEATURE_B}`;
  const REQ_B = `${DOCS_B}/REQ-${FEATURE_B}.md`;
  const POSTMORTEM_R_B = `${DOCS_B}/POSTMORTEM-R-${FEATURE_B}.md`;

  /**
   * "`pdlc-workflow-distribution` at HEAD: `POSTMORTEM-R-…` present, **zero**
   * `CROSS-REVIEW-*` files (Phase H deleted all 62), and its LEARNINGS predates
   * §9's approval record."
   */
  function exampleBTree() {
    return {
      [REQ_B]: REQ_TEXT,
      [`${DOCS_B}/FSPEC-${FEATURE_B}.md`]: "# FSPEC\n",
      [`${DOCS_B}/TSPEC-${FEATURE_B}.md`]: "# TSPEC\n",
      [`${DOCS_B}/PLAN-${FEATURE_B}.md`]: "# PLAN\n",
      [`${DOCS_B}/PROPERTIES-${FEATURE_B}.md`]: "# PROPERTIES\n",
      [`${DOCS_B}/LEARNINGS-${FEATURE_B}.md`]:
        "# Learnings\n\n## 1. What worked\n\nNothing here predates §9's approval record.\n",
      [POSTMORTEM_R_B]: postmortemDoc(),
    };
  }

  it("RLH-AT-13a: G-INV totality — every exit that leads to running the phase passes step G", async () => {
    // TSPEC §2.5's G-INV, stated over *paths*, not step numbers: no exit —
    // forced, no candidate, not approving, STALE, UNEVALUABLE — may reach
    // `reviewLoop` without having passed step G. PLAN §7.3: a gate ahead of
    // §12.4 step 1 breaks example A, a gate reachable only from step 4 breaks
    // example B, so both are driven here.
    expect(FSPEC_AC_2_3B_EXAMPLE_B.outcome).toContain("refuses and halts");

    const STALE_ANCHOR = `sha256:${"0".repeat(64)}`;
    const gatedExits = [
      {
        // §2.5 step 1 — forcing removes the skip, so the phase would run; force
        // overrides recorded approval, never recorded failure (AC-4.6a).
        exit: "forced",
        reqPath: REQ_PATH,
        postmortemPath: POSTMORTEM_R,
        files: exampleATree(),
        extraArgs: { forcePhases: "R" },
      },
      {
        // §2.5 step 3, `candidate < 1` — FSPEC AC-2.3b example B, verbatim.
        exit: "candidate < 1 (example B)",
        reqPath: REQ_B,
        postmortemPath: POSTMORTEM_R_B,
        files: exampleBTree(),
      },
      {
        // §2.5 step 3, NOT APPROVING.
        exit: "NOT APPROVING",
        reqPath: REQ_PATH,
        postmortemPath: POSTMORTEM_R,
        files: {
          ...baseTree(),
          ...reqReviewPair(1, { approving: false }),
          [POSTMORTEM_R]: postmortemDoc(),
        },
      },
      {
        // §2.5 step 4, STALE — the recorded anchor parses but does not match.
        exit: "STALE",
        reqPath: REQ_PATH,
        postmortemPath: POSTMORTEM_R,
        files: {
          ...baseTree(),
          ...reqReviewPair(1, { approving: true, hash: STALE_ANCHOR }),
          [POSTMORTEM_R]: postmortemDoc(),
        },
      },
      {
        // §2.5 step 4, UNEVALUABLE — no `APPROVAL-HASH:` line at all.
        exit: "UNEVALUABLE",
        reqPath: REQ_PATH,
        postmortemPath: POSTMORTEM_R,
        files: {
          ...baseTree(),
          ...reqReviewPair(1, { approving: true, hash: null }),
          [POSTMORTEM_R]: postmortemDoc(),
        },
      },
    ];

    for (const c of gatedExits) {
      const { result } = await run({
        reqPath: c.reqPath,
        files: c.files,
        extraArgs: c.extraArgs ?? {},
      });

      expect([c.exit, result.outcome]).toEqual([c.exit, "halted"]);
      expect([c.exit, result.haltPhase]).toEqual([c.exit, "R"]);
      expect([c.exit, result.postmortemStatus]).toEqual([c.exit, "unresolved"]);
      expect([c.exit, result.postmortemPath]).toEqual([
        c.exit,
        c.postmortemPath,
      ]);
      expect(result.haltReason).toContain(
        `Phase R refused: unresolved POSTMORTEM at ${c.postmortemPath}`
      );
      // The Recommendation is reproduced verbatim on every one of them.
      expect(result.haltReason).toContain(RECOMMENDATION_BODY);
    }

    // The fifth exit is the one that does NOT refuse: step 4's `FRESH` branch
    // skips the phase, so AC-2.3 has nothing to refuse — but §6.2 row 13a and
    // §4.7 still require the notice to name it. Both halves matter.
    const fresh = await run({ files: exampleATree() });
    expect(fresh.result.outcome).toBe("success");
    expect(fresh.result.haltPhase).toBeNull();
    expect(fresh.phaseOf("R").status).toBe("⏭");
    expect(fresh.phaseOf("R").detail).toContain(
      `; unresolved POSTMORTEM at ${POSTMORTEM_R}`
    );
    expect(JSON.stringify(fresh.result)).not.toContain("Phase R refused");
  });
});

// ─── PLAN §7.4: the orchestrator half of AT-30…AT-34 ─────────────────────────
describe("RLH-25: which halting exit reaches the committing status write", () => {
  /**
   * Three structurally different halting exits of `orchestrate-dev`, each
   * thrown from inside the pipeline and each carrying a resolved feature name.
   * §6.5's "Halt classes: both" is why the set is not just non-convergence.
   */
  const HALTING_EXITS = [
    {
      exit: "Phase R non-convergence (§6.3)",
      opts: { verdictFor: nonConvergingAtR },
    },
    {
      exit: "Phase DOD (§6.2, a non-POSTMORTEM halt class)",
      opts: {
        extraArgs: {
          _dodVerifyLoop: async () => {
            throw new Error("Error: Phase DOD — unremediated findings remain");
          },
        },
      },
    },
    {
      exit: "Phase PUB CI failure",
      opts: {
        extraArgs: {
          _raisePrAndVerifyCi: async () => {
            throw new Error(
              "Error: Phase PUB — GHA checks failed for PR https://x/pull/1"
            );
          },
        },
      },
    },
  ];

  it("RLH-AT-30-orch: every halting exit reaches the write, and an absent row is an error", async () => {
    // AC-2.6 / E-40. Conjunct 1 — reach: each halting exit records the row
    // exactly once, with `status: "halted"` and the resolved feature name.
    const seen = [];
    for (const { exit, opts } of HALTING_EXITS) {
      const { result, recordQueueRow } = await run(opts);
      seen.push({
        exit,
        outcome: result.outcome,
        recorded: recordQueueRow.records,
      });
    }
    // Every exit halts …
    expect(seen.map((s) => [s.exit, s.outcome])).toEqual(
      HALTING_EXITS.map((e) => [e.exit, "halted"])
    );
    // … and every one of them arrives at the committing status write, once.
    expect(seen.map((s) => [s.exit, s.recorded])).toEqual(
      HALTING_EXITS.map((e) => [
        e.exit,
        [{ feature: FEATURE, status: "halted" }],
      ])
    );

    // Conjunct 2 — the row was removed mid-run, so the write it expected to
    // make found nothing. `updateQueueStatus` no longer returns the document
    // unchanged (§4.6), so the orchestrator can report it.
    const detail = `no row for ${FEATURE} in ${DEFAULT_QUEUE_PATH}`;
    const { result } = await run({
      verdictFor: nonConvergingAtR,
      recordQueueRowResult: { queueRow: "error", detail },
    });

    expect(result.queueRow).toBe("error");
    expect(JSON.stringify(result)).toContain(FEATURE);
    expect(JSON.stringify(result)).toContain(DEFAULT_QUEUE_PATH);
    // The halt itself is not downgraded by the bookkeeping failure.
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toContain("did not converge");
  });

  it("RLH-AT-31-orch: a direct invocation with no queue reports one failure, not two", async () => {
    // AC-2.6a / E-41. `_recordQueueRow`'s default is a no-op reporting "none"
    // (§3.5): a repo with no queue must not turn one halt into two.
    const { result } = await run({
      verdictFor: nonConvergingAtR,
      recordQueueRowResult: { queueRow: "none" },
    });

    expect(result.outcome).toBe("halted");
    expect(result.queueRow).toBe("none");
    expect(result.haltReason).toContain("did not converge");

    // Exactly one failure: nothing in the report blames the queue.
    const text = JSON.stringify(result);
    expect(text).not.toContain(DEFAULT_QUEUE_PATH);
    expect(text).not.toContain("queue row");
    expect(text).not.toContain("uncommitted");
  });

  it("RLH-AT-32-orch: a successful bypass run never writes a status", async () => {
    // AC-2.7a / E-42. A direct invocation that succeeds does not recover a
    // `halted` row — `orchestrate-dev` owns no status write but the halt one,
    // so the row survives the bypass and the next `/loop` iteration is `idle`.
    // (That the row itself stays put is `RLH-AT-32-module`'s.)
    const { result, recordQueueRow } = await run();

    expect(result.outcome).toBe("success");
    expect(recordQueueRow.statuses).not.toContain("halted");
    expect(recordQueueRow.statuses).not.toContain("pending");
    expect(recordQueueRow.statuses).not.toContain("done");
    expect(result.queueRow).toBe("none");
  });

  it("RLH-AT-32-orch-merged: a successful run that MERGES DOES write a status, superseding the premise above (PLAN A8)", async () => {
    // TSPEC §10.4 / FSPEC §11 row 3. The sibling of RLH-AT-32-orch: that test's
    // "success never writes" premise holds only when Phase MERGE resolves to
    // `skipped`/`deferred`/`refused` (`mergeOutcome.queueRow` is `null`, and
    // `queueRow: mergeOutcome.queueRow ?? "none"` falls back to `"none"`). A
    // run whose PR is already `MERGED` (row 3) reaches Phase MERGE's own
    // queue write-back (M4) and DOES record a status — `"done"` — which
    // `result.queueRow` then carries verbatim as the `"recorded"` disposition
    // the double returns, not `"none"`.
    const MERGED_OID = "abc1234567890abcdef";
    const files = {
      ...baseTree(),
      ".claude/pdlc.config.json": JSON.stringify({ merge: { mergeMode: "gated" } }),
    };
    const ghRun = fakeGhRun(
      passingGh({
        prState: {
          stdout: JSON.stringify({
            state: "MERGED",
            mergeable: "MERGEABLE",
            mergeStateStatus: "CLEAN",
            number: 42,
            mergeCommit: { oid: MERGED_OID },
          }),
        },
      })
    );
    // `_git` also feeds `ensureFeatureBranch`'s branch guard (any injected,
    // non-default `_git` activates it, TSPEC-independent — orchestrate-dev.js's
    // own `branchGuardTransport`), so `rev-parse` must report the tree is
    // already on `feat-foo`, not just answer Phase MERGE's own subcommands.
    const mergeGit = fakeMergeGit({
      "rev-parse": { ok: true, stdout: "feat-foo\n", stderr: "" },
    });

    const { result, recordQueueRow } = await run({
      files,
      recordQueueRowResult: { queueRow: "recorded" },
      extraArgs: {
        _ghRun: ghRun._ghRun,
        _git: mergeGit._git,
        _now: fakeMergeNow,
        _sleep: fakeMergeSleep,
        _raisePrAndVerifyCi: async () => ({
          prUrl: "https://github.com/acme/foo/pull/42",
          ciStatus: "passed",
        }),
      },
    });

    expect(result.outcome).toBe("success");
    expect(result.mergeStatus).toBe("merged");
    expect(result.mergeSha).toBe(MERGED_OID);
    expect(recordQueueRow.statuses).toContain("done");
    expect(result.queueRow).toBe("recorded");
  });

  it("RLH-AT-33-orch: a failed commit is non-fatal, surfaced, and subordinate", async () => {
    // E-38 / §6.5. The row is correct on disk but `git commit` failed; the
    // operator's remaining action is a manual commit, which is a different
    // action from `"error"`'s re-run — hence the distinct value.
    const manual = `git commit -m "chore(queue): ${FEATURE} → halted" -- ${DEFAULT_QUEUE_PATH}`;
    const { result } = await run({
      verdictFor: nonConvergingAtR,
      recordQueueRowResult: {
        queueRow: "recorded (uncommitted)",
        detail: `queue row written but not committed; run: ${manual}`,
      },
    });

    expect(result.outcome).toBe("halted");
    expect(result.queueRow).toBe("recorded (uncommitted)");
    // The manual-commit instruction reaches the operator …
    //
    // Compared against the JSON-ESCAPED form: `manual` carries the double quotes
    // of `-m "chore(queue): …"`, and `JSON.stringify` escapes every one of them,
    // so a raw `toContain(manual)` is unsatisfiable for any implementation that
    // puts the detail in the report at all. `JSON.stringify(manual).slice(1, -1)`
    // is the same string under the same escaping the report is being read
    // through, so the conjunct still fails on an implementation that drops the
    // detail — which is what it is for.
    expect(JSON.stringify(result)).toContain(JSON.stringify(manual).slice(1, -1));
    // … and the original halt reason is reported first, not displaced by it.
    expect(result.haltReason.startsWith("Phase R did not converge")).toBe(true);
  });

  it("RLH-AT-34-orch: nothing to commit is success, and silent", async () => {
    // E-39. The row already reads `halted` and is already committed, so the
    // status write is a no-op. A no-op is not a fault and must not be narrated.
    const { result, logs } = await run({
      verdictFor: nonConvergingAtR,
      recordQueueRowResult: { queueRow: "recorded" },
    });

    expect(result.queueRow).toBe("recorded");

    const noise = /nothing to commit|queue row|uncommitted|WARNING: .*queue/i;
    expect(logs.filter((line) => noise.test(line))).toEqual([]);
    expect(JSON.stringify(result)).not.toMatch(noise);
    // Still a halt, for its own reason.
    expect(result.haltReason).toContain("did not converge");
  });
});
