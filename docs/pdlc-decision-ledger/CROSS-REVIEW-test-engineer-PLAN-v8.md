# Cross-Review: test-engineer — PLAN (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md` (v0.7, bytes unchanged)
**Upstream that moved:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` v0.9 → v1.0 (`452d72c07`)
**Date:** 2026-08-29
**Iteration:** 8 (upstream-cascade confirmation)

## Overview

**The one question:** does PLAN v0.7 still hold as approved against TSPEC as it now stands at
`sha256:b1b603a8…d31a0` (v1.0)? **Answer: no.** The erratum reversed the exact contract PLAN v0.7
compresses, and PLAN v0.7's revision history names the now-upstream resolution as the **rejected**
one, in those words.

What moved upstream (`452d72c07`, sections touched: §7.3 + changelog):

| TSPEC §7.3 at v0.9 (the base of my v7 approval) | TSPEC §7.3 at v1.0 (HEAD) |
|---|---|
| `DECISION_LEDGER_CENSUS_TOKENS` is a member of `DECISION_LEDGER_OWNED_DECLS` — so it must resolve to exactly one top-level declaration of `orchestrate-dev.js` with a non-empty slice | New paragraph *"Where the three census constants live"*: all three constants are declarations **of the census test file itself**, not of `orchestrate-dev.js`; a test-file constant is **never** a member of the owned list |
| `CENSUS_TOKENS` is listed inside `DECISION_LEDGER_CENSUS_EXEMPT` | Removed from `CENSUS_EXEMPT` |
| `CENSUS_TOKENS` is listed in the owned-declaration enumeration, with the rationale *"the token strings live inside its own declaration, so the census would otherwise red on its own literal"* | Removed from the owned enumeration; that rationale sentence is **deleted**, on the ground that it only held for a production constant |
| Partition arithmetic: six ∪ nine = fifteen | Partition arithmetic: six ∪ eight = fourteen |

My v7 approval was recorded against `UPSTREAM-STATE: TSPEC sha256:eef45ef3…0623c8`. That version no
longer exists, and the delta is not additive: it inverts the home of the load-bearing operand.

This is a genuine cascade defect, not a bookkeeping nit — an implementer reading PLAN at HEAD writes
a production constant TSPEC now forbids, and the census's companion partition assertion reds on
conforming code. The items landing upstream is necessary but not sufficient (DEC-ERR-03); what
fails here is the PLAN's fidelity to the upstream text as it now reads.

## Batches

Five PLAN sites carry the reversed contract. All five were written by v0.7 in direct response to my
v7-round predecessor finding, and all five now contradict upstream.

| # | Site | PLAN text at HEAD | TSPEC v1.0 §7.3 |
|---|---|---|---|
| 1 | `T-11` (PLAN:152) | `CENSUS_TOKENS` "is itself **declared in `pdlc/workflows/orchestrate-dev.js` as a production top-level constant, written by T-18**… That home is what makes it a member of `DECISION_LEDGER_OWNED_DECLS` — and therefore of `DECISION_LEDGER_CENSUS_EXEMPT`" | test-file constant of the census test; "a test-file constant is never a member of it" |
| 2 | `T-11` (PLAN:152) | `CENSUS_EXEMPT` = "the **nine** plumbing declarations", enumerated with `DECISION_LEDGER_CENSUS_TOKENS` itself as the ninth; `OWNED_DECLS` = "the **fifteen** top-level declarations… all fifteen declared in `orchestrate-dev.js` by a `[green]` task of batches 3–8 (T-13…T-18)" | eight exempt members (`CENSUS_TOKENS` removed), fourteen owned |
| 3 | `T-18` (PLAN:158) | "**Add the frozen `DECISION_LEDGER_CENSUS_TOKENS` declaration to `pdlc/workflows/orchestrate-dev.js`** as a top-level constant… production code, not a test operand" | the constant belongs in `decisionLedgerCensus.test.js`; no module-surface section (§3/§4/§5) declares it, and §5.2's frozen-catalogue table lists only `OMIT_REASONS`, `CORPUS_OUTCOMES`, `NOTICES` |
| 4 | File-ownership manifest (PLAN:207, :219) | test-file row **disclaims** the third operand ("`DECISION_LEDGER_CENSUS_TOKENS` is **not** a test-file constant"); the `orchestrate-dev.js` row **claims** it for T-18, batch 8 | ownership is exactly inverted |
| 5 | §Definition of Done census bullet (PLAN:487–502) | "`DECISION_LEDGER_CENSUS_TOKENS` (**six**) ∪ `DECISION_LEDGER_CENSUS_EXEMPT` (**nine**) = `DECISION_LEDGER_OWNED_DECLS` (**fifteen**)… but `DECISION_LEDGER_CENSUS_TOKENS` is **production**, declared by T-18 — which is what makes its slice non-empty and its resolves-to-one conjunct satisfiable" | six ∪ eight = fourteen; the non-empty-slice / resolves-to-one conjuncts no longer apply to `CENSUS_TOKENS` at all |

The testing consequence, stated as the test that reds: T-11's companion assertion is an **exact set
equality**. Written to PLAN's fifteen-member owned list and nine-member exempt list, against an
implementation built to TSPEC v1.0 (where `CENSUS_TOKENS` is never declared in `orchestrate-dev.js`),
two conjuncts fail on conforming code — the partition equality (a fifteenth member that does not
exist) and §7.3's resolves-to-exactly-one-top-level-declaration conjunct for that member. This is
red-by-construction, the precise failure mode §7.3 exists to prevent, and it is not detectable by
the green gate because T-11 is committed skipped and un-skipped by T-18 in batch 8.

The second-order effect is on T-18's scope: T-18's `[green]` instruction currently orders an edit
to production `orchestrate-dev.js` that TSPEC v1.0 forbids. That instruction must be deleted, not
merely re-worded, and the batch-8 un-skip edge it justifies re-examined — with `CENSUS_TOKENS`
test-file-local, T-11's three operands are all resolvable at T-11's own landing, so the row's
stated reason for the un-skip-at-T-18 timing ("the two conjuncts that read the owned list against
HEAD are satisfied at **T-18's** landing, not before") is now only true of the *other* fourteen
owned members, not of `CENSUS_TOKENS`. That is a real, if narrower, justification; it needs
restating rather than deleting.

## Dependencies

_pending_

## Verification

_pending_

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
