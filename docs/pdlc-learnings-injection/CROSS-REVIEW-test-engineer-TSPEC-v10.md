# Cross-Review: test-engineer — TSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 10
**Round type:** upstream-cascade confirmation (TSPEC bytes unmoved; FSPEC moved v0.10 → v0.12)

## Overview

**Question answered:** is TSPEC — bytes unmoved since its v8 approval (`sha256:eff5a19b…`) — still
approved against FSPEC as it now stands at `sha256:fb18dbda…` (v0.12)?

**Answer: yes, with minor changes.** The cascade window is two erratum rounds, not one: my v9
confirmation was recorded against FSPEC v0.10 (`sha256:a4f775bd…`), and HEAD carries v0.11 and
v0.12 on top of it. Both rounds move in TSPEC's direction — v0.11 gives BR-1 the second conjunct
this TSPEC has been carrying (and routing as ERR-7) since v0.5, and v0.12 carries that complement
through BR-11, D-2, A-2, AT-02, AT-03 and AT-29, and restates BR-15's expected set as a set of
paths rather than a count of open attempts. No oracle in this TSPEC is falsified by either round.

What the round does leave is **staleness in the other direction**: TSPEC quotes upstream text that
upstream has now repaired, and its AT-02 transcription is now a strictly weaker fixture list than
the AT-02 it compresses. Those are this confirmation's findings (DEC-ERR-03), and none is High.

**State at HEAD, re-measured this round:**

| Artifact | sha256 | Versus v9 |
|---|---|---|
| TSPEC (under review) | `eff5a19b…` | identical — unmoved since the v8 `APPROVAL-HASH` |
| REQ (upstream) | `ff605dd3…` | unmoved; matches the dispatch's stated hash |
| FSPEC (upstream) | `fb18dbda…` | moved from `a4f775bd…`; matches the dispatch's stated hash |

Working tree on `feat-pdlc-learnings-injection`. The measured diff over the whole window
(`git diff 15d8f46e..HEAD -- FSPEC-…md`) is 80 changed lines, of which the behaviour-bearing edits
are: BR-1's two-conjunct restatement, BR-11's complement, D-2's three branches, AT-02's fourth
fixture, AT-03/AT-29's requantification, BR-15's set-vs-count clarification, A-2's rewording, the
Overview's one-conjunct restatement removed, and two header rows. No new BR, no new AT id, no new
E-row, no locus reassignment, no traceability row retired.

## Architecture

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Delta-Confirmation Findings

## Verdict
