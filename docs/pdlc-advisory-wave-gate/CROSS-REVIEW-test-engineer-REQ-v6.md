# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md (v1.8)
**Date:** 2026-08-18
**Iteration:** 6
**Scope:** Delta confirmation of erratum round 4 (commits `a0f383f2`..`2e262298`). Not a full re-review; changed sections plus the upstream text the changed sections lean on.

## Routed items — landed?

| Item | Landed | Evidence |
|---|---|---|
| AC-1.5 population excludes the no-manifest legacy run (SE F-22 / TE F-01) | Yes | REQ:275-280 — population is now "reaches Phase I and **evaluates wave mode** — executing waves or taking the no-manifest legacy path alike". Verified against HEAD: `waveMode` is computed at `orchestrate-dev.js:14039`, BL-03's carrier emits in the `!waveMode` branch at `:14042-14045`, so the criterion's own stated carrier is now inside its population. Earlier halts and ledger skips still excluded. |
| `seamBudgetMinutes` granularity is per attempt, not per invocation (SE F-23) | Yes | NFR-4 (REQ:488-494), §5 C-2 table (REQ:224), AC-2.4 (REQ:322-325) all say per attempt with the deadline restarting each attempt and the invocation worst case named as `attemptBudget` × the value. Matches HEAD: the deadline is constructed inside the attempt loop (`orchestrate-dev.js:3416`, loop at `:3393`), and `elapsedMs: 0` per call is documented at `:3383-3385`. No per-episode cap invented. |
| AC-4.1 conjuncts distinguish *applies* from *resolves* (SE F-24 / TE F-02) | Yes | REQ:381-393 — "applies a repair" defined against "resolves" (green re-gate, AC-4.6/AC-5.3), three conjuncts "each on a run of its own, so three fixtures", (iii) named unreachable on an ordinary run with a control-flow mutation fixture. The fixture count is now unambiguous; my v5 F-02 is resolved. |
| R-3 says *run* where it meant run (SE F-25) | Yes | REQ:511-517 — "one resolved wave per run", "a per-run knob bounds drift within a single run only". Consistent with §5's `waveBudgetPerRun` gloss (REQ:226) and with AC-2.4's "distinct waves in this run". |

Terminology across §5, AC-2.4, NFR-4 and R-3 is now one vocabulary (*run* / *A6 invocation* / *attempt*); I re-grepped the document for `invocation`, `seamBudgetMinutes` and `attemptBudget` and found no surviving site on the old granularity. The v1.8 changelog names what was decided and claims nothing else changed; the diff bears that out.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | AC-4.1 conjunct (ii) now reads "applies, re-gate red ⇒ the wave halts", but under AC-2.4 an attempt is one repair→re-gate cycle and A6 escalates *rather than retrying* only once `advisory.attemptBudget` is exceeded — with the shipped default of 3, a red re-gate on attempt 1 is followed by another attempt, not a halt. AC-4.4 agrees ("a red re-gate consumes one attempt"). Sharpening "resolves" to "applies" made this collision visible: the conjunct is only unconditionally true on the budget-exhausting attempt. A test writer building fixture (ii) must first ask whether to pin `attemptBudget: 1` or to assert a halt after any red re-gate, and the two readings produce different tests. Suggested repair: state (ii) as "applies, re-gate red, and no attempt remains ⇒ the wave halts…", or add one clause saying the intermediate red re-gates re-enter the attempt loop per AC-2.4. | §6 AC-4.1 (REQ:390-391), AC-2.4 (REQ:320-329), AC-4.4 (REQ:414) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | For AC-4.1 fixture (ii), is the intended fixture a budget-of-one run, or a red re-gate on the final permitted attempt of the default budget? Either is testable; the criterion should name one. |

## Positive Observations

- The AC-1.5 rewrite is the rare fix that both widens the population and keeps the carrier story honest: mutual exclusivity is retained, and the both-absent run is explicitly assigned to BL-03's carrier. I checked HEAD and the assignment is right — BL-04's degraded-gate notice (`orchestrate-dev.js:14144-14154`) lives in the wave-mode `else` branch and is unreachable on the legacy path, so a count of exactly one is what a fixture will actually observe.
- NFR-4 now states the worst case (`attemptBudget` × `seamBudgetMinutes`) instead of a bare per-window bound, which gives a timing test something to assert rather than something to assume, and the "gate runs between attempts, never inside one" structural argument still holds at HEAD (the gate is reached through `verifyGate` after the dispatch race, not within it).
- AC-4.1's (iii) admitting up front that it is unreachable on an ordinary run, and naming a mutation fixture, is exactly the honesty a reviewer wants: the alternative was a conjunct that silently passes for the wrong reason.

## Recommendation

**Approved with minor changes** — the four routed items all landed, nothing previously approved was broken, and no High finding is open. F-01 is a one-clause precision fix on AC-4.1 (ii) that can be folded into the next revision of this document or absorbed downstream when TSPEC pins the fixture.

FINDING: Medium | delta | local | §6 AC-4.1 conjunct (ii) | "applies, re-gate red ⇒ the wave halts" contradicts AC-2.4/AC-4.4's attempt loop, which retries while `attemptBudget` remains; fixture (ii) is ambiguous until the criterion names the budget-exhausted case.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 0}
