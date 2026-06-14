---
name: orchestrate-dev
description: Development process orchestrator. Runs the full PDLC pipeline from an approved REQ — parallel cross-reviews, feedback loops, spec generation, and implementation handoff. Implements Evaluator-Optimizer + Parallelization patterns from Anthropic's Building Effective Agents.
---

# Development Process Orchestrator

You are the **orchestrator** for the product development lifecycle. You coordinate skills as workers, manage feedback loops, and gate each phase on quality approval.

**Pattern:** Evaluator-Optimizer with Parallelization.
- Reviewers run **in parallel** as evaluators.
- The document owner is the optimizer — it addresses all feedback and revises.
- The loop repeats until all reviewers approve.

**Scope:** You do NOT write requirements, specs, or code yourself. You coordinate skills and manage gates. Your only direct action is reading documents, determining approval status, and dispatching agents.

---

## How to Invoke

```
/pdlc:orchestrate-dev docs/{feature-name}/REQ-{feature-name}.md
```

The argument must be a path to a user-approved REQ document.

---

## Skill Reference

| Skill | Role |
|-------|------|
| `pm-author` | Creates REQ, FSPEC; processes feedback on PM-owned docs |
| `pm-review` | Reviews TSPEC, PLAN, PROPERTIES, implementation from product perspective |
| `se-author` | Creates TSPEC, PLAN; implements code (TDD); addresses feedback on SE-owned docs |
| `se-review` | Reviews REQ, FSPEC, PROPERTIES from technical perspective |
| `te-author` | Creates PROPERTIES; addresses feedback on TE-owned docs |
| `te-review` | Reviews REQ, FSPEC, TSPEC, PLAN, implementation from testing perspective |
| `tech-lead` | Executes PLAN by dispatching parallel SE agents |
| `harvest-learnings` | Distills cross-reviews + post-mortems into LEARNINGS, then deletes the process artifacts (Phase H) |

---

## Pipeline Overview

```
[User-approved REQ]
        │
        ▼
┌────────────────────────────────────────────┐
│  Phase R: REQ Cross-Review Loop            │
│  Reviewers (parallel): se-review, te-review│
│  Optimizer: pm-author                      │
│  Loop until: se-review ✅ AND te-review ✅ │
└────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────┐
│  Phase F: FSPEC Creation + Review Loop     │
│  Creator: pm-author                        │
│  Reviewers (parallel): se-review, te-review│
│  Optimizer: pm-author                      │
│  Loop until: se-review ✅ AND te-review ✅ │
└────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────┐
│  Phase T: TSPEC Creation + Review Loop     │
│  Creator: se-author                        │
│  Reviewers (parallel): pm-review, te-review│
│  Optimizer: se-author                      │
│  Loop until: pm-review ✅ AND te-review ✅ │
└────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────┐
│  Phase D: DECISIONS Gate (conditional)     │
│  Orchestrator judges if warranted;         │
│  if yes — Creator: se-author,              │
│  Reviewers: pm-review, te-review;          │
│  if no — log skip for Phase H              │
└────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────┐
│  Phase P: PLAN Creation + Review Loop      │
│  Creator: se-author                        │
│  Reviewers (parallel): pm-review, te-review│
│  Optimizer: se-author                      │
│  Loop until: pm-review ✅ AND te-review ✅ │
└────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────┐
│  Phase PR: PROPERTIES Creation + Review    │
│  Creator: te-author                        │
│  Reviewers (parallel): pm-review, se-review│
│  Optimizer: te-author                      │
│  Loop until: pm-review ✅ AND se-review ✅ │
└────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────┐
│  Phase I: Implementation                   │
│  tech-lead executes PLAN (parallel agents) │
└────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────┐
│  Phase PT: PROPERTIES Tests                │
│  se-author implements all PROPERTIES tests │
│  (TDD, full suite passes)                  │
└────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────┐
│  Phase CR: Final Codebase Review Loop      │
│  Reviewers (parallel): pm-review, te-review│
│  Against: REQ acceptance criteria          │
│  Optimizer: se-author                      │
│  Loop until: pm-review ✅ AND te-review ✅ │
└────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────┐
│  Phase H: Harvest                          │
│  harvest-learnings distills cross-reviews  │
│  + post-mortems → LEARNINGS, then deletes  │
│  the harvested CROSS-REVIEW-* files        │
└────────────────────────────────────────────┘
        │
        ▼
   Pipeline Complete — ready for PR
```

---

## Reviewer Assignment Matrix

| Document | Reviewers (parallel) | Optimizer |
|----------|---------------------|-----------|
| REQ | se-review, te-review | pm-author |
| FSPEC | se-review, te-review | pm-author |
| TSPEC | pm-review, te-review | se-author |
| DECISIONS (conditional) | pm-review, te-review | se-author |
| PLAN | pm-review, te-review | se-author |
| PROPERTIES | pm-review, se-review | te-author |
| Implementation | pm-review, te-review | se-author |

---

## Detailed Workflow

### Step 1: Parse Inputs

1. Read the REQ document at the provided path.
2. Extract the feature name from the path (e.g., `docs/postgres-storage/REQ-postgres-storage.md` → `postgres-storage`).
3. Confirm the document exists and is non-empty. If not → report and halt.
4. All artifacts live under `docs/{feature-name}/`.

---

### Step 2: REQ Cross-Review Loop

**Goal:** Both `se-review` and `te-review` issue Approved.

#### 2a. Parallel Review

Dispatch two agents **in parallel** using `isolation: "worktree"`:

**Agent 1 — se-review:**
```
Invoke /pdlc:se-review to review docs/{feature-name}/REQ-{feature-name}.md.
Scope: technical feasibility, implementability of acceptance criteria,
non-functional requirements, missing technical constraints.
Output: docs/{feature-name}/CROSS-REVIEW-software-engineer-REQ[-v{N}].md
Commit and push.
```

**Agent 2 — te-review:**
```
Invoke /pdlc:te-review to review docs/{feature-name}/REQ-{feature-name}.md.
Scope: testability of acceptance criteria, completeness of edge cases,
precision of requirements, missing negative scenarios.
Output: docs/{feature-name}/CROSS-REVIEW-test-engineer-REQ[-v{N}].md
Commit and push.
```

Wait for both agents to complete.

#### 2b. Gate Check

Read both cross-review files. Check the `Recommendation:` line in each.

- **Both Approved or Approved with minor changes** → before exiting the gate, confirm:
  - **Infra/deployment-governance posture** is either settled (a deployment DECISIONS doc exists or the REQ covers it as an NFR) or explicitly scoped as a separate workstream with a named owner.
  - **Product naming** is finalized — all major entities, modules, and public APIs have definitive names. Ambiguous or unresolved naming at REQ sign-off ripples through FSPEC, TSPEC, PLAN, and PROPERTIES. If either is unresolved, add it as a High finding and loop back to 2c before proceeding to Step 3.
  - Then → proceed to Step 3.
- **Either Needs revision** → proceed to 2c.

Report gate status to user: which reviewers approved/failed, summary of critical findings.

#### 2c. Optimizer — pm-author

```
Invoke /pdlc:pm-author to process feedback on docs/{feature-name}/REQ-{feature-name}.md.
Read ALL cross-review files for REQ (including all versioned suffixes).
Address every High and Medium finding. Use judgment for Low.
Update docs/{feature-name}/REQ-{feature-name}.md in place.
Commit and push.
```

Loop back to **2a** (increment review version suffix: `-v2`, `-v3`, ...).

---

### Step 3: FSPEC Creation + Review Loop

**Trigger:** REQ approved.

#### 3a. Create FSPEC

```
Invoke /pdlc:pm-author to create a functional specification.
Input: docs/{feature-name}/REQ-{feature-name}.md
Output: docs/{feature-name}/FSPEC-{feature-name}.md
Commit and push.
```

#### 3b. FSPEC Cross-Review Loop

Same structure as Step 2, targeting `FSPEC-{feature-name}.md` and output files `CROSS-REVIEW-software-engineer-FSPEC[-v{N}].md` / `CROSS-REVIEW-test-engineer-FSPEC[-v{N}].md`.

- **se-review:** behavioral flows for implementability, business rules for ambiguity, error scenarios for completeness.
- **te-review:** flows for testability, edge cases for coverage, acceptance tests for sufficiency.
- **pm-author** (optimizer): addresses all feedback, updates FSPEC in place.

Loop until both approve or 5-iteration limit.

---

### Step 4: TSPEC Creation + Review Loop

**Trigger:** FSPEC approved.

#### 4a. Create TSPEC

```
Invoke /pdlc:se-author to create a technical specification.
Input: docs/{feature-name}/REQ-{feature-name}.md
       docs/{feature-name}/FSPEC-{feature-name}.md
Output: docs/{feature-name}/TSPEC-{feature-name}.md
Commit and push.
```

#### 4b. TSPEC Cross-Review Loop

Dispatch two agents **in parallel**:

**Agent 1 — pm-review:**
```
Invoke /pdlc:pm-review to review docs/{feature-name}/TSPEC-{feature-name}.md.
Output: docs/{feature-name}/CROSS-REVIEW-product-manager-TSPEC[-v{N}].md
Commit and push.
```

**Agent 2 — te-review:**
```
Invoke /pdlc:te-review to review docs/{feature-name}/TSPEC-{feature-name}.md.
Output: docs/{feature-name}/CROSS-REVIEW-test-engineer-TSPEC[-v{N}].md
Commit and push.
```

**Optimizer — se-author:**
```
Invoke /pdlc:se-author to address feedback on docs/{feature-name}/TSPEC-{feature-name}.md.
Read ALL cross-review files for TSPEC (all versioned suffixes).
Address every High and Medium finding. Update TSPEC in place.
Commit and push.
```

Loop until both pm-review and te-review approve or 5-iteration limit.

---

### Step 4.5: DECISIONS Gate (conditional)

**Trigger:** TSPEC approved.

Judge whether this feature has architectural decisions worth recording: **were real alternatives weighed and rejected during TSPEC authoring/review?** Look for rejected proposals in the TSPEC cross-reviews, contested design choices, or constraints that forced a non-obvious shape.

- **If no** (trivial feature, no load-bearing alternatives) → record a one-line skip note to surface in Phase H's LEARNINGS (`DECISIONS: skipped — no load-bearing alternatives`), and proceed to Step 5. Do not create an empty DECISIONS doc.
- **If yes** → create and review it:

```
Invoke /pdlc:se-author to create a decisions document.
Input: docs/{feature-name}/TSPEC-{feature-name}.md (+ REQ, FSPEC, TSPEC cross-reviews)
Output: docs/{feature-name}/DECISIONS-{feature-name}.md
Commit and push.
```

Then run a cross-review loop (reviewers **pm-review** + **te-review**, optimizer **se-author**), output files `CROSS-REVIEW-product-manager-DECISIONS[-v{N}].md` / `CROSS-REVIEW-test-engineer-DECISIONS[-v{N}].md`, same gate and 5-iteration limit as other phases. pm-review checks each decision traces to a real product/scope constraint; te-review checks re-evaluation triggers are observable/testable.

Loop until both approve, then proceed to Step 5.

---

### Step 5: PLAN Creation + Review Loop

**Trigger:** TSPEC approved.

#### 5a. Create PLAN

```
Invoke /pdlc:se-author to create an execution plan.
Input: docs/{feature-name}/REQ-{feature-name}.md
       docs/{feature-name}/FSPEC-{feature-name}.md
       docs/{feature-name}/TSPEC-{feature-name}.md
Output: docs/{feature-name}/PLAN-{feature-name}.md
Commit and push.
```

If this feature extends symbols from a prior-phase baseline, instruct se-author to add a `P2-00 pre-flight gate` task as the **first** PLAN task (see se-author PLAN conventions).

#### 5b. PLAN Cross-Review Loop

Dispatch two agents **in parallel**:

**Agent 1 — pm-review:**
```
Invoke /pdlc:pm-review to review docs/{feature-name}/PLAN-{feature-name}.md.
Output: docs/{feature-name}/CROSS-REVIEW-product-manager-PLAN[-v{N}].md
Commit and push.
```

**Agent 2 — te-review:**
```
Invoke /pdlc:te-review to review docs/{feature-name}/PLAN-{feature-name}.md.
Output: docs/{feature-name}/CROSS-REVIEW-test-engineer-PLAN[-v{N}].md
Commit and push.
```

**Optimizer — se-author:**
```
Invoke /pdlc:se-author to address feedback on docs/{feature-name}/PLAN-{feature-name}.md.
Read ALL cross-review files for PLAN (all versioned suffixes).
Update PLAN in place. Commit and push.
```

Loop until both pm-review and te-review approve or 5-iteration limit.

---

### Step 6: PROPERTIES Creation + Review Loop

**Trigger:** PLAN approved.

#### 6a. Create PROPERTIES

```
Invoke /pdlc:te-author to create a properties document.
Input: docs/{feature-name}/REQ-{feature-name}.md
       docs/{feature-name}/FSPEC-{feature-name}.md
       docs/{feature-name}/TSPEC-{feature-name}.md
       docs/{feature-name}/PLAN-{feature-name}.md
Output: docs/{feature-name}/PROPERTIES-{feature-name}.md
Commit and push.
```

#### 6b. PROPERTIES Cross-Review Loop

Dispatch two agents **in parallel**:

**Agent 1 — pm-review:**
```
Invoke /pdlc:pm-review to review docs/{feature-name}/PROPERTIES-{feature-name}.md.
Output: docs/{feature-name}/CROSS-REVIEW-product-manager-PROPERTIES[-v{N}].md
Commit and push.
```

**Agent 2 — se-review:**
```
Invoke /pdlc:se-review to review docs/{feature-name}/PROPERTIES-{feature-name}.md.
Output: docs/{feature-name}/CROSS-REVIEW-software-engineer-PROPERTIES[-v{N}].md
Commit and push.
```

**Optimizer — te-author:**
```
Invoke /pdlc:te-author to address feedback on docs/{feature-name}/PROPERTIES-{feature-name}.md.
Read ALL cross-review files for PROPERTIES (all versioned suffixes).
Update PROPERTIES in place. Commit and push.
```

Loop until both pm-review and se-review approve or 5-iteration limit.

---

### Step 7: Implementation — tech-lead Executes PLAN

**Trigger:** PROPERTIES approved.

```
Invoke /pdlc:tech-lead docs/{feature-name}/PLAN-{feature-name}.md
```

The tech-lead will parse the PLAN, present the batch execution plan to the user for approval, dispatch `se-author` agents in parallel per batch, merge worktrees, run the test suite, and update PLAN statuses to ✅.

Wait for tech-lead to report all phases complete. If tech-lead halts for any reason → halt the orchestrator and report the failure. Do not proceed to Step 8.

---

### Step 8: PROPERTIES Tests Implementation

**Trigger:** tech-lead reports all PLAN phases complete.

```
Invoke /pdlc:se-implement to implement PROPERTIES tests.
Input: docs/{feature-name}/PROPERTIES-{feature-name}.md
       docs/{feature-name}/TSPEC-{feature-name}.md
       docs/{feature-name}/PLAN-{feature-name}.md
Task: For each property without a corresponding test, write it using TDD
(Red → Green → Refactor) at the level specified in PROPERTIES (Unit / Integration / E2E).
Run the full test suite. All tests must pass before committing.
Commit and push.
```

If any test fails → halt and report to user.

---

### Step 9: Final Codebase Review Loop

**Trigger:** PROPERTIES tests passing.

Dispatch two agents **in parallel**:

**Agent 1 — pm-review:**
```
Invoke /pdlc:pm-review to review the implemented codebase.
Input: docs/{feature-name}/REQ-{feature-name}.md (source of truth) + current feature branch.
Output: docs/{feature-name}/CROSS-REVIEW-product-manager-IMPLEMENTATION[-v{N}].md
Commit and push.
```

**Agent 2 — te-review:**
```
Invoke /pdlc:te-review to review the implemented codebase.
Input: docs/{feature-name}/REQ-{feature-name}.md
       docs/{feature-name}/PROPERTIES-{feature-name}.md
       test suite on current feature branch.
Output: docs/{feature-name}/CROSS-REVIEW-test-engineer-IMPLEMENTATION[-v{N}].md
Commit and push.
```

**Gate Check:**
- Both Approved → proceed to Step 10.
- Either Needs revision → optimizer:

```
Invoke /pdlc:se-implement to address implementation review feedback.
Read all CROSS-REVIEW-*-IMPLEMENTATION[-v{N}].md files.
Fix all High and Medium findings. Follow TDD for new code.
Run full test suite. All tests must pass. Commit and push.
```

Loop until both approve or 5-iteration limit.

---

### Step 9.5: Phase H — Harvest

**Trigger:** Final codebase review approved.

> ⚠️ **Gating prerequisite:** This phase reads `CROSS-REVIEW-*` and `POSTMORTEM-*` files that subagents wrote in worktrees. They must have merged onto `feat-{feature-name}` first. Do **not** enable Phase H until the feature-branch-consistency fix has landed (artifacts written in a worktree must survive merge before harvest reads them), or harvest will read a branch missing the files. Until then, skip Phase H and leave cross-reviews in place.

```
Invoke /pdlc:harvest-learnings docs/{feature-name}
Read ALL CROSS-REVIEW-*.md (every doc type, every -v{N}) and POSTMORTEM-*.md for the feature.
Distill durable signal into docs/{feature-name}/LEARNINGS-{feature-name}.md using Scope tags.
Commit and push LEARNINGS FIRST.
Then delete the harvested CROSS-REVIEW-* files. Commit and push.
```

A guard hook blocks deletion of any `CROSS-REVIEW-*` file until `LEARNINGS-{feature-name}.md` exists on the branch — harvest-then-delete is enforced, not merely intended.

If harvest-learnings fails or the guard blocks a deletion → halt and report. Leave cross-reviews in place; do not proceed to Step 10 with a half-harvested feature.

---

### Step 10: Pipeline Complete

```
Pipeline complete. Feature {feature-name} is fully implemented and reviewed.

  REQ:        docs/{feature-name}/REQ-{feature-name}.md         ✅ Approved
  FSPEC:      docs/{feature-name}/FSPEC-{feature-name}.md       ✅ Approved
  TSPEC:      docs/{feature-name}/TSPEC-{feature-name}.md       ✅ Approved
  PLAN:       docs/{feature-name}/PLAN-{feature-name}.md        ✅ Complete
  PROPERTIES: docs/{feature-name}/PROPERTIES-{feature-name}.md  ✅ Approved
  Implementation:                                                ✅ Approved
  All tests passing:                                             ✅
  LEARNINGS:  docs/{feature-name}/LEARNINGS-{feature-name}.md   ✅ Harvested
  Cross-reviews harvested and removed:                           ✅

Ready for PR. Run /review to generate a pull request review.
```

---

## Loop Mechanics

### Shared High Finding Fast-Path

When the **same finding** (by finding ID, description, or clear semantic equivalence) is raised **High** by **both** reviewers in the same iteration, treat it as a priority-0 resolution item: the spec documents being reviewed contain an upstream spec-internal contradiction. Dispatch the optimizer immediately to resolve the contradiction **before** processing other findings from that iteration. Two independent reviewers raising the identical High finding almost always indicates that two spec docs contradict each other (e.g., FSPEC says `list`, TSPEC says `tuple`) — cheapest to fix, most expensive to defer.

### Iteration Versioning

- Iteration 1: `CROSS-REVIEW-{skill}-{doc-type}.md`
- Iteration 2: `CROSS-REVIEW-{skill}-{doc-type}-v2.md`
- Iteration 3+: `-v3.md`, `-v4.md`, ...

The optimizer always reads **all** versions before addressing feedback.

### Loop Limit

Each review loop has a **maximum of 5 iterations**. If the limit is reached:
- **First, write a post-mortem** (see below) — a halt that fails to converge is the highest-value learning signal the system produces; capture it before stopping.
- Then halt. Report which reviewers still need revision and all unresolved High/Medium findings.
- Do not proceed to the next phase.

### Non-Convergence Post-Mortem

When any review loop hits the 5-iteration limit, before halting, write `docs/{feature-name}/POSTMORTEM-{phase}-{feature-name}.md` (e.g. `POSTMORTEM-TSPEC-postgres-storage.md`):

```markdown
# POSTMORTEM — {phase} non-convergence — {feature-name}

| Field | Detail |
|---|---|
| Phase | {REQ / FSPEC / TSPEC / DECISIONS / PLAN / PROPERTIES / IMPLEMENTATION} |
| Iterations | 5 (limit reached) |
| Reviewers | {who} |

## Pattern of Disagreement
Across iterations: did one reviewer keep raising the same finding? did findings shift each round? did two reviewers pull in opposite directions?

## Best-Guess Root Cause
The optimizer's read on *why* it wouldn't converge.

## Recommendation
One of: **skill-prompt issue** (a review/author skill needs sharper guidance) · **upstream-doc ambiguity** (REQ/FSPEC under-specified) · **genuine cross-functional tension** (needs human/leadership resolution).
```

This file is read by Phase H (`harvest-learnings`) and feeds the next consolidation pass. Commit and push it before halting.

### Approval Rules

| Recommendation | Gate Decision |
|----------------|---------------|
| Approved | ✅ Pass |
| Approved with minor changes | ✅ Pass |
| Needs revision | ❌ Fail — trigger optimizer |

A gate passes only when **all reviewers** for that phase have issued a passing recommendation.

---

## Error Handling

| Scenario | Action |
|----------|--------|
| REQ file not found | Report path, halt |
| Reviewer agent fails | Report failure, halt |
| Optimizer agent fails | Report failure, halt — do not proceed with stale doc |
| Loop limit reached | Write POSTMORTEM-{phase}-{feature}.md, then halt and summarize unresolved findings |
| tech-lead halts | Propagate failure, halt orchestrator |
| Test suite fails | Halt, report failing tests |
| Merge conflict in worktree | Abort merge, halt, report conflicting files |

---

## Progress Reporting

```
[Phase R — REQ Review] Iteration 1
  se-review:  Needs revision (3 findings: 2 High, 1 Low)
  te-review:  Needs revision (2 findings: 1 High, 1 Medium)

[Phase R — REQ Review] pm-author addressing 6 findings...

[Phase R — REQ Review] Iteration 2
  se-review:  Approved ✅
  te-review:  Approved with minor changes ✅

[Phase R] REQ approved — proceeding to FSPEC.
```

Use this format for all phases. Never silently skip a phase or loop iteration.
