---
Status: Draft
Author: se-author
Version: 1.0
Feature: orchestrate-dev-workflow
---

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → **DECISIONS** |
| Downstream | PLAN, PROPERTIES, IMPL |
| Scope | Architectural decisions settled during TSPEC and FSPEC authoring and review: single-workflow vs. two-workflow split, VERDICT trailer placement, and file-existence gate mechanism |
| Cross-Reviews | — |
| LEARNINGS | docs/orchestrate-dev-workflow/LEARNINGS-orchestrate-dev-workflow.md |

# DECISIONS — orchestrate-dev-workflow

Three load-bearing architectural alternatives were weighed and rejected during TSPEC and FSPEC authoring and review. The decisions are recorded here because they are captured nowhere else — the "do" is in the TSPEC and code; this document preserves the "didn't do, and why."

---

## DEC-ODW-01: Single end-to-end workflow vs. two-workflow split

**Context:** The dynamic workflow runtime cannot pause for user input mid-run. The existing `orchestrate-dev` skill (interactive SKILL.md runbook) requires explicit user approval before implementation batches run — tech-lead §5 of the current skill specifies that the batch plan is presented to the user and awaits confirmation before `se-implement` agents are dispatched. Rewriting `orchestrate-dev` as a dynamic workflow script eliminates the mid-run pause point, forcing a structural choice about how to preserve any human gate at the PLAN boundary.

**Decision:** Option A — a single, end-to-end workflow. Implementation batches execute automatically without user approval. The batch plan is logged to `/workflows` before dispatch (TSPEC-IMPL-03) so the developer can observe it. Observability is provided by `log()` and `phase()` calls throughout.

**Alternatives considered:**

- **Option B — two workflows (`orchestrate-spec` + `orchestrate-impl`):** Split the pipeline at the PLAN boundary. `orchestrate-spec` runs REQ through PROPERTIES and halts. The developer reviews the PLAN and batch ordering, then manually invokes `orchestrate-impl` to proceed with implementation and harvest. This preserves an explicit human gate before any code is written.
  - Rejected because it reintroduces manual coordination that the single-workflow design eliminates. The developer must remember to invoke the second workflow; the background execution model does not benefit if a human hand-off is required mid-pipeline. The headline win of the rewrite — unattended end-to-end execution — is negated.

**Constraints that forced this shape:** The dynamic workflow runtime has no mid-run pause/resume-for-input primitive. Any human gate must be either (a) a full workflow boundary or (b) eliminated. Option A chooses (b) for the implementation gate.

**Reversibility:** Hard. Splitting one workflow into two after ship requires changes to the SKILL.md pointer, the workflow script, and user-facing documentation. Consumers who have scripted invocations of the single workflow would need to update their calls.

**Re-evaluation triggers:** If post-ship feedback shows that users frequently need to modify or reject the computed batch plan before implementation begins — i.e., the topological sort produces orderings users find surprising or incorrect — revisit the two-workflow split to restore the human gate at the PLAN boundary.

---

## DEC-ODW-02: VERDICT trailer location — permanent SKILL.md vs. script-injected

**Context:** The workflow script cannot read cross-review files directly (the dynamic workflow runtime does not expose filesystem access to script bodies — see DEC-ODW-03). The script must obtain reviewer verdicts from agent return values at runtime. To make this work, the three reviewer skills (`se-review`, `te-review`, `pm-review`) must append a structured `VERDICT:` line to their response so the workflow can parse it via `parseVerdict()` (TSPEC-PARSE-01). The question was where this instruction should live.

**Decision:** Option A — permanently bake the VERDICT trailer instruction into each reviewer skill's SKILL.md file. All three files (`pdlc/skills/se-review/SKILL.md`, `pdlc/skills/te-review/SKILL.md`, `pdlc/skills/pm-review/SKILL.md`) receive the `## VERDICT Trailer (required — workflow data contract)` section as a permanent addition (TSPEC-SKILL-01, TSPEC-NFR-04).

**Alternatives considered:**

- **Option B — script-side injection:** The workflow script injects the VERDICT trailer instruction into each reviewer agent's prompt string at invocation time (i.e., every `agent("se-review", reviewerPrompt(...))` call appends the trailer format instruction to the prompt). The SKILL.md files are unchanged.
  - Rejected because it violates the single-source-of-truth principle. Every caller — the Ptah engine, interactive use, future workflow scripts — would need to know to inject the trailer. A caller that forgets the injection would receive unstructured output and cause a silent `parseVerdict` fallback to "Needs revision." The SKILL.md approach makes the trailer visible to all callers without requiring coordination. Interactive callers who do not parse the VERDICT see no functional change (the trailer is additive after the prose summary).

**Constraints that forced this shape:** REQ-COMPAT-01 requires backwards compatibility for interactive callers of the review skills. The trailer must be additive (not change existing output). Both options satisfy REQ-COMPAT-01; Option A is architecturally cleaner.

**Reversibility:** Easy. The SKILL.md addition is additive text; removing it is a one-line diff per file if suppression is ever needed.

**Re-evaluation triggers:** If a future caller requires suppression of the VERDICT trailer (e.g., a non-verdict-aware consumer that surfaces the trailing lines in a way users find confusing), consider adding a SKILL.md conditional flag or a script-side suppression mechanism to strip the trailer before surfacing output.

---

## DEC-ODW-03: File-existence gate — agent call vs. `fs.existsSync`

**Context:** REQ-PIPELINE-01 requires the pipeline to fail fast with a clear error if the REQ file path provided by the user does not exist on disk. The dynamic workflow runtime does not expose Node.js `fs` or any filesystem API to the script body — script code cannot call `fs.existsSync()`, `fs.readFileSync()`, or any equivalent directly. An early v1.0 draft of TSPEC-ERROR-01 proposed `fs.existsSync` as the existence-check mechanism; this was identified as a contradiction during TE cross-review Iteration 2 finding F-03.

**Decision:** Option A — use an agent call to check file existence. The script dispatches a minimal `agent()` call (the "guard agent") that checks whether the path exists and is non-empty, then returns a structured JSON result: `{ "ok": true }` or `{ "ok": false, "reason": "file_not_found" | "file_empty" | "path_invalid" }` (TSPEC-ENTRY-03). The guard agent is the authoritative existence-check mechanism throughout the script (TSPEC-LOOP-02 also uses this pattern for non-CR phases before entering `reviewLoop`).

**Alternatives considered:**

- **Option B — `fs.existsSync` or equivalent Node.js filesystem API:** Call `fs.existsSync(reqPath)` directly in the script body before dispatching any agents.
  - Rejected because the dynamic workflow runtime does not expose `fs` to script bodies. This is a hard runtime constraint, not a preference. Option B was present in TSPEC v1.0 draft and was explicitly flagged as a contradiction during TE cross-review Iteration 2 (F-03). Keeping Option B in the spec would have produced a runtime error on every pipeline entry.

**Constraints that forced this shape:** The dynamic workflow runtime constraint — no direct filesystem access from script bodies — is the binding constraint. The agent call is the only mechanism consistent with the runtime model.

**Reversibility:** Easy in the future direction. If the dynamic workflow runtime gains a `readFile()` primitive or similar filesystem access, the guard agent could be replaced with a direct `readFile()` call, eliminating one agent invocation per pipeline entry and per `reviewLoop` entry.

**Re-evaluation triggers:** If the dynamic workflow runtime adds a `readFile()` or `fileExists()` primitive, replace the guard agent calls with direct runtime API calls to reduce agent overhead.
