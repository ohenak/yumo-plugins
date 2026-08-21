# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md (v1.7)
**Upstream measured against:** docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md v1.16 (sha256:f97f4f66…6fab7)
**Delta reviewed:** `33634b3d..0fc601b2` (5 commits, +16/-7)
**Date:** 2026-08-20
**Iteration:** 5 (delta confirmation)

## Overview

This is a **delta confirmation**, not a fresh review. I approved this FSPEC's structure in
earlier rounds and filed v4 F-01 (High) — AC-6.3's new preservation-warning conjunct unrepresented
in §4/§5/§6 — plus v4 F-02 (Medium, carried from v3) on the stale upstream pin.

**The routed item has landed, and it landed at the right altitude.** The v1.7 edit places the
obligation on BR-14 as a conditional clause, names its two arms in §3 step 10 and in E-34, defers
E-30 to BR-14's contents rather than re-enumerating them, and gives AT-06-4 a third *Then* conjunct
with a falsifying companion AT-06-4b. No ref name, no storage form, no lifetime — all correctly left
to REQ O-1. v4 F-01 is **resolved**.

I re-read REQ v1.16 §AC-6.3, AC-5.1, AC-5.2 and O-1 at the dispatched hash (verified: sha256 matches
byte-for-byte) rather than trusting the changelog. The FSPEC remains a faithful compression of the
REQ text it now leans on, with two exceptions recorded below, neither of them High and neither of
them a reason to hold the phase.

## Linked Requirements

§2's preamble still reads *"Every clause below traces to `REQ-pdlc-advisory-wave-gate` v1.13."*
REQ is at **v1.16** at HEAD — three erratum rounds on, two of which edited text this FSPEC compresses
(AC-5.1's excluded-carrier list, AC-1.1/R-5's post-change reading, and now AC-6.3). This round's own
v1.7 changelog cites *"REQ v1.16's second AC-6.3 conjunct"* eight lines above a concordance preamble
that claims v1.13, so the document now contradicts itself about which upstream it compresses.

This is v4 F-02 / v3 F-02, still open. It is **inherited** — the stale pin was in the pre-round bytes
and the edit did not touch §2 — and it stays Medium: the concordance rows themselves are correct
against v1.16, so the defect is a misleading pin rather than a coverage gap. It should be corrected in
whatever edit next touches this file; it does not warrant a round of its own. Filed as F-01 below.

The concordance's coverage claim for AC-6.1…AC-6.4 is now **true**, which it was not at v1.6 — that
was the substance of v4 F-01 and it is discharged.

## Behavioral Flow

_pending_

## Business Rules

_pending_

## Edge Cases and Error Scenarios

_pending_

## Acceptance Tests

_pending_

## Open Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
