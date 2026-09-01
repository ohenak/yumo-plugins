# Cross-Review: test-engineer — PLAN (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/PLAN-pdlc-stats.md` (v1.4, `sha256:64d8f1c5…`)
**Date:** 2026-08-31
**Iteration:** 7 (delta confirmation, erratum round 5)

## Overview

Scope of this round: the targeted erratum edit `e6f18c5a1..HEAD` on `PLAN-pdlc-stats.md`
(7 insertions, 2 deletions) and whether it resolves the routed item without breaking anything
previously approved — plus the standing `DEC-ERR-03` obligation to re-measure every upstream
claim this PLAN leans on against upstream's **current** bytes, whether or not it appears in the
routed list.

One item was routed to this round:

- T-10's premise "HEAD's `bin/cli.mjs` contains neither `statSync` nor `lstatSync` anywhere" was
  false at HEAD (`lstatSync` at the `fileSize` call site, a bare `statSync` in the doc comment
  above it), so the whole-file zero-match assertion needed its falsifiability restated on the
  matcher's own anchors — or comment/string masking stated normatively.

**Resolved.** The row no longer rests on the expired baseline property. It records the token's two
present occurrences at HEAD, then grounds the zero-match result on the matcher's two anchors:
`(?<![A-Za-z])` rejects the `lstatSync` call site, `\s*\(` rejects the comment occurrence, which is
not a call. The raw `:262` line anchor — a `DEC-DOC-01` misuse in its own right, and off by five at
HEAD — is gone. See §Verification for the re-measurement.

A second edit landed alongside it, not from the routed list: the `Status` column is declared a
planning-time ledger, explicitly not maintained during implementation, with the branch's
`feat(pdlc-stats): T-NN` commits named as the authoritative record. I checked it for collateral
damage rather than re-litigating it — see §Dependencies.

Two findings, both non-gating: one Medium (inherited, nonlocal) and one Low (delta, local).
No open High, so the confirmation approves.
