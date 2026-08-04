# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md` (v1.5, 2026-08-03)
**Date:** 2026-08-03
**Iteration:** 5
**Scope:** Local

## Grounding

Delta re-review. Base for the diff is `dc6997c`, the commit v4 reviewed (v1.4); the document has moved
through six authoring commits to HEAD `bc6dccf` (v1.5). I read the diff, not the document, and
re-executed every mechanical claim the revision newly makes.

What was re-run at HEAD, and what it showed:

- **The re-parse holds at v1.5, and the eight multi-task waves the revision now enumerates are exactly
  the eight that exist.** `parsePlanTasks` ⇒ **36 tasks**, `parsePlanOwnership` ⇒ **36 rows**,
  `validatePlanContract` ⇒ `{"ok":true}`, `computeTopologicalBatches` ⇒ **20 batches**, `computeWaves`
  ⇒ **20 waves**, wave-for-wave identical to §5.2's transcription. Waves with >1 task: **3**
  (`A-03…A-07`, five agents), **4** (`A-08…A-12`), **5** (`A-13…A-15`), **6** (`A-16, A-17, A-28`),
  **12** (`A-23, A-29`), **13** (`A-24, A-30`), **14** (`A-25, A-31`), **19** (`A-34, A-35`) — the
  revision's list, in order, with the "five agents" annotation correct. Wave 18 is `A-33` alone, so
  §5.2's batch-18 and §9.1's "one writer and one reader" claims hold.
- **The jest transcription is now literally right.** I re-ran `npm test -- --json --outputFile=… 'guard.*\.test\.js'`
  from `pdlc/workflows/` on the pinned jest (`package.json` pins `"jest": "^29.7.0"`). Top-level
  numeric keys are `numFailedTestSuites, numFailedTests, numPassedTestSuites, numPassedTests,
  numPendingTestSuites, numPendingTests, numRuntimeErrorTestSuites, numTodoTests, numTotalTestSuites,
  numTotalTests`; `testResults[0]` keys are `assertionResults, endTime, message, name, startTime,
  status, summary`; and a full-document string search finds **no** `testFilePath` and **no**
  `numPassingTests` anywhere. That is exactly what §5.2 now says, to the spelling — F-13's fix is
  verified, not merely applied.
- **The new "jest exits non-zero at batches 1–2" claim is true.** Running the targeted command with
  the `advisory.*\.test\.js` pattern against HEAD (where no such file exists) prints `Pattern:
  advisory.*\.test\.js - 0 matches` and exits **1**, with an `--outputFile` document still written.
  The new sentence saves an agent from reading that exit as a red wave.
- **Ownership disjointness inside the three two-task 🟢 waves, which the new scoping rule leans on.**
  §4.2: A-23 owns `advisoryDodSeams.test.js` + `advisoryDriver.test.js`, wave-mate A-29 owns
  `advisoryQueueSeams.test.js`; A-24 owns `advisoryPubSeam.test.js` + `advisoryDriver.test.js`,
  wave-mate A-30 owns `advisoryQueueSeams.test.js`; A-31 owns `advisoryQueueSeams.test.js` +
  `advisoryDriver.test.js`, wave-mate A-25 owns `advisoryDodSeams.test.js`. Pairwise disjoint in every
  case, so §5.2's "the two agents' assertions never read each other's files" is sound as written.
- **The runner shape the whole revision turns on.** `pdlc/workflows/orchestrate-dev.js:8101-8107` is
  the concurrent dispatch, `:8112-8123` the script-owned gate, `:8129-8140` the script-owned
  post-wave build, `:8143-8160` the per-task commit loop, `:2377` `pathsCollide`, `:5849` the
  "do not run the full suite" prompt line. There is no post-wave *agent* hook — the revision's
  load-bearing claim is correct; two of the line references around it are not (F-15, F-16).
- **`--listTests` ⇒ 69 files at HEAD, and §5.2's "68 suites" is still right**, because §2.4's repaired
  `testCommand` excludes `documentOracles.test.js` (PLAN:424). I checked this because the number is
  load-bearing for A-01's gate row and I did not want to assume it had survived the branch.

Only findings that survived that check appear below.

## Prior findings — disposition

_(pending)_

## Findings

_(pending)_

## Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_
