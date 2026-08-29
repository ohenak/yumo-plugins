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

Upstream citation surfaces re-read at HEAD (DEC-ERR-03 obligation — the item list is necessary,
not sufficient):

| TSPEC site | What it now says | Upstream at HEAD | Faithful? |
|---|---|---|---|
| Header pins | REQ v1.9 / FSPEC v1.3 / Baseline v1.2 | REQ `Version 1.9`, FSPEC `Version 1.3`, Baseline `1.2 · 2026-08-28` | ✓ |
| §3.5, §7.3 Baseline pin | v1.2's `Verified at` `8c673a09f` | Baseline v1.2 `Verified HEAD 8c673a09f on feat-pdlc-decision-ledger` | ✓ |
| §3.6 / §7.3 "REQ G-1 scopes a real dispatch to the project set plus one feature" | over-sized-fixture framing | REQ G-1: "the project's closed decisions, plus those of the feature whose document is under review", unit is the decision not the file | ✓ — this is the se-author item, correctly landed |
| §4.1 type row + §9.2 ERR-1 | "agrees with REQ C-5, non-negative as of v1.8" | REQ C-5 rows: both thresholds `non-negative integer` | ✓ |
| §4.1 / §5.3 / §7.3 default literal | 12500 | REQ C-5 `maxBytes` default `12500` | ✓ |
| §3.6 "63-record worst standing case" | `M-6b` | Baseline `M-6b`: `41 + 22 = 63`, governing figure for directory-glob file scope | ✓ |
| §9.2 ERR-2 resolution derivation | "derived by id from Baseline v1.2's `M-7b`/`M-7c`" | `M-7b` 9,296 substance bytes / 63 records; `M-7c` 12,500 clears `M-7b` by 3,204 = 50 B/record framing allowance | ✓ — and TSPEC's own rendered 10,859 implies ≈24.8 B/record, inside the allowance |
| §9.4 A-1 restatement | "both thresholds now measured … at one commit rather than against a growth model (REQ R-5)" | REQ R-5 verbatim: "measured … but against one commit rather than a growth model (`M-6d`, `M-7d`)" | ✓ |
| §9.4 provenance | "Carried from FSPEC §7 (v1.2 corrected A-1 to REQ HEAD)" | FSPEC v1.2 erratum note records exactly that correction | ✓ |

Two citation surfaces do **not** survive the re-read cleanly, both minor and both recorded below
as F-03 and F-04: §9.4's unqualified "still operator-vetoable" against REQ A-1's and FSPEC A-1's
*windowed* vetoability, and ERR-2's retained pre-resolution paragraph still arguing in the present
tense from that same window.

I also checked the two upstream ids the delta newly leans on that were **not** on the routed list —
REQ R-5 and REQ AT (§5, "Given … the in-scope set is within C-5's bounds"). Both are consistent
with the new arithmetic: under 12,500 a G-1-scoped set is within bounds, so the REQ's happy-path
Given is satisfiable at the Baseline commit, which it arguably was not under the retired 8,000.
That is a genuine improvement the erratum earns and does not claim.

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
