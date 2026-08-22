# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md`
**Date:** 2026-08-21
**Iteration:** 2
**Scope:** Delta re-review of PLAN v1.1 against `CROSS-REVIEW-test-engineer-PLAN-v1.md` (F-01 … F-10) — testability, TDD ordering, batch-DAG mechanics, oracle falsifiability, coverage instrumentation.

## Grounding

Delta scope: `git diff 4b8cf2ac..HEAD -- docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md`
(+208 / −106 over one file; `4b8cf2ac` is the commit that carried my v1 review). Every mechanical
claim v1.1 restates was re-run rather than re-read, because the merge changed the task set and every
number in §4.6 with it.

| Check | Command | Result |
|---|---|---|
| §4.6 `parsePlanTasks` | shipped parser from `git show origin/main:pdlc/workflows/orchestrate-dev.js` run over the current PLAN | 7 tasks, `warnings` **undefined**, ids `T-01, T-02, T-03, T-04, T-07, T-08, T-10`; dependencies `[] / [T-01] / [T-01] / [T-01] / [T-02] / [T-02] / [T-07,T-08,T-03,T-04]` — **exactly §4.6's row and §3.1's edge set** |
| §4.6 batch column | `planBatch` vs. re-derived `max(dep batch)+1` | `1, 2, 2, 2, 3, 3, 4` both ways — **no desync** |
| §4.6 topological batches | `computeTopologicalBatches` | `[[T-01],[T-02,T-03,T-04],[T-07,T-08],[T-10]]` — identical to the column |
| §4.6 ownership manifest | `parsePlanOwnership` | 7 rows, one per task, `nearMisses: []` — the §2.3 `Paths touched` rename did clear the files-side near miss it claims to have cleared |
| §4.6 waves | `computeWaves(tasks, ownership)` | `[[T-01],[T-02,T-03,T-04],[T-07,T-08],[T-10]]` — four ownership-disjoint waves, no same-batch same-file collision |
| §4.6 retired ids | grep for `T-05`, `T-06`, `T-09` in `#` and `Deps` cells | absent from both; parser reports no dangling dependency |
| §3.4 `testCommand` literal (F-07, F-02) | `cat .claude/pdlc.config.json` | resolved value is **byte-identical** to §3.4's transcribed literal |
| §3.4 `postWaveCommand` singularity (RK-2) | `origin/main:orchestrate-dev.js:171`, `:3280`, `:3322` | one global `postWaveCommand` key, run after **every** wave — "the last wave's `postWaveCommand`" is genuinely not expressible; RK-2's reading is correct |
| §1.2 tree facts (F-10 rewrite) | `git rev-list --count HEAD..origin/main`; `grep -c WAVE_STATE_PATH …`; `ls docs/_constraints/`; `grep -n '.claude' .gitignore`; `grep -nE 'test:coverage\|c8\|fast-check' pdlc/workflows/package.json` | `1637`; `0`; no `pdlc-wave-gate-baseline.md`; only `/.claude/workflows/`; none of the three — **all five still true, now cited by content** |
| §1.2 `origin/main` facts | `git show origin/main:.gitignore`; `git show origin/main:pdlc/workflows/package.json` | `.gitignore:40-41` carries `/.claude/workflows/` and `/.claude/pdlc-wave-state.json` **in the same block**, as claimed; `package.json` carries `test:coverage` with `--per-file --branches 85`, `c8@^10.1.3`, `fast-check@^4.9.0` |
| §2 harness reuse | occurrence counts in `git show origin/main:pdlc/workflows/__tests__/waveExecution.test.js` | `makeLedgerArgs` 18, `ledgerWrites` 7, `PLAN_THREE_WAVES` 9, `CONFIG_WITH_TEST_COMMAND` 29 — **all four match**; file 2,761 lines |
| §3.2 harness row is non-vacuous | `wc -l` + `grep -c makeLedgerArgs pdlc/workflows/__tests__/waveExecution.test.js` (this tree) | 1,100 lines, **0** occurrences — the local file is the pre-ledger version, so T-01's harness row reds pre-rebase rather than passing vacuously |
| §2.2 halt premise | `origin/main:orchestrate-dev.js:15436` | `` Error: Wave ${waveNum} test gate failed — `${implConfig.testCommand}` `` — still a halt, so the v1.0→v1.1 green-terminal move is answering a real constraint |
| §4.5 positive gate observation | `origin/main:orchestrate-dev.js:15629`, `:15201` | `${scriptGate ? "script-owned gate" : "self-report gate"}` in the `✅` detail, and `Notice: the script-owned test gate is unavailable — …` — both DoD strings exist verbatim |
| F-08 report-row shapes | `origin/main:orchestrate-dev.js:15615-15630` | `⏭` = `Skipped — all M waves previously committed and recorded green (wave ledger)`, `✅` = `All M waves complete (wave mode, {gate})` — the wave-1 verbatim claim is checkable |
| §4.5.1 announcement count | TSPEC §2.4 announcement table | six outcome rows, five announcing + the silent IG-6 row — §4.5.1's `5` and T-07's "five announcing rows" agree |
| §4.1 AT set-equality | `grep -oE '\*\*AT-[0-9]+' FSPEC` | exactly `AT-01 … AT-18`; §4.1 maps all eighteen plus `P-1…P-4`, none invented |
| §4.1 suite layout | `git ls-tree origin/main pdlc/workflows/__tests__/` + `ls` in this tree | only `waveExecution.test.js` exists; the five `waveResume*` files match nothing in either tree, and every row naming one declares it new — **claim holds after the merge too** |
| F-06 precedent | `git show origin/main:pdlc/workflows/__tests__/advisoryHelperProperties.test.js` | `const runs = { numRuns: 500 }` at `:261` inside `describe("PROP-CTR-05 (generative): citesGateOutput …")`, 27 `fc.assert` sites in the file — T-08's re-citation is precise |
| RK-3 module size | `wc -l` / `git cat-file -s` on `origin/main:orchestrate-dev.js` | 16,336 lines, 734,711 B — §4.5.1's and RK-3's numbers are exact |

`origin/main` is `345ae358`, as §1.2 states.

## Round-1 findings — disposition

| Round-1 id | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | The three RED/GREEN pairs are merged (§2.3); §2.2's table declares all four batches green-terminal, and §2.2's closing paragraph states the runtime reason in the terms the finding used — the halt at `:15436`, the forbidden `implementation.startWave` escape, and `M-WG-4`'s uncommitted-work consequence. §3.4's `startWave` row now closes the loop explicitly ("no batch is RED-terminal, nothing in the happy path wants it"). The escape I could not find a runtime affordance for is no longer needed, because no batch is left red. |
| F-02 | High | **Resolved** | T-01 obligation (b) asserts the resolved `implementation.testCommand` **string-equals** §3.4's literal, with the absent-config arm guarded by `GITHUB_ACTIONS === "true"` so a locally missing config reds instead of passing vacuously; RK-6 records the risk; and §4.5's second checkbox is the positive observation I asked for — `script-owned gate` present in the report detail **and** no `Notice: the script-owned test gate is unavailable` line. Both strings exist verbatim at `:15629` and `:15201`. The absence-only half is paired, which is the part that mattered. |
| F-03 | High | **Resolved** | T-10's row now owns `pdlc/workflows/__tests__/waveExecution.test.js` as well as `waveResume.test.js`; §3.3's manifest carries both paths on T-10's row (parser confirms `T-10 → [waveResume.test.js, waveExecution.test.js]`); rule 2 is satisfied by batch separation (T-07 batch 3, T-10 batch 4) through the real `T-10 → T-07` edge, and §4.5.1's last two branch classes are marked `integration only` with the structural reason restated. The "unit arms only" wording that made the assignment unreachable is gone. |
| F-04 | Medium | **Resolved** | §4.3's fourth column is now `Applied and observed by`, each row names a task, the section body specifies the mechanics (apply, run only the named oracle's file, paste the failure header into the task report, `git checkout --`, commit nothing mutated), T-02 and T-07 carry a **Mutation duty** clause, and §4.5 carries the checkbox. |
| F-05 | Medium | **Resolved** | §4.5.1 is the delta-scoped oracle, with the one-percent-of-the-denominator arithmetic stated as the reason the floor cannot be the oracle; T-10 carries both oracles explicitly; §4.5 carries the uncovered-line-list checkbox. The mapping table's completeness — not a percentage — is the checkable thing, which is what makes a deleted case fail. |
| F-06 | Medium | **Resolved** | T-08 pins `numRuns: 500` for all four laws and cites the precedent precisely (`const runs = { numRuns: 500 }` at `advisoryHelperProperties.test.js:261`, applied at five `fc.assert` sites, the file's other properties at default) — verified exactly as written. |
| F-07 | Medium | **Resolved** | §3.4's `testCommand` row is a transcribed literal, and it is byte-identical to this tree's `.claude/pdlc.config.json`. |
| F-08 | Low | **Resolved** | T-07's green half changes the `✅` detail **only in the `N > 1` case**, and §4.5's checkbox states the wave-1 detail stays byte-identical — which is what holds the shipped-assertion count at three. |
| F-09 | Low | **Resolved** | T-01 has no `.gitignore` arm, §3.2 states why in the `includes`-weakening terms the finding used, and the **Lifecycle** paragraph gives both non-tautological failure modes. |
| F-10 | Low | **Resolved** | §1.2's line anchors are replaced by content citations, with the rebase-churn rationale stated — the anchors would move under the very rebase the section is about. |

Ten of ten resolved, including all three Highs, and none of the fixes broke a claim I had already
verified: §4.6 re-parses to the seven-task graph it now describes, and every §1.2 / §2 / §4.1 number
that survived the merge still reproduces.

## Findings

No High findings. The three that blocked round 1 are resolved and the revision introduced no new
blocking defect. Two Mediums and one Low below, all recorded rather than gating.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-11 | Medium | Cross-Feature | T-01's `testCommand` assertion is **string equality against an untracked, machine-local file**, and it "ships permanently". The shipped `.claude/pdlc.config.example.json` at `origin/main` carries a strict superset of §3.4's literal, so any maintainer running the example config reds T-01 in batch 1 — halting every wave — on a config that is correct. | §2.1 T-01(b), §3.2, §3.4 |
| F-12 | Medium | Local | T-03 is described as "*Red half first*", but two of its three assertion groups are **green on write**: `.gitignore` already carries `/.claude/pdlc-wave-state.json` at `origin/main`, and AT-17's finite check over §3.3 is already satisfied by this PLAN's own text. Only the `M-WVR-1` / `M-WVR-2` presence arm can go red. §2.3's blanket "records the observed failure" is unachievable for T-03 as written. | §2.1 T-03, §2.3 |
| F-13 | Low | Local | §2.2's column is headed `Gate wording`, but only the first conjunct of each cell (`Full suite green`) is what the script-owned gate actually runs — `implementation.testCommand`. The byte-unchanged conjunct (batch 2) and the coverage/mapping conjuncts (batch 4) are DoD observations, not gate outcomes. | §2.2 |

### F-11 (Medium) — a permanent equality assertion pinned to one machine's untracked config

This is my own F-02 landing slightly harder than intended, so I want to be precise about what is
right in it and what is over-tight.

Right: the gate must not be allowed to degrade silently, T-01 is the correct home for that check,
the `GITHUB_ACTIONS` guard correctly refuses to pass vacuously on a locally-absent config, and the
literal in §3.4 is byte-identical to `.claude/pdlc.config.json` in this tree — verified, so this
run passes.

Over-tight: §3.2's Lifecycle paragraph makes `waveResumePreflight.test.js` permanent ("no task
deletes it"), and §3.4's note accepts the consequence ("If an operator does widen it, T-01 reds in
batch 1 and this row is the thing to update — which is the intended failure mode, not an
inconvenience"). But the widening is not hypothetical: `git show
origin/main:.claude/pdlc.config.example.json` carries

```
"testCommand": "(cd pdlc/engine && npm test) && cd pdlc/workflows && npm test -- --testPathIgnorePatterns '/node_modules/' '/__tests__/helpers/' '/__tests__/fixtures/'"
```

— the §3.4 literal prefixed by `pdlc/engine`'s suite. A maintainer who copies the **shipped
example** into place gets a permanently red batch-1 gate, and in wave mode a red gate halts that
wave and every wave after it (§1.2's own consequence). The assertion would then be failing on a
config that is strictly stronger than the one it demands.

The falsifiable content of F-02 is "the resolved command runs this repo's `pdlc/workflows` suite,
and the key resolves at all" — not "the operator's command is exactly this string". Both are
falsifiable; only the second fails on correct inputs.

**Suggested change (non-blocking).** Keep the equality assertion, but scope it: assert (i)
`implementation.testCommand` resolves and is non-empty, (ii) it **contains** the transcribed
`cd pdlc/workflows && npm test -- --testPathIgnorePatterns …` substring — transcribed as a literal,
not derived — and (iii) record §3.4's full literal as the expected default in the failure message.
That still reds on a missing key, a misspelling, or a command that does not run this suite (the
three ways the gate actually degrades), and stops reddening on a legitimate superset. If the author
prefers strict equality, say so in §3.2's Lifecycle paragraph against the example-config case by
name, so the next operator reads it as a decision rather than a surprise.

### F-12 (Medium) — "red half first" is not achievable for two of T-03's three arms

§2.3 states the merged-task contract as a blanket: the task "writes and commits its failing tests
first, runs them, records the observed failure in its task report". For T-02 and T-07 that is exactly
right — `classifyWaveLedger` and the announcement suffixes do not exist until the green half. For
T-03 it is only one-third right:

| T-03 red-half arm | State when written (post-rebase, pre-green-half) | Evidence |
|---|---|---|
| AT-14: `.gitignore` line equality, leading `/`, `git check-ignore -v` resolution | **green** | `git show origin/main:.gitignore` — `/.claude/pdlc-wave-state.json` is already line 41, in the same block as `/.claude/workflows/` (§1.2 says so itself) |
| AT-17: no §3.3 row and no `postWavePathspecs` value names `WAVE_STATE_PATH` | **green** | already true of this PLAN's own text; §3.3 asserts it as a property of the document under review |
| `M-WVR-1` / `M-WVR-2` present in `docs/_constraints/pdlc-wave-gate-baseline.md` | **red** | the file at `origin/main` runs to `## 4` / `M-WG-14`; T-03's green half appends `## 5` |

This is not a defect in the tests — characterisation tests over a state a *prior* feature
established are exactly right for AT-14 and AT-17, and v1.0 already made this distinction honestly
for T-04 ("Green on write against shipped `orchestrate-queue.js` — it is a **regression net** over a
boundary this feature must not move"). The defect is that T-03 does not say so, so the implementer
either reports a red that cannot have happened or is left to improvise.

**Suggested change (non-blocking).** Give T-03 the sentence T-04 already has: name the `M-WVR`
presence arm as the one that reds on write, mark the AT-14 and AT-17 arms as characterisation over
the rebase baseline, and add T-04's falsification shape to them — for AT-14, delete or unanchor the
ignore line in the working tree, observe the red, revert (this is cheap and it is the only thing
that proves the line-equality matcher is not a tautology); for AT-17, insert a `WAVE_STATE_PATH`
row into a scratch copy of §3.3 and observe the red. Then §2.3's blanket sentence can stay true by
being narrowed to "each merged task records, per arm, either the observed RED or the falsification
that stands in for it".

### F-13 (Low) — `Gate wording` names three things the gate does not evaluate

The runtime's script-owned gate runs one thing per wave: `implementation.testCommand`
(`origin/main:orchestrate-dev.js:15436` is the halt on its non-zero exit). Batch 2's "`waveExecution.test.js`
byte-unchanged across every commit of this batch" and batch 4's "`npm run test:coverage` exits 0
**and** §4.5.1's mapping table is complete" are not reachable from that command, so they are not
gate outcomes; they are DoD observations, and §4.5 does carry all three as checkboxes, which is why
this is Low rather than Medium — nothing is lost, only mislabelled.

Worth fixing because §2.2's own closing paragraph is a lesson about exactly this confusion: v1.0's
RED-terminal wording failed because "the runtime has no notion of a *declared* RED-terminal
wording". The same is true of a declared byte-unchanged conjunct. Renaming the column to
`Gate (script-run) + batch checks` — or splitting the cells into what the gate runs and what the
DoD verifies — keeps that lesson from being re-learned.

## Questions

| ID | Question |
|---|---|
| Q-01 | T-01 ships permanently and asserts on a file no consumer is required to have. If a second consuming repo ever runs `pdlc/workflows`' suite, does the `GITHUB_ACTIONS` guard still express the intent, or should the arm key off "a config exists ⇒ it must run this suite"? (F-11 suggests the latter; the answer is the author's.) |
| Q-02 | §4.5.1's fourth and fifth rows are `integration only` and land in `waveExecution.test.js`, which T-10 owns in batch 4 after T-07 owns it in batch 3. Does T-10 append new cases, or does it fill gaps T-07 was already expected to cover — i.e. is a non-empty T-10 diff to that file a success or a sign T-07 under-delivered? Either answer is fine; naming it stops the two tasks negotiating at runtime. |

## Positive Observations

- **The v1.0 → v1.1 structural move is the right one, and it is argued rather than asserted.** §2.2's
  closing paragraph does not just declare batches green-terminal; it names the halt at `:15436`, the
  forbidden escape, and `M-WG-4`'s uncommitted-work consequence — the three facts that made the old
  split unworkable. A revision that restates *why* the old shape failed is a revision the next
  reader cannot accidentally undo.
- **§2.3 states the trade instead of hiding it, and prices it.** "That is a real loss of mechanical
  enforcement" followed by three named partial replacements, one of which (executed mutations) is
  genuinely stronger than the enforcement it replaces. RK-1 repeats it in the risk register rather
  than letting the good news sit alone. This is the clearest cost-accounting I have read in a PLAN
  in this repo.
- **Every mechanical claim reproduced, for the second round running.** §4.6 was re-run after the
  merge — not copied forward — and the seven-task graph, the batch column, the topological batches,
  the ownership manifest (`nearMisses: []`) and the wave partition all match what the shipped parser
  returns for me. The §2.3 `Files (…)` → `Paths touched, …` header rename is a real fix to a real
  near miss, found by the author's own re-run.
- **§4.5.1 is the delta oracle F-05 asked for and slightly better than what I suggested:** the
  branch classes are counted (8/7/1/5/3) and each carries its reachability, so the table's
  completeness is a set-equality a deleted case fails, rather than a percentage a deleted case moves
  by 0.05.
- **The retired ids are retired, not reused.** `T-05`, `T-06`, `T-09` appear in no `#` cell and no
  `Deps` cell, and the revision history says why — every round-1 reference stays resolvable. Small
  discipline, large effect on a document that will be read against two review rounds.

## Recommendation

**Approved with minor changes**

All three round-1 High findings are resolved, verified against the repository rather than the
document: the batches are green-terminal and the runtime can evaluate every one of them (F-01), the
script-owned gate has both a pre-flight assertion and a paired positive/negative DoD observation
(F-02), and T-10 owns the file containing the branches it is assigned to cover (F-03). The seven
Medium and Low findings are resolved as well, and re-running the shipped parsers shows the merge
broke nothing that round 1 had verified.

F-11 and F-12 are recorded, not gating. Neither changes the task graph: F-11 narrows one assertion
inside T-01, F-12 adds a sentence to T-03 and two cheap falsification arms. Both are worth taking in
the optimizer loop, and neither is a reason to hold Phase P.

One upstream item is routed as an erratum rather than folded into this verdict: TSPEC §5.8 and RT-7
assign the coverage floor to "the last implementation wave's `postWaveCommand`", which the shipped
config surface cannot express — `postWaveCommand` is a single global key
(`origin/main:orchestrate-dev.js:171`, applied at `:3280` and `:3322` after every wave). The PLAN's
RK-2 and §3.4 diagnose this correctly and reassign the floor to T-10; the TSPEC is the document that
needs the edit.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}
