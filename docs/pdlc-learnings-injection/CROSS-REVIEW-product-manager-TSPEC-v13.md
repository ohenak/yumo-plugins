# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 13 (delta confirmation)
**Round type:** Delta confirmation — previously approved, targeted erratum edit
**Erratum commit:** `4e16392d` (heading), substance in `e6b58df5`
**Upstream at dispatch:** REQ `ff605dd3…` (v0.9), FSPEC `ae75fa62…` (v0.13) — both re-verified at HEAD

## Overview

**Question asked:** does the erratum delta resolve the two routed items without breaking what I
previously approved — and, per DEC-ERR-03, is this TSPEC still a faithful compression of its
upstream *at HEAD*, whether or not the discrepancy appears in the routed list?

**Answer: yes on both, with no findings.**

The two routed items were the same defect seen from two lenses. I raised that §D.3 discharged only
F-O-1's document-shape half, leaving `extractInjectableMaterial`'s recognition rule for BR-6's five
priority headings — the numeric `## N.` prefix and the `(with rationale)` gloss — unspecified.
te-author raised that the section matcher was specified nowhere. Both are now closed: §D.3 carries
`BR6_SECTION_NAMES`, `SECTION_HEADING_RE`, `GLOSS_RE`, three numbered matching rules, a section-extent
rule, and a duplicates/absences rule.

**On the shape of the delta.** The commit named in this dispatch (`4e16392d`) is a one-line heading
rename — `### D.3 The document-shape predicate` becomes `### D.3 The two heading-recognition rules
*(discharges F-O-1, both halves)*`. Taken alone that would be cosmetic, and a heading that claims
"both halves" over a body carrying one would be a worse state than before. It is not alone: the
substance landed in `e6b58df5` earlier in the same erratum round, and the rename is the last step
that makes the section's title honest about what its body now holds. I verified the body directly
rather than inferring it from the commit message.

**Upstream re-verification (DEC-ERR-03).** I re-hashed both upstream documents at HEAD; both match
the dispatch digests byte-for-byte, so no upstream drift could have occurred since dispatch. I then
re-read the upstream passages this section newly leans on — F-O-1's obligation row, BR-6's priority
table, and BR-6's delegation sentence — rather than trusting the TSPEC's paraphrase of them.

## Architecture

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Positive Observations

## Delta-Confirmation Findings

## Verdict
