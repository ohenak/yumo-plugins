# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.2)
**Date:** 2026-08-28
**Iteration:** 3
**Scope:** delta re-review of `git diff 34beffcbc..ba52b2460` on the REQ; prior findings in
`CROSS-REVIEW-software-engineer-REQ-v2.md` re-checked. Unchanged sections already approved are not
re-litigated.

## Prior-Round Disposition

| Prior ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | G-1 now states the unit explicitly — "**its unit is the individual decision, not the file**: a decision is in scope when it carries a decision id in the project's `DEC-{NAMESPACE}-{NUMBER}` convention (O-3)" — and adds the fail-open complement "A file with no decision id contributes zero lines: an ordinary empty result, not a failure" (§2 G-1). REQ-DECLEDGER-04's degradation clause was re-cut to the same unit ("Where **one decision of several** fails to render … no-id files are not this path — G-1"), so the two no longer read against each other. With the unit pinned to the id-bearing decision, the in-scope set at HEAD is computable: 41 id-bearing decisions across the 11 `DECISIONS-*.md` files under `docs/_decisions/` that carry them, 0 from the four files that carry none (`CONSOLIDATION-PROPOSAL-2026-07-29.md`, `-2026-08-19-1.md`, `-2026-08-27-1.md`, `DECISIONS-advisory-wave-gate-questions.md`), so AC-01's set-equality expectation is now derivable rather than reader-dependent. |
| F-02 | Medium | **Resolved** | `maxEntries` moved `40` → `60` with a measured rationale, and both numbers verify at HEAD: id-bearing decisions under `docs/_decisions/` = **41**, largest feature record = **14** (`docs/completed/pdlc-headless-engine/DECISIONS-pdlc-headless-engine.md`; runners-up 11 for `pdlc-learnings-injection` and `pdlc-advisory-tier`), 41 + 14 = 55 < 60. A-1 and R-5 were both re-cut to say `maxEntries` is measured while `maxBytes` remains an analogy, so the three sites now agree. |
| F-03 | Medium | **Resolved** | REQ-DECLEDGER-03 now states the application basis: "The test reads the **cited record**, not the line alone: the line need not carry the decision's own citations." That closes the gap between REQ-DECLEDGER-01's "no other field is required" and the novelty test's exemplars. |
| F-04 | Low | **Resolved** | G-4's measurement basis is now "read against **G-1's in-scope decision ids**" rather than `docs/_decisions/` alone, so the retrospective metric and the indexed set are the same set. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
