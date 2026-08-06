# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v8.0)
**Date:** 2026-08-06
**Iteration:** 8
**Scope:** Testing lens only, delta re-review under the structural freeze declared in
`POSTMORTEM-F-pdlc-consolidation-agent.md` §Resolution step 2 and under `DEC-LAYER-01`
(`docs/_decisions/DECISIONS-spec-layer-boundary.md`). Baseline for the diff is `27eeab1` — the commit
v7 was written against; the revision is five commits, `82256e9`…`f264860`, +25/−18 lines. Prior
findings M-01, L-01, L-02, L-03 are verified for disposition; new observations are drawn **only**
from changed text.

## Prior findings — disposition

All four v7 findings are **resolved**, and both v7 questions are answered in the document. Each was
checked against the revised text and, where it made a claim about this repository or about another
section, against the cited target.

| v7 ID | Sev | Disposition | Evidence in v8.0 |
|----|---|---|---|
| M-01 | Medium | **Resolved, exactly as the finding specified** | AT-F21's Given (`:2067`) now pins `F` as "**`action: promote`**, `route: degraded`" and states why: "`F`'s `action` and `route` are stated because BR-25 and BR-33c decide `F`'s downstream state from them, and `route: degraded` is what makes §6.4 read the pair `absent` so the re-derivation is live rather than suppressed". Conjunct (3)'s `F` arm is rescoped to the missing `target` — "**§8.6 routes no remediation for `F`, and no `target` is guessed for it on the stored record**" — and the two clauses that were red on conforming behaviour ("not routed", "no write is made on its behalf") are gone, replaced by the positive statement of what *does* happen: "The pass's re-derived promotion for `F` is a *fresh* proposal whose `target` is a function of its kind (§5.2) and is not missing, so it routes and writes normally". The Given now determines the Then on every branch; the fixture is buildable |
| L-01 | Low | **Resolved** | §8.1's set-equality lead (`:1135-1137`) drops the broken "the four in the paragraph below" pointer and transcribes the set inline: "§5.1, §8.6, §6.4, §8.4 step 1, §10.2 order 2, §8.3 and §8.5, seven, one row each, and no reader of a failure-mode record anywhere in this document outside that set". I re-counted the table (`:1141-1147`): seven rows, set-equal to the seven named. The claim and its audit trail now agree |
| L-02 | Low | **Resolved, and in the durable form** | AT-F21's reader-table citation is no longer a line number: "(§8.1's reader table, the §8.6 row)". A section-and-row anchor survives every edit, which is what makes this the repair rather than `:1131` → `:1141`. That the same revision reintroduced the defect it just fixed, one section away, is L-01 below |
| L-03 | Low | **Resolved** | §8.2 (`:1237-1242`) now names the two-action-one-subject pass: "**No fixture in §13 covers that two-action-one-subject pass** — every §13 row is single-action over a subject by construction (AT-R6b's five fixtures) or partitions on PR-opening rather than on action multiplicity (AT-Q7, AT-Q7c) — so it is named **PROPERTIES-owned per DEC-LAYER-01**, with its observable stated here: two records under two keys, both writes made, and the guard-set one made as a PR." It also names the defective implementation ("folds the two actions into one key and makes one write, or suppresses the guard-set write as if consequence 2 bound it"), which is the oracle the deferred owner inherits |
| Q-01 | — | **Answered, in the row, as a literal** | AT-F21's Given now pins the third record — "one well-formed record for id `W`, **`action: retire`, `route: constraints`** (a landed retirement, so `W` is closed by BR-33c and the expected open set below is a literal, not a description)" — and conjunct (3) writes the expected set as **`{E, F}`** with a per-member justification. I re-derived it against the rules rather than the prose: §8.4 step 1 indexes `failure-mode-id`, `action`, `route` (`:1144`), so `E` — short of `route` — is skipped for that contract and stays open; `F` carries `action: promote`, so no `retire` record exists for it and BR-33c (`:2461`) cannot close it; `W`'s `retire` at a non-`degraded` route is exactly BR-33c's closing predicate. `{E, F}` is right, and it is a literal, so the set-equality is falsifiable in both directions |
| Q-02 | — | **Answered by ownership, correctly left where it is** | §8.1's §8.3 row is unchanged and still names the unavailable-path cell an observable owned by TSPEC per DEC-LAYER-01; BR-33a's AT cell (`:2459`) now carries the same statement, so the deferral is recorded on the rule as well as in the prose. The check I asked for is a TSPEC-author check and remains on record here; it was never a change this layer owed |

## Findings

Three findings, all new, all inside text this revision introduced — every one of them attaches to the
single substantive change of this revision, the `passId` field added to §8.1's §6.4 reader row. No
unchanged section was re-litigated. One is **Medium**: it is not a fixture-strength deferral of the
class `DEC-LAYER-01` places below this layer, but a new rule whose stated downstream outcome
contradicts §6.4's own suppression predicate and inverts the safety direction NFR-4 exists to hold.
The other two are Low.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| M-01 | Medium | Local | **The new `passId` arm makes a non-key bookkeeping field defeat NFR-4's suppression, contradicts §6.4's own `enacted` predicate, and picks the duplicate-write direction without saying so.** §8.1's reader row for §6.4 (`:1143`) now indexes a fourth field and states its arm: "A record short of `passId` therefore leaves a suppression the carrier could decide but cannot spell, and the general rule above applies unchanged: parse notice, skip that contract, **no suppression, re-proposed**." Trace what that asserts against the two documents it has to agree with. (a) §6.4's carrier rule (`:821-823`) defines the observable: "A pair is `enacted` when some prior pass's failure-mode record carries the same `(failure-mode-id, action)` **and that record's `route` is not `degraded`**… A pair is `absent` otherwise." `passId` is not in that predicate, and the reader row concedes it isn't — "the carrier **could decide**" the suppression. So on a record short of `passId` §6.4 says `enacted` (suppress, append nothing) and §8.1 says skip (no suppression, re-propose). Two normative statements, opposite writes to the consuming repo, and §6.4 was not updated: its own carrier row still enumerates three fields — the record "carries its `failure-mode-id`, its `action` and its `route` as **fields of the §8.1 record**" (`:819`) — so the document now states this carrier's indexed-field set twice, as three and as four. (b) The direction chosen is the unsafe one **here**, which is the reverse of the `route` arm the same table gets right. For `route`, skipping yields `absent` and a re-proposal, and §8.4's own reasoning is that re-proposing costs a duplicate proposal while suppressing costs a missed recurrence. For `passId` the cost lands the other way: re-proposing a promotion that **already landed in the consuming repo** re-appends the same constraint to `DOMAIN-CONSTRAINTS.md`, which is precisely the "re-running a pass over the same corpus does **not** append the same constraint twice" guarantee `:828-829` states and REQ NFR-4 (`REQ-pdlc-consolidation-agent.md:506-507`) mandates — and NFR-4 keys **on the pair `(failure-mode-id, action)`**, so a field outside the key now silently defeats it. The document neither names that cost nor considers the third branch it left on the table: suppress on the key as §6.4 defines it, and report the evidence as degraded/unavailable in the same way §8.1's §8.3 row already renders a missing `artifact`. (c) **No fixture, no owner.** AT-F21 covers the `route` arm (via `E`) and the `target` arm (via `F`); it does not carry a record short of `passId`, and BR-33a's AT cell (`:2459`) names the covered arms as "`route` and `target` arms only" and defers only the `artifact` arms — so this arm is in neither the covered nor the deferred set (L-02). A test author asked to assert this behaviour today cannot decide from the document whether the expected state is `duplicate-suppressed` with a degraded evidence spelling or a second append, and the two are the observable that matters. **FSPEC-layer repair, no new AT and no new BR needed:** decide the branch and state it in **one** place — my reading of NFR-4 is that the suppression must hold and only the *evidence spelling* degrades — then make §6.4's carrier row (`:819`) and §8.1's reader row agree on the indexed-field set, and either extend AT-F21's Given with a third short record (`action`/`route`/`id` present, `passId` absent) asserting the chosen outcome, or name the arm PROPERTIES-owned per DEC-LAYER-01 with its observable, as this revision correctly did for §8.2's two-action pass | §8.1 `:1143`, §6.4 `:819`, `:821-823`, `:828-829`, BR-25 `:2440`, REQ NFR-4 `:506-507` |
| L-01 | Low | Process | **The one line-number self-citation this revision *added* is wrong, in the same revision that removed the last one.** §8.1's new `passId` clause (`:1143`) cites "§10.3 pins that evidence as `pass:{passId}` of *the enacting record* (`:1712`)". At v8.0 `:1712` is the **`rung:`** row of §10.3's field table ("the model rung the pass actually ran on (§2.6) \| AC-1.5, AC-1.6"); the `suppressed-by:` row that actually pins the `pass:{passId}` spelling is `:1717`, five rows further down. The claim is true — I read `:1717` and it does carry "`pass:{passId}` … one per §6.4 carrier" — but the pointer lands on an unrelated field, so a reader checking it finds a contradiction where there is none. This is the third occurrence of the class (v5 L-01, v7 L-02, now), and the fix applied to AT-F21 in this very revision is the one that works: a **section-and-row anchor** ("§10.3's `suppressed-by:` row") survives every subsequent edit, a line number does not. Tagged `Process` rather than `Local` because the lesson is reusable regardless of where the fix lands: a spec that cites its own line numbers invalidates those citations on every edit, and the reviewer-facing audit trail is the first casualty. **Repair:** `(`:1712`)` → `§10.3's `suppressed-by:` row`, and, if the freeze permits a sweep, the same substitution for any remaining self-cite by line number | §8.1 `:1143`, §10.3 `:1712` vs `:1717` |
| L-02 | Low | Local | **BR-33a's arm enumeration is no longer set-equal to the reader table it summarises.** The AT cell (`:2459`) partitions the reader rule into exactly two classes — "**AT-F21** (the reader half, `route` and `target` arms only)" and "The `artifact` arms … have **no fixture at this layer** and are PROPERTIES-owned per DEC-LAYER-01". At v7 that partition was exhaustive over the fields the reader table indexed. This revision added `passId` to §6.4's row and did not touch the partition, so the enumeration now covers `route`, `target` and `artifact` while the table indexes `failure-mode-id`, `action`, `route`, `target`, `artifact` **and `passId`** — a reader auditing the rule by set-equality (the discipline the FSPEC itself imposes on AT-F19, AT-F20 and now AT-F21) concludes the new arm falls in one of the two named classes when it falls in neither. This is the containment-vs-set-equality failure one level up: the enumeration reads as complete and is not, so an added case is invisible exactly as a deleted case would be. **Repair, one clause:** add the `passId` arm to whichever class M-01's decision puts it in. (`failure-mode-id` and `action` are pre-existing and out of scope for this delta; if the sweep is cheap, the cell would be stronger stated as a set-equality over the reader table's indexed fields rather than as three named arms) | §18 BR-33a `:2459`, §8.1 `:1141-1147` |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §8.1's record-shape lead now reads "(§5.1's routing predicate, §6.4's consuming-repo carrier, §8.4 step 1, §10.2 order 2 — e.g., not the whole set)" and then "The seven readers are enumerated once, below, in the reader table — the parenthetical here is illustrative, not the enumeration". That disarms the earlier set-equality trap and I am not filing on it. But the bookkeeping paragraph twelve lines further on (`:1152-1155`) still opens "They are in the record because **four contracts** read them off it" and then enumerates four — a *third* count of readers in one section (four bookkeeping-field readers, seven record readers, and now the illustrative parenthetical's four). The four is correct as scoped (§5.1, §6.4, §8.4 step 1, §8.6 are the readers of the *bookkeeping* fields, not of the record), but nothing in the text says that is the scoping. Is a one-clause gloss — "four contracts read the **bookkeeping** fields off it; the reader table below enumerates all seven readers of the record" — admissible under the freeze? It costs nothing and it removes the last place a counter can land on the wrong number. |
| Q-02 | AT-F21's Given now pins every field each reader indexes on all three records — except `passId`, which after this revision §6.4 indexes and which the Given does not mention on `E`, `F` or `W`. If M-01's repair keeps the suppression alive on a record short of `passId`, the fixture is unaffected (all three records may carry a `passId` and the arm is deferred). If instead the repair keeps §8.1's stated "no suppression, re-proposed", then `W`'s `passId` becomes load-bearing for conjunct (5) — "the well-formed record is unaffected: its contracts all run" is no longer decidable without it — and it must be pinned in the Given for the same reason `F`'s `route` was. Which way the repair goes decides whether the Given needs a fourth pin; please answer it in the row rather than in a reply, as this revision did for `F`. |

## Positive Observations

- **The M-01 repair was taken in the strong form, and the fixed row now explains itself.** It would
  have satisfied the finding to pin `F`'s two fields and delete the false clauses. The row does more:
  it states *why* each pin exists ("`route: degraded` is what makes §6.4 read the pair `absent` so
  the re-derivation is live rather than suppressed") and replaces the deleted negative with the
  positive behaviour it was standing in front of ("routes and writes normally; nothing about the
  short record suppresses it"). A conjunct that says what does happen instead of only what does not
  is the difference between an oracle and an absence-only assertion, and this one crossed that line
  in the right direction.
- **The expected open set is now a literal, and `W` was constructed to make it one.** The Given
  changed `W` from an unspecified "well-formed record" to `action: retire`, `route: constraints`,
  and says why in the same breath: "a landed retirement, so `W` is closed by BR-33c and the expected
  open set below is a literal, not a description". That is the answer to my v7 Q-01 done properly —
  the fixture was altered so the expected side could be **transcribed** rather than described. I
  re-derived `{E, F}` from BR-33c and §8.4 step 1's indexed fields rather than from the prose, and
  it holds in both directions: an implementation that closes an id on any `retire` drops `E`, one
  that ignores the `route` conjunct drops nothing but would also have to drop `B` in AT-F19, and one
  that returns every recorded id yields `{E, F, W}` and fails set-equality on `W`.
- **BR-33a and BR-33b's AT columns now record their deferrals on the rule, not only in the prose.**
  A reader who reaches the rules table without having read §8.2's third note or E-12b previously saw
  "AT-F21" and "AT-R6b" as unqualified coverage claims. Both cells now carry the qualification and
  the owner ("the `artifact` half only, since that fixture is kind 2 on both sides"; "PROPERTIES-owned
  per DEC-LAYER-01"). The rules table is where an implementer checks what a rule is pinned by, so
  moving the qualification there is the move that changes behaviour. My L-02 is that the same cell
  did not absorb the arm this revision itself added.
- **§6.5's ownership gloss got shorter and clearer without losing the decision.** The v7 wording
  needed a two-clause disclaimer to explain that "made here" was about the layer that owns the
  decision. The v8 wording drops the disclaimer and states the mechanism directly: "a widening is a
  **recorded TSPEC decision** against this set, never a silent reading of it". Same content, one
  fewer thing for a test author to interpret, and the falsifiable part — observed ⊆ permitted — is
  untouched.
- **Every citation in the changed text was checked at its target; one is wrong and it is L-01.**
  §10.3 does pin the `pass:{passId}` spelling (`:1717`), §6.4's carrier row does enumerate three
  fields (`:819`), BR-33c's closing predicate is as AT-F21 relies on (`:2461`), and §8.1's
  seven-member reader set is set-equal to its table (`:1141-1147`, seven rows counted). The only
  defect is, once again, the document citing **itself** by line number.

## Recommendation

## Verdict
