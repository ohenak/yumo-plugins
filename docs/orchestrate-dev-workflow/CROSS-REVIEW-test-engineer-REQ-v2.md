# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** docs/orchestrate-dev-workflow/REQ-orchestrate-dev-workflow.md
**Date:** 2026-06-01
**Iteration:** 2

| Field | Value |
|---|---|
| Scope | REQ review — testability, edge case completeness, precision, error/boundary conditions |

---

## Prior Findings Resolution (F-01 through F-14)

| Prior ID | Prior Severity | Resolution Status | Notes |
|----------|---------------|-------------------|-------|
| F-01 | High | Resolved | REQ-GATE-01 now explicitly states "by inspecting the `result` string/object returned by the `agent()` call for each reviewer — not by reading files on disk." AC item (1) is precise enough for a unit test with a mock agent result. |
| F-02 | High | Resolved | REQ-PIPELINE-03 now requires `log("Resuming from iteration N")` as the observable signal. AC items (2) and (3) specify testable assertions: a log entry with the exact form and no reset of the iteration counter. |
| F-03 | High | Resolved | REQ-COMPAT-01 now fully specifies: separate consecutive lines, no intervening text, exact key set, malformed JSON treated as `Needs revision`. The format is deterministically parseable and testable. |
| F-04 | High | Resolved | New requirement REQ-GATE-05 added. Covers missing/malformed VERDICT with exact log warning format, no-crash/no-stall guarantee, and normal iteration increment. |
| F-05 | Medium | Resolved | REQ-GATE-02 now includes a "Partial-iteration reviewer failure" clause covering crash/timeout treatment, counter behavior, and optimizer invocation. AC item (6) provides testable assertions. |
| F-06 | Medium | Resolved | REQ-GATE-04 now enumerates required POSTMORTEM sections in both the description and acceptance criterion (Phase, Iterations, Reviewers, Pattern of Disagreement, Best-Guess Root Cause, Recommendation). |
| F-07 | Medium | Resolved | REQ-ARTIFACTS-02 now includes a "Hook-block error propagation" clause with a precise observable chain: hook exits non-zero → Bash call exits non-zero → agent result contains error message → workflow halts with named guard-triggered failure and blocked file path. |
| F-08 | Medium | Resolved | REQ-NFR-01 now provides a worst-case formula (~142 agents) with enumerated components. AC item (3) references this formula explicitly, making the bound analytically verifiable. |
| F-09 | Medium | Resolved | REQ-NFR-02 now reframes the guarantee as a structurally verifiable code property: agent results held in script-local variables, never passed to `log()`. The AC is now "code-reviewable structural guarantee." |
| F-10 | Medium | Resolved | REQ-GATE-02 now specifies the DECISIONS conditional trigger as a boolean field `decisionsWarranted: true | false` returned by the TSPEC author agent. AC item (5) covers the skip log message and report entry. |
| F-11 | Low | Partially resolved | REQ-OBS-01 now specifies the mechanism as `log()` for iteration numbers. The exact log message format (e.g., `"Iteration N/5"` vs. `"Loop iteration: N"`) is still not specified. A test can now assert `log()` was called but cannot assert the format string. Residual gap is minor. |
| F-12 | Low | Not resolved | REQ-OBS-02 still uses ✅/❌ as status indicators without stating whether they are required literal characters or illustrative. A parser test cannot determine whether to assert for these exact Unicode characters or any truthy status marker. |
| F-13 | Low | Not resolved | REQ-PIPELINE-02 still says "all phases have executed in the defined sequence" without enumerating the ordered phase list in the REQ itself. The canonical sequence still lives only in SKILL.md, which is a moving-target dependency for test assertions. |
| F-14 | Low | Not resolved | REQ-PIPELINE-01 still does not state behavior when the REQ path is malformed or does not match `docs/{feature}/REQ-{feature}.md`. The error surface (parse failure, validation error, immediate halt with message) is unspecified and thus untestable. |

---

## Findings

### New Issues Introduced in v1.1

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-15 | Medium | Local | **REQ-GATE-02 DECISIONS trigger is partially untestable: `decisionsWarranted` missing-field behavior is absent.** The requirement states the TSPEC author agent SHALL include `decisionsWarranted: true | false` in its return value. However, it does not specify what the script does when this field is absent entirely — analogous to the missing-VERDICT case handled by REQ-GATE-05. Without a default (e.g., treat absent field as `true` to safely include DECISIONS), the conditional branch has an untestable failure path. Additionally, REQ-COMPAT-03 states worker skills are behaviorally unchanged, but the TSPEC author is a worker skill — if it must now return `decisionsWarranted`, this is a behavioral change that contradicts REQ-COMPAT-03. | REQ-GATE-02, REQ-COMPAT-03 |
| F-16 | Medium | Local | **REQ-PIPELINE-03 resumability only covers mid-`reviewLoop` interruption; implementation and harvest phases are unspecified.** The acceptance criteria Given clause says "mid-execution inside a `reviewLoop`" but pipelines can also be interrupted during the implementation phase (between `se-implement` batches) or during Phase H (harvest). The requirement does not specify resume behavior for these phases. A developer interrupted during implementation batch 3 of 5 would have no stated guarantee about which batches re-execute. This leaves the majority of mid-run interruption scenarios untestable against any stated requirement. | REQ-PIPELINE-03 |
| F-17 | Low | Local | **REQ-NFR-01 worst-case formula ambiguity: DECISIONS is conditional but counted in the 7-phase multiplier.** The formula states "7 phases × 5 iterations × 3 agents" but does not identify which 7 phases are included. DECISIONS is conditional per REQ-GATE-02. If DECISIONS is counted, the formula correctly represents the worst case (DECISIONS runs with 5 iterations). If it is not counted, the formula understates. Since the description does not enumerate the 7 phases, the formula's basis is ambiguous and cannot be independently verified by reading the REQ alone. | REQ-NFR-01 |
| F-18 | Low | Local | **REQ-GATE-05 AC scope is narrower than REQ-COMPAT-01 error surface.** REQ-GATE-05's AC specifies "no parseable `VERDICT:` line" as the trigger condition. REQ-COMPAT-01 identifies two distinct malformed cases: wrong casing on the verdict string, and malformed/missing JSON. A correct `VERDICT: Approved` line followed by malformed JSON (e.g., `{high: 0}`) satisfies "parseable `VERDICT:` line" but still produces malformed output. REQ-GATE-05's AC does not explicitly cover this case, leaving the JSON-malformed path between the two requirements. | REQ-GATE-05, REQ-COMPAT-01 |
| F-19 | Low | Local | **REQ-GATE-04 does not specify POSTMORTEM agent failure behavior.** If the agent invoked to write the POSTMORTEM itself crashes or fails, the requirement is silent on the fallback: does the workflow halt without a POSTMORTEM, retry once, or write a minimal inline report? Without a specified fallback, there is no requirement to test for this secondary failure mode, leaving a silent gap in the non-convergence path. | REQ-GATE-04 |
| F-20 | Low | Cross-Feature | **REQ-COMPAT-01 does not specify whether a trailing newline after the JSON is permissible.** The requirement says the final message ends with the VERDICT trailer but does not address trailing whitespace or newlines after the JSON object. A parser anchored to end-of-string will reject `{"high":0,"medium":0,"low":0}\n` while a line-scanner will accept it. Since this is a shared data contract intended for future workflow consumers, the exact termination rule should be explicit to prevent divergent parser implementations. | REQ-COMPAT-01 |

### Residual Issues from v1 (unresolved)

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-12 | Low | Local | **REQ-OBS-02 status indicator format unresolved.** ✅/❌ still used in the acceptance criterion without clarification that they are required literal characters vs. illustrative. A parser test cannot determine the expected value. | REQ-OBS-02 |
| F-13 | Low | Local | **REQ-PIPELINE-02 phase sequence not enumerated in REQ.** Acceptance criterion still defers the canonical ordered phase list to SKILL.md — a moving-target dependency for test assertions. | REQ-PIPELINE-02 |
| F-14 | Low | Local | **REQ-PIPELINE-01 malformed path behavior absent.** No requirement covers what the script does when invoked with a path that does not match `docs/{feature}/REQ-{feature}.md`. | REQ-PIPELINE-01 |

---

## Questions

| ID | Question |
|----|---------|
| Q-06 | REQ-GATE-02 states the TSPEC author agent SHALL include `decisionsWarranted: true | false`. Is this a new return convention added to the TSPEC author skill's prompt, or is it inferred by the workflow script from some existing signal? REQ-COMPAT-03 says worker skills are behaviorally unchanged — if `decisionsWarranted` is a new field, that constitutes a behavioral change and REQ-COMPAT-03 should explicitly exclude the TSPEC author from the "unchanged" guarantee. |
| Q-07 | REQ-PIPELINE-03 specifies `log("Resuming from iteration N")` — does N refer to the iteration the loop was on when interrupted, or the iteration the loop will next execute on resume? The distinction matters for test assertion: "interrupted during iteration 3" could produce N=3 (was on 3) or N=4 (will next execute 4). |
| Q-08 | REQ-COMPAT-03 says the workflow SHALL NOT route through `tech-lead` or `tech-lead-python`. REQ-GATE-02 says the script absorbs the DAG-parse and topological-batch logic from `tech-lead`. Is this logic re-implemented in the workflow script or extracted as a shared module? If re-implemented, is there a requirement that the two implementations produce identical batch orderings for the same PLAN input? |

---

## Positive Observations

- All four High findings from v1 (F-01 through F-04) are fully resolved. The REQ is substantially more testable in its core gate and verdict-parsing paths.
- REQ-GATE-05 is a well-crafted negative requirement: the exact `log()` warning format and enumeration of all failure causes (crash, truncation, un-patched skill) make the requirement implementable and testable without ambiguity.
- REQ-ARTIFACTS-02's new propagation chain is precise and traceable — each link (hook exit code → Bash exit code → agent result → workflow halt → report content) is independently assertable.
- REQ-NFR-01's worst-case formula provides a concrete ceiling that an integration test can assert against by counting agent invocations.
- REQ-GATE-02's `decisionsWarranted` boolean is the right shape for a conditional gate — a boolean field is far more deterministically assertable than a heuristic or prose condition.
- REQ-NFR-02's reframing as a structural code guarantee converts an unverifiable runtime memory property into a statically inspectable code property.

---

## Recommendation

**Approved with minor changes**

All High findings from v1 are resolved. The two new Medium findings (F-15, F-16) should be addressed before the FSPEC is authored, as they affect the DECISIONS conditional branch and resumability coverage respectively, both of which will require behavioral specification in the FSPEC. The remaining findings are Low and do not block implementation. Recommended minor changes in priority order:

1. **F-15:** Specify the default when `decisionsWarranted` is absent (recommend `true` as the safe default); reconcile with REQ-COMPAT-03 by explicitly noting that the TSPEC author's return convention is extended (additive, not a behavioral change to its document output).
2. **F-16:** Extend REQ-PIPELINE-03 to state that resume behavior for implementation and harvest phases follows the same runtime per-agent caching guarantee as `reviewLoop` phases, even if only in one sentence.
3. **F-12, F-13, F-14:** Addressable with minimal edits — clarify ✅/❌ as illustrative in REQ-OBS-02, inline the ordered phase list into REQ-PIPELINE-02, add one sentence for malformed-path error behavior in REQ-PIPELINE-01.
