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

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | AC-1.5's new population predicate — "in a run **that reaches Phase I and executes a wave**" (REQ:265-266) — excludes exactly the run class in which the criterion's own named carrier fires. BL-03 is `!waveMode`, and at HEAD `!waveMode` takes the worktree exception path (`pdlc/workflows/orchestrate-dev.js:14039-14044`): that run reaches Phase I and executes **no wave**. The same sentence pair then says the carriers are mutually exclusive and that BL-03's fires "in a both-absent run" (REQ:273-274), i.e. the requirement's F-19 resolution lives entirely in a run the F-18 scoping just removed from the population. As written, a no-manifest run — with or without a script-owned gate — is "outside the population, not a zero-count violation of it" (REQ:267-269), so the notice is required nowhere it can actually be carried. A test author cannot pick a fixture without asking which reading holds: either the predicate must widen (e.g. "a run that reaches Phase I and takes either the wave path or the no-manifest legacy path"), or the mutual-exclusivity clause must name a different carrier for the in-population case. | AC-1.5, REQ:261-277 |
| F-02 | Low | Local | AC-4.1 says the observable is "three positive conjuncts on **one run**" (REQ:369-370), but (i) green re-gate, (ii) red re-gate and (iii) no gate invocation are mutually exclusive outcomes: each is observable on a run, no run carries all three. (iii) is additionally only reachable as a mutation (delete the re-gate call, expect halt), which is the right shape but not something a single ordinary run exhibits. Restate as "each conjunct observable on a run of its own" so the fixture count is unambiguous. | AC-4.1, REQ:369-376 |
