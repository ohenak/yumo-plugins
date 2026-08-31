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

## Oracles

## Fixtures

## Delta-Confirmation Findings

## Recommendation

## Verdict
