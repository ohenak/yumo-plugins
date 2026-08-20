# Cross-Review: product-manager — TSPEC (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 10
**Round type:** upstream-cascade confirmation (FSPEC v0.10 → v0.12)

## Overview

**One question, one answer: does TSPEC still hold as approved against FSPEC at HEAD?**

TSPEC has not moved. Its bytes are `sha256:eff5a19bffcc35383ae71b18a43ec71418411f885ebfd99f63865d6377ba72d3`,
byte-identical to the `APPROVAL-HASH` recorded in `CROSS-REVIEW-product-manager-TSPEC-v9.md`, and
`git log 260f34bc..HEAD -- TSPEC-pdlc-learnings-injection.md` is empty. REQ has not moved either:
`sha256:ff605dd3…` at HEAD, the same bytes this document has been reviewed against since v7.

FSPEC has moved, and this time **not** header-only. It went from `sha256:a4f775bd…` (v0.10, the
`UPSTREAM-STATE` recorded in v9) to `sha256:fb18dbda…` (v0.12) over six commits (`3f21bd3b..c1d7218e`),
+54/−26 lines. The substantive content of that delta is that upstream **adopted the two corrections
this TSPEC itself routed upstream** as ERR-7 and ERR-3:

1. **BR-1 now states REQ C-1's rule with both conjuncts** — authoring-classified **and** target
   document among REQ, FSPEC, TSPEC, PLAN, DECISIONS, PROPERTIES — and says in terms that the second
   conjunct is "load-bearing, not defensive", naming the code-review phase's optimizer round as the
   dispatch it excludes (REQ AC-1.2, NG-5).
2. **BR-1's complement is carried through** to BR-11, AT-03 and AT-29, which now quantify over
   dispatches "outside BR-1's rule" rather than over "non-authoring" ones; AT-02 gains a fixture
   containing an authoring-classified dispatch with no C-1 target, and D-2 asks the two-conjunct
   question with all three branches named.
3. **BR-15's expected read set** drops the corpus enumeration (which opens no file under `docs/` and
   so contributes no member to that instrument) and is stated as an enumerable set equality, not a
   count; AT-33 follows.
4. The Overview and A-2 stop restating one conjunct when deferring to BR-1, and the header
   Cross-Reviews row stops hand-enumerating rounds.

**The answer is yes, TSPEC still holds — and its central design claim is now stronger, not weaker.**
TSPEC's `injectHere = dispatchKind === "authoring" && LEARNINGS_TARGET_DOCTYPES.includes(docType)`
(§A.2) was, at approval, a *divergence* from FSPEC BR-1 that TSPEC honestly refused to resolve
silently in code and routed as ERR-7. Upstream has now agreed. The same design text that was a
routed conflict is, at HEAD, an exact compression of BR-1. No rule, threshold, notice id, config
state, report field or acceptance criterion that TSPEC compresses changed against it.

What the delta *does* leave behind is bookkeeping that upstream has overtaken: two open ERR entries
in TSPEC (ERR-7, ERR-3) that quote FSPEC text no longer at HEAD and describe a conflict that no
longer exists, and one AT-02 fixture obligation FSPEC newly names that TSPEC's fixture inventory
does not yet enumerate. Those are the findings below — Medium, none gating, all inside the material
this delta targeted.

## Architecture

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Findings

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
