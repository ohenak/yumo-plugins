# Cross-Review: software-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.3, unchanged bytes)
**Date:** 2026-08-19
**Iteration:** 5
**Scope:** Upstream-cascade confirmation only. FSPEC bytes unchanged since the v4 approval
(`REVIEWED-COMMIT: 7b8b314c`). Upstream REQ moved: approved against `6565080a`
(`sha256:32ba7d94…`, REQ v1.6), now at `2e262298` (`sha256:a10396e8…`, REQ v1.8), two erratum
rounds. One question answered: does the FSPEC still hold as a faithful compression of the REQ as
it now stands? Reviewed on `feat-pdlc-advisory-wave-gate`.

## Overview

What the upstream edit changed, read at HEAD rather than from the item list:

| REQ clause | v1.6 (approved against) | v1.8 (HEAD) |
|---|---|---|
| AC-1.5 | population unscoped — "exactly one notice per run" | population is runs that **reach Phase I and evaluate wave mode**, the no-manifest legacy run explicitly inside it; earlier halts and ledger skips outside |
| AC-2.4 | seam budget per **invocation**, "per invocation, dispatch to verdict" | seam budget per **attempt**, deadline restarting each attempt |
| NFR-4 | budget on an *invocation*, with a gate-command **carve-out** and an `attemptBudget`-starvation rationale | budget on an **attempt**; carve-out deleted — exclusion is structural, "no subtraction is performed and no carve-out is needed"; worst case named as `attemptBudget` × the value |
| AC-4.1 | one unbounded negative — "no path by which an advisory verdict substitutes for a gate result" | **applies a repair** and **resolves** held apart; observable is three positive conjuncts, **each on a run of its own, so three fixtures**, (iii) a mutation fixture that drops the re-gate |
| §5 config table | `seamBudgetMinutes` = "working time per wave invocation" | per **attempt**; and `attemptBudget` per **A6 invocation**, "one invocation being A6 engaged on one red wave" |
| R-3 | bound reaches "within an invocation", drift "across invocations" | within a single **run**; drift across **runs** |
| BL-06 | two enumerations | additionally the **mutual exclusivity** of BL-03's notice with BL-04's |

Two of these — NFR-4's false carve-out rationale and §5's wave-scoped `seamBudgetMinutes` gloss —
are the errata this reviewer re-emitted in v2, v3 and v4. They are resolved at HEAD, and resolved
at the root rather than papered over. The cost is that the FSPEC's compression of them was written
to be *correct against a wrong upstream*: BR-11 carried the right window while attributing it to a
REQ clause that said something else, and inherited a carve-out that no longer exists. Now that REQ
has moved to the FSPEC's position, the FSPEC's text describing the disagreement is itself stale.

The behavioural substance of the FSPEC survives the edit — no flow, rule or edge case is
contradicted at the level of what the system does. What does not survive is (a) the AC-4.1 oracle,
which upstream rewrote into a shape the FSPEC does not carry, and (b) the run / A6 invocation /
attempt vocabulary, which the erratum round deliberately separated (F-25) and which the FSPEC
still fuses under one word, with an explicit citation to the upstream clause that now says the
opposite.

## Findings

_pending_

## Confirmation Findings (tagged)

_pending_

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Verdict

_pending_
