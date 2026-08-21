# Cross-Review: test-engineer — Implementation (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/ (full feature diff `main...feat-pdlc-advisory-wave-gate`)
**Date:** 2026-08-21
**Iteration:** 2

## Scope and Method

Delta re-review. The base I approved-against in v1 is `c89695d8`; the remediation commit is
`e30f90bc` ("fix(advisory): wire AC-6.3's warning to the halt report and default the seam clock").
Everything after it on this branch is cross-review prose. The code delta under review:

```
git diff --stat c89695d8..HEAD -- ':!docs'
 pdlc/workflows/orchestrate-dev.js                      | 37 +++-   (+34 -3)
 pdlc/workflows/__tests__/advisoryWaveGateMain.test.js  | 124 +++-  (+121 -3)
 pdlc/workflows/__tests__/advisoryEnvelope.test.js      | 15 ++
 pdlc/workflows/__tests__/waveExecution.test.js         | 12 +-
 pdlc/workflows/dist/pdlc-cli.mjs                       | 37 +++-
```

Three production changes, all narrow: a frozen `ADVISORY_ROOT_CAUSE_MEANINGS` map rendered into the
A6 dispatch prompt in catalogue order (`orchestrate-dev.js:1963-1974`, `:3159-3163`); a `_now`
default on `runWaveGateSeam` (`:3404-3412`); and JSDoc for `haltFields.snapshotRef`
(`:3376-3382`). No behavioural change to the seam's returns, the halt path, or the un-skip carry —
so per the delta protocol I re-read only these sections plus the four new/edited oracles, and did
not re-litigate what v1 already cleared.

Verification performed, in order:

| Check | Command / site | Result |
|---|---|---|
| Branch | `git rev-parse --abbrev-ref HEAD` | `feat-pdlc-advisory-wave-gate` |
| Local vs remote | `HEAD` vs `origin/feat-pdlc-advisory-wave-gate` | identical (`cf1b32ed`) |
| Named suites green | `npm test -- advisoryWaveGateMain advisoryEnvelope waveExecution advisoryWaveGate` | 365 passed, 4 suites, 0 failed |
| Generated runtime | `node pdlc/workflows/build-runtime.mjs --check` | `in-sync pdlc/workflows/dist/pdlc-cli.mjs` |
| Load-bearing oracles falsifiable | five source mutations, table below | four RED, one **GREEN** (F-04) |

**Working-tree note (not a finding).** On first inspection `build-runtime.mjs --check` reported
`STALE` and `git status` showed `M pdlc/workflows/orchestrate-dev.js` — an uncommitted leftover
mutation (`...[...ADVISORY_ROOT_CAUSES].reverse().map(`) from someone's own mutation check, still
sitting in the shared tree. Committed state is clean: after `git checkout --` on that one file,
`--check` reports `in-sync` and the whole named-suite set is green. Nothing on the branch is
affected; flagging it only so the next agent in this tree is not misled by the same `STALE`.

**Mutation results** (each applied to `orchestrate-dev.js`, targeted suite re-run, source restored):

| # | Mutation | Test | Outcome |
|---|---|---|---|
| M1 | `_notice: advisoryNotice` → `_notice: () => {}` at the wave-loop A6 call site (`:15463`) | AT-06-4 report arm | **RED** |
| M2 | `_now = () => Date.now(),` → `_now,` on `runWaveGateSeam` (`:3412`) | AT-06-4b report arm | **RED** |
| M3 | catalogue reversed before the prompt render (`:3159`) | AC-2.2 prompt-order arm | **RED** |
| M4 | `${snapshotRef}` dropped from the rendered notice (`:3868`) | AT-06-4 report arm | **RED** |
| M5 | `"Re-running this feature overwrites that capture"` → `"...never overwrites that capture"` (`:3869`) | — | **GREEN** across all three advisory suites (315 passed) |

M1 is the v1 F-01 mutation, and it now turns the suite red — the seam→report hop is closed. M2 is
the defect the new AT-06-4b arm surfaced, and it is guarded. M5 is F-04 below.

## Status of v1 Findings

## Findings

## Questions

## Positive Observations

## Recommendation

