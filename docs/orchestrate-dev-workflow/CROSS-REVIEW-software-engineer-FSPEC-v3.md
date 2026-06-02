---
Reviewer: software-engineer
Document reviewed: docs/orchestrate-dev-workflow/FSPEC-orchestrate-dev-workflow.md
Version reviewed: 1.2
Date: 2026-06-01
Iteration: 3
Scope: Behavioral flows for implementability, business rules for ambiguity, error scenarios for completeness, architectural constraints. Focus: resolution verification of v2 findings F-01 through F-06, and new issues introduced by v1.2 changes.
---

# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** docs/orchestrate-dev-workflow/FSPEC-orchestrate-dev-workflow.md
**Version reviewed:** 1.2
**Date:** 2026-06-01
**Iteration:** 3
**Scope:** Behavioral flows for implementability, business rules for ambiguity, error scenarios for completeness, architectural constraints. Focus: resolution verification of v2 findings F-01 through F-06, and new issues introduced by v1.2 changes.

---

## Resolution Status of v2 Findings

| v2 ID | Severity | Resolution |
|-------|----------|-----------|
| F-01 | Medium | **Resolved.** Section 9 OQ-02 is now marked Resolved: the VERDICT trailer is a permanent addition to reviewer SKILL.md files, not workflow-script-injected. The resolution rationale (interactive callers also benefit; REQ-COMPAT-01 is the shared data contract available to all callers) is documented inline in the OQ table. |
| F-02 | Medium | **Resolved.** Section 1.7 now disambiguates the two log messages: a fresh run at iteration 1 emits "Starting iteration 1", all other iterations (N >= 2, or any iteration in a resumed run) emit "Resuming from iteration N". The Reconciliation with REQ-PIPELINE-03 paragraph explicitly acknowledges the REQ wording divergence and names the FSPEC as normative. AT-RESUME-02 is added to test the fresh-run case. |
| F-03 | Medium | **Resolved.** Section 4.5 now contains an explicit Worktree auto-merge note stating the runtime does NOT auto-merge worktrees on agent completion; worktrees persist after agent completion and must be explicitly merged by the script via `git merge --no-ff`. The note also addresses the forward-compatibility guard. |
| F-04 | Low | **Not fully resolved.** The v2 finding noted that section 2.3 still used angle-bracket notation for skill-name. In v1.2, section 2.3 WARNING log format and AT-LOOP-04 still use angle brackets. A new AT-LOOP-08 added in v1.2 also uses the angle-bracket notation. The underlying problem persists. See new finding F-01 below. |
| F-05 | Low | **Resolved.** AT-IMPL-04 added: given no failure marker in any agent result, asserts log("Batch N complete — all tests passing") and pipeline continuation. The positive pass path now has explicit acceptance test coverage. |
| F-06 | Low | **Unresolved.** Section 9 OQ-04 remains open without a Resolved annotation or FSPEC-level correction. REQ-NFR-01 still uses "7 phases" in its worst-case formula. The FSPEC adds no new guidance beyond the v2 state. See new finding F-03 below. |

---

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-01 | Medium | Local | **Section 2.3 WARNING log format still uses angle-bracket notation for skill-name, inconsistent with all other placeholder notation in the document, and the new AT-LOOP-08 repeats the same notation.** This issue was first raised in v1 F-13, partially addressed in v1.1, flagged as v2 F-04, and persists into v1.2. Section 2.3 still reads: WARNING: reviewer (skill-name) returned no VERDICT — treating as Needs revision. AT-LOOP-04 references this format with the same angle brackets. AT-LOOP-08 (new in v1.2) also uses angle-bracket notation in its Then clause for the same warning template. Every other halt/warning/log message template in v1.2 — sections 0.2, 7.2, 7.4, 5.4, 1.9, 1.8, 4.6 — uses curly-brace placeholder notation. REQ-GATE-05 acceptance criteria also use angle brackets for the same message, adding a cross-document inconsistency. A test implementor writing string-match assertions across all AT Then clauses must special-case section 2.3, AT-LOOP-04, and AT-LOOP-08 alone. The fix is: replace the angle-bracket form with curly-brace notation in section 2.3 and apply the same substitution to AT-LOOP-04 and AT-LOOP-08. | Section 2.3, AT-LOOP-04, AT-LOOP-08, REQ-GATE-05 |
| F-02 | Medium | Local | **AT-LOOP-08 (both reviewers crash, added in v1.2) does not specify the relative order or interleaving constraints for the two warning log lines.** Section 7.3 Exception paragraph states two warning log lines are emitted, one per crashed reviewer, but is silent on order. AT-LOOP-08 Then clause asserts two individual warning log lines without specifying ordering. In parallel dispatch, the two reviewer agents may complete in non-deterministic order. A test implementor cannot determine whether to write an ordered assertion (log[0] = reviewer A, log[1] = reviewer B) or an unordered presence check (both warning strings exist in the log, any order). These produce different test predicates and different failure modes. The FSPEC must specify either: (a) warning lines are emitted in the reviewers array declaration order (deterministic), or (b) the assertion is an unordered set presence check. | Section 7.3, AT-LOOP-08 |
| F-03 | Low | Local | **OQ-04 (REQ-NFR-01 worst-case formula: 7 phases vs. 8 review phases) has been open since v1 with no resolution progress, and the TSPEC is the immediate downstream artifact.** The pipeline has 8 defined review phases per section 6.2 (R, F, T, D, P, PR, CR — and Phase CR is explicitly counted in section 4.8). REQ-NFR-01 uses 7 phases x 5 iterations x 3 agents = 105. The TSPEC will reference REQ-NFR-01 as the concurrency cap compliance basis; with the wrong phase count the analytical verification is unsound. Resolution options: (a) add a FSPEC-level note in OQ-04 carrying the corrected formula (8 x 5 x 3 = 120 + other terms, approximately 155 agents worst case, well under 1,000); or (b) update the REQ before TSPEC authoring begins. Either resolves the downstream traceability risk. | Section 9 OQ-04, REQ-NFR-01, Section 6.2, Section 4.8 |
| F-04 | Low | Local | **AT-RESUME-02 is missing a negative assertion: it does not assert that "Resuming from iteration 1" is NOT emitted on a fresh run.** Section 1.7 establishes two mutually exclusive log messages: a fresh start at iteration 1 emits "Starting iteration 1", while any resumed or subsequent iteration emits "Resuming from iteration N". AT-RESUME-02 Then clause asserts "Starting iteration 1" is emitted, but does not assert "Resuming from iteration 1" is absent. An implementation that emits both messages on a fresh run would satisfy AT-RESUME-02 while violating section 1.7 mutual-exclusivity. The test-engineer v2 cross-review raised the analogous concern in F-NV-03 for AT-LOOP-01; the same gap exists in AT-RESUME-02. | AT-RESUME-02, Section 1.7 |
| F-05 | Low | Cross-Feature | **OQ-05 (sync mechanism for pdlc/workflows/orchestrate-dev.js to .claude/workflows/orchestrate-dev.js in consumer repos) remains deferred with no resolution path, yet the TSPEC must bound the deliverable scope.** The FSPEC correctly defers the mechanism but provides no guidance on available options. The TSPEC scope boundary depends directly on this: if a pdlc install script is required it is a separate deliverable; if manual copy is assumed the TSPEC should document it; if the runtime loads from a plugin-registry path the workflow source path differs. Without a decision here the TSPEC author must either over-scope or under-scope. This is tagged Cross-Feature because the plugin-to-consumer-repo distribution pattern will apply to every future plugin that ships workflow scripts. | Section 9 OQ-05 |

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v2: Section 1.9 step 1 invokes the POSTMORTEM-writing agent via an inline instruction string. Does the workflow runtime agent() primitive accept arbitrary instruction strings as the agent prompt, or must it reference a named skill? The TSPEC cannot finalize the POSTMORTEM agent call design without this. |
| Q-02 | Section 1.7 specifies that iteration N >= 2 on a fresh run (first FAIL, optimizer runs, loop returns to section 1.2 for iteration 2) emits "Resuming from iteration 2". This is accurate per the spec (N >= 2) but semantically misleading since the run was not interrupted. Is this the intended UX, or should the fresh-run continuation case use "Starting iteration N" to distinguish it from a resumed run? |
| Q-03 | Section 4.5 step 5 states "subsequent worktrees in the same batch are not merged" after a conflict is detected. Does the script immediately halt after aborting the first conflicting merge, leaving all remaining worktrees unmerged? Or does it attempt all remaining merges and report all conflicts before halting? (Carried from v2 Q-01.) |

---

## Positive Observations

- OQ-02 resolution is well-executed: the rationale (interactive callers benefit; this matches REQ-COMPAT-01 "available to all callers" language) is documented inline and traceable. Symmetry with OQ-03 resolution makes the FSPEC internally consistent on how additive trailer decisions are documented.
- Section 1.7 two-message disambiguation ("Starting iteration 1" vs. "Resuming from iteration N") with the Reconciliation with REQ-PIPELINE-03 paragraph is the correct approach for handling REQ/FSPEC behavioral divergences. Naming the FSPEC as normative and explaining the REQ wording scope prevents TSPEC authors from resolving the contradiction in the wrong direction.
- The Worktree auto-merge note in section 4.5 precisely addresses v2 F-03: it states the assumption (runtime does NOT auto-merge), the required action (each worktree persists and must be explicitly merged by the script), and includes a forward-compatibility guard. This is exactly the detail needed to write the merge logic in the TSPEC without runtime experimentation.
- AT-LOOP-08 (both reviewers crash) closes a genuine behavioral gap: the dual-crash path has distinct observable behavior from single-crash (two warning lines, optimizer invoked once not twice). Specifying "optimizer is invoked exactly once (not twice)" in the Then clause prevents a naive implementation that invokes the optimizer once per failing reviewer.
- AT-IMPL-04 cleanly resolves v2 F-05. The Then clause specifies both the log emission and the continuation behavior, giving a complete behavioral specification for the positive batch-pass path.
- AT-RESUME-02 and AT-RESUME-01 together cover the full two-message contract. Correctly structured for independent unit testing: one covers fresh-start, one covers interrupted-resume.

---

## Recommendation

**Approved with minor changes**

All v2 High findings were resolved in prior iterations. The two remaining Medium findings in v1.2 (F-01, F-02) are targeted and low-effort:

- **F-01:** Replace the angle-bracket notation for skill-name in section 2.3 WARNING log format with curly-brace notation, and apply the same substitution to AT-LOOP-04 and AT-LOOP-08 Then clauses.
- **F-02:** Add one sentence to AT-LOOP-08 specifying that the two warning log lines are in unspecified order and the assertion checks set presence (both strings present, any order), not relative ordering.

Low findings F-03 and F-04 should be addressed in the same pass. F-05 (OQ-05 scope boundary for the workflow sync mechanism) should be resolved before TSPEC scope is finalized, even if the answer is "manual copy; out of TSPEC scope."
