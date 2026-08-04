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

No High or Medium finding is open. All four below are new, all in the sections v1.5 rewrote, and all
are wording or citation precision on mechanisms I verified to be correct in substance.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **§5.2's retention window closes before §9.2 reads the artifacts it retains.** §5.2 Retention says each task keeps its pair "**until its wave's gate has passed**" — a window that ends at `:8113`'s gate for that wave. But §9.2 is a *Definition of Done* checkbox, evaluated after every wave, and it says the falsifiable half "is recomputed from git and from the two retained `--json` runs, for every 🟢 task and every block it un-skips". By the time §9.2 is ticked, waves 6–17's pairs are outside their stated retention window, and §9.2 offers no fallback: conjunct (i) is git-recomputable forever, conjunct (ii) is not. The failure is fail-closed (a missing artifact means the row cannot be ticked), so nothing false-greens — which is why this is Low and not Medium — but it leaves a DoD row that can become unsatisfiable through housekeeping rather than through a defect. Two ways out, either one a single clause: state the window as a **lower bound for the whole run** ("kept until §9.2 has been checked" — they are small files in `/tmp`), or name the git-side recomputation as the standing fallback (`git show {commit}^:{testFile}` / `{commit}:{testFile}` into a scratch tree, re-run the targeted pattern, compare that block's `pending`/`passed`), which needs no retained artifact at all and is the same evidence. | §5.2 **Retention**; §9.2 conjunct (ii) |
| F-02 | Low | Local | **The new concurrency citation stops one line before the expression it quotes.** §5.2 and §10's 1.5 row both cite `await parallelFn(wave.map((task) => agentFn("se-implement", …)))` at `pdlc/workflows/orchestrate-dev.js:8095-8102`. At HEAD `:8095` is `const wave = waves[waveIndex];` (the loop head), `parallelFn` is at `:8101`, `wave.map` at `:8102`, and `agentFn("se-implement", …)` — the part of the quotation that actually carries the claim, that a *wave's agents* are dispatched together — is at `:8103`, **outside** the cited range, with the call closing at `:8107`. The claim is true; only the anchor is wrong. Cite `:8101-8107` (or `:8099-8107` to include the `// SAME TREE, in parallel` comment, which states the property in the code's own words). Same class as v4's F-02, and worth the same one-clause fix: this PLAN's citations are load-bearing because reviewers re-execute them. | §5.2 "The producer is the task, not the wave"; §10 row 1.5 |
| F-03 | Low | Local | **§9.2 (i)'s new parenthetical gives a reason that does not cover the case it needs to.** It says "inside a multi-task wave `{commit}^` is a wave-mate's commit, which is the right baseline here precisely because `pathsCollide` (`:2377`) guarantees no wave-mate touched `{testFile}`". Two problems, both mechanical: (a) `{commit}^` is a wave-mate's commit only for the **second and later** tasks committed in a wave — for the first, it is the previous wave's last commit, or that wave's `postWavePathspecs` chore commit (`:8163`); (b) for the file this actually matters on, an earlier wave's commit **did** touch `{testFile}` — `advisoryDriver.test.js` is un-skipped by A-23 (wave 12), A-24 (wave 13) *and* A-31 (wave 14), so A-24's `{commit}^` lineage includes A-23's edit to that very file. `pathsCollide` therefore does not establish what the parenthetical claims. The conjunct is nonetheless correct, for a reason worth stating instead: (i) is **block-scoped, not file-scoped** — it asks whether *this block* carries `.skip` at `{commit}^` and not at `{commit}` — and §3's un-skipper rule gives every block exactly one un-skipper, so no earlier commit can have removed this block's `.skip`. Replacing the `pathsCollide` clause with that sentence keeps the guarantee and removes an inference a reader could over-generalise into "the file is otherwise unchanged", which is false for `advisoryDriver.test.js`. | §9.2 conjunct (i) |
| F-04 | Low | Local | **The fence comment says "every task"; the paragraph three below says "from executor batch 3 onward".** §5.2's command block annotates the post form `# every task, as its last action`, and the next-but-one paragraph then excludes batches 1–2 ("no agent should perform it defensively"). A-01 and A-02 are tasks, and the fence is what an implementer copies. One word closes it: `# every task from executor batch 3 onward, as its last action`. (Related and harmless: A-15, A-34, A-35 and A-36 own no `advisory*.test.js` path at all — I checked the manifest — so for them both conjuncts are vacuously true and the run yields nothing to assert. Worth saying only if the fence is edited anyway.) | §5.2 command fence vs. "The targeted run applies from executor batch 3 onward" |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §5.2 now says a task's read of *its own* files is safe whatever siblings are doing. Agreed. But a task's targeted run also *collects* its wave-mates' files, and in wave 3 five agents are creating theirs concurrently: a snapshot taken while a sibling's brand-new suite is half-written yields a failing or runtime-error suite in the same JSON and a **non-zero exit for the running agent's own command**. §5.2 already says the right thing structurally ("the gate's *pass/fail* remains the script-owned aggregate run (`:8113-8118`); the targeted `--json` run is the agent's evidence for the per-file claims it reports"), and the batch 1–2 clause is the only place an exit code is treated as meaningful — so I read this as already answered. One clause would make it unambiguous for an implementer who meets it live: "the targeted run's own exit code is not an oracle; only the entries for this task's owned paths are." |

## Positive Observations

- **F-01 was fixed at the level of the mechanism, not the assertion.** The obvious patch would have
  been "the wave's tasks must coordinate on one file". Instead the artifact was made per task, which
  deletes the race rather than managing it, and the cross-wave retention rule went with it — the 🟢
  delta is now two documents one agent produced, with no ordering premise at all. Removing a premise
  is worth more than defending one.
- **The existence conjunct is stated as a set obligation over a *declared* set.** "`perFile` must
  contain a key for **each** of this task's owned `advisory*.test.js` paths. A missing key **fails**
  the gate" — quantified over §4's manifest row, not over what jest returned. That is completeness by
  set-equality rather than containment, applied to the PLAN's own evidence procedure, and it is the
  difference between a defective-red detector and a detector-shaped sentence. The batch 3–5 row
  restates it inline as conjunct (1) rather than delegating to the preamble, so the row is complete
  where an implementer reads it.
- **The union-over-tasks framing makes the wave-level claim complete by construction.** "The wave's
  claim is the union over its tasks' summaries, which is why this survives wave 3's five concurrent
  agents" — no file can fall between two agents' scopes, because every file has exactly one owner in
  the manifest and every owner asserts over its own set. I re-executed the manifest to confirm the
  partition rather than take it: wave 3's five agents own five distinct suites, and each of waves
  12/13/14 pairs a two-test-file owner with a wave-mate owning neither.
- **The jest transcription is now a literal I could diff against the runner byte for byte.** v1.4 had
  `numPassingTests` / `numFailingTests`; v1.5 corrects the spellings, states that *no* per-file
  counters exist rather than listing four absent ones, and asserts `testFilePath` appears nowhere at
  any level. All three re-executed true on jest 29.7.0. Correcting a transcription by re-transcribing
  it is the right move — the previous list was right about the consequence and wrong about the facts.
- **The batch 1–2 exemption answers Q-01 with the failure mode named.** Not "the run is not required
  there" but "the pattern matches nothing and jest exits non-zero on 'no tests found' … no agent
  should perform it defensively" — the reason an agent would otherwise get it wrong is stated, which
  is what stops the clause being deleted by a future editor who cannot see why it exists. It is also
  true: exit 1, `0 matches`, verified.
- **Batch 18's unscoped read is now justified rather than excepted.** "Wave 18 is `A-33` alone, so
  this one reading is legitimately unscoped — it is the only assertion in §5.2 quantified over files
  the running task does not own, and it is safe for exactly that reason." Naming the single exception
  to a rule, and why it is the only one, is stronger than a rule with unstated edges.

## Recommendation

**Approved with minor changes**

Both v4 findings and the v4 question are resolved, and the High is resolved on every consequence I
raised — the artifact is per task so there is one writer per file, the batch 3–5 detector is
quantified over a declared set with a missing key failing closed, and each agent's assertions are
scoped to files no wave-mate can touch. I re-executed rather than re-read: the jest field
transcription is exact on 29.7.0 (including "no per-file counters at all" and `testFilePath` absent
at every level), the `perFile` reducer reproduces on the new path, the batch 1–2 "no tests found"
exit is real, the eight multi-task waves are exactly the eight §5.2 enumerates, the manifest
partition inside waves 3/12/13/14 is disjoint as claimed, the batch column re-derives with zero
desync, and the PLAN still self-parses at 36 tasks / 36 ownership rows / `{"ok":true}` / 20 batches /
20 waves with no cycle.

Nothing blocking remains. Four Low items, each a clause:

1. **F-01** — §5.2 retains each task's pair "until its wave's gate has passed", but §9.2 reads those
   pairs at Definition of Done, after every wave. Either widen the window to the run ("kept until
   §9.2 has been checked") or name the git-side recomputation as the standing fallback, which needs
   no retained artifact.
2. **F-02** — the concurrency citation `:8095-8102` stops at `wave.map`; the `agentFn("se-implement",
   …)` it quotes is at `:8103` and the call closes at `:8107`. Cite `:8101-8107`.
3. **F-03** — §9.2 (i)'s parenthetical justifies the baseline with `pathsCollide`, which does not
   cover it: `{commit}^` is a wave-mate's commit only for the second and later tasks in a wave, and
   an earlier wave's commit *did* touch `advisoryDriver.test.js` (A-23, A-24, A-31 across waves
   12–14). The conjunct is sound because it is **block**-scoped and §3 gives each block one
   un-skipper — say that instead.
4. **F-04** — the fence comment says the post run is for "every task"; the paragraph below excludes
   batches 1–2. Qualify the comment.

None of the four changes a task, a dependency edge, a manifest row, a batch label, or any assertion's
oracle, so none needs a re-parse or a re-derivation to land.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 4}
