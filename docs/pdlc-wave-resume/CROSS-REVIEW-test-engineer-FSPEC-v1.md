# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/FSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 1
**Scope:** testing lens only — testability, oracle falsifiability, edge-case completeness, AT derivability

## Grounding

Every claim below was checked against the repository, not against the FSPEC's prose. Because
this authoring tree does not contain the resume mechanism (FSPEC OB-F1 — confirmed:
`git rev-list --count origin/main ^HEAD` -> 1637, and `git grep WAVE_STATE_PATH` on `HEAD`
returns nothing), verification was done against `origin/main`, naming the symbol in each case.

| FSPEC claim | Verification | Result |
|---|---|---|
| §1 anchors `WAVE_STATE_PATH` :12214, `parseWaveLedger` :12267, `explicitPointer` :15236, clamp :15237-15244, `if (waveGit)` :15531, ledger write :15600, retention comment :15607-15615 | each line read on `origin/main:pdlc/workflows/orchestrate-dev.js` | all eight anchors resolve exactly as cited |
| §1 "ignore rule at `.gitignore:41`" | `git show origin/main:.gitignore` line 41 = `/.claude/pdlc-wave-state.json` | holds on `origin/main`; **absent from `HEAD`** (see F-09) |
| §1 "queue delegates in-process" | `origin/main:pdlc/workflows/orchestrate-queue.js:45` imports `realMain` from `./orchestrate-dev.js` | holds |
| §1 "commits and the record write are guarded by the transport, not the gate mode" | `if (scriptGate)` opens at :15432 and closes at :15494; `if (waveGit)` at :15531 is its **sibling**, not its child | holds — AT-09's companion arm is sound |
| §3.2 six questions, in that order | `parseWaveLedger` reason (:15364) -> feature (:15310) -> `planHash` (:15315) -> `headCorroborated` (:15317) -> `lastGreenWave > waves.length` (:15322) | order matches the spec exactly |
| §3.2 Q1 silent on absent/empty/`{}` | `parseWaveLedger` returns `{state:null, reason:null}` for `null`, `""` and `"{}"` (:12268-12272), and the caller only emits under `ledger.reason` | holds — EC-01/EC-02 correct |
| EC-06 unavailable probe is not staleness | `headCorroborated` returns `true` when `branchGuardTransport` yields nothing and on `catch` | holds — EC-07 correct |
| EC-13 gate green + no transport records nothing | ledger write is inside `if (waveGit)` (:15531/:15600) | holds |
| EC-14 no-change wave is still completed | a task with `paths.length === 0` `continue`s, yet `writeWaveLedger` still runs for the wave | holds |
| AT-12 "one row, not two" | `if (allWavesRecorded) recordPhase("I", ..., "⏭", ...)` else `recordPhase("I", ..., "✅", ...)` at :15615-15631 | one row, distinguishing status — holds |
| AT-12 "no gate executes, Phase I produces no commit" | **falsified** — see F-01 | does not hold |


## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
