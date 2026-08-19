# TSPEC — pdlc-advisory-wave-gate

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → **TSPEC**` (`docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` v1.4) |
| Downstream | `DECISIONS`, `PLAN`, `PROPERTIES`, `IMPL` |
| Cross-Reviews | `CROSS-REVIEW-product-manager-TSPEC-v1.md`, `CROSS-REVIEW-test-engineer-TSPEC-v1.md`, `CROSS-REVIEW-product-manager-TSPEC-v2.md`, `CROSS-REVIEW-test-engineer-TSPEC-v2.md`, `CROSS-REVIEW-product-manager-TSPEC-v3.md`, `CROSS-REVIEW-test-engineer-TSPEC-v3.md` (active), `CROSS-REVIEW-product-manager-TSPEC-v4.md`, `CROSS-REVIEW-test-engineer-TSPEC-v4.md`, `CROSS-REVIEW-product-manager-TSPEC-v5.md`, `CROSS-REVIEW-test-engineer-TSPEC-v5.md` (active) |
| LEARNINGS | `docs/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 1.6 | 2026-08-20 |

## Changelog

**v1.6 (erratum round, Phase D).** Re-grounded on FSPEC v1.4 first, then the six raised items.
Upstream absorbed: AT-04-1 split into three conjunct-scoped runs, so §5.6 gains AT-04-1a (green
re-gate, carried by §5.2's two-attempt run) and AT-04-1b (suppressed re-gate, carried by §5.5's
dropped-re-gate fixture, its construction O-1's); BR-11's seam-budget window is per **attempt**,
worst case `attemptBudget × seamBudgetMinutes`, recorded on §5.6's AT-02-7 row. FSPEC's dropped
carve-out is the seam-budget one, not the `.gitignore` one — OQ-7 stays open upstream and every
upstream-pending flag in §3.3, §5.2, §5.5, §5.6 stands unchanged. Raised items: §1.1's O-8 row
restated as the **added** `commitPaths` call it is, naming DEC-A6-02's rejected option A, so the
row and §3.6 no longer disagree; §4.4's claim that the new key is mirrored into `pdlc/engine`'s
`ci-arrangement` expectations withdrawn — that file asserts only `implementation.testCommand` and
contains no `advisory` occurrence — and replaced by the **new** expectation this feature authors
there, with §5.1 gaining the two second-channel rows (example config, engine test) outside its
set-equality rule; `waveBudgetPerRun: 0` gains a behaviour arm in §5.2 (enabled tier, red wave,
zero `_agent` calls, snapshot still taken, summary key present-and-zero) so §5.4's matrix row is
no longer a claim nothing tests; §4.5's one-ref-per-wave property gains §5.2's two-red-wave
fixture asserting `{a6-snapshot-1, a6-snapshot-2}` set-equality, which a fixed-name regression
fails.

**v1.5 (round 5).** One High (TE F-29), two Medium (TE F-30, PM F-01), two Low (TE F-31, PM F-02),
two questions (TE Q-01, PM Q-02) addressed. TE F-29 — round 4's anchor was named but not plumbed:
`buildA6SeamOps` is a top-level export, so its `apply` cannot assign into `runWaveGateSeam`'s scope,
and a property on the returned SeamOps object is lost to the shallow copies the driver reads through
(`orchestrate-dev.js:3499`, `:3503`, `:3521`, `:3546`) and §5.5's fixtures write through. The anchor
now gets the `declaredScope` idiom — a **mutable `ledgerAnchor` carrier** created per wave by
`runWaveGateSeam`, passed into `buildA6SeamOps`, written in place by `apply`, read at step 6 — named
in §3.2's code block, §3.3's signature and its own row. TE F-31 — the carrier's initial value is
stated (`{value: -1}`, fail-closed) with both wrong choices named, and the first conjunct is marked
defensive and fixture-free. TE Q-01 — the carrier's lifetime is tied to `invocations`' lifetime, one
per wave. TE F-30 — §5.5's mutation fixtures now say what they replace (one member of the **real**
SeamOps) and each carries a positive assertion that the anchor was recorded, so a build that never
writes the carrier fails them. PM F-01 — §5.2's two-attempt companion states that it keeps the
shipped `verifyGate` and drives red-then-green through `_runCommand`, so its six-token ledger is
observed rather than stipulated. PM F-02 — §2.5 and OQ-2 now record what wave-scoping does not buy:
a re-run overwrites wave 1's ref and nothing prunes the refs. PM Q-02 — the gate-sequence
enumeration is closed: a post-wave-only arrangement cannot reach A6, since `scriptGate` requires
`implConfig.testCommand` (`orchestrate-dev.js:14143-14144`). OQ-7's `.gitignore` boundary is
re-emitted upstream, unchanged (PM Q-01).

**v1.4 (round 4).** Three High (PM F-01, TE F-26, TE F-27) and three Medium addressed.
PM F-01 / TE F-26 — §3.2 step 6's ledger rule: round 3's **suffix check** was satisfied by the
wave's own pre-A6 pass, since A6 is only entered on a red first gate and that pass has already
pushed `[post-wave, test]`, so a `verifyGate` returning `{passed: true}` without running anything
was granted resolution and §5.5's mutation fixture could not fail. Restated as **growth since the
last `apply`**: `apply` records the anchor as its first statement (spelled `ledgerAtLastApply` in v1.4; carried by the `ledgerAnchor` carrier from v1.5) (`orchestrate-dev.js:3521`
APPLY precedes `:3544` VERIFY in the driver's attempt loop), and resolution requires the tokens
above that anchor to be exactly the configured gate sequence. TE F-26's proposed
`length × (attempts + 1)` operand was **not** taken and the reason is recorded in §3.2: `attempts`
is also consumed by preemption, dispatch error and malformed verdicts (`:3421`, `:3428`, `:3459`),
which never gate, so that quantity re-creates v1.2's false-negative on a run whose first reply was
malformed. Reconciled in §3.3's `apply` and `verifyGate` rows and §5.5.
TE F-27 — §5.2's two-attempt companion carried §2.4's *one-attempt* four-token literal; corrected to
the six tokens the run actually produces (first pass + two attempts), and the step-6 slice is
asserted on the same run.
TE F-28 — a second mutation fixture: a re-gate dropped on **attempt 2**, the shape that every
unanchored quantity (suffix, non-empty growth, whole multiple) admits and only the `apply` anchor
refuses (§5.5, now a two-row table).
PM F-02 — §3.2 step 3's claim that AT-02-6 and the one-snapshot count already covered the
capture-before-budget ordering was withdrawn as false in both halves; §5.2 gains a positive
**wave entered over budget** case (escalates, no `_agent` call, snapshot still written).
PM F-03 — the snapshot ref is now wave-scoped, `refs/pdlc/a6-snapshot-{waveNum}` (§2.5, §3.5, §4.5),
so a later wave's capture no longer destroys the pre-repair record of an earlier resolved wave;
§6 OQ-2 records why.
PM Q-02 / TE Q-01, Q-02 answered: §5.2 adds a containment assertion that the failing git verb reaches
the escalation entry, and a no-post-wave-command run pinning that the gate sequence is read from
configuration rather than hard-coded at length two (§6 OQ-14, OQ-15).
OQ-7's BR-9 `.gitignore` boundary remains open upstream and is re-emitted as an erratum this round.


**v1.3 (round 3).** Two High (one finding, raised by both reviewers), four Medium/Low addressed.
PM F-01 / TE F-21: §3.2 step 6's ledger rule was a growth-since-dispatch **equality**, which denied
resolution to a legitimate two-attempt run — green re-gate reported unresolved, repair left in the tree,
no restoration trigger fired, operator told the gate failed when it passed. Restated as a **suffix
check** (the ledger's final tokens are the wave's own gate sequence, appended by the `verifyGate` call
that produced the resolution), which holds at every attempt count and still refuses the dropped-re-gate
defect; reconciled in §3.3's `verifyGate` row and §5.5's mutation-fixture bullet, and paired with a new
positive companion case in §5.2 (two-attempt run, green on attempt 2, asserted **resolved** with
`invocations` `[post-wave, test, post-wave, test]`).
PM F-03 / TE F-22: the capture-failure disposition now names all six members `renderAdvisoryEntry`
destructures — `model: "n/a"`, `fallback: false` — because `model` has no renderer fallback and an
unnamed one ships a literal `| Model | undefined |` cell into the operator-facing record (§2.5, §3.2
step 4, §5.2).
PM F-02 / TE F-23: four clauses added in round 2 were appended past a table row's final pipe and were
dropped by the GFM renderer; moved inside their cells (§3.3 two rows, §5.5 two rows).
TE F-24: §3.2 states explicitly that the wave-budget escape resolves inside `runAdvisorySeam`, after
step 4's capture, so a no-dispatch wave still captures — and says why that ordering was kept.
TE F-25: §5.2's one-snapshot-per-wave assertion now counts a capture-unique argv verb
(`commit-tree === 1`), not calls on the `_git` double, which `restoreTreeSnapshot` also drives.
PM Q-02 and TE Q-01 answered in §6 (OQ-12, OQ-13).

**v1.2 (round 2).** Three High findings and five Medium/Low addressed.
PM F-01: the capture-failure escalation carries **no** refusal reason (`reason: null`) per REQ
AC-3.4 and FSPEC BR-15's diagnosis-only clause; `snapshot-unavailable` survives as diagnostic
prose in the escalation sentence, the notice and §4.5's `diagnosis` field, so
`ADVISORY_REFUSAL_REASONS` stays eight members and §5.6's AT-03-7 row still passes (§2.5, §3.5,
§5.2, §5.6).
TE F-13 / PM F-02: the snapshot is captured at the call site, before `runAdvisorySeam` is entered
— `gatherEvidence` sits inside the driver's attempt loop, so capturing there would re-capture on
attempt 2 and break the one-snapshot-per-wave invariant. The `__preDispatch` escape is therefore
unavailable on this path, and §2.5 / §3.2 step 4 name `appendAdvisoryEntry`,
`appendEscalationEntry` and the notice as the writers instead (§2.5, §3.2, §3.5).
TE F-14: §3.2 step 6 states the rule AC-4.1's conjunct (iii) needs — a resolution requires the
`invocations` ledger to have grown by the wave's own gate sequence, not just a `resolved` outcome
— which turns §5.5's dropped-re-gate fixture into a real red test.
PM F-03 / TE F-18: §4.5 gives the capture-failure halt's four fields literal, transcribable values.
TE F-15, F-16, F-17, F-19, F-20: set-equality oracles for AT-06-1 and AT-07-1, AT-05-1 marked
upstream-pending with §5.2's case 4, `(h)`'s dispatch-options premise asserted, §5.1's file set
declared set-equal to §1.3's rather than counted.
Questions answered in place: TE Q-01 (§3.3's `gatherEvidence` row), TE Q-02 (§5.5's `(g)` row),
PM Q-01/Q-02/Q-03 (§6 OQ-9…OQ-11).

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
§6 rows OQ-5…OQ-8).

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
| O-8 | How an E-6 repair reaches committed state, and how the later task is told | §2.5, §3.6 | **One further `commitPaths` call** after the per-task loop, inside the same `if (waveGit)` block, carrying the promotion's paths under its own `message` and `what` (§3.6); the owning task's own commit keeps its own pathspec, unwidened. Widening the existing per-task call is the rejected option A of `DECISIONS-pdlc-advisory-wave-gate.md`'s DEC-A6-02. `waveImplementPrompt` gains a promotions clause read by that task's dispatch |

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
           git update-ref refs/pdlc/a6-snapshot-{waveNum} {snap}
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
- **A durable ref per wave, so a failed restore is recoverable.** `refs/pdlc/a6-snapshot-{waveNum}`
  is not a branch and is never pushed. The ref is **wave-scoped, not run-scoped** (PM F-03):
  `captureTreeSnapshot` already takes `waveNum` (§3.5), and a single fixed name would let a later
  wave's capture overwrite the record of an earlier wave's pre-repair tree — including a wave whose
  repair was gate-verified, retained and committed, which is the one tree an operator is most
  likely to want to inspect or undo. A run that resolves wave 1 and then escalates over budget on
  wave 2 therefore ends holding both refs, each naming the tree its own wave started from. E-28's
  halt names the ref for the halting wave, which is the difference between "A6 left a tree it could
  neither repair nor restore" and "A6 left a tree, and here is the object name that has the original
  in it". The refs are dangling commit objects; nothing in this feature deletes them (§6 OQ-2).
  **The promise is run-scoped, and the section says so rather than letting the reader assume more.**
  The name is derived from the wave number alone, so a *re-run* of a halted feature — the ordinary
  next step after a halt — reaches wave 1, captures, and overwrites `refs/pdlc/a6-snapshot-1`, the
  very ref the operator was told to keep. The loss F-03 named is narrowed, not eliminated: its
  trigger moves from "a later wave" to "the next run". The cost is bounded and it is the operator's,
  not the pipeline's: a retained repair is gate-verified and committed in its own wave commit, so
  what an overwritten ref costs is *inspectability of the pre-repair tree*, never content. In the
  other direction the refs accumulate — one dangling commit per wave per run, in a namespace no
  other tool prunes. An operator who wants a snapshot to survive the next run should copy the ref
  before re-running; a run-scoped discriminator in the name is recorded as the remedy if that ever
  proves too sharp an edge (§6 OQ-2, PM F-02).

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
engaged seam and no durable trace. But the shipped `__preDispatch` escape is **not** available on
this path, and the earlier draft's claim that it was is corrected here (PM F-02, TE F-13). The
escape is a return value of `seamOps.gatherEvidence()`, read only inside `runAdvisorySeam`
(`orchestrate-dev.js:3401-3410`), and `gatherEvidence` is called **inside the driver's attempt
loop** (`while (true)`, `:3393-3396`), which `verifyGate`'s `consumesAttempt: true` re-enters
(`:3554-3568`). Capture inside `gatherEvidence` would therefore re-capture on attempt 2 and
destroy the one-snapshot-per-wave invariant below; capture before the driver is entered runs
exactly once. The invariant wins: **the snapshot is taken at the call site, before
`runAdvisorySeam` is entered** (§3.2 step 4), and the capture-failure path writes its durable
artifacts by calling the tier's own exported primitives directly:

| Field | Value on capture failure |
|---|---|
| Terminal disposition | `escalated`, **no refusal reason** — `reason: null` |
| Disposition object, in full | the six members `renderAdvisoryEntry` destructures (`orchestrate-dev.js:2924`) are all named literally, because it interpolates them unguarded: `{seam: "A6", outcome: "escalated", reason: null, verdict: null, model: "n/a", fallback: false}` (plus `attempts: 0`). `model` is `"n/a"` because no rung was ever resolved — without it `advisoryEntrySingleLine(model)` is `String(undefined)` and the operator-facing record ships a literal `\| Model \| undefined \|` cell on exactly the path AC-6.1 exists to make legible (PM F-03, TE F-22). No renderer change is needed; the value is supplied by the caller |
| Attempts consumed | `0` — no `_agent` call, no rung resolution, no driver entry at all |
| Advisory record entry | written by `appendAdvisoryEntry({feature, disposition, _appendFile, _now})` (`orchestrate-dev.js:2965`) with `verdict: null`; the renderer's null-verdict fallbacks give Confidence/Envelope `n/a` and Diagnosis `no verdict was produced`, which is exactly true here (AC-6.1). The Model cell has **no** renderer fallback, so its value is carried by the disposition itself — see the row above |
| Root-cause class | `unclassified` — no diagnosis was ever obtained |
| Escalation-log entry | written by `appendEscalationEntry({disposition, ctx, _appendFile, _now})` (`:3090`), phase and phase-outcome read from `ADVISORY_SEAM_PHASES.A6` (§3.1), and a **caller-supplied `decision` sentence** naming `snapshot-unavailable` as the diagnostic (AC-6.2) |
| Report notice | `ADVISORY_ESCALATIONS.seam({seam: "A6", feature, reason})` (`:1576-1581`), whose `reason` slot is free message text, carrying the same diagnostic sentence |
| Wave budget | untouched — only `resolved` increments it (E-27) |
| Halt | the wave's own `Wave N test gate failed` literal (AT-05-3), with §4.5's advisory halt fields attached at the literal values §4.5 names (AC-6.3) |
| Restoration | none performed, and none owed: nothing was dispatched, so nothing was applied |

**`snapshot-unavailable` is a diagnostic string, never a refusal reason (PM F-01).** REQ AC-3.4
and FSPEC BR-15 are explicit: a diagnosis-only outcome is an escalation with no proposal, so it
refuses nothing and needs no reason, and `ADVISORY_REFUSAL_REASONS` stays the frozen eight-member
catalogue at `orchestrate-dev.js:2297-2306`. The reason position is therefore `null` — a
first-class value in the shipped tier, which already passes `reason: pre.reason ?? null`
(`:3406`) and renders a null reason as a bare `escalated` disposition (`renderAdvisoryEntry`,
`:2922-2954`). The word `snapshot-unavailable` survives as prose in the escalation entry's
decision sentence, in the report notice, and in §4.5's `diagnosis` halt field — the three places
free text is allowed — and in no reason field anywhere. §5.6's AT-03-7 row (exactly eight
members, in shipped order, A6 added none) therefore still passes as written.

Ordering and failure discipline on this path, since no driver governs it: record write, then
escalation entry, then notice, then halt. A failing record write cannot downgrade anything to
`record-write-failed` — that reason names a *resolution* being withdrawn, and nothing was applied
here — so it is caught and reported as a notice; a failing escalation-log write is likewise a
notice, mirroring the shipped asymmetry at `:3331-3345`. §3.2 step 4 and §3.5 are stated to this
one contract: "capture failure halts here" was the earlier, looser wording and is superseded;
capture failure **escalates, then halts**, in that order. §5.1's new-suite row and §5.2's
six-assertion fixture carry the case.

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
   Because that escape is read inside `runAdvisorySeam`, the budget check resolves *after* step 4's
   capture: an over-budget wave still captures a snapshot and still writes its wave-scoped snapshot
   ref, then escalates without dispatching. This is deliberate and costs one
   `write-tree`/`commit-tree` pair; the alternative — hoisting the pure `waveBudget` read above the
   capture — was rejected so that the record and escalation writes stay on the shipped `terminate`
   path rather than being re-implemented at the call site, as the capture-failure path below is
   forced to do. The ordering is load-bearing, so it carries its own oracle rather than an appeal
   to existing ones: §5.2 adds a **wave entered over budget** case asserting, on one run, that the
   wave escalates with `reason: "budget-exhausted"`, that no `_agent` call occurs, and that the
   snapshot was still taken (`commit-tree === 1` and an `update-ref` on
   `refs/pdlc/a6-snapshot-{waveNum}` observed on the `_git` double). Round 3's claim that AT-02-6
   and §5.2's one-snapshot-per-wave count already covered this was wrong in both halves and is
   withdrawn: AT-02-6 (§5.6, FSPEC §3.2) scopes only the budget arithmetic — two escalated waves
   leave `waveBudget.resolved` at `0` — and says nothing about snapshots, and §5.2's snapshot count
   runs on a *dispatching* wave, so no no-dispatch wave appears in it (TE F-24, PM F-02).
4. **Snapshot.** `captureTreeSnapshot` (§3.5) runs **here, at the call site, before
   `runAdvisorySeam` is entered** — once per wave, never per attempt (§2.5). It cannot live in
   `gatherEvidence`: that is called inside the driver's attempt loop (`orchestrate-dev.js:3393`)
   and `verifyGate`'s `consumesAttempt: true` re-enters it (`:3554-3568`), which would re-capture
   over the tree attempt 1 already changed.
   A capture failure (`null` return) therefore cannot use the `__preDispatch` escape step 3 uses —
   the escape is read inside the driver (`:3401-3410`) and the driver is never entered. Instead
   `runWaveGateSeam` itself writes the durable trace, in this order: `appendAdvisoryEntry`
   (the full disposition object is `{seam: "A6", outcome: "escalated", reason: null, verdict: null,
   attempts: 0, model: "n/a", fallback: false}` — all six members `renderAdvisoryEntry` reads, since
   it interpolates `model` unguarded, §2.5), then `appendEscalationEntry` with a
   caller-supplied `decision` sentence naming `snapshot-unavailable`, then the
   `ADVISORY ESCALATION:` notice, then return `{resolved: false}` carrying §4.5's halt fields at
   their literal values. No `_agent` call, no rung resolution, no attempt consumed, budget
   untouched. The wave then halts on its own gate literal at the call site. Escalate first,
   halt second.
5. **Dispatch.** `runAdvisorySeam({ seam: "A6", seamOps: buildA6SeamOps(...), config, rungState, … })`.
   Attempt budget, wall-clock budget, malformed-verdict handling, the GATE/CHECK envelope
   evaluations, the advisory record, the escalation log and the `ADVISORY ESCALATION:` notice are all
   the driver's, unchanged.
6. **Terminal.** `outcome === "resolved"` alone is **not** sufficient. The driver derives its
   outcome from the seam ops' own returns, so a `verifyGate` that answers `{passed: true}` without
   running anything would yield `resolved` — an advisory verdict substituting for a gate result,
   which is exactly what BR-7 forbids. The call site therefore re-checks the one thing it can
   observe independently: `resolved: true` requires **both** `outcome === "resolved"` **and** that
   the wave's `invocations` ledger (§2.4) *grew, since the last repair was applied, by exactly one
   full gate sequence*. Two anchors make that decidable, and both are recorded by A6's own code
   rather than inferred:

   - step 4 records `const ledgerAtDispatch = invocations.length` before `runAdvisorySeam` is
     entered — the floor below which nothing counts;
   - `buildA6SeamOps`' own `apply` (§3.3) records the ledger position of *this* repair on every
     call, as its first statement, before it dispatches the repair edit. `apply` is A6's code, it
     runs once per attempt, and the driver runs it strictly before that attempt's `verifyGate`
     (`orchestrate-dev.js:3521` APPLY, `:3544` VERIFY, one iteration of the attempt loop).

   **The anchor needs a carrier, not a variable (TE F-29).** `buildA6SeamOps` is a top-level export
   (§3.3), so its `apply` cannot assign into `runWaveGateSeam`'s scope, and a scalar property set on
   the returned SeamOps object would not survive the shallow copies the driver and the fixtures both
   work with: the driver reads members off whatever object it was handed
   (`orchestrate-dev.js:3499`, `:3503`, `:3521`, `:3546`), and §5.5's mutation fixtures hand it
   `{...seamOps, verifyGate: fake}`. Either mistake silently inverts the rule back into a tail read
   — `invocations.slice(undefined)` is the whole ledger — which is round 3's defect restored as an
   implementation detail. The anchor therefore gets the `declaredScope` treatment (§3.3): a
   **mutable carrier created by `runWaveGateSeam` and passed into `buildA6SeamOps`**, written in
   place by `apply` and read at step 6:

   ```js
   const ledgerAnchor = { value: -1 };   // created at step 4, beside `ledgerAtDispatch`
   // … passed to buildA6SeamOps({ …, invocations, ledgerAnchor, … })
   // … inside `apply`, first statement:  ledgerAnchor.value = invocations.length;
   ```

   `-1` is the fail-closed initial value, and it is a *stated* value, not an omission: `undefined`
   would make `invocations.slice(ledgerAnchor.value)` read the whole ledger and restore the suffix
   defect, and `invocations.length` at build time would equal `ledgerAtDispatch`, making the first
   conjunct below vacuous and the slice a growth-since-dispatch read — the two wrong choices, named
   so Phase P transcribes neither (TE F-31). The carrier's lifetime is `invocations`' lifetime: both
   are created per wave, in the wave loop's own scope (§2.4, §4.3), so a wave-2 seam cannot start
   holding wave 1's anchor even if a later refactor hoists `buildA6SeamOps` construction (TE Q-01).

   The step-6 check is then, with `gateSequence` read from the same `implConfig` the sequence helper
   reads — `["post-wave", "test"]`, or `["test"]` alone when no post-wave command is configured
   (§2.4's third row), never a hard-coded length:

   ```js
   ledgerAnchor.value >= ledgerAtDispatch &&
   sameSequence(invocations.slice(ledgerAnchor.value), gateSequence)
   ```

   The first conjunct is defensive and no fixture falsifies it: it is false only before any `apply`
   has run, and the shipped driver reaches a `resolved` outcome only after a successful ACT
   (`orchestrate-dev.js:3521`), so step 6 is never entered with the anchor still at `-1`. It is kept
   because the fail-closed reading of a missing anchor belongs in the check as well as in the
   initial value; Phase P should not go hunting for the fixture that falsifies it (TE F-31).

   **Why anchored growth and not a suffix check (PM F-01, TE F-26).** The ledger is not empty at
   dispatch. A6 is entered *because* the wave's first pass ran and went red (§2.3, step 1), so the
   ledger already reads `[post-wave, test]` — the wave's own configured sequence — before the seam
   starts. Round 3's suffix wording is therefore satisfied by the pre-A6 pass's own tokens: a
   `verifyGate` that returns `{passed: true}` without running anything appends nothing, the final
   tokens are still that first pair, the suffix matches and resolution is granted. That is the exact
   defect the rule exists to refuse and the one §5.5's mutation fixtures are written to catch.
   Growth measured from an anchor cannot be satisfied by tokens that lie below the anchor.

   **Why the anchor is the last `apply` and not `attempts` (TE F-26's proposed operand, corrected).**
   A quantity of the form `growth-since-dispatch === gateSequence.length × (attempts + 1)` is right
   about the two runs TE names but false on a third the driver ships: `attempts` is incremented on
   paths that never reach `verifyGate` at all — preemption (`orchestrate-dev.js:3421`), dispatch
   error (`:3428`) and a malformed verdict (`:3459`) each consume an attempt and `continue` without
   running a gate. A run whose first reply is malformed and whose second repairs and greens ends
   `attempts: 1` having run exactly one sequence, so the multiplier rule would deny resolution to a
   green, gate-verified wave — the same false-negative class as v1.2's growth-equality (PM F-01),
   reintroduced through a different operand. Anchoring on the last `apply` is indifferent to how
   many attempts were spent getting there and asks only the question BR-7 asks: *did the gate run
   over the tree as it stands after the repair that is being credited?*

   The rule holds at every attempt count and discriminates both mutation shapes §5.5 fixtures
   (TE F-28): a one-attempt green run appends one sequence after its single `apply` and resolves;
   the two-attempt run that greens on attempt 2 (§5.2's positive companion) applies twice — the
   second `apply` re-anchors after the driver's revert — and its slice after the second `apply` is
   one clean sequence, so it resolves; a re-gate dropped on attempt 1 leaves an empty slice; a
   re-gate dropped on attempt 2 leaves an empty slice *even though attempt 1 ran a genuine red
   sequence*, because attempt 2's `apply` moved the anchor past it. Both drops fail, which is what
   makes AC-4.1's conjunct (iii) falsifiable rather than a property no specified rule states
   (TE F-14).

   When the check fails, `runWaveGateSeam` returns `{resolved: false}`, the wave budget is not
   incremented, and the caller rethrows the first pass's halt. On a genuine `resolved`,
   `waveBudget.resolved += 1` and the wave's snapshot ref (`refs/pdlc/a6-snapshot-{waveNum}`, §2.5)
   is left in place for the operator. Any other outcome ⇒ the tree has already been restored by
   `seamOps.revert()` on the failing path, and the caller rethrows the first pass's halt.

### 3.3 `buildA6SeamOps` — the SeamOps the shipped driver consumes

```js
export function buildA6SeamOps({
  feature, waveNum, waves, waveIndex, tasks, gateOutput, implConfig, scriptGate,
  invocations, ledgerAnchor, snapshot, _git, _runCommand,
}) : SeamOps
```

| Member | Behaviour |
|---|---|
| `gatherEvidence` | Returns the **full captured gate output** (`gateResult.output`), never `outputTail`'s 30 lines. AT-02-5's oracle is a citation to a region the tail does not contain, and this is why it can exist (E-12, BR-3). Also computes the E-5 and E-6 owned-path sets (§3.4) and fills `declaredScope` in place — Two things it deliberately does **not** do: it does not take the snapshot (that is the call site's, §3.2 step 4, so the one-snapshot-per-wave invariant survives the driver's attempt loop), and its step-3 wave-budget `__preDispatch` escape is not a per-attempt hazard — the escape terminates on the driver's *first* `gatherEvidence` call, so the loop is never re-entered and the budget is read exactly once (TE Q-01) |
| `prompt` | States the four-class vocabulary, the two envelope members, the decidable rules, the `ROOT-CAUSE:`/`PROMOTES:`/`PROMOTES-TASK:` trailer lines, and the citation rule verbatim. Instructional only for everything the script also checks — but see the precedence note below, which is the one rule the prompt carries alone |
| `conditionHolds` | `async () => true` — an async arrow, not the literal `true`: the driver calls `await seamOps.conditionHolds()` and a literal would throw. `buildA3SeamOps` is the shipped precedent. It returns true unconditionally because the condition *is* the red gate, observed by the script one step earlier; re-running the suite to re-confirm it would double the wave's slowest cost. A `false` here would yield `no-action`, which is not a disposition this seam has |
| `classifyReply` | §3.7's optional hook: BR-3's citation rule (⇒ malformed, one attempt) then BR-2's vocabulary read (⇒ escalate, no attempt) |
| `apply` | Dispatches the repair edit, then returns `{ok:true}` **iff `producedPaths()` is non-empty** — that is the observation, stated so it cannot be read as an unspecified notion of "tree changed". `apply` calls the same `producedPaths` the driver calls at step 5, so the two can never disagree. An empty set is `{ok:false}` ⇒ `post-action-verification-failed`. **A repair writing only `.gitignore`d paths therefore reads as no change and is refused here**, which is the right disposition while §2.5's boundary sits with upstream: the seam refuses to claim a repair it cannot see, cannot restore, and cannot prove was undone. If the erratum widens BR-9's oracle to ignored generated outputs, the widened capture arrives with a widened `producedPaths` and this row is unchanged; if it does not, the refusal is the documented outcome rather than a silent survival past step 5's CHECK. §5.5 gives it a test **It also records the step-6 anchor**: its first statement, before it dispatches anything, is `ledgerAnchor.value = invocations.length` — a write *into the caller's carrier*, never an assignment to a variable of its own and never a property set on the returned SeamOps object, since neither would be readable at step 6 (§3.2, TE F-29). The driver runs `apply` once per attempt and strictly before that attempt's `verifyGate` (`orchestrate-dev.js:3521`, `:3544`), so the anchor always names the ledger position from which the gate covering *this* repair must run (§3.2 step 6) |
| `producedPaths` | `git diff --name-only` **unioned with** `git ls-files --others --exclude-standard`. The untracked half is not optional: a promotion that creates a new file would otherwise be invisible to the step-5 CHECK, and E-6's whole purpose is creating things |
| `revert` | `restoreTreeSnapshot(snapshot)` (§3.5). Whole tree, every trigger |
| `verifyGate` | Re-runs `runWaveGateSequence` — post-wave then test, appending to `invocations`. Returns `{passed:true}` on a green sequence; on red, `{passed:false, consumesAttempt:true}` so the driver restores, consumes one attempt and re-enters its loop, exhausting to `budget-exhausted` (BR-7, BR-9, E-20, E-24, AT-02-9). The append is also what the call site's step-6 ledger check reads, and the check is **growth since the last `apply`, not a suffix**: a `verifyGate` that returns `{passed:true}` without appending leaves an empty slice above `ledgerAnchor.value` and cannot produce a resolution — at attempt 1, where the slice would otherwise be the pre-A6 pass's own pair, and equally at attempt 2, where attempt 2's `apply` has moved the anchor past attempt 1's genuine sequence. A red re-gate followed by a green one still resolves normally: the second `apply` re-anchors after the driver's revert, and the tokens appended after it are one clean `[post-wave, test]` (§3.2 step 6, AC-4.1 (iii), §5.5's two mutation fixtures) |
| `ledgerAnchor` | Not a SeamOps member: the **mutable carrier** (`{value: number}`) `runWaveGateSeam` creates per wave and passes in, written in place by `apply` and read by §3.2's step-6 check. Same idiom and same reason as `declaredScope` below — a top-level `buildA6SeamOps` cannot close over the caller's scope, and anything hung on the returned object is lost to the shallow copies the driver reads through (`orchestrate-dev.js:3499`, `:3503`) and the fixtures write through (§5.5). Its lifetime is `invocations`' lifetime: one per wave, initialised to `{value: -1}` at the call site, never reused across waves (§2.4, §4.3, TE F-29, TE Q-01) |
| `declaredScope` | A **live array**, mutated in place (`.length = 0; push(...)`), never reassigned — the `buildA4SeamOps` idiom, required because the driver captures the reference once at GATE and the test doubles shallow-copy the SeamOps object |
| `permittedActions` | `["E-5", "E-6"]`, narrowed per invocation: `E-6` is dropped when the wave is the last one, since there is no later task for a promotion to belong to |

**`PROPOSED-ACTION:` carries an envelope member id**, not prose — the shipped convention
(`buildA5SeamOps`'s `apply` compares `verdict.proposedAction === "E-1"`, `buildA4SeamOps` declares
`permittedActions = ["E-3"]`). `classifyEnvelope`'s X-c clause then refuses any other value with no
A6-specific code.

**A6's dispatch options equal the shipped seams', with no additional grant (TE F-17).** The
`_agent` call `runAdvisorySeam` makes for A6 is the driver's own, so the tool grants the repair
agent receives are whatever the shipped tier already gives A3/A4 — A6 adds no option, and in
particular no capability by which the agent could run `git` itself. That is the premise `(h)`'s
prohibition test depends on: "no `commit`/`push`/`tag` argv reached the `_git` transport" is only
falsifiable if `_git` is the *only* transport A6's agent can reach, so §5.5's `(h)` row asserts
the premise as well as the conclusion — the dispatch options object observed on the run carries
no key beyond the shipped seam's (AT-07-5).

**One rule is prompt-only, and BR-16's claim is qualified to say so (PM F-04).** `parseA6RootCause`
is a *membership* test against `ADVISORY_ROOT_CAUSES`: given a class the agent emitted, it says
whether that class is in the closed set. It has no view of whether an *earlier* class in the
ordered set also matched the failure, so AC-2.2's first-match rule ("a failure matching two
classes takes the earlier one") lives in the prompt and nowhere else. The earlier draft's blanket
claim — every rule here is also checked by the script — held for the vocabulary and the citation
rule and did not hold for precedence; it is corrected rather than defended.

The residual is bounded and is accepted knowingly:

- **Not at risk: what the misclass authorises.** §4.2's class-to-envelope binding *is*
  script-enforced, so a failure that should have read `plan-ordering-defect` but was declared
  `wave-internal-defect` cannot reach E-6. It gets E-5, confined to the wave's own owned paths,
  and every exclusion still applies. A misclass costs a wrong label, never a wider blast radius.
- **At risk: AC-6.4's countability.** Recurrence counting keys on the `plan-ordering-defect`
  class in `ESCALATIONS.md`, so an unenforceable ordering rule makes that count a function of
  agent judgement. This is a real, accepted cost against AC-6.4 and is recorded as such rather
  than left for a reader to discover; §6 OQ-3 already carries the PLAN-time-feedback question
  the count feeds, and this note names why the count is softer than a script oracle would be.
- **Why not a script conjunct.** A decidable precedence check would have to re-derive, from the
  gate output alone, whether an earlier class matched — i.e. re-do the diagnosis the seam
  dispatched an agent to do. That is the thing being delegated, so a script conjunct here would
  either be a keyword heuristic (a new, unfalsifiable rule) or a re-implementation of the seam.
  Neither is worth AC-6.4's precision; the prompt keeps the rule and this document says so.

**The citation floor is a boundary, not a threshold in prose.** `A6_MIN_CITATION_CHARS` is `24`
and it is load-bearing: at `23` normalised characters a citation is refused as malformed and
costs one attempt, at `24` it is accepted. §5.5 pins both sides on the same fixture, since a
floor asserted only from above passes an implementation that has no floor at all.


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

**`ownedSetCovers`'s prefix coverage has a spelling precondition, and it is an operator-visible
one (TE F-06).** It reuses `pathsCollide` (`orchestrate-dev.js`, `pathsCollide`), whose directory
rule is written on the trailing slash: `a/b/` collides with `a/b/c.js`, `a/b` does not — the
docblock says so and the implementation is three `startsWith` lines that do exactly that. So the
claim that a manifest row naming a directory covers the files beneath it is true **only of a row
written with a trailing slash**. A manifest row spelled `pdlc/workflows/dist` refuses a produced
file `pdlc/workflows/dist/orchestrate-dev.bundle.js` as `out-of-envelope`, and refuses it
silently — the operator sees a refusal reason, not a spelling diagnosis.

This is inherited behaviour, not new: `computeWaves` packs waves with the same predicate, so the
slash-less row is already narrower than its author meant everywhere else in Phase I too. A6 does
not fix it here — widening `pathsCollide` would change wave packing, which is out of this
feature's envelope — but it does two things about it:

1. States the precondition where the E-5/E-6 claim is made, so a PLAN author reading §3.4 knows
   directory rows are written `dir/`.
2. Gives it a test over both spellings (§5.5): slash-ful row covers, slash-less row refuses with
   `out-of-envelope`. No FSPEC AT covers the slash-less case, and it is the realistic operator
   error, so the test exists to make the boundary visible rather than to pin a new rule.


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

- `captureTreeSnapshot` writes its ref as `refs/pdlc/a6-snapshot-{waveNum}` — the `waveNum` it
  already takes is what makes the record per-wave rather than per-run (§2.5, PM F-03).
- `captureTreeSnapshot` returns `null` on any `ok !== true`, and it is called by `runWaveGateSeam`
  at §3.2 step 4 — outside `runAdvisorySeam`, exactly once per wave. The caller does not simply
  decline to dispatch, and it cannot use the `__preDispatch` escape (that is a `gatherEvidence`
  return value, read inside the driver, which is never entered here): per §2.5 it writes the
  advisory record entry and the escalation entry itself, with **no refusal reason** — the escalation
  is a diagnosis-only outcome per REQ AC-3.4 and FSPEC BR-15, and `snapshot-unavailable` is
  diagnostic prose in the escalation sentence, the notice and §4.5's `diagnosis` field, never a
  ninth member of `ADVISORY_REFUSAL_REASONS` — and only then lets the wave halt on its own gate
  literal. Refusing to act beats acting without a way back — and refusing to act while writing
  nothing down is what the first draft got wrong.
- `restoreTreeSnapshot` **throws** on any `ok !== true`. The throw is what `doRevert` tags
  `__isRevertFailure` and the driver's terminal catch rethrows — E-28, AT-05-5.

`_git` is agent-transcribed at runtime, so a garbled reply reads as `ok !== true` and lands in the
fail-closed arm. That is the correct direction: a snapshot A6 cannot prove it took is a snapshot it
does not have.

### 3.6 Committing an E-6 repair, and telling the later task (O-8)

M-WG-12 is the gap: the wave commit loop commits only paths owned by tasks *in that wave*, and an
E-6 promotion by construction lands in a later task's paths. Left alone, a resolved wave would
strand its own repair as an uncommitted working-tree change.

After the per-task loop, inside the same `if (waveGit)` block and past the same green gate, one
further `commitPaths` call runs with the **full argument set the shipped writer requires** — it
is not a two-argument call:

| Argument | Value |
|---|---|
| `paths` | the promotion's produced paths, already proven ⊆ the later task's owned set (§3.4) |
| `message` | `chore({feature}): wave {N} advisory promotion ({taskId})` — required by `commitPaths`; the per-task and build-output calls both pass one, and omitting it is not optional |
| `what` | `Wave N advisory promotion (task T)` — the emit label, not the commit message |
| `_git`, `_sleep`, `emit`, `provenance` | the wave loop's own, unchanged |

The literal `message` matters beyond the call compiling: AT-04-5's oracle inspects the branch and
must identify this commit by its message and its pathspec, so the message is spelled here rather
than left to Phase I. `provenance` is passed unchanged, so the promotion commit carries the same
trailer the wave's other commits do.

The later task's dispatch is told through the prompt: `waveImplementPrompt(task, featureName,
promotions)` gains an optional third argument, a `Map<taskId, {paths, symbol}>` threaded down the
wave loop. When the map has a row for the task being dispatched, the prompt carries one clause
naming the symbol and its paths and instructing the agent to revise what exists rather than
rediscover it (BR-12). Absent a row, the prompt is byte-identical to today's — which is what keeps
every existing prompt fixture green.

The map lives in the Phase I scope, so the clause reaches a later task **in the same run**. Across
runs it does not survive; the *commit* does, so the later task's agent finds the promotion in the
tree either way. §6 OQ-6 records the asymmetry rather than leaving it to be discovered.


**This interpretation is routed to DECISIONS, not settled in this paragraph (PM F-06).** FSPEC
BR-8's licence — "that scope may widen under O-8's E-6 resolution" — reads naturally as *widening
the existing per-task commit's pathspec*, and this design instead *adds a call* with its own
`what` label, which surfaces in git history as a third commit. The product reviewer has ruled the
added call acceptable, and the engineering argument for it stands: widening a per-task commit's
pathspec would make one task's commit carry another task's paths, breaking the pathspec-scoping
discipline M-WG-4 rests on, and AT-04-3's oracle is over writer *identities*, which either shape
preserves. But a load-bearing interpretive choice with a live alternative belongs in
`DECISIONS-pdlc-advisory-wave-gate.md` with a re-evaluation trigger, not in a design paragraph
that a later reader would have to reverse-engineer from AT-04-3. §6 OQ-8 carries it as a resolved
question, and it is one of the two entries this feature's DECISIONS document is warranted for.

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
| `waveBudgetPerRun` | integer ≥ 0 | `1` | `nonNegativeInt` | `0` is a legal configured value (E-33), not a misconfiguration: it is the **documented operator affordance** "keep the tier on, keep A6 off" — every red wave escalates with no dispatch and the sixth summary row reads zero, which is observably different from `advisory.enabled: false`, where the report carries no `advisory` key at all. Mirrored into `.claude/pdlc.config.example.json`; no `pdlc/engine` expectation covers it today (see below) |

`enabled`, `attemptBudget`, `seamBudgetMinutes` and `envelope` keep their shipped validators and
defaults. `.claude/pdlc.config.example.json` — the tracked arrangement — gains the key alongside
them.

**Nothing mirrors that key into `pdlc/engine` today, and an earlier draft said otherwise (PM F-01,
TE F-06, DEC-A6-04's consequences).** The tracked example carries exactly two sections, `dispatch`
and `implementation`; `pdlc/engine/__tests__/ci-arrangement.test.js` contains zero occurrences of
`advisory` and reads the example file only to assert `implementation.testCommand`. Adding
`advisory.waveBudgetPerRun` to the example therefore breaks no engine expectation and requires no
engine edit to stay green — which is exactly the problem: an affordance nothing asserts can ship
into the example broken and undiscoverable, and the example is the operator's first and possibly
only encounter with the key on a tier that ships off. This feature therefore **authors a new
expectation** in `pdlc/engine/__tests__/ci-arrangement.test.js` — the example's `advisory` section
parses, carries `waveBudgetPerRun`, and its value is a non-negative integer — beside the shipped
`implementation.testCommand` test. It is a second-channel edit whose work is authoring a new
assertion, not relocating an existing one. No FSPEC acceptance test ranges over it: the coverage is
TSPEC-owned (§5.1), and without it no test in the feature's set would fail on a broken example.

### 4.5 What A6 writes, and where

| Artifact | Path | Shape | When |
|---|---|---|---|
| Advisory record entry | `docs/{feature}/ADVISORY-{feature}.md` | The tier's `renderAdvisoryEntry` table, plus the root-cause class and, on a resolution, the repair's paths | Every terminal disposition, including the no-dispatch escalation |
| Escalation log entry | `docs/_queue/ESCALATIONS.md` | The tier's `renderEscalationEntry`, root-cause class in the decision sentence | Every `escalated` disposition |
| Report notice | run report `notices` | The tier's `ADVISORY ESCALATION: seam A6 …`; and, separately, a failed escalation-log write | Every escalation (E-30, AT-06-6) |
| Halt fields | `haltError`'s `fields` | `{rootCause, diagnosis, repairApplied, repairPaths}`, at the literal values named below | Every A6-touched halt: a non-resolved wave (AC-6.3), a capture-failure escalation (§2.5), **and** a post-gate un-skip halt on a wave A6 resolved (below) |
| Snapshot ref | `refs/pdlc/a6-snapshot-{waveNum}` | A dangling commit | Every A6 invocation that reached the snapshot step; one ref per wave, never overwritten by a later wave (§2.5, PM F-03), asserted on §5.2's two-red-wave run — a single-wave fixture cannot see it |

Two consequences worth stating rather than discovering:

- **The capture-failure halt's four fields have literal values, not derived ones (PM F-03, TE
  F-18).** On that path no agent was dispatched, so there is no diagnosis to carry and no repair
  to name, and the row above would otherwise read as an omission rather than a decision. The
  values are fixed and transcribable, which is what lets §5.5's fixture assert them rather than
  compare against whatever the implementation happens to produce:

  | Field | Value on a capture-failure halt |
  |---|---|
  | `rootCause` | `"unclassified"` — §2.5's table, no diagnosis was ever obtained |
  | `diagnosis` | the fixed sentence `snapshot capture failed (snapshot-unavailable); no repair was proposed and none was applied` — the one place this diagnostic is required to appear verbatim, and the string §5.5 transcribes |
  | `repairApplied` | `false` |
  | `repairPaths` | `[]` — the empty array, not `undefined`: the field is present so the halt report's shape is the same on every A6-touched halt |

  AC-6.3 asks that an A6-touched halt carry a diagnosis; here the honest diagnosis is that none
  could be obtained, and the fixed sentence says exactly that rather than leaving the field null.

- **The post-gate un-skip halt is a designed carrier, not an inherited one (TE F-01).** BR-10's
  three restoration triggers are exhaustive, so a wave A6 *resolved* whose un-skip guard then
  halts keeps its repair in the working tree — and AT-05-4 requires that both the advisory record
  entry **and the halt report** say so and name the repair's paths. The shipped un-skip halt
  cannot say it: it is `throw haltError(formatUnskipViolations(waveNum, unskip.violations))`,
  a one-argument call with no `fields` object, so today the report carries violations and nothing
  else. AT-05-4's halt-report conjunct is therefore unsatisfiable without a change, and this is
  the change:

  | Aspect | Contract |
  |---|---|
  | Call shape | the un-skip `haltError` gains a **second argument**, `{ advisory: waveAdvisoryFields }`, exactly as the test-gate halt in §2.3 does |
  | Value when A6 did not fire on this wave | `undefined` — the argument is omitted and the halt is byte-identical to today's, which keeps every shipped un-skip fixture green and keeps the disabled tier's byte-identity claim (§5.2) true |
  | Value when A6 resolved this wave | `{rootCause, diagnosis, repairApplied: true, repairPaths}` — the same object §4.5's row names, read from the wave's A6 outcome |
  | Restoration | none. The un-skip halt is not one of BR-10's triggers, and §5.2 asserts the *absence* of restoration on this path alongside the positive assertion that the repair is still present |
  | Message string | unchanged — `formatUnskipViolations`'s output is not rewritten. The diagnosis travels in `fields`, never in the reason string, which is what lets AT-05-3's literal comparison and AC-6.3 both hold |

  The record entry is written at termination, before this halt is known, which is why it states
  "repair applied and remains in the working tree" and names the paths at resolution time rather
  than reporting the halt: the entry describes what A6 did, the halt report describes what the
  wave then hit. Q-02 of the test-engineer review asks whether this shape is the intended
  disposition for "repair greened the gate by skipping a test" — it is: A6 caught post-gate is a
  **retained** repair with a halt beside it, never a refusal, because refusing would restore, and
  restoring here would silently undo work that passed the gate.

- **Only escalations are durably countable.** The advisory record is distilled into LEARNINGS and
  deleted at Phase H2's distil (`pdlc-advisory-corpus-baseline.md` §1), so `plan-ordering-defect`
  recurrence is countable from `ESCALATIONS.md` and resolution counts are not (AC-6.4's honest
  limit, REQ O-2). A6 adds no persistence to change that, deliberately.

## 5. Test Strategy

### 5.1 Where the tests live

This table is the PLAN's file-ownership manifest for the test half of that work, and its file set
is now **set-equal to §1.3's edit list**, not a subset of it: §1.3 and this table name the same
test-side files, checked as an equality in both directions rather than by containment (TE F-02,
TE F-19). The earlier draft's parenthetical arithmetic ("seven here, ten there") was itself the
drift it was warning about, and is dropped in favour of the set-equality rule — the count belongs
to whichever list is authoritative today, and §1.3 is.

| File | Status | Carries |
|---|---|---|
| `pdlc/workflows/__tests__/advisoryWaveGate.test.js` | new | A6's parsers, envelope classification, invocation ordering, snapshot/restore, wave budget, the prohibition tests of §5.5, the capture-failure disposition, the post-gate un-skip halt fields |
| `pdlc/workflows/__tests__/advisoryEnvelope.test.js` | edited | The two transcribed set-equality surfaces (§1.3) |
| `pdlc/workflows/__tests__/advisoryConfig.test.js` | edited | The re-declared `ADVISORY_DEFAULTS`, plus `waveBudgetPerRun`'s non-negative validator (AT-07-2b) |
| `pdlc/workflows/__tests__/advisoryDriver.test.js` | edited | PROP-GATE-06's `GATE_EXCLUSIVITY_REGISTRY`-keys-equal-`ADVISORY_SEAMS` assertion, plus `classifyReply`'s three arms (§3.7) |
| `pdlc/workflows/__tests__/advisoryDisabled.test.js` | edited | The disabled-tier byte-identity cases, extended per §5.2 |
| `pdlc/workflows/__tests__/waveExecution.test.js` | edited | Wave-loop call-site behaviour: A6 reachable only from the red script-gate arm, the un-skip halt's new optional `fields`, the promotion commit |
| `pdlc/workflows/__tests__/advisoryRecord.test.js` | edited | The per-seam `rows.map((r) => r.seam)` `test.each` list gains A6 (§1.3); **and** AC-6.1/AC-6.2's record assertions for A6 — an entry per invocation, the failed-record-write refusal (AT-06-1, AT-06-2) |
| `pdlc/workflows/__tests__/advisoryEscalationLog.test.js` | edited | AC-6.2/AC-6.4's log assertions for A6: the escalation entry's decision sentence carries the root-cause class, and a failed log write never undoes the escalation (AT-06-3, AT-06-5, AT-06-6) |
| `pdlc/workflows/__tests__/advisoryHarvest.test.js` | edited | The harvest seam list, six members (§1.3) |
| `pdlc/workflows/__tests__/consolidationProperties.test.js` | edited | The property-side seam list, six members (§1.3) |
| `pdlc/workflows/__tests__/helpers/advisoryDoubles.js` | edited | The `SEAMS` literal and the A6 double |

The `edited` rows on the transcribed surfaces of §1.3 go red on the first constant edit. That is
the intended signal, not collateral: each of those set-equality and ordered-sequence oracles
exists precisely so that adding a seam cannot be silently additive. Each edit is a transcription
of the new value, never a loosening of the assertion to a subset or a `toContain` check.

Two of the rows are ones the first draft missed for a reason worth naming: `advisoryRecord` and
`advisoryEscalationLog` already exist and already own AC-6.x's shape for the shipped seams, so
A6's record and log obligations belong beside them rather than in the new file. A new suite
re-asserting the record schema would be a second, drifting copy of an oracle that already holds.

**Two files outside the workflows suite are also touched, and the set-equality rule above does not
range over them.** That rule pairs this table with §1.3's transcribed-surface list, which is a
`pdlc/workflows` inventory by construction; these two belong to the engine channel and to
configuration, and are listed here so the PLAN's file-ownership manifest carries them:

| File | Status | Carries |
|---|---|---|
| `.claude/pdlc.config.example.json` | edited | The `advisory` section gains `waveBudgetPerRun`, the operator-facing shape of §4.4's key |
| `pdlc/engine/__tests__/ci-arrangement.test.js` | edited | A **new** expectation over that example key (§4.4): the `advisory` section parses, carries `waveBudgetPerRun`, non-negative integer. Nothing in the file asserts on `advisory` today, so this row is authored, not adjusted |


### 5.2 What is asserted mechanically

- **Totality of the A6-owned parsers.** `parseA6RootCause` and the promotion readers are asserted
  over absent, empty, wrong-cased, duplicated and out-of-set inputs, and return `unclassified` /
  `null` rather than throw on every one. The oracle is that no input in the fuzz set produces an
  exception, and that only exact members of `ADVISORY_ROOT_CAUSES` produce a non-`unclassified`
  class.

- **The ordered invocation sequence.** BR-7's ordered-sequence oracle over the wave's
  `invocations` array — `["post-wave", "test", "post-wave", "test"]` and the two truncated forms —
  never a membership or count check, because the defect it guards against is the seam firing
  before the post-wave gate has had its say.

- **Root-cause-to-envelope binding.** A `test.each` over the four classes × three proposed actions
  asserts exactly the two authorising cells of §4.2's table and refuses the rest. Note what this
  does *not* assert: AC-2.2's first-match precedence, which is prompt-only per §3.3 and has no
  script oracle to write.

- **Restoration triggers are exhaustive.** BR-10's three triggers are asserted as a set, and the
  post-gate un-skip halt is asserted to *not* restore — paired, per AC-4.5, with the positive
  assertions that the repair is still present in the tree and that the halt report carries
  §4.5's advisory fields. The pair is what makes AT-05-4 satisfiable rather than vacuous.

- **Snapshot/restore round-trips run against a real temporary git repository, never a fake `_git`.**
  This is the one place an injected double would be an echo of the assertion rather than a test of
  it (TE F-04): BR-9's oracle is a *path-to-content-hash map* over the tree, and a fake transport
  can only replay whatever the fixture told it to. The suite therefore builds a real repo —
  `mkdtempSync` + `execFileSync("git", …)` with a `_git` adapter over it, the shape
  `advisoryDodSeams.test.js` already ships for the A3 fixtures — and asserts:
  1. the content-hash map taken immediately before A6 acted equals the map after restore, over
     tracked and untracked files alike, generated outputs included;
  2. a `git status`-level comparison is explicitly **not** the oracle, and a companion case pins
     why: a re-run post-wave command that rewrites an already-dirty path passes a status
     comparison and fails the hash-map one (AT-05-2's own stated reason);
  3. an untracked file the wave added is absent after restore;
  4. a `.gitignore`d file the wave added is still present after restore — the assertion that pins
     `git clean -fd` over `-fdx`. **This case is written to the boundary that comes back from
     §2.5's erratum**, not to this document's preference; until the erratum resolves it is written
     as described here and flagged in the suite as upstream-pending.

- **The capture-failure disposition, with the writers named.** `captureTreeSnapshot` failing
  yields, on one run: an advisory record entry, an escalation entry, `attempts === 0`, an unchanged
  wave budget, a halt on AT-05-3's literal with §4.5's four fields attached at their literal values,
  and no `_agent` call. Six positive assertions on one fixture, not an absence check — that is the
  whole point of PM F-02 against the earlier design's outcome of "nothing observable happened". Two
  further assertions come from this round: the record entry's Disposition cell reads a bare
  `escalated` with **no** refusal reason (PM F-01, and a companion assertion pins
  `ADVISORY_REFUSAL_REASONS` at its eight members on the same run), and `captureTreeSnapshot` is
  called exactly **once** across a two-attempt run — the one-snapshot-per-wave invariant, since that
  invariant is what forced the capture out of `gatherEvidence` in the first place (TE F-13). The
  counted quantity is a **capture-unique argv verb, not the transport**: `commit-tree === 1` over the
  `_git` double's recorded argv. A raw call count on `_git` counts the wrong thing, because
  `restoreTreeSnapshot` drives the same transport with `read-tree`/`clean`/`reset` and a two-attempt
  run restores at least once (TE F-25). The capture-failure fixture likewise transcribes the rendered
  record's `Model` cell as the literal `n/a` — not `undefined` — per §2.5's disposition object. The escalation entry carries one further, deliberately weak assertion: its text
  **contains** the failing git verb observed on the `_git` double (`write-tree`, `commit-tree`,
  `update-ref`, …). Containment, not equality, because §4.5's `diagnosis` sentence is fixed and
  compared literally in §5.5 while the escalation entry's `decision` slot is free text (§6 OQ-13);
  without this one line, the only place an operator learns *which* git call failed is uncovered
  (PM Q-02).

- **A resolved wave that took two attempts, with the ledger counted from the first pass.** The
  positive companion to §5.5's dropped-re-gate mutations. **The run keeps the shipped `verifyGate`
  and every other shipped seam op; the red-then-green outcome is driven through the injected
  `_runCommand`**, whose test-command double fails on its first re-gate and passes on its second.
  Nothing about the sequence is stipulated: the real `verifyGate` runs `runWaveGateSequence`, which
  appends the tokens, and the real `apply` moves `ledgerAnchor.value`, so both attempts' outcomes and
  the six-token ledger below are *observed*. Transcribing this case in §5.5's vocabulary — injecting
  a `verifyGate` double that returns `{passed:false}` then `{passed:true}` — would append nothing,
  leave the ledger at the pre-A6 pass's `["post-wave", "test"]`, and make the six-token literal a red
  test against a correct implementation (PM F-01, the same class as TE F-27). So constructed, the
  fixture asserts the run reports the wave **resolved**, that `waveBudget.resolved` incremented by one, and that
  `invocations` reads `["post-wave", "test", "post-wave", "test", "post-wave", "test"]` — **six**
  tokens, not four. Three sequence runs happen on that run and the ledger records all three: the
  wave's own first pass, which is red and is what causes A6 to be entered at all (§2.3), then A6's
  attempt 1, then A6's attempt 2. Round 3 wrote the four-token literal here, which is §2.4's
  *one-attempt* row — first pass plus one re-gate — and would have had Phase P transcribe a red test
  against a correct implementation (TE F-27). The step-6 check is asserted on the same run over the
  quantity it actually reads: the slice above the second `apply` is exactly `["post-wave", "test"]`,
  and it is that slice, not the ledger's tail, that grants the resolution (§3.2 step 6). Without
  this case the mutation fixtures pass against an implementation that resolves nothing at all, which
  is the absence-only shape §5.5 works to avoid (PM F-01).

- **A wave entered over budget still captures, and dispatches nothing.** One run, three positive
  facts and one negative: `waveBudget.resolved` already at `waveBudgetPerRun` on entry ⇒ the
  disposition is `escalated` with `reason: "budget-exhausted"`, an advisory record entry and an
  escalation entry are written, the snapshot was still taken (`commit-tree === 1` and an
  `update-ref` on `refs/pdlc/a6-snapshot-{waveNum}` observed on the `_git` double), and no `_agent`
  call occurs. This is the oracle §3.2 step 3's capture-before-budget ordering was previously
  claimed to already have and did not: AT-02-6 scopes budget arithmetic only, and the
  one-snapshot-per-wave count above runs on a dispatching wave, so no no-dispatch wave appeared in
  any fixture (PM F-02, TE F-24). Without it a later refactor could hoist the pure `waveBudget` read
  above the capture — the exact change §3.2 says was rejected — and nothing would go red.

- **`waveBudgetPerRun: 0` has a behaviour arm, not only a parse arm (TE F-03).** AT-07-2b is
  parse-level (`0` in, `0` back, absent from `invalidKeys`), AT-01-4 is the disabled tier and
  AT-01-6 never reaches the budget gate, so until this fixture nothing exercised the affordance
  §4.4 documents. One run, tier **enabled**, `waveBudgetPerRun: 0`, first wave's script gate red:
  the disposition is `escalated` with `reason: "budget-exhausted"`, the `_agent` double records
  **zero** calls, the snapshot was still taken (§3.2 step 3's capture-before-budget order, as in
  the bullet above), and the report's advisory summary key is **present** with the sixth row's
  counters at zero — the assertion that separates this arm from `advisory.enabled: false`, where
  the key is absent entirely (AT-01-4). Without the present-and-zero conjunct a later
  "simplification" collapsing `0` into `enabled: false` would pass the suite.
- **Two A6 waves in one run write two refs (PM F-05's ref-naming decision, DEC-A6-03).** §4.5's
  "one ref per wave, never overwritten by a later wave" is unobservable on a single-wave fixture:
  a regression to one fixed name passes every assertion in this section. One run with two waves
  whose gates both go red therefore asserts the set of `update-ref` targets observed on the `_git`
  double is set-equal to `{refs/pdlc/a6-snapshot-1, refs/pdlc/a6-snapshot-2}` — two distinct
  targets, each written once. A fixed-name regression writes one target twice and fails on both
  conjuncts.

- **The gate sequence is read from configuration, never hard-coded at length two.** A run configured
  with a `testCommand` and **no** `postWaveCommand` (§2.4's third row) asserts the ledger reads
  `["test", "test"]` on a one-attempt green run and that the wave resolves — the step-6 check
  comparing a one-token sequence against a one-token slice. An implementation that hard-codes 2
  passes every other fixture in this section and fails this one (TE Q-01). §2.4's *other* truncated
  form — a re-gate whose post-wave command fails, leaving `[post-wave, test, post-wave]` — is a red
  outcome, not a resolution, and is covered by the ordinary red-re-gate fixtures; there is no
  post-wave-command-only arrangement to cover, because A6 is entered only under `scriptGate`, and
  `scriptGate` is `Boolean(implConfig.testCommand) && typeof runCommandFn === "function"`
  (`orchestrate-dev.js:14143-14144`). A wave with a post-wave command and no test command runs the
  legacy self-report gate and never reaches this seam at all (§3.2 step 1). The enumeration is
  therefore closed at these two configured shapes (PM Q-02).


- **The disabled tier is byte-identical, and the notice surface is part of what that means.**
  `advisoryDisabled.test.js` gains Phase I cases asserting that under `advisory.enabled: false`
  no A6 dispatch occurs, no model rung is resolved, no snapshot ref is created, the report's
  `advisory` key is **absent** (`undefined`, not `null`), and — added per PM F-05 — that the
  prerequisite notice surface is **identical** to the enabled-but-never-fired run, since §2.6's
  hoist is unconditional by design. The created-file set is byte-identical to the pre-advisory
  baseline (PROP-DIS-*).


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

The earlier draft said "aggregate branch floor 85% enforced per module", which is two mechanisms
run together and neither one accurately (TE F-05). What `npm run test:coverage` actually does,
from `pdlc/workflows/package.json`:

| Stage | Command | Enforces |
|---|---|---|
| 1 | `c8 npm test -- --runInBand` | the `c8` block's floors **in aggregate** over the include set: branches 85, lines 90, functions 90, statements 90 |
| 2 | `c8 report --check-coverage --per-file --branches 85 --lines 0 --functions 0 --statements 0` | branch ≥ 85% on **every included module individually**; the other three are zeroed here because they are already enforced in aggregate at stage 1 |

The include set is exactly `orchestrate-dev.js`, `orchestrate-queue.js`, `build-runtime.mjs` —
`dist/` is generated and `__tests__/` is the instrument, so neither is subject.

The consequence for this feature is the one that matters, and it is not reassuring: **all of A6
lands inside `orchestrate-dev.js`**, a ~15k-line module that dominates both the aggregate and its
own per-file number. Neither floor can fail on A6's branches specifically; a few hundred
uncovered new branches move that file's percentage by a fraction of a point. So coverage is not
an oracle here — it is a backstop that A6 will pass whether or not its own branches are
exercised. The branch inventory is therefore enumerated deliberately in §5.5 and §5.6 rather than
left to the floor:

| Branch family | Arms |
|---|---|
| Root-cause class | 4 classes × {authorises E-5, authorises E-6, authorises nothing} |
| Envelope member | E-5, E-6, and the refused third value |
| Confidence | `high` authorises, `low` does not |
| Snapshot | capture ok / capture fails, restore ok / restore fails |
| Restoration triggers | refusal, budget exhaustion, red re-gate — and the post-gate halt that is none of them |
| Tier and budget gates | disabled tier, `waveBudgetPerRun: 0` (the behaviour arm, §5.2), budget exhausted, attempt budget exhausted |
| Verdict parsing | well-formed, malformed, citation at 23 chars, citation at 24 chars |
| Owned-path matching | exact row, directory row with trailing slash, directory row without |

`Generated artifacts in sync` still requires `node pdlc/workflows/build-runtime.mjs` to be re-run
and `pdlc/workflows/dist/` committed in the wave that edits the module; the repo's
`implementation.postWavePathspecs` already names that directory, so the per-wave commit carries
it.


### 5.5 Prohibitions, paired positives, and the tests neither review found a home for

PM F-03 is right that the first draft had no surface for three P0 obligations. They are allocated
here, in shapes rather than filenames, because a filename is not an oracle.

**The rule the whole subsection obeys (AC-4.5).** For every test that proves a prohibition holds,
the same test asserts the corresponding **positive** outcome on the same run: the refusal reason
is recorded, the escalation entry is written, and the pre-A6 behaviour is taken. A negative
assertion alone is satisfied by a run in which the seam never fired, which is the exact failure
mode A6's licence to exist depends on not having. Every row below is written to that rule, and
`AC-4.5` is named in the suite so the rule is greppable rather than tacit.

**One test per prohibition, `(f)`…`(i)` (AT-03-5, AC-3.3, AC-3.5).** The id set is separately
compared by set-equality against `A6_PROHIBITIONS`'s transcribed literal, so a deleted prohibition
fails the suite rather than passing a containment check. Then, one by one:

| Prohibition | Proposals exercised, each its own test | Negative asserted | Paired positive asserted on the same run |
|---|---|---|---|
| `(f)` PLAN, task table, ownership manifest | three tests: a PLAN prose edit, a PLAN **task-table** edit, a file-ownership-manifest edit | the path is not present in the tree afterwards | disposition `escalated`, the shipped refusal reason (`out-of-envelope`) recorded on the advisory record entry, escalation entry written, wave halts on AT-05-3's literal |
| `(g)` implementation configuration | three tests: `testCommand`, `postWaveCommand`, `postWavePathspecs` | `.claude/pdlc.config.json` byte-identical after the run | same four positives; additionally the gate command actually re-run is the pre-proposal one, asserted from the `invocations` array — The fixture's repo **has** a `.claude/pdlc.config.json` on disk before the run: byte-identity over an absent file is satisfied by absence, which is not the property meant (TE Q-02) |
| `(h)` commit, push, tag | three tests, one per verb, driven through the `_git` double | no `commit`/`push`/`tag` argv reached the transport | the committing writer identities on that run equal the pre-A6 baseline (AT-04-3's oracle), and the refusal is recorded — The premise is asserted too, not assumed: the run's dispatch options object carries no key beyond the shipped seam's, so `_git` really is the only transport A6's agent can reach and the negative is falsifiable (TE F-17, §3.3, AT-07-5) |
| `(i)` path outside E-5 ∪ E-6 | two tests: wholly outside; partly inside and partly outside (E-16) | no part of the proposal is present in the tree afterwards | `out-of-envelope` recorded, escalation written, and the run does **not** report the wave resolved |

**AC-4.1's conjunct (iii): two mutation fixtures (REQ v1.8, erratum round 4, F-24; TE F-28).**
Conjuncts (i) and (ii) are ordinary fixtures: an applied repair + a green re-gate ⇒ resolved; an
applied repair + a red re-gate ⇒ halt, restore. Conjunct (iii) — *A6 applies a repair and **no** gate
invocation follows ⇒ the wave halts* — is unreachable on an ordinary run, because the shipped driver
always re-gates. It is asserted by fixtures that **mutate the shipped control flow to drop a
re-gate** and assert the halt survives. Two are written, because one drop shape does not pin the
rule:

| Fixture | Mutation | What only the real rule refuses |
|---|---|---|
| `conjunct (iii): a dropped re-gate does not yield resolution` | `verifyGate` records its call and returns `{passed: true}` without running the gate sequence, on A6's **first** attempt | The slice above that attempt's `apply` anchor is empty. A suffix check would pass here, because the ledger's final tokens are the wave's own pre-A6 pass (§3.2 step 6) |
| `conjunct (iii): a re-gate dropped on attempt 2 does not yield resolution` | Attempt 1 runs a genuine red sequence (driver reverts, `consumesAttempt: true`, `orchestrate-dev.js:3554-3568`); attempt 2's `verifyGate` returns `{passed: true}` without running anything | The ledger *has* grown since dispatch, by one whole clean sequence, and ends in one. Every unanchored quantity — suffix, non-empty growth, whole-multiple-of-the-sequence — passes. Only growth measured from attempt 2's `apply` is empty and refuses (TE F-28) |

**What the mutation fixtures replace, and what they must also assert (TE F-30).** Each fixture runs
the **real** `buildA6SeamOps` with exactly one member replaced — `{...seamOps, verifyGate: fake}` —
so the real `apply` still writes `ledgerAnchor.value` and the real `producedPaths` still gates step 5.
That matters twice over. It is the only construction under which the mutation is *the dropped
re-gate* rather than a differently-broken seam; and it is why each fixture carries, beside the
threefold negative above, one **positive assertion that the anchor was recorded**: on the attempt-2
fixture, `invocations` is asserted to read the four tokens attempt 1 genuinely produced
(`["post-wave", "test", "post-wave", "test"]`) and `ledgerAnchor.value` to equal `4` — the ledger
demonstrably grew, the anchor demonstrably moved past that growth, and resolution is refused anyway.
Without that half the pair is satisfied by a build that records no anchor at all, since a missing
anchor refuses everything; with it, an implementation that never writes the carrier fails on the
recorded value before it is ever asked about the disposition. The first fixture's companion half is
the same shape one attempt earlier: `ledgerAnchor.value === 2`, the pre-A6 pass's two tokens below
it, and an empty slice above.

- the rule they falsify is the real one, stated in §3.2 step 6: resolution requires that the tokens
  appended to the wave's `invocations` ledger **since the last `apply`** are exactly the wave's
  configured gate sequence — not merely the `resolved` outcome the driver returns, not a suffix over
  the whole ledger, and not a growth-since-dispatch multiple of `attempts`. Round 2's
  growth-since-dispatch equality denied resolution to a legitimate two-attempt run (PM F-01 /
  TE F-21); round 3's suffix check granted resolution to the first fixture above (PM F-01 / TE F-26);
  a multiple of `attempts + 1` denies it to a run whose first reply was malformed, since `attempts`
  is also consumed on paths that never gate (`orchestrate-dev.js:3428`, `:3459`). The anchored rule
  is the one that refuses both fixtures and admits both legitimate runs;
- without such a rule the fixtures would assert a property no specified design ever states, and
  would fail an implementation for doing what the document told it to do (TE F-14) — which is why
  the rule was added to §3 and the assertion is not softened here;
- each fixture's assertion is positive and threefold on one run: the terminal disposition is not
  `resolved`, the wave halts on AT-05-3's literal, and the run reports `0` waves resolved;
- both are paired with the **positive companions** in §5.2: the two-attempt run whose first
  `verifyGate` is red (`consumesAttempt: true`) and whose second is green is asserted **resolved**,
  with `invocations` reading `["post-wave", "test", "post-wave", "test", "post-wave", "test"]` (six
  tokens — first pass plus two attempts, TE F-27) and `waveBudget.resolved` incremented. Without the
  companions the mutation fixtures pass against an implementation that resolves nothing at all — the
  absence-only shape this section exists to refuse (PM F-01);
- both are mutation tests in the strict sense — they fail if and only if the implementation lets an
  advisory verdict substitute for a gate result, which is BR-7's whole content.

Both fixtures are named in the PLAN as their own tasks so they cannot be quietly folded into (i) and
(ii) and lost; their absence in the first draft read as a drop rather than a judgement, and it was
a drop.
**AC-4.2 / AC-4.3 negative-plus-positive pairs.** AC-4.2 ("A6 never commits") is asserted as
writer-identity equality against the pre-A6 baseline **plus** the positive that the wave's own
commits still happened past a green gate — an assertion that the tree was committed by the wave,
not that nothing committed. AC-4.3 (prohibited operations) is the `(f)`…`(i)` table above.

**Four tests neither AT covers, added because this document made a claim that needs one:**

| Test | Why it exists | Oracle |
|---|---|---|
| Owned-path row spellings | §3.4's trailing-slash precondition (TE F-06) | manifest row `pdlc/workflows/dist/` covers `…/dist/x.js`; row `pdlc/workflows/dist` refuses the same path as `out-of-envelope`. Both asserted, so the precondition is visible rather than latent |
| Citation floor boundary | §3.3's `A6_MIN_CITATION_CHARS = 24` (TE F-09) | a 23-normalised-character citation is malformed and consumes one attempt; a 24-character one is accepted. Both sides on one fixture — a floor asserted only from above passes an implementation with no floor |
| Both-prerequisites-absent notice | §2.6's single-statement shape (TE F-08) | a run with no ownership manifest **and** no `testCommand` emits exactly **one** inapplicability statement naming both causes, not two. The only configuration where the hoist could regress AT-01-5 |
| Ignored-path-only repair | §3.3's `apply` observation (TE F-07) | a repair writing only a `.gitignore`d path yields `producedPaths() === []`, `{ok:false}`, `post-action-verification-failed`, an escalation entry, and a tree carried no further. Flagged upstream-pending with §2.5's erratum |


### 5.6 Every FSPEC acceptance test has a home

TE F-03 is the finding that most changes what the PLAN can do: §5.1 and §5.2 enumerate *themes*,
and a theme list is checked by containment, while FSPEC's AT set is a set. Nineteen ATs — AT-04-5
and AT-07-1 among them, the E-6 promotion mechanism and the single largest test obligation in the
spec — had no named test anywhere in the first draft. The table below is total over FSPEC §6: one
row per AT, its test home, and the oracle in one line. The PLAN derives one red-test row per AT
from it, so an AT with no home here is a task with no home there.

| AT | Test home | Oracle in one line |
|---|---|---|
| AT-01-1 | `advisoryEnvelope.test.js` | `ADVISORY_SEAMS` set-equal to the six-member literal, and every catalogue-driven surface carries six rows |
| AT-01-2 | `waveExecution.test.js` | on a dispatch failure and on a post-wave failure, the A6 call count is `0` and the halt is the shipped one — structural, per §2.3 |
| AT-01-3 | `waveExecution.test.js` | V-wave red gate: A6 call count `0`, halt reason string and queue row equal the pre-A6 literals |
| AT-01-4 | `advisoryDisabled.test.js` | `advisory.enabled: false`: no dispatch, no rung resolution, no snapshot ref, created-file set equals baseline, report `advisory` key **absent** |
| AT-01-5 | `advisoryWaveGate.test.js` | one inapplicability statement over the whole notice surface on the both-absent fixture (§5.5's third added test) |
| AT-01-6 | `advisoryDisabled.test.js` | tier enabled, no wave red: `advisory` key **present**, six rows, A6 counter `0` — paired with AT-01-4 |
| AT-02-1 | `advisoryEnvelope.test.js` | `ADVISORY_ROOT_CAUSES` set-equal to the four-member literal |
| AT-02-2 | `advisoryWaveGate.test.js` | absent class and out-of-set class both ⇒ `unclassified`, escalate, `attempts` unchanged (§3.3's `parseA6RootCause`) |
| AT-02-3 | `advisoryWaveGate.test.js` | verdict both malformed and unclassifiable ⇒ malformed-verdict escalation, exactly one attempt consumed (E-09's tie-break, §3.7) |
| AT-02-4 | `advisoryWaveGate.test.js` | diagnosis citing no gate output ⇒ malformed, one attempt (`citesGateOutput` false) |
| AT-02-5 | `advisoryWaveGate.test.js` | gate output longer than `outputTail`'s 30 lines; the cited region is outside the tail and inside `gateResult.output` |
| AT-02-6 | `advisoryWaveGate.test.js` | two escalated waves leave `waveBudget.resolved` at `0`; one resolved wave increments it to `1` |
| AT-02-7 | `advisoryDriver.test.js` | one dispatch→verdict window against `seamBudgetMinutes`, the window being **per attempt** since FSPEC v1.4's BR-11 (worst case `attemptBudget × seamBudgetMinutes` on one wave), plus the positive disposition companion — driver-owned, A6 passes the shipped config through |
| AT-02-8 | `advisoryWaveGate.test.js` | `environmental` and `unclassified` each: disposition `escalated`, no repair, no restoration, **no** refusal reason, class present in the escalation entry — negatives paired with positives per AC-4.5 |
| AT-02-9 | `advisoryWaveGate.test.js` | `attemptBudget` `1` ⇒ exactly one dispatch; `2` ⇒ exactly two; counted, never bounded |
| AT-03-1 | `advisoryEnvelope.test.js` | `ENVELOPE_DEFAULTS` set-equal to `E-1`…`E-6` |
| AT-03-2 | `advisoryWaveGate.test.js` | proposal inside the wave's owned paths but touching a test file ⇒ `revert-on-test-touch` (X-a), **not** the declared-scope reason — precedence made falsifiable |
| AT-03-3 | `advisoryWaveGate.test.js` | wave owning a guard path, proposal confined to it ⇒ `out-of-envelope` (X-e via `effectiveGuardPaths`) |
| AT-03-4 | `advisoryWaveGate.test.js` | E-6 proposal: permitted only when both halves hold; companion with a valid symbol but an out-of-set path is refused (§3.4's three conjuncts) |
| AT-03-5 | `advisoryWaveGate.test.js` | **§5.5's prohibition table** — one test per excluded operation, plus set-equality on `A6_PROHIBITIONS` |
| AT-03-6 | `advisoryWaveGate.test.js` | partly-inside/partly-outside proposal: no part present in the tree afterwards, wave not reported resolved (§5.5, `(i)` row) |
| AT-03-7 | `advisoryEnvelope.test.js` | `ADVISORY_REFUSAL_REASONS` ordered-sequence equality, eight members, unchanged — A6 adds none, and the capture-failure path is what would have added a ninth had §2.5 not put the diagnostic in prose instead (PM F-01) |
| AT-03-8 | `advisoryEnvelope.test.js` | `ADVISORY_EXCLUSIONS` ordered-sequence equality over clause ids, unchanged by A6 |
| AT-04-1 | `advisoryWaveGate.test.js` | verdict asserting the wave is fixed + red re-gate ⇒ three positives on one run: `escalated`, halt string equals AT-05-3's literal, resolved-wave count `0` |
| AT-04-1a | `advisoryWaveGate.test.js` | FSPEC v1.4's conjunct (i): applied in-envelope repair + green re-gate ⇒ wave reported resolved, proceeds, and that green invocation appears in AT-04-2's sequence — §5.2's two-attempt six-token run is the carrier |
| AT-04-1b | `advisoryWaveGate.test.js` | FSPEC v1.4's conjunct (iii): applied repair, **no** gate invocation follows ⇒ wave halts, not resolved, resolved-wave count `0`. Unreachable on an ordinary run, so the fixture is §5.5's dropped-re-gate mutation, whose construction is this TSPEC's (O-1) |
| AT-04-2 | `advisoryWaveGate.test.js` | the three worked `invocations` sequences of §2.4, compared as ordered sequences |
| AT-04-3 | `waveExecution.test.js` | committing writer identities equal the pre-A6 baseline, both still past a green gate; scope widening is AT-04-5's, not this one's |
| AT-04-4 | `advisoryWaveGate.test.js` | budget-exhausting red re-gate: refusal reason recorded, escalation entry written, pre-A6 behaviour taken — the AC-4.5 pairing, asserted positively |
| AT-04-5 | `waveExecution.test.js` | **§3.6's promotion commit** — the repair is in the branch's committed state with no residual working-tree change, identified by the `message` literal and its pathspec; advisory record names the paths; later task's prompt carries the promotions clause. Companion: later-task paths outside every post-wave pathspec, which fails before the fix and passes after |
| AT-05-1 | `advisoryWaveGate.test.js` | refusal, budget exhaustion and red re-gate each restore to the post-dispatch, pre-commit tree — the content-hash-map oracle of §5.2, on the real-repo fixture. **Upstream-pending on the same erratum as §5.2's case 4 and §6 OQ-7** (TE F-16): whether the map ranges over `.gitignore`d generated outputs is FSPEC BR-9's to say, so PLAN mints the red-test task with the expected value marked pending rather than this document choosing one |
| AT-05-2 | `advisoryWaveGate.test.js` | post-wave command writing generated outputs: whole-tree restore asserted, a repair-paths-only restore fails the same oracle |
| AT-05-3 | `advisoryWaveGate.test.js` | halt reason string equals the pre-A6 literal, computed from the **first** pass's gate result (§2.3) |
| AT-05-4 | `waveExecution.test.js` | green re-gate then un-skip halt: no restoration, repair still present, and **both** the record entry and the halt report state it and name the paths — the halt-report half is §4.5's new `fields` argument |
| AT-05-5 | `advisoryWaveGate.test.js` | restoration itself failing: `__isRevertFailure` rethrown, wave halts naming the failed restoration, no commit of any kind reached |
| AT-06-1 | `advisoryRecord.test.js` | an entry per invocation naming wave, root-cause class, envelope determination, action, citation — the entry's **field set asserted by set-equality against a transcribed literal**, not containment (TE F-15: a dropped field passes a containment check), with value assertions on top and the class assertion A6's own |
| AT-06-2 | `advisoryRecord.test.js` | failed record write ⇒ action refused, tier's record-write-failure reason carried |
| AT-06-3 | `advisoryEscalationLog.test.js` | escalation entry carries the class alongside the tier's fields, and one sentence stating what the operator must decide |
| AT-06-4 | `advisoryWaveGate.test.js` | halt report following an escalation carries the root-cause class (§4.5's halt fields) |
| AT-06-5 | `advisoryEscalationLog.test.js` | several runs escalating `plan-ordering-defect` are countable from `ESCALATIONS.md` — the durability argument of §4.5 |
| AT-06-6 | `advisoryEscalationLog.test.js` | failed escalation-log write: disposition still `escalated`, halt unchanged, failure surfaced on the run report's notice channel, never upgraded to `resolved` |
| AT-07-1 | `advisoryWaveGate.test.js` | **the BR-1…BR-16 partition**, driven by a stub agent double (no live model, no prompt), one case per proposable rule: BR-2 under its own outcome (`unclassified`, no reason, no attempt), BR-3 with `attemptBudget` `1`, BR-5, BR-6, BR-7, BR-8. The oracle is a **set-equality**, and the literal compared is named so it cannot drift (TE F-20): `BR-1…BR-16` minus the proposable set must equal the transcribed non-proposable set. A rule that silently becomes proposable therefore reddens the test, where a per-rule containment check would leave the partition green |
| AT-07-2 | `advisoryEnvelope.test.js` + `advisoryConfig.test.js` + `advisoryDisabled.test.js` | every transcribed surface of §1.3 compared by set-equality against its literal; each fails while it still carries the pre-A6 value |
| AT-07-2b | `advisoryConfig.test.js` | config key set equal to shipped keys + `waveBudgetPerRun`; default reads back `1`; `0` in yields `0` back and is absent from the invalid-key report (`nonNegativeInt`, E-33) |
| AT-07-3 | `waveExecution.test.js` | one run: green wave's A6 dispatch count `0` **and** its per-task commit performed, red wave's count `≥ 1`. No timing assertion |
| AT-07-4 | `advisoryDriver.test.js` | A6's resolved rung equals the tier's, from the shared `rungState` memo — no second resolution in a run that already resolved one |
| AT-07-5 | `advisoryDriver.test.js` | A6's dispatch options equal a shipped seam's, member for member — tool grants, transport, environment |

Two rows deserve a note rather than a line. **AT-07-1** is not a single test: it is a partition
over BR-1…BR-16 in which every proposable rule gets a stub-double case and every non-proposable
rule gets a transcribed justification asserted in the same file, so BR-16's claim that every §4
boundary is script-enforced is discharged rather than sampled — with the one qualification §3.3
records, that AC-2.2's precedence is prompt-only. **AT-04-5** is the only AT whose companion case
is chosen to be **red against today's behaviour**: the shipped commit loop commits only paths
owned by tasks in the wave (M-WG-12), so a later task's paths outside every post-wave pathspec
leave the repair uncommitted. That case must fail before §3.6's promotion commit exists and pass
after, which is what makes it a test of the fix rather than a description of it.

## 6. Open Questions

| # | Question | Blocking? | Current disposition |
|---|---|---|---|
| OQ-1 | Should `waveBudgetPerRun: 0` be rejected at parse time rather than accepted as a configured value that escalates every wave pre-dispatch? | no | Accepted as configured, per E-33; the behaviour is coherent but undocumented upstream. See the FSPEC erratum on E-33. |
| OQ-2 | Should a run that halts with an applied-and-retained repair leave its snapshot ref in place for operator recovery, or delete it? | no | Left in place. It is a dangling ref costing one commit object, and it is the only mechanical record of the pre-repair tree once the wave has halted. Round 4 makes the name wave-scoped (`refs/pdlc/a6-snapshot-{waveNum}`, §2.5) so that this promise survives a multi-wave run: under the earlier single fixed name, a later wave's capture — including a no-dispatch over-budget one — rewrote the ref and destroyed the record of an earlier, resolved wave's pre-repair tree (PM F-03). Round 5 records what wave-scoping still does **not** buy (PM F-02): the name carries no run discriminator, so re-running a halted feature overwrites wave 1's ref, and nothing prunes the refs that survive — one dangling commit per wave per run. Both costs are the operator's and neither touches content, so the disposition stands; a run id or capture timestamp in the ref name is the recorded remedy if the overwrite ever costs an investigation. |
| OQ-3 | Should `plan-ordering-defect` recurrence feed back into Phase P's PLAN lint, so a repeatedly-promoted dependency becomes a PLAN-time error? | no | Out of scope; recorded because `ESCALATIONS.md` is the durable corpus that would make it possible (AC-6.4, REQ O-2). |
| OQ-4 | Should E-6 promotions be visible to the *queue* driver, so a halted feature's re-run starts from the corrected ordering? | no | No. Promotions are per-run state by §4.3, and a re-run re-derives batches from the PLAN, which the erratum protocol — not A6 — is responsible for correcting. |
| OQ-5 | The staged-index deviation: capture is `git add -A` + `git reset --mixed`, so a wave that staged something before A6 ran gets its content restored but not its *staging*. | no | Accepted. The wave contract is `Do NOT git commit`, so the index equals HEAD on entry and the reset is exact in the ordinary case; in the extraordinary one the loss is staging, never content, which sits inside FSPEC BR-9's content-level oracle. Recorded here because §2.5 asserts it as recorded (PM F-07). |
| OQ-6 | The cross-run promotion asymmetry: the later task's prompt clause lives in Phase I scope, so it reaches the later task in the same run only; the promotion *commit* survives across runs, the clause does not. | no | Accepted. A later task's agent finds the promotion in the tree either way; the clause is a shortcut, not the mechanism. Recorded here because §3.6 asserts it as recorded (PM F-07). |
| OQ-7 | Does BR-9's restoration oracle range over `.gitignore`d paths? FSPEC BR-9 / AT-05-1 and REQ AC-5.1 say "tracked and untracked alike, generated outputs included" with no carve-out; §2.5's mechanism excludes ignored paths on both the capture and the restore side. | **yes, upstream** | Open, and **not decided here** — raised as an erratum on FSPEC BR-9 and AT-05-1, and on REQ AC-5.1. This TSPEC transcribes whichever boundary comes back. It does not block PLAN authoring: §5.2's round-trip case and §5.5's ignored-path-only repair test are the two places the answer lands, and both are already allocated. |
| OQ-8 | E-6's commit shape: BR-8's licence reads as *widening an existing per-task commit's pathspec*; §3.6 instead adds a third `commitPaths` call with its own message and label. | no | **Resolved, and routed to DECISIONS** (PM F-06). The added call is the choice: widening a per-task commit would make one task's commit carry another task's paths, breaking the pathspec-scoping discipline M-WG-4 rests on, while AT-04-3's writer-identity oracle is satisfied by either shape. The product reviewer has ruled the added call acceptable. It gets a `DECISIONS-pdlc-advisory-wave-gate.md` entry with a re-evaluation trigger — *a reviewer or operator objecting to a third commit per resolved wave in git history* — rather than living as a design paragraph a later reader must reverse-engineer from AT-04-3. |
| OQ-9 | Should PLAN authoring wait for the BR-9 erratum (OQ-7) to land, given two test cases — §5.2's ignored-path round-trip and §5.6's AT-05-1 — cannot be written until it does? | no | No. Both are marked upstream-pending in this document, so PLAN mints their red-test tasks with the expected value named as pending and transcribes it when the erratum returns; no other task depends on the answer, and Phase T does not hold on it (PM Q-01) |
| OQ-10 | Should the `pathsCollide` trailing-slash precondition (§3.4) be promoted to `docs/_constraints/DOMAIN-CONSTRAINTS.md` — "directory rows in a PLAN file-ownership manifest are written with a trailing slash" — so Phase P's lint can enforce it for every feature rather than this TSPEC's readers only? | no | Recommended, out of scope here: the trap is shipped, feature-independent, and belongs to the constraint corpus, not to A6's design. This feature's own PLAN carries the slash on every directory row as a Phase P authoring requirement (§3.4), and the general rule is recorded here so Phase H can promote it to the constraint corpus, where a Phase P lint could then enforce it for every feature (PM Q-02) |
| OQ-11 | Does §3.3's `apply` refusal of an ignored-path-only repair (`post-action-verification-failed`) stand on its own merits, independent of how OQ-7 resolves? | no | Yes. The seam refuses to claim a repair it cannot see, cannot restore, and cannot prove was undone; if the erratum widens BR-9's oracle, the widened capture arrives with a widened `producedPaths` and the row is unchanged in either direction (PM Q-03) |
| OQ-12 | Is there any run shape in which A6 escalates but Phase I does **not** go on to halt, making `ADVISORY_SEAM_PHASES.A6`'s fixed `outcome: "halted"` a false record? (PM Q-02) | no | No, and the question is closed here rather than deferred. A6 is only ever entered on an already-red wave test gate (§3.2 step 1), and every non-`resolved` terminal — tier gate, wave budget, capture failure, malformed verdict, out-of-envelope refusal, budget exhaustion, post-action-verification failure — returns `{resolved: false}`, on which the call site rethrows the wave's own halt. The only escape from the halt is a genuine `resolved`, which by definition writes no escalation. The constant is therefore true by construction, not by convention |
| OQ-13 | Should the capture-failure diagnostic carry the underlying git failure (which verb, what `stderr`) rather than only the fixed sentence §4.5 pins? (TE Q-01) | no | Split by slot. §4.5's `diagnosis` field stays the fixed, transcribable sentence — §5.5 compares it literally and a variable tail would make that oracle untestable. The underlying failure belongs in the escalation entry's free-text `decision` slot, which is caller-supplied (§2.5) and carries no equality oracle; PLAN should have the call site interpolate the failing verb there. A failed **record** write on this path is separately not `record-write-failed`: that reason names a resolution withdrawn because it could not be recorded, and here nothing was proposed or applied (§2.5) |
| OQ-14 | Does anything assert that the *failing git verb* named in §6 OQ-13's free-text `decision` slot actually reaches `ESCALATIONS.md`, given §4.5's `diagnosis` is fixed and §5.2's fixtures assert the record entry? | no | Yes, as of this round: the capture-failure fixture (§5.2) adds one **containment** assertion on the escalation entry — the entry's text contains the failing verb (`write-tree`, `commit-tree`, `update-ref`, …) as observed on the `_git` double. Containment, not equality, so the fixed-sentence equality oracle on `diagnosis` is untouched and the free-text slot stays free (PM Q-02). |
| OQ-15 | Should the capture-failure fixture transcribe the record entry's Disposition cell as well as its `Model` cell, so both six-member renderings are pinned on one run? | no | It already pins the Disposition cell as a bare `escalated` with no refusal reason (§5.2, PM F-01 of round 2), and this round adds the `Model` cell literal `n/a`. Both cells are asserted on the same run, which is what TE Q-02 asked for; no further change. |

None of these blocks PLAN authoring; OQ-7 blocks only the two test cases that transcribe its
answer, and both are allocated. **Two entries warrant a DECISIONS document for this feature:**
OQ-8's commit shape, and §2.5's choice of a dangling snapshot commit over `git stash` — the
latter had a real alternative (stash) rejected for a stated reason (it mutates the working tree
at capture time, which is exactly the state being protected), and a re-evaluation trigger (git
gaining a non-mutating stash, or the wave contract permitting staged work). OQ-1 and OQ-3 remain
candidates if a reviewer disagrees with the dispositions above.

One question this round raised and answered in place rather than deferring (PM Q-03):
`waveBudgetPerRun: 0` is a **documented operator affordance**, not an accident of the validator —
"keep the tier on, keep A6 off" — and §4.4 now names it as such. It differs observably from
`advisory.enabled: false`: the tier stays enabled, every red wave escalates with no dispatch, and
the sixth summary row is present reading zero, where the disabled tier carries no `advisory` key
at all (AT-01-4 vs AT-01-6).
