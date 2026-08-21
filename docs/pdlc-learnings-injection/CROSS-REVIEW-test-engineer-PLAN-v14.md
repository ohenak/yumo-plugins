# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md (v1.2)
**Date:** 2026-08-21
**Iteration:** 14 (delta confirmation — erratum round)

## Overview

**What this round is.** A delta confirmation, not a re-read. I approved this PLAN at v0.5/v0.6/v0.7
and confirmed v0.8, v0.9 and v1.1. Since the bytes I confirmed at round 13 (v1.1) the document has
moved to **v1.2** across three commits (`8105144a`, `a4a2516d`, `95098af5`), measured as **36
insertions / 5 deletions in one file**. I re-derived the scope from `git diff aa5f0378..HEAD`, not
from the changelog's account of itself: one new subsection (**§Post-batch remediation (CODE_REVIEW
v1)**), one sentence appended to §The arithmetic, P-A-7's case C cell, the version cell, two
changelog rows re-pinned and one row added.

**The four routed items, checked against HEAD rather than against the edit's own claims.**

1. **Case C's commit pins — resolved, and verified reachable.** `git merge-base --is-ancestor`
   confirms `e7fa8d87` (LI-21), `be2456c8` (LI-16) and `a4998e13` (LI-17) are all ancestors of HEAD
   and that `92b7ea0c`, `d462ddd8` and `2cbacada` resolve to nothing on this branch. The v0.8 and
   v1.1 changelog rows were re-pinned with the case C cell, which is the right call: those rows
   assert what is landed *at HEAD*, so an unresolvable pin falsifies the claim rather than dating it.
2. **Case C recorded as discharged — resolved, and I reproduced the measurement.**
   `npm test -- __tests__/learningsBlock.test.js __tests__/learningsSelect.test.js` in
   `pdlc/workflows` reports **2 suites passed, 26 passed / 26 total**, with no skipped count emitted
   (0 skips). The cell's "unexercised, not waived" framing for the failure limb is the right
   distinction and is what my lens wanted: it records an outcome without retiring the rule.
3. **The four unowned `2fc6fcd3` remediation files — recorded, but the enumeration behind them is
   wrong.** All four rows are present and correct. The claim they sit under — that `2fc6fcd3`
   "touched six test-side surfaces" — is not. See F-01.
4. **The two P-A-5 second-owner rows — recorded, and correctly attributed to LI-06 (batch 4).** The
   rows are right; they are two of the eight ladder-owned surfaces that commit rewrote. See F-01.

**The structural decision in the new subsection is sound, and I want to say so before the finding.**
Carrying a **landing commit** instead of an `Owner` cell, and keeping the two dispatcher-parsed
tables byte-unchanged, is the correct resolution of the tension between P-A-5's recording duty and
the dispatcher's parse of `Owner` as a task id. Scoping §The arithmetic to the two parsed tables
explicitly closes the count reconciliation the same way. Neither invents a new contract.

**Result: two High, two Low.** One High is this delta's own (`delta`/`local`) — the new subsection
records six of roughly seventeen surfaces `2fc6fcd3` touched and states the count as complete. One
is inherited and untouched by this edit (`inherited`/`nonlocal`) — the PLAN's coverage story for
`pdlc/workflows/package.json` was falsified at HEAD by that same commit and still reads as if it
were not. Neither is a reason to unwind anything this edit did.

## Batches

_pending_

## Dependencies

_pending_

## Verification

_pending_

## Recommendation

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
