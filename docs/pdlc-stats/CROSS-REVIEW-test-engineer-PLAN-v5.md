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

## Dependencies

## Verification

## Delta-Confirmation Findings

## Verdict
