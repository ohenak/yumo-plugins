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

No High findings. Both rows below are v1 Lows that the round did not take up; neither is a regression from the delta, and neither gates.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | The BND property's `if (block === "") return true;` escape hatch survives; empirically confirmed vacuous — a renderer returning `""` for every input leaves the property GREEN, which is exactly what `PROPERTIES`:270–272 and `TSPEC`:1616–1617 assert must fail. Contained by five example anchors that do red. | `__tests__/decisionLedgerBounds.test.js:157–159`; PROP-BND-04 |
| F-02 | Low | Local | The live composition-root arm still derives its expected suffix by calling the production renderer under test, so a chain-wide format change would move both sides of the comparison together. | `__tests__/decisionLedgerMain.test.js:424–428`; PROP-WIRE-05 |

### F-01 (Low) — the bounds property's empty-block escape hatch is demonstrably vacuous

v1 filed this as a contained risk. This round it is measured rather than argued. Mutation **M8** replaced `renderDecisionLedgerBlock`'s body with an unconditional `return ""` and re-ran `decisionLedgerBounds.test.js`:

```
✓ PROP-BND-01…04, 12: for any set × line sizes × bounds, the block is "" or satisfies all four conjuncts …
✕ a set exceeding maxEntries alone is truncated to maxEntries lines, prefix-ordered
✕ a set exceeding maxBytes alone (separately) is truncated to fit the byte bound, prefix-ordered
✕ one line alone exceeding maxBytes is absent in full; the other lines still render
✕ the oversized line is FIRST in the order: it alone is omitted, the lines behind it render (E-8, CR F-01)
✕ where the oversized line is the only line, the block is exactly ""
Tests: 5 failed, 1 passed, 6 total
```

The property is the one test in the file that stays green. `PROPERTIES`:270–272 states the opposite in as many words — *"A renderer returning `""` for every input satisfies PROP-BND-01, -02 and -03 trivially. Only the prefix conjunct fails it"* — and `TSPEC`:1616–1617 repeats it. The stated obligation is therefore not discharged by the shipped property; it is discharged by the example anchors beside it.

Why this stays **Low** and not higher: no false-green ships. The suite as a whole kills M8 five times over, and PROP-BND-04's *own* named mutation ("the loop drops from the front") does red the property — **M4** confirms that, taking the property and three anchors down together. The gap is between the property's stated reach and its actual reach, not between the suite and reality.

**To resolve** (unchanged from v1 F-05, one conjunct): on the `block === ""` branch, return `false` when the case had something to render — `nProject + nFeature > 0`, `thresholds.maxEntries >= 1`, and `maxBytes` at least framing plus one modelled line. The model already computes framing and line bytes from `modelFormatLine` at `:236–242`, so the conjunct needs no renderer call and does not breach PROP-BND-07.

### F-02 (Low) — the live arm's expected suffix is still derived from the code under test

`decisionLedgerMain.test.js:424` builds `expectedBlock` via `dev.renderDecisionLedgerBlock({ selected })` and asserts `prompt.endsWith(expectedBlock)` at `:428`. The `expectedBlock.length > 0` floor at `:425` rules out the empty-string degenerate case, and the sibling render suite pins the block's text against hand-transcribed literals, so the format is anchored *somewhere*. But within this arm the expectation and the artifact share a producer: a chain-wide format change moves both sides together and the arm stays green.

**To resolve:** assert one spec-transcribed anchor on the observed prompt in this arm — the trailer `--- CLOSED DECISIONS (do not re-open without new evidence) ---` is already a hand-transcribed literal elsewhere in the suite and costs one line here.

## Questions

| ID | Question |
|----|---------|
| Q-01 | The F-02 remediation deleted `reviewerPrompt`'s parameter and left an eleven-line comment (`orchestrate-dev.js:11905–11916`) explaining why the locus is `dispatchAndVerify` instead. That reasoning is correct and I agree with it, but it now lives only in a code comment while `TSPEC` §4.5 and PROP-WIRE-08 still name the deleted parameter. I have routed both as errata. Confirm the errata land before Phase PUB — otherwise the next reader reconciling spec to code re-introduces the dead parameter. |
| Q-02 | v1 Q-02 stands unanswered: the feature's ~530 new lines are measured only inside `orchestrate-dev.js`'s ~15k-line whole under `--per-file --branches 85`, so no delta-coverage floor binds on this feature specifically. The E-8 pass added this round is new branching that no delta gate observes. Is a decision-ledger delta-coverage check in scope as a follow-up, or explicitly deferred? |
| Q-03 | The new line-local pass records `RSN-BYTES` omissions *before* the tail-drop loop appends its own, so `omitted[]`'s ordering is no longer enumeration order when a head-position line is oversized. Nothing in `PROPERTIES` pins `omitted[]` ordering, and I file no finding. Is that intentionally unpinned, or worth one conjunct? |

## Positive Observations

## Recommendation

## Verdict
