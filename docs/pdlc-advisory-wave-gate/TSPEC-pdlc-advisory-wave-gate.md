# TSPEC — pdlc-advisory-wave-gate

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → **TSPEC**` (`docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` v1.3) |
| Downstream | `DECISIONS`, `PLAN`, `PROPERTIES`, `IMPL` |
| Cross-Reviews | (active) |
| LEARNINGS | `docs/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 1.0 | 2026-08-19 |

## 1. Summary

**One line.** A6 is a sixth advisory seam wired into the *one* place `orchestrate-dev.js`'s Phase I
wave loop throws on a red script-owned test gate; it snapshots the whole tree, gets one bounded
in-envelope repair, re-runs the wave's own gate sequence, and — unless that sequence returns green on
its own — restores the snapshot and rethrows the byte-identical halt with a diagnosis attached.

### 1.1 What this document decides

The FSPEC routed five obligations here (§7.1 there). Each is answered in one named place:

| # | Obligation | Answered in | Decision in one line |
|---|---|---|---|
| O-1 | Restoration mechanism, and when the pre-A6 tree is captured | §2.4, §3.5 | A dangling snapshot commit built with `git add -A` + `write-tree` + `commit-tree`, captured once per wave immediately after the first red gate and before any dispatch; restored with `read-tree --reset -u` + `clean -fd` + `reset --mixed` |
| O-3 | Reuse of the tier's exported model rung | §2.2 | `runAdvisorySeam` already resolves the rung through `resolveAdvisoryRung`; A6 adds no rung code at all, so NFR-6 is discharged by not writing anything |
| O-4 | How the owned-path set is computed and compared | §3.4, §4.3 | Computed from the same `parsePlanOwnership` rows `computeWaves` already annotates onto each task; compared by the tier's shipped `classifyEnvelope` X-d clause over a live `declaredScope` array, the `buildA4SeamOps` idiom |
| O-5 | Whether the root cause is derived by the seam or supplied by the wave's agents | §3.3 | Supplied by the **A6 agent**, on its own `ROOT-CAUSE:` trailer line, read by a total parser; the wave's own agents are gone by gate time. Q-4's ownership-delivery check is *evidence*, never the verdict |
| O-8 | How an E-6 repair reaches committed state, and how the later task is told | §2.5, §3.6 | The wave commit loop's existing `commitPaths` writer gains one more pathspec — the promotion's paths, scoped to the later task's owned set — and `waveImplementPrompt` gains a promotions clause read by that task's dispatch |

### 1.2 Where the code goes

Everything lands in `pdlc/workflows/orchestrate-dev.js`. That is not a preference: the workflow
runtime loads one bundled artifact per script (`pdlc/workflows/dist/orchestrate-dev.bundle.js`,
built by `build-runtime.mjs`), and every advisory-tier symbol — `ADVISORY_SEAMS`,
`classifyEnvelope`, `runAdvisorySeam`, `appendAdvisoryEntry`, `appendEscalationEntry` — already
lives in that one module. A6 is placed as three adjacent regions:

| Region | Neighbour it sits beside | Why there |
|---|---|---|
| Constants and vocabularies (§3.1) | `ADVISORY_SEAMS` / `ENVELOPE_DEFAULTS` / `ADVISORY_DEFAULTS` | The three transcribed set-equality surfaces BL-06 names are edited together or not at all |
| `buildA6SeamOps` and its pure helpers (§3.3–§3.5) | `buildA4SeamOps` / `buildA5SeamOps` | Same `SeamOps` contract, same file region, same test-double shape |
| The Phase I wiring (§2.3) | the wave loop's `if (scriptGate)` gate block | The seam fires at exactly one call site and nowhere else |

No new module, no new file, no new transport, no new credential (NFR-3): A6 uses `_git`,
`_runCommand`, `_readFile`, `_appendFile` and `_agent` — every one of them already threaded into
Phase I or into `runAdvisorySeam`.

### 1.3 What is deliberately not additive

R-5 and BL-06 said this feature cannot ship as a purely additive change, and the grounding confirms
it. Six shipped surfaces go red the moment `A6` is declared, and every one is a *transcribed
literal* in a test rather than a computed value:

| Surface | Site | Change |
|---|---|---|
| `ADVISORY_SEAMS` | `orchestrate-dev.js`, asserted in `advisoryEnvelope.test.js` (`toEqual(["A1", "A2", "A3", "A4", "A5"])`) | six members |
| `ENVELOPE_DEFAULTS` | `orchestrate-dev.js`, asserted in `advisoryEnvelope.test.js` (`["E-1", "E-2", "E-3", "E-4"]`) | six members |
| `ADVISORY_DEFAULTS` key set | `advisoryConfig.test.js`'s re-declared local literal | gains `waveBudgetPerRun` |
| Per-seam report rows | `advisoryRecord.test.js`'s `rows.map((r) => r.seam)` equality and its `test.each` seam list | six rows |
| Gate-exclusivity registry | `advisoryDriver.test.js`'s `GATE_EXCLUSIVITY_REGISTRY` key set, asserted equal to `ADVISORY_SEAMS` | gains an `A6` block |
| Harvest / property seam lists | `advisoryHarvest.test.js`, `consolidationProperties.test.js`, `helpers/advisoryDoubles.js`'s `SEAMS` | six members |

A PLAN that treats any of these as incidental will discover them as unexplained red suites in the
middle of a wave — which is, with some irony, exactly the failure class A6 exists to survive.

## 2. Architecture

### 2.1 The shipped wave loop, as measured

Phase I's wave loop (`orchestrate-dev.js`, the `for (let waveIndex = 0; ...)` block inside the
wave-mode branch) runs, per wave, in this order:

1. `parallelFn(...)` dispatches the wave's `se-implement` agents on `MODEL_IMPLEMENTATION`, told
   not to commit (`waveImplementPrompt`'s `Do NOT git commit` clause).
2. `evaluateWaveDispatch(waveResults, waveIndex, wave)` — a dispatch-level failure throws here
   (M-WG-1).
3. `if (implConfig.postWaveCommand && typeof runCommandFn === "function")` — the post-wave command
   runs **before** the gate, and a failure throws `Wave N post-wave command failed` (M-WG-2).
4. `if (scriptGate)` — `runCommandFn(implConfig.testCommand)`; a failure throws
   `Wave N test gate failed` (M-WG-3). Otherwise `evaluateBatchGate` — the legacy self-report gate.
5. `checkWaveUnskips` — the un-skip guard, after the gate and before the commits.
6. `commitPaths` per task over `task.files`, then one `commitPaths` over
   `implConfig.postWavePathspecs` when the post-wave command ran (M-WG-4, M-WG-12).
7. `writeWaveLedger(...)` — `.claude/pdlc-wave-state.json`, committed waves only.

A6 changes step 4 and step 6, and nothing else. Steps 1–3, 5 and 7 keep their code and their
messages byte for byte.

### 2.2 Component graph

```
Phase I wave loop
  └─ runWaveGateSequence()          pure-ish; runs post-wave then test, records the invocation list
  └─ (red test gate) ──► runWaveGateSeam()            §3.2 — the A6 call site, one place
        ├─ captureTreeSnapshot()     §3.5 — git plumbing, before any dispatch
        ├─ buildA6SeamOps()          §3.3 — the SeamOps the tier's driver consumes
        │     ├─ waveOwnedPaths()    §3.4 — E-5 set   (pure)
        │     ├─ laterOwnedPaths()   §3.4 — E-6 set   (pure)
        │     ├─ parseA6RootCause()  §3.3 — total, closed vocabulary (pure)
        │     └─ citesGateOutput()   §3.3 — BR-3's decidable evidence rule (pure)
        └─ runAdvisorySeam()         SHIPPED, unchanged except one optional hook (§3.7)
              ├─ resolveAdvisoryRung()   SHIPPED — NFR-6, O-3: reused, never restated
              ├─ classifyEnvelope()      SHIPPED — X-a…X-e, ordered, unchanged (BR-5)
              ├─ appendAdvisoryEntry()   SHIPPED — AC-6.1
              └─ appendEscalationEntry() SHIPPED — AC-6.2
```

Every box marked SHIPPED is a cite-and-reuse, not a re-implementation. The reuse is the design:
BR-5's precedence claim, BR-15's eight-member reason set and NFR-6's rung are all discharged by
*not writing code*, and the tests that already pin them keep pinning them.

### 2.3 Where A6 fires, and the halt that survives it

Today's step 4 is a `throw haltError(...)` inline. It becomes:

```js
const gateOutcome = await runWaveGateSequence({ implConfig, scriptGate, runCommandFn, invocations });
if (gateOutcome.failed === "post-wave") throw haltError(POST_WAVE_MESSAGE);   // M-WG-2, unchanged
if (gateOutcome.failed === "test") {
  const a6 = await runWaveGateSeamFn({ /* §3.2 */ });
  if (!a6.resolved) throw haltError(TEST_GATE_MESSAGE, { advisory: a6.haltFields });
}
```

Three properties of this shape are load-bearing:

- **The halt message is computed from the *first pass's* gate result**, not the last re-gate's, and
  is the same template string the pre-A6 code built. AT-05-3's oracle compares that literal; AT-04-1
  compares it again on a run where A6 asserted, with the highest confidence, that the wave was
  fixed. The diagnosis travels as `haltError`'s second argument (`fields`, which `Object.assign`s
  onto the error and which `main()`'s catch already reports), never inside the reason string —
  that is how AC-6.3 and AT-05-3 hold at once.
- **A6 is unreachable from the post-wave arm** and from the `else` legacy self-report arm, because
  neither calls it. BR-1's exclusions are structural, not asserted (AT-01-2).
- **The V-wave's gate is a different call site** (`if (scriptGate) { const vGate = await
  runCommandFn(...) }`, after the wave loop) and is left untouched, so AC-1.3 is likewise
  structural: the V-wave has no ownership row, and the code that would consult one is not there.

### 2.4 The invocation ledger, and why the sequence is recorded not reconstructed

BR-7's oracle is an **ordered sequence** of gate-command invocations per wave. Reconstructing it
after the fact from log text would be an absence-shaped oracle, so `runWaveGateSequence` takes an
`invocations` array and pushes one token — `"post-wave"` or `"test"` — immediately *before* each
`runCommandFn` call, whether or not that call passes. The array is per wave, lives in the wave
loop's own scope, and is the single operand AT-04-2 asserts against:

| Configuration | One attempt, red re-gate | Green re-gate |
|---|---|---|
| both commands | `[post-wave, test, post-wave, test]` | same |
| both, re-gate's post-wave fails | `[post-wave, test, post-wave]` | — |
| test command only | `[test, test]` | same |

Because the same helper serves the first pass and every re-gate, "the re-gate re-runs the wave's
own sequence in the wave's own order" (AC-4.4) cannot drift: there is one sequence implementation,
not two. A re-gate that skipped a configured command would require a second code path that does not
exist.

### 2.5 Restoration: whole tree, one snapshot per wave

BR-9 demands a content-level restore over tracked *and* untracked files, generated outputs included,
because the re-run post-wave command writes into paths no envelope rule ranges over. `git stash` is
the obvious reach and the wrong one: it mutates the working tree at capture time, which is exactly
what must not happen to a wave whose agents' uncommitted work is the thing being protected.

The mechanism is a **dangling snapshot commit**, built without touching the working tree:

```
capture:   git rev-parse HEAD                        → head
           git add -A --                              (stages tracked + untracked; ignores .gitignore)
           git write-tree                             → tree
           git commit-tree {tree} -p {head} -m "…"    → snap
           git update-ref refs/pdlc/a6-snapshot {snap}
           git reset --mixed {head}                   (index back as it was; worktree untouched)

restore:   git read-tree --reset -u {tree}            (index + worktree ← snapshot)
           git clean -fd                              (drop files the repair added; -x deliberately absent)
           git reset --mixed {head}                   (index back as it was)
```

Four decisions inside that:

- **`git add -A` then `git reset --mixed`, never a bare `git stash`.** The capture is index-only and
  self-reversing, so the tree the wave agents left is the tree A6 diagnoses. The wave discipline
  (`Do NOT git commit`) means the index equals HEAD on entry, which is what makes the reset exact;
  a wave that staged anything anyway loses only its *staging*, never its content, and §6 O-Q1
  records that as an accepted deviation.
- **`clean -fd`, not `clean -fdx`.** `git add -A` skips ignored paths, so restoring must skip them
  too, or the restore would delete `node_modules/` and `.claude/workflows/` — files that were never
  in the snapshot and were never A6's to touch. Capture and restore share one ignore semantics.
- **One snapshot per wave, not per attempt.** BR-9 pins the restore target as "the wave's
  post-dispatch, pre-commit tree" — the state before A6 *first* acted. Every red re-gate on that
  wave restores to the same tree, so attempt 2 starts where attempt 1 started (§3.2 step 6).
- **A durable ref, so a failed restore is recoverable.** `refs/pdlc/a6-snapshot` is not a branch,
  is never pushed, and is overwritten per wave. E-28's halt names it, which is the difference
  between "A6 left a tree it could neither repair nor restore" and "A6 left a tree, and here is the
  object name that has the original in it".

**Failure is fail-closed.** Any capture or restore git call returning `ok !== true` is thrown from
`seamOps.revert()`. `runAdvisorySeam`'s `doRevert` tags it `__isRevertFailure` and its terminal
catch rethrows anything so tagged rather than mapping it to an escalation — shipped behaviour,
relied on here rather than re-invented. The throw reaches Phase I as a halt, before any commit,
which is AT-05-5. A capture that fails means A6 never dispatches at all: the seam refuses to act on
a tree it cannot put back.

### 2.6 Ordering constraint: applicability is decided before the branch that hides it

AC-1.5 needs one inapplicability notice naming *every* absent prerequisite, in a run where the
carrier for one of them is unreachable. In shipped code the two carriers sit in mutually exclusive
branches: the "no valid file-ownership manifest" notice is emitted inside `if (!waveMode)`, and the
"script-owned test gate is unavailable" notice inside the wave-mode branch, after `implConfig` is
parsed — which happens *after* the `!waveMode` early return. A no-manifest run therefore cannot
today say anything about its test command, because it has not read the config yet.

The fix is an ordering change, not a new notice channel: the implementation-config read
(`readMergeConfigSafely` + `parseImplementationConfig`) and the `scriptGate` computation are hoisted
above the `if (!waveMode)` branch, and the legacy branch's notice is widened to name both absent
prerequisites when both are absent. Consequences, stated rather than discovered:

- A legacy-path run now emits the implementation-config malformed-section and invalid-key notices it
  did not emit before. These are report text; NFR-2 pins the created-file set and the phase
  outcomes, not the report prose, and AT-01-3's oracle is the halt reason string and the queue row.
- The notice names prerequisites, never A6. AT-01-5's oracle counts inapplicability *statements* on
  the whole notice surface and must not filter for A6 authorship — A6 authors none, by construction,
  and this is why.

## 3. Interfaces

*(pending)*

## 4. Data Model

*(pending)*

## 5. Test Strategy

*(pending)*

## 6. Open Questions

*(pending)*
