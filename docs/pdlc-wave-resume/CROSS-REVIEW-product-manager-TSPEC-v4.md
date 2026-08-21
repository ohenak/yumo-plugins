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

_TBD_

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
