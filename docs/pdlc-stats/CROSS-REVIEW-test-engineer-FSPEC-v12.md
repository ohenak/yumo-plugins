# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.8)
**Upstream:** `docs/pdlc-stats/REQ-pdlc-stats.md` (v1.7, sha256:f75c348f…a8862)
**Date:** 2026-08-31
**Iteration:** 12 (delta confirmation — erratum edit)
**Scope:** Local

## Overview

This is a delta confirmation, not a re-review. The erratum edit (`311910dce`) touches the FSPEC
header block only — 11 insertions, 2 deletions, all inside lines 6–24 — and changes no rule, no
flow, no business rule, no acceptance test and no edge case. Two substantive things happen: the
`Upstream` pin moves from `REQ-pdlc-stats.md` (v1.4) to (v1.7), and a v1.8 erratum paragraph records
that the REQ-STATS-06 / BR-16 contradiction is **absorbed upstream** rather than resolved here.

I confirm both the routed item and the wider obligation. The routed item was reported ABSORBED at
HEAD, and that report is accurate: REQ v1.7 withdrew the "grammatical basename outside the driver's
catalogue is a survivor" clause and decided the case BR-16's way. FSPEC needed no rule edit because
FSPEC never encoded the withdrawn clause — my v11 confirmation already established that `survivor`
appears nowhere in FSPEC's normative text, and it still does not. The only thing FSPEC owed was the
stale pin, which is exactly what this edit pays.

The scope obligation (DEC-ERR-03) is the wider question: does FSPEC v1.8 still faithfully compress
REQ **as it stands at the dispatched hash**, whether or not a defect appears in the routed list? I
re-read REQ-STATS-06 at v1.7 in full and re-walked every FSPEC anchor that leans on it. It does.
Details below; the short version is that the pin correction is the whole delta and it is correct.

## Linked Requirements

The dispatched upstream hash verifies. `shasum -a 256 docs/pdlc-stats/REQ-pdlc-stats.md` returns
`f75c348f299ebff8518b590f64668d054587c0c9d4d7ba442477e6fdfa7a8862`, byte-identical to the pin in the
dispatch, so I am reading the REQ the orchestrator measured against and no other.

The pin correction itself is sound. FSPEC's header now names REQ v1.7, which is the version the
document is re-grounded against, and v1.7 is genuinely the current REQ. My v11 review recorded that
the v10 approval had been taken against REQ **v1.6** while the header still said v1.4 — that
mismatch is now closed rather than merely re-stated.

I checked that the pin correction did not leave *other* stale version references behind. FSPEC still
mentions "REQ v1.4" at lines 39–48 and 951–978, but every one of those is a historical record, not a
pin: the §7.3 erratum table's "All five are closed at REQ v1.4" and the D-8/D-9 rationales state
*when* a carve-out landed. That remains true at v1.7 — a clause that closed at v1.4 and was never
reopened is still closed. Rewriting those to "v1.7" would in fact make them false. The one
normative pin is the header `Upstream` row, and it is the one that moved.

I verified the v1.4-era carve-outs FSPEC leans on survive in REQ v1.7 rather than trusting the
erratum table: REQ-STATS-09's *Given* still scopes itself to "a repository whose `docs/` root is
present and readable" with the root-failure carve-out (REQ:245–248, FSPEC D-9/EC-09); REQ-STATS-07
still carries "a readable but empty directory is not a gap but a normal row whose metrics report
their zero states" (REQ:223–224, FSPEC BR-27/AT-20/AT-26); REQ-STATS-03 still disposes of every
failing `CROSS-REVIEW-` basename as malformed under one label (REQ:163, FSPEC D-8/BR-06/AT-09).
None of the four traceability rows FSPEC §2 draws to REQ-STATS-06 has lost its upstream anchor.

## Behavioral Flow

## Business Rules

## Edge Cases and Error Scenarios

## Acceptance Tests

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
