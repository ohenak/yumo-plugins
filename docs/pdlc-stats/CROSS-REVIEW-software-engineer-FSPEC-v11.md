# Cross-Review: software-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.7, bytes unchanged)
**Upstream re-pinned:** `docs/pdlc-stats/REQ-pdlc-stats.md` (v1.7, sha256:f75c348f…)
**Date:** 2026-08-31
**Iteration:** 11 (upstream-cascade confirmation — FSPEC bytes unchanged, REQ moved)

## Overview

My v10 approved this FSPEC at bytes `sha256:c7d2c832…`, pinning REQ `sha256:5f3e8051…`
(commit `1847dd9c0`, REQ v1.6). That pin is stale: the erratum commit `e12b78fd8` (REQ v1.7)
edited the REQ after my approval was recorded. This confirmation answers one question — does the
FSPEC still hold against the REQ as it now stands — and does not re-review the FSPEC, whose own
bytes did not move.

The delta is small and single-purpose. `git diff 1847dd9c0..e12b78fd8 -- docs/pdlc-stats/REQ-pdlc-stats.md`
is **12 insertions / 3 deletions across two sites**: the header changelog gains a v1.7 erratum
paragraph, and REQ-STATS-06's closing paragraph replaces one clause. Nothing else in the REQ moved —
no acceptance criterion, constraint, non-goal or risk row outside REQ-STATS-06.

The one clause that moved is load-bearing for this FSPEC, and it moved **toward** it. Under the
pinned REQ v1.6, a grammatical-but-out-of-catalogue `CROSS-REVIEW-` basename "survives even though
REQ-STATS-03 reports it malformed" — a *survivor*, which keeps its family non-absent and so blocks
`harvested`. Under v1.7 that clause is withdrawn: such a basename "contributes no process bytes and
counts as no file of its family remaining", so a feature whose only `CROSS-REVIEW-` basenames are of
that shape reports **harvested**.

That reversal is the direction this FSPEC already specified. BR-16 and AT-17 have stated the
non-survivor reading since v1.4; the pinned REQ v1.6 contradicted them, and v1.7 removes the
contradiction by adopting the FSPEC's reading. So the cascade **closes** an upstream/downstream
divergence rather than opening one. I checked each FSPEC site that leans on the moved clause below,
and re-verified the repository claim BR-16 cites at HEAD rather than trusting my own v10 arithmetic,
because the survivor question is exactly what that arithmetic turned on.

## Linked Requirements

## Behavioral Flow

## Business Rules

## Edge Cases and Error Scenarios

## Acceptance Tests

## Open Questions

## Delta-Confirmation Findings

## Findings

## Positive Observations

## Recommendation

## Verdict
