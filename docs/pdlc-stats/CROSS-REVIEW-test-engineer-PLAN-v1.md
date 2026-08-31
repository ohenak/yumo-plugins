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

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **AT-15's symbolic-link leg is assigned only to T-04, over `fakeStatsIo`, which structurally cannot falsify it.** TSPEC §2.4 declares `lstatSync`-not-`statSync` load-bearing and §3.1 pins `fileSize` as `lstat().size — never follows a link`; a fake returns the fixture's declared size regardless. No real-fs task covers AT-15 (T-18 covers AT-09/10/11/13/14b/18) and T-10's no-write oracle only counts `StatsIo`'s keys. A `statSync` implementation ships green. **Fix:** give T-18 (or a new batch-9 row) a real-fs leg — temp dir, a small file plus a symlink to a much larger one, assert the byte total counts the link's own size — or, additionally, a structural conjunct in T-10 pinning `lstatSync` as the call `statsIo().fileSize` makes. | Batches T-04/T-18, Anti-drift table |
| F-02 | Medium | Local | **T-01's baseline citation names the wrong module.** `resolveWorkflowRoot` is exported by `pdlc/engine/lib/run.mjs` and only *imported* by `bin/cli.mjs` (`import { … resolveWorkflowRoot … } from "../lib/run.mjs"`); it is absent from `cli.mjs`'s `export` list. Batch 1 is a green gate whose rule for an absent symbol is "promoted to blocking work" — so the ambiguous wording risks a spurious halt at the first gate. **Fix:** name `pdlc/engine/lib/run.mjs` as the owning module. | T-01, Prior-phase baseline |
| F-03 | Medium | Local | **The `unmeasurable`/`harvested` mutant's killing test is unowned.** TSPEC §6.6 fixes it as a dedicated unit fixture (AT-25's round-1 collision **plus** a `LEARNINGS-{feature}.md` in the same directory — the only configuration where the two branch orders disagree), explicitly not claimable from AT-25's *Given*. T-04 names AT-25 but not that fixture; T-26's `Test File` column names `statsMetrics.test.js`, which the File Ownership Manifest assigns solely to T-04. A surviving mutant is declared blocking work, so this is an unplanned batch-11 stall. **Fix:** name the fixture in T-04's row and either add T-26 to the manifest or state that it authors no test. | T-04, T-26, File Ownership Manifest |
| F-04 | Medium | Local | **T-10 drops the parser-identity oracle's second conjunct.** TSPEC §2.5/§6.4 requires both the `===` identity of `statsParsers()`'s members *and* that the object `cmdStats` hands `runStats` is that same bundle — the conjunct that stops §6.1's `recordingParsers` becoming the production path. T-10 names only the first, and T-09's end-to-end conjunct cannot substitute, since the recording double wraps the real exports and returns identical values. **Fix:** add the pass-through conjunct to T-10. | T-10, Anti-drift table |
| F-05 | Medium | Local | **"Claims verified against the tree" contains two inaccurate measurements.** `pdlc/workflows/lib/` holds three modules, not two — `document-oracles.mjs` as well as `loop-session.mjs` and `escalation-view.mjs` — and it appears in neither `prepack.mjs`'s `MODULE_NAMES` nor `package.json`'s `c8.include`, i.e. HEAD already carries a counterexample to the section's "a module in `lib/` obliges the co-change" premise (the obligation here is real, but it follows from the engine CLI loading `stats.mjs`, not from directory membership). `__tests__/helpers/` holds 20 modules, not 21. A verification section is only load-bearing if its measurements are right. **Fix:** re-measure both lines and state the obligation's actual source. | Claims verified against the tree |
| F-06 | Medium | Local | **T-18's dependency rationale contradicts its own row and the suite-placement rule.** The rationale says T-18 depends on T-17 because "its end-to-end conjunct runs the shipped command and therefore the production `statsIo`"; T-18's row lists only real-path AT legs in `pdlc/workflows/__tests__/statsRealPaths.test.js`, and the Overview states CLI-driving tests live in the engine suite. Compounding it, T-02's `realStatsIo()` is a **second implementation of a production seam** (`statsIo()` in `bin/cli.mjs`, authored by T-17) with no equivalence oracle — so every real-path test may run against the helper copy while the shipped seam is proved only by T-09's single conjunct. This is the mechanism by which an F-01-style `stat`/`lstat` divergence would hide. **Fix:** state which seam T-18 uses, and either derive `realStatsIo()` from the shipped export or add an equivalence conjunct. | Dependencies §Why each ordering edge exists, T-02, T-18 |
| F-07 | Low | Local | **T-24 under-specifies the second P9-02 test.** `coverageInstrumentation.test.js` carries two P9-02 tests: the `toEqual` literal T-24 names, and a resolution oracle whose driver `import()`s `loop-session.mjs` and `escalation-view.mjs` by name and asserts the c8 `json-summary` measured them. T-24's "confirm the real c8 run's `json-summary` names the module" does not say that the second test's driver import list, title and comment are the artifact to edit. **Fix:** name it. | T-24 |
| F-08 | Low | Local | **T-09's end-to-end conjunct omits `--cwd`.** `Engine tests` runs `cd pdlc/engine && npm test`, and `pdlc/engine/` has no `docs/`, so `pdlc stats pdlc-loop-economics --json` as written yields a root-not-found refusal at exit 1 rather than DoD rounds `2`. **Fix:** write the conjunct as `--cwd <repoRoot>`. | T-09 |
| F-09 | Low | Local | **T-23's "eight assertion edits" misses a ninth site.** `loop-distribution.test.js`'s conjunct (d) builds `postFixMembers` as `WORKFLOW_MEMBERS.filter(...)` concatenated with `NEW_LIB_MEMBERS_VENDORED`; once T-22 adds `vendor/workflows/lib/stats.mjs` to `WORKFLOW_MEMBERS` and T-23 reduces `NEW_LIB_MEMBERS_VENDORED` to that same member, the list double-counts it. Harmless to the assertion, but the count word "eight" and `assertAdditiveOnly`'s hard-coded failure message ("must be exactly the two new members") both go stale. **Fix:** name the site and the message. | T-23 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Does `realStatsIo()` in T-02 exist because the shipped `statsIo()` lives in `bin/cli.mjs` and is awkward to import from the workflows suite? If so, would moving `statsIo()` into `lib/stats.mjs` (leaving `cmdStats` to call it) collapse F-01, F-04 and F-06 into one seam with one oracle, at the cost of one more exported function on the §3.3 surface? |
| Q-02 | T-11's read-only snapshot excludes the `.tmp-*` prefix the **workflows** suite creates under `pdlc/workflows/`, but T-11 runs in the **engine** suite, which CI executes as a separate job. Is the exclusion there for local `npm test`-both runs, and is the "exclusion is non-empty and pre-run-empty" guard conjunct expected to be green in CI where nothing creates the prefix? |
| Q-03 | Batch 10 lands five clusters at once with `assertAdditiveOnly` red mid-batch by design. If the wave gate's `postWaveCommand` runs between tasks rather than at batch end, does the mid-batch red surface as a wave failure? The PLAN says the gate is measured at batch end — is that guaranteed by the dispatcher, or by convention? |

## Positive Observations

- **The batch column is arithmetically correct on all 27 rows** — re-derived independently from the
  `Deps` edges, no understated batch anywhere. That is rarer than it should be, and it is what keeps
  terminal tasks from running before their wiring.
- **The File Ownership Manifest is the right instrument, used correctly.** The single multi-writer
  file is serialized by real dependency edges across five distinct batches, not by a note asking
  implementers to be careful. The batch-10 disjointness claim survives a row-by-row check.
- **T-20 as a deliberately-red gate ahead of the co-change batch** converts `DEC-STATS-01` `K-1`'s
  "a partial edit ships an engine that fails only for installed users" from a discipline problem
  into an ordering property. This is the strongest structural idea in the PLAN.
- **Anti-echo discipline is explicit where it matters:** T-20's `MODULE_NAMES.length + 1` derived
  rather than transcribed; T-06's key sets as literal transcriptions with `schemaVersion === 1`
  pinned to the literal rather than the module's own constant; T-19's PROP-3 stated over a
  *generated permutation* rather than a repeated call. Each of these is the difference between a
  test that can fail and one that cannot.
- **Set-equality, not containment, is asked for in every enumerated contract** — the doc-type
  catalogue, the exclusion set, the construction-site count, the `StatsIo` key set, the read-only
  snapshot pair, and the fleet entry discriminant. A deleted case reds in each.
- **T-08's exclusion-set oracle uses an independent witness** (the artifact-naming convention)
  rather than the leading-underscore predicate under test. That is exactly right: an oracle
  partitioned by the predicate it checks agrees with any predicate at all.
- **Real-path literals are declared measurements** with a re-measure command, and the PLAN
  explicitly forbids path-rewriting them when the archive moves — the correct reading of the
  `doc-moves-break-pinned-tests` pattern.
- **The vendoring site table is complete.** A `git grep -l escalation-view` sweep finds no
  enumeration outside the twelve rows; `bin/cli.mjs` and `loop-cli.test.js` reference `lib/` modules
  by per-module path, so they genuinely need no co-change.

## Recommendation

**Needs revision**

One High finding gates: F-01. TSPEC §2.4 spends a section arguing that `lstat`-not-`stat` is
load-bearing, and the PLAN then assigns the behaviour exclusively to a fake that cannot see the
difference. What must change to clear the bar: give AT-15's symbolic-link leg a real-filesystem
test (a temp dir with a symlink whose target is much larger than the link) owned by a named task, or
add a structural conjunct to T-10 pinning `lstatSync` as the call `statsIo().fileSize` makes —
ideally both, since the first proves the behaviour and the second names the mechanism.

The eight Medium and Low findings are recorded, not gating; F-02, F-03 and F-08 are each a
one-line correction that removes a predictable mid-wave stall, and are worth folding into the same
revision.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 5, "low": 3}
