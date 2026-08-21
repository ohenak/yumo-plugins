# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-wave-resume/FSPEC-pdlc-wave-resume.md (v1.2)
**Date:** 2026-08-21
**Iteration:** 5 (delta confirmation, erratum round)
**Scope:** Delta confirmation only — the erratum edit at `8b818309..05901a9c`, measured against REQ at HEAD (v1.7, sha256:17e83bfc…). Not a whole-document re-review.

## Delta Reviewed

Three commits, 14 insertions / 3 deletions, all inside the FSPEC:

| Commit | Section | Change |
|---|---|---|
| `8b818309` | header + §1 | Version cell `1.1` → `1.2`; "derives entirely from `REQ-pdlc-wave-resume.md` v1.5" → `v1.7` |
| `2290c121` | §3.4 | New paragraph: "An operator-pointed run records exactly as any other run does" |
| `05901a9c` | §7 | OB-F1's trailing clause rewritten; new "Erratum, v1.2 (Phase T)" note |

Nothing else in the document moved. I verified that by diffing the whole file across the
erratum window, not by reading the commit messages: the diff is 17 lines and every one of them
falls in the three sections above. No acceptance test, business rule, edge case or decision
table cell was touched, so nothing I approved in v4 has been disturbed by construction.

**A note on the dispatch's item list.** The dispatch describes the REQ at HEAD as **v1.6** and
says the stale cell should be corrected against v1.6. The REQ at the sha256 the dispatch itself
pins (`17e83bfc…`) carries `| Version | 1.7 |`, and its §10 amendment log records a v1.7 Phase T
erratum above the v1.6 entry. The FSPEC's new cell says **v1.7**, which matches the bytes at
HEAD. The item list is stale, the edit is correct, and I confirm against the file, not the list.
Flagged below as `Process`, Low — it cost nothing here but a dispatch that names the wrong
upstream version could have induced a correct document to be "corrected" backwards.

## Item-by-Item Confirmation

## Upstream Re-Grounding (DEC-ERR-03)

## Delta-Confirmation Findings

## Recommendation

## Verdict
