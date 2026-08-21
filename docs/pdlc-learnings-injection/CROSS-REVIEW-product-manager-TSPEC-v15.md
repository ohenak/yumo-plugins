# Cross-Review: product-manager — TSPEC (delta confirmation, round 15)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md
**Date:** 2026-08-21
**Iteration:** 15
**Round type:** delta confirmation (previously approved at v14)
**Scope:** Erratum delta + upstream fidelity at HEAD (DEC-ERR-03)

## Overview

**The routed item is landed, and it landed in the bytes I already approved.** The erratum this
round confirms — Step 5 items 15–16 ordering the structural drop before the count cut and
extraction after it, a sequencing that cannot produce E-36's no-slot zero-bound drop — is recorded
as **ERR-8** in the TSPEC at HEAD, in two places: §D.5's zero-bound bullet (the rule the implementer
follows) and §Open Questions' erratum register (the item addressed to FSPEC's author, with a
suggested fix). Both were present at commit `739fea34`, which is the commit I reviewed and approved
at v14.

**The delta is byte-empty.** Measured at dispatch:

| Quantity | Value | Matches |
|---|---|---|
| TSPEC sha256 at HEAD | `22dee8ce…d562131` | v14's `APPROVAL-HASH` exactly |
| `git diff 739fea34..HEAD -- TSPEC` | empty | no new bytes since my approval |
| REQ sha256 | `ff605dd3…d92e84dd` | dispatch's stated REQ hash, and v14's `UPSTREAM-STATE` |
| FSPEC sha256 | `ae75fa62…64a86a1d` | dispatch's stated FSPEC hash, and v14's `UPSTREAM-STATE` |

So this confirmation asks a question v14 already answered on the same bytes against the same
upstream. That is not a defect — an erratum that was filed rather than folded stays filed — but it
does change what this round can usefully add: not "did the edit break anything" (there was no edit)
but "is the erratum's characterisation of upstream still true at HEAD, and does the TSPEC's stated
rule still serve the REQ's acceptance criteria". I re-verified both from the upstream bytes rather
than from my v14 notes; the sections below record that verification per lens.

**Conclusion up front.** ERR-8's quotation of FSPEC Step 5 is verbatim-accurate at HEAD; its claim
that BR-6/BR-9/D-12/E-36 demand the opposite ordering is accurate at HEAD; the TSPEC's stated
implementer rule is the one that satisfies E-36; and the PLAN's rows do encode that rule, so the
"no PLAN change is owed" half of the routed item is true and verifiable, not asserted. Nothing I
approved at v14 is weakened. One Low finding carries forward, inherited and unchanged.

## Architecture

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Delta-Confirmation Findings

## Verdict
