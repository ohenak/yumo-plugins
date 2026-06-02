---
Reviewer: product-manager
Document: docs/orchestrate-dev-workflow/PLAN-orchestrate-dev-workflow.md
Date: 2026-06-01
Iteration: 1
---

# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** docs/orchestrate-dev-workflow/PLAN-orchestrate-dev-workflow.md
**Reference:** docs/orchestrate-dev-workflow/REQ-orchestrate-dev-workflow.md (v1.1)
**Date:** 2026-06-01
**Iteration:** 1

Scope: Review of the PLAN for the orchestrate-dev-workflow feature. Assessed whether every P0 and P1 requirement is covered by plan tasks, whether out-of-scope behavior is included, whether task acceptance criteria align with REQ ACs, and whether the phase sequencing is logical and complete.

---

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | REQ-COMPAT-02 requires all three pdlc hooks to fire identically in the workflow context (`guard-harvest-before-delete`, `check-scope-field`, `nudge-consolidation`). The traceability table maps TASK-P4-01 to REQ-COMPAT-02, but TASK-P4-01 only covers the guard-harvest substring detection. There is no task, AC, or Definition-of-Done item explicitly covering `check-scope-field` firing on Write/Edit by workflow agents, nor `nudge-consolidation` firing on SessionStart. The verifiable scenario in REQ-COMPAT-02 focuses on guard-harvest only; `check-scope-field` and `nudge-consolidation` have no analogous test coverage in any PLAN task. | REQ-COMPAT-02 |
| F-02 | Medium | Local | REQ-NFR-01 AC(2) states "no more than 16 agents run concurrently at any point." No PLAN task or phase-level AC enforces or verifies the 16-concurrent-agent ceiling. TASK-P3-02 and TASK-P3-04 enforce the 5-agent-per-implementation-batch sub-limit, and the Definition of Done states "`parallel()` never dispatches more than 5 agents simultaneously," but during review phases two reviewers run in parallel via `parallel()`, and reviewer parallelism plus simultaneous phase execution could theoretically exceed 16. There is no task that analytically confirms the concurrent ceiling holds across all phase combinations. | REQ-NFR-01 |
| F-03 | Medium | Local | REQ-GATE-04 AC(1) requires the POSTMORTEM to contain specific content sections enumerated in the SKILL.md template (Phase, Iterations, Reviewers, Pattern of Disagreement, Best-Guess Root Cause, Recommendation). TASK-P2-07's AC references AT-LOOP-03 and AT-LOOP-05 only. Neither the task description nor the Phase 2 acceptance criteria block verifies that the agent prompt instructs the POSTMORTEM author to include these six required sections. The TSPEC is the bridge here, but there is no AC in the PLAN that a PM reviewer can trace from REQ-GATE-04 AC(1) to a concrete check. | REQ-GATE-04 |
| F-04 | Low | Local | REQ-OBS-01 requires loop iteration numbers to be logged via `log()` for all review phases. TASK-P2-06 implements the iteration log format, but its traceability entry does not include REQ-OBS-01 — only REQ-GATE-01, REQ-GATE-02, REQ-GATE-04, REQ-GATE-05, REQ-PIPELINE-03. Similarly, TASK-P4-03 implements `phase()` calls for all phases but its traceability row maps to REQ-PIPELINE-01 and REQ-PIPELINE-02 only, not REQ-OBS-01. As a result, REQ-OBS-01 has only a single traceability entry (TASK-P3-03 for batch plan logging) which covers only one of its three ACs. | REQ-OBS-01 |
| F-05 | Low | Local | REQ-SKILL-01 is tagged "Phase: 2" in the REQ, indicating it is a Phase-2 delivery milestone. The PLAN assigns it to "Phase 5" of the implementation sequence. This naming collision between REQ delivery phases and PLAN implementation phases is not explained in the PLAN. While the content mapping appears correct (TASK-P5-01 implements REQ-SKILL-01), a reader cross-referencing REQ phase labels against PLAN phases will be confused. | REQ-SKILL-01 |
| F-06 | Low | Local | The PLAN summary states "Phase 5 can parallelize with Phase 4 once Phase 4 starts," but the dependency graph shows TASK-P5-01 branching from Phase 3 complete (not Phase 4). The narrative and the graph are inconsistent. The stated rationale — that the script path is known in advance — supports starting Phase 5 as early as Phase 3 complete, which the graph reflects correctly. The summary text should match the graph. | REQ-SKILL-01 |

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | REQ-COMPAT-02 states that `nudge-consolidation` fires on SessionStart. Is it in scope to add a task verifying this hook fires when an agent session starts inside the workflow runtime, or is this hook excluded because workflow agents do not model a "SessionStart" event? If excluded, the REQ AC should be narrowed. |
| Q-02 | For REQ-NFR-01 AC(2) (no more than 16 concurrent agents), is the intent that this be analytically verified as a design property of the script (similar to the worst-case agent count formula in the REQ), or is a runtime test expected? A clear answer would determine whether a traceability-only entry in the Definition of Done suffices or a dedicated verification task is needed. |

---

## Positive Observations

- All P0 requirements except the noted gaps have clear task-level coverage with specific TSPEC items cited. The traceability matrix at the bottom of the PLAN is detailed and useful.
- The five-phase sequencing is logical and correctly orders dependencies: VERDICT trailers before parsing code, core before implementation phase, phases before wiring. This matches product priorities (unblocking entry and gate logic before full pipeline assembly).
- The reusable `reviewLoop` construct (TASK-P2-06, TASK-P2-07) directly satisfies REQ-GATE-02's requirement that loop logic is not duplicated across phases — a good product-fidelity call.
- REQ-PIPELINE-03 resume semantics are concretely represented in TASK-P2-06 with specific AT-RESUME acceptance tests (AT-RESUME-01 through AT-RESUME-03) and the exact `log("Resuming from iteration N")` format from the REQ AC.
- The DECISIONS conditional path (TASK-P4-02) mirrors the REQ's DECISIONS conditional branch specification closely, including the exact skip log string and phase label.
- The Definition of Done consolidates cross-cutting constraints (no `require()`, no `fs.existsSync`, parallel cap) that would otherwise be hard to trace — good practice.
- Phase sequencing does not introduce any out-of-scope behavior. The plan stays cleanly within the REQ In Scope boundary; no new artifact types, naming conventions, or worker skill changes beyond the verdict trailer are introduced.

---

## Recommendation

**Needs revision**

The following must be addressed before implementation begins:

1. **F-01 (Medium):** Add explicit task or AC coverage for `check-scope-field` hook behavior on Write/Edit tool calls from workflow agents. Clarify whether `nudge-consolidation` (SessionStart) is in scope for workflow runtime (see Q-01); if out of scope, narrow REQ-COMPAT-02 or document the exclusion in the PLAN.

2. **F-02 (Medium):** Add an analytical verification item to the Definition of Done (or a dedicated task) confirming the 16-concurrent-agent ceiling holds across all phase combinations, not just implementation batches. The worst-case formula in REQ-NFR-01 is the appropriate reference; the PLAN should cite it explicitly.

3. **F-03 (Medium):** Update TASK-P2-07's description or the Phase 2 acceptance criteria to require that the POSTMORTEM agent prompt instructs inclusion of the six required content sections (Phase, Iterations, Reviewers, Pattern of Disagreement, Best-Guess Root Cause, Recommendation) per REQ-GATE-04 AC(1).

Low findings (F-04, F-05, F-06) are informational — they should be corrected in the next revision but are not blocking.
