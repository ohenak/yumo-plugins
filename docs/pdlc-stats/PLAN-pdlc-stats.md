---
feature: pdlc-stats
---

# PLAN — pdlc-stats

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → DECISIONS → **PLAN**` (`docs/pdlc-stats/REQ-pdlc-stats.md`, `FSPEC-pdlc-stats.md`, `TSPEC-pdlc-stats.md`, `DECISIONS-pdlc-stats.md`) |
| Downstream | PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{role}-PLAN[-v{N}].md` |
| LEARNINGS | `docs/pdlc-stats/LEARNINGS-pdlc-stats.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | se-author | 1.0 | 2026-08-31 |

## Overview

Build `pdlc stats [feature] [--json] [--cwd <path>]`: a read-only reporting subcommand of the engine
CLI that reads a feature's artifact directory and reports four metrics — review rounds by document
type, DoD rounds, halts by phase and resolution, and the process-to-spec byte ratio — in a human
table or as one JSON document, for one feature or for the whole fleet.

**What lands.** One new pure module, `pdlc/workflows/lib/stats.mjs`, holding six exported functions
(`parseStatsArgv`, `discoverFeatures`, `computeFeatureStats`, `runStats`, `renderHuman`,
`renderJson`) and two frozen constants (`REVIEW_DOC_TYPE_ROWS`, `NON_FEATURE_DIRS`) — TSPEC §3.3.
One additive edit set to `pdlc/engine/bin/cli.mjs` (a `stats` row in `FLAGS_BY_COMMAND`, a `case` in
`main()`'s `switch`, a `USAGE` line, and the `cmdStats` / `statsIo` / `statsParsers` functions) —
TSPEC §3.4. No metric logic lives in the CLI; nothing below `cmdStats` reads ambient process state.

**The four driver classifiers are reused, never re-implemented** (REQ C-5). All four already exist
and are already `export`ed in `pdlc/workflows/orchestrate-dev.js` — verified at HEAD:
`parseResolvedMarker`, `parseReviewFilename`, `deriveRoundWindow`, `deriveDodRoundIndex`. They are
injected as a bundle (`StatsParsers`) and pinned by a reference-identity oracle, per
`DEC-STATS-03`.

**The standing cost this PLAN has to carry.** Adding one module to `pdlc/workflows/lib/` obliges a
co-change across the vendoring enumerations, stated once in `DEC-STATS-01`'s carve-out and cited
here rather than restated (`K-6`). Every site named below was confirmed present at HEAD:

| Site | Symbol | Confirmed at HEAD |
|---|---|---|
| `pdlc/engine/scripts/prepack.mjs` | `MODULE_NAMES` | four entries, ending `lib/escalation-view.mjs` |
| `pdlc/engine/scripts/publish-preflight.mjs` | `WORKFLOW_MEMBERS` | five `vendor/workflows/…` entries |
| `pdlc/engine/scripts/fixture-machine.mjs` | `WORKFLOW_MODULE_NAMES` | four entries |
| `pdlc/engine/__tests__/_tspec-packed-set.mjs` | `WORKFLOW_MEMBERS`, `tspecPackedCount` | five members; `4 + 15 + 5 + 1` |
| `pdlc/workflows/package.json` | `c8.include` | seven `**/`-anchored entries |
| `pdlc/engine/__tests__/loop-distribution.test.js` | baselines, `NEW_LIB_MEMBERS_*`, `vendoredClassWord` | present, `assertAdditiveOnly` live |
| `pdlc/workflows/__tests__/coverageInstrumentation.test.js` | `REQUIRED_INCLUDES` + P9-02's `toEqual` literal | present |
| `pdlc/engine/__tests__/run.test.js` | manifest `deepEqual`s + `scratchWorkflows` copy list | present |
| `pdlc/workflows/__tests__/learningsPremises.test.js` | P-1's `MODULE_NAMES` regex literal | present |
| `pdlc/README.md` | the "four workflow modules it dispatches" prose enumeration | present, no oracle pins it |
| `docs/completed/pdlc-engine-distribution/TSPEC-….md` §5.4 | `PK-*` table, vendored-members note | sibling-document edit, `K-7` |
| `docs/completed/pdlc-engine-distribution/FSPEC-….md` §5.2 | per-class count | sibling-document edit, `K-7` |

The co-change lands as one batch (batch 10) behind one deliberately-red oracle (batch 9), so a
partial edit cannot ship: `DEC-STATS-01` `K-1`'s "partial edit ships an engine whose `pdlc stats`
fails only for installed users" is closed by ordering, not by discipline.

**Test arrangement.** Two suites, two runners, both already in the gate's required-check set:
`pdlc/workflows/__tests__/` under jest + c8 (`Unit tests (ubuntu-latest, node 20)`), and
`pdlc/engine/__tests__/` under `node:test` via `__tests__/_run-suite.mjs`
(`Engine tests (ubuntu-latest)`). Tests that reach the metric functions live in the workflows suite;
tests that drive `bin/cli.mjs` live in the engine suite. Both directions of package-boundary reading
are precedented: `pdlc/workflows/__tests__/learningsPremises.test.js` already parses
`pdlc/engine/scripts/prepack.mjs`'s source.

**Scale.** 27 tasks, 11 batches. Batches 3–7 are a serial chain because
`pdlc/workflows/lib/stats.mjs` is one physical file and batch-safety rule 2 admits one writer per
batch — the same cost `DEC-LOOPECON-08` recorded for `orchestrate-dev.js`, taken knowingly here for
a much smaller file.

## Batches

Status key: ⬚ Not Started | 🔴 Red | 🟢 Green | 🔵 Refactored | ✅ Done.
`[Fake first]` marks test-double creation. Every file in the `Source File` column is **new** unless
the row says `(exists)`. Red rows do not write their `Source File`; they name the module their
assertions target, and carry `—` where they target nothing yet on disk.

| # | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|
| T-01 | **Pre-flight gate (BL-PREREQ).** Assert the four driver classifiers are importable from `pdlc/workflows/orchestrate-dev.js` at HEAD (`parseReviewFilename`, `deriveRoundWindow`, `deriveDodRoundIndex`, `parseResolvedMarker`) and that `resolveWorkflowRoot` is exported from `pdlc/engine/bin/cli.mjs`'s import surface. **Existence only** — never the new shape a later task creates. Any absent symbol is promoted to blocking work before T-03 runs. | `pdlc/workflows/__tests__/statsPreflight.test.js` | — | 1 | — | ⬚ |
| T-02 | **[Fake first]** Shared doubles module: `fakeStatsIo(tree, {throwOn})` (four read seams, **no write member**, per-call-site throw injection), `recordingParsers(real)` wrapping the real driver exports by default, `realStatsIo()` for real-path tests, and the artifact-directory tree builder every fixture uses (TSPEC §6.1). | `pdlc/workflows/__tests__/helpers/statsDoubles.js` | — | 1 | — | ⬚ |
| T-03 | 🔴 `parseStatsArgv` reds: BR-01's closed surface, two-positionals refusal, `--json`/`--cwd` acceptance, `{ok:false,message}` shape. AT-24 (parser half). | `pdlc/workflows/__tests__/statsArgv.test.js` | `pdlc/workflows/lib/stats.mjs` | 2 | T-01, T-02 | ⬚ |
| T-04 | 🔴 `computeFeatureStats` reds over `fakeStatsIo`: review rounds (AT-07, AT-08, AT-09 fixture leg, AT-25), DoD rounds (AT-12, AT-28), halts (AT-13 companion `RESOLVED: no` leg, AT-14), byte ratio (AT-15 incl. the removal probe and the symbolic-link leg, AT-16, AT-17's four directories). Branch-order conjuncts of TSPEC §4.3 asserted explicitly. | `pdlc/workflows/__tests__/statsMetrics.test.js` | `pdlc/workflows/lib/stats.mjs` | 2 | T-01, T-02 | ⬚ |
| T-05 | 🔴 `discoverFeatures` reds over `fakeStatsIo`: BR-02 live-before-archive (AT-02), `isDirectory`-only (AT-18's constructed roots, EC-18 case pair, EC-20 empty root), `unclassified` (AT-19 fixture leg), empty-feature row (AT-26). | `pdlc/workflows/__tests__/statsDiscovery.test.js` | `pdlc/workflows/lib/stats.mjs` | 2 | T-01, T-02 | ⬚ |
| T-06 | 🔴 Renderer reds over hand-built `StatsReport` values: AT-01 block order, AT-05 five-key set, AT-06 cross-mode correspondence **plus** TSPEC §6.3's four conjuncts (exact key sets against literal transcriptions, no `feature`/`dir` leakage, `schemaVersion === 1` as a literal, fleet entry discriminant), AT-14b's literal `D, F, I, T` and `P, PR` sequences, AT-19's three-key fleet document, AT-23's three-key error document. | `pdlc/workflows/__tests__/statsRender.test.js` | `pdlc/workflows/lib/stats.mjs` | 2 | T-01, T-02 | ⬚ |
| T-07 | 🔴 `runStats` reds over `fakeStatsIo`: flows A/B/C, AT-03 subdirectory byte-identity, AT-04 single-document stdout, AT-20 gap rows (both the read-failure leg and EC-21's catch-all leg), AT-26 fleet row, AT-27's fleet half and its eight root-failure runs, exit codes `0|1` only. | `pdlc/workflows/__tests__/statsOutcome.test.js` | `pdlc/workflows/lib/stats.mjs` | 2 | T-01, T-02 | ⬚ |
| T-08 | 🔴 Anti-drift reds (TSPEC §6.4, workflows half): doc-type catalogue **set-equality** between `REVIEW_DOC_TYPE_ROWS` and the types `parseReviewFilename` accepts, probed with a real role slug over the all-caps candidate set; exclusion-set **equality** between `NON_FEATURE_DIRS` and the real `docs/` root's non-feature directories, using the artifact-naming witness (never the predicate under test). | `pdlc/workflows/__tests__/statsAntiDrift.test.js` | `pdlc/workflows/lib/stats.mjs` | 2 | T-01, T-02 | ⬚ |
| T-09 | 🔴 CLI process-level reds, `main(["node","pdlc","stats",…])` in-process with stdout/stderr captured (`captureRun`'s shape from `pdlc/engine/__tests__/loop-cli.test.js` (exists), extended to swap `process.stdout.write`/`process.stderr.write` as well as `console.*`): AT-24's five refusals with **empty stdout**, AT-04, AT-23 both modes, AT-27's single-feature half, and an end-to-end real-path conjunct (`pdlc stats pdlc-loop-economics --json` reads DoD rounds `2`) exercising the production `statsIo`. | `pdlc/engine/__tests__/stats-cli.test.js` | `pdlc/engine/bin/cli.mjs` | 2 | T-01, T-02 | ⬚ |
| T-10 | 🔴 CLI structure reds (TSPEC §6.4, engine half): parser-identity (`statsParsers()`'s four members `===` `orchestrate-dev.js`'s exports); classifier purity — twice-called on a freshly-imported instance, `deepEqual` **and** non-aliased, plus `deriveDodRoundIndex`'s A-B-A conjunct; construction-site count (the four-classifier object literal occurs **exactly once** in `bin/cli.mjs`'s source, set-equality over occurrences); no-write capability (the `StatsIo` literal has exactly `listDir`, `fileSize`, `readFile`, `exists`). Structural conjuncts follow `pdlc/engine/__tests__/bin-guard-structure.test.js` (exists). | `pdlc/engine/__tests__/stats-cli-structure.test.js` | `pdlc/engine/bin/cli.mjs` | 2 | T-01, T-02 | ⬚ |
| T-11 | 🔴 Read-only reds (AT-21, AT-22): snapshot path+mtime under the repository root excluding `.git/`, `node_modules/` and the declared scratch prefixes; run; re-snapshot; assert **set-equality between the two snapshots** plus the liveness conjunct (metric set on stdout exit 0 / refusal exit 1). Owns the exported scratch-prefix constant (today exactly `.tmp-*`, the prefix `pdlc/workflows/__tests__/learningsCaptureScript.test.js` (exists) creates under `pdlc/workflows/`) and the guard conjunct that keeps the exclusion non-empty and pre-run-empty. | `pdlc/engine/__tests__/stats-read-only.test.js`, `pdlc/engine/__tests__/_stats-scratch-prefixes.mjs` | `pdlc/engine/bin/cli.mjs` | 2 | T-01, T-02 | ⬚ |
| T-12 | 🟢 Create `lib/stats.mjs`: module header, JSDoc types of TSPEC §3.1/§3.2/§4.1/§4.2, `parseStatsArgv`, and the two frozen constants. Turns T-03 and T-08 green. | `pdlc/workflows/__tests__/statsArgv.test.js`, `…/statsAntiDrift.test.js` | `pdlc/workflows/lib/stats.mjs` | 3 | T-03, T-08 | ⬚ |
| T-13 | 🟢 `computeFeatureStats`: one `listDir` call, `!isDirectory` filter at the source, the four metric computations in TSPEC §4.3's fixed branch order, `round2` once. Turns T-04 green. | `pdlc/workflows/__tests__/statsMetrics.test.js` | `pdlc/workflows/lib/stats.mjs` | 4 | T-12, T-04 | ⬚ |
| T-14 | 🟢 `discoverFeatures`: live/archived listing, `NON_FEATURE_DIRS` filter, the (provisional, per TSPEC §4.4 and RK-5) leading-underscore `unclassified` predicate, BR-02 preference, `dir` recorded per feature. Turns T-05 green. | `pdlc/workflows/__tests__/statsDiscovery.test.js` | `pdlc/workflows/lib/stats.mjs` | 5 | T-13, T-05 | ⬚ |
| T-15 | 🟢 `renderHuman` and `renderJson`, both total over `StatsReport`, `renderJson` as the §4.2.1 **projection** (five/three/three key sets, `feature` and `dir` dropped, `SCHEMA_VERSION` hoisted, key order by object-literal construction). Turns T-06 green. | `pdlc/workflows/__tests__/statsRender.test.js` | `pdlc/workflows/lib/stats.mjs` | 6 | T-14, T-06 | ⬚ |
| T-16 | 🟢 `runStats`: argv → report → rendered `{stdout, stderr, exitCode}`; the three `kind: "error"` reasons; per-feature `try`/`catch` → `{gap}` with fleet exit 0; sequential fleet computation. Never throws for a decided scenario. Turns T-07 green. | `pdlc/workflows/__tests__/statsOutcome.test.js` | `pdlc/workflows/lib/stats.mjs` | 7 | T-15, T-07 | ⬚ |
| T-17 | 🟢 `bin/cli.mjs` edits, all additive: `FLAGS_BY_COMMAND.stats = ["json","cwd"]`; `case "stats"` in `main()`'s `switch`; the `USAGE` line; `statsIo()`; `export async function statsParsers()` (the single construction site, mirroring `loopSessionModule()`); `export async function cmdStats(argv)` with the outermost `try`/`catch`. Turns T-09, T-10 and T-11 green. | `pdlc/engine/__tests__/stats-cli.test.js`, `…/stats-cli-structure.test.js`, `…/stats-read-only.test.js` | `pdlc/engine/bin/cli.mjs` (exists) | 8 | T-16, T-09, T-10, T-11 | ⬚ |
| T-18 | 🟢 Real-path acceptance tests over the live archive, expectations as **literals declared as measurements** (FSPEC §6): AT-09 (`docs/completed/pdlc-advisory-wave-gate/` — TSPEC row `6`, four `…-REVIEW-v{1,2}.md` basenames malformed), AT-10 (`pdlc-headless-engine` — TSPEC `13`, five rows `harvested`), AT-11 (`pdlc-loop-economics` — DoD `2`), AT-13 (`pdlc-wave-resume` **copied to a temp root**, `POSTMORTEM-P-some-other-feature.md` added there and never to the repository), AT-14b (`pdlc-headless-engine`'s four post-mortems, sequence `D, F, I, T`), AT-18 (this repository's `docs/` fleet). | `pdlc/workflows/__tests__/statsRealPaths.test.js` | — | 9 | T-17 | ⬚ |
| T-19 | 🟢 Property tests (`fast-check`, already a `pdlc/workflows` dev dependency): PROP-1 partition, PROP-2 state totality, PROP-3 order independence over a **generated permutation** of the listing. | `pdlc/workflows/__tests__/statsProperties.test.js` | — | 9 | T-17 | ⬚ |
| T-20 | 🔴 Vendoring co-change oracle (TSPEC §6.4): `lib/stats.mjs` present in `prepack.mjs`'s `MODULE_NAMES`, `publish-preflight.mjs`'s and `_tspec-packed-set.mjs`'s `WORKFLOW_MEMBERS`, and `fixture-machine.mjs`'s `WORKFLOW_MODULE_NAMES`; and `vendoredClassSize === MODULE_NAMES.length + 1`, **derived** from `MODULE_NAMES` rather than transcribed (`pdlc-loop-economics` LEARNINGS F-4). Red on landing: no enumeration names the module yet. | `pdlc/engine/__tests__/stats-vendoring.test.js` | — | 9 | T-17 | ⬚ |
| T-21 | 🟢 `K-9` cluster, one change: add `lib/stats.mjs` to `prepack.mjs`'s `MODULE_NAMES`; amend `run.test.js`'s manifest `deepEqual`s **and** its `scratchWorkflows` copy list (an uncopied member makes `runPrepack` throw `ENOENT` and reds the process-entry leg); amend `learningsPremises.test.js`'s P-1 literal and its title's count word; update `pdlc/README.md`'s prose enumeration (count word and member list) **and** add the `pdlc stats` bullet to its command list; promote the repo-scoped, source-restricted `git grep -l` co-change sweep to `docs/_constraints/DOMAIN-CONSTRAINTS.md`. | `pdlc/engine/__tests__/run.test.js` (exists), `pdlc/workflows/__tests__/learningsPremises.test.js` (exists) | `pdlc/engine/scripts/prepack.mjs` (exists), `pdlc/README.md` (exists), `docs/_constraints/DOMAIN-CONSTRAINTS.md` (exists) | 10 | T-20 | ⬚ |
| T-22 | 🟢 `K-7` cluster, one change: `_tspec-packed-set.mjs` gains `vendor/workflows/lib/stats.mjs` in `WORKFLOW_MEMBERS` and `tspecPackedCount` moves `4 + 15 + 5 + 1` → `4 + 15 + 6 + 1`; the sibling feature's frozen enumerations are amended on the same versioned route — `docs/completed/pdlc-engine-distribution/TSPEC-….md` §5.4 gains `PK-26` and its vendored-members note moves five → **six**, and `FSPEC-….md` §5.2's per-class count moves five → **six**, each with its own changelog row naming this feature. Cites `DEC-STATS-01`'s carve-out; does not restate it (`K-6`). | `pdlc/engine/__tests__/loop-distribution.test.js` (exists, P7-02 document oracle) | `pdlc/engine/__tests__/_tspec-packed-set.mjs` (exists), `docs/completed/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md` (exists), `docs/completed/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` (exists) | 10 | T-20 | ⬚ |
| T-23 | 🟢 `K-8`: `loop-distribution.test.js`'s **eight** assertion edits — `D1_BASELINE`, `D2_D3_BASELINE`, `D5_BASELINE` re-based onto HEAD's post-state; `NEW_LIB_MEMBERS_BARE` / `NEW_LIB_MEMBERS_VENDORED` reduced to this feature's single member; `tspecPackedCount`'s literal and the derived `assert.equal(vendoredClassSize, 5, …)`; and `vendoredClassWord`'s ternary replaced by a number-word map so `6 → "six"` matches the word T-22 writes into the sibling documents. The importability conjunct iterates the **post-state** member set, not the delta. | `pdlc/engine/__tests__/loop-distribution.test.js` (exists) | — | 10 | T-20 | ⬚ |
| T-24 | 🟢 `K-3`: append `"**/pdlc/workflows/lib/stats.mjs"` to `c8.include` in `pdlc/workflows/package.json` **and** to `coverageInstrumentation.test.js`'s P9-02 literal at the same index (the shipped assertion is `toEqual` — array equality, position-sensitive), correcting the stale count words in P9-02's title and comment; confirm the real c8 run's `json-summary` names the module, so a declared-but-unresolving glob is caught. Carries the per-file coverage obligation: `lib/stats.mjs` must clear branches ≥ 85. | `pdlc/workflows/__tests__/coverageInstrumentation.test.js` (exists) | `pdlc/workflows/package.json` (exists) | 10 | T-20 | ⬚ |
| T-25 | 🟢 Publication-path enumerations: add `vendor/workflows/lib/stats.mjs` to `publish-preflight.mjs`'s `WORKFLOW_MEMBERS` and `lib/stats.mjs` to `fixture-machine.mjs`'s `WORKFLOW_MODULE_NAMES`. `publish-preflight.mjs` is the production-side copy a `__tests__/`-scoped sweep does not reach (RK-1). | `pdlc/engine/__tests__/stats-vendoring.test.js` | `pdlc/engine/scripts/publish-preflight.mjs` (exists), `pdlc/engine/scripts/fixture-machine.mjs` (exists) | 10 | T-20 | ⬚ |
| T-26 | 🟢 Mutation evidence: run TSPEC §6.6's four mutants — drop `- 1` from each of the two driver-index conversions, swap `unmeasurable`/`harvested`, swap BR-16's harvested test against BR-15's zero-denominator test — and record the **named** killing test for each. A surviving mutant is blocking work, not a note. | `pdlc/workflows/__tests__/statsMetrics.test.js`, `…/statsRealPaths.test.js` | `docs/pdlc-stats/MUTATION-EVIDENCE-pdlc-stats.md` | 11 | T-18, T-19, T-21 | ⬚ |
| T-27 | 🟢 Operator documentation: `pdlc/OPERATIONS.md` gains `pdlc stats`'s full flag semantics, its exit codes (`0` / `1` only, never the halt `2`), and its read-only stance — the file `pdlc/README.md` defers to for flag detail. | — | `pdlc/OPERATIONS.md` (exists) | 11 | T-21 | ⬚ |

### Batch gates

Two gate wordings are used. A **green gate** means the full suite is green after the batch. A
**split gate** names the tests permitted to be red and why, because "full suite green after every
batch" is unsatisfiable when a batch legitimately ends red.

| Batch | Tasks | Gate |
|---|---|---|
| 1 | T-01, T-02 | **Green gate.** T-01 passes at HEAD (it asserts only baseline-symbol existence); T-02 adds no assertions. Full suite green, both packages. |
| 2 | T-03 … T-11 | **Split gate.** The nine new test files fail for the specified reason — `pdlc/workflows/lib/stats.mjs` does not exist, and `bin/cli.mjs` has no `stats` case, `cmdStats`, `statsIo` or `statsParsers`. **Every pre-existing test in both suites stays green.** A new file failing for any other reason (import error in a helper, a typo'd fixture path) is a batch failure, not a red. |
| 3 | T-12 | **Split gate.** `statsArgv.test.js` and `statsAntiDrift.test.js` go green; the seven other new files stay red for the specified reason; all pre-existing tests green. |
| 4 | T-13 | **Split gate.** `statsMetrics.test.js` goes green; five new files stay red; all pre-existing tests green. |
| 5 | T-14 | **Split gate.** `statsDiscovery.test.js` goes green; four new files stay red; all pre-existing tests green. |
| 6 | T-15 | **Split gate.** `statsRender.test.js` goes green; three new files stay red; all pre-existing tests green. |
| 7 | T-16 | **Split gate.** `statsOutcome.test.js` goes green; the three engine-side files (T-09, T-10, T-11) stay red for the specified reason — `bin/cli.mjs` is untouched; all pre-existing tests green. |
| 8 | T-17 | **Green gate.** Both suites fully green, `Unit tests` and `Engine tests` alike. This is the first batch at which `pdlc stats` runs end to end. |
| 9 | T-18, T-19, T-20 | **Split gate.** `stats-vendoring.test.js` (T-20) is the **only** permitted red, and only for its specified reason: no enumeration names `lib/stats.mjs` yet. T-18 and T-19 land green. Everything else green. |
| 10 | T-21 … T-25 | **Green gate**, and the batch's whole point. Five tasks, five disjoint file clusters, landing in one change. On entry to this batch `loop-distribution.test.js`'s `assertAdditiveOnly` goes red as soon as the first enumeration moves — that is `K-1`'s "reds first" signal and is expected mid-batch; the gate is measured at batch end. `lib/stats.mjs` enters the per-file c8 branch floor of 85 here (T-24): a short module fails this gate, and the remedy is tests in the batch, never a lowered floor. |
| 11 | T-26, T-27 | **Green gate**, plus T-26's own bar: each of the four mutants turns a **named** test red. |

**Wave-gate note.** `.claude/pdlc.config.example.json`'s `postWaveCommand`
(`node pdlc/workflows/build-runtime.mjs`, staging `pdlc/workflows/dist/`) runs after every wave and
is unchanged by this feature. `lib/stats.mjs` is not a member of the generated `pdlc-cli.mjs`
bundle — the stats surface is reached through the engine CLI, not through the workflow runtime — so
no task edits `pdlc/workflows/dist/` and no batch expects it to move.

## File Ownership Manifest

*(pending)*

## Dependencies

*(pending)*

## Verification

*(pending)*

## Definition of Done

*(pending)*
