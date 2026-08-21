# Cross-Review: software-engineer — REQ (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md (v1.6)
**Date:** 2026-08-21
**Iteration:** 5 (delta confirmation, Phase F erratum round)

## Problem / Context

I approved this REQ at round v4 (anchor `sha256:1c05f511…`, commit `a2d89a1d`). A Phase F
erratum round has since landed seven commits against it (`aea4d92e` … `7660f1ed`), bumping the
document to v1.6 and touching four places: §1's replay-cost narrative, §7 REQ-WVR-02's IG-label
note, §7 REQ-WVR-08's no-commit clause, and §10's BL-04 record. Total delta: 26 insertions,
13 deletions in one file.

This round answers one question — does that delta resolve the eight routed items without breaking
what v4 approved — and, per DEC-ERR-03, whether the REQ is still a faithful compression of its
upstream *at that upstream's current version*. The REQ's upstream is not another document: it is
the shipped pipeline (`pdlc/workflows/orchestrate-dev.js` on the default branch) plus
`docs/_constraints/pdlc-wave-gate-baseline.md`. Both were re-read at their current state for this
round rather than trusted from v4.

One structural fact frames everything below: this branch is **1,637 commits behind the default
branch** and the mechanism under specification does not exist in the authoring tree at all. Every
code claim in this REQ is therefore a claim about `origin/main`, and I verified it there.

## Goals

This confirmation set out to establish three things, in this order:

1. **Landing.** Each of the eight routed items is present in the delta, in the section that owns
   it, and says what the item asked it to say.
2. **Correctness of what landed.** The delta replaced two disputed *numbers* (wave count, replay
   cost) and one disputed *claim* (BL-04's discharge). Numbers substituted for other numbers are
   only an improvement if the new ones are right, so each was re-derived from primary sources
   rather than read off OF-1 and checked for internal agreement.
3. **Non-regression against upstream at HEAD (DEC-ERR-03).** The delta adds new load-bearing
   citations — to `FSPEC §2`, `FSPEC §3.2` and `EC-20` — and asserts three fresh facts about the
   default branch. Each was checked against the cited text and the cited code as they stand today.

## Non-Goals

- Re-reviewing sections the erratum did not touch. §§2, 3, 6, 8 and the ACs other than REQ-WVR-02,
  -03 and -08 were approved at v4 and are not re-litigated here.
- Re-opening settled decisions. OQ-1's deletion-only hatch, REQ-WVR-05's retention-with-invalidation
  restatement, and the closed IG-1..6 / three-outcome catalogues are ratified and out of scope.
- Reviewing the FSPEC. FSPEC text is read here only as the upstream-at-HEAD referent for the REQ's
  new citations; findings about the FSPEC itself belong to the FSPEC's own review rounds.
- Product-lens and testing-lens judgements. Whether the replay-cost narrative is the right *story*
  is pm-review's call; whether OF-1 is oracle-shaped is te-review's.

## Constraints

## Acceptance Criteria

## Risks

## Obligations

## Delta-Confirmation Findings

## Verdict
