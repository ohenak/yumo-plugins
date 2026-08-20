# Cross-Review: test-engineer — PLAN (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md
**Date:** 2026-08-19
**Iteration:** 6 (delta confirmation on erratum round 4, PLAN v1.4)
**Scope:** Delta confirmation. Routed items re-checked; PLAN re-measured against upstream at HEAD (TSPEC v1.10) and against the branch as it actually runs.

## Overview

The erratum edit answers the routed question directly and, on the two items it was asked to
settle, answers it well. `e3b9d5a3`'s early landing is now described as the state of the branch
rather than as future work; the revert-vs-keep fork TSPEC §1.3/§6 routed here is decided in the
document ("keeps them and re-derives") with three measured reasons rather than a preference; and
A6-00 is restated as *discharged by verification* with an argument — existence-only assertions
cannot be masked by seam-cardinality drift — that survives inspection.

I re-measured every load-bearing number in the new text. Nearly all of them hold:

- `advisoryWaveGate.test.js` exists and is **green** at HEAD (verified by running it), and its
  export-existence table matches A6-00's row name for name, all thirteen.
- Seven of the eight coupled surfaces already assert six members; the single untranscribed residue
  is exactly `advisoryRecord.test.js`'s `rows.map((r) => r.seam)` equality against `["A1" … "A5"]`,
  with its sibling `test.each` already retargeted — as the document says.
- No `toHaveLength(5)` remains in any advisory suite.
- The failure split is exact: 19 failures across `advisoryEnvelope`, `advisoryConfig` and
  `advisoryRecord`, plus 5 across `advisoryDriver`, `advisoryHarvest`, `advisoryDisabled` and
  `advisoryQueueSeams` — 24, every one a production-side absence closed by A6-05's green step.

What the round did not do is measure the branch **outside** the advisory suites. The wave gate's
configured command ignores `documentOracles`; the DoD's own command and CI do not. Run the way the
DoD and CI run it, HEAD is red in two more places, both caused by the same commit the round chose
to keep, and neither closed by any task in this plan. That is F-01, and it is the reason this
confirmation cannot approve.

## Batches

Re-derived mechanically from the task table at HEAD (`batch == max(dep batch) + 1`):

| Task | Deps | Dep batches | Derived | Column | OK |
|---|---|---|---|---|---|
| A6-00 | — | — | 1 | 1 | yes |
| A6-01 | — | — | 1 | 1 | yes |
| A6-04 | — | — | 1 | 1 | yes |
| A6-05 | — | — | 1 | 1 | yes |
| A6-06 | A6-04 | 1 | 2 | 2 | yes |
| A6-08 | A6-00, A6-05 | 1, 1 | 2 | 2 | yes |
| A6-10 | A6-08 | 2 | 3 | 3 | yes |
| A6-12 | A6-10 | 3 | 4 | 4 | yes |
| A6-14 | A6-12 | 4 | 5 | 5 | yes |
| A6-18 | A6-14 | 5 | 6 | 6 | yes |
| A6-21 | A6-18 | 6 | 7 | 7 | yes |

**The routed batch-column item is resolved.** Graph is acyclic, ids unique, every dependency
resolves to a declared task, and no column understates its derivation. The A6-00/A6-04/A6-05 rows
keep their wave-1 slots for reasons the document now states rather than assumes: A6-00 because its
answer is the precondition for trusting the drift analysis, A6-04 because it is test-only on a
channel the wave gate does not run, A6-05 because its green step is what closes the inherited red.

Same-batch same-new-file check, batch 1 (the only batch with parallelism): A6-00 owns
`advisoryWaveGate.test.js` (and is told not to re-create it), A6-01 owns
`helpers/advisoryDoubles.js`, A6-04 owns the new `pdlc/engine/__tests__/advisory-config-example.test.js`,
A6-05 owns the eight advisory suites plus `orchestrate-dev.js`. No two batch-1 tasks create or
append the same file, and single-writer-per-file-per-batch holds for `orchestrate-dev.js`
throughout. A6-08's later write to `advisoryWaveGate.test.js` is batch 2, serialized behind A6-00.

## Dependencies

## Verification

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
