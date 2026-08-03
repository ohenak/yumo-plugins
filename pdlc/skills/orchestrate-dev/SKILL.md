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

`REQ review → FSPEC → TSPEC → DECISIONS (conditional) → PLAN → PROPERTIES → Implementation batches → PROPERTIES tests → Final codebase review → Definition of Done verification → Harvest → Raise PR & Verify CI → Merge & Advance Queue (Phase MERGE)`

---

## POSTMORTEM Lifecycle and the `RESOLVED:` Marker

A review loop that exhausts its rounds writes `POSTMORTEM-{phase}-{feature}.md` and halts. Before that phase is allowed to run again the workflow reads the file's `RESOLVED:` marker — a `RESOLVED:` line anywhere outside a fenced block. `RESOLVED: yes` clears the POSTMORTEM and the phase proceeds; `RESOLVED: no`, or an absent or malformed marker, refuses the phase and reports the POSTMORTEM's `## Recommendation` so the operator sees what to do (fail closed: a marker that cannot be read is an unaddressed failure). The marker is **human-written only** — no agent and no script ever writes `yes`; a POSTMORTEM resolves when a person says it did.

---

## Model Selection

The workflow pins a model per phase via the runtime `agent()` `model` option: Phase I (Implementation batches — `se-implement`) runs on **Sonnet**, optimized for throughput/cost since the PLAN and PROPERTIES already constrain the TDD work; every other, more reasoning-heavy phase runs on **Opus**. Constants live at the top of `pdlc/workflows/orchestrate-dev.js` (`MODEL_DEFAULT = "opus"`, `MODEL_IMPLEMENTATION = "sonnet"`).

---

## Definition of Done Verification (Phase DOD)

After the Final Codebase Review and before Harvest, the workflow runs a mechanical Definition of Done gate. It is an **evaluator → optimizer** loop, not a single self-fixing agent:

1. **Rebase (step 0).** `ship-pr` rebases `feat-{feature}` onto the latest remote default branch so the scan — and the PR raised later in Phase PUB — reflects the real merge state. If the rebase conflicts, the pipeline halts (resolve manually and re-run).
2. **Verify.** `dod-verify` scans the branch against **six criteria** — see `dod-verify` SKILL.md for the full definitions (single source of truth, so the two files cannot drift) — and **documents** every finding (Scope-tagged) in a versioned `CODE_REVIEW-{feature}-v{N}.md` file. It does **not** fix anything. The six: (1) no stubs in production code, (2) all integrations wired, (3) no mock/fake data in production, (4) branch coverage ≥ 85% via property-based testing, (5) requirements delivered — every REQ/FSPEC/PROPERTIES criterion traceable to the **final operator-visible artifact** and a failing test, (6) integration-boundary integrity — no adjacent surface silently falsified, no unhandled same-shape sibling, every deferral bound to a queue row or successor REQ.
3. **Remediate.** If `dod-verify` reports findings, the workflow dispatches `se-implement` to address every finding in the latest `CODE_REVIEW` via TDD, then re-verifies (a new `-v{N+1}` review).

The loop alternates verify → remediate up to 3 times; if findings persist, the pipeline halts. The `CODE_REVIEW-{feature}-v{N}.md` files are tracked process artifacts — harvested into `LEARNINGS` and deleted in Phase H, exactly like `CROSS-REVIEW-*`. Set `PHASE_DOD_ENABLED = false` in the workflow script to skip this phase.

---

## Auto-PR & CI Verification (Phase PUB)

After Harvest, the workflow automatically raises a pull request for `feat-{feature}` (reusing an open PR if one exists) and then verifies CI. The branch was already rebased onto the latest default branch in Phase DOD, so `ship-pr` does **not** rebase here — it just opens/reuses the PR. The PR runs **last** so it captures the complete branch, including harvested `LEARNINGS`. PR creation and CI reporting are delegated to the `ship-pr` skill; the **poll-timing logic lives in the workflow script**, not the agent. CI verification rule: the script polls the PR's GitHub Actions checks. Checks usually register within ~5 minutes. If **no** checks appear within **10 minutes**, the script concludes the repo has no PR checks configured and treats the phase as a pass (`ciStatus: no-checks`). Once checks appear, the script waits for completion: all-pass ⇒ ✅; any failure ⇒ the pipeline halts with the failing PR identified. The final report carries `prUrl` and `ciStatus`. Set `PHASE_PUB_ENABLED = false` in the workflow script to skip this phase.

---
## Merge & Advance Queue (Phase MERGE)
The last phase; a fixed decision ladder, no agent involved. A merge requires every precondition to hold — a self-modification guard (never merges a PR touching `pdlc/workflows/` or `.claude/workflows/`), repo capabilities, PR mergeable state, unresolved review threads, CI status, `mergeMode`, and idempotence against an already-merged PR. `mergeMode` ships `off` (resolves `skipped` by default; opt in via `.claude/pdlc.config.json`). On `merged`, it writes the queue row `done` itself (superseding the human-merge step above); otherwise it reports `deferred`/`refused` with a one-line reason (a closed set of four conditions additionally raise a `MERGE ESCALATION:` notice), never a halt, and the row stays `awaiting-merge`. Set `PHASE_MERGE_ENABLED = false` to skip.

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

- Canonical plugin source (ES module, unit-tested): `pdlc/workflows/orchestrate-dev.js`
- Built artifact (tracked): `pdlc/workflows/dist/orchestrate-dev.bundle.js` → untracked consumer runtime copy `.claude/workflows/orchestrate-dev.bundle.js`, installed by `sync-workflows.sh`

The bundle is **generated** — do not edit it. Run `node pdlc/workflows/build-runtime.mjs` after any change to a workflow source; `--check` exits non-zero when a bundle is stale (CI-usable, and asserted by `__tests__/runtimeBundle.test.js`).

The build exists because the workflow runtime is a restricted sandbox: `export const meta` must be the first statement and must be a pure literal, no other `export` is allowed, and `import` / `import()` / `process` / `fs` / `fetch` are all unavailable. The build strips module syntax and wraps each source in an IIFE; `pdlc/workflows/runtime-adapter.js` (inlined, never imported) re-expresses file reads/writes, existence checks, `gh` CI polling and worktree merges as `agent()` calls, and bridges the `agent` / `parallel` / `pipeline` signature differences. Everything is injected through the modules' existing `_agent`, `_readFile`, `_checkFile`, `_checkCi`, `_mergeWorktree` … parameters, so the ES modules stay the single tested source of truth. Because the adapter's IO is async, injected IO calls must be `await`ed at every call site in the source. Distribution is no longer a hand step. `node pdlc/workflows/build-runtime.mjs` writes the artifacts and `distribution-manifest.json` into `pdlc/workflows/dist/`; `pdlc/hooks/scripts/sync-workflows.sh` then installs them as the consumer's untracked runtime copy under `.claude/workflows/`, and `--check` on either command reports drift instead of hiding it.
