# Cross-Review: test-engineer — TSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md
**Round type:** upstream-cascade confirmation (TSPEC bytes unchanged; REQ moved v1.15 → v1.16)
**Upstream at this dispatch:** REQ sha256:f97f4f66…, FSPEC sha256:91ef2557…
**Prior round:** CROSS-REVIEW-test-engineer-TSPEC-v1.md (Approved with minor changes; REVIEWED-COMMIT 95d8d2e4; UPSTREAM-STATE REQ sha256:c62cfc35…, FSPEC sha256:91ef2557…)
**Date:** 2026-08-20
**Iteration:** 2

## Overview

This is a cascade confirmation, not a re-review. The TSPEC's own bytes are unchanged since
REVIEWED-COMMIT `95d8d2e4`, which my v1 round approved. What moved is REQ: an erratum round took it
from v1.15 to v1.16 after my approval was recorded, so the question here is the narrow one — is this
TSPEC still a faithful compression of REQ **as REQ now stands**?

**The delta.** `git diff e69cdecc..HEAD -- REQ` is 12 lines across two hunks: the status-table
version bump plus a v1.16 changelog paragraph, and four new lines inside **AC-6.3**. The substantive
edit is the AC-6.3 addendum, which lands DEC-A6-03's operator-facing halt-message obligation that had
been routed since round 5 and never landed:

> Where the halt report points the operator at a captured pre-A6 tree state, it also warns, in the
> same place, that re-running this feature overwrites that capture — so an operator who intends to
> inspect it preserves it first, rather than losing it to the ordinary next action after a halt
> (DEC-A6-03).

FSPEC is byte-identical to the version my v1 round recorded in UPSTREAM-STATE
(`sha256:91ef2557…`), so every TSPEC↔FSPEC binding I approved stands untouched and is not re-opened
here.

**The answer is no, and narrowly so.** AC-6.3 now carries a *new operator-visible conjunct* — a
warning sentence on the halt report — and this TSPEC has no design home and no oracle for it. The
overwrite hazard itself is thoroughly analysed in the document (§2.5, §6 OQ-2), but analysed as an
**accepted, record-only cost**, which is precisely the disposition REQ v1.16 supersedes. That is one
High, scoped to one paragraph of §4.5 and one row of §5.6; everything else in the document re-reads
clean against REQ v1.16.

## Architecture

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
