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

## Questions

## Positive Observations

## Recommendation

## Verdict
