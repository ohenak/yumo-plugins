# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md` (v1.1)
**Date:** 2026-08-19
**Iteration:** 2
**Scope:** Local (F-01, F-02, F-03)
**Prior review:** `CROSS-REVIEW-product-manager-PLAN-v1.md` (4 High, 1 Medium, 1 Low)
**Diff reviewed:** `git diff 46f59e0a..HEAD -- docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md`

## Disposition of v1 findings

| v1 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved (with residue — see F-01 below)** | `advisoryDisabled.test.js:622` folded into batch-1 `A6-03`, with the ownership manifest row extended and the batch-1 gate wording naming the new red. |
| F-02 | High | **Resolved (with residue — see F-01 below)** | `advisoryQueueSeams.test.js:627` likewise folded into `A6-03` and the manifest. |
| F-03 | High | **Resolved** | `A6-18` now states the tier gate is implemented by receiving the resolved `advisoryTierOn` (`orchestrate-dev.js:13678`) with no new `.enabled` read, preserving PROP-DIS-06's count of three. Verified today: `orchestrate-dev.js:3258`, `:13678`, `orchestrate-queue.js:1318`. |
| F-04 | High | **Resolved** | `A6-15` now allocates AC-1.5 as a disjunction: BL-03-absent alone, BL-04-absent alone, both-absent (one statement, never two). AT coverage row updated to match. |
| F-05 | High | **Resolved** | Arm (iv), the zero-count discriminator on a run where A6 *does* apply, is named in `A6-15`, in the AT coverage row and in the DoD checklist. |
| F-06 | Low | **Addressed, but the fix introduced F-02 below** | `A6-06` now writes the whole `advisory` section including `enabled` — good — and additionally directs a line into `pdlc/README.md`, which no task owns. |

Also confirmed resolved, though not mine to gate: the coverage claim is now correct as
written — `pdlc/workflows/package.json`'s `c8.include` is exactly
`orchestrate-dev.js`, `orchestrate-queue.js`, `build-runtime.mjs`, and stage 2 applies
`--per-file --branches 85` to all three, so "cannot fail" was rightly withdrawn.
