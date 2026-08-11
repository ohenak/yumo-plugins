# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.2)
**Upstream read:** `REQ-pdlc-headless-engine.md`; `docs/_constraints/pdlc-engine-baseline.md` (M-ENG-07)
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v2.md` (2 High, 1 Medium, 1 Low)
**Diff reviewed:** `dee5787c..HEAD` on the TSPEC (+263/−36)
**Date:** 2026-08-11
**Iteration:** 3
**Scope:** delta re-review — v2 findings and the sections v1.2 changed; unchanged sections not re-litigated

## Disposition of v2

Both Highs are closed, and closed at the root rather than in the assertions that consumed them —
which is what I asked for. Every citation the fixes rest on I re-read at HEAD.

| v2 finding | Subject | v1.2's answer | Status |
|---|---|---|---|
| F-01 High | §7.4's model-map harness asserted over a key (`(phase, model)` pairs) the run cannot produce; AC-3.3's reverse direction unowned | §7.4 restated as AC-3.3's own two directions — forward containment over model values, reverse a per-row witness table with all seven rows transcribed literally; rows 1/2 asserted as the *quantifiers* they are, row 4 discriminated by `seq` ordering plus the forced resolution error, rows 6/7 by `corpusRun` + `skill` | **Resolved, and it now matches AC-3.3's own wording rather than a stronger paraphrase.** `REQ:483-486` defines the equality as exactly "every dispatch descriptor's model value … appears in the map, and every map row is exercised by at least one descriptor" — containment plus per-row witness *is* the criterion, not a weakening of it. Witnesses check out: row 1 `pdlc-engine-baseline.md:132`; row 4's fallback is a second `dispatchAt` on the rejection path (`orchestrate-dev.js:1841` inside `dispatchAt`, `:1851` primary, `:1861` fallback), so the fable descriptor really does immediately precede the opus one by `seq`; row 5's queue triage really is `se-author` under `MODEL_QUEUE` (`orchestrate-queue.js:1216`, `:1053`, `:70`) announced under `"Queue: Triage"` (`:1170`) which normalises to `"Queue"` |
| F-02 High | `DispatchCounts.byPhase` keyed on `label`, which is `null` at every dispatch site, so FSPEC §12.2's per-phase row would be one bucket | §4.1 takes the phase from the `_phase` seam held as adapter run state and stamps it on the descriptor; §4.4 rekeys `byPhase`, `RetryRow` and `authSources` on it and keeps `label` only where it is honestly a log tag; §8.3 gains the adapter row and justifies the workflows-untouched claim | **Resolved.** The `_phase` call sites are all real and all shaped `"{Phase}: {detail}"` — `orchestrate-dev.js:9516`, `:9951`, `:10066`, `:10136`, `:10248`, `:10289`, `:10314`, `:10445`, `:10500`, `:10573`; `orchestrate-queue.js:1065`, `:1130`, `:1144`, `:1170`, `:1400` — so the prefix-to-first-colon normalisation is total over them. The adapter's `_phase` does only log today (`adapter.mjs:357-359`), and the stale comment (`:266-268`) is now on §8.3's edit surface. The delegated pipeline keeps its phase provenance because the engine wraps `_runPipeline` and injects `adapter._phase` (`run.mjs:114-121`), which the queue itself could not have supplied (`orchestrate-queue.js:1420` passes `{ reqPath }` alone) — one detail I had not checked in v2 and that holds |
| F-03 Medium | `loop.stopReason` silent on `runQueueLoop`'s refusal and non-`ran` exits | Third member `"stopped"` plus `loop.lastOutcome`, with AC-1.3's two kept as the only members reachable on a zero-exit loop | **Resolved.** `run.mjs:277-278` (`refused`), `:280` (`outcome \|\| "unknown"`), `:282` (`max-passes`) are all now named. AC-4.5's "names which of AC-1.3's two stop reasons ended the loop" (`REQ:570`) still reads true |
| F-04 Low | `loop.maxIterations` stated as `null` while the value in flight is `Infinity` | Conversion made explicit where the block is assembled, with a test on the in-memory object rather than the round-tripped JSON | **Resolved as asked** |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
