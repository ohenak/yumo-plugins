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

## Questions

## Positive Observations

## Recommendation

## Verdict
