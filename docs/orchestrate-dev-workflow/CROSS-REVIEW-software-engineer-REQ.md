# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** docs/orchestrate-dev-workflow/REQ-orchestrate-dev-workflow.md
**Date:** 2026-06-01
**Iteration:** 1
**Scope:** Technical feasibility, implementability of acceptance criteria, non-functional requirements completeness, missing technical constraints, architectural correctness given the dynamic workflow runtime model.

---

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-01 | High | Local | REQ-GATE-01 states gate decisions are made "solely from the return values of the reviewer agents (not from reading files on disk)" but no acceptance criterion specifies the exact VERDICT line format or the schema of the finding-count JSON the script must parse. If the reviewer skill appends `VERDICT: Approved with minor changes` and the script matches against `Approved`, the gate passes incorrectly. The return-value contract (casing, exact strings, JSON field names) must be specified in the REQ so REQ-COMPAT-01 and REQ-GATE-01 share a single ground truth. | REQ-GATE-01, REQ-COMPAT-01 |
| F-02 | High | Local | REQ-PIPELINE-03 (resumability) references `resumeFromRunId` as the mechanism but provides no acceptance criterion for what "already-completed agent calls do not re-execute" means for loop state. Specifically: if the workflow resumes mid-`reviewLoop`, does iteration count restart from 1? Does the optimizer re-run on already-addressed feedback? The per-agent caching model must be specified (or acknowledged as runtime-provided with no script-level guarantees) so the implementation does not silently violate the convergence loop invariant on resume. | REQ-PIPELINE-03 |
| F-03 | High | Cross-Feature | REQ-COMPAT-02 asserts all three hooks fire "identically in the workflow context as they do in interactive use" with no stated dependency on the Claude Code version or runtime capability. The `guard-harvest-before-delete` hook (PreToolUse: Bash) and `check-scope-field` hook (PostToolUse: Write\|Edit) only fire if workflow subagents run through the same tool pipeline as interactive sessions. The WORKFLOW-MIGRATION-PLAN notes agents run in `acceptEdits` and inherit the tool allowlist as a confidence assertion, but no acceptance criterion verifies this at the REQ level. If workflow agents run in a stripped-down execution context where hooks are not wired, REQ-COMPAT-02 silently breaks without any test catching it. A verifiable acceptance criterion is required: e.g., "the guard hook blocks a CROSS-REVIEW-* deletion triggered by a workflow agent on a branch that lacks LEARNINGS-*.md." | REQ-COMPAT-02 |
| F-04 | High | Local | REQ-GATE-02 requires "all review phases use the same `reviewLoop` construct" but the pipeline includes a conditional DECISIONS phase (Phase D in SKILL.md) that only runs if warranted. The reviewLoop contract does not address what happens when DECISIONS is skipped: does the phase appear in the `/workflows` view with a "skipped" label? Does the script still pass through a reviewLoop call with zero iterations, or does it branch outside the reviewLoop entirely? There is no acceptance criterion for the DECISIONS conditional branch in the context of the reviewLoop primitive. This is a missing behavioral specification that will force undocumented implementation choices during TSPEC. | REQ-GATE-02, REQ-PIPELINE-02 |
| F-05 | Medium | Local | REQ-NFR-01 specifies "a full feature pipeline SHALL stay well under the 1,000-agent-per-run cap" and estimates "under 100" for a typical feature. This bound is not calculated. The WORKFLOW-MIGRATION-PLAN cites "30–60 subagent invocations" for the current prose skill, but the workflow adds guard agents (REQ existence check), postmortem agents (one per non-converging phase, up to 8 phases), harvest agents, and potential per-batch merge agents. Worst case: 8 phases × 5 iterations × 3 agents (2 reviewers + 1 optimizer) = 120 + implementation batches. The REQ should state the worst-case formula so the 16-concurrent and 1,000-total caps can be verified analytically. | REQ-NFR-01 |
| F-06 | Medium | Local | REQ-GATE-03 specifies the batch plan is "emitted to the `/workflows` progress view via `log()`" before implementation begins. The REQ Assumptions list `log()` as an available runtime primitive, but the WORKFLOW-MIGRATION-PLAN explicitly warns "the exact in-script primitives are not yet published." If `log()` does not propagate structured data to the `/workflows` view, the US-07 observability guarantee cannot be met. The acceptance criterion should allow an alternative observability mechanism (e.g., phase label), or be explicitly conditioned on runtime capability verification at authoring time. | REQ-GATE-03, Assumptions |
| F-07 | Medium | Local | REQ-ARTIFACTS-02 requires the run to "halt with an error" if the guard hook blocks a deletion. This halt behavior requires the workflow script to detect that a workflow agent's Bash call was blocked by the hook's exit-2 response, as opposed to the agent simply not attempting the delete. There is no acceptance criterion specifying how error propagation from hook → agent → script is observed. The mechanism (agent return value, exception, non-zero exit code surfaced in the agent result) must be specified so the implementation can be verified. | REQ-ARTIFACTS-02, REQ-COMPAT-02 |
| F-08 | Medium | Cross-Feature | The REQ names `pdlc/workflows/orchestrate-dev.js` as the workflow script location (Scope/In Scope), but the Claude Code dynamic workflow convention saves scripts to `.claude/workflows/`. The WORKFLOW-MIGRATION-PLAN §8 explicitly flags this as an open item: "Plugins don't yet have a documented workflow-bundling path." Using `pdlc/workflows/` as a plugin-canonical path while the runtime loads from `.claude/workflows/` creates a dual-copy problem (which is source of truth? how is the runtime version kept in sync on clone?). This ambiguity will create drift between the plugin repo and the consumer's `.claude/` directory. The REQ must resolve this before TSPEC. | Scope (In Scope), Assumptions |
| F-09 | Medium | Local | REQ-OBS-01 requires "loop iteration numbers are shown for review phases" and per-agent labels (e.g., `review:se-review:REQ`) in the `/workflows` view. The REQ Assumptions list `phase()` as an available primitive but do not confirm that per-agent metadata labeling is achievable via the runtime API. If the runtime only exposes top-level phase labels and not per-agent descriptors, this acceptance criterion is unmet. The requirement should either be conditioned on confirmed API capability or downgraded to a best-effort observability goal with a fallback. | REQ-OBS-01, Assumptions |
| F-10 | Low | Process | REQ-COMPAT-01 specifies the VERDICT trailer format but does not state whether the trailer instruction belongs in the SKILL.md files as a permanent addition or should be injected by the workflow script at invocation time. Modifying SKILL.md makes the trailer visible to all callers (including Ptah engine and interactive use); injecting from the script keeps it isolated to the workflow path. Either choice is implementable but they have different maintenance implications. The REQ should state the intended location so the TSPEC does not need to make this call silently. | REQ-COMPAT-01, REQ-COMPAT-03 |
| F-11 | Low | Local | REQ-GATE-04 requires the postmortem to be written by "an agent" before the run halts but does not specify which skill that agent invokes. The WORKFLOW-MIGRATION-PLAN §7 suggests using the optimizer skill for this, but the optimizer is the authoring agent (pm-author, se-author, te-author depending on the phase) and writing a cross-phase meta-analysis postmortem may produce better output from a neutral or specialized prompt. The REQ should name the skill (or confirm "the optimizer skill for that phase") so the TSPEC can specify agent configuration correctly. | REQ-GATE-04 |
| F-12 | Low | Local | REQ-NFR-02 defines context isolation and references "Step 10 in SKILL.md" as the source of the final report. REQ-SKILL-01 will rewrite that document into a pointer/contract doc, eliminating the step numbering. This cross-reference will become a broken reference after SKILL.md is rewritten. The criterion should be self-contained rather than citing a step number in a document scheduled for rewrite. | REQ-NFR-02, REQ-SKILL-01 |

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | The Assumptions section (A1) states the runtime API exposes `agent()`, `parallel()`, `pipeline()`, `phase()`, `log()`. Has this API surface been verified against the installed version (≥ v2.1.154)? The WORKFLOW-MIGRATION-PLAN explicitly warns the exact primitives "are not yet published." If these do not match the actual runtime API, the entire implementation approach changes. Should A1 be reclassified as Risk R3 rather than an Assumption? |
| Q-02 | REQ-PIPELINE-03 specifies resumability via `resumeFromRunId`. Is this a confirmed Claude Code runtime API method, or is it assumed from general workflow documentation? It does not appear in the Assumptions list, suggesting it has not been verified yet. |
| Q-03 | The DECISIONS conditional branch (Phase D): since the script cannot read files directly (runtime constraint §3.1), how does the script determine whether DECISIONS is warranted? Today SKILL.md requires the orchestrator to read TSPEC cross-reviews and judge. In the workflow, must an agent return a boolean `decisionsWarranted: true/false`, or is this judgment embedded in the TSPEC creation agent's return value? This mechanism is not specified in the REQ. |
| Q-04 | REQ-COMPAT-03 states the workflow will NOT route through `tech-lead` or `tech-lead-python`. The workflow script will absorb DAG parsing and topological batching logic. Will this logic be duplicated from the tech-lead SKILL.md, or will the tech-lead SKILL.md itself be updated to remain the single source of truth for the batching algorithm? |
| Q-05 | The Scope section lists `pdlc/workflows/orchestrate-dev.js` as the output file. Is `.js` confirmed as the workflow script format? The runtime documentation in the WORKFLOW-MIGRATION-PLAN refers to it as a "JavaScript script" but also notes the exact primitives are unpublished. Has the file extension and module format (ESM vs CJS, `async function main()` entrypoint vs other) been confirmed? |

---

## Positive Observations

- The REQ correctly identifies and resolves the three binding runtime constraints (no script FS access, no mid-run user input, no subagent nesting) before engineering begins. Discovering these at TSPEC or implementation would be much more expensive.
- The VERDICT trailer (REQ-COMPAT-01) is a clean, backward-compatible solution to the gate-from-return-value constraint. The existing `Recommendation:` line in review skills makes the addition minimal.
- The decision to auto-approve the batch plan (REQ-GATE-03) with `log()`-based observability is the right call for unattended end-to-end execution. Documenting the two-workflow split as a known alternative rather than silently discarding it is good practice.
- The `reviewLoop` primitive (REQ-GATE-02) replacing copy-pasted per-phase loop logic is a quality improvement — six manually written gate/loop blocks in the current SKILL.md become one reusable function. This reduces drift risk as the pipeline evolves.
- REQ-COMPAT-03's decision to keep `tech-lead` and `tech-lead-python` in the repo for standalone and Ptah-engine use is correct and avoids breaking existing consumers.
- The traceability matrix is complete: every user story maps to at least one requirement, and all requirements trace back to a user story.

---

## Recommendation

**Needs revision**

The four High findings must be addressed before this REQ can gate into FSPEC:

- **F-01:** Define the VERDICT return-value contract (exact strings, casing, JSON schema) as a shared specification that both REQ-GATE-01 and REQ-COMPAT-01 reference. This is the load-bearing data contract for the entire gate mechanism.
- **F-02:** Specify what resumability means for `reviewLoop` state: does the runtime guarantee per-agent call caching across a `resumeFromRunId`, and if so, does iteration count persist? Explicitly scope this as a runtime guarantee or a script-managed invariant.
- **F-03:** Add a concrete, verifiable acceptance criterion to REQ-COMPAT-02 confirming that PreToolUse and PostToolUse hooks fire on workflow agent tool calls (e.g., a scenario-level test: guard hook blocks deletion triggered by a workflow agent on a branch without LEARNINGS).
- **F-04:** Add a behavioral specification for the DECISIONS conditional branch: what the skipped case looks like in the `/workflows` view, how it is represented in the final report, and whether it passes through the `reviewLoop` primitive or branches outside it entirely.

`VERDICT: Needs revision`
`{"high": 4, "medium": 5, "low": 3}`
