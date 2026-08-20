# Cross-Review: software-engineer — PROPERTIES (delta confirmation, round 5)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-20
**Iteration:** 5 (delta confirmation of the round-4 erratum)

## Overview

**Scope of this round.** Delta confirmation only. The dispatch reports every routed item ABSORBED
against upstream HEAD, so the question is not "did the items land" but the DEC-ERR-03 question:
measured against its upstream *at the versions named in this dispatch*, is PROPERTIES still a
faithful compression of them?

**Upstream at HEAD, verified.** I re-hashed all five upstream documents in the working tree; every
one matches the sha256 given in the dispatch (REQ `817b6745…`, FSPEC `82f74a2d…`, TSPEC `1531143c…`,
DECISIONS `84deee10…`, PLAN `e97acf66…`). So the upstream I read is the upstream this confirmation
is measured against — no silent drift underneath the round.

**The delta.** Six commits (`811f3484`…`0c0475a7`), +46/-21 lines, all prose. Nothing in the
property statements, categories, level assignments, oracle forms or PLAN homes moved — I diffed the
tables and confirmed the only table-cell edits are inside PROP-SEAM-02's and PROP-CFG-03's
*Property* cells and two Fixtures rows, and each of those edits changes a citation or a HEAD-state
sentence, never an assertion.

**Round-4 findings, disposition.**

| v4 finding | Severity | State after the delta |
|---|---|---|
| F-01 — Overview records both `new` files "verified absent at HEAD" | High | **Resolved.** Both files are on disk (`pdlc/workflows/__tests__/advisoryWaveGate.test.js`, `pdlc/engine/__tests__/advisory-config-example.test.js`); the paragraph now says so and quotes TSPEC §5.1's *Status column caveat* accurately, ellipsis and all. |
| F-02 — derivation rule 1 claims the four bare row-count sites read `toHaveLength(5)` at HEAD | High | **Resolved.** All four now recorded as already reading `6` and red at HEAD; I checked each site (see Oracles below). |
| F-03 — PROP-SEAM-02 carries raw line pins TSPEC re-anchored | Medium | **Resolved.** Re-anchored to symbol and block-title anchors per DEC-DOC-01, matching TSPEC §1.3's own re-anchoring. |
| F-04 — `ci-arrangement.test.js:799`–`:819` pins wrong | Low | **Resolved.** PROP-CFG-03 and the Example-config fixture now anchor on `const configPath` and the test title. |
| F-05 — Scope derives from "TSPEC v1.6" | Low | **Resolved.** Now TSPEC v1.10. |

**Nothing previously approved broke.** The edits are additive prose plus citation re-anchoring; no
property lost a requirement trace, a PLAN task home or a level.

## Properties

_(pending)_

## Oracles

_(pending)_

## Fixtures

_(pending)_

## Delta-Confirmation Findings

_(pending)_

## Verdict

_(pending)_
