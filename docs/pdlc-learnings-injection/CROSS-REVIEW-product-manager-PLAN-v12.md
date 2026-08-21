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

### The routed item, checked at HEAD

| Routed item | Disposition at v0.9 | Verified against |
|---|---|---|
| P-A-7's lead-in reads *"in the two cases that can arise"* above a three-row table | **Resolved.** The sentence now reads "named here, ahead of the run they govern, in the three cases that can arise (A, B and C below)". The numeral matches the table, and the added "(A, B and C below)" makes the enumeration explicit rather than leaving the reader to count rows | The table immediately beneath it carries exactly three rows, keyed A, B, C; the closing paragraph's "in **any of the three cases**" already said three at v0.8, so the document is now internally consistent on the count in both places |

**The count is now consistent everywhere.** I grepped the whole PLAN for residual two-case phrasings
— "two cases", "both cases", "either case" — and the only surviving hit is §Changelog's **0.6** row,
which correctly records that the table *was* two cases when v0.6 created it. A changelog describing
the document's past state in the past tense is not a stale numeral; it is the record working. The
0.9 row's own account ("v0.8 grew to **three** rows") is likewise accurate.

**The fix is a numeral, and it does not disturb the ruling underneath it.** This mattered to check:
the lead-in is the sentence that establishes *why* the cases are named ahead of the run they govern
(P-A-7 makes it a live-table edit), and a careless rewrite could have re-scoped that obligation. It
did not — "named here, ahead of the run they govern" is byte-identical, and only the trailing clause
changed. The gate contract the lead-in carries is the same contract I approved at v11.

### What the delta did not break

I re-checked the three properties of the expected-red ledger I have called load-bearing since v10,
and the case-C ruling I approved at v11. All four survive, and none could have been touched:

- **Stated in test names, not suite names, wherever a suite splits across two green tasks** —
  untouched; the paragraph carrying it is byte-identical.
- **Shrinks by exactly the rows the batch's own task greens** — untouched; the delta adds no ledger
  row anywhere, in any case.
- **Reaches empty at batch 13** — untouched; the batch-13 row still reads "**nothing** — the ledger
  is empty".
- **Case C's green-at-landing ruling** — untouched, and its four production clauses still hold at
  HEAD (`SECTION_HEADING_RE`'s ordinal strip, `GLOSS_RE`'s trailing-gloss strip, case-sensitive
  `BR6_SECTION_NAMES` comparison, `###` never matching `^##[ \t]+`). I re-derived these from TSPEC
  §D.3 at HEAD this round rather than carrying the v11 verification forward on trust, because the
  LI-08 row the erratum edited is the row that compresses §D.3.

**One consequence worth stating plainly for the dispatcher.** The corrected `renderSection` claim
does not change what the heading-form amendment must do or when it may land. It still travels under
**case C**: no ledger row, green at landing, fix owed before batch 14 runs if it reds, gate failure if
a red survives into batch 14. The correction changes only the count of dormant knobs the amendment
wakes up — an accuracy fix inside the justification, not a change to the obligation.

### Four seams carried forward, none reachable, none gating

Three are my own v11 Lows, unrouted and therefore untouched by this edit; one is PM v10 F-03, also
unfixed. I re-emit them as **inherited** so they stay visible without gating: they are recorded, not
re-litigated, and each is one clause from closed.

- **Batch 13 ahead of LI-21 (v11 F-01).** Case B is bounded at batch 12; case C opens "once LI-21
  (`92b7ea0c`) has landed". A commit landing in batch 13 *before* LI-21's commit is named by neither.
  Unreachable at HEAD — LI-21 has landed. TE v11 F-02 raised the same seam independently, so this is
  a two-reviewer agreement, not a solo reading.
- **Batches 7 and 8 (v11 F-02).** Case A's *When* says "before batch 7"; case B starts at batch 9.
  A commit landing during batch 7 or 8 is in neither window's literal text, though case A's own
  derivation covers it and yields "no row".
- **Case B's punctuation splice (v11 F-03).** The parenthetical aside opens with an em dash and
  closes with a comma, so the row's object clause reads as a splice in a sentence a dispatcher reads
  for the gate contract.
- **Changelog row inversion (PM v10 F-03).** §Changelog's 0.6 row still sits ahead of its 0.5 row;
  the 0.7, 0.8 and 0.9 rows are all correctly appended in order, so the inversion is a single
  two-row swap away from a monotone table.

### One new inaccuracy the delta introduced

The 0.9 changelog row credits the lead-in fix to "**(PM v10 erratum)**". PM v10 did not raise it —
its three findings are the `renderSection` claim (F-01), case A's batches-4–6 window (F-02) and the
changelog row inversion (F-03), and no PM cross-review in this feature contains the string "two cases
that can arise". The item was raised by **TE v11 F-01**, and confirmed as still-open there. The same
row's *other* attribution, "(TE v10 F-01, PM v10 F-01)" for the `renderSection` correction, is exactly
right — both reviewers did raise that one, at those ids. So the row is one attribution wrong out of
two, in the document's own provenance record. Low, and worth one word's fix (F-01 below).

## Positive Observations

- **The unlisted correction is the one that earns this round.** The routed item was a numeral. The
  `renderSection` clause was a false statement of fact about shipped code, sitting inside the
  justification for who owns an amendment commit — the kind of clause a reader takes on trust because
  it reads like an incidental aside. Fixing it in the same commit, unprompted by the dispatch's item
  list, is the erratum doing more than it was asked to.
- **The replacement clause is checkable, and I checked it.** "Passes `body:` on all six of its
  section specs" and "passes it on the non-BR-6 section" are counts and locations, not impressions —
  six is exactly six, and the non-BR-6 section is exactly the one. A correction that swaps one vague
  claim for another is not a correction; this one swapped a false claim for a verifiable one.
- **It re-derives the conclusion instead of dropping it.** The note explains *why* the corrected
  facts still support "adds callers, not knobs" — two unexercised knobs plus one already in service
  is less new surface, not more. The changelog says "unchanged and strengthened", and that is the
  accurate word for it.
- **It reconciled two reviewers' evidence rather than picking one.** TE and PM raised the same defect
  with different citations; the erratum adopted the stronger evidence (landed suites, not the fixture
  builder's internals) and credited both. That is the tag-selection discipline working at the author's
  end.
- **The lead-in fix adds the enumeration, not just the numeral.** "(A, B and C below)" costs four
  words and makes the sentence self-checking against its table the next time a case is added — which
  is precisely the failure mode that produced this erratum.
- **The changelog is honest about its own blast radius, and the honesty is verifiable.** Every one of
  its six "nothing else changed" clauses is true against the diff. A changelog whose self-description
  survives a line-by-line check is what makes a delta confirmation cheap to run.

## Recommendation

**Approved with minor changes**

The routed lead-in item is resolved, and the unlisted `renderSection` correction is resolved with
better evidence than either reviewer supplied. Upstream is byte-identical to the version I confirmed
at v11 — all four digests reproduce — and I re-derived LI-08's compression of TSPEC §D.3 at HEAD
rather than carrying it forward on trust; it remains faithful. Nothing I approved moved: no task
changed batch, no `Deps` edge changed, no ledger row, AT partition, fixture or manifest row was
touched, the case A/B/C table's cells are byte-identical, and case C's green-at-landing ruling still
holds against shipped code.

Five Lows, none gating. Four are inherited seams carried forward from v10/v11 that this edit did not
touch and was not asked to; one is a single wrong attribution the new changelog row introduced. All
five are one clause or one word each, and they belong in whatever pass next edits these blocks — not
in a round of their own.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | delta | local | The new 0.9 changelog row credits the lead-in fix to "(PM v10 erratum)". PM v10 raised no such item — its findings are the `renderSection` claim (F-01), case A's batches-4–6 window (F-02) and the changelog row inversion (F-03) — and no PM cross-review in this feature contains "two cases that can arise". The raiser was **TE v11 F-01**. The same row's other attribution, "(TE v10 F-01, PM v10 F-01)" for the `renderSection` correction, is correct. Fix: "(TE v11 F-01)" | §Changelog, 0.9 row |
| F-02 | Low | inherited | local | Case B is bounded at batch 12 and case C opens "once LI-21 (`92b7ea0c`) has landed", so a commit landing in batch 13 *ahead of* LI-21's commit is governed by no case. Unreachable at HEAD — LI-21 has landed — so no commit that can now occur reads a wrong gate. Raised at PM v11 F-01 and TE v11 F-02; untouched by this edit. Fix: read case C's domain as "batch 13 or later" | §Verification → Amendment commits on landed suites (P-A-7), case B / case C *When* columns |
| F-03 | Low | inherited | local | Case A's *When* is "before batch 7" and case B begins at batch 9, so a commit landing during batch 7 or 8 is in neither window's literal text — though case A's own derivation (the suite is already ledgered a whole-suite red after batches 7–8) covers it and yields "no row". Raised at PM v11 F-02. Fix: widen case A's cell to "before batch 9", or add the batches-7–8 clause to its derivation, which already names their red reason | §Verification → Amendment commits on landed suites (P-A-7), case A *When* column |
| F-04 | Low | inherited | local | Case B's row opens a parenthetical aside with an em dash ("— a span that is well-formed only while a greening batch remains ahead, which is why case C exists,") and closes it with a comma, so the sentence's object ("the named row `learningsBlock` → …") arrives unseparated and the clause reads as a splice. The contract is correct; only the parse is hard, in a row read for the gate. Raised at PM v11 F-03. Fix: close the dash before "the named row" | §Verification → Amendment commits on landed suites (P-A-7), case B *Expected-red rows it adds* column |
| F-05 | Low | inherited | nonlocal | §Changelog's 0.6 row still sits ahead of its 0.5 row, so the version table is non-monotone; the 0.7, 0.8 and 0.9 rows are all correctly appended in order. Raised at PM v10 F-03, unfixed across two errata. Fix: swap the two rows | §Changelog, 0.5 / 0.6 rows |

FINDING: Low | delta | local | §Changelog 0.9 row | the lead-in fix is credited to "(PM v10 erratum)" but PM v10 raised no such item and no PM cross-review contains "two cases that can arise"; the raiser was TE v11 F-01 — the row's other attribution (TE v10 F-01, PM v10 F-01) for the renderSection correction is correct
FINDING: Low | inherited | local | P-A-7 case B / case C When columns | a commit landing in batch 13 ahead of LI-21's commit is governed by neither case B (bounded at 12) nor case C (opens once LI-21 has landed); unreachable at HEAD, so non-gating — read case C's domain as "batch 13 or later"
FINDING: Low | inherited | local | P-A-7 case A When column | batches 7 and 8 fall in neither case A's "before batch 7" nor case B's "batch 9 through 12", though case A's own derivation covers them and yields "no row"; widen the cell to "before batch 9" or add the clause to the derivation
FINDING: Low | inherited | local | P-A-7 case B Expected-red rows column | the parenthetical aside opens with an em dash and closes with a comma, so the row's object clause reads as a splice; close the dash before "the named row" so the gate contract parses on first read
FINDING: Low | inherited | nonlocal | §Changelog 0.5 / 0.6 rows | the 0.6 row still precedes the 0.5 row, leaving the version table non-monotone while every later row is correctly appended; swap the two rows

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 5}
