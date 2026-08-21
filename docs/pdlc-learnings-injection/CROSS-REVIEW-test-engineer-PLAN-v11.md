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

**The batch DAG is untouched, and I re-derived it anyway.** The dispatcher reads the `Batch` column,
and a case-table edit is exactly the kind of change that *looks* like it cannot move a batch. It did
not: `git diff` shows no `Deps` cell and no `Batch` cell in the delta. The derivation I published at
round 10 (`batch == max(dep batch) + 1` for all twenty-two ids, unique ids, every dependency
resolving, no cycle, fourteen batches) therefore still holds line for line, and I am not restating the
table.

**What the delta *does* touch is a dependency of a different kind — the case partition over batches,**
which is a total function only if every landing batch falls in exactly one case. That is worth
deriving mechanically, because the delta re-scoped one case's domain and added another:

| Landing batch | Case whose header claims it | Covered? |
|---|---|---|
| 1–6 | A — "before batch 7" | ✓ |
| 7, 8 | none by header | body of A covers the outcome; header does not |
| 9–12 | B — "batch 9 through batch 12" | ✓ |
| 13 | none by header (B ends at 12, C is "after batch 13") | gap |
| 14+ | C — "after batch 13 … any commit landing once LI-21 (`92b7ea0c`) has landed" | ✓ |

Two seams, both **vacuous at HEAD** and neither reachable by any future commit: batches 7, 8 and 13
are all behind us, so
no commit can land in them (LI-16 `d462ddd8`, LI-17 `2cbacada` and LI-21 `92b7ea0c` are all in `git log`). Case A's body already reasons explicitly about batches 7 and 8 ("the
ledger already lists it as a **whole suite** red after batches 7 and 8"), so the 7/8 seam is a header
that under-claims what the body decides, not a missing rule. The batch-13 seam is a true partition
gap introduced by re-scoping B's upper bound from "or later" to "through batch 12" — but case C's
*second* header clause ("any commit landing once LI-21 has landed") closes it in practice, since
LI-21 **is** batch 13's task: a commit landing in batch 13 lands once LI-21 has landed. I file this
as **Low, delta, local** — it costs a reader one inference and cannot mislead an implementer at HEAD.

**One cross-reference the delta supersedes without updating.** §Open questions' **P-A-6** row still
reads: the PROPERTIES *suite* "lands in one commit once green, **or else its red rows are amended into
the ledger by name first (P-A-7)**". That fallback branch was well-formed while case B was live. Under
case C it is not: there is no ledger left to amend into (the PLAN's own ledger "reaches empty at batch
13"), and case C rules that such an amendment owes **green**, not a row. PROPERTIES §C.4 reads this
seam correctly and keeps P-A-6 and P-A-7 distinct, and P-A-6 cites P-A-7 by name so a reader following
the citation lands on case C and gets the right answer — which is why this is **Low, delta, nonlocal**
rather than a contradiction that could mislead. The one-clause repair is to have P-A-6's fallback read
"or else its rows are handled under P-A-7's governing case" instead of naming the ledger amendment as
the only alternative.

**The PROPERTIES routing added by the delta is correct at the seam.** Case C now names the
PROPERTIES-driven re-reds that §C.4 routes to this PLAN — PROP-BOUND-03's `maxBytesPerDocument <= 0`
case, PROP-BOUND-05/07/08, and the Group D amendments to the landed `learningsSelect.test.js` — and
rules that they owe no ledger row and owe green. I checked that against PROPERTIES §C.4 at HEAD rather
than accepting the citation: §C.4 routes **exactly two** gaps to this PLAN as errata, in these words —
case B's named row "covers `LI-AT-11`'s heading-form cases only, so PROP-BOUND-03's `maxBytes <= 0`
case has no named row", and "its span ends at 'the batch that greens them', which no remaining batch
is". The delta lands **both**: case C dissolves the first (no row is owed by anything under case C, so
a row that does not cover PROP-BOUND-03 is no longer a gap) and answers the second. The four
properties §C.4 names are the four case C names, and the file it names them landing in
(`learningsBlock.test.js`, plus `learningsSelect.test.js` for Group D) matches. Faithful compression.

## Verification

**The six routed raises, item by item.** All six name the same defect from three lenses, so I checked
the single repair against each raise's own wording rather than collapsing them:

| Raised by | The item | Landed? |
|---|---|---|
| pm-review | case B's table terminates at "the batch that greens them"; case B needs a post-terminal-batch reading, or a statement that the amendment is expected to land green | ✓ both — case C supplies the post-terminal reading **and** states the amendment is expected to land green, with a mechanism |
| te-author | state the terminating condition for an amendment landing after batch 13, and whether the heading-form amendment is now expected to land green (PM Q-02) | ✓ terminating condition is batch 14's unqualified gate ("green at the commit that lands it"); Q-02 answered "yes", grounded in shipped `canonicalSectionName` |
| pm-review | LI-16/LI-17/LI-21 have all landed; the span has no terminus at HEAD | ✓ case B re-bounded to 9–12 where a terminus exists; C governs HEAD |
| se-review | batches 7–13 are behind us and LI-22 adds no assertions — no terminating batch | ✓ named exactly: "batch 14 is LI-22's REFACTOR-and-close, which adds no assertions" |
| te-author | with LI-17 and LI-21 landed no remaining batch greens them | ✓ same repair |
| pm-review | case B's row scoped to a span with no terminus for an amendment landing now | ✓ same repair |

Necessary and, on my reading, sufficient: the repair does not merely acknowledge the missing terminus,
it supplies a **different, checkable obligation** in its place, which is what a gate-input rule needs.

**The TE v9 F-01 scoping repair rides along and is correct.** The closing paragraph's "no row of their
own" ruling now reads "in any of the three cases — a ruling scoped to **this** heading-form follow-up
commit, not a standing exemption for those files", and the additivity premise now branches: a
non-additive future amendment enters the ledger under case B's rule "or, once batch 13 is behind us,
under **case C**, where the obligation is green-at-landing rather than a ledger row." That is the
right repair to the finding I filed at round 9 — it closes the "standing exemption" reading without
weakening the additivity argument, and it routes the non-additive future case into the same partition
the delta just built rather than leaving it dangling.

**The exemption-list guard is intact.** "No exemption list grows during this feature. The two
exclusions in §The measured baseline are the arrangement's … Adding a third to make a batch pass is a
halt condition" is byte-identical in the delta. That matters here: case C rules the ledger stays
**empty**, and an empty ledger plus a growable exemption list would be a false-green pair. It is not
growable, so the unqualified batch-14 gate is still the real oracle.

**One lead-in the delta did not update.** The paragraph introducing the table still reads "its
expected-red rows are named here, ahead of the run they govern, in the **two** cases that can arise",
immediately above a three-row table. Purely a stale numeral — the table itself is the contract and it
is complete — but it is a factual miscount introduced by this delta, so I file it **Low, delta,
local**. One-word fix: "two" → "three".

**Re-carried from round 10, not re-litigated.** Two prior findings against v0.7 remain open and remain
non-gating; the delta was scoped elsewhere and did not touch either. F-01 (Medium): LI-08's amendment
note says `renderSection` accepts `ordinal`, `gloss` and a free-form `body`, "all three unexercised by
any landed suite" — `body` is exercised (`learningsBlock.test.js:77-82`, `learningsSelect.test.js:375`),
though the clause's conclusion survives. F-02 (Low): round-9's scope note on P-A-7's generic title. I
re-record them here for the ledger rather than re-filing them as this round's findings, since a delta
confirmation's findings table is about the delta.

**And the implementation defect I deferred at round 10 is still live at HEAD — and case C now handles
it correctly, which is worth stating.** `selectLearnings` (`pdlc/workflows/orchestrate-dev.js`) still
gates the `RSN-NO-MATERIAL` drop on `extraction.sections.length === 0 && hasAnySectionHeadingLine(
entry.text)` — the second branch condition TSPEC §D.5 explicitly forbids ("one branch … no second
branch and no zero-bound special case in the selector"). A PROPERTIES amendment faithful to §D.5 could
therefore land **red** at HEAD. Under v0.7's case B that red had nowhere to go. Under case C it does:
"it has found a real defect, not staged a TDD red … the fix commit is owed before batch 14 runs." So
the delta does not just close a wording gap — it gives the one known live divergence a defined
landing. The defect itself is against an already-landed task and out of scope for this document; I
carry it forward as a `DEFERRED:` line rather than folding it into this verdict.

DEFERRED: `selectLearnings`'s `RSN-NO-MATERIAL` drop carries a second branch condition
(`&& hasAnySectionHeadingLine(entry.text)`) that TSPEC §D.5 forbids — an implementation defect against
landed LI-16, still present at HEAD, first reported in CROSS-REVIEW-test-engineer-PLAN-v10.md.

## Questions

None. PM Q-02 — is the heading-form amendment now expected to land green — is answered by case C, and
I verified the answer against the shipped `canonicalSectionName` / `SECTION_HEADING_RE` / `GLOSS_RE` /
`BR6_SECTION_NAMES` mechanism rather than accepting the claim.

## Positive Observations

- The repair is structural, not cosmetic: rather than stretching case B's span to a batch that greens
  nothing, it bounds B to the window where its own wording is well-formed and gives the live window
  its own case with its own **checkable** terminating condition (batch 14's unqualified gate).
- Case C's green claim is a mechanism citation into shipped code, and every clause of it verifies:
  ordinal optional in the regex group, gloss stripped on both sides of the comparison, `===` against
  frozen literals (case-sensitive), `^##[ \t]+` structurally unable to match a `###` line, and
  `## Process Findings` canonicalising to `null`. Four of `LI-AT-11`'s four heading-form cases green.
- The "if it lands red" arm is what makes this a test rule rather than optimism — it names the red as
  a real defect, owes a fix before batch 14, and calls a red surviving into batch 14 a gate failure.
- Case C gives the one known live divergence at HEAD (`selectLearnings`'s forbidden second branch) a
  defined landing it did not have under case B.
- The delta is surgical: no task moved batch, no `Deps` edge changed, no AT partition, fixture or
  manifest row was touched, and the batches 7–13 ledger is byte-identical — as its changelog claims.
- The TE v9 F-01 repair scopes the "no row of their own" ruling to this commit and routes the
  non-additive future case into the same three-case partition rather than leaving it dangling.

## Recommendation

**Approved with minor changes** — the delta resolves all six routed items and breaks nothing I
previously approved. Three Low findings, all wording-level consequences of splitting a two-case table
into three, none of which changes what an implementer does at HEAD.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | delta | local | The lead-in above the P-A-7 table still says the rows are named "in the **two** cases that can arise", but the delta made it three (A, B, C). Stale numeral only — the table is the contract and is complete. Fix: "two" → "three" | §The three gate wordings → P-A-7 lead-in |
| F-02 | Low | delta | local | Re-scoping case B's upper bound from "batch 9 or later" to "batch 9 through batch 12" leaves **batch 13** claimed by no case header (B ends at 12, C reads "after batch 13"); batches 7–8 are likewise unclaimed by A's "before batch 7" header though A's body decides them. Both seams are vacuous at HEAD (those batches have landed) and C's second header clause "any commit landing once LI-21 has landed" closes 13 in practice. Fix: read C's domain as "batch 13 or later" | §The three gate wordings → P-A-7 case table, cases A/B/C headers |
| F-03 | Low | delta | nonlocal | §Open questions' P-A-6 row still offers "or else its red rows are amended into the ledger by name first (P-A-7)" as the PROPERTIES suite's fallback, a branch case C forecloses — after batch 13 there is no ledger to amend into and the obligation is green-at-landing. P-A-6 cites P-A-7 by name so a reader reaches the right rule; the repair is one clause: "or else its rows are handled under P-A-7's governing case" | §Open questions → P-A-6 |

FINDING: Low | delta | local | §The three gate wordings → P-A-7 lead-in | the lead-in still says "in the two cases that can arise" above a three-row table (A, B, C) — stale numeral, fix is "two" → "three"
FINDING: Low | delta | local | §The three gate wordings → P-A-7 case table headers | re-scoping case B to "batch 9 through batch 12" leaves batch 13 claimed by no case header (C reads "after batch 13"); vacuous at HEAD since batch 13 has landed and C's "once LI-21 has landed" clause closes it — fix is to read C's domain as "batch 13 or later"
FINDING: Low | delta | nonlocal | §Open questions → P-A-6 | P-A-6 still offers "its red rows are amended into the ledger by name first (P-A-7)" as the PROPERTIES suite's fallback, a branch case C forecloses (no ledger remains after batch 13; the obligation is green-at-landing)

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}
