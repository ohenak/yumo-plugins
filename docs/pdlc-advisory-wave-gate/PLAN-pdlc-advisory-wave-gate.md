# PLAN — pdlc-advisory-wave-gate

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → DECISIONS → **PLAN**` |
| Downstream | `PROPERTIES`, `IMPL` |
| Cross-Reviews | *(none yet — active while Phase P runs)* |
| LEARNINGS | `docs/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md` |

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-08-19 | First authored against TSPEC v1.6 and DECISIONS (DEC-A6-01…DEC-A6-04). |

---

## Overview

**What gets built.** A sixth advisory seam, `A6`, fires at exactly one place — the Phase I wave
loop's script-owned test gate in `pdlc/workflows/orchestrate-dev.js` (`orchestrate-dev.js:14360`,
today an unconditional `throw haltError("Error: Wave N test gate failed …")` at `:14364`). A6
snapshots the whole tree, attempts one bounded in-envelope repair, re-runs the wave's own gate
sequence, and either resolves the wave or restores the snapshot byte-identically and lets the wave
halt on its pre-A6 literal with a diagnosis attached.

**Where it lands.** One production file: `pdlc/workflows/orchestrate-dev.js` (TSPEC §1.2 — the
workflow runtime loads one bundled artifact, so every advisory-tier symbol lives in one module).
Twelve test-side files, ten of which already exist. One second-channel pair
(`.claude/pdlc.config.example.json`, `pdlc/engine/__tests__/ci-arrangement.test.js`). No new module,
no new transport, no new credential.

**Shape of the plan.** Fourteen batches in strict red→green alternation. Every odd batch is
RED-terminal (its new or retargeted tests must fail for a named reason, all pre-existing tests
green); every even batch is a single-writer implementation batch on `orchestrate-dev.js` that turns
exactly the preceding batch's red tests green and leaves the whole suite green. The alternation is
forced, not stylistic: `implementation.testCommand` in `.claude/pdlc.config.json` runs the **whole**
`pdlc/workflows` suite at every wave gate, so a red test left standing across an even batch would
halt the next wave rather than drive it.

**Two facts about this feature that shape the batching.**

1. **The feature is not purely additive** (TSPEC §1.3). Six shipped surfaces transcribe the
   five-member seam set today and go red the moment `ADVISORY_SEAMS` gains `A6` — verified:
   `advisoryEnvelope.test.js`, `advisoryHarvest.test.js`, `consolidationProperties.test.js`,
   `advisoryRecord.test.js`, `__tests__/helpers/advisoryDoubles.js` (`SEAMS` literal at
   `advisoryDoubles.js:271`), and `advisoryDriver.test.js`'s `GATE_EXCLUSIVITY_REGISTRY`
   (`advisoryDriver.test.js:221`, keys compared to `ADVISORY_SEAMS` at `:846`). Batch 1 retargets
   all six **before** batch 2 touches the constant, so the red is the intended signal and never a
   mystery red discovered mid-wave.
2. **Almost all production code lives in one file.** Batch-safety rule 2 (single writer per file per
   batch) therefore serialises the implementation tasks completely: `orchestrate-dev.js` is written
   by exactly one task per batch, and parallelism exists only among test-side tasks in the odd
   batches.

**Not in scope here.** OQ-7 (`.gitignore`d paths inside BR-9's restoration oracle) is upstream-pending
on FSPEC `BR-9` / `AT-05-1` and REQ `AC-5.1`. Per TSPEC §6 OQ-9 the plan does **not** wait for it:
task `A6-12` mints the ignored-path round-trip case with its expected value marked pending, and
transcribes whichever boundary the erratum returns.

## Batches

*(section pending)*

## Dependencies

*(section pending)*

## Verification

*(section pending)*
