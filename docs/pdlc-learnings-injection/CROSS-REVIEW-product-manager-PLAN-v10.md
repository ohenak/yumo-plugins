# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md (v0.7)
**Date:** 2026-08-20
**Iteration:** 10 (delta re-review, DECISION FREEZE in force)

## Overview

**Question asked:** v0.6 → v0.7 answers the five findings I left open at v9 (three Medium, two Low)
plus two TE findings. Are my blocking-eligible findings resolved, and did the revision break
anything I had already approved?

**Answer:** all five of my prior findings are resolved in substance, verified against the repository
at HEAD rather than against the changelog's account of itself. Nothing I approved at v9 moved: no
task changed batch, no `Deps` edge changed, no AT partition, fixture or file-ownership row was
touched — I diffed all four tables and they are byte-identical. **No High finding. Approved with
minor changes.**

**Delta shape.** `git diff 6a2d3007..HEAD` on the PLAN: 24 insertions, 10 deletions across four
authoring commits (`7c82eb2a` §Batches, `96fe5bf1` §Traceability, `fe29af1c` §Open questions,
`f73046ad` §Changelog) — exactly the four sections the round routed to, and no fifth.

**Prior-finding disposition, each checked at HEAD:**

| v9 finding | Sev | Resolution at v0.7 | Verified against |
|---|---|---|---|
| F-04 zero-bound **production** half had no owner task | Medium | **Resolved.** LI-16's row now names it explicitly: `maxBytes <= 0` tested before the cut returning `{material: "", bounded: false, bytes: 0, sections: []}`, plus `selectLearnings`'s no-slot `RSN-NO-MATERIAL` drop. The exclusion argument is stated and true — LI-12's production column is `—` (PLAN:152) and LI-21's enumerated edits are `main()` and `buildFinalReport` (PLAN:172) | `orchestrate-dev.js:2306-2307` (short-circuit) and `:2367-2372` (no-slot drop) both exist and match the described contract |
| F-03 `LI-AT-30` conjunct (iii) vacuous without a corpus precondition | Medium | **Resolved.** LI-12 now states it: the third case's corpus holds more eligible non-self documents than the `maxDocuments` in force, ≥ 6 at the default — and declares it through LI-02's existing spec surface, so no new fixture shape | `REQ:224` gives `learningsInjection.maxDocuments` default `5`; ≥ 6 is the correct bound |
| F-02 errata list omitted ERR-8 | Medium | **Resolved, and better than asked.** "remaining" → "**other** open errata (ERR-1, ERR-2, ERR-5)" (PLAN:564), and ERR-8 gets its own §Open questions entry plus a status row, because it is addressed to *this* author | ERR-8 is open at `TSPEC:1603`; its premise holds at HEAD — `FSPEC:255` item 15 drops structurally, `FSPEC:259` item 16 extracts *after* the count cut |
| F-05 LI-08's amendment note orphaned `LI-AT-12` mid-enumeration | Low | **Resolved.** `LI-AT-12` now closes the AT enumeration and the note follows it | PLAN:147, read in full |
| F-06 0.5 changelog row overcounted stale pins as "four" | Low | **Resolved**, with the reason recorded (the 0.1 row is a historical record and correctly keeps its own pins) | PLAN:604 |

**Upstream is stable.** I re-derived all four upstream digests at HEAD and they are unchanged from
the values I recorded at v9 — REQ `ff605dd3…`, FSPEC `ae75fa62…`, TSPEC `22dee8ce…`, DECISIONS
`56617f5a…`. No cascade entered this round; every difference is the author's answer to review.

## Batches

## Dependencies

## Verification

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
