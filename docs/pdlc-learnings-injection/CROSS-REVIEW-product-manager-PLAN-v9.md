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

No dependency edge moved. LI-08's `Deps` on LI-02 is unchanged, which matters here because the
heading-form variants are declared in LI-02's spec surface rather than built ad hoc in LI-08 — the
edge that carries that relationship is the one the v0.5 round put in place, and the erratum leaves it
alone. The single-writer file-ownership manifest is likewise unchanged, which is the delta's own
claim ("ownership does not move") and is true: no file appears against a new task.

**Upstream dependency direction is preserved.** The PLAN depends on FSPEC F-O-1 and TSPEC §D.3 for
this material and on nothing else new. Both are at the versions the PLAN pins, and neither has
changed since the v0.5 absorption — the FSPEC v0.13 / TSPEC v0.9 pins are still live-correct, so the
delta introduces no new upstream debt.

**Cross-document consistency of the new paragraph.** The fixture-consumer claim reaches outside
LI-08 into LI-02's helper and into `learningsSelect.test.js` and `learningsCorpus.test.js`, both of
which carry their own ledger rows. The delta asserts those rows do not move and grounds the assertion
in additivity rather than assuming it — verified against the landed helper, as recorded in §Overview.
This is the right shape for a cross-task claim: it names the suites it is speaking for, states the
premise that makes the claim true, and says what happens when the premise fails.

**Open dependencies from v8 that this round did not touch.** Three Medium findings from
`CROSS-REVIEW-product-manager-PLAN-v8.md` remain open in the pre-round bytes; the erratum's routing
scope was the P-A-7 item only, so their staying open is expected, not a regression:

| v8 finding | Status at HEAD | Tagged here as |
|---|---|---|
| F-01 — the zero-bound **production** half (TSPEC §D.5's `maxBytes <= 0` short-circuit) has no named owner task | still unowned | F-04, Medium, inherited |
| F-02 — `LI-AT-30` conjunct (iii) "no document carries `RSN-COUNT`" is vacuous unless the fixture's eligible non-self corpus exceeds `maxDocuments` (REQ §4.1 default 5) | precondition still unstated | F-03, Medium, inherited |
| F-03 — the errata section's "remaining open errata (ERR-1, ERR-2, ERR-5)" omits **ERR-8** | ERR-8 is still open in TSPEC v0.9 (§ERR-8, FSPEC Step 5 items 15–16); the PLAN's list still omits it | F-02, Medium, inherited |

I re-confirmed ERR-8's live status directly in TSPEC at HEAD rather than carrying it forward on
trust. Tagging these `inherited` is deliberate: they route back to the PLAN's ordinary revision loop,
they do not halt this phase, and none of them is a product-fidelity defect against REQ acceptance
criteria — they are completeness gaps in ownership and in an errata list.

## Verification

**How I verified this round** (delta protocol, not a re-read):

1. `git diff 9f87235e..HEAD` on the PLAN — three hunks, 23/2 lines, as itemised in §Batches.
2. Re-derived all four upstream sha256 digests on the working tree and compared them to the dispatch
   values — all four match, so the upstream I am measuring against is the upstream this dispatch
   named.
3. Read TSPEC §D.3 (`BR6_SECTION_NAMES`, `SECTION_HEADING_RE`, `GLOSS_RE`, rules 1–3) and FSPEC
   F-O-1 at HEAD, and traced each of the delta's four heading-form cases back to the upstream clause
   that requires it.
4. Read the expected-red ledger rows for batches 7, 8 and 9 and checked case A's and case B's claims
   against them, including the ledger's three load-bearing properties (test-name statement, shrink
   by exactly what the batch greens, empty at 13).
5. Read the three gate wordings in full to test case A's "before batch 7" boundary — this is where
   F-01 came from.
6. Read the landed `learningsFixtures.js` section renderer to test the additivity premise.
7. Re-checked each open v8 finding against HEAD's bytes rather than assuming, including confirming
   ERR-8's live status in TSPEC.

**What I did not re-review:** every section unchanged by this edit and already approved at v8 —
§Overview, the task table other than LI-08's row, §Traceability, §File-ownership manifest, the
measured baseline, and §Open questions. Per the delta protocol those are not re-litigated, and no
finding below reaches into them except the three inherited ones I already owned.

**Product-lens verdict on the delta itself.** The routed items are about gate mechanics, which sits
closer to the engineering lens than mine; the product question underneath is whether the PLAN still
guarantees that `LI-AT-11` — the acceptance test carrying FSPEC F-O-1's second rule, and therefore
the requirement that a real corpus document written in a non-canonical heading form still
contributes material — actually gets a proving red before it is greened. Before this delta, the
follow-up commit could have landed on green code with no ledger row, which is exactly the shape in
which an acceptance criterion quietly stops being proven. After it, both landing windows are named
and the later one is explicitly gated. That closes the product exposure, not just the process one.

**No new scope, no reinterpretation.** The delta adds no behaviour, changes no acceptance criterion's
meaning, moves no AT between tasks, and invalidates no fixture — its own changelog row claims exactly
that, and the diff bears the claim out.

## Positive Observations

- The delta answers the routed item **in the live table's own idiom** rather than in prose beside it:
  case B's row is stated in test names, for a batch range, with the "amendment before the run"
  obligation restated at the point of use. A dispatcher can act on it without reading P-A-7.
- Naming **both** landing windows, including the one where the answer is "no row", is better than
  naming only the awkward one. Case A's "no row is added, and none may be dropped early" forecloses
  the opposite error too.
- The fixture-consumer paragraph states its **premise** (additivity) and its failure mode (a
  non-additive future amendment enters the ledger by name first) instead of asserting a bare
  conclusion. That premise is checkable, and I checked it — it holds against the landed helper.
- The changelog row is unusually honest about the negative space: "no task moved batch, no `Deps`
  edge changed, no AT partition or fixture was touched." That is the claim a reviewer most wants to
  be able to verify in one diff, and it verified.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | delta | local | Case A is keyed on "before batch 7", but batches 4–6 run in that window under the green-terminal and RED-terminal wordings, neither of which has a clause for new red cases spliced into a suite that landed red at batch 2/3; and case A's stated red reason is the batch-7/8 one. Add a clause reading the cases under the landing batch's own wording | §The three gate wordings — Amendment commits on landed suites, case A |
| F-02 | Medium | inherited | nonlocal | The errata section's "TSPEC's remaining open errata (ERR-1, ERR-2, ERR-5)" still omits **ERR-8**, which is open in TSPEC v0.9 against FSPEC Step 5 items 15–16 (v8 F-03, unaddressed) | §Errata routed upstream |
| F-03 | Medium | inherited | nonlocal | `LI-AT-30` conjunct (iii) — "no document carries `RSN-COUNT`" — is still vacuous unless the third case's eligible non-self corpus exceeds the `maxDocuments` in force (REQ §4.1 default 5); state the fixture precondition (v8 F-02, unaddressed) | LI-12 task row |
| F-04 | Medium | inherited | nonlocal | The zero-bound **production** half of TSPEC §D.5's `maxBytes <= 0` short-circuit still has no named owner task; LI-16's row does not claim it (v8 F-01, partly closed on the test side only) | LI-16 task row |
| F-05 | Low | inherited | local | LI-08's amendment note remains spliced mid-enumeration, orphaning `LI-AT-12` after "…the single-writer manifest is unchanged, and the expected-red rows … (v0.6 erratum), `LI-AT-12` (…)". This round lengthened the splice; close the enumeration before the note (v8 F-04) | LI-08 task row |
| F-06 | Low | inherited | nonlocal | The v0.5 changelog row still says "the four stale version pins now read FSPEC v0.13 / TSPEC v0.9"; three were refreshed, and the 0.1 row correctly keeps its historical pins. Say three (v8 F-05) | §Changelog, 0.5 row |

FINDING: Low | delta | local | §The three gate wordings — Amendment commits on landed suites, case A | Case A keys on "before batch 7" but batches 4–6 fall in that window under the green-terminal and RED-terminal wordings, which have no clause for new red cases added to an already-red landed suite, and its stated red reason is the batch-7/8 reason rather than the pre-batch-7 one (symbol not defined yet)
FINDING: Medium | inherited | nonlocal | §Errata routed upstream | "TSPEC's remaining open errata (ERR-1, ERR-2, ERR-5)" omits ERR-8, still open in TSPEC v0.9 against FSPEC Step 5 items 15–16
FINDING: Medium | inherited | nonlocal | LI-12 task row | LI-AT-30 conjunct (iii) "no document carries RSN-COUNT" is vacuous unless the third case's eligible non-self corpus exceeds maxDocuments (REQ §4.1 default 5); the fixture precondition is unstated
FINDING: Medium | inherited | nonlocal | LI-16 task row | The zero-bound production half of TSPEC §D.5's maxBytes <= 0 short-circuit has no named owner task
FINDING: Low | inherited | local | LI-08 task row | The amendment note is spliced mid-enumeration and orphans LI-AT-12; this round lengthened the splice without closing the enumeration first
FINDING: Low | inherited | nonlocal | §Changelog, 0.5 row | "the four stale version pins" overcounts; three were refreshed and the 0.1 row correctly keeps its historical pins

## Recommendation

**Approved with minor changes.**

The three routed items are resolved. The expected-red rows the heading-form follow-up owes are now
named in the live table, ahead of the run they govern, in both landing windows — which is precisely
what P-A-7 requires and what all three reviewers asked for. Nothing I approved at v8 is broken: no
batch, `Deps` edge, owner, AT partition or fixture moved, and the PLAN remains a faithful compression
of REQ v0.9 / FSPEC v0.13 / TSPEC v0.9 / DECISIONS v0.3 as those documents read at HEAD, whose digests
I re-derived and matched.

No High finding, so this confirmation approves. F-01 is a one-clause precision fix to the paragraph
this round added. F-02 through F-06 are inherited from v8, were outside this erratum's routing scope,
and are tagged `inherited` so they route back to the PLAN's ordinary revision loop rather than
halting the phase — none is a product-fidelity defect against a REQ acceptance criterion.

## Verdict
