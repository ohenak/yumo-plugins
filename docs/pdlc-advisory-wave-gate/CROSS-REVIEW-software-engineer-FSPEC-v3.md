# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.2, 2026-08-18)
**Date:** 2026-08-18
**Iteration:** 3
**Scope:** Delta re-review of v1.2 against `CROSS-REVIEW-software-engineer-FSPEC-v2.md`. Diff base `dcc935e1` (v1.1, the bytes v2 reviewed) → HEAD; three FSPEC commits (`73cb939f`, `ebe0b443`, `0e73ea02`), 19 insertions / 17 deletions. Changed sections only. Reviewed on `feat-pdlc-advisory-wave-gate`.

## Prior Findings Disposition

All three v2 findings addressed; all three resolved.

| v2 id | Sev | Disposition | Evidence in v1.2 |
|---|---|---|---|
| F-01 | High | **Resolved** | BR-11 now defines the seam-budget window as "one A6 dispatch, measured dispatch→verdict … **not** cumulative across the wave" and says the budget is re-armed for each of up to `advisory.attemptBudget` cycles (FSPEC:211-213). That is exactly REQ AC-2.4's wording (`REQ:299`) and exactly what the shipped tier does: the deadline is constructed fresh per attempt and raced against that attempt's dispatch (`pdlc/workflows/orchestrate-dev.js:3371-3384`, race `:3417`), with `budgetExceeded` called with `elapsedMs: 0` because wall-clock exhaustion is enforced solely by that per-attempt race (`:3430`, `:3461`). NFR-4's carve-out is now called inherited and structural — the gate command runs between dispatches, never inside a dispatch→verdict window (FSPEC:214-216) — which is true of the shipped seam loop: `verifyGate` runs after the raced dispatch returns, outside the race. E-25 and AT-02-7 were restated to the same window (FSPEC:288, :354). No new budget mechanism is added; C-1's "inherited contracts used unchanged" holds. |
| F-02 | Medium | **Resolved** | E-33 now states the key "validates as a **non-negative** integer — a distinct variant from the shipped positive-integer validator, which rejects `0` and substitutes the default" (FSPEC:290), naming the exact hazard I measured at `orchestrate-dev.js:1991-1997`. AT-07-2b carries the round-trip companion: "`0` in yields `0` back, and the key is absent from the invalid-key report — an assertion the shipped positive-integer validator fails" (FSPEC:442). Red-today, so the divergence cannot be implemented away by reuse. |
| F-03 | Low | **Resolved** | E-33 now sits after E-28; §5.4 runs E-20…E-28, E-33 in id order (FSPEC:281-290). |

## Findings

## Questions

## Positive Observations

## Recommendation

