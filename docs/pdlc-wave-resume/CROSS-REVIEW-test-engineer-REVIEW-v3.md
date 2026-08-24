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

Every line citation below was re-checked against the working tree at `f59266b2`.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-14 | Medium | Cross-Feature | **Deciding the gate is permanent (Q-03) made its pinned fallback base permanently stale, and the new ancestry test structurally cannot detect that.** `PINNED_BASE_SHA` (`check-wave-resume-delta-coverage.mjs:54`) is this feature's *pre-feature* merge-base. The script's own header warns against exactly this shape — "Diffing against a sha behind the new base would count lines `main` contributed in that window as lines THIS feature introduced, and `orchestrate-dev.js` carries hundreds of uncovered lines outside this feature's reach — the oracle would go red on work it does not own" (`:26`-`:31`) — and the round-2 permanence decision converts the pin from a short-lived branch fallback into a base that recedes further behind `main` every week. On the fallback path a future branch's diff against `b029e853` includes this feature's ~200 lines plus everything `main` adds to the file thereafter; I measured **836** uncovered lines in `orchestrate-dev.js` today, so the collision surface is real. The new oracle Q-04 asked for — `waveResumeDeltaGate.test.js` › `the pinned fallback sha is a real ancestor of HEAD in this repository` — asserts `cat-file -t` and `merge-base --is-ancestor <pin> HEAD`, both of which stay true **forever** once the feature merges, so no amount of staleness reds it. Not gating: CI checks out with `fetch-depth: 0`, `origin/main` resolves, and the live merge-base wins (`:94`-`:111`), so the fallback path is not the one the required check takes. Resolutions, cheapest first: (a) on the fallback path, warn and `return 0` rather than diffing against a base that may be arbitrarily old — the same "cannot attribute, do not red" reasoning the F-08 fix already adopted; (b) prefer `GITHUB_BASE_REF` when present, which is the PR's actual base; (c) keep the pin but add an oracle that reds when it is *not* the merge-base with `origin/main` in a checkout where that ref resolves, turning the staleness into a maintenance signal instead of a latent red. | `check-wave-resume-delta-coverage.mjs:54`, `:26`-`:31`, `:94`-`:111`; `waveResumeDeltaGate.test.js` › `the pinned fallback sha is a real ancestor of HEAD in this repository` |
| F-15 | Low | Process | **A permanent, repo-wide policy is shipping under a feature-scoped name.** With the lifetime decided permanent, this gate now applies "zero uncovered lines inside your introduced ranges in `orchestrate-dev.js`" to *every* future branch that touches that file — a stricter bar than the repo's declared 85 % branch floor, and one no future author will find by searching for coverage policy, because the file is `scripts/check-wave-resume-delta-coverage.mjs`, its error text cites `PLAN §4.5.1` of a shipped feature, and its constant is `PINNED_BASE_SHA` of `feat-pdlc-wave-resume`. The behaviour is right; the naming and the citation are now wrong for what it is. Rename to a subject-scoped name (`check-orchestrate-dev-delta-coverage.mjs`), and cite `pdlc/OPERATIONS.md` — where the other three required-check rationales live — rather than a feature PLAN. I raise this as Process, not as severity: the gate is a good permanent control and deserves discoverability commensurate with being one. | `check-wave-resume-delta-coverage.mjs:1`-`:12`, `:54`; PLAN §4.5.1 |
| F-16 | Low | Local | Carried from v2 F-12, unchanged: `computePlanHash(` appears **16** times in `waveExecution.test.js` fixtures, so the ledger honour-vs-ignore precondition derives its expected value from the code under test and cannot red on hash-shape drift. One pinned 8-hex literal in the honoured-record fixture closes it. | v2 F-12 |
| F-17 | Low | Process | Carried from v2 F-13, unchanged: `PROP-RESUME-*`, `PROP-SKIP-*`, `PROP-OVERRIDE-*`, `PROP-RECORD-*`, `PROP-REPO-*` and `PROP-PRE-*` appear in no `it`/`describe` title (grep over `__tests__/` returns nothing), so PROPERTIES→test traceability stays manual. Harvest-time cleanup. | v2 F-13 |

## F-14 detail — the pinned fallback base is now permanently stale

## Questions

## Positive Observations

## Recommendation

## Verdict
