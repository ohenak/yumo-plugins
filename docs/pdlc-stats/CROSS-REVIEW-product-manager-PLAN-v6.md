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

_pending_

## Verification

_pending_

## Findings

_pending_

## Deferred Items

_pending_

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_
