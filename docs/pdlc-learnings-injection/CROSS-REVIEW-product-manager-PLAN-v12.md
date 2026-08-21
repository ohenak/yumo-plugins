# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md (v0.9)
**Date:** 2026-08-21
**Iteration:** 12 (delta confirmation — P-A-7 three-case lead-in / `renderSection` body-knob erratum)

## Overview

**Question asked.** A targeted erratum (v0.8 → v0.9) makes two corrections. The routed one: P-A-7's
lead-in still read *"in the two cases that can arise"* above a table that grew to three rows at v0.8.
The second, not on my item list but landing in the same commit: LI-08's amendment note claimed
`renderSection`'s `ordinal`, `gloss` and `body` are "all three unexercised by any landed suite",
which is false for `body` at HEAD. Does this delta resolve those without breaking what I approved
at v11?

**Answer: yes, and the second correction is the more valuable of the two.** The lead-in now reads
"in the three cases that can arise (A, B and C below)" — the numeral is right and the enumeration is
made explicit, so the sentence no longer has to be reconciled against the table it introduces. The
`renderSection` restatement replaces a false three-way claim with a checkable two-plus-one split, and
I verified every clause of it against HEAD source rather than accepting the changelog's account.
**No High. No Medium. Five Lows, four of them inherited.** Approved with minor changes.

**Delta shape.** `git show ba120270` on the PLAN is four changed lines and nothing else: the version
cell (`0.8` → `0.9`), LI-08's task row, the P-A-7 lead-in sentence, and one appended changelog row.
The case A/B/C table's own cells, the batches-7–13 expected-red ledger, the 23 task rows' `Batch`,
`Deps`, owner and file columns, the file-ownership manifest and every traceability table are
untouched — so the changelog's "no task moved batch, no `Deps` edge changed, no AT partition, fixture
or manifest row was touched, the batches 7–13 ledger is byte-identical, and the case A/B/C table's
own text is untouched" is true clause for clause. I checked each clause against the diff; none is
a claim the diff does not bear out.

**Upstream re-derived at HEAD, per DEC-ERR-03.** All four dispatch digests reproduce exactly on disk
— REQ `ff605dd3…`, FSPEC `ae75fa62…`, TSPEC `22dee8ce…`, DECISIONS `56617f5a…` — and they are
byte-identical to the UPSTREAM-STATE anchors I recorded at v11. No upstream moved under this document
during the round, so nothing this PLAN cites has changed its wording since I last confirmed the
compression. I nonetheless re-read the specific upstream text the edited LI-08 row leans on at HEAD:
TSPEC §D.3's second F-O-1 rule — `SECTION_HEADING_RE` as `/^##[ \t]+(?:\d+\.[ \t]*)?(.*?)[ \t]*$/`,
"**exactly two** `#` characters, so a `###` sub-heading inside a section is body text, not a
boundary", the ordinal as an optional non-capturing group outside the title capture, `GLOSS_RE`'s
trailing-parenthetical strip, and case-sensitive comparison against the five `BR6_SECTION_NAMES`.
LI-08's compression of it — "exactly two `#`, an optional ordinal stripped and discarded (it is not
the priority), an optional trailing gloss, and otherwise exact case-sensitive comparison against
`BR6_SECTION_NAMES`" — is faithful clause for clause, including the parenthetical that the ordinal is
**not** the priority (TSPEC assigns priority by position in `BR6_SECTION_NAMES`, not by the heading's
number). The edit did not touch that sentence and did not put it out of step with upstream.

## Batches

This is where the unlisted half of the delta lands — LI-08's task row — so it gets the closer read.

**The corrected `renderSection` claim, checked clause by clause at HEAD.** The note now reads: the
knobs "already exist — `renderSection` accepts `ordinal` and `gloss`, both unexercised by any landed
suite, and a free-form `body` the landed suites already use (`learningsBlock.test.js` passes `body:`
on all six of its section specs, and `learningsSelect.test.js` passes it on the non-BR-6 section)".
Four checkable assertions, all four true:

- **`ordinal` and `gloss` unexercised.** Grepping both identifiers across `pdlc/workflows/__tests__/`
  outside `helpers/learningsFixtures.js` itself returns nothing. No landed suite passes either.
- **All six of `learningsBlock.test.js`'s section specs pass `body:`.** That suite has exactly one
  `sections:` array, exactly six `name:` keys, and exactly six `body:` keys — the six BR-6-priority
  and non-priority specs from `Process Learnings` through `Non-Convergences`, each carrying its own
  `*_MARKER` body text. "All six" is the exact count, not a round number.
- **`learningsSelect.test.js` passes it on the non-BR-6 section.** That suite has fifteen `sections:`
  arrays and exactly one `body:`, on `{ name: "Not A BR-6 Section", … }` in the `at28-no-material`
  document. Singular, and it is the non-BR-6 one — the note's phrasing is precise on both counts.
- **`renderSection` accepts all three.** The helper's JSDoc declares `section.ordinal`,
  `section.gloss` and `section.body`, with `ordinal` documented as omitted entirely when
  null/undefined. So the "knobs already exist" premise survives the correction intact.

**The correction does not weaken the conclusion it supports — it strengthens it, as claimed.** The
note's point is that the heading-form amendment adds *callers*, not knobs, and therefore is an
amendment to landed files by their existing owners rather than a new spec surface. Under the old
(false) claim the amendment lit up three dormant knobs; under the corrected one it lights up two and
reuses a third that is already in service. That is strictly less new surface, so "not four new knobs"
still holds and holds more easily. The ownership consequence the sentence exists to carry — ownership
does not move, the single-writer manifest is unchanged — is unaffected. This is the right shape for
an erratum: the false clause is replaced with a true one and the argument it fed is re-derived, not
quietly dropped.

**Traceability of the correction back to who raised it.** TE v10 F-01 raised this as Medium with the
exact citations the erratum adopted; PM v10 F-01 raised the same defect as Low, citing the AT-29
contamination corpus in `learningsFixtures.js` instead. Both are pointing at the same false clause,
and the erratum's chosen evidence (the two landed suites) is the stronger of the two, because it
proves the knob is exercised *by a suite* rather than by the fixture builder's own internals. The
changelog credits both. That reconciliation across reviewers is exactly what the tag-selection
discipline asks for.

**Nothing else in §Batches moved, and nothing else went stale.** LI-08's `Batch` cell still reads
`3`, its `Deps` still reads `LI-02`, its owned files still read `__tests__/learningsBlock.test.js`,
and its `Status` still reads ⬚ — the diff touches only prose inside the description cell. I re-checked
the two rows that could have gone stale beside it: LI-02, whose spec surface is where the variant
heading forms are declared, names no knob count and no case letter; LI-12, whose three-case AT-30 is
the other "three cases" phrase in this document, is untouched and unrelated to P-A-7's three cases —
the two threes do not collide, because LI-12's are zero-threshold cases and P-A-7's are commit-timing
cases. No other row references the amendment note's knob count.

## Dependencies

**No `Deps` edge changed, and none could have.** The delta is four lines, none of them in a `Deps`
cell. I extracted the `Deps` column for all 23 task rows at `be64a0c6` (the commit I confirmed at
v11) and at HEAD: identical. The dependency graph is a statement about scheduled work, and this
erratum scheduled nothing.

**The one cross-document dependency worth re-checking, and it moved in the right direction.** At v11
I raised — as a question rather than a finding, because it sat upstream of nothing — that PROPERTIES
§C.4 still read "case B is the live case and case A is unreachable", a reading the PLAN's new case C
superseded. That is now closed from the other end: PROPERTIES moved to v0.7 in this same window and
§C.4 now reads "**case C is the live case** and cases A and B are both behind us", cites case C's
ruling verbatim, marks both of its previously-routed P-A-7 items struck rather than open, and reduces
its "Still open" list from three items to one. So the two documents agree at HEAD about which case
governs, and the agreement was reached by PROPERTIES absorbing the PLAN's ruling rather than by the
PLAN bending to PROPERTIES. That is the correct direction of travel for a PLAN-to-PROPERTIES
dependency, and it means the case-C ruling I approved at v11 is now load-bearing in two documents
with consistent wording in both.

**One version-number lag, and it is not this document's to fix.** PROPERTIES v0.7's Upstream cell
pins `PLAN-pdlc-learnings-injection.md` at **v0.8**; the PLAN is v0.9 as of this erratum. The lag is
harmless in substance — v0.9 changed no text PROPERTIES cites, and the case A/B/C table PROPERTIES
quotes is byte-identical — so PROPERTIES' quotations all still resolve. I note it here so the record
shows I checked it rather than assumed it, and I do not raise it as a finding against this PLAN: a
downstream document's Upstream pin is that document's field to advance, and re-emitting it here would
be raising against the wrong owner.

**The PROPERTIES-driven re-reds still land where case C puts them.** §C.4 continues to route
PROP-BOUND-03's `maxBytesPerDocument <= 0` case, PROP-BOUND-05/07/08 and the Group D amendments to
this PLAN, and now states explicitly that they travel under case C — no ledger row, green at landing,
fix owed before batch 14 if one reds. It also does the honest thing the PLAN's ruling invited: it
names the one arm that may *not* be green at landing (PROP-BOUND-03's zero case, since no
`extractInjectableMaterial(text, 0)` call exists in the landed suite) and shows case C covers that
outcome without a row. The PLAN's ruling and PROPERTIES' application of it are consistent, and
neither depends on anything the v0.9 erratum touched.

## Verification

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
