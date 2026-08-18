# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-plugin-retirement/PLAN-pdlc-plugin-retirement.md (v0.1)
**Date:** 2026-08-18
**Iteration:** 1

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | §4 Kind 4 ("multi-writer serialisation") states "Six physical files are written by more than one task" and §6 Rule 2 repeats "Six files have multiple writers; all six are enumerated in §4 kind 4 with their batch numbers." Mechanically re-deriving the writer set from §3's `Files` cells against the `Batch` column (PLAN-pdlc-plugin-retirement.md:330, :461) turns up at least two additional multi-writer files omitted from the Kind-4 catalogue — `pdlc/workflows/orchestrate-queue.js` (written by T08 at batch 7 and T20 at batch 16) and `pdlc/engine/__tests__/preflight-baseline.test.js` (written by T01 at batch 1 and T13 at batch 12) — plus one Kind-4 entry that is incomplete: `pdlc/workflows/__tests__/consolidationPreflight.test.js` is credited with only two writers, T19 and T25, but T26's Files cell (batch 22, class 10) also names it, making three. In every one of these cases the writers land in different batches, so Rule 2's actual safety property (no two writers of a file share a batch) still holds — I re-checked batch numbers for every multi-writer file in §3 and found zero collisions. The defect is the document's own completeness claim, not the schedule: §6 exists specifically so "a reviewer can check rather than take on trust," and the count/enumeration a reviewer would use to check is itself wrong, so a future round that *does* introduce a same-batch collision on one of the missed files has no catalogue entry to catch it against. | §4 Kind 4 (`:330`), §6 Rule 2 (`:461`) |

## Positive Observations

- Batch derivation (`max(dep batches) + 1`) is correct for all 33 rows without exception — I re-derived every row's batch from its `Deps` cell independently (including the four two-row forks at batches 6/14/15/16 and the three-row batch 27) and it matches the `Batch` column exactly, including the batch-census arithmetic `(4 × 2) + 3 + (22 × 1) = 33`.
- Rule 2 (one writer per physical file per batch) holds in fact for every multi-writer file I found by re-deriving from §3, including the two omitted from §4 Kind 4 (see F-01) — there is no actual scheduling collision anywhere in the plan.
- AT set-equality against FSPEC §6 holds exactly: FSPEC names 26 acceptance tests (AT-1.1…AT-5.3) and §2.1's traceability table carries the same 26, once each, with no invented or dropped IDs.
- Red/green discipline is sound and traceable: every `[green]` row in §2 names its `[red]` predecessor via `Deps` (§4 Kind 1's 13 pairs all check out), the erratum-6 gate (T13, DEC-07) and the class-7/class-11 same-commit edge (T19/T20 sharing batch 16, DEC-10/TSPEC T-5) are both correctly modeled and match the upstream DECISIONS document, and REQ C-8's "deleted, never skipped" rule is honoured — the plan's one documented use of `.skip` is explicitly scoped to the T0x→T30 skip-join mechanism, not to production coverage.
- Grounding against the current tree checks out on every claim I spot-checked: `pdlc/workflows/__tests__/*.test.js` currently numbers 119 (matches the pre-sweep literal); `consumerCleanup.test.js` does not yet exist (correctly treated as new); `hookCompatibility.test.js` currently carries `PROP-COMPAT-04/05/06` and the `C7` block exactly where T16 says they are; `pdlc/hooks/hooks.json` currently registers exactly 5 entries with 2 `SessionStart` hooks (matches L-4's pre-sweep table); `pdlc/hooks/scripts/lib/pdlc-drift.sh` is mode `100644` (sourced, not invoked — consistent with T-11/T12's "no lib/ carve-out" framing rather than being miscounted among the executable scripts); the `pdlc-consolidation-rehost` row exists in QUEUE.md at Order 24.
- File-ownership manifest is a clean bijection with §2 (33 tasks, 33 rows, same IDs, same order), and no same-batch/same-new-file collision exists in any of the four two-row batches or the three-row batch 27.

## Recommendation

**Approved with minor changes**

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 0}

APPROVAL-HASH: sha256:266eb457bbc2895b0b05122d7bab9564648d0258fb0f452332f958f14987a983
APPROVAL-HASH-NORMALIZED: sha256:c606814b9c041e1fe5bb4f1d203d33d7aa715fe1badbbbd0aeefdd6c5dbc1329
REVIEWED-COMMIT: f1b0dfe96089507a62d45c1a36b1ff3ff74aa550
UPSTREAM-STATE: REQ sha256:94daa2de05511e08c305a4fb73a046965dd3b31c37e2be42a466dda357f6f38c
UPSTREAM-STATE: FSPEC sha256:5cd899dac04a05b6d7b002a0f0056d7fd5508525cb1399d1dc1f069347e1de23
UPSTREAM-STATE: TSPEC sha256:1554c7d0349ef5d4337c4e5e705bc0c4b867bd3cb46b5191f315d560b87c23b8
UPSTREAM-STATE: DECISIONS sha256:579292fe88bbb0b3860ab609b228a9d5d3e7db20b8158b158e0b5de48a4a35bd
