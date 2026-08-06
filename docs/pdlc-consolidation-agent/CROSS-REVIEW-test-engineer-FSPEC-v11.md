# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v11.1)
**Date:** 2026-08-06
**Iteration:** 11
**Scope:** Testing lens only, delta re-review. Baseline for the diff is `82a39bb` — the commit v10 was
written against; the revision is ten commits, `ee742a3`…`4fbb696` (nine authoring commits plus the
freeze-mandated v11.1 deletions). Standing decisions applied: `DEC-LAYER-01`
(`docs/_decisions/DECISIONS-spec-layer-boundary.md`), `DEC-SEV-02`
(`docs/_decisions/DECISIONS-review-severity-bars.md:40-54`) and `DEC-CONV-01`
(`docs/_decisions/DECISIONS-review-convergence.md`) — all three confirmed present at HEAD.

## Prior findings — disposition

All three v10 findings are **resolved**, and both v10 questions were answered by construction rather
than by reply. Each was checked against the revised text at HEAD and, where it made a claim about
another section or about this repository, against the cited target.

| v10 ID | Sev | Disposition | Evidence in v11.1 |
|----|---|---|---|
| M-01 | Medium | **Resolved, and then over-resolved in the safe direction by the v11.1 deletions** | The repair I named in two clauses was taken in both registers, and then the universal that made the mis-assignment falsifiable was deleted rather than re-stated. (a) **T-10 (`:2161`) no longer claims the `phase` and id arms.** It now registers, in their place, exactly the literal I said was in neither register: "from §8.1's **§8.4 steps 2–3** reader row, the **unavailable-half rendering** — the question is still put to the harvest agent on the fields the record does carry, with the missing half stated as unavailable rather than guessed". And it states *why* the two arms are not literals, in the terms of the harm: "A `phase`-short record's §8.3 row carries the verdict `insufficient-evidence` — a **§15.2 lexicon value this document pins**, and §10.4 item 5 fixes what that row renders — so treating it as an unavailable literal would take the row out of §8.7's `insufficient-evidence` streak and make `unmeasurable` unreachable on that path; an id-short record emits **no** row at all, so there is nothing to render." That is my own M-01 reasoning transcribed into the register, which is the right place for it: the next TSPEC author reads the reason, not just the omission. (b) **§14.5's lead (`:2227-2235`) was corrected on the same two arms** and now says so explicitly — "**The `phase` and `failure-mode-id` arms are this table's alone** (LD-5), not both registers'". (c) The `LD-5` row was left correct and untouched on those two arms, as I asked. (d) The **"Between the two registers, every deferral this document makes has exactly one home"** sentence — the universal my finding falsified — was **deleted entire** in `4fbb696` (v11.1), together with T-10's "the two sets are disjoint", BR-33a's "so every arm has exactly one home", and E-12b's "per that table's cell-level set-equality" invocation. I checked what that deletion costs a test author, since deleting an assertion is the one repair shape that can lose an oracle: it costs nothing here. The **load-bearing** set-equalities all survive — §8.1's reader-table cell-level rule (`:1166-1172`, "The set-equality is over the table's cells, not only its rows … A reader that indexes an unlisted field, and a field indexed by a reader whose row omits it, are the same defect"), §14.5's own "This register is **set-equal** to the deferrals this document names" (`:2225-2227`), BR-33a's "The AT cell enumerates by **set-equality over §8.1's reader table**" (`:2539`), and every AT-level set-equality (AT-F19 `:2113`, AT-F20 `:2114`, AT-F21 `:2115`). What was deleted was a *theorem about two registers*, not a rule any artefact must honour — precisely the class `DEC-SEV-02` directs to be deleted rather than repaired |
| L-01 | Low | **Resolved in the durable form, at all three of its sites** | LD-1 (`:2239`) is no longer scoped by two readers: it now reads "**three readers, three distinct arms**, per BR-33a's 'sharing a reader is not sharing an arm'", names §8.4 steps 2–3's arm with its own observable ("still put the promotion to the harvest agent … with the `artifact` half stated as unavailable rather than guessed"), and its defect column gained the matching third defect with the harm named ("drops the promotion from §8.4's question list (which makes `recurred` unreachable for that id and drifts it to `unmeasurable` via §8.7)"). BR-33a (`:2539`) and E-12b (`:2591`) were both reconciled to "the **three** `artifact` arms". Three sites, one arm, one spelling |
| L-02 | Low | **Resolved by the same split §8.3's row had, plus a back-pointer step 1 did not have** | §8.4 step 1's cell (`:1181`) is now two arms: short of `action` or `route` "the id stays **open**"; short of `failure-mode-id` "'open' is unstateable, because the list is a set of ids and the record carries none — the record **contributes no member to the list at all** and the parse notice is the whole report, never a minted or re-slugged id (BR-35b)". It then makes the same AT-F19 reconciliation §8.3's row makes for AT-F19's sibling obligation — "the assertion there ranges over the ids the log carries, and an id-less record contributes none" — which is what stops a PROPERTIES author writing a set-equality the correct implementation fails. LD-5's `Observable stated at` now anchors **§8.4 step 1** (`:2243`), and §8.4's step-1 row itself gained the back-pointer step 2 already had (`:1433`, cited by section rather than by line number per `04e172e`). `BR-35b` exists at `:2545` and says what the cell cites it for |
| Q-01 | — | **Answered by spending the clause** | The skip rule (`:1157-1159`) now reads "§8.4 still asks its question on the fields present **where the id is present** (short of `failure-mode-id` the two §8.4 cells are normative and no question is asked — TE v10 Q-01)". The general sentence and the cells no longer disagree on first read, and the precedence rule two lines later is still there as the backstop |
| Q-02 | — | **Answered by totalising the column** | LD-5's defective-implementation column (`:2243`) now carries a defect for all four arms, not two: it gained "**or reads an `action`-short pair as `enacted`** (§6.4's predicate treated as decidable), so the promotion is suppressed rather than re-proposed" and "**or drops a `symptom`-short promotion from §8.4's question list** rather than asking on the fields present". Both are the inversions I derived, and both are now transcribable into a falsifying assertion without the PROPERTIES author inventing the failure direction. It also gained the id-less list defect ("counts an id-less record as a member of §8.4 step 1's list") that L-02's repair created the need for |

## Findings

One finding, new, inside text this revision introduced. No unchanged section was re-litigated. It is
**Low**, and it is Low on the merits and not only on `DEC-SEV-02`: the rule it concerns is stated
normatively one table away, the observable is unambiguous, and the repair is four words in an index
cell. No High and no Medium.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| L-01 | Low | Local | **E-12b's rewritten field→reader index omits one reader of `phase`, against §8.1's cell-level set-equality rule.** This revision rewrote E-12b's Given (`:2591`) into a full eight-field index — "`route` for §6.4 / §8.4 step 1, `target` for §5.1 / §8.6, `action` for §6.4 / §8.4 step 1, `artifact` for §8.3 / §8.5 and for §8.4's harvest question, `passId` for §6.4's evidence spelling, **`phase` for §8.3**, `failure-mode-id` for §8.3 / §8.4 step 1 / §8.4's harvest question, `symptom` for §8.4's harvest question — all eight of §8.1's fields". The *field* set is complete (that half of the claim holds). The **mapping** is not: §8.1's §8.4 steps 2–3 row (`:1182`) indexes "`symptom`, the subject `artifact` and **`phase`** — the three the question is composed of", so `phase` has **two** readers, and E-12b names one. §8.1's own rule makes this exactly a defect rather than a wording preference: "**The set-equality is over the table's cells, not only its rows** … A reader that indexes an unlisted field, and **a field indexed by a reader whose row omits it, are the same defect**" (`:1169-1172`). E-12b is not that table, but it is the error-catalogue row a TSPEC/PROPERTIES author reads to enumerate this error's arms, and the three sibling multi-reader fields (`route`, `action`, `artifact`, `failure-mode-id`) are all listed with every reader — so a reader transcribing E-12b builds a `phase` arm with one observable where the document states two (§8.3's row emitted at `insufficient-evidence`; §8.4 steps 2–3's question still asked with the `phase` half unavailable). Nothing is undecidable — both observables are stated, at `:1182` and `:1184`, and LD-1/LD-5 both carry the steps 2–3 arm — which is why this is Low and not a repeat of v10's M-01: no rule, arm or observable is wrong, and the repair adds no rule. **Repair, four words:** `phase` for §8.3 **and for §8.4's harvest question** | E-12b `:2591`; §8.1 `:1169-1172`, `:1182`, `:1184` |

## Questions

| ID | Question |
|----|---------|
| Q-01 | LD-5's `Observable stated at` column (`:2243`) now anchors three rows of §8.1's reader table (§8.3, §8.4 step 1, §8.4 steps 2–3) plus §8.3's totality rule — but the `action` arm's other observable lives in **§6.4** ("§6.4's predicate is undecidable, so that contract skips and the promotion is re-proposed"), and §6.4 is named only inside the obligation prose, not in the column that tells a PROPERTIES author where to read the observable. LD-4 does cite §6.4 in that column for its own arm, so the pattern exists one row up. Is the omission deliberate (the obligation text carries the pointer, and the column lists reader-table rows only), or is it a fourth anchor worth adding? I am not filing it — the pointer is present and unambiguous, and under the register freeze a column edit is the kind of change that manufactures the next round. |
| Q-02 | The v11.1 deletions removed four completeness universals. Three of them were about *registers* and cost a downstream author nothing (I verified each). The fourth — E-12b's "per that table's cell-level set-equality" — was a **pointer** to a surviving rule (`:1169-1172`), not a universal of its own, and its removal is what makes L-01 above a silent gap rather than a self-detecting one: with the pointer in place, an author transcribing E-12b's index is told which rule the index must satisfy. Would restoring that six-word pointer (not the universal, just the citation) sit inside the freeze, or is the freeze deliberately strict enough to exclude re-citations too? Either answer is fine by me; I am asking because the freeze's stated rule is "no new coverage universals; delete rather than repair", and a citation of an existing rule is arguably neither. |

## Positive Observations

- **The Medium was repaired at both registers *and* its generator was removed.** I asked for two
  clauses. The revision spent them, and then `4fbb696` deleted the universal that made the
  mis-assignment a falsifiable claim in the first place — the class `DEC-SEV-02` names. That is the
  right order of operations, and it matters for testing specifically: the arms were made correct
  *first* (`ee742a3`, `c8ab0cc`), so the deletion removed a bookkeeping theorem, not a symptom. A
  spec that deleted the universal while leaving `phase` in both registers would have been a worse
  document with a quieter review.
- **Every load-bearing set-equality survived the deletion pass.** This was the thing I checked
  hardest, because "delete the assertion" is the repair shape that can silently cost an oracle. It
  did not: §8.1's cell-level rule (`:1169-1172`), §14.5's register set-equality (`:2225-2227`),
  BR-33a's enumeration-by-set-equality (`:2539`), and the four AT-level set-equalities that a
  PROPERTIES author actually writes — AT-F19's `{B, C, D}` with the literal cardinality `3`
  (`:2113`), AT-F20's eight-name field set (`:2114`), AT-F21's `{E, F}` (`:2115`), AT-Q7c's
  two-sided containment (`:2072`) — are all intact and unedited. The deletions touched four
  sentences about registers and nothing an implementation must honour.
- **§8.4 step 1's new arm reconciles itself with the AT that would otherwise contradict it.** The
  cell (`:1181`) does not merely state "contributes no member"; it says why that is not a violation
  of the set-equality AT-F19 asserts — "the assertion there ranges over the ids the log carries, and
  an id-less record contributes none". This is the second time the document has made that
  reconciliation for the same field (§8.3's row `:1184` makes it for rows), and both times it stops
  a PROPERTIES author from writing a set-equality property that a *correct* implementation fails.
  That is the rare kind of spec sentence that prevents a false red rather than a false green.
- **LD-5's defect column is now total across its four arms**, so the register row is fully
  transcribable: every arm has a stated obligation and a stated defect, and the two `symptom` /
  `action` defects added this round are the exact inversions ("read an `action`-short pair as
  `enacted`", "drop a `symptom`-short promotion from the question list") — negative behaviours each
  paired with the positive the spec requires instead. LD-1 got the same treatment for its third
  arm. Every register row now reads as an oracle sketch rather than an obligation note.
- **The Q-01 clause was spent where the misreading was, not where the rule was.** The precedence
  sentence was already correct; the fix went into the *general* sentence a reader hits first
  (`:1157-1159`), which is where the cheap wrong reading lived. Fixing the sentence people read
  rather than the sentence that is right is the harder call and the correct one.
- **Grounding spot-checks all passed at HEAD.** `MERGE_GUARD_DEFAULTS` is at
  `pdlc/workflows/orchestrate-dev.js:48-53` with exactly the four members AT-R1 and AT-Q7 rely on;
  `docs/_decisions/DECISIONS-spec-layer-boundary.md`, `DECISIONS-review-convergence.md`
  (`DEC-CONV-01`) and `DECISIONS-review-severity-bars.md` (`DEC-SEV-01`, `DEC-SEV-02`) all exist;
  `docs/_constraints/pdlc-consolidation-vocabularies.md:7` is at `Version` 1.4, the version §8.3 and
  ER-4 bind to; `pdlc/skills/harvest-learnings/SKILL.md:70-78` is the harvest metadata table §8.3
  amends; `BR-35b` (`:2545`) and `O-C7` (`:2183`) both exist and say what the changed cells cite them
  for. No repo path this revision touched is misdescribed, and the changed text names no new one.

## Recommendation

**Approved with minor changes**

All three v10 findings are resolved and both v10 questions were answered by construction. The Medium
was resolved twice over — the two registers were corrected on the merits (`ee742a3`, `c8ab0cc`), and
then the falsified universal that produced the finding was deleted rather than re-stated (`4fbb696`,
v11.1), which is the repair `DEC-SEV-02` prescribes for exactly this class. Nothing in this revision
re-opens a settled decision, and nothing in it broke a section I had previously approved: I re-derived
the eight-reader / eight-field cell-level set-equality over §8.1's table, re-checked that every
surviving set-equality obligation is intact after the deletion pass (§8.1 `:1169-1172`, §14.5
`:2225-2227`, BR-33a `:2539`, AT-F19/F20/F21/Q7c), confirmed AT-F21 still covers exactly the two arms
BR-33a claims for it and grew no third short record, verified `BR-35b` and `O-C7` say what the new
cells cite them for, and re-checked every repo path the changed text names.

The one open item is **L-01**, a Low: E-12b's rewritten field→reader index maps `phase` to one reader
where §8.1's normative table gives it two. It is a Low rather than a Medium for the reason the
severity bar keys on — no rule, arm, observable or downstream artefact is wrong, both `phase`
observables are stated normatively at `:1182` and `:1184`, LD-1 and LD-5 both carry the steps 2–3
arm, and a test author can write both arms today from the reader table without asking anyone a
question. The repair is four words in an index cell and adds no rule, no BR, no AT and no register
entry, so it sits inside the freeze. It may equally be carried as a tracked deferral: it costs a
transcriber one extra lookup, not a decision.

Per `DEC-CONV-01`, this approval **stands** into subsequent rounds of Phase F. I will re-open it only
if a later diff touches a section this review's Scope named, or if I score something Medium-or-higher
against a later delta. Suggested disposition for the optimizer: take L-01 if a revision is being made
for another reason; do not open a revision solely for it.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
