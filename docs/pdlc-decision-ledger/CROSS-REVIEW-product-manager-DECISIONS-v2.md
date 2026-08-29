# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-decision-ledger/DECISIONS-pdlc-decision-ledger.md (v1.1)
**Date:** 2026-08-28
**Iteration:** 2

## Prior findings — disposition

Delta scope: `git diff afe092a85..HEAD` on the document — 73 insertions, 31 deletions across the
header block, `## Context`, DEC-DECLEDGER-03 / -08 / -12 / -13 / -15 in `## Options Considered`,
the DEC-DECLEDGER-14 / -15 rows of `## Decision`, and three `## Consequences` sub-tables. Version
1.0 → 1.1. I re-read those sections and did not re-litigate the rest.

| Prior | Severity | Disposition | Evidence |
|---|---|---|---|
| F-01 — DEC-DECLEDGER-15's rationale read against a REQ clause that no longer exists | High | **Resolved** | The rejection is now framed as *"the typing an earlier REQ draft carried"*, the *"edit the REQ to match / routed as an erratum"* clause is gone, and the decision states the alignment positively against `REQ-…:22-25` (v1.8 erratum) and `REQ-…:172-173` (both thresholds `non-negative integer`). The trigger row is rewritten to **Fired and closed**, with a live re-open condition (a future REQ re-narrowing to positive integers) rather than a condition already met |
| F-02 — byte arithmetic derived against the retired `maxBytes` 8,000 | High | **Resolved, and re-derived correctly** | I re-did every figure. `12,500 − 1,200 = 11,300` allowance; worst standing case `10,859` (`TSPEC-…:422`, `M-7b`'s 63 records) leaves **441** slack (DEC-DECLEDGER-12); project-level `6,305` leaves **4,995** (DEC-DECLEDGER-13); `6,305 / 41 = 153.8` supports the *"~154-byte mean line"* and `4,995 / 154 ≈ 32` more records, against `70 − 41 = 29` on the entry cap — so the document's conclusion that the **entry** bound binds first is right, and it says so. The trigger row's *"~44 promoted records"* is replaced by **70**, with `11,300 / 154 ≈ 73` given as the reason the entry cap fires first |
| F-02 (second half) — DEC-DECLEDGER-03's rejection rested on a ground the raise falsified | High | **Resolved on a stronger ground than I asked for** | The decision now concedes the order is inert again at the Baseline commit *for a different reason than the draft gave*, then rests the refusal on ground that survives: inertness is a measurement at one commit, C-5's thresholds are operator-configurable non-negative integers, so a lowered threshold fires the order on the next dispatch — *"an unspecified order is unfalsifiable exactly when it goes live"*. It also states explicitly that **which** bound fires first is corpus-dependent and assumed nowhere |
| F-03 — header pinned Baseline v1.1 while the budget depends on v1.2's `M-7` ids | Medium | **Resolved** | Header now reads **v1.2**, matching `pdlc-decision-corpus-baseline.md:7`, REQ (`:14`) and FSPEC. `M-7a`/`M-7b`/`M-7c` resolve (`pdlc-decision-corpus-baseline.md:109-111`), and the Context section names what each one carries |
| F-04 — *"Two errata are open"* against four enumerated ids | Medium | **Resolved** | Risks accepted now reads *"Two of the four errata TSPEC §9.2 carries are still open: `ERR-3` and `ERR-4`, both FSPEC-owned"*, records `ERR-1`/`ERR-2` as closed in REQ v1.8, and the DEC-DECLEDGER-14 row is re-pointed at `ERR-3 (open, FSPEC-owned)`. Both closures verify against `REQ-…:22-25` |
| F-05 — DEC-DECLEDGER-08 cited NG-6 more broadly than NG-6 is written | Low | **Resolved** | Both the Context constraint row and the decision now say the refusal rests on the frozen `MODULE_NAMES` list and NG-6's *spirit*, and state outright that NG-6 forbids runtime changes only, expressly permits an engine-side test, and that `prepack.mjs` is a pack-time build script a literal NG-6 would not forbid. I re-verified the list is a frozen four-entry vendoring list (`pdlc/engine/scripts/prepack.mjs:20`) |

My v1 Q-01 is also answered in place: DEC-DECLEDGER-13 now shows the whole-fixture `omitted[]`
conjunct survives the raise, because `maxEntries` 70 alone forces at least `141 − 70 = 71`
omissions — so the oracle does not go vacuous. Q-02 is answered by DEC-DECLEDGER-12's new
*"drawn from the same 12,500 … a raise spends the margin twice"* sentence.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
