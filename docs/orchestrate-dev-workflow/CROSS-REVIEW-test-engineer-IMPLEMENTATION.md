---
Status: Draft
Author: te-review
Version: 1.0
Feature: orchestrate-dev-workflow
---

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → PLAN → PROPERTIES → **IMPLEMENTATION** |
| Downstream | — |
| Scope | Final codebase review: test suite completeness against PROPERTIES, test correctness, structural quality, 147-test run |

# Cross-Review: test-engineer — IMPLEMENTATION

**Reviewer:** test-engineer
**Document reviewed:** `pdlc/workflows/__tests__/` (all test files), `pdlc/workflows/orchestrate-dev.js`, `pdlc/skills/*/SKILL.md`
**Date:** 2026-06-01
**Iteration:** 1

---

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | `PROP-IMPL-08` (merge-conflict integration test) has no test. The `mergeWorktree()` function in `orchestrate-dev.js` is an empty stub (`void task; void featureName; void agentFn`). `pdlc/workflows/__tests__/fixtures/` is empty — `tmpGitFixture.js` was never written. No test in `implPhase.test.js` exercises the four-step merge-abort path (git diff conflicting files, git merge --abort, halt with conflict error message, no further worktree merges attempted). The merge-conflict error path defined in PROP-IMPL-08 is completely untested and the implementation is a no-op. | PROP-IMPL-08, TSPEC-IMPL-05, PLAN TASK-P3-05 |
| F-02 | High | Local | `hookCompatibility.test.js` does not exist. PROP-COMPAT-04 and PROP-COMPAT-05 are not tested by any file in the suite. These integration tests are supposed to invoke `check-scope-field.sh` and `guard-harvest-before-delete.sh` directly in a fixture directory and assert non-zero exit codes. The 147-test count matches tests that exist; these two properties are absent from the suite entirely. | PROP-COMPAT-04, PROP-COMPAT-05, Section 13 Test File Index |
| F-03 | High | Local | `PROP-LOOP-10` (script-local variables; no agent-result object passed to `log()`) has no test. The property requires verifying that no `log()` call receives an agent result object. Neither a static analysis nor a behavioral test for this property appears in `reviewLoop.test.js`. The PROPERTIES Test File Index lists `reviewLoop.test.js` as covering PROP-LOOP-01 through PROP-LOOP-16; PROP-LOOP-10 is missing from the file. | PROP-LOOP-10, TSPEC-LOOP-04, TSPEC-NFR-03, REQ-NFR-02 |
| F-04 | Medium | Local | `PROP-IMPL-01` is tested by a simulation that manually constructs the expected log messages rather than by call-order instrumentation of the live pipeline. PROPERTIES specifies "wraps `log` and `agent` in recording proxies and asserts that the first `agent()` call for a batch occurs after the `log()` call for that batch's plan, verified by inspecting the call sequence recorded by the proxy." The test in `implPhase.test.js` (lines 237–265) instead calls `computeTopologicalBatches` and manually builds `mockLogs[]`, then asserts on the manually-built array. It does not run the pipeline, does not inject recording proxies, and does not verify the sequencing constraint between `log()` and `agent()` calls. | PROP-IMPL-01, TSPEC-IMPL-03, AT-IMPL-01 |
| F-05 | Medium | Local | `PROP-HARVEST-01` is specified at Integration test level and requires call-order verification that the harvest agent receives a prompt ordering operations 1–6 correctly. The test in `harvestPhase.test.js` (lines 115–129) is a static analysis test that reads the script source and asserts substring presence (`harvestPrompt`, `CROSS-REVIEW`, `POSTMORTEM`, etc.). This satisfies the prompt-content check but does not verify that the pipeline's call to `agentFn("harvest-learnings", ...)` actually passes the correctly structured prompt when triggered from the live `main()` function. | PROP-HARVEST-01, TSPEC-HARVEST-02, AT-HARVEST-01 |
| F-06 | Medium | Local | `PROP-OBS-01` test in `pipelineWiring.test.js` (lines 211–237) asserts that the ten phase labels appear in the `phaseCalls` list, but does not verify that each `phase()` call precedes the corresponding dispatcher invocation (creator or `reviewLoop`). PROPERTIES specifies verification "by call-order inspection" using the same proxy as PROP-PIPELINE-03. The current test only checks label presence, not ordering relative to agent dispatches. | PROP-OBS-01, REQ-OBS-01 |
| F-07 | Low | Local | PROP-LOOP-13 resume semantics test does not use `runtimeCacheMock`. PROPERTIES (Section 2.1) specifies that resume-semantics tests simulate per-agent-call caching via `runtimeCacheMock` to verify that already-completed agents are not re-invoked on resume. The test instead passes `iteration: 3` directly to `reviewLoop` as a shortcut. This tests the log-message path but does not verify that completed iteration-1 and iteration-2 agent calls are not re-dispatched. The `runtimeCacheMock` helper planned in PLAN TASK-P2-06 was never created. | PROP-LOOP-13, TSPEC-LOOP-05, TSPEC-LOOP-06, AT-RESUME-01 |
| F-08 | Low | Local | Worker skill unmodified check (PROP-COMPAT-07/08) verifies file existence and non-emptiness but does not compare file contents against a baseline hash. PROPERTIES note 5 (Section 14, point 5) specifies "tests compare the file hash against the baseline SHA recorded in the test fixture setup." The current test in `skillFiles.test.js` only calls `readFileSync` and checks `content.length > 0`. A modification to a worker SKILL.md would not be detected. | PROP-COMPAT-07, PROP-COMPAT-08, Section 14 note 5 |
| F-09 | Low | Process | The `fixtures/` directory exists but is empty. PLAN TASK-P3-05 specified `tmpGitFixture.js` should be created there for the PROP-IMPL-08 integration test. Its absence, combined with the empty `mergeWorktree()` stub, suggests the integration-test harness for merge-back was deferred without being documented as a known gap. Future test authors will not know the fixture was planned. | PROP-IMPL-08, PLAN TASK-P3-05 |

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | Was `mergeWorktree()` left as a stub intentionally (deferred) or does the Claude Code worktree runtime handle merge-back transparently for `isolation: "worktree"` agent calls, making an explicit script-level implementation unnecessary? If the runtime handles it, PROP-IMPL-08 and PROP-IMPL-09 may need to be re-scoped as "verified by runtime" rather than unit/integration tested in the script. |
| Q-02 | `hookCompatibility.test.js` is listed in the PROPERTIES Test File Index (Section 13) but does not exist. Was this file intentionally deferred, or was it missed during implementation? |
| Q-03 | For PROP-LOOP-10, would a static analysis test (enumerate all `log(` call sites in the script source, assert none passes a variable matching `result1`, `result2`, or similar) be acceptable, or is a behavioral test required? |

---

## Positive Observations

- All 147 tests pass cleanly with no flaky failures across 10 test suites. The test run is stable.
- The dependency-injection architecture (`_agent`, `_parallel`, `_guardAgent`, `_phase`, `_pipeline`) is well-designed and makes every behavioral path unit-testable without a live runtime. Every non-integration property can be exercised without Claude Code present.
- `createGuardAgentDouble` is correctly implemented at the canonical path `helpers/guardAgentDouble.js` and is imported by every test file that exercises a guard-agent code path. PROP-COMPAT-06 is fully satisfied.
- `parseVerdict` is comprehensively tested: all 12 PROP-PARSE-01 through PROP-PARSE-12 properties have dedicated test cases covering the happy path, wrong casing, invalid JSON, intervening text, truncated output, reverse-scan, null/undefined/empty, extra/missing keys, negative values, and case-sensitive prefix check.
- `parseDecisionsWarranted` is fully covered: all 7 PROP-PARSE-13 through PROP-PARSE-19 properties are exercised including case-insensitive value variants and the reverse-scan.
- `computeTopologicalBatches` has strong coverage: linear chain, diamond DAG, cycle detection (PROP-IMPL-06), batch label inconsistency warning (PROP-IMPL-03), sub-batch cap of 5 (PROP-IMPL-12), document order preservation (PROP-IMPL-09), and 10-task fan-out (PROP-IMPL-07).
- `reviewLoop` parallel dispatch (PROP-LOOP-09) is correctly tested via `mockParallel` recording the array length, confirming both reviewers are dispatched concurrently per iteration.
- The `orchestrate-dev` SKILL.md rewrite (PROP-SKILL-05 through PROP-SKILL-08) is fully tested in `orchestrateDevSkill.test.js` with precise regex checks for all seven required sections and both script-path references. The under-100-lines check and absence of runbook prose are both verified.
- PROP-COMPAT-10 (ESM only, no `require()`) and PROP-ENTRY-06 (no `fs.existsSync`) are efficiently verified by a combined source-read test.
- The `PHASE_H_ENABLED` constant, skip-path log messages, guard-sentinel string, and path-extraction fallback are all covered by source-read tests in `harvestPhase.test.js` (PROP-HARVEST-03, PROP-HARVEST-05, PROP-HARVEST-02, PROP-HARVEST-04).

---

## Recommendation

**Needs revision**

Three High findings block approval:

**F-01** — `PROP-IMPL-08` is unimplemented at both test and implementation levels. `mergeWorktree()` is an empty stub; `tmpGitFixture.js` does not exist. Either implement the merge-conflict path with its integration test (PLAN TASK-P3-05), or explicitly re-scope PROP-IMPL-08 as "verified by runtime" with a documented rationale and remove it from the test file index. The current state — a no-op implementation and no test — is not acceptable.

**F-02** — `hookCompatibility.test.js` must be created covering PROP-COMPAT-04 and PROP-COMPAT-05, or these properties must be removed from the PROPERTIES document with a documented rationale. Two properties in the Test File Index have no corresponding file.

**F-03** — `PROP-LOOP-10` must have a test. A static analysis test (enumerate `log(` call sites in the script source and assert no call passes a reviewer result variable) is sufficient and avoids needing a full behavioral harness. This property is the only observable test of REQ-NFR-02 (context isolation).

The two Medium findings (F-04, F-05) should also be addressed: PROP-IMPL-01 needs real call-order proxy instrumentation rather than a simulation, and PROP-HARVEST-01 needs at least one behavioral test that runs the harvest phase and captures the agent prompt argument. F-06 (PROP-OBS-01 ordering) is recommended but can be deferred if the team accepts label-presence as sufficient for OBS-01 given OBS-02 is fully covered.
