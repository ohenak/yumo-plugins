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

Five task-table cells moved. I re-derived each against HEAD.

**T-04 — AT-17's fourth leg (answers my v4 F-05).** My v4 finding was that T-04 gave the implementer
no signal that a live REQ-versus-FSPEC dispute sat under one of its assertion sites. The delta
resolves it on the dispute's **decided** form: it names AT-17's fourth leg as the one site the
disagreement ever reached, records it discharged, and states that no expected value moves. Every
clause of that is transcribed faithfully from `TSPEC-pdlc-stats.md` §8.3, which now reads
"**discharged at REQ v1.7 and absorbed by FSPEC v1.8 in BR-16's favour** — the unrecognised basename
counts as no file of its family remaining, which is the reading §4.3 and AT-17's fourth leg already
carried, so no expected value moved". FSPEC v1.8's own changelog agrees ("REQ v1.7 withdrew that
clause and decided the case BR-16's way … the item is **absorbed**, not open"). The PLAN adds nothing
upstream does not say, and it correctly declines to move an expected value — which is the point, since
the implementer's obligation is unchanged.

This is the right altitude for a PLAN row. It tells the implementer *where* the settled question
landed and that they owe no re-stamp; the expected value itself stays owned by TSPEC §4.3 and
PROPERTIES. No coverage gap opens and no task changes.

**T-16 `Status` cell: ⬚ → ✅.** The only delta site with no changelog entry. It is factually correct —
`feat(pdlc-stats): T-16 — 🟢 runStats …` (`c3acd694d`) is an ancestor of HEAD and
`pdlc/workflows/lib/stats.mjs:451` exports `runStats`. But it is one correct entry in a ledger that is
broadly stale, and it predates this round; see F-01.

**T-23 — `assertAdditiveOnly` anchor (answers my v4 F-02 and pm F-03).** Verified verbatim at the
declared baseline, per the Overview table. The surrounding claim also holds: `assertAdditiveOnly`'s
message is genuinely hard-coded and genuinely goes stale, because at merge-base it says "the **two**
new members" while this feature adds one. T-23 is right to own the edit.

**T-24 — second P9-02 transcription (answers pm F-02).** Verified verbatim at the declared baseline.
The added sentence "the count word `two` is one of the stale words this task corrects" is a real
strengthening: at v1.2 the row said only "correcting the stale count words in P9-02's title and
comment" for the *first* P9-02 test, leaving the second test's own count word implicit. Naming it
closes a silent-drop risk, since the two tests carry independent count words.

**Batch 10 gate — red-signal scoping (answers my v4 F-04).** The gate note now says the red signal
comes from "the **four enumerations `assertAdditiveOnly` reads** (TSPEC §6.4, §2.1's sites 1–4:
`prepack.mjs`, `publish-preflight.mjs`, `fixture-machine.mjs`, `_tspec-packed-set.mjs`)" and that
T-24's `c8.include` edit is **not** one of them. Re-derived mechanically from
`pdlc/engine/__tests__/loop-distribution.test.js` at merge-base — `assertAdditiveOnly` has exactly four
call sites inside P7-02, and their first arguments are:

| Site | Enumeration read | Label in source |
|---|---|---|
| `:137` | `prepackNs.MODULE_NAMES` | `D-1 (prepack.mjs MODULE_NAMES)` |
| `:145` | `publishPreflightNs.WORKFLOW_MEMBERS` | `D-2 (publish-preflight.mjs WORKFLOW_MEMBERS)` |
| `:153` | `packedSetNs.WORKFLOW_MEMBERS` | `D-3 (_tspec-packed-set.mjs WORKFLOW_MEMBERS)` |
| `:166` | `fixtureMachineNs.WORKFLOW_MODULE_NAMES` | `D-5 (fixture-machine.mjs WORKFLOW_MODULE_NAMES)` |

Exactly four, exactly the four named, in the named order, and `c8.include` is read by a different
suite (`pdlc/workflows/__tests__/coverageInstrumentation.test.js`) that `assertAdditiveOnly` never
touches. The corollary the PLAN draws — that landing T-24 first leaves the suite green and that this
is **not** drift — follows, and it is the operationally useful half: without it an implementer who
sequences T-24 first sees a green suite where the batch note promised red and cannot tell a correct
ordering from a broken oracle. Finding resolved, and resolved with the right mechanism.

## Dependencies

**Batch-DAG unchanged, and re-derived anyway.** The delta adds no task, removes none, and changes no
task's `Deps` cell. The four touched task rows keep the batch numbers I re-derived and accepted at v4:
T-04 batch `2` behind `T-01, T-02` (`max(1,1)+1 = 2` ✓); T-16 batch `7` behind `T-15, T-07`
(`max(6,2)+1 = 7` ✓); T-23 and T-24 both batch `10` behind `T-20` (`9+1 = 10` ✓). Ids remain unique,
every dependency resolves to a declared task, and the graph stays acyclic. No edge was added or
removed, so the acyclicity argument I accepted at v4 carries forward unchanged.

**Same-batch same-new-file guard.** T-23 and T-24 are the two rows the delta edited that share a
batch. They remain disjoint: T-23 owns `pdlc/engine/__tests__/loop-distribution.test.js` (exists),
T-24 owns `pdlc/workflows/__tests__/coverageInstrumentation.test.js` (exists) and
`pdlc/workflows/package.json` (exists). Neither creates a new file, so the last-writer-wins collision
this guard exists to catch cannot arise between them. Batch 10's other three rows (T-21, T-22, T-25)
were untouched and their clusters were checked disjoint at v4.

**File-existence sweep over the delta's rows.** Every file named in a changed cell exists at HEAD and
none is declared new:

| File named | Declared | At HEAD |
|---|---|---|
| `pdlc/engine/__tests__/loop-distribution.test.js` | `(exists)` | present |
| `pdlc/workflows/__tests__/coverageInstrumentation.test.js` | `(exists)` | present |
| `pdlc/workflows/package.json` | `(exists)` | present |
| `pdlc/workflows/__tests__/statsMetrics.test.js` (T-04) | new | present — created by this feature's own landed work |
| `pdlc/workflows/lib/stats.mjs` (T-04, T-16) | new | present — created by this feature's own landed work |

The last two rows are the ledger question, not a manifest error: the PLAN correctly declares them new
relative to the plan's own baseline, and they exist now because tasks have landed. That is the
condition F-01 records.

**Batch 10's ordering claim is now a dependency statement, not just prose.** The gate note's new
clause — T-24's `c8.include` edit is outside `assertAdditiveOnly`'s read set — is what licenses the
batch to contain both a red-producing and a non-red-producing enumeration edit without the gate note
becoming unfalsifiable. Batch 10 still measures its gate at batch end, which is correct: the whole
batch is one landing, and a mid-batch red is expected by `K-1`.

## Verification

## Delta-Confirmation Findings

## Verdict
