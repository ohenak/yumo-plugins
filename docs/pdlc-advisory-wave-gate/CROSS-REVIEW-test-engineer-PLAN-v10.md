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
