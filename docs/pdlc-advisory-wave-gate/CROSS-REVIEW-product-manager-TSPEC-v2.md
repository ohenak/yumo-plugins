# Cross-Review: product-manager — TSPEC (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md
**Date:** 2026-08-20
**Iteration:** 2
**Round type:** upstream-cascade confirmation (TSPEC bytes unchanged; REQ moved v1.15 → v1.16)
**Scope:** TSPEC measured against upstream at HEAD

## Overview

I approved this TSPEC at v1 (`REVIEWED-COMMIT: 95d8d2e4`) with one Low finding and no gating
findings. Its own bytes have not changed since. What moved is REQ, in exactly one commit —
`30d8bf7b`, v1.15 → v1.16, 12 insertions / 2 deletions — and my approval was recorded against
REQ `sha256:c62cfc35…`, a version that no longer exists. FSPEC is byte-identical to the version I
approved against (`sha256:91ef2557…`, matching my v1 `UPSTREAM-STATE` line), so the whole cascade
surface is the REQ delta.

**The one question:** does this TSPEC still hold as approved against REQ as it now stands?

**Answer: no.** REQ v1.16 landed a new operator-facing conjunct on **AC-6.3**, and TSPEC compresses
it nowhere. The condition that triggers the new obligation is live in this TSPEC's own design, not
hypothetical, which is what makes the gap a real one rather than a bookkeeping mismatch.

The REQ delta, in full — two sentences appended to AC-6.3:

> *"Where the halt report points the operator at a captured pre-A6 tree state, it also warns, in the
> same place, that re-running this feature overwrites that capture — so an operator who intends to
> inspect it preserves it first, rather than losing it to the ordinary next action after a halt
> (DEC-A6-03). The capture's name and storage form stay TSPEC's (O-1)."*

The v1.16 changelog states the round's intent plainly: it lands DEC-A6-03's operator-facing
halt-message obligation, "routed since round 5 and previously unlanded," raised this round by SE, PM
and TE alike. Nothing else in REQ changed; no decision was reopened.

**What I am not doing here.** I am not re-reviewing the TSPEC, and I am not reopening settled
matters — the wave-scoped ref name with no run discriminator (§2.5, §6 OQ-2, PM F-02/F-03 of round
5) is a settled design decision and I am not relitigating it. The finding below is not "the
overwrite should not happen"; the overwrite is accepted. It is "REQ now requires the operator to be
**told** about it at the halt, and this TSPEC does not say where that telling lives."

## Architecture

### The new obligation's condition is live in this TSPEC, not vacuous

AC-6.3's new conjunct is conditional: it binds *where* the halt report points the operator at a
captured pre-A6 tree state. A conditional obligation over a condition that never fires would be a
non-finding. Here the condition fires, and it is this TSPEC that makes it fire. §2.5:

> *"E-28's halt names the ref for the halting wave, which is the difference between 'A6 left a tree
> it could neither repair nor restore' and 'A6 left a tree, and here is the object name that has the
> original in it'."*

That is precisely "the halt report points the operator at a captured pre-A6 tree state." So on
TSPEC's own design, AC-6.3's antecedent is satisfied on the E-28 path, and its consequent — the
same-place warning — is required.

### The TSPEC knows the hazard, and answers it at the wrong altitude

This is not a design that overlooked the overwrite. §2.5 states it more precisely than REQ does:

> *"The name is derived from the wave number alone, so a re-run of a halted feature — the ordinary
> next step after a halt — reaches wave 1, captures, and overwrites `refs/pdlc/a6-snapshot-1`, the
> very ref the operator was told to keep."*

and it names the remedy:

> *"An operator who wants a snapshot to survive the next run should copy the ref before re-running."*

The analysis is right and the remedy is right. The gap is **where the remedy is delivered.** As
written, it is delivered to the reader of the TSPEC — a design-document sentence addressed to
engineers. REQ v1.16 requires it delivered to the operator, *in the halt report, in the same place*
the ref is named. Those are different artifacts with different audiences. An operator reading a halt
message is not reading §2.5. The whole point of DEC-A6-03's routing, and of the "in the same place"
clause REQ chose, is that the warning must reach the person at the moment they are deciding what to
do next — which is exactly the moment they are about to re-run.

`grep -c overwrit` over the TSPEC returns matches only in §2.5's design prose and §6 OQ-2's
disposition. Neither is a contract on the halt report's content.

### Why this is High rather than Medium

REQ AC-6.3 is an acceptance criterion on US-02, and this conjunct exists to prevent a concrete,
irreversible user loss: an operator halts, is handed a ref, does the ordinary next thing (re-run),
and the ref they were told to keep is gone. TSPEC §2.5 itself concedes the cost is "the operator's,
not the pipeline's" — which is the argument for *telling the operator*, not for leaving it
undocumented at the halt. A design that does not carry a P0-path acceptance criterion has dropped
it, and no downstream author (PLAN, PROPERTIES, implementation) would mint work for it.

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
