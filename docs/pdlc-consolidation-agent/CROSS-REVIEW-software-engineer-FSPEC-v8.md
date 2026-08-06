# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v8.0)
**Date:** 2026-08-06
**Iteration:** 8
**Scope:** Local unless tagged otherwise
**Protocol:** delta re-review. Baseline `27eeab1` (the FSPEC commit at which my v7 was written); diff
`27eeab1..HEAD` — 25 insertions, 18 deletions across 5 FSPEC commits (`82256e9`, `ec352ee`,
`8ed0ba4`, `f18e7d5`, `f264860`). Only the changed sections were re-read for new issues.

## Prior findings — disposition

All five v7 findings were re-checked against the revision and, where they made a claim about HEAD or
about an upstream authority, against the file. **All five are closed as filed.** One of the three v7
questions (Q-03) is answered by the AT-F21 rewrite; the other two are carried forward below, in the
form the revision left them.

| v7 | Verdict | Evidence |
|---|---|---|
| F-01 (Low) — §8.1's reader table omitted `passId` from §6.4's indexed-field column although §6.4 writes `pass:{passId}` evidence | **Resolved as filed, and the arm is spelled rather than left to the general rule.** The §6.4 row's field list is now `failure-mode-id`, `action`, `route`, **`passId`** (`:1144`), and the third column argues why — "the carrier does not only decide `enacted` — it spells the evidence" — then walks the short-record arm to the same safe direction the general rule gives (parse notice, skip that contract, no suppression, re-proposed) and names `pass:undefined` as the guessed default the section forbids. The bookkeeping paragraph below the table was brought into line in a separate commit (`f264860`, `:1152-1156`): `passId` is now listed there too, "to spell its `suppressed-by:` evidence (§6.4, §10.3)", and the paragraph still correctly says **four contracts** — `passId` is a second field read by an already-listed contract, not a fifth reader. The one defect left is the line number the new cell cites; filed as L-01 below, not a reopening |
| F-02 (Low) — AT-F21's set-equality conjunct had no transcribable expected set: the Given pinned neither `F`'s `action`/`route` nor the third record's | **Resolved as filed, and then past it.** The Given now pins all three records (`:2067`): `E` = `action: retire`, `route` missing; `F` = **`action: promote`, `route: degraded`**, missing `target`; and the third record is named `W`, **`action: retire`, `route: constraints`**. The expected set is now the literal **`{E, F}`**, with per-member reasons stated. I re-derived it against BR-33c (`:2461`): `E` open because §8.4 step 1 cannot index its missing `route`, `F` open because it carries no `retire` record, `W` closed because its `retire` at `route: constraints` is a landed retirement. The Given also states *why* each pinned field is pinned ("`route: degraded` is what makes §6.4 read the pair `absent`"), which is the transcription note a fixture author actually needs — and it checks out against BR-25 (`:2440`) |
| F-03 (Low) — §8.1's normativity sentence enumerated four readers one paragraph above a table declared set-equal to seven | **Resolved as filed, on both ends.** `:1081` now closes the parenthetical with "**— e.g., not the whole set**" and adds "The seven readers are enumerated once, below, in the reader table — the parenthetical here is illustrative, not the enumeration". The table's own lead (`:1135-1137`) was strengthened at the same time from a two-part list into a flat seven-member enumeration with a closure clause: "seven, one row each, and **no reader of a failure-mode record anywhere in this document outside that set**". That is a stronger claim than I asked for and I checked it: §8.2's merge and §10.4's report items operate on the pass's own proposals or on §8.4's derived list, not on a stored record's fields, so the closure holds |
| F-04 (Low) — BR-33a and BR-33b cited AT-F21 / AT-R6b unqualified for rules whose `artifact` and `target`-follows halves the document had just named PROPERTIES-owned | **Resolved as filed — E-12b's split mirrored into both rows.** BR-33a's AT column now reads "**AT-F21** (the reader half, `route` and `target` arms only)" and names the `artifact` arms (§8.3's unavailable-path row, §8.5's refusal to guess a `retirement`) as having **no fixture at this layer**, PROPERTIES-owned per DEC-LAYER-01, "as E-12b states" (`:2459`). BR-33b's cites "fixture 2 for the subject tie-break — the `artifact` half only, since that fixture is kind 2 on both sides" and defers the `target`-follows clause to PROPERTIES with §8.2's third note named as the place its observable is stated (`:2460`). Both splits are word-for-word consistent with E-12b (`:2514`), which is what makes them checkable rather than a second paraphrase |
| F-05 (Low) — §6.5's closing sentence said a widening is "made here" and then that the decision is TSPEC's | **Resolved as filed, by the minimal edit.** `:943-946`: "made here" is gone and the self-falsifying gloss with it; what remains is "a pass that needs a third **git** read verb … is a **change** to this table, not a reading of it", followed by the DEC-LAYER-01 answer unchanged — TSPEC transcribes and, with a recorded reason, widens; this table is the frozen statement TSPEC inherits; a widening is a **recorded TSPEC decision**, never a silent reading. DEC-LAYER-01's third bullet (`docs/_decisions/DECISIONS-spec-layer-boundary.md:30`) says exactly that, re-verified at HEAD. The oracle the paragraph protects — a transcribed closed set, `observed ⊆ permitted` — is untouched |
| Q-03 — is conjunct (2) the intended positive for AT-F21's `F` arm? | **Answered by removing the need for the question.** The `F` arm was rewritten rather than annotated: it is now scoped to what a missing `target` actually blocks (§8.6 routes no remediation; no `target` is guessed on the stored record) and paired with a positive **on the same path** — "the re-derived promotion for `F` is a *fresh* proposal whose `target` is a function of its kind (§5.2) and is not missing, so it routes and writes normally". The unobservable "re-proposed on a later pass" is gone. This also closes te-review's v7 M-01 on the same clause |

## Findings

All findings below are in text this round added. Nothing unchanged since v7 is re-litigated. **No
High or Medium finding is open**, and none has been since v6 (Medium) / v3 (High). Both Lows are of
classes `DEC-LAYER-01` (`docs/_decisions/DECISIONS-spec-layer-boundary.md:21-33`) leaves to a
downstream owner or are corrections of record; per that decision's review consequence (`:35-39`) a
finding whose downstream owner is named is **Low, deferred and tracked**, and in both cases here the
FSPEC does state the observable, which is the part that stays blocking at this layer.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **The new §6.4 reader cell cites §10.3 at the wrong line — `:1712` is the `rung:` row, not the `pass:{passId}` evidence it names.** `:1144` reads "§10.3 pins that evidence as `pass:{passId}` of *the enacting record* (`:1712`)". At HEAD, line 1712 is `` | `rung:` | the model rung the pass actually ran on (§2.6) | AC-1.5, AC-1.6 | ``; the text actually cited — "`pass:{passId}` — the literal prefix `pass:` followed by **the enacting record's `passId`**" — is the `suppressed-by:` row at **`:1717`**. The drift is mechanical, not substantive: my own v7 F-01 cited `:1710` and was correct at v7.0, and this round's edits (§6.5 −2, §8.1 +3, §8.2 +6) pushed §10.3's table down by seven; the new citation was written against a mid-edit line count. It matters only because this document's self-citations are dense enough that a TSPEC author will follow them mechanically, and this one lands on an unrelated field two rows away from a field table whose rows all look alike. Every *other* citation added this round resolves (checked below). Repair: `:1712` → `:1717`. Better: cite the row by field name (`§10.3's `suppressed-by:` row`), which does not rot on the next insertion — the same defence §8.1's own citations already use for §5.1 and §8.6. | §8.1 `:1144` vs §10.3 `:1717` |
| F-02 | Low | Process | **The count of explicitly deferred, PROPERTIES-owned obligations rose from two to three, and there is still no place in the document that collects them.** This round added a third (`:1237-1242`: the two-action-one-subject pass, "**No fixture in §13 covers** that … named **PROPERTIES-owned per DEC-LAYER-01**", with its observable stated — two records under two keys, both writes made, the guard-set one made as a PR), alongside the two v7 added (E-12b / BR-33a's `artifact` arms `:2459`/`:2514`, §8.2's `target`-follows clause `:2460`). Each is individually well-formed: named owner, stated observable, stated defective implementation — exactly what DEC-LAYER-01 `:35-39` asks for. The gap is aggregate. The PROPERTIES author inherits three obligations discoverable only by grepping for "PROPERTIES-owned", scattered across §8.2, §18.7 and §19; §13 does not list them, and unlike the third one the first two have no `§13` anchor at all. §14.4 shows this document already knows the pattern — errata are routed through a numbered register, not by grep. I asked this as v7 Q-02 when the count was two and did not file it; at three, and with the trajectory one per round, it is a finding rather than a question. It is `Process` rather than `Local` because the shape recurs: any FSPEC that applies DEC-LAYER-01 honestly accumulates these, and "collect the layer deferrals in one register" is the reusable lesson, not a fact about this feature. Repair: one table in §14 (or a `§13.x` row) listing id, owner, observable, and the section that states it. | §8.2 `:1237-1242`, BR-33a `:2459`, BR-33b `:2460`, E-12b `:2514`, §14.4 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §8.2's new paragraph asserts a **universal** over §13 — "**No fixture in §13 covers** that two-action-one-subject pass" — and supports it with a partial argument: "every §13 row is single-action over a subject by construction (AT-R6b's five fixtures) or partitions on PR-opening rather than on action multiplicity (AT-Q7, AT-Q7c)" (`:1237-1239`). Three rows are named for a claim quantified over all of §13. I re-read §13 for a counterexample and did not find one — AT-F9/AT-F10/AT-F18 put a `revise`/`retire` beside an earlier `promote`, but across passes, and the merge this paragraph scopes is intra-pass — so the claim appears to hold. Is the three-row list meant as the enumeration of the *classes* of §13 row (single-action-by-construction; partitioned-on-something-else) rather than of the rows themselves? If so, half a clause saying so would make it re-checkable in one pass instead of a full §13 re-read, which is the cost this reviewer just paid. |
| Q-02 | Carried from v7 Q-01, unchanged by this round and still not blocking. §10.4 item 4 obliges the report to name **every** canonical subject path the tie-break elided (`:1774-1776`), and §8.2 consequence 1 contemplates a merge of **three** failure modes under one key (`:1256-1257`), so the elided set can have more than one member; AT-R6b fixture 2 asserts only the two-candidate case. Is the three-candidate case in scope for the PROPERTIES row §8.2's third note already opens? Now that the deferral count is three (F-02), folding it into whichever register answers F-02 would cost one line and keep the whole tie-break surface under one downstream owner. |
| Q-03 | §8.1's reader-table lead now closes the set: "seven, one row each, and **no reader of a failure-mode record anywhere in this document outside that set**" (`:1135-1137`). That closure is the reason `passId` had to be added to the §6.4 row this round — a reader that indexes an unlisted field is not the failure the closure prevents, but a *field* that no listed reader claims is. Is the intended invariant "every (reader, field) pair this document relies on appears in this table", i.e. set-equality on the **cells** and not only on the **rows**? The F-01 fix is evidence that it is, and the lead currently states only the row half. One clause would make the next round's check mechanical: for each field in §8.1's eight, the readers that index it are exactly those whose row lists it. |

## Positive Observations

- **AT-F21's Given is now a fixture a test author can type, and the expected set is derived in the
  row rather than asserted.** The repair I asked for was one clause: give `F` and the third record an
  `action`. What landed is the whole transcription: `F` = `action: promote`, `route: degraded`,
  missing `target`; the third record is *named* `W` and pinned `action: retire`, `route: constraints`;
  and the row states the expected open set as the literal `{E, F}` **with a reason per member** — `E`
  open because §8.4 step 1 cannot index its missing `route`, `F` open because it carries no `retire`
  record, `W` excluded because BR-33c closes on a landed retirement. I re-derived all three against
  BR-33c (`:2461`) and BR-25 (`:2440`) and they hold. The line worth keeping is "Every field each
  reader indexes is pinned on all three records" — that is the *rule* a fixture author needs, stated
  once, rather than the three facts it generated.
- **The `F` arm was re-scoped rather than annotated, which is the harder of the two available
  repairs.** My v7 Q-03 and te-review's v7 M-01 both landed on the same clause: `F`'s arm asserted a
  set of negatives whose stated positive ("re-proposed on a later pass") is not observable inside the
  pass under test. The cheap fix was a parenthetical naming conjunct (2) as the positive. Instead the
  arm now asserts only what a missing `target` blocks — §8.6 routes no remediation, no `target` is
  guessed on the stored record — paired with a positive **on the same path**: the re-derived promotion
  for `F` is a fresh proposal whose `target` is a function of its kind, so it routes and writes
  normally. That is a real negative/positive pair, and it makes the `route: degraded` on `F`'s record
  load-bearing (via BR-25) instead of decorative.
- **The reader-table lead is now a closure, not a list.** "seven, one row each, and no reader of a
  failure-mode record anywhere in this document outside that set" (`:1135-1137`) is a strictly
  stronger claim than v7's "the four in the paragraph below plus §10.2 order 2, §8.3 and §8.5", and
  the paragraph fifty lines above was demoted to "illustrative, not the enumeration" (`:1081-1085`)
  in the same commit rather than left to contradict it. Two enumerations of one set became one
  enumeration and one example. A document that resolves an enumeration conflict by deleting an
  enumeration is doing the right thing with the right instrument.
- **Two coverage narrowings propagated in full, with the wording copied rather than paraphrased.**
  BR-33a and BR-33b now carry E-12b's split verbatim in structure — the same two `artifact` arms
  named (§8.3's unavailable-path row, §8.5's refusal to guess a `retirement`), the same "no fixture
  at this layer", the same DEC-LAYER-01 attribution, and each pointing at the other as the place the
  observable is stated (`:2459`, `:2460`, `:2514`). Paraphrase is how three statements of one rule
  drift apart; this is three statements that will fail a diff together.
- **The §8.2 deferral states its defective implementation, not only its owner.** `:1240-1242` does
  not stop at "PROPERTIES-owned": it gives the observable (two records under two keys, both writes
  made, the guard-set one as a PR) *and* the two ways to get it wrong (fold the two actions into one
  key and make one write; suppress the guard-set write as if consequence 2 bound it). A deferral that
  names its falsifier is a deferral the downstream author can act on without re-deriving the rule.
  F-02 is that there are now three of these and no register — a filing problem, not a quality one.
- **Every citation added this round resolves except the one filed as F-01 — re-verified at HEAD.**
  DEC-LAYER-01's third bullet does assign seam verb permitted-sets to TSPEC
  (`docs/_decisions/DECISIONS-spec-layer-boundary.md:30`) and its fourth does assign fixture
  construction and set-equality domains to PROPERTIES (`:31-33`), which is what BR-33a, BR-33b and
  §8.2's new paragraph each lean on; the review consequence that makes a named-owner finding Low
  rather than Medium is at `:35-39` and says so. BR-33c (`:2461`) and BR-25 (`:2440`) both read as
  AT-F21 claims they do. The `suppressed-by:` value grammar is still verbatim
  `` `{id}:{action} → PR URL` `` at `docs/_constraints/pdlc-consolidation-vocabularies.md:63`, so
  §14.4 ER-5 remains correctly open and un-patched. Fourth consecutive round with no substantive
  citation drift; F-01 is a line number, not a claim.
- **The version bump is honest, again.** `8.0`, not `7.1`: this round changed two business-rule AT
  columns (BR-33a, BR-33b), an acceptance test's Given and expected value (AT-F21), and added a
  named deferral in §8.2 — contract changes, not an editorial pass.

## Recommendation

## Verdict
