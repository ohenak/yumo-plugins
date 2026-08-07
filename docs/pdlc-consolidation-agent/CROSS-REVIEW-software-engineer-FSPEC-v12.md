# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v11.2)
**Date:** 2026-08-06
**Iteration:** 12
**Scope:** Local unless tagged otherwise

**Protocol:** delta re-review. Baseline `8c970a7` (the commit my v11 pinned as `REVIEWED-COMMIT`);
diff `8c970a7..HEAD` on the FSPEC is **one commit** — `767b6b5` "docs(fspec): v11.2 — narrow §14.5
phase-arm ownership, complete E-12b phase readers" — 3 changed hunks, both v11 repairs plus the
version bump. Only the changed text was re-read for new issues.

**Governing decisions re-read before scoring:** `docs/_decisions/DECISIONS-review-severity-bars.md`
DEC-SEV-02 (a falsified bookkeeping-completeness assertion, where no observable, rule, arm or
downstream artefact is wrong and the repair is deletion or narrowing, is **Low**) and
`docs/_decisions/DECISIONS-review-convergence.md` DEC-CONV-01 (approval carry-forward). Both of this
round's findings are of DEC-SEV-02's class and are scored **Low** under it.

## Prior findings — disposition

Both v11 findings are **closed, verbatim as proposed**, and both v11 questions are moot or answered.

| v11 | Verdict | Evidence |
|---|---|---|
| F-01 (Low) — §14.5's ownership sentence claimed the `phase` arm renders no unavailable literal, two lines after handing §8.4 steps 2–3's unavailable-**half** rendering to T-10, which covers the `phase` half | **Resolved with the exact qualifier proposed.** `:2232-2237` now reads "**§8.3's `phase` arm and §8.1's `failure-mode-id` arm are this table's alone**", and the revision records *why* it narrowed, in-line: "narrowed per SE v11 F-01, which observed that §8.4 steps 2–3's `phase` half *does* render an unavailable literal and is collected by T-10 with the `artifact` and `symptom` halves of the same arm". The justification that follows is unchanged and is now true as written of exactly those two arms — §8.3's `phase` arm carries the pinned §15.2 verdict `insufficient-evidence` (§8.3's row, `:1184`: "its **verdict falls to `insufficient-evidence`**, never to a guessed `prevented`"), and §8.1's `failure-mode-id` arm emits no row (`:1184`: "the record contributes **no** row"). Nothing was added in exchange — one noun phrase narrowed, one attribution added |
| F-02 (Low) — E-12b's field→reader parenthetical mapped `phase` to §8.3 alone, while §8.1's table gives it two readers | **Resolved verbatim.** `:2596` now carries "`phase` for §8.3 / §8.4's harvest question". I re-checked both readers at HEAD: §8.1's §8.4 steps 2–3 row indexes "`symptom`, the subject `artifact` and `phase` — the three the question is composed of" (`:1182`), and §8.3's row indexes "**`phase`**, which the `prevented` test is a function of" (`:1184`). The parenthetical's eight entries now each name every reader §8.1's table gives that field, and the surviving "all eight of §8.1's fields" claim is still true — I re-counted against `:1176-1185` |
| Q-01 — §8.1's skip-rule parenthetical is not wrong but its subject and its trailing clause are one step apart | **Moot; declined, which I said was a legitimate answer.** `:1157-1159` is untouched by `767b6b5`. Under the round-11–15 register freeze, declining a stylistic tightening is the right call and I do not re-raise it |
| Q-02 — is the `phase` half of §8.4 steps 2–3's rendering meant to be T-10's, with §14.5 reaching for "the `phase` arm" when it meant "§8.3's `phase` arm"? | **Answered yes, in the document itself.** The narrowing at `:2234-2236` states the affirmative half explicitly — steps 2–3's `phase` half "*does* render an unavailable literal and is collected by T-10 with the `artifact` and `symptom` halves of the same arm" — so the reading is now pinned in text rather than inferred |

## Findings

Both findings are the **unlanded siblings of the two repairs this round made**: the repaired
sentence at §14.5 has a near-verbatim mirror in T-10 that was not narrowed with it, and the repaired
E-12b parenthetical has a sibling enumeration in BR-33a that was not completed with it. Both are of
DEC-SEV-02's exact class — a bookkeeping/ownership line falsified while no observable, rule, arm or
downstream artefact is wrong — and both repair by narrowing or completing the line. **No High or
Medium finding is open.**

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **T-10 still carries the un-narrowed mirror of the sentence §14.5 narrowed this round.** `:2162` says "**§8.1's `phase` and `failure-mode-id` arms are deliberately not here** (SE v10 F-01, TE v10 M-01): neither produces a rendering for TSPEC to spell" — the same over-broad subject §14.5 has just replaced with "§8.3's `phase` arm". It is falsified by T-10's *own first clause*, two sentences earlier in the same cell: T-10 collects "from §8.1's **§8.4 steps 2–3** reader row, the **unavailable-half rendering** — the question is still put to the harvest agent on the fields the record does carry, with the missing half stated as unavailable rather than guessed". Per §8.1 `:1182` the fields that half ranges over are `symptom`, `artifact` and **`phase`**, so a `phase`-short record's rendering *is* here, collected field-agnostically by the first clause — and the revision now says so out loud at `:2235-2236`. The two supports T-10 offers for the exclusion are both §8.3-specific and both still true (`:1184`'s `insufficient-evidence` verdict; `:1837-1839` fixing what that row renders), so the cell's *reasoning* is sound; only the subject is one register too wide. **Nothing downstream is left unstated** — the first clause states the obligation without qualifying which field is missing, so a TSPEC author discharges the `phase` half correctly — which is why this is Low and not a reopening. Repair, the same one qualifier that landed at §14.5: "**§8.3's `phase` arm and §8.1's `failure-mode-id` arm are deliberately not here**". This narrows an assertion and adds nothing, consistent with the register freeze. | §14.1 T-10 `:2162`; §14.5 `:2232-2237`; §8.1 `:1182`, `:1184` |
| F-02 | Low | Local | **BR-33a's per-field enumeration is the sibling of the E-12b cell repaired this round, and under-names `phase`'s readers in the same way E-12b did.** `:2541`'s AT cell states it "enumerates by **set-equality over §8.1's reader table**" and then names, per field, the readers and arms: `failure-mode-id` gets three ("§8.3 emits **no** row … §8.4 step 1's open list takes no member from the record, and §8.4 steps 2–3 ask no question"), `action` gets two ("§6.4's predicate is undecidable … §8.4 step 1 leaves the id open"), `symptom` gets its one ("§8.4's harvest question is still asked on the fields present") — and **`phase` gets only "(§8.3 emits the row and the verdict falls to `insufficient-evidence`)"**, though §8.1's table gives it a second reader whose arm is materially different (`:1182`: the promotion is still put to the harvest agent with the missing half stated unavailable). The cell's own principle — "**Sharing a reader is not sharing an arm**, so the four remaining fields are named rather than folded into another field's" — is exactly the principle a per-field enumeration that stops at one of two readers violates. This is one field, one reader, in the one register the round's E-12b repair did not reach; it is the recurring failure mode this document has hit before (a widening that lands in one register and not its siblings), and it is Low because §8.1's reader table is the normative statement and is complete, BR-33a's AT cell claims no fixture for the `phase` arm either way ("no fixture at this layer … PROPERTIES-owned per DEC-LAYER-01 (§14.5 LD-5)"), and no AT, arm or observable changes. Repair: extend the `phase` parenthetical to "(§8.3 emits the row and the verdict falls to `insufficient-evidence`; §8.4 steps 2–3's question is still asked with the `phase` half stated unavailable)". | BR-33a `:2541`; E-12b `:2596`; §8.1 `:1182`, `:1184` |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Offered so it can be answered in one line rather than edited. If F-01 and F-02 are taken, that is three registers stating the `phase` field's two arms (§14.5 `:2232`, T-10 `:2162`, BR-33a `:2541`) plus E-12b `:2596` and LD-5 `:2245`. LD-5's own cell describes `phase` as "(§8.3 emits the row, verdict `insufficient-evidence`)", which under the *narrowed* §14.5 is now exactly right — LD-5 owns §8.3's `phase` arm only, and the steps 2–3 half is T-10's. I read LD-5 as already correct and am **not** filing against it; confirm you read it the same way, because if instead LD-5 is meant to own both `phase` halves then it is F-01's repair that is wrong and not T-10's sentence. Every other cell I can check points at the first reading. |
| Q-02 | Process-flavoured, no edit requested. Both of this round's findings exist because a two-cell repair landed in two of the four cells that state the same fact. The document already knows this shape — v11's positive observations named "three registers widened to the same arity in one pass" as the thing that went *right*. Would it be worth §14's preamble carrying a one-line pointer listing the cells that co-state §8.1's reader arms (T-10, §14.5's scope paragraph, LD-1/LD-5, BR-33a, E-12b), purely as an edit checklist for the next author? I am not proposing it as a rule or a register — under the freeze that would be an addition — only asking whether it belongs in the eventual LEARNINGS instead. |

## Positive Observations

- **Both repairs landed verbatim, and the narrowing records its own provenance.** `:2234-2236`
  does not merely narrow the subject; it states the counter-example that forced the narrowing —
  "§8.4 steps 2–3's `phase` half *does* render an unavailable literal and is collected by T-10 with
  the `artifact` and `symptom` halves of the same arm". A future reader who wonders why the sentence
  says "§8.3's `phase` arm" rather than "the `phase` arm" has the answer in the same sentence, which
  is what stops a later author from "simplifying" it back.
- **The diff is minimal and additive-free.** One commit, three hunks: a version bump, one noun
  phrase narrowed with its justification, one reader added to a parenthetical. No new rule, BR, AT,
  register row or arm — the round-11–15 register freeze held exactly. This is the second consecutive
  round whose entire delta is narrowing or completing existing bookkeeping.
- **E-12b's parenthetical is now genuinely total.** I checked all eight entries against §8.1's
  reader table `:1176-1185` field by field: `route` (§6.4, §8.4 step 1 — `:1180`, `:1181`), `target`
  (§5.1, §8.6 — `:1178`, `:1179`), `action` (§6.4, §8.4 step 1), `artifact` (§8.3, §8.5, §8.4's
  question — `:1184`, `:1185`, `:1182`), `passId` (§6.4's evidence spelling — `:1180`), `phase`
  (§8.3, §8.4's question), `failure-mode-id` (§8.3, §8.4 step 1, §8.4's question), `symptom` (§8.4's
  question). Eight fields, every reader named, and no reader named that §8.1 does not carry — the
  set-equality runs in both directions.
- **The version number keeps telling the truth.** `11.2` for a pass that narrows one sentence and
  completes one list, after `11.1` for a deletion-only pass and `11.0` for the last contract change.
  Three rounds of honest semver on a document nobody is forcing to carry one.
- **Citation health, eighth consecutive round.** Every anchor the changed text leans on resolves at
  HEAD: §8.1's reader rows (`:1182`, `:1184`), T-10 (`:2162`), LD-5 (`:2245`), BR-33a (`:2541`).
  The external citation §14.4 ER-5 rests on — `docs/_constraints/pdlc-consolidation-vocabularies.md:63`,
  still `` `{id}:{action} → PR URL` entries, or empty `` — is unchanged by this diff and remains
  correctly open. No citation added this round is stale.

## Recommendation

**Approved with minor changes**

Both v11 findings are closed verbatim and both v11 questions are resolved — the eleventh
consecutive round in which every prior item was addressed rather than argued with. **No High
finding remains, and none has since v3. No Medium finding is open, for the second consecutive
round.**

Two **Low** findings are open, both of DEC-SEV-02's class, and both are the *unlanded sibling* of a
repair this round did make:

1. **F-01 — T-10 (`:2162`) still says "§8.1's `phase` and `failure-mode-id` arms are deliberately
   not here", the sentence §14.5 narrowed this round.** Its own first clause collects §8.4 steps
   2–3's unavailable-half rendering, which covers the `phase` half. Same one-qualifier repair:
   "**§8.3's** `phase` arm and §8.1's `failure-mode-id` arm are deliberately not here".
2. **F-02 — BR-33a (`:2541`) names `phase`'s readers as §8.3 alone**, while naming every reader for
   the other three fields, under a cell that claims set-equality over §8.1's reader table. Repair:
   add "; §8.4 steps 2–3's question is still asked with the `phase` half stated unavailable".

Neither touches an arm, a rule, an observable, an AT or a fixture; both narrow or complete a
bookkeeping line, which is what the freeze asks for. Under the approval rule — Low findings only ⇒
Approved with minor changes — this iteration **approves**
`FSPEC-pdlc-consolidation-agent.md` at version 11.2. Per DEC-CONV-01 this approval **stands into
later rounds** of Phase F and is re-opened only by me, and only if the intervening diff touches the
sections this Scope names or I file something Medium-or-higher against it. I do **not** require
either Low repair before the phase advances; making them costs one edit each and re-opens nothing.

**No erratum is emitted with this review.** The only upstream defect in scope remains the
`suppressed-by:` value grammar at `docs/_constraints/pdlc-consolidation-vocabularies.md:63`, already
routed as §14.4 ER-5 and unchanged by this diff.

## Verdict

Two Low findings (F-01, F-02) are open, both bookkeeping siblings of repairs this round landed;
**no High and no Medium finding remains**. Per the approval rule — Low findings only ⇒ Approved
with minor changes — this iteration **approves**
`FSPEC-pdlc-consolidation-agent.md` at version 11.2, and per DEC-CONV-01 the approval carries
forward into subsequent rounds of Phase F.

VERDICT: Approved with minor changes
