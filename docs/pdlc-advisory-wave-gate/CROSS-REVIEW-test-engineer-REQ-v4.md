# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.14)
**Delta reviewed:** `4b925b1a..c58fd61d` (three erratum commits: lineage/Status, `c8aa22a4` base, AC-5.1)
**Date:** 2026-08-20
**Iteration:** 4 (delta confirmation — this REQ was previously approved at v1.13)

## Problem / Context

This is an erratum delta confirmation, not a fresh review. I approved this REQ at v1.13. A targeted
erratum landed in three commits and bumped it to v1.14, addressing eight routed items — two of mine
(the pre-A6 catalogue argued at an unnamed base; AC-5.1's "observably identical" tree contradicted by
the run's own record writes) and six of pm-author's (ignored-path boundary, failed-capture observable,
lineage `Downstream`/`Upstream`/`Cross-Reviews` rows, and the `draft` Status).

Per DEC-ERR-03 my scope is this REQ measured against its upstream **at HEAD**, not the item list. The
upstream this REQ leans on is `docs/_constraints/pdlc-wave-gate-baseline.md` (cited at v1.2),
`docs/_constraints/pdlc-advisory-corpus-baseline.md`, and
`docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md`. I re-read all three at their current
bytes and re-measured the two runtime facts the delta now pins.

## Goals

Answer one question: does the delta resolve the routed items without breaking what I previously
approved, and is the document still a faithful compression of its upstream at HEAD?

## Non-Goals

- Re-reviewing unchanged sections of the REQ (REQ-AWG-01..04, 06, 07, §1–§5, §9–§10) beyond the
  citations the delta newly leans on.
- The relocation of this feature's directory to `docs/completed/` — routed to SE Q-02 and still open
  there; the erratum correctly disposed only the `Status` field and said so.
- Product framing, technical mechanism, or TSPEC-altitude test design. Under the altitude rule my
  findings here ask only for black-box-testable outcomes.

## Constraints

## Acceptance Criteria

## Risks

## Obligations

## Positive Observations

## Delta-Confirmation Findings

## Recommendation

## Verdict
