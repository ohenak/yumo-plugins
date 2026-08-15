/**
 * artifactLint.test.js — T8 (`docs/pdlc-halt-hardening/PLAN-pdlc-halt-hardening.md` §4.4,
 * §5 RT-3d, §6 T8 row, §10 condition 3): `lintPlanArtifact`, the in-phase Phase P
 * authoring-loop feed-forward that composes it, and the generic six-doc-type heading
 * feed-forward (`headingFeedForwardClause`) condition 3 requires.
 *
 * ## What this file pins
 *
 * - `lintPlanArtifact(markdown)` is a pure COMPOSITION over four already-shipped PLAN
 *   checks — `parsePlanTasks`, `findUnknownPlanDepsIds`, `computeTopologicalBatches`,
 *   `parsePlanOwnership` (including its near-miss report), `validatePlanContract` — never
 *   a reimplementation. It returns `{ ok, diagnostics: [{ kind, row?, cell?, message,
 *   expectedForms? }] }` and its diagnostic ORDER matches Phase P's own post-convergence
 *   gate: unparseable-tasks short-circuits; unknown-dep-id suppresses cycle detection
 *   (mirroring `findUnknownPlanDepsIds`'s own doc comment: an unresolved id can never be
 *   "ready", so the topo walk can't distinguish a real cycle from a dangling reference);
 *   ownership near-miss and ownership-missing are mutually exclusive; a present, parseable
 *   manifest is checked against the task table via `validatePlanContract`.
 * - Phase P's post-convergence self-parse gate is a STRICT, behavior-preserving backstop
 *   over `lintPlanArtifact` — `planParse.test.js`'s PLAN-PARSE-03 suite already pins its
 *   exact halt-message substrings end to end through `main()`; this file does not
 *   duplicate that suite, it pins the LINT PRIMITIVE those halts are now built from.
 * - The authoring loop (`dispatchAndVerify`, invoked from Phase P) calls `lintPlanArtifact`
 *   on every raw-text re-read of an in-progress PLAN and, when diagnostics are non-empty,
 *   folds `planLintFeedForwardClause` into the VERY NEXT author prompt — feed-forward
 *   within the existing dispatch/attempt budget, never a new dispatch.
 * - `headingFeedForwardClause(docType)` is the GENERIC (architect-mandated, condition 3)
 *   heading feed-forward: every one of the six `REQUIRED_HEADINGS` doc types gets its
 *   creator's first authoring prompt (`skeletonClause`) annotated with the canonical
 *   section titles plus every accepted alternate, driven purely off `REQUIRED_HEADINGS` —
 *   no doc-type-specific prose, no hand-maintained second table.
 *
 * ## Stratum
 *
 * `lintPlanArtifact` / `planLintFeedForwardClause` / `headingFeedForwardClause` are all
 * exported (TSPEC §4.4), so the unit-level assertions below drive them directly (L1). The
 * authoring-loop feed-forward assertion drives `main()` with injected seams (L2), following
 * `planParse.test.js`'s `runToPhaseP` pattern — `dispatchAndVerify` itself stays
 * non-exported and is never imported here.
 *
 * Fixtures reused from `fixtures/halt-hardening/` (see that directory's `README.md`):
 * `plan-piped-cells.md` (RT-3a's backtick-pipe PLAN), `plan-owning-tasks-manifest.md` (a
 * canonical manifest), `plan-near-miss-manifest.md` (a `Writers | Files` near-miss
 * manifest paired with the SAME task table as the canonical fixture).
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import * as devModule from "../orchestrate-dev.js";
import { fakeFs, fakeGit, fakeListFiles, recordingRecordQueueRow } from "./helpers/seams.js";

const { lintPlanArtifact, planLintFeedForwardClause, headingFeedForwardClause } = devModule;
const main = devModule.default;

const HALT_FIXTURE_DIR = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "halt-hardening");
const haltFixture = (name) => readFileSync(join(HALT_FIXTURE_DIR, name), "utf8");

// ─── 1. lintPlanArtifact — unit level ──────────────────────────────────────────

describe("T8-LINT-01: lintPlanArtifact composes the shipped PLAN checks", () => {
  test("T8-LINT-01a: a clean PLAN (valid task table + valid manifest) is ok with no diagnostics", () => {
    const doc = haltFixture("plan-owning-tasks-manifest.md");
    const result = lintPlanArtifact(doc);

    expect(result.ok).toBe(true);
    expect(result.diagnostics).toEqual([]);
  });

  test("T8-LINT-01b: RT-3a's backticked-pipe PLAN (task table only) is ok — no fabricated cycle", () => {
    const doc = haltFixture("plan-piped-cells.md");
    const result = lintPlanArtifact(doc);

    // No file-ownership manifest in this fixture at all, so the ONLY diagnostic
    // possible is the missing-manifest one — never a fabricated cycle, and never an
    // unknown-dep-id (its deps column is valid).
    expect(result.ok).toBe(false);
    expect(result.diagnostics).toEqual([
      {
        kind: "ownership-missing",
        message: expect.stringContaining("no file-ownership manifest found"),
      },
    ]);
  });

  test("T8-LINT-01c: appending a valid manifest to the backticked-pipe PLAN makes it ok", () => {
    const base = haltFixture("plan-piped-cells.md");
    const manifest = [
      "",
      "## Per-batch file-ownership manifest",
      "",
      "| Task | Files |",
      "|---|---|",
      "| T-01 | `src/one.js` |",
      "| T-02 | `src/two.js` |",
      "| T-03 | `src/three.js` |",
      "| T-04 | `src/four.js` |",
      "| T-05 | `src/five.js` |",
      "| T-06 | `src/six.js` |",
      "",
    ].join("\n");
    const result = lintPlanArtifact(base + manifest);

    expect(result.ok).toBe(true);
    expect(result.diagnostics).toEqual([]);
  });

  test("T8-LINT-01d: an unknown dependency id is named by row and cell, never silently a cycle", () => {
    const doc = [
      "# PLAN",
      "",
      "| Task ID | Description | Dependencies |",
      "|---|---|---|",
      "| T1 | first | - |",
      "| T2 | second | T1, T9 |",
      "",
    ].join("\n");
    const result = lintPlanArtifact(doc);

    expect(result.ok).toBe(false);
    expect(result.diagnostics).toEqual([
      {
        kind: "unknown-dep-id",
        row: 3,
        cell: "T1, T9",
        message: expect.stringContaining('unknown id "T9"'),
      },
      {
        kind: "ownership-missing",
        message: expect.stringContaining("no file-ownership manifest found"),
      },
    ]);
    // Never a cycle diagnostic alongside the unknown-dep-id one: `findUnknownPlanDepsIds`'s
    // own doc comment is that an unresolved id can never be "ready", so cycle detection is
    // skipped, not run and coincidentally silent.
    expect(result.diagnostics.some((d) => d.kind === "cycle")).toBe(false);
  });

  test("T8-LINT-01e: a genuine cycle (no unknown ids) is named, once unknown-dep-ids are absent", () => {
    const doc = [
      "# PLAN",
      "",
      "| Task ID | Description | Dependencies |",
      "|---|---|---|",
      "| C-1 | first | C-2 |",
      "| C-2 | second | C-1 |",
      "",
    ].join("\n");
    const result = lintPlanArtifact(doc);

    expect(result.ok).toBe(false);
    expect(result.diagnostics.some((d) => d.kind === "unknown-dep-id")).toBe(false);
    const cycleDiag = result.diagnostics.find((d) => d.kind === "cycle");
    expect(cycleDiag).toBeDefined();
    expect(cycleDiag.message.toLowerCase()).toContain("cycle");
  });

  test("T8-LINT-01f: an unparseable task table short-circuits with a single diagnostic", () => {
    const doc = ["# PLAN", "", "No table here at all, just prose.", ""].join("\n");
    const result = lintPlanArtifact(doc);

    expect(result.ok).toBe(false);
    expect(result.diagnostics).toEqual([
      {
        kind: "unparseable-tasks",
        message: expect.stringContaining("Task ID"),
      },
    ]);
    expect(result.diagnostics[0].message).toContain("Dependencies");
  });

  test("T8-LINT-01g: a near-miss manifest header (`Writers | Files`) is a loud diagnostic, not silence", () => {
    const doc = haltFixture("plan-near-miss-manifest.md");
    const result = lintPlanArtifact(doc);

    expect(result.ok).toBe(false);
    expect(result.diagnostics).toEqual([
      {
        kind: "ownership-near-miss",
        cell: expect.stringContaining("Writers"),
        expectedForms: expect.any(Array),
        message: expect.stringContaining("Writers"),
      },
    ]);
    // Near-miss and missing-manifest are mutually exclusive (the original gate's own
    // invariant, preserved here): never both for the same document.
    expect(result.diagnostics.some((d) => d.kind === "ownership-missing")).toBe(false);
  });

  test("T8-LINT-01h: a task with no manifest row is a contract-violation diagnostic", () => {
    const doc = [
      "# PLAN",
      "",
      "| Task ID | Description | Dependencies |",
      "|---|---|---|",
      "| T1 | first | - |",
      "| T2 | second | T1 |",
      "",
      "## Per-batch file-ownership manifest",
      "",
      "| Task | Files |",
      "|---|---|",
      "| T1 | `src/one.js` |",
      "",
    ].join("\n");
    const result = lintPlanArtifact(doc);

    expect(result.ok).toBe(false);
    expect(result.diagnostics).toEqual([
      { kind: "contract-violation", message: expect.stringContaining("T2") },
    ]);
  });
});

describe("T8-LINT-02: planLintFeedForwardClause renders diagnostics as plain-text prompt lines", () => {
  test("T8-LINT-02a: renders a row-located diagnostic with its row number", () => {
    const clause = planLintFeedForwardClause([
      { kind: "unknown-dep-id", row: 3, cell: "T1, T9", message: 'names unknown id "T9"' },
    ]);

    expect(clause).toContain("row 3");
    expect(clause).toContain('names unknown id "T9"');
  });

  test("T8-LINT-02a: renders a cell-located diagnostic (no row) with its cell quoted, plus expected forms", () => {
    const clause = planLintFeedForwardClause([
      {
        kind: "ownership-near-miss",
        cell: "| Writers | Files |",
        expectedForms: ["Task", "Files"],
        message: "near miss",
      },
      { kind: "unparseable-tasks", message: "could not be parsed" },
    ]);

    expect(clause).toContain('"| Writers | Files |"');
    expect(clause).toContain("(accepted: Task, Files)");
    expect(clause).toContain("near miss");
    expect(clause).toContain("could not be parsed");
  });

  test("T8-LINT-02b: names Phase P's post-convergence gate, so the clause is legible as the SAME check", () => {
    const clause = planLintFeedForwardClause([{ kind: "cycle", message: "cycle detected" }]);
    expect(clause).toContain("Phase P's post-convergence gate");
  });
});

// ─── 2. headingFeedForwardClause — generic, six doc types (condition 3) ────────

describe("T8-HEAD-01: headingFeedForwardClause is generic over every REQUIRED_HEADINGS doc type", () => {
  // Transcribed from TSPEC §5.9's table, restated here (not imported — a suite
  // that imported the subject's own table could not catch a row silently dropped
  // from it). One canonical title + full alt list per doc type, verbatim.
  const EXPECTED = {
    REQ: [
      ["Problem / Context", ["Context", "Problem", "Background"]],
      ["Goals", ["Objectives"]],
      ["Non-Goals", ["Scope", "Out of scope"]],
      ["Constraints", []],
      ["Acceptance Criteria", ["Acceptance"]],
      ["Risks", []],
      ["Obligations", ["Open Questions", "Assumptions"]],
    ],
    FSPEC: [
      ["Overview", ["Scope", "Summary", "Context"]],
      ["Linked Requirements", []],
      ["Behavioral Flow", []],
      ["Business Rules", []],
      ["Edge Cases and Error Scenarios", []],
      ["Acceptance Tests", []],
      ["Open Questions", ["Obligations", "Assumptions"]],
    ],
    TSPEC: [
      ["Overview", ["Scope", "Summary", "Context", "Introduction"]],
      ["Architecture", ["Design"]],
      ["Interfaces", ["Interface", "Protocol", "Protocols", "Seams", "APIs", "API"]],
      ["Data Model", ["Types", "State", "Schema", "Data structures"]],
      ["Test Strategy", ["Testing", "Test plan", "Verification"]],
      ["Open Questions", ["Obligations", "Assumptions", "Risks", "Decisions"]],
    ],
    PLAN: [
      ["Overview", ["Scope", "Summary"]],
      ["Batches", ["Tasks", "Work breakdown"]],
      ["Dependencies", ["Ordering"]],
      ["Verification", ["Testing", "Validation"]],
    ],
    PROPERTIES: [
      ["Overview", ["Scope", "Summary"]],
      ["Properties", ["Invariants"]],
      ["Oracles", ["Checks", "Test Oracles"]],
      ["Fixtures", ["Generators", "Test data", "Test Fixtures"]],
    ],
    DECISIONS: [
      ["Context", ["Background"]],
      ["Options Considered", ["Options", "Alternatives"]],
      ["Decision", ["Chosen", "Resolution"]],
      ["Consequences", ["Tradeoffs", "Implications"]],
    ],
  };

  for (const [docType, rows] of Object.entries(EXPECTED)) {
    test(`T8-HEAD-01: headingFeedForwardClause("${docType}") names every row's canonical title and every alt`, () => {
      const clause = headingFeedForwardClause(docType);
      expect(clause).not.toBe("");
      for (const [title, alts] of rows) {
        expect(clause).toContain(`## ${title}`);
        for (const alt of alts) {
          expect(clause).toContain(alt);
        }
      }
    });
  }
});

// ─── 3. The authoring loop feeds lintPlanArtifact's diagnostics forward in-phase ──

const FEATURE = "artifact-lint-feat";
const DOCS = `docs/${FEATURE}`;
const REQ = `${DOCS}/REQ-${FEATURE}.md`;
const PLAN_PATH = `${DOCS}/PLAN-${FEATURE}.md`;

const REQUIRED_HEADINGS_LOCAL = Object.freeze({
  REQ: ["Problem / Context", "Goals", "Non-Goals", "Constraints", "Acceptance Criteria", "Risks", "Obligations"],
  FSPEC: ["Overview", "Linked Requirements", "Behavioral Flow", "Business Rules", "Edge Cases and Error Scenarios", "Acceptance Tests", "Open Questions"],
  TSPEC: ["Overview", "Architecture", "Interfaces", "Data Model", "Test Strategy", "Open Questions"],
  PLAN: ["Overview", "Batches", "Dependencies", "Verification"],
  PROPERTIES: ["Overview", "Properties", "Oracles", "Fixtures"],
});

/**
 * A document of `docType`, `## Batches` carrying `planTable` for PLAN. When
 * `omitLast` is true, the FINAL required heading is left off entirely — the doc
 * is then structurally INCOMPLETE (`isComplete` scores it `missing` non-empty),
 * which is what forces the authoring loop to re-dispatch for a second attempt
 * within the same episode, exactly the arm the in-phase PLAN-lint feed-forward
 * fires on (a raw re-read of an in-progress, not-yet-complete document).
 */
function completeDoc(docType, planTable, { omitLast = false } = {}) {
  const headings = REQUIRED_HEADINGS_LOCAL[docType];
  const used = omitLast ? headings.slice(0, -1) : headings;
  const parts = [`# ${FEATURE} — ${docType}`, ""];
  for (const heading of used) {
    parts.push(`## ${heading}`, "", `Substantive ${heading}.`, "");
    if (docType === "PLAN" && heading === "Batches" && planTable) parts.push(planTable, "");
  }
  return parts.join("\n");
}

// A PLAN whose task table is structurally readable (`parsePlanTasks` succeeds) but whose
// `Dependencies` cell names an id that does not exist — `lintPlanArtifact`'s
// `unknown-dep-id` diagnostic, exactly the shape T8's feed-forward exists for.
const BAD_TASK_TABLE = [
  "| Task ID | Description | Dependencies |",
  "|---|---|---|",
  "| G-1 | foundation | - |",
  "| G-2 | build on G-1 and a task that does not exist | G-1, G-9 |",
  "",
  "| Task | Files |",
  "|---|---|",
  "| G-1 | `src/one.js` |",
  "| G-2 | `src/two.js` |",
].join("\n");

const FIXED_TASK_TABLE = [
  "| Task ID | Description | Dependencies |",
  "|---|---|---|",
  "| G-1 | foundation | - |",
  "| G-2 | build on G-1 | G-1 |",
  "",
  "| Task | Files |",
  "|---|---|",
  "| G-1 | `src/one.js` |",
  "| G-2 | `src/two.js` |",
].join("\n");

const ROLE_SLUG = Object.freeze({
  "se-review": "software-engineer",
  "pm-review": "product-manager",
  "te-review": "test-engineer",
});

function basenamesIn(files, dirPath) {
  const prefix = `${String(dirPath).replace(/\/+$/, "")}/`;
  return Object.keys(files)
    .filter((p) => p.startsWith(prefix) && !p.slice(prefix.length).includes("/"))
    .sort();
}

function crossReviewDoc(verdict, high) {
  return [
    "# Cross-review",
    "",
    "## Findings",
    "",
    "No findings.",
    "",
    "## Verdict",
    "",
    `VERDICT: ${verdict}`,
    `{"high": ${high}, "medium": 0, "low": 0}`,
    "",
  ].join("\n");
}

describe("T8-FEED-01: the PLAN authoring loop feeds lintPlanArtifact diagnostics into the very next prompt", () => {
  test("T8-FEED-01: a PLAN dispatched with an unknown-dep-id is fixed on the SECOND se-author dispatch, whose prompt names the diagnostic", async () => {
    const fs = fakeFs({ [REQ]: completeDoc("REQ") });
    const listFiles = fakeListFiles((dirPath) => basenamesIn(fs.files, dirPath));
    const git = fakeGit((argv) =>
      argv.join(" ") === "rev-parse --abbrev-ref HEAD"
        ? { ok: true, stdout: `feat-${FEATURE}\n` }
        : { ok: true, stdout: "" }
    );

    const calls = [];
    let planAuthorInvocations = 0;

    async function agent(skill, prompt) {
      calls.push({ skill, prompt });
      const docType = ["PROPERTIES", "PLAN", "TSPEC", "FSPEC", "REQ"].find((d) =>
        prompt.includes(`${DOCS}/${d}-${FEATURE}.md`)
      );

      if (skill === "se-review" || skill === "te-review" || skill === "pm-review") {
        const round = Number((/round (\d+)/.exec(prompt) ?? [0, 1])[1]);
        fs.writeFile(
          `${DOCS}/CROSS-REVIEW-${ROLE_SLUG[skill]}-${docType}-v${round}.md`,
          crossReviewDoc("Approved", 0)
        );
        return "Review complete.\nVERDICT: Approved\n{\"high\": 0, \"medium\": 0, \"low\": 0}\n";
      }

      // Stop the pipeline right after Phase P converges: Phase PR's creator answers
      // an empty string, which halts immediately — the smallest observable "Phase P
      // passed, Phase PR was reached".
      if (docType === "PROPERTIES") return "";

      if (docType === "PLAN") {
        planAuthorInvocations += 1;
        if (planAuthorInvocations === 1) {
          // Deliberately structurally INCOMPLETE (the final required heading is
          // left off), so the authoring loop's own completeness check forces a
          // second attempt within this same episode — the arm the in-phase
          // PLAN-lint feed-forward is wired to.
          fs.writeFile(PLAN_PATH, completeDoc("PLAN", BAD_TASK_TABLE, { omitLast: true }));
          return "Document written.";
        }
        // Second+ dispatch: the in-phase feed-forward (T8) must have named the
        // unknown id BEFORE this prompt was built.
        expect(prompt).toContain("unknown-dep-id");
        expect(prompt).toContain("G-9");
        expect(prompt).toContain("Phase P's post-convergence gate");
        fs.writeFile(PLAN_PATH, completeDoc("PLAN", FIXED_TASK_TABLE));
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
    }

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

    // Phase P really did converge (the loop reached a second se-author dispatch and
    // then proceeded), and it did so WITHOUT any change to the shipped halt-message
    // shape: the PLAN under `PLAN_PATH` is fixed and the pipeline moved on to Phase
    // PR, whose empty-string creator reply is what halted it.
    expect(planAuthorInvocations).toBeGreaterThanOrEqual(2);
    expect(result.haltReason).toContain(`${DOCS}/PROPERTIES-${FEATURE}.md`);
    expect(result.haltReason).not.toContain(PLAN_PATH);

    const planPrompts = calls.filter(
      (c) => c.skill === "se-author" && c.prompt.includes(PLAN_PATH)
    );
    expect(planPrompts.length).toBeGreaterThanOrEqual(2);
    // The FIRST dispatch (skeleton) never carries lint diagnostics — there is no
    // PLAN on disk yet to lint.
    expect(planPrompts[0].prompt).not.toContain("unknown-dep-id");
    // The SECOND does — feed-forward within the existing dispatch budget, not a
    // brand-new dispatch kind.
    expect(planPrompts[1].prompt).toContain("unknown-dep-id");
  });
});
