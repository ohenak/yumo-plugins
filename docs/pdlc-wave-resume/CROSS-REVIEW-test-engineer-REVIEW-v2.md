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

Fix the `waveResume.test.js:70`/`:90` references above to `:72`/`:90` — the
freeze assertions are at `waveResume.test.js:72` and `:90`; every other line
citation in this document was re-checked against the working tree.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-08 | High | Cross-Feature | **The new delta-coverage gate fails permanently the moment this feature merges, taking a required CI check with it.** `check-wave-resume-delta-coverage.mjs:144`-`:150` treats an empty introduced-range set as a hard error (`fail(...)` → `process.exit(1)`), and the ranges come from `git diff -U0 <merge-base with origin/main> HEAD -- pdlc/workflows/orchestrate-dev.js` (`:57`-`:98`). Once this branch lands on `main`, that merge-base **already contains** the feature's lines, so the diff is empty on `main` itself and on every branch subsequently cut from `main` that does not happen to touch `orchestrate-dev.js`. The script is `&&`-chained into `test:coverage` (`pdlc/workflows/package.json:9`), which is the command the required check `Unit tests (ubuntu-latest, node 20)` runs (`.github/workflows/pr-tests.yml:92`). I did not infer this: I re-ran the shipped script with `resolveBase` pointed at a base containing the feature and got `delta-coverage: no introduced ranges found … exit 1`. See the F-08 detail section. | `check-wave-resume-delta-coverage.mjs:144`-`:150`; `package.json:9`; PLAN §4.5.1 oracle (ii) |
| F-09 | Medium | Local | **The gate script is the one new executable in this round and nothing tests its behaviour.** `waveResumeRepoState.test.js` asserts only that `package.json`'s `test:coverage` string contains the filename and that the file exists (`the delta line-coverage oracle is wired into the coverage runner`), with a comment stating outright that it "asserts the wiring rather than the script's own behaviour". So none of the script's four exit paths — missing `coverage-final.json` (`:105`), subject absent from the report (`:113`), empty ranges (`:145`), uncovered-line-in-delta (`:165`) — has a falsifying test, and the positive path ("a genuinely uncovered introduced line reds") is likewise unproven: the only evidence it can fail is the PLAN's narrative that it once found the `self-report gate` arm. The script is pure apart from `git` and one file read, so a small suite that feeds it a synthetic `coverage-final.json` and a synthetic base would cover all four. Had that suite existed, F-08 would have been found by writing the "no delta" case. | `waveResumeRepoState.test.js` › `the delta line-coverage oracle is wired into the coverage runner`; `check-wave-resume-delta-coverage.mjs:105`, `:113`, `:145`, `:165` |
| F-10 | Low | Local | **Range derivation and coverage measurement disagree about which bytes were run.** The ranges are post-image line numbers of `HEAD` (`check-wave-resume-delta-coverage.mjs:85`), but c8 measured the **working tree** copy of `orchestrate-dev.js`. With an uncommitted edit in that file the two are offset, so the gate can pass on lines nobody ran or red on lines that were. CI is always clean so this is a local-developer trap only, but a `git diff --quiet HEAD -- <SUBJECT>` precondition (fail with "commit or stash before running") costs three lines and removes the ambiguity. | `check-wave-resume-delta-coverage.mjs:82`-`:98` |
| F-11 | Low | Local | **The census set-equality is symmetric but unanchored.** `waveResumeRepoState.test.js` › `on-disk waveResume*.test.js set-equals the manifest's` reds when either side changes alone — the gap v1 F-03 named — but deleting a suite **and** its manifest row in the same commit keeps both sides equal and reds nothing, since the only floor is `fromManifest().length > 0`. The five suites are still counted by no absolute number anywhere (`documentOracles.test.js` excludes the namespace). Pinning the expected set as a transcribed literal of five names, or asserting `length === 5`, closes it. | `waveResumeRepoState.test.js` › `census: the waveResume* suite set equals PLAN §3.3's manifest` |
| F-12 | Low | Local | Carried from v1 F-05, unchanged: 16 ledger fixtures in `waveExecution.test.js` compute `planHash` by calling the shipped `computePlanHash`, so the honour-vs-ignore precondition cannot red on hash-shape drift. Non-gating; one pinned 8-hex literal in the honoured-record fixture closes it. | v1 F-05 |
| F-13 | Low | Process | Carried from v1 F-07, unchanged: `PROP-RESUME-*`, `PROP-SKIP-*`, `PROP-OVERRIDE-*`, `PROP-RECORD-*`, `PROP-REPO-*` and `PROP-PRE-*` still appear in no test title, so PROPERTIES→test traceability stays manual and the `PROP-RECORD-06/09` collision with `learningsRecord.test.js` still misleads a grep. Harvest-time cleanup. | v1 F-07 |

## F-08 detail — the delta-coverage gate detonates on merge

## Questions

## Positive Observations

## Recommendation

## Verdict
