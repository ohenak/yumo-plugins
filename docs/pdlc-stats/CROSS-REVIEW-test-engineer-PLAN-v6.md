# Cross-Review: test-engineer — PLAN (round-4 revision, delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-stats/PLAN-pdlc-stats.md
**Date:** 2026-08-31
**Iteration:** 6
**Baseline:** v5's `REVIEWED-COMMIT: 034205d4` → HEAD `e6f18c5a1`
**Scope:** PLAN v1.2 → v1.3. Delta only, re-grounded on HEAD; unchanged sections not re-litigated.

## Overview

**What moved.** `git diff 034205d4 HEAD -- docs/pdlc-stats/PLAN-pdlc-stats.md` is 11 insertions / 8
deletions across seven sites: the v1.3 changelog row, T-04's AT-17 paragraph, T-16's `Status` cell,
T-23's `assertAdditiveOnly` anchor, T-24's second-`P9-02` transcription, batch 10's gate note, the
AT-15 coverage row, and two Residual-risks rows. Nothing else in a 51 KB document moved. Both v4
cross-reviews carried `VERDICT: Approved with minor changes`
(`CROSS-REVIEW-test-engineer-PLAN-v4.md:242`, `CROSS-REVIEW-product-manager-PLAN-v4.md:106`), so this
was a minor-changes revision, and it stayed one.

**How I reviewed it.** Every claim the delta makes is a claim about a byte on disk, so I measured
each one rather than reading it. The load-bearing move is that three of the five findings I filed at
v4 were *citation-accuracy* findings, and the author answered them by adding a **baseline qualifier**
rather than by changing the cited value. That is the right fix and it is the one thing worth checking
carefully, because it is only correct if the qualifier names the baseline the citation was actually
taken against.

It does. The PLAN's anchors are stated "at the pre-change baseline", and the pre-change baseline is
`git merge-base main HEAD` — the state before this feature's own tasks began landing. Measured there:

| PLAN claim (v1.3) | Measured at merge-base | Verdict |
|---|---|---|
| T-23: `assertAdditiveOnly`'s message literal is line `77` | line `77` is `` `${label}: delta over baseline must be exactly the two new members, got ${JSON.stringify(actual)}` `` | **True**, verbatim |
| T-23: the `assert.equal(` statement spans `74-78` | `assert.equal(` opens at `74`, closes at `78` | **True** |
| T-24: second P9-02 title, verbatim, no backticks around `lib/` | `278:  test("P9-02: the shipped c8 config resolves the two new lib/ modules too (F4)", …` — no backticks | **True**, verbatim |
| T-24: `two` is one of the stale count words the task corrects | the source word is `two`; the module count moves to three | **True** |

The reason the qualifier is load-bearing rather than pedantic: those same two files have **already
moved on this branch** (`05315533e` amended both), so at HEAD the literal reads "the new member" at
line `91` and the title reads "the three new `lib/` modules" at line `279`. An unqualified anchor
would now be false against HEAD and would send an implementer to the wrong line with the wrong
expected string. The qualifier is what makes the citation survive its own feature's churn. This is
the shape of fix I asked for at v4 F-02, and it is better than the one I asked for.

**What I did not re-open.** te F-03 (T-23's nine edits versus TSPEC §2.1's eight) was filed
recorded-not-to-be-fixed at v4 and the changelog says so plainly. It takes no edit and I do not
re-raise it. My v5 F-01 (TSPEC §8.3's stale contested-upstream paragraph) is **closed** by TSPEC
v1.8 — see Verification. My v5 F-02 (a mis-stamped TSPEC `UPSTREAM-STATE` pin in my own v4 file) was
a defect in my cross-review, not in the PLAN, and is not this document's to carry.

## Batches

## Dependencies

## Verification

## Delta-Confirmation Findings

## Verdict
