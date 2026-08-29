# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md` (v0.3, Draft)
**Date:** 2026-08-29
**Iteration:** 3

## Overview

Delta re-review of v0.3 against my v2 (`CROSS-REVIEW-test-engineer-PLAN-v2.md`, verdict *Needs
revision*, 1 High / 2 Medium / 2 Low). I diffed the PLAN against the commit v2 reviewed
(`446a78692` → HEAD, 37 insertions / 14 deletions across five commits, one per finding) and confined
my reading to the changed rows: the header, the blast-radius paragraph, `T-00a`, `T-03`, `T-12a`,
`T-10a`, `T-18`, and the coverage-gate subsection.

**The v2 High is closed, and closed by measurement rather than by assertion.** `T-03`'s transcribed
enumeration now carries all four of `DECISION_CORPUS_ARGV`'s pathspecs; I ran the row's command as
written and it yields **25** at `8c673a09f` and **26** over `git ls-files` — the row's own numbers,
which the three-alternative form could not produce. Both deltas are now named in the row, so neither
count is a bare assertion, and the integrity guard is stated as set equality against a
hand-transcribed 25-path literal (my Q-01), which makes a 24-path fixture fail at batch 1 on the
missing path itself rather than surfacing later as an unexplained `T-09` red.

Both Mediums and both Lows are closed too, and `T-10a`'s flag-off referent is now T-02's committed
merge-base recording rather than a string subtraction (my Q-02) — the implementation echo is gone.

One **Medium** remains, and it is about delivery rather than content: the per-wave manual
delta-coverage run I asked for exists, but it lives in the row of the task that is dispatched *after*
the waves it is meant to guide. No High. **Approved with minor changes.**

## Batches

**The document still parses, after an edit that touched table cells.** Two of this round's five
commits changed pipe characters inside `T-03`'s cell (the fourth alternation, plus the GFM escape my
v2 F-05 asked for), which is exactly the kind of edit that can silently break a machine contract. I
re-ran the production parser over the live document rather than eyeballing it:

```
lintPlanArtifact  → ok: true, diagnostics: []
parsePlanTasks    → 24 tasks; for every task, declared Batch === max(dep batch) + 1
                    (24/24 OK, 0 mismatches); graph acyclic, ids unique, every dep resolves
```

No row changed batch, and no row gained or lost a dependency this round. `T-12a` is still batch 2 on
`T-00, T-00a`; `T-10a` still batch 2 on `T-01, T-02, T-03`; `T-18` still batch 8 on
`T-10, T-10a, T-11, T-17`; `T-19` still batch 9 on `T-12, T-12a, T-18`.

**`T-03`'s enumeration, re-measured against the repository.** The row now transcribes four
alternatives. Run as written:

| Enumeration | at `8c673a09f` | live (`git ls-files`) |
|---|---|---|
| the row's four-alternative grep | **25** | **26** |

Both match the row's stated numbers, and the reconciliation the row gives is the one I measured:
24→25 is `docs/discarded/pdlc-rcv-budget-stop/DECISIONS-pdlc-rcv-budget-stop.md` (present at
`8c673a09f`), 25→26 is this feature's own `DECISIONS-pdlc-decision-ledger.md`. The row's
"the command that does not run" note is also true: `git ls-tree -r --name-only 8c673a09f --
':(glob)docs/*/DECISIONS-*.md'` returns
`fatal: … pathspec magic not supported by this command: 'glob'`.

**`T-00a`'s corrected claim now matches what its assertion buys.** The row states plainly that the
`102` control pins the *complement* of the excluded namespace — it falsifies a mistyped prefix or an
over-broad exclusion, and it "does **not** and cannot detect a dropped `decisionLedger*` module".
That is exactly right. Re-measured at HEAD: `ls __tests__/*.test.js` → **154**, minus the four
existing prefixes → **102**, so the literal is still saturated as the row says.

**The namespace census moved to where it can be terminal, and it moved as a set.** `T-12a` now
carries a conjunct asserting the set of `decisionLedger*.test.js` module names is set-equal to the
twelve names hand-transcribed from this PLAN's file-ownership manifest. I checked the transcription
source is real and consistent: the manifest names exactly **twelve** distinct
`decisionLedger*.test.js` modules, and the task table's Test File column names the same twelve. A
set, not a count, so a dropped or renamed module names itself in the failure — and because `T-12a`
is committed skipped and un-skipped by `T-19` at batch 9, it cannot red the wave gate mid-feature
while the manifest lands one file per wave. This is the right home for the obligation.

**Same-batch same-new-file, re-checked.** No file ownership changed this round.
`documentOracles.test.js` still has three writers — `T-00a` (batch 1), `T-12a` (batch 2), `T-19`
(batch 9) — serialised by the real edges `T-00a → T-12a → T-19`.


## Dependencies

No edge was added, removed or re-pointed this round; the re-derivation above confirms the column
still equals `max(dep batch) + 1` for all 24 rows. Two ordering properties I re-checked because the
changed rows could have disturbed them:

- **`T-10a`'s flag-off referent is now an upstream artifact, not a computed one.** The row says the
  flag-off prompt is compared against **T-02's committed merge-base recording**, and explicitly
  rejects "a string computed by subtracting the block from the flag-on prompt". That closes Q-02 in
  the right direction: `T-10a` already carried `T-02` as a dependency, so the referent it now names
  is guaranteed on disk when `T-10a` runs. T-02 records from the *merge-base* worktree, so the
  referent predates every line of this feature's production code — it cannot be an echo of the code
  under test.
- **`T-02`-before-any-production-change survives.** `T-13` still carries `T-02` and the serial green
  chain `T-13 → … → T-18` inherits it. Nothing this round introduced a path to production that
  bypasses it: all five edited rows are either batch-1/2 red or test-only, except `T-18`, whose edit
  is prose about when to run a script.

The one dependency-shaped weakness this round introduces is not in the graph — it is in who reads
an instruction the graph places at batch 8. See F-01.


## Verification

Every claim below was measured on `feat-pdlc-decision-ledger` at HEAD, not read off the document.

**v2 F-01 (High) — resolved.** Covered in `## Batches`: the four-alternative command yields 25/26 as
the row claims, the dropped file is named, and the integrity guard is now set equality against a
hand-transcribed 25-path literal rather than something a count could satisfy. The row also keeps the
distinction that caused the defect visible for the next reader — `:(glob)` is for `git ls-files` at
runtime, the grep form is for the historical `ls-tree` enumeration — which is a better fix than
silently correcting the alternation.

**v2 F-02 (Medium) — resolved, with one caveat carried into F-01 below.** Each mechanical claim in
the rewritten paragraph checks out:

- `.claude/pdlc.config.json` → `implementation.testCommand` is
  `(cd pdlc/engine && npm test) && cd pdlc/workflows && npm test -- --testPathIgnorePatterns …` —
  plain `npm test`, no `test:coverage`, so the PLAN's "does not run at the wave gate" is now correct
  where v0.2 was wrong.
- `.github/workflows/pr-tests.yml:92` runs `npm run test:coverage`, under the job named
  `Unit tests (${{ matrix.os }}, node ${{ matrix.node }})` (`pr-tests.yml:28`) — the required check
  the paragraph names.
- `pdlc/workflows/package.json`'s `test:coverage` is the four-clause command quoted, clause 3 being
  `node scripts/check-wave-resume-delta-coverage.mjs`.
- In that script: `SUBJECT = "pdlc/workflows/orchestrate-dev.js"` (`:56`); `resolveBase()` iterates
  `["origin/main", "main"]` taking `merge-base HEAD <ref>` before falling back to the pin (`:93-97`)
  — so "prefers the live `merge-base HEAD origin/main`" is exact.
- `pdlc/workflows/orchestrate-dev.js` is 816.5 KB, so the "~817 KB" premise behind "clause 4 is
  genuinely not evidence here" holds.

The corrected consequence — batch-3 uncovered lines surface at PR time as a batch-8-era remediation
— is the right reading, and the DoD bullet naming the script and owning it to T-18 is the terminal
binding. What remains imperfect is only the per-wave feedback mechanism (F-01).

**v2 F-03 (Medium) — resolved, and resolved by moving the obligation rather than deleting it.**
`T-00a` now states what the control proves and what it cannot; the namespace census lives in `T-12a`
as set equality over twelve hand-transcribed names, un-skipped at batch 9. I verified the twelve
names exist identically in the manifest and in the task table, so the hand-transcription has a real,
single source.

**v2 F-04 (Low) — resolved.** The blast-radius paragraph now says **fifteen** new test/fixture paths
under `pdlc/workflows/__tests__/` and names the engine module as the sixteenth overall. Counted
against the manifest: twelve `decisionLedger*.test.js` modules + `helpers/decisionLedgerDoubles.js`
+ `fixtures/decision-ledger-baseline/**` + `fixtures/decision-corpus/**` = 15. The paragraph now
agrees with the manifest it declares it must agree with.

**v2 F-05 (Low) — resolved, without breaking the parser.** `T-03`'s leading pipe is now written
`\|` like its siblings, and `lintPlanArtifact` still returns `ok: true` over the edited document.

**Anti-echo, absence-only and set-equality checks over the changed rows.** All three of my standing
demands hold in the new text: `T-10a`'s flag-off arm compares to an upstream recording (no
implementation echo) and pairs each absence with a positive on the same path (`report` key set
set-equal to the flag-off key set; `notices` set-equal to the baseline array); `T-12a`'s new census
conjunct is set equality over a full enumeration, so a deleted module fails; `T-03`'s guard is set
equality over the fixture's path list, so a deleted corpus file fails. The two coverage tables were
untouched this round and remain set-equal to their sources (F-1…F-14; AT-01…AT-18).


## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Process | The per-wave delta-coverage run is addressed to "the implementer of each of batches 3–8" but lives only in `T-18`'s row, which is dispatched at batch 8 — after every wave it is meant to guide; `tech-lead` dispatches per task row, so no batch-3…7 implementer ever reads it | Batches, T-18; Verification, "Where it actually runs — corrected" |

### F-01 (Medium, Process) — the per-wave instruction is filed where its audience cannot see it

`T-18`'s row now carries: *"T-18 therefore owns an explicit instruction to the implementer of **each**
of batches 3–8: commit that batch's `orchestrate-dev.js` edit, then run the script by hand before the
wave closes."* The coverage section repeats it. This is the mechanism I asked for in v2 F-02, and its
content is right — but the instruction is stored in the row of a task that does not exist for the
reader until batch 8.

`pdlc/skills/tech-lead/SKILL.md` dispatches one `se-implement` agent per task, deriving batches from
the `Batch`/`Deps` columns (`SKILL.md:50-85`); an implementer receives their own task, not a reading
of the whole document. The implementer of `T-13` at batch 3 — the first task that adds lines to
`orchestrate-dev.js`, and the one whose uncovered lines the mechanism exists to catch early —
therefore never encounters the instruction. By the time `T-18`'s row is read, batches 3–7 have
closed and the feedback the instruction was meant to make per-wave has degenerated back to the
batch-8-era remediation the paragraph correctly identifies as the problem.

This is Medium, not High, because nothing about the *gate* is weakened: the DoD bullet
(`PLAN:421-424`) is terminal, correctly worded, owned by T-18, and the required CI check runs clause 3
regardless. Only the early-feedback improvement is undelivered.

The close is one line in each row that touches `orchestrate-dev.js` — `T-13` through `T-17` — of the
form *"before closing this wave: commit this row's `orchestrate-dev.js` edit, then run
`node pdlc/workflows/scripts/check-wave-resume-delta-coverage.mjs`; 0 uncovered lines in the
introduced ranges (T-18 owns the terminal check)."* That puts the obligation in the hands that can
act on it while keeping T-18's ownership of the outcome intact. Scope is `Process` rather than
`Local` because the general lesson recurs: an instruction addressed to a batch-N implementer must
live in a batch-≤N row, since per-task dispatch is the only channel that reaches them.

## Questions

| ID | Question |
|----|---------|
| Q-01 | `T-12a`'s namespace census asserts set equality against "the twelve names hand-transcribed from this PLAN's file-ownership manifest". The manifest is a document, so the transcription is a literal in the test — but should the conjunct also assert the count of `decisionLedger*.test.js` files matches, or is the set equality alone (which subsumes it) the intended and complete form? I read it as complete; worth being explicit that no glob-derived list may be used as the expected side. |


## Positive Observations

- **The High was closed by running the command, not by editing the number.** The row now carries all
  four pathspecs, names both deltas (24→25 and 25→26) with the specific file behind each, and keeps
  the `:(glob)`-vs-grep distinction visible so the next reader does not re-introduce the same
  three-alternative form. I re-ran it: 25 and 26.
- **The integrity guard answers Q-01 precisely.** "Set equality between the fixture's path list and a
  25-element literal path array transcribed by hand … not a count, and not a list generated at
  fixture-build time" is exactly the form that would have caught the defect, and it names the failure
  mode it prevents (a 24-path fixture failing at batch 1 on the missing path rather than as an
  unexplained T-09 red).
- **F-03 was closed by relocating an obligation, not by softening a claim.** `T-00a` now says what
  its control cannot see, and the census it cannot carry moved to `T-12a` as set equality over
  twelve names — terminal, un-skipped at batch 9, unable to red the gate mid-feature. That is the
  harder and better of the two closes I offered.
- **The coverage-gate paragraph corrects itself twice in two rounds and is now accurate line by
  line.** Every mechanical claim — `testCommand`, the CI job name, the four clauses, `SUBJECT`,
  `resolveBase()`'s ref order, the 817 KB premise — checks out against the files. It also states the
  consequence of its own correction as the *opposite* of what it previously drew, rather than
  preserving the original conclusion.
- **Q-02 was closed in the direction that removes an echo.** Naming T-02's committed merge-base
  recording as the flag-off referent, and explicitly rejecting the subtraction form as "an
  implementation echo", makes the flag-off oracle independent of the code under test.
- **The edit touched table pipes and the machine contract still holds** — `lintPlanArtifact` returns
  `ok: true` with zero diagnostics, 24 tasks, every batch re-derived equal to its column.

## Recommendation

**Approved with minor changes** — no High findings.

The one Medium (F-01) is non-gating and is a one-line addition to each of `T-13`…`T-17`: carry the
per-wave delta-coverage instruction into the rows whose implementers are dispatched during batches
3–7, keeping T-18's ownership of the terminal check. It may be actioned in implementation rather
than requiring another PLAN round.

Everything the v2 review blocked on is closed and independently measured: the four-pathspec
enumeration (25/26), the set-equality fixture guard, the corrected census claim with a terminal
namespace set-equality in T-12a, the corrected gate timing, the path count, the GFM pipe, and the
flag-off referent. The batch DAG, the file-ownership manifest, the same-file serialisation, the
red-before-green edges and both coverage tables hold unchanged under mechanical checking.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 0}

APPROVAL-HASH: sha256:56f03fa6455ba30db08e99f9e3d167accdacd8dc0a1ea99d56c1fb527959b5d2
APPROVAL-HASH-NORMALIZED: sha256:56f03fa6455ba30db08e99f9e3d167accdacd8dc0a1ea99d56c1fb527959b5d2
REVIEWED-COMMIT: 665eb44a827b16c42f8eff822915608631be3b3a
UPSTREAM-STATE: REQ sha256:ce6b133f0c1d692f172f1753b4d17a075bf1f933827a34701b2ee69d0d3c7b7c
UPSTREAM-STATE: FSPEC sha256:2bd5c3ef055fd39d2645482a97219c2d096b534a6bed0c55b99306d1735aed39
UPSTREAM-STATE: TSPEC sha256:1f1d7752522623b6fff9231fe6ac01cabb1b249039f01d2721b77a7f09bafc77
UPSTREAM-STATE: DECISIONS sha256:13aba06127b4d392bdf71f93066dd7ed6cb626dadbc4dda54029ab80bb4fb89a
