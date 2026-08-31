# Cross-Review: test-engineer — PLAN (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-stats/PLAN-pdlc-stats.md
**Date:** 2026-08-31
**Iteration:** 5 (upstream-cascade confirmation, REQ erratum v1.7)
**Scope:** Confirmation only — PLAN's own bytes are unchanged (`sha256:87b439ea…`, the hash my v4 approved). Re-measured against REQ at HEAD.

**Upstream at this dispatch:**

| Document | Hash at HEAD | Moved since my v4 approval? |
|---|---|---|
| REQ | `sha256:f75c348f…` | **Yes** — v1.6 `5f3e8051…` → v1.7 (erratum `e12b78fd8`) |
| FSPEC | `sha256:c7d2c832…` | No |
| TSPEC | `sha256:a06a6032…` | No |
| DECISIONS | `sha256:48522bf9…` | No |

## Overview

**The delta.** REQ erratum v1.7 (`e12b78fd8`) touches one clause of REQ-STATS-06 and nothing else. It
**withdraws** the v1.6 sentence "the predicate is set-membership over C-4's grammars, so a grammatical
basename outside the driver's document-type catalogue is **a survivor** even where REQ-STATS-03 reports
it malformed", and replaces it with the opposite: such a basename "contributes no process bytes and
counts as no file of its family remaining", so a feature whose only `CROSS-REVIEW-` basenames are of
that shape reports **harvested**, not a measured ratio.

**What that settles.** This is the exact REQ-versus-FSPEC conflict my v4 F-05 recorded and that TSPEC
§8.3 carries as its second open erratum. The erratum settles it **in favour of FSPEC BR-16** — which is
the reading TSPEC §4.3 already implements ("the sketch below is written against BR-16, the immediate
upstream") and the value FSPEC AT-17's fourth leg already asserts. The settlement therefore moves the
upstream *toward* the behaviour PLAN's tasks were already written to build, not away from it.

**Answer to the one question.** **Yes — the PLAN still holds.** It needs no edit. Two properties carry
the confirmation:

1. **PLAN never cites the withdrawn clause.** PLAN mentions neither `REQ-STATS-06` nor `BR-16`
   anywhere. Its four occurrences of "harvested" (`:20` changelog, `:96` T-04, `:110` T-18, `:118`
   T-26) are all either the `unmeasurable`/`harvested` **mutant** name or AT-10's genuinely-harvested
   archive rows — none is the out-of-catalogue scoping. There is no sentence in PLAN that the erratum
   makes false.
2. **PLAN is value-agnostic exactly where the delta bites.** T-04 claims "AT-17's four directories"
   without naming any leg's expected value, and delegates the discriminating detail to "Branch-order
   conjuncts of TSPEC §4.3 asserted explicitly". Expected-value ownership sits in TSPEC/PROPERTIES, and
   TSPEC §4.3 implements the now-settled reading. An implementer building T-04 to §4.3 produces the
   behaviour REQ v1.7 now requires.

**Resolved by the delta, not by an edit.** My v4 **F-05** (Low, delta, local) said T-04 gave the
implementer no signal to read TSPEC §8.3's contested conjunct, so the live REQ-versus-FSPEC dispute was
invisible at the task row. The dispute no longer exists — REQ and FSPEC now agree — so there is nothing
left to route and nothing for T-04 to re-stamp. F-05 is **closed** by this erratum. The four other v4
Low findings (F-01…F-04) are untouched by the delta and remain as recorded; they were non-gating then
and are non-gating now.

## Batches

Only four PLAN rows can touch REQ-STATS-06's byte-ratio predicate. I re-derived each against REQ v1.7
and, for the two real-path rows, re-measured the archive at HEAD rather than trusting the document.

| Task | What it claims | Status under REQ v1.7 |
|---|---|---|
| T-04 | 🔴 `computeFeatureStats` reds over `fakeStatsIo`, incl. "byte ratio (AT-15 incl. the removal probe, AT-16, **AT-17's four directories**)" and "Branch-order conjuncts of TSPEC §4.3 asserted explicitly" | **Holds, and is now unambiguous.** Names no expected value for any AT-17 leg, so the erratum cannot falsify it. The fourth leg's value is TSPEC-owned; §4.3 implements BR-16, which REQ now ratifies. |
| T-18 | 🟢 Real-path AT-09 (`docs/completed/pdlc-advisory-wave-gate/` — TSPEC row `6`, four `…-REVIEW-v{1,2}.md` basenames malformed) | **Holds.** Asserts a `TSPEC` round number and a malformed list, not a ratio verdict. Re-measured at HEAD: 62 `CROSS-REVIEW-*`, of which 4 out-of-catalogue → **58 grammatical remain**, `CODE_REVIEW` = 2, `LEARNINGS` = 1. Neither harvested disjunct fires, so the directory reports **measured** under v1.7 exactly as under v1.6. |
| T-18 | 🟢 Real-path AT-10 (`pdlc-headless-engine` — TSPEC `13`, **five rows `harvested`**) | **Holds.** Re-measured at HEAD: `LEARNINGS` = 1, `CODE_REVIEW` = **0**, out-of-catalogue basenames = **0**. The harvested verdict is carried by the `dodReviews.length === 0` disjunct, which the erratum does not touch. Independent of the delta. |
| T-26 | 🟢 Mutation evidence: four TSPEC §6.6 mutants, incl. swap `unmeasurable`/`harvested` and swap BR-16's harvested test against BR-15's zero-denominator test | **Holds.** Both ratio mutants concern the *ordering* of the zero-denominator and harvested branches, not the out-of-catalogue scoping. Their killing fixtures (T-04's `LEARNINGS`-sibling collision) are unchanged. |

**Direction-of-change check.** The settlement only ever moves a directory from `measured` toward
`harvested` — it enlarges the harvested set by reclassifying out-of-catalogue basenames as absent. That
asymmetry is why no PLAN expectation can silently flip: AT-10's row already expects `harvested` (a
widened predicate cannot un-harvest it), and AT-09's directory is held `measured` by 58 grammatical
survivors that the erratum leaves untouched. The only leg whose value the delta *could* decide is
AT-17's fourth, and PLAN deliberately does not name it.

**No new task is required.** The clause REQ v1.7 adds — a feature whose only `CROSS-REVIEW-` basenames
are out-of-catalogue reports `harvested` — is precisely FSPEC AT-17's fourth leg, which T-04 already
claims. The companion clause, that such a basename "contributes no process bytes", is already pinned by
AT-15's neither-list (TSPEC: the file "reach[es] neither side"), which T-04 also already claims. Both
halves of the new sentence land on tasks that exist. No coverage gap opens.

## Dependencies

**Batch-DAG unchanged.** The erratum adds no task, removes none, and changes no task's inputs, so every
dependency edge and every `Batch` column keeps the value my v4 re-derived and accepted. T-04 stays at
batch 2 behind `T-01, T-02`; T-18 at batch 9 behind `T-17`; T-26 at batch 11 behind `T-18, T-19, T-21`.
No re-derivation is owed, because `batch == max(dep batch) + 1` is a function of edges the delta does
not reach.

**File-ownership guard unchanged.** The delta authors no test file and moves no assertion between
suites, so the same-batch same-new-file check is unaffected: `statsMetrics.test.js` stays solely T-04's,
`statsRealPaths.test.js` stays solely T-18's, and T-26 still declares that it authors no test file and
only *runs* those two suites.

**TSPEC did not move — correcting my own v4 pin.** My v4 stamped
`UPSTREAM-STATE: TSPEC sha256:f2261510…`, but the TSPEC I actually reviewed against at
`REVIEWED-COMMIT: 9c56d0c5` hashes `sha256:a06a6032…`, and it still hashes `a06a6032…` at HEAD. TSPEC
has not changed at all since my PLAN approval; the v4 pin was mis-stamped. I record this because the
pin *is* the oracle a cascade check reads to decide staleness, and a wrong one would send the next
confirmation chasing a TSPEC delta that never happened. Filed below as F-02 (Low, inherited, nonlocal).
Confirmed by `git diff --stat 9c56d0c..HEAD -- docs/pdlc-stats/`: among the six source documents, only
`REQ-pdlc-stats.md` appears.

## Verification

**How I confirmed rather than re-reviewed.** I read my v4 cross-review, took the erratum diff
(`git diff 1847dd9c0 HEAD -- docs/pdlc-stats/REQ-pdlc-stats.md` — 12 insertions, 3 deletions, one
clause), read REQ-STATS-06 whole at v1.7, then grepped PLAN for every surface that could lean on it
(`REQ-STATS-06`, `BR-16`, `harvested`, `survivor`, `AT-17`). I did not re-open settled rows.

**Falsification attempts that failed to find a defect** — each is a way this confirmation could have
gone the other way:

1. *Does PLAN quote the withdrawn "survivor" sentence anywhere?* No. `grep -n "survivor" PLAN` returns
   nothing; the string lives only in TSPEC §4.3/§8.3 and in the REQ line the erratum deleted.
2. *Does any PLAN expectation flip from `measured` to `harvested`?* No. The two real-path verdicts were
   re-measured on disk, not read from the document: advisory-wave-gate keeps 58 grammatical
   cross-reviews and 2 `CODE_REVIEW` files (measured); headless-engine has 0 `CODE_REVIEW` files
   (harvested via a disjunct the delta does not touch).
3. *Does the new "contributes no process bytes" clause contradict a pinned oracle?* No. AT-15's
   neither-list already pins that an out-of-catalogue basename reaches neither the spec nor the process
   side, and TSPEC's `crossReviews` filter (`parseReviewFilename(b).ok`, which rejects `bad_doc_type`)
   already excludes it from the numerator. The erratum makes REQ agree with behaviour that was already
   specified and already claimed by a task.
4. *Does the settlement open an uncovered acceptance test?* No. Its one observable consequence is
   AT-17's fourth leg, already inside T-04's claim list.
5. *Could a coverage floor or gate command shift?* No. The delta touches no module boundary; T-24's
   per-file `lib/stats.mjs` branches ≥ 85 obligation and its `c8.include` pair oracle are byte-unchanged
   and value-unchanged.

**One genuine consequence, and it is not PLAN's.** TSPEC §4.3's "What the shape itself yields is
contested upstream and is not decided here" paragraph and §8.3's second erratum entry are now **stale**:
both quote REQ v1.6's survivor clause in the present tense ("REQ-STATS-06 at **v1.6** now states…") and
describe a live disagreement that v1.7 has closed. TSPEC itself names the remedy — "exactly three things
here re-stamp: this paragraph, BR-16's version pin above, and AT-17's fourth-leg expectation" — and the
third of those already carries the winning value, so the re-stamp is documentation, not behaviour. This
routes to TSPEC's owning phase, does not gate PLAN, and costs the implementer nothing: building T-04 to
§4.3 as written yields the behaviour REQ v1.7 requires. Filed as F-01 (Low, inherited, nonlocal).

**Rigour bar.** No High finding is open, delta or inherited. The two findings below are Low and
non-gating; both are inherited and nonlocal, so neither is damage this round's edit caused.

## Delta-Confirmation Findings

## Verdict
