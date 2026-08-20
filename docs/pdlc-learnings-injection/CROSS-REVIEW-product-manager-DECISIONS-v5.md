# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md
**Date:** 2026-08-20
**Iteration:** 5 (upstream-cascade confirmation; DECISIONS bytes unchanged)
**Scope:** Local

## Context

I approved DECISIONS at v4 (`Approved with minor changes`, 0 High / 2 Medium / 2 Low) with
`REVIEWED-COMMIT: 82bd5869`, `APPROVAL-HASH: sha256:85888c03…` and `UPSTREAM-STATE: TSPEC
sha256:eff5a19b…` — TSPEC **v0.6**, commit `ccc739d1`. TSPEC at HEAD is `sha256:f629d29d…`
(**v0.7**, commit `bfe58851`). REQ (`sha256:ff605dd3…`) and FSPEC (`sha256:fb18dbda…`) are
byte-identical to the versions my v4 approval was recorded against, so the whole cascade this round
lives in TSPEC.

DECISIONS' own bytes have not moved since `42515b3e` (`sha256:85888c03…`, unchanged across v3, v4
and this round). The only question is whether it is still a faithful compression of upstream as
upstream now stands. Per DEC-ERR-03 I re-read the entire span `ccc739d1..bfe58851`, not the last
commit, because my approval was recorded against the older blob:

| TSPEC commit | What moved |
|---|---|
| `e33425a6` | Header re-grounded: `Upstream` row now pins **FSPEC v0.12** (was v0.9), version bumped 0.6 → **0.7**, and a `v0.7 erratum` note added to the front matter summarising the round. |
| `4fe44ecb` | `P-2a` and `P-10` ground-truth anchors restated as symbol/call-shape citations per `DEC-DOC-01`; the previous `orchestrate-dev.js:NNNN` line anchors were stale at HEAD. |
| `2c8b880c` | §D.1's domain-membership tests scoped to **non-`null`** values, so `corpusOutcome`'s healthy `null` (§D.2) no longer contradicts the catalogue membership assertion. `LEARNINGS_CORPUS_OUTCOMES` set-equality unchanged at `["RSN-UNLISTABLE", "RSN-EMPTY"]`. |
| `cb4dae90`, `35dc817f` | **Substantive.** §A.2 stops routing the `docType` conjunct as a divergence from FSPEC `BR-1` — v0.11/v0.12 restated BR-1 as the two-conjunct rule, so §I.3's gate now *implements* BR-1 rather than diverging from it. **ERR-7** and **ERR-3** marked **CLOSED**; `ERR-2`'s citation de-anchored. |
| `dfd8c1ff`, `bfe58851` | `P-2b` and the `ERR-2` land-proof-retry citation de-anchored to symbol form; evidence-cell wording cleaned. No claim change. |

The load-bearing observation for this confirmation: every substantive move in the TSPEC delta is a
*closure* — TSPEC retiring its own routed divergences now that FSPEC has absorbed them. Nothing
TSPEC decides changed, and the one design element DECISIONS shares with it (§I.3's two-conjunct
`injectHere` gate) is byte-identical at HEAD to `DEC-LI-03`'s decision. So the confirmation question
is again the narrow DEC-ERR-03 one: does anything DECISIONS *says about* TSPEC no longer match what
TSPEC says, or no longer say it the same way.

## Options Considered

## Decision

## Consequences

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
