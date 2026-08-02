# PLAN — pdlc-merge-phase

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → **PLAN** |
| Downstream | PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{pm,te}-TSPEC-v1.md`, `-v2.md`, `-v3.md` |
| LEARNINGS | `docs/pdlc-merge-phase/LEARNINGS-pdlc-merge-phase.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-02 |

## 1. Summary

Build **Phase MERGE** — the last phase of `orchestrate-dev` — per TSPEC v1.2 against FSPEC v1.3 and
REQ v1.1. Four files change:

| File | What lands |
|---|---|
| `pdlc/workflows/orchestrate-dev.js` | constants, config reader, `mergeCommandFor` + six observations over one `_ghRun` transport, the pure `decideMerge` core, the self-modification guard, merge execution, the post-merge M1–M5 sequence, `phaseMerge`, `main()` wiring, three report fields |
| `pdlc/workflows/orchestrate-queue.js` | the `Evidence` column helpers, `updateQueueStatus`/`rewriteStatus` evidence parameters, the `recorded` disposition catalogue, `runPicked`'s `done` transition |
| `pdlc/workflows/runtime-adapter.js` | `rtGhRun` + one `rtDevInjections` key |
| `pdlc/workflows/build-runtime.mjs` | both entrypoint closures (seam rename), `DEV_META.phases`, and the rebuilt `dist/` artifacts |

17 tasks in 12 derived batches. The batch count is high for the task count because **rule 2 below
forces every task touching the same physical file into a different batch**, and `orchestrate-dev.js`
is touched by nine of them. Cross-file parallelism is the only parallelism available: the
`orchestrate-dev` chain (A), the `orchestrate-queue` chain (B) and the adapter task (D1) run
alongside one another, not the tasks within a chain.

## 2. TDD discipline, and one declared deviation

**Every task is a red → green → refactor unit**, executed by one `se-implement` agent whose own SKILL
enforces red-first. Normative per task, without exception:

1. Write the named tests **first** and observe them fail for the stated reason.
2. Implement the minimum that turns them green.
3. `cd pdlc/workflows && npm test -- <the task's test file>` must pass **before the commit**, and
   `npm test` (whole suite) must pass before the task is reported done. Never `npx jest` — the repo's
   runner is `npm test --`.
4. Commit on `feat-pdlc-merge-phase` only; re-verify the branch immediately before committing.

**Declared deviation from the se-author SKILL's batch-safety rule 3.** The SKILL asks for a separate
red-test row per implementation row, joined by a `Deps` edge. This PLAN does **not** split them, and
says so rather than quietly complying in form: because rule 2 already serializes every same-file task
into its own batch, a separate red row for the same test file would land in its own batch too —
doubling 17 tasks to 34 and 12 batches to ~23 — while the red-before-green ordering it protects is
performed atomically inside one agent's TDD loop, on a chain that is already fully serial per file. No
concurrency exists between the red and green halves for a reviewer to protect. Instead, **every task
row names the acceptance tests it must red first**, which is the property the rule exists to secure.
If the tech-lead's PLAN-lint rejects this shape, the mechanical fix is to split each row in two with
the green row depending on the red row; the batch numbers then re-derive automatically.

The `[Fake first]` obligation **is** honoured: **F1** is a batch-1 task owning every shared test
double and golden fixture, and every downstream task depends on it (rule 4).

## 3. Task table — see §12

The machine-parsed task table is **§12, the last section of this document**, and it is placed there
deliberately.

`parsePlanTasks` (`orchestrate-dev.js:450`) locates its header row and then treats **every subsequent
pipe row in the file** as a task row, skipping only markdown separators. Any table after the task
table is therefore parsed as tasks: both shipped PLANs in `docs/completed/` demonstrate the effect —
`pdlc-review-loop-hardening` parses to 289 "tasks" against 31 real ones and
`pdlc-workflow-distribution` to 247, and `computeTopologicalBatches` throws
`PLAN dependency graph contains a cycle` on both. That is a pre-existing parser limitation, not a
defect this feature introduces, and the tech-lead's agent path is what has carried those PLANs.

There is a second, sharper hazard, found while verifying this document: the header predicates are
**loose substring tests** (`c.includes("id")`, `c.includes("depend")`), so an ordinary *data* row can
be selected as the header. This PLAN's own risk register did exactly that — `forbids` contains `id`
and `depends on` contains `depend`, so row K-1 was chosen as the header and the whole table below it
was parsed as tasks. The two words are reworded in §8 for that reason alone, and the effect is worth
knowing before anyone edits this file: **prose in a table cell can silently capture the parser.**

With the table last and those two words changed, this document parses **exactly** — 17 tasks, twelve
waves, no cycle, no wave above the dispatcher's five-task cap, every description substantive —
verified by running this file through `parsePlanTasks` and `computeTopologicalBatches` directly. Any
edit to §1–§11 should re-run that check. §4–§11 are prose a human reads; §12 is the table a machine
reads.

## 4. Per-batch file-ownership manifest

Rule 2's premise, made mechanically auditable. Tasks in the same batch may run in **parallel
worktrees**, so no file may appear twice in a row below. Verified: no row has a repeated path.

| Batch | Task | Files created or appended |
|---|---|---|
| 1 | F1 | `__tests__/helpers/mergeDoubles.js`, `__tests__/helpers/mergeDoubles.test.js`, `__tests__/fixtures/queue-goldens/` |
| 1 | R1 | `orchestrate-dev.js`, `orchestrate-queue.js`, `build-runtime.mjs`, `__tests__/haltAndQueue.test.js`, `__tests__/runtimeBundle.test.js`, `__tests__/orchestrateQueue.test.js` |
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
| 9 | A8 | `orchestrate-dev.js`, `__tests__/mergePhase.test.js`, `__tests__/pipelineWiring.test.js`, `__tests__/reportTemplates.test.js` |
| 10 | A9 | `__tests__/haltAndQueue.test.js` |
| 11 | D2 | `build-runtime.mjs`, `dist/*`, `__tests__/runtimeBundle.test.js` |
| 12 | V1 | *(none)* |

Paths are relative to `pdlc/workflows/`. Four files are written by more than one task —
`orchestrate-dev.js` (9), `orchestrate-queue.js` (4), `runtimeBundle.test.js` (2, R1 and D2),
`haltAndQueue.test.js` (2, R1 and A9), `mergeObservations.test.js` (2, A2 and A5),
`mergeQueueWriteback.test.js` (2, B1 and B2), `build-runtime.mjs` (2, R1 and D2) — and **every one of
those pairs is separated by a real `Deps` edge**, never by a prose note.

## 5. Dependency notes and the batch derivation

**The `Batch` column re-derives.** Verified mechanically against this repo's own dispatcher: feeding
this document to `parsePlanTasks` yields 17 tasks, and `computeTopologicalBatches` produces exactly
the twelve waves the column states — `F1,R1` / `A1,B1` / `A2,B2` / `A3,B3` / `A4` / `A5` / `A6,D1` /
`A7` / `A8` / `A9` / `D2` / `V1`. No wave exceeds the dispatcher's five-task sub-batch cap, so no
wave is silently split.

Edges that are not obvious from the file list:

- **A5 → A2** as well as A4: the transport-level observation tests append to the same test file A2
  created, so the edge is required by rule 2 even though A5's dependency on A4 already orders it.
- **A8 → B3**: `main()`'s report wiring is asserted end-to-end through the queue driver's
  pass-through, so the driver must exist first.
- **D2 → A9**: the bundle rebuild must not run against a test suite still asserting the superseded
  `RLH-AT-32-orch`; otherwise a green rebuild would certify a suite that is about to change.
- **R1 first, and alone in its chain**: the seam rename is the one cross-cutting edit. Doing it in
  batch 1 rather than at the end means every later task writes the new name once, instead of every
  later task being rewritten by a late rename.
- **F1 before everything**: rule 4's shared-prerequisite obligation. The goldens in particular must be
  captured **before B2 changes `updateQueueStatus`**, which the `F1 → B1 → B2` chain guarantees.

## 6. Integration points

| Point | Task | Existing code it meets |
|---|---|---|
| Pipeline body | A8 | `main()`'s guarded `pipelineFn` block, immediately after Phase PUB (`orchestrate-dev.js:5115`) |
| Halt reporting | A8, R1 | `buildFinalReport` (`:5281`) and the halt path's `queueRow` handling (`:5162`–`:5175`) |
| Queue recording channel | R1, B2 | `rewriteStatus` (`orchestrate-queue.js:876`), `commitQueueRow` (`:935`), `uncommitted` (`:967`) |
| Queue driver | B3 | `runPicked` (`:760`), `buildQueueReport` (`:994`) |
| Runtime injection | D1, D2 | `rtDevInjections` (`runtime-adapter.js:980`), both entrypoint closures (`build-runtime.mjs:182`, `:212`) |
| CI classification | A5 | `checkPrCi` (`orchestrate-dev.js:3485`) — reused, never re-derived |
| Git transport | A6 | `defaultGit` (`:4252`) — reused for all seven M3 commands |
| Seam classification | A8 | `runtimeBundle.test.js`'s RLH-AT-64 (`:986`) and RLH-SCAN-01 await discipline (`:577`) |

## 7. Absorbed review items

**TE-v3 (low) — `not-confirmed` belongs to the shared reason catalogue.** TSPEC §4.1 declares one
frozen `reason` catalogue (`command-failed`, `unparseable`, `field-absent`, `unrecognised-value`,
`incomplete`) and §4.7 later introduces `not-confirmed` for a zero-exit merge whose read-back does not
confirm `MERGED`. Left as written, §4.7 would carry a private second set — exactly the two-catalogues
defect DC-01 forbids. **Task A6 owns the fix**: extend §4.1's frozen catalogue with `not-confirmed` in
the same commit that introduces `executeMerge`, and assert membership (`REASONS.includes(r.reason)`)
for every failure the observation and execution paths can produce, so a future private value reds. No
TSPEC edit is required — the catalogue is declared frozen and enumerable precisely so it can absorb a
member without a second list appearing.

## 8. Risk register

| ID | Risk | Owning task | Mitigation, and what it costs if it fires |
|---|---|---|---|
| K-1 | **`git rebase --empty=drop` requires git ≥ 2.26.** TSPEC §7.4 relies on it to drop queue-row commits already upstream. DC-02 bars any platform fact inferred from documentation | A6, verified by V1 | **Measure, do not assume**: run `git --version` on `ubuntu-latest` and `macos-latest` in CI and record both in the task's commit message. If either is older, fall back to a plain `git rebase FETCH_HEAD` and record the change in the TSPEC — the fallback still fast-forwards and still drops already-applied patches, it merely relies on the backend default |
| K-2 | **The bash / CI matrix.** Five checks gate Phase PUB, including `npm test` on both platforms and `bash -n` over every tracked `*.sh`. This feature adds no shell script, but D2 regenerates tracked artifacts that the *Generated artifacts are in sync* job re-derives independently | D2, V1 | Run `build-runtime.mjs --check` locally before pushing; a stale `dist/` is the single most likely red in this feature. No `*.sh` changes means the shell jobs are untouched — if one goes red, the cause is not this diff |
| K-3 | **The `_recordHalt` rename can go vacuous, not red.** `runtimeBundle.test.js:1038` opens `if (!recordHalt) return;`, so a rename without a test update silently stops asserting | R1 | R1's red-first list makes the negative assertion (no seam named `_recordHalt` remains) the first test written, so the trap is closed in the same task that opens it |
| K-4 | **Parallel worktrees and last-writer-wins.** Two tasks in one wave writing one file lose each other's content silently while the suite stays green on the survivor | all | §4's manifest is the audit surface; §5's derivation was checked with the real dispatcher. Any new task must be added to both or it is unreviewed |
| K-5 | **Permanent `refused` in this repo.** Every PR this queue raises touches `pdlc/workflows/` or `pdlc/skills/`, so Phase MERGE will report `refused` in `yumo-plugins` for ever (FSPEC §4.5, BL-04) | A7 | Expected, not a defect. The `merged` path is evidenced entirely through A7's 25-row suite driving the observation points. V1's report states it explicitly so the first operator does not file it |
| K-6 | **Document-oracle false positives from untracked files.** `coveredViolations` walks the whole tree except `.git/` and `node_modules/`; a tool cache such as `.tokensave/tokensave.db` fails it for reasons unrelated to the diff | V1 | If a document oracle is red locally but green in CI, check for untracked files **before** touching code. V1 records the check rather than fixing the oracle |

## 9. The rebuild-in-the-same-commit rule

`pdlc/workflows/dist/` is **generated and tracked**. The rule, non-negotiable:

> Any commit that changes `orchestrate-dev.js`, `orchestrate-queue.js`, `runtime-adapter.js` or
> `build-runtime.mjs` and is the **last** such commit before the PR is pushed must be accompanied by
> `node pdlc/workflows/build-runtime.mjs` with the regenerated artifacts staged in that same commit.

In this PLAN that commit is **D2's**, which is why D2 depends on every source-touching task. Tasks A1–A8,
B1–B3, D1 and R1 deliberately do **not** rebuild: eleven intermediate rebuilds would produce eleven
churned binaries-in-text and a merge conflict on every one. The consequence is that the tree is
knowingly stale between R1 and D2 — acceptable because nothing executes the bundle during
implementation, and CI's freshness job only ever sees the pushed branch. `sync-workflows.sh` is a
**consumer** step and is never run by an implementation task; the untracked `.claude/workflows/` copy
is not part of this feature's diff.

## 10. Final verification checklist

Owned by **V1**, run from the repository root, in this order:

1. `cd pdlc/workflows && npm test` — the whole suite, not just the new files. Never bare `npx jest`.
2. `node pdlc/workflows/build-runtime.mjs --check` — exits 0 only if `dist/` matches the sources.
   A non-zero exit here means D2's rebuild was missed or a later commit changed a source.
3. `pdlc/hooks/scripts/sync-workflows.sh --check` — invoked **by bare path**, no `bash` prefix; exit
   126 means the execute bit was lost. Advisory for this feature (the consumer copy is untracked), but
   a non-zero exit that names a `local-edit` or `unverified` row must be read before it is forced.
4. Document oracles — `npm test -- documentOracles`. **Before treating a red as a defect**, check for
   untracked files (K-6): `git status --porcelain --ignored | head`. A tool cache in the tree fails
   `coveredViolations` for reasons that have nothing to do with this diff.
5. Record in V1's commit message: the two `git --version` readings from CI (K-1), and the confirmation
   that `mergeStatus` is `refused` for this repo's own PRs by design (K-5).

A failure at any step **re-opens the owning task**; it is never patched at this step. V1 changes no
production code.

## 11. Definition of Done

- [ ] All 17 tasks ✅, each committed on `feat-pdlc-merge-phase` with its tests written first
- [ ] Every task's own test file green via `npm test -- <file>`, and the whole suite green
- [ ] FSPEC §11's 25 rows each have a passing case, and the suite asserts its own case count is 25
- [ ] AT-M1, AT-M2, AT-M2a, AT-M3 (both arms), AT-M4, AT-M5, AT-M6 all present and passing
- [ ] `RLH-AT-32-orch` re-expressed **and** its merged sibling passing (A9)
- [ ] No seam named `_recordHalt` remains anywhere; `QUEUE_ROW_DISPOSITIONS` is the only catalogue
- [ ] RLH-AT-64 green with `_ghRun` **wired and not exempt**, and RLH-SCAN-01 green — every injected IO
      call awaited
- [ ] `build-runtime.mjs --check` exits 0 with `dist/` committed in D2's commit
- [ ] The `not-confirmed` reason is a member of §4.1's single frozen catalogue (§7)
- [ ] `git --version` measured on both CI runners and recorded (K-1)
- [ ] No new agent dispatch anywhere in the diff (NFR-4), and no override of the guard (NFR-3)
- [ ] This PLAN still parses to exactly 17 tasks / 12 waves via `parsePlanTasks` +
      `computeTopologicalBatches` (§3), if any section above §12 was edited

## 12. Task table (machine-parsed — the last table in this document)

Column grammar matches `parsePlanTasks` (`orchestrate-dev.js:399`–`:473`): the id column is matched by
`includes("id")`, the description by `includes("desc")` **excluding the id column**, dependencies by
`includes("depend")`, batch by `includes("batch")`. Deps are comma-separated ids; `-` means none.

**Status key:** ⬚ Not Started | 🔴 Red | 🟢 Green | 🔵 Refactored | ✅ Done.
Every description ends with the red-first ATs; every task runs `npm test -- <Test File>` green before
its commit (§2 rule 3).

| Task ID | Description | Test File | Source File | Batch | Dependencies | Status |
|---|---|---|---|---|---|---|
| F1 | **[Fake first]** Shared doubles and goldens for every downstream task — TSPEC §13.1's six doubles (`fakeGhRun` returning `{ok,stdout,stderr}`, `passingGh`, `fakeGit` recording argv in order, `fakeQueueFs`, `recordingRecordQueueRow`, fixed `_now`/`_sleep`/`_enabled`) plus TSPEC §13.5's byte-identity goldens **captured from `updateQueueStatus` at HEAD before any change**, one per `QUEUE_STATUSES` member. Red first: a self-test that `passingGh` answers all six surfaces and that each golden differs from the others | `pdlc/workflows/__tests__/helpers/mergeDoubles.test.js` | `pdlc/workflows/__tests__/helpers/mergeDoubles.js`, `pdlc/workflows/__tests__/fixtures/queue-goldens/` | 1 | - | ⬚ |
| R1 | Seam + disposition rename, whole-repo and mechanical — TSPEC §8.1, §8.2. `_recordHalt`→`_recordQueueRow` (`orchestrate-dev.js:4286`, `:4321`; both `build-runtime.mjs` closures `:182`, `:212`); `commitQueueRow`/`uncommitted` return `recorded`/`recorded (uncommitted)`; new frozen `QUEUE_ROW_DISPOSITIONS` export. Updates `haltAndQueue.test.js:383`,`:428`,`:831`,`:837`,`:857`,`:860` (`:428`'s inline literals → the export) and `runtimeBundle.test.js:1038`. Red first: **the negative assertion that no seam named `_recordHalt` remains** — closing the `if (!recordHalt) return;` vacuity trap | `pdlc/workflows/__tests__/haltAndQueue.test.js`, `pdlc/workflows/__tests__/runtimeBundle.test.js`, `pdlc/workflows/__tests__/orchestrateQueue.test.js` | `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/orchestrate-queue.js`, `pdlc/workflows/build-runtime.mjs` | 1 | - | ⬚ |
| A1 | Constants and the configuration reader — TSPEC §2.2, §3.1–§3.3. `PHASE_MERGE_ENABLED`, `MERGE_CONFIG_PATH`, frozen `MERGE_GUARD_DEFAULTS`/`MERGE_DEFAULTS`/`MERGE_MODES`/`MERGE_STATUSES`, `MERGE_MAX_RETRIES`, and `MERGE_MAX_DECISION_STEPS` **as the expression** `1+MERGE_MAX_RETRIES+4+3+1+5`; `parseMergeConfig` (4 steps, 7-key independent fallback, `sectionMalformed` only for step 3) and `readMergeConfigSafely`. Red first: E1–E5, the `mergeableRetries` boundary pair (10 accepted / 11 defaulted), `mergeableRetryDelay`'s seconds unit, and the totality property | `pdlc/workflows/__tests__/mergeConfig.test.js` | `pdlc/workflows/orchestrate-dev.js` | 2 | F1, R1 | ⬚ |
| B1 | `Evidence` column pure helpers — TSPEC §8.5, §2.5. `ensureEvidenceColumn` (header + separator + one empty cell per other data row, never migrating twice) and `mergeEvidenceCell` (no-downgrade rule). Red first: AT-M1's structural assertions on a five-column queue, and a cell already holding `{shortSha} #{n}` surviving a `merged #{n}` re-entry | `pdlc/workflows/__tests__/mergeQueueWriteback.test.js` | `pdlc/workflows/orchestrate-queue.js` | 2 | F1, R1 | ⬚ |
| A2 | Command catalogue and pure classifiers — TSPEC §4.1–§4.7 (pure half). `mergeCommandFor` as the single home of all `gh` strings, `parsePrRef`, `classifyPrState` (per-field sentinel for `mergeable`/`mergeStateStatus`/`number`, whole-observation failure only for `state`), `classifyReviewThreads`, `classifyRepoCaps`, `classifyChangedFiles`, `classifyMergeResult`, and the shared frozen `reason` catalogue. Red first: TSPEC §3.2's whole recognised-value table, `mergeCommandFor`'s exact bytes per surface, and `parsePrRef` on malformed URLs | `pdlc/workflows/__tests__/mergeObservations.test.js` | `pdlc/workflows/orchestrate-dev.js` | 3 | A1 | ⬚ |
| B2 | Evidence-carrying row transform — TSPEC §8.3, §8.4. `updateQueueStatus`'s 4th parameter (`evidence == null` ⇒ today's path byte-for-byte; else migrate, apply §2.5's non-overwrite rule returning `written:false` with `foundStatus`, then set both cells) and `rewriteStatus`'s appended 7th parameter, with the write and commit skipped when `written === false`. Red first: **the byte-identity differential against F1's goldens**, the three non-overwrite conjuncts (bytes unchanged, zero `fakeGit` argv, `detail` names the status found), and AT-M2's no-commit idempotence | `pdlc/workflows/__tests__/mergeQueueWriteback.test.js`, `pdlc/workflows/__tests__/orchestrateQueue.test.js` | `pdlc/workflows/orchestrate-queue.js` | 3 | B1 | ⬚ |
| A3 | Self-modification guard — TSPEC §6.1–§6.4. `effectiveGuardPaths` (defaults first and unconditional, trailing-slash normalisation, non-strings dropped) and `guardVerdict` (`startsWith`, no regex; `ok !== true` ⇒ fires). Red first: **AT-M3's two arms**, the three near-miss lists reproducing arm A exactly, additivity over a removal-shaped config entry, and §6.3's scoped no-override assertion — arity plus a token scan of the two extracted function bodies plus the `config`-shaped-third-argument case | `pdlc/workflows/__tests__/mergeGuard.test.js` | `pdlc/workflows/orchestrate-dev.js` | 4 | A2 | ⬚ |
| B3 | Queue driver transition — TSPEC §9.1–§9.4. `runPicked` derives `done` from `report.mergeStatus === "merged"` (defensively: a missing field falls back to `awaiting-merge`), passes **no** evidence, and branches the operator message so the "merge the PR, then set it to done" sentence is not emitted on the merged path. `buildQueueReport` verified as already passing `pipelineReport` whole. Red first: **AT-M4**, the `undefined mergeStatus` fallback, Q-02's mutual-exclusion boundary, and the pass-through of `mergeStatus`/`mergeSha`/escalations | `pdlc/workflows/__tests__/mergeQueueDriver.test.js` | `pdlc/workflows/orchestrate-queue.js` | 4 | B2 | ⬚ |
| A4 | Candidate chain and the pure decision core — TSPEC §5.1–§5.6. `mergeCandidates` (squash only under `allowSquashMerge`, absent from the array otherwise) and `decideMerge` returning `need`/`act`/`resolved`, each resolution carrying its **FSPEC §11 row id** per §5.3's 24-guard table. Red first: one case per guard asserting the §11 row id (notably guard 2 ⇒ row 6, guard 4 ⇒ row 8, guards 7/8 ⇒ rows 4/5, guard 17 ⇒ row 13a), both §2.3 tie-break pairs, the short-circuit property, and the termination bound asserted **as the relation** recomputed from the constants | `pdlc/workflows/__tests__/mergeDecision.test.js` | `pdlc/workflows/orchestrate-dev.js` | 5 | A3 | ⬚ |
| A5 | Transport and the six observations — TSPEC §4.1–§4.6. `defaultGhRun` returning `{ok,stdout,stderr}` with `defaultGit`'s exact catch shape, module-private `ghJson`, and `observePrState`/`observeCi`/`observeReviewThreads`/`observeRepoCaps`/`observeChangedFiles` — including §3.3's re-observation counting, `O3`'s bounded cursor pagination, and `O5`'s four-verdict completeness rule with the `--paginate --slurp` fallback. Red first: E6/E7, observation counts for `mergeableRetries` ∈ {0,1,3} including the `after 1 observations` wording, `O3` at 1/3/over-bound pages, and `O5`'s empty-list-is-valid case | `pdlc/workflows/__tests__/mergeObservations.test.js` | `pdlc/workflows/orchestrate-dev.js` | 6 | A4, A2 | ⬚ |
| A6 | Merge execution and post-merge helpers — TSPEC §4.7, §7.2–§7.4. `executeMerge` (one merge command, always a read-back, zero-exit-unconfirmed counts as failure) with `detail` = first line of `stderr` and the `"merge not confirmed"` token when empty; `evidenceCellFor`'s fixed 7-character truncation; `deleteRemoteBranch`; `updateDefaultBranch`'s seven-step argv sequence with `--empty=drop` and the ancestry confirmation. **Also folds `not-confirmed` into §4.1's shared reason catalogue (§7 below).** Red first: the zero-exit-unconfirmed arm, a `stderr`-bearing failure reaching `attempts[].detail`, each M3 failure step naming its reason, and the reported branch on failure | `pdlc/workflows/__tests__/mergePostMerge.test.js` | `pdlc/workflows/orchestrate-dev.js` | 7 | A5 | ⬚ |
| D1 | Adapter transport — TSPEC §11.3. `rtGhRun` with `rtGit`'s JSON-object reply (`runtime-adapter.js:932`–`:938`), the at-most-once mutation sentence and the do-not-retry clause, plus `_ghRun` in `rtDevInjections`. Red first: the injection key is present; the prompt interpolates only the command it was handed; **both prompt clauses**; and the three reply arms — `ok:true` ⇒ `{ok,stdout,stderr:""}`, `ok:false` **preserving `stderr`**, unparseable ⇒ `"unparseable adapter response"` | `pdlc/workflows/__tests__/mergeAdapter.test.js` | `pdlc/workflows/runtime-adapter.js` | 7 | A5 | ⬚ |
| A7 | The `phaseMerge` orchestrator — TSPEC §2.1, §3.3, §5.2, §7.1, §7.5, §10.2, §10.3. The demand loop, the outer `try/catch` that makes the phase never throw, the M1–M5 straight-line sequence, `prNumber` resolution (`parsePrRef` → `o1.number` → skip with a note), the frozen `MERGE_ESCALATIONS` and `MERGE_NOTES` catalogues including FSPEC §8.2's ahead-of-remote note gated on disposition `recorded`, and the phase row's glyphs (never `❌`). Red first: **the 25-row §11 table** driven by `passingGh`, rows 1–2 issuing no command at all, row 1 never calling `_readFile`, row 3 issuing `gh repo view` and nothing else, rows 19–22 as overlays plus **AT-M6**, and a throwing `_ghRun` resolving `row: "internal"` | `pdlc/workflows/__tests__/mergePhase.test.js` | `pdlc/workflows/orchestrate-dev.js` | 8 | A6, A4 | ⬚ |
| A8 | Pipeline wiring and the report — TSPEC §10.1, §10.4. `main()` gains `_phaseMergeEnabled` and `_ghRun`, calls `phaseMerge` after Phase PUB inside the same guarded body, forwards `_git`/`_readFile`/`_recordQueueRow`/`_now`/`_sleep`, pushes escalations then notes onto `notices`, and `buildFinalReport` emits `mergeStatus`/`mergeSha`/`mergeMethod` unconditionally with `queueRow` carrying the disposition on a merged run. Red first: the three fields present on **every** report including the halt path (row 23), and RLH-AT-64 still green for both new seams | `pdlc/workflows/__tests__/mergePhase.test.js`, `pdlc/workflows/__tests__/pipelineWiring.test.js`, `pdlc/workflows/__tests__/reportTemplates.test.js` | `pdlc/workflows/orchestrate-dev.js` | 9 | A7, B3 | ⬚ |
| A9 | `RLH-AT-32-orch` supersession — TSPEC §13.4, FSPEC §7.5 (F-13). Re-express the existing case as "a successful direct run **that did not merge** records no status", with `mergeStatus` pinned to a non-merged value so the premise is explicit, and add the sibling `RLH-AT-32-orch-merged` asserting a merged direct run records `done` and reports `queueRow: "recorded"`. Test-only task. Red first: the sibling case, which must fail against A8's predecessor and pass after it | `pdlc/workflows/__tests__/haltAndQueue.test.js` | *(none — test-only)* | 10 | A8 | ⬚ |
| D2 | Bundle generation — TSPEC §11.2, §11.4. `DEV_META.phases` gains the Phase MERGE row; confirm `exportedNames` needs no addition (the adapter reaches nothing in `__dev`); run `node pdlc/workflows/build-runtime.mjs` and commit the regenerated `dist/` artifacts **in this task's commit**. Red first: `runtimeBundle.test.js` additions asserting the new phase row in `DEV_META`, that both entrypoints inject `_recordQueueRow`, and that the freshness check passes | `pdlc/workflows/__tests__/runtimeBundle.test.js` | `pdlc/workflows/build-runtime.mjs`, `pdlc/workflows/dist/` | 11 | A8, A9, D1, B3 | ⬚ |
| V1 | Whole-suite verification and consumer sync — §10 below. Run the four checks, reconcile any document-oracle noise against untracked files, and record the git version measured on both CI runners for the `--empty=drop` risk. No production code changes; a failure here re-opens the owning task rather than being patched at this step | *(whole suite)* | *(none)* | 12 | D2 | ⬚ |
