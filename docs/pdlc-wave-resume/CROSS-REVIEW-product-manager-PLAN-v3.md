# Cross-Review: product-manager — PLAN (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md` (Version 1.1, bytes unchanged since approval)
**Date:** 2026-08-21
**Iteration:** 3 (upstream-cascade confirmation, not a re-review)
**Scope:** Product lens only — does PLAN still hold as approved against TSPEC as it now stands?

## Overview

This is a cascade confirmation, not a review round. My approval of PLAN v1.1 was recorded at
`REVIEWED-COMMIT: b8ddcc56` with `APPROVAL-HASH: sha256:5f5b50db…`. PLAN's bytes today hash to
`sha256:5f5b50db3bd447e661daeceb63a450ef07c23507293e267adde6168b14df1c85` — identical, so nothing in
the document itself has moved. What moved is TSPEC: my approval carried
`UPSTREAM-STATE: TSPEC sha256:458e9ec6…`, and TSPEC at HEAD is `sha256:5ed76227…`. The single
question is whether PLAN is still a faithful compression of TSPEC as TSPEC now reads.

**The erratum that landed is the one my own approval routed upstream.** My v2 trailer emitted an
`ERRATUM: TSPEC` on §5.8: the coverage floor was specified there as an obligation of "the last
implementation **wave's** `postWaveCommand`", which is not expressible on a config surface TSPEC
V-13 itself closes at four keys with a single *global* `postWaveCommand`. PLAN had already declined
to implement the unimplementable reading — §3.4 and RK-2 assign the floor to **T-10**, the last
implementation task — and said so openly rather than quietly re-specifying. TSPEC v1.3 now says
exactly what PLAN does: §5.8 and RT-7 both read "the last implementation **task** (PLAN T-10,
RK-2)".

**Direction of travel: the gap closed toward PLAN, not away from it.** Product-substantively, PLAN
is *more* faithful to TSPEC at HEAD than it was to TSPEC at approval time. No requirement changed,
no acceptance criterion moved, no scope was added or dropped, and no task assignment in PLAN is
invalidated. T-10 still runs `npm run test:coverage` from `pdlc/workflows` with
`--per-file --branches 85` and still reports the measured per-file branch number; that is now the
upstream instruction verbatim rather than a documented deviation from it.

**What remains is narrower and it is real.** PLAN describes upstream in two places in the past
tense of a disagreement that no longer exists — §3.4's `Coverage floor` row speaks of "the erratum
this dispatch raises", and RK-2 says "TSPEC §5.8 asks for it as the last wave's `postWaveCommand`
… the difference from TSPEC's wording is raised as an erratum". Both sentences now assert that
upstream says something upstream does not say. Neither changes what gets built, which is why both
are Low; but under DEC-ERR-03 a citation that no longer matches upstream at HEAD is a finding of
this confirmation regardless, and both are cheap one-line corrections in the same edit.

## Batches

*(pending)*

## Dependencies

*(pending)*

## Verification

*(pending)*

## Delta-Confirmation Findings

*(pending)*

## Verdict

*(pending)*
