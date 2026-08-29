# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/DECISIONS-pdlc-decision-ledger.md` (v1.2)
**Date:** 2026-08-28
**Iteration:** 3

Delta re-review. Base commit `b9849cbd7` (the commit carrying my v2); the document moved
across three commits since (`ec3b4f391`, `9cfcba84b`, `3c4b499c4`), 17 insertions / 6 deletions.
Changed surface: the header block (Version 1.1 → 1.2, cross-review glob `v{N}`), one added
paragraph in `## Context`, `DEC-DECLEDGER-14`'s row in `## Decision`, the
`DEC-DECLEDGER-10, DEC-DECLEDGER-12` re-evaluation trigger row, and the fourth Risks-accepted
bullet. I scanned only those hunks for new issues and re-verified my one prior finding at HEAD.
Sections approved in earlier rounds were not re-litigated.

## Prior findings disposition

| Prior | Severity | Disposition | Evidence |
|---|---|---|---|
| F-01 — the derived byte figures (11,300 / 441 / 4,995) had no upstream home, and the cited site (TSPEC §3.6) still computes `8000 − 1200 = 6,800`, with nothing warning the reader that the propagation was outstanding | Medium | **Resolved** | The gap I asked to be closed with "one clause" was closed with two, in both places a reader can arrive from. `## Context`'s citation rule now carries an explicit exception paragraph: §3.6 "has not yet taken REQ v1.8 — it is pinned at REQ v1.7 / Baseline v1.1", its *derived* figures are "pre-raise, pending `ERR-2`'s propagation", the *quoted* figures are unaffected "because they are measurements of the corpus rather than of the bound", and the derived 11,300 / 441 / 4,995 "have no upstream home until §3.6 is re-measured". Every one of those claims checks out at HEAD: TSPEC's header pins REQ v1.7 / Baseline **v1.1** (`TSPEC-pdlc-decision-ledger.md:8-12`); §3.6 still computes `8000 − 1200 = 6,800` (`:435`) and still concludes *"the order is live under shipped defaults"* (`:433`); the quoted 6,305 and 10,859 are §3.6's own corpus rows (`:419`, `:422`) and are bound-independent, so they survive the raise unchanged. The quoted/derived split is the right distinction to have drawn — it tells a reader exactly which of this document's numbers a §3.6 re-measurement will and will not move |

The document also closed the High that the test-engineer's v2 raised on the same round's
remediation (DEC-DECLEDGER-14 pointing at `ERR-3`). I re-checked it because it sits inside my
changed surface: TSPEC §9.2 defines `ERR-3` as FSPEC AT-02's retired citation-format clause
(`TSPEC-pdlc-decision-ledger.md:1332`) and `ERR-4` as AT-03's Given contradicting AT-01's frozen
fixture (`:1341`), and D-11 raises the `_readFile`-double decision "at the FSPEC as ERR-4"
(`:1286`). Both sites now read `ERR-4` (Decision row; Risks bullet), and the Risks bullet goes
further than the correction needed by naming what `ERR-3` *is* and stating that no decision here
pairs with it — which is what stops the next reader re-deriving the same mis-pairing.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **The new discharge list is stated as complete ("Those five sites are the discharge list") but is a containment, not a set-equality — at least one pre-raise site sits outside it.** The `DEC-DECLEDGER-10, DEC-DECLEDGER-12` trigger row enumerates five §3.6/D-10/§7.3 sites, and each of the five is real at HEAD: §3.6's `8000 − 1200 = 6,800` (`TSPEC-pdlc-decision-ledger.md:435`), its *"~495 bytes of headroom"* (`:436`), its *"the order is live under shipped defaults"* (`:433`), D-10 restating the 6,800-byte allowance in its rejected-alternative clause (`:1285`), and §7.3's *"At 141 records the byte bound binds"* (`:954`). But §4.3's framing-budget rationale also derives from the retired bound — *"§3.6's ~495 bytes of headroom shrink one-for-one with any raise, so the task that writes `DECISION_LEDGER_RULE_TEXT` either fits the budget or re-opens the arithmetic together with ERR-2"* (`:630`) — and it is in none of the five: it is not in §3.6, not D-10, not the §7.3 sentence quoted. Within §7.3 the same is true of *"6,305 index bytes against a 6,800-byte allowance leave nothing to drop"* (`:958`) and *"Under the shipped bound roughly two do (§3.6's ~495 bytes of headroom…)"* (`:964`), which the row's single quoted sentence does not obviously reach. The content is right and the direction is right; the defect is the completeness claim wrapped around it. A TSPEC author discharging `ERR-2` against this list one site at a time lands exactly the failure the row's own first clause warns against — "in one pass, not one figure at a time" — and leaves §4.3 telling the reader the framing pin costs 495 bytes of headroom that no longer exist. Fix is one word plus one site: say the five are the §3.6/D-10/§7.3 sites *and* name §4.3's derived `~495` (or drop "the discharge list" for "the sites in §3.6, D-10 and §7.3", so the row stops promising an enumeration it has not made). | REQ C-5; REQ-DECLEDGER-07 |

## Questions

## Positive Observations

## Recommendation

## Verdict
