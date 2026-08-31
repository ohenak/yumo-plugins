# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.4)
**Date:** 2026-08-31
**Iteration:** 5

## Scope

Delta re-review over `CROSS-REVIEW-test-engineer-DECISIONS-v4.md`. Diffed `c8759d18e..HEAD` on the
document (six commits, +64/−18 lines by hunk). I checked the disposition of v4's three findings and
scanned only the changed sections for new issues: the v1.4 changelog header, DEC-STATS-01's option
table row **B**, the *What the sweep found* paragraph and its four new notes (scope, tool, probe,
tenth transcription), the *Corrected cost claim* paragraph, the durable-lesson paragraph, K-3's new
message-string clause, K-9's new README/promotion/Q-02 material, and the *Standing costs accepted*
bullet. Unchanged sections already approved in v1–v4 are not re-litigated.

Every number below was re-measured at HEAD by running the commands the document cites, not read off
the document. Both sweep forms were run, their result sets diffed against each other, and the
engine-`lib/` class was probed independently with `resolve-version` to test option B's re-priced
cost from a direction the document does not use.

## v4 findings disposition

| v4 ID | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| F-01 | High | **Resolved** | `publish-preflight.mjs` is off B's "does not pay" list and on B's bill. The option table and *Corrected cost claim* now both price B at **four** sites and name the file as being on *both* bills for different constants (A: `WORKFLOW_MEMBERS`; B: `LIB_MODULES_AT_HEAD` / `LIB_MODULES_FROM_THIS_FEATURE`). Verified live: `publish-preflight.mjs:205` holds 12 names, `:219` holds 3, `:239-240` feeds both into `expectedPackedSet()`, and the deliberate-duplication comment sits at `:201`. `_tspec-packed-set.mjs:29`/`:45` is the first copy, `:99` the `4 + 15 + 5 + 1` term, `loop-distribution.test.js:161` the pinned literal — four sites, exactly as written. The structural half is resolved too: the sweep is restated over tracked sources and K-9's promoted rule now carries the query, its scope, and `publish-preflight.mjs` as the worked example |
| F-02 | Medium | **Resolved, and over-delivered** | I asked for the printed count to match the command. The revision changed the command instead: `git grep -l "escalation-view" -- . ':!docs/' ':!*/dist/*'` returns **25** at HEAD, exactly as stated. `loop-cli.test.js`'s references are six, on `:122`, `:637`, `:652`, `:681` (`loop-session.mjs`) and `:827`, `:852` (`escalation-view.mjs`) — verified line-for-line, and the four/two split is now written correctly. The new NUL-byte note is also correct and I verified it the hard way: diffing the two result sets returns exactly two files, `loopProperties.test.js` and `lib/escalation-view.mjs`, so 25 vs 23 and 15 vs 14 in the old test-dir scope both reproduce |
| F-03 | Low | **Resolved** | `pdlc/README.md:231`'s prose list is recorded in three places — its own paragraph, K-9's owning task, and the *Standing costs accepted* bullet — and is explicitly kept out of the site table as a non-falsifier. Verified: `grep -rn "four workflow modules"` outside `docs/` returns that one line, and `documentOracles.test.js` is not among the 25 sweep hits at all, so nothing greps that README for a member of this class. The site count stays nine |

All three v4 findings landed. One new finding below, Low, introduced by this round's edit.
