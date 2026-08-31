# Cross-Review: software-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.3, bytes unchanged since v4 approval)
**Upstream changed:** `docs/pdlc-stats/REQ-pdlc-stats.md` v1.3 (`50dffe8c8`, erratum round 2)
**Date:** 2026-08-31
**Iteration:** 5 (upstream-cascade confirmation, not a re-review)

## Overview

This is an upstream-cascade confirmation, not a re-review. The FSPEC's own bytes have not
changed since the v4 approval (`REVIEWED-COMMIT: 32a23e013`). The REQ it pins moved once, at
`50dffe8c8` — "REQ v1.3 — erratum round 2, nine targeted wording fixes" — after that approval was
recorded, so the REQ version the approval was taken against no longer exists.

The one question answered here: **does the FSPEC still hold against the REQ as it now stands?**

Method: re-read the v4 cross-review, ran `git show 50dffe8c8 -- docs/pdlc-stats/REQ-pdlc-stats.md`,
then re-read the current text of every REQ passage the FSPEC leans on — not just the changed
hunks — and asked whether the FSPEC is still a faithful compression of it.

Headline: the REQ erratum round landed, in one commit, **all seven** errata the FSPEC's §7.3 had
raised against it. Six of the seven landed in exactly the direction the FSPEC had decided, so the
behavioral spine is now *more* aligned than at approval time. The seventh did not: REQ-STATS-04's
harvested predicate was narrowed to the version grammar, while BR-11 still states it over the bare
`CODE_REVIEW-*` prefix, and the two now disagree on an observable output. That is the one High.

The remainder is staleness of a specific kind: §7.3, and the in-place erratum notices at BR-06,
BR-27 and EC-09, quote upstream wording that no longer exists and assert a disagreement that has
since been resolved. Those citations are wrong as of HEAD even though no behavior turns on them,
which is precisely what this confirmation is for (DEC-ERR-03).

## Linked Requirements

_pending_

## Behavioral Flow

_pending_

## Business Rules

_pending_

## Edge Cases and Error Scenarios

_pending_

## Acceptance Tests

_pending_

## Delta-Confirmation Findings

_pending_

## Open Questions

_pending_

## Recommendation

_pending_

## Verdict

_pending_
