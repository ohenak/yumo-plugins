# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md` (Version 1.4)
**Date:** 2026-08-23
**Iteration:** 7 (delta re-review of the v1.3 → v1.4 revision; DECISION FREEZE in force)
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity

## Overview

A delta re-review under DECISION FREEZE. PLAN moved v1.3 → v1.4 in one commit (`86a61ab6`); its bytes
are now `sha256:136abcfb16ce8a2150271ceee957146ac442157f43e11386f5c9904ae21e7e81`, no longer the
`ea7bdc57…` my v6 approved. `git diff 5d5f15b4..HEAD` on the PLAN is **8 insertions, 5 deletions**
across three hunks: the version cell, a new v1.4 revision-history row, RK-5's mutation-run count, and
§4.6's preamble sentence.

**My one v6 finding (F-01, Low) is closed, and closed with exactly the edit I named.** §4.6 no longer
cites the retracted "1,637 commits behind" premise; it now justifies parsing against
`git show origin/main:pdlc/workflows/orchestrate-dev.js` on the reason that survives — that parser is
the shipped one and is byte-identical to this tree's copy — and dates the parse to the v1.3 edit with
the v1.2 and v1.1 runs kept as history. Every row of §4.6's result table is byte-unchanged, as I asked.

The revision also lands the test engineer's round-6 F-01 (RK-5's "four mutation runs" → "five"), which
was the last surviving stale count outside the v1.1 history row.

**Nothing broke.** No task, batch, `Deps` edge, oracle, acceptance criterion or requirement mapping was
touched. I re-ran the shipped parser over the v1.4 text myself: 9 tasks, the same ids, the same
dependency edges, the same four batches, 9 ownership rows, zero near misses — every §4.6 claim still
true of the bytes in front of me. Zero findings; approving.

## Batches

The whole delta, hunk by hunk, each checked against the tree or the upstream text at HEAD rather than
against the routing note that asked for it.

| Change | What v1.4 did | Verdict |
|---|---|---|
| **PM v6 F-01 (Low) — §4.6's stale premise** | The preamble's `since this tree is 1,637 commits behind` clause is replaced by "the shipped parser, byte-identical to this tree's copy now that the OB-F1 rebase has landed (`git diff origin/main -- pdlc/workflows/orchestrate-dev.js` is empty at HEAD, §1.2)", and the parse is dated "**after the v1.3 edit** (and, before it, after the v1.2 erratum edit and the v1.1 merge)" | **Closed exactly as scoped.** Both new facts verified in this tree: `git rev-list --count HEAD..origin/main` → `0`; `git diff origin/main -- pdlc/workflows/orchestrate-dev.js` → 0 lines. The replacement keeps the reason for parsing against `origin/main` (it is what ships) instead of dropping the justification with the stale number, and the staleness in the same sentence's dating — the second half of my v6 finding — is fixed in the same edit. §4.6's result table is untouched, as I asked |
| **TE v6 F-01 (Low) — RK-5's sizing** | RK-5's inventory of T-07's size reads "…one report-row branch and **five** mutation runs" (was "four") | **Closed, and it is the right number.** §4.3's table carries five mutation rows (`:386` heading, five `\|`-leading data rows), and T-07's `Mutation duty (§4.3 rows 1–5…)` at `:130` owns all five. `grep "four mutation"` now returns only `:18` (the v1.1 history row, historically correct) and `:21` (the v1.4 row describing this correction). RK-5's mitigation text — the re-invoke-don't-split argument — is verbatim unchanged, so no risk posture moved |
| **Version cell + v1.4 revision-history row** | `Version` 1.3 → 1.4; a new row records both findings, their severities, and "No task, batch, `Deps`, oracle or parse-result change" | **Accurate as written.** The diff bears the claim out: outside these two prose fixes the file is byte-identical. The row does not claim a v1.4 parser re-run, which would have been the tempting overstatement — it leaves §4.6 dated at v1.3, which is honest, and I re-ran the parser myself to confirm the results survive the v1.4 bytes anyway (see §Verification) |

**On scope.** This revision adds nothing and removes nothing. Two counts and one justification clause
changed; no obligation was created, discharged, moved or weakened. Requirement coverage is therefore
identical to the mapping I walked in v3/v4/v5 and re-confirmed in v6: every P0/P1 requirement still has
an owning task, no batch changed hands, no acceptance criterion was narrowed, broadened or re-triggered.

**On the freeze.** Nothing in this delta opens a decision, and I open none. My v6 Q-01 (§4.6's
provenance history is accreting faster than its data reads) is now *partly* answered — the preamble
folds three runs into one sentence — and the remainder is a readability preference, not a defect. It is
recorded as a DEFERRED line under §Findings, not as a finding.

## Dependencies

PLAN's citations of upstream and of the tree, restricted to the ones this delta reaches. Citations
outside the changed lines were walked in v3–v6 and are not re-litigated under the freeze.

| PLAN citation | Upstream / tree at HEAD | Status |
|---|---|---|
| §4.6 preamble — "byte-identical to this tree's copy now that the OB-F1 rebase has landed" | `git diff origin/main -- pdlc/workflows/orchestrate-dev.js` | **Agrees** — 0 lines of diff |
| §4.6 preamble — cross-reference to §1.2 for the rebase fact | §1.2's v1.3 re-measurement table | **Agrees** — §1.2 already carries `HEAD..origin/main` → `0` as a v1.3 re-measurement, so the two sections now tell one story instead of contradicting each other |
| §4.6 preamble — "run after the v1.3 edit (and, before it, after the v1.2 erratum edit and the v1.1 merge)" | The v1.3 revision row's "parser re-run confirms 9 tasks and the same four batches" | **Agrees** — the dating and the history row are consistent for the first time since v1.3 |
| §4.6 table — `parsePlanTasks(PLAN)` → 9 tasks, ids `T-01…T-12`, `warnings` undefined, the nine dependency cells | I re-ran `parsePlanTasks` over the v1.4 bytes | **Agrees exactly**: `T-01,T-02,T-03,T-04,T-07,T-08,T-10,T-11,T-12`; `warnings` `undefined`; deps `[] / [T-01] / [T-01] / [T-01] / [T-02] / [T-02] / [T-07,T-08,T-03,T-04] / [] / []` |
| §4.6 table — `computeTopologicalBatches` → `[[T-01,T-11,T-12],[T-02,T-03,T-04],[T-07,T-08],[T-10]]` | Same run | **Agrees exactly** |
| §4.6 table — `parsePlanOwnership` → 9 rows, **zero near misses** | Same run | **Agrees exactly** — 9 ownership entries, `nearMisses: []` |
| §4.6 `Retired ids` row — nine tasks, `T-05/T-06/T-09` retired and unreused | The parse above | **Agrees** — nine ids, none of the retired three present |
| RK-5 — "five mutation runs" | §4.3's table (`:386` and its five rows); T-07's mutation duty (`:130`) | **Agrees** — three independent statements of five, no fourth statement of four outside history |
| Task-table manifest paths | The tree | **Agrees.** `waveExecution.test.js`, `orchestrate-dev.js` and `docs/_constraints/pdlc-wave-gate-baseline.md` exist; `waveResumePreflight.test.js`, `waveResume.test.js`, `waveResumeRepoState.test.js`, `waveResumeQueueParity.test.js`, `waveResumeProperties.test.js` are each marked `*(new)*` in their manifest cell (`:126–:132`) and are correctly absent |

**On the one thing the delta could have broken and did not.** §4.6's whole purpose is a claim about the
*current* task table parsing cleanly. A prose-only edit cannot change the parse — but the revision
re-dated the parse without re-running it, which is exactly the shape that goes stale silently. I ran it
myself against the v1.4 bytes with the tree's `orchestrate-dev.js` (byte-identical to `origin/main`'s,
so the parser the document names and the parser I used are the same program): every one of the four
result rows reproduces. The re-dating is therefore true of the bytes as shipped, not merely of the
bytes it was written against.

## Verification

Every claim above is a command I ran in this tree, not an impression.

| Claim | Verification | Result |
|---|---|---|
| The branch I may commit on | `git rev-parse --abbrev-ref HEAD` | `feat-pdlc-wave-resume` |
| PLAN's bytes moved this round | `shasum -a 256` vs. v6's approval hash | `136abcfb…`, was `ea7bdc57…` |
| The delta's shape | `git log --oneline 5d5f15b4..HEAD --` and `git diff --stat` on the PLAN | One commit `86a61ab6`; **8 insertions, 5 deletions** |
| The delta's content | `git diff 5d5f15b4..HEAD --` on the PLAN | Three hunks only: version cell + v1.4 row; RK-5's count; §4.6's preamble sentence. Nothing else |
| My v6 F-01's premise is really retracted | `grep -n "1,637"` on the PLAN | No hit outside §1.2's re-dated historical table |
| The replacement premise is true | `git rev-list --count HEAD..origin/main`; `git diff origin/main -- pdlc/workflows/orchestrate-dev.js \| wc -l` | `0` and `0` |
| RK-5's new count matches §4.3 | `grep -n "five mutation\|rows 1–5"` | §1.1 (`:185`), §4.3 heading (`:386`), RK-1 (`:422`), **RK-5 (`:426`)**, §4.5 checkbox (`:447`), T-07 duty (`:130`) |
| No stale "four mutations" survives outside history | `grep -n "four mutation"` | `:18` (v1.1 history row) and `:21` (the v1.4 row describing the fix) — both historically correct |
| §4.6's `parsePlanTasks` row is true of the **v1.4** bytes | Imported `pdlc/workflows/orchestrate-dev.js` and ran `parsePlanTasks` over the current PLAN | 9 tasks, ids as listed, `warnings` `undefined`, all nine dependency cells identical to the table |
| §4.6's `computeTopologicalBatches` row | Same run | `[[T-01,T-11,T-12],[T-02,T-03,T-04],[T-07,T-08],[T-10]]` — identical |
| §4.6's `parsePlanOwnership` row (9 rows, zero near misses) | Same run | `ownership` length 9, `nearMisses` `[]` |
| The parser I ran is the parser §4.6 names | `git diff origin/main -- pdlc/workflows/orchestrate-dev.js` | Empty — same program |
| Every file the task table names exists, or is declared new | `test -e` over all seven manifest paths; `grep -n "\*(new)\*"` at `:126–:132` | `waveExecution.test.js`, `orchestrate-dev.js`, `docs/_constraints/pdlc-wave-gate-baseline.md` present; the five `waveResume*.test.js` files absent and each marked `*(new)*` |
| Requirement coverage unchanged by the delta | The diff touches no task row, no `Deps` cell, no batch, no oracle | Every P0/P1 retains the owner it had at v1.3; nothing re-batched |

**Test-quality checks on the changed material.** The delta changes no oracle, no assertion and no
property, so the three standing bars are inherited rather than re-tested — but I re-checked that the
delta did not quietly weaken the two that live in the changed lines' neighbourhood. RK-5's inventory is
a *sizing* claim, not an oracle, and raising it from four to five makes the risk row larger, never
smaller. §4.6's table is a set-equality style check by construction (it enumerates all nine ids, all
nine dependency cells and the full batch partition, so a dropped task fails it), and the preamble edit
left every row of it byte-identical — verified by the diff and by re-running the parse. No absence-only
oracle was introduced: §4.6's "zero near misses" negative is paired on the same run with the positive
"9 ownership rows, these paths", which is exactly the pairing the bar asks for.

## Findings

**No findings.** The v1.3 → v1.4 delta introduced no defect and contradicts nothing in the repository
at HEAD or in any upstream document. Under the freeze, the two blocking categories — a regression this
revision caused, or a load-bearing claim made false by the tree — are both empty.

Prior findings, closed this round and recorded here so the round history reads without opening v6:

| Prior ID | Severity | Status in v1.4 |
|---|---|---|
| v6 F-01 | Low | **Resolved, exactly as scoped.** §4.6's preamble drops the retracted "1,637 commits behind" premise for the byte-identity reason, and re-dates the parse to the v1.3 edit while keeping the v1.2 and v1.1 runs as history — both halves of the finding, in one edit. §4.6's result table is byte-unchanged, and I re-ran the parse to confirm every row is still true of the v1.4 bytes |

DEFERRED: §4.6's provenance sentence still accretes three parse dates (v1.1, v1.2, v1.3) inline; a single "last parsed at" line above the table would read better than the history, though the results the implementer needs are current and correct either way (v6 Q-01, now partly answered).
DEFERRED: The header's `Cross-Reviews` cell still stops at the round-5 files and does not list the round-6 cross-reviews whose findings v1.4 lands; harmless provenance drift, no parsing or task consequence.

## Questions

| ID | Question |
|----|---------|
| — | None. The delta is two corrections I asked for or agreed with, and both reproduce against the tree. |

## Positive Observations

- **The fix kept the justification and dropped only the false part.** The easy version of my v6 finding
  was to delete the "1,637 commits behind" clause and leave `git show origin/main:…` unexplained. The
  revision instead replaced the retracted premise with the one that is true and still load-bearing —
  that `origin/main`'s parser is the shipped one and is byte-identical here — and cited §1.2 for it, so
  the two sections now agree instead of contradicting each other. A reader can still tell *why* the
  parse is run against a ref rather than the working tree.
- **The second half of the finding was fixed too, unprompted by any table.** My v6 finding buried the
  dating problem ("after the v1.2 erratum edit" vs. the v1.3 re-run claimed below it) in the same
  paragraph as the main one. It would have been easy to close the headline and leave the dating stale.
  Both landed in one sentence.
- **The v1.4 history row does not overclaim.** It says what changed and asserts "No task, batch,
  `Deps`, oracle or parse-result change" — a claim the diff supports exactly — and pointedly does not
  claim a v1.4 parser re-run it did not perform. Given how many rounds of this document have turned on
  stale measurement provenance, declining to date a run that was not made is the right instinct.
- **The last stale count is gone.** RK-5 was the one place "four mutation runs" survived outside
  history; with it corrected, all six statements of the mutation cardinality across §1.1, §4.3, §4.5,
  T-07, RK-1 and RK-5 now say five. The v5 High is not just closed at its site — it is closed
  everywhere it echoed.
- **A minimal delta on a frozen document.** Eight lines added, five removed, three hunks, one commit,
  zero task-table bytes touched. That is what a freeze round should look like: the two agreed
  corrections and nothing else riding along.

## Recommendation

**Approved.** My single v6 finding is closed with the exact edit I specified, and the co-landed
test-engineer correction is verified true against §4.3. Nothing regressed: the diff touches no task,
batch, dependency edge, oracle, acceptance criterion or requirement mapping, and I re-ran the shipped
parser over the v1.4 bytes to confirm §4.6's four result rows — the only claims a prose edit could have
quietly falsified — are all still exact. No High findings, none of any severity. Two observations are
recorded as DEFERRED lines rather than findings, per the freeze.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
