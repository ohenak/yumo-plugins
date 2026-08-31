# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.7)
**Upstream:** `docs/pdlc-stats/REQ-pdlc-stats.md` (v1.4)
**Date:** 2026-08-31
**Iteration:** 10 (delta re-review, decision freeze)
**Scope:** Local

## Overview

Delta under review: `git diff b3bb4c5d1..HEAD -- docs/pdlc-stats/FSPEC-pdlc-stats.md` — 9 insertions,
4 deletions across four sites (changelog, BR-16, §8 BR→AT table, §7.3 row E-5). No business rule
changed, no acceptance test added, weakened or deleted. The three sites are exactly the three
findings I filed in v9; the changelog paragraph records them.

| Site | Change | Answering |
|---|---|---|
| Changelog | v1.7 entry, three record corrections | — |
| §4.2 BR-16 | "carries two of them" → "carries four of them" | TE v9 F-01 |
| §8 BR→AT | `BR-16 \| AT-17` → `BR-16 \| AT-15, AT-17` | TE v9 F-02 |
| §7.3 E-5 | `BR-27, AT-19` → `BR-27, AT-20, AT-26` | TE v9 F-03 |

## Linked Requirements

Traced upstream anchors touched by the delta: REQ-STATS-06 (BR-16's harvested/measured split),
REQ-STATS-07 (E-5's zero-state row), REQ-STATS-03 / C-5 (BR-06's malformed disposition, cited by the
new BR-16 wording). None of the three edits moves a requirement boundary; each corrects a pointer or
a count inside prose whose rule was already approved at v1.6.

## Behavioral Flow

§3.1 A5 and §3.2 Flow B are byte-identical in this delta. No step, branch or ordering changed, so no
flow-level oracle is re-opened.

## Business Rules

**BR-16 count corrected and verified at HEAD.** `docs/completed/pdlc-advisory-wave-gate/` holds
exactly four out-of-catalogue basenames — `CROSS-REVIEW-{product-manager,test-engineer}-REVIEW-v{1,2}.md`
— confirmed by directory listing, not by document. The document is now internally consistent on this
number in all three places it appears: BR-06 ("Four such files sit in …"), AT-09 ("all four basenames
appear in the malformed list by name") and BR-16 ("carries four of them"). The load-bearing half of
the sentence — that the directory reports a *measured* ratio and only the basename shape is borrowed,
not the verdict — was already verified at v9 and is unchanged.

The changelog's supporting claim, "as BR-06 and AT-09 already state", is true: both carried four
before this delta, which is what made the BR-16 count a record slip rather than a rule disagreement.

## Edge Cases and Error Scenarios

§7.3 row E-5's oracle citation now names AT-20 and AT-26 instead of AT-19. Checked against the AT
bodies rather than the trace table alone:

- **AT-26** is the zero-state oracle: readable empty `docs/{feature}/` → all six review-round rows
  read `0`, DoD rounds `0`, halts empty, ratio `n/a`, exit 0, and in fleet mode "a normal row,
  carrying no gap marker and no reason string (EC-03, BR-27)". This is a positive-presence oracle
  with a negative conjunct riding on it, not an absence-only assertion.
- **AT-20** carries the complementary half: an unreadable directory is a named gap row with a reason
  while every other feature reports normally, exit 0 (BR-27), plus the EC-21 catch-all leg.
- **AT-19** pins the exclusion set (BR-23/BR-26/EC-10), which is a different claim. The old citation
  pointed at a test that would not fail if the zero-state row regressed.

§8's `BR-27 | AT-20, AT-26, AT-27` row already named these, so the delta closes a divergence between
§7.3 and §8 rather than creating one. §3.1's REQ-STATS-07 row (`AT-18, AT-19, AT-20, AT-26, AT-27`)
remains a superset and stays correct.

## Acceptance Tests

**§8 BR→AT set-equality restored for BR-16.** AT-15's *Then* asserts BR-16 explicitly — "including
the out-of-catalogue cross-review, whose bytes reach neither side, so an implementation that globs
`CROSS-REVIEW-*` into the process total fails here (BR-14, BR-16)". With `BR-16 | AT-15, AT-17` the
trace table now set-equals the ATs that actually pin BR-16, so PROPERTIES and PLAN deriving test tasks
from §8 will not drop AT-15's half of the agreement claim. Nothing was added to the row that AT-15
does not assert, so the edge is real in both directions.

Re-checked that the delta did not disturb the properties that make AT-15 load-bearing: the nine-member
arithmetic, the non-skippable removal probe that makes the assertion set-equality rather than
containment, and the link-size leg (EC-19) are all byte-identical. AT-09's `TSPEC` row still reads
`6`, matching the six `CROSS-REVIEW-test-engineer-TSPEC-v{1..6}.md` files present in the cited
directory at HEAD.

No implementation echoes were introduced: every expected value in the touched region is a literal
transcription (four, `0`, `n/a`), none derived from code under test.

## Open Questions

None. The delta is self-contained and every claim it makes is checkable against the tree, which I did.

## Positive Observations

- **All three corrections were verified against the repository, not copied from the prior review.**
  The count landed at four — the number the directory actually holds and the number BR-06/AT-09
  already used — rather than deleting the awkward clause.
- **The E-5 fix chose the oracle, not the nearest AT id.** Repointing at AT-20/AT-26 makes §7.3 cite
  a test that would go red if the zero-state row regressed; the old citation would not have.
- **Zero oracle churn.** No AT text changed at all this round. A record-correction round that touches
  no assertion is exactly the right shape for a frozen round.

DEFERRED: AT-15's neither-list carries four distinct shapes but its removal-invariance clause is
phrased over a singular "adding a file on neither list"; asserting it over all four is extra coverage,
not a defect.

## Recommendation

**Approved**

All three v9 findings are resolved and independently re-verified at HEAD. The delta introduced no
defect, contradicts nothing in the repository or in REQ v1.4, and left every acceptance-test oracle
untouched. No High finding is open anywhere in the document.

## Delta-Confirmation Findings

No findings.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
