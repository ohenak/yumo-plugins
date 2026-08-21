# Cross-Review: product-manager — PLAN (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md (v0.6)
**Date:** 2026-08-20
**Iteration:** 9 (delta confirmation, erratum round)
**Scope:** Local

## Overview

**Question asked:** does the v0.6 erratum resolve the three routed items — TE's, mine, and SE's,
all the same item — without breaking what I approved at v8, and is this PLAN still a faithful
compression of its upstream *at HEAD*?

**Answer:** yes on both, with no High finding. The routed item is landed in substance, not in
gesture: §The three gate wordings gains an **Amendment commits on landed suites (P-A-7)** paragraph
that names the expected-red rows for the heading-form follow-up in both cases that can arise, and
LI-08's amendment note now points at it. Three Medium findings I raised at v8 remain open — they
were out of this erratum's routing scope and are tagged `inherited` so they route back rather than
halt.

**Upstream re-read (DEC-ERR-03).** I re-derived the four upstream digests on the working tree and
they match this dispatch byte-for-byte:

| Upstream | Digest at HEAD | Matches dispatch |
|---|---|---|
| REQ v0.9 | `ff605dd3…` | yes |
| FSPEC v0.13 | `ae75fa62…` | yes |
| TSPEC v0.9 | `22dee8ce…` | yes |
| DECISIONS v0.3 | `56617f5a…` | yes |

The PLAN's live version pins read FSPEC v0.13 / TSPEC v0.9 / REQ v0.9, which is what those headers
say at HEAD. The older strings the document still contains (`FSPEC v0.10/v0.11/v0.12`,
`TSPEC v0.6/v0.7`) all sit inside the changelog's 0.1/0.5 rows or the errata section's "CLOSED by
FSPEC v0.11" attributions — historical statements about *when* something changed, which are correct
as written and must not be refreshed.

**Upstream text the delta itself leans on, checked at its current version:**

- TSPEC §D.3's matching rule — `SECTION_HEADING_RE` with **exactly two** `#`, an optional `N.`
  ordinal stripped and discarded (priority comes from `BR6_SECTION_NAMES`'s index), `GLOSS_RE`
  stripped from both sides, otherwise exact case-sensitive comparison. The delta's four named
  heading-form cases are each traceable: the un-numbered form to rule 1, the un-glossed
  `## Rejected Proposals` to rule 3 (TSPEC names that exact shortened form as the one real
  tolerance), the `###` sub-heading to the two-`#` clause, and the `## Process Findings` near-miss
  to rule 2's E-33 argument, where TSPEC states in terms that `Process Findings` must **not** match
  `Process Learnings`. Nothing is invented and nothing is narrowed.
- FSPEC F-O-1 at v0.13 still owns **both** heading-recognition rules (FSPEC:79, F-O-1's own row),
  which is the obligation LI-08's row and this delta both cite.

**Fact-check of the delta's one empirical claim.** The paragraph rests its "no row for the fixture
consumers" conclusion on the landed helper's rendering being **additive**. I read
`pdlc/workflows/__tests__/helpers/learningsFixtures.js` at HEAD: its section renderer already takes
`ordinal` (omitted entirely when `null`/`undefined`) and `gloss` (appended only when truthy), so a
caller that declares neither gets byte-identical output before and after the amendment. The premise
is true as stated, and the delta is honest about it being a premise — it says what happens if a
later amendment is not additive.

## Batches

## Dependencies

## Verification

## Positive Observations

## Delta-Confirmation Findings

## Verdict
