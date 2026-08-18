# Cross-Review: test-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` (v0.7, 2026-08-18)
**Upstream re-read:** `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` v0.12 (sha256:41fb21e8…)
**Date:** 2026-08-18
**Iteration:** 10 (upstream-cascade confirmation; FSPEC bytes unchanged since v9 approval)

## Overview

Not a re-review. The FSPEC's own bytes are unchanged since the v9 approval
(`REVIEWED-COMMIT: fe306b11`); the upstream REQ moved from the approved
sha256:1038b816… (v0.11, commit `68e72db2`) to sha256:41fb21e8… (v0.12, commit `cc009367`).
This round answers one question: does the FSPEC still hold as a faithful compression of the
REQ as it now stands?

Method: re-read `CROSS-REVIEW-test-engineer-FSPEC-v9.md`, took
`git diff 68e72db2 cc009367 -- docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md`,
then re-read the *current* upstream text behind every FSPEC clause that leans on C-7, C-8,
AC-1.1 or the commit-ordering rules — not just the item the round announced. Scope is measured
against upstream at HEAD (DEC-ERR-03), so anything the FSPEC cites that the REQ no longer says,
or no longer says the same way, is in scope whether or not it was on the dispatch list.

## Upstream delta re-read

## Upstream delta re-read

The delta is a **pure addition** — no line of REQ v0.11 was deleted or reworded. Two hunks:

1. Version row `0.11 → 0.12` plus a changelog paragraph (one correction, SE erratum).
2. A new subsection under **C-7**, *"Held classes and the interim state"* (REQ :263–272),
   holding four claims: (a) C-7 governs the repo's own CI checks at each commit and **does not**
   govern this REQ's completion criteria, which are evaluated when the sweep is complete
   (AC-1.1's *given*); (b) while a deletion class is held, AC-1.1 being unsatisfied is an
   incomplete feature on an unmerged branch, not a C-7 red and not a registered expected failure;
   (c) "There is no skip-list, no expected-failure inventory and no tolerated-red register in this
   feature: C-8 already forbids that shape"; (d) where a check observing a held class would
   otherwise run red in repo CI before that class lands, the resolution is **ordering** — never
   registration — and the branch does not merge on a green subset.

Nothing the FSPEC quotes verbatim from the REQ changed: C-5, C-6, C-8, R-8, AC-1.1's
set-equality, AC-1.2's term set, AC-1.3, AC-5.2's eight run-variable collections and O-3's
manifest disposition are byte-identical to the text the v9 approval was taken against.

## Does the FSPEC still hold?

**Yes, with one wording tension recorded below.** Clause by clause, against the current upstream:

- **BR-SWEEP-2 "Green at every commit"** (:264–266) compresses C-7 as *every commit passes the
  L-9 gate command set when run at that commit*. The new subsection says exactly this and narrows
  nothing: it separates gate-greenness-per-commit from criterion-satisfaction-at-completion. The
  FSPEC never claimed a criterion is satisfied at every commit, so no clause is falsified.
- **AT-1.1** (:602–606) is stated *"Given HEAD after the sweep"*. That is the same evaluation
  point the REQ now makes explicit ("evaluated when the sweep is complete, AC-1.1's *given* says
  so"). The oracle is unchanged and still black-box checkable: `dist/` entry set **set-equals**
  `{pdlc-cli.mjs}`, or the directory is absent and the probe CLI exists at the single TSPEC path.
- **AT-1.8** (:664–669) drives the per-commit oracle — each commit checked out in turn, L-9's
  three commands run, each passes, each hunk belongs to one class. The addition endorses this
  shape and adds no per-commit obligation the AT would now miss.
- **§3.1's ordering column and BR-SWEEP-4** are precisely the mechanism the REQ now names as the
  sanctioned resolution ("the check becomes live with the class it covers"). Class 9's document
  oracles land *"same commit as, or after, class 7"*; class 7 lands after class 6; class 1 lands
  first and whole. A check observing a held class 7–12 therefore cannot be live before its class,
  which is what the new text requires — already spec'd, no edit needed.
- **The held set is class-consistent.** The REQ changelog's "classes 7–12" maps onto §3.1's
  numbering: AC-1.1's `dist/` set-equality is discharged by class 7 (bundles, manifest, the
  reduced build step), so classes 7–12 held ⇒ AC-1.1 unsatisfied, exactly as the REQ says. No
  renumbering is implied and no §3.1 row needs restating.
- **No FSPEC clause promises a green-subset merge.** AT-5.1 is scoped *"Given every deletion
  merged"*, and §2's BL rows gate the start of work, not a partial finish. The REQ's
  "branch does not merge on a green subset" adds a constraint the FSPEC already respects.

The one place where the new upstream prose and the FSPEC's wording pull against each other is
BR-SWEEP-6's sink-record exemption — F-01 below. It is recorded as Medium, not High: on the
paragraph's own framing the FSPEC's oracle remains the stricter one, and no acceptance test
changes its verdict under either reading.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
