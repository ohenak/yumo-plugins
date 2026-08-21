# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md (v0.8)
**Date:** 2026-08-21
**Iteration:** 11 (delta confirmation — P-A-7 case-B terminus erratum)

## Overview

**Question asked:** a targeted erratum edit (v0.7 → v0.8) re-scopes P-A-7's case table — case B is
bounded to batches 9–12, a new **case C** governs the post-batch-13 world that is live at HEAD, case
A's "before batch 7" window is derived rather than asserted, and the closing "no row of their own"
sentence is scoped to this follow-up commit. Does that delta resolve the six routed raises without
breaking anything I approved at v10?

**Answer:** yes. The terminus gap is closed by a ruling, not by a re-wording — case C replaces the
missing greening batch with the gate itself (*the ledger stays empty and the amendment must be green
at the commit that lands it*), and it discharges the burden that ruling takes on by showing the
production half is already shipped. I verified that claim against HEAD source rather than accepting
it: it is true. My open Q-02 from v10 is answered in the affirmative and in writing. **No High
finding, no Medium. Three Lows. Approved with minor changes.**

**Delta shape.** `git diff 1f0dbe37..HEAD` on the PLAN is three hunks and nothing else: the version
row (`0.7` → `0.8`), the P-A-7 case table plus the paragraph that closes it, and one appended
changelog row. The batches-7–13 ledger, the 23 task rows, the `Deps` edges, the file-ownership
manifest and every traceability table are untouched — I diffed the file and no hunk reaches them, so
the changelog's closing "the batches 7–13 ledger is byte-identical" is true as written.

**Upstream re-derived at HEAD, per DEC-ERR-03.** All four dispatch digests reproduce exactly —
REQ `ff605dd3…`, FSPEC `ae75fa62…`, TSPEC `22dee8ce…`, DECISIONS `56617f5a…`. No upstream moved under
this document during the round, so every citation this PLAN leans on is being read at the version it
was written against. The specific upstream text case C now leans on — FSPEC's F-O-1 (both
heading-recognition rules, assigned to TSPEC) and TSPEC §D.3's second rule (exactly two `#`, optional
ordinal stripped and discarded, optional trailing gloss, otherwise exact case-sensitive comparison
against `BR6_SECTION_NAMES`) — I re-read in full at HEAD. The PLAN's compression of it is faithful,
clause for clause, including the `###`-is-body-text consequence.

## Batches

**No task row moved, and the delta could not have moved one.** The edit does not touch §Batches at
all — the three hunks land in the header table, §Verification's P-A-7 block, and §Changelog. I
extracted the `Batch`, `Deps`, owner and file columns for all 23 rows at `1f0dbe37` and at HEAD and
compared: identical. Everything I approved about the ladder at v10 stands untouched.

**The one §Batches fact case C now depends on, checked.** Case C's ruling rests on the claim that
*batch 14 is LI-22's REFACTOR-and-close, which adds no assertions*. LI-22's row says exactly that in
its own words — "region tidy-up with no behaviour change. **No new assertions, no new files**" —
so case C is not asserting something about the ladder that the ladder does not say. That matters
more than it looks: it is the whole reason no greening batch remains, and therefore the reason the
ruling has to be *green-at-landing* rather than a ledger span. The premise and the conclusion are
consistent, and both are checkable from this document.

**LI-08's amendment note still points at the right place.** The note (task row LI-08) routes the
reader to §The three gate wordings under **Amendment commits on landed suites** for the expected-red
rows the follow-up commit owes. That pointer is unchanged and still resolves — the block it names is
the block this round edited, and it now carries three cases instead of two, so the pointer's target
got strictly more complete without the pointer needing to move. Nothing in LI-08's row asserts a
two-case table, so the delta introduced no stale count there. I checked the same for LI-02 and LI-16:
neither names a case letter, so neither went stale.

## Dependencies

_(pending)_

## Verification

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_

## Delta-Confirmation Findings

_(pending)_

## Verdict

_(pending)_
