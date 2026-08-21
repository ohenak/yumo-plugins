# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/DECISIONS-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 1
**Scope:** testing lens only — testability of each decision, observability of its re-evaluation
triggers, falsifiability of every oracle a decision prescribes, and re-derivation of every counted
cost the document stakes an alternative's rejection on.

## Verification Method

This branch carries neither the mechanism (`grep -c WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js`
→ `0`) nor the wave-gate baseline, and is 1,637 commits behind (`git rev-list --count HEAD..origin/main`
→ `1637`) — both exactly as the document's own **Verification frame** states. I therefore re-derived
every counted claim against `origin/main` at `345ae358` (`git cat-file -t 345ae358` → `commit`), the
same ref the document names, and cite by enclosing test, exported symbol or comment text per DEC-DOC-01.

Line numbers below are locators against `origin/main` at `345ae358`; the enclosing test or exported
symbol is the stable citation.

**Re-derived and confirmed accurate** — these are the load-bearing claims the decisions rest on, and
they hold:

| Document claim | Command / anchor | Result |
|---|---|---|
| Three module-level pure functions, one read site, one write site | `computePlanHash` `:12230`, `parseWaveLedger` `:12267`, `formatWaveLedger` `:12325`; read `readMergeConfigSafely(readFileFn, WAVE_STATE_PATH)` `:15264`; sole `writeWaveLedger(` call `:15600` | ✅ exactly as stated |
| The shipped INTERIM comment miscounts its own surface | `:12196-12198` reads "one path constant, two pure functions, one read site and two write sites" | ✅ DEC-WVR-01's correction is right |
| Ancestry is the **third** arm; feature-mismatch and plan-changed issue zero `merge-base` calls | `recorded.feature !== featureName` `:15302`, `recorded.planHash !== planHash` `:15306`, `!(await headCorroborated(recorded.head))` `:15307`, over-count `:15313` | ✅ O-4's rejection is correctly grounded |
| The shipped ancestry test asserts by containment, so an extra call is unfalsifiable | `expect(calls).toContainEqual(["merge-base","--is-ancestor",HEAD_SHA,"HEAD"])` in `it("a complete ledger whose commit is NOT an ancestor of HEAD is ignored, and every wave runs")` | ✅ the strongest argument in the document |
| The queue's delegation payload key set is exactly `{reqPath}` | `orchestrate-queue.js`: `import realMain` `:45`, `_runPipeline: runPipelineFn = realMain` `:1240`, `runPipelineFn({ reqPath: entry.reqPath })` `:1582` | ✅ DEC-WVR-07 is honestly grounded |
| The adapter already binds the `_git` transport twice | `runtime-adapter.js:1162`, `:1202` — `_git: rtGit` | ✅ O-3's "second adapter binding" cost is real |
| `main()` carries ~35 injected seams, `_git: gitFn = defaultGit` among them | 34 underscore-prefixed params in the destructured list at `:12992`; `_git` present | ✅ hedged and accurate |
| `.gitignore` pins the path by a root-anchored rule at line 41 | `/.claude/pdlc-wave-state.json`, line 41 | ✅ |
| Nothing writes `{}` | the sole write site passes `formatWaveLedger(...)` `:15601`, whose output always carries `version`, `feature`, `planHash`, `lastGreenWave` `:12325-12338` | ✅ the premise of DEC-WVR-04 holds |
| Seven reason codes; **three** interpolate | `parseWaveLedger` arms `:12290,12296,12305` are fixed sentences; `plan-changed` `:15306-15311` is fixed; feature-mismatch, head-unreachable and over-count interpolate | ✅ DECISIONS is right and TSPEC §3.1 is wrong (erratum, already self-flagged) |

**Re-derived and NOT confirmed** — three counted claims do not survive the command the document
gives for them. They are F-01, F-03 and F-04 below.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
