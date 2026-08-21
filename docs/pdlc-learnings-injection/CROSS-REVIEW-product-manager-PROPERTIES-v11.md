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

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
