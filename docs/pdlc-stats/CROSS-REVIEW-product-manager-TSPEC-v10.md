# Cross-Review: product-manager — TSPEC (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-stats/TSPEC-pdlc-stats.md (v1.7, bytes unchanged since v9 approval)
**Date:** 2026-08-31
**Iteration:** 10
**Round type:** Upstream-cascade confirmation (REQ moved; TSPEC did not)

## Overview

**What moved.** Exactly one upstream commit since my v9 approval anchored `REQ sha256:5f3e8051…`:
`e12b78fd8` *"REQ v1.7 erratum — decide REQ-STATS-06 out-of-catalogue basename as harvested"*,
+12/-3 lines in two places — REQ §0's changelog (version 1.6 → 1.7 plus a five-line erratum note)
and REQ-STATS-06's closing predicate paragraph. FSPEC did not move: HEAD measures
`c7d2c832dee586c8e371ec843c0809b167b65dbbeced4dd140934fe68d0ec63d`, byte-identical to the
`UPSTREAM-STATE` pin my v9 carried. REQ at HEAD measures
`f75c348f299ebff8518b590f64668d054587c0c9d4d7ba442477e6fdfa7a8862`, matching the dispatch attestation.

**The substantive change, in one line.** REQ-STATS-06's clause *"the predicate is set-membership over
C-4's grammars, so a grammatical basename outside the driver's document-type catalogue is **a
survivor** even where REQ-STATS-03 reports it malformed"* is **withdrawn**. In its place REQ now says
the predicate is evaluated over exactly the file set the process side sums, so an out-of-catalogue
basename *"contributes no process bytes and counts as no file of its family remaining: a feature
whose only `CROSS-REVIEW-` basenames are of that shape reports **harvested**"*. The clause was
decided, not reconciled — withdrawn as dissenting from REQ-STATS-06's own rationale, REQ-STATS-03's
malformed classification of the same basename, and C-5.

**What that means for this TSPEC, product lens.** TSPEC §4.3 already implements the harvested reading
(it follows FSPEC BR-16 v1.7, its immediate upstream). So the *behaviour* this document specifies is
now, at HEAD, exactly what REQ requires: no type, signature, exit code, oracle or code sketch is
wrong. The problem is elsewhere and it is real: **TSPEC's live text says this question is contested
upstream, and quotes REQ verbatim for a clause REQ no longer contains.** The dispute TSPEC routes to
the owning phase has been settled — in favour of the side TSPEC already implements. A document that
tells its downstream a P0 acceptance criterion's expected value is provisional, when upstream has
decided it, is no longer a faithful compression of upstream (DEC-ERR-03). That is F-01 below, and it
is mechanical: TSPEC itself names the exact sites that re-stamp.

I re-read my v9 cross-review, diffed `e12b78fd8` in full, re-read REQ-STATS-06 and FSPEC BR-16 at
HEAD, and re-read only the TSPEC regions those clauses bear on (§0 changelog, §4.3's ratio passage,
§8.3). Nothing else was read or re-litigated.

## Architecture

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Delta-Confirmation Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
