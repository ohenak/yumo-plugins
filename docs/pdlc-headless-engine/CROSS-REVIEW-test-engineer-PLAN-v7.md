# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md`
**Date:** 2026-08-12
**Iteration:** 7

**Scope:** Delta re-review of the v1.4→v1.5 revision. Round 6 closed with no High, two
Medium (F-19, F-20) and one Low (F-18). Sections untouched by the delta are not
re-reviewed.

## What changed since round 6

`git diff 6fe6c019..HEAD -- docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md`:
**41 insertions, 17 deletions**, across four kinds of edit:

| Edit | Where | Character |
|---|---|---|
| v1.5 changelog block added | §0 | five rows, addressing PM F-01/F-02, TE F-18/F-19/Q-01/Q-02/Q-03 |
| Self-referential line numbers deleted, replaced by section references | §0 (v1.4 row), §0's TE F-17 paragraph, §6 | `:238` → `§4`; `:507`/`:765`/`:796` → `§7`, `§10`, `§11`; `:211` dropped |
| §3 gains a paragraph declaring the Status column **advisory, swept at phase end, never a gate** | §3, above the task table | new prose, no table change |
| Status/phase glyphs flipped on twelve rows | §3 | T02, T03, T04, T05, T09, T26, T27, T32, T33, T43, T45, T46 |
| Three new dispositions O-ENG-T6/T7/T8 | §10 | answers my v6 Q-01, Q-02, Q-03 |

No `Deps`, no `Batch`, no `Test File`, no `Source File`, and no oracle prose changed.

## Prior findings — disposition at HEAD

Re-verified by running the shipped parsers over the live file, not by reading the
document's own claims.

| ID | Sev | Status | Evidence at HEAD |
|----|-----|--------|------------------|
| F-18 | Low | **Resolved — in the form that cannot recur** | Every self-referential line number is gone, replaced by a section reference carrying the same quoted header text. §6's three quotations are still byte-exact against the live headers: `# \| Integration point at HEAD \| What attaches` (§7, `:529`), `# \| Question \| Disposition here` (§10, `:787`), `# \| Command \| Observes \| State at HEAD` (§11, `:821`). Grepping for remaining `:NNN` citations returns only **out-of-document** ones — `transport.mjs:17`, `guard-harvest-before-delete.sh:29-30/35-38/53-57/6`, `pr-tests.yml:40/27/68/75/77/93/99/103/127/133/148/161/172/188` — which the changelog explicitly keeps, correctly: this document does not edit those files |
| F-19 | Med | **Resolved for T18; recurred on three new rows** — see F-21 | T18 now parses as `🟢 \`[Fake first]\` per-transport recorded fixture sets…` with the tick in the Status cell. But `parsePlanTasks` reports three descriptions still containing `✅`: **T09, T43, T46** |
| F-20 | Med | **Dispositioned by decision, not by sweeping** | §3's new paragraph settles the class rather than the instance: the column is advisory, no parser reads it, `⬚` is never evidence of absence, and *where this column and the branch disagree, the branch wins*. That is the right resolution and it makes the remaining stale rows (T06, T07, T10, T11, T17, T19, T48, T49 all `⬚` with files on disk) a declared property instead of a defect |
| Q-01 | — | **Answered** — O-ENG-T6 | Declines the task, and names the durable alternative. Verified: `pdlc/workflows/__tests__/planOwnership.test.js` and `waveExecution.test.js` both exist; `documentOracles.test.js:62` really is `const LIVE_ROOT = realpathSync(...)`, so the named attachment point is real |
| Q-02 | — | **Answered** — O-ENG-T7, with one false clause | See F-22 |
| Q-03 | — | **Answered** — O-ENG-T8 | Per-module over `pdlc/engine/lib/`, aggregate reported but not the gate. This is the stronger of the two readings and closes the question |

**Manifest re-derived at HEAD after the delta**, importing `parsePlanTasks`,
`parsePlanOwnership`, `validatePlanContract` and `computeWaves` from
`pdlc/workflows/orchestrate-dev.js` and running them over the live file:
**54 tasks / 54 owning rows / `{"ok":true}` / 17 waves** — identical to rounds 5 and 6.

**Every completion claim added this round checked against the branch, file by file.**
T02 `hermeticity.test.js`, T03 `assert-suite-wide.test.js`, T04 `outcome.test.js`,
T05 `catalogue.test.js`, T09 `fixtures-redaction.test.js`, T26 `startup-ladder.test.js`,
T27 `startup-guard-executable.test.js`, T32 `report-engine.test.js`,
T33 `fs-observation.test.js`, T43 `_bootstrap.mjs`, T45 `lib/adapter.mjs` — all present.
T46's fixture is the one worth checking rather than assuming, because its deliverable is a
*populated* tree: `fixtures/consumer-ac12/` carries `.claude/workflows/` with four artifacts
plus `.pdlc-drift-state.json`, `.claude/pdlc.config.json`, and a `docs/ac12-widget/REQ-*.md`.
Not one `✅` added this round is aspirational.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
