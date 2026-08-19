# PROPERTIES — pdlc-advisory-wave-gate

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → DECISIONS → PLAN → **PROPERTIES**` |
| Downstream | `IMPL` and its tests |
| Cross-Reviews | *(none yet — active while Phase PT runs)* |
| LEARNINGS | `docs/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md` |

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-08-19 | First authored against REQ v1.8, FSPEC v1.4, TSPEC v1.6, DECISIONS (DEC-A6-01…DEC-A6-04) and PLAN v1.2. |

---

## Overview

**What this document is.** The testable-property set for the sixth advisory seam, `A6`, which fires
at exactly one place — a Phase I implementation wave whose script-owned test gate returned non-zero
— attempts one bounded, reversible repair inside a declared envelope, re-runs the wave's whole gate
sequence, and otherwise leaves the pipeline's control flow exactly as it ships today.

**Scope.** Properties derive from REQ v1.8 (AC-1.1…AC-6.4, NFR-1…NFR-6), FSPEC v1.4 (BR-1…BR-16,
E-01…E-33, AT-01-1…AT-07-5), TSPEC v1.6 (§2–§5) and DECISIONS (DEC-A6-01…DEC-A6-04). Every property
names the requirement or spec section it derives from and the PLAN task that owns its test file. No
property ranges over the wave gate itself, wave partitioning, or the commit discipline: those are
correct today (M-WG-3, M-WG-4) and REQ §4 puts them out of scope.

**Where the tests live.** One new suite, `pdlc/workflows/__tests__/advisoryWaveGate.test.js`
(verified absent at HEAD), carries the seam's own behaviour; ten existing suites under
`pdlc/workflows/__tests__` are edited (all ten verified present at HEAD, including
`advisoryEscalationLog.test.js` and `waveExecution.test.js`); one new engine-channel file,
`pdlc/engine/__tests__/advisory-config-example.test.js` (verified absent at HEAD), carries the
example-config expectation. Test homes below are PLAN-owned: no property names a file the PLAN's
file-ownership manifest does not assign to a task.

**Test levels.** The pyramid here is deliberately bottom-heavy, and one level assignment is
load-bearing rather than economical:

| Level | What sits here | Why |
|---|---|---|
| Unit | Constants and transcribed set-equalities, the two pure parsers (`parseA6RootCause`, `citesGateOutput`), owned-path set computation (`waveOwnedPaths`, `laterOwnedPaths`, `ownedSetCovers`), config validation, the driver's `classifyReply` arms | Pure functions with no seam, no clock, no ambient state (TSPEC §3, DC-04) |
| Integration | `runWaveGateSeam` end-to-end over injected `_agent`/`_git`/`_runCommand` doubles: budgets, dispositions, the ordered invocation ledger, prohibitions, record and escalation writes, halt fields | The routing decision — whether the seam is reached, what it consumes, what it writes — is only falsifiable on a run, not on a guard (see PROP-GATE-04, PROP-SEAM-05) |
| Integration (real repository) | Snapshot/restore round trips | A fake `_git` can only echo the fixture; BR-9's oracle is a content-hash map over a real tree (TSPEC §5.2) |
| E2E | *(none)* | The pipeline has no end-to-end harness for Phase I, and every observable this feature adds is reachable from the wave loop with injected transports |

**Two derivation rules this document applies throughout**, both inherited from the specs rather than
invented here:

1. **Cardinality surfaces are transcription surfaces.** A bare `expect(rows).toHaveLength(5)` is as
   coupled to `ADVISORY_SEAMS`' cardinality as a seam-name list is. All four such sites are verified
   at HEAD — `advisoryDisabled.test.js:622`, `advisoryQueueSeams.test.js:627`,
   `advisoryHarvest.test.js:571`, `advisoryHarvest.test.js:726` — and are property-covered as one
   set (PROP-SEAM-02), not left to a member-literal grep that structurally cannot find them.
2. **No absence-only oracle stands alone.** Every prohibition property carries a positive conjunct
   asserted on the same run (REQ AC-4.5): the disposition reached, the refusal reason recorded, the
   escalation entry written, or the shipped behaviour taken. Properties whose only assertion would
   be "X did not happen" are marked as such and paired explicitly.

## Properties

*(section pending)*

## Oracles

*(section pending)*

## Fixtures

*(section pending)*

## Coverage Matrix

*(section pending)*

## Gaps, Non-Properties and Routed Findings

*(section pending)*
