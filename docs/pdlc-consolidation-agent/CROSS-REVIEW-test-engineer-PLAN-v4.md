# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md`
**Date:** 2026-08-09
**Iteration:** 4
**Scope:** Local

## Method

Delta re-review. `git diff d929aab2..HEAD` over the PLAN — two commits, `c323ef05 docs(plan): own the
un-skipped build suite, split the shared block, serialise T07/T08 (v1.4)` and `d57808ba docs(plan):
correct §5's writer-count sentence for the multi-writer test files` — read in full (178 diff lines).
Only the changed regions were scanned for new issues; the whole task table and the whole ownership
manifest were re-run through the shipped Phase P gate functions, because both the batch column and
the ownership rows moved this round. Every code and upstream-document locator the revision adds was
re-measured at HEAD rather than taken from the revision's own account.

## Disposition of the v3 findings

| ID | v3 Severity | Status | Evidence re-measured this round |
|----|----------|--------|--------------------------------|
| F-01 | High | **Resolved** | §5 now names `pdlc/workflows/__tests__/consolidationBuild.test.js` in all three rows — T07 (`:311`), T08 (`:312`), T33 (`:336`). Parsed rather than read: `parsePlanOwnership` returns `T07.files = ["pdlc/skills/consolidate-learnings/SKILL.md", "…/consolidationBuild.test.js"]`, `T08.files` the same with `harvest-learnings`, and `T33.files` carrying it beside `CLAUDE.md` and `pdlc/RELEASE-CHECKLIST.md`. The wave commit is pathspec-scoped to exactly this list (`pdlc/workflows/orchestrate-dev.js:10187` — `const paths = Array.isArray(task.files) ? task.files : []`, handed to `commitPaths` at `:10193`, never `-a`), so each un-skip is now inside its own task's commit. T33's total-loss case is closed: it is alone in batch 12 and now owns the file itself |
| F-02 | High | **Resolved** | T03 authors seven blocks, not six (`:248`), with `T07 — skill prompt` and `T08 — skill prompt` split one per green owner, two conjuncts each, and the row states the reason in the terms the finding used (`a describe.skip( token is removed or it is not`). Both repairs from Q-01 were taken, not just one: the split *and* the serialising edges. `computeWaves(tasks, ownership)` over the current PLAN puts T07 in wave 8 and T08 in wave 9 — no wave contains two writers of `consolidationBuild.test.js` |
| F-03 | Medium | **Resolved** | §1's paragraph now reads "raised upstream, and since repaired upstream" and names where it landed (`:123-131`); §8.3's heading over the reviewer-read block now reads "the semantic half, **in addition to** the executable case each row already carries" (`:553`), with T07, T08 and T33's bullets each naming the block that pins the text and T12's two rows kept explicitly review-only. The upstream half checks out at HEAD: `TSPEC:166` and `:167` are the two `SKILL.md` rows, `:169` the `CLAUDE.md` row, and `TSPEC:2449` / `:2450` assign both cases to `consolidationBuild.test.js`. The `[Docs, review-gated]` label is gone from T07 and T08, which is right — it named the absence of a test |
| F-04 | Medium | **Resolved** | §5's `Batch` cells now read 5 (T07) and 6 (T08), matching §4's `Batch` column and the parsed graph exactly; `parsePlanTasks` gives `T07.dependencies = ["T12"]` at `planBatch` 5 and `T08.dependencies = ["T07"]` at 6 |

**Mechanical re-derivation, re-run and not asserted.** Importing the gate exports from
`pdlc/workflows/orchestrate-dev.js` and applying them to the file at HEAD: `parsePlanTasks` = **34**
tasks with no parse errors, `parsePlanOwnership` = **34** rows, `validatePlanContract(tasks,
ownership)` = `{"ok":true}`, `computeTopologicalBatches` = **15** ready-sets, batch-column mismatches
against `max(batch of Deps) + 1` = **0** across 34 rows, same-batch file collisions across the §5
manifest = **0**. `computeWaves` = 15 waves, and the one that matters is the build suite's: its seven
writers land in waves 2, 4, 7, 8, 9, 14, 15 — one per wave. Unlike v1.3's zero, this one is measured
over a manifest that *declares* the file for all seven writers, which is what makes it meaningful.
T07 and T08 have exactly one dependent between them (T08 on T07), so no task was orphaned by moving
them from batch 3 to batches 5 and 6.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **§5's re-counted writer sentence enumerates eleven files where twelve exist — `consolidationLifecycle` is missing.** The sentence at `:347` was corrected this round from "Three further test files carry two or three writers" to "**Eleven** further test files carry two to four writers each", and the number now matches the list that follows it — but not the manifest. Deriving multi-writer files from the parsed ownership rows gives **16**; four are itemised in the cluster table above (`consolidate-learnings.js`, `consolidationBuild.test.js`, `consolidationRoute.test.js`, `runtimeBundle.test.js`), leaving **12** for this sentence. `consolidationLifecycle.test.js` (T23 @ batch 3 → T31 @ batch 10) appears in neither the table nor the list, so the sentence's closing claim — "every one of those pairs sits in a strictly increasing batch, which is checkable from the manifest's own `Batch` column" — is a containment check over 11 of 12, not the set-equality over the enumeration that the same section demands of the PLAN's own oracles (§4.1 T03, T05). No batch hazard hides in the omission (3 → 10 is strictly increasing, and the collision count is 0 with it included), which is why this is not blocking; the defect is that the audit a reader performs from this paragraph would not have caught it. Add `` `consolidationLifecycle` (T23 → T31) `` and read "Twelve". | §5 |
| F-02 | Low | Local | **T33's new paragraph says the manifest "gains its fifth artifact"; it gains its fourth row.** `:274` closes with "the manifest gains its fifth artifact (T32, batch 11) one wave before this document records it". At HEAD `distribution-manifest.json` carries **three** rows — `orchestrate-dev`, `orchestrate-queue`, `pdlc-cli` — against **four** tracked paths under `pdlc/workflows/dist/` (`git ls-files`), because the manifest carries no row for itself. T32 therefore takes the manifest to **four** rows and `dist/` to **five** tracked files. That is exactly the five-files/four-rows distinction the same row states correctly two sentences earlier ("five tracked files, four manifest rows (§1's vocabulary)") and that T33's own oracle turns on — the enumeration is compared to `rows[]` *minus the manifest itself* (`TSPEC:2451`). Nothing here is asserted by count (the block parses both sides at run time, and §3.2's `CLAUDE.md` edit deliberately removes the prose count), so no test can inherit the slip; it is a one-word correction in a row an implementer reads immediately before writing a set-equality case where the two numbers differ by one. | §4.2 T33 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | T07 and T08 moved from batch 3 to batches 5 and 6 purely to serialise the build-suite writes, which is correct — but it also means the two `SKILL.md` edits, the feature's cheapest and most independent work, now sit behind `T12` (the adapter) and cannot start until wave 8 of 15. That is a schedule cost, not a correctness one, and I am not asking for a change. Was the alternative considered of moving T07 and T08 to the *front* of the cluster instead (T03 → T07 → T08 → T10 → T12 → T32 → T33, with `T10 deps T08` replacing `T12 deps T10`), which serialises identically at the same edge count but lets the prompt edits land in waves 3 and 4? If it was considered and rejected — e.g. because re-pointing T10's edge disturbs a row that is already reviewed — say so in §6.1 beside the `T07 → T12` note, so the next reader does not re-derive it. |

## Positive Observations

- The repair went past what the finding asked for. F-01 named the ownership gap; the revision fixed
  the ownership, the block split, the serialising edges, the batch cells, the cluster row, §1's
  paragraph, §8.3's heading and §9.1's row 1 — and then re-ran the gate functions over the result and
  recorded the new numbers with the reason the old zero was untrustworthy ("at v1.3 the same zero was
  returned over rows that under-declared"). That last sentence is the part I would have written
  myself; it is the difference between a measurement and a measurement you can audit.
- Q-01 and Q-02 from v3 were both answered in the document rather than in a reply. The split *and*
  the edges were taken where either alone would have closed the finding, and T33's "alone in the last
  batch, so no co-batch task's pathspec would carry the un-skip" is the answer to Q-02 written into
  the row that needed it.
- T03's row now carries the argument for the split inline — "a `describe.skip(` token is removed or
  it is not, so the first owner to run would either red the other's not-yet-landed conjuncts or leave
  its own case skipped". An implementer who is tempted to merge the two blocks back into one for
  tidiness reads why not, at the point of temptation, without a cross-reference.
- T33's red/green window is stated rather than assumed: the block stays skipped through T32's wave
  and is un-skipped in the same wave as the `CLAUDE.md` edit that greens it, "so no wave gate ever
  sees it red". That is the one ordering question a reviewer would otherwise have to re-derive from
  the wave partition, and it is correct — `computeWaves` puts T32 in wave 14 and T33 in wave 15.
- §6.1's new edge note says what the edge is *not*: "Neither prompt needs anything from the adapter
  or from the other prompt — the edges are serialisation and nothing else, which is why they are
  recorded here rather than left to be re-derived as a semantic dependency that does not exist."
  Batch-safety edges that look like semantic ones are how a later editor deletes them.

## Recommendation

**Approved with minor changes**

Both v3 Highs are resolved at the mechanism, not at the description. The three un-skips now sit in
the owning tasks' pathspecs, so each is committed by the wave that writes it; the shared block is two
blocks with one green owner each; the edges that keep them out of one wave exist and are labelled as
serialisation; and §1, §8.3 and §9.1 have stopped describing a world where the oracle does not exist.
Both Mediums are resolved too. The gate functions re-run clean — 34 / 34 / `{"ok":true}` / 15
ready-sets / 0 batch mismatches / 0 same-batch collisions / 15 waves with one build-suite writer each
— and this time over a manifest that declares the file.

The two findings left are both prose against measured repository state, one cell each, and neither
touches an oracle: an enumeration that lists 11 of 12 multi-writer files (F-01, in a sentence this
round rewrote) and a count that says "fifth artifact" where the manifest gains its fourth row (F-02).
Neither blocks Phase P. No design decision is reopened.

No upstream defect found this round: `TSPEC:166-167`, `:169`, `:2449-2451` carry what the PLAN says
they carry, `skillFiles.test.js:13-17` is the three-member `reviewSkills` literal the §9.1 row
describes, and `orchestrate-dev.js:10187-10193` is the pathspec-scoped commit the ownership argument
rests on. I emit no errata.

## Verdict

VERDICT: Approved with minor changes

{"high": 0, "medium": 1, "low": 1}
