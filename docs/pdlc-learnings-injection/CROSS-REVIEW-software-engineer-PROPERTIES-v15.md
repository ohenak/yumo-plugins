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

**No property statement moved, and the hunk offsets prove it.** §Properties spans `:87`–`:607`; the
lowest hunk in the delta after the header is `:1094`. Groups A–J, their seventy `PROP-` statements,
their AT partitions, levels and owning tasks are byte-identical to the bytes I approved at v0.8, v0.9
and now v1.0. §C.1's 35-of-35, §C.2 and §C.3's 23-of-23 are likewise outside every hunk. Nothing this
round could have disturbed the property set, and nothing did — the fourth consecutive round in which
the document's scope claim survives being diffed rather than read.

**Every PLAN task the table lists still traces, because the trace did not move.** §C.3's reconciliation
of PLAN's 23 task rows against properties is untouched, and PLAN's task ladder is unchanged in the
relevant respect: `PLAN:310` still reconciles the tree, and PLAN's v1.2/v1.3 additions land in
**§Post-batch remediation**, a subsection explicitly *"outside the batch ladder"* whose rows *"carry no
`Owner` cell"* and are *"excluded from every count"* of §The arithmetic (`PLAN:244`, `PLAN:310`). So the
upstream movement this delta absorbs cannot have moved a task→property row: PLAN added rows to a table
the dispatcher does not parse, and §C.3 reconciles against the two tables it does.

**The four properties §C.4 routes are named identically before and after.** PROP-BOUND-03's zero case
and PROP-BOUND-05/07/08 appear unchanged in the delta; what moved is the *fallback route* a red
PROPERTIES suite would take (P-A-6), not the ruling over those four (P-A-7 case C). The two mechanisms
were already held distinct in this document since v0.3, and the delta restates that distinction rather
than editing it.

**The delta's load-bearing quotation is verbatim at HEAD.** The P-A-6 restatement at `:1181`–`:1187` is
the substantive change of this round, and it is a quotation, so the no-implementation-echo discipline
reduces to: is the string in PLAN? I ran `grep -cF` on the full quoted span, not a fragment:

| Quotation the delta writes | `grep -cF` in PLAN at HEAD |
|---|---|
| *"or else its rows are handled under **P-A-7's governing case** — which at HEAD is case C, where no ledger remains to amend into and the obligation is green-at-landing; the amend-into-the-ledger-by-name route is case B's, and case B closed at batch 12"* | **1** (`PLAN:663`) |
| *"under case C they owe no ledger row, and they owe green — which PROPERTIES §C.4 records as discharged"* | **1** (`PLAN:561`) |
| *"the tracked `learnings*` test-side set is eighteen files"* | **1** (`PLAN:310`) |

Three for three, including the one my v14 F-02 said returned **0**. The attribution *"PLAN rewrote that
fallback at **v1.1** (TE v11 F-03)"* is also correct at the version and the credit: `PLAN:682` (the v1.1
changelog row) reads *"P-A-6's PROPERTIES fallback stops offering case B's amend-into-the-ledger route
unconditionally and instead routes to **P-A-7's governing case**, which at HEAD is C … (TE F-03)"*.

**The counting claims are the risky part of this delta, and they are right to the file.** §G.2 gap 5 now
carries a three-way derivation, and every number in it resolves against `git ls-files` at HEAD:

| Claim at `:1284`–`:1300` | Measured at HEAD |
|---|---|
| *"seventeen `learnings*` files under `pdlc/workflows/__tests__`"* (subtree as a directory) | `git ls-files pdlc/workflows/__tests__ \| grep learnings \| grep -v fixtures/learnings-baseline/` → **17** |
| *"the ladder's thirteen (twelve suites plus `helpers/learningsFixtures.js`)"* | 14 manifest rows minus the fixture-subtree row = 12 `.test.js` + `learningsFixtures.js` = **13** |
| *"plus `2fc6fcd3`'s four added test-side files"* | `learningsBaselineScenarios.js`, `learningsComposition.js`, `learningsDisclosure.test.js`, `learningsErratumBinding.test.js` → **4**; 13 + 4 = 17 |
| *"an **eighteenth** engine-side, `pdlc/engine/__tests__/learnings-config-example.test.js`"* | `git ls-files pdlc/engine/__tests__ \| grep learnings` → exactly that one path |
| *"a raw `git ls-files … \| grep learnings` returns **39 paths**, of which 22 are that subtree's fixture files"* | **39** and **22**; 17 + 22 = 39 |
| *"§C.4's inventory table also totals **eighteen** … the fourteen manifest rows plus `2fc6fcd3`'s four workflows-side files"* | inventory table `:1079`–`:1098` → **18** rows, 14 + 4 |

That is the finding I filed at v13 and re-filed at v14 closed properly: not by changing the number, but
by naming the two sets the number counts and showing they coincide *"by coincidence of arithmetic, not
by naming the same entities"*. PLAN reaches eighteen by a different decomposition (`PLAN:310`: thirteen
ladder + *"`2fc6fcd3`'s five added files"*, the fifth being the engine-side suite), and the two
decompositions agree on the set — 13 + 5 = 17 + 1 = 18. Both are right; the document now says why.

## Oracles

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
