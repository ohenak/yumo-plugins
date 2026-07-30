# CROSS-REVIEW — software-engineer — CODEBASE (Phase CR) — v1

**Feature:** `pdlc-review-loop-hardening`
**Reviewer:** se-review (Final Codebase Review, Phase CR)
**Scope:** Cross-Feature
**Branch:** `feat-pdlc-review-loop-hardening` @ `c563687`
**Diff range:** `2763eecb913104a912fd6e06aaba3186daa0f00c..c563687` (`git merge-base main HEAD`..HEAD)
**Date:** 2026-07-30

---

## 1. Review Bound and Method

**R-5 bound.** The diff is 104 files / +39,351 −1,926. Reviewed surface is the *production* surface only:

| In scope | Why |
|---|---|
| `pdlc/workflows/orchestrate-dev.js` (+2,803) | the feature's centre of gravity |
| `pdlc/workflows/orchestrate-queue.js` (+230) | `_git` seam, drift gate, `rewriteStatus` |
| `pdlc/workflows/runtime-adapter.js` (+102) | three new seams, the only untested file |
| `pdlc/workflows/build-runtime.mjs` (+40) | the RLH-32 ordering hazard |
| `pdlc/workflows/dist/*` (generated) | verified as artifacts, not read as source |
| `pdlc/skills/*/SKILL.md` (9 files) | the prompt-side half of every new data contract |
| `pdlc/.claude-plugin/plugin.json`, `CLAUDE.md` | shipped operator-facing surface |

Out of scope, deliberately: the 50 `CROSS-REVIEW-*` round files, the six spec documents (read as
authorities, not reviewed), `docs/_queue/QUEUE.md`, `docs/requirements/traceability-matrix.md`, and the
~7,500 lines of new test code (read where it *is* the mechanism — §2, §6 — not audited as a whole).

**DC-02 method.** Every claim below is derived from command output or from the bytes at a named
construct. Where a claim is a universal ("no un-awaited seam call"), its falsifier is stated.

**Commands run:**

```
node pdlc/workflows/build-runtime.mjs --check      → exit 0, three rows in-sync
git merge-base main HEAD                            → 2763eecb…
```

Plus a parse harness that reconstructs the runtime's evaluation shape (§5) and three mechanical
alias/await scans over the two module sources (§2).

**R-6.** No citation or `file:line` drift is reported at any severity, per the review discipline.

## 2. Priority Surface — C-2 Await Discipline

**Result: clean. No un-awaited injected IO call exists in either module source.**

Three independent derivations, because this is the one defect class the green suite cannot see.

**(a) Direct call-site enumeration.** Every call of the nine seam names and their `main()`-level aliases
(`readFileFn`, `writeFileFn`, `appendFileFn`, `checkFileFn`, `listFilesFn`, `gitFn`, `recordHaltFn`,
`checkCiFn`, `mergeWorktreeFn`) across both files — 27 sites total — is lexically preceded by `await`.
Helper functions (`reviewLoop`, `refreshReviewState`, `appendApprovalAnchors`, `checkPostmortem`,
`tier2ApprovalRecord`, `dispatchAndVerify`) destructure the seams **shorthand** (`_readFile`, not
`_readFile: rf`), so the seed names themselves are the call-site names there — no alias to miss.

**(b) Reachability of every async helper.** I derived the set of `async function` / `async` arrow
declarations in both modules and located every call site not preceded by `await`. Three survive, all
correct:

| Site | Form | Why correct |
|---|---|---|
| `orchestrate-dev.js:1609` `dispatchAndVerify({…})` | entire body of the `wrapped` arrow | returned promise; `runWrapped:1632` awaits it |
| `orchestrate-dev.js:1765–1766` `runWrapped(…)` | elements of `await _parallel([…])` | awaited combinator argument |
| `orchestrate-dev.js:4264` `agentFn(…)` | element of `await parallelFn(batch.map(…))` | awaited combinator argument |

`orchestrate-queue.js:723` `return runPicked({…})` is a returned promise inside an `async` function,
awaited by `main`'s caller.

**(c) The in-repo scanner.** `__tests__/runtimeBundle.test.js` now carries `scanAwaitDiscipline`, run as
`RLH-AT-19` over both sources with a vacuity guard (`sites.length > 0`) and a named-failure assertion.
Its mechanism is sound and better than my (a): `maskLiterals` first, a thirteen-name seed set
(`AT19_SEAM_NAMES`) that is deliberately *not* derived from `main()` (`_now`, `_phaseDodEnabled` would
red correct source), a fixed-point wrapper closure so `agentFn` enters via `rawAgentFn`, and a
combinator set that excludes `Promise.race`/`Promise.any` because they settle on one element. The
returned-promise ruling tests **both** halves (`return`/`=>` before, whole-expression after), so
`return _checkFile(p) || fallback` is not exempted. This is a durable regression barrier, not a
one-time check.

**Falsifier for the whole section:** a call of any of the thirteen names, or of a local rebinding of
one, that reaches the runtime without `await` — i.e. `scanAwaitDiscipline` returning a site with
`ruling: "unclassified"`, or a seam aliased under a new name inside a non-`main` function's parameter
list. The first is asserted in CI; the second is F-4 below.

## 3. Priority Surface — RLH-32 Build Ordering and Seam Wiring

## 4. Priority Surface — runtime-adapter.js New Seams

## 5. Priority Surface — Runtime Structural Constraints

## 6. Priority Surface — RLH-AT-64 Exemption Predicate

## 7. Findings

## 8. Assessed and Cleared

## 9. Documentation Drift for Harvest

## 10. Recommendation

## Verdict
