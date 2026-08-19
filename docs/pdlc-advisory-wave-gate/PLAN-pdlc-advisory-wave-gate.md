# PLAN — pdlc-advisory-wave-gate

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → DECISIONS → **PLAN**` |
| Downstream | `PROPERTIES`, `IMPL` |
| Cross-Reviews | *(none yet — active while Phase P runs)* |
| LEARNINGS | `docs/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md` |

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-08-19 | First authored against TSPEC v1.6 and DECISIONS (DEC-A6-01…DEC-A6-04). |

---

## Overview

**What gets built.** A sixth advisory seam, `A6`, fires at exactly one place — the Phase I wave
loop's script-owned test gate in `pdlc/workflows/orchestrate-dev.js` (`orchestrate-dev.js:14360`,
today an unconditional `throw haltError("Error: Wave N test gate failed …")` at `:14364`). A6
snapshots the whole tree, attempts one bounded in-envelope repair, re-runs the wave's own gate
sequence, and either resolves the wave or restores the snapshot byte-identically and lets the wave
halt on its pre-A6 literal with a diagnosis attached.

**Where it lands.** One production file: `pdlc/workflows/orchestrate-dev.js` (TSPEC §1.2 — the
workflow runtime loads one bundled artifact, so every advisory-tier symbol lives in one module).
Eleven test-side files under `pdlc/workflows/__tests__`, ten of which already exist —
`advisoryWaveGate.test.js` is the one new file (verified absent today). One second-channel pair
(`.claude/pdlc.config.example.json`, `pdlc/engine/__tests__/advisory-config-example.test.js`, the
second of which is new). No new module,
no new transport, no new credential.

**Shape of the plan.** Fourteen batches in strict red→green alternation. Every odd batch is
RED-terminal (its new or retargeted tests must fail for a named reason, all pre-existing tests
green); every even batch is a single-writer implementation batch on `orchestrate-dev.js` that turns
exactly the preceding batch's red tests green and leaves the whole suite green. The alternation is
forced, not stylistic: `implementation.testCommand` in `.claude/pdlc.config.json` runs the **whole**
`pdlc/workflows` suite at every wave gate, so a red test left standing across an even batch would
halt the next wave rather than drive it.

**Two facts about this feature that shape the batching.**

1. **The feature is not purely additive** (TSPEC §1.3). Eight shipped surfaces transcribe the
   five-member seam set today and go red the moment `ADVISORY_SEAMS` gains `A6` — verified:
   `advisoryEnvelope.test.js`, `advisoryHarvest.test.js`, `consolidationProperties.test.js`,
   `advisoryRecord.test.js`, `__tests__/helpers/advisoryDoubles.js` (`SEAMS` literal at
   `advisoryDoubles.js:271`), `advisoryDriver.test.js`'s `GATE_EXCLUSIVITY_REGISTRY`
   (`advisoryDriver.test.js:221`, keys compared to `ADVISORY_SEAMS` at `:846`), and two
   **bare row-count** surfaces a member-literal grep does not find because they name no seam:
   `advisoryDisabled.test.js`'s `expect(result.advisory.rows).toHaveLength(5)` (`:622`,
   PROP-DIS-05's enabled-but-quiet case) and `advisoryQueueSeams.test.js`'s
   `expect(report.advisory.rows).toHaveLength(5)` (`:627`), the queue's share of the same
   `advisorySummaryRows` list that `ADVISORY_SEAMS` drives (`orchestrate-dev.js:2989`–`:2992`,
   imported at `orchestrate-queue.js:41` and used at `:1319`). Batch 1 retargets all eight
   **before** batch 2 touches the constant, so the red is the intended signal and never a
   mystery red discovered mid-wave.

   The enumeration bar this list has to clear is *transcription sites*, not *member literals*:
   a row-count assertion is as coupled to `ADVISORY_SEAMS`'s cardinality as a seam-name list is,
   and greps for `"A5"` or `SEAMS` miss it. Batch 1's set is derived by grepping the suite for
   `advisory.rows` and `toHaveLength` as well as for seam members.
2. **Almost all production code lives in one file.** Batch-safety rule 2 (single writer per file per
   batch) therefore serialises the implementation tasks completely: `orchestrate-dev.js` is written
   by exactly one task per batch, and parallelism exists only among test-side tasks in the odd
   batches.

**Not in scope here.** OQ-7 (`.gitignore`d paths inside BR-9's restoration oracle) is upstream-pending
on FSPEC `BR-9` / `AT-05-1` and REQ `AC-5.1`. Per TSPEC §6 OQ-9 the plan does **not** wait for it:
task `A6-09` mints the ignored-path round-trip case with its expected value marked pending, and
transcribes whichever boundary the erratum returns.

## Batches

Status key: ⬚ Not Started | 🔴 Red | 🟢 Green | 🔵 Refactored | ✅ Done

`Batch` is derived mechanically and is the dispatcher's contract, not documentation:
`batch == max(batch of deps) + 1`, sources in batch 1, **and no more than five tasks per batch** —
`computeTopologicalBatches` splits a wider topological layer into sub-batches of at most five
(`pdlc/workflows/orchestrate-dev.js:10805`), so a six-wide layer here would be re-labelled by the
dispatcher rather than run as written. Batch 1 is exactly five tasks for that reason.

| # | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|
| A6-00 | **Pre-flight gate.** Assert the shipped advisory-tier baseline this feature extends is importable at HEAD: `runAdvisorySeam`, `classifyEnvelope`, `appendAdvisoryEntry`, `appendEscalationEntry`, `resolveAdvisoryRung`, `parseAdvisoryVerdict`, `renderAdvisoryEntry`, `computeWaves`, `parsePlanOwnership`, `commitPaths`, `gitWithLockRetry`, `checkWaveUnskips`, `effectiveGuardPaths`. Existence only, never shape. **`pathsCollide` is deliberately not on this list**: it is declared `function pathsCollide(a, b)` at `orchestrate-dev.js:4726` with no `export` and is referenced only internally (`:10961`), so an import-based existence assertion would fail at HEAD and open batch 1 on a red this gate's own wording would misread as "PLAN invalid". Its behaviour is proved transitively through A6-07's `ownedSetCovers` trailing-slash cases; A6-05 exports it if and only if A6-07 ends up importing it directly. Creates the new suite file. | `pdlc/workflows/__tests__/advisoryWaveGate.test.js` | — | 1 | — | ⬚ |
| A6-01 | **[Fake first]** Test doubles and fixtures for A6: a recording `_git` double (argv-verb counting — per TSPEC §5.2 the counted quantity is `commit-tree`, never the raw call count, because `restoreTreeSnapshot` drives the same transport), a real-repository fixture builder (`mkdtempSync` + `execFileSync("git", …)`, the shape `pdlc/workflows/__tests__/advisoryDodSeams.test.js:371` already ships), an A6 agent double emitting `ROOT-CAUSE:` / `PROMOTES:` / `PROMOTES-TASK:` trailers, and the `SEAMS` literal retargeted to six members (`helpers/advisoryDoubles.js:271`). | `pdlc/workflows/__tests__/helpers/advisoryDoubles.js` | — | 1 | — | ⬚ |
| A6-02 | **RED** — the two constant-surface suites. `advisoryEnvelope.test.js`: `ADVISORY_SEAMS` six members, `ENVELOPE_DEFAULTS` `E-1`…`E-6`, `ADVISORY_ROOT_CAUSES` four members, `A6_PROHIBITIONS` `["f","g","h","i"]`, `ADVISORY_REFUSAL_REASONS` ordered-sequence (eight members, unchanged — capture failure adds no ninth), `ADVISORY_EXCLUSIONS` ordered-sequence. `advisoryConfig.test.js`: the re-declared `ADVISORY_DEFAULTS` literal gains `waveBudgetPerRun: 1`, and the new validator's arms — `0` is a legal configured value (E-33), `-1` / `1.5` / `"x"` / `null` are invalid and fall back per key. Set-equality throughout, never `toContain`. Covers AT-01-1, AT-02-1, AT-03-1, AT-03-7, AT-03-8, AT-07-2b, AT-07-2 (these two files' share). | `pdlc/workflows/__tests__/advisoryEnvelope.test.js`, `pdlc/workflows/__tests__/advisoryConfig.test.js` | — | 1 | — | ⬚ |
| A6-03 | **RED** — the six collateral transcription surfaces §1.3 names, retargeted to six seams in one task so the intended red is one edit's consequence and never a mystery: `advisoryDriver.test.js`'s `GATE_EXCLUSIVITY_REGISTRY` gains its `A6` row (`:221`, keys compared to `ADVISORY_SEAMS` at `:846`); `advisoryRecord.test.js`'s per-seam `rows.map((r) => r.seam)` `test.each` gains a sixth row; `advisoryHarvest.test.js` and `consolidationProperties.test.js` retarget their seam literals; and the **two bare row-count assertions** retarget `5` to `6` — `advisoryDisabled.test.js:622`'s `expect(result.advisory.rows).toHaveLength(5)` (PROP-DIS-05's enabled-but-quiet case, whose per-row `invocations === 0` loop already covers the new A6 row unchanged) and `advisoryQueueSeams.test.js:627`'s `expect(report.advisory.rows).toHaveLength(5)`. Both are folded into this existing batch-1 task rather than given a sixth batch-1 task of their own: batch 1 already sits on `computeTopologicalBatches`' five-task sub-batch cap (`orchestrate-dev.js:10805`), and a sixth task would shift every downstream `Batch` value by one. Transcription only — AC-6.x behaviour lands in A6-16, the driver's new arm in A6-11, and A6-20 still owns `advisoryDisabled.test.js`'s disabled-path byte-identity work in batch 13. | `pdlc/workflows/__tests__/advisoryDriver.test.js`, `pdlc/workflows/__tests__/advisoryRecord.test.js`, `pdlc/workflows/__tests__/advisoryHarvest.test.js`, `pdlc/workflows/__tests__/consolidationProperties.test.js`, `pdlc/workflows/__tests__/advisoryDisabled.test.js`, `pdlc/workflows/__tests__/advisoryQueueSeams.test.js` | — | 1 | — | ⬚ |
| A6-04 | **RED** — engine-channel expectation, newly authored in a **purpose-named new file**: the example config's `advisory` section parses and carries `waveBudgetPerRun` as a non-negative integer (TSPEC §4.4, §5.1). The expectation is deliberately **not** hung on `pdlc/engine/__tests__/ci-arrangement.test.js`, which declares itself (`:1`–`:21`) the single oracle for FSPEC §5.1's CI arrangement — `pr-tests.yml` job-name expansion and the `publish.yml`/PR-gate command set-equality — and carries zero occurrences of `advisory` today (verified). Hanging a config-schema assertion there would let an unrelated config-example edit redden the delivery-blocking `Engine tests (ubuntu-latest)` required check. TSPEC §5.1's file map names `ci-arrangement.test.js` here and is corrected by erratum. | `pdlc/engine/__tests__/advisory-config-example.test.js` | — | 1 | — | ⬚ |
| A6-05 | **GREEN** — constants and vocabularies (TSPEC §3.1): `ADVISORY_SEAMS` + `A6` (`orchestrate-dev.js:1947`), `ENVELOPE_DEFAULTS` + `E-5`, `E-6` (`:1938`), new frozen `ADVISORY_ROOT_CAUSES` and `A6_PROHIBITIONS`, `ADVISORY_DEFAULTS.waveBudgetPerRun` (`:1940`), `ADVISORY_SEAM_PHASES.A6 = {id: "I", outcome: "halted"}`, and `parseAdvisoryConfig`'s one new key through a new `nonNegativeInt` sibling of the shipped `positiveInt` (`:1960`) — the shipped validator requires `v >= 1` and E-33 requires `0` to survive. | — | `pdlc/workflows/orchestrate-dev.js` | 2 | A6-01, A6-02, A6-03 | ⬚ |
| A6-06 | **GREEN** — the example config gains its **whole** `advisory` section, not just `waveBudgetPerRun`: `enabled` alongside it, so the copied-out block is self-explanatory and an operator reading only this file can tell that `waveBudgetPerRun: 0` with `enabled: true` is TSPEC §4.4/E-33's documented "keep the tier on, keep A6 off" affordance rather than a misconfiguration. The file carries no `advisory` section at all today (verified). Since JSON admits no comments, the affordance is carried by the key pairing plus one line in `pdlc/README.md`'s advisory section. **Verification obligation:** because `implementation.testCommand` scopes the wave gate to `pdlc/workflows` only, neither A6-04's red nor this green is checkable by the in-pipeline batch gate — the implementer runs `cd pdlc/engine && npm ci && npm test` explicitly in this task and in A6-04, rather than discovering a wrong expectation twelve batches later in Phase PUB's `Engine tests (ubuntu-latest)` check. | — | `.claude/pdlc.config.example.json` | 2 | A6-04 | ⬚ |
| A6-07 | **RED** — pure helpers (TSPEC §3.4, §3.3): `waveOwnedPaths` / `laterOwnedPaths` as unions of `task.files` over the wave and over every later wave, read from what `computeWaves` already annotates; `ownedSetCovers` delegating to `pathsCollide`, including the operator-visible trailing-slash precondition (`a/b/` covers `a/b/c.js`, `a/b` does not); `parseA6RootCause` total over absent, wrong-cased and out-of-set trailers; `citesGateOutput` true only for a region actually present in `gateResult.output`. | `pdlc/workflows/__tests__/advisoryWaveGate.test.js` | — | 3 | A6-00, A6-05 | ⬚ |
| A6-08 | **GREEN** — implement `waveOwnedPaths`, `laterOwnedPaths`, `ownedSetCovers`, `parseA6RootCause`, `citesGateOutput`. Pure: no `process`, no clock, no ambient state. | — | `pdlc/workflows/orchestrate-dev.js` | 4 | A6-07 | ⬚ |
| A6-09 | **RED** — snapshot/restore round trips on a **real temporary git repository**, never a fake `_git` (TSPEC §5.2: this is the one place an injected double would echo the assertion rather than test it): the content-hash map taken immediately before A6 acts equals the map after restore, over tracked and untracked files alike, generated outputs included; a companion pinning that a `git status`-level comparison is explicitly **not** the oracle, because re-running the post-wave command rewrites an already-dirty path without changing the hash map; `restoreTreeSnapshot` throwing on any `ok !== true`, tagged `__isRevertFailure` and rethrown by the driver's terminal catch; the wave-scoped ref name `refs/pdlc/a6-snapshot-{waveNum}`. The `.gitignore`d-path round trip is written with its expected value named but **marked upstream-pending on OQ-7 using `test.todo`, never `test.skip`/`describe.skip`/`it.skip`**. The mechanism is not cosmetic: `scanSkipTokens` (`orchestrate-dev.js:11146`–`:11150`) matches exactly `/\b(describe|test|it)\.skip\s*\(/`, and `checkWaveUnskips` (`:11213`) halts the wave through `formatUnskipViolations` (`:11285`) once the file's manifest owners are all complete and the block names no live task id (`:11271`–`:11277`) — so the obvious `.skip` idiom would halt wave 5 or any later wave. `test.todo` carries no callback and is invisible to that scanner, which is why it is the pending marker here. Covers AT-05-1, AT-05-2, AT-05-5. | `pdlc/workflows/__tests__/advisoryWaveGate.test.js` | — | 5 | A6-08 | ⬚ |
| A6-10 | **GREEN** — `captureTreeSnapshot` (`rev-parse HEAD`, `add -A`, `write-tree`, `commit-tree`, `update-ref refs/pdlc/a6-snapshot-{waveNum}`; returns `null` on any `ok !== true`) and `restoreTreeSnapshot` (`read-tree --reset -u`, `clean -fd`, `reset --mixed`; throws on any `ok !== true`), both over the injected `_git` transport, with `add` and `reset` through `gitWithLockRetry` for the reason `commitPaths` already retries them. DEC-A6-01 (dangling snapshot commit, never `git stash`) and DEC-A6-03 (wave-scoped ref, no run discriminator). | — | `pdlc/workflows/orchestrate-dev.js` | 6 | A6-09 | ⬚ |
| A6-11 | **RED** — the driver's one new optional seam (TSPEC §3.7): `classifyReply`'s three arms — `{ok:true}` and the default `null` proceed to RE-CHECK, A1–A5 unchanged in shape and bytes; `{malformed:true}` reuses the **existing** malformed arm (`attempts += 1`, budget check, `continue`), which gives E-09's tie-break for free since `parseAdvisoryVerdict` runs first; `{terminate:{outcome,reason}}` terminates with `attempts` unchanged and `appliedSuccessfully:false`. Plus A6's rung parity (resolved rung equals the tier's, read from the shared `rungState` memo, no second resolution in a run) and dispatch-option parity member by member — tool grants, transport, environment. Covers AT-02-7, AT-07-4, AT-07-5. | `pdlc/workflows/__tests__/advisoryDriver.test.js` | — | 7 | A6-10 | ⬚ |
| A6-12 | **GREEN** — `runAdvisorySeam` gains the optional `seamOps.classifyReply` hook, called once per attempt after `parseAdvisoryVerdict` returns a well-formed verdict and after `_summarise`, before RE-CHECK; default `null`. A hook, never an `if (seam === "A6")` branch — the per-seam gate-exclusivity registry asserts no seam has a private path through the driver. | — | `pdlc/workflows/orchestrate-dev.js` | 8 | A6-11 | ⬚ |
| A6-13 | **RED** — `buildA6SeamOps` member contracts (TSPEC §3.3): `gatherEvidence` passing the **full** `gateResult.output`, not `outputTail`'s 30 lines, and filling `declaredScope` in place; `classifyReply` over the four-class `ROOT-CAUSE:` trailer; `conditionHolds`; `apply` writing `ledgerAnchor.value = invocations.length` as its **first** statement, before it dispatches anything, and returning `{ok:true}` iff `producedPaths()` is non-empty (an empty set is `{ok:false}` ⇒ `post-action-verification-failed`, which is also the disposition for a repair writing only `.gitignore`d paths — OQ-11, stands independently of OQ-7); `producedPaths` as `git diff --name-only` **unioned with** `git ls-files --others --exclude-standard`, the untracked half not optional because an E-6 promotion creates files; `revert`; `verifyGate` re-running the wave's own gate sequence and re-entering `budget-exhausted`; `permittedActions` narrowing `E-6` away on the last wave; the `ledgerAnchor` carrier initialised `{value: -1}` (fail-closed). Covers AT-02-3, AT-02-5, AT-03-4 (seam-op half). | `pdlc/workflows/__tests__/advisoryWaveGate.test.js` | — | 9 | A6-12 | ⬚ |
| A6-14 | **GREEN** — implement `buildA6SeamOps` and its private helpers. `declaredScope` and `ledgerAnchor` are mutated in place and never reassigned, and nothing is hung on the returned SeamOps object: the driver shallow-copies it (`orchestrate-dev.js:3499`, `:3503`), which is exactly how the round-4 design lost its anchor. | — | `pdlc/workflows/orchestrate-dev.js` | 10 | A6-13 | ⬚ |
| A6-15 | **RED** — the call site `runWaveGateSeam` end to end (TSPEC §3.2, §5.2, §5.5). Tier gate — AC-1.5 is a **disjunction** ("wave mode not in effect (BL-03) **or** no script-owned gate configured (BL-04)"), so the allocation is four arms, not one: (i) BL-03 absent alone — a run reaching Phase I on the no-manifest legacy path, wave mode never entered, script-owned gate configured; (ii) BL-04 absent alone — valid ownership manifest and wave mode in effect, no `testCommand` configured; (iii) both absent, which per TSPEC §5.5 must still emit exactly **one** statement naming both causes and never two; and (iv) the **zero-count discriminator**, a run in which A6 *does* apply, asserting the inapplicability-statement count over the whole notice surface reads **zero**. Arm (iv) is what makes the other three falsifiable: without it a carrier that emits the notice unconditionally satisfies (i)–(iii) and nothing catches it. All four count *statements over the whole notice surface*, never A6-authored notices — A6 authors none. Wave budget: two escalated waves leave `waveBudget.resolved` at `0`, one resolved wave increments it to `1`, and a wave entered over budget still captures its snapshot and still writes its record and escalation entry with **no** `_agent` call. Capture failure: six positive assertions on one run — record entry whose Disposition cell reads bare `escalated` with **no** refusal reason, `Model` cell the literal `n/a`, escalation entry text **containing** the failing git verb observed on the `_git` double, `attempts === 0`, unchanged budget, `commit-tree === 1` across a two-attempt run — plus a companion pinning `ADVISORY_REFUSAL_REASONS`'s eight members on the same run. Resolution: the step-6 growth-since-last-`apply` rule, the two-attempt positive companion asserting the six tokens a red-then-green run produces, and the **two mutation fixtures** for AC-4.1 conjunct (iii), each replacing exactly one member of a **real** `buildA6SeamOps` result (`{...seamOps, verifyGate: fake}`) and each carrying its positive half (`ledgerAnchor.value === 2` on the attempt-1 fixture; `=== 4` with `["post-wave","test","post-wave","test"]` on the attempt-2 fixture). Prohibitions `(f)`…`(i)`: eleven tests, id set compared by set-equality against `A6_PROHIBITIONS`, every one carrying its paired positive per AC-4.5. Plus the BR-1…BR-16 partition against an agent double, the halt literal, and §4.5's halt fields. Covers AT-01-5, AT-02-2, AT-02-4, AT-02-6, AT-02-8, AT-02-9, AT-03-2, AT-03-3, AT-03-4, AT-03-5, AT-03-6, AT-04-1, AT-04-1a, AT-04-1b, AT-04-2, AT-04-4, AT-05-3, AT-06-4, AT-07-1. | `pdlc/workflows/__tests__/advisoryWaveGate.test.js` | — | 11 | A6-14 | ⬚ |
| A6-16 | **RED** — AC-6.1's record obligations, beside the shipped record oracle rather than in a second drifting copy: the entry an A6 invocation writes names the wave, root-cause class, envelope determination and action, and its **field set is compared by set-equality** against the transcribed literal, never by containment (a dropped field passes a containment check); a failed record write refuses the action and carries the tier's record-write-failure reason. Covers AT-06-1, AT-06-2. | `pdlc/workflows/__tests__/advisoryRecord.test.js` | — | 11 | A6-14 | ⬚ |
| A6-17 | **RED** — AC-6.2 / AC-6.4's escalation log: the entry carries the root-cause class and the tier's fields plus one sentence an operator can decide from; an escalated `plan-ordering-defect` reaches `docs/_queue/ESCALATIONS.md` durably; a failed escalation-log write leaves the disposition `escalated` and unchanged, surfaces the failure on the report's notice channel, and never upgrades to `resolved`. Covers AT-06-3, AT-06-5, AT-06-6. | `pdlc/workflows/__tests__/advisoryEscalationLog.test.js` | — | 11 | A6-14 | ⬚ |
| A6-18 | **GREEN** — implement `runWaveGateSeam` (TSPEC §3.2 steps 1–7): structural applicability, the tier gate (so AC-1.4's inertness covers the **snapshot**, which is A6's and not the driver's) — implemented by **receiving the already-resolved `advisoryTierOn` boolean** (`orchestrate-dev.js:13678`) as a parameter and performing **no new `.enabled` read**, so PROP-DIS-06's exact-count oracle (`advisoryDisabled.test.js:634`–`:658`, AC-1.4) still finds exactly three `/\.enabled\b/` matches across `orchestrate-dev.js` and `orchestrate-queue.js` with `parseAdvisoryConfig`'s body excised — today `orchestrate-dev.js:3258`, `:13678` and `orchestrate-queue.js:1318`, verified. A literal `config.enabled === false` inside `runWaveGateSeam` would make that count four and go red in batch 12, whose gate declares the whole suite green; it would also contradict the shipped design intent stated at `:13675`–`:13677` ("Read once, reused everywhere below … so the tier's own master switch is inspected from source text exactly once here"). What A6 needs duplicated is the tier *gate*, not the tier *read*. The wave-budget check using the shipped `__preDispatch` escape, `captureTreeSnapshot` at the call site — outside `runAdvisorySeam`, exactly once per wave, because `gatherEvidence` sits inside the driver's attempt loop — `buildA6SeamOps`, `runAdvisorySeam`, and the step-6 resolution check comparing the tokens appended since the last `apply` against the wave's own configured gate sequence. Includes §2.5's capture-failure writes (`appendAdvisoryEntry` with the six members `renderAdvisoryEntry` destructures, then `appendEscalationEntry`, then the `ADVISORY ESCALATION:` notice) and §4.5's halt fields. | — | `pdlc/workflows/orchestrate-dev.js` | 12 | A6-15, A6-16, A6-17 | ⬚ |
| A6-19 | **RED** — the wave loop's own obligations: A6 call count `0` on dispatch failure, on post-wave failure and on the V-wave's separate gate, with reason strings and queue row equal to the pre-A6 literals; committing writer identities equal to the pre-A6 baseline on a green gate; **§3.6's promotion commit** — the repair present in the branch's committed state with no residual working-tree change, identified by `message` and pathspec, and the advisory record naming the paths while the later task's prompt carries the promotions clause — paired with the companion that is **red on today's behaviour** (M-WG-12: the wave commit loop commits only paths owned by tasks in that wave, so a later task's paths outside `postWavePathspecs` strand the repair uncommitted); the post-gate un-skip halt carrying §4.5's advisory fields while the repair stays in the tree, asserted as a pair so AT-05-4 is satisfiable and not vacuous; per-task `commitPaths` count `≥ 1` with A6 count `0` on an all-green run, no timing assertion. Covers AT-01-2, AT-01-3, AT-04-3, AT-04-5, AT-05-4, AT-07-3. | `pdlc/workflows/__tests__/waveExecution.test.js` | — | 13 | A6-18 | ⬚ |
| A6-20 | **RED** — disabled-tier byte-identity extended to A6: with `advisory.enabled: false` and a red wave there is no dispatch, no rung resolution and **no snapshot**, created files are byte-identical to the pre-advisory baseline, and the report carries no `advisory` key (`undefined`, not `null`); paired with the enabled-but-quiet case where the key is **present** with six rows and A6's counter `0`. Covers AT-01-4, AT-01-6, AT-07-2 (this file's share). | `pdlc/workflows/__tests__/advisoryDisabled.test.js` | — | 13 | A6-18 | ⬚ |
| A6-21 | **GREEN** — Phase I wiring, the only edit to the shipped wave loop: extract `runWaveGateSequence` (post-wave then test, pushing one `"post-wave"` / `"test"` token into the per-wave `invocations` array immediately before each `runCommandFn` call, pass or fail), replace the unconditional `throw haltError(…)` at `orchestrate-dev.js:14364` with §2.3's block — post-wave arm rethrows byte-identically (`:14347`–`:14357` unchanged), test arm calls `runWaveGateSeamFn` and rethrows the **first pass's** halt with `advisory: a6.haltFields` when unresolved — add §3.6's further `commitPaths` call in the per-task loop for an E-6 promotion, in the full argument form with its own `chore({feature}): wave {N} promotion ({taskId})` message (DEC-A6-02), extend `waveImplementPrompt` with the promotions clause, and push A6's row into `advisorySummaryRows`. Steps 1–3, 5 and 7 keep their messages byte for byte. | — | `pdlc/workflows/orchestrate-dev.js` | 14 | A6-19, A6-20 | ⬚ |

### Batch gates

| Batch | Gate wording |
|---|---|
| 1 (RED-terminal) | A6-02's and A6-03's retargeted transcriptions **fail for their named reason** — the five-member seam literal, the four-member envelope literal, the absent `waveBudgetPerRun` key, the absent `A6` registry row, and the two bare `toHaveLength(5)` row counts now reading `6` — and every other pre-existing test is green. A6-00's pre-flight assertions and A6-01's fixtures are green from the start; red there means the baseline moved and this PLAN is invalid, not that the wave failed. A6-04's engine-channel red is **not** observed by this gate (`implementation.testCommand` scopes to `pdlc/workflows`); it is checked by the task's own `cd pdlc/engine && npm ci && npm test` step. |
| 3, 5, 7, 9, 11, 13 (RED-terminal) | The batch's new tests fail for the reason each one names — the symbol under test does not exist yet, or exists without the new arm — and **all** pre-existing tests, including everything greened by an earlier even batch, stay green. A6-19's promotion-commit companion is the one row that is red against *shipped* behaviour rather than against a missing symbol; its failure message must name M-WG-12. |
| 2, 4, 6, 8, 10, 12, 14 | Whole `pdlc/workflows` suite green under `implementation.testCommand`, `node pdlc/workflows/build-runtime.mjs` clean as the post-wave command, and `pdlc/workflows/dist/` committed through `implementation.postWavePathspecs`. Batch 2 additionally carries A6-06's out-of-band `cd pdlc/engine && npm ci && npm test`, which the configured gate command cannot see. |

### File-ownership manifest (Phase I)

One phase, one manifest. Every task in the table above has exactly one row here and every row names
a task in the table (`validatePlanContract`). Directory rows would carry the trailing slash
`ownedSetCovers` / `pathsCollide` requires (TSPEC §3.4, §6 OQ-10); this feature happens to own no
directory row — `pdlc/workflows/dist/` is written by the post-wave command and committed through
`implementation.postWavePathspecs`, not by any task.

| Owning task | Files |
|---|---|
| A6-00 | `pdlc/workflows/__tests__/advisoryWaveGate.test.js` |
| A6-01 | `pdlc/workflows/__tests__/helpers/advisoryDoubles.js` |
| A6-02 | `pdlc/workflows/__tests__/advisoryEnvelope.test.js`, `pdlc/workflows/__tests__/advisoryConfig.test.js` |
| A6-03 | `pdlc/workflows/__tests__/advisoryDriver.test.js`, `pdlc/workflows/__tests__/advisoryRecord.test.js`, `pdlc/workflows/__tests__/advisoryHarvest.test.js`, `pdlc/workflows/__tests__/consolidationProperties.test.js`, `pdlc/workflows/__tests__/advisoryDisabled.test.js`, `pdlc/workflows/__tests__/advisoryQueueSeams.test.js` |
| A6-04 | `pdlc/engine/__tests__/advisory-config-example.test.js` |
| A6-05 | `pdlc/workflows/orchestrate-dev.js` |
| A6-06 | `.claude/pdlc.config.example.json` |
| A6-07 | `pdlc/workflows/__tests__/advisoryWaveGate.test.js` |
| A6-08 | `pdlc/workflows/orchestrate-dev.js` |
| A6-09 | `pdlc/workflows/__tests__/advisoryWaveGate.test.js` |
| A6-10 | `pdlc/workflows/orchestrate-dev.js` |
| A6-11 | `pdlc/workflows/__tests__/advisoryDriver.test.js` |
| A6-12 | `pdlc/workflows/orchestrate-dev.js` |
| A6-13 | `pdlc/workflows/__tests__/advisoryWaveGate.test.js` |
| A6-14 | `pdlc/workflows/orchestrate-dev.js` |
| A6-15 | `pdlc/workflows/__tests__/advisoryWaveGate.test.js` |
| A6-16 | `pdlc/workflows/__tests__/advisoryRecord.test.js` |
| A6-17 | `pdlc/workflows/__tests__/advisoryEscalationLog.test.js` |
| A6-18 | `pdlc/workflows/orchestrate-dev.js` |
| A6-19 | `pdlc/workflows/__tests__/waveExecution.test.js` |
| A6-20 | `pdlc/workflows/__tests__/advisoryDisabled.test.js` |
| A6-21 | `pdlc/workflows/orchestrate-dev.js` |

## Dependencies

### Why the chain is this serial

Almost every production edit lands in `pdlc/workflows/orchestrate-dev.js` (TSPEC §1.2), and
batch-safety rule 2 allows one writer per file per batch. So `orchestrate-dev.js` is written by
exactly one task per batch, and the seven implementation tasks (A6-05, A6-08, A6-10, A6-12, A6-14,
A6-18, A6-21) are necessarily serial. Parallelism exists only among test-side tasks, in batches 1,
11 and 13. This was verified mechanically, not asserted: `parsePlanTasks` +
`computeTopologicalBatches` + `computeWaves` over this document reproduce the fourteen batches
labelled above, task for task.

### Red-before-green edges

Every green task lists its red task in `Deps` — never id-order luck:

| Green task | Red task(s) it depends on | What the red proves before the green exists |
|---|---|---|
| A6-05 | A6-01, A6-02, A6-03 | six-member seam and envelope literals, `waveBudgetPerRun`, `A6` registry row all fail against the shipped five-member surfaces |
| A6-06 | A6-04 | the example config carries no `advisory` section at all today |
| A6-08 | A6-07 | `waveOwnedPaths`, `laterOwnedPaths`, `ownedSetCovers`, `parseA6RootCause`, `citesGateOutput` are not exported |
| A6-10 | A6-09 | `captureTreeSnapshot` / `restoreTreeSnapshot` are not exported; the real-repo round-trip oracle has nothing to run against |
| A6-12 | A6-11 | `seamOps.classifyReply` is not read by `runAdvisorySeam`, so the terminate arm never fires |
| A6-14 | A6-13 | `buildA6SeamOps` is not exported |
| A6-18 | A6-15, A6-16, A6-17 | `runWaveGateSeam` does not exist, so no disposition, record entry or escalation entry is written |
| A6-21 | A6-19, A6-20 | the wave loop still throws unconditionally at `:14364`; M-WG-12 still strands an E-6 promotion uncommitted |

### Batch-safety rules, as applied here

1. **Batch column derived, not narrated.** `batch == max(batch of deps) + 1`, sources in batch 1,
   sub-batches capped at five (`orchestrate-dev.js:10805`).
2. **Single writer per file per batch.** Checked file by file: `orchestrate-dev.js` appears in
   batches 2, 4, 6, 8, 10, 12 and 14, once each. `advisoryWaveGate.test.js` appears in batches 1, 3,
   5, 9 and 11, once each. `advisoryDriver.test.js` in batches 1 and 7. `advisoryRecord.test.js` in
   batches 1 and 11. `advisoryDisabled.test.js` in batches 1 (A6-03's row-count retarget) and 13
   (A6-20's byte-identity work). `advisoryQueueSeams.test.js` in batch 1 only. No file has two writers in one batch, in either the source or the test column.
3. **Shared prerequisites are serial and singly owned.** `helpers/advisoryDoubles.js` — the one file
   every later suite reads — is owned by exactly one batch-1 task, A6-01, and by nothing else. The
   `[Fake first]` label is on that task and it precedes every production task.
4. **Subpackage-qualified paths.** Every `Test File`, `Source File` and manifest cell carries a
   repo-root-relative path. There are no bare basenames: two suites in this feature
   (`advisoryRecord.test.js` in `pdlc/workflows/__tests__` and `advisory-config-example.test.js` in
   `pdlc/engine/__tests__`) live in different trees, and a bare name would be ambiguous between the
   two channels.
5. **Task ids are spelled identically** in the `#` column and in every `Deps` cell — no emphasis in
   one and bare in the other.

### Integration points in the shipped code

| Integration point | Location, verified | Touched by |
|---|---|---|
| Wave loop's script-owned test gate, today an unconditional throw | `pdlc/workflows/orchestrate-dev.js:14360`, halt literal built at `:14364` | A6-21 |
| Post-wave command, must keep its message byte for byte | `:14347`–`:14357` | A6-21 (read only) |
| `scriptGate` resolution | `:14143` | A6-21 (read only) |
| Advisory constants block | `:1938` (`ENVELOPE_DEFAULTS`), `:1940` (`ADVISORY_DEFAULTS`), `:1947` (`ADVISORY_SEAMS`) | A6-05 |
| `parseAdvisoryConfig` and its per-key validators | `:1960` | A6-05 |
| `runAdvisorySeam`'s attempt loop — APPLY precedes VERIFY, which is what makes the `ledgerAnchor` rule decidable | `:3499`, `:3503`, `:3521`, `:3544`, `:3554` | A6-12, A6-14, A6-18 (read); A6-12 (write) |
| `resolveAdvisoryRung` and the per-run rung memo | `:2111` | none — reused unchanged (NFR-6, O-3) |
| `classifyEnvelope`, `appendAdvisoryEntry`, `appendEscalationEntry` | shipped, unchanged | none — reused unchanged (BR-5, AC-6.1, AC-6.2) |
| `computeWaves` / `parsePlanOwnership` / `pathsCollide`, the source of the owned-path sets | `:4449` (`parsePlanOwnership`) | A6-08 (read) |
| `commitPaths` and `gitWithLockRetry` | shipped | A6-10, A6-21 |
| Gate-exclusivity registry, the reason A6 gets a hook and not a seam-name branch | `pdlc/workflows/__tests__/advisoryDriver.test.js:221`, `:846` | A6-03, A6-11 |

### Upstream dependency that is still open

OQ-7 — whether BR-9's restoration oracle ranges over `.gitignore`d paths — is pending as an erratum
on FSPEC `BR-9` / `AT-05-1` and REQ `AC-5.1`. It does not block any task: A6-09 mints the
ignored-path round trip with its expected value named and marked pending, and transcribes the
boundary the erratum returns. Nothing else in this plan reads that answer, because A6-13's
`apply` refusal for an ignored-path-only repair stands on its own merits either way (OQ-11).

## Verification

### Commands

| What | Command | Where it runs |
|---|---|---|
| Wave gate (every batch) | `cd pdlc/workflows && npm test -- --testPathIgnorePatterns '/node_modules/' '/__tests__/helpers/' '/__tests__/fixtures/' 'documentOracles'` | `implementation.testCommand` in `.claude/pdlc.config.json`, script-owned |
| Post-wave command (every batch) | `node pdlc/workflows/build-runtime.mjs` | `implementation.postWaveCommand`; its output under `pdlc/workflows/dist/` is committed via `implementation.postWavePathspecs` |
| Coverage backstop | `cd pdlc/workflows && npm run test:coverage` | two stages: `c8` aggregate floors, then `c8 report --per-file --branches 85` over `orchestrate-dev.js`, `orchestrate-queue.js`, `build-runtime.mjs` |
| Engine channel | `cd pdlc/engine && npm ci && npm test` | **not** covered by the wave gate — A6-04's expectation lives in `pdlc/engine/__tests__/`, which `implementation.testCommand` does not run. A6-04/A6-06 must be verified by this command and by CI's `Engine tests (ubuntu-latest)` check |
| Artifacts in sync | `node pdlc/workflows/build-runtime.mjs --check` | CI's `Generated artifacts in sync` check; green only if the wave commits carried `dist/` |

Coverage is a backstop here, not an oracle (TSPEC §5.4): A6 lands inside a ~15k-line module that
dominates both its aggregate and its per-file number, so a coverage floor is a poor detector of an
A6-specific gap. That is a dilution argument, not a guarantee, and it is deliberately **not** stated
as "the floor cannot fail" — `orchestrate-dev.js` is itself one of the three files carried at
`--per-file --branches 85` (`pdlc/workflows/package.json`'s `scripts.test:coverage`, verified), so a
large enough block of unhit A6 branches can move the per-file number under the floor. A6-21 therefore
records the pre-A6 and post-A6 per-file branch percentages for `orchestrate-dev.js` in its commit
message, so any regression is attributable rather than mysterious. The branch inventory itself is
discharged by the enumerated cases in the task table, not by the percentage.

### AT coverage — one row per FSPEC acceptance test

Forty-seven ATs in FSPEC §6, forty-seven rows here. This table is set-equal to FSPEC's AT set, not a
containment check: an AT with no row has no home, and a row naming no AT is a defect in this table.

| AT | Red-test task | Green task | Test home |
|---|---|---|---|
| AT-01-1 | A6-02 | A6-05 | advisoryEnvelope.test.js |
| AT-01-2 | A6-19 | A6-21 | waveExecution.test.js |
| AT-01-3 | A6-19 | A6-21 | waveExecution.test.js |
| AT-01-4 | A6-20 | A6-21 | advisoryDisabled.test.js |
| AT-01-5 | A6-15 | A6-18 | advisoryWaveGate.test.js — four arms: BL-03-absent alone, BL-04-absent alone, both-absent (one statement, not two), and the zero-count run where A6 applies |
| AT-01-6 | A6-20 | A6-21 | advisoryDisabled.test.js |
| AT-02-1 | A6-02 | A6-05 | advisoryEnvelope.test.js |
| AT-02-2 | A6-07, A6-15 | A6-08, A6-18 | advisoryWaveGate.test.js — parser unit half in A6-07, escalation/attempts half in A6-15 |
| AT-02-3 | A6-13 | A6-14 | advisoryWaveGate.test.js |
| AT-02-4 | A6-07, A6-15 | A6-08, A6-18 | advisoryWaveGate.test.js — `citesGateOutput` unit half in A6-07 |
| AT-02-5 | A6-13 | A6-14 | advisoryWaveGate.test.js |
| AT-02-6 | A6-15 | A6-18 | advisoryWaveGate.test.js |
| AT-02-7 | A6-11 | A6-12 | advisoryDriver.test.js |
| AT-02-8 | A6-15 | A6-18 | advisoryWaveGate.test.js |
| AT-02-9 | A6-15 | A6-18 | advisoryWaveGate.test.js |
| AT-03-1 | A6-02 | A6-05 | advisoryEnvelope.test.js |
| AT-03-2 | A6-15 | A6-18 | advisoryWaveGate.test.js |
| AT-03-3 | A6-15 | A6-18 | advisoryWaveGate.test.js |
| AT-03-4 | A6-13, A6-15 | A6-14, A6-18 | advisoryWaveGate.test.js — three conjuncts as seam-op unit, then end to end |
| AT-03-5 | A6-15 | A6-18 | advisoryWaveGate.test.js |
| AT-03-6 | A6-15 | A6-18 | advisoryWaveGate.test.js |
| AT-03-7 | A6-02 | A6-05 | advisoryEnvelope.test.js |
| AT-03-8 | A6-02 | A6-05 | advisoryEnvelope.test.js |
| AT-04-1 | A6-15 | A6-18 | advisoryWaveGate.test.js |
| AT-04-1a | A6-15 | A6-18 | advisoryWaveGate.test.js |
| AT-04-1b | A6-15 | A6-18 | advisoryWaveGate.test.js — dropped-re-gate mutation fixtures |
| AT-04-2 | A6-15 | A6-18 | advisoryWaveGate.test.js |
| AT-04-3 | A6-19 | A6-21 | waveExecution.test.js |
| AT-04-4 | A6-15 | A6-18 | advisoryWaveGate.test.js |
| AT-04-5 | A6-19 | A6-21 | waveExecution.test.js — the one AT whose companion is red against shipped behaviour |
| AT-05-1 | A6-09, A6-15 | A6-10, A6-18 | advisoryWaveGate.test.js — real-repo hash-map oracle; ignored-path case pending on OQ-7 |
| AT-05-2 | A6-09 | A6-10 | advisoryWaveGate.test.js |
| AT-05-3 | A6-15 | A6-18 | advisoryWaveGate.test.js |
| AT-05-4 | A6-19 | A6-21 | waveExecution.test.js |
| AT-05-5 | A6-09 | A6-10 | advisoryWaveGate.test.js |
| AT-06-1 | A6-16 | A6-18 | advisoryRecord.test.js |
| AT-06-2 | A6-16 | A6-18 | advisoryRecord.test.js |
| AT-06-3 | A6-17 | A6-18 | advisoryEscalationLog.test.js |
| AT-06-4 | A6-15 | A6-18 | advisoryWaveGate.test.js |
| AT-06-5 | A6-17 | A6-18 | advisoryEscalationLog.test.js |
| AT-06-6 | A6-17 | A6-18 | advisoryEscalationLog.test.js |
| AT-07-1 | A6-15 | A6-18 | advisoryWaveGate.test.js — BR-1…BR-16 partition |
| AT-07-2 | A6-02, A6-03, A6-20 | A6-05, A6-21 | advisoryEnvelope.test.js + advisoryConfig.test.js + advisoryDisabled.test.js |
| AT-07-2b | A6-02 | A6-05 | advisoryConfig.test.js |
| AT-07-3 | A6-19 | A6-21 | waveExecution.test.js |
| AT-07-4 | A6-11 | A6-12 | advisoryDriver.test.js |
| AT-07-5 | A6-11 | A6-12 | advisoryDriver.test.js |

### Definition of Done

- [ ] All twenty-two tasks at ✅, with each green batch's wave gate green under
      `implementation.testCommand` and `build-runtime.mjs` clean.
- [ ] Every one of the forty-seven ATs above has a passing test in the named home; the AT set in this
      table is set-equal to FSPEC §6's, checked both directions.
- [ ] Every transcribed surface of TSPEC §1.3 carries the six-member value by **set-equality**, never
      a loosened `toContain`: `ADVISORY_SEAMS`, `ENVELOPE_DEFAULTS`, `ADVISORY_DEFAULTS`,
      `advisoryRecord.test.js`'s per-seam `test.each`, `advisoryDriver.test.js`'s
      `GATE_EXCLUSIVITY_REGISTRY`, `advisoryHarvest.test.js`, `consolidationProperties.test.js`,
      `helpers/advisoryDoubles.js`'s `SEAMS`.
- [ ] Every prohibition test `(f)`…`(i)` asserts its **paired positive** on the same run (AC-4.5); no
      prohibition rests on a negative assertion alone.
- [ ] Both AC-4.1 conjunct (iii) mutation fixtures replace exactly one member of a **real**
      `buildA6SeamOps` result and each asserts its positive anchor value (`ledgerAnchor.value === 2`
      and `=== 4`).
- [ ] The disabled tier is provably inert, including **no snapshot**: created files byte-identical to
      the pre-advisory baseline and no `advisory` key on the report (AT-01-4).
- [ ] Steps 1–3, 5 and 7 of the wave loop, and the V-wave's own gate, are unchanged — their halt
      literals and queue rows compared to the pre-A6 values byte for byte (AT-01-2, AT-01-3, AT-05-3).
- [ ] `cd pdlc/engine && npm test` green, covering A6-04's example-config expectation that the wave
      gate never runs.
- [ ] `node pdlc/workflows/build-runtime.mjs --check` exits 0 and `pdlc/workflows/dist/` is committed.
- [ ] `cd pdlc/workflows && npm run test:coverage` passes both stages.
- [ ] `pdlc/hooks/scripts/sync-workflows.sh --check` exits 0 (consumer runtime not left stale).
- [ ] OQ-7's erratum either landed and is transcribed in A6-09's ignored-path case, or that one case
      is still marked upstream-pending with its expected value named — never silently dropped.
