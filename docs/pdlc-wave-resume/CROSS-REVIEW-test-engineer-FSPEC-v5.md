# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/FSPEC-pdlc-wave-resume.md (v1.2)
**Upstream at HEAD:** docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md (v1.7, sha256:17e83bfc…8c79f)
**Date:** 2026-08-21
**Iteration:** 5 (delta confirmation, erratum round)
**Scope:** Delta confirmation only — the erratum edit `1dc235e0..HEAD`, plus this FSPEC's fidelity to the REQ at its current version (DEC-ERR-03). Not a full re-review.

## Overview

I previously approved this FSPEC (v4). A targeted erratum edit has landed (`8b818309`, `2290c121`,
`05901a9c` — diff `1dc235e0..HEAD`, +14/−3 lines). The question answered here is narrow: does the
delta resolve the routed items without breaking anything already approved, and is the document
still a faithful compression of the REQ **at HEAD**?

**Answer: yes.** All three routed items land, the edit is confined to the four places it claims
(`§1` version cell, `§3.4` new paragraph, `§7` OB-F1 row, `§7` erratum note), and nothing
previously approved is contradicted. Two non-gating findings are recorded: one testability gap
introduced by the delta itself (the new `§3.4` clause has no acceptance test that can falsify it),
and one inherited citation slip. No High findings.

**What the delta changed, verbatim scope:**

| Commit | Location | Change |
|---|---|---|
| `8b818309` | header table, §1 | `Version 1.1 → 1.2`; "derives entirely from REQ … v1.5" → "v1.7" |
| `2290c121` | §3.4 | new paragraph: "An operator-pointed run records exactly as any other run does" |
| `05901a9c` | §7 OB-F1 | "whose §10 records BL-04 as 'discharged at FSPEC authoring'" → "which now records BL-04 as open and unmet in §5 and §10 (v1.7)" |
| `05901a9c` | §7 | new "Erratum, v1.2 (Phase T)" note recording the three items |

Note on the dispatch brief: it names REQ **v1.6** as the upstream at HEAD, but the supplied
sha256 (`17e83bfc…`) is the file at HEAD and that file's header reads **v1.7** — a second Phase T
erratum (BL-04's row wording, OB-1's worktree-evidence labelling) landed after the brief was
written. I reviewed against the bytes, not the brief. The FSPEC's citation of **v1.7** is
therefore correct, not an overshoot; had it said v1.6 as the brief implied, that would itself
have been a finding.

## Linked Requirements

## Behavioral Flow

## Business Rules

## Edge Cases and Error Scenarios

## Acceptance Tests

## Open Questions

## Delta-Confirmation Findings

## Verdict
