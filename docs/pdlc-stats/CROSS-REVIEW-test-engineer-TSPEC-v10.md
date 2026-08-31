# Cross-Review: test-engineer — TSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-stats/TSPEC-pdlc-stats.md (v1.7, own bytes unchanged)
**Upstream at HEAD:** REQ `sha256:f75c348f…` (v1.7), FSPEC `sha256:c7d2c832…` (v1.7)
**Date:** 2026-08-31
**Iteration:** 10 (upstream-cascade confirmation)

## Overview

**Question answered:** does TSPEC v1.7 still hold against REQ v1.7 at HEAD? **Yes on every oracle,
no on four citations.** The REQ erratum settled the one dispute TSPEC was routing upstream, and it
settled it *in TSPEC's favour*: no type, signature, exit code, code sketch or expected test value
moves. What does not hold is TSPEC's own narration of that dispute. Four passages still quote REQ
text that has been withdrawn, and one of them sits in `§8.3 Open erratum items`, where a discharged
obligation reads as a live one.

**What the REQ edit did** (`e12b78fd8`, 12 insertions / 3 deletions, REQ v1.6 → v1.7). REQ-STATS-06
previously read "the predicate is set-membership over C-4's grammars, so a grammatical basename
outside the driver's document-type catalogue is **a survivor** even where REQ-STATS-03 reports it
malformed". That clause is withdrawn. REQ now reads: the predicate "is evaluated over exactly the
file set whose bytes the process side sums, so a basename the driver's document-type catalogue does
not recognise … contributes no process bytes and counts as no file of its family remaining: a
feature whose only `CROSS-REVIEW-` basenames are of that shape reports **harvested**"
(`REQ-pdlc-stats.md:208-213`). Nothing else in REQ changed; I diffed the commit rather than trusting
the message.

**Why this is the good outcome for the test surface.** §4.3 wrote its sketch against FSPEC BR-16, its
immediate upstream, and said so explicitly rather than guessing. BR-16 v1.7 classes that basename as
no file remaining and the directory as `harvested`; AT-17's fourth leg asserts `harvested`. REQ v1.7
now says the same thing in the same direction. The reconciliation therefore lands on the side TSPEC
already implements — the branch order, the disjunction and every fixture expectation are untouched,
and the one acceptance test whose expected value the dispute could have flipped keeps the value TSPEC
already carries. An implementer who reads only §4.3's sketch and §7's tables will build the right
thing today.

**Why that is still not "no findings".** DEC-ERR-03 asks whether the document remains a faithful
compression of upstream *as it now stands*, not whether the routed item landed. Four passages fail
that test: §4.3's contested paragraph and §8.3's E-item assert a live REQ-versus-FSPEC conflict that
no longer exists and quote REQ wording that no longer exists; §7.2's AT-17 narration offers a
"`measured` on REQ-STATS-06 v1.6's reading" alternative that has been withdrawn; and the v1.7
changelog's grounding pin cites `REQ sha256:5f3e8051…` where HEAD is `f75c348f…`. None of these
changes an oracle, so none is High. Two of them sit where downstream phases *route* work — an open
obligation and an acceptance-test expectation flagged as re-stampable — so neither is cosmetic.

**Verdict shape:** Approved with minor changes. Two Medium, two Low, no High. TSPEC does not need to
be re-opened for a decision; it needs a re-stamp of the three sites it itself nominated (§4.3's
paragraph, its pin, AT-17's leg) plus the §8.3 closure, exactly as it promised it would when the
dispute settled.

## Architecture

_pending_

## Interfaces

_pending_

## Data Model

_pending_

## Test Strategy

_pending_

## Open Questions

_pending_

## Recommendation

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
