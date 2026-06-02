---
Scope: docs/orchestrate-dev-workflow/DECISIONS-orchestrate-dev-workflow.md
---

# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** docs/orchestrate-dev-workflow/DECISIONS-orchestrate-dev-workflow.md
**Date:** 2026-06-01
**Iteration:** 2

---

## Prior-Finding Resolution

| Prior ID | Severity | Status | Notes |
|----------|----------|--------|-------|
| F-01 | High | Resolved | DEC-ODW-01 re-evaluation triggers replaced with two artifact-detectable proxy signals: POSTMORTEM files citing batch-plan ordering, and workflow final-report logs showing implementation-phase manual restarts. Both are observable without additional monitoring infrastructure. |
| F-02 | Medium | Resolved | DEC-ODW-03 "Test-contract note" added. States the guard-agent return protocol is a formal test contract, mandates a canonical double defined once in PROPERTIES or PLAN, and explicitly names the silent-mis-branch failure mode of ad-hoc stub divergence. All three required elements are present. |
| F-03 | Medium | Partially resolved — see F-01 below | DEC-ODW-04 was added and covers context, decision, alternatives, constraints, reversibility, and re-evaluation trigger. Missing: the explicit testability implication requested in v1 ("every DECISIONS-path test must construct the exact post-PASS prompt to exercise the parsing path"). |

---

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-01 | Low | Local | **DEC-ODW-04 is missing the testability implication required by the prior F-03 recommendation.** The prior recommendation explicitly stated: "Include … the testability implication (every DECISIONS-path test must construct the exact post-PASS prompt to exercise the parsing path)." DEC-ODW-04 as written does not contain this note. The gap is narrow — DEC-ODW-03's adjacent "Test-contract note" provides a structural template, and the constraint recorded in DEC-ODW-04 (SKILL.md files are shared; workflow-specific trailers must remain caller-side) implies the testing consequence. However, the downstream PROPERTIES author has no explicit anchor to understand that `DECISIONS_WARRANTED` parsing tests require reconstructing the post-PASS prompt. A one-sentence testability note analogous to DEC-ODW-03's is sufficient. | DEC-ODW-04 Decision / Alternatives considered |
| F-02 | Low | Local | **DEC-ODW-02 re-evaluation trigger remains user-perception-based.** The trigger still reads: "if a future caller … surfaces the trailing lines in a way users find confusing." "Users find confusing" is not a detectable system condition. The prior v1 F-04 recommended grounding the trigger in an integration-test failure: "if a consumer integration test begins failing because VERDICT trailer lines appear in surfaced output." This reformulation makes the trigger actionable by an observable test failure rather than a user perception report. The change is editorial and low effort. | DEC-ODW-02 Re-evaluation triggers |
| F-03 | Low | Local | **PHASE_H_ENABLED compile-time flag is still absent from DECISIONS.** FSPEC §5.1 and TSPEC-HARVEST-01 define `PHASE_H_ENABLED = true` as a compile-time gate for the Phase H (harvest) skip path. No DECISIONS entry records why a compile-time boolean was chosen over runtime config, a `meta.flags` field, or a SKILL.md conditional. Tests for the Phase H skip path compile against a specific value of `PHASE_H_ENABLED`; if the mechanism changes, test harness setup changes with it. The absence leaves the PROPERTIES author without a decision record to anchor the skip-path test design. This was F-05 (Low) in v1. | FSPEC §5.1, TSPEC-HARVEST-01 |

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | DEC-ODW-04 states that the `DECISIONS_WARRANTED` trigger is "script-injected at invocation time." Is there a defined canonical format for this injected instruction (analogous to the VERDICT trailer format in DEC-ODW-02 / TSPEC-SKILL-01), or is the format ad-hoc per-call? If no canonical format exists, DECISIONS-path tests lack a stable string to assert against. |

---

## Positive Observations

- **F-01 (High) resolution is well-constructed.** The two proxy signals (POSTMORTEM "Pattern of Disagreement" for batch-plan ordering; final-report manual-restart count) are grounded in existing pipeline artifact types. No new monitoring infrastructure is required. The phrasing "both conditions are detectable from existing pipeline artifacts … without additional monitoring infrastructure" directly answers the testability concern.
- **F-02 (Medium) resolution is complete.** The "Test-contract note" in DEC-ODW-03 is clear, explicit, and structurally parallel to how the guard-agent protocol is used elsewhere in the document. Mandating a single canonical double and prohibiting per-test ad-hoc stubbing is exactly the right instruction for the PROPERTIES author.
- **DEC-ODW-04 is substantively correct.** The decision, constraint, reversibility, and re-evaluation trigger sections are all sound. The inverse-of-DEC-ODW-02 reasoning is clearly articulated and testable as a principle: callers that do not need a field should not receive it by default.
- **Document structure is consistent.** All four decisions follow the same section structure (Context, Decision, Alternatives considered, Constraints, Reversibility, Re-evaluation triggers), which makes downstream scanning by the PROPERTIES author straightforward.

---

## Recommendation

**Approved with minor changes**

All High and Medium findings from v1 are resolved. The three remaining findings are Low. None blocks PROPERTIES authoring from proceeding.

The most useful pre-PLAN change is F-01 (testability implication in DEC-ODW-04) — a single sentence analogous to DEC-ODW-03's "Test-contract note" is sufficient. F-02 and F-03 (Low) may be addressed in the same editorial pass or deferred.

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}
