# Cross-Review: product-manager — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/PROPERTIES-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 7
**Round type:** upstream-cascade confirmation — PROPERTIES bytes unchanged; PLAN moved (erratum round 5)

## Overview

PROPERTIES is unchanged at HEAD. The approved-version question is whether it is still a faithful
compression of upstream **as upstream now stands**, and two upstream documents have moved past the
version my v6 approval pinned:

| Upstream | v6 `UPSTREAM-STATE` pin | HEAD | Moved? |
|---|---|---|---|
| REQ | `f75c348f…` | `f75c348f…` | no |
| FSPEC | `a493133f…` | `a493133f…` | no |
| TSPEC | `7b119eb7…` | `f32d9cb5…` (v1.8) | **yes** |
| DECISIONS | `ca3f7219…` | `ca3f7219…` | no |
| PLAN | `6ab4d081…` | `64d8f1c5…` (v1.4) | **yes** |

The dispatch names the PLAN move. Per `DEC-ERR-03` I measured the TSPEC move as well, because
PROPERTIES cites TSPEC directly in nineteen trace cells and a scope taken from the item list rather
than from upstream-at-HEAD is the failure mode that rule exists to stop.

**The PLAN move (v1.3 → v1.4) is two edits.** (i) T-10's *justification* for its whole-file
`statSync` conjunct is re-grounded, because the baseline it was measured against expired when T-17's
`bin/cli.mjs` edits landed. (ii) The `Status` column is declared a planning-time ledger that is not
maintained during implementation. The conjunct itself, the task list, the batch structure and every
`Source File` cell are untouched.

**The TSPEC move (v1.7 → v1.8) absorbs one settled upstream decision** — REQ v1.7's withdrawal of
REQ-STATS-06's "a grammatical basename outside the driver's catalogue is a survivor" clause, decided
in BR-16's favour. TSPEC v1.8 re-stamps §4.3's contested paragraph, moves §4.3's BR-16 pin to v1.8,
pins AT-17's fourth leg hard to `harvested`, and closes §8.3's second bullet (count word two → one).
No `BR-`, `E-` or `AC-` row is added, no vocabulary is renamed, and no expected value moves.

I re-read the upstream text PROPERTIES actually leans on in both moved documents and re-measured its
claims against the repository at HEAD. One divergence is worth recording; it is Medium, and I set
out below why it is not High.

## Properties

## Oracles

## Fixtures

## Delta-Confirmation Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
