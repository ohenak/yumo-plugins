# Cross-Review: software-engineer — FSPEC (delta re-review)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.7)
**Upstream pinned:** `docs/pdlc-stats/REQ-pdlc-stats.md` (v1.4)
**Date:** 2026-08-31
**Iteration:** 10 (delta re-review, decision freeze)

## Overview

My v9 was **Needs revision** on one High finding: BR-16's new provenance sentence said the cited
real directory carries "two" out-of-catalogue cross-reviews where HEAD carries four, contradicting
this document's own BR-06 and AT-09. This round is `d3843cfe7` (FSPEC v1.7), and
`git diff b3bb4c5d1..HEAD -- docs/pdlc-stats/FSPEC-pdlc-stats.md` is **9 insertions / 4 deletions
across four sites** — the smallest delta this document has taken:

| Site | Change | Routed from |
|---|---|---|
| Header changelog | `1.6` → `1.7` plus a v1.7 revision paragraph | Record the round |
| §4.2 BR-16 | `carries two of them` → `carries four of them` | **my v9 F-01 (High)**, TE v9 F-01 |
| §8 BR→AT table | `BR-16 \| AT-17` → `BR-16 \| AT-15, AT-17` | TE v9 F-02 |
| §7.3 row E-5 | `BR-27, AT-19` → `BR-27, AT-20, AT-26` | TE v9 F-03 |

My blocking finding is resolved, and I re-grounded the corrected claim against the tree rather than
against the round's account of it. Under the freeze I checked the four changed sites, the claims
they make about the repository, and the enumerations those edits could have unbalanced. No business
rule body, exit code, enum token, JSON field or acceptance-test *Then* moved: the only diff line
inside a rule is the single numeral in BR-16, and no `AT-*` definition line appears in the diff at
all.

## Business Rules

## Acceptance Tests

## Edge Cases and Error Scenarios

## Open Questions

## Delta-Confirmation Findings

## Findings

## Positive Observations

## Recommendation
