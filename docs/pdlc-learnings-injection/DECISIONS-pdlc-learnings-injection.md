---
feature: pdlc-learnings-injection
ready: false
depends-on: []
---

# DECISIONS — pdlc-learnings-injection

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → **DECISIONS** — `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md` (v0.5); REQ v0.9; FSPEC v0.7; `docs/_constraints/DOMAIN-CONSTRAINTS.md` |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{role}-DECISIONS-v{N}.md` |
| LEARNINGS | `docs/pdlc-learnings-injection/LEARNINGS-pdlc-learnings-injection.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 0.1 | 2026-08-19 |

## Scope, grounding pin, and how to read this document

## Context

## Options Considered

## Decision

## DEC-LI-01: The feature ships inside `orchestrate-dev.js`, not as a new workflow module

## DEC-LI-02: A pure selection core with one twelve-line IO shell, not an IO-carrying selector

## DEC-LI-03: One attachment point (`dispatchAndVerify`), gated on two conjuncts, not four call sites

## DEC-LI-04: Corpus enumeration goes through `_git` with a restated pathspec, not `_listFiles` and not an import

## DEC-LI-05: The block is an appended suffix that is `""` when empty, not an insertion

## DEC-LI-06: No feature-owned cache or run-scoped memo

## DEC-LI-07: An absent configuration section is an enabled run, and no configuration mistake disables the feature

## DEC-LI-08: The injection is bounded by static caps only; there is no dynamic prompt budget

## DEC-LI-09: The pre-feature baseline is a committed fixture pinned to a recorded sha, not a recomputed merge-base

## DEC-LI-10: Reason and notice ids are frozen literals, hand-transcribed in tests

## Decisions deliberately NOT taken here

## Consequences
