---
Status: Draft
Author: se-author
Version: 1.1
Feature: orchestrate-dev-workflow
---

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → **PLAN** |
| Downstream | PROPERTIES, IMPL |
| Scope | Phased execution plan for implementing the orchestrate-dev dynamic workflow: VERDICT trailer additions to three review SKILL.md files, workflow script core (entry, parsing, reviewLoop, dispatch table), implementation phase logic (DAG, batching, merge-back, test gate, PT, CR), pipeline wiring (harvest, phase sequence, DECISIONS_WARRANTED, final report), and SKILL.md rewrite |
| Cross-Reviews | — |
| LEARNINGS | docs/orchestrate-dev-workflow/LEARNINGS-orchestrate-dev-workflow.md |

# PLAN — orchestrate-dev-workflow

Execution plan for implementing the `orchestrate-dev` PDLC pipeline as a Claude Code dynamic workflow script.

---

## Summary

This plan delivers five phases of work:

1. **Phase 1** — Add the `VERDICT` trailer to the three review SKILL.md files (`se-review`, `te-review`, `pm-review`). No code dependencies; can start immediately.
2. **Phase 2** — Implement the core workflow script (`pdlc/workflows/orchestrate-dev.js`): pipeline entry validation, VERDICT/DECISIONS_WARRANTED parsing, the reusable `reviewLoop` function, and the Phase Dispatch Table.
3. **Phase 3** — Implement the implementation phase within the workflow script: PLAN DAG parsing, topological batching, batch logging, parallel `se-implement` dispatch with worktree isolation, merge-back with conflict handling, per-batch test gate, Phase PT (PROPERTIES tests), and Phase CR (final codebase reviewLoop).
4. **Phase 4** — Wire together all phases into the top-level pipeline sequence, implement the harvest phase with `PHASE_H_ENABLED` flag, implement DECISIONS_WARRANTED post-PASS se-author call, and implement the final report return value.
5. **Phase 5** — Rewrite `pdlc/skills/orchestrate-dev/SKILL.md` as a concise pointer/contract document (can begin as soon as Phase 3 completes, in parallel with Phase 4, since the workflow script path `pdlc/workflows/orchestrate-dev.js` is known in advance).

---

## Phased Task List

### Status Key

| Symbol | Meaning |
|---|---|
| ⬚ | Not Started |
| 🔴 | Red (failing tests written) |
| 🟢 | Green (tests passing, minimum implementation) |
| 🔵 | Refactored |
| ✅ | Done |

---

### Phase 1 — SKILL.md Verdict Trailers

**Dependencies:** None. All three tasks are independent and can run in parallel.

| # | ID | Title | Description | Test File | Source File | Complexity | Status |
|---|---|---|---|---|---|---|---|
| 1 | TASK-P1-01 | Add VERDICT trailer to se-review SKILL.md | Append the `## VERDICT Trailer (required — workflow data contract)` section to `pdlc/skills/se-review/SKILL.md` after the existing "Communication Style" section, separated by a `---` horizontal rule. The exact text is specified in TSPEC-SKILL-01. **TDD:** Write the test in `skillFiles.test.js` first — it will fail against the current SKILL.md (no trailer present) — then add the trailer to make it pass. | `pdlc/workflows/__tests__/skillFiles.test.js` | `pdlc/skills/se-review/SKILL.md` | S | ⬚ |
| 2 | TASK-P1-02 | Add VERDICT trailer to te-review SKILL.md | Append the `## VERDICT Trailer (required — workflow data contract)` section to `pdlc/skills/te-review/SKILL.md` after the existing "Communication Style" section, separated by a `---` horizontal rule. Identical text to TASK-P1-01. **TDD:** Test in `skillFiles.test.js` first (fails on current file), then add the trailer. | `pdlc/workflows/__tests__/skillFiles.test.js` | `pdlc/skills/te-review/SKILL.md` | S | ⬚ |
| 3 | TASK-P1-03 | Add VERDICT trailer to pm-review SKILL.md | Append the `## VERDICT Trailer (required — workflow data contract)` section to `pdlc/skills/pm-review/SKILL.md` after the existing "Communication Style" section, separated by a `---` horizontal rule. Identical text to TASK-P1-01. **TDD:** Test in `skillFiles.test.js` first (fails on current file), then add the trailer. | `pdlc/workflows/__tests__/skillFiles.test.js` | `pdlc/skills/pm-review/SKILL.md` | S | ⬚ |

**Acceptance criteria (Phase 1):**
- Each of the three SKILL.md files contains the `## VERDICT Trailer (required — workflow data contract)` section header.
- Each contains the exact VERDICT format block: `VERDICT: <verdict-value>` on one line, `{"high": N, "medium": N, "low": N}` on the immediately following line.
- The section appears after a `---` separator following the final "Communication Style" section.
- An interactive caller who reads the response prose and ignores the final two lines sees no functional change.
- **[TE-F03]** `pdlc/workflows/__tests__/skillFiles.test.js` exists and is shared by all three tasks. It uses `fs.readFileSync` to read each SKILL.md file and asserts: (a) the file contains the VERDICT trailer string `VERDICT: Approved | Approved with minor changes | Needs revision`; (b) the file contains the finding-count JSON format `{"high":` and `"medium":` and `"low":`. **TDD order:** write the test first (all three assertions fail on current unmodified SKILL.md files), then add the trailers to make the tests pass. This makes Phase 1 machine-verifiable and enforceable as the TSPEC-NFR-04 gate before Phase 2.

---

### Phase 2 — Workflow Script Core

**Dependencies:** Phase 1 complete (TSPEC-NFR-04: the VERDICT trailer must be in SKILL.md before the parsing code that consumes it is testable end-to-end).

| # | ID | Title | Description | Test File | Source File | Complexity | Status |
|---|---|---|---|---|---|---|---|
| 4 | TASK-P2-01 | Create pdlc/workflows/ directory and script scaffold | Create `pdlc/workflows/orchestrate-dev.js` with ESM module format, exported `meta` object (TSPEC-SCRIPT-02, TSPEC-SCRIPT-03), `PHASE_H_ENABLED` flag, and the `main({ reqPath })` async function shell (TSPEC-SCRIPT-04). No logic yet — skeleton only. | `pdlc/workflows/__tests__/orchestrate-dev.test.js` | `pdlc/workflows/orchestrate-dev.js` | S | ⬚ |
| 5 | TASK-P2-02 | Implement pipeline entry — REQ path validation and feature name extraction | Implement `TSPEC-ENTRY-01` and `TSPEC-ENTRY-02`: regex-based path validation (`/^docs\/([^/]+)\/REQ-\1\.md$/`), feature name extraction from capture group, all four halt paths (absent, pattern mismatch). No guard agent yet. | `pdlc/workflows/__tests__/orchestrate-dev.test.js` | `pdlc/workflows/orchestrate-dev.js` | S | ⬚ |
| 6 | TASK-P2-03 | Implement guard agent for file-existence check | Implement `TSPEC-ENTRY-03`: the minimal guard `agent()` call that returns `{"ok": true}` or `{"ok": false, "reason": "file_not_found" \| "file_empty" \| "path_invalid"}`. Wire into `TSPEC-ENTRY-01` steps 4–5 (file not found, file empty halt paths). Per DEC-ODW-03: no `fs.existsSync` — agent call is authoritative. **The canonical guard agent test double is a named deliverable of this task:** `pdlc/workflows/__tests__/helpers/guardAgentDouble.js`, exporting `createGuardAgentDouble({ ok, reason })` which returns a mock agent function that resolves with `{ ok, reason }`. All downstream Phase 2 and Phase 3 tasks that call the guard agent **must** import from this path; per-test ad-hoc stubbing is prohibited (DEC-ODW-03). | `pdlc/workflows/__tests__/orchestrate-dev.test.js` | `pdlc/workflows/orchestrate-dev.js` | S | ⬚ |
| 7 | TASK-P2-04 | Implement `parseVerdict` function | Implement `TSPEC-PARSE-01` through `TSPEC-PARSE-04`: reverse-scan algorithm, case-sensitive VERDICT prefix check, valid verdict set comparison, JSON validation (key set `{high, medium, low}`, non-negative integers), truncated-output special case (no warning, zero counts), intervening-text fallback, warning log format. All AT-VERDICT-01 through AT-VERDICT-07 acceptance tests must pass. | `pdlc/workflows/__tests__/parseVerdict.test.js` | `pdlc/workflows/orchestrate-dev.js` | M | ⬚ |
| 8 | TASK-P2-05 | Implement `parseDecisionsWarranted` function | Implement `TSPEC-PARSE-05`: reverse-scan for `DECISIONS_WARRANTED:` prefix, case-insensitive value comparison (`true`/`false`), absent/malformed default to `true` with warning log. All AT-DECISIONS-01 through AT-DECISIONS-05 acceptance tests must pass. | `pdlc/workflows/__tests__/parseDecisionsWarranted.test.js` | `pdlc/workflows/orchestrate-dev.js` | S | ⬚ |
| 9 | TASK-P2-06 | Implement `reviewLoop` function — iteration algorithm, log format, resume semantics | Implement `TSPEC-LOOP-01` through `TSPEC-LOOP-06` and `TSPEC-LOOP-08`: function signature, entry precondition check (uses guard agent — reuse canonical double from `pdlc/workflows/__tests__/helpers/guardAgentDouble.js`), parallel reviewer dispatch via `parallel()`, verdict inspection, PASS/FAIL gate, optimizer invocation on FAIL, iteration counter increment, iteration log format (`"Starting iteration 1"` vs `"Resuming from iteration N"`), resume semantics. Return type `{converged: boolean, iterations: number}`. **Also includes the guard-agent precondition failure path (AT-LOOP-06): `reviewLoop` called with a missing `docPath` triggers the guard agent which returns `ok: false, reason: 'file_not_found'`, halts immediately, and produces the correct error message.** All AT-LOOP-01, AT-LOOP-02, AT-LOOP-04, **AT-LOOP-06**, AT-LOOP-07, AT-LOOP-08, AT-RESUME-01, AT-RESUME-02, AT-RESUME-03 acceptance tests must pass. | `pdlc/workflows/__tests__/reviewLoop.test.js` | `pdlc/workflows/orchestrate-dev.js` | L | ⬚ |
| 10 | TASK-P2-07 | Implement `reviewLoop` POSTMORTEM branch — 5-iteration cap | Implement `TSPEC-LOOP-07`: cap check at loop-top (`iteration > 5`), POSTMORTEM-writing agent invocation with required prompt, POSTMORTEM agent failure path (`"WARNING: POSTMORTEM agent failed — artifact not written for phase {phase}"`), final report content for non-convergence. AT-LOOP-03 and AT-LOOP-05 acceptance tests must pass. **[PM-F03]** The POSTMORTEM agent's prompt must instruct inclusion of the six required sections from the SKILL.md template: Phase, Iterations, Reviewers, Pattern of Disagreement, Best-Guess Root Cause, Recommendation. A test asserts the prompt string passed to the POSTMORTEM agent contains each of these six section headings. | `pdlc/workflows/__tests__/reviewLoop.test.js` | `pdlc/workflows/orchestrate-dev.js` | M | ⬚ |
| 11 | TASK-P2-08 | Implement Phase Dispatch Table constant | Implement `TSPEC-DISPATCH-01`: the `PHASE_DISPATCH` module-level constant with all seven phase entries (R, F, T, D, P, PR, CR) including `creator`, `creatorInputs`, `creatorOutputPath`, `reviewers`, `optimizer`. `DECISIONS?` conditional notation for Phase P. Template placeholder `{feature}` documented. | `pdlc/workflows/__tests__/orchestrate-dev.test.js` | `pdlc/workflows/orchestrate-dev.js` | S | ⬚ |

**Acceptance criteria (Phase 2):**
- `pdlc/workflows/orchestrate-dev.js` exists as a valid ESM module with exported `meta` and default `main` function.
- `meta` object has correct `name`, `description`, `inputs` shape per TSPEC-SCRIPT-03.
- All four pipeline entry halt paths produce the exact error strings specified in TSPEC-ENTRY-01.
- `parseVerdict` passes all seven AT-VERDICT acceptance tests.
- `parseDecisionsWarranted` passes all five AT-DECISIONS acceptance tests (01-05).
- `reviewLoop` passes AT-LOOP-01 through AT-LOOP-08 (including **AT-LOOP-06**: precondition failure — missing `docPath` triggers guard agent returning `ok: false, reason: 'file_not_found'`, halts immediately, produces correct error message) and AT-RESUME-01 through AT-RESUME-03.
- `PHASE_DISPATCH` constant is defined at module level with all seven phase entries.
- **[TASK-P2-03 — TE-F01]** `pdlc/workflows/__tests__/helpers/guardAgentDouble.js` exists, exports `createGuardAgentDouble({ ok, reason })`, and is used by TASK-P2-06 and all Phase 3 tasks; no task-local ad-hoc stubs are permitted.
- **[TASK-P2-07 — PM-F03]** The POSTMORTEM agent prompt string contains the six required section headings: `Phase`, `Iterations`, `Reviewers`, `Pattern of Disagreement`, `Best-Guess Root Cause`, `Recommendation`. A test asserts the prompt contains each heading.

---

### Phase 3 — Implementation Phase Logic

**Dependencies:** Phase 2 complete (`reviewLoop` and parsing functions must exist before Phase CR can call `reviewLoop`).

| # | ID | Title | Description | Test File | Source File | Complexity | Status |
|---|---|---|---|---|---|---|---|
| 12 | TASK-P3-01 | Implement PLAN DAG parsing agent call | Implement `TSPEC-IMPL-01`: single `agent()` call that reads `PLAN-{featureName}.md` and returns a structured JSON task list `{tasks: [{id, description, dependencies, planBatch}]}`. Validate parsed output; halt with `"Error: PLAN parsing agent failed to return structured task list"` on parse failure. | `pdlc/workflows/__tests__/implPhase.test.js` | `pdlc/workflows/orchestrate-dev.js` | S | ⬚ |
| 13 | TASK-P3-02 | Implement topological batching algorithm | Implement `TSPEC-IMPL-02`: topological sort producing execution batches, cycle detection (halt on cycle), PLAN batch label inconsistency detection and warning log, sub-batch splitting at max 5 tasks per batch in document order. AT-IMPL-03 (DAG inconsistency override logged) acceptance test must pass. | `pdlc/workflows/__tests__/implPhase.test.js` | `pdlc/workflows/orchestrate-dev.js` | M | ⬚ |
| 14 | TASK-P3-03 | Implement batch plan logging | Implement `TSPEC-IMPL-03`: emit batch plan `log()` calls in the exact format specified before any `agent()` call for `se-implement`. The `log()` statements must be sequential statements preceding the first `agent()` call. AT-IMPL-01 (batch plan logged before dispatch) acceptance test must pass. | `pdlc/workflows/__tests__/implPhase.test.js` | `pdlc/workflows/orchestrate-dev.js` | S | ⬚ |
| 15 | TASK-P3-04 | Implement parallel se-implement dispatch with worktree isolation | Implement `TSPEC-IMPL-04`: per-batch `phase()` label, `parallel()` dispatch of `se-implement` agents with `isolation: "worktree"`, each agent receiving task row, TSPEC path, PROPERTIES path. Wait for all agents in batch to complete before merge. | `pdlc/workflows/__tests__/implPhase.test.js` | `pdlc/workflows/orchestrate-dev.js` | M | ⬚ |
| 16 | TASK-P3-05 | Implement worktree merge-back with conflict handling | Implement `TSPEC-IMPL-05`: sequential `git merge --no-ff` per worktree in PLAN document order, conflict detection (non-zero exit), `git diff --name-only --diff-filter=U` to extract conflicting files before abort, `git merge --abort`, halt with exact error format including file list. All worktrees in a batch must merge before test gate. | `pdlc/workflows/__tests__/implPhase.test.js` | `pdlc/workflows/orchestrate-dev.js` | M | ⬚ |
| 17 | TASK-P3-06 | Implement per-batch test gate | Implement `TSPEC-IMPL-06`: empty-result check (short-circuits before marker scan), `Tests: N failed` failure marker regex, `non-zero exit` case-insensitive scan, batch pass log (`"Batch N complete — all tests passing"`), halt on failure with batch number and task IDs. **[TE-F04]** This task produces **two** exported helper functions: `evaluateBatchGate(batchResult, batchNumber, taskIds)` for multi-agent implementation batches, and `evaluateSingleAgentGate(agentResult, phaseName)` for single-agent phases (e.g., Phase PT). Both helpers share the same empty-result and failure-marker logic. The `evaluateSingleAgentGate` signature and acceptance criteria are: given an agent result string and a phase name, returns `{ passed: boolean, reason?: string }`; empty string treated as failure; `Tests: N failed` marker and `non-zero exit` case-insensitive scan identical to `evaluateBatchGate`. AT-IMPL-02 (batch failure halts pipeline), AT-IMPL-04 (batch pass continues), AT-IMPL-05 (empty result treated as failure) acceptance tests must pass. | `pdlc/workflows/__tests__/implPhase.test.js` | `pdlc/workflows/orchestrate-dev.js` | M | ⬚ |
| 18 | TASK-P3-07 | Implement Phase PT — PROPERTIES tests agent | Implement `TSPEC-IMPL-07`: single `se-implement` agent call with `phase("Phase PT: PROPERTIES Tests")` label. Reuse `evaluateSingleAgentGate` imported from TASK-P3-06's output (both helpers live in `orchestrate-dev.js`). Halt if PT fails; do not proceed to Phase CR. | `pdlc/workflows/__tests__/implPhase.test.js` | `pdlc/workflows/orchestrate-dev.js` | S | ⬚ |
| 19 | TASK-P3-08 | Implement Phase CR — final codebase reviewLoop call | Implement `TSPEC-IMPL-08`: call `reviewLoop` with `doc: docs/{featureName}/`, `phase: "CR"`, reviewers `["pm-review", "te-review"]`, optimizer `"se-author"`. Entry precondition skips single-file check for Phase CR (directory always exists after Phase I). Cross-review output files: `CROSS-REVIEW-product-manager-IMPLEMENTATION[-vN].md`, `CROSS-REVIEW-test-engineer-IMPLEMENTATION[-vN].md`. | `pdlc/workflows/__tests__/implPhase.test.js` | `pdlc/workflows/orchestrate-dev.js` | S | ⬚ |

**Acceptance criteria (Phase 3):**
- PLAN DAG parsing halts with correct error on non-JSON or empty agent result.
- Topological batching correctly orders a 4-task diamond DAG; emits batch inconsistency warning when PLAN labels contradict dependency edges.
- Batch plan `log()` calls appear as sequential statements before the first `agent()` call for `se-implement` (verifiable by code inspection).
- AT-IMPL-01 through AT-IMPL-05 acceptance tests pass.
- **[TE-F04]** TASK-P3-06 exports both `evaluateBatchGate` and `evaluateSingleAgentGate`. TASK-P3-07 imports `evaluateSingleAgentGate` from TASK-P3-06's output (no inline re-implementation). Tests assert both functions apply the same empty-result and failure-marker logic.
- Phase PT uses `evaluateSingleAgentGate`; halts on empty result.
- Phase CR calls `reviewLoop` with `doc` set to the feature directory, not a single file.

---

### Phase 4 — Harvest and Pipeline Wiring

**Dependencies:** Phase 3 complete (all phases must be implemented before top-level pipeline can be wired).

| # | ID | Title | Description | Test File | Source File | Complexity | Status |
|---|---|---|---|---|---|---|---|
| 20 | TASK-P4-01 | Implement harvest phase with PHASE_H_ENABLED flag | Implement `TSPEC-HARVEST-01` through `TSPEC-HARVEST-04`: `PHASE_H_ENABLED` compile-time flag, skip path (log + phase label + final report entry when `false`), harvest agent invocation with ordered prompt (LEARNINGS write before delete), guard hook substring detection (`"pdlc guard: refusing to delete CROSS-REVIEW files"`), halt on guard block with final report entry. AT-HARVEST-01 and AT-HARVEST-02 acceptance tests must pass. **[TE-F06]** Add AT-HARVEST-03: given `PHASE_H_ENABLED = false`, when the harvest phase is reached, the script logs `'Phase H skipped — prerequisite not yet landed'` and proceeds directly to the final report without invoking any harvest agent. This AT requires a separate test case from AT-HARVEST-01/02 (which require `PHASE_H_ENABLED = true`). **[PM-F01]** Expand scope to cover REQ-COMPAT-02 hook compatibility: verify that `check-scope-field` (PostToolUse: Write\|Edit) fires on workflow agent writes and that `nudge-consolidation` (SessionStart) fires for the top-level session only. These are verified by the hook scripts themselves — no script changes required. Add ACs asserting: (a) `pdlc/hooks/scripts/check-scope-field.sh` exists and is unmodified from the repo baseline; (b) `pdlc/hooks/scripts/nudge-consolidation.sh` exists and is unmodified from the repo baseline. Document the workflow-context behavior of both hooks in a comment in the workflow script (top of the harvest phase block): `// check-scope-field fires PostToolUse:Write|Edit on all workflow agent writes; nudge-consolidation fires on the top-level SessionStart only — not inside agent sub-sessions.` | `pdlc/workflows/__tests__/harvestPhase.test.js` | `pdlc/workflows/orchestrate-dev.js` | M | ⬚ |
| 21 | TASK-P4-02 | Implement DECISIONS_WARRANTED post-PASS se-author call | Implement `TSPEC-DECISIONS-01` through `TSPEC-DECISIONS-03`: mandatory post-PASS `agent("se-author", postPassTSPECPrompt(...))` call after TSPEC reviewLoop converges, injection of `DECISIONS_WARRANTED` trailer instruction in post-PASS prompt only (not in-loop optimizer), `parseDecisionsWarranted()` call on result, post-PASS agent failure path (null/empty → default `true`, warning log). DECISIONS skip path (`phase("Phase D: ⏭ Skipped")`, `log("Phase D skipped — no load-bearing alternatives")`). DECISIONS full path invocation. | `pdlc/workflows/__tests__/pipelineWiring.test.js` | `pdlc/workflows/orchestrate-dev.js` | M | ⬚ |
| 22 | TASK-P4-03 | Wire all phases into top-level pipeline sequence | Wire the canonical phase execution order in `main()`: R → F → T (+ post-PASS se-author) → D (conditional on `decisionsWarranted`) → P → PR → I → PT → CR → H. Use `pipeline()` to wrap the full sequence. Creator agent invocations per TSPEC-DISPATCH-01 (call creator before `reviewLoop` for phases F, T, D, P, PR). Creator agent failure halt path (`"Error: creator agent {skill} failed to produce {outputPath} for phase {phase}"`). | `pdlc/workflows/__tests__/pipelineWiring.test.js` | `pdlc/workflows/orchestrate-dev.js` | L | ⬚ |
| 23 | TASK-P4-04 | Implement final report structure and return value | Implement `TSPEC-ERROR-03`: `FinalReport` object with `feature`, `outcome`, `phases` array (`PhaseReport` entries for all 10 phases), `artifactPaths`, `testSummary`, `harvestStatus`, and optional `haltReason`. The `main()` function returns this object as its final value. Context isolation: no agent result content in `log()` calls; only scalar strings. **[PM-F02]** A code comment at the pipeline top level in the script documents the worst-case concurrent-agent count: `// Concurrent-agent ceiling analysis (REQ-NFR-01): max fan-out is 5 se-implement agents per batch (Phase I) + 2 reviewers per reviewLoop iteration = 7 concurrent max. Well under the 16-agent runtime ceiling.` This comment serves as the analytical verification of REQ-NFR-01 AC(2). | `pdlc/workflows/__tests__/pipelineWiring.test.js` | `pdlc/workflows/orchestrate-dev.js` | M | ⬚ |

**Acceptance criteria (Phase 4):**
- `PHASE_H_ENABLED = false` produces correct skip log (`'Phase H skipped — prerequisite not yet landed'`), phase label, and final report entry; harvest agent is not invoked. **(AT-HARVEST-03)**
- `PHASE_H_ENABLED = true` produces harvest agent invocation in correct order.
- Guard block detection fires on correct substring; final report names the blocked file path.
- `main()` returns a `FinalReport` object matching `TSPEC-ERROR-03` shape.
- Phase sequence in `main()` matches R → F → T → D? → P → PR → I → PT → CR → H.
- Creator agent failure halts pipeline before `reviewLoop` is entered.
- No `log()` call receives an agent result object; all `log()` arguments are scalar strings.
- AT-ENTRY-01 and AT-ENTRY-02 acceptance tests pass end-to-end in `main()`.
- **[PM-F01]** `pdlc/hooks/scripts/check-scope-field.sh` and `pdlc/hooks/scripts/nudge-consolidation.sh` are present and unmodified from the repo baseline. A comment in the harvest phase block of the workflow script documents their workflow-context behavior.
- **[PM-F02]** The pipeline top level in the script contains the concurrent-agent ceiling analysis comment documenting worst-case 7 concurrent agents vs. the 16-agent ceiling.

---

### Phase 5 — SKILL.md Rewrite

**Dependencies:** Phase 4 complete (the rewritten SKILL.md references the workflow script path, which is defined only after the script exists). Can be parallelized with Phase 4 if the script path is known in advance (it is: `pdlc/workflows/orchestrate-dev.js`).

| # | ID | Title | Description | Test File | Source File | Complexity | Status |
|---|---|---|---|---|---|---|---|
| 24 | TASK-P5-01 | Rewrite orchestrate-dev SKILL.md as pointer/contract document | Implement `TSPEC-SKILL-02`: rewrite `pdlc/skills/orchestrate-dev/SKILL.md` from the current step-by-step runbook into a concise pointer/contract document. Required sections (in order): Invocation contract, Preconditions, What the workflow does (phase sequence summary, not runbook), Auto-approved batching decision (rationale + observability via `log()`), Two-workflow split as known alternative (why rejected), Artifact conventions (reference to CLAUDE.md), Workflow script path (plugin source + consumer copy). Target: under 100 lines. Remove step-by-step phase instructions, reviewer dispatch blocks, and loop mechanics prose. **[TE-F05] TDD:** Write `pdlc/workflows/__tests__/orchestrateDevSkill.test.js` first — tests read the current SKILL.md and assert presence of the seven required sections (all fail against the current runbook-style file) — then rewrite the SKILL.md to pass. | `pdlc/workflows/__tests__/orchestrateDevSkill.test.js` | `pdlc/skills/orchestrate-dev/SKILL.md` | M | ⬚ |

**Acceptance criteria (Phase 5):**
- `pdlc/skills/orchestrate-dev/SKILL.md` is substantially shorter than the current version (under 100 lines).
- Contains all seven required sections per TSPEC-SKILL-02 in the specified order.
- Documents the two-workflow split as a known alternative with rejection rationale.
- References `pdlc/workflows/orchestrate-dev.js` and `.claude/workflows/orchestrate-dev.js`.
- Does not contain step-by-step reviewer dispatch blocks or loop mechanics prose.
- **[TE-F05]** `pdlc/workflows/__tests__/orchestrateDevSkill.test.js` exists and asserts presence of all seven TSPEC-SKILL-02 required sections: Invocation contract, Preconditions, phase sequence summary, auto-approved batching decision, two-workflow-split alternative, artifact conventions, workflow script path. **TDD order:** write the tests first against the current SKILL.md (all seven assertions fail), then rewrite the SKILL.md to pass all seven.

---

## Task Dependency Graph

```
TASK-P1-01 ─┐
TASK-P1-02 ─┤── (all Phase 1 parallel) ──► TASK-P2-01
TASK-P1-03 ─┘                               │
                                            ▼
                                       TASK-P2-02
                                            │
                                            ▼
                                       TASK-P2-03
                                            │
                              ┌─────────────┼────────────┐
                              ▼             ▼            ▼
                         TASK-P2-04   TASK-P2-05   TASK-P2-06
                                                        │
                                                        ▼
                                                   TASK-P2-07
                                                        │
                                    ┌───────────────────┘
                                    │   TASK-P2-08
                                    │       │
                                    └───────┼───────────┐
                                            │           │
                                            ▼           ▼
                                       TASK-P3-01  [Phase 2 complete]
                                            │
                                            ▼
                                       TASK-P3-02
                                            │
                                            ▼
                                       TASK-P3-03
                                            │
                                            ▼
                                       TASK-P3-04
                                            │
                                            ▼
                                       TASK-P3-05
                                            │
                                            ▼
                                       TASK-P3-06
                                            │
                                            ▼
                                       TASK-P3-07
                                            │
                                            ▼
                                       TASK-P3-08
                                            │
                              [Phase 3 complete]
                              /               \
                             ▼                 ▼
                        TASK-P4-01        TASK-P5-01
                             │           (can start with P4)
                             ▼
                        TASK-P4-02
                             │
                             ▼
                        TASK-P4-03
                             │
                             ▼
                        TASK-P4-04
```

**Note on parallelism:**
- Phase 1 tasks (TASK-P1-01, P1-02, P1-03) are fully parallel.
- Phase 2: TASK-P2-04, TASK-P2-05, and TASK-P2-06 (with its dependent TASK-P2-07) are all independent of each other once TASK-P2-03 completes — all three branches can be dispatched simultaneously.
- Phase 5 (TASK-P5-01) can begin after Phase 3 completes and be developed in parallel with Phase 4, since the workflow script path (`pdlc/workflows/orchestrate-dev.js`) is known in advance.

---

## Integration Points

| Integration Point | Location | Notes |
|---|---|---|
| `se-review/SKILL.md` | `pdlc/skills/se-review/SKILL.md` | Additive VERDICT trailer append (TASK-P1-01) |
| `te-review/SKILL.md` | `pdlc/skills/te-review/SKILL.md` | Additive VERDICT trailer append (TASK-P1-02) |
| `pm-review/SKILL.md` | `pdlc/skills/pm-review/SKILL.md` | Additive VERDICT trailer append (TASK-P1-03) |
| `orchestrate-dev/SKILL.md` | `pdlc/skills/orchestrate-dev/SKILL.md` | Full rewrite as pointer/contract doc (TASK-P5-01) |
| `orchestrate-dev.js` (new file) | `pdlc/workflows/orchestrate-dev.js` | New canonical plugin source (all Phase 2–4 tasks) |
| `guard-harvest-before-delete.sh` | `pdlc/hooks/scripts/guard-harvest-before-delete.sh` | Guard hook substring `"pdlc guard: refusing to delete CROSS-REVIEW files"` must match TSPEC-HARVEST-03 |
| Claude Code runtime APIs | `agent()`, `parallel()`, `pipeline()`, `phase()`, `log()` | Verify live API surface per TSPEC-SCRIPT-05 before Phase 2 authoring |

---

## Definition of Done

- [ ] **Phase 1:** All three SKILL.md files contain the `## VERDICT Trailer` section in the specified format. `pdlc/workflows/__tests__/skillFiles.test.js` exists and asserts VERDICT trailer string and finding-count JSON format for all three files — tests pass (TDD: written first, red, then green after trailer additions).
- [ ] **Phase 2:** `pdlc/workflows/orchestrate-dev.js` exists as a valid ESM module. All AT-VERDICT, AT-DECISIONS, AT-LOOP (including AT-LOOP-06), and AT-RESUME acceptance tests pass. `PHASE_DISPATCH` constant is present and complete. `pdlc/workflows/__tests__/helpers/guardAgentDouble.js` exports `createGuardAgentDouble({ ok, reason })` and is imported by TASK-P2-06 and all Phase 3 guard-agent call sites. POSTMORTEM agent prompt contains all six required section headings.
- [ ] **Phase 3:** All AT-IMPL acceptance tests pass. Both `evaluateBatchGate` and `evaluateSingleAgentGate` exported from `orchestrate-dev.js`; TASK-P3-07 imports `evaluateSingleAgentGate` from that module. Batch plan log appears before first `agent()` call (verifiable by statement order inspection). Merge conflict path calls `git diff --name-only --diff-filter=U` before `git merge --abort`.
- [ ] **Phase 4:** `main()` wires all 10 phases in the correct order. Final report object matches `FinalReport` type shape. No agent result content in any `log()` call. AT-HARVEST-01, AT-HARVEST-02, and AT-HARVEST-03 (skip path) all pass. `check-scope-field.sh` and `nudge-consolidation.sh` are present and unmodified. Pipeline top level contains concurrent-agent ceiling analysis comment (worst-case 7, ceiling 16).
- [ ] **Phase 5:** Rewritten SKILL.md is under 100 lines, contains all seven required sections, and documents the two-workflow split as the known alternative. `pdlc/workflows/__tests__/orchestrateDevSkill.test.js` asserts all seven sections — tests pass (TDD: written first, red, then green after SKILL.md rewrite).
- [ ] **Cross-cutting:** No `require()` in the workflow script. No `fs.existsSync` — all file existence checks use the guard agent. `parallel()` never dispatches more than 5 agents simultaneously. All error halt messages match the exact strings in TSPEC-ERROR-01.
- [ ] **Artifact paths:** All output files use naming conventions from CLAUDE.md. No artifacts at unexpected paths.

---

## Requirements Traceability

| Phase | Task(s) | TSPEC Items | Requirements |
|---|---|---|---|
| 1 | TASK-P1-01, P1-02, P1-03 | TSPEC-SKILL-01, TSPEC-NFR-04 | REQ-COMPAT-01, REQ-COMPAT-03 |
| 2 | TASK-P2-01 | TSPEC-SCRIPT-01 – 05 | REQ-PIPELINE-01 |
| 2 | TASK-P2-02, P2-03 | TSPEC-ENTRY-01 – 03 | REQ-PIPELINE-01 |
| 2 | TASK-P2-04 | TSPEC-PARSE-01 – 04 | REQ-GATE-01, REQ-GATE-05, REQ-COMPAT-01 |
| 2 | TASK-P2-05 | TSPEC-PARSE-05 | REQ-GATE-02 |
| 2 | TASK-P2-06, P2-07 | TSPEC-LOOP-01 – 08 | REQ-GATE-01, REQ-GATE-02, REQ-GATE-04, REQ-GATE-05, REQ-PIPELINE-03, REQ-OBS-01 |
| 2 | TASK-P2-08 | TSPEC-DISPATCH-01 | REQ-PIPELINE-02, REQ-ARTIFACTS-01 |
| 3 | TASK-P3-01 | TSPEC-IMPL-01 | REQ-PIPELINE-02 |
| 3 | TASK-P3-02 | TSPEC-IMPL-02 | REQ-GATE-03, REQ-NFR-01 |
| 3 | TASK-P3-03 | TSPEC-IMPL-03 | REQ-GATE-03, REQ-OBS-01 |
| 3 | TASK-P3-04 | TSPEC-IMPL-04 | REQ-NFR-01, REQ-COMPAT-03 |
| 3 | TASK-P3-05 | TSPEC-IMPL-05 | REQ-PIPELINE-02 |
| 3 | TASK-P3-06 | TSPEC-IMPL-06 | REQ-GATE-03, REQ-PIPELINE-02 |
| 3 | TASK-P3-07 | TSPEC-IMPL-07 | REQ-PIPELINE-02 |
| 3 | TASK-P3-08 | TSPEC-IMPL-08 | REQ-PIPELINE-02, REQ-GATE-01, REQ-GATE-02 |
| 4 | TASK-P4-01 | TSPEC-HARVEST-01 – 04 | REQ-ARTIFACTS-02, REQ-COMPAT-02 (guard-harvest + check-scope-field + nudge-consolidation hooks) |
| 4 | TASK-P4-02 | TSPEC-DECISIONS-01 – 03 | REQ-GATE-02 |
| 4 | TASK-P4-03 | TSPEC-DISPATCH-01, TSPEC-SCRIPT-04, TSPEC-ERROR-01 – 02 | REQ-PIPELINE-01, REQ-PIPELINE-02, REQ-OBS-01 |
| 4 | TASK-P4-04 | TSPEC-ERROR-03, TSPEC-NFR-03 | REQ-OBS-02, REQ-NFR-01 (16-agent ceiling analytical verification), REQ-NFR-02 |
| 5 | TASK-P5-01 | TSPEC-SKILL-02 | REQ-SKILL-01 |
