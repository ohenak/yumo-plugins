# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.11)
**Date:** 2026-08-20
**Iteration:** 1 (delta confirmation on a previously approved TSPEC)
**Round type:** erratum delta confirmation — every routed item reported ABSORBED against upstream HEAD
**Upstream measured against (verified at dispatch):**
REQ v1.15 `sha256:c62cfc35…` · FSPEC v1.6 `sha256:91ef2557…` — both hashes recomputed on disk and matched.

## Overview

**The question this round answers.** I previously approved this TSPEC. A targeted erratum edit
(v1.11, commits `ef569269`…`95d8d2e4`) has landed. The dispatch reports every routed item ABSORBED
against upstream HEAD — nothing left to confirm on the item list — so the whole of my scope is the
second question DEC-ERR-03 puts: measured against REQ v1.15 and FSPEC v1.6 **as they now stand**, is
this TSPEC still a faithful compression of its upstream? Anything it cites that upstream no longer
says, or no longer says the same way, is a finding of this confirmation whether or not it was routed.

**What the delta is.** 67 insertions, 26 deletions, one file, and it is almost entirely a
*re-grounding* rather than a design change. REQ moved v1.9 → v1.15 and FSPEC v1.4 → v1.6 underneath
this document. In that interval upstream **decided** the one boundary this TSPEC had been holding
open: whether BR-9's restoration oracle ranges over `.gitignore`d paths. It decided it in this
document's favour. The edit's work is therefore to stop describing §2.5's mechanism as a TSPEC
narrowing pending upstream and restate it as the transcription of a settled rule — at §2.5, §3.3's
`apply` row, §5.2 (case 4, plus a new case 5), §5.5's ignored-path-only row, §5.6's AT-05-1 row, and
§6's OQ-1 / OQ-7 / OQ-9 / OQ-11. No mechanism moves.

**How I checked it.** I did not re-read the document. I diffed the erratum, then went to upstream at
HEAD and read the cited text verbatim — FSPEC BR-9, AT-05-1, AT-05-2, E-23, E-33, AT-07-2b; REQ
AC-5.1, AC-5.2, and the v1.14/v1.15 changelog entries — and compared each against the sentence in the
TSPEC that leans on it. I also recomputed both upstream hashes on disk against the ones in the
dispatch; they match, so the text I read is the text I was asked to measure against.

**The headline.** The re-grounding is sound and, unusually for a round of this kind, it is *honest in
the direction that costs the author something*: the changelog records the retired flags, records that
the reserved fallback design (a scoped ignored-path capture) is now **not built**, and records the one
routed item it declines to edit for — with the reason — rather than performing an edit to look
responsive. Every quotation I spot-checked is verbatim and in context. One Low citation-precision nit
is all I found, and it is a version pin, not a claim. Nothing is gating.

**Scope note.** Product lens only: requirements traceability, scope compliance, acceptance-criterion
fidelity. Mechanism quality, test construction and code shape belong to my SE and TE colleagues, and
I have left them there.

## Architecture

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
