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

*(pending)*

## File Ownership Manifest

*(pending)*

## Dependencies

*(pending)*

## Verification

*(pending)*

## Definition of Done

*(pending)*
