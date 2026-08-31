# Cross-Review: software-engineer — FSPEC (delta re-review)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.7)
**Upstream pinned:** `docs/pdlc-stats/REQ-pdlc-stats.md` (v1.4)
**Date:** 2026-08-31
**Iteration:** 10 (delta re-review, decision freeze)

## Overview

My v9 was **Needs revision** on one High finding: BR-16's new provenance sentence said the cited
real directory carries "two" out-of-catalogue cross-reviews where HEAD carries four, contradicting
this document's own BR-06 and AT-09. This round is `d3843cfe7` (FSPEC v1.7), and
`git diff b3bb4c5d1..HEAD -- docs/pdlc-stats/FSPEC-pdlc-stats.md` is **9 insertions / 4 deletions
across four sites** — the smallest delta this document has taken:

| Site | Change | Routed from |
|---|---|---|
| Header changelog | `1.6` → `1.7` plus a v1.7 revision paragraph | Record the round |
| §4.2 BR-16 | `carries two of them` → `carries four of them` | **my v9 F-01 (High)**, TE v9 F-01 |
| §8 BR→AT table | `BR-16 \| AT-17` → `BR-16 \| AT-15, AT-17` | TE v9 F-02 |
| §7.3 row E-5 | `BR-27, AT-19` → `BR-27, AT-20, AT-26` | TE v9 F-03 |

My blocking finding is resolved, and I re-grounded the corrected claim against the tree rather than
against the round's account of it. Under the freeze I checked the four changed sites, the claims
they make about the repository, and the enumerations those edits could have unbalanced. No business
rule body, exit code, enum token, JSON field or acceptance-test *Then* moved: the only diff line
inside a rule is the single numeral in BR-16, and no `AT-*` definition line appears in the diff at
all.

## Business Rules

**My v9 F-01 is resolved, and the corrected count is right against the tree.** BR-16 now reads that
`docs/completed/pdlc-advisory-wave-gate/` "carries **four** of them **alongside** grammar-matching
cross-reviews and so reports a measured ratio itself". I re-counted at HEAD rather than trusting the
fix: the directory holds exactly four files of shape `CROSS-REVIEW-{role}-REVIEW-v{N}.md` —
`CROSS-REVIEW-product-manager-REVIEW-v{1,2}.md` and `CROSS-REVIEW-test-engineer-REVIEW-v{1,2}.md` —
and all four are on `origin/main` (`git ls-tree origin/main`), not branch artifacts, so the citation
rests on stable ground. The document is now internally consistent as well: §4.2 BR-06's "Four such
files sit in `docs/completed/pdlc-advisory-wave-gate/`" and AT-09's "all four basenames appear in
the malformed list by name" agree with BR-16 rather than contradicting it. The fix went to BR-16
alone, which was the direction v9 asked for — BR-06 and AT-09 were correct and did not move.

**The load-bearing half of the sentence is unchanged and still holds.** The shape-not-verdict
distinction — borrow the malformed *basename shape* from that directory, not a `harvested` verdict
— is what TE v7 F-02 originally asked for, and it survives the count correction because the count
was never what carried it. I re-verified the predicate at HEAD: `LEARNINGS-pdlc-advisory-wave-gate.md`
is present, but neither harvest-deleted family is empty (grammar-matching cross-reviews remain in
quantity, and both `CODE_REVIEW-pdlc-advisory-wave-gate-v{1,2}.md` remain), so `harvested` is false;
all six BR-14 spec documents are present, so BR-15's `n/a` does not fire either. The directory does
report a measured ratio, exactly as the sentence says.

**No rule changed, as the changelog claims.** BR-16's predicate is byte-identical outside the
numeral: `harvested` still fires when `LEARNINGS-{feature}.md` is present and at least one
harvest-deleted process family is entirely absent, still evaluated over BR-14's numerator set,
still ordered before BR-15's zero-denominator test. The `CODE_REVIEW-{feature}-draft.md` clause and
the harvest-asymmetry rationale carry across untouched. The self-certification "three record
corrections, no rule changed" is accurate against the diff, not merely asserted by it.

## Acceptance Tests

**No acceptance test moved.** The diff carries no `AT-*` definition line — AT-15, AT-17, AT-09 and
every other test are byte-identical to the bytes I approved the oracle content of in v9. What moved
is the §8 trace table's *record* of which tests pin BR-16, so that is what I checked.

**The `BR-16 | AT-15, AT-17` edge is earned, not decorative.** AT-15's *Then* names BR-16 in its own
words — the out-of-catalogue cross-review's "bytes reach neither side, so an implementation that
globs `CROSS-REVIEW-*` into the process total fails here (BR-14, BR-16)". Before this round the
table claimed AT-17 alone pinned BR-16, which understated the coverage a te-author or PLAN task
would derive from §8. The added edge now matches the assertion that exists.

**The edge set-equals, in both directions.** I swept every `BR-16` mention inside §6's acceptance
tests: exactly two tests assert it, AT-15 (§6.6) and AT-17 (§6.6), and the row now lists exactly
those two — no missing edge and no edge for a test that does not assert the rule. §2's requirement
trace row for REQ-STATS-06 independently agrees (`BR-14, BR-15, BR-16 | AT-15, AT-16, AT-17`), so
the two trace tables do not now disagree with each other. This is the failure mode the edit was
most exposed to: adding one edge to a table whose value is set-equality can leave a second table
stale, and it did not here.

**AT-15's own counts survive untouched.** The `nine` (six BR-14 spec documents plus three process
families) and the non-skippable removal probe that makes AT-15 set-equality rather than containment
are byte-identical; the out-of-catalogue file remains on the neither-list, deliberately outside the
nine. Nothing in this round's edits perturbs the arithmetic I verified in v9.

## Edge Cases and Error Scenarios

**No edge-case row changed**, and the one row this round's subject matter touches stays consistent.
EC-05 — a `CROSS-REVIEW-`-prefixed basename outside BR-09's six types, "including the pipeline's own
`CROSS-REVIEW-{role}-REVIEW-v{N}.md`" — is byte-identical and still agrees with the corrected BR-16
and with AT-15: excluded from every round count, listed as malformed, exit column `0`. EC-12
(`n/a` on zero denominator), EC-13 and EC-19 (a link contributes its own size) are untouched.

**§7.3 row E-5's re-citation is a record correction and it is correct.** E-5's "FSPEC sites that
stand unchanged" column previously read `BR-27, AT-19`; it now reads `BR-27, AT-20, AT-26`. I
checked the three tests rather than the table: AT-19 pins the fleet-mode *exclusion set*
(BR-23/BR-26), not the zero-state row, so it was the wrong citation. AT-26 is the zero-state oracle
by name — "an empty feature directory is a measurement, not a gap", asserting all six round rows
`0`, DoD `0`, halts empty, ratio `n/a`, exit `0`, and a normal fleet row carrying no gap marker
(EC-03, BR-27) — and AT-20 asserts the gap-row-is-a-row half of BR-27 that E-5's erratum was about.
§8's own `BR-27 | AT-20, AT-26, AT-27` row names both, so the correction moves E-5 into agreement
with the trace table instead of away from it.

**AT-19 is not orphaned by the removal.** It remains cited by §8's BR-23 and BR-26 rows and by §2's
REQ-STATS-07 requirement-trace row, so dropping it from E-5's record column removed a wrong
citation without dropping a test out of the trace. E-5 citing two of BR-27's three tests rather
than all three is fine — the column records the sites standing behind that erratum, not BR-27's
full oracle set, and AT-27 (unreadable directory) is a different case from the zero-state one E-5
raised.

## Open Questions

None. Nothing in this round is undecided, and I open no new decision under the freeze.

## Delta-Confirmation Findings

No findings.

## Findings

No findings. My v9 F-01 (High) is resolved at §4.2 BR-16 and verified against the repository at
HEAD; the two record corrections routed from the test-engineer's v9 land correctly and disturb no
enumeration.

## Positive Observations

- **The fix went exactly where v9 said and nowhere else.** The tempting repair for "one document,
  two counts" is to move whichever site is nearest the edit. This round moved BR-16 alone and left
  BR-06 and AT-09 — the two sites that were already right, one of them an oracle verified green
  against the real directory — untouched. A one-word diff inside a rule body is the correct blast
  radius for a false numeral.
- **The trace-table edge was added rather than the assertion removed.** AT-15 gained its BR-16
  assertion in v1.6 without the matching §8 edge; the cheap resolution is to delete the assertion.
  Adding the edge keeps the coverage and makes §8 set-equal to the tests that actually assert
  BR-16, which is what downstream PROPERTIES and PLAN tasks read.
- **E-5's re-citation replaced a wrong test with the right two, not with more tests.** AT-19 pinned
  a different rule; the correction names the oracles §8 already attributes to BR-27 and stops
  there, so the record column stayed a record rather than growing into a second trace table.
- **The changelog is checkable and checks out.** "Three record corrections, no rule changed" is
  falsifiable against the diff, and the diff carries no rule body, exit code, enum token or `AT-*`
  definition line. Self-certifications that survive verification are what make a delta round cheap
  to review.

## Recommendation

**Approved** — no findings.

The single High finding that blocked v9 is resolved at its named site and the corrected claim is
true at HEAD: `docs/completed/pdlc-advisory-wave-gate/` carries four out-of-catalogue
`CROSS-REVIEW-{role}-REVIEW-v{N}.md` files on `origin/main`, and BR-06 and AT-09 — both correct and
both untouched — now agree with BR-16 instead of contradicting it. The two record corrections are
sound: §8's `BR-16 | AT-15, AT-17` edge matches the two acceptance tests that actually assert BR-16
and set-equals in both directions, and §7.3 row E-5 now cites the zero-state oracles §8's BR-27 row
names. No rule, exit code, enum token, JSON field or acceptance-test oracle moved.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
