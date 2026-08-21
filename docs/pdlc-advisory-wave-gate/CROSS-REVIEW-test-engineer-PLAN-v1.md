# Cross-Review: test-engineer — PLAN (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md (v1.10)
**Date:** 2026-08-20
**Iteration:** 1 (delta confirmation — erratum round 10, Phase F)

## Scope of this round

This is a delta confirmation, not a re-review. I previously approved this PLAN; erratum round 10
(Phase F) landed a targeted edit and the dispatch reports every routed item ABSORBED against upstream
HEAD — nothing on the item list remained to confirm. Per DEC-ERR-03 the question I answer is therefore
the wider one: with REQ at `sha256:c62cfc35…` (v1.15), FSPEC at `sha256:91ef2557…` (v1.6), TSPEC at
`sha256:3fa21acf…` (v1.11) and DECISIONS at `sha256:84deee10…`, is this PLAN still a faithful
compression of what those documents now say? All four dispatch hashes were re-computed on the branch
and match; the branch is `feat-pdlc-advisory-wave-gate`.

The edit is confined to the OQ-7 closure surface, so my reading is: (a) the four retired
upstream-pending routings, (b) the two upstream boundaries the edit transcribes (BR-9's **domain** and
its **observation point**), and (c) the graph the edit claims it did not move.

## What the delta changed

`git diff b83ecd03~1..HEAD` over the PLAN is 36 insertions / 14 deletions across five surfaces, all of
them OQ-7's:

| Surface | Before | After |
|---|---|---|
| Overview block | *Not in scope here* — OQ-7 upstream-pending on FSPEC BR-9 / REQ AC-5.1 | *Decided upstream, transcribed here* — domain and observation point stated as two bullets |
| A6-10 red step (former A6-09) | ignored-path round trip minted with a `test.todo` pending marker | fully asserted live case, no pending marker; `.skip`-halt reasoning retained |
| *Upstream dependency that is still open* | OQ-7 pending, does not block any task | *…that was open, and is now closed*, closing with **no upstream dependency of this plan is open** |
| AT-05-1 traceability row | "ignored-path case pending on OQ-7" | domain + observation point named; "ignored-path case live (OQ-7 closed), restoring one fails" |
| DoD leg | disjunction: landed-and-transcribed **or** still-marked-pending | single leg on the landed boundary, no pending arm |

No task row, `Batch`, `Deps`, test-file or source-file cell was touched — confirmed by the diff (the
only table row that changed is A6-10's description cell) and independently re-derived below. Retiring
the `test.todo` marker while keeping the `scanSkipTokens` / `checkWaveUnskips` reasoning is the right
call: the reasoning still governs the file even though the marker it justified is gone.

## Upstream re-grounding (DEC-ERR-03)

I read the upstream text at the dispatched hashes rather than trusting the changelog's account of it.

**REQ AC-5.1 (v1.15) — verified, quoted correctly.** AC-5.1 pins the observation point as "the moment
restoration completes" and excludes exactly the three carriers the PLAN names: AC-6.1's record append,
AC-6.2's escalation-log append, AC-5.2's queue-row write (M-WG-7). It also excludes "paths ignored by
`.gitignore`, which are operator files A6 never wrote and never restores over" — the PLAN quotes that
clause verbatim in its Overview bullet. Faithful.

**FSPEC BR-9 / AT-05-1 / AT-05-2 (v1.6) — verified.** BR-9 fixes the domain as "tracked files and
**non-ignored** untracked files, generated outputs included" with ignored paths "outside the map in
both directions", and pins the observation point before the BR-13 record and escalation writes.
AT-05-1 carries the sentence the PLAN's strongest new claim rests on, verbatim: "Ignored paths are
excluded on both sides — **an implementation that restores one fails this test rather than passing
it** — and a file the repair created is asserted **absent**, not merely reset." So the PLAN's
"restoring one *fails* AT-05-1" is upstream's own words, not an invention of this edit.

**TSPEC (v1.11) — verified.** §2.5's `clean -fd` bullet and observation-point bullet now read as
transcription of a decided boundary, and §6's OQ-7 row reads **Closed upstream, answered *no***, with
OQ-9 marked moot and OQ-11 unaffected. The PLAN's "no mechanism moved" claim matches §2.5. Three
surviving "OQ-7 stays open upstream" strings in the TSPEC are inside its **v1.4 / v1.6 historical
changelog rows**, not its live body — correctly not treated as live by this PLAN.

**DECISIONS — not re-grounded upstream, and the PLAN's absolute claim slightly overreaches.** At the
dispatched hash, DEC-A6-01's option-D row and its "What follows from DEC-A6-01" section still route the
ignored-path boundary as "upstream's open question (TSPEC §6 OQ-7)" and still describe a *scoped
ignored-path capture arm* as contingent on how the erratum returns. Nothing in the PLAN's task graph
reads that arm — the closure landed in the direction that leaves DEC-A6-01 untouched — so this is
upstream staleness rather than a plan defect, but it sits under the PLAN's new sentence "**no upstream
dependency of this plan is open**". Recorded as F-04 below, Low.

**Lineage claim — verified, not edited.** The PLAN's `Downstream` row reads `PROPERTIES`, `IMPL`;
`pdlc-engineering-loop` appears nowhere in the file; and the REQ row the Phase F item described already
reads `FSPEC, TSPEC, PLAN, PROPERTIES (all in this directory)` at v1.15. The changelog's "verified, not
edited" disposition is correct.

## Mechanical re-derivation

## Delta-Confirmation Findings

## Verdict
