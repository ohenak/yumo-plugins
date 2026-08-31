# Cross-Review: test-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.7, bytes unchanged)
**Upstream:** `docs/pdlc-stats/REQ-pdlc-stats.md` (v1.7, sha256:f75c348f…8862)
**Date:** 2026-08-31
**Iteration:** 11 (upstream-cascade confirmation — REQ moved, FSPEC did not)
**Scope:** Local

## Overview

FSPEC's own bytes did not move this round. The question is narrow: does FSPEC v1.7 still faithfully
compress REQ as REQ now stands, after the v1.7 erratum
(`git show e12b78fd8 -- docs/pdlc-stats/REQ-pdlc-stats.md`, 12 insertions / 3 deletions)?

My v10 approval was recorded against REQ sha256:5f3e805…ed9f8, which is REQ **v1.6**
(`git show 1847dd9c0:docs/pdlc-stats/REQ-pdlc-stats.md | shasum -a 256`), not the v1.4 the FSPEC
header still names. So the REQ movement this confirmation must absorb is exactly v1.6 → v1.7 and
nothing earlier: the v1.5/v1.6 halt-state churn (REQ-STATS-05 harvested → `0`) was already inside
the base I approved.

The v1.7 edit touches two sites: the status block (1.6 → 1.7 plus an erratum paragraph) and one
sentence inside REQ-STATS-06. The sentence withdrawn read *"The predicate is set-membership over
C-4's grammars, so a grammatical basename outside the driver's document-type catalogue is a survivor
even where REQ-STATS-03 reports it malformed."* The sentence that replaced it says such a basename
"contributes no process bytes and counts as no file of its family remaining: a feature whose only
`CROSS-REVIEW-` basenames are of that shape reports **harvested**, not a measured ratio."

That is the direction FSPEC already took. The erratum moved REQ **toward** the approved FSPEC, not
away from it, so the cascade risk here is the inverse of the usual one: not "FSPEC now overclaims"
but "FSPEC may now be redundant or under-cited". I checked for both.

## Linked Requirements

REQ-STATS-06 is the only acceptance criterion whose text changed, and §3.1's trace row maps it to
§4.2 BR-14, BR-15, BR-16 and to AT-15, AT-16, AT-17. Those four anchors are the whole blast radius;
I re-read each against current REQ bytes rather than against my v10 notes.

| Upstream (REQ v1.7) | FSPEC anchor | Still faithful? |
|---|---|---|
| REQ-STATS-06 harvested predicate (LEARNINGS + one review family entirely absent) | BR-16 sentence 1 | Yes — unchanged by the erratum |
| REQ-STATS-06 "evaluated over exactly the file set whose bytes the process side sums" | BR-16 sentence 2 | Yes — near-verbatim |
| REQ-STATS-06 out-of-catalogue basename ⇒ no file of its family remaining ⇒ **harvested** | BR-16 sentence 3, AT-17 leg 4 | Yes — this is the clause the erratum aligned to |
| REQ-STATS-06 zero spec bytes ⇒ not-available | BR-15, EC-12 | Yes — untouched upstream |
| REQ C-5 fidelity (no independent parsing rule) | BR-06, D-8, §7.3 E-3 | Yes — C-5 §4 line 121 unchanged |
| REQ-STATS-03 malformed disposition of `CROSS-REVIEW-{role}-REVIEW-v{N}.md` | BR-06, AT-09 | Yes — REQ-STATS-03 still names those basenames and settles one label |

No FSPEC anchor cites a REQ clause the erratum deleted. The withdrawn "survivor" sentence was never
quoted or leaned on anywhere in FSPEC — I grepped the document for `survivor` and it does not occur.
That is what makes this a clean cascade: FSPEC never encoded the clause that was withdrawn, so its
withdrawal removes a contradiction rather than a foundation.

## Behavioral Flow

§3.2 Flow B step A7 computes the ratio via BR-14…BR-16 and reaches the zero-denominator branch
(BR-15) only after the harvested branch (BR-16) has been evaluated. The erratum does not add,
remove or reorder a branch: it fixes the **value** one existing leaf produces for one input class
(only-out-of-catalogue cross-review basenames), and that leaf already produced `harvested` in FSPEC.
The branch inventory a test author derives from Flow B is therefore identical before and after, so
no flow-level oracle is reopened and no new test level is implied.

Worth stating explicitly for the downstream reader: the input class in question is reachable at unit
level from a fixture directory alone — no process boundary, no CLI invocation — so nothing in this
cascade pushes a test up the pyramid.

## Business Rules

**BR-16 is the load-bearing rule, and it now reads as a compression of REQ v1.7 rather than a
decision ahead of it.** Side by side:

- REQ v1.7: "evaluated over exactly the file set whose bytes the process side sums, so a basename the
  driver's document-type catalogue does not recognise … contributes no process bytes and counts as no
  file of its family remaining".
- FSPEC BR-16: "It is evaluated over exactly the file set BR-14's numerator sums, so the two never
  disagree: a basename failing a grammar contributes no bytes to the process side and counts as no
  file remaining."

The one wording gap I probed is that REQ says *"the catalogue does not recognise"* where FSPEC says
*"failing a grammar"*. Those are the same set only if FSPEC's "grammar" is catalogue-bound, and it
is, stated in the document rather than inferred: BR-06 says "Grammatical-but-out-of-catalogue
basenames are included in 'fails the grammar'", and names the four files in
`docs/completed/pdlc-advisory-wave-gate/` as the instance. So BR-16's predicate and REQ-STATS-06's
predicate select the same files. No divergence to file.

**The measured/harvested claim about the cited directory survives the erratum — verified at HEAD, not
assumed.** BR-16 says that directory "carries four of them **alongside** grammar-matching
cross-reviews and so reports a measured ratio itself; only the shape is borrowed, not the verdict".
Under REQ v1.7 the four out-of-catalogue files contribute nothing, so the verdict turns entirely on
what else is there. Listing it: `LEARNINGS-pdlc-advisory-wave-gate.md` is present, and **both**
review families have grammar-matching survivors — catalogued `CROSS-REVIEW-{role}-{TSPEC,PLAN,
PROPERTIES,DECISIONS,REQ,FSPEC}-v{N}.md` files, and `CODE_REVIEW-pdlc-advisory-wave-gate-v{1,2}.md`.
Neither family is entirely absent, so BR-16's predicate is false and the directory reports measured.
The count is four (`ls … | grep -c -- '-REVIEW-v'` → 4), matching BR-06, AT-09 and BR-16.

This matters for testability rather than for prose accuracy: BR-16's citation is the fixture source
for AT-09 and AT-15, and if the erratum had flipped the cited directory's own verdict, two acceptance
tests would have been silently reading a fixture whose expected value moved. It did not.

**BR-14 and BR-11 unchanged and still consistent.** BR-14's process-side enumeration is stated over
the three basename grammars, not over a `CROSS-REVIEW-*` glob, which is precisely the property REQ
v1.7's new sentence now asserts upstream. BR-11 (DoD family) was untouched by the erratum and pins
the same shape on the `CODE_REVIEW-` side.

## Edge Cases and Error Scenarios

§7.3's settled-record table (E-1…E-5) is the section most exposed to a REQ version moving, because
every row asserts *"closed at REQ v1.4"*. I re-checked each row's claim against REQ v1.7 bytes, since
a row is only settled while the upstream sentence it credits still exists:

- **E-1** — REQ-STATS-04/06 harvested predicates scoped to the documented basename grammars. Still
  true, and the erratum strengthens it: REQ-STATS-06 now states the file-set identity explicitly.
- **E-2** — C-5 carves out post-mortem discovery. C-5 (§4) is byte-identical; REQ-STATS-05's marker
  fidelity clause is byte-identical.
- **E-3** — REQ-STATS-03 decides the `-REVIEW-v{N}` label as malformed, one label standing. Still
  present verbatim upstream, and the erratum's rationale cites this row's logic as one of its three
  grounds, so the two now agree rather than merely coexist.
- **E-4** — REQ-STATS-09's *Given* scoped to a present, readable `docs/` root. Untouched.
- **E-5** — REQ-STATS-07's readable-but-empty directory is a normal row, not a gap. Present verbatim
  in REQ-STATS-07 at HEAD.

No row of §7.3 became stale, and none should have been reopened: the erratum resolved a
REQ-internal contradiction, not a REQ-vs-FSPEC one.

EC-13 (LEARNINGS present **and** spec bytes zero → `harvested`, not `n/a`) depends on BR-16 winning
the precedence race against BR-15. The erratum widens the set of inputs that reach BR-16's true
branch; it does not touch the precedence, and EC-13's stated expected value is unchanged. EC-07
(LEARNINGS present, no cross-reviews) is likewise unaffected — that input class was already
harvested on both sides.

## Acceptance Tests

No acceptance test needs to change, and — more usefully for the next phase — **the test that would
have caught the old REQ/FSPEC disagreement already exists and now has upstream backing.**

**AT-17 leg 4** is that test. Its fourth directory holds `LEARNINGS-{feature}.md` and intact
`CODE_REVIEW` files, and its only `CROSS-REVIEW-` basenames are out-of-catalogue
`CROSS-REVIEW-{role}-REVIEW-v{N}.md`; the *Then* asserts that directory reports `harvested`, "not a
measured ratio, because files whose bytes BR-14 refuses are equally files BR-16 does not count as
remaining". Read against REQ v1.6 that leg pinned a behaviour the REQ's survivor clause denied — a
test asserting the opposite of its own upstream criterion. Read against REQ v1.7 it is a direct
transcription. The oracle is positive-presence (the exact token `harvested`), not an absence-only
`!= measured`, so it is falsifiable in the direction that matters: an implementation that globbed
`CROSS-REVIEW-*` would compute a ratio and go red here.

**AT-15** remains the byte-agreement oracle and is unaffected in substance: its neither-list includes
the out-of-catalogue cross-review "whose bytes reach neither side, so an implementation that globs
`CROSS-REVIEW-*` into the process total fails here (BR-14, BR-16)". REQ v1.7's "contributes no
process bytes" is now the upstream sentence AT-15 transcribes; before the erratum, AT-15 was
consistent with REQ-STATS-06's *first* half and contradicted by its *last* sentence.

**AT-09** pins the malformed disposition on the real
`docs/completed/pdlc-advisory-wave-gate/` directory, naming all four basenames. Its fixture is a
live repository directory, so I re-verified the count at HEAD rather than trusting the document: four
files, exactly the names AT-09 lists. The erratum does not move AT-09's expected values because
malformed classification (REQ-STATS-03) was never the clause in dispute.

**AT-16 / AT-12** (measured ratio, DoD harvested) are untouched: neither exercises the
out-of-catalogue input class.

One consequence worth naming for the downstream reader, since it is a coverage fact rather than a
defect: with REQ v1.7 landed, AT-17 leg 4 and AT-15's neither-list are now the **only** two oracles
standing between the implementation and a `CROSS-REVIEW-*` glob, and they attack it from opposite
sides — one on the verdict, one on the byte total. Both are unit-reachable from fixture directories.
That is adequate coverage; PROPERTIES already carries PROP-RATIO-08 leg 4 as the property-level
counterpart, so no new test is owed by this cascade.

## Open Questions

None blocking. One record item is filed below as F-01 rather than left as a question, because the
answer is not in doubt — the header field is simply behind.

## Positive Observations

- **The erratum was decided, not reconciled, and it decided in the direction the tests already
  pointed.** Withdrawing the survivor clause rather than adding a carve-out means no new rule entered
  REQ, so C-5's no-independent-parsing-rule constraint is not stressed and no new oracle is owed.
- **A REQ/FSPEC contradiction that had already been encoded in three downstream artifacts (FSPEC
  BR-16, AT-17 leg 4, PROP-RATIO-08 leg 4) resolved without any of the three moving.** That is the
  cheap outcome, and it is cheap because the downstream chain had been internally consistent.
- **The replacement sentence states a mechanism, not just a verdict** — "contributes no process bytes
  and counts as no file of its family remaining" — which is what makes BR-16's "the two never
  disagree" checkable rather than asserted.

## Recommendation

**Approved with minor changes**

FSPEC v1.7 still holds against REQ as it now stands. The erratum removed the one upstream sentence
that contradicted BR-16, AT-17 leg 4 and AT-15, and every other REQ clause FSPEC cites — C-5,
REQ-STATS-03's malformed disposition, REQ-STATS-07's zero-state row, REQ-STATS-09's scoped *Given* —
is present at HEAD in the form FSPEC compresses. No High finding is open anywhere in the document.
The single Low finding is a header record pointer, non-gating, fixable in one line at the next edit
of FSPEC; it does not touch a rule, an oracle or an expected value.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | inherited | nonlocal | The FSPEC header's `Upstream` field pins `REQ-pdlc-stats.md (v1.4)`, but this FSPEC was approved at v10 against REQ **v1.6** (sha256:5f3e805…ed9f8) and is confirmed here against **v1.7**. REQ-STATS-05's halt state moved twice and REQ-STATS-06 once across v1.4→v1.7, so a TSPEC/PLAN author trusting the pin would derive from a REQ that no longer exists. Not gating: the authoritative record is the `UPSTREAM-STATE` anchor in the cross-review chain, and no FSPEC rule or oracle depends on the field. Suggest bumping it to `(v1.7)` at the next FSPEC edit. The five "closed at REQ v1.4" credits in §7.3 are historical statements and correctly stay as they are. | Header metadata block (`Upstream` row) |

FINDING: Low | inherited | nonlocal | FSPEC header `Upstream` field pins REQ v1.4; REQ is v1.7 and the approval base was v1.6 — record pointer only, no rule or oracle depends on it | Header metadata block (`Upstream` row)

## Verdict
