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
against REQ v1.15); ran `git show 30d8bf7b -- …/REQ-pdlc-advisory-wave-gate.md` for the full
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

Citation fidelity, REQ → FSPEC, at REQ v1.16:

| REQ clause the FSPEC leans on | REQ v1.16 text | FSPEC compression site | Still faithful? |
|---|---|---|---|
| AC-6.3 sentence 1 (diagnosis + root-cause class on the halt path) | Unchanged by this erratum | §3 step 10, BR-14, AT-06-4 | Yes — verbatim in substance |
| **AC-6.3 sentence 2 (new)** — where the halt report points the operator at a captured pre-A6 tree state, it warns *in the same place* that re-running this feature overwrites that capture (DEC-A6-03) | Added by v1.16 | **None** — `grep -n "overwrit\|snapshot"` over FSPEC returns no hit; BR-14 stops at "diagnosis and its root-cause class" | **No — F-01** |
| AC-6.1 / AC-6.2 (record and escalation-log appends) | Unchanged | BR-13, AT-06-1, AT-06-3 | Yes |
| AC-6.4 + its honest limit | Unchanged | E-31, AT-06-5 | Yes |
| AC-5.1 / AC-5.2 / R-5 / AC-1.1 | Unchanged since v1.15 | BR-9, BR-10, E-23, E-34, §2 | Yes — as confirmed in v3 |
| O-1 (capture point and mechanism stay TSPEC's) | Unchanged; v1.16 changelog re-affirms it | §7.1 O-1 | Yes — and the new AC-6.3 clause respects it (outcome only, no ref name) |

**§2 version token.** FSPEC §2's preamble still pins `REQ-pdlc-advisory-wave-gate` **v1.13**; upstream
is now **v1.16**, two erratum rounds further on. Every individual trace still resolves, so this is a
stale token and not a broken citation — F-03, Low, `inherited`/`nonlocal` (v3's F-01, still open, now
one version staler).

## Behavioral Flow

## Business Rules

## Edge Cases and Error Scenarios

## Acceptance Tests

## Open Questions

## Positive Observations

## Delta-Confirmation Findings

## Recommendation

## Verdict
