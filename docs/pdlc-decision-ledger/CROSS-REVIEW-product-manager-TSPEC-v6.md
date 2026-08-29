# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md (v0.5)
**Date:** 2026-08-28
**Iteration:** 6 (delta confirmation of the v0.5 erratum)
**Scope:** Local

## Overview

This is a **delta confirmation**, not a re-review. I approved this TSPEC at v0.4; the v0.5 erratum
(commits `d619580a9`..`1235ef31d`) re-pins upstream and retires the arithmetic built on REQ C-5's
former `maxBytes` default of `8000`. I read the erratum recital, `git diff d619580a9^..HEAD` over the
TSPEC, and then re-read the upstream text this document now leans on at HEAD — REQ
(`sha256:ce6b133f…`, v1.9), FSPEC (`sha256:2bd5c3ef…`, v1.3) and
`docs/_constraints/pdlc-decision-corpus-baseline.md` v1.2 — rather than checking the routed items off
a list.

**Answer: yes, with one exception.** Every routed item landed, and the re-measurement is internally
consistent and faithful to REQ HEAD. One sentence in §3.6 (line 433) survived the sweep carrying the
retired default's conclusion, and it now contradicts two passages the same erratum wrote. That is a
Medium `delta`/`local` finding — the erratum's own scope statement names §3.6 as a section that moves.

Routed items, verified against the bytes at HEAD:

| Routed item | Landed |
|---|---|
| Header pins REQ HEAD / Baseline v1.2 | Yes — header now reads REQ v1.9, FSPEC v1.3, Baseline **v1.2**; §3.5 and §7.3's fixture pin follow to v1.2 |
| §9.2 ERR-1 / ERR-2 marked resolved in REQ v1.8 | Yes — both retitled `(RESOLVED upstream — REQ v1.8)`, ERR-2 gains a `Resolution.` paragraph naming `M-7b`/`M-7c` |
| §7.3 `8000` → resolved default | Yes — `maxBytes: 12500` in the shipped-defaults build; conjunct (2) reads `6,305 ≤ 11,300` |
| §3.6 `6,800` allowance / `~495` headroom | Yes — `12500 − 1200 = 11,300`, headroom **~4,995** |
| §4.3 framing pin turning on "~495 bytes headroom" | Yes — restated on ~4,995 **and** on the 441-byte margin, which is the tighter constraint |
| §3.6 / D-10 re-measured, live-vs-inert reconciled with `DEC-DECLEDGER-03` | Yes — 10,859 + 1,200 = 12,059 inside 12,500 with **441** bytes to spare; inertness stated as a measurement at one commit, not a property |
| §7.3's "141 in-scope … what a real dispatch gathers" vs REQ G-1 | Yes — the 141-record fixture is now stated as a deliberately over-sized basis, with G-1's ≤63 (`M-6b`) named as the real dispatch scope |
| §4.1 type row / §4.2 comment / §5.3 config recital | Yes — `default 12500`, non-negative typing stated as *agreeing with* C-5 rather than diverging, config recital `"maxBytes": 12500` |
| §7.6's AT-01 rationale (:1187 region) | Yes — rewritten: the 45/48 sets are producible at 12,500, and the reason for explicit bounds is now independence-from-the-bound plus the 441-byte margin |
| §3.6's "(§9.2, E-2)" prefix | Yes — reads `(§9.2, **ERR-2**)` |
| §9.4 A-1's retired "not measured" claim | Yes — both thresholds now measured, `maxBytes` 12,500 against `M-7b`/`M-7c`, at one commit rather than against a growth model (REQ R-5) |

No live occurrence of `8000` / `6,800` / `~495` survives; the remaining ones are past-tense recitals
in §9.2's ERR-2 history and the v0.5 erratum note, which is the correct place for them.

## Architecture

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
