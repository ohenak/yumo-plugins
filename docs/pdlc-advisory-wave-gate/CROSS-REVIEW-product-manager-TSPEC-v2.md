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

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
