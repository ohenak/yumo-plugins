---
Scope: docs/orchestrate-dev-workflow/TSPEC-orchestrate-dev-workflow.md
---

# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/orchestrate-dev-workflow/TSPEC-orchestrate-dev-workflow.md
**Date:** 2026-06-01
**Iteration:** 3

---

## Prior Findings Resolution

| Prior ID | Severity | Status in v1.2 |
|----------|----------|----------------|
| N-01 | High | **Resolved.** TSPEC-LOOP-03 pseudocode now places the cap check at loop-top (`iteration > 5`), moves the counter increment (`iteration ← iteration + 1`) to after the optimizer, and adds a counter-value-to-action comment table explicitly stating "5 reviewer-pair dispatches and 5 optimizer invocations occur before POSTMORTEM." TSPEC-LOOP-07 corroborates: "The optimizer IS invoked at iteration 5 (same as iterations 1–4); the POSTMORTEM fires only after that iteration-5 optimizer completes and the counter increments to 6." The behavioral model now matches FSPEC §1.8 precisely. |
| N-02 | Medium | **Resolved.** §11 REQ-GATE-03 row now lists `AT-IMPL-04, AT-IMPL-05` in the FSPEC AT column. Both tests trace directly to TSPEC-IMPL-06 content. |
| N-03 | Low | **Partially resolved — see V3-01 below.** The pseudocode in TSPEC-LOOP-03 step (b) correctly handles the resumed-N=1 case via `if iteration === 1 and not resumed`. However, TSPEC-LOOP-06 still states "if iteration > 1 when the script first runs a `log()` in the loop, the 'Resuming' form is emitted" — this prose contradicts the pseudocode and would produce `"Starting iteration 1"` for a resumed-at-iteration-1 run. Additionally, TSPEC-LOOP-05 still has only two table rows and does not explicitly enumerate the resumed-N=1 case. The contradiction does not create a test-design deadlock because the pseudocode is unambiguous and authoritative. |
| N-04 | Low | **Not resolved — see V3-02 below.** The `8 × 5 × 3` formula body and its explanatory comment remain self-contradictory. No cap-compliance test is affected. |

---

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| V3-01 | Low | Local | **TSPEC-LOOP-06 prose contradicts TSPEC-LOOP-03 pseudocode on the resumed-N=1 log message.** TSPEC-LOOP-06 states "if iteration > 1 when the script first runs a `log()` in the loop, the 'Resuming' form is emitted." For a run resumed at iteration 1 (interrupted before any reviewer completed in iteration 1), `iteration === 1` and this condition is `false` — the prose implies `"Starting iteration 1"` is emitted, contradicting FSPEC §1.7 step 4 and TSPEC-LOOP-03 step (b) which gates on `iteration === 1 and not resumed`. The pseudocode in step (b) is correct; TSPEC-LOOP-06 needs updating to replace the `iteration > 1` gate with: "if the current run is a fresh run and iteration is 1, the 'Starting' form is emitted; in all other cases (iteration ≥ 2 or a resumed run at any N), the 'Resuming' form is emitted." A third row should also be added to the TSPEC-LOOP-05 table: "Resumed run at iteration 1 → `'Resuming from iteration 1'`". This is Low and does not block PROPERTIES authoring — the pseudocode is unambiguous; the prose discrepancy is a documentation inconsistency only. | TSPEC-LOOP-05, TSPEC-LOOP-06 |
| V3-02 | Low | Local | **TSPEC-NFR-02 formula body and comment remain self-contradictory.** The formula uses `8 × 5 × 3` (= 120) where the comment identifies the 8 phases as "R, F, T, D, P, PR, CR, and the post-PASS TSPEC call." The post-PASS call is a single agent invocation, not a 5-iteration 3-agent loop; including it in the `N × 5 × 3` term overstates its contribution by a factor of 14. The trailing note ("with 8 post-PASS se-author calls at 1 each the total is ~156") further contradicts the formula body rather than clarifying it — the body already accounts for the post-PASS call inside the 8-phase term, so the note double-counts it. The correct breakdown is: 1 (guard) + 7 review-loop phases × 5 × 3 (105) + post-PASS se-author calls (currently 1, for the TSPEC phase only) + 5 × 5 implementation (25) + 1 PT + 1 harvest + 7 POSTMORTEM agents = ~140 worst case. Fix by separating the post-PASS call(s) into a dedicated `+ N (post-PASS se-author calls)` line item and correcting the comment. This is Low because cap compliance is unaffected — both the stated 156 and the correct ~140 are well under 1,000, and no PROPERTIES test depends on this arithmetic. | TSPEC-NFR-02 |

---

## Questions

None. All prior open questions from v1 (Q-01 through Q-05) and v2 (Q-01, Q-02) are resolved or superseded by the v1.2 revisions.

---

## Positive Observations

- The N-01 resolution is complete and exemplary. The TSPEC-LOOP-03 pseudocode now uses a single unambiguous loop structure: cap check at top (`iteration > 5`), reviewer dispatch, PASS-branch exit, optimizer invocation, counter increment, and a counter-value-to-action comment table. Together with TSPEC-LOOP-07's explicit statement that the optimizer is invoked at iteration 5 identical to iterations 1–4, the AT-LOOP-03 boundary can now be derived without consulting the FSPEC.
- The N-02 resolution is clean: AT-IMPL-04 and AT-IMPL-05 now appear in the §11 REQ-GATE-03 row alongside AT-IMPL-01 and AT-IMPL-03. Coverage gaps are now detectable by inspection.
- TSPEC-LOOP-03 step (b) pseudocode (`if iteration === 1 and not resumed`) correctly encodes the fresh/resumed distinction, including the resumed-N=1 edge case. The pseudocode is authoritative; V3-01 is a prose-only discrepancy in TSPEC-LOOP-06 that does not affect implementation correctness.
- The TSPEC as a whole is now at a specification maturity level sufficient for PROPERTIES authoring. All High and Medium findings across three iterations are resolved. The two remaining Low findings (V3-01, V3-02) are documentation inconsistencies that do not create test-design deadlocks.

---

## Recommendation

**Approved with minor changes**

Both remaining findings are Low and do not block PROPERTIES authoring. They may be addressed in the same editorial pass as PLAN authoring or deferred to a post-PLAN cleanup:

- **V3-01:** Correct TSPEC-LOOP-06 prose to remove the `iteration > 1` gate and add a third row to the TSPEC-LOOP-05 table for the resumed-N=1 case. The PROPERTIES author should derive the resumed-N=1 property from TSPEC-LOOP-03 step (b), not from TSPEC-LOOP-06 prose.
- **V3-02:** Separate the post-PASS call(s) into a dedicated `+ N` line item in the TSPEC-NFR-02 formula. No PROPERTIES test is affected by this correction.

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}
