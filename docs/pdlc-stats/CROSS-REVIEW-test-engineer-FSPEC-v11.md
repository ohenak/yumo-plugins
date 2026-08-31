# Cross-Review: test-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.7, bytes unchanged)
**Upstream:** `docs/pdlc-stats/REQ-pdlc-stats.md` (v1.7, sha256:f75c348f…8862)
**Date:** 2026-08-31
**Iteration:** 11 (upstream-cascade confirmation — REQ moved, FSPEC did not)
**Scope:** Local

## Overview

FSPEC's own bytes did not move this round. The question is narrow: does FSPEC v1.7 still faithfully
compress REQ as REQ now stands, after the v1.7 erratum
(`git show e12b78fd8 -- docs/pdlc-stats/REQ-pdlc-stats.md`, 12 insertions / 3 deletions)?

My v10 approval was recorded against REQ sha256:5f3e805…ed9f8, which is REQ **v1.6**
(`git show 1847dd9c0:docs/pdlc-stats/REQ-pdlc-stats.md | shasum -a 256`), not the v1.4 the FSPEC
header still names. So the REQ movement this confirmation must absorb is exactly v1.6 → v1.7 and
nothing earlier: the v1.5/v1.6 halt-state churn (REQ-STATS-05 harvested → `0`) was already inside
the base I approved.

The v1.7 edit touches two sites: the status block (1.6 → 1.7 plus an erratum paragraph) and one
sentence inside REQ-STATS-06. The sentence withdrawn read *"The predicate is set-membership over
C-4's grammars, so a grammatical basename outside the driver's document-type catalogue is a survivor
even where REQ-STATS-03 reports it malformed."* The sentence that replaced it says such a basename
"contributes no process bytes and counts as no file of its family remaining: a feature whose only
`CROSS-REVIEW-` basenames are of that shape reports **harvested**, not a measured ratio."

That is the direction FSPEC already took. The erratum moved REQ **toward** the approved FSPEC, not
away from it, so the cascade risk here is the inverse of the usual one: not "FSPEC now overclaims"
but "FSPEC may now be redundant or under-cited". I checked for both.

## Linked Requirements

REQ-STATS-06 is the only acceptance criterion whose text changed, and §3.1's trace row maps it to
§4.2 BR-14, BR-15, BR-16 and to AT-15, AT-16, AT-17. Those four anchors are the whole blast radius;
I re-read each against current REQ bytes rather than against my v10 notes.

| Upstream (REQ v1.7) | FSPEC anchor | Still faithful? |
|---|---|---|
| REQ-STATS-06 harvested predicate (LEARNINGS + one review family entirely absent) | BR-16 sentence 1 | Yes — unchanged by the erratum |
| REQ-STATS-06 "evaluated over exactly the file set whose bytes the process side sums" | BR-16 sentence 2 | Yes — near-verbatim |
| REQ-STATS-06 out-of-catalogue basename ⇒ no file of its family remaining ⇒ **harvested** | BR-16 sentence 3, AT-17 leg 4 | Yes — this is the clause the erratum aligned to |
| REQ-STATS-06 zero spec bytes ⇒ not-available | BR-15, EC-12 | Yes — untouched upstream |
| REQ C-5 fidelity (no independent parsing rule) | BR-06, D-8, §7.3 E-3 | Yes — C-5 §4 line 121 unchanged |
| REQ-STATS-03 malformed disposition of `CROSS-REVIEW-{role}-REVIEW-v{N}.md` | BR-06, AT-09 | Yes — REQ-STATS-03 still names those basenames and settles one label |

No FSPEC anchor cites a REQ clause the erratum deleted. The withdrawn "survivor" sentence was never
quoted or leaned on anywhere in FSPEC — I grepped the document for `survivor` and it does not occur.
That is what makes this a clean cascade: FSPEC never encoded the clause that was withdrawn, so its
withdrawal removes a contradiction rather than a foundation.

## Behavioral Flow

## Business Rules

## Edge Cases and Error Scenarios

## Acceptance Tests

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
