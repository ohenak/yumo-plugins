# Cross-Review: product-manager — PLAN (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md` (Version 1.1, bytes unchanged since approval)
**Date:** 2026-08-23
**Iteration:** 4 (upstream-cascade confirmation, not a re-review)
**Scope:** Product lens only — does PLAN still hold as approved against TSPEC as it now stands?

## Overview

This is a cascade confirmation, not a review round. My v3 approval of PLAN v1.1 was recorded with
`REVIEWED-COMMIT: 485d62fa` and `APPROVAL-HASH: sha256:5f5b50db…`. PLAN's bytes today hash
`sha256:5f5b50db3bd447e661daeceb63a450ef07c23507293e267adde6168b14df1c85` — identical. Nothing in
the document itself moved. What moved is TSPEC: my v3 approval carried
`UPSTREAM-STATE: TSPEC sha256:5ed76227…`, and TSPEC at HEAD is `sha256:4b5f7f5b…`. REQ, FSPEC and
DECISIONS re-hash to exactly the three anchors v3 recorded, so TSPEC is the only upstream that
cascaded.

The single question: is PLAN still a faithful compression of TSPEC as TSPEC now reads?

**The answer this round is different from last round's.** TSPEC's round-5 erratum is larger than
round 4's: 68 insertions / 37 deletions across eight locations, and — unlike round 4, which only
re-worded an obligation PLAN already discharged — **two of those locations add obligations that did
not exist when I approved PLAN**. §5.4 AT-05 gains a write-side conjunct, and §5.5 grows from four
mutations to **five**, the fifth existing precisely to give that conjunct teeth. PLAN's §4.3 is a
transcription of TSPEC §5.5 as a *closed set of four*, with an owning task per row, an execution
step in T-07, a risk-register commitment in RK-1 and a DoD checkbox in §4.5. The fifth mutation
lands in none of them.

That is not a stale citation of the kind v3 filed as Low. It is a unit of work that upstream now
requires and this PLAN does not schedule — and PLAN is the document whose entire job is to leave no
upstream obligation without an owner. It is a High finding, tagged `delta`, and it is why this
confirmation does not approve.

The rest of the edit is clean, and much of it is clean because PLAN was already *ahead* of it:
§5.7's newly pinned `numRuns: 500` is the figure PLAN T-08 has pinned since v1.1, and §5.8's
four-entry `c8.include` correction lands in a place PLAN never enumerated. Detail below.

## Batches

_(pending)_

## Dependencies

_(pending)_

## Verification

_(pending)_

## Delta-Confirmation Findings

_(pending)_

## Verdict

_(pending)_
