# Cross-Review: test-engineer — FSPEC (delta confirmation, round v13)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (v0.11)
**Date:** 2026-08-20
**Iteration:** 13

## Overview

Delta confirmation of the v0.11 erratum against the FSPEC I approved at v12 (reviewed commit
`9a4b7593`). The delta is `9a4b7593..1b4dc3de`, +25/-11, touching four loci: the header version
cell, an appended v0.11 revision note (FSPEC:53-59), BR-1's rule sentence (FSPEC:284-291),
BR-15's expected-set bullet (FSPEC:679-684), and the two acceptance tests that transcribe those
two rules (AT-02 FSPEC:784, AT-33 FSPEC:937-941). Nothing else moved a byte, so the ordering,
bounding, config, record and edge-case material I approved at v12 is untouched.

Upstream REQ at HEAD hashes to `ff605dd3…92e84dd`, matching the dispatch digest exactly, so no
upstream sentence has shifted under this FSPEC since my last round. I re-read REQ C-1
(REQ:151-161), AC-1.1/AC-1.2 (REQ:250-262), NG-5 (REQ:142-143) and AC-5.2 (REQ:397-403) against
the delta rather than trusting the erratum note.

**All four routed items land.** BR-1 now carries C-1's second conjunct, BR-15 drops the
enumeration and states an enumerable equality, and AT-02/AT-33 track both. What remains is three
non-gating findings: one inherited compression loss in the decision table (the erratum fixed BR-1
but left D-2 stating the one-conjunct version of the same rule), and two Low precision nits inside
the edited bullets. No High. Nothing I previously approved is broken by this delta.

## Linked Requirements

The delta's citations resolve to live upstream text at HEAD:

- **REQ C-1** (REQ:151-161) reads "every dispatch the pipeline tags `dispatchKind: "authoring"`
  at HEAD … **whose target document is REQ, FSPEC, TSPEC, PLAN, DECISIONS or PROPERTIES**". BR-1's
  new sentence is a faithful compression of both conjuncts, in C-1's own order, and keeps C-1's
  "rule over the taxonomy, not a hand-counted set of six" framing in the following sentence — the
  distinction C-1 spends a paragraph on and the reason a fixed count is not the oracle.
- **REQ AC-1.2** (REQ:256-262) names the outside set explicitly, including "any dispatch the
  pipeline tags authoring whose target is none of C-1's six document types — the code-review
  phase's optimizer at HEAD". BR-1's third sentence and the v0.11 note cite exactly that clause,
  in the same words, for the same case. The citation is not a nonexistent authority.
- **REQ NG-5** (REQ:142-143) scopes non-application to "C-1's rule", which is now the two-conjunct
  rule BR-1 states — the FSPEC's NG-5 reference at BR-1 and at FSPEC:765 stays accurate.
- **REQ AC-5.2** (REQ:397-403) claims "the corpus paths touched are exactly the reads of the
  documents AC-3.1 and AC-3.2 name — a positive membership claim, not an absence-only one". BR-15's
  revised expected set is that claim made enumerable; dropping the corpus enumeration does not drop
  an upstream member, because AC-5.2's set is defined over *documents named by the record*, and the
  `git ls-files`-shaped enumeration names no document read under `docs/`.

No citation in the delta points at text upstream no longer carries, and the FSPEC's traceability
rows (FSPEC:139-140, `AC-1.1 → BR-1 → AT-01`, `AC-1.2 → BR-1, BR-11 → AT-02, AT-03`) still resolve.

## Behavioral Flow

Not in the diff, and this is where the delta's one loose end sits. The flow's Step 0 item 5
(FSPEC:195-197) still reads "If the dispatch is **not** one C-1 names as authoring, the flow stops
here with no record (BR-1)". That sentence survives the erratum because it delegates to C-1 rather
than restating it, and C-1's rule is now the two-conjunct one — so it is accurate, if elliptical.

The **decision table** does not survive as cleanly. `D-2 | Is this dispatch an authoring dispatch?
| yes / no | BR-1` (FSPEC:265) is the one-conjunct compression of exactly the rule this erratum
just corrected one section below. That matters more than a wording nit here, because the table is
load-bearing for coverage: FSPEC:277-278 states "Every branch in this table has at least one
acceptance test (DC-05)", so the table is the branch catalogue an implementer maps tests from. As
written, the discriminating case — authoring-classified, target document not one of the six — is
not a branch of any D-row, so the table's own gate demands no test for it. An implementation that
drops the `docType` conjunct satisfies every branch D-2 names.

The exposure is real but bounded, which is why this is Medium and not High: AT-02's universe is
"every agent invocation the run makes", so a full scripted run containing a code-review phase does
put the discriminating dispatch in the universe, and TSPEC §A.2 (P-2b/P-2c, `LEARNINGS_TARGET_DOCTYPES`,
the offered-vs-accepted `docType` set-equality at TSPEC:193-204) carries the case explicitly with
its own falsifiable oracle. The fix is a one-line table edit: give D-2 the two-conjunct question, or
split the target-document test into its own D-row so the branch that must red has a name (F-01).

Nothing else in §Behavioral Flow — Steps 1 through N, the ordering and bounding steps, the
per-dispatch record locus — was touched, and all of it still matches REQ v0.9 as checked at v12.

## Business Rules

**BR-1 (edited).** The rewrite is the right shape for a testable rule: an explicit biconditional
with both conjuncts named, evaluated "at the moment it is composed", each conjunct sourced to a
pipeline value rather than a list this feature maintains. The added third sentence does the work a
reviewer most wants — it names the *discriminating instance* (the code-review phase's optimizer
round at HEAD) rather than leaving the conjunct abstract, so a test author knows which dispatch must
appear in the fixture universe for the conjunct to be falsifiable at all. The "Included"/"Excluded"
bullets below are unchanged and remain consistent: they were already an illustration read off the
classification, and the erratum's new sentence is what now tells a reader they are not the rule.

The `A-2` assumption (FSPEC:995) still frames the rule as consuming "the pipeline's existing
authoring classification". With BR-1 now consuming two pipeline values, A-2 under-describes it
slightly, but A-2's claim — stability of the consumed values, widening is explicit — holds equally
of both conjuncts, so this is not a finding.

**BR-15 (edited).** Both halves of the correction land. The corpus enumeration is removed from the
expected set *and* the removal is justified in place against the instrument's definition ("it opens
no file under `docs/`, so this instrument does not see it") rather than silently deleted — the
justification is what stops a later reader restoring the member. "Membership is therefore fully
enumerable from the report alone, so a test may transcribe it as an equality" is exactly the
property PLAN LI-11 needs to transcribe, and it makes the anti-echo discipline available here too:
the expected side comes from the report, not from re-running the selector.

One precision nit remains inside the edited bullet. "**exactly** one open attempt for every corpus
document …" is multiset phrasing, while the observed side (FSPEC:678) and AT-33 are both set
equalities over file-open calls under `docs/`. If the production path opens a selected document
twice — a size probe then a read, or a re-read after ordering — a multiset reading reds and a set
reading greens, and the FSPEC does not say which the oracle is. REQ AC-5.2 claims paths, not counts,
so the set reading is the faithful one; say so, or state that at most one open per path is itself
part of the claim (F-02).

BR-2 through BR-14 and BR-16 are outside the diff and unchanged from the bytes I approved at v12.
## Edge Cases and Error Scenarios

## Acceptance Tests

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
