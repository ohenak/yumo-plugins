# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (v0.3)
**Date:** 2026-08-19
**Iteration:** 3
**Scope:** delta re-review of `5966c937..HEAD`; testing lens only — testability, oracle
falsifiability, edge-case completeness. Unchanged sections approved in v2 are not re-litigated.

## Prior findings disposition (v2)

| ID | Severity | Status | Evidence in this revision |
|---|---|---|---|
| F-01 | High | **Resolved** | Option (a) taken cleanly: `E-05` deleted, AT-28's truncation conjunct deleted, BR-3 now states truncation is **not a separate outcome** and resolves under the same shape judgement — eligible via E-19 (→ AT-11) or `RSN-UNPARSEABLE` via E-04 (→ AT-27), FSPEC:294-299. No dangling `RSN-TRUNCATED` or `E-05` reference survives; the trace line records the retirement explicitly (FSPEC:880). Both surviving branches carry a fixture and an AT, so nothing is asserted that no fixture can build. |
| F-02 | Medium | **Resolved** | AT-11's expected byte count is now "committed with the fixture as a literal integer, recomputed by hand when the fixture changes, never derived in the test" (FSPEC:762-765). The implementation-echo path is closed by wording, not by hope. |
| F-03 | Medium | **Resolved** | BR-1's Excluded enumeration reads as one sentence again — "review dispatch, implementation, DoD verification and remediation, harvest, ship, and every advisory seam" (FSPEC:246-247); the orphaned "ship, advisory seam." line is gone, so AT-03's exclusion universe is readable. |
| F-04 | Low | **Resolved** | BR-5 now states the matching rule its figures were measured under — "under strict title matching on BR-6's five names" (FSPEC:356-357) — so a later reader can reproduce or contest them. |
| F-05 | Low | **Resolved** | The branch-coverage line now reads "D-5 by AT-04/16" (FSPEC:882); AT-15 no longer stands in for a branch BR-2 removed. |
