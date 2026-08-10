# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md`
**Date:** 2026-08-10
**Iteration:** 7
**Scope:** Local

## Method

Delta re-review. `git diff 6a5d6aa0..HEAD` over the PLAN returns v1.6 and exactly four
hunks: the version-header block, §2's new `Status`-column rule paragraph, and four task
rows — T03, T13, T17, T27. Of those, three are single-cell `Status` reverts
(`🔴 → ⬚`, `🔴 → ⬚`, `✅ → ⬚`) and one, T13, is a prose rewrite. No `Deps`, `Batch`,
`Task`, `Files` cell moved; no §5 manifest row moved; no §6 text moved.

Every claim the revision leans on was re-derived rather than read. Gate imported from
`pdlc/workflows/orchestrate-dev.js` at HEAD and run over the revised text:
`parsePlanTasks` → **34** tasks, `errors: []`; `parsePlanOwnership` → **34** ownership
rows; `validatePlanContract` → `{"ok":true}`; `computeTopologicalBatches` → **15**
ready-sets; `computeWaves` → **15** waves; `max(batch of Deps) + 1` re-derived and
compared to each declared `Batch` cell → **0** mismatches; same-batch same-file
collisions over the ownership manifest → **0**. Every number identical to v1.4's and
v1.5's, which is what a `Status`-only diff must return.

§2's grounding claims were checked at source, not accepted: `parsePlanTasks` is at
`orchestrate-dev.js:3761`; the "LOOSE … cosmetic" comment governing the description and
batch columns is at `:3764-3766`; `idIdx` / `depsIdx` resolve through
`PLAN_ID_HEADER_CELLS` / `PLAN_DEPS_HEADER_CELLS` at `:3797-3798`; `WAVE_STATE_PATH` is
at `:8860` and `parseWaveLedger` at `:8916`. I additionally falsified the stronger claim
("no parser, gate or dispatcher reads a `Status` cell at all") rather than trusting it:
the only two loose column predicates are `isDescCell` (`:3767`, matching
`desc|task|summary|name|title`) and `isBatchCell` (`:3773`, matching `batch|phase|wave`).
The literal `status` matches neither, so a `Status` column cannot even be mistaken for
the description or batch column. The claim holds as stated.

T13's two measurements were re-taken through `git show HEAD:` exactly as the row says
they were: `runtimeBundle.test.js:230` reads `"_envPresent", "_makeTempDir",` inside the
frozen `AT19_SEAM_NAMES` (`:219`), and `:1057` reads
`const AWAIT_SCAN_SOURCES = ["orchestrate-dev.js", "orchestrate-queue.js", "consolidate-learnings.js"];`.
Both halves are present, both are load-bearing (the `it.each(AWAIT_SCAN_SOURCES)` case at
`:1072` runs the scan over the third member), so the row's rewrite is accurate.

## Prior findings

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
