# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md`
**Date:** 2026-08-10
**Iteration:** 8
**Scope:** Local

## Method

Delta re-review. `git diff c421ceb3..HEAD` over the PLAN returns **four** hunks and nothing
else: the version-header block (v1.7 prepended, v1.6 and older untouched), the T07 and T08 rows
in §4.1, the T33 row in §4.2, and one cell of §6.1's rejected-alternative table. 32 insertions,
5 deletions. No `Deps`, `Batch` or `Status` cell moved anywhere; no §5 manifest row moved.

Every gate number was re-derived, not copied, by importing `pdlc/workflows/orchestrate-dev.js`
at HEAD and running it over the revised text: `parsePlanTasks` → **34** tasks with no errors;
`parsePlanOwnership` → **34** ownership rows; `validatePlanContract(tasks, ownership)` →
`{"ok":true}`; `computeTopologicalBatches` → **15** ready-sets; `computeWaves` → **15** waves;
`planBatch == max(declared dep planBatch) + 1` re-derived per row and compared to the declared
`Batch` cell → **0** mismatches; same-batch same-owned-file collisions over §5's manifest →
**0**. Identical to v1.4's, v1.5's, v1.6's and v1.7's own claim, as a prose-only diff must be.

(One caution for whoever re-runs this: the ready-set index is **not** the `Batch` cell.
`computeTopologicalBatches` chunks each ready-set at five, so T00…T33 occupy 15 ready-sets
while the declared column runs to 12. Comparing the column against the ready-set index reports
13 phantom mismatches. The contract the column states — and the one §2 and §6.1 argue about —
is the declared-edge one, and that is the one measured above at 0.)

The revision's repository claims were checked at HEAD rather than accepted, and this is where
the round's two findings come from — `git log -S` shows that both T07/T08's and T33's
production edits **have since landed on this branch** (`9823d2cc`, `f5e300d1`, `927ecd15`), and
the revision re-measured the first pair against that landed state while leaving the second
pair describing a tree that no longer exists.

## Prior findings

| ID (v7) | Disposition |
|---|---|
| F-01 (Medium, Local) — the v1.6 header claims "four cells reverted" and names T28 among them, while the base commit carried exactly three non-`⬚` cells and T28 already read `⬚` | **Open, unaddressed.** v1.7 does not touch the v1.6 block, and re-measuring `git show 6a5d6aa0:…PLAN….md` still returns three non-`⬚` cells (T03 `🔴`, T17 `🔴`, T27 `✅`). Carried below as F-03 at unchanged severity — I am not deflating it for age, but I note its blast radius shrank: it is now a frozen historical paragraph two revisions down, read only by a harvest reconstructing round 6. |
| F-02 (Low, Local) — §2's status key advertises four glyphs the rule two lines later forbids the column to carry | **Open, unaddressed.** Key still at `:214` ("⬚ Not Started \| 🔴 Red \| 🟢 Green \| 🔵 Refactored \| ✅ Done"), rule still at `:216`. Carried below as F-04. |
| Q-01 (what does T13's commit contain when it finds the work already done?) | **Answered, and answered twice over.** v1.7's header answers it directly via §2's rule, and the T07/T08 rows now demonstrate the answer in the shape I was asking for: a row whose production edit has landed states what is at HEAD and hands the remaining work to an oracle. |

Neither prior finding was High and neither blocked. Neither closure was attempted, so nothing
about them can have regressed; the two new findings below are both in hunks this revision wrote.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **§6.1's rejected alternative still names an edge set that does not produce the numbers beside it — the fix replaced one unmeasured edge with another.** v1.7 rewrote the parenthetical to read "`T10 deps T08` replacing **`T07 deps T12`**", and the header asserts "Re-derived both readings at HEAD … The edge named is now the edge measured." I re-derived it and the mutation as written does not reproduce. Applying exactly it (drop `T07 deps T12`, add `T10 deps T08`, change nothing else) leaves **T07 with no dependencies at all**: it becomes a root at level 1, `computeWaves` returns **16** waves, not 15, and — the part that matters to this document's own rules — T03 and T08 both land at level 2 as writers of `consolidationBuild.test.js`, i.e. the mutation **creates the same-batch same-file collision rule 2 exists to prevent**. The graph that does return 15 ready-sets, 15 waves, 0 collisions and exactly the paragraph's own positions (T07 → 4, T08 → 7, T10 → 8, T12 → 9) is the one that *also* adds **`T07 deps T03`** — the edge the chain notation "T03 → T07 → T08 → T10 → T12" implies and the delta clause never states. So the round-6 defect (a named edge nobody measured) recurs at one remove: the dropped edge is now right, the added set is still short one. Fix is one clause — "with `T07 deps T03` and `T10 deps T08` replacing `T07 deps T12`". Not High: the *shipped* graph is unaffected and measured clean (0 mismatches, 0 collisions, 15/15); this is the rationale record for an ordering the document rejects. Falsifier: build the alternative task list both ways and compare `computeWaves(...).length` and the level-2 writer set for `consolidationBuild.test.js`. | §6.1, `T07 → T12` / `T08 → T07` row; v1.7 header clause (ii) |
| F-02 | Medium | Local | **T33's HEAD claims are stale, and stale in the one revision that re-measured its neighbours.** The row states as present-tense fact that `CLAUDE.md` "names only `orchestrate-dev.bundle.js` (`:58`), `orchestrate-queue.bundle.js` (`:59`) and `distribution-manifest.json` (`:60`), and closes '**Those three** are the tracked, shipped outputs' (`:62`) — a sentence that is **already false at HEAD**", that "at HEAD `git ls-files pdlc/workflows/dist/` returns four paths while `distribution-manifest.json` carries three rows", and that `rows[].id` is "exactly `orchestrate-dev`, `orchestrate-queue`, `pdlc-cli`". All four are false at today's HEAD. T33's production edit landed in `927ecd15`: `CLAUDE.md:58-62` is now the **five**-bullet enumeration including `consolidate-learnings.bundle.js` and `pdlc-cli.mjs`, `:64` reads the count-free "These are the tracked, shipped outputs", `git ls-files pdlc/workflows/dist/` returns **five** paths, and `rows[].id` is `consolidate-learnings, orchestrate-dev, orchestrate-queue, pdlc-cli` (**four** rows). The `describe.skip` on `consolidationBuild.test.js:287`'s `T33 — CLAUDE.md ↔ manifest` block is likewise already removed. The irony is local: v1.7's clause (i) added an instruction ("rewrite to a count-free form, not a `three` → `four` substitution") for work already correctly done, and in the same commit range T07 and T08 were re-measured against exactly this kind of landing ("`:56` (was the `Date Completed` date boundary) **now carries** …"). One row learned the lesson; the one beside it did not. Consequence is not a false green — the set-equality oracle is real and passes — it is that a DOD or harvest reader who trusts the row will look for a sentence at `:62` that is not there. Fix: give T33 the T07/T08 treatment, stating what is at HEAD and leaving the oracle to hold it. | §4.2 T33 row |
| F-03 | Medium | Local | *(carried from v7 F-01, unaddressed)* The v1.6 header block reads "four cells reverted" and enumerates "T03 and T17 read `🔴` and T27 **and T28** read `✅`"; the base commit carries three such cells and T28 already read `⬚`. Re-measured this round, unchanged. Two-word fix in a paragraph nobody will otherwise revisit. | Version header, v1.6 block |
| F-04 | Low | Local | *(carried from v7 F-02, unaddressed)* §2's status key (`:214`) still advertises `🔴 / 🟢 / 🔵 / ✅` as legal `Status` values two lines above the rule (`:216`) that forbids the column to carry anything but `⬚`. Either scope the key to its real remaining use (the glyphs that label a task's TDD role *inside* the description) or drop its non-`⬚` members. | §2, `:214` vs `:216` |

Applying this review's own oracle standard to itself: F-01 and F-02 are both stated as
positive measurements with their falsifiers named (a wave count and a level-2 writer set; a
`git ls-files` result and four line numbers), not as "the document seems out of date".

## Questions

| ID | Question |
|----|---------|
| Q-01 | Now that T07, T08 and T33's production edits have all landed, is there a rule for how a task row reads once its work is at HEAD — the way §2 gave the `Status` column one? T07 and T08 chose "state what is at HEAD and hand the pin to an oracle", which is the right shape and is why F-02 is legible as a defect at all. Stating it once in §2 would close the class the same way the `Status` rule did, rather than leaving each row to be caught individually as the branch advances past it. No finding filed — this is a suggestion about where the next such fix should live, not a defect in the document. |

## Positive Observations

- **T07 and T08 are exactly right, and I checked every anchor.** `consolidate-learnings/SKILL.md:56`
  carries the block/legacy predicate and `:62` carries `{topic} = failure-mode-id` — both verified
  by grep, both at the stated lines. `harvest-learnings/SKILL.md`'s `Harvested from` row is at `:77`
  inside a table running `:70-79`, exactly as the row says, with `Phases exercised` at `:78`. And the
  rows do not just restate the landing: they hand the anchors to `consolidationSkillAnchors.test.js`
  (present, and it sweeps *both* SKILL families, `:278` and `:401`) rather than asserting them by
  hand — which is the correct answer to the drift these very line numbers keep suffering.
- **The gate re-run is real arithmetic, not a copied block.** Six numbers, independently reproduced
  here from the revised text through the shipped parser: 34 / 34 / `{"ok":true}` / 15 / 15 / 0, plus
  0 collisions. A prose-only diff *should* leave these alone, but re-running rather than reasoning is
  what catches the mis-shaped cell that shifts a column under the parser, and the header did it.
- **Clause (i) diagnosed a gap its own oracle cannot see, and said so.** The T33 rewrite does not
  merely add TSPEC's instruction; it explains why the row needed it — `TSPEC:2841` deliberately
  leaves the prose count unasserted "precisely so there is no number left for a test to pin", so
  "Those five are the tracked, shipped outputs" would have shipped **green** and drifted again. That
  is the right way to reason about a hole in coverage: name the oracle, name what it cannot falsify,
  and put the obligation in the instruction instead. Both TSPEC citations resolve as quoted.
- **The `Status` rule held under a second wave of edits.** All 34 rows still read `⬚`; the revision
  touched three task rows and did not reach for a single cell. That is the class-closure from v1.6
  proving itself, which is the only evidence that a rule of that kind ever works.

## Recommendation

**Approved with minor changes**

No High findings. The two convergence questions answer cleanly, and both answers are measured.

**Did the revision close what I asked?** My two open items were F-01 (the v1.6 header's cell
miscount) and F-02 (the status key against the rule). Neither was attempted — both are carried
forward here unchanged as F-03 and F-04, at their original severities. Both were non-gating in
round 7 and remain so: one is a two-word correction in a frozen historical paragraph, the other
a legend that contradicts a rule on the same screen. My Q-01 was answered, and answered in the
document rather than in the thread.

**Did the revision break anything?** Not in the graph, and not in any oracle. 34 tasks, 34
ownership rows, `{"ok":true}`, 15 ready-sets, 15 waves, 0 batch-column mismatches, 0 same-batch
same-file collisions — every number re-derived here, none copied, all identical to v1.4's. The
batch DAG, the ownership manifest, the un-skip chain and the TDD ordering are exactly where
round 4 left them. What the revision did do is introduce two prose defects of the same family
it was fixing: §6.1's alternative still names an edge set that returns 16 waves and a rule-2
collision rather than the 15/15 beside it (F-01, one clause short — `T07 deps T03` is missing),
and T33 still describes a `CLAUDE.md` that stopped existing when its own task landed in
`927ecd15` (F-02). Neither reaches a test, a gate or a dispatcher, so neither blocks; both are
worth the small edit, because the whole value of §6.1 and §4.2 is that a later reader can
re-derive them, and today re-deriving either returns something other than what it says.

Recorded, not gating. The document is implementable as it stands.

## Verdict

VERDICT: Approved with minor changes

{"high": 0, "medium": 3, "low": 1}
