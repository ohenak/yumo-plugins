# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` (v1.4)
**Date:** 2026-08-03
**Iteration:** 4
**Scope:** delta confirmation of the v1.4 erratum only (`b81d7d4..HEAD`). I approved this REQ at v1.3 (`APPROVAL-HASH` in v3, `REVIEWED-COMMIT: b81d7d4`); this round asks one question — does the erratum resolve the routed items without breaking what was approved. Unchanged sections are not re-read or re-litigated. Not product strategy, not architecture.

## Erratum Item Closure

The routed items deduplicate to six distinct defects (the list carries each once per reviewer who
raised it). All six are closed. Each row names the changed text and the oracle it now makes writable.

| # | Item (raised by) | Closed by | Status |
|---|---|---|---|
| 1 | §1 seam-table row A2 describes the stale-REQ re-grounding obligation as already living inside the Phase-0 triage prompt (se-review, pm-author, te-review) | The row now reads "Stale-REQ re-grounding — **no such gate exists today**; this feature introduces A2's trigger", with the Today column "nothing fires; a stale REQ runs unnoticed" (`:35`). Verified against the pinned base: `26c3f1c:pdlc/workflows/orchestrate-queue.js` triage prompt carries only `Also flag if the REQ references subsystems that do not yet exist` and `Do NOT modify any files` — no re-grounding obligation, and no verdict token distinguishing staleness from a dependency stop. AC-5.5 was updated in the same edit to match ("Today's stop is one free-text signal and A2's gate does not exist"), so §1 and REQ-ADV-05 now agree. | **Closed** |
| 2 | AC-4.5's A1 gate row is vacuous — the named gate is a pure function of unchanged inputs (se-review, pm-author; my own v3 **F-21**) | The A1 row is now `**none** — A1 changes no file, so no gate's inputs change and no re-run could differ; the dependency pre-check runs **before** the adjudication (AC-5.1)`, state-to-reach `n/a — pre-condition, not post-action gate` (`:181`). AC-5.1's matching clause changed from "is the gate AC-4.5 re-runs" to "runs before any advisory agent as a pre-condition, not as an AC-4.5 post-action gate" (`:198`). This is F-21's suggested resolution taken: the tautological oracle is gone, and the A1 safety property a test can actually falsify is AC-5.1's `escalate`-when-unsettled routing. | **Closed** (F-21 closed) |
| 3 | AC-1.7's `seamBudgetMinutes` default of 10 is below the pipeline's own 30-minute CI completion cap, so `attemptBudget` can never bind at A5 (se-review, pm-author) | AC-1.7's cell now reads "advisory working time per seam invocation, **excluding** check-rollup wait (NFR-4)" (`:100`), and NFR-4 (`:328-331`) carries the carve-out plus the arithmetic that makes it load-bearing. The two now say the same thing as FSPEC V-5 / A5-3, so REQ and FSPEC no longer disagree on what the ten minutes measures. | **Closed** |
| 4 | AC-8.2 defines one attempt as *fix → push → re-poll*, which does not cover E-1's re-run-only cycle (te-review, pm-author) | AC-8.2 now reads "One attempt is one **act→re-poll** cycle, the act being either a pushed fix (E-2) or a re-run on the unchanged commit (E-1, which pushes nothing) — so E-1's re-run-only cycle counts as one attempt on the same budget" (`:250-252`), and AC-1.7's budget row was changed to "act→re-poll" in the same edit (`:99`). E-1's own decidable rule already caps on `advisory.attemptBudget` (`:129`), so the three statements are now consistent and the budget-counting oracle for an E-1-only invocation is determinate: N re-runs on an unchanged sha consume N attempts. | **Closed** |
| 5 | AC-9.3 binds distil-and-delete to "after Phase PUB" but Phase MERGE runs after PUB and merges the PR raised there (se-review) | AC-9.3 now states "MERGE runs after PUB and merges the PR raised there, so the distil-and-delete is pushed **before** MERGE evaluates the PR: the merged branch carries the LEARNINGS content, not the record" (`:283-285`). That is an assertable property of the merged tree, not just of the working tree at end of run. | **Closed** |
| 6 | AC-9.1 requires a record for A1/A2 but AC-9.3's harvest presumes a run that reaches Phase PUB, which a `hold`/`escalate` candidate never has (se-review) | AC-9.1 now states the record is written under the **candidate feature's** directory and that a `hold`/`escalate` adjudication "leaves it for that feature's next run to harvest at Phase PUB (AC-9.3)" (`:273-275`). The record has a named location and a named (conditional) end of life; see Q-11 for the residual case where that next run never comes. | **Closed** |

## Regression Check

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
