---
Reviewer: product-manager
Document reviewed: docs/orchestrate-dev-workflow/TSPEC-orchestrate-dev-workflow.md
Date: 2026-06-01
Iteration: 1
Scope: Requirements traceability (REQ v1.1 coverage), scope compliance, acceptance criteria fidelity, and correct reflection of the auto-approved batching decision and two-workflow split alternative.
---

# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/orchestrate-dev-workflow/TSPEC-orchestrate-dev-workflow.md`
**Date:** 2026-06-01
**Iteration:** 1

---

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **REQ-COMPAT-01 SKILL.md modification is unspecified.** REQ-COMPAT-01 (P0) requires the three review skills (`se-review`, `te-review`, `pm-review`) to have the VERDICT trailer permanently baked into their SKILL.md files. TSPEC-NFR-04 acknowledges this ("the three SKILL.md changes are Phase 1 deliverables alongside the workflow script") but provides no TSPEC item specifying what text to add, where in each SKILL.md it appears, or how to verify the normative format from REQ-COMPAT-01 is reproduced correctly. This is a P0 acceptance criterion with no corresponding TSPEC specification — it is named but not designed. An engineer implementing from this TSPEC would have to re-derive the modification from FSPEC §2.1 and REQ-COMPAT-01 directly, with no guidance on placement or verification. The TSPEC should add a dedicated `TSPEC-SKILL.md-01` item (or equivalent) that specifies the exact text block to insert in each review skill's SKILL.md and the verification criterion. | REQ-COMPAT-01 |
| F-02 | Medium | Local | **REQ-SKILL-01 Phase 2 acceptance criteria are not translated into any TSPEC item.** REQ-SKILL-01 (P1) has four acceptance criteria: (1) concise pointer document, not a runbook; (2) invocation contract documented; (3) states the auto-approved batching decision and the two-workflow split as the known alternative; (4) references the workflow script path. The TSPEC traceability table maps REQ-SKILL-01 to "(addressed in SKILL.md rewrite — Phase 2 deliverable)" with no specification of what Phase 2 must deliver. Without a TSPEC item translating these acceptance criteria, the auto-approved batching decision rationale and the two-workflow split documentation — both explicitly required by the REQ and called out in the review scope — have no engineering spec to build from and no property to test against. The TSPEC should add a `TSPEC-SKILL-01` item that enumerates the required content sections for the rewritten SKILL.md. | REQ-SKILL-01 |
| F-03 | Low | Local | **REQ-NFR-01 worst-case formula discrepancy: REQ says ~142, TSPEC arrives at 156.** The REQ-NFR-01 acceptance criterion anchors to "~142 agents (analytically verified)". The TSPEC (TSPEC-NFR-02) corrects the formula via FSPEC OQ-04 and arrives at 156 agents (adding 8 post-PASS `se-author` calls and adjusting for the correct phase count). Both figures are well under the 1,000-agent cap, so there is no product risk. However, the acceptance criterion as written in REQ-NFR-01 is now technically violated by the TSPEC's own math. The REQ should be updated to reference the corrected ~156-agent worst-case formula. Until it is, the TSPEC is non-compliant with the letter of REQ-NFR-01 AC item (3). | REQ-NFR-01 |
| F-04 | Low | Local | **REQ-OBS-01 per-agent label format not addressed.** REQ-OBS-01 (P1) states "per-agent labeling (e.g., `review:se-review:REQ`, `optimize:pm-author:REQ`, `create:se-author:TSPEC`) is the preferred observability level" conditional on runtime support. The TSPEC specifies phase labels and `log()` messages for iteration numbers but does not describe the per-agent label format or mechanism (even as best-effort). If the runtime does support per-agent metadata at implementation time, there is no spec for what label format to use, and an implementer would have to invent it. A brief note on the preferred label convention (matching the examples in REQ-OBS-01) should be added to TSPEC-SCRIPT-05 or a dedicated TSPEC-OBS item. | REQ-OBS-01 |
| F-05 | Low | Local | **File-existence check via `agent()` call introduces uncosted overhead with no product justification.** TSPEC-ENTRY-03 specifies that the REQ file-existence check is implemented as an `agent()` call ("a single `agent()` call with a minimal instruction to check whether the path exists and return 'EXISTS' or 'NOT FOUND'"). The REQ and FSPEC do not prescribe the implementation mechanism, but using a full agent invocation for a basic filesystem check has non-trivial cost implications (latency and agent budget) for an operation that fires on every pipeline invocation. If a lighter-weight runtime primitive is available (e.g., `readFile()` as mentioned as an alternative in the same TSPEC item), the TSPEC should prefer it. The current text presents `agent()` as the primary mechanism and `readFile()` as a secondary alternative — this ordering should be reversed so that the lighter primitive is the primary and the agent fallback is only used when no runtime primitive is available. | REQ-PIPELINE-01 |

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | TSPEC-IMPL-02 adds a cycle-detection error path (`"Error: PLAN dependency graph contains a cycle"`) that does not appear in any REQ acceptance criterion or FSPEC error section (FSPEC §4.2 simply asserts the PLAN is a DAG without enumerating what happens if it is not). Is this intentional defensive engineering, or was it expected to be covered by REQ-GATE-02 or FSPEC §4.2? If intentional, it should be noted as an implementation-level addition not required by a REQ/FSPEC item so test authors know to cover it. |
| Q-02 | TSPEC-NFR-02 notes the 8 post-PASS `se-author` calls as part of the corrected formula. However, the §11 traceability table does not list TSPEC-DECISIONS-01 under REQ-NFR-01. Should TSPEC-DECISIONS-01 be added to the REQ-NFR-01 traceability row to make the agent-count accounting explicit? |
| Q-03 | REQ-PIPELINE-03 acceptance criterion states a pipeline run SHALL be resumable "within the same session by re-invoking Workflow with `resumeFromRunId`". TSPEC-LOOP-06 correctly defers to runtime caching, but does not address how the run ID is surfaced to the user so they can invoke the resume. Is surfacing the run ID (e.g., via a `log()` at pipeline start) within TSPEC scope, or is it entirely a runtime-UI concern? |

---

## Positive Observations

- The VERDICT parsing algorithm (TSPEC-PARSE-01) is exceptionally precise: reverse-scan strategy, exact-string checks, fallback conditions table, and the truncated-output special case are all fully specified. An implementer can write unit tests directly from this spec without ambiguity.
- The evaluator-optimizer loop algorithm (TSPEC-LOOP-03) is a faithful and precise translation of REQ-GATE-02 and FSPEC §1. The cap check, PASS branch, and POSTMORTEM trigger are all in the correct position relative to the iteration counter.
- TSPEC-IMPL-02 (topological batching) includes the sub-batch splitting logic (max 5 tasks, document order for determinism) and the inconsistency-detection log — both of which are called out in FSPEC §4.3 and fully met.
- The final report type definition (TSPEC-ERROR-03) covers all four acceptance criteria in REQ-OBS-02: phase outcomes, artifact paths, test summary, and harvest status.
- TSPEC-NFR-04 correctly closes FSPEC OQ-02 by establishing the VERDICT trailer as a permanent SKILL.md addition rather than a runtime injection — preserving Ptah engine compatibility as required by the REQ.
- The DECISIONS conditional (§9) correctly separates the post-PASS `se-author` call from in-loop optimizer calls and specifies injection scope precisely (TSPEC-DECISIONS-03), faithfully matching FSPEC §3.1.
- The error handling table (TSPEC-ERROR-01) maps every FSPEC §7 scenario to a concrete log message and halt condition — making it directly testable and removing implementation ambiguity.
- The auto-approved batching implementation (TSPEC-IMPL-03/04) correctly executes without a user-approval gate, satisfying REQ-GATE-03. The batch plan is logged before any `agent()` dispatch with explicit call-order sequencing.

---

## Recommendation

**Needs revision**

F-01 and F-02 are Medium findings that must be addressed before the TSPEC is approved:

1. **F-01 (REQ-COMPAT-01):** Add a dedicated TSPEC item (e.g., `TSPEC-SKILL.md-01`) specifying the exact VERDICT trailer text block to be inserted into each of the three review skill SKILL.md files, its placement within each file, and the verification criterion (the inserted text must match the normative format in REQ-COMPAT-01 verbatim). This is a Phase 1 P0 deliverable and must be designed in the TSPEC.

2. **F-02 (REQ-SKILL-01):** Add a `TSPEC-SKILL-01` item enumerating the required content sections for the rewritten `orchestrate-dev` SKILL.md, specifically naming the auto-approved batching rationale and the two-workflow split alternative as required content. This is the only place in the engineering artifact chain where these decisions are anchored as deliverables.

F-03 (REQ-NFR-01 formula drift) requires a companion REQ update (pm-author) to close the acceptance-criterion discrepancy; the TSPEC fix alone is insufficient. F-04 and F-05 may be addressed in the same revision at the SE author's discretion.
