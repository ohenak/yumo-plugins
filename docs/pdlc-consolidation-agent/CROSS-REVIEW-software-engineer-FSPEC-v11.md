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

Both findings are against text **added this round**, both are of DEC-SEV-02's exact class — a
bookkeeping/ownership assertion falsified while no observable, rule, arm or downstream artefact is
wrong — and both repair by narrowing or deleting the assertion. **No High or Medium finding is
open.**

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **§14.5's new ownership sentence contradicts the clause two lines above it about the `phase` arm.** `:2229-2234` first assigns to T-10 "§8.3's unavailable-path cell **and §8.1's §8.4 steps 2–3 unavailable-half rendering**", then says "**The `phase` and `failure-mode-id` arms are this table's alone** (LD-5), not both registers': neither renders an unavailable literal — the first carries the pinned §15.2 verdict `insufficient-evidence`, the second emits no row". The second sentence is true of **§8.3's** `phase` arm and false of §8.4 steps 2–3's: that row (`:1182`) indexes `phase` as one of the three fields its question is composed of, and its stated arm is that the promotion is "still put to the harvest agent … with the missing half stated as unavailable rather than guessed" — so a `phase`-short record *does* produce an unavailable rendering, and it is the very rendering the first clause has just handed to T-10. The `phase` arm is therefore in both registers, via steps 2–3, which is what the sentence denies. **Nothing downstream is left unstated**, which is why this is Low and not a reopening: T-10 states its obligation field-agnostically ("the missing half stated as unavailable"), so a TSPEC author reading T-10 discharges the phase half correctly whatever §14.5's prose says; and LD-5 still carries the fixture. What is wrong is only the ownership claim. Repair, one qualifier: "**§8.3's** `phase` arm and §8.1's `failure-mode-id` arm are this table's alone" — the justification that follows is already written for exactly those two ("the first carries the pinned §15.2 verdict", "the second emits no row") and becomes true as written. Consistent with the register freeze: this narrows an assertion, it adds nothing. | §14.5 `:2229-2234`; §14.1 T-10 `:2162`; §8.1 `:1182` |
| F-02 | Low | Local | **E-12b's field→reader parenthetical, repaired this round for `action`, still under-names the readers of `phase`.** `:2591` now lists all eight fields — the F-03 repair — but maps `phase` to "**for §8.3**" alone, while §8.1's reader table gives `phase` two readers: §8.3's effectiveness table (`:1184`) and §8.4 steps 2–3's harvest question (`:1182`, "`symptom`, the subject `artifact` and `phase` — the three the question is composed of"). Every other field in the parenthetical names all of its readers (`route` → §6.4 / §8.4 step 1; `action` → §6.4 / §8.4 step 1; `artifact` → §8.3 / §8.5 / §8.4's harvest question; `failure-mode-id` → §8.3 / §8.4 step 1 / §8.4's harvest question), so `phase` is the one row that stops short, and it stops short on the same reader the same round added everywhere else. The row's own tail already states the missing behaviour indirectly (the `phase` arm "likewise stated in that table … PROPERTIES-owned per §14.5 LD-5"), so this is a head/tail mismatch of the kind v10 F-03 was, one field over. Note that the surviving claim in this cell — "all eight of §8.1's fields" — is **true** and is not what this finding falsifies; the cell-level set-equality invocation that would have made it Medium was deleted in `4fbb696`, which is why this is Low even under the pre-DEC-SEV-02 bar. Repair: "`phase` for §8.3 / §8.4's harvest question". | E-12b `:2591`; §8.1 `:1182`, `:1184` |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Not a finding, and offered only so the author can decline it in one line. §8.1's skip-rule paragraph gained "and §8.4 still asks its question on the fields present **where the id is present** (short of `failure-mode-id` the two §8.4 cells are normative and no question is asked — TE v10 Q-01)" (`:1157-1159`). Both halves are true — the two cells *are* normative, and steps 2–3 *do* ask no question — but the trailing clause is a statement about steps 2–3 only, while the subject is "the two §8.4 cells", and step 1's id-short behaviour is contributing no member to a list rather than asking no question. It is not wrong and it points at the normative cells, which is why I filed nothing; if you want it airtight the parenthetical could read "…the two §8.4 cells are normative: step 1's list takes no member and steps 2–3 ask no question". Under the round-11–15 register freeze, ignoring this is a legitimate answer. |
| Q-02 | On F-01's repair only, to confirm I have the intended reading before an author spends an edit on it. Is the `phase` half of §8.4 steps 2–3's unavailable rendering meant to be T-10's (a literal TSPEC pins, alongside the `artifact` and `symptom` halves of the same arm), with §14.5's sentence simply reaching for "the `phase` arm" when it meant "§8.3's `phase` arm"? Every piece of the document I can check says yes: T-10 collects the half rendering without qualifying which field is missing, LD-1 already splits that one arm's `artifact` half into §14.5 while its `phase` and `symptom` halves sit in LD-5, and the justification §14.5 offers is written for §8.3's arm and §8.1's id arm specifically. The alternative — that the phase half of the steps 2–3 question is exempt from T-10 — would leave a rendering with no owner, which is the state T-10 exists to prevent, so I am not proposing it. |

## Positive Observations

- **The Medium was closed by deletion, not by a better universal.** The repair round
  (`ee742a3`, `c8ab0cc`) did what I asked and would have satisfied me; the operator's post-mortem
  found the repaired universal still falsifiable and removed it instead — four deletions in
  `4fbb696` (§14.5's "exactly one home" sentence, T-10's "the two sets are disjoint", BR-33a's "so
  every arm has exactly one home", E-12b's "per that table's cell-level set-equality"), with no new
  rule, BR, AT or register entry added in exchange. That is the right direction: a register that
  lists its entries needs no theorem about the list, and every one of the last five rounds' Mediums
  was manufactured by exactly those theorems. Both of this round's findings are Low precisely
  because the assertions that would have made them Medium are gone.
- **T-10's exclusion is argued from a consequence, not asserted.** `:2162` does not merely say the
  `phase` arm is out of scope; it says why treating it as an unavailable literal would be
  *harmful* — the §8.3 row carries `insufficient-evidence`, a §15.2 lexicon value the document
  pins, so spelling it as unavailable "would take the row out of §8.7's `insufficient-evidence`
  streak and make `unmeasurable` unreachable on that path". I checked both supports at HEAD: §10.4
  item 5 fixes what that row renders (`:1837-1839`), §8.7 and its `unmeasurablePasses` threshold
  exist (`:1545`, `:1898`), and BR-43 (`:2560`) confirms the per-promotion verdict is an
  enumerated-class value §15.2 owns. An exclusion whose violation has a named downstream cost is
  one a TSPEC author cannot discharge by accident.
- **§8.4 step 1's new arm reuses §8.3's reconciliation instead of inventing one.** `:1181` reaches
  the same shape for the same field: an id-less record contributes no member, and that is not a
  silent drop "in AT-F19's set-equality sense: the assertion there ranges over the ids the log
  carries". I verified AT-F19 (`:2113`) — its expected list is the literal `{B, C, D}` over ids its
  fixture's log actually carries, and it asserts set-equality in both directions plus the literal
  cardinality `3` in the report body, so the reconciliation is sound rather than convenient. Two
  sections now derive the same exception from one rule, which is the third round running that a
  new arm has been traced to an existing one.
- **Three registers were widened to the same arity in one pass.** The §8.4 steps 2–3 `artifact` arm
  landed simultaneously in LD-1 ("**three readers, three distinct arms**"), BR-33a ("the **three**
  `artifact` arms") and E-12b ("three readers, three arms, per BR-33a") — I checked all three cells
  name the same three readers in the same order. The failure mode this document keeps hitting is a
  widening that lands in one register and not its siblings; this round it landed in all of them,
  and F-02 is what is left over: one field, one reader, in one of the three.
- **LD-5's defect column became a real oracle.** It previously described only the `phase` and id
  failures; it now pairs each arm with the specific wrong behaviour — "**or reads an `action`-short
  pair as `enacted`** (§6.4's predicate treated as decidable), so the promotion is suppressed rather
  than re-proposed; **or drops a `symptom`-short promotion from §8.4's question list** rather than
  asking on the fields present". Each negative is stated beside the positive that must happen
  instead, which is the form a PROPERTIES author can transcribe without inventing the other half.
- **Citation health, seventh consecutive round.** Every anchor added this round resolves at HEAD:
  BR-35b (`:2545`), O-C7 (`:2183`), AT-F19 (`:2113`), §8.7 (`:1545`), §10.4 item 5 (`:1837`),
  BR-43 (`:2560`). The one external citation the changed text still leans on is unchanged and
  re-verified verbatim: `docs/_constraints/pdlc-consolidation-vocabularies.md:63` still reads
  `` `{id}:{action} → PR URL` entries, or empty ``, so §14.4 ER-5 remains correctly open. No
  line-number or file citation added this round is stale.
- **The version number tells the truth about what happened.** `11.0` for the round that changed
  contracts (an arm added to §8.4 step 1, two registers re-assigned owners, three cells widened to
  three `artifact` arms), then `11.1` for the deletion-only pass. A patch bump that removes four
  sentences and adds nothing is exactly what a patch bump should mean.

## Recommendation

**Approved with minor changes**

All three v10 findings are closed and both v10 questions are answered — the tenth consecutive round
in which every prior item was addressed rather than argued with. **No High finding remains, and none
has since v3. No Medium finding is open for the first time in this phase's second window.**

Two **Low** findings are open, both against text added this round and both of DEC-SEV-02's class:

1. **F-01 — §14.5's ownership sentence (`:2233-2234`) says the `phase` arm renders no unavailable
   literal, two lines after handing §8.4 steps 2–3's unavailable-half rendering to T-10.** That
   rendering covers the `phase` half. One qualifier fixes it: "**§8.3's** `phase` arm and §8.1's
   `failure-mode-id` arm are this table's alone" — the justification already written is true of
   exactly those two.
2. **F-02 — E-12b's parenthetical (`:2591`) maps `phase` to §8.3 alone**, while §8.1's table gives
   it two readers (`:1182`, `:1184`). Every other field in that list names all of its readers.
   Repair: "`phase` for §8.3 / §8.4's harvest question".

Neither touches an arm, a rule, an observable, an AT or a fixture; both narrow or complete a
bookkeeping line, which is what the round-11–15 register freeze asks for. Under the approval
rule — Low findings only ⇒ Approved with minor changes — this iteration **approves**
`FSPEC-pdlc-consolidation-agent.md` at version 11.1. Per DEC-CONV-01 this approval **stands into
later rounds** of Phase F and is re-opened only by me, and only if the intervening diff touches the
sections this Scope names or I file something Medium-or-higher against it. I do not require the two
Low repairs before the phase advances; they are worth making, and making them does not re-open
anything.

Everything the last two rounds changed in the contract I would keep verbatim: §8.4 step 1's
member-type arm and its AT-F19 reconciliation, the three-`artifact`-arm widening landed in all three
registers at once, T-10's consequence-argued exclusion, LD-5's paired defect column, and — above
all — the four deletions, which removed the generator of four of this window's last five Mediums
without weakening a single oracle.

**No erratum is emitted with this review.** The only upstream defect in scope remains the
`suppressed-by:` value grammar at `docs/_constraints/pdlc-consolidation-vocabularies.md:63`, already
routed as §14.4 ER-5 and re-verified verbatim at HEAD this round.

## Verdict

Two Low findings (F-01, F-02) are open, both against text added this round; **no High and no Medium
finding remains**. Per the approval rule — Low findings only ⇒ Approved with minor changes — this
iteration **approves** `FSPEC-pdlc-consolidation-agent.md` at version 11.1, and per DEC-CONV-01 the
approval carries forward into subsequent rounds of Phase F.

VERDICT: Approved with minor changes
