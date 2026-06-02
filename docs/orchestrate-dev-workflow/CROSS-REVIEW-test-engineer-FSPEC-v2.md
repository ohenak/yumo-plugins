# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/orchestrate-dev-workflow/FSPEC-orchestrate-dev-workflow.md
**Date:** 2026-06-01
**Iteration:** 2

| Field | Value |
|---|---|
| Scope | FSPEC v1.1 iteration review — resolution of F-01 through F-09 from v1 cross-review, new issues introduced by v1.1 changes, coverage gaps in the Low findings carried forward from Iteration 1 |

---

## Resolution Assessment: F-01 through F-09

| Prior ID | Severity | Resolution Status | Notes |
|----------|----------|------------------|-------|
| F-01 | High | **Addressed** | AT-LOOP-05 added. Tests POSTMORTEM agent failure path with correct warning text, halt, and no-retry assertion. |
| F-02 | High | **Addressed** | AT-LOOP-06 added. Tests `reviewLoop` precondition failure with correct halt message format. |
| F-03 | High | **Partially addressed — new gap introduced** | AT-VERDICT-05 added and §2.2/§2.3 updated. The resolution changed the contract: truncated VERDICT is now accepted (not fallback-treated). AT-VERDICT-05 tests only the "very last line" sub-case; the "VERDICT line followed only by empty lines" sub-case is specified in §2.3 but has no AT (see F-NV-01). |
| F-04 | Medium | **Not addressed** | AT-LOOP-04 still covers only single-reviewer crash. No AT for both-reviewers-crash-same-iteration despite §7.3 Exception paragraph specifying this behavior. The v1 review recommended this as AT-LOOP-07; v1.1 used that identifier for F-07 instead (see F-NV-02). |
| F-05 | Medium | **Addressed** | AT-RESUME-01 added. Tests iteration-3-interrupted-then-resumed with correct N-semantics. |
| F-06 | Medium | **Addressed** | AT-DECISIONS-03 added. Tests explicit `DECISIONS_WARRANTED: true` with correct negative assertion (absent-field warning NOT emitted). |
| F-07 | Medium | **Addressed** | AT-LOOP-07 added. Tests optimizer failure halt with exact error message format and no-retry assertion. |
| F-08 | Medium | **Addressed** | AT-IMPL-01 updated with an inline call-order assertion ("the script's `log()` statement...is a sequential statement that appears before the first `agent()` call"). The behavioral contract is now dual-specified; both levels are testable. |
| F-09 | Medium | **Addressed** | AT-IMPL-03 added. Tests DAG inconsistency override with correct log message and correct batch re-derivation. |

---

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-NV-01 | High | Local | **AT-VERDICT-05 covers only one of the two truncated-output sub-cases specified in §2.3.** §2.2 step 6 and §2.3 define truncated output as: "the VERDICT line is the last line of output, **or** if all lines after the VERDICT line are empty." AT-VERDICT-05 only tests the first sub-case ("the VERDICT line is the very last line; no line follows it"). The second sub-case — VERDICT line followed by one or more empty lines but no non-empty content — is specified as equivalent behavior (verdict accepted, count defaults to zero, no warning), but has no AT. A parser that checks `index === lines.length - 1` (last-line check) would satisfy AT-VERDICT-05 while failing the second sub-case. These are distinct parser conditions requiring separate tests. | §2.2 step 6, §2.3 Truncated-output special case, AT-VERDICT-05 |
| F-NV-02 | High | Local | **F-04 from Iteration 1 (both reviewers crash in the same iteration) remains unaddressed.** §7.3 Exception paragraph specifies: "if both reviewers crash in the same iteration, both are treated as `Needs revision` (two warning log lines are emitted, one per crashed reviewer), gate state is FAIL, the optimizer is invoked once, and the iteration count increments." This is a distinct behavioral branch from AT-LOOP-04 (single-reviewer crash). The Iteration 1 review recommended this AT with the label AT-LOOP-07, but v1.1 used that identifier for the optimizer failure AT. The dual-crash path has no acceptance test. It is directly testable: given both reviewer agents throw exceptions in the same iteration, assert two distinct warning log lines (one per crashed reviewer), gate FAIL, optimizer invoked once, counter increments. | §7.3, AT-LOOP-04 |
| F-NV-03 | Medium | Local | **The `"Resuming from iteration N"` log fires unconditionally on fresh runs (iteration 1), but AT-LOOP-01 does not assert this.** §1.7 states: "a fresh start at iteration 1 also emits `'Resuming from iteration 1'`." AT-RESUME-01 tests the interrupted-and-resumed case at iteration 3. AT-LOOP-01 tests a fresh pass at iteration 1 but asserts only that the loop exits and no optimizer is invoked — it does not assert the `"Resuming from iteration 1"` log. Without this assertion, an implementation that conditionally emits the log only on actual resume (not on fresh start) would satisfy all current ATs while violating §1.7. | §1.7, AT-LOOP-01, AT-RESUME-01 |
| F-NV-04 | Medium | Local | **No AT covers the batch-pass success path (all agents pass, pipeline continues to next batch).** §4.6 in v1.1 now specifies the positive pass signal: "the batch passes if and only if no agent result contains a failure marker." This resolves the prior F-17 ambiguity, but there is still no AT asserting the positive path. Given all agents in batch 1 return results with no failure marker, the spec requires `log("Batch N complete — all tests passing")` and dispatch of the next batch. AT-IMPL-02 covers only the failure path. The complement — all-pass → continuation — is an untested acceptance criterion for a named behavioral branch. | §4.6, AT-IMPL-02 |
| F-NV-05 | Medium | Local | **Truncated-output path creates an untested asymmetry: `VERDICT: Needs revision` with no JSON is accepted silently (no warning), but a malformed VERDICT triggers a warning.** §2.3 Truncated-output special case states the verdict is accepted and no fallback warning is emitted. When the accepted verdict is `Needs revision`, this produces a silent gate-FAIL with zero findings counts — indistinguishable from a valid `Needs revision` vote in the pipeline's observable signals. AT-VERDICT-05 only covers `VERDICT: Approved` as the truncated case. The `VERDICT: Needs revision` truncated case (silent gate-FAIL, no warning) has no AT. This gap is significant for debugging: a reviewer that returns only `VERDICT: Needs revision` due to output truncation appears identical to a reviewer that returns a well-formed `Needs revision` vote. | §2.3 Truncated-output special case, AT-VERDICT-05 |
| F-NV-06 | Low | Local | **Low findings F-10 through F-16 from Iteration 1 are unaddressed.** Specifically: F-10 (multiple VERDICT lines — last-occurrence rule has no AT), F-11 (negative values in JSON findings count has no AT), F-12 (extra JSON keys has no AT), F-13 (empty REQ file validation path has no AT), F-15 (`check-scope-field` and `nudge-consolidation` hook behaviors have no ATs), F-16 (sub-batch splitting for >5 tasks has no AT). None have been addressed in v1.1. F-11, F-12, and F-16 are particularly recommended for resolution before PROPERTIES authoring, as those behavioral branches will need PROPERTIES classification. | §2.2, §2.3, §4.3, §6.1, §7.6, §7.7 |
| F-NV-07 | Low | Local | **AT-HARVEST-01 remains E2E-framed (F-14 from Iteration 1 unaddressed).** "LEARNINGS commit appears before any deletion commit in git log" still requires git repository inspection post-execution. "Guard hook does not fire for the LEARNINGS write" is not an observable workflow-script signal. The recommended unit-level assertion — harvest agent emits a LEARNINGS commit confirmation log before any delete Bash call — has not been adopted. | §5.2, AT-HARVEST-01 |
| F-NV-08 | Low | Local | **AT-IMPL-01 "Who" field still reads "Developer observing `/workflows`" despite the unit-level call-order assertion now in the "Then" clause.** The "Who" framing anchors the test to UI observation, while the "Then" contains a behavioral assertion testable at the unit level ("verifiable by inspecting the script's sequential statement order"). A PROPERTIES author classifying this AT's test level will find the "Who" and "Then" contradictory. The "Who" should be updated to "Workflow script (call-order assertion)" to match the dominant behavioral claim. | AT-IMPL-01 |
| F-NV-09 | Low | Cross-Feature | **F-18 from Iteration 1 (additive trailer convention not documented as a reusable pattern) remains unaddressed.** The `DECISIONS_WARRANTED:` additive trailer is a workflow-invocation-scoped structured return value injected at agent-call time without modifying the skill globally. This pattern is not captured as a named convention anywhere in the repo. Future workflow authors encountering the same need will reinvent it ad hoc. Documenting it in `docs/_decisions/` or as a SKILL.md annotation would prevent cross-feature duplication. | §3.1 |

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from Iteration 1: Does the workflow runtime's `resumeFromRunId` parameter name match what is assumed in REQ-PIPELINE-03? AT-RESUME-01 now asserts specific log content and behavior on resume, but the mechanism triggering the resume is still unspecified. The TSPEC will need this resolved before it can specify the resume interface. |
| Q-02 | Carried from Iteration 1: Is the VERDICT trailer injected by the workflow script at invocation time, or baked into each reviewer SKILL.md (OQ-02)? The resolution determines whether tests need to verify that interactive skill invocations do not emit VERDICT trailers. |
| Q-03 | §2.3 specifies that `VERDICT: Needs revision` with no subsequent non-empty line is accepted silently — no warning is emitted. Is this the intended behavior? A reviewer that produces only the VERDICT line due to output truncation causes a silent gate-FAIL that is indistinguishable from a valid failing vote. Should truncated `Needs revision` outputs emit a different warning than the standard fallback warning, to aid debugging? |
| Q-04 | Carried from Iteration 1 (OQ-04): REQ-NFR-01's worst-case formula references "7 phases" but §6.2 lists 8 review phases. The FSPEC notes this discrepancy but the REQ itself still shows the wrong number. Should this be corrected in the REQ before TSPEC authoring to prevent a traceability mismatch? |

---

## Positive Observations

- All three High findings from Iteration 1 (F-01, F-02, F-03) received AT additions. F-03's resolution also updated the normative specification in §2.2 and §2.3, converting an implicit parsing-algorithm gap into an explicit contract — this is the correct approach for FSPEC-level specification.
- AT-LOOP-07 precisely mirrors the §7.4 error message format, including the `{N}` iteration placeholder and the document-state-inconsistency note. The "Then" clause is assertable without further clarification.
- AT-RESUME-01 is precise: the "Given" pins the interrupted iteration to 3, and the "Then" asserts both `N = 3` (not 4) AND no-reset of the cap counter, covering both aspects of the §1.7 disambiguation.
- AT-DECISIONS-03 includes a correct negative assertion — the absent-field warning log must NOT be emitted when the explicit `true` value is returned. Negative assertions of this kind catch parser implementations that reach the correct outcome via the wrong code path.
- §4.6 "Test result signal format (normative)" cleanly resolves the F-17 ambiguity by specifying that absence of a failure marker is the positive pass signal. This eliminates the need for a structured pass trailer and makes the pass condition directly expressible as a unit test predicate.
- The §2.3 Truncated-output special case is a substantive v1.1 improvement: converting an implicit parsing-algorithm edge case into an explicit behavioral contract with a specified default value and a "no warning" guarantee. The design decision (accept the verdict, default counts to zero) is sound for the common case of partial agent output.

---

## Recommendation

**Needs revision**

Two High findings require new acceptance tests before PROPERTIES authoring can proceed:

1. **F-NV-01:** Add an AT for the "VERDICT line followed only by empty lines" sub-case of the truncated-output contract. Suggested: given agent result is `VERDICT: Approved\n\n\n` (VERDICT line followed by two empty lines), assert verdict `Approved` is accepted, findings count defaults to zero, no warning is emitted.
2. **F-NV-02:** Add an AT for both reviewers crashing in the same iteration. Suggested: given both reviewer agents throw exceptions, assert exactly two warning log lines are emitted (one per crashed reviewer), gate state is FAIL, optimizer is invoked exactly once, and iteration counter increments to 2.

Two Medium findings must also be addressed:

3. **F-NV-03:** Add an assertion to AT-LOOP-01 (or a new AT) that `"Resuming from iteration 1"` is emitted on a fresh run, covering the unconditional-log behavior in §1.7.
4. **F-NV-04:** Add an AT for the batch-pass success path: given all agents in a batch return results with no failure marker, assert `log("Batch N complete — all tests passing")` is emitted and the next batch is dispatched.

The remaining Low findings (F-NV-05 through F-NV-09) and all unaddressed Iteration 1 Low findings may be resolved in the same pass. F-NV-05 (silent `Needs revision` truncated-output asymmetry) and F-NV-06 items F-11, F-12, F-16 are particularly recommended for resolution before PROPERTIES authoring, as those behavioral branches will require PROPERTIES classification in the next phase.
