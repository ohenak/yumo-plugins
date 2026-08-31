# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.8)
**Upstream pinned:** `docs/pdlc-stats/REQ-pdlc-stats.md` v1.7 (sha256:f75c348f299ebff8518b590f64668d054587c0c9d4d7ba442477e6fdfa7a8862)
**Date:** 2026-08-31
**Iteration:** 12 (delta confirmation)

## Overview

This is a **delta confirmation**, not a fresh review. I approved this FSPEC at v11. The erratum
edit under confirmation is commit `311910dce` — 11 insertions, 2 deletions, confined to the
document's metadata block and history preamble:

1. `Upstream` pin corrected `REQ-pdlc-stats.md` (v1.4) -> (v1.7).
2. Version row `1.7` -> `1.8`.
3. A new erratum paragraph recording that the routed REQ-STATS-06 / BR-16 conflict was **absorbed**
   upstream — REQ v1.7 withdrew the offending clause and decided the case BR-16's way — so no rule
   text in this FSPEC changed.

No business rule, behavioural flow, edge case, acceptance test or open-question row was touched.
The dispatch reported every routed item ABSORBED against upstream HEAD, and the diff is consistent
with that report: it is a re-grounding record, not a rule edit.

Per DEC-ERR-03 my scope is this FSPEC measured against **REQ v1.7 as it now reads**, not against
the item list. I therefore re-read the upstream clauses this document leans on at their current
version and re-verified the shipped-corpus facts BR-16 cites, rather than only diffing the delta.
Upstream hash verified locally: `shasum -a 256 docs/pdlc-stats/REQ-pdlc-stats.md` returns
`f75c348f…7a8862`, matching the dispatch pin exactly.

## Linked Requirements

Upstream re-verification against REQ v1.7 at HEAD. I re-read each REQ clause this FSPEC compresses
and diffed it against the FSPEC text that carries it.

| Upstream clause (REQ v1.7) | What it now says | FSPEC carrier | Faithful? |
|---|---|---|---|
| REQ-STATS-06, harvested predicate | `LEARNINGS-{feature}.md` present **and at least one** of the two review families entirely absent -> `harvested`, not measured | BR-16 | Yes |
| REQ-STATS-06, out-of-catalogue basename | A basename the driver's catalogue does not recognise "contributes no process bytes and counts as no file of its family remaining"; a feature whose only `CROSS-REVIEW-` basenames are of that shape reports **harvested** | BR-16, sentences 2–3 | Yes — the survivor reading is gone from both sides |
| REQ-STATS-06, zero denominator | spec bytes zero -> not-available, never divide-by-zero or crash | BR-15 (`n/a`) | Yes |
| REQ C-3 (spec set, fixed) | six document types, not operator-configurable | BR-14, spec side | Yes, enumeration matches member for member |
| REQ C-4 (process set, fixed) | three basename grammars, not operator-configurable | BR-14, process side | Yes |
| REQ-STATS-05 (as amended v1.6) | no post-mortem file -> halts report `0`; **no harvested halt state** (NG-6); R-6 records the conflation as accepted residual | BR-13 ("empty halt set"), EC-03, §4.4 (`halts` is the exception, needs no `state` field) | Yes |
| REQ-STATS-02 | JSON top-level set-equal to REQ-STATS-01's set plus one schema-version field; malformed / unmeasurable / harvested ride **inside** a metric's value, never as extra top-level keys | §4.4 five-key enumeration `schemaVersion`, `reviewRounds`, `dodRounds`, `halts`, `byteRatio` | Yes |
| REQ-STATS-04 | DoD harvested condition | BR-11 | Yes |

The pin jump v1.4 -> v1.7 crosses three upstream revisions, so I did not take the erratum note's
"no rule changed" on trust — I checked the two intervening REQ commits that could have stranded
this document:

- **REQ v1.5** (`af78b8c4e`) dropped the residual "two harvest-deleted families" premise in
  REQ-STATS-06, leaving "at least one of the two". BR-16 already reads "at least one of the two
  harvest-deleted process families is entirely absent" — aligned, not stranded.
- **REQ v1.5 -> v1.6** (`9317412b1` then `1847dd9c0`) added a harvested halt state and then
  withdrew it, restoring measured `0`. Net zero against this FSPEC: BR-13 and EC-03 never adopted
  the intermediate state, so the withdrawal leaves them correct rather than stale.

That is the material risk in a three-version pin jump, and it is clean. The stale-pin correction is
therefore a genuine record fix: the document's *bytes* were already grounded on the current upstream
reading; only its declared pin lagged.

## Behavioral Flow

## Business Rules

## Edge Cases and Error Scenarios

## Acceptance Tests

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
