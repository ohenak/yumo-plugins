# Cross-Review: software-engineer — REQ (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md (v1.16)
**Date:** 2026-08-20
**Iteration:** 6 (delta confirmation, erratum round)

## Problem / Context

I approved this REQ at v1.15. One erratum edit has landed since: commit `30d8bf7b`
(`REQ v1.16 — land DEC-A6-03 halt-message obligation`), 12 insertions / 2 deletions, touching exactly
two places — the version row plus a v1.16 changelog paragraph, and one appended clause on **AC-6.3**
under `REQ-AWG-06`.

The routed item, raised this round by SE, PM and TE alike, was DEC-A6-03's operator-facing
halt-message obligation: at halt an operator learns the pre-A6 capture's *name* and nothing about the
ordinary next action after a halt — re-running the feature — destroying it. The obligation had been
routed to REQ/FSPEC since round 5 and never landed; at v1.15 `a6-snapshot`, "copy the ref" and
"overwrit" matched nothing in the REQ.

At v1.16 AC-6.3 now reads, appended to its existing diagnosis clause: *"Where the halt report points
the operator at a captured pre-A6 tree state, it also warns, in the same place, that re-running this
feature overwrites that capture — so an operator who intends to inspect it preserves it first, rather
than losing it to the ordinary next action after a halt (DEC-A6-03)."*

That is the routed sentence, in the REQ, at requirements altitude, traced to US-02. The text landed.
This confirmation therefore turns on the two questions the item list does not settle: whether the
clause as worded actually binds on the halt DEC-A6-03 describes, and whether the REQ is still a
faithful compression of the upstream it now leans on (DEC-ERR-03).

## Goals

## Non-Goals

## Constraints

## Acceptance Criteria

## Risks

## Obligations

## Delta-Confirmation Findings

## Recommendation

## Verdict
