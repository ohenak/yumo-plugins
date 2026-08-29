# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md` (v0.7, se-author)
**Date:** 2026-08-29
**Iteration:** 7 (delta re-review)
**Scope:** Local

## Overview

Delta re-review of `PLAN-pdlc-decision-ledger.md` **v0.7** against my v6 delta re-review
(`CROSS-REVIEW-product-manager-PLAN-v6.md`, verdict *Approved with minor changes*, reviewed at
`c937f1a7b`). Four commits touched the document since:

| Commit | Message | What changed |
|---|---|---|
| `b22b1c0a0` | name `orchestrate-dev.js` as `DECISION_LEDGER_CENSUS_TOKENS`'s home in T-11 | T-11 |
| `9f1d6ede6` | complete T-18's `DECISION_LEDGER_CENSUS_TOKENS` instruction | T-18 |
| `68317ce6e` | give `DECISION_LEDGER_CENSUS_TOKENS` a manifest owner | §Per-phase file-ownership manifest (two rows) |
| `5ffa27135` | align the DoD census bullet and record v0.7 revision history | §Definition of Done, header/history |

`git diff c937f1a7b..HEAD` on the file: one file, six hunks — version row and v0.7 revision-history
paragraph (`PLAN`:17-19), **T-11** (`PLAN`:152), **T-18** (`PLAN`:157), the two manifest rows
(`PLAN`:207, `PLAN`:219) and the §Definition of Done census bullet (`PLAN`:489-496). Everything else
is byte-unchanged and is not re-litigated. The single item open from v6 was my F-01 (Medium) —
`DECISION_LEDGER_CENSUS_TOKENS` had no stated home — which TE raised at High on the same clause.

## What I verified

1. **F-01 (v6) is closed, and closed identically at four sites.**
   - T-11 (`PLAN`:152): the constant is "**declared in `pdlc/workflows/orchestrate-dev.js` as a
     production top-level constant, written by T-18**", explicitly contrasted with the precedent's
     test-file `ANCHOR_TOKENS` and with this task's own two test-file lists.
   - T-18 (`PLAN`:157): the dangling three-word fragment "Add `DECISION_LEDGER_CENSUS_TOKENS`." is
     now a full instruction naming the file, the six token strings and the §7.3 rationale, plus why
     it lands in the last production batch (it keeps the `[red]` T-11 red until T-18 lands).
   - Manifest (`PLAN`:207): T-11's `decisionLedgerCensus.test.js` row now **disclaims** the third
     operand; (`PLAN`:219): T-18's `orchestrate-dev.js` row **claims** it.
   - DoD bullet (`PLAN`:489-496): same statement, same direction.
   No contradiction remains between the four; the reading that made the partition red by
   construction is gone.

2. **The contrast claim is true in code.** `grep ANCHOR_TOKENS pdlc/workflows/*.js` returns nothing;
   the constant exists only at `pdlc/workflows/__tests__/loopEconomicsAnchorGuard.test.js`:114. So
   "unlike the precedent's `ANCHOR_TOKENS`, which is test-file-local … and absent from every
   `pdlc/workflows/*.js`" is measured, not asserted.

3. **The upstream quote is verbatim in substance.** `TSPEC-pdlc-decision-ledger.md`:1297 lists
   `DECISION_LEDGER_CENSUS_TOKENS` inside `DECISION_LEDGER_OWNED_DECLS` with exactly the reason T-11
   now quotes ("the token strings live inside its own declaration, so the census would otherwise red
   on its own literal"). `TSPEC`:1296 carries the partition and the exempt list. The PLAN did not
   invent the production placement — it read it correctly off the pinned upstream.

4. **No count moved, and the new "all fifteen have a writing task" claim holds.** Walking the
   `[green]` rows: T-13 writes `DECISION_LEDGER_DEFAULTS`, `parseDecisionLedgerConfig`,
   `DECISION_LEDGER_NOTICES` (3); T-14 `DECISION_CORPUS_ARGV`, `DECISION_HEADING_RE`,
   `recogniseDecisionRecords` (3); T-15 `DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT`,
   `renderDecisionLedgerBlock` (3); T-16 `selectDecisions`, `DECISION_LEDGER_OMIT_REASONS` (2);
   T-17 `gatherDecisionCorpus`, `DECISION_LEDGER_CORPUS_OUTCOMES`, `buildDecisionLedgerInjector` (3);
   T-18 `DECISION_LEDGER_CENSUS_TOKENS` (1). 3+3+3+2+3+1 = **15**, and the set is name-for-name
   `TSPEC`:1297's enumeration. Six ∪ nine = fifteen still reconciles. No batch, dependency or
   ownership assignment moved, as the revision history claims.

5. **The red-before-green edge the fix creates is legal.** T-11 is `[red]`, committed skipped in
   batch 2; T-18 (batch 8) un-skips it and lists T-11 in `Depends on` (`PLAN`:157) — so the two
   conjuncts that read the owned list against HEAD (resolves-to-one, non-empty slice) first become
   evaluable exactly when the declaration exists. That is the ordinary TDD edge, not a planning gap.

6. **The anti-echo guard on the census survives the move.** The forbidden-token set is now
   production, which would normally make the census's expectation derive from the code under test.
   It does not, because the partition's other two operands (`DECISION_LEDGER_CENSUS_EXEMPT`,
   `DECISION_LEDGER_OWNED_DECLS`) stay **test-file** frozen literals (`PLAN`:152, manifest
   `PLAN`:207): dropping a token from the production constant breaks
   `CENSUS_TOKENS ∪ EXEMPT = OWNED_DECLS` and reddens. This is worth stating because it is the
   reason the fix is safe, and no site says it yet.
