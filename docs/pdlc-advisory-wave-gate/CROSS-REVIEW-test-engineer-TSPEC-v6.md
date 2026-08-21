# Cross-Review: test-engineer — TSPEC (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.15)
**Date:** 2026-08-20
**Iteration:** 6

## Overview

Delta re-review of v1.14 → v1.15 (`6f00074c..HEAD`, five content commits, +76/−13). Scope is the
changed material only: §1's changelog, §4.5's carrier row (line ~1459), the new **Where the push
happens** row, the "why not the halt message" row, the AT-05-3 survival paragraph, §4.5's un-skip
table's new *Overwrite notice* row, §5.1's superset sentence and three table cells (the
`advisoryWaveGate.test.js` cell, the new `advisoryWaveGateMain.test.js` row, the
`advisoryEscalationLog.test.js` cell), §5.2's capture-failure inventory, and §5.6's AT-06-4 cell.
Sections settled in rounds v1.2–v1.14 are not re-litigated.

**All three v5 findings are resolved**, and each remedy is grounded in code I checked rather than in
the document's own prose. Two v5 questions (Q-01 export shape, Q-02 un-skip arm) are answered inside
the document. What remains is one Medium about a fixture-wiring detail the push-site paragraph
overstates, and one Low numeral. Neither blocks.

**Prior findings (v5).**

| v5 | Severity | State at v1.15 | Evidence |
|---|---|---|---|
| F-01 five-key set-equality collides with shipped four-key set-equalities | High | **Resolved** | §5.1's `advisoryWaveGate.test.js` cell now names the shipped whole-object oracles and marks them *widened by the same task*; §5.1 gains the `advisoryWaveGateMain.test.js` row for the real-seam `haltAdvisory` oracle; §5.2 states the five-key equality **replaces** the four-key one and names the false-green trap. Verified at HEAD: `advisoryWaveGate.test.js:1699` (Oracle G's own literal), `:2676` (escalation path), `:2714` (`Object.keys(result.haltFields).sort()`), `:3425`/`:3462` against `ORACLE_G_HALT_FIELDS` (`:3369`), `advisoryWaveGateMain.test.js:373`. The "`waveExecution.test.js` needs no widening" carve-out is correct: `:1094` compares against the fixture's own `haltFields`, and `:1274` against the fake-supplied `a6HaltFields` (`:1251-1256`) |
| F-02 push site unnamed | Medium | **Resolved (with one imprecision, F-01 below)** | §4.5's new row places the push **inside `runWaveGateSeam`** through `_notice`. Verified: the parameter exists (`orchestrate-dev.js:3382`), the head guard is verbatim `const notice = typeof _notice === "function" ? _notice : () => {}` (`:3385`), the call site passes `_notice: advisoryNotice` (`:15386`), and the sink `const advisoryNotice = (line) => notices.push(line)` (`:14635`) is in the same function scope as both the seam call and the un-skip halt (`:15433`) — no intervening function declaration between `:14600` and `:15450`. The named consequence is exact and exhaustive: `advisoryEscalationLog.test.js:821` is the **only** exact `notices` count that an A6 escalation over a real repo reaches (`:497` is a pure two-element array unit; `waveExecution.test.js:590`, `:749`, `:2648` count *filtered logs*, not the notice array; `waveExecution.test.js:803-817` are `checkWaveUnskips` unit returns) |
| F-03 `TEST_GATE_MESSAGE` is not a symbol | Low | **Resolved** | §4.5 now names the per-wave `testGateMessage` template built at the call site (`orchestrate-dev.js:15359-15361`, thrown at `:15398`), marks the upper-case name as §2.3 shorthand, and restates AT-05-3's oracle as **containment** in the shipped form (`advisoryWaveGateMain.test.js:368`, `waveExecution.test.js:1091`) |

## Architecture

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Findings

## Questions

## Positive Observations

## Recommendation
