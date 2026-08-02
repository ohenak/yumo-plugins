# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v2.9)
**Date:** 2026-08-01
**Iteration:** 2 (delta re-review of v2.8 → v2.9; baseline `993b34b`, the commit carrying my v1)
**Scope:** resolution of my v1 findings, plus the changed sections only — AC-1.1 through AC-1.5(1), §2, §3.1, §4.1, §6, NB-3/NB-6, O-10, O-13, O-14, R-14, §10, and the material relocated to `pdlc-rcv-split.md` §5.4/§5.6 and `pdlc-rcv-baseline.md` §3.1/§3.2. Unchanged sections I approved in v1 are not re-litigated.

## Prior findings — disposition

| v1 | Severity | Status | Evidence in v2.9 |
|----|----------|--------|------------------|
| F-01 | High | **Resolved** | AC-1.3 now says the render is *"the loop's, not an agent's"* and *"the loop computes and writes it on every halt in scope, creating halt and re-halt alike"*; AC-1.4 clause 3 carries the same rule with *"Not the agent's"* stated explicitly, and O-14 threads the quantities to the loop's post-write step. O-10 leg (i) is now honest: the equality is over production's output on all three fixtures, not a double's canned text. |
| F-02 | Medium | **Resolved** | AC-1.4 clause 3 declares the anchor — *"the first top-level heading whose text begins `Iterations`, case-sensitively, outside any fenced block"* — which matches the shipped shape (`## Iterations (5 — limit reached)`, `orchestrate-dev.js:1938`), so R-13's migration fixture is located. The not-found disposition appends rather than fails, and fixes the position (above `## Reset Region` if that is last) so region parsing is unaffected. |
| F-03 | Medium | **Resolved** | AC-1.1's `Then` is now *"round 3 counted from the window's origin `W`"* with `W = 1` as the no-reset default, and the `W = 4` ⇒ halt-on-7 case stated inline. AC-1.1 and AC-1.5(1) now give one predicate; O-10 leg (4) is consistent with both. |
| F-04 | Medium | **Resolved in kind** — see F-01 below for what the fix opened | AC-1.4 clause 1 now carries a confirmation obligation, correctly shaped (*"a confirmation that this halt's line is present in the region, not that the file exists"* — the distinction that mattered on the re-halt path), a fail-closed disposition, and the terminal-failure argument spelled out. O-10 gains leg (iii). |
| F-05 | Low | **Resolved** | AC-1.2 now requires the enumeration be *"compared against a repo scan by machine, not by a human reading a checklist"*, and O-13(b) and §6's row repeat it. The added generated-artifact exclusion is the right call: those cannot disagree with the declaration. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
