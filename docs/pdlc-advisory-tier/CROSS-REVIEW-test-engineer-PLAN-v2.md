# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md` (v1.2)
**Date:** 2026-08-03
**Iteration:** 2
**Scope:** delta re-review — my v1 findings, plus new issues in the changed sections only. Testing lens: testability, TDD ordering, batch-DAG mechanics, oracle falsifiability, coverage measurability.

## Disposition of my v1 findings

Diffed `e7ffd1d..HEAD` (11 revision commits) over the PLAN. Every v1 finding is resolved.

| v1 | Verdict | Evidence |
|---|---|---|
| F-01 (H) RED-terminal waves unsatisfiable | **Resolved** | §3 preamble + §5.2 replace RED-terminal waves with the skip discipline: 🔴 rows author cases inside `describe.skip` blocks named for their green owner; every gate is full-suite-green. **Executed**: a probe file containing only a `describe.skip` block whose body imports a nonexistent export ran green — `Test Suites: 1 skipped, 0 of 1 total; Tests: 1 skipped, 1 total`, exit 0. The mechanism is also precedented in-repo: `__tests__/helpers/skipSink.js:17-21` explicitly excludes direct `describe.skip` / `it.skip` from the sink comparator, naming `guardMatrix.test.js`'s 70 `it.skip.each` rows as the sanctioned case, so this discipline cannot trip the run-scoped skip gate. |
| F-02 (H) A-00 cannot repair its own run's gate | **Resolved** | A-00 deleted (task count 37 → 36); §2.4 carries the repair as an operator pre-flight step with the correct mechanism citation (`orchestrate-dev.js:8040-8042` parse, `:8094` loop, `:8113-8118` halt — all re-read and correct at HEAD). §4.1, §5.1, §7 I-23, §10.1 item 5 all restated consistently. |
| F-03 (H) T-02-1/2/3 double-assigned | **Resolved** | §3 A-05 now reads "T-02-4, T-02-5 **only**"; A-07 carries T-02-1/2/3; §8.1 line 665 agrees. FSPEC:284-286 confirms all three are whole-lifecycle cases. |
| F-04 (M) no property-based tests | **Resolved** | New §6.5 names nine properties (P-1…P-9), each bound to its 🔴 row in §3 as part of the row's obligation, reusing `__tests__/helpers/driftGenerators.js` (`seeded:76`, `resolveSeed:134`, `enumerateLeaves:158`). The "thirteen shipped suites" count is exact — 13 non-helper test files import it. See F-03 below on P-4's statement. |
| F-05 (M) T-08-4b missing from A-13 | **Resolved** | A-13's row now names T-08-4b in bold with the FSPEC:746 rationale. |
| F-06 (M) coverage floor unmeasurable | **Resolved** | §6.4 enumerates 24 function names in-document, excludes the five `(reused)` symbols, and gives a two-command procedure. **Executed both commands** at HEAD: `npm test -- --coverage --coverageReporters=json --collectCoverageFrom='orchestrate-dev.js'` writes `coverage/coverage-final.json` with a populated 334-entry `fnMap` carrying real function names (`parsePlanTasks`, `parseImplementationConfig`, …) despite `package.json`'s `"transform": {}`, and the §6.4 `node -e` one-liner runs to completion and prints the two percentages. The procedure is genuinely mechanical. |
| F-07 (M) grep-only `ciStatus` oracle | **Resolved** | A-11 and §9.3 now require the call-count spy on `checkPrCi` plus byte-equality of `ciStatus` with the spy's last return, with the grep demoted to a secondary. That is a positive assertion on the same path. |
| F-08 (M) A-34 unexecutable | **Resolved** | A-34 gains a binding two-form discharge rule; form (ii) (`RESULT: unverified — no runtime available`) satisfies §9.4 in full, an inferred result is named as a DoD mock-data violation, and A-36's edge is satisfied by either form. §6.3 additionally requires the `RESULT:` line to survive harvest verbatim. |
| F-09 / F-10 / F-11 (L) | **Resolved** | §4.1 "Twelve tasks"; §8.1 "**14 files**" with all 12 named; A-01 gains the transcribed-literal set pin. F-11's resolution introduces a new problem — see F-02 below. |
| Q-01 (pinned tree for A-15) | **Answered** | A-15 now specifies `git worktree add --detach <scratch-dir> 26c3f1c` outside the repo tree, never `git checkout`, with the invocation recorded in the `scenario` header's `command` field. |
| Q-02 (A-07 in the tmpGitFixture row) | **Answered** | §6.2 now reads "**A-10, A-11 only**", with the reason: A-07 drives a fake `SeamOps`, so its revert case asserts the *call*, not the tree. |
| Q-03 (A-01 vs A-28's message edit) | **Answered** | A-01's row now pins guard assertions to the stable substrings A-28 promises not to change. |
| Q-04 (where red evidence lives) | **Answered** | §3 preamble step 3 and §9.2: the 🟢 task's own red→green commit pair; "a green task with a single commit has no red evidence and does not satisfy this row". |

## Verification performed

Everything below was executed or grepped against the working tree at HEAD, not read off the document.

| Check | Result |
|---|---|
| Skip discipline actually works under the gate | **Executed.** A throwaway `__tests__/zzSkipProbe.test.js` containing one `describe.skip` block whose only test imports a nonexistent export: `Test Suites: 1 skipped, 0 of 1 total`, `Tests: 1 skipped, 1 total`, **exit 0**. Jest does not raise "must contain at least one test" for a `describe.skip`-only file. F-01's resolution is mechanically sound. Probe removed. |
| Skip discipline vs the repo's skip gate | `__tests__/helpers/skipSink.js:17-21` states the comparator's domain is `describeOrSkip`/`itOrSkip` only and that direct `describe.skip` "never reach these helpers, so they never reach the sink and are not checked here". No conflict. |
| PLAN self-parse (§9.1's claim) | **Executed.** `parsePlanTasks` ⇒ **36 tasks**, `parsePlanOwnership` ⇒ **36 ownership rows**, `validatePlanContract` ⇒ `{"ok":true}`, `computeTopologicalBatches` ⇒ **20 batches**, no cycle. Exactly as §9.1 claims. |
| Batch-DAG re-derivation after A-00's removal | **Re-derived all 36 rows** from the `dependencies` column: every `planBatch` equals `max(dep batch) + 1`, ids unique (36/36), every dependency resolves, max label batch 18. No desync. |
| §6.4 coverage procedure | **Both commands executed.** `coverage/coverage-final.json` is produced and its `fnMap` carries 334 named entries with real identifiers; the `node -e` reducer parses `fnMap`/`statementMap`/`branchMap`/`s`/`b` without error and prints `statements X branches Y`. Runnable as written. |
| §6.5's generator reuse | `helpers/driftGenerators.js` exports `seeded:76`, `resolveSeed:134`, `enumerateLeaves:158`. Non-helper suites importing it: `approvalHash`, `completeness`, `driftBackups`, `driftBaseline`, `driftFault`, `driftHook`, `driftOrdering`, `driftRepoRoot`, `forcePhases`, `pacingWrapper`, `queueDriftGate`, `roundDerivation`, `scanLines` = **13**. The count is exact. |
| §2.4's untracked-config claim | **Confirmed and consequential.** `git ls-files .claude` ⇒ 0 rows; `.gitignore` ignores only `.claude/settings.local.json`, `.claude/.headroom_wrap_marker.json` and `/.claude/workflows/`. `.claude/pdlc.config.json` exists on disk and holds the defective `--testPathIgnorePatterns=documentOracles` form. See F-02. |
| Green-owner assignment per test file | Read off §3's Test File column: `advisoryDodSeams` ⇒ A-23 (b10) + A-25 (b12); `advisoryPubSeam` ⇒ A-24 (b11) + A-26 (b13); `advisoryHarvest` ⇒ A-28 (b4) + A-27 (b14); **`advisoryDriver` ⇒ A-22 (b9) only**. Multiple green owners per file is the PLAN's own norm — which is why the driver file's single owner is a defect, not a convention. See F-01. |
| `classifyEnvelope`'s contract vs §6.5 P-4 | TSPEC §5.1 (`TSPEC:517`): `classifyEnvelope(candidate, ctx)` ⇒ `{ inside, reason, matched }`. No `ctx` on the return. See F-03. |
| `governingClass` contract | TSPEC `:856` A3-7: `governingClass(classes)` over an array, ordered `real-defect > mis-scoped-criterion > …`. The empty-array case is not specified. See F-06. |
| CI gate composition | `.github/workflows/pr-tests.yml:75` runs bare `npm test` (no ignore-pattern override) on both matrix legs; CLAUDE.md's CI table confirms Phase PUB halts on any failure. Relevant to F-02. |

## Findings

## Questions

## Positive Observations

## Recommendation
