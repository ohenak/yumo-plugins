# Cross-Review: test-engineer — TSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 4 (upstream-cascade confirmation, not a re-review)

## Overview

This round is an **upstream-cascade confirmation**, not a re-review. TSPEC's own bytes are
unchanged since my v2 approval and my v3 confirmation (`REVIEWED-COMMIT: 4cbd5814`). What moved
this time is **FSPEC**: my v3 anchors pinned `UPSTREAM-STATE: FSPEC sha256:1c05f511…`, and FSPEC at
HEAD is `sha256:9a6be7b5…` (v1.2). REQ is unmoved — `sha256:17e83bfc…` matches the byte-state my v3
anchors recorded — so the REQ-facing half of TSPEC, which v3 confirmed in full, is untouched here.

The single question answered: **does TSPEC still hold as approved against FSPEC v1.2?**

The FSPEC delta, read from `git diff 1dc235e0..HEAD -- docs/pdlc-wave-resume/FSPEC-pdlc-wave-resume.md`,
is five hunks and three substantive items:

| # | Hunk | Change |
|---|------|--------|
| 1 | header `Version` cell + §1 | `1.1` → `1.2`; "derives entirely from `REQ-pdlc-wave-resume.md` v1.5" → **v1.7** |
| 2 | §3.4, new paragraph | **"An operator-pointed run records exactly as any other run does."** Recording follows what the run committed, not how the start point was chosen; same high-water form counted from the plan's first wave; a later automatic invocation can therefore resume above operator-asserted waves; bounded by BR-10; attributable because the run announced provenance `operator-set` (BR-07); **"No record content distinguishes the two provenances."** |
| 3 | §7 OB-F1 | the trailing clause "Raised as an erratum against the REQ, whose §10 records BL-04 as *discharged at FSPEC authoring*" → "…which now records BL-04 as **open and unmet** in §5 and §10 (v1.7)" |
| 4 | §7 amendment history | new "Erratum, v1.2 (Phase T)" paragraph naming the three items above |

**All three items are ones this TSPEC itself raised** — §6.3 items 1, 2 and 3, in that order. As at
v3, the upstream did not move away from the document; it moved *toward* it, adopting TSPEC's
diagnosis in each case. My verification is nevertheless the full DEC-ERR-03 one: I re-read the
FSPEC text TSPEC leans on at v1.2 and asked whether TSPEC is still a faithful compression of it,
not merely whether the three items landed.

Outcome, stated up front: **TSPEC still holds.** No High. One Medium and three Low.

The Medium is the one thing item-landing alone would have missed, and it is the reason this
confirmation is not a formality. FSPEC §3.4 has gone from *silent* on operator-pointed recording to
*specifying* it — and a newly specified observable behaviour arrived **without an FSPEC AT**, so
TSPEC's AT-keyed test map (§5.4) has no home for it and no oracle discriminates it. TSPEC's §2.5
already ratifies exactly the behaviour FSPEC now states, so this is a missing conjunct on an
existing test, not a design divergence. The three Lows are bookkeeping lag in §2.5/§6.2/§6.3, where
TSPEC narrates upstream defects this round (and the previous one) fixed.

## Architecture

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
