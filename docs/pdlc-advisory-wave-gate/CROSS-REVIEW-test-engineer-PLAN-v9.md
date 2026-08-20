# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md
**Date:** 2026-08-19
**Iteration:** 9 (delta re-review of PLAN v1.8 over v8)

## Overview

Six commits landed v1.8 over v1.7 (`0bb9d279..HEAD`). I diffed the PLAN across that
interval, re-ran every oracle the revision re-measures, re-derived the batch DAG from the
task table, and executed the plan parser against the document itself. Scope is this round's
changed bytes: did round-8's two blockers close, and did the fix break anything.

**All four round-8 findings are closed, and each closed with evidence I could reproduce.**

| v8 ID | Severity | Disposition | Evidence |
|---|---|---|---|
| F-01 | High | **Closed** | Class 2 is re-grounded as branch-introduced. Verified, and it survives a stricter check than the document ran: `git ls-tree 1efb9a3b` is empty for all four, and while `--diff-filter=A` shows the two `.bundle.js` artifacts were *first* added on main by `3991b4d5` (2026-07-27), they were deleted by `1fb6cbec` (2026-07-29) and **re-added on this branch by `e3b9d5a3`** — so "e3b9d5a3 is their adding commit" is right for the tree as of HEAD. The 14/14 split and the unreachability reason (every covering ignore rule writes an L-2 term into tracked `.gitignore`) both hold. |
| F-02 | High | **Closed** | The rule changed from the anchored spelling to bare `.pdlc-backups/`, and both stated constraints check out. (i) T21's first assertion is exactly the unscoped substring check the row quotes — `expect(gitignore).not.toEqual(expect.stringContaining(".claude/workflows/"))` at `documentOracles.test.js:357`, and T21 passes at HEAD. (ii) L-2's seven terms are pinned at `documentOracles.test.js:461-469`; `.pdlc-backups/` matches none. I also ran the rule in a scratch repo: `git check-ignore -v` names `.gitignore:1:.pdlc-backups/` for `.claude/workflows/.pdlc-backups/a.bak`, and `git status --porcelain` reports only `.gitignore`. |
| F-03 | Medium | **Closed** | The full-suite leg is now a set-equality on two failing test titles, and both are verbatim transcriptions of source, not paraphrases: `AT-22 [red-until-L-06]: coveredViolations(LIVE_ROOT) is empty post-landing` (`documentOracles.test.js:75`) and `PROP-SWEEP-2(b): the unfiltered sweep minus A-1's frozen glob list is empty — AC-1.2's required-empty gate` (`:572`). Running the suite gives exactly three failures — those two plus T15's `99`-vs-`100`, which A6-00's Edit 2 closes — so the enumerated set is right at DoD time. |
| F-04 | Low | **Closed** | The anchor is disambiguated by halt literal and "unconditional" is withdrawn. Confirmed: two `if (scriptGate) {` arms exist, at `orchestrate-dev.js:14364` (wave loop, `Error: Wave ${waveNum} test gate failed`) and `:14522` (V-wave, `Error: V-wave ${vWaveNum} PROPERTIES test gate failed`), and the throw at `:14368` sits under `if (!gate || gate.ok !== true)` at `:14366` — exactly the structure the new wording describes. |

**The revision's own headline claim is true, and it was a real latent blocker.** v1.8 says the
A6-00 row was rejoined into one physical line because the blank lines inside it terminated the
markdown table, leaving `parsePlanTasks` seeing one task. I ran it: `parsePlanTasks` now returns
**11 tasks**, `parsePlanOwnership` returns **11 manifest rows** with no near-misses,
`validatePlanContract` returns **`{"ok": true}`**, and `computeWaves` returns **7 waves**
matching the declared `Batch` column exactly. Under v1.7 that contract would have failed on
every task with "in PLAN task table but no file-ownership manifest row" — the dispatcher would
have refused the plan.

Two findings, both Medium and Low, both in newly-added DoD bytes, neither gating.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | The DoD's new residual check ends *"A residual containing a fifteenth class member is a regression even though the test was already red."* That sentence contradicts the growth rule the Overview establishes two sections earlier — class 3 grows by exactly one path per **committed** cross-review file, so the non-closable set moves 14 → 15 → 16 by design, and committing this very review makes it 15. Read literally, the DoD halts on the first legitimate cross-review file; read as "a member outside the enumerated classes", it is correct but the wording does not say that. This is a false-**red**, not a false-green — the set-equality enumeration immediately above it is pattern-shaped (`docs/pdlc-advisory-wave-gate/**` plus this feature's `CROSS-REVIEW-*`) and stays correct under growth — so nothing ships broken, but the gating item should not disagree with its own governing rule. Restate as "a residual member matching **none** of the enumerated class patterns is a regression", which is falsifiable and growth-stable. | DoD, `test:coverage` item, the `PROP-SWEEP-2(b)` positive-residual paragraph |
| F-02 | Low | Local | The DoD's inherited-residual item still carries the bare figures *"closes 14 of its 28 residual paths; the other 14"* with no date or growth caveat, while the Overview's class table now dates both counts and gives the growth rule. The 28 was exact when written and is exact today — I measured it at HEAD on a clean tree: 14 `.bak` blobs + 4 runtime artifacts + 10 documents (jest renders this as `+30` because its diff counts the two `Array [` / `]` bracket lines). But by the time an implementer reads the DoD, several more review rounds will have committed and the literal will read stale, which is the same trap the Overview was revised to avoid. Point the DoD figures at the Overview's dated measurement rather than restating them. | DoD, the `PROP-SWEEP-2(b)` inherited item |

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-01's restatement is the only change I would gate on if it were gating. Do you want the "outside the enumerated classes" reading written into the DoD directly, or would you rather drop the sentence entirely and let the set-equality enumeration carry the whole check? The enumeration alone is already falsifiable and growth-stable, so deleting the sentence is a legitimate fix, not a weakening. |

## Positive Observations

- **The A6-00 rejoin caught a defect no reviewer had named, including me.** Eight rounds of review — mine included — read that row as prose and never ran the parser over the document. The blank lines inside the table cell silently truncated the task table, and the failure mode was maximally quiet: `validatePlanContract` would have rejected all 11 tasks at dispatch, long after review signed off. Running the real parser against the real document is exactly the "trace it to the production path" standard this document keeps applying to its own tests, applied to itself.
- **The ignore-rule fix is picked against two measured constraints, not one guessed one.** v1.7 chose a spelling that read naturally; v1.8 chose one that satisfies a green oracle's actual assertion text *and* avoids minting a fresh residual at the site it closes. Both constraints are cited to pinned literals I could re-run, and the chosen rule's gitignore semantics ("trailing slash, no interior slash, matches at any depth") is a claim I verified empirically rather than accepting.
- **The DoD leg moved from an unfalsifiable shape to a falsifiable one.** "No red outside the named inherited set" could not fail; a set-equality on two verbatim test titles, checked both directions, can — and the document says so in those words, naming the T21 case its own Edit 1 must not break as the thing the leg now catches. That is the review finding landing as a mechanism, not as prose.
- **The counts are dated measurements with a stated growth rule, and the rule is correct.** The document predicted that a full PM+TE round adds two paths and told the reader to check class 3 first when the total disagrees. My independent measurement landed on 28 with the exact 14/4/10 partition claimed. Publishing the rule alongside the number is what makes the next reader's disagreement diagnostic instead of alarming.
- **The batch DAG survived the row rewrite.** Re-derived mechanically: every task's `Batch` equals `max(dep batch) + 1`, the graph is acyclic, ids are unique, every dependency resolves, and `computeWaves` independently returns the same 7 waves. No same-batch task pair shares a file — batch 1's four tasks own four disjoint sets. The five-task sub-batch cap the A6-05 row cites is real (`ready.slice(i, i + 5)`), and with batch 1 at four tasks its "a sixth task would shift every downstream Batch" claim is accurate.

## Recommendation

**Approved with minor changes**

Round 8's two blockers are closed, and closed on evidence rather than assertion: the ignore rule
is now picked against two measured constraints and verified to redden nothing, and class 2's
provenance is corrected to branch-introduced in a way that survives a stricter re-check than the
document itself ran. The two Medium/Low items I raise sit in the DoD's new bytes and neither
gates: F-01 is a sentence that disagrees with its own governing growth rule and produces a
spurious halt rather than a false green, and F-02 is a stale-literal risk of the same kind the
Overview was already revised to avoid. Fix both in the next touch of this document; neither needs
a review round of its own.

The batch DAG, the file-ownership manifest, the plan contract and the wave computation all now
validate mechanically against the shipped parser, which is the property this plan most needed and
did not have one round ago.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
