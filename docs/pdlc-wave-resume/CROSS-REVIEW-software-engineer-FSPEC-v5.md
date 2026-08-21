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

The dispatch lists seven bullets, but they are three distinct items restated: the stale version
cell, the OB-F1 misreading of REQ §10, and the missing operator-pointer recording clause. All
three land.

### Item 1 — stale version cell (§1 + header) — **resolved**

The header cell reads `| Version | 1.2 |` and §1 reads "derives entirely from
`REQ-pdlc-wave-resume.md` v1.7". `grep -n "v1\.5\|v1\.6"` over the FSPEC returns nothing: there
is no surviving reference to either superseded version anywhere in the file. The item was
described as cell-only ("content already reflects v1.6"), and that is what I found — the
substantive text needed no change because the FSPEC had already anticipated the rescope (see
Item 3 of the upstream re-grounding below).

### Item 2 — OB-F1's reading of REQ §10 — **resolved, and verified against the REQ, not the claim**

OB-F1 previously asserted the REQ "records BL-04 as 'discharged at FSPEC authoring'". It now
reads "which now records BL-04 as open and unmet in §5 and §10 (v1.7)". I checked both cited
sections rather than trusting the edit:

| Cited location | REQ v1.7 text at HEAD | Agrees? |
|---|---|---|
| §5, `BL-04` row (`REQ:231`) | "Checked at FSPEC authoring and found **unmet** — this row is not discharged (§10)" | yes |
| §10 (`REQ:558`) | "BL-04 is **open and unmet** — not discharged at FSPEC" | yes |

Both anchors exist and both say what OB-F1 now says they say. The correction is in the right
direction: OB-F1's *substance* — that the authoring tree is 1,637 commits behind and carries
neither the resume mechanism nor the baseline file — is unchanged and still owed to the
orchestrator, which is correct; only the false claim about what the REQ said was removed. An
erratum that had quietly dropped the obligation along with the misreading would have been a High
finding here. It did not.

### Item 3 — what an operator-pointed run records (§3.4) — **resolved at the right altitude**

The new paragraph states the behaviour plainly: recording follows what the run committed, not how
its start point was chosen, so an operator-pointed run records completed waves in the same
high-water form counted from the plan's first wave. Three things make this the right clause:

1. **It matches the shipped write site**, which is the defect the item names. §1's verified-claims
   table already pins `explicitPointer` at `orchestrate-dev.js:15236` computed above the clamp,
   and the record write at `:15600` inside the `if (waveGit)` branch at `:15531` — outside the
   `!explicitPointer` guard. The FSPEC now says what that code does instead of leaving a reader
   to infer it.
2. **Its two citations are real and say what is claimed.** BR-10 (`FSPEC:233`) — "the first
   executed wave's gate verifies the whole tree before this run commits anything". BR-07
   (`FSPEC:230`) — every non-first-wave run announces provenance `operator-set` or `automatic`.
   Neither is stretched to carry the clause.
3. **It requests no record field.** The dispatch said announcement-only provenance is sufficient,
   and the clause closes with "No record content distinguishes the two provenances" — an
   observable statement, not a schema. Had it specified a provenance field on the record it would
   have been TSPEC material landing in an FSPEC, and I would have filed it as such.

The consequence it discloses — "a later automatic invocation can resume above waves whose
completion only the operator asserted" — is not a new risk this edit created. EC-10 (`FSPEC:261`)
already accepted exactly this residual and bounded it the same way ("BR-10 bounds the damage to a
gate halt or wasted work, never an unverified commit"). The clause makes the recording half of
EC-10's story explicit. It is consistent, not contradictory.

## Upstream Re-Grounding (DEC-ERR-03)

## Delta-Confirmation Findings

## Recommendation

## Verdict
