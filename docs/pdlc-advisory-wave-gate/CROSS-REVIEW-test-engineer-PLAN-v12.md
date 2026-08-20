# Cross-Review: test-engineer — PLAN (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md
**Date:** 2026-08-20
**Iteration:** 12 (upstream-cascade confirmation; PLAN bytes unchanged since `b902f40b`)

## Overview

**Scope of this round.** PLAN's own bytes have not moved since `b902f40b`, the commit my v11
approval was recorded against. One upstream document moved: **DECISIONS**, in the Phase-P erratum
`8a44b84b` (*"v1.9 drop relocated integer, record round-9 erratum re-grounding"*), +20/-3. I re-read
my v11 review, read that diff, re-read the DECISIONS text this PLAN leans on at its current bytes,
re-measured every figure the two documents share at HEAD, and answer the single question: is PLAN
still a faithful compression of upstream as upstream now stands?

**Upstream hashes verified at dispatch.** `shasum -a 256` over the four upstream documents
reproduces the four dispatch hashes exactly: REQ `817b6745…`, FSPEC `82f74a2d…`, TSPEC `1531143c…`,
DECISIONS `84deee10…`. DECISIONS is the only one that moved since my v11 UPSTREAM-STATE line, which
recorded `25f8e954…`; REQ, FSPEC and TSPEC are byte-identical to the state I last approved against.

**What the erratum did.** Two current-state repairs in DECISIONS, no design change. (1) The v1.8
paragraph *"On v1.8, and the sizing block that used to live here"* quoted the relocated bullet by its
cardinality — *"the **twelve** already-migrated sites"* — and v1.9 drops the integer, naming the
bullet by subject instead (*"the already-migrated-sites bullet"*), so that DECISIONS carries no HEAD
measurement at all; it states that `SIZING-pdlc-advisory-wave-gate.md` *"remains the sole carrier of
that number."* (2) A new paragraph *"On v1.9 (Phase-P erratum round, TE v9 F-01)"* records the
round-9 re-grounding, the round-9 cross-reviews in the Cross-Reviews cell, and the routing of the
round's other two findings — PM v9 F-01 (**PLAN** should cite the appendix rather than restate
column (1)'s count) and PM v9 F-02 (a harvest item).

**Effect on PLAN: no design surface moved.** PLAN cites DECISIONS in exactly three substantive
places — the v1.6 changelog row (the relocation and the appendix citation), the Overview HEAD-drift
note's three-column paragraph (*"DECISIONS now keeps only column (1)'s four"*), and the four
`DEC-A6-01…DEC-A6-04` design citations inside A6-10, A6-18 and A6-21. I re-read each against
DECISIONS at HEAD:

| PLAN claim about DECISIONS | Holds at HEAD? |
|---|---|
| The three-column sizing block was relocated out of DECISIONS into the PLAN appendix (v1.6 row, Overview) | **Yes** — DECISIONS' v1.8 paragraph survives the erratum with its relocation account intact |
| *"DECISIONS now keeps only column (1)'s four"* | **Yes** — `## Consequences → What follows for the whole feature` still reads *"The number an implementer must not get wrong is **four**"* and *"this entry deliberately restates none of them"* |
| `DEC-A6-01` (dangling snapshot commit, never `git stash`), `DEC-A6-02` (promotion commit message form), `DEC-A6-03` (wave-scoped ref, no run discriminator) as cited in A6-10 / A6-21 | **Yes** — all four decision entries stood byte-frozen through this erratum (`git show 8a44b84b` touches only the header block and the two prose notes above `## Context`) |

The one place the delta reaches PLAN is not a contradiction but an **ownership** statement: DECISIONS
now says SIZING is the *sole* carrier of the already-migrated-sites number, and records PM v9 F-01
asking PLAN to cite rather than restate. PLAN's Overview still prints the twelve, the ten, the two,
the twenty-five and the four inline. Every one of those integers reproduces the appendix exactly
today (checked below), so nothing PLAN says is false — but PLAN is now a second carrier of figures
upstream has just declared single-carrier. That is **F-03**, Low, and it touches no task row.

## Batches

## Dependencies

## Verification

## Findings

## Questions

## Positive Observations

## Recommendation

