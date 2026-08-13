# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md` (v0.5)
**Upstream read:** `REQ-pdlc-engine-distribution.md` (AC-2.4, AC-5.3), `FSPEC-pdlc-engine-distribution.md` (§5.2, AT-2.5, AT-3.8b)
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v4.md` (Needs revision — 1 High, 1 Medium, 1 Low)
**Diff reviewed:** `fb831c7e^..HEAD` on the TSPEC (156 +/50 −)
**Date:** 2026-08-13
**Iteration:** 5
**Scope:** Delta re-review. Only v4's findings and this round's changed sections. Unchanged sections already approved are not re-litigated.

## 1. Prior findings disposition

| v4 ID | Severity | Status | Evidence in v0.5 |
|---|---|---|---|
| F-01 | High | **Resolved** | §5.4's FSPEC-§5.2 unblocking note now names the **vendored** members — "PK-20 (`vendor/workflows/orchestrate-dev.js`), PK-21 (`vendor/workflows/orchestrate-queue.js`) and PK-22 (`vendor/workflows/VENDOR-MANIFEST.json`) … and nothing else" (`:375-379`) — and says explicitly that AT-3.8b's expected set is defined by *that* sentence, so a PLAN author transcribing it lands on the vendored three. The renumbering that caused the stale line is named in place rather than quietly overwritten. §5.4's own summary sentence (`:352-354`) and the new note now agree |
| F-02 | Medium | **Resolved**, and beyond the ask | The finding asked only that the `E-nn`/`E-nn` collision be *disambiguated*; the revision renamed the whole packed set to `PK-nn` and stated the rename's motive in the section itself (`:294-302`). I re-grepped the document for surviving `E-nn` tokens: every one left (`:237`, `:487`, `:508`, `:1082-1083`, `:1296-1298`, `:1377-1393`, `:1420`) is an FSPEC **error** id in §6, §8.5, §10 or §11 — no packed member is still called `E-nn` outside the historical changelog rows, which the section says are quoted as written at the time |
| F-03 | Medium | **Resolved** | §12.1's module-side row now reads "kinds 1 and 2 against `orchestrate-dev.js`; kinds 3 and 4 across both modules" (`:1411`) and gives the reason in the row — two of kind 4's five helpers are queue-side. Re-verified at HEAD: `commitQueueRow` `orchestrate-queue.js:1598`, `commitAdvisoryRecord` `:1637`, both in the queue module, so the corrected split is the true one |

All three closed on their own terms, and F-02's closure removed the collision rather than
annotating it. The blocker below is new work introduced by this round, in the section this
round rewrote.

## 2. Findings

## 3. Questions

## 4. Positive Observations

## 5. Recommendation

## Verdict
