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

Untouched by this delta — no E-row is inside the diff hunks. I checked the two E-rows the edited
rules could have stranded:

- **E-06 / `RSN-SELF`** — BR-15's expected set still carves out `RSN-SELF` documents as "decided
  from the path before any read", and AT-04 still requires the per-document `RSN-SELF` row with no
  corpus-level `RSN-EMPTY`. The erratum did not disturb the carve-out, and it remains the one place
  a report-named document is legitimately absent from the read set.
- **`RSN-UNREADABLE`** — still explicitly *inside* the expected set ("the failed attempt is the
  read"). This is the conjunct that keeps the equality falsifiable in the failure direction: an
  implementation that skips unreadable documents entirely would red. Preserved verbatim.

No edge case gains or loses an owner from the BR-1 change either: the excluded-dispatch states are
byte-identity claims (BR-11 / AT-03), and widening BR-1's exclusion by one more dispatch shape only
widens the population AT-03 already covers.

## Acceptance Tests

Both edited ATs track their rules, and neither loses falsifiability.

**AT-02.** "the subset carrying a block **equals** the subset BR-1's two-conjunct rule names" now
points at the corrected rule instead of "BR-1's classification", and the universe clause ("the whole
dispatch universe, not only those already classified authoring") was already the right one — it is
what makes the second conjunct observable at all, since a universe restricted to authoring-classified
dispatches could never exhibit an over-injection.

The gap is the fixture list, which the erratum left unchanged: "a run with no DECISIONS phase, a run
whose Phase R has no creator, and a run with five optimizer rounds". Those three fixtures discriminate
*the first* conjunct and the no-fixed-count property. None of them is named for the case the new
second conjunct exists to decide — an authoring-tagged dispatch whose target is none of the six, i.e.
the code-review phase's optimizer round. BR-1's prose names that instance three lines above; AT-02
should name it as a fixture, so that reverting the `docType` conjunct is guaranteed to red rather
than guaranteed-if-the-base-run-happens-to-include-Phase-CR (F-03). This is Low, not High, because the
universe clause plus a realistic scripted run does contain the dispatch, and TSPEC §A.2 pins the case
with a dedicated offered-vs-accepted `docType` set equality.

**AT-33.** The expected set is transcribed consistently with BR-15's new bullet, including the
"enumeration of candidate paths contributing no member" clause, and the three positive conjuncts I
cared about at v12 survive: the observed set is asserted **non-empty** (the control that stops
AT-34's absence claim being vacuous), the equality is against an enumerable expected set, and the
write-side boundary claims are unchanged. AT-34 still names AT-33 as its same-instrument, same-test
control. The one cosmetic casualty is line wrapping — FSPEC:941 now runs well past the document's
column width mid-clause; worth a re-wrap on the next touch, not a finding.

AT-01, AT-03 through AT-32, AT-34 and AT-35 are byte-identical to the bytes I approved at v12, and
the §Branch coverage check paragraph still asserts every E-row names an AT.

## Open Questions

No new question. My one carried `DEFERRED:` item is unchanged and still non-blocking: BR-9's notice
catalogue leaves its emission locus unstated, routed to TSPEC. This delta neither addresses nor
disturbs it.

One heads-up for the TSPEC round rather than a finding on this document: TSPEC:1305-1307 describes
the FSPEC's expected set as "every authoring-classified dispatch, including Phase CR's optimizer"
and frames the `docType` conjunct as something "TSPEC therefore adds". With FSPEC v0.11 that
description is stale — the two expected sets no longer differ, and the TSPEC's account of the
divergence should be re-grounded on these bytes when it is next revised.

## Positive Observations

- The BR-1 rewrite names the discriminating instance, not just the conjunct. A rule that says which
  dispatch must appear in the fixture universe is a rule someone can write a red test from; a rule
  that only states the predicate is not.
- BR-15's removal is justified against the instrument's own definition rather than performed
  silently. That is the form that survives the next reader, who would otherwise "fix" the missing
  enumeration back in.
- The erratum touched the two ATs that transcribe the corrected rules in the same edit. Rule-and-
  oracle drift is the classic erratum failure mode, and it did not happen here.
- Both corrections move the document *toward* enumerable equalities and away from prose predicates —
  the direction that makes PLAN LI-11's transcription mechanical rather than interpretive.
## Recommendation

## Delta-Confirmation Findings

## Verdict
