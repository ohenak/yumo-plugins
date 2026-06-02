---
Reviewer: product-manager
Document reviewed: docs/orchestrate-dev-workflow/PROPERTIES-orchestrate-dev-workflow.md
Date: 2026-06-01
Iteration: 1
Scope: Property coverage against P0 and P1 REQ acceptance criteria; missing coverage; out-of-scope properties
---

# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/orchestrate-dev-workflow/PROPERTIES-orchestrate-dev-workflow.md`
**Date:** 2026-06-01
**Iteration:** 1

---

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|-----------------|
| F-01 | High | Local | **REQ-PIPELINE-01 affirmative path not covered.** The Coverage Matrix lists only PROP-ENTRY-03/04/05/06 for REQ-PIPELINE-01. All four are error-path properties (missing argument, file not found, file empty, naming mismatch). No property verifies the affirmative acceptance criterion: "The workflow launches in the background, all phases execute unattended, and only the final pipeline report lands in context." The P0 requirement's happy path has zero property coverage. | REQ-PIPELINE-01 |
| F-02 | High | Local | **REQ-PIPELINE-02 phase-sequence coverage is absent.** Coverage Matrix attributes PROP-IMPL-01, PROP-IMPL-07, PROP-IMPL-09 to REQ-PIPELINE-02. These three properties cover implementation-phase ordering details only. REQ-PIPELINE-02 requires that all ten phases (REQ-review → FSPEC → TSPEC → DECISIONS → PLAN → PROPERTIES → Implementation → PROPERTIES tests → Final codebase review → Harvest) execute in the defined sequence with no phase absent from the `/workflows` view. No property verifies the end-to-end phase sequence or the presence of every named phase. This is a full gap against a P0 acceptance criterion. | REQ-PIPELINE-02 |
| F-03 | High | Local | **REQ-COMPAT-02 hook-firing coverage is a file-existence check only.** PROP-COMPAT-01/02/03 verify that the three hook scripts exist and are unmodified. REQ-COMPAT-02's acceptance criterion requires that hooks *fire* identically in the workflow context — specifically that `check-scope-field` fires after Write/Edit and that `guard-harvest-before-delete` blocks deletion when LEARNINGS is absent. Verifying file content does not constitute evidence that hooks fire during workflow agent execution. The P0 requirement is not covered. | REQ-COMPAT-02 |
| F-04 | Medium | Local | **REQ-ARTIFACTS-01 naming coverage is narrow.** The Coverage Matrix records only PROP-ENTRY-01 (the REQ path naming halt) for REQ-ARTIFACTS-01. That requirement mandates that ALL artifacts produced by the workflow — CROSS-REVIEW files, POSTMORTEM files, LEARNINGS files, and others — use the conventions defined in CLAUDE.md. No property asserts naming compliance for POSTMORTEM, LEARNINGS, or CROSS-REVIEW artifacts produced during a pipeline run. A POSTMORTEM written at an arbitrary path would not be caught. | REQ-ARTIFACTS-01 |
| F-05 | Medium | Local | **REQ-OBS-01 phase-label coverage is limited to loop iteration logs and the batch plan.** The mapped properties (PROP-LOOP-14/15/16, PROP-IMPL-01) cover `log()` iteration entries and the batch plan `log()`. REQ-OBS-01 requires `phase()` calls labeling *each PDLC phase* in the `/workflows` view. No property verifies that `phase()` calls exist for REQ-review, FSPEC, TSPEC, DECISIONS, PLAN, PROPERTIES, Final codebase review, and Harvest phases. This leaves the observability AC for a P1 requirement substantially uncovered. | REQ-OBS-01 |
| F-06 | Medium | Local | **REQ-OBS-02 final report coverage is deferred without a property.** Section 10 explains REQ-OBS-02 is covered by the `FinalReport` type shape in `pipelineWiring.test.js`, but no PROPERTIES entry exists for it. REQ-OBS-02's acceptance criteria are explicit: every phase with status, artifact paths, test pass/fail summary, and harvest status in the final report. Deferring entirely to an implementation-level wiring test with no corresponding property means the P1 acceptance criterion has no PROPERTIES traceability. | REQ-OBS-02 |
| F-07 | Medium | Local | **REQ-NFR-01 concurrency ceiling (16 concurrent agents) has no runtime property.** The Coverage Matrix maps only PROP-IMPL-07 (5-agent fan-out cap per batch) to REQ-NFR-01. Section 10 acknowledges the 16-concurrent-agent ceiling is verified by a code comment / analytical formula, not by a runtime test or property. REQ-NFR-01 lists this ceiling as a distinct acceptance criterion. A property — even a structural/contract-level one — should confirm the ceiling is enforced or analytically established by an inspectable code assertion. | REQ-NFR-01 |
| F-08 | Low | Local | **REQ-NFR-02 context-isolation coverage is partial.** PROP-LOOP-10 checks that agent result objects are not passed to `log()`. REQ-NFR-02 also requires that agent results are held in script-local variables and that *only* the final pipeline report enters the main conversation context. No property addresses the "only final report returned by the workflow's top-level `return` statement" guarantee. | REQ-NFR-02 |
| F-09 | Low | Local | **Coverage Matrix entry for REQ-GATE-02 references PROP-PARSE-13 through PROP-PARSE-19 but those properties cover the DECISIONS_WARRANTED parse function, not the evaluator-optimizer loop cap.** REQ-GATE-02's acceptance criteria include: (2) optimizer runs only when at least one reviewer fails; (3) loop terminates at 5 iterations; (4) all phases use the same `reviewLoop` construct; (5) DECISIONS-skip log/label present. PROP-LOOP-03 and PROP-LOOP-12 cover items 3 and the POSTMORTEM trigger. Items 2 and 4 (single shared construct, optimizer invocation condition) have no explicit property. The PARSE-13..19 entries are mislabeled in the matrix for this requirement. | REQ-GATE-02 |

---

## Questions

| ID | Question |
|----|----------|
| Q-01 | Section 10, Note 1 states REQ-OBS-02 is "adequately covered as a contract property of TSPEC-ERROR-03 tested in TASK-P4-04." Is `pipelineWiring.test.js` within scope as a PROPERTIES-backed test, or is it purely implementation-level? If the latter, a minimal property entry is needed to maintain traceability from the REQ to a testable assertion. |
| Q-02 | PROP-COMPAT-01/02/03 verify hook scripts are "unmodified from the repo baseline." What is the baseline? If hooks do not yet exist (the repo is new), this property is vacuously true. Has a baseline fingerprint or checksum mechanism been specified? |
| Q-03 | REQ-GATE-02's DECISIONS conditional states: "the script determines whether DECISIONS is warranted by inspecting the return value of the TSPEC author agent." No property covers the TSPEC author agent returning the `decisionsWarranted` boolean back to the script (only the downstream parsing of that value is covered by PROP-PARSE-13..19). Is the TSPEC author's return-value format covered by the TSPEC/FSPEC data contract and considered out of scope for PROPERTIES? |

---

## Positive Observations

- The PARSE properties (Section 1) are exceptionally thorough. All seven FSPEC acceptance tests (AT-VERDICT-01 through AT-VERDICT-07) are mapped, and additional contract and error-handling properties (PROP-PARSE-08 through PROP-PARSE-12) go beyond the minimum.
- The LOOP properties (Section 2) provide strong coverage of the evaluator-optimizer loop mechanics, including dual-reviewer crash (PROP-LOOP-08), optimizer failure (PROP-LOOP-07), and POSTMORTEM section requirements (PROP-LOOP-11).
- Resume semantics (PROP-LOOP-13 through PROP-LOOP-16) are clearly specified with exact log-message formats, directly traceable to REQ-PIPELINE-03 acceptance criteria.
- The implementation phase properties (Section 4) address important edge cases: cycle detection (PROP-IMPL-06), inconsistent PLAN batch labels (PROP-IMPL-03), sub-batch splitting (PROP-IMPL-12), and merge-conflict handling (PROP-IMPL-08).
- PROP-COMPAT-07 (ESM-only import syntax) is a clean, verifiable contract property that prevents a structural defect.
- The Coverage Matrix and Test File Index (Sections 8 and 9) materially aid traceability review.

---

## Recommendation

**Needs revision**

The following must be addressed before approval:

1. **F-01 (High):** Add at least one property covering the REQ-PIPELINE-01 affirmative path — that a valid invocation launches the pipeline in the background and delivers only the final report to the main context.
2. **F-02 (High):** Add a phase-sequence property (or group of properties) that verifies all ten PDLC phases are present and ordered correctly in the workflow output, covering REQ-PIPELINE-02's core acceptance criterion.
3. **F-03 (High):** Replace or supplement PROP-COMPAT-01/02/03 with properties that verify hook-firing behavior — either via an integration test scenario or a verifiable structural assertion — not just file existence.
4. **F-04 (Medium):** Add properties covering artifact naming compliance for POSTMORTEM and LEARNINGS outputs, not only the REQ path entry guard.
5. **F-05 (Medium):** Add properties verifying `phase()` labels are present for every PDLC phase other than the implementation batch and loop iterations, to cover REQ-OBS-01's acceptance criterion.
6. **F-06 (Medium):** Add a PROPERTIES entry (even if contract-level) for the REQ-OBS-02 final report structure, or explicitly document in the Coverage Matrix why `pipelineWiring.test.js` satisfies the traceability obligation without a named property.
7. **F-07 (Medium):** Add a contract or analytical property for the 16-concurrent-agent ceiling (REQ-NFR-01), even if it is a static code-analysis check rather than a runtime test.
