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

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
