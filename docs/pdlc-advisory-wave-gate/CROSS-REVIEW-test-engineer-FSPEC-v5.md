# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.7)
**Erratum delta:** `9f80247a..HEAD` (5 commits, +16 −7)
**Upstream at dispatch:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (sha256:f97f4f66…, v1.16) — verified on disk
**Date:** 2026-08-20
**Iteration:** 5 (delta confirmation)

## Overview

**Delta confirmation, not a re-review.** FSPEC moved v1.6 → v1.7 across five commits
(`4b5be292`, `9a4dee38`, `60d7d360`, `11ad45d5`, `0fc601b2`), +16 −7 lines total. I read the full
`git diff 9f80247a..HEAD` for this document, re-read REQ v1.16's AC-6.3 and the AC-5/AC-6 block it
sits in at the sha this dispatch names (`f97f4f66…`, confirmed by `shasum` on disk), and re-read the
five FSPEC sites that compress it. Nothing settled in v1/v2/v3 is re-litigated.

**Answer: yes — the routed item lands, in full, at the right altitude.** v4's F-01 (High) asked for
four things and got all four: the BR-14 co-location clause, both arms of §3 step 10, the E-34
negative arm, and a three-conjunct AT-06-4 with a no-capture companion. v4's F-02 (Medium, E-30
re-enumerating BR-14's contents) is also resolved in the same edit. The capture's name, storage form
and lifetime stay behind O-1, exactly as the routing required — nothing in the delta names
`refs/pdlc/a6-snapshot-{waveNum}` or reaches into DEC-A6-03's mechanics.

**One residual, one degree below gating.** AT-06-4's *Then* now carries the obligation as a
**conditional** conjunct ("where it points the operator at a captured pre-A6 tree state…") while its
*Given* remains the generic "a halt following an A6 escalation". A fixture with no capture satisfies
conjunct (3) vacuously — the antecedent is false, the implication holds, and the warning is never
exercised. AT-06-4b pins the no-capture arm explicitly and calls itself AT-06-4's companion, so the
intended partition is legible; what is missing is one clause in AT-06-4's *Given* that pins the
capture-exists arm so the conjunct cannot pass without being tested. F-01 below, **Medium**,
`delta`/`local`. It is not High: the obligation is normatively stated in BR-14 and §3 step 10, both
arms are named, and the fix is a *Given* clause a TSPEC author would land without reopening anything.

**Nothing previously approved broke.** The delta is additive at every site but E-30, where the
replacement text widens rather than narrows. Two Low findings carry forward untouched (F-02, F-03).

## Linked Requirements

_pending_

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

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
