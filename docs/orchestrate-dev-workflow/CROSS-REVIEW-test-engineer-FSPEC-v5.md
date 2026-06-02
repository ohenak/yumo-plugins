# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/orchestrate-dev-workflow/FSPEC-orchestrate-dev-workflow.md
**Date:** 2026-06-01
**Iteration:** 5

| Field | Value |
|---|---|
| Scope | FSPEC v1.4 iteration review — resolution check for F-V4-01 (Medium); status of carried Low findings F-V4-02 through F-V4-05; final-iteration approval determination |

---

## Resolution Assessment: F-V4-01 (the only blocking finding from v4)

| Prior ID | Severity | Resolution Status | Notes |
|----------|----------|------------------|-------|
| F-V4-01 | Medium | **Resolved** | AT-DECISIONS-05 added. Given: TSPEC post-PASS optimizer returns `DECISIONS_WARRANTED: TRUE` (all uppercase). When: script parses the value. Then: treated as `true` (case-insensitive); `reviewLoop` for Phase D is entered; the absent-field warning is NOT emitted; Phase D appears as `"Phase D: DECISIONS Review"` in `/workflows`. This is the exact AT specified in the v4 recommendation. "Who" is `Workflow script`; the three Then-clause assertions (correct code branch, no spurious warning, correct `/workflows` label) close the implementation-risk gap identified in F-V4-01. Fully satisfies F-V4-01. |

---

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-V5-01 | Low | Local | **AT-IMPL-01 "Who" field still reads "Developer observing `/workflows`" (carried from F-V4-02, F-V3-05, F-NV-08 — four prior iterations).** The Then clause contains a unit-level call-order assertion ("verifiable by inspecting the script's sequential statement order") that does not require UI observation. "Who" should be "Workflow script (call-order assertion)". This contradiction will cause PROPERTIES authoring to mis-classify the test level. Not blocking approval at the FSPEC stage given loop-limit context. | AT-IMPL-01 |
| F-V5-02 | Low | Local | **AT-HARVEST-01 remains E2E-framed (carried from F-V4-03, F-V3-06, F-NV-07, F-14 — four prior iterations).** "LEARNINGS commit appears before any deletion commit in git log" requires post-execution git repository inspection. The lower-level observable — harvest agent emits a LEARNINGS commit confirmation log before issuing any delete Bash call — is available and was recommended every prior iteration. PROPERTIES authoring must classify this as E2E / integration-level and note the git-inspection dependency. | §5.2, AT-HARVEST-01 |
| F-V5-03 | Low | Local | **Five parser/edge-case branches lack ATs (carried from F-V4-04, F-V3-07 subset — four prior iterations).** Specifically: multiple VERDICT lines in result (§2.2 last-occurrence rule), negative JSON values (§2.3 fallback), extra JSON keys in findings count (§2.3 fallback), empty REQ file (§6.1 step 4), and sub-batch splitting for >5 ready tasks (§4.3 concurrency cap). These behavioral branches are named in the FSPEC but have no corresponding ATs. PROPERTIES authoring will need to create properties for these branches from §-prose alone. Not blocking at FSPEC stage. | §2.2, §2.3, §4.3, §6.1 |
| F-V5-04 | Low | Local | **AT-HARVEST-01 and AT-HARVEST-02 lack a `PHASE_H_ENABLED = true` precondition (carried from F-V4-05, F-V3-08 — three prior iterations).** If the flag ships as `false`, neither AT can be validated in the initial release. PROPERTIES authoring must classify both ATs as conditional on the enable flag. | §5.1, AT-HARVEST-01, AT-HARVEST-02 |

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried: Does the workflow runtime's `resumeFromRunId` parameter name match REQ-PIPELINE-03's assumption? AT-RESUME-01 and AT-RESUME-03 assert specific log messages; the resume-triggering mechanism remains unspecified at the FSPEC level. The TSPEC must resolve this. |
| Q-02 | Carried: Is `"Resuming from iteration N"` on a fresh-run iteration N ≥ 2 intentional? §1.7 and AT-RESUME-03 confirm this is specified behavior. If final, TSPEC should document the rationale to prevent production debugging confusion. |

---

## Positive Observations

- AT-DECISIONS-05 precisely matches the v4 recommendation. "Who" is `Workflow script` (not UI observation), the Given uses the exact `TRUE` (all-caps) string from §3.1, and the three Then-clause assertions close all implementation-risk failure modes identified in F-V4-01. One AT addition closes the four-iteration residual.
- The FSPEC is structurally complete across all six behavioral subsystems (§0–§5) and §6–§7. The traceability table at the end correctly maps every section to its REQ requirements. No orphaned sections exist.
- The parser specification in §2.2 is precise: split-on-newlines, iterate-in-reverse, prefix check on trimmed line, exact-string equality for verdict values. This is implementable without ambiguity.
- The DECISIONS conditional in §3 handles the three-valued outcome space cleanly: explicit `false` → skip, explicit `true` → full path, absent/malformed → default-to-true with warning. AT-DECISIONS-01 through AT-DECISIONS-05 now cover all five distinct parsing scenarios.
- The implementation-phase specification in §4 provides a deterministic sub-batch splitting rule (§4.3: PLAN document order for sub-batch ordering within a topological level), a concrete failure-marker contract (§4.6: `Tests: N failed` and `non-zero exit`), and an explicit crash/empty-result short-circuit rule. These are all testable at the unit level.

---

## Recommendation

**Approved**

F-V4-01 (the sole Medium finding from v4) is fully resolved by AT-DECISIONS-05 in v1.4. No new High or Medium findings are present.

The four carried Low findings (F-V5-01 through F-V5-04) are noted deficiencies that persist across multiple iterations. They do not block FSPEC approval. PROPERTIES authoring should address them as follows:

- **F-V5-01:** Update AT-IMPL-01 "Who" to "Workflow script (call-order assertion)" when authoring the corresponding PROPERTY.
- **F-V5-02:** Classify the AT-HARVEST-01 corresponding PROPERTY as integration/E2E level and note the git-log inspection dependency.
- **F-V5-03:** Author properties for the five parser/edge-case branches from §-prose directly (§2.2 last-occurrence rule, §2.3 negative values, §2.3 extra keys, §6.1 empty-REQ, §4.3 sub-batch splitting). Priority order: §2.3 negative values, §2.3 extra keys, §4.3 sub-batch splitting.
- **F-V5-04:** Mark PROPERTY entries derived from AT-HARVEST-01 and AT-HARVEST-02 as conditional on `PHASE_H_ENABLED = true`.

The FSPEC is ready for TSPEC and PROPERTIES authoring.
