---
Status: Draft
Author: pm-author
Version: 1.0
Feature: pipeline-entry-guards
ready: true
depends-on: []
---

| Field | Value |
|---|---|
| Upstream | **REQ** |
| Downstream | FSPEC, TSPEC, PROPERTIES |
| Cross-Reviews | (pending) |
| LEARNINGS | docs/pipeline-entry-guards/LEARNINGS-pipeline-entry-guards.md |

# REQ — pipeline-entry-guards

Make `orchestrate-dev` safe to start and cheap to restart. Today the pipeline never verifies it is on `feat-{feature}` — every agent prompt ends "Commit and push", so a run started on `main` pushes 40 agents' worth of commits to `main`. There is no checkpoint: a halt at Phase DOD throws away every approved phase, and a re-run re-reviews already-approved documents from Phase R. The final report also overwrites `testSummary` with the halt reason, corrupting run telemetry.

---

## Background

Gap review findings (2026-07-01), `pdlc/workflows/orchestrate-dev.js`:

- Branch precondition is prose only (`skills/orchestrate-dev/SKILL.md:26`); `main()` never checks the current branch (:1119-1204).
- No persisted progress; `reviewLoop` accepts an `iteration` parameter (:359) that nothing ever sets ≠ 1.
- `testSummary` clobbered by `haltReason` at :1605.
- The script assumes runtime primitives (`agent()`, `parallel()`, …) — stubs at :1080 throw outside the runtime; there is no pre-flight verification that the binding exists, and the consumer copy `.claude/workflows/orchestrate-dev.js` has no version check against the plugin source.

---

## Scope

### In Scope

- Entry guard: branch verification/creation before Phase R
- Checkpoint file + resume logic across all phases
- Report fidelity fix (`testSummary` vs `haltReason`)
- Pre-flight runtime/consumer-copy version stamp check

### Out of Scope

- Phase reordering (harvest-after-pub feature)
- DoD/PUB loop internals (dod-loop-hardening feature)
- A full `pdlc install` distribution mechanism — only the version-stamp mismatch warning

### Assumptions

- A guard agent can run read-only git commands and report state (the existing `guard` channel)
- Checkpoint lives on the feature branch itself and is removed at pipeline success

---

## User Stories

| ID | Story |
|---|---|
| US-01 | As a pdlc user, I want the pipeline to refuse to run on the wrong branch and to create `feat-{feature}` when missing, so that agent commits can never land on the default branch. |
| US-02 | As a pdlc user, I want a halted pipeline to resume from the first unfinished phase, so that a late-phase failure does not cost the whole run. |
| US-03 | As a pdlc user, I want the final report's test summary to be the test summary, so that telemetry is trustworthy. |
| US-04 | As a pdlc maintainer, I want the run to fail fast with a clear message when the workflow runtime or consumer copy is missing/stale, so that a silent no-op or drifted copy is impossible. |

---

## Requirements

### Domain: ENTRY — Branch Guard

#### REQ-ENTRY-01
**Title:** Branch verification and creation at entry

**Description:** Before Phase R, the pipeline SHALL verify the current branch is `feat-{feature}`. If the branch does not exist, it SHALL be created from the remote default branch and checked out. If a different branch is checked out (including the default branch), the pipeline SHALL check out `feat-{feature}` — and SHALL halt if the working tree is dirty rather than carrying uncommitted changes across branches.

**Acceptance criteria:**
- **Who:** pdlc user / **Given:** repo on `main`, `feat-f` absent, clean tree / **When:** pipeline starts for feature `f` / **Then:** `feat-f` created from `origin/<default>`, checked out, Phase R proceeds.
- **Who:** pdlc user / **Given:** repo on `main` with uncommitted changes / **When:** pipeline starts / **Then:** halt with "dirty working tree" before any agent dispatch.
- **Who:** pdlc user / **Given:** repo already on `feat-f` / **When:** pipeline starts / **Then:** no branch action, Phase R proceeds.

**Priority:** P0 · **Phase:** 1 · **Stories:** US-01

### Domain: ENTRY — Checkpoint & Resume

#### REQ-ENTRY-02
**Title:** Phase checkpoint file

**Description:** The pipeline SHALL persist progress to `docs/{feature}/.pipeline-state.json` after each phase completes: `{schema: 1, feature, completedPhases: [{phase, iterations, completedAt}], artifacts: [...]}`. The file SHALL be committed with the phase's artifacts and deleted (committed) on pipeline success.

**Acceptance criteria:**
- **Who:** pipeline / **Given:** Phase T just converged / **When:** checkpoint written / **Then:** file lists R, F, T with iteration counts and is committed on `feat-{feature}`.

**Priority:** P0 · **Phase:** 1 · **Stories:** US-02

#### REQ-ENTRY-03
**Title:** Resume from checkpoint

**Description:** On invocation, if `.pipeline-state.json` exists and matches the feature, the pipeline SHALL skip phases recorded complete and resume at the first unfinished phase, logging the skip list. A `schema` mismatch or unparseable file SHALL fall back to a fresh run after renaming the stale file to `.pipeline-state.json.bak` (never silently reusing corrupt state).

**Acceptance criteria:**
- **Who:** pdlc user / **Given:** prior run halted at DOD with R…CR complete / **When:** re-invoked / **Then:** log "Resuming at Phase DOD (skipping R,F,T,D,P,PR,I,PT,CR)", no reviewer re-dispatch for approved docs.
- **Who:** pdlc user / **Given:** corrupt state file / **When:** invoked / **Then:** fresh run, file preserved as `.bak`, warning logged.

**Priority:** P0 · **Phase:** 1 · **Stories:** US-02

### Domain: ENTRY — Report Fidelity

#### REQ-ENTRY-04
**Title:** Halt reason must not overwrite test summary

**Description:** The final report SHALL carry `haltReason` and `testSummary` independently. `testSummary` SHALL only ever contain test-run outcomes (`"Not run"` or actual results), never the halt message.

**Acceptance criteria:**
- **Who:** pdlc user / **Given:** halt during Phase F (before any tests) / **When:** report built / **Then:** `testSummary: "Not run"`, `haltReason: <phase F message>`.

**Priority:** P1 · **Phase:** 1 · **Stories:** US-03

### Domain: ENTRY — Runtime Pre-flight

#### REQ-ENTRY-05
**Title:** Runtime binding and copy-version pre-flight

**Description:** The plugin source SHALL carry a version stamp (`meta.version` synced to plugin.json). At entry the workflow SHALL (a) verify the runtime provides the agent-dispatch primitive before any phase (fail with an actionable message if absent), and (b) if the executing copy's stamp differs from the plugin source on disk (when resolvable), log a drift warning naming both versions.

**Acceptance criteria:**
- **Who:** pdlc user / **Given:** runtime primitives unavailable / **When:** invoked / **Then:** immediate halt: "workflow runtime not available — run inside Claude Code dynamic workflow runtime", no partial phase execution.
- **Who:** pdlc maintainer / **Given:** consumer copy version 0.7.0, plugin source 0.8.0 / **When:** invoked / **Then:** warning names both versions and the copy path.

**Priority:** P1 · **Phase:** 1 · **Stories:** US-04

---

## Open Questions

None.
