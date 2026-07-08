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

## Model Selection

The workflow pins a model per phase via the runtime `agent()` `model` option:

- **Phase I (Implementation batches — `se-implement`) runs on Sonnet.** The PLAN and PROPERTIES already constrain this TDD work, so it is optimized for throughput/cost.
- **Every other phase runs on Opus** — REQ/FSPEC/TSPEC/PLAN/PROPERTIES reviews and authoring, PROPERTIES tests, final codebase review, Definition of Done, Harvest, and PR/CI. These are reasoning-heavy.

Model constants live at the top of `pdlc/workflows/orchestrate-dev.js` (`MODEL_DEFAULT = "opus"`, `MODEL_IMPLEMENTATION = "sonnet"`). Agent calls default to Opus; the Phase I dispatch site overrides to Sonnet.

---

## Definition of Done Verification (Phase DOD)

After the Final Codebase Review and before Harvest, the workflow runs a mechanical Definition of Done gate. It is an **evaluator → optimizer** loop, not a single self-fixing agent:

1. **Rebase (step 0).** `ship-pr` rebases `feat-{feature}` onto the latest remote default branch so the scan — and the PR raised later in Phase PUB — reflects the real merge state. If the rebase conflicts, the pipeline halts (resolve manually and re-run).
2. **Verify.** `dod-verify` scans the branch against **six criteria** — see `dod-verify` SKILL.md for the full definitions (single source of truth, so the two files cannot drift) — and **documents** every finding (Scope-tagged) in a versioned `CODE_REVIEW-{feature}-v{N}.md` file. It does **not** fix anything. The six: (1) no stubs in production code, (2) all integrations wired, (3) no mock/fake data in production, (4) branch coverage ≥ 85% via property-based testing, (5) requirements delivered — every REQ/FSPEC/PROPERTIES criterion traceable to the **final operator-visible artifact** and a failing test, (6) integration-boundary integrity — no adjacent surface silently falsified, no unhandled same-shape sibling, every deferral bound to a queue row or successor REQ.
3. **Remediate.** If `dod-verify` reports findings, the workflow dispatches `se-implement` to address every finding in the latest `CODE_REVIEW` via TDD, then re-verifies (a new `-v{N+1}` review).

The loop alternates verify → remediate up to 3 times; if findings persist, the pipeline halts. The `CODE_REVIEW-{feature}-v{N}.md` files are tracked process artifacts — harvested into `LEARNINGS` and deleted in Phase H, exactly like `CROSS-REVIEW-*`. Set `PHASE_DOD_ENABLED = false` in the workflow script to skip this phase.

---

## Auto-PR & CI Verification (Phase PUB)

After Harvest, the workflow automatically raises a pull request for `feat-{feature}` (reusing an open PR if one exists) and then verifies CI. The branch was already rebased onto the latest default branch in Phase DOD, so `ship-pr` does **not** rebase here — it just opens/reuses the PR. The PR runs **last** so it captures the complete branch, including harvested `LEARNINGS`. PR creation and CI reporting are delegated to the `ship-pr` skill; the **poll-timing logic lives in the workflow script**, not the agent.

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
