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

I re-read every PROPERTIES row that cites PLAN T-10 — the only PLAN section the erratum rewrote —
and the §PLAN tasks section, against T-10's current text rather than the version I approved.

| PROPERTIES row | Cites | Still faithful to PLAN v1.4? |
|---|---|---|
| PROP-RATIO-05 | `TSPEC §2.4, §3.1; PLAN T-10` | Partly — see F-01, F-02 |
| PROP-CLI-05 | `BR-01; TSPEC §3.4; PLAN T-10/T-17` | Yes — `FLAGS_BY_COMMAND.stats` set-equality and `VALUE_FLAGS` non-membership are untouched by the erratum |
| PROP-CLI-06 | `BR-29; TSPEC §3.5; PLAN T-09/T-10` | Yes — exit-code conjunct untouched |
| PROP-DRIFT-01…-04, PROP-RO-05, PROP-NEG-07 | T-10 (via §PLAN tasks) | Yes — parser-identity, classifier purity, construction-site count and no-write capability conjuncts are verbatim unchanged across the diff |
| §PLAN tasks table | PLAN task ids and statuses | Yes, and strengthened — see Positive Observations |

**What actually changed inside T-10.** The conjunct itself is unchanged: `statsIo().fileSize`'s body
names `lstatSync`, and `bin/cli.mjs`'s whole source matches `/(?<![A-Za-z])statSync\s*\(/` zero
times, whole-file, no "in the `stats` seam" qualifier. Both the old and the new row call that matcher
**normative, not illustrative**. What moved is the *reason* the row gives for the whole-file scope.
v1.3 justified it on a baseline property — that `bin/cli.mjs` "contains neither `statSync` nor
`lstatSync` anywhere", with a raw `:262` line anchor. That baseline expired when T-17 landed. v1.4
re-grounds the justification on the matcher's two anchors instead, and adds a sentence concluding
that "comment- or string-masking of the source is **not** owed."

**Why this is good news for PROPERTIES.** PROP-RATIO-05 already justified the whole-file scope on the
anchor — "because the anchor already excludes the correct `lstatSync` and the naive
`source.includes("statSync")` could never red." PLAN v1.3's expired baseline reasoning was the
weaker of the two, and my v6 recorded it as a DEFERRED item ("PLAN T-10's stale pre-implementation
baseline note"). The erratum resolves that deferred item and moves PLAN onto the reasoning PROPERTIES
was already using. The two documents are *closer* after this edit than before it.

The residue is one clause, and it is F-01.

## Oracles

## Fixtures

## Delta-Confirmation Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
