---
Status: Draft
Author: te-author
Version: 1.0
Feature: orchestrate-dev-workflow
---

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → PLAN → **PROPERTIES** |
| Downstream | IMPL tests |
| Scope | Testable system properties for the orchestrate-dev dynamic workflow: VERDICT and DECISIONS_WARRANTED parsing, reviewLoop convergence and loop control, pipeline entry validation, implementation phase DAG/batching/dispatch/gate, harvest ordering and guard-hook enforcement, SKILL.md rewrite content, and backward-compatibility invariants |
| Cross-Reviews | — |
| LEARNINGS | docs/orchestrate-dev-workflow/LEARNINGS-orchestrate-dev-workflow.md |

# PROPERTIES — orchestrate-dev-workflow

Testable system properties for the `orchestrate-dev` PDLC dynamic workflow.

---

## 1. PARSE Properties — VERDICT Parsing

These properties cover the `parseVerdict` function (TSPEC-PARSE-01 through TSPEC-PARSE-04) and the FSPEC acceptance tests AT-VERDICT-01 through AT-VERDICT-07.

| ID | Description | Category | Test Level | Test File | FSPEC AT | TSPEC Ref |
|---|---|---|---|---|---|---|
| PROP-PARSE-01 | `parseVerdict` must return `{ verdict: "Approved", high: N, medium: N, low: N }` with the correct counts and no warning log when the result string ends with `VERDICT: Approved\n{"high": N, "medium": N, "low": N}\n` (trailing newline permitted). | Functional | Unit | `pdlc/workflows/__tests__/parseVerdict.test.js` | AT-VERDICT-01 | TSPEC-PARSE-01, TSPEC-PARSE-03 |
| PROP-PARSE-02 | `parseVerdict` must return `{ verdict: "Needs revision", high: 0, medium: 0, low: 0 }` and emit a warning log in the format `"WARNING: reviewer {skill-name} returned no VERDICT — treating as Needs revision"` when the VERDICT line uses wrong casing (e.g., `VERDICT: approved`). | Error Handling | Unit | `pdlc/workflows/__tests__/parseVerdict.test.js` | AT-VERDICT-02 | TSPEC-PARSE-01, TSPEC-PARSE-04 |
| PROP-PARSE-03 | `parseVerdict` must return `{ verdict: "Needs revision", high: 0, medium: 0, low: 0 }` and emit a warning log when the VERDICT line is valid but the immediately-following non-empty line is not valid JSON (e.g., unquoted keys `{high: 0}`). | Error Handling | Unit | `pdlc/workflows/__tests__/parseVerdict.test.js` | AT-VERDICT-03 | TSPEC-PARSE-01, TSPEC-PARSE-02, TSPEC-PARSE-04 |
| PROP-PARSE-04 | `parseVerdict` must return `{ verdict: "Needs revision", high: 0, medium: 0, low: 0 }` and emit a warning log when one or more non-empty lines appear between the VERDICT line and the JSON object line (intervening-text path). | Error Handling | Unit | `pdlc/workflows/__tests__/parseVerdict.test.js` | AT-VERDICT-04 | TSPEC-PARSE-01, TSPEC-PARSE-02, TSPEC-PARSE-04 |
| PROP-PARSE-05 | `parseVerdict` must return `{ verdict: "Approved", high: 0, medium: 0, low: 0 }` with no warning log when the VERDICT line is the very last line of the result (truncated output — no line follows it). | Functional | Unit | `pdlc/workflows/__tests__/parseVerdict.test.js` | AT-VERDICT-05 | TSPEC-PARSE-01, TSPEC-PARSE-03 |
| PROP-PARSE-06 | `parseVerdict` must return `{ verdict: "Needs revision", high: 0, medium: 0, low: 0 }` with no warning log and set gate state to FAIL when `VERDICT: Needs revision` is the last non-empty line (truncated output — `Needs revision` variant). | Functional | Unit | `pdlc/workflows/__tests__/parseVerdict.test.js` | AT-VERDICT-06 | TSPEC-PARSE-01, TSPEC-PARSE-03 |
| PROP-PARSE-07 | `parseVerdict` must treat `VERDICT: Approved` followed only by blank lines and then EOF identically to the truncated case where VERDICT is the very last line: return `{ verdict: "Approved", high: 0, medium: 0, low: 0 }` with no warning log. | Functional | Unit | `pdlc/workflows/__tests__/parseVerdict.test.js` | AT-VERDICT-07 | TSPEC-PARSE-01, TSPEC-PARSE-03 |
| PROP-PARSE-08 | `parseVerdict` must apply a reverse-scan (last-occurrence-wins) to extract the VERDICT line, so that a result containing multiple `VERDICT:` lines returns the value from the last occurrence. | Functional | Unit | `pdlc/workflows/__tests__/parseVerdict.test.js` | — | TSPEC-PARSE-01 §2.2 |
| PROP-PARSE-09 | `parseVerdict` must return `{ verdict: "Needs revision", high: 0, medium: 0, low: 0 }` and emit a warning log when the result is `null`, `undefined`, an empty string, or a whitespace-only string. | Error Handling | Unit | `pdlc/workflows/__tests__/parseVerdict.test.js` | AT-LOOP-04 | TSPEC-PARSE-01, TSPEC-PARSE-04 |
| PROP-PARSE-10 | `parseVerdict` must return `{ verdict: "Needs revision", high: 0, medium: 0, low: 0 }` and emit a warning log when the JSON object has additional keys beyond `high`, `medium`, `low` or is missing any of those keys. | Error Handling | Unit | `pdlc/workflows/__tests__/parseVerdict.test.js` | — | TSPEC-PARSE-01, TSPEC-PARSE-04 |
| PROP-PARSE-11 | `parseVerdict` must return `{ verdict: "Needs revision", high: 0, medium: 0, low: 0 }` and emit a warning log when any JSON value in the findings object is negative or is not an integer. | Error Handling | Unit | `pdlc/workflows/__tests__/parseVerdict.test.js` | — | TSPEC-PARSE-01, TSPEC-PARSE-04 |
| PROP-PARSE-12 | `parseVerdict` must NOT treat `VERDICT:` prefix checks as case-insensitive — the literal string `VERDICT: ` (uppercase, with trailing space) is the required prefix; `verdict: Approved` must not be recognised as a valid VERDICT line. | Contract | Unit | `pdlc/workflows/__tests__/parseVerdict.test.js` | AT-VERDICT-02 | TSPEC-PARSE-01 §2.2 step 3 |

### 1.1 DECISIONS_WARRANTED Parsing Properties

These properties cover `parseDecisionsWarranted` (TSPEC-PARSE-05) and FSPEC acceptance tests AT-DECISIONS-01 through AT-DECISIONS-05.

| ID | Description | Category | Test Level | Test File | FSPEC AT | TSPEC Ref |
|---|---|---|---|---|---|---|
| PROP-PARSE-13 | `parseDecisionsWarranted` must return `false` and NOT emit the absent-field warning when the result contains `DECISIONS_WARRANTED: false` (exact lowercase). | Functional | Unit | `pdlc/workflows/__tests__/parseDecisionsWarranted.test.js` | AT-DECISIONS-01 | TSPEC-PARSE-05 |
| PROP-PARSE-14 | `parseDecisionsWarranted` must return `true` and emit `log("WARNING: DECISIONS_WARRANTED field absent or malformed — defaulting to true")` when the result contains no `DECISIONS_WARRANTED:` line. | Error Handling | Unit | `pdlc/workflows/__tests__/parseDecisionsWarranted.test.js` | AT-DECISIONS-02 | TSPEC-PARSE-05 |
| PROP-PARSE-15 | `parseDecisionsWarranted` must return `true` and NOT emit the absent-field warning when the result contains `DECISIONS_WARRANTED: true` (explicit positive value). | Functional | Unit | `pdlc/workflows/__tests__/parseDecisionsWarranted.test.js` | AT-DECISIONS-03 | TSPEC-PARSE-05 |
| PROP-PARSE-16 | `parseDecisionsWarranted` must treat `DECISIONS_WARRANTED: False` (mixed case) as `false` using case-insensitive value comparison, skip Phase D, and NOT emit the absent-field warning. | Functional | Unit | `pdlc/workflows/__tests__/parseDecisionsWarranted.test.js` | AT-DECISIONS-04 | TSPEC-PARSE-05 |
| PROP-PARSE-17 | `parseDecisionsWarranted` must treat `DECISIONS_WARRANTED: TRUE` (all uppercase) as `true` using case-insensitive value comparison, enter Phase D, and NOT emit the absent-field warning. | Functional | Unit | `pdlc/workflows/__tests__/parseDecisionsWarranted.test.js` | AT-DECISIONS-05 | TSPEC-PARSE-05 |
| PROP-PARSE-18 | `parseDecisionsWarranted` must use a reverse-scan (last-occurrence-wins) on the result lines, matching on the `DECISIONS_WARRANTED: ` prefix (case-sensitive prefix; case-insensitive value). | Contract | Unit | `pdlc/workflows/__tests__/parseDecisionsWarranted.test.js` | — | TSPEC-PARSE-05 §2.2 final para |
| PROP-PARSE-19 | `parseDecisionsWarranted` must return `true` and emit the absent-field warning when the result is `null`, `undefined`, or an empty/whitespace-only string (post-PASS agent failure path). | Error Handling | Unit | `pdlc/workflows/__tests__/parseDecisionsWarranted.test.js` | — | TSPEC-PARSE-05, TSPEC-DECISIONS-02 |

---

## 2. LOOP Properties — `reviewLoop` Behavior

These properties cover the `reviewLoop` function (TSPEC-LOOP-01 through TSPEC-LOOP-08) and FSPEC acceptance tests AT-LOOP-01 through AT-LOOP-08 and AT-RESUME-01 through AT-RESUME-03.

| ID | Description | Category | Test Level | Test File | FSPEC AT | TSPEC Ref |
|---|---|---|---|---|---|---|
| PROP-LOOP-01 | `reviewLoop` must exit after 1 iteration, not invoke the optimizer, and return `{ converged: true, iterations: 1 }` when both reviewers return a passing verdict (`Approved` or `Approved with minor changes`) on iteration 1. | Functional | Unit | `pdlc/workflows/__tests__/reviewLoop.test.js` | AT-LOOP-01 | TSPEC-LOOP-03 |
| PROP-LOOP-02 | `reviewLoop` must invoke the optimizer exactly once and increment the iteration counter to 2 when one reviewer returns a passing verdict and the other returns `Needs revision` on iteration 1. | Functional | Unit | `pdlc/workflows/__tests__/reviewLoop.test.js` | AT-LOOP-02 | TSPEC-LOOP-03 |
| PROP-LOOP-03 | `reviewLoop` must NOT dispatch a 6th reviewer pair, must invoke the POSTMORTEM-writing agent, and must return `{ converged: false, iterations: 5 }` when both reviewers return `Needs revision` for all 5 iterations. The pipeline halts; the POSTMORTEM file path appears in the final report. | Functional | Unit | `pdlc/workflows/__tests__/reviewLoop.test.js` | AT-LOOP-03 | TSPEC-LOOP-07 |
| PROP-LOOP-04 | `reviewLoop` must emit a warning log in the exact format `"WARNING: reviewer {skill-name} returned no VERDICT — treating as Needs revision"` (with the reviewer's skill identifier substituted), set gate state to FAIL, and invoke the optimizer when one reviewer crashes mid-iteration (result is null/empty/exception). | Error Handling | Unit | `pdlc/workflows/__tests__/reviewLoop.test.js` | AT-LOOP-04 | TSPEC-LOOP-03, TSPEC-ERROR-01 |
| PROP-LOOP-05 | `reviewLoop` must halt the pipeline and include `"WARNING: POSTMORTEM agent failed — artifact not written for phase {phase}"` in the final report when the POSTMORTEM-writing agent itself fails after 5-iteration cap exhaustion. No POSTMORTEM file is written; no retry is attempted. | Error Handling | Unit | `pdlc/workflows/__tests__/reviewLoop.test.js` | AT-LOOP-05 | TSPEC-LOOP-07 |
| PROP-LOOP-06 | `reviewLoop` must not dispatch any reviewer agents and must halt with `"Error: {docPath} does not exist — cannot enter reviewLoop for phase {phase}"` (including the exact document path and phase label) when the guard agent reports the target document is absent at entry precondition check. | Error Handling | Unit | `pdlc/workflows/__tests__/reviewLoop.test.js` | AT-LOOP-06 | TSPEC-LOOP-02 |
| PROP-LOOP-07 | `reviewLoop` must halt immediately and include `"Error: optimizer agent {optimizer-skill} failed during phase {phase}, iteration {N} — pipeline halted. Document at {docPath} may be in an inconsistent state."` in the final report when the optimizer agent fails (non-zero exit or error signal); the pipeline must not proceed to iteration N+1. | Error Handling | Unit | `pdlc/workflows/__tests__/reviewLoop.test.js` | AT-LOOP-07 | TSPEC-LOOP-03, TSPEC-ERROR-01 |
| PROP-LOOP-08 | `reviewLoop` must emit exactly two warning log entries (one per crashed reviewer, in any order), treat both as `Needs revision`, invoke the optimizer exactly once (not twice), increment the iteration counter by 1, and NOT halt the pipeline when both reviewers crash in the same iteration. | Error Handling | Unit | `pdlc/workflows/__tests__/reviewLoop.test.js` | AT-LOOP-08 | TSPEC-LOOP-03, TSPEC-ERROR-01 |
| PROP-LOOP-09 | `reviewLoop` must dispatch both reviewers concurrently via `parallel()` on each iteration — reviewer agents are not dispatched sequentially. | Contract | Unit | `pdlc/workflows/__tests__/reviewLoop.test.js` | — | TSPEC-LOOP-04 |
| PROP-LOOP-10 | `reviewLoop` must store reviewer results in script-local variables and must NOT pass any agent result object as the argument to any `log()` call; only scalar log strings are permitted. | Contract | Unit | `pdlc/workflows/__tests__/reviewLoop.test.js` | — | TSPEC-LOOP-04, TSPEC-NFR-03 |
| PROP-LOOP-11 | The POSTMORTEM agent prompt passed by `reviewLoop` must contain all six required section headings: `Phase`, `Iterations`, `Reviewers`, `Pattern of Disagreement`, `Best-Guess Root Cause`, `Recommendation`. | Contract | Unit | `pdlc/workflows/__tests__/reviewLoop.test.js` | — | TSPEC-LOOP-07, PLAN TASK-P2-07 |
| PROP-LOOP-12 | `reviewLoop` must cap at exactly 5 iterations: after n=5 reviewer-pair dispatches and n=5 optimizer invocations complete, the iteration counter reaches 6, the cap check `iteration > 5` fires, and the POSTMORTEM branch executes — the optimizer is invoked at iteration 5 before POSTMORTEM triggers, not skipped. | Contract | Unit | `pdlc/workflows/__tests__/reviewLoop.test.js` | AT-LOOP-03 | TSPEC-LOOP-03, TSPEC-LOOP-07 |

### 2.1 Resume Semantics Properties

| ID | Description | Category | Test Level | Test File | FSPEC AT | TSPEC Ref |
|---|---|---|---|---|---|---|
| PROP-LOOP-13 | `reviewLoop` must emit `"Resuming from iteration 3"` (not `"Resuming from iteration 4"` and not `"Starting iteration 3"`) as the first log call after a run is resumed mid-iteration-3; the runtime must not re-invoke already-completed iteration-3 agents; the iteration cap counter must not reset to 1. | Functional | Unit | `pdlc/workflows/__tests__/reviewLoop.test.js` | AT-RESUME-01 | TSPEC-LOOP-05, TSPEC-LOOP-06 |
| PROP-LOOP-14 | `reviewLoop` must emit `"Starting iteration 1"` (not `"Resuming from iteration 1"`) before dispatching the first reviewer pair on a fresh (non-resumed) run at iteration 1. | Functional | Unit | `pdlc/workflows/__tests__/reviewLoop.test.js` | AT-RESUME-02 | TSPEC-LOOP-05 |
| PROP-LOOP-15 | `reviewLoop` must emit `"Resuming from iteration 2"` (not `"Starting iteration 2"`) before dispatching the reviewer pair for iteration 2 on a fresh run where iteration 1 did not converge and the optimizer was invoked. | Functional | Unit | `pdlc/workflows/__tests__/reviewLoop.test.js` | AT-RESUME-03 | TSPEC-LOOP-05 |
| PROP-LOOP-16 | The iteration-start log (`"Starting iteration 1"` or `"Resuming from iteration N"`) must be emitted **before** the `parallel()` call for that iteration's reviewers — it is a sequential statement preceding the parallel dispatch in the loop body. | Contract | Unit | `pdlc/workflows/__tests__/reviewLoop.test.js` | — | TSPEC-LOOP-05 |

---

## 3. ENTRY Properties — Pipeline Entry and Validation

These properties cover pipeline entry validation (TSPEC-ENTRY-01 through TSPEC-ENTRY-03) and FSPEC acceptance tests AT-ENTRY-01 and AT-ENTRY-02.

| ID | Description | Category | Test Level | Test File | FSPEC AT | TSPEC Ref |
|---|---|---|---|---|---|---|
| PROP-ENTRY-01 | The pipeline entry must halt immediately before dispatching any agent and emit `"Error: REQ path does not match expected pattern docs/{feature}/REQ-{feature}.md — got: {provided-path}"` when the REQ path argument fails the regex pattern match (e.g., directory name and filename segment do not agree, or filename is just `REQ.md`). | Error Handling | Unit | `pdlc/workflows/__tests__/orchestrate-dev.test.js` | AT-ENTRY-01 | TSPEC-ENTRY-01, TSPEC-ENTRY-02 |
| PROP-ENTRY-02 | The pipeline entry must halt immediately before dispatching any agent and emit `"Error: REQ file not found at {path}"` when the path is syntactically valid but the guard agent reports `ok: false, reason: "file_not_found"`. | Error Handling | Unit | `pdlc/workflows/__tests__/orchestrate-dev.test.js` | AT-ENTRY-02 | TSPEC-ENTRY-01, TSPEC-ENTRY-03 |
| PROP-ENTRY-03 | The pipeline entry must halt immediately and emit `"Error: no REQ path provided. Usage: /pdlc:orchestrate-dev docs/{feature}/REQ-{feature}.md"` when the `reqPath` argument is absent or empty. | Error Handling | Unit | `pdlc/workflows/__tests__/orchestrate-dev.test.js` | — | TSPEC-ENTRY-01 |
| PROP-ENTRY-04 | The pipeline entry must halt immediately and emit `"Error: REQ file at {path} is empty"` when the guard agent reports `ok: false, reason: "file_empty"`. | Error Handling | Unit | `pdlc/workflows/__tests__/orchestrate-dev.test.js` | — | TSPEC-ENTRY-01, TSPEC-ENTRY-03 |
| PROP-ENTRY-05 | The feature name extracted by the entry regex must be the string captured by group 1 of `/^docs\/([^/]+)\/REQ-\1\.md$/` — the directory segment and the filename segment must match (backreference enforced). Paths where directory and filename segments differ must fail the pattern check. | Contract | Unit | `pdlc/workflows/__tests__/orchestrate-dev.test.js` | — | TSPEC-ENTRY-02 |
| PROP-ENTRY-06 | The REQ file existence check must use the guard `agent()` call, NOT `fs.existsSync` or any direct filesystem API — the workflow script has no direct filesystem access per the runtime model. | Contract | Unit | `pdlc/workflows/__tests__/orchestrate-dev.test.js` | — | TSPEC-ENTRY-03 |

---

## 4. IMPL Properties — Implementation Phase

These properties cover the implementation phase (TSPEC-IMPL-01 through TSPEC-IMPL-08) and FSPEC acceptance tests AT-IMPL-01 through AT-IMPL-05.

| ID | Description | Category | Test Level | Test File | FSPEC AT | TSPEC Ref |
|---|---|---|---|---|---|---|
| PROP-IMPL-01 | The batch plan `log()` statements (in the format `"Implementation batch plan:"`, `"  Batch N: [task-id-1, task-id-2, ...]"`, `"  Total: N tasks in M batches"`) must appear as sequential statements in the script that precede the first `agent()` call for any `se-implement` task — verifiable by inspecting the script's statement order. | Contract | Unit | `pdlc/workflows/__tests__/implPhase.test.js` | AT-IMPL-01 | TSPEC-IMPL-03 |
| PROP-IMPL-02 | The pipeline must halt immediately, not dispatch Batch 2, and include the failing agent's task ID and test failure summary in the final report when any `se-implement` agent's result contains a line matching `Tests: N failed` (where N is a positive integer). | Functional | Unit | `pdlc/workflows/__tests__/implPhase.test.js` | AT-IMPL-02 | TSPEC-IMPL-06 |
| PROP-IMPL-03 | When the PLAN's stated batch labels contradict the dependency edges, the script must re-derive topological batches from dependency edges (ignoring PLAN labels), emit `log("WARNING: PLAN batch labels inconsistent with dependency edges — re-deriving topological batches")` before dispatching any `se-implement` agent, and correctly place the prerequisite task in an earlier batch than the dependent task. | Functional | Unit | `pdlc/workflows/__tests__/implPhase.test.js` | AT-IMPL-03 | TSPEC-IMPL-02 |
| PROP-IMPL-04 | The pipeline must emit `log("Batch N complete — all tests passing")` and proceed to dispatch the next batch (or Phase PT if this was the final batch) when all agents in a batch complete and no agent result contains a failure marker (`Tests: N failed` or `non-zero exit`). The pipeline must NOT halt on a clean batch. | Functional | Unit | `pdlc/workflows/__tests__/implPhase.test.js` | AT-IMPL-04 | TSPEC-IMPL-06 |
| PROP-IMPL-05 | The pipeline must treat a `se-implement` batch agent returning `null`, `undefined`, an empty string, or a whitespace-only string as a batch failure; halt immediately; NOT scan for `Tests: N failed` or `non-zero exit`; and include `"Error: Batch N agent returned empty result — treating as failure"` in the final report (where N is the batch number). | Error Handling | Unit | `pdlc/workflows/__tests__/implPhase.test.js` | AT-IMPL-05 | TSPEC-IMPL-06 |
| PROP-IMPL-06 | Topological batching must detect a dependency cycle in the PLAN task graph and halt with `"Error: PLAN dependency graph contains a cycle — cannot compute topological batches"` — no `se-implement` agents must be dispatched. | Error Handling | Unit | `pdlc/workflows/__tests__/implPhase.test.js` | — | TSPEC-IMPL-02 |
| PROP-IMPL-07 | `se-implement` agents within a batch must be dispatched in parallel via `parallel()` with `isolation: "worktree"`; the max concurrent agents per batch must not exceed 5 (sub-batch splitting enforced at 5 tasks per topological level). | Contract | Unit | `pdlc/workflows/__tests__/implPhase.test.js` | — | TSPEC-IMPL-04, TSPEC-NFR-01 |
| PROP-IMPL-08 | When `git merge --no-ff` exits non-zero during worktree merge-back, the script must: (1) run `git diff --name-only --diff-filter=U` to capture conflicting files **before** aborting, (2) run `git merge --abort`, (3) halt the pipeline with `"Error: merge conflict merging worktree for task {task-id} into feat-{featureName} — conflicting files: {fileList}. Pipeline halted."`, and (4) NOT attempt to merge remaining worktrees in the same batch. | Error Handling | Integration | `pdlc/workflows/__tests__/implPhase.test.js` | — | TSPEC-IMPL-05 |
| PROP-IMPL-09 | Worktree merge-back must proceed in PLAN document order (array index order of tasks in the batch) — not by task ID alphabetical order or any other ordering — and all worktrees in a batch must merge successfully before the per-batch test gate runs. | Contract | Unit | `pdlc/workflows/__tests__/implPhase.test.js` | — | TSPEC-IMPL-05 |
| PROP-IMPL-10 | The PLAN DAG parsing agent must be called exactly once, must return structured JSON matching `{tasks: [{id, description, dependencies, planBatch}]}`, and must cause the script to halt with `"Error: PLAN parsing agent failed to return structured task list"` on an empty or non-JSON result. | Error Handling | Unit | `pdlc/workflows/__tests__/implPhase.test.js` | — | TSPEC-IMPL-01 |
| PROP-IMPL-11 | The per-batch test gate (both `evaluateBatchGate` and `evaluateSingleAgentGate`) must also treat a result containing `non-zero exit` (case-insensitive) as a failure — the failure detection must not be limited to `Tests: N failed` alone. | Contract | Unit | `pdlc/workflows/__tests__/implPhase.test.js` | — | TSPEC-IMPL-06 |
| PROP-IMPL-12 | When a topological level contains more than 5 ready tasks, the script must split them into sub-batches of at most 5 in PLAN document order; sub-batches at the same topological level must execute sequentially (sub-batch A completes its test gate before sub-batch B dispatches). | Contract | Unit | `pdlc/workflows/__tests__/implPhase.test.js` | — | TSPEC-IMPL-02, TSPEC-IMPL-03 |

---

## 5. HARVEST Properties — Harvest Phase

These properties cover the harvest phase (TSPEC-HARVEST-01 through TSPEC-HARVEST-04) and FSPEC acceptance tests AT-HARVEST-01 through AT-HARVEST-03.

| ID | Description | Category | Test Level | Test File | FSPEC AT | TSPEC Ref |
|---|---|---|---|---|---|---|
| PROP-HARVEST-01 | The harvest agent must be invoked with a prompt that orders operations as: (1) read CROSS-REVIEW-*.md files, (2) read POSTMORTEM-*.md files, (3) write LEARNINGS-{featureName}.md, (4) commit and push LEARNINGS before any delete, (5) delete CROSS-REVIEW-* files only after LEARNINGS commit is confirmed on remote, (6) commit and push deletions. The LEARNINGS commit must appear before any deletion commit in git log. | Functional | Integration | `pdlc/workflows/__tests__/harvestPhase.test.js` | AT-HARVEST-01 | TSPEC-HARVEST-02 |
| PROP-HARVEST-02 | When the harvest agent's result contains the substring `"pdlc guard: refusing to delete CROSS-REVIEW files"`, the workflow script must halt immediately, include `"Phase H halted: guard-harvest-before-delete blocked deletion of {blocked-file-path}"` in the final report, and NOT retry the deletion or attempt other deletions. | Error Handling | Unit | `pdlc/workflows/__tests__/harvestPhase.test.js` | AT-HARVEST-02 | TSPEC-HARVEST-03, TSPEC-HARVEST-04 |
| PROP-HARVEST-03 | When `PHASE_H_ENABLED` is `false`, the script must: emit `log("Phase H skipped — prerequisite not yet landed")`, emit a `phase("Phase H: ⏭ Skipped (prerequisite)")` label, include `"Phase H: ⏭ Skipped (prerequisite not yet landed)"` in the final report, and NOT invoke any harvest agent. | Functional | Unit | `pdlc/workflows/__tests__/harvestPhase.test.js` | — | TSPEC-HARVEST-01, PLAN AT-HARVEST-03 |
| PROP-HARVEST-04 | The `guard-harvest-before-delete` PreToolUse hook script must detect the guard block via the canonical substring `"pdlc guard: refusing to delete CROSS-REVIEW files"` in the harvest agent result — not by the exit code alone. The detection must identify the specific blocked file path from the agent result to include in the final report. | Contract | Unit | `pdlc/workflows/__tests__/harvestPhase.test.js` | AT-HARVEST-02 | TSPEC-HARVEST-03, TSPEC-HARVEST-04 |
| PROP-HARVEST-05 | The PHASE_H_ENABLED flag must be declared at the top of the script body before any executable logic and must have a boolean value — the script must not evaluate harvest-phase logic when the flag is `false`. | Contract | Unit | `pdlc/workflows/__tests__/harvestPhase.test.js` | — | TSPEC-HARVEST-01 |

---

## 6. SKILL Properties — SKILL.md Content

These properties cover the VERDICT trailer additions to the three review SKILL.md files (TSPEC-SKILL-01, PLAN TASK-P1-01/02/03) and the `orchestrate-dev` SKILL.md rewrite (TSPEC-SKILL-02, PLAN TASK-P5-01).

| ID | Description | Category | Test Level | Test File | FSPEC AT | TSPEC Ref |
|---|---|---|---|---|---|---|
| PROP-SKILL-01 | `pdlc/skills/se-review/SKILL.md` must contain the `## VERDICT Trailer (required — workflow data contract)` section header after a `---` horizontal-rule separator following the existing final "Communication Style" section. | Contract | Unit | `pdlc/workflows/__tests__/skillFiles.test.js` | — | TSPEC-SKILL-01, PLAN TASK-P1-01 |
| PROP-SKILL-02 | `pdlc/skills/te-review/SKILL.md` must contain the `## VERDICT Trailer (required — workflow data contract)` section header after a `---` horizontal-rule separator following the existing final "Communication Style" section. | Contract | Unit | `pdlc/workflows/__tests__/skillFiles.test.js` | — | TSPEC-SKILL-01, PLAN TASK-P1-02 |
| PROP-SKILL-03 | `pdlc/skills/pm-review/SKILL.md` must contain the `## VERDICT Trailer (required — workflow data contract)` section header after a `---` horizontal-rule separator following the existing final "Communication Style" section. | Contract | Unit | `pdlc/workflows/__tests__/skillFiles.test.js` | — | TSPEC-SKILL-01, PLAN TASK-P1-03 |
| PROP-SKILL-04 | Each of the three review SKILL.md files (`se-review`, `te-review`, `pm-review`) must contain the exact VERDICT format block: a line starting with `VERDICT: ` (permitting any of the three valid verdict values as documentation), followed on the immediately next line by `{"high": N, "medium": N, "low": N}` — the two-line format must be present in the file text. | Contract | Unit | `pdlc/workflows/__tests__/skillFiles.test.js` | — | TSPEC-SKILL-01, REQ-COMPAT-01 |
| PROP-SKILL-05 | `pdlc/skills/orchestrate-dev/SKILL.md` must contain all seven required TSPEC-SKILL-02 sections in order: Invocation contract, Preconditions, What the workflow does (phase-sequence summary), Auto-approved batching decision, Two-workflow split (known alternative), Artifact conventions, Workflow script path. | Contract | Unit | `pdlc/workflows/__tests__/orchestrateDevSkill.test.js` | — | TSPEC-SKILL-02, PLAN TASK-P5-01 |
| PROP-SKILL-06 | The rewritten `pdlc/skills/orchestrate-dev/SKILL.md` must be under 100 lines and must NOT contain step-by-step reviewer dispatch blocks or loop mechanics prose. | Contract | Unit | `pdlc/workflows/__tests__/orchestrateDevSkill.test.js` | — | TSPEC-SKILL-02, REQ-SKILL-01 |
| PROP-SKILL-07 | The rewritten `pdlc/skills/orchestrate-dev/SKILL.md` must document the two-workflow split (`orchestrate-spec`/`orchestrate-impl`) as the known alternative and explain the rejection rationale (manual invocation reintroduces the manual coordination that the single-workflow approach eliminates). | Contract | Unit | `pdlc/workflows/__tests__/orchestrateDevSkill.test.js` | — | TSPEC-SKILL-02, REQ-SKILL-01 |
| PROP-SKILL-08 | The rewritten `pdlc/skills/orchestrate-dev/SKILL.md` must reference both the canonical plugin source path (`pdlc/workflows/orchestrate-dev.js`) and the runtime-loaded consumer path (`.claude/workflows/orchestrate-dev.js`). | Contract | Unit | `pdlc/workflows/__tests__/orchestrateDevSkill.test.js` | — | TSPEC-SKILL-02, REQ-SKILL-01 |

---

## 7. COMPAT Properties — Backward Compatibility

These properties cover backward-compatibility invariants (REQ-COMPAT-02, REQ-COMPAT-03) and TSPEC-NFR-04, TSPEC-NFR-05.

| ID | Description | Category | Test Level | Test File | FSPEC AT | TSPEC Ref |
|---|---|---|---|---|---|---|
| PROP-COMPAT-01 | The `pdlc/hooks/scripts/guard-harvest-before-delete.sh` file must exist and be unmodified from the repo baseline — the guard hook is not changed by this feature. | Contract | Unit | `pdlc/workflows/__tests__/harvestPhase.test.js` | — | REQ-COMPAT-02, PLAN TASK-P4-01 |
| PROP-COMPAT-02 | The `pdlc/hooks/scripts/check-scope-field.sh` file must exist and be unmodified from the repo baseline — the scope-field hook is not changed by this feature. | Contract | Unit | `pdlc/workflows/__tests__/harvestPhase.test.js` | — | REQ-COMPAT-02, PLAN TASK-P4-01 |
| PROP-COMPAT-03 | The `pdlc/hooks/scripts/nudge-consolidation.sh` file must exist and be unmodified from the repo baseline — the nudge-consolidation hook is not changed by this feature. | Contract | Unit | `pdlc/workflows/__tests__/harvestPhase.test.js` | — | REQ-COMPAT-02, PLAN TASK-P4-01 |
| PROP-COMPAT-04 | The worker SKILL.md files for `pm-author`, `se-author`, `te-author`, `se-implement`, `harvest-learnings`, `consolidate-learnings`, `tech-lead`, and `tech-lead-python` must be unmodified from the repo baseline — this feature does not change any worker skill other than the additive VERDICT trailer on the three review skills. | Contract | Unit | `pdlc/workflows/__tests__/skillFiles.test.js` | — | REQ-COMPAT-03, TSPEC-NFR-05 |
| PROP-COMPAT-05 | `tech-lead` and `tech-lead-python` SKILL.md files must exist and be unmodified — these skills remain in the repo for standalone/interactive use; the workflow script does NOT route through them (DAG-parse/batch/dispatch logic is implemented directly in the script). | Contract | Unit | `pdlc/workflows/__tests__/skillFiles.test.js` | — | REQ-COMPAT-03, TSPEC-NFR-05 |
| PROP-COMPAT-06 | The VERDICT trailer appended to `se-review`, `te-review`, and `pm-review` SKILL.md files must NOT change any prose preceding it — only additive content (new section after `---` separator) is permitted. An interactive caller who ignores the final lines of the skill's response must see no functional change. | Contract | Unit | `pdlc/workflows/__tests__/skillFiles.test.js` | — | REQ-COMPAT-01, TSPEC-NFR-04 |
| PROP-COMPAT-07 | The workflow script must NOT use `require()` (CommonJS) — it must use ESM `import` syntax exclusively. No `module.exports` is permitted. | Contract | Unit | `pdlc/workflows/__tests__/orchestrate-dev.test.js` | — | TSPEC-SCRIPT-02 |

---

## 8. Coverage Matrix

| Requirement | Properties Covering It |
|---|---|
| REQ-PIPELINE-01 | PROP-ENTRY-03, PROP-ENTRY-04, PROP-ENTRY-05, PROP-ENTRY-06 |
| REQ-PIPELINE-02 | PROP-IMPL-01, PROP-IMPL-07, PROP-IMPL-09 |
| REQ-PIPELINE-03 | PROP-LOOP-13, PROP-LOOP-14, PROP-LOOP-15, PROP-LOOP-16 |
| REQ-GATE-01 | PROP-PARSE-01, PROP-PARSE-02, PROP-LOOP-01, PROP-LOOP-02 |
| REQ-GATE-02 | PROP-LOOP-03, PROP-LOOP-12, PROP-PARSE-13 through PROP-PARSE-19 |
| REQ-GATE-03 | PROP-IMPL-01, PROP-IMPL-04, PROP-IMPL-07 |
| REQ-GATE-04 | PROP-LOOP-03, PROP-LOOP-05, PROP-LOOP-11, PROP-LOOP-12 |
| REQ-GATE-05 | PROP-PARSE-02, PROP-PARSE-09, PROP-LOOP-04, PROP-LOOP-08 |
| REQ-COMPAT-01 | PROP-SKILL-01 through PROP-SKILL-04, PROP-COMPAT-06 |
| REQ-COMPAT-02 | PROP-COMPAT-01, PROP-COMPAT-02, PROP-COMPAT-03 |
| REQ-COMPAT-03 | PROP-COMPAT-04, PROP-COMPAT-05, PROP-COMPAT-06 |
| REQ-ARTIFACTS-01 | PROP-ENTRY-01 (naming-convention halt path) |
| REQ-ARTIFACTS-02 | PROP-HARVEST-01, PROP-HARVEST-02, PROP-HARVEST-04 |
| REQ-OBS-01 | PROP-LOOP-14, PROP-LOOP-15, PROP-LOOP-16, PROP-IMPL-01 |
| REQ-OBS-02 | (structural — verified by FinalReport type shape; no independent property needed) |
| REQ-SKILL-01 | PROP-SKILL-05, PROP-SKILL-06, PROP-SKILL-07, PROP-SKILL-08 |
| REQ-NFR-01 | PROP-IMPL-07 (5-agent fan-out cap enforced at batch dispatch) |
| REQ-NFR-02 | PROP-LOOP-10 (agent results not passed to log()) |

---

## 9. Test File Index

| Test File | Properties Covered |
|---|---|
| `pdlc/workflows/__tests__/parseVerdict.test.js` | PROP-PARSE-01 through PROP-PARSE-12 |
| `pdlc/workflows/__tests__/parseDecisionsWarranted.test.js` | PROP-PARSE-13 through PROP-PARSE-19 |
| `pdlc/workflows/__tests__/reviewLoop.test.js` | PROP-LOOP-01 through PROP-LOOP-16 |
| `pdlc/workflows/__tests__/orchestrate-dev.test.js` | PROP-ENTRY-01 through PROP-ENTRY-06, PROP-COMPAT-07 |
| `pdlc/workflows/__tests__/implPhase.test.js` | PROP-IMPL-01 through PROP-IMPL-12 |
| `pdlc/workflows/__tests__/harvestPhase.test.js` | PROP-HARVEST-01 through PROP-HARVEST-05, PROP-COMPAT-01 through PROP-COMPAT-03 |
| `pdlc/workflows/__tests__/skillFiles.test.js` | PROP-SKILL-01 through PROP-SKILL-04, PROP-COMPAT-04 through PROP-COMPAT-06 |
| `pdlc/workflows/__tests__/orchestrateDevSkill.test.js` | PROP-SKILL-05 through PROP-SKILL-08 |

---

## 10. Gaps and Notes

1. **REQ-OBS-02 (final report schema):** No independent property is defined because the `FinalReport` type shape (TSPEC-ERROR-03) is verified structurally by the pipeline-wiring tests in `pipelineWiring.test.js` — all phases contributing `PhaseReport` entries, the `testSummary` and `harvestStatus` fields, and the optional `haltReason`. This is adequately covered as a contract property of `TSPEC-ERROR-03` tested in TASK-P4-04 rather than a separate PROPERTIES test.

2. **REQ-NFR-01 (worst-case agent count):** The analytical 156-agent formula is verified by the concurrent-agent ceiling analysis code comment (PLAN TASK-P4-04 [PM-F02]), not by a runtime test. The fan-out cap (≤5 concurrent per batch, ≤2 for reviewer pairs) is enforced by PROP-IMPL-07 and PROP-LOOP-09.

3. **AT-HARVEST-03 scope:** The FSPEC does not define a named AT-HARVEST-03; the AT referenced in PLAN TASK-P4-01 is a TE-F06 addition. PROP-HARVEST-03 covers it.

4. **DECISIONS conditional integration testing:** PROP-PARSE-13 through PROP-PARSE-19 are defined at unit level. A Phase-level integration property for the full DECISIONS skip/full-path pipeline wiring is covered by `pipelineWiring.test.js` tests per PLAN TASK-P4-02 — not added as a separate PROPERTIES entry to avoid duplication.
