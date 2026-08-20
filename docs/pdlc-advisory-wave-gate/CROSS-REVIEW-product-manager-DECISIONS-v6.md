# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md (v1.4)
**Upstream re-read:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.10, HEAD)
**Date:** 2026-08-19
**Iteration:** 6 (delta re-review)

## Scope

Delta re-review of the single v5 finding (F-01, High) and the two Low findings, against the one
commit that landed them: `ff07bc84` "docs(decisions): re-derive both literal enumerations from
HEAD (v5 findings)". Taken from `git diff 082be248 HEAD` on the document — 56 insertions, 30
deletions, all inside the "Consequences / sizing" bullet block (lines 348–411). The four decisions
(DEC-A6-01 … DEC-A6-04) are byte-identical to the round I approved on substance; I did not
re-litigate them.

I re-read my v5 cross-review first, then re-derived every repository claim the changed block makes
against HEAD: both literal enumerations by grep, the five envelope transcriptions read in context
to test the new "none of these is an oracle" claim, `advisoryConfig.test.js`'s use of its own
`ADVISORY_DEFAULTS`, and TSPEC §1.3's drift table. Where the document asserts a test is or is not
red today, I ran the suite rather than reasoning about it.

All three v5 findings are resolved, including the blocking one: the seam enumeration is now
re-derived and set-equal to HEAD. What blocks this round is new: the round's own new material —
the "only one oracle" bullet and the already-migrated bullet — asserts that
`advisoryConfig.test.js`'s six-member envelope "is never compared to anything" and that
`advisoryEnvelope.test.js` carries the only envelope oracle that fails on drift. Both are false at
HEAD, and measurably so: `PROP-CFG-02` deep-equals that literal against production output and is
red today on `E-5`/`E-6`.

## Verification performed (measured at HEAD)

## Resolution of v5 findings

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
