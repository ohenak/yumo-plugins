# Cross-Review: product-manager — TSPEC (upstream-cascade confirmation, round v12)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md` (v0.7, bytes unchanged since v11 approval)
**Upstream at HEAD:** REQ v0.9 (`sha256:ff605dd3…`), FSPEC v0.13 (`sha256:ae75fa62…`)
**Date:** 2026-08-20
**Iteration:** 12 (upstream-cascade confirmation)

## Overview

**Question asked:** my v11 approval of TSPEC v0.7 was recorded against FSPEC
`sha256:fb18dbda…` (v0.12). FSPEC has since moved to `sha256:ae75fa62…` (v0.13) via a six-commit
erratum round (`eeafa236`, `402185b3`, `c33bec50`, `5dcd00e0`, `0884fe45`, `cfb3d4d6`). Does TSPEC
still hold as approved against FSPEC as it now stands? TSPEC's own bytes are unchanged.

**Answer: no — two High findings.** The FSPEC v0.13 erratum lands three decisions. One of them
(BR-6's material-only byte basis) resolves *in TSPEC's favour* and makes §D.5 upstream-true where
it was previously in tension — genuinely good news, and no work for this document. The other two
move ground TSPEC stands on:

| FSPEC v0.13 decision | Effect on TSPEC v0.7 | Verdict |
|---|---|---|
| BR-6 byte basis is **material only**; framing (identification line, per-document delimiters and source-path label, block preamble) is charged to no threshold, per REQ AC-2.3 "the material taken" | TSPEC §D.5's three-disjoint-pools accounting already said exactly this; upstream absorbed TSPEC's reading and named the contradiction removed | **Still true** — no finding |
| `maxBytesPerDocument: 0` decided: no document yields material, every one carries `RSN-NO-MATERIAL` and consumes no slot; new **E-36**, folded into **AT-30** as a third case; `RSN-NO-MATERIAL`'s BR-9 catalogue entry widened; D-12 restated as "yields any material" | TSPEC §I.2 restates AT-30 parenthetically as **two** zeros (`maxDocuments: 0`, `maxTotalBytes: 0`) and §T.6 states `RSN-NO-MATERIAL`'s only entry arm as "No BR-6 section present" | **F-01, High** |
| **F-O-1** now owns **two** heading-recognition rules — the document-shape predicate **and** the rule by which a heading counts as one of BR-6's named sections (numbered form / bare title / prefix) | TSPEC discharges only the first (§D.3); §Open Questions' obligation table maps F-O-1 → §D.3 and describes it as "the 'presents as a LEARNINGS document' predicate" alone | **F-02, High** |

Both findings are `delta` (this edit introduced them) and `local` (they sit in the upstream
material this edit changed: BR-6/BR-9/D-12/E-36/AT-30 and F-O-1). Neither is a re-litigation of a
settled decision, and neither disturbs anything v10/v11 approved — the byte-accounting core,
BR-1's two conjuncts, the corpus-outcome domain and the seam inventory are all untouched by this
delta and remain faithful.

**Scope discipline.** I re-read the upstream text TSPEC leans on at HEAD rather than checking off
the item list (DEC-ERR-03). F-02 in particular is not on any routed item list — it falls out of
F-O-1's widening, which is an obligation *transferred to this document*.

## Architecture

_pending_

## Interfaces

_pending_

## Data Model

_pending_

## Test Strategy

_pending_

## Open Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_
