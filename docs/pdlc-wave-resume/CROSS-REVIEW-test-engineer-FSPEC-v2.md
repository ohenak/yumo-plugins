# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/FSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 2
**Scope:** delta re-review. Prior findings from `CROSS-REVIEW-test-engineer-FSPEC-v1.md`, plus new issues in the changed sections only.

## Delta Base and Verification Method

Base of the delta: `ff55d9ea` (the commit at which v1 was written). Diff:
`git diff ff55d9ea..HEAD -- docs/pdlc-wave-resume/FSPEC-pdlc-wave-resume.md` — 159 insertions,
48 deletions across §2, §3.1, §3.2, §3.4, §3.5, §4 (BR-07, BR-08, BR-11, BR-15), §5 (EC-09,
EC-15/EC-15a, EC-16, EC-20, EC-21) and §6 (AT-02, AT-03, AT-04, AT-08, AT-10, AT-12, AT-13,
AT-14, AT-15, AT-17, AT-18), plus §7 (OB-F5, OB-F6, round-1 note).

Every claim the delta newly asserts about shipped behaviour was re-verified against
`origin/main:pdlc/workflows/orchestrate-dev.js` (the tree is still 1637 commits behind
`origin/main`, so the mechanism is not readable at `HEAD` — OB-F1 remains undischarged).

| New claim in the delta | Verification | Result |
|---|---|---|
| §3.2 / EC-21: a record naming no commit **passes** question 5, arm commented "pre-`head` record: honoured as before" | `headCorroborated` at `:15280`; `if (!recordedHead) return true; // pre-\`head\` record: honoured as before` at `:15281` | verbatim, holds |
| §3.2: shipped order is feature → plan → **ancestry** → over-count, i.e. IG-5 before IG-4, diverging from the REQ's numbering | chain at `:15300` (feature), `:15305` (planHash), `:15307` (`!(await headCorroborated(...))`), `:15313` (`lastGreenWave > waves.length`) | holds — AT-03's fixture pair is the discriminating one |
| BR-15 / EC-15a: recording is **per wave**, so a failed write costs only the waves after the last successful one | `writeWaveLedger(formatWaveLedger(featureName, planHash, waveNum, waveHead), ...)` is called inside the `for (let waveIndex...)` loop, under `if (waveGit)` (`:15531` opens, write at `:15600`) | holds |
| BR-08 / §3.4 / AT-18: completion is a **high-water property of the plan**, counted from the plan's first wave | the recorded number is `waveNum = waveIndex + 1`, plan-absolute, not run-relative; skipped waves `continue` at `:15381` before any write | holds — AT-18's discriminating value is real |
| EC-20 / AT-12: the V-wave is reached **unconditionally** after the wave loop, outside `allWavesRecorded` | `if (allWavesRecorded) break` at `:15372` exits the loop only; `recordPhase("I", ..., "⏭")` at `:15615`; `phaseFn("Phase PT: PROPERTIES Tests (Phase I V-wave)")` at `:15656` is unguarded | holds |
| AT-12: under a script-owned gate the V-wave invokes the gate command exactly once | `if (scriptGate) { const vGate = await runCommandFn(implConfig.testCommand); }` at `:15672-15673` | holds |
| AT-08: the recognised `implementation.*` keys are exactly {`testCommand`, `postWaveCommand`, `postWavePathspecs`, `startWave`} | `parseImplementationConfig`'s return shape at `:12245-12250`; no fifth key is read anywhere (`grep -n "implConfig\."`) | **exact** — the literal in AT-08 is transcribable as written |
| EC-20: the V-wave "**commits** on every invocation" | the script commits nothing for the V-wave; the commit is an instruction in `propertiesTestPrompt` ("All tests must pass before committing. Commit and push.", `:10565`) and is never verified | **overstated** — see F-01 |
| AT-14's branch precondition: the ignore rule is absent from this tree | `grep -n pdlc-wave-state .gitignore` → no match at `HEAD` | holds; correctly stated as a branch-state consequence |

## Prior Findings — Disposition

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
