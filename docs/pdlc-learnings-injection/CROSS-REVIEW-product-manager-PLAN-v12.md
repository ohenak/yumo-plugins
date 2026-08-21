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

## Dependencies

## Verification

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
