# Cross-Review: software-engineer — REQ (delta re-review, iteration 8)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/REQ-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 8

## 1. Delta scope

**Delta base:** `af78b8c4e` (REQ v1.5, the bytes I reviewed in v7). **Head:** `1847dd9c0`, REQ v1.6,
one commit. Size 21,248 B → 21,677 B (+429).

`git diff af78b8c4e 1847dd9c0 -- docs/pdlc-stats/REQ-pdlc-stats.md` — 22 insertions, 17 deletions,
five hunks:

| Section | Change |
|---|---|
| Metadata block (`:15-24`) | v1.5 → v1.6; round note rewritten to record the withdrawal |
| NG-6 (`:75-80`) | harvested states scoped to the two families harvest removes (cross-reviews, DoD reviews); absent post-mortem = REQ-STATS-05's measured `0` |
| REQ-STATS-02 (`:145`) | key-set clause `REQ-STATS-03/04/05/06` → `REQ-STATS-03/04/06` |
| REQ-STATS-05 (`:187-192`) | harvested halt state withdrawn; `0` restored; falsified premise sentence removed; residual routed to R-6 |
| R-6 (`:262-267`) | harvested-state list drops `05`; adds the explicit accepted-residual paragraph for halts |

Nothing else moved. Unchanged sections are not re-reviewed here.

## 2. Prior findings

**F-01 (v7, High, delta/local) — RESOLVED.** v1.5's REQ-STATS-05 grounded a harvested halt state on
"harvest is observed to delete post-mortems as well as reviews", inferred from one `Harvested from`
row. My v7 survey falsified it: 9 of 13 harvested features under `docs/completed/` still hold
post-mortems, and `harvest-learnings/SKILL.md:28`, `:59` and `:129` scope deletion to `CROSS-REVIEW-*`
and `CODE_REVIEW-*` only. v1.6 takes path 1 of the three I offered — the survive side — verbatim:
the premise sentence is gone (`:187-190`), `0` is restored, and no harvested state is drawn for
halts. I re-verified the deletion scope at HEAD: `harvest-learnings/SKILL.md:28` ("then delete the
`CROSS-REVIEW-*` and `CODE_REVIEW-*` files in a second commit"), `:59` (step 8, same two families)
and `:129` (checklist, same two). `hooks/scripts/guard-harvest-before-delete.sh:3,35,43` guards those
two families plus `ADVISORY-*`, and names no `POSTMORTEM-*`. NG-6's new sentence is therefore an
accurate statement of shipped behaviour, not an inference.

**F-02 (v7, Low, delta/local) — RESOLVED by removal.** The inline shipped-behaviour observation
(the named directory's contents and one file's `Harvested from` row) that I asked to be relocated to
`docs/_constraints/` as a cited measured fact is deleted outright in v1.6. Nothing inherited it: the
document now carries no inline line-cited code claim, so the measured-fact relocation is moot rather
than deferred.

## 3. New issues in changed sections

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
