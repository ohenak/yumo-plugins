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

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **No task owns `pdlc/workflows/__tests__/advisoryWaveGateMain.test.js`, and A6-18's green step reddens it.** That file is the DC-07 production-path proof for `AC-6.3`: its `expect(result.haltAdvisory).toEqual({rootCause, diagnosis, repairApplied, repairPaths})` (lines 372–378) is a four-key equality over the *same* object A6-18's green step widens to five with `snapshotRef`. `toEqual` fails on an extra key exactly as on a missing one, so the shipped assertion goes red the moment A6-18 lands. TSPEC §5.1 at the pinned hash says so explicitly and assigns the widening to "the same task that widens the production `fields` object" (TE F-01, v1.15). The PLAN names the file **zero** times — not in a `Source File` cell, not in the file-ownership manifest, not in the AT table; a `comm` of TSPEC §5.1's edited-file list against the manifest returns exactly this one path. Consequence in the plan's own terms: batch 6's gate declares the whole suite green, and no task is authorised to touch the file that is red. Fix: add `pdlc/workflows/__tests__/advisoryWaveGateMain.test.js` to A6-18's `Source File` cell and to the file-ownership manifest, and name the widening (four-key → five-key, `snapshotRef: null` on the escalation path) in A6-18's red step alongside §4.5's halt fields. | `AC-6.3` (REQ-AWG-06, P0); FSPEC `AT-06-4` / `AT-06-4b`; DC-07 |
| F-02 | Medium | Local | **A6-18's file list owns `advisoryEscalationLog.test.js` but never names the exact-count site the notice push moves.** `advisoryEscalationLog.test.js:821` asserts `expect(failed.notices).toHaveLength(2)` on a real-temp-repo `runA6Escalation` run where the capture succeeds — so `snapshotRef` is non-`null`, the overwrite notice is due, and the count becomes three (TSPEC §5.1, TE F-02 v1.15). The plan's own convention is that unnamed count sites are the failure mode: A6-05 enumerates its "four bare row-count assertions" precisely because "any site left unnamed here reddens batch 2". Apply the same discipline here. Fix: name the `toHaveLength(2)` → `3` widening in A6-18's red step, with the reason (capture succeeded, so the third notice is the overwrite warning). | `AC-6.3`; FSPEC `AT-06-4` |
| F-03 | Medium | Local | **The un-skip halt arm of the overwrite warning is claimed by no task.** TSPEC §4.5 at the pinned hash gives its un-skip table an overwrite-notice row: that halt's `snapshotRef` is non-`null`, the seam has already returned, so one push is emitted at the un-skip halt site from the same helper through the same `advisoryNotice` sink; §5.6 records that `AT-06-4`'s predicates are that arm's oracle too and that PLAN covers it "under the same task". The PLAN mentions `renderSnapshotOverwriteNotice` twice — the v1.11 changelog and A6-18's green step — and the un-skip halt site is A6-21's territory (`waveExecution.test.js` + the `checkWaveUnskips` arm), so "the same task" is not stated anywhere. An operator halted by the un-skip guard on a wave A6 resolved is exactly the operator who re-runs and silently loses the capture, which is the harm `BR-14`/`AC-6.3` exists to prevent. Fix: state which task owns the un-skip-site push and its assertion (A6-18 or A6-21), in that task's row and in `AT-06-4`'s traceability cell. | `AC-6.3` (P0); FSPEC `BR-14`, `AT-06-4` |
| F-04 | Low | Process | **The lineage header's TSPEC version label contradicts the hash it pins.** The header reads "TSPEC v1.13 (`sha256:1f6ea486…`)", but those bytes are TSPEC **v1.15** — its changelog head is `**v1.15 (round 5 — the notice's counterparties named)**`. REQ `v1.16` and FSPEC `v1.7` labels are correct, so this is a single stale label, not a wrong pin. It matters because the pin is the round's evidence of DEC-ERR-03 re-grounding: a reader reconciling `F-01`–`F-03` against the header would conclude the v1.15 obligations were not yet upstream, when they landed two commits before this round began. Fix: correct the label to `v1.15` and record in the v1.11 changelog which v1.14/v1.15 items were absorbed and which were not. Process-scoped because the general lesson — *label and hash are two claims and both are checked* — recurs across every erratum round of this feature. | DEC-ERR-03; DEC-DOC-01 |

## Questions

*(pending)*

## Positive Observations

*(pending)*

## Recommendation

*(pending)*
