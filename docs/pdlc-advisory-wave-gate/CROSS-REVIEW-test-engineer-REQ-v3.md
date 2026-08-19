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

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | AC-1.5's shipped-behaviour claim is false at HEAD, and its cardinality oracle is unimplementable as written because of it. The AC states "BL-04's case already emits such a notice once per run …; BL-03's has no equivalent today and acquires one" (`REQ:256-257`). BL-03's case does have an equivalent today: when `waveMode` is false the phase emits, once per run, on the same `emit` notice surface as the BL-04 notice, `"Implementation: no valid file-ownership manifest on this PLAN — running the worktree exception path (isolated batches, merge-back, self-report gate)."` (`pdlc/workflows/orchestrate-dev.js:14041-14045`; the BL-04 notice this AC contrasts it with is at `:14145-14153`). The consequence is not cosmetic: AC-1.5's oracle is "exactly one inapplicability notice per run — not per wave — on the run's notice surface, naming **every** absent prerequisite". In a no-manifest run a test scanning that surface finds the shipped legacy-path notice *plus* whatever A6 adds, so the count is two and the criterion reds against behaviour this feature did not introduce — or the author quietly narrows the scan to A6-authored notices, which is a different oracle from the one written. Decide and state which: either A6 extends the existing `:14041` notice (then the cardinality is over one notice naming both prerequisites, and the AC should say the shipped notice is the carrier), or A6 emits its own (then the AC must scope the count to A6-inapplicability notices and say the legacy notice coexists). Either way the "no equivalent today" clause must go — it is the kind of claim this round's own §9 correction was written to stop. | AC-1.5, BL-03, BL-04 |
| F-02 | Medium | Local | AC-4.4's re-gate oracle says "the **ordered sequence** of configured gate-command invocations for the wave is set-equal to the shipped sequence repeated once per attempt" (`REQ:373-375`). Set-equality over a sequence collapses duplicates: `{test}` = `{test}`, so a literal set comparison passes on a *single* test-command invocation — exactly the false-green v2 F-01 asked to close, re-admitted by the operator word. The two illustrative literals (`[post-wave, test, post-wave, test]`, `[test, test]`) show the intent, but a TSPEC author is entitled to implement the words. Say sequence equality (list equality, order and multiplicity both), not set-equality; reserve "set-equality" for the id/enumeration checks where it is the right operator (AC-2.2, AC-3.1). | AC-4.4, AC-4.1 |
| F-03 | Medium | Local | AC-4.4 asserts "a green re-gate lets the wave proceed to the commit step it would have reached", but a green gate is not the last thing between the re-gate and the commits: `checkWaveUnskips` runs after the gate and before the commit loop and halts the wave on violation (`orchestrate-dev.js:14373-14393`, comment: "a vacuous green halts the wave with its work uncommitted, exactly as a red gate does"). On the first pass that guard is unreachable — the red gate halted first — so a repaired wave reaches it for the first time, and a repair that lands an owned test file's skipped block in scope halts there with the repair uncommitted. AC-5.1's restore rule is triggered by a *red re-gate*, so the trigger set is not equal to the set of ways a repaired wave can end without commits, and no AC states the tree state for the un-skip halt. Name the outcome: either it is a third re-gate-adjacent failure that restores the tree like AC-5.1, or it is out of scope and the AC-4.4 sentence should say "proceeds past the gate" rather than "to the commit step". | AC-4.4, AC-5.1 |
| F-04 | Medium | Cross-Feature | §9's recipe-drift correction and the BL-06 obligation it creates are under-inclusive; the enumeration is not set-equal to the drift. §9 names "M-WG-2, M-WG-3 and M-WG-4" and BL-06 requires "those three reissued in grep- or symbol-anchored form" (`REQ:539-542`). Also dead at HEAD: M-WG-5's positional half `sed -n '10770,10800p'` (lands in phase-result evaluation, not the wave-halt post-mortem path — `pdlc-wave-gate-baseline.md:44`), and §1's V-wave trailer recipe `sed -n '10398,10428p'` (`:38`, lands in DoD helper JSDoc; the V-wave gate is at `orchestrate-dev.js:14516-14528`). Separately, every recorded line hint appended to the surviving grep recipes is stale: `ADVISORY_SEAMS` is at `:1947`, not `:1669` (`baseline:47`); `evaluateWaveDispatch` at `:10730`/`:14338`, not `:8283`/`:10299` (`:32`); `FORCE_PHASE_TOKENS` at `:5576`, not `:4585` (`:45`); `status: "halted"` at `:14955`, not `:10805` (`:46`). The greps themselves resolve, so §9's headline claim is right — but M-WG-8's `:1669` is a site BL-06 must re-verify to enumerate the transcribed set-equalities, and a reader who trusts the hint reads the wrong line. Widen BL-06 to every drifted recipe and hint in §1–§2, not three rows. | §9, BL-06, M-WG-5, M-WG-8 |

## Questions

## Positive Observations

## Recommendation

## Verdict
