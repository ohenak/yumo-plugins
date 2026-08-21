# Cross-Review: software-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-wave-resume/FSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 4
**Scope:** upstream-cascade confirmation. FSPEC bytes unchanged since my v2 approval
(`REVIEWED-COMMIT: 1dc235e0`) and unchanged since my v3 confirmation
(`REVIEWED-COMMIT: c37b80df`). Upstream REQ moved from v1.6
(sha256:ad68cd05…) to v1.7 (sha256:17e83bfc…) across the Phase T erratum round
`1ec391c1..5753de27`. The single question answered here: does this FSPEC still hold as
approved against REQ as it now stands?

## Overview

**What moved upstream.** The Phase T erratum round is small and closed: `git diff 7660f1ed..HEAD`
over the REQ is 13 insertions and 4 deletions, and two of the four hunks are the version bump
(`| Version | 1.6 |` → `1.7`) and the changelog entry recording the round. The two substantive
edits are:

| REQ edit | Substance | Bearing on this FSPEC |
|---|---|---|
| §5, BL-04 row restated | The row's outcome column now reads "Checked at FSPEC authoring and found **unmet** — this row is not discharged (§10)", where it previously read as a discharge ("Checked at FSPEC authoring: the resume mechanism and … must both be readable"). The *requirement* the row states is unchanged; only its recorded outcome moved. | **Convergent, and it completes a settlement.** REQ §10 already recorded BL-04 open and unmet at v1.6; §5's row was the last place upstream still read as discharged. FSPEC §1's grounding paragraph and §7's OB-F1 have said "not met" since v1, so the two documents now agree in both of the REQ's own sections. No behavioural claim in this FSPEC changes. It does, however, finish invalidating OB-F1's quotation of upstream — see Open Questions. |
| §9, OB-1's worktree evidence relabelled | The worktree conclusion **stands**; what changed is the evidentiary status of its support. Where OB-1 previously asserted "`.worktreeinclude` lists only `.claude/workflows/`" as a repo fact, it now says the include list "is consumer-local — untracked on the default branch, so a consumer fact and not a repo fact — leaving the ledger's consumer-local path absent there, so it fails open to a full run". | **None.** This FSPEC never transcribed that evidence. Its only worktree row, EC-17, is stated purely as an observable ("Phase I runs inside a worktree that does not carry consumer-local state" ⇒ "No record is visible: outcome (a), silent, as EC-01"), cites `REQ OB-3, D-DIST-07`, and names no include list, no `.worktreeinclude`, and no file path. `grep -n "\.worktreeinclude\|include list\|\.claude/workflows" FSPEC-pdlc-wave-resume.md` returns nothing. The relabelling weakens an upstream *premise*; EC-17's conclusion — which upstream explicitly says still stands — is what the FSPEC compressed, and it is unaffected. |

**Answer to the one question.** Yes. Every behavioural claim, outcome, rule, edge case and
acceptance oracle in this FSPEC remains a faithful compression of REQ v1.7. One edit moved the
REQ further *toward* this document; the other cost it nothing, because the FSPEC compressed
OB-1's conclusion at the altitude of an observable rather than transcribing the repo fact that
supported it. This is the second consecutive round in which citing upstream by id and outcome,
rather than by transcription, has made an upstream move free.

**What this round does not fix.** The three stale-provenance sentences I filed in v3 (F-01, F-02,
F-03) are still in the file — the FSPEC has not been edited since, which is expected, since all
three were non-gating. This round widens two of them rather than resolving them: the derivation
pin in §1 now names a version two behind upstream, and OB-F1's quotation is now contradicted by
**both** REQ §5 and REQ §10 rather than §10 alone. They are restated below at their widened
extent, tagged `inherited` — they were in the pre-round bytes and this round's edit did not touch
them, so they route back to the FSPEC's ordinary revision loop rather than gating this
confirmation. Severity is unchanged; no finding in this round is High.

## Linked Requirements

## Behavioral Flow

## Business Rules

## Edge Cases and Error Scenarios

## Acceptance Tests

## Open Questions

## Recommendation

## Delta-Confirmation Findings

## Verdict
