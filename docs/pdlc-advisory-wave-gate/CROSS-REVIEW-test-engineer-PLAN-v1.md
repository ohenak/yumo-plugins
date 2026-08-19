# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md`
**Date:** 2026-08-19
**Iteration:** 1
**Scope:** Testing lens — testability, red-before-green ordering, batch/DAG mechanics, oracle
falsifiability, coverage claims. Every existing-behaviour claim below was checked against HEAD.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **A seventh transcription surface is missing from the plan: `advisoryQueueSeams.test.js:627`.** That line is `expect(report.advisory.rows).toHaveLength(5); // ADVISORY_SEAMS drives the row list (S-1)`. The queue's report rows come from the *shared* `advisorySummaryRows`, which maps `ADVISORY_SEAMS` (`pdlc/workflows/orchestrate-dev.js:2989-2992`; imported at `orchestrate-queue.js:41`, called at `orchestrate-queue.js:1319`). The moment A6-05 adds `A6` to `ADVISORY_SEAMS` the row list is six, so this test goes red **inside batch 2** — a GREEN batch whose gate is the whole `pdlc/workflows` suite (`.claude/pdlc.config.json` `implementation.testCommand`, verified). The file appears in neither the task table nor the file-ownership manifest, so no task is permitted to touch it, and the Overview's "Six shipped surfaces … verified" set-equality claim is false. Fix: add `pdlc/workflows/__tests__/advisoryQueueSeams.test.js` to A6-03's `Test File` cell and manifest row (batch 1), retargeting to six rows with A6 zero-valued, and correct the six-surface claim to seven. | Overview ¶"Two facts about this feature"; A6-03; manifest |
| F-02 | High | Local | **`advisoryDisabled.test.js`'s five-row assertion is retargeted eleven batches too late.** `advisoryDisabled.test.js:622` (`T-10-5 / PROP-DIS-05`, the *enabled*-but-quiet case) asserts `expect(result.advisory.rows).toHaveLength(5)`. By the same `advisorySummaryRows` mechanism as F-01, it reddens at batch 2, but the plan schedules its six-row retarget in A6-20 at **batch 13** — so batches 2, 4, 6, 8, 10 and 12, every one of which the plan itself declares must leave the whole suite green, cannot pass. Fix: move the six-row retarget of `advisoryDisabled.test.js` into batch 1 (own it from A6-03, or add a manifest row for it under a batch-1 task), leaving A6-20's disabled-path byte-identity work where it is. **Constraint on the F-01/F-02 fix:** batch 1 already holds exactly five tasks, which is `computeTopologicalBatches`' hard sub-batch cap (`orchestrate-dev.js:10803-10809`). A sixth batch-1 task splits the layer 5+1 and shifts every downstream `Batch` value by one, desyncing the entire column — so both retargets must be folded into *existing* batch-1 tasks, not added as new ones. | A6-20; A6-03; Batch gates |
| F-03 | High | Local | **A6-00's pre-flight probe names a symbol that is not exported, so batch 1 opens on a red the plan calls "PLAN invalid".** A6-00 asserts existence of `pathsCollide`, but it is declared `function pathsCollide(a, b)` with no `export` at `orchestrate-dev.js:4726` and is referenced by no test in the suite (only internally, `:10961`). An import-based existence assertion fails, and the batch-1 gate row states A6-00's assertions "must be green from the start; a moved red baseline means the PLAN is invalid". Fix: either drop `pathsCollide` from A6-00's list (it is already proved transitively by A6-07's `ownedSetCovers` trailing-slash cases) or add "export `pathsCollide`" to A6-05's green work and cite `:4726`. | A6-00; Batch gates row 1 |
| F-04 | Medium | Local | **The OQ-7 "upstream-pending" case has no stated mechanism, and the obvious idiom halts the wave.** A6-09 requires the `.gitignore`d-path round trip to be "written with its expected value named but marked upstream-pending", and the DoD repeats it. If that is written as `test.skip`/`describe.skip`, `checkWaveUnskips` (`orchestrate-dev.js:11213`; scanner `scanSkipTokens` at `:11146-11150` matches exactly `describe|test|it.skip`) attributes the block to the file's manifest owners when the title names no task id (`:11271-11277`) and halts the wave via `formatUnskipViolations` (`:11285`) once those owners are complete — i.e. wave 5 or any later wave. `test.todo` is *not* scanned. Fix: state the mechanism in A6-09's cell — `test.todo("AT-05-1 (OQ-7 pending): …")` or a commented case with the pending expectation in prose — and never `.skip`. | A6-09; Definition of Done |
| F-05 | Medium | Local | **A6-04's red is unobservable by any gate, so its red-before-green edge is asserted by nothing.** `implementation.testCommand` is `cd pdlc/workflows && npm test …` (verified in `.claude/pdlc.config.json`), so nothing in `pdlc/engine/__tests__/` runs at any wave gate. The Verification table discloses this, yet the batch-1 gate row still claims A6-04's expectation "fails for a named reason" and batch 2's claims it goes green — neither is checkable in-pipeline, and a wrong expectation surfaces only in Phase PUB's `Engine tests (ubuntu-latest)` check, after twelve batches of work. Fix: make `cd pdlc/engine && npm ci && npm test` an explicit obligation inside A6-04's and A6-06's cells and name it in the batch-1 and batch-2 gate rows. | A6-04; A6-06; Batch gates; Verification |
| F-06 | Medium | Local | **The engine-channel expectation is mis-homed in a required-check oracle.** `pdlc/engine/__tests__/ci-arrangement.test.js` is, by its own header (`:1-21`) and by the repo's own documentation, *the* oracle for FSPEC §5.1's CI arrangement — `pr-tests.yml` job-name expansion and the `publish.yml`/PR-gate gate-command set-equality — and carries zero occurrences of `advisory` today (verified). Hanging a `.claude/pdlc.config.example.json` / `waveBudgetPerRun` assertion there makes an unrelated file the config-example oracle and puts a delivery-blocking required check at risk of reddening for config-schema reasons. Fix: give A6-04 a purpose-named engine test file (e.g. `pdlc/engine/__tests__/advisory-config-example.test.js`) and update the manifest row. TSPEC §5.1's file map names `ci-arrangement.test.js`, so this resolves alongside the erratum raised in this review's trailer. | A6-04; manifest; TSPEC §5.1 |
| F-07 | Low | Local | **The suite file's creator is not a dependency of its later writers.** A6-00 creates `advisoryWaveGate.test.js`; A6-07/A6-09/A6-13/A6-15 append to it but depend only on the A6-05 chain, and nothing depends on A6-00 at all. Ordering holds today only because A6-00 lands in batch 1 and A6-07 in batch 3 — the dispatcher derives batches from `Deps`, not from the authored column, so the "file exists before it is appended" guarantee is not expressed in the DAG. Add `A6-00` to A6-07's `Deps` (batch value is unchanged: `max(A6-05=2, A6-00=1)+1 = 3`). | A6-07; Dependencies |
| F-08 | Low | Local | **The coverage claim and the DoD disagree about whether the floor is an oracle.** Verification says the backstop "is not an oracle … no floor can fail on A6's account", but the DoD gates on `cd pdlc/workflows && npm run test:coverage`, whose second stage is `c8 report --check-coverage --per-file --branches 85` over an include list of exactly `orchestrate-dev.js`, `orchestrate-queue.js`, `build-runtime.mjs` (verified: `pdlc/workflows/package.json` `scripts.test:coverage` and the `c8` block). Dilution is an argument, not a guarantee. Either drop the "cannot fail" clause or record the current per-file branch margin for `orchestrate-dev.js` so a regression is attributable. | Verification; Definition of Done |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Which `action` value does A6-03 transcribe into `GATE_EXCLUSIVITY_REGISTRY.A6` (`advisoryDriver.test.js:221-227`)? The registry drives three per-seam generators as well as PROP-GATE-06's set-equality, and those generated A6 cases run against the *shipped* driver from batch 1 — the plan asserts this is "transcription only", so please state which registry shape keeps the generated A6 cases green before A6-12 lands. |
| Q-02 | Does A6-07's `citesGateOutput` negative arm include the prompt-echo case — a reply quoting text that appears in the dispatch prompt but *not* in `gateResult.output`? "True only when the cited region is actually present" leaves that arm unnamed, and it is the one an in-envelope-but-ungrounded reply would exploit. |

## Positive Observations

## Positive Observations

- **AT coverage is genuinely set-equal, both directions.** I extracted the AT ids from FSPEC and
  from the plan's AT-coverage table mechanically: 47 and 47, with an empty symmetric difference.
  Every AT names a red-test task, a green task and a home suite.
- **The batch column re-derives correctly.** I recomputed `batch == max(dep batch) + 1` for all
  twenty-two rows: every value matches, sources sit in batch 1, ids are unique, the graph is
  acyclic, every dependency resolves, and no layer exceeds `computeTopologicalBatches`' five-task
  cap. No same-batch same-file writer exists in either the `Test File`/`Source File` columns or the
  manifest — `advisoryWaveGate.test.js` (batches 1, 3, 5, 9, 11), `advisoryDriver.test.js` (1, 7),
  `advisoryRecord.test.js` (1, 11) and `orchestrate-dev.js` (2, 4, 6, 8, 10, 12, 14) are each
  serialised. Manifest and task table are mutually complete (22 rows, 22 tasks), headers are
  `Owning task` / `Files`, both inside `PLAN_OWNER_HEADER_CELLS` / `PLAN_FILES_HEADER_CELLS`
  (`orchestrate-dev.js:4338-4356`).
- **Every line anchor I spot-checked is right**, which is rare and made this review cheap:
  `:14360` (`if (scriptGate)`), `:14364` (the halt literal), `:14347`–`:14357` (the post-wave arm),
  `:14143` (`scriptGate`), `:1938`/`:1940`/`:1947`/`:1960`, `:3499`/`:3503` (both
  `seamOps.declaredScope` reads), `:2111`, `:4449`, `:10805`, plus `advisoryDoubles.js:271`,
  `advisoryDriver.test.js:221` and `:846`, and `advisoryDodSeams.test.js:371` (the real-repo fixture
  shape A6-01 copies). `advisoryWaveGate.test.js` is verified absent; the other ten test-side files
  are verified present.
- **The restore sequence is in the only order that works.** `read-tree --reset -u` → `clean -fd` →
  `reset --mixed` restores the snapshot tree, drops A6's untracked leftovers, and then unstages —
  preserving the pre-A6 "wave work present but uncommitted" state that the wave's own per-task
  commit loop (`orchestrate-dev.js:14396-14413`) later consumes. Running `clean` after `reset
  --mixed` would have deleted the wave's own new files.
- **DEC-A6-01's `commit-tree` choice quietly protects the engine channel.**
  `pdlc/engine/__tests__/commit-sites.test.js` enforces a five-member set-equality over enclosing
  functions of `["commit", …]` sites, and its scanner matches only a first element exactly
  `"commit"` (`commit-sites.test.js:80-92`) — so `captureTreeSnapshot`'s `commit-tree` adds no sixth
  member. Worth keeping in mind if the snapshot is ever re-implemented as a plain commit.
- **No absence-only oracles in the inventory.** The `(f)`…`(i)` prohibition tests each carry a
  paired positive (AC-4.5), AC-4.1 conjunct (iii) is proved by two mutation fixtures over the *real*
  `buildA6SeamOps` with a positive anchor (`ledgerAnchor.value === 2` / `=== 4` and the
  `["post-wave","test","post-wave","test"]` token sequence), the disabled-tier absences are paired
  with the enabled-but-quiet positive, and A6-09 explicitly demotes `git status`-level comparison in
  favour of a content-hash map over tracked *and* untracked files. Expected values are literal
  transcriptions, not derived from the code under test.

## Recommendation

**Needs revision**

Three High findings, all of the same family and all cheap to fix: two shipped five-row assertions
(`advisoryQueueSeams.test.js:627`, `advisoryDisabled.test.js:622`) redden inside batch 2 with no
batch-1 retarget and, in one case, no owner at all; and A6-00's pre-flight probe names an unexported
symbol. Concretely: fold both retargets into A6-03 (not into new batch-1 tasks — the layer is at its
five-task cap and a sixth task shifts every downstream `Batch` value), correct the "six shipped
surfaces" claim to seven, and either drop `pathsCollide` from A6-00 or export it in A6-05. The
Mediums then ask for one sentence each: the pending case's mechanism (`test.todo`, never `.skip`),
an explicit engine-suite verification step for A6-04/A6-06, and a better home than
`ci-arrangement.test.js` for the example-config expectation.

Everything else in this plan is in unusually good shape — the AT set-equality, the batch DAG and
every cited anchor held up under mechanical re-derivation.

## Verdict

VERDICT: Needs revision
{"high": 3, "medium": 3, "low": 2}
