# Cross-Review: software-engineer — FSPEC (delta confirmation, round v13)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md (v0.11)
**Erratum commits:** 4e5d8081, 4e8e684b, c9f672c3, 1b4dc3de
**Date:** 2026-08-20
**Iteration:** 13
**Round type:** delta confirmation (previously approved at v12, `REVIEWED-COMMIT: 9a4b7593`)
**Upstream state:** REQ `docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md` v0.9, sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd

## Overview

**Question answered:** does the v0.11 erratum resolve the four routed items without breaking anything approved at v12?

**Answer: the items land, but the delta is half a correction.** All four routed items are discharged in their own sections. BR-1 now carries REQ C-1's second conjunct, BR-15's expected set drops the enumeration and is stated as an enumerable equality, and AT-02/AT-33 track both. What the delta does **not** do is propagate BR-1's new two-conjunct rule to the rule's *complement* — the byte-identity side. BR-11, AT-03 and AT-29 still say **"every non-authoring dispatch"**, which under the corrected BR-1 is strictly narrower than "every dispatch outside BR-1's rule". REQ AC-1.2 names the difference explicitly and requires it byte-identical. That is one High finding, tagged `delta`/`local`.

The delta itself, over commits 4e5d8081, 4e8e684b, c9f672c3 and 1b4dc3de (+25/−11 across four hunks):

- `:283-290` BR-1 restated as a two-conjunct iff: authoring classification **and** target in {REQ, FSPEC, TSPEC, PLAN, DECISIONS, PROPERTIES}, with the second conjunct named load-bearing and the code-review optimizer named as the dispatch it excludes.
- `:678-684` BR-15 expected set: `**exactly** one open attempt per report-named document other than the `RSN-SELF` ones`, plus an explicit statement that the candidate-path enumeration contributes **no** member because it opens no file under `docs/`.
- `:783`, `:938-940` AT-02 retargeted at "BR-1's two-conjunct rule"; AT-33's expected set transcribed to match the corrected BR-15.
- `:18`, `:53-59` version 0.10 → 0.11 and a v0.11 erratum note stating both corrections and their upstream grounding.

No BR, E-row, AC mapping or flow step outside those four loci changed, so the approved surface is otherwise intact by construction.

## Linked Requirements

**Upstream re-read at HEAD (DEC-ERR-03 obligation).** The dispatch pins REQ at sha256:ff605dd…e84dd, byte-identical to the `UPSTREAM-STATE` anchor on my v12 approval — upstream has not moved under this document. I did not rest on the sha: because this delta's whole content is a transcription of REQ C-1 and AC-1.2, I re-read those two, plus NG-5 and AC-5.2, in full at HEAD and diffed the FSPEC's new sentences against them.

| FSPEC text (v0.11) | Upstream at HEAD | Verdict |
|---|---|---|
| BR-1 — "the pipeline classifies it as authoring, **and** its target document is one of REQ, FSPEC, TSPEC, PLAN, DECISIONS or PROPERTIES (REQ C-1)" | REQ C-1 — "every dispatch the pipeline tags `dispatchKind: \"authoring\"` at HEAD … whose target document is REQ, FSPEC, TSPEC, PLAN, DECISIONS or PROPERTIES" | Accurate, both conjuncts and the six-member list verbatim-aligned |
| BR-1 — "an authoring-classified dispatch whose target is none of those six document types (the code-review phase's optimizer round at HEAD) is outside the rule" | REQ AC-1.2 — "any dispatch the pipeline tags authoring whose target is none of C-1's six document types — the code-review phase's optimizer at HEAD" | Accurate; the FSPEC even preserves AC-1.2's own parenthetical |
| BR-1 — "which is what REQ AC-1.2 and NG-5 decide" | REQ NG-5 — "Not applied to review, implementation, DoD or harvest dispatches. Scope is C-1's rule." | Accurate; NG-5 defers to C-1's rule, so the corrected conjunct is the thing NG-5 scopes to |
| BR-1 — "not a new list maintained by this feature: the rule consumes them, it does not restate a call-site membership" | REQ C-1 — "deliberately a rule over the taxonomy that already exists rather than a hand-counted set of six" | Accurate; the FSPEC keeps C-1's reason for the rule form, which is what makes the six-name list an illustration rather than a maintained set |
| BR-1 — set-equality oracle, no fixed count, run with no DECISIONS phase / no Phase R creator / five optimizer rounds | REQ AC-1.2 and AC-1.1's derivation note | Accurate |
| BR-15 — "the corpus paths touched are **exactly** the reads the record accounts for — a positive membership claim, not an absence-only one" | REQ AC-5.2 — "the corpus paths touched are exactly the reads of the documents AC-3.1 and AC-3.2 name — a positive membership claim, not an absence-only one" | Accurate, verbatim-aligned |
| BR-15 — expected set excludes `RSN-SELF` documents, "decided from the path before any read" | REQ AC-5.2 reads on the *reads of* the named documents; a self-excluded document is named by AC-3.2 but never read, so it contributes no read | Compatible; the exclusion narrows to what AC-5.2 actually measures rather than to the naming |
| BR-15 — "the corpus enumeration … opens no file under `docs/`, so this instrument does not see it" | REQ AC-5.2 measures *reads*, and REQ NG-4 forbids any index/cache/state file; nothing upstream asserts the enumeration is a file-open | Accurate; the previous text's enumeration member was an FSPEC-local artefact, not an upstream claim, so dropping it moves toward upstream, not away |
| Header `Upstream` row — REQ v0.9 | REQ:18 version cell reads `0.9` | Accurate |

**Where the compression now breaks.** REQ AC-1.2 is one sentence with two halves: the block-carrying set **equals** C-1's rule, *and* every dispatch **outside it** is byte-identical to the disabled run — where "outside it" is spelled out to include the authoring-tagged/non-C-1-target dispatch. The delta corrected the first half (BR-1, AT-02) and left the second half (BR-11, AT-03, AT-29) written against the pre-correction complement, "non-authoring". After this edit those two halves no longer partition the same universe, and the dispatch REQ AC-1.2 goes out of its way to name is the one that falls in the gap. See F-01.

## Behavioral Flow

Untouched by the delta; re-confirmed by sampling, not re-read (delta protocol).

One consistency echo of the BR-1 correction lands here and is worth recording. The decision table's `D-2` row (`:265`) still reads *"Is this dispatch an authoring dispatch? — yes / no"*, and the flow prose at `:70` still describes the block as added *"to the dispatches the pipeline already classifies as authoring"*. Both point at BR-1 as their rule, so an implementer who follows the pointer reaches the corrected two-conjunct text and cannot get the behaviour wrong; but read alone they restate the single-conjunct form the erratum just removed. A-2 at `:995` has the same shape ("the pipeline's existing authoring classification is stable enough to be consumed rather than restated") — still true of both conjuncts, since the target document type is equally the pipeline's own value, but it now names only one of them. These are wording echoes, not behavioural divergence: Low, recorded as F-03.

Step 0(2)'s configuration branches, step (4)'s threshold resolution and the per-dispatch locus for corpus outcomes are all outside this delta's four hunks and remain as approved at v12.

## Business Rules

**BR-1 (`:282-306`) — routed items 1 and 3: landed, and correctly.** The rule is now an iff over a conjunction, with both conjuncts sourced to the pipeline's own values and the second one explicitly declared load-bearing rather than defensive. That last sentence is the part that matters downstream: it forecloses a later reader deciding the conjunct is belt-and-braces and dropping it. The Included/Excluded lists below the rule are unchanged and still correct under the new rule — they were already the six C-1 document types — and the note that they "illustrate what the pipeline's classification yields today" continues to hold.

This is what TSPEC §A.2 was written against and what PLAN LI-11's composition-site set equality transcribes: an implementer reading BR-1 alone now derives the same set as an implementer reading TSPEC §A.2, which was the defect. TSPEC ERR-3 is discharged at the FSPEC layer.

**BR-15 (`:673-689`) — routed items 2 and 4: landed, and correctly.** Two independent defects are fixed in one paragraph:

- The instrument and its expected set now agree. The observed set is defined as "the file-open calls the run makes under `docs/`"; the expected set no longer claims a member for the corpus-root enumeration, and says why in the instrument's own terms — the enumeration "opens no file under `docs/`, so this instrument does not see it". The FSPEC states this observationally and does not name the mechanism (`git ls-files`), which is the right altitude: the mechanism is TSPEC material, the *no-member* consequence is the behavioural claim, and the claim is true of any enumeration that does not open corpus files. If the TSPEC later chose a directory-walk implementation that does open files, the FSPEC sentence would be the thing that fails, which is the correct direction of pressure.
- Membership is now enumerable: "**exactly** one open attempt for every corpus document the report names … Membership is therefore fully enumerable from the report alone, so a test may transcribe it as an equality." That is precisely the property PLAN LI-11 needs in order to transcribe the set as an equality rather than a containment.

The `RSN-SELF` carve-out and the `RSN-UNREADABLE`-belongs ("the failed attempt is the read") clause are preserved from the approved text, and both remain consistent with REQ AC-5.2, which measures reads rather than namings.

**BR-11 (`:583-597`) — not touched, and now inconsistent with BR-1.** Its closing sentence still reads *"every **non-authoring** dispatch prompt is byte-identical to the same dispatch composed with injection disabled."* Before this delta, "non-authoring" and "outside BR-1's rule" denoted the same set and the sentence was exact. After it they do not: the code-review phase's optimizer round is authoring-classified and outside BR-1's rule, so BR-11 as written makes no byte-identity claim about it, while REQ AC-1.2 explicitly does. BR-11 is the rule AC-1.2 traces to for that half (`:140` maps AC-1.2 → BR-1, BR-11), so the traceability row now points at a rule that under-delivers its AC. This is the substance of F-01.

## Edge Cases and Error Scenarios

Untouched by the delta and unaffected by it. E-29 (five optimizer rounds → each round's authoring dispatch carries a block, AT-01/AT-02) and E-30 (erratum dispatch carries a block) both concern dispatches whose target *is* one of C-1's six types, so the added conjunct does not change their expected outcome. E-01's "every authoring dispatch composed exactly as today" under an empty corpus is likewise unaffected — it is an all-quantified claim over a set the conjunct only shrinks.

I looked for an E-row covering the newly-named exclusion — an authoring-tagged dispatch with no C-1 document type — and there is none. I am **not** filing that as a finding: the exclusion is a rule-level fact that BR-1 states directly and AT-02's universe-wide set equality already exercises, and manufacturing an E-row for it would duplicate the rule rather than cover an edge. The gap that does matter is the byte-identity oracle, not the edge catalogue (F-01).

## Acceptance Tests

**AT-02 (`:781-786`) — landed.** Retargeted from "the subset BR-1's classification names" to "the subset BR-1's **two-conjunct rule** names", still asserted as set equality over the whole dispatch universe ("every agent invocation the run makes … not only those already classified authoring"). The universe clause was already right and is what makes the corrected rule testable: a test that only enumerated authoring-classified dispatches could not observe the new exclusion at all. With this wording, a run in which the code-review optimizer carried a block fails AT-02. Item 1 is discharged on the test side too.

**AT-33 (`:936-943`) — landed.** Transcribes the corrected BR-15 expected set verbatim in substance ("exactly one attempt per report-named document other than the `RSN-SELF` ones, the enumeration of candidate paths contributing no member"), and retains the non-empty-observed-set conjunct that keeps AT-34's absence claim non-vacuous. The AT and its rule now agree; before the delta, a faithful implementation would have failed AT-33 on a phantom enumeration member. Item 2 is discharged.

**AT-03 (`:787-789`) and AT-29 (`:906-912`) — not touched, and now under-covering.** Both express AC-1.2's byte-identity half over "each non-authoring dispatch" / "every non-authoring dispatch prompt". Under the corrected BR-1 that quantifier no longer covers the authoring-tagged, non-C-1-target dispatch that REQ AC-1.2 names by hand. Consequence, concretely: an implementation that suppressed the block for the code-review optimizer (AT-02 green) but nonetheless perturbed that dispatch's prompt — an injected-but-empty region, a reordered manifest, a stray delimiter — would pass every AT in this document while violating AC-1.2 as written. The fix is a quantifier swap in three places (BR-11, AT-03, AT-29): "non-authoring" → "outside BR-1's rule", which is the phrase BR-1 itself now uses. AT-31's disabled-run claim already quantifies over "every composed dispatch" and needs no change.

**AT-01, AT-04–AT-28, AT-30–AT-35** — unchanged and unaffected; re-confirmed by sampling against their rules, no divergence found.

The traceability row at `:140` (`AC-1.2 | BR-1, BR-11 | AT-02, AT-03`) is itself accurate as a mapping; it is the mapped-to text that under-delivers, so no separate finding.

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | When the quantifier is repaired in BR-11 / AT-03 / AT-29, is "outside BR-1's rule" the phrase you want, or would you rather BR-1 name its complement explicitly once (e.g. "every other dispatch, including an authoring-tagged dispatch with no C-1 target") and have the three sites cite that? The second costs one more sentence in BR-1 and makes the partition impossible to re-split by a later edit to either half. |

## Delta-Confirmation Findings

_pending_

## Recommendation

_pending_

## Verdict

_pending_
