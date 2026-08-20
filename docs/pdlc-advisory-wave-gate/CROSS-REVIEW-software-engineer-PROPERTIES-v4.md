# Cross-Review: software-engineer — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-19
**Iteration:** 4 (upstream-cascade confirmation — PROPERTIES bytes unchanged; TSPEC moved v1.8 → v1.10)

## Overview

This is an **upstream-cascade confirmation**, not a re-review. PROPERTIES' own bytes are unchanged
since the v3 approval (`REVIEWED-COMMIT: 87d4c233`, `sha256:08ad37cc…` at HEAD). What moved is
TSPEC: my v3 anchor recorded `UPSTREAM-STATE: TSPEC sha256:79777fa6…` (v1.8, commit `18000ae4`);
HEAD carries `sha256:1531143c…` (v1.10). I re-read my v3 cross-review, then read
`git diff 18000ae4 HEAD -- .../TSPEC-…md` in full (14 hunks) and re-read the edited §1.3, §3.2,
§4.4, §5.1 and §6 regions at their current bytes.

Two upstream anchors other than TSPEC also moved since v3 and I checked them because DEC-ERR-03
scopes me to *upstream at HEAD*, not to the dispatched item list: REQ moved `a10396e8…` →
`817b6745…` (v1.9, restoration round) and DECISIONS/PLAN moved as well. FSPEC is byte-identical.
Nothing in REQ v1.9 is cited by a PROPERTIES row in a way the restoration disturbs — REQ §5's C-2
still carries `waveBudgetPerRun` default `1`, which is what PROP-CFG-01/-02 assert — so no finding
below is REQ-driven.

The single question: **does PROPERTIES still hold as a faithful compression of TSPEC as it now
stands?** It does not. The v1.10 edit's largest move is not a wording repair — it is a re-grounding
of §1.3 and §5.1 **on the branch as it actually stands**, recording that commit `e3b9d5a3` already
landed almost all of A6's test-side transcription ahead of Phase I, that the production side did
not move, and that the workflows suite is therefore **red at HEAD**. PROPERTIES' Overview and
PROP-SEAM-02 still describe the pre-`e3b9d5a3` world, and they do so with explicit
*"verified at HEAD"* / *"verified absent at HEAD"* claims. Those claims are now false against the
same HEAD their upstream just re-grounded on, which is exactly the class DEC-ERR-03 makes a finding
of this confirmation. Two High findings follow; both are repairs of current-state prose, and
neither reopens a settled property or its oracle.

## Properties

_TBD_

## Oracles

_TBD_

## Fixtures

_TBD_

## Delta-Confirmation Findings

_TBD_

## Verdict

_TBD_
