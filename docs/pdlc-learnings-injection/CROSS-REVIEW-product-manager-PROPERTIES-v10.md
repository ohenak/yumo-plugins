# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-21
**Iteration:** 10 (upstream-cascade confirmation — PROPERTIES bytes unchanged, PLAN v0.7 → v0.8)

**UPSTREAM-STATE at this review:** REQ (`ff605dd3`) · FSPEC (`ae75fa62`) · TSPEC (`22dee8ce`) ·
DECISIONS (`56617f5a`) · **PLAN (`281c60c0`, v0.8 — was `b9fbd3ea`, v0.7, at my v9 approval)** ·
PROPERTIES under confirmation at `3e9fdf8b`, byte-identical to the version I approved at v9.

## Overview

**The question.** PROPERTIES' own bytes have not moved — `sha256:3e9fdf8b…` is exactly the value my
v9 APPROVAL-HASH records. What moved is PLAN, from `b9fbd3ea` (v0.7) to `281c60c0` (v0.8), across
four commits (`af847862`, `1082b3f7`, `3e12a7d5`, `be64a0c6`). The single question of this round is
whether PROPERTIES is still a faithful compression of PLAN as it now stands. It is not, in one
load-bearing place.

**What the erratum did to PLAN.** P-A-7's *Amendment commits on landed suites* table grew from **two
cases to three**. Case A keeps its "before batch 7" scope and gains a derivation covering batches
2–6. Case B is **re-scoped** from "batch 9 or later" to *"after LI-17 has greened the suite, with a
greening batch still ahead (batch 9 through batch 12)"* — its span is now well-formed only while a
greening batch remains. New **case C** governs "after batch 13, the case that is live at HEAD": the
ledger stays **empty**, and the amendment **is expected to land green**, with a fix owed before batch
14 and a red surviving into batch 14 a gate failure rather than a ledger entry.

**And case C names this document by name.** PLAN's case C closes: *"The same rule governs any other
amendment to a landed suite arriving from here on — including the PROPERTIES-driven re-reds §C.4 of
PROPERTIES routes to this PLAN (PROP-BOUND-03's `maxBytesPerDocument <= 0` case, PROP-BOUND-05/07/08,
and the Group D amendments to the landed `learningsSelect.test.js`): under case C they owe no ledger
row, and they owe green."* PLAN v0.8's changelog row says the same and adds that case C is
*"answering PM Q-02"* — my own carried question, answered upstream.

**The consequence: §C.4's governing-case ruling is now inverted.** PROPERTIES §C.4 (line 1110) reads
*"of PLAN's two-case table, **case B is the live case and case A is unreachable**"*, and line 1142
restates it as a standing distinction: *"**P-A-7 case B** governs the amendment commit against the
landed implementation suite `learningsBlock.test.js`"*. At HEAD, PLAN says case B is **not** the live
case — it is bounded to batches 9–12, all behind us — and case C is. The two documents now prescribe
different obligations for the same four properties: PROPERTIES says a named ledger row is owed for
every batch through the greening one; PLAN says **no row is owed and green-at-landing is**. That is
not a stale pin, it is a contradiction on what the implementer must do, so it is High.

**The second consequence: §G.3 routes two questions PLAN has already answered.** §G.3's *"Still open
— three items"* list carries both P-A-7 case-B gaps I confirmed as correctly routed at v9. PLAN v0.8
answers both explicitly — the no-named-row gap by ruling the ledger empty under case C, the
no-terminus gap by replacing the span with batch 14's unqualified gate. Leaving them in the open list
and re-emitting them as `ERRATUM: PLAN` lines is precisely the DEC-ERR-01 anti-pattern §G.3's own
prose names ("raising a question the upstream has decided"). Medium: the fix is mechanical — move both
bullets to the *"Also answered"* list in the form they resolved.

**What did not break.** No property, oracle, fixture, AT id, severity, group membership or red/green
trace is affected by this delta. P-A-6 is byte-unchanged at PLAN line 594, so §C.4's PROPERTIES-suite
mechanism and its *"the first point the suite is green"* quotation still hold verbatim. PLAN's case B
span sentence still reads *"every batch from the one the commit lands in through the batch that greens
them"*, so my v9 F-01 paraphrase finding neither worsens nor resolves. The batches 7–13 ledger is
byte-identical, and no task, `Deps` edge, AT partition, fixture or manifest row moved — I diffed for
each. §C.4's count table (70 / 35 / 23 / 21 / 12), the 23-of-23 task accounting and the fourteen-row
inventory are all unaffected, because the erratum added no task and moved none.

## Properties

**No property statement is disturbed by this delta, and I re-checked the four that the changed
upstream text names.** PLAN's case C enumerates *"PROP-BOUND-03's `maxBytesPerDocument <= 0` case,
PROP-BOUND-05/07/08"* — the same four PROPERTIES §C.4 identifies as landing in
`learningsBlock.test.js`. Upstream and downstream agree on **which** properties are in play; they
disagree only on which case of P-A-7 governs the commit that carries them. So the property bodies,
their domains, their AT mappings and their red/green traces all stand: nothing in the erratum touches
what any property asserts.

| PROPERTIES claim measured against PLAN at HEAD | Holds? |
|---|---|
| PROP-BOUND-03 stated *"over every non-negative `maxBytesPerDocument`, zero included"* (line 235) | Yes — PLAN case C uses the same spelling, `maxBytesPerDocument <= 0` |
| The four are the properties that re-red `learningsBlock.test.js` | Yes — PLAN case C enumerates the identical set |
| `learningsBlock.test.js` is greened: LI-08 red at `5e522a52`, LI-17 green at `2cbacada`, LI-16 at `d462ddd8` | Yes — PLAN v0.8 names `d462ddd8`, `2cbacada`, `92b7ea0c` as landed, same commits |
| LI-21 landed at `92b7ea0c`, so P-A-6's window is open now | Yes — P-A-6 (PLAN line 594) is byte-unchanged and LI-21 is on the branch |
| §C.4: *"case B is the live case and case A is unreachable"* | **No** — PLAN v0.8 scopes case B to batches 9–12 and makes **case C** the live one (F-01) |
| §C.4 line 1142: *"P-A-7 **case B** governs the amendment commit against the landed implementation suite"* | **No** — same inversion, restated as a standing rule (F-01) |
| 23-of-23 task accounting, 70/35/23/21/12 counts, fourteen-row inventory | Yes — the erratum added and moved no task; I diffed the task table and it is byte-identical |

**The Group D reach is new upstream material this document has not yet absorbed, and it is worth
naming even though it is not itself a defect here.** PLAN case C extends its ruling to *"the Group D
amendments to the landed `learningsSelect.test.js`"*. PROPERTIES §C.4 reasons only about
`learningsBlock.test.js`'s four properties; it says nothing false about Group D, but the revision that
fixes F-01 will want to say whether the Group D amendments against `learningsSelect.test.js` travel
under the same case-C obligation — PLAN now says they do, and a reader of PROPERTIES alone would not
know. I record this as part of F-01's fix rather than as a separate finding, because the sentence that
carries it is the same sentence.

**The 21edb7c5 pin is still current, so every absence claim §C.4 measures still measures the same
bytes.** `git diff --name-status 21edb7c5 HEAD` returns documentation paths only — this PROPERTIES
file, PLAN, and the cross-review files of the intervening rounds. No test file and no fixture has
landed since the pin, so §C.4's *"there is no `extractInjectableMaterial(text, 0)` case"* and its
variant-heading absence claims are as true at HEAD as they were at v9. That matters for the fix: the
**evidence** §C.4 and §G.3 give is unchanged and re-usable; only the P-A-7 case it hangs that evidence
on has to change.

## Oracles

**No oracle statement is affected.** §O.1–§O.10 do not cite P-A-7 at all — they are stated against
TSPEC §D.3/§D.5, FSPEC's F-O-1 rules and the AT partition, none of which moved this round. The
erratum changes *when a commit carrying an oracle may land and what the ledger owes*, not what any
oracle asserts. I re-read §O.1–§O.10 against the three upstream hashes in the dispatch and found no
citation that upstream no longer makes.

**The one oracle-adjacent claim the delta touches is the production-half claim, and PLAN v0.8 now
asserts it more strongly than PROPERTIES does — in PROPERTIES' favour.** Case C states that the
production half F-O-1's second rule needs is already shipped: *"`canonicalSectionName` strips an
optional ordinal via `SECTION_HEADING_RE`, strips an optional trailing gloss, compares
case-sensitively against `BR6_SECTION_NAMES`, and returns null for a `###` line, which `^##[ \t]+`
never matches"*. PROPERTIES §C.4's narrowed absence claim — the un-numbered `## Cross-Feature
Patterns` spelling **is** exercised with `expect(result.sections).toEqual(["Cross-Feature Patterns"])`
proving acceptance, while the variant fixture as a whole is what is owed — is consistent with that,
and is in fact the evidence PLAN's case C leans on. Nothing to correct here; the two documents now
say compatible things about the same code.

**But the *consequence* PROPERTIES draws from its own oracle evidence is what the delta invalidates.**
§C.4's chain runs: the four cases are absent from the landed suite → they will re-red committed green
code → therefore case B applies and a named ledger row is owed. The first two links still hold at
HEAD (I re-measured the pin above). The third no longer does: PLAN v0.8's answer to exactly this
situation is *"no ledger row, and they owe green"*. The oracle evidence survives the erratum intact;
only its conclusion has to be re-derived under case C. That is why F-01 is a rewrite of two passages,
not a re-verification of the section.

**PM Q-02 is answered upstream, and the answer bears on the oracles' expected colour.** I carried Q-02
through v7, v8 and v9: is the heading-form amendment expected to land **green** (production already
implements F-O-1's second rule) or **red**? PLAN v0.8's changelog names case C as *"answering PM
Q-02"* and rules **green**. This is the more consequential half of the cascade for a test-oracle
reader: an amendment expected green is not a staged TDD red, so a red that does land *"has found a
real defect, not staged a TDD red"*. PROPERTIES §G.3's second bullet currently offers *"LI-22's
REFACTOR-and-close batch or a self-greening amendment commit"* as the two candidate readings and
declines to choose; PLAN has chosen the second. The bullet should record that, not re-ask it (F-02).

## Fixtures

**No fixture claim is invalidated by this delta, and one is reinforced.** §F.1–§F.4 are untouched by
definition (PROPERTIES' bytes did not move), and I checked each fixture dependency against PLAN at
`281c60c0` rather than against my v9 notes:

| Fixture dependency | PLAN's statement at v0.8 | Effect on PROPERTIES |
|---|---|---|
| `helpers/learningsFixtures.js` and its consumers | *"carry **no** row of their own in **any of the three cases**"* — previously "in either case" | Compatible: PROPERTIES makes no ledger claim about the helper's consumers |
| The additivity premise for the declared-heading-form knob | Unchanged verbatim: the landed helper already renders optional ordinal and gloss, existing callers keep byte-identical output | §C.4's fixture-debt scoping (*"the variant fixture as a whole"*) still rests on a premise upstream still states |
| The non-additive escape hatch | Now reads *"under case B's rule first … **or**, once batch 13 is behind us, under **case C**, where the obligation is green-at-landing rather than a ledger row"* | This is new upstream text PROPERTIES has not absorbed; it is the same sentence F-01 asks to be re-derived |
| `fixtures/learnings-baseline/` (LI-06, `4a6c1816`), `scripts/capture-learnings-baseline.mjs` (LI-05, `ced75955`), `.gitignore` `/.baseline-worktree/` (LI-04, `ae2af1da`) | Untouched by the erratum | Unchanged; still tracked and still cited by rule text / test title rather than by bare anchor |
| PROP-BOUND-07's hand-computed byte literals over the AT-11 fixture | Untouched | Unchanged; §C.4's binding/non-binding `maxBytes` qualification still verifies |

**The scoping fix upstream is one PROPERTIES benefits from and should say so.** PLAN v0.8 narrows the
"no row of their own" ruling to *"**this** heading-form follow-up commit, not a standing exemption for
those files (TE v9 F-01)"*. PROPERTIES never claimed a standing exemption, so nothing here is
falsified — but §C.4's fixture-debt paragraph reads more safely under the narrowed rule than under the
old one, and the revision that fixes F-01 can cite the narrowed form directly.

**No new fixture, corpus or generator entered the upstream this round.** The erratum touched PLAN's
version cell, P-A-7's case table, the closing scope sentence and the changelog — nothing in the task
table, the AT partition, the manifest rows or the fixture list. I verified that by diffing
`f73046ad..be64a0c6` over the whole document: 5 changed hunks, all of them in those four places. So
every fixture row PROPERTIES declares still points at a fixture PLAN still creates, under a task PLAN
still owns, in the batch PLAN still schedules it in.

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
