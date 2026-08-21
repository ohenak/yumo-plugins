# Cross-Review: software-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.6, bytes unchanged)
**Upstream re-measured:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.15, sha256:c62cfc35…0611bf7)
**Date:** 2026-08-20
**Iteration:** 3 (upstream-cascade confirmation, DEC-ERR-03)

## Overview

FSPEC's own bytes have not moved since my v2 approval (`REVIEWED-COMMIT: 9f80247a`). What moved is
REQ. My v2 recorded `UPSTREAM-STATE: REQ sha256:8963a0c0…` — that is REQ **v1.13** at `53fe0b73`.
REQ is now **v1.15** at `0cef7148`. So the cascade window is not one erratum round but two: v1.14
(`75e5e13c`, `524913ed`, `c58fd61d`) and v1.15 (`88c3554f`, `f3fbbc7b`, `0cef7148`). I measured the
whole window, `git diff 53fe0b73..HEAD` — 29 insertions, 9 deletions, four hunks — not just the last
round, because my approval was taken against v1.13 bytes and everything after it is unconfirmed.

The question I am answering is the narrow one: is FSPEC v1.6 still a faithful compression of REQ as
it now stands? Not "did the routed items land" — that is necessary, not sufficient (DEC-ERR-03).

**Answer: yes, and the window closed a gap rather than opening one.** Three of the four hunks are
REQ catching up to text FSPEC already carried. My v1 review on FSPEC asked for exactly two things
that REQ has now independently adopted:

- **AC-5.1's observation point and ignored-path domain.** FSPEC BR-9 has pinned both since v1.6
  (the fix for my v1 F-02). REQ v1.14/v1.15 now pins the same observation point and the same
  `.gitignore` exclusion, and v1.15 adds AC-6.2's escalation-log append to the excluded-carrier
  list. FSPEC BR-9's cut — "immediately after restoration completes and **before** the record and
  escalation writes BR-13 requires" — already excluded that carrier. REQ moved toward FSPEC.
- **The pre-A6 measurement base.** FSPEC §2's "Where 'before' is measured" paragraph has pinned
  `c8aa22a4` (before) and `11420461` (post-change) since v1.6. REQ v1.14 named `c8aa22a4` in
  AC-1.1/R-5, and v1.15 replaced AC-1.1's HEAD-relative "HEAD already carries A6" with the
  commit-pinned "the post-change reading, at `11420461`, carries A6" and gave R-5 the same pin.
  Character-identical to what FSPEC §2 already said.

I verified both anchors rather than accepting them: `bb4d36fb` and `11420461` are both ancestors of
this branch's HEAD, and `ADVISORY_SEAMS` at HEAD is the six-member frozen array
(`pdlc/workflows/orchestrate-dev.js:1952`), so the five-member "before" genuinely cannot be
re-measured at HEAD — which is precisely why FSPEC §2's base pin is load-bearing and why REQ
pinning it too is the right correction.

Nothing in the window reopens a decision, changes a branch condition, retires an AC FSPEC compresses,
or renames a literal FSPEC transcribes. The four findings below are a version pin, a rationale
clause narrower than the set it justifies, and two lineage-hygiene items. None is High; none gates.

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

## Recommendation

_pending_

## Verdict

_pending_
