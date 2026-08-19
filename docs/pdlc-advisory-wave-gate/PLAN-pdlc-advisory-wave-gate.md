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

Status key: ⬚ Not Started | 🔴 Red | 🟢 Green | 🔵 Refactored | ✅ Done

`Batch` is derived mechanically and is the dispatcher's contract, not documentation:
`batch == max(batch of deps) + 1`, sources in batch 1, **and no more than five tasks per batch** —
`computeTopologicalBatches` splits a wider topological layer into sub-batches of at most five
(`pdlc/workflows/orchestrate-dev.js:10805`), so a six-wide layer here would be re-labelled by the
dispatcher rather than run as written. Batch 1 is exactly five tasks for that reason.

| # | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|
| A6-00 | **Pre-flight gate.** Assert the shipped advisory-tier baseline this feature extends is importable at HEAD: `runAdvisorySeam`, `classifyEnvelope`, `appendAdvisoryEntry`, `appendEscalationEntry`, `resolveAdvisoryRung`, `parseAdvisoryVerdict`, `renderAdvisoryEntry`, `computeWaves`, `parsePlanOwnership`, `pathsCollide`, `commitPaths`, `gitWithLockRetry`, `checkWaveUnskips`, `effectiveGuardPaths`. Existence only, never shape. Creates the new suite file. | `pdlc/workflows/__tests__/advisoryWaveGate.test.js` | — | 1 | — | ⬚ |
| A6-01 | **[Fake first]** Test doubles and fixtures for A6: a recording `_git` double (argv-verb counting — per TSPEC §5.2 the counted quantity is `commit-tree`, never the raw call count, because `restoreTreeSnapshot` drives the same transport), a real-repository fixture builder (`mkdtempSync` + `execFileSync("git", …)`, the shape `pdlc/workflows/__tests__/advisoryDodSeams.test.js:371` already ships), an A6 agent double emitting `ROOT-CAUSE:` / `PROMOTES:` / `PROMOTES-TASK:` trailers, and the `SEAMS` literal retargeted to six members (`helpers/advisoryDoubles.js:271`). | `pdlc/workflows/__tests__/helpers/advisoryDoubles.js` | — | 1 | — | ⬚ |
| A6-02 | **RED** — the two constant-surface suites. `advisoryEnvelope.test.js`: `ADVISORY_SEAMS` six members, `ENVELOPE_DEFAULTS` `E-1`…`E-6`, `ADVISORY_ROOT_CAUSES` four members, `A6_PROHIBITIONS` `["f","g","h","i"]`, `ADVISORY_REFUSAL_REASONS` ordered-sequence (eight members, unchanged — capture failure adds no ninth), `ADVISORY_EXCLUSIONS` ordered-sequence. `advisoryConfig.test.js`: the re-declared `ADVISORY_DEFAULTS` literal gains `waveBudgetPerRun: 1`, and the new validator's arms — `0` is a legal configured value (E-33), `-1` / `1.5` / `"x"` / `null` are invalid and fall back per key. Set-equality throughout, never `toContain`. Covers AT-01-1, AT-02-1, AT-03-1, AT-03-7, AT-03-8, AT-07-2b, AT-07-2 (these two files' share). | `pdlc/workflows/__tests__/advisoryEnvelope.test.js`, `pdlc/workflows/__tests__/advisoryConfig.test.js` | — | 1 | — | ⬚ |
| A6-03 | **RED** — the four collateral transcription surfaces §1.3 names, retargeted to six seams in one task so the intended red is one edit's consequence and never a mystery: `advisoryDriver.test.js`'s `GATE_EXCLUSIVITY_REGISTRY` gains its `A6` row (`:221`, keys compared to `ADVISORY_SEAMS` at `:846`); `advisoryRecord.test.js`'s per-seam `rows.map((r) => r.seam)` `test.each` gains a sixth row; `advisoryHarvest.test.js` and `consolidationProperties.test.js` retarget their seam literals. Transcription only — AC-6.x behaviour lands in A6-16, the driver's new arm in A6-11. | `pdlc/workflows/__tests__/advisoryDriver.test.js`, `pdlc/workflows/__tests__/advisoryRecord.test.js`, `pdlc/workflows/__tests__/advisoryHarvest.test.js`, `pdlc/workflows/__tests__/consolidationProperties.test.js` | — | 1 | — | ⬚ |
| A6-04 | **RED** — engine-channel expectation, newly authored (nothing in this file asserts on `advisory` today — verified, zero occurrences): the example config's `advisory` section parses and carries `waveBudgetPerRun` as a non-negative integer (TSPEC §4.4, §5.1). | `pdlc/engine/__tests__/ci-arrangement.test.js` | — | 1 | — | ⬚ |
| A6-05 | **GREEN** — constants and vocabularies (TSPEC §3.1): `ADVISORY_SEAMS` + `A6` (`orchestrate-dev.js:1947`), `ENVELOPE_DEFAULTS` + `E-5`, `E-6` (`:1938`), new frozen `ADVISORY_ROOT_CAUSES` and `A6_PROHIBITIONS`, `ADVISORY_DEFAULTS.waveBudgetPerRun` (`:1940`), `ADVISORY_SEAM_PHASES.A6 = {id: "I", outcome: "halted"}`, and `parseAdvisoryConfig`'s one new key through a new `nonNegativeInt` sibling of the shipped `positiveInt` (`:1960`) — the shipped validator requires `v >= 1` and E-33 requires `0` to survive. | — | `pdlc/workflows/orchestrate-dev.js` | 2 | A6-01, A6-02, A6-03 | ⬚ |
| A6-06 | **GREEN** — the example config gains its `advisory` section carrying `waveBudgetPerRun`, the operator-facing shape of §4.4's key. | — | `.claude/pdlc.config.example.json` | 2 | A6-04 | ⬚ |
| A6-07 | **RED** — pure helpers (TSPEC §3.4, §3.3): `waveOwnedPaths` / `laterOwnedPaths` as unions of `task.files` over the wave and over every later wave, read from what `computeWaves` already annotates; `ownedSetCovers` delegating to `pathsCollide`, including the operator-visible trailing-slash precondition (`a/b/` covers `a/b/c.js`, `a/b` does not); `parseA6RootCause` total over absent, wrong-cased and out-of-set trailers; `citesGateOutput` true only for a region actually present in `gateResult.output`. | `pdlc/workflows/__tests__/advisoryWaveGate.test.js` | — | 3 | A6-05 | ⬚ |
| A6-08 | **GREEN** — implement `waveOwnedPaths`, `laterOwnedPaths`, `ownedSetCovers`, `parseA6RootCause`, `citesGateOutput`. Pure: no `process`, no clock, no ambient state. | — | `pdlc/workflows/orchestrate-dev.js` | 4 | A6-07 | ⬚ |
| A6-09 | **RED** — snapshot/restore round trips on a **real temporary git repository**, never a fake `_git` (TSPEC §5.2: this is the one place an injected double would echo the assertion rather than test it): the content-hash map taken immediately before A6 acts equals the map after restore, over tracked and untracked files alike, generated outputs included; a companion pinning that a `git status`-level comparison is explicitly **not** the oracle, because re-running the post-wave command rewrites an already-dirty path without changing the hash map; `restoreTreeSnapshot` throwing on any `ok !== true`, tagged `__isRevertFailure` and rethrown by the driver's terminal catch; the wave-scoped ref name `refs/pdlc/a6-snapshot-{waveNum}`. The `.gitignore`d-path round trip is written with its expected value named but **marked upstream-pending on OQ-7**. Covers AT-05-1, AT-05-2, AT-05-5. | `pdlc/workflows/__tests__/advisoryWaveGate.test.js` | — | 5 | A6-08 | ⬚ |
| A6-10 | **GREEN** — `captureTreeSnapshot` (`rev-parse HEAD`, `add -A`, `write-tree`, `commit-tree`, `update-ref refs/pdlc/a6-snapshot-{waveNum}`; returns `null` on any `ok !== true`) and `restoreTreeSnapshot` (`read-tree --reset -u`, `clean -fd`, `reset --mixed`; throws on any `ok !== true`), both over the injected `_git` transport, with `add` and `reset` through `gitWithLockRetry` for the reason `commitPaths` already retries them. DEC-A6-01 (dangling snapshot commit, never `git stash`) and DEC-A6-03 (wave-scoped ref, no run discriminator). | — | `pdlc/workflows/orchestrate-dev.js` | 6 | A6-09 | ⬚ |
