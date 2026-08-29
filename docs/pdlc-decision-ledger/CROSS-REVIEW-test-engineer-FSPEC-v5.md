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

