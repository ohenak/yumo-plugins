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

No High. The manifest is byte-stable in the shape approved in round 5, no oracle,
dependency, batch or ownership text moved, and the two structural questions the delta
answers are answered well. Two Mediums and one Low, all in the bookkeeping layer.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-21 | Medium | Local | **The exact defect F-19 named was repaired on T18 and reintroduced on three other rows in the same delta.** T09's Task cell was `🔴`, and is now `✅ fixture redaction scanner…`; T43's was `🟢`, now `✅ bootstrap v2…`; T46's was `🟢`, now `✅ [Fake first] AC-1.2 consumer fixture…`. In each the completion tick **overwrote** the TDD phase marker rather than going in the Status cell beside it. Confirmed in the parsed field, which is the changelog's own stated verification criterion: `parsePlanTasks(...).tasks.filter(t => t.description.includes("✅"))` returns exactly `["T09", "T43", "T46"]`. Two things follow. (a) The v1.5 changelog's claim is true only of the row it names — "verified in the parsed field, not the rendering — `parsePlanTasks` now returns T18's description with no tick" holds for T18 and is false for three siblings edited in the same window, so the verification was applied to the repair and not to the sweep. (b) T09 is a **batch-2 red-terminal** task, and §5's gate wording for that batch is "a batch-2 test that *passes* is a defect in the test, not progress"; the row's own `🔴` marker — which §3's new paragraph explicitly designates as "the red-before-green record that §5's gate is read off" — is now deleted from precisely one of the nine rows that gate governs. The delta raised the stakes on the Task-cell marker in §3 and deleted it from three rows in §3, in one revision. Fix is the same one-cell move already applied to T18: restore `🔴` on T09 and `🟢` on T43/T46, leave the `✅` in Status | §3 rows T09, T43, T46; §3's new paragraph; §5 batch-2 gate |
| F-22 | Medium | Local | **O-ENG-T7's mechanism clause is false at HEAD, and T04 is already marked Done.** The disposition answers my Q-02 substantively and correctly — the corpus *is* pinned, and it is pinned with exactly the non-`Error` shapes I asked about: `outcome.test.js` carries `generateArbitraryThrownShapes()` yielding `string`, `string-empty`, `number`, `number-nan`, `null`, `undefined`, `boolean`, `plain-object`, `array`, `error-no-cause`, `error-with-cause`, `error-nested-cause`, `throwing-message-getter`, `frozen-object`. My concern (a generator emitting only `Error` instances satisfies totality while proving nothing) is genuinely discharged. But the disposition says the corpus "is a **named export** from the same test file" and that "any later task needing throwables **imports it** rather than re-rolling one" — and `outcome.test.js` has **no export statement at all**; the generator is module-local. T04 is marked `✅` this round, so this is not a forward commitment an implementer can still satisfy, it is a description of landed code that does not match the code. Either add `export` to the generator (one word, makes the disposition true and the import path real) or reword O-ENG-T7 to say the corpus is pinned in-file and a later task needing it must lift it to an export first | §10 O-ENG-T7; `pdlc/engine/__tests__/outcome.test.js` |
| F-23 | Low | Process | **§3's own sweep discipline was violated by the commits that wrote §3's sweep discipline.** The new paragraph says the column is swept "**once, at phase end**, never incrementally mid-wave, because editing it commit-by-commit re-opens Phase P by changing the bytes an approval anchor is pinned to". The twelve rows flipped in this delta arrived in exactly that forbidden shape — separate per-task chore commits (`5a067bf7` "mark T02 hermeticity guard complete", `f72a9165` "mark T09 fixture redaction scanner complete", `bf4a19fa` "mark T26 done", `d9683562` "mark T27 landed", among others), each mutating §3 mid-wave. The rule is the right one and I am not asking for it to be relaxed; I am noting that it is stated in the same revision that breaks it, so nothing yet demonstrates the rule is load-bearing rather than aspirational. This is the mechanism that produced F-19 and now F-21 — a rule honoured would have produced neither | §3 new paragraph; commits `5a067bf7`, `f72a9165`, `bf4a19fa`, `d9683562` |

## Questions

## Positive Observations

## Recommendation

## Verdict
