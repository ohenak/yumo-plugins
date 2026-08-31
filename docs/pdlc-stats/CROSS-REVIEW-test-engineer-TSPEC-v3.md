# Cross-Review: test-engineer — TSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/TSPEC-pdlc-stats.md` (v1.1, bytes unchanged since approval)
**Upstream at HEAD:** `docs/pdlc-stats/REQ-pdlc-stats.md` (v1.4, sha256:60a516fb…f1c9),
`docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.4, sha256:0b8864d6…17b0)
**Date:** 2026-08-31
**Iteration:** 3 (cascade confirmation, not a re-review)

## Summary

The question this round answers is narrow: the TSPEC's own bytes have not moved, but the FSPEC it
compresses was edited after approval (REQ v1.3/v1.4 → FSPEC v1.4, commits `ef7a2a64a`…`6e7985d14`),
so the version I approved no longer exists. I re-read the upstream delta and every TSPEC passage
that leans on it.

**Behaviourally the TSPEC still holds — textually it no longer does.** The erratum round landed, in
the upstream documents, exactly the readings §4.3 had already chosen and routed as errata:

| Upstream change at HEAD | What TSPEC §4.3 already decided | Agreement |
|---|---|---|
| REQ-STATS-06 + FSPEC BR-16 now state the harvested test over BR-14's `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md` / `CODE_REVIEW-{feature}-v{N}.md` grammars, evaluated over "exactly the file set BR-14's numerator sums" | `crossReviews = basenames.filter(b => parsers.parseReviewFilename(b).ok)`; harvested asked over the same membership that supplies the numerator | exact |
| FSPEC BR-11 now scopes the DoD harvested test to `CODE_REVIEW-{feature}-v{N}.md`, and says a `-draft` suffix or another feature's name "neither raises the number nor suppresses `harvested`" | `n = deriveDodRoundIndex(...) - 1; if (n > 0) measured else if (harvested) harvested else measured 0`, feature name escaped before matching | exact |
| FSPEC BR-25 now names `docs/completed/QUEUE-HISTORY-rows-0-1.md` as a third loose file | §4.4's `isDirectory`-only discovery; the file was already dropped by the filter | exact |

No computation, no state token, no exit code and no key set changes. The divergence the TSPEC was
managing has been resolved *in the TSPEC's favour*, which is the good outcome — but it leaves the
document asserting, as fact, upstream wording that has been deleted, and re-raising three errata
that are now closed. That is a fidelity break in the sections the delta touched, and it is what F-01
and F-02 are about; F-03 is an inherited oracle weakness the new AT-17 leg makes newly repairable.

## Design

_pending_

## Seams

_pending_

## Data structures

_pending_

## Verification

_pending_

## Risks

_pending_

## Recommendation

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
