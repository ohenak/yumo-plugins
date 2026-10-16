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

For an operator-accepted GitHub Issue handoff, use the opt-in chain route:

Create a durable feature worktree before writing the feature REQ or starting delivery. Write the REQ in the printed worktree path. The source checkout can be dirty; this command leaves it untouched. By default, worktrees live under `~/.local/share/yumo/worktrees`; choose another durable parent with `--workspace-root`. A relative root is resolved against `--cwd`. Temporary roots such as `/tmp` are refused.

```text
pdlc workspace {feature} --cwd /path/to/repository [--workspace-root /path/to/durable/worktrees]
```

Run the following command from the printed path, or pass that path as `--cwd`:

```text
pdlc dev docs/{feature}/REQ-{feature}.md --delivery-mode chain --accepted-issue https://github.com/{owner}/{repo}/issues/{number}
```

The issue and its comments remain the requirements and design decision record; the operator reviews them before invocation. Provide a nonempty REQ, `docs/{feature}/_evidence/seam-map.md`, and `docs/{feature}/_evidence/issue-decisions.md` containing the accepted issue URL. Chain mode checks those inputs, creates missing FSPEC, TSPEC, DECISIONS, PLAN, and PROPERTIES artifacts, and checks each once in order. Its deterministic artifact checks cover nonempty content, the issue URL in issue decisions, and FSPEC REQ-ID agreement; they do not prove substantive design agreement. It reports `chain-validated` without cross-review rounds or reviewer approval. Implementation, tests, DoD, harvest, and PR delivery follow. CI requires at least one returned branch `push` run for the PR's current `headRefOid`, with every returned exact-SHA push run completed successfully; missing or stale evidence halts. One failed run permits one repair push and a new exact-head check. Report only run URL, commit SHA, gate result, and repair count; keep private account and position data out of reports. An invocation without `--delivery-mode chain` keeps the existing `pdlc dev` behavior.

Chain mode runs one pre-PR DoD verifier on accepted workflow scope, local tests, and staged-file privacy. It requires a nonempty `CODE_REVIEW-{feature}-v{N}.md` citing the accepted issue and a `DOD_STATUS: passed` verdict. A missing or failed verdict halts without remediation. PR/head CI and controlled red/repair evidence follow after the working PR exists; the verified PR stays open. See the [accepted Yumo sequencing decision](https://github.com/ohenak/yumo-plugins/issues/89#issuecomment-6175299366).

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
