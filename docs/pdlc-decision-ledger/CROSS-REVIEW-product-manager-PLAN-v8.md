# Cross-Review: product-manager — PLAN (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md` (v0.7, unchanged bytes)
**Date:** 2026-08-29
**Iteration:** 8 (upstream-cascade confirmation — TSPEC moved, PLAN did not)

## Overview

This is an **upstream-cascade confirmation**, not a re-review. PLAN's own bytes are unchanged since
`5ffa27135`, the commit my v7 round approved (`APPROVAL-HASH: sha256:a8e91304…97a100`). What moved is
the upstream I pinned in that approval: `452d72c07 docs(tspec): erratum v1.0 — home the census
constants, drop them from owned decls` re-wrote TSPEC §7.3. My v7 `UPSTREAM-STATE` recorded TSPEC at
`sha256:eef45ef3…0623c8`; TSPEC at HEAD is `sha256:b1b603a8…d31a0`. REQ (`ce6b133f…3c7b7c`), FSPEC
(`2bd5c3ef…5aed39`) and DECISIONS (`13aba061…4fb89a`) are byte-identical to the versions I approved
against, so the whole question is PLAN-against-TSPEC-§7.3.

I re-read `CROSS-REVIEW-product-manager-PLAN-v7.md`, ran `git show 452d72c07` on the TSPEC, and asked
the single question the dispatch names: **does the PLAN still hold against the TSPEC as it now
stands?** I did not re-litigate any settled decision, and I checked the erratum's whole post-image
rather than the routed-item list (DEC-ERR-03).

It does not hold. The erratum adopted the resolution PLAN v0.7 **explicitly examined and rejected in
writing**. My v7 Q-02 asked where the residual gap would land — on TSPEC, or absorbed into PLAN prose
— and the answer came back "on TSPEC", in the direction opposite to the one PLAN had already
committed to at four sites plus its revision history. PLAN v0.7's central claim about the census —
that `DECISION_LEDGER_CENSUS_TOKENS` is production code declared in `orchestrate-dev.js` by T-18, is
therefore a member of `DECISION_LEDGER_OWNED_DECLS`, and that the partition is six ∪ nine = fifteen —
is now a statement upstream contradicts term for term. TSPEC v1.0 says the constant is a **test-file**
declaration, that "a test-file constant can never be a member of it", and that the owned list is
wholly module declarations (six ∪ eight = fourteen).

This is one defect with several loci, not several defects. One finding, High, below.

## Delta-Confirmation Findings

_pending_

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
