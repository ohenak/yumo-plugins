# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.1, `34beffcbc`)
**Date:** 2026-08-28
**Iteration:** 2
**Scope:** Delta re-review against `CROSS-REVIEW-test-engineer-REQ-v1.md`. Diff base `990c09aba`
(the commit carrying v1 of this review) → `HEAD`. Changed sections only: §1, §2 G-1..G-4,
§3 NG-4/NG-6/NG-7, §4 C-1..C-5, §5 REQ-DECLEDGER-01..08, §6 R-1..R-5, §7 O-1..O-4 + A-3, §8.

## Round-1 finding disposition

| v1 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | G-1 now requires exactly two fields plus a source citation; the "phase/round it closed in" field — present in no shipped record shape — is gone, and absent origin/evidence data is explicitly "not a defect". No implementation-echo left in the field list. |
| F-02 | High | **Resolved** | REQ-DECLEDGER-03's Who is now the reviewer, not the driver; the observable moved to prompt text ("no parser compares citations"). REQ-DECLEDGER-08 pins the driver side as unchanged, so no invented driver observable remains. |
| F-03 | High | **Resolved** | Evidence novelty is declared a reviewer judgement, deliberately not a machine predicate, and the rule text carries one in-example and one out-example. A tester now asserts exemplar presence in the prompt rather than a pass/fail boundary that could not be written. |
| F-04 | High | **Partially resolved — see F-12** | Per-document "relevance" is gone, replaced by a stated in-scope set, and AC-01 now names set equality explicitly. But the set is not derivable against HEAD's corpus (F-12). |
| F-05 | High | **Resolved** | REQ-DECLEDGER-08 pins the erratum-minting and the fail-closed confirmation read as identical flag-on/flag-off, making NG-4 falsifiable by a two-run replay over one fixed reviewer output. |
| F-06 | Medium | **Resolved** | G-4 is now labelled non-binding with no acceptance criterion, and its measurement source moved to committed `CROSS-REVIEW-*` artifacts, which exist every round regardless of any flag. §8 records the deliberate absence. |
| F-07 | Medium | **Partially resolved — see F-13** | The driver-side/reviewer-side key conflict is reconciled against `DEC-LOOPECON-06`, but the AC's observable is now named twice, inconsistently. |
| F-08 | Medium | **Resolved** | REQ-DECLEDGER-04 now states both paths — every source unavailable → full fallback; one record of several → that line omitted, rest render — with the safe direction argued. |
| F-09 | Medium | **Resolved** | `maxBytes` is pinned to the rendered index block alone, and REQ-DECLEDGER-07 enumerates the three boundary cases (zero in scope, `maxEntries` `0`, single oversized line omitted whole, never truncated mid-line). |
| F-10 | Low | **Resolved (routed)** | C-2 now routes the baseline commit identity and its pinning to O-4 as TSPEC material, which is the right altitude. |
| F-11 | Low | **Resolved** | C-3 declares the block holds exactly three keys and calls the enumeration exhaustive; REQ-DECLEDGER-05 restates the check as set equality over that enumeration crossed with {wrong type, malformed, absent}. |

Every cross-feature citation added or re-pointed this round resolves and says what the REQ claims:
`DEC-ERR-01` (`docs/_decisions/DECISIONS-review-severity-bars.md:88`, summarised at
`pdlc/OPERATIONS.md:29`) — the v1 mis-citation to `DECISIONS-erratum-routing.md` is corrected;
`DEC-LOOPECON-06`'s identity triple (`docs/completed/pdlc-loop-economics/DECISIONS-pdlc-loop-economics.md:163-173`);
`REQ-LOOPECON-01b`'s recompute-at-dispatch contract
(`docs/completed/pdlc-loop-economics/REQ-pdlc-loop-economics.md:146-155`);
and NG-6's newly named engine precedents both exist
(`pdlc/engine/__tests__/learnings-config-example.test.js`, `loop-config-example.test.js`),
as does `pdlc/workflows/__tests__/learningsBaselineGuard.test.js`.
