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

Three readings of the cascade were available, and I measured rather than assumed which applies.

**(a) The edit lands entirely in prose DECISIONS never cites — confirmation is a formality.**
Rejected as an assumption: DECISIONS does cite §1.3 by name. Line 333 reads *"TSPEC §5.1's status
caveat and §1.3 are the carriers of repo state for this feature, and whether the early-landed edits
are reverted or PLAN's batches are re-derived around them is PLAN's call."* That sentence points
straight into the edited section, so the edge had to be re-read at HEAD, not waved through.

**(b) The edit re-homes repo-state ownership away from §1.3 to PLAN, falsifying DECISIONS' "§1.3 is
a carrier" clause.** Checked and rejected on the bytes. The new paragraph says TSPEC "states the
size only so that no reader of this paragraph mistakes the `.bak` blobs for the whole residue" —
it *adds* repo-state to §1.3, and defers only the **partition, owners, disposition and figures** to
PLAN. DECISIONS' clause claims §1.3 carries repo state and that the remedy choice is PLAN's. Both
halves are now more true than at v9, not less: TSPEC's own changelog sentence still ends "is PLAN's
and Phase I's to make, not this document's, and is routed there as an erratum."

**(c) The edit introduces figures that collide with figures DECISIONS still carries.** Checked and
rejected. The only number DECISIONS still states in its own bytes is column (1)'s **four**
(three production constants plus `advisoryRecord.test.js`'s five-member seam literal). TSPEC's new
figures — 28, three classes, 14 closable — are a different measurement (the retirement sweep's
tracked-path residue) on a different surface. `grep -n "28\|\b14\b\|bak\|backup"` over DECISIONS
returns exactly one hit, `FSPEC E-28`, which is a requirement id and not a count. There is no
double-carriage of the new figures, which is precisely the POSTMORTEM-D §6 step 1 discipline v1.8
adopted: DECISIONS restates none of the short-shelf-life totals.

I also re-ran the underlying oracle rather than trusting TSPEC's stated number, since DECISIONS'
credibility on this edge depends on the upstream figure being reproducible. Assembling L-2's seven
terms against `git ls-files` and subtracting A-1's frozen glob list returns **33** paths at HEAD,
not 28 — which *agrees* with TSPEC rather than contradicting it: TSPEC dates its figure to PLAN's
2026-08-19 measurement and states in the same sentence that the document class "grow[s] by one per
*committed* cross-review file". Five cross-review files have committed since. The three classes and
the 14/14 split reproduce exactly: 14 `.bak` blobs, four consumer-runtime artifacts
(`.pdlc-drift-state.json`, both `*.bundle.js`, `pdlc-cli.mjs`), and this feature's tracked documents.
`SIZING-pdlc-advisory-wave-gate.md` — the appendix DECISIONS v1.8 created and now leans on — is
**not** in the residue, because it quotes none of L-2's seven terms; TSPEC's enumeration of the
document class is therefore complete at HEAD despite not naming it.

## Decision

## Consequences

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
