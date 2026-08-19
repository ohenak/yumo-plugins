# Cross-Review: software-engineer — REQ (delta confirmation, erratum round 4)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md
**Date:** 2026-08-18
**Iteration:** 6
**Scope:** Delta confirmation of erratum round 4 (commits `119bdaf4..HEAD` on the REQ). Not a
whole-document re-review: the question answered here is whether the routed items landed and whether
the document is still a faithful compression of its measured upstream (`pdlc/workflows/orchestrate-dev.js`
at HEAD, `docs/_constraints/pdlc-advisory-corpus-baseline.md`).

## Item Disposition

| # | Routed item | Landed | Evidence |
|---|-------------|--------|----------|
| 1 | AC-1.5 population excludes the no-manifest legacy run where BL-03's carrier fires (High, se-review) | Yes | REQ:275-282 — population is now "reaches Phase I and **evaluates wave mode** — executing waves or taking the no-manifest legacy path alike"; the both-absent run is back inside it. Verified against HEAD: BL-03's carrier is the `if (!waveMode)` emit at `orchestrate-dev.js:14041-14044`, reached after `waveMode` is computed at `:14039`, i.e. inside the new predicate and outside the old one. F-19's exclusivity clause (REQ:284-287) now binds a real run: "at most one is reachable, BL-03's in a both-absent run". |
| 2 | Budget window stated per A6 invocation where HEAD builds the deadline per attempt (High, se-review) | Yes | REQ:322-325 (AC-2.4), REQ:224 (§5), REQ:488-491 (NFR-4) all now say **per attempt**, deadline restarting each attempt, worst case `attemptBudget` × the value. Matches HEAD: `totalBudgetMs` at `orchestrate-dev.js:3370`, the deadline constructed fresh inside the loop at `:3416` (loop at `:3393`), and the `elapsedMs: 0` design deliberately documented at `:3383-3385`. No per-episode cap invented, which is correct — HEAD imposes none. |
| 3 | AC-4.1 conjuncts (ii)/(iii) not simultaneously observable; "resolves" overloaded (High, se-review) | Yes | REQ:380-393 holds *applies a repair* and *resolves* apart, reserves *resolves* for the green re-gate outcome (consistent with AC-4.6 REQ:430 and AC-5.3 REQ:449, which both use it that way), and restates the observable as three conjuncts "each on a run of its own, so three fixtures". |
| 4 | R-3 said invocation where it meant run (High, se-review) | Yes | REQ:512-516 — "one resolved wave per run", "drift within a single run only, and drift across runs". Consistent with the key's own name, `advisory.waveBudgetPerRun`, and with §5's row (REQ:226). |
| 5 | AC-1.5 population / cardinality binds in no run (High, te-review) | Yes | Same edit as item 1; the fixture the te-review could not choose is now the both-absent no-manifest run, named explicitly in the text. |
| 6 | AC-4.1 fixture count ambiguous (Low, te-review) | Yes | Same edit as item 3; "each on a run of its own, so three fixtures", with (iii) named a mutation fixture. |

No routed item is unlanded, and no landed edit contradicts previously approved text: §5, AC-2.4 and
NFR-4 now agree on one granularity, and the AC-4.1 vocabulary matches AC-4.6/AC-5.3 rather than
displacing them.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-26 | Medium | Local | NFR-4's structural rationale now says "the gate runs between attempts, never inside one" (REQ:492). Under the attempt-granular vocabulary this round just adopted, that is false at HEAD: `verifyGate` is invoked at `orchestrate-dev.js:3535-3537`, inside the same `while (true)` iteration that opened at `:3393`, and A5-3 defines one attempt as one act → re-poll cycle (`:3388-3391`, `:3543-3550`) — so the gate runs *inside* an attempt. What is true, and what the carve-out-free conclusion actually rests on, is that the gate runs outside the **measured window**: the `Promise.race` at `:3417` closes at verdict (`:3416`), and the gate is reached only after that. The requirement itself (window = dispatch to verdict on one attempt) and the conclusion (no subtraction, no carve-out) both stand; only the sentence naming *what* the gate is outside of is wrong. Suggested repair, one clause: "the gate runs after the verdict that closes the window, never inside it". | §7 NFR-4 (REQ:488-494) |

FINDING: Medium | delta | local | §7 NFR-4 (REQ:492) | Rationale says the gate "runs between attempts, never inside one"; at HEAD `verifyGate` (orchestrate-dev.js:3535) is inside the attempt loop (`:3393`) and A5-3 counts the re-poll as part of the attempt. The gate is outside the *measured window* (the race at `:3417` ends at verdict), not outside the attempt. Requirement and conclusion unaffected; one clause to repair.

## Questions

| ID | Question |
|----|----------|
| Q-06 | AC-4.1(iii)'s fixture is now declared to mutate shipped control flow to drop the re-gate. Is that mutation expected to be a TSPEC-level seam (an injected gate op the fixture omits) rather than a source edit? The REQ correctly does not answer this — recording it so TSPEC picks it up deliberately rather than by default. |

## Positive Observations

- The AC-1.5 rewrite fixes the population *and* keeps the mutual-exclusivity clause meaningful in the
  same stroke: naming BL-03's carrier as the one that fires in a both-absent run turns F-19's
  exclusivity sentence from an unbound assertion into the criterion's own fixture selector.
- The budget correction resisted the tempting over-correction. Naming `attemptBudget` × the value as
  a *worst case* and explicitly declining to introduce a per-invocation cap keeps the REQ a
  description of shipped behaviour instead of a new requirement smuggled in as a fix.
- Separating "applies a repair" from "resolves" was the load-bearing move for AC-4.1, and it was made
  consistently with AC-2.4's "only resolutions consume the wave budget" and AC-4.6/AC-5.3 rather than
  locally.
- The v1.8 changelog names what was decided in `F-` vocabulary and states "Nothing else changed",
  which the diff bears out — 42 insertions, 23 deletions, all inside the four named sites.

## Recommendation

**Approved with minor changes**

The four routed High items and the two te-review items all landed, and nothing previously approved
was broken by landing them. One Medium remains: NFR-4's rationale clause misnames what the gate is
outside of (F-26). It does not gate the round — no High finding stands, delta or inherited — and can
be repaired in the next ordinary revision of this document.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 0}
