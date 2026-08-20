# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md
**Date:** 2026-08-20
**Iteration:** 6 (upstream-cascade confirmation; DECISIONS' own bytes unchanged)
**Scope:** Local

## Context

At v5 I confirmed DECISIONS against a **TSPEC** cascade and recorded `Approved with minor changes`
(0 High / 2 Medium / 3 Low), `REVIEWED-COMMIT: 40dffb86`, `APPROVAL-HASH: sha256:85888c03…`, with
`UPSTREAM-STATE: REQ sha256:ff605dd3… / FSPEC sha256:fb18dbda… / TSPEC sha256:f629d29d…`.

At this dispatch: REQ is byte-identical (`sha256:ff605dd3…`, v0.9) and TSPEC is byte-identical
(`sha256:f629d29d…`, v0.7) to the versions v5 recorded. **FSPEC** has moved — `fb18dbda…` (v0.12,
commit `c1d7218e`) → `ae75fa62…` (v0.13, commit `cfb3d4d6`). DECISIONS' own bytes have not moved
since `d140fbee`: `sha256:85888c03…`, unchanged across the v3, v4, v5 and now v6 rounds.

Per DEC-ERR-03 I re-read the **whole span** `c1d7218e..cfb3d4d6`, not the last commit, because my
approval was recorded against the older blob. Six commits, one erratum:

| FSPEC commit | What moved |
|---|---|
| `eeafa236` | BR-6's **byte-accounting basis** re-founded: a document's *contributed bytes* are now its **material only** — the section headings and bodies taken — and framing (identification line, per-document delimiters, source-path label, block preamble) is charged to no threshold. Grounded on REQ AC-2.3's "the material taken". |
| `402185b3` | `RSN-NO-MATERIAL`'s reason-catalogue gloss widened: "carries none of BR-6's priority sections, **or the per-document bound is zero and admits none**". D-12 restated from "carry any priority section" to "yield any material". |
| `c33bec50` | `maxBytesPerDocument: 0` decided: every document yields nothing, carries `RSN-NO-MATERIAL`, consumes no slot; the run is BR-14's **enabled, empty-selection** run. Recorded as **E-36**, exercised by **AT-30** beside the other two zeros; §Traceability's row range extended to E-36. |
| `5dcd00e0` | **F-O-1** widened to own **both** heading-recognition rules — BR-3's document-shape predicate *and* the rule by which a heading counts as one of BR-6's named sections — so BR-6's delegation names a real owner. Both still bounded by "consults only the document's bytes" and "decidable without a model call". |
| `0884fe45` | BR-6 prose adopts the contributed-bytes vocabulary; zero-bound paragraph added to "How the per-document bound binds". |
| `cfb3d4d6` | v0.13 erratum note added to the changelog; version row 0.12 → **0.13**. |

Nothing in the span touched `BR-1`, `BR-3`, `BR-7`'s own definition, `BR-14`, `BR-15`, `E-32`, or
`A-2` — the six upstream anchors DECISIONS actually leans on hardest. The confirmation question is
therefore the narrow DEC-ERR-03 one: does anything DECISIONS *says about* FSPEC now fail to match
what FSPEC says, or fail to say it the same way?

## Options Considered

## Decision

## Consequences

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
