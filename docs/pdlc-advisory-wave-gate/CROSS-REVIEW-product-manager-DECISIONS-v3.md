# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md`
**Upstream changed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.15 → v1.16)
**Date:** 2026-08-20
**Iteration:** 3 (upstream-cascade confirmation)
**Round type:** delta confirmation — DECISIONS' own bytes unchanged since approval at `3143290a`

## Context

**What this round is.** I approved DECISIONS at round v2 (`CROSS-REVIEW-product-manager-DECISIONS-v2.md`,
`REVIEWED-COMMIT: 3143290a`, "Approved with minor changes"). The document's own bytes have not moved
since — `git diff 3143290a HEAD -- docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md`
is empty. What moved is its upstream: REQ went from v1.15 to v1.16 in an erratum round, so my
approval was recorded against a REQ that no longer exists.

**The upstream delta.** `git diff 3143290a HEAD` on the REQ shows exactly two hunks: the version
header (1.15 → 1.16) with its v1.16 changelog paragraph, and a three-line extension to **AC-6.3**.
AC-6.3 previously required only that the halt report carry "the diagnosis and the root-cause class".
It now adds:

> Where the halt report points the operator at a captured pre-A6 tree state, it also warns, in the
> same place, that re-running this feature overwrites that capture — so an operator who intends to
> inspect it preserves it first, rather than losing it to the ordinary next action after a halt
> (DEC-A6-03). *(US-02.)*

The changelog names this precisely: "DEC-A6-03's operator-facing halt-message obligation, routed
since round 5 and previously unlanded."

**Why that lands on this document specifically.** The routed obligation originates in this DECISIONS
document. `DEC-A6-03` (§Decision) carries a subsection headed **"Known gap in the remedy's reach
(PM F-05)"** whose whole purpose is to hold the gap open *until the routing lands*, and whose text
is a version-pinned factual claim about REQ. The REQ erratum is the landing event that subsection
was written to wait for. So the question is not whether the item landed upstream — it did — but
whether DECISIONS is still a faithful compression of REQ as REQ now stands.

**Scope.** Per DEC-ERR-03, my scope is DECISIONS measured against upstream at HEAD, not the item
list. I re-read DEC-A6-03 and `### What follows from DEC-A6-03` (Consequences) against REQ v1.16
AC-6.3 at HEAD, and I re-checked FSPEC v1.6 at HEAD for the second half of the record's claim. I did
not re-open DEC-A6-01, DEC-A6-02, DEC-A6-04, or any settled option table.

## Options Considered

## Decision

## Consequences

## Delta-Confirmation Findings

## Recommendation

## Verdict
