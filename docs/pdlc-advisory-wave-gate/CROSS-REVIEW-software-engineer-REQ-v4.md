# Cross-Review: software-engineer — REQ (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.14)
**Date:** 2026-08-20
**Iteration:** 4 (delta confirmation, erratum round)

## Problem / Context

This is a **delta confirmation**, not a fresh review. I approved this REQ at v1.13 (round v3). A
targeted erratum has since landed in three commits, all on `feat-pdlc-advisory-wave-gate`:

| Commit | Scope |
|---|---|
| `75e5e13c` | lineage header (Upstream / Downstream / Cross-Reviews rows), `Status` field, v1.14 changelog |
| `524913ed` | AC-1.1 and R-5 name `c8aa22a4` as the pre-A6 measurement base |
| `c58fd61d` | AC-5.1's observation point, record-carrier exclusion, ignored-path boundary, failed-capture outcome |

The diff read for this round is `git diff 53fe0b73..HEAD -- docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md`
— 21 insertions, 9 deletions, touching exactly three regions (header block, AC-1.1, AC-5.1, R-5).
Sections outside those regions were approved at v3 and are not re-litigated here.

Per DEC-ERR-03 the scope is this REQ measured against its **upstream at HEAD**, not against the
routed item list. I therefore re-measured every upstream claim the erratum leans on, at its current
version, rather than trusting the v3 readings:

- `docs/_constraints/pdlc-wave-gate-baseline.md` at **v1.2** (header `Version | 1.2 · 2026-08-20`),
  whose `Verified at` row reads `§1–§2 at default-branch commit c8aa22a4; §3 at 1efb9a3b; §4 at 11420461`.
- `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` at its shipped version, for the
  eight `REQ-pdlc-advisory-tier` ids this REQ cites.
- The shipped workflow at HEAD, for the "HEAD already carries A6" claim.

Branch verified `feat-pdlc-advisory-wave-gate` by `git rev-parse --abbrev-ref HEAD` immediately
before each commit of this file. No `git checkout` was run in the shared tree.

## Goals

## Non-Goals

## Constraints

## Acceptance Criteria

## Risks

## Obligations

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
