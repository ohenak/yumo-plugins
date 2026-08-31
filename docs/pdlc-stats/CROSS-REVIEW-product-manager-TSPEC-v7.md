# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-stats/TSPEC-pdlc-stats.md (v1.5, erratum round 5)
**Date:** 2026-08-31
**Iteration:** 7
**Round type:** Delta confirmation (erratum)

## Overview

**Scope of this round.** A targeted erratum edit (`fb69424c3..7747eb78f`, five commits) against a
TSPEC I approved at v6. I did not re-review the document. I read the diff, verified the dispatched
item against the artefacts it claims, then — as `DEC-ERR-03` requires — re-grounded the TSPEC's
upstream citations on **REQ and FSPEC at HEAD**, not on the dispatched item list.

**The dispatched item is discharged.** The claim that §2.1 and §8/RK-1 "still list five" is itself
stale, and the v1.5 changelog says so rather than silently rewriting: §1, §2.1, §6.4, §7.3 and RK-1
all carry the sweep-derived **ten**, and §2.1's table names both sibling-feature document edits
(`docs/completed/pdlc-engine-distribution/` TSPEC §5.4 `PK-26`; that feature's FSPEC §5.2 per-class
five → six) as explicit `K-7`-owned rows. I checked the dispatch's "`K-1` derives nine" against
`DECISIONS-pdlc-stats.md` at HEAD: `K-1` says **ten** and partitions all ten across `K-1`/`K-3`/
`K-8`/`K-9`. The "nine" survives only as a superseded mention of Option A's pre-correction count.
TSPEC and DECISIONS agree. Nothing in the item list is outstanding.

**But the round does not pass.** The dispatched items are necessary, not sufficient. FSPEC moved
**v1.5 → v1.7** after the grounding TSPEC v1.4 recorded, and v1.7 rewrote the very `BR-16` passage
TSPEC §4.3 quotes as its authority — reversing the worked example's verdict. TSPEC §4.3 now
attributes to FSPEC a claim FSPEC explicitly denies, and states a falsehood about a real archive
path this feature's tests bind to. That is `F-01`, and it is **inherited**: the erratum edit did not
touch §4.3, and did not introduce the divergence. The v1.5 changelog's own attestation that upstream
"neither moved" is what let it pass unnoticed, and that claim *is* delta-introduced (`F-02`).

Both findings are recorded below with provenance and locality tags. The High is tagged `inherited`
deliberately: this is FSPEC-movement fallout that belongs back in the owning phase, not a defect the
erratum edit created, and it should route rather than halt.

## Architecture

_(pending)_

## Interfaces

_(pending)_

## Data Model

_(pending)_

## Test Strategy

_(pending)_

## Open Questions

_(pending)_

## Delta-Confirmation Findings

_(pending)_

## Positive Observations

_(pending)_
