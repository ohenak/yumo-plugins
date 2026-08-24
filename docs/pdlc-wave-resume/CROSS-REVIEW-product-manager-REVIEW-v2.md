# Cross-Review: product-manager — REVIEW (final codebase review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-wave-resume/` artifacts and the feature's shipped diff (`main...feat-pdlc-wave-resume`)
**Date:** 2026-08-23
**Iteration:** 2

## Scope and method

**Note on iteration.** The task names `CROSS-REVIEW-product-manager-REVIEW-v1.md` as my previous
round, but no such file exists on this branch (`ls docs/pdlc-wave-resume/` lists cross-reviews for
REQ, FSPEC, TSPEC, DECISIONS, PLAN and PROPERTIES only; `git log --all -- '…-REVIEW-*'` returns
nothing). There is no prior REVIEW round to delta against, so this is a **full** product-lens
codebase review written to the mandated v2 path.

Method, product lens only:

- Read `REQ-pdlc-wave-resume.md` §7 (REQ-WVR-01 … -10) and `FSPEC` §6 (AT-01 … AT-18) first, then
  the shipped diff `main...feat-pdlc-wave-resume`.
- Traced each AC to a **production caller**, not to a builder's own unit test:
  `classifyWaveLedger` is called from `main()` at `pdlc/workflows/orchestrate-dev.js:16286`, and the
  five announcing rows plus two report rows are emitted from `main()` (lines 16207, 16220, 16292,
  16308, 16320, 16594, 16605), so the announcements ACs are driven through the served path.
- Ran the feature's suites: `npm test -- __tests__/waveResume*.js __tests__/waveExecution.test.js
  __tests__/documentOracles.test.js` → **7 suites, 212 tests, all pass**.
- Ran the CI gate the pipeline actually polls: `npm run test:coverage` → exit **0**,
  `orchestrate-dev.js` per-file branches **88.87 %** (floor 85).
- Checked runtime drift: `node pdlc/workflows/build-runtime.mjs --check` → `in-sync`.
- Compared PLAN §2.1's nine tasks against the branch's implementation commits.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | PLAN batch 4 never ran: **T-10 is unimplemented**, and the PLAN ships with its placeholders intact. | PLAN T-10; TSPEC RT-7/§5.8; REQ-WVR-03 |
| F-02 | Medium | Process | Nothing in the tree records that a PLAN task was left unrun, so the phase advanced to CR on an incomplete plan silently. | PLAN §2.2 batch gates |
| F-03 | Medium | Local | The new automatic-resume behaviour and its deletion hatch appear in no operator-facing document. | REQ-WVR-04 |
| F-04 | Low | Local | AT-09's re-invocation conjunct is not asserted in the AT-09 fixture; it is covered only by an adjacent arm. | REQ-WVR-09 (P0), FSPEC AT-09 |

### F-01 (High, Local) — PLAN batch 4 / T-10 is unimplemented and the PLAN ships with placeholders

PLAN §2.1 enumerates nine tasks (T-01, T-02, T-03, T-04, T-07, T-08, T-10, T-11, T-12; §4.6 confirms
"measured nine"). The branch carries implementation commits for **seven** of them:

```
git log --oneline main..HEAD --format='%s' | grep '^feat(pdlc-wave-resume): T-'
→ T-08, T-07, T-04, T-03, T-02, T-11, T-01     (7 rows; no T-10)
```

T-12 needs no commit — it is index-only, and its work is already true at the merge base
(`git ls-tree -r main --name-only .claude/` → exactly `pdlc.config.example.json` and
`settings.json`; `git ls-tree -r main --name-only | grep -c 'pdlc/workflows/coverage'` → `0`). So
T-10 is the one task with owed work that did not land.

T-10 owns two oracles in the two test files it is assigned (`waveResume.test.js`,
`waveExecution.test.js`): **(i)** c8's per-file branch number for `orchestrate-dev.js` asserted
`>= 85`, and **(ii)** the delta oracle — assert that no uncovered line reported by c8 falls inside
the line ranges this feature introduced, against the mapping table in PLAN §4.5.1. Neither exists:

```
grep -n "85\|coverage\|c8" pdlc/workflows/__tests__/waveResume.test.js \
                             pdlc/workflows/__tests__/waveExecution.test.js
→ (no output)
```

The consequence is visible in a tracked, shipped document. PLAN §4.5.1's mapping table — the one
PLAN itself calls the oracle ("its completeness — not a percentage — is the oracle") — still reads
`*(filled in by T-10, one name per arm, in `waveResume.test.js`)*` in its rows
(`PLAN-pdlc-wave-resume.md:489`). Two of §4.5's DoD checkboxes (`npm run test:coverage` …, "§4.5.1's
table is complete") are therefore unverifiable as written, and a maintainer reading the PLAN after
the feature ships is told the table will be filled in by a task that never ran.

What is **not** at risk, stated plainly so severity is not read as broader than it is: the floor
itself holds. `npm run test:coverage` exits 0 and reports `orchestrate-dev.js` at 88.87 % branches
against the 85 floor, so T-10's oracle (i) is duplicated by the CI check `Unit tests
(ubuntu-latest, node 20)`. Oracle (ii), the delta net that would red on a future edit leaving one of
this feature's new classifier or announcement branches uncovered, has no substitute anywhere.

Why High rather than Medium: the approved PLAN is the implementation contract, this is a whole batch
of it, CR is the last product gate before the feature ships, and the fix is bounded — run batch 4 as
written, then fill §4.5.1's table with the measured arm→test names. Leaving it open would ship a
document that describes work as pending inside a feature declared complete.

**What to change:** implement T-10 in the two files it owns, per PLAN §2.1's T-10 row — assert
`orchestrate-dev.js`'s per-file branch number `>= 85` (whole-command exit status reported, not
asserted) and add the delta arm over c8's uncovered-line list — then replace every
`*(filled in by T-10…)*` cell in PLAN §4.5.1 with the measured covering-test name, and tick §4.5's
two coverage checkboxes.

### F-02 (Medium, Process) — an unrun PLAN task left no trace, on a feature about not losing waves

F-01's gap is only findable by diffing PLAN §2.1's task ids against the branch's commit subjects. The
tree holds no artifact saying "batch 4 was not attempted": every task's status cell in PLAN §2.1 is
still `⬚`, including the seven that landed, so the status column carries no signal either way, and
`POSTMORTEM-PR-pdlc-wave-resume.md` covers the PR phase, not Phase I.

This is worth a `Process` tag rather than a `Local` one because the failure mode is generic: any
feature whose last batch is skipped reaches CR looking finished. The cheap, mechanical check is the
one I had to run by hand — the set of `T-NN` ids in PLAN §2.1 minus the set of `T-NN` ids in the
branch's implementation commit subjects must be empty, or every id in the remainder must be an
index-only task whose stated effect is already true at the merge base (T-12's case here). That check
belongs in the DoD phase, where it would have caught this before CR.

I am not claiming the orchestrator misbehaved — I can only observe the absent commit, and the last
commit on the branch is `chore(pdlc-wave-resume): wave 3 build outputs`. The finding is about the
absence of an observable, which is exactly the class of defect this feature exists to fix.

**What to change:** after F-01 is closed, tick PLAN §2.1's status cells for the tasks that landed so
the column carries signal, and raise the id-set check for the DoD phase (harvest as a `Process`
learning if it is not adopted in this feature).

### F-03 (Medium, Local) — the automatic resume and its hatch are in no operator-facing document

REQ-WVR-04 (P0) requires "a **documented**, announced escape hatch exists to force a full run despite
a valid record". The announced half ships and is well covered: the deletion hatch is named in both the
resume banner and the skip banner (`orchestrate-dev.js:16308`, `:16320`), and AT-08's positive
conjunct 1 proves the named hatch is the hatch that works.

The documented half has no home in the repository:

```
grep -rn "pdlc-wave-state\|wave ledger" pdlc/OPERATIONS.md CLAUDE.md pdlc/README.md
→ (no output)
```

`CLAUDE.md` states that `pdlc/OPERATIONS.md` "carries the full operational detail … the phase graph
and erratum channel, implementation waves … Read it before debugging pipeline behavior", and this
feature adds a new automatic behaviour — a run that skips Phase I entirely on the strength of a
machine-local file — that an operator debugging "why did my run skip Phase I?" cannot look up.

I am **not** raising this as High, because the narrowing was made deliberately upstream and approved:
FSPEC §3.3 (`FSPEC-pdlc-wave-resume.md:161-164`) states the hatch "is named in the announcement of
outcomes (b) and (c), so an operator reading either announcement learns how to undo it **without
consulting documentation**". That is a conscious, reviewed reading of REQ-WVR-04's "documented", not
a silent reinterpretation, so re-litigating it in CR would be re-opening an approved decision. The
residual product gap is still real and cheap to close.

**What to change:** add a short subsection to `pdlc/OPERATIONS.md` naming `.claude/pdlc-wave-state.json`,
the three resume outcomes, the six disregard causes and the deletion hatch — one paragraph, no
behaviour change, no REQ/FSPEC edit needed.

### F-04 (Low, Local) — AT-09's re-invocation conjunct is not asserted in the AT-09 fixture

FSPEC AT-09 (REQ-WVR-09, P0) reads: "*Given* a run whose waves' gates pass but which commits nothing
… *When* the pipeline is re-invoked for the same feature and unchanged plan, *Then* implementation
starts at that same wave, announcing it as not previously completed."

The shipped AT-09 arm (`waveExecution.test.js:2679-2694`, "writes no ledger at all when there is no
git transport to commit with") asserts the write side only — `expect(ledgerWrites(writes)).toEqual([])`
paired with a positive assertion on the "no git transport is injected" notice. The pairing rule is
respected, so this is not an absence-only oracle; what is missing is the AC's own operator-visible
outcome, the **second** invocation's resume point. The companion arm at `:2699` varies gate mode, not
invocation count.

The behaviour is in fact covered — `:2652-2658` drives `main()` with `ledger: null` and asserts
`dispatchedTaskIds(freshRecord)).toEqual(["T1","T2","T3"])`, and `waveResume.test.js` covers guard 1
(no record → full run from wave 1) at the unit level — so this is a traceability gap, not a coverage
hole, which is why it is Low and not blocking.

**What to change:** either sequence the two invocations inside the AT-09 arm (run with no `_git`,
then re-invoke the same fixture and assert every wave is dispatched), or annotate the AT-09 arm with
a pointer to the arm that discharges the re-invocation conjunct so the trace is readable.

## Questions

| ID | Question |
|----|---------|
| Q-01 | PLAN §2.1's T-12 row states `git ls-files pdlc/workflows/coverage` returns **94** tracked files and that commit `b1b846bd` added three machine-local paths to the index. At the current merge base both are already false (`0` tracked coverage files; `.claude/` tracked set is exactly the two shared files), so T-12 was a no-op after the BL-04 rebase. Was that confirmed at implementation time, or did T-12 pass vacuously? I have routed the stale measurement as a PLAN erratum rather than a finding, since the document is upstream of this review. |
| Q-02 | On F-03: was the decision to leave the ledger out of `pdlc/OPERATIONS.md` deliberate (the announcement is self-documenting, per FSPEC §3.3) or simply not scoped into any task? PLAN §2.1 assigns no task an `OPERATIONS.md` edit, which suggests the latter. |

## Positive Observations

- **The three ACs I most expected to be softened are the ones landed most strictly.** REQ-WVR-08's
  "outcome catalogue closed at three" is a genuine set-equality check, not containment —
  `waveResume.test.js:26` asserts `new Set(RESUME_OUTCOMES)).toEqual(new Set(["full-run","resume","skip-phase"]))`
  **and** `.length).toBe(3)`, against a literal transcribed from the spec rather than read back out
  of the module. The same shape covers the `implementation.*` key surface (`:83`, AT-08 conjunct 2).
  A deleted outcome fails a test.
- **AT-12's oracle is call counts, not absence.** REQ-WVR-08's "Phase I skipped in full" could have
  been discharged with a "no commit was produced" assertion that cannot tell a skipped V-wave from a
  V-wave that ran with nothing to add. It was not: the shipped arm counts agent dispatches and gate
  invocations on the seams, and separately pins Phase PT's one dispatch and one gate call. That is
  the distinction the AC actually cares about.
- **Negative arms carry their positive conjunct on the same path throughout.** The clearest example
  is `waveExecution.test.js:2621-2658`: rather than assert only that `forcePhases` cannot override
  the ledger, the arm asserts the token is *rejected* with the six-token catalogue named, then adds
  the control — same forced run with the ledger removed dispatches `["T1","T2","T3"]`. "The lever
  does not exist" and "the lever exists and loses" are separated deliberately.
- **REQ-WVR-10's ignore-rule anchoring is asserted against the rule, not against observed quiet.**
  `waveResumeRepoState.test.js:63-83` checks line **equality** (`toContainEqual`), root-anchoring on
  the matched line, and `git check-ignore -v` resolving to *that* line — with the forbidden weakenings
  (`some(line => line.includes(...))`, "no churn observed") named in a header comment so a reviewer
  can check they were avoided. This is the AC's "anchored to an ignore rule, not to nobody happening
  to stage it" read literally.
- **Provenance is announced in exactly the places TSPEC §2.4 enumerates, and nowhere else.** Five
  announcing rows (`orchestrate-dev.js:16207, 16220, 16292, 16308, 16320`) plus the two Phase I
  report rows (`:16594`, `:16605`), with the wave-1 `All M waves complete (…)` string kept verbatim
  so the pre-existing report contract is unchanged. REQ-WVR-01's "resume point and provenance in both
  the run log and the report" is satisfied on both channels.
- **The ancestry probe is genuinely lazy and the reason is written down where it can be checked.**
  `ANCESTRY_INDEPENDENT_CODES` (`:12896`) plus the `outcome === "full-run" &&` conjunct at the call
  site keep the `merge-base` probe off the paths whose verdict it cannot change, and the comment
  states the invariant rather than asserting it in prose only.
- **Runtime artifact and CI gate both green at review time**, which matters for a feature whose whole
  value is a run that resumes: `build-runtime.mjs --check` → `in-sync`; 212 tests across the seven
  touched suites pass; `npm run test:coverage` exits 0 at 88.87 % branches on `orchestrate-dev.js`.
- **REQ-WVR-05's honest framing survived into code.** The requirement was moved from "self-clearing"
  to "self-invalidating" during authoring, and the shipped retention comment above the `⏭` report row
  (`:16584-16591`) states exactly that rationale — a halt in CR/DOD/PUB must not re-dispatch a green
  wave. Documents and code agree.

## Positive Observations

## Recommendation

## Verdict
