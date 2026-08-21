# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-21
**Iteration:** 10 (upstream-cascade confirmation — PROPERTIES bytes unchanged, PLAN v0.7 → v0.8)

**UPSTREAM-STATE at this review:** REQ (`ff605dd3`) · FSPEC (`ae75fa62`) · TSPEC (`22dee8ce`) ·
DECISIONS (`56617f5a`) · **PLAN (`281c60c0`, v0.8 — was `b9fbd3ea`, v0.7, at my v9 approval)** ·
PROPERTIES under confirmation at `3e9fdf8b`, byte-identical to the version I approved at v9.

## Overview

**The question.** PROPERTIES' own bytes have not moved — `sha256:3e9fdf8b…` is exactly the value my
v9 APPROVAL-HASH records. What moved is PLAN, from `b9fbd3ea` (v0.7) to `281c60c0` (v0.8), across
four commits (`af847862`, `1082b3f7`, `3e12a7d5`, `be64a0c6`). The single question of this round is
whether PROPERTIES is still a faithful compression of PLAN as it now stands. It is not, in one
load-bearing place.

**What the erratum did to PLAN.** P-A-7's *Amendment commits on landed suites* table grew from **two
cases to three**. Case A keeps its "before batch 7" scope and gains a derivation covering batches
2–6. Case B is **re-scoped** from "batch 9 or later" to *"after LI-17 has greened the suite, with a
greening batch still ahead (batch 9 through batch 12)"* — its span is now well-formed only while a
greening batch remains. New **case C** governs "after batch 13, the case that is live at HEAD": the
ledger stays **empty**, and the amendment **is expected to land green**, with a fix owed before batch
14 and a red surviving into batch 14 a gate failure rather than a ledger entry.

**And case C names this document by name.** PLAN's case C closes: *"The same rule governs any other
amendment to a landed suite arriving from here on — including the PROPERTIES-driven re-reds §C.4 of
PROPERTIES routes to this PLAN (PROP-BOUND-03's `maxBytesPerDocument <= 0` case, PROP-BOUND-05/07/08,
and the Group D amendments to the landed `learningsSelect.test.js`): under case C they owe no ledger
row, and they owe green."* PLAN v0.8's changelog row says the same and adds that case C is
*"answering PM Q-02"* — my own carried question, answered upstream.

**The consequence: §C.4's governing-case ruling is now inverted.** PROPERTIES §C.4 (line 1110) reads
*"of PLAN's two-case table, **case B is the live case and case A is unreachable**"*, and line 1142
restates it as a standing distinction: *"**P-A-7 case B** governs the amendment commit against the
landed implementation suite `learningsBlock.test.js`"*. At HEAD, PLAN says case B is **not** the live
case — it is bounded to batches 9–12, all behind us — and case C is. The two documents now prescribe
different obligations for the same four properties: PROPERTIES says a named ledger row is owed for
every batch through the greening one; PLAN says **no row is owed and green-at-landing is**. That is
not a stale pin, it is a contradiction on what the implementer must do, so it is High.

**The second consequence: §G.3 routes two questions PLAN has already answered.** §G.3's *"Still open
— three items"* list carries both P-A-7 case-B gaps I confirmed as correctly routed at v9. PLAN v0.8
answers both explicitly — the no-named-row gap by ruling the ledger empty under case C, the
no-terminus gap by replacing the span with batch 14's unqualified gate. Leaving them in the open list
and re-emitting them as `ERRATUM: PLAN` lines is precisely the DEC-ERR-01 anti-pattern §G.3's own
prose names ("raising a question the upstream has decided"). Medium: the fix is mechanical — move both
bullets to the *"Also answered"* list in the form they resolved.

**What did not break.** No property, oracle, fixture, AT id, severity, group membership or red/green
trace is affected by this delta. P-A-6 is byte-unchanged at PLAN line 594, so §C.4's PROPERTIES-suite
mechanism and its *"the first point the suite is green"* quotation still hold verbatim. PLAN's case B
span sentence still reads *"every batch from the one the commit lands in through the batch that greens
them"*, so my v9 F-01 paraphrase finding neither worsens nor resolves. The batches 7–13 ledger is
byte-identical, and no task, `Deps` edge, AT partition, fixture or manifest row moved — I diffed for
each. §C.4's count table (70 / 35 / 23 / 21 / 12), the 23-of-23 task accounting and the fourteen-row
inventory are all unaffected, because the erratum added no task and moved none.

## Properties

## Oracles

## Fixtures

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
