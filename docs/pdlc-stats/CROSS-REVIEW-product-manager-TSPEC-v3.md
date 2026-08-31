# Cross-Review: product-manager — TSPEC (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/TSPEC-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 3 (upstream-cascade confirmation, not a re-review)
**Scope:** does the approved TSPEC still hold against FSPEC v1.4 and REQ v1.4 as they now stand?

## Overview

The TSPEC's own bytes have not moved since I approved it: `docs/pdlc-stats/TSPEC-pdlc-stats.md` is
byte-identical at `66c4049ac` (my v2 `REVIEWED-COMMIT`) and at HEAD. What moved is both upstream
documents. My v2 approval anchors recorded `UPSTREAM-STATE: REQ sha256:c4588c8b…` and
`UPSTREAM-STATE: FSPEC sha256:c142bfa8…`; I re-derived those two hashes from `66c4049ac` and they
match exactly, so the delta below is the whole of the upstream change and nothing is being read
against a guessed base.

Upstream now stands at REQ `sha256:60a516fb…` (v1.4) and FSPEC `sha256:0b8864d6…` (v1.4), the two
hashes this dispatch names. The diff is small and single-themed:

| Upstream edit | What it changed |
|---|---|
| REQ v1.4 | REQ-STATS-06's harvested predicate is now stated over C-4's documented basename grammars (`CROSS-REVIEW-{role}-{doc-type}[-v{N}].md`, `CODE_REVIEW-{feature}-v{N}.md`) rather than bare `CROSS-REVIEW-*` / `CODE_REVIEW-*` globs |
| FSPEC BR-11 | DoD harvested condition narrowed to "no `CODE_REVIEW-{feature}-v{N}.md` file matching the version grammar remains", with the leftover disposition (`-draft` suffix, foreign feature) spelled out |
| FSPEC BR-16 | Ratio harvested condition restated over BR-14's grammars and explicitly evaluated over "exactly the file set BR-14's numerator sums" |
| FSPEC BR-25 | Now names `docs/completed/QUEUE-HISTORY-rows-0-1.md` alongside `docs/completed/REQ-completed.md` as loose files that are not features |
| FSPEC AT-12 / AT-17 | Each gains a leg pinning the narrowed reading — AT-12 a third directory, AT-17 a fourth |
| FSPEC §7.3 | The three harvested-predicate errata are declared **closed**, not routed upstream any more |

The single question I have to answer is whether the TSPEC is still a faithful compression of that
text. On **behaviour**, the answer is an unqualified yes, and better than yes: every one of these
FSPEC edits moves the FSPEC onto the reading the TSPEC had already chosen and defended. Not one line
of §4.3's branch tables, §4.2.1's types, §4.4's discovery or §6's oracles needs to change.

On **what the TSPEC says about its upstream**, the answer is no in three places. §4.3 twice asserts
that the FSPEC says something the FSPEC no longer says, and §8.3 routes three errata that FSPEC §7.3
has now explicitly closed. Per DEC-ERR-03 these are findings of this confirmation whether or not
they appear on the dispatch's item list: they are citations of upstream text that no longer exists.
None of them narrows, broadens or reinterprets a product guarantee, so none is High.

## Delta-Confirmation Findings

_pending_

## Open Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Verdict

_pending_
