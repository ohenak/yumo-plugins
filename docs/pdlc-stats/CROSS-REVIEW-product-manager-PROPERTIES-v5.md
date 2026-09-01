# Cross-Review: product-manager — PROPERTIES (delta re-review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/PROPERTIES-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 5
**Round type:** delta re-review of the v1.2 round-3 revision (+63 / −23 lines).

## Overview

This is an ordinary delta re-review, not a cascade confirmation: PROPERTIES' own bytes moved this
round. The document went from v1.1 to v1.2, `sha256:7baf9b33…` → `sha256:9b118684…`, +63 / −23 lines
across nine hunks, discharging five product-manager findings (F-01…F-05 of v3) and two
software-engineer findings from the round-3 fan-out.

Measured upstream state at HEAD against the `UPSTREAM-STATE` anchors recorded in v4:

| Upstream | Pinned in v4 | At HEAD | Moved? |
|---|---|---|---|
| REQ | `f75c348f…` | `f75c348f…` | no |
| FSPEC | `a493133f…` | `a493133f…` | no |
| TSPEC | `f2261510…` | `f32d9cb5…` | yes |
| DECISIONS | `48522bf9…` | `ca3f7219…` | yes |
| PLAN | `87b439ea…` | `6ab4d081…` | yes |

The two upstreams that govern product fidelity — REQ and FSPEC — are byte-identical to the state I
approved at v4. So the REQ-STATS-06 erratum reasoning I recorded there still holds verbatim and is
not re-litigated here. TSPEC v1.8, DECISIONS v1.7 and PLAN v1.3 moved, and the delta under review
claims to track PLAN's movement in particular (T-09 gaining the shipped-seam symbolic-link leg,
T-10 dropping the `stats`-seam qualifier, T-05/T-07 replacing T-05/T-06/T-07 on PROP-DISC-10). I
checked those three claims against PLAN at HEAD rather than taking them on trust.

Under the decision freeze I confined blocking findings to the two admitted classes: a defect this
revision introduced, and a load-bearing claim that contradicts the repository at HEAD. I found one,
and it is of the second kind — introduced by this round's edit, and falsifiable by `ls`.

Scope of the scan: the nine changed hunks, plus the specific repository and PLAN facts the new
prose asserts. I did not re-read the sections v3 already approved and this round did not touch.

## Properties

## Oracles

## Fixtures

## Delta-Confirmation Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
