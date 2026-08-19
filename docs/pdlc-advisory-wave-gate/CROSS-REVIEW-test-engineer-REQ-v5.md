# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md (v1.7)
**Date:** 2026-08-18
**Iteration:** 5
**Scope:** Delta confirmation of erratum round 3 (commit `119bdaf4`). Routed items: AC-1.5 notice-cardinality population, AC-1.5 carrier mutual exclusivity, AC-4.1 positive conjuncts, NFR-4 / §5 config-table budget window.

## Routed Items — Landing Check

| Item | Landed | Note |
|---|---|---|
| AC-1.5 cardinality scoped to a run population (F-18) | Partially | Scoping text present, but the chosen predicate excludes BL-03's own carrier — see F-01 |
| AC-1.5 carriers mutually exclusive, BL-03's alone serves both-absent run (F-19) | Yes, then undercut | Text is correct at REQ:271-276; F-01's population predicate makes it unreachable |
| BL-06 widened to measure exclusivity | Yes | REQ:562 |
| AC-4.1 unbounded negative → three positive conjuncts | Yes | REQ:369-376; one phrasing note, F-02 |
| NFR-4 carve-out + `attemptBudget`-starvation rationale deleted | Yes | REQ:471-475; exclusion now stated as structural, no subtraction |
| §5 config table restated to the AC-2.4 window | Yes | REQ:214 now reads "measured dispatch to verdict, not cumulative across the wave"; the false "excluding gate-command run time" gloss is gone |
