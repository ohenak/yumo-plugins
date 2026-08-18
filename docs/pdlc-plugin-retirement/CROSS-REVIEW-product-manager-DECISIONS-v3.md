# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-plugin-retirement/DECISIONS-pdlc-plugin-retirement.md` (v0.3)
**Date:** 2026-08-18
**Iteration:** 3
**Scope:** product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.
**Delta base:** v2 was written at `812a7863`; this review reads `git diff 812a7863..HEAD` on the document
(26 insertions, 12 deletions across six commits, `29717bec`…`875c67cf`) and the sections those edits touch.
Unchanged sections already approved in v1/v2 are not re-litigated.

## Prior findings disposition (v2)

| ID | Severity | Disposition | Evidence in v0.3 |
|---|---|---|---|
| F-01 | Medium | **Resolved, with a residue** | "Two of eleven classes" is gone. DEC-10's price paragraph (`:149`) now states the transitive closure — classes 7, 8, 9, 10, 11 of **thirteen** — citing FSPEC's ordering column, and the Consequences row (`:233`) reuses the same set. Verified upstream: FSPEC §3.1 enumerates thirteen classes; class 8 is bound "same time as class 7", class 9 "same commit as class 7", class 10 after class 7 (`FSPEC-pdlc-plugin-retirement.md:160`, `:161`, `:162`). The stated-once discipline now holds between the two sites. The closure stops one class short — see F-01 below. |
| F-02 | Medium | **Resolved** | New cross-cutting **rule 5** (`:203`–`:213`) states the additive-and-conservative / subtractive principle that separates DEC-04's ship-ahead-of-criterion from DEC-07's and DEC-10's block-until-criterion, and names the conservative half explicitly ("an additive surface that deleted on default would be gated"). DEC-04's oracle cell (`:161`) now names TT-1 for row 4a, TT-2 for `--dry-run`, and records that **TT-1b owns row 4b's exit status only** with the partial-`rm` arm deliberately oracle-free. Both transcriptions are faithful: TSPEC `:737`–`:739` scope TT-1 to 4a, and TT-1b's row states "Only these two conjuncts are asserted — the partial-`rm` arm of row 4b is deliberately…" oracle-free. |
| F-03 | Low | **Resolved** | DEC-06 (`:87`) now reads "Nine **such** cite sites… The nine count **load-bearing prose citations in modules that survive unchanged** — it is not the whole live-reference set", and names the two excluded kinds (the builder's own reads; surviving suites asserting on source text), correctly concluding the second kind *strengthens* the rejection of option B. Two transcription slips remain — see F-03 below. |

All three v2 findings addressed. No previously approved section re-opened. The three TE findings this round also landed (DEC-09's `.ok`/negative arm, the gated oracle cells, DEC-10's PLAN-side owner) and are re-verified in Positive Observations rather than re-reviewed as mine.
