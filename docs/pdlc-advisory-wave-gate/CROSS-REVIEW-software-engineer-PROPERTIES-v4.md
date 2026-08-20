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

No property *statement* is disturbed by the v1.10 edit. Each property below is checked against the
upstream text it now leans on, at its current version.

- **PROP-SEAM-02** (`:73`) traces to TSPEC §1.3 and enumerates the coupled transcription surfaces
  by raw line pin. §1.3 is the section v1.10 rewrote hardest: it now carries a new
  *"State of these surfaces at HEAD"* table stating that `advisoryEnvelope`, `advisoryConfig`,
  `advisoryDriver`, `advisoryHarvest`, `consolidationProperties`, `helpers/advisoryDoubles` and
  **all four bare row-count sites** already carry their six-member form at HEAD, with only
  `advisoryRecord.test.js`'s `rows.map((r) => r.seam)` equality untranscribed. The property's
  *claim* survives that unchanged — the surfaces are still transcription surfaces and must still
  read six as one set. What does not survive is the anchoring, see F-02/F-03.
- **PROP-SEAM-01, PROP-CTR-01, PROP-ENV-01, PROP-ENV-10** trace to TSPEC §3.1, untouched by v1.10.
  Unchanged and still faithful.
- **PROP-CTR-13 / PROP-CFG-02** lean on §4.4's `waveBudgetPerRun: 0` arm. v1.10 rewrote §4.4's
  prose — `0` is now an *"intended operator configuration (honoured, not documented anywhere
  operator-facing this feature ships)"* rather than a *"documented operator affordance"*, and §6's
  close was reworded to match. I checked both properties against the new wording: neither asserts
  anything about documentation or about the example file *teaching* the affordance. They assert
  behaviour — `0` survives validation and reads back `0`; the tier stays enabled, the wave escalates
  `budget-exhausted` with zero `_agent` calls, and `report.advisory` is present with the sixth row
  at zero. That is precisely the guarantee §4.4 still makes ("what the feature does guarantee about
  `0` is behavioural and fully asserted"). No cascade.
- **PROP-CFG-03** leans on §4.4 and §5.1. v1.10 narrowed §5.1's example row to
  *"the shipped-default pairing only — it does not teach E-33's `0`-with-`enabled: true`
  affordance"*. PROP-CFG-03 asserts only that the whole `advisory` section is present, parses,
  carries both keys and holds a non-negative integer, plus the `testCommand` blast-radius conjunct.
  Still a faithful compression; its `ci-arrangement.test.js` pins have drifted (F-04).
- **PROP-DIS-06's neighbours and §3.2 step 2's `.enabled` constraint.** v1.10 re-anchored §3.2's
  three `.enabled` sites from `orchestrate-dev.js:3258` / `:13678` / `orchestrate-queue.js:1318` to
  symbol anchors, and quoted the queue-side conjunction in full. PROPERTIES carries no line pin into
  those three sites and states the constraint behaviourally, so it inherits the repair for free.
- **PROP-REC-07** — the subject of the v3 confirmation — is untouched by this edit and still holds.

## Oracles

_TBD_

## Fixtures

_TBD_

## Delta-Confirmation Findings

_TBD_

## Verdict

_TBD_
