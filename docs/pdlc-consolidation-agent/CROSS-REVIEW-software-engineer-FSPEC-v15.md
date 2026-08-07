# Cross-Review: software-engineer — FSPEC (round 15, erratum delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-07
**Iteration:** 15
**Scope:** Delta confirmation only. Prior approval: CROSS-REVIEW-software-engineer-FSPEC-v14.md
(`Approved with minor changes`). Delta under review: commit `91059d41` — the one-item Phase D
erratum round (AT-Q7c's invoking-tree upper bound), plus the two Low locator repairs of the v14
reviews. No re-review of unchanged sections.

## 1. What changed

`git diff 99aff9bc..91059d41 -- FSPEC` is 18 insertions / 4 deletions across exactly four hunks.
Three are prose or locator text; one is the AT-Q7c cell. Nothing else in the document moved.

| Hunk | Lines | Change | Class |
|---|---|---|---|
| 1 | `:9-26` | version row `11.4 → 11.5`, date `2026-08-07`; new 14-line erratum-round note recording the one erratum and the two locator repairs | header/provenance |
| 2 | `:527` (§4.2 producers table) | `§4.3 ':511-512'` → `§4.3 ':557-558'` | locator repair (my v14 F-01a) |
| 3 | `:2120` (AT-P7) | `§14's change register (':2401')` → `§15.3's change register (':2449')` | locator repair (my v14 F-01b) |
| 4 | `:2168` (AT-Q7c) | the invoking-tree upper bound restated as §6.5's frozen set ∪ TSPEC's recorded widenings, plus a paragraph naming what the row fixes as the *shape* of the bound | the erratum |

Zero changes to §6.5 itself, to any rule, AC, BR, NFR, E-row, fixture, or to any other AT row. The
14-line header insertion is what shifted every downstream line number by exactly 14 — which is why
the two locator repairs land on `:557-558` and `:2449` rather than the `:543-544` / `:2435` I named
in v14. I re-derived both against HEAD rather than trusting the arithmetic: §4.3 spans `:542-561`
and its release-after-append sentence is at `:557-558`; §15.3 is at `:2445` and its
`nudge-consolidation.sh` row is at `:2449`. Both correct.

## 2. Erratum item — resolved?

## 3. Regression check against the v14 approval

## Findings

## Questions

## Positive Observations

## Recommendation
