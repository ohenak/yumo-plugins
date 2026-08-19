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

*(pending)*

## 3. Interfaces

*(pending)*

## 4. Data Model

*(pending)*

## 5. Test Strategy

*(pending)*

## 6. Open Questions

*(pending)*
