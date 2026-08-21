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

The items landing is necessary, not sufficient. I re-read the REQ at HEAD (v1.7) and asked
whether this FSPEC is still a faithful compression of it. The REQ's own amendment log names
exactly what moved in the two versions the FSPEC skipped over:

| REQ version | What changed | Does the FSPEC still compress it faithfully? |
|---|---|---|
| v1.6 (Phase F erratum) | §1 wave count / replay cost matched to OF-1; REQ-WVR-02 notes IG labels name causes not precedence; **REQ-WVR-08's no-commit claim scoped to the implementation wave loop, Phase PT's V-wave excluded**; §10 records BL-04 open and unmet | yes — see below |
| v1.7 (Phase T erratum) | §5's BL-04 row restated as unmet, matching §10; OB-1's worktree evidence relabelled consumer-local and untracked | yes — OB-F1 now matches; OB-1 is not compressed by this FSPEC |

**The REQ-WVR-08 rescope was already honoured — this is the interesting result.** The one change
that could have left the FSPEC stale is v1.6's scoping of the no-commit claim to the wave loop.
The FSPEC does not merely survive it; it is where the rescope came from. BR-11 (`FSPEC:234`)
already reads "Under outcome (c) the **implementation wave loop** dispatches nothing… The rule is
scoped to the wave loop (§2 Vocabulary): Phase PT's V-wave is outside it and replays on every
invocation (EC-20)." EC-20 (`FSPEC:272`) states the V-wave replays unconditionally and closes
"raised as an erratum against REQ-WVR-08". §3 (`FSPEC:112`) carries the same scoping. The FSPEC
routed the defect upstream rather than fixing it in place, the REQ accepted it in v1.6, and the
two now agree. There is no divergence to file.

I spot-checked the three ACs the new §3.4 clause is most likely to strain, since a recording rule
that trusts an operator assertion is exactly where a completion guarantee would break:

- **REQ-WVR-05** ("never able to skip unverified work") — not violated. The clause skips
  *dispatch*, not verification: BR-10 has the first executed wave's gate verify the whole tree
  before the run commits anything. WVR-05's own "honest cost" paragraph accepts an indefinitely
  stale record on exactly this reasoning.
- **REQ-WVR-06** ("completion evidence is never commit presence") — not violated. The clause
  derives nothing from commit archaeology; it records what the run itself committed.
- **REQ-WVR-09** ("verified but not committed is never recorded complete") — not violated, but
  this is the closest call. WVR-09's *Given* is scoped to a wave whose "tasks completed and the
  wave's gate passed, but the run committed nothing for it". The operator-pointer case is
  different in kind: the skipped waves were never executed by this run at all, and the record
  carries an assertion the operator made, not a verification this run performed. WVR-09 does not
  reach it, and the FSPEC does not pretend otherwise — it discloses the gap and bounds it. The
  residual is real and is the subject of my one finding below, at Low.

Everything else this FSPEC cites upstream — REQ-WVR-01..04, -07, -10, OF-1/OF-2, BL-03, R-2/R-3/R-4,
OQ-1 — is untouched by v1.6 and v1.7, so the compression I approved in v4 stands unchanged.

## Delta-Confirmation Findings

## Recommendation

## Verdict
