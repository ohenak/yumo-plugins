# PROPERTIES — pdlc-advisory-wave-gate

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → DECISIONS → PLAN → **PROPERTIES**` |
| Downstream | `IMPL` and its tests |
| Cross-Reviews | `CROSS-REVIEW-product-manager-PROPERTIES-v1.md`, `CROSS-REVIEW-software-engineer-PROPERTIES-v1.md` (active while Phase PT runs) |
| LEARNINGS | `docs/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md` |

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-08-19 | First authored against REQ v1.8, FSPEC v1.4, TSPEC v1.6, DECISIONS (DEC-A6-01…DEC-A6-04) and PLAN v1.2. |
| 1.1 | 2026-08-19 | Round 1 cross-review findings addressed: PROP-REC-07 re-homed to `advisoryEscalationLog.test.js` with an observable escalation-entry oracle (SE F-01); PROP-GATE-02 restated as ledger-segment assertions ahead of TSPEC's structure (SE F-04); PROP-CFG-03 cites the `ci-arrangement.test.js` precedent and pins the `testCommand` blast radius (SE F-03); §G-2 names CI's `Engine tests` job as A6-04's executor (SE F-02); E-13 recorded as a non-property and E-17/E-18 traced on PROP-ENV-10 (SE F-05); PROP-SEAM-02's remaining member-literal anchors pinned (PM F-01). |

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
| PROP-SEAM-02 | Every transcription surface coupled to the catalogue's cardinality must read six, as one set: `GATE_EXCLUSIVITY_REGISTRY`'s keys (`advisoryDriver.test.js:221`, compared at `:846`), `advisoryRecord.test.js`'s ordered full-catalogue equality (`:496`) and its per-seam `test.each` list (`:544`), the harvest and consolidation seam literals (`advisoryHarvest.test.js:573`, `consolidationProperties.test.js:250`), `helpers/advisoryDoubles.js`'s `SEAMS` literal (`:271`), and the four **bare row-count** assertions at `advisoryDisabled.test.js:622`, `advisoryQueueSeams.test.js:627`, `advisoryHarvest.test.js:571` and `advisoryHarvest.test.js:726` | Contract | Unit | AT-07-2, R-5, BL-06, TSPEC §1.3 | `advisoryDriver`, `advisoryRecord`, `advisoryHarvest`, `consolidationProperties`, `advisoryDisabled`, `advisoryQueueSeams` `.test.js` (A6-03) |
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
| PROP-ENV-10 | `A6_PROHIBITIONS` must set-equal `["f","g","h","i"]`, and each prohibited operation must be refused by its own test — PLAN prose edit, PLAN task-table edit, ownership-manifest edit, `testCommand` change, post-wave-command change, post-wave-pathspec change, commit, push, tag, wholly-outside path, partly-outside path — each carrying a paired positive assertion on the same run | Security | Unit + Integration | AC-3.3, AC-3.5, AC-4.3, AC-4.5, AT-03-5, BR-6, BR-8, E-17, E-18 | `advisoryEnvelope.test.js` (A6-02), `advisoryWaveGate.test.js` (A6-15) |
| PROP-ENV-11 | `permittedActions` must be `["E-5","E-6"]`, narrowed per invocation to `["E-5"]` when the failing wave is the last one — there being no later task whose promotion E-6 could complete | Functional | Integration | AC-3.1, TSPEC §3.3 | `advisoryWaveGate.test.js` (A6-13) |
| PROP-ENV-12 | A `PROPOSED-ACTION:` carrying any value other than a member of `permittedActions` must be refused by the shipped `classifyEnvelope` X-c clause, with no A6-specific code path | Contract | Integration | AC-3.1, TSPEC §3.3, §4.1 | `advisoryWaveGate.test.js` (A6-15) |

### D. The gate, the resolution rule, and commits (`PROP-GATE-*`)

| ID | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-GATE-01 | The wave's `invocations` ledger must equal, **as an ordered sequence**, the configured gate sequence concatenated once per pass (passes = 1 + attempts), each failing pass truncated at its first failing command: `["post-wave","test","post-wave","test"]` for one attempt with both commands; `["post-wave","test","post-wave"]` where the re-gate's post-wave command failed; `["test","test"]` where only a test command is configured. Set equality must not be the unit | Contract | Integration | AC-4.4, AT-04-2, BR-7, E-20, E-21, TSPEC §2.4 | `advisoryWaveGate.test.js` (A6-15) |
| PROP-GATE-02 | A wave may be reported resolved only when the driver's outcome is `resolved` **and** the ledger segment recorded *from the moment the repair was applied* equals the configured gate sequence — never the whole ledger, and never a segment starting before the apply. Observable on three runs: (i) an apply followed by a full green re-gate is resolved; (ii) a run whose pre-A6 red pass already appended the same tokens is **not** resolved on those tokens alone, proving the segment origin is the apply and not the wave start; (iii) a run where no apply ever happened is not resolved, the segment origin never having advanced past its unset value. TSPEC §3.2 step 6 fixes the structure that makes this hold — a mutable carrier created beside `ledgerAtDispatch`, initialised `{value: -1}`, written in place by `apply` as its first statement, never reassigned nor hung on the returned SeamOps object — but the structure is TSPEC's to mandate; the assertions above are this property's | Functional | Integration | AC-4.1, BR-7, TSPEC §3.2 step 6 | `advisoryWaveGate.test.js` (A6-13, A6-15) |
| PROP-GATE-03 | Conjunct (i): given an applied in-envelope repair and a green re-gate, the wave must be reported resolved, must proceed past the gate, `waveBudget.resolved` must increment by one, and the green invocation must appear in the ledger — demonstrated on a two-attempt run whose ledger reads `["post-wave","test","post-wave","test","post-wave","test"]` (six tokens: the wave's own red first pass plus two attempts) | Functional | Integration | AC-4.1, AT-04-1a, BR-7, TSPEC §5.2 | `advisoryWaveGate.test.js` (A6-15) |
| PROP-GATE-04 | Conjunct (iii): given an applied repair and **no** gate invocation following it, the wave must halt, must not be resolved, and the run's resolved-wave count must read `0`. Asserted by two mutation fixtures — re-gate dropped on attempt 1, and dropped on attempt 2 after a genuine red sequence — each running the **real** `buildA6SeamOps` with only `verifyGate` replaced (`{...seamOps, verifyGate: fake}`), each carrying its positive half (`ledgerAnchor.value === 2` and `=== 4` respectively) so that an implementation writing no anchor at all fails on the recorded value | Functional | Integration | AC-4.1, AT-04-1b, BR-7, TSPEC §5.5 | `advisoryWaveGate.test.js` (A6-15) |
| PROP-GATE-05 | Conjunct (ii): given an applied repair and a red re-gate, one attempt must be consumed, the whole working tree restored, the wave halted on its own gate literal (PROP-REST-09's string), and the resolved-wave count must read `0` | Functional | Integration | AC-4.1, AC-4.4, AT-04-1, AT-04-4 | `advisoryWaveGate.test.js` (A6-15) |
| PROP-GATE-06 | The gate sequence must be read from `implConfig`, never hard-coded at length two: a run with a `testCommand` and no `postWaveCommand` must produce the ledger `["test","test"]` on a one-attempt green run and must resolve | Contract | Integration | AC-4.4, E-21, TSPEC §2.4, §5.2 | `advisoryWaveGate.test.js` (A6-15) |
| PROP-GATE-07 | The set of committing writer **identities** must be unchanged from the pre-A6 baseline — the pathspec-scoped per-task commit and the post-wave-pathspec build-output commit, both reached only past a green gate — asserted together with the positive that the wave's own commits did happen on a green-gate run | Contract | Integration | AC-4.2, AT-04-3, BR-8, M-WG-4 | `waveExecution.test.js` (A6-19) |
| PROP-GATE-08 | Given a wave A6 resolved under E-6, once the wave's commit step completes no repair may remain as an uncommitted working-tree change: a further `commitPaths` call must run past the same green gate, scoped to the promotion's produced paths, carrying the message `chore({feature}): wave {N} advisory promotion ({taskId})` and the wave loop's own `provenance`; the advisory record must name the repair's paths and the later PLAN task owning them. Companion, red against today's behaviour: the later task's paths outside every configured post-wave pathspec, where the shipped loop leaves the repair uncommitted | Integration | Integration | AC-4.6, O-8, AT-04-5, BR-12, DEC-A6-02, M-WG-12, TSPEC §3.6 | `waveExecution.test.js` (A6-19) |
| PROP-GATE-09 | `waveImplementPrompt` must carry its promotion clause — naming the symbol and its paths — only when the `promotions` map has a row for the task being dispatched; absent a row the prompt must be **byte-identical** to today's | Contract | Unit | AC-4.6, BR-12, TSPEC §3.6, OQ-6 | `waveExecution.test.js` (A6-19) |
| PROP-GATE-10 | On one run carrying both a green wave and a red-gated wave, the green wave's A6 dispatch count must be `0` **and** that wave must have reached its post-gate commit step with its per-task commit performed, while the red-gated wave's dispatch count must be `≥ 1`. No timing assertion | Performance | Integration | NFR-5, AT-07-3 | `waveExecution.test.js` (A6-19) |
| PROP-GATE-11 | `seamOps.classifyReply` must be optional and default `null`, called once per attempt after `parseAdvisoryVerdict` and `_summarise` and before RE-CHECK, with three arms: `{ok:true}` proceeds; `{malformed:true}` takes the **existing** malformed arm (`attempts += 1`, budget check, `continue`); `{terminate:{outcome,reason}}` terminates with `attempts` unchanged and `appliedSuccessfully:false`. A1–A5's behaviour must be unchanged in shape and in bytes, and no seam-name conditional may exist inside the driver | Contract | Unit | AC-2.2, E-08, E-09, E-11, TSPEC §3.7 | `advisoryDriver.test.js` (A6-11) |

### E. Reversibility, snapshot, restore (`PROP-REST-*`)

| ID | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-REST-01 | On a refusal, on budget exhaustion, and on a red re-gate — three separate runs — the path-to-content-hash map over the working tree, tracked and untracked files alike and generated outputs included, must equal the map taken immediately before A6 acted: the wave's post-dispatch, pre-commit tree, with the wave agents' own uncommitted work intact | Data integrity | Integration (real repo) | AC-5.1, AT-05-1, BR-9, TSPEC §5.2 | `advisoryWaveGate.test.js` (A6-09) |
| PROP-REST-02 | A `git status`-level comparison must **not** satisfy the oracle: a companion run whose re-run post-wave command rewrites an already-dirty path must pass the status comparison and fail the hash-map comparison, demonstrating whole-tree rather than per-path restoration | Data integrity | Integration (real repo) | AC-4.4, AT-05-2, BR-9 | `advisoryWaveGate.test.js` (A6-09) |
| PROP-REST-03 | An untracked file the wave added must be absent after restore; a `.gitignore`d file the wave added must still be present after restore — the assertion that pins `git clean -fd` over `-fdx`. **Upstream-pending:** the boundary is OQ-7's, raised as an erratum on FSPEC BR-9 / AT-05-1 and REQ AC-5.1; until it resolves this case ships as `test.todo` (never `test.skip`, which `orchestrate-dev.js`'s own skip guard would flag) and transcribes whichever boundary the erratum returns | Data integrity | Integration (real repo) | AC-5.1, BR-9, TSPEC §5.2, §6 OQ-7, OQ-9 | `advisoryWaveGate.test.js` (A6-09) |
| PROP-REST-04 | The restoration triggers must be exactly the set `{refusal, budget exhaustion, red re-gate}`; a post-gate un-skip halt following a **green** re-gate must perform no restoration, and on that same run the repair must still be present in the working tree and the halt report must carry §4.5's advisory fields (`haltError`'s second argument `{advisory: waveAdvisoryFields}` with `repairApplied: true` and the repair's paths), while `formatUnskipViolations`' message string is unchanged | Functional | Integration | AC-5.3, AT-05-4, BR-10, E-22, TSPEC §4.5 | `waveExecution.test.js` (A6-19) |
| PROP-REST-05 | Given a restoration that itself fails, `restoreTreeSnapshot` must throw, the throw must be tagged `__isRevertFailure` and rethrown by the driver's terminal catch, the wave must halt naming the failed restoration, and **no commit of any kind** may be reached | Error handling | Integration | AC-5.1, AT-05-5, E-28, TSPEC §3.5 | `advisoryWaveGate.test.js` (A6-09) |
| PROP-REST-06 | `captureTreeSnapshot` must run exactly once per wave — at the call site, before `runAdvisorySeam` is entered — never once per attempt: across a two-attempt run the `_git` double must record `commit-tree` exactly once. The counted quantity must be that capture-unique argv verb, never the raw `_git` call count, since `restoreTreeSnapshot` drives the same transport | Idempotency | Integration | AC-5.1, TSPEC §3.2 step 4, §5.2 | `advisoryWaveGate.test.js` (A6-09, A6-15) |
| PROP-REST-07 | On a run in which two waves' gates both go red, the set of `update-ref` targets observed on the `_git` double must set-equal `{refs/pdlc/a6-snapshot-1, refs/pdlc/a6-snapshot-2}` — two distinct targets, each written once; a fixed-name implementation writes one target twice and must fail both conjuncts | Idempotency | Integration | DEC-A6-03, TSPEC §2.5, §5.2, OQ-2 | `advisoryWaveGate.test.js` (A6-15) |
| PROP-REST-08 | Given `captureTreeSnapshot` returning `null`, on one run: an advisory record entry is written whose Disposition cell reads a bare `escalated` with **no** refusal reason and whose `Model` cell reads the literal `n/a`; an escalation entry is written whose text **contains** the failing git verb observed on the `_git` double; `attempts === 0`; the wave budget is unchanged; no `_agent` call occurs; and the wave halts on its own gate literal with §4.5's four fields at their literal values — `rootCause: "unclassified"`, the fixed `diagnosis` sentence, `repairApplied: false`, `repairPaths: []` | Error handling | Integration | AC-3.4, AC-6.1, AC-6.3, TSPEC §2.5, §4.5, §5.2 | `advisoryWaveGate.test.js` (A6-15) |
| PROP-REST-09 | Given a wave A6 did not resolve, the halt reason string must equal the reason the pre-A6 pipeline emits for the same gate failure and the queue row must be written `halted` exactly as today; the tree the run ends on must be the restored one, first-pass build outputs included | Contract | Integration | AC-5.2, AT-05-3, BR-14, E-23, M-WG-3, M-WG-7 | `advisoryWaveGate.test.js` (A6-15), `waveExecution.test.js` (A6-19) |

### F. Record, escalation, report (`PROP-REC-*`)

| ID | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-REC-01 | Every A6 invocation must append one advisory-record entry naming the wave, the root-cause class, the envelope determination, the action taken or refused, and the gate-output citation; the entry's **field set** must be compared by set-equality against a transcribed literal, never by containment, so that a dropped field fails | Observability | Integration | AC-6.1, AT-06-1, BR-13 | `advisoryRecord.test.js` (A6-16) |
| PROP-REC-02 | Given a record write that fails, the action must be refused rather than taken unrecorded, and the outcome must carry the tier's `record-write-failed` reason | Error handling | Integration | AC-6.1, AT-06-2, E-29, BR-13 | `advisoryRecord.test.js` (A6-16) |
| PROP-REC-03 | Every A6 escalation must append an escalation-log entry to `docs/_queue/ESCALATIONS.md` carrying the root-cause class alongside the tier's required fields and one sentence stating what the operator must decide | Observability | Integration | AC-6.2, AT-06-3, BR-13 | `advisoryEscalationLog.test.js` (A6-17) |
| PROP-REC-04 | Given an escalation whose log write fails, the disposition must still be `escalated`, the halt reason must be unchanged from PROP-REST-09's literal, the write failure must be surfaced on the run report's notice channel, and the disposition must never be upgraded to `resolved` | Error handling | Integration | AC-6.2, AT-06-6, E-30 | `advisoryEscalationLog.test.js` (A6-17) |
| PROP-REC-05 | Given a halt following an A6 escalation, the halt report must carry the diagnosis and the root-cause class in its `advisory` fields — not only the advisory record file | Observability | Integration | AC-6.3, AT-06-4, BR-14, TSPEC §4.5 | `advisoryWaveGate.test.js` (A6-15) |
| PROP-REC-06 | Given several runs in which A6 escalated `plan-ordering-defect`, the per-feature count must be derivable from `ESCALATIONS.md` alone, with no run logs. Paired negative, specified rather than a gap: resolution counts must **not** be derivable after Phase PUB, the advisory record being distilled and deleted | Observability | Integration | AC-6.4, AT-06-5, E-31, REQ O-2 | `advisoryEscalationLog.test.js` (A6-17) |
| PROP-REC-07 | Given an A6 escalation, the escalation-log entry's *Pipeline state* field must read phase `I` with outcome `halted`, and the A3–A5 entries written by the same shipped path on the same suite must keep their own values (`DOD`/`halted`, `PUB`/`halted`) — the field is derived per seam, never passed per call site. The oracle is the **written entry**, not the constant: `ADVISORY_SEAM_PHASES` is module-private at `orchestrate-dev.js:3108` and TSPEC §3.1 does not export it, but an unregistered seam falls back to the literal `unknown` at `orchestrate-dev.js:3338`, so a missing `A6` row is observable as `unknown`/`unknown` in the entry. The `unknown` arm is the negative control, asserted on a fixture whose seam is absent from the table | Contract | Integration | AC-6.2, TSPEC §3.1, §6 OQ-12 | `advisoryEscalationLog.test.js` (A6-17) |

### G. Configuration (`PROP-CFG-*`)

| ID | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-CFG-01 | `ADVISORY_DEFAULTS`' key set must set-equal the shipped keys plus `waveBudgetPerRun`, and `waveBudgetPerRun` must read back its default `1` | Contract | Unit | C-2, AT-07-2b, TSPEC §3.1 | `advisoryConfig.test.js` (A6-02) |
| PROP-CFG-02 | `waveBudgetPerRun` must validate through a `nonNegativeInt` sibling of the shipped `positiveInt`: `0` must survive as a configured value, reading back `0` and absent from the invalid-key report, while `-1`, `1.5`, `"x"` and `null` must be invalid and fall back to `1`; per-key independent fallback must hold, one bad key never retuning another | Data integrity | Unit | E-33, DEC-A6-04, AT-07-2b, TSPEC §3.1, §4.4 | `advisoryConfig.test.js` (A6-02) |
| PROP-CFG-03 | `.claude/pdlc.config.example.json` must carry the **whole** `advisory` section — `{"enabled": false, "waveBudgetPerRun": 1}` — and that section must parse, carry both keys, and hold `waveBudgetPerRun` as a non-negative integer. The file is not a new assertion surface: `pdlc/engine/__tests__/ci-arrangement.test.js:39` already resolves it from `repoRoot` and `:799`–`:819` already parses it, so A6-06's edit lands under two live assertions. The paired blast-radius conjunct is therefore that `implementation.testCommand` still matches both `/cd pdlc\/workflows\s*&&\s*npm test/` and `/cd pdlc\/engine\s*&&\s*npm test/` **after** the advisory key is added — a sibling-key edit that reflowed or truncated `testCommand` would otherwise be caught only incidentally. Asserted in the purpose-named new engine file, never in `ci-arrangement.test.js`, whose stated scope is FSPEC §5.1's CI arrangement alone; extending a second file rather than that one is the batch-safety answer, and `ci-arrangement.test.js` stays unowned by PLAN | Contract | Unit (engine channel) | C-2, TSPEC §4.4, §5.1 | `pdlc/engine/__tests__/advisory-config-example.test.js` (A6-04) |

### H. Non-functional (`PROP-NFR-*`)

| ID | Property | Category | Level | Traces | Home |
|---|---|---|---|---|---|
| PROP-NFR-01 | A6's model rung must be resolved through the tier's exported resolver against the shared per-run `rungState` memo: A6's resolved rung must equal the tier's, and a run that already resolved a rung for A3–A5 must perform no second resolution | Contract | Unit | NFR-6, AT-07-4, REQ O-3 | `advisoryDriver.test.js` (A6-11) |
| PROP-NFR-02 | A6's dispatch options must equal a shipped seam's member for member — tool grants, transport and environment — carrying no key beyond them, in particular no capability letting the agent run `git` itself. This is the premise prohibition `(h)`'s oracle rests on: "no `commit`/`push`/`tag` argv reached `_git`" is falsifiable only while `_git` is the only transport in reach | Security | Integration | NFR-3, AT-07-5, TSPEC §3.3 | `advisoryDriver.test.js` (A6-11) |
| PROP-NFR-03 | Every boundary must be enforced by the workflow script, never only by prompt: BR-1…BR-16 must be partitioned into the agent-proposable set and the non-proposable set, the partition asserted by **set-equality** against a transcribed literal, each proposable rule exercised by a stub agent double returning a violating proposal and refused by the script. The one qualification is stated, not discovered: AC-2.2's first-match class precedence is prompt-only and has no script oracle | Security | Integration | NFR-1, C-4, AT-07-1, BR-16, TSPEC §3.3 | `advisoryWaveGate.test.js` (A6-15) |
| PROP-NFR-04 | No A6 datum may live at module scope: `waveBudget`, `rungState`, `promotions` and `advisoryDispositions` are run-scoped, `invocations` and `snapshot` wave-scoped, `attempts` invocation-scoped, each created in Phase I scope and threaded; and the pure helpers (`waveOwnedPaths`, `laterOwnedPaths`, `ownedSetCovers`, `parseA6RootCause`, `citesGateOutput`) must read no `process`, no clock and no ambient state | Contract | Unit | NFR-1, DC-04, TSPEC §4.3 | `advisoryWaveGate.test.js` (A6-07) |


## Oracles

Nine oracles in this set are easy to write in a shape that cannot fail. Each is pinned here with the
exact quantity to compare, and with the wrong shape named so that Phase I transcribes neither.

**O-A. The ledger is compared as a sequence, and resolution is anchored (PROP-GATE-01, -02, -03, -04).**
The ledger is *not empty* when A6 is entered: the wave's own red first pass has already appended its
tokens (TSPEC §2.3). Three wrong units are ruled out by name — set equality (collapses the duplicates
and admits a resolution declared on one invocation); a suffix check over the whole ledger (satisfied
by the pre-A6 pass's own tokens, so a `verifyGate` returning `{passed:true}` without running anything
passes); and `growth === gateSequence.length × (attempts + 1)` (false on a run whose first reply is
malformed, since `attempts` is consumed on paths that never reach `verifyGate` —
`orchestrate-dev.js:3428`, `:3459`). The oracle is
`sameSequence(invocations.slice(ledgerAnchor.value), gateSequence)` with
`ledgerAnchor.value >= ledgerAtDispatch`, `gateSequence` read from the same `implConfig` the sequence
helper reads.

**O-B. Absence-shaped conjuncts sit at the whole-run seam, never at an injectable unit
(PROP-GATE-04).** "No gate invocation followed the repair" is unreachable on an ordinary run, so it is
asserted by mutation fixtures that keep the **real** `buildA6SeamOps` and replace exactly one member
(`{...seamOps, verifyGate: fake}`). Each fixture carries a positive half — `ledgerAnchor.value === 2`
on the attempt-1 fixture, `=== 4` on the attempt-2 fixture — so that an implementation writing no
anchor at all fails on the recorded value rather than passing an absence check. The two fixtures are
differently broken: attempt 2's `apply` re-anchors past attempt 1's genuine red sequence, so both
drops leave an empty slice.

**O-C. Preservation oracles carry positive-presence conjuncts (PROP-REST-01, -02, -03).** The
restoration oracle is a path-to-content-hash map over a **real** temporary repository
(`mkdtempSync` + `execFileSync("git", …)`, the shape `advisoryDodSeams.test.js:371` already ships),
not an injected `_git` double, which could only echo the fixture. The fixture must contain content
the wave actually changed and content the post-wave command actually rewrote, or "map equals map" is
vacuous. The paired negative control is explicit: a `git status`-level comparison passes a per-path
restore whenever the re-run post-wave command rewrote an already-dirty path, which is the case the
rule exists to fail.

**O-D. Behavioural counts, never raw call counts (PROP-REST-06, -07, PROP-CTR-09, -11, -12, -13).**
`restoreTreeSnapshot` drives the same `_git` transport as `captureTreeSnapshot`, so a raw call count
counts the wrong thing. The counted quantity is a capture-unique argv verb: `commit-tree === 1` over
the double's recorded argv, and the `update-ref` target set for the ref-naming property. Dispatch
counts are counted on the `_agent` double, never inferred from the disposition.

**E. Named positive dispositions, because reason literals are shared (PROP-CTR-10).** `budget-exhausted`
is emitted by both the attempt-budget and the seam-budget arms (E-24, E-25), so a non-escalation is
not readable from the reason string alone. The slow-gate companion must assert the positive
disposition `resolved` on a green re-gate, not merely the absence of `budget-exhausted`.

**F. Precedence oracles assert the reason, not the refusal (PROP-ENV-04, -05).** "It was refused" is
satisfied by any exclusion matching. The claim under test is that X-a matches *first*, so the oracle
is the reported reason literal — `revert-on-test-touch` for the wave's own test file,
`out-of-envelope` for a guard path — and the catalogue order itself is pinned separately by
PROP-ENV-06's ordered-sequence equality.

**G. Fixed strings are transcribed verbatim, from the normative source (PROP-REST-08, PROP-GATE-08).**
Two literals are load-bearing and are quoted here so that no test author paraphrases them:

- the capture-failure `diagnosis` field, TSPEC §4.5's fixed sentence:
  `snapshot capture failed (snapshot-unavailable); no repair was proposed and none was applied`;
- the E-6 promotion commit message, TSPEC §3.6:
  `chore({feature}): wave {N} advisory promotion ({taskId})`, with the emit label
  `Wave N advisory promotion (task T)`.

The record entry's Disposition cell reads a bare `escalated` and its `Model` cell the literal `n/a`.
The escalation entry's free-text `decision` slot is asserted by **containment** of the failing git
verb (`write-tree`, `commit-tree`, `update-ref`), never by equality — §6 OQ-13/OQ-14's split.

**H. The classification oracle is membership, and its known softness is stated (PROP-CTR-02).**
`parseA6RootCause` is testable against `ADVISORY_ROOT_CAUSES` by exact membership. AC-2.2's
first-match *precedence* between classes is not script-enforceable without re-doing the diagnosis the
seam was dispatched to do, so it is prompt-only. The cost is named rather than hidden: AC-6.4's
`plan-ordering-defect` recurrence count is a function of agent judgement to that extent. The blast
radius is bounded by the class-to-envelope binding, which *is* enforced — a failure misclassified
`wave-internal-defect` reaches E-5 only, confined to the wave's own owned paths.

**I. Cardinality assertions are transcription surfaces (PROP-SEAM-02).** The enumeration bar is
*transcription sites*, not member literals: a grep for `"A5"` or `SEAMS` structurally cannot find
`expect(rows).toHaveLength(5)`. The derivation rule — grep for `advisory.rows` and `toHaveLength` as
well as for seam members — is what the property carries, not the snapshot of four sites, so a site
added later is still in scope.

**Falsifiability check applied to every property above.** Each was checked against the five failure
modes the te-author checklist names: preservation oracles have positive-presence conjuncts (O-C);
absence-shaped conjuncts sit at the whole-run seam (O-B); identical-envelope behaviours are counted
behaviourally (O-D); shared reason literals get named positive dispositions (E); and every
prohibition property carries its AC-4.5 positive on the same run. Three properties are deliberately
*weak* and say so: PROP-REC-06's negative half (resolution counts not derivable), PROP-NFR-03's
prompt-only qualification, and PROP-REST-03's upstream-pending boundary.


## Fixtures

Fixtures are named here so that the same double is not re-invented per property, and so that each
one's *normative source* is identifiable. All doubles live in
`pdlc/workflows/__tests__/helpers/advisoryDoubles.js` (PLAN task A6-01, the `[Fake first]` task)
unless the row says otherwise.

| Fixture | Shape | Used by | Source of truth |
|---|---|---|---|
| `SEAMS` literal | Six members, `["A1","A2","A3","A4","A5","A6"]`; verified at HEAD as five at `helpers/advisoryDoubles.js:271` | PROP-SEAM-01, -02 | TSPEC §3.1 |
| Recording `_git` double | Records argv per call; the counted quantities are **verbs** (`commit-tree`, `update-ref`, `read-tree`, `clean`, `reset`) and the `update-ref` target set, never the raw call count | PROP-REST-06, -07, -08, PROP-CTR-12, PROP-ENV-10 `(h)` | TSPEC §5.2 |
| Real-repository fixture builder | `mkdtempSync` + `execFileSync("git", …)` with a `_git` adapter over it — the shape `advisoryDodSeams.test.js:371` already ships for the A3 fixtures | PROP-REST-01, -02, -03, -05 | TSPEC §5.2 |
| A6 agent double | Emits the tier's six verdict lines plus `ROOT-CAUSE:`, `PROMOTES:` and `PROMOTES-TASK:` trailers; parameterised over class, proposed action, confidence and evidence | PROP-CTR-*, PROP-ENV-*, PROP-NFR-03 | TSPEC §4.1 |
| `_runCommand` double | Drives red-then-green re-gates by outcome, **not** by stubbing `verifyGate`: the real `verifyGate` runs `runWaveGateSequence`, which is what appends the ledger tokens | PROP-GATE-01, -03, -06 | TSPEC §5.2 |
| Mutation fixtures | `{...seamOps, verifyGate: fake}` over the **real** `buildA6SeamOps`; one drops the re-gate on attempt 1, one on attempt 2 | PROP-GATE-04 | TSPEC §5.5 |
| Ownership-manifest fixtures | One wave-set with a directory row spelled `pdlc/workflows/dist/` and one spelled `pdlc/workflows/dist`; a later-wave task whose PLAN row text names the promoted symbol | PROP-ENV-02, -03, -08 | TSPEC §3.4 |
| Gate-output fixture | Longer than `outputTail`'s 30 lines, with a distinguishable region below the tail boundary and a symbol name the E-6 conjunct can find | PROP-CTR-05, -07, PROP-ENV-08 | TSPEC §3.3 |
| Citation-floor pair | One citation of 23 normalised characters and one of 24, on the same run | PROP-CTR-05 | TSPEC §3.3 (`A6_MIN_CITATION_CHARS = 24`) |
| Config fixtures | `waveBudgetPerRun` at `1`, `0`, `-1`, `1.5`, `"x"`, `null`, and absent; plus tier-off (`enabled: false`) and tier-on-A6-off (`enabled: true, waveBudgetPerRun: 0`) whole-config arms | PROP-CFG-01, -02, PROP-CTR-13, PROP-SEAM-05 | TSPEC §3.1, §4.4 |
| Example-config fixture | The tracked `.claude/pdlc.config.example.json` itself, read by the engine-channel test — the same file `ci-arrangement.test.js:39` already resolves, so the fixture is a second reader of a live file, not a new one; the `testCommand` regex pair at `:799`–`:819` is the pre-edit baseline the advisory-key addition must leave standing | PROP-CFG-03 | TSPEC §4.4; `ci-arrangement.test.js:39`, `:799`–`:819` |
| Pre-A6 baseline | The halt reason string, queue row and created-file set captured from the shipped pipeline on the same inputs; the gate-failure literal is `orchestrate-dev.js`'s existing `Error: Wave {N} test gate failed — \`{testCommand}\` did not pass. Output tail:\n{tail}` | PROP-SEAM-03, -04, -05, PROP-REST-09, PROP-GATE-05 | `orchestrate-dev.js` wave loop, M-WG-3 |

**Verbatim-string discipline.** Every fixture string that also appears in a normative document is
transcribed from that document, not paraphrased: the four root-cause class names and the eight
refusal reasons from TSPEC §3.1 (the latter verified byte-for-byte against
`orchestrate-dev.js:2297`–`:2306`), the five exclusion ids in their shipped order
(`orchestrate-dev.js:2311`), the capture-failure `diagnosis` sentence and promotion commit message
from Oracle G, and the snapshot ref pattern `refs/pdlc/a6-snapshot-{waveNum}`.

**Two fixture-level hazards, stated so they are not rediscovered.**

1. *Do not transcribe the two-attempt positive companion in the mutation fixtures' vocabulary.*
   Injecting a `verifyGate` double that returns `{passed:false}` then `{passed:true}` appends no
   tokens, leaves the ledger at the pre-A6 pass's `["post-wave","test"]`, and makes the six-token
   literal a red test against a correct implementation (TSPEC §5.2).
2. *Do not use `test.skip` for the upstream-pending case.* `orchestrate-dev.js`'s skip guard matches
   `/\b(describe|test|it)\.skip\s*\(/`; PROP-REST-03's pending case uses `test.todo` (PLAN A6-09).


## Coverage Matrix

### C-1. REQ acceptance criteria → properties

Every criterion has at least one property; every property traces at least one criterion.

| Criterion | Properties |
|---|---|
| AC-1.1 | PROP-SEAM-01, PROP-SEAM-06 |
| AC-1.2 | PROP-SEAM-03 |
| AC-1.3 | PROP-SEAM-04 |
| AC-1.4 | PROP-SEAM-05, PROP-SEAM-09 |
| AC-1.5 | PROP-SEAM-07, PROP-SEAM-08, PROP-SEAM-10 |
| AC-2.1 | PROP-CTR-04, PROP-CTR-06 |
| AC-2.2 | PROP-CTR-01, PROP-CTR-02, PROP-CTR-03, PROP-GATE-11 |
| AC-2.3 | PROP-CTR-05, PROP-CTR-06, PROP-CTR-07 |
| AC-2.4 | PROP-CTR-09, PROP-CTR-10, PROP-CTR-11, PROP-CTR-12, PROP-CTR-13 |
| AC-3.1 | PROP-ENV-01, PROP-ENV-02, PROP-ENV-08, PROP-ENV-11, PROP-ENV-12 |
| AC-3.2 | PROP-ENV-04, PROP-ENV-05, PROP-ENV-06 |
| AC-3.3 | PROP-ENV-10 |
| AC-3.4 | PROP-ENV-07, PROP-CTR-08, PROP-REST-08 |
| AC-3.5 | PROP-ENV-09, PROP-ENV-10 |
| AC-4.1 | PROP-GATE-02, PROP-GATE-03, PROP-GATE-04, PROP-GATE-05 |
| AC-4.2 | PROP-GATE-07 |
| AC-4.3 | PROP-ENV-10 |
| AC-4.4 | PROP-GATE-01, PROP-GATE-06, PROP-REST-01, PROP-REST-02 |
| AC-4.5 | PROP-ENV-10, PROP-GATE-05, PROP-REST-04 (every prohibition property carries its paired positive) |
| AC-4.6 | PROP-GATE-08, PROP-GATE-09 |
| AC-5.1 | PROP-REST-01, PROP-REST-03, PROP-REST-05, PROP-REST-06 |
| AC-5.2 | PROP-REST-09, PROP-SEAM-03, PROP-SEAM-04 |
| AC-5.3 | PROP-REST-04, PROP-GATE-03 |
| AC-6.1 | PROP-REC-01, PROP-REC-02, PROP-REST-08 |
| AC-6.2 | PROP-REC-03, PROP-REC-04, PROP-REC-07 |
| AC-6.3 | PROP-REC-05, PROP-REST-08 |
| AC-6.4 | PROP-REC-06 |
| NFR-1 | PROP-NFR-03, PROP-NFR-04 |
| NFR-2 | PROP-SEAM-05, PROP-SEAM-06, PROP-SEAM-09 |
| NFR-3 | PROP-NFR-02 |
| NFR-4 | PROP-CTR-10 |
| NFR-5 | PROP-GATE-10 |
| NFR-6 | PROP-NFR-01 |

### C-2. FSPEC acceptance tests → properties

Set-equality over AT ids: all forty-seven ATs in FSPEC §6 appear below, and no id appears that FSPEC
§6 does not carry.

| AT | Property | AT | Property |
|---|---|---|---|
| AT-01-1 | PROP-SEAM-01 | AT-04-1 | PROP-GATE-05 |
| AT-01-2 | PROP-SEAM-03 | AT-04-1a | PROP-GATE-03 |
| AT-01-3 | PROP-SEAM-04 | AT-04-1b | PROP-GATE-04 |
| AT-01-4 | PROP-SEAM-05 | AT-04-2 | PROP-GATE-01 |
| AT-01-5 | PROP-SEAM-07 | AT-04-3 | PROP-GATE-07 |
| AT-01-6 | PROP-SEAM-06 | AT-04-4 | PROP-GATE-05 |
| AT-02-1 | PROP-CTR-01 | AT-04-5 | PROP-GATE-08 |
| AT-02-2 | PROP-CTR-02, PROP-CTR-03 | AT-05-1 | PROP-REST-01 |
| AT-02-3 | PROP-CTR-04 | AT-05-2 | PROP-REST-02 |
| AT-02-4 | PROP-CTR-06 | AT-05-3 | PROP-REST-09 |
| AT-02-5 | PROP-CTR-07 | AT-05-4 | PROP-REST-04 |
| AT-02-6 | PROP-CTR-11 | AT-05-5 | PROP-REST-05 |
| AT-02-7 | PROP-CTR-10 | AT-06-1 | PROP-REC-01 |
| AT-02-8 | PROP-CTR-08 | AT-06-2 | PROP-REC-02 |
| AT-02-9 | PROP-CTR-09 | AT-06-3 | PROP-REC-03 |
| AT-03-1 | PROP-ENV-01 | AT-06-4 | PROP-REC-05 |
| AT-03-2 | PROP-ENV-04 | AT-06-5 | PROP-REC-06 |
| AT-03-3 | PROP-ENV-05 | AT-06-6 | PROP-REC-04 |
| AT-03-4 | PROP-ENV-08 | AT-07-1 | PROP-NFR-03 |
| AT-03-5 | PROP-ENV-10 | AT-07-2 | PROP-SEAM-02 |
| AT-03-6 | PROP-ENV-09 | AT-07-2b | PROP-CFG-01, PROP-CFG-02 |
| AT-03-7 | PROP-ENV-07 | AT-07-3 | PROP-GATE-10 |
| AT-03-8 | PROP-ENV-06 | AT-07-4 | PROP-NFR-01 |
| | | AT-07-5 | PROP-NFR-02 |

### C-3. PLAN tasks → properties

Every RED task in PLAN v1.2 carries at least one property, and every property names a PLAN-owned test
file. The seven GREEN tasks (A6-05, A6-06, A6-08, A6-10, A6-12, A6-14, A6-18, A6-21) carry no
properties of their own by construction: each turns the preceding RED batch's properties green.

| Task | Test file | Properties |
|---|---|---|
| A6-00 | `advisoryWaveGate.test.js` (new) | Pre-flight importability gate — no behavioural property; it exists so batch 1 opens on a legible red |
| A6-01 | `helpers/advisoryDoubles.js` | Fixture rows above; `SEAMS` literal half of PROP-SEAM-02 |
| A6-02 | `advisoryEnvelope.test.js`, `advisoryConfig.test.js` | PROP-SEAM-01, PROP-CTR-01, PROP-ENV-01, PROP-ENV-06, PROP-ENV-07, PROP-ENV-10 (id set), PROP-CFG-01, PROP-CFG-02 |
| A6-03 | six collateral suites | PROP-SEAM-02 |
| A6-04 | `pdlc/engine/__tests__/advisory-config-example.test.js` (new) | PROP-CFG-03 |
| A6-07 | `advisoryWaveGate.test.js` | PROP-CTR-02, PROP-CTR-05 (unit half), PROP-ENV-02, PROP-ENV-03 (unit half), PROP-NFR-04 |
| A6-09 | `advisoryWaveGate.test.js` | PROP-REST-01, PROP-REST-02, PROP-REST-03, PROP-REST-05, PROP-REST-06 |
| A6-11 | `advisoryDriver.test.js` | PROP-CTR-10, PROP-GATE-11, PROP-NFR-01, PROP-NFR-02 |
| A6-13 | `advisoryWaveGate.test.js` | PROP-CTR-04 (seam-op half), PROP-CTR-07, PROP-ENV-08 (seam-op half), PROP-ENV-11, PROP-GATE-02 (seam-op half) |
| A6-15 | `advisoryWaveGate.test.js` | PROP-SEAM-07, PROP-SEAM-08, PROP-CTR-03, PROP-CTR-04, PROP-CTR-05, PROP-CTR-06, PROP-CTR-08, PROP-CTR-09, PROP-CTR-11, PROP-CTR-12, PROP-CTR-13, PROP-ENV-03, PROP-ENV-04, PROP-ENV-05, PROP-ENV-08, PROP-ENV-09, PROP-ENV-10, PROP-ENV-12, PROP-GATE-01…-06, PROP-REST-07, PROP-REST-08, PROP-REST-09, PROP-REC-05, PROP-NFR-03 |
| A6-16 | `advisoryRecord.test.js` | PROP-REC-01, PROP-REC-02 |
| A6-17 | `advisoryEscalationLog.test.js` | PROP-REC-03, PROP-REC-04, PROP-REC-06, PROP-REC-07 |
| A6-19 | `waveExecution.test.js` | PROP-SEAM-03, PROP-SEAM-04, PROP-SEAM-10, PROP-GATE-07, PROP-GATE-08, PROP-GATE-09, PROP-GATE-10, PROP-REST-04, PROP-REST-09 |
| A6-20 | `advisoryDisabled.test.js` | PROP-SEAM-05, PROP-SEAM-06, PROP-SEAM-09 |

**File existence, verified at HEAD.** The ten edited suites all exist
(`advisoryEnvelope`, `advisoryConfig`, `advisoryDriver`, `advisoryRecord`, `advisoryHarvest`,
`consolidationProperties`, `advisoryDisabled`, `advisoryQueueSeams`, `advisoryEscalationLog`,
`waveExecution`), as does `helpers/advisoryDoubles.js`. The two new files —
`pdlc/workflows/__tests__/advisoryWaveGate.test.js` and
`pdlc/engine/__tests__/advisory-config-example.test.js` — are both absent at HEAD and both are
explicitly planned as new by A6-00 and A6-04. No property names a file that neither exists nor is
planned.


## Gaps, Non-Properties and Routed Findings

### G-1. Deliberate non-properties

These are stated so that a later reader can tell a decision from an omission.

| # | Not a property | Why |
|---|---|---|
| 1 | AC-2.2's **first-match precedence** between root-cause classes | Script-unenforceable without re-doing the diagnosis the seam was dispatched to perform; prompt-only per TSPEC §3.3. Its cost — AC-6.4's recurrence count is a function of agent judgement to that extent — is recorded in Oracle H rather than papered over |
| 2 | Wall-clock **timing** of A6 relative to a green wave | NFR-5's claim is structural (A6 is reachable only from a red gate), so PROP-GATE-10 asserts dispatch counts on one run, never elapsed time |
| 3 | **Coverage percentage** as an A6 oracle | Both `npm run test:coverage` floors — the aggregate `c8` block and the per-file branch ≥85 — are dominated by `orchestrate-dev.js`'s ~15k lines, so neither can fail on A6's branches specifically (TSPEC §5.4). The branch inventory is covered by enumeration in §§B–H above, not by the floor |
| 4 | Per-seam **resolution counts** surviving the run | The advisory record is distilled into LEARNINGS and deleted after Phase PUB, so only escalations are durably countable. PROP-REC-06 asserts the positive half and the negative half explicitly; making resolutions durable is REQ O-2's, owned by `pdlc-engineering-loop` |
| 5 | A6 firing on a **post-wave command failure** | Decided out (REQ Q-2, O-7, D-AWG-04). PROP-SEAM-03 asserts the dispatch count is `0` there, which is the property the decision implies |
| 6 | A6 over the **V-wave** | No ownership-manifest row, so E-5/E-6 have no owned-path set to range over (AC-1.3, D-AWG-02). PROP-SEAM-04 is the observable |
| 7 | FSPEC **E-13** (gate output distinguishing an import/collection error from a failing assertion) | FSPEC:270 declares it evidence *inside* the existing root-cause classes, never a fifth class, and best-effort because `testCommand` is arbitrary operator text. There is no stable output shape to assert against, so the diagnosis quality it feeds is Oracle H's prompt-only territory. Named here so a later set-equality sweep over FSPEC's E table reads E-13 as decided, not missed |

### G-2. Known-soft properties

- **PROP-CFG-03 is invisible to the wave gate that runs this feature.** Its home is the engine-channel file `pdlc/engine/__tests__/advisory-config-example.test.js` (A6-04), while this repo's `.claude/pdlc.config.json` sets `implementation.testCommand` to a `cd pdlc/workflows && npm test …` command only. So neither A6-04's RED nor its GREEN is observable in a Phase I wave gate or in the V-wave: both are asserted by CI's `Engine tests (ubuntu-latest)` job, which runs `npm ci && npm test` in `pdlc/engine` (PLAN §"Engine channel" row). A batch reported green by the wave gate therefore carries no evidence about PROP-CFG-03 either way; read the CI job, not the wave. The same holds for A6-06's edit to the example config.
- **PROP-REST-03** is upstream-pending on OQ-7 and ships as `test.todo` until the erratum on FSPEC
  BR-9 / AT-05-1 and REQ AC-5.1 returns a boundary. This is TSPEC §6 OQ-9's decision, not a gap this
  document introduces.
- **PROP-REC-06**'s negative half ("resolution counts are not derivable") is an absence assertion by
  construction. It is paired with the positive half on the same log fixture, which is the strongest
  available shape.
- **PROP-NFR-03**'s partition is only as good as its transcribed literal. The set-equality is what
  makes a rule silently becoming proposable a red test; a per-rule containment check would not.

### G-3. Findings routed upstream (errata)

Two defects in upstream documents are named here rather than absorbed into this document's
properties. In both cases this document follows the TSPEC/PLAN reading, which is also what the
shipped code does, and the FSPEC text is the one that needs the versioned edit.

1. **FSPEC AT-01-4 forbids the oracle every other document requires.** It reads "The test asserts the
   key is **absent**, not undefined." REQ NFR-2 requires the opposite reading — "the key is
   undefined, not a six-row all-zero summary" — and TSPEC §5.2 ("the report's `advisory` key is
   **absent** (`undefined`, not `null`)") and PLAN A6-20 ("carries no `advisory` key (`undefined`,
   not `null`)") both pin the `undefined` form, which is also the shipped tier's own oracle
   (`advisoryDisabled.test.js`, `expect(result.advisory).toBeUndefined()` at four sites). As written,
   AT-01-4 rules out the assertion the rest of the chain mandates. PROP-SEAM-05 follows REQ/TSPEC.
2. **FSPEC AT-06-1 mandates containment where TSPEC mandates set-equality.** AT-06-1 says
   "Containment is deliberate: the entry keeps the tier's record shape …"; TSPEC §5.6's AT-06-1 row
   says the entry's "field set asserted by set-equality against a transcribed literal, **not**
   containment (TE F-15: a dropped field passes a containment check)", and PLAN A6-16 transcribes
   the set-equality form. A containment oracle cannot fail on a dropped field, which is the defect
   TSPEC's correction exists to catch. PROP-REC-01 follows TSPEC/PLAN.

### G-4. Requirements-side gaps found while deriving

None. Every REQ acceptance criterion and NFR yielded at least one falsifiable property (matrix C-1),
and every FSPEC acceptance test has a home (matrix C-2). The two conflicts above are wording defects
in an already-decided area, not missing requirements.

