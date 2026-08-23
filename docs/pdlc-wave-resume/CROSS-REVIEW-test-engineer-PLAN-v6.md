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

Every claim below was measured in this tree at `5d5f15b4`, not read.

| Claim under test | Method | Result |
|---|---|---|
| §4.6 `parsePlanTasks(PLAN)` → 9 tasks, no warnings, the stated ids and edges | ran the shipped parser from `pdlc/workflows/orchestrate-dev.js` | **Confirmed**: 9 tasks, `warnings` empty, `T-11`/`T-12` isolated sources |
| The fifth mutation row did not perturb the parse | same run, post-edit | **Confirmed**: `planBatch` `1,2,2,2,3,3,4,1,1`, unchanged from v1.2 |
| §4.6 `computeTopologicalBatches` → the four batches | ran the shipped function | **Confirmed**, identical to the `Batch` column |
| §4.6 `parsePlanOwnership(PLAN)` → 9 rows, `nearMisses: []`, `T-12 → []` | ran the shipped parser | **Confirmed**; `nearMisses` is `[]` and `T-12`'s file list is `[]` — the new §4.3 row and its backticked `explicitPointer` spans introduced no near miss |
| §4.3 row 5's oracle wording matches TSPEC §5.5 item 5 | read `TSPEC:805` | **Confirmed**: same mutation, same single oracle (AT-05's write-side conjunct), same four ATs that stay green |
| T-07's mutation-duty cell says rows 1–5 | read the row | **Confirmed** |
| §4.5's DoD mutation checkbox says five | read `§4.5` | **Confirmed** |
| v5 F-03's remedy is true upstream, not asserted | read TSPEC RT-7 and §5.8 | **Confirmed**: RT-7 reads "the last implementation **task** (PLAN T-10, RK-2) runs `npm run test:coverage`… Not `implementation.postWaveCommand`" — the PLAN's new "no erratum is open" claim is accurate |
| T-12's `94` / `81` coverage counts | `git ls-files pdlc/workflows/coverage` and `… /tmp` | **Confirmed exactly**: 94 and 81 |
| §1.2's four re-measured post-rebase facts | ran all four | **Confirmed exactly**: `git rev-list --count HEAD..origin/main` → `0`; `grep -c WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js` → `10`; `docs/_constraints/pdlc-wave-gate-baseline.md` present; `pdlc/workflows/package.json:9` defines `test:coverage` with `--per-file --branches 85` |
| §1.2's `.gitignore:46` citation | read the file | **Confirmed**: line 46 is `/.claude/pdlc-wave-state.json`, and the PLAN quotes the line verbatim alongside the anchor, so this is not a bare `file:line` citation under DEC-DOC-01 |
| §4.6's "Retired ids" row now reports nine | read `§4.6` | **Confirmed**, and nine is what the parser returns |
| Residual "four mutation" occurrences | `grep -n "four mutation"` over the PLAN | **One left**: RK-5 (`§4.4`) — see F-01 |

**Coverage claims against the current suite layout.** The task table's test-file assignments still
match the tree: `pdlc/workflows/__tests__/` holds `waveExecution.test.js` and
`documentOracles.test.js` (both existing, both correctly marked), and none of the five new suites
the PLAN creates collides with an existing name. T-08's `fast-check` precedent
(`advisoryHelperProperties.test.js`) is present, so the property suite has a live pattern to copy
rather than an invented one. The property strategy for the parameterisable components
(`classifyWaveLedger`, `parseWaveLedger`, the hash) is carried by T-08's P-1…P-4 with `numRuns: 500`
pinned, matching TSPEC §5.7 and PROPERTIES — the divergence flagged in round 4 stays closed.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **One "four mutations" survives the five-mutation correction.** §4.4's RK-5 still sizes T-07 as "harness extensions, three assertion updates, sixteen integration cases, five announcement suffixes, one report-row branch and **four mutation runs**, in two files". Every *duty-bearing* statement was corrected — §4.3's heading and its five rows, T-07's "§4.3 rows 1–5" cell, §2.3's trade paragraph, RK-1, and §4.5's DoD checkbox — so no implementer can stop at four: the checkbox they tick and the cell they work from both say five. What is wrong is the risk row's own arithmetic, and it matters only in that RK-5 is the row that decides whether T-07 fits a wave budget; sizing it one mutation light is a small, one-directional understatement of the largest task in the plan. Remedy is one word: `four mutation runs` → `five mutation runs`. Measured: `grep -n "four mutation"` over the PLAN returns exactly this one line. | §4.4, RK-5 |

No High and no Medium findings are open. The four prior Mediums (v5 F-02, F-03, F-04, and the
round-4 carry-overs behind them) are each resolved by a landed edit whose factual claim was
re-measured above, and v5's High (F-01) is resolved in every place where an implementer's obligation
is written down.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §1.2 now keeps the v1.0 pre-rebase measurement table *and* labels it "no longer the tree's current state", which is the honest way to preserve why T-01 exists. As the document ages further, would it be worth marking the table's rows with the v1.3 re-measured value in a fourth column, so a future reader who skims the table without reading the paragraph above it cannot misread `1637` as current? Not a finding — the paragraph does the job today, and T-01's own oracle is what actually enforces the state. |

## Positive Observations

- **The High closed where it counts, and it closed by transcription.** §4.3's fifth row does not
  paraphrase TSPEC §5.5 item 5 — it carries the same mutation, the same single oracle, and the same
  enumeration of ATs that stay green. An expectation copied from the spec rather than reasoned back
  out of the implementation is exactly the discipline a mutation table needs, and it is what makes
  the row falsifiable when T-07 actually runs it.
- **The fifth row was given an owner *and* a duty *and* a checkbox, not just a row.** The three
  places that decide whether a mutation is really run — T-07's cell (`rows 1–5`), §4.5's DoD
  checkbox ("five mutations was applied… reverted, and its failure output recorded"), and §2.3's
  trade paragraph — moved together. A row added without those three would have been decoration.
- **The paragraph explaining the fifth mutation states the stakes in behavioural terms.** "Removes
  resume from exactly the recovery path §2.5 ratifies the write for" is the sentence that tells an
  implementer why the write-side conjunct is load-bearing; it is a better guard against reaching for
  a weaker oracle than the row alone would be.
- **T-10's coverage oracle became falsifiable by this feature's own work.** Binding the gate to
  `orchestrate-dev.js`'s per-file number while *reporting* the whole-command exit is the right split:
  the number this feature can move is the assertion, and the wider red still surfaces for whoever
  owns it. All three statements of that obligation (§2.1 oracle (i), §2.2's batch-4 gate, §4.5's DoD)
  were moved in the same revision, so there is no stale third copy to mislead the implementer.
- **T-12's rationale was replaced by a measurement, not by a stronger adjective.** 94 tracked files,
  81 under `coverage/tmp/`, pristine tree → 3 reds, post-`test:coverage` → 4 with the extra being
  `PROP-SWEEP-2(a)`. Both counts reproduce exactly. A precondition justified this way cannot be
  descoped as tidiness by a reader in a hurry, which was the whole risk.
- **§3.4 and RK-2 now record agreement instead of an erratum, and the upstream backs them.** TSPEC
  RT-7 really does assign the floor to the last implementation task and give the PLAN's reasoning
  back. Closing a self-described divergence by checking the upstream rather than by softening the
  wording is the harder and the correct move.
- **Q-01 from round 5 was answered inside the document.** T-11 now says the implementer re-runs the
  sweep and records what it then returns, "rather than transcribing the ten above… and no oracle pins
  the number either way". That converts a number a reviewer could misread as a defect into an
  explicit instruction, and it states the reason the number is unpinnable.
- **§4.6 stayed a true record after being edited.** Adding a table row to §4.3 is exactly the kind of
  change that quietly breaks a published parse result; re-running `parsePlanTasks`,
  `parsePlanOwnership` and `computeTopologicalBatches` after the edit returns the same nine tasks,
  the same four batches, `nearMisses: []` and `T-12 → []`. The document's most valuable section is
  still trustworthy.

## Recommendation

**Approved with minor changes**

The round-5 High (F-01) is resolved: TSPEC §5.5's fifth mutation now has a row, a named single
oracle transcribed from the spec, an owner who must *run* it, and a DoD checkbox — verified in each
of those four places. All four round-5 Mediums are resolved by edits whose factual claims reproduce
in this tree, and the Low is fixed. Nothing in the revision broke a section the previous rounds
approved: the parse results §4.6 publishes were re-run post-edit and are unchanged, the batch column
still equals the re-derived DAG, and no near miss was introduced by the new backticked spans.

One Low remains — RK-5's "four mutation runs", the single surviving instance of the old count in a
risk-sizing sentence that carries no implementer duty. It does not block; fixing it is one word and
can ride with any later edit.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
