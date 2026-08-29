---
feature: pdlc-decision-ledger
---

# TSPEC — pdlc-decision-ledger

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → **TSPEC**` (`REQ-pdlc-decision-ledger.md` v1.7, `FSPEC-pdlc-decision-ledger.md` v1.1) |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Baseline | `docs/_constraints/pdlc-decision-corpus-baseline.md` **v1.1**, cited by `M-*` id, never restated |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-TSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-decision-ledger/LEARNINGS-pdlc-decision-ledger.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | se-author | 0.1 | 2026-08-28 |

## 1. Overview

This TSPEC designs the **decision ledger**: a config-gated block of already-closed decisions,
rendered into the review-loop reviewer dispatch prompt, plus adjacent rule text telling the
reviewer not to re-open an indexed decision without a High-severity finding citing evidence
outside that decision's own record (FSPEC §1, BR-1/BR-5).

### 1.1 Where it lands

Everything this feature adds lands in **one production file**, `pdlc/workflows/orchestrate-dev.js`,
which already exports `reviewerPrompt`'s caller `reviewLoop` and already carries the two shipped
precedents this design clones. That module is the only workflow source the engine vendors
(`scripts/capture-learnings-baseline.mjs`'s sibling constraint recorded as `DEC-LOOPECON-08`), and
REQ NG-6 forbids engine **runtime** edits under `pdlc/engine/`, so a new
`pdlc/workflows/lib/` module is not available to this feature either. The one file outside
`orchestrate-dev.js` is the config disclosure — `.claude/pdlc.config.example.json` plus its
engine-side disclosure test — which FSPEC Q-3 already decided is in scope and which REQ NG-6
explicitly preserves.

### 1.2 The two shipped precedents this design reuses, rather than reinvents

| Obligation | Shipped precedent, cited | How this feature reuses it |
|---|---|---|
| Per-key independent config fallback, fail-open | `parsePinCheckConfig` / `parseDerivativeStopConfig` in `pdlc/workflows/orchestrate-dev.js`, both structural clones of `parseLearningsConfig`, sharing the module-private `descendSection` two-level descent | `parseDecisionLedgerConfig` is a **one-level** descent, so it clones `parseLearningsConfig`'s shape directly (`degraded(sectionMalformed)` closure, `text == null` / `JSON.parse` failure / missing-block short-circuits, `boolField` / `nonNegativeInt` field validators) |
| A gated clause appended to the reviewer prompt, contributing **zero bytes** with the flag off | `reviewerPrompt`'s `findingGrammarPart` — `const findingGrammarPart = findingGrammar ? "\n" + findingGrammarClause() : ""` — threaded from `reviewLoop`'s `derivativeStopEnabled` | The index block and rule text are appended by the identical mechanism: one extra parameter on `reviewerPrompt`, empty string when off |
| An injector closure built once per run, called per dispatch, re-reading its corpus fresh each call, pushing a record onto a report sink | `buildLearningsInjector` / `gatherLearningsCorpus` / `renderLearningsBlock` in `orchestrate-dev.js`, wired at `main()` through `wrapperSeams._injectLearnings` | `buildDecisionLedgerInjector` / `gatherDecisionCorpus` / `renderDecisionLedgerBlock`, wired through `wrapperSeams._injectDecisionLedger` and threaded into `reviewLoop` |
| A committed byte-identity baseline captured from the merge base, guarded by hand-transcribed digests | `pdlc/workflows/__tests__/loopEconomicsBaselineGuard.test.js` with `__tests__/fixtures/loop-economics-baseline/{scenarios.mjs,MANIFEST.json}`, captured by `scripts/capture-learnings-baseline.mjs`'s `runCaptureScript` | The same harness and the same two-job guard shape, against a new fixture directory (§7.4, answering O-4) |
| Config-block disclosure in the example config with a matching engine-side test | `pdlc/engine/__tests__/learnings-config-example.test.js`, `loop-config-example.test.js`, `advisory-config-example.test.js` — one file per block, so an example edit cannot redden an unrelated engine concern | `pdlc/engine/__tests__/decision-ledger-config-example.test.js`, same shape (FSPEC Q-3) |

### 1.3 The single design risk, stated up front

The whole feature turns on one thing being right: the **recognition rule** (§3) must render exactly
the Baseline's measured extent — 41 project-level ids (`M-1a`, `M-1d`) and the per-directory
feature counts of `M-2e` — at the Baseline's `Verified at` commit, or AT-01 fails and
REQ-DECLEDGER-01 is not met. The rule is not a judgement call: §3 states it, and §3.4 records the
result of running it over the standing corpus, which reproduces `M-1d` and `M-2e` exactly.

Cost is small and bounded. There is no new dependency, no new file type, no new record shape, no
new operator-facing failure class, and no change to any round budget. With the flag off — the
shipped default — the module's behaviour is byte-identical, and §7.4 pins that against a committed
baseline rather than a same-branch comparison.

## 2. Architecture

### 2.1 Module dependency graph

All new symbols are added to `pdlc/workflows/orchestrate-dev.js`. Arrows are "calls".

```
main()
 ├─ readLearningsConfigSafely(readFileFn, LEARNINGS_CONFIG_PATH)   [SHIPPED, reused — one read]
 │    └─ parseDecisionLedgerConfig(text)                            [NEW, pure]
 ├─ buildDecisionLedgerInjector({config, sink, _git, _readFile, _log})  [NEW]
 │    └─ (returns) injectDecisionLedger({feature}) ──┐
 └─ wrapperSeams._injectDecisionLedger ──────────────┘
      └─ reviewLoop({..., _injectDecisionLedger})    [SHIPPED, one new param]
           └─ (per round, before reviewer dispatch)
                injectDecisionLedger({feature})
                 ├─ gatherDecisionCorpus({feature, _git, _readFile})  [NEW, IO]
                 ├─ selectDecisions({entries, feature, thresholds})   [NEW, pure]
                 │    └─ recogniseDecisionRecords(text, path)         [NEW, pure — §3]
                 └─ renderDecisionLedgerBlock({selected})             [NEW, pure]
           └─ reviewerPrompt(doc, phase, feature, iteration, reviewer,
                             docType, frozen, findingGrammar, ledgerBlock)  [SHIPPED + 1 param]
```

The shape is a deliberate clone of the shipped learnings-injection shell: a pure recogniser and a
pure selector wrapped in one IO gatherer, all three behind an injector closure built once per run
and called once per dispatch. Every impure operation is confined to `gatherDecisionCorpus`, which
takes `_git` and `_readFile` as injected seams exactly as `gatherLearningsCorpus` does — that is
what makes §7's oracles driver-free.

### 2.2 Config read: one read, three parsers, now four

`main()` already reads `.claude/pdlc.config.json` **once** into `learningsConfigText` via
`readLearningsConfigSafely`, then hands the same text to `parsePinCheckConfig` and
`parseDerivativeStopConfig` — the comment at that site states the intent explicitly ("threaded
through the SAME already-read `learningsConfigText`, never a second read of `MERGE_CONFIG_PATH`,
which is byte-identical to `LEARNINGS_CONFIG_PATH`"). `LEARNINGS_CONFIG_PATH` is defined as
`MERGE_CONFIG_PATH`, itself `".claude/pdlc.config.json"`.

`parseDecisionLedgerConfig(learningsConfigText)` is the fourth consumer of that same text. It adds
**no** read. Two run-level notices are pushed on the same run-level `notices` channel the shipped
blocks use, with ids following the established `NTC-{BLOCK}-{KIND}` convention:

| Notice id | Fires when |
|---|---|
| `NTC-DECLEDGER-MALFORMED` | the `decisionLedger` value is present but not a plain object |
| `NTC-DECLEDGER-KEYTYPE` | one or more keys are wrong-typed; each named in the detail, each falling back to its own default |

A **missing** block emits no notice — the common case, and the shipped `cascade.pinCheck` /
`review.derivativeStop` sites take the same care so that the disabled-state report stays
byte-identical.

### 2.3 The enablement read is destructured, not dotted

`main()` reads the flag as `const { enabled: decisionLedgerEnabled } = decisionLedgerConfig;`
rather than `decisionLedgerConfig.enabled`. This is not style. `advisoryDisabled.test.js`'s
PROP-DIS-06 pins the source-text count of dotted `enabled` member reads over
`orchestrate-dev.js` to the advisory config's three gates alone; the shipped `pinCheckEnabled`
read is destructured for exactly this reason and says so in a comment. A dotted read here would
redden a property this feature has no mandate over.

`buildDecisionLedgerInjector` returns `null` when the flag is not `true`. That is the gate
(FSPEC §3.2 step 1, BR-4): with the injector `null`, `wrapperSeams._injectDecisionLedger` is
`null`, `reviewLoop` passes `""` as the ninth `reviewerPrompt` argument, and the prompt is
constructed by the identical expression it is today.

**`=== true`, not truthiness.** Every fail-open shape — absent block, wrong-typed value,
unparseable file, malformed section — resolves `enabled` to the `false` default, and the read
site compares with `=== true`, so all four spellings of "not enabled" collapse to one outcome
(FSPEC E-1, AT-05).

### 2.4 Where the block is placed in the prompt

`reviewerPrompt` gains one parameter, `ledgerBlock` (a string, `""` when the feature contributes
nothing). It is rendered as `const ledgerPart = ledgerBlock ? "\n" + ledgerBlock : ""` and
appended **last**, after `oraclePart` and `findingGrammarPart`, on both the iteration-1 and the
iteration-≥2 return paths — the two paths `reviewerPrompt` already has. Appending last matches
the shipped `findingGrammarPart` placement and keeps the diff to two string concatenations.

The **rule text is part of the same block**, emitted by `renderDecisionLedgerBlock` immediately
after the index lines and inside the same header/trailer framing. This is what makes FSPEC BR-1
and E-6 structurally true rather than separately enforced: because there is exactly one string,
"no index ⇒ no rule text" cannot be violated by an ordering mistake — `renderDecisionLedgerBlock`
returns **exactly `""`** when `selected` is empty, the same total-emptiness contract
`renderLearningsBlock` carries.

### 2.5 Scope of "review dispatch": the review loop's reviewer prompt only

`orchestrate-dev.js` builds several reviewer-facing prompts. The index attaches to
`reviewerPrompt` — the review-loop reviewer dispatch — and to no other. The delta-confirmation
prompt and the finding-restatement prompt are explicitly **not** re-reviews (the confirmation
prompt says "Do not re-review the whole document"; the restatement prompt says "Do NOT re-review
anything. Do NOT change your verdict, and do not raise anything new"), so an index inviting the
reader not to re-open closed decisions has nothing to act on there, and adding bytes to those
prompts would enlarge the byte-identity surface for no behavioural gain. This is a real
alternative, weighed and rejected; it is recorded for DECISIONS (§9, D-2).

### 2.6 Freshness

`injectDecisionLedger` re-gathers the corpus on **every call**; nothing is memoised across calls,
and the injector holds no corpus state between dispatches. This is BR-9 / REQ-DECLEDGER-01's
recompute-at-dispatch contract, and it is the same construction `buildLearningsInjector` uses
(its closure holds only `previousObservation`, used for reporting, never for reuse of material).
The injector is called once per round inside `reviewLoop`, immediately before the two reviewer
prompts are built, so both reviewers of a round see the same index and successive rounds each
re-derive it.

## 3. The Recognition Rule (O-1)

*(pending)*

## 4. Interfaces

*(pending)*

## 5. Data Model

*(pending)*

## 6. Error Handling and Degradation

*(pending)*

## 7. Test Strategy

*(pending)*

## 8. Traceability

*(pending)*

## 9. Open Questions

*(pending)*
