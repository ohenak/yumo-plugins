# Cross-Review: test-engineer — TSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 3 (upstream-cascade confirmation, not a re-review)

## Overview

This round is an **upstream-cascade confirmation**, not a re-review. TSPEC's own bytes are
unchanged since my v2 approval (`sha256:3cd713c0…`, `REVIEWED-COMMIT: 0c70e900`). What moved is
REQ: my v2 anchors pinned `UPSTREAM-STATE: REQ sha256:ad68cd05…`, and REQ at HEAD is
`sha256:17e83bfc…` (v1.7). FSPEC is unmoved — `sha256:1c05f511…` matches the byte-state my v2
anchors recorded — so nothing in this round touches the FSPEC-facing half of TSPEC.

The single question answered here: **does TSPEC still hold as approved against REQ v1.7?**

The REQ delta, read from `git diff 0c70e900 HEAD -- docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md`,
is four hunks and two substantive items:

| # | Hunk | Change |
|---|------|--------|
| 1 | header `Version` cell | `1.6` → `1.7` |
| 2 | §1 amendment block | new "Erratum, 2026-08-21 (v1.7) — Phase T erratum" paragraph naming the two items below |
| 3 | §5 BL-04 row | now reads "Checked at FSPEC authoring and found **unmet** — this row is not discharged (§10)", where it previously read as a neutral "Checked at FSPEC authoring:" |
| 4 | §9 OB-1 | the worktree conclusion's evidence is relabelled: the include list carrying `.claude/workflows/` is **consumer-local — untracked on the default branch, so a consumer fact and not a repo fact**, rather than the bare `.worktreeinclude lists only .claude/workflows/` assertion |

Both items are ones **this TSPEC itself raised** as upstream errata in its §6.3 (items 2 and 4).
The round landed them. That is the pleasant case for a confirmation: the upstream did not move
away from the document, it moved *toward* it. My verification below is nevertheless the full
DEC-ERR-03 one — I re-read the upstream text TSPEC leans on at its current version and asked
whether TSPEC is still a faithful compression of it, not merely whether the two items landed.

Outcome, stated up front: **TSPEC still holds.** No High, no Medium. Two Low findings, both
staleness in TSPEC §6.3 — the errata hand-off section — where TSPEC now describes an upstream
state that the round it asked for has superseded. Per DEC-ERR-01 these are the demoted class: a
false statement confined to a hand-off section, with no downstream test, oracle, or assertion
reading from it.

## Architecture

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Delta-Confirmation Findings

## Verdict
