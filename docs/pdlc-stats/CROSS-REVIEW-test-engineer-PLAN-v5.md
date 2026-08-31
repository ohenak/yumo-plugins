# Cross-Review: test-engineer — PLAN (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-stats/PLAN-pdlc-stats.md
**Date:** 2026-08-31
**Iteration:** 5 (upstream-cascade confirmation, REQ erratum v1.7)
**Scope:** Confirmation only — PLAN's own bytes are unchanged (`sha256:87b439ea…`, the hash my v4 approved). Re-measured against REQ at HEAD.

**Upstream at this dispatch:**

| Document | Hash at HEAD | Moved since my v4 approval? |
|---|---|---|
| REQ | `sha256:f75c348f…` | **Yes** — v1.6 `5f3e8051…` → v1.7 (erratum `e12b78fd8`) |
| FSPEC | `sha256:c7d2c832…` | No |
| TSPEC | `sha256:a06a6032…` | No |
| DECISIONS | `sha256:48522bf9…` | No |

## Overview

**The delta.** REQ erratum v1.7 (`e12b78fd8`) touches one clause of REQ-STATS-06 and nothing else. It
**withdraws** the v1.6 sentence "the predicate is set-membership over C-4's grammars, so a grammatical
basename outside the driver's document-type catalogue is **a survivor** even where REQ-STATS-03 reports
it malformed", and replaces it with the opposite: such a basename "contributes no process bytes and
counts as no file of its family remaining", so a feature whose only `CROSS-REVIEW-` basenames are of
that shape reports **harvested**, not a measured ratio.

**What that settles.** This is the exact REQ-versus-FSPEC conflict my v4 F-05 recorded and that TSPEC
§8.3 carries as its second open erratum. The erratum settles it **in favour of FSPEC BR-16** — which is
the reading TSPEC §4.3 already implements ("the sketch below is written against BR-16, the immediate
upstream") and the value FSPEC AT-17's fourth leg already asserts. The settlement therefore moves the
upstream *toward* the behaviour PLAN's tasks were already written to build, not away from it.

**Answer to the one question.** **Yes — the PLAN still holds.** It needs no edit. Two properties carry
the confirmation:

1. **PLAN never cites the withdrawn clause.** PLAN mentions neither `REQ-STATS-06` nor `BR-16`
   anywhere. Its four occurrences of "harvested" (`:20` changelog, `:96` T-04, `:110` T-18, `:118`
   T-26) are all either the `unmeasurable`/`harvested` **mutant** name or AT-10's genuinely-harvested
   archive rows — none is the out-of-catalogue scoping. There is no sentence in PLAN that the erratum
   makes false.
2. **PLAN is value-agnostic exactly where the delta bites.** T-04 claims "AT-17's four directories"
   without naming any leg's expected value, and delegates the discriminating detail to "Branch-order
   conjuncts of TSPEC §4.3 asserted explicitly". Expected-value ownership sits in TSPEC/PROPERTIES, and
   TSPEC §4.3 implements the now-settled reading. An implementer building T-04 to §4.3 produces the
   behaviour REQ v1.7 now requires.

**Resolved by the delta, not by an edit.** My v4 **F-05** (Low, delta, local) said T-04 gave the
implementer no signal to read TSPEC §8.3's contested conjunct, so the live REQ-versus-FSPEC dispute was
invisible at the task row. The dispute no longer exists — REQ and FSPEC now agree — so there is nothing
left to route and nothing for T-04 to re-stamp. F-05 is **closed** by this erratum. The four other v4
Low findings (F-01…F-04) are untouched by the delta and remain as recorded; they were non-gating then
and are non-gating now.

## Batches

Only four PLAN rows can touch REQ-STATS-06's byte-ratio predicate. I re-derived each against REQ v1.7
and, for the two real-path rows, re-measured the archive at HEAD rather than trusting the document.

| Task | What it claims | Status under REQ v1.7 |
|---|---|---|
| T-04 | 🔴 `computeFeatureStats` reds over `fakeStatsIo`, incl. "byte ratio (AT-15 incl. the removal probe, AT-16, **AT-17's four directories**)" and "Branch-order conjuncts of TSPEC §4.3 asserted explicitly" | **Holds, and is now unambiguous.** Names no expected value for any AT-17 leg, so the erratum cannot falsify it. The fourth leg's value is TSPEC-owned; §4.3 implements BR-16, which REQ now ratifies. |
| T-18 | 🟢 Real-path AT-09 (`docs/completed/pdlc-advisory-wave-gate/` — TSPEC row `6`, four `…-REVIEW-v{1,2}.md` basenames malformed) | **Holds.** Asserts a `TSPEC` round number and a malformed list, not a ratio verdict. Re-measured at HEAD: 62 `CROSS-REVIEW-*`, of which 4 out-of-catalogue → **58 grammatical remain**, `CODE_REVIEW` = 2, `LEARNINGS` = 1. Neither harvested disjunct fires, so the directory reports **measured** under v1.7 exactly as under v1.6. |
| T-18 | 🟢 Real-path AT-10 (`pdlc-headless-engine` — TSPEC `13`, **five rows `harvested`**) | **Holds.** Re-measured at HEAD: `LEARNINGS` = 1, `CODE_REVIEW` = **0**, out-of-catalogue basenames = **0**. The harvested verdict is carried by the `dodReviews.length === 0` disjunct, which the erratum does not touch. Independent of the delta. |
| T-26 | 🟢 Mutation evidence: four TSPEC §6.6 mutants, incl. swap `unmeasurable`/`harvested` and swap BR-16's harvested test against BR-15's zero-denominator test | **Holds.** Both ratio mutants concern the *ordering* of the zero-denominator and harvested branches, not the out-of-catalogue scoping. Their killing fixtures (T-04's `LEARNINGS`-sibling collision) are unchanged. |

**Direction-of-change check.** The settlement only ever moves a directory from `measured` toward
`harvested` — it enlarges the harvested set by reclassifying out-of-catalogue basenames as absent. That
asymmetry is why no PLAN expectation can silently flip: AT-10's row already expects `harvested` (a
widened predicate cannot un-harvest it), and AT-09's directory is held `measured` by 58 grammatical
survivors that the erratum leaves untouched. The only leg whose value the delta *could* decide is
AT-17's fourth, and PLAN deliberately does not name it.

**No new task is required.** The clause REQ v1.7 adds — a feature whose only `CROSS-REVIEW-` basenames
are out-of-catalogue reports `harvested` — is precisely FSPEC AT-17's fourth leg, which T-04 already
claims. The companion clause, that such a basename "contributes no process bytes", is already pinned by
AT-15's neither-list (TSPEC: the file "reach[es] neither side"), which T-04 also already claims. Both
halves of the new sentence land on tasks that exist. No coverage gap opens.

## Dependencies

## Verification

## Delta-Confirmation Findings

## Verdict
