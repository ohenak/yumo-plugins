# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md (v1.1)
**Date:** 2026-08-21
**Iteration:** 13 (delta re-review under DECISION FREEZE)

## Overview

**What this round is.** A delta re-review under DECISION FREEZE, not a fresh read. I approved this
PLAN at v0.5 (round 8), v0.6 (round 9), v0.7 (round 10), confirmed v0.8 (round 11) and v0.9
(round 12, three Low findings, no High). Since the commit I last reviewed (`ba120270`) the document
has moved to **v1.1** across six commits: one substantive addition (DoD 14, at v1.0) and four
targeted edits applying round-11 findings — mine and pm-review's — to P-A-7's case headers and to
P-A-6.

**The delta, measured.** `git diff ba120270 -- …/PLAN-…md` is **8 insertions, 5 deletions in one
file**. I re-derived the scope from the diff rather than from the changelog's account of itself:
the version cell (0.9 → 1.1), P-A-7's case A / B / C rows, the new DoD clause 14, P-A-6's answer
cell, and two changelog rows. **No task row moved batch, no `Deps` edge changed, no AT partition,
fixture or single-writer manifest row was touched, and the batches 7–13 expected-red ledger is
byte-identical** (lines 467–476 of the current file are unchanged by the diff). The v1.0 and v1.1
changelog rows each claim exactly that, and both claims are accurate against the diff.

**My two open findings from round 12 are resolved; one is not.**

- **F-02 (batch 13 claimed by no case header) — resolved.** Case C's domain now reads *"batch 13 or
  later, the case that is live at HEAD"* with the *When* cell stating the domain **by batch number
  rather than by LI-21's commit**, and saying why: "so that no batch falls between case B's upper
  bound (12) and this case". The tiling is now closed on both ends — case A covers "before batch 9
  (which includes batches 7 and 8)", B covers 9–12, C covers 13 and later.
- **F-03 (P-A-6's foreclosed fallback) — resolved.** P-A-6 no longer offers case B's
  amend-into-the-ledger-by-name route unconditionally; it routes to "**P-A-7's governing case** —
  which at HEAD is case C, where no ledger remains to amend into and the obligation is
  green-at-landing", and names case B's closure at batch 12.
- **F-01 (the v0.7 changelog row's stale `renderSection` claim) — still open, unedited.** The row
  still reads "`renderSection` already carries unexercised `ordinal`, `gloss` and `body` knobs" in
  the present tense, which the 0.9 row and LI-08's note both now correct. Carried forward below as
  Low, unchanged in severity: it is a historical-record row, and a reader who reads forward reaches
  the right fact.

**What the delta newly introduces.** DoD 14 is the only substantive addition, and it is a
**disclosure clause, not a new obligation**: it names four POSTMORTEM-D remediations riding on this
branch, names the test that owns each, and explicitly declines to widen the DoD ("clauses 1–13
remain the injection region's bar"). Every one of its four factual claims about HEAD is checkable,
and I checked all four (see §Verification). All four hold.

**One new Low, and it is not this delta's doing.** Upstream moved while this round was in flight —
REQ to v0.10, FSPEC to v0.14, DECISIONS to v0.5 — and this PLAN's header still pins REQ v0.9 /
FSPEC v0.13 / DECISIONS v0.3. TSPEC and DECISIONS have both already re-pinned. The substance the
PLAN cites is unaffected (see §Dependencies), so this is a pin refresh, not a cascade.

**Result. No High finding, old or new.** Two Low: the carried v0.7 changelog row, and the stale
upstream pins.

## Batches

**No task row changed, so the batch DAG is out of scope by measurement rather than by assertion.**
The diff touches P-A-7's three case rows, DoD 14, P-A-6 and two changelog rows — none of them a
task row. All twenty-two `LI-*` rows keep their `Batch` value, their `Deps` cell, their
file-ownership cell and their `Status` cell byte-for-byte; the `[Fake first]` labelling on LI-02,
LI-06 and LI-23, the red-before-green pairing, and the single-writer file manifest are unchanged
from the v0.9 bytes I confirmed at round 12. I re-ran the batch-derivation only far enough to
confirm the diff could not have perturbed it, and it could not: not one `|` cell inside the task
table is on either side of the diff.

**The expected-red ledger, my lens's primary gate input, is byte-identical.** Rows for batches 7
through 13 are unchanged: batch 7 → seven whole suites red; batch 8 → `learningsSelect` narrowed to
`LI-AT-15` only; batch 9 → `learningsBlock` dropped entire; batch 11 → `learningsRecord` narrowed
to `LI-AT-22`'s locus-2 assertion; batch 12 → `learningsDispatchSet` narrowed to `LI-AT-23`,
`LI-AT-24`, `LI-AT-31`; batch 13 → **nothing**. The three load-bearing properties stated beneath it
(stated in test names not suite names, shrinking by exactly what the batch's task claims to green,
empty at batch 13) are likewise untouched.

**Case A's new *When* cell, checked against that ledger rather than against its own prose.** The
cell now reads *"before batch 9 (which includes batches 7 and 8)"* where v0.9 read *"before batch
7"*. The claim it rests on — that batches 7 and 8 are "exactly the ones whose ledger already lists
`learningsBlock` as a whole-suite red" — is true at the table: the batch-7 row lists
`learningsBlock` among seven whole suites, the batch-8 row lists it among six, and the batch-9 row
drops it. So a heading-form amendment landing during batch 7 or 8 is already covered by an existing
whole-suite red row and owes no new row, which is exactly what case A's Effect cell concludes. The
widened header does not change the outcome for any batch; it changes which clause **states** the
outcome, moving batches 7–8 from a derivation buried in the Effect cell to the header itself. That
is a strict improvement in a rule table a dispatcher reads by header.

**No overlap was created at the seam.** Case A now ends at "before batch 9" and case B opens at
batch 9; case B's title conjunct ("after LI-17 has greened the suite") is consistent with the
ledger, since LI-17 is the batch-9 task that drops `learningsBlock` from the ledger entire. A and B
are disjoint, B and C are disjoint at 12/13, and every batch from 1 to 14 is now claimed by exactly
one case.

**DoD 14 adds no task row and no test obligation.** I checked this specifically, because a DoD
clause that names four pieces of shipped work is one edit away from becoming an implicit
twenty-third task. It does not: the clause says in terms that the four remediations are "not owned
by an `LI-*` task row", are "process repairs, not feature work", "carry their own tests, named
above", and that "clauses 1–13 remain the injection region's bar". The file-ownership manifest is
unchanged, so no new file enters the single-writer contract, and no batch acquires a new gate.

## Dependencies

## Verification

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
