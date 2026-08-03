<!--
  Fixture excerpted VERBATIM (no truncation — every cell below is byte-identical
  to the source) from:
    docs/completed/pdlc-merge-phase/PLAN-pdlc-merge-phase.md lines 88-133
  §4 "Per-batch file-ownership manifest": the real, shipped manifest table this
  parser must read, followed by the §4 "Writers" table that must NOT qualify
  (its header names a `File` column and a `Writers` column, neither of which is
  an exact-cell match for a task or a files column).
-->

## 4. Per-batch file-ownership manifest

Rule 2's premise, made mechanically auditable. Tasks in the same batch may run in **parallel
worktrees**, so no file may appear twice in a row below. Verified: no row has a repeated path.

| Batch | Task | Files created or appended |
|---|---|---|
| 1 | F1 | `__tests__/helpers/mergeDoubles.js` (doubles **and** PROPERTIES §1.2's seeded generators), `__tests__/mergeDoubles.test.js`, `__tests__/fixtures/queue-goldens/` |
| 1 | R1 | `orchestrate-dev.js`, `orchestrate-queue.js`, `build-runtime.mjs`, `__tests__/haltAndQueue.test.js`, `__tests__/runtimeBundle.test.js`, `__tests__/orchestrateQueue.test.js`, `__tests__/helpers/seams.js`, `__tests__/pipelineWiring.test.js`, `__tests__/pacingWrapper.test.js`, `__tests__/forcePhases.test.js` |
| 2 | A1 | `orchestrate-dev.js`, `__tests__/mergeConfig.test.js` |
| 2 | B1 | `orchestrate-queue.js`, `__tests__/mergeQueueWriteback.test.js` |
| 3 | A2 | `orchestrate-dev.js`, `__tests__/mergeObservations.test.js` |
| 3 | B2 | `orchestrate-queue.js`, `__tests__/mergeQueueWriteback.test.js`, `__tests__/orchestrateQueue.test.js` |
| 4 | A3 | `orchestrate-dev.js`, `__tests__/mergeGuard.test.js` |
| 4 | B3 | `orchestrate-queue.js`, `__tests__/mergeQueueDriver.test.js` |
| 5 | A4 | `orchestrate-dev.js`, `__tests__/mergeDecision.test.js` |
| 6 | A5 | `orchestrate-dev.js`, `__tests__/mergeObservations.test.js` |
| 7 | A6 | `orchestrate-dev.js`, `__tests__/mergePostMerge.test.js` |
| 7 | D1 | `runtime-adapter.js`, `__tests__/mergeAdapter.test.js` |
| 8 | A7 | `orchestrate-dev.js`, `__tests__/mergePhase.test.js` |
| 9 | A8 | `orchestrate-dev.js`, `__tests__/mergePhase.test.js`, `__tests__/haltAndQueue.test.js`, `__tests__/pipelineWiring.test.js`, `__tests__/reportTemplates.test.js`, `__tests__/runtimeBundle.test.js` |
| 10 | A9 | `__tests__/haltAndQueue.test.js` |
| 11 | D2 | `build-runtime.mjs`, `dist/*`, `__tests__/runtimeBundle.test.js` |
| 12 | V1 | *(none)* |

Paths are relative to `pdlc/workflows/`. **Ten** files are written by more than one task (TE F-06 —
v1.0 said "four" and then listed seven):

| File | Writers | Separated by |
|---|---|---|
| `orchestrate-dev.js` | R1, A1, A2, A3, A4, A5, A6, A7, A8 | the A-chain, one wave each |
| `orchestrate-queue.js` | R1, B1, B2, B3 | the B-chain |
| `runtimeBundle.test.js` | R1, A8, D2 | R1→…→A8→D2 |
| `haltAndQueue.test.js` | R1, A8, A9 | R1→…→A8→A9 |
| `pipelineWiring.test.js` | R1, A8 | R1→A1→…→A8 |
| `mergePhase.test.js` | A7, A8 | A7→A8 |
| `mergeObservations.test.js` | A2, A5 | A2→A5 |
| `mergeQueueWriteback.test.js` | B1, B2 | B1→B2 |
| `orchestrateQueue.test.js` | R1, B2 | R1→B1→B2 |
| `build-runtime.mjs` | R1, D2 | R1→…→D2 |

**Every one of those pairs is separated by a real `Deps` edge**, never by a prose note.
`helpers/seams.js`, `pacingWrapper.test.js` and `forcePhases.test.js` have exactly one writer (R1);
**`helpers/mergeDoubles.js` has exactly one writer (F1)**, which is what lets PROPERTIES §1.2 route
its generators there without a new file or a new batch — F1 is alone in wave 1 apart from R1, and R1
owns none of F1's paths, so the widening introduces no collision (PROPERTIES §8.6).

<!-- docs/completed/pdlc-merge-phase/PLAN-pdlc-merge-phase.md lines 216-223 — the risk register: it has an `ID` column AND an `Owning task` column, but no files column, so it must contribute nothing. -->


| ID | Risk | Owning task | Mitigation, and what it costs if it fires |
|---|---|---|---|
| K-1 | **`git rebase --empty=drop` requires git ≥ 2.26.** TSPEC §7.4 relies on it to drop queue-row commits already upstream. DC-02 bars any platform fact inferred from documentation | A6; local reading by V1, two-runner reading in Phase DOD/PUB | **Measure, do not assume**: run `git --version` on `ubuntu-latest` and `macos-latest` in CI and record both. V1 cannot take that reading — it runs before the PR exists — so V1 records the local version and the two-runner reading is taken at the first CI run (§10 step 5). If either runner is older, fall back to a plain `git rebase FETCH_HEAD`: **pre-approved, no re-review**, because the fallback still fast-forwards and still drops already-applied patches, it merely relies on the backend default |
| K-2 | **The bash / CI matrix.** Five checks gate Phase PUB, including `npm test` on both platforms and `bash -n` over every tracked `*.sh`. This feature adds no shell script, but D2 regenerates tracked artifacts that the *Generated artifacts are in sync* job re-derives independently | D2, V1 | Run `build-runtime.mjs --check` locally before pushing; a stale `dist/` is the single most likely red in this feature. No `*.sh` changes means the shell jobs are untouched — if one goes red, the cause is not this diff |
| K-3 | **The `_recordHalt` rename can go vacuous, not red.** `runtimeBundle.test.js:1038` opens `if (!recordHalt) return;`, so a rename without a test update silently stops asserting | R1 | R1's red-first list makes the negative assertion (no seam named `_recordHalt` remains) the first test written, so the trap is closed in the same task that opens it |
| K-4 | **Parallel worktrees and last-writer-wins.** Two tasks in one wave writing one file lose each other's content silently while the suite stays green on the survivor | all | §4's manifest is the audit surface; §5's derivation was checked with the real dispatcher. Any new task must be added to both or it is unreviewed |
| K-5 | **Permanent `refused` in this repo.** Every PR this queue raises touches `pdlc/workflows/` or `pdlc/skills/`, so Phase MERGE will report `refused` in `yumo-plugins` for ever (FSPEC §4.5, BL-04) | A7 | Expected, not a defect. The `merged` path is evidenced entirely through A7's 25-row suite driving the observation points. V1's report states it explicitly so the first operator does not file it |
| K-6 | **Document-oracle false positives from untracked files.** `coveredViolations` walks the whole tree except `.git/` and `node_modules/`; a tool cache such as `.tokensave/tokensave.db` fails it for reasons unrelated to the diff | V1 | If a document oracle is red locally but green in CI, check for untracked files **before** touching code. V1 records the check rather than fixing the oracle |
