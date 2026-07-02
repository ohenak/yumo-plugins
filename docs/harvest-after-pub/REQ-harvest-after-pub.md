---
Status: Draft
Author: pm-author
Version: 1.0
Feature: harvest-after-pub
ready: true
depends-on: [harden-harvest-guard]
---

| Field | Value |
|---|---|
| Upstream | **REQ** |
| Downstream | FSPEC, TSPEC, PROPERTIES |
| Cross-Reviews | (pending) |
| LEARNINGS | docs/harvest-after-pub/LEARNINGS-harvest-after-pub.md |

# REQ — harvest-after-pub

Stop destroying review evidence before the feature has shipped. Today Phase H (harvest: write LEARNINGS, **delete** all `CROSS-REVIEW-*`/`CODE_REVIEW-*`) runs *before* Phase PUB (raise PR, verify CI). Consequences: PR reviewers never see the review artifacts; a CI failure halts the pipeline after LEARNINGS already says the feature completed; a re-run finds LEARNINGS present, so the guard permits further deletion and a duplicate harvest. The order must invert: publish first, harvest after CI is green, delete only what has shipped.

---

## Background

Gap review findings (2026-07-01), `pdlc/workflows/orchestrate-dev.js`: Phase H at :1547 precedes Phase PUB at :1587. Phase PUB halt paths (:886 PR creation, :904 CI failure) leave the branch with process artifacts already deleted and a committed LEARNINGS claiming completion. The current rationale — "the PR captures the complete branch including LEARNINGS" — trades away the evidence a PR reviewer actually needs.

Prerequisite: `harden-harvest-guard` changes the deletion guard to require committed-and-pushed LEARNINGS; this feature relies on that stricter guard when relocating the deletion step.

## § Prerequisites

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| BL-01 | harden-harvest-guard merged (REQ-GUARD-01…03 behavior at HEAD) | PR merged into default branch | Guard semantics must be fail-closed before deletion is moved later in the pipeline |

---

## Scope

### In Scope

- Reorder: Phase PUB (raise PR + CI verify) runs before Phase H
- Split harvest: LEARNINGS authoring vs artifact deletion as separately gated steps
- Idempotent re-entry: existing LEARNINGS detected → update, not duplicate
- Documentation updates (SKILL.md pointer doc, CLAUDE.md convention section)

### Out of Scope

- Auto-merge of the PR (stays human)
- Post-merge automation (deleting artifacts after human merge remains triggered by the pipeline's CI-green signal, not by merge webhooks)
- Guard script changes (done upstream in harden-harvest-guard)

### Assumptions

- A PR whose branch later receives the LEARNINGS + deletion commits does not re-trigger full pipeline phases — GHA re-runs checks on the new commits, and the pipeline SHALL re-verify they pass
- harvest-learnings skill can run in "author-only" and "delete-only" modes via prompt parameters without a new skill

---

## User Stories

| ID | Story |
|---|---|
| US-01 | As a PR reviewer, I want the cross-review and DoD review files visible in the PR diff, so that I can audit what the agent reviews found before deciding to merge. |
| US-02 | As a pdlc user, I want LEARNINGS written and artifacts deleted only after CI is green, so that a failed pipeline never leaves "completed" learnings or destroyed evidence behind. |
| US-03 | As a pdlc user, I want a re-run after a PUB halt to converge to exactly one LEARNINGS file and one deletion pass, so that recovery is idempotent. |

---

## Requirements

### Domain: HPUB — Phase Ordering

#### REQ-HPUB-01
**Title:** Publish before harvest

**Description:** The pipeline phase order SHALL become `… → CR → DOD → PUB → H`. Phase PUB raises/reuses the PR and verifies CI on the branch **with all process artifacts still present**. Phase H runs only after PUB reports `ciStatus: passed` or `no-checks`.

**Acceptance criteria:**
- **Who:** PR reviewer / **Given:** pipeline reaches PUB / **When:** PR is raised / **Then:** `CROSS-REVIEW-*` and `CODE_REVIEW-*` files appear in the PR diff.
- **Who:** pdlc user / **Given:** CI fails in PUB / **When:** pipeline halts / **Then:** no LEARNINGS commit exists, no artifact was deleted.

**Priority:** P0 · **Phase:** 1 · **Stories:** US-01, US-02

#### REQ-HPUB-02
**Title:** Two-step harvest with CI re-verification

**Description:** Phase H SHALL (1) author + commit + push `LEARNINGS-{feature}.md`, (2) delete the harvested artifacts + commit + push, then (3) re-verify the PR's checks still pass on the post-harvest head (single re-poll cycle using PUB's existing timing constants). A re-check failure SHALL halt with the PR identified; artifacts are already preserved in git history at the pre-deletion commit, and the halt message SHALL name that commit.

**Acceptance criteria:**
- **Who:** pdlc user / **Given:** PUB passed and harvest commits pushed / **When:** re-poll completes green / **Then:** final report `harvestStatus: "Harvested"`, `ciStatus` reflects the post-harvest head.
- **Who:** pdlc user / **Given:** post-harvest CI fails / **When:** halt / **Then:** message includes pre-deletion commit SHA.

**Priority:** P0 · **Phase:** 1 · **Stories:** US-02

#### REQ-HPUB-03
**Title:** Idempotent harvest re-entry

**Description:** If `LEARNINGS-{feature}.md` already exists on the branch when Phase H starts, the harvest agent SHALL update it in place (appending a dated addendum for new artifacts) rather than duplicating, and SHALL only delete artifacts not yet deleted. A prior partial deletion SHALL NOT block completion.

**Acceptance criteria:**
- **Who:** pdlc user / **Given:** previous run halted between LEARNINGS commit and deletion / **When:** re-run reaches H / **Then:** one LEARNINGS file, remaining artifacts deleted, no duplicate content blocks.

**Priority:** P1 · **Phase:** 1 · **Stories:** US-03

#### REQ-HPUB-04
**Title:** Convention documentation updated

**Description:** The rewritten order SHALL be reflected in `skills/orchestrate-dev/SKILL.md`, `pdlc/README.md`, and the repo `CLAUDE.md` artifact-convention section (which currently states PUB runs after Harvest).

**Acceptance criteria:**
- **Who:** maintainer / **Given:** feature merged / **When:** reading CLAUDE.md §pdlc / **Then:** phase order and rationale match implementation.

**Priority:** P1 · **Phase:** 1 · **Stories:** US-01

---

## Open Questions

None.
