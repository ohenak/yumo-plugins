# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md`
**Date:** 2026-08-18
**Iteration:** 3
**Scope:** REQ (phase R), testing lens only. Delta re-review against
`CROSS-REVIEW-test-engineer-REQ-v2.md`, over `git diff 8ac7374b..HEAD` on the REQ
(38 insertions, 22 deletions). Unchanged sections are not re-litigated.

## Delta Verification of v2 findings

Verified at HEAD `afa55439` on `feat-pdlc-advisory-wave-gate`. Every shipped-behaviour
claim the revision added was re-measured in code.

| v2 ID | Sev | Status | Evidence |
|---|---|---|---|
| F-01 | Medium | **Resolved** | AC-4.4 now states the oracle as an ordered invocation sequence with both literal forms written out (`REQ:374-377`). Shipped order confirmed: post-wave command at `pdlc/workflows/orchestrate-dev.js:14347-14357`, then the script-owned test gate at `:14360-14368`. One residual wording defect, F-03 below. |
| F-02 | Medium | **Resolved** | All three baseline citations now pin v1.1 (`REQ:33`, `:66`, `:219`), matching `docs/_constraints/pdlc-wave-gate-baseline.md:7`. The version pin the baseline's own change-control rule demands (`:14`) is now uniform. |
| F-03 | Low | **Resolved** | AC-2.2 now carries the precedence sentence: where both rules could read — verdict malformed **and** unclassifiable — AC-2.1's specific rule wins (`REQ:282-283`). The two escalation paths are now separable in a test. |

Also re-measured on the new material: AC-4.2's two-writer claim holds exactly as
written — per-task pathspec-scoped commits over `task.files`
(`orchestrate-dev.js:14396-14414`) and the build-output commit scoped to
`implConfig.postWavePathspecs`, guarded by `postWaveRan`
(`:14416-14426`), both downstream of the green gate. AC-3.1's corrected claim holds
too: the shipped set-equality is over member ids alone —
`expect([...devModule.ENVELOPE_DEFAULTS].sort()).toEqual(["E-1","E-2","E-3","E-4"])`
(`pdlc/workflows/__tests__/advisoryEnvelope.test.js:284`) against the frozen
four-member literal at `orchestrate-dev.js:1938`, so widening to six is a
one-line, id-only edit as AC-3.1 now says. §9's core correction is true: the
positional recipes for M-WG-2/3/4 resolve to unrelated code today (e.g.
`sed -n '10334,10364p'` lands in DoD finding parsing, not the wave commit loop,
which is at `:14396`).

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
