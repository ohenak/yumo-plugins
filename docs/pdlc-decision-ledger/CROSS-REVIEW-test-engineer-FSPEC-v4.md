# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/FSPEC-pdlc-decision-ledger.md` (v1.2)
**Upstream re-measurement:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` v1.8 (sha256:3eb52deb…)
**Previous round:** `CROSS-REVIEW-test-engineer-FSPEC-v3.md` (2 High, 1 Medium, 1 Low — Needs revision)
**Date:** 2026-08-28
**Iteration:** 4

## Scope of this round

Delta confirmation, not a re-review. v3 recorded two High findings against the FSPEC's recital of
REQ **v1.8**'s re-measured bounds; a targeted erratum has since landed in three commits
(`c75797636`, `577cf6860`, `f450e8de4`), taking the FSPEC to **v1.2**. I read the diff of those
three commits, then re-read the upstream text this spec leans on at its current version, and
answered one question: does the delta resolve the routed items without breaking anything approved
earlier, and is the document still a faithful compression of REQ HEAD?

Per DEC-ERR-03 the measure is upstream HEAD, not the routed-item list. So the sections the erratum
did *not* touch were re-measured against REQ v1.8 too, and one carried finding is restated below
because it is still live — not because it was routed.

## What the delta changed

Eighteen lines in, nine out, across four sites and nothing else:

| Site | Change |
|---|---|
| Header `:9`, `:11`, `:16` | Upstream pin REQ **v1.7 → v1.8**, Baseline pin **v1.1 → v1.2**, version row **1.1 → 1.2** |
| Header `:19`–`:26` | New v1.2 erratum note recording the scope of the edit |
| §1 `:52`, §6 `:340` | Baseline `Verified at` citations re-pinned to **v1.2** |
| §3.1 `:120` | `maxBytes` default recital **`8000` → `12500`** |
| §7 Assumptions `:553`–`:555` | A-1 restated: both defaults measured once at the Baseline's named commit and cited by id |

No behavioral flow, business rule, edge case or acceptance test text moved. That is the right blast
radius for this erratum — the cascade really was confined to recited constants and a provenance
claim, exactly as v3 scoped it.

## Routed items — confirmation

## Upstream re-measurement (DEC-ERR-03)

## What remains

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
