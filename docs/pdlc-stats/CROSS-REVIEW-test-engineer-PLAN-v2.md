# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/PLAN-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 2

## Overview

Round 2 is a **delta re-review**. Round 1 recommended *Needs revision* on one High
(F-01, AT-15's symbolic-link leg owned solely by a fake that cannot see the
`lstat`/`stat` difference) plus five Medium and three Low findings. The v1.1 revision
is 51 insertions / 25 deletions over `PLAN-pdlc-stats.md` — a changelog paragraph,
edits to the rows T-01, T-02, T-04, T-09, T-10, T-18, T-21, T-23, T-24, T-26, five
File-Ownership-Manifest rows for `lib/stats.mjs`, the T-18 dependency rationale, the
co-change premise in the Overview, the AT-coverage preamble and AT-15 row, two new
anti-drift oracle rows, two corrected "Claims verified" measurements and one DoD
checklist line.

Scope of this round, per the delta protocol: **only the changed sections**, plus a
check that each round-1 finding actually landed. Unchanged sections approved in round 1
(the batch-column arithmetic over all 27 rows, the same-new-file guard, the AT
set-equality, the CI check enumeration) are not re-litigated. Every claim the delta
makes about repository state was re-measured at HEAD rather than trusted from the
document.

**Round-1 findings — landing status.**

| Round-1 | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| F-01 | High | **Resolved** (with a residual, F-01 below) | T-18 gains the real-fs symlink leg; T-10 gains the `lstat`-not-`stat` source conjunct; AT-15 now maps to T-04 **and** T-18 |
| F-02 | Medium | **Resolved** | T-01 now cites `pdlc/engine/lib/run.mjs`; confirmed `export function resolveWorkflowRoot` at `pdlc/engine/lib/run.mjs:90`, and `bin/cli.mjs` carries no re-export |
| F-03 | Medium | **Resolved** | T-04 names the dedicated `LEARNINGS`-sibling fixture; T-26 declares it authors no test file, so the manifest's single-owner rows hold |
| F-04 | Medium | **Resolved** | T-10 carries both conjuncts, the second stated as pass-through (not a rebuilt object), with the reason T-09 cannot substitute |
| F-05 | Medium | **Resolved** | "Claims verified" now reads three `lib/` modules and 20 helper modules — both re-measured correct (`pdlc/workflows/lib/` = `document-oracles.mjs`, `escalation-view.mjs`, `loop-session.mjs`; `__tests__/helpers/` = 20 `.js` files) |
| F-06 | Medium | **Resolved** | T-18's rationale now states the seam (workflows-side over `realStatsIo()`, T-09 exercises the shipped command) and T-02 carries the equivalence pin |
| F-07 | Low | **Resolved** | T-24 names the second P9-02 test, its driver import list, title and comment (`coverageInstrumentation.test.js:278`) |
| F-08 | Low | **Resolved** | T-09's conjunct takes `--cwd <repoRoot>`, with the `cd pdlc/engine` reason stated inline |
| F-09 | Low | **Resolved** | T-23 counts nine edits and names the ninth: P7-02's `postFixMembers` concatenation (`loop-distribution.test.js:228-231`) and `assertAdditiveOnly`'s message (`:73-77`) |

No round-1 finding is left open. The revision introduced four new items, all Medium or
Low; they are recorded below and none gates.

## Batches

## Dependencies

## Verification

## Findings

## Questions

## Positive Observations

## Recommendation
