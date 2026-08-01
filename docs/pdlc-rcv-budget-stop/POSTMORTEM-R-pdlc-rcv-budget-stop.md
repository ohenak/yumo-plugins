# POSTMORTEM — Phase R (REQ review loop) — pdlc-rcv-budget-stop

| Field | Value |
|---|---|
| Upstream | `REQ-pdlc-rcv-budget-stop.md` (v1.6, `c74d1ed`) → **POSTMORTEM-R** |
| Downstream | `LEARNINGS-pdlc-rcv-budget-stop.md`, `docs/_queue/QUEUE.md` (row `Order 10`) |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v{1..5}.md` — ten files, all on `feat-pdlc-rcv-budget-stop` |
| LEARNINGS | `docs/pdlc-rcv-budget-stop/LEARNINGS-pdlc-rcv-budget-stop.md` |
| Author | pm-author (Claude) |
| Date | 2026-08-01 |
| Version | 1.0 |
| Scope | Non-convergence of the REQ cross-review loop for `pdlc-rcv-budget-stop`. Not a product-decision record; not a technical design record; not a re-review of the REQ. |

---

## Phase

**Phase R — REQ authoring and cross-review**, feature `pdlc-rcv-budget-stop`, branch
`feat-pdlc-rcv-budget-stop`, queue `Order 10`.

The phase ran the standard author → dual cross-review → address → re-review cycle five times and hit
the five-iteration ceiling (`MAX_REVIEW_ROUNDS = 5`) without a dual **Approved**. REQ **v1.6**
(`c74d1ed`, 486 lines / 61,101 bytes) exists on the branch, addresses all four round-5 blocking
findings, and **has never been reviewed**. FSPEC was never entered.

Two facts about this feature's provenance matter for reading the rest of this document.

1. **This REQ is one of five split out of a predecessor that failed the same way.**
   `docs/discarded/pdlc-review-convergence/REQ-pdlc-review-convergence.md` (v1.8) was superseded on
   2026-08-01 by a split into `pdlc-rcv-budget-stop` (this REQ, `REQ-RCV-01`),
   `pdlc-rcv-fixed-point-stop` (`REQ-RCV-02`), `pdlc-rcv-panel-topology` (`REQ-RCV-03/04`) and
   `pdlc-rcv-finding-quality` (`REQ-RCV-05/06`). The split was itself a remediation: the predecessor
   was 581 lines / 83 KB and the split was made at the REQ-RCV-01 / REQ-RCV-02 seam, with the shared
   facts extracted into `docs/_constraints/pdlc-rcv-baseline.md` and
   `docs/_constraints/pdlc-rcv-catalogue.md`, precisely so that each successor would fit inside the
   700-line / 61,440-byte REQ size budget and be reviewable in fewer rounds. **The split reduced the
   document; it did not reduce the round count.**
2. **The mechanism that would have stopped this loop is queued behind it.** `pdlc-rcv-fixed-point-stop`
   (`Order 17`) — the fixed-point stopping rule — declares `depends-on: pdlc-rcv-budget-stop`, and
   both of its tests are stated over the window origin `W` this REQ defines. So the loop that could
   not stop is the one whose successor exists to stop it, and it cannot borrow the fix. This is the
   third consecutive feature in this family to hit five rounds in Phase R
   (`pdlc-workflow-distribution`, `pdlc-review-loop-hardening`, and now this one), and the second in
   which the REQ under review was itself about review-loop termination.

---

## Iterations (5 — limit reached)

## Reviewers

## Pattern of Disagreement

## Best-Guess Root Cause

## Recommendation
