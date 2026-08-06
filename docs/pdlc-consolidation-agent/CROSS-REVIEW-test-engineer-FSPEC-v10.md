# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v10.0)
**Date:** 2026-08-06
**Iteration:** 10
**Scope:** Testing lens only, delta re-review under the structural freeze declared in
`POSTMORTEM-F-pdlc-consolidation-agent.md` §Resolution step 2 and under `DEC-LAYER-01`
(`docs/_decisions/DECISIONS-spec-layer-boundary.md`, confirmed present). Baseline for the diff is
`84fdb30` — the commit v9 was written against; the revision is seven commits, `a5843b5`…`9fff001`.
Prior findings M-01, L-01, L-02 and questions Q-01, Q-02 are verified for disposition; new
observations are drawn **only** from changed text.

## Prior findings — disposition

All three v9 findings are **resolved**, and both v9 questions are answered inside the document. Each
was checked against the revised text and, where it made a claim about another section or about this
repository, against the cited target.

| v9 ID | Sev | Disposition | Evidence in v10.0 |
|----|---|---|---|
| M-01 | Medium | **Resolved by the larger of the two admissible shapes — the table was completed, not the claim scoped** | The revision took shape (2) of my two, and took it in both places the audit failed. (a) **`phase`.** §8.1's §8.3 cell (`:1182`) now names three fields — "`failure-mode-id`; `artifact`, for the row's canonical path; **`phase`**, which the `prevented` test is a function of" — and spells **three arms, one per field**: short of `phase` "the row is likewise still emitted and its **verdict falls to `insufficient-evidence`**, never to a guessed `prevented`". That is exactly the direction I derived from `:1383-1384`, and §8.3 itself was carried back rather than left to the table: consequence 2 (`:1396-1399`) now states "A promotion **record** short of the `phase` field is the same epistemic state and takes the same direction". (b) **`symptom`.** The §8.4 harvest question is now an eighth **reader with its own row** (`:1180`), indexing `symptom`, `artifact`, `phase` and `failure-mode-id`, and §8.4 step 2 (`:1435`) says so from its own side. The counts were carried through consistently — `:1104` "The eight readers", `:1153-1157` the eight-member enumeration, `:1191-1193` "all eight readers … the other four" with the bookkeeping gloss re-derived. I re-checked the field-side direction the claim asserts and it now holds: every one of §8.1's eight fields is named by at least one cell (`target` §5.1/§8.6, `failure-mode-id`/`action`/`route`/`passId` §6.4, `symptom`/`artifact`/`phase` §8.4 steps 2–3, `phase`/`id`/`artifact` §8.3, `artifact` §8.5). (c) The **third outcome I said the document forbade elsewhere** — "skip the record for §8.3", which the general rule at `:1143-1145` literally directed — was closed at its source: the skip rule (`:1155-1161`) now states "Nor is skipping the safe direction where dropping the reader's **output** would itself be read as a decision … because a missing row and an unasked question both move a verdict silently", and settles precedence explicitly: "**Where a cell states an arm, the cell is normative and this rule is its default, not its override**". A test author asked today what a `phase`-short record does has exactly one answer |
| L-01 | Low | **Resolved, and in the durable form I offered second** | The two arms are no longer disposed of by assertion. BR-33a (`:2535`) replaces "indexed by readers whose `route`/`target`/`artifact` arms already carry them" with the principle plus the enumeration: "**Sharing a reader is not sharing an arm**, so the four remaining fields are named rather than folded into another field's", then names `phase`, `failure-mode-id`, `action` and `symptom` with an outcome each — and the one I said was unstateable from the table now has its statement: `failure-mode-id` ⇒ "§8.3 emits **no** row — a row cannot be keyed on an absent id". §14.5 gained **LD-5** (`:2239`) carrying all four with a defective-implementation column, and E-12b (`:2590`) absorbed the same four. This is the repair I described, generalised: the principle is stated before the list, so a ninth field would inherit it |
| L-02 | Low | **Resolved, one token, in the sentence it belonged to** | `:1276` now reads "the rows named here are the **three classes** §13's rows fall into on this axis", and the enumeration was re-punctuated into three parallel arms ("either … , or … , or places a `revise` or `retire` beside an earlier `promote` … **across passes**"). Count and list agree |
| Q-01 | — | **Answered, and answered by building the second register rather than by one clause** | §14.1 gained **T-10** (`:2160`) collecting the TSPEC-owned spellings, and §14.5's lead (`:2225-2231`) states the scoping as deliberate with the boundary named — "deferrals of a *literal* to the layer that pins literals, not of a fixture to the layer that writes fixtures". That is more than I asked for and is the right shape. It is also where my one new Medium lands: the two registers now overlap on two arms and miss the one literal the revision actually introduced (M-01 below) |
| Q-02 | — | **Answered, and the answer is the one that keeps AT-F21 honest** | AT-F21's Given (`:2113`) now pins `phase`, `failure-mode-id` and `symptom` present on all three records alongside `passId`, and names the choice: "this fixture stays at two arms rather than growing a fourth short record, so the `phase` arm's one home is §8.1's reader table for the rule and §14.5 LD-5 for the fixture, never both here and there." The fixture is not stretched, the arm is not double-claimed, and BR-33a's coverage cell stays true |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
