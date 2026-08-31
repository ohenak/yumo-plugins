# Cross-Review: product-manager — PLAN (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/PLAN-pdlc-stats.md` (v1.2, bytes unchanged)
**Previous review:** `docs/pdlc-stats/CROSS-REVIEW-product-manager-PLAN-v4.md` (`REVIEWED-COMMIT: 9c56d0c5`)
**Upstream that moved:** `docs/pdlc-stats/REQ-pdlc-stats.md` v1.6 → v1.7 (`e12b78fd8`)
**Date:** 2026-08-31
**Iteration:** 5

## Overview

**Scope of this round.** Upstream-cascade confirmation, not a re-review. `PLAN-pdlc-stats.md`'s own
bytes are unchanged since `9c56d0c5`, the commit my v4 approval was taken against. What moved is the
REQ my approval was pinned to: `UPSTREAM-STATE: REQ sha256:5f3e8051…` in v4 no longer exists on the
branch, and REQ is now `sha256:f75c348f…` (v1.7, `e12b78fd8`). FSPEC is unmoved
(`sha256:c7d2c832…`, identical to my v4 pin). The single question I owe an answer to: does the PLAN
still hold against the REQ as it now stands? I did not re-open settled decisions, did not re-read the
PLAN from scratch, and did not re-litigate v4's recommendation.

**What the erratum changed.** One clause, decided rather than reconciled — 12 insertions, 3 deletions,
all inside REQ-STATS-06 plus a changelog block. REQ v1.6 had asserted that "the predicate is
set-membership over C-4's grammars, so a grammatical basename outside the driver's document-type
catalogue is **a survivor** even where REQ-STATS-03 reports it malformed." That clause is **withdrawn**.
REQ-STATS-06 now reads (`REQ-pdlc-stats.md:208-215`): the predicate "is evaluated over exactly the
file set whose bytes the process side sums, so a basename the driver's document-type catalogue does
not recognise … contributes no process bytes and counts as no file of its family remaining: a feature
whose only `CROSS-REVIEW-` basenames are of that shape reports **harvested**, not a measured ratio
that would silently undercount."

**Direction of the change is the one this PLAN was already built for.** The withdrawn clause was the
REQ half of the REQ-versus-FSPEC contradiction TSPEC §4.3 named explicitly and routed to the owning
phase without deciding: "the sketch below is written against BR-16, the immediate upstream, and §8.3
routes the reconciliation to the owning phase" (`TSPEC-pdlc-stats.md:796-797`). FSPEC BR-16 v1.7 —
unchanged by this erratum — already said the out-of-catalogue basename "counts as no file remaining"
and that such a directory "reports `harvested`, not a measured ratio"
(`FSPEC-pdlc-stats.md:364-374`). The erratum moved REQ **onto** FSPEC's reading. PLAN derives from
FSPEC and TSPEC, so every task it owns was already written to the surviving answer.

**Method.** I read my v4 cross-review, took `git show e12b78fd8 -- docs/pdlc-stats/REQ-pdlc-stats.md`
for the exact delta, then re-read the current REQ-STATS-06, FSPEC BR-16 and AT-17, and TSPEC §4.3/§8.3
at HEAD — not the versions I reviewed against — and traced each into the PLAN rows that lean on them.
"The items landed" is necessary, not sufficient; what follows measures PLAN's text against upstream
text as it now reads.

## Batches

Every PLAN row that touches REQ-STATS-06's ratio, re-measured against REQ v1.7 / FSPEC v1.7 at HEAD.
The PLAN cites no REQ section directly — its only REQ reference is the lineage row at
`PLAN-pdlc-stats.md:9` and `REQ C-5` in the Overview — so the cascade reaches it through FSPEC BR-14…BR-16
and TSPEC §4.3. That indirection is what makes this confirmation cheap, and it is worth stating
plainly rather than treating as an accident.

| PLAN row | What it leans on | REQ v1.7 reading | Holds? |
|---|---|---|---|
| **T-04** — `computeFeatureStats` reds, "byte ratio (AT-15 incl. the removal probe, AT-16, **AT-17's four directories**)" (`PLAN:96`) | FSPEC AT-17, whose fourth leg is the directory "holding `CODE_REVIEW` files intact plus, as its only `CROSS-REVIEW-` basenames, the out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` form BR-16 names," expecting `harvested` (`FSPEC:749-757`) | REQ-STATS-06 v1.7 now states the same outcome for the same shape in its own words — "reports **harvested**, not a measured ratio" | **Yes.** The leg PLAN owns was the contested one; it is now the decided one. No expected value changes. |
| **T-04** — the `unmeasurable`/`harvested` mutant's dedicated fixture (`PLAN:96`) | TSPEC §6.6 mutant set; branch order harvested-before-zero-denominator | REQ-STATS-06 is silent on precedence ("How much of the numerator harvest removes is not asserted here"); BR-16 owns it, unchanged | **Yes.** Untouched by the erratum. |
| **T-18** — AT-09 over `docs/completed/pdlc-advisory-wave-gate/`: "TSPEC row `6`, four `…-REVIEW-v{1,2}.md` basenames malformed" (`PLAN:110`) | REQ-STATS-03's malformed classification, not the ratio | REQ v1.7 *strengthens* the tie — it now cites "the same one REQ-STATS-03 reports malformed (C-5)" as the basis for the harvested reading | **Yes**, and the erratum removes the tension that previously made one basename malformed under REQ-STATS-03 and a survivor under REQ-STATS-06. BR-16 still classes this directory itself as a measured ratio because it also carries grammar-matching cross-reviews ("only the shape is borrowed, not the verdict", `FSPEC:373-374`); PLAN never claimed otherwise. |
| **T-18** — AT-10 (`pdlc-headless-engine`, "five rows `harvested`") (`PLAN:110`) | Per-document-type harvested split, BR-08 | Unchanged by the erratum | **Yes.** |
| **T-26** — mutation evidence, "swap BR-16's harvested test with BR-15's zero-denominator test" (`PLAN:118`) | BR-16 precedence | Unchanged | **Yes.** |
| **T-08** — doc-type set-equality over `REVIEW_DOC_TYPE_ROWS` (`PLAN:100`) | C-4's grammars as the driver catalogue | REQ v1.7 leans harder on the catalogue being *the* discriminator, which is exactly what this oracle pins | **Yes**, and marginally better motivated than before. |

**No PLAN task acquires, loses or changes an acceptance criterion.** The AC coverage table
(`PLAN:300-327`) assigns AT-17 to T-04 and AT-15 to T-04 plus T-18; both assignments are unchanged and
both remain correct against the FSPEC at HEAD. No task was written to the withdrawn survivor clause,
so nothing needs restoring; no task now over-covers, so nothing is scope creep.

## Dependencies

_(pending)_

## Verification

_(pending)_

## Delta-Confirmation Findings

_(pending)_

## Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_

## Verdict

_(pending)_
