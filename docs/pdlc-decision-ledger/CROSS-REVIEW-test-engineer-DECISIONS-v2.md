# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/DECISIONS-pdlc-decision-ledger.md` (Version 1.1)
**Date:** 2026-08-28
**Iteration:** 2

Delta re-review. Base commit for the diff is `1b0e749e4` (the commit carrying my v1); the document
moved across eight commits `b6f967c38 … dfa9496b2`. I re-verified every v1 High against HEAD and
scanned only the changed hunks for new issues. Unchanged sections — DEC-DECLEDGER-01/-02/-04/-05/-06/
-07/-09/-10/-11/-14's mechanism, the Decision table's untouched rows, the Risks list's first three
bullets — were not re-litigated.

**All five v1 blocking findings are resolved, and the arithmetic behind them re-derives correctly.**
One new High enters with the F-04 remediation itself: the errata renumbering pairs
DEC-DECLEDGER-14 with the wrong erratum id.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **DEC-DECLEDGER-14 is routed to the wrong erratum id — it is `ERR-4`, not `ERR-3`.** The new text states it twice: the Decision table row reads "routed upstream as `ERR-3` (open, FSPEC-owned)" (L272) and the Risks bullet reads "DEC-DECLEDGER-14 is the design-side half of `ERR-3`" (L312). Against the cited authority, TSPEC §9.2 holds `ERR-3` = *FSPEC AT-02's Then clause is written against a citation format this spec retired* (`TSPEC-pdlc-decision-ledger.md:1332`), and `ERR-4` = *FSPEC AT-03's Given … is contradicted by AT-01's frozen-fixture requirement* (`:1341`) — the `_readFile`-double substitution that DEC-DECLEDGER-14 *is*. TSPEC's own D-11 row says so in terms: "Raised at the FSPEC as ERR-4" (`:1286`). DEC-DECLEDGER-14's `Traces to` column already reads `§7.6 / D-11`, so the document cites the right TSPEC decision and the wrong erratum beside it. The open **set** `{ERR-3, ERR-4}` is correct and both are FSPEC-owned, so the count survives; what does not is the routing. A PLAN or FSPEC author following L312 lands on AT-02's heading-citation wording, concludes AT-03's contradiction is unrouted, and either re-raises it or leaves the digest-guard/fixture-mutation collision to surface at implementation — which is precisely the AT-01-vs-AT-03 red the decision exists to pre-empt. Swap both mentions to `ERR-4`. | § Decision, `DEC-DECLEDGER-14` row (L272); § Consequences → Risks accepted (L311–313) |
| F-02 | Medium | Local | **Three of the new byte figures are attributed to a TSPEC section that still carries the 8,000-based arithmetic they replace.** DEC-DECLEDGER-12 now reads "Against REQ C-5's shipped `maxBytes` 12,500 the allowance left for records is 11,300, and the G-1-scoped worst standing case renders 10,859 (TSPEC §3.6, `M-7b`'s 63 records) — **441 bytes of slack**" (L204–208), and DEC-DECLEDGER-03/-13 derive from the same 11,300. I re-executed the chain and it is internally sound: `12,500 − 1,200 = 11,300`; §3.6's table gives 63 lines / **10,859** shipped-form bytes (`TSPEC:422`); `11,300 − 10,859 = 441`; `10,859 + 1,200 = 12,059`, which §3.6 itself states at `:472`; `11,300 − 6,305 = 4,995` and `6,305 / 41 = 153.8` give the "~32 more" and `70 − 41 = 29` the entry-bound figure, so the trigger row's "roughly 73 records, entry cap fires first" checks out. The problem is the citation target, not the sum: §3.6's prose around `TSPEC:435–443` still computes "`8000 − 1200 = 6,800`", still reports "**~495** bytes of headroom", still concludes "**the order is live under shipped defaults**", and D-10 (`:1285`) restates the 6,800-byte allowance verbatim — the direct negation of what this document now derives at L92–99. A reviewer re-verifying DECISIONS against its named source finds the source disagreeing. The numbers this document *quotes* from §3.6 (10,859, 12,059) are the ones §3.6 got right; the derived ones (11,300, 441, 4,995) exist nowhere upstream yet. This is a TSPEC defect, raised as an erratum rather than edited here; DECISIONS' own mitigation — DEC-DECLEDGER-10/-12's trigger row demanding §3.6 be re-measured "in one pass" (L298) — is the right instrument and should name §3.6's surviving 6,800/495/"order is live" prose as the specific outstanding re-measurement, so the obligation is checkable rather than general. | § Options, `DEC-DECLEDGER-12` (L204–208), `DEC-DECLEDGER-13` (L215–222); § Re-evaluation triggers (L298) |
