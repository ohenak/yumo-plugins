# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/PLAN-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 1

## Overview

This review reads `PLAN-pdlc-stats.md` (27 tasks, 11 batches) through the testing lens only:
TDD ordering, `[Fake first]` discipline, batch-column arithmetic, same-new-file collisions,
acceptance-test and oracle coverage, the branch-coverage floor, and mutation evidence. Product
framing, architecture choice and CLI ergonomics are left to the PM and SE reviews.

Every file, symbol and count the PLAN names was checked at HEAD rather than taken from the upstream
documents. What was verified green:

| PLAN claim | HEAD |
|---|---|
| Four driver classifiers exported | `pdlc/workflows/orchestrate-dev.js` exports `parseResolvedMarker`, `parseReviewFilename`, `deriveRoundWindow`, `deriveDodRoundIndex` |
| `lib/stats.mjs` does not exist | confirmed — `pdlc/workflows/lib/` has no `stats.mjs` |
| `MODULE_NAMES` four entries | `pdlc/engine/scripts/prepack.mjs` `MODULE_NAMES` — four |
| Both `WORKFLOW_MEMBERS` five entries | `publish-preflight.mjs`, `pdlc/engine/__tests__/_tspec-packed-set.mjs` — five each |
| `WORKFLOW_MODULE_NAMES` four entries | `pdlc/engine/scripts/fixture-machine.mjs` — four |
| `tspecPackedCount` reads `4 + 15 + 5 + 1` | `_tspec-packed-set.mjs` `tspecPackedCount` — exact |
| `c8.include` seven `**/`-anchored entries | `pdlc/workflows/package.json` `c8.include` — seven |
| `fast-check` already a dev dependency | `pdlc/workflows/package.json` `devDependencies` — `^4.9.0` |
| `bin-guard-structure.test.js`, `loop-cli.test.js` exist | both present under `pdlc/engine/__tests__/` |
| `docs/` holds exactly the eight non-feature dirs | `_constraints`, `_decisions`, `_queue`, `completed`, `design`, `discarded`, `ideas`, `requirements`, plus the loose `docs/PLAN-pdlc-integration-boundary-gates.md` |
| Every real-path fixture T-18 names | `pdlc-advisory-wave-gate` (four `…-REVIEW-v{1,2}.md`, `TSPEC-v6` highest), `pdlc-headless-engine` (`…-TSPEC-v13.md`, `LEARNINGS-…`, four `POSTMORTEM-{D,F,I,T}-…`), `pdlc-loop-economics` (`CODE_REVIEW-…-v{1,2}.md`), `pdlc-wave-resume` (`POSTMORTEM-PR-…`) — all present |
| The vendoring site table is complete | `git grep -l escalation-view` finds no enumeration outside the twelve rows; `bin/cli.mjs` and `loop-cli.test.js` reference `lib/` modules by per-module path, not by enumeration, so they need no co-change |

The PLAN is unusually well grounded — one High finding, and it is a coverage hole rather than a
structural defect.

## Batches

_(task-table checks: file existence, red-before-green, `[Fake first]`, same-new-file guard)_

## Dependencies

_(batch-DAG re-derivation, acyclicity, ordering rationale)_

## Verification

_(AT coverage set-equality, oracle coverage, coverage floor, mutation evidence)_

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
