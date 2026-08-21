# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 3
**Scope:** delta re-review of the v1.3 → v1.4 revision (`005dc47d..f256d767`), testing lens

## Verification Method

Same evidentiary base as round 2: this branch is 1,637 commits behind the default branch and
predates the mechanism, so every code claim was re-read from `git show origin/main:...` rather
than from this tree — which is exactly what the v1.4 header now instructs a reader to do. Six
claims the delta newly rests on, each re-derived rather than believed:

- **The ledger write's guard.** In `origin/main:pdlc/workflows/orchestrate-dev.js` the
  `writeWaveLedger` call sits nested inside the wave loop's `if (waveGit)` branch — the same
  branch that opens `// Only now — verified — does anything get committed`, holds the per-task
  `commitPaths` loop, and stamps `head` from `rev-parse HEAD`. The `if (scriptGate)` block is a
  sibling that has already closed. The code's own comment states the same guard the REQ now
  states: *"The ledger records COMMITTED waves only … without a git transport this run made no
  commits."* Precondition 1 as rewritten is true.
- **The decision ladder, one branch per IG row.** The ladder is `ledger.reason` → feature
  mismatch → `planHash` mismatch → `headCorroborated` → `lastGreenWave > waves.length` →
  `=== waves.length` → resume. Five distinct rejection mechanisms, each with its own `ignore(…)`
  notice, plus the silent `{}`/absent case in `parseWaveLedger`. Six rows, six mechanisms.
- **`explicitPointer` precedes the clamp.** `const explicitPointer = startWave > 1;` is the
  statement immediately above the `startWave > waves.length` clamp, and the ledger read is guarded
  by `if (!explicitPointer)`. A past-the-end pointer therefore still suppresses the ledger, as §1's
  correction and OB-1 both now say.
- **The phase row.** `allWavesRecorded` selects `recordPhase("I", "Implementation", "⏭", "Skipped
  — all N waves previously committed and recorded green (wave ledger)")`; the executed path selects
  the same `"I"` row with `"✅"`. One row, two statuses — which is the reading REQ-WVR-08 now pins.
- **Nothing clears the record.** No `unlink`/delete of `WAVE_STATE_PATH` exists anywhere in the
  file; the only occurrences besides read/write are the two banner strings. The superseded-position
  block's account of why self-clearing was rejected is accurate.
- **The baseline file.** `origin/main:docs/_constraints/pdlc-wave-gate-baseline.md` carries
  `Version | 1.2 · 2026-08-20`, sections through `## 4.`, ids through `M-WG-14`, and the control
  rule *"A consumer cites this file at its `Version`"*. OB-2's restated recipe (next unoccupied
  section `## 5.`, bump 1.2 → 1.3, never a fixed number) matches the file.

Two further checks: the live `.claude/pdlc-wave-state.json` still reads
`{feature: "pdlc-advisory-wave-gate", lastGreenWave: 7, head: "8b13bd41…"}` and `git ls-files`
does not list it, so §1's re-verified observation and REQ-WVR-10's untrackedness both hold;
`origin/main:.gitignore:41` still carries the root-anchored `/.claude/pdlc-wave-state.json`, so
C-1 is unchanged. `waveExecution.test.js` carries the wave-ledger describe block OB-1 now cites by
name rather than by line.

## Round-2 Findings — Disposition

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
