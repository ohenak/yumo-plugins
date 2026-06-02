---
Scope: docs/orchestrate-dev-workflow/TSPEC-orchestrate-dev-workflow.md
---

# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/orchestrate-dev-workflow/TSPEC-orchestrate-dev-workflow.md
**Date:** 2026-06-01
**Iteration:** 2

---

## Prior Findings Resolution (F-01 through F-08)

| Prior ID | Severity | Resolution |
|----------|----------|------------|
| F-01 | High | **Resolved.** TSPEC-PARSE-01 now includes an explicit code-path anchors table (paths a–d) with one representative input per path, directly mapping to each branch through `parseVerdict`. All three distinct branches (truncated, valid JSON, non-JSON/intervening text, no VERDICT) are specified. |
| F-02 | High | **Resolved.** TSPEC-IMPL-05 now specifies the exact command (`git diff --name-only --diff-filter=U`) and the precise ordering: (1) run merge; (2) if non-zero: extract file list via diff; (3) run `git merge --abort`; (4) halt. The `{fileList}` population mechanism is now testable. |
| F-03 | High | **Resolved.** TSPEC-ENTRY-03 unambiguously declares the `agent()` call as the authoritative existence-check mechanism and explicitly states "there is no `fs.existsSync()` alternative." TSPEC-ERROR-01 §7.2 row updated to reference `"guard agent returns ok: false"` not `fs.existsSync`. Contradiction eliminated. |
| F-04 | Medium | **Partially resolved — new High finding raised.** See N-01 below. |
| F-05 | Medium | **Resolved.** TSPEC-IMPL-02 now explicitly defines "document order" as index order of the `tasks[]` array returned by the DAG-parsing agent, which preserves PLAN task-table order. Sub-batch ordering is now deterministic and testable. |
| F-06 | Medium | **Resolved.** TSPEC-HARVEST-03 now specifies the exact guard hook stderr message as a testable string anchor. TSPEC-HARVEST-04 specifies the canonical detection substring (`"pdlc guard: refusing to delete CROSS-REVIEW files"`). AT-HARVEST-02 can now be written with a precise assertion. |
| F-07 | Medium | **Resolved.** TSPEC-DECISIONS-02 explicitly documents the post-PASS agent failure path (empty result → default `true` → proceed to Phase D). TSPEC-ERROR-01 includes a dedicated row for `"§3.1 Post-PASS se-author failure"` with warning message format and no-halt behavior. |
| F-08 | Medium | **Resolved.** §11 traceability table now has a "FSPEC AT(s) implemented" column, enabling PROPERTIES derivation by inspection rather than cross-document audit. |

---

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| N-01 | High | Local | **TSPEC-LOOP-03 and TSPEC-LOOP-07 contradict FSPEC §1.8 on when the iteration cap fires.** TSPEC-LOOP-03 pseudocode shows the cap check as `if iteration === 5: invoke POSTMORTEM` placed *inside* the FAIL branch, before the optimizer is invoked. This means only 4 optimizer calls occur (iterations 1–4), with POSTMORTEM triggered when iteration 5's reviewers fail — the 5th iteration produces only reviewer calls, never an optimizer call. FSPEC §1.8 says: "After iteration 5's optimizer invocation, the iteration counter increments to 6. The cap check occurs at the start of each iteration: if the counter **exceeds 5**…" — meaning 5 full review-then-optimize cycles occur (iterations 1–5 each with an optimizer call), counter reaches 6, and then the cap fires. TSPEC-LOOP-07 repeats the TSPEC formulation: "iteration === 5 AND both reviewers have returned their verdict for iteration 5 AND at least one is Needs revision." These two models produce different behavior: TSPEC gives 5 review cycles + 4 optimizer calls; FSPEC gives 5 review cycles + 5 optimizer calls. The counter-value-to-action comment at the bottom of TSPEC-LOOP-03 states "iteration 1–4, FAIL: invoke optimizer" — confirming only 4 optimizer calls. This is a direct behavioral contradiction with FSPEC §1.8. One of the two must be authoritative; the TSPEC must be corrected or FSPEC §1.8 must be explicitly overridden with justification. The test for AT-LOOP-03 boundary cannot be written unambiguously until this is resolved. | TSPEC-LOOP-03, TSPEC-LOOP-07; FSPEC §1.8 |
| N-02 | Medium | Local | **TSPEC §11 traceability table omits FSPEC AT-IMPL-04 and AT-IMPL-05.** AT-IMPL-04 (batch pass — pipeline continues to next batch) and AT-IMPL-05 (empty agent result treated as batch failure) are FSPEC acceptance tests that have no entry in the §11 AT coverage column. AT-IMPL-04 traces to TSPEC-IMPL-06 (pass path: `log("Batch N complete — all tests passing")`) and AT-IMPL-05 traces to TSPEC-IMPL-06 (empty-result check, Rule 1). These behaviors are specified in TSPEC-IMPL-06 but without §11 linkage, the PROPERTIES author must independently discover the coverage gap. Add AT-IMPL-04 and AT-IMPL-05 to the §11 REQ-GATE-03 row. | §11 Requirements Traceability; TSPEC-IMPL-06 |
| N-03 | Low | Local | **F-09 (resumed run at iteration 1) is only partially resolved.** TSPEC-LOOP-05's table second row reads: "Any other iteration (N ≥ 2) or resumed run at iteration N." The `N ≥ 2` qualifier in the first clause creates ambiguity: a reader can parse this as "iteration N where N ≥ 2 OR a resumed run at any N" (which would cover resumed-N=1), or as "iteration N where either (N ≥ 2) or (it is a resumed run)" (which also covers it, but less clearly). The TSPEC-LOOP-06 prose ("if iteration > 1 when the script first runs a log() in the loop, the 'Resuming' form is emitted") conflicts with the resumed-N=1 case, where iteration equals 1 but the run IS a resume — this prose would cause "Starting iteration 1" to be emitted instead of "Resuming from iteration 1," contradicting FSPEC §1.7 step 4. Add an explicit third row: "Resumed run at iteration 1 → `'Resuming from iteration 1'`" and fix TSPEC-LOOP-06 to not gate on `iteration > 1` alone. | TSPEC-LOOP-05, TSPEC-LOOP-06 |
| N-04 | Low | Local | **F-10 (TSPEC-NFR-02 formula inconsistency) is not resolved.** The formula comment still states "The 8 review phases are R, F, T, D, P, PR, CR, and the post-PASS TSPEC call also counts," treating the post-PASS `se-author` call as one of the 8 "review phases" in the `8 × 5 × 3` term. The post-PASS call is a single agent invocation (not a 5-iteration loop of 3 agents), so including it in the `8 × 5 × 3` term overstates its contribution by a factor of 14. The formula body and its comment are still self-contradictory. The correct summation is: 7 phases × 5 × 3 = 105 (loop agents) + 1 post-PASS call + 5 × 5 implementation + 1 PT + 1 harvest + 7 POSTMORTEM agents = 140 worst case. Correct the formula constant (8 → 7) and move the post-PASS call to a separate "+ 1" term with an explanatory comment. | TSPEC-NFR-02 |

---

## Questions

| ID | Question |
|----|----------|
| Q-01 | N-01 requires a design decision: does FSPEC §1.8 govern (5 optimizer calls, counter reaches 6 before cap) or does TSPEC-LOOP-03 govern (4 optimizer calls, cap fires on iteration-5 FAIL before optimizer)? If TSPEC-LOOP-03 is intentionally diverging from FSPEC §1.8 to reduce wasted optimizer calls at the cap boundary, this override must be stated explicitly in the TSPEC with justification. |
| Q-02 | TSPEC-LOOP-06 prose states: "if iteration > 1 when the script first runs a `log()` in the loop, the 'Resuming' form is emitted." For a resumed run where iteration was 1 at interruption, `iteration === 1` and this condition is false — the "Starting" form would be emitted for a resumed run. Is this intentional (treating resumed-iteration-1 as indistinguishable from fresh-iteration-1), or is it a defect? If intentional, FSPEC §1.7 step 4's statement "any resumed run" emits the "Resuming" form needs reconciliation. |

---

## Positive Observations

- The code-path anchors table added to TSPEC-PARSE-01 (paths a–d) is exemplary: each path maps to a distinct representative input with a precise expected outcome, making it possible to write four separate unit-test cases directly from the table without reading the pseudocode. This pattern should be applied to all parsers in future TSPECs.
- The guard hook canonical error substring specification in TSPEC-HARVEST-03 ("pdlc guard: refusing to delete CROSS-REVIEW files") is a clean testable anchor — PROPERTIES can assert on this substring without reading the hook script source.
- The explicit post-PASS failure path added in TSPEC-DECISIONS-02 (empty result → `decisionsWarranted = true` before `parseDecisionsWarranted` is called) closes the gap between agent failure and field-absence scenarios. These are now two distinct, independently testable code paths.
- The `TSPEC-IMPL-05` merge conflict handling is now fully specified as a four-step command sequence with the exact CLI command. This is a testable sequencing property: a PROPERTIES entry can assert that the file list captured before abort is present in the error message.
- Resolution of F-08 (§11 AT traceability column) substantially reduces PROPERTIES authoring risk — coverage gaps are now detectable by inspection of the table rather than by cross-auditing two full documents.

---

## Recommendation

**Needs revision**

One High finding (N-01) blocks PROPERTIES authoring and must be resolved:

- **N-01 (TSPEC-LOOP-03 / TSPEC-LOOP-07 vs. FSPEC §1.8):** The iteration-cap boundary is specified differently in the TSPEC (cap fires on iteration-5 FAIL before optimizer → 4 optimizer calls) versus the FSPEC (cap fires after 5th optimizer increments counter to 6 → 5 optimizer calls). The TSPEC must either (a) adopt the FSPEC §1.8 model and update TSPEC-LOOP-03 to show the counter incrementing after the optimizer with the cap check at loop-top, or (b) explicitly override FSPEC §1.8 with a stated rationale and update the FSPEC accordingly. AT-LOOP-03 is the primary acceptance test affected; its boundary condition changes depending on which model governs.

Medium finding N-02 and Low findings N-03 and N-04 may be addressed in the same revision pass.

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 2}
