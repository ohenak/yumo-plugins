# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/FSPEC-pdlc-decision-ledger.md` (v1.3)
**Date:** 2026-08-28
**Iteration:** 5 (delta confirmation, not a full re-review)

## Overview

Round v4 approved FSPEC v1.2 with two non-gating inherited findings: F-01 (Medium) — `maxBytes` `0`
had no stated outcome, unlike `maxEntries` `0`, leaving §7 O-8's bounds property without a boundary
on that axis — and F-02 (Low) — the Baseline's `Cited by` propagation row omitted FSPEC §7
Assumptions. This round confirms the erratum edit (`514dccd67`, FSPEC v1.3) against upstream at HEAD,
and re-measures the compression against REQ **v1.9** (`sha256:ce6b133f…`), which moved under the
document since v4's `UPSTREAM-STATE` pin (`sha256:d61cbb0d…`).

## Routed items — disposition

| Item | Where it landed | Confirmed |
|---|---|---|
| v4 F-01 (Medium) — `maxBytes` `0` outcome unstated | FSPEC v1.3: E-7 broadened to **either** bound (`:331`), AT-14 broadened to three cases (`:473`–`:479`), changelog entry `:19`–`:24` | Resolved |
| v4 F-02 (Low) — Baseline propagation row omits FSPEC §7 Assumptions | Absorbed upstream in `4f03479e1`: `docs/_constraints/pdlc-decision-corpus-baseline.md:6` now reads `…§7 O-5, §7 Assumptions A-1` | Resolved upstream |

Both routed items were verified on disk, not from the commit message. The dispatch reported F-02 as
absorbed at HEAD; that is confirmed — the Baseline row names the site, so a future `Version` bump
routes to A-1's `M-6b`/`M-6c`/`M-7b`/`M-7c` restatement (`:562`) rather than leaving it stale.

## Re-measurement against upstream at HEAD

REQ v1.9 is a pin erratum: §1 (`:90`) and §5 REQ-DECLEDGER-01 (`:202`) moved `v1.1` → `v1.2`, and the
v1.8 note's cascade pointer was corrected from §3.3 to "§3.1's defaults sentence and §7 A-1". No
measured value moved. Checked against that:

- FSPEC's Baseline pin (`:11`), §1 (`:59`) and §5 fixture instruction (`:347`) all read **v1.2** —
  the document no longer disagrees with its upstream, and the frozen-fixture AT can be cut at one
  `Verified at` commit.
- The two sites REQ v1.9 names as the real recitals are correct at HEAD: §3.1's defaults sentence
  reads `maxBytes` `12500` (`:127`), §7 A-1 reads `12500` from `M-7b`/`M-7c` (`:562`). No `8000`
  literal survives anywhere in the file (grepped).
- §3.3 keeps its Baseline citations (`M-4e`, `M-4a`, `M-4b`), so its entry on the propagation row is
  a real site and not the stale pointer REQ v1.9 retired.

