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

**AT-15 coverage row (answers my v4 F-01).** The row now reads
`AT-15 | T-04 (size arithmetic, removal probe), T-18 (symbolic-link leg, real fs), T-09 (shipped seam,
end-to-end)`. My v4 finding was that the coverage table and the anti-drift narrative disagreed: T-09's
row had carried AT-15/EC-19 on the shipped seam since v1.2, but the coverage table did not list it, so
a reader auditing AT-15 could conclude the shipped seam was unproven. The delta makes the two agree,
and the claim is true against the PLAN's own T-09 row, which explicitly carries "**and the
symbolic-link leg on the same production path** … asserting the reported byte total counts the
*link's own* size (EC-19)" and states it is the only *behavioural* evidence on the shipped seam.

This matters more than a table tidy-up, and it is worth saying why it is the correct resolution rather
than a cosmetic one. AT-15/EC-19 is a production-path obligation: T-04's leg runs over a fake that
"cannot distinguish `lstatSync` from `statSync`", T-18's leg runs over T-02's `realStatsIo()` helper,
and T-10's conjunct is source-level only. Under DC-07's reading, a helper-level real-fs test is still
not the shipped seam — only T-09 drives `main()`. Listing all three, with each one's role parenthesised,
is exactly the traceability that lets a DoD reviewer see that the falsifying evidence sits on the
production path and not only on a helper. The three legs are complementary, not redundant, and the row
now says so.

**Residual risks — the discharged row (answers pm F-01, and closes my own v5 F-01).** Two rows moved.
The leading-underscore row gains "BR-26/EC-10's missing positive feature-recognition predicate, which
is the **only** erratum TSPEC §8.3 still carries open", and a new row carries the REQ-STATS-06-versus-
BR-16 item marked **Discharged**, "carried here only to close it, so the DoD reviewer does not re-open
it".

Both claims measured against `TSPEC-pdlc-stats.md` §8.3 at HEAD, which opens: "**One remains open** —
BR-26/EC-10's unclassified predicate, below. Four others this section carried are **closed** …" and
then carries exactly one bullet, the BR-26/EC-10 one. So "only erratum still open" is exactly true,
and the count is verifiable by bullet enumeration rather than by trusting the prose. The discharged
row's provenance cell — "TSPEC §8.3 (second bullet at TSPEC v1.7, removed at v1.8)" — is likewise
correct: TSPEC's v1.8 changelog records "(d) §8.3's second bullet closes as discharged and its count
word moves". Citing a bullet by the version at which it existed, and naming the version that removed
it, is the right way to cite a deleted anchor; a bare `§8.3` pointer would dangle.

Carrying a *discharged* item in Residual risks is a deliberate and correct choice, not clutter. TSPEC
removed the bullet, so a DoD reviewer reading only HEAD sees no trace of a question that consumed
several rounds; the PLAN's row is what stops it being rediscovered and re-opened. It is explicitly
labelled as carried-only-to-close, so it cannot be mistaken for live work.

**Falsification attempts that failed to find a defect.** I tried three ways to make the delta wrong:

1. *Is any anchor false against the baseline it names?* No — all four checked verbatim, byte for byte
   (Overview table). I specifically checked the failure mode where an author "fixes" a citation by
   qualifying it while the underlying value was wrong to begin with; the values are right.
2. *Does the batch-10 scoping claim overcount or undercount?* No — exactly four `assertAdditiveOnly`
   call sites, exactly the four named, and `c8.include` provably outside that suite.
3. *Did any expected value silently move under the erratum discharge?* No. `grep -n "survivor"` over
   the PLAN returns nothing; the settlement's direction (out-of-catalogue basename → counts as no file
   remaining) is the direction TSPEC §4.3 and AT-17 already carried, so no PLAN expectation flips. The
   only leg the dispute could have decided is AT-17's fourth, and T-04 now names it while still
   delegating the expected value to TSPEC.

**Test-quality bar over the delta.** Nothing the delta adds is an implementation echo — every expected
value is a literal transcription from a spec or a measured source string, and the two count words
(`two`, `five`/`six`) are transcribed rather than derived from the code under test. The batch-10 note
is a positive claim about which enumerations red, paired with the positive claim that T-24's edit
leaves the suite green, so it is not an absence-only oracle. The AT-15 row is a completeness claim
over the AT enumeration and the coverage table remains a full-enumeration mapping.

**Rigour bar.** No High finding is open, delta or inherited. One Medium and one Low, both inherited
and both nonlocal — neither is damage this round's edit caused, and the round's edit strictly improved
the document on every site it touched. Five of five v4 te findings are now resolved or explicitly
recorded-not-fixed.

DEFERRED: the `Status` ledger and the branch's commit subjects have drifted apart far enough that task
completion cannot be audited from either alone — worth one reconciliation pass before DoD, but not a
planning decision to take in a frozen round.

## Delta-Confirmation Findings

The delta resolves all four routed items (my v4 F-01, F-02, F-04, F-05, plus pm F-01, F-02, F-03) and
breaks nothing that was approved. No High finding is open, delta or inherited. Two findings below,
both **inherited** and both **nonlocal** — neither was caused by this round's edit, and neither gates
the PLAN.

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|-------------|----------------|
| F-01 | Medium | inherited | nonlocal | The `Status` ledger no longer describes the branch. Eighteen tasks have landed `feat(pdlc-stats): T-NN` commits that are ancestors of HEAD (T-02…T-11, T-13…T-20), and T-12's `lib/stats.mjs` landed too, yet only three rows read `✅` (T-01, T-08, T-16). The delta's T-16 flip is itself **correct** — `c3acd694d` is an ancestor and `stats.mjs:451` exports `runStats` — but it is the third partial update to a ledger that is otherwise ~15 rows behind, and it is the one delta site the v1.3 changelog does not mention. A partially-updated ledger reads as authoritative in a way a uniformly-stale one does not: a DoD reviewer scanning the column concludes T-04…T-07 and T-09…T-15 are not started, when their tests and module are on disk. Not gating — every cell is individually true or conservatively stale, no expected value or task definition is affected, and the fix is a mechanical reconciliation. Suggested: reconcile the whole column in one pass and note it in the changelog, or state once that the column is not maintained during implementation and let the wave ledger own completion. | `## Batches` task table, `Status` column; `Status key` line |
| F-02 | Low | inherited | nonlocal | Task completion cannot be audited from commit subjects either, so F-01 has no cheap cross-check. Most tasks landed under `feat(pdlc-stats): T-NN — …` subjects, but T-12's work (create `lib/stats.mjs`) has no `T-12` subject — the file is first added by `308afef94 docs(pdlc-stats): se PROPERTIES v3 scope section` — and `05315533e docs(pdlc-stats): PM TSPEC cross-review v11 — Architecture` carries substantive T-21/T-22/T-24/T-25-shaped edits to `prepack.mjs`, `fixture-machine.mjs`, `_tspec-packed-set.mjs`, `loop-distribution.test.js` and `coverageInstrumentation.test.js`. This is a commit-hygiene observation about the branch, not a defect in the PLAN, and it changes no task. It is worth recording because it is *why* the anchor-baseline qualifier this round added is load-bearing: implementation is landing under review-shaped subjects, so cited line numbers move without an obvious signal. | Branch history; PLAN `## Batches` task table |

FINDING: Medium | inherited | nonlocal | `## Batches` task table, `Status` column | The `Status` ledger is ~15 rows behind the branch: eighteen tasks have landed `feat(pdlc-stats): T-NN` commits reachable from HEAD, but only T-01, T-08 and T-16 read `✅`. The delta's T-16 flip is factually correct and undocumented in the v1.3 changelog; the residual risk is that a partially-updated column misreads as authoritative to a DoD reviewer. No task definition or expected value is affected. Fix: reconcile the column in one pass, or state that it is not maintained during implementation.
FINDING: Low | inherited | nonlocal | Branch history / PLAN `## Batches` task table | Commit subjects do not track task completion either, so F-01 has no cheap cross-check: T-12's `lib/stats.mjs` first appears under `308afef94 docs(…): se PROPERTIES v3 scope section`, and `05315533e docs(…): PM TSPEC cross-review v11` carries T-21/T-22/T-24/T-25-shaped source edits. A branch-hygiene observation, not a PLAN defect; recorded because it is why this round's pre-change-baseline anchor qualifier is load-bearing.

## Positive Observations

- **The anchor fix chose the right axis.** Three findings asked for citation accuracy; the author
  answered by naming the baseline the citation was taken against, rather than by re-pinning to a
  moving HEAD. That is the durable form, and it is the only form that survives this feature's own
  tasks editing the cited files — which they already have.
- **The batch-10 scoping note is falsifiable.** It names four enumerations, they are exactly the four
  `assertAdditiveOnly` reads, and it states the negative case (T-24 leaves the suite green) so an
  implementer can tell correct sequencing from a broken oracle.
- **The discharged erratum row is carried, not dropped.** TSPEC removed the bullet at v1.8; the PLAN's
  row is what stops a DoD reviewer rediscovering a settled question, and it is labelled so it cannot
  be mistaken for live work.
- **te F-03 was answered by declining it, in writing.** Recording a finding as not-to-be-fixed with
  its rationale is a better outcome than a silent no-op, and it kept the round small.

## Recommendation

**Approved with minor changes**

Every routed item is resolved, and resolved with the right mechanism rather than the minimum edit. No
High finding is open. The two findings recorded are inherited and nonlocal: a stale `Status` column
(Medium) and the branch-hygiene observation that explains why it has no cheap cross-check (Low).
Neither touches a task definition, a dependency edge, an expected value or a coverage claim, so
neither gates implementation. The PLAN is testable as written and the batch DAG is sound.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
