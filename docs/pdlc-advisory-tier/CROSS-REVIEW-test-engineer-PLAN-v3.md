# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md` (v1.3)
**Date:** 2026-08-03
**Iteration:** 3
**Scope:** delta re-review — my v2 findings, plus new issues in the changed sections only. Testing lens: testability, TDD ordering, batch-DAG mechanics, oracle falsifiability, coverage measurability.

## Disposition of my v2 findings

Diffed `8a0c56c..HEAD` (12 revision commits) over the PLAN. Every v2 finding and both open
questions are resolved.

| v2 | Verdict | Evidence |
|---|---|---|
| F-01 (H) un-skip owner underdetermined | **Resolved, and resolved by rule rather than by patch.** §3 preamble step 2 now states the rule once — *a `describe.skip` block's un-skipper is the task that lands the **last** symbol the block's cases exercise* — and applies it everywhere. (a) `advisoryDriver.test.js` carries four blocks with four owners (A-22 lifecycle, A-23 A3/A4 gates, A-24 A5 gate, A-31 A1/A2 gates); §3's A-07 row, §4's manifest, §4.1's ownership table, §8.1's T-03 row, §8.2's registry and §9.2 all agree. (b) T-02-4/T-02-5 moved to `advisoryDriver.test.js` — confirmed correct against FSPEC:287-288, which defines both over the driver's attempt loop ("exactly `attemptBudget` attempts"; "in-flight attempt preempted… attempt count 1"), not over `parseAdvisoryVerdict`. A-31 rather than A-30 owning the A1/A2 block is right: A1 declares no gate, A2's `verifyGate` is the last symbol. |
| F-02 (H) A-01's config pin red in CI | **Resolved with a positive on both branches**, which is stronger than the guard I asked for. Present ⇒ transcribed-literal set comparison; absent ⇒ `parseImplementationConfig(null)` ⇒ `{ config: IMPLEMENTATION_DEFAULTS, sectionMalformed: false, invalidKeys: [] }` with `testCommand === null`. Both citations re-read at HEAD and exact: `IMPLEMENTATION_DEFAULTS` with `testCommand: null` at `orchestrate-dev.js:160-164`, `if (text == null) return degraded(false);` at `:188`, where `degraded` (`:182-186`) returns exactly that triple. Neither branch is a skip. §9.1's checkbox is correctly narrowed to the disk half. |
| F-03 (M) P-4 not well-typed | **Resolved.** P-4 is restated over `classifyEnvelope(candidate, ctx)` ⇒ `{ inside, reason, matched }` with three conjuncts — determinism/purity, closure over `ADVISORY_REFUSAL_REASONS ∪ {null}`, and `inside === (reason === null)` — and deliberately makes no claim about `matched`. All three are falsifiable against a wrong implementation. One citation slip remains; see F-03 below. |
| F-04 (L) queue-side denominator prose | **Resolved.** §6.4 now says `hasResidualSeamToken` and `honourA1Verdict` "**and nothing else**", explains *why* the two pre-existing functions cannot be partially counted (the reducer matches whole `fnMap` names), and names the behavioural evidence that replaces the percentage (T-04-1/2/3/3b + the A2 citation-drift obligation, A-12 🔴 / A-29 🟢). The 24-name argument list is unchanged and still totals 24 (22 dev + 2 queue) — I recounted it. |
| F-05 (L) `documentOracles` noise in the coverage run | **Resolved.** `'documentOracles'` is added to the first command's ignore list, and a paragraph states why exclusion does not weaken the measurement (that suite exercises none of the 24 functions) and that §9.1's first checkbox still runs the full suite including the oracles. |
| F-06 (L) P-9's unspecified empty input | **Resolved the way I'd have chosen.** P-9 is scoped to non-empty multisets, the ordering is transcribed from TSPEC §7.2 A3-7 (`TSPEC:856` — re-read, exact), the empty case is carried as §10.1 open item 6 with the reason ("pinning a value would make the test assert the implementer's pick"), and it is raised as an erratum rather than silently decided. A-10's §3 row carries the same scoping. |
| Q-01 (what reads the per-file gate) | **Answered — and the answer is the one new defect.** §5.2 names a `--json` command. The command runs; the fields it reads do not exist. See F-01. |
| Q-02 (where the zero-skips check lives) | **Answered, and correctly split into two.** (a) a shipped source-text case in `advisoryDisabled.test.js` matching `.skip` *and* `x`-prefixed forms rather than the literal `describe.skip`; (b) the wave agent's direct observation. (a) is the durable regression, (b) catches an alias (a) cannot name. The stated reason for needing both is right. |
| Q-03 (set-equality across split files) | **Answered.** T-03-6 stays in one file; only the *block* is split. The `ADVISORY_SEAMS` set-equality driver stays in A-22's block as a single case over an in-file registry `{A1…A5} → owning task`, and the five per-seam cases are **generated from that registry** — so a deleted case means a deleted registry row, and set-equality fails. That is completeness by set-equality, not containment, and it works at batch 9 before any per-seam block is un-skipped. |

## Verification performed

Everything below was executed or grepped against the working tree at HEAD, not read off the document.

| Check | Result |
|---|---|
| §5.2's `--json` evidence command, as written | **Executed on jest 29.7.0** (`npx jest --version`; `package.json` pins `"jest": "^29.7.0"`). The command runs and writes the file, but `testResults[]` entries carry `{assertionResults, endTime, message, name, startTime, status, summary}` — **no `testFilePath`, no `numPassingTests`, no `numFailingTests`, no `numPendingTests`**. Verified twice, on a passing suite (`scanLines`) and on the repo's skip-carrying suite (`guardMatrix`, 75 passed / 70 pending): `'numPendingTests' in r` ⇒ `false`, `'testFilePath' in r` ⇒ `false`. Those counters exist only at the **top level** of the JSON (`j.numPendingTests` ⇒ 70), which is exactly the aggregate §5.2 says it cannot use. See F-01. |
| The fields that *do* answer the gate's question | Same two runs: `testResults[].name` is the absolute file path, and `assertionResults[].status` partitions per-file into `{passed, failed, pending, todo}` (`guardMatrix` ⇒ `{"passed":75,"pending":70}`). A three-line reducer over those two fields produces exactly the per-file triple §5.2 wants. |
| PLAN self-parse after the v1.3 manifest widening | **Executed** against `orchestrate-dev.js` at HEAD: `parsePlanTasks` ⇒ **36 tasks**, `parsePlanOwnership` ⇒ **36 rows**, `validatePlanContract` ⇒ `{"ok":true}`, `computeTopologicalBatches` ⇒ **20 batches**, no cycle. §9.1's claim is exact. |
| `computeWaves` ⇒ 20 waves identical to §5.2 (§4.1's new claim) | **Executed and confirmed member-for-member.** `1:A-01 \| 2:A-02 \| 3:A-03,A-04,A-05,A-06,A-07 \| 4:A-08…A-12 \| 5:A-13,A-14,A-15 \| 6:A-16,A-17,A-28 \| 7:A-18 \| 8:A-19 \| 9:A-20 \| 10:A-21 \| 11:A-22 \| 12:A-23,A-29 \| 13:A-24,A-30 \| 14:A-25,A-31 \| 15:A-26 \| 16:A-27 \| 17:A-32 \| 18:A-33 \| 19:A-34,A-35 \| 20:A-36`. Byte-identical to `computeTopologicalBatches`' output, i.e. `pathsCollide` split nothing — which is the mechanical proof §4.1 claims that no two writers of one test file share a wave. The three added `advisoryDriver.test.js` rows (A-23, A-24, A-31) land in waves 12, 13, 14 respectively, each paired only with a queue-side or dev-side task holding disjoint paths. |
| Batch-column re-derivation after the three new `A-07` dependency edges | **Re-derived all 36 rows** from the `dependencies` column: every `planBatch` equals `max(dep batch) + 1`, ids unique, every dependency resolves. **No desync.** A-23 (deps A-07, A-10, A-22) ⇒ 10 ✓; A-24 (A-07, A-11, A-23) ⇒ 11 ✓; A-31 (A-07, A-12, A-30) ⇒ 12 ✓. |
| §3/§4's runner citations | All exact at HEAD. `` `You own EXACTLY these files: …` `` at `orchestrate-dev.js:5850` (the PLAN says `:5849` — off by one, not worth a finding); `` `Do NOT run git add or git commit …` `` at **`:5851`** exactly as cited; the per-task `commitPaths` loop under `// Only now — verified — does anything get committed (M-6).` at `:8142-8160` (cited `:8143-8159`). |
| §4's overlap-is-legal claim | Confirmed at the source. `validatePlanContract` (`:2344`) computes only the two-way task↔row bijection and returns; the doc comment above it states in terms that "File OVERLAP between rows is NOT a problem… waves are what separate the writers, and rejecting overlap here would reject correct PLANs" (`:2334-2336`). `pathsCollide` at `:2377`. Both citations correct. |
| §4's `PLAN_FILES_HEADER_CELLS` note | `orchestrate-dev.js:2188-2195` — an exact-cell `Set` containing `files created or appended`. Cited correctly. (It also accepts `files`, `owned files`, … so "re-wording it would make the manifest unparseable" is conservative rather than strictly true; keeping the literal is still the right advice.) |
| F-02's degradation branch | `parseImplementationConfig` at `:181`; `degraded` closure at `:182-186` returns `{ config: IMPLEMENTATION_DEFAULTS, sectionMalformed, invalidKeys: [] }`; `if (text == null) return degraded(false);` at `:188`; `IMPLEMENTATION_DEFAULTS.testCommand === null` at `:161`. A-01's absent-file branch asserts a real, currently-true contract. |
| T-02-4 / T-02-5 against FSPEC | `FSPEC:287-288` re-read: T-02-4 "exactly `attemptBudget` attempts made and the seam escalates"; T-02-5 "the in-flight attempt is preempted… no further attempt is started, and the attempt count is 1". Both are driver-loop behaviours. The move to `advisoryDriver.test.js` is correct, and §8.1's "advisoryVerdict carries no FSPEC case" follows. |
| P-4 against `classifyEnvelope`'s declared contract | `TSPEC:514` declares `@returns {{ inside: boolean, reason: string\|null, matched: string[] }}`; `:515` gives `reason ∈ {"prohibited-action","revert-on-test-touch","out-of-envelope"} \| null`. §5.1's six-check ladder maps checks 3–6 onto `out-of-envelope`, so the closure and coherence conjuncts are sound derivations. But TSPEC states neither of them in those lines. See F-03. |
| P-9's transcribed ordering | `TSPEC:856` A3-7: "`governingClass(classes)` is pure and ordered: `real-defect` > `mis-scoped-criterion` > `deferral-candidate`." Transcribed verbatim into P-9. The empty input is still unspecified there — correctly carried as open item 6 rather than pinned. |
| §6.4's 24 names | Recounted in the document: 22 dev-side + `hasResidualSeamToken` + `honourA1Verdict` = **24**, matching the argument list passed to the reducer and the "all 24 names resolve" instruction. The F-04 edit did not change the count. |
| §8.1's arithmetic | T-01 7 + T-02 6 + T-03 10 + T-04 10 + T-05 6 + T-06 6 + T-07 12 + T-08 11 + T-09 8 + T-10 5 = **81** ✓. Files: 11 FSPEC-carrying + 3 PLAN-obligation-only = **14**, and §4's manifest names exactly those 14 test files ✓. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
