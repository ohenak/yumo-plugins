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

Re-grounding performed against the REQ at HEAD (v1.7), not against the version I reviewed at v4.
Every upstream claim this FSPEC now leans on was re-read at its current text:

| FSPEC claim | Upstream at HEAD | Verdict |
|---|---|---|
| §1: "derives entirely from `REQ-pdlc-wave-resume.md` v1.7" | REQ header `Version \| 1.7` | Accurate |
| §7 OB-F1: REQ "now records BL-04 as open and unmet in §5 and §10 (v1.7)" | REQ §5 BL-04 row: "Checked at FSPEC authoring and found **unmet** — this row is not discharged (§10)"; REQ §10: "BL-04 is **open and unmet** — not discharged at FSPEC" | Accurate in both cited sections; the earlier contradiction is gone |
| §1: BL-04's prerequisite is unmet, branch 1,637 commits behind | REQ §1 branch-base note (SE F-01, F-02) states the same count and the same conclusion | Consistent |
| BR-11 / EC-20: outcome (c)'s no-commit claim is scoped to the **implementation wave loop**, Phase PT's V-wave excluded | REQ-WVR-08, v1.6 rescoping: "The claim is scoped to that loop: Phase PT's appended verification wave, OF-1's 17th wave, is outside the resume record's scope and continues to dispatch, gate and commit on every invocation (FSPEC §2, EC-20)" | Faithful — including the "17th wave" figure, which matches REQ §4 OF-1 (16 plan waves + the appended V-wave) |
| BR-01 / AT-13: the outcome catalogue is closed at three | REQ-WVR-08 closing paragraph, unchanged at v1.7 | Faithful |
| BR-10: skipping skips dispatch only; the first executed wave's gate verifies the whole tree | REQ-WVR-08 "How REQ-WVR-03 is discharged here" and REQ OB-1's shipped-contract paragraph | Faithful |
| BR-04/05, §3.3, AT-05/06/07: explicit-pointer precedence and the two boundaries | REQ-WVR-04 including the TE F-01 boundary paragraph, unchanged at v1.7 | Faithful |
| BR-08 / §3.4: completion means committed, never merely verified | REQ-WVR-09, unchanged | Faithful |

**The v1.7-only item that could have gone stale and did not.** v1.7's second change relabels
OB-1's worktree include-list evidence as *consumer-local and untracked on the default branch —
a consumer fact, not a repo fact*. This FSPEC's only worktree-touching row is EC-17, which asserts
a worktree "that does not carry consumer-local state" and calls the outcome "consistent with the
standing worktree deferral". That reading survives the relabelling intact — EC-17 never claimed
the include list as a repo fact — so no edit is owed there. Its *citation* is a separate, minor
matter; see F-02.

## Behavioral Flow

## Business Rules

## Edge Cases and Error Scenarios

## Acceptance Tests

## Open Questions

## Delta-Confirmation Findings

## Verdict
