# Cross-Review: software-engineer — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/PROPERTIES-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 7 (upstream-cascade confirmation — PLAN erratum round 5)
**Scope:** Local

## Overview

Upstream-cascade confirmation, not a re-review. PROPERTIES' own bytes are unchanged since my v6
approval — `sha256:02fc6fbf76cb68d3510e0cf2a58ffbb9ddcb8b75c858312ae9ce5addc72f1531`, byte-identical
to the `APPROVAL-HASH` v6 recorded. The single question in front of me: does PROPERTIES still hold
against PLAN as it now stands?

**What moved.** My v6 pinned `UPSTREAM-STATE: PLAN sha256:6ab4d081…`, which is PLAN at `e6f18c5a1`
(v1.3). PLAN at HEAD is `sha256:64d8f1c5…` (v1.4) across two commits, `5d1c6e27e` and `b8a2a3230`.
`git diff e6f18c5a1..HEAD -- docs/pdlc-stats/PLAN-pdlc-stats.md` is **+7 / −2**, confined to three
places: the version header and a new v1.4 changelog paragraph; the §Batches preamble; and the T-10
row. No batch moved, no dependency edge moved, and the File Ownership Manifest is untouched.

**A pin I have to account for before answering.** My v6 also pinned
`UPSTREAM-STATE: TSPEC sha256:7b119eb7…`, but TSPEC at HEAD is `sha256:f32d9cb5…` (v1.8). That is
not this round's edit — `git diff --stat e6f18c5a1..HEAD` over TSPEC is empty, so TSPEC moved
*before* the PLAN I approved against, and my v6 pin was already stale when the workflow stamped it
from a stale dispatch snapshot. PLAN v1.4's own changelog states this in the open and re-grounds on
it, and its characterisation checks out: TSPEC v1.8 only closes the REQ-STATS-06-versus-BR-16
erratum, moving no `BR-`, `E-` or `AC-` row and no vocabulary. REQ (`f75c348f…`) and FSPEC
(`a493133f…`) match this dispatch's pins exactly. So the TSPEC drift is real but immaterial to
PROPERTIES, and I raise no finding on it. I record it because a reader comparing my v6 pins to HEAD
would otherwise conclude two upstreams moved unremarked.

**Answer.** PROPERTIES still holds. The erratum touched exactly one thing PROPERTIES leans on — PLAN
T-10, cited by PROP-RATIO-05 and PROP-CLI-05/-06 — and it moved T-10's *justification* rather than
its content. Three Mediums below, one delta and two inherited; no High, nothing gating. The notable
result is an inversion worth stating plainly: on the one point where PLAN v1.4's new text and
PROPERTIES now disagree, I measured the shipped oracle at HEAD and **PROPERTIES is the accurate
document**. The correction is owed upstream, not here.

## Properties

## Oracles

## Fixtures

## Delta-Confirmation Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
