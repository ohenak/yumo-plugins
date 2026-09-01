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
| F-02 | Medium | Local | `reviewerPrompt`'s new `ledgerBlock` parameter is dead: no caller ever passes it, so `ledgerPart` is unreachable. Deleting it from both return paths leaves 231/231 green. Delivery actually happens in `dispatchAndVerify`. | `orchestrate-dev.js:11891`, `:11938`, `:11962`, `:11587`; TSPEC §4.5; PROP-WIRE-08 |
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
… return paths of `reviewerPrompt`". The parameter exists (`orchestrate-dev.js:11891`) and both
return paths append `ledgerPart` (`:11938`, `:11962`) — but the only two call sites,
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

### F-03 (Medium) — nothing pins the block to reviewer dispatches alone

REQ G-2 makes the rule text and index "reviewer-side" and REQ-DECLEDGER-03's Who is "reviewer
authoring a cross-review"; the flag-off arm proves the *creator* prompt is byte-identical to the
merge-base recording, but that arm has the feature disabled. On the **flag-on** arm the only prompt
assertions are over `tPrompts`, the four Phase-T reviewer dispatches
(`__tests__/decisionLedgerMain.test.js:397`, `:419-421`). The harness already collects every
dispatch — `dispatched.push({ skill, text })` at `:262`, returned at `:357` — and then never asserts
on it. A regression that appended `ledgerBlock` to the creator/optimizer dispatch (for example by
defaulting `ledgerBlock` in `wrapped` to the round's block instead of `""`) is invisible to the
suite: the reviewer assertions still pass and the flag-off baseline is a different run.

This is the negative half of a positive/negative pair, so it must be positive-asserted, not
absence-only. **To resolve:** on the same flag-on run, assert (a) the creator dispatch matching
`CREATOR_TSPEC_MARKER` and the optimizer dispatch matching `OPTIMIZER_TSPEC_MARKER` are
**byte-identical to their flag-off counterparts** from the paired run already available in the
`report`-key-set test (`:452-472`), and (b) neither ends with `expectedBlock`. (a) alone is enough
and is the falsifiable form; (b) alone would be the weak, absence-only form.

### F-04 (Low) — a test that can only pass

`__tests__/decisionLedgerFixtureGuard.test.js:238-240`:

```js
it("the frozen source commit is recorded as 8c673a09f (Baseline v1.2's Verified-at commit)", () => {
  expect(EXPECTED_SOURCE_COMMIT).toBe("8c673a09f");
});
```

`EXPECTED_SOURCE_COMMIT` is declared as that same literal at `:161`, so the assertion is
`"8c673a09f" === "8c673a09f"`. It states no fact about the fixture. The rest of this module is
strong (hand-transcribed per-file digests, a set equality over the 25 paths, and an
instrument-fires control at `:242-254`), which makes this one row stand out. **To resolve:** either
drop it, or make it a provenance check with content — e.g. assert that
`git show ${EXPECTED_SOURCE_COMMIT}:docs/_decisions/DECISIONS-wave-gates.md` hashes to the same
digest `EXPECTED_DIGESTS` carries for the fixture copy, which is the claim the title actually makes.

### F-05 (Low) — the bounds property has a vacuous escape hatch

`__tests__/decisionLedgerBounds.test.js:148-150` returns `true` for every case where the rendered
block is `""`. An implementation of `renderDecisionLedgerBlock` that returned `""` unconditionally
would satisfy the whole `fc.assert` over 200 runs. The example anchors below it (AT-13, `:190+`) do
cover non-empty rendering, so the risk is contained — but the property that is supposed to be the
deep oracle is the one carrying the escape. **To resolve:** add a conjunct on the empty branch —
when `nProject + nFeature > 0` and `thresholds.maxEntries >= 1` and `maxBytes` exceeds the framing
plus one modelled line, `block` must **not** be `""` (the model already computes the line bytes at
`modelFormatLine`, so this needs no renderer call).

### F-06 (Low) — the live arm's expected suffix is derived from the code under test

`__tests__/decisionLedgerMain.test.js:405-421` builds `expectedBlock` by calling
`gatherDecisionCorpus` → `selectDecisions` → `renderDecisionLedgerBlock` over a second copy of the
same corpus doubles, then asserts `prompt.endsWith(expectedBlock)`. As a *wiring* oracle this is
legitimate — it proves the served prompt carries whatever the real chain produces, and the header
argues the point explicitly. The residual is that the bytes themselves are not pinned on this path:
a chain-wide format regression is consistent with the assertion. It is mitigated (the render and
corpus modules pin the literal framing and index bytes, and `expectedBlock.length > 0` blocks the
vacuous case), so this is Low, not Medium. **To resolve, cheaply:** additionally assert the served
prompt contains the transcribed literal header line
`--- CLOSED DECISIONS (do not re-open without new evidence) ---` and the transcribed trailer, so the
live arm carries at least one spec-transcribed anchor of its own.

### F-07 (Low) — a `.DS_Store` binary was committed

`git ls-files docs/.DS_Store` resolves; it entered in `59063c421` on this branch (6,148 bytes). Per
this repo's own debugging note, stray files under the doc tree interact with the document oracles,
which walk everything under `root` except `.git/` and `node_modules/`. **To resolve:** untrack it
(index-only removal, keeping the local file) and add `.DS_Store` to `.gitignore`.

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-02: which locus do you want to be the tested one — `dispatchAndVerify` (my reading of §2.6, and what ships) or `reviewerPrompt` (what TSPEC §4.5 and PROP-WIRE-08 say)? I have routed the document half as errata; the code half is F-02. |
| Q-02 | The delta's branch coverage is not separately gated: `package.json`'s stage-2 `--per-file --branches 85` measures `orchestrate-dev.js` as one ~15k-line module, so this feature's ~530 new lines cannot fall below the floor visibly (only `check-wave-resume-delta-coverage.mjs` does a delta check, and it is scoped to that other feature). F-02's dead branch is direct evidence that uncovered new code passes the gate. Is a decision-ledger delta-coverage check in scope here, or is that a follow-up? |
| Q-03 | `selectDecisions` accepts and ignores `feature` (`orchestrate-dev.js:2693`) while every caller passes it, and it accepts entries keyed either `path` or `sourcePath` (`entryPathOf`, `:2689`). Both are documented, but a dual-keyed input shape is a place a caller typo silently degrades to `undefined`. Would you accept a guard test asserting an entry with neither key throws rather than yielding a `undefined`-pathed record? |


## Positive Observations

- **The live composition root is genuinely driven.** `decisionLedgerMain.test.js` runs the
  default-exported `main()` with no seam standing in for `gatherDecisionCorpus`, `selectDecisions`,
  `renderDecisionLedgerBlock` or the `wrapperSeams._injectDecisionLedger` assignment, and proves the
  seam is *reached* with a call-count spy on the `_git` listing call rather than with a fake of the
  outer interface (`:24-27`, `:377-387`). This is the DC-07 builder-not-wired oracle done properly —
  a fake of `_injectDecisionLedger` could not satisfy it.
- **The flag-off proof is a committed merge-base recording, not a subtraction.** `off.tPrompts`
  is compared to the four committed `REVIEW-LOOP-REVIEWER-PROMPTS/*.txt` (`:441`), so the byte-identity
  claim is anchored outside the code under test; the report-key delta is a **both-directions** set
  equality on symmetric difference (`:470-472`), and the flag-off notice set is set-equal to empty
  (`:449`), not merely free of `NTC-DECLEDGER-*`.
- **The prompt rule text is falsifiably pinned, semantically.** Mutation: `"High severity"` →
  `"Medium severity"` in `DECISION_LEDGER_RULE_TEXT` reddens 1 test; deleting the "key a repeat on
  the decision id" sentence reddens 1 test. The conjunct-per-obligation regex form
  (`decisionLedgerRender.test.js:180-220`) is the right choice for prose — it survives harmless
  rewording (`re-open` → `reopen` stays green) while catching every contentful change.
- **Cross-file precedence is guarded.** Mutation: deleting
  `for (const id of projectById.keys()) featureById.delete(id);` reddens the suite.
- **AT traceability is complete.** All eighteen FSPEC ATs are named in the test modules; the
  fixture guard pins FX-CORPUS by 25-path set equality plus hand-transcribed per-file digests, with
  an explicit instrument-fires control (`decisionLedgerFixtureGuard.test.js:242-254`).
- **AT-05 was made non-vacuous.** PROPERTIES flagged that PLAN's assignment of AT-05 to the
  `reviewLoop`-level recording could not distinguish the four not-enabled spellings; the shipped
  `decisionLedgerLoop.test.js:166-214` runs each spelling through the real
  `parseDecisionLedgerConfig` → `buildDecisionLedgerInjector` gate and compares against the
  no-seam baseline stream. That is the arm the property asked for.
- **`fast-check` is used where the input space is parameterisable** (bounds, `decisionLedgerBounds.test.js`),
  with an independent model formatter rather than the production renderer — PROP-BND-07's discipline
  observed.
- **Live-git-write guards are on every module** (`assertNoLiveGitWrites` in `afterEach`, over the
  calls actually made rather than a static empty array), which is the `f325016` lesson applied.


## Recommendation

**Needs revision**

One High finding (F-01) gates: a frozen catalogue TSPEC §5.2 and PROP-FAIL-09 both require to be the
operand of a set-equality test has no oracle at all, proven by mutation — deleting a member leaves
the decision-ledger suite green, and no production line reads the catalogue either. Fixing it is
small: a frozen + two-sided set-equality test in `decisionLedgerInjector.test.js` against
transcribed literals, plus tying the injector's emitted `corpusOutcome` values to the catalogue.

F-02 and F-03 are Medium and recorded, not gating, but both are cheap and both remove a
false-green class: delete (or wire) `reviewerPrompt`'s unreachable `ledgerBlock` parameter, and add
the flag-on creator/optimizer byte-identity assertion the harness already has the data for.

The rest of the implementation is in good shape — the live `main()` arm, the committed merge-base
baseline, the semantic rule-text conjuncts and the fixture digest guard are all falsifiable oracles
that fired under mutation.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 4}
