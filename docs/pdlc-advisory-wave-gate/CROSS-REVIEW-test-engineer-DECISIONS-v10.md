# Cross-Review: test-engineer — DECISIONS (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.8, bytes unchanged, `sha256:25f8e954…`)
**Previous review:** `CROSS-REVIEW-test-engineer-DECISIONS-v9.md` (Approved with minor changes, 0 High)
**Upstream delta reviewed:** `docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md`, `9a1934db..HEAD` (`sha256:4a092e85…` → `sha256:1531143c…`)
**Date:** 2026-08-19
**Iteration:** 10

## Context

This is an upstream-cascade confirmation, not a re-review. DECISIONS' own bytes have not moved since
my v9 approval — `sha256:25f8e954…` at HEAD is byte-identical to v9's `APPROVAL-HASH`. What moved is
TSPEC, which my approval was recorded against at `sha256:4a092e85…` and which now stands at
`sha256:1531143c…`. The single question in scope: is DECISIONS still a faithful compression of TSPEC
as TSPEC now reads?

The upstream delta is small and bounded. `git diff 9a1934db..HEAD -- TSPEC` is 19 changed lines in
exactly two hunks:

1. **Changelog, v1.10 entry** — a `**Phase-P erratum (this dispatch):**` sentence appended to the
   existing v1.10 paragraph, summarising the second hunk.
2. **§1.3, after the "revert vs. keep-and-re-derive is PLAN's call" paragraph** — a new paragraph,
   *"Sizing the hygiene residue, and where it is owned"*, which sizes what `e3b9d5a3` left behind at
   `PROP-SWEEP-2(b)`'s measured **28 tracked paths** in three classes (14 `.bak` blobs, four
   consumer-runtime artifacts, this feature's own tracked documents), states that untracking the
   `.bak` class closes **14 of the 28**, and routes the partition, owners and figures to **PLAN's
   Overview HEAD-drift note and A6-00's Edit 1**.

Both hunks are sizing and routing. No section DECISIONS cites for a *design* claim — §2.5, §3.2,
§3.6, §5.1's file-ownership map and status caveat, §5.2's budget-zero fixture, §5.6's restoration
oracle, §6's open questions OQ-2/OQ-5/OQ-6/OQ-7 — has a single changed byte in this interval. The
work of this round was therefore to check the two things a bounded upstream delta can still break:
whether any DECISIONS citation now points at text that reads differently, and whether the delta's
new routing target contradicts what DECISIONS says about the same territory.

## Options Considered

## Findings

## Questions

## Positive Observations

## Decision

## Consequences

## Recommendation

## Verdict
