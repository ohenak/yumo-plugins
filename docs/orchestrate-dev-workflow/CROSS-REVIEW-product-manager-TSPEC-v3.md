---
Reviewer: product-manager
Document reviewed: docs/orchestrate-dev-workflow/TSPEC-orchestrate-dev-workflow.md
Date: 2026-06-01
Iteration: 3
Scope: Requirements traceability (REQ v1.1 coverage), scope compliance, acceptance criteria fidelity to REQ v1.1. Verification that v1.2 changes (iteration-cap fix, traceability table update) do not introduce scope or traceability regressions. Resolution check on v2 Low findings F-01 through F-04.
---

# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/orchestrate-dev-workflow/TSPEC-orchestrate-dev-workflow.md`
**Date:** 2026-06-01
**Iteration:** 3

---

## v1.2 Changes Assessed

TSPEC v1.2 makes two targeted changes:

1. **Iteration-cap fix (addresses TE N-01):** TSPEC-LOOP-03 was rewritten. The cap check is now placed at loop-top (`if iteration > 5`), and the counter increments after the optimizer fires — meaning 5 full review-optimize cycles occur before POSTMORTEM. TSPEC-LOOP-07 was updated with matching boundary commentary. This aligns with FSPEC §1.8. The counter-value-to-action table at the bottom of TSPEC-LOOP-03 now reads "iteration 1–5, FAIL: invoke optimizer" (5 optimizer calls).

2. **Traceability table update (addresses TE N-02):** The §11 REQ-GATE-03 row now includes `AT-IMPL-04` and `AT-IMPL-05` in the FSPEC AT column.

Neither change touches scope, acceptance criteria fidelity, or PM-layer traceability. No regressions introduced from a product perspective.

---

## Prior Finding Resolution

### F-01 (TSPEC-SKILL-01 verification criterion silent on disk format) — Not resolved

The v1.2 changes did not address this finding. TSPEC-SKILL-01 verification criterion #3 still reads: "An interactive caller who ignores the last lines of the skill's response is unaffected — the trailer is additive and appended after the prose summary (backwards-compatible per REQ-COMPAT-01)." REQ-COMPAT-01 AC item (3) explicitly requires that "the cross-review file on disk is unchanged from today's format." The verification criterion still addresses only the response channel, not the disk format. **Carried forward.**

### F-02 (REQ-NFR-01 worst-case formula discrepancy) — Not resolved

REQ-NFR-01 acceptance criterion still anchors to "~142 agents worst case." The v1.2 TSPEC-NFR-02 corrected formula is 156 agents (accounting for 8 post-PASS se-author calls and the corrected phase count). Neither the TSPEC nor a companion REQ update resolves this discrepancy. The TSPEC's math remains technically non-compliant with the letter of REQ-NFR-01 AC item (3). **Carried forward as Low.**

### F-03 (REQ-COMPAT-02 traceability partial — check-scope-field and nudge-consolidation) — Not resolved

The v1.2 changes did not add a traceability note for these two hooks. The §11 REQ-COMPAT-02 row still maps only to TSPEC-HARVEST-03 and TSPEC-HARVEST-04. FSPEC §7.6–7.7 specifies both behaviors without requiring script logic; there is no TSPEC anchor that PROPERTIES authoring can reference for the nudge-consolidation "does not fire inside background workflow agents" property. **Carried forward as Low.**

### F-04 (REQ-OBS-01 per-agent label convention unaddressed) — Not resolved

TSPEC-SCRIPT-05 still lists runtime API functions without describing the preferred per-agent label format specified in REQ-OBS-01 (`review:se-review:REQ`, `optimize:pm-author:REQ`, `create:se-author:TSPEC`). No TSPEC-OBS item was added. **Carried forward as Low.**

---

## v1.2 Regression Check

### Iteration-cap change: scope and AC fidelity

REQ-GATE-02 AC item (3) states: "the loop terminates when both reviewers pass or 5 iterations are exhausted." The corrected TSPEC-LOOP-03 model — 5 full review-optimize cycles with POSTMORTEM firing after the counter reaches 6 — is consistent with "5 iterations exhausted." REQ-GATE-04 AC item (1) states the POSTMORTEM is written when "a review loop has completed 5 iterations and at least one reviewer still returns Needs revision." The v1.2 model satisfies this: 5 review-optimize cycles complete, the counter increments to 6, and POSTMORTEM fires. No scope regression.

The v1.2 iteration-cap fix also aligns the TSPEC with the REQ's normative intent: all 5 iterations involve both a reviewer pair and an optimizer pass. The prior TSPEC (4 optimizer calls) would have underdelivered relative to the REQ's implied effort budget for convergence. The v1.2 fix is the product-correct outcome.

### Traceability table update: coverage

The addition of AT-IMPL-04 and AT-IMPL-05 to the REQ-GATE-03 traceability row closes a gap that was a documentation omission — the behaviors (batch pass continuation, empty-result failure) were already specified in TSPEC-IMPL-06. No AC impact. No regression.

---

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **TSPEC-SKILL-01 verification criterion silent on disk format (carried from v2).** REQ-COMPAT-01 AC item (3) requires that "the cross-review file on disk is unchanged from today's format." TSPEC-SKILL-01 verification criterion #3 addresses only the response channel (interactive callers ignoring trailing lines). No criterion confirms the VERDICT trailer is absent from the CROSS-REVIEW-*.md file written to disk. Add a fourth verification criterion: "The CROSS-REVIEW-*.md file format written to disk by each reviewer is unchanged — the VERDICT trailer appears only in the agent's final message, not in the cross-review document itself." | REQ-COMPAT-01 |
| F-02 | Low | Local | **REQ-NFR-01 worst-case formula discrepancy (carried from v2).** REQ-NFR-01 AC item (3) anchors to "~142 agents worst case." TSPEC-NFR-02 corrects the formula to 156 agents. Both are well under the 1,000-agent cap; no product risk. REQ-NFR-01 must be updated by pm-author to reference the corrected ~156-agent formula. This finding requires a parallel REQ update, not a TSPEC change. | REQ-NFR-01 |
| F-03 | Low | Local | **REQ-COMPAT-02 traceability partial (carried from v2).** The §11 REQ-COMPAT-02 row maps only to TSPEC-HARVEST-03/04, covering only `guard-harvest-before-delete`. The `check-scope-field` (FSPEC §7.6) and `nudge-consolidation` (FSPEC §7.7) hooks have no TSPEC anchor. Add a brief note to the REQ-COMPAT-02 row in §11 delegating their coverage to FSPEC §7.6–7.7 and confirming no script logic is required for either. | REQ-COMPAT-02 |
| F-04 | Low | Local | **REQ-OBS-01 per-agent label convention unaddressed (carried from v2).** TSPEC-SCRIPT-05 describes the runtime API functions without specifying the preferred per-agent label format from REQ-OBS-01 (e.g., `review:se-review:REQ`, `optimize:pm-author:REQ`). If the runtime supports per-agent metadata, the implementer has no spec to follow. Add a note to TSPEC-SCRIPT-05 or a new TSPEC-OBS item. | REQ-OBS-01 |

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-02 requires a pm-author REQ update to REQ-NFR-01. Is this update being tracked as a parallel work item, or does it block PLAN authoring? The TSPEC can proceed to PLAN with F-02 unresolved (no implementation risk), but the REQ discrepancy should be closed before PROPERTIES authoring begins so test property authors have a consistent acceptance criterion to reference. |
| Q-02 | V2 Q-03 (whether surfacing the run ID via `log()` at pipeline start is in TSPEC scope per REQ-PIPELINE-03) remains unanswered. If the runtime does not surface the run ID in the UI automatically, there is no spec for it and REQ-PIPELINE-03's resumability AC cannot be fully satisfied by a developer who does not know the run ID. |

---

## Positive Observations

- The v1.2 iteration-cap fix is correct and precisely specified. The counter-value-to-action table at the bottom of TSPEC-LOOP-03 is a clean behavioral anchor: "5 reviewer pairs dispatched, 5 optimizer invocations completed, then POSTMORTEM." This matches REQ-GATE-02 and REQ-GATE-04 intent unambiguously.
- The traceability addition of AT-IMPL-04/05 to REQ-GATE-03 closes a documentation gap that would have created unnecessary work for the PROPERTIES author.
- No new scope or traceability issues were introduced by the v1.2 changes. The two targeted fixes are minimal and correct.
- All findings remain Low in this iteration. The TSPEC is implementation-ready.

---

## Recommendation

**Approved with minor changes**

All four carried findings are Low. No High or Medium findings. The v1.2 changes introduce no regressions and correctly resolve the TE High finding on the iteration-cap boundary.

Outstanding actions (none block PLAN authoring):

- **F-01:** Add a fourth verification criterion to TSPEC-SKILL-01 confirming the CROSS-REVIEW-*.md disk format is unchanged by the trailer addition.
- **F-02:** pm-author REQ update to align REQ-NFR-01 AC item (3) with the corrected ~156-agent formula.
- **F-03:** Add a delegation note to the §11 REQ-COMPAT-02 row for FSPEC §7.6–7.7 coverage.
- **F-04:** Add per-agent label convention note to TSPEC-SCRIPT-05 or a new TSPEC-OBS item.

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 4}
