# Cross-Review: software-engineer — REQ (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md (v1.15)
**Date:** 2026-08-20
**Iteration:** 5 (delta confirmation, erratum round Phase F)

## Problem / Context

I approved this REQ at v4. Since then one erratum edit landed across three commits
(`88c3554f`, `f3fbbc7b`, `0cef7148`), touching 15 lines and removing 7: the lineage header
(`Upstream`, `Cross-Reviews`, version/changelog), §6 AC-1.1, §6 AC-5.1, and §7 R-5. The routed list
carried one High (TE F-01, AC-5.1's carrier exclusion omitting AC-6.2), four Lows taken, and two
Lows explicitly not taken as inherited/nonlocal.

This round answers one question: does that delta land the routed items without breaking what v4
approved, and — per DEC-ERR-03 — is the document still a faithful compression of the upstream it
leans on, read at upstream's current bytes rather than at the version the REQ was written against.

## Goals

1. Confirm each routed item either landed in the bytes or is correctly recorded as not taken.
2. Re-read the upstream this REQ now cites — `docs/_constraints/pdlc-wave-gate-baseline.md` v1.2 and
   `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` — at HEAD, and verify every id and
   commit the delta newly pins is still said, and still said the same way, upstream.
3. Verify the edit broke nothing in the sections it did not target.

## Non-Goals

- Re-reviewing sections the erratum did not touch. Unchanged material approved at v4 stands.
- Re-litigating decisions this REQ already closed, or the two Lows dispositioned "not taken" —
  except where this round's own bytes changed the fact underneath one of them (see F-01).
- FSPEC/TSPEC/PLAN altitude material. Mechanism remains O-1's and TSPEC's.

## Constraints

## Acceptance Criteria

## Risks

## Obligations

## Delta-Confirmation Findings

## Verdict
