# Cross-Review: product-manager — PLAN (upstream-cascade confirmation, round 11)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md` (unchanged bytes since round 10)
**Date:** 2026-08-19
**Iteration:** 11
**Scope:** Upstream-cascade confirmation only. PLAN's own bytes are unchanged since the round-10 approval at `b902f40b`. TSPEC moved `4a092e85` → `1531143c` via one erratum commit (`1f2a4fbf`, +18/−1). Question answered: does PLAN still hold as approved against TSPEC as it now stands?

## Overview

**What moved upstream.** Exactly one commit touched TSPEC after round 10's approval was recorded:
`1f2a4fbf` *"docs(tspec): size PROP-SWEEP-2(b) residue in §1.3 and route it to PLAN (Phase P
erratum)"*, +18/−1 across two hunks — a sentence appended to the §1 changelog's Phase-P erratum note,
and a new paragraph in §1.3 titled *"Sizing the hygiene residue, and where it is owned."* No other
TSPEC section changed; REQ, FSPEC and DECISIONS are byte-identical to the versions round 10 approved
against (their dispatch hashes match this file's `UPSTREAM-STATE` trailer from round 10).

**What the edit does.** It corrects an under-sizing in TSPEC's own prose. §1.3 previously named only
the 14 tracked `.pdlc-backups/*.bak` blobs as what `e3b9d5a3` left behind. It now states the measured
residual — **28 tracked paths in three classes at PLAN's dated 2026-08-19 measurement, of which
untracking the 14 `.bak` blobs closes 14** — and explicitly routes the partition, the owners, the
dispositions and the figures themselves to **PLAN's Overview HEAD-drift note and A6-00's Edit 1**,
stating that TSPEC "does not restate further and does not re-litigate" them.

**Why this direction of travel is benign for PLAN.** The edit moves ownership *toward* this document,
not away from it. PLAN was already the sole owner of these figures — round 9 consolidated them into
the Overview's HEAD-drift note precisely so one site carries them, and round 10 approved that. TSPEC
now names that site as the owner. Nothing PLAN cites upstream was withdrawn, narrowed or renumbered;
nothing PLAN must now say was added to its obligations.

**The one thing I checked hardest.** A routing edit that also *restates* the routed figures can drift
from the owner it routes to. I therefore re-read the new paragraph against PLAN's HEAD-drift note
clause by clause, and against the shipped oracle, rather than accepting that the numbers "look the
same". They agree on every figure and every class; they diverge on one subordinate clause about A-1's
glob list, recorded below as F-01 (Low, upstream's to fix, not PLAN's).

## Batches

PLAN's task table, batch composition and wave map are untouched by this cascade, and the upstream
edit imposes no change on them. Re-verified mechanically at HEAD rather than asserted:

| Check | Result at HEAD |
|---|---|
| `parsePlanTasks` over PLAN | **11 tasks** (`A6-00, A6-01, A6-04, A6-05, A6-06, A6-08, A6-10, A6-12, A6-14, A6-18, A6-21`) |
| `validatePlanContract` | `{"ok": true}` — 11 ownership rows, 0 unknown ids, 0 near-misses |
| `computeWaves` | **7 waves**, every boundary green |
| PLAN bytes vs. the round-10 approval commit `b902f40b` | identical |

**The one batch the erratum bears on is A6-00, and it holds unchanged.** TSPEC now names *"A6-00's
Edit 1"* as co-owner of the residue figures. A6-00's Edit 1 exists at HEAD, is spelled exactly that
way in the task row, and carries the same arithmetic TSPEC now points at: untrack the 14 tracked
`.claude/workflows/.pdlc-backups/*.bak` blobs (`git rm --cached`) **and** add the bare rule `.pdlc-backups/`
to `.gitignore` in the same step, which "closes **14 of `PROP-SWEEP-2(b)`'s 28 residual paths**; the
other 14 are not closable here". TSPEC's new sentence — "Untracking the `.bak` class closes **14 of
the 28**; the other 14 are not closable on this branch" — is the same claim in the same direction.
The pointer resolves; it does not dangle.

**No scope entered PLAN through this edit.** TSPEC added no requirement, no surface and no task: the
paragraph closes with "Sizing and routing only; the disposition is not re-litigated here and no
design claim moves", and the §1.3 end-state surface table below it is byte-unchanged (the eight
transcription surfaces, the `.enabled` occurrence count of three). So there is no new P0/P1 obligation
for PLAN's batch list to absorb, and no batch that should have gained a task and did not.

**No batch lost its basis, either.** The completeness direction matters as much as the scope-creep
direction: every A6 task still traces to a §1.3 surface or a §5.1 manifest row that survives at
`1531143c`. I re-read the surface table and the `.enabled` row at HEAD against A6-05's and A6-18's
task text; the transcription targets and the three-occurrence `.enabled` constraint are unchanged, so
the two tasks most tightly coupled to §1.3 are still faithful compressions of it.

## Dependencies

_(pending)_

## Verification

_(pending)_

## Findings

_(pending)_

## Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_

