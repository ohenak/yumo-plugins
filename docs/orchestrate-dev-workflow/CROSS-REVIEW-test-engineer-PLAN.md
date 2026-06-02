---
Scope: docs/orchestrate-dev-workflow/PLAN-orchestrate-dev-workflow.md
---

# Cross-Review: test-engineer -- PLAN

**Reviewer:** test-engineer
**Document reviewed:** docs/orchestrate-dev-workflow/PLAN-orchestrate-dev-workflow.md
**Date:** 2026-06-01
**Iteration:** 1

---

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **Guard-agent canonical test double is not established as an explicit deliverable.** DEC-ODW-03 states: "A canonical test double for the guard agent must be defined once -- in PROPERTIES or PLAN -- and reused at every call site. Per-test ad-hoc stubbing is prohibited." TASK-P2-03 acknowledges this ("The canonical guard agent test double must be defined here") but the PLAN provides no named output artifact for the canonical double -- no helper file path, no export specification, and no acceptance criterion that the double exists and is importable. TASK-P2-06 (reviewLoop, which also uses the guard agent per TSPEC-LOOP-02) and all of Phase 3 implicitly depend on this double, but without an explicit artifact, each se-implement agent working on those tasks is likely to ad-hoc stub the guard agent -- exactly the divergence DEC-ODW-03 prohibits. The canonical double must be a named deliverable from TASK-P2-03 with a concrete file path (e.g., `pdlc/workflows/__tests__/helpers/guardAgentDouble.js`) in the Test File column and an acceptance criterion: "The canonical double is created and exported; TASK-P2-06 and all Phase 3 tasks import from this path, not from ad-hoc stubs." | TASK-P2-03, DEC-ODW-03, TSPEC-LOOP-02 |
| F-02 | High | Local | **AT-LOOP-06 (reviewLoop precondition failure -- document absent) is not assigned to any task.** FSPEC AT-LOOP-06 covers the case where reviewLoop is called with a docPath that does not exist -- the guard-agent precondition defined in TSPEC-LOOP-02. This is a named FSPEC acceptance test with a direct PROPERTIES implication (it is a negative entry-precondition property). TASK-P2-06 lists the acceptance tests it covers: AT-LOOP-01, AT-LOOP-02, AT-LOOP-04, AT-LOOP-07, AT-LOOP-08, AT-RESUME-01, AT-RESUME-02, AT-RESUME-03. AT-LOOP-06 is absent from this list and from every other task. Because the entry precondition lives in reviewLoop (TSPEC-LOOP-02) and TASK-P2-06 implements reviewLoop, AT-LOOP-06 must be added to TASK-P2-06's acceptance criteria list. Without this, a named FSPEC acceptance test has no corresponding red-test task, violating TDD order. | TASK-P2-06, FSPEC AT-LOOP-06, TSPEC-LOOP-02 |
| F-03 | Medium | Local | **Phase 1 tasks use source file paths in the Test File column -- TDD strategy is unspecified.** TASK-P1-01 through TASK-P1-03 list the source SKILL.md file path with "(content inspection)" in the Test File column. This is the source file, not a test file. For TDD to be feasible, Phase 1 needs either: (a) a named test file (e.g., `pdlc/skills/__tests__/verdict-trailer.test.js`) with fs.readFileSync-based assertions on the section header, format block, and placement; or (b) an explicit declaration that Phase 1 is verified by static inspection only -- a TDD exception. Without this choice being explicit, a Phase 1 engineer has no failing test to write first, and the TSPEC-NFR-04 Phase 1 prerequisite has no machine-verifiable gate before Phase 2 proceeds. | TASK-P1-01, TASK-P1-02, TASK-P1-03, Phase 1 acceptance criteria, TSPEC-NFR-04 |
| F-04 | Medium | Local | **TASK-P3-07 references evaluateSingleAgentGate but no task names it as a deliverable.** TASK-P3-06 defines evaluateBatchGate. TASK-P3-07 says "reuse evaluateSingleAgentGate" -- but this name does not appear in TASK-P3-06's description. For TDD: TASK-P3-07 must write a failing test for evaluateSingleAgentGate before TASK-P3-06 exists; but TASK-P3-06 does not know it must export evaluateSingleAgentGate. The PLAN must either (a) name evaluateSingleAgentGate as a deliverable of TASK-P3-06 with its signature and acceptance criteria, or (b) specify that TASK-P3-07 defines this helper inline. As written, TDD order breaks at the P3-06 -> P3-07 boundary: there is no interface to write a failing test against. | TASK-P3-06, TASK-P3-07, TSPEC-IMPL-07 |
| F-05 | Medium | Local | **TASK-P5-01 (SKILL.md rewrite) has no test file and its TDD strategy is unspecified.** Same class of issue as F-03. The Test File column shows the source SKILL.md path with "(content inspection)". Phase 5 acceptance criteria include line-count assertions (under 100 lines), section-presence checks (7 named sections in order), and specific content requirements (two-workflow split rationale, exact file paths). These are richer than Phase 1 and suitable for automated content assertions. Without a test file path, an engineer implementing TASK-P5-01 under TDD has no failing test to write first. Given the parallel-with-Phase-4 timing, the engineer cannot rely on a reviewer to catch missing sections if no test encodes the expected structure. | TASK-P5-01, Phase 5 acceptance criteria |
| F-06 | Medium | Local | **Phase H skip path (PHASE_H_ENABLED = false) has no named acceptance test assigned.** TASK-P4-01 lists AT-HARVEST-01 and AT-HARVEST-02. AT-HARVEST-01 tests LEARNINGS-before-delete ordering (requires the harvest agent to run -- only valid when PHASE_H_ENABLED = true). The Phase 4 acceptance criteria prose correctly describes the skip-path behavior ("PHASE_H_ENABLED = false produces correct skip log, phase label, and final report entry; harvest agent is not invoked") but this is not anchored to a named AT ID. Since AT-HARVEST-01 depends on PHASE_H_ENABLED = true, the skip-path branch lacks a red test. TASK-P4-01 needs either a task-level acceptance criterion anchored to an explicit AT reference, or the FSPEC should add AT-HARVEST-03 for this skip-path behavior. Without this, the skip-path branch has no named failing test. | TASK-P4-01, FSPEC section 5.1, TSPEC-HARVEST-01 |
| F-07 | Low | Local | **Dependency graph parallelism note is incomplete.** The diagram shows TASK-P2-04, TASK-P2-05, and TASK-P2-06 all branching from TASK-P2-03 simultaneously. The prose parallelism note says "Phase 2 tasks P2-04 and P2-05 can be parallelized with P2-06/P2-07." This implies two parallel groups when the diagram shows three independent branches. The note should read: "TASK-P2-04, TASK-P2-05, and TASK-P2-06 (with its dependent TASK-P2-07) are all independent of each other once TASK-P2-03 completes." The discrepancy could cause a tech-lead agent to serialize tasks that could parallelize. | Task Dependency Graph, parallelism note |
| F-08 | Low | Local | **TASK-P3-05 (worktree merge-back) assigns tests to implPhase.test.js but no test strategy for git operations is specified.** TSPEC-IMPL-05 requires calling git merge --no-ff, inspecting exit codes, running git diff --name-only --diff-filter=U on conflict, and calling git merge --abort. The PLAN acceptance criteria state the conflict path must call these commands in a specific order -- verifiable only at the shell-execution level. For TDD, the engineer needs to know whether to use a real git fixture repo, a mock shell executor, or code-inspection-only verification. Without guidance, the negative path (conflict halt) is likely to be under-tested or tested via brittle mocks. | TASK-P3-05, Phase 3 acceptance criteria |
| F-09 | Low | Local | **Definition of Done does not specify whether Phase 1 and Phase 5 static verifications are automated or manual.** The DoD says "Content inspection confirms exact text per TSPEC-SKILL-01" for Phase 1 and "Rewritten SKILL.md is under 100 lines" for Phase 5 -- both state facts but do not indicate whether these are machine-verified. Given that TSPEC-NFR-04 makes Phase 1 a gate for Phase 2 end-to-end testability, a machine-verifiable assertion would make this gate enforceable in CI. The PLAN should state explicitly whether content tests exist. | Definition of Done, Phase 1 acceptance criteria, Phase 5 acceptance criteria |

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | TASK-P2-03 mandates the canonical guard-agent double but does not specify the mechanism. What is the intended output -- a shared fixture file (e.g., __tests__/helpers/guardAgentDouble.js), a factory function, or a Jest manual mock? The choice affects how TASK-P2-06 and all Phase 3 tasks import and consume it. |
| Q-02 | For TASK-P3-05 (git merge-back), should implPhase.test.js use a real git fixture repo or a mock shell executor? The answer determines whether the conflict-detection branch is unit-testable or integration-testable, which shapes the test pyramid for Phase 3. |
| Q-03 | CROSS-REVIEW-test-engineer-DECISIONS-v2.md Q-01 asked whether there is a defined canonical format for the injected DECISIONS_WARRANTED instruction string. TASK-P4-02 does not define a canonical injection-string constant analogous to the guard agent return protocol. Should the injection prompt string be a named constant in TASK-P4-02, so parseDecisionsWarranted.test.js can assert against a stable input? |

---

## Positive Observations

- **Guard-agent canonical double intent is correctly placed.** The phrase "the canonical guard agent test double must be defined here and reused at all call sites" in TASK-P2-03 is a direct acknowledgement of DEC-ODW-03's mandate at the correct task. F-01 is a delivery-mechanism gap -- the intent is right, only the named artifact and acceptance criterion are missing.
- **Test file separation by concern is well-designed.** parseVerdict.test.js, parseDecisionsWarranted.test.js, reviewLoop.test.js, implPhase.test.js, harvestPhase.test.js, and pipelineWiring.test.js cleanly partition coverage by function. No test file is overloaded. This will scale well to parallel se-implement agents.
- **FSPEC AT-IDs are cited in task acceptance criteria.** Tasks TASK-P2-04 through TASK-P2-07, TASK-P3-06, and TASK-P4-01 each list specific AT-* IDs, making TDD intent unambiguous: the engineer knows exactly which named tests must go red before implementation begins.
- **Phase dependency ordering correctly enforces DEC-ODW-03 structurally.** TASK-P2-03 (guard agent) precedes TASK-P2-06 (reviewLoop) in the dependency graph, preventing a reviewLoop implementation from proceeding without the guard agent in place.
- **Phase 3 acceptance criteria correctly identify a code-inspection assertion** for batch plan logging ("verifiable by statement order inspection"). This correctly acknowledges that the log() before agent() call-ordering requirement is not fully unit-testable and requires source-order inspection rather than runtime assertion.

---

## Recommendation

**Needs revision**

Two High findings (F-01, F-02) and four Medium findings (F-03 through F-06) require resolution before PROPERTIES authoring and Phase 1 implementation begin.

**Must fix before PROPERTIES authoring (High):**

- **F-01:** Add a named canonical-double output artifact to TASK-P2-03. Specify the file path (e.g., pdlc/workflows/__tests__/helpers/guardAgentDouble.js), the export interface, and add an acceptance criterion: "The canonical double is importable from the named path; TASK-P2-06 and all Phase 3 tasks import from this path only, not from task-local stubs."
- **F-02:** Add AT-LOOP-06 to TASK-P2-06's acceptance criteria list alongside the existing AT references.

**Should fix before Phase 1 implementation (Medium):**

- **F-03:** For Phase 1 tasks, either add a content-assertion test file (strongly preferred -- TSPEC-NFR-04 makes Phase 1 a gate) or explicitly mark Phase 1 as "static inspection only -- TDD exception." Update the Test File column to reflect the decision.
- **F-04:** Name evaluateSingleAgentGate as an explicit deliverable of TASK-P3-06 with its signature and acceptance criteria, or clarify that TASK-P3-07 defines it inline.
- **F-05:** Same resolution as F-03 for TASK-P5-01 -- add a test file path or mark as static inspection.
- **F-06:** Add a task-level acceptance criterion to TASK-P4-01 anchored to the PHASE_H_ENABLED = false skip path, or add AT-HARVEST-03 to the FSPEC and reference it here.

VERDICT: Needs revision
{"high": 2, "medium": 4, "low": 3}
