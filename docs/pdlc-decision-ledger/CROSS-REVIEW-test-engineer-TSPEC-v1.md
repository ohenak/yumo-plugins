# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (Draft v0.1, 2026-08-28)
**Date:** 2026-08-28
**Iteration:** 1

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | §3.6's "under the shipped defaults the bound is never reached and the order is inert" is **false, measured**. Executing §3.2's `DECISION_HEADING_RE` and §4.3's line format over the corpus at `8c673a09f` renders the project-level set **alone** at 9,371 bytes (41 lines, mean 232 B/line) — already past `maxBytes` 8000 before any feature record and before the framing §4.2/D-5 charges to the bound. §7.6's AT-01 dispatches measure 10,441 B (45 lines, `pdlc-advisory-wave-gate`) and 11,354 B (48 lines, `pdlc-engineering-loop`); the largest, `pdlc-headless-engine`, is 16,283 B (63 lines). The omission order is live on day one, and AT-01's expected line sets are unrenderable at the C-5 defaults | §3.6, §4.2, §9.1 D-5, §7.6 AT-01 |
| F-02 | High | Local | §7.4's recorded stream cannot discriminate AT-05's four not-enabled spellings, so that oracle is vacuous. The case drives "the exported `reviewLoop` directly", but `reviewLoop` never reads config: the gate is in `main()` (`readLearningsConfigSafely` at `orchestrate-dev.js:15071`, `wrapperSeams` at `:15170`), and `reviewLoop`'s parameter list (`:9194–9240`) takes only seams. Under all four spellings the direct driver passes `_injectDecisionLedger` unset and emits identical bytes for a reason unrelated to the gate — a test that can only pass | §7.4 "Recorded stream", §7.6 AT-04/AT-05 |
| F-03 | High | Local | §7.4 clause (b) prescribes an oracle the cited precedent deliberately rejected. `loopEconomicsBaselineGuard.test.js:239–253` pins `mergeBaseSha` to a **hand-transcribed** `EXPECTED_MERGE_BASE_SHA` and adds only `git merge-base --is-ancestor`, naming ancestry a "weaker second signal". Recomputing `git merge-base origin/main HEAD` *at test time* is non-hermetic — it needs a fetched `origin/main` (absent in a shallow CI clone) and moves whenever `main` advances — so a delivery-blocking gate check reds for reasons unrelated to the artifact | §7.4 pinning clause (b) |
| F-04 | High | Local | §3.4's cross-file precedence **direction** has no positive oracle anywhere in §7. FSPEC AT-18 is cardinality-only by its own words ("Which of the two records supplies the statement is TSPEC's … deliberately not asserted here", FSPEC `AT-18`); §7.6 defers the conjunct to "§3.4, asserted separately there", but §3.4 assigns no test, and §7.2's corpus oracle runs over the frozen HEAD corpus where `M-5a` records **zero** duplicate ids. A feature-level-wins implementation passes every test this spec names | §3.4, §7.6 AT-18 |
| F-05 | High | Local | §7.3's source census — the sole mechanism §8.1 assigns to REQ-DECLEDGER-08/BR-11 — is unimplementable as written. It forbids "identifiers from the ledger's output types (`DecisionRecord`'s `id` …)", but `id` is a ubiquitous token in `orchestrate-dev.js`; and it scopes the scan to "the convergence, dedupe, derivative-stop, erratum-mint or confirmation-presence **regions**", which have no source delimiters (the file's only sentinel-bounded region is `// === LEARNINGS INJECTION REGION START/END ===`, `orchestrate-dev.js:2184`). The cited precedent `DEC-LOOPECON-07` (`DECISIONS-pdlc-loop-economics.md:196–198`) is specified as set equality over a **named function census** plus zero occurrences of **three literal tokens** | §7.3 "Source census", §5.5 |
| F-06 | Medium | Local | §4.2 has `selectDecisions` compute `renderedBytes` *including* framing while §4.3 has `renderDecisionLedgerBlock` *produce* the framing. Two sites own one byte budget with no stated single source of truth; a drift makes BR-12's bound wrong while both functions individually look right | §4.2, §4.3 |
| F-07 | Medium | Local | §7 states no branch-coverage obligation. All new code lands in `orchestrate-dev.js` (D-6), whose per-file c8 floor is computed over a ~17k-line file (`pdlc/workflows/package.json` c8 `include: **/pdlc/workflows/orchestrate-dev.js`), so §6.1's fourteen new failure branches can be wholly uncovered without moving the gate | §7, §9.1 D-6 |
| F-08 | Medium | Local | §7.6 AT-03 says a record is "mutated **in the fixture copy** between two injector calls" while §7.3 guards that copy with hand-transcribed per-file digests. Taken literally the two reds each other | §7.3, §7.6 AT-03 |
| F-09 | Medium | Local | §7.5's model is "the production line renderer applied per record" — an implementation echo. The no-truncation conjunct then cannot fail for a wrong line **format**; only the prefix conjunct is non-vacuous | §7.5 |
| F-10 | Low | Local | `E-1` is overloaded inside one document: FSPEC's E-1 (cited at §2.3) and this spec's own erratum id E-1 (§4.1, §9.2). A PROPERTIES author transcribing "E-1" cannot tell which | §2.3, §4.1, §9.2 |
| F-11 | Low | Local | FSPEC `E-9`, `E-10`, `E-11` are never cited by id in this spec. The behaviour lands (§3.2, §3.3, §3.4) but §8.1's traceability cannot be checked mechanically against the FSPEC's edge-case set | §8.1 |
| F-12 | Low | Local | Neither §2.1 nor D-6 states whether the new symbols land inside or outside `// === LEARNINGS INJECTION REGION START/END ===`. `advisoryDisabled.test.js:711–742` slices that region out before counting `/\.enabled\b/`, so placement decides whether §2.3's destructured-read discipline is load-bearing or moot | §2.1, §2.3, §9.1 D-6 |

## Questions

*(pending)*

## Positive Observations

*(pending)*

## Recommendation

*(pending)*

