# Cross-Review: software-engineer — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/PROPERTIES-pdlc-decision-ledger.md`
**Date:** 2026-08-30
**Iteration:** 5 (upstream-cascade confirmation — this document's own bytes are unchanged)
**Scope:** Does PROPERTIES still hold against `PLAN` as it now stands at HEAD?

## Overview

This is a cascade confirmation, not a re-review. `PROPERTIES` is byte-unchanged since my v4
approval (`sha256:2bab7d10…9141ef`, `REVIEWED-COMMIT: 9b96b15c`); the upstream that moved is `PLAN`,
from the version I measured (`sha256:a8e91304…97a100`, v0.7, commit `5ffa2713`) to HEAD
(`sha256:d1af8e47…4765a7`, v0.9, commit `64666b25`). I re-derived the round from disk rather than
from the changelog's account of it: `git diff 5ffa2713..HEAD --` on the `PLAN`, then the current text
of every passage in `PROPERTIES` that leans on it.

**Answer: yes — `PROPERTIES` still holds, and holds better than it did.** The `PLAN` erratum resolved
the upstream-vs-upstream contradiction I recorded in v4 **in this document's favour**, on both of the
two axes that were open:

1. **The census contract.** `PLAN` v0.7 declared `DECISION_LEDGER_CENSUS_TOKENS` production code
   written into `orchestrate-dev.js` by T-18, a member of a **fifteen**-member owned list
   (six ∪ nine), and named the fourteen-member reading the "**rejected**" resolution. `PLAN` v0.9
   reverses all five sites — the T-11 row (`PLAN`:162), the T-18 row (:168), both file-ownership
   manifest rows (:217, :229) and the §Definition of Done census bullet (:500–:519) — onto
   **fourteen owned declarations, all three census constants test-file constants of
   `decisionLedgerCensus.test.js`**. That is exactly what PROP-INV-06, PROP-INV-07, PROP-INV-11 and
   the §Coverage Matrix census paragraph already say. The residual "fifteen" occurrences in `PLAN`
   are confined to changelog entries explicitly marked superseded, plus one unrelated path count
   (`PLAN`:103); nothing live contradicts this document.
2. **T-10a's flag-off conjunct 3.** `PLAN` v0.7's two retired referents (a tautological
   "set-equal to the flag-off key set", and `notices` "set-equal to the baseline notices array",
   which FX-BASELINE cannot serve) are replaced by the **symmetric difference** form and
   **set-equal to empty** — which is verbatim what PROP-WIRE-12 and PROP-OFF-05 already carry.

I also re-derived against the deeper upstream, because `TSPEC` moved too and DEC-ERR-03 makes that
in scope whether or not it was listed: `TSPEC` v1.0 → HEAD **v1.2** (`sha256:fc57bc56…d4c27504`).
v1.2 does not reverse anything this document pins; it sharpens two things. Its §7.3 *The size of the
owned list, stated once* (`TSPEC`:1423–1429) now warns that two numerically identical but
membership-different partitions exist, so a bare "six ∪ eight = fourteen" can be wired to the wrong
operands — **this document is already safe there**: PROP-INV-06 names *the six functions plus the
eight top-level constants* (the owned list's own composition) and PROP-INV-07 names its operands
symbolically, never as bare arithmetic. The second sharpening is not yet reflected here and is F-01
below.

Two Medium findings and one Low. None falsifies a property; all three are one-passage edits.

## Properties

I re-read every property that leans on a changed `PLAN` region, against the current `PLAN` text
rather than against my v4 notes.

| Property | `PLAN` v0.9 says | Still faithful? |
|---|---|---|
| **PROP-INV-06** (`PROPERTIES`:407) | T-11 (`PLAN`:162): owned list **fourteen**, sliced declaration-line-to-next-top-level-declaration over *all* top-level declarations | **Yes.** Identical operand, identical slicing rule. The count and its nouns match `TSPEC`:1423–1425. One under-specification remains — F-01. |
| **PROP-INV-07** (`:408`) | T-11's companion assertion: `CENSUS_TOKENS` ∪ `CENSUS_EXEMPT` = `OWNED_DECLS`, disjoint, export set-equality named the rejected form | **Yes.** `PLAN` v0.7's competing six ∪ nine = fifteen is gone; the operands `PLAN` now names inline are the ones this property asserts. |
| **PROP-INV-08** (`:409`) | T-11: "Each slice asserted non-empty before counting", now additionally the conjunct that catches a regex which missed a declaration form | **Yes**, and strengthened in purpose rather than in text. |
| **PROP-INV-09** (`:410`) | T-11: `decisionLedger` not a member; its obligation discharged behaviourally by T-10a's live arm, and the flag-off pairing is the both-directions symmetric-difference equality | **Yes.** The hand-off target moved from the retired referent to PROP-WIRE-12's form, which is where this property already sends it. |
| **PROP-INV-11** (`:412`) | T-11: each of the **fourteen** owned members resolves to exactly one top-level declaration at HEAD | **Yes.** Count and conjunct unchanged. |
| **PROP-WIRE-11** (`:347`) | T-18 (`PLAN`:168): `report.decisionLedger` set only when the injector is non-null, conditional spread | **Yes**, untouched by the round. |
| **PROP-WIRE-12** (`:348`) | T-10a conjunct 3 (`PLAN`:161): symmetric difference of the paired flag-off/flag-on `report` key sets exactly `{decisionLedger}`, both directions; referent is the arm's own paired runs, never §7.4's recording | **Yes — and this is the property `PLAN` moved *to*.** The two documents are now word-for-word compatible, including the referent-split note. |
| **PROP-OFF-05** (`:362`) | §Definition of Done (`PLAN`:500–519) and T-10a: emitted `NTC-DECLEDGER-*` notice set **set-equal to empty**, FX-BASELINE holds no notices array | **Yes.** `PLAN` v0.7's "set-equal to the baseline notices array" — the clause this property expressly refused — is retired. |
| **PROP-DISC-08 / T-20 tracing** | `PLAN`:170's T-20 row, unchanged (batch 10, version bump constrained by `pdlcPluginCompat`) | **Yes.** No task id, batch, dependency or ownership assignment moved in this round, so §Coverage Matrix's all-24 two-way trace is intact. |

**Nothing in the changed `PLAN` regions falsifies a property, and no property is left without an
owner.** The one substantive addition `PLAN` v0.9 makes that this document has not yet absorbed is
the declaration-regex widening (F-01); the two stale passages are bookkeeping (F-02, F-03).

I re-checked the two counts that a partition change would normally disturb: the family totals
(INV 11, WIRE 12, total 103) are unaffected, because no property was added, removed or re-homed by
this round — the census family's *content* was already at the fourteen-member form when I approved
v4.

## Oracles

The oracles this document specifies are unaffected in *shape*; one is affected in its *named
mechanism*.

- **The census oracle (`decisionLedgerCensus.test.js`, PROP-INV-06…11).** Its operands, its scanned
  source and its four conjuncts (zero occurrences, partition, resolves-to-exactly-one, non-empty
  slice) are unchanged. What changed upstream is the instruction for building the **boundary set**:
  `TSPEC`:1448 and `PLAN`:162 now both require that the precedent's declaration regex be **widened,
  not cloned verbatim**, to recognise top-level `const` and `let` alongside `function`. This
  document names the precedent (`loopEconomicsAnchorGuard.test.js`'s `bodyOf` over
  `allTopLevelDecls`) without that caveat — F-01.
- **The red→green edge.** `PLAN`:162 still commits T-11 skipped in batch 2 and un-skips it at T-18
  (batch 8), but the *reason* is now the one this document already gives: the owned members resolve
  only once batches 3–8 have landed, not because T-18 writes a census constant. §Coverage Matrix's
  census-module paragraph (`PROPERTIES`:894–909) states exactly that reason and is correct at HEAD —
  except for its closing two sentences, which are now false (F-02).
- **The live composition-root oracle (`decisionLedgerMain.test.js`, PROP-WIRE-01…12, PROP-OFF-01).**
  `PLAN`:161's three arms are unchanged in structure; arm 3's conjuncts are now the ones PROP-WIRE-12
  and PROP-OFF-05 specify. The `_git`-call-count spy and the ends-with-block assertion are untouched.
  No property owed an edit here.
- **The delta-coverage gate.** `PLAN`:168 retains T-18's per-wave manual run of
  `check-wave-resume-delta-coverage.mjs` and its commit-then-run ordering. No property in this
  document claims that gate, and none needs to — it is a task acceptance condition, correctly left
  at `PLAN` altitude.
- **`documentOracles.test.js` / the terminal `102` control (PROP-DISC-05, PROP-DISC-07).**
  `PLAN`:169's T-19 row is unchanged, including the twelve-module count and the `102` complement pin.
  Since T-18 no longer adds a production census constant, no module-surface count moved either.

## Fixtures

## Delta-Confirmation Findings

## Recommendation

## Verdict
