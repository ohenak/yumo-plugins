# Cross-Review: test-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.6, bytes unchanged)
**Upstream under confirmation:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (sha256:f97f4f66…, v1.16)
**Date:** 2026-08-20
**Iteration:** 4 (upstream-cascade confirmation)

## Overview

**Upstream-cascade confirmation, not a re-review.** FSPEC v1.6 is byte-identical since its approval.
REQ moved to v1.16 in an erratum round (`30d8bf7b`, sha256:f97f4f66…) after that approval was
recorded, so the approval was taken against a REQ version that no longer exists. The single question
answered here: **is FSPEC v1.6 still a faithful compression of REQ as it now stands?**

**Method.** Re-read `CROSS-REVIEW-test-engineer-FSPEC-v3.md` (the previous cascade round, taken
against REQ v1.15); ran `git show 30b…30d8bf7b -- …/REQ-pdlc-advisory-wave-gate.md` for the full
upstream delta; then re-read, at their current version, the REQ clauses this FSPEC leans on — the
whole of REQ-AWG-06, and AC-6.3 in particular — against the FSPEC sites that compress them (§3 step
10, BR-14, §5.5 E-30, AT-06-4, §7.1 O-1). Nothing settled in v1/v2/v3 is re-litigated.

**Answer: no — one clause of the new REQ text has no FSPEC compression at all.** The delta is small
and single-item, but it is not a no-op downstream: REQ v1.16's AC-6.3 gained a second operator-visible
obligation (the halt report must warn that re-running the feature overwrites the captured pre-A6 tree
state, DEC-A6-03) and FSPEC carries no rule, no edge-case row, and no acceptance test for it. F-01
below, High, tagged `delta`/`local` — the gap sits exactly in the section AC-6.3 maps to (BR-14 /
AT-06-4), so it is a bounded FSPEC edit, not a reopened decision.

## Linked Requirements

## Behavioral Flow

## Business Rules

## Edge Cases and Error Scenarios

## Acceptance Tests

## Open Questions

## Positive Observations

## Delta-Confirmation Findings

## Recommendation

## Verdict
