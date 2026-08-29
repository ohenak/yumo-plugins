# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md` (v0.1, Draft)
**Date:** 2026-08-28
**Iteration:** 1

## Overview

This is a testing-lens review of a 21-task, 10-batch PLAN whose dominant constraint — every
production symbol lands in the single file `pdlc/workflows/orchestrate-dev.js` — the author
identified correctly and serialised correctly. The red/green pairing, the `[Fake first]` label on
T-01, the batch-column arithmetic, the failure-row (F-1…F-14) ownership table and the
acceptance-test (AT-01…AT-18) ownership table are all present and, where I re-derived them
mechanically, all correct. The document is well above the usual bar for a first draft.

Four findings gate it, and all four are of one kind: **tasks the PLAN does not have for gates the
repository already runs**, or **assertions the PLAN names in a green row that no red row owns**.
None of them is a disagreement with the design; each is a missing row.

The single most urgent one is F-01: the repository carries a literal test-file census in
`pdlc/workflows/__tests__/documentOracles.test.js` that reds the moment batch 1 lands, before any
production code exists. That must be fixed inside batch 1 or the first wave gate halts.

I verified every file path, symbol, count literal and gate command the PLAN asserts against HEAD
(`feat-pdlc-decision-ledger`); the results are in `## Verification` below.

## Batches

**Red-before-green.** Every `[green]` row (T-13…T-19) names a `[red]` predecessor in `Deps` and
shares a test file with it; the PLAN's own red-before-green table renders the pairing explicitly.
I checked each pair against the Test File column and found no unpaired green **except T-19**, whose
Test File column names two files (`documentOracles.test.js` and
`decision-ledger-config-example.test.js`) while only the second has a red predecessor (T-12). See
F-04.

**`[Fake first]`.** T-01 is labelled `[Fake first]`, sits in batch 1, and every consumer of the
doubles (T-04…T-11) carries `T-01` as a real dependency edge. Correct.

**Same-batch same-new-file collisions.** I enumerated the PLAN's own file-ownership manifest and
checked it pairwise. Batch 1's five tasks own pairwise-disjoint paths
(`decisionLedgerPreflight.test.js`, `helpers/decisionLedgerDoubles.js`,
`decisionLedgerBaselineGuard.test.js` + `fixtures/decision-ledger-baseline/**`,
`decisionLedgerFixtureGuard.test.js` + `fixtures/decision-corpus/**`,
`pdlc/engine/__tests__/decision-ledger-config-example.test.js`). Batch 2's six tasks likewise. The
six writers of `orchestrate-dev.js` are one-per-batch (3, 4, 5, 6, 7, 8). **No collision.** The
PLAN's decision to put T-02's `scenarios.mjs` inside the fixture directory rather than
`__tests__/helpers/` is the right call and for the stated reason — it avoids a second batch-1 task
writing into `helpers/`, which T-01 owns.

**RED-terminal batches 1–2.** The contract is stated correctly and matches the precedent the
repository actually sets: I confirmed committed-`test.skip` red modules exist in
`pdlc/engine/__tests__/loop-config-example.test.js:24`, `loop-distribution.test.js:10`,
`packaging.test.js:8`, `postinstall.test.js:5`, `publish-channel.test.js:2` and
`fixture-machine.test.js:9`. T-12's shape is a faithful clone of that precedent.

**Mutation obligations.** T-07 (four named mutations) and T-02 (three-step mutation proof) both
require the mutation be applied, observed red, reverted, and the observed failure transcribed into
the test file header. That is the discipline this project's oracle-falsifiability checks ask for,
and it is written as an acceptance condition rather than a hope. Good.

**Property-based coverage.** `fast-check` appears in exactly two rows: T-04 (config totality over
arbitrary JSON) and T-07 (bounds, quantified over set size × line sizes × bounds). Two
parameterisable components have **no** property strategy at all — `recogniseDecisionRecords` (T-05),
a parser over heading text, and `renderDecisionLedgerBlock` (T-06), a serialiser. Both are
example-only, table-driven against cited Baseline instances. See F-07.

**Anti-echo.** The PLAN's `## Anti-echo commitments` section is the strongest part of the document:
T-09's statements/citations/`6,305`/`10,859` are required to be hand-transcribed from the fixture
and never captured from the renderer; T-07's oracle model carries its own formatter transcribed
from TSPEC §4.3 rather than calling the production renderer (`DEC-DECLEDGER-11`); T-02's
`EXPECTED_MERGE_BASE_SHA` is a hand-transcribed literal rather than a value computed at test time.
That is precisely the no-implementation-echo discipline, applied at the three places it matters.

**Set-equality over containment.** Applied in the right places and refused in the right places:
T-12 asserts **containment** at the top level (so a sibling feature's new block does not red it) and
**set equality** inside the `decisionLedger` block (so a fourth key fails); T-04 asserts set equality
over C-3's key enumeration; T-11 asserts set equality between `DECISION_LEDGER_CENSUS_TOKENS` and the
exported decision-ledger names, which is what stops a later symbol escaping the census.

## Dependencies

_pending_

## Verification

_pending_

## Findings

_pending_

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Verdict

_pending_
