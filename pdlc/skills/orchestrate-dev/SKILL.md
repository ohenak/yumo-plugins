---
name: orchestrate-dev
description: Top-level PDLC pipeline orchestrator. Delegates to `pdlc dev <req-path>`, the published `@kaneho/pdlc-engine` CLI, which runs the full REQ → FSPEC → TSPEC → PLAN → PROPERTIES → Implementation → DOD → Publish → Merge pipeline for one feature.
---

# orchestrate-dev — Pointer/Contract

This skill delegates to `@kaneho/pdlc-engine`. It does not run the pipeline itself.

---

## Invocation Contract

```
/pdlc:orchestrate-dev docs/{feature}/REQ-{feature}.md
```

- Input: path must match `docs/{feature}/REQ-{feature}.md` (directory segment and filename segment must agree).
- Delegates to: `pdlc dev <req-path>`.
- Returns: the CLI's final pipeline report, relayed verbatim — no intermediate agent outputs.

---

## Preconditions

- The REQ file must exist and be non-empty at the provided path.
- The feature branch `feat-{feature}` should exist or be created before invocation.

---

## What the Workflow Does

Phase sequence (not a runbook — mechanics live in the engine, not here):

`REQ review → FSPEC → TSPEC → DECISIONS (conditional) → PLAN → PROPERTIES → Implementation batches → PROPERTIES tests → Final codebase review → Definition of Done verification → Harvest → Raise PR & Verify CI → Merge & Advance Queue (Phase MERGE)`

---

## Auto-Approved Batching Decision

Implementation batches (Phase I) execute automatically without user approval. The batch plan is logged for the developer to observe; auto-approval eliminates human-in-the-loop latency for background execution.

---

## Known Alternative: Two-Workflow Split

A two-workflow split (`orchestrate-spec` / `orchestrate-impl`) was considered and rejected: it would require a developer to manually invoke the second workflow once the first completes, reintroducing the manual coordination the single-workflow approach eliminates.

---

## Artifact Conventions

All artifacts live under `docs/{feature}/`. See CLAUDE.md §pdlc specifics for full naming conventions (REQ, FSPEC, TSPEC, DECISIONS, PLAN, PROPERTIES, LEARNINGS, CROSS-REVIEW-*, POSTMORTEM-*).

---

## Resolution Ladder

The invocation resolves `pdlc dev <req-path>` through:

1. A globally installed `pdlc` binary, if present on `PATH`.
2. `npm install -g @kaneho/pdlc-engine`, then re-invoke `pdlc dev <req-path>`.
3. `npx --no-install pdlc dev <req-path>`, if a local install already exists.

If none resolves, this skill refuses and reports the exact command it could not run: `npm install -g @kaneho/pdlc-engine`. It does not fall back to hand-running any workflow module.
