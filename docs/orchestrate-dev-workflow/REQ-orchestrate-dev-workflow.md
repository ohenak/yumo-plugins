---
Status: Draft
Author: pm-author
Version: 1.1
Feature: orchestrate-dev-workflow
---

| Field | Value |
|---|---|
| Upstream | **REQ** |
| Downstream | FSPEC, TSPEC, PROPERTIES |
| Cross-Reviews | CROSS-REVIEW-software-engineer-REQ.md, CROSS-REVIEW-test-engineer-REQ.md |
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

- Rewrite the orchestration logic as a dynamic workflow script. The canonical plugin source is `pdlc/workflows/orchestrate-dev.js`; the runtime-loaded copy that Claude Code executes is `.claude/workflows/orchestrate-dev.js` in the consumer repo. The plugin source is the single source of truth; the consumer copy is generated/updated from it.
- Absorb `tech-lead`'s DAG-parse / topological-batch / parallel-dispatch / merge / test-gate logic into the script
- Add an additive verdict trailer to `se-review`, `te-review`, and `pm-review` skills (backward-compatible)
- Rewrite `orchestrate-dev/SKILL.md` as a pointer/contract document
- Preserve all existing artifact conventions, file-naming, and hook behaviors
- Add a final phase (Phase PUB) that automatically raises/reuses the feature PR and verifies GHA checks pass, with a new `ship-pr` worker skill (see Domain: SHIP)

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
| US-08 | As a developer, I want the pipeline to automatically raise a PR once all implementation and test automation is done and confirm the GHA checks pass, so that a finished feature lands in review without me running the publish-and-watch-CI steps by hand. |

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

**Description:** A pipeline run that is paused or interrupted SHALL be resumable within the same session by re-invoking Workflow with `resumeFromRunId`. Per-agent call caching is a runtime-provided guarantee: the runtime returns the cached result for any agent call that already completed; the script does not implement its own caching layer. When the workflow resumes mid-`reviewLoop`, the iteration count does not restart from 1 — the script relies on the runtime's per-agent caching to skip already-completed reviewer and optimizer calls, advancing to the first incomplete iteration. The script emits `log("Resuming from iteration N")` (where N is the current loop iteration) when it detects it is continuing an in-progress loop on resume.

**Acceptance criteria:**
- **Who:** Developer
- **Given:** A pipeline run has been stopped or paused mid-execution inside a `reviewLoop`
- **When:** Developer resumes the run using the run ID
- **Then:** (1) The pipeline continues from where it stopped; already-completed agent calls do not re-execute; (2) the `/workflows` progress view shows a `log()` entry of the form `"Resuming from iteration N"` where N matches the iteration the loop was on when interrupted; (3) the iteration cap counter does not reset to 1 on resume

**Priority:** P1
**Phase:** 1
**Source:** US-03
**Dependencies:** REQ-PIPELINE-01

---

### Domain: GATE — Loop Mechanics and Approval

#### REQ-GATE-01
**Title:** Script-owned gate decisions

**Description:** All approval gate decisions SHALL be made by the workflow script, not by Claude's reasoning in a conversation turn. The script SHALL branch on `Approved | Approved with minor changes → pass` and `Needs revision → trigger optimizer`, by inspecting the `result` string/object returned by the `agent()` call for each reviewer — not by reading files on disk. The exact VERDICT format the script parses is defined in REQ-COMPAT-01 (the shared data contract).

**Acceptance criteria:**
- **Who:** Workflow script
- **Given:** Both reviewers for a phase have completed
- **When:** The script evaluates gate state
- **Then:** (1) The script reads the `result` returned by the `agent()` call (not any file on disk) to extract the `VERDICT:` value per the format defined in REQ-COMPAT-01; (2) a verdict of `Approved` or `Approved with minor changes` causes the gate to pass; (3) a verdict of `Needs revision` triggers the optimizer; (4) a missing or malformed VERDICT is treated as `Needs revision` per REQ-GATE-05

**Priority:** P0
**Phase:** 1
**Source:** US-02
**Dependencies:** REQ-COMPAT-01

---

#### REQ-GATE-02
**Title:** Evaluator-optimizer loop with 5-iteration cap

**Description:** Each review phase SHALL implement an evaluator-optimizer loop: two reviewers run in parallel, the script checks both verdicts, and if either fails it invokes the optimizer skill. The loop SHALL cap at 5 iterations. A single reusable `reviewLoop` construct SHALL serve all review phases (REQ, FSPEC, TSPEC, DECISIONS, PLAN, PROPERTIES, IMPLEMENTATION) so the loop logic is not duplicated across phases.

**DECISIONS conditional branch:** The script determines whether DECISIONS is warranted by inspecting the return value of the TSPEC author agent, which SHALL include a boolean field `decisionsWarranted: true | false` after reviewing its own TSPEC cross-reviews. When `decisionsWarranted` is `false`, the DECISIONS phase is skipped entirely — the script branches outside the `reviewLoop` and does not pass through a zero-iteration loop. The skip is logged as `log("Phase D skipped — no load-bearing alternatives")` and appears in the final report as Phase D: ⏭ Skipped.

**Partial-iteration reviewer failure:** If one reviewer agent crashes or times out during an iteration, that reviewer's verdict is treated as `Needs revision` for that iteration. The other reviewer's verdict is preserved. The iteration count increments normally. The optimizer is invoked if either verdict is non-passing (including the failure-treated-as-revision).

**Acceptance criteria:**
- **Who:** Workflow script
- **Given:** A review phase has begun
- **When:** The loop runs through iterations
- **Then:** (1) Both reviewers execute in parallel per iteration; (2) the optimizer runs only when at least one reviewer fails or crashes; (3) the loop terminates when both reviewers pass or 5 iterations are exhausted; (4) all review phases use the same `reviewLoop` construct; (5) when DECISIONS is skipped, the `/workflows` progress view shows `"Phase D skipped — no load-bearing alternatives"` and the script does not call `reviewLoop` for that phase; (6) a crashed or timed-out reviewer increments the iteration count and triggers the optimizer without halting the pipeline

**Priority:** P0
**Phase:** 1
**Source:** US-02, US-06
**Dependencies:** REQ-GATE-01

---

#### REQ-GATE-03
**Title:** Auto-approved implementation batch plan with observability

**Description:** The computed implementation batch plan (topological sort of PLAN tasks by dependency) SHALL execute automatically without requiring user approval. The batch plan SHALL be emitted to the `/workflows` progress view before any `se-implement` agent is dispatched. The preferred mechanism is `log()` per confirmed runtime capability at implementation-authoring time; if `log()` does not surface structured data in the `/workflows` view, the fallback is a `phase()` label that includes the batch plan summary in the label text.

**Acceptance criteria:**
- **Who:** Developer
- **Given:** PROPERTIES are approved and the implementation phase begins
- **When:** The script computes the batch plan
- **Then:** (1) The batch plan is visible in the `/workflows` progress view (via `log()` if available, otherwise via `phase()` label) before any `se-implement` agent is dispatched; (2) implementation proceeds automatically without waiting for user input

**Priority:** P0
**Phase:** 1
**Source:** US-07
**Dependencies:** REQ-PIPELINE-02

---

#### REQ-GATE-04
**Title:** Non-convergence POSTMORTEM before halt

**Description:** When any review loop reaches the 5-iteration limit without converging, the script SHALL invoke an agent to write `docs/{feature}/POSTMORTEM-{phase}-{feature}.md` before the run halts. The run SHALL halt with a report listing the unresolved findings and the reviewers who did not approve. The required POSTMORTEM content sections (Phase, Iterations, Reviewers, Pattern of Disagreement, Best-Guess Root Cause, Recommendation) are specified in the `orchestrate-dev` SKILL.md template; this REQ defers content structure to that template.

**Acceptance criteria:**
- **Who:** Workflow script
- **Given:** A review loop has completed 5 iterations and at least one reviewer still returns "Needs revision"
- **When:** The loop limit is reached
- **Then:** (1) An agent writes `POSTMORTEM-{phase}-{feature}.md` containing the sections enumerated in the SKILL.md POSTMORTEM template (Phase, Iterations, Reviewers, Pattern of Disagreement, Best-Guess Root Cause, Recommendation); (2) the workflow halts; (3) the final report identifies which phase failed, which reviewers did not approve, and all unresolved High/Medium findings

**Priority:** P0
**Phase:** 1
**Source:** US-05
**Dependencies:** REQ-GATE-02

---

#### REQ-GATE-05
**Title:** Missing or malformed VERDICT treated as "Needs revision"

**Description:** When a reviewer agent returns output that does not contain a `VERDICT:` line — due to agent crash, truncated output, an un-patched skill, or any other cause — the script SHALL treat the result as `Needs revision` and log a warning rather than crashing or stalling. This prevents silent mis-branching and ensures the loop continues to make forward progress.

**Acceptance criteria:**
- **Who:** Workflow script
- **Given:** A reviewer agent has returned output that contains no parseable `VERDICT:` line
- **When:** The script attempts to extract the verdict
- **Then:** (1) The script treats the missing/malformed verdict as `Needs revision`; (2) the script emits a `log()` warning of the form `"WARNING: reviewer <skill> returned no VERDICT — treating as Needs revision"`; (3) the pipeline does not crash or stall; (4) the iteration count increments and the optimizer is invoked as normal

**Priority:** P0
**Phase:** 1
**Source:** US-02, US-06
**Dependencies:** REQ-GATE-01, REQ-COMPAT-01

---

### Domain: COMPAT — Backward Compatibility

#### REQ-COMPAT-01
**Title:** Verdict trailer data contract (shared specification)

**Description:** The `se-review`, `te-review`, and `pm-review` skills SHALL each receive an additive instruction: after writing their `CROSS-REVIEW-*.md` file to disk, they SHALL end their final message with the VERDICT trailer defined below. This is the shared data contract consumed by REQ-GATE-01 and REQ-GATE-05.

**VERDICT trailer format (normative):**

```
VERDICT: <verdict>
{"high": N, "medium": N, "low": N}
```

- The verdict value is exactly one of (case-sensitive): `Approved`, `Approved with minor changes`, `Needs revision`
- The VERDICT line and the JSON object are on separate consecutive lines with no intervening text
- No text appears between the VERDICT line and the JSON object
- N values are non-negative integers
- The JSON object uses exactly the keys `high`, `medium`, `low` with no additional keys
- If the output is malformed (wrong casing, extra text between lines, missing JSON, invalid JSON) the consuming script treats the result as `Needs revision` per REQ-GATE-05

This trailer is backward-compatible — interactive callers that do not parse it see no functional change.

**Acceptance criteria:**
- **Who:** Review skill
- **Given:** A review skill has completed its cross-review document
- **When:** The skill's final message is produced
- **Then:** (1) The final message ends with a `VERDICT:` line using one of the three exact case-sensitive verdict strings; (2) the JSON object `{"high": N, "medium": N, "low": N}` appears on the immediately following line with no intervening text; (3) the cross-review file on disk is unchanged from today's format

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

**Verifiable scenario (concrete):** Given a workflow harvest agent attempts to delete a `CROSS-REVIEW-*` file on a branch where `LEARNINGS-*.md` does not yet exist, the `guard-harvest-before-delete` PreToolUse hook fires, the hook script exits non-zero, and the agent's Bash call exits non-zero. This is observable as a non-zero exit code in the agent result and constitutes the halt condition per REQ-ARTIFACTS-02.

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

**Hook-block error propagation:** When the `guard-harvest-before-delete` hook fires and blocks a deletion, the propagation chain is: hook script exits non-zero → agent's Bash call exits non-zero → the agent's return value contains the guard hook's error message text → the workflow script detects the non-zero exit in the agent result and treats it as a halt condition. The halt is observable in the final report as a named guard-triggered failure identifying the blocked file path.

**Acceptance criteria:**
- **Who:** Harvest agent
- **Given:** Final codebase review is approved
- **When:** Phase H executes
- **Then:** (1) `LEARNINGS-{feature}.md` is committed and pushed before any `CROSS-REVIEW-*` file is deleted; (2) if the guard hook blocks a deletion, the harvest agent's Bash call exits non-zero, the agent result contains the hook's error message, the workflow script halts, and the final report identifies the guard-triggered failure with the blocked file path

**Priority:** P0
**Phase:** 1
**Source:** US-06
**Dependencies:** REQ-COMPAT-02

---

### Domain: OBS — Observability

#### REQ-OBS-01
**Title:** Phase-by-phase progress in /workflows view

**Description:** The workflow SHALL use `phase()` calls to label each PDLC phase in the `/workflows` progress view. Per-agent labeling (e.g., `review:se-review:REQ`, `optimize:pm-author:REQ`, `create:se-author:TSPEC`) is the preferred observability level, conditioned on the runtime API supporting per-agent metadata at implementation-authoring time. If the runtime only exposes phase-level labels and not per-agent descriptors, the fallback is phase-level labels only; per-agent labels are best-effort in that case. Loop iteration numbers within a phase SHALL be emitted via `log()` regardless of whether per-agent labeling is available.

**Acceptance criteria:**
- **Who:** Developer monitoring the pipeline
- **Given:** A pipeline run is active
- **When:** Developer opens `/workflows`
- **Then:** (1) Each PDLC phase is visible as a labeled group via `phase()`; (2) loop iteration numbers are logged for review phases; (3) per-agent labels are present if the runtime API supports them; (4) if per-agent labeling is unavailable, phase labels are sufficient and the requirement is met

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

### Domain: SHIP — Automatic PR & CI Verification

#### REQ-SHIP-01
**Title:** Auto-raise PR when implementation and test automation are done

**Description:** After all implementation and test automation has completed (and Harvest has run), the workflow SHALL automatically raise a pull request for the `feat-{feature}` branch into the repository's default branch. If a PR is already open for the branch, the workflow SHALL reuse it rather than open a duplicate. The PR SHALL run **last** so it captures the complete branch, including harvested `LEARNINGS`. The workflow SHALL NOT merge the PR — `awaiting-merge → done` remains a human step. PR creation is delegated to a worker skill (`ship-pr`); the orchestration belongs to the workflow script.

**Acceptance criteria:**
- **Who:** Workflow script
- **Given:** A pipeline run has completed implementation, PROPERTIES tests, final codebase review, and harvest
- **When:** Phase PUB executes
- **Then:** (1) a PR is opened (or an existing PR reused) from `feat-{feature}` into the default branch; (2) the PR is not merged; (3) the final report carries the PR URL (`prUrl`); (4) if the PR cannot be created, the pipeline halts with a PR-creation failure

**Priority:** P0
**Phase:** 1
**Source:** US-08
**Dependencies:** REQ-PIPELINE-02, REQ-ARTIFACTS-02

---

#### REQ-SHIP-02
**Title:** Verify GHA checks pass, with a no-checks timeout

**Description:** After raising the PR, the workflow SHALL verify that all GitHub Actions checks on the PR pass. GHA checks usually register within ~5 minutes. The workflow SHALL poll the PR for checks: if **no** checks appear within **10 minutes**, the workflow SHALL conclude the repo has no PR checks configured and treat the phase as a pass (`ciStatus: no-checks`). Once checks appear, the workflow SHALL wait for them to complete; if every check succeeds the phase passes (`ciStatus: passed`); if any check fails the pipeline SHALL halt and identify the failing PR. The poll cadence and all timeouts SHALL live in the workflow script (not the agent), so the gate decision is code-owned and observable.

**Acceptance criteria:**
- **Who:** Workflow script
- **Given:** A PR has been raised for the feature branch
- **When:** The workflow polls the PR's GHA checks
- **Then:** (1) if no checks appear within the 10-minute window, the phase passes with `ciStatus: no-checks`; (2) if checks appear and all pass, the phase passes with `ciStatus: passed`; (3) if any check fails, the pipeline halts with the failing PR identified; (4) the polling timing logic is implemented in the script, not delegated to the agent

**Priority:** P0
**Phase:** 1
**Source:** US-08
**Dependencies:** REQ-SHIP-01

---

#### REQ-SHIP-03
**Title:** `ship-pr` worker skill and report fields

**Description:** A new worker skill `ship-pr` SHALL perform exactly one discrete action per invocation — create/reuse the PR, or report the PR's current CI status — and SHALL communicate results to the script via machine-readable trailers (`PR_URL:` and `CI_STATUS:`), mirroring the VERDICT-trailer data-contract pattern. The final pipeline report SHALL include `prUrl` and `ciStatus`. The phase SHALL be controllable via a compile-time `PHASE_PUB_ENABLED` flag in the workflow script.

**Acceptance criteria:**
- **Who:** Developer / workflow script
- **Given:** The feature has shipped
- **When:** The `ship-pr` skill is invoked by Phase PUB
- **Then:** (1) each invocation performs one action and ends with the appropriate trailer; (2) the script parses `PR_URL:`/`CI_STATUS:` from the agent result (not from disk); (3) the final report includes `prUrl` and `ciStatus`; (4) setting `PHASE_PUB_ENABLED = false` skips the phase

**Priority:** P1
**Phase:** 1
**Source:** US-08
**Dependencies:** REQ-SHIP-01, REQ-SHIP-02

---

### Non-Functional Requirements

#### REQ-NFR-01
**Title:** Scale limits respected

**Description:** The workflow SHALL never exceed 16 concurrent agents at any point. A full feature pipeline SHALL stay well under the 1,000-agent-per-run cap. The maximum fan-out per implementation batch SHALL be 5 `se-implement` agents (matching the existing tech-lead convention).

**Worst-case agent count formula:**
- 1 (initial guard / REQ validation agent)
- + 7 phases × 5 iterations × 3 agents (2 reviewers + 1 optimizer) = 105
- + 5 implementation agents × 5 batches = 25
- + 1 (PROPERTIES test run agent)
- + 1 (final codebase review agent)
- + 1 (harvest agent)
- + up to 8 POSTMORTEM agents (one per non-converging phase, worst case)
- **= ~142 agents worst case**, well under the 1,000-agent-per-run cap

This formula is the analytical basis for the cap compliance acceptance criterion.

**Acceptance criteria:**
- **Who:** Workflow runtime
- **Given:** A pipeline run is in progress
- **When:** Implementation batches execute
- **Then:** (1) No more than 5 `se-implement` agents run concurrently per batch; (2) no more than 16 agents run concurrently at any point; (3) the total agent count for any pipeline run does not exceed the worst-case formula of ~142 agents (analytically verified against the 1,000-agent-per-run cap)

**Priority:** P0
**Phase:** 1
**Source:** US-02
**Dependencies:** REQ-PIPELINE-01

---

#### REQ-NFR-02
**Title:** Context isolation

**Description:** Intermediate results (cross-review content, reviewer verdicts, optimizer outputs) SHALL live in script-local variables, not in the main conversation context. Only the final pipeline report (returned by the workflow's top-level `return` statement) SHALL enter the orchestrator's context. This is a structural guarantee the script provides: agent result objects are stored in script-local variables and are never passed as arguments to `log()` calls that surface in the main context.

**Acceptance criteria:**
- **Who:** Workflow script (code-reviewable structural guarantee)
- **Given:** The workflow script is examined
- **When:** All `log()` call sites are inspected
- **Then:** (1) No `log()` call receives an agent result object containing CROSS-REVIEW document content, per-reviewer findings, or per-phase intermediate output as its argument; (2) agent results are held in script-local variables scoped to the phase or loop in which they are used; (3) the only value returned to the main conversation context is the final structured pipeline report

**Priority:** P1
**Phase:** 1
**Source:** US-01
**Dependencies:** REQ-PIPELINE-01

---

## Traceability Matrix

| User Story | Requirements |
|---|---|
| US-01 | REQ-PIPELINE-01, REQ-PIPELINE-02, REQ-OBS-02, REQ-NFR-02 |
| US-02 | REQ-PIPELINE-01, REQ-GATE-01, REQ-GATE-02, REQ-GATE-05, REQ-NFR-01 |
| US-03 | REQ-PIPELINE-03 |
| US-04 | REQ-OBS-01, REQ-OBS-02 |
| US-05 | REQ-GATE-04, REQ-GATE-05 |
| US-06 | REQ-PIPELINE-02, REQ-COMPAT-01, REQ-COMPAT-02, REQ-COMPAT-03, REQ-ARTIFACTS-01, REQ-ARTIFACTS-02, REQ-SKILL-01 |
| US-07 | REQ-GATE-03 |
| US-08 | REQ-SHIP-01, REQ-SHIP-02, REQ-SHIP-03 |

---

## Risks and Assumptions

| # | Type | Detail | Mitigation |
|---|---|---|---|
| A1 | Assumption | Dynamic workflow runtime API (`agent()`, `parallel()`, `phase()`) is stable in the installed Claude Code version | Author the script against the live runtime at implementation time; verify API surface before writing tests |
| A2 | Assumption | Worktree model: doc phases use direct-commit to `feat-{feature}`; only parallel `se-implement` phases use `isolation: "worktree"` | Validate merge behavior during Phase I implementation; the Phase-H worktree prerequisite (SKILL.md §9.5) must be resolved before harvest is enabled |
| R1 | Risk | Verdict trailer changes reviewer behavior in interactive use | Trailer is additive (final line only); interactive callers that don't parse it see no functional change. Accept. |
| R2 | Risk | Workflow runtime scale limits constrain large features | Current pipeline fan-out (max 2 reviewers + max 5 implementers per batch) is well under the 16-concurrent cap. Accept. |
