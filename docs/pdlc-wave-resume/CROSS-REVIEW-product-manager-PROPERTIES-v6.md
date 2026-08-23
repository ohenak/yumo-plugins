# Cross-Review: product-manager — PROPERTIES (delta re-review)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-wave-resume/PROPERTIES-pdlc-wave-resume.md
**Date:** 2026-08-23
**Iteration:** 6

## Overview

**Scope of this round.** I re-reviewed only the delta. My v5 was a delta confirmation against
TSPEC v1.4 and returned **Needs revision** on one High (F-01) plus two Mediums and two Lows.
PROPERTIES has moved 1.3 → 1.5 since the bytes I reviewed (`91ce118c`); the diff is
`git diff 91ce118c..HEAD -- docs/pdlc-wave-resume/PROPERTIES-pdlc-wave-resume.md`, 158 lines,
touching the front-matter, two revision-history rows, PROP-OVERRIDE-01, PROP-OVERRIDE-05,
PROP-COV-03, two oracle rows, the mutation → oracle map, the run-depth paragraph, § 11's local-red
table, the PLAN-task trace and the routed-errata ledger. I did not re-read the sections that did not
move.

**Verdict of the delta: every v5 finding is resolved, and I verified each one against the upstream
document at HEAD rather than against the revision-history claim.**

| v5 finding | Sev | State | Evidence checked at HEAD |
|---|---|---|---|
| F-01 write-side conjunct + fifth mutation missing | High | **Resolved** | PROP-OVERRIDE-01 now carries the conjunct in both the property row and the oracle row; PROP-COV-03 counts five; the mutation → oracle map has the fifth row with T-07 as the task that runs it |
| F-02 §5.7 run-count row asserts "still open" | Medium | **Resolved** | The row now reads "**Closed by the owner** … routed at v1.1, landed at TSPEC v1.4", the `ERRATUM: TSPEC` routing is dropped, and the run-depth paragraph is restated as three-way agreement |
| F-03 §5.8 c8-include row asserts "open" | Medium | **Resolved** | The row reads "**Closed by the owner** … routed at v1.3 (PM F-02), landed at TSPEC v1.4"; § 11's measured baseline untouched, as I said it should be |
| F-04 PROP-OVERRIDE-05 rationale on the rejected-value conjunct | Low | **Resolved** | Restated on the discriminating conjunct — "emitted **before any resume decision runs**" — and it now names PROP-OVERRIDE-03's clamped past-the-end case as the counter-example, which is exactly TSPEC §2.4's argument |
| F-05 raw `TSPEC:838` anchor | Low | **Resolved** | No `TSPEC:838` remains anywhere in the file (`grep -nE '\.(md|js|mjs|json):[0-9]+'`) |

**What the revision also did, unprompted and correctly.** v1.5 is a second, self-initiated pass that
re-verified the routed-errata ledger against **PLAN** at HEAD, closing the two `ERRATUM: PLAN` halves
that had landed and adding the two missing PLAN-task trace rows (T-11, T-12). That work was not asked
for by any v5 finding and it closes a gap I would otherwise have raised this round — see
`## Fixtures`.

**What I found new.** Three Lows, all record-accuracy rather than substance: one mis-attributed PLAN
version in the revision history, one stale "this round" in a ledger row, and one new raw `file:line`
anchor. No property, oracle, fixture or requirement mapping is wrong. Nothing blocks.

**Lens note.** This is the product lens: requirement traceability, acceptance-criterion fidelity,
scope. Test-design depth and engineering feasibility stay with te-review and se-review.

## Properties

## Oracles

## Fixtures

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
