# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md`
**Date:** 2026-08-10
**Iteration:** 6
**Scope:** Local

## Method

Delta re-review. `git diff 6d350ba7..HEAD` over the PLAN is v1.5: a version-header block recording
three corrections, the `Twelve further test files` rewrite plus its new set-equality paragraph in §5,
the T33 `fourth row` / `fifth tracked file` rewrite in §4.2, the rejected-ordering paragraph appended
to §6.1's `T07 → T12, T08 → T07` row, a re-run gate sentence in §6.1, and two `Status` cells
(T17 `⬚ → 🔴`, T27 `⬚ → ✅`). No `Deps`, `Batch`, `Task`, `Files` or `Batch` manifest cell moved.

Every numeric claim the revision makes was re-derived rather than read. Gate functions imported from
`pdlc/workflows/orchestrate-dev.js` at HEAD and applied to the revised text: `parsePlanTasks` → **34**
tasks, `errors: []`; `parsePlanOwnership` → **34** ownership rows; `validatePlanContract` →
`{"ok":true}`; `computeTopologicalBatches` → **15** ready-sets; `computeWaves` → **15** waves;
`max(batch of Deps) + 1` re-derived against every declared `Batch` cell → **0** mismatches;
same-batch same-file collisions over the §5 manifest → **0**; multi-writer files derived by grouping
the manifest by path and keeping paths with more than one owning task → **16**. Identical to v1.4,
which is what a prose-only diff should return and is worth returning rather than assuming.

Repository state was read from the **committed** tree, not the working tree, because the working tree
is mid-Phase-I and carries uncommitted build output (`git status`: modified `consolidate-learnings.js`,
`build-runtime.mjs`, `dist/distribution-manifest.json`, plus an untracked
`dist/consolidate-learnings.bundle.js`). Reading the working copy would have made T33's HEAD
measurement look wrong when it is right.

## Disposition of v5 findings

v5 carried no High. Two of its three findings and its one question are closed by measurement; one is
open and has grown.

| v5 ID | Disposition |
|---|---|
| F-01 (Medium, Process) — `Status` column half-reconciled | **Open, worse.** Re-filed below as F-01. v5 measured one filled cell against six siblings in an advanced state; HEAD now carries a landed `feat(pdlc-consolidation-agent): T{nn}` commit for **31 of 34** tasks (all but T05, T31, T32, T33) while exactly **three** rows carry a non-`⬚` cell. The version header does not record a disposition for this finding or for Q-01. |
| F-02 (Medium, Local) — §5's writer census was containment over 11 of 12 | **Closed, verified.** §5:370 now reads "**Twelve** further test files" and names `consolidationLifecycle` (T23 → T31) at `:372`. Counted: the enumeration lists exactly twelve (`HookParity`, `Pass`, `Credential`, `Lifecycle`, `Report`, `Rung`, `Predicate`, `Identity`, `Parse`, `Effectiveness`, `Advisory`, `Properties`); the cluster table at `:365-368` lists four (`consolidate-learnings.js`, `consolidationBuild`, `consolidationRoute`, `runtimeBundle`); the union is **16** with no member appearing twice, and 16 is exactly what grouping §5's own manifest rows by path returns. Set-equal in both directions, which is what the new `:379` paragraph now demands of the reader. |
| F-03 (Low, Local) — T33 said the manifest "gains its fifth artifact" | **Closed, verified.** `:289` now reads "gains its **fourth row** … `dist/`'s **fifth tracked file**" and states why the two differ. Measured at the reviewed commit: `git ls-files pdlc/workflows/dist/` → four paths; `git show HEAD:pdlc/workflows/dist/distribution-manifest.json` → three rows, ids exactly `orchestrate-dev`, `orchestrate-queue`, `pdlc-cli`. The `TSPEC:2450` citation the row now leans on was re-read and says what the row says it says — the enumeration is compared to `rows[]` **minus the manifest itself**, asserted **set-equal**. |
| Q-01 — is `Status` a live ledger now that `WAVE_STATE_PATH` exists? | **Unanswered.** The revision moved two more cells without recording the decision. Carried into F-01 and Q-01 below. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Process | **The `Status` column is now reconciled for 3 rows out of 31 that have landed — v5's finding, measurably wider.** Measured, not inferred: `git log` on this branch carries one `feat(pdlc-consolidation-agent): T{nn}` commit for **31 of the 34** tasks (every id except T05, T31, T32, T33), while the `#`-table's last column reads `⬚ Not Started` for all but three rows (T03 `🔴`, T17 `🔴`, T27 `✅`). Twenty-eight rows assert "Not Started" about work that is committed on the branch they sit on. Still **Medium, not High**, and for the same reason as v5: no runtime reads this column. `parsePlanTasks` (`orchestrate-dev.js:3761`) resolves its columns through `PLAN_ID_HEADER_CELLS` (`:3845`) and `PLAN_DEPS_HEADER_CELLS` (`:3846`) plus the batch cell — there is no status header set at all — and Phase I resume runs off the wave ledger (`WAVE_STATE_PATH`), so no wave can be misrouted by a stale cell. The cost is paid entirely by a human reader, and it is now the *opposite* of the cost v5 named: a column that is 90% `⬚` while 91% of the work is committed does not read as "no ledger kept", it reads as "almost nothing has been done". Two edits are correct and cheap; a third is not available: either reconcile all 31 in one edit, or blank the column back to a uniform `⬚` and let the wave ledger own progress. Tagged `Process` because the durable question — should the PLAN template carry a hand-maintained `Status` column at all once a wave ledger exists? — is the same on every feature. | §2 status key `:139`; §4.1 task table `:268-312` |
| F-02 | Low | Local | **T17's `Status` cell says `🔴` and its file is green.** `consolidationEffectiveness.test.js` at HEAD contains **zero** `describe.skip(` occurrences and runs **27 passed / 0 skipped** under the project's own runner (`node --experimental-vm-modules node_modules/jest/bin/jest.js __tests__/consolidationEffectiveness.test.js`). T27 — the row that un-skips it, `Status` `✅` — landed in `0d956005`. The cell was **true when written** (`dad8f7dd` predates `0d956005`) and went stale two commits later, which is the sharpest available evidence for F-01: this column cannot be maintained by hand at the rate the branch moves, and the one cell most recently hand-verified is already wrong. Per §2's key (`:139`) T17 is `🟢`/`✅`, not `🔴`. Not gating — nothing reads it — and it resolves for free under either arm of F-01. | §4.1 T17 `:284` |

## Questions

| ID | Question |
|----|---------|
| Q-01 | v5's Q-01, still open and now cheaper to answer than to defer: is the `Status` column meant to be a live ledger, now that `WAVE_STATE_PATH` exists and owns resume? If it is, 28 rows are overdue and the reconciliation should be one edit, not a trickle. If it is not, the honest shape is a uniformly `⬚` column (or none), and the three filled cells should come back out. Either answer closes F-01 and F-02 together; the current middle state is the only one that misleads. |
| Q-02 | The v1.5 header attributes the corrections to "**Round 4's** two findings and its one question", but the findings it closes are F-02, F-03 and Q-01 of `CROSS-REVIEW-test-engineer-PLAN-v5.md` (Iteration 5). Purely a bookkeeping question — is the header numbering the *review round* or the *revision* it answers? Harvest reads these headers when it walks the round history, so consistent numbering is worth a sentence in the template rather than a per-feature convention. No finding filed; the content is right either way. |

## Positive Observations

- **§6.1's rejected alternative is measured, and it survived falsification.** The paragraph claims the
  front-of-cluster ordering returns "15 ready-sets and 15 waves, exactly as today", with T07 and T08
  moving to waves 4 and 7 while T10 and T12 move from 4 and 7 to 8 and 9. I built the alternative
  graph in memory (`T07 deps T03`, `T08 deps T07`, `T10 deps T08`, `T12 deps T10`) and re-ran
  `computeTopologicalBatches` and `computeWaves`: **15 / 15**, with T07 at wave 4, T08 at 7, T10 at 8,
  T12 at 9 — and the current graph placing T10 at 4 and T12 at 7. Four numbers and their four
  counterparts, all exactly as stated. A design rationale that can be re-run is worth more than one
  that can only be agreed with, and this one answers the question it was asked rather than restating
  the answer already given.
- **The census fix is set-equality, and it says so.** The new `:379` paragraph does not merely correct
  eleven to twelve; it states the shape of the check ("four plus twelve is sixteen … no leftovers on
  either side") and names the wrong shape it replaces ("an enumeration that merely lists files the
  manifest also contains is the containment-shaped oracle §4.1's T03 and T05 rows refuse"). The
  document now holds its own prose to the standard it holds its oracles to, which is the durable half
  of the fix — the count would have gone stale again otherwise.
- **T33's correction carries its own falsifier.** The row does not just say "fourth row"; it states
  the two numbers, the reason they differ by one (the manifest carries no row for itself), and the
  command that returns them. I ran both against the committed tree and got four paths and three rows.
  A reader who doubts the sentence is told exactly how to disprove it.
- **The revision was honest about a null result.** §6.1 records the re-run explicitly *because* "the
  diff should not have moved the graph" is a claim worth falsifying rather than assuming. That is the
  right instinct: this diff touched a task row's `Status` cell twice, and a mis-shaped cell is exactly
  the edit that shifts a column count under the parser without looking like it could.

## Recommendation

**Approved with minor changes**

No High findings. The convergence question for this round is narrow and both halves answer clean: the
two v5 findings the revision set out to close are **closed and independently re-measured** (§5's
census is now set-equal at sixteen in both directions; T33 states four rows / five files and HEAD
returns four paths and three rows), and the revision **broke nothing** — 34 tasks, 34 ownership rows,
`validatePlanContract` `{"ok":true}`, 15 ready-sets, 15 waves, 0 batch mismatches, 0 same-batch file
collisions, every number re-derived rather than copied and every number identical to v1.4. The batch
DAG, the ownership manifest, the un-skip chain and the TDD ordering are where round 4 left them.

The two open findings are both the same defect wearing two sizes: a hand-maintained `Status` column
that the branch has outrun. Neither is gating and neither can be, because no runtime reads the column
— `parsePlanTasks` has no status header set, and Phase I resume is driven by the wave ledger. But the
finding has inverted since v5: a column that reads `⬚ Not Started` on 28 rows whose work is committed
now understates progress as badly as it once overstated one row's, and the single most recently
hand-checked cell (T17) is already false. One decision — live ledger, or no ledger — closes both.

No upstream defect found this round. Every repository fact the revision leans on was checked against
the committed tree and holds: four tracked paths under `dist/`, three manifest rows at HEAD,
`TSPEC:2450`'s set-equality-minus-itself wording, and the alternative graph's 15/15 wave count. I
emit no errata.

## Verdict

VERDICT: Approved with minor changes

{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:4ebd3198acd7447cec042928ab6260557573a12c65f5b8ac1366c76c449b678b
REVIEWED-COMMIT: 6a5d6aa0266090f84cedec2de3aa4d23238f3fb6
