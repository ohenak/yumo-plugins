---
Status: Draft
Author: pm-author
Version: 1.0
Feature: orchestrate-dev-workflow
---

| Field | Value |
|---|---|
| Upstream | REQ → **FSPEC** |
| Downstream | TSPEC, PROPERTIES |
| Scope | Behavioral flows for: reviewLoop mechanics, VERDICT trailer parsing, DECISIONS conditional, implementation phase DAG execution, harvest ordering, and all named error paths |
| Cross-Reviews | — |
| LEARNINGS | docs/orchestrate-dev-workflow/LEARNINGS-orchestrate-dev-workflow.md |

# FSPEC — orchestrate-dev-workflow

Functional specification for the behavioral rules, branching logic, and business contracts that engineers must not decide alone when implementing `orchestrate-dev.js` as a dynamic workflow.

---

## Scope of This Document

This FSPEC covers five behavioral subsystems and their error paths:

1. **`reviewLoop`** — entry, parallel reviewer dispatch, verdict checking, optimizer invocation, iteration counting, resume behavior, 5-iteration cap, and POSTMORTEM branch
2. **VERDICT trailer contract** — exact parsing rules, malformed/absent VERDICT handling, and script branching on each verdict value
3. **DECISIONS conditional** — how `decisionsWarranted` is determined, format spec, missing-field fallback, skip vs. full path, and `/workflows` representation
4. **Implementation phase** — PLAN DAG parsing, topological batching, batch plan logging, parallel `se-implement` dispatch, per-batch test gate, and halt on failure
5. **Harvest phase** — LEARNINGS write ordering, guard hook interaction, and halt on guard block

Error flows specific to each subsystem are embedded within the relevant section. Cross-cutting error flows (REQ path missing/unparseable, general agent crash propagation) are in §7.

---

## 1. FSPEC-LOOP: `reviewLoop` Behavior

**Linked requirements:** REQ-GATE-01, REQ-GATE-02, REQ-GATE-04, REQ-GATE-05, REQ-PIPELINE-03

### 1.1 Entry Conditions

`reviewLoop` is the single reusable construct invoked for every review phase. It accepts:

| Parameter | Type | Description |
|---|---|---|
| `phase` | string | Phase label (e.g., `"R"`, `"F"`, `"T"`, `"D"`, `"P"`, `"PR"`, `"CR"`) |
| `docPath` | string | Path to the document under review |
| `reviewers` | array[skill] | Exactly two reviewer skills to dispatch in parallel |
| `optimizer` | skill | The optimizer skill to invoke on failure |
| `featureName` | string | Feature name extracted from the REQ path |

Entry precondition: the upstream document at `docPath` exists and has been committed on the feature branch. If the document is absent, `reviewLoop` does not start — control returns to the caller with a halt error (see §7.2).

### 1.2 Parallel Reviewer Dispatch

On each iteration:

1. Both reviewer agents are dispatched **in parallel** via `parallel()`.
2. Each reviewer receives the `docPath` and a skill-specific scope instruction.
3. The script waits for both agents to complete before inspecting results.
4. Results are held in script-local variables (never passed to `log()` as content).

**Partial failure during dispatch:** If one reviewer agent crashes or times out before returning a result, its result is treated as if it returned a bare `Needs revision` verdict with no findings count (see §2.3 — Missing/crashed reviewer handling). The other reviewer's result is preserved. Dispatch of the second reviewer is not retried.

### 1.3 Verdict Inspection

After both agents complete, the script extracts the `VERDICT:` value from each agent's result per the parsing rules in §2. The script then evaluates the combined gate state:

| Condition | Gate State |
|---|---|
| Both verdicts are `Approved` or `Approved with minor changes` | **PASS** |
| Either verdict is `Needs revision` | **FAIL** |
| Either verdict is missing or malformed | **FAIL** (treated as `Needs revision` per §2.3) |

### 1.4 On PASS

The loop exits. Execution continues with the next pipeline phase. The phase is recorded in the final report as `✅ Approved (N iterations)`.

### 1.5 On FAIL — Optimizer Invocation

1. The script invokes the optimizer skill for this phase.
2. The optimizer reads all cross-review files for this doc type (all versioned suffixes up to the current iteration).
3. The optimizer addresses all High and Medium findings and updates the document in place.
4. The optimizer commits and pushes before returning.
5. If the optimizer agent fails (crashes, non-zero exit, or returns an error signal), the pipeline halts — see §7.4.
6. The iteration counter increments and the loop returns to §1.2.

### 1.6 Iteration Counting and Version Suffixes

- Iteration 1 produces cross-review files with no version suffix: `CROSS-REVIEW-{skill}-{doc-type}.md`
- Iteration 2 produces `-v2` suffix; iteration N produces `-vN` suffix for N ≥ 2.
- The iteration counter is a script-local variable initialized to 1 at loop entry.
- The counter increments after every optimizer invocation (i.e., after every FAIL gate), before the next parallel dispatch.
- The optimizer always reads all versions (no-suffix through current `-vN`) before addressing feedback.

### 1.7 Resume Behavior Inside a Loop

When a run is resumed from a `runId` after interruption mid-loop:

1. The runtime returns cached results for all completed agent calls; those calls do not re-execute.
2. The script continues executing from the first incomplete agent call.
3. The iteration counter does **not** reset to 1.
4. When the script detects it is continuing an in-progress loop (i.e., cached results exist for some but not all agents in the current iteration), it emits:
   ```
   log("Resuming from iteration N")
   ```
   where `N` is the current iteration number (the iteration that was active when the run was interrupted, not the next iteration to execute).

Resume behavior for implementation phase batches and the harvest phase follows the same runtime per-agent caching guarantee: completed agent calls are not re-executed regardless of which phase was interrupted.

### 1.8 5-Iteration Cap

- The loop runs a maximum of 5 iterations.
- If the iteration counter would exceed 5 and the gate state is still FAIL, the script does **not** invoke the optimizer again.
- Instead, it branches to the POSTMORTEM path (§1.9) before halting.

### 1.9 POSTMORTEM Branch (Non-Convergence)

Trigger: iteration counter reaches 5 and gate state is FAIL.

1. The script invokes the **phase optimizer skill** as a POSTMORTEM-writing agent with the following instruction:

   > Write `docs/{featureName}/POSTMORTEM-{phase}-{featureName}.md`. Include the required sections: Phase, Iterations (5 — limit reached), Reviewers, Pattern of Disagreement, Best-Guess Root Cause, Recommendation. Read all cross-review files for this phase (all versioned suffixes) to identify unresolved findings. Commit and push.

2. If the POSTMORTEM-writing agent itself fails, the script halts without a POSTMORTEM artifact and the final report notes: `"WARNING: POSTMORTEM agent failed — artifact not written for phase {phase}"`. The pipeline still halts; it does not retry.

3. After the POSTMORTEM is committed (or after the failure note is recorded), the workflow halts.

4. The final report includes:
   - Which phase failed to converge
   - Which reviewers did not approve in iteration 5
   - All unresolved High and Medium findings surfaced in iteration 5's cross-reviews
   - The path of the POSTMORTEM file (or the failure note if the agent failed)

---

## 2. FSPEC-VERDICT: VERDICT Trailer Contract

**Linked requirements:** REQ-COMPAT-01, REQ-GATE-01, REQ-GATE-05

### 2.1 Normative Format

The VERDICT trailer is the last content in a reviewer agent's final message. The exact format:

```
VERDICT: <verdict-value>
{"high": N, "medium": N, "low": N}
```

Rules:

| Rule | Requirement |
|---|---|
| `VERDICT:` is the literal prefix on its own line | Required |
| `<verdict-value>` is one of three exact strings | `Approved`, `Approved with minor changes`, `Needs revision` (case-sensitive) |
| The JSON object appears on the **immediately following line** | Required |
| No text between the VERDICT line and the JSON line | Required |
| The JSON object uses exactly the keys `high`, `medium`, `low` | Required |
| All N values are non-negative integers | Required |
| No additional JSON keys are present | Required |
| A trailing newline after the JSON object is **permitted** | Parsers must not anchor to end-of-string; a trailing `\n` is not an error |

### 2.2 Parsing Algorithm

The script uses the following extraction algorithm against the `result` string returned by each `agent()` call (not against any file on disk):

1. Find the **last occurrence** of a line matching `/^VERDICT:\s+(.+)$/` in the result string. Using the last occurrence handles any intermediate VERDICT mentions in the cross-review body.
2. Extract the captured group as the raw verdict string.
3. Trim leading and trailing whitespace from the raw verdict string.
4. Check that the trimmed value is exactly one of: `Approved`, `Approved with minor changes`, `Needs revision`. Comparison is case-sensitive.
5. Read the line immediately following the VERDICT line (no blank lines permitted between them).
6. Parse that line as JSON. Validate that the parsed object has exactly the keys `high`, `medium`, `low` with non-negative integer values and no other keys.
7. If all checks pass: return the verdict value and the findings counts as structured data.

### 2.3 Missing, Malformed, or Crashed Reviewer Handling

Any of the following conditions triggers the **fallback path**:

| Condition | Description |
|---|---|
| No `VERDICT:` line found | Agent output contains no line starting with `VERDICT:` |
| Wrong casing | Verdict string casing does not exactly match one of the three valid values |
| Intervening text | One or more non-empty lines exist between the VERDICT line and the JSON line |
| Missing JSON | No JSON object on the line following the VERDICT line |
| Invalid JSON | The following line is not valid JSON |
| Wrong JSON keys | The JSON object has keys other than exactly `high`, `medium`, `low` |
| Negative values | Any N value is negative |
| Agent crash / timeout | The agent call threw an exception or timed out before returning |

Fallback behavior for **every** condition above:

1. Treat the verdict as `Needs revision`.
2. Emit a `log()` warning in exactly this format:
   ```
   WARNING: reviewer <skill-name> returned no VERDICT — treating as Needs revision
   ```
   where `<skill-name>` is the reviewer's skill identifier (e.g., `se-review`, `te-review`, `pm-review`).
3. Do **not** crash or stall the pipeline.
4. Increment the iteration counter and invoke the optimizer as normal.

The JSON-malformed path is explicitly covered: a `VERDICT: Approved` line followed by `{high: 0}` (invalid JSON) triggers the fallback — the presence of a parseable VERDICT line is not sufficient; the JSON must also be valid.

### 2.4 Script Branching on Each Verdict Value

| Verdict | Script Action |
|---|---|
| `Approved` | Counts as a passing vote for this reviewer |
| `Approved with minor changes` | Counts as a passing vote for this reviewer |
| `Needs revision` | Counts as a failing vote; triggers optimizer if gate state is FAIL |
| Fallback (malformed/absent) | Treated as `Needs revision`; warning logged |

Gate state is FAIL if **either** reviewer's vote is failing. Gate state is PASS only when **both** reviewers' votes are passing.

---

## 3. FSPEC-DECISIONS: DECISIONS Conditional Branch

**Linked requirements:** REQ-GATE-02, REQ-COMPAT-03

### 3.1 How `decisionsWarranted` Is Determined

After the TSPEC review loop passes (both reviewers approve), the script invokes the `se-author` agent to address the TSPEC cross-review findings and finalize the TSPEC. This same agent invocation also assesses whether a DECISIONS document is warranted by examining the cross-review content.

**The `decisionsWarranted` return value format (normative):**

The `se-author` TSPEC optimizer agent ends its final message with a DECISIONS assessment trailer:

```
DECISIONS_WARRANTED: <value>
```

- `<value>` is exactly one of: `true`, `false` (lowercase, no quotes)
- The line appears after the agent's prose summary and before any commit confirmation
- No JSON object is required; this is a single-line trailer

**Parsing:** The script finds the last occurrence of a line matching `/^DECISIONS_WARRANTED:\s+(true|false)$/i` and treats the value case-insensitively (`True`, `TRUE`, `true` are all accepted as `true`; `False`, `FALSE`, `false` as `false`).

**Missing or malformed field:** If the TSPEC optimizer agent's result contains no `DECISIONS_WARRANTED:` line, or the value is not one of `true`/`false`, the script treats the field as `true` (safe default — include DECISIONS rather than silently skip it). The script emits:
```
log("WARNING: DECISIONS_WARRANTED field absent or malformed — defaulting to true")
```

**Compatibility note:** This trailer is an additive return convention for the TSPEC optimizer invocation only. It does not change the TSPEC document on disk. The `se-author` skill is otherwise behaviorally unchanged; only the TSPEC-optimizer invocation within this workflow appends the assessment trailer.

### 3.2 Skip Path (`decisionsWarranted = false`)

When `decisionsWarranted` is `false`:

1. The script **does not** enter `reviewLoop` for Phase D.
2. The script does **not** create a DECISIONS document.
3. The script emits:
   ```
   log("Phase D skipped — no load-bearing alternatives")
   ```
4. In the `/workflows` progress view, Phase D appears as a `phase()` label: `"Phase D: ⏭ Skipped"`.
5. In the final report, Phase D is listed as: `Phase D: ⏭ Skipped`.
6. Execution continues immediately to Phase P (PLAN creation).

### 3.3 Full Path (`decisionsWarranted = true`)

When `decisionsWarranted` is `true`:

1. The script invokes `se-author` to create `docs/{featureName}/DECISIONS-{featureName}.md`.
2. The DECISIONS document is committed and pushed before reviews begin.
3. The script enters `reviewLoop` for Phase D with:
   - Reviewers: `pm-review`, `te-review`
   - Optimizer: `se-author`
   - Cross-review output files: `CROSS-REVIEW-product-manager-DECISIONS[-vN].md`, `CROSS-REVIEW-test-engineer-DECISIONS[-vN].md`
4. The same 5-iteration cap and POSTMORTEM path applies (see §1.8, §1.9).
5. On loop PASS, execution continues to Phase P.

### 3.4 `/workflows` Representation

| Path | `phase()` label | `log()` entries |
|---|---|---|
| Skip | `"Phase D: ⏭ Skipped"` | `"Phase D skipped — no load-bearing alternatives"` |
| Full | `"Phase D: DECISIONS Review"` | Iteration numbers per §1.2 pattern |

---

## 4. FSPEC-IMPL: Implementation Phase

**Linked requirements:** REQ-GATE-03, REQ-NFR-01, REQ-PIPELINE-02, REQ-COMPAT-03

### 4.1 Entry Condition

Phase I begins after PROPERTIES are approved (PROPERTIES `reviewLoop` has passed). The `docs/{featureName}/PLAN-{featureName}.md` and `docs/{featureName}/PROPERTIES-{featureName}.md` files must both exist on the branch.

### 4.2 PLAN DAG Parsing

The script reads `PLAN-{featureName}.md` and extracts the task table. Each task record contains:

| Field | Source |
|---|---|
| Task ID | The unique identifier in the PLAN task table |
| Description | Task description |
| Dependencies | Comma-separated list of task IDs this task depends on |
| Phase/batch hint | If the PLAN already groups tasks, this is advisory — the script re-derives batches from dependencies |

The dependency graph is treated as a DAG (directed acyclic graph). If the PLAN's stated groupings are inconsistent with the dependency edges (e.g., a task in batch 2 depends on a task also in batch 2), the script uses the dependency-derived order, ignoring the PLAN's batch labels.

### 4.3 Topological Batching

The script performs a topological sort to compute execution batches:

1. A task is **ready** if all its dependencies have completed.
2. A **batch** is the maximal set of ready tasks at each step of the sort.
3. Batches are numbered from 1.
4. A single batch contains at most 5 tasks (the `se-implement` agent fan-out cap). If a batch would contain more than 5 ready tasks, the script splits it into sub-batches of up to 5, preserving topological ordering within each sub-batch.

**Example:** 8 tasks, all ready at step 1 → sub-batch 1a (5 tasks), sub-batch 1b (3 tasks), both run before any dependent tasks.

### 4.4 Batch Plan Logging

Before dispatching any `se-implement` agent, the script emits the computed batch plan to the `/workflows` progress view:

```
log("Implementation batch plan:")
log("  Batch 1: [task-id-1, task-id-2, task-id-3]")
log("  Batch 2: [task-id-4, task-id-5]  (depends on: Batch 1)")
log("  ...")
log("  Total: N tasks in M batches")
```

This log output appears **before** the first `agent()` call for any `se-implement` task. Developers can see the entire planned execution order in `/workflows` before any implementation begins.

The preferred mechanism is `log()`. If `log()` does not surface structured data in the `/workflows` view at implementation time, the fallback is a `phase()` label whose label text includes the batch summary (e.g., `"Phase I: Batch 1/3 — [task-1, task-2, task-3]"`).

### 4.5 Parallel `se-implement` Dispatch

For each batch:

1. All tasks in the batch are dispatched in parallel using `parallel()` with `isolation: "worktree"`.
2. Each `se-implement` agent receives:
   - The specific task row from the PLAN (task ID, description, dependencies)
   - Path to `TSPEC-{featureName}.md`
   - Path to `PROPERTIES-{featureName}.md`
3. The script waits for all agents in the batch to complete before evaluating the batch gate.
4. Worktrees are merged back to the feature branch after each batch completes (before the next batch dispatches).

Maximum concurrent agents per batch: **5** (enforced by the sub-batch splitting in §4.3).

### 4.6 Per-Batch Test Gate

After all agents in a batch complete and worktrees are merged:

1. The script inspects each agent's result for test failure signals.
2. A batch **passes** if all agents report test suite passing.
3. A batch **fails** if any agent reports test failure or a non-zero exit code.

**On batch failure:**

1. The script halts immediately — it does not dispatch subsequent batches.
2. The final report includes:
   - Which batch failed (batch number and task IDs)
   - Which `se-implement` agent(s) reported failure
   - The test failure summary from the failing agent's result
3. The pipeline does not proceed to Phase PT (PROPERTIES Tests).

**On batch pass:**

The script emits `log("Batch N complete — all tests passing")` and dispatches the next batch.

### 4.7 Phase PT: PROPERTIES Tests

After all implementation batches pass:

1. The script invokes a single `se-implement` agent to implement any PROPERTIES tests not yet covered.
2. The agent runs the full test suite; all tests must pass before committing.
3. If the test suite fails, the pipeline halts with the same halt behavior as §4.6 (batch failure).

### 4.8 Phase CR: Final Codebase Review

Phase CR uses the standard `reviewLoop` construct with:

- Reviewers: `pm-review`, `te-review`
- Optimizer: `se-author` (addresses implementation review feedback, not a document author)
- Document context: REQ acceptance criteria + PROPERTIES + current feature branch
- Cross-review output files: `CROSS-REVIEW-product-manager-IMPLEMENTATION[-vN].md`, `CROSS-REVIEW-test-engineer-IMPLEMENTATION[-vN].md`
- Same 5-iteration cap and POSTMORTEM path applies

Phase CR counts as one of the 8 review phases in the agent count formula (see REQ-NFR-01).

---

## 5. FSPEC-HARVEST: Harvest Phase

**Linked requirements:** REQ-ARTIFACTS-02, REQ-COMPAT-02

### 5.1 Entry Condition

Phase H begins after Phase CR `reviewLoop` passes. All `CROSS-REVIEW-*` and `POSTMORTEM-*` files written by worktree agents must have merged onto the feature branch before harvest reads them.

> **Gating prerequisite (carried from SKILL.md):** Do not enable Phase H until the feature-branch-consistency fix has landed (artifacts written in worktrees must survive merge before harvest reads them). Until then, skip Phase H and leave cross-reviews in place.

### 5.2 LEARNINGS Write Ordering

The harvest agent MUST execute in this exact order:

1. Read all `CROSS-REVIEW-*.md` files (every doc type, every `-vN` suffix) for the feature.
2. Read all `POSTMORTEM-*.md` files for the feature (if any exist).
3. Write `docs/{featureName}/LEARNINGS-{featureName}.md`.
4. **Commit and push `LEARNINGS-{featureName}.md` first** — before any delete operation.
5. Only after the LEARNINGS commit is confirmed on the remote branch, delete the harvested `CROSS-REVIEW-*` files.
6. Commit and push the deletions.

This ordering is the **primary guarantee**. The guard hook is a second enforcement layer, not a substitute for prompt ordering.

### 5.3 Guard Hook Interaction

The `guard-harvest-before-delete` hook fires as PreToolUse on any Bash call that deletes a `CROSS-REVIEW-*` file.

**Hook success path (LEARNINGS exists):** The hook script finds `LEARNINGS-{featureName}.md` on the branch, exits zero, and the Bash call proceeds.

**Hook block path (LEARNINGS missing):** The hook script does not find `LEARNINGS-{featureName}.md` on the branch. The propagation chain is:

1. Hook script exits non-zero.
2. The harvest agent's Bash call exits non-zero.
3. The agent result contains the guard hook's error message text.
4. The workflow script detects the non-zero exit in the agent result.
5. The workflow script treats this as a halt condition.
6. The final report identifies the guard-triggered failure with the path of the blocked file.

### 5.4 Halt on Guard Block

When a guard block is detected:

1. The workflow halts immediately — it does not retry the deletion or attempt other deletions.
2. All `CROSS-REVIEW-*` files remain in place.
3. The `LEARNINGS-{featureName}.md` file (if partially written) also remains in place.
4. The developer must diagnose and resolve the ordering failure manually.
5. The final report states: `"Phase H halted: guard-harvest-before-delete blocked deletion of {blocked-file-path}"`.

---

## 6. FSPEC-ENTRY: Pipeline Entry and Initial Validation

**Linked requirements:** REQ-PIPELINE-01, REQ-PIPELINE-02

### 6.1 REQ Path Parsing

On invocation, the script receives the REQ path argument (e.g., `docs/postgres-storage/REQ-postgres-storage.md`).

**Validation steps:**

1. Check that the path argument is present and non-empty. If absent: halt immediately with `"Error: no REQ path provided. Usage: /pdlc:orchestrate-dev docs/{feature}/REQ-{feature}.md"`.
2. Check that the path matches the pattern `docs/{feature}/REQ-{feature}.md` (the feature name in the directory and filename must match). If pattern mismatch: halt with `"Error: REQ path does not match expected pattern docs/{feature}/REQ-{feature}.md — got: {provided-path}"`.
3. Attempt to read the file. If the file does not exist: halt with `"Error: REQ file not found at {path}"`.
4. Check that the file is non-empty. If empty: halt with `"Error: REQ file at {path} is empty"`.
5. Extract the feature name from the path. This is the string that appears in place of `{feature}`.

No further structural validation of the REQ document content is performed by the script — the reviews will surface any content issues.

### 6.2 Phase Sequence

The canonical phase execution order is:

| Phase | Label | Type | Condition |
|---|---|---|---|
| R | REQ Cross-Review | `reviewLoop` | Always |
| F | FSPEC Creation + Review | Create then `reviewLoop` | Always |
| T | TSPEC Creation + Review | Create then `reviewLoop` | Always |
| D | DECISIONS Creation + Review | Create then `reviewLoop` | Only if `decisionsWarranted = true` |
| P | PLAN Creation + Review | Create then `reviewLoop` | Always |
| PR | PROPERTIES Creation + Review | Create then `reviewLoop` | Always |
| I | Implementation | DAG batch dispatch | Always |
| PT | PROPERTIES Tests | Single agent | Always |
| CR | Final Codebase Review | `reviewLoop` | Always |
| H | Harvest | Single agent | Always (pending gating prerequisite) |

No phase may be skipped except Phase D (per the DECISIONS conditional in §3). No phase may be reordered.

---

## 7. FSPEC-ERRORS: Cross-Cutting Error Flows

**Linked requirements:** REQ-GATE-01, REQ-GATE-02, REQ-GATE-05, REQ-ARTIFACTS-02

### 7.1 REQ File Missing or Unparseable Path

Handled at entry per §6.1. The pipeline halts before any agent is dispatched.

### 7.2 Document Missing Before `reviewLoop` Entry

If the document to be reviewed does not exist on disk when `reviewLoop` is called:

1. The script does **not** dispatch any reviewer agents.
2. The pipeline halts with: `"Error: {docPath} does not exist — cannot enter reviewLoop for phase {phase}"`.
3. This typically indicates the creator agent (pm-author, se-author, te-author) failed to write or commit the document.

### 7.3 Reviewer Agent Crash Mid-Iteration

If a reviewer agent crashes or times out during an iteration:

1. The crashed reviewer's result is treated as `Needs revision` per §2.3.
2. The failure warning is logged per §2.3 format.
3. The other reviewer's result is preserved and evaluated normally.
4. The iteration count increments and the optimizer is invoked if gate state is FAIL.
5. The pipeline does **not** halt — it continues the loop.

Exception: if **both** reviewers crash in the same iteration, both are treated as `Needs revision`, the optimizer is invoked, and the iteration count increments. The 5-iteration cap still applies.

### 7.4 Optimizer Agent Failure

If the optimizer agent returns a non-zero exit code, throws an exception, or returns a result indicating failure:

1. The pipeline halts immediately.
2. The final report states: `"Error: optimizer agent {optimizer-skill} failed during phase {phase}, iteration {N} — pipeline halted. Document at {docPath} may be in an inconsistent state."`.
3. The pipeline does **not** attempt to re-run the optimizer.
4. The developer must inspect the document and resolve the optimizer failure manually.

Rationale: proceeding with a stale or partially-updated document produces compounding errors in downstream phases.

### 7.5 Hook-Block Propagation (General)

The `guard-harvest-before-delete` hook block is detailed in §5.3–5.4. General principle for any hook-triggered non-zero exit:

1. The hook's non-zero exit propagates to the agent's Bash call exit code.
2. The agent result is inspected for the hook's error message.
3. The script treats any hook-triggered non-zero exit as a halt condition unless a specific error-recovery path is defined for that hook.
4. The final report names the hook, the blocked tool call, and the file path involved.

### 7.6 `check-scope-field` Hook Behavior

The `check-scope-field` hook fires PostToolUse after any Write or Edit to a pdlc artifact. In the workflow context:

- The hook emits a warning if the `Scope:` field is missing from the artifact's header.
- The hook does **not** block the tool call (PostToolUse hooks are advisory, not blocking).
- The hook's warning appears in the agent's context and may be observed in the agent's output, but does not cause a pipeline halt.
- If the agent writes an artifact without a `Scope:` field, the hook warns and the pipeline continues.

### 7.7 `nudge-consolidation` Hook Behavior in Workflow Context

The `nudge-consolidation` hook fires on SessionStart. It fires once for the top-level user session that launched the workflow. It does **not** fire for each subagent session inside the background workflow — background workflow agents do not trigger SessionStart events. The hook's presence in REQ-COMPAT-02 confirms it is not bypassed for the top-level session; its non-firing inside the background workflow is expected and correct behavior.

---

## 8. Acceptance Tests

### AT-LOOP-01: Basic Pass on Iteration 1
- **Who:** Workflow script
- **Given:** Two reviewer agents both return `VERDICT: Approved` with valid JSON on iteration 1
- **When:** `reviewLoop` evaluates gate state
- **Then:** Loop exits after 1 iteration; no optimizer is invoked; phase recorded as `✅ Approved (1 iteration)`

### AT-LOOP-02: Optimizer Invoked on Single Failure
- **Who:** Workflow script
- **Given:** One reviewer returns `Approved`, one returns `Needs revision` on iteration 1
- **When:** Gate state is evaluated
- **Then:** Gate state is FAIL; optimizer is invoked; iteration counter becomes 2

### AT-LOOP-03: 5-Iteration Cap and POSTMORTEM
- **Who:** Workflow script
- **Given:** Both reviewers return `Needs revision` for all 5 iterations
- **When:** Iteration 5 completes with gate state FAIL
- **Then:** No 6th optimizer invocation; POSTMORTEM agent is invoked; workflow halts with POSTMORTEM path in final report

### AT-LOOP-04: Crash Treated as Needs Revision
- **Who:** Workflow script
- **Given:** One reviewer crashes mid-iteration (exception thrown); the other returns `Approved`
- **When:** Gate state is evaluated
- **Then:** Warning logged in the format `"WARNING: reviewer {skill} returned no VERDICT — treating as Needs revision"`; gate state is FAIL; optimizer invoked; iteration counter increments

### AT-VERDICT-01: Valid Approved Trailer Parsed
- **Who:** Workflow script (parser unit)
- **Given:** Agent result ends with `VERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`
- **When:** Parser runs
- **Then:** Returns `{ verdict: "Approved", high: 0, medium: 0, low: 0 }`; trailing newline does not cause parse failure

### AT-VERDICT-02: Wrong Casing Triggers Fallback
- **Who:** Workflow script (parser unit)
- **Given:** Agent result ends with `VERDICT: approved\n{"high": 0, "medium": 0, "low": 0}`
- **When:** Parser runs
- **Then:** Fallback triggered; treated as `Needs revision`; warning logged

### AT-VERDICT-03: Valid VERDICT with Invalid JSON Triggers Fallback
- **Who:** Workflow script (parser unit)
- **Given:** Agent result ends with `VERDICT: Approved\n{high: 0, medium: 0, low: 0}` (invalid JSON — unquoted keys)
- **When:** Parser runs
- **Then:** Fallback triggered; treated as `Needs revision`; warning logged

### AT-VERDICT-04: Intervening Text Triggers Fallback
- **Who:** Workflow script (parser unit)
- **Given:** Agent result contains `VERDICT: Approved\nSome other text\n{"high": 0, "medium": 0, "low": 0}`
- **When:** Parser runs
- **Then:** Fallback triggered; treated as `Needs revision`; warning logged

### AT-DECISIONS-01: Skip Path Logged and Reported
- **Who:** Workflow script
- **Given:** TSPEC optimizer returns `DECISIONS_WARRANTED: false`
- **When:** Script evaluates DECISIONS gate
- **Then:** `log("Phase D skipped — no load-bearing alternatives")` emitted; `reviewLoop` not called; Phase D appears as `⏭ Skipped` in final report; execution continues to Phase P

### AT-DECISIONS-02: Missing Field Defaults to True
- **Who:** Workflow script
- **Given:** TSPEC optimizer result contains no `DECISIONS_WARRANTED:` line
- **When:** Script evaluates DECISIONS gate
- **Then:** `log("WARNING: DECISIONS_WARRANTED field absent or malformed — defaulting to true")` emitted; `reviewLoop` for Phase D is entered

### AT-IMPL-01: Batch Plan Logged Before Dispatch
- **Who:** Developer observing `/workflows`
- **Given:** PROPERTIES are approved; PLAN contains 4 tasks with dependency edges
- **When:** Implementation phase begins
- **Then:** `log("Implementation batch plan: ...")` appears in `/workflows` before any `se-implement` agent is dispatched; plan correctly reflects topological ordering

### AT-IMPL-02: Batch Failure Halts Pipeline
- **Who:** Workflow script
- **Given:** Batch 1 dispatches 3 agents; one agent returns non-zero exit (test failure)
- **When:** Batch 1 gate is evaluated
- **Then:** Pipeline halts; Batch 2 is not dispatched; final report names the failing agent and task ID

### AT-HARVEST-01: LEARNINGS Written Before Delete
- **Who:** Harvest agent (ordering verifiable by log sequence)
- **Given:** Final codebase review approved; CROSS-REVIEW-* files exist on branch
- **When:** Phase H executes
- **Then:** LEARNINGS commit appears before any deletion commit in git log; guard hook does not fire for the LEARNINGS write

### AT-HARVEST-02: Guard Block Halts Pipeline
- **Who:** Workflow script
- **Given:** Harvest agent attempts to delete a CROSS-REVIEW-* file before LEARNINGS exists on branch
- **When:** guard-harvest-before-delete hook fires
- **Then:** Hook exits non-zero; agent Bash call exits non-zero; workflow halts; final report contains `"Phase H halted: guard-harvest-before-delete blocked deletion of {file-path}"`

### AT-ENTRY-01: Malformed Path Halts at Entry
- **Who:** Workflow script
- **Given:** Developer invokes `/pdlc:orchestrate-dev docs/my-feature/REQ.md` (missing feature name in filename)
- **When:** Script validates the path
- **Then:** Pipeline halts before dispatching any agent; error message states pattern mismatch with exact expected pattern

### AT-ENTRY-02: Missing File Halts at Entry
- **Who:** Workflow script
- **Given:** Developer invokes `/pdlc:orchestrate-dev docs/my-feature/REQ-my-feature.md` but the file does not exist
- **When:** Script reads the file
- **Then:** Pipeline halts before dispatching any agent; error message states `"REQ file not found at {path}"`

---

## 9. Open Questions

| ID | Question | Impact |
|----|----------|--------|
| OQ-01 | Does the workflow runtime's `resumeFromRunId` parameter name match what is assumed in REQ-PIPELINE-03, or is the resume mechanism invoked differently (e.g., a flag on the initial call, a separate primitive)? This should be verified against the live runtime before TSPEC authoring. | Affects TSPEC's resume interface specification |
| OQ-02 | Is the VERDICT trailer a permanent addition to each reviewer SKILL.md, or is it injected by the workflow script at invocation time? Baking it into SKILL.md means Ptah engine and interactive callers always receive the trailer; script-injection isolates it to the workflow path. | Affects which files change in Phase 1 vs. which are workflow-script-only changes |
| OQ-03 | The `decisionsWarranted` assessment is described as part of the TSPEC optimizer invocation. Is this the same `se-author` agent call that addresses TSPEC cross-review findings, or a separate dedicated call? A combined call is more efficient; a separate call is more testable. | Affects TSPEC agent configuration and Phase T agent count |
| OQ-04 | REQ-NFR-01's worst-case formula ("7 phases" in the original, Phase CR correction noted in CROSS-REVIEW-SE-REQ-v2 F-13) should be reconciled to "8 review phases" before TSPEC authoring. The compliance conclusion is unchanged; the formula should be corrected for accuracy. | Does not block FSPEC; should be resolved in REQ before TSPEC |
| OQ-05 | The sync mechanism for `pdlc/workflows/orchestrate-dev.js` → `.claude/workflows/orchestrate-dev.js` in consumer repos is unspecified in the REQ. This FSPEC defers that mechanism to an implementation decision. If a `pdlc install` script or similar is required, it should be scoped as a separate requirement before TSPEC authoring. | May require a new REQ entry; does not block FSPEC behavioral specification |

---

## Traceability

| FSPEC Section | Linked Requirements |
|---|---|
| §1 reviewLoop | REQ-GATE-01, REQ-GATE-02, REQ-GATE-04, REQ-GATE-05, REQ-PIPELINE-03 |
| §2 VERDICT Contract | REQ-COMPAT-01, REQ-GATE-01, REQ-GATE-05 |
| §3 DECISIONS Conditional | REQ-GATE-02, REQ-COMPAT-03 |
| §4 Implementation Phase | REQ-GATE-03, REQ-NFR-01, REQ-PIPELINE-02, REQ-COMPAT-03 |
| §5 Harvest Phase | REQ-ARTIFACTS-02, REQ-COMPAT-02 |
| §6 Pipeline Entry | REQ-PIPELINE-01, REQ-PIPELINE-02 |
| §7 Error Flows | REQ-GATE-01, REQ-GATE-02, REQ-GATE-05, REQ-ARTIFACTS-02, REQ-COMPAT-02 |
