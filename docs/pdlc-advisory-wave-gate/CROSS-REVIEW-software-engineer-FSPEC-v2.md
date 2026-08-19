# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.1, 2026-08-18)
**Date:** 2026-08-18
**Iteration:** 2
**Scope:** Delta re-review of v1.1 against `CROSS-REVIEW-software-engineer-FSPEC-v1.md`. Diff base `f6b30cef` (the commit v1 reviewed) → HEAD. Changed sections only; unchanged sections not re-litigated. Reviewed on `feat-pdlc-advisory-wave-gate`.

## Prior Findings — Disposition

All thirteen v1 findings were addressed; twelve are resolved, one (F-05) was addressed by a change that introduces a new defect, carried below as F-01.

| v1 id | Sev | Disposition | Evidence in v1.1 |
|---|---|---|---|
| F-01 | High | **Resolved** | E-04 and AT-01-5 now count inapplicability *statements* "whoever authored the carrier", and AT-01-5 states explicitly that it does not filter A6-authored notices because A6 authors none (FSPEC:248, :318). The inverted oracle is gone. |
| F-02 | High | **Resolved** | BR-8 now states the invariant over writer **identity** — "the two writers above stay the only ones, and a green gate stays their precondition" — and explicitly declines set-equality over committed paths, leaving the scope widening to O-8/BR-12 (FSPEC:188-192, AT-04-3 at :389-390). AT-04-5's companion case is now the red-today one. |
| F-03 | Medium | **Resolved** | §3.3 splits step 4 (well-formedness/citation, one attempt consumed) from step 4b (classification, no attempt consumed), and the closing paragraph names both costs (FSPEC:122-123, :131). No remaining "either" answer. |
| F-04 | Medium | **Resolved** | Step 3b — attempt admission — now owns the counter read, step 3 defers to it, and step 7's red branch returns to 3b rather than 3 (FSPEC:88, :90, :126). AT-02-9 pins the count with a two-case counted oracle. |
| F-05 | Medium | **Addressed, new defect** | BR-11 now defines the invocation window, but as a wave-spanning episode, contradicting REQ AC-2.4 and the shipped mechanism. See F-01 below. |
| F-06 | Medium | **Resolved** | E-04 and AT-01-5 scope the population to "runs that reach Phase I"; runs halting earlier or skipping Phase I on a recorded wave ledger sit outside the criterion (FSPEC:248, :318). |
| F-07 | Medium | **Resolved** | E-04 records the carriers as mutually exclusive and names the no-manifest carrier as the one that discharges the requirement in the both-absent case (FSPEC:248). |
| F-08 | Medium | **Addressed, partly** | New row E-33 covers absent/malformed/zero `waveBudgetPerRun` (FSPEC:289). The zero half collides with the shipped parser — F-02 below. |
| F-09 | Medium | **Resolved** | BR-10 and E-22 now state that the repair stays applied on a post-gate halt, and that the advisory record and halt report both name its paths, so reversibility is never claimed where it does not hold (FSPEC:205, :283). AT-05-4 names the un-skip guard as the fixture's check class. |
| F-10 | Medium | **Resolved** | BR-4 now states that E-5/E-6 are not two further act kinds but a widening of the envelope's semantics from act kinds alone to act-plus-scope, with `E-1`…`E-4` still naming what may be done (FSPEC:165). R-1's residual width is routed to §7.3 A-3. |
| F-11 | Medium | **Resolved** | AT-03-2 now asserts *which* clause matches first, making the precedence claim falsifiable rather than asserting only refusal (FSPEC:387). |
| F-12 | Low | **Resolved** | AT-07-1 enumerates the agent-proposable boundaries (E-5 scope, E-6's halves, BR-5, BR-6, BR-8) and names BR-13/BR-14/BR-16 as excluded by construction (FSPEC:435). |
| F-13 | Low | **Resolved** | AT-07-3 drops the wall-clock clause and rests NFR-5 on reachability, saying so in the test text (FSPEC:441). |

## Findings

## Questions

## Positive Observations

## Recommendation

