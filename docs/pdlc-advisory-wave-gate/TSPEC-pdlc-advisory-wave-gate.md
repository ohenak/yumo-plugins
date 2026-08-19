# TSPEC — pdlc-advisory-wave-gate

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → **TSPEC**` (`docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` v1.3) |
| Downstream | `DECISIONS`, `PLAN`, `PROPERTIES`, `IMPL` |
| Cross-Reviews | `CROSS-REVIEW-product-manager-TSPEC-v1.md`, `CROSS-REVIEW-test-engineer-TSPEC-v1.md` (active) |
| LEARNINGS | `docs/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 1.1 | 2026-08-20 |

## Changelog

**v1.1 (round 1).** All six High findings addressed. PM F-01: the `.gitignore` carve-out is
no longer decided here — it is raised as an erratum on FSPEC BR-9 / AT-05-1 and REQ AC-5.1,
and §2.5 / §5.2 now transcribe the boundary as *pending upstream*, not as a TSPEC narrowing.
PM F-02: snapshot-capture failure gets a named terminal disposition that writes an advisory
record entry and an escalation entry, reconciled across §2.5, §3.2, §3.5, §4.5 and §5.1.
PM F-03 + TE F-03: §5.5 allocates one test per prohibition `(f)`…`(i)`, AC-4.5's paired
positive rule, and AC-4.1's conjunct-(iii) mutation fixture; §5.6 maps every FSPEC AT to a
test home and a one-line oracle. TE F-01: §4.5 gains the post-gate un-skip halt-report
contract AT-05-4 needs. TE F-02: §5.1's edit set now equals §1.3's. Mediums answered in
place (§2.6 disabled-tier notices, §3.3 precedence residual and `apply`'s observation,
§3.4 trailing-slash precondition, §5.4 coverage mechanics, §5.5 citation-floor boundary);
lows fixed as cited (`async () => true`, `commitPaths`'s `message`, Phase H2 not Phase PUB,
§6 rows OQ-5…OQ-7).

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
  a wave that staged anything anyway loses only its *staging*, never its content, and §6 OQ-5
  records that as an accepted deviation.
- **`clean -fd`, not `clean -fdx` — and the boundary is upstream's, not this document's.**
  `git add -A` skips `.gitignore`d paths, so capture never records them; a restore that ran
  `-fdx` would delete files the snapshot never held — `node_modules/`, `.claude/workflows/` —
  which is a worse defect than the one it fixes. Capture and restore share one ignore semantics
  because they must. But FSPEC BR-9 and AT-05-1 state the oracle over "tracked **and untracked**
  files alike, generated outputs included" with no ignored-path carve-out, and REQ AC-5.1 states
  it with none either. A wave whose post-wave command writes a generated output into an ignored
  path is therefore inside the oracle as written and outside this mechanism. **This TSPEC does
  not narrow AC-5.1 by design choice.** The carve-out is raised as an erratum on FSPEC BR-9 and
  AT-05-1 (and REQ AC-5.1); this section transcribes whatever boundary comes back approved. If
  upstream ratifies the carve-out, this bullet stands as written and §5.2 pins it. If upstream
  instead holds ignored generated outputs inside the oracle, the mechanism grows a *scoped*
  ignored-path capture — the post-wave pathspecs only, never the whole ignored tree — and this
  bullet is rewritten to that. Until the erratum resolves, §6 OQ-7 carries the open boundary.
- **One snapshot per wave, not per attempt.** BR-9 pins the restore target as "the wave's
  post-dispatch, pre-commit tree" — the state before A6 *first* acted. Every red re-gate on that
  wave restores to the same tree, so attempt 2 starts where attempt 1 started (§3.2 step 6).
- **A durable ref, so a failed restore is recoverable.** `refs/pdlc/a6-snapshot` is not a branch,
  is never pushed, and is overwritten per wave. E-28's halt names it, which is the difference
  between "A6 left a tree it could neither repair nor restore" and "A6 left a tree, and here is the
  object name that has the original in it".

**Failure is fail-closed, and failing still writes the record.** Any capture or restore git
call returning `ok !== true` is thrown. On the **restore** side the throw comes out of
`seamOps.revert()`; `runAdvisorySeam`'s `doRevert` tags it `__isRevertFailure` and its terminal
catch rethrows the tagged error rather than mapping it to an escalation — shipped behaviour,
relied on rather than re-invented. That throw reaches the Phase I halt before any commit
(E-28, AT-05-5).

The **capture** side is not symmetric with it, and PM F-02 is right that the first draft left it
silent. AC-6.1 binds on *any A6 invocation*, and by the time capture runs the invocation has
happened: `runWaveGateSeam` was called, the tier gate passed, the wave budget was checked. A
capture failure that halted with nothing written would leave the operator with a red wave, an
engaged seam and no durable trace. So capture failure takes the same route step 3's
no-dispatch budget escalation takes — the shipped `__preDispatch` escape — with:

| Field | Value on capture failure |
|---|---|
| Terminal disposition | `escalated`, reason `snapshot-unavailable` |
| Attempts consumed | `0` — no `_agent` call, no rung resolution occurs (as in E-26) |
| Advisory record entry | written, root-cause class `unclassified`, action refused (AC-6.1) |
| Escalation-log entry | written, carrying the same class (AC-6.2) |
| Wave budget | untouched — only `resolved` increments it (E-27) |
| Halt | the wave's own `Wave N test gate failed` literal (AT-05-3), with §4.5's advisory halt fields attached (AC-6.3) |
| Restoration | none performed, and none owed: nothing was dispatched, so nothing was applied |

`snapshot-unavailable` is A6-local vocabulary in the *reason* position, not a new member of
`ADVISORY_ROOT_CAUSES` — the root-cause class stays `unclassified`, because no diagnosis was
ever obtained. §3.2 step 4 and §3.5 are stated to this one contract: "capture failure halts
here" was the earlier, looser wording and is superseded; capture failure **escalates through
`terminate`, then halts**, in that order. §5.1's new-suite row carries the case.

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


Two questions the reviewers asked of this hoist, answered here rather than in Phase I:

- **The hoist is unconditional, and that is deliberate (PM F-05).** The implementation-config
  read and the `scriptGate` computation move above `if (!waveMode)` with **no** `advisory.enabled`
  guard, so a run with the tier switched off emits exactly the same prerequisite notices as a run
  with it on. The notices describe *prerequisites* — no valid file-ownership manifest, no
  script-owned test gate — not the seam; A6 authors none of them (that is §2.6's whole point).
  NFR-2 pins the created-file set and the phase outcomes, not report prose, so this satisfies its
  letter; AC-1.4's spirit is served because the sentence an operator reads is true whether or not
  the tier exists. §5.2's disabled-tier bullet is extended to pin this answer rather than leave it
  unasserted: under `advisory.enabled: false` the prerequisite notice surface is **identical** to
  the enabled-but-never-fired run, and the `advisory` report key is still absent.

- **Exactly one inapplicability statement, because only the emit site is shared (TE F-08).** The
  hoist moves the *computation* of `implConfig` and `scriptGate`; it does **not** move either
  `emit` call. The legacy branch keeps one widened notice naming whichever prerequisites are
  absent — one statement, listing one or two causes — and the wave-mode branch keeps its
  `if (!scriptGate)` emit, unreachable from the legacy branch because the branches are mutually
  exclusive. A run with no manifest **and** no `testCommand` therefore emits one statement naming
  both, never two. AT-01-5 counts statements over the whole notice surface, so this is the
  load-bearing shape: the widened notice must be built as a single message with a list, never as
  two `emit` calls in sequence. §5.5 gives it a test on the both-absent fixture, which is the only
  configuration where the difference is observable.

## 3. Interfaces

Every signature below is a module-scope export of `pdlc/workflows/orchestrate-dev.js` unless marked
*(module-private)*. Pure functions take their inputs; nothing reads `process`, a clock, or ambient
state — the runtime forbids the first two outright and DC-04 forbids the third.

### 3.1 Constants — the transcribed surfaces

```js
export const ADVISORY_SEAMS = Object.freeze(["A1", "A2", "A3", "A4", "A5", "A6"]);
export const ENVELOPE_DEFAULTS = Object.freeze(["E-1", "E-2", "E-3", "E-4", "E-5", "E-6"]);
export const ADVISORY_DEFAULTS = Object.freeze({
  enabled: false, attemptBudget: 3, seamBudgetMinutes: 10,
  waveBudgetPerRun: 1, envelope: ENVELOPE_DEFAULTS,
});
export const ADVISORY_ROOT_CAUSES = Object.freeze([
  "plan-ordering-defect", "wave-internal-defect", "environmental", "unclassified",
]);
export const A6_PROHIBITIONS = Object.freeze(["f", "g", "h", "i"]);
```

`ADVISORY_SEAM_PHASES` gains `A6: { id: "I", outcome: "halted" }` so the escalation log's *Pipeline
state* field is derived, not passed per call site — the shipped rationale for that table, unchanged.

`parseAdvisoryConfig` gains one key. It cannot reuse the existing `positiveInt` helper: that
validator requires `v >= 1`, and E-33 requires `0` to survive as a configured value rather than be
reported invalid and defaulted. A sibling `nonNegativeInt` (`Number.isInteger(v) && v >= 0`) is
added beside it, and `waveBudgetPerRun` is the only key that uses it. Per-key independent fallback
is preserved: one bad key never retunes the others (the shipped contract).

### 3.2 The call site — `runWaveGateSeam`

*(module-private; injected into the Phase I loop as `runWaveGateSeamFn` so tests can substitute it,
the way `runAdvisorySeamFn` is already injected.)*

```js
async function runWaveGateSeam({
  feature, waveNum, waves, waveIndex, tasks, ownership, implConfig, scriptGate,
  gateResult,          // the FIRST pass's { ok:false, output } — the evidence, untruncated
  invocations,         // the per-wave sequence array (§2.4)
  advisoryConfig, rungState, waveBudget,   // waveBudget: { resolved: number }
  promotions,          // Map<taskId, {paths: string[], symbol: string}> — §3.6
  _agent, _git, _runCommand, _readFile, _appendFile, _log, _now, _sleep, _notice,
}) : Promise<{
  resolved: boolean,
  disposition: AdvisoryDisposition,
  haltFields: { rootCause: string, diagnosis: string, repairApplied: boolean, repairPaths: string[] },
  postWaveRan: boolean,
}>
```

Control flow, in the order the FSPEC's §3.2 steps name:

1. **Applicability** is already decided by the caller: this function is called only from the
   wave-mode branch, only under `scriptGate`, only for an ordinary wave, only on a red test gate.
   Steps 1 and 2 are therefore *structural* — there is no `if` to get wrong (BR-1, AC-1.2, AC-1.3).
2. **Tier gate.** `advisoryConfig.enabled === false` returns `{resolved:false}` before anything
   else — before the snapshot, before `buildA6SeamOps`, before any rung resolution. `runAdvisorySeam`
   also returns early on a disabled config; the check is duplicated here deliberately, because
   AC-1.4's inertness claim covers the *snapshot* too, and the snapshot is A6's, not the driver's.
3. **Wave budget.** `waveBudget.resolved >= advisoryConfig.waveBudgetPerRun` ⇒ escalate with no
   dispatch, via the shipped `{ __preDispatch: { outcome: "escalated", reason: "budget-exhausted" } }`
   escape `gatherEvidence` already supports. The advisory record and the escalation log are still
   written — that path runs through `terminate` — and no `_agent` call and no rung resolution occur
   (E-26). Only `outcome === "resolved"` increments `waveBudget.resolved`, so two escalated waves
   leave the budget untouched (E-27, AT-02-6).
4. **Snapshot.** `captureTreeSnapshot` (§3.5). A capture failure does **not** halt silently
   here: it takes §2.5's `snapshot-unavailable` route — the same `__preDispatch` escape step 3
   uses — so the advisory record entry and the escalation entry are written, no `_agent` call
   and no rung resolution occur, no attempt is consumed, and the function returns
   `{resolved: false}` carrying §4.5's halt fields. The wave then halts on its own gate literal
   at the call site. Escalate first, halt second.
5. **Dispatch.** `runAdvisorySeam({ seam: "A6", seamOps: buildA6SeamOps(...), config, rungState, … })`.
   Attempt budget, wall-clock budget, malformed-verdict handling, the GATE/CHECK envelope
   evaluations, the advisory record, the escalation log and the `ADVISORY ESCALATION:` notice are all
   the driver's, unchanged.
6. **Terminal.** `outcome === "resolved"` ⇒ `resolved: true`, `waveBudget.resolved += 1`, and the
   snapshot ref is left in place for the operator. Any other outcome ⇒ the tree has already been
   restored by `seamOps.revert()` on the failing path, and the caller rethrows the first pass's
   halt.

### 3.3 `buildA6SeamOps` — the SeamOps the shipped driver consumes

```js
export function buildA6SeamOps({
  feature, waveNum, waves, waveIndex, tasks, gateOutput, implConfig, scriptGate,
  invocations, snapshot, _git, _runCommand,
}) : SeamOps
```

| Member | Behaviour |
|---|---|
| `gatherEvidence` | Returns the **full captured gate output** (`gateResult.output`), never `outputTail`'s 30 lines. AT-02-5's oracle is a citation to a region the tail does not contain, and this is why it can exist (E-12, BR-3). Also computes the E-5 and E-6 owned-path sets (§3.4) and fills `declaredScope` in place |
| `prompt` | States the four-class vocabulary, the two envelope members and their decidable rules, the `ROOT-CAUSE:`/`PROMOTES:`/`PROMOTES-TASK:` trailer lines, and the citation rule verbatim. Instructional only — BR-16: every one of these is *also* checked by the script, and no rule here is satisfied by having told the agent about it |
| `conditionHolds` | `async () => true` — an async arrow, not the literal `true`: the driver calls `await seamOps.conditionHolds()` and a literal would throw. `buildA3SeamOps` is the shipped precedent. It returns true unconditionally because the condition *is* the red gate, observed by the script one step earlier; re-running the suite to re-confirm it would double the wave's slowest cost. A `false` here would yield `no-action`, which is not a disposition this seam has |
| `classifyReply` | §3.7's optional hook: BR-3's citation rule (⇒ malformed, one attempt) then BR-2's vocabulary read (⇒ escalate, no attempt) |
| `apply` | Dispatches the repair edit, then returns `{ok:true}` **iff `producedPaths()` is non-empty** — that is the observation, stated so it cannot be read as an unspecified notion of "tree changed". `apply` calls the same `producedPaths` the driver calls at step 5, so the two can never disagree. An empty set is `{ok:false}` ⇒ `post-action-verification-failed`. **A repair writing only `.gitignore`d paths therefore reads as no change and is refused here**, which is the right disposition while §2.5's boundary sits with upstream: the seam refuses to claim a repair it cannot see, cannot restore, and cannot prove was undone. If the erratum widens BR-9's oracle to ignored generated outputs, the widened capture arrives with a widened `producedPaths` and this row is unchanged; if it does not, the refusal is the documented outcome rather than a silent survival past step 5's CHECK. §5.5 gives it a test |
| `producedPaths` | `git diff --name-only` **unioned with** `git ls-files --others --exclude-standard`. The untracked half is not optional: a promotion that creates a new file would otherwise be invisible to the step-5 CHECK, and E-6's whole purpose is creating things |
| `revert` | `restoreTreeSnapshot(snapshot)` (§3.5). Whole tree, every trigger |
| `verifyGate` | Re-runs `runWaveGateSequence` — post-wave then test, appending to `invocations`. Returns `{passed:true}` on a green sequence; on red, `{passed:false, consumesAttempt:true}` so the driver restores, consumes one attempt and re-enters its loop, exhausting to `budget-exhausted` (BR-7, BR-9, E-20, E-24, AT-02-9) |
| `declaredScope` | A **live array**, mutated in place (`.length = 0; push(...)`), never reassigned — the `buildA4SeamOps` idiom, required because the driver captures the reference once at GATE and the test doubles shallow-copy the SeamOps object |
| `permittedActions` | `["E-5", "E-6"]`, narrowed per invocation: `E-6` is dropped when the wave is the last one, since there is no later task for a promotion to belong to |

**`PROPOSED-ACTION:` carries an envelope member id**, not prose — the shipped convention
(`buildA5SeamOps`'s `apply` compares `verdict.proposedAction === "E-1"`, `buildA4SeamOps` declares
`permittedActions = ["E-3"]`). `classifyEnvelope`'s X-c clause then refuses any other value with no
A6-specific code.

Two pure helpers carry the rules that are A6's own:

```js
export function parseA6RootCause(raw) : string        // total; ∈ ADVISORY_ROOT_CAUSES
export function citesGateOutput(evidence, gateOutput) : boolean
```

- `parseA6RootCause` reads the last `ROOT-CAUSE:` line with the same last-wins `extract` discipline
  `parseAdvisoryVerdict` uses, trims it, and returns it iff it is a member of `ADVISORY_ROOT_CAUSES`.
  Absent, empty, out-of-set, or non-string ⇒ `"unclassified"`. Total on the receiving side, closed
  on the emitting side (C-3, DC-01, BR-2). It is deliberately **not** a sixth malformedness rule
  inside `parseAdvisoryVerdict`: E-08's outcome (escalate, no attempt consumed) differs from E-07's
  (escalate, one attempt consumed), and folding them into one parser would erase that difference.
- `citesGateOutput` is BR-3's decidable rule: true iff some member of `verdict.evidence`, with
  runs of whitespace collapsed and ends trimmed, is at least `A6_MIN_CITATION_CHARS` (24) long
  **and** is a substring of the identically-normalised gate output. The floor exists because a
  citation short enough to be guessed (`FAILED`, `Error`) is not evidence that the agent read
  anything. A paraphrase fails, costs one attempt, and the prompt states the rule — bounded by
  `attemptBudget`, which is the point of having one.

### 3.4 Owned-path sets, and how a proposal is compared against them (O-4)

```js
export function waveOwnedPaths(waves, waveIndex) : string[]   // E-5 — pure
export function laterOwnedPaths(waves, waveIndex) : string[]  // E-6 — pure
export function ownedSetCovers(ownedSet, path) : boolean      // pure
```

The sets are not recomputed from the PLAN text. `computeWaves(tasks, iOwnership)` already annotates
every task with its `files` array, straight from `parsePlanOwnership`'s rows, and Phase P has
already gated that manifest against the task table (`validatePlanContract`). So:

- **E-5** = the union of `task.files` over `waves[waveIndex]`.
- **E-6** = the union of `task.files` over every `waves[j]` with `j > waveIndex`.

`ownedSetCovers` reuses `pathsCollide` — the same predicate `computeWaves` uses to keep a wave
ownership-disjoint — so a manifest row naming a directory (`pdlc/workflows/dist/`) covers files
beneath it, and a run's envelope decision and its wave-packing decision cannot disagree about what
a manifest row means.

**Comparison happens twice, through the shipped `classifyEnvelope`, not through a new matcher.**
`declaredScope` starts as `E-5 ∪ E-6` (exact manifest entries). `producedPaths()` then rewrites it
**in place** to `E-5 ∪ E-6 ∪ {produced paths p : ∃ e ∈ (E-5 ∪ E-6), ownedSetCovers(e, p)}` before
returning. X-d's `scope.includes(p)` is exact string membership, so without that widening a
legitimately-owned file under a directory row would be refused, and with it a path under no row at
all is still refused — which is exactly E-16's partial-proposal case and AC-3.3's "any path outside
the computed set". The in-place mutation is mandatory and is the documented `buildA4SeamOps` idiom;
a reassignment would be invisible to the driver's already-captured `gateCtx`.

**E-6's symbol half is script-checked, in three conjuncts.** The verdict declares
`PROMOTES: {symbol}` and `PROMOTES-TASK: {taskId}`; `apply` proceeds only if all three hold:

1. `taskId` names a task in a wave strictly later than `waveIndex`;
2. `symbol` occurs in that task's PLAN row text (`task.description`, which `waveImplementPrompt`
   already reads) — the row "already undertakes to produce" it;
3. `symbol` occurs in the captured gate output — the failure actually named it.

Any conjunct failing refuses `out-of-envelope`. AT-03-4's companion — symbol half satisfied,
path outside the later task's owned set — is refused by conjunct (2) of BR-4's rule instead, via
X-d over `producedPaths`.

**Exclusions still win.** `classifyEnvelope` walks `ADVISORY_EXCLUSIONS` in its shipped order —
`X-a`, `X-e`, `X-d`, `X-b`, `X-c` — so a repair confined to the wave's own owned paths whose target
is a test file is refused `revert-on-test-touch` (X-a, first) rather than permitted under E-5
(AT-03-2), and a wave owning `pdlc/workflows/` is refused `out-of-envelope` (X-e, via
`effectiveGuardPaths(undefined)` ⊇ `MERGE_GUARD_DEFAULTS` = `pdlc/workflows/`, `pdlc/skills/`,
`pdlc/hooks/`, `.claude/workflows/`) — AT-03-3, and in this repository the common case. Neither
behaviour is A6 code. The ordering is the reason AT-03-8's oracle must be sequence equality.

### 3.5 Snapshot and restore (O-1)

```js
export async function captureTreeSnapshot({ feature, waveNum, _git, _sleep, emit })
  : Promise<{ head: string, tree: string, snap: string } | null>
export async function restoreTreeSnapshot(snapshot, { _git, _sleep, emit }) : Promise<void>
```

Both run the plumbing of §2.5 through the injected `_git(argv)` transport, whose contract is
`{ok, stdout, stderr}` and which never throws (`defaultGit`). `git add` and `git reset` go through
`gitWithLockRetry`, because a wave's agents run in one shared tree and their tooling can still hold
`.git/index.lock` for a second or two after the dispatch returned — the shipped reason
`commitPaths` retries the same two verbs.

- `captureTreeSnapshot` returns `null` on any `ok !== true`; the caller emits a notice and does not
  dispatch. Refusing to act beats acting without a way back.
- `restoreTreeSnapshot` **throws** on any `ok !== true`. The throw is what `doRevert` tags
  `__isRevertFailure` and the driver's terminal catch rethrows — E-28, AT-05-5.

`_git` is agent-transcribed at runtime, so a garbled reply reads as `ok !== true` and lands in the
fail-closed arm. That is the correct direction: a snapshot A6 cannot prove it took is a snapshot it
does not have.

### 3.6 Committing an E-6 repair, and telling the later task (O-8)

M-WG-12 is the gap: the wave commit loop commits only paths owned by tasks *in that wave*, and an
E-6 promotion by construction lands in a later task's paths. Left alone, a resolved wave would
strand its own repair as an uncommitted working-tree change.

The fix widens the **pathspec** the existing writer passes, and adds no writer. After the per-task
loop, inside the same `if (waveGit)` block and past the same green gate, one further `commitPaths`
call runs with `paths` = the promotion's produced paths (already proven ⊆ the later task's owned
set by §3.4), `what` = `Wave N advisory promotion (task T)`, and the same `provenance`. AT-04-3's
oracle is over committing **writer identities** and the green-gate precondition, and its own text
grants that "that scope may widen under O-8's E-6 resolution" — so the identity set stays
`{per-task pathspec commit, post-wave-pathspec build-output commit}`, both still unreachable except
past a green gate. **This is the load-bearing interpretive decision of the feature** and §6 records
it as such: a reviewer who reads AT-04-3 as counting *call sites* rather than identities would
require a different design, and that disagreement is cheaper to have now than in Phase I.

The later task's dispatch is told through the prompt: `waveImplementPrompt(task, featureName,
promotions)` gains an optional third argument, a `Map<taskId, {paths, symbol}>` threaded down the
wave loop. When the map has a row for the task being dispatched, the prompt carries one clause
naming the symbol and its paths and instructing the agent to revise what exists rather than
rediscover it (BR-12). Absent a row, the prompt is byte-identical to today's — which is what keeps
every existing prompt fixture green.

The map lives in the Phase I scope, so the clause reaches a later task **in the same run**. Across
runs it does not survive; the *commit* does, so the later task's agent finds the promotion in the
tree either way. §6 OQ-6 records the asymmetry rather than leaving it to be discovered.

### 3.7 The one change to the shipped driver

`runAdvisorySeam` gains a single optional seam, defaulted so A1–A5 are unchanged in shape and in
bytes:

```js
/** @property {null | ((raw: string, verdict: AdvisoryVerdict) =>
 *    {ok: true} | {malformed: true, why: string} | {terminate: {outcome: string, reason: string|null}})} */
seamOps.classifyReply
```

Called once per attempt, immediately after `parseAdvisoryVerdict` returns a well-formed verdict and
after `_summarise` has run, and before RE-CHECK. Three returns, three shipped arms:

| Return | Driver behaviour | Realises |
|---|---|---|
| `{ok:true}` (and the default `null`) | proceed to RE-CHECK | A1–A5, unchanged |
| `{malformed:true}` | `attempts += 1`, budget check, `continue` — the **existing** malformed arm, reused verbatim | E-10, and E-09's tie-break for free: `parseAdvisoryVerdict` runs first, so a verdict that is both malformed and unclassifiable never reaches `classifyReply` |
| `{terminate:{outcome,reason}}` | `terminate(...)` with `attempts` unchanged and `appliedSuccessfully:false` | E-08/E-11: escalate, **no** attempt consumed, **no** refusal reason — the record and escalation log still written, the root-cause class carried |

Adding a hook rather than an `if (seam === "A6")` branch is not decoration: the driver's per-seam
gate-exclusivity registry asserts that no seam has a private path through it, and a seam-name
conditional inside the driver would be exactly that.

## 4. Data Model

### 4.1 The A6 verdict trailer

The tier's six lines are unchanged and parsed by the shipped `parseAdvisoryVerdict`; A6 adds three,
read by its own total parsers and never by that function.

| Line | Owner | Required | Read by |
|---|---|---|---|
| `SEAM: A6` | tier | yes | `parseAdvisoryVerdict` (wrong-seam ⇒ malformed) |
| `DIAGNOSIS: {text}` | tier | yes, non-empty | `parseAdvisoryVerdict` |
| `PROPOSED-ACTION: E-5 \| E-6 \| nothing` | tier | yes | `classifyEnvelope` X-c against `permittedActions` |
| `CONFIDENCE: high \| low` | tier | yes | driver's GATE: only `high` authorises |
| `WITHIN-ENVELOPE: yes \| no` | tier | advisory only | preserved data; never the membership decision |
| `EVIDENCE: {c1, c2, …}` | tier | yes, non-empty | `parseAdvisoryVerdict`, then `citesGateOutput` |
| `ROOT-CAUSE: {class}` | A6 | read totally | `parseA6RootCause` ⇒ `ADVISORY_ROOT_CAUSES` |
| `PROMOTES: {symbol}` | A6 | E-6 only | §3.4's conjuncts 2 and 3 |
| `PROMOTES-TASK: {taskId}` | A6 | E-6 only | §3.4's conjunct 1 |

The asymmetry is deliberate and is the whole of BR-2 vs BR-3: a missing or wrong `EVIDENCE:` is
malformed and costs an attempt; a missing or wrong `ROOT-CAUSE:` is *read* as `unclassified`, costs
nothing, and authorises nothing.

### 4.2 Root-cause vocabulary

`ADVISORY_ROOT_CAUSES` is ordered and closed, and the order is the first-match rule: a failure
matching two classes yields the earlier one (AC-2.2). Only the first two authorise any action, and
each is bound to one envelope member:

| # | Class | Authorises | Bound to |
|---|---|---|---|
| 1 | `plan-ordering-defect` | yes | `E-6` — the promotion a later task owes |
| 2 | `wave-internal-defect` | yes | `E-5` — the wave's own owned paths |
| 3 | `environmental` | no | — diagnosis only |
| 4 | `unclassified` | no | — diagnosis only |

The binding is enforced, not advisory: `classifyReply` terminates the invocation when the class is
`environmental` or `unclassified` (whatever the confidence — E-11), and `apply` refuses a
`PROPOSED-ACTION` whose envelope member does not match the class. `unclassified` is both a class an
agent may state and the value every unreadable statement resolves to; that collapse is intentional
and is what makes the receiving side total.

### 4.3 A6's own state, per run and per wave

| Datum | Scope | Shape | Purpose |
|---|---|---|---|
| `waveBudget` | run | `{ resolved: number }` | Only resolutions increment it (BR-11, E-27) |
| `rungState` | run | `{ resolved: null \| {model, fallback} }` | The shipped per-run rung memo, threaded, not re-created (NFR-6) |
| `promotions` | run | `Map<taskId, {paths, symbol}>` | §3.6's later-task prompt clause |
| `advisoryDispositions` | run | `AdvisoryDisposition[]` | The shipped array; A6 pushes into it, so the sixth report row is populated by the shipped `advisorySummaryRows` |
| `invocations` | wave | `("post-wave"\|"test")[]` | BR-7's ordered sequence oracle (§2.4) |
| `snapshot` | wave | `{head, tree, snap}` | §3.5; one per wave, reused by every attempt |
| `attempts` | invocation | `number` | The driver's, unchanged |

Nothing here is module-level state. Every datum is created in the Phase I scope and threaded, for
the reason the shipped `rungState` comment already gives: the bundle inlines this module into two
artifacts and jest runs every test against one imported instance, so module state leaks across
tests and across a queue invocation's delegated run.

### 4.4 Configuration

One key is added to the `advisory` section of `.claude/pdlc.config.json`, owned by the repo
operator, defaulting so that a repo that changes nothing gets today's behaviour:

| Key | Type | Default | Validator | Notes |
|---|---|---|---|---|
| `waveBudgetPerRun` | integer ≥ 0 | `1` | `nonNegativeInt` | `0` is a legal configured value (E-33), not an invalid one |

`enabled`, `attemptBudget`, `seamBudgetMinutes` and `envelope` keep their shipped validators and
defaults. `.claude/pdlc.config.example.json` — the tracked arrangement `pdlc/engine`'s
`ci-arrangement` test reads — gains the key alongside them.

### 4.5 What A6 writes, and where

| Artifact | Path | Shape | When |
|---|---|---|---|
| Advisory record entry | `docs/{feature}/ADVISORY-{feature}.md` | The tier's `renderAdvisoryEntry` table, plus the root-cause class and, on a resolution, the repair's paths | Every terminal disposition, including the no-dispatch escalation |
| Escalation log entry | `docs/_queue/ESCALATIONS.md` | The tier's `renderEscalationEntry`, root-cause class in the decision sentence | Every `escalated` disposition |
| Report notice | run report `notices` | The tier's `ADVISORY ESCALATION: seam A6 …`; and, separately, a failed escalation-log write | Every escalation (E-30, AT-06-6) |
| Halt fields | `haltError`'s `fields` | `{rootCause, diagnosis, repairApplied, repairPaths}` | Every non-resolved wave (AC-6.3) |
| Snapshot ref | `refs/pdlc/a6-snapshot` | A dangling commit | Every A6 invocation that reached the snapshot step |

Two consequences worth stating rather than discovering:

- **The record entry is written at seam termination, before a post-gate halt can be known.** So on a
  resolution it says "a repair was applied and remains in the working tree", naming its paths — a
  statement true at resolution time and still true after E-22's un-skip-guard halt, because BR-10's
  three restoration triggers are exhaustive and a post-gate halt is not among them. That is how
  AT-05-4's "the advisory record entry states a repair remains applied" is satisfiable at all.
- **Only escalations are durably countable.** The advisory record is distilled into LEARNINGS and
  deleted at Phase PUB (`pdlc-advisory-corpus-baseline.md` §1), so `plan-ordering-defect`
  recurrence is countable from `ESCALATIONS.md` and resolution counts are not (AC-6.4's honest
  limit, REQ O-2). A6 adds no persistence to change that, deliberately.

## 5. Test Strategy

### 5.1 Where the tests live

| File | Status | Carries |
|---|---|---|
| `pdlc/workflows/__tests__/advisoryWaveGate.test.js` | new | A6's parsers, envelope classification, invocation ordering, snapshot/restore, budget |
| `pdlc/workflows/__tests__/advisoryEnvelope.test.js` | edited | The two transcribed set-equality oracles (§1.3) |
| `pdlc/workflows/__tests__/advisoryConfig.test.js` | edited | The re-declared `ADVISORY_DEFAULTS` literal, plus `waveBudgetPerRun`'s validator |
| `pdlc/workflows/__tests__/advisoryDriver.test.js` | edited | PROP-GATE-06's `GATE_EXCLUSIVITY_REGISTRY`-keys-equal-`ADVISORY_SEAMS` oracle; `classifyReply`'s three returns |
| `pdlc/workflows/__tests__/advisoryDisabled.test.js` | edited | The disabled-tier byte-identity properties, extended over Phase I |
| `pdlc/workflows/__tests__/waveExecution.test.js` | edited | Wave-loop call-site behaviour with A6 absent and present |
| `pdlc/workflows/__tests__/helpers/advisoryDoubles.js` | edited | The `SEAMS` literal and an A6 reply builder |

The six transcribed surfaces of §1.3 go red on the first constant edit. That is the intended
signal, not collateral: each is a set-equality or ordered-sequence oracle that exists precisely so
that adding a seam cannot be silently additive. Each edit is a transcription of the new value, never
a loosening of the assertion to a subset or `toContain` check.

### 5.2 What is asserted mechanically

- **Totality of the A6-owned parsers.** `parseA6RootCause` and the promotion readers are asserted
  over absent, empty, wrong-cased, duplicated and out-of-set inputs, and must return
  `unclassified` / `null` rather than throw for every one. The oracle is that no input in the
  fuzz set produces an exception, and that only exact members of `ADVISORY_ROOT_CAUSES` produce a
  non-`unclassified` class.
- **The ordered invocation sequence.** BR-7 is an ordered-sequence oracle over the wave's
  `invocations` array — `["post-wave"]`, `["test"]`, `["post-wave", "test"]` — never a membership
  or count check, because the defect it guards against is the test seam firing before the post-wave
  gate has had its say.
- **Root-cause-to-envelope binding.** A `test.each` over the four classes × the three proposed
  actions asserts exactly the eight authorising cells of §4.2's table and refuses the rest.
- **Restoration triggers are exhaustive.** BR-10's three triggers are asserted as a set, and the
  post-gate halt case is asserted to *not* restore — the property that makes AT-05-4 satisfiable.
- **Snapshot/restore round-trips including untracked files.** A wave that adds an untracked file
  and is then restored must leave the file absent; a wave that adds a `.gitignore`d file must leave
  it present, which is what pins `git clean -fd` over `-fdx` (O-1's decision).
- **The disabled tier is byte-identical.** `advisoryDisabled.test.js` gains Phase I cases asserting
  that with `advisory.enabled: false` the wave loop performs no A6 dispatch, no model resolution,
  no snapshot ref, and produces a report whose `advisory` key is `undefined`.

### 5.3 What is verified by reading, not by assertion

Three claims in this TSPEC are grounded in the shipped source and cannot be re-asserted without
re-implementing the thing under test, so they are recorded here as read-verified rather than
covered:

1. `parseAdvisoryVerdict`'s last-wins `extract` semantics and its five malformedness rules are
   unchanged by A6; A6 adds parsers beside it and edits none of its rules.
2. The shipped per-run rung memo (`rungState`) is threaded into A6 rather than re-created, so a
   run that has already resolved a rung for A3–A5 performs no second model resolution (NFR-6).
3. `advisorySummaryRows` needs no edit to emit A6's row: it maps over `ADVISORY_SEAMS`, so the
   sixth row appears from the §3.1 constant change alone.

### 5.4 Coverage and the CI floor

The workflows suite runs under c8 with an aggregate branch floor of 85% enforced per module. A6's
new module surface is branch-dense — four root-cause classes, three envelope members, three
restoration triggers, two confidence values — so the new test file is written to exercise every
branch of the terminating classifier rather than to reach the floor incidentally. The
`Generated artifacts in sync` check requires `node pdlc/workflows/build-runtime.mjs` to be re-run
and `pdlc/workflows/dist/` committed in the same wave that edits this module; the repo's
`implementation.postWavePathspecs` already names that directory, so the per-wave commit carries it.

## 6. Open Questions

| # | Question | Blocking? | Current disposition |
|---|---|---|---|
| OQ-1 | Should `waveBudgetPerRun: 0` be rejected at parse time rather than accepted as a configured value that escalates every wave pre-dispatch? | no | Accepted as configured, per E-33; the behaviour is coherent but undocumented upstream. See the FSPEC erratum on E-33. |
| OQ-2 | Should a run that halts with an applied-and-retained repair leave `refs/pdlc/a6-snapshot` in place for operator recovery, or delete it? | no | Left in place. It is a dangling ref costing one commit object, and it is the only mechanical record of the pre-repair tree once the wave has halted. |
| OQ-3 | Should `plan-ordering-defect` recurrence feed back into Phase P's PLAN lint, so a repeatedly-promoted dependency becomes a PLAN-time error? | no | Out of scope; recorded because `ESCALATIONS.md` is the durable corpus that would make it possible (AC-6.4, REQ O-2). |
| OQ-4 | Should E-6 promotions be visible to the *queue* driver, so a halted feature's re-run starts from the corrected ordering? | no | No. Promotions are per-run state by §4.3, and a re-run re-derives batches from the PLAN, which the erratum protocol — not A6 — is responsible for correcting. |

None of these blocks PLAN authoring. OQ-1 and OQ-3 are recorded as candidates for DECISIONS if a
reviewer disagrees with the dispositions above.

REVISION-COMPLETE: yes
