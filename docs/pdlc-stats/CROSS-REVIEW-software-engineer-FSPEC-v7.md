# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.4)
**Upstream pinned:** `docs/pdlc-stats/REQ-pdlc-stats.md` v1.4 (sha256:60a516fb…, re-verified at HEAD)
**Date:** 2026-08-31
**Iteration:** 7 (targeted erratum delta confirmation)

## Overview

This is a targeted erratum delta confirmation carrying **one** routed item. The headline result is
unusual and needs stating plainly up front:

**No edit landed on this FSPEC, and none should have. The routed item is not an FSPEC item.**

The item reads: *"§2.1's co-change table lists only five in-repo sites; the two sibling-feature
document edits (`docs/completed/pdlc-engine-distribution/` TSPEC §5.4 `PK-26` and FSPEC §5.2's
per-class count 5 → 6) are missing, so the implementation-visible site list does not match
DEC-STATS-01's K-7."* Every noun in it is real, and every one of them lives somewhere other than
this document:

- **This FSPEC has no co-change table.** `§2.1` is *Acceptance criteria coverage* — a REQ-criterion →
  flow → rules → tests traceability matrix. `grep -in "co-change\|in-repo site\|sites"` over
  `FSPEC-pdlc-stats.md` returns **zero** hits. There is no five-row site list here to extend.
- **The table the item describes lives in `DECISIONS-pdlc-stats.md`**, under *Options Considered* →
  DEC-STATS-01 (`:129`). It is already at **nine** sweep-derived sites, not five, as of the round-3
  and round-4 DECISIONS edits (`e630dd867`, `17ddc28a0`, `a709b1be9`).
- **K-7 already owns exactly the two sibling-feature document edits the item asks for**
  (`DECISIONS-pdlc-stats.md:464`): TSPEC §5.4 gains `PK-26`, its vendored-members note moves five →
  six, and the sibling FSPEC §5.2's per-class count moves five → six, in the same change as
  `_tspec-packed-set.mjs`.

The likely cause of the mis-route is visible in the item's own text: it names **"FSPEC §5.2"**, and
that is `docs/completed/pdlc-engine-distribution/FSPEC-…md` — a *different feature's* completed
FSPEC, at `:583` and `:19`, currently reading "five vendored workflow members". The bare token
`FSPEC` appears to have been resolved to the feature under review rather than to the sibling
document K-7 names.

So the substance of the item is **already discharged**, one document over. Nothing is missing from
the pipeline; one routed slip is addressed to the wrong file. Asking this FSPEC to carry a vendoring
site table would in fact be an **altitude violation** — enumeration co-change sets are TSPEC and
DECISIONS material, not behavioural specification.

Per DEC-ERR-03 I did not stop at the item list. I re-verified the upstream REQ at its current
version and re-walked every FSPEC claim that leans on it. `REQ-pdlc-stats.md` hashes
`sha256:60a516fb…` at HEAD — **byte-identical** to the `UPSTREAM-STATE` anchor on my v6 approval, so
no upstream text has moved beneath this document. `git diff 7ca956d0e HEAD -- FSPEC-pdlc-stats.md`
is likewise **empty**: the document is byte-identical to the bytes I approved at v6, and
`REVIEWED-COMMIT: 6e7985d14` is still its tip.

That byte-identity has one consequence I must record rather than silently drop: the four findings I
left open at v6 are all still open, untouched. They are carried forward below tagged `inherited` so
they route back to the ordinary revision loop rather than vanishing because this round happened to
edit nothing. None is High. Nothing here gates the phase.

## Linked Requirements

_pending_

## Behavioral Flow

_pending_

## Business Rules

_pending_

## Edge Cases and Error Scenarios

_pending_

## Acceptance Tests

_pending_

## Open Questions

_pending_

## Delta-Confirmation Findings

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Verdict

_pending_
