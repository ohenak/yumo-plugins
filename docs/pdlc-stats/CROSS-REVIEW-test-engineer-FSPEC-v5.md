# Cross-Review: test-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (bytes unchanged since v4 approval, commit `32a23e013`)
**Upstream changed:** `docs/pdlc-stats/REQ-pdlc-stats.md` v1.3 (sha256:c4588c8b08d3138b1d2498adda75aa9896f5cd3dee9eb8ed4d1b7c5d92376126), erratum round 2, commit `50dffe8c8`
**Date:** 2026-08-31
**Iteration:** 5 (cascade confirmation, not a re-review)
**Previous review:** `CROSS-REVIEW-test-engineer-FSPEC-v4.md` — *Approved with minor changes* (0 High, 2 Medium, 2 Low)

## Overview

This is an **upstream-cascade confirmation**, not a re-review. The FSPEC's own bytes have not moved
since the v4 approval (`REVIEWED-COMMIT: 32a23e013`). What moved is the REQ: the erratum round in
commit `50dffe8c8` landed nine targeted wording fixes, so the REQ version my approval was taken
against (sha256:71ecf5574…, recorded in v4's `UPSTREAM-STATE`) no longer exists. The single question
asked and answered here is whether the FSPEC is still a faithful compression of REQ v1.3 **as it now
stands**.

The erratum's direction is worth stating first, because it changes what "faithful" means for this
pair. Seven of the nine fixes are the REQ *accepting the FSPEC's decisions* — §7.3 raised seven
errata and the REQ resolved all seven, in the FSPEC's favour every time: C-5 now carves out
post-mortem phase discovery, REQ-STATS-03 now blesses the malformed label for
`CROSS-REVIEW-{role}-REVIEW-v{N}.md`, REQ-STATS-09 now carves out the `docs/`-root case,
REQ-STATS-07 now restricts gaps to unreadability and calls an empty directory a zero-state row,
REQ-STATS-06 now states the at-least-one-family predicate, REQ-STATS-02 now attributes the states
correctly, REQ-STATS-08 regains its separators. Convergence, not contradiction — the two documents
now agree on behaviour on every path the FSPEC decided differently and said so.

That makes the confirmation mostly clean, and the residue is exactly the class this cascade check
exists to catch. Two things did not survive the move:

1. **One rule that was deliberately left literal now diverges.** REQ-STATS-04's harvested predicate
   was rewritten from the bare `CODE_REVIEW-*` prefix to the `CODE_REVIEW-{feature}-v{N}.md` version
   grammar. BR-11 still reads the bare prefix. §7.3 justified that literalism with the sentence
   "this FSPEC introduces no divergence, and the erratum stays with the REQ" — the erratum has now
   left, and the divergence it predicted is what remains. No AT covers the discriminating fixture.
   That is F-01, and it is the only gating item.
2. **A body of in-rule prose now describes a disagreement that no longer exists.** EC-09, D-8, D-9,
   BR-27 and all of §7.3 characterise upstream text in the past tense of the pre-erratum REQ
   ("that departs from REQ-STATS-09's *Given*", "a defect of the upstream criterion", "the wording
   is raised as an erratum"). Those sentences cite upstream that no longer says what they say it
   says. No oracle turns on them, so they are Medium and Low — but a TSPEC author reading them will
   believe REQ and FSPEC disagree on a P1 path when they now agree.

Everything else I checked holds. Scope note per my role: I confirmed testability and traceability of
the changed upstream against the FSPEC's rules and ATs. I did not re-open settled design, and I did
not re-read sections no changed REQ sentence reaches.

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

## Open Questions

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
