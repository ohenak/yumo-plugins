# Cross-Review: product-manager — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-19
**Iteration:** 4
**Scope:** Upstream-cascade confirmation only — PROPERTIES' own bytes are unchanged since the v3 approval (`REVIEWED-COMMIT: 87d4c233`); TSPEC moved from `sha256:79777fa6…` (v1.8) to `sha256:1531143c…` (v1.10 + Phase-P erratum). One question: does PROPERTIES still hold as approved against upstream as it now stands?

## Overview

**What moved.** Two upstream documents changed under this approval, not one:

| Upstream | At v3 approval | At HEAD | Bearing on PROPERTIES |
|---|---|---|---|
| TSPEC | `sha256:79777fa6…` (v1.8) | `sha256:1531143c…` (v1.10 + Phase-P erratum) | §1.3 and §5.1 re-grounded on HEAD; §4.4 affordance wording corrected; §3.2 step 2 `.enabled` sites re-anchored to symbols |
| REQ | `sha256:a10396e8…` (v1.8) | `sha256:817b6745…` (v1.9) | NFR-4 restated; §1 ledger citations re-anchored; C-2 `waveBudgetPerRun` default `1` restored |
| FSPEC | `sha256:82f74a2d…` | `sha256:82f74a2d…` | byte-identical — nothing owed |
| DECISIONS / PLAN | — | `sha256:25f8e954…` / `sha256:e97acf66…` | read for contradiction; none found against PROPERTIES |

**The one substantive shift.** TSPEC v1.10 stopped describing the A6 test-side transcription as
future work. Commit `e3b9d5a3` landed almost all of it ahead of Phase I, so §1.3 now carries an
`At HEAD` / `Residue` table and §5.1 gains a *Status column caveat* stating that `edited` and `new`
describe each file's required end state, **not work outstanding**, and that both files TSPEC calls
`new` — `advisoryWaveGate.test.js` and `pdlc/engine/__tests__/advisory-config-example.test.js` —
are already on disk.

PROPERTIES has a section that says the opposite, in its own voice, as a HEAD-verified claim. That
is the finding of this confirmation (F-01), and it is not on the routed item list — it is the
cascade itself (DEC-ERR-03). A second, softer instance of the same drift sits in the derivation
rules (F-02). The property *semantics* — what each PROP-* asserts, and which AC it serves — are
untouched by both upstream edits; nothing this round changed narrows, broadens or re-triggers an
acceptance criterion, and no property lost its requirement.

## Properties

*(pending)*

## Oracles

*(pending)*

## Fixtures

*(pending)*

## Findings

*(pending)*

## Questions

*(pending)*

## Positive Observations

*(pending)*

## Recommendation

*(pending)*
