# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md`
**Date:** 2026-08-19
**Iteration:** 12 (delta confirmation on a previously approved document)

## Scope

This is a **delta confirmation**, not a re-review. TSPEC was approved at v1.10; a single targeted
erratum edit landed in commit `1f2a4fbf` (*"docs(tspec): size PROP-SWEEP-2(b) residue in 1.3 and
route it to PLAN"*). The question answered here is narrow: does the delta resolve the routed item
without breaking anything previously approved, and — per DEC-ERR-03 — does the document still
faithfully compress the upstream it leans on, read at the upstream's *current* bytes?

Routed item under confirmation: §1.3's repository-hygiene note sized the residue commit `e3b9d5a3`
left as the tracked `.claude/workflows/.pdlc-backups/*.bak` blobs alone, which under-states the
`PROP-SWEEP-2(b)` residual and names no owner for the part this branch cannot close.

The erratum is confined to two places, both prose, both in-scope:

| Site | Edit | Design claim moved? |
|---|---|---|
| Changelog, v1.10 entry | Appends a *"Phase-P erratum (this dispatch)"* sentence recording the sizing and the routing | No |
| §1.3, after the revert-vs-re-derive routing paragraph | New paragraph *"Sizing the hygiene residue, and where it is owned"* | No |

No table, oracle, seam contract, cardinality pin or transcription surface elsewhere in the document
was touched. `git diff` over the erratum commit shows exactly two hunks, both additive.

## Design

Nothing in the document's design content changed, and I re-checked the two structures the new
paragraph sits next to, because a paragraph inserted into §1.3 could have displaced or contradicted
them:

- The eight-row HEAD-drift surface table in §1.3 (the `A6` transcription residue: seam list,
  envelope defaults, config defaults, per-seam report rows, gate-exclusivity registry, harvest /
  property seam lists, the four bare row-count sites, and the `.enabled` occurrence count) is
  byte-unchanged and still reads the same at HEAD.
- The revert-vs-re-derive routing paragraph immediately above the insertion is unchanged, and the
  new paragraph is consistent with it rather than a second, competing routing: it routes *sizing
  and ownership* to PLAN's Overview HEAD-drift note and A6-00's Edit 1, which is where PLAN v1.7 and
  v1.9 actually put them. I verified both landing sites exist in PLAN at HEAD and carry the
  partition, the owners and the figures the paragraph defers to.
- The new paragraph's back-reference (*"The `.bak` blobs named above"*) resolves: the blobs are named
  earlier in the same §1.3, so the paragraph is not orphaned by a later section reorder.

The design-neutrality claim in the changelog (*"Sizing and routing only … no design claim moves"*)
holds as written.

## Seams

## Data Model

## Verification

## Findings

## Obligations

## Positive Observations

## Recommendation

