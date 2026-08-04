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

| v4 ID | Severity | Status | Evidence in v1.5 |
|---|---|---|---|
| F-12 | Medium | **Resolved, and resolved at the level I asked for.** | §5.2 gains a paragraph headed "The producer is the task, not the wave — and there is exactly one writer per artifact", which names all eight multi-task waves (I re-ran `computeWaves`: the list and the "five agents" annotation are exact), cites the concurrent dispatch and the absence of a post-wave agent hook, and replaces the single `/tmp/adv-gate-w{n}.json` with per-task `/tmp/adv-gate-{taskId}-pre.json` / `-post.json` — 🟢 tasks run both, 🔴 tasks run the post form only. All three consequences I named are closed: the producer is now named (the task), the path is no longer shared (one writer per artifact), and the snapshot is no longer mid-wave (both documents are produced by one agent over files only that agent owns, verified disjoint above). The cross-wave retention rule is explicitly retired, so no assertion depends on wave ordering any more. §5.2's batch 3–5 and 7–17 rows, §9.1's zero-skips checkbox and §9.2 (ii) are all re-pointed at the task-scoped pair, and §3 step 4 is restated to match. |
| F-13 | Low | **Resolved, verified by execution.** | The transcription paragraph now reads "**no per-file counters at all**. The aggregate counters that do exist are `numPassedTests` / `numFailedTests` / `numPendingTests` (note the spellings — not `numPassingTests` / `numFailingTests`), at the **top level only** … `testFilePath` appears nowhere in the document at any level, so the file path must come from `testResults[].name`." I re-dumped a real `--json` document at HEAD: the top-level key set matches, `testFilePath` and `numPassingTests` do not occur at any level. §9.1's derived checkbox was updated in the same direction ("no per-file counters at all; the aggregate `numPendingTests` exists only at the top level"). |
| F-14 | Low | **Resolved** | §6.5's P-4 row now cites `TSPEC:525-535` and adds the disambiguating parenthetical "the six rows themselves at `:530-535`, so check 6, `X-c / membership`, is inside the range". |
| Q-10 | — | **Answered, and answered by removing the premise rather than stating it.** | I asked whether the PLAN wanted to state the "no new block appears between two snapshots" premise. §5.2's retention paragraph now derives it instead: "Because both readings are of a file only this task owns, the block population of that file cannot change between them (no wave-mate writes it; the task itself adds no `describe.skip` block, it only removes `.skip`), which is what makes 'and every other block in the file is unchanged in all three counters' a checkable invariant rather than an assumption about wave ordering." That is stronger than the clause I proposed — it holds without reference to §3's task ordering at all. |
| Q-11 | — | **Answered** | §9.2 (i) now carries the parenthetical: "inside a multi-task wave `{commit}^` is a wave-mate's commit, which is the right baseline here precisely because `pathsCollide` (`:2377`) guarantees no wave-mate touched `{testFile}`". |

## Findings

All three v4 findings are resolved and both questions are answered. The two findings below are
**new**, both Low, and both live inside the one paragraph this revision added to §5.2 (and its echo in
§10's 1.5 changelog row). Neither changes any assertion, any task, any gate outcome or any product
behaviour; both are grounding citations in text that presents itself as verified.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-15 | Low | Local | **The new paragraph's central code citation is a range that both starts six lines early and stops before the quoted code ends.** §5.2 (and the §10 1.5 row) writes: "the runner dispatches them **concurrently in the shared tree** (`await parallelFn(wave.map((task) => agentFn("se-implement", …)))`, `pdlc/workflows/orchestrate-dev.js:8095-8102`)". Verified at HEAD: the quoted expression is at **`:8101-8107`** — `8101` `const waveResults = await parallelFn(`, `8102` `wave.map((task) =>`, `8103-8105` `agentFn("se-implement", waveImplementPrompt(task, featureName), { model: MODEL_IMPLEMENTATION })`, `8106-8107` the closers. `8095` is `const wave = waves[waveIndex];` — the wave-loop body, not the dispatch — and the cited range ends at `8102`, i.e. **excludes the `agentFn("se-implement", …)` lines**, which are the half of the quote that establishes "concurrently, one agent per task". (I carried this range forward from my own v4 grounding without re-deriving it; the error is mine as much as the document's, which is why I am reporting it now rather than treating it as settled.) **Fix:** cite `orchestrate-dev.js:8101-8107` in both places. The claim itself is correct as stated. | §5.2, §10 (1.5) |
| F-16 | Low | Local | **"The only post-wave steps are the gate and the commits" omits the script-owned post-wave build, which this PLAN's own batch 7–17 row requires.** §5.2's new paragraph reads "…with no post-wave agent hook: the only post-wave steps are the script-owned gate (`:8113-8118`) and the per-task commits (`:8143-8159`)". Verified at HEAD, the post-wave sequence is three script-owned steps, not two: the gate (`:8112-8123`), then `postWaveCommand` (`:8129-8140` — `await runCommandFn(implConfig.postWaveCommand)`, halting the wave on failure), then the per-task commits (`:8143-8160`) and the `postWavePathspecs` chore commit (`:8162-8172`). The load-bearing claim — *no post-wave agent hook* — survives intact, since every one of those steps is script-owned. But §5.2's batch 7–17 row itself says "From executor batch 6 onward every wave also runs `postWaveCommand` (`node pdlc/workflows/build-runtime.mjs`) and commits `pdlc/workflows/dist/`", so as written the two paragraphs of the same section contradict each other, and a reader who trusts the newer one will not expect the build to run between the gate and the commits. **Fix:** one clause — "…the only post-wave steps are the script-owned gate (`:8112-8123`), the script-owned post-wave build (`:8129-8140`) and the per-task commits (`:8143-8160`) — all three script-owned, none of them an agent." | §5.2 |

## Questions

| ID | Question |
|----|---------|
| Q-12 | §5.2's new paragraph closes with "The single-task waves (7–11, 15–18, 20) are unchanged by all of this" — but **wave 19 (`A-34, A-35`) is one of the eight multi-task waves the same paragraph enumerates**, and the batch 19–20 row asks for "`npm test` with **no** ignore-pattern override at all — i.e. including `documentOracles.test.js` — on a clean working tree" without naming who runs it. Strictly there is no contradiction: that row makes no per-file `--json` assertion, so the per-task scoping rule has nothing to scope. But it is the one gate row left whose producer is unnamed inside a concurrent wave, and it asks for two things a wave-mate can falsify — a *clean working tree* (A-35 is editing `CLAUDE.md` and `RELEASE-CHECKLIST.md` at the same moment A-34 writes its verification record) and a *full-suite* run, which `:5849` tells every agent not to perform. Neither A-34 nor A-35 owns a test file, so nothing here can go wrong silently; the script-owned gate still runs `implConfig.testCommand` after the wave. Would the PLAN rather attribute this row to **A-36** (wave 20, single-task, and the only task after both of them), whose own row already turns on a whole-tree oracle — `advertisedVersionViolation` against HEAD? That would put the full-oracle run in a wave with one agent and a settled tree, at no cost to the DAG. I am raising this as a question rather than a finding because the row is unchanged text I approved in earlier rounds, and because nothing in it is wrong — only unattributed. |
| Q-13 | §5.2's existence conjunct fails the gate when `perFile` carries no key for an owned `advisory*.test.js` path. Inside a five-agent wave, a wave-mate mid-write on *its* file can make jest report that suite as a runtime error — the run still writes `--outputFile`, and the owning task's own entries are still present, so the conjunct behaves correctly. Is that reasoning worth one clause? It is the one way a reader might fear the new conjunct produces a false red, and the answer ("a sibling's failed suite costs that suite's entry, never yours") is short and makes the conjunct obviously safe to run mid-wave. |

## Positive Observations

_(pending)_

## Recommendation

_(pending)_
