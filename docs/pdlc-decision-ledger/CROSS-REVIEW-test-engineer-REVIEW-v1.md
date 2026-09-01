# Cross-Review: test-engineer — Implementation (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** the feature diff of `feat-pdlc-decision-ledger` against `main` (production surface: `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/dist/pdlc-cli.mjs`, `.claude/pdlc.config.example.json`) plus `docs/pdlc-decision-ledger/` REQ/FSPEC/TSPEC/PLAN/PROPERTIES
**Date:** 2026-08-31
**Iteration:** 1
**Scope:** Implementation review from the testing lens — oracle falsifiability, production-path coverage, set-equality completeness, mutation checks.

## Method

Every claim below was checked against the repository, not against the documents:

1. **Suite health at HEAD.** `cd pdlc/workflows && npm test` — 166 suites, 5,253 passed, 70 skipped,
   0 failed. `npm test -- __tests__/decisionLedger` — 12 suites, 231 tests, all green.
2. **Mutation checks on load-bearing oracles.** Six single-edit mutations applied to
   `pdlc/workflows/orchestrate-dev.js`, each reverted immediately, the decision-ledger suite re-run
   after each. Results are cited per finding; the three that stayed GREEN are findings F-01 and F-02,
   the three that went RED are recorded under Positive Observations.
3. **Production-path tracing.** For each AC claiming operator-visible prompt content, the production
   caller was located by grep (`reviewLoop` → `runWrapped` → `wrapped` → `dispatchAndVerify`,
   `orchestrate-dev.js:9968-10010`, `:11587`) and the test driving *that* caller identified
   (`__tests__/decisionLedgerMain.test.js` drives the default-exported `main()`; no seam stands in
   for `gatherDecisionCorpus`/`selectDecisions`/`renderDecisionLedgerBlock`).
4. **Traceability sweep.** All eighteen FSPEC `AT-01…AT-18` ids appear in the decision-ledger test
   modules (`comm -23` over the two id sets is empty).
5. **Catalogue completeness.** Every frozen catalogue TSPEC §5.2 names was checked for an actual
   set-equality operand in the suite, then falsified by deleting a member.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | `DECISION_LEDGER_CORPUS_OUTCOMES` has no oracle at all: deleting a member leaves the whole decision-ledger suite green, and no production line reads it. PROP-FAIL-09 requires set equality against it. | `orchestrate-dev.js:2750-2753`; PROPERTIES PROP-FAIL-09; TSPEC §5.2 |
| F-02 | Medium | Local | `reviewerPrompt`'s new `ledgerBlock` parameter is dead: no caller ever passes it, so `ledgerPart` is unreachable. Deleting it from both return paths leaves 231/231 green. Delivery actually happens in `dispatchAndVerify`. | `orchestrate-dev.js:11888`, `:11932`, `:11961`, `:11587`; TSPEC §4.5; PROP-WIRE-08 |
| F-03 | Medium | Local | No oracle constrains the block to reviewer dispatches only: `decisionLedgerMain.test.js` captures every dispatch in `dispatched` but never asserts on it, so a creator/optimizer prompt carrying the block passes. | `__tests__/decisionLedgerMain.test.js:262`, `:357`; REQ G-2; PROP-OFF-01 |
| F-04 | Low | Local | Tautological assertion — `expect(EXPECTED_SOURCE_COMMIT).toBe("8c673a09f")` compares a constant with its own literal; the test can only pass. | `__tests__/decisionLedgerFixtureGuard.test.js:238-240` |
| F-05 | Low | Local | The bounds property's `if (block === "") return true;` early-out makes the property vacuously satisfiable by a renderer that always returns `""`. | `__tests__/decisionLedgerBounds.test.js:148-150` |
| F-06 | Low | Local | The live-wiring arm derives its expected suffix by running the code under test (`gatherDecisionCorpus` → `selectDecisions` → `renderDecisionLedgerBlock`) — an implementation echo for the byte content, mitigated but not eliminated. | `__tests__/decisionLedgerMain.test.js:405-421` |
| F-07 | Low | Local | `docs/.DS_Store` (6,148-byte binary) was committed on this branch. | `docs/.DS_Store`, commit `59063c421` |

### F-01 (High) — `DECISION_LEDGER_CORPUS_OUTCOMES` is an unconstrained, unread catalogue

TSPEC §5.2 declares three frozen catalogues, each "the operand of its own set-equality test", and
PROPERTIES PROP-FAIL-09 states the outcome values are "asserted as set equality against
`DECISION_LEDGER_CORPUS_OUTCOMES`". Neither holds at HEAD:

- **No test names the constant.** `grep -rn "CORPUS_OUTCOMES" pdlc/workflows/__tests__/decisionLedger*.js`
  returns exactly two hits, both inside census *string lists*
  (`decisionLedgerCensus.test.js:106`, `:153`) — the name as a token, never the object's members.
  Contrast `DECISION_LEDGER_NOTICES` (`decisionLedgerConfig.test.js:57-62`, frozen + key set equality)
  and `DECISION_LEDGER_DEFAULTS` (`:42-45`).
- **No production line reads it.** `corpusOutcome` is assigned the string literals directly:
  `orchestrate-dev.js:2837` (`"RSN-UNLISTABLE"`) and `:2839` (`"RSN-EMPTY"`), mirrored in the built
  bundle at `dist/pdlc-cli.mjs:3253`/`:3255`. The catalogue is exported and never dereferenced.
- **Mutation proof.** Deleting the line `EMPTY: "RSN-EMPTY",` from `orchestrate-dev.js:2752` and
  re-running `npm test -- __tests__/decisionLedger` gives **231 passed, 0 failed**. Running the full
  suite reddens only `coverageInstrumentation.test.js` (via `build-runtime.mjs --check` dist drift)
  and the known `AT-4.1` cleanup flake — no decision-ledger oracle fires.

This is the deleted-case failure of the set-equality contract: the catalogue is the disclosed,
operator-facing enumeration (`pdlc/OPERATIONS.md` documents corpus outcomes), and it can lose a
member, gain a member, or drift from the literals the injector actually emits with a green suite.
The sibling `DECISION_LEDGER_OMIT_REASONS` is at least anchored transitively through the
OPERATIONS disclosure test (`decisionLedgerConfig.test.js:395-400`); the corpus-outcome catalogue
has no such anchor.

**To resolve:** add to `decisionLedgerInjector.test.js` (a) `Object.isFrozen` plus a set equality
`new Set(Object.values(DECISION_LEDGER_CORPUS_OUTCOMES))` **equals** the hand-transcribed
`{"RSN-UNLISTABLE","RSN-EMPTY"}` (transcribed from TSPEC §5.2, not read back from the constant), and
(b) tie the injector's emitted values to the catalogue — assert the observed `corpusOutcome` of the
F-6 and F-7 arms is a member of `Object.values(DECISION_LEDGER_CORPUS_OUTCOMES)` **and** equals its
transcribed literal, so a drift in either direction reddens. Ideally also make the production
assignments read the catalogue (`DECISION_LEDGER_CORPUS_OUTCOMES.UNLISTABLE`), which removes the
dead-constant class entirely; if the census forbids that, the two-sided test above is sufficient.

### F-02 (Medium) — `reviewerPrompt`'s `ledgerBlock` parameter is unreachable dead code

TSPEC §4.5 fixes the shape as "`reviewerPrompt` gains one trailing parameter … `ledgerBlock = ""`",
and PROP-WIRE-08 pins the block "appended last, after `oraclePart` and `findingGrammarPart`, on both
… return paths of `reviewerPrompt`". The parameter exists (`orchestrate-dev.js:11888`) and both
return paths append `ledgerPart` (`:11932`, `:11961`) — but the only two call sites,
`orchestrate-dev.js:9970` and `:9980`, pass eight arguments and stop at `derivativeStopEnabled`.
`reviewerPrompt` is module-private, so no test can reach the ninth argument either. The block is in
fact delivered by `dispatchAndVerify` (`:11587`,
`` `${basePrompt}\n\n${PACING_CONTRACT_CLAUSE}\n\n${opener}${learningsBlock}${ledgerBlock}` ``),
threaded from `reviewLoop`'s per-round `await` (`:9968`) through `runWrapped`/`wrapped`.

**Mutation proof:** deleting `${ledgerPart}` from both `reviewerPrompt` return paths leaves
`npm test -- __tests__/decisionLedger` at **231 passed, 0 failed**. Dead code with a spec'd
obligation attached to it is exactly the shape that false-greens a later refactor: a maintainer
reading PROP-WIRE-08 will believe `reviewerPrompt` is the delivery locus and may "simplify" the
`dispatchAndVerify` thread, which no unit test at the named locus would catch (the end-to-end prompt
assertions in `decisionLedgerLoop`/`decisionLedgerMain` would — good — but the property's own
referent would be silent).

**To resolve:** pick one locus and make it the tested one. Either (a) delete the parameter and
`ledgerPart` from `reviewerPrompt`, leaving `dispatchAndVerify` the single documented append site —
in which case TSPEC §4.5 and PROP-WIRE-08 need the corresponding erratum (routed below), or (b) pass
`ledgerBlock` as the ninth argument at `:9970`/`:9980` and drop the `dispatchAndVerify` thread. Note
that (b) changes delivered bytes: the block would then sit *before* the pacing-contract clause and
the opener, not last in the prompt, which contradicts §2.6's "last". The implementation's inline
comment argues (a) is correct; I agree with the reasoning — what is missing is deleting the code the
reasoning made dead, and correcting the two upstream documents that still name the other locus.

## Questions

## Positive Observations

## Recommendation

## Verdict
