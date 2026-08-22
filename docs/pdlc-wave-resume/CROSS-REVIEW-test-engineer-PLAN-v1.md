# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md`
**Date:** 2026-08-21
**Iteration:** 1
**Scope:** Testing lens — testability, TDD ordering, batch-DAG mechanics, oracle falsifiability, coverage instrumentation.

## Grounding

Every claim below was checked against the repository, not against the document. What I ran, and
what it returned:

| Check | Command | Result |
|---|---|---|
| PLAN §4.6 `parsePlanTasks` | shipped parser from `git show origin/main:pdlc/workflows/orchestrate-dev.js` (`export function parsePlanTasks`) run over the PLAN | 10 tasks, `warnings` null, ids `T-01…T-10` — **matches** |
| PLAN §4.6 batch column | `planBatch` column vs. re-derived `max(dep batch)+1` | both `1,2,2,2,3,3,4,4,5,6` — **no desync** |
| PLAN §4.6 topological batches | `computeTopologicalBatches` | `[[T-01],[T-02,T-03,T-04],[T-05,T-06],[T-07,T-08],[T-09],[T-10]]` — identical to the column |
| PLAN §4.6 ownership manifest | `parsePlanOwnership` | 10 rows, one per task, `nearMisses: []` — **exactly one manifest, as claimed** |
| PLAN §4.6 waves | `computeWaves(tasks, ownership)` | six ownership-disjoint waves, identical to the topological batches — **no same-batch same-file collision** |
| PLAN §1.2 tree facts | `git rev-list --count HEAD..origin/main`; `grep -c WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js`; `ls docs/_constraints/`; `grep -n '.claude' .gitignore`; `cat pdlc/workflows/package.json` | `1637`; `0`; no `pdlc-wave-gate-baseline.md`; only `/.claude/workflows/` at line 29; only `test`/`test:watch`, no `c8`/`fast-check` — **all five verified true** |
| PLAN §1.2 / §3.2 `origin/main` facts | symbol counts in `git show origin/main:pdlc/workflows/orchestrate-dev.js` | `WAVE_STATE_PATH` 10, `parseWaveLedger` 2, `computePlanHash` 2, `formatWaveLedger` 3, `writeWaveLedger` 2, `headCorroborated` 2, `IMPLEMENTATION_DEFAULTS` 8; `classifyWaveLedger`/`RESUME_OUTCOMES`/`RESUME_PROVENANCE`/`WAVE_IGNORE_REASONS`/`ANCESTRY_INDEPENDENT_CODES` all **0** — the new/existing split is exactly as stated |
| PLAN §2 harness reuse | occurrence counts in `git show origin/main:pdlc/workflows/__tests__/waveExecution.test.js` | `makeLedgerArgs` 18, `ledgerWrites` 7, `PLAN_THREE_WAVES` 9, `CONFIG_WITH_TEST_COMMAND` 29 — **matches the PLAN's four counts exactly**; file is 2,761 lines as claimed |
| PLAN §4.1 suite layout | `git ls-tree --name-only origin/main pdlc/workflows/__tests__/` | `waveExecution.test.js` present; `waveResume`, `waveResumeProperties`, `waveResumeQueueParity`, `waveResumeRepoState`, `waveResumePreflight` — **none exist**, and every task row declaring one declares it new. Claim holds. |
| PLAN §4.1 AT set-equality | FSPEC `**AT-NN` headings | exactly `AT-01…AT-18`; §4.1 maps all eighteen plus `P-1…P-4`. **No AT unowned, none invented.** |
| PLAN T-06 promotion target | `git show origin/main:docs/_constraints/pdlc-wave-gate-baseline.md` | `Version 1.2 · 2026-08-20`, sections through `## 4`, ids through `M-WG-14` — the PLAN's `⇒ ## 5, 1.3` derivation is **correct** |
| PLAN §2.2 red-gate premise | `orchestrate-dev.js:15436` (`origin/main`) | `Error: Wave ${waveNum} test gate failed — …` is a halt path under `scriptGate` — RK-1's premise is real, not hypothetical |
| PLAN §3.4 gate-command sensitivity | `wc -l` and branch-token count over `origin/main:pdlc/workflows/orchestrate-dev.js` | 16,336 lines, ~2,054 branch points by token proxy — see F-05 |
| PLAN T-08 precedent | `git show origin/main:pdlc/workflows/__tests__/advisoryHelperProperties.test.js` | 27 `fc.assert` sites, and `const runs = { numRuns: 500 }` at `:261` — see F-06 |

Two things I want to say plainly before the findings: the §4.6 parse-verification table is the
first PLAN I have reviewed in this repo where **every mechanical claim reproduced exactly** when I
re-ran the shipped parser myself, and the §1.2 precondition table is likewise true in both
directions. The findings below are all about the *execution model* of the batches, not about the
task graph, which is sound.

## Findings

*(pending)*

## Questions

*(pending)*

## Positive Observations

*(pending)*

## Recommendation

*(pending)*

## Verdict

*(pending)*
