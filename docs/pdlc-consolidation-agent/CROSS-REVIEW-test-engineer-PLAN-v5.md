# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md`
**Date:** 2026-08-09
**Iteration:** 5
**Scope:** Local

## Method

Delta re-review. `git diff d57808ba..HEAD` over the PLAN returns **one changed line**: T03's
`Status` cell, `⬚` → `🔴`, landed as `9b7ea731 chore(pdlc): mark T03 status Red —
consolidationBuild.test.js already lands seven describe.skip blocks`. Nothing else in the document
moved, so the round's whole question is whether that one cell is true and whether flipping it
leaves the rest of the document consistent.

The cell is a claim about repository state, so it was checked against the repository rather than
against the commit message. The Phase P gate functions were re-run over the revised text because a
`Status`-column edit sits inside the task table and a mis-shaped cell would change the column count
the row parser reads.

**Gate functions re-run at HEAD** (imported from `pdlc/workflows/orchestrate-dev.js`, applied to
the revised PLAN): `parsePlanTasks` → **34** tasks, `errors: []`; `parsePlanOwnership` → **34**
rows; `validatePlanContract(tasks, ownership)` → `{"ok":true}`; `computeTopologicalBatches` → **15**
ready-sets; `computeWaves` → **15** waves; batch-column mismatches against `max(batch of Deps) + 1`
→ **0** across 34 rows; same-batch same-file collisions across the §5 manifest → **0**. Every number
is identical to v4's. The status-cell edit broke no parse and moved no wave.


## Disposition of v4 findings

v4 carried no High. Both open findings were left untouched by this revision — expected, since the
revision changed one status cell and nothing in §4.2 or §5. They are re-measured here rather than
copied forward, and they carry the same severities.

| ID | v4 Severity | Status | Evidence re-measured this round |
|----|----------|--------|--------------------------------|
| F-01 | Medium | **Open, unchanged** | §5's sentence at `:347` still reads "**Eleven** further test files carry two to four writers each" and still enumerates eleven. Deriving multi-writer files from the parsed ownership manifest gives **16**; four are itemised in the table above it (`consolidate-learnings.js`, `consolidationBuild.test.js`, `consolidationRoute.test.js`, `runtimeBundle.test.js`), leaving **12** for the sentence. `consolidationLifecycle.test.js` (T23 @ batch 3 → T31 @ batch 10) is in neither the table nor the list. Re-filed below as F-02 |
| F-02 | Low | **Open, unchanged** | T33's paragraph at `:289` still closes "the manifest gains its fifth artifact (T32, batch 11)". At HEAD `distribution-manifest.json` carries **3** rows (`orchestrate-dev`, `orchestrate-queue`, `pdlc-cli`) against **4** tracked paths under `pdlc/workflows/dist/`. T32 makes it five files / four rows — the vocabulary the *same row* uses earlier ("five tracked files, four manifest rows"). Re-filed below as F-03 |

**The `(new)` marker was checked and is not a defect.** T03's `Test File` cell still reads
`consolidationBuild.test.js` **(new)** while the file is now tracked at HEAD (`38a55af5`), which
looks like a contradiction until §4's preamble is read: "a row that creates a file says **(new)**
the first time that file appears, so 'confirm it exists or declare it new' is answerable from the
table alone" (`:238-239`). The marker is a plan-time property of the DAG — which row creates the
file — not a claim re-evaluated against a moving HEAD. It stays correct as tasks land. No finding.


## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Process | **The `Status` column is now half-reconciled: T03 flipped to `🔴` while six sibling rows in the same or a more advanced state still read `⬚ Not Started`.** The flipped cell itself is true — `consolidationBuild.test.js` is tracked at HEAD (`38a55af5`) and carries exactly **seven** `describe.skip(` blocks, set-equal by name to T03's seven declared blocks (`T10 — gitignore text`, `T12 — adapter prompt`, `T12 — rtConsInjections`, `T32 — the consolidation bundle`, `T07 — skill prompt`, `T08 — skill prompt`, `T33 — CLAUDE.md ↔ manifest`), so the commit message's count is exact, not approximate. The problem is what the revision leaves behind. Six further rows have landed on this branch with task-named commits — T00 (`60e058e7`), T01 (`048d6cbb`), T02 (`fa3d96b7`), T04 (`c1e9f9af`), T05 (`4148e741`), T06 (`7e941e4a`) — and all six still read `⬚`. Measured, not inferred: `consolidationPreflight.test.js` (T00) and `consolidationTraceability.test.js` (T05) **pass green** under the project's own runner (`node --experimental-vm-modules node_modules/jest/bin/jest.js`, 36 passed / 17 skipped across the four landed suites), and `consolidationRung.test.js` (T06) carries skipped blocks — the identical state that earned T03 its `🔴`. Per §2's status key (`:139`, `⬚ Not Started \| 🔴 Red \| 🟢 Green \| 🔵 Refactored \| ✅ Done`) T00 and T05 are Green and T04/T06 are Red; none is Not Started. This does not block: the column is **not** read by the runtime — `parsePlanTasks` consumes `#`/`Task`/`Batch`/`Deps` and never the `Status` cell, and Phase I resume is driven by the wave ledger (`WAVE_STATE_PATH`, `parseWaveLedger`), not by this table — which is why it is Medium and not High. But a uniformly blank column honestly reports "no ledger is kept", whereas a column with exactly one row filled invites a reader to trust it and conclude the other six are untouched. Either reconcile all seven landed rows in this edit, or leave the column uniformly `⬚` and let the wave ledger own progress. Tagged `Process` because the durable question — is `Status` an authored-once column or a live ledger maintained by wave commits? — is unanswered by the PLAN template and will recur on any feature whose Phase I runs while its PLAN is still under review. | §2 status key `:139`; §4.1 T03 `:248` |
| F-02 | Medium | Local | **§5's re-counted writer sentence enumerates eleven files where twelve exist — `consolidationLifecycle` is still missing.** Carried from v4 F-01, unchanged by this revision and re-measured this round. The sentence at `:347` reads "**Eleven** further test files carry two to four writers each" and lists eleven; deriving multi-writer files from the parsed ownership manifest gives **16**, of which four are itemised in the table directly above (`consolidate-learnings.js`, `consolidationBuild.test.js`, `consolidationRoute.test.js`, `runtimeBundle.test.js`), leaving **12** for the sentence. `consolidationLifecycle.test.js` (T23 @ batch 3 → T31 @ batch 10) appears in neither. No batch hazard hides in the omission — 3 → 10 is strictly increasing and the collision count is 0 with it included — which is why it is not blocking. The defect is that the sentence's own closing claim, "Every one of those pairs sits in a strictly increasing batch, which is checkable from the manifest's own `Batch` column", is a **containment** check over 11 of 12 rather than the set-equality over the full enumeration this PLAN demands of its own oracles (§4.1 T03, T05). Add `` `consolidationLifecycle` (T23 → T31) `` and read "Twelve". | §5 `:347` |
| F-03 | Low | Local | **T33's paragraph says the manifest "gains its fifth artifact"; it gains its fourth row.** Carried from v4 F-02, unchanged and re-measured. `:289` closes "the manifest gains its fifth artifact (T32, batch 11) one wave before this document records it". At HEAD `distribution-manifest.json` carries **three** rows — `orchestrate-dev`, `orchestrate-queue`, `pdlc-cli` — against **four** tracked paths under `pdlc/workflows/dist/` (`git ls-files`), the manifest itself carrying no row for itself. T32 makes it five files and four rows, which is the vocabulary this same row uses two sentences earlier ("five tracked files, four manifest rows"). No test can inherit the slip — T03's `T33` block reads the manifest's `rows[]` directly — but it is a one-word correction in the row an implementer reads immediately before writing a set-equality case over two numbers that differ by one. | §4.2 T33 `:289` |


## Questions

| ID | Question |
|----|---------|
| Q-01 | F-01 asks for a decision, not just an edit, and the cheaper answer may be the better one. Is the `Status` column meant to be a live ledger at all now that the wave ledger (`WAVE_STATE_PATH`) exists and owns resume? If it is not, the smallest correct change is to revert `9b7ea731`, leave the column uniformly `⬚`, and note in §4's preamble that progress is read from the wave ledger rather than from this table — which removes a maintenance obligation that will otherwise go stale on every wave. If it *is* meant to be live, the seven landed rows want reconciling together. I have not assumed which; either resolves the finding. |

## Positive Observations

- The commit message is falsifiable and it survived falsification. "already lands seven
  `describe.skip` blocks" is a counted claim about a named file, so it could be checked
  mechanically rather than believed — and the seven blocks are not merely seven, they are
  **set-equal by name** to T03's seven declared blocks. A message reading "adds the skip blocks"
  would have cost the same to write and proved nothing.
- The status flip is the honest direction of reconciliation. T03's blocks are all skipped, so the
  row is Red and not Green, and `🔴` is what the key says that state is called. A less careful
  reconciliation would have marked a row with seven skipped blocks as Done because the file exists.
- The one-line diff kept the gate numbers stable, and that is checkable rather than assumed:
  34 / 34 / `{"ok":true}` / 15 ready-sets / 15 waves / 0 batch mismatches / 0 same-batch collisions,
  every value identical to v4's. A `Status`-column edit sits inside the task table, where a
  mis-shaped cell would shift the column count the row parser reads — so this was worth re-running
  rather than waving through as "just a status cell".
- The `(new)` marker held up under exactly the pressure that would break a sloppier convention.
  T03's file now exists at HEAD, which makes `(new)` *look* stale, but §4's preamble had already
  defined the marker as a property of which row creates the file rather than a claim about the
  current tree. The convention was written to survive its own tasks landing, and it did.

## Recommendation

**Approved with minor changes**

No High. The revision changed one cell, the cell is true, and the gate functions re-run clean and
unchanged: 34 tasks / 34 ownership rows / `{"ok":true}` / 15 ready-sets / 15 waves / 0 batch
mismatches / 0 same-batch collisions. Nothing in the review loop's convergence question is open —
v4 carried no blocking finding, and this revision broke nothing that v4 had settled. The document's
oracles, batch DAG, ownership manifest and un-skip chain are all where round 4 left them.

Three findings stand, none blocking. F-01 is new and is the only one this revision caused: flipping
exactly one `Status` cell turned a uniformly-blank column into a selectively-filled one while six
sibling rows sit in the same or a more advanced state, two of them measurably green. It is Medium
rather than High because the runtime never reads the column — `parsePlanTasks` does not consume it
and Phase I resume runs off the wave ledger — so no wave can be misrouted by it; the cost is paid by
a human reader who trusts a ledger that is only one-seventh kept. F-02 and F-03 are carried from v4
untouched, both re-measured against the repository this round rather than copied, and both are
single-cell corrections that touch no oracle.

No upstream defect was found this round. The one changed cell is internally scoped to the PLAN, and
the repository facts it depends on — `consolidationBuild.test.js` tracked at `38a55af5` with seven
`describe.skip` blocks, the four landed suites passing 36 / skipping 17 — check out as stated. I
emit no errata.

## Verdict

VERDICT: Approved with minor changes

{"high": 0, "medium": 2, "low": 1}
