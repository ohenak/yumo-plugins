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

**TDD ordering — green.** Every 🟢 row has a preceding 🔴 row naming the same test file and ≥1 AT:
T-12←T-03/T-08, T-13←T-04, T-14←T-05, T-15←T-06, T-16←T-07, T-17←T-09/T-10/T-11. No implementation
task precedes its red.

**`[Fake first]` — green.** T-02 is the only double-creating task, is labelled `[Fake first]`, sits
in batch 1, and is a declared dependency of every red in batch 2. TSPEC §6.1's "shared
`__tests__/helpers/` module owned by a single batch-1 task" is honoured literally; `pdlc/workflows/
__tests__/helpers/` exists, so T-02 adds a peer.

**Same-new-file guard — green.** Checked row by row against the File Ownership Manifest. Batch 2's
nine tasks own nine distinct new files (T-11 owns two, both its own). Batch 9's three tasks are
three distinct new files. Batch 10's five tasks touch twelve files with no overlap:
T-21 {`prepack.mjs`, `run.test.js`, `learningsPremises.test.js`, `pdlc/README.md`,
`DOMAIN-CONSTRAINTS.md`}, T-22 {`_tspec-packed-set.mjs`, two sibling documents},
T-23 {`loop-distribution.test.js`}, T-24 {`package.json`, `coverageInstrumentation.test.js`},
T-25 {`publish-preflight.mjs`, `fixture-machine.mjs`}. The one multi-writer file,
`pdlc/workflows/lib/stats.mjs`, is serialized across five distinct batches by real `Deps` edges, not
by prose — the correct discharge.

**File existence — one ambiguity, one inaccuracy.** Every `(exists)` annotation is true at HEAD, and
every unannotated file is genuinely absent. Two exceptions:

- T-01 asserts `resolveWorkflowRoot` is "exported from `pdlc/engine/bin/cli.mjs`'s import surface".
  The symbol is exported by `pdlc/engine/lib/run.mjs` and merely *imported* by `cli.mjs`
  (`import { … resolveWorkflowRoot … } from "../lib/run.mjs"`); `cli.mjs`'s own `export` list does
  not carry it. Read as "importable from `cli.mjs`" the assertion is red at HEAD, and batch 1 is a
  **green gate** whose stated remedy for an absent symbol is "promoted to blocking work" — i.e. a
  spurious wave halt at the first gate. F-02.
- The "Claims verified against the tree" section says `pdlc/workflows/lib/` holds `loop-session.mjs`
  and `escalation-view.mjs`. It holds **three** modules: `document-oracles.mjs` as well — and that
  module is in neither `MODULE_NAMES` nor `c8.include`, so the section's own evidence base carries a
  live counterexample to the "a module in `lib/` obliges the vendoring co-change" premise. The same
  section says `__tests__/helpers/` has 21 modules; it has 20. F-05.

**Batch gates.** The split-gate wording is the right instrument and each split gate names the
permitted red *and its reason*, so a red for the wrong reason is a batch failure. Batch 9's "T-20 is
the only permitted red" and batch 10's "the reds-first signal is expected mid-batch, the gate is
measured at batch end" are both correct readings of `assertAdditiveOnly`'s behaviour at
`pdlc/engine/__tests__/loop-distribution.test.js`.

## Dependencies

**Batch-column arithmetic — re-derived independently, all 27 rows agree.**

| Task(s) | Deps → batches | `max + 1` | Column |
|---|---|---|---|
| T-01, T-02 | source | 1 | 1 ✓ |
| T-03 … T-11 | T-01 (1), T-02 (1) | 2 | 2 ✓ |
| T-12 | T-03 (2), T-08 (2) | 3 | 3 ✓ |
| T-13 | T-12 (3), T-04 (2) | 4 | 4 ✓ |
| T-14 | T-13 (4), T-05 (2) | 5 | 5 ✓ |
| T-15 | T-14 (5), T-06 (2) | 6 | 6 ✓ |
| T-16 | T-15 (6), T-07 (2) | 7 | 7 ✓ |
| T-17 | T-16 (7), T-09/T-10/T-11 (2) | 8 | 8 ✓ |
| T-18, T-19, T-20 | T-17 (8) | 9 | 9 ✓ |
| T-21 … T-25 | T-20 (9) | 10 | 10 ✓ |
| T-26 | T-18 (9), T-19 (9), T-21 (10) | 11 | 11 ✓ |
| T-27 | T-21 (10) | 11 | 11 ✓ |

No understated batch, no overstated batch, ids unique, every `Deps` token resolves, graph acyclic
(every edge points strictly downward in batch number). The dispatcher reads the column and the
column is right.

**Ordering rationale — one internal contradiction.** The rationale for "T-18 depends on T-17, not on
T-16" is that T-18's "end-to-end conjunct runs the shipped command and therefore the production
`statsIo` — the real-fs seam that no workflows-side double exercises". But T-18's own row places the
file at `pdlc/workflows/__tests__/statsRealPaths.test.js` and lists only real-path AT legs
(AT-09/10/11/13/14b/18), no CLI invocation; and the Overview's arrangement rule says "tests that
drive `bin/cli.mjs` live in the engine suite". Two of these three statements can be true, not all
three. The edge itself is harmless (it over-constrains rather than understates, so no batch-column
desync), but the implementer is told two different things about what T-18 asserts and where the
production seam is proved. F-06.

**Everything else in the rationale holds up.** T-20 gating the batch-10 cluster is the correct
closure of `DEC-STATS-01` `K-1`: `stats-vendoring.test.js` is red *before* any enumeration moves, so
a cluster that lands four of five edits cannot go green. T-22/T-23 being separate tasks in the same
batch is forced by `loop-distribution.test.js`'s P7-02 oracle, which derives
`vendoredClassSize` from `tspecPackedCount` and greps the sibling documents for the matching
number-word (`const vendoredClassWord = vendoredClassSize === 5 ? "five" : String(...)`) — the PLAN's
instruction to replace that ternary with a number-word map is exactly right, since
`String(6)` would never match the word T-22 writes. T-21/T-24 staying unmerged because their file
sets straddle different required checks is a genuine falsifiability argument, not a preference.

## Verification

_(AT coverage set-equality, oracle coverage, coverage floor, mutation evidence)_

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
