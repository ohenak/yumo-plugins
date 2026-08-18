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

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
