# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md (v1.7)
**Date:** 2026-08-21
**Iteration:** 6 (delta confirmation, Phase T erratum round)
**Scope:** Local
**Previously reviewed at commit:** 7660f1ed7a554cdf51dbb05e5c60c15c61f713fc (v5, Approved with minor changes)
**Delta under review:** 1ec391c1, ea43a474, 5753de27 (13 insertions, 4 deletions, one file)

## Routed Items

Four routed items, three of which are the same observation raised by two reviewers. Both
distinct items landed.

| Item | Raised by | Landed? | Evidence |
|---|---|---|---|
| OB-F1: §10 records BL-04 "open and unmet — not discharged at FSPEC authoring", while §5's row read as discharged | pm-review, se-author | **Yes** | §5's BL-04 row (line 231) now opens "Checked at FSPEC authoring and found **unmet** — this row is not discharged (§10)". §10 (line 558) is unchanged and says the same thing. The two sites now agree on both the check and its outcome. |
| OB-1's worktree conclusion cites `.worktreeinclude`, untracked on the default branch; conclusion holds, evidence is consumer-local | pm-review, se-author (×3 phrasings) | **Yes, but the replacement evidence is itself wrong** — see F-01 | The literal filename is gone; OB-1 now reads "the worktree include list that carries `.claude/workflows/` into a worktree is consumer-local — untracked on the default branch, so a consumer fact and not a repo fact". The `git ls-tree -r origin/main` fact is correctly stated; the *reason* attached to it is not. |

The v1.7 erratum note in the header describes exactly these two edits and claims "nothing else
changed"; `git diff 7660f1ed..HEAD -- docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md` confirms it —
the only other hunks are the `Version | 1.7` cell and the erratum note itself. Nothing I approved
in v5 was disturbed: §1's mechanism inventory, REQ-WVR-01..10, §5's other blockers, the acceptance
criteria and the risk table are byte-identical.

The one v5 finding that was **not** in this round's routed list is my F-01 (the header base-note's
"owed before FSPEC authoring" versus §10's "owed before implementation"). §5's edit narrows the gap
— the outcome of the FSPEC-authoring check is now stated everywhere — but the header note's
*deadline* wording is untouched, so the two-deadline reading survives. It is inherited and
non-gating; carried below as F-03.

## Upstream Re-Grounding (DEC-ERR-03)

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
