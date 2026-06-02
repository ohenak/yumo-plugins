# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/orchestrate-dev-workflow/FSPEC-orchestrate-dev-workflow.md
**Date:** 2026-06-01
**Iteration:** 4

| Field | Value |
|---|---|
| Scope | FSPEC v1.3 iteration review — resolution check for F-V3-01 through F-V3-04 from v3 cross-review; remaining carried Low findings; approval readiness assessment |

---

## Resolution Assessment: F-V3-01 through F-V3-04

| Prior ID | Severity | Resolution Status | Notes |
|----------|----------|------------------|-------|
| F-V3-01 | High | **Resolved** | AT-VERDICT-07 added. Given: `"VERDICT: Approved\n\n\n"` (VERDICT line followed by blank lines then EOF). Then: verdict `Approved` is accepted, findings count defaults to zero, no fallback warning, gate proceeds. This is the exact "all lines after the VERDICT line are empty" sub-case from §2.2 step 6 and §2.3. The AT explicitly cross-references AT-VERDICT-05 equivalence and cites the §2.2 sub-case. Fully satisfies F-V3-01. |
| F-V3-02 | Medium | **Resolved** | AT-RESUME-03 added. Given: fresh-run, iteration 1 failed, counter incremented to 2, iteration 2 beginning. Then: log message is `"Resuming from iteration 2"` — not `"Starting iteration 2"`. Correctly pins the fresh-run N ≥ 2 case and includes the negative assertion. The AT directly cites §1.7 as normative source. Fully satisfies F-V3-02. |
| F-V3-03 | Medium | **Resolved** | §1.7 now includes an explicit "REQ traceability for `'Starting iteration 1'`" note citing REQ-OBS-01 as the parent requirement (loop-iteration-number visibility). AT-RESUME-02 is classified as an REQ-OBS-01 property for PROPERTIES authoring. No new REQ entry is needed; the note is sufficient to close the traceability gap. |
| F-V3-04 | Medium | **Partially resolved — residual gap** | AT-DECISIONS-04 added for `DECISIONS_WARRANTED: False` (capital F) → skip path. This covers one of the two case-insensitive parsing variants requested in F-V3-04. The second variant — `DECISIONS_WARRANTED: TRUE` (all caps) → full DECISIONS path entered, no absent-field warning — was explicitly requested and is not present. §3.1 specifies `TRUE` as a valid case-insensitive `true` variant; without a matching AT, an implementation using case-sensitive comparison that maps `TRUE` to the missing-field default (treating it as absent, emitting the warning, and entering the full path via the wrong code branch) is not caught. |

---

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-V4-01 | Medium | Local | **F-V3-04 partially resolved: no AT for `DECISIONS_WARRANTED: TRUE` (uppercase) → full path.** §3.1 specifies that `TRUE` is a valid case-insensitive `true` value. AT-DECISIONS-04 covers the `False` → skip path. No AT covers the `TRUE` → full path. An implementation using case-sensitive comparison would map `TRUE` to the missing-field fallback (emitting the absent-field warning and entering the full path via the wrong code branch), and no current AT would detect this failure mode. The v3 recommendation explicitly called for two ATs ("one testing `DECISIONS_WARRANTED: False` → skip path..., one testing `DECISIONS_WARRANTED: TRUE` → full DECISIONS path entered"). Only one was added. | §3.1, AT-DECISIONS-04 |
| F-V4-02 | Low | Local | **AT-IMPL-01 "Who" field still reads "Developer observing `/workflows`" (F-V3-05, F-NV-08; carried four iterations).** The "Then" clause contains a unit-level call-order assertion ("verifiable by inspecting the script's sequential statement order") while "Who" anchors the test to UI observation. PROPERTIES authoring will find these contradictory when classifying the test level. Recommend updating "Who" to "Workflow script (call-order assertion)". | AT-IMPL-01 |
| F-V4-03 | Low | Local | **AT-HARVEST-01 remains E2E-framed (F-V3-06, F-NV-07, F-14; carried four iterations).** "LEARNINGS commit appears before any deletion commit in git log" requires git repository inspection post-execution — integration/E2E level. The lower-level assertion (harvest agent emits a LEARNINGS commit confirmation log before issuing any delete Bash call) has been recommended every iteration and not adopted. | §5.2, AT-HARVEST-01 |
| F-V4-04 | Low | Local | **Carried Low findings from prior iterations remain unaddressed (F-V3-07 subset: F-10, F-11, F-12, F-13, F-16).** Specifically: F-10 (multiple VERDICT lines — last-occurrence parsing rule has no AT), F-11 (negative JSON values in findings count — named §2.3 fallback with no AT), F-12 (extra JSON keys in findings count — named §2.3 fallback with no AT), F-13 (empty REQ file — §6.1 step 4 validation path with no AT), F-16 (sub-batch splitting for >5 ready tasks — §4.3 concurrency cap with no AT). F-11, F-12, and F-16 remain the highest-priority items for PROPERTIES authoring as those behavioral branches will require classification. | §2.2, §2.3, §4.3, §6.1 |
| F-V4-05 | Low | Local | **AT-HARVEST-01 and AT-HARVEST-02 lack a precondition for `PHASE_H_ENABLED = true` (F-V3-08; carried).** If the flag ships as `false`, neither AT can be validated in the initial release. No deferral note exists in the ATs. PROPERTIES authoring will need to classify these as conditional-on-flag. Adding the precondition to both ATs (or a deferral note) is recommended. | §5.1, AT-HARVEST-01, AT-HARVEST-02 |

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried: Does the workflow runtime's `resumeFromRunId` parameter name match REQ-PIPELINE-03's assumption? AT-RESUME-01 and AT-RESUME-03 assert specific log messages; the mechanism triggering resume remains unspecified at the FSPEC level. The TSPEC must resolve this before specifying the resume interface. |
| Q-02 | Carried: Is `"Resuming from iteration N"` on a fresh-run iteration N ≥ 2 intentional? §1.7 and AT-RESUME-03 confirm this is the specified behavior, but "Resuming" implies a prior interruption. If this wording is final, TSPEC should document the rationale to avoid confusion in production debugging. |

---

## Positive Observations

- AT-VERDICT-07 is precisely specified. The Given clause uses the exact `"VERDICT: Approved\n\n\n"` string from §2.2 step 6, the Then clause explicitly cross-references AT-VERDICT-05 equivalence, and the parenthetical explains the normative basis. This cleanly closes F-V3-01 after three iterations.
- AT-RESUME-03 is complete and well-formed. The Given pins all required preconditions (fresh run, iteration 1 failed, counter at 2), the Then asserts the exact log message string and includes the correct negative assertion ("not `'Starting iteration 2'`"), and §1.7 is cited as the normative source.
- The §1.7 REQ-OBS-01 traceability note is a sound resolution to F-V3-03. Rather than creating a new requirement, it correctly maps the `"Starting iteration 1"` observable onto an existing parent requirement (loop-iteration-number visibility). The PROPERTIES classification path is now clear.
- AT-DECISIONS-04 addresses the most practically dangerous case-insensitive parsing failure (a capital-F `False` that would silently enter the full DECISIONS path via the missing-field default), even though the `TRUE` variant was not added. The higher-risk scenario is correctly prioritized.
- The FSPEC is structurally complete and internally consistent across all six behavioral subsystems. The residual gap (F-V4-01) is narrow and directly actionable in a single AT addition.

---

## Recommendation

**Approved with minor changes**

One Medium finding requires resolution before PROPERTIES authoring:

1. **F-V4-01 (Medium):** Add one AT for `DECISIONS_WARRANTED: TRUE` (uppercase) → full DECISIONS path entered. Suggested: Given: TSPEC optimizer returns `DECISIONS_WARRANTED: TRUE` (all caps); When: script parses the value; Then: value is treated as `true` (case-insensitive); `reviewLoop` for Phase D is entered; the absent-field warning (`"WARNING: DECISIONS_WARRANTED field absent or malformed — defaulting to true"`) is NOT emitted; Phase D appears as `"Phase D: DECISIONS Review"` in `/workflows`. This is a parser unit test — no integration setup required.

The four Low findings (F-V4-02 through F-V4-05) are carried deficiencies known from prior iterations. They do not block approval and should be addressed in the same pass as F-V4-01 where practical. F-V4-04 items F-11, F-12, and F-16 are specifically recommended before PROPERTIES authoring as those branches require classification.

The FSPEC is otherwise complete, precise, and ready for TSPEC authoring once F-V4-01 is resolved.
