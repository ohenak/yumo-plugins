# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/DECISIONS-pdlc-plugin-retirement.md` (v0.4)
**Date:** 2026-08-18
**Iteration:** 4
**Scope:** testing lens only — is each decision falsifiable, does a named oracle exist or is its absence declared, does the PLAN/PROPERTIES contract survive transcription

Delta re-review. Base: `875c67cf` (the commit reviewed at v3) → HEAD. Four commits touch the document (`96a3b180`, `5eb9e31c`, `b6529219`, `8281ef70`); diff is +10/−9 lines and touches DEC-06's excluded-reference anchors, DEC-09's negative-arm paragraph, DEC-10's price paragraph, DEC-10's Decision-table cell, the cross-cutting-rules count word, the Consequences gated-class row, the gated-merge paragraph, and the changelog. Only those sections were scanned for new issues.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The closure now reads 7–12 in four places, but the one sentence PLAN actually mines for edges was left at the narrow pair.** "Downstream obligations" still says PLAN "must also carry DEC-10's block (classes 7 and 11 gated on erratum 3) ... as real dependency edges, not prose notes" (`DECISIONS-pdlc-plugin-retirement.md:281`). The transitive closure it should point at is stated correctly three lines up-document (`:150` "classes 7–12"), in DEC-10's owning-oracle cell (`:171`, "a `Deps` edge on the class-7/8/9/10/11/12 task"), in the Consequences row (`:231`) and in the gated-merge paragraph (`:237`) — so the document does not contradict itself, and the authoritative enumeration is the one the batch-DAG check reads. This is a residual, not the v3 High: a PLAN author working from the obligations paragraph alone would emit two edges instead of six, and the batch-column math would then understate class 8/9/10/12 batches. Fix: make `:281` say "classes 7–12 (the closure derived at DEC-10's price paragraph)" rather than restating the direct pair. | Downstream obligations (`:281`) |
| F-02 | Low | Local | **The class-13 quote in the gated-merge paragraph is escaped, so it renders with literal backslashes.** `:237` contains `\"Independent; may land any time\"` — two `\"` sequences inside ordinary Markdown prose, where the surrounding quotations at `:150` use bare `"`. Markdown emits the backslash; a downstream transcriber copying the quoted literal into a PROPERTIES row copies the escape with it, and cross-cutting rule 2 makes literal transcription load-bearing here. Fix: unescape both quotes. | "What a gated merge looks like" (`:237`) |
| F-03 | Low | Local | **The class-9 ordering cell is quoted as a silent prefix, not verbatim, and the dropped clause is the co-commit obligation.** `:150` quotes class 9 as "Same commit as, or after, class 7"; FSPEC's cell reads "Same commit as, or after, class 7; the CLAUDE.md prose it guards moves in this commit (M-11f)" (`FSPEC-pdlc-plugin-retirement.md:161`). The ordering conclusion is unaffected — the quoted prefix is byte-exact and the FSPEC anchors at `:160`/`:161`/`:162` all resolve to the right rows — but the truncation is unmarked, and the dropped half is precisely the clause that binds an M-11f CLAUDE.md edit into the class-9 commit rather than into class 12's documentation commit. That is the distinction this revision's whole closure argument turns on. Fix: quote the full cell or mark the elision with an ellipsis. | DEC-10 price paragraph (`:150`) |

## Questions

## Positive Observations

## Recommendation

## Verdict
