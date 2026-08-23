# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md` (v1.4)
**Date:** 2026-08-23
**Iteration:** 7
**Round type:** Delta re-review of the v1.3 → v1.4 revision (`5d5f15b4..86a61ab6`), DECISION FREEZE in force

## Overview

Delta re-review under DECISION FREEZE, not a fresh read. The scope is a single commit — `86a61ab6`,
"resolve Phase PR postmortem — PLAN v1.4" — measured as one diff `5d5f15b4..HEAD` over
`docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md`: **8 insertions, 5 deletions, one file**, three
hunks. Nothing else in the feature's document set moved the PLAN. Sections the v6 round approved and
this diff does not touch were not re-litigated.

The three hunks are:

1. `| Version | 1.3 |` → `| Version | 1.4 |` (header field).
2. A new revision-history row `1.4`, recording the two round-6 Lows as landed.
3. §4.4 RK-5: `four mutation runs` → `five mutation runs`.
4. §4.6's preamble: the parse is re-dated to "after the **v1.3 edit**", and the justification for
   citing `git show origin/main:pdlc/workflows/orchestrate-dev.js` changes from "this tree is 1,637
   commits behind" to "the shipped parser, byte-identical to this tree's copy now that the OB-F1
   rebase has landed".

Disposition of the round-6 findings:

| Prior finding | Severity | Status |
|---|---|---|
| F-01 — RK-5 still sized T-07 at "four mutation runs" | Low | **Resolved** — the row now reads `five mutation runs` (`§4.4`, RK-5) |
| Q-01 — should §1.2's historical table carry a re-measured fourth column? | — | Not a finding; unchanged, and the paragraph above the table still labels it "no longer the tree's current state" |

**No High and no Medium finding is open, and this delta introduced none.** No task, batch, `Deps`
cell, oracle, ownership manifest or DoD checkbox was touched: the diff is one count word, one
prose justification, and two header/history bookkeeping lines. The parse results §4.6 publishes were
re-run against the shipped parser after the edit and every one is unchanged — see §Verification.

## Batches

**The task table is byte-unchanged by this revision.** The diff touches no row of §3.1: nine tasks,
four batches, no task added, moved, retired or re-owned. The one edit inside §4 that touches a task
at all is RK-5, a *risk-sizing* sentence about T-07 that carries no implementer duty — which is
precisely why round 6 filed it Low rather than blocking on it.

**The count correction is in the right direction and is now consistent everywhere.** `grep -n "four
mutation"` over the PLAN at HEAD returns exactly one line — revision-history row `1.1` (line 18),
where "§4.3's four mutations gain owning tasks" is a *historical* record of what v1.1 did and is
correct as written; correcting it would falsify the history. Every present-tense statement of the
count now says five, in all six places an implementer could read one:

| Site | Text at HEAD |
|---|---|
| §4.3 heading (line 386) | "Mutation resistance — **five** mutations, each with an owner who **runs** it" |
| §4.3 rows | five rows |
| T-07's mutation-duty cell (line 130) | "**Mutation duty (§4.3 rows 1–5, including row 5's suppressed write on operator-pointed runs, whose only oracle is AT-05's write-side conjunct)**" |
| §1.1 trade paragraph (line 185) | "§4.3's five mutations are" |
| §4.4 RK-1 (line 422) | "§4.3's five mutations are *executed*" |
| §4.5 DoD (line 447) | "Each of §4.3's five mutations was applied, observed RED against its named oracle, reverted" |
| §4.4 RK-5 (line 426) | "five announcement suffixes, one report-row branch and **five mutation runs**" — the edit |

The duty, the checkbox and the sizing now agree. Nothing regressed: the cell an implementer works
from and the checkbox they tick were already five at v1.3 and are still five at v1.4.

**Every file the task table names still exists, or is declared new** — re-measured at HEAD with
`git ls-files --error-unmatch`, because the tree moved since round 6:

| Path | State at HEAD | Table's claim |
|---|---|---|
| `pdlc/workflows/__tests__/waveExecution.test.js` | tracked | T-07 *(existing, at `origin/main`)* — sole owner; T-10 appends |
| `pdlc/workflows/__tests__/documentOracles.test.js` | tracked | T-11 *(existing)*; T-12 read-only |
| `pdlc/workflows/orchestrate-dev.js` | tracked | T-02, T-07 source |
| `docs/_constraints/pdlc-wave-gate-baseline.md` | tracked | T-03 edits |
| `docs/_constraints/pdlc-retirement-baseline.md` | tracked | T-11 adds a row |
| `waveResume.test.js`, `waveResumePreflight.test.js`, `waveResumeRepoState.test.js`, `waveResumeQueueParity.test.js`, `waveResumeProperties.test.js` | **absent** | each declared new by its creating row |

No table row names a file that is neither present nor declared new. The `[Fake first]` labels on
T-02, T-03 and T-07 and the red-half-first commit convention are untouched by this diff.

## Dependencies

The batch column was re-derived from the declared edges at HEAD rather than carried over from round
6, because a document that publishes its own parse results has to keep publishing true ones — and
because a prose-only edit can still perturb a table-driven parser.

| Task | Declared `Deps` | `max(dep batch) + 1` | `Batch` column | Agrees |
|---|---|---|---|---|
| T-01 | — | 1 | 1 | yes |
| T-11 | — | 1 | 1 | yes |
| T-12 | — | 1 | 1 | yes |
| T-02 | T-01 | 2 | 2 | yes |
| T-03 | T-01 | 2 | 2 | yes |
| T-04 | T-01 | 2 | 2 | yes |
| T-07 | T-02 | 3 | 3 | yes |
| T-08 | T-02 | 3 | 3 | yes |
| T-10 | T-07, T-08, T-03, T-04 | 4 | 4 | yes |

Measured, not asserted: the shipped `parsePlanTasks` returns `planBatch` `[1,2,2,2,3,3,4,1,1]` in row
order, character-identical to the column, and `computeTopologicalBatches` returns
`[[T-01,T-11,T-12],[T-02,T-03,T-04],[T-07,T-08],[T-10]]`. The edge set is acyclic, ids are unique,
every dependency resolves, and the retired ids `T-05`, `T-06`, `T-09` appear in no `#` and no `Deps`
cell, so there is no dangling edge. All of this is identical to the v1.3 measurement — the delta
moved nothing in the DAG.

**Same-new-file guard, re-checked at HEAD.** The ownership parser returns nine rows and
`nearMisses: []`. Batch 1's three tasks own pairwise-disjoint path sets — T-01
`[waveResumePreflight.test.js]`, T-11 `[documentOracles.test.js, pdlc-retirement-baseline.md]`, T-12
`[]` — so the T-11/T-12 collision over `documentOracles.test.js` remains avoided *by declaration*:
T-12's cell is marked read-only and its manifest parses as the empty list. Batch 2's three tasks own
three distinct new test files, batch 3's two own one new and one existing file, and batch 4 is a
single task. No batch contains two tasks creating or appending the same new file.

This was the specific risk of the v1.4 edit worth checking: §4.6's new preamble introduces two fresh
backticked spans that look like paths — `` `git show origin/main:pdlc/workflows/orchestrate-dev.js` ``
and `` `git diff origin/main -- pdlc/workflows/orchestrate-dev.js` ``. Both sit in §4.6 prose, outside
the §3.1 task table the ownership parser reads, and the measured `nearMisses: []` confirms neither
was picked up as an owned path.

## Verification

Every claim below was measured in this tree at `86a61ab6`, not read off the document.

| Claim under test | Method | Result |
|---|---|---|
| Round-6 F-01 resolved — RK-5 counts five | `grep -n "four mutation"` over the PLAN | **Confirmed**: one hit only, revision-history row `1.1` (line 18), where the count is historical; RK-5 (line 426) reads "five mutation runs" |
| Every present-tense five-count still says five | read §4.3 heading, T-07's cell, §1.1, RK-1, §4.5 | **Confirmed** in all six sites (table in §Batches) |
| §4.6's new claim: `git diff origin/main -- pdlc/workflows/orchestrate-dev.js` is empty at HEAD | ran it | **Confirmed exactly**: 0 bytes of output |
| §4.6's retraction: the tree is no longer behind | `git rev-list --count HEAD..origin/main` | **Confirmed**: `0` — the "1,637 commits behind" justification was genuinely stale, and its removal is the correct fix |
| The stale figure is gone from every *current-state* claim | `grep -n "1,637\|1637"` | **Confirmed**: two hits, both correct — the v1.4 history row, which quotes the retracted phrase to record the retraction, and §1.2's historical measurement table (line 69), which the paragraph above it labels "no longer the tree's current state" |
| §4.6 `parsePlanTasks(PLAN)` → 9 tasks, no warnings, the stated ids | ran the shipped parser from `pdlc/workflows/orchestrate-dev.js` | **Confirmed**: 9 tasks, `T-01,T-02,T-03,T-04,T-07,T-08,T-10,T-11,T-12`, no warnings |
| §4.6 `planBatch` row order `1,2,2,2,3,3,4,1,1` | same run, post-edit | **Confirmed**, unchanged from v1.3 |
| §4.6 `computeTopologicalBatches` → the four batches | ran the shipped function | **Confirmed**, identical to the `Batch` column |
| §4.6 `parsePlanOwnership(PLAN)` → 9 rows, zero near misses, `T-12 → []` | ran the shipped parser | **Confirmed**: `nearMisses: []`, `T-12`'s `files` is `[]`, and the multi-path cells parse as the three lists §4.6 names |
| Every file the task table names exists or is declared new | `git ls-files --error-unmatch` over all ten paths | **Confirmed** (table in §Batches): five tracked, five absent-and-declared-new |
| T-12's `94` / `81` coverage counts (unchanged, re-checked because the tree moved) | `git ls-files pdlc/workflows/coverage` and `… /tmp` | **Confirmed exactly**: 94 and 81 |
| §3.4's coverage-gate literal | read `pdlc/workflows/package.json:9` | **Confirmed**: `test:coverage` is `c8 npm test -- --runInBand && c8 report --check-coverage --per-file --branches 85 …` — `--per-file` and `--branches 85` both present, so T-10's per-file oracle binds a real gate flag |

**Coverage claims against the current suite layout.** Unchanged by this delta and still true: the
five new suites the PLAN creates collide with no existing file name in `pdlc/workflows/__tests__/`,
`waveExecution.test.js` and `documentOracles.test.js` are the only two existing files the plan
touches and both are correctly marked *(existing)*, and the property strategy for the parameterisable
components (`classifyWaveLedger`, `parseWaveLedger`, the plan hash) is still carried by T-08's
P-1…P-4 with `numRuns: 500` pinned. The branch-coverage floor T-10 asserts is verified at the **gate
command**, not by source-list membership: `--per-file --branches 85` is in the script itself.

**Oracle discipline, spot-checked on the one edited duty-bearing region.** RK-5 is a mitigation row,
not an oracle, so the edit introduces no assertion. The oracle it now sizes correctly — §4.3 row 5 —
still names AT-05's write-side conjunct as its *single* killing oracle and enumerates AT-05, AT-07,
AT-15, AT-18 as staying green, transcribed from TSPEC §5.5 item 5 rather than derived from the
implementation. That row was verified against the upstream in round 6 and is byte-unchanged here.

## Findings

*(pending)*

## Questions

*(pending)*

## Positive Observations

*(pending)*

## Deferred Items

*(pending)*

## Recommendation

*(pending)*
