---
Status: Draft
Author: te-review
Version: 2.0
Feature: orchestrate-dev-workflow
---

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → PLAN → PROPERTIES → **IMPLEMENTATION** |
| Downstream | — |
| Scope | Final codebase review Iteration 2: verify resolution of v1 High/Medium findings (F-01 through F-06), re-examine Low findings, identify new issues. 159-test run across 11 suites. |

# Cross-Review: test-engineer — IMPLEMENTATION

**Reviewer:** test-engineer
**Document reviewed:** `pdlc/workflows/__tests__/` (all test files), `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/__tests__/fixtures/tmpGitFixture.js`
**Date:** 2026-06-02
**Iteration:** 2

---

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | `PROP-HARVEST-01` remains a static source-read test. PROPERTIES classifies this as Integration level and specifies that the pipeline's `agentFn("harvest-learnings", ...)` call is verified to receive a correctly structured prompt by running the harvest phase. The test in `harvestPhase.test.js` (lines 114–129) reads `orchestrate-dev.js` source text and asserts substring presence in the `harvestPrompt` definition. It does not call `main()` with a mock harvest agent and capture the prompt argument passed to that agent. The static check is substantive and validates prompt authoring, but a refactor that renames the function or restructures the call site would not be caught. This was F-05 Medium in v1; downgraded to Low because the remaining gap is narrow. | PROP-HARVEST-01, TSPEC-HARVEST-02, AT-HARVEST-01 |
| F-02 | Low | Local | `PROP-OBS-01` ordering is not independently verified. PROPERTIES specifies verification "by call-order inspection" using a recording proxy that asserts `phase()` precedes each dispatcher invocation. The `pipelineWiring.test.js` PROP-PIPELINE-03 test (lines 327–357) records `phase()` calls and asserts label presence, but does not interleave `phase()` and `agent()` recordings to verify ordering between the two. PROP-OBS-01 re-uses PROP-PIPELINE-03's label-presence check rather than adding the inter-call ordering constraint. This was F-06 Medium in v1; downgraded to Low because label coverage is solid and the ordering constraint catches a narrower class of bugs. | PROP-OBS-01, REQ-OBS-01 |
| F-03 | Low | Local | `PROP-LOOP-13` resume test does not use `runtimeCacheMock`. PROPERTIES Section 2.1 specifies that PROP-LOOP-13 must simulate via `runtimeCacheMock` that completed iteration-1 and iteration-2 agent calls are not re-dispatched on resume. The test in `reviewLoop.test.js` passes `iteration: 3` directly to `reviewLoop`, which tests the log-message path but does not verify that prior-iteration agents are not re-invoked. `runtimeCacheMock` from PLAN TASK-P2-06 was not created. Carried from F-07 Low in v1; status unchanged. | PROP-LOOP-13, TSPEC-LOOP-05, TSPEC-LOOP-06, AT-RESUME-01 |
| F-04 | Low | Local | `PROP-COMPAT-07/08` (worker skills unmodified) tests verify file existence and non-emptiness only. PROPERTIES Section 14, note 5 specifies that tests compare file contents against a baseline hash recorded in the test fixture setup. `skillFiles.test.js` (lines 97–106) calls `readFileSync` and asserts `content.length > 0`. A modification to any worker SKILL.md would not be detected. Carried from F-08 Low in v1; status unchanged. | PROP-COMPAT-07, PROP-COMPAT-08, Section 14 note 5 |
| F-05 | Low | Local | The PROP-LOOP-10 describe block in `reviewLoop.test.js` (lines 554–569) is a non-asserting placeholder (`expect(true).toBe(true)`) that defers entirely to `pipelineWiring.test.js`. The authoritative static analysis in `pipelineWiring.test.js` (lines 304–325) is substantive and correctly satisfies PROP-LOOP-10. However, the named describe block in `reviewLoop.test.js` claims PROP-LOOP-10 coverage without asserting anything, which misleads file-level coverage audits. The PROPERTIES Test File Index lists `reviewLoop.test.js` as covering PROP-LOOP-01 through PROP-LOOP-16 including PROP-LOOP-10; a reader of that file alone would conclude the property is covered. The fix is a one-line change: replace `expect(true).toBe(true)` with a comment cross-referencing `pipelineWiring.test.js`. | PROP-LOOP-10, TSPEC-LOOP-04, Section 13 Test File Index |
| F-06 | Low | Local | Jest reports "A worker process has failed to exit gracefully and has been force exited" during the `implPhase.test.js` run. This indicates leaked handles from the PROP-IMPL-08 git integration tests. The `cleanup()` function in `tmpGitFixture.js` (line 62–68) removes the temp directory but does not explicitly terminate git child processes that may remain open after a failed or aborted merge. On CI with slower process teardown this can cause intermittent test suite failures. Running `execSync("git merge --abort", { cwd: repoPath, stdio: "ignore" })` before `rmSync` in the cleanup path (or using `afterAll` instead of per-test cleanup) would close the handles. | PROP-IMPL-08, PLAN TASK-P3-05 |

---

## Previously High/Medium findings — resolution status

| Prior ID | Severity | Status | Resolution |
|----------|----------|--------|------------|
| F-01 (v1) | High | **Resolved** | `mergeWorktree()` is fully implemented (4-step conflict path: `git merge --no-ff`, `git diff --name-only --diff-filter=U`, `git merge --abort`, halt with conflict file list). `tmpGitFixture.js` exists and exports `createConflictingWorktree()` correctly. Two integration tests in `implPhase.test.js` (lines 241–291) cover the conflict path and the clean-merge path. Both are guarded by `gitAvailable` skip. |
| F-02 (v1) | High | **Resolved** | `hookCompatibility.test.js` exists with 4 tests covering PROP-COMPAT-04 (check-scope-field advisory JSON output when Scope tag absent; exit 0 when already tagged) and PROP-COMPAT-05 (guard-harvest-before-delete non-zero exit when no LEARNINGS; exit 0 when LEARNINGS present). Bash-availability guards correctly use `(hasBash ? it : it.skip)`. PROP-COMPAT-04 correctly asserts `exitCode === 0` with advisory `hookSpecificOutput` JSON, matching the hook's design as advisory-only. |
| F-03 (v1) | High | **Resolved** | `pipelineWiring.test.js` lines 304–325 contain a real static analysis test: it enumerates all `await agent()`/`await _agent()` result variable names via regex, then asserts that no `log(varName)` or `emit(varName)` call appears at any call site. The authoritative assertion fully satisfies PROP-LOOP-10's contract. The placeholder in `reviewLoop.test.js` (new F-05 Low) is cosmetic. |
| F-04 (v1) | Medium | **Resolved** | `implPhase.test.js` lines 295–383 use a real recording proxy: `callSequence` records typed `{ type: "log"|"agent", skill, value }` entries by injecting `spyLog` as `_log` and `spyAgent` as `_agent` into a full `main()` run. The test asserts `batchPlanLogIdx < firstBatch1AgentIdx` and that both batch log entries precede the first `se-implement` dispatch. Satisfies PROP-IMPL-01's call-order instrumentation requirement. |
| F-05 (v1) | Medium | Downgraded to F-01 Low | Static check is substantive; narrow gap between static and behavioral coverage. |
| F-06 (v1) | Medium | Downgraded to F-02 Low | Label-presence coverage is solid; ordering-constraint gap is narrow. |

---

## Test run summary

```
Test Suites: 11 passed, 11 total
Tests:       159 passed, 159 total  (147 in v1 → +12 new tests)
Time:        151.828 s
```

All 159 tests pass. The increase from 147 to 159 reflects the new PROP-IMPL-01 recording proxy test, PROP-IMPL-08 integration tests, and hookCompatibility integration tests added to resolve the three v1 High findings.

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | The Jest worker-exit warning (F-06) occurs on Windows with Node v24.4.1. Has this also appeared in CI? If the repo has CI that runs `npm test`, this warning may be surfacing there. The fix is low-effort: add a `try { execSync("git merge --abort", { cwd: repoDir, stdio: "ignore" }) } catch {}` line at the start of `cleanup()` in `tmpGitFixture.js` before `rmSync`. |

---

## Positive Observations

- All three previously-High findings are cleanly resolved. `mergeWorktree()` is a well-structured 4-step implementation with injection point (`execFn`) for unit testing. The integration test fixture is correctly isolated and properly cleans up temp directories.
- The PROP-IMPL-01 recording proxy (`callSequence` with typed entries) is a well-designed test that exercises the real pipeline end-to-end. The ordering assertion (`batchPlanLogIdx < firstBatch1AgentIdx`) is precise and would catch any reordering of the batch-plan log statements relative to dispatch.
- `hookCompatibility.test.js` correctly handles the advisory nature of `check-scope-field.sh` (always exits 0, outputs `hookSpecificOutput` JSON when Scope tag absent) rather than incorrectly asserting a non-zero exit for PROP-COMPAT-04.
- `tmpGitFixture.js` initialises a repo with a known identity (`test@example.com`/`Test`) to avoid CI failures on missing git config, creates a proper diverging history via `HEAD~1`, and exports a clean `cleanup()` function.
- The PROP-LOOP-10 static analysis in `pipelineWiring.test.js` is rigorous: it dynamically identifies all result variable names rather than hardcoding expected names, making the check robust against variable renames.
- 159/159 tests pass on Node v24.4.1 with `--experimental-vm-modules`.

---

## Recommendation

**Approved with minor changes**

No High or Medium findings remain. All six findings are Low severity.

Two Low findings are recommended before merge:

1. **F-06 (Jest worker leak):** Add subprocess cleanup to `tmpGitFixture.js` before the `rmSync` call to prevent intermittent CI failures. Low-effort, one-line fix.
2. **F-05 (PROP-LOOP-10 placeholder):** Replace `expect(true).toBe(true)` in `reviewLoop.test.js` with a comment cross-referencing `pipelineWiring.test.js`. Zero-risk, one-line fix.

Low findings F-01 through F-04 may be deferred to a follow-up issue without blocking this feature.
