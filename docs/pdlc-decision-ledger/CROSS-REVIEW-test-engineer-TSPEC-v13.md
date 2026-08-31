# Cross-Review: test-engineer — TSPEC (delta re-review, frozen round)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md (v1.2)
**Date:** 2026-08-30
**Iteration:** 13
**Scope:** Local (this artifact), DECISION FREEZE in force

## Overview

Delta re-review under DECISION FREEZE. Base for the delta is `54b17bf84` (TSPEC v1.1), the
bytes my v12 confirmation read; HEAD is `3a17387d6` (TSPEC v1.2). `git diff` on the document over
that range is +70/−10 across exactly three hunks:

1. **Revision-history header** — the v1.2 changelog entry (document lines 14–56).
2. **§4.3 Rendering (pure)** — the framing-budget paragraph gains the "only two of the four framing
   pieces are top-level constants" clarification (PM v12 F-03), lines ~897–915.
3. **§7.3** — *The size of the owned list, stated once* gains the decomposition nouns (my v12 F-01)
   and is split into a second paragraph that reconciles the single-siting claim (PM v12 F-02),
   lines ~1423–1444.

I re-read those three regions in full, re-derived §7.3's arithmetic against the operand rows at
HEAD, re-verified every repository citation the changed text makes, and checked the whole document
for sites that the new "this paragraph is the authority" rule would now contradict. I did not
re-review sections the edit did not touch.

## Architecture

No architectural surface changed in this delta. §4.3's edit is a *normative* statement about the
shipped shape of one already-specified function, not a new component: the header and trailer
sentinel lines ship as inline string literals inside `renderDecisionLedgerBlock`'s body rather than
as top-level bindings. That is internally consistent with the rest of the design rather than in
tension with it — a hoisted sentinel `const` would be a feature-declared top-level name absent from
`DECISION_LEDGER_OWNED_DECLS`, and §7.3's resolves-to-exactly-one / partition conjuncts (document
lines 1447–1448) are precisely what would redden on it. So the paragraph does not merely assert the
shape, it names the guard that enforces it, which is the reviewable form.

The census design is unchanged: declaration-anchored slicing cloned from
`pdlc/workflows/__tests__/loopEconomicsAnchorGuard.test.js` with the widened declaration regex, over
`DECISION_LEDGER_OWNED_DECLS`, minus the sentinel-bounded `main()` wiring run. I re-verified the
precedent still reads `const DECL_RE = /^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(/`
at `pdlc/workflows/__tests__/loopEconomicsAnchorGuard.test.js:61` — function-anchored, so the
widening requirement §7.3 states is still true of HEAD and still load-bearing.

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Findings

## Deferred

## Positive Observations

## Recommendation

## Verdict
