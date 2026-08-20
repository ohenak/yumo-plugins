# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-19
**Iteration:** 6

**Scope of this delta re-review.** The TSPEC is **byte-unchanged** since the state I approved at
v5: `git diff 16f30820..HEAD -- TSPEC` is empty, and the file hashes to
`sha256:72712bd8…`, exactly the `APPROVAL-HASH` recorded in
`CROSS-REVIEW-product-manager-TSPEC-v5.md`. There is no delta to scan for new issues.

What *did* move is the upstream this document is grounded on. My v5 `UPSTREAM-STATE` recorded
FSPEC `sha256:57b71e0c…`; FSPEC is now `sha256:256537d8…` (v0.9, `cbb0a63e`, plus the v0.8
re-grounding `a6b42bae`). REQ is unchanged at `sha256:ff605dd3…` (v0.9). Under the frozen-round
bar this round is therefore judged on criterion (ii) alone — **factual contradiction with an
upstream document at HEAD, on a load-bearing claim**. Two such contradictions are live, both
`inherited` and `nonlocal` by construction (there was no edit to make anything `delta` or `local`).

Both are already named as obligations by documents downstream of this one: `D-O-9` in
`DECISIONS-pdlc-learnings-injection.md:664` and `SE-O-1` in
`CROSS-REVIEW-software-engineer-REQ-v11.md:133`. Neither has landed. I am not opening a new
decision here — I am recording that the decisions already taken upstream are not yet reflected
in this document, and that PROPERTIES and PLAN authors read *this* document.
