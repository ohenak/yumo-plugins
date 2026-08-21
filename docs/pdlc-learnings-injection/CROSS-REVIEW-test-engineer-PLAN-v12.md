# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md (v0.9)
**Date:** 2026-08-21
**Iteration:** 12 (delta confirmation of the P-A-7 three-case lead-in / `renderSection` body-knob erratum)

## Overview

**What this round is.** A delta confirmation, not a re-review. I approved this PLAN at v0.5 (round 8),
v0.6 (round 9), v0.7 (round 10) and confirmed v0.8 (round 11, three Low findings, no High). A targeted
erratum has since landed taking the document to v0.9. The dispatch names one item — P-A-7's lead-in
still read *"in the two cases that can arise"* above a table v0.8 grew to three rows — which is my own
round-11 F-01 verbatim, raised independently by pm-review. The commit also carries a second correction
I raised at round 10 (F-01): LI-08's amendment note claimed `renderSection`'s `ordinal`, `gloss` and
`body` knobs were "all three unexercised by any landed suite", which is false for `body` at HEAD.

**The delta, measured.** `git show ba120270` is **4 insertions, 3 deletions in one file** — the version
cell (0.8 → 0.9), the P-A-7 lead-in sentence, the `renderSection` clause inside LI-08's amendment note,
and the 0.9 changelog row. I re-derived that from the diff rather than trusting the changelog's own
summary of it: **no task row moved batch, no `Deps` edge changed, no AT partition, fixture or
single-writer manifest row was touched, the batches 7–13 expected-red ledger is byte-identical, and the
case A/B/C table's own three rows are byte-identical.** The changelog's closing claim to exactly that
effect is accurate.

**Upstream, re-read at HEAD.** I re-hashed the four dispatch documents rather than assuming. `shasum
-a 256` returns REQ `ff605dd3…`, FSPEC `ae75fa62…`, TSPEC `22dee8ce…`, DECISIONS `56617f5a…` —
byte-identical to the four hashes this dispatch pins and to what I recorded at rounds 10 and 11.
Upstream has not moved a byte since the version I approved, so the faithful-compression verification
from rounds 8 through 11 stands for every unchanged section, and the fresh checking this round needs is
confined to the two edited sentences. Both are claims about **HEAD code**, not about upstream prose, so
I checked them against the test files rather than against the documents (DEC-ERR-03 still applies: the
scope is the PLAN against upstream, and I re-verified that nothing this PLAN cites has moved).

**Result.** Both items land, and the second one lands *correctly* — which was the live risk, because a
correction that merely swaps one false factual claim for another is worse than the claim it replaced.
It does not. **No High finding.** Three Low findings: one stale sibling claim in the v0.7 changelog row
that this edit newly contradicts, and my two round-11 Lows (the batch-13 gap between case headers, and
P-A-6's foreclosed fallback clause) carried forward unchanged as `inherited`.

## Batches

**No task row changed, so the batch table is out of scope by measurement rather than by assertion.**
The diff touches exactly two prose spans and the changelog. All twenty-two task rows keep their `Batch`
value, their `Deps` cell, their file-ownership cell and their `Status` cell byte-for-byte; the
`[Fake first]` ordering, the red-before-green pairing and the single-writer manifest are unchanged from
the v0.8 bytes I confirmed at round 11. I re-ran the batch-DAG derivation only far enough to confirm
the diff could not have perturbed it: `git show ba120270` reports one changed row (LI-08) and the
change is confined to a parenthetical inside that row's prose cell, leaving `Batch = 3`, `Deps = LI-02`
and the file cell `__tests__/learningsBlock.test.js` intact.

**The LI-08 edit, checked against HEAD rather than against the prose.** The corrected sentence now
claims three separable facts, and each is falsifiable at HEAD:

1. *`ordinal` and `gloss` are unexercised by any landed suite.* `grep -rn "ordinal\|gloss"
   pdlc/workflows/__tests__/` returns hits only inside `helpers/learningsFixtures.js` — the JSDoc at
   lines 57–59 and the render logic at 65–68. No test file passes either key. **True.**
2. *`learningsBlock.test.js` passes `body:` on all six of its section specs.* Lines 77–82 of that file
   are six section objects, each carrying `body:` (`Process Learnings`, `Approval Record`, `Open Items
   for Consolidation`, `Cross-Feature Patterns`, `Rejected Proposals (with rationale)`,
   `Non-Convergences`). Six specs, six `body:` keys, no seventh spec elsewhere in the file. **True, and
   exactly six — the numeral is right, not rounded.**
3. *`learningsSelect.test.js` passes it on the non-BR-6 section.* Line 497:
   `sections: [{ name: "Not A BR-6 Section", body: "Nothing here BR-6 recognises." }]`. One occurrence,
   and it is the non-BR-6 section. **True.**

This is the check that mattered. The v0.7 note's error was a factual claim about the landed corpus that
nobody had grepped; the repair is only worth having if it was grepped, and the numerals in it are
specific enough (`six`, `the non-BR-6 section`) that a wrong one would have been visible. They are not
wrong. The conclusion the note draws is also unchanged and, as the changelog says, strengthened: the
amendment adds callers for two knobs that already exist and reuses a third that landed suites already
drive, so it grows **no new fixture parameters**. That is the claim my lens cares about, because a new
fixture parameter would put `helpers/learningsFixtures.js` back in scope as an edited file and reopen
the single-writer question the closing "no row of their own" paragraph settles. It stays settled.

## Dependencies

**No `Deps` edge changed.** The dependency graph is byte-identical to v0.8: same edges, same acyclicity,
same unique ids, every dependency resolving to a declared task. Nothing in this delta could have moved
it, and the diff confirms nothing did.

**The lead-in fix, checked as a gate input.** P-A-7's paragraph is not decoration — it is the rule the
dispatcher applies when deciding whether an amendment commit to a landed suite owes an expected-red
ledger row. A lead-in that announces "two cases" above a three-case table invites a reader to stop at
case B, and case B is precisely the case that does **not** apply at HEAD. The repaired sentence now
reads "in the three cases that can arise (A, B and C below)", which fixes the numeral and adds an
explicit roster. The roster is the better half of the fix: the numeral alone would go stale again the
next time the table grows, whereas "(A, B and C below)" names the rows a reader must reach. The three
table rows themselves are untouched, so case C — the case live at HEAD, where the ledger stays empty
and the amendment is expected to land green — retains the wording I confirmed at round 11.

**What the delta did not disturb.** Case A's derived pre-batch-7 window, case B's re-scoping to batches
9–12, case C's mechanism citation into shipped `canonicalSectionName` / `SECTION_HEADING_RE` behaviour,
and the closing paragraph's scoping of the "no row of their own" ruling to *this* follow-up commit all
survive unedited. I re-read case C's production-half citation once more against HEAD to be sure the
delta had not orphaned it — `canonicalSectionName` still strips an optional ordinal, strips an optional
trailing gloss, compares case-sensitively against `BR6_SECTION_NAMES`, and `^##[ \t]+` still never
matches a `###` line — so the "expected to land green" ruling still rests on shipped code rather than
on hope, exactly as it did at v0.8.

**The one dependency-shaped consequence still open.** My round-11 F-02 stands unedited: case B's header
now bounds at batch 12 and case C's header opens "after batch 13", leaving **batch 13 itself** claimed
by no header. Case C's second header clause (*"any commit landing once LI-21 (`92b7ea0c`) has landed"*)
closes the gap in practice, since LI-21 *is* batch 13 and it has landed — which is why this stays Low
rather than rising. It is a wording gap in a rule table, not a live ambiguity: at HEAD there is exactly
one case a dispatcher can be in, and it is C. I carry it forward as `inherited` below.

## Verification

## Delta-Confirmation Findings

## Verdict
