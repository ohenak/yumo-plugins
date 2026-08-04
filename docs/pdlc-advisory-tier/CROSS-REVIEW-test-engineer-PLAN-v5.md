# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md` (v1.5)
**Date:** 2026-08-03
**Iteration:** 5
**Scope:** delta re-review — my v4 findings (F-01 High, F-02 Low) and question (Q-01), plus new
issues in the changed sections only. Testing lens: testability, TDD ordering, batch-DAG mechanics,
oracle falsifiability, coverage measurability.

## Disposition of my v4 findings

Diffed `dc6997c..HEAD` (six revision commits, `f6e8665` … `bc6dccf`) over the PLAN. **Both v4
findings and the v4 question are resolved**, and every claim below was re-executed against HEAD, not
read off the document.

| v4 | Verdict | Evidence |
|---|---|---|
| F-01 (H) one `/tmp/adv-gate-w{n}.json` path, up to five concurrent writers; batch 3–5's defective-red detector passes vacuously by absence | **Resolved on all three consequences, and resolved structurally rather than by adding a caveat.** (a) *Last-writer-wins* is gone: §5.2 replaces the per-wave path with `/tmp/adv-gate-{taskId}-pre.json` / `-post.json`, "one writer per file, so no race", and no stale `w{n}` reference survives outside the historical 1.3/1.4 changelog rows (grepped). (b) *Vacuous pass by absence* is closed by the named **existence conjunct**: "`perFile` must contain a key for **each** of this task's owned `advisory*.test.js` paths. A missing key **fails** the gate" — restated inside the batch 3–5 row itself as conjunct (1), ahead of the numbers conjunct (2), so the detector is quantified over a *declared* set rather than over whatever jest happened to collect. (c) *Mid-flight sibling attribution* is closed by scoping every assertion to the running task's own §4 manifest rows, with the disjointness argument grounded at `pathsCollide` (`orchestrate-dev.js:2377` — exact, `function pathsCollide(a, b) {`). I re-executed the manifest: wave 3 is five agents each owning exactly one distinct `advisory*.test.js` (`advisoryConfig`, `advisoryRung`, `advisoryVerdict`, `advisoryEnvelope`, `advisoryDriver`), and wave 12/13/14's pairs are disjoint in exactly the way the new 7–17 row claims — A-23 owns `advisoryDodSeams` + `advisoryDriver` against A-29's `advisoryQueueSeams`; A-24 owns `advisoryPubSeam` + `advisoryDriver` against A-30's `advisoryQueueSeams`; A-31 owns `advisoryQueueSeams` + `advisoryDriver` against A-25's `advisoryDodSeams`. The union-over-tasks framing ("the wave's claim is the union over its tasks' summaries") makes the wave-level claim complete by construction, since each task asserts over its own declared set. |
| F-02 (L) P-4's ladder range `TSPEC:525-534` omits check 6 | **Resolved, with the correction stated rather than silently applied.** §6.5 P-4 now cites `TSPEC:525-535` and adds "the six rows themselves at `:530-535`, so check 6, `X-c / membership`, is inside the range". Re-read at HEAD: `TSPEC:528` table header, `:529` separator, `:530`…`:535` the six checks, `:535` = `| 6 | X-c / membership | …`. Exact in both the outer and the inner range. |
| Q-01 (batches 1–2: the targeted pattern matches nothing and jest exits non-zero) | **Answered, and the premise is now verified rather than assumed.** §5.2 adds "**The targeted run applies from executor batch 3 onward** — the first batch that creates an `advisory*.test.js` file … no gate row there asks for the run, and no agent should perform it defensively." I confirmed the failure mode is real on the pinned jest: `npm test -- --json --outputFile=… 'advisory.*\.test\.js'` at HEAD exits **1** with `Pattern: advisory.*\.test\.js - 0 matches`, so the clause prevents a genuine false red, not a hypothetical one. |

## Verification performed

Everything below was executed against the working tree at HEAD.

| Check | Result |
|---|---|
| §5.2's transcription paragraph, field for field | **Executed on the pinned jest** (`npx jest --version` ⇒ 29.7.0). `testResults[0]` keys are exactly `assertionResults,endTime,message,name,startTime,status,summary` — the literal the PLAN transcribes, in the PLAN's order, with nothing extra. `JSON.stringify(doc).includes('testFilePath')` ⇒ **false**, so "`testFilePath` appears nowhere in the document at any level" is exact, not approximate. Top-level `num*` keys are `numFailedTestSuites,numFailedTests,numPassedTestSuites,numPassedTests,numPendingTestSuites,numPendingTests,numRuntimeErrorTestSuites,numTodoTests,numTotalTestSuites,numTotalTests` — so the v1.5 spelling correction is right (`numPassedTests` / `numFailedTests`, **not** `numPassingTests` / `numFailingTests`, which v1.4 had wrong) and "no per-file counters at all" holds. |
| §5.2's `perFile` reducer, verbatim, on the new path | **Re-executed** against `guardMatrix.test.js`: `{"guardMatrix — core rows (M01–M32, M34–M90)": {passed:19, failed:0, pending:70}, "guardMatrix — M33 G6 re-run": {passed:53, …}, "guardMatrix — suite self-audit meta-tests": {passed:3, …}}`. File totals `passed 75 / pending 70` match top-level `numPassedTests` 75 / `numPendingTests` 70 — the parenthetical in §5.2 is exact. The block partition by `ancestorTitles[0]` (which the whole per-block delta rests on) is unchanged from v4, where I also proved it survives a whole-block `describe.skip`. |
| The batch 1–2 exemption's premise | **Executed.** Targeted run with the advisory pattern at HEAD: exit **1**, `Pattern: advisory.*\.test\.js - 0 matches`. See Q-01's disposition above. |
| `computeWaves` ⇒ 20 waves, and the eight multi-task waves §5.2 now enumerates | **Re-executed and confirmed member-for-member**, and this time against the *claim v1.5 added*: multi-task waves are exactly **3** (`A-03…A-07`, five agents), **4** (`A-08…A-12`), **5** (`A-13…A-15`), **6** (`A-16, A-17, A-28`), **12** (`A-23, A-29`), **13** (`A-24, A-30`), **14** (`A-25, A-31`), **19** (`A-34, A-35`) — eight, exactly the set §5.2 lists, in order. Single-task waves are 1, 2, 7, 8, 9, 10, 11, 15, 16, 17, 18, 20 — §5.2's "(7–11, 15–18, 20)" is the correct subset once 1–2 are carved out by the batch-3-onward clause, and "wave 18 is `A-33` alone" is exact. |
| The runner's concurrency claim | True; the citation is one line short — see F-02. `const waveResults = await parallelFn(` is at `orchestrate-dev.js:8101`, `wave.map((task) =>` at `:8102`, `agentFn("se-implement", …)` at `:8103`, under the comment `// SAME TREE, in parallel: no isolation: "worktree"` at `:8099-8100`. There is indeed **no post-wave agent hook**: the next statements are `evaluateWaveDispatch` then the script gate `const gate = await runCommandFn(implConfig.testCommand)` at `:8113`, then the per-task commit loop under `// Only now — verified — does anything get committed (M-6).` at `:8142`, first `await commitPaths({` at `:8152`. The gate `:8113-8118` and commit `:8143-8159` citations are exact-enough inner ranges, as in v4. |
| PLAN self-parse after the v1.5 edits (§9.1's restated checkbox) | **Executed** against `orchestrate-dev.js` at HEAD: `parsePlanTasks` ⇒ **36 tasks**, `parsePlanOwnership` ⇒ **36 ownership rows**, `validatePlanContract` ⇒ `{"ok":true}`, `computeTopologicalBatches` ⇒ **20 batches**, `computeWaves` ⇒ **20 waves**, no cycle, 36 unique ids. §9.1's v1.5 wording is exact, including "the second fenced command block adds no table-visible pipes" — the fence contains two `npm test` lines with no `\|`. |
| Batch-column re-derivation | **Re-derived all 36 rows** from the `Deps` column against the PLAN's own `Batch` column (`batch == max(dep batch) + 1`): **zero desync**, ids unique, every dependency resolves, acyclic. (The executor's own grouping differs at A-08…A-15/A-17 purely because `computeTopologicalBatches` applies the size cap — that split is what §5.2's two-column gate table already transcribes as "executor batch" vs "§3 labels".) |
| §9.2 (i)'s new parenthetical | The conjunct is sound but the stated reason is not — see F-03. Verified mechanically: `commitPaths` runs once per task in wave order, so for the *second* task committed in a multi-task wave `{commit}^` is a wave-mate's commit, but for the *first* it is the previous wave's last commit (or its `postWavePathspecs` chore commit, `:8163`). And an earlier wave's commit **can** have touched `{testFile}`: `advisoryDriver.test.js` is un-skipped by A-23 (wave 12), A-24 (wave 13) and A-31 (wave 14). |
| §6.5 P-4's re-attribution against TSPEC | `TSPEC:514` `@returns {{ inside: boolean, reason: string\|null, matched: string[] }}`; `:515` the three-member reason enum; `:517` the signature; `:528` header, `:529` separator, `:530-535` the six checks with check 6 (`X-c / membership`) at `:535`; `:1405` the absorbing property. Every anchor in P-4 now lands. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
