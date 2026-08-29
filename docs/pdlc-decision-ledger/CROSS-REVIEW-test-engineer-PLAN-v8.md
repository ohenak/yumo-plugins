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

_pending_

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
