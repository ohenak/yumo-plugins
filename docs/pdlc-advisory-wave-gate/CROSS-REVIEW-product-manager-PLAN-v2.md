# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md` (v1.11, commit `b3d877a1`)
**Date:** 2026-08-20
**Iteration:** 2 (delta re-review over v1.10, commit `1972402c`)

## Overview

**Both of my v1 findings are resolved, and the delta is clean where it lands.** `A6-05`'s red step now
compares `ADVISORY_ROOT_CAUSES` by **ordered-sequence** equality against the literal
`["plan-ordering-defect", "wave-internal-defect", "environmental", "unclassified"]` — byte-for-byte
FSPEC `AT-02-1`'s transcription (`FSPEC` §6.2) — and the blanket "Set-equality throughout" caption is
split by surface, naming the three ordered constants and their governing rules (`BR-2`, `BR-15`,
`BR-5`). `A6-08`'s `parseA6RootCause` step now claims `E-08b`'s two-class arm in the terms FSPEC
states it (class 1 *and* class 2 → `plan-ordering-defect`, exactly one class, `E-6` not `E-5`), and
the `AT-02-1` traceability row names both halves and both owning steps. That closes v1 `F-01` (High)
and `F-02` (Medium).

**But the round re-grounded against a TSPEC it labels `v1.13`, and TSPEC at that pinned hash is
`v1.15`.** The lineage header pins `sha256:1f6ea486…`, which I re-computed at HEAD and which does
match the TSPEC file — but those bytes carry TSPEC `v1.14` and `v1.15`, both of which landed
(`6f00074c`…`ffbc2b18`) *before* this round's first PLAN edit (`e9a8943e`; verified by
`git merge-base --is-ancestor`). The plan absorbed v1.14's obligations (five halt fields set-equally,
spec-side predicates, both fixture homes) but not v1.15's, and v1.15 is where TSPEC names the three
*shipped* oracles that A6-18's own green step turns red. One of those sits in a file no task in this
plan owns.

That is `F-01` below, and it is High for a product reason, not a bookkeeping one:
`advisoryWaveGateMain.test.js` is the DC-07 **production-path** test for `AC-6.3` — the one place the
halt report's class and diagnosis are proven to come from the real seam rather than from a fixture.
A6-18 widens the production `fields` object to five keys; that file's shipped four-key `toEqual`
fails on the extra key exactly as on a missing one, and no task, no `Source File` cell and no
file-ownership manifest row names the file. Under this plan's own batch-safety rule the wave gate
sees a red suite with no owner authorised to fix it.

## Verification

Every claim below was re-derived at HEAD; a next round can re-run each command.

| Check | Method | Result |
|---|---|---|
| Upstream bytes = the header's pins | `shasum -a 256` on the four upstream documents | 4/4 match (`f97f4f66…`, `d602c440…`, `1f6ea486…`, `dc7a8d65…`) |
| REQ / FSPEC version labels | Changelog heads: REQ `v1.16` (line 20), FSPEC `v1.7` (line 14) | Correct |
| TSPEC version label | Changelog head of the pinned bytes: `**v1.15 (round 5 …)**` (TSPEC line 16); PLAN header says `v1.13` | **Mismatch — `F-04`** |
| v1.14/v1.15 landed before this round | `git merge-base --is-ancestor ffbc2b18 e9a8943e` | True — the round could see them |
| Delta bounded | `git diff --stat 1972402c..HEAD` on the PLAN | 29 insertions, 12 deletions, one file |
| v1 `F-01` closed | PLAN `A6-05` red step vs FSPEC `AT-02-1` (FSPEC §6.2) | Ordered-sequence equality, literal transcribed in FSPEC's order — resolved |
| v1 `F-02` closed | PLAN `A6-08` red step + `AT-02-1` row vs FSPEC `E-08b` (FSPEC line 281) | Two-class arm claimed, one class carried, `E-6` named — resolved |
| AT set-equality (48) | Extracted `AT-\d\d-\d+[a-z]?` from FSPEC and from the PLAN table, `sort -u`, `diff` | 48 = 48, **set-equal both directions**, `AT-06-4b` included |
| Manifest vs TSPEC §5.1 | `comm -23` of TSPEC §5.1's `edited`/`new` file list against the PLAN's file-ownership manifest | Exactly one missing: `pdlc/workflows/__tests__/advisoryWaveGateMain.test.js` — **`F-01`** |
| The unowned oracle is real and four-key | `pdlc/workflows/__tests__/advisoryWaveGateMain.test.js` lines 372–378: `expect(result.haltAdvisory).toEqual({rootCause, diagnosis, repairApplied, repairPaths})` | Confirmed shipped and green today |
| Escalation-log exact count | `pdlc/workflows/__tests__/advisoryEscalationLog.test.js:821` — `expect(failed.notices).toHaveLength(2)` | Shipped; PLAN never names it — **`F-02`** |
| Un-skip halt notice arm | `grep -c renderSnapshotOverwriteNotice` over the PLAN = 2 (changelog + A6-18's green step); no hit in `A6-21` | Un-skip push unclaimed — **`F-03`** |
| `A6-18` carries v1.14's content | Read `A6-18` red + green step in full | Five halt fields set-equally with `snapshotRef: null`, `AT-06-4b` on the E-34 fixture, co-location by spec-side literals — all present |
| `A6-10` ignored-path case | Read the row in full | Positive-presence conjunct (case 4), absent-untracked companion (case 3), ordering conjunct (case 5), `non-ignored` qualifier — all landed |
| Graph unchanged | Diffed task/batch/wave/dependency rows | No task, batch, wave or edge moved; 11 tasks / 7 waves claim unchanged |

## Findings

*(pending)*

## Questions

*(pending)*

## Positive Observations

*(pending)*

## Recommendation

*(pending)*
