# Cross-Review: product-manager — Final Codebase Review (Phase CR)

**Reviewer:** product-manager
**Document reviewed:** the feature diff `main...feat-pdlc-decision-ledger` (implementation), read against `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` and `FSPEC-pdlc-decision-ledger.md`
**Date:** 2026-08-31
**Iteration:** 1

## Scope

Product lens on the shipped implementation of `pdlc-decision-ledger`, verified against the
repository at `HEAD` of `feat-pdlc-decision-ledger`, not against the specs alone. What I ran:

- `git diff --stat main...HEAD` — 56 files, 14,953 insertions; production change is confined to
  `pdlc/workflows/orchestrate-dev.js` (+530) and its generated twin `pdlc/workflows/dist/pdlc-cli.mjs`,
  plus config/doc surfaces (`.claude/pdlc.config.example.json`, `pdlc/OPERATIONS.md`,
  `pdlc/README.md`, `CLAUDE.md`, `pdlc/.claude-plugin/plugin.json` 0.23.6 → 0.23.7).
- `cd pdlc/workflows && npm test -- __tests__/decisionLedger` — **12 suites, 231 tests, all green.**
- `node pdlc/workflows/build-runtime.mjs --check` — `in-sync  pdlc/workflows/dist/pdlc-cli.mjs`
  (no bundle drift; the dist twin carries the same wiring at `pdlc-cli.mjs:9666`, `:9978`, `:15693`).
- Two behavioural probes against the shipped module, reported under F-01 and F-02.

**AC → production caller → served artifact.** REQ-DECLEDGER-01/-03/-06's operator-visible artifact
is the reviewer dispatch prompt. The production assembler is `main()`
(`pdlc/workflows/orchestrate-dev.js:15672-15688`), which builds the injector only when
`decisionLedger.enabled` resolves `true` and installs it as `wrapperSeams._injectDecisionLedger`
(`:15684`); `reviewLoop` reads it once per round immediately before the two `reviewerPrompt` calls
(`:9968-9969`) and threads the block through `runWrapped` so it lands *after* `dispatchAndVerify`'s
own suffix (`:9995`, `:10007`). The test that drives **that** caller — not an isolated builder — is
`pdlc/workflows/__tests__/decisionLedgerMain.test.js`, which imports the default export `mainDev`
and asserts (a) a call-count on the scripted `_git` double proving `gatherDecisionCorpus`'s
`ls-files` fires on the served flow (`decisionLedgerMain.test.js:17-23`), and (b) the prompt actually
handed to a reviewer ends with the bytes `renderDecisionLedgerBlock` produces. That satisfies the
builder-not-wired sweep (DC-07): no seam stands in for the four new production functions, and no
new seam is left with zero production callers.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | An over-`maxBytes` line that is **not last** in the selection order takes every line after it down with it — the shipped drop loop can render `""` where the criterion requires the remaining lines to render. The AT-15 test pins only the tail-position arrangement, so the defect is green | REQ-DECLEDGER-07; FSPEC E-8, BR-13; AT-15 |
| F-02 | Medium | Local | `DECISION_LEDGER_CORPUS_OUTCOMES` is an unenumerated, production-unread catalogue: deleting `RSN-EMPTY` from it leaves all 231 decision-ledger tests green, and no production line reads it | REQ-DECLEDGER-04; FSPEC F-6/F-7; brief's set-equality bar |
| F-03 | Medium | Local | The flag-off notice conjunct in `decisionLedgerMain.test.js` is vacuous (`String(n)` over an object-shaped notice is always `"[object Object]"`), and no test drives a malformed `decisionLedger` section through `main()` to assert the notice **does** fire — an absence-only oracle with no positive pair | REQ-DECLEDGER-05; REQ-DECLEDGER-02 |
| F-04 | Low | Process | FSPEC BR-9 promises the index runs "once per review dispatch" and is never "reused across dispatches"; the shipped read is once per **round**, shared by the round's two reviewer dispatches. The behaviour is the approved TSPEC §4.5 design — the FSPEC wording is what has drifted | REQ-DECLEDGER-01; FSPEC BR-9 vs TSPEC §4.5 |

### F-01 (High) — over-budget omission aborts the rest when the oversized line is not last

**What the REQ requires.** REQ-DECLEDGER-07 (`REQ-pdlc-decision-ledger.md:299-311`) enumerates one
stated outcome per boundary case, including "*a single line alone exceeding `maxBytes`, omitted
whole, never truncated mid-line, without aborting the rest*". FSPEC E-8
(`FSPEC-pdlc-decision-ledger.md:343`) is the same contract, sharper: "*That line is omitted whole …
and its omission does not abort the rest: the remaining lines render if they fit (BR-13)*". AT-15
(`FSPEC:493-496`) closes with "*and the remaining lines render*".

**What ships.** `selectDecisions` (`pdlc/workflows/orchestrate-dev.js:2693-2739`) drops candidates
**only from the tail** of `[...projectRecords, ...featureRecords]` (`:2727-2737`), one line per
iteration, re-rendering after each drop. When the oversized record sits anywhere but last, the loop
must chew through every line behind it before it can reach the offender — and each of those drops is
permanent. Probe against the shipped module (three project-level records, the 500-byte one **first**,
`maxBytes` one byte below that line's own length, `maxEntries` 100):

```
selected: []
omitted:  [{"id":"DEC-P-2","reason":"RSN-BYTES"},{"id":"DEC-P-1","reason":"RSN-BYTES"},
           {"id":"DEC-P-0","reason":"RSN-BYTES"}]
block:    ""
```

Both short lines fit comfortably and both are dropped. The reviewer receives no index at all — and
per REQ-DECLEDGER-04's own reasoning ("*a decision absent from the index is one a reviewer may
freely challenge*"), the product loss is real: every closed decision in the corpus silently becomes
re-litigable because one long record was ordered ahead of them.

**Why the suite is green.** `decisionLedgerBounds.test.js:243-269` (AT-15) builds its case as
`nProject: 2, nFeature: 1` with the oversized statement assigned to the **feature-level** record —
i.e. the last element of the concatenation, the one arrangement in which tail-dropping and E-8
coincide. The second block (`:270-284`) covers the only-line case (E-6). No case places the
oversized line ahead of a line that fits, so the criterion's operative half — "the remaining lines
render" — is asserted only where it cannot fail.

**What to change.** Make the drop loop skip past a line whose own rendered length cannot fit, rather
than dropping the tail on its behalf: identify over-budget-by-itself lines and omit those directly
(reason `RSN-BYTES`), then continue the ordinary tail drop over the remainder. Then extend
`decisionLedgerBounds.test.js`'s AT-15 block with a head-position arrangement (oversized record
project-level, short records behind it) asserting the short lines are present in the rendered block.

**Upstream note (not folded into this verdict).** TSPEC §3.6's tail-drop order and PROPERTIES
`PROP-BND-04`'s prefix conjunct ("*the rendered set must be a prefix of the unbounded set*",
`PROPERTIES-pdlc-decision-ledger.md:265`) cannot both hold with FSPEC E-8 in the head-oversize case:
omitting the head line while its successors render produces a survivor set that is not a prefix.
The two specs need reconciling before the fix can land cleanly; raised as `ERRATUM: TSPEC` and
`ERRATUM: PROPERTIES` in my dispatch message, not as findings against this code.

### F-02 (Medium) — `DECISION_LEDGER_CORPUS_OUTCOMES` is unenumerated and unread in production

`DECISION_LEDGER_CORPUS_OUTCOMES` (`orchestrate-dev.js:2750-2753`) is declared frozen and documented
as "*the two enumeration-failure `corpusOutcome` values*" backing FSPEC F-6/F-7 — the fail-open
classification REQ-DECLEDGER-04 depends on. Two problems, both mechanical:

1. **No production caller.** `buildDecisionLedgerInjector` sets `corpusOutcome` from the string
   literals `"RSN-UNLISTABLE"` and `"RSN-EMPTY"` directly (`:2837`, `:2839`), never through the
   catalogue. Grep over `orchestrate-dev.js` finds exactly one occurrence of the identifier — its own
   declaration. It is imported by no test either (only named as a token in
   `decisionLedgerCensus.test.js:106,153`, which asserts source text, not behaviour).
2. **A deleted case does not fail.** Probe: removing the line `EMPTY: "RSN-EMPTY",` from the
   catalogue and re-running `npm test -- __tests__/decisionLedger` gives **12 suites / 231 tests
   passed**. (Source restored immediately; `git status` clean, `build-runtime.mjs --check` back to
   `in-sync`.) The brief's bar — enumerated contracts need set-equality so a deleted case fails —
   is not met for this catalogue, and it is met for its two siblings: `DECISION_LEDGER_NOTICES`
   (`decisionLedgerConfig.test.js:57-62`) and `DECISION_LEDGER_OMIT_REASONS` (`:395-399`).

The precedent feature does both halves and is worth copying verbatim:
`learningsRecord.test.js:195-202` set-equals `LEARNINGS_CORPUS_OUTCOMES` against a hand-transcribed
`["RSN-EMPTY","RSN-UNLISTABLE"]`, and `learningsArmInventory.test.js:276-278` set-equals the
**observed** non-null `corpusOutcome` values from live arms against the catalogue.

**What to change.** Add the two assertions on the decision-ledger side: a hand-transcribed
set-equality over `DECISION_LEDGER_CORPUS_OUTCOMES`, and an observed-values set-equality collecting
`corpusOutcome` from `decisionLedgerInjector.test.js`'s existing `RSN-UNLISTABLE` / `RSN-EMPTY` /
`null` arms (`decisionLedgerInjector.test.js:191-211, 310`). Alternatively, have the injector read the
catalogue members instead of re-typing the literals, which retires the dead-constant half outright.

### F-03 (Medium) — the flag-off notice conjunct cannot fail, and has no positive pair

`decisionLedgerMain.test.js:431-448` carries the flag-off arm's conjunct (c), described in the file
header as "*the emitted `NTC-DECLEDGER-*` notice set on the flag-off run is SET-EQUAL to empty, not
merely 'contains no `NTC-DECLEDGER-*`' (TE F-05)*" (`:37-38`). The assertion filters with
`String(n).includes("NTC-DECLEDGER-")` (`:447`). The decision-ledger notices are pushed as **objects**
— `{ id: "NTC-DECLEDGER-MALFORMED", detail: … }` and `{ id: "NTC-DECLEDGER-KEYTYPE", detail: … }`
(`orchestrate-dev.js:15561-15576`) — and `String({…})` is `"[object Object]"`. The predicate therefore
matches nothing regardless of what the run emitted: a flag-off run that *did* wrongly emit
`NTC-DECLEDGER-MALFORMED` would still pass. The conjunct the TE finding asked for is the one that is
missing.

Compounding it, the pairing the brief demands is absent in the other direction too: no test drives a
malformed or wrong-typed `decisionLedger` section through `main()` and asserts the notice **does**
appear on the run report. `parseDecisionLedgerConfig`'s unit tests prove `sectionMalformed` /
`invalidKeys` are computed correctly (`decisionLedgerConfig.test.js`), but the parser →
`notices.push` wiring at `orchestrate-dev.js:15561-15576` — the operator-visible half of
REQ-DECLEDGER-05's fail-open story — has no production-path test.

**What to change.** (a) Filter on the notice's `id` (`(n) => String(n?.id ?? n).includes("NTC-DECLEDGER-")`)
so conjunct (c) can fail; (b) add a `main()`-driven case with a malformed `decisionLedger` section
asserting the emitted notice-id set is set-equal to `{NTC-DECLEDGER-MALFORMED}` and that the run
still completes on defaults — the positive assertion that pairs with the flag-off empty set.

### F-04 (Low) — FSPEC BR-9's "once per review dispatch" no longer describes what ships

FSPEC BR-9 (`FSPEC-pdlc-decision-ledger.md:242-244`) states the index is derived "*at
dispatch-construction time … once per review dispatch*", with "*no index reused across dispatches*",
and REQ-DECLEDGER-01 (`REQ:224-226`) forbids "*a snapshot carried forward within the round window*".
The shipped read is once per **round**: `const ledgerBlock = … await _injectDecisionLedger({ feature })`
at `orchestrate-dev.js:9968-9969`, deliberately hoisted above both `reviewerPrompt` calls so the two
reviewers of a round receive byte-identical bytes — exactly as TSPEC §4.5 specifies
(`TSPEC-pdlc-decision-ledger.md:515-516`, `:1020-1021`), and as approved.

I read the shipped behaviour as correct and the FSPEC sentence as over-broad: the round's two
dispatches are constructed in the same instant and issued in one `_parallel` call
(`orchestrate-dev.js:9994-10010`), so nothing is carried forward. But a future reviewer reading BR-9
literally will score the shipped code non-conforming, which is what makes this worth a line. Routed
upstream as `ERRATUM: FSPEC` rather than a code change; no implementation edit is requested.

## Questions

| ID | Question |
|----|---------|
| Q-01 | REQ-DECLEDGER-07's boundary enumeration is silent on **which** line is the oversized one. Was the head-position case (F-01) considered and consciously traded away for TSPEC §3.6's prefix property, or is the prefix property an artefact of drafting the drop loop tail-first? The answer decides whether F-01's fix is in the code or in FSPEC E-8. |
| Q-02 | `gatherDecisionCorpus` resolves the feature directory by **first hit** across `docs/{feature}/` → `docs/completed/{feature}/` → `docs/discarded/{feature}/` (`orchestrate-dev.js:2782-2789`). For a feature mid-move — records in both `docs/{feature}/` and `docs/completed/{feature}/` — only the first contributes, and the rest are silently out of scope. Is that the product intent, or should the union render? G-1 says "those of the feature whose document is under review" without ruling either way. |
| Q-03 | With the flag on and a corpus at today's size, does the operator have any way to see *which* decisions were omitted for budget? `omitted[]` rides the dispatch record (`:2857`) but no run-report surface names it; an operator wondering why a decision was re-litigated has nothing to read. Deliberate for v1? |

## Positive Observations

- **The wiring is genuinely wired, and proven at the composition root.** `decisionLedgerMain.test.js`
  drives `mainDev` end to end with no seam standing in for `gatherDecisionCorpus`,
  `selectDecisions`, `renderDecisionLedgerBlock` or the `wrapperSeams._injectDecisionLedger`
  assignment, and pins the seam's traversal with a **call-count on the inner `_git` double** rather
  than a fake of the outer interface (`:17-23`). That is exactly the DC-07 shape the builder-not-wired
  sweep asks for, applied without being asked twice.
- **REQ-DECLEDGER-02's byte-identity is anchored to a committed recording, not a computed string.**
  `pdlc/workflows/__tests__/fixtures/decision-ledger-baseline/` holds four reviewer-prompt streams
  with SHA-256 digests and `mergeBaseSha: 72b3c0579…` — which is the actual merge-base of this branch
  (verified with `git merge-base main HEAD`). The flag-off prompt is compared against those bytes, not
  against "flag-on minus the block", closing the implementation-echo hole the TE round flagged.
- **REQ-DECLEDGER-03's exemplars are transcribed, not paraphrased.** `DECISION_LEDGER_RULE_TEXT`
  (`orchestrate-dev.js:2605-2612`) carries both boundary exemplars the criterion names — in: "*a
  behavior that changed after the decision was recorded, cited at the changed source*"; out: "*a
  source the decision already cites, re-cited at a different line or later commit with no behavioral
  change*" — plus REQ-DECLEDGER-06's id-as-repeat-key sentence, in one frozen constant inside the
  ≤1,200-byte budget.
- **REQ-DECLEDGER-08 is asserted, not assumed.** `decisionLedgerLoop.test.js:326-400` replays one
  fixed reviewer-output fixture under both flag settings and compares convergence, the
  identity-triple ledger, derivative-stop classification and erratum minting — with an anchor
  conjunct (`:367`) so a driver broken identically in both arms still fails. Invariance-only would
  have passed vacuously; this does not.
- **REQ-DECLEDGER-05's key set is enumerated end to end.** `.claude/pdlc.config.example.json` gains
  exactly `{"decisionLedger":{"enabled":false,"maxEntries":70,"maxBytes":12500}}`, matching
  `DECISION_LEDGER_DEFAULTS` (`:2468-2472`), and `decisionLedgerConfig.test.js:409-414` set-equals the
  documented key list against the defaults' keys — so a fourth key cannot ship undocumented.
- **Documentation lands where the operator will look, without duplication.** `pdlc/OPERATIONS.md`
  gains the catalogue section; `pdlc/README.md` and `CLAUDE.md` name the flag and defer to it, and a
  test forbids either file restating the tokens (`decisionLedgerConfig.test.js:416-430`) — a genuinely
  good answer to the docs-drift trap this repo keeps hitting.
- **Default-off is honoured at every layer.** `enabled` defaults `false` (`:2469`), the injector is
  `null` unless `config.enabled === true` (`:2820`), and `report.decisionLedger` rides only when the
  injector exists (`:15688`) — so an operator who does nothing sees nothing change.

## Positive Observations

## Recommendation

## Verdict
