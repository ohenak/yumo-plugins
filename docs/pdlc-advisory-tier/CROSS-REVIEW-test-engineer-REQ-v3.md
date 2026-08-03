# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` (v1.3)
**Date:** 2026-08-03
**Iteration:** 3
**Scope:** delta re-review of REQ-pdlc-advisory-tier v1.2 → v1.3. Closure of the v2 findings (F-14…F-20), plus a testability scan of the changed sections only. Unchanged sections already approved in v1/v2 are not re-litigated. Not product strategy, not architecture.
**Diff reviewed:** `b8ce721..b81d7d4` on `docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` (+53 / −25)

## Correction to v2

**My v2 finding F-15 was wrong on its central factual claim, and I am withdrawing that half of it.**
I reported that `main` contained "no `REBASE_STATUS` token anywhere; no `ship-pr` dispatch anywhere"
in `pdlc/workflows/orchestrate-dev.js`. Re-checked at the pinned base `26c3f1c`, both are present:

- `REBASE_STATUS: conflict` in the rebase prompt (`26c3f1c:pdlc/workflows/orchestrate-dev.js:5792`)
  and its parser `parseRebaseStatus` (`:5913`, `:5925-5927`)
- the dispatch `await _agent("ship-pr", rebasePrompt(feature))` in `rebaseOntoDefault` (`:6141`)
- the halt the §1 A4 row describes: `if (rebaseStatus === "conflict") { … throw haltError(…) }`
  (`:8160-8172`)

My earlier grep was run against the wrong ref and I did not cross-check the negative before filing —
a "X never happens at HEAD" claim of my own that I failed to hold to my own standard (the REQ/FSPEC
verification check requires a mechanism citation plus a cross-check; I had neither). The author's
v1.3 response was to re-verify row by row and pin the base to a sha, which is the correct response
and is also what makes my error cheap to catch. The stale-base half of F-15 was real and is what the
pin now addresses.

## Prior-Finding Closure

## Verification Log

## Findings

## Questions

## Positive Observations

## Recommendation
