# Cross-Review: test-engineer — Codebase Review (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/` implementation on `feat-pdlc-engine-distribution` (delta `72d48238..ef881565`)
**Date:** 2026-08-16
**Iteration:** 2
**Scope:** Local

## Method

Delta re-review. Scope is the 16 commits in `72d48238..ef881565` and the sections they
changed; unchanged sections already reviewed in v1 are not re-litigated. Every claim below
is grounded in an observation at `ef881565`, not in a document.

1. **Suite execution.** `cd pdlc/engine && npm test` → `1..743`, `# pass 800`, `# fail 0`,
   `# skipped 2` (both `PDLC_LIVE=1`-gated, pre-existing, not new skips).
   `cd pdlc/workflows && npm test` → 4515 passed, 1 failed, 70 skipped (F-05 below, unchanged).
2. **Mutation probes.** Five probes run: the two that produced round-1's F-01 and F-02, plus
   three against code this round added or rewired. Each mutation was applied in the working
   tree, the suite re-run, and the tree restored; `git status --porcelain` over `pdlc/engine`
   is clean at the time of writing.
3. **Coverage re-measurement.** `npm test -- --experimental-test-coverage`, branch column,
   read per module against `PROP-REGR-6`'s eight-module enumeration
   (`PROPERTIES-pdlc-engine-distribution.md:242`).

## Round-1 findings: disposition

| Round-1 | Severity | Status | Evidence |
|---|---|---|---|
| F-01 sentinel guard unfalsifiable | High | **Resolved** | Deleting `publish-preflight.mjs:148-152` now reddens the suite (`# fail 1`), where it was 725/725 green in round 1. The matched pair at `publish-channel.test.js:311-373` — poisoned bytes refuse, the *same* inputs with clean bytes publish — attributes the refusal to the guard and nothing else. |
| F-02 publish CLI tokens pinned nowhere | High | **Resolved** | Renaming `case "verify-packed":` (`publish-preflight.mjs:525`) now reddens (`# fail 1`). `publish-channel.test.js:299` is set-equality in both directions with a non-degeneracy control (`invoked.length >= 5`) before the `deepEqual`, so an empty-set-vs-empty-set pass is closed. |
| F-03 four of eight modules below the 85 % branch floor | High | **Resolved** | Measured at `ef881565`: `publish-preflight.mjs` 88.46 (was 78.95), `fixture-machine.mjs` 88.57 (was 83.33), `prepack.mjs` 100.00 (was 66.67), `bin/cli.mjs` 87.65 (was 75.00). With `store` 94.44, `resolve-version` 97.14, `provenance` 100, `postinstall` 100, all eight modules `PROP-REGR-6` enumerates now clear the floor. |
| F-04 fixture-machine functions half-unreached | Medium | Partly addressed | Function coverage 39.13 → 40.74 after `d9dd3295`. Still recorded, still not a blocker — see F-04 below. |
| F-05 workflows suite not locally green | Low | Unchanged | Same single failure, same root cause (`documentOracles.test.js:246`, `.tokensave/` cache), still not this feature's code. |
| F-06 uncommitted PLAN edit | Low | **Resolved** | Committed in `832b4c70`; working tree carries no tracked modification. |
| Q-02 credential on the failure path | — | Answered | `redactSecret` added (`publish-preflight.mjs:330`), applied at both `reportFailure` (`:335`) and the real channel's throw (`:468-470`). See F-02 below on its wiring proof. |

All three round-1 High findings are resolved, and two of them are mutation-proven rather
than asserted. The revision did not weaken any oracle I had credited in v1.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
