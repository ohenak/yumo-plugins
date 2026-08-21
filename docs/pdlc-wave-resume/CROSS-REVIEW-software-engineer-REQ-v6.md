# Cross-Review: software-engineer — REQ (delta confirmation, round v6)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md (v1.7)
**Date:** 2026-08-21
**Iteration:** 6
**Round type:** Delta confirmation (Phase T erratum)
**Scope:** Local — REQ v1.7 delta against v1.6 (reviewed commit `7660f1ed`), plus DEC-ERR-03 upstream re-grounding at HEAD

## Problem / Context

This is a **delta confirmation**, not a fresh review. I approved this REQ at v1.6 (round v5,
`REVIEWED-COMMIT: 7660f1ed`, *Approved with minor changes*). A Phase T erratum round has since
landed three commits touching this document:

| Commit | Change |
|---|---|
| `1ec391c1` | §5's BL-04 row restated: the FSPEC-authoring check was performed and found **unmet**; the row is explicitly *not* discharged, cross-referencing §10 |
| `ea43a474` | §9 OB-1's worktree conclusion relabels its include-list evidence as consumer-local and untracked on the default branch, rather than a repo fact |
| `5753de27` | Frontmatter version 1.6 → 1.7 and a new v1.7 erratum changelog paragraph recording exactly those two items |

`git diff 7660f1ed..HEAD -- docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md` is four hunks and
nothing else: the version cell, the changelog paragraph, the BL-04 row, and the OB-1 worktree
clause. No requirement id, acceptance criterion, invariant, or measured-fact citation moved.

The four routed items reduce to two distinct defects — one BL-04/§10 contradiction (OB-F1, raised
by pm-review and se-author) and one over-claimed worktree evidence citation (raised three times
across pm-review and se-author). Both are addressed below, and per DEC-ERR-03 I re-grounded the
upstream facts this REQ now leans on at their current HEAD state rather than accepting the item
list as the whole scope.

## Goals

## Non-Goals

## Constraints

## Acceptance Criteria

## Risks

## Obligations

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
