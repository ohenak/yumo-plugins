# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md
**Date:** 2026-08-31
**Iteration:** 14 (delta confirmation, round v14)
**Prior round:** CROSS-REVIEW-test-engineer-TSPEC-v13.md (Approved with minor changes; REVIEWED-COMMIT 3a17387d61fdf8fd454094277f982d9d4d277f20)

## Overview

**Scope of this round.** Delta confirmation only. I previously approved this TSPEC at v1.2
(`REVIEWED-COMMIT 3a17387d6`). Since then two commits touched it — `df2b10154` (v1.3, re-ground on
REQ v1.10 / FSPEC v1.4) and `757922341` (cite FSPEC E-7 by id). I read the diff of those two
commits, re-read the upstream text this document now leans on at its current version, and answer
one question: does the delta resolve the routed item without breaking what I approved?

**Routed item.** *PLAN v0.7 contradicts TSPEC §7.3's census pin in all six routed places
(fifteen-member owned list, production home for `DECISION_LEDGER_CENSUS_TOKENS`) — routes to PLAN's
phase.* This item has **no locus in this document**: §7.3 is the authority the contradiction is
measured against, and the correction direction it states is downstream-to-here. The v1.3 changelog
correctly declines to edit §7.3 and records the route. That disposition is right.

**Upstream is unmoved since my approval.** I re-measured both pins at HEAD:

| Upstream | Dispatch hash | Measured at HEAD | Version numeral |
|---|---|---|---|
| REQ | `sha256:9bc8bc32…05f10d` | identical | v1.10 |
| FSPEC | `sha256:48691453…a11256` | identical | v1.4 |

The header pin now names that pair, replacing the superseded `REQ v1.9 / FSPEC v1.3`. That is
mechanically correct.

**Answer.** Yes with one recorded defect — a Medium, bookkeeping-only staleness in the new v1.3
changelog paragraph about PLAN's state (F-01). It is the recurrence of my v13 F-01 in new bytes.
No High. No approved contract is disturbed.

## Architecture

Nothing architectural moved. The delta is 33 insertions / 5 deletions, and every deleted line is a
pointer numeral, not a claim:

| Site | Before | After | Verdict |
|---|---|---|---|
| Header *Upstream* row | `REQ v1.9`, `FSPEC v1.3` | `REQ v1.10`, `FSPEC v1.4` | correct at HEAD |
| §4.1 admits-nothing sentence | `FSPEC v1.3's E-7` | `FSPEC **E-7**` | id-cited, DEC-DOC-01 conformant |
| §6.1 `F-13` row | `(FSPEC v1.3's E-7)` | `(FSPEC **E-7**)` | same |
| §7.6 `AT-14` row | `FSPEC v1.3's cases` | `FSPEC **E-7**'s cases` | same, and stronger — it now names the clause, not the document |
| Changelog | — | new v1.3 entry | see F-01 |

**Design surfaces untouched.** §3 (corpus gathering), §4 (parser / selector / renderer), §5 (module
surfaces), §7.3 (the census contract) are byte-identical outside the two one-line citation edits.
The fourteen-member pin at §7.3 (*The size of the owned list, stated once* — six functions ∪ eight
constants) stands unmoved, as does the 1,200-byte pin and the sentinel-bounded slice contract. No
seam, no injection point, no oracle placement changed, so nothing I approved on the testability axis
can have regressed.

**Version-numeral sweep.** I grepped the whole document for residual `FSPEC v1.` / `REQ v1.`
pointers. The remaining hits are all inside **historical changelog entries** (v0.5, v0.6, v1.2,
§9.2's ERR-1/ERR-2 resolution notes) where the numeral is the subject of the sentence — "FSPEC v1.3
widened E-7", "Resolved in REQ v1.8". Those are history, not live pointers, and a future upstream
bump cannot invalidate them. No live body citation names upstream by numeral any more. The routed
churn class is closed.

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Recommendation

## Delta-Confirmation Findings

## Verdict
