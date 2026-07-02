---
Status: Draft
Author: pm-author
Version: 1.0
Feature: skill-prompt-consistency
ready: true
depends-on: []
---

| Field | Value |
|---|---|
| Upstream | **REQ** |
| Downstream | FSPEC, TSPEC, PROPERTIES |
| Cross-Reviews | (pending) |
| LEARNINGS | docs/skill-prompt-consistency/LEARNINGS-skill-prompt-consistency.md |

# REQ — skill-prompt-consistency

Remove the contradictions between pdlc role prompts that guarantee review churn or dead ends. te-review enforces a ≥85% branch-coverage floor that te-author is never told to encode, so every PROPERTIES doc starts a review round it cannot pre-empt. pm-review and te-review are instructed to review a DECISIONS doc that is conditional and may not exist. Several skills cite consuming-repo artifacts (`DC-07/08/09`, `CONSOLIDATION-PROPOSAL-2026-06-22.md`) that don't exist in a fresh repo, sending agents chasing missing files. And reviewer/optimizer dispatch prompts carry no versioning or delta context, so each iteration re-reviews the whole document blind.

---

## Background

Gap review findings (2026-07-01) across `pdlc/skills/*/SKILL.md`:

- Coverage asymmetry: te-review SKILL.md:41,114 vs te-author checklist :151-159.
- DECISIONS reviewed unconditionally: pm-review:72-76, te-review:93-96 vs se-author:92 (conditional creation).
- Hardcoded consuming-repo references: se-author:67, se-review:101, pm-review:94, te-review:114-116.
- se-implement language-routing path list :210-220 manually synced with `language-detect.ts`.
- Generic reviewer/optimizer prompts in orchestrate-dev.js (:470-476) — iteration/version context lives only in role-skill conventions.

---

## Scope

### In Scope

- te-author PROPERTIES checklist gains the coverage-floor property (floor value stays owned by te-review/dod-verify: 85%)
- Conditional-artifact guards ("if DECISIONS absent, record skip and continue") in pm-review, te-review
- Replace hardcoded cross-repo artifact IDs with conditional references ("if docs/_constraints/… exists")
- Reviewer/optimizer dispatch prompts carry: expected cross-review filename (with -v{N}), prior-iteration findings summary reference
- One documented source of truth for the language-routing path list

### Out of Scope

- New skills or new orchestration paths (Python parallel tech-lead dispatch is deferred; documented as a known limitation in tech-lead-python SKILL.md)
- Changing the 85% floor itself
- Trailer formats (agent-trailer-contracts feature)

### Assumptions

- Prompt-only changes; no workflow-script logic changes except the two dispatch-prompt builders

---

## User Stories

| ID | Story |
|---|---|
| US-01 | As te-author, I want the coverage floor in my authoring checklist, so that my PROPERTIES doc satisfies the review gate on iteration 1. |
| US-02 | As a reviewer agent, I want explicit instructions for absent conditional artifacts, so that I don't fail or stall on a doc that legitimately doesn't exist. |
| US-03 | As a pdlc adopter in a fresh repo, I want skills to reference project-level artifacts conditionally, so that agents don't chase files my repo never had. |
| US-04 | As a reviewer agent, I want the dispatch prompt to name the exact cross-review file to write and the prior iteration's findings, so that iteration N reviews the delta instead of rediscovering iteration N-1. |

---

## Requirements

### Domain: SPC — Authoring/Review Symmetry

#### REQ-SPC-01
**Title:** Coverage floor in te-author checklist

**Description:** te-author's PROPERTIES quality checklist SHALL require a coverage property: every new module covered by property-based tests meeting the branch-coverage floor (≥85%, single source: cited from dod-verify's criterion). te-review's enforcement text SHALL cite the same source.

**Acceptance criteria:**
- **Who:** te-author / **Given:** authoring PROPERTIES / **When:** checklist applied / **Then:** doc contains a coverage property; te-review iteration-1 coverage finding class eliminated.

**Priority:** P0 · **Phase:** 1 · **Stories:** US-01

#### REQ-SPC-02
**Title:** Conditional-artifact review guards

**Description:** pm-review and te-review SHALL treat DECISIONS as conditional: if absent on the branch, record "DECISIONS not produced (conditional) — skipped" in the cross-review and proceed without a finding.

**Acceptance criteria:**
- **Who:** pm-review / **Given:** feature with no DECISIONS doc / **When:** reviewing PLAN / **Then:** no missing-file failure; skip note present.

**Priority:** P0 · **Phase:** 1 · **Stories:** US-02

### Domain: SPC — Portability

#### REQ-SPC-03
**Title:** Conditional project-context references

**Description:** All skill-prompt references to specific consuming-repo artifacts (`DC-07/08/09`, `REQ-SKILL-03`, `PM-TSPEC-06`, `CONSOLIDATION-PROPOSAL-*.md`) SHALL be rewritten as conditional pattern references ("read `docs/_constraints/DOMAIN-CONSTRAINTS.md` if present; apply any constraint tagged …"). No skill SHALL name an artifact that this plugin does not ship.

**Acceptance criteria:**
- **Who:** adopter / **Given:** fresh repo, no docs/_constraints / **When:** any pdlc skill runs / **Then:** no attempt to read a nonexistent named file; grep of skills/ finds zero hardcoded consuming-repo IDs.

**Priority:** P1 · **Phase:** 1 · **Stories:** US-03

#### REQ-SPC-04
**Title:** Single source for language routing

**Description:** se-implement's path-prefix routing list SHALL be declared in one place (the SKILL.md table) with an explicit note that it is the source of truth, and the sync obligation to any consuming-repo `language-detect.ts` SHALL be inverted (consumer syncs from plugin) and documented.

**Acceptance criteria:**
- **Who:** maintainer / **Given:** routing change / **When:** editing SKILL.md / **Then:** no second in-plugin copy to update; consumer-sync note present.

**Priority:** P2 · **Phase:** 1 · **Stories:** US-03

### Domain: SPC — Dispatch Context

#### REQ-SPC-05
**Title:** Versioned, delta-aware dispatch prompts

**Description:** `reviewerPrompt` SHALL name the exact cross-review file to write (`CROSS-REVIEW-{role}-{doctype}-v{N}.md` naming per convention) and, for N>1, instruct the reviewer to read its own prior version and focus on verifying fixes plus new issues. `optimizerPrompt` SHALL name the cross-review files (all reviewers, current iteration) the optimizer must address.

**Acceptance criteria:**
- **Who:** reviewer agent / **Given:** iteration 3 of Phase F / **When:** dispatched / **Then:** prompt names the -v3 output file and the -v2 prior review to diff against.
- **Who:** optimizer agent / **Given:** iteration 2 FAIL / **When:** dispatched / **Then:** prompt lists both reviewers' v2 cross-review paths.

**Priority:** P1 · **Phase:** 1 · **Stories:** US-04

---

## Open Questions

None.
