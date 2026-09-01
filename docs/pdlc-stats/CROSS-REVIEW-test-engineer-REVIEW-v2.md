# Cross-Review: test-engineer — Implementation (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/` implementation — `pdlc/workflows/lib/stats.mjs`, `pdlc/engine/bin/cli.mjs` (`cmdStats`/`statsParsers`/`statsIo`), and the stats test files on `feat-pdlc-stats`
**Date:** 2026-08-31
**Iteration:** 2

## Scope

Delta re-review. This round judges two things only: whether my own v1 blocking findings
(F-01, F-02) are resolved, and whether the revision broke anything. Sections of the
implementation unchanged since `88c0d289c` are not re-litigated. Testing lens only.

## Delta Under Review

`git diff 88c0d289c..HEAD` — five commits, 403 insertions across eight files:

| File | Change |
|---|---|
| `pdlc/workflows/lib/stats.mjs` | +42/-10 — BR-11 presence branch, shared `dodReviewNames`, `LABEL_COLUMN_WIDTH` |
| `pdlc/workflows/__tests__/statsOutcome.test.js` | +9 — AT-27 positive condition clause (F-01) |
| `pdlc/workflows/__tests__/statsRender.test.js` | +98/-7 — single-feature malformed row (F-02), `malformed=2` cell (F-03), column width (F-05), human/JSON metric set-equality |
| `pdlc/workflows/__tests__/statsProperties.test.js` | +36 — PROP-PBT-04 independent oracle (F-04) |
| `pdlc/workflows/__tests__/statsMetrics.test.js` | +13 — BR-11 `-v0.md` case |
| `pdlc/workflows/__tests__/statsAntiDrift.test.js` | +34 — no-capability structural oracle |
| `pdlc/engine/__tests__/stats-cli.test.js` | +119 — fleet mode through the production caller |
| `pdlc/engine/__tests__/stats-read-only.test.js` | +52 — AT-21 human and fleet legs |

**Note this round changed production code, not only tests** (`stats.mjs`, +42/-10), so the
delta scan below covers behavior as well as oracles.

### Verification performed

| # | Check | Result |
|---|-------|--------|
| 1 | `git rev-parse --abbrev-ref HEAD` | `feat-pdlc-stats` — confirmed before any commit |
| 2 | Workflows suite (`npm test`) | 163 suites, **5121 passed**, 70 skipped — green (was 5116) |
| 3 | Engine suite (`cd pdlc/engine && npm test`) | 34 suites, **925 passed**, 2 skipped, **0 fail** |
| 4 | Targeted c8 over `lib/stats.mjs` | **96.27% branch** (was 95.62), 99.68% stmt/line — above the 85 floor |
| 5 | v1's uncovered `503-504` (F-02's malformed row) | now covered |
| 6 | v1's uncovered `422-423` (now `443-444`) | single-feature `unreadable_feature` catch — covered by `stats-cli.test.js:279-307`, which runs in the *engine* suite and so is invisible to the workflows c8 run; not a real gap |
| 7 | `node pdlc/workflows/build-runtime.mjs --check` | `in-sync pdlc/workflows/dist/pdlc-cli.mjs` — the production change reached the shipped artifact |

## Disposition of v1 Findings

<!-- pending -->

## Findings

<!-- pending -->

## Questions

<!-- pending -->

## Positive Observations

<!-- pending -->

## Recommendation

<!-- pending -->
