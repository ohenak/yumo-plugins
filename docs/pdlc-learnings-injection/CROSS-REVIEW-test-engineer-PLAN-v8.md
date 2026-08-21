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

## Verification

## Positive Observations

## Findings

## Questions

## Recommendation
