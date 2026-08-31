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

**AT coverage — set-equal, not merely contained.** The FSPEC's AT ids extracted mechanically are
AT-01…AT-28 plus AT-14b = 29 distinct ids. The PLAN's coverage table names exactly those 29, each
with ≥1 owning task, no id named twice under different tasks without justification, and no id in the
table that the FSPEC does not define. Set-equality holds in both directions.

**Anti-drift oracle coverage — all seven of TSPEC §6.4 assigned.** Parser identity, classifier
purity, construction-site count and no-write capability → T-10; doc-type catalogue set-equality and
exclusion-set equality → T-08; vendoring co-change → T-20. Plus §6.5's read-only snapshot pair →
T-11 and the `c8.include` mutual falsifier → T-24. Two shortfalls:

- TSPEC §2.5/§6.4's parser-identity oracle has **two** conjuncts: the `===` identity of
  `statsParsers()`'s four members, *and* that "the object `cmdStats` passes to `runStats` is that
  same bundle, so the recording double of §6.1 can never become the production path". T-10 names
  only the first. The dropped conjunct is precisely the production-path-vs-unit-path proof: a
  `cmdStats` that constructs its own bundle, or is handed a test double, still passes the identity
  half. T-09's end-to-end conjunct does not compensate, because §6.1's `recordingParsers` wraps the
  *real* exports and would return the same values. F-04.
- **AT-15's symbolic-link leg has no falsifying test at all.** TSPEC §2.4 makes the choice
  load-bearing in its own words (`fileSize` uses `lstatSync`; "a symbolic link contributes the size
  of the link itself, not the size of its target … EC-19's decided behavior and AT-15's
  symbolic-link leg"), and §3.1 pins the seam as `lstat().size — never follows a link`. The PLAN
  assigns AT-15 to **T-04 only**, over `fakeStatsIo` — a fake whose `fileSize` returns whatever the
  fixture declares, and which therefore cannot distinguish `lstatSync` from `statSync`. T-18's
  real-path list is AT-09/10/11/13/14b/18 and does not include AT-15; T-10's no-write oracle counts
  `StatsIo`'s four keys and never reads which `fs` call `fileSize` makes. An implementation that
  ships `statSync` turns every listed test green. F-01, High.

**Coverage floor — declared correctly.** T-24 carries the per-file obligation and batch 10's gate
states the remedy is tests, never a lowered floor. Verified against the gate command, not against
source-list membership: `pdlc/workflows/package.json` `test:coverage` runs
`c8 report --check-coverage --per-file --branches 85 …`, so membership in `c8.include` really is
what enrols `lib/stats.mjs` in the 85% branch floor. Two co-change details T-24 under-specifies:

- `coverageInstrumentation.test.js` carries **two** P9-02 tests. The first is the `toEqual` literal
  T-24 names. The second — "the shipped c8 config resolves the two new `lib/` modules too (F4)" —
  writes a driver that `import()`s `loop-session.mjs` and `escalation-view.mjs` by name and asserts
  the c8 `json-summary` measured them. T-24 says "confirm the real c8 run's `json-summary` names the
  module" without saying that this second test's driver, title and comment are the artifact to edit.
  F-07.

**Mutation evidence — one unowned killing test.** T-26 runs TSPEC §6.6's four mutants. Three have
killing tests owned by an earlier task (AT-11's `2`, AT-09's `6` / AT-10's `13`, AT-17's fixture).
The `unmeasurable`/`harvested` swap does not: TSPEC §6.6 states its killer is "a dedicated unit
fixture — AT-25's round-1 collision **plus** `LEARNINGS-{feature}.md` in the directory … AT-25's own
*Given* does not name `LEARNINGS`, so this conjunct is added at the unit level rather than claimed
from the AT". T-04 lists AT-25 but not that added fixture, relying on the catch-all "branch-order
conjuncts of TSPEC §4.3 asserted explicitly"; and the File Ownership Manifest gives
`statsMetrics.test.js` a single owner (T-04) while T-26's `Test File` column also names it. Either
T-04 authors the fixture explicitly, or T-26 must appear in the manifest as a second writer. F-03.

**Verification commands.** The four required checks are correctly enumerated and correctly declared
unchanged in membership — no task edits a workflow file or `ci-arrangement.test.js`. The
`fixture-machine.mjs` install leg is the right place to catch a missed vendoring entry, since it
exercises the packed tarball rather than the checkout.

**One task instruction that cannot pass as written.** T-09's end-to-end conjunct is stated as
"`pdlc stats pdlc-loop-economics --json` reads DoD rounds `2`", with no `--cwd`. The `Engine tests`
check runs `cd pdlc/engine && npm test`, and `pdlc/engine/` contains only `__tests__/`, `bin/`,
`lib/`, `scripts/` and manifests — no `docs/`. Taken literally the conjunct produces a
root-not-found refusal at exit 1, not `2`. This matters more than a typo because T-09's conjunct is
the *only* place the production `statsIo` is exercised behaviourally. F-08.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
