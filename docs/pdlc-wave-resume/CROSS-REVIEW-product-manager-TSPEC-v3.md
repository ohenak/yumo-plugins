# Cross-Review: product-manager — TSPEC (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md (v1.1, bytes unchanged since approval)
**Upstream re-read at:** REQ sha256:17e83bf… (v1.7), FSPEC sha256:1c05f51… (unchanged)
**Date:** 2026-08-21
**Iteration:** 3
**Scope:** Upstream-cascade confirmation. One question — does this TSPEC still hold as approved against REQ as it now stands? Product lens only. Settled decisions are not re-litigated.

## Overview

**What I re-read.** My v2 approval was recorded with `UPSTREAM-STATE: REQ sha256:ad68cd05…`, which is REQ at `7660f1ed`. REQ at HEAD is `5753de27`, `sha256:17e83bfc…`, matching the hash in this dispatch. The cascade delta is therefore exactly `git diff 7660f1ed 5753de27 -- docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md`: 13 insertions, 4 deletions across three hunks — the version cell (`1.6` → `1.7`), a new erratum paragraph in §1, the §5 `BL-04` row, and one sentence of §9 `OB-1`. FSPEC's hash is byte-identical to the one my v2 approval pinned, so nothing on that leg moved.

**The two landed items, verified in the REQ text at HEAD rather than from the erratum note:**

1. **§5 BL-04 now states its outcome.** The row's "Verified by / when" cell reads *"Checked at FSPEC authoring and found **unmet** — this row is not discharged (§10)"* (`REQ:231`), where it previously read *"Checked at FSPEC authoring:"* with no outcome. §10's readiness paragraph is **unchanged** — it still reads *"BL-04 is **open and unmet** — not discharged at FSPEC authoring"* (`REQ:558`). So the edit removed a §5/§10 divergence by moving §5 onto §10's reading; §10 itself, which is what this TSPEC quotes, did not move.
2. **§9 OB-1's worktree evidence is relabelled.** It previously read *"a Claude-created worktree has no ledger, because `.worktreeinclude` lists only `.claude/workflows/`"*; it now reads *"because the worktree include list that carries `.claude/workflows/` into a worktree is consumer-local — untracked on the default branch, so a consumer fact and not a repo fact — leaving the ledger's consumer-local path absent there"* (`REQ:467-470`). The **conclusion is preserved verbatim in force**: a worktree fails open to a full run. Only the evidence's status changed. The filename `.worktreeinclude` no longer appears anywhere in REQ (`grep -n worktree` returns §1's erratum note, §9 OB-1, and two unrelated OQ mentions).

**The answer to the one question.** Yes, with two citation-currency findings and no substantive one. On the substance, the cascade moved REQ **toward** this TSPEC rather than away from it: §1.1 and OB-F1 have said BL-04 is unmet since v1.0, and REQ §5 now says the same thing, so a divergence this TSPEC worked around is closed upstream. Every behavioural clause I checked in §2, §3 and §5.4 still traces to a REQ criterion that says what it said when I approved. What did not survive the edit is TSPEC §6.3's *description of REQ's text* — one erratum item quotes a sentence REQ no longer contains, and two items label REQ as "v1.6". Those are findings of this confirmation under DEC-ERR-03 (a document that cites upstream text upstream no longer says), not of the item list. Both are Low-to-Medium currency defects in the errata section, not in the design; neither narrows, reinterprets or drops an acceptance criterion, so neither is gating.

## Architecture

Nothing in the edited REQ text touches a design decision this TSPEC makes, and I checked that claim against the TSPEC passages that lean on the two edited REQ locations rather than asserting it.

**BL-04's outcome (REQ §5, §10).** Three TSPEC passages depend on it:

- §1.1 *"REQ BL-04 requires the resume mechanism and `docs/_constraints/pdlc-wave-gate-baseline.md` to be readable in the authoring tree. They are **not**."* — still a faithful compression. REQ §5 BL-04's requirement half is untouched (`git rebase`/merge, both artifacts readable in the authoring tree); only the outcome clause was added, and it now agrees with §1.1's "they are not". After the edit this sentence is *more* faithful than when I approved it, not less.
- §6.2 OB-F1 *"REQ BL-04 unmet: this tree is 1,637 commits behind…"* — unchanged in force. Its disposition ("not dischargeable by this document", owned by orchestrator/operator, AT-14 is a PLAN sequencing precondition) is a statement about branch management, and the REQ edit says nothing about who owns the rebase. REQ §10 still confirms BL-04 is **not** a pickup gate (`REQ:563-564`, "`ready: true` is accurate today"), which is what keeps OB-F1 a precondition on the *wave carrying AT-14* rather than on the run.
- §6.2 OB-F1's trailing sentence — *"Re-raised as an erratum below, because the REQ's §10 and the FSPEC's OB-F1 characterise it inconsistently"* — still holds and is worth being explicit about, because it is the one place a reader might expect the cascade to have closed something and it has not. The inconsistency named there is **REQ §10 vs FSPEC OB-F1**, not REQ §5 vs REQ §10. FSPEC OB-F1 still reads *"Raised as an erratum against the REQ, whose §10 records BL-04 as 'discharged at FSPEC authoring'"* (`FSPEC:429`) — a statement REQ §10 has never made in any version I have seen, and does not make at HEAD. The REQ-side edit made that FSPEC sentence *more* wrong, since §5 now says "unmet" too. TSPEC §6.3 item 2 is the correct routing for it and remains open against FSPEC. No action falls on this TSPEC.

**OB-1's worktree evidence (REQ §9).** Two TSPEC passages:

- §1.3 *"Worktrees fail open. A Claude-created worktree does not carry `.claude/pdlc-wave-state.json`, so the record is absent there and the run is a silent full one (FSPEC EC-17). This is a consequence of consumer-local state, not of any rule this TSPEC adds"* — this survives the edit intact, and notably it never rested on `.worktreeinclude` in the first place. It cites FSPEC EC-17 for the behaviour and grounds the *reason* in consumer-local state, which is exactly the framing REQ OB-1 has now adopted. This is the round's best evidence that the design leans on the conclusion, not on the retracted evidence.
- §1.3's tail — *"see §6 for the citation defect the REQ carries about it"* — is the sentence the edit falsified. REQ carries no such defect at HEAD. See F-01.

**Scope.** No scope movement in either direction. The REQ edit adds no requirement, removes none, and changes no P0/P1 priority; the erratum note itself says "Two items, nothing else changed", and the diff bears that out. TSPEC still implements exactly the ten REQ criteria §2.6 maps, with no behaviour the REQ does not ask for.

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
