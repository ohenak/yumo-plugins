---
feature: pdlc-advisory-tier
---

# DECISIONS — pdlc-advisory-tier

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → **DECISIONS** |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{role}-DECISIONS-v{N}.md` |
| LEARNINGS | `docs/pdlc-advisory-tier/LEARNINGS-pdlc-advisory-tier.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-03 |

## Scope, grounding pin, and how to read this document

This document records the **"didn't do, and why"** for pdlc-advisory-tier. The "do" is in
`TSPEC-pdlc-advisory-tier.md` and, later, in code; nothing here restates a design that document
already carries. Each entry exists because a real alternative was weighed and rejected, and a future
agent would otherwise reconsider it confidently and at cost.

**Grounding pin.** Every `file:line` below was read at `feat-pdlc-advisory-tier` HEAD
`22b310e`, where `pdlc/workflows/orchestrate-dev.js` is 8,642 lines,
`pdlc/workflows/orchestrate-queue.js` is 1,587 lines and `pdlc/workflows/build-runtime.mjs` is 383
lines. Verify a citation by **symbol name** (`grep -n`); the line number is a navigation hint against
files that churn. Where an entry claims an alternative is cheaper or more expensive, the claim was
checked against the files that alternative would actually touch, and the check is stated in the
entry — not left as intuition.

**Notation.** `dev` = `pdlc/workflows/orchestrate-dev.js`, `queue` = `pdlc/workflows/orchestrate-queue.js`,
`build` = `pdlc/workflows/build-runtime.mjs`, `bundleTest` =
`pdlc/workflows/__tests__/runtimeBundle.test.js`. FSPEC rule ids (`M-5`, `X-a`, `R-2`, …) and TSPEC
section numbers are used verbatim.

**Project-level decisions this feature inherits and does not re-litigate:** DEC-DIST-01 (the workflow
runtime's limits are binding), DEC-DIST-02 (tested source → built artifact → untracked consumer copy),
DC-01 (a boundary-crossing contract is closed and total), DC-04 (an oracle is a pure function of an
injected root). Several entries below are direct applications of those; none contradicts one.

## DEC-ADV-01: The advisory core lives in `orchestrate-dev.js`, reached from the queue by prelude binding

## DEC-ADV-02: One `runAdvisorySeam` driver behind an injected `SeamOps`, not five per-seam functions

## DEC-ADV-03: The irreversible act lives in `verifyGate`, so RECORD precedes it

## DEC-ADV-04: The advisory rung is a literal alias with a separate fallback constant, and the fallback is a shipped path

## DEC-ADV-05: Rung resolution is lazy and its memo is a threaded parameter, never module state

## DEC-ADV-06: X-e reuses Phase MERGE's shipped guard matcher; only two new predicates are owned

## DEC-ADV-07: The post-A5 DoD divergence is reported, not re-verified and not halted (OQ-3)

## DEC-ADV-08: A disabled run suppresses the degraded-key notice at the emit, not in the parser

## DEC-ADV-09: The escalation log has no reader inside this tier

## DEC-ADV-10: D-6's expected set is a hand-reviewed fixture captured at `26c3f1c`, not a re-derived value

## Decisions deliberately NOT taken here
