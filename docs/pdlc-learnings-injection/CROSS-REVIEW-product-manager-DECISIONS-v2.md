# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md` (v0.2)
**Previous review:** `CROSS-REVIEW-product-manager-DECISIONS-v1.md` (iteration 1)
**Date:** 2026-08-19
**Iteration:** 2

## Delta scope

`git diff 588c726a..HEAD` on the document — the commit that closed my v1 review — shows eight
revision commits touching seven top-level entries plus the obligations table. Changed regions
reviewed: the version row, DEC-LI-02 (seam-contract paragraph), DEC-LI-03 (new funnelling-premise
paragraph, re-evaluation triggers), DEC-LI-04 (new rejected alternative, constraints paragraph),
DEC-LI-05/06/10 (re-evaluation triggers), DEC-LI-07 (new erratum paragraph, triggers), DEC-LI-08
(constraints paragraph), DEC-LI-09 (new recorded-sha guard), the "Decisions deliberately NOT taken"
table row on AC-3.3, the hand-off bullet on read cost, and obligations `D-O-2`, `D-O-3`, `D-O-4`,
`D-O-6`…`D-O-9`. Unchanged entries (DEC-LI-01, the corpus/grounding preamble, DEC-LI-05's body,
DEC-LI-08's body) were approved in v1 and are not re-litigated.

## Prior findings — disposition

| v1 ID | Severity | Disposition | Evidence |
|---|---|---|---|
| F-01 | Medium | **Resolved** | DEC-LI-07 gains a dedicated paragraph naming the divergence, its downstream cost (PROPERTIES/PLAN read TSPEC, so `AT-31`/`AT-32` against §I.3 would be red against a correct implementation), the four specific edits asked of TSPEC, and obligation `D-O-9` owned by TSPEC. The erratum is now a tracked item, not a promise. |
| F-02 | Medium | **Resolved** | DEC-LI-04 adds the "widen the enumeration to include consolidation's project-level artefacts" alternative with the reason I asked for, and states the extra cost (double-delivery at per-dispatch cost, plus breaking the pinning test's premise). A future agent re-reaching for it now meets a written answer. |
| F-03 | Medium | **Resolved, and better than I asked** | Rather than record a residual risk, DEC-LI-02 and DEC-LI-04 correct the seam contract outright: the Node channel never throws, the runtime channel may reject, so the shell's `try` covers **both** seam calls. This is the fail-open guarantee (REQ C-7/G-4, FSPEC `BR-12`) actually holding on the channel that runs the pipeline. |
| F-04 | Low | **Resolved** | The "Decisions deliberately NOT taken" row now cites TSPEC `ERR-6` as the existing route to REQ AC-3.3 and states it is not re-raised here. Verified: `TSPEC-pdlc-learnings-injection.md:353` and `:1248` both carry `ERR-6` routed at REQ AC-3.3. |
| F-05 | Low | **Resolved in kind, one residual** | Both `DC-18` miscitations are gone. The replacement authority is `DEC-LAYER-01`, which on re-reading does not actually cover this claim — see F-01 below. My v1 fix suggestion offered that swap, so the residual is partly mine. |
| F-06 | Low | **Resolved** | `D-O-4` now names realised prompt sizes against REQ §4.1's caps as the input C-8's weakly-satisfied second half needs, and states explicitly that this obligation is where the C-8 gap is owned and what its closing condition is. |

## Verification of new claims

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
