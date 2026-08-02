# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v2.9, 403 lines / 61,439 bytes)
**Date:** 2026-08-01
**Iteration:** 2 (delta re-review of v2.9 against the v2.8 I reviewed at v1; base commit `932860d~1`)
**Scope:** Technical lens only — feasibility, implementability, integration risk, threshold declaration, existing-code claim verification. Not product strategy, not test-pyramid choices, not fixture construction.

## Disposition of v1's findings

All seven are closed. I verified each against the changed text, not against the commit message.

| v1 | Severity | Status | Evidence in v2.9 |
|---|---|---|---|
| F-01 | High | **Closed** | AC-1.2 now excludes "every artifact `build-runtime.mjs` derives from that declaration" by name (`pdlc/workflows/dist/`, `.claude/workflows/`), quantifies *one* over **hand-maintained** executable declarations, and adds the fifth class *generated copy rebuilt by O-11* to the enumeration. §6's `MAX_REVIEW_ROUNDS` row and O-13(b) carry the same five classes, and O-13(b) now names both bundles explicitly. The count is decidable on the day the change ships. |
| F-02 | Medium | **Closed** | **NB-6** dispositions the zero-round *creating* halt's authored content as correct-and-known-accepted, states what the operator does get (AC-1.3's render with `rounds run 0`, plus the `HALT-REASON:` line), and routes a prompt change to N-4 as a new REQ. §2's cost claim is amended to match — "the **first** such halt still authors one, at the ordinary cost of a halt (NB-6)". |
| F-03 | Medium | **Closed** | AC-1.4 clause 3 now says the loop writes the section "on every halt in scope, creating halt and re-halt alike", overwriting whatever the agent emitted, **"Not the agent's"**, with the heading anchor and the not-found append disposition both declared. AC-1.3 and O-14 say the same. O-10 leg (i) is therefore falsifiable against production, and split §5.4 states the three fixtures. |
| F-04 | Medium | **Closed** | AC-1.3 names the per-reviewer verdict list as a fourth quantity and fixes it **empty** on a zero-round halt; AC-1.5(1) row C repeats it cell-by-cell; O-10's row-C leg and O-14 both receive it. |
| F-05 | Medium | **Closed as filed, re-raised as F-02 below** | The relocations happened and are real (§4.1's rows → baseline §3.2; O-10's fixtures and the pickup-order derivation → split §5.1/§5.4; §6's S-13/S-14 restatements collapsed), and this round's fixes did land. But the freed bytes were spent to the last one: 61,439 of 61,440. |
| F-06 | Low | **Closed** | §3.1 now names `precheckDependencies` and its `Order`-ordered candidate walk, cites split §5.1 as the home, and states why NB-4's `M-*` discipline does not reach a queue-driver claim. Split §5.1 line 87 carries the derivation. |
| F-07 | Low | **Closed** | §6 now reads "exactly **one** operator string **not already rendered by the catalogue**", with the parenthetical fixing S-4 as owned-but-not-minted, catalogue §2's render, unamendable here. |

## Findings

_(filled below)_

## Questions

_(filled below)_

## Positive Observations

_(filled below)_

## Recommendation

_(filled below)_

## Verdict

_(filled below)_
