# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/PROPERTIES-pdlc-decision-ledger.md`
**Date:** 2026-08-29
**Iteration:** 1

## Verification Performed

Every quantitative and existing-code claim in the document was re-derived at HEAD rather than taken
on the document's word. **All of them reproduce exactly.** Recording that here so later rounds do
not re-pay the cost.

| Claim | Where | Result |
|---|---|---|
| 25 in-scope `DECISIONS-*.md` files at `8c673a09f`; 26 at branch HEAD, the addition being this feature's own DECISIONS | §Overview, FX-CORPUS | **Reproduced.** `git ls-tree -r --name-only 8c673a09f` over the four pathspecs yields 25; `git ls-files` at HEAD yields 26 |
| 141 records = 41 project-level + 100 feature-level under `DECISION_HEADING_RE` with last-wins | §Overview, ORC-01, FX-CORPUS | **Reproduced** by applying `TSPEC`:390's regex verbatim |
| Per-feature distribution: `pdlc-headless-engine` 22, `pdlc-advisory-tier` 11, `pdlc-engine-distribution`/`pdlc-learnings-injection`/`pdlc-loop-economics` 10, `pdlc-consolidation-agent`/`pdlc-wave-resume` 8, `pdlc-engineering-loop` 7, `orchestrate-dev-workflow` 6, `pdlc-advisory-wave-gate`/`pdlc-rcv-budget-stop` 4, `pdlc-plugin-retirement` **0** | ORC-01 | **Reproduced, every row, including the 0** |
| Project-level index = **6,305** bytes over 41 lines | ORC-03 A1/A2 | **Reproduced** under `TSPEC` §4.3's `{id} — {statement}  [{sourcePath} § {id}]` |
| `M-6b` 63-record slice = **10,859** bytes; margin `11,300 − 10,859 = 441` | ORC-03 B2/B3, §Risks | **Reproduced** |
| Eight HEAD symbols exported from `orchestrate-dev.js` at the cited offsets | §Overview | **Verified:** `LEARNINGS_CORPUS_ARGV`:2230, `parseLearningsConfig`:2252, `readLearningsConfigSafely`:2313, `parsePinCheckConfig`:2363, `parseDerivativeStopConfig`:2414 |
| `reviewerPrompt` at `:11433`; its two return paths at `:11483` / `:11506` | PROP-WIRE-08 | **Verified** |
| `fast-check": "^4.9.0"` declared at `pdlc/workflows/package.json:13` | §BND | **Verified** |
| `documentOracles.test.js` census filters `learnings`/`waveResume`/`loop`/`escalationView` and asserts `toBe(102)` | PROP-DISC-07 | **Verified** (`documentOracles.test.js`:398–421) |
| `advisoryDisabled.test.js` searches the LEARNINGS sentinel by exact string, not by shape | §Census prose | **Verified** (`advisoryDisabled.test.js`:718–719) |
| `pdlc.config.example.json` holds exactly the eight named blocks | PROP-DISC-01 | **Verified:** `dispatch advisory implementation learningsInjection cascade review loop merge` |
| `loop-config-example.test.js` transcribes `MERGE_DEFAULTS` rather than importing it | PROP-DISC-03 | **Verified** (`loop-config-example.test.js`:45) |
| `plugin.json` version `0.23.6`; `pdlcPluginCompat: "^0.23.0"` | PROP-DISC-08 | **Verified** |
| `runCaptureScript` exported from `scripts/capture-learnings-baseline.mjs`; `learningsBaselineGuard.test.js`, `loopEconomicsBaselineGuard.test.js`, `loopEconomicsAnchorGuard.test.js` all present | FX-BASELINE, ORC-04, §INV | **Verified** |
| All twelve `decisionLedger*.test.js` modules are new (zero exist at HEAD); `helpers/decisionLedgerDoubles.js` path agrees with `PLAN` T-01 | §Coverage Matrix | **Verified** |

I found **no** unverified existing-code claim and **no** nonexistent-authority citation. Given that
three features have shipped with a fabricated DEC/REQ citation, this is worth stating explicitly.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
