# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md`
**Date:** 2026-08-11
**Iteration:** 6
**Scope:** product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

Delta re-review against `CROSS-REVIEW-product-manager-PLAN-v5.md`. Unchanged sections are not re-litigated.

## Delta basis

`git diff f5ff0cd7..6fe6c019 -- docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md` — **8 insertions, 8 deletions, all in §3's task table, all in the Status column** (plus one that missed it; see F-01). No prose section changed. Eight commits touched the file since v5's `REVIEWED-COMMIT: f5ff0cd7`:

| Commit | What it changed in the PLAN |
|---|---|
| `23585571` | T01 Status ⬚ → ✅ |
| `82f7f501` | T08 Status ⬚ → ✅ |
| `dc8c0b79` | T15 Status ⬚ → ✅ |
| `3f6a32c2` | T14 Status ⬚ → ✅ |
| `60c33a80` | T13 Status ⬚ → ✅ |
| `94564d39` | T12 Status ⬚ → ✅ |
| `60555c2e` | T18 — tick written into the **Task** cell, not the Status cell |
| `6fe6c019` | T16 Status ⬚ → ✅ |

Every one is Phase-I bookkeeping. Nothing in the plan's content — scope, task set, dependency graph, ownership manifest, oracle choices — was revised this round. That fact drives both the disposition below and F-03.

**Structural contract re-verified at HEAD** (`node` over `pdlc/workflows/orchestrate-dev.js`): `parsePlanTasks` → **54** tasks; `parsePlanOwnership` → **54** owning rows carrying **76** path–task pairs; `validatePlanContract` → `{"ok":true}`; `computeWaves` → **17**; `computeTopologicalBatches` → **17**. Identical to v5. The Status edits did not disturb the parse.

## Disposition of v5 findings

Both v5 findings were Low and non-gating; neither was addressed, because this round's edits were bookkeeping only. Both reproduce at HEAD and are carried forward unchanged (F-04, F-05 below).

| v5 finding | Severity | Status at HEAD | Evidence |
|---|---|---|---|
| **F-01** — §6's self-citation `:238` and the changelog's `:507`/`:765`/`:796` are each one line short of their targets | Low | **Open, unchanged** | `PLAN:238` is blank; `PLAN:239` is `\| Files \| Task \| Batch \|`. `PLAN:507` is blank; `PLAN:508` is `\| # \| Integration point at HEAD \| What attaches \|`. Line counts were unaffected this round (8 insertions / 8 deletions) |
| **F-02** — the v1.4 changelog cites §4's manifest header as `:211`, which is 28 lines inside §3's task table | Low | **Open, unchanged** | `PLAN:211` is T42's task row (`\| T42 \| 🟢 the O-2 measurement and its record…`), not the manifest header |
| **Q-01** (carried from v4) — is the Status column a live ledger maintained through Phase I? | — | **Answered by events, and the answer is the problem** | Eight commits since v5 did exactly that. See F-03 |

## Findings

**No High findings.** Nothing this round blocks Phase P: no requirement was dropped, narrowed, or re-traced, no scope was added, and the machine-read contract still parses clean. The three Medium findings are all about the one column that changed, and they are all self-checkable in one pass.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **T18's completion tick was written into the Task-description cell instead of the Status cell, destroying the row's phase marker.** The row now reads `\| T18 \| ✅ \`[Fake first]\` per-transport recorded fixture sets …\` … \| 3 \| T09 \| ⬚ \|` (`PLAN:187`). Two losses in one edit: (a) the `🟢` green-phase marker that every other batch-3 row carries is gone, so §5's red/green gate can no longer be read off this row; (b) the Status cell still reads `⬚`, so the column reports T18 as Not Started while `60555c2e`'s own subject line is "mark T18 complete". I confirmed the corruption is in the parsed field, not just the rendering: `parsePlanTasks` at HEAD returns `{"id":"T18","description":"✅ \`[Fake first]\` per-transport recorded fixture sets…"}` — the tick is inside the string the orchestrator hands to a dispatched implementer. Non-gating because the runtime never reads the Status column (`orchestrate-dev.js:3808-3830` selects only id, deps, description and batch cells) and T18's work has in fact landed (`64f45f28`, fixtures present under `pdlc/engine/__tests__/fixtures/transport-sdk/` and `transport-cli/`). **Fix:** restore `🟢` at the head of T18's Task cell and set its Status cell to `✅` | REQ C-9; PLAN §3, §5 |
| F-02 | Medium | Local | **The Status column materially understates what has landed: eight tasks read `⬚` although their declared deliverables exist on this branch, and five of them are the *predecessors* of tasks now marked `✅`.** Verified per row against HEAD (each commit confirmed an ancestor of `6fe6c019` via `git merge-base --is-ancestor`): T02 `⬚` but `pdlc/engine/__tests__/hermeticity.test.js` exists (197 lines, `2dd82ccb`); T03 `⬚` but `assert-suite-wide.test.js` exists (237 lines, `3fd567ad`); T04 `⬚` but `outcome.test.js` exists (345 lines, `58207d0e`); T05 `⬚` but `catalogue.test.js` exists (79 lines, `cfec0edc`); T06 `⬚` but `auth.test.js` exists (363 lines, `297a6e73`); T09 `⬚` but `fixtures-redaction.test.js` exists (154 lines, `c172957b`); T10 `⬚` (`3a7da232`); T11 `⬚` but `_run-suite.mjs` exists and `pdlc/engine/package.json:13` already reads `"test": "node __tests__/_run-suite.mjs"` (`9de00069`). The resulting ledger is self-contradictory in the direction that misleads worst: T12 (`✅`) declares deps `T01, T02` with T02 `⬚`; T13 (`✅`) deps T04 `⬚`; T14 (`✅`) deps T05 `⬚`; T15 (`✅`) deps T06 `⬚`; T16 (`✅`) deps T07 `⬚`. Read literally, the plan now claims five green tasks completed ahead of the red tests they exist to satisfy — the exact inversion §5's red-terminal gate is there to prevent. The underlying work is fine; the record of it is not. **Fix:** re-derive the whole column against HEAD in one edit rather than incrementally, or drop the ticks and keep the column at its approved baseline | REQ C-9; PLAN §3, §5 |
| F-03 | Medium | Process | **Maintaining the Status column inside the approved artifact spent a full review round on bookkeeping and staled the approval anchor.** v5 approved `f5ff0cd7` and pinned `APPROVAL-HASH`/`REVIEWED-COMMIT` to those bytes. Eight commits later the bytes differ, so Phase P re-opened and this round's entire delta is a column no consumer reads. That is a poor trade in both directions: the ledger is not authoritative enough to trust (F-01, F-02 are both errors in it, introduced by exactly this mechanism), yet it is inside the artifact whose bytes approval is pinned to. This is the third distinct defect class this document has produced from in-document self-maintained state (v3 F-04 stale citations, v4/v5 F-01 stale citations, now stale status) — a durable process signal, not a local slip. **Fix (either is acceptable, the choice belongs to the operator):** freeze the Status column at its approved value and track live task state where Phase I already tracks it — commit history and the queue row — or, if the in-document ledger is wanted, state in §3 that Status is advisory, updated in one sweep at phase end, and never a gate. Tagged `Process`: the general lesson is that live mutable state inside a byte-pinned approved document guarantees either stale approvals or stale state | REQ C-9; PLAN §0, §3 |
| F-04 | Low | Process | **Carried from v5 F-01, unaddressed.** Four self-citations remain one line short: §6's `:238` (blank; target `:239`) and the v1.4 changelog's `:507`/`:765`/`:796` (target `:508`/`:766`/`:797`). Line numbers did not shift this round, so the same re-pin still applies | REQ C-9; PLAN §6, §0 |
| F-05 | Low | Local | **Carried from v5 F-02, unaddressed.** The v1.4 changelog still cites §4's manifest header as `:211`; `PLAN:211` is T42's task row. Correct pointer is `:239`. Distinct from F-04 in degree — this one lands on unrelated content, so a reader checking the changelog's claim sees a task row and may conclude the manifest was never re-formatted | REQ C-9; PLAN §0 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | **Closed, superseded by F-03.** v4/v5 asked whether the Status column is a live ledger. It is, and the cost is now measured rather than hypothesised: eight commits, one stale approval anchor, two errors introduced into the column itself. The question is retired; the decision it was waiting on is F-03's fix |
| Q-02 | T17 correctly reads `⬚`, and it is the only remaining CI-facing task. Confirming the intended split, because it bears on when Phase I can call the CI arrangement done: the `engine-tests` job **does** already exist at `.github/workflows/pr-tests.yml:77`, but `.claude/pdlc.config.json`'s `implementation.testCommand` still runs only the workflows suite (`cd pdlc/workflows && npm test …`) with no engine leg. So T17's two halves have diverged — half landed under T08's test, half has not. Is T17 intended to remain open purely on the `testCommand` extension, and is that extension deliberately deferred until the engine suite is green (so a wave gate is not widened onto a red suite)? If yes, a half-sentence in T17's cell saying so would stop a future reader from marking it done off the job's existence alone. Not gating either way |

## Positive Observations

- **The plan's substance survived a round of implementation contact without a single content edit.** That is the strongest signal available at this stage. Eight tasks' worth of real work landed since v5 — the suite runner, the bootstrap guard, three `lib/` modules, the fixture sets — and none of it forced a change to the task set, the dependency graph, the ownership manifest, or any oracle choice. Plans that are wrong reveal it here; this one did not.
- **The machine-read contract is byte-stable across the round.** I re-derived rather than trusting v5: 54 tasks, 54 owning rows, 76 path–task pairs, `validatePlanContract` → `{"ok":true}`, 17 waves, 17 batches. Every figure matches v5 exactly. The Status edits touched a column no parser reads, which is *why* F-01 and F-02 are Medium rather than High — the plan cannot mis-execute on them.
- **T17's row is the ledger's one accurate `⬚`, and it is accurate for a subtle reason.** It stayed open even though half its deliverable visibly exists (`pr-tests.yml:77`), because the other half — the `testCommand` extension — genuinely has not landed. Whoever left it alone resisted the easy tick. That is the discipline F-02 asks for everywhere else.
- **T11's oracle held up against the implementation it specified.** The plan demanded node flags in node-option position with set-equality over the child's whole argv; `_run-suite.mjs:48` builds `["--test", ...forwardedArgs, "--import=./__tests__/_bootstrap.mjs", "__tests__/"]`, forwarded flags ahead of the path list exactly as specified, and `pdlc/engine/package.json:13` makes the runner `scripts.test`. The spec was precise enough to be implemented without reinterpretation — the outcome a plan is for.
- **T16's tick is honest about a messy history.** `6fe6c019`'s subject records that the work "already landed at `c3b68b5a`" — a commit whose own subject mislabels it as T14. Marking the row while naming the confusing provenance is better than either silently ticking it or re-doing the work. I verified the exports exist: `orchestrate-dev.js:3463` `export const DISPATCHABLE_SKILLS = Object.freeze(`, `:1797` `ADVISORY_RUNG_SKILL`.

## Recommendation

**Approved with minor changes.**

No High findings. Nothing this round blocks Phase P, and I want to be explicit about why, because three Medium findings in a row can read as heavier than it is: **the plan's product content did not change this round.** The delta is eight edits to a documentation-only column. Scope is unchanged, every P0/P1 requirement still traces to tasks exactly as approved at v5, and the structural contract re-derives identically (54 tasks, 76 path–task pairs, `{"ok":true}`, 17 waves). Phase P should proceed.

The three Mediums are all one problem wearing three faces — a live ledger kept inside a byte-pinned approved document — and all three are fixable in a single edit:

1. **F-01** — restore `🟢` to T18's Task cell and move the `✅` to its Status cell (`PLAN:187`).
2. **F-02** — re-derive the whole Status column against HEAD in one sweep. Eight rows currently read `⬚` whose deliverables exist on this branch (T02, T03, T04, T05, T06, T09, T10, T11), five of them predecessors of rows already marked `✅`.
3. **F-03** — decide the column's status: freeze it at the approved baseline and let commit history carry live state, or keep it and declare in §3 that it is advisory, swept once at phase end, never a gate. Either resolves the recurrence; drifting on is the only bad option.
4. **F-04 / F-05** (carried, Low) — re-pin `:238`→`:239`, `:507`/`:765`/`:796`→`:508`/`:766`/`:797`, and the changelog's `:211`→`:239`.

If the operator prefers, F-01 and F-02 can be folded into whichever sweep F-03 settles on, rather than being edited twice.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 2}

APPROVAL-HASH: sha256:85dfd56afb853419f2caf4cd808945b130126d27e1425df834f296341e5e40e2
REVIEWED-COMMIT: 6fe6c01953083e9012e4f942c170c8f12ef093be
