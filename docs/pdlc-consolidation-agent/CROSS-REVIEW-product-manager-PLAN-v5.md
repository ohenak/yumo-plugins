# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md`
**Date:** 2026-08-09
**Iteration:** 5
**Scope:** delta re-review of the v1.4→HEAD diff against v4's findings, changed cells only.
Baseline diff: `d57808ba` (the commit v4 reviewed) → HEAD `9b7ea731`. The content diff is
**one table cell**: T03's Status column, `⬚` → `🔴` (`:248`). Every other section is
byte-identical to what v4 approved and is not re-litigated.

## 1. Disposition of v4's findings

v4 carried **no High findings** — the verdict was *Approved with minor changes*, `{"high": 0,
"medium": 0, "low": 1}`. There is therefore no blocking finding to clear, and the delta question
is narrower than usual: did this revision break anything?

| v4 ID | Severity | Status | Re-measured at HEAD |
|---|---|---|---|
| F-12 | Low | **Still open** | §5's writer census still reads "Eleven further test files carry two to four writers each" (`:347`) and still enumerates exactly eleven names, ending at `consolidationProperties`. The twelfth multi-writer suite is still missing: `consolidationLifecycle.test.js` has two writers in §5's own ownership rows — T23 (`:326`) and T31 (`:334`). Re-derived, not recalled. Unchanged by this diff, which touched only T03's Status cell. Not gating, for the same reason it was not gating in v4: T23 sits in batch 3 and T31 in batch 10, so the collision count is zero either way and no batch-safety property moves. |

## 2. Re-measurement of the revision's own claim

The commit message behind the diff (`9b7ea731`) claims T03 is Red because
`consolidationBuild.test.js` "already lands seven `describe.skip` blocks". §2's status key
(`:139`) reads `⬚ Not Started | 🔴 Red | 🟢 Green | 🔵 Refactored | ✅ Done`, so the cell asserts
exactly that the RED half of T03 has landed as the row specifies.

**Measured against committed HEAD, not the working tree.** The tree is dirty right now
(`git status --porcelain` shows modified `.gitignore`, `nudge-consolidation.sh`,
`consolidationBuild.test.js`, `consolidationRung.test.js`, and an untracked
`consolidationPredicate.test.js`). Read from the working tree, T03's block count comes out at
**six** skipped blocks and the `T10 — gitignore text` block reads already un-skipped — which
would have been a High. Read from `git show HEAD:…`, which is what "the commits for this task
land on the branch" means, the picture is clean:

| Claim in the changed cell | Re-measured at HEAD |
|---|---|
| T03's suite exists | `pdlc/workflows/__tests__/consolidationBuild.test.js` tracked, created on this branch by `38a55af5` ("T03 RED — … seven skipped build/source-text blocks"). |
| **Seven** `describe.skip` blocks | Exactly seven at HEAD: `:56`, `:86`, `:134`, `:155`, `:210`, `:239`, `:287`. Counted from `git show HEAD:…`, not from the dirty tree. |
| One block per green owner, matching the T03 row | Set-equal to the row's enumeration, in order: `T10 — gitignore text`, `T12 — adapter prompt`, `T12 — rtConsInjections`, `T32 — the consolidation bundle`, `T07 — skill prompt`, `T08 — skill prompt`, `T33 — CLAUDE.md ↔ manifest`. The T07/T08 split v3's F-09 asked for is present as two blocks, not one. |
| The status is `🔴` Red, not `🟢` | Correct — all seven are `describe.skip`, so nothing has been un-skipped yet, and no green owner's edit is at HEAD: `.gitignore` carries no `docs/_decisions/.consolidation-lock` at HEAD (T10, `⬚`), and `nudge-consolidation.sh` carries no `CORPUS_GLOBS` at HEAD (T09, `⬚`). The two `⬚` rows that would have contradicted a Red T03 are consistent with it. |
| The graph still parses | Re-run over HEAD's PLAN: `parsePlanTasks` → **34**, `parsePlanOwnership` → **34**, `validatePlanContract` → `{"ok":true}`, `computeTopologicalBatches` → **15**, `computeWaves` → **15**. `T03` parses as `{"dependencies":["T00"],"planBatch":2}`. The Status column is not a parsed cell, and the edit moved none of the numbers v4 recorded. |

So the changed cell is **true**, and it is the only thing in the diff. The finding below is not
that this cell is wrong; it is about the five sibling cells the same pass left behind.

## 3. Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-13 | Medium | Process | **The Status column became a live ledger for one row and stayed a baseline for six.** T03 is now `🔴`; six sibling tasks whose deliverables are committed at HEAD are still `⬚ Not Started`: T00 (`consolidationPreflight.test.js`, created by `60e058e7`), T01 (`__tests__/helpers/consolidationDoubles.js`, `048d6cbb`), T02 (`pdlc/workflows/consolidate-learnings.js`, `fa3d96b7`), T04 (`consolidationHookParity.test.js`, `c1e9f9af`), T05 (`consolidationTraceability.test.js`, `4148e741`), T06 (`consolidationRung.test.js`, `7e941e4a`). Each verified present via `git cat-file -e HEAD:…`. The problem is not that six cells are stale — a uniformly stale baseline is readable. It is that after this diff a reader cannot tell what `⬚` means: T10's `⬚` is *true* (no `.gitignore` entry at HEAD) while T02's `⬚` is *false* (the module is at HEAD), and nothing in §2 distinguishes them. §2 defines the status **key** (`:139`) but never says who writes the column or when — and the runtime does not: implementation waves commit code under `implementation.postWavePathspecs`, they do not edit the PLAN. So this cell was flipped out of band under a rule the document does not state. Fix, either direction: (a) bring T00, T01, T02, T04, T05 and T06 to `🔴`/`🟢` in the same pass so the column means one thing throughout, or (b) revert T03 to `⬚` and add one sentence to §2 saying the column is the Phase-P baseline and that landed state is read from git, never from this table. (a) is more useful; (b) is cheaper and equally honest. What is not sustainable is the current mixture. | PLAN §2 status key (`:139`); §4 task table |
| F-14 | Low | Local | **T13's "both axes in the same commit" rule is already half-broken at HEAD, and T13 still reads as if neither axis had moved.** The row (`:257`) requires `AWAIT_SCAN_SOURCES` to gain `"consolidate-learnings.js"` and `AT19_SEAM_NAMES` to gain `_envPresent` and `_makeTempDir` — "**Both, in the same commit**", with the stated reason that widening only one axis leaves the scan green over exactly the seams this feature invents. At HEAD, `runtimeBundle.test.js:226` already carries `"_envPresent", "_makeTempDir"`, while `:1051` still reads `AWAIT_SCAN_SOURCES = ["orchestrate-dev.js", "orchestrate-queue.js"]`. That is precisely the half-widened state the row warns against, and it arrived before T13 dispatched. The row is not *wrong* — it is a plan for future work, and T13's `⬚` does not lie — but an implementer reading it will look for two edits and find one already made, which is the moment a "both in one commit" instruction gets quietly dropped. One clause on the row ("the seam-name half may already be at HEAD; T13 owes the source-set half and must assert both") costs nothing and preserves the reason the pairing exists. | PLAN §4 T13 (`:257`); TSPEC §13.3(ii), §11.3(c) |

Nothing else in the diff produced a finding. I looked specifically for the two ways a status
edit can do damage — a cell that makes a downstream row's precondition read as satisfied when it
is not, and a cell that changes what a wave dispatcher believes it must run — and neither is
present here: the dispatcher derives readiness from `Deps` and `Batch`, both untouched, and the
one cell that moved is true.

## 4. Questions

| ID | Question |
|----|---------|
| Q-08 | Who owns the Status column during Phase I, and is it meant to be maintained at all? If the answer is "nobody, it is a Phase-P artefact", F-13 resolves by reverting one cell and writing that sentence into §2 — and that is a better outcome than six more hand edits that will drift again. |

## 5. Positive Observations

- **The claim in the cell survived re-measurement, including the one that could have been a
  High.** T03's row promises seven blocks, one per green owner, and HEAD's suite carries exactly
  seven `describe.skip` blocks whose titles are set-equal to the row's enumeration. The T07/T08
  split that v3's F-09 asked for is there as two blocks, and the reason is restated in the
  suite's own header rather than only in the PLAN — which is the right place for it, since the
  next person to touch that file reads the file, not this document.
- **The status flip is Red, not Green, and the two rows that would have contradicted it are
  consistent.** It would have been easy to over-claim here. A `🟢` on T03 would have implied an
  un-skip; instead the cell says Red, and `.gitignore` and `nudge-consolidation.sh` at HEAD both
  confirm no green owner has landed. The document did not round its own progress up.
- **The diff is one cell and behaves like one cell.** 34 tasks, 34 ownership rows,
  `{"ok":true}`, 15 batches, 15 waves — every number v4 recorded re-measures identically. No task
  in the diff implements behaviour REQ does not ask for, and no P0/P1 obligation moved. For a
  document at iteration 5, a revision that changes exactly what it said it would change is worth
  naming.

## 6. Errata for upstream documents

**None.** The whole diff is PLAN-internal — a single Status cell. Nothing in it depends on REQ,
FSPEC, TSPEC, DECISIONS or PROPERTIES text, and the upstream citations v4 verified were not
touched this round.

## 7. Recommendation

**Approved with minor changes.**

v4 raised no High findings, and this revision — one Status cell, `⬚` → `🔴` on T03 — introduces
none. The cell is true when measured against committed HEAD: seven `describe.skip` blocks, one
per declared green owner, no un-skip landed, and the task graph re-parses to the same 34/34/15/15
v4 recorded. Scope held: nothing added, nothing dropped.

Three non-gating items, in the order I would fix them:

1. **F-13 (Medium)** — the Status column now means two different things in one table. Either
   bring T00, T01, T02, T04, T05, T06 up to date in the same pass, or revert T03 and say in §2
   that the column is a Phase-P baseline and landed state is read from git.
2. **F-14 (Low)** — T13's "both axes in the same commit" rule is already half-satisfied at HEAD
   (`runtimeBundle.test.js:226` widened, `:1051` not). One clause on the row keeps the pairing
   from being dropped by the implementer who finds half of it already done.
3. **F-12 (Low, carried from v4)** — §5's writer census says "Eleven further test files" and
   names eleven; `consolidationLifecycle` (T23 → T31) is the twelfth. One word, one name.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 2}


APPROVAL-HASH: sha256:772556cc7bae9a5342f811c461d01cb279738f7070672c30b9499d0ad534e7ec
REVIEWED-COMMIT: 6d350ba7cfa18e155711813c6ca85e83e338d5af
