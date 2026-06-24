---
Status: Draft
Author: se-author
Version: 1.4
Feature: orchestrate-dev-workflow
---

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → **TSPEC** |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Scope | Workflow script architecture, Phase Dispatch Table, `reviewLoop` algorithm, VERDICT and `DECISIONS_WARRANTED` parsing, pipeline entry validation, implementation phase DAG execution, harvest phase, error handling, and non-functional constraints |
| Cross-Reviews | CROSS-REVIEW-product-manager-TSPEC.md, CROSS-REVIEW-test-engineer-TSPEC.md, CROSS-REVIEW-product-manager-TSPEC-v2.md, CROSS-REVIEW-test-engineer-TSPEC-v2.md |
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

- For all phases except `CR`: the file existence is verified by the initial guard agent's return value (`ok: false` with `reason: "file_not_found"` | `"file_empty"` | `"path_invalid"` indicates the document is absent or invalid). The workflow script has no direct filesystem access per the REQ constraint — existence checking uses the agent approach as specified in TSPEC-ENTRY-03, not `fs.existsSync`. If the guard agent indicates the document is absent, `reviewLoop` returns immediately without dispatching any agent and the caller halts with:
  ```
  Error: {doc} does not exist — cannot enter reviewLoop for phase {phase}
  ```
- For Phase `CR`: the check is that the directory at `doc` exists (always true after Phase I; skip the existence check for Phase CR by design).

### TSPEC-LOOP-03: Iteration Loop Algorithm

```
iteration ← 1
loop:
  // (a) Check iteration cap at loop-top (fires after n=5 optimizer increments counter to 6)
  if iteration > 5:
    // POSTMORTEM trigger: loop exhaustion after n=5 optimizer completed and counter reached 6.
    // All 5 review–optimize cycles have run. The POSTMORTEM is triggered by loop exhaustion,
    // not by detecting a FAIL at iteration 5 before the optimizer runs.
    await writePostmortem({ phase, feature, iteration: 5, verdict1, verdict2, result1, result2, reviewers })
    // writePostmortem is awaited; pipeline halts after it completes (or on failure)
    return { converged: false, iterations: 5 }

  // (b) Emit iteration log
  if iteration === 1 and not resumed:
    log("Starting iteration 1")
  else:
    log("Resuming from iteration " + iteration)

  // (c) Dispatch reviewers in parallel
  [result1, result2] ← await parallel([
    agent(reviewers[0], reviewerPrompt(doc, phase, feature, iteration)),
    agent(reviewers[1], reviewerPrompt(doc, phase, feature, iteration)),
  ])

  // (d) Parse verdicts
  verdict1 ← parseVerdict(result1, reviewers[0])
  verdict2 ← parseVerdict(result2, reviewers[1])

  // (e) Evaluate gate
  gateState ← (isPass(verdict1) AND isPass(verdict2)) ? "PASS" : "FAIL"

  // (f) Branch on PASS
  if gateState === "PASS":
    return { converged: true, iterations: iteration }

  // gateState is FAIL — invoke optimizer for ALL iterations 1–5
  // (g) Invoke optimizer
  optimizerResult ← await agent(optimizer, optimizerPrompt(doc, phase, feature, iteration))
  if optimizerFailed(optimizerResult):
    halt with: "Error: optimizer agent {optimizer} failed during phase {phase}, iteration {iteration} — pipeline halted. Document at {doc} may be in an inconsistent state."

  iteration ← iteration + 1
  // loop back to (a)
  // Counter-value-to-action table:
  //   iteration 1–5, FAIL: invoke optimizer, increment counter, loop back to cap check
  //   iteration 6 (cap check): invoke POSTMORTEM, return {converged: false}
  //   any iteration, PASS:     return {converged: true}
  // This means 5 reviewer-pair dispatches and 5 optimizer invocations occur before POSTMORTEM.
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

**Trigger condition (normative):** POSTMORTEM is triggered by loop exhaustion — specifically, when the iteration counter reaches 6 at the loop-top cap check (TSPEC-LOOP-03 step a). This occurs after all 5 full review–optimize cycles complete: iterations 1 through 5 each dispatch a reviewer pair and, on FAIL, invoke the optimizer; after the n=5 optimizer completes the counter increments to 6; the cap check `iteration > 5` fires; and the POSTMORTEM branch executes. The POSTMORTEM agent is invoked immediately — **before** `return { converged: false }`. The optimizer IS invoked at iteration 5 (same as iterations 1–4); the POSTMORTEM fires only after that iteration-5 optimizer completes and the counter increments to 6. AT-LOOP-03 boundary: 5 reviewer pairs dispatched, 5 optimizer invocations completed, then POSTMORTEM.

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

**Code path anchors (explicit test inputs for each branching case):**

| Path | Representative input | Expected outcome |
|---|---|---|
| (a) No VERDICT line → fallback | `"Some review text.\nNo verdict here."` | `{ verdict: "Needs revision", high: 0, medium: 0, low: 0 }` + warning log emitted |
| (b) VERDICT line + valid JSON → normal path | `"Review text.\nVERDICT: Approved\n{\"high\": 1, \"medium\": 2, \"low\": 0}\n"` | `{ verdict: "Approved", high: 1, medium: 2, low: 0 }` + no warning |
| (c) VERDICT line + truncated (no next non-empty line, only blanks/EOF) → zero counts accepted | `"Review text.\nVERDICT: Approved\n\n\n"` | `{ verdict: "Approved", high: 0, medium: 0, low: 0 }` + no warning |
| (d) VERDICT line + text-then-JSON (intervening text present) → fallback | `"Review text.\nVERDICT: Approved\nSome extra line\n{\"high\": 0, \"medium\": 0, \"low\": 0}\n"` | `{ verdict: "Needs revision", high: 0, medium: 0, low: 0 }` + warning log emitted |

Path (c) is the truncated-output special case: `nextNonEmpty` is `null` because no non-empty line follows the VERDICT line. Path (d) is the intervening-text case: `nextNonEmpty` picks `"Some extra line"`, `JSON.parse("Some extra line")` throws, and the fallback fires. These two paths are distinct branches in the algorithm and must not be conflated.

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

4. Check file existence: invoke the guard agent (see TSPEC-ENTRY-03)
   if agent returns ok: false with reason "file_not_found" | "path_invalid":
     halt("Error: REQ file not found at {reqPath}")

5. Check file is non-empty:
   if agent returns ok: false with reason "file_empty":
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

REQ file existence is verified by the initial guard agent's return value. The guard agent is invoked as a minimal `agent()` call that checks whether the path exists and is non-empty, then returns a structured result:

```json
{ "ok": true }
// or
{ "ok": false, "reason": "file_not_found" | "file_empty" | "path_invalid" }
```

The workflow script has no direct filesystem access (the workflow runtime does not expose Node.js `fs` to script bodies). The `agent()` call is therefore the **authoritative** existence-check mechanism — there is no `fs.existsSync()` alternative. The guard agent combines the existence check and the non-empty check in a single call, returning the appropriate `reason` value for each failure mode.

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

  // Sort ready tasks by document order (array index in the tasks[] returned by the DAG agent)
  // "Document order" === index order of the tasks[] array returned by TSPEC-IMPL-01.
  // The DAG-parsing agent preserves PLAN task-table order in the array, so array index
  // is the canonical tie-breaker. No additional sort step is needed if the agent returns
  // tasks in document order (which the agent prompt must specify).
  ready.sort(byArrayIndexInOriginalTaskList)

  // Split into sub-batches of at most 5
  // When >5 tasks are ready simultaneously at the same topological level:
  //   Sub-batch A = first 5 tasks in document order
  //   Sub-batch B = remaining tasks in document order
  //   Sub-batch A runs first; sub-batch B runs only after sub-batch A passes its test gate.
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

**Sub-batch ordering when >5 tasks are ready simultaneously:** When a topological level contains more than 5 ready tasks, they are split into sub-batches by document order (array index in the `tasks[]` returned by the DAG-parsing agent, which preserves PLAN task-table order). The first 5 tasks in document order form sub-batch A; the remaining tasks form sub-batch B (and so on if >10 tasks). Sub-batch A is logged and dispatched first; sub-batch B runs only after sub-batch A passes its per-batch test gate. The batch plan log reflects this split: sub-batch A and sub-batch B each appear as separate `Batch N` entries.

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
    // Step 1: run merge
    invoke: git merge --no-ff <worktree-branch-for-task> onto feat-{featureName}
    if merge exits with non-zero (conflict):
      // Step 2: extract file list BEFORE aborting
      fileList ← stdout of: git diff --name-only --diff-filter=U
      // Step 3: abort merge
      invoke: git merge --abort
      // Step 4: halt with report
      leave conflicting worktree in place
      halt pipeline with:
        "Error: merge conflict merging worktree for task {task.id} into feat-{featureName}
         — conflicting files: {fileList}. Pipeline halted."
      do NOT merge remaining worktrees in this batch
    if merge succeeds:
      continue to next worktree
```

**Exact command sequence on conflict:** (1) run `git merge --no-ff`; (2) if non-zero exit: run `git diff --name-only --diff-filter=U` to capture the list of conflicting files; (3) run `git merge --abort`; (4) halt the pipeline with the report including the captured file list. `git merge --abort` is called **after** the file-list extraction — extracting after abort would find no conflicts. `{fileList}` in the error message is the newline-joined output of step 2.

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

**Guard hook error message (testable anchor):** The hook script (`hooks/scripts/guard-harvest-before-delete.sh`) writes the following to stderr when it blocks a deletion:

```
pdlc guard: refusing to delete CROSS-REVIEW files in [{dir}] — no LEARNINGS-*.md exists there yet. Run /pdlc:harvest-learnings and commit LEARNINGS first (harvest-then-delete).
```

where `{dir}` is the directory path of the blocked CROSS-REVIEW file (e.g., `docs/my-feature`).

The harvest agent's return value **must contain** the substring `"pdlc guard: refusing to delete CROSS-REVIEW files"` when the block fires. The workflow script checks the agent result for this substring to distinguish a guard-block failure from other agent failures. Detection via this canonical substring is the authoritative method — the exact directory value in the message varies per feature.

### TSPEC-HARVEST-04: Halt on Guard Block

The script detects a guard block by inspecting `harvestResult` for the canonical guard-hook error substring defined in TSPEC-HARVEST-03. Guard block detection:

```js
if (harvestResult.includes("pdlc guard: refusing to delete CROSS-REVIEW files")):
  halt("Phase H halted: guard-harvest-before-delete blocked deletion of {blocked-file-path}")
```

On guard block:
- The workflow halts immediately.
- No deletion retries.
- All `CROSS-REVIEW-*` files remain in place.
- The final report states the guard-triggered failure with the blocked file path.

---

## 7.5 Phase PUB — Raise PR & Verify CI

**Implements:** REQ-SHIP-01, REQ-SHIP-02, REQ-SHIP-03

Phase PUB runs **after** Phase H so the PR captures the complete feature branch, including the harvested `LEARNINGS`. PR creation and CI status reporting are delegated to a new worker skill `ship-pr`; the poll cadence and all gate decisions live in the workflow script.

### TSPEC-SHIP-01: `PHASE_PUB_ENABLED` Compile-Time Flag

At the top of the script, alongside `PHASE_H_ENABLED`:

```js
const PHASE_PUB_ENABLED = true; // Set to false to skip auto-PR + CI verification
```

When `false`, the script emits `phase("Phase PUB: ⏭ Skipped")`, logs `"Phase PUB skipped — auto-PR disabled"`, records the phase as `⏭`, and returns without raising a PR.

A developer wishing to disable Phase PUB edits the consumer runtime copy at `.claude/workflows/orchestrate-dev.js` and sets `PHASE_PUB_ENABLED = false`. The plugin source at `pdlc/workflows/orchestrate-dev.js` should not be edited for per-consumer configuration.

The runtime skip behavior must be tested end-to-end via `main()` with `_raisePrAndVerifyCi` injected as a spy. See PROP-SHIP-14 in PROPERTIES §12.5.

### TSPEC-SHIP-02: CI Poll Timing Constants

```js
const CI_NO_CHECKS_TIMEOUT_MS = 10 * 60 * 1000; // 10 min — no checks ⇒ assume none configured
const CI_POLL_INTERVAL_MS = 30 * 1000;          // 30 s between status polls
const CI_COMPLETION_TIMEOUT_MS = 30 * 60 * 1000; // 30 min — overall cap once checks are running
```

All three are overridable as named parameters to `raisePrAndVerifyCi` for testing. The clock (`_now`) and sleep (`_sleep`) are injectable; in production `_now = () => Date.now()` and `_sleep` is a real `setTimeout`-based delay.

### TSPEC-SHIP-03: Trailer Parsers

```js
parsePrUrl(result)   // → string URL, or null for "PR_URL: none" / missing / empty
parseCiStatus(result) // → "none" | "pending" | "passed" | "failed" | "unknown"
```

Both reverse-scan for the last matching trailer line (`PR_URL: ` / `CI_STATUS: `), mirroring `parseVerdict`. `parseCiStatus` lowercases the value, takes the first whitespace-delimited token (so trailing prose is ignored), and maps anything outside the four valid tokens — or a missing/empty result — to `"unknown"`.

Both parsers extract from the agent result string returned by `agent()` — not from any file on disk. This satisfies REQ-SHIP-03 AC(2).

`parsePrUrl` also returns `null` when the value after `PR_URL: ` prefix is empty or whitespace-only (e.g., `PR_URL: ` with nothing after the space). This is the same treatment as `PR_URL: none`.

### TSPEC-SHIP-04: `raisePrAndVerifyCi` Algorithm

```
prResult ← agent("ship-pr", createPrPrompt(feature))
prUrl ← parsePrUrl(prResult)
if prUrl is null:
  halt("Error: Phase PUB — PR creation failed for feature {feature} (no PR_URL returned)")

start ← now()
completionStart ← null
loop:
  status ← parseCiStatus(agent("ship-pr", pollCiPrompt(feature, prUrl)))
  if status === "passed":  return { prUrl, ciStatus: "passed" }
  if status === "failed":  halt("Error: Phase PUB — GHA checks failed for PR {prUrl}")
  if status === "pending" and completionStart is null:
    completionStart ← now()   // first pending — start the completion budget here

  if completionStart is not null:
    if now() - completionStart ≥ CI_COMPLETION_TIMEOUT_MS:
      halt("Error: Phase PUB — GHA checks did not complete within {N} minutes for PR {prUrl}")
  else if now() - start ≥ CI_NO_CHECKS_TIMEOUT_MS:
    // no checks ever appeared (none/unknown) — assume repo has no PR checks
    return { prUrl, ciStatus: "no-checks" }

  sleep(CI_POLL_INTERVAL_MS)
```

The completion cap is measured from the first `pending` poll (when `completionStart` is set), giving checks a full `CI_COMPLETION_TIMEOUT_MS` budget regardless of registration latency — not from PR-raise time. The no-checks window remains measured from PR-raise (`start`).

`none` and `unknown` are treated identically while no checks have been seen — both keep the loop in the no-checks window. Once any poll returns `pending`, the loop switches to the completion window. The agent performs **one** status read per invocation and never sleeps; the loop owns the cadence.

**No-merge constraint (normative):** The `createPrPrompt()` function MUST include explicit "do not merge" instruction text. The implementation at line 521 of `orchestrate-dev.js` contains `"Do NOT merge the PR."` — this exact phrase is the testable anchor. The PROPERTIES author should add a static property asserting that the prompt string returned by `createPrPrompt()` contains this instruction. The PR is never auto-merged.

**Boundary case — `pending` at or after no-checks timeout boundary:** If a poll returns `pending` on the same iteration where `now() - start >= CI_NO_CHECKS_TIMEOUT_MS`, `completionStart` is set and the completion window activates. The no-checks timeout does NOT fire on that iteration — the `completionStart` assignment happens before the timeout guards in the evaluation order, and the `completionStart is not null` branch takes precedence over the no-checks branch. This edge case is named separately because a naive implementation that evaluates the no-checks guard before the `completionStart` assignment would fail it.

**`none`/`unknown` after `checksSeen` is true:** When `checksSeen` is `true`, a subsequent `none` or `unknown` status is silently ignored — the loop sleeps and polls again. It does NOT exit via the no-checks path.

### TSPEC-SHIP-05: Pipeline Wiring and Report Fields

In `main()`, after Phase H:

```js
phase("Phase PUB: Raise PR & Verify CI");
const pubResult = await raisePrAndVerifyCi({ feature: featureName, _agent, _log, _now, _sleep });
prUrl = pubResult.prUrl;
ciStatus = pubResult.ciStatus;
recordPhase("PUB", "Raise PR & Verify CI", "✅", ciDetail);
```

`raisePrAndVerifyCi` is injectable via `_raisePrAndVerifyCi` for pipeline-wiring tests. The `PHASE_PUB_ENABLED` module constant is the default for the `_phasePubEnabled` parameter of `main()`; tests inject `_phasePubEnabled: false` to exercise the skip path end-to-end (PROP-SHIP-14) without editing the module-level constant. The `FinalReport` (TSPEC-ERROR-03) gains two optional fields: `prUrl?: string` and `ciStatus?: "passed" | "no-checks"`. A halt inside Phase PUB is caught by the existing `main()` try/catch and surfaced as `outcome: "halted"` with the halt reason.

**Static check scope note (PROP-SHIP-11):** The static check in `shipPhase.test.js` catches direct variable references to agent results passed to `log()`; indirect string interpolation (e.g., template literals containing result variables) is outside the static check's scope and is trusted to follow the same convention as the rest of the script per TSPEC-NFR-03.

### TSPEC-SHIP-06: `ship-pr` SKILL.md

`pdlc/skills/ship-pr/SKILL.md` documents the two jobs (create-PR, report-CI) and the `PR_URL:` / `CI_STATUS:` trailer contracts. The skill performs one discrete action per invocation and never merges the PR or loops on CI itself. Added to the CLAUDE.md skills table.

---

## 8. Error Handling

### TSPEC-ERROR-01: Error Response Mapping

The following table maps every error scenario from FSPEC §7 to the concrete script-level response:

| Error Scenario (FSPEC §) | Return Value Check | Log Message Format | Halt Condition |
|---|---|---|---|
| **§6.1** REQ path absent | `reqPath` falsy | `"Error: no REQ path provided. Usage: /pdlc:orchestrate-dev docs/{feature}/REQ-{feature}.md"` | Immediate; no agents dispatched |
| **§6.1** REQ path pattern mismatch | regex returns `null` | `"Error: REQ path does not match expected pattern docs/{feature}/REQ-{feature}.md — got: {reqPath}"` | Immediate; no agents dispatched |
| **§6.1** REQ file not found | guard agent returns `ok: false, reason: "file_not_found"` or `"path_invalid"` | `"Error: REQ file not found at {reqPath}"` | Immediate; no agents dispatched |
| **§6.1** REQ file empty | guard agent returns `ok: false, reason: "file_empty"` | `"Error: REQ file at {reqPath} is empty"` | Immediate; no agents dispatched |
| **§0.2** Creator agent failure | agent result contains error signal or is empty | `"Error: creator agent {skill} failed to produce {outputPath} for phase {phase}"` | Halt before reviewLoop entry |
| **§7.2** Document absent before reviewLoop | guard agent returns `ok: false` with `reason: "file_not_found"` \| `"file_empty"` \| `"path_invalid"` (non-CR phases) | `"Error: {doc} does not exist — cannot enter reviewLoop for phase {phase}"` | Halt at reviewLoop entry; no reviewers dispatched |
| **§7.3** Reviewer agent crash/timeout | result is null/empty/no VERDICT | `"WARNING: reviewer {skillName} returned no VERDICT — treating as Needs revision"` | No halt; treat as Needs revision, loop continues |
| **§7.3** Both reviewers crash same iteration | Both results trigger fallback | Two warning logs (one per reviewer, in any order) | No halt; optimizer invoked once; loop continues |
| **§7.4** Optimizer agent failure | result contains non-zero exit or error signal | `"Error: optimizer agent {optimizer} failed during phase {phase}, iteration {N} — pipeline halted. Document at {doc} may be in an inconsistent state."` | Immediate halt; no retry |
| **§1.9** POSTMORTEM agent failure | result empty or error signal | `"WARNING: POSTMORTEM agent failed — artifact not written for phase {phase}"` | Pipeline still halts (non-convergence); no retry |
| **§4.5** Merge conflict | `git merge` exits with conflict | `"Error: merge conflict merging worktree for task {taskId} into feat-{featureName} — conflicting files: {fileList}. Pipeline halted."` | Immediate halt; `git merge --abort` called; remaining worktrees not merged |
| **§4.6** Batch agent empty result | result is null/undefined/empty/whitespace | `"Error: Batch {N} agent returned empty result — treating as failure"` | Immediate halt; subsequent batches not dispatched |
| **§4.6** Test failure marker | result contains `Tests: N failed` or `non-zero exit` | Final report: batch number, failing task IDs, failure summary from agent result | Immediate halt; subsequent batches not dispatched |
| **§3.1** Post-PASS `se-author` failure | postPassResult is null/undefined/empty string | `"Warning: TSPEC post-PASS agent failed — defaulting decisionsWarranted to true"` + proceed to Phase D | No halt; safe default applied; Phase D entered |
| **§4.3** DAG cycle | no ready tasks while incomplete tasks remain | `"Error: PLAN dependency graph contains a cycle — cannot compute topological batches"` | Immediate halt |
| **§4.2** PLAN parse failure | agent returns non-JSON or empty | `"Error: PLAN parsing agent failed to return structured task list"` | Immediate halt |
| **§5.4** Guard hook block | harvest agent result contains `"pdlc guard: refusing to delete CROSS-REVIEW files"` (canonical guard substring per TSPEC-HARVEST-03) | `"Phase H halted: guard-harvest-before-delete blocked deletion of {blockedFilePath}"` | Immediate halt; no retry |
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
  prUrl?: string;             // Phase PUB — the raised/reused PR URL (when reached)
  ciStatus?: "passed" | "no-checks"; // Phase PUB — resolved CI verification status
  haltReason?: string;        // Present only when outcome === "halted"
};

type PhaseReport = {
  phase: string;              // "R", "F", "T", "D", "P", "PR", "I", "PT", "CR", "H", "PUB"
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

**Post-PASS agent failure path:** If the post-PASS `se-author` call fails (result is `null`, `undefined`, or empty string — meaning the agent returned no content), the script defaults `decisionsWarranted = true`, logs a warning, and proceeds to Phase D:

```js
if (postPassResult === null || postPassResult === undefined || postPassResult.trim() === "") {
  log("Warning: TSPEC post-PASS agent failed — defaulting decisionsWarranted to true");
  decisionsWarranted = true;
  // proceed to Phase D (safe default: include DECISIONS rather than silently skip)
}
```

This is the safe default — including DECISIONS when uncertain is preferable to silently skipping it. This path is separate from the `parseDecisionsWarranted` absent-field default: agent failure (empty result) is caught before `parseDecisionsWarranted` is called; the absent-field default fires when the agent returned a non-empty result but omitted the `DECISIONS_WARRANTED:` field.

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

The closed-form formula for maximum total agent count per run (from FSPEC OQ-04, corrected from REQ-NFR-01 v1.2):

```
1  (entry validation agent)
+ 8 × 5 × 3  (8 review phases × 5 iterations × [2 reviewers + 1 optimizer])
+ 5 × 5      (5 se-implement agents × 5 batches)
+ 1          (PT agent)
+ 1          (harvest agent)
+ 8          (POSTMORTEM agents — one per non-converging review phase, worst case)
+ 1          (Phase PUB: PR creation agent)
+ up to 60   (Phase PUB: CI poll agents — 30-min cap at 30-s cadence; typical runs see far fewer)
= 1 + 120 + 25 + 1 + 1 + 8 + 1 + 60
= ~217 agents worst case
```

217 is well under the 1,000-agent-per-run cap. (The pre-PUB formula yielded 156; Phase PUB adds 1 PR-creation agent and up to 60 CI-poll agents, raising the worst-case total to ~217. In all cases the cap is not approached.)

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

## 10.1 SKILL.md Modifications

### TSPEC-SKILL-01: VERDICT Trailer Addition to Review SKILL.md Files

**Implements:** REQ-COMPAT-01

Three SKILL.md files require a permanent additive modification: `pdlc/skills/se-review/SKILL.md`, `pdlc/skills/te-review/SKILL.md`, and `pdlc/skills/pm-review/SKILL.md`.

**Exact text to append** (identical for all three files):

```
---

## VERDICT Trailer (required — workflow data contract)

After writing your cross-review file and before ending your final message, append the following two lines as the last content of your response:

```
VERDICT: <verdict-value>
{"high": N, "medium": N, "low": N}
```

- `<verdict-value>` is exactly one of (case-sensitive): `Approved`, `Approved with minor changes`, `Needs revision`
- The JSON object appears on the immediately following line with no intervening text
- N values are the count of High / Medium / Low findings in your cross-review
- Trailing newline after the JSON object is permitted
```

**Placement:** Append at the end of each SKILL.md file, after the existing final section (currently "Communication Style" in all three files). Insert a `---` horizontal rule separator before the new section header.

**Verification criterion:** After the change, each of the three SKILL.md files:
1. Contains the `## VERDICT Trailer (required — workflow data contract)` section header
2. Contains the exact VERDICT format block as specified above
3. An interactive caller who ignores the last lines of the skill's response is unaffected — the trailer is additive and appended after the prose summary (backwards-compatible per REQ-COMPAT-01)

### TSPEC-SKILL-02: `orchestrate-dev` SKILL.md Rewrite as Pointer/Contract Document

**Implements:** REQ-SKILL-01 (Phase 2 deliverable)

`pdlc/skills/orchestrate-dev/SKILL.md` is rewritten from a step-by-step runbook into a concise pointer/contract document. The rewritten document must contain the following sections (in this order):

| Section | Required content |
|---|---|
| **Invocation contract** | The exact invocation syntax (`/pdlc:orchestrate-dev docs/{feature}/REQ-{feature}.md`), input requirements (path must match `docs/{feature}/REQ-{feature}.md` pattern), and what is returned (final pipeline report in main context) |
| **Preconditions** | The REQ file must exist and be non-empty; the feature branch `feat-{feature}` should exist or be created before invocation |
| **What the workflow does** | A concise summary (not a step-by-step runbook) of the PDLC phase sequence: REQ review → FSPEC → TSPEC → DECISIONS (conditional) → PLAN → PROPERTIES → Implementation batches → PROPERTIES tests → Final codebase review → Harvest |
| **Auto-approved batching decision** | States that implementation batches execute automatically without user approval; includes the rationale: the batch plan is logged to `/workflows` before dispatch so the developer can observe it, and auto-approval eliminates the human-in-the-loop latency that would stall background execution |
| **Two-workflow split (known alternative)** | Documents the rejected `orchestrate-spec` / `orchestrate-impl` two-workflow split as the known alternative — why it was not chosen: it would require the developer to manually invoke the second workflow after the first completes, reintroducing manual coordination that the single-workflow approach eliminates |
| **Artifact conventions** | Reference to CLAUDE.md §pdlc specifics for naming conventions; states that all artifacts live under `docs/{feature}/` |
| **Workflow script path** | The canonical plugin source path (`pdlc/workflows/orchestrate-dev.js`) and the runtime-loaded consumer path (`.claude/workflows/orchestrate-dev.js`) |

**Length guidance:** The rewritten SKILL.md should be substantially shorter than the current runbook (target: under 100 lines). The step-by-step phase instructions, reviewer dispatch blocks, and loop mechanics prose are removed — they live in the workflow script, not the SKILL.md.

---

## 11. Requirements Traceability

| Requirement | TSPEC Item(s) | FSPEC AT(s) implemented |
|---|---|---|
| REQ-PIPELINE-01 | TSPEC-SCRIPT-01 – 05, TSPEC-ENTRY-01 – 03 | AT-ENTRY-01, AT-ENTRY-02 |
| REQ-PIPELINE-02 | TSPEC-DISPATCH-01, TSPEC-IMPL-07, TSPEC-IMPL-08 | AT-IMPL-01, AT-IMPL-02 |
| REQ-PIPELINE-03 | TSPEC-LOOP-05, TSPEC-LOOP-06 | AT-RESUME-01, AT-RESUME-02, AT-RESUME-03 |
| REQ-GATE-01 | TSPEC-LOOP-03, TSPEC-PARSE-01 | AT-LOOP-01, AT-LOOP-02, AT-VERDICT-01 – 07 |
| REQ-GATE-02 | TSPEC-LOOP-03 – 08, TSPEC-DECISIONS-01 – 03 | AT-LOOP-01 – 08, AT-DECISIONS-01 – 05 |
| REQ-GATE-03 | TSPEC-IMPL-03, TSPEC-IMPL-04, TSPEC-IMPL-06 | AT-IMPL-01, AT-IMPL-03, AT-IMPL-04, AT-IMPL-05 |
| REQ-GATE-04 | TSPEC-LOOP-07 | AT-LOOP-03, AT-LOOP-05 |
| REQ-GATE-05 | TSPEC-PARSE-01, TSPEC-PARSE-04, TSPEC-ERROR-01 | AT-LOOP-04, AT-LOOP-08, AT-VERDICT-02 – 04 |
| REQ-COMPAT-01 | TSPEC-PARSE-01, TSPEC-NFR-04, TSPEC-SKILL-01 | AT-VERDICT-01 – 07 |
| REQ-COMPAT-02 | TSPEC-HARVEST-03, TSPEC-HARVEST-04 | AT-HARVEST-01, AT-HARVEST-02 |
| REQ-COMPAT-03 | TSPEC-NFR-05 | — (static property; verified by code inspection) |
| REQ-ARTIFACTS-01 | TSPEC-DISPATCH-01 (path templates) | — (naming convention; verified by artifact inspection) |
| REQ-ARTIFACTS-02 | TSPEC-HARVEST-02, TSPEC-HARVEST-03, TSPEC-HARVEST-04 | AT-HARVEST-01, AT-HARVEST-02 |
| REQ-OBS-01 | TSPEC-LOOP-05, TSPEC-IMPL-03, TSPEC-SCRIPT-05 | AT-RESUME-02, AT-RESUME-03, AT-IMPL-01 |
| REQ-OBS-02 | TSPEC-ERROR-03 | — (structural type property; verified by report schema inspection) |
| REQ-SKILL-01 | TSPEC-SKILL-02 | — (Phase 2 deliverable; verified by SKILL.md content inspection) |
| REQ-NFR-01 | TSPEC-NFR-01, TSPEC-NFR-02 | — (formula-based constraint; verified analytically) |
| REQ-NFR-02 | TSPEC-NFR-03 | — (structural guarantee; verified by log() call-site inspection) |
| REQ-SHIP-01 | TSPEC-SHIP-01, TSPEC-SHIP-04, TSPEC-SHIP-05 | AT-SHIP-01, AT-SHIP-02, AT-SHIP-03, AT-SHIP-09 |
| REQ-SHIP-02 | TSPEC-SHIP-02, TSPEC-SHIP-03, TSPEC-SHIP-04 | AT-SHIP-04, AT-SHIP-05, AT-SHIP-06, AT-SHIP-07, AT-SHIP-08 |
| REQ-SHIP-03 | TSPEC-SHIP-03, TSPEC-SHIP-05, TSPEC-SHIP-06 | AT-SHIP-01, AT-SHIP-09 |

---

## 12. Open Questions Inherited from FSPEC

| ID | Question | TSPEC Impact |
|---|---|---|
| OQ-01 | Does `resumeFromRunId` match the live runtime API? | Verify before authoring TSPEC-LOOP-06. The script does not invoke resume explicitly — it relies on the runtime caching. No API call needed; OQ-01 is low-risk. |
| OQ-05 | Sync mechanism for plugin source → consumer repo copy | Out of scope for this TSPEC. Implementation note: document manual copy step in SKILL.md until a `pdlc install` script exists. |
