# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v9.0)
**Date:** 2026-08-06
**Iteration:** 9
**Scope:** Local unless tagged otherwise
**Protocol:** delta re-review. Baseline `f264860` (the last FSPEC commit before my v8 was written);
diff `f264860..HEAD` — 74 insertions, 21 deletions across 8 FSPEC commits (`4f32af4`, `612056e`,
`d112f96`, `2e5820f`, `3c6e2e7`, `2e1ea70`, `7937c17`, `84fdb30`). Only the changed sections were
re-read for new issues.

## Prior findings — disposition

Both v8 findings were re-checked against the revision and against HEAD. **Both are closed as filed**,
and all three v8 questions are answered — two by text, one by a new section that makes the question
moot.

| v8 | Verdict | Evidence |
|---|---|---|
| F-01 (Low) — §8.1's §6.4 reader cell cited §10.3 at `:1712` (the `rung:` row) for the `pass:{passId}` evidence that actually lives in the `suppressed-by:` row | **Resolved, and by the durable repair rather than the arithmetic one.** I asked for `:1712` → `:1717` and noted the better fix was to cite the row by field name. The row was rewritten wholesale (`:1168`) and the line number is simply gone: it now reads "§10.3's `suppressed-by:` row is normative for the two spellings". No line-number citation into §10.3 remains anywhere in §8.1, so this class of drift cannot recur from that direction. I re-checked the target: `:1748` is the `suppressed-by:` row and it does carry the `pass:{passId}` grammar |
| F-02 (Low, Process) — three explicitly PROPERTIES-owned deferrals, discoverable only by grep, no register | **Resolved past what I asked for.** §14.5 (`:2200-2219`) is a four-row register — LD-1 (the `artifact` arms), LD-2 (BR-33b's `target`-follows clause), LD-3 (the two-action-one-subject pass), LD-4 (§6.4's new `passId` arm) — with exactly the three columns the downstream author needs (what is owed, where the observable is stated, what a defective implementation does), plus a set-equality obligation on the table itself: "a deferral added later is a row added here, and a section that names one without a row is a defect of this table" (`:2206-2208`). I checked that obligation by grepping every `PROPERTIES-owned` site: `:1270` (LD-3), `:1341` (LD-2), `:2041` (LD-2), `:2098` (LD-4), `:2512` / `:2567` (LD-1, LD-4). Every one maps to a row, so the set-equality holds. Three of the five sites also gained back-anchors this round; the fourth did not, filed as F-02 below — a discoverability gap in the new register's own convention, not a breach of its set-equality |
| Q-01 — is §8.2's three-row list the enumeration of §13's *classes* on this axis, or a sample of rows? | **Answered in the text, and the third class I had to find by hand is now named.** `:1265-1270`: "the rows named here are the two **classes** §13's rows fall into on this axis, not a sample of rows", with AT-R6b and AT-Q7/AT-Q7c named as each class's representative — and the counterexample candidates I checked manually (AT-F9, AT-F10, AT-F18) are now named in the document with the reason they are not counterexamples: they place a `revise`/`retire` beside an earlier `promote` **across passes**, while the merge scoped here is intra-pass. That is the half-clause I asked for plus the audit I paid for last round, so the next reviewer does not pay it again |
| Q-02 — is the >2-candidate elided set in scope for the PROPERTIES row §8.2's third note opens? | **Answered by folding it into LD-2**, exactly as suggested. `:2214` carries it explicitly, cited to this review: "The >2-candidate case belongs to this row too (SE v8 Q-02) … a report that names one elided path and stops is the defect". One downstream owner for the whole tie-break surface, as asked |
| Q-03 — is the intended invariant set-equality on the table's **cells**, not only its rows? | **Answered: yes, and stated normatively** (`:1158-1162`). That answer is correct as an intent and is the right invariant to want. As written it is also falsified by two readers in this document — filed as F-01 below. The question is answered; the answer needs one more pass |

## Findings

Both findings below are against text **added this round**. Nothing unchanged since v8 is
re-litigated. One is Medium — the first since v6 — and it is Medium precisely because the claim it
falsifies is a normative universal this round introduced and BR-33a now leans on for its coverage
enumeration.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | **Medium** | Local | **The new cell-level set-equality claim is false against this document's own text, and the field it misses (`phase`) has no short-record arm anywhere.** `:1158-1162` states: "for every field in §8.1's eight, the readers that index it are exactly those whose `Fields it indexes` cell names it. A reader that indexes an unlisted field, and a field indexed by a reader whose row omits it, are the same defect." Two counterexamples, one of them inside the table itself. **(a) §8.3 indexes `phase`.** Its `prevented` rule is "no consumed LEARNINGS names the id, **and** at least one consumed LEARNINGS is decided by the phase observable to have exercised the promotion's **recorded `phase`**" (`:1371`) — the record's field, said in those words — and `insufficient-evidence` at `:1372` is the complement of the same test. §8.3's reader row names only "`failure-mode-id`, and `artifact` for the row's canonical path" (`:1171`). Under the new claim that is "the same defect" as a reader indexing an unlisted field; under the old row-only claim it was invisible. **(b) The §8.4 harvest-side lookup indexes `symptom`, `artifact` and `phase`** and is not one of the seven readers: step 1 has the harvest side read `.consolidation-log.md` where "each promotion record carries the eight fields of §8.1" (`:1419`), step 2's question is a function of "this promotion's `symptom` … this promotion's **subject** `artifact` … this promotion's `phase`" (`:1420`), and step 3 copies the id "character-for-character **from the log row**" (`:1421`). The reader table lists "**§8.4 step 1** open list" — steps 2 and 3 are outside it, and `symptom` is named by no row at all. The consequence is not cosmetic, and it is not a fixture question DEC-LAYER-01 defers: **a record short of `phase` has no stated observable.** Is §8.3's row still emitted (the arm its `artifact` cell takes), and does the promotion fall to `insufficient-evidence` — the safe direction §8.3's own totality rule already gives an undecidable phase (`:1383-1384`) — or is it skipped, which would drop a row and "read as `insufficient-evidence` and silently move a verdict" by the same row's argument? The two are distinguishable and the document picks neither. DEC-LAYER-01 (`docs/_decisions/DECISIONS-spec-layer-boundary.md:35-39`) makes a named-owner deferral Low but keeps "fails to state the *observable*" blocking at this layer, and this is that: not a deferred arm, an absent one. It also propagates: BR-33a's AT cell now claims "the AT cell enumerates by **set-equality over §8.1's reader table**, so **every arm has exactly one home**" (`:2512`), and E-12b enumerates the short-field cases field by field (`:2567`) — both are true only if the table is complete, so a TSPEC/PROPERTIES author who trusts the enumeration will not pin the `phase` arm and will not know `symptom` has a reader. Repair, either direction and both are cheap: (i) add `phase` to §8.3's `Fields it indexes` cell with its arm — I would state it as the row emitted with the verdict falling to `insufficient-evidence`, matching `:1383-1384` — and give the §8.4 harvest lookup either a row or an explicit exclusion; or (ii) scope the closure to pass-side readers of the record's *decision* fields and say so, which shrinks the claim to one that is true. What is not available is leaving the universal as written: it is now cited as an enumeration guarantee in two other sections. | §8.1 `:1158-1162`, `:1171`; §8.3 `:1371-1372`; §8.4 `:1419-1421`; BR-33a `:2512`; E-12b `:2567` |
| F-02 | Low | Local | **One of the four deferral sites did not get the §14.5 back-anchor the other three did.** The register's value is that a deferral named in prose is findable from the register and the register is findable from the prose; commit `7937c17` added the second half at `:1270` (LD-3), `:1342` (LD-2), `:2512` and `:2567` (LD-1, LD-4). AT-R6b's cell still ends "the `target`-follows half needs a two-process-learning colliding merge and is PROPERTIES-owned per DEC-LAYER-01 (§8.2's third note)" (`:2041`) — a fifth naming site, correctly pointing at §8.2 but not at §14.5 LD-2, which is where the >2-candidate obligation folded into that same row now lives (`:2214`). This does **not** breach §14.5's stated set-equality (LD-2 exists; the obligation has a row), which is why it is Low and not a reopening of v8 F-02: it is the one place where a reader arriving from §13 rather than from §18 is sent to the note instead of to the register, and so misses the elided-set clause the register carries and §8.2's note does not. Repair: append "(§14.5 LD-2)" at `:2041`, matching the three sites already anchored. | §13 AT-R6b `:2041`, §14.5 LD-2 `:2214` |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Direct input to F-01(a), asked as a question because the answer is a judgment I should not make for you: when a record is short of `phase`, should §8.3 emit the row with the verdict falling to `insufficient-evidence`? That is the direction `:1383-1384` already fixes for a phase the §2 mapping cannot decide ("Any phase the mapping cannot decide counts as **not** exercised, routing that promotion to `insufficient-evidence` and never to a guessed `prevented`"), it keeps the row (which `:1171` argues at length must never be dropped), and it needs no new concept — a missing `phase` field and an undecidable `phase` value are the same epistemic state. If that is the intent, the repair is one clause in §8.3's reader cell and the arm is stated, not deferred. |
| Q-02 | On F-01(b): is the §8.4 harvest-side lookup (steps 1–3, `:1419-1421`) deliberately **outside** the reader table because the harvest agent is a consumer skill rather than a pass-side contract? That reading is defensible — the table's arms are all pass-side behaviours ("reports a parse notice and skips that contract"), and a `symptom` arm for an LLM prompt is not the same kind of object. If so, the closure sentence wants the qualifier ("no **pass-side** reader … outside that set"), and §8.4's step table wants a line saying what the prompt does with a record short of `symptom` or `phase` — one question with a hole in it, or one question fewer. Either answer is fine; the current text asserts the unqualified universal and then contradicts it forty lines later. |
| Q-03 | §6.4's new short-`passId` paragraph (`:831-845`) says the entry "still names the pair, and in place of the enacting `passId` it carries an explicit unavailable statement", and §8.1's row (`:1168`) and §10.3 (`:1748`) agree. None of the three says whether the **parse notice** is still reported for that record. E-12b does (`:2567`: "a parse notice naming the record and the missing field" is the head of the row, and the `passId` case is an exception only to the *skipping*, not to the notice), so I read the answer as yes and did not file it. Is that the intent — the contract runs, the spelling degrades, **and** the notice is still emitted? One clause in §6.4 would close it, and it matters because the notice is the only thing that makes the degraded spelling attributable to a short record rather than to a writer bug. |

## Positive Observations

- **§14.5 is the register I asked for and then some — it has a set-equality obligation on itself.**
  v8 F-02 asked for "a table listing id, owner, observable, and the section that states it". What
  landed adds the column that actually gets used: *what a defective implementation does*, per row
  (`:2210-2215`). LD-4's is the model — "skips the contract and re-appends a constraint that already
  landed (an NFR-4 duplicate produced by a field outside the suppression key), or writes
  `pass:undefined`, or drops the `suppressed-by:` entry so the suppression is unevidenced" — three
  named falsifiers for one deferral, which is what a PROPERTIES author needs to write the row without
  re-deriving §6.4. And the table binds itself: "a section that names one without a row is a defect of
  this table" (`:2207-2208`). I checked that obligation against every `PROPERTIES-owned` site in the
  document and it holds at five sites over four rows. A register that can be falsified mechanically is
  worth more than a register that is merely present.
- **The short-`passId` arm is the first place this document has said "the skip rule is not the safe
  direction here", and it argued it rather than asserted it.** `:831-845` derives the arm from the
  key: the predicate is a function of `(failure-mode-id, action)` and `route`, so it is decidable
  without `passId`, so skipping would "re-append a constraint that already landed in the consuming
  repo, which is exactly the duplicate the paragraph above promises does not happen, **produced by a
  field outside the suppression key**". That last clause is the whole argument in eight words, and it
  traces to NFR-4's own key rather than to a preference. The general rule at `:1145-1152` was then
  amended to carry the distinction (predicate fields vs spelling fields) with the count of exceptions
  stated — "Exactly one such field exists in the table below" — so the exception is bounded rather
  than open. This is the right shape: a rule, its one exception, and the reason the exception is one.
- **The degraded spelling was classified rather than added.** §10.3's `suppressed-by:` row already
  said "no third spelling exists"; the obvious cheap edit was to make it three. `84fdb30` instead
  makes the unavailable case "a **rendering** of the second spelling, not a third one" (`:1748`) and
  BR-26 says the same thing in the same words (`:2494`), so the two-member grammar AT-L2 and §12.2
  P-04 depend on is untouched. The `{evidence}` set still has cardinality 2 and nothing downstream
  needs re-checking — which is the difference between a consistency edit and a contract change.
- **AT-F21's Given now pins the field it does *not* exercise, and says why.** `:2098`: "**All three
  records carry a `passId`**, pinned present … so pinning it keeps conjunct (5) decidable and keeps
  this fixture on the two arms it does cover — the short-`passId` arm is deliberately **not**
  exercised here and is PROPERTIES-owned per DEC-LAYER-01". A fixture that states which arms it does
  not cover is how a coverage claim stays honest when the arm count grows; the alternative — silence —
  is exactly how AT cells come to be cited for arms they never tested, which is the defect v7 F-04
  filed against BR-33a and BR-33b.
- **The bookkeeping-count paragraph was disambiguated instead of renumbered.** `:1179-1184` now reads
  "four contracts read **these four bookkeeping fields** off it" and then states the scope explicitly:
  "**Four is the count of the readers of the bookkeeping fields, not of the record**: all seven
  readers … are enumerated once, in the reader table above, and the other three (§10.2 order 2, §8.3,
  §8.5) index no bookkeeping field". Two numbers that looked like a contradiction (four, seven) are
  now two numbers over two different sets, with the difference enumerated. I verified the residual
  claim: §10.2 order 2 takes the record as written, §8.3 indexes `failure-mode-id`/`artifact`, §8.5
  indexes `artifact` — none of the four bookkeeping fields, so the sentence is true as written.
- **Citation health, fifth consecutive round.** Every citation added this round resolves at HEAD:
  DEC-LAYER-01's fixture/set-equality bullet (`docs/_decisions/DECISIONS-spec-layer-boundary.md:31-33`)
  and its review consequence (`:35-39`) say what §14.5 and BR-33a lean on; vocabularies §1's
  `suppressed-by:` value grammar is still verbatim `` `{id}:{action} → PR URL` ``
  (`docs/_constraints/pdlc-consolidation-vocabularies.md:63`), so §14.4 ER-5 remains correctly open;
  REQ NFR-4 still keys suppression on the `(failure-mode-id, action)` pair, which is what makes the
  new "`passId` is outside the key" argument a reading of the REQ rather than an extension of it. The
  one v8 line-number defect is gone and was replaced with a field-name citation, so the citation
  surface got smaller as well as correct.
- **The version bump is honest, again.** `9.0`, not `8.1`: this round changed a reader row's arm
  structure, an edge-case row, two business rules, an AT Given, and added a numbered section. Contract
  changes, not an editorial pass.

## Recommendation

**Needs revision**

Both v8 findings are closed as filed and all three v8 questions are answered — the eighth consecutive
round in which every prior item was addressed rather than argued with, and this round's §14.5 answered
one of them past what was asked. **No High finding remains, and none has since v3.** One **Medium** is
open, and it is open on text this round added:

1. **F-01 — the new cell-level set-equality claim (`:1158-1162`) is falsified by this document, and
   the field it misses has no arm.** §8.3's `prevented` rule indexes the record's **recorded `phase`**
   (`:1371`) while §8.3's reader row names only `failure-mode-id` and `artifact` (`:1171`); the §8.4
   harvest-side lookup indexes `symptom`, `artifact` and `phase` off the log rows (`:1419-1421`) and
   is not one of the seven readers. The blocking half is not the enumeration — it is that **a record
   short of `phase` has no stated observable**: emit the §8.3 row at `insufficient-evidence`, or skip
   it? The row's own argument says dropping it "would read as `insufficient-evidence` and silently
   move a verdict", so the two arms are distinguishable and neither is chosen. DEC-LAYER-01
   (`:35-39`) keeps "fails to state the observable" blocking at this layer, and BR-33a (`:2512`) now
   advertises the table as an exhaustive arm enumeration, so the gap propagates into the coverage
   claim two other sections rely on.

2. **F-02 (Low) — anchor AT-R6b's deferral site at §14.5 LD-2** (`:2041`), matching the three sites
   anchored this round, so a reader arriving from §13 reaches the register that carries the
   >2-candidate clause rather than only §8.2's note.

The Medium is cheap to close and I have stated both acceptable directions in the finding: add `phase`
to §8.3's cell with its arm (Q-01 proposes the arm I would expect, and it is already the direction
`:1383-1384` fixes for an undecidable phase), plus a row or an explicit exclusion for the §8.4 harvest
lookup — or scope the closure to pass-side predicate readers and stop claiming the universal. What is
not available is leaving it as written, because BR-33a and E-12b now cite the table as complete.

Everything else this round is an improvement I would keep verbatim: the §14.5 register with its own
set-equality obligation and its defective-implementation column, the short-`passId` arm derived from
NFR-4's key rather than asserted, the degraded spelling classified as a rendering of the second form
so the two-member `{evidence}` grammar survives untouched, and AT-F21 declaring the arm it does not
exercise.

**No erratum is emitted with this review.** The only upstream defect in scope remains the
`suppressed-by:` value grammar at `docs/_constraints/pdlc-consolidation-vocabularies.md:63`, already
routed as §14.4 ER-5 and re-verified verbatim at HEAD this round. REQ NFR-4 still keys suppression on
the `(failure-mode-id, action)` pair, which is exactly what §6.4's new `passId` argument leans on, so
the round's central change is a reading of the REQ and not a divergence from it.

## Verdict

One Medium finding (F-01) and one Low (F-02) are open, both against text added this round; no High
finding remains. Per the approval rule — any High or Medium finding ⇒ Needs revision — this iteration
does **not** approve `FSPEC-pdlc-consolidation-agent.md` at version 9.0.

VERDICT: Needs revision
