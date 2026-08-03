# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` (v1.2)
**Date:** 2026-08-03
**Iteration:** 2
**Scope:** delta re-review of REQ-pdlc-advisory-tier v1.1 → v1.2. Closure of the v1 findings (F-01…F-13), plus a fresh testability scan of the changed sections only. Unchanged sections already approved in v1 are not re-litigated. Not product strategy, not architecture.
**Diff reviewed:** `e6ff9f9..b8ce721` on `docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` (+165 / −87)

## Prior-Finding Closure

All thirteen v1 findings are closed. Each row names the change that closes it.

| v1 ID | Sev | Closed by | Status |
|---|---|---|---|
| F-01 | High | **AC-5.5** — the `needs-human` result carries a machine-readable seam token; an unrecognised/absent token routes to the A1 adjudicator. §1's A2 row now states the indistinguishability as today's fact rather than assuming a seam exists. AC-5.2/AC-5.3 now have a testable precondition. | Closed |
| F-02 | High | **AC-3.6** — one refusal path with a positive observable triple: outcome `escalated`, a refusal reason drawn from a closed seven-value set, and the pre-advisory behavior proceeding unchanged. **AC-4.6** now requires every prohibition test to assert that triple on the same path, which is exactly the paired positive conjunct the project standard demands. | Closed |
| F-03 | High | **AC-3.3** gives each of E-1…E-4 a decidable rule (flaky = identical sha, no push between; introduced = passes at merge-base, fails at head; branch-created = absent from merge-base tree and default-branch tip; re-grounding = symbol still exists). **AC-3.4(d)** defines *declared scope* as PLAN-named files ∪ files the branch had already touched. Four undefined terms → four checkable predicates. | Closed (see F-16 for one residual ambiguity, and F-15 for a baseline conflict E-2 introduces) |
| F-04 | High | **AC-1.1** now states the observable property (one constant, the Fable 5 rung, resolvable by the runtime) and explicitly hands the literal alias to TSPEC once BL-01 resolves. The implementation-echo trap is gone; AC-1.4 remains the falsifiable oracle. | Closed |
| F-05 | Medium | **AC-1.7** ships a config table with values: `attemptBudget: 3`, `seamBudgetMinutes: 10`. **NFR-4** now names the unit and the measurement window ("wall-clock, measured from dispatch to verdict") and routes the overrun through AC-3.6 with reason `budget-exhausted`. | Closed |
| F-06 | Medium | **AC-4.5** is now a per-seam table naming the gate and the state it must reach, and it correctly declines to claim Phase-0 triage is deterministic. The A2 row also resolves the AC-5.4 interaction by deferring the re-run to the next invocation. | Closed as a structure; the A1 row's content is wrong — see F-14 |
| F-07 | Medium | **AC-9.3** states the `ADVISORY-*` extension of the LEARNINGS-precedes-delete protection explicitly, and adds the "no delete while a later phase can still append" rule that makes A5's Phase-PUB entries reachable. **AC-9.2** gives the failed record write its positive outcome (action not taken or reverted, AC-3.6 path, reason `record-write-failed`). | Closed (residual: F-17) |
| F-08 | Medium | **AC-10.4** fixes append order (newest-last), the entry unit (one entry per escalation under its own heading), and the repeat rule (append again, never update in place). **AC-10.1** defines *pipeline state* as phase id + that phase's outcome. A downstream `pdlc-engineering-loop` parser test is now writable. | Closed |
| F-09 | Medium | **NFR-3** is restated as an equality on named artifacts (phase table, per-phase outcomes, no `ADVISORY-*`, no `ESCALATIONS.md` entry, no advisory summary) and says why. **AC-1.6** carries the same positive observable. | Closed |
| F-10 | Medium | **AC-3.4(a)** enumerates the seven evasions as a closed set; **AC-3.5** requires each enumerated operation to be asserted by its own test and states the set-equality intent ("a dropped case must fail the suite"). | Closed |
| F-11 | Low | **AC-2.1** collapses the enum to `{high, low}` and says why. | Closed |
| F-12 | Low | **AC-9.4** requires all five seams A1–A5 with zero counts included — a set-equality assertion is now available. | Closed |
| F-13 | Low | **AC-8.2** states the interaction: one attempt = one fix→push→re-poll cycle, and a re-poll that hits Phase PUB's own completion timeout consumes an attempt rather than escalating separately. | Closed |

## Verification Log

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
