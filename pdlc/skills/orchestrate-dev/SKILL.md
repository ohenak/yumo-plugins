---
name: orchestrate-dev
description: Development process orchestrator. Runs the full PDLC pipeline from an approved REQ — parallel cross-reviews, feedback loops, spec generation, and implementation handoff. Implements Evaluator-Optimizer + Parallelization patterns from Anthropic's Building Effective Agents.
---

# orchestrate-dev — Pointer/Contract

This skill delegates to a workflow script. It does not run the pipeline itself.

---

## Invocation Contract

```
/pdlc:orchestrate-dev docs/{feature}/REQ-{feature}.md
```

- Input: path must match `docs/{feature}/REQ-{feature}.md` (directory segment and filename segment must agree).
- Returns: a final pipeline report object in main context — no intermediate agent outputs.

---

## Preconditions

- The REQ file must exist and be non-empty at the provided path.
- The feature branch `feat-{feature}` should exist or be created before invocation.

---

## What the Workflow Does

Phase sequence (not a runbook — see workflow script for mechanics):

`REQ review → FSPEC → TSPEC → DECISIONS (conditional) → PLAN → PROPERTIES → Implementation batches → PROPERTIES tests → Final codebase review → Definition of Done verification → Harvest → Raise PR & Verify CI`

---

## Definition of Done Verification (Phase DOD)

After the Final Codebase Review and before Harvest, the workflow runs a mechanical Definition of Done gate. The `dod-verify` skill scans all production code on the feature branch for four criteria:

1. **No stubs** — no TODOs, placeholders, `NotImplementedError`, or stub implementations in production code
2. **All integrations wired** — no unused imports, dead config, or placeholder URLs
3. **No mock data in production** — no hardcoded test/fake data outside test files
4. **Branch coverage ≥ 85%** — all new modules must meet the coverage floor via property-based testing

The `dod-verify` skill is self-remediating — it both identifies and fixes violations in a single invocation, then commits and pushes. The workflow re-invokes it up to 3 times; if violations persist, the pipeline halts. Set `PHASE_DOD_ENABLED = false` in the workflow script to skip this phase.

---

## Auto-PR & CI Verification (Phase PUB)

After Harvest, the workflow automatically raises a pull request for `feat-{feature}` (reusing an open PR if one exists) and then verifies CI. Before creating the PR, `ship-pr` rebases the feature branch onto the latest remote default branch to ensure a conflict-free merge. If the rebase produces conflicts, the pipeline halts — conflicts must be resolved manually. The PR runs **last** so it captures the complete branch, including harvested `LEARNINGS`. PR creation and CI reporting are delegated to the `ship-pr` skill; the **poll-timing logic lives in the workflow script**, not the agent.

CI verification rule: the script polls the PR's GitHub Actions checks. Checks usually register within ~5 minutes. If **no** checks appear within **10 minutes**, the script concludes the repo has no PR checks configured and treats the phase as a pass (`ciStatus: no-checks`). Once checks appear, the script waits for completion: all-pass ⇒ ✅; any failure ⇒ the pipeline halts with the failing PR identified. The final report carries `prUrl` and `ciStatus`. Set `PHASE_PUB_ENABLED = false` in the workflow script to skip this phase.

---

## Auto-Approved Batching Decision

Implementation batches (Phase I) execute automatically without user approval. Rationale: the batch plan is logged to `/workflows` before dispatch so the developer can observe it; auto-approval eliminates the human-in-the-loop latency that would stall background execution.

---

## Known Alternative: Two-Workflow Split

A two-workflow split (`orchestrate-spec` / `orchestrate-impl`) was considered and rejected. It would require the developer to manually invoke the second workflow after the first completes, reintroducing the manual coordination overhead that the single-workflow approach eliminates.

---

## Artifact Conventions

All artifacts live under `docs/{feature}/`. See CLAUDE.md §pdlc specifics for full naming conventions (REQ, FSPEC, TSPEC, DECISIONS, PLAN, PROPERTIES, LEARNINGS, CROSS-REVIEW-*, POSTMORTEM-*).

---

## Workflow Script Path

- Canonical plugin source: `pdlc/workflows/orchestrate-dev.js`
- Runtime-loaded consumer copy: `.claude/workflows/orchestrate-dev.js`

The consumer copy is a direct copy of the plugin source (no build step). Until a formal `pdlc install` mechanism exists, this copy is managed manually.
