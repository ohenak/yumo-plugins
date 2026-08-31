# Cross-Review: software-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.7, bytes unchanged)
**Upstream re-pinned:** `docs/pdlc-stats/REQ-pdlc-stats.md` (v1.7, sha256:f75c348f…)
**Date:** 2026-08-31
**Iteration:** 11 (upstream-cascade confirmation — FSPEC bytes unchanged, REQ moved)

## Overview

My v10 approved this FSPEC at bytes `sha256:c7d2c832…`, pinning REQ `sha256:5f3e8051…`
(commit `1847dd9c0`, REQ v1.6). That pin is stale: the erratum commit `e12b78fd8` (REQ v1.7)
edited the REQ after my approval was recorded. This confirmation answers one question — does the
FSPEC still hold against the REQ as it now stands — and does not re-review the FSPEC, whose own
bytes did not move.

The delta is small and single-purpose. `git diff 1847dd9c0..e12b78fd8 -- docs/pdlc-stats/REQ-pdlc-stats.md`
is **12 insertions / 3 deletions across two sites**: the header changelog gains a v1.7 erratum
paragraph, and REQ-STATS-06's closing paragraph replaces one clause. Nothing else in the REQ moved —
no acceptance criterion, constraint, non-goal or risk row outside REQ-STATS-06.

The one clause that moved is load-bearing for this FSPEC, and it moved **toward** it. Under the
pinned REQ v1.6, a grammatical-but-out-of-catalogue `CROSS-REVIEW-` basename "survives even though
REQ-STATS-03 reports it malformed" — a *survivor*, which keeps its family non-absent and so blocks
`harvested`. Under v1.7 that clause is withdrawn: such a basename "contributes no process bytes and
counts as no file of its family remaining", so a feature whose only `CROSS-REVIEW-` basenames are of
that shape reports **harvested**.

That reversal is the direction this FSPEC already specified. BR-16 and AT-17 have stated the
non-survivor reading since v1.4; the pinned REQ v1.6 contradicted them, and v1.7 removes the
contradiction by adopting the FSPEC's reading. So the cascade **closes** an upstream/downstream
divergence rather than opening one. I checked each FSPEC site that leans on the moved clause below,
and re-verified the repository claim BR-16 cites at HEAD rather than trusting my own v10 arithmetic,
because the survivor question is exactly what that arithmetic turned on.

## Linked Requirements

Only **REQ-STATS-06** changed. The FSPEC's §2 requirement-trace row for it reads
`REQ-STATS-06 | process-to-spec byte ratio | §3.1 step 8; §4.2 | BR-14, BR-15, BR-16 | AT-15, AT-16, AT-17`.
Every column still resolves after the erratum:

- The **§ anchors** are unmoved — REQ-STATS-06 is still one AC with the same title and the same
  *Given/When/Then* spine; only its closing paragraph's final clause changed.
- The **rule set** is still the right one. The moved clause is a statement about BR-16's predicate
  (which files count as remaining), not about BR-14's enumeration or BR-15's rendering, and BR-16 is
  cited here.
- The **test set** is unchanged and still sufficient: AT-17 is the test that exercises the moved
  clause, and it is already in the row.

No other requirement-trace row is implicated. I checked the REQ diff for edits reachable from other
rows and there are none: REQ-STATS-02, REQ-STATS-03, REQ-STATS-04, REQ-STATS-05 and REQ-STATS-07 are
byte-identical across `1847dd9c0..e12b78fd8`. In particular REQ-STATS-05's harvested halt state —
withdrawn in v1.6, `0` restored — was already inside my pinned bytes and is not part of this cascade.

The erratum note's own scope claim ("one clause decided, no rule added … No other change") is
falsifiable against the diff, and the diff bears it out: the REQ gains no new AC, no new constraint
id, and no new obligation for this FSPEC to compress.

## Behavioral Flow

§3.1 step A8 is the only flow step the moved clause can reach. It reads: *"Compute the process-to-spec
byte ratio (BR-14…BR-16). Is either process family entirely absent alongside a `LEARNINGS-{feature}.md`?
Is the spec total zero? → `harvested`, `n/a`, or a rendered ratio. Harvested is checked before the
zero-denominator test (BR-16)."*

This still holds, and it holds without an edit, because the step is written at the altitude of the
*question asked*, not of the file-classification that answers it. The erratum changes which files
count toward "entirely absent"; it does not change that the question is asked, its ordering relative
to the zero-denominator test, or the three outcomes. A flow step that had spelled out the survivor
rule inline would have needed a matching edit here — this one delegates to BR-16 by citation, so the
correction lands in exactly one place.

§3.4's read-only stance and the mode-rendering steps are untouched by the delta and I did not
re-read them.

## Business Rules

## Edge Cases and Error Scenarios

## Acceptance Tests

## Open Questions

## Delta-Confirmation Findings

## Findings

## Positive Observations

## Recommendation

## Verdict
