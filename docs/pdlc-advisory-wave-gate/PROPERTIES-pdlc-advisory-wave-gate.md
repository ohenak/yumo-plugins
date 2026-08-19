# PROPERTIES — pdlc-advisory-wave-gate

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → DECISIONS → PLAN → **PROPERTIES**` |
| Downstream | `IMPL` and its tests |
| Cross-Reviews | *(none yet — active while Phase PT runs)* |
| LEARNINGS | `docs/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md` |

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-08-19 | First authored against REQ v1.8, FSPEC v1.4, TSPEC v1.6, DECISIONS (DEC-A6-01…DEC-A6-04) and PLAN v1.2. |

---

## Overview

**What this document is.** The testable-property set for the sixth advisory seam, `A6`, which fires
at exactly one place — a Phase I implementation wave whose script-owned test gate returned non-zero
— attempts one bounded, reversible repair inside a declared envelope, re-runs the wave's whole gate
sequence, and otherwise leaves the pipeline's control flow exactly as it ships today.

**Scope.** Properties derive from REQ v1.8 (AC-1.1…AC-6.4, NFR-1…NFR-6), FSPEC v1.4 (BR-1…BR-16,
E-01…E-33, AT-01-1…AT-07-5), TSPEC v1.6 (§2–§5) and DECISIONS (DEC-A6-01…DEC-A6-04). Every property
names the requirement or spec section it derives from and the PLAN task that owns its test file. No
property ranges over the wave gate itself, wave partitioning, or the commit discipline: those are
correct today (M-WG-3, M-WG-4) and REQ §4 puts them out of scope.

**Where the tests live.** One new suite, `pdlc/workflows/__tests__/advisoryWaveGate.test.js`
(verified absent at HEAD), carries the seam's own behaviour; ten existing suites under
`pdlc/workflows/__tests__` are edited (all ten verified present at HEAD, including
`advisoryEscalationLog.test.js` and `waveExecution.test.js`); one new engine-channel file,
`pdlc/engine/__tests__/advisory-config-example.test.js` (verified absent at HEAD), carries the
example-config expectation. Test homes below are PLAN-owned: no property names a file the PLAN's
file-ownership manifest does not assign to a task.

**Test levels.** The pyramid here is deliberately bottom-heavy, and one level assignment is
load-bearing rather than economical:

| Level | What sits here | Why |
|---|---|---|
| Unit | Constants and transcribed set-equalities, the two pure parsers (`parseA6RootCause`, `citesGateOutput`), owned-path set computation (`waveOwnedPaths`, `laterOwnedPaths`, `ownedSetCovers`), config validation, the driver's `classifyReply` arms | Pure functions with no seam, no clock, no ambient state (TSPEC §3, DC-04) |
| Integration | `runWaveGateSeam` end-to-end over injected `_agent`/`_git`/`_runCommand` doubles: budgets, dispositions, the ordered invocation ledger, prohibitions, record and escalation writes, halt fields | The routing decision — whether the seam is reached, what it consumes, what it writes — is only falsifiable on a run, not on a guard (see PROP-GATE-04, PROP-SEAM-05) |
| Integration (real repository) | Snapshot/restore round trips | A fake `_git` can only echo the fixture; BR-9's oracle is a content-hash map over a real tree (TSPEC §5.2) |
| E2E | *(none)* | The pipeline has no end-to-end harness for Phase I, and every observable this feature adds is reachable from the wave loop with injected transports |

**Two derivation rules this document applies throughout**, both inherited from the specs rather than
invented here:

1. **Cardinality surfaces are transcription surfaces.** A bare `expect(rows).toHaveLength(5)` is as
   coupled to `ADVISORY_SEAMS`' cardinality as a seam-name list is. All four such sites are verified
   at HEAD — `advisoryDisabled.test.js:622`, `advisoryQueueSeams.test.js:627`,
   `advisoryHarvest.test.js:571`, `advisoryHarvest.test.js:726` — and are property-covered as one
   set (PROP-SEAM-02), not left to a member-literal grep that structurally cannot find them.
2. **No absence-only oracle stands alone.** Every prohibition property carries a positive conjunct
   asserted on the same run (REQ AC-4.5): the disposition reached, the refusal reason recorded, the
   escalation entry written, or the shipped behaviour taken. Properties whose only assertion would
   be "X did not happen" are marked as such and paired explicitly.

## Properties

Each property is a statement about observable behaviour, phrased so that exactly one run or one call
falsifies it. `Traces` names the REQ acceptance criterion or NFR, the FSPEC rule or acceptance test,
and the TSPEC section it derives from. `Home` names the test file and, in parentheses, the PLAN task
that owns that file for the batch in which the property lands.

### A. Seam, applicability, inertness (`PROP-SEAM-*`)

| ID | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-SEAM-01 | `ADVISORY_SEAMS` must set-equal `["A1","A2","A3","A4","A5","A6"]`, and the catalogue-driven per-seam summary rows must number six, on a run where the tier is enabled | Contract | Unit | AC-1.1, AT-01-1, M-WG-8, TSPEC §3.1 | `advisoryEnvelope.test.js` (A6-02) |
| PROP-SEAM-02 | Every transcription surface coupled to the catalogue's cardinality must read six, as one set: `GATE_EXCLUSIVITY_REGISTRY`'s keys (`advisoryDriver.test.js:221`, compared at `:846`), `advisoryRecord.test.js`'s per-seam `test.each` list, the harvest and consolidation seam literals, `helpers/advisoryDoubles.js`'s `SEAMS` literal (`:271`), and the four **bare row-count** assertions at `advisoryDisabled.test.js:622`, `advisoryQueueSeams.test.js:627`, `advisoryHarvest.test.js:571` and `advisoryHarvest.test.js:726` | Contract | Unit | AT-07-2, R-5, BL-06, TSPEC §1.3 | `advisoryDriver`, `advisoryRecord`, `advisoryHarvest`, `consolidationProperties`, `advisoryDisabled`, `advisoryQueueSeams` `.test.js` (A6-03) |
| PROP-SEAM-03 | Given a wave ending on a dispatch-level failure, and separately on a post-wave command failure, A6 must NOT be dispatched (count `0`) **and** the halt reason string and the queue row written must equal the pre-A6 literals for the same failure | Error handling | Integration | AC-1.2, BR-1, AT-01-2, E-20 vs first pass | `waveExecution.test.js` (A6-19) |
| PROP-SEAM-04 | Given the final V-wave's gate returning non-zero, A6 must NOT be dispatched **and** the halt reason string and queue row must equal the pre-A6 literals | Error handling | Integration | AC-1.3, BR-1, AT-01-3, E-05 | `waveExecution.test.js` (A6-19) |
| PROP-SEAM-05 | Given `advisory.enabled: false` and a red wave gate, there must be no A6 dispatch, no model-rung resolution and **no snapshot ref**, the run's created-file set must equal the pre-advisory baseline byte for byte, and `report.advisory` must read `undefined` — never `null`, never a six-row all-zero summary | Contract | Integration | AC-1.4, NFR-2, AT-01-4, E-01, TSPEC §5.2 | `advisoryDisabled.test.js` (A6-20) |
| PROP-SEAM-06 | Given the tier enabled and a run in which no wave gate goes red, `report.advisory` must be **present**, carry six per-seam rows, and every A6 counter must read `0` | Observability | Integration | AC-1.1, AT-01-6, E-32 | `advisoryDisabled.test.js` (A6-20) |
| PROP-SEAM-07 | On a run that reaches Phase I and evaluates wave mode with BL-03 absent, BL-04 absent, or both, an oracle scanning the run report's **whole** notice surface and counting inapplicability *statements* — with no filter on authorship — must count exactly `1`, naming every absent prerequisite; and must count `0` on a run where A6 applies | Observability | Integration | AC-1.5, AT-01-5, E-02, E-03, E-04, TSPEC §2.6 | `advisoryWaveGate.test.js` (A6-15) |
| PROP-SEAM-08 | Given a run with **no** ownership manifest **and** no configured `testCommand`, the widened legacy notice must be one statement listing both causes — never two `emit` calls in sequence | Observability | Integration | AC-1.5, E-04, TSPEC §2.6, §5.5 | `advisoryWaveGate.test.js` (A6-15) |
| PROP-SEAM-09 | Given `advisory.enabled: false`, the prerequisite notice surface must be **identical** to the enabled-but-never-fired run's, the §2.6 hoist being unconditional by design | Contract | Integration | AC-1.4, NFR-2, TSPEC §2.6, §5.2 | `advisoryDisabled.test.js` (A6-20) |
| PROP-SEAM-10 | A6 must be reachable only from the wave-mode branch, under `scriptGate`, on an ordinary wave, on a red test gate; a run degrading to the legacy self-report gate must reach it zero times while still emitting its one notice | Integration | Integration | AC-1.5, BR-1, E-02, E-06, TSPEC §3.2 step 1 | `waveExecution.test.js` (A6-19) |

### B. Invocation contract: verdict, classification, budgets (`PROP-CTR-*`)

| ID | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-CTR-01 | `ADVISORY_ROOT_CAUSES` must set-equal `["plan-ordering-defect","wave-internal-defect","environmental","unclassified"]` | Contract | Unit | AC-2.2, AT-02-1, BR-2 | `advisoryEnvelope.test.js` (A6-02) |
| PROP-CTR-02 | `parseA6RootCause` must be total: absent, empty, wrong-cased, duplicated, out-of-set and non-string inputs must all return `"unclassified"` and none may throw; only an exact member of `ADVISORY_ROOT_CAUSES` may return a non-`unclassified` class; a duplicated `ROOT-CAUSE:` line must resolve last-wins | Data integrity | Unit | AC-2.2, C-3, DC-01, BR-2, TSPEC §3.3, §5.2 | `advisoryWaveGate.test.js` (A6-07) |
| PROP-CTR-03 | Given a verdict whose classification is absent, and one whose classification is outside the set, both must escalate and the attempt count must be **unchanged** in both | Error handling | Integration | AC-2.2, AT-02-2, E-08 | `advisoryWaveGate.test.js` (A6-15) |
| PROP-CTR-04 | Given a malformed verdict, exactly one attempt must be consumed; given a verdict both malformed **and** unclassifiable, the outcome must be the malformed-verdict escalation with exactly one attempt consumed | Error handling | Integration | AC-2.1, AT-02-3, E-07, E-09, TSPEC §3.7 | `advisoryWaveGate.test.js` (A6-13, A6-15) |
| PROP-CTR-05 | `citesGateOutput` must return true iff a member of `verdict.evidence`, whitespace-collapsed and trimmed, is at least `A6_MIN_CITATION_CHARS` (`24`) long **and** a substring of the identically-normalised gate output; on one fixture a 23-character citation must be malformed and cost one attempt while a 24-character one is accepted | Data integrity | Unit + Integration | AC-2.3, BR-3, TSPEC §3.3, §5.5 | `advisoryWaveGate.test.js` (A6-07, A6-15) |
| PROP-CTR-06 | Given a diagnosis citing no gate output, the verdict must be treated as malformed and escalate, consuming one attempt | Error handling | Integration | AC-2.3, AT-02-4, E-10, BR-3 | `advisoryWaveGate.test.js` (A6-15) |
| PROP-CTR-07 | `gatherEvidence` must hand A6 the **full** captured `gateResult.output`, never `outputTail`'s 30 lines: a citation to a region present in the full output and absent from the tail must be accepted | Data integrity | Integration | AC-2.3, AT-02-5, E-12, TSPEC §3.3 | `advisoryWaveGate.test.js` (A6-13) |
| PROP-CTR-08 | Given a verdict classified `environmental`, and one classified `unclassified`, each with `CONFIDENCE: high` and no proposal, the terminal disposition must be `escalated`, no repair may be applied, no restoration may run, the outcome must carry **no** refusal reason, and the escalation-log entry must carry the root-cause class | Functional | Integration | AC-3.4, AT-02-8, E-11, E-19, BR-15 | `advisoryWaveGate.test.js` (A6-15) |
| PROP-CTR-09 | Given `advisory.attemptBudget: 1` and a re-gate that stays red, exactly **one** A6 dispatch must occur and the disposition must be `escalated` with `budget-exhausted`; given `attemptBudget: 2` under the same red re-gate, exactly **two** dispatches must occur | Functional | Integration | AC-2.4, AT-02-9, E-24 | `advisoryWaveGate.test.js` (A6-15) |
| PROP-CTR-10 | `advisory.seamBudgetMinutes` must be measured per **attempt**, over the dispatch→verdict window, restarting each attempt: one dispatch exceeding it must escalate `budget-exhausted`, while a companion run whose gate command is slow but whose every dispatch→verdict window stays inside budget must terminate `resolved` on a green re-gate | Performance | Integration | NFR-4, AC-2.4, AT-02-7, E-25, BR-11 | `advisoryDriver.test.js` (A6-11) |
| PROP-CTR-11 | Only resolutions may consume wave budget: with `waveBudgetPerRun: 1`, a run in which A6 attempted and escalated on waves 1 and 2 must dispatch on wave 3 and leave `waveBudget.resolved` at `0`; a run in which A6 **resolved** wave 1 must escalate wave 2 with zero `_agent` calls | Functional | Integration | AC-2.4, AT-02-6, E-26, E-27, BR-11 | `advisoryWaveGate.test.js` (A6-15) |
| PROP-CTR-12 | A wave entered already at `waveBudgetPerRun` must still capture its snapshot before escalating: on one run the disposition is `escalated` with `reason: "budget-exhausted"`, a record entry and an escalation entry are written, `commit-tree` is observed exactly once and an `update-ref` on `refs/pdlc/a6-snapshot-{waveNum}` is observed on the `_git` double, and no `_agent` call occurs | Integration | Integration | AC-2.4, TSPEC §3.2 step 3, §5.2 | `advisoryWaveGate.test.js` (A6-15) |
| PROP-CTR-13 | Given the tier **enabled** and `waveBudgetPerRun: 0`, the first red wave must escalate `budget-exhausted` with zero `_agent` calls, the snapshot must still be taken, and `report.advisory` must be **present** with the sixth row's counters at zero — the conjunct that separates this arm from `advisory.enabled: false` | Functional | Integration | E-33, AC-2.4, DEC-A6-04, TSPEC §4.4, §5.2 | `advisoryWaveGate.test.js` (A6-15) |
### C. Envelope, exclusions, prohibitions (`PROP-ENV-*`)

| ID | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-ENV-01 | `ENVELOPE_DEFAULTS` must set-equal `["E-1","E-2","E-3","E-4","E-5","E-6"]` — one set-equality over member ids, never prose joining two sets | Contract | Unit | AC-3.1, AT-03-1, BR-4 | `advisoryEnvelope.test.js` (A6-02) |
| PROP-ENV-02 | `waveOwnedPaths(waves, waveIndex)` must return the union of `task.files` over `waves[waveIndex]`, and `laterOwnedPaths` the union over every `waves[j]` with `j > waveIndex`, both read from `computeWaves`' annotations and never re-parsed from PLAN text; both must be pure — no `process`, no clock, no ambient state | Data integrity | Unit | AC-3.1, O-4, TSPEC §3.4 | `advisoryWaveGate.test.js` (A6-07) |
| PROP-ENV-03 | `ownedSetCovers` must honour `pathsCollide`'s trailing-slash rule: a manifest row `pdlc/workflows/dist/` must cover `pdlc/workflows/dist/orchestrate-dev.bundle.js`, and a row spelled `pdlc/workflows/dist` must **not** — the produced path being refused `out-of-envelope`. Both spellings asserted on the same pair of fixtures | Data integrity | Unit + Integration | O-4, TSPEC §3.4, §5.5, OQ-10 | `advisoryWaveGate.test.js` (A6-07, A6-15) |
| PROP-ENV-04 | Given a proposal confined to the failing wave's own owned paths where one such path is a test file, the outcome must be a refusal whose reported reason is the test-artifact exclusion's (`revert-on-test-touch`, X-a matching first) — not the declared-scope exclusion's and not a permit under E-5 | Security | Integration | AC-3.2, AT-03-2, E-14, BR-5 | `advisoryWaveGate.test.js` (A6-15) |
| PROP-ENV-05 | Given a wave owning a self-modification guard path (`pdlc/workflows/`, `pdlc/skills/`, `pdlc/hooks/`, `.claude/workflows/`) and a proposal confined to it, the refusal reason must be `out-of-envelope` | Security | Integration | AC-3.2, AT-03-3, E-15, BR-5 | `advisoryWaveGate.test.js` (A6-15) |
| PROP-ENV-06 | `ADVISORY_EXCLUSIONS` must equal, as an **ordered sequence**, `["X-a","X-e","X-d","X-b","X-c"]`: a reordering must fail this property, since the order decides which reason a matching proposal reports | Contract | Unit | AC-3.2, AT-03-8, BR-5 | `advisoryEnvelope.test.js` (A6-02) |
| PROP-ENV-07 | `ADVISORY_REFUSAL_REASONS` must equal, as an ordered sequence, its shipped eight members `["prohibited-action","revert-on-test-touch","out-of-envelope","post-action-verification-failed","record-write-failed","malformed-verdict","low-confidence","budget-exhausted"]` — A6 must add no ninth, the capture-failure path included | Contract | Unit | AC-3.4, AT-03-7, BR-15, TSPEC §2.5 | `advisoryEnvelope.test.js` (A6-02) |
| PROP-ENV-08 | An E-6 proposal must be permitted only if all three script-checked conjuncts hold — `PROMOTES-TASK` names a task in a wave strictly later than `waveIndex`; `PROMOTES`' symbol occurs in that task's PLAN row text; that symbol occurs in the captured gate output — and any conjunct failing must refuse `out-of-envelope`; a companion satisfying the symbol half but changing a path outside the later task's owned set must be refused through X-d | Functional | Integration | AC-3.1, AT-03-4, BR-4, TSPEC §3.4 | `advisoryWaveGate.test.js` (A6-13, A6-15) |
| PROP-ENV-09 | Given a proposal partly inside and partly outside the envelope, **no part of it** may be present in the tree afterwards and the run must not report the wave resolved | Data integrity | Integration | AC-3.5, AT-03-6, E-16 | `advisoryWaveGate.test.js` (A6-15) |
| PROP-ENV-10 | `A6_PROHIBITIONS` must set-equal `["f","g","h","i"]`, and each prohibited operation must be refused by its own test — PLAN prose edit, PLAN task-table edit, ownership-manifest edit, `testCommand` change, post-wave-command change, post-wave-pathspec change, commit, push, tag, wholly-outside path, partly-outside path — each carrying a paired positive assertion on the same run | Security | Unit + Integration | AC-3.3, AC-3.5, AC-4.3, AC-4.5, AT-03-5, BR-6 | `advisoryEnvelope.test.js` (A6-02), `advisoryWaveGate.test.js` (A6-15) |
| PROP-ENV-11 | `permittedActions` must be `["E-5","E-6"]`, narrowed per invocation to `["E-5"]` when the failing wave is the last one — there being no later task whose promotion E-6 could complete | Functional | Integration | AC-3.1, TSPEC §3.3 | `advisoryWaveGate.test.js` (A6-13) |
| PROP-ENV-12 | A `PROPOSED-ACTION:` carrying any value other than a member of `permittedActions` must be refused by the shipped `classifyEnvelope` X-c clause, with no A6-specific code path | Contract | Integration | AC-3.1, TSPEC §3.3, §4.1 | `advisoryWaveGate.test.js` (A6-15) |

### D. The gate, the resolution rule, and commits (`PROP-GATE-*`)

| ID | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-GATE-01 | The wave's `invocations` ledger must equal, **as an ordered sequence**, the configured gate sequence concatenated once per pass (passes = 1 + attempts), each failing pass truncated at its first failing command: `["post-wave","test","post-wave","test"]` for one attempt with both commands; `["post-wave","test","post-wave"]` where the re-gate's post-wave command failed; `["test","test"]` where only a test command is configured. Set equality must not be the unit | Contract | Integration | AC-4.4, AT-04-2, BR-7, E-20, E-21, TSPEC §2.4 | `advisoryWaveGate.test.js` (A6-15) |
| PROP-GATE-02 | A wave may be reported resolved only when the driver's outcome is `resolved` **and** `ledgerAnchor.value >= ledgerAtDispatch` **and** `invocations.slice(ledgerAnchor.value)` equals the configured gate sequence; `ledgerAnchor` must be a mutable carrier created beside `ledgerAtDispatch`, initialised `{value: -1}`, written in place by `apply` as its first statement and never reassigned or hung on the returned SeamOps object | Functional | Integration | AC-4.1, BR-7, TSPEC §3.2 step 6 | `advisoryWaveGate.test.js` (A6-13, A6-15) |
| PROP-GATE-03 | Conjunct (i): given an applied in-envelope repair and a green re-gate, the wave must be reported resolved, must proceed past the gate, `waveBudget.resolved` must increment by one, and the green invocation must appear in the ledger — demonstrated on a two-attempt run whose ledger reads `["post-wave","test","post-wave","test","post-wave","test"]` (six tokens: the wave's own red first pass plus two attempts) | Functional | Integration | AC-4.1, AT-04-1a, BR-7, TSPEC §5.2 | `advisoryWaveGate.test.js` (A6-15) |
| PROP-GATE-04 | Conjunct (iii): given an applied repair and **no** gate invocation following it, the wave must halt, must not be resolved, and the run's resolved-wave count must read `0`. Asserted by two mutation fixtures — re-gate dropped on attempt 1, and dropped on attempt 2 after a genuine red sequence — each running the **real** `buildA6SeamOps` with only `verifyGate` replaced (`{...seamOps, verifyGate: fake}`), each carrying its positive half (`ledgerAnchor.value === 2` and `=== 4` respectively) so that an implementation writing no anchor at all fails on the recorded value | Functional | Integration | AC-4.1, AT-04-1b, BR-7, TSPEC §5.5 | `advisoryWaveGate.test.js` (A6-15) |
| PROP-GATE-05 | Conjunct (ii): given an applied repair and a red re-gate, one attempt must be consumed, the whole working tree restored, the wave halted on its own gate literal (PROP-REST-09's string), and the resolved-wave count must read `0` | Functional | Integration | AC-4.1, AC-4.4, AT-04-1, AT-04-4 | `advisoryWaveGate.test.js` (A6-15) |
| PROP-GATE-06 | The gate sequence must be read from `implConfig`, never hard-coded at length two: a run with a `testCommand` and no `postWaveCommand` must produce the ledger `["test","test"]` on a one-attempt green run and must resolve | Contract | Integration | AC-4.4, E-21, TSPEC §2.4, §5.2 | `advisoryWaveGate.test.js` (A6-15) |
| PROP-GATE-07 | The set of committing writer **identities** must be unchanged from the pre-A6 baseline — the pathspec-scoped per-task commit and the post-wave-pathspec build-output commit, both reached only past a green gate — asserted together with the positive that the wave's own commits did happen on a green-gate run | Contract | Integration | AC-4.2, AT-04-3, BR-8, M-WG-4 | `waveExecution.test.js` (A6-19) |
| PROP-GATE-08 | Given a wave A6 resolved under E-6, once the wave's commit step completes no repair may remain as an uncommitted working-tree change: a further `commitPaths` call must run past the same green gate, scoped to the promotion's produced paths, carrying the message `chore({feature}): wave {N} advisory promotion ({taskId})` and the wave loop's own `provenance`; the advisory record must name the repair's paths and the later PLAN task owning them. Companion, red against today's behaviour: the later task's paths outside every configured post-wave pathspec, where the shipped loop leaves the repair uncommitted | Integration | Integration | AC-4.6, O-8, AT-04-5, BR-12, DEC-A6-02, M-WG-12, TSPEC §3.6 | `waveExecution.test.js` (A6-19) |
| PROP-GATE-09 | `waveImplementPrompt` must carry its promotion clause — naming the symbol and its paths — only when the `promotions` map has a row for the task being dispatched; absent a row the prompt must be **byte-identical** to today's | Contract | Unit | AC-4.6, BR-12, TSPEC §3.6, OQ-6 | `waveExecution.test.js` (A6-19) |
| PROP-GATE-10 | On one run carrying both a green wave and a red-gated wave, the green wave's A6 dispatch count must be `0` **and** that wave must have reached its post-gate commit step with its per-task commit performed, while the red-gated wave's dispatch count must be `≥ 1`. No timing assertion | Performance | Integration | NFR-5, AT-07-3 | `waveExecution.test.js` (A6-19) |
| PROP-GATE-11 | `seamOps.classifyReply` must be optional and default `null`, called once per attempt after `parseAdvisoryVerdict` and `_summarise` and before RE-CHECK, with three arms: `{ok:true}` proceeds; `{malformed:true}` takes the **existing** malformed arm (`attempts += 1`, budget check, `continue`); `{terminate:{outcome,reason}}` terminates with `attempts` unchanged and `appliedSuccessfully:false`. A1–A5's behaviour must be unchanged in shape and in bytes, and no seam-name conditional may exist inside the driver | Contract | Unit | AC-2.2, E-08, E-09, E-11, TSPEC §3.7 | `advisoryDriver.test.js` (A6-11) |


## Oracles

*(section pending)*

## Fixtures

*(section pending)*

## Coverage Matrix

*(section pending)*

## Gaps, Non-Properties and Routed Findings

*(section pending)*
