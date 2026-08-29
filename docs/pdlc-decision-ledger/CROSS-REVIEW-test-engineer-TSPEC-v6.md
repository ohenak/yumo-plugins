# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md (v0.5 erratum)
**Date:** 2026-08-28
**Iteration:** 6 (delta confirmation)
**Upstream at dispatch:** REQ v1.9 `sha256:ce6b133f…`, FSPEC v1.3 `sha256:2bd5c3ef…`, Baseline v1.2

## Overview

This is a **delta confirmation**, not a re-review. I approved this TSPEC at v0.4 (round 5). The
v0.5 erratum retires the 8,000-byte arithmetic, re-pins upstream to REQ v1.9 / FSPEC v1.3 /
Baseline v1.2, closes ERR-1 and ERR-2 as resolved upstream, and restates §7.3's 141-record fixture
as a deliberately over-sized basis rather than "what a real dispatch gathers".

I read `git diff c115fa77d..HEAD` on the TSPEC (five commits, 345 diff lines), re-read REQ G-1,
REQ C-5, REQ A-1/R-5, FSPEC §7's A-1 and Baseline v1.2's `M-6b`/`M-6c`/`M-7a`–`M-7d` at their
current bytes, and re-derived every arithmetic claim the delta introduces.

**Verdict in one line:** every routed item landed, and the arithmetic is correct — but the edit
moved the load-bearing measured margin from a place an oracle pinned to a place no oracle pins.
That is a delta-introduced testability regression against D-10's own stated standard, so this
confirmation is non-approving with one High finding, tagged `delta`/`local` so it earns a bounded
follow-up rather than a halt.

Arithmetic re-derived and confirmed correct:

| Claim | Check | Result |
|---|---|---|
| Line allowance `12500 − 1200` | REQ C-5 default 12,500; §4.3 framing budget ≤1,200 (D-5/DEC-DECLEDGER-07) | **11,300** ✓ |
| Project-level headroom | `11,300 − 6,305` | **4,995** ✓ |
| "about twenty-seven / nineteen lines" | `4,995 / 183` = 27.3; `4,995 / 261` = 19.1 | ✓ |
| `M-6b` worst case rendered whole | `10,859 + 1,200 = 12,059 ≤ 12,500`; 63 ≤ 70 | ✓, margin **441** ✓ |
| §7.3 feature-line survivor count | `maxEntries` 70 − 41 project = 29 cap, byte bound trims below | "roughly two dozen" ✓ |
| Framing implied by `M-7b` | `10,859 − 9,296 = 1,563` over 63 records ≈ 24.8 B/record, inside `M-7c`'s 50 | ✓ |
| Header pins | REQ file HEAD = v1.9, FSPEC HEAD = v1.3, Baseline HEAD = v1.2 | ✓ |

## Architecture

Nothing structural moved, and I confirm that. The delta touches literals, arithmetic and rationale
prose only: the recognition rule (§3.1–§3.4), the two-function split (`renderDecisionLedgerBlock`
as sole byte producer, `selectDecisions` calling it — D-8), the omission order itself, the
attach-point (§2.5), and the fixture-copy discipline (§7.3) are byte-identical. No approved
decision is re-litigated and no new seam appears. The erratum note's "nothing else is touched"
claim is accurate against the diff.

One architectural *conclusion* did move, and it is the one that carries this review. §3.6 formerly
concluded "the order is **live** under shipped defaults"; it now concludes the order **does not
fire** at the Baseline commit on a G-1-scoped dispatch, with inertness explicitly labelled "a
measurement at one commit, not a property of the mechanism". That reconciliation with
`DEC-DECLEDGER-03` is exactly what was routed, and it is well argued — §3.6 keeps the order
specified and tested as load-bearing regardless, and names the three ways the measurement expires
(corpus growth, an operator lowering either threshold, a raised framing budget).

The consequence for testing is the finding in F-01: when a design's safety rests on a *measurement*
rather than a *property*, the measurement is the thing that needs the oracle. The old text put the
load-bearing measurement (project-level 6,305 against a 6,800-byte allowance, ~495 margin) in the
same place §7.3's conjunct (2) asserted it. The new text puts the load-bearing measurement (63
records at 12,059 against 12,500, 441 margin) somewhere §7.3 does not reach.

## Interfaces

_(pending)_

## Data Model

_(pending)_

## Test Strategy

_(pending)_

## Open Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_

## Delta-Confirmation Findings

_(pending)_

## Verdict

_(pending)_
