# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md` (v1.1)
**Date:** 2026-08-03
**Iteration:** 1
**Scope:** testing lens only — testability, TDD ordering, batch-DAG mechanics, oracle falsifiability, coverage strategy.

## Verification performed

Every claim below was executed or grepped against the working tree at HEAD `e7ffd1d` (the PLAN cites
`ca55bb6`; only doc commits separate them, and every code line the PLAN cites still resolves).

| Check | Result |
|---|---|
| §2.2 `BL-PREREQ` line numbers | **all 18 rows confirmed** — `guardVerdict` `orchestrate-dev.js:731`, `effectiveGuardPaths` `:708`, `commitPaths` `:6905` (no `export`), `gitWithLockRetry` `:6862`, `parseImplementationConfig` `:181`, `rebaseOntoDefault` `:6254`, `raisePrAndVerifyCi` `:6337`, `checkPrCi` `:5927`, `defaultAppendFile` `:6805`, `dodVerifyLoop` `:6273`, `parseDodStatus` `:6059`, `parsePlanTasks` `:2039`, `buildFinalReport` `:8595` (no `export`), `MERGE_ESCALATIONS` `:1321`, `MODEL_IMPLEMENTATION` `:1621`; `orchestrate-queue.js` `parseTriageVerdict:302`, `triagePrompt:653`, `precheckDependencies:630`, `parseQueue:116`, `buildQueueReport:1221`, `runPicked:961`; guard-script tokens at `:35`, `:43`, `:57`–`:59` |
| §2.1 rebase pins | `git merge-base --is-ancestor 26c3f1c HEAD` ⇒ true; same for `5d66c48`. A-01 replacing the rebase task is justified |
| §7 integration-point line numbers | all resolve within ±2 lines (`:8282`–`:8288` rebase halt, `:8294`–`:8302` DoD halt, `:8341`–`:8350` guard literal + regex, `:6371` `status === "failed"`, `queue:890`–`:897` precheck skip, `queue:912`–`:920` needs-human, `queue:758` `main` params — confirmed to lack `_appendFile` today, `build-runtime.mjs:87` export array / `:96`–`:103` prelude) |
| §9.1 parse claim | **executed.** `parsePlanTasks` ⇒ 37 tasks, `parsePlanOwnership` ⇒ 37 rows, `validatePlanContract` ⇒ `{"ok":true}`, `computeTopologicalBatches` ⇒ **20** batches, no cycle, no label warning. §5.2's 20-row transcription matches the executor's grouping exactly |
| Batch-DAG re-derivation | **re-derived all 37 rows** from the `Deps` column: every `Batch` cell equals `max(dep batch) + 1`. No desync, no cycle, no unresolved dependency, no duplicate id |
| Same-batch same-new-file | **no collision.** Every file in §4 has exactly one owner; §3 batch 4 (A-16/A-17/A-28), batches 10–12 (dev+queue pairs) and batch 17 (A-34/A-35) are path-disjoint |
| §5.1 gate defect (A-00's premise) | **reproduced.** `npm test -- --testPathIgnorePatterns=documentOracles` at HEAD ⇒ `Test Suites: 23 failed, 69 passed, 92 total`. The restated form ⇒ `--listTests` returns exactly **68** files, as claimed |
| Existing test-infra citations | `__tests__/helpers/mergeDoubles.js`, `helpers/seams.js`, `helpers/guardFixtures.js`, `fixtures/tmpGitFixture.js` all exist; `helpers/advisoryDoubles.js` and `fixtures/created-files-26c3f1c.json` are correctly declared new; no `advisory*.test.js` exists yet |
| TSPEC §14.1 symbol set | exists and is per-component, but see F-06 |

## Findings

## Questions

## Positive Observations

## Recommendation

