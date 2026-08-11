---
feature: pdlc-headless-engine
---

# DECISIONS — pdlc-headless-engine

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → **DECISIONS** (`docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md` v0.9; `FSPEC-pdlc-headless-engine.md` v1.3; `TSPEC-pdlc-headless-engine.md` v1.5) |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-DECISIONS-v{N}.md` |
| LEARNINGS | `docs/pdlc-headless-engine/LEARNINGS-pdlc-headless-engine.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-11 |

## 0. Scope of this document

TSPEC v1.5 fixes the mechanism. This document records only the **load-bearing choices inside that
mechanism** — the ones where an alternative was live, where the rejection has a cost, and where a
later reader would otherwise re-open the question from scratch. Each entry states what was decided,
what was rejected and why, what constraint forced the shape, how reversible it is, and what would
make it worth revisiting.

Two classes of thing are deliberately **not** here: TSPEC's open questions (O-ENG-T1…T5, §9.2 there)
are undecided by construction and stay undecided; and design detail with no rejected alternative is
mechanism, not decision, and lives in TSPEC alone.

Project-level decisions under `docs/_decisions/` are treated as settled input, not re-litigated.
DEC-ENG-08 below applies `DEC-ORACLE-01` rather than re-deriving it.

Every code claim below was verified against the working tree at authoring time; `file:line`
citations are to that state.

## 1. Transport

## 2. Guard parity

## 3. Skills and prompts

## 4. Engine-side provenance

## 5. Test mechanics

## 6. Configuration and lifecycle

## 7. Decision index
