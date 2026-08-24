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
| F-06 | Low | **Resolved** | `waveResume.test.js:72` and `:90` add `Object.isFrozen` for `WAVE_IGNORE_REASONS` and `ANCESTRY_INDEPENDENT_CODES`; all four catalogues are now uniform. |
| F-07 | Low | **Open** (not gating) | No `PROP-*` tags were added to `it`/`describe` titles; `PROP-RESUME-*`/`PROP-SKIP-*` still return no grep hits in `pdlc/workflows/__tests__/`. Harvest-time cleanup, still non-gating. |
| Q-01 | — | **Answered, and closed in code** | `waveExecution.test.js:2499`-`:2506` adds `expect(notice).toContain(HEAD_SHA.slice(0, 12))` with a comment explaining the substring form is deliberate (fixture-dependent sha) — the ctx-wiring check I asked for, without pinning the whole line. |

All four blocking/strongly-recommended items from v1 are closed, and closed
with falsifiable oracles rather than with prose. The revision did not break
anything I had approved: the ordinary wave-1 report row is still pinned
verbatim, the announcement set-equality table is untouched, and the 191 tests
across the six wave suites pass.

## Findings

Every line citation below was re-checked against the working tree at
`799ae90b`.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-08 | High | Cross-Feature | **The new delta-coverage gate fails permanently the moment this feature merges, taking a required CI check with it.** `check-wave-resume-delta-coverage.mjs:144`-`:150` treats an empty introduced-range set as a hard error (`fail(...)` → `process.exit(1)`), and the ranges come from `git diff -U0 <merge-base with origin/main> HEAD -- pdlc/workflows/orchestrate-dev.js` (`:57`-`:98`). Once this branch lands on `main`, that merge-base **already contains** the feature's lines, so the diff is empty on `main` itself and on every branch subsequently cut from `main` that does not happen to touch `orchestrate-dev.js`. The script is `&&`-chained into `test:coverage` (`pdlc/workflows/package.json:9`), which is the command the required check `Unit tests (ubuntu-latest, node 20)` runs (`.github/workflows/pr-tests.yml:92`). I did not infer this: I re-ran the shipped script with `resolveBase` pointed at a base containing the feature and got `delta-coverage: no introduced ranges found … exit 1`. See the F-08 detail section. | `check-wave-resume-delta-coverage.mjs:144`-`:150`; `package.json:9`; PLAN §4.5.1 oracle (ii) |
| F-09 | Medium | Local | **The gate script is the one new executable in this round and nothing tests its behaviour.** `waveResumeRepoState.test.js` asserts only that `package.json`'s `test:coverage` string contains the filename and that the file exists (`the delta line-coverage oracle is wired into the coverage runner`), with a comment stating outright that it "asserts the wiring rather than the script's own behaviour". So none of the script's four exit paths — missing `coverage-final.json` (`:105`), subject absent from the report (`:113`), empty ranges (`:145`), uncovered-line-in-delta (`:165`) — has a falsifying test, and the positive path ("a genuinely uncovered introduced line reds") is likewise unproven: the only evidence it can fail is the PLAN's narrative that it once found the `self-report gate` arm. The script is pure apart from `git` and one file read, so a small suite that feeds it a synthetic `coverage-final.json` and a synthetic base would cover all four. Had that suite existed, F-08 would have been found by writing the "no delta" case. | `waveResumeRepoState.test.js` › `the delta line-coverage oracle is wired into the coverage runner`; `check-wave-resume-delta-coverage.mjs:105`, `:113`, `:145`, `:165` |
| F-10 | Low | Local | **Range derivation and coverage measurement disagree about which bytes were run.** The ranges are post-image line numbers of `HEAD` (`check-wave-resume-delta-coverage.mjs:85`), but c8 measured the **working tree** copy of `orchestrate-dev.js`. With an uncommitted edit in that file the two are offset, so the gate can pass on lines nobody ran or red on lines that were. CI is always clean so this is a local-developer trap only, but a `git diff --quiet HEAD -- <SUBJECT>` precondition (fail with "commit or stash before running") costs three lines and removes the ambiguity. | `check-wave-resume-delta-coverage.mjs:82`-`:98` |
| F-11 | Low | Local | **The census set-equality is symmetric but unanchored.** `waveResumeRepoState.test.js` › `on-disk waveResume*.test.js set-equals the manifest's` reds when either side changes alone — the gap v1 F-03 named — but deleting a suite **and** its manifest row in the same commit keeps both sides equal and reds nothing, since the only floor is `fromManifest().length > 0`. The five suites are still counted by no absolute number anywhere (`documentOracles.test.js` excludes the namespace). Pinning the expected set as a transcribed literal of five names, or asserting `length === 5`, closes it. | `waveResumeRepoState.test.js` › `census: the waveResume* suite set equals PLAN §3.3's manifest` |
| F-12 | Low | Local | Carried from v1 F-05, unchanged: 16 ledger fixtures in `waveExecution.test.js` compute `planHash` by calling the shipped `computePlanHash`, so the honour-vs-ignore precondition cannot red on hash-shape drift. Non-gating; one pinned 8-hex literal in the honoured-record fixture closes it. | v1 F-05 |
| F-13 | Low | Process | Carried from v1 F-07, unchanged: `PROP-RESUME-*`, `PROP-SKIP-*`, `PROP-OVERRIDE-*`, `PROP-RECORD-*`, `PROP-REPO-*` and `PROP-PRE-*` still appear in no test title, so PROPERTIES→test traceability stays manual and the `PROP-RECORD-06/09` collision with `learningsRecord.test.js` still misleads a grep. Harvest-time cleanup. | v1 F-07 |

## F-08 detail — the delta-coverage gate detonates on merge

The gate resolves its base and its ranges like this:

```js
// check-wave-resume-delta-coverage.mjs:57
function resolveBase() {
  for (const ref of ["origin/main", "main"]) {
    try {
      const sha = git(["merge-base", "HEAD", ref]).trim();
      if (sha) return { sha, source: `merge-base with ${ref}` };
```

```js
// check-wave-resume-delta-coverage.mjs:144
const ranges = introducedRanges();
if (ranges.length === 0) {
  fail(`no introduced ranges found in ${SUBJECT} against ${BASE_SHA} …`);
}
```

`fail` is `console.error` + `process.exit(1)` (`:48`-`:51`).

**Today** this is fine, and I verified why: `git merge-base HEAD origin/main`
returns `b029e853c2287861363cac1039b0c74161719cb2`, which is the pre-feature
base (and identical to `PINNED_BASE_SHA` at `:43`), so the diff is this
feature's own ~24 branches and the gate reports 0 uncovered in-delta lines.

**After merge** the same expression returns a commit that already contains
those lines. `git diff -U0 <that commit> HEAD -- pdlc/workflows/orchestrate-dev.js`
is then empty, `ranges.length === 0`, and the script exits 1. I ran the shipped
script with `resolveBase`'s ref list replaced by a base containing the feature
— the only change, everything else byte-identical — and got:

```
delta-coverage: no introduced ranges found in pdlc/workflows/orchestrate-dev.js
against 799ae90bc89a8e9c451ac75eb618e12bf188b6fb (merge-base with HEAD). The base
or the path is wrong.
exit=1
```

The blast radius is not this feature's branch. `package.json:9` chains it as

```
c8 npm test -- --runInBand && c8 report --reporter=json && node scripts/check-wave-resume-delta-coverage.mjs && c8 report --check-coverage …
```

and `.github/workflows/pr-tests.yml:92` runs `npm run test:coverage` as the
required check `Unit tests (ubuntu-latest, node 20)` — one of the four checks
CLAUDE.md and FSPEC §5.1 pin as gating. So the day after this PR merges, that
check is red on `main` and on every subsequent feature branch whose diff does
not happen to touch `orchestrate-dev.js`, for a reason that has nothing to do
with the work under test. The `--per-file --branches 85` floor step is
`&&`-chained *after* the script, so it never even runs.

The empty-range case is a deliberate fail-closed guard against a
mis-typed `SUBJECT` or a wrong base — the comment says "The base or the path is
wrong." The defect is that it cannot distinguish that from "this feature has
merged and the delta is now zero by construction", which is the terminal state
of every delta-scoped oracle and therefore the first case its own tests should
have covered (F-09).

**Changes that resolve it** — any one is sufficient, in my order of preference:

1. **Make zero ranges the success case when the subject is unchanged and the
   base is live.** Distinguish the two readings mechanically: if
   `git cat-file -e <PINNED_BASE_SHA>` resolves and
   `git merge-base --is-ancestor <feature-tip-marker> HEAD` shows the feature
   has landed — or, more simply, if `SUBJECT` exists and the diff is empty
   while `git log --oneline <BASE>..HEAD -- <SUBJECT>` is also empty — print
   `no delta in this range — nothing for this oracle to check` and exit 0. Keep
   `fail` for the genuinely broken case: `SUBJECT` missing from the working
   tree, or absent from the coverage report (that check at `:113` already
   covers the mis-typed path, which is what the empty-range guard was really
   reaching for).
2. **Scope the gate's lifetime explicitly.** If oracle (ii) is a
   feature-duration control rather than a permanent one, say so in PLAN §4.5.1,
   have the script exit 0 with a `retire me` notice when the delta is empty,
   and add a follow-up queue item to delete it.
3. **Do not gate a required check on it at all** — run it as a separate,
   feature-branch-only step. This is the weakest option: it moves the oracle
   out of the path that made it worth having.

Whichever is chosen, F-09's four-case suite over the script should land in the
same revision, with the "base already contains the delta" case as its first
row — that is the falsifying test for the fix itself.

## Questions

## Positive Observations

## Recommendation

## Verdict
