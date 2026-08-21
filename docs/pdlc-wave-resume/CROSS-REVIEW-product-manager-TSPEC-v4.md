# Cross-Review: product-manager — TSPEC (upstream-cascade confirmation, FSPEC leg)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 4
**Round type:** upstream-cascade confirmation — TSPEC bytes unchanged, FSPEC moved
**Scope:** TSPEC measured against its upstream at HEAD (REQ `sha256:17e83bfc…`, FSPEC `sha256:9a6be7b5…`)

## Overview

**The question this round answers.** I approved TSPEC at v3 against FSPEC
`sha256:1c05f51…`. FSPEC has since taken a Phase-T erratum round and now stands at
`sha256:9a6be7b5…` (v1.2). My approval was therefore taken against a version of FSPEC that no
longer exists. The single question here is whether TSPEC — whose own bytes are unchanged
(`sha256:3cd713c0…`, identical to the hash my v3 approval anchor pinned) — is still a faithful
compression of FSPEC as it now stands.

**Answer: yes on substance, with three bookkeeping defects the cascade created.** The erratum
did not change any behaviour FSPEC specifies. It added one clause stating behaviour that was
previously unspecified, corrected one characterisation of the REQ, and moved a version cell. On
the one substantive point — what an operator-pointed run records — FSPEC's new clause ratifies
*exactly* the behaviour TSPEC had already ratified and routed the erratum for. No acceptance
criterion is narrowed, reinterpreted, broadened or dropped; no scope moves in either direction.

**The delta, in full.** Four hunks, `git diff 47717a08..HEAD -- FSPEC`:

| # | Hunk | What it changes | Reaches TSPEC? |
|---|---|---|---|
| 1 | Header `Version` cell `1.1 → 1.2` | Bookkeeping | §6.3 item 1 (label only) |
| 2 | §1 "derives entirely from `REQ…` v1.5" → **v1.7** | Re-grounding; no content claim moves | §6.3 item 1 |
| 3 | §3.4, **new paragraph**: "An operator-pointed run records exactly as any other run does." | Specifies what was unspecified | §2.5, §6.3 item 3 — **the substantive leg** |
| 4 | §7 OB-F1's trailing clause: REQ §10 "records BL-04 as discharged at FSPEC authoring" → "now records BL-04 as open and unmet in §5 and §10 (v1.7)" | Corrects a false claim about the REQ | §6.2 OB-F1, §6.3 item 2 |
| 5 | §7 changelog: new "Erratum, v1.2 (Phase T)" note | Provenance record | — |

**What I did.** Re-read my v3 cross-review; diffed FSPEC across the erratum; re-read FSPEC §3.4
and §7 at HEAD in full; then re-read every TSPEC passage that leans on them — §2.5, §2.6, §3.2,
§3.3, §4.1, §4.4, §6.2, §6.3 — and checked each against the current upstream text rather than
against the item list. I did not re-derive the eighteen AT oracles or the requirement→component
map, which the delta does not reach; my v2/v3 approval of those stands and is not re-litigated.

**Per DEC-ERR-03,** my scope is this TSPEC against upstream at HEAD, not the erratum item list.
The three findings below are all of that second kind: things TSPEC cites that FSPEC no longer
says. All are Medium or Low. None is a design-fidelity defect, and none is gating.

## Architecture

**The substantive leg: FSPEC §3.4's new clause, against TSPEC §2.5.**

This is the hunk that could have broken the approval, so I read both sides in full rather than
diffing summaries. FSPEC now says, in §3.4 immediately below the high-water paragraph:

> **An operator-pointed run records exactly as any other run does.** Recording follows what the
> run committed, not how its start point was chosen: when an explicit operator pointer is in
> force (§3.3) the run still records completed waves as it goes, in the same high-water form
> counted from the plan's first wave. So a later automatic invocation can resume above waves
> whose completion only the operator asserted. That is bounded by BR-10 — the first executed
> wave's gate verifies the whole tree — and the assertion is attributable, because the run that
> made it announced provenance `operator-set` (BR-07). No record content distinguishes the two
> provenances.

TSPEC §2.5 ratified this behaviour before FSPEC specified it:

> The write site is outside the `!explicitPointer` guard, so a run started at wave N by an
> operator pointer records `lastGreenWave = N` for a wave the *operator*, not the pipeline,
> asserted the predecessors of. The damage is bounded exactly as FSPEC BR-10 bounds it — the
> first executed wave's gate verifies the whole tree … Ratified as-is.

These agree clause for clause, and I checked each conjunct rather than the gist:

| FSPEC §3.4 conjunct | TSPEC position | Agrees? |
|---|---|---|
| Records "exactly as any other run does" | §2.5 item 1: the write is guarded by the **transport**, not by how `startWave` was chosen; the write site is outside `!explicitPointer` | Yes |
| "in the same high-water form counted from the plan's first wave" | §2.5 item 5: each write carries `lastGreenWave = waveNum`, the **plan-absolute** wave number | Yes |
| "a later automatic invocation can resume above waves whose completion only the operator asserted" | §2.5's ratification sentence states this consequence in the same terms | Yes |
| "bounded by BR-10 — the first executed wave's gate verifies the whole tree" | §2.5 cites BR-10 with the identical bound; §4.4 reasons from it again | Yes, verbatim bound |
| "attributable, because the run … announced provenance `operator-set` (BR-07)" | §2.4/§3.3: provenance is announced content in every announcing outcome; `RESUME_PROVENANCE` closed at two | Yes |
| "**No record content distinguishes the two provenances.**" | §2.5's closing paragraph: "the record carries no provenance of its own … the record's shape stays exactly the four-or-five fields of §4.1" | Yes — and this is the strongest agreement of the five |

That last row is the one worth naming. TSPEC did not merely happen to be compatible with the new
clause; it had pre-emptively argued, under PM Q-02, that the erratum it was raising must not be
read as asking for a persisted `provenance` field, on the grounds that a reader treating
operator-asserted completion differently from pipeline-observed completion is a distinction the
BR-10 safety argument deliberately does not need. FSPEC's new clause closes with precisely that
sentence. The erratum channel returned the clause TSPEC asked for, in the shape TSPEC asked for
it, and the design needs no change.

**One architectural consequence for the reader, not a change.** Because FSPEC now specifies this,
the behaviour has moved from "ratified downstream, unspecified upstream" to "specified upstream
and ratified downstream". Nothing in TSPEC's mechanism moves. What does become false is TSPEC's
*statement about* that status, in two places (§2.5's hand-off sentence and §6.3 item 3) — F-01
below. Per DEC-ERR-01 that is scored on what it costs downstream, and here it costs nothing on
the losing side: both documents ratify the same behaviour, so no PLAN or PROPERTIES task can be
authored against a decision that lost. It is a stale hand-off statement, not a design defect.

## Interfaces

_TBD_

## Data Model

_TBD_

## Test Strategy

_TBD_

## Open Questions

_TBD_

## Positive Observations

_TBD_

## Recommendation

_TBD_

## Delta-Confirmation Findings

_TBD_
