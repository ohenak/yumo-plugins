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

## Questions

| ID | Question |
|----|---------|
| Q-01 | For F-01: is the intended population "reaches Phase I" (both wave path and no-manifest legacy path in, only pre-Phase-I halts and ledger skips out), or genuinely "executes a wave" (in which case the no-manifest run is unrequired and F-19's BL-03 carrier statement should be deleted rather than kept)? |

## Positive Observations

- NFR-4's rewrite is the right fix and is now falsifiable: "the gate runs between invocations, never inside one" is a structural claim a test can pin against the shipped per-attempt sequence, and it no longer asserts a subtraction HEAD does not perform. The §5 config-table row (REQ:214) now says the same thing in the same words as AC-2.4 and NFR-4, so the three sites can be diffed mechanically.
- AC-4.1's replacement of an unbounded existential negative with named conjuncts turns an unprovable prohibition into three writable tests, and conjunct (iii) correctly carries the prohibition as a mutation oracle rather than an absence assertion.
- The v1.7 changelog names each decided item and closes with "Nothing else changed", which the diff bears out — 36 insertions confined to the four routed sites plus BL-06.

## Recommendation

**Needs revision** — F-01 is a High finding: AC-1.5's population predicate and its carrier clause contradict each other, and the criterion as written binds in no run. F-02 is a Low and can ride along.
