# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-stats/TSPEC-pdlc-stats.md (v1.7)
**Date:** 2026-08-31
**Iteration:** 9 (erratum round 7 — delta confirmation)
**Scope:** Delta confirmation only. Routed erratum items, plus DEC-ERR-03 re-grounding of TSPEC against upstream REQ/FSPEC at current HEAD.

## Overview

Two routed items, both naming the same defect in §2.1's `coverageInstrumentation.test.js` row: the row narrated P9-02's title move as *six → seven*, when HEAD already measures seven. Both land, and both land on the **measurement** rather than on the printed word — which is the distinction that made this defect worth an erratum in the first place.

I did not take the row's arithmetic on trust. Measured at HEAD:

| Claim in the delta | Verified at HEAD | Result |
|---|---|---|
| `REQUIRED_INCLUDES` holds **four** entries | `coverageInstrumentation.test.js:37-47` — two orchestrators, `build-runtime.mjs`, `scripts/check-wave-resume-delta-coverage.mjs` (the last carrying its `CODE_REVIEW v1 §1-1` comment) | ✅ |
| Shipped literal is `4 + 1 + 2` = **seven** | `pdlc/workflows/package.json` → `c8.include` has exactly 7 entries, in the order the spread produces | ✅ |
| Title still prints `six`, comment still says six-member / three-entry | `:264` title verbatim; `:260-262` comment verbatim | ✅ (both stale at HEAD, before this feature) |
| Feature moves the set **seven → eight**, printed `six` → `eight` | adding `lib/stats.mjs` to a 7-member `toEqual` literal | ✅ |
| Comment restated as four + one + **three** `lib/` modules | 4 + 1 + 3 = 8, consistent | ✅ |

The correction is right, and the *framing* is what I want to flag as well done: the row now says the title and comment "are already stale at HEAD and this feature moves them by one, not from the number they print." That sentence is what stops the next implementer re-deriving the wrong delta from a stale printed word.

The v1.3 changelog row (`TSPEC:113-114`) is neutralised in place rather than rewritten — the live number is removed from the row, and a parenthetical records that v1.3 wrote "six → seven", labels it wrong on HEAD's measurement, and points at the v1.7 correction. That is the right treatment for a superseded changelog row: the historical record survives, but no reader can mistake it for a live count. A `grep` for `six → seven` across the document returns only these two framed, explicitly-superseded mentions.

## Architecture

_pending_

## Interfaces

_pending_

## Data Model

_pending_

## Test Strategy

_pending_

## Positive Observations

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
