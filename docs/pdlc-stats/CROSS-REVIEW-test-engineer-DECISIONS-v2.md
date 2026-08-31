# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.1)
**Date:** 2026-08-31
**Iteration:** 2

## Scope

Delta re-review against `CROSS-REVIEW-test-engineer-DECISIONS-v1.md`. Diffed
`07bf532e9..HEAD` on the document: six commits, all revision-driven. I verified each v1 finding is
resolved, then scanned only the changed sections for new issues. Unchanged sections already
approved in v1 were not re-litigated. Every claim below was re-measured against the tree at HEAD.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Cross-Feature | **`pdlc/engine/__tests__/loop-distribution.test.js` is a mandatory sixth co-change site that the document names nowhere, and the new Residuals table's third row asserts the opposite of HEAD: the sibling-document half *does* have an oracle (`loop-distribution.test.js:182`), and it is pinned to `5` in three places plus a word-map that demands `6`, not `six`.** | Residuals — obligations with no oracle at HEAD, row 3; K-1; K-7; DEC-STATS-01 site table |
| F-02 | Medium | Local | **The re-evaluation trigger's "six hand-written lists" enumeration is short by four.** `loop-distribution.test.js`'s `D1_BASELINE`, `D2_D3_BASELINE`, `D5_BASELINE` and `NEW_LIB_MEMBERS_*` are transcribed member lists too, so the trigger understates what deriving-from-a-listing would have to change. | DEC-STATS-01, *Re-evaluation triggers*, first bullet |
| F-03 | Low | Local | **K-3 describes the P9-02 declared conjunct as "set-equal … in both directions"; the shipped assertion is `toEqual` on an array, which is order-sensitive.** A correct-set/wrong-position edit is red. | Consequences, K-3, *Declared* |

Scope legend: `Local` — this artifact only. `Cross-Feature` — a testing constraint that outlives this
feature. `Process` — a skill/checklist gap.

## Disposition of v1 findings

## Detail

## Questions

## Positive Observations

## Recommendation

## Verdict
