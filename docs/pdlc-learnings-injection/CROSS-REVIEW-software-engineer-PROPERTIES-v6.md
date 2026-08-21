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

No property changes status. The erratum touched no behavioural text, so no property's *claim* can
have drifted; what I checked is whether any property's **owning-task or cost sentence** still reads
true against PLAN v0.6.

- **PROP-BOUND-03** (PROPERTIES:235–252) — holds. Its cost sentence ("one added case in
  `pdlc/workflows/__tests__/learningsBlock.test.js` (landed, 7.6 K) under the **existing** LI-08 red /
  LI-17 green tasks — no new fixture, no new PLAN task, no new AT id, no new property id") is still
  exact: PLAN:147 still assigns `learningsBlock.test.js` to LI-08 with `learningsBlock` red at
  batches 7–8 and green at LI-17/batch 9, and the erratum added ownership language only, never moved
  it. The zero-bound conjuncts trace to TSPEC §I.3/§D.5, untouched at `22dee8ce…`.
- **PROP-BOUND-05** (PROPERTIES:264–275) — holds, and is now *better* supported than when I approved
  it. Its priority-ordered-intersection oracle is the same claim PLAN's LI-08 row now pins with the
  non-canonical heading forms (un-numbered `## Cross-Feature Patterns`, un-glossed
  `## Rejected Proposals`, the `###` sub-heading that must read as body text, the `## Process
  Findings` near-miss). PROPERTIES states the observable; PLAN states which test carries it and when
  it reds — the altitude split is intact and the two texts agree.
- **PROP-BOUND-06, PROP-BOUND-07, PROP-BOUND-08, PROP-CONFIG-09** — untouched by the delta; their
  upstream anchors (FSPEC E-36/BR-6/BR-9 at `ae75fa62…`, TSPEC §D.5 at `22dee8ce…`) are byte-identical
  to the versions I approved against. Not re-litigated.
- **Counts unchanged.** `grep -o 'PROP-[A-Z]*-[0-9]*' | sort -u | wc -l` → **70**, matching §C.4:1056
  and the header at :22. §C.3's "23 of 23 tasks accounted for" still holds: PLAN still carries
  LI-01…LI-23 and the erratum added no task.

The one place a property-adjacent sentence *is* now wrong is §C.4's account of what PLAN has and has
not decided — see F-01 and F-03. Neither changes a property's text, oracle, level, fixture or owning
task; both are stale descriptions of upstream that a reader would use to conclude an item is still
open when it is not.

## Oracles

## Fixtures

## Delta-Confirmation Findings

## Recommendation

## Verdict
