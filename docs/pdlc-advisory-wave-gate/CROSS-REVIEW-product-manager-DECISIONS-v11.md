# Cross-Review: product-manager — DECISIONS (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md (v1.9, commit `8a44b84b`)
**Upstream re-measured:** REQ `sha256:817b6745…`, FSPEC `sha256:82f74a2d…`, TSPEC `sha256:1531143c…`
**Date:** 2026-08-19
**Iteration:** 11 (delta confirmation; routed items reported ABSORBED)

## Context

Round 10 approved this DECISIONS at v1.8 against TSPEC `sha256:1531143c…` (anchors:
`REVIEWED-COMMIT: 153babdb`, `UPSTREAM-STATE: TSPEC sha256:1531143c…`), with one Low finding
(F-01) owned by TSPEC's version-label discipline and no edit owed here. The dispatch for this
round reports every routed item **ABSORBED against upstream HEAD**, i.e. nothing to land.

One commit has touched this document since that approval: `8a44b84b`, "v1.9 drop relocated
integer, record round-9 erratum re-grounding (TE v9 F-01)", +20/−3. Its whole surface is three
edits, all in the front matter:

1. The status row moves `1.8 → 1.9`.
2. The Cross-Reviews cell appends `CROSS-REVIEW-product-manager-DECISIONS-v9.md` and
   `CROSS-REVIEW-test-engineer-DECISIONS-v9.md`.
3. A new `**On v1.9 (Phase-P erratum round, TE v9 F-01).**` paragraph is added below the v1.8
   note, and the v1.8 note's quoted bullet loses its integer: *"the \"twelve already-migrated
   sites\" bullet"* → *"the already-migrated-sites bullet"*.

No `## Context`, `## Options Considered`, `## Decision` or `## Consequences` byte of the decision
record itself moved; `DEC-A6-01`…`DEC-A6-04` remain byte-frozen, as they have been since v1.5.

Upstream at this dispatch is byte-identical to what round 10 measured — I re-hashed all three
files at HEAD and REQ `817b6745…`, FSPEC `82f74a2d…` and TSPEC `1531143c…` match the dispatch
hashes exactly. So the DEC-ERR-03 obligation this round is narrow but real: the delta is the only
new surface, and the question is whether v1.9's new paragraph — which makes several *claims about
upstream* — is a faithful compression of TSPEC at HEAD, not merely a plausible one.

## Options Considered

Three readings of the delta were open before I checked bytes; two are falsified, one holds.

**(a) The delta is cosmetic — a version bump and a bookkeeping cell — so confirmation is a
formality.** Rejected. The new v1.9 paragraph asserts four checkable things about upstream: that
REQ and FSPEC are unchanged from v1.8's authoring state; that TSPEC moved `4a092e85…` →
`1531143c…` *within* v1.10; that TSPEC's added text sizes `PROP-SWEEP-2(b)`'s residue in §1.3 and
routes its partition, owners and figures to PLAN's Overview HEAD-drift note and A6-00's Edit 1;
and that DECISIONS carries no hygiene note, no sweep figure and no residue disposition. Every one
is falsifiable, so each was checked rather than read.

**(b) Dropping the integer breaks the v1.8 note's account of what moved.** Rejected on bytes. The
sentence now reads "the already-migrated-sites bullet is folded into column (2) as one enumeration
read two ways". `SIZING-pdlc-advisory-wave-gate.md` line 83 titles that column *"sites already at
the post-A6 value: **twelve**, of which **ten** are oracles red at HEAD and **two** are green
inputs"* — the subject-named bullet resolves to exactly one column there, unambiguously, and the
appendix's own v1.0 changelog row still quotes the old bullet by name including its integer. The
move is fully reconstructible from the pointer; the cardinality was doing no work in the sentence.
Dropping it is a strict improvement, because the integer was a HEAD measurement sitting in the one
document whose stated purpose is to hold none.

**(c) Re-carrying upstream hashes in DECISIONS prose re-imports the short-shelf-life problem
POSTMORTEM-D §6 exists to prevent.** Rejected, and worth stating why, because the shapes look
alike. A content hash is not a measurement of the tree that drifts silently: it is a *self-dating
citation anchor*, which is exactly what POSTMORTEM-D §6 step 1 asks a document to carry in place of
a total. A stale hash announces its own staleness on the next re-grounding; a stale integer does
not. This is the same distinction that made v1.8's relocation the right call, applied in the other
direction.

## Decision

*(pending)*

## Consequences

*(pending)*

## Findings

*(pending)*

## Questions

*(pending)*

## Positive Observations

*(pending)*

## Recommendation

*(pending)*
