# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-21
**Iteration:** 13 (delta re-review under DECISION FREEZE — PROPERTIES moved v0.7 → v0.8)

## Overview

**What moved, and why the freeze still binds.** PROPERTIES went **v0.7 → v0.8** across six commits
(`022e1c46`, `d173ff19`, `7cc189f5`, `085a4024`, `67233d19`, `c575cdc3`). Every one of them is a
**re-measurement**, not a decision: the branch was rebased, the document's commit anchors were all
pre-rebase, and re-running the measurements at HEAD found that the branch had also advanced past the
commit those readings were taken at. I confirmed the rebase claim directly rather than taking it on
trust — `git merge-base --is-ancestor` says every old anchor (`21edb7c5`, `1920f281`, `cdeb1509`,
`5e522a52`, `1544fdbd`, `eb32d7d2`, `2cbacada`, `92b7ea0c`, `d462ddd8`, `ced75955`, `ae2af1da`) is
**not reachable from HEAD**, while every new anchor (`b9074d1e`, `8eee671f`, `a4998e13`, `e7fa8d87`,
`2fc6fcd3`, `09c7c62f`) **is**. The document's framing of its own edit is therefore accurate: this is
a measurement round, and DECISION FREEZE is the right regime for it.

**The diff, hunk by hunk, and what each one touches:**

| Hunk | Location | Change | Reaches a property? |
|---|---|---|---|
| 1 | Header `Upstream` cell (line 11) | Appends the v0.8 re-pin note | No |
| 2 | Version row (line 18) | `0.7` → `0.8` | No |
| 3 | Overview subject line (line 29) | Pins the HEAD measurement to `09c7c62f`, 2026-08-21 | No |
| 4 | §C.4 test-file inventory | Re-derives all fourteen anchors; **adds four rows** for unowned files; 14 → 18 | No — none is property-named |
| 5 | §C.4 task-id paragraph | LI-22 now has commits; ids are LI-01…LI-23 with no exceptions | No |
| 6 | §C.4 case-C paragraphs | **Seven absence claims reversed**; case C recorded discharged green | No — the properties are unchanged, their *status* is now measured |
| 7 | §C.4 closing / §C.3 tail | Re-pins LI-21, LI-07, LI-08, LI-12, LI-05 anchors; adds `learningsConfig.test.js` line anchors | No |
| 8 | §G.2 | **New gap 5** (manifest under-count); old item 5 renumbers to 6 | No |
| 9 | §G.3 | **Newly routed — one item**: the four unowned files, routed to PLAN | No |

**No property statement, oracle row, fixture row, AT mapping or coverage count moved.** The diff's
line ranges are 8–14, 26–29, 1061–1211 (§C.4, inside `## Coverage Matrix`) and 1254–1361 (`## Gaps,
Obligations and Routed Errata`). `## Properties` (lines 87–607), `## Oracles` (608–808) and
`## Fixtures` (809–917) are byte-untouched. The header's own claim — *"No property, oracle, fixture,
AT mapping or coverage row moves"* — is true as written, and I verified it against the diff rather
than against the sentence.

**The product question this round asks.** A document that reverses seven of its own absence claims is
exactly where a reversal can be done sloppily: an author under pressure to show progress can record
"landed and green" without measuring, and the reader inherits a false green. So this review's whole
weight sits on one question — **is the new reading measured, or asserted?** I re-ran every
measurement the delta makes. All of them hold, character-exactly, and the green claim reproduces on
my machine. Details in the sections below.

**One thing moved underneath this document while it was being revised.** PLAN is now **v1.1**
(`PLAN-pdlc-learnings-injection.md:18`), having passed through v0.9, v1.0 and v1.1 since the v0.8 pin
this document still carries. One of those rounds re-worded case C's *When* cell, which this document
quotes verbatim. The substance behind the quotation is unchanged and the conclusion drawn from it is
still correct, so this is quotation freshness, not fidelity — F-01 and F-02 below, both non-gating.

## Properties

## Oracles

## Fixtures

## Findings

## Deferred

## Positive Observations

## Recommendation

## Verdict
