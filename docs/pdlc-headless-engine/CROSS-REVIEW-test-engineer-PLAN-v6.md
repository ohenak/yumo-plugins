# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md`
**Date:** 2026-08-12
**Iteration:** 6
**Scope:** Delta re-review. Round 5 closed with no High, no Medium, one Low (F-18).
This round's diff touches the §3 task table's status bookkeeping only — no requirement,
oracle, dependency, batch, or file-ownership text changed. Sections untouched by the delta
are not re-reviewed.

## What changed since the reviewed commit

`git diff f5ff0cd7..HEAD -- docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md`:
**8 insertions, 8 deletions, all inside the §3 task table, all status glyphs.** Eight
chore/feat commits (`23585571`, `82f7f501`, `dc8c0b79`, `3f6a32c2`, `60c33a80`,
`94564d39`, `60555c2e`, `6fe6c019`) each flipped one row:

| Row | Edit | Cell touched |
|---|---|---|
| T01, T08 | `⬚` → `✅` | Status column (correct cell) |
| T12, T13, T14, T15, T16 | `⬚` → `✅` | Status column (correct cell) |
| T18 | `🟢` → `✅` | **Task column's TDD glyph — Status column left `⬚`** |

No prose, no `Deps`, no `Batch`, no `Test File` / `Source File` cell changed. F-18's
off-by-one self-citations are untouched by the delta and remain as filed (still Low,
still not re-opened here).

## Prior findings

| ID | Severity | Status at v1.4/HEAD | Evidence |
|----|----------|---------------------|----------|
| F-18 | Low | **Carried, unchanged** | The delta is ±8 lines in place inside one table; §0/§4/§6/§8/§11 citation text is byte-identical to the reviewed commit, so the off-by-one self-citations neither worsened nor healed |
| Q-01 | Question | **Now answered by the machine, not the plan** | Still no task asserts the PLAN's own manifest parses. I re-ran it by hand this round (below) and it is green — but that is my hand, not a red test |

## Mechanical re-verification at HEAD

Everything the delta could have broken, re-measured rather than assumed.

| Claim | Method | Result |
|---|---|---|
| The status edits did not disturb the machine-read manifest | `parsePlanTasks` / `parsePlanOwnership` / `validatePlanContract` / `computeWaves` imported from `pdlc/workflows/orchestrate-dev.js`, run over the live PLAN | **54 tasks / 54 owning tasks / `{"ok":true}` / 17 waves** — identical to round 5. The `Status` column is not a parsed field; the glyph swap is inert to the dispatcher |
| T18's glyph landed in the wrong cell | Same parse: `parsePlanTasks(...).tasks` entry for T18 | `description` now **begins** `"✅ \`[Fake first]\` per-transport recorded fixture sets…"` — the `✅` is inside the Task cell, and the row's Status cell still reads `⬚` |
| The legend that makes both glyph sets mean something | PLAN `:162` | `Status key: ⬚ Not Started \| 🔴 Red \| 🟢 Green \| 🔵 Refactored \| ✅ Done.` — one key, both columns draw on it, so T18 now reads "Done" and "Not Started" simultaneously |
| T18's work actually exists | `ls -R pdlc/engine/__tests__/fixtures` | `README.md`, `transport-cli/` (4 `.jsonl`), `transport-sdk/` (4 `.json` + `multi-dispatch-source-change/` with 5 dispatches) — all three owned paths present. The `⬚` in T18's Status cell is the stale half; the `✅` is the true claim, in the wrong cell |
| The seven correctly-marked rows are true | Files on disk + `git log -1` per path | T01 `suite-spine.test.js` + both probes (`dc5bcf16`); T08 `ci-arrangement.test.js` (`363146e7`); T12 `_bootstrap.mjs`; T13 `lib/outcome.mjs` (`fd4b5b3d`); T14 `lib/catalogue.mjs`; T15 `lib/auth.mjs`; T16 `DISPATCHABLE_SKILLS` exported at `orchestrate-dev.js:3463` and present in `dist/orchestrate-dev.bundle.js`, with `build-runtime.mjs --check` exiting **0** — T16's "regenerated artifacts in this task's commit" clause is satisfied at HEAD |
| Rows still marked `⬚` are genuinely not started | `git log -1` per test path | **They are not.** `hermeticity.test.js` (T02, `2dd82ccb`, 197 lines), `assert-suite-wide.test.js` (T03, `3fd567ad`, 237), `catalogue.test.js` (T05, `cfec0edc`), `auth.test.js` (T06, `297a6e73`), `fixtures-redaction.test.js` (T09, `c172957b`), `run.test.js` (T10, `3a7da232`) are all committed with commit subjects naming their task ids — yet all six rows still read `⬚` |

## Findings

No High findings. The delta changed no oracle, no dependency edge, no ownership cell, and
the manifest still parses to the same 54/54/17 shape it did in round 5. Two Mediums and
one Low on the bookkeeping itself.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-19 | Medium | Local | **T18's completion glyph overwrote its TDD-phase glyph instead of its Status cell, and the row now contradicts itself.** The Task cell opens `✅ \`[Fake first]\` per-transport recorded fixture sets…` while the Status column still reads `⬚`; against §162's single legend that is "Done" and "Not Started" on one row. Two things are lost, not just tidiness: (a) T18's `🟢` was the marker distinguishing green tasks from the `🔴` red-terminal tasks §5's batch-2 gate reasons over — T18 is batch 3 so the gate itself is unaffected, but the plan's red/green partition is no longer readable by inspection for this row; (b) the `⬚` is now a false negative on work that demonstrably landed (all three owned fixture paths exist on disk). Fix is one cell each way: restore `🟢` at the head of the Task cell, move `✅` into the Status column | §3 T18 (`:180`), legend `:162` |
| F-20 | Medium | Process | **The status ledger is now selectively stale, which is worse for auditing than uniformly stale.** Eight rows were marked this round; six other tasks whose work is committed on this branch were not — T02 (`2dd82ccb`), T03 (`3fd567ad`), T05 (`cfec0edc`), T06 (`297a6e73`), T09 (`c172957b`), T10 (`3a7da232`) all still read `⬚`. The direct consequence for TDD auditing: T13 (`✅`) depends on T04, T14 (`✅`) on T05, T15 (`✅`) on T06, T16 (`✅`) on T07, T12 (`✅`) on T01+T02 — so as the table reads today, **four green tasks are Done while their red-test predecessors are Not Started**, which is precisely the ordering violation §5 exists to prevent. It is a bookkeeping artefact, not a real inversion (T05/T06 landed before their greens; T04/T07 need checking by the author, not by me) — but a reader cannot tell those two situations apart from the document, and the whole point of the column is that they should be able to. Either mark the rows that landed, or state in §3 that the column is updated per-wave and is not authoritative mid-wave | §3 rows T02, T03, T05, T06, T09, T10 |
| F-18 | Low | Local | **Carried unchanged from round 5** — the self-citations inside the PLAN are off by one (§6 cites §4 at `:238` vs actual `:239`; the three `#`-opening headers at `:507`/`:765`/`:796` vs `:508`/`:766`/`:797`; §0's changelog cites `:211`). The delta neither touched nor shifted them: 8 insertions against 8 deletions, all in place. Out-of-document citations remain byte-exact | §0, §6 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | **Third time, and this round is the exhibit:** no task asserts that this PLAN's own §4 manifest parses. I ran it by hand again (54/54/`ok`/17) and it is green — but this is the second consecutive round where the document was edited by a mechanism (per-task chore commits) that writes into table cells, and this round one of those writes landed in the wrong cell. A malformed manifest degrades to the legacy worktree path *silently*; a wrong-cell edit is exactly the failure mode that produces one. One red test over the live file — `validatePlanContract(parsePlanTasks(PLAN).tasks, parsePlanOwnership(PLAN).ownership).ok` — would have cost nothing and would now be earning its keep |
| Q-02 | Carried: is T04's "arbitrary thrown values (strings, `null`, `undefined`, non-`Error` objects, nested causes)" corpus pinned in a shared `throwables` fixture, or left to the implementer? T13's green is now marked Done while T04's red still reads `⬚`, so this question has become answerable from the repo — whoever marks T04 should confirm the generator is not `Error`-only |
| Q-03 | Carried: is §8's ≥85 % floor per-module or over the whole `lib/` aggregate? `lib/` now has ten modules on disk (`adapter`, `auth`, `catalogue`, `handshake`, `outcome`, `report`, `run`, `skills`, `startup`, `transport`), so an aggregate reading is no longer hypothetical — one thin module can float the average over a fat one |

## Positive Observations

- **The delta is inert where it matters, and I could prove it rather than assume it.** Re-running the real parsers over the real file returned the identical 54 / 54 / `{"ok":true}` / 17 shape as round 5. The `Status` column is not a parsed field, so eight glyph edits cannot move the dispatcher — the plan's earlier decision (§4) to keep the human-auditing columns strictly disjoint from the machine-read ones is what makes a round like this cheap to review.
- **Every completion claim marked this round is true against HEAD, checked file-by-file.** Not one `✅` is aspirational: T01's three spine files, T08's `ci-arrangement.test.js`, T12's `_bootstrap.mjs`, and T13/T14/T15's three `lib/` modules all exist with commits naming their tasks.
- **T16's hardest clause survived the check.** It required not just the exports but the regenerated bundle in the same commit; `DISPATCHABLE_SKILLS` is exported at `orchestrate-dev.js:3463`, present in `dist/orchestrate-dev.bundle.js`, and `build-runtime.mjs --check` exits `0`. That is the one `✅` in this delta that a stale artifact could have falsified, and it holds.
- **Nothing was quietly re-litigated.** Zero changes to `Deps`, `Batch`, `Test File`, `Source File`, or any oracle prose. The round-5 approvals — F-16's positional set-equality oracle on T11, §6's membership argument, §8/§11's `LIVE_ROOT` attribution — are byte-identical at HEAD.

## Recommendation

**Approved with minor changes**

No High findings, and none opened by the delta. This round is bookkeeping: eight status
glyphs, no semantic movement, and the manifest re-parses to exactly the shape it had when
I approved it in round 5. Every `✅` written this round is backed by a file on disk and a
commit naming the task.

The two Mediums are both about the ledger rather than the plan. F-19 is a one-cell
mis-edit that leaves T18 asserting Done and Not Started at once and drops its `🟢`; F-20 is
the wider pattern — six committed tasks still reading `⬚`, which makes four greens look
like they preceded their reds. Neither blocks Phase P: the dispatcher does not read the
column, and I verified the underlying work independently. Both are worth one pass before
Phase I starts leaning on this table as its human-facing progress record.

No erratum round. The defects this round are in the PLAN itself, which is the document in
front of me, and every upstream citation re-checked in round 5 (`FSPEC:1347`,
`orchestrate-dev.js`, `document-oracles.mjs`, `documentOracles.test.js`,
`.claude/pdlc.config.json`) is untouched by the delta.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}
