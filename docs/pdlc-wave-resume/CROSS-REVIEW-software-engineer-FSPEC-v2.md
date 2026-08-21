# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-wave-resume/FSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 2
**Scope:** delta re-review. Prior cross-review `CROSS-REVIEW-software-engineer-FSPEC-v1.md`;
document diffed `f84dae68..HEAD`. Only my own v1 findings and the changed sections are in scope.

## Prior Findings — Disposition

Every v1 finding is resolved. Each row states the change and the check I ran against the tree the
FSPEC cites (`origin/main`, since the authoring tree still predates the mechanism — §1's standing
caveat, unchanged and still correct).

| v1 ID | Sev | Disposition | Verification |
|---|---|---|---|
| F-01 | High | **Resolved.** §3.4 gains "Completion is a high-water property of the plan, not of the run" with the two-halt worked example; BR-08 carries the monotonicity clause; AT-18 is the new two-halt acceptance test with a stated discriminating value. | The high-water reading is the shipped one: `formatWaveLedger(featureName, planHash, waveNum, waveHead)` is called with the loop's **absolute** `waveNum` (`orchestrate-dev.js:15600-15603`), and the reader resumes at `recorded.lastGreenWave + 1` (`:15335`). AT-18's "waves 1–3 **each** announced as skipped" is observable: the skip announcement is emitted per wave inside the loop (`:15373-15381`), not once. |
| F-02 | High | **Resolved.** EC-15 is narrowed to "**no** write succeeds"; new EC-15a carries the reachable partial case; BR-15 states the bound; AT-15 splits into two arms with arm 2 named as the discriminating one. | The partial shape is exactly the reachable one: `writeWaveLedger` catches per call (`:15350-15360`) and is invoked once per wave (`:15600`), so a later failure leaves the earlier record standing. EC-15a's cost bound — "the number of consecutive failed writes at the end of the run" — is right, because each write overwrites with an absolute wave number, so an interior failure costs nothing once a later write lands. |
| F-03 | Medium | **Resolved.** §3.2 now states question 5 has **three** answers and EC-21 carries the no-commit case as its own row, with the accepted cost named and bounded by BR-10 as EC-18 is. | `headCorroborated`'s absent-commit arm is `if (!recordedHead) return true; // pre-\`head\` record: honoured as before` (`:15281`), and `parseWaveLedger` makes `head` optional on read (`:12297-12302`). The FSPEC quotes the comment and names the symbol without a bare line anchor. |
| F-04 | Medium | **Resolved.** §3.2 states in bold that its order deliberately is not REQ-WVR-02's IG numbering, and forbids a downstream reader "correcting" it; AT-03's fixture is now the IG-5 × IG-4 pair with the reason it is the discriminating one. | The shipped chain is `feature` → `planHash` → `headCorroborated` → `lastGreenWave > waves.length` (`:15300-15317`), i.e. ancestry **before** over-count. AT-03's expectation (IG-5 announced) matches the shipped order and fails under the REQ's numbering — the test now discriminates. |
| F-05 | Medium | **Resolved.** AT-08 carries two positive conjuncts: the hatch is shown to function (record removed ⇒ outcome (a)), and set equality over the recognised `implementation.*` keys against a literal. | The literal is correct against the tree: `parseImplementationConfig` recognises exactly `testCommand`, `postWaveCommand`, `postWavePathspecs`, `startWave` (`:191-252`, `IMPLEMENTATION_DEFAULTS` `:169-174`) — the four the AT names, no more. A `forceFullRun` key would land in `invalidKeys` and fail the set equality. |
| F-06 | Medium | **Resolved.** BR-07 is scoped to runs that start anywhere other than the plan's first wave, plus operator-pointer and announced-disregard full runs; the IG-6 silent full run is named as "the absence of a resume", not an unattributed start. | Matches EC-01/EC-02 and the shipped silence: `parseWaveLedger` returns `{state: null, reason: null}` for absent, empty and `{}` content (`:12268-12271`), and only `ledger.reason` reaches `ignore()` (`:15297`). No contradiction with AT-02's IG-6 arm remains. |
| F-07 | Low | **Resolved.** §3.5's bare `orchestrate-queue.js:45` anchor is replaced by the symbol-named form ("imports `orchestrate-dev`'s `main` as `realMain`"). | `import realMain, { … } from "./orchestrate-dev.js";` — `orchestrate-queue.js`, single-line import as its own comment requires. DEC-DOC-01 satisfied. |
| F-08 | Low | **Resolved.** D-4/D-5 no longer render as malformed question rows: D-3 now carries both arms and the two terminal actions are bullets below the table. | Presentational; the routing is unchanged and still matches `allWavesRecorded` / `startWave` (`:15318-15344`). |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
