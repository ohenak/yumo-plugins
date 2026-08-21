# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md (v0.7)
**Date:** 2026-08-20
**Iteration:** 10 (delta re-review of v0.6 → v0.7, under DECISION FREEZE)

## Overview

**What this round is.** I approved this PLAN at v0.5 (round 8, findings TE F-01/F-02, both Low) and
again at v0.6 (round 9, delta confirmation, one Medium and one Low, no High). A round-8 revision has
since landed — `7c82eb2a`, `96fe5bf1`, `fe29af1c`, `f73046ad` — taking the document to v0.7. Decision
freeze is in force, so this round asks two questions only: were my prior blocking findings resolved
(there were none open), and did the revision break anything that was standing.

**The delta, measured.** `git diff 6a2d3007..HEAD -- PLAN-…md` is 24 insertions, 10 deletions across
seven hunks: the version cell (0.6 → 0.7), a clause added to LI-02, a clause plus a re-ordering inside
LI-08's amendment note, two clauses added to LI-16, a fixture-precondition paragraph added to LI-12,
the fail-open arm table's zero-bound cell and its following prose, a new ERR-8 row in §Open questions,
a numeric correction inside the 0.5 changelog row, and the 0.7 changelog row. I re-derived this from
the diff rather than trusting the changelog's claim of it: **no task row moved batch, no `Deps` edge
changed, no AT partition, fixture or single-writer manifest row was touched.**

**Upstream, re-read at HEAD.** The four dispatch hashes are byte-identical to what I recorded at round
9 (`shasum -a 256`: REQ `ff605dd3…`, FSPEC `ae75fa62…`, TSPEC `22dee8ce…`, DECISIONS `56617f5a…`), and
their version cells still read REQ v0.9 / FSPEC v0.13 / TSPEC v0.9 / DECISIONS v0.3 — the same four
versions this PLAN pins at `:36`, `:152`, `:275`. Upstream has not moved, so the faithful-compression
verification from rounds 8 and 9 still holds for the unchanged bytes. What needed fresh checking is
the five substantive additions, and I checked each against the upstream text **and** against the
shipped code rather than against the changelog.

**Result.** All five additions check out against upstream, and where they make claims about HEAD, four
of the five check out against the code. One clause — LI-08's "`renderSection` accepts `ordinal`,
`gloss` and a free-form `body`, all three unexercised by any landed suite" — is false for `body` at
HEAD (`pdlc/workflows/__tests__/learningsBlock.test.js:77-82` and
`pdlc/workflows/__tests__/learningsSelect.test.js:375` all pass it). That is a Medium: the sentence's
conclusion ("the amendment adds callers, not knobs") is unaffected and nothing downstream reads the
"unexercised" clause. No High.

**One thing I found that is not this document's defect, and does not touch its verdict.** LI-16's new
sentence is a *faithful* compression of TSPEC §D.5. The **landed implementation** of that rule is not:
`selectLearnings` at `pdlc/workflows/orchestrate-dev.js:2367` gates the `RSN-NO-MATERIAL` drop on
`extraction.sections.length === 0 && hasAnySectionHeadingLine(entry.text)` — a second branch condition
TSPEC explicitly forbids. That is an implementation defect against an already-landed task, out of
scope for a frozen PLAN round. It is written up in §Verification and carried as a `DEFERRED:` line so
the orchestrator can route it, rather than folded into this verdict.

## Batches

## Dependencies

## Verification

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
