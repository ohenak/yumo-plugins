# Cross-Review: test-engineer — Implementation (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/ (full feature diff `main...feat-pdlc-advisory-wave-gate`)
**Date:** 2026-08-21
**Iteration:** 1

## Scope and Method

Reviewed the feature's **full code diff** against the default branch, not the documents alone:

```
git diff --stat main...HEAD -- ':!docs'
 pdlc/workflows/orchestrate-dev.js                 |  57 ++-
 pdlc/workflows/dist/pdlc-cli.mjs                  |  57 ++-
 pdlc/workflows/__tests__/advisoryWaveGate.test.js | 390 +++++++++++++++--
 pdlc/workflows/__tests__/waveExecution.test.js    |  54 +++
 pdlc/workflows/__tests__/advisoryWaveGateMain.test.js |   5 +
 (+7 single-line test touch-ups, package.json, package-lock.json)
 15 files changed, 561 insertions(+), 39 deletions(-)
```

The production delta is three things: the fifth `haltFields` key `snapshotRef`
(`orchestrate-dev.js:3383-3392`, `:3479-3484`, `:3570-3595`), the pure renderer
`renderSnapshotOverwriteNotice` (`:3823-3841`), and the un-skip-halt carry
(`:15393-15399`, `:15445-15448`, `:15475-15487`).

Verification performed, in this order:

| Check | Command / site | Result |
|---|---|---|
| Branch is the feature branch, in sync with remote | `git rev-parse HEAD` vs `origin/feat-…` | identical (`c89695d8`) |
| Named suites green | `npm test -- advisoryWaveGate advisoryWaveGateMain waveExecution` | 313 passed, 3 suites |
| Generated runtime not drifted | `node pdlc/workflows/build-runtime.mjs --check` | `in-sync  pdlc/workflows/dist/pdlc-cli.mjs` |
| Every PROPERTIES id is named by some test | 78 ids extracted from PROPERTIES, grepped over `__tests__/` | 0 uncovered |
| Load-bearing oracles falsifiable | four source mutations, below | all RED |

**Mutation results** (each mutation applied to `orchestrate-dev.js`, targeted test
re-run, source restored):

| # | Mutation | Test | Outcome |
|---|---|---|---|
| M1 | `if (!resolved)` → `if (false)` at `:3579` (seam never pushes the notice) | `PROP-REC-08` | **RED** |
| M2 | `git clean -fd` → `-fdx` at `:12685` | `PROP-REST-03` | **RED** |
| M3 | un-skip-site push disabled at `:15484` | `AT-06-4` | **RED** |
| M4 | `${snapshotRef}` dropped from the rendered string at `:3838` (co-location broken, overwrite sentence kept) | `PROP-REC-08` | **RED** |

M4 is the one that matters most: BR-14's whole content is that the ref pointer and
the overwrite warning are **co-located in one `notices` element**. The oracle picks
the single element matching the ref and asserts `/overwrit/i` on *that same element*
(`advisoryWaveGate.test.js` PROP-REC-08 arm), so splitting the two halves across two
notices fails. A presence-anywhere oracle would have passed the mutant.

## Findings

_pending_

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_
