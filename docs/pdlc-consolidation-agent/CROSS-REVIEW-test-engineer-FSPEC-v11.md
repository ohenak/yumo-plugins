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

## Questions

## Positive Observations

## Recommendation

## Verdict
