# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md`
**Date:** 2026-08-03
**Iteration:** 2
**Scope:** delta re-review of FSPEC v1.1 (`a19e7ac`) against the v1.0 I reviewed (`0d07cea`), the
repository at the FSPEC's own citation pin `26c3f1c`, and my v1 cross-review
`CROSS-REVIEW-software-engineer-FSPEC-v1.md`. Only the changed sections were re-read; §1, §2, §7,
§13 and the unchanged parts of §11 and §17 are not re-litigated.

## Disposition of v1 findings

**All thirteen v1 findings are resolved.** Recording the evidence so no later round re-opens them:

| v1 id | Sev | Resolved by | Verified |
|---|---|---|---|
| F-01 | High | §10.2 H-1 (distil after PUB **and before Phase MERGE**) + H-2, which now states the observable in full: the delete and the LEARNINGS append are committed and pushed, the PR shows them, the head Phase MERGE evaluates is one commit beyond the checked head, and Phase MERGE defers or refuses under its own preconditions. T-08-3 updated to assert it. | yes — and the deferral claim holds against the shipped ladder: `orchestrate-dev.js:985-999` at `26c3f1c` returns `mergeStatus: "deferred"`, reason `PR not mergeable (…)`, for a `BLOCKED` state |
| F-02 | High | §9.2 A5-8 defines "revert" at A5 on **content**, not history: check and record complete before the push, nothing is force-pushed, a still-red re-poll leaves the fix commit on the branch and escalates. §4.1's new paragraph pins the step order, §16.2 BR-5 now asserts the invariant on the pre-push tree, T-07-6 updated. | yes |
| F-03 | High | §4.3 V-5 and §9.2 A5-3 both state that time waiting on the rollup does not count against `seamBudgetMinutes`, and say why — otherwise the shipped 10-minute default ends every A5 invocation inside attempt 1 and `attemptBudget` never binds (`CI_COMPLETION_TIMEOUT_MS = 30 min`, `orchestrate-dev.js:35`). V-5 also now pins preemption, and T-02-5 asserts the attempt count is 1. | yes — the choice is named, not left open |
| F-04 | High | §10.2 H-2b scopes H-2's absence observable to dev-side runs and states that a queue-side record deliberately persists until that feature's own run reaches PUB; §10.5 gains the queue row and §10.6 gains T-08-8. | yes (see M-02/M-03 below for two residues the new rule opens) |
| F-05 | High | §10.3 S-1 — the summary is carried on **every** report the run produces, including a halt's; §17.2's row rewritten; T-08-9 added. | yes; the halt path does build a report, so this is now consistent with the code |
| F-06 | High | §15.2's prologue rewritten to lazy resolution, §3.3 row 2 extended, T-01-7 added as the run that distinguishes lazy from eager, §17.2's fallback row no longer says "in §15.2's prologue". §3.2/§3.3/§12.2/§15.2 now agree. | yes |
| F-11 | Medium | §10.2 H-3 — the delete "goes through the channel the guard covers rather than around it", and the refusal "names the artifact class it refused". | yes at the rule level (T-08-4 was not tightened to match — L-02 below) |
| F-12 | Medium | §10.1 R-2 reworded to "a precondition of an action **surviving**", with the §4.1 paragraph explaining why step 7 is last and what changes at A5. | yes |
| F-13 | Medium | §6.3 A1-2 reframed as defence in depth over an unreachable state; §5.4's A1 row is now **none** with the reason; T-04-3 split into a reachable integration assertion and a unit-scoped T-04-3b, each labelled. | yes — and the split is the right shape |
| F-14 | Medium | §9.2 A5-9 (A5 does not fire on the completion-cap halt; the outcome is named in the summary), §9.3 split into the pre-seam and in-invocation cases, T-07-10 added. | yes (S-3 was not extended to match — L-01 below) |
| F-15 | Low | §5.2 X-d now carries the A1/A2 clause. | yes |
| F-16 | Low | §5.2 E-1 now states plainly that it does not attempt to decide flakiness and is bounded by budget alone. | yes |
| F-17 | Low | §9.2 A5-1 now states the comparison is authoritative on the reading it gets, and that a flaky-on-default check is deliberately escalated. | yes |

Arithmetic re-checked after the revision: §18.1's per-series counts (7, 6, 10, 10, 6, 6, 10, 10, 8,
5) sum to the stated **78**, and every range matches the owning section's table.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
