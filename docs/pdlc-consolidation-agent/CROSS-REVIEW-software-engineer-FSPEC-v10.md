# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v10.0)
**Date:** 2026-08-06
**Iteration:** 10
**Scope:** Local unless tagged otherwise
**Protocol:** delta re-review. Baseline `84fdb30` (the last FSPEC commit before my v9 was written);
diff `84fdb30..HEAD` — 51 insertions, 28 deletions across 6 FSPEC commits (`a5843b5`, `f41ad78`,
`acc905e`, `b383f5e`, `c19a1b4`, `db4ba99`, `9fff001`). Only the changed sections were re-read for
new issues.

## Prior findings — disposition

Both v9 findings were re-checked against the revision and against HEAD. **Both are closed as filed**,
and all three v9 questions are answered — two by the repair itself, one by a clause added in the
place I asked for it.

| v9 | Verdict | Evidence |
|---|---|---|
| F-01 (Medium) — the cell-level set-equality claim was falsified twice: §8.3 indexes `phase` without naming it, and the §8.4 harvest-side lookup indexes `symptom`/`artifact`/`phase` and was not a reader at all; and a record short of `phase` had no stated observable | **Resolved in the direction I proposed, and both halves.** (a) §8.3's reader row (`:1182`) now names `phase` explicitly — "`phase`, which the `prevented` test is a function of" — and states **three arms, one per field**, including the one that was missing: short of `phase` the row is **still emitted and the verdict falls to `insufficient-evidence`**, with the derivation given rather than asserted ("a record with no `phase` and a `phase` the §2 mapping cannot decide are the same epistemic state"), and §8.3's own totality rule was amended to carry the same sentence from the other side (`:1396-1399`). That is exactly Q-01's proposal, and it adds no concept. (b) The harvest-side lookup is now its own row, "**§8.4 steps 2–3 harvest question**" (`:1180`), with `symptom` named for the first time in the table; the reader count moved 7 → 8 at both sites that state it (`:1157`, `:1194-1196`), the closure sentence enumerates eight readers (`:1160-1163`), and §8.4's step-2 cell carries the back-pointer (`:1435`). I re-checked the cell-level closure by hand over all eight fields: `failure-mode-id` (§6.4, §8.4 step 1, §8.4 steps 2–3, §8.3), `phase` (§8.3, §8.4 steps 2–3), `symptom` (§8.4 steps 2–3), `artifact` (§8.3, §8.5, §8.4 steps 2–3), `target` (§5.1, §8.6), `passId` (§6.4), `action` and `route` (§6.4, §8.4 step 1) — every field is named by at least one cell, and I found no reader of a failure-mode record outside the eight rows. The bookkeeping arithmetic still holds after the row was added: the four bookkeeping fields are read by §5.1, §6.4, §8.4 step 1 and §8.6, and the new row indexes none of them, which is what `:1194-1196` now says |
| F-02 (Low) — AT-R6b's deferral site was not anchored at §14.5 LD-2 | **Resolved verbatim.** `:2056` now reads "(§8.2's third note; §14.5 LD-2, which also carries the >2-candidate elided set)", so a reader arriving from §13 reaches the register rather than only the note. I re-grepped the `PROPERTIES-owned` sites: every one now anchors at its LD row |
| Q-01 — should a record short of `phase` emit the §8.3 row at `insufficient-evidence`? | **Answered yes, and in both places.** `:1182` and `:1396-1399` |
| Q-02 — is the §8.4 harvest lookup deliberately outside the reader table? | **Answered no — it was an omission, and it is now a row** (`:1180`) with its own arms, including the `failure-mode-id` arm (no question asked, notice is the report, "never a re-slugged or minted id"). The unqualified universal is now true rather than qualified away, which is the better of the two directions I offered |
| Q-03 — is the parse notice still emitted on a short-`passId` record? | **Answered yes, in §6.4 where I asked for it** (`:839-843`): "**The parse notice is still emitted** … the exception this paragraph states is to the *skipping*, never to the notice". Consistent with E-12b, which already said it |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
