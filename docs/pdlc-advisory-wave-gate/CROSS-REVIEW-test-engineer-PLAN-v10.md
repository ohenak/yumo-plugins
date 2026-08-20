# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md
**Date:** 2026-08-19
**Iteration:** 10 (delta re-review of PLAN v1.9 over v1.8)

## Overview

Three commits landed v1.9 over v1.8 (`52885fb1..HEAD`): `0a89d61b` (split the DoD
residual check, de-duplicate the figures), `9b4c6ad3` (name `ls-tree`-at-merge-base as
the deciding provenance leg), `b902f40b` (v1.9 changelog row). The diff is 28 insertions
/ 10 deletions, confined to the Overview's HEAD-drift note, the DoD's two
`PROP-SWEEP-2(b)` bullets, and the changelog. The row's own claim — *"No task row,
batch, wave, dependency edge or file-ownership cell changed"* — is true of the diff.

Scope of this round: did round-9's two findings close, and did the fix break anything.
Both closed; nothing broke. Every load-bearing claim in the changed bytes was re-measured
against the repository at HEAD rather than read.

| v9 ID | Severity | Disposition | Evidence |
|---|---|---|---|
| F-01 | Medium | **Closed** | The self-contradicting *"a fifteenth class member is a regression"* sentence is deleted and replaced by a two-shape check, one shape per class, exactly matching the governing growth rule. Re-measured: class 2 is a closed enumeration of precisely four paths, class 3 is open and grew by two since the v1.7 measurement — the split is the only shape that survives both. |
| F-02 | Low | **Closed** | The DoD's inherited-residual bullet no longer restates `28`/`14`; it names the Overview's HEAD-drift note as the single owner of those figures and tells the reader to read them there. Single-owner discipline now holds — `grep -n "28"` shows no bare count left in the DoD. |

## Verification performed

Re-ran L-3's sweep programmatically, assembling the same seven L-2 terms
`documentOracles.test.js:462-471` uses over `git ls-files`, minus A-1's fifteen frozen
globs (`documentOracles.test.js:487-503`), from the repo root:

- residual = **30 paths**, partitioned **14 / 4 / 12**, with an empty "other" bucket.
- **Class 2 set-equality holds exactly as the DoD now states it:** the four paths are
  `.claude/workflows/.pdlc-drift-state.json`, `orchestrate-dev.bundle.js`,
  `orchestrate-queue.bundle.js`, `pdlc-cli.mjs` — no more, no fewer. Notably
  `.claude/workflows/.pdlc-sync-manifest.json` is tracked at HEAD and lives in the same
  directory but carries no L-2 term, so it is *not* a residual path and correctly does
  not appear in the enumeration. A fifth member would have falsified the new bullet on
  the day it was written; it does not.
- **Class 3 membership holds:** all 12 remaining paths match
  `docs/pdlc-advisory-wave-gate/**`, and the class has grown from 10 to 12 since the
  v1.7 measurement — by exactly the two cross-review files committed since (PM v9, TE
  v9). This is the growth the deleted sentence would have mis-fired on, at the ship
  boundary, for a legitimate cause. The split fix is load-bearing, not cosmetic.
- **No `.pdlc-backups/*.bak` blob is in either shape's expected set**, and all 14 are in
  the residual today — so A6-00's untrack step still has 14 paths to close, and the
  DoD's third conjunct is falsifiable in the direction it needs to be.

Provenance claims in the new class-2 note, all re-run:

- `git ls-tree 1efb9a3b` returns **empty for the whole of `.claude/workflows/`** — the
  deciding leg is stated correctly and its result is reproducible.
- `git log --diff-filter=A -- '.claude/workflows/*.bundle.js'` does print **two** adding
  commits, `e3b9d5a3` (2026-08-19) and `3991b4d5` (2026-07-27), and
  `git merge-base --is-ancestor 3991b4d5 1efb9a3b` **succeeds** — the older add really is
  an ancestor of the merge-base, exactly as the caveat says. The deletion is at
  `1fb6cbec`, dated 2026-07-29, as written. The "reader would wrongly conclude
  pre-existing" trap is real and the document now disarms it.

Parser re-run against the document at HEAD, since the DoD edits touch the same file the
dispatcher parses: `parsePlanTasks` returns **11 tasks**, `parsePlanOwnership` returns
**11 manifest rows**, `validatePlanContract` returns **`{"ok": true}`**, and
`computeWaves` returns **7 waves** (`A6-00,A6-01,A6-04,A6-05 | A6-06,A6-08 | A6-10 |
A6-12 | A6-14 | A6-18 | A6-21`), unchanged from round 9. The v1.8 table rejoin survived
this round's prose edits.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| — | — | — | No findings this round. Both round-9 items closed on reproducible evidence; the changed bytes introduced no defect and contradict nothing in the repository at HEAD. One non-gating observation is recorded as a DEFERRED line below. | — |

DEFERRED: the Overview's HEAD-drift note — now the sole owner of the residual figures — still prints `28` total / `10` class-3 documents "measured 2026-08-19", while the same-day re-measure gives `30` / `12`; the note's own "+1 per committed cross-review file" rule reconciles the gap, but a reader who trusts the date over the rule will still be surprised, so on the next touch of this document consider stating the class-3 count as `10 + one per cross-review file committed since` rather than as a dated integer.

## Questions

| ID | Question |
|----|---------|
| Q-01 | None. Nothing in the delta needs an author decision to be reviewable. |

## Positive Observations

- **The residual check now fails for the right reasons and passes for the right reasons.**
  Round 9's shape could only be satisfied by freezing a set the pipeline is designed to
  grow; the fix distinguishes the closed class from the open one and applies the strongest
  oracle each can carry — set-equality where the enumeration is final, membership where it
  is not. I confirmed both directions empirically rather than reading them: class 2 is
  exactly four today, and class 3 already moved by two, so the round-9 shape would have
  halted the ship boundary on this very branch within one round of being written.
- **The class-2 enumeration survived a check the document did not claim.** I looked for a
  fifth `.claude/workflows/` residual and found `.pdlc-sync-manifest.json` tracked in the
  same directory — but it carries no L-2 term, so it correctly falls outside. The
  enumeration is right for a reason narrower than "everything in that directory", and it
  happens to be the right reason.
- **The provenance note now names which measurement decides, not just which measurements
  agree.** The v1.8 text stated two legs as if they concurred; they do not fully — one of
  them prints a superseded add whose last line reads "pre-existing". Naming
  `ls-tree`-at-merge-base as deciding and demoting the log to corroborating-with-a-caveat
  is the difference between a claim a reader can re-derive and one they can re-derive
  *wrongly*. Both legs reproduce exactly as documented, including the ancestor relation.
- **De-duplicating the figures removed a stale-literal site rather than refreshing it.**
  The DoD could have been updated to `30`; instead it stopped carrying a number at all and
  points at the owner. That is the fix that stays correct next round — and this round
  already proves the point, since `28` would have been wrong again by the time the DoD was
  read.
- **The frozen surface stayed frozen, and I checked mechanically rather than trusting the
  changelog.** No task row, batch column, dependency edge or ownership cell moved, and the
  shipped parser still yields 11 tasks, 11 manifest rows, a passing contract and the same
  7 waves over the edited document.

## Recommendation

**Approved**

Round 9's Medium and Low both closed, and closed in the stronger of the two available
ways: the residual check was re-shaped to match its governing rule rather than patched,
and the duplicated figures were removed rather than refreshed. Every factual claim in the
changed bytes reproduces against HEAD — the four-member class-2 enumeration, the
merge-base `ls-tree` result, the two-adding-commits caveat and its ancestor relation, and
the untouched task table's parse. Nothing in the delta is a defect, and nothing in the
document contradicts the repository. The one residual imprecision is a dated integer in
inherited bytes that the document's own growth rule already reconciles; it is recorded as
DEFERRED and does not gate.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
