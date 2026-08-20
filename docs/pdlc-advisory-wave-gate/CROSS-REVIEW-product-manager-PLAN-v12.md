# Cross-Review: product-manager — PLAN (upstream-cascade confirmation, round 12)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md` (unchanged since round 10)
**Date:** 2026-08-20
**Iteration:** 12
**Scope:** Upstream-cascade confirmation only. PLAN's own bytes are unchanged since the round-11 approval (`df90d1f8`). DECISIONS moved `25f8e954` → `84deee10` via one erratum commit (`8a44b84b`, +20/−3). Question answered: does PLAN still hold as approved against DECISIONS as it now stands?

## Overview

**What moved upstream.** Exactly one commit has touched DECISIONS since round 11's approval was
recorded: `8a44b84b` *"docs(decisions): v1.9 drop relocated integer, record round-9 erratum
re-grounding (TE v9 F-01)"*, +20/−3 across two hunks, both in the document's front matter — the
Cross-Reviews cell gains the round-9 files, the version cell moves 1.8 → 1.9, one word changes
inside the v1.8 relocation paragraph, and a new *"On v1.9 (Phase-P erratum round)"* paragraph is
appended below it. **No `### DEC-A6-0N` entry is touched**: the diff's two hunks sit at lines 4 and
27, and `DEC-A6-01`…`DEC-A6-04` (headings at 144, 185, 226, 252) are byte-frozen across the delta.
REQ, FSPEC, TSPEC and the `SIZING` appendix are byte-identical to what round 11 approved against —
verified both against the dispatch shas and by an empty `git diff df90d1f8..HEAD` over all four.

**What the edit does.** Two current-state repairs, no design change. (1) The v1.8 paragraph
describing the sizing-block relocation quoted the moved bullet by its cardinality — "the *twelve*
already-migrated sites". v1.9 drops the integer and names the bullet by subject
("the already-migrated-sites bullet"), on the ground that a HEAD measurement should not sit in the
one document whose stated purpose is to carry none, even as a quotation. (2) The Cross-Reviews cell
records round 9. The new paragraph also records a re-grounding pass on upstream and states that the
TSPEC erratum absorbed in that round is a recorded no-op for DECISIONS.

**Why this is benign for PLAN.** The integer that was dropped is not one PLAN sources from
DECISIONS. PLAN's Overview HEAD-drift note gets column (2)'s **twelve** from
`SIZING-pdlc-advisory-wave-gate.md`, which it cites by name and which still carries it
(`### Column (2) … **twelve**`). The edit therefore removes a *duplicate* of a figure PLAN reads
elsewhere, moving the tree toward the one-measurer-two-pointers shape my own DECISIONS v9 F-01 asked
for — it cannot make PLAN's citation dangle, because PLAN never pointed here for it. The one
sentence in PLAN that makes a claim *about* DECISIONS' contents — "DECISIONS now keeps only column
(1)'s four" — I re-read against DECISIONS at HEAD and it is still exactly true.

## Batches

## Dependencies

## Verification

## Findings

## Questions

## Positive Observations

## Recommendation
