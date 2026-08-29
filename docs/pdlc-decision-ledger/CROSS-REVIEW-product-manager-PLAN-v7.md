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

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | The precedent T-11 clones recognises **function declarations only** — `loopEconomicsAnchorGuard.test.js`:61's `DECL_RE` is `/^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(/`, and `bodyOf` throws `No top-level declaration found for {name}` when a name is absent from `allTopLevelDecls` (`:124-130`). Nine of the fifteen `DECISION_LEDGER_OWNED_DECLS` members are top-level **`const`** declarations, not functions (`DECISION_CORPUS_ARGV`, `DECISION_HEADING_RE`, `DECISION_LEDGER_DEFAULTS`, `DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT`, the three §5.2 catalogues, and now `DECISION_LEDGER_CENSUS_TOKENS`). A literal clone therefore throws on nine of fifteen, and §7.3's resolves-to-exactly-one conjunct is unsatisfiable for them. T-11 says "the precedent's way" and "next top-level declaration of any name" without saying the regex must widen to `const` declarations. **Fix:** one clause in T-11 stating that the cloned `DECL_RE` covers top-level `const` as well as `function` declarations (the house style is `export const …`, e.g. `pdlc/workflows/orchestrate-dev.js`:48, :52, :64). Medium, not High: it is inherited from pre-v0.7 bytes, it reddens loudly at T-11's first run rather than passing vacuously, and it does not change any count, batch or ownership. | BR-11, REQ NG-4 |
| F-02 | Low | Local | T-18 says to add `DECISION_LEDGER_CENSUS_TOKENS` "as a top-level constant" but not whether it is **exported**, and T-11 does not say whether its test reads the six tokens by importing that constant or by hand-transcribing them. The two readings differ in test strength: an import makes the census's expectation come from the module under test (guarded only indirectly, by the partition — see §What I verified, item 6), a transcription keeps it independent. Every sibling constant in the module is `export const` (`orchestrate-dev.js`:48, :52, :59-60, :64, :169, :309, :418). **Fix:** say `export const` in T-18, and in T-11 say which of the two forms the test uses. | BR-11 |
| F-03 | Low | Local | The rewritten T-11 row (`PLAN`:152) has a broken stitch: the new production-home clause ends "…and T-18 lists T-11 in its `Depends on`." and is immediately followed by "— and two further frozen lists **declared in this task's own test file**…", which resumes a sentence that already ended. The instruction is load-bearing and is read by an implementer under time pressure; the dangling dash reads as a dropped clause. **Fix:** rejoin as a new sentence ("The task's two further frozen lists are declared in its own test file…"). | — |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Still open from v6 and unanswered here: `PROPERTIES-pdlc-decision-ledger.md`:377-378 (PROP-INV-06/07) still describes the pre-v0.9 census — "three brace-matched declarations" and a token set "set-equal to the module's decision-ledger exports" — i.e. exactly the two forms `TSPEC`:1296-1297 and now PLAN v0.7 name as rejected. PROPERTIES is now the last document in the feature describing the superseded contract. Does the orchestrator intend PROPERTIES to be re-grounded on TSPEC v0.9 before implementation begins, so T-11's test is not written against two contradictory contracts? |
| Q-02 | v0.7 routes the residual upstream gap as `ERRATUM: TSPEC` in its revision history. I have emitted that erratum line in this round (TSPEC specifies `DECISION_LEDGER_CENSUS_TOKENS` only in §7.3; §5.2's frozen-catalogue table lists just `DECISION_LEDGER_OMIT_REASONS`, `DECISION_LEDGER_CORPUS_OUTCOMES`, `DECISION_LEDGER_NOTICES`, and no §4 module-surface section declares it). Confirm the route lands on TSPEC rather than being absorbed into PLAN prose — PLAN cannot itself add a constant to the upstream module surface. |

## Positive Observations

- **The fix chose the reading the upstream actually carries, and said why the other was rejected.**
  TE's suggested alternative — drop the member, restate the partition as six ∪ eight = fourteen —
  is recorded as rejected with its reason (it would put the PLAN out of contract with the TSPEC it
  had just re-pinned, and a production `CENSUS_TOKENS` whose declaration were not sliced out would
  red the census on its own six literals). Reconciling two reviewers who disagreed about the
  *direction* of the fix, in writing, is the behaviour that keeps the next round short.
- **One defect, four sites, one sentence each.** The failure mode here was a clause that said
  different things in different places; the repair says the same thing at T-11, T-18, both manifest
  rows and the DoD bullet, in the same words. That is the shape that does not decay.
- **No count moved, and the claim is checkable in thirty seconds.** Six ∪ nine = fifteen still
  reconciles name-for-name with `TSPEC`:1297, and the new "all fifteen are written by a `[green]`
  task of batches 3–8" claim is a complete cover of T-13…T-18 with no member left homeless — I
  walked it row by row and it balances.
- **The red-before-green edge is named rather than left to be discovered.** T-18 explains why the
  constant lands in the last production batch instead of earlier, which is exactly the question an
  implementer of batch 3 would otherwise raise mid-wave.

## Recommendation

**Approved with minor changes**

My v6 F-01 is fully resolved and nothing the revision touched broke. No High finding is open
anywhere in the document. F-01 (Medium) — the cloned `DECL_RE` must recognise `const` declarations
or nine of fifteen owned members cannot resolve — and the two Lows should be folded into the next
PLAN pass or, failing that, into T-11's and T-18's implementation briefs; they do not gate the
phase.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 2}
