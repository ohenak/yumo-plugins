# Cross-Review: test-engineer — Implementation Review (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-wave-resume/` implementation diff (`main...feat-pdlc-wave-resume`)
**Date:** 2026-08-24
**Iteration:** 3

## Scope and Method

Delta re-review. Base is `799ae90b` — the tree at which I wrote v2 — and the
range under review is `799ae90b..HEAD` (`f59266b2`): eighteen commits, six
files, +1060/−379, of which only three files are code or test
(`scripts/check-wave-resume-delta-coverage.mjs`, the new
`__tests__/waveResumeDeltaGate.test.js`, and 21 added lines in
`__tests__/waveResumeRepoState.test.js`); the rest is PLAN v1.6 and the two
round-2 cross-review files. I re-read only that material plus whatever my v2
findings pointed at.

What I ran rather than read:

| Check | Result |
|---|---|
| `npm test` (full `pdlc/workflows` suite) | 123 suites, **4495 passed**, 70 skipped, 0 failed |
| `npm test -- waveResumeDeltaGate waveResumeRepoState` | 34 passed |
| `node scripts/check-wave-resume-delta-coverage.mjs` (real repo, this branch) | exit **0**, `introduced ranges … 12846, 12855-12860, 12867-13005, 16206-16207, …`, `uncovered lines inside introduced ranges: 0 — OK` |
| **F-08 post-merge simulation** — the shipped gate driven through its new IO seam with `merge-base` returning `HEAD` (i.e. a base that already contains the feature), everything else real git | exit **0**: `no delta in range (merge-base with origin/main): no commit in f59266b2d2f6..HEAD touches it — nothing for this oracle to check.` This is the same experiment that returned `exit 1` in v2. |
| **Mutation of the F-08 fix** — reinstated `fail("no introduced ranges found")` ahead of the success path (ahead of `check-wave-resume-delta-coverage.mjs:193`) | `waveResumeDeltaGate.test.js` **2 failed**, 11 passed → RED; reverted, `git status` clean |
| `grep -c "computePlanHash(" __tests__/waveExecution.test.js` / `grep -rl "PROP-RESUME-\|PROP-SKIP-" __tests__/` | 16 / no hits — v2 F-12 and F-13 unchanged, still non-gating |

No production source changed this round (`orchestrate-dev.js` is untouched in
`799ae90b..HEAD`), so nothing I approved in the wave-resume behaviour itself
could have moved, and `dist/` needed no rebuild.

## Prior-Finding Disposition

| v2 ID | Sev | Status | Evidence |
|---|---|---|---|
| F-08 | **High** | **Resolved** | The empty-introduced-range set is no longer a `fail`. `check-wave-resume-delta-coverage.mjs:182`-`:198` splits the two readings mechanically: the subject **absent from the checkout** still fail-closes (`does not exist in this checkout … The path is wrong`), and the benign reading logs `no delta in range (<base source>): <reason> — nothing for this oracle to check` and `return 0`, with the reason distinguishing "no commit … touches it" from "the only hunks against the base are pure deletions" (`hadHunks`, `:132`). I did not take this on the doc's word: I re-ran the **shipped** module against real git with `merge-base` returning `HEAD` — the state of `main` the day after this merges — and got exit **0** with that message, where the same experiment in v2 returned exit 1. `process.exit` is gone from the module body: `runDeltaCoverageGate` returns a code and only the `invokedDirectly` guard (`:254`-`:256`) exits. The required check `Unit tests (ubuntu-latest, node 20)` therefore stays green on `main` and on branches that do not touch `orchestrate-dev.js`. |
| F-09 | Medium | **Resolved** | `__tests__/waveResumeDeltaGate.test.js` (227 lines, new) drives the gate through an injected IO seam — `git`, `fileExists`, `readFile`, `log`, `error`, `coverageJson`, `subjectPath` — with a synthetic Istanbul report and synthetic diffs. All four failure paths now have a falsifying case (`coverage-final.json` absent → `is absent` + the runnable instruction; subject absent from the report → names `coverageInstrumentation.test.js`; subject absent from the checkout → `The path is wrong`; unreachable pin with no `main` ref → `no base commit available`), and so do both positive paths (uncovered line **inside** a range reds and names line `101`; uncovered line **outside** every range is green and still reports `uncovered lines in file: 1` — the delta-scoping conjunct, not just an exit status). Every case asserts status **and** message, and the header says why. I mutation-checked the suite rather than trusting it: reinstating the round-1 `fail` on empty ranges (inserted ahead of `:193`) turns it RED (2 failed), so the F-08 fix has a falsifying test of its own — exactly what I asked for. |
| F-10 | Low | **Resolved, differently and defensibly** | I proposed failing on an uncommitted subject; the implementation warns instead (`:211`-`:230`), on the stated grounds that failing would block the local edit-and-run loop the gate exists to serve while CI is always clean. The warning names the file and the HEAD/working-tree offset, and it is covered by `an uncommitted subject warns about the HEAD/working-tree offset but does not red` (exit 0 + `WARNING` + `uncommitted changes`). Reasoned trade-off with an oracle behind it; I accept it. |
| F-11 | Low | **Resolved** | `waveResumeRepoState.test.js:232`-`:256` adds `EXPECTED_SUITES`, a **transcribed literal** of six names, and `both sides equal the transcribed literal set of six suites` asserts `{onDisk, manifest}` both equal it. A matched-pair deletion of a suite and its manifest row now reds, which the symmetric equality alone could not catch. The literal is transcribed, not derived from either side — no implementation echo. |
| F-12 | Low | **Open** (not gating) | `computePlanHash(` still appears 16 times in `waveExecution.test.js`; no literal 8-hex fixture pinned. Carried as F-16. |
| F-13 | Low | **Open** (not gating) | `PROP-RESUME-*` / `PROP-SKIP-*` still return no grep hits in `__tests__/`. Carried as F-17. |
| Q-03 | — | **Answered** | PLAN §1.6 (revision row) and the script header's `LIFETIME (Phase CR round 2, TE F-08 / Q-03)` block record the decision explicitly: the gate is **permanent**, not feature-duration, so an empty delta must read as success. That is fix option 1, the one I preferred. |
| Q-04 | — | **Answered in code, but only half of what the answer needs** | `waveResumeDeltaGate.test.js` › `the pinned fallback sha is a real ancestor of HEAD in this repository` asserts `cat-file -t <pin>^{commit} === "commit"` and `merge-base --is-ancestor <pin> HEAD` against the real repo, following the `learningsBaselineGuard.test.js` precedent I cited. That closes "the pin is a real commit". It does not close "the pin is still the right base" — see F-14. |

Both blocking items from v2 (F-08 High, F-09 Medium) are closed, and closed
with oracles I was able to falsify by mutation rather than with prose. Nothing
I had previously approved moved: no production source changed in this range, and
the full 4495-test suite is green.

## Findings

## F-14 detail — the pinned fallback base is now permanently stale

## Questions

## Positive Observations

## Recommendation

## Verdict
