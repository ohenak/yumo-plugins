# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md
**Date:** 2026-08-20
**Iteration:** 6 (upstream-cascade confirmation — PROPERTIES bytes unchanged; PLAN v0.5 → v0.6)

## Overview

**Question answered.** Does PROPERTIES (bytes unchanged, sha256 `6d74d3eb…`) still hold as approved
against PLAN as it now stands at `d028d972…` (v0.6)? **Yes for every property, oracle, fixture and
traceability count** — the PLAN erratum moved no task, no batch, no `Deps` edge, no AT partition and
no fixture, so nothing this document *asserts* is disturbed. What the erratum did break is a pair of
prose statements in §C.4 and the header that *describe the state of PLAN*: PROPERTIES still says the
routed item is open when PLAN has closed it, and still pins PLAN at v0.5. Both are documentation
accuracy, neither gates a suite — hence Medium and Low, not High.

**The delta I read.** `git diff 7bcbce64~1..HEAD -- PLAN` is confined to four places: the version cell
(0.5 → 0.6, PLAN:18), LI-08's row gaining a pointer to the new paragraph (PLAN:147), the new
**Amendment commits on landed suites (P-A-7)** paragraph and its two-case table inside §The three
gate wordings (PLAN:484–503), and the v0.6 changelog row (PLAN:590). I re-read only those, plus the
sections of PROPERTIES that lean on them (header row :11, §C.4's landed-files paragraph :1087–1101,
PROP-BOUND-03's cost sentence :252, PROP-BOUND-05 :264–275, §G.1's T-O-6 row, §G.2/§G.3).

**What the erratum resolves, verified against PLAN at HEAD.** PLAN:486–495 now names the expected-red
rows for the heading-form follow-up in both reachable cases: **case A** (commit lands before batch 7)
adds **no** row, because `learningsBlock.test.js` is already ledgered as a whole-suite red after
batches 7–8 and greens entire at LI-17/batch 9; **case B** (batch 9 or later) adds the named row
`learningsBlock` → `LI-AT-11`'s heading-form cases only, stated in test names, for every batch from
the landing batch through the greening batch. PLAN:496–503 additionally discharges the fixture-helper
question by declaring the heading-form knob **additive** over the landed `buildLearningsCorpus`
ordinal/gloss rendering, so `learningsSelect.test.js` and `learningsCorpus.test.js` carry no row —
and commits the non-additive future to entering the ledger first. That is exactly the shape §C.4
asked for when it routed the item, and it is engineering-sound: an additive knob keeps existing
callers byte-identical, which is the premise the empty row-set rests on.

**Verification method.** `shasum -a 256` on all five upstream files against the dispatch pins (all
five match, PLAN included); `git log`/`git diff` over PLAN's erratum commits (`7bcbce64`,
`748659c0`, `92e5d178`, `6a2d3007`); grep of every `PLAN` mention in PROPERTIES (22 sites) against
PLAN at HEAD; re-check of PROP-BOUND-03's and PROP-BOUND-05's owning-task cites (PLAN:147, LI-08 red
/ LI-17 green — unchanged by the erratum). I did not re-read the sections of PROPERTIES that carry no
PLAN dependency.

## Properties

## Oracles

## Fixtures

## Delta-Confirmation Findings

## Recommendation

## Verdict
