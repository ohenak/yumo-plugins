---
feature: pdlc-workflow-distribution
ready: false
depends-on: []
---

# REQ — pdlc-workflow-distribution

| Field | Value |
|---|---|
| Upstream | `docs/design/MASTER-PLAN-engineering-loop.md` (Break 3, order 1) |
| Downstream | `pdlc-merge-phase`, `pdlc-consolidation-agent`, `pdlc-engineering-loop` |
| Cross-Reviews | — |
| LEARNINGS | — |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-07-27 |

> **Scope in one line.** Detect and repair drift between the canonical workflow scripts in the
> plugin and the runtime-loaded consumer copies, so a merged workflow improvement actually executes.

## 1. Problem

`SKILL.md` files load live from the installed plugin — `CLAUDE.md` states it: "edit them in
interactive Claude Code sessions and the engine picks the change up automatically (no copies to
sync)." Workflow scripts do not. Both orchestrator SKILLs record the same convention:

> Canonical plugin source: `pdlc/workflows/orchestrate-dev.js`
> Runtime-loaded consumer copy: `.claude/workflows/orchestrate-dev.js`
> … Until a formal `pdlc install` mechanism exists, this copy is managed manually.

"Managed manually" means: a workflow improvement can be authored, reviewed, merged and archived
in `yumo-plugins`, and never run anywhere, because no consumer copied it. There is no check, no
warning, and no symptom. The pipeline keeps working — on the old script.

Verified 2026-07-27: `regime-ledger-research/.claude/workflows/orchestrate-dev.js` and
`orchestrate-queue.js` are byte-identical to the plugin sources, last synced 22 July. That is a
manual copy that happens to be current, not a mechanism that keeps it current.

This blocks the whole engineering loop. Every later feature in this plan ends with "and then the
improved pipeline runs" — which is false while distribution is a human's memory.

## 2. User stories

- **US-01** — As the operator, I want to be told at session start when a consumer repo is running
  a stale workflow script, so I never debug behavior that the source no longer describes.
- **US-02** — As the operator, I want a single command to bring a consumer repo's workflow copies
  up to date.
- **US-03** — As the operator, I want the drift check to tell me *which direction* the drift runs,
  because a consumer copy edited locally is a different problem from a consumer copy left behind.
- **US-04** — As the consolidation agent, I want a merged workflow change to reach the consumers
  it was written for, otherwise my promotion is a no-op.

## 3. Requirements

### REQ-DIST-01 — Drift detection

- **AC-1.1** — Given a consumer repo with `.claude/workflows/{name}.js` and an installed pdlc
  plugin exposing `pdlc/workflows/{name}.js`, Then a drift check compares the two by content hash
  and reports one of `in-sync`, `stale` (consumer older, plugin content differs), `local-edit`
  (consumer differs and the consumer's copy is newer), or `missing` (consumer copy absent).
- **AC-1.2** — Given the plugin source is unreachable (plugin not installed, path unresolvable),
  Then the check reports `unknown` with the reason and does **not** report `in-sync`. Absence of
  evidence is not evidence of sync.
- **AC-1.3** — Given a consumer copy that is byte-identical to the plugin source, Then the result
  is `in-sync` regardless of file timestamps.
- **AC-1.4** — Given multiple workflow scripts, Then each is reported independently; one stale
  script does not mask a second stale script.
- **AC-1.5** — Given a workflow script present in the consumer that has no plugin counterpart
  (a repo-local workflow, e.g. `orchestrate-wheel.js`), Then it is reported as `not-managed` and
  is never modified by any operation in this feature.

AC-1.5 matters concretely: `regime-ledger-research/.claude/workflows/` contains `daily-macro.js`,
`onboard-symbol.js` and `orchestrate-wheel.js`, none of which come from the plugin. A sync
operation that touched them would destroy repo-local work.

### REQ-DIST-02 — SessionStart warning

- **AC-2.1** — Given a `SessionStart` hook and any managed script in state `stale` or `missing`,
  Then a warning names the script, the state, and the remediation command.
- **AC-2.2** — Given every managed script is `in-sync` or `not-managed`, Then the hook emits
  nothing. Silence means synced.
- **AC-2.3** — Given state `local-edit`, Then the warning is distinct from `stale` and explicitly
  does **not** recommend the sync command, because syncing would discard the local edit.
- **AC-2.4** — Given the hook fails for any reason, Then it exits successfully with the failure
  logged. A broken drift check must never block a session from starting.

### REQ-DIST-03 — Sync action

- **AC-3.1** — Given `/pdlc:sync-workflows`, Then every managed script in state `stale` or
  `missing` is copied from the plugin source to the consumer path, and each copy is reported.
- **AC-3.2** — Given a script in state `local-edit`, Then it is **not** overwritten; the command
  reports it and requires `--force` to proceed.
- **AC-3.3** — Given `--check`, Then the command reports drift and copies nothing, exiting
  non-zero when any managed script is `stale` or `missing`. This is the CI-usable form.
- **AC-3.4** — Given a sync runs, Then the pre-sync content of every overwritten file is preserved
  (backup or a recorded hash sufficient to recover), because an unintended overwrite of a
  `local-edit` under `--force` must be recoverable.
- **AC-3.5** — Given a sync completes, Then a subsequent `--check` reports `in-sync` for every
  script it copied.

### REQ-DIST-04 — Pipeline integration

- **AC-4.1** — Given `orchestrate-queue` begins an invocation, Then it runs the drift check
  first, and a `stale` managed script produces outcome `blocked` with the drift as the reason.
  The queue must not run a feature through a pipeline the operator believes is current when it
  is not.
- **AC-4.2** — Given AC-4.1 blocks, Then the report names the stale scripts and the remediation
  command, so the operator's turn is one command rather than an investigation.
- **AC-4.3** — Given a configuration flag `distributionCheckEnabled: false`, Then AC-4.1 is
  skipped. The flag ships `true`.

### REQ-DIST-05 — Version stamping

- **AC-5.1** — Given a workflow script, Then it carries a version constant, and the drift report
  includes both versions when they differ, so the report says *how far behind* rather than only
  *that it differs*.
- **AC-5.2** — Given the plugin `plugin.json` version, Then the drift report includes it, binding
  a consumer's script state to a released plugin version.

## 4. Non-functional requirements

- **NFR-1** — Fully deterministic. Content hashing and file comparison; no LLM in the check path.
- **NFR-2** — The check completes in under 500 ms so it can run at every session start and at
  every queue invocation without being felt.
- **NFR-3** — The check and sync **never** touch a script with no plugin counterpart (AC-1.5).
- **NFR-4** — The sync operation never runs implicitly. Detection is automatic; modification is
  always an explicit operator action.
- **NFR-5** — The SessionStart hook is POSIX-shell compatible, matching the existing hook scripts
  in `pdlc/hooks/scripts/`.

## 5. Scope

**In scope:** drift detection with the five states, SessionStart warning hook, `/pdlc:sync-workflows`
with `--check`/`--force`, queue integration, version stamping, tests.

**Out of scope:** a full `pdlc install` package manager; distributing `SKILL.md` files (they
already load live); auto-syncing without operator action; syncing repo-local workflows.

## 6. Dependencies

- **BL-01** — The installed plugin's `pdlc/workflows/` path is resolvable from a consumer repo at
  runtime. If it is not, that resolution is part of this work and is the first thing to prove.
- **BL-02** — Existing hook wiring in `pdlc/hooks/hooks.json` is extensible with a second
  `SessionStart` entry alongside `nudge-consolidation.sh`.

## 7. Deferrals

| ID | Deferred | Rationale | Binds to |
|---|---|---|---|
| D-DIST-01 | Full `pdlc install` mechanism | Drift detection plus an explicit sync closes the loop; a package manager is a larger, separate design | — |
| D-DIST-02 | Loading workflows directly from the plugin path (no copy at all) | Would remove the problem entirely, but depends on runtime behavior not under this repo's control | — |
| D-DIST-03 | Auto-sync on detection | Violates NFR-4; revisit only if drift proves chronic in practice | — |
| D-DIST-04 | Multi-consumer fan-out (sync all known consuming repos at once) | One consumer today | `pdlc-engineering-loop` |
