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

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
