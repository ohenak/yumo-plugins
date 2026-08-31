# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/PLAN-pdlc-stats.md` (v1.3)
**Previous review:** `docs/pdlc-stats/CROSS-REVIEW-product-manager-PLAN-v5.md` (`REVIEWED-COMMIT: 034205d4`)
**Date:** 2026-08-31
**Iteration:** 6
**Round type:** Delta re-review under **DECISION FREEZE**

## Overview

**Scope round.** This is a frozen delta re-review, not a re-read. `PLAN-pdlc-stats.md` moved
v1.2 → v1.3 across seven commits (`034205d4..e6f18c5a1`), a **19-line diff — 11 insertions, 8
deletions** — landing the round-4 revision against `CROSS-REVIEW-product-manager-PLAN-v4.md` and
`CROSS-REVIEW-test-engineer-PLAN-v4.md`. I read my v5 cross-review first, took the diff, and scanned
only the changed sections. I did not re-litigate settled content, and under the freeze I opened no
new decisions: everything I would merely have written differently is recorded as a `DEFERRED:` line
rather than as a finding.

**What the delta touched.** Exactly six sites:

1. the version row and a new **v1.3 changelog paragraph** (`PLAN:14-18`);
2. **T-04** gains a paragraph on AT-17's fourth leg and the discharged REQ-STATS-06-versus-BR-16
   erratum (`PLAN:98`);
3. **T-16**'s status cell flips `⬚` → `✅` (`PLAN:110`);
4. **T-23**'s `assertAdditiveOnly` citation is re-anchored (`PLAN:117`);
5. **T-24**'s second-`P9-02` transcription drops its backticks and names the stale count word
   (`PLAN:118`);
6. **Batch 10**'s gate scopes its red signal to four enumerations (`PLAN:137`); the AC coverage
   table's AT-15 cell gains `T-09` (`PLAN:308`); the Residual risks table gains a discharged row and
   qualifies the open one (`PLAN:383-385`).

**My two v5 findings were the target of two of those sites, and both are resolved** — verified
against source, not against the changelog's claim about source (see **Verification**).

**Method.** For every load-bearing claim the delta introduced I measured the repository rather than
trusting the prose: `git show main:<file>` for the "pre-change baseline" transcriptions, `sed -n` on
the live files at HEAD, TSPEC §8.3 read at HEAD for the erratum-closure claim, and an actual test run
for the one status cell that changed. The freeze bar means only two things could block: something
this delta broke, or a claim the repository contradicts. I found neither.

**One genuine surprise, and it is not the PLAN's defect.** Substantial implementation for this
feature is already committed on the branch — `pdlc/workflows/lib/stats.mjs` (22 KB, tracked), nine
`stats*.test.js` suites under `pdlc/workflows/__tests__/`, four under `pdlc/engine/__tests__/`, and
the whole T-21…T-25 vendoring cluster (`prepack.mjs`, `publish-preflight.mjs`, `fixture-machine.mjs`,
`_tspec-packed-set.mjs`, `package.json`'s `c8.include`). That reality is what let me test the `✅`
flip directly, and it is also what makes the status ledger read unevenly. It is recorded below as one
Low finding and one deferred item, not as a gate.

## Batches

Three task rows and one batch gate changed. I checked each against the repository, and each against
the acceptance criterion it owns.

### T-04 — AT-17's fourth leg (`PLAN:98`)

The added paragraph says the REQ-STATS-06-versus-FSPEC-BR-16 disagreement reached exactly one
assertion site, that TSPEC §8.3 records it **discharged at REQ v1.7 and absorbed by FSPEC v1.8 in
BR-16's favour**, and that "no expected value moves and the implementer owes no re-stamp here."

Measured at HEAD, all three sub-claims hold. TSPEC is at **v1.8** (`TSPEC-pdlc-stats.md:16`) and its
changelog states the erratum is "settled upstream, in BR-16's favour" with the out-of-catalogue
basename expecting **`harvested`** (`TSPEC-pdlc-stats.md:806`, `:822`). §8.3's own header now reads
"**One remains open**" and names BR-26/EC-10 as that one (`TSPEC-pdlc-stats.md:1311`), explicitly
listing the REQ-STATS-06 item among the closed (`TSPEC-pdlc-stats.md:1314`). So the PLAN's claim is
not merely consistent with TSPEC — it is TSPEC's current text.

**Product lens:** no acceptance criterion moved. AT-17 still maps to T-04 alone in the AC coverage
table, and the expected value the leg carries is the one it already carried. The paragraph adds
traceability where there was a silent dependency; it narrows, broadens and drops nothing. This also
retires my v5 Q-01 — the stale TSPEC §8.3 bookkeeping I routed upstream has been re-stamped.

### T-16 — the `✅` status flip (`PLAN:110`)

This is the one change the v1.3 changelog does **not** mention, so I tested it rather than reasoning
about it. T-16 is `runStats` and its stated obligation is "Turns T-07 green."

- `runStats` is implemented and exported at `pdlc/workflows/lib/stats.mjs:451`.
- T-07/T-16's suite `pdlc/workflows/__tests__/statsOutcome.test.js` is tracked, and
  `npm test -- __tests__/statsOutcome.test.js` reports **21 passed, 21 total**, including the exit-code
  totality sweep ("no scenario yields exitCode outside {0, 1}").

So the cell is **truthful**, and under the freeze a truthful status cell is not a defect. What is
untidy is that it is truthful *selectively*: T-15's renderers are equally implemented
(`renderHuman` at `stats.mjs:561`, `renderJson` at `:585`) and the whole T-21…T-25 cluster has landed
(`package.json:27` carries `"**/pdlc/workflows/lib/stats.mjs"` in `c8.include`), yet all of those rows
still read `⬚`. A reader takes the ledger as a progress signal; a ledger that advances one row and
not its neighbours under-reports. That is **F-01**, Low — it misleads no acceptance criterion and
blocks nothing.

### T-23 and T-24 — my two v5 findings (`PLAN:117-118`)

Both were transcription-fidelity Lows. Both are now correct, and correct in the stronger sense that
the revision added the *baseline qualifier* that makes them checkable:

| v5 finding | v1.3 text | Measured |
|---|---|---|
| F-02: `assertAdditiveOnly` anchor `:73-77` was off by one | "at the pre-change baseline the literal is line `77` and the `assert.equal(` statement spans `74-78`" | **Exact.** At `main`, the `${label}: …` literal is line **77** and the `assert.equal(` statement spans **74–78** |
| F-01: second-`P9-02` title added backticks around `` `lib/` `` | title transcribed with no backticks, plus "the count word `two` is one of the stale words this task corrects" | **Exact.** `main:coverageInstrumentation.test.js:278` reads `P9-02: the shipped c8 config resolves the two new lib/ modules too (F4)` — bare `lib/` |

Both resolved. The added "at the pre-change baseline" hedge is the right call and is doing real work,
because at HEAD that title has already been edited to read "three new lib/ modules"
(`coverageInstrumentation.test.js:279`) — the transcription is a historical statement about the
baseline the task starts from, not a claim about HEAD, and it says so. I note the divergence as a
deferred readability item, not a finding.

### Batch 10's gate (`PLAN:137`)

The new text scopes the red signal to "the **four enumerations `assertAdditiveOnly` reads** (TSPEC
§6.4, §2.1's sites 1–4: `prepack.mjs`, `publish-preflight.mjs`, `fixture-machine.mjs`,
`_tspec-packed-set.mjs`)" and states T-24's `c8.include` edit is **not** one of them.

Verified verbatim against TSPEC: §2.1's sites 1–4 are exactly that four-file list
(`TSPEC-pdlc-stats.md:1088-1089`), and TSPEC records that the oracle "covers four of the ten
directly" with `c8.include` reached a different way, through `coverageInstrumentation.test.js`
(`TSPEC-pdlc-stats.md:1045`). The PLAN's exclusion is TSPEC's own. No scope creep: the gate got
narrower and more falsifiable, not broader.

## Dependencies

**No dependency edge moved in this delta.** The `Batch` and `Depends on` columns are byte-identical
across all 27 task rows; the diff touches only prose cells, one status cell, one AC-coverage cell and
two residual-risk rows. T-16 still sits in batch 7 depending on `T-15, T-07`; T-23, T-24 still sit in
batch 10 depending on `T-20`; T-04 still sits in batch 2 depending on `T-01, T-02`.

Two ordering points worth stating plainly, since both are places a careless delta could have done
damage and this one did not:

- **The AT-15 coverage cell gained `T-09` without gaining a dependency.** `PLAN:308` now reads
  `AT-15 | T-04 (size arithmetic, removal probe), T-18 (symbolic-link leg, real fs), T-09 (shipped
  seam, end-to-end)`. T-09 already carried that leg in its own row — it names the "symbolic-link leg
  on production path … reported byte total is the *link's own* size (EC-19)" (`PLAN:103`). So this
  edit records an assignment the task table already made; it is the anti-drift reconciliation te F-01
  asked for, and it introduces no new work, no new task and no new edge. This is the correct shape of
  fix for a coverage-table omission: make the table agree with the row, do not invent a task.
- **The discharged-erratum row changes no blast radius.** The Residual risks table's new row
  (`PLAN:385`) is explicitly carried "**only to close it**", and states its whole blast radius was
  "the harvested disjunct and T-04's AT-17 fourth-leg expected value; both already carried the winning
  reading, so no task changes and nothing re-stamps". Consistent with what I measured under
  **Batches**. The surviving open row (`PLAN:383`) is now qualified as BR-26/EC-10, "the **only**
  erratum TSPEC §8.3 still carries open" — which matches `TSPEC-pdlc-stats.md:1311` exactly.

**Ordering versus the ledger.** The one place ordering and reality now disagree is not in the
document's edges but in its status column: T-16 (batch 7) is marked done while its declared
predecessor T-15 (batch 6) still reads `⬚`, even though T-15's renderers exist at
`pdlc/workflows/lib/stats.mjs:561` and `:585`. Read as a dependency claim that would be incoherent;
read as a lagging ledger — which is what it is, since the code for both landed — it is merely
incomplete. Recorded as F-01, Low. The *plan's* ordering is sound and unchanged.

## Verification

Every claim below was measured at HEAD or at the declared baseline commit, not read off the
changelog. The changelog's account of what it fixed is itself one of the things under test.

| Claim in v1.3 | How measured | Result |
|---|---|---|
| v5 F-02 fixed: `assertAdditiveOnly` literal at `77`, statement `74-78`, at pre-change baseline | `git show main:pdlc/engine/__tests__/loop-distribution.test.js \| sed -n '72,80p'` | **Exact.** Literal `${label}: delta over baseline must be exactly the two new members, got …` on line **77**; `assert.equal(` spans **74–78** |
| v5 F-01 fixed: second-`P9-02` title carries no backticks around `lib/` | `git show main:…/coverageInstrumentation.test.js:278` | **Exact.** `P9-02: the shipped c8 config resolves the two new lib/ modules too (F4)` — bare `lib/`, count word `two` |
| T-04: erratum discharged, TSPEC §8.3 carries it closed | `TSPEC-pdlc-stats.md:16` (v1.8), `:806`, `:822`, `:1311`, `:1314` at HEAD | **Confirmed.** §8.3 header reads "One remains open"; REQ-STATS-06 listed closed; BR-16's `harvested` reading is the settled one |
| Residual risks: BR-26/EC-10 is the sole open erratum | `TSPEC-pdlc-stats.md:1311` | **Confirmed**, same wording |
| Batch 10: the four enumerations `assertAdditiveOnly` reads are §2.1 sites 1–4 | `TSPEC-pdlc-stats.md:1088-1089` | **Confirmed**, same four files in the same order |
| Batch 10: `c8.include` is **not** one of those four | `TSPEC-pdlc-stats.md:1045` | **Confirmed.** Oracle covers four of ten directly; `c8.include` reached via `coverageInstrumentation.test.js` |
| AT-15's new `T-09` cell agrees with T-09's own row | `PLAN:308` vs `PLAN:103` | **Agree.** T-09's row already claimed the production-path symlink leg (EC-19) |
| T-16 `✅` is truthful | `runStats` at `pdlc/workflows/lib/stats.mjs:451`; `npm test -- __tests__/statsOutcome.test.js` | **True.** 21 passed, 21 total |
| No dependency edge moved | `git diff 034205d4 HEAD` — `Batch`/`Depends on` columns | **Unchanged** across all 27 rows |
| Diff is the small revision it claims | `git diff --stat` | **11 insertions, 8 deletions**, one file |

**Files the changed rows name — all exist.** T-16's `pdlc/workflows/__tests__/statsOutcome.test.js`
and `pdlc/workflows/lib/stats.mjs`: both tracked. T-23's
`pdlc/engine/__tests__/loop-distribution.test.js` and T-24's
`pdlc/workflows/__tests__/coverageInstrumentation.test.js` and `pdlc/workflows/package.json`: all
tracked, and each row already carries the `(exists)` marker the manifest convention requires. T-04's
`statsMetrics.test.js`: tracked. No changed row names a file that is absent without declaring it new.

**Coverage claims versus the current suite layout.** The suite layout the PLAN assumes is on disk:
`statsAntiDrift`, `statsArgv`, `statsDiscovery`, `statsMetrics`, `statsOutcome`, `statsPreflight`,
`statsProperties`, `statsRealPaths`, `statsRender` under `pdlc/workflows/__tests__/`, and
`stats-cli`, `stats-cli-structure`, `stats-read-only`, `stats-vendoring` (plus
`_stats-scratch-prefixes.mjs`) under `pdlc/engine/__tests__/`. That is one-for-one with the task
table's `Test File` column. The single-owner property the File Ownership Manifest asserts is
preserved by the delta — no changed row acquired a file another row owns.

**Test-quality bar, applied to what the delta changed.** The Batch 10 gate edit *strengthens* the
falsifiability story rather than weakening it: it replaces an unqualified "as soon as the first
enumeration moves" with a named four-member set and an explicit statement that a fifth, adjacent edit
(`c8.include`) does **not** red the same oracle — that is precisely the "what happens instead" pairing
a negative claim owes, and it is what stops an implementer reading a green suite as drift. Likewise
T-24's `toEqual` note ("array equality, position-sensitive") keeps the enumeration a set-equality-grade
check rather than containment. The transcriptions at issue in both my v5 findings are literal
transcriptions from source, verified above against source — no implementation echo, since the expected
strings are quoted from the baseline file, not derived from the code under test.

**Nothing the delta touched narrowed, broadened or dropped an acceptance criterion.** AT-15 gained a
third owning task that already did the work; AT-17's owner and expected value are unchanged; the AC
coverage table's other 26 assignments are byte-identical.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **Status ledger advances unevenly.** The delta flips T-16's cell to `✅` (`PLAN:110`) with no changelog entry explaining it. The cell is truthful — `runStats` exists at `pdlc/workflows/lib/stats.mjs:451` and `statsOutcome.test.js` passes 21/21 — but equally-landed rows still read `⬚`: T-15's renderers exist (`stats.mjs:561`, `:585`) and T-21…T-25's vendoring cluster has landed (`package.json:27` carries `"**/pdlc/workflows/lib/stats.mjs"`). Advance the other landed rows, or state in the changelog that the ledger is updated per wave, so a reader does not take `⬚` as "not started". | Status key, `PLAN:88` |

**Resolved from v5** — both recorded closed, neither carried forward:

- v5 F-01 (Low, T-24's backtick-adding "verbatim" transcription) — **fixed**, and verified against
  `main:coverageInstrumentation.test.js:278`.
- v5 F-02 (Low, T-23's off-by-one `assertAdditiveOnly` anchor) — **fixed**, and verified against
  `main:loop-distribution.test.js:74-78`.

v5 Q-01 (TSPEC §8.3's stale "Two remain open" header) is also discharged upstream:
`TSPEC-pdlc-stats.md:1311` now reads "One remains open". Nothing was routed to me to re-check that
was not, in fact, corrected.

## Deferred Items

Under DECISION FREEZE these are recorded, not raised. None is a defect this delta introduced and none
contradicts the repository.

DEFERRED: T-24's "verbatim at the pre-change baseline" P9-02 title reads `two new lib/ modules`, but at HEAD that test title already reads `three new lib/ modules` (`coverageInstrumentation.test.js:279`) — the baseline hedge makes the claim true, though an implementer reading it at HEAD sees a mismatch; a one-clause "already landed at HEAD" note would remove the double-take.
DEFERRED: T-23's citation is likewise baseline-anchored while HEAD's `loop-distribution.test.js` has already been rewritten by commit `05315533e`; same hedge, same optional note.
DEFERRED: Substantial implementation (the T-21…T-25 cluster, `prepack.mjs`/`publish-preflight.mjs`/`fixture-machine.mjs`/`_tspec-packed-set.mjs`/`c8.include`) landed inside commit `05315533e`, whose message reads `docs(pdlc-stats): PM TSPEC cross-review v11 — Architecture`; production edits under a docs-scoped message make the branch history hard to audit. Process observation for harvest, not a PLAN defect.
DEFERRED: The v1.3 changelog paragraph is now a single ~250-word block (`PLAN:16`); splitting per-finding would read better, but the content is complete and accurate as written.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Is the `Status` column intended as a live implementation ledger updated wave-by-wave, or as the plan's static starting state? T-16's flip implies the former; the `⬚` on other landed rows implies neither is being applied consistently. An answer in the status key (`PLAN:88`) would settle how a DoD reviewer should read the column. |

## Positive Observations

- **Both of my v5 findings were fixed at the level of the source, not the prose.** The revision did
  not merely reword the citations — it added a *baseline qualifier* ("at the pre-change baseline")
  that makes each transcription independently checkable against a named commit. That is a strictly
  better artifact than the one I asked for, and it is why this review could verify them in two
  commands.
- **The erratum was closed on its decided form rather than re-raised.** T-04 and the Residual risks
  table now carry the REQ-STATS-06-versus-BR-16 item as *discharged*, with its blast radius stated and
  measured to be empty. Carrying a closed erratum explicitly "so the DoD reviewer does not re-open it"
  is exactly the right instinct — the alternative, deleting it silently, invites the next reader to
  rediscover the question.
- **Batch 10's gate got more falsifiable.** Naming the four enumerations and explicitly excluding
  T-24's `c8.include` edit converts a vague "reds first" expectation into a claim that can be wrong,
  and pre-empts the false-drift reading of a legitimately green mid-batch suite.
- **te F-03 was answered by declining it, with a reason.** Recording a finding as
  "recorded-not-to-be-fixed — the PLAN is the superset and already names the ninth with its rationale"
  is a healthier outcome than a cosmetic edit that would have made the PLAN agree with TSPEC by losing
  information.
- **The AC coverage fix added no work.** AT-15's third owner was already doing the job in its own row;
  the table was made to tell the truth rather than the plan being grown to fit the table.

## Recommendation

**Approved with minor changes**

No High findings. Both v5 findings are resolved and verified against source; every load-bearing claim
the delta introduced is confirmed by the repository at HEAD; no acceptance criterion was narrowed,
broadened, reinterpreted or dropped; no dependency edge moved. The single Low finding (an unevenly
advanced status ledger) and four deferred items are recorded for the next time this document is
touched, and none of them gates implementation.





## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}

APPROVAL-HASH: sha256:6ab4d08138f8ae90875a5c8c65961c5e14747865128aeb8b9676b55840610a7a
APPROVAL-HASH-NORMALIZED: sha256:a635e835dcc7091b0a13a43af8d4a1769df20846b74ce9e891b55930302b2088
REVIEWED-COMMIT: e6f18c5a13bc1674461de1c7b96a662ba14c2113
UPSTREAM-STATE: REQ sha256:f75c348f299ebff8518b590f64668d054587c0c9d4d7ba442477e6fdfa7a8862
UPSTREAM-STATE: FSPEC sha256:a493133f67150b27020b10d05cd676a505e172f0b89082a208ce8198a3137f5d
UPSTREAM-STATE: TSPEC sha256:7b119eb7fa68475db641e2c244a3b9c10b742b2310d0079ccbb137d9e6d3e85e
UPSTREAM-STATE: DECISIONS sha256:ca3f7219e1acaefe3024bb3a6da78d844b7c1d992213af3f84e4086437b7b5cc
