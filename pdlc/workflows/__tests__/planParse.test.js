/**
 * planParse.test.js — the PLAN task-table grammar and the Phase P self-parse gate
 * (PROPOSAL-orchestrate-dev-optimization §3.3, Slice A step 3).
 *
 * ## The defect this file pins
 *
 * `parsePlanTasks` used to identify a task table by LOOSE SUBSTRING match on the
 * header cells (`cell.includes("id")`, `cell.includes("depend")`) over a FLAT list
 * of every pipe row in the document. Two things went wrong at once:
 *
 * 1. Ordinary data tables — risk registers, disposition tables, acceptance-test
 *    tables — matched the header test, and so did prose data rows whose text
 *    merely contained the words "id" and "dependencies".
 * 2. Because the row list was flattened, the FIRST matching header swallowed
 *    every subsequent pipe row in the document as another "task".
 *
 * Measured against the repo's own PLANs before the fix:
 * `PLAN-pdlc-review-loop-hardening.md` parsed to 289 "tasks" (it has 31) and
 * `PLAN-pdlc-workflow-distribution.md` to 247 (it has 61 — the PLAN says so in
 * its own §-note: "still 61 tasks / 22 batches").
 *
 * ## Oracle-quality rules this file obeys (PROPOSAL §3.5)
 *
 * - **No implementation echoes.** Every expected count and every expected task id
 *   is a LITERAL in this file, transcribed by reading the excerpted table, never
 *   derived from the subject or from a helper that shares its logic.
 * - **Set equality, not containment.** The fixture expectations compare the WHOLE
 *   id list, so an extra swallowed row reds just as loudly as a dropped task.
 * - **No absence-only oracles.** Every rejection case is paired, in the same
 *   document, with a minimal valid task table that must still parse; every
 *   "later phases never ran" assertion is paired with a positive conjunct that
 *   the earlier phase really did run.
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import * as devModule from "../orchestrate-dev.js";
import { fakeFs, fakeGit, fakeListFiles, recordingRecordQueueRow } from "./helpers/seams.js";

const main = devModule.default;
const { parsePlanTasks } = devModule;

const FIXTURE_DIR = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "planParse");
const fixture = (name) => readFileSync(join(FIXTURE_DIR, name), "utf8");

// ─── 1. Regression fixtures drawn from real PLANs ─────────────────────────────

describe("PLAN-PARSE-01: real PLANs that the loose grammar mis-parsed", () => {
  /**
   * The 31 task ids of PLAN-pdlc-review-loop-hardening's §4 task table, in
   * document order, transcribed from the table itself. The PLAN's own changelog
   * row states the count: "Task count (31), batch count (13) … unchanged".
   */
  const REVIEW_LOOP_HARDENING_IDS = [
    "**RLH-01**", "**RLH-02**", "**RLH-03**", "**RLH-04**", "**RLH-06**",
    "**RLH-11**", "**RLH-14**", "**RLH-17**", "**RLH-29**", "**RLH-31**",
    "**RLH-05**", "**RLH-07**", "**RLH-08**", "**RLH-09**", "**RLH-19**",
    "**RLH-21**", "**RLH-22**", "**RLH-24**", "**RLH-25**", "**RLH-28**",
    "**RLH-18**", "**RLH-12**", "**RLH-20**", "**RLH-16**", "**RLH-23**",
    "**RLH-26**", "**RLH-27**", "**RLH-30**", "**RLH-32**", "**RLH-33**",
    "**RLH-34**",
  ];

  /**
   * The 61 task ids of PLAN-pdlc-workflow-distribution, in document order across
   * its eight per-batch task tables. The PLAN states the count itself: "still
   * **61 tasks / 22 batches**".
   */
  const WORKFLOW_DISTRIBUTION_IDS = [
    "P0-00",
    "T-01", "T-02", "T-03", "T-04", "T-05", "T-06", "T-19",
    "T-07", "T-08a", "T-09", "T-10", "T-14", "T-08b", "T-15", "T-16", "T-17",
    "T-18", "T-39", "T-11", "T-12", "T-13",
    "T-20", "T-21", "T-22", "T-23", "T-24", "T-25", "T-26", "T-27", "T-28",
    "T-29", "T-30",
    "T-31", "T-32", "T-33", "T-34", "T-35",
    "T-36", "T-37",
    "T-38", "T-40", "T-41", "T-42", "T-43", "T-44", "T-45", "T-46", "T-47",
    "T-48", "T-49", "T-50",
    "L-02", "L-03", "L-04", "L-07", "L-08", "L-06", "L-01", "L-05", "L-09",
  ];

  /** The 17 task ids of PLAN-pdlc-merge-phase's task table, in document order. */
  const MERGE_PHASE_IDS = [
    "F1", "R1", "A1", "B1", "A2", "B2", "A3", "B3", "A4",
    "A5", "A6", "D1", "A7", "A8", "A9", "D2", "V1",
  ];

  test("PLAN-PARSE-01a: the review-loop-hardening excerpt yields exactly its 31 real tasks", () => {
    const result = parsePlanTasks(fixture("plan-review-loop-hardening.excerpt.md"));
    expect(result).not.toBeNull();
    expect(result.tasks).toHaveLength(31);
    expect(result.tasks.map((t) => t.id)).toEqual(REVIEW_LOOP_HARDENING_IDS);
    // Positive conjunct on the row payload: the parse is a real parse, not a
    // count that happens to match. RLH-01 is the pre-flight gate, dependency-free.
    expect(result.tasks[0].dependencies).toEqual([]);
    expect(result.tasks[0].planBatch).toBe(1);
  });

  test("PLAN-PARSE-01b: the workflow-distribution excerpt yields exactly its 61 real tasks across eight tables", () => {
    const result = parsePlanTasks(fixture("plan-workflow-distribution.excerpt.md"));
    expect(result).not.toBeNull();
    expect(result.tasks).toHaveLength(61);
    expect(result.tasks.map((t) => t.id)).toEqual(WORKFLOW_DISTRIBUTION_IDS);
    // Positive conjunct: eight separate task tables were joined, so the last
    // table's rows are present and carry their own batch labels.
    expect(result.tasks[result.tasks.length - 1].id).toBe("L-09");
  });

  test("PLAN-PARSE-01c: the merge-phase excerpt still yields exactly its 17 tasks (a parse the fix must preserve)", () => {
    const result = parsePlanTasks(fixture("plan-merge-phase.excerpt.md"));
    expect(result).not.toBeNull();
    expect(result.tasks).toHaveLength(17);
    expect(result.tasks.map((t) => t.id)).toEqual(MERGE_PHASE_IDS);
    expect(result.tasks[2]).toMatchObject({ id: "A1", dependencies: ["F1", "R1"], planBatch: 2 });
  });

  test("PLAN-PARSE-01d: the orchestrate-dev-workflow excerpt has no dependencies column at all → null", () => {
    // Its six task tables are `# | ID | Title | Description | Test File |
    // Source File | Complexity | Status` — no dependency column, so no DAG can be
    // derived. The loose grammar nonetheless "found" a header in the middle of
    // the third table: a data row whose Description cell contains the words
    // "id" and "dependencies", producing tasks whose ids were prose paragraphs.
    expect(parsePlanTasks(fixture("plan-orchestrate-dev-workflow.excerpt.md"))).toBeNull();
  });
});

// ─── 2. Header-grammar unit cases ─────────────────────────────────────────────

/** Build a minimal, unambiguously valid task table. Used as the positive conjunct. */
function validTable() {
  return [
    "| Task ID | Description | Dependencies |",
    "|---|---|---|",
    "| V-1 | first | - |",
    "| V-2 | second | V-1 |",
  ].join("\n");
}

describe("PLAN-PARSE-02: the header row is matched by exact cell, not substring", () => {
  test.each([
    ["Task ID / Dependencies", "| Task ID | Description | Dependencies |"],
    ["task-id / depends-on", "| task-id | Description | depends-on |"],
    ["Task_ID / Depends_On", "| Task_ID | Description | Depends_On |"],
    ["ID / Deps", "| ID | Description | Deps |"],
    ["# / Depends On", "| # | Description | Depends On |"],
    ["ID / Prerequisites", "| ID | Description | Prerequisites |"],
    ["ID / Prereqs", "| ID | Description | Prereqs |"],
    ["ID / Dependency", "| ID | Description | Dependency |"],
  ])("PLAN-PARSE-02a: accepts the header %s", (_name, header) => {
    const md = [header, "|---|---|---|", "| X-1 | only task | - |"].join("\n");
    const result = parsePlanTasks(md);
    expect(result).not.toBeNull();
    expect(result.tasks.map((t) => t.id)).toEqual(["X-1"]);
  });

  test.each([
    // A rule table: "Forbids" contains no dependency word at all, "Rule Id" is
    // not an exact id cell — and neither cell may promote this to a task table.
    ["a rule table", ["| Rule Id | Forbids | Note |", "|---|---|---|", "| C-2 | crypto | none |"]],
    // Prose in a data cell that merely mentions ids and dependencies.
    [
      "a prose row mentioning ids and dependencies",
      [
        "| Step | Note |",
        "|---|---|",
        "| 1 | Returns {tasks: [{id, dependencies}]} — depends on what the operator decided |",
      ],
    ],
    // A disposition table: exact `id` cell, but no dependency column.
    ["a disposition table", ["| Id | Sev | Disposition |", "|---|---|---|", "| F-01 | High | Fixed |"]],
    // A risk register: exact `ID` cell, and a column whose name merely *contains*
    // a dependency word inside a longer phrase.
    [
      "a risk register",
      [
        "| ID | Risk | Owning task | Mitigation, and what it depends on |",
        "|---|---|---|---|",
        "| R-1 | flaky CI | A4 | rerun |",
      ],
    ],
  ])("PLAN-PARSE-02b: rejects %s, while a real task table in the same document still parses", (_name, rows) => {
    const decoyOnly = rows.join("\n");
    expect(parsePlanTasks(decoyOnly)).toBeNull();

    // Paired positive: put the same decoy next to a genuine task table. The
    // genuine table parses, and NONE of the decoy's rows are absorbed.
    const together = [decoyOnly, "", "Some prose between the tables.", "", validTable()].join("\n");
    const result = parsePlanTasks(together);
    expect(result).not.toBeNull();
    expect(result.tasks.map((t) => t.id)).toEqual(["V-1", "V-2"]);
  });

  test("PLAN-PARSE-02c: a task table does not swallow the tables that follow it", () => {
    const md = [
      validTable(),
      "",
      "## Risks",
      "",
      "| ID | Risk | Mitigation |",
      "|---|---|---|",
      "| R-1 | flaky CI | rerun |",
      "| R-2 | slow tests | shard |",
      "",
      "## Changelog",
      "",
      "| Version | Date | Change |",
      "|---|---|---|",
      "| v1.0 | 2026-01-01 | first |",
    ].join("\n");

    const result = parsePlanTasks(md);
    expect(result.tasks.map((t) => t.id)).toEqual(["V-1", "V-2"]);
  });

  test("PLAN-PARSE-02d: the description and batch columns never reuse the id or dependencies column", () => {
    // "Task ID" contains "task", which the (deliberately looser) description
    // matcher would otherwise claim; "Dependencies" is likewise off-limits.
    const md = [
      "| Task ID | Task Summary | Batch | Dependencies |",
      "|---|---|---|---|",
      "| K-1 | do the thing | 3 | - |",
    ].join("\n");
    const result = parsePlanTasks(md);
    expect(result.tasks).toEqual([
      { id: "K-1", description: "do the thing", dependencies: [], planBatch: 3 },
    ]);
  });
});

// ─── 3. The Phase P self-parse gate, driven through main() ────────────────────
//
// Pattern: sessionAgent.test.js SESSION-04 — `main()` with every seam doubled.
// The claim is about the composition root, so the pipeline is driven end to end
// rather than a helper being called directly.

const FEATURE = "plan-gate";
const DOCS = `docs/${FEATURE}`;
const REQ = `${DOCS}/REQ-${FEATURE}.md`;
const PLAN_PATH = `${DOCS}/PLAN-${FEATURE}.md`;

/** TSPEC §5.9's required top-level headings, restated (never read off the subject). */
const REQUIRED_HEADINGS = Object.freeze({
  REQ: ["Problem / Context", "Goals", "Non-Goals", "Constraints", "Acceptance Criteria", "Risks", "Obligations"],
  FSPEC: ["Overview", "Linked Requirements", "Behavioral Flow", "Business Rules", "Edge Cases and Error Scenarios", "Acceptance Tests", "Open Questions"],
  TSPEC: ["Overview", "Architecture", "Interfaces", "Data Model", "Test Strategy", "Open Questions"],
  PLAN: ["Overview", "Batches", "Dependencies", "Verification"],
  PROPERTIES: ["Overview", "Properties", "Oracles", "Fixtures"],
});

function completeDoc(docType, body = "") {
  const parts = [`# ${FEATURE} ${docType}`, ""];
  for (const heading of REQUIRED_HEADINGS[docType]) {
    parts.push(`## ${heading}`, "", `Substantive prose for ${heading}.`, "");
    if (heading === "Batches" && body) parts.push(body, "");
  }
  return parts.join("\n");
}

const PARSEABLE_TASK_TABLE = [
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| G-1 | lay the foundation | 1 | - |",
  "| G-2 | build on it | 2 | G-1 |",
  "| G-3 | and again | 3 | G-2 |",
].join("\n");

const UNPARSEABLE_TASK_TABLE = [
  "The tasks, in order:",
  "",
  "| # | Work item | Comes after |",
  "|---|---|---|",
  "| 1 | lay the foundation | nothing |",
  "| 2 | build on it | task 1 |",
].join("\n");

const CYCLIC_TASK_TABLE = [
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| C-1 | first | 1 | C-2 |",
  "| C-2 | second | 2 | C-1 |",
].join("\n");

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

const ROLE_SLUG = Object.freeze({
  "se-review": "software-engineer",
  "pm-review": "product-manager",
  "te-review": "test-engineer",
});

function basenamesIn(files, dirPath) {
  const prefix = `${String(dirPath).replace(/\/+$/, "")}/`;
  return Object.keys(files)
    .filter((p) => p.startsWith(prefix) && !p.slice(prefix.length).includes("/"))
    .map((p) => p.slice(prefix.length))
    .sort();
}

/**
 * Drive `main()` to Phase P with a PLAN whose Batches section carries `planTable`.
 * Every reviewer approves on round 1, so each phase converges in one iteration.
 * The Phase PR creator answers with an empty string, which halts the pipeline
 * immediately after Phase P — the smallest shape in which "Phase P passed and
 * Phase PR was reached" is observable.
 */
async function runToPhaseP(planTable) {
  const fs = fakeFs({ [REQ]: completeDoc("REQ") });
  const listFiles = fakeListFiles((dirPath) => basenamesIn(fs.files, dirPath));
  const git = fakeGit((argv) =>
    argv.join(" ") === "rev-parse --abbrev-ref HEAD"
      ? { ok: true, stdout: `feat-${FEATURE}\n` }
      : { ok: true }
  );
  const calls = [];

  const agent = async (skill, prompt) => {
    const text = String(prompt ?? "");
    calls.push({ skill, prompt: text });

    // Which document is this dispatch about? Longest path first.
    const docType = ["PROPERTIES", "PLAN", "TSPEC", "FSPEC", "REQ"].find((d) =>
      text.includes(`${DOCS}/${d}-${FEATURE}.md`)
    );

    if (skill === "se-review" || skill === "te-review" || skill === "pm-review") {
      const round = Number((/(?:This is iteration) (\d+)/.exec(text) || [0, 1])[1]);
      fs.writeFile(
        `${DOCS}/CROSS-REVIEW-${ROLE_SLUG[skill]}-${docType}-v${round}.md`,
        crossReviewDoc("Approved", 0)
      );
      return `Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`;
    }

    // Phase PR's creator: an empty reply halts right after Phase P.
    if (docType === "PROPERTIES") return "";

    if (docType === "PLAN") {
      fs.writeFile(PLAN_PATH, completeDoc("PLAN", planTable));
      return "Document written.\nREVISION-COMPLETE: yes";
    }
    if (docType === "TSPEC") {
      fs.writeFile(`${DOCS}/TSPEC-${FEATURE}.md`, completeDoc("TSPEC"));
      return "Document written.\nREVISION-COMPLETE: yes\nDECISIONS_WARRANTED: false";
    }
    if (docType === "FSPEC") {
      fs.writeFile(`${DOCS}/FSPEC-${FEATURE}.md`, completeDoc("FSPEC"));
      return "Document written.\nREVISION-COMPLETE: yes";
    }
    return "Document written.\nREVISION-COMPLETE: yes";
  };

  const result = await main({
    reqPath: REQ,
    _agent: agent,
    _parallel: (promises) => Promise.all(promises),
    _pipeline: async (label, fn) => fn(),
    _phase: () => {},
    _log: () => {},
    _listFiles: listFiles,
    _git: git,
    _recordQueueRow: recordingRecordQueueRow({ queueRow: "recorded" }),
    ...fs.injections(),
    _phaseDodEnabled: false,
    _phasePubEnabled: false,
    _now: () => 0,
    _sleep: async () => {},
  });

  return { result, calls, files: fs.files };
}

const phaseRow = (result, id) => result.phases.find((p) => p.phase === id);

describe("PLAN-PARSE-03: Phase P refuses a PLAN whose task table the parser cannot read", () => {
  test("PLAN-PARSE-03a: an unparseable task table halts at Phase P, naming the PLAN path", async () => {
    const { result, calls } = await runToPhaseP(UNPARSEABLE_TASK_TABLE);

    // Positive conjunct: Phase P really ran — its reviewers were dispatched.
    const planReviewers = calls.filter(
      (c) => (c.skill === "pm-review" || c.skill === "te-review") && c.prompt.includes(PLAN_PATH)
    );
    expect(planReviewers.length).toBeGreaterThan(0);

    expect(result.outcome).toBe("halted");
    expect(result.haltPhase).toBe("P");
    expect(result.haltReason).toContain(PLAN_PATH);
    expect(result.haltReason).toContain("could not be parsed");
    expect(result.haltReason).toContain("Task ID");
    expect(result.haltReason).toContain("Dependencies");

    // The pipeline stopped here: Phase PR was never recorded and te-author was
    // never dispatched (paired above with the reviewers that WERE dispatched).
    expect(phaseRow(result, "PR")).toBeUndefined();
    expect(calls.filter((c) => c.skill === "te-author")).toEqual([]);
  });

  test("PLAN-PARSE-03b: a parseable task table passes Phase P, records the parse, and the pipeline reaches Phase PR", async () => {
    const { result, calls } = await runToPhaseP(PARSEABLE_TASK_TABLE);

    const p = phaseRow(result, "P");
    expect(p).toBeDefined();
    expect(p.status).toBe("✅");
    expect(p.detail).toBe("Approved (1 iterations); PLAN parses to 3 tasks in 3 batches");

    // Positive: the run went past Phase P into Phase PR — the PROPERTIES creator
    // was dispatched, and the run's only complaint is that creator's empty reply
    // (this fixture's deliberate stop), never the PLAN.
    expect(calls.some((c) => c.skill === "te-author")).toBe(true);
    expect(result.haltReason).toContain(`${DOCS}/PROPERTIES-${FEATURE}.md`);
    expect(result.haltReason).not.toContain(PLAN_PATH);
  });

  test("PLAN-PARSE-03c: a dependency cycle halts at Phase P with the cycle named", async () => {
    const { result, calls } = await runToPhaseP(CYCLIC_TASK_TABLE);

    // Positive conjunct: Phase P's reviewers ran before the gate refused.
    expect(
      calls.filter((c) => c.skill === "pm-review" && c.prompt.includes(PLAN_PATH)).length
    ).toBeGreaterThan(0);

    expect(result.outcome).toBe("halted");
    expect(result.haltPhase).toBe("P");
    expect(result.haltReason).toContain(PLAN_PATH);
    expect(result.haltReason).toContain("cycle");
    expect(phaseRow(result, "PR")).toBeUndefined();
  });
});
