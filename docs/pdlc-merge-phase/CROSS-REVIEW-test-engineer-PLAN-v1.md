# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-merge-phase/PLAN-pdlc-merge-phase.md` (v1.0, commit `2f58d55`)
**Date:** 2026-08-02
**Iteration:** 1
**Scope:** line

I ran the document through the real `parsePlanTasks` + `computeTopologicalBatches` rather than
eyeballing it, and grepped the actual rename surface. The parse result is exactly as §3 and §5 claim.
One finding blocks.

**Mechanical verification (executed, not asserted).** Importing `parsePlanTasks` and
`computeTopologicalBatches` from `pdlc/workflows/orchestrate-dev.js` and feeding this file:
**17 tasks** (`F1 R1 A1 B1 A2 B2 A3 B3 A4 A5 A6 D1 A7 A8 A9 D2 V1`), **12 waves**
(`F1,R1 / A1,B1 / A2,B2 / A3,B3 / A4 / A5 / A6,D1 / A7 / A8 / A9 / D2 / V1`), no cycle, **every
`Batch` column value equals its derived wave**, no task with a thin description, largest wave = 2
against the dispatcher's sub-batch cap of 5 (`orchestrate-dev.js:4084`), and — notably — the run
emitted **no** `PLAN batch labels inconsistent` warning, which the review-loop-hardening PLAN does
emit. §3's supporting claims reproduce exactly too: `PLAN-pdlc-review-loop-hardening.md` → 289
tasks, `PLAN-pdlc-workflow-distribution.md` → 247, both throwing
`PLAN dependency graph contains cycle`.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **R1's rename surface is under-scoped by three whole test files, one shared helper and two injection lines, so R1 cannot meet the PLAN's own green gate.** §2 rule 3 requires the **whole suite** green before a task is reported done, and §4 makes the file manifest the audit surface. `grep -rn "recordHalt\|RecordHalt"` finds the seam in **six** test files; R1 declares three. Un-owned by *any* task: **`__tests__/pipelineWiring.test.js:446`** — `_recordHalt` is a member of the `NEW_SEAMS` list asserted by `RLH-WIRE-01: main()'s parameter list carries five new seams` (`:441`–`:449`), so this reds the moment R1 lands in wave 1 and stays red until A8 in wave 9; **`__tests__/pacingWrapper.test.js:457`** (`_recordHalt: recordHalt`); **`__tests__/forcePhases.test.js:408`**; and **`__tests__/helpers/seams.js`**, which *defines* `recordingRecordHalt` (`:471`) and names the seam at `:37`, `:436`, `:467`. Two further sites sit inside files R1 *does* own but outside its enumerated line list: `haltAndQueue.test.js:302` (`_recordHalt: recordHalt`) and `:362` (`extraArgs: { _recordHalt: queueBackedRecordHalt }`) are the harness's actual **injection** points — R1 lists only assertion lines `:383/:428/:831/:837/:857/:860`, and missing `:302` makes every test in that file fall through to the default no-op returning `queueRow: "none"`, which reds AT-30/33/34 and would let others pass vacuously; and `runtimeBundle.test.js:212`, where `_recordHalt` is a member of the **frozen closed thirteen-name set** `AT19_SEAM_NAMES` (`:210`–`:214`) — R1 cites only `:1038`. On the source side R1 names `orchestrate-dev.js:4286` and `:4321` but not the call site `:5164` (`recordHaltFn({...})`). **Fix:** add `helpers/seams.js`, `pipelineWiring.test.js`, `pacingWrapper.test.js` and `forcePhases.test.js` to R1's Test File column and to §4's batch-1 row, and add the six missing line citations to R1's description. I checked the consequences: none of the four collides with F1's wave-1 files (`helpers/mergeDoubles.js`, `helpers/mergeDoubles.test.js`, `fixtures/queue-goldens/`), and R1↔A8's new shared ownership of `pipelineWiring.test.js` is separated by the chain `R1→A1→…→A8`, so **the batch derivation does not move** — §4's "written by more than one task" list just gains a row | §12 R1, §4 batch 1, §2 rule 3 |
| F-02 | Medium | Local | **A9's red-first step is unexecutable at A9's position in the DAG.** A9 depends on A8, and its red-first instruction is "the sibling case, which must fail against A8's predecessor and pass after it". An `se-implement` agent at wave 10 cannot check out A8's predecessor, so `RLH-AT-32-orch-merged` is **green on first write** — A8 already built the behaviour. That violates §2 rule 1 ("observe them fail for the stated reason") with no declared deviation, unlike the honest one §2 makes for the red-row split. Two clean resolutions: (a) declare A9 a second, named deviation — it is a *supersession* task retro-fitting assertions to behaviour A8 owns, so it has no red phase by construction; or (b) move the sibling case into **A8**, which owns the behaviour and can genuinely red it, leaving A9 only the re-expression of the existing case. (b) is preferable and costs nothing: A8 would gain `haltAndQueue.test.js`, which is separated from R1's copy by the chain and from A9 by `A9 → A8`. Also worth stating in A9's row: the existing case's four assertions are `outcome === "success"`, three `not.toContain` on `recordHalt.statuses`, and `result.queueRow === "none"` (`haltAndQueue.test.js:809`–`:821`) — the row says "the three `not.toContain` assertions" but never names the fourth, and `queueRow` is exactly the one A8's §10.1 change (`mergeOutcome.queueRow ?? "none"`) makes load-bearing. The harness supports the sibling either way: `run()`'s `extraArgs` (`:222`) forwards into `main()`, so `_ghRun`/`_phaseMergeEnabled` can be injected without touching another file | §12 A9, §2 rule 1 |
| F-03 | Medium | Local | **§10 step 4's command cannot run as written.** §10 says "run from the repository root, in this order"; step 1 correctly carries `cd pdlc/workflows &&`, but step 4 is a bare `npm test -- documentOracles`. There is **no `package.json` at the repository root** (only `pdlc/workflows/package.json`), and an agent's shell resets cwd between calls, so step 4 fails from the stated cwd and cannot inherit step 1's `cd`. Make it `cd pdlc/workflows && npm test -- documentOracles`. Steps 1, 2 and 3 are the real commands and are correct as written — `cd pdlc/workflows && npm test`, `node pdlc/workflows/build-runtime.mjs --check`, and `pdlc/hooks/scripts/sync-workflows.sh --check` invoked **by bare path** with the exit-126 note, all matching CLAUDE.md; `__tests__/documentOracles.test.js` exists, so only the `cd` is missing | §10 step 4 |
| F-04 | Low | Local | §2 states "**F1** is a batch-1 task … and **every downstream task depends on it**". R1 does not — it is F1's wave-1 peer with `Deps: -`. That is *correct* (R1 uses none of F1's doubles or goldens; its tests extend the existing `haltAndQueue`/`runtimeBundle` harnesses), but as phrased the claim is falsified by the DAG it describes. State the exception in one clause so a reviewer does not read it as a universal. The substantive half of rule 4 does hold: every task that consumes a double or golden is transitively after F1, and `F1 → B1 → B2` genuinely guarantees the goldens are captured before B2 changes `updateQueueStatus` | §2, §5 |
| F-05 | Low | Local | TSPEC §11.3 requires `runtime-adapter.js:1004`'s comment — "`_recordHalt` is deliberately ABSENT" — to be renamed to `_recordQueueRow`. R1 owns the rename but not that file; **D1** owns `runtime-adapter.js` (wave 7) and its description does not mention it, so the stale comment can ship. One clause in D1's row closes it. Comment-only, hence Low, but it is the kind of thing the DoD's "no seam named `_recordHalt` remains anywhere" checkbox (§11) will trip over | §12 D1, §11 |
| F-06 | Low | Local | §4's closing paragraph opens "**Four** files are written by more than one task" and then enumerates **seven** (`orchestrate-dev.js`, `orchestrate-queue.js`, `runtimeBundle.test.js`, `haltAndQueue.test.js`, `mergeObservations.test.js`, `mergeQueueWriteback.test.js`, `build-runtime.mjs`). The list is the correct one and F-01 adds an eighth; only the count word is wrong. Worth fixing because that paragraph is the audit surface K-4 points at | §4 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-01: is the intent that R1 is a whole-repo rename (in which case its file list simply needs the four additions), or that A8 absorbs the `pipelineWiring.test.js` half? The first keeps the derivation unchanged, which is why I recommend it — but the second is defensible if R1 is meant to stay minimal. |
| Q-02 | F-02: would you rather declare A9's missing red phase, or move the sibling into A8? Either resolves it; the PLAN should say which, since §2 already sets the precedent of declaring a deviation rather than complying in form. |

## Positive Observations

- The batch derivation is not merely asserted — I reproduced it with the shipped dispatcher and it matches the `Batch` column on all 17 rows, with no `batch labels inconsistent` warning. §5's wave list is exact.
- §4's manifest holds where it matters: all five multi-task waves are collision-free, and I checked every one of the seven repeated-file pairs transitively — `R1/D2` (runtimeBundle), `R1/A9` (haltAndQueue), `A2/A5` (mergeObservations), `B1/B2` (mergeQueueWriteback), `A7/A8` (mergePhase), `R1/B2` (orchestrateQueue), `R1/D2` (build-runtime) — every one separated by a real `Deps` edge, never by prose.
- §3's discovery that a *data* row can capture the parser through loose substring predicates, and the rewording of `forbids`/`depends on` in §8 to prevent it, is a real find with a demonstrated failure mode. The §11 DoD checkbox that re-runs the parse after any edit above §12 is the right guard.
- D2's four explicit deps transitively cover all 15 predecessors, so §9's "the last source-touching commit rebuilds" rule holds without needing a 15-edge row, and V1 (wave 12) touches no production code so it cannot invalidate it.
- Every task row genuinely names its red-first ATs, which is the property §2's declared deviation promised to preserve — A3's AT-M3 arms plus near-misses, A4's per-guard §11 row ids, A7's 25-row table, B3's AT-M4, D1's three reply arms including the `stderr`-preserving one. That is the substance the split-row rule exists for, and it is present.
- §7 correctly routes my TSPEC-v3 Low (`not-confirmed`) to A6 with a concrete membership assertion rather than leaving it as a note.

## Recommendation

**Needs revision**

One High: R1 renames a seam whose consumers live in three test files and one shared helper it does
not own, plus two injection lines inside files it does, so it cannot leave `npm test` green — and
`pipelineWiring.test.js`'s `RLH-WIRE-01` would stay red for eight waves. The fix is mechanical, adds
no task, and leaves the batch derivation unchanged, which I verified. Two Mediums (A9's unexecutable
red step, §10 step 4's missing `cd`) and three Lows are each a clause or a word. Nothing here asks
for new scope; the parse, the DAG and the file manifest are otherwise sound.

## Verdict

VERDICT: REVISE
{"high": 1, "medium": 2, "low": 3}
