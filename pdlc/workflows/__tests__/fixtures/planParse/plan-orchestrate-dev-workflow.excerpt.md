<!--
  Fixture excerpted verbatim (long table cells truncated to keep the file small —
  truncation touches description-style cells only, never an id, dependency or
  batch cell) from:
    docs/orchestrate-dev-workflow/PLAN-orchestrate-dev-workflow.md
  Two of this PLAN's six task tables. They carry no dependencies column at
  all, so no DAG can be derived from them. The pre-fix parser nonetheless
  found a "header" in the middle of the second table — a data row whose
  Description cell happens to contain the words "id" and "dependencies".
-->

<!-- docs/orchestrate-dev-workflow/PLAN-orchestrate-dev-workflow.md lines 52-56 — task table, phase 1 — no dependencies column -->

| # | ID | Title | Description | Test File | Source File | Complexity | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | TASK-P1-01 | Add VERDICT trailer to se-review SKILL.md | Append the  ## VERDICT Trailer (required — workflow dat … | `pdlc/workflows/__tests__/skillFiles.test.js` | `pdlc/skills/se-review/SKILL.md` | S | ⬚ |
| 2 | TASK-P1-02 | Add VERDICT trailer to te-review SKILL.md | Append the  ## VERDICT Trailer (required — workflow dat … | `pdlc/workflows/__tests__/skillFiles.test.js` | `pdlc/skills/te-review/SKILL.md` | S | ⬚ |
| 3 | TASK-P1-03 | Add VERDICT trailer to pm-review SKILL.md | Append the  ## VERDICT Trailer (required — workflow dat … | `pdlc/workflows/__tests__/skillFiles.test.js` | `pdlc/skills/pm-review/SKILL.md` | S | ⬚ |

<!-- docs/orchestrate-dev-workflow/PLAN-orchestrate-dev-workflow.md lines 99-108 — task table, phase 3 — row 101 kept verbatim: its Description cell is what the pre-fix parser mistook for a header row -->

| # | ID | Title | Description | Test File | Source File | Complexity | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 12 | TASK-P3-01 | Implement PLAN DAG parsing agent call | Implement `TSPEC-IMPL-01`: single `agent()` call that reads `PLAN-{featureName}.md` and returns a structured JSON task list `{tasks: [{id, description, dependencies, planBatch}]}`. Validate parsed output; halt with `"Error: PLAN parsing agent failed to return structured task list"` on parse failure. | `pdlc/workflows/__tests__/implPhase.test.js` | `pdlc/workflows/orchestrate-dev.js` | S | ⬚ |
| 13 | TASK-P3-02 | Implement topological batching algorithm | Implement  TSPEC-IMPL-02 : topological sort producing e … | `pdlc/workflows/__tests__/implPhase.test.js` | `pdlc/workflows/orchestrate-dev.js` | M | ⬚ |
| 14 | TASK-P3-03 | Implement batch plan logging | Implement  TSPEC-IMPL-03 : emit batch plan  log()  call … | `pdlc/workflows/__tests__/implPhase.test.js` | `pdlc/workflows/orchestrate-dev.js` | S | ⬚ |
| 15 | TASK-P3-04 | Implement parallel se-implement dispatch with worktree … | Implement  TSPEC-IMPL-04 : per-batch  phase()  label, … | `pdlc/workflows/__tests__/implPhase.test.js` | `pdlc/workflows/orchestrate-dev.js` | M | ⬚ |
| 16 | TASK-P3-05 | Implement worktree merge-back with conflict handling | Implement  TSPEC-IMPL-05 : sequential  git merge --no-f … | `pdlc/workflows/__tests__/implPhase.test.js` | `pdlc/workflows/orchestrate-dev.js` | M | ⬚ |
| 17 | TASK-P3-06 | Implement per-batch test gate | Implement  TSPEC-IMPL-06 : empty-result check (short-ci … | `pdlc/workflows/__tests__/implPhase.test.js` | `pdlc/workflows/orchestrate-dev.js` | M | ⬚ |
| 18 | TASK-P3-07 | Implement Phase PT — PROPERTIES tests agent | Implement  TSPEC-IMPL-07 : single  se-implement  agent … | `pdlc/workflows/__tests__/implPhase.test.js` | `pdlc/workflows/orchestrate-dev.js` | S | ⬚ |
| 19 | TASK-P3-08 | Implement Phase CR — final codebase reviewLoop call | Implement  TSPEC-IMPL-08 : call  reviewLoop  with  doc: … | `pdlc/workflows/__tests__/implPhase.test.js` | `pdlc/workflows/orchestrate-dev.js` | S | ⬚ |

<!-- docs/orchestrate-dev-workflow/PLAN-orchestrate-dev-workflow.md lines 125-130 — task table, phase 4 — swallowed by that phantom header -->

| # | ID | Title | Description | Test File | Source File | Complexity | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 20 | TASK-P4-01 | Implement harvest phase with PHASE_H_ENABLED flag | Implement  TSPEC-HARVEST-01  through  TSPEC-HARVEST-04 … | Edit) fires on workflow agent writes and that  nudge-co … | Edit on all workflow agent writes; nudge-consolidation … | `pdlc/workflows/__tests__/harvestPhase.test.js` | `pdlc/workflows/orchestrate-dev.js` | M | ⬚ |
| 21 | TASK-P4-02 | Implement DECISIONS_WARRANTED post-PASS se-author call | Implement  TSPEC-DECISIONS-01  through  TSPEC-DECISIONS … | `pdlc/workflows/__tests__/pipelineWiring.test.js` | `pdlc/workflows/orchestrate-dev.js` | M | ⬚ |
| 22 | TASK-P4-03 | Wire all phases into top-level pipeline sequence | Wire the canonical phase execution order in  main() : R … | `pdlc/workflows/__tests__/pipelineWiring.test.js` | `pdlc/workflows/orchestrate-dev.js` | L | ⬚ |
| 23 | TASK-P4-04 | Implement final report structure and return value | Implement  TSPEC-ERROR-03 :  FinalReport  object with … | `pdlc/workflows/__tests__/pipelineWiring.test.js` | `pdlc/workflows/orchestrate-dev.js` | M | ⬚ |

<!-- docs/orchestrate-dev-workflow/PLAN-orchestrate-dev-workflow.md lines 168-173 — task table, phase 6 — swallowed by that phantom header -->

| # | ID | Title | Description | Test File | Source File | Complexity | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 25 | TASK-P6-01 | Add `ship-pr` worker skill | Create  pdlc/skills/ship-pr/SKILL.md  per TSPEC-SHIP-06 … | `pdlc/workflows/__tests__/shipPhase.test.js` | `pdlc/skills/ship-pr/SKILL.md` | S | ✅ |
| 26 | TASK-P6-02 | Implement `parsePrUrl` / `parseCiStatus` | Implement TSPEC-SHIP-03: reverse-scan trailer parsers m … | pending\ | passed\ | failed\ | unknown  (case-insensitive value, ignore trailing prose … | `pdlc/workflows/__tests__/shipPhase.test.js` | `pdlc/workflows/orchestrate-dev.js` | S | ✅ |
| 27 | TASK-P6-03 | Implement `raisePrAndVerifyCi` poll loop | Implement TSPEC-SHIP-01/02/04:  PHASE PUB ENABLED  flag … | `pdlc/workflows/__tests__/shipPhase.test.js` | `pdlc/workflows/orchestrate-dev.js` | M | ✅ |
| 28 | TASK-P6-04 | Wire Phase PUB into `main()` and final report | Implement TSPEC-SHIP-05: add Phase PUB after Phase H, … |  pdlc/workflows/  tests  /shipPhase.test.js ,  pdlc/wor … | `pdlc/workflows/orchestrate-dev.js` | M | ✅ |
