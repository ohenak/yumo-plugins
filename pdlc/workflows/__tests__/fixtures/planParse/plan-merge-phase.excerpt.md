<!--
  Fixture excerpted verbatim (long table cells truncated to keep the file small —
  truncation touches description-style cells only, never an id, dependency or
  batch cell) from:
    docs/completed/pdlc-merge-phase/PLAN-pdlc-merge-phase.md
  The real task table (17 tasks) preceded by a risk register that also
  carries an id column — the parse this fix must preserve unchanged.
-->

<!-- docs/completed/pdlc-merge-phase/PLAN-pdlc-merge-phase.md lines 216-223 — risk register — id column, no dependencies column -->

| ID | Risk | Owning task | Mitigation, and what it costs if it fires |
| --- | --- | --- | --- |
| K-1 |    git rebase --empty=drop  requires git ≥ 2.26.   TSPE … | A6; local reading by V1, two-runner reading in Phase DO … |   Measure, do not assume  : run  git --version  on  ubu … |
| K-2 |   The bash / CI matrix.   Five checks gate Phase PUB, i … | D2, V1 | Run  build-runtime.mjs --check  locally before pushing; … |
| K-3 |   The   recordHalt  rename can go vacuous, not red. … | R1 | R1's red-first list makes the negative assertion (no se … |
| K-4 |   Parallel worktrees and last-writer-wins.   Two tasks … | all | §4's manifest is the audit surface; §5's derivation was … |
| K-5 |   Permanent  refused  in this repo.   Every PR this que … | A7 | Expected, not a defect. The  merged  path is evidenced … |
| K-6 |   Document-oracle false positives from untracked files. … | V1 | If a document oracle is red locally but green in CI, ch … |

<!-- docs/completed/pdlc-merge-phase/PLAN-pdlc-merge-phase.md lines 348-366 — the real task table (17 tasks) -->

| Task ID | Description | Test File | Source File | Batch | Dependencies | Status |
| --- | --- | --- | --- | --- | --- | --- |
| F1 |    Fake first    Shared doubles,   seeded generators … | `pdlc/workflows/__tests__/mergeDoubles.test.js` |  pdlc/workflows/  tests  /helpers/mergeDoubles.js ,  pd … | 1 | - | ⬚ |
| R1 | Seam + disposition rename —   whole-repo, and the whole … |  pdlc/workflows/  tests  /haltAndQueue.test.js ,  pdlc/ … |  pdlc/workflows/orchestrate-dev.js ,  pdlc/workflows/or … | 1 | - | ⬚ |
| A1 | Constants and the configuration reader — TSPEC §2.2, §3 … | `pdlc/workflows/__tests__/mergeConfig.test.js` | `pdlc/workflows/orchestrate-dev.js` | 2 | F1, R1 | ⬚ |
| B1 |  Evidence  column pure helpers — TSPEC §8.5, §2.5.  ens … | `pdlc/workflows/__tests__/mergeQueueWriteback.test.js` | `pdlc/workflows/orchestrate-queue.js` | 2 | F1, R1 | ⬚ |
| A2 | Command catalogue and pure classifiers — TSPEC §4.1–§4. … | `pdlc/workflows/__tests__/mergeObservations.test.js` | `pdlc/workflows/orchestrate-dev.js` | 3 | A1 | ⬚ |
| B2 | Evidence-carrying row transform — TSPEC §8.3, §8.4.  up … |  pdlc/workflows/  tests  /mergeQueueWriteback.test.js , … | `pdlc/workflows/orchestrate-queue.js` | 3 | B1 | ⬚ |
| A3 | Self-modification guard — TSPEC §6.1–§6.4.  effectiveGu … | `pdlc/workflows/__tests__/mergeGuard.test.js` | `pdlc/workflows/orchestrate-dev.js` | 4 | A2 | ⬚ |
| B3 | Queue driver transition — TSPEC §9.1–§9.4.  runPicked … | `pdlc/workflows/__tests__/mergeQueueDriver.test.js` | `pdlc/workflows/orchestrate-queue.js` | 4 | B2 | ⬚ |
| A4 | Candidate chain and the pure decision core — TSPEC §5.1 … | `pdlc/workflows/__tests__/mergeDecision.test.js` | `pdlc/workflows/orchestrate-dev.js` | 5 | A3 | ⬚ |
| A5 | Transport and the six observations — TSPEC §4.1–§4.6. … | `pdlc/workflows/__tests__/mergeObservations.test.js` | `pdlc/workflows/orchestrate-dev.js` | 6 | A4, A2 | ✅ |
| A6 | Merge execution and post-merge helpers — TSPEC §4.7, §7 … | `pdlc/workflows/__tests__/mergePostMerge.test.js` | `pdlc/workflows/orchestrate-dev.js` | 7 | A5 | ⬚ |
| D1 | Adapter transport — TSPEC §11.3.  rtGhRun  with  rtGit … | `pdlc/workflows/__tests__/mergeAdapter.test.js` | `pdlc/workflows/runtime-adapter.js` | 7 | A5 | ⬚ |
| A7 | The  phaseMerge  orchestrator — TSPEC §2.1, §3.3, §5.2, … | `pdlc/workflows/__tests__/mergePhase.test.js` | `pdlc/workflows/orchestrate-dev.js` | 8 | A6, A4 | ⬚ |
| A8 | Pipeline wiring and the report — TSPEC §10.1, §10.4.  m … |  pdlc/workflows/  tests  /mergePhase.test.js ,  pdlc/wo … | `pdlc/workflows/orchestrate-dev.js` | 9 | A7, B3 | ⬚ |
| A9 |  RLH-AT-32-orch    re-expression only   — TSPEC §13.4, … | `pdlc/workflows/__tests__/haltAndQueue.test.js` | *(none — test-only)* | 10 | A8 | ⬚ |
| D2 | Bundle generation — TSPEC §11.2, §11.4.  DEV META.phase … | `pdlc/workflows/__tests__/runtimeBundle.test.js` |  pdlc/workflows/build-runtime.mjs ,  pdlc/workflows/dis … | 11 | A8, A9, D1, B3 | ⬚ |
| V1 | Whole-suite verification and consumer sync — §10 below. … | *(whole suite)* | *(none)* | 12 | D2 | ⬚ |
