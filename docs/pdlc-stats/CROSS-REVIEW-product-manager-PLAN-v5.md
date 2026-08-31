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

_(pending)_

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
