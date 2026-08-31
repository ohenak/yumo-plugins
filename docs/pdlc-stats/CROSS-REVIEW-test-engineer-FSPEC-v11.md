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

## Acceptance Tests

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
