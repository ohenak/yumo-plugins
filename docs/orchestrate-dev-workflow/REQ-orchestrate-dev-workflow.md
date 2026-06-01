---
Status: Draft
Author: pm-author
Version: 1.0
Feature: orchestrate-dev-workflow
---

| Field | Value |
|---|---|
| Upstream | **REQ** |
| Downstream | FSPEC, TSPEC, PROPERTIES |
| Cross-Reviews | (pending) |
| LEARNINGS | docs/orchestrate-dev-workflow/LEARNINGS-orchestrate-dev-workflow.md |

# REQ — orchestrate-dev-workflow

Rewrite the `orchestrate-dev` skill as a Claude Code dynamic workflow so the full PDLC pipeline executes unattended in the background, with gate logic and loop control in code rather than in the orchestrator's conversation context.

---

## Background

`orchestrate-dev` today is a prose skill: Claude follows the runbook turn by turn. Every cross-review file lands in the main context window; every loop iteration burns orchestrator tokens. For a typical feature this means 30–60 subagent invocations coordinated from a single monotonically growing conversation.

Dynamic workflows execute as a JavaScript script in the background. The plan (loops, branches, gate decisions) lives in code; intermediate results live in script variables; the session stays responsive; the run is resumable. The orchestrator is the cleanest candidate to convert because its own `Scope` says it does no direct authoring — it only reads docs, judges approval, and dispatches agents.

---

## Scope

### In Scope

- Rewrite the orchestration logic as a dynamic workflow script (`pdlc/workflows/orchestrate-dev.js`)
- Absorb `tech-lead`'s DAG-parse / topological-batch / parallel-dispatch / merge / test-gate logic into the script
- Add an additive verdict trailer to `se-review`, `te-review`, and `pm-review` skills (backward-compatible)
- Rewrite `orchestrate-dev/SKILL.md` as a pointer/contract document
- Preserve all existing artifact conventions, file-naming, and hook behaviors

### Out of Scope

- Ptah engine integration (separate decision, post-ship)
- Changes to any worker skill other than the additive verdict trailer
- New artifact types or naming conventions
- Migration tooling for in-progress features (handled manually)
- The two-workflow split variant (`orchestrate-spec` / `orchestrate-impl`) — not chosen; documented in the rewritten SKILL.md as a known alternative

### Assumptions

- Claude Code ≥ v2.1.154 with the `Workflow` tool available
- Dynamic workflow runtime exposes `agent()`, `parallel()`, `pipeline()`, `phase()`, `log()` per the Workflow tool specification
- The three review skills (`se-review`, `te-review`, `pm-review`) already compute a `Recommendation:` verdict; the trailer only surfaces it on the return channel and does not alter the verdict computation
- Worktree model: direct-commit to `feat-{feature}` for doc-authoring/review phases; `isolation: "worktree"` only for parallel `se-implement` code phases where concurrent edits to source can collide

---

## User Stories

| ID | Story |
|---|---|
| US-01 | As a developer using pdlc, I want to invoke the full PDLC pipeline with a single command that runs unattended as a background workflow, so that I can remain productive in my session while the pipeline executes. |
| US-02 | As a developer, I want each review loop to converge automatically with gate decisions made by the script, so that the pipeline does not require manual intervention between phases. |
| US-03 | As a developer, I want the pipeline run to be resumable after interruption, so that I do not need to restart from scratch if my session ends or the run is paused. |
| US-04 | As a developer, I want real-time pipeline progress (phases, agents, batch plan) visible in `/workflows`, so that I can observe what is running and intervene if needed. |
| US-05 | As a developer, I want non-converging review loops to automatically produce a POSTMORTEM artifact before halting, so that the failure signal is captured and available to Phase H. |
| US-06 | As a developer, I want all existing worker skills, artifact conventions, and hooks to work identically in the workflow context, so that existing guarantees around harvest ordering, scope-field nudging, and artifact naming are preserved. |
| US-07 | As a developer invoking the pipeline, I want the computed implementation batch plan emitted to the `/workflows` progress view before execution begins, so that I can see what the script will run even though I cannot pause to approve it interactively. |

---

## Requirements

### Domain: PIPELINE — Orchestration Model

#### REQ-PIPELINE-01
**Title:** Single end-to-end workflow invocation

**Description:** The pipeline SHALL execute as a single dynamic workflow when invoked via `/pdlc:orchestrate-dev docs/{feature}/REQ-{feature}.md`. The user's session SHALL remain responsive throughout. Only the final report SHALL land in the main conversation context.

**Acceptance criteria:**
- **Who:** Developer
- **Given:** A user-approved REQ document exists at the specified path
- **When:** Developer invokes `/pdlc:orchestrate-dev docs/{feature}/REQ-{feature}.md`
- **Then:** The workflow launches in the background, all phases execute unattended, and the final pipeline report is delivered to the main conversation on completion

**Priority:** P0
**Phase:** 1
**Source:** US-01, US-02
**Dependencies:** —

---

#### REQ-PIPELINE-02
**Title:** Pipeline phases match current SKILL.md sequence

**Description:** The workflow SHALL execute the same phase sequence as the current `orchestrate-dev` SKILL.md: REQ review → FSPEC → TSPEC → DECISIONS (conditional) → PLAN → PROPERTIES → Implementation → PROPERTIES tests → Final codebase review → Harvest. No phases SHALL be skipped or reordered.

**Acceptance criteria:**
- **Who:** Developer
- **Given:** A pipeline run is in progress
- **When:** The pipeline completes successfully
- **Then:** All phases have executed in the defined sequence; no phase is absent from the `/workflows` progress view

**Priority:** P0
**Phase:** 1
**Source:** US-01, US-06
**Dependencies:** REQ-PIPELINE-01

---

#### REQ-PIPELINE-03
**Title:** Resumable run

**Description:** A pipeline run that is paused or interrupted SHALL be resumable within the same session by re-invoking Workflow with `resumeFromRunId`. Completed agents SHALL return their cached results; only new or edited calls SHALL re-run.

**Acceptance criteria:**
- **Who:** Developer
- **Given:** A pipeline run has been stopped or paused mid-execution
- **When:** Developer resumes the run using the run ID
- **Then:** The pipeline continues from where it stopped; already-completed agent calls do not re-execute

**Priority:** P1
**Phase:** 1
**Source:** US-03
**Dependencies:** REQ-PIPELINE-01

---

### Domain: GATE — Loop Mechanics and Approval

#### REQ-GATE-01
**Title:** Script-owned gate decisions

**Description:** All approval gate decisions SHALL be made by the workflow script, not by Claude's reasoning in a conversation turn. The script SHALL branch on `Approved | Approved with minor changes → pass` and `Needs revision → trigger optimizer`, using the `VERDICT:` line returned by reviewer agents.

**Acceptance criteria:**
- **Who:** Workflow runtime
- **Given:** Both reviewers for a phase have completed
- **When:** The script evaluates gate state
- **Then:** The gate decision is determined solely from the return values of the reviewer agents (not from reading files on disk); execution branches correctly based on those verdicts

**Priority:** P0
**Phase:** 1
**Source:** US-02
**Dependencies:** REQ-COMPAT-01

---

#### REQ-GATE-02
**Title:** Evaluator-optimizer loop with 5-iteration cap

**Description:** Each review phase SHALL implement an evaluator-optimizer loop: two reviewers run in parallel, the script checks both verdicts, and if either fails it invokes the optimizer skill. The loop SHALL cap at 5 iterations. A single reusable `reviewLoop` construct SHALL serve all review phases (REQ, FSPEC, TSPEC, DECISIONS, PLAN, PROPERTIES, IMPLEMENTATION) so the loop logic is not duplicated across phases.

**Acceptance criteria:**
- **Who:** Workflow script
- **Given:** A review phase has begun
- **When:** The loop runs through iterations
- **Then:** (1) Both reviewers execute in parallel per iteration; (2) the optimizer runs only when at least one reviewer fails; (3) the loop terminates when both reviewers pass or 5 iterations are exhausted; (4) all review phases use the same `reviewLoop` construct

**Priority:** P0
**Phase:** 1
**Source:** US-02, US-06
**Dependencies:** REQ-GATE-01

---

#### REQ-GATE-03
**Title:** Auto-approved implementation batch plan with observability

**Description:** The computed implementation batch plan (topological sort of PLAN tasks by dependency) SHALL execute automatically without requiring user approval. The batch plan SHALL be emitted to the `/workflows` progress view via `log()` before any `se-implement` agent is dispatched.

**Acceptance criteria:**
- **Who:** Developer
- **Given:** PROPERTIES are approved and the implementation phase begins
- **When:** The script computes the batch plan
- **Then:** (1) The batch plan is logged to the `/workflows` progress view before any `se-implement` agent is dispatched; (2) implementation proceeds automatically without waiting for user input

**Priority:** P0
**Phase:** 1
**Source:** US-07
**Dependencies:** REQ-PIPELINE-02

---

#### REQ-GATE-04
**Title:** Non-convergence POSTMORTEM before halt

**Description:** When any review loop reaches the 5-iteration limit without converging, the script SHALL invoke an agent to write `docs/{feature}/POSTMORTEM-{phase}-{feature}.md` before the run halts. The run SHALL halt with a report listing the unresolved findings and the reviewers who did not approve.

**Acceptance criteria:**
- **Who:** Workflow script
- **Given:** A review loop has completed 5 iterations and at least one reviewer still returns "Needs revision"
- **When:** The loop limit is reached
- **Then:** (1) An agent writes `POSTMORTEM-{phase}-{feature}.md` with the pattern-of-disagreement analysis; (2) the workflow halts; (3) the final report identifies which phase failed, which reviewers did not approve, and all unresolved High/Medium findings

**Priority:** P0
**Phase:** 1
**Source:** US-05
**Dependencies:** REQ-GATE-02

---

### Domain: COMPAT — Backward Compatibility

#### REQ-COMPAT-01
**Title:** Verdict trailer added to review skills

**Description:** The `se-review`, `te-review`, and `pm-review` skills SHALL each receive an additive instruction: after writing their `CROSS-REVIEW-*.md` file to disk, they SHALL end their final message with exactly: `VERDICT: <Approved | Approved with minor changes | Needs revision>` followed by a JSON object `{"high": N, "medium": N, "low": N}`. This SHALL be backward-compatible — interactive callers that do not parse the trailer are unaffected.

**Acceptance criteria:**
- **Who:** Review skill
- **Given:** A review skill has completed its cross-review document
- **When:** The skill's final message is produced
- **Then:** The final message ends with a `VERDICT:` line and a finding-count JSON object; the cross-review file on disk is unchanged from today's format

**Priority:** P0
**Phase:** 1
**Source:** US-06
**Dependencies:** —

---

#### REQ-COMPAT-02
**Title:** All existing hooks fire on workflow agent actions

**Description:** The three pdlc hooks — `guard-harvest-before-delete` (PreToolUse: Bash), `check-scope-field` (PostToolUse: Write|Edit), and `nudge-consolidation` (SessionStart) — SHALL fire identically in the workflow context as they do in interactive use. No hook SHALL be bypassed or require modification.

**Acceptance criteria:**
- **Who:** Workflow agent running inside the pipeline
- **Given:** An agent writes a pdlc artifact or attempts to delete a `CROSS-REVIEW-*` file
- **When:** The tool call executes
- **Then:** (1) `check-scope-field` fires after any Write/Edit to a pdlc artifact; (2) `guard-harvest-before-delete` blocks any `CROSS-REVIEW-*` deletion until `LEARNINGS-{feature}.md` exists on the branch

**Priority:** P0
**Phase:** 1
**Source:** US-06
**Dependencies:** —

---

#### REQ-COMPAT-03
**Title:** Worker skills unchanged except the verdict trailer

**Description:** All worker skills (`pm-author`, `se-author`, `te-author`, `se-implement`, `harvest-learnings`, `consolidate-learnings`, `tech-lead`, `tech-lead-python`) SHALL remain behaviorally unchanged by this feature except for the additive verdict trailer on the three review skills (REQ-COMPAT-01). `tech-lead` and `tech-lead-python` SHALL remain in the repo for standalone/interactive use; the workflow SHALL NOT route through them.

**Acceptance criteria:**
- **Who:** Developer using any pdlc skill interactively
- **Given:** The feature has shipped
- **When:** Any pdlc skill is invoked interactively (outside the workflow)
- **Then:** Its behavior is identical to before the feature shipped (except `se-review`/`te-review`/`pm-review` now append the verdict trailer, which interactive callers may ignore)

**Priority:** P0
**Phase:** 1
**Source:** US-06
**Dependencies:** REQ-COMPAT-01

---

### Domain: ARTIFACTS — Output Files and Naming

#### REQ-ARTIFACTS-01
**Title:** Artifact naming conventions preserved

**Description:** All artifacts produced by the workflow SHALL use the same naming conventions as defined in CLAUDE.md: `docs/{feature}/REQ-{feature}.md`, `CROSS-REVIEW-{skill}-{doc-type}[-v{N}].md`, `POSTMORTEM-{phase}-{feature}.md`, `LEARNINGS-{feature}.md`, etc. No new naming conventions SHALL be introduced.

**Acceptance criteria:**
- **Who:** Developer
- **Given:** A pipeline run has produced artifacts
- **When:** Artifacts are inspected
- **Then:** All artifact paths and names match the conventions defined in CLAUDE.md; no artifacts exist at unexpected paths

**Priority:** P0
**Phase:** 1
**Source:** US-06
**Dependencies:** —

---

#### REQ-ARTIFACTS-02
**Title:** Harvest ordering enforced

**Description:** In Phase H, the harvest agent SHALL write and push `LEARNINGS-{feature}.md` before deleting any `CROSS-REVIEW-*` files. The `guard-harvest-before-delete` hook provides a second enforcement layer; the workflow's own prompt ordering is the primary guarantee.

**Acceptance criteria:**
- **Who:** Harvest agent
- **Given:** Final codebase review is approved
- **When:** Phase H executes
- **Then:** (1) `LEARNINGS-{feature}.md` is committed and pushed before any `CROSS-REVIEW-*` file is deleted; (2) if the guard hook blocks a deletion, the run halts with an error rather than silently skipping the delete

**Priority:** P0
**Phase:** 1
**Source:** US-06
**Dependencies:** REQ-COMPAT-02

---

### Domain: OBS — Observability

#### REQ-OBS-01
**Title:** Phase-by-phase progress in /workflows view

**Description:** The workflow SHALL use `phase()` calls to label each PDLC phase in the `/workflows` progress view. Each agent within a phase SHALL be labeled to identify the skill and document type being processed (e.g., `review:se-review:REQ`, `optimize:pm-author:REQ`, `create:se-author:TSPEC`).

**Acceptance criteria:**
- **Who:** Developer monitoring the pipeline
- **Given:** A pipeline run is active
- **When:** Developer opens `/workflows`
- **Then:** Each PDLC phase is visible as a labeled group; each agent within a phase is labeled with its skill and document; loop iteration numbers are shown for review phases

**Priority:** P1
**Phase:** 1
**Source:** US-04
**Dependencies:** REQ-PIPELINE-01

---

#### REQ-OBS-02
**Title:** Final report summarizes pipeline outcome

**Description:** On completion (success or halt), the workflow SHALL return a structured final report to the main conversation context. The report SHALL list every phase with its outcome, every artifact path, test pass/fail summary, and harvest status.

**Acceptance criteria:**
- **Who:** Developer
- **Given:** The pipeline has completed or halted
- **When:** The final report lands in context
- **Then:** The report includes: (1) every phase with ✅/❌ status; (2) artifact paths; (3) test pass/fail summary; (4) harvest status or the path of any POSTMORTEM written

**Priority:** P1
**Phase:** 1
**Source:** US-01, US-04
**Dependencies:** REQ-PIPELINE-01

---

### Domain: SKILL — SKILL.md Rewrite

#### REQ-SKILL-01
**Title:** orchestrate-dev SKILL.md rewritten as pointer/contract doc

**Description:** `pdlc/skills/orchestrate-dev/SKILL.md` SHALL be rewritten from a step-by-step runbook into a concise contract document covering: invocation interface, preconditions, what the workflow does, the auto-approved-batching decision and its trade-off, artifact conventions, and the workflow script location.

**Acceptance criteria:**
- **Who:** Developer or Ptah engine reading SKILL.md
- **Given:** The feature has shipped
- **When:** SKILL.md is read
- **Then:** (1) The document is concise (not a step-by-step runbook); (2) it documents the invocation contract; (3) it states the auto-approved batching decision and documents the two-workflow split as the known alternative; (4) it references the workflow script path

**Priority:** P1
**Phase:** 2
**Source:** US-06
**Dependencies:** REQ-PIPELINE-01

---

### Non-Functional Requirements

#### REQ-NFR-01
**Title:** Scale limits respected

**Description:** The workflow SHALL never exceed 16 concurrent agents at any point. A full feature pipeline SHALL stay well under the 1,000-agent-per-run cap. The maximum fan-out per implementation batch SHALL be 5 `se-implement` agents (matching the existing tech-lead convention).

**Acceptance criteria:**
- **Who:** Workflow runtime
- **Given:** A pipeline run is in progress
- **When:** Implementation batches execute
- **Then:** No more than 5 `se-implement` agents run concurrently per batch; total agents for a typical feature remain under 100

**Priority:** P0
**Phase:** 1
**Source:** US-02
**Dependencies:** REQ-PIPELINE-01

---

#### REQ-NFR-02
**Title:** Context isolation

**Description:** Intermediate results (cross-review content, reviewer verdicts, optimizer outputs) SHALL live in script variables, not in the main conversation context. Only the final report (Step 10 in SKILL.md) SHALL enter the orchestrator's context.

**Acceptance criteria:**
- **Who:** Developer's main session
- **Given:** A pipeline run has completed
- **When:** The conversation context is inspected
- **Then:** No individual CROSS-REVIEW document content, per-reviewer findings, or per-phase intermediate outputs are visible in the main conversation; only the final report is present

**Priority:** P1
**Phase:** 1
**Source:** US-01
**Dependencies:** REQ-PIPELINE-01

---

## Traceability Matrix

| User Story | Requirements |
|---|---|
| US-01 | REQ-PIPELINE-01, REQ-PIPELINE-02, REQ-OBS-02, REQ-NFR-02 |
| US-02 | REQ-PIPELINE-01, REQ-GATE-01, REQ-GATE-02, REQ-NFR-01 |
| US-03 | REQ-PIPELINE-03 |
| US-04 | REQ-OBS-01, REQ-OBS-02 |
| US-05 | REQ-GATE-04 |
| US-06 | REQ-PIPELINE-02, REQ-COMPAT-01, REQ-COMPAT-02, REQ-COMPAT-03, REQ-ARTIFACTS-01, REQ-ARTIFACTS-02, REQ-SKILL-01 |
| US-07 | REQ-GATE-03 |

---

## Risks and Assumptions

| # | Type | Detail | Mitigation |
|---|---|---|---|
| A1 | Assumption | Dynamic workflow runtime API (`agent()`, `parallel()`, `phase()`) is stable in the installed Claude Code version | Author the script against the live runtime at implementation time; verify API surface before writing tests |
| A2 | Assumption | Worktree model: doc phases use direct-commit to `feat-{feature}`; only parallel `se-implement` phases use `isolation: "worktree"` | Validate merge behavior during Phase I implementation; the Phase-H worktree prerequisite (SKILL.md §9.5) must be resolved before harvest is enabled |
| R1 | Risk | Verdict trailer changes reviewer behavior in interactive use | Trailer is additive (final line only); interactive callers that don't parse it see no functional change. Accept. |
| R2 | Risk | Workflow runtime scale limits constrain large features | Current pipeline fan-out (max 2 reviewers + max 5 implementers per batch) is well under the 16-concurrent cap. Accept. |
