# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.11)
**Date:** 2026-08-20
**Iteration:** 1

## Review basis

Every claim below was re-measured in this working tree at `9cf48051` (branch tip, identical to
`origin/feat-pdlc-advisory-wave-gate`) and, where the claim is about shipped baseline behaviour, at
`origin/main` `11420461`. Commands are given inline so each finding is re-runnable.

Branch hygiene checked before review: `git rev-parse --abbrev-ref HEAD` → `feat-pdlc-advisory-wave-gate`;
local tip equals its remote (no stale base).

Size budget (C-5): the REQ measures 636 lines / 51,165 bytes against
`pdlc/hooks/scripts/check-req-size.sh` limits `LINE_LIMIT=700` / `BYTE_LIMIT=61440` — inside budget on
both axes. No finding.

**Maturity note (DEC-FRZ-01).** This document carries eleven authored versions and a long prior
approval history, and the feature it specifies is merged. I have therefore held myself to the
blocking bar DEC-FRZ-01 names for a matured document: a finding blocks only where it is a defect a
revision introduced, or a factual contradiction with the repository at HEAD. I filed no
restructuring, altitude-taste or wording findings, and I re-opened no settled decision. The one High
below is squarely in class (ii) — it is a contradiction with HEAD, not a preference.


## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
