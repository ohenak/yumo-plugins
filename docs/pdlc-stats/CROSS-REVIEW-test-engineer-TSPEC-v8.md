# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/TSPEC-pdlc-stats.md` (v1.6)
**Date:** 2026-08-31
**Iteration:** 8 (erratum round 6 — delta confirmation)
**Prior round:** `CROSS-REVIEW-test-engineer-TSPEC-v7.md` (Needs revision, v1.5 @ `7747eb78f`)

## Overview

Round 7 raised two findings: **F-01** (High, `inherited`) — §4.3 cited `REQ-STATS-06` for a scoping
REQ v1.6 had reversed, contesting AT-17's fourth-leg expected value — and **F-02** (Medium, `delta`)
— the v1.5 changelog's false attestation that REQ and FSPEC "neither moved since v1.4's grounding".

Both are discharged, and discharged in the right way.

**F-02 is corrected accurately.** The v1.6 changelog now states the movement explicitly and
correctly: v1.4 grounded on FSPEC v1.5 / REQ v1.4, HEAD carries FSPEC v1.7 / REQ v1.6. I verified
the version rows rather than the changelog's account of them — `REQ-pdlc-stats.md:3` reads `1.6`,
`FSPEC-pdlc-stats.md:16` reads `1.7`. The enumerated moves are also right: FSPEC's v1.6 BR-16
basename-shape rewrite and v1.7 count correction two → four plus the AT-15 trace row
(`FSPEC:18`–`:26`), REQ's halt withdrawal and REQ-STATS-06 rewording. The entry goes further than a
correction and names *why* the check failed — "citing a current hash is not the same check as
diffing it against the previously grounded one" — which is the durable form of the lesson.

**F-01 is resolved at this layer, which is the only place it could be resolved.** F-01 was tagged
`inherited` because the contradiction is REQ-versus-FSPEC, not a TSPEC authoring error. A derived
document cannot fix that; it can only stop misreporting it. This revision does exactly that:

- §4.3's BR-16 pin moves from "at v1.4" to **v1.7**, and the false clause "REQ-STATS-06 at v1.4
  carries the same scoping" is gone.
- The `docs/completed/pdlc-advisory-wave-gate/` citation is re-scoped to a basename *shape* rather
  than a verdict — matching FSPEC BR-16 v1.7, which says the same thing in its own words
  (`FSPEC:373`–`:375`: the directory "carries four of them **alongside** grammar-matching
  cross-reviews and so reports a measured ratio itself; only the shape is borrowed, not the verdict").
- The REQ-versus-FSPEC conflict is stated in §4.3 and carried as the second open erratum in §8.3,
  routed rather than repaired, with the sites that re-stamp when it settles named.
- The stale "Nothing on this point is routed upstream (FSPEC §7.3 records it closed)" sentence is
  removed, and §8.3's count moves "One remains open" → "**Two** remain open". I counted the bullets:
  two.

The conflict itself is still live upstream — `REQ:205`–`:206` still calls the out-of-catalogue
basename a survivor, `FSPEC:371`–`:372` still says such a directory reports `harvested`. Per the
erratum channel I do not fold that into this document's verdict; it is re-raised as an `ERRATUM: REQ`
line, since the TSPEC in front of me now handles it correctly.

**No open High remains against this document.** Two new findings, both from this round's edit and
both non-gating: a blast-radius claim about AT-15 that does not hold (Medium), and a mis-cited
section anchor repeated twice (Low). Details in Test Strategy and Open Questions.
