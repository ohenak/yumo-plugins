# Cross-Review: product-manager — PLAN (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md` (v0.4, se-author)
**Date:** 2026-08-29
**Iteration:** 4 (delta confirmation)
**Scope:** Local

## Overview

Delta confirmation, not a re-review. I approved this PLAN at `665eb44a8`
(`CROSS-REVIEW-product-manager-PLAN-v3.md`, verdict *Approved with minor changes*,
`REVIEWED-COMMIT: 665eb44a8`). Since then four commits touched the document:

| Commit | What it changed |
|---|---|
| `19e148f69` | Header re-grounded on `TSPEC` **v0.8** + four upstream sha pins; revision-history row v0.4 |
| `538747659` | T-11 drops `decisionLedger` from `DECISION_LEDGER_CENSUS_TOKENS` |
| `86cd12216` | T-05 / T-06 cite `TSPEC` §7.5's `P-REC` / `P-LINE` with O-8 mutation discipline |
| `36cd34d4d` | DoD: `P-REC`/`P-LINE` mutations, six-token census |

Aggregate: 30 insertions / 10 deletions in one file. Sections changed: the header block, the
revision-history block, rows **T-05**, **T-06**, **T-11** of §Batches, and four bullets of the
Definition-of-Done checklist. Every other section is byte-unchanged and is not re-litigated here.

One item was routed to this erratum. It is **not landed** — see §Verification. Two further defects
sit inside the bytes this edit did write. Detail in §Batches and §Dependencies; the parsed contract
is §Delta-Confirmation Findings.

## Batches

What the edit did to the changed rows, measured against upstream at HEAD.

**T-05 / T-06 — faithful, and an improvement.** Both rows previously carried locally-invented
property counts ("Two `fast-check` properties (TE F-07)"). v0.4 names them as `TSPEC` §7.5's
`P-REC` and `P-LINE` and imports O-8's discipline verbatim. Checked against
`TSPEC-pdlc-decision-ledger.md` §7.5 at the dispatched sha:

- `P-REC`'s falsifying mutations, "one per conjunct", are **four**: admit an out-of-depth heading;
  admit an empty-statement heading; normalise or trim the statement instead of slicing it verbatim;
  resolve duplicates first-wins instead of last-wins. T-05 names **four**, the same four, in the
  same order. ✓
- `P-LINE`'s are **three**: render a statement containing `\n` unescaped; join two records onto one
  line; emit the set in an order other than §3.6's. T-06 names **three**, the same three. ✓
- §7.5's closing sentence — "an independent model, never the production renderer or recogniser, and
  a recorded observed red per named mutation" — is what both rows now restate as "expectation
  computed by an **independent model**, never the production function". ✓

Neither row lost anything I approved at v3: T-05 still carries the five §3.2 conjuncts, the ordinal
prefix instance, the `M-2e`/`M-4a`/`M-4b`/`M-4d` exclusions and §3.3's last-record-wins; T-06 still
carries BR-1/E-6's exact-`""`, the `DEC-DECLEDGER-10` line grammar, AT-06/AT-07's rule-text
conjuncts and the `DEC-DECLEDGER-12` ≤ 1,200-byte framing pin.

**T-11 — content faithful, punctuation broke the operand list.** The census-token content is exactly
`TSPEC` §7.3's table row at line 1234: six members, `selectDecisions`,
`recogniseDecisionRecords`, `renderDecisionLedgerBlock`, `gatherDecisionCorpus`,
`DECISION_LEDGER_OMIT_REASONS`, `DECISION_LEDGER_CORPUS_OUTCOMES`, held by set equality against the
module's exported decision-ledger symbol names. The `decisionLedger` exclusion reproduces §5.5's own
reasoning at lines 1248–1254 — the report field is threaded through `buildFinalReport` at ~six
shipped call sites far outside `main()`'s sentinel region, so the bare name occurs in the scanned
remainder by construction, and carving `buildFinalReport` out of the scan is the rejected
alternative because it would blind the census to a larger surface. Faithful compression. ✓

What the insertion cost: T-11's row opens `Operands: the frozen DECISION_LEDGER_CENSUS_TOKENS …`
and used to reach its second operand with `; and `orchestrate-dev.js`'s source **minus** four owned
regions`. The new `decisionLedger`-exclusion paragraph was spliced between the two, and the join is
now `… set-equal to the flag-off key set. and `orchestrate-dev.js`'s source **minus** four owned
regions …` — a full stop followed by a lowercase `and`, leaving the scan surface as an orphaned
sentence fragment rather than the second half of a two-operand list. The content survives and the
following sentence ("Assertion: zero occurrences of any member in the scanned remainder") keeps the
surface unmistakable, so this is Low, not a correctness defect. Fix is one character: restore the
semicolon by moving the exclusion paragraph after the operand list. (F-03)

**DoD — faithful.** The four amended bullets track the row changes: the mutation bullet now names
T-07's four, T-02's three, `P-REC`'s four and `P-LINE`'s three under §7.5's O-8 discipline; the
census bullet names the six members and states the `decisionLedger` exclusion with the same §5.5
citation and the same behavioural-discharge referent (T-10a's live arm), which matches T-10a's own
row and the `report.decisionLedger` DoD bullet fifteen lines above. No double-counting, no orphan.

## Dependencies

_pending_

## Verification

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
