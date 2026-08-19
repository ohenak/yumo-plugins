# FSPEC — pdlc-advisory-wave-gate

| Field | Value |
|---|---|
| Upstream | `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` |
| Downstream | `TSPEC-pdlc-advisory-wave-gate.md`, `PLAN-pdlc-advisory-wave-gate.md`, `PROPERTIES-pdlc-advisory-wave-gate.md` |
| Cross-Reviews | (active) |
| LEARNINGS | `docs/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 1.0 | 2026-08-18 |

## 1. Overview

**Scope in one line.** This FSPEC specifies the observable behaviour of **A6**, a sixth advisory
seam that fires when a Phase I implementation wave's script-owned test gate returns non-zero, gets
one bounded and reversible repair attempt inside a declared file envelope, re-runs the wave's own
gate sequence, and — if the gate does not go green on its own — escalates and leaves the pipeline
halting exactly as it halts today, with a diagnosis attached.

**What this document adds over the REQ.** The REQ states the outcomes an operator can observe. This
FSPEC states the *order* in which they become observable: the decision points inside one A6
invocation, which condition wins when two apply, what each terminal disposition leaves on disk, and
the Who/Given/When/Then tests that decide whether the behaviour shipped.

**What this document deliberately does not state.** No seam signature, no injected-dependency name,
no algorithm for computing an owned-path set, no restoration mechanism, no field layout of any
shipped record. Those are the TSPEC's, and the REQ already routes them there (O-1, O-3, O-4, O-5,
O-8). Where behaviour that already ships is referenced, it is cited by `M-WG-*` id from
`docs/_constraints/pdlc-wave-gate-baseline.md` v1.1, and tier behaviour by `M-ADV-*`/section id from
`docs/_constraints/pdlc-advisory-corpus-baseline.md`, rather than restated.

**Reading order.** §3 gives the single lifecycle end to end; §4 gives the rules that decide the
branches §3 names; §5 gives what happens when an input is absent, malformed, or contradictory; §6
gives the acceptance tests. A reader who wants only the boundary should read BR-4 through BR-9.

**Inherited contracts.** A6 is an extension of a shipped tier, not a new mechanism (REQ C-1). The
verdict shape, the confidence-and-envelope action gate, the ordered eight-member refusal-reason
catalogue, the exclusion set, the per-feature advisory record, the escalation log, and the model
rung are the tier's and are used unchanged. This FSPEC states only what A6 adds: one trigger, one
classification vocabulary, two envelope members, one config key, four prohibitions, and one
re-gate-and-restore cycle.

**Non-goals, restated from REQ §4 because they bound this spec's tests.** A6 does not change the
wave gate, wave partitioning, or commit discipline; does not fix PLAN dependency derivation; does
not give Phase I a POSTMORTEM lifecycle or an approval skip; does not apply to the final V-wave; does
not apply on the legacy worktree path; and changes no other seam, no refusal reason, and no model
rung.

## 2. Linked Requirements

## 3. Behavioral Flow

## 4. Business Rules

## 5. Edge Cases and Error Scenarios

## 6. Acceptance Tests

## 7. Open Questions
