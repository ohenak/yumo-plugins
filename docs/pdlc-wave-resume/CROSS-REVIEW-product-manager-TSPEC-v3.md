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

The surfaces this confirmation examines are the citation contracts between this TSPEC and REQ — the errata channel and the requirement-mapping table — since those are the only interfaces a pure-upstream edit can break.

**The errata channel (§6.3).** This is where the cascade lands, and it is where both findings sit. §6.3's own framing is *"Raised, not fixed here; each is emitted as an `ERRATUM:` line in this dispatch's final message"* — so the section is a routing surface whose entries are read by a downstream mechanism and by the next human reading TSPEC. Two of its four entries no longer describe REQ at HEAD:

| §6.3 item | Status against REQ at HEAD | Effect |
|---|---|---|
| 1 — FSPEC's version cell says REQ v1.5; *"the REQ at HEAD is **v1.6**"* | Substance **still true and stronger** (FSPEC's cell is now two versions stale); the parenthetical version label is **stale** — REQ at HEAD is v1.7 (`REQ:13`) | F-02 |
| 2 — FSPEC OB-F1 misquotes REQ §10; *"REQ v1.6 §10 says the opposite"* | Substance **still true and verified verbatim** — REQ §10's sentence is byte-identical at HEAD (`REQ:558`) and FSPEC:429 still misstates it; only the version label is stale | F-02 |
| 3 — FSPEC has no clause for what an explicit-pointer run writes | **Untouched** by this edit; still open against FSPEC | — |
| 4 — REQ OB-1 rests on `.worktreeinclude` listing only `.claude/workflows/`, which is untracked | **Landed upstream.** REQ OB-1 now labels the include list consumer-local and untracked in its own words; the string `.worktreeinclude` is gone from REQ | F-01 |

Item 4 is the DEC-ERR-03 case in its pure form: this TSPEC quotes a sentence its upstream no longer contains, and characterises upstream as carrying a defect upstream has fixed. That the fix is the one TSPEC asked for does not make the citation current — a reader arriving at §6.3 today, or a harvest pass reading the errata channel, is told to go raise something already raised and closed. The fix is small and mechanical: mark item 4 landed (with the REQ version that landed it) or strike it, and repoint §1.3's *"see §6 for the citation defect the REQ carries about it"* at REQ OB-1's current consumer-local framing, which now says what §1.3 wanted §6 to say.

**The requirement-mapping table (§2.6).** Unaffected. Every id it maps — REQ-WVR-01 through REQ-WVR-10, and the business rules BR-04, BR-05, BR-10, BR-11, BR-12, BR-14, BR-16 — is untouched by the diff (the edit does not enter §4, §6, §7 or §8 of REQ). The ten criteria that carried a component when I approved still carry the same component against the same text. I re-read REQ-WVR-02's IG enumeration and REQ-WVR-08's wave-loop scoping specifically, because the previous erratum round (v1.6) moved both and this round's note mentions them in its recap of v1.6; both are byte-identical to the version my v2 approval was taken against, so nothing there re-opens.

**C-3's no-new-capability boundary.** Unmoved. REQ C-3 is untouched; §3.4, DEC-WVR-08 and the AT-03/AT-11 `merge-base` call-count oracles still trace to it as written.

## Data Model

The record's product-visible shape is specified by FSPEC, whose bytes are unchanged from the version my v2 approval pinned, so nothing in this leg of the cascade can have moved it. I re-checked the three places where REQ — not FSPEC — is the source of a shape or state claim, because those are the ones the edit could in principle have reached:

- **Retention and the `{}` cleared shape.** REQ §9 OB-1's closing sentence — *"One decision remains genuinely left to TSPEC: the `{}` 'cleared' shape that `parseWaveLedger` reserves but nothing ever writes — wire it or drop it"* — sits in the same paragraph the edit touched, three lines below the changed sentence, and is **byte-identical** at HEAD. DEC-WVR-04's disposition (keep the tolerance, add no writer) still discharges exactly what REQ left open, and §6.2 OB-F3 still reports it discharged. Nothing to change.
- **The record's location, and that it is never tracked content.** REQ-WVR-10 and REQ §9 OB-1's "location, encoding, matching procedure and write mechanics are left to TSPEC" framing are untouched. `WAVE_STATE_PATH` under a root-anchored `.gitignore` rule (V-14) and AT-14's assertion on the ignore rule itself still trace as written. Worth stating explicitly given this round's subject: the OB-1 edit narrowed a claim about *where consumer-local state does and does not travel* (worktrees), and the TSPEC's own consumer-local placement of the record is the thing that makes the worktree conclusion true. The edit is therefore consistent with the data model rather than in tension with it.
- **Completion as a high-water property.** REQ-WVR-01/BR-08 untouched; `lastGreenWave` semantics on the `resume` decision unchanged, as is the §3.2 skip-line rendering I re-derived in v2.

One consequence of the BL-04 edit is worth recording as a *non*-finding, because it is the kind of thing that looks like one: REQ §5's row now names an outcome ("unmet") in a table whose other three rows name outcomes too (BL-01/02/03 resolved at HEAD per §10). That makes §5 a state table rather than a checklist. This TSPEC never reads §5 as a checklist — §1.1 reads the requirement, §6.2 reads the state — so the reframing costs it nothing, and the state it now reads from two places agrees in both.

## Test Strategy

Product lens only: does any acceptance criterion's oracle change meaning now that REQ reads as it does? No. But two oracles are worth naming because they are the ones a reader would expect this cascade to touch.

- **AT-14 (the ignore rule) and OB-F1's sequencing precondition.** §6.2 OB-F1 states *"AT-14 is red until it lands, and in wave mode a red gate halts the wave and every wave after it — so the wave carrying AT-14 must not be dispatched before the rebase … This is a PLAN sequencing precondition, not a caveat."* REQ §5's edit changes the *recorded status* of the prerequisite, not its dischargeability, so the precondition stands unaltered and, if anything, is now easier to justify to a PLAN author: the REQ's own §5 row, not just its §10 prose, now says the row is not discharged. RT-4's mitigation ("the correct response to a red is the rebase, not a weaker oracle") is unchanged and still correct. This is the one place where a careless reading of the erratum could do product harm — someone could read "BL-04 is now correctly recorded" as "BL-04 is now handled" and let the AT-14 wave be scheduled early. It is not handled; it is accurately labelled unhandled. TSPEC already says so in both §1.1 and OB-F1, so no change is owed here, but the PLAN author should carry that distinction.
- **EC-17 / the worktree fail-open.** The OB-1 edit is the closest the cascade comes to a testable claim. It does not change what a worktree does — a Claude-created worktree still has no record and still fails open to a full run — it changes why we are entitled to say so, from "an include list in the repo lists only `.claude/workflows/`" to "the include list is consumer-local and untracked, so nothing carries the record". §1.3 already grounds the behaviour in FSPEC EC-17 and in consumer-local state rather than in the include list, so no oracle moves. Nothing in §5.4 asserts over `.worktreeinclude`, which I confirmed by grep across the TSPEC: the string appears twice, both inside §6.3 item 4 (the claim and its `git ls-tree` evidence), and never in an AT.

The remainder of the test strategy is unreached by this edit. The eighteen FSPEC acceptance tests still carry the oracles I approved in v2, against an FSPEC whose bytes have not changed; the three closed catalogues still get set-equality (§3.1, AT-02/AT-08/AT-13); AT-03/AT-11's `merge-base` call-count equality still discharges REQ C-3. I re-verified none of these mechanically this round, and say so plainly — they are out of scope for an upstream-cascade confirmation whose upstream delta does not reach them, and re-deriving them would be re-litigating an approval that still stands.

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
