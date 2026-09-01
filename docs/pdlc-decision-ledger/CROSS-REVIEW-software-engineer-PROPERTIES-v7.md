# Cross-Review: software-engineer — PROPERTIES (delta confirmation, targeted correction round)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/PROPERTIES-pdlc-decision-ledger.md` (v1.3, 2026-09-01)
**Date:** 2026-09-01
**Iteration:** 7 (delta confirmation of the v1.2 → v1.3 targeted correction)
**Scope:** Local

## Overview

Round 6 approved PROPERTIES with zero open High findings. This round asks one question only:
does the v1.2 → v1.3 edit stay inside its claimed envelope, and does it break anything that was
already approved? I read the delta, my own v6 review, the shipped threading in
`pdlc/workflows/orchestrate-dev.js`, and the oracle in
`pdlc/workflows/__tests__/decisionLedgerLoop.test.js`. **Answer: envelope held, nothing approved
broken, no High raised.**

### Envelope

`git show --stat 173142da4` is one file, `16 insertions(+), 2 deletions(-)`, and the diff carries
exactly three loci: the header Version/Date cell (`1.2 / 2026-08-29` → `1.3 / 2026-09-01`), a new
`**v1.3 — DoD erratum absorption, F-8**` changelog paragraph, and the `PROP-WIRE-08` table row.
No property added, removed or renumbered; no count, fixture body, corpus digest or acceptance
criterion moved. The claimed envelope is the actual envelope.

### The re-worded mechanism is the shipped one

Every clause of the new row checks out against HEAD, read-only:

- **`reviewerPrompt` takes no ledger argument.** Its signature is eight parameters (`doc, phase,
  feature, iteration, reviewer, reviewFileType, frozen, derivativeStopEnabled`); the in-file
  comment at `orchestrate-dev.js:11919`–`:11923` records that a ninth `ledgerBlock` parameter was
  unreachable — no call site ever passed it — and was removed, pointing at TSPEC §2.4/§4.5 (v1.4)
  and PROP-WIRE-08 for the shipped threading. The row's parenthetical (the builder's return is only
  the wrapper's `basePrompt`, so anything folded there would sit *before* the suffix) is a correct
  reading of that call chain.
- **The block is `dispatchAndVerify`'s trailing option.** It is destructured last in the options
  object (`:11485`, `ledgerBlock = ""`), documented there as an already-rendered trailing suffix
  defaulting to byte-unchanged.
- **Concatenation order matches the row's prose word for word.** `:11616`:
  `` const prompt = `${basePrompt}\n\n${PACING_CONTRACT_CLAUSE}\n\n${opener}${learningsBlock}${ledgerBlock}`; ``
  — pacing-contract clause, per-iteration opener, learnings block, then the ledger block, dead last.
- **Threading through `reviewLoop`.** `wrapped` (`:9759`) takes `ledgerBlock = ""` and forwards it
  into `dispatchAndVerify` (`:9777`); `runWrapped` (`:9785`) mirrors the parameter and hands it on
  (`:9788`). The round's block is computed once per iteration from `_injectDecisionLedger`
  (`:9995`) and passed to both reviewer dispatches (`:10030`, `:10038`).
- **The dead anchors are genuinely dead.** `:11483`/`:11506` no longer name `reviewerPrompt` return
  paths; naming `dispatchAndVerify` / `reviewLoop` / `wrapped` / `runWrapped` instead is the
  DEC-DOC-01-preferred content anchor and cannot drift the way the retired line numbers did.
- **Upstream naming is real.** `TSPEC-pdlc-decision-ledger.md` is at v1.4 (2026-09-01), and its
  changelog explicitly records the "ninth `reviewerPrompt` parameter that no longer exists" repair
  across §1.2, §2.1, §2.4, §2.5, §4.4, §4.5; §2.4 ("Where the block is placed in the prompt") and
  §4.5 ("Loop and prompt seams") both exist at the cited headings. The absorption cites live text.

### The oracle still exists and still discharges the property

`decisionLedgerLoop.test.js`'s `T-18` describe block asserts on the **delivered** prompt, which is
precisely the falsifier the row preserves: `round1a.endsWith(LEDGER_MARKER)` and
`round1b.endsWith(...)` for iteration 1 (both reviewers, plus a byte-identity check that the two
suffixes are the same bytes), and the same `endsWith` pair for iteration ≥ 2 with a
`toContain("iteration 2.")` guard that the pair really is the delta round. A third test pins that
the block lands *after* the oracle-quality/erratum-protocol clause rather than spliced before it.
Because these assert on the served prompt and never on `reviewerPrompt`'s return value, the
mechanism re-wording changes nothing about what they falsify — the row is right that they need no
change. Substance and falsifier are preserved.

### Nothing approved was disturbed

`PROP-WIRE-05`, `-06`, `-07`, `-09`, `-10`, `-11` and the surrounding table rows are byte-identical
in the diff. The v6 findings (F-01 manifest homing, F-02 stale `PLAN` v0.7 references, F-03 upstream
pin labels, F-04 anchor width) are all untouched, which is consistent with the changelog's explicit
statement that this is a §2.4/§4.5-only absorption and the Upstream cell's `TSPEC` v1.0 pin and the
§Gaps routed items are deliberately left as they stand. Those remain open at their prior
severities; this round does not re-litigate them and does not re-raise them as new.

One residue the correction exposes upstream, raised as a non-gating Low below: `PLAN` T-10 (and the
comment block quoting it in `decisionLedgerLoop.test.js`) still describes the mechanism in the
retired vocabulary — "appended last, after `oraclePart` and `findingGrammarPart`, on both the
iteration-1 and iteration-≥2 return paths of `reviewerPrompt`". PROPERTIES v1.3 is now the accurate
one of the pair. It is a doc-side inconsistency in an upstream document, not a defect in this delta,
and the test it annotates is green and correct.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | inherited | nonlocal | `PLAN` T-10 still specifies PROP-WIRE-08's mechanism in the retired vocabulary ("after `oraclePart` and `findingGrammarPart`, on both the iteration-1 and iteration-≥2 return paths of `reviewerPrompt`"), which `TSPEC` v1.4 and now `PROPERTIES` v1.3 have superseded; the same sentence is quoted verbatim in the `T-18` describe-block comment in `decisionLedgerLoop.test.js`. The tests themselves are correct and green — only the prose is stale. Fix belongs in `PLAN`, not here. | `PLAN-pdlc-decision-ledger.md` T-10 row; `decisionLedgerLoop.test.js` T-18 describe comment |

FINDING: Low | inherited | nonlocal | PLAN T-10 row and the T-18 describe comment in decisionLedgerLoop.test.js | `PLAN` T-10 still states PROP-WIRE-08's mechanism as "after `oraclePart` and `findingGrammarPart`, on both return paths of `reviewerPrompt`", the wording `TSPEC` v1.4 retired and `PROPERTIES` v1.3 has now corrected; the same sentence is quoted in the test file's comment. Prose only — the assertions are correct and green.

## Recommendation

**Approved with minor changes** — the envelope held, the re-worded mechanism matches HEAD, the
oracle still discharges the property, and the single finding is an inherited, non-local prose
residue in an upstream document.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
