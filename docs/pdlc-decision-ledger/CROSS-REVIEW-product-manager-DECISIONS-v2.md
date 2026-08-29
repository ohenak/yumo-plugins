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

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **The revision derives its own byte allowance while pointing readers at a cited site that still carries the pre-raise numbers, and nothing in the document says so.** The header rule (lines 53-59) promises measurements are *"cited, never restated … so a re-measurement moves one site"*, and names TSPEC §3.6 as the site for byte figures. The Baseline half of that promise now holds — the v1.2 re-pin is real. The byte half does not: DEC-DECLEDGER-12 and -13 derive **11,300**, **441** and **4,995** in this document, while the site they send a reader to still computes `8000 − 1200 = 6,800` with *"~495 bytes of headroom"* (`TSPEC-…:435-436`), still names `maxBytes: 8000` as C-5's shipped default in §7.3, and still presents `ERR-1`/`ERR-2` as open in §9.2 — TSPEC is pinned at REQ v1.7 / Baseline v1.1 (`TSPEC-…:9-11`) and has not taken REQ v1.8. Each individual citation this document makes is accurate (10,859 and 6,305 are genuinely at `TSPEC-…:419-422`), so no stated fact is wrong; the hazard is that a reader following the citation to check the arithmetic lands on numbers that contradict it, with nothing warning them the propagation is outstanding. The fix here is one clause — say that §3.6's derived headroom figures are pre-raise pending `ERR-2`'s propagation, and that this document's 11,300/441/4,995 are the current ones. The re-measurement itself is TSPEC's to land and is routed as an erratum, not asked of this author | REQ C-5, REQ-DECLEDGER-01 |

FINDING: Medium | delta | local | Context §"Measurements are cited, never restated" + DEC-DECLEDGER-12/-13 | Document derives 11,300/441/4,995 against `maxBytes` 12,500 while the site it cites for byte figures (TSPEC §3.6) still computes the retired 8,000 arithmetic; each citation is accurate but the reader who follows one meets contradicting numbers with no note that ERR-2's propagation to TSPEC is outstanding

## Questions

| ID | Question |
|----|---------|
| Q-01 | DEC-DECLEDGER-03 now states that over TSPEC §7.3's whole 141-record fixture `maxEntries` 70 fires first and forces at least 71 omissions. I agree, and it is the reason the `omitted[]` conjunct survives the raise. TSPEC §7.3 currently says the opposite in its own rationale (*"At 141 records the byte bound **binds**"*, `TSPEC-…:954`), which was true at 8,000 and is not at 12,500. I have routed that as an erratum against TSPEC rather than asking you to change anything — is your reading the same as mine, i.e. that the §7.3 **oracle** is unaffected (`omitted[]` is non-empty either way) and only its stated reason moves? |
| Q-02 | DEC-DECLEDGER-13's *"~154-byte mean line"* is `6,305 / 41 = 153.8`; TSPEC §3.6 reports the project-level mean as **153** (`TSPEC-…:436`). Both round from the same measurement and neither conclusion turns on the difference (32 vs 32.6 more records). No change wanted — flagging only so the two documents' figures are not read as a disagreement when §3.6 is re-measured |

## Positive Observations

## Recommendation

## Verdict
