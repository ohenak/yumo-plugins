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

This document records the **"didn't do, and why"** for pdlc-learnings-injection. The "do" lives in
`TSPEC-pdlc-learnings-injection.md`; nothing here restates a design that document already carries,
and no behaviour rule (FSPEC `BR-1` … `BR-16`) is re-decided here. Each entry exists because a real
alternative was weighed and rejected, and a future agent reading only the code would otherwise
reconsider it confidently and at cost.

**Grounding pin.** Every code claim below was read on `feat-pdlc-learnings-injection` at HEAD on
2026-08-19, before any production edit for this feature had landed — so every citation describes the
*pre-feature* codebase this design attaches to. Citations name **exported symbols and file paths**
rather than line numbers, per `docs/_decisions/DECISIONS-review-severity-bars.md` `DEC-DOC-01`; a
line number appears only where the position itself is the claim.

**Upstream version note.** TSPEC v0.5 was authored against FSPEC v0.5 / REQ v0.7. Upstream has since
moved: REQ v0.9 and FSPEC v0.7 settled the shipping-default question TSPEC recorded as open
(`OQ.2`, `ERR-4`). This document is grounded on the **current** upstream, so `DEC-LI-07` decides
what TSPEC still carries provisionally; the divergence is raised as a TSPEC erratum rather than
resolved silently.

**How to read an entry.** Each `DEC-LI-NN` carries Context, Decision, Alternatives considered (each
with the reason it was rejected and, where the rejection turns on cost, the *measured* cost),
Constraints that forced the shape, Reversibility, and Re-evaluation triggers. An entry's decision is
binding on PLAN and IMPL; its alternatives are closed unless a re-evaluation trigger fires.

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
