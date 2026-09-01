# Cross-Review: product-manager — Final Codebase Review (Phase CR)

**Reviewer:** product-manager
**Document reviewed:** the feature diff `main...feat-pdlc-decision-ledger` (implementation), read against `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` and `FSPEC-pdlc-decision-ledger.md`
**Date:** 2026-08-31
**Iteration:** 2

## Scope

Delta re-review of the revision that answers my v1 findings (`CROSS-REVIEW-product-manager-REVIEW-v1.md`).
Scope of attention is the delta `93a6d0ea9..HEAD` — five commits, `d51df091c` (F-01),
`a73021d03` (F-02), `c3bc9cc3b` (F-03 / TE F-03), `fa83831a3` (TE F-02), `c3c247e69` (TE F-04/F-07)
— plus a regression sweep over what those commits could have broken. Unchanged sections I approved
in v1 were not re-litigated.

What I ran, against the working tree at `HEAD` of `feat-pdlc-decision-ledger`:

- `git diff --stat 93a6d0ea9..HEAD` — 9 files, 545 insertions: production change confined to
  `pdlc/workflows/orchestrate-dev.js` (+40/-20) and its generated twin `pdlc/workflows/dist/pdlc-cli.mjs`;
  the rest is tests, the TE cross-review file, `.gitignore` and the untracked `docs/.DS_Store` removal.
- `npm test -- __tests__/decisionLedger` — **12 suites, 236 tests, all green** (was 231 in v1; +5).
- `npm test` (whole workflows suite) — **166 suites, 5,258 passed, 70 skipped** on three of four runs;
  one run flaked (see F-02 below).
- `node pdlc/workflows/build-runtime.mjs --check` — `in-sync  pdlc/workflows/dist/pdlc-cli.mjs`; the
  dist twin carries the F-01 fix verbatim (`pdlc-cli.mjs:2734-2753`), so the operator-facing artifact
  is the fixed one, not just the source module.
- Two behavioural probes against the shipped module, reported under the F-01 disposition below.

**AC → production caller → served artifact, re-verified after the signature change.** `fa83831a3`
removed `reviewerPrompt`'s `ledgerBlock` parameter, which is the one change in this delta that could
have severed the block from the operator-visible artifact. It has not: `reviewLoop` still reads the
injector once per round (`orchestrate-dev.js:9991`) and threads the block as `runWrapped`'s trailing
argument on exactly the two reviewer dispatches (`:10024`, `:10032`) — grep for `ledgerBlock` over
the module returns those two call sites and no others — and `dispatchAndVerify` appends it last in
the delivered prompt, after the pacing-contract/opener suffix and the learnings block
(`:11610`). The test that drives that caller remains `decisionLedgerMain.test.js`, now with a
routing conjunct proving the creator and optimizer dispatches are byte-identical across the flag-off
and flag-on arms while the reviewer prompts differ (`decisionLedgerMain.test.js:494-526`).

## Prior findings — disposition

| v1 ID | Severity | Status | Evidence |
|-------|----------|--------|----------|
| F-01 | High | **Resolved** | `orchestrate-dev.js:2734-2753` + `decisionLedgerBounds.test.js:303-327`; probe below |
| F-02 | Medium | **Resolved** | `orchestrate-dev.js:2857-2860`, `decisionLedgerInjector.test.js:466-514` |
| F-03 | Medium | **Resolved** | `decisionLedgerMain.test.js:450-462` (id-filter) and `:528-548` (positive pair) |
| F-04 | Low (Process) | **Open upstream, not a code defect** | Routed again as `ERRATUM: FSPEC`; see the upstream-items section |

### F-01 (High) — resolved: over-budget omission is now line-local

The fix adds a pre-pass ahead of §3.6's tail drop: when the full block is already over `maxBytes`,
every record whose own rendered block exceeds `maxBytes` is omitted directly with reason
`RSN-BYTES`, wherever it sits in the order, and the tail drop then runs over the survivors
(`orchestrate-dev.js:2734-2753`). The guard `if (Buffer.byteLength(renderDecisionLedgerBlock({selected: fullOrder})) > thresholds.maxBytes)`
(`:2735-2736`) keeps a corpus that fits untouched, so the flag-on behaviour for the ordinary case is
unchanged.

I re-ran my v1 probe against the shipped module — three project-level records, the 500-character one
**first**, `maxBytes` one byte below that line's own rendered block:

```
head-position: selected: [DEC-P-1, DEC-P-2]  omitted: [{"id":"DEC-P-0","reason":"RSN-BYTES"}]  bytes: 1222
tail-position: selected: [DEC-P-1, DEC-P-2]  omitted: [{"id":"DEC-P-0","reason":"RSN-BYTES"}]  bytes: 821
```

v1's `selected: []`, `block: ""` is gone: the two short lines now render whichever position the
oversized record occupies, which is exactly FSPEC E-8's "*its omission does not abort the rest: the
remaining lines render if they fit*" (`FSPEC-pdlc-decision-ledger.md:343`) and REQ-DECLEDGER-07's
boundary outcome. The product loss I named — every closed decision silently becoming re-litigable
because one long record was ordered ahead of them — cannot occur.

The regression risk I would have flagged is that the tail-position case stops being asserted; it does
not. `decisionLedgerBounds.test.js` keeps the tail arrangement (`:274-302`, now asserting the
survivors set-equal the short records rather than merely "does not contain" the oversized id) and
adds the head arrangement (`:303-327`) with an explicit non-vacuity conjunct that the oversized
record really is `fullOrder[0]` (`:312`) and a set-equality on `omitted` (`:326`). The E-6 only-line
case is untouched. PROP-BND-04's property was restated rather than deleted
(`decisionLedgerBounds.test.js:174-204`): survivors must be strictly order-preserving in `fullOrder`,
and a record dropped from *ahead* of a survivor must be one whose own line could not fit — a front
drop of a line that would have fit still reds.

### F-02 (Medium) — resolved: the catalogue is now read in production and pinned two-sidedly

`buildDecisionLedgerInjector` now assigns `DECISION_LEDGER_CORPUS_OUTCOMES.UNLISTABLE` /
`.EMPTY` instead of re-typed string literals (`orchestrate-dev.js:2857-2860`), so the constant has a
production caller. `decisionLedgerInjector.test.js:466-514` adds both directions: a hand-transcribed
`["RSN-EMPTY","RSN-UNLISTABLE"]` set-equality over the declared members (`:470-476`), and an
observed-values set-equality collecting `corpusOutcome` from the live F-6 / F-7 / F-10 injector arms
(`:478-513`), with the F-10 arm pinned `null` so it contributes nothing. Deleting a member now reds
in both directions — the set-equality bar the brief asks for, and the shape the sibling feature's
`LEARNINGS_CORPUS_OUTCOMES` already carried.

### F-03 (Medium) — resolved: the conjunct can fail, and it has a positive pair

The flag-off notice conjunct filters on the notice's `id`
(`(n) => String(n?.id ?? n)`, `decisionLedgerMain.test.js:457-462`), so an object-shaped
`NTC-DECLEDGER-*` on a flag-off run is now visible to it. The positive pair exists: a new
`main()`-driven case feeds `{"decisionLedger": "enabled, please"}` (`:186-188`) and asserts the
emitted decision-ledger notice-id set is **set-equal** to `{NTC-DECLEDGER-MALFORMED}` (`:541`),
that the run still reports `success` (`:532`), that `report.decisionLedger` is absent (`:545`) and
that the reviewer prompts equal the committed flag-off baseline (`:547`). That is the
parser → `notices.push` wiring (`orchestrate-dev.js:15581-15597`) driven through the composition
root, which is the operator-visible half of REQ-DECLEDGER-05's fail-open story.

## Findings

Two new findings, both Low, neither gating. No new High or Medium finding arises from the delta, and
no prior High finding remains open.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | Both AT-15 arrangements now set `maxBytes` to the bare literal `2000` rather than deriving it from the framing budget + the two short lines, so the budget's relation to what the test proves is no longer stated anywhere in the file | REQ-DECLEDGER-07; FSPEC E-8, AT-15 |
| F-02 | Low | Process | One full-suite run in four went red (21 tests, 7 suites, including `decisionLedgerLoop.test.js:404`); three consecutive re-runs of the same tree were green, so the delta is green but the suite is load-flaky and a CI red will be ambiguous to read | REQ-DECLEDGER-08; brief's "verify against actual repository state" |

### F-01 (Low, Local) — AT-15's budget is a magic literal, not a derived one

v1's AT-15 derived its budget from the oversized line itself
(`maxBytes: Buffer.byteLength(oversizedLine) - 1`). The revision replaces that with
`const thresholds = { maxEntries: 100, maxBytes: 2000 };` in both the tail arrangement
(`decisionLedgerBounds.test.js:289`) and the new head arrangement (`:315`), with the oversized
statement grown to 5,000 characters. The test is correct today and the accompanying comment
(`:285-288`) explains the intent — the budget must clear framing plus both short lines — but `2000`
itself encodes an assumption about `DECISION_LEDGER_PREAMBLE` + `DECISION_LEDGER_RULE_TEXT` +
sentinel framing (~1.2 KB at HEAD, per my probe's `bytes: 1222`) that nothing in the file states.
An author who later grows the frozen rule text toward its ≤1,200-byte budget gets a red with no
pointer to why. This fails loudly rather than silently, which is why it is Low and not Medium.

**What to change.** Derive the budget the way the model already knows how:
`framing + shortLineBytes(a) + shortLineBytes(b) + 1` computed from `modelFormatLine` and the
observed empty-vs-one-line framing delta, or at minimum add a conjunct asserting
`2000 > framing + both short lines` so the literal's precondition is itself checked.

### F-02 (Low, Process) — the workflows suite is load-flaky, which makes a CI red ambiguous

Four full `npm test` runs on this tree: run 1 red — `Test Suites: 7 failed, 159 passed`,
`Tests: 21 failed, 70 skipped, 5237 passed`, with a trace at `decisionLedgerLoop.test.js:404` (the
AT-16 replay-invariance block) and an `AT-4.1` failure in `consumerCleanup.test.js`; runs 2, 3 and 4
green at `166 passed / 5,258 passed / 70 skipped`, tree clean, `build-runtime.mjs --check` in-sync
throughout. `decisionLedgerLoop` alone was re-run three times and is green each time. The
`consumerCleanup` `AT-4.1` leg is a known dist-race flake in this repo; a decision-ledger suite
joining the flaky set is new information and worth recording before merge, because an operator
reading a red PR check cannot currently tell a real regression from this.

This is filed `Process`, not `Local`: nothing in the delta is demonstrably wrong, and I could not
reproduce the failure in isolation. The product cost is diagnostic, not behavioural — but
REQ-DECLEDGER-08's whole claim is that the driver behaves identically under both flag settings, and
that claim is asserted by exactly the suite that flaked.

## Carried-forward upstream items (routed as errata, not findings)

## Questions

## Positive Observations

## Recommendation
