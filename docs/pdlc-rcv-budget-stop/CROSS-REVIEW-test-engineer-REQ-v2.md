# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v1.2, 497 lines / 60,892 bytes)
**Scope:** Testing lens only, **delta re-review**. Verification that each v1 finding is closed, plus a scan of the changed sections for new issues. Sections unchanged since v1 and already approved are not re-litigated. Product strategy, architecture and prose style remain out of scope.
**Reviewed range:** `624054c..fa83925` (15 commits touching the REQ)
**Date:** 2026-08-01
**Iteration:** 2

## Disposition of v1 findings

All eleven are **closed**. Each was checked against the current text, not against the commit message that claimed it.

| v1 | Severity | Status | Where it was answered |
|----|----------|--------|----------------------|
| F-01 | High | **Closed** | AC-1.1 now carries an explicit *"Scope: `docType: null` loops are out"* paragraph: CR and DOD get AC-1.2's constant (per-invocation budget 3) and nothing else — no window, no region, no `W`, no refusal. It states the unsafe reading it is excluding (the permanent CR refusal) and gives the leg a test: *"no `## Reset Region` is created by a CR or DOD halt"*, carried into O-10. AC-1.4's scope paragraph and §7's N-7 row agree with it. |
| F-02 | High | **Closed** | Row C is stated cell by cell in AC-1.5(1) — `round`, four empty cells, `notice` = S-4 `; `-joined in catalogue §3 precedence order — with the exclusivity against row B stated on both sides. Catalogue §3 has been updated to name three dispatch-less rows and keys row C to this AC, so the two documents agree. O-10 carries "row C asserted cell by cell with its S-4 reason and **0** dispatches". |
| F-03 | High | **Closed** | AC-1.5(4) now carries a scoping clause quantified over *every* occurrence of the phrase — clause 2's start, `N`, step 2's range check, rows B and C — fixing it to the doc-type-scoped listing `deriveRoundWindow` already filters, and it keeps the fixture that distinguishes the two readings as the justification. |
| F-04 | Medium | **Closed** (see F-12 for what the fix introduced) | The answering-line append now carries AC-1.4's confirmation obligation explicitly, ordered **before any dispatch of that entry**, with a stated fail-closed disposition and a stated crash consequence; O-12 carries the mechanism. |
| F-05 | Medium | **Closed** | §7 states that baseline §4 defines `N-1 … N-10` only, names the collision, and moves this document's own non-goals into a per-REQ `NB-*` namespace while the restated shared rows keep their shared ids. Verified against `docs/_constraints/pdlc-rcv-baseline.md` §4: exactly `N-1 … N-10`. (The prose/table count is still off by one — F-15.) |
| F-06 | Medium | **Closed** | O-10 now requires a **call-count oracle on the reviewer-dispatch seam** — 0 on the refusing, exhausted and skipped entries, ≥ 1 on the control entry — *alongside* the file-absence check, and gives the reason (a double that writes no file satisfies absence either way). AC-1's Observability was rewritten to *"the reviewer-dispatch seam is called 0 times (a count, not an absence — O-10)"*. This is exactly the conjunct that was missing. |
| F-07 | Medium | **Closed** | AC-1.5(4) step 4 and R-11 both now say the mid-window fixture is **hand-built** until the successor ships, and §3.1 was narrowed to *"fully determined … though one branch is only reachable in production once the successor ships"*. O-10 repeats it at the obligation. |
| F-08 | Medium | **Closed** | AC-1.5(1) states the `forcePhases` outcome (no window, budget halt, row C, queue `halted`, a second force changes nothing) and names the supported sequence; O-10 carries the oracle. |
| F-09 | Low | **Closed** | AC-1.5(1) renders S-4 as `rounds {W}..{windowEnd(W)} of {MAX_REVIEW_ROUNDS}`; AC-1.3 states `iterations` and the Iterations section are asserted **over the constant, never the literal 3**. (One residue in O-10 — F-16.) |
| F-10 | Low | **Closed** | §10 now cites `docs/discarded/pdlc-review-convergence/LEARNINGS-pdlc-review-convergence.md` and states the general rule. Verified: that directory holds exactly the REQ and the LEARNINGS file. |
| F-11 | Low | **Closed** | AC-1.3 fixes `iterations` as the **budget** (matching the shipped site, M-1c) and requires the Iterations section to additionally state the rounds this entry ran, `0` on the zero-round halt, so the two are never conflated. |

Q-01, Q-02 and Q-03 are all answered in the text — write-then-confirm **before** dispatch with the crash consequence spelled out; a distinct refusal render declared in §6; and the disjoint-sets argument for `RESOLVED:` inside the region span.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
