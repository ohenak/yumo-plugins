# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md (v1.8, bytes unchanged)
**Upstream re-measured:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (sha256:1531143c…)
**Date:** 2026-08-19
**Iteration:** 10 (upstream-cascade confirmation)

## Context

DECISIONS was approved at round 9 against `REVIEWED-COMMIT: 9a1934db` with
`UPSTREAM-STATE: TSPEC sha256:4a092e85…`. Its own bytes have not moved since (`d0b7d308`, v1.8 —
the relocation of the sizing block into `SIZING-pdlc-advisory-wave-gate.md`). What moved is TSPEC:
commit `1f2a4fbf` ("size PROP-SWEEP-2(b) residue in 1.3 and route it to PLAN (Phase P erratum)"),
+18/−1, which takes TSPEC to sha256:1531143c… . REQ (sha256:817b6745…) and FSPEC
(sha256:82f74a2d…) are byte-identical to the anchors on my v9, so only the TSPEC edge needs
re-measuring.

The edit does two things, both inside §1.3 ("What is deliberately not additive") and its changelog
mirror:

1. The v1.10 changelog paragraph gains a `**Phase-P erratum (this dispatch):**` sentence recording
   that §1.3's repository-hygiene note had sized the `e3b9d5a3` residue as the tracked
   `.pdlc-backups/*.bak` blobs alone, which under-states it and names no owner.
2. §1.3 gains a new paragraph, *"Sizing the hygiene residue, and where it is owned"*, stating
   `PROP-SWEEP-2(b)`'s measured residual as **28 tracked paths in three classes** at PLAN's dated
   2026-08-19 measurement — 14 `.bak` blobs, four consumer-runtime artifacts, and this feature's own
   tracked documents — of which untracking the `.bak` class closes 14; and routing the partition,
   the owners and the figures to **PLAN's Overview HEAD-drift note and A6-00's Edit 1**.

No design claim moves, and the sentence DECISIONS actually leans on is untouched in substance: the
choice of remedy for the early-landed transcription "is PLAN's and Phase I's to make, not this
document's".

The single question for this round: is DECISIONS still a faithful compression of TSPEC as it now
stands?

## Options Considered

## Decision

## Consequences

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
