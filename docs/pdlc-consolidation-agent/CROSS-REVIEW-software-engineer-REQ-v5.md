# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-05
**Iteration:** 5
**Scope:** Local (delta re-review — v4 findings + changed sections only)
**Baseline diffed:** `3415420..HEAD` (5 revision commits, +105/−101; 697 lines)

## Prior-Finding Disposition

All three v4 findings, checked against the revision.

| v4 | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | Medium | **Partially resolved** — the closure is scoped as asked, and a suppression key is supplied, but the key does not fire in the general case | AC-3.8b now scopes the abandonment closure "**for the consuming-repo writes this AC enumerates, and for those only**" (`:346-349`) and states the AC-3.1 PR route separately (`:351-358`). NFR-4 keys suppression on a trailer-carrying PR in state "**open or merged**" (`:543`), the AC-3.5 row matches (`:299`), and closed-unmerged is excluded with a reason (an operator rejection is not a duplicate). That is exactly the shape I asked for and the excluded case is the right one. What is not closed: the suppression key is the `PDLC-CONSOLIDATION-SOURCES` trailer, defined as `{sorted consumed basenames}` (`:268`) — an **exact set**. After the abandonment the REQ describes, the later pass's consumed set is the lost set *plus* whatever accumulated meanwhile, so the trailers differ and the merged PR is not a key at all. See v5 F-01. |
| F-02 | Low | **Resolved** | REQ-CONS-01 now states the freeze in two clauses (`:115-121`): (a) every marker-taking pass appends the `<!-- pdlc:consumed {passId} --> … <!-- /pdlc:consumed -->` pair before any other record **even when its consumed set is empty**, the empty pair satisfying NFR-5's "exactly the consumed set"; (b) the AC-1.3 marker is the one exempt record, with the reason stated (passId + ISO-8601, never a basename, never committed, removed by the pass that wrote it). NFR-5 carries the reciprocal clause (`:552-555`). Both halves of the finding are answered, and the universal is now true as written. |
| F-03 | Low | **Resolved, and over-delivered** | AC-5.2 no longer claims a fixed partition: "The split is **per file, not a fixed partition of the catalogue**, and row 3 takes precedence over every other statement here" (`:435-443`), with decidable = what that file's `Harvested from` decides and undecidable = the catalogue minus that. Union-set-equality per file is retained (which is what makes the rule total) and the disjointness claim is dropped explicitly ("Nothing here is a disjointness claim"). It goes further than I asked by showing `POSTMORTEM-CR-*` is *producible* — the shared review loop builds the name (`orchestrate-dev.js:5429`) and Phase CR runs that loop — instead of leaving it at the halt path. The instruction to a downstream test author ("a set-equality test transcribed from this paragraph must be written per file") is the right thing to have added. |

Three of three answered; one is answered only under a condition the REQ does not state. The three
findings below are **new** and all arise in text this revision added.

## Findings

## Existing-Code Claim Verification (changed sections)

## Questions

## Positive Observations

## Recommendation

## Verdict
