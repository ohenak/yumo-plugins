# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-wave-resume/DECISIONS-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 2
**Scope:** Delta re-review. Product lens only — requirements traceability, scope compliance,
acceptance-criteria fidelity, and the fidelity of the *counted costs* this document stakes its
decisions on. Base reviewed at v1: `4edad92a`. Delta reviewed: `4edad92a..020b74a0`.

## Delta verification — my v1 findings

Each v1 finding was re-run against the same evidence source the document names — `origin/main` at
`345ae358` — not against the document's own assertion that it had been fixed.

| v1 finding | Disposition | Evidence re-run |
|---|---|---|
| **F-01 (Medium)** — the 44-test cost was overstated; measured, 26 | ✅ **Resolved** | §Context now reads **26 test cases (18 / 4 / 4)**, states the command (`npm test -- __tests__/waveExecution.test.js --verbose` from `pdlc/workflows`), and states the *counting rule* I had to infer in v1 ("test *cases*, with `it.each` members counted individually — the same three blocks are 23 `it` statements"). Re-derived: the ledger `describe` (`waveExecution.test.js:2239`–`:2716`) holds **15** `it` statements, one of which is the four-member `it.each` at `:2624` ⇒ 14 + 4 = **18**; `describe("Phase I — implementation.startWave resumes a halted run")` (`:2077`) holds **4**; `describe("computePlanHash — the ledger's plan fingerprint")` (`:2717`) holds **4**. 26, and 23 `it` statements. O-1 and DEC-WVR-01 both carry the corrected figure; no `44` survives anywhere in the file |
| **F-02 (Low)** — "largest tracked file" was the runner-up | ✅ **Resolved** | The row now claims largest tracked **source module**, second-largest tracked file overall, and prints the command. `git ls-tree -r -l origin/main \| sort -k4 -n -r \| head -3` returns exactly the three rows quoted: `dist/pdlc-cli.mjs` 738,924 B, `orchestrate-dev.js` 734,711 B, `docs/discarded/…/REQ-pdlc-review-convergence.md` 314,472 B. The revision does more than correct the rank — it turns the correction into the sharper reading ("the largest tracked file in the repo is a build output of the file this feature edits") and wires it to the third accepted risk |
| **F-03 (Low)** — "~81 lines" did not match the named span | ✅ **Resolved** | §Context and DEC-WVR-02 now both say **48 lines** for the chain and **84 lines** for the enclosing read block. Re-measured on `origin/main`: `if (ledger.reason) {` at `orchestrate-dev.js:15297`, the final `else`'s closing brace at `:15344` ⇒ **48**, exactly as the document bounds it; `if (!explicitPointer) {` at `:15263` through its closing brace at `:15346` ⇒ **84**. Both figures are now exact rather than approximate, and DEC-WVR-02 says which of the two it extracts |
| **F-04 (Low)** — two seam denominators (36th seam vs ~35 seams) | ✅ **Resolved** | §Context now states the denominator once and binds it: `main()` "destructures **36 parameters, 34 of them injected seams**… an added seam would be the **35th seam** and the **37th parameter**". Re-counted over the destructured list at `orchestrate-dev.js:12992`–`:13047`: **36** entries, **34** underscore-prefixed. O-3 and DEC-WVR-02 both now say "35th injected seam (a 37th parameter…)"; `git grep` finds no surviving `36th` or `~35` |
| **F-05 (Low)** — queue-parity gap missing from the DC-08 open table | ✅ **Resolved** | A fourth row is added, and it says the thing I asked for and one thing more: it names the disclosure/successor distinction explicitly ("a sentence in a test is a disclosure, not a successor surface"), cites REQ-WVR-07 P2 Phase 2, and names the successor surface as DEC-WVR-07's existing trigger — the queue's delegation payload growing a second key |
| **F-06 (Low)** — DEC-WVR-04's write-site oracle was absence-only | ✅ **Resolved** | The Consequences row is now positive-first with the absence as a derived conjunct: every observed ledger write parses to a key set **exactly** `{version, feature, planHash, lastGreenWave}` (plus `head` when a transport is injected), and no observed write is `{}` or `""`. It also states *why*, in the vocabulary of the oracle bar: "An absence-only oracle … would be satisfied by a run that writes nothing at all". Verified against the write site: `formatWaveLedger` (`orchestrate-dev.js:12325`–`:12331`) emits exactly those four keys, plus `head` when it is a non-empty string; there is exactly one `writeWaveLedger(` call site (`:15601`) |

**Both open questions were answered in the document rather than deferred.** Q-01 (is the `✅` report
row's extension conditional on `N > 1`?) is now written into DEC-WVR-03 as a decision clause, with
the reason stated in the count's own terms. Q-02 (`version` is written but never read) is now stated
in DEC-WVR-05 itself — verified: `parseWaveLedger` (`:12267`–`:12304`) checks `feature`, `planHash`
and `lastGreenWave` only and never dereferences `parsed.version`, so "the freeze binds the writer,
not the reader" is the honest reading. Q-03 (the `{}` hatch's reversibility) is answered by scoping
the "hard in expectation" caveat to an operator who discovered the behaviour by experiment.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
