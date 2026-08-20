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

**Where the obligation now sits, and whether that placement is coherent.**

F-O-1 is an obligation FSPEC delegates *to TSPEC*. The product question is not which file the
regex lives in — that is se-review's lens — but whether the document records the obligation as
discharged in the same place it actually discharges it, so a reader tracing FSPEC → TSPEC lands on
the answer rather than a pointer.

Before this round the document was incoherent on exactly that point: §D.3's heading claimed the
discharge, the obligations table (§ obligations, F-O-1 row) claimed the discharge, and only one of
the two rules was written down. The delta closes the triangle:

| Locus | State at HEAD |
|---|---|
| §D.3 heading | Names *both* halves explicitly — `*(discharges F-O-1, both halves)*` |
| §D.3 body | Rule 1: `looksLikeLearningsDocument` / `LEARNINGS_HEADING_RE`. Rule 2: `BR6_SECTION_NAMES` + `SECTION_HEADING_RE` + `GLOSS_RE`, three matching rules, extent, duplicates |
| Obligations table F-O-1 row | "**both** heading-recognition rules (FSPEC v0.13) … §D.3 — the predicate (`LEARNINGS_HEADING_RE`) and the section matcher (`BR6_SECTION_NAMES`, optional ordinal, optional gloss, otherwise exact)" |
| §I.3 `extractInjectableMaterial` JSDoc | Points at the rule (`optional N. ordinal (discarded — priority comes from BR6_SECTION_NAMES's index, never from …)`) without restating it |
| v0.8 erratum note (header) | Records item (3) as landed, naming what §D.3 gained |

I checked the last row specifically for the failure mode this document has hit before: two loci
each stating a rule, drifting apart. §I.3 does **not** restate the matcher — it cites §D.3's
decision and carries only the contract (`sections` are canonical names, not literal heading text).
One normative statement, one pointer. That is the right shape.

**Scope of the delta.** Nothing outside §D.3's heading changed in `4e16392d`, and the substantive
commit touched §D.3 only. I re-read §D.4 (the ordering key) and §D.5 immediately downstream of the
edit to confirm the new section-extent rule did not silently move a boundary they depend on; it did
not — §D.4 keys off the harvest metadata table, which is not a BR-6 section, and §D.5's
`RSN-NO-MATERIAL` path consumes `sections: []`, which the new rule produces rather than redefines.

No previously approved material was weakened, narrowed, or reinterpreted by this delta.

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Positive Observations

## Delta-Confirmation Findings

## Verdict
