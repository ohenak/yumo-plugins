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

The upstream hunks in the window, and the FSPEC surface each one lands on. "Faithful?" is the
confirmation verdict for that pair.

| REQ hunk (v1.13 → v1.15) | What upstream now says | FSPEC surface that compresses it | Faithful? |
|---|---|---|---|
| Lineage header: `Upstream` → `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` … → **REQ** | Resolvable path to the tier REQ | FSPEC §1 header cites `REQ-pdlc-advisory-wave-gate.md` only; it never cites the tier REQ by path (it cites `docs/_constraints/pdlc-advisory-corpus-baseline.md` §1–§4 for inherited behaviour) | Yes — nothing to update. Path verified to exist. |
| Lineage header: `Cross-Reviews` scoped to harvested rounds vs post-harvest errata | Rounds through harvest live in LEARNINGS; branch `CROSS-REVIEW-*` files are post-harvest errata in no LEARNINGS table | FSPEC §1 header row reads `Cross-Reviews \| (active)` | Substantively yes; hygiene gap — F-04 |
| Status/Version: `draft` 1.13 → `approved (shipped)` 1.15 | REQ is shipped, two errata on | FSPEC §1 line 52 pins "`REQ-pdlc-advisory-wave-gate` v1.13"; FSPEC Status still `Draft` v1.6 | Pin is now stale — F-02 |
| AC-1.1 + R-5: post-change reading pinned at `11420461` | Replaces the HEAD-relative "HEAD already carries A6" | FSPEC §2 "Where 'before' is measured" (before `c8aa22a4`, post-change M-WG-13/M-WG-14 at `11420461`); AT-07-2 cites `R-5` | Yes — FSPEC said it first. Residual HEAD-relative phrasing — F-03 |
| AC-5.1: observation point, excluded carriers (AC-6.1 record, **AC-6.2 escalation log**, AC-5.2 queue row), ignored paths, failed-capture outcome | The full restoration contract | FSPEC BR-9 (domain + observation point), E-23 (queue-row write is later), E-34 (failed capture), AT-05-1, AT-05-2 | Yes on all four; one rationale clause diverges — F-01 |

**The excluded-carrier check, done explicitly**, because it is the one hunk with oracle consequences.
REQ v1.15 excludes three carriers by enumeration: AC-6.1's record append, AC-6.2's escalation-log
append, AC-5.2's queue-row write. FSPEC BR-9 excludes by **temporal cut** instead of enumeration —
the map is taken "immediately after restoration completes and before the record and escalation
writes BR-13 requires". A temporal cut at that instant is a superset of REQ's enumeration: all three
carriers are written after restoration completes, and FSPEC E-23 states the queue-row half of that
ordering explicitly ("the halt path still appends the record and escalation entries BR-13 requires
and still rewrites and commits the `halted` queue row (M-WG-7)"). So FSPEC's oracle admits nothing
REQ's enumeration excludes, and excludes nothing REQ's admits. AT-05-1 transcribes the same cut. No
finding.

**Traceability table unchanged.** FSPEC §1's FSPEC-AWG-01…07 → REQ-AWG-01…07 concordance still
resolves: no AC id was added, removed or renumbered in the window, so every `AC-x.y` FSPEC cites
still exists and still says what FSPEC says it says. AC-5.1 and AC-1.1 grew text; neither changed
its subject.

## Behavioral Flow

Confirmation scope: does any hunk in the window change the **order** in which A6's observables
become observable — which is what FSPEC §3 owns over REQ?

No. The window touched no branch condition, no trigger, no disposition. Specifically:

- **§3.1/§3.2 step sequence.** AC-1.2's single-trigger clause (script-owned gate non-zero, not
  dispatch-level, not post-wave-command) is untouched in the diff. FSPEC §3.2's step ordering rests
  on it and is unaffected.
- **Step 3b's capture check.** FSPEC §3.2 step 3b tests reversibility before dispatching. REQ v1.14
  added AC-5.1's failed-capture sentence — "Given the pre-A6 state cannot be captured at all, Then
  no repair is proposed, none is applied, and the wave halts on its own gate (AC-5.2) — a different
  outcome from a failed restoration." That is the same branch FSPEC already carries at step 3b and
  in E-34, including E-34's "distinct from E-28" framing. Upstream did not add a step; it stated in
  REQ the step FSPEC had already ordered. Faithful.
- **Step 9's terminal disposition vocabulary** (`resolved` / `escalated` / `no-action`) is untouched
  upstream. The §3.2 step-9 pointer my v2 F-06 closed still stands.
- **Restoration's position in the sequence** is the one ordering claim the window strengthened, and
  it strengthened it in FSPEC's direction: REQ now agrees that restoration completes *before* the
  record and escalation writes, which is exactly the ordering FSPEC §3.2 and BR-9 encode. Nothing
  downstream of the cut moved.

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
