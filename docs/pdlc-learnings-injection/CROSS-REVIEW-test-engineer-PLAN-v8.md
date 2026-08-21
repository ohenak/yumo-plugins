# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md (v0.5)
**Date:** 2026-08-20
**Iteration:** 8 (delta re-review of v7's findings)

## Overview

**Scope of this round.** v7 was an upstream-cascade confirmation against FSPEC v0.13 whose PLAN bytes
had not moved; it carried one High (F-01) and three Mediums. PLAN has since moved v0.4 → v0.5 across
six commits (`96cf89a5`, `3d6b0972`, `af975290`, `f6570869`, `c15f24c1`, `7bcbce64`) — 20 insertions,
21 deletions, all inside rows and tables I had already read. I re-read only those, plus the upstream
each edit cites.

**Result.** All four prior findings are resolved, and resolved against upstream that has since
landed the absorption I asked for: TSPEC is now v0.9 and carries E-36 in §I.2, §D.5, §D.3 and §T.7
(`TSPEC-pdlc-learnings-injection.md` §I.2 "upstream enumerates **three** zeros", §T.7's
`RSN-NO-MATERIAL` arm row "Two disjuncts, one branch"). The repair I described in v7 — TSPEC first,
then a one-touch PLAN edit — is exactly what happened, and the PLAN edit did not overreach it: no
task moved batch, no `Deps` edge changed, no fixture was invalidated, and I re-derived both facts
rather than taking the changelog's word for them.

**Two Low findings only**, both bookkeeping around the new v0.5 "amendment note" in LI-08. Neither
touches an oracle, a batch or an ownership row. Approved with minor changes.

## Batches

Three task rows changed. Each read against the upstream it now cites, not re-read from scratch.

**LI-12 (RED configuration suite, batch 5) — F-01 resolved, and resolved with the oracle I asked
for.** The row now reads `LI-AT-30` as **three** cases (`maxDocuments: 0`, `maxTotalBytes: 0`,
`maxBytesPerDocument: 0` / E-36) and states the third's oracle as three positive conjuncts:
(i) the `learningsInjection` key **present** with BR-8's rows present and empty; (ii) `rejected[]`
**set-equal** to every enumerated non-self corpus path, each at reason exactly `RSN-NO-MATERIAL`,
none `bounded` — set equality, never "at least one"; (iii) **no** document carrying `RSN-COUNT`.
That is the v7 three-conjunct form verbatim, and conjunct (iii) is the one that makes the case able
to fail: the row itself names the mutation ("reverting §D.5's `maxBytes <= 0` short-circuit would
stay green" without it). Upstream backs every clause — TSPEC §I.2 states the third case's oracle as
"a set equality over the reject rows (every enumerated non-self path present with
`RSN-NO-MATERIAL`, none `bounded`), not merely an empty `selected`", and names the same mutation.
PLAN's conjunct (iii) is a **strengthening** beyond TSPEC's wording, not a divergence: `RSN-COUNT`
absence is implied by "none `bounded`" plus the no-slot clause, and asserting it directly is
strictly harder to false-green.

**AT-count arithmetic re-derived, not trusted.** TSPEC §T.5's suite map still reads
`learningsConfig.test.js | AT-30 (three zero-threshold cases, §I.2), AT-32 | 2`, and its closure
line still sums `2 + 9 + 3 + 3 + 6 + 12 = 35`. Adding a case to an existing AT changed no count, so
`LI-T-SUITEMAP`'s partition, LI-12's `Batch` (5) and its `Deps` (LI-02, LI-06) are untouched — the
row says so and the arithmetic agrees.

**LI-08 (RED block/material suite, batch 3) — F-03 resolved on the red side.** `LI-AT-11` now takes
its section-set equality over a fixture carrying non-canonical heading forms — un-numbered
`## Cross-Feature Patterns`, un-glossed `## Rejected Proposals`, a `###` sub-heading that must read
as body text, and a near-miss `## Process Findings` that must **not** match. The rule the row
transcribes matches TSPEC §D.3 clause-for-clause: exactly two `#` (so `###` is body text), an
optional ordinal stripped and discarded ("it is not the priority"), an optional trailing gloss, and
otherwise exact case-sensitive comparison against `BR6_SECTION_NAMES`. The near-miss choice is the
right one: `## Process Findings` is the token-overlap case TSPEC §D.3 rule 2 argues E-33 turns on,
so the fixture defeats the widened-matcher mutation rather than merely the absent-heading one.

**LI-02 (fixture helper, batch 2) — the knob is declared where it belongs.** The heading-form
variants are declared in LI-02's spec surface, not built ad hoc in LI-08, and LI-08's existing
`Deps` on LI-02 already carries the edge. At HEAD the landed helper already renders the ordinal and
gloss knobs (`pdlc/workflows/__tests__/helpers/learningsFixtures.js:64-71`, `renderSection`'s
`section.ordinal` / `section.gloss`), so two of the four variants cost nothing; the near-miss rides
on `section.name`. The one variant with no expressed mechanism is the `###` sub-heading — see F-02.

**Everything else in the table.** No other row changed. `[Fake first]` ordering, the single-writer
file manifest and the same-batch same-new-file guard are byte-identical to what I approved in v6.

## Dependencies

**Batch DAG — arithmetic unchanged, and I checked rather than assumed.** The diff adds no task, no
file and no edge; the only cells inside the task table that moved are prose inside LI-02, LI-08 and
LI-12. LI-12 stays batch 5 on deps LI-02 (2) / LI-06 (4) — `max(2,4)+1 = 5` ✓. LI-08 stays batch 3
on dep LI-02 (2) — `max(2)+1 = 3` ✓. LI-02 stays batch 2 on LI-01 (1) ✓. The zero-bound branch is
greened by LI-21 (batch 13, deps LI-20 / LI-12 / LI-23), already in the graph and already
red-before-green via the `LI-21 → LI-12` edge the §Dependencies edge table names. No new same-batch
same-new-file collision: `learningsConfig.test.js` is LI-12's alone, and it does not exist at HEAD
(`ls pdlc/workflows/__tests__/` shows `learningsBlock`, `learningsCaptureScript`, `learningsCorpus`,
`learningsPredicatePin`, `learningsPremises`, `learningsSelect` only), so the row's implicit
new-file claim holds.

**Upstream precedence — the reason v7 could not approve is gone.** v7's High rested on PLAN faithfully
compressing a TSPEC that had not yet absorbed E-36. TSPEC v0.9 has: §I.2 enumerates the three zeros
and states the third case's reject-row set equality; §T.7's arm table carries "Two disjuncts, one
branch … AT-28 (structural disjunct); AT-30's third case (zero-bound disjunct, §I.2)"; §D.3 assigns
F-O-1's second rule with `SECTION_HEADING_RE` and `BR6_SECTION_NAMES` spelled out; §T.5 keeps the
per-file counts. PLAN v0.5 now compresses that, so row and TSPEC agree and PLAN's own
"where a row and the TSPEC disagree, the TSPEC wins" precedence rule is not being exercised anywhere
I could find in the changed text.

**Version pins — F-04 resolved, verified against the cited files' own version cells.** The front
matter now reads `TSPEC (v0.9)`, `FSPEC (v0.13)`, `REQ (v0.9)`, `DECISIONS (v0.3)`; §Overview reads
"REQ v0.9 / FSPEC v0.13 / TSPEC v0.9"; §Dependencies' LI-01 reason reads "since TSPEC v0.9". HEAD's
version cells are TSPEC 0.9, FSPEC 0.13, DECISIONS 0.3, REQ 0.9 (each file's `| pdlc | … |` row,
line 18). Four pins, four matches — the DECISIONS pin is new and correct rather than newly stale.

**ERR-3 / ERR-7 — correctly closed, not silently dropped.** The §Errata table now records both as
`CLOSED at HEAD` with an explicit "Effect on this PLAN: None" column, and I verified both closures
upstream rather than taking the changelog's word: FSPEC states BR-1's two-conjunct rule and names the
`docType: null` optimizer round as the excluded branch (`FSPEC-…md:287`, D-2), quantifies AT-03/AT-29
over dispatches "outside BR-1's rule" (`FSPEC-…md:622`), and states BR-15's expected set "as a set,
not a count" with the enumeration dropped (`FSPEC-…md:57`). TSPEC's erratum register marks both
CLOSED (`TSPEC-…md:1569`, `:1615`). The two task rows they touched (LI-11's `LI-AT-02`, `LI-AT-33`)
were already written to TSPEC's reading, so "no change needed" is a checkable claim, and it checks
out.

## Verification

## Positive Observations

## Findings

## Questions

## Recommendation
