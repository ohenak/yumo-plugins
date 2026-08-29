# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/PROPERTIES-pdlc-decision-ledger.md` (v1.1)
**Date:** 2026-08-29
**Iteration:** 2

## Delta scope

Base reviewed at v1: `9d8dc6db9^`. Delta: `git diff 9d8dc6db9^..HEAD -- PROPERTIES-*.md` = **106 insertions,
38 deletions** over nine commits (`9d8dc6db9`…`ae0a4a5f0`), all cited to round-1 findings. Sections
touched: the version block's v1.1 changelog, PROP-CFG-06, the BND conjunct table and the note beneath
it, FAIL's `Traces`, the DISC preamble/table and the census-provenance paragraph, ORC-04 clause (b),
and §Coverage Matrix (family rows, new module manifest, pyramid arithmetic, AT map, upstream-obligation
table). I re-derived every existing-code claim the delta introduces or moves; unchanged sections were
not re-reviewed.

Existing-code claims new in this delta, all reproduced at HEAD:

| Claim | Where | Result |
|---|---|---|
| `documentOracles.test.js` filters four prefixes and asserts `expect(count).toBe(102)`, cited `:398–420` | PROP-DISC-07 | **Reproduced** — filter at `documentOracles.test.js:412–419`, `expect(count).toBe(102)` at `:420` |
| Eight HEAD symbols importable from `pdlc/workflows/orchestrate-dev.js`, plus `runCaptureScript` from `scripts/capture-learnings-baseline.mjs` | PROP-DISC-09 | **Reproduced** — all eight carry an `export` at HEAD; `runCaptureScript` exported at `scripts/capture-learnings-baseline.mjs:122`. The path is repo-root-relative and correct |
| `plugin.json` HEAD version `0.23.6`; `pdlcPluginCompat: "^0.23.0"` | PROP-DISC-08 | **Reproduced** — `pdlc/.claude-plugin/plugin.json:4`, `pdlc/engine/package.json:18` |
| `PROP-DIS-06` is `pdlc-advisory-tier`'s id, at `advisoryDisabled.test.js:711` and referenced in `orchestrate-dev.js:9263` | §Census prose | **Reproduced** — `describe("PROP-DIS-06 …")` at `advisoryDisabled.test.js:711`; the destructuring comment naming PROP-DIS-06 at `orchestrate-dev.js:9263` |
| `parseLearningsConfig` returns `degraded(false)` for a non-plain-object top level and reserves `degraded(true)` for a present non-plain-object section | PROP-CFG-06 | **Reproduced verbatim** — `orchestrate-dev.js:2268` (`!isPlainObject(parsed)` → `degraded(false)`) and `:2271` (`!isPlainObject(section)` → `degraded(true)`) |
| 101 property rows partitioned `10+11+9+6+12+11+5+10+11+6+10` | §Coverage Matrix | **Reproduced** — mechanical count of line-leading `| **PROP-…**` rows is exactly 101, and the per-family counts match the stated partition term for term |
| All 24 `PLAN` task ids named | §Coverage Matrix | **Reproduced** — each of T-00, T-00a, T-01…T-12a, T-13…T-20 occurs at least once |

Not one figure is off, and the module manifest's fourteen rows are a faithful transcription of `PLAN`'s
file-ownership manifest (`PLAN`:145–186) in owner **and** batch for every row.

## Prior findings — disposition

| v1 | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | PROP-DISC-07 now states the split explicitly and names `PLAN` **T-00a** (batch 1) as the owner of the exclusion edit, quoting T-00a's own title. The batch-1 required-check hazard I raised is gone: the exclusion lands in the batch that adds the first three `decisionLedger*` modules, matching `PLAN`:99. §Coverage Matrix's DISC row and the module manifest both carry the same owner. |
| F-02 | Medium | **Resolved** | PROP-DISC-08 is now owned by **T-20** (batch 10), matching `PLAN`:121 and `PLAN`'s file-ownership rows for `pdlc/workflows/dist/pdlc-cli.mjs` and `pdlc/.claude-plugin/plugin.json` (`PLAN`:185–186). The manifest adds the explicit "T-20 owns no test module by design" row, which is the honest form. |
| F-03 | Medium | **Resolved** | A module manifest table now names all fourteen test files with owning task and batch; the two previously id-less modules get **PROP-DISC-09** (`decisionLedgerPreflight.test.js`, T-00) and **PROP-DISC-10** (`decisionLedgerFixtureGuard.test.js`, T-03); INV's row names `decisionLedgerCensus.test.js` under T-11 → T-18 (`PLAN`:167, :243); OFF's row correctly records T-02 as having **no** red predecessor (`PLAN`:251). All four contradictions I listed are gone. |
| F-04 | Medium | **Resolved** | The pyramid is restated as a partition summing to **101**, and the count is checkable: the document's line-leading property rows number exactly 101, family by family. The superseded "47 / 11 / 37" reading is explicitly retracted rather than silently dropped. |
| F-05 | Medium | **Resolved** | PROP-BND-07 is a numbered conjunct row (`✖`, Category Contract) with its own falsifying mutation column, BND re-counted at 12, and it is discharged at AT-13. |
| F-06 | Medium | **Resolved** | PROP-CFG-06 now carries a positive return conjunct — three defaults, `invalidKeys: []`, `sectionMalformed: false` — on **each** input in its range, with the `false` (not `true`) value correctly derived from the shipped `parseLearningsConfig` short-circuit. The stub-returning-`undefined` escape is closed. |
| F-07 | Low | **Resolved** | The dangling id is now labelled as a deliberate cross-feature reference to `pdlc-advisory-tier`'s PROP-DIS-06, with both referents cited; I verified both. |
| F-08 | Low | **Resolved** | The three BND ranges are reconciled on one surface and the whole family is mapped to AT rows (01…04, 07, 12 → AT-13; 08, 09 → AT-14; 05, 06, 10, 11 → AT-15), which closes the two properties that no AT discharged. One stale fourth spelling survives in §Overview — F-03 below, Low. |

No prior finding regressed, and the delta introduced no factual error: every claim it adds reproduces at HEAD.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
