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
  recordingRecordHalt,
} from "./helpers/seams.js";

// ─── Fixture vocabulary ──────────────────────────────────────────────────────

const FEATURE = "foo";
const DOCS = `docs/${FEATURE}`;
const REQ_PATH = `${DOCS}/REQ-${FEATURE}.md`;
const POSTMORTEM_R = `${DOCS}/POSTMORTEM-R-${FEATURE}.md`;

/** Phase R's reviewer pair, and their `CROSS-REVIEW-{role}-…` slugs (§5.2 G-2). */
const R_ROLE_SLUGS = ["software-engineer", "test-engineer"];

const REQ_TEXT = [
  "# REQ — foo",
  "",
  "## Acceptance Criteria",
  "",
  "AC-1. The thing works.",
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
 *   recordHaltResult?: any,
 *   extraArgs?: object,
 * }} [opts]
 */
async function run({
  files = baseTree(),
  verdictFor = () => APPROVING_REVIEW,
  postmortem = "write",
  recordHaltResult = undefined,
  extraArgs = {},
} = {}) {
  const fs = fakeFs(files);
  const listFiles = fakeListFiles((dirPath) =>
    basenamesUnder(fs.files, dirPath)
  );
  const recordHalt = recordingRecordHalt(recordHaltResult);
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
      return "Document created.";
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
    reqPath: REQ_PATH,
    _agent: agentFn,
    _parallel: (p) => Promise.all(p),
    _log: (...args) => logs.push(args.join(" ")),
    _phase: () => {},
    _pipeline: async (label, fn) => fn(),
    _checkFile: fs.checkFile,
    _readFile: fs.readFile,
    _writeFile: fs.writeFile,
    _appendFile: fs.appendFile,
    _listFiles: listFiles,
    _recordHalt: recordHalt,
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
    recordHalt,
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

    const queueBackedRecordHalt = async ({ feature, status }) =>
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
      extraArgs: { _recordHalt: queueBackedRecordHalt },
    });

    expect(result.outcome).toBe("halted");

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
    expect(result.queueRow).toBe("halted");
  });
});

// ─── §2.5 step G / §5.8: the POSTMORTEM gate ─────────────────────────────────
describe("RLH-25: the POSTMORTEM gate", () => {
  // RLH-AT-24, RLH-AT-25, RLH-AT-26, RLH-AT-27, RLH-AT-13a
});

// ─── PLAN §7.4: the orchestrator half of AT-30…AT-34 ─────────────────────────
describe("RLH-25: which halting exit reaches the committing status write", () => {
  // RLH-AT-30-orch … RLH-AT-34-orch
});
