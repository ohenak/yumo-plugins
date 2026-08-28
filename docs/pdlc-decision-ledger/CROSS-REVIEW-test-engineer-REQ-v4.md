# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.3, `1d951e5ee`)
**Date:** 2026-08-28
**Iteration:** 4
**Scope:** Delta re-review against `CROSS-REVIEW-test-engineer-REQ-v3.md`. Diff base `ba52b2460`
(v1.2, the bytes v3 reviewed) → `1d951e5ee` (v1.3). The diff is 89 lines and touches: the header
table, §2 G-1's scope paragraph, §5 REQ-DECLEDGER-01's Given/Then, REQ-DECLEDGER-04's
parenthetical, REQ-DECLEDGER-08's Given, and §7 O-1. Unchanged sections already approved in
earlier rounds are not re-litigated.

## Round-3 finding disposition

| v3 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-16 | High | **Partly resolved (residue re-filed as F-20)** — two of its three legs land. (a) The false exemplar is gone: `DEC-AWG-Q1` is now correctly described as a citation occurring once in prose (`docs/_decisions/DECISIONS-advisory-wave-gate-questions.md:14` is still the sole `DEC-AWG` hit in the repo), and the file is explicitly a zero-line contributor. (c) The arithmetic and the rule now agree in intent: G-1 states "C-5's 41 is this count", and C-5's `41` reproduces at HEAD — `grep -rhoE '^#{1,6} +DEC-…' docs/_decisions/*.md` yields exactly 41 heading lines, 41 unique ids, none with a non-numeric final segment. (b) is where the residue sits: the new predicate admits *line-leading list items*, and at HEAD four such lines exist inside a file G-1 simultaneously declares records nothing (F-20). |
| F-17 | Medium | **Resolved** — G-1 now pins `NUMBER` as numeric and demotes `DEC-AWG-Q1` to a citation, so one grammar stands where two contradicted. Verified against HEAD: every one of the 41 heading-carried ids under `docs/_decisions/` matches `DEC-{NS}-{digits}`, so the numeric matcher and the corpus agree. The residual factual slip in the same sentence is F-21, non-gating. |
| F-18 | Medium | **Resolved** — AC-01's Given now reads "and the in-scope set is within C-5's bounds", and its Then re-bases set equality on "G-1's in-scope set; over-budget omission is REQ-DECLEDGER-07's alone". The two criteria no longer overlap: AC-01 owns the equality, AC-07 owns the budget boundary. This is exactly the one-clause fix, and it removes the case where a fixture exceeding `maxEntries` made AC-01's expected set depend on a rule routed to TSPEC. |
| F-19 | Low | **Resolved** — REQ-DECLEDGER-08's Given now carries the positive conjunct: the `false` run's dispatch is byte-identical to C-2's baseline (REQ-DECLEDGER-02) and the `true` run's carries the rendered index (REQ-DECLEDGER-01), "asserted not merely allowed". The excluded leg is now falsifiable in both directions rather than carved out. |
