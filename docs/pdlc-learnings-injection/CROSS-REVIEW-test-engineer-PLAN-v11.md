# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md (v0.8)
**Date:** 2026-08-21
**Iteration:** 11 (delta confirmation of the P-A-7 case-B terminus erratum)

## Overview

**What this round is.** A delta confirmation, not a re-review. I approved this PLAN at v0.5 (round 8),
v0.6 (round 9) and v0.7 (round 10, one Medium and one Low, no High). A targeted erratum has since
landed taking the document to v0.8, and six raises across PM, TE and SE named one item: P-A-7's case
table terminated case B's expected-red ledger span at *"the batch that greens them"*, but LI-16
(`d462ddd8`), LI-17 (`2cbacada`) and LI-21 (`92b7ea0c`) have all landed and batch 14 (LI-22) adds no
assertions — so an amendment to `learningsBlock.test.js` arriving now had **no terminus** for its
rows. The question this round answers is whether the delta resolves that without breaking what I
previously approved, measured against upstream at HEAD rather than against the item list (DEC-ERR-03).

**The delta, measured.** `git diff` across the three erratum commits (`1082b3f7`, `3e12a7d5`,
`be64a0c6`) plus `af847862` is **9 insertions, 4 deletions in one file**: the version cell
(0.7 → 0.8, 2026-08-20 → 2026-08-21), case B's header cell and an inserted clause in its body cell, a
**new case C row**, two clauses in the closing "no row of their own" paragraph, and the 0.8 changelog
row. I re-derived that from the diff rather than trusting the changelog's own claim of it: **no task
row moved batch, no `Deps` edge changed, no AT partition, fixture or single-writer manifest row was
touched, and the batches 7–13 ledger is byte-identical.** The changelog's closing claim to exactly
that effect is therefore accurate.

**Upstream, re-read at HEAD.** I re-hashed the four dispatch documents rather than assuming: `shasum
-a 256` returns REQ `ff605dd3…`, FSPEC `ae75fa62…`, TSPEC `22dee8ce…`, DECISIONS `56617f5a…` —
byte-identical to the four hashes this dispatch pins and to what I recorded at round 10. Upstream has
not moved a byte since the version I approved, so the faithful-compression verification from rounds 8
through 10 stands for every unchanged section, and what needed fresh checking is confined to the two
new claims case C makes: a claim about **which batches remain** and a claim about **what is already
shipped at HEAD**. I checked both against the artefacts, not against the prose.

**Result.** Both check out. The terminus item is resolved, and resolved in the right shape — not by
stretching case B's span, but by naming the post-batch-13 case as its own case with the gate itself as
the terminating condition, and by answering PM Q-02's "is the amendment now expected to land green?"
with a mechanism citation into shipped code rather than with a hope. The TE v9 F-01 scoping repair
rides along correctly. **No High finding.** Three Low findings, all of them wording-level consequences
of splitting a two-case table into three: a lead-in that still says "two cases", two batch numbers
that now fall between the case headers, and one `§Open questions` row whose fallback branch case C
quietly supersedes. None of the three changes what an implementer would do at HEAD, because case C's
own header (*"any commit landing once LI-21 has landed"*) is unambiguous about the live case.

## Batches

## Dependencies

## Verification

## Delta-Confirmation Findings

## Verdict
