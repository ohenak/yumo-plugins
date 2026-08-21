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

Three readings of "does DECISIONS still hold against REQ v1.16" were available. I state them because
the choice between them is the whole content of this round.

**Reading A — the item landed, so the cascade is satisfied.** REQ v1.16 lands exactly the item this
document routed; the decision it records (`refs/pdlc/a6-snapshot-{waveNum}`, wave-scoped, no run
discriminator) is untouched by the REQ edit; no option in the DEC-03 table is reopened. On this
reading the confirmation approves unchanged.

*Rejected.* The dispatch is explicit that the item landing is necessary, not sufficient, and
DEC-ERR-03 makes anything DECISIONS cites that upstream no longer says a finding of this round.
DEC-A6-03 does not merely *route* the obligation — it asserts, in the present tense and pinned to a
version, that the routing **has not landed**. That assertion is upstream-dependent text, and the
upstream it depends on has changed underneath it.

**Reading B — the decision holds, but the record's gap annotation is now false and load-bearing.**
The choice recorded in DEC-A6-03 survives REQ v1.16 intact: REQ still says nothing about the ref's
*name* or storage form (the changelog explicitly leaves those to TSPEC, O-1), so nothing constrains
the naming decision differently than before. What does not survive is the "Known gap in the remedy's
reach" subsection and the two sentences downstream of it that depend on the gap being open.

*Accepted.* This is the reading the evidence supports, and it is narrow: the findings below touch
one subsection, one Consequences bullet, and one re-evaluation trigger clause. Nothing else in the
document is in scope and nothing else is challenged.

**Reading C — the whole decision must be re-derived because an operator-facing obligation is now a
requirement.** AC-6.3 now imposes a product obligation on the halt path; one could argue that
changes the constraint set that "forced the shape" of DEC-A6-03 and that the option table must be
re-run.

*Rejected.* The record's own "Constraints that forced the shape" already says "The halt message must
print the ref name, so the name has to be derivable from what the halting wave knows." AC-6.3 adds a
*warning sentence beside* that name; it does not change what the name must be derivable from, and it
does not make any rejected option (fixed name, run-discriminated name) newly viable or newly
required. Re-litigating the option table would be exactly the re-opening this round forbids.

## Decision

## Consequences

## Delta-Confirmation Findings

## Recommendation

## Verdict
