# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md
**Date:** 2026-08-19
**Iteration:** 7 (delta re-review of PLAN v1.5 + v1.6 against my v6)

## Overview

Two revisions landed since my v6: **v1.5** (full-interval re-grounding on TSPEC v1.7–v1.10, plus the
round-6 closures) and **v1.6** (the three-column size analysis relocated out of DECISIONS into
`docs/pdlc-advisory-wave-gate/SIZING-pdlc-advisory-wave-gate.md`, cited from the Overview). I diffed
`d912eea9..HEAD` on the PLAN, re-derived every batch and dependency edge, and re-measured every
load-bearing number against the branch as it actually runs.

Scope of this round, per the convergence instruction: did my own blocking finding land, and did the
revision break anything. v1.5 closed all five round-6 findings — the ownerless reds now carry named
owners, the four row-count pins are content-anchored, the clean-tree hazard is stated as a per-wave
precondition, and both stale pins are fixed. The batch column, the dependency graph and the
file-ownership manifest are byte-identical to the version I already re-derived, except for A6-00's
`Test File` cell gaining `documentOracles.test.js` — which is the fix, and which introduces no
same-batch file collision.

What does not hold is one of the two dispositions the fix introduces. `git rm --cached` on the 14
`.bak` blobs closes the sweep oracle it targets and simultaneously reddens `consumerCleanup.test.js`'s
AT-4.1 — the assertion this same revision promotes to a precondition on *every* wave boundary. That
is F-01, and it is new in this round's bytes, not inherited.

## Round-6 findings — disposition

| v6 ID | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| F-01 | High | **Closed** | The HEAD-drift note's third bullet is now scoped to *"the advisory suites, and it is not the whole tree"*, and the reds outside them are enumerated with an owner and a disposition each: T15's count literal and PROP-SWEEP-2(b) to A6-00, `AT-22 [red-until-L-06]` out of scope, AT-4.1 as a clean-tree precondition. The DoD checklist carries the same four. The mechanism claims check out — see Verification 2–3. |
| F-02 | Medium | **Closed** | No `file:line` pin survives in the document (grep for `:622`, `:627`, `:571`, `:726`, `:271` → no hits). All four row-count sites are now named by block title and assertion text — `T-10-5 / PROP-DIS-05 enabled-but-quiet reports five zero rows (S-1)`, `ADVISORY_SEAMS drives the row list (S-1)`, and the two `advisoryHarvest.test.js` blocks `T-08-6` / `T-08-8` — exactly the re-anchoring TSPEC v1.10 performed. |
| F-03 | Medium | **Closed** | Batch 1's gate wording gains a **Clean-tree precondition** paragraph naming `.claude/workflows/.pdlc-drift-state.json`, the `SessionStart` hook that rewrites it, and the rule that a red AT-4.1 whose `Received` names only that path is not drift to escalate. It correctly generalises the hazard to every wave boundary, not just wave 1's. |
| F-04 | Low | **Closed** | A6-01's row now reads *"the `SEAMS` retarget already landed in `e3b9d5a3` and is green at HEAD … the literal reads `["A1" … "A6"]` (verified)"*, content-anchored. Confirmed: `helpers/advisoryDoubles.js` holds the six-member literal. |
| F-05 | Low | **Closed** | A6-00's row now says **"A6-05 exports only `computeWaves` directly"** and records that earlier drafts said otherwise. That is verbatim the landed file's header comment (*"Its behaviour is proved transitively through A6-07's `ownedSetCovers` trailing-slash cases; A6-05 exports only `computeWaves` directly."*). Row and file agree, so the comparison the row instructs is no longer a trap. |

v1.6's relocation is inert with respect to this review: no task row, batch, dependency edge or
ownership cell moved, and the citation resolves — `SIZING-pdlc-advisory-wave-gate.md` exists (280
lines) and its column (3) heading reads *"ungated hand-copy surfaces: **twenty-five**"*, the number
the Overview cites.

## Verification

Everything below was run on this branch at HEAD.

**1. Batch column re-derived; unchanged and still correct.** Extracting the `Batch`/`Deps` cells from
both `d912eea9` and HEAD gives an identical table: A6-00/A6-01/A6-04/A6-05 at batch 1 with no deps;
A6-06←A6-04 and A6-08←{A6-00, A6-05} at 2; A6-10←A6-08 at 3; A6-12←A6-10 at 4; A6-14←A6-12 at 5;
A6-18←A6-14 at 6; A6-21←A6-18 at 7. `batch == max(dep batch) + 1` holds for every row, ids are
unique, the graph is acyclic, every dependency resolves, and batch 1 is four tasks — under
`computeTopologicalBatches`' five-task cap the document itself cites. No re-derivation needed.

**2. Same-batch same-file check after A6-00's widening.** A6-00 now also edits
`pdlc/workflows/__tests__/documentOracles.test.js`. No other batch-1 task names that file: A6-01 owns
`helpers/advisoryDoubles.js`, A6-04 owns `pdlc/engine/__tests__/advisory-config-example.test.js`,
A6-05 owns the eight advisory suites plus `orchestrate-dev.js`. The manifest agrees. No collision,
and the file is pre-existing rather than new, so the same-new-file rule is not even in play.

**3. The two A6-00 dispositions, tested against the real oracles.**
- *PROP-SWEEP-2(b) closes as claimed.* `unfilteredSweep()` builds its candidate set from
  `gitTrackedFiles(LIVE_ROOT)` (`documentOracles.test.js`, the `unfilteredSweep` helper), so
  untracking is sufficient — the residual set is computed over the index, not the working tree. The
  disposition is mechanically right for the oracle it names. Confirmed 14 tracked
  `.claude/workflows/.pdlc-backups/*.bak` blobs at HEAD.
- *But AT-4.1 does not survive it.* `consumerCleanup.test.js`'s AT-4.1 runs
  `git status --porcelain` with `cwd` resolved to the repo root and asserts the output is exactly
  `""`. `git status --porcelain` prints `??` lines for untracked files. `git check-ignore -v
  .claude/workflows/.pdlc-backups/` returns nothing — the path is **not** ignored — and the 14 files
  remain on disk after `git rm --cached`. So the step that greens PROP-SWEEP-2(b) reds AT-4.1, from
  batch 1's boundary onward. F-01.

**4. Whole-suite measurement at HEAD, on a clean tree.** `cd pdlc/workflows && npm test` reports
**8 suites failed, 27 tests failed, 70 skipped, 3847 passed, 3944 total** — not the 9/28/3846 the
document pins. The difference is exactly AT-4.1: my tree was dirty when I measured for v6 and is
clean now. The failing suites are the seven advisory ones plus `documentOracles.test.js`; the
advisory subtotal is 27 − 3 = **24**, matching the document exactly, and `documentOracles`'
three failures are precisely T15's count literal, PROP-SWEEP-2(b), and `AT-22 [red-until-L-06]` — the
three the document names. The enumeration is right; the headline triple is the one measured in a
dirty session and is not reproducible under the document's own precondition. F-02.

**5. T15's literal and its authority.** The file count is **100** at HEAD (`ls
pdlc/workflows/__tests__/*.test.js | wc -l`), so the bump direction is right. But the test's own title
is *"post-sweep pdlc/workflows/__tests__/*.test.js count equals TSPEC §4.4's corrected literal of 99"*
and the comment above the block reads *"the post-sweep *.test.js literal only holds once L-6 (T15's
deletions: 19 M-8 modules plus runtimeProvenanceWiring.test.js) lands"*. A6-00's step bumps the
assertion and records a reason comment, but says nothing about the title or the pre-existing comment.
F-03.

**6. `.pdlc-backups/` is a live write target, not a one-off spill.** The directory is written by the
workflow-distribution sync path (`pdlc/hooks/scripts/cleanup-consumer-workflows.sh` lists
`.pdlc-backups`; `docs/completed/pdlc-workflow-distribution/FSPEC` §AC-3.4 specifies
`.claude/workflows/.pdlc-backups/{id}.{stamp}-{NN}.bak`). Untracking without ignoring therefore
leaves not only 14 untracked files today but a directory that re-dirties the tree on any future sync
— which matters because the document has made tree-cleanliness a per-wave gate precondition.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | A6-00's new disposition — `git rm --cached` the 14 `.claude/workflows/.pdlc-backups/*.bak` blobs — closes `PROP-SWEEP-2(b)` (verified: `unfilteredSweep()` reads `gitTrackedFiles`, so untracking is enough) but reds `consumerCleanup.test.js`'s AT-4.1, which asserts `git status --porcelain` at the repo root equals `""`. The path is not gitignored (`git check-ignore` returns nothing) and the files stay on disk, so they become 14 `??` lines. This is the same AT-4.1 that this revision promotes, correctly, to a **clean-tree precondition on every wave boundary** — so the fix for one inherited red permanently violates a precondition the document itself imposes from batch 1 onward, and A6-00's own row already states the mechanism (*"reddens on any untracked file in the tree"*) without connecting it to AT-4.1. The directory is also a live write target of the workflow sync path, so new `.bak` files will re-dirty the tree at later wave boundaries regardless. The step needs a durable disposition — add `.claude/workflows/.pdlc-backups/` to `.gitignore` in the same A6-00 step, or delete the blobs from disk rather than only from the index — and if `.gitignore` is edited, A6-00's `Source File` cell and the file-ownership manifest must name it, since no other task owns that path. | A6-00 row ("Also in this task — the two unowned reds"); Overview HEAD-drift note, PROP-SWEEP-2(b) bullet; batch-1 gate wording, Clean-tree precondition; DoD checklist |
| F-02 | Medium | Local | The pinned whole-suite triple — *"9 suites failed, 28 tests failed, 3846 passed (re-measured this round)"* — is not reproducible under the document's own clean-tree precondition. Measured at HEAD on a clean tree: **8 suites failed, 27 tests failed, 3847 passed**, because AT-4.1 is exactly the conditional red. The enumeration behind the number is correct (24 advisory + 3 in `documentOracles`), only the total is state-dependent. Since batch 1's wording instructs the implementer to *"confirm the failing set is exactly the listed one"* and to escalate anything outside it, the pinned number should be the one an implementer who has satisfied the precondition will actually see: state 27/8/3847 as the clean-tree expectation and 28/9 as the dirty-tree variant whose only extra member is AT-4.1. | Overview HEAD-drift note, *"The scope of that claim…"*; batch-1 gate wording, inherited-red paragraph |
| F-03 | Medium | Local | A6-00's 99 → 100 bump edits the assertion literal but leaves the test's own title — *"post-sweep pdlc/workflows/__tests__/*.test.js count equals TSPEC §4.4's corrected literal of 99"* — and the block comment above it (*"the post-sweep *.test.js literal only holds once L-6 … lands"*) unchanged. That ships a test whose name asserts 99 while its code asserts 100: precisely the stale-test-name trap this same PLAN identifies and instructs A6-05 to fix in the advisory suites (*"a red test name that contradicts its assertion is the next reader's trap"*), applied inconsistently to A6-00's own edit. The cited authority is also another feature's TSPEC §4.4, which still says 99. Extend the step to rename the title and restate the comment (the literal is now a *pre*-sweep count of 100 that the coupled sweep must re-derive when its deletions land), so the coupling is legible to whoever lands L-6. | A6-00 row, T15 bump step; DoD checklist |
| F-04 | Low | Local | A6-00's row is framed as *"discharged by verification: re-run it, confirm green, and confirm the export list still matches this row"*, but the row now also carries two authored, committing edits (the untrack and the T15 bump) whose results the pre-flight suite cannot observe. The "discharged by verification" framing reads as "nothing to write here" and risks the two edits being skipped by an implementer who sees the gate green. Split the row's step list into a *verify* half and an *edit* half, or drop the phrase in favour of "gate is already green; two edits remain". | A6-00 row |

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-01: is ignoring `.claude/workflows/.pdlc-backups/` acceptable to the workflow-distribution feature that writes it, or does some oracle there require the backups to be tracked? I found no test asserting tracked-ness (`consumerCleanup.test.js` only creates and removes the directory in temp fixtures), but the owning feature should confirm before A6-00 adds the ignore line. |
| Q-02 | F-01: `AT-22 [red-until-L-06]` is dispositioned out of scope because `coveredViolations` walks the whole tree and reddens on any untracked file. If the `.bak` blobs stay on disk untracked, they become a *permanent* contributor to that red rather than an incidental one. Does deleting them from disk (rather than ignoring them) close both AT-4.1 and one cause of AT-22, and is anything lost by deleting them? |

## Positive Observations

- The round-6 High landed properly and in the right place. Rather than restating the third bullet
  more carefully, v1.5 named an owner and a disposition for each of the four reds and pushed both
  actionable ones into A6-00's zero-dependency slot, so no later wave's `test:coverage` leg or PR job
  inherits them. That is the strongest available fix, and the reasoning against leaving T15's literal
  to the coupled sweep (*"two documents each assuming the other bumps it is exactly how the red
  survives to Phase PUB"*) answers my Q-01 with a decision rather than a deferral.
- The clean-tree precondition is generalised correctly. I raised AT-4.1 as a wave-1 observation; the
  revision recognised it as a per-wave-boundary property, named the `SessionStart` hook and the
  tracked file it rewrites, and gave the implementer a discriminating rule — a red AT-4.1 naming only
  that path is not drift, one naming a path this feature owns is. That rule is falsifiable from the
  test's own `Received` output.
- Re-anchoring is thorough, not spot-fixed. Not one `file:line` pin survives anywhere in the
  document, including in historical changelog rows, and each is replaced by a block title or a quoted
  assertion. The v1.5 changelog even records the grep used to verify the sweep, which is the right
  standard of evidence for a DEC-DOC-01 claim.
- Both "already landed" rows (A6-00, A6-01) now quote the landed artifact rather than paraphrasing
  it, so the comparison each row instructs can actually succeed. I verified both against the files.
- The batch column survived two more revisions of prose churn without drifting from the DAG. That is
  not automatic at this document's size.

## Recommendation

**Needs revision**

The revision closes every round-6 finding and breaks nothing in the batch structure, the dependency
graph, the ownership manifest or the AT map. The single blocker is new and narrow: A6-00's
`git rm --cached` disposition greens `PROP-SWEEP-2(b)` and reds `consumerCleanup.test.js`'s AT-4.1,
the assertion this same revision makes a precondition on every wave boundary. Give the untracking a
durable form — ignore the path or delete the blobs — and give `.gitignore` an owner in the manifest
if it is edited (F-01). Then pin the clean-tree triple the implementer will actually measure
(F-02), extend the T15 step to rename the title and comment that still say 99 (F-03), and F-04 is a
one-line reframing. With F-01 addressed, the batch-1 inherited-red gate becomes checkable end to end
and I expect to approve.


## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 1}
