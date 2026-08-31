# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-stats/TSPEC-pdlc-stats.md (v1.3, erratum round 4)
**Date:** 2026-08-31
**Iteration:** 5 (delta confirmation, not a full re-review)

## Overview

Delta confirmation over the v1.3 erratum edit to `TSPEC-pdlc-stats.md` (commits `80c484a`,
`1aa4c84`, `c8345f0`, `e952268`; 73 insertions, 26 deletions, one file). Two items were routed to
this round — the §2.1 sweep-derivation overstatement (pm-review, Low) and the
`coverageInstrumentation.test.js` row's omitted P9-02 test title (te-review, Low). Both land. The
edit also carries three collateral corrections the same erratum absorbed — the nine → ten site
count with `pdlc/README.md` added, P7-02's `vendoredClassWord` arm, and the §6.4 purity split by
return type — and those are checked here for damage to previously approved material, not
re-litigated.

I re-ran the mechanical claims against HEAD rather than reading them. Every number in the edit
reproduces. Nothing previously approved is weakened; the §6.4 split strictly strengthens the
purity oracle by removing a conjunct that would have red-lined a correct implementation.

## Upstream Re-Grounding (DEC-ERR-03)

The scope of a delta confirmation is the TSPEC measured against upstream at HEAD, not the item
list. Re-grounded first:

- `REQ-pdlc-stats.md` is at **v1.4**, `FSPEC-pdlc-stats.md` at **v1.4** — exactly the versions
  v1.3's changelog claims it re-grounded on.
- `git log 11bb63b4e..HEAD -- REQ-pdlc-stats.md FSPEC-pdlc-stats.md` is **empty**: neither upstream
  document moved during the erratum window, so no upstream decision went unabsorbed and no
  `UPSTREAM-STATE` pin went stale under the edit.
- The TSPEC's own §3.2 interface block is still a transcription of the HEAD exports
  (`parseReviewFilename`, `deriveRoundWindow`, `deriveDodRoundIndex`, `parseResolvedMarker`), which
  is what the new §6.4 split leans on — verified below.

The document still derives from *this* upstream state.

## Routed Items — Verification

### Item 1 — §2.1 sweep-derivation claim (Low | delta | local) — **RESOLVED**

The old text asserted "the number is *sweep-derived*, not hand-counted" while the named query
returned a wider set than the count. v1.3 replaces the assertion with a **two-halved, re-runnable
derivation**: sweep, then one stated filter. I re-ran both halves at HEAD.

| Half | Claim in v1.3 | Measured at HEAD | Agrees |
|---|---|---|---|
| Sweep | repo-scoped `git grep -l` for `lib/loop-session.mjs`, restricted to sources (excluding `docs/`) | `git grep -l` → 44 files; minus `docs/` → **24** | yes |
| Filter | keep sites that enumerate the class or pin its size/membership; drop the **14** that merely consume a member | dropped: `pdlc/engine/bin/cli.mjs`, `orchestrate-dev.js`, `orchestrate-queue.js`, `pdlc/workflows/dist/pdlc-cli.mjs` + **10** `loop*`/`loopSession*` test files = **14** | yes |
| Residue | `24 − 14 = 10` | 10 keepers: `prepack.mjs`, `publish-preflight.mjs`, `fixture-machine.mjs`, `_tspec-packed-set.mjs`, `package.json`, `loop-distribution.test.js`, `coverageInstrumentation.test.js`, `run.test.js`, `learningsPremises.test.js`, `README.md` | yes |

The keeper set is exactly the ten rows of §2.1's co-change table (the two sibling-feature `docs/`
rows are correctly *outside* the sweep, since the sweep excludes `docs/`, and are counted
separately as "plus two document edits" — the arithmetic does not double-count them). The internal
partition also closes: five enumerations holding six symbols across five files (
`_tspec-packed-set.mjs` holds two), four test files that pin them, and `README.md` as the tenth —
5 + 4 + 1 = 10.

The filter's discriminator is stated in falsifiable terms ("a consumer needs no edit when a *new*
member is added; an enumerator does"), which is the property that makes re-running it deterministic
rather than a judgement call. This is what RK-1's residue argument and `DEC-STATS-03`'s
re-evaluation trigger needed, and they now inherit a reproducible number instead of an asserted one.

One thing I checked specifically, because it is the easiest place for a corrected count to go
wrong: the residual occurrences of "nine" in the document. There is exactly one, at the **v1.2
changelog entry** (line 39), where it is a historical record of what round 3 did. That is correct
as history and must not be rewritten. Every live claim — §2.1 prose, §2.1 table, §6.4's vendoring
row, §7.3's cost paragraph, RK-1, and §9's rejected-alternative re-evaluation trigger — carries
**ten**. No stale count survives.

### Item 2 — `coverageInstrumentation.test.js` row omits P9-02's test title (Low | delta | local) — **RESOLVED**

The row now names the title alongside the `c8.include` literal and the real-c8-run driver, and
states explicitly that the title carries no assertion and is corrected for the same reason the
`learningsPremises.test.js` row's is. Verified against HEAD:

- `pdlc/workflows/__tests__/coverageInstrumentation.test.js:264` — `test("P9-02: the include set is
  exactly the six modules the feature owns, no more and no fewer", ...)`. The "six" is real, the
  six → seven correction is right, and no assertion depends on it.
- The parallel `learningsPremises.test.js` row still names its own title ("exactly four workflow
  modules"), so the two rows are now symmetric — which was the asymmetry the finding flagged.

The stronger half of the row survives intact: P9-02's shipped assertion is `toEqual`, so
array-equality and hence entry *position* still matters, and that is still stated.

## Collateral Check on Untouched Approved Material

Three collateral corrections rode this erratum. Each is checked for whether it breaks something
already approved.

**(b) The tenth site, `pdlc/README.md`.** Verified at `pdlc/README.md:231`: "The four workflow
modules it dispatches (`orchestrate-dev.js`, `orchestrate-queue.js`, `lib/loop-session.mjs`,
`lib/escalation-view.mjs`) are vendored…". The prose enumeration and the count word both exist, so
the row is real, not speculative. The row's most important sentence is the one that says this is
`MODULE_NAMES`'s **copied-module** class (4 → 5) and *not* the packed class (5 → 6), and that the
two must not be synchronised. I confirmed both at HEAD: `prepack.mjs:20` `MODULE_NAMES` has four
members; `_tspec-packed-set.mjs:51` `WORKFLOW_MEMBERS` has five, because it also carries
`vendor/workflows/VENDOR-MANIFEST.json`. An implementer who "fixed" the README to five-and-six
would red `tspecPackedCount`. The warning is load-bearing and correct.

The row is honestly marked **pinned by no oracle**, and RK-1 now carries it as named residue (item
ii) with an owning task rather than implying coverage. That is the right disposition: I would
rather see an un-oracled site named in the risk table than quietly counted as covered. §6.4's
vendoring row was correspondingly re-stated as covering "four of the ten directly and a fifth
(`c8.include`) by way of `coverageInstrumentation.test.js`" — the coverage claim did not silently
inflate with the count.

**(c) P7-02's `vendoredClassWord` arm.** Verified at `pdlc/engine/__tests__/loop-distribution.test.js:187`:
`const vendoredClassWord = vendoredClassSize === 5 ? "five" : String(vendoredClassSize);`, consumed
at lines 194 and 200 by regexes over the sibling FSPEC's count **word**. Left un-edited, a `6`
would stringify to `"6"` and the document oracle would red against an otherwise complete co-change
— exactly as the row now says. The row's assertion tally moves seven → **eight**, which is the
correct arithmetic over its own enumerated edits (two `added` lists, three baselines, the length
equality, the class-size assertion, plus this ternary).

**(e) The §6.4 purity split.** This is the one change that could have weakened an approved oracle,
so I checked it hardest, and it does the opposite.

- `deriveDodRoundIndex` is typed `(basenames: unknown, feature: string) => number` at §3.2 line 308,
  transcribed from the HEAD export. A non-aliasing assertion over a `number` return is not merely
  weak, it is **wrong**: two equal numbers are `===`, so the old blanket conjunct would have red-lined
  a correct, wholly pure implementation. The split removes a false-red, not a detector.
- Deleting the conjunct instead would have removed `DEC-STATS-03`'s only mechanical detector for
  that export. The A-B-A replacement keeps one, and the document states precisely what it does and
  does not falsify: a memo is invisible to it, but a high-water mark, a carried-forward maximum or
  any retained `let` makes the third call differ from the first. That honesty is worth more than an
  overclaimed conjunct, and it is exactly the "a test that can only pass is not a test" bar.
- The three object-returning classifiers keep the full `deepEqual` **and** non-aliased conjunct. I
  checked that this cannot false-red at HEAD either: `parseResolvedMarker` (lines 7608–7614) and
  `parseReviewFilename` (lines 10137–10162) construct a **fresh object literal at every return
  site**, including the failure paths — no shared module-level sentinel is returned. So a correct
  implementation is non-aliased today, and the conjunct reds only on a memo.
- The fresh-module-instance requirement is retained and now explicitly scoped to *both* shapes, so
  neither conjunct can pass vacuously off a cache warmed by an earlier test in the same worker.

Nothing else in the document moved. The diff touches only the changelog header, §2.1, the §2.1
table's two amended rows plus one added row, §6.4's two rows, §6.4's narrative, §7.3, RK-1 and §9's
trigger sentence. No behavioural claim, type, signature or code sketch changed — I diffed to confirm
that claim rather than accept it.

## Positive Observations

## Open Questions

## Recommendation

## Delta-Confirmation Findings

## Verdict
