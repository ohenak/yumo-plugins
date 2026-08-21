# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-wave-resume/DECISIONS-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 1
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity, and the fidelity of every *counted cost* this document stakes a decision on. Technical choice, test strategy and code quality are se-review's and te-review's lenses.

## What I verified, and how

This document's own frame promises that "where a *cost* is claimed below it is a counted cost, and
the count is stated with the command that produced it, not asserted from intuition". I took that
literally and re-ran the counts rather than reading them. Because this branch carries neither the
mechanism nor the wave-gate baseline, every check below was run against a detached worktree of
`origin/main` at `345ae358`, which is the base the document itself declares.

| Claim (DECISIONS §Context / §Options) | Verified? | Evidence |
|---|---|---|
| Branch is 1,637 commits behind; carries neither `WAVE_STATE_PATH` nor `docs/_constraints/pdlc-wave-gate-baseline.md` | ✅ | `git rev-list --count HEAD..origin/main` → `1637`; `grep -c WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js` → `0`; the baseline file does not exist at HEAD |
| `origin/main` is `345ae358` | ✅ | `git rev-parse origin/main` → `345ae35837dfb…` |
| Three module-level pure functions, one read site, one write site | ✅ | `computePlanHash`, `parseWaveLedger`, `formatWaveLedger` exported at `origin/main`; exactly one `writeWaveLedger(` call site, inside the `if (waveGit)` branch, as claimed |
| Shipped INTERIM header comment miscounts its own surface | ✅ | The comment reads "one path constant, **two** pure functions, one read site and **two** write sites" — the document's correction (three / one) is right |
| `parseWaveLedger` treats `""` and `"{}"` as absent, quoted verbatim (O-6) | ✅ | The quoted line is byte-exact at `origin/main` |
| `formatWaveLedger` always writes `version`/`feature`/`planHash`/`lastGreenWave` (+ optional `head`); nothing writes `{}` | ✅ | Both record shapes in the function body carry all four fields |
| Ancestry probe signature and its three fail-open arms (O-3) | ✅ | `await transport(["merge-base","--is-ancestor",recordedHead,"HEAD"])` with `transport = branchGuardTransport(gitFn)`; returns `true` for no `head`, no transport, and a throw |
| Ancestry is the **third** arm, below feature and plan-hash (O-4) | ✅ | Guard order in the shipped chain is `feature` → `planHash` → `headCorroborated` → over-count → complete → mid-plan |
| The shipped ancestry assertion is `toContainEqual`, i.e. containment (O-4) | ✅ | `expect(calls).toContainEqual(["merge-base","--is-ancestor",HEAD_SHA,"HEAD"])`, `waveExecution.test.js` |
| Waves execute serially in plan order behind one cut-off (O-7) | ✅ | `for (let waveIndex = 0; waveIndex < waves.length; waveIndex++)`, quoted exactly |
| `.gitignore` pins the path by a root-anchored rule, line 41 | ✅ | `/.claude/pdlc-wave-state.json` is line 41, under the anchor-rationale comment block |
| Runtime adapter binds `_git: rtGit` twice | ✅ | Two bindings in `runtime-adapter.js` |
| Queue delegates `runPipelineFn({ reqPath: entry.reqPath })`, defaulted to `realMain`, payload key set exactly `{reqPath}` | ✅ | `_runPipeline: runPipelineFn = realMain`; the single call site passes exactly one key |
| Seven disregard reasons, of which **three** interpolate (O-8) | ✅ | Three parse arms + four chain arms = seven; `feature-mismatch`, `head-unreachable`, `over-count` interpolate — and the document is right that TSPEC §3.1's "four" is wrong (raised as an erratum, below) |
| The provenance suffix leaves `expect(row.detail).toContain("recorded green (wave ledger)")` green | ✅ | The matcher is a substring matcher on an unchanged interior parenthesis |
| **Exactly three** shipped whole-string assertions change (O-5, DEC-WVR-03) | ✅ | The three named are the only whole-string equalities on the affected strings. The two other `phaseDetail(result,"I")` equalities on `All 1 waves complete (wave mode, …)` stay green **because** TSPEC §2.4 makes the row change conditional on a resume (`N > 1`) — worth keeping conditional for exactly this reason |
| **44 shipped tests** — 32 / 8 / 4 (O-1, DEC-WVR-01) | ❌ | Measured by running the suite: **18 / 4 / 4 = 26**. See F-01 |
| `orchestrate-dev.js` is the largest tracked file in the repo | ❌ | The stated command ranks `pdlc/workflows/dist/pdlc-cli.mjs` (738,924 B) first. See F-02 |
| The decision chain is "~81 lines", bounded from `if (ledger.reason) {` to the final `else` | ❌ | That span is **48** lines. See F-03 |
| Adding the probe seam makes a "36th seam" / "36th `main()` parameter" | ❌ | `main()` destructures 36 parameters, 34 of them seams. See F-04 |
| Every REQ/FSPEC/DOMAIN id cited resolves, and says what the document says it says | ✅ | REQ BL-03, R-4, C-3, REQ-WVR-01/05/07, OF-1/2, OB-3; FSPEC AT-02/13/16, BR-01/02/07/16, OB-F3/OB-F5; DC-01/03/04/08 all resolve, and DC-01/03/04/08's quoted glosses match their headings verbatim |


## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
