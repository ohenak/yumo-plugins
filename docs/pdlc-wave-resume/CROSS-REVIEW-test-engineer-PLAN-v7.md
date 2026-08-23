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

*(pending)*

## Verification

*(pending)*

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
