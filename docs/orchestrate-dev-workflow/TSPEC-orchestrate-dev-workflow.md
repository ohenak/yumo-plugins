---
Status: Draft
Author: se-author
Version: 1.0
Feature: orchestrate-dev-workflow
---

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → **TSPEC** |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Scope | Workflow script architecture, Phase Dispatch Table, `reviewLoop` algorithm, VERDICT and `DECISIONS_WARRANTED` parsing, pipeline entry validation, implementation phase DAG execution, harvest phase, error handling, and non-functional constraints |
| Cross-Reviews | — |
| LEARNINGS | docs/orchestrate-dev-workflow/LEARNINGS-orchestrate-dev-workflow.md |

# TSPEC — orchestrate-dev-workflow

Technical specification for implementing the `orchestrate-dev` PDLC orchestrator as a Claude Code dynamic workflow script.

---

## 1. Workflow Script Architecture

### TSPEC-SCRIPT-01: File Location and Deployment

**Canonical plugin source:** `pdlc/workflows/orchestrate-dev.js` (in this repo)

**Consumer runtime copy:** `.claude/workflows/orchestrate-dev.js` (in the consumer repo's root)

The plugin source is the single source of truth. The consumer copy is a direct copy of the plugin source; no build step transforms it. Until a formal `pdlc install` mechanism exists (OQ-05 from FSPEC), this copy is managed manually. The two paths are identical in content; the runtime reads `.claude/workflows/orchestrate-dev.js`.

The script is invoked via the `orchestrate-dev` SKILL.md pointer:

```
/pdlc:orchestrate-dev docs/{feature}/REQ-{feature}.md
```

### TSPEC-SCRIPT-02: Module Format

The script is written as **ECMAScript Modules (ESM)**. All imports use `import` syntax. The file has no CommonJS `require()` calls and no `module.exports`.

### TSPEC-SCRIPT-03: Exported `meta` Object

The script must export a `meta` object as a named export. The shape is:

```js
export const meta = {
  name: "orchestrate-dev",
  description: "Full PDLC pipeline orchestrator — REQ to harvest.",
  inputs: [
    {
      name: "reqPath",
      description: "Path to the approved REQ document, e.g. docs/{feature}/REQ-{feature}.md",
      type: "string",
      required: true,
    },
  ],
};
```

The runtime reads `meta` to populate the `/workflows` UI and validate inputs before the script body runs.

### TSPEC-SCRIPT-04: Script Body Async Context

The script body runs inside a single top-level `async` function (or as top-level `await` in ESM). All `agent()`, `parallel()`, `pipeline()`, `phase()`, and `log()` calls are `await`ed. The script returns a single structured report object as its final value — this is what the runtime surfaces in the main conversation context.

```js
// Structural shape of the script body
export const meta = { ... };

export default async function main({ reqPath }) {
  // pipeline logic here
  return finalReport; // Only this value reaches main context
}
```

### TSPEC-SCRIPT-05: Runtime API Usage

| Function | Usage |
|---|---|
| `agent(skill, prompt, opts?)` | Invoke a single skill agent. Returns result string. `opts` may include `isolation: "worktree"` for se-implement agents. |
| `parallel([...promises])` | Dispatch multiple `agent()` calls concurrently. Returns array of results in dispatch order. Used for reviewer pairs and se-implement batches. |
| `pipeline(label, fn)` | Groups a sequence of steps under a named pipeline label in the `/workflows` view. Used to wrap the full PDLC phase sequence. |
| `phase(label)` | Emits a phase label in the `/workflows` progress view. Called at the start of each PDLC phase. |
| `log(message)` | Emits a progress message to the `/workflows` view. Used for iteration numbers, batch plans, warnings, skip notices. Never receives agent result objects as its argument — only scalar log strings. |

---

## 2. Phase Dispatch Table

### TSPEC-DISPATCH-01: Normative Phase Dispatch Table

The following data structure is the normative source consumed by `reviewLoop` and the main pipeline body. It is defined as a module-level constant:

```js
const PHASE_DISPATCH = {
  R: {
    phase: "R",
    label: "REQ Cross-Review",
    creator: null,                     // REQ is the input; no creator call
    creatorInputs: [],
    creatorOutputPath: null,
    reviewers: ["se-review", "te-review"],
    optimizer: "pm-author",
  },
  F: {
    phase: "F",
    label: "FSPEC Creation + Review",
    creator: "pm-author",
    creatorInputs: ["REQ"],
    creatorOutputPath: "docs/{feature}/FSPEC-{feature}.md",
    reviewers: ["se-review", "te-review"],
    optimizer: "pm-author",
  },
  T: {
    phase: "T",
    label: "TSPEC Creation + Review",
    creator: "se-author",
    creatorInputs: ["REQ", "FSPEC"],
    creatorOutputPath: "docs/{feature}/TSPEC-{feature}.md",
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
  },
  D: {
    phase: "D",
    label: "DECISIONS Creation + Review",
    creator: "se-author",
    creatorInputs: ["REQ", "FSPEC", "TSPEC"],
    creatorOutputPath: "docs/{feature}/DECISIONS-{feature}.md",
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
  },
  P: {
    phase: "P",
    label: "PLAN Creation + Review",
    creator: "se-author",
    // DECISIONS input is conditional — append if DECISIONS doc exists on branch
    creatorInputs: ["REQ", "FSPEC", "TSPEC", "DECISIONS?"],
    creatorOutputPath: "docs/{feature}/PLAN-{feature}.md",
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
  },
  PR: {
    phase: "PR",
    label: "PROPERTIES Creation + Review",
    creator: "te-author",
    creatorInputs: ["REQ", "FSPEC", "TSPEC", "PLAN"],
    creatorOutputPath: "docs/{feature}/PROPERTIES-{feature}.md",
    reviewers: ["pm-review", "se-review"],
    optimizer: "te-author",
  },
  CR: {
    phase: "CR",
    label: "Final Codebase Review",
    creator: null,                     // Reviews implementation on branch; no doc to create
    creatorInputs: [],
    creatorOutputPath: null,
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
  },
};
```

`{feature}` is a template placeholder. Before using any path from this table, the script interpolates the resolved `featureName` string. `DECISIONS?` in Phase P's `creatorInputs` means the script appends the DECISIONS path only when `decisionsWarranted` was `true` and the DECISIONS document was created.

---

## 3. `reviewLoop` Function

### TSPEC-LOOP-01: Function Signature

```js
/**
 * @param {object} params
 * @param {string} params.doc       - Path to the document under review (or feature dir for Phase CR)
 * @param {string} params.phase     - Phase label: "R" | "F" | "T" | "D" | "P" | "PR" | "CR"
 * @param {string[]} params.reviewers - Exactly two reviewer skill identifiers
 * @param {string} params.optimizer - Optimizer skill identifier
 * @param {string} params.feature   - Feature name (e.g. "postgres-storage")
 * @param {number} [params.iteration=1] - Starting iteration (always 1 for fresh runs)
 * @returns {Promise<{converged: boolean, iterations: number}>}
 */
async function reviewLoop({ doc, phase, reviewers, optimizer, feature, iteration = 1 })
```

### TSPEC-LOOP-02: Entry Precondition Check

Before dispatching any agent, `reviewLoop` checks the entry precondition:

- For all phases except `CR`: the file at `doc` must exist on disk. If it does not, `reviewLoop` returns immediately without dispatching any agent and the caller halts with:
  ```
  Error: {doc} does not exist — cannot enter reviewLoop for phase {phase}
  ```
- For Phase `CR`: the check is that the directory at `doc` exists (always true after Phase I; skip the existence check for Phase CR by design).

### TSPEC-LOOP-03: Iteration Loop Algorithm

```
iteration ← 1
loop:
  // (a) Emit iteration log
  if iteration === 1 and not resumed:
    log("Starting iteration 1")
  else:
    log("Resuming from iteration " + iteration)

  // (b) Dispatch reviewers in parallel
  [result1, result2] ← await parallel([
    agent(reviewers[0], reviewerPrompt(doc, phase, feature, iteration)),
    agent(reviewers[1], reviewerPrompt(doc, phase, feature, iteration)),
  ])

  // (c) Parse verdicts
  verdict1 ← parseVerdict(result1, reviewers[0])
  verdict2 ← parseVerdict(result2, reviewers[1])

  // (d) Evaluate gate
  gateState ← (isPass(verdict1) AND isPass(verdict2)) ? "PASS" : "FAIL"

  // (e) Branch
  if gateState === "PASS":
    return { converged: true, iterations: iteration }

  // iteration cap check
  if iteration >= 5:
    // invoke POSTMORTEM branch (§3.6)
    await writePostmortem({ phase, feature, iteration, verdict1, verdict2, result1, result2, reviewers })
    halt with non-convergence report
    return { converged: false, iterations: iteration }

  // (f) Invoke optimizer
  optimizerResult ← await agent(optimizer, optimizerPrompt(doc, phase, feature, iteration))
  if optimizerFailed(optimizerResult):
    halt with: "Error: optimizer agent {optimizer} failed during phase {phase}, iteration {iteration} — pipeline halted. Document at {doc} may be in an inconsistent state."

  iteration ← iteration + 1
  // loop back to (a)
```

`isPass(verdict)` returns `true` if and only if `verdict === "Approved" || verdict === "Approved with minor changes"`.

### TSPEC-LOOP-04: Parallel Reviewer Dispatch

Both reviewers are dispatched with `parallel()`. Each reviewer receives:

- The `doc` path as context
- A scope instruction describing what to review for their role
- The current iteration number (for cross-review file naming)
- The `phase` label

Results are stored in script-local variables `result1` and `result2`. They are never passed to `log()` as content.

### TSPEC-LOOP-05: Iteration Log Format

| Condition | Log message |
|---|---|
| Fresh run, iteration 1 | `"Starting iteration 1"` |
| Any other iteration (N ≥ 2) or resumed run at iteration N | `"Resuming from iteration N"` |

The log is emitted **before** the `parallel()` call for that iteration's reviewers. Fresh/resumed distinction is determined solely by the iteration counter value — no runtime cache-state query API is needed.

### TSPEC-LOOP-06: Resume Semantics

The runtime provides per-agent call caching. On resume:

1. Already-completed `agent()` calls return their cached results immediately.
2. The script continues from the first incomplete call.
3. The iteration counter is not reset — its value at the point of interruption is preserved by the runtime's caching layer.

The script needs no explicit resume-detection logic. The iteration counter's current value drives the log message: if iteration > 1 when the script first runs a `log()` in the loop, the "Resuming" form is emitted.

### TSPEC-LOOP-07: POSTMORTEM Branch

Triggered when `iteration >= 5` and gate state is FAIL after iteration 5's optimizer invocation (i.e., the cap check fires at the start of iteration 6).

The script invokes the optimizer skill as a POSTMORTEM-writing agent with this prompt:

> Write `docs/{featureName}/POSTMORTEM-{phase}-{featureName}.md`. Include the required sections: Phase, Iterations (5 — limit reached), Reviewers, Pattern of Disagreement, Best-Guess Root Cause, Recommendation. Read all cross-review files for this phase (all versioned suffixes) to identify unresolved findings. Commit and push.

If the POSTMORTEM agent itself fails:
- The pipeline halts without a POSTMORTEM artifact.
- The final report notes: `"WARNING: POSTMORTEM agent failed — artifact not written for phase {phase}"`.
- No retry is attempted.

The final report always includes (whether POSTMORTEM was written or not):
- Which phase failed to converge
- Which reviewers did not approve in iteration 5
- All unresolved High and Medium findings from iteration 5's cross-reviews
- The POSTMORTEM path (or the failure note)

### TSPEC-LOOP-08: Return Type

```ts
type ReviewLoopResult = {
  converged: boolean;   // true if both reviewers approved; false on 5-iteration cap
  iterations: number;   // number of review iterations completed (1–5)
};
```

---

## 4. VERDICT and `DECISIONS_WARRANTED` Parsing

### TSPEC-PARSE-01: `parseVerdict` Function

```js
/**
 * Extract VERDICT from a reviewer agent result string.
 * @param {string | null | undefined} result - Raw agent result
 * @param {string} skillName - Reviewer skill identifier for warning messages
 * @returns {{ verdict: string, high: number, medium: number, low: number }}
 */
function parseVerdict(result, skillName)
```

**Algorithm:**

```
VALID_VERDICTS ← ["Approved", "Approved with minor changes", "Needs revision"]

if result is null, undefined, or (after trimming) empty string:
  emit log("WARNING: reviewer {skillName} returned no VERDICT — treating as Needs revision")
  return { verdict: "Needs revision", high: 0, medium: 0, low: 0 }

lines ← result.split("\n")
reversed ← lines.slice().reverse()

verdictLine ← null
verdictLineIndex ← -1

for each line in reversed (index i in reversed array):
  trimmed ← line.trim()
  if trimmed starts with "VERDICT: ":          // case-sensitive prefix check; NOT regex
    verdictLine ← trimmed
    verdictLineIndex ← lines.length - 1 - i   // original index in `lines`
    break

if verdictLine is null:
  emit log("WARNING: reviewer {skillName} returned no VERDICT — treating as Needs revision")
  return { verdict: "Needs revision", high: 0, medium: 0, low: 0 }

rawVerdict ← verdictLine.slice("VERDICT: ".length).trim()

if rawVerdict NOT in VALID_VERDICTS (case-sensitive exact equality):
  emit log("WARNING: reviewer {skillName} returned no VERDICT — treating as Needs revision")
  return { verdict: "Needs revision", high: 0, medium: 0, low: 0 }

// Find next non-empty line after the VERDICT line
nextNonEmpty ← null
for j from (verdictLineIndex + 1) to (lines.length - 1):
  if lines[j].trim() !== "":
    nextNonEmpty ← lines[j].trim()
    break

// Truncated-output special case
if nextNonEmpty is null:
  return { verdict: rawVerdict, high: 0, medium: 0, low: 0 }
  // No warning emitted; verdict accepted; zero counts applied

// Parse JSON
parsed ← null
try:
  parsed ← JSON.parse(nextNonEmpty)
catch:
  emit log("WARNING: reviewer {skillName} returned no VERDICT — treating as Needs revision")
  return { verdict: "Needs revision", high: 0, medium: 0, low: 0 }

// Validate JSON structure: exactly keys {high, medium, low}, all non-negative integers
keys ← Object.keys(parsed).sort()
if keys does not deep-equal ["high", "low", "medium"]:    // sorted key set check
  emit log("WARNING: reviewer {skillName} returned no VERDICT — treating as Needs revision")
  return { verdict: "Needs revision", high: 0, medium: 0, low: 0 }

if any of parsed.high, parsed.medium, parsed.low is not a non-negative integer:
  emit log("WARNING: reviewer {skillName} returned no VERDICT — treating as Needs revision")
  return { verdict: "Needs revision", high: 0, medium: 0, low: 0 }

// All checks pass — check for intervening text (non-empty lines between VERDICT and JSON)
// The "next non-empty line" approach already handles this:
// if there is any non-empty line between verdictLine and the JSON line,
// nextNonEmpty picks the first non-empty line. If that line is not valid JSON
// but there is valid JSON further down, the check above catches the invalid JSON
// and triggers fallback. Intervening text thus cannot be silently skipped.

return { verdict: rawVerdict, high: parsed.high, medium: parsed.medium, low: parsed.low }
```

### TSPEC-PARSE-02: Intervening Text Handling

The "next non-empty line" scan picks the **first** non-empty line after the VERDICT line. If intervening non-empty text (that is not valid JSON) appears before the JSON object, `JSON.parse()` on that text fails, and the fallback is triggered. There is no code path that scans past intervening text to find JSON further down.

### TSPEC-PARSE-03: Truncated-Output Special Cases

| Case | Input | Result |
|---|---|---|
| VERDICT is the last line | `"...\nVERDICT: Approved"` | verdict = `Approved`, counts = `{0,0,0}`, no warning |
| VERDICT followed only by blank lines | `"...\nVERDICT: Approved\n\n\n"` | verdict = `Approved`, counts = `{0,0,0}`, no warning |
| VERDICT: Needs revision as last line | `"...\nVERDICT: Needs revision"` | verdict = `Needs revision`, gate = FAIL, no warning |

### TSPEC-PARSE-04: Fallback Conditions Summary

Any of the following triggers the fallback (`Needs revision` + warning log):

| # | Condition |
|---|---|
| 1 | `result` is null, undefined, empty string, or whitespace-only |
| 2 | No line in `result` starts with `"VERDICT: "` after trimming |
| 3 | Raw verdict string is not one of the three valid values (case-sensitive) |
| 4 | First non-empty line after VERDICT is not valid JSON |
| 5 | JSON key set is not exactly `{"high", "medium", "low"}` |
| 6 | Any JSON value is negative or not an integer |

Truncated output (no non-empty line after VERDICT) is **not** a fallback condition — it is the special case in TSPEC-PARSE-03.

### TSPEC-PARSE-05: `parseDecisionsWarranted` Function

```js
/**
 * Extract DECISIONS_WARRANTED value from an se-author post-PASS result.
 * @param {string | null | undefined} result - Raw agent result
 * @returns {boolean}  true if warranted (or absent/malformed); false only on explicit false
 */
function parseDecisionsWarranted(result)
```

**Algorithm:**

```
if result is null, undefined, or (after trimming) empty:
  emit log("WARNING: DECISIONS_WARRANTED field absent or malformed — defaulting to true")
  return true

lines ← result.split("\n")
reversed ← lines.slice().reverse()

for each line in reversed:
  trimmed ← line.trim()
  if trimmed starts with "DECISIONS_WARRANTED: ":     // case-sensitive prefix check
    rawValue ← trimmed.slice("DECISIONS_WARRANTED: ".length).trim().toLowerCase()
    if rawValue === "true":
      return true
    if rawValue === "false":
      return false
    // value is not "true" or "false" → fall through to absent handling
    break

// Field absent or value not recognized
emit log("WARNING: DECISIONS_WARRANTED field absent or malformed — defaulting to true")
return true
```

The prefix check for `DECISIONS_WARRANTED:` uses case-sensitive matching (the key is uppercase). Only the *value* extraction uses `.toLowerCase()` for case-insensitive comparison to `"true"` / `"false"`.

---

## 5. Pipeline Entry Point

### TSPEC-ENTRY-01: REQ Path Validation

The main function receives `reqPath` as its first argument. Validation sequence:

```
1. If reqPath is absent or empty:
   halt("Error: no REQ path provided. Usage: /pdlc:orchestrate-dev docs/{feature}/REQ-{feature}.md")

2. PATTERN ← /^docs\/([^/]+)\/REQ-\1\.md$/
   match ← PATTERN.exec(reqPath)
   if match is null:
     halt("Error: REQ path does not match expected pattern docs/{feature}/REQ-{feature}.md — got: {reqPath}")

3. featureName ← match[1]   // captured group from the regex

4. Check file existence: invoke file-existence agent or filesystem check
   if file does not exist:
     halt("Error: REQ file not found at {reqPath}")

5. Check file is non-empty:
   if file content is empty:
     halt("Error: REQ file at {reqPath} is empty")
```

### TSPEC-ENTRY-02: Feature Name Extraction

The `featureName` is the string captured by group 1 of the regex `/^docs\/([^/]+)\/REQ-\1\.md$/`. The backreference `\1` enforces that the directory name and the filename segment match. Examples:

| Input path | Extracted `featureName` |
|---|---|
| `docs/postgres-storage/REQ-postgres-storage.md` | `postgres-storage` |
| `docs/auth-refactor/REQ-auth-refactor.md` | `auth-refactor` |
| `docs/my-feature/REQ.md` | — pattern mismatch → halt |

### TSPEC-ENTRY-03: File-Existence Check

The file-existence check is implemented as a single `agent()` call with a minimal instruction to check whether the path exists and return "EXISTS" or "NOT FOUND". This avoids direct filesystem access from the script body where the workflow runtime may not expose Node.js `fs` directly.

Alternatively, if the runtime exposes a `readFile()` utility or the `agent()` call can read a file synchronously, the existence check and content check are combined in a single step. The implementation chooses the minimal approach available at authoring time.

---

## 6. Implementation Phase

### TSPEC-IMPL-01: PLAN DAG Parsing

The script invokes a single `agent()` call that:

1. Reads `docs/{featureName}/PLAN-{featureName}.md`
2. Extracts the task table
3. Returns a structured JSON list of task records

Expected agent return format (the agent is instructed to return this JSON):

```json
{
  "tasks": [
    {
      "id": "TASK-01",
      "description": "...",
      "dependencies": ["TASK-00"],
      "planBatch": 2
    }
  ]
}
```

`planBatch` is advisory — it records the PLAN's stated batch label for inconsistency detection (TSPEC-IMPL-02).

If the agent fails to return parseable JSON (empty result, non-JSON, or JSON that does not match the schema), the script halts with: `"Error: PLAN parsing agent failed to return structured task list"`.

### TSPEC-IMPL-02: Topological Batching Algorithm

Input: array of task records with `id` and `dependencies[]`.

```
completed ← empty set
batches ← []

loop:
  ready ← tasks where all dependencies are in completed AND task not in completed
  if ready is empty AND completed.size < tasks.length:
    halt("Error: PLAN dependency graph contains a cycle — cannot compute topological batches")
  if ready is empty:
    break

  // Detect PLAN batch label inconsistency
  if any task in `ready` has planBatch <= max planBatch of already-completed tasks:
    log("WARNING: PLAN batch labels inconsistent with dependency edges — re-deriving topological batches")

  // Sort ready tasks by their order in the original PLAN task table (document order)
  ready.sort(byPlanDocumentOrder)

  // Split into sub-batches of at most 5
  subBatches ← chunk(ready, 5)
  for each subBatch in subBatches:
    batches.append(subBatch)
    // Sub-batches at the same topological level execute sequentially
    // so each sub-batch is its own entry in the batches array

  completed ← completed ∪ set(ready)

return batches
```

Sub-batches at the same topological level are represented as separate entries in `batches` — sequential ordering is implied. Batches from distinct topological levels are also sequential (dependent levels cannot run concurrently).

### TSPEC-IMPL-03: Batch Plan Logging

Before any `agent()` call for `se-implement`, the script emits:

```js
log("Implementation batch plan:");
for (let i = 0; i < batches.length; i++) {
  const deps = batches[i].some(t => t.dependencies.length > 0)
    ? `  (depends on: Batch ${i})`
    : "";
  log(`  Batch ${i + 1}: [${batches[i].map(t => t.id).join(", ")}]${deps}`);
}
log(`  Total: ${tasks.length} tasks in ${batches.length} batches`);
```

The `log()` statements for the batch plan are sequential statements in the script that precede the first `agent()` call for any `se-implement` task. This is a call-order guarantee verifiable by reading the script's statement sequence.

Fallback: if `log()` does not surface structured data in `/workflows`, the script emits a `phase()` label per batch: `"Phase I: Batch N/M — [task-1, task-2, ...]"`.

### TSPEC-IMPL-04: Per-Batch `se-implement` Dispatch

For each batch in `batches`:

```js
phase(`Phase I: Batch ${batchIndex + 1}/${batches.length}`);

const batchResults = await parallel(
  batch.map(task =>
    agent("se-implement", implementPrompt(task, featureName), { isolation: "worktree" })
  )
);

// Merge worktrees back in PLAN document order
for (const [i, task] of batch.entries()) {
  await mergeWorktree(task, featureName, batchResults[i]);
}

// Per-batch test gate
evaluateBatchGate(batchResults, batchIndex, batch);
```

Each `se-implement` agent receives:
- The specific task row (id, description, dependencies)
- Path to `TSPEC-{featureName}.md`
- Path to `PROPERTIES-{featureName}.md`

### TSPEC-IMPL-05: Worktree Merge-Back

```
for each task in batch (in PLAN document order):
  result of mergeWorktree(task, featureName):
    invoke: git merge --no-ff <worktree-branch-for-task> onto feat-{featureName}
    if merge exits with conflict:
      invoke: git merge --abort
      leave conflicting worktree in place
      halt pipeline with:
        "Error: merge conflict merging worktree for task {task.id} into feat-{featureName}
         — conflicting files: {file-list}. Pipeline halted."
      do NOT merge remaining worktrees in this batch
    if merge succeeds:
      continue to next worktree
```

The runtime does **not** auto-merge worktrees. Each worktree requires an explicit `git merge --no-ff` call. All worktrees in a batch must merge successfully before the per-batch test gate runs.

### TSPEC-IMPL-06: Per-Batch Test Gate

```
function evaluateBatchGate(results, batchIndex, batch):
  for each result in results (index i):
    task ← batch[i]

    // Rule 1: empty-result check (evaluated before failure-marker scan)
    if result is null OR result is undefined OR result.trim() === "":
      halt("Error: Batch {batchIndex + 1} agent returned empty result — treating as failure")

    // Rule 2: failure marker scan
    if result contains line matching /Tests: \d+ failed/ (where digit > 0):
      halt with batch failure report (batch number, task id, failure summary)
    if result (case-insensitive) contains "non-zero exit":
      halt with batch failure report

  // All agents passed
  log("Batch {batchIndex + 1} complete — all tests passing")
```

The empty-result check is evaluated first and short-circuits to failure before any marker scan.

On batch pass, the script proceeds to dispatch the next batch (or Phase PT if this was the final batch).

### TSPEC-IMPL-07: Phase PT — PROPERTIES Tests

After all implementation batches pass:

```js
phase("Phase PT: PROPERTIES Tests");

const ptResult = await agent(
  "se-implement",
  propertiesTestPrompt(featureName),
);

// Apply same empty-result and failure-marker checks as §TSPEC-IMPL-06
evaluateSingleAgentGate(ptResult, "PT");
```

If Phase PT fails, the pipeline halts with the same halt behavior as a batch failure. The pipeline does not proceed to Phase CR.

### TSPEC-IMPL-08: Phase CR — Final Codebase Review

Phase CR uses `reviewLoop` with:

```js
const crResult = await reviewLoop({
  doc: `docs/${featureName}/`,   // feature directory, not a single file
  phase: "CR",
  reviewers: PHASE_DISPATCH.CR.reviewers,   // ["pm-review", "te-review"]
  optimizer: PHASE_DISPATCH.CR.optimizer,   // "se-author"
  feature: featureName,
});
```

The `doc` value is the feature directory path. The §1.1 entry precondition for Phase CR skips the single-file existence check and verifies only that the directory exists (always true after Phase I). Reviewers are instructed to review the codebase on the current feature branch.

Cross-review output files: `CROSS-REVIEW-product-manager-IMPLEMENTATION[-vN].md`, `CROSS-REVIEW-test-engineer-IMPLEMENTATION[-vN].md`.

---

## 7. Harvest Phase

### TSPEC-HARVEST-01: `PHASE_H_ENABLED` Compile-Time Flag

At the top of the script, before any executable logic:

```js
const PHASE_H_ENABLED = true; // Set to false until feature-branch-consistency fix lands
```

This flag is the scripted representation of the SKILL.md §9.5 caveat about worktree artifacts needing to merge onto the feature branch before harvest can read them.

When `PHASE_H_ENABLED` is `false`:

```js
if (!PHASE_H_ENABLED) {
  phase("Phase H: ⏭ Skipped (prerequisite)");
  log("Phase H skipped — prerequisite not yet landed");
  // Phase H listed in final report as: "Phase H: ⏭ Skipped (prerequisite not yet landed)"
  return buildFinalReport({ ..., phaseH: "skipped-prerequisite" });
}
```

### TSPEC-HARVEST-02: Harvest Agent Invocation

When `PHASE_H_ENABLED` is `true`:

```js
phase("Phase H: Harvest");

const harvestResult = await agent(
  "harvest-learnings",
  harvestPrompt(featureName),
);
```

The harvest agent prompt instructs:

1. Read all `CROSS-REVIEW-*.md` files (every doc type, every `-vN` suffix) for the feature.
2. Read all `POSTMORTEM-*.md` files for the feature (if any).
3. Write `docs/{featureName}/LEARNINGS-{featureName}.md`.
4. Commit and push LEARNINGS **before** any delete operation.
5. Only after the LEARNINGS commit is confirmed on remote, delete the harvested `CROSS-REVIEW-*` files.
6. Commit and push the deletions.

### TSPEC-HARVEST-03: Guard Hook Interaction

The `guard-harvest-before-delete` PreToolUse hook fires when the harvest agent's Bash call attempts to delete a `CROSS-REVIEW-*` file.

**Success path:** Hook finds `LEARNINGS-{featureName}.md` on the branch → exits zero → deletion proceeds.

**Block path:** Hook does not find `LEARNINGS-{featureName}.md` → exits non-zero → the harvest agent's Bash call exits non-zero → the agent result contains the guard hook's error message text.

### TSPEC-HARVEST-04: Halt on Guard Block

The script detects a guard block by inspecting `harvestResult` for non-zero exit signals in the result string. Guard block detection:

```js
if (harvestResult contains indicators of non-zero exit or guard hook error message):
  halt("Phase H halted: guard-harvest-before-delete blocked deletion of {blocked-file-path}")
```

On guard block:
- The workflow halts immediately.
- No deletion retries.
- All `CROSS-REVIEW-*` files remain in place.
- The final report states the guard-triggered failure with the blocked file path.

---

## 8. Error Handling

### TSPEC-ERROR-01: Error Response Mapping

The following table maps every error scenario from FSPEC §7 to the concrete script-level response:

| Error Scenario (FSPEC §) | Return Value Check | Log Message Format | Halt Condition |
|---|---|---|---|
| **§6.1** REQ path absent | `reqPath` falsy | `"Error: no REQ path provided. Usage: /pdlc:orchestrate-dev docs/{feature}/REQ-{feature}.md"` | Immediate; no agents dispatched |
| **§6.1** REQ path pattern mismatch | regex returns `null` | `"Error: REQ path does not match expected pattern docs/{feature}/REQ-{feature}.md — got: {reqPath}"` | Immediate; no agents dispatched |
| **§6.1** REQ file not found | file-existence agent returns NOT FOUND | `"Error: REQ file not found at {reqPath}"` | Immediate; no agents dispatched |
| **§6.1** REQ file empty | content length === 0 | `"Error: REQ file at {reqPath} is empty"` | Immediate; no agents dispatched |
| **§0.2** Creator agent failure | agent result contains error signal or is empty | `"Error: creator agent {skill} failed to produce {outputPath} for phase {phase}"` | Halt before reviewLoop entry |
| **§7.2** Document absent before reviewLoop | `fs.existsSync(doc)` false (non-CR phases) | `"Error: {doc} does not exist — cannot enter reviewLoop for phase {phase}"` | Halt at reviewLoop entry; no reviewers dispatched |
| **§7.3** Reviewer agent crash/timeout | result is null/empty/no VERDICT | `"WARNING: reviewer {skillName} returned no VERDICT — treating as Needs revision"` | No halt; treat as Needs revision, loop continues |
| **§7.3** Both reviewers crash same iteration | Both results trigger fallback | Two warning logs (one per reviewer, in any order) | No halt; optimizer invoked once; loop continues |
| **§7.4** Optimizer agent failure | result contains non-zero exit or error signal | `"Error: optimizer agent {optimizer} failed during phase {phase}, iteration {N} — pipeline halted. Document at {doc} may be in an inconsistent state."` | Immediate halt; no retry |
| **§1.9** POSTMORTEM agent failure | result empty or error signal | `"WARNING: POSTMORTEM agent failed — artifact not written for phase {phase}"` | Pipeline still halts (non-convergence); no retry |
| **§4.5** Merge conflict | `git merge` exits with conflict | `"Error: merge conflict merging worktree for task {taskId} into feat-{featureName} — conflicting files: {fileList}. Pipeline halted."` | Immediate halt; `git merge --abort` called; remaining worktrees not merged |
| **§4.6** Batch agent empty result | result is null/undefined/empty/whitespace | `"Error: Batch {N} agent returned empty result — treating as failure"` | Immediate halt; subsequent batches not dispatched |
| **§4.6** Test failure marker | result contains `Tests: N failed` or `non-zero exit` | Final report: batch number, failing task IDs, failure summary from agent result | Immediate halt; subsequent batches not dispatched |
| **§4.3** DAG cycle | no ready tasks while incomplete tasks remain | `"Error: PLAN dependency graph contains a cycle — cannot compute topological batches"` | Immediate halt |
| **§4.2** PLAN parse failure | agent returns non-JSON or empty | `"Error: PLAN parsing agent failed to return structured task list"` | Immediate halt |
| **§5.4** Guard hook block | harvest agent result contains non-zero exit / hook error | `"Phase H halted: guard-harvest-before-delete blocked deletion of {blockedFilePath}"` | Immediate halt; no retry |
| **§7.5** Other hook-triggered non-zero exit | agent Bash call exits non-zero due to hook | Named in final report with hook name, blocked tool call, file path | Immediate halt (no specific recovery path defined) |

### TSPEC-ERROR-02: Error Detection in Agent Results

An agent result is considered to indicate failure when any of these conditions hold:

1. The result is `null`, `undefined`, or an empty/whitespace-only string.
2. The result string contains `"non-zero exit"` (case-insensitive).
3. The result string contains an explicit error message matching the expected error format for that operation.

For optimizer and creator agents, condition 1 is sufficient to classify the result as a failure and trigger the halt.

### TSPEC-ERROR-03: Final Report Structure

The final report object (returned as the workflow's top-level return value) has the following shape:

```ts
type FinalReport = {
  feature: string;
  outcome: "success" | "halted";
  phases: PhaseReport[];
  artifactPaths: string[];
  testSummary: string;        // "All tests passing" or failure description
  harvestStatus: string;      // "Harvested" | "Skipped (prerequisite)" | "Halted: ..."
  haltReason?: string;        // Present only when outcome === "halted"
};

type PhaseReport = {
  phase: string;              // "R", "F", "T", "D", "P", "PR", "I", "PT", "CR", "H"
  label: string;
  status: "✅" | "❌" | "⏭";
  iterations?: number;        // Present for reviewLoop phases
  detail?: string;            // e.g. "Approved (2 iterations)" | "Skipped — ..." | "POSTMORTEM: ..."
};
```

---

## 9. `DECISIONS_WARRANTED` Determination

### TSPEC-DECISIONS-01: Post-PASS `se-author` Call

After the TSPEC `reviewLoop` exits with `converged: true` (PASS), the script **always** invokes a mandatory post-PASS `se-author` call:

```js
phase("Phase T: Post-PASS TSPEC Finalization");

const postPassResult = await agent(
  "se-author",
  postPassTSPECPrompt(featureName),
);
```

This call is **not** the in-loop optimizer. It is a separate, additional step that occurs after the loop exits with PASS, and is invoked regardless of how many iterations the loop ran (including when the loop passed on iteration 1).

The prompt appends the `DECISIONS_WARRANTED` return-value instruction:

> Finalize `docs/{featureName}/TSPEC-{featureName}.md` by addressing all outstanding TSPEC cross-review findings. After completing your response, end your final message with:
> `DECISIONS_WARRANTED: true` if load-bearing architectural alternatives were weighed and rejected during the TSPEC review; `DECISIONS_WARRANTED: false` if this is a trivial feature with no real alternatives considered.

### TSPEC-DECISIONS-02: Parsing and Default

```js
const decisionsWarranted = parseDecisionsWarranted(postPassResult);
// parseDecisionsWarranted algorithm is defined in TSPEC-PARSE-05
```

When `decisionsWarranted` is `false` → skip Phase D:

```js
phase("Phase D: ⏭ Skipped");
log("Phase D skipped — no load-bearing alternatives");
// Phase D appears in final report as: "Phase D: ⏭ Skipped"
```

When `decisionsWarranted` is `true` (explicit or defaulted) → enter Phase D full path:

```js
phase("Phase D: DECISIONS Review");
// invoke se-author to create DECISIONS-{featureName}.md
// then enter reviewLoop for Phase D
```

### TSPEC-DECISIONS-03: Injection Scope

The `DECISIONS_WARRANTED:` trailer instruction is **only** appended to the post-PASS agent call (TSPEC-DECISIONS-01). It is **not** appended to any in-loop FAIL-iteration optimizer call. The in-loop optimizer calls use `optimizerPrompt()` which does not include the `DECISIONS_WARRANTED` instruction.

---

## 10. Non-Functional Constraints

### TSPEC-NFR-01: Maximum Concurrent Agent Count

The runtime enforces a maximum of 16 concurrent agents. The script's `parallel()` calls must never exceed 16 concurrent agent invocations at any point:

- Reviewer dispatch: `parallel([agent(), agent()])` — 2 concurrent agents. Well within limit.
- `se-implement` batch dispatch: `parallel(batch.map(...))` where `batch.length ≤ 5` — max 5 concurrent agents. Well within limit.

No `parallel()` call in the script dispatches more than 5 agents simultaneously. The 16-agent cap is respected by design.

### TSPEC-NFR-02: Worst-Case Agent Count

The closed-form formula for maximum total agent count per run (from FSPEC OQ-04, corrected from REQ-NFR-01):

```
1  (entry validation agent)
+ 8 × 5 × 3  (8 review phases × 5 iterations × [2 reviewers + 1 optimizer])
+ 5 × 5      (5 se-implement agents × 5 batches)
+ 1          (PT agent)
+ 1          (harvest agent)
+ 8          (POSTMORTEM agents — one per non-converging review phase, worst case)
= 1 + 120 + 25 + 1 + 1 + 8
= 156 agents worst case
```

156 is well under the 1,000-agent-per-run cap. (The REQ states ~148; the FSPEC OQ-04 correction yields 148 excluding the post-PASS se-author call; with 8 post-PASS se-author calls at 1 each the total is ~156. In all cases the cap is not approached.)

Note: the 8 review phases are R, F, T, D, P, PR, CR, and the post-PASS TSPEC call also counts. The formula counts Phase D conservatively (as if always present). In the skip path, the count is lower.

### TSPEC-NFR-03: Context Isolation

Agent result objects are stored in script-local variables only. The constraint is enforced structurally:

- `log()` calls receive only scalar string messages. Agent result objects are never passed to `log()`.
- Reviewer results (`result1`, `result2`) are scoped to the `reviewLoop` function body.
- Optimizer results are scoped to the loop iteration.
- Batch results are scoped to the batch dispatch block.
- The only value that exits the script to the main conversation context is the final report object returned by `main()`. The final report contains only summary strings and metadata — no cross-review content, reviewer findings, or per-phase intermediate output.

### TSPEC-NFR-04: VERDICT Trailer as Permanent SKILL.md Addition

Per FSPEC OQ-02 (resolved), the VERDICT trailer is a **permanent addition** to the SKILL.md files of `se-review`, `te-review`, and `pm-review`. It is **not** injected by the workflow script at runtime. The three SKILL.md changes are Phase 1 deliverables alongside the workflow script. Interactive callers and the Ptah engine always receive the trailer.

### TSPEC-NFR-05: `tech-lead` Skill Preservation

Per REQ-COMPAT-03, `tech-lead` and `tech-lead-python` remain in the repo unchanged for standalone/interactive use. The workflow script does **not** route through `tech-lead` — the DAG-parse/batch/dispatch logic is implemented directly in the script body (TSPEC-IMPL-01 through TSPEC-IMPL-08).

---

## 11. Requirements Traceability

| Requirement | TSPEC Item(s) |
|---|---|
| REQ-PIPELINE-01 | TSPEC-SCRIPT-01 – 05, TSPEC-ENTRY-01 – 03 |
| REQ-PIPELINE-02 | TSPEC-DISPATCH-01, TSPEC-IMPL-07, TSPEC-IMPL-08 |
| REQ-PIPELINE-03 | TSPEC-LOOP-06, TSPEC-LOOP-05 |
| REQ-GATE-01 | TSPEC-LOOP-03, TSPEC-PARSE-01 |
| REQ-GATE-02 | TSPEC-LOOP-03 – 08, TSPEC-DECISIONS-01 – 03 |
| REQ-GATE-03 | TSPEC-IMPL-03, TSPEC-IMPL-04 |
| REQ-GATE-04 | TSPEC-LOOP-07 |
| REQ-GATE-05 | TSPEC-PARSE-01, TSPEC-PARSE-04, TSPEC-ERROR-01 |
| REQ-COMPAT-01 | TSPEC-PARSE-01, TSPEC-NFR-04 |
| REQ-COMPAT-02 | TSPEC-HARVEST-03, TSPEC-HARVEST-04 |
| REQ-COMPAT-03 | TSPEC-NFR-05 |
| REQ-ARTIFACTS-01 | TSPEC-DISPATCH-01 (path templates) |
| REQ-ARTIFACTS-02 | TSPEC-HARVEST-02, TSPEC-HARVEST-03, TSPEC-HARVEST-04 |
| REQ-OBS-01 | TSPEC-LOOP-05, TSPEC-IMPL-03, TSPEC-SCRIPT-05 |
| REQ-OBS-02 | TSPEC-ERROR-03 |
| REQ-SKILL-01 | (addressed in SKILL.md rewrite — Phase 2 deliverable) |
| REQ-NFR-01 | TSPEC-NFR-01, TSPEC-NFR-02 |
| REQ-NFR-02 | TSPEC-NFR-03 |

---

## 12. Open Questions Inherited from FSPEC

| ID | Question | TSPEC Impact |
|---|---|---|
| OQ-01 | Does `resumeFromRunId` match the live runtime API? | Verify before authoring TSPEC-LOOP-06. The script does not invoke resume explicitly — it relies on the runtime caching. No API call needed; OQ-01 is low-risk. |
| OQ-05 | Sync mechanism for plugin source → consumer repo copy | Out of scope for this TSPEC. Implementation note: document manual copy step in SKILL.md until a `pdlc install` script exists. |
