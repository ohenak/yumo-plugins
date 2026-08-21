# Cross-Review: test-engineer — TSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 4 (upstream-cascade confirmation, not a re-review)

## Overview

This round is an **upstream-cascade confirmation**, not a re-review. TSPEC's own bytes are
unchanged since my v2 approval and my v3 confirmation (`REVIEWED-COMMIT: 4cbd5814`). What moved
this time is **FSPEC**: my v3 anchors pinned `UPSTREAM-STATE: FSPEC sha256:1c05f511…`, and FSPEC at
HEAD is `sha256:9a6be7b5…` (v1.2). REQ is unmoved — `sha256:17e83bfc…` matches the byte-state my v3
anchors recorded — so the REQ-facing half of TSPEC, which v3 confirmed in full, is untouched here.

The single question answered: **does TSPEC still hold as approved against FSPEC v1.2?**

The FSPEC delta, read from `git diff 1dc235e0..HEAD -- docs/pdlc-wave-resume/FSPEC-pdlc-wave-resume.md`,
is five hunks and three substantive items:

| # | Hunk | Change |
|---|------|--------|
| 1 | header `Version` cell + §1 | `1.1` → `1.2`; "derives entirely from `REQ-pdlc-wave-resume.md` v1.5" → **v1.7** |
| 2 | §3.4, new paragraph | **"An operator-pointed run records exactly as any other run does."** Recording follows what the run committed, not how the start point was chosen; same high-water form counted from the plan's first wave; a later automatic invocation can therefore resume above operator-asserted waves; bounded by BR-10; attributable because the run announced provenance `operator-set` (BR-07); **"No record content distinguishes the two provenances."** |
| 3 | §7 OB-F1 | the trailing clause "Raised as an erratum against the REQ, whose §10 records BL-04 as *discharged at FSPEC authoring*" → "…which now records BL-04 as **open and unmet** in §5 and §10 (v1.7)" |
| 4 | §7 amendment history | new "Erratum, v1.2 (Phase T)" paragraph naming the three items above |

**All three items are ones this TSPEC itself raised** — §6.3 items 1, 2 and 3, in that order. As at
v3, the upstream did not move away from the document; it moved *toward* it, adopting TSPEC's
diagnosis in each case. My verification is nevertheless the full DEC-ERR-03 one: I re-read the
FSPEC text TSPEC leans on at v1.2 and asked whether TSPEC is still a faithful compression of it,
not merely whether the three items landed.

Outcome, stated up front: **TSPEC still holds.** No High. One Medium and three Low.

The Medium is the one thing item-landing alone would have missed, and it is the reason this
confirmation is not a formality. FSPEC §3.4 has gone from *silent* on operator-pointed recording to
*specifying* it — and a newly specified observable behaviour arrived **without an FSPEC AT**, so
TSPEC's AT-keyed test map (§5.4) has no home for it and no oracle discriminates it. TSPEC's §2.5
already ratifies exactly the behaviour FSPEC now states, so this is a missing conjunct on an
existing test, not a design divergence. The three Lows are bookkeeping lag in §2.5/§6.2/§6.3, where
TSPEC narrates upstream defects this round (and the previous one) fixed.

## Architecture

**Where TSPEC touches the changed FSPEC material.** I grepped the document for every surface the
delta could reach — `operator-set`, `explicitPointer`, `startWave`, `§3.4`, `BR-07`, `BR-08`,
`BR-10`, `high-water`, `lastGreenWave`, `OB-F1`, `provenance` — and resolved each hit against FSPEC
v1.2 rather than against my memory of v1.1.

| TSPEC site | Leans on | FSPEC v1.2 says | Still faithful? |
|---|---|---|---|
| §2.5 item 5 | each write carries `lastGreenWave = waveNum`, the **plan-absolute** wave number, "not a count of waves this run executed" | §3.4: high-water, "counted from the plan's first wave, whichever invocation carried it there" — and the new paragraph restates the same form for pointer runs | **Yes — and now covers the pointer case too.** TSPEC's rule was already unconditional on how the run started, which is exactly what the new clause makes upstream-explicit. |
| §2.5 items 1–2 | write inside `if (waveGit)`, after the wave's pathspec-scoped commits | §3.4 unchanged first half: "Recording follows what the run committed"; new paragraph repeats "records completed waves as it goes" | **Yes — converged.** The new clause's premise ("follows what the run committed, not how its start point was chosen") is the *transport-and-commit* guard TSPEC already ratified, restated upstream. |
| §2.5 paragraph "One interaction the FSPEC does not state" | asserts FSPEC is silent on pointer-run writes; ratifies the shipped behaviour; routes an erratum | FSPEC **now states it**, and states it the way TSPEC ratified it | **Substance yes, sentence no.** The ratified behaviour matches upstream verbatim in effect; the sentence claiming upstream silence is now false. See F-02. |
| §2.5 final paragraph "the record carries no provenance of its own" (PM Q-02) | provenance is announced content, never a record field; §4.1's shape stays four-or-five fields | §3.4: "**No record content distinguishes the two provenances**", provenance is announced (BR-07) | **Yes — vindicated exactly.** TSPEC pre-empted the risk that the requested clause be read as asking for a persisted field; FSPEC's clause explicitly forecloses that field. This is the strongest fidelity signal in the delta. |
| §2.5 bounding argument | "The damage is bounded exactly as FSPEC BR-10 bounds it — the first executed wave's gate verifies the whole tree" | §3.4: "That is bounded by BR-10 — the first executed wave's gate verifies the whole tree" | **Yes — same sentence, same mechanism.** BR-10's own text is byte-unmoved by this delta (verified: no §4 hunk). |
| §2.4 / D-2 / §3.1 `RESUME_PROVENANCE` | `operator-set` announced on the operator banner; frozen two-member catalogue | §3.4 now *also* cites BR-07's `operator-set` announcement as the attribution mechanism for the recorded assertion | **Yes — load extended, not changed.** The announcement TSPEC already specifies is now doing a second job upstream (attributing a recorded assertion). No new token, no new site; AT-05's named-announcement conjunct still carries it. |
| §6.2 OB-F1 rationale ("the REQ's §10 and the FSPEC's OB-F1 characterise it inconsistently") | FSPEC OB-F1 said "discharged" | FSPEC OB-F1 now says "open and unmet in §5 and §10 (v1.7)" | **No — stale.** The inconsistency named is resolved; the obligation itself (rebase, PLAN sequencing) is untouched and stands. See F-03. |
| §6.2 OB-F1 obligation body | BL-04 unmet; AT-14 red until rebase; wave carrying AT-14 must not be dispatched first | FSPEC OB-F1's *substance* (tree 1,637 behind, mechanism and baseline absent, rebase owed) is byte-unchanged | **Yes.** Only OB-F1's trailing provenance clause moved. The sequencing precondition is untouched and now agrees with upstream on BL-04's disposition. |
| §6.3 items 1–3 | narrated as open errata against FSPEC | all three landed in v1.2 | **No — stale ledger.** See F-03. |
| §6.3 item 4 | erratum against REQ OB-1 | landed in REQ v1.7 at the *previous* round | **No — stale, carried.** See F-04. |
| §1.2, §3.2, §5.4 (EC-17, EC-15, EC-15a, AT-14, AT-18) | FSPEC edge cases and ATs by id | §5 and §6 carry **no hunk** in this delta | **Yes — untouched.** No AT text, no EC text, no BR text changed; the diff is confined to the header, §1's grounding sentence, one §3.4 paragraph, and §7. |

**Structural conclusion.** The delta contradicts no TSPEC claim, invalidates no oracle, changes no
obligation's disposition, and removes no citation target. Every id TSPEC cites into FSPEC — BR-07,
BR-08, BR-10, EC-13, EC-15, EC-15a, EC-17, AT-01…AT-18, OB-F1…OB-F5 — still exists and, apart from
OB-F1's trailing clause, still says what TSPEC says it says. The one architecturally interesting
move is that a paragraph TSPEC wrote as *"recorded here and routed upstream"* is now upstream text,
in TSPEC's own terms.

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
