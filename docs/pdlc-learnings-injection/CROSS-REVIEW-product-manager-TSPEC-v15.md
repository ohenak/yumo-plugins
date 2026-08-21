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

The product question behind ERR-8 is a user-visible one: at `maxBytesPerDocument: 0`, does the run
report *every* corpus document as `RSN-NO-MATERIAL` (REQ's transparency promise — the operator sees
why nothing was injected), or only the handful that happened to survive a count cut, with the rest
mislabelled `RSN-COUNT`? Those are different operator-facing reports from the same configuration.
So I checked the ordering claim against upstream directly rather than accepting the TSPEC's
paraphrase.

**FSPEC Step 5 at HEAD, items 15–16, verbatim:**

> 15. Drop any eligible document carrying none of BR-6's priority sections, with
>     `RSN-NO-MATERIAL` — it consumes no slot — then take the first
>     `learningsInjection.maxDocuments` of the rest in BR-4's order; the remainder are
>     dropped with `RSN-COUNT` (BR-5, BR-6).
> 16. For each taken document, extract its injectable material per BR-6, bounded by
>     `learningsInjection.maxBytesPerDocument`; a document whose material was cut is flagged
>     **bounded** in its row (BR-6, AC-2.3).

ERR-8's characterisation is exact: the drop at 15 is keyed on the **structural** condition
("carrying none of BR-6's priority sections"), the count cut happens at 15, and extraction — the
only step that can discover a zero bound admits nothing — happens at 16, after it.

**What upstream demands instead, also at HEAD:**

| Upstream locus | Text at HEAD | Consequence |
|---|---|---|
| BR-6, "How the per-document bound binds" | "Where the bound is **zero**, no material is admissible from any document: each yields nothing, is dropped before the total bound with `RSN-NO-MATERIAL` (BR-9) and consumes no slot" | every document, not just count survivors |
| BR-9 catalogue row | `RSN-NO-MATERIAL` = "Eligible, but yields no material — it carries none of BR-6's priority sections, **or** the per-document bound is zero and admits none (BR-6)" | two disjuncts, one reason code |
| D-12 (Step 4 decision table) | "Does the document yield any material? yes / no → `RSN-NO-MATERIAL`" | the question is *yields*, not *carries a heading* |
| E-36 | "`maxBytesPerDocument: 0` — No document yields material: every one carries `RSN-NO-MATERIAL` and consumes no slot; enabled run, empty selection, BR-8 rows present and empty" → AT-30 | "every one" is the operand |

E-36's "**every one** … consumes no slot" is unreachable under Step 5's literal order whenever the
corpus exceeds `maxDocuments`: documents cut at item 15 never reach extraction, so they would carry
`RSN-COUNT`. The gap is real, it is upstream's, and the TSPEC is right that it is procedural prose
versus rule text rather than a behavioural divergence — at any non-zero bound the two predicates
coincide, which is why it survived this long.

**The TSPEC's response is the product-correct one.** §D.5 states the implementer's rule as "extract
for every eligible document, then apply the count and total bounds", and keys the drop on *yields no
material* — BR-9's and D-12's own words — with one branch covering both disjuncts and no zero-bound
special case in the selector. That reading satisfies E-36's "every one" and preserves the operator
report the REQ's transparency criteria promise. The TSPEC does not rewrite upstream to match: it
files ERR-8 against FSPEC with a suggested fix and states the rule it follows meanwhile. That is
the correct disposition for a downstream document that has found a defect in its own upstream.

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Delta-Confirmation Findings

## Verdict
