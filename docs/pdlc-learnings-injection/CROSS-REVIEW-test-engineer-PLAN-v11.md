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

**No task row changed, so the batch table is out of scope by measurement rather than by assertion.**
The diff touches §The three gate wordings' P-A-7 paragraph and the changelog only. Every one of the
twenty-two task rows, the `[Fake first]` ordering, the red-before-green pairing and the file-ownership
manifest are byte-identical to the v0.7 bytes I approved at round 10. What changed is a **gate-input
rule** about what the expected-red ledger contains when an amendment lands — which is squarely my
lens, because the ledger is the oracle the batch gate reads.

**The rule the delta replaces, and why the replacement is the right shape.** At v0.7 the table had two
cases: A (commit lands before batch 7 → no rows, the suite is already listed red whole) and B (commit
lands after LI-17 greened the suite → rows for *"every batch from the one the commit lands in through
the batch that greens them"*). Case B's span is a **half-open interval that needs a right endpoint**,
and the endpoint it named is a batch that greens the re-redded cases. With LI-17 landed at batch 9 and
LI-21 at batch 13, no such batch remains: batch 14 is LI-22's REFACTOR-and-close, which the PLAN's own
batch-ladder row describes as adding no assertions and carrying the *unqualified* full-suite-green
gate. So case B could not be evaluated at HEAD — the ledger rows it demands have no defined extent.
That is a genuine gate-input defect, and all six raises were right about it.

The delta does **not** try to fix this by stretching case B (which would have produced a span ending
at a batch that greens nothing — a rule that reads as satisfiable but cannot be checked). It bounds
case B to the window where its own wording is well-formed (**batch 9 through batch 12** — the last
landing batch that still has a greening batch ahead of it at batch 13) and adds **case C** for the
post-batch-13 window that is live at HEAD. Case C replaces the ledger obligation with a different
obligation of the same falsifiable kind: *the ledger stays empty and the amendment must be green at
the commit that lands it.* That is checkable — batch 14's gate is unqualified full-suite green, so a
red amendment fails it, with no ledger row available to excuse the red. The rule has an oracle again.

**Case C's green claim is a mechanism citation, and I verified the mechanism rather than the sentence.**
PM Q-02 asked whether the heading-form amendment is now expected to land green. Case C answers "yes"
and grounds it in the production half F-O-1's second rule needs being already shipped. I read
`pdlc/workflows/orchestrate-dev.js` at HEAD (`canonicalSectionName`, `SECTION_HEADING_RE`,
`GLOSS_RE`, `BR6_SECTION_NAMES`, the TSPEC §D.3 block) and checked all four of `LI-AT-11`'s named
heading-form cases against it:

| Case B/C names | Shipped behaviour at HEAD | Green? |
|---|---|---|
| un-numbered `## Cross-Feature Patterns` | `BR6_SECTION_NAMES.includes(title)` hits directly; the ordinal is optional in `SECTION_HEADING_RE`'s `(?:\d+\.[ \t]*)?` group, so both the numbered and un-numbered spellings canonicalise | ✓ |
| un-glossed `## Rejected Proposals` | `GLOSS_RE` is stripped from **both** sides — `strippedTitle === name.replace(GLOSS_RE, "")` — so the bare title matches the catalogue's `"Rejected Proposals (with rationale)"` | ✓ |
| `###` sub-heading reading as body text | `SECTION_HEADING_RE` is anchored `^##[ \t]+`; a `###` line's third `#` is neither space nor tab, so the regex never matches and the line stays inside the enclosing extent | ✓ |
| `## Process Findings` near-miss that must **not** match | not in `BR6_SECTION_NAMES`; gloss-stripping is a no-op on it and it equals none of the five stripped names, so `canonicalSectionName` returns `null` | ✓ |

Case C's parenthetical is accurate on every clause, including the case-sensitivity one (the comparison
is `===` against frozen literals, never a `toLowerCase()`). The one wording I would tighten is
"returns null for a `###` line" — `canonicalSectionName` is never *called* on a `###` line, because
`findSectionExtents` only calls it on a `SECTION_HEADING_RE` match; the clause that follows
("which `^##[ \t]+` never matches") supplies the correct mechanism, so the sentence self-corrects and
I am not filing it.

**And the "if it lands red" arm is the part that makes this a test rule rather than an optimism.**
Case C does not merely predict green. It states what a red *means* — "it has found a real defect, not
staged a TDD red" — and what is owed: a fix commit before batch 14 runs, with a red surviving into
batch 14 being a gate failure. That is exactly the distinction the ledger exists to draw, preserved
under a case where the ledger is empty. From my lens this is the strongest sentence in the delta.

## Dependencies

## Verification

## Delta-Confirmation Findings

## Verdict
