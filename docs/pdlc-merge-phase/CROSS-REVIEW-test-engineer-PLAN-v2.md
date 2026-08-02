# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-merge-phase/PLAN-pdlc-merge-phase.md` (v1.1, commit `21e2b6e`)
**Date:** 2026-08-02
**Iteration:** 2
**Scope:** line

Delta re-review: re-ran the real parser, diffed against v1.0, and independently verified every line
cite R1 gained plus the two new load-bearing claims about `NEW_SEAMS` and `AT19_SEAM_NAMES`.

**Mechanical re-verification (executed).** Feeding v1.1 to `parsePlanTasks` +
`computeTopologicalBatches` from `pdlc/workflows/orchestrate-dev.js`: **17 tasks**, **12 waves**
(`F1,R1 / A1,B1 / A2,B2 / A3,B3 / A4 / A5 / A6,D1 / A7 / A8 / A9 / D2 / V1`), no cycle, no thin
description, max wave size **2** against the cap of 5, no `batch labels inconsistent` warning, and
**every `Batch` column value still equals its derived wave**. The DAG is byte-identical to v1.0's, so
the R1 file expansion and the A8 `haltAndQueue.test.js` addition perturbed no edge — as predicted.

## Round-1 finding dispositions

| ID | Sev (v1) | Disposition | Evidence checked |
|----|----------|-------------|------------------|
| F-01 | High | **Closed, and completely.** R1's Test File column now carries all seven test files (`haltAndQueue`, `runtimeBundle`, `orchestrateQueue`, `helpers/seams.js`, `pipelineWiring`, `pacingWrapper`, `forcePhases`), §4's batch-1 row matches, and the description enumerates every site. I re-grepped and checked each new cite individually: `orchestrate-dev.js:5164` is the `recordHaltFn({...})` call site and `:5212` the comment — the two source sites v1.0 missed; `haltAndQueue.test.js:302`/`:362` are the injection points, now named with the reason ("without which every case falls through to the no-op default and reds AT-30/33/34"); `runtimeBundle.test.js:212` is the `AT19_SEAM_NAMES` member; `helpers/seams.js:37`/`:436`/`:467`/`:471` are all four real occurrences including the definition; `pacingWrapper.test.js:59`/`:361`/`:457`/`:469`/`:1061` covers the whole chain — import, construct, inject, return from the harness, assert; `forcePhases.test.js:408` and `pipelineWiring.test.js:446` are exact. No `recordHalt` occurrence outside R1's list survives except `runtime-adapter.js:1004`, which F-05 assigns to D1. **The `RLH-WIRE-01` resolution is the right one and I verified its premise:** R1 changes the `NEW_SEAMS` member *in the same commit as the rename*, so the loop at `pipelineWiring.test.js:458` stays true continuously and no interim red is declared. No wave-1 collision: R1's `helpers/seams.js` is a different file from F1's `helpers/mergeDoubles.js` | §12 R1, §4, §5 |
| F-02 | Medium | **Closed by the better of the two options.** The sibling `RLH-AT-32-orch-merged` moves to **A8**, which builds the behaviour and can genuinely red it, and A8's file list gains `haltAndQueue.test.js`. A9 keeps only the re-expression under an explicitly **declared** no-red deviation — matching §2's existing precedent of declaring rather than complying in form — and its gate is stated as a falsifiable one rather than a vacuous pass: "the re-expressed case passes **and** reverting A8's `queueRow` line reds it". A9 also now names the **fourth** assertion (`result.queueRow === "none"`) and says why it is the load-bearing one under A8's `mergeOutcome.queueRow ?? "none"` change. A8 is alone in wave 9, so its expanded file list can collide with nothing; its overlaps with R1, A7, A9 and D2 are each separated by a real edge and recorded in §4's writers table | §12 A8/A9, §2 |
| F-03 | Medium | **Closed.** §10 step 4 is now `cd pdlc/workflows && npm test -- documentOracles`, with the reason recorded inline (no root `package.json`; the shell resets cwd between calls). Steps 1–3 are unchanged and remain the real commands | §10 |
| F-04 | Low | **Closed.** §2 now reads "every task that *consumes* one depends on it", names R1 as the deliberate exception with its justification, and §5's bullet is reworded to match | §2, §5 |
| F-05 | Low | **Closed.** D1's row now owns the `runtime-adapter.js:1004` comment rename, and says why it is D1's ("the one site R1 cannot reach") and what would otherwise trip on it (§11's "no seam named `_recordHalt` remains anywhere" box) | §12 D1 |
| F-06 | Low | **Closed, and upgraded.** The prose count is replaced by a ten-row **writers table** naming each shared file, its writers and the chain that separates them. I checked it: ten entries, all correct, and the closing line that `helpers/seams.js`, `pacingWrapper.test.js` and `forcePhases.test.js` have exactly one writer (R1) is right | §4 |

## Verification of the two new claims

Both are load-bearing and both hold — I checked the test bodies rather than taking the PLAN's word:

- **`RLH-WIRE-01` cannot break when A8 adds two parameters to `main()`.** `pipelineWiring.test.js:467`
  is `const addedSeams = names.filter((n) => NEW_SEAMS.includes(n))` and `:468` asserts
  `toHaveLength(5)`. Because it *filters* `main()`'s names down to `NEW_SEAMS` members, adding
  `_phaseMergeEnabled` and `_ghRun` — neither a member — cannot change the count. §5's "verified
  against the test body" is accurate.
- **Adding `_ghRun` to `AT19_SEAM_NAMES` is safe.** The frozen list has **no length assertion**; its
  only consumer is `buildScanSet(masked, AT19_SEAM_NAMES)` at `runtimeBundle.test.js:418`. So A8's
  addition widens the await-discipline scan to the new transport — which is exactly what should
  happen — without disturbing any count. Keeping `_phaseMergeEnabled` out, on `_phaseDodEnabled`'s
  "boolean never called" rationale, is correct.

## Positive Observations

- Nothing new broke: the derivation is unchanged, and the two files that gained writers
  (`haltAndQueue.test.js`, `runtimeBundle.test.js` via A8) are both separated by pre-existing edges,
  so the fix cost no task and no wave.
- Two improvements beyond the findings: **AT-M2a** now has an explicit owner in B2 and **AT-M5** in
  B3, where v1.0 left both traceable only through the DoD checklist. Every one of the seven ATs now
  names a task.
- §7's declared divergence from TSPEC §13.2 — the ninth test file `mergePostMerge.test.js`, forced by
  rule 2 rather than preference — is the right way to record it, and its closing claim that "no
  assertion is dropped, and every §13.2 bullet keeps a home" is the property that matters to this
  lens.
- K-1's ownership correction is a genuine catch by the author: V1 runs before the PR exists, so it
  cannot take a two-runner CI reading. Splitting it into a local reading at V1 and the two-runner
  reading at Phase DOD/PUB, with the plain-`rebase` fallback pre-approved, makes the DoD box
  satisfiable instead of aspirational.

## Recommendation

**Approved**

All six round-1 findings are closed, each verified against the code or the test body rather than
against the disposition text. The parse, the DAG, the batch column, the file-ownership manifest and
the writers table are all mechanically confirmed. Every task names its red-first ATs, the one task
without a red phase declares it, and the two closed seam-name sets that a rename would otherwise
break are handled atomically in the commit that renames. No findings remain.

## Verdict

VERDICT: APPROVED
{"high": 0, "medium": 0, "low": 0}
