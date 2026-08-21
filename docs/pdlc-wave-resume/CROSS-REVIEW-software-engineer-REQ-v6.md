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

One question, asked and answered: **does this delta resolve the routed items without breaking
anything I previously approved?**

Item-by-item disposition:

| Routed item | Landed? | Evidence |
|---|---|---|
| OB-F1 — §10 says BL-04 open/unmet, §5 read as discharged at FSPEC authoring | **Yes** | §5 line 231 now reads "Checked at FSPEC authoring and found **unmet** — this row is not discharged (§10)"; §10 line 558 reads "BL-04 is **open and unmet** — not discharged at FSPEC authoring". `grep -n "BL-04\|discharged at FSPEC"` over the whole file returns six hits (lines 29, 40, 43–44, 55, 231, 558) and no residual site states or implies discharge. The contradiction is gone in both directions, not patched on one side. |
| OB-1 cites `.worktreeinclude`, untracked on the default branch (pm-review) | **Yes** | §9 OB-1 no longer names the file as a repo fact; it names "the worktree include list that carries `.claude/workflows/` into a worktree" and labels it "consumer-local — untracked on the default branch, so a consumer fact and not a repo fact". |
| Same item, se-author phrasing (evidence is consumer-local, conclusion holds) | **Yes** | Same hunk. The conclusion — a Claude-created worktree has no ledger and therefore fails open to a full run — is preserved verbatim in substance, with the D-DIST-07 consistency note and the TSPEC obligation untouched. |
| Same item, se-author phrasing (file not tracked, evidence not a repo fact) | **Yes** | Same hunk. |

The edits are **targeted and versioned** as an erratum round should be: the changelog paragraph
names the two items and asserts "nothing else changed", and the diff bears that assertion out.
The document's requirement surface (REQ-WVR-01..08), invariant guards (IG-1..IG-6), measured
observations (OF-1..3), risks (R-1..R-5) and obligations (OB-1..OB-2) are byte-identical to the
bytes I approved at v1.6.

## Non-Goals

Deliberately outside this round:

- **Re-review of unchanged sections.** §§1–4, 6–8, and the whole requirement/invariant surface were
  approved at v1.6 and are untouched by this delta. I did not re-litigate them, and no finding
  below contests a settled decision.
- **The TSPEC's own `.worktreeinclude` citation.** `TSPEC-pdlc-wave-resume.md:879–881` still names
  the file directly — but that is the downstream document that *raised* the observation, it
  already records the untracked status itself, and TSPEC is not the artifact under confirmation
  here. Not a finding against this REQ.
- **Product framing, user-story shape, test-level choices.** Not the engineering lens.
- **Whether BL-04 should be discharged.** Whether the branch gets rebased is a Phase-level
  operator decision; my scope is only whether the REQ *states* BL-04's status truthfully and
  self-consistently. It now does.

## Constraints

## Acceptance Criteria

## Risks

## Obligations

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
