# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v11.1)
**Date:** 2026-08-06
**Iteration:** 11
**Scope:** Local unless tagged otherwise

**Protocol:** delta re-review. Baseline `9fff001` (the last FSPEC commit before my v10 was written);
diff `9fff001..HEAD` — 19 insertions, 15 deletions across nine FSPEC commits (`ee742a3`, `c8ab0cc`,
`7de603b`, `3bf184e`, `b759d7d`, `d8b7f2f`, `586a7d9`, `46bd850`, `04e172e`, plus the v11.1 deletion
commit `4fbb696`). Only the changed sections were re-read for new issues.

**Governing decisions read before scoring:** `docs/_decisions/DECISIONS-review-severity-bars.md`
DEC-SEV-02 (`:40-54` — a falsified bookkeeping-completeness assertion, where no observable, rule,
arm or downstream artefact is wrong and the repair is deletion or narrowing, is **Low**),
`docs/_decisions/DECISIONS-review-convergence.md` DEC-CONV-01 (`:21-32` — approval carry-forward),
and `docs/_decisions/DECISIONS-spec-layer-boundary.md` DEC-LAYER-01, which the changed registers
lean on. Both new decisions were recorded on 2026-08-06 in `4fbb696` and are applied here for the
first time. Both of this round's findings fall squarely in DEC-SEV-02's class and are scored **Low**
under it; under the pre-decision bar I would have filed the first as Medium, and I am recording that
explicitly so the adjudication is visible rather than silent.

## Prior findings — disposition

All three v10 findings are **closed**, and both v10 questions are answered. F-01 was closed twice
over: first repaired (`ee742a3`, `c8ab0cc`), then — when the operator's Phase-F post-mortem verdict
found the repair had left the universal still falsifiable — closed by **deleting** the universal
outright as v11.1 (`4fbb696`), per the post-mortem's own delete-don't-repair rule.

| v10 | Verdict | Evidence |
|---|---|---|
| F-01 (Medium) — §14.5's disjointness paragraph sent §8.1's unavailable-`phase`/**id** arms to §14.1 T-10, which carries neither, and the id arm has no rendering to spell; and the paragraph's "every deferral has exactly one home" was false for it | **Resolved, by both repairs I proposed and then by deletion.** (a) `/id` is gone from `:2229-2234`; the clause now reads "§8.1's §8.4 steps 2–3 unavailable-**half** rendering", and the paragraph states positively that "**The `phase` and `failure-mode-id` arms are this table's alone** (LD-5), not both registers'", with the reason given per arm — the first carries the pinned §15.2 verdict, the second emits no row. (b) T-10 (`:2162`) now anchors the `phase`-adjacent rendering at the row that actually states it — "from §8.1's **§8.4 steps 2–3** reader row, the **unavailable-half rendering**" — and adds an explicit exclusion, "**§8.1's `phase` and `failure-mode-id` arms are deliberately not here** … neither produces a rendering for TSPEC to spell", with the §8.7 streak argument for why treating `phase` as an unavailable literal would make `unmeasurable` unreachable. I verified that argument's two supports at HEAD: §10.4 item 5 does fix what the §8.3 row renders (`:1837-1839`), and §8.7 exists (`:1545`) with `consolidation.unmeasurablePasses` as its threshold (`:1898`). (c) The universal itself — "Between the two registers, every deferral this document makes has exactly one home" — is **deleted**, together with T-10's "and the two sets are disjoint", BR-33a's "so every arm has exactly one home" and E-12b's "per that table's cell-level set-equality" (`4fbb696`). That is the stronger close: the finding class cannot recur from text that no longer exists |
| F-02 (Low) — §8.4 step 1's cell stated one arm across three fields, unstateable for a record short of `failure-mode-id`, while a *different* reader's row asserted step 1's behaviour on that field | **Resolved as proposed, and in both directions.** `:1181` is now "**Two arms, because one of the three fields is the list's own member type**": short of `action` or `route` the id stays open; short of `failure-mode-id` "'open' is unstateable, because the list is a set of ids and the record carries none — the record **contributes no member to the list at all** and the parse notice is the whole report, never a minted or re-slugged id (BR-35b)", with the AT-F19 reconciliation stated in the same shape §8.3's row uses for the same field. §8.4's step-1 detail cell (`:1435`) gained the matching back-pointer, so the section and the table agree from both sides. I checked the three anchors the new cell adds: BR-35b (`:2545`), O-C7 (`:2183`) and AT-F19 (`:2113`) all exist and say what the cell attributes to them — AT-F19's expected list is the literal `{B, C, D}` over ids the fixture's log carries, so an id-less record is genuinely outside its range |
| F-03 (Low) — E-12b's field→reader parenthetical listed seven of eight fields, omitting `action`, while the same row's AT cell named the `action` arm | **Resolved verbatim.** `:2591` now carries "`action` for §6.4 / §8.4 step 1" and closes with "all eight of §8.1's fields". I re-counted: `route`, `target`, `action`, `artifact`, `passId`, `phase`, `failure-mode-id`, `symptom` — eight, matching §8.1's writer table |
| Q-01 — is §14.5's intended reading "the spelling of every **unavailable** observable is T-10's", with the id arm swept in by a list written faster than checked? | **Answered yes, and the alternative reading explicitly refused.** `:2162` and `:2233-2234` both now say the id-short record "emits **no** row at all, so there is nothing to render". §8.3's set-equality obligation was not reopened, which is the direction I recommended |
| Q-02 — is §8.4 step 1's cell deliberately one arm because its three fields are interchangeable for the open-list computation? | **Answered no — it was an omission, and the cell now states the reasoning I asked for** (`:1181`): the third field is "the list's own member type", which is exactly why it is not interchangeable with the other two. Stating it in the cell makes the row self-contained, which is what §8.1's "no reader is left to infer its own arm" (`:1164-1166`) exists to require |

## Findings

_(pending)_

## Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_

## Verdict

_(pending)_
