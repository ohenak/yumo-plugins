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

`Batch` is derived mechanically — `batch == max(batch of deps) + 1`, sources in batch 1 — and is the
dispatcher's contract, not documentation.

| # | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|
| A6-00 | **Pre-flight gate.** Assert the shipped advisory-tier baseline this feature extends is importable at HEAD: `runAdvisorySeam`, `classifyEnvelope`, `appendAdvisoryEntry`, `appendEscalationEntry`, `resolveAdvisoryRung`, `parseAdvisoryVerdict`, `renderAdvisoryEntry`, `computeWaves`, `parsePlanOwnership`, `pathsCollide`, `commitPaths`, `gitWithLockRetry`, `checkWaveUnskips`, `effectiveGuardPaths`. Existence only, never shape. Creates the new suite file. | `pdlc/workflows/__tests__/advisoryWaveGate.test.js` | — | 1 | — | ⬚ |
| A6-01 | **[Fake first]** Test doubles and fixtures for A6: recording `_git` double (argv-verb counting, per TSPEC §5.2 the counted quantity is `commit-tree`, never raw call count), real-repository fixture builder (`mkdtempSync` + `execFileSync("git", …)`, the shape `advisoryDodSeams.test.js:371` already ships), A6 agent double with `ROOT-CAUSE:`/`PROMOTES:` trailers, and the `SEAMS` literal retargeted to six members (`advisoryDoubles.js:271`). | `pdlc/workflows/__tests__/helpers/advisoryDoubles.js` | — | 1 | — | ⬚ |
| A6-02 | **RED** — transcribed set-equality surfaces: `ADVISORY_SEAMS` six members, `ENVELOPE_DEFAULTS` `E-1`…`E-6`, `ADVISORY_ROOT_CAUSES` four members, `A6_PROHIBITIONS` `["f","g","h","i"]`, `ADVISORY_REFUSAL_REASONS` ordered-sequence (eight members, unchanged — capture failure adds no ninth), `ADVISORY_EXCLUSIONS` ordered-sequence. Set-equality, never `toContain`. Covers AT-01-1, AT-02-1, AT-03-1, AT-03-7, AT-03-8, AT-07-2 (this file's share). | `pdlc/workflows/__tests__/advisoryEnvelope.test.js` | — | 1 | — | ⬚ |
| A6-03 | **RED** — the re-declared `ADVISORY_DEFAULTS` literal gains `waveBudgetPerRun: 1`; the new `nonNegativeInt` validator's arms: `0` is a legal configured value (E-33), `-1` / `1.5` / `"x"` / `null` are invalid and fall back per-key. Covers AT-07-2b, AT-07-2 (this file's share). | `pdlc/workflows/__tests__/advisoryConfig.test.js` | — | 1 | — | ⬚ |
| A6-04 | **RED** — PROP-GATE-06: `Object.keys(GATE_EXCLUSIVITY_REGISTRY)` set-equal `ADVISORY_SEAMS` with an `A6` row added (`advisoryDriver.test.js:221`, `:846`). | `pdlc/workflows/__tests__/advisoryDriver.test.js` | — | 1 | — | ⬚ |
| A6-05 | **RED** — the per-seam `rows.map((r) => r.seam)` `test.each` surface gains its sixth row (TSPEC §1.3). Transcription only; AC-6.x behaviour lands in A6-19. | `pdlc/workflows/__tests__/advisoryRecord.test.js` | — | 1 | — | ⬚ |
| A6-06 | **RED** — harvest-side and property-side seam transcriptions retargeted to six members. | `pdlc/workflows/__tests__/advisoryHarvest.test.js`, `pdlc/workflows/__tests__/consolidationProperties.test.js` | — | 1 | — | ⬚ |
| A6-07 | **RED** — engine-channel expectation, newly authored (nothing in this file asserts on `advisory` today — verified, zero occurrences): the example config's `advisory` section parses and carries `waveBudgetPerRun` as a non-negative integer (TSPEC §4.4, §5.1). | `pdlc/engine/__tests__/ci-arrangement.test.js` | — | 1 | — | ⬚ |
| A6-08 | **GREEN** — constants and vocabularies (TSPEC §3.1): `ADVISORY_SEAMS` + `A6` (`orchestrate-dev.js:1947`), `ENVELOPE_DEFAULTS` + `E-5`, `E-6` (`:1938`), new `ADVISORY_ROOT_CAUSES` and `A6_PROHIBITIONS`, `ADVISORY_DEFAULTS.waveBudgetPerRun` (`:1940`), `ADVISORY_SEAM_PHASES.A6 = {id:"I", outcome:"halted"}`, and `parseAdvisoryConfig`'s new key via a new `nonNegativeInt` sibling of `positiveInt` (`:1960`). | — | `pdlc/workflows/orchestrate-dev.js` | 2 | A6-01, A6-02, A6-03, A6-04, A6-05, A6-06 | ⬚ |
| A6-09 | **GREEN** — the example config gains its `advisory` section with `waveBudgetPerRun`, operator-facing shape of §4.4's key. | — | `.claude/pdlc.config.example.json` | 2 | A6-07 | ⬚ |
| A6-10 | **RED** — pure helpers (TSPEC §3.4, §3.3): `waveOwnedPaths` / `laterOwnedPaths` as unions of `task.files` over the wave and over every later wave; `ownedSetCovers` delegating to `pathsCollide`, including the operator-visible trailing-slash precondition (`a/b/` covers `a/b/c.js`, `a/b` does not); `parseA6RootCause` totality over absent, wrong-cased and out-of-set inputs; `citesGateOutput` true only for a region present in `gateResult.output`. | `pdlc/workflows/__tests__/advisoryWaveGate.test.js` | — | 3 | A6-08 | ⬚ |
| A6-11 | **GREEN** — implement `waveOwnedPaths`, `laterOwnedPaths`, `ownedSetCovers`, `parseA6RootCause`, `citesGateOutput`. Pure; no `process`, no clock, no ambient state (DC-04). | — | `pdlc/workflows/orchestrate-dev.js` | 4 | A6-10 | ⬚ |
| A6-12 | **RED** — snapshot/restore on a **real temporary git repository**, never a fake `_git` (TSPEC §5.2): content-hash map taken immediately before A6 acts equals the map after restore, over tracked and untracked files alike; `git status`-level comparison explicitly not the oracle; `restoreTreeSnapshot` throwing on any `ok !== true` and the throw reaching the terminal catch as `__isRevertFailure`; the wave-scoped ref name `refs/pdlc/a6-snapshot-{waveNum}`. One case — the `.gitignore`d-paths round trip — is marked **upstream-pending on OQ-7** with its expected value named, not asserted. Covers AT-05-1, AT-05-2, AT-05-5. | `pdlc/workflows/__tests__/advisoryWaveGate.test.js` | — | 5 | A6-11 | ⬚ |
| A6-13 | **GREEN** — `captureTreeSnapshot` (`rev-parse HEAD`, `add -A`, `write-tree`, `commit-tree`, `update-ref refs/pdlc/a6-snapshot-{waveNum}`; `null` on any `ok !== true`) and `restoreTreeSnapshot` (`read-tree --reset -u`, `clean -fd`, `reset --mixed`; throws on any `ok !== true`), both through the injected `_git` transport, `add`/`reset` via `gitWithLockRetry` (DEC-A6-01, DEC-A6-03). | — | `pdlc/workflows/orchestrate-dev.js` | 6 | A6-12 | ⬚ |
| A6-14 | **RED** — the driver's one new optional seam (TSPEC §3.7): `classifyReply`'s three arms — `{ok:true}` and default `null` proceed to RE-CHECK unchanged for A1–A5; `{malformed:true}` reuses the existing malformed arm (`attempts += 1`, budget check, `continue`); `{terminate:{outcome,reason}}` terminates with `attempts` unchanged and `appliedSuccessfully:false`. Plus A6's rung parity (shared `rungState` memo, no second resolution) and dispatch-option parity member by member. Covers AT-02-7, AT-07-4, AT-07-5. | `pdlc/workflows/__tests__/advisoryDriver.test.js` | — | 7 | A6-13 | ⬚ |
| A6-15 | **GREEN** — `runAdvisorySeam` gains the optional `seamOps.classifyReply` hook, called once per attempt after `parseAdvisoryVerdict` and `_summarise`, before RE-CHECK. A hook, never an `if (seam === "A6")` branch — the gate-exclusivity registry asserts no seam has a private path. | — | `pdlc/workflows/orchestrate-dev.js` | 8 | A6-14 | ⬚ |
| A6-16 | **RED** — `buildA6SeamOps` member contracts (TSPEC §3.3): `gatherEvidence` passing the **full** `gateResult.output` (not `outputTail`'s 30 lines) and filling `declaredScope` in place; `classifyReply` over the four-class `ROOT-CAUSE:` trailer; `conditionHolds`; `apply` writing `ledgerAnchor.value = invocations.length` as its **first** statement and returning `{ok:true}` iff `producedPaths()` is non-empty; `producedPaths` as `git diff --name-only` unioned with `git ls-files --others --exclude-standard`; `revert`; `verifyGate` re-running the wave's own gate sequence; `permittedActions` narrowing `E-6` away on the last wave; the `ledgerAnchor` carrier initialised `{value: -1}`. Covers AT-02-3, AT-02-5, AT-03-4. | `pdlc/workflows/__tests__/advisoryWaveGate.test.js` | — | 9 | A6-15 | ⬚ |
| A6-17 | **GREEN** — implement `buildA6SeamOps` and its private helpers. `declaredScope` and `ledgerAnchor` are mutated in place, never reassigned and never hung on the returned object: the driver shallow-copies SeamOps (`orchestrate-dev.js:3499`, `:3503`). | — | `pdlc/workflows/orchestrate-dev.js` | 10 | A6-16 | ⬚ |
| A6-18 | **RED** — the call site `runWaveGateSeam` end to end (TSPEC §3.2, §5.2, §5.5): tier gate inertness; wave budget (two escalated waves leave `waveBudget.resolved` at `0`, one resolved wave increments to `1`); capture-failure disposition as six positive assertions on one run (record entry with Disposition `escalated` and **no** refusal reason, `Model` cell literal `n/a`, escalation entry containing the failing git verb, `attempts === 0`, unchanged budget, `commit-tree === 1`, no `_agent` call); the step-6 resolution rule and its **two mutation fixtures** for AC-4.1 conjunct (iii), each replacing exactly one real seam-op member (`{...seamOps, verifyGate: fake}`) and each asserting the positive half (`ledgerAnchor.value === 2` / `=== 4` with the four tokens attempt 1 produced); the eleven prohibition tests for `(f)`…`(i)` with a paired positive on every run per AC-4.5; the BR-1…BR-16 partition; the halt literal and halt fields. Covers AT-01-5, AT-02-2, AT-02-4, AT-02-6, AT-02-8, AT-02-9, AT-03-2, AT-03-3, AT-03-5, AT-03-6, AT-04-1, AT-04-1a, AT-04-1b, AT-04-2, AT-04-4, AT-05-3, AT-06-4, AT-07-1. | `pdlc/workflows/__tests__/advisoryWaveGate.test.js` | — | 11 | A6-17 | ⬚ |
| A6-19 | **RED** — AC-6.1's record obligations beside the shipped record oracle: the entry an A6 invocation writes, field set compared by **set-equality** against its transcribed literal (a dropped field passes a containment check); failed record write ⇒ action refused, carrying the tier's record-write-failure reason. Covers AT-06-1, AT-06-2. | `pdlc/workflows/__tests__/advisoryRecord.test.js` | — | 11 | A6-17 | ⬚ |
| A6-20 | **RED** — AC-6.2 / AC-6.4's escalation log: the entry carries the root-cause class and the tier's fields plus one sentence an operator can decide from; `plan-ordering-defect` reaches `docs/_queue/ESCALATIONS.md` durably; a failed escalation-log write leaves the disposition `escalated`, surfaces on the report's notice channel and is never upgraded to `resolved`. Covers AT-06-3, AT-06-5, AT-06-6. | `pdlc/workflows/__tests__/advisoryEscalationLog.test.js` | — | 11 | A6-17 | ⬚ |
| A6-21 | **GREEN** — implement `runWaveGateSeam`: steps 1–7 of TSPEC §3.2 (structural applicability, tier gate, wave budget with the shipped `__preDispatch` escape, snapshot before any dispatch, `buildA6SeamOps`, `runAdvisorySeam`, the step-6 growth-since-last-`apply` resolution check), the capture-failure disposition and escalation writes of §2.5, and §4.5's halt fields. | — | `pdlc/workflows/orchestrate-dev.js` | 12 | A6-18, A6-19, A6-20 | ⬚ |
| A6-22 | **RED** — the wave loop's own call-site obligations: A6 call count `0` on dispatch failure, on post-wave failure and on the V-wave's gate, with reason strings and queue row equal to the pre-A6 literals; committing writer identities equal to the pre-A6 baseline on a green gate; **§3.6's promotion commit** — the repair present in the branch's committed state with no residual working-tree change, identified by `message` and pathspec, plus the companion that is **red on today's behaviour** (a later task's paths lie outside `postWavePathspecs`, so M-WG-12 strands the repair uncommitted); the post-gate un-skip halt carrying §4.5's advisory fields while the repair stays in the tree; per-task `commitPaths` count `≥ 1` and A6 count `0` on an all-green run. Covers AT-01-2, AT-01-3, AT-04-3, AT-04-5, AT-05-4, AT-07-3. | `pdlc/workflows/__tests__/waveExecution.test.js` | — | 13 | A6-21 | ⬚ |
| A6-23 | **RED** — disabled-tier byte-identity extended to A6: with `advisory.enabled: false` and a red wave there is no dispatch, no rung resolution and **no snapshot**, created files are byte-identical to the pre-advisory baseline and the report carries no `advisory` key; paired with the enabled-but-quiet case where the key is **present** with six rows and A6's counter `0`. Covers AT-01-4, AT-01-6, AT-07-2 (this file's share). | `pdlc/workflows/__tests__/advisoryDisabled.test.js` | — | 13 | A6-21 | ⬚ |
| A6-24 | **GREEN** — Phase I wiring, the only edit to the shipped wave loop: extract `runWaveGateSequence` (post-wave + test, pushing one `"post-wave"`/`"test"` token per `runCommandFn` call into the per-wave `invocations` array), replace the unconditional `throw` at `orchestrate-dev.js:14364` with the §2.3 block that calls `runWaveGateSeamFn` on the test arm only, add §3.6's third `commitPaths` call for an E-6 promotion (full argument form, own `chore({feature}): wave {N} promotion ({taskId})` message — DEC-A6-02), extend `waveImplementPrompt` with the promotions clause, and thread A6's row into `advisorySummaryRows`. Steps 1–3, 5 and 7 keep their messages byte for byte. | — | `pdlc/workflows/orchestrate-dev.js` | 14 | A6-22, A6-23 | ⬚ |

### Batch gates

| Batch | Gate wording |
|---|---|
| 1 (RED-terminal) | The retargeted transcription surfaces and the new suite's first tests **fail for their named reason** — the five-member seam literal, the four-member envelope literal, the missing `waveBudgetPerRun` key, the missing `A6` registry row — and every other pre-existing test is green. A6-00's pre-flight assertions are green from the start; a red there means the baseline moved and the plan is invalid, not that the wave failed. |
| 3, 5, 7, 9, 11, 13 (RED-terminal) | The batch's new tests fail for the reason each names (the symbol under test does not exist yet, or exists without the new arm); all pre-existing tests, including every test greened by an earlier even batch, stay green. |
| 2, 4, 6, 8, 10, 12, 14 | Full `pdlc/workflows` suite green under `implementation.testCommand`, plus `node pdlc/workflows/build-runtime.mjs` clean as the post-wave command and `pdlc/workflows/dist/` committed via `implementation.postWavePathspecs`. |

### File-ownership manifest (Phase I)

One phase, one manifest. Directory rows carry the trailing slash `ownedSetCovers`/`pathsCollide`
requires (TSPEC §3.4; §6 OQ-10).

| Owning task | Files |
|---|---|
| A6-00 | `pdlc/workflows/__tests__/advisoryWaveGate.test.js` |
| A6-01 | `pdlc/workflows/__tests__/helpers/advisoryDoubles.js` |
| A6-02 | `pdlc/workflows/__tests__/advisoryEnvelope.test.js` |
| A6-03 | `pdlc/workflows/__tests__/advisoryConfig.test.js` |
| A6-04 | `pdlc/workflows/__tests__/advisoryDriver.test.js` |
| A6-05 | `pdlc/workflows/__tests__/advisoryRecord.test.js` |
| A6-06 | `pdlc/workflows/__tests__/advisoryHarvest.test.js`, `pdlc/workflows/__tests__/consolidationProperties.test.js` |
| A6-07 | `pdlc/engine/__tests__/ci-arrangement.test.js` |
| A6-08 | `pdlc/workflows/orchestrate-dev.js` |
| A6-09 | `.claude/pdlc.config.example.json` |
| A6-10 | `pdlc/workflows/__tests__/advisoryWaveGate.test.js` |
| A6-11 | `pdlc/workflows/orchestrate-dev.js` |
| A6-12 | `pdlc/workflows/__tests__/advisoryWaveGate.test.js` |
| A6-13 | `pdlc/workflows/orchestrate-dev.js` |
| A6-14 | `pdlc/workflows/__tests__/advisoryDriver.test.js` |
| A6-15 | `pdlc/workflows/orchestrate-dev.js` |
| A6-16 | `pdlc/workflows/__tests__/advisoryWaveGate.test.js` |
| A6-17 | `pdlc/workflows/orchestrate-dev.js` |
| A6-18 | `pdlc/workflows/__tests__/advisoryWaveGate.test.js` |
| A6-19 | `pdlc/workflows/__tests__/advisoryRecord.test.js` |
| A6-20 | `pdlc/workflows/__tests__/advisoryEscalationLog.test.js` |
| A6-21 | `pdlc/workflows/orchestrate-dev.js` |
| A6-22 | `pdlc/workflows/__tests__/waveExecution.test.js` |
| A6-23 | `pdlc/workflows/__tests__/advisoryDisabled.test.js` |
| A6-24 | `pdlc/workflows/orchestrate-dev.js` |

## Dependencies

*(section pending)*

## Verification

*(section pending)*
