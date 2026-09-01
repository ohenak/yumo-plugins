# Cross-Review: test-engineer — Implementation (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** `feat-pdlc-decision-ledger` vs `main` — production surface `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/dist/pdlc-cli.mjs`; test surface `pdlc/workflows/__tests__/decisionLedger*.test.js`
**Date:** 2026-08-31
**Iteration:** 2
**Scope:** Delta re-review of `a75764972..HEAD` (the five remediation commits landed after `CROSS-REVIEW-test-engineer-REVIEW-v1.md`). Testing lens only: oracle falsifiability, production-path coverage, set-equality completeness, mutation checks.

## Method

Delta protocol, per the re-review contract:

1. **Diff scoped.** `git diff --stat a75764972..HEAD` — 8 files, +306/−56: `orchestrate-dev.js` and its regenerated `dist/pdlc-cli.mjs` (+40/−20 each), four decision-ledger test modules, `.gitignore`, and the deletion of `docs/.DS_Store`. Only these sections were scanned for new issues; sections already approved in v1 were not re-litigated.
2. **Suite health at HEAD.** `npm test` in `pdlc/workflows` — **166 suites, 5,258 passed, 70 skipped, 0 failed** (v1: 5,253 passed, 70 skipped — +5 tests, no new skips). `npm test -- __tests__/decisionLedger` — **12 suites, 236 tests, green** (v1: 231).
3. **Bundle parity.** `node pdlc/workflows/build-runtime.mjs --check` → `in-sync  pdlc/workflows/dist/pdlc-cli.mjs`. Working tree clean.
4. **Eight single-edit mutations**, each applied in isolation to `orchestrate-dev.js` (or the guard test), the decision-ledger suite re-run, then reverted with `git checkout`. Every mutation targets an oracle the remediation claims to have added, so the observed colour is the evidence that the fix is load-bearing rather than decorative. Results are transcribed per finding below.
5. **Upstream cross-check.** The two documents the F-02 remediation cites as routed (`TSPEC` §4.5, `PROPERTIES` PROP-WIRE-08) and the bounds-property statement (`TSPEC`:1613–1618, `PROPERTIES`:265, :270–272) were read at HEAD to confirm whether they now match shipped behaviour. They do not; those are routed as errata below rather than folded into this verdict, since the defect is in the upstream document, not in the artifact under review.

## Disposition of v1 findings

| v1 ID | Severity | Status | Evidence |
|-------|----------|--------|----------|
| F-01 | High | **Resolved** | `decisionLedgerInjector.test.js:455–516` pins `DECISION_LEDGER_CORPUS_OUTCOMES` two-sidedly; production now reads the catalogue (`orchestrate-dev.js:2860`, `:2862`). Mutations **M1**, **M2** both RED. |
| F-02 | Medium | **Resolved (code); routed upstream** | The unreachable `ledgerBlock` parameter and its two `ledgerPart` appends are deleted (`orchestrate-dev.js:11905–11916`, `:11955`, `:11979`). `TSPEC` §4.5 / PROP-WIRE-08 still name the removed locus — routed as errata, not counted here. |
| F-03 | Medium | **Resolved** | `decisionLedgerMain.test.js:494–521` asserts creator/optimizer byte-identity across the paired arms, positively, with a non-vacuity floor and an anchor conjunct. Mutation **M7** RED on exactly that test. |
| F-04 | Low | **Resolved** | `decisionLedgerFixtureGuard.test.js:238–253` now reads Baseline v1.2's own `Verified at` row. Mutation **M5** RED. |
| F-05 | Low | **Open** | Carried forward as **F-01** below, with new empirical evidence. |
| F-06 | Low | **Open** | Carried forward as **F-02** below. |
| F-07 | Low | **Resolved** | `git ls-files docs/.DS_Store` is empty; `.gitignore:47` carries `.DS_Store`. |

### Mutation log

Each row: single edit, decision-ledger suite re-run, edit reverted before the next row.

| # | Mutation | Observed |
|---|----------|----------|
| M1 | `EMPTY: "RSN-EMPTY"` → `"RSN-NOTHING"` (`orchestrate-dev.js:2775`) | **RED** — 3 tests, 1 suite |
| M2 | add a `SPURIOUS: "RSN-SPURIOUS"` catalogue member | **RED** — 2 tests, 1 suite |
| M3 | disable the E-8 line-local pass (`if (…) {` → `if (false) {`, `:2733`) | **RED** — 1 test (the new head-position anchor) |
| M4 | `candidates = fitsAlone` → `fitsAlone.slice(1)` (front-drop a line that fits) | **RED** — 4 of 6 tests in `decisionLedgerBounds.test.js`, including the property |
| M5 | `EXPECTED_SOURCE_COMMIT` `8c673a09f` → `8c673a09e` | **RED** — 1 test |
| M6 | append a `LEAK` suffix to every dispatch carrying no ledger block (`:11610`) | **RED** — 5 tests, 3 suites |
| M7 | thread the flag-on block onto **non-reviewer** dispatches only (leaked default at `:11480`) | **RED** — exactly 1 test: the new F-03 byte-identity anchor |
| M8 | `renderDecisionLedgerBlock` returns `""` unconditionally (`:2638`) | **BND property GREEN**; 5 example anchors RED — see F-01 |

M7 is the decisive one: it reproduces precisely the regression class v1 F-03 named — the block reaching a creator or optimizer dispatch on the flag-on arm while every reviewer conjunct and the flag-off baseline stay green — and it now reddens one test and only that test.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
