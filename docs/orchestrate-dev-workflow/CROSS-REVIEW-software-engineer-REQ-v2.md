# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** docs/orchestrate-dev-workflow/REQ-orchestrate-dev-workflow.md
**Date:** 2026-06-01
**Iteration:** 2
**Scope:** Technical feasibility, implementability of acceptance criteria, non-functional requirements completeness, missing technical constraints, architectural correctness given the dynamic workflow runtime model. Focus: adequacy of F-01 through F-09 resolutions from Iteration 1, and new issues introduced by v1.1 changes.

---

## Prior Findings Resolution Status

| Prior ID | Severity | Resolution |
|----------|----------|-----------|
| F-01 | High | **Resolved.** REQ-COMPAT-01 now defines the normative VERDICT format with exact casing, consecutive-line constraint, no-intervening-text rule, JSON key schema, and malformed-output fallback. REQ-GATE-01 explicitly cross-references REQ-COMPAT-01 as the shared data contract. |
| F-02 | High | **Resolved.** REQ-PIPELINE-03 now specifies runtime-provided per-agent caching as the mechanism, states iteration count does not restart on resume, requires a verifiable `"Resuming from iteration N"` log entry, and explicitly scopes this as a runtime guarantee with no script-level caching layer. |
| F-03 | High | **Resolved.** REQ-COMPAT-02 adds a concrete verifiable scenario specifying the guard hook's PreToolUse firing, the non-zero exit propagation chain, and the observable halt condition. |
| F-04 | High | **Resolved.** REQ-GATE-02 now specifies: the `decisionsWarranted` boolean from the TSPEC author return value, the skip log message, the final report representation (`Phase D: ⏭ Skipped`), and that the script branches entirely outside `reviewLoop` for the skip case. |
| F-05 | Medium | **Partially resolved.** A worst-case formula is now present in REQ-NFR-01. However the formula contains a counting error — see F-13 below. |
| F-06 | Medium | **Resolved.** REQ-GATE-03 now includes a fallback mechanism: if `log()` does not surface structured data, a `phase()` label is used instead. |
| F-07 | Medium | **Resolved.** REQ-ARTIFACTS-02 now specifies the full error propagation chain (hook non-zero → agent Bash non-zero → agent result contains error message → script halts with named failure). |
| F-08 | Medium | **Partially resolved.** The Scope section now distinguishes the canonical plugin source (`pdlc/workflows/`) from the runtime-loaded copy (`.claude/workflows/`) and states the plugin source is the single source of truth. However the sync mechanism ("generated/updated from it") remains unspecified — see F-14 below. |
| F-09 | Medium | **Resolved.** REQ-OBS-01 now explicitly conditions per-agent labeling on runtime API capability at implementation-authoring time, with phase-level labels as the fallback. |
| F-10 | Low | **Unresolved.** REQ-COMPAT-01 still does not specify whether the VERDICT trailer instruction lives permanently in each SKILL.md or is injected by the workflow script at invocation time. |
| F-11 | Low | **Unresolved.** REQ-GATE-04 still does not name which skill the POSTMORTEM-writing agent invokes. |
| F-12 | Low | **Resolved.** REQ-NFR-02 now says "returned by the workflow's top-level `return` statement" — the broken SKILL.md step-number reference has been removed. |

---

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-13 | Medium | Local | The worst-case agent count formula in REQ-NFR-01 undercounts by treating the final codebase review (Phase CR) as a single agent (+1) rather than a full `reviewLoop` that can run up to 5 iterations × 3 agents = 15 agents. The SKILL.md pipeline shows Phase CR is a two-reviewer evaluator-optimizer loop identical to the other review phases — it uses the same `reviewLoop` construct per REQ-GATE-02. Corrected formula: 1 (guard) + 8 phases × 5 × 3 = 120 (not 105) + 25 (impl) + 1 (PT) + 1 (harvest) + 9 POSTMORTEM agents (8 review phases) = ~157 worst case, not ~142. Additionally, the formula lists "up to 8 POSTMORTEM agents" but the "7 phases" line it references accounts for only 7 review phases — the POSTMORTEM count and the phase count are inconsistent with each other. The corrected total still clears the 1,000-agent cap with large margin, so the compliance conclusion is unchanged; but the formula is stated as "the analytical basis for the cap compliance acceptance criterion" and must be arithmetically correct. | REQ-NFR-01 |
| F-14 | Medium | Cross-Feature | The Scope section states the consumer copy at `.claude/workflows/orchestrate-dev.js` "is generated/updated from" the canonical plugin source at `pdlc/workflows/orchestrate-dev.js`, but no mechanism is specified for this sync: no install script, no hook, no CI step, no manual copy instruction. No acceptance criterion covers the sync path. A developer who installs the pdlc plugin into a consumer repo needs a specified procedure for how `.claude/workflows/orchestrate-dev.js` arrives and stays current. Without a concrete mechanism, the "single source of truth" claim is an intent statement rather than a structural guarantee, and the two files will drift on any update to the plugin. The REQ must either name the sync mechanism (e.g., a `pdlc install` script, a Makefile target, a post-install hook) or explicitly defer it to a named follow-on requirement with a concrete acceptance criterion. This is Cross-Feature because the plugin-source-to-runtime-copy pattern will apply to every future workflow-bearing plugin in this repo. | Scope (In Scope) |
| F-15 | Medium | Local | REQ-GATE-02 introduces a new data contract — the TSPEC author agent's return value SHALL include a boolean field `decisionsWarranted: true \| false` — but provides no normative format specification. The requirement does not specify whether this is a JSON object, a plain-text line, a specific key-name casing, or what the script does when the field is absent or malformed. This is the same class of defect that F-01 identified for the VERDICT contract; it was resolved for VERDICT via REQ-COMPAT-01 but no equivalent specification exists for `decisionsWarranted`. A missing or malformed `decisionsWarranted` field has an asymmetric consequence: defaulting to `true` forces an unnecessary DECISIONS phase; defaulting to `false` silently skips a warranted DECISIONS phase. The fallback behavior must be stated, and the format must be specified at REQ level so the TSPEC author skill prompt, the script parser, and any test for the conditional branch can be independently authored. | REQ-GATE-02 |
| F-16 | Low | Local | REQ-COMPAT-02's concrete verifiable scenario covers `guard-harvest-before-delete` but leaves `check-scope-field` (PostToolUse: Write\|Edit) without an equivalent. The acceptance criterion says `check-scope-field` "fires after any Write/Edit to a pdlc artifact" but does not specify what an observable "fires" means in the workflow agent context: does it produce output? issue a warning in the agent's context? block the tool call? Without a concrete observable for this hook, the criterion is not independently testable. Additionally, `nudge-consolidation` (SessionStart) behavior in the workflow context is unspecified — it is included in REQ-COMPAT-02's scope but has no verifiable scenario. SessionStart fires for the top-level user session; it is not clear whether it fires for each subagent session in a background workflow. If it does not fire during the workflow, the hook's inclusion in REQ-COMPAT-02 is misleading. | REQ-COMPAT-02 |
| F-17 | Low | Local | `resumeFromRunId` is referenced in REQ-PIPELINE-03 as a specific API parameter name, but Assumption A1 lists the verified runtime API surface as `agent()`, `parallel()`, `pipeline()`, `phase()`, `log()` — `resumeFromRunId` is absent. The same verification gap that Q-02 in Iteration 1 flagged remains: if the resume mechanism is invoked differently (a flag on the initial call, a separate `resume()` primitive, a different parameter name), the entire REQ-PIPELINE-03 implementation approach changes. Either add `resumeFromRunId` to A1 as a confirmed capability or explicitly reclassify REQ-PIPELINE-03 as contingent on a pre-implementation API verification step. | REQ-PIPELINE-03, Assumptions A1 |
| F-18 | Low | Local | Carried from Iteration 1 F-10 (unresolved): REQ-COMPAT-01 does not specify whether the VERDICT trailer instruction is a permanent addition to each reviewer SKILL.md or is injected by the workflow script at invocation time. Baking the trailer into SKILL.md means Ptah engine callers and interactive callers always receive the trailer appended to responses. Script-injecting the trailer keeps SKILL.md clean and isolates the change to the workflow execution path. Either choice is implementable but they have different maintenance implications across the two execution paths (workflow + Ptah engine). The intended location should be stated so the TSPEC does not make this architectural choice silently. | REQ-COMPAT-01, REQ-COMPAT-03 |
| F-19 | Low | Local | Carried from Iteration 1 F-11 (unresolved): REQ-GATE-04 does not name which skill the POSTMORTEM-writing agent invokes. The description says "the script SHALL invoke an agent" but the agent's skill configuration is unspecified. If the optimizer skill for the failing phase authors the POSTMORTEM, the content is produced from the optimizer's perspective (appropriate for "Best-Guess Root Cause"), but this must be explicitly stated so the TSPEC can specify the agent configuration without making an undocumented assumption. | REQ-GATE-04 |

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | REQ-GATE-02 states the `decisionsWarranted` boolean comes from the TSPEC author agent "after reviewing its own TSPEC cross-reviews." This implies the TSPEC author agent reads its own cross-reviews as part of the TSPEC authoring task. Is this within the current `se-author` skill scope, or does DECISIONS assessment require a separate agent invocation (e.g., a dedicated classification agent that reads the cross-reviews and returns only the boolean)? |
| Q-02 | The formula in REQ-NFR-01 includes "5 implementation agents × 5 batches = 25." Is 5 batches the assumed maximum for any feature, or is this an example? A feature with 3 tasks has 1 batch; a large feature could have more than 5 batches if tasks are parallelizable across more than 5 agents per batch. The formula should state the maximum number of batches it assumes and why. |
| Q-03 | REQ-COMPAT-02 lists all three hooks as in scope but no analysis is provided for `nudge-consolidation` behavior in the workflow context. Is the intent that this hook fires at most once (for the top-level session that launched the workflow), never fires during the workflow's background execution, or fires per subagent session? The answer determines whether the hook provides any value during a workflow run and whether it should be retained in REQ-COMPAT-02's scope. |

---

## Positive Observations

- The resolution of F-01 through F-04 is substantive and well-executed. REQ-COMPAT-01's normative VERDICT specification is now complete and correctly cross-referenced from REQ-GATE-01 and REQ-GATE-05. Adding REQ-GATE-05 as a dedicated requirement (rather than an inline note) was the right structural decision — it is independently referenceable and independently testable.
- The DECISIONS conditional branch specification in REQ-GATE-02 resolves the previously undefined branching behavior with the right design choices: a named return-value field rather than a file-read, an explicit bypass of `reviewLoop` for the skip case, and a named log message that can be asserted in a test.
- REQ-ARTIFACTS-02's error propagation chain (hook → agent Bash call → agent result → script halt with named failure) is now concrete enough to drive an integration test without TSPEC-level elaboration.
- REQ-NFR-02's reframing as a code-reviewable structural guarantee (inspect all `log()` call sites) is significantly more testable than the previous runtime-memory framing. This is the correct level of abstraction for a statically verifiable property.
- The partial-iteration reviewer failure behavior added to REQ-GATE-02 (treat crash as Needs revision, preserve other verdict, increment count) closes a real error-path gap and is now unambiguously specified.
- The traceability matrix is updated correctly — REQ-GATE-05 is properly traced to US-02 and US-05.

---

## Recommendation

**Approved with minor changes**

All four High findings from Iteration 1 (F-01 through F-04) have been resolved. No new High findings were identified in v1.1. The three new Medium findings (F-13, F-14, F-15) are corrections rather than blockers — none changes the architectural direction of the feature — and should be addressed in the same pass:

- **F-13:** Correct the worst-case agent count formula to count Phase CR as a full `reviewLoop` (8 phases, not 7) and reconcile the POSTMORTEM agent count with the phase count.
- **F-14:** Specify or defer (with a named follow-on) the mechanism for syncing `pdlc/workflows/orchestrate-dev.js` to `.claude/workflows/orchestrate-dev.js` in consumer repos.
- **F-15:** Add a normative format specification for the `decisionsWarranted` return value, matching the depth of REQ-COMPAT-01's VERDICT definition, including a stated fallback for a missing or malformed field.

The Low findings (F-16 through F-19) are housekeeping items that do not individually block FSPEC authoring but should be resolved to avoid deferring ambiguity into the TSPEC.

`VERDICT: Approved with minor changes`
`{"high": 0, "medium": 3, "low": 4}`
