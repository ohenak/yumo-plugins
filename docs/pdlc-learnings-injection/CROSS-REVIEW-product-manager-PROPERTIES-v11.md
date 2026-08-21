# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-21
**Iteration:** 11 (delta re-review under DECISION FREEZE; PROPERTIES v0.6 → v0.7)

**UPSTREAM-STATE at this review:** REQ (v0.9) · FSPEC (v0.13) · TSPEC (v0.9) · DECISIONS ·
**PLAN v0.8** (`docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md:18`, changelog row at
line 610) · PROPERTIES under review at `a469ef4b`, three commits on from the `7e7d96aa` bytes I
reviewed at v10.

## Overview

**The question this round asks.** At v10 I raised three findings against a PROPERTIES whose own bytes
had not moved: PLAN had grown P-A-7 from a two-case to a three-case table, and §C.4 still ruled that
**case B** governed the amendment commit carrying PROP-BOUND-03's zero case and PROP-BOUND-05/07/08.
The revision under review — three commits, `33c93eb6` (header), `b49143a9` (§C.4), `a469ef4b` (§G.3),
67 insertions and 32 deletions across four passages — re-derives that ruling under case C. Under
DECISION FREEZE the only questions are whether my blocking finding is closed and whether the delta
broke something that worked before. Both answers are clean: **F-01 closed, F-02 closed, F-03 closed,
nothing broken.**

**F-01 (High) is resolved, and resolved in PLAN's own terms rather than paraphrased.** §C.4 line 1110
now reads *"**three**-case table at v0.8, **case C is the live case** and cases A and B are both behind
us"*, quotes case B's re-scoping verbatim (*"after LI-17 has greened the suite, with a greening batch
still ahead (batch 9 through batch 12)"*), and states the inverted obligation in PLAN's words: *"under
case C they owe no ledger row, and they owe green."* I diffed that quotation against PLAN
`PLAN-pdlc-learnings-injection.md:492` (case C's row) and it is character-exact. The standing
restatement at former line 1142 moved with it — *"**P-A-7 case C** governs the amendment commits
against the landed *implementation* suites `learningsBlock.test.js` and `learningsSelect.test.js`"* —
so the two passages that contradicted each other's upstream now agree with it and with each other. The
sentence that carried my Group D note is fixed in the same edit rather than left for later: a new
paragraph extends case C to *"the Group D amendments to the landed `learningsSelect.test.js`"*, which
is exactly the set PLAN's case C names.

**F-02 (Medium) is resolved without over-striking.** §G.3's *"Still open — three items"* is now
*"Still open — one item"*, and the two P-A-7 case-B gaps are struck through into the *"Also answered —
by PLAN v0.6/v0.7/v0.8"* list in the form they resolved: the zero-case gap as *dissolved* (*"there is
no row to widen, because there is no row"*), the no-terminus gap as *replaced* by batch 14's
unqualified gate. The bullet also records which of the two readings this document had named without
choosing PLAN actually chose — the self-greening amendment commit — and closes my carried Q-02 by
name. The AT-15 TSPEC suite-assignment item correctly stays open and is now stated to be *"the **only**
item this dispatch emits as a routed erratum line"*, which matches what the round in fact emits.

**F-03 (Low) is resolved.** Header line 11 pins PLAN at **v0.8**, describes the table as *"added at
**v0.6** with two cases and grew to **three** at v0.8"*, and names case C as the governing case; the
version cell reads 0.7. I checked the v0.7 half of that sentence against PLAN's changelog and it still
holds.

**What I re-verified against the repository, not just against PLAN.** Every load-bearing claim the
delta newly asserts, I measured at HEAD:

| New claim in the delta | Measured at HEAD | Holds? |
|---|---|---|
| No `extractInjectableMaterial(text, 0)` call in the landed block suite | `learningsBlock.test.js` calls it at lines 87, 113, 133, 174, 194 — bounds `100000`, `40`, `66`, `60`, `100000`; no zero, no non-positive | Yes |
| The un-numbered `## Cross-Feature Patterns` spelling is already accepted, with `expect(result.sections).toEqual(["Cross-Feature Patterns"])` | `learningsBlock.test.js:118` (and again at 139) asserts exactly that | Yes |
| `canonicalSectionName` strips an optional ordinal via `SECTION_HEADING_RE`, strips a trailing gloss, compares case-sensitively, returns null for `###` | `orchestrate-dev.js:2313` (`/^##[ \t]+(?:\d+\.[ \t]*)?(.*?)[ \t]*$/` — `###` cannot match, the third `#` is not `[ \t]`) and `orchestrate-dev.js:2319-2326` (gloss strip, `BR6_SECTION_NAMES` exact compare, `return null`) | Yes |
| `learningsSelect.test.js` is landed, from LI-07 | Present at HEAD; LI-07's commit is on the branch (`333cc891`, subject *"LI-07 — [red] RED selection suite (L1, TSPEC §T.5)"*) | Yes |
| LI-16, LI-17, LI-21 are all landed, so no greening batch remains | On the branch as `7f675cf4`, `c0e7151f`, `12a18628`; LI-22 landed as `8fe57a28` | Yes |
| Batch 14 is LI-22's REFACTOR-and-close and adds no assertions | PLAN case C states it; LI-22's landed commit subject is *"REFACTOR and close. Full-suite green under the arr…"* | Yes |

**One repository-state fact worth stating plainly, because it is not a defect of this delta.** The
branch was rebased (`51b37597`, *"re-untrack `.claude/pdlc-wave-state.json` after rebase"*), so every
pre-rebase SHA this document cites — `21edb7c5`, `d462ddd8`, `2cbacada`, `92b7ea0c`, `1544fdbd`,
`5e522a52`, `1920f281` — is no longer an ancestor of HEAD; each has an equivalent on the branch under
a new hash. The **substance** of every claim hung on those hashes still holds at HEAD, which is what
matters for a product reading: LI-16/17/21 have landed, the two suites are landed, and the absence
claims §C.4 measures are still true of the files at HEAD (I re-measured each, above). PLAN v0.8 cites
the same pre-rebase hashes in the same paragraph, so this is a branch-wide anchor-rot condition, not
something this revision introduced or could have avoided alone. It is not a blocking finding under
either freeze criterion; I record it as F-01 (Low, Process) and as a DEFERRED item.

## Properties

**No property statement moved, and I verified that mechanically rather than by reading.** The delta's
67 insertions land in exactly four places — header line 11 and the version cell, §C.4's governing-case
passage (lines ~1107–1155), §C.4's standing P-A-6/P-A-7 restatement (~line 1165), and §G.3's
open/answered lists (~lines 1290–1332). `git diff 7e7d96aa HEAD` over the document shows no hunk
inside Groups A–E, the AT-mapping tables, the severity column, the red/green trace column or the
oracle sections. So every property body, domain, AT mapping and red/green trace I approved at v9
stands untouched at v11.

**The four properties the delta reasons about are still the four PLAN's case C names, and the
correspondence is exact.** PLAN case C enumerates *"PROP-BOUND-03's `maxBytesPerDocument <= 0` case,
PROP-BOUND-05/07/08, and the Group D amendments to the landed `learningsSelect.test.js`"*; §C.4's
revised passage names the same set and adds no fifth. That matters for a product reading because it is
the set-equality question, not a containment one: if the revision had quietly widened or narrowed the
set while re-deriving the obligation, an implementer would inherit a different amendment scope than
PLAN schedules. It did not.

| PROPERTIES claim in the changed passages | Upstream / repository at HEAD | Holds? |
|---|---|---|
| Case A is scoped to a follow-up commit landing *before batch 7* | PLAN case A row: *"before batch 7"* | Yes |
| Case B is scoped to *"batch 9 through batch 12"* and batch 13 is behind us | PLAN case B row, verbatim; LI-21 (batch 13) landed as `12a18628` | Yes |
| Case C is *"after batch 13, the case that is live at HEAD"* | PLAN case C row, verbatim | Yes |
| Case C's obligation: *"under case C they owe no ledger row, and they owe green"* | PLAN case C row, closing sentence, character-exact | Yes |
| A landing red *"has found a real defect, not staged a TDD red"*, fix owed **before batch 14**, survival into batch 14 a **gate failure** | PLAN case C row states all three | Yes |
| The Group D amendments to `learningsSelect.test.js` travel under case C too | PLAN case C's closing clause names them | Yes |
| `helpers/learningsFixtures.js` and its consumers carry no row *"in **any of the three cases**"*, a ruling scoped to *"**this** heading-form follow-up commit, not a standing exemption"* | PLAN's paragraph below the table says exactly that | Yes |

**PROP-BOUND-03's statement itself is unchanged and still carries its expected value as a literal
transcription, not an echo.** Line 235's carve-out conjunct requires
`{material: "", bounded: false, bytes: 0, sections: []}` for every `text`, attributed to *"TSPEC §I.3's
`extractInjectableMaterial` JSDoc contract, '`maxBytes <= 0` short-circuits BEFORE the cut'; TSPEC §D.5
states the same return"*. That is a spec transcription with a named source, and it is a **positive**
assertion on the same path as the negative one (no cut occurs, therefore `bounded` is false) — the
pairing my brief demands of every absence claim. Production at `orchestrate-dev.js:2370-2371` returns
that exact object for `maxBytes <= 0`, so the property is falsifiable and the spec and the code agree;
the property did not derive its expected value from the code.

**One place where the delta's new prose is more cautious than the repository warrants — worth naming,
not blocking.** The new paragraph says PROP-BOUND-03's zero case is *"the one arm **not** obviously
green at landing"* because *"the zero-bound production half … has never been exercised through this
seam and the first call may red."* The un-exercised half is true (no zero-bound call exists in the
landed suite, verified above). The *"may red"* hedge is safe but pessimistic: the short-circuit is
shipped at `orchestrate-dev.js:2370-2371` and returns precisely the four-field object PROP-BOUND-03
transcribes, so on the code as it stands the first call should land **green** like the other three. A
hedge that over-predicts red costs nothing under case C — case C's rule is the same either way, and a
green landing satisfies it — so this is an observation, not a defect. DEFERRED.

**The set-equality discipline in the properties the delta touches is intact.** PROP-BOUND-05's
section-set arms and PROP-BOUND-03's `sections: []` return are both stated as `toEqual` set equalities
over the full enumeration rather than containment checks, and the landed suite's own precedent at
`learningsBlock.test.js:118`, `:139` and `:189` does the same (`expect(result.sections).toEqual([...])`,
including the two-name case). A deleted case would red. Nothing in the delta relaxes that.

## Oracles

**No oracle changed, and none needed to.** §O.1–§O.10 carry no hunk in this delta. They are stated
against TSPEC §D.3/§D.5, FSPEC F-O-1's two heading rules and the AT partition — none of which moved
between `7e7d96aa` and HEAD. My v10 conclusion was that the *evidence* §C.4 gathered survived the
upstream change intact and only its *conclusion* needed re-deriving; the revision did exactly that
scope of edit and no more, which is the right shape of fix for a frozen round.

**The evidence the re-derivation leans on, re-measured at HEAD rather than trusted from v10.** My v10
review asserted that no test file had moved since the `21edb7c5` pin. That statement was made against
the pre-rebase branch and I re-checked it properly this round: `learningsBlock.test.js` at HEAD carries
**five** `extractInjectableMaterial` calls where the pinned bytes carried three — a third `LI-AT-12`
case (the two-section cut, `learningsBlock.test.js:147-199`) has landed. That is a fact the delta's
own text is robust to, and I checked each absence claim against the file at **HEAD** rather than
against the pin:

| §C.4 absence claim | State at HEAD | Holds? |
|---|---|---|
| No `extractInjectableMaterial(text, 0)` / non-positive-bound call anywhere in the landed suite | Bounds at HEAD are `100000`, `40`, `66`, `60`, `100000` (`learningsBlock.test.js:87,113,133,174,194`) — none zero or negative | Yes |
| No un-glossed `## Rejected Proposals` arm, no `###`-as-body arm, no `## Process Findings` near-miss arm | None present at HEAD: no `##`-prefixed `Rejected Proposals`, `Process Findings` or `###` line anywhere in the suite. The only near occurrence is the **canonical glossed** section name `"Rejected Proposals (with rationale)"` passed to the fixture builder at `learningsBlock.test.js:81`, which is the already-covered canonical form, not the un-glossed variant arm | Yes |
| The un-numbered `## Cross-Feature Patterns` spelling **is** exercised and accepted | `learningsBlock.test.js:118`, `:139`; the numbered `## 2. …` form at `:189`, `:197` | Yes |
| Contributed-byte literals are hand-computed from the fixture, never derived from the function | The suite says so in comments and asserts literals (`toBe(40)`, `toBe(65)`, `toBe(60)`, `toBe(96)`) with the arithmetic written out | Yes |

So the delta's evidentiary base is sound at HEAD even though its pin is off-branch. That is the
distinction that keeps the anchor-rot item Low rather than High: the anchors are stale, the
measurements they stand for are not.

**The oracle-adjacent claim the delta newly makes is the production-half claim, and it verifies.**
§C.4 now asserts that PROP-BOUND-05/07/08's heading-form arms *"assert behaviour that is **shipped**"*,
quoting PLAN's description of `canonicalSectionName`. Checked directly:
`SECTION_HEADING_RE = /^##[ \t]+(?:\d+\.[ \t]*)?(.*?)[ \t]*$/` at `orchestrate-dev.js:2313` — the
optional `(?:\d+\.[ \t]*)?` group is the ordinal strip and it is **discarded**, not captured as a
priority; the `[ \t]+` after `^##` is why a `###` line never matches; `canonicalSectionName`
(`orchestrate-dev.js:2319-2326`) strips the gloss, compares `strippedTitle === name.replace(GLOSS_RE,"")`
case-sensitively against `BR6_SECTION_NAMES`, and returns `null` otherwise, which is what makes the
`## Process Findings` near-miss fail to match. All four heading-form arms therefore assert shipped
behaviour, exactly as the delta says.

**PM Q-02 is recorded closed on the right channel.** I carried Q-02 through v7–v10: is the heading-form
amendment expected green or red? PLAN v0.8's changelog row (`PLAN-pdlc-learnings-injection.md:610`)
states case C is *"answering PM Q-02"* and rules green. §G.3's revised bullet now records that closure
in the document — *"That closes PM's carried Q-02 (green, not red) as well"* — instead of re-emitting
it as a routed erratum. That is the DEC-ERR-01 mechanic working the way it is supposed to: the
question left the document once, was answered upstream, and came back recorded rather than re-asked.
The oracle consequence is the one that matters to an implementer: an amendment expected green is not a
staged TDD red, so a red that lands is a defect to fix, not a ledger row to write.

## Fixtures

**No fixture row, corpus, generator or manifest entry moved in this delta.** §F.1–§F.4 carry no hunk;
the AT-11 fixture, the `GATE-GRAMMAR` corpus, `fixtures/learnings-baseline/`,
`scripts/capture-learnings-baseline.mjs` and the `.gitignore` entry are all byte-unchanged in the
document. What the delta changes is the *rule* under which a fixture-touching amendment commit lands,
so the question for this section is whether any fixture claim depends on the case that changed. One
does, and it now reads correctly.

| Fixture dependency | What the delta now says | Checked against | Holds? |
|---|---|---|---|
| `helpers/learningsFixtures.js` and its consumers | *"carry no row of their own in **any of the three cases**"*, with PLAN's narrowing quoted: *"**this** heading-form follow-up commit, not a standing exemption for those files"* | PLAN's paragraph under the P-A-7 table says exactly this, including the "any of the three cases" wording and the TE v9 F-01 attribution | Yes |
| The additivity premise for the declared-heading-form knob | Unchanged in this document | PLAN still states it verbatim: the landed helper renders an optional ordinal and gloss, and callers declaring neither keep byte-identical output | Yes |
| The non-additive escape hatch | Not restated in PROPERTIES; PLAN now routes it *"under case B's rule first … or, once batch 13 is behind us, under **case C**"* | PLAN, closing sentence of the additivity paragraph, which itself names *"the PROPERTIES amendments §C.4 routes here"* as falling under the case-C branch | Yes — and PROPERTIES' §C.4 statement is the matching half of that sentence |
| The Group D amendments against the landed `learningsSelect.test.js` | New paragraph: *"no ledger row, and green at landing"*, same fix-before-batch-14 rule | `learningsSelect.test.js` is landed at HEAD from LI-07 (`333cc891`); PLAN case C names the Group D amendments explicitly | Yes |
| PROP-BOUND-07's hand-computed byte literals over the AT-11 fixture | Untouched | Still hand-computed in the document with the arithmetic written out; the landed suite follows the same discipline (`learningsBlock.test.js:107-116`, `:129-139`, `:166-183`) | Yes |

**The fixture-debt scoping survived the re-derivation.** §C.4's earlier ruling — that what is owed is
*"the variant fixture as a whole"* rather than four separate knobs, because the landed helper already
renders ordinal and gloss and the amendment adds **callers** — is untouched by the delta and still
rests on a premise PLAN still states. That is worth checking explicitly in a frozen round, because the
re-derivation could easily have dragged the fixture-debt sentence along with the ledger sentence and
changed what an implementer thinks they owe. It did not: the delta moved the *ledger* obligation and
left the *fixture* obligation exactly where it was.

**No new fixture entered the upstream this round, so no new fixture row is owed here.** PLAN v0.8's
changelog closes with *"Nothing else changed: no task moved batch, no `Deps` edge changed, no AT
partition, fixture or manifest row was touched, and the batches 7–13 ledger is byte-identical"*
(`PLAN-pdlc-learnings-injection.md:610`). I confirmed the negative on this document's side too: the
delta's four hunks are all in the header, §C.4 and §G.3, and none of them adds, removes or renames a
fixture. The fourteen-row inventory, the 70/35/23/21/12 counts and the 23-of-23 task accounting are
byte-identical to the version I approved at v9, so every PLAN task still has its properties and every
property still names a fixture PLAN still creates under a task PLAN still owns.

## Findings

**Prior findings — all three closed.**

| Prior ID | Severity at v10 | Status at v11 | Evidence |
|---|---|---|---|
| F-01 | High | **Closed** | §C.4 lines 1110 and 1142 re-derived under case C: *"case C is the live case and cases A and B are both behind us"*, *"under case C they owe no ledger row, and they owe green"*, and the standing restatement now reads *"P-A-7 case C governs the amendment commits against the landed implementation suites `learningsBlock.test.js` and `learningsSelect.test.js`"*. Quotations are character-exact against PLAN's case C row. The Group D extension I asked to ride with the fix landed in the same edit |
| F-02 | Medium | **Closed** | §G.3 is now *"Still open — one item"*; both P-A-7 case-B gaps are struck into *"Also answered — by PLAN v0.6/v0.7/v0.8"* in the form they resolved (the zero-case gap dissolved, the span replaced by batch 14's unqualified gate), PM Q-02 is recorded closed as green, and the AT-15 bullet correctly states it is the only routed erratum line this dispatch emits |
| F-03 | Low | **Closed** | Header line 11 pins PLAN **v0.8** and describes the table as two cases at v0.6 grown to three at v0.8, naming case C as governing; version cell reads 0.7 |

**New findings this round.**

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Process | Every commit SHA this document cites is a **pre-rebase** hash and is no longer an ancestor of HEAD: the branch was rebased at `51b37597` (*"re-untrack `.claude/pdlc-wave-state.json` after rebase"*), and `21edb7c5`, `1920f281` (LI-02), `5e522a52` (LI-08), `1544fdbd` (LI-07), `d462ddd8` (LI-16), `2cbacada` (LI-17) and `92b7ea0c` (LI-21) each have an equivalent on the branch under a new hash (`f451651e`, `618537c4`, `333cc891`, `7f675cf4`, `c0e7151f`, `12a18628` respectively). **This is not a blocking finding under either freeze criterion:** no load-bearing claim is false — LI-16/17/21 have landed, both suites are landed, and I re-measured every §C.4 absence claim against the files at **HEAD** (see Oracles) where they all still hold. It is Process rather than Local because PLAN v0.8 cites the same pre-rebase hashes in the same paragraph and the condition is branch-wide: the durable lesson is that a rebase silently rots every SHA anchor in the document set, which argues for citing tasks and test titles (as this document mostly does) over bare hashes. Suggested handling: leave the hashes until the next round that touches these passages for another reason, then re-pin | DEC-DOC-01; PLAN P-A-7 |

**Deferred observations (frozen round — recorded, not decided):**

DEFERRED: §C.4's new *"the first call may red"* hedge for PROP-BOUND-03's zero case is pessimistic — the short-circuit is shipped at `orchestrate-dev.js:2370-2371` returning exactly the four-field object the property transcribes, so a green landing is the likelier outcome; case C's rule is unchanged either way.

DEFERRED: the pre-rebase SHA anchors (F-01) could be re-pinned to their post-rebase equivalents in a later round, together with PLAN's, rather than one document at a time.

DEFERRED: §C.4 still eliminates cases A and B one at a time; if P-A-7 ever grows a fourth case the passage will go stale again, where *"batches 9–12 are behind us, so case C governs"* would not — a wording preference, not a defect, and explicitly out of scope for a frozen round.

DEFERRED: §G.3's *"Also answered — by PLAN v0.6/v0.7/v0.8"* heading will keep accreting version numbers; a later round may prefer *"answered upstream"* with the version recorded per bullet.

## Questions

| ID | Question |
|----|---------|
| Q-01 | **Closed, and recorded closed in the document.** My Q-02, carried from v7 through v10 — is the heading-form amendment expected green or red? — is answered by PLAN v0.8 case C (*"answering PM Q-02"*, `PLAN-pdlc-learnings-injection.md:610`): **green**, with a landing red reclassified as a real defect owed a fix before batch 14. §G.3 now records that closure instead of re-emitting it. I carry nothing forward |
| Q-02 | No open question. The one item §G.3 still routes upward — TSPEC's AT-15 suite assignment — is TSPEC's to answer, is already worked around by PLAN LI-07/LI-19's ledger entry, and needs no duplicate from this review |

## Positive Observations

- **The revision fixed exactly the three passages I named and nothing else.** In a frozen round that
  is the whole game: 67 insertions and 32 deletions, four hunks, all inside the header cell, §C.4's
  governing-case passage and §G.3's lists. No property, oracle, fixture, AT id, severity, group
  membership or red/green trace moved — I diffed for each rather than taking the changelog's word for
  it. A revision that resists the temptation to improve adjacent prose is what makes a frozen round
  cheap to confirm.
- **The re-derivation quotes PLAN rather than paraphrasing it.** *"under case C they owe no ledger
  row, and they owe green"*, *"after batch 13, the case that is live at HEAD"*, *"batch 9 through
  batch 12"* and *"in any of the three cases"* are all character-exact against PLAN's case table. My
  v9 F-01 was a paraphrase drift finding against this same passage; the author has evidently absorbed
  the lesson, and the result is that the next upstream move will produce a clean textual mismatch
  instead of a silent semantic one.
- **The Group D extension was folded into the F-01 fix rather than deferred.** I flagged at v10 that
  PLAN's case C reaches the `learningsSelect.test.js` amendments and that a reader of PROPERTIES alone
  would not know. The revision added a paragraph saying so, naming LI-07's landed suite. That closes
  the gap between what PLAN obliges and what an implementer reading only this document would do —
  which is the entire point of a cross-review from the product lens.
- **§G.3's strike-through form preserves the audit trail instead of erasing it.** Both answered items
  are struck, not deleted, each with the answering revision and the *shape* of the answer recorded
  (*"the gap is dissolved rather than filled — there is no row to widen, because there is no row"*).
  A future reader can reconstruct why the document once routed those items without re-deriving the
  history, and the DEC-ERR-01 anti-pattern of re-asking a decided question is avoided without losing
  the fact that it was once open.
- **The evidence survived two upstream shocks and a rebase.** §C.4's measurements — the absent
  zero-bound call, the accepted un-numbered heading spelling, the binding/non-binding `maxBytes` split
  — were gathered under a two-case rule, re-used under a three-case rule, and still verify against a
  suite that has since gained a whole new `LI-AT-12` case on a rewritten branch. Evidence that
  outlives the rule it was gathered under, the document version it was written for, and the commit
  graph it was pinned to was measured well.

## Recommendation

**Approved with minor changes.** My blocking finding is closed: §C.4 no longer prescribes a ledger
amendment PLAN says must not exist, and it now states case C's obligation — empty ledger, green at
landing, a landing red owed a fix before batch 14 and a gate failure if it survives — in PLAN's own
words, extended to the Group D `learningsSelect.test.js` amendments PLAN's case C also names. F-02 and
F-03 are closed too. I checked the delta for breakage in both freeze senses and found none: no
property, oracle, fixture, AT mapping or trace moved; every claim the delta newly asserts verifies
against the repository at HEAD (`learningsBlock.test.js:87,113,133,174,194` for the zero-bound absence,
`:118`/`:139` for the accepted un-numbered spelling, `orchestrate-dev.js:2313` and `:2319-2326` for the
shipped heading rules, `orchestrate-dev.js:2370-2371` for the zero-bound short-circuit); and every
quotation from PLAN is character-exact.

The single new finding is Low and non-gating: the document's commit anchors are all pre-rebase hashes
that no longer resolve on the branch. The substance behind each still holds at HEAD, PLAN carries the
same stale anchors, and re-pinning is best done once across the document set rather than here. Four
further observations are recorded as DEFERRED lines rather than folded into the verdict, per the
freeze.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
