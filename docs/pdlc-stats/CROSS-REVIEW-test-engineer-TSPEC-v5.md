# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-stats/TSPEC-pdlc-stats.md (v1.3, erratum round 4)
**Date:** 2026-08-31
**Iteration:** 5 (delta confirmation, not a full re-review)

## Overview

Delta confirmation over the v1.3 erratum edit to `TSPEC-pdlc-stats.md` (commits `80c484a`,
`1aa4c84`, `c8345f0`, `e952268`; 73 insertions, 26 deletions, one file). Two items were routed to
this round — the §2.1 sweep-derivation overstatement (pm-review, Low) and the
`coverageInstrumentation.test.js` row's omitted P9-02 test title (te-review, Low). Both land. The
edit also carries three collateral corrections the same erratum absorbed — the nine → ten site
count with `pdlc/README.md` added, P7-02's `vendoredClassWord` arm, and the §6.4 purity split by
return type — and those are checked here for damage to previously approved material, not
re-litigated.

I re-ran the mechanical claims against HEAD rather than reading them. Every number in the edit
reproduces. Nothing previously approved is weakened; the §6.4 split strictly strengthens the
purity oracle by removing a conjunct that would have red-lined a correct implementation.

## Upstream Re-Grounding (DEC-ERR-03)

The scope of a delta confirmation is the TSPEC measured against upstream at HEAD, not the item
list. Re-grounded first:

- `REQ-pdlc-stats.md` is at **v1.4**, `FSPEC-pdlc-stats.md` at **v1.4** — exactly the versions
  v1.3's changelog claims it re-grounded on.
- `git log 11bb63b4e..HEAD -- REQ-pdlc-stats.md FSPEC-pdlc-stats.md` is **empty**: neither upstream
  document moved during the erratum window, so no upstream decision went unabsorbed and no
  `UPSTREAM-STATE` pin went stale under the edit.
- The TSPEC's own §3.2 interface block is still a transcription of the HEAD exports
  (`parseReviewFilename`, `deriveRoundWindow`, `deriveDodRoundIndex`, `parseResolvedMarker`), which
  is what the new §6.4 split leans on — verified below.

The document still derives from *this* upstream state.

## Routed Items — Verification

## Collateral Check on Untouched Approved Material

## Positive Observations

## Open Questions

## Recommendation

## Delta-Confirmation Findings

## Verdict
