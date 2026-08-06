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

All three findings below are against text **added this round**. Nothing unchanged since v9 is
re-litigated. One is Medium, and it is Medium for the same reason v9 F-01 was: this round added a
normative universal about where deferrals live, and the universal is falsified by the two registers
it ranges over.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | **Medium** | Local | **The new two-register disjointness claim names an arm that does not exist in the register it assigns it to, and it assigns a spelling to an arm that produces no output.** §14.5's new scoping paragraph (`:2225-2231`) says: "the *spellings* this document defers to TSPEC under the same `DEC-LAYER-01` — §8.3's unavailable-path cell and **§8.1's unavailable-`phase`/id arms**, §10.3's `suppressed-by:` unavailable rendering, §6.4's — and §6.5's seam permitted-set widening are **§14.1's, collected there as T-10**, not this table's … Between the two registers, every deferral this document makes has exactly one home." Two things are wrong with the `/id` half. **(a) T-10 does not carry it.** T-10 (`:2160`) collects exactly four: "§8.3's unavailable **path** cell and, from §8.1's reader row, its unavailable **`phase`** rendering; §10.3's `suppressed-by:` unavailable-`passId` rendering … and §6.4's statement of the same; and §6.5's seam permitted-set widening". There is no id row, no id clause. So §14.5 sends a TSPEC author to T-10 for an obligation T-10 does not state, and the "exactly one home" sentence in the same paragraph is false in the direction that matters: the id arm has **zero** homes as a spelling and one as a fixture (LD-5, `:2239`). **(b) There is no unavailable-id rendering to spell.** §8.1's id arm is the one arm in the table that emits nothing: "the record contributes **no** row and the parse notice is the whole report" (`:1182`), and §8.4 steps 2–3 "asks no question for it" (`:1180`) — I grepped every `unavailable` site in the document (41 hits) and none of them is an id. So the paragraph obliges TSPEC to pin a literal for an output the document elsewhere says is not produced, and a TSPEC author who discharges it as written renders an unavailable-id cell into the §8.3 row that §8.1 says must not exist — the same class of harm as a guessed path, arriving from the register rather than from the implementation. This is not a fixture question DEC-LAYER-01 defers (`docs/_decisions/DECISIONS-spec-layer-boundary.md:31-33` scopes the deferral to the *literal* of a stated observable; there is no stated observable here). Repair, and it is one word plus one anchor: (i) drop `/id` from `:2227`, leaving `§8.1's unavailable-`phase` arm`; and (ii) while there — the `phase` rendering T-10 does collect is §8.4 steps 2–3's ("with the missing half stated as unavailable", `:1180`), **not** §8.3's, whose `phase` arm renders nothing and moves the verdict instead (`:1182`); T-10's "from §8.1's reader row, **its** unavailable `phase` rendering" reads as §8.3's by proximity to the clause before it, so name the row. Both are edits to the registers, not to the arms — the arms themselves are correct as filed. | §14.5 `:2225-2231`; §14.1 T-10 `:2160`; §14.5 LD-5 `:2239`; §8.1 `:1180`, `:1182` |
| F-02 | Low | Local | **Two cells of the reader table now disagree about §8.4 step 1, under a rule this round made normative.** `:1155-1159` adds "**Where a cell states an arm, the cell is normative and this rule is its default, not its override**". §8.4 step 1's cell states one arm across all three of its fields — "the id stays **open**" (`:1179`) — which is unstateable for a record short of `failure-mode-id`: there is no id to keep open. The new steps 2–3 row then asserts step 1's behaviour on that field from outside step 1's own cell: "step 1 has already left the record out of the open list" (`:1180`). Under the new normativity rule the step 1 cell wins and says the opposite of the row that cites it. LD-5 (`:2239`) and BR-33a (`:2535`) are silent on the list for this field, so the row at `:1180` is the only statement of it. The behaviour is not actually undecidable — an id-less record can contribute no id to a list of ids — which is why this is Low and not a reopening of F-01. Repair: one clause in step 1's cell, e.g. "short of `failure-mode-id`: the record contributes no id to the list at all; the notice is the report", which also makes step 1's cell three arms like §8.3's and §8.4 steps 2–3's, rather than one arm covering three fields. | §8.1 `:1155-1159`, `:1179`, `:1180` |
| F-03 | Low | Local | **E-12b's field→reader enumeration, widened this round, omits `action`.** `:2590`'s Condition cell now reads "(a truncated or legacy record — `route` for §6.4 / §8.4 step 1, `target` for §5.1 / §8.6, `artifact` for §8.3 / §8.5 and for §8.4's harvest question, `passId` for §6.4's evidence spelling, `phase` and `failure-mode-id` for §8.3, `symptom` for §8.4's harvest question)" — seven of §8.1's eight fields, with `action` (indexed by §6.4 and §8.4 step 1) missing, while the same row's AT cell names "The `phase`, `failure-mode-id`, **`action`** and `symptom` arms". The row contradicts itself by one field, and the head list is the half a downstream author reads to enumerate the edge case. This document holds its own enumerations to set-equality (`:1160-1163`, AT-F19, AT-F20), and by that standard a missing member is a defect even when the tail repairs it. Repair: add "`action` for §6.4 / §8.4 step 1" to the parenthetical. | E-12b `:2590` |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Direct input to F-01. Is the intended reading of §14.5's paragraph "the *spelling* of every observable this document states as **unavailable** is T-10's", with the id arm simply swept in by a list written faster than it was checked? If so the repair is the one-word one in the finding. The alternative reading — that an id-less record's §8.3 output is an unavailable-id *cell* whose literal TSPEC picks — contradicts `:1182` ("the record contributes **no** row") and would need §8.3's set-equality obligation ("ranges over the **distinct ids the log carries**") reopened, which I do not think is intended and would not recommend. |
| Q-02 | On F-02: is §8.4 step 1's cell deliberately one arm because its three fields are interchangeable for the open-list computation — miss any one and the id cannot be closed, so it stays open — with `failure-mode-id` the accidental exception the field's own semantics create? If that is the reasoning, stating it in the cell costs a clause and makes the row self-contained; leaving it implicit means the only statement of the id case lives in a different reader's row, which is the pattern §8.1's own "no reader is left to infer its own arm" sentence (`:1165-1166`) exists to prevent. |
| Q-03 | Not a finding, because §8.1's arm is decidable as written and I could not construct a case where it moves an outcome: the §8.4 steps 2–3 row says a record short of `symptom`, `artifact` or `phase` is "**still put to the harvest agent**, on the fields the record does carry, with the missing half stated as unavailable" (`:1180`). Since the question at step 2 is a conjunction of three clauses, is an agent answering a question with one clause rendered "unavailable" expected to answer **no** more often — and is that the intended direction, given §8.4 exists to keep `recurred` reachable? I read the arm as deliberately accepting a weaker question over no question (the row says so: dropping it "would make `recurred` unreachable"), and the observable is stated either way, so nothing is owed at this layer. Flagging it only so the PROPERTIES author writing LD-5's `symptom` row knows the arm's *value* is a judgment the FSPEC has not pinned and should not be asserted as one. |

## Positive Observations

- **The reader table absorbed a whole reader rather than qualifying the universal away.** I offered
  two directions for v9 F-01 and expected the cheaper one (scope the closure to pass-side predicate
  readers). What landed is the expensive one: the §8.4 harvest question is now a row in its own right
  (`:1180`), with the reason it is not step 1's stated in the cell — "Not the same reader as step 1
  and not the same fields, which is why it is its own row" — and both of its arms spelled. The
  document is now *more* closed than the claim it had to defend, and `symptom`, previously indexed by
  nothing, has an owner.
- **The `phase` arm was derived, not chosen.** `:1182` argues it from the epistemic state ("a record
  with no `phase` and a `phase` the §2 mapping cannot decide are the same epistemic state") and then
  points at the rule that already fixed the direction for the second case, so the arm "inherits it
  rather than adding a concept" — and §8.3's totality rule was amended to say the same thing from its
  own side (`:1396-1399`), so the two sections are consistent by construction rather than by
  coincidence. That is the third round running in which a new arm has been traced to an existing rule
  instead of asserted.
- **The one arm where "never dropped" genuinely cannot hold is the one arm that says so.** `:1182`'s
  `failure-mode-id` case does not paper over the tension with the row's own "the row is never
  dropped": "this is the one arm where 'never dropped' cannot apply, because a row cannot be keyed on
  an id the record does not carry … That is not a dropped row in §8.3's set-equality sense: the
  obligation there ranges over the **distinct ids the log carries**, and an id-less record contributes
  none." Naming the exception and reconciling it with the set-equality it appears to breach is the
  difference between a spec a reviewer can check and one a reviewer has to trust.
- **A new normativity rule was added at exactly the point the table grew arms.** `:1155-1159`: "Where
  a cell states an arm, the cell is normative and this rule is its default, not its override." With
  three rows now carrying multi-arm cells, the general skip rule and the per-cell arms would otherwise
  have been in an unstated precedence relation, and an implementer would have had to guess which wins.
  It also states the second exception class ("where dropping the reader's **output** would itself be
  read as a decision") rather than leaving §8.3's and §8.4's arms looking like ad-hoc carve-outs.
- **AT-F21 declares three more arms it does not exercise, and says why it declines to grow.** `:2118`:
  all of `phase`, `failure-mode-id` and `symptom` are now pinned present, "and their arms are
  deliberately not exercised here (TE v9 Q-02): this fixture stays at two arms rather than growing a
  fourth short record, so the `phase` arm's one home is §8.1's reader table for the rule and §14.5
  LD-5 for the fixture, never both here and there." A fixture that refuses scope creep *and* names
  where the refused scope went is the pattern that keeps AT cells from being cited for arms they never
  tested.
- **Citation health, sixth consecutive round.** Every citation added this round resolves at HEAD:
  `MERGE_GUARD_DEFAULTS` is still `pdlc/workflows/orchestrate-dev.js:48`, so AT-R6b fixture 3's
  guard-set path claim holds; vocabularies §1's `suppressed-by:` value grammar is still verbatim
  `` `{id}:{action} → PR URL` `` (`docs/_constraints/pdlc-consolidation-vocabularies.md:63`), so
  §14.4 ER-5 remains correctly open and BR-26's divergence note is accurate; DEC-LAYER-01's
  fixture-strength bullet and its review consequence
  (`docs/_decisions/DECISIONS-spec-layer-boundary.md:31-33`, `:35-39`) say what §14.5 and T-10 lean
  on, including the clause that keeps "fails to state the *observable*" blocking at this layer. No
  line-number citation added this round is stale.
- **The version bump is honest, again.** `10.0`, not `9.1`: a reader was added to a table the document
  calls set-equal, a cardinality that appears in three sentences moved, two business rules and an edge
  case grew arms, and a TSPEC register row was created. Contract changes, not an editorial pass.

## Recommendation

## Verdict
