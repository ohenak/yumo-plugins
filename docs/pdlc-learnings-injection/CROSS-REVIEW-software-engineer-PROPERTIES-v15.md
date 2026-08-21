# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md
**Date:** 2026-08-21
**Iteration:** 15 (delta re-review under DECISION FREEZE — PROPERTIES v0.9 → v1.0)

## Overview

**What this round is.** A delta re-review, under decision freeze, of PROPERTIES **v0.9 → v1.0**. My
v14 approved v0.9 with one Medium (F-01, the re-pin's overreaching completeness claim, two sites) and
three Lows (F-02 a quotation period, F-03 a struck bullet one batch narrow, F-04 the inventory-row
"eighteen"). This round the document moved in five commits — `bc28ad0a`, `bb2d45f1`, `9c945683`,
`de2443f8`, `9e9a79e5` — totalling **56 insertions, 29 deletions** (`git diff --stat cb09985d HEAD` on
the document). I judge only whether my own prior findings are resolved and whether the revision broke
anything.

**The delta, measured.** `git diff -U0 cb09985d HEAD` returns **eleven hunks** at
`:11`, `:18`, `:1094`, `:1134`, `:1181`, `:1186`, `:1277`, `:1283`, `:1323`, `:1340`, `:1354`. Mapped
against the section map (`grep -n '^## '`: Overview `:20`, Properties `:87`, Oracles `:608`, Fixtures
`:809`, Coverage Matrix `:918`, Gaps `:1221`), **no hunk lands in §Properties, §Oracles or §Fixtures**.
Every hunk is in the header, §C.4 (inside §Coverage Matrix) or §G.2/§G.3. The header's claim — *"No
property, oracle, fixture, AT mapping or coverage row moves at v1.0 either"* — is therefore true for
properties, oracles, fixtures and AT mappings by construction of the diff; one §C.4 **inventory** row
cell did change (F-02 below).

**Every finding I filed at v14 is resolved.** This is the first round in five where that sentence is
true without a limb left over:

| v14 finding | Status at v1.0 | Evidence at HEAD |
|---|---|---|
| **F-01(a)** `:1181` still offered case B's retired amend-into-the-ledger fallback | **Resolved** | The clause is gone (`grep -n "amended into the ledger by name"` → **0 hits**) and replaced by P-A-7's governing case with PLAN v1.1's wording quoted verbatim; `grep -cF` of the 213-character quotation against PLAN → **1** (`PLAN:663`) |
| **F-01(a′)** `:1185`'s *"P-A-6 (byte-unchanged at v0.8)"* | **Resolved** | Now *"(whose fallback route PLAN rewrote at **v1.1**, restated above)"*; `grep -n "byte-unchanged at v0.8"` → **0 hits** |
| **F-01(b)** §G.3's *"Newly routed this round"* item asserting PLAN's manifest *"is now incomplete"* | **Resolved** | The item is struck and moved into *Also answered*, citing PLAN v1.2 items (3)/(4) and v1.3 item (1); `grep -n "manifest that is now incomplete"` → **0 hits** |
| **F-01(c)** the header's unscoped completeness claim | **Resolved** | Narrowed at `:11` to *"the rulings re-verified against PLAN at v1.3 in that pass — P-A-7's three cases and their windows"*, with the explicit carve-out *"**v1.0 extends the sweep to P-A-6**, which PLAN did move"* |
| **F-02** `:1131`'s quotation carried a period PLAN does not have | **Resolved** | Extended through the em-dash clause; `grep -cF "under case C they owe no ledger row, and they owe green — which PROPERTIES §C.4 records as discharged"` against PLAN → **1** |
| **F-03** struck bullet read *"landing **after** batch 13"* | **Resolved** | Now *"landing in batch 13 or later"*; `grep -n "after batch 13"` → **0 hits** |
| **F-04** "eighteen files" was an inventory-row count | **Resolved** | §G.2 gap 5 re-derived from the tree with both conventions stated and the two eighteens explicitly distinguished (verified below) |

**Verification method — repository, not documents.** `git ls-files` counts of the `learnings*` test
surface in both directories; `grep -cF` on every PLAN quotation the delta writes; the PLAN changelog
rows `:680`–`:684`; `PLAN:310` (§The arithmetic) and `PLAN:244`–`:293` (§Post-batch remediation) read
in full and its rows counted; `git show --name-status` on `2fc6fcd3` and `744311f7` for the fixture
subtree's two landing events; the `learningsComposition.js` header and `learningsDispatchSet.test.js`
import/spawn sites read directly; and a residual-staleness grep sweep of the document for all four
retired phrases.

**Conclusion up front.** The revision discharges every finding I filed, and the two counting claims it
adds — the hardest thing in this delta — are correct against `git ls-files` to the file. One **Medium**
stands, and it is the delta's own footprint: §C.4 `:1110` still says §G.3 *"routes to PLAN"* in the
present tense, which the same delta made false by striking that item forty lines later. Two **Lows**.
Nothing blocks: no property, oracle, fixture, AT mapping or coverage mapping moved, and I verified that
from the hunk offsets rather than from the assertion.

## Properties

## Oracles

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
