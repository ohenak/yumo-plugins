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

The erratum touches no task row's batch, `Deps`, owner, file list or point estimate. I diffed
`9f87235e..HEAD` on the PLAN: 23 insertions, 2 deletions, in exactly three places — the header
version cell (0.5 → 0.6), one sentence spliced into LI-08's row, and a new paragraph plus table in
§The three gate wordings, with a changelog row recording it. The batch ladder is untouched, so
nothing I approved about sequencing at v8 can have moved.

**What the routed item asked for, and what landed.** All three reviewers raised the same defect:
v0.5's amendment note assigned the heading-form follow-up to the landed suites' existing owners but
named no expected-red rows, and P-A-7 (`§Open questions`, P-A-7's answer) makes "a live table is
amended by an edit to this PLAN, committed before the run it governs" a hard rule. The delta now
names those rows for both cases:

| Case | Delta's answer | Checked against the ledger |
|---|---|---|
| A — follow-up lands before batch 7 | **no row added** | Correct. The ledger's `after batch 7` row lists `learningsBlock` as a **whole suite** red, and `after batch 8` repeats it; the `after batch 9` row (LI-17) drops `learningsBlock` entire. New cases inside a suite already ledgered whole cannot add a row, and they green with the suite at LI-17 |
| B — follow-up lands at batch 9 or later | ledger gains `learningsBlock` → **`LI-AT-11`'s heading-form cases only**, for every batch from the landing batch through the greening batch, stated in **test names** | Correct, and correctly formed: the ledger's own third load-bearing property is that split rows are stated in test names, not suite names, and case B obeys it rather than inventing a second convention |

Case B also restates the P-A-7 rule at the point of use — "the amendment is an edit to **this** PLAN,
committed **before** that batch runs; a re-red landing without it is a gate failure, not a red." That
is the sentence the three routed items were asking for, and it is stated as an obligation on the
committer rather than as a description.

**The one gap I found in the new paragraph** is a boundary the delta does not cover. Case A is
keyed on "before batch 7", but batches 4, 5 and 6 all run before batch 7 and are governed by the
*other* two gate wordings, not by the ledger:

- batches 4 and 6 are **green-terminal**, whose conjunct is "every pre-existing test's status is
  unchanged from the measured baseline". Heading-form cases added to `learningsBlock` during that
  window are neither the batch's new suite nor pre-existing at baseline, so no clause of that gate
  names them;
- batch 5 is **RED-terminal**, whose bar is "the batch's new tests fail for the specified reason" —
  again a clause about *the batch's* new tests, not about new cases spliced into a suite that landed
  red two batches earlier.

Case A's stated reason for the red ("`extractInjectableMaterial` does not implement F-O-1's second
rule yet") is also the batch-7/8 reason; before batch 7 the honest reason is that the symbol does not
exist at all. Nothing here is wrong, and no gate is made unsafe — the suite is red before and after,
so no dispatcher reading suite status is misled. It is a precision gap in a paragraph whose whole
purpose is precision, and one clause fixes it: say that if the follow-up lands during batches 4–6 the
cases are read under that batch's own wording as part of the already-red `learningsBlock` suite,
failing for the reason that batch's wording specifies. Recorded as F-01, Low.

## Dependencies

## Verification

## Positive Observations

## Delta-Confirmation Findings

## Verdict
