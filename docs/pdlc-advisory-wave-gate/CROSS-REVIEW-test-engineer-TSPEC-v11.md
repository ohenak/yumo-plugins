# Cross-Review: test-engineer — TSPEC (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.10)
**Date:** 2026-08-19
**Iteration:** 11
**Scope:** Delta re-review of v1.10 against my `CROSS-REVIEW-test-engineer-TSPEC-v10.md` (reviewed commit `3c7bf869`), decision-frozen round. Convergence judgement only: were my v10 blocking findings resolved, and did the delta break anything.

## Delta under review

`git diff 3c7bf869..HEAD` on the TSPEC: +78/-11 across six commits (`f7a3c9f4`, `a2c89cb0`, `c4f3aca7`, `db27fbf7`, `176b26e8`, `9c07cfec`, `c61f4294`). Changed regions: version row 1.9 → 1.10, the v1.10 changelog entry, a new "State of the surfaces at HEAD" subsection inside §1.3, the §1.3 row-count and `.enabled` pin re-anchoring, §3.2 step 2's queue-side quotation, §5.1's `advisoryQueueSeams.test.js` row plus a new Status-column caveat, and §6's OQ-1 article fix. No design change.

## Disposition of my v10 findings

| v10 finding | Edit made | Verified at HEAD |
|---|---|---|
| F-01 (High) — §1.3/§5.1 describe an at-HEAD baseline that no longer exists; the A6 test-side transcription already landed in `e3b9d5a3` and the branch is red | §1.3 gains an explicit HEAD-state table separating "landed test-side" from "production residue"; §5.1 gains a Status-column caveat; the `advisoryQueueSeams.test.js` row now transcribes `toHaveLength(6)` and states it is already applied and red; remedy explicitly routed as a PLAN erratum rather than decided here | **Resolved and verified** — every row of the new table checked against HEAD (evidence below) |
| F-02 (Medium, Process) — v9's approval anchor pointed at a commit not reachable from HEAD | No doc edit owed; this is branch hygiene | **No longer live for this round** — v10's reviewed commit `3c7bf869` is an ancestor of HEAD, so this round's delta was mechanically re-derivable |
| F-03 (Low) — "`0` is a **intended operator configuration**" article slip in two places | Fixed at `:1717` ("an **intended operator configuration**"); the §4.4 instance at `:1158` reads "it is the **intended operator configuration**" | **Resolved** |
