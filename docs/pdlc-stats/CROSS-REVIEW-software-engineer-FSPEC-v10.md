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

**My v9 F-01 is resolved, and the corrected count is right against the tree.** BR-16 now reads that
`docs/completed/pdlc-advisory-wave-gate/` "carries **four** of them **alongside** grammar-matching
cross-reviews and so reports a measured ratio itself". I re-counted at HEAD rather than trusting the
fix: the directory holds exactly four files of shape `CROSS-REVIEW-{role}-REVIEW-v{N}.md` —
`CROSS-REVIEW-product-manager-REVIEW-v{1,2}.md` and `CROSS-REVIEW-test-engineer-REVIEW-v{1,2}.md` —
and all four are on `origin/main` (`git ls-tree origin/main`), not branch artifacts, so the citation
rests on stable ground. The document is now internally consistent as well: §4.2 BR-06's "Four such
files sit in `docs/completed/pdlc-advisory-wave-gate/`" and AT-09's "all four basenames appear in
the malformed list by name" agree with BR-16 rather than contradicting it. The fix went to BR-16
alone, which was the direction v9 asked for — BR-06 and AT-09 were correct and did not move.

**The load-bearing half of the sentence is unchanged and still holds.** The shape-not-verdict
distinction — borrow the malformed *basename shape* from that directory, not a `harvested` verdict
— is what TE v7 F-02 originally asked for, and it survives the count correction because the count
was never what carried it. I re-verified the predicate at HEAD: `LEARNINGS-pdlc-advisory-wave-gate.md`
is present, but neither harvest-deleted family is empty (grammar-matching cross-reviews remain in
quantity, and both `CODE_REVIEW-pdlc-advisory-wave-gate-v{1,2}.md` remain), so `harvested` is false;
all six BR-14 spec documents are present, so BR-15's `n/a` does not fire either. The directory does
report a measured ratio, exactly as the sentence says.

**No rule changed, as the changelog claims.** BR-16's predicate is byte-identical outside the
numeral: `harvested` still fires when `LEARNINGS-{feature}.md` is present and at least one
harvest-deleted process family is entirely absent, still evaluated over BR-14's numerator set,
still ordered before BR-15's zero-denominator test. The `CODE_REVIEW-{feature}-draft.md` clause and
the harvest-asymmetry rationale carry across untouched. The self-certification "three record
corrections, no rule changed" is accurate against the diff, not merely asserted by it.

## Acceptance Tests

## Edge Cases and Error Scenarios

## Open Questions

## Delta-Confirmation Findings

## Findings

## Positive Observations

## Recommendation
