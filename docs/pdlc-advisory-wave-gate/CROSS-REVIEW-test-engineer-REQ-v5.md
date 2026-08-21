# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md (v1.15)
**Date:** 2026-08-20
**Iteration:** 5 (delta confirmation, erratum round Phase F)

## Problem / Context

This round is a **delta confirmation**, not a fresh review. I approved this REQ at v4
(`CROSS-REVIEW-test-engineer-REQ-v4.md`). A targeted erratum edit has since landed in three commits —
`88c3554f`, `f3fbbc7b`, `0cef7148` — carrying the document from v1.14 to v1.15. The routed items were
four of mine (F-01 High, F-02, F-03, F-04) and three of se-review's (F-02, F-03, F-04).

Method: `git diff c58fd61d..HEAD` on the REQ (15 insertions, 7 deletions, four hunks), then a re-read
of the upstream this REQ now leans on **at HEAD** — `docs/_constraints/pdlc-wave-gate-baseline.md`
v1.2 (`64654032`) and `docs/_constraints/pdlc-advisory-corpus-baseline.md` v1.0 — to check the REQ is
still a faithful compression of what those files currently say (DEC-ERR-03). Sections outside the four
hunks and outside the citation surface were not re-litigated.

## Goals

1. Confirm each routed item either landed or is recorded as deliberately not taken with a reason.
2. Confirm the landed edits did not break anything approved at v4 — in particular that the widened
   AC-5.1 exclusion list stays consistent with AC-6.1/AC-6.2/AC-5.2 and is enumerated in exactly one
   place.
3. Re-measure this REQ against its upstream at HEAD and raise any citation that upstream no longer
   supports as written, whether or not it appears in the routed list.

## Non-Goals

- Re-reviewing unchanged sections (§2–§4, §5 C-1…C-4, §6 REQ-AWG-01…04 beyond AC-1.1, §8) from
  scratch.
- Product-strategy, architecture, or style commentary — the testing lens only.
- Contesting the erratum's not-taken dispositions (C-5 overage, upstream `Cited by` rows); they are
  recorded below as inherited findings so they route, not halt.

## Constraints

## Acceptance Criteria

## Risks

## Obligations

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
