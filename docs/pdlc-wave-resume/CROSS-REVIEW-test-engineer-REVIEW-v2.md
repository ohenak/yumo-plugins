# Cross-Review: test-engineer — Implementation Review (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-wave-resume/` implementation diff (`main...feat-pdlc-wave-resume`)
**Date:** 2026-08-24
**Iteration:** 2

## Scope and Method

Delta re-review. Base for the diff is `f6748d48` — the commit at which I wrote
v1 — and the range under review is `f6748d48..HEAD` (`799ae90b`): eight
remediation commits, twelve files, +689/−68. I re-read only the changed
material plus whatever my v1 findings pointed at.

What I ran rather than read:

| Check | Result |
|---|---|
| `npm test -- waveResume waveExecution` (from `pdlc/workflows`) | 6 suites, **191 passed**, 0 failed |
| `git rev-parse origin/main` vs `git merge-base HEAD origin/main` | both `b029e853…` — identical to the script's `PINNED_BASE_SHA` (`check-wave-resume-delta-coverage.mjs:43`) |
| Post-merge simulation of the new coverage gate (base resolving to a commit that already contains the feature) | **exit 1**, `delta-coverage: no introduced ranges found` — see F-08 |
| `grep -rn "INTERIM wave ledger" pdlc/workflows/orchestrate-dev.js pdlc/workflows/dist/pdlc-cli.mjs` | no hits (v1 F-02 closed at the source, not only in a doc) |

New material in this round: `pdlc/workflows/scripts/check-wave-resume-delta-coverage.mjs`
(175 lines, brand new), the `test:coverage` script rewrite
(`pdlc/workflows/package.json:9`), +228 lines of oracles in
`waveResumeRepoState.test.js`, +130/−40 in `waveExecution.test.js`, and the
PLAN v1.5 revision row. My attention went to the new gate script first,
because it is the only piece of this round that is wired into a **required CI
check** and is itself covered by nothing.

## Prior-Finding Disposition

| v1 ID | Sev | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | The weak standalone `over-count` test at old `waveExecution.test.js:2661`-`:2677` is deleted, and `over-count` is the sixth row of the `it.each` disregard table. The row transcribes the whole notice — `"it records 4 wave(s) green and this plan has only 3"` (`waveExecution.test.js:2868`) — which is a byte-literal match for the renderer at `orchestrate-dev.js:12895`-`:12897`, so the `recordedLastGreenWave`/`waveCount` field swap I described now reds. The row inherits the table's `dispatchedTaskIds(record)).toEqual(["T1","T2","T3"])` positive conjunct and the whole-notice `toContain`, and the blanket `merge-base` `toEqual([])` was correctly generalised to a **per-row** expected call list (`expectedMergeBaseCalls`), with `over-count` carrying `[["merge-base","--is-ancestor",OVER_COUNT_HEAD,"HEAD"]]` — equality, not containment, preserved on both sides. The commit message records the field-swap mutation run (RED, reverted). |
| F-02 | Medium | **Resolved** | The residual `INTERIM wave ledger` marker is gone from `orchestrate-dev.js` and from `dist/pdlc-cli.mjs`, and the absence is now oracle-backed with a positive conjunct rather than absence-only: `waveResumeRepoState.test.js` › `D-1: no INTERIM wave-ledger commentary survives in shipped source` asserts `includes("INTERIM wave ledger") === false` **and** `includes("Phase I's script-owned resume pointer (pdlc-wave-resume)") === true`, over both files. Deleting the commentary altogether cannot satisfy it. |
| F-03 | Medium | **Resolved** | `waveResumeRepoState.test.js` › `census: the waveResume* suite set equals PLAN §3.3's manifest` asserts `onDisk()).toEqual(fromManifest())` — set equality in both directions, exactly what I asked for — plus a non-empty floor and a binder test asserting `documentOracles.test.js` still carries `startsWith("waveResume")`, so the compensation cannot silently outlive the exclusion it compensates for. `799ae90b` added `waveResumeRepoState.test.js` to T-10's manifest row to make the equality hold. |
| F-04 | Medium | **Resolved** | `coverageInstrumentation.test.js` and `package.json` are now named in PLAN §3.3's manifest and §4.6's `parsePlanOwnership` transcription as T-10's (`PLAN:270`), so the edit has an owner. The retry's weakening is bounded rather than argued: `attemptsRaced` is counted and `expect({raceWindowNeverClosed: attemptsRaced === 5, stderr: run.stderr}).toMatchObject({raceWindowNeverClosed: false})` (`coverageInstrumentation.test.js:227`-`:229`) makes exhaustion a distinct, attributable red instead of a generic non-zero exit. Q-02 is answered by that bound; I am content to leave the hermetic fix to a separate item. |
| F-05 | Low | **Open** (not gating) | `computePlanHash(` still appears 16 times in `waveExecution.test.js` fixtures; no literal 8-hex fixture was pinned. Unchanged risk, unchanged verdict: not blocking. |
| F-06 | Low | **Resolved** | `waveResume.test.js:70` and `:90` add `Object.isFrozen` for `WAVE_IGNORE_REASONS` and `ANCESTRY_INDEPENDENT_CODES`; all four catalogues are now uniform. |
| F-07 | Low | **Open** (not gating) | No `PROP-*` tags were added to `it`/`describe` titles; `PROP-RESUME-*`/`PROP-SKIP-*` still return no grep hits in `pdlc/workflows/__tests__/`. Harvest-time cleanup, still non-gating. |
| Q-01 | — | **Answered, and closed in code** | `waveExecution.test.js:2499`-`:2506` adds `expect(notice).toContain(HEAD_SHA.slice(0, 12))` with a comment explaining the substring form is deliberate (fixture-dependent sha) — the ctx-wiring check I asked for, without pinning the whole line. |

All four blocking/strongly-recommended items from v1 are closed, and closed
with falsifiable oracles rather than with prose. The revision did not break
anything I had approved: the ordinary wave-1 report row is still pinned
verbatim, the announcement set-equality table is untouched, and the 191 tests
across the six wave suites pass.

## Findings

## F-08 detail — the delta-coverage gate detonates on merge

## Questions

## Positive Observations

## Recommendation

## Verdict
