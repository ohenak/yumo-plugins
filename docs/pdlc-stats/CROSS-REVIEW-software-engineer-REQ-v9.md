# Cross-Review: software-engineer — REQ (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-stats/REQ-pdlc-stats.md (v1.7)
**Date:** 2026-08-31
**Iteration:** 9 (erratum delta confirmation, not a full re-review)
**Scope:** Local
**Erratum commit:** e12b78fd8 — `docs(pdlc-stats): REQ v1.7 erratum — decide REQ-STATS-06 out-of-catalogue basename as harvested`

## Routed items

**Item 1 — REQ-STATS-06's "survivor" clause contradicted FSPEC BR-16 v1.7 / AT-17 leg 4 /
PROP-RATIO-08 leg 4 on the same `CROSS-REVIEW-{role}-REVIEW-v{N}.md` file. Landed, and decided
rather than papered over.**

The v1.6 sentence ("the predicate is set-membership over C-4's grammars, so a grammatical basename
outside the driver's document-type catalogue is a survivor even where REQ-STATS-03 reports it
malformed") is withdrawn in full. The replacement text evaluates the harvested predicate "over
exactly the file set whose bytes the process side sums", and states the outcome for the disputed
directory shape explicitly: a feature whose only `CROSS-REVIEW-` basenames are of that shape reports
**harvested**, not a measured ratio.

Three checks on the landing, all pass:

1. **It matches the downstream reading in substance.** FSPEC BR-16 v1.7: "It is evaluated over
   exactly the file set BR-14's numerator sums, so the two never disagree: a basename failing a
   grammar contributes no bytes to the process side and counts as no file remaining. A directory
   whose only `CROSS-REVIEW-` basenames are the out-of-catalogue
   `CROSS-REVIEW-{role}-REVIEW-v{N}.md` files BR-06 reports as malformed reports `harvested`, not a
   measured ratio." AT-17's fourth directory and its "the fourth not a measured ratio" clause now sit
   under a REQ that agrees, and PROP-RATIO-08 leg 4 inherits that agreement. The contradiction the
   item names is gone in the direction the downstream documents already took, so this landing owes no
   downstream edit.
2. **It agrees with the REQ's own neighbours.** REQ-STATS-03 (unchanged) already classifies exactly
   this shape as malformed and refuses a third bucket as an independent rule C-5 forbids; C-5
   (unchanged) forbids any parsing rule diverging from the driver's. The withdrawn clause was the one
   sentence in the document dissenting from both, and from REQ-STATS-06's own preceding rationale
   ("a family harvest deletes is gone from the numerator, so a computed value would silently
   undercount rather than be absent"). Withdrawal restores internal consistency rather than adding a
   rule, so the erratum note's "one clause decided, no rule added" is an accurate description of the
   diff.
3. **No orphaned references.** `grep` for "survivor" over the document returns only the erratum note
   quoting the withdrawn wording. NG-6, O-1, R-6, REQ-STATS-02 and REQ-STATS-05 carry no dependency
   on the survivor reading (their harvested-state text was settled in v1.5/v1.6 and is untouched
   here). Version bumped 1.6 to 1.7 with a changelog entry; +12/-3 lines, inside the round byte
   bound; the document is 319 lines / 21.8 KB, inside the REQ size budget.

## Upstream re-verification

The REQ is the root document, so "upstream" here is the shipped behaviour and project context the
new sentence leans on. Re-read at HEAD (e12b78fd8), not from the earlier round's memory:

- **The driver's document-type catalogue exists and is closed.**
  `pdlc/workflows/orchestrate-dev.js:10105-10113` — `REVIEW_DOC_TYPES` is a frozen six-member list
  (`REQ`, `FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES`, `DECISIONS`). `REVIEW` is not a member, so the new
  clause's premise ("a basename the driver's document-type catalogue does not recognise") is a real
  property of HEAD, not a doc-only invention.
- **That rejection is a per-file reason, not the coarse "not a cross-review" bucket.**
  `parseReviewFilename` (`orchestrate-dev.js:10134-10162`) returns `not_cross_review` only for a
  missing `CROSS-REVIEW-` prefix, and returns `bad_doc_type` for an out-of-catalogue doc type after a
  successful regex match. C-5's carve-out ("fidelity binds the driver's per-file rejection reason,
  not its coarser aggregate reject list") and REQ-STATS-03's malformed label therefore still describe
  HEAD accurately, which is what lets the new REQ-STATS-06 sentence say "the same one REQ-STATS-03
  reports malformed (C-5)" without inventing a rule.
- **The basename grammar the REQ defers to is still the documented one.**
  `pdlc/OPERATIONS.md:292` still documents cross-review files as
  `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md`, and still documents the harvest deletion record
  (`LEARNINGS`' required `Harvested from` row naming the deleted `CROSS-REVIEW-*` / `CODE_REVIEW-*` /
  `POSTMORTEM-*` files) that REQ-STATS-06's harvested predicate and NG-6 rest on. Nothing the REQ
  cites has moved.
- **Standing project context.** `docs/_constraints/DOMAIN-CONSTRAINTS.md` and `docs/_decisions/`
  carry no constraint or promoted decision on ratio semantics or out-of-catalogue basenames that the
  withdrawal contradicts; the erratum is consistent with DEC-ERR-03's routing model (a conflict
  decided in the owning document rather than reconciled downstream).

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | delta | local | REQ-STATS-06 now asserts the out-of-catalogue basename "contributes no process bytes", but C-4 — the constraint that defines the process side — still reads as a bare placeholder pattern (`CROSS-REVIEW-{role}-{doc-type}[-v{N}].md`) with no catalogue binding. The assertion is correct only through C-5's fidelity rule, which the sentence cites for the malformed label but not for the byte-set membership. A reader taking C-4's grammar literally gets the opposite answer for the numerator. Half a clause in C-4 ("matching per C-5, so an out-of-catalogue doc type is not a match") would make the byte set self-evident where it is defined. Not gating: REQ-STATS-06 states the observable outcome unambiguously, and FSPEC BR-14/AT-15 already pin the numerator behaviour. | §4 C-4, cross-read with §5 REQ-STATS-06 |

FINDING: Low | delta | local | §4 C-4 / REQ-STATS-06 | C-4's literal grammar text does not itself exclude out-of-catalogue doc types, so REQ-STATS-06's new "contributes no process bytes" claim is sound only via C-5; a clause in C-4 binding its grammar to C-5 would remove the reading where the numerator and the harvested predicate disagree

## Recommendation

**Approved with minor changes.**

The routed item lands cleanly and correctly: the contradiction with FSPEC BR-16 v1.7, AT-17 leg 4 and
PROP-RATIO-08 leg 4 is resolved by withdrawing the dissenting clause, not by adding a new rule, and
nothing previously approved breaks — no orphaned references, no propagation debt into NG-6, O-1, R-6,
REQ-STATS-02/03/05, and no divergence from HEAD's driver behaviour or `pdlc/OPERATIONS.md`. The one
finding is a Low readability/grounding nit in C-4 that the owning phase may fold into any later REQ
touch; it gates nothing and needs no round of its own.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}

APPROVAL-HASH: sha256:f75c348f299ebff8518b590f64668d054587c0c9d4d7ba442477e6fdfa7a8862
APPROVAL-HASH-NORMALIZED: sha256:f75c348f299ebff8518b590f64668d054587c0c9d4d7ba442477e6fdfa7a8862
REVIEWED-COMMIT: e12b78fd82c0d18c40f1700d8c79071c0b4c5e8e
