# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md` (v0.1, Draft)
**Date:** 2026-08-28
**Iteration:** 1

## Overview

This is a testing-lens review of a 21-task, 10-batch PLAN whose dominant constraint — every
production symbol lands in the single file `pdlc/workflows/orchestrate-dev.js` — the author
identified correctly and serialised correctly. The red/green pairing, the `[Fake first]` label on
T-01, the batch-column arithmetic, the failure-row (F-1…F-14) ownership table and the
acceptance-test (AT-01…AT-18) ownership table are all present and, where I re-derived them
mechanically, all correct. The document is well above the usual bar for a first draft.

Four findings gate it, and all four are of one kind: **tasks the PLAN does not have for gates the
repository already runs**, or **assertions the PLAN names in a green row that no red row owns**.
None of them is a disagreement with the design; each is a missing row.

The single most urgent one is F-01: the repository carries a literal test-file census in
`pdlc/workflows/__tests__/documentOracles.test.js` that reds the moment batch 1 lands, before any
production code exists. That must be fixed inside batch 1 or the first wave gate halts.

I verified every file path, symbol, count literal and gate command the PLAN asserts against HEAD
(`feat-pdlc-decision-ledger`); the results are in `## Verification` below.

## Batches

**Red-before-green.** Every `[green]` row (T-13…T-19) names a `[red]` predecessor in `Deps` and
shares a test file with it; the PLAN's own red-before-green table renders the pairing explicitly.
I checked each pair against the Test File column and found no unpaired green **except T-19**, whose
Test File column names two files (`documentOracles.test.js` and
`decision-ledger-config-example.test.js`) while only the second has a red predecessor (T-12). See
F-04.

**`[Fake first]`.** T-01 is labelled `[Fake first]`, sits in batch 1, and every consumer of the
doubles (T-04…T-11) carries `T-01` as a real dependency edge. Correct.

**Same-batch same-new-file collisions.** I enumerated the PLAN's own file-ownership manifest and
checked it pairwise. Batch 1's five tasks own pairwise-disjoint paths
(`decisionLedgerPreflight.test.js`, `helpers/decisionLedgerDoubles.js`,
`decisionLedgerBaselineGuard.test.js` + `fixtures/decision-ledger-baseline/**`,
`decisionLedgerFixtureGuard.test.js` + `fixtures/decision-corpus/**`,
`pdlc/engine/__tests__/decision-ledger-config-example.test.js`). Batch 2's six tasks likewise. The
six writers of `orchestrate-dev.js` are one-per-batch (3, 4, 5, 6, 7, 8). **No collision.** The
PLAN's decision to put T-02's `scenarios.mjs` inside the fixture directory rather than
`__tests__/helpers/` is the right call and for the stated reason — it avoids a second batch-1 task
writing into `helpers/`, which T-01 owns.

**RED-terminal batches 1–2.** The contract is stated correctly and matches the precedent the
repository actually sets: I confirmed committed-`test.skip` red modules exist in
`pdlc/engine/__tests__/loop-config-example.test.js:24`, `loop-distribution.test.js:10`,
`packaging.test.js:8`, `postinstall.test.js:5`, `publish-channel.test.js:2` and
`fixture-machine.test.js:9`. T-12's shape is a faithful clone of that precedent.

**Mutation obligations.** T-07 (four named mutations) and T-02 (three-step mutation proof) both
require the mutation be applied, observed red, reverted, and the observed failure transcribed into
the test file header. That is the discipline this project's oracle-falsifiability checks ask for,
and it is written as an acceptance condition rather than a hope. Good.

**Property-based coverage.** `fast-check` appears in exactly two rows: T-04 (config totality over
arbitrary JSON) and T-07 (bounds, quantified over set size × line sizes × bounds). Two
parameterisable components have **no** property strategy at all — `recogniseDecisionRecords` (T-05),
a parser over heading text, and `renderDecisionLedgerBlock` (T-06), a serialiser. Both are
example-only, table-driven against cited Baseline instances. See F-07.

**Anti-echo.** The PLAN's `## Anti-echo commitments` section is the strongest part of the document:
T-09's statements/citations/`6,305`/`10,859` are required to be hand-transcribed from the fixture
and never captured from the renderer; T-07's oracle model carries its own formatter transcribed
from TSPEC §4.3 rather than calling the production renderer (`DEC-DECLEDGER-11`); T-02's
`EXPECTED_MERGE_BASE_SHA` is a hand-transcribed literal rather than a value computed at test time.
That is precisely the no-implementation-echo discipline, applied at the three places it matters.

**Set-equality over containment.** Applied in the right places and refused in the right places:
T-12 asserts **containment** at the top level (so a sibling feature's new block does not red it) and
**set equality** inside the `decisionLedger` block (so a fourth key fails); T-04 asserts set equality
over C-3's key enumeration; T-11 asserts set equality between `DECISION_LEDGER_CENSUS_TOKENS` and the
exported decision-ledger names, which is what stops a later symbol escaping the census.

## Dependencies

### Batch-DAG mechanical re-derivation

I re-derived every task's batch from its declared `Deps` edges under `batch == max(dep batch) + 1`,
independently of the PLAN's own re-derivation paragraph, and compared against the `Batch` column.

| Task | Declared Deps | max(dep batch) | Derived | Column | Match |
|---|---|---|---|---|---|
| T-00 | — | — | 1 | 1 | ✅ |
| T-01 | — | — | 1 | 1 | ✅ |
| T-02 | — | — | 1 | 1 | ✅ |
| T-03 | — | — | 1 | 1 | ✅ |
| T-12 | — | — | 1 | 1 | ✅ |
| T-04 | T-00, T-01 | 1 | 2 | 2 | ✅ |
| T-05 | T-00, T-01 | 1 | 2 | 2 | ✅ |
| T-06 | T-00, T-01 | 1 | 2 | 2 | ✅ |
| T-07 | T-00, T-01 | 1 | 2 | 2 | ✅ |
| T-08 | T-00, T-01, T-03 | 1 | 2 | 2 | ✅ |
| T-09 | T-01, T-03 | 1 | 2 | 2 | ✅ |
| T-10 | T-01, T-02 | 1 | 2 | 2 | ✅ |
| T-11 | T-00, T-01 | 1 | 2 | 2 | ✅ |
| T-13 | T-02, T-04 | 2 | 3 | 3 | ✅ |
| T-14 | T-05, T-13 | 3 | 4 | 4 | ✅ |
| T-15 | T-06, T-14 | 4 | 5 | 5 | ✅ |
| T-16 | T-07, T-15 | 5 | 6 | 6 | ✅ |
| T-17 | T-08, T-09, T-16 | 6 | 7 | 7 | ✅ |
| T-18 | T-10, T-11, T-17 | 7 | 8 | 8 | ✅ |
| T-19 | T-12, T-18 | 8 | 9 | 9 | ✅ |
| T-20 | T-19 | 9 | 10 | 10 | ✅ |

**Result: 21/21 rows match. The graph is acyclic** (every edge points to a strictly lower-numbered
task), **ids are unique, and every dependency resolves to a declared task.** No batch-column desync,
no understated batch. This is the cleanest batch column I have reviewed on this feature.

### Dependency edges that carry semantic weight

Three edges are load-bearing beyond ordering, and the PLAN says so explicitly rather than leaving it
to be inferred — this is worth naming as good practice:

- **T-13 → `T-02`.** The byte-identity capture must be taken while `orchestrate-dev.js` is still
  byte-identical to the merge base. Enforced as a real edge on the *first* production task, with the
  serial chain T-13 → T-14 → T-15 → T-16 → T-17 → T-18 carrying it transitively. Correct, and the
  correct place to put it: a prose note here would be unenforceable.
- **T-08, T-09 → `T-03`.** Both carry the frozen-fixture edge explicitly rather than relying on
  batch ordering.
- **T-16 → T-15.** Structural, not merely ordinal: `DEC-DECLEDGER-11` makes
  `renderDecisionLedgerBlock` the single producer of ledger bytes, so `selectDecisions` cannot obtain
  `renderedBytes` before the renderer exists.

### The frozen-fixture decision

T-03 freezes the corpus at `8c673a09f` rather than reading the live tree. I verified both counts
myself (see `## Verification`): 25 in-scope files at that commit, 26 live. The PLAN's reason — that a
live read reddens the moment the next feature records a decision, the same whole-tree-walk failure
class `CLAUDE.md` already records for `coveredViolations` — is correct and is exactly the right
lesson to have carried forward.

## Verification

Everything below was executed against the working tree on `feat-pdlc-decision-ledger`, not read out
of a document.

### Files the task table names

| Path | PLAN claim | Verified |
|---|---|---|
| `pdlc/workflows/orchestrate-dev.js` | exists at HEAD | ✅ present |
| `scripts/capture-learnings-baseline.mjs` | shipped harness, reused unchanged | ✅ tracked at repo root (`git ls-files`), and `runCaptureScript` is imported by `pdlc/workflows/__tests__/learningsCaptureScript.test.js:142` |
| `pdlc/workflows/__tests__/loopEconomicsBaselineGuard.test.js` | guard shape T-02 clones | ✅ present; its header at line 30 names the same capture harness |
| `pdlc/workflows/__tests__/loopEconomicsAnchorGuard.test.js` | census precedent T-11 clones | ✅ present |
| `pdlc/workflows/__tests__/advisoryDisabled.test.js` | `sourceExcludingParser` / PROP-DIS-06 | ✅ present |
| `pdlc/engine/__tests__/loop-config-example.test.js` | disclosure shape T-12 clones | ✅ present; committed-`test.skip` contract stated at line 24 |
| `pdlc/workflows/__tests__/documentOracles.test.js` | T-19's test file | ✅ present |
| `.claude/pdlc.config.example.json` | tracked, eight top-level blocks | ✅ tracked; parsed to exactly 8 keys, in the order the PLAN lists them |
| `pdlc/.claude-plugin/plugin.json` | version `0.23.6` | ✅ `"version": "0.23.6"` at line 4 |
| `pdlc/workflows/dist/pdlc-cli.mjs` | generated artifact | ✅ present |
| `pdlc/OPERATIONS.md`, `pdlc/README.md`, `CLAUDE.md` | exist | ✅ all present |

Every remaining path in the Test File / Source File columns carries an explicit `[new]` marker. **No
unmarked non-existent path.** The PLAN's own claim to that effect holds.

### T-00's eight baseline symbols

All eight exist in `pdlc/workflows/orchestrate-dev.js` and seven are exported, so an existence gate
can import them:

`LEARNINGS_CORPUS_ARGV` (line 2230), `parseLearningsConfig` (2252), `readLearningsConfigSafely`
(2313), `parsePinCheckConfig` (2363), `parseDerivativeStopConfig` (2414), `renderLearningsBlock`
(2731), `gatherLearningsCorpus` (2771), `reviewLoop` (9194) — all `export`ed. The sentinel-bounded
region the PLAN cites is real: `// === LEARNINGS INJECTION REGION START ===` at line 2184,
`... END ===` at 2892. `reviewerPrompt` (line 11433) is module-private, exactly as the PLAN's
integration-points table states, and `main()` is the default export at line 14657.

### Count literals

| Literal | PLAN | Measured |
|---|---|---|
| in-scope `DECISIONS-*.md` at `8c673a09f` | 25 | **25** — `git ls-tree -r --name-only 8c673a09f` filtered by TSPEC §4.5's four globs |
| in-scope files in the live tree | 26 | **26** — same globs via `git ls-files --cached --others --exclude-standard` |
| `.claude/pdlc.config.example.json` top-level blocks | 8 | **8** |
| FSPEC acceptance tests | AT-01…AT-18 | **18**, and the PLAN's AT-ownership table covers all 18 with no gap and no invented id |
| TSPEC failure rows | F-1…F-14 | **14**, and the PLAN's failure-row table covers all 14 |
| `pdlc/engine/__tests__/` | "73 files at HEAD" | 73 *directory entries*, of which 64 are `*.test.js`, 7 are `_`-prefixed helper modules and 2 are directories (`fixtures/`, `live/`). See F-08 |

### Gate commands

- `pdlc/workflows/package.json` `test:coverage` is
  `c8 npm test -- --runInBand && c8 report --reporter=json && node scripts/check-wave-resume-delta-coverage.mjs && c8 report --check-coverage --per-file --branches 85 …`.
  The PLAN quotes the first and last clauses and **omits the third**. See F-02.
- c8 `include` does name `**/pdlc/workflows/orchestrate-dev.js`. PLAN correct.
- jest `testPathIgnorePatterns` is exactly `["/node_modules/", "/__tests__/helpers/", "/__tests__/fixtures/"]`.
  PLAN correct — T-01's helper and T-02/T-03's fixtures (including `scenarios.mjs`) are never
  collected as tests.
- `pdlc/workflows/__tests__/fixtures/` already holds `learnings-baseline/` and
  `loop-economics-baseline/`. PLAN correct — T-02 and T-03 are the third and fourth of a shipped kind.
- `pdlc/engine` `npm test` is `node __tests__/_run-suite.mjs`, which spawns `node --test` over the
  whole `__tests__/` directory. A new `decision-ledger-config-example.test.js` is collected
  automatically; no manifest to update. T-12 is safe on that axis.

### The census literal that reds at batch 1

`pdlc/workflows/__tests__/documentOracles.test.js:398` asserts

```js
readdirSync(testDir).filter((name) =>
  name.endsWith(".test.js") && !name.startsWith("learnings") && !name.startsWith("waveResume")
  && !name.startsWith("loop") && !name.startsWith("escalationView")).length === 102
```

I measured it: `ls *.test.js | wc -l` = 154; after the four prefix exclusions, **exactly 102**. The
`decisionLedger*` namespace is not among the exclusions. This is F-01.

## Findings

_pending_

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Verdict

_pending_
