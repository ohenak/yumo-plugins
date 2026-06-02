---
Status: Draft
Author: pm-author
Version: 1.3
Feature: orchestrate-dev-workflow
---

| Field | Value |
|---|---|
| Upstream | REQ → **FSPEC** |
| Downstream | TSPEC, PROPERTIES |
| Scope | Behavioral flows for: pipeline phase dispatch, reviewLoop mechanics, VERDICT trailer parsing, DECISIONS conditional, implementation phase DAG execution, harvest ordering, and all named error paths |
| Cross-Reviews | CROSS-REVIEW-software-engineer-FSPEC.md, CROSS-REVIEW-test-engineer-FSPEC.md, CROSS-REVIEW-software-engineer-FSPEC-v2.md, CROSS-REVIEW-test-engineer-FSPEC-v2.md, CROSS-REVIEW-software-engineer-FSPEC-v3.md, CROSS-REVIEW-test-engineer-FSPEC-v3.md |
| LEARNINGS | docs/orchestrate-dev-workflow/LEARNINGS-orchestrate-dev-workflow.md |

# FSPEC — orchestrate-dev-workflow

Functional specification for the behavioral rules, branching logic, and business contracts that engineers must not decide alone when implementing `orchestrate-dev.js` as a dynamic workflow.

---

## Scope of This Document

This FSPEC covers six behavioral subsystems and their error paths:

0. **Pipeline phase dispatch** — which creator agent is invoked for each phase, inputs, and expected outputs
1. **`reviewLoop`** — phase-to-reviewer mapping, entry, parallel reviewer dispatch, verdict checking, optimizer invocation, iteration counting, resume behavior, 5-iteration cap, and POSTMORTEM branch
2. **VERDICT trailer contract** — exact parsing rules, malformed/absent VERDICT handling, and script branching on each verdict value
3. **DECISIONS conditional** — how `decisionsWarranted` is determined, format spec, missing-field fallback, skip vs. full path, and `/workflows` representation
4. **Implementation phase** — PLAN DAG parsing, topological batching, batch plan logging, parallel `se-implement` dispatch, worktree merge-back, per-batch test gate, and halt on failure
5. **Harvest phase** — LEARNINGS write ordering, guard hook interaction, and halt on guard block

Error flows specific to each subsystem are embedded within the relevant section. Cross-cutting error flows (REQ path missing/unparseable, general agent crash propagation) are in §7.

---

## 0. FSPEC-DISPATCH: Pipeline Phase Dispatch

**Linked requirements:** REQ-PIPELINE-01, REQ-PIPELINE-02, REQ-GATE-02

This section specifies the creator agent invocation for every phase that requires document creation before a `reviewLoop` begins. Phase R (REQ review) has no creator call — the REQ is an input, not created by the workflow.

### 0.1 Phase Dispatch Table

| Phase | Creator Skill | Input(s) | Expected Output Path | reviewLoop Reviewers | Optimizer |
|-------|--------------|----------|---------------------|----------------------|-----------|
| R | _(none — REQ is the input)_ | — | — | `se-review`, `te-review` | `pm-author` |
| F | `pm-author` | `REQ-{feature}.md` | `docs/{feature}/FSPEC-{feature}.md` | `se-review`, `te-review` | `pm-author` |
| T | `se-author` | `REQ-{feature}.md`, `FSPEC-{feature}.md` | `docs/{feature}/TSPEC-{feature}.md` | `pm-review`, `te-review` | `se-author` |
| D | `se-author` | `REQ-{feature}.md`, `FSPEC-{feature}.md`, `TSPEC-{feature}.md` | `docs/{feature}/DECISIONS-{feature}.md` | `pm-review`, `te-review` | `se-author` |
| P | `se-author` | `REQ-{feature}.md`, `FSPEC-{feature}.md`, `TSPEC-{feature}.md`, `DECISIONS-{feature}.md` (if present) | `docs/{feature}/PLAN-{feature}.md` | `pm-review`, `te-review` | `se-author` |
| PR | `te-author` | `REQ-{feature}.md`, `FSPEC-{feature}.md`, `TSPEC-{feature}.md`, `PLAN-{feature}.md` | `docs/{feature}/PROPERTIES-{feature}.md` | `pm-review`, `se-review` | `te-author` |
| CR | _(no creation step — reviews the implementation on-branch)_ | — | — | `pm-review`, `te-review` | `se-author` |

### 0.2 Creator Agent Invocation Rules

1. The creator agent is invoked once per phase before `reviewLoop` is entered.
2. The creator agent receives all listed input paths as context. The script passes these as agent call parameters.
3. The creator agent must write and commit the output document to the feature branch before returning.
4. If the creator agent fails (crashes, non-zero exit, or returns an error signal), the pipeline halts with: `"Error: creator agent {skill} failed to produce {output-path} for phase {phase}"`. The subsequent `reviewLoop` is not entered.
5. The script does not attempt to distinguish "creator succeeded but document is missing from disk" from "creator never ran" — both are detected by the `reviewLoop` entry precondition check in §1.1 (document absent → halt with §7.2 error). The halt message in §7.2 is diagnostic; the direct failure path is §0.2 step 4.

### 0.3 Phase CR and Phase H: No Creator Call

Phase CR reviews the implementation already on the feature branch. There is no document to create. The script passes `docs/{feature}/` (the feature directory) as the `docPath` for Phase CR's `reviewLoop` call (see §4.8).

Phase H (harvest) has no creator call and no `reviewLoop`. It is a single-agent harvest invocation (see §5).

---

## 1. FSPEC-LOOP: `reviewLoop` Behavior

**Linked requirements:** REQ-GATE-01, REQ-GATE-02, REQ-GATE-04, REQ-GATE-05, REQ-PIPELINE-03

### 1.1 Entry Conditions

`reviewLoop` is the single reusable construct invoked for every review phase. It accepts:

| Parameter | Type | Description |
|---|---|---|
| `phase` | string | Phase label (e.g., `"R"`, `"F"`, `"T"`, `"D"`, `"P"`, `"PR"`, `"CR"`) |
| `docPath` | string | Path to the document under review (or feature directory for Phase CR — see §4.8) |
| `reviewers` | array[skill] | Exactly two reviewer skills to dispatch in parallel (see Phase Dispatch Table in §0.1) |
| `optimizer` | skill | The optimizer skill to invoke on failure (see Phase Dispatch Table in §0.1) |
| `featureName` | string | Feature name extracted from the REQ path |

Entry precondition: for all phases except CR, the upstream document at `docPath` exists and has been committed on the feature branch. If the document is absent, `reviewLoop` does not start — control returns to the caller with a halt error (see §7.2). For Phase CR, the precondition is that the feature directory at `docPath` exists (always true after Phase I completes).

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
- The counter increments **after** every optimizer invocation (i.e., after every FAIL gate), immediately before returning to §1.2 for the next parallel dispatch.
- The optimizer always reads all versions (no-suffix through current `-vN`) before addressing feedback.

### 1.7 Resume Behavior Inside a Loop

When a run is resumed from a `runId` after interruption mid-loop:

1. The runtime returns cached results for all completed agent calls; those calls do not re-execute.
2. The script continues executing from the first incomplete agent call.
3. The iteration counter does **not** reset to 1; the runtime's per-agent caching preserves the iteration state across resumption.
4. At the start of every iteration, the script emits one of two log messages (no cache-state query API is required — the log is derived from the current value of the iteration counter and whether this is the first iteration of a fresh run):
   - **Fresh run, iteration 1:**
     ```
     log("Starting iteration 1")
     ```
   - **All other iterations** (N ≥ 2, or any iteration in a resumed run):
     ```
     log("Resuming from iteration N")
     ```
   where `N` is the current iteration number (the iteration that was active when the run was interrupted on a resumed run, not the next iteration to execute). This gives two distinct observable messages: a fresh start at iteration 1 emits `"Starting iteration 1"`, while any resumed or subsequent iteration emits `"Resuming from iteration N"`. No cache-state query API is required.

   **Reconciliation with REQ-PIPELINE-03:** REQ-PIPELINE-03's acceptance criterion scopes the `"Resuming from iteration N"` log to resumed runs. This FSPEC is the normative behavioral specification: the implementation emits `"Starting iteration 1"` on a fresh run and `"Resuming from iteration N"` on resume or on iteration N ≥ 2. REQ-PIPELINE-03's `"Resuming from iteration N"` wording captures the resumed-run case; the `"Starting iteration 1"` variant for fresh runs is the FSPEC-level refinement.

   **REQ traceability for `"Starting iteration 1"`:** The `"Starting iteration 1"` log is an observable under **REQ-OBS-01** (phase-by-phase progress). REQ-OBS-01 covers iteration-number visibility; this log message is its implementation for the fresh-run, first-iteration case. No new requirement is needed — REQ-OBS-01 is the parent. AT-RESUME-02 is therefore classified as an REQ-OBS-01 property for PROPERTIES authoring.

Resume behavior for implementation phase batches and the harvest phase follows the same runtime per-agent caching guarantee: completed agent calls are not re-executed regardless of which phase was interrupted.

### 1.8 5-Iteration Cap

- The loop runs a maximum of 5 iterations.
- After iteration 5's optimizer invocation, the iteration counter increments to 6.
- The cap check occurs at the start of each iteration: if the counter exceeds 5 and the gate state from the most recent verdict check is FAIL, the script does **not** dispatch reviewers again.
- Instead, it branches to the POSTMORTEM path (§1.9).

### 1.9 POSTMORTEM Branch (Non-Convergence)

Trigger: iteration counter reaches 6 (i.e., 5 review iterations have occurred) and the most recent gate state was FAIL.

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
| The JSON object uses exactly the keys `high`, `medium`, `low` | Required (set equality, order-independent — any key ordering is valid) |
| All N values are non-negative integers | Required |
| No additional JSON keys are present | Required |
| A trailing newline after the JSON object is **permitted** | Parsers must not anchor to end-of-string; a trailing `\n` is not an error |

### 2.2 Parsing Algorithm

The script uses the following extraction algorithm against the `result` string returned by each `agent()` call (not against any file on disk):

1. Split the result string on newlines (`\n`) into an array of lines.
2. Iterate the lines array **in reverse order** (from last line to first).
3. For each line, perform a **case-sensitive exact-string check**: does the line, after trimming leading and trailing whitespace, start with `VERDICT:` followed by one or more whitespace characters and then the remainder? Specifically: trim the line, check if it starts with `"VERDICT: "` (the literal string `VERDICT:` followed by a single space minimum). This is not a regex evaluation — it is a prefix check on the trimmed line.
4. On the first matching line found (i.e., the last occurrence in forward order), extract everything after `"VERDICT: "` as the raw verdict string, then trim it.
5. Check that the trimmed value is exactly one of: `Approved`, `Approved with minor changes`, `Needs revision`. This check is case-sensitive and uses exact string equality (not regex).
6. Identify the index of the VERDICT line in the original lines array. Scan forward from that index to find the next non-empty line (a line that, after trimming, is not empty). If the VERDICT line is the last line of output, or if all lines after the VERDICT line are empty, there is no following non-empty line — apply the truncated-output handling defined in §2.3.
7. Parse the first non-empty line after the VERDICT line as JSON. Validate that the parsed object has a key set equal to `{"high", "medium", "low"}` (set equality, order-independent) with non-negative integer values and no other keys.
8. If all checks pass: return the verdict value and the findings counts as structured data.

**`DECISIONS_WARRANTED` parsing uses the same split-and-iterate strategy:** split the result string on newlines, iterate in reverse, find the last line whose trimmed value starts with `"DECISIONS_WARRANTED: "`, extract the remainder, trim it, and compare case-insensitively to `"true"` or `"false"` using exact string equality.

### 2.3 Missing, Malformed, Crashed, or Truncated Reviewer Handling

Any of the following conditions triggers the **fallback path**:

| Condition | Description |
|---|---|
| No `VERDICT:` line found | No line in the result starts with `VERDICT:` after trimming |
| Wrong casing | Verdict string casing does not exactly match one of the three valid values |
| Intervening text | One or more non-empty lines exist between the VERDICT line and the JSON line |
| Missing JSON | No non-empty line follows the VERDICT line (truncated output) |
| Invalid JSON | The following non-empty line is not valid JSON |
| Wrong JSON keys | The JSON object's key set is not exactly `{"high", "medium", "low"}` |
| Negative values | Any N value is negative |
| Agent crash / timeout | The agent call threw an exception or timed out before returning |

**Truncated-output special case:** If the VERDICT line is found but there is no subsequent non-empty line (the agent message ends immediately after the VERDICT line, or is followed only by empty lines), the script does **not** treat this as a malformed-VERDICT fallback. Instead:
- The verdict value is accepted as parsed (it passed the exact-string check in step 5).
- The findings count JSON is treated as `{"high": 0, "medium": 0, "low": 0}` (zero counts, no error).
- No fallback warning is emitted.
- The gate proceeds on the verdict value alone.

Fallback behavior for **every other** condition above:

1. Treat the verdict as `Needs revision`.
2. Emit a `log()` warning in exactly this format:
   ```
   WARNING: reviewer {skill-name} returned no VERDICT — treating as Needs revision
   ```
   where `{skill-name}` is the reviewer's skill identifier (e.g., `se-review`, `te-review`, `pm-review`).
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

**Parsing:** The script applies the split-and-iterate strategy described in §2.2 (final paragraph): split result on newlines, iterate in reverse, find the last line whose trimmed value starts with `"DECISIONS_WARRANTED: "`, extract the remainder, trim it, and compare case-insensitively using exact string equality (`true`, `True`, `TRUE` → `true`; `false`, `False`, `FALSE` → `false`).

**Injection mechanism:** The `DECISIONS_WARRANTED:` trailer is an additive instruction injected by the workflow script at TSPEC-optimizer invocation time. It is not baked into the `se-author` SKILL.md. The `se-author` skill is otherwise behaviorally unchanged; only this specific workflow invocation appends the return-value instruction to the agent call.

**Missing or malformed field:** If the TSPEC optimizer agent's result contains no `DECISIONS_WARRANTED:` line, or the value is not one of `true`/`false`, the script treats the field as `true` (safe default — include DECISIONS rather than silently skip it). The script emits:
```
log("WARNING: DECISIONS_WARRANTED field absent or malformed — defaulting to true")
```

**Compatibility note:** This trailer is an additive return convention for the TSPEC optimizer invocation only. It does not change the TSPEC document on disk.

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

When `decisionsWarranted` is `true` (whether from an explicit return value or a missing-field default):

1. The script invokes `se-author` to create `docs/{featureName}/DECISIONS-{featureName}.md`.
2. The DECISIONS document is committed and pushed before reviews begin.
3. The script enters `reviewLoop` for Phase D with:
   - Reviewers: `pm-review`, `te-review`
   - Optimizer: `se-author`
   - Cross-review output files: `CROSS-REVIEW-product-manager-DECISIONS[-vN].md`, `CROSS-REVIEW-test-engineer-DECISIONS[-vN].md`
4. The same 5-iteration cap and POSTMORTEM path applies (see §1.8, §1.9).
5. On loop PASS, execution continues to Phase P.

In the `/workflows` progress view, Phase D appears as an active phase when the full path is taken: `"Phase D: DECISIONS Review"`.

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

The dependency graph is treated as a DAG (directed acyclic graph). If the PLAN's stated groupings are inconsistent with the dependency edges (e.g., a task in batch 2 depends on a task also in batch 2), the script uses the dependency-derived order, ignoring the PLAN's batch labels. When an override occurs, the script logs the discrepancy before dispatching:
```
log("WARNING: PLAN batch labels inconsistent with dependency edges — re-deriving topological batches")
```

### 4.3 Topological Batching

The script performs a topological sort to compute execution batches:

1. A task is **ready** if all its dependencies have completed.
2. A **batch** is the maximal set of ready tasks at each step of the sort.
3. Batches are numbered from 1.
4. A single batch contains at most 5 tasks (the `se-implement` agent fan-out cap). If a batch would contain more than 5 ready tasks, the script splits it into sub-batches of up to 5. Sub-batch ordering within a topological level is determined by document order in the PLAN task table (deterministic). Sub-batches at the same topological level execute sequentially (sub-batch 1a completes before sub-batch 1b starts), preserving the concurrency cap.

**Example:** 8 tasks, all ready at step 1 → sub-batch 1a (5 tasks, tasks 1–5 in PLAN order), sub-batch 1b (3 tasks, tasks 6–8 in PLAN order). Sub-batch 1a runs and completes before sub-batch 1b starts. Both run before any dependent tasks.

### 4.4 Batch Plan Logging

Before dispatching any `se-implement` agent, the script emits the computed batch plan to the `/workflows` progress view:

```
log("Implementation batch plan:")
log("  Batch 1: [task-id-1, task-id-2, task-id-3]")
log("  Batch 2: [task-id-4, task-id-5]  (depends on: Batch 1)")
log("  ...")
log("  Total: N tasks in M batches")
```

This log output appears **before** the first `agent()` call for any `se-implement` task. The call ordering requirement is: the `log()` call for the batch plan string is a sequential statement that precedes the first `agent()` call for that batch — verifiable by inspecting the script's sequential statement order. Developers can see the entire planned execution order in `/workflows` before any implementation begins.

The preferred mechanism is `log()`. If `log()` does not surface structured data in the `/workflows` view at implementation time, the fallback is a `phase()` label whose label text includes the batch summary (e.g., `"Phase I: Batch 1/3 — [task-1, task-2, task-3]"`).

### 4.5 Parallel `se-implement` Dispatch

For each batch:

1. All tasks in the batch are dispatched in parallel using `parallel()` with `isolation: "worktree"`.
2. Each `se-implement` agent receives:
   - The specific task row from the PLAN (task ID, description, dependencies)
   - Path to `TSPEC-{featureName}.md`
   - Path to `PROPERTIES-{featureName}.md`
3. The script waits for all agents in the batch to complete before evaluating the batch gate.
4. After all agents in the batch complete, each worktree is merged back to the feature branch (`feat-{featureName}`) using `git merge --no-ff`. This produces a merge commit for each worktree, preserving the worktree's commit history.

   **Worktree auto-merge note:** The runtime does **NOT** auto-merge worktrees on agent completion for `isolation: "worktree"` agents. Each worktree persists after its agent completes and must be explicitly merged by the script via `git merge --no-ff` per steps 4–6. If the runtime auto-merge behavior changes in a future runtime version, the explicit merge in steps 4–6 must be guarded accordingly (e.g., skip the explicit merge if the worktree is already merged).

5. **Merge conflict handling:** If a `git merge --no-ff` call produces a conflict, the script immediately aborts the merge (`git merge --abort`), leaves the conflicting worktree in place, halts the pipeline, and emits: `"Error: merge conflict merging worktree for task {task-id} into feat-{featureName} — conflicting files: {file-list}. Pipeline halted."`. Subsequent worktrees in the same batch are not merged. The developer must resolve the conflict manually.
6. Merging proceeds worktree-by-worktree in PLAN document order. All worktrees from a batch must merge successfully before the per-batch test gate runs.

Maximum concurrent agents per batch: **5** (enforced by the sub-batch splitting in §4.3).

### 4.6 Per-Batch Test Gate

After all agents in a batch complete and all worktrees are merged:

1. The script inspects each agent's result for test result signals.
2. A batch **passes** if no agent's result contains a test failure marker.
3. A batch **fails** if any agent's result contains a test failure marker.

**Test result signal format (normative):** The script uses the following deterministic signal detection:
- **Failure marker:** any line in the agent's result string matching the pattern `Tests: N failed` (where N is a positive integer) or the presence of `non-zero exit` in the result string (case-insensitive). These are the canonical failure signals produced by `se-implement` agents.
- **Pass determination:** the batch passes if and only if no agent result contains a failure marker as defined above. The absence of a failure marker is the positive pass signal; no structured pass trailer is required.

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
- `docPath`: `docs/{featureName}/` (the feature directory). Reviewers are instructed to inspect the codebase on the current feature branch rather than a single document. The §1.1 entry precondition for Phase CR checks that the feature directory exists (not a single file), which is always satisfied after Phase I.
- Cross-review output files: `CROSS-REVIEW-product-manager-IMPLEMENTATION[-vN].md`, `CROSS-REVIEW-test-engineer-IMPLEMENTATION[-vN].md`
- Same 5-iteration cap and POSTMORTEM path applies

Phase CR counts as one of the 8 review phases in the agent count formula (see REQ-NFR-01).

---

## 5. FSPEC-HARVEST: Harvest Phase

**Linked requirements:** REQ-ARTIFACTS-02, REQ-COMPAT-02

### 5.1 Entry Condition

Phase H begins after Phase CR `reviewLoop` passes. All `CROSS-REVIEW-*` and `POSTMORTEM-*` files written by worktree agents must have merged onto the feature branch before harvest reads them.

**Phase H gating prerequisite:** Phase H has a compile-time enable flag:

```js
const PHASE_H_ENABLED = true; // Set to false until feature-branch-consistency fix lands
```

If `PHASE_H_ENABLED` is `false`:
1. The script logs: `"Phase H skipped — prerequisite not yet landed"`.
2. Phase H appears in the `/workflows` view as: `"Phase H: ⏭ Skipped (prerequisite)"`.
3. Phase H is listed in the final report as: `Phase H: ⏭ Skipped (prerequisite not yet landed)`.
4. The pipeline completes without invoking the harvest agent.

This flag is the scripted representation of the SKILL.md §9.5 caveat. When the feature-branch-consistency fix lands, `PHASE_H_ENABLED` is set to `true` and the harvest path becomes active.

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
| H | Harvest | Single agent | Always (subject to `PHASE_H_ENABLED` flag) |

No phase may be skipped except Phase D (per the DECISIONS conditional in §3) and Phase H (per the `PHASE_H_ENABLED` flag in §5.1). No phase may be reordered.

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

Exception: if **both** reviewers crash in the same iteration, both are treated as `Needs revision` (two warning log lines are emitted, one per crashed reviewer), gate state is FAIL, the optimizer is invoked once, and the iteration count increments. The 5-iteration cap still applies.

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
- **Then:** Warning logged in the format `"WARNING: reviewer {skill-name} returned no VERDICT — treating as Needs revision"`; gate state is FAIL; optimizer invoked; iteration counter increments

### AT-LOOP-05: POSTMORTEM Agent Failure Produces Warning Note
- **Who:** Workflow script
- **Given:** Both reviewers return `Needs revision` for all 5 iterations; the POSTMORTEM-writing agent itself fails (crashes or returns non-zero exit)
- **When:** Iteration 5 completes, POSTMORTEM agent is invoked and fails
- **Then:** Pipeline halts; final report contains `"WARNING: POSTMORTEM agent failed — artifact not written for phase {phase}"`; no POSTMORTEM file is written; the pipeline does not retry the POSTMORTEM agent

### AT-LOOP-06: reviewLoop Precondition Failure (Document Absent)
- **Who:** Workflow script
- **Given:** A review phase is dispatched but its target document (`docPath`) does not exist on disk
- **When:** `reviewLoop` is called
- **Then:** No reviewer agents are dispatched; the script halts with `"Error: {docPath} does not exist — cannot enter reviewLoop for phase {phase}"`; the exact document path and phase label appear in the error message

### AT-LOOP-07: Optimizer Agent Failure Halts Pipeline
- **Who:** Workflow script
- **Given:** Phase R reviewLoop: one reviewer returns `Needs revision` on iteration 1; the optimizer agent fails (non-zero exit) during its invocation
- **When:** Optimizer failure is detected
- **Then:** Pipeline halts immediately; the script does not proceed to iteration 2; final report contains `"Error: optimizer agent {optimizer-skill} failed during phase {phase}, iteration {N} — pipeline halted. Document at {docPath} may be in an inconsistent state."`

### AT-LOOP-08: Both Reviewers Crash in Same Iteration
- **Who:** Workflow script
- **Given:** Both reviewer agents in the same iteration throw exceptions (or time out) before returning any output — no VERDICT line is present in either result
- **When:** Gate state is evaluated after both agents complete (via exception)
- **Then:** The script emits two warning log entries (in any order), one for each crashed reviewer, each in the format `"WARNING: reviewer {skill-name} returned no VERDICT — treating as Needs revision"` (with the respective reviewer's skill identifier substituted); both are treated as `Needs revision`; gate state is FAIL; the optimizer is invoked exactly once (not twice); the iteration counter increments by 1; the pipeline does not halt (continues the loop normally). The assertion checks set presence (both warning strings present, any order) — not relative ordering.

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

### AT-VERDICT-05: Truncated Output — VERDICT Line Is Last Line
- **Who:** Workflow script (parser unit)
- **Given:** Agent result ends with `VERDICT: Approved` (the VERDICT line is the very last line; no line follows it)
- **When:** Parser runs
- **Then:** Verdict value `Approved` is accepted; findings count defaults to `{"high": 0, "medium": 0, "low": 0}`; no fallback warning is emitted; gate proceeds on the `Approved` verdict

### AT-VERDICT-06: Truncated Output — VERDICT: Needs Revision as Last Line
- **Who:** Workflow script (parser unit)
- **Given:** Agent result ends with `VERDICT: Needs revision` (the VERDICT line is the very last line; no non-empty line follows it)
- **When:** Parser runs
- **Then:** Verdict value `Needs revision` is accepted; findings count defaults to `{"high": 0, "medium": 0, "low": 0}`; no fallback warning is emitted; gate state is FAIL (the `Needs revision` verdict is acted on, not the zero count)

### AT-VERDICT-07: Truncated Output — VERDICT Followed by Blank Lines Then EOF
- **Who:** Workflow script (parser unit)
- **Given:** Agent result ends with `VERDICT: Approved` followed by one or more blank lines and then EOF (e.g., `"VERDICT: Approved\n\n\n"` — the VERDICT line is the last non-empty line and all remaining lines are blank or whitespace)
- **When:** Parser runs
- **Then:** The parser treats this identically to AT-VERDICT-05 — verdict value `Approved` is accepted; findings count defaults to `{"high": 0, "medium": 0, "low": 0}`; no fallback warning is emitted; gate proceeds on the `Approved` verdict. (The §2.2 step 6 "all lines after the VERDICT line are empty" sub-case is equivalent to the "VERDICT line is the very last line" sub-case for truncated-output purposes.)

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

### AT-DECISIONS-03: Explicit True Enters Full DECISIONS Path
- **Who:** Workflow script
- **Given:** TSPEC optimizer returns `DECISIONS_WARRANTED: true` (explicit positive value)
- **When:** Script evaluates DECISIONS gate
- **Then:** `reviewLoop` for Phase D is entered; the absent-field warning log (`"WARNING: DECISIONS_WARRANTED field absent or malformed — defaulting to true"`) is NOT emitted; Phase D appears as an active phase (`"Phase D: DECISIONS Review"`) in `/workflows`

### AT-DECISIONS-04: Case-Insensitive DECISIONS_WARRANTED Parsing (Skip Path)
- **Who:** Workflow script
- **Given:** TSPEC optimizer returns `DECISIONS_WARRANTED: False` (mixed case — capital F, lowercase alse)
- **When:** Script parses the `DECISIONS_WARRANTED` value
- **Then:** The value is treated as `false` (case-insensitive parsing is applied); Phase D is skipped; `log("Phase D skipped — no load-bearing alternatives")` is emitted; the absent-field warning (`"WARNING: DECISIONS_WARRANTED field absent or malformed — defaulting to true"`) is NOT emitted; execution continues to Phase P

### AT-RESUME-01: Resume Iteration Counter Semantics
- **Who:** Workflow script
- **Given:** A `reviewLoop` for any phase was interrupted during iteration 3 (some but not all agents in iteration 3 had completed); the run is resumed
- **When:** The script continues from the resumed run
- **Then:** The first `log()` call after resume emits `"Resuming from iteration 3"` (not `"Resuming from iteration 4"`, and not `"Starting iteration 3"`); the runtime does not re-invoke already-completed agents from iteration 3; the iteration cap counter is not reset to 1

### AT-RESUME-02: Fresh Run Emits "Starting iteration 1"
- **Who:** Workflow script
- **Given:** A fresh pipeline run (not a resumed run) starts a `reviewLoop` for any phase; iteration 1 is about to begin
- **When:** The script emits its iteration-start log before dispatching the first parallel reviewer pair
- **Then:** The log message is `"Starting iteration 1"` — not `"Resuming from iteration 1"`

### AT-RESUME-03: Fresh Run Iteration 2 Emits "Resuming from iteration 2"
- **Who:** Workflow script
- **Given:** A fresh pipeline run (not a resumed run) where a `reviewLoop`'s iteration 1 did not converge — the gate state was FAIL, the optimizer was invoked, and the iteration counter incremented to 2; iteration 2 is now beginning
- **When:** The script emits its iteration-start log before dispatching the parallel reviewer pair for iteration 2
- **Then:** The log message is `"Resuming from iteration 2"` — not `"Starting iteration 2"`. (`"Starting iteration N"` is emitted only on iteration 1 of a fresh run; all subsequent iterations, including fresh-run iteration 2, emit `"Resuming from iteration N"` per §1.7.)

### AT-IMPL-01: Batch Plan Logged Before Dispatch
- **Who:** Developer observing `/workflows`
- **Given:** PROPERTIES are approved; PLAN contains 4 tasks with dependency edges
- **When:** Implementation phase begins
- **Then:** `log("Implementation batch plan: ...")` appears in `/workflows` before any `se-implement` agent is dispatched; plan correctly reflects topological ordering. Call-order assertion: the script's `log()` statement for the batch plan string is a sequential statement that appears before the first `agent()` call for any `se-implement` task, verifiable by inspecting the script's statement order.

### AT-IMPL-02: Batch Failure Halts Pipeline
- **Who:** Workflow script
- **Given:** Batch 1 dispatches 3 agents; one agent's result contains the line `Tests: 2 failed`
- **When:** Batch 1 gate is evaluated
- **Then:** Pipeline halts; Batch 2 is not dispatched; final report names the failing agent and task ID; the test failure summary from the failing agent's result is included

### AT-IMPL-03: DAG Inconsistency Override Logged
- **Who:** Workflow script
- **Given:** PLAN contains a task labeled as batch 2 that has a dependency on another task also labeled as batch 2 (contradictory batch labels)
- **When:** Implementation phase begins and the DAG is parsed
- **Then:** The script re-derives topological batches from dependency edges; the PLAN's stated batch labels are ignored; `log("WARNING: PLAN batch labels inconsistent with dependency edges — re-deriving topological batches")` is emitted before any `se-implement` agent is dispatched; the resulting batch plan correctly places the prerequisite task in an earlier batch than the dependent task

### AT-IMPL-04: Batch Pass — Pipeline Continues to Next Batch
- **Who:** Workflow script
- **Given:** A `se-implement` batch completes and no agent's result contains a line matching `Tests: N failed` (where N is a positive integer) and no agent's result contains `non-zero exit` (case-insensitive)
- **When:** The per-batch test gate is evaluated
- **Then:** The script treats the batch as passed; it does NOT halt; it emits `log("Batch N complete — all tests passing")`; it proceeds to dispatch the next batch (or, if this was the final batch, proceeds to Phase PT)

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
| OQ-02 | **Resolved:** The VERDICT trailer is a **permanent addition to the SKILL.md files** of `se-review`, `te-review`, and `pm-review`. It is NOT injected by the workflow script at runtime. The trailer is baked into each reviewer skill's SKILL.md so that Ptah engine and interactive callers always receive the trailer — this is the desired behavior per REQ-COMPAT-01, which specifies the trailer as a shared data contract available to all callers. Script-injection would isolate the trailer to the workflow path only, preventing interactive callers from benefiting. The three SKILL.md changes are Phase 1 deliverables alongside the workflow script. | Closed |
| OQ-03 | **Resolved:** The `DECISIONS_WARRANTED` trailer is a workflow-script-injected instruction appended to the TSPEC-optimizer agent call. It is not baked into the `se-author` SKILL.md. See §3.1. | Closed |
| OQ-04 | REQ-NFR-01's worst-case formula ("7 phases" in the original, Phase CR correction noted in CROSS-REVIEW-SE-REQ-v2 F-13) should be reconciled to "8 review phases" before TSPEC authoring. The compliance conclusion is unchanged; the formula should be corrected for accuracy. | Does not block FSPEC; should be resolved in REQ before TSPEC |
| OQ-05 | The sync mechanism for `pdlc/workflows/orchestrate-dev.js` → `.claude/workflows/orchestrate-dev.js` in consumer repos is unspecified in the REQ. This FSPEC defers that mechanism to an implementation decision. If a `pdlc install` script or similar is required, it should be scoped as a separate requirement before TSPEC authoring. | May require a new REQ entry; does not block FSPEC behavioral specification |

---

## Traceability

| FSPEC Section | Linked Requirements |
|---|---|
| §0 Pipeline Phase Dispatch | REQ-PIPELINE-01, REQ-PIPELINE-02, REQ-GATE-02 |
| §1 reviewLoop | REQ-GATE-01, REQ-GATE-02, REQ-GATE-04, REQ-GATE-05, REQ-PIPELINE-03 |
| §2 VERDICT Contract | REQ-COMPAT-01, REQ-GATE-01, REQ-GATE-05 |
| §3 DECISIONS Conditional | REQ-GATE-02, REQ-COMPAT-03 |
| §4 Implementation Phase | REQ-GATE-03, REQ-NFR-01, REQ-PIPELINE-02, REQ-COMPAT-03 |
| §5 Harvest Phase | REQ-ARTIFACTS-02, REQ-COMPAT-02 |
| §6 Pipeline Entry | REQ-PIPELINE-01, REQ-PIPELINE-02 |
| §7 Error Flows | REQ-GATE-01, REQ-GATE-02, REQ-GATE-05, REQ-ARTIFACTS-02, REQ-COMPAT-02 |
