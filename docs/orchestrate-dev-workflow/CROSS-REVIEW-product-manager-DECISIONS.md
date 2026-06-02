---
Status: Draft
Author: pm-review
Version: 1.0
Feature: orchestrate-dev-workflow
Scope: Product Manager cross-review of DECISIONS-orchestrate-dev-workflow.md — traceability to REQ constraints, accuracy of rejected alternatives, observability of re-evaluation triggers, and consistency with REQ v1.1
---

# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** docs/orchestrate-dev-workflow/DECISIONS-orchestrate-dev-workflow.md
**Reference:** docs/orchestrate-dev-workflow/REQ-orchestrate-dev-workflow.md (v1.1)
**Date:** 2026-06-01
**Iteration:** 1

---

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | DEC-ODW-01 rejection rationale for Option B does not cite the REQ's explicit out-of-scope declaration. The REQ Scope section already excludes the two-workflow split by name: "The two-workflow split variant (`orchestrate-spec` / `orchestrate-impl`) — not chosen." The DECISIONS document argues against Option B on its merits ("reintroduces manual coordination") without anchoring the rejection to the REQ scope boundary. This creates a traceability gap: a reader of the DECISIONS doc cannot verify that the choice was product-approved without consulting the REQ separately. The fix is to add a sentence citing the REQ out-of-scope declaration as the authoritative reason, with the merit argument as supporting rationale. | REQ (Scope — Out of Scope, item 5) |
| F-02 | Low | Local | DEC-ODW-02 rejection rationale for Option B (script-side injection) is framed primarily as an architectural/engineering preference ("single-source-of-truth principle") rather than deriving from a stated product constraint. REQ-COMPAT-01 specifies the trailer as "the shared data contract consumed by REQ-GATE-01 and REQ-GATE-05" and requires backward compatibility for interactive callers — the product constraint is that all callers (Ptah engine, interactive use, future workflow scripts) receive the trailer without requiring per-caller coordination. The document does mention this in passing ("every caller … would need to know to inject the trailer") but does not cite REQ-COMPAT-01 by ID. Tightening the traceability — leading with the product constraint (all-callers coverage per REQ-COMPAT-01) rather than the engineering principle — would make the decision's product basis explicit. | REQ-COMPAT-01 |
| F-03 | Low | Local | DEC-ODW-03 presents `fs.existsSync` as an "alternative considered" when it was not a genuine product alternative — it was a specification error in TSPEC v1.0 that was caught and corrected during TE cross-review (Iteration 2, F-03). The document acknowledges this ("Rejected because the dynamic workflow runtime does not expose `fs`…This is a hard runtime constraint, not a preference"), but the framing in the "Alternatives considered" section suggests it was a competing design option. A product reader of this document would be better served by a clearer signal that Option B was a factual error in an early draft, not a design trade-off. Recommended phrasing change: present Option B in a "Note on draft history" subsection or relabel it as "Draft v1.0 error (not a viable alternative)" to distinguish it from genuine alternatives. | REQ-PIPELINE-01 |
| F-04 | Low | Process | The DECISIONS document header includes a `LEARNINGS` field pointing to `docs/orchestrate-dev-workflow/LEARNINGS-orchestrate-dev-workflow.md`. This file does not yet exist on the branch (harvest has not run). The LEARNINGS pointer in active-feature documents is a forward reference by convention, but it may mislead a reader who opens the link expecting a populated file. This is a documentation convention issue, not a product content issue. Noting it here as a process observation. | — |

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | DEC-ODW-01 re-evaluation trigger is "users frequently need to modify or reject the computed batch plan before implementation begins." Is there a defined channel or mechanism for users to surface this feedback (e.g., a GitHub issue label, a post-mortem finding pattern)? Without a collection mechanism, this trigger is observable in principle but may not be actionable in practice. |
| Q-02 | DEC-ODW-03's re-evaluation trigger references "if the dynamic workflow runtime adds a `readFile()` or `fileExists()` primitive." Is there a tracking item or runtime changelog that the team monitors for such additions? If not, this trigger is reactive rather than proactive — the team would only learn of it by chance. |

---

## Positive Observations

- All three decisions are consistent with REQ v1.1. No decision contradicts an approved requirement, and no P0 or P1 requirement is implicitly de-scoped or undermined.
- DEC-ODW-01 correctly names the runtime constraint (no mid-run pause/resume-for-input primitive) as the binding architectural forcing function, which traces directly to the product requirement for unattended end-to-end execution (REQ-PIPELINE-01, US-01).
- DEC-ODW-03's re-evaluation trigger is the most actionable of the three: it is tied to a specific, observable runtime capability change (`readFile()` or `fileExists()` primitive addition) and provides concrete replacement guidance (eliminate the guard agent call).
- The reversibility assessment in all three decisions is accurate and useful. DEC-ODW-01 correctly identifies the two-workflow split as hard to reverse post-ship; DEC-ODW-02 and DEC-ODW-03 correctly identify their respective changes as easy to reverse.
- DEC-ODW-02 correctly resolves FSPEC OQ-02 by committing to permanent SKILL.md baking of the trailer, which is the right product call for backward compatibility with all callers including the Ptah engine (REQ-COMPAT-01).
- The document correctly establishes scope: three load-bearing architectural decisions settled during TSPEC/FSPEC authoring. No scope creep is present — the DECISIONS doc does not attempt to introduce new product requirements or alter artifact conventions.

---

## Recommendation

**Needs revision**

Three Low findings and one Medium finding are present. The Medium finding (F-01) requires a targeted fix before the DECISIONS document is used as an input to PLAN or PROPERTIES authoring.

**Required changes before proceeding:**

1. **F-01 (Medium):** In DEC-ODW-01, add an explicit citation of the REQ out-of-scope declaration for the two-workflow split as the authoritative basis for rejecting Option B. The existing merit argument may remain as supporting rationale but must not be the sole stated reason.

2. **F-02 (Low):** In DEC-ODW-02, lead the Option B rejection with a citation to REQ-COMPAT-01's "available to all callers" constraint before presenting the engineering single-source-of-truth principle.

3. **F-03 (Low):** In DEC-ODW-03, reframe Option B to make clear it was a TSPEC v1.0 draft error rather than a genuine competing design alternative. A heading change or a short clarifying sentence at the top of the section would suffice.

VERDICT: Needs revision
{"high": 0, "medium": 1, "low": 3}
