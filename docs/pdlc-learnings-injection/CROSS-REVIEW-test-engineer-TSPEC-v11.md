# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 11
**Round type:** delta confirmation (erratum edit `e33425a6..bfe58851`, TSPEC v0.6 → v0.7)

## Overview

**Question answered:** does the v0.7 erratum (`e33425a6..bfe58851`) land the four routed items
without breaking what v10 approved, and is the TSPEC still a faithful compression of REQ
`sha256:ff605dd3…` (v0.9) and FSPEC `sha256:fb18dbda…` (v0.12) as they stand at this dispatch?

**Answer: yes, with minor changes.** All four routed items land, and two of them land better than
the item text asked: §D.1's non-`null` scoping is stated as a *reason* (the healthy value of a
corpus-outcome field) rather than a hedge, and it keeps the catalogue set-equality test intact
(`null` is deliberately not a catalogue member), so the domain oracle is narrowed without being made
unfalsifiable. The two stale-anchor items are repaired by symbol/shape citation per DEC-DOC-01, and
I re-verified both against HEAD: the three object-literal `dispatchKind: "authoring"` sites and the
one positional argument resolve exactly as §A.2 now describes them, and P-10's conditional spread is
the last of four trailing spreads in `buildFinalReport`'s returned literal. Beyond the item list,
the round also absorbed FSPEC v0.11/v0.12 into §A.2 and closed ERR-3 and ERR-7 — my v10 F-02, F-03
and F-04 — which I re-read against upstream and confirm as faithful.

**What did not land.** My v10 F-01 (Medium) survives the round: §T.6's AT-02 paragraph still
fixtures three run shapes plus an erratum-retry fourth, while upstream AT-02 at v0.12 enumerates a
different fourth — the authoring-classified dispatch whose target is none of C-1's six document
types, the one carrying the mutation obligation "reverting BR-1's second conjunct reds this test".
§A.2 *names* that obligation in this very round (TSPEC:174) without §T.6's fixture list acquiring
it, so the document now states the obligation in one section and omits it from the section a PLAN
author transcribes fixtures from. Non-gating, but it is the finding most likely to become a
coverage hole.

**Anchor residue.** The erratum de-anchored P-2a, P-2b, P-10, ERR-2 and §T.6's land-proof retry, and
in doing so confirmed the file has shifted ~40–140 lines since the anchors were minted. The
enumerations it did *not* de-anchor are stale in the same way — §A.2's six `converge()` `docType`
sites, §A.5's `notices` sink, P-7/P-8's seam definitions. Every underlying proposition is still true
at HEAD (I checked each by symbol), so these are citation-hygiene findings at DEC-DOC-01's Low bar,
not falsified claims.

**No High finding, so this confirmation does not halt the phase.**

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

## Positive Observations

_pending_

## Recommendation

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
