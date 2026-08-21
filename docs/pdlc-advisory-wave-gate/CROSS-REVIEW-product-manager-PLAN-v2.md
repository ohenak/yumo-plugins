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

*(pending)*

## Findings

*(pending)*

## Questions

*(pending)*

## Positive Observations

*(pending)*

## Recommendation

*(pending)*
