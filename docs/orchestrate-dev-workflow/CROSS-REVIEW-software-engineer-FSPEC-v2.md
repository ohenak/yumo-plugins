---
Reviewer: software-engineer
Document reviewed: docs/orchestrate-dev-workflow/FSPEC-orchestrate-dev-workflow.md
Version reviewed: 1.1
Date: 2026-06-01
Iteration: 2
Scope: Behavioral flows for implementability, business rules for ambiguity, error scenarios for completeness, architectural constraints compatibility. Focus: resolution of v1 findings F-01 through F-08, and new issues introduced by v1.1 changes.
---

# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** docs/orchestrate-dev-workflow/FSPEC-orchestrate-dev-workflow.md
**Version reviewed:** 1.1
**Date:** 2026-06-01
**Iteration:** 2
**Scope:** Behavioral flows for implementability, business rules for ambiguity, error scenarios for completeness, architectural constraints compatibility. Focus: resolution of v1 findings F-01 through F-08, and new issues introduced by v1.1 changes.

---

## Resolution Status of v1 Findings

| v1 ID | Severity | Resolution |
|-------|----------|-----------|
| F-01 | High | **Resolved.** §0.1 Phase Dispatch Table now provides the complete phase-to-reviewer-and-optimizer mapping for all phases R, F, T, D, P, PR, CR. |
| F-02 | High | **Resolved.** §2.2 replaces the regex approach with an explicit split-and-iterate algorithm (split on `\n`, iterate in reverse, prefix check). The `DECISIONS_WARRANTED` parsing in §2.2 final paragraph uses the same strategy. |
| F-03 | High | **Resolved.** §4.5 steps 4–6 now specify: `git merge --no-ff` per worktree (merge commit strategy), conflict detection triggering `git merge --abort`, halt with exact error message naming conflicting files, no merge of subsequent worktrees. |
| F-04 | Medium | **Resolved.** §4.6 defines the normative test failure markers (`"Tests: N failed"` pattern or `"non-zero exit"` string), pass as absence of failure markers, and explicitly states no structured pass trailer is required. |
| F-05 | Medium | **Resolved.** §0 (FSPEC-DISPATCH) adds creator agent invocation rules (§0.2): skill, inputs, expected output path, and direct failure path (§0.2 step 4). §0.2 step 5 also clarifies how creator-succeeded-but-document-missing is detected via the §1.1 precondition check. |
| F-06 | Medium | **Resolved.** §1.7 now states: no cache-state query API is required; the log is emitted unconditionally before each parallel reviewer dispatch; the iteration counter state is the sole mechanism for the N value. |
| F-07 | Medium | **Resolved.** §1.1 now specifies the Phase CR entry precondition as directory existence (not file existence); §4.8 specifies `docPath: docs/{featureName}/`; §0.3 confirms Phase CR has no creator call. |
| F-08 | Medium | **Resolved.** §5.1 now specifies a `PHASE_H_ENABLED` compile-time flag, the log message, `/workflows` representation, and final report entry for the prerequisite-not-met skip path. |
| F-09 | Low | **Resolved.** §1.8 explicitly states the counter reaches 6 after iteration 5's optimizer invocation; cap check is `counter > 5`. |
| F-10 | Low | **Resolved.** §2.2 step 7 explicitly states "key set equal to `{high, medium, low}` (set equality, order-independent)." |
| F-11 | Low | **Resolved.** §4.3 now specifies sub-batch ordering by PLAN document order and that sub-batches at the same topological level execute sequentially. |
| F-12 | Low | **Resolved.** §3.1 now states `DECISIONS_WARRANTED:` trailer is injected by the workflow script at invocation time, not baked into `se-author` SKILL.md. OQ-03 closed. |
| F-13 | Low | **Partially resolved.** §0.2, §7.2, and §7.4 now use consistent `{placeholder}` curly-brace notation. However §2.3 still uses `<skill-name>` with angle brackets for the WARNING log format. See new finding F-04 below. |

---

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-01 | Medium | Local | **OQ-02 (VERDICT trailer injection mechanism) remains open and blocks TSPEC authoring.** §9 OQ-02 asks whether the VERDICT trailer is baked into reviewer SKILL.md files or injected by the workflow script at invocation time. This is directly analogous to the `DECISIONS_WARRANTED` trailer, which v1.1 resolved (§3.1, OQ-03 closed). The VERDICT trailer resolution determines: (a) which files are modified in Phase 1 vs. Phase 2, (b) whether interactive callers of `se-review`/`te-review`/`pm-review` begin emitting trailers before the workflow is deployed, and (c) the TSPEC's scope boundary between SKILL.md changes and workflow-script-only changes. REQ-COMPAT-01 says the three review skills "SHALL each receive an additive instruction" to append the trailer, which could be read as either mechanism. The TSPEC cannot safely define the implementation boundary without this being settled at the FSPEC level. OQ-03 was resolved in this same v1.1 pass — OQ-02 should be resolved in the same way. | §9 OQ-02, REQ-COMPAT-01, REQ-COMPAT-03 |
| F-02 | Medium | Local | **§1.7's unconditional log emission diverges from REQ-PIPELINE-03's stated behavioral intent.** v1.1 specifies: "A fresh start at iteration 1 also emits `'Resuming from iteration 1'`." REQ-PIPELINE-03 states: "The script emits `log('Resuming from iteration N')` when **it detects it is continuing an in-progress loop**." The REQ frames this as a conditional signal (emitted on resume detection); the FSPEC changes it to unconditional emission (emitted on every iteration start). This is a behavioral divergence that must be explicitly reconciled. Either: (a) the FSPEC documents that the REQ wording is superseded by the implementation choice and explains the trade-off (no cache-state query API, unconditional log is the implementation), or (b) the REQ is updated before TSPEC authoring. As-is, a TSPEC author treating the REQ as the normative source would implement conditional logic that the FSPEC's implementation note contradicts. Additionally, AT-RESUME-01 (added in v1.1) tests only the interrupted-run case. The fresh-iteration-1 case — where the log emits "Resuming from iteration 1" on a non-resumed run — has no acceptance test, meaning the unconditional semantics are not covered. | §1.7, REQ-PIPELINE-03, AT-RESUME-01 |
| F-03 | Medium | Local | **§4.5 does not specify whether the runtime's `isolation: "worktree"` auto-merges worktrees on agent completion or leaves them for the script to merge.** §4.5 step 1 passes `isolation: "worktree"` to `parallel()`. Step 4 specifies the script executes `git merge --no-ff` to merge each worktree back. If the runtime auto-merges worktrees when agents complete (which would be a reasonable interpretation of `isolation: "worktree"` semantics), the script's explicit `git merge --no-ff` would operate on an already-merged worktree — either a no-op, a double-merge, or an error. If the runtime does not auto-merge, the script's merge is the sole mechanism. The FSPEC must explicitly state the assumed runtime behavior: "The runtime does not auto-merge worktrees on agent completion; worktrees remain available for the script to merge via explicit `git merge` calls." Without this, the TSPEC author cannot determine whether the merge logic belongs in the workflow script or whether it is a runtime concern. This is particularly important because the existing SKILL.md and the REQ's `isolation: "worktree"` assumption (REQ Assumptions §A2) do not address auto-merge semantics. | §4.5 steps 1, 4; REQ Assumptions A2 |
| F-04 | Low | Local | **§2.3 WARNING log format still uses `<skill-name>` angle-bracket notation, inconsistent with all other error message templates in v1.1.** §2.3 specifies: `"WARNING: reviewer <skill-name> returned no VERDICT — treating as Needs revision"`. Every other error/log message template added or updated in v1.1 uses curly-brace `{placeholder}` notation: §0.2 (`{skill}`, `{output-path}`, `{phase}`), §7.2 (`{docPath}`, `{phase}`), §7.4 (`{optimizer-skill}`, `{phase}`, `{N}`, `{docPath}`), §5.4 (`{blocked-file-path}`), §1.9 (`{phase}`). AT-LOOP-04 references this message format in its assertion. A test implementor writing regex or literal assertions across all halt/warning messages will have to special-case the `<>` format for §2.3 alone. This is a carry-over from v1 F-13 that was only partially resolved. | §2.3, AT-LOOP-04 |
| F-05 | Low | Local | **§4.6's absence-of-failure-marker pass rule accepts empty agent results as passing.** §4.6 states: "The batch passes if and only if no agent result contains a failure marker as defined above." If a `se-implement` agent returns an empty string or a result containing no text (e.g., a crash before any output is produced), no failure markers are present, so the agent is treated as passing. This contradicts the general principle in §7.3 (reviewer crash → treated as failure) and would allow silently bad implementations to proceed to merge and the test gate. The FSPEC should either specify a minimum output requirement for `se-implement` agents (e.g., a required completion signal), or state explicitly that empty or no-output results are treated as failures, consistent with the crash-treatment rule applied to reviewer agents. | §4.6, §7.3 |
| F-06 | Low | Local | **OQ-04 (REQ-NFR-01 formula discrepancy: 7 vs 8 review phases) remains open without a resolution path.** The FSPEC flags this but defers it to the REQ. The pipeline has 8 defined review phases: R, F, T, D, P, PR, CR (§6.2 table), with Phase CR explicitly counted per §4.8's final sentence. REQ-NFR-01 uses 7 in its worst-case formula. The cap compliance conclusion is unchanged (8 × 15 + overhead remains well under 1,000), but the published formula is incorrect. The TSPEC will cite REQ-NFR-01 as the compliance basis; if the formula is wrong, the analytical verification is unsound. The FSPEC should add a note that the REQ formula must be corrected before TSPEC authoring, or carry the corrected formula as a FSPEC-level clarification. | §9 OQ-04, REQ-NFR-01 |

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | §4.5 step 6 says "merging proceeds worktree-by-worktree in PLAN document order" and step 5 says "subsequent worktrees in the same batch are not merged" after a conflict is detected. Does the script attempt to start merging subsequent worktrees before halting (and then stop when it encounters the conflict), or does it halt immediately after aborting the first conflicting merge without attempting any subsequent merges? Making this explicit removes an implementation ambiguity. |
| Q-02 | §0.2 step 4 says the creator agent failure halts. §0.2 step 5 says the §7.2 precondition check fires if the document is absent after a successful creator call. Is there a timing gap where the creator agent succeeds (no failure signal), commits to a worktree branch, but the document is not yet visible on the feature branch when `reviewLoop`'s precondition check runs? This would only occur if doc-creation phases used worktree isolation. A note in §0.2 confirming that creator agents use direct-commit (per REQ Assumptions §A2) would close this edge case. |
| Q-03 | §1.9 step 1 invokes the POSTMORTEM-writing agent via an inline instruction string. Does the dynamic workflow runtime's `agent()` primitive support arbitrary instruction strings as the agent prompt, or must it reference a named skill? This carries over from v1 Q-04. The TSPEC cannot finalize the POSTMORTEM agent call design without this. |

---

## Positive Observations

- All three High findings from v1 (F-01, F-02, F-03) are cleanly resolved. §0 (FSPEC-DISPATCH) is a substantial and well-structured addition: the Phase Dispatch Table is the single authoritative source for phase-to-reviewer-and-optimizer mapping, and the creator invocation rules (§0.2) cover skill, inputs, expected output, and both failure paths.
- The §2.2 parsing algorithm rewrite from regex to explicit split-and-iterate is a significant improvement in implementability. Steps 1–8 are now fully algorithmic and unambiguous about iteration strategy, case-sensitivity, and extraction sequence. A developer can implement this without referring to external specifications.
- §4.5's merge specification (steps 4–6) resolves what was the most implementation-blocking gap in v1. The explicit `git merge --no-ff` call, per-worktree sequencing, `git merge --abort` on conflict, and exact error message are sufficient for independent implementation.
- §2.3's truncated-output special case (VERDICT line present, no subsequent non-empty line → accept verdict, zero counts) is a well-reasoned design decision. It prevents spurious fallback on truncated agent output while preserving the parse correctness guarantee for the JSON. AT-VERDICT-05 tests this exactly.
- The `PHASE_H_ENABLED` compile-time flag in §5.1 converts a prose caveat from the SKILL.md into a testable, code-reviewable behavioral rule with specific observable outputs. This is the correct abstraction: a named flag that can be flipped once, with all effects fully specified.
- OQ-03 resolution (§3.1) establishes a clear, documented pattern for additive workflow-scoped return value conventions. Applying the same resolution to OQ-02 (F-01 above) would complete the pattern symmetrically.

---

## Recommendation

**Approved with minor changes**

All v1 High and Medium findings are resolved. The remaining findings are Medium (F-01, F-02, F-03) and Low (F-04, F-05, F-06). None introduce new blocking defects. The three Medium findings should be resolved before TSPEC authoring begins:

- **F-01:** Resolve OQ-02 by specifying whether the VERDICT trailer is baked into reviewer SKILL.md files or injected by the workflow script — apply the same resolution mechanism used for OQ-03 in §3.1.
- **F-02:** Reconcile §1.7's unconditional log with REQ-PIPELINE-03's conditional-detection wording; add an acceptance test for the fresh-iteration-1 log emission case.
- **F-03:** Add one sentence to §4.5 confirming that `isolation: "worktree"` does not auto-merge worktrees on agent completion, so the script's `git merge --no-ff` is the sole merge mechanism.

`VERDICT: Approved with minor changes`
`{"high": 0, "medium": 3, "low": 3}`
