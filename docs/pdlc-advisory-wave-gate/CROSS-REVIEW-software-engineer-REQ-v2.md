# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.4, 2026-08-18)
**Date:** 2026-08-18
**Iteration:** 2
**Scope:** Delta re-review. Round-1 findings F-01…F-09, then the changed sections only.
Reviewed `feat-pdlc-advisory-wave-gate` at `99d3eb50`, rebased onto `origin/main` `1efb9a3b`;
diffed against the round-1 base `2ca2335a`.

## Round-1 Disposition

| v1 finding | Sev | Disposition | Evidence checked |
|---|---|---|---|
| F-01 stale parallel v1.0 on branch | High | **Resolved** | Branch is rebased onto `origin/main` `1efb9a3b`; `2ca2335a` is an ancestor of HEAD and the document is main's v1.3 carried to v1.4 |
| F-02 E-6 repair has no commit step that owns it | High | **Resolved** | New AC-4.6 states the outcome (a resolved wave never leaves the repair uncommitted) and routes the mechanism to O-8. Matches the shipped per-task scope I re-measured at `orchestrate-dev.js:14395-14412` — `paths = task.files`, so a later task's paths are genuinely outside it |
| F-03 re-gate under-specified against shipped build-then-gate order | High | **Resolved** | AC-4.4 now requires the whole gate sequence in the shipped order. The order and its rationale are at `orchestrate-dev.js:14340-14370` (post-wave first at `:14347-14358`, test gate at `:14360-14369`) |
| F-04 refusal-reason set has no member for a diagnosis-only outcome | High | **Resolved** | AC-3.4 makes a diagnosis-only outcome an escalation *without* a refusal rather than a ninth reason. The shipped escalation entry already renders that field as absent: `` `| Refusal reason | ${advisoryEntrySingleLine(reason ?? "n/a")} |` `` (`orchestrate-dev.js:3065`) |
| F-05 BL-06 too narrow / AC-1.4 contradiction | High | **Resolved** | BL-06 now covers the envelope defaults and the config key set, and AC-1.4 scopes inertness to run behaviour rather than the shipped default tables. `ENVELOPE_DEFAULTS` and `ADVISORY_DEFAULTS` are both id/key sets (`orchestrate-dev.js:2320-2330`), so the widened enumeration is the right one |
| F-06 BL-05 resolution form not repository state | Medium | **Resolved** | BL-05 now cites `docs/completed/pdlc-consolidation-agent/`, which exists on `origin/main` (`git ls-tree origin/main docs/completed/`) |
| F-07 deferral bound to the wrong successor | Medium | **Resolved** | D-AWG-03 splits; D-AWG-03b (re-entry at the failed wave) binds `pdlc-wave-resume` (queue row 20) |
| F-08 AC-3.1 spans two envelope schemas | Medium | **Partly** — see F-11 | AC-3.1 now claims the tier's shape; the tier's own table carries a fourth column |
| F-09 budget scope ambiguous | Low | **Resolved** | AC-2.4 pins `seamBudgetMinutes` per invocation and makes only *resolutions* consume the wave budget, naming both oracles |

Q-01…Q-04 of round 1 are answered by AC-5.1's whole-tree form, AC-4.6, AC-1.5 and the Q-4 row of §8
respectively. The §8 relocation is genuinely verbatim: `diff` of the removed block against
`docs/_decisions/DECISIONS-advisory-wave-gate-questions.md` is one trailing blank line.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
