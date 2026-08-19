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

Scope of this round: the v1.2 diff only. Two Medium, no High.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **E-30 names the halt report as the carrier for a failed escalation-log write, but the inherited seam machinery carries that failure on the run report's notice channel — AT-06-6 as written is red against a correct reuse.** E-30 says "the carrier is the halt report, which BR-14 already makes carry the diagnosis and root-cause class, so it also states that the log write failed" (FSPEC:299), and AT-06-6 asserts "the failure to log is surfaced in the halt report, the carrier E-30 names" (FSPEC:433). The shipped tier already handles this exact condition and routes it elsewhere: a failed escalation-log write is caught and downgraded onto `_notice`, "the run report's notice channel" (`pdlc/workflows/orchestrate-dev.js:3205-3210` comment, write-failure catch at `:3356-3365`). An A6 that reuses `runAdvisorySeam` unchanged — which C-1 and §1's "shipped behaviour is cited, never restated" both push toward — surfaces the failure as a notice and fails AT-06-6 on the carrier alone, despite behaving correctly. Fix (one sentence): either name the run report's notice channel as the carrier and let BR-14's halt-report content stay about diagnosis and root cause, or state explicitly that A6 additionally re-surfaces the notice in the halt report and price that as new behaviour rather than as inherited. Either reading is fine; the document currently asserts the second while citing the first as already true. | §5.5 E-30, §6.6 AT-06-6, BR-14 |
| F-02 | Medium | Local | **AT-02-7's companion case is absence-only: its sole asserted outcome is that it does *not* escalate.** The companion is "a slow gate command and fast working time … does **not** escalate" (FSPEC:353-354). Under the corrected per-dispatch window this companion is genuinely discriminating (an episode-window implementation would escalate), so it is not decorative — but it states no positive outcome on the same path, so a run that never reached the seam, or one whose wave terminated for an unrelated reason, satisfies it. Fix: pair it with what *does* happen — the wave terminates with its ordinary red-gate disposition (`escalated`, reason not `budget-exhausted`) and one A6 dispatch is counted on that wave. Same treatment AT-02-8 already gives its absent-reason assertion (FSPEC:355). | §6.2 AT-02-7 |

**Erratum raised upstream (unchanged from round 2, still unresolved on HEAD).** REQ NFR-4 still carries the rationale clause "without the carve-out a slow suite ends the invocation inside attempt 1 and `advisory.attemptBudget` never binds" (`REQ:453-456`), which is false under the per-dispatch window REQ AC-2.4 itself pins (`REQ:299`) and under the shipped per-attempt race (`orchestrate-dev.js:3371-3384`, `:3417`): the gate command never runs inside a dispatch→verdict window, so the carve-out is structural and cannot be what makes `attemptBudget` bind. Separately, REQ's config table describes `advisory.seamBudgetMinutes` as "working time per **wave** invocation" (`REQ:205`), which reads as the episode window AC-2.4 explicitly rejects. The FSPEC author correctly declined to fold either into v1.2. Both re-emitted as `ERRATUM: REQ` lines.

## Questions

| ID | Question |
|----|---------|
| Q-01 | With the window now per-dispatch, total A6 wall-clock on one wave is bounded only by `attemptBudget × (seamBudgetMinutes + gate runtime)`. That is the shipped tier's own property and O-1/O-8 leave the mechanism to TSPEC, so not gating — but is it worth one sentence in BR-11 saying the wave's total A6 time is deliberately unbounded, so no implementer invents a cap? |
| Q-02 | AT-07-1's partition names BR-9…BR-16 non-proposable "by construction". BR-16 is itself the rule that every §4 boundary is script-enforced; is the self-reference intended to be read as vacuously satisfied, or should BR-16 be excluded from the enumeration it quantifies over? Readability only — the partition is total and disjoint as written. |

## Positive Observations

- **F-01 was fixed at the definition, not at the assertion.** BR-11, E-25 and AT-02-7 all moved to the same window in one pass (FSPEC:211-216, :288, :354), and the carve-out was re-explained as structural rather than deleted — so NFR-4 still means something and the companion case in AT-02-7 now discriminates the per-dispatch window from the episode window instead of testing a subtraction nobody performs. That is the harder of the two available repairs and the one that leaves the document honest about what it inherits.
- **The `0` fix was made red-today on purpose.** E-33 does not merely assert non-negative validation; it names the shipped positive-integer validator as the thing it diverges from and AT-07-2b asserts the round-trip that validator fails (FSPEC:290, :442). An implementer who reaches for reuse gets a failing test rather than a silently coerced operator setting.
- **AT-07-1's partition is total and disjoint, and says so.** Proposable {BR-2, BR-3, BR-5, BR-6, BR-7, BR-8} plus non-proposable {BR-1, BR-4, BR-9…BR-16} covers BR-1…BR-16 exactly once (FSPEC:437). BR-16's "every §4 boundary is script-enforced" is now discharged by enumeration rather than sampled — the completeness discipline this pipeline asks for, applied without being asked twice.
- **The erratum was left upstream instead of being absorbed.** v1.2's changelog says so explicitly (FSPEC:16). Repairing a false upstream rationale inside the derived document is the failure mode this protocol exists to prevent, and the author declined it.

## Recommendation

**Approved with minor changes**

No High findings. The round-2 High (BR-11's episode-scoped window) is resolved at the root: the window is now REQ AC-2.4's per-dispatch one, matching the shipped per-attempt race, and NFR-4's carve-out is correctly re-characterised as inherited and structural. The `0`-honouring validator and the E-33 ordering are also closed.

Two Medium findings remain, both one-sentence fixes and neither gating. F-01: E-30/AT-06-6 should name the carrier the inherited mechanism actually uses (the run report's notice channel), or state plainly that re-surfacing it in the halt report is new behaviour A6 adds. F-02: give AT-02-7's companion a positive outcome on the same path so it cannot be satisfied by a run that never reached the seam.

The REQ NFR-4 rationale and the REQ:205 "per wave invocation" phrasing are upstream defects, re-emitted as errata rather than folded in here.


## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 0}
