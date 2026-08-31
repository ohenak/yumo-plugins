# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.2)
**Date:** 2026-08-31
**Iteration:** 3

Delta re-review. Diffed `3e4780c8a` (the commit carrying my v2 cross-review) to HEAD: the document
moved across six commits, `da99bbffb` → `06277f5d1`, +73/−16 lines. I re-read my v2 findings first,
diffed the document, verified every new factual claim against the tree at HEAD, and scanned only the
changed sections for new issues. Sections untouched by the revision and approved in v2 are not
re-litigated.

## Prior findings disposition

| v2 finding | Severity | Status | Evidence |
|---|---|---|---|
| F-01 — a sixth co-change site (`loop-distribution.test.js`) missing from option A's cost table, and one of its assertions goes red | High | **Resolved** | The site table gains a sixth row; the option table's cell moves *five* → **six**; a new subsection explains the miss; K-8 owns the obligation; K-1 names it as the conjunct that reds first. All four asks landed |
| F-02 — the third residual asserted the absence of an oracle that exists at HEAD | High | **Resolved, and correctly narrowed** | The row now states the real gap — `PK-26`'s existence *as a row* — and points at P7-02 for the count half. Verified: the oracle's two regexes match member-count **sentences** (`names the vendored ${word}`, `\*\*${word} vendored workflow members\*\*`, `loop-distribution.test.js:194-201`), never the `PK-*` rows above them, so a counts-only edit is green exactly as the row claims |
| F-03 — K-7's "exactly as that document's 0.15 row records" overstated the precedent | Low | **Resolved** | K-7 now says "by the same versioned route … **bundled more tightly than 0.15 was**", and quotes the split clause it originally elided |

Both gating findings are closed on the evidence, not on assertion. The revision also went further than
I asked in two places that were right calls: it re-derived the trigger's list count (six → eleven) and
restated K-3's conjunct as array-equality.

## Verification of the revision's new claims against HEAD

Every new claim the revision makes, checked against the tree rather than against the prose:

| Claim | Where | Verified |
|---|---|---|
| `loop-distribution.test.js` is **live** at HEAD — four un-`skip`ped tests | Sixth-site subsection | Confirmed. The file's own header comment still says *"Every block below is committed `test.skip`"*, but `loop-distribution.test.js:91,135,182,226` are four bare `test(` calls. The document's claim is right and the file's comment is stale |
| `assertAdditiveOnly` is not containment-only; its last assertion is a set-size equality | Sixth-site subsection | Confirmed at `loop-distribution.test.js:75-79`: `assert.equal(actual.length, baseline.length + added.length, …)`. The *"both-directions-lite"* quote is verbatim (`loop-distribution.test.js:63`) |
| The additive-only test applies it to `prepack.mjs`'s `MODULE_NAMES`, `publish-preflight.mjs`'s `WORKFLOW_MEMBERS`, `_tspec-packed-set.mjs`'s `WORKFLOW_MEMBERS` and `fixture-machine.mjs`'s `WORKFLOW_MODULE_NAMES` | Sixth-site subsection | Confirmed, four call sites at `loop-distribution.test.js:137,145,153,166` |
| **Six assertions** in that file pin the four enumerations and the count K-2 moves | Cost table, sixth row | Confirmed: four `assertAdditiveOnly` calls + `assert.equal(tspecPackedCount(…), 4 + 15 + 5 + 1, …)` (`:159-163`) + the derived `assert.equal(vendoredClassSize, 5, …)` (`:204-208`) = six |
| The document oracle derives rather than transcribes | K-7 falsifier | Confirmed at `loop-distribution.test.js:186-187`: `tspecPackedCount({licence:false}) - (4 + 15 + 1)`, then the word is derived from it |
| **Eleven** hand-written lists across **seven** files; ten distinct member facts; `D1_BASELINE` and `D5_BASELINE` hold identical content | DEC-STATS-01 re-evaluation trigger | Confirmed. Both baselines are `["orchestrate-dev.js", "orchestrate-queue.js"]` (`loop-distribution.test.js:55,61`). The arithmetic and the dedup note are both right |
| `c8.include` is asserted with **array**-equality, position-sensitive | K-3 | Confirmed: `coverageInstrumentation.test.js:266` is `expect(include).toEqual([…])` against the seven `**/`-anchored entries in `pdlc/workflows/package.json`. Array-equality is strictly stronger than set-equality, as K-3 now says |
| FSPEC BR-30 makes the error object *"a released shape under REQ R-5"*, key set exactly `schemaVersion`, `error`, `feature`, governed by BR-24's increment rule | DEC-STATS-02, PM Q-02 answer | Confirmed verbatim at `FSPEC-pdlc-stats.md:517-528`. The Q-02 answer is an accurate reading of the FSPEC, not a new product decision — which is the right disposition |
| The re-baselining shape: the four enumerations are at `pdlc-engineering-loop`'s **post**-state at HEAD, so the baselines must absorb its two `lib/` members | K-8 | Confirmed: `prepack.mjs:20-25` holds four entries including both `lib/` members, while `D1_BASELINE` holds the pre-state two. The prescribed shape is the correct one |

Eleven claims checked, eleven hold. What did not hold is a claim of *completeness* the revision
inherits rather than makes — see F-01.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
