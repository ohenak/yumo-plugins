# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.12)
**Date:** 2026-08-20
**Iteration:** 3 (delta confirmation, erratum round)

## Overview

Delta confirmation on the v1.11 → v1.12 erratum (`efeb798e..0f2a9710`, nine commits). Scope is the
delta plus this TSPEC's fidelity to upstream **at HEAD** — REQ `sha256:f97f4f66…`, FSPEC
`sha256:d602c440…` (FSPEC v1.7) — not the routed item list (DEC-ERR-03).

Every current-state claim the erratum makes was re-measured against the tree rather than read:

| Erratum claim | Measured at HEAD | Verdict |
|---|---|---|
| `build-runtime.mjs` emits only `pdlc-cli.mjs` | `bundles` array has one entry, `file: "pdlc-cli.mjs"` (`build-runtime.mjs:131-133`) | holds |
| `prepack.mjs` vendors `MODULE_NAMES` verbatim | `const MODULE_NAMES = ["orchestrate-dev.js", "orchestrate-queue.js"]` + `copyFileSync` per name (`prepack.mjs:20,39-45`) | holds |
| One `commitPaths` per promoted task | `for (const promo of waveResolvedPromotions)` (`orchestrate-dev.js:15471`) over `groupPromotedPaths` rows (`:15403`) | holds |
| `git add -A`, no `--` | `["add", "-A"]` (`orchestrate-dev.js:12580`) | holds |
| `ADVISORY_SEAMS` is six members | `Object.freeze(["A1"…"A6"])` (`orchestrate-dev.js:1952`); `ADVISORY_SEAM_PHASES` carries six rows | holds |
| example config carries `advisory` | `{"enabled": false, "waveBudgetPerRun": 1}` | holds |
| nothing tracked under `.claude/workflows/` | `git ls-files .claude/workflows/` → 0 rows | holds |
| DEC-A6-03's halt-message obligation **has landed** upstream | FSPEC v1.7: BR-14 (co-location clause), §3 Step 10 two arms, E-34, AT-06-4 conjunct (3) + AT-06-4b; REQ carries the same clause | holds — the earlier "unlanded" report is inverted, correctly absorbed rather than re-routed |

All seven mechanical items land. One consequence of the eighth does not: the obligation landed in
the **design** half of this TSPEC and not in its **oracle** half, which is the finding below.

## Architecture

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
