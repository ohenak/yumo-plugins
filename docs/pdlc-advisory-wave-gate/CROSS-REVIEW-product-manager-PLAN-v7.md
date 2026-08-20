# Cross-Review: product-manager — PLAN (delta re-review, round 7)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md` (v1.6)
**Date:** 2026-08-19
**Iteration:** 7
**Scope:** Delta re-review over `d912eea9..HEAD` (v1.4 → v1.6, commits `12c060ae`, `d0b7d308`). Round-6 findings F-01…F-07 checked for closure; changed sections scanned for new defects; every repository claim in the changed text re-measured at HEAD rather than read.

## Round-6 findings — disposition

| Round-6 finding | Landed? | Evidence |
|---|---|---|
| F-01 High — A6-04's rationale asserted a claim TSPEC withdrew | **Yes** | The A6-04 row now rests the both-keys assertion on TSPEC v1.10's surviving justification ("the example carries the **shipped-default pairing** … `enabled` travels in the same shipped unit as the budget … an expectation naming only `waveBudgetPerRun` would stay green if a later edit dropped `enabled`") and states outright that it is **not** asserted because the example teaches E-33's `0`-with-`enabled: true` affordance. The withdrawn "only teaching site / only guard" wording is gone. |
| F-02 High — A6-06 read as shipping `enabled: true` | **Yes** | A6-06 now commits the literal `{"advisory": {"enabled": false, "waveBudgetPerRun": 1}}`, names it "**the shipped defaults, tier off**", and spells out the consequence of the alternative ("shipping `true` would flip the advisory tier **on** by default"). The "so an operator can tell … `enabled: true`" reasoning is deleted. |
| F-03 Medium — six stale `file:line` pins | **Mostly** | Five of the six are gone and the *Integration points in the shipped code* table now states the rule explicitly ("Locations are given as symbols and quoted assertions, not `file:line` pins (DEC-DOC-01)"). One raw pin survives — see F-04 below. |
| F-04 Medium — Overview contradicted itself on row-count surfaces | **Yes** | The enumeration is now headed **"Pre-drift state, and how it reads at HEAD"** and closes with "**At HEAD all four already read `toHaveLength(6)` and no `toHaveLength(5)` survives anywhere in the advisory suites**". Re-measured: `grep -rn "toHaveLength(5)" pdlc/workflows/__tests__/advisory*` returns nothing. |
| F-05 Low — A6-04's `ci-arrangement.test.js` erratum | **Yes** | The row closes with "TSPEC §5.1's file map now names `pdlc/engine/__tests__/advisory-config-example.test.js`; its erratum landed in v1.10". |
| F-06 Low — merged-away ids used in task-id positions | **Yes** | Both now read "A6-05's former-A6-03 red step" and "A6-10's former-A6-09 red step". |
| F-07 Low Process — completeness gate supplies PLAN headings to a cross-review invocation | **No** (not this document's to fix) | Recurs this round; re-filed as F-05 for harvest routing. |

The routed work is done. What follows is the result of re-measuring the claims the round *added* — the whole-suite failure partition, the `documentOracles` dispositions and the second-channel file status — against a live run of the suite at HEAD.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
