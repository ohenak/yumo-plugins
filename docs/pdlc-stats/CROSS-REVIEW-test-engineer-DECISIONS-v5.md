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

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **The sweep's own partition sums to 24 of its 25 hits.** *What the sweep found* reads: 25 files, "of which the ones that **transcribe a member list** (rather than importing a module, which is what the other fifteen do) are exactly the nine in the table above". Nine plus fifteen is twenty-four. The twenty-fifth is `pdlc/README.md`, which neither transcribes-into-the-table nor imports — it is the tenth transcription the same section names three paragraphs later. Both sub-counts are individually right (I re-derived the fifteen importers by elimination), so this is a gap in a sentence, not a wrong number; but this paragraph exists so the next reader can establish completeness by arithmetic, and the arithmetic offered does not close over its own total | *What the sweep found* |

## Questions

| ID | Question |
|----|---------|
| Q-01 | The promoted rule tells the next author to "re-pick the probe when the class changes", but `loop-distribution.test.js` would survive a re-picked probe no better than the current one: it pins the engine `lib/` class as the bare literal `15` inside `4 + 15 + 5 + 1` (`:161`) and names no member at all. I confirmed this from the other side — `git grep -l "resolve-version"` over tracked sources finds `_tspec-packed-set.mjs` and `publish-preflight.mjs` (the two transcribers) but **not** `loop-distribution.test.js`. Is a second clause worth promoting alongside the probe rule — *a size assertion may name no member, so also grep the class's current size as a literal* — or is that a lesson better left for the feature that gets bitten by it? |

## Detail

### F-01 (Low, Local) — the partition, not the count

The count reproduces. I ran the cited command verbatim at HEAD and got 25, and I ran the superseded
form too: `grep -rln` returns 23, and the set difference between them is exactly
`pdlc/workflows/__tests__/loopProperties.test.js` and `pdlc/workflows/lib/escalation-view.mjs` — the
two NUL-carrying files the new tool note names. The note's claim that both dropped files are
importers also holds: `loopProperties.test.js`'s six references are an import at `:30` and dynamic
`import()` / URL paths at `:581`, `:614`, `:621`, `:631`, plus a comment at `:15`. No member list.
So the nine-site set genuinely survives either tool, exactly as the document says.

What does not close is the sentence that partitions the hits. Nine transcribers plus "the other
fifteen" importers accounts for 24 of 25. The missing file is `pdlc/README.md`, and the document is
not confused about it — it gets its own paragraph, an owner in K-9, and a line under *Standing costs
accepted*. The defect is that a reader who does what this paragraph invites, re-running the command
and checking the split, lands on a one-file discrepancy and has to read on to discover it is
deliberate. That is the same reader experience v4 F-02 was about, at much lower cost.

**What change resolves it.** One clause: *"…which is what fifteen of the other sixteen do; the
sixteenth, `pdlc/README.md`, transcribes the list in prose and is treated below."* The count, the
table and every downstream number stay as they are.

### Why F-01 is Low and not Medium

v4's F-02 was Medium because the printed number could not be reproduced by the printed command, so
completeness could not be established at all. Here completeness *can* be established: the total is
right, both sub-counts are right, and the unlisted file is named and dispositioned in the same
section under a heading that says so. The cost is a re-read, not a re-derivation.
