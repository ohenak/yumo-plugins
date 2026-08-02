# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v2.7)
**Date:** 2026-08-01
**Iteration:** 2
**Scope:** Delta re-review of v2.6 → v2.7 (`git diff e9dda97..HEAD`). Prior findings F-01 … F-08 verified for closure; new issues sought **only** in the changed sections. Technical lens only.

## Prior findings — disposition

| v1 | Verdict | Evidence checked at HEAD |
|----|---------|--------------------------|
| **F-01** (no owner for export-vs-duplicate; blast radius unenumerated) | **Closed** | AC-1.2 now quantifies "one" over the repository and explicitly names the failure mode (a duplicate not updated in the same commit); **O-13** owns both halves — (a) decide how test code obtains the effective budget, (b) enumerate every width-5 assertion before the change, naming the three suites including the AT whose *title* carries the width. The decision is correctly left to TSPEC while the *outcome* is fixed here. One residue survives — see F-02 below. |
| **F-02** (`A = H` justification falsified by AC-1.4) | **Closed** | AC-1.5(1) now reads *"what stops it is the shipped step-G refusal, not the counts"*, traces the region to `H = 1, A = 0`, and says explicitly that the counts are what the *next* clearance will spend. BL-06 was extended to cover the second-force clause, and O-10's leg now says "refused as unresolved (M-7a)" rather than "changing nothing". Correct. |
| **F-03** (queue-distance premise falsified; paired edge) | **Closed** | §3.1 and R-14 carry **10 → 12 → 13 → 17 → 18**, derive it from the driver's actual rule (lowest pending `Order`; an absent dependency deferred to triage), state that QUEUE.md's gloss is superseded and where the table is corrected, and R-14 adds residual (ii) — machine-written `WINDOW-RESUMED:` lines landing in unvalidated regions from row 17, explicitly *not* covered by "no wider than HEAD's". Verified: rows 12/13/17/18 all carry `ready: true`; row 13's only dependency (`pdlc-workflow-distribution`) is absent from the table, having merged. The paired end landed in the **same revision** — `REQ-RCV-07` X-07 and R-16 both carry the identical order and the identical two residuals. |
| **F-04** (no owner for "rounds this entry ran") | **Closed** | **O-14** owns producing it, §6 declares the render `Iterations (budget {MAX_REVIEW_ROUNDS}, rounds run {k})`, and baseline §3 carries the row (`pdlc-rcv-baseline.md:249`) attributed to RCV-01. The equality-not-substring point is right. *But the new AC-1.4 clause makes the render unreachable on the case AC-1.3 names — F-01 below.* |
| **F-05** (zero-round halt re-authors the operator's post-mortem) | **Closed on the mechanism, opened on a consequence** | AC-1.4 gains an explicit *no re-author* criterion (no authoring dispatch, every other section byte-unchanged), §2's value claim now depends on it, and O-10 adds a re-halt leg asserting **0** authoring dispatches plus a byte comparison with the region span excised. The stated fix is the right one; its collision with AC-1.3 is F-01. |
| **F-06** (`PHASE_DISPATCH` membership claim) | **Closed** | AC-1.1 no longer names the dispatch table: the discriminator is now *"the phase names a document type"*, justified from M-1d (the window is counted from that document type's basenames). No NB-4 violation remains. |
| **F-07** (durable home has an undocumented deleter) | **Closed** | §4.1 gains the harvest paragraph and §7 gains **NB-5**, both stating the post-harvest `forcePhases` re-entry lands on `W = 1, H = A = 0` — the same default as a feature that never halted — and that a harvest-surviving home is a new artifact, hence a new REQ. |
| **F-08** (AC-1.2 observable quantified over exempt entries) | **Closed** | The observable is now split: document-typed entries run from `W`, untyped loops get the same width with an unconstrained origin. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
