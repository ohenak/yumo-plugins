# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md` (v1.3)
**Date:** 2026-08-23
**Iteration:** 6
**Round type:** Delta re-review of the v1.2 → v1.3 revision (`423d6802..5d5f15b4`)

## Overview

Delta re-review, not a fresh read. Scope is the six commits that carry v1.2 → v1.3
(`f1fc897b`, `5810d1ec`, `d97c55fc`, `e67ba8a4`, `ae682f92`, `a31d3c08`, `4eba75d8`, `e6f8921a`,
`5d5f15b4`), measured as a single diff `423d6802..HEAD` over
`docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md` (40 insertions, 21 deletions, one file). Every
prior finding in `CROSS-REVIEW-test-engineer-PLAN-v5.md` was re-checked against the tree; sections
the v5 round approved and this diff does not touch were not re-litigated.

Disposition of the five round-5 findings:

| Prior finding | Severity | Status |
|---|---|---|
| F-01 — the five-mutation set enumerated as four, mutation 5 ownerless | High | **Resolved** (one residual count, filed below as F-01/Low) |
| F-02 — T-12's `coverage/**` rationale understated as diff noise | Medium | **Resolved** |
| F-03 — §3.4 / RK-2 describe an erratum TSPEC already absorbed | Medium | **Resolved** |
| F-04 — T-10's coverage oracle binds a whole-command exit it cannot fix | Medium | **Resolved** |
| F-05 — §4.6 "the parser sees seven tasks" | Low | **Resolved** |
| Q-01 — is T-11's hit count transcribed or re-measured? | — | **Answered in the document** |

No High finding is open. The revision introduced no new blocking issue: the parse-verification
claims §4.6 publishes were re-run against the shipped harness after the edit and all still hold, so
adding a fifth mutation row did not perturb the task, batch, ownership or wave derivations.

## Batches

The task table itself is unchanged in structure — nine tasks, four batches, no task added, moved or
retired by this revision. What changed inside the rows was re-checked file by file.

**Every file the table names exists, or is declared new.** Measured with `git ls-files` against this
tree: `pdlc/workflows/__tests__/documentOracles.test.js` (T-11, marked *(existing)*) and
`pdlc/workflows/orchestrate-dev.js` (T-02, T-07) are tracked; `waveResumePreflight.test.js`,
`waveResume.test.js`, `waveResumeRepoState.test.js`, `waveResumeQueueParity.test.js`,
`waveResumeProperties.test.js` are absent and each row creates them; `waveExecution.test.js` is
tracked and T-07 is declared its **sole** owner, with T-10 appending. `docs/_constraints/
pdlc-wave-gate-baseline.md` is present (T-03 edits it) and `pdlc-retirement-baseline.md` is present
(T-11 adds a row). T-12's manifest cell names *no* file and parses as the empty path list — measured,
not assumed (see §Verification).

**T-07's mutation duty now matches §4.3.** The cell reads "§4.3 rows 1–5, row 5's operator-pointed
write suppression, whose only oracle is AT-05's write-side conjunct — apply, observe RED against the
named oracle, revert, record". That closes v5 F-01's ownership half: the fifth mutation has an owner,
an observation duty, and a DoD checkbox (`§4.5`, "Each of §4.3's **five** mutations was applied,
observed RED against its named oracle, reverted, and its failure output recorded").

**The fifth row's oracle is a literal transcription of the upstream, not a paraphrase.** TSPEC §5.5
item 5 reads "Suppressing the record write while `explicitPointer` is true (writing only on automatic
runs). Killed only by AT-05's write-side conjunct… leaves AT-05, AT-07, AT-15 and AT-18 green".
§4.3's new row names the same mutation, the same single oracle and the same four green ATs. This is
the shape a mutation row should have: the expected value is copied from the spec, never derived from
the implementation it guards.

**T-10's oracle is now falsifiable by this feature's own work.** Oracle (i) asserts c8's per-file
branch number for `orchestrate-dev.js` `>= 85` and *reports* the whole-command exit status rather
than gating on it, with the reason stated in the row: the fourth `c8.include` entry
(`**/scripts/capture-learnings-baseline.mjs`, `allow-external: true`) takes the same per-file floor
and is outside this feature's reach. §2.2's batch-4 gate and §4.5's DoD line were both re-worded to
match, so the three statements of the same obligation now agree — which is what v5 F-04 asked for.

**T-12's coverage rationale is now the measured one.** The row states 94 tracked files under
`pdlc/workflows/coverage`, 81 of them under `coverage/tmp/`, and that `test:coverage` rewriting them
reds `PROP-SWEEP-2(a)` during T-10's own batch. Both counts reproduce exactly in this tree
(`git ls-files pdlc/workflows/coverage` → 94; `… coverage/tmp` → 81). The row correctly demotes the
diff-noise argument to "real but secondary". The `[Fake first]` convention and the boundary note
("must not touch `.claude/pdlc.config.json` in the working tree — T-01 reads it") are unchanged and
still correct.

## Dependencies

Batch-column arithmetic was re-derived from the declared edges after the edit, because a document
that publishes its own parse results has to keep publishing true ones.

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

The edge set is acyclic, ids are unique, every dependency resolves, and `T-05`, `T-06`, `T-09` appear
in no `#` and no `Deps` cell — so there is no dangling edge. `computeTopologicalBatches` run over the
current bytes returns `[[T-01,T-11,T-12],[T-02,T-03,T-04],[T-07,T-08],[T-10]]`, character-identical
to the column.

**Same-new-file guard, re-checked for batch 1.** T-11 and T-12 are concurrent and both concern
`documentOracles.test.js`; the collision is avoided by declaration rather than by luck — T-11 owns
the file, T-12's cell marks it *(read only — no edit; T-11 owns the file)* and T-12's manifest is
the empty path list, so the ownership parser records zero owned paths for T-12 and no wave contains
two tasks sharing a path. No other batch has two tasks touching the same new file: batch 2's three
tasks own three distinct new test files, batch 3's two own one new and one existing file, and batch 4
is a single task.

**TDD ordering.** Unchanged by this revision and still sound within the merged-task convention: T-02,
T-03 and T-07 are `[Fake first]` and each states the red half is written and committed first, in a
separate commit; §2.3's trade paragraph now cites "§4.3's **five** mutations are now *executed*" as
the compensating control for the ordering the runtime cannot enforce, and the DoD carries the
`git log -p` check. The one place the arithmetic of that argument was not carried through is RK-5 —
see F-01 below; it is a description of task size, not a duty, so nothing an implementer must do
depends on it.

## Verification

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
