---
Reviewer: software-engineer
Document reviewed: docs/orchestrate-dev-workflow/FSPEC-orchestrate-dev-workflow.md
Version reviewed: 1.3
Date: 2026-06-01
Iteration: 4
Scope: Behavioral flows for implementability, business rules for ambiguity, error scenarios for completeness. Focus: resolution verification of v3 findings F-01 through F-05, and new issues introduced by v1.3 changes.
---

# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** docs/orchestrate-dev-workflow/FSPEC-orchestrate-dev-workflow.md
**Version reviewed:** 1.3
**Date:** 2026-06-01
**Iteration:** 4
**Scope:** Behavioral flows for implementability, business rules for ambiguity, error scenarios for completeness. Focus: resolution verification of v3 findings F-01 through F-05, and new issues introduced by v1.3 changes.

---

## Resolution Status of v3 Findings

| v3 ID | Severity | Resolution |
|-------|----------|-----------|
| F-01 | Medium | **Resolved.** Section 2.3 WARNING log format now uses curly-brace notation (`{skill-name}`). AT-LOOP-04 and AT-LOOP-08 both use curly-brace notation. The angle-bracket inconsistency is eliminated. |
| F-02 | Medium | **Resolved.** AT-LOOP-08 Then clause now explicitly states "two warning log entries (in any order)" and "The assertion checks set presence (both warning strings present, any order) — not relative ordering." The ordering ambiguity is fully resolved. |
| F-03 | Low | **Not resolved.** OQ-04 in §9 retains the same open status as v1.2 with no FSPEC-level correction or annotation added. The phase count discrepancy (REQ-NFR-01 uses 7 phases; §6.2 defines 8 review phases) remains unaddressed. See new finding F-02 below. |
| F-04 | Low | **Resolved.** AT-RESUME-02 Then clause now reads `"Starting iteration 1" — not "Resuming from iteration 1"`. The negative assertion excludes the mutually exclusive message, satisfying the §1.7 mutual-exclusivity guarantee. |
| F-05 | Low | **Not resolved.** OQ-05 in §9 remains open with the same "defers to implementation decision" language. No guidance on distribution mechanism options has been added. See new finding F-04 below. |

---

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-01 | High | Local | **A crashed or exception-throwing `se-implement` batch agent is indistinguishable from a passing agent under the §4.6 test gate.** Section 4.6 defines the failure marker as the presence of `Tests: N failed` or `non-zero exit` in the agent's result string. If a batch agent crashes entirely (throws an exception, times out, or returns an empty result), neither failure marker is present in its output. The §4.6 "pass determination" rule states "the batch passes if and only if no agent result contains a failure marker as defined above." A crashed agent with no output satisfies this rule, and the batch is treated as passing — allowing the pipeline to proceed on broken, uncommitted, or absent implementation work. Section 2.3 specifies explicit fallback handling for crashed reviewer agents (treat as `Needs revision`). No equivalent fallback exists for crashed `se-implement` agents in §4.6 or §4.7. The fix requires an additional crash/timeout detection rule in §4.6: if any batch agent call threw an exception, timed out, or returned an empty result (no output at all), treat that agent as a test failure and halt the batch gate with an appropriate error message. Section 4.7 has the same gap and should be updated in the same pass. A new AT-IMPL acceptance test should cover this path. | §4.6, §4.7, §2.3 |
| F-02 | Medium | Local | **OQ-04 (REQ-NFR-01 uses 7 review phases; §6.2 defines 8) has been open for four consecutive iterations without a FSPEC-level note or corrected formula.** Section 4.8 explicitly states "Phase CR counts as one of the 8 review phases in the agent count formula (see REQ-NFR-01)." This internal cross-reference points to a REQ entry with an incorrect phase count, making the analytical compliance basis unsound for the TSPEC author. The corrected worst-case formula (8 review phases × 5 iterations × 3 agents = 120 review-agent calls, plus implementation batch agents, plus 1 PT agent call, plus 1 harvest agent call) should appear as an addendum note in §4 or §9, even if the REQ update is deferred. The compliance conclusion (well under 1,000 concurrent agents) is unchanged; recording the corrected formula in the FSPEC allows the TSPEC to cite an accurate compliance basis. | §9 OQ-04, §4.8, §6.2, REQ-NFR-01 |
| F-03 | Medium | Local | **Section 3.1 specifies a mandatory post-PASS `se-author` invocation for the TSPEC phase, but this step is absent from the §1.5 review loop spec and the §6.2 phase sequence, making it implicit and easy to omit in implementation.** Section 3.1 states: "After the TSPEC review loop passes (both reviewers approve), the script invokes the `se-author` agent to address the TSPEC cross-review findings and finalize the TSPEC. This same agent invocation also assesses whether a DECISIONS document is warranted." This is a mandatory post-PASS step distinct from the in-loop optimizer calls in §1.5. Section 1.5 defines the optimizer as invoked only on FAIL iterations; it says nothing about a post-PASS invocation. Section 6.2 Phase T entry ("TSPEC Creation + Review") does not list a post-loop step. Two implementability consequences follow: (a) if the TSPEC loop passes on iteration 1 (no FAIL iterations, no in-loop optimizer calls), the post-PASS `se-author` call is the only optimizer call — an implementor reading §1.5 alone would not invoke it; (b) it is ambiguous whether the `DECISIONS_WARRANTED:` instruction is injected on all optimizer calls in the TSPEC phase (including FAIL-iteration calls) or only on the post-PASS call. If injected on every call, the script must discard `DECISIONS_WARRANTED:` values from FAIL-iteration results and only use the post-PASS result. The fix requires §3.1 to add a normative statement that the post-PASS call is mandatory regardless of loop iteration count, and §6.2's Phase T row to be updated to reflect the mandatory post-loop optimizer step. The injection scope (all calls vs. post-PASS only) must be stated explicitly. | §3.1, §1.5, §6.2 |
| F-04 | Low | Local | **OQ-05 (sync mechanism for `pdlc/workflows/orchestrate-dev.js` → `.claude/workflows/orchestrate-dev.js`) remains open with no resolution progress, despite v3 flagging it as needing resolution before TSPEC scope is finalized.** At minimum, the FSPEC should record a provisional decision (manual copy, registry path, or separate install script) so the TSPEC author can scope the deliverable boundary. "Defers to implementation decision" is insufficient when the workflow file path itself is part of the TSPEC deliverable. If the answer is "manual copy: out of TSPEC scope," that should be recorded as a resolved entry in OQ-05. | §9 OQ-05 |
| F-05 | Low | Local | **Section 4.7 (Phase PT) does not specify how the workflow script detects PT agent test failure.** Section 4.7 step 3 says "halt with the same halt behavior as §4.6," but §4.6's halt is triggered by specific failure marker detection (`Tests: N failed` or `non-zero exit`) in agent result strings. Section 4.7 does not state that the same signal detection applies to the PT agent. An implementor must infer it. Additionally, the crashed-agent gap identified in F-01 applies here as well. The fix is a one-sentence reference: "The PT agent's result is evaluated using the same failure marker detection defined in §4.6, including the crash/timeout fallback." | §4.7, §4.6 |

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v2/v3: Section 1.9 step 1 invokes the POSTMORTEM-writing agent via an inline instruction string. Does the workflow runtime `agent()` primitive accept arbitrary instruction strings as the agent prompt, or must it reference a named skill? The TSPEC cannot finalize the POSTMORTEM agent call design without this. |
| Q-02 | Carried from v3: If the `DECISIONS_WARRANTED:` instruction is injected on every TSPEC optimizer call (not only the post-PASS call), must the script parse and discard `DECISIONS_WARRANTED:` values from all FAIL-iteration optimizer results, using only the post-PASS result? Or is the injection applied only to the post-PASS call, with FAIL-iteration optimizer calls receiving no injection? |
| Q-03 | Carried from v3: Section 4.5 step 5 states "subsequent worktrees in the same batch are not merged" after a conflict is detected. Does the script immediately halt after aborting the first conflicting merge (stopping all remaining worktree merges), or does it attempt all remaining merges in the batch and report all conflicts before halting? The error message template uses a singular `{file-list}` suggesting one conflict, but "subsequent worktrees are not merged" implies abandonment after the first. |

---

## Positive Observations

- v3 F-01 (angle-bracket notation) and v3 F-02 (AT-LOOP-08 ordering) are cleanly resolved. The curly-brace substitution is applied consistently across §2.3, AT-LOOP-04, and AT-LOOP-08. The set-presence assertion language in AT-LOOP-08 ("in any order") is precise and directly implementable.
- v3 F-04 (AT-RESUME-02 missing negative assertion) is resolved exactly as requested. The "not `Resuming from iteration 1`" clause provides the exclusive-or check needed for a complete property test.
- AT-RESUME-03 (added in v1.3) closes the fresh-run iteration-2 case unprompted, correctly asserting `"Resuming from iteration 2"` and the negative `"not Starting iteration 2"` form. Together with AT-RESUME-01 and AT-RESUME-02, all three log-message contracts (fresh-start, fresh-continuation, interrupted-resume) are independently covered.
- The §2.3 truncated-output special case (AT-VERDICT-05, AT-VERDICT-06, AT-VERDICT-07) is fully specified with three acceptance tests covering all sub-cases. The distinction between the truncated-VERDICT override and the general Missing JSON fallback path is precisely articulated and unambiguous for test implementation.
- The §5.1 `PHASE_H_ENABLED` compile-time flag is a sound scaffolding mechanism. Defaulting to `true` with documentation of the toggle path avoids the "phantom caveat" problem where a prose note exists but no implementation hook enforces it.

---

## Recommendation

**Needs revision**

One High finding and two Medium findings must be resolved before the TSPEC can be authored:

- **F-01 (High):** Add an explicit crash/timeout fallback rule to §4.6 for batch `se-implement` agents — a crashed, timed-out, or empty-output agent must be treated as a test failure, not a pass. Update §4.7 to reference the same rule. Add a new AT-IMPL acceptance test covering the crashed-agent path.
- **F-02 (Medium):** Add the corrected worst-case agent count formula to §4 or §9 as a FSPEC note (8 review phases × 5 iterations × 3 agents = 120 review-agent calls plus batch/PT/harvest overhead), even if the REQ-NFR-01 update is deferred.
- **F-03 (Medium):** In §3.1, add a normative statement that the post-PASS `se-author` call is mandatory regardless of loop iteration count. Update §6.2 Phase T to reflect this step. State explicitly whether the `DECISIONS_WARRANTED:` injection applies to all TSPEC optimizer calls or only the post-PASS call.

Low findings F-04 and F-05 should be addressed in the same pass. Q-01 through Q-03 should be resolved before TSPEC authoring begins.
